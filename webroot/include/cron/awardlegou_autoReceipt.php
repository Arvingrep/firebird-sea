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
require(dirname(__FILE__).'/../config/awardlegou.inc.php');
global $handler;
$handler = true;

if(empty($customconfirmDay)){
    $customconfirmDay = 1;
}
//3天内
$day = (int)$customconfirmDay * 24 * 3600;
$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__awardlegou_order` WHERE `orderstate` = 6 AND ($time - `exp-date`) > $day");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

	$configHandels = new handlers("awardlegou", "receipt");

	foreach ($ret as $key => $value) {
		global $autoReceiptUserID;
		$autoReceiptUserID = $value['userid'];

		$moduleConfig  = $configHandels->getHandle(array("id" => $value['id'],"caotuotype" =>'1'));

	}
}

/*自动退款*/
if(empty($customautotuikuan)){
    $customautotuikuan = 1;
}

$tuikuanday = (int)$customautotuikuan * 24 * 3600;

$tuikuansql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE  (`orderstate` = 5 AND `ret-state` = 1 AND ($time - `ret-date`) > $tuikuanday) or (`orderstate` = 9 AND `ret-expnumber` !='' AND `ret-expdate` !='')");

$tuikuanres = $dsql->dsqlOper($tuikuansql,"results");

if($tuikuanres){

    $configHandels = new handlers("awardlegou", "refund");

    foreach ($tuikuanres as $key => $value) {
        global $autoReceiptUserID;

        $moduleConfig  = $configHandels->getHandle(array("id" => $value['id'],"type"=>"","content"=> '系统自动退款'));

    }
}

/*自动同意退货*/

if(empty($customautotuihuo)){
    $customautotuihuo = 1;
}

$tuihuoday = (int)$customautotuihuo * 24 * 3600;

$tuihuosql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order`  WHERE  (`orderstate` = 6 AND `ret-state` = 1 )");

$tuihuores = $dsql->dsqlOper($tuihuosql,"results");

if($tuihuores){


    foreach ($tuihuores as $key => $value) {
        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 9 WHERE `id` = " . $value['id']);
        $ret = $dsql->dsqlOper($sql, "update");
    }
}

/*自动关闭退款*/
if(empty($customofftuikuan)){
    $customofftuikuan = 1;
}

$offtuikuanday = (int)$customofftuikuan * 24 * 3600;

$offtuikuansql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `orderstate` = 9  AND `is_paytuikuanlogtic` = 0");

$offtuikuanres = $dsql->dsqlOper($offtuikuansql,"results");

if($offtuikuanres){


    foreach ($offtuikuanres as $key => $value) {
        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 6  WHERE `id` = " . $value['id']);
        $ret = $dsql->dsqlOper($sql, "update");
    }
}



