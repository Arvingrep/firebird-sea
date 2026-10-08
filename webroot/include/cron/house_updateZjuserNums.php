<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 更新中介公司房源数量
 *
 *
 * @version        $Id: house_updateZjuserNums.php 2016-11-4 上午9:54:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `uid` FROM `#@__house_distributor_company_user` where `status`=1");
$ret = $dsql->dsqlOper($sql, "results");
if ($ret) {
	foreach ($ret as $key => $value) {
		$sql = $dsql->SetQuery("SELECT count(`id`) AS countSale FROM `#@__house_property_listing` WHERE `property_type` IN (2,3) AND (`creator_uid`={$value['uid']} OR `maintainer_uid`={$value['uid']}) AND `audit_status`=1  AND `listing_nature`=2 AND `is_deleted`=0 AND `is_invalid`=0 AND `waitpay`=0");
		$counts = (int)$dsql->getOne($sql);

		$sql = $dsql->SetQuery("UPDATE `#@__house_distributor_company_user` SET `counts` = '$counts' WHERE `id` = " . $value['id']);
		$dsql->dsqlOper($sql, "update");
	}
}
