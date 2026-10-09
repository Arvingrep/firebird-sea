<?php
/**
 * 店铺管理
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_shop";
$templates = "waimaiShopAdd.html";

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;

if ($custom_otherpeisong == 2 ) {
    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
    require_once $pluginFile;
}
if ($custom_otherpeisong == 3 ) {
    $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
    include $pluginFile;
}
//表单提交
if($_POST){

    if($id && !checkWaimaiShopManager($id)){
        showMsg("您没有该店铺的管理权限！", "1");
        exit();
    }

    //获取表单数据
    $id                      = (int)$id;
    $sort                    = (int)$sort;
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
    //$delivery_time           = (int)$delivery_time; //配送时间不在这里修改
    $paytype                 = isset($paytype) ? join(',',$paytype) : '';
    $offline_limit           = (int)$offline_limit;
    $pay_offline_limit       = (float)$pay_offline_limit;
    $is_first_discount       = (int)$is_first_discount;
    $first_discount          = (float)$first_discount;
    $is_discount             = (int)$is_discount;
    $discount_value          = (float)$discount_value;
    $open_promotion          = (int)$open_promotion;
    $open_fullcoupon          = (int)$open_fullcoupon;
    $smsvalid                = (int)$smsvalid;
    $emailvalid              = (int)$emailvalid;
    $weixinvalid             = (int)$weixinvalid;
    $customerid              = (int)$customerid;
    $auto_printer            = (int)$auto_printer;
    $showordernum            = (int)$showordernum;
    $open_addservice         = (int)$open_addservice;
    $bind_print              = (int)$bind_print;
    $instorestatus           = (int)$instorestatus;
    $wmstorestatus           = (int)$wmstorestatus;
    $underpay                = (int)$underpay;
    $specify                 = $specify;
    $billingtype             = (int)$billingtype;
    $thingcategory           = (int)$thingcategory;
    $map_type                = (int)$custom_map;

    $reservestatus = (int)$reservestatus; //是否支持预定

    global $cfg_map;  //系统默认地图
    $map_type = !$map_type ? $cfg_map : $map_type;
    
    if($map_type == 4){
        $map_type = 1;
    }
    // $manager                 = $manager;
    $jointime                = GetMkTime(time());



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
    $printArr = array();
    if($print_config){
        foreach ($print_config['partner'] as $key => $value) {
            array_push($printArr, array(
                "partner" => $value,
                "apikey"  => $print_config['apikey'][$key],
                "mcode"  => $print_config['mcode'][$key],
                "msign"  => $print_config['msign'][$key]
            ));
        }
    }
    $print_config = serialize($printArr);


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
                $yssql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `ysshop_id` = 0,`other_param` = '' WHERE `id` = '$id'");

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


    //修改
    if($id){
        $fieldstr = '';
        if($module!=''){
            switch ($module) {
                case 'zhuohao':
                    $fieldstr = " `zhuohao` = '$zhuohaoarr'";
                    break;
                case 'jbinfo':
                    $fieldstr = " `sort` = '$sort',`shopname` = '$shopname',`typeid` = '$typeid',`phone` = '$phone',`cityid` = '$cityid',`address` = '$address',`qq` = '$qq',`description` = '$description',`coordX` = '$coordX',`coordY`= '$coordY',`food_license_img`  = '$food_license_img',`business_license_img` = '$business_license_img'";
                    break;
                case 'yyinfo':
                    $fieldstr = " `status` = '$status',`closeinfo` = '$closeinfo',`instorestatus` = '$instorestatus',`wmstorestatus` = '$wmstorestatus',`underpay` = '$underpay',`ordervalid` = '$ordervalid',`closeorder` = '$closeorder',`merchant_deliver` = '$merchant_deliver',`selftake` = '$selftake',`cancelorder` = '$cancelorder', `weeks` = '$weeks',`start_time1` = '$start_time1',`end_time1` = '$end_time1',`start_time2` = '$start_time2',`end_time2` = '$end_time2',`start_time3` = '$start_time3',`end_time3` = '$end_time3'";
                    break;
//                case 'delivery':
//                    $fieldstr = " `delivery_fee_mode` = '$delivery_fee_mode',`basicprice` = '$basicprice',`delivery_fee` = '$delivery_fee',`delivery_fee_type` = '$delivery_fee_type',`delivery_fee_value` = '$delivery_fee_value',`range_delivery_fee_value`  = '$range_delivery_fee_value'";
//                    break;
                case  'dpxs':
                    $fieldstr = " `shop_notice` = '$shop_notice'";
                    break;
                case 'hdfk':
                    $fieldstr = " `paytype` = '$paytype',`offline_limit` = '$offline_limit',`pay_offline_limit` = '$pay_offline_limit'";
                    break;
                case 'yszd':
                    $fieldstr = " `preset` = '$preset'";
                    break;
                case 'store' :
                    $fieldstr = " `promotions` = '$promotions'";
                    break;
                case 'ordernotice':
                    $fieldstr = " `smsvalid` = '$smsvalid',`sms_phone`  = '$sms_phone',`emailvalid` = '$emailvalid',`email_address` = '$email_address',`weixinvalid` = '$weixinvalid',`customerid` = '$customerid',`auto_printer` = '$auto_printer',`showordernum` = '$showordernum'";
                    break;
                case 'storepic':
                    $fieldstr = " `shop_banner` = '$shop_banner'";
                    break;
                case 'zzfw':
                    $fieldstr = " `open_addservice` = '$open_addservice',`addservice` = '$addservice'";
                    break;
                case 'zdynr':
                    $fieldstr = " `selfdefine` = '$selfdefine'";
                    break;
            }
            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET ".$fieldstr." WHERE `id` = $id");

        }else {

            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET
                `sort`          = '$sort',
                `shopname`      = '$shopname',
                `typeid`        = '$typeid',
                `phone`         = '$phone',
                `cityid`        = '$cityid',
                `address`       = '$address',
                `qq`            = '$qq',
                `description`   = '$description',
                `coordX`        = '$coordX',
                `coordY`        = '$coordY',

                `status`        = '$status',
                `closeinfo`     = '$closeinfo',
                `ordervalid`    = '$ordervalid',
                `closeorder`    = '$closeorder',
                `merchant_deliver`  = '$merchant_deliver',
                `selftake`      = '$selftake',
                `cancelorder`   = '$cancelorder',
                `weeks`         = '$weeks',
                `start_time1`   = '$start_time1',
                `end_time1`     = '$end_time1',
                `start_time2`   = '$start_time2',
                `end_time2`     = '$end_time2',
                `start_time3`   = '$start_time3',
                `end_time3`     = '$end_time3',
                `shop_notice`           = '$shop_notice',
                `shop_notice_used`      = '$shop_notice_used',
                `buy_notice`    = '$buy_notice',
                `linktype`      = '$linktype',
                `callshow`      = '$callshow',
                `unitshow`      = '$unitshow',
                `opencomment`   = '$opencomment',
                `showtype`      = '$showtype',
                `food_showtype` = '$food_showtype',
                `showsales`     = '$showsales',
                `show_basicprice`   = '$show_basicprice',
                `show_delivery`     = '$show_delivery',
                `show_range`        = '$show_range',
                `show_area`         = '$show_area',
                `show_delivery_service` = '$show_delivery_service',
                `delivery_service`  = '$delivery_service',
                `memo_hint`         = '$memo_hint',
                `address_hint`      = '$address_hint',
                `order_prefix`      = '$order_prefix',
                `paytype`           = '$paytype',
                `offline_limit`     = '$offline_limit',
                `pay_offline_limit` = '$pay_offline_limit',
                `preset`            = '$preset',
                `zhuohao`           = '$zhuohaoarr',
                -- `is_discount` = '$is_discount',
                -- `discount_value` = '$discount_value',
                `open_promotion`    = '$open_promotion',
                `promotions`        = '$promotions',
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
                `selfdefine`        = '$selfdefine',
                `share_title`       = '$share_title',
                `share_pic`         = '$share_pic',
                `bind_print`        = '$bind_print',
                `print_config`      = '$print_config',
                `instorestatus`     = '$instorestatus',
                `wmstorestatus`     = '$wmstorestatus',
                `underpay`          = '$underpay',
                `food_license_img`  = '$food_license_img',
				`delivery_radius`   = '$delivery_radius',
	            `delivery_area`     = '$delivery_area',
	            `category`          = '$category',
                `specify`            = '$specify',
                `billingtype`       = '$billingtype',
                `thingcategory`     = '$thingcategory',
                `business_license_img` = '$business_license_img',
                `reservestatus` = '$reservestatus'
              WHERE `id` = $id
            ");
        }
        //         -- `is_first_discount` = '$is_first_discount',
        // -- `first_discount` = '$first_discount',
        //         -- `open_fullcoupon` = '$open_fullcoupon',
        // -- `fullcoupon` = '$fullcoupon',
        /*`delivery_radius`   = '$delivery_radius',
           `delivery_area`     = '$delivery_area',
           `delivery_fee_mode` = '$delivery_fee_mode',
           `service_area_data` = '$service_area_data',
           `basicprice`    = '$basicprice',
           `delivery_fee`  = '$delivery_fee',
           `delivery_fee_type`     = '$delivery_fee_type',
           `delivery_fee_value`    = '$delivery_fee_value',
           `open_range_delivery_fee`   = '$open_range_delivery_fee',
           `range_delivery_fee_value`  = '$range_delivery_fee_value',*/
        if ($module == 'jbinfo' || $module == '') {
            /*优闪添加店铺*/
            $yssql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($yssql, "results");

            $ysshop_id = (int)$ret[0]['ysshop_id'];

            if ($custom_otherpeisong == 2 && $ysshop_id == 0) {

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
                    $sysql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                    $dsql->dsqlOper($sysql, "update");
                } else {
                    echo '{"state": 200, "info": ' . json_encode($results['msg']) . '}';
                    exit();
                }
            }elseif($custom_otherpeisong == 3){
                $yssql = $dsql->SetQuery("SELECT `ysshop_id` FROM `#@__$dbname` WHERE `id` = $id");
                $ret = $dsql->dsqlOper($yssql, "results");

                $ysshop_id = (int)$ret[0]['ysshop_id'];
                if ($ysshop_id == 0) {
                    if ($billingtype == '') {
                        $billingtype = 1;  //默认省钱模式
                        // echo '{"state": 200, "info": "麦芽田添加店铺缺少必要参数"}';
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
        }
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == "ok"){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $id, 'update', '修改店铺信息('.$id.')', '', $sql);

            echo '{"state": 100, "info": '.json_encode("保存成功！").'}';

            /*// 管理会员
            if(!empty($manager)){
                // 先删除
                $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_shop_manager` WHERE `shopid` = $id");
                $dsql->dsqlOper($sql, "update");
                $manager = array_unique(explode(",", $manager));
                foreach ($manager as $key => $value) {
                    if(is_numeric($value)){
                        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$value', '$id', '$pubdate')");
                        $dsql->dsqlOper($sql, "lastid");
                    }
                }
            }*/
        }else{
            echo '{"state": 200, "info": "数据更新失败，请检查填写的信息是否合法！"}';
        }
        die;


        //新增
    }else{

        echo '{"state": 200, "info": "数据插入失败！"}';
        die;

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__$dbname` (
            `sort`,
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
            `is_discount`,
            `discount_value`,
            `open_promotion`,
            `promotions`,
            -- `open_fullcoupon`,
            -- `fullcoupon`,
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
            `selfdefine`,
            `share_title`,
            `share_pic`,
            `jointime`,
            `bind_print`,
            `print_config`,
            `instorestatus`,
            `wmstorestatus`,
            `underpay`,
            `food_license_img`,
			`delivery_radius`,
            `delivery_area`,
            `business_license_img`,
            `reservestatus`
        ) VALUES (
            '$sort',
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
            '$is_discount',
            '$discount_value',
            '$open_promotion',
            '$promotions',
            -- '$open_fullcoupon',
            -- '$fullcoupon',
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
            '$selfdefine',
            '$share_title',
            '$share_pic',
            '$jointime',
            '$bind_print',
            '$print_config',
            '$instorestatus',
            '$wmstorestatus',
            '$underpay',
            '$food_license_img',
			'$delivery_radius',
			'$delivery_area',
            '$business_license_img',
            '$reservestatus'
        )");
        /*`delivery_radius`,
`delivery_area`,
`delivery_fee_mode`,
`service_area_data`,
`basicprice`,
`delivery_fee`,
`delivery_fee_type`,
`delivery_fee_value`,
`open_range_delivery_fee`,
`range_delivery_fee_value`,*/

        /*'$delivery_radius',
'$delivery_area',
'$delivery_fee_mode',
'$service_area_data',
'$basicprice',
'$delivery_fee',
'$delivery_fee_type',
'$delivery_fee_value',
'$open_range_delivery_fee',
'$range_delivery_fee_value',*/

        if ($custom_otherpeisong == 2 ) {

            if ($phone == '' || $shopname == '' || $cityid =='' || $address == '' || $coordY == '' || $coordX == '' || $category =='0') {

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

                $results = $results['data'];
                $other_param = serialize($results);
                $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                $dsql->dsqlOper($sql, "update");
            } else {
                echo '{"state": 200, "info": '.json_encode($results['msg']).'}';exit();
            }
        }
        $aid = $dsql->dsqlOper($archives, "lastid");

        if($aid){

            //记录用户行为日志
            memberLog($userid, 'waimai', 'detail', $aid, 'insert', '添加店铺('.$aid.')', '', $sql);

            echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';

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
        }else{
            echo '{"state": 200, "info": "数据插入失败，请检查填写的信息是否合法！"}';
        }
        die;

    }

}


$huoniaoTag->assign('shop_banner', '[]');
$huoniaoTag->assign('license', '[]');

$typeArr = array();
$sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` WHERE `paotui` = 0 ORDER BY `sort` DESC, `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        $typeArr[$key]['id'] = $value['id'];
        $typeArr[$key]['title'] = $value['title'];
    }
}
$huoniaoTag->assign('typeArr', $typeArr);

$huoniaoTag->assign('custom_otherpeisong', $custom_otherpeisong);
$huoniaoTag->assign('billingpeisong', array(1=>'省钱',2=>'最快',3=>'指派'));
$huoniaoTag->assign('otherpeisongStr', array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务'));

$huoniaoTag->assign('thingcategoryStr', array('1' => '食品', '2' => '饮品', '3' => '鲜花','4' => '票务','5' => '超市','6' => '水果','7' => '医药','8' => '蛋糕','9' => '酒品','10' => '服装','11' => '汽配','12' => '数码','13' => '夜宵烧烤','14' => '水产','15' => '百货','99' => '其他'));
$adminCityArr = $userLogin->getAdminCity();
$adminCityArr = empty($adminCityArr) ? array() : $adminCityArr;
$huoniaoTag->assign('cityList', json_encode($adminCityArr));

$huoniaoTag->assign('otherpeisong', array(0 => '智能推荐', 2 => '蓝达达', 4 => '顺丰',5 => '点我达',6 => '闪送',7 => 'UU',8 => '爱跑腿',9 => '快服务',10 => '红达达'));
//获取信息内容
if($id){

    if(!checkWaimaiShopManager($id)){
        showMsg("您没有该店铺的管理权限！", "-1");
        exit();
    }

    $sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
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

            //自定义显示内容
            if($key == "selfdefine"){
                $value = unserialize($value);
            }

            //店铺图片
            if($key == "shop_banner"){
                $value = !empty($value) ? json_encode(explode(",", $value)) : "[]";
            }

            //打印机
            if($key == "print_config"){
                $value = unserialize($value);
            }

            //服务区域
            if($key == "service_area_data"){
                $value = !empty($value) ? unserialize($value) : array();
            }                //店铺分类
            if($key == "typeid"){
                $value = explode(",", $value);
            }

            $huoniaoTag->assign($key, $value);
        }

        $huoniaoTag->assign('license', empty($ret[0]['food_license_img']) && empty($ret[0]['business_license_img']) ? json_encode(array()) : json_encode(array($ret[0]['food_license_img'], $ret[0]['business_license_img'])));

        // 查询管理会员
        $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_manager` WHERE `shopid` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        $manager = array();
        if($ret){
            foreach ($ret as $key => $val ) {
                array_push($manager, $val['userid']);
            }
        }
        $huoniaoTag->assign('manager', join(",", $manager));

    }else{
        showMsg("没有找到相关信息！", "-1");
        die;
    }
}else{
    showMsg("没有找到相关信息！", "-1");
    die;
}

$quanSql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
$quanList = $dsql->dsqlOper($quanSql, "results");
$huoniaoTag->assign("quanList", $quanList);
$huoniaoTag->assign('cuszhipeisong', $cuszhipeisong);
if ($custom_otherpeisong == 2 ) {
    $huoniaoTag->assign('ysShopType', ysShopType() ? ysShopType() : array());
}
if ($custom_otherpeisong == 3 ) {
    $billingpeisong  = array(1=>'省钱',2=>'最快',3=>'指派');
    $huoniaoTag->assign('billingpeisong', $billingpeisong ?$billingpeisong : array());
}
//验证模板文件
if(file_exists($tpl."/".$templates)){
    $jsFile = array(
        '../ui/jquery-ui-timepicker-addon.js',
        '../ui/jquery.dragsort-0.5.1.min.js',
        '../ui/chosen.jquery.min.js',
        '../publicUpload.js',
        'shop/waimaiShopAdd.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
