<?php
/**
 * 管理后台首页
 *
 * @version        $Id: index.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/";
$tpl = isMobile() ? $tpl."touch/statistics" : $tpl."statistics";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tj-waimai.html";

//域名检测 s
$httpHost  = $_SERVER['HTTP_HOST'];    //当前访问域名
$reqUri    = $_SERVER['REQUEST_URI'];  //当前访问目录

//判断是否为主域名，如果不是则跳转到主域名的后台目录
if($cfg_basehost != $httpHost && $cfg_basehost != str_replace("www.", "", $httpHost)){
    header("location:http://".$cfg_basehost.$reqUri);
    die;
}

$usersql = $dsql->SetQuery("SELECT `username`,`money`,`photo` FROM `#@__member` WHERE `id` = ".$userid);

$userres = $dsql->dsqlOper($usersql,"results");
$userinfo = $userLogin->getMemberInfo();
$huoniaoTag->assign('userinfo', $userinfo);
$huoniaoTag->assign('username', $userres[0]['username']);
$huoniaoTag->assign('money', $userres[0]['money']);
$huoniaoTag->assign('photo', getFilePath($userres[0]['photo']));

// 查询当日外卖业绩

/*查询当月外卖业绩*/
$datetime = explode('/',$datatime);
$nian     = $datetime[0];
if($nian){

    if(count($datetime) ==2){
        $yue      = $datetime[1];
        $beginDate = date("Y-m-d",mktime(0,0,0,$yue,1,$nian));
        $endDate = date("Y-m-d",mktime(23,59,59,($yue+1),0,$nian));

    }else{
        $beginDate = date("Y-m-d",mktime(0,0,0,1,1,$nian));
        $endDate = date("Y-m-d",mktime(23,59,59,13,0,$nian));

    }
}
$nowDate = $endDate ? $endDate : date("Y-m-d");
// $lastMonthDate = $beginDate ? $beginDate : date("Y-m-d", strtotime("-31 day"));
$lastMonthDate = $beginDate ? $beginDate : date("Y-m-01");

$todayarr = $allarr = array();
$begintime = strtotime($lastMonthDate);
$endtime   = strtotime($nowDate);
$totalSuccessall = $totalFailedall = $totaldeliveryall = $totalselfall = $totalAmountall = $businessall  = $onlineall = 0;
for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {
    $time1 = $start;
    $time2 = $start + 86400;
// 成功订单
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `state` = 1 AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2");
    $totalSuccess = $dsql->dsqlOper($sql, "totalCount");
    $totalSuccessall += $totalSuccess;
// 失败订单
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `state` = 7 AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2");
    $totalFailed = $dsql->dsqlOper($sql, "totalCount");
    $totalFailedall += $totalFailed;
    /*到付订单*/
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2");
    $totaldelivery = $dsql->dsqlOper($sql, "totalCount");
    $totaldeliveryall += $totaldelivery;
    /*自取订单*/
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `selftime` != '0' AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2");
    $totalself = $dsql->dsqlOper($sql, "totalCount");
    $totalselfall += $totalself;

    //在线支付
    $sql = $dsql->SetQuery("SELECT `id` total FROM `#@__waimai_order_all` WHERE `paytype` != 'underpay' AND `paytype` !='delivery'  AND sid in ($managerIds) AND `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2");
    $onlinecount = $dsql->dsqlOper($sql, "totalCount");
    $onlineall += $onlinecount;

// 总金额
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__waimai_order_all` WHERE `state` = 1 AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $totalAmount = empty($ret[0]['amount']) ? 0 : $ret[0]['amount'];
    }else{
        $totalAmount = 0;
    }

    // 总退款金额
    $totalRefundAmount = 0;
    $sql = $dsql->SetQuery("SELECT `amount`, `refrundamount` FROM `#@__waimai_order_all` WHERE `state` = 1 AND sid in ($managerIds) AND `okdate` >= $time1 AND `okdate` < $time2 AND `refrundstate` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            if($val['refrundamount'] == 0){
                $totalRefundAmount += $val['amount'];
            }else{
                $totalRefundAmount += $val['refrundamount'];
            }
        }
    }

    $totalAmount -= $totalRefundAmount;

    $totalAmountall += $totalAmount;

// 分成款项
    $business = 0;
    $sql = $dsql->SetQuery("SELECT o.`usequan`, o.`food`, o.`priceinfo`,o.`ordertype`,o.`ordernum`,o.`ptprofit`,o.`amount`,o.`cptype`,o.`cpmoney`,o.`refrundstate`, o.`refrundamount`,o.`fencheng_foodprice`, o.`fencheng_delivery`, o.`fencheng_dabao`, o.`fencheng_addservice`, o.`fencheng_discount`, o.`fencheng_promotion`, o.`fencheng_firstdiscount`, o.`fencheng_quan` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2 AND o.`sid` in ($managerIds)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $foodTotalPrice = $turnover = $platform = $business = $delivery = $money = $online = $peisongTotalPrice = $dabaoTotalPrice = $addserviceTotalPrice = $discountTotalPrice = $promotionTotalPrice = $firstdiscountTotalPrice = $quanTotalPrice = $fenxiaoTotalPricept = $fenxiaoTotalPricebu = $refund = 0;

        foreach ($ret as $k => $v) {

            $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $quanTotal = 0;

            $food               = unserialize($v['food']);
            $priceinfo          = unserialize($v['priceinfo']);
            $fencheng_foodprice = (int)$v['fencheng_foodprice'];   //商品原价分成
            $fencheng_delivery  = (int)$v['fencheng_delivery'];     //配送费分成
            $fencheng_dabao     = (int)$v['fencheng_dabao'];           //打包分成
            $fencheng_addservice = (int)$v['fencheng_addservice']; //增值服务费分成
            $fencheng_discount   = (int)$v['fencheng_discount'];     //折扣分摊
            $fencheng_promotion  = (int)$v['fencheng_promotion'];   //满减分摊
            $fencheng_firstdiscount = (int)$v['fencheng_firstdiscount'];  //首单减免分摊
            $fencheng_quan          = (int)$v['fencheng_quan'];  //优惠券分摊
            $ordertype              =  (int)$v['ordertype'];

            $ptprofit               =  (float)$v['ptprofit'];
            $orderamount            =  (float)$v['amount'];
            // 优惠券
            $usequan = (int)$v['usequan'];
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

            if($v['refrundstate'] == 1){
                $refund = $v['refrundamount'] != "0.00" ? $v['refrundamount'] : $v['amount'];
            }

            //计算单个订单的商品原价
            foreach ($food as $k_ => $v_) {

                /*已经弃用*/
                // if($v_['is_discount'] ==1 && empty((float)$ptprofit)){

                //     $v_['price'] = $v_['price']/($v_['discount_value']/10);
                // }elseif (!empty((float)$ptprofit)){

                //     $v_['price'] = $v_['yuanpprice'];
                // }

                if($v_['is_discount'] ==1){

                    $v_['price'] = $v_['price']/($v_['discount_value']/10);
                }
                $foodTotal += $v_['price'] * $v_['count'];
                $foodTotalPrice += $v_['price'] * $v_['count'];
            }

            //费用详情
            foreach ($priceinfo as $k_ => $v_) {
                if($v_['type'] == "peisong"){
                    $peisongTotal += $v_['amount'];
                    $peisongTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "dabao"){
                    $dabaoTotal += $v_['amount'];
                    $dabaoTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "fuwu"){
                    $addserviceTotal += $v_['amount'];
                    $addserviceTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "youhui"){
                    $discountTotal += $v_['amount'];
                    $discountTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "manjian"){
                    $promotionTotal += $v_['amount'];
                    $promotionTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "shoudan"){
                    $firstdiscountTotal += $v_['amount'];
                    $firstdiscountTotalPrice += $v_['amount'];
                }
                if($v_['type'] == "quan"){
                    $quanTotal += -$v_['amount'];
                    $quanTotalPrice += -$v_['amount'];
                }
            }

            if($v['cptype'] == 3){
                $ptzsb = $v['cpmoney'];
                $btzsb = 0;

            }else{
                $btzsb = $v['cpmoney'];
                $ptzsb = 0;
            }
            //外卖佣金

            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '".$v['ordernum']."' AND `module`= 'waimai'");
            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
            $allfenxiao     = $fenxiaomonyeres[0]['allfenxiao'] ? $fenxiaomonyeres[0]['allfenxiao'] : 0 ;

            include HUONIAOINC."/config/fenxiaoConfig.inc.php";
            $fenxiaoSource = (int)$cfg_fenxiaoSource;
            if($cfg_fenxiaoSource == 0){
                $fenxiaoTotalPricept  = $allfenxiao;
            }else{
                $fenxiaoTotalPricebu  = $allfenxiao;
            }
            //计算总交易额
            $zjye = ($foodTotal -$refund) - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $quanTotal;
            $turnover += $zjye;

            /*已经弃用*/
            // if(!empty((float)$ptprofit)){
            //     $zjye = $orderamount;
            // }

            //计算平台应得金额
            $ptyd = ($foodTotal -$refund) * $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $promotionTotal * $fencheng_promotion / 100 - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $quanTotal * $quanBili / 100 - $ptzsb - $fenxiaoTotalPricept;
//            var_dump($foodTotal * $fencheng_foodprice / 100 , $discountTotal * $fencheng_discount / 100 , $promotionTotal * $fencheng_promotion / 100 , $firstdiscountTotal * $fencheng_firstdiscount / 100 , $dabaoTotal * $fencheng_dabao / 100 , $peisongTotal * $fencheng_delivery / 100 , $addserviceTotal * $fencheng_addservice / 100 , $quanTotal * $quanBili / 100);
            if($ordertype == 1) { /*店内点餐*/
                $ptyd = 0;
            }
            $platform += $ptyd;

            if($ordertype == 1){ /*店内点餐*/
                $business += $zjye;
            }else{
                /*已经弃用*/
                // if(!empty((float)$ptprofit)){

                //     $business += $foodTotal - $btzsb - $fenxiaoTotalPricebu;

                //     $ptyd     = $zjye - $business - $ptzsb - $fenxiaoTotalPricept;

                //     $platform += $ptyd;
                // }else{

                if($v['refrundstate'] == 1){
                    $business += 0;
                }else{

                    $business += $zjye - $ptyd - $allfenxiao - $btzsb;
                }
                // }
            }



        }
        $businessall += $business;
    }

    if($start == $endtime){

        $todayarr['totalSuccess']      = (int)$totalSuccess;
        $todayarr['totalFailed']       = (int)$totalFailed;
        $todayarr['totaldelivery']     = (int)$totaldelivery;
        $todayarr['online']            = (int)$onlinecount;
        $todayarr['totalself']         = (int)$totalself;
        $todayarr['totalAmount']       = (float)sprintf("%.2f", $totalAmount);
        $todayarr['business']          = (float)sprintf("%.2f", $business);
    }
    $allarr['totalSuccessall']      = (int)$totalSuccessall;
    $allarr['totalFailedall']       = (int)$totalFailedall;
    $allarr['totaldeliveryall']     = (int)$totaldeliveryall;
    $allarr['totalselfall']         = (int)$totalselfall;
    $allarr['totalAmountall']       = (float)sprintf("%.2f", $totalAmountall);
    $allarr['businessall']          = (float)sprintf("%.2f", $businessall);
    $allarr['onlineall']            = (int)$onlineall;

}


$huoniaoTag->assign('todayarr', $todayarr);
$huoniaoTag->assign('allarr', $allarr);
$huoniaoTag->assign('totalSuccess', (int)$totalSuccess);
$huoniaoTag->assign('totalFailed', (int)$totalFailed);
$huoniaoTag->assign('totaldelivery', (int)$totaldelivery);
$huoniaoTag->assign('totalself', (int)$totalself);
$huoniaoTag->assign('totalAmount', sprintf("%.2f", $totalAmount));
$huoniaoTag->assign('business', sprintf("%.2f", $business));


if($gettype =="ajax"){

    $info = array("list" => $allarr);

    echo '{"state": 100, "info": '.json_encode($info).'}';

    exit();
}


// echo $tpl."/".$templates;
//验证模板文件
if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $tpl."/".$templates."模板文件未找到！";
}
