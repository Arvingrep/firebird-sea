<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 活动发起没有成功，系统自动取消
 *
 * @version        $Id: shop_autoReceipt.php 2016-09-28 下午14:19:15 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
require(dirname(__FILE__).'/../config/awardlegou.inc.php');
global $handler;
$handler = true;

if(!empty($customCanceltime)){
    $time = GetMkTime(time());
    $canceltime =  GetMkTime(time()) - (int)$customCanceltime * 3600;
    $pinsql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE `state` = 1 AND `pubdate` <= '$canceltime' ");
    $pinres = $dsql->dsqlOper($pinsql,"results");
    if ($pinres){
        $pinresid = array_column($pinres,'id');
        $pinid = join(',',$pinresid);


        $updatesql  = $dsql->SetQuery("DELETE FROM `#@__awardlegou_pin` WHERE find_in_set(`id`,'$pinid') ");
        $pinres     = $dsql->dsqlOper($updatesql,"results");

        $pinsql = $dsql->SetQuery("SELECT `id` orderid FROM `#@__awardlegou_order` WHERE  `orderstate` = 1  AND find_in_set(`pinid`,'$pinid')");
        $pinres = $dsql->dsqlOper($pinsql,"results");

        $configHandels = new handlers("awardlegou", "refundPay");
        if($pinres){
            foreach ($pinres as $k => $v){
                $moduleConfig  = $configHandels->getHandle(array("id" => $v['orderid']));
            }

        }
    }


}

