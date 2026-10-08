<?php
//if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 系统自动执行退款流程
 *
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
require(dirname(__FILE__).'/../config/shop.inc.php');
global $dsql;
global $userLogin;
global $handler;
$handler = true;
$tuikuanday = (int)$customtuikuanday * 3600 * 24;  /*自动关闭退款时间*/
$time = GetMkTime(time());

$archives = $dsql->SetQuery("SELECT ob.`orderid`, o.`ordernum`, o.`userid`, ob.`balance`, ob.`point`, ob.`logistic`, ob.`payprice`,o.`paytype`,ob.`refrundno`,o.`peerpay`,ob.`ret_negotiate`,s.`title`,s.`userid` uid FROM `#@__shop_order` o  LEFT JOIN `#@__shop_order_product` ob ON o.`id` = ob.`orderid`  LEFT JOIN `#@__shop_store` s ON o.`store` = s.`id` LEFT JOIN `#@__shop_branch_store` b ON o.`branchid` = b.`id` LEFT JOIN `#@__member` m ON s.`userid` = m.`id` WHERE o.`orderstate` = 6 AND ob.`ret_state` = 1 AND  ($time - ob.`ret_date` > $tuikuanday)");
$results = $dsql->dsqlOper($archives, "results");

if ($results) {

    //初始化日志
    require_once HUONIAOROOT."/api/payment/log.php";
    $_shop_autoRefundLog= new CLogFileHandler(HUONIAOROOT.'/log/shop_autoRefund/'.date('Y-m-d').'.log', true);
    $_shop_autoRefundLog->DEBUG($archives);
    $_shop_autoRefundLog->DEBUG(json_encode($results));

    foreach ($results as $kk=>$vv) {
        $orderid    = $vv['orderid'];    //需要退回的订单ID
        $ordernum   = $vv['ordernum'];   //需要退回的订单号
        $userid     = $vv['userid'];     //需要退回的会员ID
        $uid        = $vv['uid'];        //商家会员ID
        $balance    = $vv['balance'];    //余额支付
        $point      = $vv['point'];      //积分支付
        $payprice   = $vv['payprice'];   //实际支付
        $logistic   = $vv['logistic'];   //运费
        $shopname   = $vv['title'];
        $paytype    = $vv["paytype"];
        $refrundno  = $vv["refrundno"];
        $peerpay    = $vv["peerpay"];
        $ret_negotiate = $vv["ret_negotiate"] != '' ? unserialize($vv["ret_negotiate"]) : array(); /*协商历史*/

        global $cfg_pointRatio;
        $orderTotalAmount = $balance + $payprice + $point / $cfg_pointRatio;
        $totalPoint = 0;

//			$sql = $dsql->SetQuery("SELECT `point`, `balance`, `payprice` FROM `#@__shop_order_product` WHERE `orderid` = '$orderid'");
//			$ret = $dsql->dsqlOper($sql, "results");
//			if($ret){
//				foreach($ret as $key => $val){
//					$totalMoney += $val['balance'] + $val['payprice'];
//					$totalPoint += $val['point'];
//				}
//			}

        $freezeamount = (float)$balance + (float)$payprice;
//混合支付退款
        $refrunddate = GetMkTime(time());
        $online_amount = $refrund_online = $orderTotalAmount;
        $arr = refund('shop', $peerpay, $paytype, $payprice, $ordernum, $refrundno, $balance, $orderid);
        $r = $arr[0]['r'];
        $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate;
        $refrundno = $arr[0]['refrundno'];
        $refrundcode = $arr[0]['refrundcode'];
//更新订单状态
        if ($r) {

            $pointinfo = '商城订单退回：$ordernum';
            $balanceinfo = '商城订单退款：$ordernum';
            if ($point != 0) {
                $pointinfo = '商城订单退回：(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $ordernum;
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");
                $user = $userLogin->getMemberInfo($userid);
                $userpoint = $user['point'];
                //                    $pointuser  = (int)($userpoint+$point);
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$pointinfo', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                $dsql->dsqlOper($archives, "update");
            }
            if ($balance != '0' && $paytype != 'huoniao_bonus') {

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

                $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
                $ret = $dsql->dsqlOper($sql, "results");
                if (!empty($ret)) {
                    $pay_name = $ret[0]['pay_name'];
                } else {
                    $pay_name = $ret[0]["paytype"];
                }

                if ($pay_name) {
                    array_push($pay_namearr, $pay_name);
                }

                if ($balance != '') {
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
                    'truemoneysy' => $payprice,
                    'money_amount' => $balance,
                    'point' => $point,
                    'refrunddate' => $refrunddate,
                    'refrundno' => $refrundno
                );
                $tuikuanparam = serialize($tuikuan);
                $balanceinfo = '商城订单退款：(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname . $ordernumstore;
                $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $balance . " WHERE `id` = " . $userid);
                $dsql->dsqlOper($userOpera, "update");
                $user = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                //记录退款日志
                $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '$balance', '1', '$balanceinfo', '" . GetMkTime(time()) . "','shop','tuikuan','$urlParam','$ordernum','$tuikuanparam','商城消费','$usermoney')");
                $dsql->dsqlOper($logs, "update");

            }
            if ($peerpay <= 0) {
                /*商家扣除冻结金额*/
                $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezeamount WHERE `id` = " . $userid);
                $dsql->dsqlOper($usersql, "update");
            }

            $now = GetMkTime(time());
            $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order_product` SET `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$orderTotalAmount', `refrundno` = '$refrundno' WHERE `orderid` = " . $orderid);

            $dsql->dsqlOper($orderOpera, "update");


            $archives = $dsql->SetQuery("SELECT o.`ret_state` FROM `#@__shop_order` ob LEFT JOIN `#@__shop_order_product` o ON o.`orderid` = ob.`id`  WHERE `id` = " . $orderid);
            $ret_state = $dsql->dsqlOper($archives, "results");
            $now = GetMkTime(time());
            $retstate = array_column($ret_state, 'ret_state');
            if (!in_array(1, $retstate)) {
//                        $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 7 WHERE `id` = " . $id);
                $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 7, `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$orderTotalAmount', `refrundno` = '$refrundno' WHERE `id` = " . $orderid);
                $dsql->dsqlOper($orderOpera, "update");
            }


            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            $paramBusi = array(
                "service" => "member",
                "type" => "user",
                "template" => "orderdetail",
                "action" => "shop",
                "id" => $orderid
            );
            //自定义配置
            $config = array(
                "username" => $username,
                "order" => $ordernum,
                "amount" => $orderTotalAmount,
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