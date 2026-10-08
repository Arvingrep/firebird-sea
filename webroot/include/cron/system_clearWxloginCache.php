<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时清除微信临时登录的日志
 * *
 * @version        $Id: system_clearWxloginCache.php 2017-02-22 下午18:25:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time()) - 3600;

$sql = $dsql->SetQuery("DELETE FROM `#@__site_wxlogin` WHERE `date` < $time");
$dsql->dsqlOper($sql, "update");
