<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖定时更新订单状态
 *
 * 半小时未支付的订单，更新状态为：6，取消支付
 *
 *
 * @version        $Id: waimai_updateOrderState.php 2016-12-09 下午17:18:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $cfg_timeZone;

$time51 = $cfg_timeZone * -1;
@date_default_timezone_set('Etc/GMT'.$time51);

$time = GetMkTime(time()) - 1800;

$sql = $dsql->SetQuery("SELECT `usequan`  FROM  `#@__waimai_order` WHERE `state` = 0 AND `pubdate` < $time AND `usequan`!= 0");
$result = $dsql->dsqlOper($sql,"results");
foreach ($result as $k => $v) {
	$sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 0,`usedate` = 0 ,`oid` = 0 WHERE `id` = " .$v['usequan']);
	$dsql->dsqlOper($sql, "update");
}

$sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_order_all` WHERE `state` = 0 AND `pubdate` < $time");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

	//初始化日志
	$day = date("Ymd");
	mkdir(HUONIAOROOT.'/log/updateOrderState_waimai/'.$day, 0777, true);
	require_once HUONIAOROOT."/api/payment/log.php";
	$updateOrderState_waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/updateOrderState_waimai/'.$day.'/'.date('H').'.log');

	$updateOrderState_waimaiLog->DEBUG($sql."\r");
	$updateOrderState_waimaiLog->DEBUG(json_encode($ret)."\r");

	// $info = '半小时内未支付，系统自动取消！' . date('Y-m-d H:i:s', GetMkTime(time()));
    $info = '订单超时未支付';
	$sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 6, `failed` = '$info' WHERE `state` = 0 AND `pubdate` < $time");
	$dsql->dsqlOper($sql, "update");

	$updateOrderState_waimaiLog->DEBUG($sql."\r\n");

}
