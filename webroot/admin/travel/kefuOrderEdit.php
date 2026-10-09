<?php
/**
 * 查看修改旅游订单信息
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingOrderList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "kefuOrderEdit.html";

$action     = "travel_order";
$pagetitle  = "查看客服订单";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != ""){
    //对字符进行处理
    $useraddr   = cn_substrR($useraddr,50);
    $username   = cn_substrR($username,10);
}

if($dopost == "edit") {
    global $userLogin;

    $pagetitle = "修改客服订单信息";

    if ($submit == "提交") {

        if ($orderstate == 9) {//平台客服同意退款
            //获取用户ID

            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`point`, o.`proid`, o.`type`, o.`balance`, o.`payprice`, o.`orderprice`, o.`procount`, o.`userid` FROM `#@__travel_order` o LEFT JOIN `#@__travel_store` s ON o.`store` = s.`id` WHERE o.`id` = '$id'  AND o.`orderstate` = 10 AND o.`ret-state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                //验证商家账户余额是否足以支付退款
                $uinfo = $userLogin->getMemberInfo();
                $umoney = $uinfo['money'];

                $date = GetMkTime(time());
                $proid = $results[0]['proid'];      //商品ID
                $ordernum = $results[0]['ordernum'];   //需要退回的订单号
                $orderprice = $results[0]['orderprice']; //订单商品单价
                $procount = $results[0]['procount'];   //订单商品数量
                $totalMoney = $orderprice * $procount;   //需要扣除商家的费用


                // $title  //商品名称
                //商品名称
                if ($results[0]['type'] == 1 || $results[0]['type'] == 2) {//景点门票
                    $proid = $results[0]['proid'];
                    $sql = $dsql->SetQuery("SELECT `id`, `title`, `ticketid`, `price`, `specialtime` FROM `#@__travel_ticketinfo` WHERE `id` = $proid ");
                    $ret = $dsql->dsqlOper($sql, 'results');
                    if (!empty($ret)) {
                        $title = $ret[0]['title'];
                    }

                    //更新已购买数量
                    $sql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
                    $dsql->dsqlOper($sql, "update");

                } elseif ($results[0]['type'] == 3) {//酒店
                    $proid = $results[0]['proid'];
                    $sql = $dsql->SetQuery("SELECT `id`, `title`, `hotelid`, `price`, `specialtime` FROM `#@__travel_hotelroom` WHERE `id` = $proid ");
                    $ret = $dsql->dsqlOper($sql, 'results');
                    if (!empty($ret)) {
                        $title = $ret[0]['title'];
                    }

                    //更新已购买数量
                    $sql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `valid` = 0, `sale` = `sale` - $procount WHERE `id` = '$proid'");
                    $dsql->dsqlOper($sql, "update");
                } elseif ($results[0]['type'] == 4) {//酒店
                    $proid = $results[0]['proid'];
                    $sql = $dsql->SetQuery("SELECT `id`, `title`, `price` FROM `#@__travel_visa` WHERE `id` = $proid ");
                    $ret = $dsql->dsqlOper($sql, 'results');
                    if (!empty($ret)) {
                        $title = $ret[0]['title'];
                    }

                    //更新已购买数量
                    $sql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
                    $dsql->dsqlOper($sql, "update");
                }

                //更新订单状态
                $now = GetMkTime(time());
                $sql = $dsql->SetQuery("UPDATE `#@__travel_order` SET `ret-state` = 0, `orderstate` = '$orderstate', `ret-ok-date` = '$now' WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "update");

                //退回会员积分、余额
                $userid = $results[0]['userid'];   //需要退回的会员ID
                $point = $results[0]['point'];    //需要退回的积分
                $balance = $results[0]['balance'];  //需要退回的余额
                $payprice = $results[0]['payprice']; //需要退回的支付金额
                global  $langData;
                //退回积分
                if (!empty($point) && $point > 0) {
                    global  $userLogin;
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
                    $pointuser = (int)($userpoint+$point);
                    //保存操作日志
                    $info = $langData['travel'][13][75] . $ordernum;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', '$date','tuihui','$pointuser')");
                    $dsql->dsqlOper($archives, "update");
                }

                $pay_name = '';
                $pay_namearr = array();
                $paramUser = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "orderdetail",
                    "action" => "shop",
                    "id" => $id
                );
                $urlParam = serialize($paramUser);

                if ($money != '') {
                    array_push($pay_namearr, "余额");
                }

                if ($point != '') {
                    array_push($pay_namearr, "积分");
                }

                if ($pay_namearr) {
                    $pay_name = join(',', $pay_namearr);
                }

                $tuikuan = array(
                    'paytype' => $pay_name,
                    'truemoneysy' => 0,
                    'money_amount' => $money,
                    'point' => $point,
                    'refrunddate' => 0,
                    'refrundno' => 0,
                    'type' => 2  /*0-表示用户退款,1-表示商家退款,2-标识平台退款*/
                );
                $tuikuanparam = serialize($tuikuan);
                //退回余额
                $money = $balance + $payprice;
                if ($money > 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$money' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
                    //保存操作日志
                    $info = $langData['travel'][13][75] . $ordernum;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$userid', '1', '$money', '$info', '$date','travel','tuikuan','$usermoney')");
                    $dsql->dsqlOper($archives, "update");


                    //减去会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$money' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");

                    //如果冻结金额小于0，重置冻结金额为0
                    $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                    $ret = $dsql->dsqlOper($archives, "results");
                    if ($ret) {
                        if ($ret[0]['freeze'] < 0) {
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }
                }

                $paramBusi = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "orderdetail",
                    "action" => "travel",
                    "id" => $id
                );

                //获取会员名
                $username = "";
                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }
                updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, array("username" => $username, "order" => $ordernum, 'amount' => $money), '', '', 0, 1);


                adminLog("为会员手动退款家政订单", $ordernum);

                echo '{"state": 100, "info": ' . json_encode("操作成功，款项已退还至会员帐户！") . '}';
                die;

            } else {
                echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
                die;
            }
        }
        if ($orderstate == 1) {      // 平台客服拒绝退款

            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__travel_order` SET `ret-state` = 0, `orderstate` = '$orderstate', `ret-ok-date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
        }

        if ($results != "ok") {
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
            $archives = $dsql->SetQuery("SELECT * FROM `#@__travel_order`  WHERE  `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");
            if(!empty($results)){

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
                $mobile   = $results[0]['contact'];

                $retType   = $results[0]['ret-type'];
                $retNote   = $results[0]['ret-note'];
                $status   = $results[0]['status'];
                $imglist = array();
                $pics = $results[0]['ret-pics'];
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

                $retSdate  = $results[0]['ret-date'];


                $ordermobile = $results[0]["ordermobile"];
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
        'admin/travel/kefuOrderEdit.js'
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
    $huoniaoTag->assign('usernote', $usernote);
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tarvel";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
