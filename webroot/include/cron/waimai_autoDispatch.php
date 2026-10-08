<?php
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖自动派单
 *
 * 规则：
 * 1. 自动分配所有已确认的订单
 * 2. 按照骑手离商家位置最近并且手上没有订单时优先派送
 * 3. 如果骑手手上有订单，则将新订单分派给其他骑手
 *
 * @version        $Id: waimai_autoDispatch.php 2017-6-8 下午16:55:10 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */

$file = HUONIAOINC . "/config/waimai.inc.php";
if(file_exists($file)){
    include HUONIAOINC . "/config/waimai.inc.php";
}

global $maxCount;
global $maxJuli;
global $custom_otherpeisong;

$maxCount = empty($custom_autoDispatchCount) ? 5 : $custom_autoDispatchCount;
$maxJuli = empty($custom_autoDispatchJuli) ? 2 : $custom_autoDispatchJuli;
$otherpeisong = (int)$custom_otherpeisong;


include_once HUONIAOROOT."/api/handlers/siteConfig.class.php";

global $open_log;
$open_log = true;
//
// global  $userLogin;
// $adminIds = $userLogin->getAdminIds();
// $adminIds = empty($adminIds) ? 0 : $adminIds;
// $adminCityIds = $userLogin->getAdminCityIds();
// $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;
// if($userType != 3){
//     $adminCityIds .= ',0';
// }
//
// $where = " AND `cityid` in (0,$adminCityIds)";
if($open_log){
    $day = date("Ymd");
//    mkdir(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day, 0777, true);
    //初始化日志
    require_once HUONIAOROOT."/api/payment/log.php";
    $_autoDispatch_waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day.'/'.date('H').'.log',true);

    $_autoDispatch_waimaiLog->DEBUG("======== start ========\r\n");
}

$time = GetMkTime(time());

$sql = $dsql->SetQuery("SELECT * FROM `#@__dispatch_warning` WHERE `module` = 'waimai' ORDER BY `id` DESC LIMIT 0, 1");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    // 如果距离上次爆单提醒不足3分钟，不往下执行
    $timeLimit = true;
    if($timeLimit && $ret[0]['state'] == 0 && (($time - $ret[0]['pubdate']) >= 180)){

        //查询订单信息,如果所有订单已分配，解除警报
        $sql = $dsql->SetQuery("SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 3 AND s.`merchant_deliver` = 0 AND o.`selftime` = 0 AND o.`ordertype` = 0");
        $count = $dsql->dsqlOper($sql, "totalcount");
        if($count == 0){
            dispatchDanger();
        }

        // 删除一个星期之前的提醒
        $sql = $dsql->SetQuery("DELETE FROM `#@__dispatch_warning` WHERE `pubdate` < ($time - 3600 * 24 * 7)");
        $dsql->dsqlOper($sql, "update");

        if($open_log){
            $_autoDispatch_waimaiLog->DEBUG("推迟派单\r\n");
        }
        return;
    }
}

global $orderArr;
global $courierArr;
global $orderFilter;
global $courierFilter;

$orderArr = array();
$courierArr = array();
$orderFilter = array();
$courierFilter = array();

//派单前的计算 $juliLimitCancel:取消距离限制
function autoDispatch($juliLimitCancel = false){
    global $dsql;
    global $open_log;
    global $maxCount;
    global $maxJuli;
    global $orderArr;
    global $courierArr;
    global $orderFilter;
    global $courierFilter;
    global $_autoDispatch_waimaiLog;
    global $otherpeisong;

    if($open_log){
        $day = date("Ymd");
        mkdir(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day, 0777, true);
        //初始化日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_autoDispatch_waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day.'/'.date('H').'.log');

    }

    $time = GetMkTime(time());

    $warningOrderList = array();    //爆单id;
    $where = " AND `quit` = 0 AND `status` = 1";
    if(!$orderArr){
        //查询订单信息
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`lng`, o.`lat`, s.`coordX`, s.`coordY`, s.`peisong_type` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 3 AND o.`ordertype` = 0 AND s.`merchant_deliver` = 0 AND o.`selftime` = 0");

        $orderArr = $dsql->dsqlOper($sql, "results");

        if(!$orderArr) return;
    }
    if(!$courierArr){
        //查询5单以内的骑手信息及订单量，按单量从低到高排序
        $sql = $dsql->SetQuery("SELECT c.`id`, c.`name`, c.`lng`, c.`lat`, (SELECT count(o.`id`) FROM `#@__waimai_order_all` o WHERE (o.`state` = 4 OR o.`state` = 5) AND o.`peisongid` = c.`id` AND o.`ordertype` = 0 ) count FROM `#@__waimai_courier` c WHERE c.`state` = 1 ".$where."  ORDER BY `count` ASC");
        $courierArr = $dsql->dsqlOper($sql, "results");

        // 过滤掉距上次派单3分钟内的骑手
        foreach ($courierArr as $key => $value) {

            $sql = $dsql->SetQuery("SELECT `peidate` FROM `#@__waimai_order_all` WHERE (`state` = 4 OR `state` = 5) AND `ordertype` = 0 AND `peisongid` = ".$value['id']."  ORDER BY `id` DESC LIMIT 0,1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                if($value['count'] >= $maxCount || $ret[0]['peidate'] + 180 > $time){
                    unset($courierArr[$key]);
                }

            }
        }
    }


//     print_r($orderArr);
//     echo "<hr>";
//     print_r($courierArr);
//     die;

    foreach ($orderArr as $o_k => $o_v) {

        $oid    = $o_v['id'];
        $coordY = $o_v['coordY'];
        $coordX = $o_v['coordX'];
        $olng   = $o_v['lng'];
        $olat   = $o_v['lat'];
        $uid    = $o_v['uid'];
        $peisong_type = $o_v['peisong_type'];  //0默认  1平台自己配送

        if(!$peisong_type && $otherpeisong) continue;  //如果该店铺是默认配送方式，并且外卖设置中使用了第三方平台配送，则自动派单将不需要执行

        if(in_array($oid, $orderFilter)) continue;

        $courierArr_none = array();     // 没有订单的骑手
        $courierArr_small = array();    // 2单以内的骑手
        $courierArr_middle = array();   // 2-5单的骑手
        $courierArr_large = array();    // 5单及以上的骑手
        foreach ($courierArr as $c_k => $c_v) {
            $cid = $c_v['id'];
            $count = $c_v['count'];
            $lng = $c_v['lng'];
            $lat = $c_v['lat'];
            $name = $c_v['name'];

            //没有坐标的，不参与派单
            if(!$lng || !$lat) continue;

            if(in_array($cid, $courierFilter)){
                unset($courierArr[$c_k]);
                continue;
            }



            // 骑手到商家的距离
            if(isset($courierArr[$c_k]['distance'][$oid])){
                $distance = $courierArr[$c_k]['distance'][$oid];
            }else{

                $distance = getDistance($lat, $lng,$coordY, $coordX);
                if(isset($courierArr[$c_k]['distance'])){
                    $courierArr[$c_k]['distance'][$oid] = $distance;
                }else{
                    $courierArr[$c_k]['distance'] = array(
                        $oid => $distance
                    );
                }
                // $courierArr['distance'][$oid] = $distance;
            }

            if($open_log){
                $log = "cid: ".$cid.";name: ".$name."; count: ".$count."; distance: ".$distance;
                $_autoDispatch_waimaiLog->DEBUG("骑手:" . $log . "\r\n");
            }

            // 限制距离之内/不限制距离
            if((!$juliLimitCancel && $distance <= $maxJuli * 1000) || $juliLimitCancel){

                /*判断骑手和店铺cityid是否一致*/
                $judgestate = judgeCityid($oid,$cid);
                if($count == 0 && $judgestate ==1){
                    // echo $cid."-***-".$distance;die;
                    array_push($courierArr_none, array(
                        "cid" => $cid,
                        "distance" => $distance
                    ));
                    // }elseif($count <= 2){
                    //     array_push($courierArr_small, array(
                    //         "cid" => $cid,
                    //         "distance" => $distance
                    //     ));
                    // }elseif($count > 2 && $count < 5){
                }elseif($count < $maxCount && $judgestate ==1){
                    array_push($courierArr_middle, array(
                        "cid" => $cid,
                        "distance" => $distance
                    ));
                }elseif($count >= $maxCount && $judgestate ==1){
                    array_push($courierArr_large, array(
                        "cid" => $cid,
                        "distance" => $distance
                    ));
                }
            }

        }

        // 没有订单的骑手，分配给距离最近的
        if(count($courierArr_none) > 0){
            $courierArr_juli = arraySequence($courierArr_none, 'distance', 'SORT_ASC');

            /*判断骑手和店铺cityid是否一致*/
            $judgestate = judgeCityid($oid,$courierArr_juli[0]['cid']);
            if($judgestate == 0) {
                continue;
            }else{
                autoDispatchCourier($oid, $courierArr_juli[0]['cid'], 'none');
                continue;
            }
        }

        // 2单及以下订单的骑手
        if(count($courierArr_small) > 0){
            foreach ($courierArr_small as $key => $value) {

                // 计算从此时配送此订单的总距离
                $distance_to_shop = $value['distance'];
                $distance_to_user =  getDistance($olng, $olat,$coordY, $coordX);;

                if($distance_to_shop == 0 || $distance_to_user == 0){
                    unset($courierArr_small[$key]);
                    if($open_log){
                        if($distance_to_shop == 0){
                            $_autoDispatch_waimaiLog->DEBUG("获取距离失败1-1：骑手id->".$value['cid']."\r\n");
                        }else{
                            $_autoDispatch_waimaiLog->DEBUG("获取距离失败1-2：骑手id->".$value['cid']."\r\n");
                        }
                    }
                    continue;
                }

                $distance_total = $distance_to_shop + $distance_to_user;

                $courierArr_small[$key]['distance_total'] = $distance_total;
                $courierArr_small[$key]['distance_to_shop'] = $distance_to_shop;

            }
            if(count($courierArr_small) > 0){
                // 按总距离排序
                $courierArr_small_juli = arraySequence($courierArr_small, 'distance_total', 'SORT_ASC');

                // 第一和第二总距离相差在10米以内，再判断到店铺的距离
                $cid = $courierArr_small_juli[0]['cid'];
                $type = 'small';
                if(count($courierArr_small_juli) > 1){
                    if(abs($courierArr_small_juli[0]['distance_total'] - $courierArr_small_juli[1]['distance_total']) <= 10){
                        if($courierArr_small_juli[0]['distance_to_shop'] > $courierArr_small_juli[1]['distance_to_shop']){
                            $cid = $courierArr_small_juli[1]['cid'];
                            $type = 'small2';
                        }
                    }
                }
                /*判断骑手和店铺cityid是否一致*/
                $judgestate = judgeCityid($oid,$cid);
                if($judgestate ==0){
                    continue;
                }else{

                    autoDispatchCourier($oid, $cid, $type);
                    continue;
                }
            }
        }

        // 2-5个订单的骑手
        if(count($courierArr_middle) > 0){

            $i = 0;
            foreach ($courierArr as $k => $v) {
                if($i == 0){
                    $count_min = $v['count'];
                }elseif($i + 1 == count($courierArr)){
                    $count_max = $v['count'];
                }
                $i++;
            }

            // 单量相差达到2单，分配给单量少的骑手
            if($count_max - $count_min >= 2){
//                $courierArr_middle = array();
//                foreach ($courierArr as $key => $value) {
//                    if($value['count'] == $count_min){
//                        array_push($courierArr_middle, array(
//                            "cid" => $value['id'],
//                            "distance" => $value['distance'][$oid]
//                        ));
//                    }
//                }             打开注释会出现非本站的骑手排订单

                // 最小订单为0只需要比较距离当前店铺的距离，否则计算完成手上最后一个订单配送此订单的总距离
                if($count_min == 0){
                    $courierArr_middle_juli = arraySequence($courierArr_middle, 'distance', 'SORT_ASC');
                    $cid = $courierArr_middle_juli[0]['cid'];

                    /*判断骑手和店铺cityid是否一致*/
                    $judgestate = judgeCityid($oid,$cid);
                    if($judgestate ==0){
                        continue;
                    }else{
                        autoDispatchCourier($oid, $cid, '订单最少 min-'.$count_min.' max-'.$count_max);
                        continue;
                    }

                }
            }

            if(count($courierArr_middle) > 1){
                foreach ($courierArr_middle as $key => $value) {
                    // 计算从当前正在派送中订单完成时，配送此订单的总距离
                    // 计算从最后分配订单完成时，配送此订单的总距离
                    $sql = $dsql->SetQuery("SELECT `lng`, `lat` FROM `#@__waimai_order_all` WHERE (`state` = 5) AND `ordertype` = 0 AND `peisongid` = ".$value['cid']." ORDER BY `id` DESC LIMIT 0,1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $lng_ = $ret[0]['lng'];
                        $lat_ = $ret[0]['lat'];


                        $distance_to_shop = getDistance($lng_, $lat_,$coordY, $coordX);
                        $distance_to_user = getDistance($olng, $olat,$coordY, $coordX);

                        if($distance_to_shop <= 0 || $distance_to_user <= 0){
                            unset($courierArr_middle[$key]);
                            if($open_log){
                                $_autoDispatch_waimaiLog->DEBUG("获取距离失败2：骑手id->".$value['id']."\r\n");
                            }
                            continue;
                        }

                        $distance_total = $distance_to_shop + $distance_to_user;

                        $courierArr_middle[$key]['distance_total'] = $distance_total;
                        $courierArr_middle[$key]['distance_to_shop'] = $distance_to_shop;

                    }
                }
            }

            if(count($courierArr_middle) > 0){
                // 按总距离排序
                $courierArr_middle_juli = arraySequence($courierArr_middle, 'distance_total', 'SORT_ASC');

                // 第一和第二总距离相差在10米以内，再判断到店铺的距离
                $cid = $courierArr_middle_juli[0]['cid'];
                if(count($courierArr_middle_juli) > 1){
                    if(abs($courierArr_middle_juli[0]['distance_total'] - $courierArr_middle_juli[1]['distance_total']) <= 10){
                        if($courierArr_middle_juli[0]['distance_to_shop'] > $courierArr_middle_juli[1]['distance_to_shop']){
                            $cid = $courierArr_middle_juli[1]['cid'];
                        }
                    }
                }
                /*判断骑手和店铺cityid是否一致*/
                $judgestate = judgeCityid($oid,$cid);
                if($judgestate ==0){
                    continue;
                }else{
                    autoDispatchCourier($oid, $cid, 'middle');
                    continue;
                }

            }

        }

        // $_autoDispatch_waimaiLog->DEBUG("派单失败id:" . $oid . "\r\n");

        // 此订单没有分配出去
        array_push($warningOrderList, $oid);

    }

    if($warningOrderList){
        // 已经解除距离限制,爆单警报
        if($juliLimitCancel){
            dispatchDanger($warningOrderList);
        }else{

            // if($orderFilter){
            //     foreach ($orderArr as $key => $value) {
            //         if(in_array($value['id'], $orderFilter)){
            //             unset($orderArr[$key]);
            //         }
            //     }
            // }
            // if($courierFilter){
            //     foreach ($courierArr as $key => $value) {
            //         if(in_array($value['id'], $courierFilter)){
            //             unset($courierArr[$key]);
            //         }
            //     }
            // }

            if($open_log){
                $_autoDispatch_waimaiLog->DEBUG("解除距离限制 \r\n");
            }
//            autoDispatch(true);
        }
    }else{
        dispatchDanger();
    }

}



autoDispatch();


// 分配骑手
function autoDispatchCourier($orderid, $courier, $type = ''){
    global $dsql;
    global $open_log;
    global $orderFilter;
    global $courierFilter;

    if($open_log){
        $day = date("Ymd");
        mkdir(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day, 0777, true);
        //初始化日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_autoDispatch_waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day.'/'.date('H').'.log');
        $log = "orderid: ".$orderid."; courier: ".$courier."; type:".$type;
        $_autoDispatch_waimaiLog->DEBUG("派单:" . $log . "\r\n");
    }
    if(empty($orderid) || empty($courier)){
        return;
    }

    array_push($orderFilter, $orderid);
    array_push($courierFilter, $courier);

    if(is_array($returnre)&&!empty($returnre)){
        return;
    }

    $sql = $dsql->SetQuery("SELECT `getproportion` FROM `#@__waimai_courier` WHERE `id` = $courier");
    $ret = $dsql->dsqlOper($sql, "results");
    if (!$ret) {
        return;
    } else {

        $getproportion = $ret[0]['getproportion'];
    }

    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;
    $courierfencheng  = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;

    $time = GetMkTime(time());
    $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 4, `peisongid` = '$courier', `peidate` = '$time' ,`courierfencheng` = '$courierfencheng' WHERE `state` = 3 AND `ordertype` = 0 AND `id` = $orderid");
    $ret = $dsql->dsqlOper($sql, "update");

    // 本地
    if($is_location) return;

    if($ret == "ok"){

        //推送消息给骑手
        global $cfg_basehost;
        global $cfg_secureAccess;

        $url = $cfg_secureAccess.$cfg_basehost.'/index.php?service=waimai&do=courier&template=detail&id='.$orderid;

        sendapppush($courier, "您有新的配送订单", "点击查看", $url, "newfenpeiorder");

        //消息通知用户
        $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, o.`pubdate`, o.`food`, o.`amount`, s.`shopname`, c.`name`, c.`phone` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid` WHERE o.`id` = $orderid");
        $ret_ = $dsql->dsqlOper($sql_, "results");
        if($ret_){
            $data = $ret_[0];

            $uid           = $data['uid'];
            $ordernumstore = $data['ordernumstore'];
            $pubdate       = $data['pubdate'];
            $food          = unserialize($data['food']);
            $amount        = $data['amount'];
            $shopname      = $data['shopname'];
            $name          = $data['name'];
            $phone         = $data['phone'];

            $foods = array();
            foreach ($food as $key => $value) {
                array_push($foods, $value['title'] . " " . $value['count'] . "份");
            }

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "waimai",
                "id"       => $orderid
            );

            $config = array(
                "ordernum" => $shopname.$ordernumstore,
                "orderdate" => date("Y-m-d H:i:s", $pubdate),
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

            updateMemberNotice($uid, "会员-订单配送提醒", $param, $config,'','',0,1);
        }

    }
}

// 爆单警报
function dispatchDanger($warningOrderList = array()){
    global $dsql;
    global $open_log;
    if($open_log){
        $day = date("Ymd");
        mkdir(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day, 0777, true);
        //初始化日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_autoDispatch_waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/autoDispatch_waimai/'.$day.'/'.date('H').'.log');
    }

    $time = GetMkTime(time());
    $count = count($warningOrderList);

    $sql = $dsql->SetQuery("SELECT * FROM `#@__dispatch_warning` WHERE `module` = 'waimai' ORDER BY `id` DESC LIMIT 0,1");
    $ret = $dsql->dsqlOper($sql, "results");

    if(!empty($count)){
        if(!$ret || ($ret && ($ret[0]['state'] != 0 || $ret[0]['count'] != $count))){
            $sql = $dsql->SetQuery("INSERT INTO `#@__dispatch_warning` (`module`, `count`, `pubdate`, `enddate`, `state`) VALUES ('waimai', '$count', '$time', 0, 0)");
            $dsql->dsqlOper($sql, "lastid");
        }
        if($open_log){
            $_autoDispatch_waimaiLog->DEBUG("爆单id:" . join(",", $warningOrderList) . "\r\n");
        }
    }else{
        if($ret){
            if($ret[0]['state'] == 0){
                $sql = $dsql->SetQuery("UPDATE `#@__dispatch_warning` SET `enddate` = '$time', `state` = 1 WHERE `id` = ".$ret[0]['id']);
                $dsql->dsqlOper($sql, "update");
            }
        }
    }
}


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

function judgeCityid($orderid,$courierid){
    global $dsql;
    $state = 0;
    if(!$orderid || !$courierid) return $state;

    $storecityidsql = $dsql->SetQuery("SELECT s.`cityid` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON o.`sid` = s.`id` WHERE o.`id` = '$orderid'");

    $storecityidres = $dsql->dsqlOper($storecityidsql,"results");
    $storeid    = (int)$storecityidres[0]['cityid'];

    /*查询骑手属于哪个分站*/
    $couriersql     = $dsql->Setquery("SELECT `cityid` FROM `#@__waimai_courier` WHERE `id` = '$courierid'");
    $courierres     = $dsql->dsqlOper($couriersql,'results');
    $couriercityid   = (int)$courierres[0]['cityid'];

    if($couriercityid == $storeid){
        $archives = $dsql->SetQuery("SELECT  `config`  FROM `#@__site_city` WHERE `cid` = '$storeid'");
        $sql = $dsql->dsqlOper($archives, "results");
        $arrayCity = unserialize($sql[0]['config']);
        $cityDispatch = (int)$arrayCity['waimai']['cityDispatch'];
        if ($cityDispatch == 1){
            $state = 0;
        }else{
            $state = 1;
        }
    }

    return $state;
}
