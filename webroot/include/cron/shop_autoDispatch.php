<?php
if(!defined('HUONIAOINC')) exit('Request Error!');
// require_once(dirname(__FILE__).'/../common.inc.php');
/**
 * 商城自动派单
 *
 * 规则：
 * 1. 自动分配所有已确认的订单
 * 2. 按照骑手离商家位置最近并且手上没有订单时优先派送
 * 3. 如果骑手手上有订单，则将新订单分派给其他骑手
 *
 * @version        $Id: shop_autoDispatch.php 2019-8-23 下午16:55:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$file = HUONIAOINC . "/config/shop.inc.php";
if(file_exists($file)){
    include HUONIAOINC . "/config/shop.inc.php";
}

global $maxCount;
global $maxJuli;

$maxCount = empty($custom_autoDispatchCount) ? 5 : $custom_autoDispatchCount;
$maxJuli = empty($custom_autoDispatchJuli) ? 2 : $custom_autoDispatchJuli;

include_once HUONIAOROOT."/api/handlers/siteConfig.class.php";

//派单前的计算
function autoDispatch(){
    global $dsql;
    $treeArr = array();
    // $siteConfigService = new siteConfig();
    // $cityArr = $siteConfigService->siteCity();
    //
    // if(!$cityArr){
    //     $cityArr = array(
    //         0 => array(
    //             "cid" => 0
    //         ),
    //     );
    // }
    //
    //
    //
    // foreach ($cityArr as $cityInfo) {
    //
    //     $cityid = $cityInfo['cid'];
    //
    //     if($cityid){
    //         $where = " AND s.`cityid` = ".$cityid;
    //     }else{
    //         $where = "";
    //     }

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`branchid`, s.`cityid`, s.`lng` coordX, s.`lat` coordY, b.`lng` branchlng, b.`lat` branchlat FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE o.`orderstate` = 6 AND s.`distribution` = 1 AND `ret_state` = 0 AND o.`peisongid` = 0 AND `protype` =0 AND o.`shipping` = 0");
        $orderArr = $dsql->dsqlOper($sql, "results");
        foreach ($orderArr as $key => $value) {

            //查询骑手信息
            $sql = $dsql->SetQuery("SELECT c.`id`, c.`lng`, c.`lat` FROM `#@__waimai_courier` c WHERE c.`state` = 1 AND c.`lat` != '0.0' AND c.`lng` != '0.0' AND c.`status` = 1 AND c.`quit` = 0 AND c.`cityid` = " . $value['cityid']);
            $courierArr = $dsql->dsqlOper($sql, "results");

            $coordX = $coordY = '';
            if(!empty($value['branchid'])){
                $coordX = $value['branchlng'];
                $coordY = $value['branchlat'];
            }else{
                $coordX = $value['coordX'];
                $coordY = $value['coordY'];
            }
            foreach ($courierArr as $k => $v) {
                array_push($treeArr, array(
                    "courierID"  => $v['id'],
                    "courierLng" => $v['lng'],
                    "courierLat" => $v['lat'],
                    "orderID"    => $value['id'],
                    "shopLng"    => $coordX,
                    "shopLat"    => $coordY,
                    "juli"       => getDistance($v['lng'], $v['lat'], $coordY, $coordX)
                ));
            }
        }

        //将相同订单号的数组拼接
        $newArr = array();
        foreach ($treeArr as $key => $value) {
            if(!$newArr[$value['orderID']]){
                $newArr[$value['orderID']] = array();
            }
            array_push($newArr[$value['orderID']], $value);
        }
        //将相同订单的数组分配给最合适的骑手
        foreach ($newArr as $key => $value) {
            autoDispatchCourier($value);
        }

    // }

}


//派单给骑手
function autoDispatchCourier($arr){
    global $dsql;

    if($arr){
        $oArr = array();
        $time = GetMkTime(time());
        //这次主要计算骑手当前手上有多少订单
        foreach ($arr as $key => $value) {
            $sql = $dsql->SetQuery("SELECT count(`id`) count FROM `#@__shop_order` WHERE `orderstate` = 6 AND `ret_state` = 0 AND `shipping` = 0 AND `peisongid` = " . $value['courierID']);
            $ret = $dsql->dsqlOper($sql, "results");
            $value['orderCount'] = $ret[0]['count'];
            array_push($oArr, $value);
        }

        $kindex = 0;
        $currArr = $oArr[0];
        if(count($oArr) > 1){
            foreach ($oArr as $key => $value) {
                /*判断该骑手是否是当前分站*/
                $storecityidsql = $dsql->SetQuery("SELECT s.`cityid` scityid,b.`cityid` bcityid,o.`branchid` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store`s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid`  WHERE o.`id` = '".$value['orderID']."' AND s.`distribution` = 1");

                $storecityidres = $dsql->dsqlOper($storecityidsql,"results");
                $sotrecityid    = 0;
                if($storecityidres ){
                    $sotrecityid = $storecityidres[0]['branchid']? $storecityidres[0]['bcityid']: $storecityidres[0]['scityid'];
                }
                $couriersql     = $dsql->Setquery("SELECT `cityid` FROM `#@__waimai_courier` WHERE `id` = '".$value['courierID']."'");
                $courierres     = $dsql->dsqlOper($couriersql,'results');
                $couriercityid   = (int)$courierres[0]['cityid'];
                if($key > 0 && ($value['juli'] < $currArr['juli'] && ($value['orderCount'] < $currArr['orderCount'] || $value['orderCount'] == 0)) && $sotrecityid == $couriercityid){
                    $kindex = $key;
                    $currArr = $value;
                }
            }
        }



        //每个配送员最多分配5个订单，并且是2公里范围以内的订单 12865530
        global $maxCount;
        global $maxJuli;
        $storecityidsql = $dsql->SetQuery("SELECT s.`cityid` scityid,b.`cityid` bcityid,o.`branchid` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store`s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid`  WHERE o.`id` = '".$currArr['orderID']."'");

        $storecityidres = $dsql->dsqlOper($storecityidsql,"results");
        $sotrecityid    = 0;
        if($storecityidres ){
            $sotrecityid = $storecityidres[0]['branchid']? $storecityidres[0]['bcityid']: $storecityidres[0]['scityid'];
        }
        $couriersql     = $dsql->Setquery("SELECT `cityid` FROM `#@__waimai_courier` WHERE `id` = '".$currArr['courierID']."'");
        $courierres     = $dsql->dsqlOper($couriersql,'results');
        $couriercityid   = (int)$courierres[0]['cityid'];
        if($currArr['orderCount'] < $maxCount && $currArr['juli'] < ($maxJuli * 10000000) && $sotrecityid == $couriercityid){//1000
            $courier = $currArr['courierID'];
            $orderid = $currArr['orderID'];
            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `peisongid` = '$courier', `peidate` = '$time' WHERE `peisongid` = 0 AND `id` = $orderid");
            $ret = $dsql->dsqlOper($sql, "update");

            if($ret == "ok"){

                sendapppush($courier, "您有新的配送订单", "点击查看", "", "newfenpeiorderShop");

                //消息通知用户
                $sql_ = $dsql->SetQuery("SELECT o.`orderdate`, o.`branchid`, o.`userid`, o.`amount`, o.`store`, o.`ordernum`, o.`peisongid`, o.`peisongidlog`, o.`logistic` freight, s.`title` shopname, b.`title` branchshopname, c.`name`, c.`phone` FROM `#@__shop_order` o LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid` LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE o.`id` = '$orderid'");

                $ret_ = $dsql->dsqlOper($sql_, "results");
                if($ret_){
                    $data = $ret_[0];

                    $uid           = $data['userid'];
                    $ordernum      = $data['ordernum'];
                    $orderdate     = $data['orderdate'];
                    $amount        = $data['amount'];
                    $shopname      = $data['branchid'] ? $data['branchshopname'] : $data['shopname'];
                    $name          = $data['name'];
                    $phone         = $data['phone'];

                    $sql = $dsql->SetQuery("SELECT o.`count`, s.`title` FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_product` s ON s.`id` = o.`proid` WHERE o.`orderid` = '$orderid'");
					$ret = $dsql->dsqlOper($sql, "results");
					$foods = array();
                    foreach ($ret as $k => $v) {
                        array_push($foods, $v['title'] . " " . $v['count'] . "份");
                    }

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "shop",
                        "id"       => $orderid
                    );

                    //自定义配置
                    $config = array(
                        "ordernum" => $shopname.$ordernum,
                        "orderdate" => date("Y-m-d H:i:s", $orderdate),
                        "orderinfo" => join(" ", $foods),
                        "orderprice" => $amount,
                        "peisong" => $name . "，" . $phone,
                        "fields" => array(
                            'keyword1' => '订单号',
                            'keyword2' => '订单详情',
                            'keyword3' => '订单金额',
                            'keyword4' => '配送人员'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单配送提醒", $param, $config);
                }

            }

        }else{
            array_splice($arr, $kindex, 1);
            autoDispatchCourier($arr);
        }

    }
}


autoDispatch();







/**
 * 二维数组根据字段进行排序
 * @params array $array 需要排序的数组
 * @params string $field 排序的字段
 * @params string $sort 排序顺序标志 SORT_DESC 降序；SORT_ASC 升序
 */
 function arraySequence($array, $field, $sort = 'SORT_DESC'){
    $arrSort = array();
    foreach ($array as $uniqid => $row) {
        foreach ($row as $key => $value) {
            $arrSort[$key][$uniqid] = $value;
        }
    }
    array_multisort($arrSort[$field], constant($sort), $array);
    return $array;
}
