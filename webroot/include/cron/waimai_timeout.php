<?php
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖超时推送提醒
 * 
 * @version        $Id: waimai_timeout.php 2016-12-09 下午17:18:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $dsql;
global $cfg_basedomain;

$nowTime = GetMkTime(time());

//因为新增了订单预定逻辑，所以计算出餐超时时，需要区分，普通订单，以付款时间为标准计算，预定订单，以预定配送时间为标准计算，提前5分钟进行提醒，提醒时将状态更新，后续不再提醒
$chucansql = $dsql->SetQuery("SELECT o.`id`,o.`sid`,o.`ordernumstore`,s.`shopname` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE (o.`state` = 3 OR  o.`state` = 4)  AND s.`del` = 0 AND o.`pushed_timeout` = 0 AND ((o.`reservesongdate` = 0 AND (('$nowTime' - o.`paydate`)/60 + 5) > s.`chucan_time`) OR (o.`reservesongdate` > 0 AND (('$nowTime' - (o.`reservesongdate` - s.`delivery_time`*60))/60 + 5) > s.`chucan_time`))");
$result = $dsql->dsqlOper($chucansql, "results");
if ($result != null && is_array($result)) {
    foreach ($result as $key => $value) {
        //查询商家会员ID
        $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = ".$value['sid']);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret != null && is_array($ret)) {
            $shopUserid = $ret[0]['userid'];

            //初始化日志
            $day = date("Ymd");
            mkdir(HUONIAOROOT.'/log/waimai_timeout/'.$day, 0777, true);
            require_once HUONIAOROOT."/api/payment/log.php";
            $waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/waimai_timeout/'.$day.'/'.date('H').'.log');

            //先更新推送状态
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `pushed_timeout` = 1 WHERE `id` = ".$value['id']);
            $dsql->dsqlOper($sql, "update");

            $waimaiLog->DEBUG("订单(ID：".$value['id'].")出餐即将超时，进行消息推送！\r\n");

            //推送消息
            $businessOrderUrl = $cfg_basedomain . "/wmsj/order/waimaiOrderDetail.php?id=" . $value['id'];
            sendapppush($shopUserid, "您的订单即将超时，请尽快出餐！", "订单号：".$value['shopname'] . $value['ordernumstore'], $businessOrderUrl, "readymealtimeout");

            $waimaiLog->DEBUG("订单(ID：".$value['id'].")出餐即将超时，消息推送成功！\r\n");
        }
    }
}

//配送超时，提前5分钟进行提醒，提醒时将状态更新，后续不再提醒
$peisongsql = $dsql->SetQuery("SELECT o.`id`,o.`peisongid`,o.`ordernum` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 5 AND o.`courier_pushed_timeout` = 0 AND o.`peisongid` > 0 AND s.`del` = 0 AND (('$nowTime' - o.`peidate`)/60 + 5) > s.`delivery_time`");
$result = $dsql->dsqlOper($peisongsql, "results");
if ($result != null && is_array($result)) {
    foreach ($result as $key => $value) {
        //初始化日志
        $day = date("Ymd");
        mkdir(HUONIAOROOT.'/log/waimai_timeout/'.$day, 0777, true);
        require_once HUONIAOROOT."/api/payment/log.php";
        $waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/waimai_timeout/'.$day.'/'.date('H').'.log');

        //先更新推送状态
        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `courier_pushed_timeout` = 1 WHERE `id` = ".$value['id']);
        $dsql->dsqlOper($sql, "update");

        $waimaiLog->DEBUG("订单(ID：".$value['id'].")配送即将超时，进行消息推送！\r\n");

        //推送消息
        $businessOrderUrl = $cfg_basedomain . "/index.php?service=waimai&do=courier&template=detail&id=" . $value['id'];
        sendapppush($value['peisongid'], "您的订单即将超时，请尽快配送！", "订单号：".$value['ordernum'], $businessOrderUrl, "deliverytimeout");

        $waimaiLog->DEBUG("订单(ID：".$value['id'].")配送即将超时，消息推送成功！\r\n");
    }
}