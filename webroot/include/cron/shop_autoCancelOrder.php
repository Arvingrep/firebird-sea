<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖定时更新订单状态
 *
 * 半小时未支付的订单，更新状态为：10，取消支付
 *
 *
 * @version        $Id: waimai_updateOrderState.php 2016-12-09 下午17:18:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $cfg_timeZone;

$time51 = $cfg_timeZone * -1;
@date_default_timezone_set('Etc/GMT'.$time51);

$time = GetMkTime(time()) - 1800;

$sql = $dsql->SetQuery("SELECT `usequan`  FROM  `#@__shop_order` WHERE `state` = 0 AND `pubdate` < $time AND `usequan`!= 0");
$result = $dsql->dsqlOper($sql,"results");
foreach ($result as $k => $v) {
    $sql = $dsql->SetQuery("UPDATE `#@__shop_quanlist` SET `state` = 0,`usedate` = 0 WHERE `id` = " .$v['usequan']);
    $dsql->dsqlOper($sql, "update");
}

$sql = $dsql->SetQuery("SELECT * FROM `#@__shop_order` WHERE `state` = 0 AND `pubdate` < $time");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){

    $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `state` = 10 WHERE `state` = 0 AND `pubdate` < $time");
    $dsql->dsqlOper($sql, "update");

}
