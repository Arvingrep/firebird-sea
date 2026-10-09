<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新置顶结束
 *
 *
 * @version        $Id: car_updateBidState.php 2019-03-20 上午9:54:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("UPDATE `#@__car_list` SET `isbid` = 0, `bid_price` = 0, `bid_start` = 0, `bid_end` = 0 WHERE `bid_end` < $time");
$dsql->dsqlOper($sql, "update");

