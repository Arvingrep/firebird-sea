<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 旅游定时更新旅游订单状态
 *
 * 1. 景点门票,周边游,签证，酒店判断出行日期，如果已经过期，更新订单状态为成功，将钱打入给商家；
 * 2. 酒店扫描后，如果已经过期，更新房间信息；
 *
 * @version        $Id: travel_updateOrderState.php 2019-5-15 下午15:02:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$now = strtotime(date('Y-m-d'));

$sql = $dsql->SetQuery("SELECT `id`, `walktime`, `type`, `userid`, `proid`, `orderstate`, `departuretime` FROM `#@__travel_order` where  (`orderstate` = 1 AND `type` = '1' AND `walktime` < $now) or (`orderstate` = 1 AND `type` = '2' AND `walktime` < $now) or (`orderstate` = 1 AND `type` = '3' AND `departuretime` < $now) or (`orderstate` = 3 AND `type` = '3' AND `departuretime` < $now) or (`orderstate` = 1 AND `type` = '4' AND `walktime` < $now) ");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	foreach ($ret as $key => $value) {

		if($value['orderstate'] == 3 && $value['type'] == 3 && $value['departuretime'] < $now){
			$sql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `valid` = 0 WHERE `id` = " . $value['proid']);
			$dsql->dsqlOper($sql, "update");
		}

		$configHandels = new handlers("travel", "receipt");
		foreach ($ret as $key => $value) {
			global $autoReceiptUserID;
			$autoReceiptUserID = $value['userid'];
			$moduleConfig  = $configHandels->getHandle(array("id" => $value['id']));
		}
		
	}
}
