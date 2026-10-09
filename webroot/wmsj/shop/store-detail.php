<?php
/**
 * 店铺管理
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/touch/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$dbname = "waimai_shop";
$templates = "store-detail.html";

if($id ==''){
    $sids = explode(',',$managerIds);
    if($sids[0] != '' && is_array($sids)){

        $id = $sids[0];
    }
}
if(!empty($action)){
  if(empty($id)){
    echo '{"state": 200, "info": "未指定id！"}';
    exit();
  }
  if(!checkWaimaiShopManager($id)){
    echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
    exit();
  }
}

if(empty($id)){
  header("location:/wmsj/index.php?to=shop");
  die;
}

// 读取当前店铺营业状态和下单状态
$sql = $dsql->SetQuery("SELECT `ordervalid`, `status`, `shopname`,`shop_banner` FROM `#@__$dbname` WHERE `id` = $id AND `del` = 0 AND `id` in ($managerIds)");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $data = $ret[0];
    $huoniaoTag->assign('shopname', $data['shopname']);
    $huoniaoTag->assign('shop_banner', getFilePath(explode(",", $ret[0]['shop_banner'])[0]));
    $huoniaoTag->assign('status', $data['status']);
    $huoniaoTag->assign('ordervalid', $data['ordervalid']);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('storecount', count(explode(',',$managerIds)));
    $sql            = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__waimai_common` WHERE `sid` = " . $id);
    $res            = $dsql->dsqlOper($sql, "results");
    $rating         = $res[0]['r'];        //总评分

    //本月收入
    $firstday = strtotime(date('Y-m-01', time()));
    $lastday = strtotime(date('Y-m-d 23:59:59', time()));

    $totalAmount = 0;
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount,count(`id`) countnum FROM `#@__waimai_order_all` WHERE `state` = 1 AND `sid` =   $id AND `okdate` >= $firstday AND `okdate` <= $lastday");
    $ret = $dsql->dsqlOper($sql, "results");

    $totalAmount = empty($ret[0]['amount']) ? 0 : $ret[0]['amount'];

    // 总退款金额
    $totalRefundAmount = 0;
    $sql = $dsql->SetQuery("SELECT `amount`, `refrundamount` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `sid` =   $id AND `okdate` >= $firstday AND `okdate` <= $lastday AND `refrundstate` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            if($val['refrundamount'] == 0){
                $totalRefundAmount += $val['amount'];
            }else{
                $totalRefundAmount += $val['refrundamount'];
            }
        }
    }

    $totalAmount -= $totalRefundAmount;

    $huoniaoTag->assign('byamount', $totalAmount);
    $huoniaoTag->assign('countnum', $ret[0]['countnum']);
    $huoniaoTag->assign('star', number_format($rating, 1));
}else{
  header("location:/wmsj/index.php?to=shop");
  die;
}

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;
$huoniaoTag->assign('custom_otherpeisong', $custom_otherpeisong);
//验证模板文件
if(file_exists($tpl."/".$templates)){


    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/touch/");  //模块路径
    $huoniaoTag->display($templates);

}else{
    echo $templates."模板文件未找到！";
}
