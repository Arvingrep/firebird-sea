<?php
/**
 * 商城统计
 *
 * @version        $Id: shopStatistics.php 2017-6-18 上午12:27:19 $
 * @package        HuoNiao.Waimai
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "shopStatistics.html";
$action = empty($action) ? "chartrevenue" : $action;


//查询所有店铺
$shopArr = array();
$sql = $dsql->SetQuery("SELECT `id`, `title` shopname FROM `#@__shop_store` ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shopArr = $ret;
}
$huoniaoTag->assign("shop_id", $shop_id);
$huoniaoTag->assign("shopArr", $shopArr);

//查询指定店铺信息
$shopname = "";
if(!empty($shop_id)){
    $sql = $dsql->SetQuery("SELECT `title` shopname FROM `#@__shop_store` WHERE `id` = $shop_id");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $shopname = $ret[0]['shopname'];
    }
}
$huoniaoTag->assign("shopname", $shopname);


//最近一月时间
/*$nowDate = $endDate ? $endDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d") . " 23:59:59" : date("Y-m-d"));
$lastMonthDate = $beginDate ? $beginDate : ($action == "chartordertime" || $action == "chartcourier" ? date("Y-m-d", strtotime("-31 day")) . " 00:00:00" : date("Y-m-d", strtotime("-31 day")));*/

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
$timeArr = array();
for($start = $begintime; $start <= $endtime; $start += 24 * 3600) {
    array_push($timeArr, date("m-d", $start));
}
$huoniaoTag->assign("timeArr", json_encode($timeArr));


$dataArr = $priceArr = array();

$saleTitleTop = $saleSaleTop = array();

if($dopost == "getresults"){

    //商城营业额统计
    if($action == "chartrevenue"){

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = " AND `orderstate` = 3 AND `orderdate` >= $time1 AND `orderdate` < $time2";
            if($shop_id){
                $where .= " AND `store` = $shop_id";
            }


            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`freight` FROM `#@__shop_order` o WHERE 1 = 1".$where);
            $orderRet = $dsql->dsqlOper($archives, "results");

            $orderList = array();
            $peisong = 0;

            if($orderRet){
                foreach ($orderRet as $key => $value) {
                    array_push($orderList, $value['id']);
                    $peisong += $value['freight'];
                }
            }


            $where = empty($orderList) ? " AND 1 = 2" : " AND `orderid` in (".join(",", $orderList).")";


            //余额支付
            $sql = $dsql->SetQuery("SELECT SUM(`balance`) total FROM `#@__shop_order_product` WHERE 1 = 1".$where);
            $money = $dsql->dsqlOper($sql, "results");

            //在线支付
            $sql = $dsql->SetQuery("SELECT SUM(`payprice`) total FROM `#@__shop_order_product` WHERE 1 = 1".$where);
            $online = $dsql->dsqlOper($sql, "results");

            //总营业额
            $total = $money[0]['total'] + $online[0]['total'] + $peisong;

            //配送费

            array_push($dataArr, array(
                "date"     => date("Y-m-d", $start),
                "total"    => sprintf("%.2f", $total),
                "money"    => sprintf("%.2f", $money[0]['total']),
                "online"   => sprintf("%.2f", $online[0]['total']),
                "peisong"    => sprintf("%.2f", $peisong)
            ));

            array_push($priceArr, sprintf("%.2f", $total));

        }


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
            ->setCellValue('C1', '余额支付')
            ->setCellValue('D1', '在线支付')
            ->setCellValue('E1', '配送费');


            // 表名
            $tabname = "商城营业额统计";
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
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['money']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['online']);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['peisong']);
              $row++;

              $total += $data['total'];
              $money += $data['money'];
              $online += $data['online'];
              $peisong += $data['peisong'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $money);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $online);
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $peisong);

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

        for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

            $time1 = $start;
            $time2 = $start + 86400;

            $where = "";
            if($shop_id){
                $where = " AND `sid` = $shop_id";
            }

            //成功订单数
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__shop_order` WHERE `orderstate` = 3 AND `orderdate` >= $time1 AND `orderdate` < $time2" . $where);
            $success = $dsql->dsqlOper($sql, "results");

            array_push($dataArr, array(
                "date"     => date("Y-m-d", $start),
                "success"    => $success[0]['total']
            ));

            array_push($priceArr, sprintf("%.2f", $success[0]['total']));

        }


        //导出
        if($do == "export"){

            $shopname = (empty($shopname) ? "全部店铺" : $shopname) . "订单统计";
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
            ->setCellValue('B1', '成功订单数');


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
              $row++;

              $success += $data['success'];
            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $success);

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


    //订单按时间段统计
    elseif($action == "chartordertime"){


        $where = "";
        if($shop_id){
            $where = " AND `sid` = $shop_id";
        }

        //成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__shop_order` WHERE `orderstate` = 3 AND `orderdate` >= $begintime AND `orderdate` <= $endtime" . $where);
        $success = $dsql->dsqlOper($sql, "results");
        
        array_push($dataArr, array(
            "success"    => $success[0]['total']
        ));

    }


    //商品销量
    elseif($action == "productSale"){

        $time1 = $begintime;
        $time2 = $endtime + 86399;


        $where = " AND `orderstate` = 3 AND `orderdate` >= $time1 AND `orderdate` <= $time2";
        if($shop_id){
            $where = " AND `store` = $shop_id";
        }


        $archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__shop_order` o WHERE 1 = 1".$where);
        $orderRet = $dsql->dsqlOper($archives, "results");

        $orderList = array();

        if($orderRet){
            foreach ($orderRet as $key => $value) {
                array_push($orderList, $value['id']);
                $peisong += $value['freight'];
            }
        }else{
            $orderList = array();
        }


        $where = empty($orderList) ? " AND 1 = 2" : " AND op.`orderid` in (".join(",", $orderList).")";

        $archives = $dsql->SetQuery("SELECT op.`orderid`, op.`proid`, op.`price`, op.`count`, op.`logistic`, op.`speid`, op.`specation`, p.`title`, p.`category` FROM `#@__shop_order_product` op LEFT JOIN `#@__shop_product` p ON p.`id` = op.`proid` WHERE 1 = 1".$where);
        $results = $dsql->dsqlOper($archives, "results");

        $productSale = array();

        $shopTotalPrice = 0;
        
        if($results){
            foreach ($results as $key => $value) {

                $shopTotalPrice += $value['price'] * $value['count'];

                $proid = $value['proid'];
                $category = $value['category']; // 分类
                $specation = $value['specation'];
                $sale = (int)$value['count'];
                $price = $value['price'];

                $find = false;
                foreach ($productSale as $k => $v) {
                    if($proid == $v['proid'] && $specation == $v['specation']){
                        $productSale[$k]['sale'] += $sale;
                        $productSale[$k]['totalPrice'] += $price * $sale;
                        $find = true;

                        $same = false;
                        foreach ($v['price'] as $n => $s) {
                            if($price == $s[0]){
                                $productSale[$k]['price'][$n][1] += $sale;
                                $same = true;
                                break;
                            }
                        }
                        if(!$same){
                            $productSale[$k]['price'][] = array($price, $sale);
                        }

                        break;
                    }
                }
                if(!$find){

                    // 查询分类名
                    $typename = [];
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_category` WHERE `id` IN ($category)");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        foreach ($ret as $k => $v) {
                            $typename[] = $v['typename'];
                        }
                    }


                    $productSale[] = array(
                            "title" => $value['title'] . (empty($specation) ? "" : "-".$specation),
                            "proid" => $value['proid'],
                            "typename" => join("、", $typename),
                            "specation" => $value['specation'],
                            "price" => array(array($price, $sale)),
                            "totalPrice" => $price * $sale,
                            "sale" => $sale
                        );
                }

            }

            usort($productSale, function($a, $b) {
                return ($a['sale'] > $b['sale']) ? 0 : 1;
            });


        }


        if($productSale){

            $index = 0;

            foreach ($productSale as $key => $value) {

                $price = $value['price'];

                $priceSale = array();
                if(count($price) > 1){
                    foreach ($price as $k => $v) {
                        array_push($priceSale, $v[0] . " × " . $v[1]);
                    }
                }else{
                    $priceSale = array($price[0][0]);
                }
                array_push($dataArr, array(
                    "id"         => $value['value'],
                    "title"      => $value['title'],
                    "price"      => join("<br>", $priceSale),
                    "totalPrice" => $value['totalPrice'],
                    "sale"       => (int)$value['sale'],
                    "typename"   => $value['typename'],
                ));

                if($index < 10){
                    array_push($saleTitleTop, $value['title']);
                    array_push($saleSaleTop, (int)$value['sale']);
                }
                $index++;
            }

        }

        //导出
        if($do == "export"){

            $title = (empty($shopname) ? "全部店铺" : $shopname) . "商品销量统计";
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

            $sale = $money = 0;

            foreach($dataArr as $data){
              $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['title']);
              $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['typename']);
              $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['sale']);
              $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['price'][0][0]);
              $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['totalPrice']);
              $row++;

              $sale += $data['sale'];
              $money += $data['price'] * $data['sale'];

            }

            $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $sale);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "");
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $money);

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

$huoniaoTag->assign("saleTitleTop", json_encode($saleTitleTop));
$huoniaoTag->assign("saleSaleTop", json_encode($saleSaleTop));


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
		'admin/shop/shopStatistics.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('action', $action);
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
