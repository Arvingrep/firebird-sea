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

$sql = $dsql->SetQuery("SELECT `id`,`tid`,`userid`,`people`,`enddate`,`user` FROM `#@__tuan_pin` where state = '1' ");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$tid = $value['tid'];
		$id  = $value['id'];
		if($now > $value['enddate']){//超过24小时
			$orderOpera = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET `state` = 2 WHERE `id` = ". $id);
			$dsql->dsqlOper($orderOpera, "update");

			//获取团购信息
			$tuanSql = $dsql->SetQuery("SELECT `pinpeople`, `buynum` FROM `#@__tuanlist` WHERE `id` = '$tid'");
			$tuanResult = $dsql->dsqlOper($userSql, "results");
			if(!empty($tuanResult)){
				if($value['people'] < $tuanResult[0]['pinpeople']){//小于
					$userArr = explode(",",$value['user']);
					foreach($userArr as $row){
						$userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = '$row'");
						$userResult = $dsql->dsqlOper($userSql, "results");
						if($userResult){
							$archives = $dsql->SetQuery("SELECT `ordernum`,`procount`,`id`,`payprice`,`point`,`propolic`,`balance`,`orderprice`,`orderstate` FROM `#@__tuan_order`  WHERE `userid`='$row' and `pinid` = ".$value['id']);
							$results  = $dsql->dsqlOper($archives, "results");
							$orderid    = $results[0]['id'];
							$ordernum   = $results[0]['ordernum'];
							$orderstate = $results[0]['orderstate'];
							$propolic   = $results[0]["propolic"];
							$point      = $results[0]["point"];
							$procount   = $results[0]["procount"];
							// $orderprice = $results[0]['balance'] + $results[0]['payprice'];
							$orderprice = (float)$results[0]['orderprice'];
							if($orderstate == 1 || $orderstate == 2 || $orderstate == 4 || $orderstate == 6){
								//计算运费
								$policy = unserialize($propolic);
								if(!empty($propolic) && !empty($policy)){
									$freight  = $policy['freight'];
									$freeshi  = $policy['freeshi'];

									if($procount <= $freeshi){
										$orderprice += $freight;
									}
								}
								global  $userLogin;
								if(!empty($point)){
									$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$row'");
									$dsql->dsqlOper($archives, "update");
                                    $user  = $userLogin->getMemberInfo($row);
                                    $userpoint = $user['point'];
//                                    $pointuser = (int)($userpoint+$point);
									//保存操作日志
									$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$row', '1', '$point', '团购订单退回：$ordernum', ".GetMkTime(time()).",'tuihui','$userpoint')");
									$dsql->dsqlOper($archives, "update");
								}
								//会员帐户充值
								if($orderprice > 0){
									$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$orderprice." WHERE `id` = '$row'");
									$dsql->dsqlOper($userOpera, "update");
                                    $user  = $userLogin->getMemberInfo($row);
                                    $usermoney = $user['money'];
//                                    $money  = sprintf('%.2f',($usermoney + $orderprice));
									//记录退款日志
									$logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES (".$row.", ".$orderprice.", 1, '团购订单退款：".$ordernum."', ".GetMkTime(time()).",'tuan','tuikuan','$usermoney')");
									$dsql->dsqlOper($logs, "update");
								}
								//更新团购已购买数量
								$buynum = $tuanResult[0]['buynum'];
								if($buynum < 2){
									$proSql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = 0 where id='$tid'");
									$dsql->dsqlOper($proSql, "update");
								}else{
									$proSql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = `buynum` - $procount where id='$tid'");
									$dsql->dsqlOper($proSql, "update");
								}
								//更新订单状态
								$orderOpera = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 7, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = ".GetMkTime(time())." WHERE `userid`='$row' and `pinid` = ". $id);
								$dsql->dsqlOper($orderOpera, "update");

								//退款成功，会员消息通知
								$paramUser = array(
									"service"  => "member",
									"type"     => "user",
									"template" => "orderdetail",
									"action"   => "tuan",
									"id"       => $orderid
								);

								$paramBusi = array(
									"service"  => "member",
									"template" => "orderdetail",
									"action"   => "tuan",
									"id"       => $orderid
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

								updateMemberNotice($userid, "会员-订单退款成功", $param, $config);

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

								//获取会员名
								$username = $userResult[0]['username'];
								updateMemberNotice($uid, "会员-订单退款通知", $param, $config);
							}
						}
					}
				}
			}
		}
	}
}
