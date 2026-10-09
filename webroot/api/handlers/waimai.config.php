<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖模块公共配置文件
 *
 * @version        $Id: zhaopin.config.php 2025-03-24$
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2050, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
//同步外卖店铺销量
if (!function_exists('syncShopSales')){
    function syncShopSales($sid) {
        if(!$sid) return;

        global $dsql;
        
        //按订单量统计
        // $sql = $dsql->setQuery("select count(`id`) totalCount from `#@__waimai_order_all` where `state` = 1 and `sid`={$sid}");
        // $orders= $dsql->dsqlOper($sql, 'results');
        // $total = 0;
        // if(is_array($orders) && count($orders)>0){
        //     $total = $total + $orders[0]['totalCount'];
        // }
        
        //按商品销量统计
        $sql = $dsql->setQuery("select `id`, `food` from `#@__waimai_order_all` where `state` = 1 and `sid`={$sid}");
        $orders= $dsql->dsqlOper($sql, 'results');
        $total = 0;
        if(is_array($orders) && count($orders)>0){
            foreach($orders as $order){
                $foods = unserialize($order['food']);
                $count = 0;
                if(is_array($foods)){
                    foreach($foods as $food){
                        $count = $count + $food['count'];
                    }
                }
                $total = $total + $count;
            }
        }
  
        //更新数据
        if($total){
            $sql = $dsql->setQuery("UPDATE `#@__waimai_shop` SET `sale`={$total} where `id` ={$sid}");
            $dsql->dsqlOper($sql, "update");
        }
    }
}

//更新外卖店铺订单完成数量
if (!function_exists('updateShopSales')){
    function updateShopSales($sid, $ordernum) {
        if(!$sid) return;
        global $dsql;
        //获取文件上次执行的时间
 
        $sql = $dsql->setQuery("select `id`, `food` from `#@__waimai_order_all` where `state` = 1 and `sid`={$sid} and `ordernum`='$ordernum'");
        $orders= $dsql->dsqlOper($sql, 'results');
        $total = 0;
        if(is_array($orders) && count($orders)>0){
            foreach($orders as $order){
                $foods = unserialize($order['food']);
                $count = 0;
                if(is_array($foods)){
                    foreach($foods as $food){
                        $count = $count + $food['count'];
                    }
                }
                $total = $total + $count;
            }
        }
  
        //更新数据
        if($total){
            $sql = $dsql->setQuery("UPDATE `#@__waimai_shop` SET `sale` = sale+{$total} where `id` ={$sid}");
            $dsql->dsqlOper($sql, "update");
        }
    }
}

//更新外卖店铺好评值 总分支5分
if (!function_exists('updateShopStar')){
    function updateShopStar($sid) {
        if(!$sid) return;

        global $dsql;
        $sql = $dsql->setQuery("SELECT avg(`star`) FROM `#@__waimai_common` WHERE `sid` = {$sid}");
        $total = $dsql->getOne($sql);
        $star = $total ? $total : 5; //无评分默认先给5分
        //更新数据
        $sql = $dsql->setQuery("UPDATE `#@__waimai_shop` SET `star`={$star} where `id` ={$sid}");
        $dsql->dsqlOper($sql, "results");
    }
}