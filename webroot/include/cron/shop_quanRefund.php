<?php
//if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 系统自动执行团购券退款流程
 *
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
require(dirname(__FILE__).'/../config/shop.inc.php');
global $dsql;
global $handler;
global $userLogin;
$handler = true;
$time = GetMkTime(time());


//查询优惠券
$archives = $dsql->SetQuery("SELECT n.`id`quanid,n.`ret_state`,n.`expireddate`,o.`id`orderid,o.`peerpay`,o.`paytype`,o.`ordernum`,o.`userid`,s.`userid`uid,t.`count`,t.`balance`,t.`point`,t.`payprice`,t.`logistic`,t.`price` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON o.`store` = s.`id`  LEFT JOIN `#@__shop_order_product` t ON o.`id` = t.`orderid` LEFT JOIN `#@__shopquan` n ON o.`id` = n.`orderid`  LEFT JOIN `#@__shop_product` e ON n.`proid` = e.`id`  WHERE n.`ret_state` = 0 AND n.`expireddate` < $time AND n.`usedate` = 0 AND e.`is_tuikuan` = 0");
$proresid = $dsql->dsqlOper($archives, "results");
if($proresid){
    foreach ($proresid as $kk=>$vv){
        //查询优惠券
            $archives = $dsql->SetQuery("SELECT count(`id`)shopquancount FROM `#@__shopquan` WHERE `orderid` =".$vv['orderid']);
            $pro = $dsql->dsqlOper($archives, "results");
            $shopquancount     =$pro[0]['shopquancount'];
            $orderid     = $vv['orderid'];         //需要退回的订单ID
            $ordernum    = $vv['ordernum'];   //需要退回的订单号
            $userid      = $vv['userid'];     //需要退回的会员ID
            $uid         = $vv['uid'];        //商家会员ID
            $payprice    = $vv['payprice'];   //实际支付
            $logistic    = $vv['logistic'];   //运费
            $shopname    = $vv['title'];   //运费
            $paytype     = $vv["paytype"];
            $refrundno   = $vv["refrundno"];
            $peerpay     = $vv["peerpay"];
            $price       = $vv["price"];
            $shopcount   = $vv["count"];
            $danjiaprice = ($price / $shopcount) * $shopquancount;                //钱
            $danjiapoint = ($vv["point"] / $shopcount) * $shopquancount;                 //积分
            $balance     = $danjiaprice;    //余额支付
            $point       = $danjiapoint;      //积分支付
            global $cfg_pointRatio;
            $orderTotalAmount = $balance + $payprice + $point / $cfg_pointRatio;
            $totalPoint = 0;
            $orderprice = $vv['count'] * $vv['price'] + $vv['logistic'];

            $freezeamount = (float)$balance + (float)$payprice;
            
            //混合支付退款
            $refrunddate = GetMkTime(time());
            $online_amount = $refrund_online = $orderTotalAmount;
            $arr = refund('shop',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$orderid);
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
            $refrundno   = $arr[0]['refrundno'];
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
                if ($balance != '0') {

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
                $sql = $dsql->SetQuery("UPDATE `#@__shopquan` SET `ret_state` = 1 WHERE `id` = '".$vv['quanid']."'");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 6, `ret_state` = 1  WHERE `id` = " . $vv['orderid']);
                $dsql->dsqlOper($sql, "update");
                if ($peerpay <= 0) {
                    /*商家扣除冻结金额*/
                    $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezeamount WHERE `id` = " . $userid);
                    $dsql->dsqlOper($usersql, "update");
                }
                $now = GetMkTime(time());

                $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 7, `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . " WHERE `id` = " . $orderid);
                $dsql->dsqlOper($orderOpera, "update");
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
                //自定义配置
                $config = array(
                    "username" => $username,
                    "order" => $ordernum,
                    "amount" => $orderprice,
                    "info" => '到期自动退款',
                    "fields" => array(
                        'reason' => '退款原因',
                        'refund' => '退款金额'
                    )
                );

                updateMemberNotice($vv['userid'], "会员-订单退款成功", $paramBusi, $config);


    //            return $langData['siteConfig'][9][34];  //退款成功

            }
    }
}