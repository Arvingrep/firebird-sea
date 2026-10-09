<?php

/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

define( 'HUONIAOADMIN' , "../" );
require_once( dirname( __FILE__ ) . "/../inc/config.inc.php" );
$dsql                     = new dsql( $dbo );
$userLogin                = new userLogin( $dbo );
$tpl                      = dirname( __FILE__ ) . "/../templates/";
$tpl                      = isMobile() ? $tpl . "touch/order" : $tpl . "order";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

// $sub = new SubTable('waimai_order', '#@__waimai_order');
// $dbname = $sub->getLastTable();
// $dbname = "waimai_order";
$templates = "waimaiOrder.html";

if ( !empty( $action ) && !empty( $id ) ) {
    if ( !checkWaimaiShopManager( $id , "order" ) ) {
        echo '{"state": 200, "info": "操作失败，请刷新页面！"}';
        exit();
    }
}
$inc = HUONIAOINC . "/config/waimai.inc.php";
include $inc;
//确认订单
if ( $action == "confirm" ) {
    if ( !empty( $id ) ) {
        $ids = explode( "," , $id );
        foreach ( $ids as $key => $value ) {
            $value = (int)$value;
            //外卖分表
            $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
            $break_table = $sub->getSubTableById( $value );

            $sql = $dsql->SetQuery( "SELECT `state` FROM `" . $break_table . "` WHERE `id` = $value" );
            $ret = $dsql->dsqlOper( $sql , "results" );
            if ( $ret ) {
                if ( $ret[0]['state'] != 2 ) {
                    break;
                }
            } else {
                break;
            }

            //消息通知 & 打印
            $sql = $dsql->SetQuery( "SELECT o.`uid`, o.`food`, o.`ordernumstore`, o.`amount`, o.`pubdate`, s.`shopname`,o.`otherparam`,o.`person`,o.`tel`,s.`address`,s.`coordX`,s.`coordY`,o.`lng`,o.`lat`,o.`address` useraddress,o.`selftime`,o.`ordertype`,o.`otherordernum`,o.`note`,s.`phone`,s.`ysshop_id`,s.`paotuitype`,s.`billingtype`,s.`specify`,s.`thingcategory`,o.`sid`,o.`ordernum`,s.`merchant_deliver`,s.`peisong_type`,o.`reservesongdate`,s.`delivery_time` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value" );
            $ret = $dsql->dsqlOper($sql, "results", "ASSOC", NULL, 0);
            if ( $ret != null && is_array($ret)) {
                $data          = $ret[0];
                $uid           = $data['uid'];
                $ordernumstore = $data['shopname'] . $data['ordernumstore'];
                $merchant_deliver = $data['merchant_deliver'];
                $pubdate       = $data['pubdate'];
                $shopname      = $data['shopname'];
                $amount        = $data['amount'];
                $tel           = $data['tel'];
                $lng           = $data['lng'];
                $lat           = $data['lat'];
                $useraddress   = !empty( $data['useraddress'] ) ? explode( ' ' , $data['useraddress'] ) : array ();
                $person        = $data['person'];
                $shopcoordY    = $data['coordY'];
                $shopcoordX    = $data['coordX'];
                $shopaddress   = $data['address'];
                $shopshopname  = $data['shopname'];
                $selftime      = $data['selftime'];
                $ordertype     = $data['ordertype'];
                $pubusermobile = $data['phone'];
                $otherordernum = $data['otherordernum'];
                $ysshop_id     = $data['ysshop_id'];
                $note          = $data['note'];
                $billingtype   = $data['billingtype'];
                $specify       = $data['specify'];
                $thingcategory = $data['thingcategory'];
                $paotuitype    = $data['paotuitype'];
                $sid           = $data['sid'];
                $ordernum      = $data['ordernum'];
                $food          = unserialize( $data['food'] );
                $peisong_type  = (int)$data['peisong_type'];  //0系统默认  1平台自己配置
                $map_type        = (int)$custom_map;

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
                    $map_type = 2;
                }
                $foods = array ();
                foreach ( $food as $k => $v ) {
                    array_push( $foods , $v['title'] . " " . $v['count'] . "份" );
                }

                /*第三方配送员*/
                $inc = HUONIAOINC . '/config/waimai.inc.php';
                include $inc;
                if ( $custom_otherpeisong != 0 && $selftime == 0 && $ordertype == 0 && $merchant_deliver == 0 && !$peisong_type) {

                    if ( $custom_otherpeisong == 1 ) {
                        $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                    } elseif($custom_otherpeisong == 2) {
                        $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                    }elseif($custom_otherpeisong == 3){
                        $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
                    }
                    include $pluginFile;
                    $otherarr = $data['otherparam'] != '' ? unserialize( $data['otherparam'] ) : array ();

                    if ( file_exists( $pluginFile ) ) {

                        if ( $custom_otherpeisong == 1 ) {

                            $otherarr['person']        = $person;
                            $otherarr['tel']           = $tel;
                            $otherarr['pubusermobile'] = $pubusermobile;

                            $otherarr['callback_url'] = $cfg_secureAccess . $cfg_basehost . '/include/plugins/13/uuPaotuiCallback.php';

                            $uuPaoTuiClass = new uuPaoTui();

                            $results = $uuPaoTuiClass->putOrder( $otherarr );

                            $order_code  = $results['ordercode'];
                            $return_code = $results['return_code'];
                            $return_msg  = $results['return_msg'];
                            $otherparam  = serialize( $results );

                            if ( $order_code != 'ok' && $return_msg == 'price_token无效' ) {


                                $cityname          = getCityname( $shopcoordY , $shopcoordX );
                                $Calculatepricearr = array ( 'city_name' => $cityname , 'from_address' => $shopaddress , 'from_usernote' => $shopshopname , 'from_lat' => $shopcoordX , 'from_lng' => $shopcoordY , 'to_address' => $useraddress[0] , 'to_usernote' => $useraddress[1] , 'to_lat' => $lat , 'to_lng' => $lng ,
                                );

                                $getpirceresults = $uuPaoTuiClass->Calculateprice( $Calculatepricearr );

                                if ( is_array( $getpirceresults ) ) {
                                    $price_token = $getpirceresults['price_token'];

                                    $otherarr['price_token'] = $price_token;

                                    $aginresults = $uuPaoTuiClass->putOrder( $otherarr );

                                    $order_code  = $aginresults['ordercode'];
                                    $return_code = $aginresults['return_code'];
                                    $return_msg  = $aginresults['return_msg'];
                                    $otherparam  = serialize( $aginresults );
                                } else {

                                    $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value" );
                                    $ret = $dsql->dsqlOper( $sql , "update" );

                                    echo '{"state": 200, "info": ' . $getpirceresults . '}';
                                    exit();
                                }

                            }

                        } elseif($custom_otherpeisong == 2){
                            /*闪速达下单*/

                            if ( $paotuitype == 0 && !empty( $otherarr ) ) {

                                array_multisort( array_column( $otherarr , 'freight' ) , SORT_ASC , $otherarr );

                                $paotuitype = $otherarr['ps_id'];
                            }

                            $paramarr = array ( 'order_no' => $otherordernum , 'shop_id' => $ysshop_id , 'to_name' => $person , 'to_phone' => $tel , 'to_address' => $data['useraddress'] , 'ps_company_ids' => $paotuitype , 'to_lat' => $lat , 'to_lng' => $lng , 'goods_info' => 'waimai'
                            );

                            $youshansudaClass = new youshansuda();

                            $results = $youshansudaClass->ysDeal( $paramarr );

                            if ( $results['code'] == '200' ) {
                                $order_code  = $results['data']['order_no'];
                                $return_code = 'ok';

                            } else {
                                echo '{"state": 200, "info": 优闪速达："' . $results['msg'] . '"}';
                                exit();
                            }

                        }elseif ($custom_otherpeisong == 3){
                            $backurl = $cfg_secureAccess . $cfg_basehost . '/include/plugins/19/maiyatian.callback.php';
                            $paramarr = array ( 'shop_dismode'=>$billingtype,'shop_logistic' => $specify, 'shop_id' => $sid ,'shop_ordernum' => $ordernum, 'order_sn' => $ordernumstore ,'is_subscribe' => 0,'subscribe_time' => 0, 'lng' => $lng, 'lat' => $lat , 'address' => $data['useraddress'], 'address_detail' => $data['useraddress'], 'mem_name' => $person , 'mem_phone' => $tel , 'map_type' => $map_type , 'callback_url' => $backurl
                            );
                            $maiyatianClass = new maiyatian();
                            $results = $maiyatianClass->mytdel( $paramarr );
                            if ($results['code'] != 1){
                                echo '{"state": 200, "info": "麦芽田：' . $results['message'] . '"}';
                                exit();
                            }else{
                                $othersql = $dsql->SetQuery( "UPDATE `#@__waimai_order` SET `is_other` = 1  WHERE `id` = '$value'" );
                                $dsql->dsqlOper( $othersql , "update" );
                            }
                        }

                        if ( $return_code == 'ok' ) {

                            if ( $custom_otherpeisong == 1 ) {
                                $othersql = $dsql->SetQuery( "UPDATE `#@__waimai_order` SET `is_other` = 1 ,`otherparam` = '$otherparam',`otherordernum` = '$order_code' WHERE `id` = '$value'" );
                            } else {
                                $othersql = $dsql->SetQuery( "UPDATE `#@__waimai_order` SET `is_other` = 1 ,`otherordernum` = '$order_code' WHERE `id` = '$value'" );
                            }
                            $dsql->dsqlOper( $othersql , "update" );

                        } else {
                            if($custom_otherpeisong == 2) {
                                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `confirmdate` = 0 WHERE `state` = 3 AND `id` = $value");
                                $ret = $dsql->dsqlOper($sql, "update");
                                echo '{"state": 200, "info": "' . $return_msg . '"}';
                                exit();
                            }
                        }
                    }
                }
                
                //更新订单状态
                $date = GetMkTime( time() );
                $sql  = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `state` = 3, `confirmdate` = '$date' WHERE `state` = 2 AND `id` = $value" );
                $ret  = $dsql->dsqlOper( $sql , "update" );
                
                $param = array ( "service" => "member" , "type" => "user" , "template" => "orderdetail" , "module" => "waimai" , "id" => $value
                );

                //自定义配置
                $config = array ( "ordernum" => $ordernumstore , "orderdate" => date( "Y-m-d H:i:s" , $pubdate ) , "orderinfo" => join( " " , $foods ) , "orderprice" => $amount , "fields" => array ( 'keyword1' => '订单编号' , 'keyword2' => '下单时间' , 'keyword3' => '订单详情' , 'keyword4' => '订单金额'
                )
                );

                updateMemberNotice( $uid , "会员-订单确认提醒" , $param , $config , '' , '' , 0 , 0 );
            } else {
                echo '{"state": 200, "info": "没有找到订单信息！"}';
                exit();
            }

            // printerWaimaiOrder($value);
        }

        echo '{"state": 100, "info": "操作成功！"}';
        die;

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//打印订单
if ( $action == "print" ) {
//    include( HUONIAOINC . '/config/waimai.inc.php' );
    if ( !empty( $id ) ) {
        $ids = explode( "," , $id );
        foreach ( $ids as $key => $value ) {
            $value = (int)$value;
//            $businessId= $dsql->SetQuery("SELECT `sid`FROM `#@__waimai_order`   WHERE o.`id` ='".$id."'");
//            $busresult = $dsql->dsqlOper($businessId,"results");
//            $sqlprint = $dsql->SetQuery("SELECT p.`printmodule` FROM `#@__business_print` p  LEFT JOIN `#@__business_print_config` c ON p.`type` = c.`id` WHERE p.`id` = ".$busresult[0]['id']." ");
//echo  $sqlprint;die;
//            $printresult = $dsql->dsqlOper($sqlprint,"results");
//            $customPrintType =  $printresult[0]['printmodule'];
//            if ( $customPrintType == 0 ) {
//                printerWaimaiOrder( $value , true );
//            } else {
//                testprinterWaimaiOrder( $value , true );
//            }

            printerWaimaiOrder( $value , true );

        }

        echo '{"state": 100, "info": "操作成功！"}';
        die;
    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

//成功订单，只有开启自配的商家可以操作
if ( $action == "ok" ) {
    if ( !empty( $id ) ) {
        // 检查订单状态 && 有用户收到两次订单确认推送

        $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
        $break_table = $sub->getSubTableById( $id );

        $sql = $dsql->SetQuery( "SELECT `state` FROM `" . $break_table . "` WHERE `id` in ($id) AND `state` = 1" );
        $ret = $dsql->dsqlOper( $sql , "results" );


        if ( $ret && is_array( $ret ) ) {

            echo '{"state": 200, "info": "操作失败,请检查订单状态！"}';
            exit();
        }

        /*操作验证*/
        $verstsql = $dsql->SetQuery( "SELECT  o.`ordernumstore` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` in ($id) AND o.`desk` = 0 AND ((s.`merchant_deliver` =0 AND `selftime` = 0) OR (o.`ordertype` = 1 AND o.`state` = 3))" );

        $verstres = $dsql->dsqlOper( $verstsql , "results" );

        if ( $verstres && is_array( $verstres ) ) {

            echo '{"state": 200, "info": "商家仅可以设置自配订单！"}';
            exit();
        }

        $date = GetMkTime( time() );
        $sql  = $dsql->SetQuery( "UPDATE `#@__waimai_order_all` SET `state` = 1, `okdate` = '$date' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` in ($id)" );
        $ret  = $dsql->dsqlOper( $sql , "update" );
        if ( $ret == "ok" ) {
            //消息通知用户
            $ids = explode( "," , $id );
            foreach ( $ids as $key => $value ) {
                $sql_ = $dsql->SetQuery( "SELECT o.`uid`, o.`ordernumstore`, o.`okdate`, o.`amount`,o.`zsbprice`, o.`ordernum`,o.`ordertype`,o.`paydate`,o.`songdate`,o.`priceinfo`,o.`fencheng_delivery`,s.`shopname`,o.`sid`,s.`cityid` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value" );
                $ret_ = $dsql->dsqlOper( $sql_ , "results" );
                if ( $ret_ && is_array( $ret_ ) ) {
                    $data              = $ret_[0];
                    $uid               = $data['uid'];
                    $cityid            = $data['cityid'];
                    $paydate           = $data['paydate'];
                    $songdate          = $data['songdate'];
                    $ordernumstore     = $data['shopname'] . $data['ordernumstore'];
                    $okdate            = $data['okdate'];
                    $amount            = $data['amount'];
                    $ordernum          = $data['ordernum'];
                    $zsbprice          = $data['zsbprice'];
                    $sid               = $data['sid'];
                    $ordertype         = (int)$data['ordertype'];
                    $priceinfo         = unserialize( $data['priceinfo'] );
                    $fencheng_delivery = (int)$data['fencheng_delivery'];

                    //更新外卖店铺的销量
                    require(HUONIAOROOT."/api/handlers/waimai.config.php");
                    updateShopSales($data['sid'], $data['ordernum']);

                    //准时宝相关
                    if ( $zsbprice > 0 ) {

                        global $customZsbspe;
                        //支付时间与下单时间差
                        $potime = ( $date - $paydate ) % 86400 / 60;


                        //查找店铺准时宝规格
                        $zsbsql = $dsql->SetQuery( "SELECT `zsbspe` ,`chucan_time`,`delivery_time`,`open_zsb`FROM `#@__waimai_shop` WHERE `id` = " . $sid );
                        $zsbre  = $dsql->dsqlOper( $zsbsql , "results" );

                        $zsbspecifications = $zsbre['0']['open_zsb'] == "1" ? $zsbre['0']['zsbspe'] : $customZsbspe;

                        $delivery_time = $zsbre['0']['delivery_time'];

                        //判断完成时间是否超出规定时间
                        if ( $potime > $delivery_time && $delivery_time ) {
                            //时间超出的部分
                            $beyond = $potime - $delivery_time;
                            if ( $zsbspecifications != "" ) {
                                $zsbspe = unserialize( $zsbspecifications );

                                array_multisort( array_column( $zsbspe , "time" ) , SORT_ASC , $zsbspe );

                                for ( $i = 0; $i < count( $zsbspe ); $i ++ ) {
                                    if ( $zsbspe[$i]['time'] <= $beyond && $beyond < $zsbspe[$i + 1]['time'] ) {
                                        $proportion = $zsbspe[$i]['proportion'];
                                        break;
                                    }
                                    if ( $potime < $zsbspe['0']['time'] ) {
                                        $proportion = '0';
                                        break;
                                    }

                                    $proportion = $zsbspe[$i]['proportion'];
                                }

                                if ( $proportion != 0 ) {
                                    $chucan_time = $zsbre['0']['chucan_time'];
                                    //骑手取货时间差
                                    $shtime = ( $date - $songdate ) % 86400 / 60;
                                    // $shtime = ($date-$peidate)%86400/60; //骑手时间
                                    //计算由谁承担费用
                                    $cptypeinfo = "";
                                    if ( ( $potime - $shtime ) > $chucan_time ) {  //商户时间大于出餐 商家赔付

                                        $cpmoney = ( $amount - $zsbprice ) * ( $proportion / 100 );

                                        if ( $cptype == 0 ) {
                                            $cptypeinfo = ", `cptype` = 1 ";
                                        }

                                        //商家
                                        $cpsql = $dsql->SetQuery( "UPDATE `#@__waimai_order_all` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $value " );
                                        $cpre  = $dsql->dsqlOper( $cpsql , "update" );

                                    } else {
                                        //骑手
                                        $cpmoney = ( $amount - $zsbprice ) * ( $proportion / 100 );

                                        if ( $cptype == 0 ) {
                                            $cptypeinfo = ", `cptype` = 2 ";
                                        }

                                        $cpsql = $dsql->SetQuery( "UPDATE `#@__waimai_order_all` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $value " );
                                        $cpre  = $dsql->dsqlOper( $cpsql , "update" );
                                    }

                                    //给用户加钱
                                    $sql = $dsql->SetQuery( "UPDATE `#@__member` SET `money` = `money` + $cpmoney WHERE `id` = $uid" );
                                    $dsql->dsqlOper( $sql , "update" );

                                    $paramUser = array ( "service" => "member" , "type" => "user" , "template" => "orderdetail" , "module" => "waimai" , "id" => $value
                                    );
                                    $urlParam  = serialize( $paramUser );
                                    $sql       = $dsql->SetQuery( "SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1" );
                                    $ret       = $dsql->dsqlOper( $sql , "results" );
                                    $pid       = '';
                                    if ( $ret ) {
                                        $pid = $ret[0]['id'];
                                    }
                                    global $userLogin;
                                    $user      = $userLogin->getMemberInfo( $uid );
                                    $usermoney = $user['money'];
                                    //                                    $money  = sprintf('%.2f',($usermoney + $cpmoney));
                                    $title_ = "外卖准时宝赔付-" . $ordernum;
                                    //保存操作日志
                                    $archives = $dsql->SetQuery( "INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$cpmoney', '准时宝赔付:$ordernum', '$date','waimai','peifu','$pid','$urlParam','$title_','$ordernum','$usermoney')" );

                                    $result = $dsql->dsqlOper( $archives , "update" );

                                }
                            }
                        }


                    }

                    //商家结算
                    $fenxiaoarr = array ( 'uid' => $uid , 'ordernum' => $ordernum , 'amount' => $amount , 'ordertype' => $ordertype
                    );
                    //商家结算
                    $staticmoney = getwaimai_staticmoney( '3' , $value , $fenxiaoarr );

                    //外卖类型参与平台与分站提成
                    if ( $ordertype == 0 ) {
                        //分站相关

                        $peisong = $peisongvip = 0;
                        if ( $priceinfo ) {
                            foreach ( $priceinfo as $k_ => $v_ ) {
                                if ( $v_['type'] == "peisong" ) {
                                    $peisong = $v_['amount'];
                                }
                                if ( $v_['type'] == "auth_peisong" ) {
                                    $peisongvip = $v_['amount'];
                                }
                            }
                        }
                        global $cfg_fzwaimaiFee;
                        global $userLogin;
                        //分站佣金
                        $fzFee = cityCommission( $cityid , 'waimai' );
                        //    $peisongall = $peisong + $peisongvip - $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                        $peisongall     = $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                        $fztotalAmount_ = ( $staticmoney['ptyd'] - $peisongall ) * $fzFee / 100;
                        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                        $staticmoney['ptyd']-=$fztotalAmount_;//总站-=分站
                        $cityName       = getSiteCityName( $cityid );

                        $fzarchives = $dsql->SetQuery( "UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'" );
                        $dsql->dsqlOper( $fzarchives , "update" );
                        $user      = $userLogin->getMemberInfo( $uid );
                        $usermoney = $user['money'];
                        $money     = sprintf( '%.2f' , ( $usermoney + $amount ) );
                        //保存操作日志
                        $now      = GetMkTime( time() );
                        $archives = $dsql->SetQuery( "INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$amount', '外卖订单(分站佣金)：$ordernum', '$now','$cityid','$fztotalAmount_','waimai','" . $staticmoney['ptyd'] . "','1','shangpinxiaoshou','$money')" );
                        $lastid   = $dsql->dsqlOper( $archives , "lastid" );
                        substationAmount( $lastid , $cityid );
                        //                        $dsql->dsqlOper($archives, "update");

                        //微信通知
                        $param = array ( 'type'   => "1" , //区分佣金 给分站还是平台发送 1分站 2平台
                                         'cityid' => $cityid , 'notify' => '管理员消息通知' , 'fields' => array ( 'contentrn' => $cityName . '分站——外卖模块——分站获得佣金 :' . $fztotalAmount_ , 'date' => date( "Y-m-d H:i:s" , time() ) ,
                            )
                        );

                        $params = array ( 'type'   => "2" , //区分佣金 给分站还是平台发送 1分站 2平台
                                          'cityid' => $cityid , 'notify' => '管理员消息通知' , 'fields' => array ( 'contentrn' => $cityName . '分站——外卖模块——分站获得佣金 :' . $fztotalAmount_ , 'date' => date( "Y-m-d H:i:s" , time() ) ,
                            )
                        );
                        //后台微信通知
                        updateAdminNotice( "waimai" , "detail" , $param );
                        updateAdminNotice( "waimai" , "detail" , $params );
                    }

                    $param = array ( "service" => "member" , "type" => "user" , "template" => "orderdetail" , "module" => "waimai" , "id" => $value);

                    //自定义配置
                    $config = array ( "ordernum" => $ordernumstore , "date" => date( "Y-m-d H:i:s" , $okdate ) , "fields" => array ( 'keyword1' => '订单号' , 'keyword2' => '完成时间'
                    )
                    );
                    updateMemberNotice( $uid , "会员-订单完成通知" , $param , $config , '' , '' , 0 , 0 );
                  
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

/*商家出餐时间*/
if ( $action == "mealtime" ) {

    $id = (int)$id;
    if ( !empty( $id ) ) {
        $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
        $break_table = $sub->getSubTableById( $id );

        $sql = $dsql->SetQuery( "SELECT `state`,`ordernum`,`id`,`peisongid` FROM `" . $break_table . "` WHERE `id` = $id" );
        $ret = $dsql->dsqlOper( $sql , "results" );
        if ( $ret ) {
            if ( $ret[0]['state'] != 3 && $ret[0]['state'] != 4) {
                echo '{"state": 200, "info": "操作失败,请检查订单状态！"}';
                exit();
            }
            $ordernum  = $ret[0]['ordernum'];
            $oid       = $ret[0]['id'];
            $peisongid = $ret[0]['peisongid'];
        } else {
            echo '{"state": 200, "info": "操作失败，订单不存在！"}';
            exit();
        }
        $date = GetMkTime( time() );
        $sql  = $dsql->SetQuery( "UPDATE `#@__waimai_order_all` SET  `mealtime` = '$date' WHERE `id` in ($id)" );
        $ret  = $dsql->dsqlOper( $sql , "update" );
        if ( $ret == "ok" ) {

            global $cfg_secureAccess;
            global $cfg_basehost;

            if ($peisongid != 0) {
                $OrderUrl = $cfg_secureAccess . $cfg_basehost . "/index.php?service=waimai&do=courier&template=detail&id=" . $oid . "&ordertype=waimai";
                sendapppush($peisongid, "商家已出餐！请尽快取餐", "订单号：" . $shopname . $ordernum, $OrderUrl, 'readymeal');
            }
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        } else {
            echo '{"state": 200, "info": "操作失败！"}';
            exit();
        }
    }

}

//无效订单
if ( $action == "failed" ) {
    if ( !empty( $id ) ) {
        if ( empty( $note ) ) {
            echo '{"state": 200, "info": "请填写失败原因！"}';
            exit();
        }
        $mytcancel_fee = 0;
        /*操作验证*/
        $verstsql = $dsql->SetQuery( "SELECT  o.`ordernumstore` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` in ($id) AND  s.`merchant_deliver` = 0 AND o.`state` != 0 AND `selftime` = 0" );

        $verstres = $dsql->dsqlOper( $verstsql , "results" );

        if ( $verstres && is_array( $verstres ) ) {

            // echo '{"state": 200, "info": "商家仅可以设置自配订单！"}';
            // exit();
        }
        $ids = explode( "," , $id );
        foreach ( $ids as $key => $value ) {

            //            $sql = $dsql->SetQuery("SELECT o.`peisongid`, o.`ordernumstore`, o.`food`, s.`shopname`,o.`state`,o.`is_other`,o.`otherordernum` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value AND (o.`state` = 4 OR o.`state` = 5) AND (o.`peisongid` != '' or o.`is_other` ==1)");
            $sql = $dsql->SetQuery( "SELECT o.`id`, o.`peisongid`, o.`ordernumstore`, o.`food`, s.`shopname`,o.`state`,o.`is_other`,o.`otherordernum`,o.`ordernum` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $value AND (o.`state` = 2 OR o.`state` = 3 OR o.`state` = 4 OR o.`state` = 5)" );
            $ret = $dsql->dsqlOper( $sql , "results" );
            if ( $ret ) {
                $oid = (int)$ret[0]['id'];
                $peisongid     = $ret[0]['peisongid'];
                $ordernumstore = $ret[0]['ordernumstore'];
                $shopname      = $ret[0]['shopname'];
                $state         = (int)$ret[0]['state'];
                $is_other      = (int)$ret[0]['is_other'];
                $ordernum      = $ret[0]['ordernum'];
                $otherordernum = $ret[0]['otherordernum'];

                $fail_msg = '';  //第三方平台取消失败原因

                /*第三方取消订单*/
                if ( $is_other == 1 && ( $state == 3 || $state == 4 || $state == 5 ) ) {
                    //                    $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");
                    //
                    //                    $pluginsres = $dsql->dsqlOper($pluginssql, "results");

                    $inc = HUONIAOINC . "/config/waimai.inc.php";
                    include $inc;
                    $otherpeisong = (int)$custom_otherpeisong;
                    /*第三方配送员*/
                    if ( $otherpeisong != 0 ) {

                        if ( $otherpeisong == 1 ) {
                            $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                        } elseif($otherpeisong == 2){
                            $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                        }elseif($otherpeisong == 3){
                            $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";

                        }
                        include $pluginFile;
                        if ( file_exists( $pluginFile ) ) {

                            $otherarr = $data['otherparam'] != '' ? unserialize( $data['otherparam'] ) : array ();

                            if ( $otherpeisong == 1 ) {

                                $uuPaoTuiClass = new uuPaoTui();

                                $results = $uuPaoTuiClass->cancelOrder( $otherordernum , $note );

                            } elseif($otherpeisong == 2){

                                if ( $state == 4 || $state == 5 ) {

                                    echo '{"state": 200, "info": "其中有优闪速达的订单取消失败:配送中的订单不能取消，如要取消，需要拨打各跑腿平台自行客服取消订单，发布订单骑手接单超2分钟取消订单将会扣取2元误工费"}';
                                    exit();
                                }

                                $youShanSuDaClass = new youshansuda();

                                $paramarr = array ( 'order_no' => $otherordernum
                                );
                                $results  = $youShanSuDaClass->cancelOrder( $paramarr );
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
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `mytcancel_fee` = '$mytcancel_fee' WHERE `id` = $oid");
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

                $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = '7', `failed` = '$_note', `failedadmin` = $userid WHERE `id` = $oid");
                $dsql->dsqlOper($sql, "update");
                
                $food = unserialize( $ret[0]['food'] );

                if ( $peisongid > 0 ) {
                    sendapppush( $peisongid , "您有一笔订单已取消，不必配送！" , "订单号：" . $shopname . $ordernumstore , "" , "peisongordercancel" );
                    // aliyunPush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：".$shopname.$ordernumstore, "peisongordercancel");
                }

                // 更新库存
                foreach ( $food as $k => $v ) {
                    // $id    = $v['id'];
                    $count = $v['count'];

                    $sql = $dsql->SetQuery( "UPDATE `#@__waimai_list` SET `stock` = `stock` + $count WHERE `id` = '$value' AND `stockvalid` = 1 AND `stock` > 0" );
                    $dsql->dsqlOper( $sql , "update" );

                    $sql = $dsql->SetQuery( "UPDATE `#@__waimai_list` SET `sale` = `sale` - $count WHERE `id` = '$value'" );
                    $dsql->dsqlOper( $sql , "update" );
                }


                //消息通知用户
                $uid   = $ret[0]['uid'];
                $param = array ( "service" => "member" , "type" => "user" , "template" => "orderdetail" , "module" => "waimai" , "id" => $value
                );

                //自定义配置
                $config = array ( "ordernum" => $shopname . $ordernumstore , "date" => date( "Y-m-d H:i:s" , time() ) , "info" => $note , "fields" => array ( 'keyword1' => '订单编号' , 'keyword2' => '取消时间' , 'keyword3' => '取消原因'
                )
                );

                updateMemberNotice( $uid , "会员-订单取消通知" , $param , $config , '' , '' , 0 , 0 );
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


//商家确认出餐时间

if ( $action == "mealtime" ) {
    if ( $id == '' )
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();

    $id = (int)$id;

    $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
    $break_table = $sub->getSubTableById( $id );

    $sql = $dsql->SetQuery( "SELECT `state` FROM `" . $break_table . "` WHERE `id` = $id" );
    $ret = $dsql->dsqlOper( $sql , "results" );
    if ( $ret ) {
        if ( $ret[0]['state'] != 3 || $ret[0]['state'] != 4 ) {
            echo '{"state": 200, "info": "操作失败,请检查订单状态！"}';
            exit();
        }
    } else {
        echo '{"state": 200, "info": "操作失败，订单不存在！"}';
        exit();
    }

    $date = GetMkTime( time() );
    $sql  = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `mealtime` = '$date' WHERE `state` = 3 OR `state` = 4 AND `id` = $id" );
    $ret  = $dsql->dsqlOper( $sql , "update" );

    if ( $ret == 'ok' ) {
        echo '{"state": 100, "info": "操作成功！"}';
        die;
    } else {
        echo '{"state": 100, "info": "操作失败！"}';
        die;
    }


}


//设置配送员
if ( $action == "setCourier" ) {
    if ( !empty( $id ) && $courier ) {
        $ids  = explode( "," , $id );
        $now  = GetMkTime( time() );
        $date = date( "Y-m-d H:i:s" , $now );

        $err = array ();
        foreach ( $ids as $key => $value ) {

            $value = (int)$value;

            $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
            $break_table = $sub->getSubTableById( $value );

            $sql = $dsql->SetQuery( "SELECT o.`sid`, o.`ordernum`, o.`food`, o.`ordernumstore`, o.`peisongid`, o.`peisongidlog`, s.`shopname`,s.`cityid` FROM `" . $break_table . "` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE  o.`id` = '" . $value . "' AND o.`ordertype` = 0 AND `selftime` = 0" );
            $ret = $dsql->dsqlOper( $sql , "results" );
            if ( !$ret )
                break;

            $sid           = $ret[0]['sid'];
            $cityid        = $ret[0]['cityid'];
            $shopname      = $ret[0]['shopname'];
            $ordernum      = $ret[0]['ordernum'];
            $ordernumstore = $ret[0]['ordernumstore'];
            $peisongid     = $ret[0]['peisongid'];
            $peisongidlog  = $ret[0]['peisongidlog'];
            $food          = unserialize( $data['food'] );

            $foods = array ();
            foreach ( $food as $k => $v ) {
                array_push( $foods , $v['title'] . "×" . $v['count'] );
            }

            $param = array ( "service" => "member" , "type" => "user" , "template" => "orderdetail" , "module" => "waimai" , "id" => $value['id']
            );


            // 没有变更

            if ( $courier == $peisongid )
                continue;


            $sql = $dsql->SetQuery( "SELECT `id`, `name`, `phone`,`cityid`,`getproportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid || `id` = $courier" );
            $ret = $dsql->dsqlOper( $sql , "results" );
            if ( $ret ) {
                foreach ( $ret as $k => $v ) {
                    if ( $v['id'] == $peisongid ) {
                        $peisongname_ = $v['name'];
                        $peisongtel_  = $v['phone'];
                        $ccityid      = $v['cityid'];
                    } else {
                        $peisongname   = $v['name'];
                        $peisongtel    = $v['phone'];
                        $ccityid       = $v['cityid'];
                        $getproportion = $v['getproportion'];
                    }
                }
            }
            if ( $cityid != $ccityid )
                continue;


            if ( $peisongid ) {
                // 骑手变更记录
                $pslog = "此订单在 " . $date . " 重新分配了配送员，原配送员是：" . $peisongname_ . "（" . $peisongtel_ . "），新配送员是:" . $peisongname . "（" . $peisongtel . "）<hr>" . $peisongidlog;
            } else {
                $pslog = "";
            }


            $inc = HUONIAOINC . "/config/waimai.inc.php";
            include $inc;
            $courierfencheng  = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;

            $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `state` = 4, `peisongid` = '$courier', `peisongidlog` = '$pslog',`courierfencheng` = '$courierfencheng' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value" );

            $ret = $dsql->dsqlOper( $sql , "update" );
            if ( $ret == "ok" ) {
                //推送消息给骑手
                sendapppush( $courier , "您有新的配送订单" , "订单号：" . $shopname . $ordernumstore , $url , "newfenpeiorder" );
                // aliyunPush($courier, "您有新的配送订单", "订单号：".$shopname.$ordernumstore, "newfenpeiorder");
                if ( $peisongid ) {
                    sendapppush( $peisongid , "您有订单被其他骑手派送" , "订单号：" . $shopname . $ordernumstore , "" , "peisongordercancel" );
                    // aliyunPush($peisongid, "您有订单被其他骑手派送", "订单号：".$shopname.$ordernumstore, "peisongordercancel");
                }

                //自定义配置
                $config = array ( "ordernum" => $shopname . $ordernumstore , "peisong" => $name . "，" . $phone , "orderinfo" => join( " " , $foods ) , "orderprice" => $amount , "fields" => array ( 'keyword1' => '订单号' , 'keyword2' => '订单详情' , 'keyword3' => '订单金额' , 'keyword4' => '配送人员'
                )
                );

                // 推送给用户
                updateMemberNotice( $uid , "会员-订单配送提醒" , $param , $config , '' , '' , 0 , 0 );

            } else {
                array_push( $err , $value );
            }
        }


        if ( $err ) {
            echo '{"state": 200, "info": "操作失败！"}';
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
if ( $action == "cancelCourier" ) {
    die( '{"state": 200, "info": "操作失败！"}' );
    if ( !empty( $id ) ) {
        $sql = $dsql->SetQuery( "UPDATE `#@__waimai_order_all` SET `state` = 3, `peisongid` = '0' WHERE (`state` = 4 OR `state` = 5) AND `id` in ($id)" );
        $ret = $dsql->dsqlOper( $sql , "update" );
        if ( $ret == "ok" ) {
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


// 退款
if ( $action == "refund" ) {
    require_once HUONIAOINC . '/config/waimai.inc.php';

    if ( $customMemberRefundswitch != 0 ) {
        echo '{"state": 200, "info": "您无权无权限进行此操作！"}';
        exit();
    }

    if ( empty( $id ) ) {
        echo '{"state": 200, "info": "参数错误"}';
        exit();
    }

    $sql = $dsql->SetQuery( "SELECT o.`paytype`, o.`uid`, o.`amount`, o.`ordernumstore`,o.`balance`,o.`point`,o.`payprice` ,o.`refrundstate`,o.`refrunddate`,o.`refrundamount`,o.`ordernum`, s.`shopname` FROM `#@__waimai_order_all` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 7 AND o.`paytype` != 'delivery' AND o.`refrundstate` = 0 AND o.`amount` > 0 AND o.`id` = $id AND o.`sid` in ($managerIds)" );
    $ret = $dsql->dsqlOper( $sql , "results" );

    if ( $ret ) {
        $value         = $ret[0];
        $date          = GetMkTime( time() );
        $uid           = $value['uid'];
        $paytype       = $value['paytype'];
        $amount        = $value['amount'];
        $ordernum      = $value['ordernum'];
        $shopname      = $value['shopname'];
        $ordernumstore = $value['ordernumstore'];
        $balance       = $value['balance'];
        $payprice      = $value['payprice'];
        $point         = $value['point'];
        $refrundstate  = $value['refrundstate'];
        $refrundno     = $value['refrundno'];
        $refrunddate   = $value['refrunddate'];
        //外卖分表
        $sub         = new SubTable( 'waimai_order' , '#@__waimai_order' );
        $break_table = $sub->getSubTableById( $id );
        $sql         = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrundstate` = 1, `refrunddate` = '$date', `refrundadmin` = $userid, `refrundfailed` = '' WHERE `id` = $id" );
        $ret         = $dsql->dsqlOper( $sql , "update" );
        if ( $ret != "ok" ) {
            echo '{"state": 200, "info": "操作失败！"}';
            exit();
        }


        $r = true;

        // 支付宝
        if ( $paytype == "alipay" && $payprice != 0 ) {
            $order = array ( "ordernum" => $ordernum , "amount" => $payprice
            );


            require_once( HUONIAOROOT . "/api/payment/alipay/alipayRefund.php" );
            $alipayRefund = new alipayRefund();

            $return = $alipayRefund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {

                $r = false;
            }

            // 微信
        } else if ( $paytype == "wxpay" && $payprice != 0 ) {
            $order = array ( "ordernum" => $ordernum , "orderamount" => $payprice , "amount" => $payprice
            );

            require_once( HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php" );
            $wxpayRefund = new wxpayRefund();

            $return = $wxpayRefund->refund( $order );
            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {
                $r = false;
            }

            // 银联
        } else if ( $paytype == "unionpay" && $payprice != 0 ) {

            $order = array ( "ordernum" => $ordernum , "amount" => $payprice , "transaction_id" => $transaction_id
            );

            require_once( HUONIAOROOT . "/api/payment/unionpay/unionpayRefund.php" );
            $unionpayRefund = new unionpayRefund();

            $return = $unionpayRefund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {

                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );

            } else {

                $r = false;

            }


            // 工行E商通
        } else if ( $paytype == "rfbp_icbc" && $payprice != 0 ) {

            $order = array ( "ordernum" => $ordernum , "orderamount" => $payprice , "amount" => $payprice
            );

            require_once( HUONIAOROOT . "/api/payment/rfbp_icbc/rfbp_refund.php" );
            $rfbp_refund = new rfbp_refund();

            $return = $rfbp_refund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {
                $r = false;
            }


            // 百度小程序
        } else if ( $paytype == "baidumini" && $payprice != 0 ) {

            $order = array ( "ordernum" => $ordernum , "orderamount" => $payprice , "amount" => $payprice
            );

            require_once( HUONIAOROOT . "/api/payment/baidumini/refund.php" );
            $baiduminiRefund = new baiduminiRefund();

            $return = $baiduminiRefund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {
                $r = false;
            }


            // YabandPay
        } else if ( ( $paytype == "yabandpay_wxpay" || $paytype == "yabandpay_alipay" ) && $payprice != 0 ) {

            $order = array ( "ordernum" => $ordernum , "orderamount" => $payprice , "amount" => $payprice
            );

            require_once( HUONIAOROOT . "/api/payment/yabandpay_wxpay/yabandpay_refund.php" );
            $yabandpay_refund = new yabandpay_refund();

            $return = $yabandpay_refund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['trade_no'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {
                $r = false;
            }


            // bytemini
        } else if ( $paytype == "bytemini" && $payprice != 0 ) {

            $order = array ( "service" => 'waimai' , "ordernum" => $ordernum , "orderamount" => $payprice , "amount" => $payprice
            );

            require_once( HUONIAOROOT . "/api/payment/bytemini/bytemini_refund.php" );
            $bytemini_refund = new bytemini_refund();

            $return = $bytemini_refund->refund( $order );

            // 成功
            if ( $return['state'] == 100 ) {
                $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrunddate` = '" . GetMkTime( $return['date'] ) . "', `refrundno` = '" . $return['refundOrderNo'] . "' WHERE `id` = $id" );
                $ret = $dsql->dsqlOper( $sql , "update" );
            } else {
                $r = false;
            }
        }
        if ( $r ) {
            if ( $point != 0 && $uid) {
                $info     = '外卖订单退回：(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname;
                $archives = $dsql->SetQuery( "UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = " . $uid );
                $dsql->dsqlOper( $archives , "update" );
                $user      = $userLogin->getMemberInfo( $uid );
                $userpoint = $user['point'];
                //                $pointuser = (int)($userpoint+$point);
                //保存操作日志
                $archives = $dsql->SetQuery( "INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '$info', " . GetMkTime( time() ) . ",'tuihui','$userpoint')" );
                $dsql->dsqlOper( $archives , "update" );

            }
            //会员帐户充值

            if ( $balance != 0 ) {
                global $userLogin;
                $info      = '外卖退款：(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname;
                $userOpera = $dsql->SetQuery( "UPDATE `#@__member` SET `money` = `money` + " . $balance . " WHERE `id` = " . $uid );
                $dsql->dsqlOper( $userOpera , "update" );
                $user      = $userLogin->getMemberInfo( $uid );
                $usermoney = $user['money'];
                //                $money  = sprintf('%.2f',($usermoney + $balance));
                //记录退款日志
                $logs = $dsql->SetQuery( "INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES (" . $uid . ", " . $balance . ", 1, '$info', " . GetMkTime( time() ) . ",'shop','tuikuan','$usermoney')" );
                $dsql->dsqlOper( $logs , "update" );

            }
            $sql  = $dsql->SetQuery( "SELECT `username` FROM `#@__member` WHERE `id` = $uid" );
            $user = $dsql->dsqlOper( $sql , "results" );
            if ( $user ) {
                $param = array ( "service" => "member" , "type" => "user" , "template" => "record"
                );

                //自定义配置
                $config = array ( "username" => $user['username'] , "order" => $shopname . $ordernumstore , "amount" => $amount , "fields" => array ( 'keyword1' => '退款状态' , 'keyword2' => '退款金额' , 'keyword3' => '审核说明'
                )
                );

                updateMemberNotice( $userid , "会员-订单退款成功" , $param , $config , '' , '' , 0 , 0 );
            }
            echo '{"state": 100, "info": "退款操作成功！"}';
        } else {
            $sql = $dsql->SetQuery( "UPDATE `" . $break_table . "` SET `refrundstate` = '$refrundstate', `refrunddate` = '$refrunddate', `refrundamount` = '$refrundamount', `refrundfailed` = '' WHERE `id` = $id" );
            $ret = $dsql->dsqlOper( $sql , "update" );
            echo '{"state": 200, "info": "退款失败，错误码：' . $return['code'] . '"}';
        }


        exit();

    } else {
        echo '{"state": 200, "info": "操作失败，请检查订单状态！"}';
        exit();

    }

}


$where = " AND s.`id` in ($managerIds)";

$state = empty( $state ) ? 2 : $state;


//订单编号

if ( !empty( $ordernum ) ) {
    $where .= " AND (o.`ordernum` like '%$ordernum%' or  `ordernumstore` like '%$ordernum%' )";
}


//店铺名称

if ( !empty( $shopname ) ) {

    $where .= " AND s.`shopname` like '%$shopname%'";

}


//姓名

if ( !empty( $person ) ) {

    $where .= " AND o.`person` = '%$person%'";

}


//电话

if ( !empty( $tel ) ) {

    $where .= " AND o.`tel` like '%$tel%'";

}


//地址

if ( !empty( $address ) ) {

    $where .= " AND o.`address` like '%$address%'";

}


//订单金额

if ( !empty( $amount ) ) {
    $amount = (float)$amount;
    $where .= " AND o.`amount` = '$amount'";

}


//订单状态

if ( $state ) {
    /*8 自取订单 9配送异常*/
    if ( $state == 8 ) {
        $where .= " AND o.`selftime` != 0 AND o.`state` not in (0,1,6,7)";

    } else if ( $state == 9 ) {

        $where .= " AND o.`state` IN(3,4,5) AND ( unix_timestamp( now())- o.`paydate`)/ 60 >s.`delivery_time` AND `ordertype` =0 AND o.`paytype` != 'delivery'";
    } else if ( $state == 10 ) {
        $where .= " AND o.`ordertype` = 1 AND o.`state` not in (1,6,7)";
    }

    if ( $state != 9 && $state != 8 && $state != 10 ) {
        $where .= " AND o.`state` in ($state)";
    }

    /*// 未处理订单需要显示货到付款的订单

    if($state == 2){

        $where .= " AND (o.`state` = '2' || (o.`state` = 0 && o.`paytype` = 'delivery'))";

    }else{

        $where .= " AND o.`state` = '$state'";

    }*/

}


$pageSize = 15;


$sql = $dsql->SetQuery( "SELECT o.`id`, o.`uid`,o.`selftime`, o.`sid`,o.`lng`,o.`lat`, o.`ordernum`, o.`ordernumstore`, o.`state`, o.`food`, o.`priceinfo`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`preset`, o.`note`, o.`pubdate`, o.`okdate`, o.`amount`,o.`peidate`, o.`peisongid`, o.`peisongidlog`, o.`failed`, o.`failed`, o.`refrundstate`, o.`refrunddate`, o.`refrundno`, o.`refrundfailed`, o.`refrundadmin`, o.`transaction_id`, o.`paylognum`,o.`desk`,o.`ordertype`,o.`mealtime`,o.`paydate`,o.`lng`,o.`lat`,o.`songdate`,o.`is_other`,o.`othercourierparam`,s.`shopname`,s.`delivery_time`,s.`coordY`,s.`coordX`,s.`merchant_deliver`,o.`reservesongdate` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1" . $where . " ORDER BY o.`id` DESC" );

// echo $sql;die;

$sql1        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`selftime` != 0 AND o.`state` not in (0,1,6,7)" );
$totalCount1 = $dsql->dsqlOper( $sql1 , "totalCount" );
$sql2        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`state` IN(3,4,5) AND ( unix_timestamp( now())- o.`paydate`)/ 60 >s.`delivery_time` AND `ordertype` =0 AND o.`paytype` != 'delivery'" );
$totalCount2 = $dsql->dsqlOper( $sql2 , "totalCount" );
$sql3        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`ordertype` = 1 AND o.`state` not in (1,6,7)" );
$totalCount3 = $dsql->dsqlOper( $sql3 , "totalCount" );

//待确认
$sql_2        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`state` = 2" );
$totalCount_2 = $dsql->dsqlOper( $sql1 , "totalCount" );

//已确认，待接单
$sql_3        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`state` = 3" );
$totalCount_3 = $dsql->dsqlOper( $sql1 , "totalCount" );

//已接单，待配送
$sql_4        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`state` = 4" );
$totalCount_4 = $dsql->dsqlOper( $sql1 , "totalCount" );

//配送中
$sql_5        = $dsql->SetQuery( "SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1 = 1 AND s.`id` in ($managerIds) AND o.`state` = 5" );
$totalCount_5 = $dsql->dsqlOper( $sql1 , "totalCount" );


//总条数

$totalCount = $dsql->dsqlOper( $sql , "totalCount" );

//总分页数

$totalPage = ceil( $totalCount / $pageSize );


$p = (int)$p == 0 ? 1 : (int)$p;

$atpage = $pageSize * ( $p - 1 );

$results = $dsql->dsqlOper( $sql . " LIMIT $atpage, $pageSize" , "results" );


$list = array ();

foreach ( $results as $key => $value ) {

    $list[$key]['id'] = $value['id'];

    $list[$key]['uid']       = $value['uid'];
    $list[$key]['desk']      = $value['desk'];
    $list[$key]['ordertype'] = $value['ordertype'];
    $list[$key]['mealtime']  = $value['mealtime'];
    $list[$key]['paydate']   = $value['paydate'];
    $list[$key]['lng']       = $value['lng'];
    $list[$key]['lat']       = $value['lat'];
    $list[$key]['songdate']  = date( 'Y-m-d' , $value['peidate'] );


    //用户名

    // $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["uid"]);

    // $username = $dsql->dsqlOper($userSql, "results");

    // if(count($username) > 0){

    //     $list[$key]["username"] = $username[0]['username'];

    // }else{

    //     $list[$key]["username"] = "未知";

    // }

    $list[$key]['selftime'] = $value['selftime'];

    $list[$key]['delivery_time'] = $value['delivery_time'];

    $list[$key]['sid'] = $value['sid'];

    $list[$key]['shopname'] = $value['shopname'];

    $list[$key]['ordernum'] = $value['ordernum'];

    $list[$key]['merchant_deliver'] = $value['merchant_deliver'];

    $list[$key]['ordernumstore'] = $value['ordernumstore'];

    $list[$key]['state'] = $value['state'];

    $foodarr = unserialize( $value['food'] );

    $list[$key]['food'] = $foodarr;

    $list[$key]['foodcount'] = 0;

    $foodpiclist = array ();

    if ( !empty( $foodarr ) && is_array( $foodarr ) ) {

        foreach ( $foodarr as $a => $b ) {
            $list[$key]['foodcount'] += $b['count'];

            $foodpicsql = $dsql->SetQuery( "SELECT `pics` FROM `#@__waimai_list` WHERE `id`  = '" . $b['id'] . "'" );
            $foodpicres = $dsql->dsqlOper( $foodpicsql , "results" );

            $foodpiclist[$a]['picpath'] = getFilePath( $foodpicres[0]['pics'] );
        }

        $list[$key]['foodpiclist'] = $foodpiclist;


        $foodcount = array_sum( array_column( $foodarr , 'count' ) );
    }

    $list[$key]['person'] = $value['person'] ? $value['person'] : '';

    $list[$key]['foodcount'] = $foodcount;

    $list[$key]["username"] = $value['person'] ? $value['person'] : '';

    $list[$key]['tel'] = $value['tel'] ? $value['tel'] : '';

    $list[$key]['address'] = $value['address'] ? $value['address'] : '';

    /*当前与用户支付时间差*/
    if ( $value['paytype'] == 'delivery' ) {
        $list[$key]['paydiff'] = ( time() - $value['pubdate'] ) % 86400 / 60;
    } else {

        $list[$key]['paydiff'] = ( time() - $value['paydate'] ) % 86400 / 60;
    }

    // $list[$key]['paytype']       = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : $value['paytype']);

    $_paytype    = '';
    $_paytypearr = array ();
    $paynamearr  = array ( 'wxpay' => '微信支付' , 'alipay' => '支付宝' , 'unionpay' => '银联支付' , 'rfbp_icbc' => '工行E商通' , 'baidumini' => '百度收银台' , 'qqmini' => 'QQ小程序' , 'money' => '余额支付' , 'delivery' => '货到付款' , 'integral' => '积分支付' , 'underpay' => '线下支付' , 'fomopay_paynow' => 'fomoPayNow' , 'fomopay_wxpay' => 'WXPAY' ,
    );
    $paytypearr  = $value['paytype'] != '' ? explode( ',' , $value['paytype'] ) : array ();

    if ( $paytypearr ) {
        foreach ( $paytypearr as $k => $v ) {
            if ( $v != '' ) {
                array_push( $_paytypearr , isset( $paynamearr[$v] ) ? $paynamearr[$v] : '' );
            }
        }
        if ( $_paytypearr ) {
            $_paytype = join( ',' , $_paytypearr );
        }
    }
    $list[$key]['paytype'] = $_paytype;

    $list[$key]['preset'] = unserialize( $value['preset'] );

    $list[$key]['note'] = $value['note'];

    $list[$key]['pubdate'] = $value['pubdate'];

    $list[$key]['peidate'] = date( "Y-m-d" , $value['peidate'] );

    $list[$key]['pubdatef'] = date( "m-d" , $value['pubdate'] );

    $list[$key]['okdate'] = $value['okdate'];

    $list[$key]['amount'] = $value['amount'];

    $list[$key]['peisongid'] = $value['peisongid'];

    if ( $value['peisongid'] ) {

        $peisongsql = $dsql->SetQuery( "SELECT `lng`,`lat` FROM `#@__waimai_courier` WHERE `id` = '" . $value['peisongid'] . "'" );

        $peisongres = $dsql->dsqlOper( $peisongsql , "results" );

        $list[$key]['peisonglng'] = $peisongres[0]['lng'];

        $list[$key]['peisonglat'] = $peisongres[0]['lat'];
    }


    $list[$key]['peisongidlog'] = $value['peisongidlog'] ? substr( $value['peisongidlog'] , 0 , - 4 ) : "";

    $list[$key]['failed'] = $value['failed'];

    $list[$key]['refrundstate'] = $value['refrundstate'];

    $list[$key]['refrunddate'] = $value['refrunddate'];

    $list[$key]['refrundno'] = $value['refrundno'];

    $list[$key]['refrundfailed'] = $value['refrundfailed'];

    $list[$key]['transaction_id'] = $value['transaction_id'];

    $list[$key]['coordX'] = $value['coordX'];

    $list[$key]['coordY'] = $value['coordY'];

    $list[$key]['paylognum'] = $value['paylognum'];

    $list[$key]['priceinfo'] = unserialize( $value['priceinfo'] );

    $staticmoney = getwaimai_staticmoney( '2' , $value['id'] );

    $list[$key]['business'] = $staticmoney['business'];

    if ( empty( $value['paylognum'] ) ) {

        $sql = $dsql->SetQuery( "SELECT `ordernum` FROM `#@__pay_log` WHERE `body` = '" . $value['ordernum'] . "'" );

        $ret = $dsql->dsqlOper( $sql , "results" );

        if ( $ret ) {

            $list[$key]['paylognum'] = $ret[0]['ordernum'];

        }

    }


    if ( $value['refrundadmin'] != 1 ) {

        $sql = $dsql->SetQuery( "SELECT `username` FROM `#@__member` WHERE `id` = " . $value['refrundadmin'] );

        $ret = $dsql->dsqlOper( $sql , "results" );

        if ( $ret ) {

            $list[$key]['refrundadmin'] = $ret[0]['username'];

        }

    } else {

        $list[$key]['refrundadmin'] = $cfg_shortname;

    }


    // 判断是否今日

    $list[$key]['today'] = date( "Ymd" , $value['pubdate'] ) == date( "Ymd" ) ? 1 : 0;


    $sql = $dsql->SetQuery( "SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = " . $value['peisongid'] );

    $ret = $dsql->dsqlOper( $sql , "results" );

    if ( $ret && $value['is_other'] == 0 ) {

        $list[$key]['peisongname'] = $ret[0]['name'];

        $list[$key]['peisongtel'] = $ret[0]['phone'];

    } else {
        $otherCourier = $value['othercourierparam'] != '' ? unserialize( $value['othercourierparam'] ) : array ();

        if ( $otherCourier ) {

            $list[$key]['peisongname'] = $otherCourier['driver_name'];
            $list[$key]['peisongtel']  = $otherCourier['driver_mobile'];

        } else {

            $list[$key]['peisongname'] = '未知';
            $list[$key]['peisongtel']  = '';
        }
    }
    /*店铺距离用户*/
    //    var_dump($value['coordX'], $value['coordY'], $value['lat'], $value['lng']);die;
    $juliuser               = getDistance( $value['coordX'] , $value['coordY'] , $value['lat'] , $value['lng'] );
    $juliuser               = $juliuser > 1000 ? ( sprintf( "%.1f" , $juliuser / 1000 ) . $langData['siteConfig'][13][23] ) : ( $juliuser . $langData['siteConfig'][13][22] );  //距离   //千米
    $list[$key]['juliuser'] = $juliuser;

    /*验证是否收藏*/
    $archives              = $dsql->SetQuery( "SELECT `id` FROM `#@__member_collect` WHERE `module` = 'waimai' AND `action` = 'shop' AND `aid` = '" . $ret[0]['sid'] . "' AND `userid` = '" . $ret[0]['uid'] . "'" );
    $return                = $dsql->dsqlOper( $archives , "totalCount" );
    $list[$key]['collect'] = $return;

    /*验证是否是首单*/
    $firstsql            = $dsql->SetQuery( "SELECT `id` FROM `#@__waimai_order_all` WHERE `uid` = '" . $value['uid'] . "' AND `sid` = '" . $value['sid'] . "' AND `state` != 0" );
    $firstres            = $dsql->dsqlOper( $firstsql , "totalCount" );
    $list[$key]['first'] = $firstres;

    /*会员等级*/
    $userinfo            = $userLogin->getMemberInfo( $value['uid'] );
    if(is_array($userinfo)){
        $sql                 = $dsql->SetQuery( "SELECT `name` FROM `#@__member_level` WHERE `id` = " . $userinfo['level'] );
        $ret                 = $dsql->dsqlOper( $sql , "results" );
        $list[$key]['level'] = $ret[0]['name'];
    }

    $list[$key]['reservesongdate'] = (int)$value['reservesongdate']; //预定配送时间
    $list[$key]['receivingdate'] = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
    if ($list[$key]['reservesongdate'] > 0) {
        $list[$key]['receivingdate'] = $list[$key]['reservesongdate'] - (int)$list[$key]['delivery_time']*60 - 60;
    }

}

$huoniaoTag->assign( "state" , $state );

$huoniaoTag->assign( "list" , $list );


$pagelist = new pagelist( array (

    "list_rows" => $pageSize ,

    "total_pages" => $totalPage ,

    "total_rows" => $totalCount ,

    "now_page" => $p

) );

$huoniaoTag->assign( "pagelist" , $pagelist->show() );


//查询待确认的订单

$where = " AND `sid` in ($managerIds)";

$sql = $dsql->SetQuery( "SELECT `id` FROM `#@__waimai_order_all` WHERE `state` = 2" . $where );

$ret = $dsql->dsqlOper( $sql , "totalCount" );

$huoniaoTag->assign( "state2" , $ret );


//配送员

$courier = array ();

$sql = $dsql->SetQuery( "SELECT `id`, `name` FROM `#@__waimai_courier` WHERE `state` = 1 ORDER BY `id` DESC" );

$ret = $dsql->dsqlOper( $sql , "results" );

if ( $ret ) {

    foreach ( $ret as $key => $value ) {

        array_push( $courier , array (

            "id" => $value['id'] ,

            "name" => $value['name']

        ) );

    }

}

$huoniaoTag->assign( "courier" , $courier );


// 移动端-获取订单列表

if ( $action == "getList" ) {


    if ( $totalCount == 0 ) {

        $pageinfo = array (

            "page" => $page ,

            "pageSize" => $pageSize ,

            "totalPage" => $totalPage ,

            "totalCount" => $totalCount ,

            "totalCount1" => $totalCount1 ,

            "totalCount2" => $totalCount2 ,

            "totalCount3" => $totalCount3 ,

            "totalCount_2" => $totalCount_2 ,

            "totalCount_3" => $totalCount_3 ,

            "totalCount_4" => $totalCount_4 ,

            "totalCount_5" => $totalCount_5 ,

        );


        if ( $callback ) {
            echo $callback . '({"state": 200, "info": ' . json_encode( '暂无数据' ) . ',"pageInfo":' . json_encode( $pageinfo ) . '})';
        } else {
            echo '{"state": 200, "info": ' . json_encode( '暂无数据' ) . ',"pageInfo":' . json_encode( $pageinfo ) . '}';
        }


    } else {


        $pageinfo = array (

            "page" => $page ,

            "pageSize" => $pageSize ,

            "totalPage" => $totalPage ,

            "totalCount" => $totalCount ,

            "totalCount1" => $totalCount1 ,

            "totalCount2" => $totalCount2 ,

            "totalCount3" => $totalCount3 ,

            "totalCount_2" => $totalCount_2 ,

            "totalCount_3" => $totalCount_3 ,

            "totalCount_4" => $totalCount_4 ,

            "totalCount_5" => $totalCount_5 ,

        );


        $info = array ( "list" => $list , "pageInfo" => $pageinfo );


        if ( $callback ) {
            echo $callback . '({"state": 100, "info": ' . json_encode( $info ) . '})';
        } else {
            echo '{"state": 100, "info": ' . json_encode( $info ) . '}';
        }

    }

    exit();

}


//验证模板文件

if ( file_exists( $tpl . "/" . $templates ) ) {

    $jsFile = array (

        'shop/waimaiOrder.js'

    );

    $huoniaoTag->assign( 'jsFile' , $jsFile );


    $huoniaoTag->assign( 'HUONIAOADMIN' , HUONIAOADMIN );

    $huoniaoTag->assign( 'templets_skin' , $cfg_secureAccess . $cfg_basehost . "/wmsj/templates/" . ( isMobile() ? "touch/" : "" ) );  //模块路径

    $huoniaoTag->display( $templates );

} else {

    echo $templates . "模板文件未找到！";

}
