<?php
/**
 * 外卖统计-营业额统计
 *
 * @version        $Id: waimaiStatistics.php 2017-6-18 上午12:27:19 $
 * @package        HuoNiao.Waimai
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

$templates = "waimaiStatisticsChartrevenue.html";
$action ="chartrevenue" ;


$where = " AND `id` in ($managerIds)";
//查询所有店铺
$shopArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE 1 = 1 $where ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shopArr = $ret;
}
$huoniaoTag->assign("shop_id", $shop_id);
$huoniaoTag->assign("shopArr", $shopArr);

//查询指定店铺信息
$shopname = "";
if(!empty($shop_id)){
    $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $shop_id".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shopname = $ret[0]['shopname'];
    }
}
$huoniaoTag->assign("shopname", $shopname);


//查询所有配送员
$courierArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $courierArr = $ret;
}
$huoniaoTag->assign("courier_id", $courier_id);
$huoniaoTag->assign("courierArr", $courierArr);

//查询指定配送员信息
$couriername = "";
if(!empty($courier_id)){
    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = $courier_id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $couriername = $ret[0]['name'];
    }
}
$huoniaoTag->assign("couriername", $couriername);


//最近一月时间
$nowDate = $endDate ? $endDate : ($action == "chartordertime" || $action == "chartcourier" || $action == "chartrevenue"  ? date("Y-m-d") : date("Y-m-d"));
$lastMonthDate = $beginDate ? $beginDate : ($action == "chartordertime" || $action == "chartcourier" || $action == "chartrevenue"  ? date("Y-m-d", strtotime("-31 day")) . " 00:00:00" : date("Y-m-d", strtotime("-31 day")));

//var_dump($nowDate,$lastMonthDate);die;
$huoniaoTag->assign("nowDate", $nowDate);
$huoniaoTag->assign("lastMonthDate", $lastMonthDate);

$begintime = strtotime($lastMonthDate);
$endtime = strtotime($nowDate);
$timeArr = array();
for($start = $begintime; $start <= $endtime; $start += 24 * 3600) {
    array_push($timeArr, date("m-d", $start));
}
$huoniaoTag->assign("timeArr", json_encode($timeArr));


$dataArr = $priceArr = $staticsArr = array();

//外卖营业额统计
if($action == "chartrevenue"){

    $successall = $zjyeall = $businessall = $onlineall = $deliveryall = $totalselfall = $failedall = 0;
    for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {
        $time1 = $start;
        $time2 = $start + 86400;
        $where = " AND `sid` in ($managerIds)";
        if($shop_id){
            $where = " AND `sid` = $shop_id";
        }
        //成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $success = $dsql->dsqlOper($sql, "results");
        $successall += $success[0]['total'];
        //失败订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 7 AND `paydate` >= $time1 AND `paydate` < $time2" . $where);
        $failed = $dsql->dsqlOper($sql, "results");
        $failedall += $failed[0]['total'];
        //货到付款
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $delivery = $dsql->dsqlOper($sql, "results");
        $deliveryall += $delivery[0]['total'];
        //自取订单
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `selftime` != '0' AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $totalself = $dsql->dsqlOper($sql, "totalCount");
        $totalselfall += $totalself;

        //余额支付
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) total,count(`id`) moneycount FROM `#@__waimai_order_all` WHERE `paytype` = 'money' AND `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $money = $dsql->dsqlOper($sql, "results");

        //在线支付
        $sql = $dsql->SetQuery("SELECT count(`id`) total,SUM(`amount`) pricetotal FROM `#@__waimai_order_all` WHERE (`paytype` != 'underpay' AND `paytype` !='delivery' AND `paytype` !='money')  AND `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $online = $dsql->dsqlOper($sql, "results");
        $onlineall += $online[0]['total']  + $money[0]['moneycount'];

        //线下支付
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'underpay'  AND `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $underpay = $dsql->dsqlOper($sql, "results");

        $zjye = $delivery[0]['total'] + $money[0]['total'] + $online[0]['pricetotal'] + $underpay[0]['total'];
        $zjyeall += $zjye;
        //总营业额
        $total = array(array("total" => $zjye));

        //其他费用统计
        $sql = $dsql->SetQuery("SELECT o.`amount`,o.`priceinfo`, o.`food`, o.`usequan`,o.`refrundstate`,o.`refrundamount`,o.`zsbprice`,o.`ordertype`,o.`ordernum`,o.`ptprofit`,o.`cptype`,o.`cpmoney`,o.`fids`,o.`zsbprice`,o.`fencheng_foodprice`, o.`fencheng_delivery`, o.`fencheng_dabao`, o.`fencheng_addservice`, o.`fencheng_discount`, o.`fencheng_promotion`, o.`fencheng_firstdiscount`,o.`fencheng_zsb`, s.`fencheng_quan` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE `state` = 1 AND `okdate` >= $time1 AND `okdate` < $time2" . $where);
        $ret = $dsql->dsqlOper($sql, "results");

        $business = $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $zjye = $youhuiquanTotal = $youhuiquan  = $memberYouhuiTotalPrice = $refund = $zsbprice =0;;

        $quanList = array();
        if($ret){
            $turnover = $platform = $business = $delivery = $money = $online = $peisongTotalPrice = $dabaoTotalPrice = $addserviceTotalPrice = $discountTotalPrice = $promotionTotalPrice = $firstdiscountTotalPrice = $quanTotalPrice = 0;

            foreach ($ret as $k => $v) {

                $fenxiaoTotalPricept = $fenxiaoTotalPricebu = $refund = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $quanTotal = $memberYouhuiTotal =  $ktvipTotal = $foodTotalPrice= 0;

                $food                   = unserialize($v['food']);
                $priceinfo              = unserialize($v['priceinfo']);
                $fencheng_foodprice     = (int)$v['fencheng_foodprice'];   //商品原价分成
                $fencheng_delivery      = (int)$v['fencheng_delivery'];     //配送费分成
                $fencheng_dabao         = (int)$v['fencheng_dabao'];           //打包分成
                $fencheng_addservice    = (int)$v['fencheng_addservice']; //增值服务费分成
                $fencheng_discount      = (int)$v['fencheng_discount'];     //折扣分摊
                $fencheng_promotion     = (int)$v['fencheng_promotion'];   //满减分摊
                $fencheng_firstdiscount = (int)$v['fencheng_firstdiscount'];  //首单减免分摊
                $fencheng_quan          = (int)$v['fencheng_quan'];  //优惠券分摊
                $ordertype              = (int)$v['ordertype'];
                $fencheng_zsb           = (int)$v['fencheng_zsb'];           //准时宝分成

                $ptprofit               = (float)$v['ptprofit'];
                $orderamount            = (float)$v['amount'];

                //准时宝费用
                $zsbprice               =  $v['zsbprice'];

                $fidsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list` WHERE `is_discount` = 1 AND `id` In (".$v['fids'].")");
                $foodis_discount = $dsql->dsqlOper($fidsql,"results");

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

                //计算单个订单的商品原价
                foreach ($food as $k_ => $v_) {

                    // if($v_['is_discount'] ==1 && empty((float)$ptprofit)){

                    //     $v_['price'] = $v_['price']/($v_['discount_value']/10);
                    // }elseif (!empty((float)$ptprofit) && isset($v_['yuanpprice'])){

                    //     $v_['price'] = $v_['yuanpprice'];
                    // }已经弃用

                    if($v_['is_discount'] ==1){

                        $v_['price'] = $v_['price']/($v_['discount_value']/10);
                    }
                    $foodTotal      += $v_['price'] * $v_['count'];
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

                    if(strpos($v_['type'], "uth_") !== false){
                        $memberYouhuiTotal += $v_['amount'];
                    }
                    if($v_['type'] == "ktvip"){
                        $ktvipTotal +=$v_['amount'];
                        $ktvipTotalPrice +=$v_['amount'];
                    }
                }

                if($v['refrundstate'] == 1){
                    $refund += (!empty((float)$v['refrundamount']) ? $v['refrundamount'] : $v['amount']);
                }

                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '".$v['ordernum']."' AND `module`= 'waimai'");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                $allfenxiao     = $fenxiaomonyeres[0]['allfenxiao'] ? $fenxiaomonyeres[0]['allfenxiao'] : 0 ;

                //计算准时宝(平)
                if($v['cptype'] == 3){
                    $ptzsb = $v['cpmoney'];
                    $btzsb = 0;

                }else{
                    $btzsb = $v['cpmoney'];
                    $ptzsb = 0;
                }

                include HUONIAOINC."/config/fenxiaoConfig.inc.php";
                $fenxiaoSource = (int)$cfg_fenxiaoSource;
                if($cfg_fenxiaoSource == 0){
                    $fenxiaoTotalPricept  = $allfenxiao;
                }else{
                    $fenxiaoTotalPricebu  = $allfenxiao;
                }
                //计算总交易额
                $zjye = ($foodTotalPrice-$refund) - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $quanTotal + $zsbprice - $memberYouhuiTotal;

                if (empty($foodis_discount)) {
                    $manjian = $promotionTotal * $fencheng_promotion / 100;

                }else{
                    $manjian = 0;
                }

                /*if(!empty((float)$ptprofit)){

                    $zjye = $orderamount;
                }*/
                $turnover += $zjye;

                //计算平台应得金额
                $ptyd = ($foodTotalPrice-$refund) * $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $manjian - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $quanTotal * $quanBili / 100 - $memberYouhuiTotal - $fenxiaoTotalPricept + $zsbprice * $fencheng_zsb / 100 - $ptzsb + $ktvipTotal;

                //商家应得
                if($ordertype == 1){ /*店内点餐*/

                    $business += $zjye;
                    $ptyd     = 0;

                }else{
/*
                    if(!empty((float)$ptprofit)){

                        $business += $foodTotal - $btzsb - $fenxiaoTotalPricebu;

                        $ptyd     = $zjye - $business - $ptzsb - $fenxiaoTotalPricept;

                        $platform += $ptyd;

                    }else{*/

                        if($v['refrundstate'] == 11){
                            $business += 0;
                        }else{
//

                            $business += $zjye - ($ptyd+$fenxiaoTotalPricept -$ktvipTotal) - $btzsb - $fenxiaoTotalPricebu;
                        }

                    // }
                }

            }
            $businessall += $business;
        }

        array_push($dataArr, array(
            "date"     => date("Y-m-d", $start),
            "datem"    => date("m-d", $start),
            "total"    => sprintf("%.2f", $total[0]['total']),
            "delivery" => sprintf("%.2f", $delivery[0]['total']),
            "success"  => $success[0]['total'],
            "failed"   => $failed[0]['total'],
            "money"    => sprintf("%.2f", $money[0]['total']),
            "online"   => sprintf("%.2f", $online[0]['total']),
            "food"     => sprintf("%.2f", $foodTotal),
            "dabao"    => sprintf("%.2f", $dabaoTotal),
            "peisong"  => sprintf("%.2f", $peisongTotal),
            "fuwu"     => sprintf("%.2f", $addserviceTotal),
            "shoudan"  => sprintf("%.2f", $firstdiscountTotal),
            "quan"     => sprintf("%.2f", $youhuiquanTotal),
            "memberyh" => sprintf("%.2f", $memberYouhuiTotal),
            "business" => sprintf("%.2f", $business)
        ));

        array_push($priceArr, sprintf("%.2f", $total[0]['total']));


    }
    array_push($staticsArr,array(
        "successall"    => $successall,
        "zjyeall"       => $zjyeall,
        "businessall"   => sprintf("%.2f", $businessall),
        "onlineall"     => $onlineall,
        "deliveryall"   => $deliveryall,
        "totalselfall"  => $totalselfall,
        "failedall"     =>$failedall
    ));

    //导出
    if($do == "export"){

        $shopname = (empty($shopname) ? "全部店铺" : $shopname) . "营业额统计";
        $shopname = iconv("UTF-8", "GB2312//IGNORE", $shopname);

        include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
        include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
        //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
        // 创建一个excel
        $objPHPExcel = new PHPExcel();

        // Set document properties
        $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

        $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '时间')
            ->setCellValue('B1', '总营业额')
            ->setCellValue('C1', '货到付款')
            ->setCellValue('D1', '余额支付')
            ->setCellValue('E1', '在线支付')
            ->setCellValue('F1', '餐盒费')
            ->setCellValue('G1', '配送费')
            ->setCellValue('H1', '增值服务费统计')
            ->setCellValue('I1', '首单立减总金额');


        // 表名
        $tabname = "外卖营业额统计";
        $objPHPExcel->getActiveSheet()->setTitle($tabname);

        // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
        $objPHPExcel->setActiveSheetIndex(0);
        // 所有单元格默认高度
        $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
        // 冻结窗口
        $objPHPExcel->getActiveSheet()->freezePane('A2');

        // 从第二行开始
        $row = 2;

        $total = $delivery = $money = $online = $dabao = $peisong = $fuwu = $shoudan = 0;
        foreach($dataArr as $data){
            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['date']);
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['total']);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['delivery']);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['money']);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['online']);
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['dabao']);
            $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $data['peisong']);
            $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $data['fuwu']);
            $objPHPExcel->getActiveSheet()->setCellValue("I".$row, $data['shoudan']);
            $row++;

            $total += $data['total'];
            $delivery += $data['delivery'];
            $money += $data['money'];
            $online += $data['online'];
            $dabao += $data['dabao'];
            $peisong += $data['peisong'];
            $fuwu += $data['fuwu'];
            $shoudan += $data['shoudan'];
        }

        $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
        $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
        $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $delivery);
        $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $money);
        $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $online);
        $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $dabao);
        $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $peisong);
        $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $fuwu);
        $objPHPExcel->getActiveSheet()->setCellValue("I".$row, $shoudan);

        $objActSheet = $objPHPExcel->getActiveSheet();

        // 列宽
        $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

        $filename = $shopname."__".$lastMonthDate."__".$nowDate.".csv";
        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
        $objWriter->save('php://output');
        die;

    }

}


$huoniaoTag->assign("dataArr", $dataArr);
$huoniaoTag->assign("staticsArr", $staticsArr);

$priceArr = array_reverse($priceArr);
$huoniaoTag->assign("priceArr", str_replace('"', '', json_encode($priceArr)));


$huoniaoTag->assign('action', $action);

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $jsFile = array(
        'highcharts.js',
        'shop/waimaiStatistics.js',
        'shop/waimaiStatistics'.$action.'.js'
    );
    $huoniaoTag->assign('jsFile', $jsFile);

    $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
