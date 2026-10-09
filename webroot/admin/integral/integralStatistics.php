<?php
/**
 * 积分商城统计
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
$tpl = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "integralStatistics.html";
$action = empty($action) ? "productSale" : $action;


/*

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

 */

$timeArr = array();
$dataArr = $priceArr = array();

if($endDate){
    $nowDate = $endDate;
}else{
    if($action == "chartordertime" || $action == "chartcourier"){
        $nowDate = date("Y-m-d") . " 23:59:59";
    }else{
        $nowDate = date("Y-m-d");
    }
}

if($beginDate){
    $lastMonthDate = $beginDate;
}else{
    if($action == "chartordertime" || $action == "chartcourier"){
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


if($dopost == "getresults"){

    //商品销量
    if($action == "productSale"){

        $time1 = $begintime;
        $time2 = $endtime + 86399;

        $where = " AND o.`orderstate` = 3 AND o.`orderdate` >= $time1 AND o.`orderdate` <= $time2";
        $where .= " GROUP BY o.`proid` ORDER BY `sale` DESC";

        $archives = $dsql->SetQuery("SELECT o.`id`, o.`proid`, SUM(`count`) sale, SUM(`price` * `count`) totalPrice, SUM(`point` * `count`) totalPoint, SUM(`freight`) totalFreight FROM `#@__integral_order` o WHERE 1 = 1".$where);
        // echo $archives;
        $orderRet = $dsql->dsqlOper($archives, "results");

        $orderList = array();
        $peisong = 0;

        if($orderRet){
            foreach ($orderRet as $key => $value) {
                $proid = $value['proid'];
                $sql = $dsql->SetQuery("SELECT p.`title`, p.`price`, p.`point`, t.`typename` FROM `#@__integral_product` p LEFT JOIN `#@__integral_type` t ON t.`id` = p.`typeid` WHERE p.`id` = $proid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $title = $ret[0]['title'];
                    $price = $ret[0]['price'];
                    $point = $ret[0]['point'];
                    $typename = $ret[0]['typename'];
                }else{
                    $title = "";
                    $price = 0;
                    $point = 0;
                    $typename = "";
                }

                array_push($dataArr, array(
                    "id"         => $value['id'],
                    "title"      => $title,
                    "price"      => $price,
                    "point"      => $point,
                    "totalPrice" => $value['totalPrice'],
                    "totalPoint" => $value['totalPoint'],
                    "totalFreight" => $value['totalFreight'],
                    "sale"       => (int)$value['sale'],
                    "typename"   => $typename,
                ));
            }
        }

        //导出
        if($do == "export"){

            $title = "商品销量统计";
            $title = iconv("UTF-8", "GB2312//IGNORE", $title);

            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
            include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
            //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
            // 创建一个excel
            $objPHPExcel = new PHPExcel();

            // Set document properties
            $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

            $objPHPExcel->setActiveSheetIndex(0)
            ->setCellValue('A1', '商品名称')
            ->setCellValue('B1', '分类')
            ->setCellValue('C1', '销售量')
            ->setCellValue('D1', '单价')
            ->setCellValue('E1', '总价');


            // 表名
            $tabname = "商品销量统计";
            $objPHPExcel->getActiveSheet()->setTitle($tabname);

            // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
            $objPHPExcel->setActiveSheetIndex(0);
            // 所有单元格默认高度
            $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
            // 冻结窗口
            $objPHPExcel->getActiveSheet()->freezePane('A2');

            // 从第二行开始
            $row = 2;

            $sale = $totalPrice = $totalPoint = 0;

            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['title']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['typename']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['sale']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "现金：" . $data['price'] . "   ". "积分：" . $data['point']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, "现金：" . $data['totalPrice'] . "   ". "积分：" . $data['totalPoint']);
              $row++;

              $sale += $data['sale'];
              $totalPrice += $data['totalPrice'];
              $totalPoint += $data['totalPoint'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $sale);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, "现金：" . $totalPrice . "   ". "积分：" . $totalPoint);

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

// $huoniaoTag->assign("saleTitleTop", json_encode($saleTitleTop));
// $huoniaoTag->assign("saleSaleTop", json_encode($saleSaleTop));


$huoniaoTag->assign("dataArr", $dataArr);

$priceArr = array_reverse($priceArr);
$huoniaoTag->assign("priceArr", str_replace('"', '', json_encode($priceArr)));

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
		'admin/integral/integralStatistics.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('action', $action);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
