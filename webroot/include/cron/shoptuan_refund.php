<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 拼单超过24小时，自动退款
 *
 * 1. 判断拼单是否成功，如果否就发送信息通知订阅者
 *
 * @version        $Id: tuan_refund.php 2018-08-28 上午11:14:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$now = GetMkTime(time());
global $userLogin;
$sql = $dsql->SetQuery("SELECT `id`,`hid`,`userid`,`people`,`enddate`,`user` FROM `#@__shop_tuanpin` where state = '1' ");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$tid = $value['hid'];
		$id  = $value['id'];
		if($now > $value['enddate']){//超过24小时
			$orderOpera = $dsql->SetQuery("UPDATE `#@__shop_tuanpin` SET `state` = 2 WHERE `id` = ". $id);
			$dsql->dsqlOper($orderOpera, "update");

            $userArr = explode(",",$value['user']);
            if($userArr){

                foreach($userArr as $row){
                    $userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = '$row'");
                    $userResult = $dsql->dsqlOper($userSql, "results");
                    if($userResult){
                        $archives = $dsql->SetQuery("SELECT `ordernum`,`id`,`payprice`,`point`,`amount`,`balance`,`orderstate`,`paytype` FROM `#@__shop_order`  WHERE `userid`='$row' and `pinid` = ".$value['id']);
                        $results  = $dsql->dsqlOper($archives, "results");

                        $orderid    = $results[0]['id'];
                        $ordernum   = $results[0]['ordernum'];
                        $orderstate = $results[0]['orderstate'];
                        $amount     = $results[0]["amount"];
                        $point      = $results[0]["point"];
                        $balance    = $results[0]['balance'];
                        $payprice   = $results[0]['payprice'];
                        $paytype    = $results[0]['paytype'];
                        $r = true;
                        if($orderstate == 1 || $orderstate == 2 || $orderstate == 4 || $orderstate == 6){

                            /*在线退款*/
                            if ($paytype == "alipay" && $payprice!=0) {

                                $order = array(
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );


                                require_once(HUONIAOROOT . "/api/payment/alipay/alipayRefund.php");
                                $alipayRefund = new alipayRefund();

                                $return = $alipayRefund->refund($order);


                                // 成功
                                if ($return['state'] == 100) {

                                    $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                                    $refrunddate = GetMkTime($return['date']);

                                } else {

                                    $r = false;
                                    $refrundcode = $return['code'];

                                }


                                // 微信
                            } elseif (($paytype == "wxpay" || $paytype == "qqmini") && $payprice!=0) {

                                $order = array(
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );

                                require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
                                $wxpayRefund = new wxpayRefund();

                                $return = $wxpayRefund->refund($order);
                                // 成功
                                if ($return['state'] == 100) {

                                    $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                                    $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                                    $ret = $dsql->dsqlOper($sql, "update");

                                } else {

                                    require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
                                    $wxpayRefund = new wxpayRefund();

                                    $return = $wxpayRefund->refund($order, true);

                                    // 成功
                                    if ($return['state'] == 100) {

                                        $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                                        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                                        $ret = $dsql->dsqlOper($sql, "update");

                                    } else {
                                        $r = false;
                                        $refrundcode = $return['code'];
                                    }

                                }


                                // 银联
                            } elseif ($paytype == "unionpay" && $payprice!=0) {

                                $order = array(
                                    "ordernum"       => $ordernum,
                                    "orderamount"    => $payprice,
                                    "amount"         => $payprice,
                                    "transaction_id" => $transaction_id
                                );

                                require_once(HUONIAOROOT . "/api/payment/unionpay/unionpayRefund.php");
                                $unionpayRefund = new unionpayRefund();

                                $return = $unionpayRefund->refund($order);

                                // 成功
                                if ($return['state'] == 100) {

                                    $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                                    $refrunddate = GetMkTime($return['date']);

                                } else {

                                    $r = false;
                                    $refrundcode = $return['code'];

                                }


                                // 工行E商通
                            } elseif ($paytype == "rfbp_icbc" && $payprice!=0) {

                                $order = array(
                                    "service"     => 'shop',
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );

                                require_once(HUONIAOROOT . "/api/payment/rfbp_icbc/rfbp_refund.php");
                                $rfbp_refund = new rfbp_refund();

                                $return = $rfbp_refund->refund($order);

                                // 成功
                                if ($return['state'] == 100) {
                                    $refrundno = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                                    $refrunddate = GetMkTime($return['date']);
                                } else {
                                    $refrundcode = $return['code'];
                                    $r = false;
                                }


                                // 百度小程序
                            } elseif ($paytype == "baidumini" && $payprice!=0) {

                                $order = array(
                                    "service"     => 'shop',
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );

                                require_once(HUONIAOROOT . "/api/payment/baidumini/refund.php");
                                $baiduminiRefund = new baiduminiRefund();

                                $return = $baiduminiRefund->refund($order);

                                // 成功
                                if ($return['state'] == 100) {
                                    $refrundno = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                                    $refrunddate = GetMkTime($return['date']);
                                } else {
                                    $refrundcode = $return['code'];
                                    $r = false;
                                }


                                // YabandPay
                            } elseif (($paytype == "yabandpay_wxpay" || $paytype == "yabandpay_alipay") && $payprice != 0) {

                                $order = array(
                                    "service"     => 'shop',
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );

                                require_once(HUONIAOROOT . "/api/payment/yabandpay_wxpay/yabandpay_refund.php");
                                $yabandpay_refund = new yabandpay_refund();

                                $return = $yabandpay_refund->refund($order);

                                // 成功
                                if ($return['state'] == 100) {
                                    $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                                    $refrunddate = GetMkTime($return['date']);
                                } else {
                                    $refrundcode = $return['code'];
                                    $r           = false;
                                }

                            // allinpay 通联支付
                            } elseif (($paytype == "allinpay_wxpay" || $paytype == "allinpay_alipay") && $payprice != 0) {

                                $order = array(
                                    "service"     => 'shop',
                                    "ordernum"    => $ordernum,
                                    "orderamount" => $payprice,
                                    "amount"      => $payprice
                                );

                                require_once(HUONIAOROOT . "/api/payment/allinpay_alipay/allinpay_alipay.php");
                                $allinpay_alipay = new allinpay_alipay();

                                $return = $allinpay_alipay->refund($order);

                                // 成功
                                if ($return['state'] == 100) {
                                    $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                                    $refrunddate = GetMkTime($return['date']);
                                } else {
                                    $r = false;
                                }

                            }

                            if ($r) {

                                $pointinfo   = '商城订单退回：$ordernum';
                                $balanceinfo = '商城订单退款：$ordernum';
                                if ($point !=0) {
                                    $pointinfo = '商城订单退回：(积分退款:'.$point.',现金退款：'.$payprice.',余额退款：'.$balance.')：'.$ordernum;
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$row'");
                                    $dsql->dsqlOper($archives, "update");
                                    $user  = $userLogin->getMemberInfo($row);
                                    $userpoint = $user['point'];
//                                        $pointuser = (int)($userpoint+$point);
                                    //保存操作日志
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$row', '1', '$point', '$pointinfo', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                                    $dsql->dsqlOper($archives, "update");
                                }
                                if ($balance != 0) {

                                    $pay_name = '';
                                    $pay_namearr = array();
                                    $paramUser = array(
                                        "service"  => "member",
                                        "type"     => "user",
                                        "template" => "orderdetail",
                                        "action"   => "shop",
                                        "id"       => $orderid
                                    );
                                    $urlParam = serialize($paramUser);

                                    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
                                    $ret = $dsql->dsqlOper($sql, "results");
                                    if(!empty($ret)){
                                        $pay_name	 = $ret[0]['pay_name'];
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
                                        'paytype' 				=> $pay_name,
                                        'truemoneysy'			=> $payprice,
                                        'money_amount'  		=> $balance,
                                        'point'					=> $point,
                                        'refrunddate'			=> $refrunddate,
                                        'refrundno'				=> $refrundno
                                    );
                                    $tuikuanparam = serialize($tuikuan);
                                    $balanceinfo = '商城订单退款：(积分退款:'.$point.',现金退款：'.$payprice.',余额退款：'.$balance.')：'.$shopname;
                                    $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $balance . " WHERE `id` = " . $row);
                                    $dsql->dsqlOper($userOpera, "update");
                                    $user  = $userLogin->getMemberInfo($row);
                                    $usermoney = $user['money'];
                                    //记录退款日志
                                    $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$row', '$balance', '1', '$balanceinfo', '" . GetMkTime(time()) . "','shop','tuikuan','$urlParam','$ordernum','$tuikuanparam','商城消费','$usermoney')");
                                    $dsql->dsqlOper($logs, "update");

                                }
                                /*商家扣除冻结金额*/
                                $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $amount WHERE `id` = " . $row);
                                $dsql->dsqlOper($usersql, "update");

                                $now = GetMkTime(time());
                                $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 7, `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$amount', `refrundno` = '$refrundno' WHERE `id` = " . $orderid);
                                $dsql->dsqlOper($orderOpera, "update");

                                //获取会员名
                                $username = "";
                                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                                $ret = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                                }

                                $param = array(
                                    "service"     => "member",
                                    "template"    => "orderdetail",
                                    "action"      => "shop",
                                    "id"          => $orderid
                                );
                                $url = getUrlPath($param);
                                $paramBusi = array(
                                    'service' => 'custom',
                                    'param' => $url
                                );
                                //自定义配置
                                $config = array(
                                    "username" => $username,
                                    "order" => $ordernum,
                                    "amount" => $amount,
                                    "fields" => array(
                                        'keyword1' => '退款状态',
                                        'keyword2' => '退款金额',
                                        'keyword3' => '审核说明'
                                    )
                                );

                                updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, $config, '', '', 0, 1);


                                return $langData['siteConfig'][9][34];  //退款成功

                            } else {
                                return array("state" => 200, "info" => $refrundcode);  //操作失败，请核实订单状态后再操作！
                            }
                        }
                    }
                }

            }
                    
		}
	}
}
