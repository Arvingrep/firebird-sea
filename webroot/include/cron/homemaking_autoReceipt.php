<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 用户待验收成功后2天内没有确认收货，系统自动执行收货流程
 *
 * @version        $Id: homemaking_autoReceipt.php 2019-04-17 下午14:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
global $handler;
$handler = true;


include(HUONIAOINC."/config/homemaking.inc.php");

//2天内
$day = $customAutoAccept ?: 2;
$day = $day * 24 * 3600;
$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__homemaking_order` WHERE `orderstate` = 5 AND ($time - `exp-date` > $day)");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

	$configHandels = new handlers("homemaking", "operOrder");

	foreach ($ret as $key => $value) {
		global $autoReceiptUserID;
		$autoReceiptUserID = $value['userid'];
		$moduleConfig  = $configHandels->getHandle(array("oper"=>"verify","id" => $value['id']));

	}
}
