<?php
/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
$dsql                     = new dsql($dbo);
$userLogin                = new userLogin($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

// $dbname = "waimai_order";
$templates = "waimaiOrder.html";
global  $cfg_pointRatio;
checkPurview("waimaiOrder");
$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;
//确认订单
if ($action == "confirm") {

    if (!testPurview("updateWaimaiOrderState")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if (!empty($id)) {
        $ids         = explode(",", $id);
        $ordernumArr = array();

        foreach ($ids as $key => $value) {
            // 检查订单状态 && 有用户收到两次订单确认推送

            $sub         = new SubTable('waimai_order', '#@__waimai_order');
            $break_table = $sub->getSubTableById($value);

            $sql = $dsql->SetQuery("SELECT `ordernum`, `state` FROM `" . $break_table . "` WHERE `id` = $value");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                if ($ret[0]['state'] != 2) {
                    break;
                }
            } else {
                break;
            }

            array_push($ordernumArr, $ret[0]['ordernum']);

            //消息通知 & 打印
            $sql = $dsql->SetQuery("SELECT o.`uid`, o.`food`, o.`ordernumstore`, o.`amount`, o.`pubdate`, s.`shopname`,o.`otherparam`,o.`person`,o.`tel`,s.`address`,s.`coordX`,s.`coordY`,o.`lng`,o.`lat`,o.`address` useraddress ,o.`selftime`,o.`ordertype`,o.`otherordernum`,o.`note`,s.`phone`,s.`ysshop_id`,s.`paotuitype`,s.`billingtype`,s.`specify`,s.`thingcategory`,o.`ordernum`,o.`sid`,s.`merchant_deliver`,s.`peisong_type`,o.`reservesongdate`,s.`delivery_time` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value");
            $ret = $dsql->dsqlOper($sql, "results", "ASSOC", NULL, 0);
            if ( $ret != null && is_array($ret)) {
                $data          = $ret[0];
                $uid           = $data['uid'];
                $ordernumstore = $data['shopname'] . $data['ordernumstore'];
                $pubdate       = $data['pubdate'];
                $merchant_deliver = $data['merchant_deliver'];
                $shopname      = $data['shopname'];
                $amount        = $data['amount'];
                $tel           = aesDecrypt($data['tel']);
                $lng           = $data['lng'];
                $lat           = $data['lat'];
                $useraddress   = !empty($data['useraddress']) ? explode(' ', aesDecrypt($data['useraddress'])) : array();
                $person        = aesDecrypt($data['person']);
                $shopcoordY    = $data['coordY'];
                $shopcoordX    = $data['coordX'];
                $shopaddress   = $data['address'];
                $shopshopname  = $data['shopname'];
                $selftime      = $data['selftime'];
                $ordertype     = $data['ordertype'];
                $pubusermobile = $data['phone'];
                $billingtype   = $data['billingtype'];
                $specify       = $data['specify'];
                $thingcategory = $data['thingcategory'];
                $otherordernum = $data['otherordernum'];
                $ordernum      = $data['ordernum'];
                $ysshop_id     = $data['ysshop_id'];
                $sid           = $data['sid'];
                $paotuitype    = $data['paotuitype'];
                $note          = $data['note'];
                $peisong_type  = (int)$data['peisong_type'];  //0系统默认  1平台自己配置
                $map_type      = (int)$custom_map;

                //如果是预订单，且没到预定时间，就拦截确认操作
                $reservesongdate = (int)$data['reservesongdate'];
                $nowTime = GetMkTime(time());
                if ($reservesongdate > 0 && $nowTime < ($reservesongdate - (int)$data['delivery_time']*60 - 60)) {
                    $receivingdate = date('Y-m-d H:i:s',$reservesongdate - (int)$data['delivery_time']*60 - 60);
                    echo '{"state": 200, "info": "请到'.$receivingdate.'之后再确认订单！"}';
                    exit();
                }

                global $cfg_map;  //系统默认地图
                $map_type = !$map_type ? $cfg_map : $map_type;

                if($map_type == 4){
                    $map_type = 1;
                }
                $food          = unserialize($data['food']);

                $foods = array();
                foreach ($food as $k => $v) {
                    array_push($foods, $v['title'] . " " . $v['count'] . "份");
                }

//                $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");
//
//                $pluginsres = $dsql->dsqlOper($pluginssql, "results");

                /*第三方配送员*/
                if ( $custom_otherpeisong != 0 && $selftime == 0 && $ordertype == 0 && $merchant_deliver == 0 && !$peisong_type) {

                    if ($custom_otherpeisong == 1) {
                        $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                    } elseif($custom_otherpeisong == 2){
                        $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                    }elseif($custom_otherpeisong == 3){
                        $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
                    }
                    include $pluginFile;
                    if (file_exists($pluginFile)) {

                        $otherarr = $data['otherparam'] != '' ? unserialize($data['otherparam']) : array();

                        if ( $custom_otherpeisong == 1) {

                            $otherarr['person']        = $person;
                            $otherarr['tel']           = $tel;
                            $otherarr['pubusermobile'] = $pubusermobile;
                            $otherarr['callback_url']  = $cfg_secureAccess . $cfg_basehost . '/include/plugins/13/uuPaotuiCallback.php';
                            /*uu下单*/
                            $uuPaoTuiClass = new uuPaoTui();

                            $results = $uuPaoTuiClass->putOrder($otherarr);

                            $order_code  = $results['ordercode'];
                            $return_code = $results['return_code'];
                            $return_msg  = $results['return_msg'];
                            $otherparam  = serialize($results);

                            if ($order_code != 'ok' && $return_msg == 'price_token无效') {


                                $cityname          = getCityname($shopcoordY, $shopcoordX);
                                $Calculatepricearr = array(
                                    'city_name'     => $cityname,
                                    'from_address'  => $shopaddress,
                                    'from_usernote' => $shopshopname,
                                    'from_lat'      => $shopcoordX,
                                    'from_lng'      => $shopcoordY,
                                    'to_address'    => $useraddress[0],
                                    'to_usernote'   => $useraddress[1],
                                    'to_lat'        => $lat,
                                    'to_lng'        => $lng,
                                );

                                $getpirceresults = $uuPaoTuiClass->Calculateprice($Calculatepricearr);

                                if (is_array($getpirceresults)) {
                                    $price_token = $getpirceresults['price_token'];

                                    $otherarr['price_token'] = $price_token;

                                    $aginresults = $uuPaoTuiClass->putOrder($otherarr);

                                    $order_code  = $aginresults['ordercode'];
                                    $return_code = $aginresults['return_code'];
                                    $return_msg  = $aginresults['return_msg'];
                                    $otherparam  = serialize($aginresults);
                                } else {

                                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value");
                                    $ret = $dsql->dsqlOper($sql, "update");

                                    echo '{"state": 200, "info": ' . $getpirceresults . '}';
                                    exit();
                                }

                            }

                        }elseif($custom_otherpeisong == 3){
                            $backurl = $cfg_secureAccess . $cfg_basehost . '/include/plugins/19/maiyatian.callback.php';
//                            $backurl = 'https://ihuoniao.cn/include/plugins/19/maiyatian.callback.php';
                            $paramarr = array ( 'shop_dismode'=>$billingtype,'shop_logistic' => $specify, 'shop_id' => $sid ,'shop_ordernum' => $ordernum, 'order_sn' => $ordernumstore ,'is_subscribe' => 0,'subscribe_time' => 0, 'lng' => $lng, 'lat' => $lat , 'address' => aesDecrypt($data['useraddress']), 'address_detail' => aesDecrypt($data['useraddress']), 'mem_name' => $person , 'mem_phone' => $tel , 'map_type' => $map_type , 'callback_url' => $backurl
                            );
                            $maiyatianClass = new maiyatian();
                            $results = $maiyatianClass->mytdel( $paramarr );
                            if ($results['code'] != 1){
                                echo '{"state": 200, "info": "麦芽田：' . $results['message'] . '"}';
                                exit();
                            }else{
                                $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong WHERE `id` = '$value'");
                                $dsql->dsqlOper($othersql, "update");
                            }
                        }

                        if ($return_code == 'ok') {
                            if ($custom_otherpeisong == 1) {
                                $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong ,`otherparam` = '$otherparam',`otherordernum` = '$order_code' WHERE `id` = '$value'");
                            } else {
                                $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong ,`otherordernum` = '$order_code' WHERE `id` = '$value'");
                            }
                            $dsql->dsqlOper($othersql, "update");

                        } else {
                         if($custom_otherpeisong == 2){
                             $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value");
                             $ret = $dsql->dsqlOper($sql, "update");

                             echo '{"state": 200, "info": "' . $return_msg . '"}';
                             exit();
                         }

                        }
                    }
                }

                //更新订单状态
                $date = GetMkTime(time());
                $sql  = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 3, `confirmdate` = '$date' WHERE `state` = 2 AND `id` = $value");
                $ret  = $dsql->dsqlOper($sql, "update");

                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "module"   => "waimai",
                    "id"       => $value
                );

                //自定义配置
                $config = array(
                    "ordernum"   => $ordernumstore,
                    "orderdate"  => date("Y-m-d H:i:s", $pubdate),
                    "orderinfo"  => join(" ", $foods),
                    "orderprice" => $amount,
                    "fields"     => array(
                        'keyword1' => '订单编号',
                        'keyword2' => '下单时间',
                        'keyword3' => '订单详情',
                        'keyword4' => '订单金额'
                    )
                );

                updateMemberNotice($uid, "会员-订单确认提醒", $param, $config, '', '', 0, 0);
            } else {
                echo '{"state": 200, "info": "没有找到订单信息！"}';
                exit();
            }

            // printerWaimaiOrder($value);
        }

        adminLog("确认外卖订单", join('，', $ordernumArr));

        echo '{"state": 100, "info": "操作成功！"}';
        die;

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }

}


//打印订单
if ($action == "print") {
    include(HUONIAOINC . '/config/waimai.inc.php');

    if (!empty($id)) {
        $ids = explode(",", $id);
        foreach ($ids as $key => $value) {
            if ($customPrintType == 0) {
                printerWaimaiOrder($value, true);
            } else {
                testprinterWaimaiOrder($value, true);
            }
        }

        echo '{"state": 100, "info": "操作成功！"}';
        die;
    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//成功订单
if ($action == "ok") {

    if (!testPurview("updateWaimaiOrderState")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    global  $userLogin;
    if (!empty($id)) {
        $ids = explode(",", $id);

        $newids = array();
        foreach ($ids as $index => $id) {
            $statussql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `id` = '$id' AND `state` = 1");

            $statusres = $dsql->dsqlOper($statussql, "results");

            if (!$statusres && is_array($statusres)) {
                array_push($newids, $id);
            }
        }
        $ids = !empty($newids) ? $newids : $ids;

        if(!$ids){
            echo '{"state": 200, "info": "订单已完成！"}';
            exit();
        }

        $date        = GetMkTime(time());
        $ordernumArr = array();

        $id = join(',', $ids);

        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 1, `okdate` = '$date' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {

            //消息通知用户
            foreach ($ids as $key => $value) {
                $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, o.`okdate`, o.`amount`,o.`zsbprice`, o.`ordernum`,o.`ordertype`, o.`fencheng_delivery`,o.`priceinfo`,s.`shopname`,o.`sid`,s.`cityid`,o.`paytype` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value");
                $ret_ = $dsql->dsqlOper($sql_, "results");
                if ($ret_ && is_array($ret_)) {
                    $data = $ret_[0];

                    $uid               = $data['uid'];
                    $cityid            = $data['cityid'];
                    $ordernumstore     = $data['shopname'] . $data['ordernumstore'];
                    $shopname          = $data['shopname'];
                    $ordernumstore     = $data['ordernumstore'];
                    $priceinfo         = unserialize($data['priceinfo']);
                    $okdate            = $data['okdate'];
                    $amount            = $data['amount'];
                    $ordernum          = $data['ordernum'];
                    $zsbprice          = $data['zsbprice'];
                    $sid               = $data['sid'];
                    $ordertype         = (int)$data['ordertype'];
                    $fencheng_delivery = (int)$data['fencheng_delivery'];
                    $paytype           = $data['paytype'];

                    //更新外卖店铺的销量
                    require(HUONIAOROOT."/api/handlers/waimai.config.php");
                    updateShopSales($data['sid'], $data['ordernum']);

                    adminLog("外卖订单设为成功", $shopname . '-' . $ordernumstore . '-' . $ordernum);

                    //准时宝相关

                    if ($zsbprice > 0) {

                        global $customZsbspe;
                        //支付时间与下单时间差
                        $potime = ($date - $paydate) % 86400 / 60;


                        //查找店铺准时宝规格
                        $zsbsql = $dsql->SetQuery("SELECT `zsbspe` ,`chucan_time`,`delivery_time`,`open_zsb`FROM `#@__waimai_shop` WHERE `id` = " . $sid);
                        $zsbre  = $dsql->dsqlOper($zsbsql, "results");

                        $zsbspecifications = $zsbre['0']['open_zsb'] == "1" ? $zsbre['0']['zsbspe'] : $customZsbspe;

                        $delivery_time = $zsbre['0']['delivery_time'];

                        //判断完成时间是否超出规定时间
                        if ($potime > $delivery_time && $delivery_time) {
                            //时间超出的部分
                            $beyond = $potime - $delivery_time;
                            if ($zsbspecifications != "") {
                                $zsbspe = unserialize($zsbspecifications);

                                array_multisort(array_column($zsbspe, "time"), SORT_ASC, $zsbspe);

                                for ($i = 0; $i < count($zsbspe); $i++) {
                                    if ($zsbspe[$i]['time'] <= $beyond && $beyond < $zsbspe[$i + 1]['time']) {
                                        $proportion = $zsbspe[$i]['proportion'];
                                        break;
                                    }
                                    if ($potime < $zsbspe['0']['time']) {
                                        $proportion = '0';
                                        break;
                                    }

                                    $proportion = $zsbspe[$i]['proportion'];
                                }

                                if ($proportion != 0) {
                                    $chucan_time = $zsbre['0']['chucan_time'];
                                    //骑手取货时间差
                                    $shtime = ($date - $songdate) % 86400 / 60;
                                    // $shtime = ($date-$peidate)%86400/60; //骑手时间
                                    //计算由谁承担费用
                                    $cptypeinfo = "";
                                    if (($potime - $shtime) > $chucan_time) {  //商户时间大于出餐 商家赔付

                                        $cpmoney = ($amount - $zsbprice) * ($proportion / 100);

                                        if ($cptype == 0) {
                                            $cptypeinfo = ", `cptype` = 1 ";
                                        }

                                        //商家
                                        $cpsql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $value ");
                                        $cpre  = $dsql->dsqlOper($cpsql, "update");

                                    } else {
                                        //骑手
                                        $cpmoney = ($amount - $zsbprice) * ($proportion / 100);

                                        if ($cptype == 0) {
                                            $cptypeinfo = ", `cptype` = 2 ";
                                        }

                                        $cpsql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $value ");
                                        $cpre  = $dsql->dsqlOper($cpsql, "update");
                                    }

                                    //给用户加钱
                                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $cpmoney WHERE `id` = $uid");
                                    $dsql->dsqlOper($sql, "update");

                                    $paramUser = array(
                                        "service"  => "member",
                                        "type"     => "user",
                                        "template" => "orderdetail",
                                        "module"   => "waimai",
                                        "id"       => $value
                                    );
                                    $urlParam  = serialize($paramUser);
                                    $sql       = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                                    $ret       = $dsql->dsqlOper($sql, "results");
                                    $pid       = '';
                                    if ($ret) {
                                        $pid = $ret[0]['id'];
                                    }
                                    $user  = $userLogin->getMemberInfo($uid);
                                    $usermoney = $user['money'];
//                                    $money = sprintf('%.2f',($usermoney+$cpmoney));
                                    $title_ = "外卖准时宝赔付-" . $ordernum;
                                    //保存操作日志
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$cpmoney', '准时宝赔付:$ordernum', '$date','waimai','peifu','$pid','$urlParam','$title_','$ordernum','$usermoney')");

                                    $result = $dsql->dsqlOper($archives, "update");

                                }
                            }
                        }


                    }
                    global $paytypee;
                    $paytypee = $paytype;

                    //返积分
                    $fenxiaoarr  = array(
                        'uid'       => $uid,
                        'ordernum'  => $ordernum,
                        'amount'    => $amount,
                        'ordertype' => $ordertype
                    );
                    $staticmoney = getwaimai_staticmoney('3', $value, $fenxiaoarr);

                    //外卖类型参与平台与分站提成
                    if ($ordertype == 0) {
                        //分站相关
                        global $cfg_fzwaimaiFee;
                        $peisong = 0;
                        if ($priceinfo) {
                            foreach ($priceinfo as $k_ => $v_) {
                                if ($v_['type'] == "peisong") {
                                    $peisong = $v_['amount'];
                                }
                                if ($v_['type'] == "auth_peisong") {
                                    $peisongvip = $v_['amount'];
                                }
                            }
                        }
                        global $userLogin;
                        global $cfg_fenxiaoSource;
                        //分站佣金
                        $fzFee = cityCommission($cityid,'waimai');
                        $bearfenyong = 0;
                        if ($cfg_fenxiaoSource){
                            $bearfenyong =2;
                        }else{
                            $bearfenyong = 1;
                        }
                        //    $peisongall = $peisong + $peisongvip - $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                        $peisongall     = $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                        $fztotalAmount_ = ($staticmoney['ptyd']) * (float)$fzFee / 100;
                        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                        $cityName       = getSiteCityName($cityid);
                        $staticmoney['ptyd'] = sprintf("%.2f", $staticmoney['ptyd'] - $fztotalAmount_);
                        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                        $dsql->dsqlOper($fzarchives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $money  = sprintf('%.2f',($usermoney + $amount));
                        //保存操作日志
                        $now      = GetMkTime(time());
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`bear`) VALUES ('$uid', '1', '$amount', '外卖订单(分站佣金)：$ordernum', '$now','$cityid','$fztotalAmount_','waimai','" . $staticmoney['ptyd'] . "','1','shangpinxiaoshou','$money','$bearfenyong')");
//                        $dsql->dsqlOper($archives, "update");
                        $lastid = $dsql->dsqlOper($archives, "lastid");
                        substationAmount($lastid,$cityid);

                        //微信通知
                        $moduleName = getModuleTitle(array('name' => 'waimai'));
                        $cityMoney = getcityMoney($cityid);   //获取分站总收益
                        $allincom = getAllincome();             //获取平台今日收益

                        $param = array(
                            'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array(
                                'contentrn' => $cityName . "分站\r\n".$moduleName."模块\r\n用户：".$user['nickname']."\r\n店铺：".$shopname."\r\n订单：".$ordernumstore."\r\n\r\n获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                                'date'      => date("Y-m-d H:i:s", time()),
                                'status' => "今日总收入：$cityMoney"
                            )
                        );


                        $params = array(
                            'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array(
                                'contentrn' => $cityName . "分站\r\n".$moduleName."模块\r\n用户：".$user['nickname']."\r\n店铺：".$shopname."\r\n订单：".$ordernumstore."\r\n\r\n平台获得佣金：".$staticmoney['ptyd']."\r\n分站获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                                'date'      => date("Y-m-d H:i:s", time()),
                                'status' => "今日总收入：$allincom"
                            )
                        );
                        //后台微信通知
                        updateAdminNotice("waimai", "detail", $param);
                        updateAdminNotice("waimai", "detail", $params);
                    }

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "waimai",
                        "id"       => $value
                    );

                    //自定义配置
                    $config = array(
                        "ordernum" => $ordernumstore,
                        "date"     => date("Y-m-d H:i:s", $okdate),
                        "fields"   => array(
                            'keyword1' => '订单号',
                            'keyword2' => '完成时间'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单完成通知", $param, $config, '', '', 0, 0);

                    
                }
            }


            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        } else {
            echo '{"state": 200, "info": "操作失败！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//无效订单
if ($action == "failed") {

    if (!testPurview("updateWaimaiOrderState")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id)) {

        if (empty($note)) {
            echo '{"state": 200, "info": "请填写失败原因！"}';
            exit();
        }
        $mytcancel_fee = 0;
        $ids         = explode(",", $id);
        $ordernumArr = array();

        foreach ($ids as $key => $value) {
            $sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`peisongid`, o.`ordernumstore`, o.`food`, s.`shopname` ,o.`state`,o.`is_other`,o.`otherordernum`,o.`ordernum` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value AND (o.`state` = 2 OR o.`state` = 3 OR o.`state` = 4 OR o.`state` = 5)");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $oid = (int)$ret[0]['id'];
                $peisongid     = $ret[0]['peisongid'];
                $ordernumstore = $ret[0]['ordernumstore'];
                $shopname      = $ret[0]['shopname'];
                $state         = (int)$ret[0]['state'];
                $is_other      = (int)$ret[0]['is_other'];
                $ordernum      = $ret[0]['ordernum'];
                $otherordernum = $ret[0]['otherordernum'];

                $fail_msg = '';  //第三方平台取消失败原因

                if ($is_other && ($state == 3 || $state == 4 || $state == 5)) {

//                    $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");

//                    $pluginsres = $dsql->dsqlOper($pluginssql, "results");

                    $inc = HUONIAOINC . "/config/waimai.inc.php";
                    include $inc;
                    $otherpeisong = (int)$custom_otherpeisong;
                    /*第三方配送员*/
                    if ( $otherpeisong) {

                        if ($otherpeisong == 1) {
                            $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                        } elseif($otherpeisong == 2){
                            $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";

                        }elseif($otherpeisong == 3){
                            $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";

                        }
                        include $pluginFile;
                        if (file_exists($pluginFile)) {

                            $otherarr = $data['otherparam'] != '' ? unserialize($data['otherparam']) : array();

                            if ( $otherpeisong == 1) {

                                $uuPaoTuiClass = new uuPaoTui();

                                $results = $uuPaoTuiClass->cancelOrder($otherordernum,$note);

                            } elseif( $otherpeisong == 2){

                                if ($state == 4 || $state == 5) {

                                    echo '{"state": 200, "info": "其中有优闪速达的订单取消失败:配送中的订单不能取消，如要取消，需要拨打各跑腿平台自行客服取消订单，发布订单骑手接单超2分钟取消订单将会扣取2元误工费"}';
                                    exit();
                                }

                                $youShanSuDaClass = new youshansuda();

                                $paramarr = array(
                                    'order_no' => $otherordernum
                                );
                                $results = $youShanSuDaClass->cancelOrder($paramarr);
                            }elseif($otherpeisong == 3){
                                $maiyatianClass = new maiyatian();
                                $paramarr = array(
                                    'ordernum' => $ordernum,
                                    'cancel_reason' => $note,
                                    'cancel_reason_code' => $note
                                );
                                $results = $maiyatianClass->cancelOrder($paramarr);

                                if ($results['code'] == 1){

                                    //查询配送方是否取消成功
                                    if($results['data']['succeed'] && $results['data']['details']['is_success']){
                                        $mytcancel_fee +=  (float)$results['data']['cancel_fee'];
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `mytcancel_fee` = '$mytcancel_fee' WHERE `id` = '$oid'");
                                        $dsql->dsqlOper($sql, "update");
                                    }else{
                                        $fail_msg = $results['data']['details']['fail_msg'];
                                    }

                                }
                                else{
                                    $fail_msg = $results['message'];
                                }
                            }
                        }
                    }
                }

                //加上配送平台失败的原因
                $_note = $note;
                if($fail_msg){
                    $_note = $note . '，配送平台取消失败：' . $fail_msg . '，请联系骑手取消订单';
                }

                $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = '7', `failed` = '$_note', `failedadmin` = 1 WHERE `id` = $oid");
                $dsql->dsqlOper($sql, "update");

                $food = unserialize($ret[0]['food']);

                adminLog("外卖订单设为失败", $shopname . $ordernumstore);

                if ($peisongid > 0) {
                    sendapppush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：" . $shopname . $ordernumstore, "", "peisongordercancel");
                    // aliyunPush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：".$shopname.$ordernumstore, "peisongordercancel");
                }

                // 更新库存
                foreach ($food as $k => $v) {
//        $id    = $v['id'];
                    $count = $v['count'];

                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `stock` = `stock` + $count WHERE `id` = '$value' AND `stockvalid` = 1 AND `stock` > 0");
                    $dsql->dsqlOper($sql, "update");

                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `sale` = `sale` - $count WHERE `id` = '$value'");
                    $dsql->dsqlOper($sql, "update");
                }

                //消息通知用户
                $uid = $ret[0]['uid'];

                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "module"   => "waimai",
                    "id"       => $value
                );

                //自定义配置
                $config = array(
                    "ordernum" => $shopname . $ordernumstore,
                    "date"     => date("Y-m-d H:i:s", time()),
                    "info"     => $note,
                    "fields"   => array(
                        'keyword1' => '订单编号',
                        'keyword2' => '取消时间',
                        'keyword3' => '取消原因'
                    )
                );

                updateMemberNotice($uid, "会员-订单取消通知", $param, $config, '', '', 0, 0);
            }

        }

        if ($mytcancel_fee > 0 ){
            echo '{"state": 101, "info": "麦芽田:需支付违约金'.$mytcancel_fee.'元!"}';
            exit();
        }elseif($fail_msg){
            echo '{"state": 100, "info": "配送平台取消失败："' . $fail_msg . '"，请联系骑手取消订单"}';
            exit();
        }else{
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//设置配送员
if ($action == "setCourier") {

    if (!testPurview("updateWaimaiOrderCourier")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id) && $courier) {

        $ids = explode(",", $id);

        $now  = GetMkTime(time());
        $date = date("Y-m-d H:i:s", $now);

        //如果设置的是第三方配送平台
        $is_set_other = 0;
        if(strstr($courier, 'o_')){
            $is_set_other = 1;
            $courier = (int)str_replace('o_', '', $courier);
        }
        $note = '平台手动取消配送任务';

        $err = array();
        $errInfo = '操作失败！';

        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($value);

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;

        foreach ($ids as $key => $value) {

            $sql = $dsql->SetQuery("SELECT o.`sid`, o.`ordernum`, o.`ordernumstore`, o.`peisongid`, o.`peisongidlog`, o.`is_other`, o.`otherordernum`, o.`otherparam`, s.`shopname`,s.`cityid`,s.`coordX`,s.`coordY`,o.`lng`,o.`lat`,o.`address` useraddress,o.`person`,o.`tel`,s.`address`,s.`phone`,s.`billingtype`,s.`specify` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = '" . $value . "' AND o.`ordertype` = 0 AND o.`selftime` = 0 AND (o.`state` = 3 OR o.`state` = 4 OR o.`state` = 5)");
            /*到店自取的不配送*/
            $ret = $dsql->dsqlOper($sql, "results", "ASSOC", '', 0);
            if (!$ret) {
                $errInfo = '订单不存在或【订单状态异常、订单类型异常、订单配送方式不支持配送员配送】，请确认后重试！';
                array_push($err, $value);
                break;
            }

            $sid           = $ret[0]['sid'];
            $cityid        = $ret[0]['cityid'];
            $shopname      = $ret[0]['shopname'];
            $ordernum      = $ret[0]['ordernum'];
            $ordernumstore = $ret[0]['ordernumstore'];
            $peisongid     = $ret[0]['peisongid'];
            $peisongidlog  = $ret[0]['peisongidlog'];
            $is_other      = (int)$ret[0]['is_other'];
            $otherordernum = $ret[0]['otherordernum'];
            $otherparam    = $ret[0]['otherparam'];
            $lng           = $ret[0]['lng'];
            $lat           = $ret[0]['lat'];
            $_useraddress  = aesDecrypt($ret[0]['useraddress']);
            $useraddress   = !empty($_useraddress) ? explode(' ', $_useraddress) : array();
            $person        = aesDecrypt($ret[0]['person']);
            $tel           = aesDecrypt($ret[0]['tel']);
            $shopcoordY    = $ret[0]['coordY'];
            $shopcoordX    = $ret[0]['coordX'];
            $shopaddress   = $ret[0]['address'];
            $pubusermobile = $ret[0]['phone'];
            $billingtype   = $ret[0]['billingtype'];
            $specify       = $ret[0]['specify'];
            $map_type      = (int)$custom_map;

            global $cfg_map;  //系统默认地图
            $map_type = !$map_type ? $cfg_map : $map_type;

            if($map_type == 4){
                $map_type = 1;
            }

            //如果是第三方平台配送
            if ($is_other) {

                /*第三方配送员*/
                if ( $is_other != 0 ) {

                    if ($is_other == 1) {
                        $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                    } elseif($is_other == 2){
                        $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";

                    }elseif($is_other == 3){
                        $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";

                    }
                    include $pluginFile;
                    if (file_exists($pluginFile)) {

                        $otherarr = $otherparam != '' ? unserialize($otherparam) : array();

                        if ( $is_other == 1) {

                            $uuPaoTuiClass = new uuPaoTui();

                            $results = $uuPaoTuiClass->cancelOrder($otherordernum,$note);

                        }elseif($is_other == 3){
                            $maiyatianClass = new maiyatian();
                            $paramarr = array(
                                'ordernum' => $ordernum,
                                'cancel_reason' => $note,
                                'cancel_reason_code' => $note
                            );
                            $results = $maiyatianClass->cancelOrder($paramarr);
                            if ($results['code'] == 1){
                                $mytcancel_fee =  $results['data']['cancel_fee'];
                                $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `mytcancel_fee` = '$mytcancel_fee' WHERE `ordernum` = '$ordernum'");
                                $dsql->dsqlOper($sql, "update");
                            }
                        }
                    }
                }

                //更新订单表状态
                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 3, `courier_pushed` = 0, `peisongid` = '0', `is_other` = 0 WHERE (`state` = 4 OR `state` = 5) AND `id` = " . $value);
                $ret = $dsql->dsqlOper($sql, "update");

            }
            else{

                // 没有变更
                if (!$is_set_other && $courier == $peisongid) {
                    $errInfo = '配送员未发生变化，设置失败！';
                    array_push($err, $value);
                    break;
                }

            }

            //使用第三方平台配送
            if ($is_set_other){

                $peisong_platform = $courier == 1 ? 'UU跑腿' : '麦芽田';

                //判断之前是否为自己平台配送，如果有的话，更新配送日志，并给骑手发送取消配送通知
                if ($peisongid) {

                    $sql = $dsql->SetQuery("SELECT `id`, `name`, `phone`,`cityid`,`getproportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        foreach ($ret as $k => $v) {
                            if ($v['id'] == $peisongid) {
                                $peisongname_ = $v['name'];
                                $peisongtel_  = $v['phone'];
                                $ccityid_     = $v['cityid'];
                            } else {
                                $ccityid       = $v['cityid'];
                                $peisongname   = $v['name'];
                                $peisongtel    = $v['phone'];
                                $getproportion = $v['getproportion'];
                            }
                        }
                    }
                    
                    // 骑手变更记录
                    $pslog = "此订单在 " . $date . " 重新分配了配送员，原配送员是：" . $peisongname_ . "（" . $peisongtel_ . "），新配平台是:" . $peisong_platform . "<hr>" . $peisongidlog;

                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 4, `peisongid` = '0', `peisongidlog` = '$pslog', `peidate` = '$now', `courier_pushed` = 0 , `courierfencheng` = '$courierfencheng', `is_other` = $courier WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value");
                    $ret = $dsql->dsqlOper($sql, "update");
                    if ($ret == "ok") {
                        sendapppush($peisongid, "您有订单被其他骑手派送", "订单号：" . $shopname . $ordernumstore, "", "peisongordercancel");
                    }

                }

                $peisongname = $peisong_platform;


                //向第三方平台发布订单
                if ($courier == 1) {
                    $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                } elseif($courier == 2){
                    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                }elseif($courier == 3){
                    $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
                }
                include $pluginFile;
                if (file_exists($pluginFile)) {

                    if ( $courier == 1) {

                        $otherarr['person']        = $person;
                        $otherarr['tel']           = $tel;
                        $otherarr['pubusermobile'] = $pubusermobile;
                        $otherarr['callback_url']  = $cfg_secureAccess . $cfg_basehost . '/include/plugins/13/uuPaotuiCallback.php';
                        /*uu下单*/
                        $uuPaoTuiClass = new uuPaoTui();

                        $results = $uuPaoTuiClass->putOrder($otherarr);

                        $order_code  = $results['ordercode'];
                        $return_code = $results['return_code'];
                        $return_msg  = $results['return_msg'];
                        $otherparam  = serialize($results);

                        if ($order_code != 'ok' && $return_msg == 'price_token无效') {

                            $cityname          = getCityname($shopcoordY, $shopcoordX);
                            $Calculatepricearr = array(
                                'city_name'     => $cityname,
                                'from_address'  => $shopaddress,
                                'from_usernote' => $shopname,
                                'from_lat'      => $shopcoordX,
                                'from_lng'      => $shopcoordY,
                                'to_address'    => $useraddress[0],
                                'to_usernote'   => $useraddress[1],
                                'to_lat'        => $lat,
                                'to_lng'        => $lng,
                            );

                            $getpirceresults = $uuPaoTuiClass->Calculateprice($Calculatepricearr);

                            if (is_array($getpirceresults)) {
                                $price_token = $getpirceresults['price_token'];

                                $otherarr['price_token'] = $price_token;

                                $aginresults = $uuPaoTuiClass->putOrder($otherarr);

                                $order_code  = $aginresults['ordercode'];
                                $return_code = $aginresults['return_code'];
                                $return_msg  = $aginresults['return_msg'];
                                $otherparam  = serialize($aginresults);
                            } else {

                                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value");
                                $ret = $dsql->dsqlOper($sql, "update");

                                echo '{"state": 200, "info": ' . $getpirceresults . '}';
                                exit();
                            }

                        }

                    }elseif($courier == 3){
                        $backurl = $cfg_secureAccess . $cfg_basehost . '/include/plugins/19/maiyatian.callback.php';
//                            $backurl = 'https://ihuoniao.cn/include/plugins/19/maiyatian.callback.php';
                        $paramarr = array ( 'shop_dismode'=>$billingtype,'shop_logistic' => $specify, 'shop_id' => $sid ,'shop_ordernum' => $ordernum, 'order_sn' => $ordernumstore ,'is_subscribe' => 0,'subscribe_time' => 0, 'lng' => $lng, 'lat' => $lat , 'address' => $_useraddress, 'address_detail' => $_useraddress, 'mem_name' => $person , 'mem_phone' => $tel , 'map_type' => $map_type , 'callback_url' => $backurl
                        );
                        $maiyatianClass = new maiyatian();
                        $results = $maiyatianClass->mytdel( $paramarr );
                        if ($results['code'] != 1){
                            echo '{"state": 200, "info": "麦芽田：' . $results['message'] . '"}';
                            exit();
                        }else{
                            $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $courier, `peisongid` = '0' WHERE `id` = '$value'");
                            $dsql->dsqlOper($othersql, "update");
                        }
                    }

                    if ($return_code == 'ok') {
                        if ($courier == 1) {
                            $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $courier, `peisongid` = '0' ,`otherparam` = '$otherparam',`otherordernum` = '$order_code' WHERE `id` = '$value'");
                        } else {
                            $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $courier, `peisongid` = '0' ,`otherordernum` = '$order_code' WHERE `id` = '$value'");
                        }
                        $dsql->dsqlOper($othersql, "update");

                    } else {
                     if($courier == 2){
                         $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `peisongid` = '0', `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value");
                         $ret = $dsql->dsqlOper($sql, "update");

                         echo '{"state": 200, "info": "' . $return_msg . '"}';
                         exit();
                     }

                    }


                    //消息通知用户
                    $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, o.`pubdate`, o.`food`, o.`amount`, s.`shopname`, c.`name`, c.`phone` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid` WHERE o.`id` = $value");
                    $ret_ = $dsql->dsqlOper($sql_, "results");
                    if ($ret_) {
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
                        foreach ($food as $k => $v) {
                            array_push($foods, $v['title'] . " " . $v['count'] . "份");
                        }

                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "module"   => "waimai",
                            "id"       => $value
                        );

                        //自定义配置
                        $config = array(
                            "ordernum"   => $shopname . $ordernumstore,
                            "orderdate"  => date("Y-m-d H:i:s", $pubdate),
                            "orderinfo"  => join(" ", $foods),
                            "orderprice" => $amount,
                            "peisong"    => $peisong_platform,
                            "fields"     => array(
                                'keyword1' => '订单号',
                                'keyword2' => '订单详情',
                                'keyword3' => '订单金额',
                                'keyword4' => '配送人员'
                            )
                        );

                        updateMemberNotice($uid, "会员-订单配送提醒", $param, $config, '', '', 0, 0);
                    }

                }                
                

            }
            //平台自己配送
            else{

                $sql = $dsql->SetQuery("SELECT `id`, `name`, `phone`,`cityid`,`getproportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid || `id` = $courier");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $k => $v) {
                        if ($v['id'] == $peisongid) {
                            $peisongname_ = $v['name'];
                            $peisongtel_  = $v['phone'];
                            $ccityid_     = $v['cityid'];
                        } else {
                            $ccityid       = $v['cityid'];
                            $peisongname   = $v['name'];
                            $peisongtel    = $v['phone'];
                            $getproportion = $v['getproportion'];
                        }
                    }
                }
                if ($cityid != $ccityid) {
                    $errInfo = '配送员不在该订单配送城市，设置失败！';
                    array_push($err, $value);
                    break;
                }

                if ($peisongid) {
                    // 骑手变更记录
                    //如果上一次是第三方平台配送
                    if($is_other){
                        $peisong_platform = $is_other == 1 ? 'UU跑腿' : '麦芽田';
                        $pslog = "此订单在 " . $date . " 重新分配了配送员，原配送平台是：" . $peisong_platform . "，新配送员是:" . $peisongname . "（" . $peisongtel . "）<hr>" . $peisongidlog;
                    }
                    else{
                        $pslog = "此订单在 " . $date . " 重新分配了配送员，原配送员是：" . $peisongname_ . "（" . $peisongtel_ . "），新配送员是:" . $peisongname . "（" . $peisongtel . "）<hr>" . $peisongidlog;
                    }
                } else {
                    $pslog = "";
                }

                $courierfencheng  = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;

                if ($peisongid) {
                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 4, `is_other` = 0, `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now', `courier_pushed` = 0 , `courierfencheng` = '$courierfencheng' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value");
                } else {
                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 4, `is_other` = 0, `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now' , `courierfencheng` = '$courierfencheng' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value");
                }
                //$sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 4, `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value");
                $ret = $dsql->dsqlOper($sql, "update");
                if ($ret == "ok") {

                    //推送消息给骑手
                    global $cfg_basehost;
                    global $cfg_secureAccess;
                    $url = $cfg_secureAccess . $cfg_basehost . '/index.php?service=waimai&do=courier&template=detail&id=' . $value;
                    sendapppush($courier, "您有新的配送订单", "订单号：" . $shopname . $ordernumstore, $url, "newfenpeiorder");
                    // aliyunPush($courier, "您有新的配送订单", "订单号：".$shopname.$ordernumstore, "newfenpeiorder", $cfg_secureAccess.$cfg_basehost.'/index.php?service=waimai&do=courier&template=detail&id='.$value);

                    if ($peisongid) {
                        sendapppush($peisongid, "您有订单被其他骑手派送", "订单号：" . $shopname . $ordernumstore, "", "peisongordercancel");
                        // aliyunPush($peisongid, "您有订单被其他骑手派送", "订单号：".$shopname.$ordernumstore, "peisongordercancel");
                    }

                    //消息通知用户
                    $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, o.`pubdate`, o.`food`, o.`amount`, s.`shopname`, c.`name`, c.`phone` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid` WHERE o.`id` = $value");
                    $ret_ = $dsql->dsqlOper($sql_, "results");
                    if ($ret_) {
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
                        foreach ($food as $k => $v) {
                            array_push($foods, $v['title'] . " " . $v['count'] . "份");
                        }

                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "module"   => "waimai",
                            "id"       => $value
                        );

                        //自定义配置
                        $config = array(
                            "ordernum"   => $shopname . $ordernumstore,
                            "orderdate"  => date("Y-m-d H:i:s", $pubdate),
                            "orderinfo"  => join(" ", $foods),
                            "orderprice" => $amount,
                            "peisong"    => $name . "，" . $phone,
                            "fields"     => array(
                                'keyword1' => '订单号',
                                'keyword2' => '订单详情',
                                'keyword3' => '订单金额',
                                'keyword4' => '配送人员'
                            )
                        );

                        updateMemberNotice($uid, "会员-订单配送提醒", $param, $config, '', '', 0, 0);
                    }


                } else {
                    array_push($err, $value);
                }

            }

            adminLog("外卖订单设置配送员", $shopname . $ordernumstore . '=>' . $peisongname);
            

        }

        if ($err) {
            echo '{"state": 200, "info": "'.$errInfo.'"}';
            exit();
        } else {
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }


    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//取消配送员
if ($action == "cancelCourier") {

    if (!testPurview("updateWaimaiOrderCourier")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id)) {

        $note = '平台手动取消配送任务';

        $r   = true;
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`peisongid`, o.`ordernumstore`, o.`is_other`, o.`ordernum`, o.`otherordernum`, s.`shopname` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE (o.`state` = 4 OR o.`state` = 5) AND o.`id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            foreach ($ret as $key => $value) {

                $peisongid     = $value['peisongid'];
                $ordernumstore = $value['ordernumstore'];
                $shopname      = $value['shopname'];
                $is_other      = (int)$value['is_other'];
                $ordernum      = $value['ordernum'];
                $otherordernum = $value['otherordernum'];

                $sub         = new SubTable('waimai_order', '#@__waimai_order');
                $break_table = $sub->getSubTableById($value['id']);

                //如果是第三方平台配送
                if ($is_other) {

//                    $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");

//                    $pluginsres = $dsql->dsqlOper($pluginssql, "results");

                    $inc = HUONIAOINC . "/config/waimai.inc.php";
                    include $inc;
                    /*第三方配送员*/
                    if ( $is_other != 0 ) {

                        if ($is_other == 1) {
                            $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                        } elseif($is_other == 2){
                            $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";

                        }elseif($is_other == 3){
                            $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";

                        }
                        include $pluginFile;
                        if (file_exists($pluginFile)) {

                            $otherarr = $data['otherparam'] != '' ? unserialize($data['otherparam']) : array();

                            if ( $is_other == 1) {

                                $uuPaoTuiClass = new uuPaoTui();

                                $results = $uuPaoTuiClass->cancelOrder($otherordernum,$note);

                            } elseif( $is_other == 2){

                                if ($state == 4 || $state == 5) {

                                    echo '{"state": 200, "info": "其中有优闪速达的订单取消失败:配送中的订单不能取消，如要取消，需要拨打各跑腿平台自行客服取消订单，发布订单骑手接单超2分钟取消订单将会扣取2元误工费"}';
                                    exit();
                                }

                                $youShanSuDaClass = new youshansuda();

                                $paramarr = array(
                                    'order_no' => $otherordernum
                                );
                                $results = $youShanSuDaClass->cancelOrder($paramarr);
                            }elseif($is_other == 3){
                                $maiyatianClass = new maiyatian();
                                $paramarr = array(
                                    'ordernum' => $ordernum,
                                    'cancel_reason' => $note,
                                    'cancel_reason_code' => $note
                                );
                                $results = $maiyatianClass->cancelOrder($paramarr);
                                if ($results['code'] == 1){
                                    $mytcancel_fee =  $results['data']['cancel_fee'];
                                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `mytcancel_fee` = '$mytcancel_fee' WHERE `ordernum` = '$ordernum'");
                                    $dsql->dsqlOper($sql, "update");
                                }
                            }
                        }
                    }

                    //更新订单表状态
                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 3, `courier_pushed` = 0, `peisongid` = '0', `is_other` = 0 WHERE (`state` = 4 OR `state` = 5) AND `id` = " . $value['id']);
                    $ret = $dsql->dsqlOper($sql, "update");

                    if ($ret == "ok") {
                        
                    } else {
                        $r = false;
                    }


                }else{

                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 3, `courier_pushed` = 0, `peisongid` = '0' WHERE (`state` = 4 OR `state` = 5) AND `id` = " . $value['id']);
                    $ret = $dsql->dsqlOper($sql, "update");

                    if ($ret == "ok") {
                        sendapppush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：" . $shopname . $ordernumstore, "", "peisongordercancel");
                    } else {
                        $r = false;
                    }

                }

                adminLog("外卖订单取消配送员", $shopname . $ordernumstore);
                
            }
        }

        if ($r) {
            echo '{"state": 100, "info": "操作成功！"}';
        } else {
            echo '{"state": 200, "info": "操作失败！"}';
        }
        exit();
    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

// 退款
// if($action == "refund"){

//   $userid = $userLogin->getUserID();
//   if($userid == -1){
//     echo '{"state": 200, "info": "登陆超时"}';
//     exit();
//   }

//   if(empty($id)){
//     echo '{"state": 200, "info": "参数错误"}';
//     exit();
//   }

//   // $sql = $dsql->SetQuery("SELECT o.`paytype`, o.`uid`, o.`amount`, o.`ordernumstore`, l.`ordernum`, o.`transaction_id`, s.`shopname` FROM `#@__waimai_order_all` o LEFT JOIN `#@__pay_log` l ON l.`ordernum` = o.`ordernum` LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 7 AND o.`paytype` != 'delivery' AND o.`refrundstate` = 0 AND o.`amount` > 0 AND o.`id` = $id ORDER BY l.`id` DESC LIMIT 0,1");
//   $sql = $dsql->SetQuery("SELECT o.`state`, o.`paytype`, o.`uid`, o.`amount`, o.`refrundstate`, o.`refrundno`, o.`refrunddate`, o.`refrundamount`, o.`ordernumstore`, l.`ordernum`, o.`transaction_id`, s.`shopname` FROM `#@__waimai_order` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`paytype` != 'delivery' AND (o.`refrundstate` = 0 || (o.`refrundstate` = 1 AND o.`refrundamount` != 0)) AND o.`amount` > 0 AND o.`id` = $id ORDER BY l.`id` DESC LIMIT 0,1");
//   $ret = $dsql->dsqlOper($sql, "results");

//   if($ret){

//     $value = $ret[0];
//     $date  = GetMkTime(time());

//     $uid            = $value['uid'];
//     $paytype        = $value['paytype'];
//     $amount         = $value['amount'];
//     $ordernum       = $value['ordernum'];
//     $transaction_id = $value['transaction_id'];
//     $shopname       = $value['shopname'];
//     $ordernumstore  = $value['ordernumstore'];

//     $sub = new SubTable('waimai_order', '#@__waimai_order');
//     $break_table = $sub->getSubTableById($id);

//     $sql = $dsql->SetQuery("UPDATE `".$break_table."` SET `refrundstate` = 1, `refrunddate` = '$date', `refrundadmin` = $userid, `refrundfailed` = '' WHERE `id` = $id");
//     $ret = $dsql->dsqlOper($sql, "update");
//     if($ret != "ok"){
//       echo '{"state": 200, "info": "操作失败！"}';
//       exit();
//     }

//     $r = true;

//     // 余额支付
//     if($paytype == "money"){

//         $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $amount WHERE `id` = $uid");
//         $dsql->dsqlOper($sql, "update");

//     // 支付宝
//     }elseif($paytype == "alipay"){

//       $order = array(
//         "ordernum" => $ordernum,
//         "amount" => $amount
//       );

//       require_once(HUONIAOROOT."/api/payment/alipay/alipayRefund.php");
//       $alipayRefund = new alipayRefund();

//       $return = $alipayRefund->refund($order);

//       // 成功
//       if($return['state'] == 100){

//         $sql = $dsql->SetQuery("UPDATE `".$break_table."SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
//         $ret = $dsql->dsqlOper($sql, "update");

//       }else{

//         $r = false;

//       }


//     // 微信
//     }elseif($paytype == "wxpay"){

//       $order = array(
//         "ordernum" => $ordernum,
//         "amount" => $amount
//       );

//       require_once(HUONIAOROOT."/api/payment/wxpay/wxpayRefund.php");
//       $wxpayRefund = new wxpayRefund();

//       $return = $wxpayRefund->refund($order);

//       // 成功
//       if($return['state'] == 100){

//         $sql = $dsql->SetQuery("UPDATE `".$break_table."` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
//         $ret = $dsql->dsqlOper($sql, "update");

//       }else{

//         $r = false;

//       }


//     // 银联
//     }elseif($paytype == "unionpay"){

//       $order = array(
//         "ordernum" => $ordernum,
//         "amount" => $amount,
//         "transaction_id" => $transaction_id
//       );

//       require_once(HUONIAOROOT."/api/payment/unionpay/unionpayRefund.php");
//       $unionpayRefund = new unionpayRefund();

//       $return = $unionpayRefund->refund($order);

//       // 成功
//       if($return['state'] == 100){

//         $sql = $dsql->SetQuery("UPDATE `".$break_table."` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
//         $ret = $dsql->dsqlOper($sql, "update");

//       }else{

//         $r = false;

//       }
//     }else{
//       $r = false;
//     }

//     if($r){
//       //保存操作日志
//       $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$uid', '1', '$amount', '外卖退款：".$shopname.$ordernumstore."', '$date')");
//       $dsql->dsqlOper($archives, "update");

//       $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
//       $user = $dsql->dsqlOper($sql, "results");
//       if($user){
//         $param = array(
//           "service" => "member",
//           "type" => "user",
//           "template" => "record"
//         );
//         // updateMemberNotice($uid, "会员-订单退款成功", $param, array("username" => $user['username'], "order" => $shopname.$ordernumstore, 'amount' => $amount));
//       }

//       echo '{"state": 100, "info": "退款操作成功！"}';
//     }else{

//       $sql = $dsql->SetQuery("UPDATE `".$break_table."` SET `refrundstate` = 0, `refrunddate` = '', `refrundfailed` = '' WHERE `id` = $id");
//       $ret = $dsql->dsqlOper($sql, "update");
//       echo '{"state": 200, "info": "退款失败，错误码：'.$return['code'].'"}';

//     }

//     exit();

//   }else{

//     echo '{"state": 200, "info": "操作失败，请检查订单状态！"}';
//     exit();
//   }

// }

if ($action == "refund") {
    global  $userLogin;
    // 退款金额
    //外卖分表
    $sub         = new SubTable('waimai_order', '#@__waimai_order');
    $break_table = $sub->getSubTableById($id);

    $setAmount = (float)$amount;
    $userid    = $userLogin->getUserID();
    if ($userid == -1) {
        echo '{"state": 200, "info": "登陆超时"}';
        exit();
    }

    if (empty($id)) {
        echo '{"state": 200, "info": "参数错误"}';
        exit();
    }

    $sql = $dsql->SetQuery("SELECT o.`state`, o.`paytype`, o.`uid`,o.`amount`, o.`refrundstate`, o.`refrundno`, o.`refrunddate`, o.`refrundamount`, o.`ordernumstore`, o.`ordernum`, o.`transaction_id`,o.`balance`,o.`point`,o.`is_vipprice`,o.`vippriceinfo`,o.`courier_get`,o.`peisongid`,s.`shopname`,sm.`userid` smuserid FROM `#@__waimai_order_all` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` LEFT JOIN `#@__waimai_shop_manager`sm ON s.`id` = sm.`shopid` WHERE o.`paytype` != 'delivery' AND (o.`refrundstate` = 0 || (o.`refrundstate` = 1 AND o.`refrundamount` != 0))  AND o.`id` = $id ORDER BY l.`id` DESC, sm.`id` ASC LIMIT 0,1");

    $ret = $dsql->dsqlOper($sql, "results");

    if ($ret) {

        $value = $ret[0];
        $date  = GetMkTime(time());

        $uid            = $value['uid'];
        $smuserid       = $value['smuserid'];
        $paytype        = $value['paytype'];
        $orderamount    = $value['amount'];
        $refrundstate   = $value['refrundstate'];
        $refrundno      = $value['refrundno'];
        $refrunddate    = $value['refrunddate'];
        $refrundamount  = $value['refrundamount'];
        $ordernum       = $value['ordernum'];
        $transaction_id = $value['transaction_id'];
        $shopname       = $value['shopname'];
        $balance        = $value['balance'];
        $point          = $value['point'];
        $pointt         = $value['point'];
        $peisongid      = $value['peisongid'];
        $ordernumstore  = $value['ordernumstore'];
        $state          = $value['state'];
        $courier_get    = $value['courier_get'];
        $is_vipprice    = $value['is_vipprice'];
        $vippriceinfo   = $value['vippriceinfo'];

        // 验证权限
        if ($state == 7) {
            if (!testPurview("waimaiOrderRefund")) {
                die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
            }
        } elseif ($state == 1) {
            if (!testPurview("waimaiSucOrderRefund")) {
                die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
            }
        } else {
            die('{"state": 200, "info": ' . json_encode('操作失败，请检查订单状态') . '}');
        }


        $amount = $orderamount;

        // 全额
        $maxAmount = $amount - $refrundamount;
        if (empty($setAmount) && $is_vipprice) {
            $this_amount = $maxAmount;
        } else {
            if ($setAmount == 0) {
                $this_amount = $maxAmount;
            } else {

                $this_amount = $setAmount > $maxAmount ? $maxAmount : $setAmount;
            }
        }
        // 如果本次退款后已全额退款，退款金额设为0;
        $refrundamount_ = $refrundamount + $this_amount;

        if ($refrundamount_ == $amount) {
            $refrundamount_ = 0;
        }

        /*混合支付查询实际支付金额*/
        $archive = $dsql->SetQuery("SELECT `body`, `amount`,`id` FROM `#@__pay_log` WHERE `ordertype` = 'waimai' AND `ordernum` = '$ordernum'");
        $results = $dsql->dsqlOper($archive, "results");
        if (!$results) {
            echo '{"state": 200, "info": "操作失败，请检查订单状态！"}';
            exit();
        }
        $payprice = $results[0]['amount'];        // 在线支付金额

        $patypem = 0;
        if ($payprice != 0 && $balance != 0 && $point != 0) {
            $patypem = 1;
        } elseif ($payprice != 0 && $balance != 0 && $point == 0) {
            $patypem = 2;
        } elseif ($payprice != 0 && $point != 0 && $balance == 0) {
            $patypem = 3;
        } elseif ($balance != 0 && $point != 0 && $payprice == 0) {
            $patypem = 4;
        }
        /*$patypem 1- 实际+m+p 2- 实际+m*/
        //混合支付退款
        $refrunddate = GetMkTime(time());
        if ($patypem != 0) {
            /*混合支付情况 退款金额大于实际支付金额 实际支付还可以退多少*/
            if ($patypem == 1 || $patypem == 2 || $patypem == 3) {
                if ($payprice <= $this_amount) {
                    /*实际支付小于本次退款*/
                    if ($payprice <= $refrundamount) {
                        /*实际支付小于退款金额说明实际支付的钱已经全部退完*/
                        $truemoneysy = 0;
                    } else {

                        $truemoneysy = $payprice;
                    }
                } else {
                    if ($payprice > $refrundamount) {
                        /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                        $truemoneysy = bcsub($payprice, $refrundamount, 2);
                        if ($truemoneysy > $this_amount) {
                            /*实际部分未退款大于此次退款金额*/
                            $truemoneysy = $this_amount;
                        }
                    } else {
                        /*实际支付小于退款记录 说明实际支付已经全部退完*/
                        $truemoneysy = 0;
                    }
                }

                if ($patypem == 1 || $patypem == 2) {
                    /*余额部分*/
                    $money_amount = bcsub($this_amount, $truemoneysy, 2);
                    $point        = 0;
                } else {

                    $point = bcsub($this_amount, $truemoneysy, 2) * $cfg_pointRatio;
                }
            } else {
                if ($balance <= $this_amount) {
                    /*实际支付小于本次退款*/
                    if ($balance <= $refrundamount) {
                        /*实际支付小于退款金额说明实际支付的钱已经全部退完*/
                        $money_amount = 0;
                    } else {

                        $money_amount = $balance;
                    }
                } else {
                    if ($balance > $refrundamount) {
                        /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                        $money_amount = bcsub($balance, $refrundamount, 2);
                        if ($money_amount > $this_amount) {
                            /*实际部分未退款大于此次退款金额*/
                            $truemoneysy = $this_amount;
                        }
                    } else {
                        /*实际支付小于退款记录 说明实际支付已经全部退完*/
                        $money_amount = 0;
                    }
                }
                $point = $this_amount * $cfg_pointRatio - $money_amount * $cfg_pointRatio;
            }
        } else {
            $truemoneysy  = $this_amount >= $payprice ? (!empty($payprice) || $payprice != '0.00' ? $payprice : 0 ) : $this_amount;         // 在线支付金额

            if(empty($truemoneysy) || $truemoneysy == '0.00'){

                $money_amount = $this_amount >= $balance  ? (!empty($balance) || $balance != '0.00' ? $balance : 0 )  : $this_amount;         // 余额支付金额
            }

        }

        global $paytypee;
        $paytypee =$paytype;
        if ($state != 7) {
            //退款之前获取应该得多少钱
            $statistmoney = getwaimai_staticmoney('2', $id);
//            if ($paytypee == 'huoniao_bonus'){
//                $businessold  = 0;
//            }else{
                $businessold  = $statistmoney['business'];
//            }
            $ptsd         = $statistmoney['ptyd'];              //平台所得

        }
        $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrundstate` = 1, `refrunddate` = '$date', `refrundamount` = '$refrundamount_', `refrundadmin` = $userid, `refrundfailed` = '' WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret != "ok") {
            echo '{"state": 200, "info": "操作失败！"}';
            exit();
        }

        $r = true;
        if ($state != 7) {
            $statistmoney = getwaimai_staticmoney('2', $id);
            $businessnew  = $statistmoney['business'];
            $ptyd         = $statistmoney['ptyd'];
            $business     = $businessold - $businessnew;
            //business ==0 说明是一次全款else就是分批退款
            if ($business == 0) {

                $business = $businessnew;

            } elseif ($business < 0) {
                $business = $businessnew - abs($business);
            }
        }

        //查询商铺余额
        $shopmoneysql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = $smuserid");
        $shopmoneyres = $dsql->dsqlOper($shopmoneysql, "results");
        $shopmoney    = $shopmoneyres[0]['money'];
        if ($shopmoney < $business && $state != 7) {

            //恢复订单退款状态
            $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrundstate` = 0 WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");

            die('{"state": 200, "info": ' . json_encode('成功订单涉及到结算资金，退款金额需要从商户的账户中扣除，由于商户余额不足，退款失败!') . '}');
        }

        $courierstr = '';
        if ($refrundamount_ == 0 ) {
            /*扣除骑手所得*/
            if ($state ==1) {
                $courierstr = ",`courier_get` = '0',`courier_tuikuan`='".$courier_get."'";
                $archives = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` - '$courier_get' WHERE `id` = " . $peisongid);
                $dsql->dsqlOper($archives, "update");
                $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$peisongid'");           //查询骑手余额
                $courieMoney = $dsql->dsqlOper($selectsql,"results");
                $courierMoney = $courieMoney[0]['money'];
                $date = GetMkTime(time());
                $info ='退款收支-'.$shopname.'-'.$ordernumstore;
                //记录操作日志
                $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`) VALUES ('$peisongid','0','$courier_get','$info','$date','$courierMoney')");
                $dsql->dsqlOper($insertsql,"update");

                //更新订单的骑手退款明细
                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrundstate` = 1 ".$courierstr." WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
        }


        $sql         = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
        $ret         = $dsql->dsqlOper($sql, "results");
        $pay_name    = '';
        $pay_namearr = array();

        if (!empty($ret)) {
            $pay_name = $ret[0]['pay_name'];
        } else {
            $pay_name = $ret[0]["paytype"];
        }

        if ($pay_name) {
            array_push($pay_namearr, $pay_name);
        }

        if ($balance != '') {
            array_push($pay_namearr, '余额');
        }

        if ($pay_namearr) {
            $pay_name = join(',', $pay_namearr);
        }

        if ($state != 7) {
            //扣除商家资金
            $shopsql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $business WHERE `id` = $smuserid");
            $shopres = $dsql->dsqlOper($shopsql, "update");

            if ($shopres == "ok") {
                $paramUser = array(
                    "id" => $id
                );
                $urlParam  = serialize($paramUser);

                $tuikuan      = array(
                    'paytype'      => $pay_name,
                    'truemoneysy'  => 0,
                    'money_amount' => $business,
                    'point'        => 0,
                    'refrunddate'  => $refrunddate,
                    'refrundno'    => 0
                );
                $tuikuanparam = serialize($tuikuan);
                $user  = $userLogin->getMemberInfo($smuserid);
                $usermoney = $user['money'];
//                $money  = sprintf('%.2f',($usermoney - $business));
                $now          = GetMkTime(time());
                $shoparchives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`balance`) VALUES ('$smuserid','0' ,'$business', '外卖退款:$ordernum', '$now','','','waimai','','tuikuan','$urlParam','$ordernum','$tuikuanparam','外卖消费','1','$usermoney')");
                $dsql->dsqlOper($shoparchives, "update");
                //扣除佣金记录并且扣除分站佣金
                $cityid = $user['cityid'];
                //分站佣金
                $fzFee = cityCommission($cityid,'waimai');
                global $cfg_fzwaimaiFee;
                $fztotalAmount_ = $ptyd * (float)$fzFee / 100;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

                //查询分站活的佣金

                $fzsql = $dsql->SetQuery("SELECT `id`,`cityid`,`commission`,`platform` FROM `#@__member_money` WHERE `info` LIKE '%" . $ordernum . "%' AND `ordertype` = 'waimai' AND `showtype` = 1");
                $fzres = $dsql->dsqlOper($fzsql, "results");
                if (!empty($fzres) && is_array($fzres)) {
                    // $id         = $fzres[0]['id'];
                    $cityid     = $fzres[0]['cityid'];
                    $commission = $fzres[0]['commission'];
                    $platform = $fzres[0]['platform'];

                    $fztotalAmount_ = $commission - $fztotalAmount_;
                    //扣除退款的佣金
                    $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$fztotalAmount_' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($fzarchives, "update");
//
//                    //记录更新
//                    $fzmoney = $dsql->SetQuery("UPDATE `#@__member_money` SET `commission` = `commission` - '$fztotalAmount_' WHERE `id` = '$id'");
//                    $dsql->dsqlOper($fzmoney, "update");

                    //分站余额
                    $sql = $dsql->SetQuery("SELECT `money`  FROM `#@__site_city` WHERE  `cid` = '$cityid'");
                    $resmoney = $dsql->dsqlOper($sql, "results");
                    $submoney = $resmoney[0]['money'];          // 分站余额

                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`platform`,`balance`,`showtype`,`commission`,`substation`,`cityid`) VALUES ('$uid', '0', '$fztotalAmount_', '外卖退款：$ordernum', '$now','waimai','tuikuan','$urlParam','$ordernum','$tuikuanparam','外卖消费','1','$platform','$usermoney','1','$commission','$submoney','$cityid')");
                    $dsql->dsqlOper($archives, "update");

                }
                //退回分销的钱
                $tuifenxiao = tuiFenXiao($ordernum,'waimai',$urlParam,$tuikuanparam);

                // var_dump($fzsql);die;
            }

        }


        $refrunddate = $date;
        $refrundno   = '';

        if ($is_vipprice == 1) {

            $vippriceinfov = unserialize($vippriceinfo);

            $vipprice = $vippriceinfov['price'];

            /*包含会员支付金额 并且实际支付大于 会员价格*/
            if ($truemoneysy > 0 && $truemoneysy >= $vipprice) {

                $truemoneysy = $truemoneysy - $vipprice;

            } else {

                $vbalance = $vipprice - $truemoneysy;

                if ($vbalance < 0) {
                    global $cfg_pointRatio;

                    $point -= abs($vbalance) * $cfg_pointRatio;
                } else {
                    $money_amount -= $vbalance;
                }

                $truemoneysy = 0;
            }


        }
        // 支付宝
        if ($paytype == "alipay" && $truemoneysy != 0) {

            $order = array(
                "ordernum"    => $ordernum,
                "orderamount" => $orderamount,
                "amount"      => $truemoneysy
            );

            require_once(HUONIAOROOT . "/api/payment/alipay/alipayRefund.php");
            $alipayRefund = new alipayRefund();

            $return = $alipayRefund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");


            } else {

                $r = false;

            }


            // 微信
        } elseif ($paytype == "wxpay" && $truemoneysy != 0) {
            if ($payprice != $orderamount) {
                $orderamount = $payprice;
            }
            $order = array(
                "ordernum"    => $ordernum,
                "orderamount" => $orderamount,
                "amount"      => $truemoneysy
            );
            require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
            $wxpayRefund = new wxpayRefund();

            $return = $wxpayRefund->refund($order);
            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");

            } else {

                require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
                $wxpayRefund = new wxpayRefund();

                $return = $wxpayRefund->refund($order, true);

                // 成功
                if ($return['state'] == 100) {
                    $refrunddate = GetMkTime($return['date']);
                    $refrundno   = $return['trade_no'];
                    $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id");
                    $ret         = $dsql->dsqlOper($sql, "update");

                } else {
                    $r = false;
                }

            }


            // 银联
        } elseif ($paytype == "unionpay" && $truemoneysy != 0) {

            $order = array(
                "ordernum"       => $ordernum,
                "orderamount"    => $orderamount,
                "amount"         => $truemoneysy,
                "transaction_id" => $transaction_id
            );

            require_once(HUONIAOROOT . "/api/payment/unionpay/unionpayRefund.php");
            $unionpayRefund = new unionpayRefund();

            $return = $unionpayRefund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");

            } else {

                $r = false;

            }


            // 工行E商通
        } elseif ($paytype == "rfbp_icbc" && $truemoneysy != 0) {

            $order = array(
                "ordernum"    => $ordernum,
                "orderamount" => $orderamount,
                "amount"      => $truemoneysy
            );

            require_once(HUONIAOROOT . "/api/payment/rfbp_icbc/rfbp_refund.php");
            $rfbp_refund = new rfbp_refund();

            $return = $rfbp_refund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");
            } else {
                $r = false;
            }


            // 百度小程序
        } elseif ($paytype == "baidumini" && $truemoneysy != 0) {

            $order = array(
                "ordernum"    => $ordernum,
                "orderamount" => $orderamount,
                "amount"      => $truemoneysy
            );

            require_once(HUONIAOROOT . "/api/payment/baidumini/refund.php");
            $baiduminiRefund = new baiduminiRefund();

            $return = $baiduminiRefund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");
            } else {
                $r = false;
            }


            // YabandPay
        } elseif (($paytype == "yabandpay_wxpay" || $paytype == "yabandpay_alipay") && $truemoneysy != 0) {

            $order = array(
                "ordernum"    => $ordernum,
                "orderamount" => $orderamount,
                "amount"      => $truemoneysy
            );

            require_once(HUONIAOROOT . "/api/payment/yabandpay_wxpay/yabandpay_refund.php");
            $yabandpay_refund = new yabandpay_refund();

            $return = $yabandpay_refund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrunddate = GetMkTime($return['date']);
                $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");
            } else {
                $r = false;
            }


            // bytemini
        } elseif ($paytype == "bytemini" && $truemoneysy != 0) {

            $order = array(
                "service" => 'waimai',
                "ordernum" => $ordernum,
                "orderamount" => $truemoneysy,
                "amount" => $truemoneysy
            );

            require_once(HUONIAOROOT . "/api/payment/bytemini/bytemini_refund.php");
            $bytemini_refund = new bytemini_refund();

            $return = $bytemini_refund->refund($order);

            // 成功
            if ($return['state'] == 100) {
                $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
                $refrunddate = GetMkTime($return['date']);
                $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret         = $dsql->dsqlOper($sql, "update");
            } else {
                $r = false;
            }


        }elseif($paytype == "huoniao_bonus" && $truemoneysy != 0){
            $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            $uid = $ret[0]['uid'] ? $ret[0]['uid'] : 0;
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `bonus` = `bonus` + '$truemoneysy' WHERE `id` = '$uid'");

            $dsql->dsqlOper($archives, "update");
            $user  = $userLogin->getMemberInfo($uid);
            $userbonus = $user['bonus'];
            $refrunddate = GetMkTime(time());
            //保存操作日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`balance`) VALUES ('$uid', '1', '$truemoneysy', '外卖订单退回(消费金退款:$truemoneysy)：$ordernum', '$refrunddate','waimai','$userbonus')");
            $dsql->dsqlOper($archives, "update");
        }

        if ($r) {
            //退回积分
            if ($pointt != 0) {
                global  $userLogin;
                $info     = '外卖订单退回：(积分退款:' . $pointt . ',现金退款：' . $truemoneysy . ',余额退款：' . $money_amount . ')：' . $shopname;
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$pointt' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $userpoint = $user['point'];
//                $pointuser  = (int)($userpoint+$point);
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$pointt', '$info', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                $dsql->dsqlOper($archives, "update");

            }
            $pay_name    = '';
            $pay_namearr = array();
            $paramUser   = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "waimai",
                "id"       => $id
            );
            $urlParam    = serialize($paramUser);

            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!empty($ret)) {
                $pay_name = $ret[0]['pay_name'];
            } else {
                $pay_name = $ret[0]["paytype"];
            }
            if ((float)$pay_name) {
                array_push($pay_namearr, $pay_name);
            }

            if ((float)$money_amount != '') {
                array_push($pay_namearr, '余额');
            }

            if ((float)$point != '') {
                array_push($pay_namearr, '积分');
            }

            if ($pay_namearr) {
                $pay_name = join(',', $pay_namearr);
            }
            $tuikuan      = array(
                'paytype'      => $pay_name,
                'truemoneysy'  => $truemoneysy,
                'money_amount' => $money_amount,
                'point'        => $point,
                'refrunddate'  => $refrunddate,
                'refrundno'    => $refrundno,
                'type'         => 0  /*0-表示用户退款,1-表示商家退款*/
            );
            $tuikuanparam = serialize($tuikuan);
            //会员帐户充值
            if ($money_amount != 0 && $paytype !='huoniao_bonus') {
                global  $userLogin;
                $info      = '外卖退款：(积分退款:' . $pointt . ',现金退款：' . $truemoneysy . ',余额退款：' . $money_amount . ')：' . $shopname;
                $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $money_amount . " WHERE `id` = " . $uid);
                $dsql->dsqlOper($userOpera, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money =  sprintf('%.2f',($usermoney + $money_amount));
                //记录退款日志
                $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (" . $uid . ", " . $money_amount . ", 1, '$info', " . GetMkTime(time()) . ",'waimai','tuikuan','$urlParam','$ordernum','$tuikuanparam','外卖消费','$usermoney')");
                $dsql->dsqlOper($logs, "update");

            }

            $sql  = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
            $user = $dsql->dsqlOper($sql, "results");
            if ($user) {
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "record"
                );
                // updateMemberNotice($uid, "会员-订单退款成功", $param, array("username" => $user['username'], "order" => $shopname.$ordernumstore, 'amount' => $amount));
            }

            adminLog("外卖订单退款", $shopname . $ordernumstore);

            echo '{"state": 100, "info": "退款操作成功！"}';
        } else {

            $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrundstate` = '$refrundstate', `refrunddate` = '$refrunddate', `refrundamount` = '$refrundamount', `refrundfailed` = '' WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
            echo '{"state": 200, "info": "退款失败，错误码：' . $return['code'] . '"}';

        }

        exit();

    } else {

        echo '{"state": 200, "info": "操作失败，请检查订单状态！"}';
        exit();
    }

}

// 快速编辑
if ($action == "fastedit") {

    if (!testPurview("updateWaimaiOrderState")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (empty($type) || $type == "id" || empty($id) || $val == "") {
        echo '{"state": 200, "info": "参数错误！"}';
        exit();
    }

    if ($type != "address") {
        echo '{"state": 200, "info": "操作错误！"}';
        exit();
    }

    $sub         = new SubTable('waimai_order', '#@__waimai_order');
    $break_table = $sub->getSubTableById($id);

    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `$type` = '$val' WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "update");
    if ($ret == "ok") {
        die('{"state": 100, "info": "修改成功！"}');
    } else {
        die('{"state": 200, "info": "修改失败！"}');
    }
}

// 确认赔付

if ($action == "peifu") {

    if (!testPurview("updateWaimaiOrderState")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id)) {
        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);

        //查询订单生成时间
        $waimaiOrder = $dsql->SetQuery("SELECT o.`paydate`,o.`ordernumstore`,s.`delivery_time`,s.`shopname`  FROM `" . $break_table . "` o LEFT JOIN `#@__waimai_shop` s ON o.`sid` = s.`id` WHERE o.`id` = $id");
        $waimaire    = $dsql->dsqlOper($waimaiOrder, "results");
        $ptime       = (time() - $waimaire[0]['paydate']) % 86400 / 60;

        if ($ptime < $waimaire[0]['delivery_time']) {

            echo '{"state": 200, "info": "暂未超时"}';
            die;

        }
        $cptypesql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `cptype` = $cptype WHERE `id` = $id");

        $cpres = $dsql->dsqlOper($cptypesql, "update");

        if ($cpres == "ok") {

            adminLog("外卖订单确认赔付", $waimaire[0]['shopname'] . $waimaire[0]['ordernumstore']);
            echo '{"state": 100, "info": "操作成功！"}';
            die;

        } else {

            echo '{"state": 200, "info": "操作失败"}';
            exit();
        }
    }
}

$where = '';
$where  = getCityFilter('s.`cityid`');
$where2 = getCityFilter('`cityid`');
// var_dump($cityid);die;
if ($cityid) {
    $where  .= getWrongCityFilter('s.`cityid`', $cityid);
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

$tabJoin = '';
if(strstr($where, 's.')){
    $tabJoin = " LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid`";
}

//配送员
$courier = array();
$sql     = $dsql->SetQuery("SELECT `id`, `name`, `cityid` FROM `#@__waimai_courier` WHERE `state` = 1 AND `status` = 1 AND `quit` = 0 " . $where2 . " ORDER BY `id` ASC");
$ret     = $dsql->dsqlOper($sql, "results");
if ($ret) {
    foreach ($ret as $key => $value) {
        array_push($courier, array(
            "id"   => $value['id'],
            "name" => $value['name'],
            "cityid" => $value['cityid'],
            "cityname" => getSiteCityName($value['cityid'])
        ));
    }
}

//按城市排序
$count = array();
foreach ($courier as $key => &$_data) {
    $count[$key] = $_data['cityid'];
}
unset($_data); // 释放引用变量

// 按数量从多到少排序
array_multisort($count, SORT_ASC, $courier);

$huoniaoTag->assign("courier", $courier);

$state = empty($state) ? 2 : $state;

//配送员
if (!empty($courier_id)) {
    $where .= " AND o.`peisongid` = $courier_id";
    $huoniaoTag->assign('courier_id', $courier_id);
}

//订单编号
if (!empty($ordernum)) {
    $where .= " AND o.`ordernum` like '%$ordernum%'";
}

//店铺名称
if (!empty($shopname)) {
    $where .= " AND s.`shopname` like '%$shopname%'";
}

//姓名
if (!empty($person)) {
    $where .= " AND o.`person` = '%$person%'";
}

//电话
if (!empty($tel)) {
    $where .= " AND o.`tel` like '%$tel%'";
}

//地址
if (!empty($address)) {
    $where .= " AND o.`address` like '%$address%'";
}

//订单金额
if (!empty($amount)) {
    $where .= " AND o.`amount` = '$amount'";
}

if($keyword){
    $where .= " AND (o.`ordernumstore`  like '%$keyword%' OR o.`ordernum`  like '%$keyword%')";
}
//订单状态
//if ($state !== "") {
//    $where .= " AND o.`state` = '$state'";
//    /*// 未处理订单需要显示货到付款的订单
//    if($state == 2){
//        $where .= " AND (o.`state` = '2' || (o.`state` = 0 && o.`paytype` = 'delivery'))";
//    }else{
//        $where .= " AND o.`state` = '$state'";
//    }*/
//}
$where3='';
if ($state !== ""){
    $where3 = " AND o.`state` = '$state'";

}
$where1 = "";
if (!empty($start_time)) {
    $start  = GetMkTime($start_time);
    $where1 = " AND o.`paydate` >= $start";
}

if (!empty($end_time)) {
    $end    = GetMkTime($end_time);
    $where1 = $where1 == "" ? "o.`paydate` <= $end" : ($where1 . " AND " . "o.`paydate` <= $end");
}
$pageSize = 50;
// var_dump($where.$where1);die;
$sqlCount = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE 1 = 1 " . $where . $where1 . $where3);

$sql = $dsql->SetQuery("SELECT o.`balance`,o.`zsbprice`,o.`point`,o.`id`, o.`uid`,o.`selftime`,o.`sid`, o.`ordernum`, o.`ordernumstore`, o.`state`, o.`food`, o.`priceinfo`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`preset`, o.`note`, o.`pubdate`, o.`okdate`, o.`paydate`, o.`amount`, o.`peisongid`, o.`peisongidlog`, o.`failed`, o.`refrundstate`,o.`refrundamount`, o.`refrunddate`, o.`refrundno`, o.`refrundfailed`, o.`refrundadmin`, o.`transaction_id`, o.`paylognum`,o.`desk`,o.`ordertype`,o.`is_other`,o.`othercourierparam`,o.`peerpay`,o.`peidate`,o.`reservesongdate` FROM `#@__waimai_order_all` o ".$tabJoin." WHERE 1 = 1 " . $where . $where1 . $where3." ORDER BY o.`id` DESC");

$totalCount = $dsql->dsqlOper($sqlCount, "results");
$totalCount = $totalCount[0]['totalCount'];
//总分页数
$totalPage = ceil($totalCount / $pageSize);

$p       = (int)$p == 0 ? 1 : (int)$p;
$atpage  = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql . " LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
    $list[$key]['id']  = $value['id'];
    $list[$key]['uid'] = $value['uid'];

    //用户名
    $userSql  = $dsql->SetQuery("SELECT `username`,`nickname`,`level`,`expired` FROM `#@__member` WHERE `id` = " . $value["uid"]);
    $username = $dsql->dsqlOper($userSql, "results");
    if (count($username) > 0) {
        $list[$key]["username"] = $username[0]['nickname'] ?: $username[0]['username'];
    } else {
        $list[$key]["username"] = "未知";
    }

    $level   = $username[0]['level'];
    $expired = $username[0]['expired'];

    $cityid = 0;
    $shopname = $merchant_deliver = $selftake = $chucan_time = $delivery_time = '';
    $sql = $dsql->SetQuery("SELECT `cityid`, `shopname`, `merchant_deliver`, `selftake`,`chucan_time`,`delivery_time` FROM `#@__waimai_shop` WHERE `id` = " . $value["sid"]);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $cityid = $ret[0]['cityid'];
        $shopname = $ret[0]['shopname'];
        $merchant_deliver = $ret[0]['merchant_deliver'];
        $selftake = $ret[0]['selftake'];
        $chucan_time = $ret[0]['chucan_time'];
        $delivery_time = $ret[0]['delivery_time'];
    }

    $list[$key]['sid']              = $value['sid'];
    $list[$key]['desk']             = $value['desk'];
    $list[$key]['ordertype']        = $value['ordertype'];
    $list[$key]['shopname']         = $shopname;
    $list[$key]['cityname']         = getSiteCityName($cityid);
    $list[$key]['merchant_deliver'] = $value['merchant_deliver'];
    $list[$key]['selftake']         = $selftake;
    $list[$key]['selftime']         = $value['selftime'];
    $list[$key]['ordernum']         = $value['ordernum'];
    $list[$key]['otherparam']       = $value['otherparam']!= '' ? unserialize($value['otherparam']) : array();
    $list[$key]['ordernumstore']    = $value['ordernumstore'];
    $list[$key]['state']            = $value['state'];
    $list[$key]['food']             = unserialize($value['food']);
    $list[$key]['person']           = $value['person'];
    $list[$key]['tel']              = $value['tel'];
    $list[$key]['address']          = $value['address'];
    $list[$key]['is_other']         = $value['is_other'];

    $date = GetMkTime(time());
    /*出餐超时*/
    $list[$key]['cctimeout'] = (($date - $value['paydate']) % 86400 / 60 > $chucan_time) ? 1 : 0;
    $list[$key]['pstimeout'] = (($date - $value['peidate']) % 86400 / 60 > $delivery_time) ? 1 : 0;
    // $list[$key]['paytype']       = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : $value['paytype']);
    $_paytype    = '';
    $_paytypearr = array();
    $paytypearr  = $value['paytype'] != '' ? explode(',', $value['paytype']) : array();

    if ($paytypearr) {
        foreach ($paytypearr as $k => $v) {
            if ($v != '') {
                array_push($_paytypearr, getPaymentName($v));
            }
        }
        if ($value['balance'] > 0){
            array_push ($_paytypearr,getPaymentName('money'));
        }
        if ($value['point'] > 0){
            array_push($_paytypearr,getPaymentName('integral'));
        }
        if ($_paytypearr) {
            $_paytype = join(',', array_unique($_paytypearr));
        }
    }
//  switch ($value['paytype']) {
//    case 'wxpay':
//      $_paytype = '微信支付';
//      break;
//    case 'alipay':
//      $_paytype = '支付宝';
//      break;
//    case 'unionpay':
//      $_paytype = '银联支付';
//      break;
//    case 'rfbp_icbc':
//    $_paytype = '工行E商通';
//    break;
//    case 'baidumini':
//    $_paytype = '百度收银台';
//    break;
//    case 'qqmini':
//    $_paytype = 'QQ小程序';
//    break;
//    case 'money':
//      $_paytype = '余额支付';
//      break;
//    case 'delivery':
//      $_paytype = '货到付款';
//      break;
//
//    case 'underpay':
//      $_paytype = '线下支付';
//      break;
//    default:
//      break;
//  }

    //代付
    if($value['peerpay'] > 0){
        $userinfo = $userLogin->getMemberInfo($value['peerpay']);
        if(is_array($userinfo)){
            $_paytype = '['.$userinfo['nickname'].']'.$_paytype.'代付';
        }else{
            $_paytype = '['.$value['peerpay'].']'.$_paytype.'代付';
        }
    }

    $list[$key]['paytype']        = $_paytype;
    $list[$key]['preset']         = unserialize($value['preset']);
    $list[$key]['note']           = $value['note'];
    $list[$key]['pubdate']        = $value['pubdate'];
    $list[$key]['okdate']         = $value['okdate'];
    $list[$key]['paydate']        = $value['paydate'];
    $point                        = $value['point'] / $cfg_pointRatio;                  //积分
    $list[$key]['amount']         = $value['amount'];
    $list[$key]['peisongid']      = $value['peisongid'];
    $list[$key]['peisongidlog']   = $value['peisongidlog'] ? substr($value['peisongidlog'], 0, -4) : "";
    $list[$key]['failed']         = $value['failed'];
    $list[$key]['refrundstate']   = $value['refrundstate'];
    $list[$key]['refrundamount']  = $value['refrundamount'];
    $list[$key]['refrunddate']    = $value['refrunddate'];
    $list[$key]['refrundno']      = $value['refrundno'];
    $list[$key]['refrundfailed']  = $value['refrundfailed'];
    $list[$key]['transaction_id'] = $value['transaction_id'];
    $list[$key]['paylognum']      = $value['paylognum'];
    $list[$key]['priceinfo']      = unserialize($value['priceinfo']);
    if(is_array($list[$key]['priceinfo'])){
        foreach ($list[$key]['priceinfo'] as $item){
            if($item['type']=="peisong"){
                $list[$key]['amount_deliver'] = $item['amount'];
            }
        }
    }
    $list[$key]['amount_deliver'] = $list[$key]['amount_deliver'] ?: "0.00";

    // 判断会员等级
//  $priceinfo = unserialize($value['priceinfo']);
//  foreach ($priceinfo as $k => $val) {
//    if(strpos($val['type'], "auth") !== false){
//      $body = explode('-', $val['body'])[0];
//      $body = str_replace('特权', '', $body);
//      $body = str_replace('生日', '', $body);
//      $levelName = $body;
//      break;
//    }
//  }
    if ($level != 0) {
        $sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = " . $level);
        $ret = $dsql->dsqlOper($sql, "results");
    }
    $list[$key]['levelName'] = $level != 0 && $expired >= time() ? $ret[0]['name'] : '';

    $paystate = "";
    if (empty($value['paylognum'])) {
        $sql = $dsql->SetQuery("SELECT `ordernum`, `state` FROM `#@__pay_log` WHERE `ordernum` = '" . $value['ordernum'] . "' ORDER BY `id` DESC LIMIT 0,1");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $list[$key]['paylognum'] = $ret[0]['ordernum'];
            $paystate                = $ret[0]['state'];
        }
    }


    // 如果订单状态为失败或取消，查询付款结果 0:未付款 1:已付款
    if ($value['paytype'] == 'delivery') {
        $paystate = 0;
    } elseif ($value['paytype'] == 'money') {
        $paystate = 1;
    } else {
        if ($paystate == "") {
            $sql = $dsql->SetQuery("SELECT `state` FROM `#@__pay_log` WHERE `ordernum` = '" . $value['ordernum'] . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $k => $v) {
                    if ($v['state'] == 1) {
                        $sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `ordernum` = '" . $value['ordernum'] . "' AND `state` = 0");
                        $dsql->dsqlOper($sql, "update");
                        $paystate = 1;
                        break;
                    }
                }
                $paystate = $paystate == '' ? 0 : $paystate;
            } else {
                $paystate = 0;
            }
        }
    }
    $list[$key]['paystate'] = $paystate;

    $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $value['refrundadmin']);
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $list[$key]['refrundadmin'] = $ret[0]['username'];
    } else {
        $list[$key]['refrundadmin'] = $value['refrundadmin'];
    }

    if ($value['is_other'] == 0) {
        $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = " . $value['peisongid']);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $list[$key]['peisongname'] = $ret[0]['name'];
            $list[$key]['peisongtel']  = $ret[0]['phone'];
        }
    } else {
        $otherCourier = $value['othercourierparam'] != '' ? unserialize($value['othercourierparam']) : array();

        if ($otherCourier) {

            $list[$key]['peisongname'] = $otherCourier['driver_name'];
            $list[$key]['peisongtel']  = $otherCourier['driver_mobile'];
            $peisonglogistic = $otherCourier['driver_logistic'];
            $list[$key]['peisonglogistic'] = '';
            $peisongbiaoshi=array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务');
            foreach ($peisongbiaoshi as $kk=>$vv){
                if ($kk == $peisonglogistic){
                    $list[$key]['peisonglogistic'] = $vv;
                }
            }
        } else {

            $list[$key]['peisongname'] = '未知';
            $list[$key]['peisongtel']  = '';
            $list[$key]['peisonglogistic'] = '';
        }
    }

    $list[$key]['reservesongdate'] = (int)$value['reservesongdate']; //预定配送时间

    $list[$key]['receivingdate'] = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
    if ($list[$key]['reservesongdate'] > 0) {
        $list[$key]['receivingdate'] = $list[$key]['reservesongdate'] - (int)$list[$key]['delivery_time']*60 - 60;
    }
}

$huoniaoTag->assign("otherpeisong", $custom_otherpeisong);
$huoniaoTag->assign("state", $state);
$huoniaoTag->assign("list", $list);
$huoniaoTag->assign("keyword", $keyword);

$huoniaoTag->assign("start_time", $start_time);
$huoniaoTag->assign("end_time", $end_time);

$pagelist = new pagelist(array(
    "list_rows"   => $pageSize,
    "total_pages" => $totalPage,
    "total_rows"  => $totalCount,
    "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());


//查询待确认的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 2 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state2", (int)$ret[0]['totalCount']);

//查询已确定的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 3 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state3", (int)$ret[0]['totalCount']);

//查询已结单的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 4 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state4", (int)$ret[0]['totalCount']);

//查询配送中的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 5 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state5", (int)$ret[0]['totalCount']);

//查询成功的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 1 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state1", (int)$ret[0]['totalCount']);

//查询失败的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 7 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state7", (int)$ret[0]['totalCount']);

//查询已取消的订单
$sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__waimai_order_all` o ".$tabJoin." WHERE o.`state` = 6 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state6", (int)$ret[0]['totalCount']);

$huoniaoTag->assign('city', $adminCityArr);

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/chosen.min.css',
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
        'ui/chosen.jquery.min.js',
        'ui/jquery-ui-timepicker-addon.js',
        'admin/waimai/waimaiOrder.js',
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //查询是否安装第三方配送插件
    $otherpeisongArr = array();
    $sql = $dsql->SetQuery("SELECT `pid`, `title` FROM `#@__site_plugins` WHERE `pid` in (13,19)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            array_push($otherpeisongArr, array(
                'id' => $val['pid'] == 13 ? 1 : 3,
                'title' => $val['title']
            ));
        }
    }
    $huoniaoTag->assign('otherpeisongArr', $otherpeisongArr);


    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
