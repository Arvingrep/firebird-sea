<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 团购定时更新团购订单状态
 *
 * 1. 判断订单状态为未付款，如果已经过期，更新订单状态为已过期
 * 2. 如果是已经付款的，检查活动是否结束，如果结速则更新订单状态为已过期
 * 3. 如果库存不足，则更新更新订单状态为已过期
 *
 * @version        $Id: tuan_updateOrderState.php 2015-10-21 下午15:02:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());
$sql = $dsql->SetQuery("SELECT o.`id` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` WHERE l.`tuantype` = 0 AND ( (o.`orderstate` = 0 OR o.`orderstate` = 1) AND (l.`maxnum` - l.`defbuynum` - l.`buynum` - o.`procount` < 0 OR (l.`expire_type` = 'static' AND l.`expireddate` != 0 AND l.`expireddate` < $time) OR (l.`expire_type` = 'limit' AND o.`orderdate` + l.`expire_limit` * 86400 < $time) ) )");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {
		$sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 2 WHERE `id` = ".$value['id']);
		$dsql->dsqlOper($sql, "update");
	}
}
