<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时删除半个小时内未付款的记录
 *
 * 如果超过半个小时还未付款成功，则删除这条记录
 *
 * @version        $Id: education_updatePaylogState.php 2019-4-16 晚上22:38:20 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 1800;

$sql = $dsql->SetQuery("UPDATE `#@__education_order` SET `orderstate` = 7, `failnote` = '半小时内未支付，系统自动取消！' WHERE `orderstate` = 0 AND `nopaydate` < $time");
$dsql->dsqlOper($sql, "update");
