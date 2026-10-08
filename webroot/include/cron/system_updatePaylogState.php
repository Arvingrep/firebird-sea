<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时删除1个小时内未付款的支付记录
 * 
 * 如果超过1个小时还未付款成功，则删除这条记录
 *
 * @version        $Id: system_updatePaylogState.php 2015-11-09 上午10:40:11 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 3600;

$sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `state` = 0 AND `pubdate` < $time");
$dsql->dsqlOper($sql, "update");

// $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `state` = 0 AND `pubdate` < $time");
// $ret = $dsql->dsqlOper($sql, "results");
// if($ret){
// 	foreach ($ret as $key => $value) {
// 		$sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `id` = ".$value['id']);
// 		$dsql->dsqlOper($sql, "update");
// 	}
// }

