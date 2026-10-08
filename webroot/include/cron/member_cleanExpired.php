<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时更新已过期会员为普通会员
 *
 * 如果会员超过系统配置时间没有活动，则自动更新会离线状态
 *
 * @version        $Id: member_cleanExpired.php 2017-07-28 下午13:57:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());
$sql = $dsql->SetQuery("UPDATE `#@__member` SET `last_level` = `level`, `last_expired` = `expired`, `level` = 0, `expired` = 0, `expired_notify_day` = 0, `expired_notify_week` = 0, `expired_notify_month` = 0 WHERE `level` > 0 AND `expired` < $time");
$dsql->dsqlOper($sql, "update");
