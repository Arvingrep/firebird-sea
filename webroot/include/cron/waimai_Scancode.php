<?php
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖定时更新订单状态
 *
 * 半小时未支付的订单，更新状态为：6，取消支付
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

$time = GetMkTime(time()) - 60 * 60 * 24;

$sql    = $dsql->SetQuery("SELECT `uid`,`ordernum`,`amount`,`ordertype`,`id`  FROM  `#@__waimai_order_all` WHERE (`state` = 2 or `state` = 3) AND `paydate` !=0 AND `pubdate` <= $time AND `ordertype` = 1");
$result = $dsql->dsqlOper($sql,"results");


if($result && is_array($result)) {

    foreach ($result as $k => $v) {

        $fenxiaoarr = array(
            'uid'       => $v['uid'],
            'ordernum'  => $v['ordernum'],
            'amount'    => $v['amount'],
            'ordertype' => $v['ordertype']
        );

        if($v['state'] == 3 || $v['state'] == 4 || $v['state'] == 5 ) {

            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 1, `okdate` = '" . GetMkTime(time()) . "' WHERE  `id` =" . $v['id']);
            $ret = $dsql->dsqlOper($sql, "update");

            if ($ret == "ok") {
                getwaimai_staticmoney('1', $v['id'], $fenxiaoarr);
            }
        }
    }
}