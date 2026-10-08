<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 删除30分钟内未付款的订单
 *
 * @version        $Id: shop_autoReceipt.php 2016-09-28 下午14:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

global $cfg_timeZone;

$time51 = $cfg_timeZone * -1;
@date_default_timezone_set('Etc/GMT'.$time51);

$time = GetMkTime(time()) - 1800;

/*删除订单*/
$quanSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_order` WHERE `orderstate` = 0 AND `orderdate` < $time ");
$dsql->dsqlOper($quanSql, "update");

/*删除未付款拼团信息*/

$pinSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_pin` WHERE `state` = 0 AND `pubdate` < $time ");
$dsql->dsqlOper($pinSql, "update");