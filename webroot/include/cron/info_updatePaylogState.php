<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时删除1个小时内未付款的竞价记录
 *
 * 如果超过1个小时还未付款成功，则删除这条记录
 *
 * @version        $Id: info_updatePaylogState.php 2016-10-13 晚上22:38:20 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 3600;

$sql = $dsql->SetQuery("DELETE FROM `#@__member_bid` WHERE `state` = 0 AND `start` < $time");
$dsql->dsqlOper($sql, "update");
