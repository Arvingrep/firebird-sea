<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 商城定时更新商城订单状态
 *
 * 1. 检查活动是否结束，如果结速则更新订单状态为已关闭
 * 2. 如果库存不足，则更新更新订单状态为已关闭
 *
 * @version        $Id: shop_updateOrderState.php 2016-06-16 下午13:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());
$sql = $dsql->SetQuery("SELECT o.`id` FROM `#@__shop_order` o LEFT JOIN `#@__shop_order_product` op ON op.`orderid` = o.`id` LEFT JOIN `#@__shop_product` p ON p.`id` = op.`proid` WHERE o.`orderstate` = 0 AND ((find_in_set(3, p.`flag`) AND p.`btime` != 0 AND p.`etime` != 0 AND p.`etime` < $time) OR (p.`inventory` - op.`count` < 0))");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 10, `inventory` = `inventory` + 1 WHERE `id` = ".$value['id']);
        $dsql->dsqlOper($sql, "update");
    }
}
