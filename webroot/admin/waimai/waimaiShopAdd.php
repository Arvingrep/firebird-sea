<?php
/**
 * 店铺管理 新建店铺
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiShopAdd");

$dbname = "waimai_shop";
$templates = "waimaiShopAdd.html";
if($dopost == "del"){
    $sql        = $dsql->SetQuery("DELETE FROM `#@__waimai_shopprint` WHERE `sid` = '$sid' AND `id` = '$printid'");
    $results    = $dsql->dsqlOper($sql,"update");
    if($results =="ok"){
        echo '{"state": 100, "info": '.json_encode("删除成功！").'}';die;

    } else{
        echo '{"state": 100, "info": '.json_encode("删除失败！").'}';die;

    }
}

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;

if ($custom_otherpeisong == 2 ) {
    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
    include $pluginFile;
}
if ($custom_otherpeisong == 3 ) {
    $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
    include $pluginFile;
}

//绑定店铺自己的顺丰店铺
if($dopost == 'maiyatianGetauthurl'){
    $maiyatian = new maiyatian();
    $data = $maiyatian->getauthurl(array('shop_id' => $id));
    if($data['code'] == 1){
        header('Location:'.$data['data']['url']);
        die;
    }else{
        die($data['message']);
    }
}

//解除绑定店铺自己的顺丰店铺
if($dopost == 'maiyatianUnbind'){
    $maiyatian = new maiyatian();
    $data = $maiyatian->unbind(array('shop_id' => $id));
    if($data['code'] == 1){
        echo '{"state": 100, "info": '.json_encode("解绑成功！").'}';die;
    }else{
        echo '{"state": 200, "info": '.json_encode($data['message']).'}';die;
    }
}

// 更新店铺最低起送价
function updateShopBasicprice($id){
    if(!$id) return;
    global $dsql;
    global $adminCityIds;

    $sql = $dsql->SetQuery("SELECT `id`, `delivery_fee_mode`, `basicprice`, `service_area_data`, `range_delivery_fee_value` FROM `#@__waimai_shop` WHERE `id` = $id AND `del` = 0" . getCityFilter('`cityid`'));
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            // 配送费
            // 固定
            $basicprice = $value['basicprice'];
            if($value['delivery_fee_mode'] == 2){
                $service_area_data = $value['service_area_data'];
                $service_area_data = unserialize($service_area_data);
                if($service_area_data){
                    // $delivery_fee = 999;
                    $basicprice = 999;
                    foreach ($service_area_data as $k => $v) {
                        /*if($v['peisong'] < $delivery_fee){
                            $delivery_fee = $v['peisong'];
                        }*/
                        if($v['qisong'] < $basicprice){
                            $basicprice = $v['qisong'];
                        }
                    }
                }

                //按距离
            }elseif($value['delivery_fee_mode'] == 3){
                $range_delivery_fee_value = $value['range_delivery_fee_value'];
                $range_delivery_fee_value = unserialize($range_delivery_fee_value);
                if($range_delivery_fee_value){
                    // $delivery_fee = 999;
                    $basicprice = 999;
                    foreach ($range_delivery_fee_value as $k => $v) {
                        /*if($v[2] < $delivery_fee){
                            $delivery_fee = $v[2];
                        }*/
                        if($v[3] < $basicprice){
                            $basicprice = $v[3];
                        }
                    }
                }
            }

            $sql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET `basicprice_min` = $basicprice WHERE `id` = ".$value['id']);
            $ret = $dsql->dsqlOper($sql, "update");


        }

    }

}
updateShopBasicprice($id);

//表单提交
if($_POST){
    include(HUONIAOINC . "/config/waimai.inc.php");
    //获取表单数据
    $id                      = (int)$id;
    $sort                    = (int)$sort;
    $peisong_type            = $peisong_type;
    $shop_openid             = $shop_openid;
    $typeid                  = $typeid;
    $category                = (int)$category;
    $weeks                   = isset($weeks) ? join(',',$weeks) : '';
    $delivery_radius         = (float)$delivery_radius;
    $delivery_fee_mode       = (int)$delivery_fee_mode;
    $basicprice              = (float)$basicprice;
    $delivery_fee            = (float)$delivery_fee;
    $delivery_fee_type       = (int)$delivery_fee_type;
    $delivery_fee_value      = (float)$delivery_fee_value;
    $open_range_delivery_fee = (int)$open_range_delivery_fee;
    $shop_notice_used        = (int)$shop_notice_used;
    $linktype                = (int)$linktype;
    $callshow                = (int)$callshow;
    $unitshow                = (int)$unitshow;
    $opencomment             = (int)$opencomment;
    $showtype                = (int)$showtype;
    $food_showtype           = (int)$food_showtype;
    $showsales               = (int)$showsales;
    $show_basicprice         = (int)$show_basicprice;
    $show_delivery           = (int)$show_delivery;
    $show_range              = (int)$show_range;
    $show_area               = (int)$show_area;
    $show_delivery_service   = (int)$show_delivery_service;
    $delivery_time           = (int)$delivery_time;
    $chucan_time             = (int)$chucan_time;
    $paytype                 = isset($paytype) ? join(',',$paytype) : '';
    $offline_limit           = (int)$offline_limit;
    $pay_offline_limit       = (float)$pay_offline_limit;
    $is_first_discount       = (int)$is_first_discount;
    $first_discount          = (float)$first_discount;
    $is_vipdiscount          = (int)$is_vipdiscount;
    $vipdiscount_value       = (float)$vipdiscount_value;
    $open_promotion          = (int)$open_promotion;
    $open_fullcoupon         = (int)$open_fullcoupon;
    $smsvalid                = (int)$smsvalid;
    $emailvalid              = (int)$emailvalid;
    $weixinvalid             = (int)$weixinvalid;
    $customerid              = (int)$customerid;
    $auto_printer            = (int)$auto_printer;
    $showordernum            = (int)$showordernum;
    $open_addservice         = (int)$open_addservice;
    $paotuitype              = (int)$otherpeisong;
    // $bind_print              = (int)$bind_print;
    $fencheng_foodprice      = (int)$custom_fencheng_foodprice;
    $fencheng_delivery       = (int)$custom_fencheng_delivery;
    $fencheng_dabao          = (int)$custom_fencheng_dabao;
    $fencheng_addservice     = (int)$custom_fencheng_addservice;
    $fencheng_discount       = (int)$custom_fencheng_discount;
    $fencheng_promotion      = (int)$custom_fencheng_promotion;
    $fencheng_firstdiscount  = (int)$custom_fencheng_firstdiscount;
    $fencheng_zsb            = (int)$custom_fencheng_zsb;
    $fencheng_quan           = (int)$custom_fencheng_quan;
    $fencheng_offline        = (int)$fencheng_offline;
    $rec_brand               = (int)$rec_brand;
    $open_zsb                = (int)$open_zsb;
    $zsbproportion           = (int)$zsbproportion;
    $manager                 = $manager;
    $instorestatus           = (int)$instorestatus;
    $wmstorestatus           = (int)$wmstorestatus;
    $underpay                = (int)$underpay;
    $tjprice                 = (float)$tjprice;
    $ptprofit                = (float)$ptprofit;
    $jointime                = GetMkTime(time());
    $normaljuli              = $normaljuli;
    $chaochuprice            = (float)$chaochuprice;
    $specify                 = $specify;
    $billingtype             = (int)$billingtype;
    $thingcategory           = (int)$thingcategory;
    $map_type                = (int)$custom_map;
    
    //额外费用
    $open_additional = (int)$open_additional;
    $additional_name = trim($additional_name);

    //是否支持预定
    $reservestatus = (int)$reservestatus;

    //费用规则
    $additional_rule = array();
    if($additional){
        foreach ($additional['start'] as $key => $value) {
            array_push($additional_rule, array(
                (float)$value, (float)$additional['stop'][$key], (float)$additional['value'][$key]
            ));
        }
    }
    $additional_rule = serialize($additional_rule);


    global $cfg_map;  //系统默认地图
    $map_type = !$map_type ? $cfg_map : $map_type;
    
    if($map_type == 4){
        $map_type = 1;
    }

    //不同距离不同外送费和起送价
    $range_delivery_fee_value = array();
    if($rangedeliveryfee){
        foreach ($rangedeliveryfee['start'] as $key => $value) {
            array_push($range_delivery_fee_value, array(
                $value, $rangedeliveryfee['stop'][$key], $rangedeliveryfee['value'][$key], $rangedeliveryfee['minvalue'][$key]
            ));
        }
    }
    $range_delivery_fee_value = serialize($range_delivery_fee_value);


    //预设选项

    //负数或者false表示第一个参数应该在前
    function sort_by($x, $y){
        return strcasecmp($x[1],$y[1]);
    }

    $preset = array();
    if($field){
        foreach ($field['name'] as $key => $value) {
            array_push($preset, array(
                $field['type'][$key], $field['sort'][$key], $value, $field['content'][$key]
            ));
        }
    }
    uasort($preset, 'sort_by');
    $preset = serialize($preset);

    $zhuohaoarr = array();
    if($zhuohao){
        foreach ($zhuohao['content'] as $key => $value) {
            array_push($zhuohaoarr, array(
                $value
            ));
        }
    }
    $zhuohaoarr = serialize($zhuohaoarr);

    //满减
    $promotionsArr = array();
    if($promotions){
        foreach ($promotions as $key => $value) {
            array_push($promotionsArr, array(
                (int)$value['amount'], (int)$value['discount']
            ));
        }
    }
    array_multisort(array_column($promotionsArr, 0),SORT_ASC,$promotionsArr);
    $promotions = serialize($promotionsArr);

    //满送
    $fullcouponArr = array();
    if($fullcoupon){
        foreach ($fullcoupon as $key => $value) {
            array_push($fullcouponArr, array(
                (int)$value['full'], (int)$value['coupon']
            ));
        }
    }
    $fullcoupon = serialize($fullcouponArr);


    //增值服务
    $addserviceArr = array();
    if($addservice){
        foreach ($addservice as $key => $value) {
            array_push($addserviceArr, array(
                $value['name'], $value['start'], $value['stop'], $value['price']
            ));
        }
    }
    $addservice = serialize($addserviceArr);


    //自定义显示内容
    $selfdefineArr = array();
    if($selfdefine){
        foreach ($selfdefine['type'] as $key => $value) {
            array_push($selfdefineArr, array(
                $value, $selfdefine['name'][$key], $selfdefine['content'][$key]
            ));
        }
    }
    $selfdefine = serialize($selfdefineArr);

    if($underpay ==1){
        if($instorestatus == 0){
            echo '{"state": 200, "info": "要想开启线下支付,请开启店内点餐模式"}';
            exit();
        }
    }

    //打印机
    $print_config = $_POST['print_config'];
    if($print_config){
        $mcodearr =  array_column($print_config, 'mcode');
        if(count($mcodearr) != count(array_unique($mcodearr))){
            echo '{"state": 200, "info": "重复的终端号"}';
            exit();
        }
        //查询有无绑定
        foreach ($print_config as $key => $value) {

            $template = serialize(json_decode($value['template'], true));

            if ($value['id']!='') {
                $printsql        = $dsql->SetQuery("UPDATE `#@__waimai_shopprint` SET  `mcode`= '".$value['mcode']."', `msign` = '".$value['msign']."',`remarks` ='".$value['remarks']."',`bind_print` = '".$value['bind_print']."', `template` = '$template' WHERE `id` = ".$value['id']);

            }else{
                $printsql   = $dsql->SetQuery("INSERT INTO `#@__waimai_shopprint` (`sid`,`mcode`,`msign`,`remarks`,`bind_print`,`template`)VALUES('$id','".$value['mcode']."','".$value['msign']."','".$value['remarks']."','".$value['bind_print']."','$template')");

            }
            $dsql->dsqlOper($printsql, "update");

        }
    }

    // $printArr = array();
    // if($print_config){
    //     foreach ($print_config['partner'] as $key => $value) {
    //         array_push($printArr, array(
    //             "partner" => $value,
    //             "apikey"  => $print_config['apikey'][$key],
    //             "mcode"  => $print_config['mcode'][$key],
    //             "msign"  => $print_config['msign'][$key]
    //         ));
    //     }
    // }
    // $print_config = serialize($printArr);




    //准时宝
    $zsbarr = array();

    if($zsbspe){
        foreach ($zsbspe as $key => $value) {
            array_push($zsbarr, array(
                $value['time'], $value['proportion']
            ));
        }
    }
    $zsbspe = serialize($zsbspe);
    $service_area_data = array();
    $serviceAreaData = json_decode($_POST['service_area_data'], true);
    if($serviceAreaData){
        foreach ($serviceAreaData as $key => $value) {
            array_push($service_area_data, array(
                "peisong" => $value['peisong'],
                "qisong"  => $value['qisong'],
                "points"  => $value['points']
            ));
        }
    }
    $service_area_data = serialize($service_area_data);


    //店铺名称
    if(trim($shopname) == ""){
        echo '{"state": 200, "info": "请输入店铺名称"}';
        exit();
    }

    //店铺分类
    if(empty($typeid)){
        echo '{"state": 200, "info": "请选择店铺分类"}';
        exit();
    }else{

        $typeid = join(",", $typeid);
    }

    // 资质照片
    if(!empty($license_image)){
        $license_image = explode(",", $license_image);
        $food_license_img = $license_image[0];
        $business_license_img = count($license_image) >= 2 ? $license_image[1] : '';
    }
    if ($custom_otherpeisong == 2 ) {
        $youShanSuDaClass = new youshansuda();
    }
    if ($custom_otherpeisong == 3 ) {
        $maiYaTianClass = new maiyatian();
    }
    //验证店铺名称是否存在
    if($id){

        //先验证店铺是否存在
        $sql = $dsql->SetQuery("SELECT `id`,`shopname`,`phone`,`cityid`,`address`,`coordX`,`coordY`,`category`,`ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            echo '{"state": 200, "info": "店铺不存在或已经删除！"}';
            exit();
        }

        $oldshopname = $ret[0]['shopname'];
        $oldphone    = $ret[0]['phone'];
        $oldcityid   = $ret[0]['cityid'];
        $oldaddress  = $ret[0]['address'];
        $oldcoordX   = $ret[0]['coordX'];
        $oldcoordY   = $ret[0]['coordY'];
        $oldcategory = $ret[0]['category'];
        $ysshop_id   = $ret[0]['ysshop_id'];

        if($custom_otherpeisong == 2 && $ysshop_id != 0 && ( $oldshopname != $shopname || $oldphone != $phone || $oldcityid != $cityid || $oldaddress != $address || $oldcoordX != $coordX || $oldcoordY != $coordY || $oldcategory != $category)){

            /*编辑这几项需要优闪那边删除店铺*/


            $paramarr = array(
                'shop_id' => $ysshop_id
            );
            $results = $youShanSuDaClass->delShop($paramarr);
            if ($results['code'] != 200) {

                echo '{"state": 200, "info": "'.$results['msg'].'"}';
                exit();
            } else {
                $yssql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `ysshop_id` =0,`other_param` = '' WHERE `id` = '$id'");

                $dsql->dsqlOper($yssql, "update");
            }

        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `shopname` = '$shopname' AND `id` != '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            echo '{"state": 200, "info": "店铺名称已经存在！"}';
            exit();
        }

    }else{
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE `shopname` = '$shopname'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            echo '{"state": 200, "info": "店铺名称已经存在！"}';
            exit();
        }
    }

    $description = trim($description);


    //修改
    if($id){

        if ($custom_otherpeisong == 2 ) {

            $sql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");

            $ysshop_id = (int)$ret[0]['ysshop_id'];
            if ($ysshop_id == 0) {
                if ($phone == '' || $shopname == '' || $cityid == '' || $address == '' || $coordY == '' || $coordX == '' || $category == '0') {

                    echo '{"state": 200, "info": "优闪速达添加店铺缺少必要参数"}';
                }
                /*优闪速达*/
                include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                $siteConfigService = new siteConfig();

                $param   = array(
                    'tab' => 'site_area',
                    'id'  => (int)$cityid
                );
                $handels = new handlers('siteConfig', 'getPublicParentInfo');
                $return  = $handels->getHandle($param);

                $province = $city = '';
                if ($return['state'] == 100) {

                    $info     = $return['info'];
                    $province = $info['names'][0];
                    $city     = $info['names'][1] ? $info['names'][1] : $info['names'][0];

                }

                $categoryarr = explode(',', $category);
                $data     = array(
                    'shop_phone'       => $phone,
                    'shop_name'        => $shopname,
                    'province'         => $province,
                    'city'             => $city,
                    'address'          => str_replace(PHP_EOL, '', $address),
                    'address_detailed' => str_replace(PHP_EOL, '', $address),
                    'shop_lng'         => $coordY,
                    'shop_lat'         => $coordX,
                    'first_type'       => $categoryarr[0],
                    'second_type'      => $categoryarr[1],
                );
                $results  = $youShanSuDaClass->addShop($data);
                if ($results['code'] == 200) {

                    $results     = $results['data'];
                    $other_param = serialize($results);
                    $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                    $dsql->dsqlOper($sql, "update");
                } else {
                    echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                    exit();
                }
            }
        }elseif($custom_otherpeisong == 3){
            $sql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");

            $ysshop_id = (int)$ret[0]['ysshop_id'];
            if ($ysshop_id == 0) {
                if ($billingtype == '' || $specify == '' || $thingcategory == '') {

                    echo '{"state": 200, "info": "麦芽田添加店铺缺少必要参数"}';
                }

                include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                $siteConfigService = new siteConfig();

                $param   = array(
                    'tab' => 'site_area',
                    'id'  => (int)$cityid
                );
                $handels = new handlers('siteConfig', 'getPublicParentInfo');
                $return  = $handels->getHandle($param);

                $province = $city = '';
                if ($return['state'] == 100) {

                    $info     = $return['info'];
                    $province = $info['names'][0];
                    $city     = $info['names'][1] ? $info['names'][1] : $info['names'][0];

                }
                $data     = array(
                    'shop_id'               => $id,
                    'shop_name'             => $shopname,
                    'province'              => $province,
                    'city'                  => $city,
                    'shop_phone'            => $phone,
                    'address'               => str_replace(PHP_EOL, '', $address),
                    'shop_lng'              => $coordY,
                    'shop_lat'              => $coordX,
                    'shop_category'         => $thingcategory,
                    'shop_map_type'         => $map_type
                );
                $results  = $maiYaTianClass->editShop($data);
                if ($results['code'] != 1 && $results['code'] != 91005) {
                    echo '{"state": 200, "info": ' . json_encode($results['message']) . '}';
                    exit();
                }
            }
        }

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
            `sort`              = '$sort',
            `peisong_type`      = '$peisong_type',
            `shop_openid`       = '$shop_openid',
            `shopname`          = '$shopname',
            `typeid`            = '$typeid',
            `phone`             = '$phone',
            `cityid`            = '$cityid',
            `address`           = '$address',
            `qq`                = '$qq',
            `description`       = '$description',
            `coordX`            = '$coordX',
            `coordY`            = '$coordY',
            `status`            = '$status',
            `closeinfo`         = '$closeinfo',
            `ordervalid`        = '$ordervalid',
            `closeorder`        = '$closeorder',
            `merchant_deliver`  = '$merchant_deliver',
            `selftake`          = '$selftake',
            `cancelorder`       = '$cancelorder',
            `weeks`             = '$weeks',
            `start_time1`       = '$start_time1',
            `end_time1`         = '$end_time1',
            `start_time2`       = '$start_time2',
            `end_time2`         = '$end_time2',
            `start_time3`       = '$start_time3',
            `end_time3`         = '$end_time3',
            `delivery_radius`   = '$delivery_radius',
            `delivery_area`     = '$delivery_area',
            `delivery_fee_mode` = '$delivery_fee_mode',
            `service_area_data` = '$service_area_data',
            `basicprice`        = '$basicprice',
            `delivery_fee`      = '$delivery_fee',
            `delivery_fee_type` = '$delivery_fee_type',
            `delivery_fee_value`        = '$delivery_fee_value',
            `open_range_delivery_fee`   = '$open_range_delivery_fee',
            `range_delivery_fee_value`  = '$range_delivery_fee_value',
            `shop_notice`       = '$shop_notice',
            `shop_notice_used`  = '$shop_notice_used',
            `buy_notice`        = '$buy_notice',
            `linktype`          = '$linktype',
            `callshow`          = '$callshow',
            `unitshow`          = '$unitshow',
            `opencomment`       = '$opencomment',
            `showtype`          = '$showtype',
            `food_showtype`     = '$food_showtype',
            `showsales`         = '$showsales',
            `show_basicprice`   = '$show_basicprice',
            `show_delivery`     = '$show_delivery',
            `show_range`        = '$show_range',
            `show_area`         = '$show_area',
            `show_delivery_service` = '$show_delivery_service',
            `delivery_service`  = '$delivery_service',
            `delivery_time`     = '$delivery_time',
            `chucan_time`       = '$chucan_time',
            `memo_hint`         = '$memo_hint',
            `address_hint`      = '$address_hint',
            `order_prefix`      = '$order_prefix',
            `paytype`           = '$paytype',
            `offline_limit`     = '$offline_limit',
            `pay_offline_limit` = '$pay_offline_limit',
            `preset`            = '$preset',
            `zhuohao`           = '$zhuohaoarr',
            `is_first_discount` = '$is_first_discount',
            `first_discount`    = '$first_discount',
            `is_vipdiscount`    = '$is_vipdiscount',
            `vipdiscount_value` = '$vipdiscount_value',
            `open_promotion`    = '$open_promotion',
            `promotions`        = '$promotions',
            `open_fullcoupon`   = '$open_fullcoupon',
            `fullcoupon`        = '$fullcoupon',
            `smsvalid`          = '$smsvalid',
            `sms_phone`         = '$sms_phone',
            `emailvalid`        = '$emailvalid',
            `email_address`     = '$email_address',
            `weixinvalid`       = '$weixinvalid',
            `customerid`        = '$customerid',
            `auto_printer`      = '$auto_printer',
            `showordernum`      = '$showordernum',
            `shop_banner`       = '$shop_banner',
            `open_addservice`   = '$open_addservice',
            `addservice`        = '$addservice',
            `zsbspe`            = '$zsbspe',
            `selfdefine`        = '$selfdefine',
            `share_title`       = '$share_title',
            `share_pic`         = '$share_pic',
            -- `bind_print`        = '$bind_print',
            -- `print_config`      = '$print_config',
            `food_license_img`  = '$food_license_img',
            `business_license_img` = '$business_license_img',
            `rec_brand`         = '$rec_brand',
            `open_zsb`          = '$open_zsb',
            `zsbproportion`     = '$zsbproportion',
            `instorestatus`     = '$instorestatus',
            `wmstorestatus`     = '$wmstorestatus',
            `underpay`          = '$underpay',
            `tjprice`           = '$tjprice',
            `ptprofit`          = '$ptprofit',
            `paotuitype`        = '$paotuitype',
            `category`          = '$category',
            `normaljuli`        = '$normaljuli',
            `specify`           = '$specify',
            `billingtype`       = '$billingtype',
            `thingcategory`     = '$thingcategory',
            `chaochuprice`      = '$chaochuprice',
            `open_additional`   = '$open_additional',
            `additional_name`   = '$additional_name',
            `additional_rule`   = '$additional_rule',
            `reservestatus`   = '$reservestatus'
          WHERE `id` = $id
        ");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){
            dataAsync("waimai",$id,"store"); // 修改外卖商店
            adminLog("修改外卖店铺- $id - $shopname", $sql . " & manager: " . $manager, 1);

            echo '{"state": 100, "info": '.json_encode("保存成功！").'}';

            // 管理会员
            $pubdate = GetMkTime(time());
            // 先删除
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_shop_manager` WHERE `shopid` = $id");
            $dsql->dsqlOper($sql, "update");
            if(!empty($manager)){
                $manager = array_unique(explode(",", $manager));
                foreach ($manager as $key => $value) {
                    if(is_numeric($value)){
                        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$value', '$id', '$pubdate')");
                        $dsql->dsqlOper($sql, "lastid");
                    }
                }
            }

        }else{
            echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
        }
        die;


        //新增
    }else{

        if ($custom_otherpeisong == 2 ) {

            $sql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");

            if ($ysshop_id == 0) {
                if ($phone == '' || $shopname == '' || $cityid == '' || $address == '' || $coordY == '' || $coordX == '' || $category == '0') {

                    echo '{"state": 200, "info": "优闪速达添加店铺缺少必要参数"}';
                }
                /*优闪速达*/
                include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                $siteConfigService = new siteConfig();

                $param   = array(
                    'tab' => 'site_area',
                    'id'  => (int)$cityid
                );
                $handels = new handlers('siteConfig', 'getPublicParentInfo');
                $return  = $handels->getHandle($param);

                $province = $city = '';
                if ($return['state'] == 100) {

                    $info     = $return['info'];
                    $province = $info['names'][0];
                    $city     = $info['names'][1] ? $info['names'][1] : $info['names'][0];

                }

                $category = explode(',', $category);
                $data     = array(
                    'shop_phone'       => $phone,
                    'shop_name'        => $shopname,
                    'province'         => $province,
                    'city'             => $city,
                    'address'          => str_replace(PHP_EOL, '', $address),
                    'address_detailed' => str_replace(PHP_EOL, '', $address),
                    'shop_lng'         => $coordY,
                    'shop_lat'         => $coordX,
                    'first_type'       => $category[0],
                    'second_type'      => $category[1],
                );
                $results  = $youShanSuDaClass->addShop($data);

                if ($results['code'] == 200) {

                    $results     = $results['data'];
                    $other_param = serialize($results);
                    $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                    $dsql->dsqlOper($sql, "update");
                } else {
                    echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                    exit();
                }
            }
        }

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `sort`,
            `peisong_type`,
            `shop_openid`,
            `shopname`,
            `typeid`,
            `phone`,
            `cityid`,
            `address`,
            `qq`,
            `description`,
            `coordX`,
            `coordY`,
            `status`,
            `closeinfo`,
            `ordervalid`,
            `closeorder`,
            `merchant_deliver`,
            `selftake`,
            `cancelorder`,
            `weeks`,
            `start_time1`,
            `end_time1`,
            `start_time2`,
            `end_time2`,
            `start_time3`,
            `end_time3`,
            `delivery_radius`,
            `delivery_area`,
            `delivery_fee_mode`,
            `service_area_data`,
            `basicprice`,
            `delivery_fee`,
            `delivery_fee_type`,
            `delivery_fee_value`,
            `open_range_delivery_fee`,
            `range_delivery_fee_value`,
            `shop_notice`,
            `shop_notice_used`,
            `buy_notice`,
            `linktype`,
            `callshow`,
            `unitshow`,
            `opencomment`,
            `showtype`,
            `food_showtype`,
            `showsales`,
            `show_basicprice`,
            `show_delivery`,
            `show_range`,
            `show_area`,
            `show_delivery_service`,
            `delivery_service`,
            `delivery_time`,
            `chucan_time`,
            `memo_hint`,
            `address_hint`,
            `order_prefix`,
            `paytype`,
            `offline_limit`,
            `pay_offline_limit`,
            `preset`,
            `zhuohao`,
            `is_first_discount`,
            `first_discount`,
            `is_vipdiscount`,
            `vipdiscount_value`,
            `open_promotion`,
            `promotions`,
            `open_fullcoupon`,
            `fullcoupon`,
            `smsvalid`,
            `sms_phone`,
            `emailvalid`,
            `email_address`,
            `weixinvalid`,
            `customerid`,
            `auto_printer`,
            `showordernum`,
            `shop_banner`,
            `open_addservice`,
            `addservice`,
            `zsbspe`,
            `selfdefine`,
            `share_title`,
            `share_pic`,
            `jointime`,
            -- `bind_print`,
            -- `print_config`,
            `fencheng_foodprice`,
            `fencheng_delivery`,
            `fencheng_dabao`,
            `fencheng_addservice`,
            `fencheng_discount`,
            `fencheng_promotion`,
            `fencheng_firstdiscount`,
            `fencheng_offline`,
            `fencheng_quan`,
            `fencheng_zsb`,
            `food_license_img`,
            `business_license_img`,
            `rec_brand`,
            `open_zsb`,
            `zsbproportion`,
            `instorestatus`,
            `wmstorestatus`,
            `underpay`,
            `tjprice`,
            `ptprofit`,
            `paotuitype`,
            `category`,
            `specify`,
            `billingtype`,
            `thingcategory`,
            `open_additional`,
            `additional_name`,
            `additional_rule`,
            `reservestatus`
        ) VALUES (
            '$sort',
            '$peisong_type',
            '$shop_openid',
            '$shopname',
            '$typeid',
            '$phone',
            '$cityid',
            '$address',
            '$qq',
            '$description',
            '$coordX',
            '$coordY',
            '$status',
            '$closeinfo',
            '$ordervalid',
            '$closeorder',
            '$merchant_deliver',
            '$selftake',
            '$cancelorder',
            '$weeks',
            '$start_time1',
            '$end_time1',
            '$start_time2',
            '$end_time2',
            '$start_time3',
            '$end_time3',
            '$delivery_radius',
            '$delivery_area',
            '$delivery_fee_mode',
            '$service_area_data',
            '$basicprice',
            '$delivery_fee',
            '$delivery_fee_type',
            '$delivery_fee_value',
            '$open_range_delivery_fee',
            '$range_delivery_fee_value',
            '$shop_notice',
            '$shop_notice_used',
            '$buy_notice',
            '$linktype',
            '$callshow',
            '$unitshow',
            '$opencomment',
            '$showtype',
            '$food_showtype',
            '$showsales',
            '$show_basicprice',
            '$show_delivery',
            '$show_range',
            '$show_area',
            '$show_delivery_service',
            '$delivery_service',
            '$delivery_time',
            '$chucan_time',
            '$memo_hint',
            '$address_hint',
            '$order_prefix',
            '$paytype',
            '$offline_limit',
            '$pay_offline_limit',
            '$preset',
            '$zhuohaoarr',
            '$is_first_discount',
            '$first_discount',
            '$is_vipdiscount',
            '$vipdiscount_value',
            '$open_promotion',
            '$promotions',
            '$open_fullcoupon',
            '$fullcoupon',
            '$smsvalid',
            '$sms_phone',
            '$emailvalid',
            '$email_address',
            '$weixinvalid',
            '$customerid',
            '$auto_printer',
            '$showordernum',
            '$shop_banner',
            '$open_addservice',
            '$addservice',
            '$zsbspe',
            '$selfdefine',
            '$share_title',
            '$share_pic',
            '$jointime',
            -- '$bind_print',
            -- '$print_config',
            '$custom_fencheng_foodprice',
            '$custom_fencheng_delivery',
            '$custom_fencheng_dabao',
            '$custom_fencheng_addservice',
            '$custom_fencheng_discount',
            '$custom_fencheng_promotion',
            '$custom_fencheng_firstdiscount',
            '$fencheng_offline',
            '$custom_fencheng_quan',
            '$custom_fencheng_zsb',
            '$food_license_img',
            '$business_license_img',
            '$rec_brand',
            '$open_zsb',
            '$zsbproportion',
            '$instorestatus',
            '$wmstorestatus',
            '$underpay',
            '$tjprice',
            '$ptprofit',
            '$paotuitype',
            '$category',
            '$specify',
            '$billingtype',
            '$thingcategory',
            '$open_additional',
            '$additional_name',
            '$additional_rule',
            '$reservestatus'
        )");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if($aid){
            if($custom_otherpeisong == 3){
                $sql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "results");

                $ysshop_id = (int)$ret[0]['ysshop_id'];
                if ($ysshop_id == 0) {
                    if ($billingtype == '' || $specify == '' || $thingcategory == '') {

                        echo '{"state": 200, "info": "麦芽田添加店铺缺少必要参数"}';
                    }
                    /*优闪速达*/
                    include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

                    $siteConfigService = new siteConfig();

                    $param   = array(
                        'tab' => 'site_area',
                        'id'  => (int)$cityid
                    );
                    $handels = new handlers('siteConfig', 'getPublicParentInfo');
                    $return  = $handels->getHandle($param);

                    $province = $city = '';
                    if ($return['state'] == 100) {

                        $info     = $return['info'];
                        $province = $info['names'][0];
                        $city     = $info['names'][1] ? $info['names'][1] : $info['names'][0];

                    }
                    $data     = array(
                        'shop_id'               => $aid,
                        'shop_name'             => $shopname,
                        'province'              => $province,
                        'city'                  => $city,
                        'shop_phone'            => $phone,
                        'address'               => str_replace(PHP_EOL, '', $address),
                        'shop_lng'              => $coordY,
                        'shop_lat'              => $coordX,
                        'shop_category'         => $thingcategory,
                        'shop_map_type'         => $map_type
                    );
                    $results  = $maiYaTianClass->addShop($data);
                    if ($results['code'] != 1 && $results['code'] != 91005) {
                        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $aid");
                          $ret = $dsql->dsqlOper($sql, "update");
                        echo '{"state": 200, "info": ' . json_encode($results['message']) . '}';
                        exit();
                    }
                }
            }
            echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';

            adminLog("新增外卖店铺- $aid - $shopname", $archives . " & manager: " . $manager, 1);

            // 管理会员
            if(!empty($manager)){
                $manager = explode(",", $manager);
                foreach ($manager as $key => $value) {
                    if(is_numeric($value)){
                        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$value', '$aid', '$pubdate')");
                        $dsql->dsqlOper($sql, "lastid");
                    }
                }
            }
            dataAsync("waimai",$aid,"store"); // 新增外卖商店
        }else{
            echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
        }
        die;

    }

}


$quanSql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
$quanList = $dsql->dsqlOper($quanSql, "results");
$huoniaoTag->assign("quanList", $quanList);


//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/bootstrap1.css',
        'ui/jquery.chosen.css',
        'admin/chosen.min.css',
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui.min.js',
        'ui/jquery.form.js',
        'ui/jquery-ui-timepicker-addon.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
        'publicUpload.js',
        'admin/waimai/waimaiShopAdd.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    if ($custom_otherpeisong == 2 ) {
        $huoniaoTag->assign('ysShopType', ysShopType() ? ysShopType() : array());
    }
    $huoniaoTag->assign('shop_banner', '[]');
    $huoniaoTag->assign('license', '[]');
    $huoniaoTag->assign('custom_otherpeisong', $custom_otherpeisong);
    $huoniaoTag->assign('billingpeisong', array(1=>'省钱',3=>'指派'));
    $huoniaoTag->assign('otherpeisongStr', array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务'));

    $huoniaoTag->assign('thingcategoryStr', array('1' => '食品', '2' => '饮品', '3' => '鲜花','4' => '票务','5' => '超市','6' => '水果','7' => '医药','8' => '蛋糕','9' => '酒品','10' => '服装','11' => '汽配','12' => '数码','13' => '夜宵烧烤','14' => '水产','15' => '百货','99' => '其他'));
    $typeArr = array();
    $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` WHERE `paotui` = 0 ORDER BY `sort` DESC, `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret&&is_array($ret)){
        foreach ($ret as $key => $value) {
            $typeArr[$key]['id'] = $value['id'];
            $typeArr[$key]['title'] = $value['title'];
        }
    }
    $huoniaoTag->assign('typeArr', $typeArr);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

    //获取信息内容
    if($id){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");

        //打印机
        $shopprint = array();
        $printsql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shopprint` WHERE `sid` = $id");
        $printret = $dsql->dsqlOper($printsql,"results");
        if($printret){
            foreach ($printret as $key => $value) {
                $printret[$key]['template'] = json_encode(unserialize($value['template']));
            }
            $shopprint = $printret;
        }
        $huoniaoTag->assign('printret', $shopprint);
        if($ret){

            foreach ($ret[0] as $key => $value) {

                //不同距离不同的外送费和起送价
                if($key == "range_delivery_fee_value"){
                    $value = unserialize($value);
                }

                //预设选项
                if($key == "preset"){
                    $value = unserialize($value);
                }
                //桌号管理
                if ($key =="zhuohao") {
                    $value = unserialize($value);
                }

                //满减
                if($key == "promotions"){
                    $value = unserialize($value);
                }

                //满送
                if($key == "fullcoupon"){
                    $value = unserialize($value);
                }

                //增值服务
                if($key == "addservice"){
                    $value = unserialize($value);
                }

                //准时宝

                if($key == "zsbspe"){
                    $value = unserialize($value);
                }

                //自定义显示内容
                if($key == "selfdefine"){
                    $value = unserialize($value);
                }

                //店铺图片
                if($key == "shop_banner"){
                    $value = !empty($value) ? json_encode(explode(",", $value)) : "[]";
                }

                // //打印机
                // if($key == "print_config"){
                //     $value = unserialize($value);
                // }

                //服务区域
                if($key == "service_area_data"){
                    $value = !empty($value) ? unserialize($value) : array();
                }

                //店铺分类
                if($key == "typeid"){
                    $value = explode(",", $value);
                }

                //额外费用规则
                if($key == "additional_rule"){
                    $value = unserialize($value);
                }

                $huoniaoTag->assign($key, $value);
            }

            $licenseArr = array();
            if(empty($ret[0]['food_license_img']) && empty($ret[0]['business_license_img'])){
                $licenseArr = array();
            }else{
                $licenseArr = array();
                if($ret[0]['food_license_img']){
                    array_push($licenseArr, $ret[0]['food_license_img']);
                }
                if($ret[0]['business_license_img']){
                    array_push($licenseArr, $ret[0]['business_license_img']);
                }
            }
            $huoniaoTag->assign('license', json_encode($licenseArr));

            // 查询管理会员
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` WHERE `shopid` = $id ORDER BY `id` ASC");
            $ret = $dsql->dsqlOper($sql, "results");
            $manager = array();
            if($ret){
                foreach ($ret as $key => $val ) {
                    array_push($manager, $val['userid']);
                }
            }
            $huoniaoTag->assign('manager', join(",", $manager));

            // 查询管理会员
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` WHERE `shopid` = " . $id . " ORDER BY `id` ASC");
            $ret = $dsql->dsqlOper($sql, "results");
            $manager = array();
            if($ret){
                foreach ($ret as $val ) {
                    $name = '';
                    $uinfo = $userLogin->getMemberInfo($val['userid']);
                    if(is_array($uinfo)){
                        $name = $uinfo['nickname'];
                    }
                    if($name){
                        array_push($manager, array('id' => $val['userid'], 'name' => $name));
                    }
                }
            }
            $huoniaoTag->assign('managerList', $manager);

        }else{
            showMsg("没有找到相关信息！", "-1");
            die;
        }
    }else{
        $huoniaoTag->assign('cityid', (int)$cityid);
    }

    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
