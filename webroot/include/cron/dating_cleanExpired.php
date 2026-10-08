<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时更新已过期会员为普通会员
 *
 *
 * @version        $Id: member_cleanExpired.php 2017-07-28 下午13:57:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());
$sql = $dsql->SetQuery("UPDATE `#@__dating_member` SET `level` = 0, `expired` = 0 WHERE `expired` < $time");
$dsql->dsqlOper($sql, "update");