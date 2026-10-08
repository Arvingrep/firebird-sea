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

if(empty($customconfirmDay)){
    $customconfirmDay = 1;
}
//3天内
$day = (int)$customconfirmDay * 24 * 3600;
$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__shop_order` WHERE `orderstate` = 6 AND `protype` = 0 AND ((`shipping` = 2 AND `confirmdate` > 0 AND ($time - `confirmdate` > $day)) OR (`shipping` = 1 AND `exp_date` > 0 AND ($time - `exp_date` > $day)))");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

    //初始化日志
    require_once HUONIAOROOT."/api/payment/log.php";
    $_shop_autoRefundLog= new CLogFileHandler(HUONIAOROOT.'/log/shop_autoReeipt/'.date('Y-m-d').'.log', true);
    $_shop_autoRefundLog->DEBUG($sql);
    $_shop_autoRefundLog->DEBUG(json_encode($ret));

	$configHandels = new handlers("shop", "receipt");

	foreach ($ret as $key => $value) {
		global $autoReceiptUserID;
		$autoReceiptUserID = $value['userid'];

		$moduleConfig  = $configHandels->getHandle(array("id" => $value['id']));

	}
}


//商家拒绝退款后，在指定时间内自动关闭退款
$closetuikuanday = (int)$customclosetuikuanday;
$sql = $dsql->SetQuery("SELECT o.`id`, o.`userid`, op.`ret_negotiate` FROM `#@__shop_order` o LEFT JOIN `#@__shop_order_product` op ON op.`orderid` = o.`id` WHERE o.`orderstate` = 6 AND o.`ret_state` = 1 AND op.`ret_audittype` = 1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

    //初始化日志
    require_once HUONIAOROOT."/api/payment/log.php";
    $_shop_autoRefundLog= new CLogFileHandler(HUONIAOROOT.'/log/shop_autoClose/'.date('Y-m-d').'.log', true);
    $_shop_autoRefundLog->DEBUG($sql);
    $_shop_autoRefundLog->DEBUG(json_encode($ret));

    $configHandels = new handlers("shop", "receipt");
    foreach($ret as $key => $val){
        $orderid = $val['id'];
        $userid = $val['userid'];
        $ret_negotiate = unserialize($val["ret_negotiate"]);
        if(is_array($ret_negotiate)){
            $lastdate = (int)($ret_negotiate['refundinfo'][count($ret_negotiate['refundinfo'])-1]['datetime'] + $closetuikuanday * 3600 * 24);

            $_shop_autoRefundLog->DEBUG($time . '-' . $lastdate . '-' . $closetuikuanday);

            //已经超时的，自动确认收货
            if($time > $lastdate){
                global $autoReceiptUserID;
                $autoReceiptUserID = $userid;

                $moduleConfig  = $configHandels->getHandle(array("id" => $orderid));
            }
        }
    }
}