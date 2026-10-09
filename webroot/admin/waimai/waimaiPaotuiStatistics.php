<?php
/**
 * 跑腿统计
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

checkPurview("waimaiPaotuiStatistics");

$templates = "waimaiPaotuiStatistics.html";
$action = empty($action) ? "chartrevenue" : $action;

//查询所有店铺
$shopArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE 1 = 1 " . getCityFilter('`cityid`') . " ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shopArr = $ret;
}
$huoniaoTag->assign("shop_id", $shop_id);
$huoniaoTag->assign("shopArr", $shopArr);

$huoniaoTag->assign('cityid', (int)$cityid);

//查询所有配送员
$courierArr = array();
$where2 = getCityFilter('`cityid`');
if ($cityid){
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
}
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` WHERE 1=1".$where2." ORDER BY `id`");
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

//查询指定城市信息
$cityname = "";
if(!empty($cityid)){
    $cityname = getSiteCityName($cityid);
}
$huoniaoTag->assign("cityname", $cityname);

//最近一月时间
$nowDate = $endDate ? $endDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d") . " 23:59:59" : date("Y-m-d"));
$lastMonthDate = $beginDate ? $beginDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d", strtotime("-31 day")) . " 00:00:00" : date("Y-m-d", strtotime("-31 day")));

$huoniaoTag->assign("nowDate", $nowDate);
$huoniaoTag->assign("lastMonthDate", $lastMonthDate);

$begintime = strtotime($lastMonthDate);
$endtime = strtotime($nowDate);
$timeArr = array();
for($start = $begintime; $start <= $endtime; $start += 24 * 3600) {
    array_push($timeArr, date("m-d", $start));
}
$huoniaoTag->assign("timeArr", json_encode($timeArr));


$dataArr = $priceArr = $failedArr = $priceFailArr = array();

if($dopost == "getresults"){
    $peisongid = array();
    if($courier_id){
        $peisongid = array($courier_id);
    }else{
        foreach ($courierArr as $key => $value) {
            array_push($peisongid, $value['id']);
        }
    }
    $peisongid = join(",", $peisongid);
    $where = " AND `peisongid` in ($peisongid)";
    //跑腿营业额统计
    if($action == "chartrevenue"){

		checkPurview("waimaiPaotuiStatisticsChartrevenue");

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = "";
            $peisongid = array();
            if($courier_id){
                $peisongid = array($courier_id);
            }else{
                foreach ($courierArr as $key => $value) {
                    array_push($peisongid, $value['id']);
                }
            }
            $peisongid = join(",", $peisongid);
            $where = " AND `peisongid` in ($peisongid)";

            //服务费
            $sql = $dsql->SetQuery("SELECT SUM(`freight`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $fuwu = $dsql->dsqlOper($sql, "results");

            // 小费
            $sql = $dsql->SetQuery("SELECT SUM(`tip`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $tip = $dsql->dsqlOper($sql, "results");

            //货到付款
            /*$sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__paotui_order` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $delivery = $dsql->dsqlOper($sql, "results");*/

            //余额支付
            $sql = $dsql->SetQuery("SELECT SUM(`balance`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $money = $dsql->dsqlOper($sql, "results");

            //在线支付
            $sql = $dsql->SetQuery("SELECT SUM(`payprice`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $online = $dsql->dsqlOper($sql, "results");


            $total = $fuwu[0]['total'] + $tip[0]['total'];

            array_push($dataArr, array(
                "date"     => date("Y-m-d", $start),
                "total"    => sprintf("%.2f", $total),
                "money"    => sprintf("%.2f", $money[0]['total']),
                "online"    => sprintf("%.2f", $online[0]['total']),
                "fuwu"    => sprintf("%.2f", $fuwu[0]['total']),
                "tip"    => sprintf("%.2f", $tip[0]['total'])
            ));

            array_push($priceArr, sprintf("%.2f", $total));

        }


        //导出
        if($do == "export"){

            $shopname = (empty($cityname) ? "跑腿营业额统计" : $cityname."跑腿营业额统计");
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
            ->setCellValue('B1', '跑腿营业额')
            ->setCellValue('C1', '余额付款')
            ->setCellValue('D1', '在线支付')
            ->setCellValue('E1', '服务费')
            ->setCellValue('F1', '消费');


            // 表名
            $tabname = "跑腿营业额统计";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $total = $fuwu = $tip = $money = $online = 0;
            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['date']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['total']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['money']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['online']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['fuwu']);
              $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['tip']);
              $row++;

              $total += (float)$data['total'];
              $money += (float)$data['money'];
              $online += (float)$data['online'];
              $fuwu += (float)$data['fuwu'];
              $tip += (float)$data['tip'];
            }



            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $money);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $online);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $fuwu);
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $tip);

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


    //订单按天统计
    elseif($action == "chartorder"){

		checkPurview("waimaiPaotuiStatisticsChartorder");

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = "";
            $peisongid = array();
            if($courier_id){
                $peisongid = array($courier_id);
            }else{
                foreach ($courierArr as $key => $value) {
                    array_push($peisongid, $value['id']);
                }
            }
            $peisongid = join(",", $peisongid);
            $where = " AND `peisongid` in ($peisongid)";

            //成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $success = $dsql->dsqlOper($sql, "results");

            //失败订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `state` = 7 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $fail = $dsql->dsqlOper($sql, "results");

            //货到付款成功订单数
            // $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            // $delivery = $dsql->dsqlOper($sql, "results");

            //余额支付
            // $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `paytype` = 'money' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            // $money = $dsql->dsqlOper($sql, "results");

            //在线支付
            // $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            // $online = $dsql->dsqlOper($sql, "results");

            array_push($dataArr, array(
                "date"    => date("Y-m-d", $start),
                "fail"    => $fail[0]['total'],
                "success" => $success[0]['total']
            ));

            array_push($priceArr, $success[0]['total']);
            array_push($priceFailArr, $fail[0]['total']);

        }


        //导出
        if($do == "export"){

            $shopname = (empty($cityname) ? "跑腿订单统计" : $cityname."跑腿订单统计");
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
            ->setCellValue('B1', '成功订单数')
            ->setCellValue('C1', '失败订单数');


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

            $success = $fail = 0;
            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['date']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['success']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['fail']);
              $row++;

              $success += $data['success'];
              $fail += $data['fail'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $success);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $fail);

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


    //配送员统计
    elseif($action == "chartcourier"){

		checkPurview("waimaiPaotuiStatisticsChartcourier");

        $etime = strtotime(date("Y-m-d", $endtime));
        $btime = strtotime(date("Y-m-d", $begintime));
        for($start = $etime; $start >= $btime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            //成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $success = $dsql->dsqlOper($sql, "results");

            //失败订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
            $failed = $dsql->dsqlOper($sql, "results");

            array_push($priceArr, $success[0]['total']);
            array_push($failedArr, $failed[0]['total']);

        }

        foreach ($courierArr as $key => $value) {
            if(($courier_id && $value['id'] == $courier_id) || !$courier_id){

                // 成功单量
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = " . $value['id']);
                $totalSuccess = $dsql->dsqlOper($sql, "results");

                // 失败单量
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE (`state` = 6 OR `state` = 7) AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = " . $value['id']);
                $totalFailed = $dsql->dsqlOper($sql, "results");

                // 成功订单服务费
                $sql = $dsql->SetQuery("SELECT SUM(`freight`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = " . $value['id']);
                $fuwu = $dsql->dsqlOper($sql, "results");

                // 成功订单小费
                $sql = $dsql->SetQuery("SELECT SUM(`tip`) total FROM `#@__paotui_order` WHERE `state` = 1 AND `pubdate` >= $begintime AND `pubdate` <= $endtime AND `peisongid` = " . $value['id']);
                $tip = $dsql->dsqlOper($sql, "results");

                $total = $fuwu[0]['total'] + $tip[0]['total'];


                array_push($dataArr, array(
                    "name"     => $value['name'],
                    "totalSuccess"    => (int)$totalSuccess[0]['total'],
                    "totalFailed" => (int)$totalFailed[0]['total'],
                    "total"    => sprintf("%.2f", $total),
                    "fuwu"    => sprintf("%.2f", $fuwu[0]['total']),
                    "tip"   => sprintf("%.2f", $tip[0]['total'])
                ));

            }
        }



        //导出
        if($do == "export"){

            // $couriername = "配送员统计";
            $tablename = (empty($cityname) ? "全部配送员" : $cityname) . "营业额统计";
            $tablename = (empty($couriername) ? "全部配送员" : $couriername) . "营业额统计";
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
            ->setCellValue('D1', '总费用')
            ->setCellValue('E1', '配送费')
            ->setCellValue('F1', '小费');


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

            $totalSuccess = $totalFailed = $total = $fuwu = $tip = 0;
            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['name']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['totalSuccess']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['totalFailed']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['total']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['fuwu']);
              $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['tip']);
              $row++;

              $totalSuccess += $data['totalSuccess'];
              $totalFailed += $data['totalFailed'];
              $total += $data['total'];
              $fuwu += $data['fuwu'];
              $tip += $data['tip'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $totalSuccess);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $totalFailed);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $total);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $fuwu);
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $tip);

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

}


$huoniaoTag->assign("dataArr", $dataArr);

$priceArr = array_reverse($priceArr);
$huoniaoTag->assign("priceArr", str_replace('"', '', json_encode($priceArr)));

$failedArr = array_reverse($failedArr);
$huoniaoTag->assign("failedArr", str_replace('"', '', json_encode($failedArr)));

$priceFailArr = array_reverse($priceFailArr);
$huoniaoTag->assign("priceFailArr", str_replace('"', '', json_encode($priceFailArr)));

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
		'admin/waimai/waimaiPaotuiStatistics.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('action', $action);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
