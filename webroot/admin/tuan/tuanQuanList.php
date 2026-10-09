<?php
/**
 * 团购券管理
 *
 * @version        $Id: tuanQuanList.php 2013-12-16 下午16:27:16 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanQuanList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanQuanList.html";

$action = "tuanquan";

if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('store.`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }

    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if(!empty($sidArr)){
        $w .= " AND l.`sid` in (".join(",",$sidArr).")";
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息1").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
    }

	if($sKeyword != ""){
		$where = " AND (`cardnum` like '%".$sKeyword."%'";

		$w .= " AND (o.`ordernum` like '%".$sKeyword."%' OR l.`title` like '%".$sKeyword."%')";

    }
    if($start != ""){
        $w .= " AND o.`orderdate` >= ". GetMkTime($start);
    }

    if($end != ""){
        $w .= " AND o.`orderdate` <= ". GetMkTime($end);
    }

    $orderSql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` WHERE 1=1".$w);
    $orderResult = $dsql->dsqlOper($orderSql, "results");
    if($orderResult){
        $orderid = array();
        foreach($orderResult as $key => $order){
            array_push($orderid, $order['id']);
        }
        if(!empty($orderid)){
            if($sKeyword != ""){
                $where .= " OR `orderid` in (".join(",", $orderid)."))";
            }else{
                $where .= " AND `orderid` in (".join(",", $orderid).")";
            }
        }else{
			if($sKeyword != ""){
                $where .= " )";
            }
		}
    }else{
		if($sKeyword != ""){
			$where .= " )";
		}
	}
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where." GROUP BY `cardnum`", "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//可使用
	$effective = $dsql->dsqlOper($archives." AND `usedate` = 0 AND (`expireddate` = 0 OR `expireddate` >= ".GetMkTime(time()).") GROUP BY `cardnum`", "totalCount");
	//已过期
	$expired = $dsql->dsqlOper($archives." AND `usedate` = 0 AND `expireddate` < ".GetMkTime(time()) . " GROUP BY `cardnum`", "totalCount");
	//已消费
	$spend = $dsql->dsqlOper($archives." AND `usedate` != 0 GROUP BY `cardnum`", "totalCount");
	//已作废
    $state3sql= $dsql->SetQuery("SELECT o.`id`, o.`ordernum` FROM `#@__tuan_order` o RIGHT JOIN `#@__tuanquan` l ON l.`orderid` = o.`id` WHERE orderstate=7".$where );
    $state3 = $dsql->dsqlOper($state3sql, "totalCount");

    if($state != ""){
		if($state == 0){
			$where .= " AND `usedate` = 0 AND (`expireddate` = 0 OR `expireddate` >= ".GetMkTime(time()).")";
			$totalPage = ceil($effective/$pagestep);

		}elseif($state == 1){
			$where .= " AND `usedate` = 0 AND `expireddate` < ".GetMkTime(time());
			$totalPage = ceil($expired/$pagestep);

		}elseif($state == 2){
			$where .= " AND `usedate` != 0";
			$totalPage = ceil($spend/$pagestep);

		}elseif($state == 3){

            $totalPage = ceil($state3/$pagestep);
        }
	}

	$where .= " GROUP BY `cardnum` order by l.`id` desc";

	$atpage = $pagestep*($page-1);
    if($do != "export") {
        $where .= " LIMIT $atpage, $pagestep";
    }

	if ($state == 3){
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`orderid`, l.`cardnum`, l.`carddate`, l.`usedate`, l.`expireddate`, o.`ordernum`,o.`orderstate` FROM `#@__tuanquan`l LEFT JOIN `#@__tuan_order` o  ON l.`orderid` = o.`id` WHERE orderstate= 7".$where);
        $results = $dsql->dsqlOper($archives, "results");
    }else{
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`orderid`, l.`cardnum`, l.`carddate`, l.`usedate`, l.`expireddate`, o.`ordernum`,o.`orderstate` FROM `#@__tuanquan`l LEFT JOIN `#@__tuan_order` o  ON l.`orderid` = o.`id` WHERE 1= 1".$where);
        $results = $dsql->dsqlOper($archives, "results");
    }
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["cardnum"] = $value["cardnum"];
			$list[$key]["carddate"] = $value["carddate"];
			$list[$key]["usedate"] = date('Y-m-d H:i:s', $value["usedate"]);
			$list[$key]["expireddate"] = $value["expireddate"] == 0 ? "无期限" : date('Y-m-d', $value["expireddate"]);
			if($value["usedate"] == 0){
				if($value["expireddate"] == 0 || $value["expireddate"] >= GetMkTime(time())){
					$list[$key]["state"] = 0;
				}else{
					$list[$key]["state"] = 1;
				}
			}else{
				$list[$key]["state"] = 2;
			}
            if ($value['orderstate'] == 7){
                    $list[$key]["state"] = 3;
            }
			$list[$key]["orderid"] = $value["orderid"];
			//团购订单

            $orderSql = $dsql->SetQuery("SELECT q.`orderid`,q.`cardnum`, o.`ordernum`, o.`orderdate`, o.`orderprice`, o.`userid`, o.`procount`, o.`balance`, o.`payprice`, o.`propolic`, o.`peerpay`,o.`shopFee`,o.`proprice`,l.price,o.`proid` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id`  WHERE q.`cardnum` = '".$value["cardnum"]."'");
            $orderResult = $dsql->dsqlOper($orderSql, "results");

            if(count($orderResult) > 0){
				$list[$key]["ordernum"] = $orderResult[0]['ordernum'];
				$list[$key]["orderdate"] = date('Y-m-d H:i:s', $orderResult[0]['orderdate']);
				$list[$key]["orderprice"] = $orderResult[0]['proprice'] == 0.00 ? sprintf("%.2f", $orderResult[0]["price"]) : sprintf("%.2f", $orderResult[0]["proprice"]) ;
				$proid = $orderResult[0]['proid'];
			}else{
				$list[$key]["ordernum"] = "未知";
				$list[$key]["orderdate"] = "";
				$list[$key]["orderprice"] = "";
				$proid = 0;
			}

			$list[$key]["proid"] = $proid;

			//团购商品
			$proSql = $dsql->SetQuery("SELECT `title` FROM `#@__tuanlist` WHERE `id` = ". $proid);
			$proname = $dsql->dsqlOper($proSql, "results");
			if(count($proname) > 0){
				$list[$key]["proname"] = $proname[0]['title'];
			}else{
				$list[$key]["proname"] = "未知";
			}

			$param = array(
				"service" => "tuan",
				"template" => "detail",
				"id" => $proid
			);
			$list[$key]['prourl'] = getUrlPath($param);
		}

		if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "effective": ' . $effective . ', "expired": ' . $expired . ', "spend": ' . $spend . ', "state3": ' . $state3 . '}, "tuanQuanList": ' . json_encode($list) . '}';
            }
		}else{
            if($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "effective": ' . $effective . ', "expired": ' . $expired . ', "spend": ' . $spend . ', "state3": ' . $state3 . '}}';
            }
		}

	}else{
        if($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "effective": ' . $effective . ', "expired": ' . $expired . ', "spend": ' . $spend . ', "state3": ' . $state3 . '}}';
        }
	}

    if($do == "export"){

        $tablename = "团购券";
        $tablename = iconv("UTF-8", "GB2312//IGNORE", $tablename);

        /* include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel.php';
        include HUONIAOROOT.'/include/class/PHPExcel/PHPExcel/Writer/Excel2007.php';
        //或者include 'PHPExcel/Writer/Excel5.php'; 用于输出.xls 的
        // 创建一个excel
        $objPHPExcel = new PHPExcel();

        // Set document properties
        $objPHPExcel->getProperties()->setCreator("Phpmarker")->setLastModifiedBy("Phpmarker")->setTitle("Phpmarker")->setSubject("Phpmarker")->setDescription("Phpmarker")->setKeywords("Phpmarker")->setCategory("Phpmarker");

        $objPHPExcel->setActiveSheetIndex(0)
        ->setCellValue('A1', '充值卡号')
        ->setCellValue('B1', '金额')
        ->setCellValue('C1', '过期时间')
        ->setCellValue('D1', '状态')
        ->setCellValue('E1', '生成时间')
        ->setCellValue('F1', '使用会员')
        ->setCellValue('G1', '使用时间');


        // 表名
        $tabname = "充值卡统计";
        $objPHPExcel->getActiveSheet()->setTitle($tabname);

        // 将活动表索引设置为第一个表，因此Excel将作为第一个表打开此表
        $objPHPExcel->setActiveSheetIndex(0);
        // 所有单元格默认高度
        $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(15);
        // 冻结窗口
        $objPHPExcel->getActiveSheet()->freezePane('A2');

        // 从第二行开始
        $row = 2;

        $total = 0;
        $use = 0; */
        set_time_limit(30);
        //ini_set('memory_limit', '128M');
        $fileName = date('Y-m-d H:i:s', time()).'--团购券';
        $fileName = iconv("UTF-8", "GB2312//IGNORE", $fileName);
        header('Content-Type: application/vnd.ms-execl');
        header('Content-Disposition: attachment;filename="' . $fileName . '.csv"');

        $fp = fopen('php://output', 'a');
        $title = array('券号', '有效期','状态', '订单编号', '购买时间', '订单金额', '团购商品');
        foreach($title as $key => $item) {
            $title[$key] = iconv('UTF-8', 'GBK', $item);
        }
        //将标题写到标准输出中
        fputcsv($fp, $title);


        foreach($list as $key=>$data){
            unset($data['id']);
            unset($data['uid']);
            unset($data['stateVal']);
            unset($data['note']);
            unset($data['prourl']);
            unset($data['proid']);
            unset($data['carddate']);
            unset($data['id']);
            unset($data['orderid']);

            $data['proname'] = iconv('UTF-8', 'GBK//IGNORE', $data['proname']);
            $stateVal = '';
            if($data['state'] == 0){
                $stateVal = '可使用';
            }else if($data['state'] == 1){
                $stateVal = '已过期';
            }else if($data['state'] == 2){
                $stateVal = '消费于'.$data['usedate'];
            }else if($data['state'] == 3){
                $stateVal = '已退款';
            }
            $data['state'] = iconv('UTF-8', 'GBK//IGNORE', $stateVal);
           unset($data['usedate']);
            $data['cardnum'] = $data['cardnum']."\t";
            $data['ordernum'] = $data['ordernum']."\t";
            fputcsv($fp, $data);
            /* $objPHPExcel->getActiveSheet()->setCellValue("A".$row, $data['code']);
            $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $data['amount']);
            $objPHPExcel->getActiveSheet()->setCellValue("C".$row, $data['expire']);
            $objPHPExcel->getActiveSheet()->setCellValue("D".$row, $data['state'] == 0 ? '未使用': '已使用');
            $objPHPExcel->getActiveSheet()->setCellValue("E".$row, $data['time']);
            $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $data['username']);
            $objPHPExcel->getActiveSheet()->setCellValue("G".$row, $data['date']);
            $row++;

            $total += $data['amount'];
            if($data['state'] == 1){
                $use++;
            } */
        }
        fclose($fp);
        die;

        /* $objPHPExcel->getActiveSheet()->setCellValue("A".$row, "总计");
        $objPHPExcel->getActiveSheet()->setCellValue("B".$row, $total);
        $objPHPExcel->getActiveSheet()->setCellValue("C".$row, "");
        $objPHPExcel->getActiveSheet()->setCellValue("D".$row, "");
        $objPHPExcel->getActiveSheet()->setCellValue("E".$row, "");
        $objPHPExcel->getActiveSheet()->setCellValue("F".$row, $use);
        $objPHPExcel->getActiveSheet()->setCellValue("G".$row, "");

        $objActSheet = $objPHPExcel->getActiveSheet(); */

        // 列宽
        /* $objPHPExcel->getActiveSheet()->getColumnDimension()->setAutoSize(true);

        $filename = $tablename."__".$start."__".$end.".csv";
        ob_end_clean();//清除缓冲区,避免乱码
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment;filename="'.$filename.'"');
        $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
        $objWriter->save('php://output');
        die;*/
    }
	die;

//登记
}elseif($dopost == "reg"){
	if(!testPurview("tuanQuanOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each  = explode(",", $id);
	$error = array();
	$now   = GetMkTime(time());

	foreach($each as $val){
	    $quansql =  $dsql->SetQuery( "SELECT `cardnum`,`usedate` FROM `#@__tuanquan` WHERE `id` = '".$val."'");
	    $quanres =  $dsql ->dsqlOper($quansql, "results");
        $cardnum = '';
	    if($quanres && is_array($quanres)){
	        if($quanres[0]['usedate'] > 0) {
                $error[] = $val;
                continue;
            }
	        $cardnum = $quanres[0]['cardnum'];
        }else{
            $error[] = $val;
            continue;
        }
		$updateSql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `usedate` = ".GetMkTime(time())." WHERE `id` = ".$val." AND `usedate` = 0");
        $results = $dsql->dsqlOper($updateSql, "update");
        if($results != "ok"){
            $error[] = $val;
            continue;
        }

		//查询订单信息
		$sql = $dsql->SetQuery("SELECT q.`orderid`,o.`id`,o.`orderprice`, o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`propolic`, o.`ordernum`,o.`shopFee`, s.`uid`,l.`price`,o.`proprice` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE q.`id` = ".$val);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$orderid    = $ret[0]['orderid'];
			$oid        = $ret[0]['id'];
			$ordernum   = $ret[0]['ordernum'];
			$uid        = $ret[0]['uid'];
			$shopFee    = $ret[0]['shopFee'];

			$procount   = $ret[0]['procount'];   //数量
//			$orderprice = $ret[0]['price']; //单价
			$orderprice = $ret[0]['proprice'] > 0 ? $ret[0]['proprice'] : $ret[0]['price']; //单价  如果proprice没有值，直接使用商品价格，此处用于兼容老数据
			$balance    = $ret[0]['balance'];    //余额金额
			$payprice   = $ret[0]['payprice'];   //支付金额
			$userid     = $ret[0]['userid'];     //买家ID

            //获取transaction_id
            $transaction_id = $paytype = '';
            $sql = $dsql->SetQuery("SELECT `id`,`transaction_id`, `paytype`,`amount` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            $pid = '';
            $truepayprice = 0;
            if($ret){
                $transaction_id = $ret[0]['transaction_id'];
                $paytype 		= $ret[0]['paytype'];
                $pid  			= $ret[0]['id'];
                $truepayprice  	= $ret[0]['amount'];
            }


			//如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
			$totalPayPrice = $balance + $payprice;
			if($totalPayPrice > 0){

				//减去消费会员的冻结金额
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");

//                $paramUser = array(
//                    "service"  => "member",
//                    "type"     => "user",
//                    "template" => "orderdetail",
//                    "action"   => "tuan",
//                    "id"       => $oid
//                );
//                $urlParam = serialize($paramUser);
//                $sql = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $uid");
//                $ret = $dsql->dsqlOper($sql, "results");
//                if($ret){
//                    $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
//                }
//                $title = '团购消费-'.$shopname;
//				//保存操作日志
//				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`) VALUES ('$userid', '0', '0', '团购券消费：$cardnum', '$now','tuan','xiaofei','$pid','$urlParam','$title','$ordernum')");
//				$dsql->dsqlOper($archives, "update");

			}

			//扣除佣金
			global $cfg_tuanFee;
            global $cfg_fenxiaoState;
            global $cfg_fenxiaoSource;
            global $cfg_fenxiaoDeposit;
            global $cfg_fenxiaoAmount;
            global $cfg_fztuanFee;
            global $cfg_fenxiaoDeposit;
            include HUONIAOINC."/config/tuan.inc.php";
            $fenXiao = (int)$customfenXiao;
			$cfg_tuanFee = !empty((float)$shopFee)? (float)$shopFee : (float)$cfg_tuanFee;

			$fee = $orderprice * $cfg_tuanFee / 100;
            $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
			$fee = $fee < 0.01 ? 0 : $fee;
			$orderprice_ = sprintf('%.2f', $orderprice - $fee);



            $fenxiaoparamarr = fenXiaoMoneyCalculation('tuan',$ordernum);
            $_fenxiaoAmount = 0;
            if($cfg_fenxiaoState && $fenXiao){
                //商家承担
                if ($cfg_fenxiaoSource) {
                    $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $cardnum,$orderprice);
                    $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                    //平台承担
                } else {
                    $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $cardnum,$fee);
                    $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                }
            }
            //分佣 开关
            $fenxiaoTotalPrice = $_fenxiaoAmount;
            $fenxiaoparamarr['amount'] = $_fenxiaoAmount;
            $precipitateMoney = 0;  //计算沉淀金额
            if($fenXiao ==1){
                (new member())->returnFxMoney("tuan", $userid, $cardnum, $fenxiaoparamarr);
                $_title = '团购消费券，订单号：' . $cardnum;
                //查询一共分销了多少佣金
                $fenxiaomoneysql = $dsql->SetQuery("SELECT  `amount`  FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'tuan' group by `uid` ");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                //如果系统没有开启资金沉淀才需要查询实际分销了多少
                if(!$cfg_fenxiaoDeposit){

                    $amountsum = array();
                    foreach ( $fenxiaomonyeres as $item=>$vv) {
                        $amountsum[] += $vv['amount'];
                    }
                    $fenxiaoTotalPrice     = array_sum($amountsum);
                }else{
                    //沉淀的钱 = 应该分销的钱 - 实际分销的钱
                    $amountsum = array();
                    foreach ( $fenxiaomonyeres as $item=>$vv) {
                        $amountsum[] += $vv['amount'];
                    }
                    $precipitateMoney = $_fenxiaoAmount - array_sum($amountsum);;
                }
            }

            global  $userLogin;
            $userinfo = $userLogin->getMemberInfo($uid);
            $cityid = $userinfo['cityid'];

            if($cfg_fenxiaoState && $fenXiao) {
                //商家承担
                if ($cfg_fenxiaoSource) {
                    //记录沉淀资金
                    if($precipitateMoney > 0){
                        (new member())->recodePrecipitationMoney($uid,$ordernum,'团购券消费收入：'.$val,$precipitateMoney,$cityid,"tuan");
                    }
                    $orderprice_ = $orderprice_ - $fenxiaoTotalPrice;   //没有分佣完的钱在加给商家
                    //平台承担
                } else {
                    $fee  = $fee -  $fenxiaoTotalPrice;                //没有分佣完的钱在加给平台
                }
            }


            $fenxiosql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `fenxiaoSource` = '$cfg_fenxiaoSource' WHERE `cardnum` = '$val'");
            $dsql->dsqlOper($fenxiosql, "update");
//            //分站
//            $usersql = $dsql->SetQuery("SELECT `addr` FROM `#@__member` WHERE `id` = " . $uid);
//            $userres = $dsql->dsqlOper($usersql, "results");
//
//            $addr = $userres[0]['addr'];
//
//            $cityid   = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr, 'split' => '/', 'type' => 'typename', 'action' => 'addr', 'returntype' => '1'));
//            $cityName = getSiteCityName($cityid);

            //分站佣金
            $fzFee = cityCommission($cityid,'tuan');
            //分站提成
            $fztotalAmount_ = $fee * (float)$fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

            $fee -= $fztotalAmount_;            //平台收入减去分站收入

			//将费用转至商家帐户
			$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$orderprice_' WHERE `id` = '$uid'");
			$dsql->dsqlOper($archives, "update");

            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $id
            );
            global  $userLogin;
            $urlParam = serialize($paramBusi);
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money =  sprintf('%.2f',($usermoney + $orderprice_));
			//更新商家交易记录
			$title = '团购收入-'.$shopname;
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$orderprice_', '团购券消费收入：$cardnum', '$now','tuan','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$usermoney')");
			$dsql->dsqlOper($archives, "update");

			//更新用户交易记录
            $usere  = $userLogin->getMemberInfo($userid);
            $usemoney = $usere['money'];
            //保存操作日志平台
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('$userid', '1', '$orderprice', '团购券消费收入：$cardnum', '$now','$cityid','$fztotalAmount_','tuan',$fee,'1','shangpinxiaoshou','$ordernum')");
//            $dsql->dsqlOper($archives, "update");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);


            //更新订单状态，如果券都用掉了，就更新订单状态为已使用
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuanquan` WHERE `orderid` = (SELECT `orderid` FROM `#@__tuanquan` WHERE `id` = ".$val.") AND `usedate` = 0");
			$ret = $dsql->dsqlOper($sql, "totalCount");
			if($ret == 0){
				$sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 3, `ret-state` = 0 WHERE `id` = '$orderid'");
				$dsql->dsqlOper($sql, "update");
			}

			// if($truepayprice <=0){
			// 	$truepayprice = $orderprice_;
			// }
            //工行E商通银行分账
            if($transaction_id){
                rfbpShareAllocation(array(
                    "uid" 			=> $uid,
                    "ordertitle" 	=> "团购券收入",
                    "ordernum" 		=> $ordernum,
                    "orderdata" 	=> array(),
                    "totalAmount" 	=> $orderprice,
                    "amount" 		=> $orderprice_,
                    "channelPayOrderNo" => $transaction_id,
                    "paytype" 		=> $paytype
                ));
            }

            //返积分
            (new member())->returnPoint("tuan", $userid, $orderprice, $ordernum,$orderprice_,$uid);

		}

	}
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';die;
    }else {
        adminLog("消费登记团购券", $id);
        echo '{"state": 100, "info": ' . json_encode("操作成功！") . '}';
        die;
    }

//取消登记
}elseif($dopost == "cangelreg"){
	if(!testPurview("tuanQuanOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each  = explode(",", $id);
	$error = array();
	$now   = GetMkTime(time());
	foreach($each as $val){

		$archives = $dsql->SetQuery("SELECT q.`cardnum`, q.`orderid`,q.`fenxiaoSource`,o.`ordernum`,o.`userid`, o.`procount`, o.`proprice` orderprice, o.`balance`, o.`payprice`, o.`propolic`,o.`shopFee`, s.`uid`, l.`price` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE q.`id` = ".$val);

		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

            $orderid       = $results[0]['orderid'];
            $cardnum       = $results[0]['cardnum'];
            $ordernum      = $results[0]['ordernum'];
            $uid           = $results[0]['uid'];
            $shopFee       = $results[0]['shopFee'];
            $fenxiaoSource = (int)$results[0]['fenxiaoSource'];

			$procount   = $results[0]['procount'];   //数量
			$orderprice = $results[0]['orderprice'] > 0 ? $results[0]['orderprice'] : $results[0]['price']; //单价  如果proprice没有值，直接使用商品价格，此处用于兼容老数据
			$balance    = $results[0]['balance'];    //余额金额
			$payprice   = $results[0]['payprice'];   //支付金额
			$userid     = $results[0]['userid'];     //买家ID

			//扣除佣金
			global $cfg_tuanFee;
			global $cfg_fenxiaoState;
			global $customfenXiao;
			$cfg_tuanFee = !empty((float)$shopFee)? (float)$shopFee :(float)$cfg_tuanFee;

			$fee = $orderprice * $cfg_tuanFee / 100;
			$fee = $fee < 0.01 ? 0 : $fee;
			$orderprice_ = sprintf('%.2f', $orderprice - $fee);
			
            $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $cardnum,$orderprice_);
            $fenXiao = $fenxiaoSource ? $fenxiaoSource :(int)$customfenXiao;

            //分销金额
            $_fenxiaoAmount = $orderprice;
            if($cfg_fenxiaoState && $fenXiao) {

                //商家承担
                if ($cfg_fenxiaoSource) {

                    $orderprice_ = $orderprice_ - $fenxiaoparamarr['totalAmount'];

                    //平台承担
                }
            }
            
            //查询一共分销了多少佣金
            $fenxiaoTotalPrice = 0;
            $_title = '团购消费券，订单号：' . $cardnum;
            $fenxiaomoneysql = $dsql->SetQuery("SELECT  `amount`  FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'tuan' group by `uid` ");
            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
            if($fenxiaomonyeres){
                $amountsum = array();
                foreach ( $fenxiaomonyeres as $item=>$vv) {
                    $amountsum[] += $vv['amount'];
                }
                $fenxiaoTotalPrice = array_sum($amountsum);
            }
            
            $orderprice_ = $orderprice_ - $fenxiaoTotalPrice;

			$sql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ". $uid);
			$ret = $dsql->dsqlOper($sql, "results");
			if(!$ret) die('{"state": 200, "info": '.json_encode("商家不存在，无法继续退款！").'}');
			if($ret[0]['money'] < $orderprice_) die('{"state": 200, "info": '.json_encode("商家帐户余额不足，请先充值！").'}');


			//从商家帐户减去相应金额
			$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$orderprice_' WHERE `id` = '$uid'");
			$dsql->dsqlOper($archives, "update");

			$pay_name = '';
        	$paramUser = array(

                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $orderid
            );
            $urlParam = serialize($paramUser);

            $tuikuan= array(
            	'paytype' 				=> '余额',
            	'truemoneysy'			=> 0,
            	'money_amount'  		=> $orderprice_,
            	'point'					=> 0,
            	'refrunddate'			=> 0,
            	'refrundno'				=> 0
            );
            global  $userLogin;
        	$tuikuanparam = serialize($tuikuan);
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money =  sprintf('%.2f',($usermoney - $orderprice_));
			//保存操作日志
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`balance`) VALUES ('$uid', '0', '$orderprice_', '撤消团购券：$cardnum', '$now','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','1','$usermoney')");
			$dsql->dsqlOper($archives, "update");
            //扣除佣金记录并且扣除分站佣金
            $cityid = $user['cityid'];
            //分站佣金
            $fzFee = cityCommission($cityid,'tuan');
            global $cfg_tuanFee;
            $fztotalAmount_ = $fee * (float)$fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

            //查询分站活的佣金/平台

            $fzsql = $dsql->SetQuery("SELECT `id`,`cityid`,`commission`,`platform` FROM `#@__member_money` WHERE `ordernum` LIKE '%" . $ordernum . "%' AND `ordertype` = 'tuan' AND `showtype` = 1");
            $fzres = $dsql->dsqlOper($fzsql, "results");

            if (!empty($fzres) && is_array($fzres)) {
                $id         = $fzres[0]['id'];
                $cityid     = $fzres[0]['cityid'];
                $commission = $fzres[0]['commission'];
                $platform = $fzres[0]['platform'];

                $fztotalAmount_ = $commission - $fztotalAmount_;
                //扣除退款的佣金
                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$commission' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");

                //分站余额
                $sql = $dsql->SetQuery("SELECT `money`  FROM `#@__site_city` WHERE  `cid` = '$cityid'");
                $resmoney = $dsql->dsqlOper($sql, "results");
                $submoney = $resmoney[0]['money'];          // 分站余额
//                //记录更新
//                $fzmoney = $dsql->SetQuery("UPDATE `#@__member_money` SET `commission` = `commission` - '$commission' WHERE `id` = '$id'");
//                $dsql->dsqlOper($fzmoney, "update");
//                //平台保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`platform`,`balance`,`showtype`,`commission`,`substation`,`cityid`) VALUES ('$uid', '0', '$orderprice_', '撤消团购券：$cardnum', '$now','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','1','$platform','$usermoney','1','$commission','$submoney','$cityid')");
                $dsql->dsqlOper($archives, "update");
            }
            //退回分销的钱
            $tuifenxiao = tuiFenXiao($ordernum,'tuan',$urlParam,$tuikuanparam);

			//将团购券状态更改为未使用
			$sql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `usedate` = 0 WHERE `id` = '$val'");
			$dsql->dsqlOper($sql, "update");

			//更新订单状态
			$sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 1 WHERE `id` = ".$orderid);
			$dsql->dsqlOper($sql, "update");

			//增加消费会员的冻结金额
			$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$orderprice' WHERE `id` = '$userid'");
			$dsql->dsqlOper($archives, "update");

        	$pay_name = '';
        	$paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "shop",
                "id"       => $orderid
            );
            $urlParam = serialize($paramUser);

            $tuikuan= array(
            	'paytype' 				=> '余额',
            	'truemoneysy'			=> 0,
            	'money_amount'  		=> $orderprice,
            	'point'					=> 0,
            	'refrunddate'			=> 0,
            	'refrundno'				=> 0
            );
        	$tuikuanparam = serialize($tuikuan);
            $user  = $userLogin->getMemberInfo($userid);
            $usermoney = $user['freeze'];
			//保存操作日志
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$orderprice', '团购券撤消后冻结：$cardnum', '$now','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','$usermoney')");
			$dsql->dsqlOper($archives, "update");
		}

	}
	adminLog("取消登记消费团购券", $id);
	echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
    //css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/tuan/tuanQuanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
