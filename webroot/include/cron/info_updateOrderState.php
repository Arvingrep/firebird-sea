<?php if(!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 定时更新二手订单状态
 *
 *
 * @version        $Id: info_updateOrderState.php 2016-06-16 下午13:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT `id`, `exp-date` FROM `#@__info_order` WHERE `orderstate` = 3");

$ret = $dsql->dsqlOper($sql, "results");

if($ret){
    foreach ($ret as $value){
        $diff = ($time - $value['exp-date']) / 86400;
        $diff = ceil($diff);
        if($diff >= 3){
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 4 WHERE `id` = " . $value['id']);
            $dsql->dsqlOper($sql, "update");
        }
    }
}

