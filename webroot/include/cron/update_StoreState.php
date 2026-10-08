<?php
if(!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 商家套餐过期更新店铺状态
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

$time = GetMkTime(time());
$sql = $dsql->SetQuery("SELECT `uid`,`package` FROM  `#@__business_list` WHERE `package` !='' AND `state` = 1");

$res = $dsql->dsqlOper($sql,"results");

global $cfg_BusinessJoinConfig;
$businessJoinConfig = $cfg_BusinessJoinConfig;


/*套餐内容模块*/
if($res && is_array($res)){
    foreach ($res as $index => $res) {
        $expiredarr = $joinModuel = array();
        $memberPackage = unserialize($res['package']);
        if($memberPackage && is_array($memberPackage)){

            if($memberPackage['expired'] < $time || $memberPackage['expired'] == 0){

                if($memberPackage['package'] > -1) {
                    $packageArr = $businessJoinConfig['package'][$memberPackage['package']];

                    /*已过期模块*/
                    $joinModuel = $packageArr['list'] != '' ? explode(',', $packageArr['list']) : array();

                }else{
                    $joinModuel = array();
                }


                $item = $memberPackage['item'];
                if($item && is_array($item)){

                    foreach ($item as $k => $v) {
                        if($v['expired'] > $time){

                            $sub = array_search($v['name'],$joinModuel);

                            if($sub){
                                unset($joinModuel[$sub]);
                            }
                        }else{
                            if(!in_array($v['name'],$joinModuel)){
                                array_push($joinModuel,$v['name']);
                            }
                        }
                    }
                }
            }
        }else{
            $joinModuel = array();
        }

        if($joinModuel){
            storeUpdateState($res['uid'],0,$joinModuel);
        }else{
            updateStorePrivilege($res['uid']);
        }
    }
}