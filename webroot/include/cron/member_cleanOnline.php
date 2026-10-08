<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 定时更新会员在线状态
 *
 * 如果会员超过系统配置时间没有活动，则自动更新会离线状态
 *
 * @version        $Id: member_cleanOnline.php 2015-11-16 下午14:02:22 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $cfg_onlinetime;
$time = GetMkTime(time()) - $cfg_onlinetime * 60 * 60;
// $time = time() + 300;  //5分钟没有更新在线状态，即判断为离线

$sql = $dsql->SetQuery("UPDATE `#@__member` SET `online` = 0 WHERE `online` != 0 AND `online` < $time");
$dsql->dsqlOper($sql, "update");
