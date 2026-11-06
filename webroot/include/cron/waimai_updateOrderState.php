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

// 货到付款订单不存在「未支付超时」语义：paytype=1 的单在 pay() 收口成功前也会短暂处于
// state=0（上游 deal() 对 COD 只返回 "delivery|<ordernum>" 并早返回，见 waimai.class.php:3686）。
// 若在此被置为 state=6「订单超时未支付」，用户会看到刚下的单凭空变成已取消。
// 因此这里的超时规则只作用于「需要在线支付」的订单，COD 单排除在外。
$sql = $dsql->SetQuery("SELECT `usequan`  FROM  `#@__waimai_order` WHERE `state` = 0 AND `pubdate` < $time AND `usequan`!= 0 AND `paytype` != '1'");
$result = $dsql->dsqlOper($sql,"results");
foreach ($result as $k => $v) {
	$sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 0,`usedate` = 0 ,`oid` = 0 WHERE `id` = " .$v['usequan']);
	$dsql->dsqlOper($sql, "update");
}

$sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_order_all` WHERE `state` = 0 AND `pubdate` < $time AND `paytype` != '1'");
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
	$sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 6, `failed` = '$info' WHERE `state` = 0 AND `pubdate` < $time AND `paytype` != '1'");
	$dsql->dsqlOper($sql, "update");

	$updateOrderState_waimaiLog->DEBUG($sql."\r\n");

}
