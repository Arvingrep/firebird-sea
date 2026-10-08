<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新已结束的置顶信息
 *
 *
 * @version        $Id: info_updateBidState.php 2016-10-13 下午15:25:11 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `isbid` = 0 WHERE `bid_end` < $time AND `isbid` = 1");
$dsql->dsqlOper($sql, "update");
