<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 新房产房源 计划任务
 */

$time = GetMkTime(time());
$time30 = $time - 30 * 86400;

//新房产房源 30天未操作二手经纪人维护的房源资料进入失效状态
$sql = $dsql->SetQuery("UPDATE `#@__house_property_listing` SET `is_invalid` = 1, `invalid_time` = $time WHERE `property_type`=2 AND `listing_nature`=2 AND `last_operation_time` < $time30 AND `audit_status`=1 AND `is_deleted`=0 AND `is_invalid`=0");
$dsql->dsqlOper($sql, "update");