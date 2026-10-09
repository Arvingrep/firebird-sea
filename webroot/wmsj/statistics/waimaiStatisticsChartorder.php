<?php
/**
 * 外卖统计-按天统计
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

$templates = "waimaiStatisticsChartorder.html";
$action ="chartorder" ;


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


$dataArr = $priceArr = array();


//订单按天统计
if($action == "chartorder"){

    for($start = $endtime; $start >= $begintime; $start -= 24 * 3600) {

        $time1 = $start;
        $time2 = $start + 86400;

        $where = " AND `sid` in ($managerIds)";
        if($shop_id){
            $where = " AND `sid` = $shop_id";
        }

        //成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
        $success = $dsql->dsqlOper($sql, "results");

        //失败订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE `state` = 7 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
        $failed = $dsql->dsqlOper($sql, "results");

        //货到付款成功订单数
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE `paytype` = 'delivery' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
        $delivery = $dsql->dsqlOper($sql, "results");

        //余额支付
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE `paytype` = 'money' AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
        $money = $dsql->dsqlOper($sql, "results");

        //在线支付
        $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order` WHERE (`paytype` = 'wxpay' OR `paytype` = 'alipay') AND `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2" . $where);
        $online = $dsql->dsqlOper($sql, "results");

        array_push($dataArr, array(
            "date"     => date("Y-m-d", $start),
            "success"    => $success[0]['total'],
            "failed"    => $failed[0]['total'],
            "delivery" => $delivery[0]['total'],
            "money"    => $money[0]['total'],
            "online"   => $online[0]['total']
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
