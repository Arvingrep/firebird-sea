<?php
/**
 * 订单详细
 *
 * @version        $Id: orderDetail.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

// $dbname = "waimai_order";
$templates = "waimaiOrderDetail.html";

checkPurview("waimaiOrder");


if(empty($id)){
    die;
}

$peisongpath = $lng = $lat = $peisonglng = $peisonglat = $coordY = $coordX = '';

global  $cfg_pointRatio;
$sub = new SubTable('waimai_order', '#@__waimai_order');
$break_table = $sub->getSubTableById($id);
$sql = $dsql->SetQuery("SELECT * FROM `".$break_table."` WHERE `id` = $id");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $id                = $ret[0]['id'];
    $ordernum          = $ret[0]['ordernum'];
    $payprice          = $ret[0]['payprice'];
    $is_other          = $ret[0]['is_other'];
    $point             = $ret[0]['point'] / $cfg_pointRatio;    //积分抵扣金钱
    $balance           = $ret[0]['balance'];
    $peisongid         = $ret[0]['peisongid'];
    $mytcancel_fee         = $ret[0]['mytcancel_fee'];
    $peerpay           = $ret[0]['peerpay'];
    $peisongpath       = $ret[0]['peisongpath'];
    $ret[0]['point']   = $ret[0]['point'] / $cfg_pointRatio;    //积分抵扣金钱
    $ret[0]['amount']  = $ret[0]['amount'];
    $othercourierparam = $ret[0]['othercourierparam'];
    $courier_gebili    = $ret[0]['courier_gebili'];
    $courier_gebili    = $courier_gebili ? unserialize($courier_gebili) : array();
    $huoniaoTag->assign("priceamount", $ret[0]['amount']);

    $orderDetailInfo = $ret[0];

    foreach ($ret[0] as $key => $value) {

        //店铺
        if($key == "sid"){
            $sql = $dsql->SetQuery("SELECT `shopname`, `phone`, `merchant_deliver`, `coordX`, `coordY`,`delivery_time` FROM `#@__waimai_shop` WHERE `id` = $value");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $huoniaoTag->assign("shopname", $ret[0]['shopname']);
                $huoniaoTag->assign("shoptel", $ret[0]['phone']);
                $huoniaoTag->assign("merchant_deliver", $ret[0]['merchant_deliver']);
                $huoniaoTag->assign("coordX", $ret[0]['coordX']);
                $huoniaoTag->assign("coordY", $ret[0]['coordY']);

                $coordY = $ret[0]['coordY'];
                $coordX = $ret[0]['coordX'];

                //如果有预定时间，就计算可以接单时间
                $receivingdate = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
                if ($orderDetailInfo['reservesongdate'] > 0) {
                    $receivingdate = $orderDetailInfo['reservesongdate'] - (int)$ret[0]['delivery_time']*60 - 60;
                    $huoniaoTag->assign("receivingdate", $receivingdate);
                }
            }
        }

        //用户
        if($key == "uid"){
            $userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value);
            $username = $dsql->dsqlOper($userSql, "results");
            if(count($username) > 0){
                $huoniaoTag->assign("username", $username[0]['nickname'] ?: $username[0]['username']);
            }
        }

        //退款操作人
        if($key == "refrundadmin"){
            $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value);
            $username = $dsql->dsqlOper($userSql, "results");
            $value = $username[0]['username'];
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

        //商品、预设字段、费用详细
        if($key == "food" || $key == "preset" || $key == "priceinfo"){
            $value = unserialize($value);
        }

        //支付方式
        if($key == "paytype"){
            $_paytype = '';
            $_paytypearr = array();
            $paytypearr = $value!='' ? explode(',',$value) : array();
            if($paytypearr){
                foreach ($paytypearr as $k => $v){
                    if($v !=''){
                        array_push($_paytypearr,getDetailPaymentName($v,$balance,$point,$payprice));
                    }

                }
                    $sql = $dsql->SetQuery("SELECT `balance`, `point` FROM  `".$break_table."`  WHERE `id` =".$id);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret[0]['balance'] > 0){
                        array_push ($_paytypearr,getDetailPaymentName('money',$balance,0,0));
                    }
                    if ($ret[0]['point'] > 0){
                        array_push($_paytypearr,getDetailPaymentName('integral',0,$point,0));
                    }
                if($_paytypearr){
                    $_paytype = join(',',array_unique($_paytypearr));

                }
            }

            if($peerpay > 0){
                $userinfo = $userLogin->getMemberInfo($peerpay);
                if(is_array($userinfo)){
                    $_paytype = '[<a href="javascript:;" class="userinfo" data-id="'.$peerpay.'">'.$userinfo['nickname'].'</a>]'.$_paytype.'代付';
                }else{
                    $_paytype = '[<a href="javascript:;" class="userinfo" data-id="'.$peerpay.'">'.$peerpay.'</a>]'.$_paytype.'代付';
                }
            }

            $value = $_paytype;
        }

        // 支付记录订单号
        if($key == 'paylognum' && empty($value)){
            $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__pay_log` WHERE `body` = '".$ret[0]['ordernum']."'");
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

    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;
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
                $return['peisongpath_lng'] = '';
                $return['peisongpath_lat'] = '';
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

                    $upsql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `peisongpath` = '$peisongpath' WHERE `id` = '$id'");
                    $dsql->dsqlOper($upsql, "results");
                }

                $peisongpath_lng = $results['data']['rider_latitude'];
                $peisongpath_lat = $results['data']['rider_longitude'];
            } else {
                $peisongpath_lng = '';
                $peisongpath_lat = '';
            }
        }

        $huoniaoTag->assign("peisonglng",$peisongpath_lng);
        $huoniaoTag->assign("peisonglat", $peisongpath_lat);
        $huoniaoTag->assign("peisongpath", $peisongpath);
    }
    $otherCourier = $othercourierparam != '' ? unserialize($othercourierparam) : array();

    if ($otherCourier) {

        $peisongname = $otherCourier['driver_name'];
        $peisongtel  = $otherCourier['driver_mobile'];
        $peisonglogisticc = $otherCourier['driver_logistic'];
        $peisonglogistic = '';
        $peisongbiaoshi=array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务');
        foreach ($peisongbiaoshi as $kk=>$vv){
            if ($kk == $peisonglogisticc){
                $peisonglogistic = $vv;
            }
        }
    } else {

        $peisongname = '未知';
        $peisongtel  = '';
        $peisonglogistic = '';
    }
    $huoniaoTag->assign("peisongname",$peisongname);
    $huoniaoTag->assign("peisongtel", $peisongtel);
    $huoniaoTag->assign("peisonglogistic", $peisonglogistic);
    $staticmoney = getwaimai_staticmoney('2',$id);
    $huoniaoTag->assign("staticmoney", $staticmoney);

    if($staticmoney&&is_array($staticmoney)){

        $huoniaoTag->assign("zjyearr", $staticmoney['zjyearr']);
        $huoniaoTag->assign("ptydarr", $staticmoney['ptydarr']);
        $huoniaoTag->assign("businesarr", $staticmoney['businesarr']);
        $huoniaoTag->assign("courierMoney", $staticmoney['courierMoney']);
    }

    //如果有配送信息
    if($courier_gebili){

        $shopjluser = $courier_gebili['shopjluser'];  //商城距离用户，单位：km
        $additionprice = $courier_gebili['additionprice'];  //骑手加成所得

        $huoniaoTag->assign("shopjluser", $shopjluser);
        $huoniaoTag->assign("additionprice", $additionprice);

    }

    //查询是平台还是商家承担

    $pingsql = $dsql->SetQuery("SELECT `bear`  FROM `#@__member_money`  WHERE `showtype` = '1' AND  `info` like '%$ordernum%'");
    $pingres= $dsql->dsqlOper($pingsql,"results");
    $huoniaoTag->assign("bearfenyong", $pingres[0]['bear']);
    //外卖佣金
    $fenxiaomoneysql = $dsql->SetQuery("SELECT f.`amount`,f.`uid` ,m.`username`  FROM `#@__member_fenxiao` f LEFT JOIN `#@__member` m ON m.`id` = f.`uid` WHERE f.`ordernum` = '".$ordernum."' AND f.`module`= 'waimai'");
    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");

    $allfenxiao     = array_sum(array_column($fenxiaomonyeres, 'amount'));
    $huoniaoTag->assign("allfenxiao", $allfenxiao);
    $huoniaoTag->assign("fenxiaomonyeres", $fenxiaomonyeres);


}else{
    die;
}

if($action == 'getLocation'){
    die(json_encode(array('state' => 100, 'info' => array('peisongpath' => $peisongpath, 'lng' => $lng, 'lat' => $lat, 'peisonglng' => $peisonglng, 'peisonglat' => $peisonglat, 'coordY' => $coordY, 'coordX' => $coordX))));
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
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
		'admin/waimai/waimaiOrderDetail.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
