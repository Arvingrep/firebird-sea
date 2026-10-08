<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 家居定时更新家居订单状态
 *
 * 1. 检查活动是否结束，如果结速则更新订单状态为已关闭
 * 2. 如果库存不足，则更新更新订单状态为已关闭
 *
 * @version        $Id: home_updateOrderState.php 2016-06-16 下午13:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = time();
$sql = $dsql->SetQuery("SELECT o.`id` FROM `#@__home_order` o LEFT JOIN `#@__home_order_product` op ON op.`orderid` = o.`id` LEFT JOIN `#@__home_product` p ON p.`id` = op.`proid` WHERE o.`orderstate` = 0 AND ((p.`btime` != 0 AND p.`etime` != 0 AND p.`etime` < $time) OR (p.`inventory` - p.`sales` - op.`count` < 0))");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$sql = $dsql->SetQuery("UPDATE `#@__home_order` SET `orderstate` = 10 WHERE `id` = ".$value['id']);
		$dsql->dsqlOper($sql, "update");
	}
}
