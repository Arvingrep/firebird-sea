<?php if (!defined('HUONIAOINC')) exit('Request Error!');
/**
 *  一、拍卖结束自动处理（时间到了，自动操作）
 *
 * 1. 找出所有拍卖结束，但未处理的拍卖
 * 2. 如果获拍了，通知拍卖成功的用户及时付款
 * 3. 未成功用户，退还保证金
 * 4. 通知商家
 *
 * 二、查询已终止，过期未付款的订单
 *
 * 三、自动收货
 */

// 1.找出所有时间已终止，但商品状态不是结束的商品列表ID
$time = GetMkTime(time());
$sql = $dsql->SetQuery("select `id`,`maxnum`,`min_money` from `#@__paimailist` where `enddate`<=$time and `arcrank`=1");
$ret = $dsql->getArrList($sql);

// 引入 paimai.class.php

$paimai_class = HUONIAOROOT."/api/handlers/paimai.class.php";

if(file_exists($paimai_class)){
    require_once($paimai_class);
}

// 创建 paimai.class 类

$paimai = new paimai();  // 实例化paimai类

$paimai->stopPaiMai($ret);

// 2.找出所有拍卖已终止，且未交易成功的订单（把用户保证金分发至商家，并抽取佣金），更新拍卖为交易失败
global $cfg_paimaiFee;  // 商家结算佣金
global $cfg_fzpaimaiFee; // 分站管理员佣金
$sql = $dsql->SetQuery("select l.`id`,s.`shopFee`,s.`uid`,s.`cityid` from `#@__paimailist` l LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` where (`enddate`+`pay_limit`*3600)<=$time and `arcrank`=3");
$ret = $dsql->getArrList($sql);
foreach ($ret as $k=>$v){
    // 取得中标用户的订单，取出其金额数
    $sql2 = $dsql->SetQuery("select o.amount,o.ordernum from `#@__paimai_order` o where o.`orderstate`=1 and o.proid={$v['id']}");
    $ret2 = $dsql->getArrList($sql2);
    foreach ($ret2 as $key => $value){
        $amount = $value['amount'];  // 保证金总金额
        if($amount<=0){  // 保证金为0，则无需以下操作
            continue;
        }
        // 计算佣金
        $shopFee = $v['shopFee'];
        $fee = empty($shopFee) ? $cfg_paimaiFee : $shopFee; // 如果未单独设置商家佣金，则取模块设置数
        $shopMoney = sprintf('%.2f',($amount * (100-$fee)/100)); // 商家应得总金额
        $fxMoney = $amount-$shopMoney;  // 提取的佣金总额（包含分站和总站）

        // 把商家应得的钱加给商家，并且添加记录
        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$shopMoney' WHERE `id` = '{$v['uid']}'");
        $dsql->dsqlOper($archives, "update");

        $sql = $dsql->SetQuery("select money from `#@__member` where id={$v['uid']}");
        $umoney = (float)$dsql->getOne($sql);  // 新的余额
        $urlParam = array(
            "service"  => "paimai",
            "template" => "detail",
            "id"       => $v['id']
        );
        $ser_urlParam = serialize($urlParam);
        $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`balance`) VALUES ('{$v['uid']}', '1', '$shopMoney', '商品拍卖保证金收入{$value['ordernum']}', '$time','paimai','shangpinxiaoshou','$ser_urlParam','{$value['ordernum']}','$umoney')");
        $up = $dsql->dsqlOper($sql,"update");
        // 校验总佣金，计算平台佣金与总站佣金
        if($fxMoney==0){
            continue;
        }
        $fzMoney = sprintf('%.2f',($fxMoney * (100-$cfg_fzpaimaiFee)/100)); // 平台金额
        $ptMoney = $fxMoney - $fzMoney;  // 总站金额
        // 增加分站余额
        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fzMoney' WHERE `cid` = '{$v['cityid']}'");
        $dsql->dsqlOper($fzarchives, "update");
        //保存操作日志平台
        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$v['uid']}', '1', '$amount', '拍卖保证金收入：{$value['ordernum']}', '$time','{$v['cityid']}','$fzMoney','paimai',$ptMoney,'1','shangpinxiaoshou','{$value['ordernum']}')");
        $lastid = $dsql->dsqlOper($archives, "lastid");
        substationAmount($lastid,$v['cityid']);
    }
    // 更新拍卖状态为交易失败
    $sql = $dsql->SetQuery("update `#@__paimailist` set arcrank=5 where id={$v['id']}");
    $up = $dsql->update($sql);
}

// 三、后自动收货（自动收货时间，在模块config里配置）
$conf_file = HUONIAOINC."/config/paimai.inc.php";
if(file_exists($conf_file)){
    require($conf_file);
    $exp_time = (int)$customConfirmDay * 24 * 3600;
}
if(empty($exp_time)){  // 再次校验时间
    $exp_time = 7 * 24 * 3600;
}
$day = $time - $exp_time;
$sql = $dsql->SetQuery("update `#@__paimai_order` set orderstate=4 where orderstate = 3 and `exp-date`<$day");
$up = $dsql->update($sql);






