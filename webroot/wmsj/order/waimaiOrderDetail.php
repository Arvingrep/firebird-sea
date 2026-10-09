<?php
/**
 * 订单详细
 *
 * @version        $Id: orderDetail.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/";
$tpl = isMobile() ? $tpl."touch/order" : $tpl."order";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname = "waimai_order_all";
$templates = "waimaiOrderDetail.html";
if(empty($id)){
    die;
}

$peisongpath = $lng = $lat = $peisonglng = $peisonglat = $coordY = $coordX = '';

$where = " AND `sid` in ($managerIds)";

$sql = $dsql->SetQuery("SELECT * FROM `#@__$dbname` WHERE `id` = $id".$where);
// var_dump($sql);die;
$orderRet = $dsql->dsqlOper($sql, "results");
if($orderRet){

    $ordernum = $orderRet[0]['ordernum'];

    $is_other = $orderRet[0]['is_other'];

    $peisongid = $orderRet[0]['peisongid'];

    $othercourierparam = $orderRet[0]['othercourierparam'];

    $peisongpath = $ret[0]['peisongpath'];

    //更新订单信息的推送状态为已查看
    $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `pushed` = 1 WHERE `sid` in ($managerIds) AND `state` = 2 AND `id` = $id");
    $dsql->dsqlOper($sql, "update");

    foreach ($orderRet[0] as $key => $value) {
        //店铺
        if($key == "sid"){
            $sql = $dsql->SetQuery("SELECT `shopname`, `coordY`, `coordX`, `merchant_deliver`,`delivery_time` FROM `#@__waimai_shop` WHERE `id` = $value");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $huoniaoTag->assign("shopname", $ret[0]['shopname']);
                $huoniaoTag->assign("coordY", $ret[0]['coordY']);
                $huoniaoTag->assign("coordX", $ret[0]['coordX']);
                $huoniaoTag->assign("delivery_time", $ret[0]['delivery_time']);
                $huoniaoTag->assign("merchant_deliver", $ret[0]['merchant_deliver']);

                $coordY = $ret[0]['coordY'];
                $coordX = $ret[0]['coordX'];

                //如果有预定时间，就计算可以接单时间
                $receivingdate = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
                if ($orderRet[0]['reservesongdate'] > 0) {
                    $receivingdate = $orderRet[0]['reservesongdate'] - (int)$ret[0]['delivery_time']*60 - 60;
                    $huoniaoTag->assign("receivingdate", $receivingdate);
                }
            }
        }

        if($key == "id"){
            $storesql = $dsql->SetQuery("SELECT `coordY`, `coordX` FROM `#@__waimai_shop` WHERE `id` = '".$orderRet[0]['sid']."'");
            $storeres = $dsql->dsqlOper($storesql,'results');
    
            $juliuser = getDistance($storeres[0]['coordX'], $storeres[0]['coordY'], $orderRet[0]['lat'], $orderRet[0]['lng']);
            $juliuser               = $juliuser > 1000 ? (sprintf("%.1f", $juliuser / 1000) . $langData['siteConfig'][13][23]) : ($juliuser . $langData['siteConfig'][13][22]);
            $huoniaoTag->assign("juliuser", $juliuser);
        }
        //用户
        if($key == "uid"){
            // $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value);
            // $username = $dsql->dsqlOper($userSql, "results");
            // if(count($username) > 0){
            //     $huoniaoTag->assign("username", $username[0]['username']);
            // }

        }

        //分销商
        if($key == "uid"){
            // $fxs = array();
            // $sql = $dsql->SetQuery("SELECT u.`uid` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` u ON u.`uid` = m.`from_uid` WHERE m.`id` = " . $value);
            // $ret = $dsql->dsqlOper($sql, "results");
            // if($ret){
            //     $fxs_id = $ret[0]['uid'];
            //     $fxs = $userLogin->getMemberInfo($fxs_id);
            //     $huoniaoTag->assign("fxs", $fxs);
            // }
        }

        if($key == "person"){
            $huoniaoTag->assign("person", $value);
            $huoniaoTag->assign("username", $value);
        }

        //商品、预设字段、费用详细
        if($key == "food" || $key == "preset" || $key == "priceinfo"){
            $value = unserialize($value);
            if($key == 'food'){
                foreach ($value as $a => &$b){
                   $foodpicsql = $dsql->SetQuery("SELECT `pics` FROM `#@__waimai_list` WHERE `id`  = '".$b['id']."'");

                   $foodpicres = $dsql->dsqlOper($foodpicsql,"results");
                   $picpath    = getFilePath($foodpicres[0]['pics']);

                    $b['picpath']  = $picpath;
                }
            }
        }

        //支付方式
        if($key == "paytype"){
            $_paytype = '';
            $_paytypearr = array();
            $paynamearr = array(
                'wxpay'          => '微信支付',
                'alipay'         => '支付宝',
                'unionpay'       => '银联支付',
                'rfbp_icbc'      => '工行E商通',
                'baidumini'      => '百度收银台',
                'qqmini'         => 'QQ小程序',
                'money'          => '余额支付',
                'delivery'       => '货到付款',
                'integral'       => '积分支付',
                'underpay'       => '线下支付',
                'fomopay_paynow' => 'fomoPayNow',
                'fomopay_wxpay'  => 'WXPAY',
            );
            $paytypearr = $value!='' ? explode(',',$value) : array();

            if($paytypearr){
                foreach ($paytypearr as $k => $v){
                    if($v !=''){
                        array_push($_paytypearr,isset($paynamearr[$v])? $paynamearr[$v] : '' );
                    }
                }
                if($_paytypearr){
                    $_paytype = join(',',$_paytypearr);
                }
            }
            $value = $_paytype;
        }

        // 支付记录订单号
        if($key == 'paylognum' && empty($value)){
            $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__pay_log` WHERE `body` = '".$orderRet[0]['ordernum']."'");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
              $value = $res[0]['ordernum'];
            }
        }

        if($key == 'lng'){
            $lng = $value;
        }
        elseif($key == 'lat'){
            $lat = $value;
        }
        elseif($key == 'peisongpath'){
            $peisongpath = $value;
        }

        $huoniaoTag->assign($key, $value);
    }

    //配送员
    if($is_other ==0){
        $sql = $dsql->SetQuery("SELECT `name`, `phone`,`lng`,`lat` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $peisonglng = $ret[0]['lng'];
            $peisonglat = $ret[0]['lat'];

            $huoniaoTag->assign("peisong", $ret[0]['name']);
            $huoniaoTag->assign("peisonglng", $ret[0]['lng']);
            $huoniaoTag->assign("peisonglat", $ret[0]['lat']);
            $huoniaoTag->assign("peisongphone", $ret[0]['phone']);
        }
    }else{
        if ($custom_otherpeisong == 1) {
            $otherCourier = $othercourierparam != '' ? unserialize($othercourierparam) : array();
            if ($otherCourier) {

                $peisong      = $otherCourier['driver_name'];
                $peisongphone = $otherCourier['driver_mobile'];

            } else {

                $peisong      = '未知';
                $peisongphone = '';
            }
            $huoniaoTag->assign("peisong", $peisong);
            $huoniaoTag->assign("peisongphone", $peisongphone);
            $huoniaoTag->assign("peisonglng",'');
            $huoniaoTag->assign("peisonglat", '');

        } elseif($custom_otherpeisong == 2){

            $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
            include $pluginFile;

            $youshansudaClass = new youshansuda();


            $paramArray = array(
                'order_no'           => $order['otherordernum']
            );

            $results = $youshansudaClass->riderLnglat($paramArray);

            if ($results['code'] == '200' && $results['success'] == 'true') {

                $peisongpatharr = $peisongpath != '' ? explode(';',$peisongpath) : array();

                $lnglat         = $results['data']['ps_lng'].','. $results['data']['ps_lat'];
                if ($peisongpatharr && !in_array($lnglat,$peisongpatharr)) {

                    array_push($peisongpatharr,$lnglat);

                    $peisongpath =   join(';',$peisongpatharr);

                    $upsql = $dsql->SetQuery("UPDATE `".$break_table."` SET `peisongpath` = '$peisongpath' WHERE `id` = '$id'");
                    $dsql->dsqlOper($upsql,"results");
                }

                $peisongpath_lng = $results['data']['ps_lng'];
                $peisongpath_lat = $results['data']['ps_lat'];
            } else {
                $peisongpath_lat = '';
                $peisongpath_lat = '';
            }

        }elseif ($custom_otherpeisong == 3){
            $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
            include $pluginFile;

            $maiyatianClass = new maiyatian();

            $paramArray = array (
                'origin_id' => $ordernum
            );
            $results = $maiyatianClass->riderLnglat($paramArray);
            if ($results['code'] == 1){
                $peisongpatharr = $peisongpath != '' ? explode(';', $peisongpath) : array ();

                $lnglat = $results['data']['rider_longitude'] . ',' . $results['data']['rider_latitude'];
                if (!in_array($lnglat, $peisongpatharr)) {

                    array_push($peisongpatharr, $lnglat);

                    $peisongpath = join(';', $peisongpatharr);

                    $upsql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `peisongpath` = '$peisongpath' WHERE `id` = '$id'");
                    $dsql->dsqlOper($upsql, "results");
                }

                $peisongpath_lng = $results['data']['rider_longitude'];
                $peisongpath_lat = $results['data']['rider_latitude'];
            } else {
                $peisongpath_lng = '';
                $peisongpath_lat = '';
            }
        }
        $huoniaoTag->assign("peisonglng",$peisongpath_lng);
        $huoniaoTag->assign("peisonglat", $peisongpath_lat);
        $huoniaoTag->assign("peisongpath", $peisongpath);
    }
    $business = 0;
    $orderres = $orderRet[0];

    $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $youhuiquanTotal = $memberYouhuiTotal = $ktvipTotal = 0;
    $food                   = unserialize($orderres['food']);
    $priceinfo              = unserialize($orderres['priceinfo']);
    $fencheng_foodprice     = (int)$orderres['fencheng_foodprice'];     //商品原价分成
    $fencheng_delivery      = (int)$orderres['fencheng_delivery'];      //配送费分成
    $fencheng_dabao         = (int)$orderres['fencheng_dabao'];         //打包分成
    $fencheng_addservice    = (int)$orderres['fencheng_addservice'];    //增值服务费分成
    $fencheng_zsb           = (int)$orderres['fencheng_zsb'];                  //准时宝分成
    $fencheng_discount      = (int)$orderres['fencheng_discount'];      //折扣分摊
    $fencheng_promotion     = (int)$orderres['fencheng_promotion'];     //满减分摊
    $fencheng_firstdiscount = (int)$orderres['fencheng_firstdiscount'];  //首单减免分摊
    $fencheng_quan          = (int)$orderres['fencheng_quan'];  //优惠券分摊


    $fidsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list` WHERE `is_discount` = 1 AND `id` In (".$orderres['fids'].")");

    $foodis_discount = $dsql->dsqlOper($fidsql,"results");



    // 优惠券
    $usequan = (int)$orderres['usequan'];
    //准时宝费用
    $zsbprice = $orderres['zsbprice'];

    $quanBili = 100;
    if($usequan){
        $quanSql = $dsql->SetQuery("SELECT `bear` FROM `#@__waimai_quanlist` WHERE `id` = $usequan");
        $quanRet = $dsql->dsqlOper($quanSql, "results");
        if($quanRet){
            $bear = $quanRet[0]['bear'];
            // 平台和店铺分担
            if(!$bear){
                $quanBili = $fencheng_quan;
            }
        }
    }

    //计算单个订单的商品原价
    if($food){
        foreach ($food as $k_ => $v_) {
            if($v_['is_discount'] ==1){
                $v_['price'] = $v_['price']/($v_['discount_value']/10);
            }
            $foodTotal += $v_['price'] * $v_['count'];
        }
    }

    //费用详情
    if($priceinfo){
        foreach ($priceinfo as $k_ => $v_) {
            if($v_['type'] == "peisong"){
                $peisongTotal += $v_['amount'];
            }
            if($v_['type'] == "dabao"){
                $dabaoTotal += $v_['amount'];
            }
            if($v_['type'] == "fuwu"){
                $addserviceTotal += $v_['amount'];
            }
            if($v_['type'] == "youhui"){
                $discountTotal += $v_['amount'];
            }
            if($v_['type'] == "manjian"){
                $promotionTotal += $v_['amount'];
            }
            if($v_['type'] == "shoudan"){
                $firstdiscountTotal += $v_['amount'];
            }
            if($v_['type'] == "quan"){
                $youhuiquanTotal += -$v_['amount'];
            }
            if(strpos($v_['type'], "uth_") !== false){
                $memberYouhuiTotal += $v_['amount'];
            }
            if($v_['type'] == "ktvip"){
                    $ktvipTotal +=$v_['amount'];
                    $ktvipTotalPrice +=$v_['amount'];
            }
        }
    }

    // //外卖佣金

    // $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = ".$orderres['ordernum']." AND `module`= 'waimai'");
    // $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");

    // $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];

    // $zjye = $foodTotal - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $youhuiquanTotal+ $zsbprice -$memberYouhuiTotal + $ktvipTotal;
    // // var_dump( $foodTotal.'减'.$discountTotal.'减'.$promotionTotal.'减'.$firstdiscountTotal.'加'. $dabaoTotal .'加'. $peisongTotal .'加'. $addserviceTotal.'减'. $youhuiquanTotal.'加'. $zsbprice.'减'.$memberYouhuiTotal .'加'. $ktvipTotal.'______'.$zjye);die;
    // //计算准时宝(平)
    // if($orderres['cptype'] == 3){

    //     $ptzsb = $orderres['cpmoney'];
    //     $btzsb = 0;

    // }else{
    //     $btzsb = $orderres['cpmoney'];
    //     $ptzsb = 0;
    // }

    // if (empty($foodis_discount)) {

    //     $manjian = $promotionTotal * $fencheng_promotion / 100;

    // }else{

    //     $manjian = 0;
    // }

    // $ptyd = $foodTotal * $fencheng_foodprice / 100 - $manjian - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $youhuiquanTotal * $quanBili / 100 -$memberYouhuiTotal + $zsbprice * $fencheng_zsb / 100 + $ktvipTotal - $ptzsb;
    // $business = $zjye - $ptyd - $btzsb;

    $staticmoney = getwaimai_staticmoney('2',$id);
    $huoniaoTag->assign("staticmoney", $staticmoney);
    if($staticmoney&&is_array($staticmoney)){

        $huoniaoTag->assign("zjyearr", $staticmoney['zjyearr']);
        $huoniaoTag->assign("ptydarr", $staticmoney['ptydarr']);
        $huoniaoTag->assign("businesarr", $staticmoney['businesarr']);
    }


    // 平台优惠金额
  $ptYHQ = $youhuiquanTotal * $quanBili / 100;
//   $ptYouhui = $firstdiscountTotal + $ptYHQ + $memberYouhuiTotal;
  $ptYouhui = $ptYHQ;

  //优惠详情
  if($staticmoney['ptydarr']){
    foreach($staticmoney['ptydarr'] as $key => $val){
        if($val['type'] == '-' && $val['money'] > 0 && !strstr($val['name'], '分销') && !strstr($val['name'], '优惠券')){
            $ptYouhui += $val['money'];
        }
    }
  }
  
  $busYouhui = $discountTotal + $promotionTotal + $youhuiquanTotal - $ptYouhui;

  $huoniaoTag->assign('ktvipTotal', $ktvipTotal);
  $huoniaoTag->assign('ptYouhui', sprintf("%.2f", $ptYouhui));
  $huoniaoTag->assign('busYouhui', sprintf("%.2f", $busYouhui));
  $huoniaoTag->assign('ptyd', sprintf("%.2f", $staticmoney['ptyd']));
  $huoniaoTag->assign('business', sprintf("%.2f", $staticmoney['business']));
  
  $ptyd_show = $staticmoney['ptyd_show'];  //平台服务费
  $additional = $staticmoney['additional'];  //额外费用
  $additional_name = $staticmoney['additional_name'];  //额外费用的名称
  $huoniaoTag->assign('ptyd_show', sprintf("%.2f", $ptyd_show));
  $huoniaoTag->assign('additional', sprintf("%.2f", $additional));
  $huoniaoTag->assign('additional_name', $additional_name);

  //外卖佣金
    $fenxiaomoneysql = $dsql->SetQuery("SELECT f.`amount`,f.`uid` ,m.`username`  FROM `#@__member_fenxiao` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE f.`ordernum` = '".$ordernum."' AND f.`module`= 'waimai'");
    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");

    $allfenxiao     = array_sum(array_column($fenxiaomonyeres, 'amount'));
    $huoniaoTag->assign("allfenxiao", $allfenxiao);
    $huoniaoTag->assign("fenxiaomonyeres", $fenxiaomonyeres);

    /*验证是否收藏*/
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'waimai' AND `action` = 'shop' AND `aid` = '".$ret[0]['sid']."' AND `userid` = '".$ret[0]['uid']."'");
    $return = $dsql->dsqlOper($archives, "totalCount");
    $huoniaoTag->assign("collect", $return);

    /*验证是否是首单*/
    $firstsql            = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `uid` = '".$ret[0]['uid']."' AND `sid` = '".$ret[0]['sid']."' AND `state` != 0");
    $firstres            = $dsql->dsqlOper($firstsql, "totalCount");
    $huoniaoTag->assign("first", $firstres);

    /*会员等级*/
    $userinfo = $userLogin->getMemberInfo($orderRet[0]['uid']);

    if(empty($userinfo) && is_array($userinfo)){
        $sql = $dsql->SetQuery("SELECT `name` FROM `#@__member_level` WHERE `id` = ".$userinfo['level']);
        $ret = $dsql->dsqlOper($sql, "results");
        $huoniaoTag->assign("level", $ret[0]['name']);
    }



}else{
    die;
}

if($action == 'getLocation'){
    die(json_encode(array('state' => 100, 'info' => array('peisongpath' => $peisongpath, 'lng' => $lng, 'lat' => $lat, 'peisonglng' => $peisonglng, 'peisonglat' => $peisonglat, 'coordY' => $coordY, 'coordX' => $coordX))));
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    $jsFile = array(
        'shop/waimaiOrderDetail.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
