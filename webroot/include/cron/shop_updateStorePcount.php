<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 一键更新商家发布商品的数量字段
 *
 * @version        $Id: shop_updateStorePcount.php 2024-02-28 上午10:26:19 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2023, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

global $handler;
$handler = true;

$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

	$configHandels = new handlers("shop", "updateStorePcount");

	foreach ($ret as $key => $value) {
		$configHandels->getHandle(array("store" => $value['id']));
	}
}
