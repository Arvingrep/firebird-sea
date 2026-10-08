<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 分账计划任务，用于实时到账的分账请求没有成功导致的分账失败
 * 比如微信付完款后，款项还是处理中，此时直接请求分账接口，会出现分账失败
 * 每次处理10笔订单
 *
 * @version        $Id: business_shareAllocation.php 2021-10-17 下午14:27:18 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$sql = $dsql->SetQuery("SELECT `platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo` FROM `#@__business_shareallocation` WHERE `state` = 0 ORDER BY `id` DESC LIMIT 0,10");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$platform = $value['platform'];
		$bid = $value['bid'];
		$title = $value['title'];
		$ordernum = $value['ordernum'];
		$orderdata = $value['orderdata'] ? unserialize($value['orderdata']) : array();
		$totalAmount = $value['totalAmount'];
		$amount = $value['amount'];
		$subMerId = $value['subMerId'];
		$subMerPrtclNo = $value['subMerPrtclNo'];
		$seqNo = $value['seqNo'];

		if($subMerId == ''){
			continue;
		}

		if($platform == 'rfbp_icbc'){
			$order = array(
				"bid" => $bid,
				"ordertitle" => $title,
				"ordernum" => $ordernum,
				"orderdata" => $orderdata,
				"totalAmount" => $totalAmount,
				"amount" => $amount,
				"icbc_subMerId" => $subMerId,
				"icbc_subMerPrtclNo" => $subMerPrtclNo,
				"channelPayOrderNo" => $seqNo
			);
			require_once(HUONIAOROOT."/api/payment/rfbp_icbc/rfbp_shareAllocation.php");
			$rfbp_shareAllocation = new rfbp_shareAllocation();
			$ret = $rfbp_shareAllocation->shareAllocation($order);

		}elseif($platform == 'wxpay'){
			$order = array(
				"bid" => $bid,
				"ordertitle" => $title,
				"ordernum" => $ordernum,
				"orderdata" => $orderdata,
				"totalAmount" => $totalAmount,
				"amount" => $amount,
				"submchid" => $subMerId,
				"transaction_id" => $seqNo
			);
			require_once(HUONIAOROOT."/api/payment/wxpay/wxpayProfitsharing.php");
			$wxpayProfitsharing = new wxpayProfitsharing();
			$ret = $wxpayProfitsharing->profitsharing($order);

			$amount = sprintf("%.2f", $totalAmount-$amount);  //这里需要反算一下，因为正常的分账是给服务商分钱，比如：订单1元，平台抽10%，平台得0.1，商家得0.9，正常的分账那里是用的0.1用于转给服务商；  分账错误后，这里重试的话，也是用的0.1，但是下方在扣除用户余额时，要用0.9，才是正常的。

		}elseif($platform == 'alipay'){

            $order = array(
                "bid" => $bid,
                "ordertitle" => $title,
                "ordernum" => $ordernum,
                "orderdata" => $orderdata,
                "totalAmount" => $totalAmount,
                "amount" => $amount,
                "alipay_pid" => $subMerId,
                "alipay_app_auth_token" => $subMerPrtclNo,
                "transaction_id" => $seqNo
            );
            require_once(HUONIAOROOT."/api/payment/alipay/alipayProfitsharing.php");
            $alipayProfitsharing = new alipayProfitsharing();
            $ret = $alipayProfitsharing->profitsharing($order);
            
		}

		//成功后，减少用户余额并增加提现记录
		if($ret['state'] == 1){
			$orderid = $ret['orderid'];
			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $bid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
                $time  = GetMktime(time());

                $uid = $ret[0]['uid'];

				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$uid'");
				$dsql->dsqlOper($archives, "update");
				global $userLogin;
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money =  sprintf('%.2f',($usermoney - $amount));
				$info   = "系统自动分账，订单号：" . $orderid;
				$title_ = '系统自动分账';
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$info', '$time','member','tixian','$title_','$orderid','$usermoney')");
				$dsql->dsqlOper($archives, "update");
			}
		}

	}
}
