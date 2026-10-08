<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 发货成功后3天内没有确认收货，系统自动执行收货流程
 *
 * @version        $Id: shop_autoReceipt.php 2016-09-28 下午14:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
require(dirname(__FILE__).'/../config/shop.inc.php');
global $handler;
$handler = true;

//3天内
$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `huodongtype`,`etime` FROM `#@__shop_huodongsign` WHERE `etime` <= '$time' AND `state` = 1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){


	foreach ($ret as $key => $value) {
        $hdsql = $dsql->SetQuery("UPDATE `#@__shop_huodongsign` SET `state` = 3 WHERE `id` = '".$value['id']."'");
        $dsql->dsqlOper($hdsql, "update");

		if($value['huodongtype'] == 3){

            $sql = $dsql->SetQuery("UPDATE `#@__shop_bargaining` SET `state` = 2 WHERE `hid` = '".$value['id']."'");

        }elseif($value['huodongtype'] == 4){

            $sql = $dsql->SetQuery("UPDATE `#@__shop_tuanpin` SET `state` = 2 WHERE `hid` = '".$value['id']."'");
        }

        $dsql->dsqlOper($sql, "update");


	}
}
$time = GetMkTime(time());
$sql = $dsql->SetQuery("UPDATE `#@__shop_bargaining` SET `state` = 2  WHERE `enddate` <= '$time' AND (`state` = 0 OR (`state` = 1 AND `oid` =''))");

$dsql->dsqlOper($sql, "update");

