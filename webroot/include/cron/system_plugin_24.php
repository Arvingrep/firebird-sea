<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 跟踪订单，下单成功后赠送积分
 *
 * @version        $Id: system_plugin_24.php 2024-7-31 下午17:22:23 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $cfg_basedomain;

//拼多多订单
$param = array(
    'action' => 'order', 
    'type' => 'pdd'
);
hn_curl($cfg_basedomain. '/include/plugins/24/api.php', $param, 'urlencoded', 'GET');