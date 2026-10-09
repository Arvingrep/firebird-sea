<?php
/**
 * 管理客服订单
 *
 * @version        $Id: homemakingOrderList.php 2019-4-16 下午21:11:13 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("kefuOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "kefuOrder.html";

$action = "homemaking_refund";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";

    $where2 = getCityFilter('store.`cityid`');
    if ($adminCity){
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }
    if ($sKeyword){
            $where .=" AND `title` like '%$sKeyword%'";
    }
    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id  FROM `#@__homemaking_store` store WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if(!empty($sidArr)){
        $where3 = " AND `company` in (".join(",",$sidArr).")";
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
    }
    $where .= ' AND  `service` = 1';
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_refund` WHERE 1 = 1".$where);
    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT r.`id`, r.`retnote`, r.`rettype`, r.`name`, r.`title`, r.`price`, r.`mobile`,o.`refundnumber`,o.`ordernum` FROM `#@__".$action."` r LEFT JOIN `#@__homemaking_order` o ON o.`id` = r.`orderid`  WHERE 1 = 1 AND o.`orderstate` = 8 ".$where);
    $results = $dsql->dsqlOper($archives, "results");
    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["retnote"] = $value["retnote"];
            $list[$key]["rettype"] = $value["rettype"];
            $list[$key]["name"] = $value["name"];
            $list[$key]["title"] = $value["title"];
            $list[$key]["price"] = $value["price"];
            $list[$key]["mobile"] = $value["mobile"];
            $list[$key]["ordernum"] = $value["ordernum"];
        }


        if (count($list) > 0) {
            echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "kefuOrder": ' . json_encode($list) . '}';
            die;
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}}';
        }

    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ' }}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if(!testPurview("kefuOrder")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach($each as $val){
        $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_refund` WHERE  `id` = ".$val);
        $results = $dsql->dsqlOper($archives, "update");
    }
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';
    }else{
        adminLog("删除客服订单", $id);
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }
    die;

//付款
}elseif($dopost == "payment"){
    if(!testPurview("refundHomemakingOrder")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if(!empty($id)){
        $archives = $dsql->SetQuery("SELECT `ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderstate` FROM `#@__".$action."` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");

        if($results){
            $ordernum = $results[0]['ordernum'];
            $orderprice = $results[0]['orderprice'];
            $userid = $results[0]["userid"];
            $proid = $results[0]["proid"];
            $procount = $results[0]["procount"];
            $orderstate = $results[0]["orderstate"];

            if($orderstate == 0){
                //家政商品
                $proSql = $dsql->SetQuery("SELECT l.`title`, l.`sale`, l.`homemakingtype`,s.`title` storename s.`userid` as uid FROM `#@__homemaking_list` l LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE l.`id` = ". $proid);
                $proname = $dsql->dsqlOper($proSql, "results");

                if(!$proname){
                    echo '{"state": 200, "info": '.json_encode("商品不存在，付款失败！").'}';
                    die;
                }

                $title     = $proname[0]['title'];
                $storename = $proname[0]['storename'];
                $uid       = $proname[0]['uid'];
                $sale      = $proname[0]['sale'];
                $homemakingtype     = $proname[0]['homemakingtype'];
                $totalBuy  = $sale + $procount;

                //会员信息
                $userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if($userResult){

                    if($userResult[0]['money'] > $orderprice){
                        //扣除会员帐户
                        $price = $userResult[0]['money'] - $orderprice;
                        $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
                        $dsql->dsqlOper($userOpera, "update");
                        $pid='';
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $pid 			= $ret[0]['id'];
                        }

                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $id
                        );
                        global  $userLogin;
                        $urlParam = serialize($paramUser);
                        $user  = $userLogin->getMemberInfo($userid);
                        $usermoney = $user['money'];
                        $money  = sprintf('%.2f',($usermoney - $orderprice));

                        $title_ = '家政消费-'.$storename;
                        //记录消费日志
                        $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES (".$userid.", ".$orderprice.", 0, '家政-".$title."消费：".$ordernum."', ".GetMkTime(time()).",'homemaking','xiaofei','$title_','$ordernum','$money')");
                        $dsql->dsqlOper($logs, "update");

                        //更新家政已购买数量
                        $proSql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` + $procount WHERE `id` = ".$proid);
                        $dsql->dsqlOper($proSql, "update");

                        //更新订单状态
                        $orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `orderstate` = 1, `paydate` = ".GetMkTime(time())." WHERE `id` = ". $id);
                        $dsql->dsqlOper($orderOpera, "update");


                        //生成家政券
                        if($proname[0]['homemakingtype'] == 1){
                            $sqlQuan = array();
                            $carddate = GetMkTime(time());
                            for ($i = 0; $i < $procount; $i++) {
                                $cardnum = genSecret(12, 1);
                                $sqlQuan[$i] = "('$id', '$cardnum', '$carddate', 0, '$expireddate')";
                            }

                            $sql = $dsql->SetQuery("INSERT INTO `#@__homemakingquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES ".join(",", $sqlQuan));
                            $dsql->dsqlOper($sql, "update");
                        }


                        //支付成功，会员消息通知

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $id
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userResult[0]['username'],
                            "order" => $ordernum,
                            "amount" => $orderprice,
                            "fields" => array(
                                'keyword1' => '商品信息',
                                'keyword2' => '订单金额',
                                'keyword3' => '订单状态'
                            )
                        );

                        updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config,'','',0,1);


                        //获取会员名
                        $username = "";
                        $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $username = $ret[0]['username'];
                        }

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "title" => $title,
                            "order" => $ordernum,
                            "amount" => $orderprice,
                            "fields" => array(
                                'keyword1' => '订单编号',
                                'keyword2' => '商品名称',
                                'keyword3' => '订单金额',
                                'keyword4' => '付款状态',
                                'keyword5' => '付款时间'
                            )
                        );

                        updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);

                        adminLog("为会员手动支付家政订单", $ordernum);

                        echo '{"state": 100, "info": '.json_encode("付款成功！").'}';
                        die;

                    }else{
                        echo '{"state": 200, "info": '.json_encode("会员帐户余额不足，请先进行充值！").'}';
                        die;
                    }

                }else{
                    echo '{"state": 200, "info": '.json_encode("会员不存在，无法继续支付！").'}';
                    die;
                }

            }else{
                echo '{"state": 200, "info": '.json_encode("此订单不是未付款状态，请确认后操作！").'}';
                die;
            }
        }else{
            echo '{"state": 200, "info": '.json_encode("订单不存在，请刷新页面！").'}';
            die;
        }

    }else{
        echo '{"state": 200, "info": '.json_encode("订单ID为空，操作失败！").'}';
        die;
    }

//退款
}elseif($dopost == "refund"){
    global  $userLogin;
    if(!testPurview("refundHomemakingOrder")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if(!empty($id)){
        $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`point`,  o.`balance`, o.`payprice`, o.`userid`, o.`proid`, o.`procount`, o.`orderprice`,  o.`orderstate`, s.`userid` as uid, l.`title` FROM `#@__".$action."` o LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE o.`id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");

        if($results){

            $ordernum   = $results[0]['ordernum'];
            $orderprice = $results[0]['balance'] + $results[0]['payprice'];
            $userid     = $results[0]["userid"];
            $proid      = $results[0]["proid"];
            $procount   = $results[0]["procount"];
            $orderstate = $results[0]["orderstate"];
            $uid        = $results[0]["uid"];
            $point      = $results[0]["point"];
            $title      = $results[0]["title"];

            if($orderstate == 1 || $orderstate == 2 || $orderstate == 4 || $orderstate == 5 || $orderstate == 8){

                //会员信息
                $userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if($userResult){

                    //退回积分 by: guozi 20160425
                    if(!empty($point)){
                        global  $userLogin;
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $userinfo = $userLogin->getMemberInfo($userid);
                        $userpoint = $userinfo['point'];
                        $pointuser  = (int)($userpoint+$point);
                        //保存操作日志
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '家政订单退回：$ordernum', ".GetMkTime(time()).",'tuihui','$pointuser')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    $pay_name = '';
                    $pay_namearr = array();
                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "homemaking",
                        "id"       => $id
                    );
                    $urlParam = serialize($paramUser);

                    if($balance != ''){
                        array_push($pay_namearr,'余额');
                    }

                    if($point != ''){
                        array_push($pay_namearr,'积分');
                    }

                    if($pay_namearr){
                        $pay_name = join(',',$pay_namearr);
                    }

                    $tuikuan  = array(
                        'paytype' 				=> $pay_name,
                        'truemoneysy'			=> 0,
                        'money_amount'  		=> $orderprice,
                        'point'					=> $point,
                        'refrunddate'			=> 0,
                        'refrundno'				=> 0
                    );
                    $tuikuanparam = serialize($tuikuan);
                    //会员帐户充值
                    if($orderprice > 0){
                        $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$orderprice." WHERE `id` = ". $userid);
                        $dsql->dsqlOper($userOpera, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $usermoney = $user['money'];
//                        $money  = sprintf('%.2f',($usermoney + $orderprice));

                        //记录退款日志
                        $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (".$userid.", ".$orderprice.", 1, '家政订单退款：".$ordernum."', ".GetMkTime(time()).",'homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$usermoney')");
                        $dsql->dsqlOper($logs, "update");
                    }

                    //更新家政已购买数量
                    $proSql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` - $procount where `id` = " . $proid);
                    $dsql->dsqlOper($proSql, "update");

                    //更新订单状态
                    $orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `orderstate` = 9, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = ".GetMkTime(time())." WHERE `id` = ". $id);
                    $dsql->dsqlOper($orderOpera, "update");


                    //退款成功，会员消息通知
                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "homemaking",
                        "id"       => $id
                    );

                    $paramBusi = array(
                        "service"  => "member",
                        "template" => "orderdetail",
                        "action"   => "homemaking",
                        "id"       => $id
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userResult[0]['username'],
                        "order" => $ordernum,
                        "amount" => $orderprice,
                        "fields" => array(
                            'keyword1' => '退款状态',
                            'keyword2' => '退款金额',
                            'keyword3' => '审核说明'
                        )
                    );

                    updateMemberNotice($userid, "会员-订单退款成功", $paramUser, $config,'','',0,1);


                    //获取会员名
                    $username = "";
                    $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $username = $ret[0]['username'];
                    }

                    //自定义配置
                    $config = array(
                        "username" => $username,
                        "order" => $ordernum,
                        "amount" => $orderprice,
                        "info" => "管理员手动退款",
                        "fields" => array(
                            'keyword1' => '退款原因',
                            'keyword2' => '退款金额'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

                    adminLog("为会员手动退款家政订单", $ordernum);

                    echo '{"state": 100, "info": '.json_encode("操作成功，款项已退还至会员帐户！").'}';
                    die;

                }else{
                    echo '{"state": 200, "info": '.json_encode("会员不存在，无法继续退款！").'}';
                    die;
                }

            }else{
                echo '{"state": 200, "info": '.json_encode("订单当前状态不支持手动退款！").'}';
                die;
            }
        }else{
            echo '{"state": 200, "info": '.json_encode("订单不存在，请刷新页面！").'}';
            die;
        }

    }else{
        echo '{"state": 200, "info": '.json_encode("订单ID为空，操作失败！").'}';
        die;
    }
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/homemaking/kefuOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
