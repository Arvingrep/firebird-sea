<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 发货成功后5天内没有确认收货，系统自动执行收货流程
 *
 * @version        $Id: shop_autoReceipt.php 2016-09-28 下午14:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');

//5天内
$day = 5 * 24 * 3600;
$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__integral_order` WHERE `orderstate` = 6 AND ($time - `exp-date` > $day)");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

    include_once HUONIAOROOT."/api/handlers/integral.class.php";
    $configHandels = new handlers("integral", "receipt");

	foreach ($ret as $key => $value) {
		global $integral_autoReceiptUserID;
		$integral_autoReceiptUserID = $value['userid'];
		
		$moduleConfig  = $configHandels->getHandle(array("id" => $value['id']));

	}
}
