<?php
if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 外卖定时对预定订单进行处理
 * 
 * @version        $Id: waimai_reserve.php 2016-12-09 下午17:18:16 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

global $dsql;

//判断是否有外卖配置
$installWaimai = false;
$file = HUONIAOROOT.'/include/config/waimai.inc.php';
if(file_exists($file)){
    $installWaimai = true;
    require_once($file);
}

//没有外卖配置就不处理
if (!$installWaimai) {
    die();
}

//初始化日志
$day = date("Ymd");
mkdir(HUONIAOROOT.'/log/waimai_reserve/'.$day, 0777, true);
require_once HUONIAOROOT."/api/payment/log.php";
$waimaiLog= new CLogFileHandler(HUONIAOROOT.'/log/waimai_reserve/'.$day.'/'.date('H').'.log');

//查询已付款，state为2，有预定时间，而且预定时间小于当前时间的订单，而且有打印ID，并且已经成功回调的订单
$nowTime = GetMkTime(time());
$sql = $dsql->SetQuery("SELECT o.`id` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 2 AND o.`reservesongdate` > 0 AND o.`isprint` = 1 AND o.`print_dataid` != '' AND (o.`reservesongdate` - s.`delivery_time`*60) <= ".$nowTime);
$result = $dsql->dsqlOper($sql,"results");

if($result != null && is_array($result)) {

    foreach ($result as $k => $v) {

        //确认订单操作
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`ordernumstore`, o.`pubdate`, o.`food`, o.`amount`,o.`selftime`,o.`ordertype`,o.`person`,o.`tel`, s.`shopname`,s.`address`,s.`coordX`,s.`coordY`,o.`lng`,o.`lat`,o.`address` useraddress,o.`otherparam`,s.`phone` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = ".$v['id']);

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
            $tel           = $data['tel'];
            $person        = $data['person'];
            $shopcoordY    = $data['coordY'];
            $shopcoordX    = $data['coordX'];
            $shopaddress   = $data['address'];
            $lng           = $data['lng'];
            $lat           = $data['lat'];
            $shopshopname  = $data['shopname'];
            $pubusermobile = $data['phone'];
            $useraddress   = !empty($data['useraddress']) ? explode(' ', $data['useraddress']) : array();

            $foods = array();
            foreach ($food as $key => $value) {
                array_push($foods, $value['title'] . " " . $value['count'] . "份");
            }

            $waimaiLog->DEBUG("订单(ID：".$v['id'].")已到预定时间，自动确认！\r\n");


            $error = 0;
//                $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");
//
//                $pluginsres = $dsql->dsqlOper($pluginssql, "results");

            /*第三方配送员*/
            if ($custom_otherpeisong != 0 && $selftime == 0 && $ordertype == 0) {

                if ($custom_otherpeisong == 1) {
                    $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
                    $className = 'uuPaoTui';
                } else {
                    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                    $className = 'youShanSuDa';
                }
                //先判断类是否存在，不存在才include，避免报错
                if (!class_exists($className)) {
                    include $pluginFile;
                }
                //include $pluginFile;
                $otherarr = $data['otherparam'] != '' ? unserialize($data['otherparam']) : array();
                $otherarr['person'] = $person;
                $otherarr['tel']    = $tel;
                $otherarr['pubusermobile']    = $pubusermobile;

                $otherarr['callback_url'] = $cfg_secureAccess.$cfg_basehost.'/include/plugins/13/uuPaotuiCallback.php';
                if (file_exists($pluginFile)) {

                    if ($custom_oterpeisong == 1) {
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

                                $error = 1;
                            }

                        }

                        if ($return_code != 'ok') {

                            $error = 1;
                        }
                    } else {


                    }
                }
            }

            if($error == 0) {

                $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `state` = 3, `confirmdate` = '$nowTime' WHERE `id` = ".$v['id']);
                $dsql->dsqlOper($sql, "update");

                $waimaiLog->DEBUG("确认订单SQL:" . $sql . "\r\n");

            }
            else{
                $waimaiLog->DEBUG("第三方配送错误信息:" . $return_code . "\r\n");
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
}