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
checkPurview("shopProQuanList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopProQuanList.html";

$action = "shopquan";

if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('store.`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }

    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__shop_store` store WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    $w = ' AND o.`protype` = 1';
    if(!empty($sidArr)){
        $w .= " AND l.`store` in (".join(",",$sidArr).")";
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

    $orderSql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum` FROM `#@__shop_order` o LEFT JOIN `#@__shop_order_product` op ON o.`id` = op.`orderid` LEFT JOIN `#@__shop_product` l ON l.`id` = op.`proid` WHERE 1=1 ".$w);

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
		}else{
		    $where = " AND 1 = 2";
		}
	}
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);
	//总条数
	$totalCount = $dsql->dsqlOper($archives." GROUP BY `cardnum`", "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//可使用
	$effective = $dsql->dsqlOper($archives." AND `usedate` = 0 AND (`expireddate` = 0 OR `expireddate` >= ".GetMkTime(time()).") GROUP BY `cardnum`", "totalCount");
	//已过期
	$expired = $dsql->dsqlOper($archives." AND `usedate` = 0 AND `expireddate` < ".GetMkTime(time()) . " GROUP BY `cardnum`", "totalCount");
	//已消费
	$spend = $dsql->dsqlOper($archives." AND `usedate` != 0 GROUP BY `cardnum`", "totalCount");
	//已作废
    $state3sql= $dsql->SetQuery("SELECT o.`id`, o.`ordernum` FROM `#@__shop_order` o RIGHT JOIN `#@__shopquan` l ON l.`orderid` = o.`id` WHERE orderstate=7".$where );
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
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`orderid`, l.`cardnum`, l.`carddate`, l.`usedate`, l.`expireddate`,l.`proid`, o.`ordernum`,o.`orderstate` FROM `#@__shopquan`l LEFT JOIN `#@__shop_order` o  ON l.`orderid` = o.`id` WHERE orderstate= 7".$where);
        $results = $dsql->dsqlOper($archives, "results");
    }else{
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`orderid`, l.`cardnum`, l.`carddate`, l.`usedate`, l.`expireddate`,l.`proid`, o.`ordernum`,o.`orderstate` FROM `#@__shopquan`l LEFT JOIN `#@__shop_order` o  ON l.`orderid` = o.`id` WHERE 1= 1".$where);
        $results = $dsql->dsqlOper($archives, "results");
    }
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
            $list[$key]["id"]          = $value["id"];
            $list[$key]["proid"]       = $value["proid"];
            $list[$key]["cardnum"]     = $value["cardnum"];
            $list[$key]["carddate"]    = $value["carddate"];
            $list[$key]["usedate"]     = date('Y-m-d H:i:s', $value["usedate"]);
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
            if ($value['orderstate'] == 7 && $value['usedate'] == 0){
                    $list[$key]["state"] = 3;
            }
			$list[$key]["orderid"] = $value["orderid"];
			//团购订单
			$orderSql = $dsql->SetQuery("SELECT `ordernum`, `orderdate`, `amount` FROM `#@__shop_order` WHERE `id` = ". $value["orderid"]);

			$orderResult = $dsql->dsqlOper($orderSql, "results");
			if(count($orderResult) > 0){
				$list[$key]["ordernum"] = $orderResult[0]['ordernum'];
				$list[$key]["orderdate"] = date('Y-m-d H:i:s', $orderResult[0]['orderdate']);
				$list[$key]["orderprice"] = sprintf("%.2f", $orderResult[0]["amount"]);
//				$proid = $orderResult[0]['proid'];
			}else{
				$list[$key]["ordernum"] = "未知";
				$list[$key]["orderdate"] = "";
				$list[$key]["orderprice"] = "";
				$proid = 0;
			}

			$list[$key]["proid"] = $value["proid"];

			//团购商品
			$proSql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_product` WHERE `id` = ". $value["proid"]);
			$proname = $dsql->dsqlOper($proSql, "results");
			if(count($proname) > 0){
				$list[$key]["proname"] = $proname[0]['title'];
			}else{
				$list[$key]["proname"] = "未知";
			}

			$param = array(
				"service" => "shop",
				"template" => "detail",
				"id" => $value["proid"]
			);
			$list[$key]['prourl'] = getUrlPath($param);
		}

		if(count($list) > 0){
            if($do != "export") {
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.', "state3": '.$state3.'}, "tuanQuanList": '.json_encode($list).'}';
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

        $tablename = "商城券";
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
        $fileName = date('Y-m-d H:i:s', time()).'--商城券';
        $fileName = iconv("UTF-8", "GB2312//IGNORE", $fileName);
        header('Content-Type: application/vnd.ms-execl');
        header('Content-Disposition: attachment;filename="' . $fileName . '.csv"');

        $fp = fopen('php://output', 'a');
        $title = array('券号', '有效期','状态', '订单编号', '购买时间', '订单金额', '商品信息');
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
            if ($data['ordernum'] == '未知'){
                $data['ordernum'] = iconv('UTF-8', 'GBK//IGNORE', $data['ordernum']);
            }else{
                $data['ordernum'] = $data['ordernum']."\t";
            }
            $data['cardnum'] = $data['cardnum']."\t";
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
	    $quansql =  $dsql->SetQuery( "SELECT `cardnum`,`usedate`,`proid`,`orderid` FROM `#@__shopquan` WHERE `id` = '".$val."'");
	    $quanres =  $dsql ->dsqlOper($quansql, "results");
        $cardnum = $proid = $orderid = '';

        $totalMoney = 0;
	    if($quanres && is_array($quanres)){
	        if($quanres[0]['usedate'] > 0) {
                $error[] = $val;
                continue;
            }
	        $cardnum = $quanres[0]['cardnum'];
            $proid   = $quanres[0]['proid'];
            $orderid = $quanres[0]['orderid'];
        }else{
            $error[] = $val;
            continue;
        }
//		$updateSql = $dsql->SetQuery("UPDATE `#@__shopquan` SET `usedate` = ".GetMkTime(time())." WHERE `id` = ".$val." AND `usedate` = 0 AND (`expireddate` = 0 OR `expireddate` >= ".GetMkTime(time()).")");
        $updateSql = $dsql->SetQuery("UPDATE `#@__shopquan` SET `usedate` = '$now' WHERE `id` = '$val'");
        $results = $dsql->dsqlOper($updateSql, "update");
        if($results != "ok"){
            $error[] = $val;
            continue;
        }

		//查询订单信息
		$sql = $dsql->SetQuery("SELECT q.`orderid`,q.`proid`,o.`id`, o.`userid`, o.`balance`, o.`payprice`, o.`ordernum`,o.`shopFee`,o.`huodongtype`,o.`peerpay`, s.`userid` uid ,s.`cityid`,o.`priceinfo` FROM `#@__shopquan` q LEFT JOIN `#@__shop_order` o ON o.`id` = q.`orderid`  LEFT JOIN `#@__shop_store` s ON o.`store` = s.`id` WHERE q.`id` = ".$val);

		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$orderid    = $ret[0]['orderid'];
			$oid        = $ret[0]['id'];
			$ordernum   = $ret[0]['ordernum'];
			$uid        = $ret[0]['uid'];
			$shopFee    = $ret[0]['shopFee'];
			$proid      = $ret[0]['proid'];
			$peerpay    = $ret[0]['peerpay'];
			$huodongtype= $ret[0]['huodongtype'];
            $cityid     = $ret[0]['cityid'];
            $userid     = $ret[0]['userid'];

            $priceinfo  = $ret[0]['priceinfo'];   //消费信息

            $priceinfo  = $priceinfo != '' ? unserialize($priceinfo) : array() ;
            $quan  = 0;
            foreach ($priceinfo as $k => $v) {
                if($v['type'] == 'quan'){
                    $quan      = $v['amount'];
                }
            }
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__shopquan` WHERE `orderid` = (SELECT `orderid` FROM `#@__shopquan` WHERE `id` = '$val') AND `usedate` = 0");
            $ret = $dsql->dsqlOper($sql, "totalCount");
            if ($ret == 0) {
                $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 3, `ret_state` = 0 WHERE `id` = '$orderid'");
                $dsql->dsqlOper($sql, "update");
            }


            $orderpricesql = $dsql->SetQuery("SELECT `price` FROM `#@__shop_order_product` WHERE `orderid` = $orderid AND `proid` = '$proid'");

            $orderpriceres = $dsql->dsqlOper($orderpricesql,"results");


			$orderprice = (float)$orderpriceres[0]['price']; //单价

            global $cfg_shopFee;
            global $cfg_fzshopFee;
            $cfg_shopFee   = !empty((float)$shopFee) ? (float)$shopFee : (float)$cfg_shopFee;
            $cfg_fzshopFee = (float)$cfg_fzshopFee;

            $fee = $orderprice * $cfg_shopFee / 100;
            $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
            $fee = $fee < 0.01 ? 0 : $fee;

            $amount_ = sprintf('%.2f', $orderprice - $fee);


            //获取transaction_id
            $transaction_id = $_ordernum = '';
            $sql            = $dsql->SetQuery("SELECT `transaction_id`, `ordernum`,`id`,`amount` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
            $ret            = $dsql->dsqlOper($sql, "results");
            $truepayprice   = 0;
            if ($ret) {
                $truepayprice   = $ret[0]['amount'];
                $transaction_id = $ret[0]['transaction_id'];
                $_ordernum      = $ret[0]['ordernum'];
                $pid            = $ret[0]['id'];
            }

            //分销信息
            global $cfg_fenxiaoState;
            global $cfg_fenxiaoSource;
            global $cfg_fenxiaoDeposit;
            global $cfg_fenxiaoAmount;
            include HUONIAOINC . "/config/shop.inc.php";
            $fenXiao = (int)$customfenXiao;
            //分销金额
            if ($cfg_fenxiaoState && $fenXiao) {

                $fenxiaoparamarr = fenXiaoMoneyCalculation('shop', $ordernum);
                $fx_reward_ratio = $fenxiaoparamarr['product'][0]['fx_reward_ratio'];
                //分销金额（处理%）
                if (strstr($fx_reward_ratio, '%')) {
                    $fx_reward_ratio = $fee * (float)$fx_reward_ratio /   100;
                }
                $fx_reward_ratio = $fx_reward_ratio < 0.01 ? 0 : $fx_reward_ratio;
                $fenxiaoparamarr['amount'] = $fx_reward_ratio;
                $fenxiaoTotalPrice = $fx_reward_ratio;
                (new member())->returnFxMoney("shop", $userid, $ordernum, $fenxiaoparamarr);
                //查询一共分销了多少佣金
                $_title = '商城订单号，订单号：' . $ordernum;
                if(!$cfg_fenxiaoDeposit){
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'shop'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
                }
                //商家承担
                if ($cfg_fenxiaoSource) {
                    $amount_ = $amount_ -  $fenxiaoTotalPrice;
                    $bearfenyong = 2;
                }
                //平台承担
                else {
                    $fee  = $fee - $fenxiaoTotalPrice;
                    $bearfenyong = 1;
                }
            }

            $amount_ = $amount_ < 0.01 ? 0 : $amount_;

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '$uid'");
            $dsql->dsqlOper($archives, "update");
            $now = GetMkTime(time());

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "shop",
                "id"       => $id
            );
            global $userLogin;
            $urlParam  = serialize($paramBusi);
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];

            $amount_ -= $quan;
            //商家收入
            $title    = '商城店铺收入-' . $shopname;
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$amount_', '商城商品券订单收入：$ordernum', '$now','shop','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$usermoney')");

            $dsql->dsqlOper($archives, "update");
            //分站佣金
            $fzFee = cityCommission($cityid,'shop');
            //分站
            $fztotalAmount_ = $fee * (float)$fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
            $fee-=$fztotalAmount_;//总站-=分站
            $cityName = getSiteCityName($cityid);

            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
            //保存操作日志
            $now      = GetMkTime(time());
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$orderprice', '商城商品券订单：$ordernum', '$now','$cityid','$fztotalAmount_','shop',$fee,'1','shangpinxiaoshou','$usermoney')");
//            $dsql->dsqlOper($archives, "update");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);

            //工行E商通银行分账
            if ($transaction_id) {
                if ($truepayprice <= 0) {
                    $truepayprice = $amount_;
                }
                rfbpShareAllocation(array(
                    "uid"               => $uid,
                    "ordertitle"        => "商城订单收入",
                    "ordernum"          => $_ordernum,
                    "orderdata"         => array(),
                    "totalAmount"       => $orderprice,
                    "amount"            => $truepayprice,
                    "channelPayOrderNo" => $transaction_id,
                    "paytype"           => $paytype
                ));
            }


            //返积分
            (new member())->returnPoint("shop", $userid, $orderprice, $ordernum,$amount_,$uid);

            //微信通知
            $param = array(
                'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . '分站——shop模块——分站获得佣金 :' . sprintf("%.2f", $fztotalAmount_),
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );

            $params = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . '分站——shop模块——平台获得佣金 :' . $fee . ' ——分站获得佣金 :' . sprintf("%.2f", $fztotalAmount_),
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("shop", "detail", $param);
            updateAdminNotice("shop", "detail", $params);

            if ($peerpay <= 0) {
                //减去冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$orderprice' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");

                //如果冻结金额小于0，重置冻结金额为0
                $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                $ret      = $dsql->dsqlOper($archives, "results");
                if ($ret) {
                    if ($ret[0]['freeze'] < 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                    }
                }
            }
            //商家会员消息通知
            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "shop",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "title"    => $ordernum,
                "amount"   => $amount,
                "fields"   => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '下单时间',
                    'keyword3' => '订单金额',
                    'keyword4' => '订单状态'
                )
            );

            updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config, '', '', 0, 1);

		}

	}
    if(!empty($error)){
        echo '{"state": 200, "info": '.json_encode($error).'}';die;
    }else {
        adminLog("消费登记商城券", $id);
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

		$archives = $dsql->SetQuery("SELECT q.`cardnum`,q.`proid`, q.`orderid`, o.`orderprice`,o.`ordernum`,o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`propolic`,o.`shopFee`, s.`uid` FROM `#@__shopquan` q LEFT JOIN `#@__shop_order` o ON o.`id` = q.`orderid`  LEFT JOIN `#@__tuan_store` s ON o.`store` = s.`id` WHERE q.`id` = ".$val);

		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$orderid    = $results[0]['orderid'];
			$cardnum    = $results[0]['cardnum'];
			$ordernum   = $results[0]['ordernum'];
			$uid        = $results[0]['uid'];
			$shopFee    = $results[0]['shopFee'];
			$proid      = $results[0]['proid'];

			$procount   = $results[0]['procount'];   //数量

            $orderpricesql = $dsql->SetQuery("SELECT `price` FROM `#@__shop_order_product` WHERE `orderid` = '$orderid' AND `proid` = '$proid'");

            $orderpriceres = $dsql->dsqlOper($orderpricesql,"results");


            $orderprice = (float)$orderpriceres[0]['price']; //单价
			$orderprice = $results[0]['orderprice']; //单价
			$balance    = $results[0]['balance'];    //余额金额
			$payprice   = $results[0]['payprice'];   //支付金额
			$userid     = $results[0]['userid'];     //买家ID

			//扣除佣金
			global $cfg_tuanFee;
			$cfg_tuanFee = !empty((float)$shopFee)? (float)$shopFee :(float)$cfg_tuanFee;

			$fee = $orderprice * $cfg_tuanFee / 100;
			$fee = $fee < 0.01 ? 0 : $fee;
			$orderprice_ = sprintf('%.2f', $orderprice - $fee);

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
			//保存操作日志
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`balance`) VALUES ('$uid', '0', '$orderprice_', '撤消团购券：$cardnum', '$now','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','1','$usermoney')");
			$dsql->dsqlOper($archives, "update");

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
		'admin/shop/shopProQuanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
