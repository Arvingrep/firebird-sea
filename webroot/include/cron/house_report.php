<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 新房产分销报备相关计划任务
 */

$time = GetMkTime(time());

//报备有效期 超出有效期未带看 报备失效
$sql = $dsql->SetQuery("UPDATE `#@__house_distributor_report` SET `invalid_type`=3, `invalid_time` = $time WHERE `end_time` != 0 AND `end_time` < $time AND `status`=2 AND `invalid_time` =0");
$dsql->dsqlOper($sql, "update");

//带看保护时间  超出有效期未成交或认购 报备无效
$sql = $dsql->SetQuery("UPDATE `#@__house_distributor_report` SET `invalid_type`=5, `invalid_time` = $time WHERE `end_time` != 0 AND `end_time` < $time AND `status`=4 AND `invalid_time` =0");
$dsql->dsqlOper($sql, "update");

//任意进度失效-根据报备号码类型将客户入内部池
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_distributor_report` where `invalid_type` > 0 AND `invalid_time` = $time");
$reportIds = $dsql->getArr($sql);
require(HUONIAOROOT."/api/handlers/house/marketing.config.php");
afterInvalid($reportIds);