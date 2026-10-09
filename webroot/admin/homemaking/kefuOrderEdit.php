<?php
/**
 * 查看修改家政订单信息
 *
 * @version        $Id: homemakingOrderEdit.php 2019-4-16 上午10:53:46 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingOrderList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "kefuOrderEdit.html";

$action     = "homemaking_refund";
$pagetitle  = "查看客服订单";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != ""){
    //对字符进行处理
    $useraddr   = cn_substrR($useraddr,50);
    $username   = cn_substrR($username,10);
}

if($dopost == "edit"){

    $pagetitle = "修改客服订单信息";

    if($submit == "提交"){

        $archives = $dsql->SetQuery("SELECT `orderid` FROM `#@__homemaking_refund` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            $orderid = $results[0]['orderid'];
        }else{
            die;
        }

        if ($status == 1){//平台客服同意退款
//
//
//            $archives = $dsql->SetQuery("SELECT r.`id`, r.`retnote`, r.`rettype`, r.`name`, r.`title`, r.`price`, r.`mobile`,o.`refundnumber` FROM `#@__".$action."` r LEFT JOIN `#@__homemaking_order` o ON o.`id` = r.`orderid`  WHERE  r.`id`=".$id);

            $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`point`, o.`id`,o.`balance`, o.`payprice`, o.`userid`, o.`proid`, o.`procount`, o.`orderprice`,  o.`orderstate`, s.`userid` as uid, l.`title` FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` LEFT JOIN `#@__homemaking_refund` r  ON  o.`id`= r.`orderid`  WHERE r.`id` = ".$id);
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
                            $user = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
                            $pointuser  = (int)($userpoint+$point);
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '家政客服订单退回：$ordernum', ".GetMkTime(time()).",'tuihui','$pointuser')");
                            $dsql->dsqlOper($archives, "update");
                        }

                        $pay_name = '';
                        $pay_namearr = array();
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $results[0]["id"]
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
                        global  $userLogin;
                        if($orderprice > 0){
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$orderprice." WHERE `id` = ". $userid);
                            $dsql->dsqlOper($userOpera, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
                            $money  = sprintf('%.2f',($usermoney + $orderprice));
                            //记录退款日志
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (".$userid.", ".$orderprice.", 1, '家政客服订单退款：".$ordernum."', ".GetMkTime(time()).",'homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$money')");
                            $dsql->dsqlOper($logs, "update");
                        }

                        //更新家政已购买数量
                        $proSql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` - $procount where `id` = " . $proid);
                        $dsql->dsqlOper($proSql, "update");
                        //更新订单状态
                        $orderOpera = $dsql->SetQuery("UPDATE `#@__homemaking_order` o LEFT JOIN `#@__homemaking_refund` r  ON  o.`id`= r.`orderid`  SET o.`orderstate` = 9, o.`refundstatus` = 9,o.`ret-state` = 0, o.`ret-type` = '其他', o.`ret-note` = '客服平台提交', o.`ret-ok-date` = ".GetMkTime(time())." , o.`status` = '".$status."' , r.`status` = '".$status."', r.`rettype` = '其他', r.`retnote` = '客服平台提交', r.`type`= 2 , r.`retokdate` = ".GetMkTime(time())."  WHERE r.`id` = ". $id." AND r.`service` = 1 ");
                        $dsql->dsqlOper($orderOpera, "update");

                        //退款成功，会员消息通知
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $results[0]["id"]
                        );

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $results[0]["id"]
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
                            "info" => "客服平台手动退款",
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

        }
        if ($status == 2){      // 平台客服拒绝退款
            $now = GetMkTime(time());
            // $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` o LEFT JOIN `#@__homemaking_refund` r  ON  o.`id`= r.`orderid` SET o.`status` = '".$status."', r.`status` = '$status', o.`ret-state` = 0,o.`orderstate`= 1,o.`ret-ok-date` = '$now',r.`type` = 2   WHERE r.`id` = ".$orderid);
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET  `ret-state` = 0, `orderstate`= 1, `ret-ok-date` = '$now' WHERE `id` = ".$orderid);
            $results = $dsql->dsqlOper($archives, "update");

        }

        if($results != "ok"){
            echo '{"state": 200, "info": "保存失败！"}';
            exit();
        }

        adminLog("修改客服订单信息", $id);

        echo '{"state": 100, "info": "修改成功！"}';
        exit();

    }else{
        if(!empty($id)){

            //主表信息
            //主表信息
            $archives = $dsql->SetQuery("SELECT r.*, r.`pics` rpics, o.* FROM `#@__".$action."` r  LEFT JOIN   `#@__homemaking_order` o ON r.`orderid` = o.`id`  WHERE r.`id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");
            if(!empty($results)){

                $orderid = $results[0]["orderid"];
                $ordernum = $results[0]["ordernum"];
                $people   = $results[0]["username"];
                $userid   = $results[0]["userid"];
                $doortime   = $results[0]["doortime"];
                $failnote   = $results[0]["failnote"];
                $onlinepay   = $results[0]["onlinepay"];
                $refundnumber  = $results[0]["refundnumber"];
                //用户名
                $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $results[0]["userid"]);
                $username = $dsql->dsqlOper($userSql, "results");
                if(count($username) > 0){
                    $username = $username[0]['username'];
                }else{
                    $username = "未知";
                }

                $proid = $results[0]["proid"];

                //家政商品
                $proSql = $dsql->SetQuery("SELECT `title`, `homemakingtype` FROM `#@__homemaking_list` WHERE `id` = ". $results[0]["proid"]);
                $proResult = $dsql->dsqlOper($proSql, "results");
                if(count($proResult) > 0){
                    $proname = $proResult[0]['title'];
                }else{
                    $proname = "未知";
                }

                $param = array(
                    "service"     => "homemakingtype",
                    "template"    => "detail",
                    "id"          => $proid
                );
                $prourl = getUrlPath($param);

                $homemakingtype = $proResult[0]['homemakingtype'];
                $procount = $results[0]["procount"];

                $orderprice = $results[0]['orderprice'];
                $point      = $results[0]['point'];
                $balance    = $results[0]['balance'];
                $payprice   = $results[0]['payprice'];

                //总价
                $totalAmount += $orderprice * $procount;
                $freeshiMoney = 0;
                $freeshiMoney = 0;

                $expCompany = $results[0]['exp-company'];
                $expNumber  = $results[0]['exp-number'];
                $expDate    = $results[0]['exp-date'];

                $orderstate = $results[0]["orderstate"];

                $expDate    = $results[0]['exp-date'];
                $retState   = $results[0]['ret-state'];

                $retOkdate  = $results[0]['ret-ok-date'];
                $refundnumber  = $results[0]['refundnumber'];
                $retokdate  = $results[0]['retokdate'];
                $mobile   = $results[0]['mobile'];

                $retType   = $results[0]['ret-type'];
                $retNote   = $results[0]['ret-note'];
                $status   = $results[0]['status'];
                $imglist = array();
                $pics = $results[0]['rpics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val'] = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }
                $retPics   = $imglist;

                $retDate   = $results[0]['ret-date'];
                $retSnote  = $results[0]['ret-s-note'];

                $imglist = array();
                $pics = $results[0]['ret-s-pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val'] = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }
                $retSpics  = $imglist;

                $retSdate  = $results[0]['ret-s-date'];



                $ordermobile = $results[0]["ordermobile"];

                //家政券
                if($homemakingtype == 1){
                    $cardSql = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__homemakingquan` WHERE `orderid` = ". $results[0]["id"]);
                    $cardResult = $dsql->dsqlOper($cardSql, "results", "NUM");
                    foreach($cardResult as $key => $val){
                        $cardnum[$key][0] = $cardResult[$key][0];

                        if($cardResult[$key][1] != 0){
                            $cardnum[$key][1] = "<span class='text-info'>已使用</span>";
                        }else{
                            if(date('Y-m-d', time()) > date('Y-m-d', $cardResult[$key][2]) && $cardResult[$key][2] != 0){
                                if($cardResult[$key]['usedate'] == 0){
                                    $cardnum[$key][1] = "<span class='text-error'>未使用 已过期</span>";
                                }else{
                                    $cardnum[$key][1] = "<span class='text-error'>已过期</span>";
                                }
                            }else{
                                $cardnum[$key][1] = "未使用";
                            }
                        }

                        if($cardResult[$key][2] == 0){
                            $cardnum[$key][2] = "无期限";
                        }else{
                            //$cardnum[$key][2] = date('Y-m-d', $cardResult[$key][2]);
                            $cardnum[$key][2] = $cardResult[$key][2];
                        }
                    }

                    //充值卡
                }
                $orderdate = date('Y-m-d H:i:s', $results[0]["orderdate"]);
                $paytype = $results[0]["paytype"];
                $paydate = date('Y-m-d H:i:s', $results[0]["paydate"]);
                $deliveryType = $results[0]["deliveryType"];
                $useraddr = $results[0]["useraddr"];
                $usercontact = $results[0]["usercontact"];
                $usernote = $results[0]["usernote"];


            }else{
                ShowMsg('要修改的信息不存在或已删除！', "-1");
                die;
            }

        }else{
            ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
            die;
        }
    }
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'ui/jquery.dragsort-0.5.1.min.js',
        'admin/homemaking/kefuOrderEdit.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('ordernum', $ordernum);
    $huoniaoTag->assign('userid', $userid);
    $huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('status', $status);
    $huoniaoTag->assign('people', $people);
    $huoniaoTag->assign('proid', $proid);
    $huoniaoTag->assign('proname', $proname);
    $huoniaoTag->assign('prourl', $prourl);
    $huoniaoTag->assign('tuantype', $tuantype);
    $huoniaoTag->assign('procount', $procount);
    $huoniaoTag->assign('point', $point);
    $huoniaoTag->assign('balance', $balance);
    $huoniaoTag->assign('payprice', $payprice);
    $huoniaoTag->assign('mobile', $mobile);

    $huoniaoTag->assign('orderprice', $orderprice);
    $huoniaoTag->assign('totalAmount', $totalAmount);
    $huoniaoTag->assign('freeshiMoney', $freeshiMoney);
    $huoniaoTag->assign('expCompany', $expCompany);
    $huoniaoTag->assign('expNumber', $expNumber);
    $huoniaoTag->assign('expDate', $expDate == 0 ? 0 : date("Y-m-d H:i:s", $expDate));
    $huoniaoTag->assign('orderstate', $orderstate);
    $huoniaoTag->assign('retState', $retState);
    $huoniaoTag->assign('ordermobile', $ordermobile);
    $huoniaoTag->assign('cardnum', $cardnum);
    $huoniaoTag->assign('orderdate', $orderdate);
    $huoniaoTag->assign('homemakingtype', $homemakingtype);
    $huoniaoTag->assign('doortime', $doortime);
    $huoniaoTag->assign('retOkdate', $retOkdate == 0 ? 0 : date("Y-m-d H:i:s", $retOkdate));
    $huoniaoTag->assign('retokdate', $retokdate == 0 ? 0 : date("Y-m-d H:i:s", $retokdate));
    $huoniaoTag->assign('refundnumber', $refundnumber);
    $huoniaoTag->assign('retType', $retType);
    $huoniaoTag->assign('failnote', $failnote);
    $huoniaoTag->assign('retNote', $retNote);
    $huoniaoTag->assign('retPics', $retPics);
    $huoniaoTag->assign('retDate', $retDate == 0 ? 0 : date("Y-m-d H:i:s", $retDate));
    $huoniaoTag->assign('retSnote', $retSnote);
    $huoniaoTag->assign('retSpics', $retSpics);
    $huoniaoTag->assign('retSdate', $retSdate == 0 ? 0 : date("Y-m-d H:i:s", $retSdate));
    $huoniaoTag->assign('onlinepay', $onlinepay);


    //主表信息
    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!empty($ret)){
        $huoniaoTag->assign('paytype', $ret[0]['pay_name']);
    }else{

        global $cfg_pointName;
        $payname = "";
        if($paytype == "point,money"){
            $payname = $cfg_pointName."+余额";
        }elseif($paytype == "point"){
            $payname = $cfg_pointName;
        }elseif($paytype == "money"){
            $payname = "余额";
        }else{
            $payname = $paytype;
        }
        $huoniaoTag->assign('paytype', $payname);
    }

    $huoniaoTag->assign('paydate', $paydate);
    $huoniaoTag->assign('useraddr', $useraddr);
    $huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('usercontact', $usercontact);

    $huoniaoTag->assign('deliveryTypeList', array(1 => '只工作日送货', 2 => '只双休日、假日送货', 3 => '学校地址/地址白天没人', 4 => '工作日、双休日与假日均可送货'));
    $huoniaoTag->assign('deliveryType', $deliveryType);

    $huoniaoTag->assign('usernote', $usernote);


    
    $historysql = $dsql ->SetQuery("SELECT r.`id`,r.`retnote`,r.`rettype`,r.`retokdate`,r.`pics`,r.`title`,r.`type`,r.`price`,r.`status`,r.`service`,o.`ret-type`,o.`ret-note`,r.`pics`,o.`orderstate`,o.`refundnumber`,o.`userid`,s.`userid` store FROM `#@__homemaking_refund`r LEFT JOIN `#@__homemaking_order` o  ON r.`orderid` = o.`id` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE r.`orderid` = $orderid ORDER BY r.`id` DESC");
    $historyres = $dsql ->dsqlOper($historysql,'results');
    foreach($historyres as $k => $v){
        $historyres[$k]['rettype'] =$v['ret-type'];
        $pic = '/static/images/noPhoto_60.jpg';

        //用户
        if($v['type'] == 1){
            $userinfo = $userLogin->getMemberInfo($v['userid']);
            if($userinfo && is_array($userinfo)){
                $pic = $userinfo['photo'];
                $nickname = $userinfo['nickname'];
            }
        //平台
        }elseif($v['type'] == 2){
            $nickname = '平台客服';
        //商家
        }else{
            $userinfo = $userLogin->getMemberInfo($v['store']);
            if($userinfo && is_array($userinfo)){
                $pic = $userinfo['photo'];
                $nickname = $userinfo['nickname'];
            }
        }

        $historyres[$k]['nickname'] = $nickname;
        $historyres[$k]['litpic'] = getFilePath($pic);
    }
    $huoniaoTag->assign('historyres', $historyres);

    
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
