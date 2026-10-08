<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 跑腿s定时更新订单状态
 *
 * 半小时未支付的订单，更新状态为：6，取消支付
 *
 *
 * @version        $Id: paotui_updateOrderState.php 2019-01-16 下午19:11:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 1800;

$sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `state` = 6, `failed` = '半小时内未支付，系统自动取消！' WHERE `state` = 0 AND `pubdate` < $time");
$dsql->dsqlOper($sql, "update");