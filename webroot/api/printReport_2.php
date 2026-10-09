<?php
//芯烨云打印机回调
require_once dirname(__FILE__) . "/payment/log.php";
//初始化日志
$_printReport = new CLogFileHandler(HUONIAOROOT . '/log/xpyun_printReport/' . date('Y-m-d') . '.log', true);
$_printReport->DEBUG("printReport:" . json_encode($_REQUEST) . "\r\n");

if(!$sign){
    die('非法请求');
}

//兼容GET方式，修复签名中有+号被转成空格的问题
$sign = str_replace(' ', '+', $sign);

//查询打印机配置
$sql = $dsql->SetQuery("SELECT `print_config` FROM `#@__business_print_config` WHERE `print_code` = 'xpyun' ORDER BY `id` DESC LIMIT 1");
$ret = $dsql->dsqlOper($sql, "results");
if ($ret != null && is_array($ret)) {
    $print_config = $ret[0]['print_config'] ? unserialize($ret[0]['print_config']) : array();
    if($print_config != null && is_array($print_config)){
        $customUser = $customUserKEY = '';
        foreach ($print_config as $key => $value) {
            if ($value['name'] == 'user') {
                $customUser = $value['value'];
            } elseif ($value['name'] == 'UserKEY') {
                $customUserKEY = $value['value'];
            }
        }
    }else{
        die('打印机配置错误！');
    }
} else {
    die('打印机配置错误！');
}

//生成签名
$mySign = sha1($customUser.$content.$customUserKEY.$timestamp);

//签名比对
if ($mySign != $sign) {
    $_printReport->DEBUG("签名验证失败！\r\n");
    die('签名验证失败！');
}

//数据解码
$content = json_decode($content, true);

$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;

if ($content != null && is_array($content)) {

    $time = GetMkTime(time());

    //平台有可能一次推送多个订单，因此进行循环处理
    foreach ($content as $item) {
        $dataid = trim($item['orderNo']);
        $sn = trim($item['sn']);
        $status = (int)$item['status'];
        //打印成功才进行处理
        if ($dataid != null && $status == 1) {

            // 外卖
            if ($installWaimai) {

                //更新外卖订单的回调成功字段
                $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `isprint` = 1 WHERE `state` = 2 AND `print_dataid` = '$dataid'");
                $dsql->dsqlOper($sql, "update");

                //消息通知，查询条件新增预定时间为0或者预定时间大于0但是预定时间小于当前时间
                $sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`ordernumstore`, o.`pubdate`,o.`sid`, o.`food`, o.`amount`,o.`selftime`,o.`ordertype`,o.`person`,o.`tel`, s.`shopname`,s.`address`,s.`coordX`,s.`coordY`,o.`lng`,o.`lat`,o.`address` useraddress,o.`otherparam`,s.`phone`,s.`merchant_deliver`,s.`peisong_type`,s.`billingtype`,s.`specify`,o.`ordernum`  FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` != 3 AND o.`print_dataid` = '$dataid' AND (o.`reservesongdate` = 0 OR (o.`reservesongdate` > 0 AND o.`reservesongdate` <= $time))");

                //$ret = $dsql->dsqlOper($sql, "results");
                $ret = $dsql->dsqlOper($sql, "results", "ASSOC", NULL, 0);
                if ($ret != null && is_array($ret)) {
                    $data = $ret[0];

                    $id            = $data['id'];
                    $uid           = $data['uid'];
                    $ordernumstore = $data['ordernumstore'];
                    $pubdate       = $data['pubdate'];
                    $food          = unserialize($data['food']);
                    $amount        = $data['amount'];
                    $shopname      = $data['shopname'];
                    $selftime      = $data['selftime'];
                    $ordertype     = $data['ordertype'];
                    $tel           = aesDecrypt($data['tel']);
                    $person        = aesDecrypt($data['person']);
                    $shopcoordY    = $data['coordY'];
                    $shopcoordX    = $data['coordX'];
                    $shopaddress   = $data['address'];
                    $lng           = $data['lng'];
                    $lat           = $data['lat'];
                    $shopshopname  = $data['shopname'];
                    $pubusermobile = $data['phone'];
                    $useraddress   = !empty($data['useraddress']) ? explode(' ', aesDecrypt($data['useraddress'])) : array();
                    $merchant_deliver = $data['merchant_deliver'];
                    $peisong_type  = (int)$data['peisong_type'];  //0系统默认  1平台自己配置
                    $map_type      = (int)$custom_map;
                    $billingtype   = $data['billingtype'];
                    $specify       = $data['specify'];
                    $sid           = $data['sid'];
                    $ordernum      = $data['ordernum'];
        
                    global $cfg_map;  //系统默认地图
                    $map_type = !$map_type ? $cfg_map : $map_type;
        
                    if($map_type == 4){
                        $map_type = 1;
                    }

                    $foods = array();
                    foreach ($food as $key => $value) {
                        array_push($foods, $value['title'] . " " . $value['count'] . "份");
                    }


                    $error = 0;
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

                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $id");
                                        $ret = $dsql->dsqlOper($sql, "update");

                                        // echo '{"state": 200, "info": ' . $getpirceresults . '}';
                                        // exit();
                                        $error = 1;
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
                                    $return_code = $results['code'];
                                    $return_msg  = $results['message'];
                                    // echo '{"state": 200, "info": "麦芽田：' . $results['message'] . '"}';
                                    // exit();
                                    $error = 1;
                                }else{
                                    $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong WHERE `id` = '$id'");
                                    $dsql->dsqlOper($othersql, "update");
                                }
                            }

                            if ($return_code == 'ok') {
                                if ($custom_otherpeisong == 1) {
                                    $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong ,`otherparam` = '$otherparam',`otherordernum` = '$order_code' WHERE `id` = '$id'");
                                } else {
                                    $othersql = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `is_other` = $custom_otherpeisong ,`otherordernum` = '$order_code' WHERE `id` = '$id'");
                                }
                                $dsql->dsqlOper($othersql, "update");

                            } else {
                            if($custom_otherpeisong == 2){
                                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $id");
                                $ret = $dsql->dsqlOper($sql, "update");

                                //  echo '{"state": 200, "info": "' . $return_msg . '"}';
                                //  exit();
                                $error = 1;
                            }

                            }
                        }
                    }

                    if($error == 0) {

                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 3, `confirmdate` = '$time' WHERE `state` = 2 AND `print_dataid` = '$dataid'");
                        $dsql->dsqlOper($sql, "update");

                        $_printReport->DEBUG("确认订单SQL:" . $sql . "\r\n");

                    }
                    else{
                        $_printReport->DEBUG("第三方配送错误信息:" . $return_code . '，' . $return_msg . "\r\n");
                    }
                    
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "waimai",
                        "id"       => $id
                    );

                    //自定义配置
                    $config    = array(
                        "ordernum"   => $shopname . $ordernumstore,
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
                    $serconfig = serialize($config);

                    $updatenoticesql = $dsql->SetQuery("SELECT * FROM `#@__updatemessage` WHERE `notify` =  '会员-订单确认提醒' AND `config` = '$serconfig'");

                    $updatenoticeres = $dsql->dsqlOper($updatenoticesql, "results");

                    if (!$updatenoticeres) {
                        updateMemberNotice($uid, "会员-订单确认提醒", $param, $config, '', '', 0, 1);
                    }


                }

            }

            // 商家
            if ($installBusiness) {
                // $sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `` WHERE `print_dataid` = '$dataid'");
                // $ret = $dsql->dsqlOper($sql, "results");
                // if($ret){

                // }
            }

            //商城
            if ($installShop) {
                //消息通知
                $sql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`people`, o.`address`, o.`contact`, o.`note`, o.`paytype`, o.`orderdate`, o.`branchid`, s.`title` shoptitle, b.`title` branchtitle ,s.`express` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE o.`orderstate` != 6 AND o.`print_dataid` = '$dataid'");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret != null && is_array($ret)) {
                    $data = $ret[0];

                    $id          = $data['id'];
                    $express     = $data['express'];

                    if ($express) {
                        return;
                    }
                    $note        = $data['note'];
                    $ordernum    = $data['ordernum'];
                    $paytype     = $data['paytype'];
                    $orderdate   = date("Y-m-d H:i:s", $data['orderdate']);
                    $branchid    = $data['branchid'];
                    $shoptitle   = $data['shoptitle'];
                    $branchtitle = $data['branchtitle'];
                    $people      = $data['people'];
                    $address     = $data['address'];
                    $contact     = $data['contact'];

                    $sql   = $dsql->SetQuery("SELECT o.`count`, s.`title` FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_product` s ON s.`id` = o.`proid` WHERE o.`orderid` = '$id'");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    $foods = array();
                    foreach ($ret as $k => $v) {
                        array_push($foods, $v['title'] . " " . $v['count'] . "份");
                    }

                    if (!empty($branchid)) {
                        $storeName = $branchtitle;
                    } else {
                        $storeName = $shoptitle;
                    }

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "shop",
                        "id"       => $id
                    );

                    //自定义配置
                    $config = array(
                        "ordernum"   => $shopname . $ordernum,
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

                    updateMemberNotice($uid, "会员-订单确认提醒", $param, $config, '', '', 0, 1);

                    //$now = GetMkTime(time());
        //            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 6, `confirmdate` = '$time', `exp-date` = '$now' WHERE `orderstate` = 1 AND `print_dataid` = '$dataid'");
                    $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 6, `confirmdate` = '$time' WHERE `orderstate` = 1 AND `print_dataid` = '$dataid'");
                    $dsql->dsqlOper($sql, "update");
                }
            }

        }
    }

}

//返回数据
$return = array('data' => 'OK');
echo json_encode($return);
