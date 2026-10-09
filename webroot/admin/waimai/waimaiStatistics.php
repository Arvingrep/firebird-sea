<?php
/**
 * 外卖统计
 *
 * @version        $Id: waimaiStatistics.php 2017-6-18 上午12:27:19 $
 * @package        HuoNiao.Waimai
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiStatistics");

$templates = "waimaiStatistics.html";
$action = empty($action) ? "chartrevenue" : $action;


//查询所有店铺
$shopArr = array();
$where2 = getCityFilter('`cityid`');
if ($cityid){
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
}
$sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE 1=1".$where2." ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shopArr = $ret;
}
$huoniaoTag->assign("shop_id", $shop_id);
$huoniaoTag->assign("shopArr", $shopArr);

$huoniaoTag->assign('cityid', (int)$cityid);

//查询指定城市信息
$cityname = "";
if(!empty($cityid)){
    $cityname = getSiteCityName($cityid);
}
$huoniaoTag->assign("cityname", $cityname);

//查询指定店铺信息
$shopname = "";
if(!empty($shop_id)){
    $sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE `id` = $shop_id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shopname = $ret[0]['shopname'];
    }
}
$huoniaoTag->assign("shopname", $shopname);


//查询所有配送员
$courierArr = array();
$where2 = getCityFilter('`cityid`');
if ($cityid){
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
}
$sql = $dsql->SetQuery("SELECT `id`, `name`, '0' type FROM `#@__waimai_courier` WHERE 1=1".$where2." ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $courierArr = $ret;
}
$huoniaoTag->assign("courier_id", $courier_id);
$huoniaoTag->assign("courierArr", $courierArr);

//查询是否安装第三方配送插件
$otherpeisongArr = array();
$sql = $dsql->SetQuery("SELECT `pid`, `title` FROM `#@__site_plugins` WHERE `pid` in (13,19)");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach($ret as $key => $val){
        array_push($otherpeisongArr, array(
            'id' => $val['pid'] == 13 ? 1 : 3,
            'title' => $val['title'],
            'type' => 1
        ));
    }
}
$huoniaoTag->assign('otherpeisongArr', $otherpeisongArr);

//查询指定配送员信息
$couriername = "";
if(!empty($courier_id)){

    if(strstr($courier_id, 'o_')){
        $_courier_id = (int)str_replace('o_', '', $courier_id);
        $couriername = $_courier_id == 1 ? 'UU跑腿' : '麦芽田';

    }else{
        $sql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = $courier_id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $couriername = $ret[0]['name'];
        }
    }    
}
$huoniaoTag->assign("couriername", $couriername);


//最近一月时间
// $nowDate = $endDate ? $endDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d") . " 23:59:59" : date("Y-m-d"));
// $lastMonthDate = $beginDate ? $beginDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d", strtotime("-31 day")) . " 00:00:00" : date("Y-m-d", strtotime("-31 day")));


$timeArr = array();
$dataArr = $priceArr = array();

if($endDate){
    $nowDate = $endDate;
}else{
    if($action == "chartordertime" || $action == "chartcourier" || $action == "financenew"){
        $nowDate = date("Y-m-d") . " 23:59:59";
    }else{
        $nowDate = date("Y-m-d");
    }
}

if($beginDate){
    $lastMonthDate = $beginDate;
}else{
    if($action == "chartordertime" || $action == "chartcourier" || $action == "financenew"){
        $lastMonthDate = date("Y-m-d", strtotime("-31 day")) . " 00:00:00";
    }else{
        $lastMonthDate = date("Y-m-d", strtotime("-31 day"));
    }
}





$huoniaoTag->assign("nowDate", $nowDate);
$huoniaoTag->assign("lastMonthDate", $lastMonthDate);

$begintime = strtotime($lastMonthDate);
$endtime = strtotime($nowDate);
for($start = $begintime; $start <= $endtime; $start += 24 * 3600) {
    array_push($timeArr, date("m-d", $start));
}
$huoniaoTag->assign("timeArr", json_encode($timeArr));

$failedArr = array();
if($dopost == "getresults"){
    //外卖营业额统计
    if($action == "chartrevenue"){

		checkPurview("waimaiStatisticsChartrevenue");

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = "";

            $where2 = getCityFilter('`cityid`');
            if ($cityid){
                $where2 .= getWrongCityFilter('`cityid`', $cityid);
            }
            $shopid = array();
            $shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1".$where2);
            $shopResult = $dsql->dsqlOper($shopSql, "results");
            if($shopResult){
                foreach($shopResult as $key => $loupan){
                    array_push($shopid, $loupan['id']);
                }
                $where = " AND `sid` in (".join(",", $shopid).")";
            }else{
                $where = " AND 1 = 2";
            }

            if($shop_id){
                $where = " AND `sid` = $shop_id";
            }

            //总交易额
            $sql = $dsql->SetQuery("SELECT `food`, `priceinfo`, `refrundstate`, `refrundamount`,`amount`,`zsbprice` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
//            var_dump($sql);die;
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $zjye = $youhuiquanTotal = $menberYouhui = $refund = $zsbprice =0;
                foreach ($ret as $key => $value) {
                    $food = unserialize($value['food']);
                    $priceinfo = empty($value['priceinfo']) ? array() : unserialize($value['priceinfo']);

                    //计算单个订单的商品原价
                    foreach ($food as $k_ => $v_) {

                        if($v_['is_discount'] ==1){

                            $v_['price'] = $v_['price']/($v_['discount_value']/10);

                        }
                        $foodTotal += sprintf("%.2f", $v_['price'] * $v_['count']);
                    }

                    //费用详情
                    if($priceinfo){
                        foreach ($priceinfo as $k_ => $v_) {
                            if($v_['type'] == "peisong"){
                                $peisongTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "dabao"){
                                $dabaoTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "fuwu"){
                                $addserviceTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "youhui"){
                                $discountTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "manjian"){
                                $promotionTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "shoudan"){
                                $firstdiscountTotal += sprintf("%.2f", $v_['amount']);
                            }
                            if($v_['type'] == "quan"){
                                $youhuiquanTotal += -sprintf("%.2f", $v_['amount']);
                            }
                            if(strpos($v_['type'], 'auth_') !== false){
                                $menberYouhui += $v_['amount'];
                            }
                        }
                    }
                    if($value['refrundstate'] == 1){
                        $refund += ($value['refrundamount'] != 0 ? $value['refrundamount'] : $value['amount']);
                    }

                    $zsbprice+=$value['zsbprice'];
                }

                //计算总交易额
//                var_dump($foodTotal ,$discountTotal , $promotionTotal , $firstdiscountTotal , $dabaoTotal , $peisongTotal , $addserviceTotal , $youhuiquanTotal , $menberYouhui ,$refund,$zsbprice);die;
                $zjye = ($foodTotal-$refund) - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $youhuiquanTotal - $menberYouhui + $zsbprice;
            }else{
                $zjye = 0;
            }
            $total = array(array("total" => $zjye));

            //货到付款
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $delivery = $dsql->dsqlOper($sql, "results");

            //余额支付
            $sql = $dsql->SetQuery("SELECT SUM(`balance`) total FROM `#@__waimai_order_all` WHERE  `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $money = $dsql->dsqlOper($sql, "results");

            //在线支付
            $sql = $dsql->SetQuery("SELECT SUM(`payprice`) total FROM `#@__waimai_order_all` WHERE  `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $online = $dsql->dsqlOper($sql, "results");


            // 总交易额
            // $total = array(array("total" => $delivery[0]['total'] + $money[0]['total'] + $online[0]['total']));

            //其他费用统计
            $dabao = $peisong = $fuwu = $shoudan = $youhuiquan = 0;
            $sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $key => $value) {
                    $menberYouhui = 0;
                    $priceinfo = empty($value['priceinfo']) ? array() : unserialize($value['priceinfo']);
                    if($priceinfo){
                        foreach ($priceinfo as $k => $v) {
                            if($v['type'] == "dabao"){
                                $dabao += $v['amount'];
                            }
                            if($v['type'] == "peisong"){
                                $peisong += $v['amount'];
                            }
                            if($v['type'] == "fuwu"){
                                $fuwu += $v['amount'];
                            }
                            if($v['type'] == "shoudan"){
                                $shoudan += $v['amount'];
                            }
                            if($v['type'] == "quan"){
                                $youhuiquan += -$v['amount'];
                            }

                            if(strpos($v['type'], 'auth_') !== false){
                                $menberYouhui +=  $v['amount'];
                            }
                        }
                    }
                }
            }

            array_push($dataArr, array(
                "date"     => date("Y-m-d", $start),
                "total"    => sprintf("%.2f", $total[0]['total']),
                "delivery" => sprintf("%.2f", $delivery[0]['total']),
                "money"    => sprintf("%.2f", $money[0]['total']),
                "online"   => sprintf("%.2f", $online[0]['total']),
                "dabao"    => sprintf("%.2f", $dabao),
                "peisong"    => sprintf("%.2f", $peisong),
                "fuwu"    => sprintf("%.2f", $fuwu),
                "shoudan"    => sprintf("%.2f", $shoudan),
                "youhuiquan"    => sprintf("%.2f", $youhuiquan),
                "menberYouhui"    => sprintf("%.2f", $menberYouhui),
                "refund"    => sprintf("%.2f", $refund),
            ));

            array_push($priceArr, sprintf("%.2f", $total[0]['total']));

        }

        //导出
        if($do == "export"){

            $tablename = (empty($cityname) ? "全部店铺" : $cityname) . "营业额统计";
            $tablename = (empty($shopname) ? "全部店铺" : $shopname) . "营业额统计";
            $tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

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
            ->setCellValue('I1', '首单立减总金额')
            ->setCellValue('J1', '使用优惠券总额')
            ->setCellValue('K1', '成功订单退款总额');


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

            $total = $delivery = $money = $online = $dabao = $peisong = $fuwu = $shoudan = $youhuiquan = $refund =  0;
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
              $objPHPExcel->getActiveSheet()->setCellValue("J".$row, $data['youhuiquan']);
              $objPHPExcel->getActiveSheet()->setCellValue("K".$row, $data['refund']);
              $row++;

              $total += $data['total'];
              $delivery += $data['delivery'];
              $money += $data['money'];
              $online += $data['online'];
              $dabao += $data['dabao'];
              $peisong += $data['peisong'];
              $fuwu += $data['fuwu'];
              $shoudan += $data['shoudan'];
              $youhuiquan += $data['youhuiquan'];
              $refund += $data['refund'];
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
            $objPHPExcel->getActiveSheet()->setCellValue("J".$row, $youhuiquan);
            $objPHPExcel->getActiveSheet()->setCellValue("K".$row, $refund);

            $objActSheet = $objPHPExcel->getActiveSheet();

            // 列宽
            $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

            $filename = $tablename."__".$lastMonthDate."__".$nowDate.".csv";
            ob_end_clean();//清除缓冲区,避免乱码
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="'.$filename.'"');
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
            $objWriter->save('php://output');
            die;

        }

    }


    //订单按天统计
    elseif($action == "chartorder"){

		checkPurview("waimaiStatisticsChartorder");

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = "";

            $where2 = getCityFilter('`cityid`');
            if ($cityid){
                $where2 .= getWrongCityFilter('`cityid`', $cityid);
            }
            $shopid = array();
            $shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1".$where2);
            $shopResult = $dsql->dsqlOper($shopSql, "results");
            if($shopResult){
                foreach($shopResult as $key => $loupan){
                    array_push($shopid, $loupan['id']);
                }
                $where = " AND `sid` in (".join(",", $shopid).")";
            }else{
                $where = " AND 1 = 2";
            }

            if($shop_id){
                $where = " AND `sid` = $shop_id";
            }

            //成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $success = $dsql->dsqlOper($sql, "results");

            //货到付款成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $delivery = $dsql->dsqlOper($sql, "results");

            //余额支付
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'money' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $money = $dsql->dsqlOper($sql, "results");

            //在线支付
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE (`paytype` = 'wxpay' OR `paytype` = 'alipay' OR `paytype` = 'unionpay') AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $online = $dsql->dsqlOper($sql, "results");

            array_push($dataArr, array(
                "date"     => date("Y-m-d", $start),
                "success"    => $success[0]['total'],
                "delivery" => $delivery[0]['total'],
                "money"    => $money[0]['total'],
                "online"   => $online[0]['total']
            ));

            array_push($priceArr, sprintf("%.2f", $success[0]['total']));

        }


        //导出
        if($do == "export"){

            $tablename = (empty($cityname) ? "全部店铺" : $cityname) . "订单统计";
            $tablename = (empty($shopname) ? "全部店铺" : $shopname) . "订单统计";
            $tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
            //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
            // 创建一个excel
            $objPHPExcel = new PHPExcel();

            // Set document properties
            $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '时间')
            ->setCellValue('B1', '成功订单数')
            ->setCellValue('C1', '货到付款成功订单数')
            ->setCellValue('D1', '余额付款成功订单数')
            ->setCellValue('E1', '在线支付成功订单数');


            // 表名
            $tabname = "订单统计";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $success = $delivery = $money = $online = 0;
            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['date']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['success']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['delivery']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['money']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['online']);
              $row++;

              $success += $data['total'];
              $delivery += $data['delivery'];
              $money += $data['money'];
              $online += $data['online'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $success);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $delivery);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $money);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $online);

            $objActSheet = $objPHPExcel->getActiveSheet();

            // 列宽
            $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

            $filename = $tablename."__".$lastMonthDate."__".$nowDate.".csv";
            ob_end_clean();//清除缓冲区,避免乱码
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="'.$filename.'"');
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
            $objWriter->save('php://output');
            die;

        }

    }


    //订单按时间段统计
    elseif($action == "chartordertime"){

		checkPurview("waimaiStatisticsChartordertime");

        $where = "";

        $where2 = getCityFilter('`cityid`');
        if ($cityid){
            $where2 .= getWrongCityFilter('`cityid`', $cityid);
        }
        $shopid = array();
        $shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1".$where2);
        $shopResult = $dsql->dsqlOper($shopSql, "results");
        if($shopResult){
            foreach($shopResult as $key => $loupan){
                array_push($shopid, $loupan['id']);
            }
            $where = " AND `sid` in (".join(",", $shopid).")";
        }else{
            $where = " AND 1 = 2";
        }

        if($shop_id){
            $where = " AND `sid` = $shop_id";
        }

        //成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime" . $where);
        $success = $dsql->dsqlOper($sql, "results");

        //货到付款成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime" . $where);
        $delivery = $dsql->dsqlOper($sql, "results");

        //余额支付
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `paytype` = 'money' AND `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime" . $where);
        $money = $dsql->dsqlOper($sql, "results");

        //在线支付
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE (`paytype` = 'wxpay' OR `paytype` = 'alipay' OR `paytype` = 'unionpay') AND `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime" . $where);
        $online = $dsql->dsqlOper($sql, "results");

        array_push($dataArr, array(
            "success"    => $success[0]['total'],
            "delivery" => $delivery[0]['total'],
            "money"    => $money[0]['total'],
            "online"   => $online[0]['total']
        ));

    }


    //配送员统计
    elseif($action == "chartcourier"){

		checkPurview("waimaiStatisticsChartcourier");

        $peisongid = $o_peisongid = array();
        if($courier_id){
            if(strstr($courier_id, 'o_')){
                $peisongid = (int)str_replace('o_', '', $courier_id);
                $where = " AND `is_other` = $peisongid AND `peisongid` = 0";
            }else{
                $peisongid = $courier_id;
                $where = " AND `is_other` = 0 AND `peisongid` = $peisongid";
            }
        }else{
            foreach ($courierArr as $key => $value) {
                array_push($peisongid, $value['id']);
            }
            foreach ($otherpeisongArr as $key => $value) {
                array_push($o_peisongid, $value['id']);
            }
            if($o_peisongid){
                $peisongid = join(",", $peisongid);
                $o_peisongid = join(",", $o_peisongid);
                $where = " AND ((`is_other` = 0 AND `peisongid` in ($peisongid)) OR (`is_other` in ($o_peisongid) AND `peisongid` = 0))";
            }else{
                $peisongid = join(",", $peisongid);
                $where = " AND `peisongid` in ($peisongid)";
            }
        }



        $etime = strtotime(date("Y-m-d", $endtime));
        $btime = strtotime(date("Y-m-d", $begintime));
        for($start = $etime; $start >= $btime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            //成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $success = $dsql->dsqlOper($sql, "results");

            //失败订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $failed = $dsql->dsqlOper($sql, "results");

            array_push($priceArr, $success[0]['total']);
            array_push($failedArr, $failed[0]['total']);

        }

        $courierAll = array_merge($courierArr, $otherpeisongArr);

        foreach ($courierAll as $key => $value) {

            //平台配送员
            if((($courier_id && $value['id'] == $courier_id) || !$courier_id) && $value['type'] == 0){

                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $totalSuccess = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $totalFailed = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $success = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `paytype` = 'delivery' AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $delivery = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `paytype` = 'money' AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $money = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $online = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`cpmoney`) allcpmoney FROM `#@__waimai_order_all` WHERE `state` = 1 AND `cptype` = 2 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $cptypere = $dsql->dsqlOper($sql, "results");

                $peisong = $fuwu = 0;
                $sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `is_other` = 0 AND `peisongid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $k => $v) {
                        $priceinfo = empty($v['priceinfo']) ? array() : unserialize($v['priceinfo']);
                        if($priceinfo){
                            foreach ($priceinfo as $k_ => $v_) {
                                if($v_['type'] == "peisong"){
                                    $peisong += $v_['amount'];
                                }
                                if($v_['type'] == "fuwu"){
                                    $fuwu += $v_['amount'];
                                }
                            }
                        }
                    }
                }

                array_push($dataArr, array(
                    "name"          => $value['name'],
                    "totalSuccess"  => (int)$totalSuccess[0]['total'],
                    "totalFailed"   => (int)$totalFailed[0]['total'],
                    "success"       => sprintf("%.2f", $success[0]['total']),
                    "delivery"      => sprintf("%.2f", $delivery[0]['total']),
                    "money"         => sprintf("%.2f", $money[0]['total']),
                    "online"        => sprintf("%.2f", $online[0]['total']),
                    "peisong"       => sprintf("%.2f", $peisong),
                    "fuwu"          => sprintf("%.2f", $fuwu),
                    "cptypere"      => $cptypere[0]['allcpmoney'] ? $cptypere[0]['allcpmoney'] : 0
                ));


            }

            //第三方配送平台
            if(strstr($courier_id, 'o_')){
                $peisongid = (int)str_replace('o_', '', $courier_id);
            }
            if((($courier_id && $value['id'] == $peisongid) || !$courier_id) && $value['type'] == 1){

                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $totalSuccess = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $totalFailed = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $success = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `paytype` = 'delivery' AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $delivery = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `paytype` = 'money' AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $money = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $online = $dsql->dsqlOper($sql, "results");

                $sql = $dsql->SetQuery("SELECT SUM(`cpmoney`) allcpmoney FROM `#@__waimai_order_all` WHERE `state` = 1 AND `cptype` = 2 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $cptypere = $dsql->dsqlOper($sql, "results");

                $peisong = $fuwu = 0;
                $sql = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = 0 AND `is_other` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $k => $v) {
                        $priceinfo = empty($v['priceinfo']) ? array() : unserialize($v['priceinfo']);
                        if($priceinfo){
                            foreach ($priceinfo as $k_ => $v_) {
                                if($v_['type'] == "peisong"){
                                    $peisong += $v_['amount'];
                                }
                                if($v_['type'] == "fuwu"){
                                    $fuwu += $v_['amount'];
                                }
                            }
                        }
                    }
                }

                array_push($dataArr, array(
                    "name"          => $value['title'],
                    "totalSuccess"  => (int)$totalSuccess[0]['total'],
                    "totalFailed"   => (int)$totalFailed[0]['total'],
                    "success"       => sprintf("%.2f", $success[0]['total']),
                    "delivery"      => sprintf("%.2f", $delivery[0]['total']),
                    "money"         => sprintf("%.2f", $money[0]['total']),
                    "online"        => sprintf("%.2f", $online[0]['total']),
                    "peisong"       => sprintf("%.2f", $peisong),
                    "fuwu"          => sprintf("%.2f", $fuwu),
                    "cptypere"      => $cptypere[0]['allcpmoney'] ? $cptypere[0]['allcpmoney'] : 0
                ));


            }
        }



        //导出
        if($do == "export"){

            $tablename = (empty($cityname) ? "全部" : $cityname) . "配送员统计";
            $tablename = (empty($couriername) ? "全部" : $couriername) . "配送员统计";
            $tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
            //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
            // 创建一个excel
            $objPHPExcel = new PHPExcel();

            // Set document properties
            $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '配送员')
            ->setCellValue('B1', '配送成功')
            ->setCellValue('C1', '配送失败')
            ->setCellValue('D1', '配送费')
            ->setCellValue('E1', '增值服务费')
            ->setCellValue('F1', '配送成功总金额')
            ->setCellValue('G1', '货到付款总金额')
            ->setCellValue('H1', '余额付款总金额')
            ->setCellValue('I1', '在线支付总金额')
            ->setCellValue('J1', '准时宝赔付金额');


            // 表名
            $tabname = "配送员统计";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $totalSuccess = $totalFailed = $peisong = $fuwu = $success = $delivery = $money = $online = $cptypere = 0;
            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['name']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['totalSuccess']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['totalFailed']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['peisong']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['fuwu']);
              $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['success']);
              $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $data['delivery']);
              $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $data['money']);
              $objPHPExcel->getActiveSheet()->setCellValue("I".$row, $data['online']);
              $objPHPExcel->getActiveSheet()->setCellValue("J".$row, $data['cptypere']);
              $row++;

              $totalSuccess += $data['totalSuccess'];
              $totalFailed += $data['totalFailed'];
              $peisong += $data['peisong'];
              $fuwu += $data['fuwu'];
              $success += $data['success'];
              $delivery += $data['delivery'];
              $money += $data['money'];
              $online += $data['online'];
              $cptypere += $data['cptypere'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $totalSuccess);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $totalFailed);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $peisong);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $fuwu);
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $success);
            $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $delivery);
            $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $money);
            $objPHPExcel->getActiveSheet()->setCellValue("I".$row, $cptypere);

            $objActSheet = $objPHPExcel->getActiveSheet();

            // 列宽
            $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

            $filename = $tablename."__".$lastMonthDate."__".$nowDate.".csv";
            ob_end_clean();//清除缓冲区,避免乱码
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="'.$filename.'"');
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
            $objWriter->save('php://output');

            die;

        }

    }


    //财务结算
    elseif($action == "financenew"){

		checkPurview("waimaiStatisticsFinancenew");

//        $endtime = $endtime + 86399;
        foreach ($shopArr as $key => $value) {

            $sql = $dsql->SetQuery("SELECT o.`id`, o.`food`,o.`ordertype` ,o.`priceinfo`,o.`amount`,o.`ordernum`, o.`usequan`,o.`refrundstate`, o.`refrundamount`,  o.`fencheng_foodprice`, o.`fencheng_delivery`, o.`fids`,o.`fencheng_dabao`, o.`fencheng_addservice`, o.`fencheng_zsb`, o.`fencheng_discount`, o.`fencheng_promotion`, o.`fencheng_firstdiscount`, o.`fencheng_quan`,o.`zsbprice`,o.`ptprofit`,o.`cptype`,o.`cpmoney` FROM `#@__waimai_order_all` o WHERE o.`state` = 1 AND o.`pubdate` >= $begintime AND o.`pubdate` <= $endtime AND o.`sid` = " . $value['id']);
//            var_dump($sql);die;
            // $sql = $dsql->SetQuery("SELECT o.`id`, o.`food`, o.`priceinfo`, o.`usequan`, s.`fencheng_foodprice`, s.`fencheng_delivery`, s.`fencheng_dabao`, s.`fencheng_addservice`, s.`fencheng_discount`, s.`fencheng_promotion`, s.`fencheng_firstdiscount`, s.`fencheng_quan` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 1 AND o.`pubdate` >= $begintime AND o.`pubdate` <= $endtime AND o.`sid` = " . $value['id']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $foodTotalPrice = $turnover = $platform = $business = $delivery = $money = $online = $ordernum = $peisongTotalPrice = $dabaoTotalPrice = $addserviceTotalPrice = $discountTotalPrice = $promotionTotalPrice = $firstdiscountTotalPrice = $youhuiquanTotalPrice  = $memberYouhuiTotalPrice=  $ktvipTotalPrice = $refundTotalPrice = $fenxiaoTotalPrice = $zsb_ptall = $zsb_sjall =0;
                foreach ($ret as $k => $v) {

                    $fenxiaoTotalPricept = $fenxiaoTotalPricebu = $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $youhuiquanTotal = $memberYouhuiTotal = $ktvipTotal =  $refund = $allrefund =  $zsb_pt = $zsb_sj = 0;

                    $food                   = unserialize($v['food']);
                    $priceinfo              = unserialize($v['priceinfo']);
                    $fencheng_foodprice     = (int)$v['fencheng_foodprice'];    //商品原价分成
                    $fencheng_delivery      = (int)$v['fencheng_delivery'];     //配送费分成
                    $fencheng_dabao         = (int)$v['fencheng_dabao'];        //打包分成
                    $fencheng_addservice    = (int)$v['fencheng_addservice'];   //增值服务费分成
                    $fencheng_zsb           = (int)$v['fencheng_zsb'];          //准时宝分成
                    $fencheng_discount      = (int)$v['fencheng_discount'];     //折扣分摊
                    $fencheng_promotion     = (int)$v['fencheng_promotion'];    //满减分摊
                    $fencheng_firstdiscount = (int)$v['fencheng_firstdiscount'];  //首单减免分摊
                    $fencheng_quan          = (int)$v['fencheng_quan'];  //优惠券分摊

                    $ordertype = (int)$v['ordertype'];

                    $ptprofit = (float)$v['ptprofit'];

                    $orderamount = (float)$v['amount'];



                    $fidsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list` WHERE `is_discount` = 1 AND `id` In (".$v['fids'].")");

                    $foodis_discount = $dsql->dsqlOper($fidsql,"results");


                    // 优惠券
                    $usequan = (int)$v['usequan'];
                    //准时宝费用
                    $zsbprice = $v['zsbprice'];

                    //pt准时宝收入费用
                    $allzsb_pt = $zsbprice*$fencheng_zsb/100;

                    $zsb_ptall += $allzsb_pt;
                    //准时包总收入
                    $allzsb_sj = $zsbprice - $allzsb_pt;

                    $zsb_sjall += $allzsb_sj;



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
                            /*该功能已经弃用*/
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
                    }
                    if($v['refrundstate'] == 1){
                        if($v['refrundamount'] != 0.00 ){
                             $refund    = $v['refrundamount'];
                        }else{
                             $allrefund = $v['amount'];
                             $refundTotalPrice += $allrefund;
                             continue;
                        }
                        // $refund = $v['refrundamount'] != 0.00 ? $v['refrundamount'] : $v['amount'] ;

                        $refundTotalPrice += $refund;
                    }
                    //费用详情
                    if($priceinfo){
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
                                $youhuiquanTotal += -$v_['amount'];
                                $youhuiquanTotalPrice += -$v_['amount'];
                            }
                            if(strpos($v_['type'], "uth_") !== false){
                                $memberYouhuiTotal += $v_['amount'];
                                $memberYouhuiTotalPrice += $v_['amount'];
                            }
                            if($v_['type'] == "ktvip"){
                                $ktvipTotal +=$v_['amount'];
                                $ktvipTotalPrice +=$v_['amount'];
                            }
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

                    $fenxiaoTotalPrice += $allfenxiao;
                    // echo"<pre>";
                    // var_dump($priceinfo);die;

                    //计算总交易额
                    // $zjye = $foodTotal - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal  + $addserviceTotal - $youhuiquanTotal+$zsbprice;
                    // var_dump($foodTotal ,$discountTotal ,$promotionTotal ,$firstdiscountTotal ,$dabaoTotal , $peisongTotal , $addserviceTotal , $youhuiquanTotal, $zsbprice ,$memberYouhuiTotal,$ktvipTotal,$refund);die;
//                    var_dump($ktvipTotal);

                    include HUONIAOINC."/config/fenxiaoConfig.inc.php";
                    $fenxiaoSource = (int)$cfg_fenxiaoSource;
                    if($cfg_fenxiaoSource == 0){
                        $fenxiaoTotalPricept  = $allfenxiao;
                    }else{
                        $fenxiaoTotalPricebu  = $allfenxiao;
                    }
                    $zjye = ($foodTotal -$refund) - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $youhuiquanTotal+ $zsbprice -$memberYouhuiTotal + $ktvipTotal;

                    /*该功能已弃用*/
                    /*if(!empty((float)$ptprofit)){
                        $zjye = $orderamount;
                    }*/
                    // $zjye = sprintf("%.2f", $foodTotal - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $youhuiquanTotal);
                    $turnover += $zjye;

                    //计算平台应得金额
                    // $ptyd = sprintf("%.2f", $foodTotal * $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $promotionTotal * $fencheng_promotion / 100 - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $youhuiquanTotal * $quanBili / 100);

                    // $platform += $ptyd;

                    if (empty($foodis_discount)) {

                        $manjian = $promotionTotal * $fencheng_promotion / 100;

                    }else{

                        $manjian = 0;
                    }

                    // $ptyd = $foodTotal * $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $manjian - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $youhuiquanTotal * $quanBili / 100;
//                     var_dump($foodTotal.'|'.$fencheng_foodprice."&商品原价&",$discountTotal.'|'.$fencheng_discount."&折扣分摊&".$manjian."&满减&".$firstdiscountTotal.'|'.$fencheng_firstdiscount."&收单&".$dabaoTotal.'db|'.$fencheng_dabao,$peisongTotal.'ps|'.$fencheng_delivery,$addserviceTotal.'qq|'.$fencheng_addservice,$youhuiquanTotal.'quan|'.$quanBili,$memberYouhuiTotal,$zsbprice.'zsb|'.$fencheng_zsb,$ktvipTotal."开通会员"); echo "<br>";
                    $ptyd = ($foodTotal -$refund)* $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $manjian - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $youhuiquanTotal * $quanBili / 100 -$memberYouhuiTotal + $zsbprice * $fencheng_zsb / 100 + $ktvipTotal - $fenxiaoTotalPricept - $ptzsb;
                    if($ordertype == 1) { /*店内点餐*/
                        $ptyd = 0;
                    }

                    //商家应得
                    // var_dump($foodTotal * $fencheng_foodprice / 100 , $manjian , $firstdiscountTotal * $fencheng_firstdiscount / 100 , $dabaoTotal * $fencheng_dabao / 100 , $peisongTotal * $fencheng_delivery / 100 , $addserviceTotal * $fencheng_addservice / 100 , $youhuiquanTotal * $quanBili / 100 ,$memberYouhuiTotal);

                    if($ordertype == 1){ /*店内点餐*/

                        $business += $zjye;
                    }else{

                        /*该功能已弃用*/

                        // if (!empty((float)$ptprofit)) {

                        //     $business += $foodTotal - $btzsb - $fenxiaoTotalPricebu;

                        //     $ptyd     = $zjye - $business - $ptzsb - $fenxiaoTotalPricept;


                        //     $platform += $ptyd;

                        // } else {

                            $platform += $ptyd;

                            $business += $zjye - ($ptyd +$fenxiaoTotalPricept-$ktvipTotal) - $btzsb - $fenxiaoTotalPricebu;
                        // }
                    }
//                    var_dump($zjye,$ptyd,$allfenxiao,$business);die;

                }
                //计算准时宝(总)
                $sql = $dsql->SetQuery("SELECT SUM(`cpmoney`) allzsb FROM`#@__waimai_order_all` WHERE `state` = 1  AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");

                $allzsb = $ret['0']['allzsb'];
                //计算准时宝(平)
                $sql = $dsql->SetQuery("SELECT SUM(`cpmoney`) ptzsb FROM`#@__waimai_order_all` WHERE `state` = 1  AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `cptype` = 3  AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");

                $ptzsb = $ret['0']['ptzsb'];
                //商家(包括骑手)
                $btzsb = $allzsb - $ptzsb;
                //计算货到付款交易额
                $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND `paytype` = 'delivery' AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                $delivery += $ret[0]['total'];

                //计算余额付款交易额
                $sql = $dsql->SetQuery("SELECT SUM(`balance`) total FROM `#@__waimai_order_all` WHERE `state` = 1  AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                $money += $ret[0]['total'];

                //计算在线付款交易额
                // $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__waimai_order_all` WHERE `state` = 1 AND (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $sql = $dsql->SetQuery("SELECT SUM(`payprice`) total FROM `#@__waimai_order_all` WHERE `state` = 1  AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                $online += $ret[0]['total'];
                //计算在线付款交易额
                $sql = $dsql->SetQuery("SELECT count(`id`) ordernum FROM `#@__waimai_order_all` WHERE `state` = 1  AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `sid` = " . $value['id']);
                $ret = $dsql->dsqlOper($sql, "results");
                $ordernum += $ret[0]['ordernum'];
                array_push($dataArr, array(
                    "shopname" => $value['shopname'],
                    "turnover" => $turnover,
                    "platform" => $platform -$ptzsb,
                    "business" => $business -$btzsb,
                    "delivery" => $delivery,
                    "money"    => $money,
                    "online"   => $online,
                    "ordernum" => $ordernum,
                    "allzsb"   => $allzsb,
                    "zsb_ptall"=> $zsb_ptall,
                    "zsb_sjall" => $zsb_sjall,
                    "foodTotalPrice"            => $foodTotalPrice,
                    "peisongTotalPrice"         => $peisongTotalPrice,
                    "dabaoTotalPrice"           => $dabaoTotalPrice,
                    "addserviceTotalPrice"      => $addserviceTotalPrice,
                    "discountTotalPrice"        => $discountTotalPrice,
                    "promotionTotalPrice"       => $promotionTotalPrice,
                    "firstdiscountTotalPrice"   => $firstdiscountTotalPrice,
                    "youhuiquanTotalPrice"      => $youhuiquanTotalPrice,
                    "memberYouhuiTotalPrice"    => $memberYouhuiTotalPrice,
                    "refundTotalPrice"          => $refundTotalPrice,
                    "fenxiaoTotalPrice"         => $fenxiaoTotalPrice,
                ));

            }

        }



        //导出
        if($do == "export"){

            $title = iconv("UTF-8", "GB2312//IGNORE", "财务结算");

            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
            //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
            // 创建一个excel
            $objPHPExcel = new PHPExcel();

            // Set document properties
            $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '店铺名')
            ->setCellValue('B1', '商家应得金额')
            ->setCellValue('C1', '平台应得金额')
            ->setCellValue('D1', '总交易额')
            ->setCellValue('E1', '货到付款交易额')
            ->setCellValue('F1', '余额付款交易额')
            ->setCellValue('G1', '在线支付交易额')
            ->setCellValue('H1', '商品原价总额')
            ->setCellValue('I1', '配送费总额')
            ->setCellValue('J1', '打包费总额')
            ->setCellValue('K1', '增值服务费总额')
            ->setCellValue('L1', '折扣优惠总额')
            ->setCellValue('M1', '满减优惠')
            ->setCellValue('N1', '优惠券使用总额')
            ->setCellValue('O1', '首次下单减免总额')
            ->setCellValue('p1', '准时宝赔付金额')
            ->setCellValue('Q1', '订单数量')
            ->setCellValue('R1', '会员优惠总额')
            ->setCellValue('S1', '成功订单退款总额')
            ->setCellValue('T1', '分佣总金额')
            ->setCellValue('U1', '平台准时包收入总金额')
            ->setCellValue('V1', '商家准时包收入总金额');

            // 表名
            $tabname = "财务结算";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $business = $platform = $turnover = $delivery = $money = $online = $foodTotalPrice = $ordernum = $peisongTotalPrice = $dabaoTotalPrice = $addserviceTotalPrice = $discountTotalPrice = $promotionTotalPrice = $firstdiscountTotalPrice = $youhuiquanTotalPrice = $allzsb = $refundTotalPrice = $fenxiaoTotalPrice = $allzsbPtTotalPrice =  $allzsbSjTotalPrice =  0;

            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['shopname']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, sprintf("%.2f", $data['business']));
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, sprintf("%.2f", $data['platform']));
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, sprintf("%.2f", $data['turnover']));
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, sprintf("%.2f", $data['delivery']));
              $objPHPExcel->getActiveSheet()->setCellValue("F".$row, sprintf("%.2f", $data['money']));
              $objPHPExcel->getActiveSheet()->setCellValue("G".$row, sprintf("%.2f", $data['online']));
              $objPHPExcel->getActiveSheet()->setCellValue("H".$row, sprintf("%.2f", $data['foodTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("I".$row, sprintf("%.2f", $data['peisongTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("J".$row, sprintf("%.2f", $data['dabaoTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("K".$row, sprintf("%.2f", $data['addserviceTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("L".$row, sprintf("%.2f", $data['discountTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("M".$row, sprintf("%.2f", $data['promotionTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("N".$row, sprintf("%.2f", $data['youhuiquanTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("O".$row, sprintf("%.2f", $data['firstdiscountTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("p".$row, sprintf("%.2f", $data['allzsb']));
              $objPHPExcel->getActiveSheet()->setCellValue("Q".$row, sprintf("%.2f", $data['ordernum']));
              $objPHPExcel->getActiveSheet()->setCellValue("R".$row, sprintf("%.2f", $data['memberYouhuiTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("S".$row, sprintf("%.2f", $data['refundTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("T".$row, sprintf("%.2f", $data['fenxiaoTotalPrice']));
              $objPHPExcel->getActiveSheet()->setCellValue("U".$row, sprintf("%.2f", $data['zsb_ptall']));
              $objPHPExcel->getActiveSheet()->setCellValue("V".$row, sprintf("%.2f", $data['zsb_sjall']));
              $row++;

              $business += $data['business'];
              $platform += $data['platform'];
              $turnover += $data['turnover'];
              $delivery += $data['delivery'];
              $money += $data['money'];
              $online += $data['online'];
              $foodTotalPrice += $data['foodTotalPrice'];
              $peisongTotalPrice += $data['peisongTotalPrice'];
              $dabaoTotalPrice += $data['dabaoTotalPrice'];
              $addserviceTotalPrice += $data['addserviceTotalPrice'];
              $discountTotalPrice += $data['discountTotalPrice'];
              $promotionTotalPrice += $data['promotionTotalPrice'];
              $firstdiscountTotalPrice += $data['firstdiscountTotalPrice'];
              $youhuiquanTotalPrice += $data['youhuiquanTotalPrice'];
              $memberYouhuiTotalPrice += $data['memberYouhuiTotalPrice'];
              $allzsb += $data['allzsb'];
              $ordernum += $data['ordernum'];
              $refundTotalPrice += $data['refundTotalPrice'];
              $fenxiaoTotalPrice += $data['fenxiaoTotalPrice'];

              $allzsbPtTotalPrice += $data['zsb_ptall'];
              $allzsbSjTotalPrice += $data['zsb_sjall'];

            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, sprintf("%.2f", $business));
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, sprintf("%.2f", $platform));
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, sprintf("%.2f", $turnover));
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, sprintf("%.2f", $delivery));
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, sprintf("%.2f", $money));
            $objPHPExcel->getActiveSheet()->setCellValue("G".$row, sprintf("%.2f", $online));
            $objPHPExcel->getActiveSheet()->setCellValue("H".$row, sprintf("%.2f", $foodTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("I".$row, sprintf("%.2f", $peisongTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("J".$row, sprintf("%.2f", $dabaoTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("K".$row, sprintf("%.2f", $addserviceTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("L".$row, sprintf("%.2f", $discountTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("M".$row, sprintf("%.2f", $promotionTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("N".$row, sprintf("%.2f", $youhuiquanTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("O".$row, sprintf("%.2f", $firstdiscountTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("p".$row, sprintf("%.2f", $allzsb));
            $objPHPExcel->getActiveSheet()->setCellValue("Q".$row, sprintf("%.2f", $ordernum));
            $objPHPExcel->getActiveSheet()->setCellValue("R".$row, sprintf("%.2f", $memberYouhuiTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("S".$row, sprintf("%.2f", $refundTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("T".$row, sprintf("%.2f", $fenxiaoTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("U".$row, sprintf("%.2f", $allzsbPtTotalPrice));
            $objPHPExcel->getActiveSheet()->setCellValue("V".$row, sprintf("%.2f", $allzsbSjTotalPrice));


            $objActSheet = $objPHPExcel->getActiveSheet();

            // 列宽
            $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

            $filename = $title."__".$lastMonthDate."__".$nowDate.".csv";
            ob_end_clean();//清除缓冲区,避免乱码
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="'.$filename.'"');
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
            $objWriter->save('php://output');

            die;

        }

    }

    //退款明细
    elseif($action == "refundschedule"){

        $where = "";

        $where2 = getCityFilter('`cityid`');
        if ($cityid){
            $where2 .= getWrongCityFilter('`cityid`', $cityid);
        }
        $shopid = array();
        $shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1".$where2);
        $shopResult = $dsql->dsqlOper($shopSql, "results");
        if($shopResult){
            foreach($shopResult as $key => $loupan){
                array_push($shopid, $loupan['id']);
            }
            $where = " AND `sid` in (".join(",", $shopid).")";
        }else{
            $where = " AND 1 = 2";
        }

        if($shop_id){
            $where = " AND `sid` = $shop_id";
        }

        if($begintime){
            $where .=" AND `refrunddate` >= $begintime";
        }
        if($endtime){
            $where .=" AND `refrunddate` <= $endtime";
        }
        //成功退款统计

        $refundschedulesql = $dsql->SetQuery("SELECT o.`ordernum`,o.`id`,s.`shopname`,o.`uid`,o.`amount`,o.`refrundstate`,o.`refrundamount`,o.`refrunddate`,o.`refrundno`,o.`paytype`FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s on o.`sid` = s.`id`  WHERE o.`refrundstate` = 1".$where);
        // var_dump($refundschedulesql);die;
        $results        = $dsql->dsqlOper($refundschedulesql,"results");

        foreach ($results as $k => $v) {
            $dataArr[$k]['ordernum']        = $v['ordernum'];
            $dataArr[$k]['oid']             = $v['id'];
            $dataArr[$k]['uid']             = $v['uid'];
            $dataArr[$k]['shopname']        = $v['shopname'];
            $dataArr[$k]['amount']          = $v['amount'];
            $dataArr[$k]['refrunddate']     = date("Y-m-d H:i:s",$v['refrunddate']);
            $dataArr[$k]['refrundno']       = $v['refrundno'];

            $paytypename    = "";
            $refrundamount  = "";

            switch ($v['paytype']) {
                case 'integral,money':
                    $paytypename = $cfg_pointName . '、余额';
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

                case 'integral':
                    $paytypename = $cfg_pointName;
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

                case 'money':
                    $paytypename = "余额";
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

                case 'alipay':
                    $paytypename = "支付宝";
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

                case 'wxpay':
                    $paytypename = "微信";
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

                case 'underpay':
                    $paytypename = "线下支付";
                    $refrundamount      = $v['refrundamount'] <= 0 ? $v['refrundstate'] ==1 ? $v['amount'] : $v['refrundamount'] : $v['refrundamount'];
                    break;

            }

            $dataArr[$k]['refrundamount']   = (float)$refrundamount;
            $dataArr[$k]['paytypename']     = $paytypename;

        }
        //导出
        if($do == "export"){

            $title = iconv("UTF-8", "GB2312//IGNORE", "退款明细");

            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
            //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
            // 创建一个excel
            $objPHPExcel = new PHPExcel();

            // Set document properties
            $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '退款时间')
            ->setCellValue('B1', '订单号')
            ->setCellValue('C1', '店铺')
            ->setCellValue('D1', '订单总金额')
            ->setCellValue('E1', '退款流水号')
            ->setCellValue('F1', '退款方式')
            ->setCellValue('G1', '会员ID')
            ->setCellValue('H1', '退款金额');

            // 表名
            $tabname = "退款明细";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $refrundamountall = 0;

            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['refrunddate']);
              $objPHPExcel->getActiveSheet()->setCellValueExplicit("B".$row, $data['ordernum'], PHPExcel_Cell_DataType::TYPE_STRING);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['shopname']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, sprintf("%.2f", $data['amount']));
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['refrundno']);
              $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['paytypename']);
              $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $data['uid']);
              $objPHPExcel->getActiveSheet()->setCellValue("H".$row, sprintf("%.2f", $data['refrundamount']));
              $row++;


              $refrundamountall += $data['refrundamount'];

            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("G".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("H".$row, $refrundamountall);


            $objActSheet = $objPHPExcel->getActiveSheet();

            // 列宽
            $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

            $filename = $title."__".$lastMonthDate."__".$nowDate.".csv";
            ob_end_clean();//清除缓冲区,避免乱码
            header('Content-Type: application/vnd.ms-excel');
            header('Content-Disposition: attachment;filename="'.$filename.'"');
            $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
            $objWriter->save('php://output');

            die;

        }



    }

}

$huoniaoTag->assign("dataArr", $dataArr);

$priceArr = array_reverse($priceArr);
$huoniaoTag->assign("priceArr", str_replace('"', '', json_encode($priceArr)));

$failedArr = array_reverse($failedArr);
$huoniaoTag->assign("failedArr", str_replace('"', '', json_encode($failedArr)));

$huoniaoTag->assign('cityList', json_encode($adminCityArr));


//验证模板文件
if(file_exists($tpl."/".$templates)){
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
        'ui/jquery-ui-i18n.min.js',
        'ui/jquery-ui-timepicker-addon.js',
        'ui/highcharts.js',
        'admin/waimai/waimaiStatistics.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('action', $action);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/waimai";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
