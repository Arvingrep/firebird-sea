<?php
/**
 * 管理二手订单
 *
 * @version        $Id: infoOrderList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoOrderList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoOrderList.html";

$action = "info_order";

if($dopost == "getList"){
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = "";


    if ($adminCity){
        $sid = [];
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE 1 = 1" . getWrongCityFilter('`cityid`', $adminCity));
        $city_shop = $dsql->dsqlOper($sql, "results");
        if($city_shop){
            foreach ($city_shop as $shopid){
                $sid[] = $shopid['id'];
            }
        }
        if(!count($sid)){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
        }else{
            $where .= " AND `prod` in (". join(',', $sid) . ')';
        }

    }

    if($sKeyword != ""){

        $where .= " AND (`ordernum` like '%$sKeyword%'";

        $proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__infolist` WHERE `title` like '%$sKeyword%'");
        $proResult = $dsql->dsqlOper($proSql, "results");
        if($proResult){
            $proid = array();
            foreach($proResult as $key => $pro){
                array_push($proid, $pro['id']);
            }
            if(!empty($proid)){
                $where .= " OR `prod` in (".join(",", $proid).")";
            }
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if($userResult){
            $userid = array();
            foreach($userResult as $key => $user){
                array_push($userid, $user['id']);
            }
            if(!empty($userid)) {
                $where .= " OR `userid` in (" . join(",", $userid) . "))";
            }
        }else{
            $where .= " ) ";
        }

    }
    if($start != ""){
        $where .= " AND `orderdate` >= ". GetMkTime($start." 00:00:00");
    }

    if($end != ""){
        $where .= " AND `orderdate` <= ". GetMkTime($end." 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount/$pagestep);
    //未付款
    $state0 = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount");
    //未使用
    $state1 = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount");
    //已过期
    $state2 = $dsql->dsqlOper($archives." AND `orderstate` = 2", "totalCount");
    //已发货
    $state3 = $dsql->dsqlOper($archives." AND `orderstate` = 3 AND `ret-state` = 0", "totalCount");
    //交易成功
    $state4 = $dsql->dsqlOper($archives." AND `orderstate` = 4", "totalCount");
    //退款中
    $state6 = $dsql->dsqlOper($archives." AND `orderstate` = 3 AND `ret-state` = 1", "totalCount");
    //交易关闭
    $state7 = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount");

    if($state != ""){
        if($state != "" && $state != 5 && $state != 6){
            $where = " AND `orderstate` = " . $state;
        }

        //退款
        if($state == 6){
            $where = " AND `orderstate` = 3 AND `ret-state` = 1";
        }

        if($state == 0){
            $totalPage = ceil($state0/$pagestep);
        }elseif($state == 1){
            $totalPage = ceil($state1/$pagestep);
        }elseif($state == 2){
            $totalPage = ceil($state2/$pagestep);
        }elseif($state == 3){
            $totalPage = ceil($state3/$pagestep);
        }elseif($state == 4){
            $totalPage = ceil($state4/$pagestep);
        }elseif($state == 6){
            $totalPage = ceil($state6/$pagestep);
        }elseif($state == 7){
            $totalPage = ceil($state7/$pagestep);
        }
    }

    $where .= " order by `id` desc";
    $totalPrice = 0;

    //计算总价
    // $sql = $dsql->SetQuery("SELECT SUM(`payprice`) as price FROM `#@__".$action."` WHERE 1 = 1".$where);
    // $ret = $dsql->dsqlOper($sql, "results");
    // if($ret){
    //     $totalPrice = (float)$ret[0]['price'];
    // }
    //
    // $totalPrice = sprintf("%.2f", $totalPrice);

    $atpage = $pagestep*($page-1);
    $where .= " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `store`, `userid`, `prod`, `price`, `orderstate`, `ret-state`, `exp-date`, `contact`, `orderdate`, `paytype` FROM `#@__".$action."` WHERE 1 = 1".$where);
    $results = $dsql->dsqlOper($archives, "results");

    $list = array();

    if(count($results) > 0){
        foreach ($results as $key=>$value) {
            $list[$key]["id"] = $value["id"];
            $list[$key]["ordernum"] = $value["ordernum"];
            $list[$key]["userid"] = $value["userid"];

            //用户名
            $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["userid"]);
            $username = $dsql->dsqlOper($userSql, "results");
            if(count($username) > 0){
                $list[$key]["username"] = $username[0]['username'];
            }else{
                $list[$key]["username"] = "未知";
            }

            $list[$key]["proid"] = $value["prod"];

            //商品
            $proSql = $dsql->SetQuery("SELECT `id`, `title`, `price`, `yunfei` FROM `#@__infolist` WHERE `id` = ". $value["prod"]);
            $proname = $dsql->dsqlOper($proSql, "results");
            if(count($proname) > 0){
                $list[$key]["proname"] = $proname[0]['title'];
            }else{
                $list[$key]["proname"] = "未知";
            }

            $param = array(
                "service"     => "info",
                "template"    => "detail",
                "id"          => $proname[0]['id']
            );
            $list[$key]['prourl'] = getUrlPath($param);

            //价格
            $list[$key]["orderprice"] = sprintf("%.2f", $proname[0]['price'] + $proname[0]['yunfei']);


            $list[$key]["orderstate"] = $value["orderstate"];
            $list[$key]["retState"] = $value["ret-state"];
            $list[$key]["expDate"] = $value["exp-date"];
            $list[$key]["usercontact"] = $value["contact"];
            $list[$key]["orderdate"] = date('Y-m-d H:i:s', $value["orderdate"]);

            //主表信息
            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$value["paytype"]."'");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!empty($ret)){
                $list[$key]["paytype"] = $ret[0]['pay_name'];
            }else{
                $list[$key]["paytype"] = $value["paytype"];
            }
        }

        if(count($list) > 0){
            echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.'}, "totalPrice": '.$totalPrice.', "tuanOrderList": '.json_encode($list).'}';
        }else{
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.'}, "totalPrice": '.$totalPrice.'}';
        }

    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state6": '.$state6.', "state7": '.$state7.'}, "totalPrice": '.$totalPrice.'}';
    }
    die;

//删除
}elseif($dopost == "del"){
    if(!testPurview("infoOrderDel")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if($id == "") die;
    $each = explode(",", $id);
    $error = array();
    foreach($each as $val){
        $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`, `prod`, `price`, `orderstate` FROM `#@__".$action."` WHERE `id` = ".$val);
        $results = $dsql->dsqlOper($archives, "results");

        $orderid = $results[0]['id'];
        $ordernum = $results[0]['ordernum'];
        $orderprice = $results[0]['price'];
        $userid = $results[0]["userid"];
        $proid = $results[0]["prod"];
        $orderstate = $results[0]["orderstate"];

        //退款
        if($orderstate != 0 && $orderstate != 4 && $orderstate != 7){

            //会员信息
            $userSql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ". $userid);
            $userResult = $dsql->dsqlOper($userSql, "results");

            if($userResult){

                //会员帐户充值
                $price = $userResult[0]['money'] + $orderprice;
                $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
                $dsql->dsqlOper($userOpera, "update");

                $pay_name = '';
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "info",
                    "id"       => $orderid
                );
                $urlParam = serialize($paramUser);

                $tuikuan  = array(
                    'paytype'               => '余额',
                    'truemoneysy'           => 0,
                    'money_amount'          => $price,
                    'point'                 => 0,
                    'refrunddate'           => 0,
                    'refrundno'             => 0
                );
                global  $userLogin;
                $tuikuanparam = serialize($tuikuan);
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                //记录退款日志
                $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$orderprice', '二手退款：$ordernum', ".GetMkTime(time()).",'info','tuikuan','$urlParam','$ordernum','$tuikuanparam','二手信息消费','$usermoney')");
                $dsql->dsqlOper($logs, "update");

            }


        }

        $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
        $results = $dsql->dsqlOper($archives, "update");
        if($results != "ok"){
            $error[] = $val;
        }
    }
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';
    }else{
        adminLog("删除二手订单", $id);
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    }
    die;

//撤销申请退款
}elseif($dopost == "revoke"){
    if(!testPurview("infoOrderEdit")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if($id == "") die;

    $sql = $dsql->SetQuery("SELECT `exp-date` FROM `#@__info_order` WHERE `id` = " . $id);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        if($ret[0]['exp-date'] == 0){
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 1, `ret-state` = 0 WHERE `id` = " . $id);
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `ret-state` = 0 WHERE `id` = " . $id);
        }
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret != 'ok'){
            echo '{"state": 200, "info": '.json_encode($ret).'}';
        }else{
            adminLog("撤销分类信息订单退款申请", $id);
            echo '{"state": 100, "info": '.json_encode("撤销成功！").'}';
        }
        die;
    }else{
        die('{"state": 200, "info": '.json_encode('订单不存在或已删除').'}');
    }


//付款
}elseif($dopost == "payment"){
    if(!testPurview("refundInfoOrder")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if(!empty($id)){
        $archives = $dsql->SetQuery("SELECT `ordernum`, `userid`, `prod`, `price`, `orderstate` FROM `#@__".$action."` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");

        if($results){
            $ordernum = $results[0]['ordernum'];
            $orderprice = $results[0]['price'];
            $userid = $results[0]["userid"];
            $proid = $results[0]["prod"];
            $orderstate = $results[0]["orderstate"];

            if($orderstate == 0){

                $proSql = $dsql->SetQuery("SELECT l.`title`, l.`valid`, l.`userid` FROM `#@__infolist` l WHERE l.`id` = ". $proid);
                $proname = $dsql->dsqlOper($proSql, "results");

                if(!$proname){
                    echo '{"state": 200, "info": '.json_encode("商品不存在，付款失败！").'}';
                    die;
                }

                $title     = $proname[0]['title'];
                $uid       = $proname[0]['userid']; //商家会员 或 信息发布者
                $enddate   = $proname[0]['valid'];


                if(GetMkTime(time()) > $enddate){
                    echo '{"state": 200, "info": '.json_encode("此商品已经过期，无法付款，请确认后操作！").'}';
                    die;
                }else{

                    //会员信息
                    $userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
                    $userResult = $dsql->dsqlOper($userSql, "results");

                    if($userResult){

                        if($userResult[0]['money'] > $orderprice){
                            //扣除会员帐户
                            $price = $userResult[0]['money'] - $orderprice;
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
                            $dsql->dsqlOper($userOpera, "update");

                            //记录消费日志
                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                            $ret = $dsql->dsqlOper($sql, "results");
                            $pid = '';
                            if($ret){
                                $pid            = $ret[0]['id'];
                            }
                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "info",
                                "id"       => $id
                            );
                            global  $userLogin;
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];

                            $title_ = "二手消费";
                            $urlParam = serialize($paramUser);
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES (".$userid.", ".$orderprice.", 0, '二手消费-".$title."：".$ordernum."', ".GetMkTime(time()).",'info','xiaofei','$pid','$urlParam','$title_','$ordernum','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                            //更新订单状态
                            $orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `balance`='$orderprice', `orderstate` = 1, `paydate` = ".GetMkTime(time())." WHERE `id` = ". $id);
                            $dsql->dsqlOper($orderOpera, "update");

                            //更新物品状态
                            $orderOpera = $dsql->SetQuery("UPDATE `#@__infolist` SET `is_valid` = 1 WHERE `id` = ". $proid);
                            $dsql->dsqlOper($orderOpera, "update");


                            //支付成功，会员消息通知
                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "info",
                                "id"       => $id
                            );

                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "orderdetail",
                                "action"   => "info",
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
                                "amount" => $amount,
                                "fields" => array(
                                    'keyword1' => '订单编号',
                                    'keyword2' => '商品名称',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '付款状态',
                                    'keyword5' => '付款时间'
                                )
                            );

                            updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);


                            adminLog("为会员手动支付二手订单", $ordernum);

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

    if(!testPurview("refundInfoOrder")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    }
    if(!empty($id)){

        $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`store`, o.`point`, o.`balance`, o.`payprice`, o.`userid`, o.`prod`, o.`price`, o.`orderstate`,o.`paytype`,o.`refrundno`,
 l.`title` , l.`yunfei` FROM `#@__".$action."` o LEFT JOIN `#@__infolist` l ON l.`id` = o.`prod` WHERE o.`id` = ".$id);

        $results = $dsql->dsqlOper($archives, "results");
        global $cfg_pointRatio;
        if($results){

            $ordernum   = $results[0]['ordernum'];
            $balance    = $results[0]['balance'];
            $payprice   = $results[0]['payprice'];
            $userid     = $results[0]["userid"]; //购买的会员
            $proid      = $results[0]["prod"];
            $orderstate = $results[0]["orderstate"];
            $point      = $results[0]["point"];
            $title      = $results[0]["title"];
            $store      = $results[0]["store"];
            $paytype    = $results[0]["paytype"];
            $refrundno  = $results[0]["refrundno"];

            $shopSql = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `id` = ". $store);
            $shopResult = $dsql->dsqlOper($shopSql, "results");
            if($shopResult){
                $uid      = $shopResult[0]["uid"]; //商家会员
            }else{
                $uid      = $userid;
            }
            $orderTotalAmount = $balance + $payprice;

            if($orderstate == 1 || $orderstate == 2 || $orderstate == 6){

                //会员信息
                $userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if($userResult){
                    $peerpay = 0;
                    $arr = adminRefund('info',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);    //后台退款
                    $r =$arr[0]['r'];
                    $refrunddate = $arr[0]['refrunddate'];
                    $refrundno   = $arr[0]['refrundno'];
                    $refrundcode = $arr[0]['refrundcode'];
                    if($r) {
                        //退回积分 by: guozi 20160425

                        if($point!= '0'){
                            global $userLogin;
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$point);
//                        保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`balance`) VALUES ('$userid', '1', '$point', '二手订单退回(积分退款:$point,现金退款：$payprice,余额退款：$balance)：$ordernum', ".GetMkTime(time()).",'$userpoint')");
                            $dsql->dsqlOper($archives, "update");

                            $refrunddate = GetMkTime(time());
                        }



                        //会员帐户充值
                        $pay_name = '';
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "info",
                            "id"       => $id
                        );
                        $pay_namearr = array();
                        $urlParam = serialize($paramUser);

                        $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(!empty($ret)){
                            $pay_name    = $ret[0]['pay_name'];
                        }else{
                            $pay_name    = $ret[0]["paytype"];
                        }

                        if($pay_name){
                            array_push($pay_namearr,$pay_name);
                        }

                        if($balance != ''){
                            array_push($pay_namearr,"余额");
                        }

                        if($point != ''){
                           array_push($pay_namearr,"积分");
                        }

                        if($pay_namearr){
                          $pay_name = join(',',$pay_namearr);
                        }

                        $tuikuan  = array(
                            'paytype'               => $pay_name,
                            'truemoneysy'           => $payprice,
                            'money_amount'          => $balance,
                            'point'                 => $point,
                            'refrunddate'           => $refrunddate,
                            'refrundno'             => $refrundno
                        );
                        $tuikuanparam = serialize($tuikuan);
                        if($balance !='0'){
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$balance." WHERE `id` = ". $userid);
                            $dsql->dsqlOper($userOpera, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
//                            $money =  sprintf('%.2f',($usermoney + $balance));
                            //记录退款日志
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (".$userid.", ".$balance.", 1, '二手订单退款(积分退款:$point,现金退款：$payprice,余额退款：$balance)：".$ordernum."', ".GetMkTime(time()).",'info','tuikuan','$urlParam','$ordernum','$tuikuanparam','二手信息消费','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                            $refrunddate = GetMkTime(time());
                        }
                        //更新订单状态
                        $orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `orderstate` = 7, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = ".GetMkTime(time()).",`refrunddate` = '".$refrunddate."',`refrundamount` = '$orderTotalAmount', `refrundno` = '$refrundno' WHERE `id` = ". $id);
                        $dsql->dsqlOper($orderOpera, "update");

                        $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $orderTotalAmount WHERE `id` = ".$userid);
                        $dsql->dsqlOper($usersql,"update");

                        $orderOpera = $dsql->SetQuery("UPDATE `#@__infolist` SET `is_valid` = 0 WHERE `id` = ". $proid);
                        $dsql->dsqlOper($orderOpera, "update");

                        //退款成功，会员消息通知
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "info",
                            "id"       => $id
                        );

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "info",
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

                        updateMemberNotice($userid, "会员-订单退款成功", $param, $config,'','',0,1);


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

                        updateMemberNotice($uid, "会员-订单退款通知", $param, $config,'','',0,1);


                        adminLog("为会员手动退款二手订单", $ordernum);

                        echo '{"state": 100, "info": '.json_encode("操作成功，款项已退还至会员帐户！").'}';
                        die;
                    }else{
                        echo '{"state": 200, "info": '.json_encode("退款失败，错误码：".$refrundcode).'}';
                        die;
                    }

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
        'admin/info/infoOrderList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
