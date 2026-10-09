<?php
/**
 * 服务码管理
 *
 * @version        $Id: homemakingQuanList.php 2019-4-16 下午16:27:16 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingQuanList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingQuanList.html";

$action = "homemakingquan";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where .= getCityFilter('l.`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('l.`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND (q.`cardnum` like '%$sKeyword%' OR o.`ordernum` like '%$sKeyword%' OR l.`title` like '%$sKeyword%')";
	}

    if($start != ""){
        $where .= " AND q.`carddate` >= ". GetMkTime($start);
    }

    if($end != ""){
        $where .= " AND q.`carddate` <= ". GetMkTime($end);
    }

	$archives = $dsql->SetQuery("SELECT q.`id` FROM `#@__".$action."` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` WHERE 1 = 1".$where);
	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//可使用
	$effective = $dsql->dsqlOper($archives." AND q.`usedate` = 0 AND (q.`expireddate` = 0 OR q.`expireddate` >= ".GetMkTime(time()).")", "totalCount");
	//已过期
	$expired = $dsql->dsqlOper($archives." AND q.`usedate` = 0 AND q.`expireddate` < ".GetMkTime(time()), "totalCount");
	//已消费
	$spend = $dsql->dsqlOper($archives." AND q.`usedate` != 0", "totalCount");

	if($state != ""){
		if($state == 0){
			$where .= " AND q.`usedate` = 0 AND (q.`expireddate` = 0 OR q.`expireddate` >= ".GetMkTime(time()).")";
			$totalPage = ceil($effective/$pagestep);

		}elseif($state == 1){
			$where .= " AND q.`usedate` = 0 AND q.`expireddate` < ".GetMkTime(time());
			$totalPage = ceil($expired/$pagestep);

		}elseif($state == 2){
			$where .= " AND q.`usedate` != 0";
			$totalPage = ceil($spend/$pagestep);

		}

	}

	$where .= " order by q.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT q.`id`, q.`orderid`, q.`cardnum`, q.`carddate`, q.`usedate`, q.`expireddate` FROM `#@__".$action."` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["cardnum"] = $value["cardnum"];
			$list[$key]["carddate"] = $value["carddate"];
			$list[$key]["usedate"] = date('Y-m-d H:i:s', $value["usedate"]);
			//$list[$key]["expireddate"] = $value["expireddate"] == 0 ? "无期限" : date('Y-m-d', $value["expireddate"]);
          	$list[$key]["expireddate"] = $value["expireddate"];

			if($value["usedate"] == 0){
				if($value["expireddate"] == 0 || $value["expireddate"] >= GetMkTime(time())){
					$list[$key]["state"] = 0;
				}else{
					$list[$key]["state"] = 0;
				}
			}else{
				$list[$key]["state"] = 2;
			}

			$list[$key]["orderid"] = $value["orderid"];

			//家政订单
			$orderSql = $dsql->SetQuery("SELECT `ordernum`, `proid`, `orderdate`, `orderprice` FROM `#@__homemaking_order` WHERE `id` = ". $value["orderid"]);
			$orderResult = $dsql->dsqlOper($orderSql, "results");
			if(count($orderResult) > 0){
				$list[$key]["ordernum"] = $orderResult[0]['ordernum'];
				$list[$key]["orderdate"] = date('Y-m-d H:i:s', $orderResult[0]['orderdate']);
				$list[$key]["orderprice"] = sprintf("%.2f", $orderResult[0]["orderprice"]);
				$proid = $orderResult[0]['proid'];
			}else{
				$list[$key]["ordernum"] = "未知";
				$list[$key]["orderdate"] = "";
				$list[$key]["orderprice"] = "";
				$proid = 0;
			}

			$list[$key]["proid"] = $proid;

			//家政商品
			$proSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_list` WHERE `id` = ". $proid);
			$proname = $dsql->dsqlOper($proSql, "results");
			if(count($proname) > 0){
				$list[$key]["proname"] = $proname[0]['title'];
			}else{
				$list[$key]["proname"] = "未知";
			}

			$param = array(
				"service" => "homemaking",
				"template" => "detail",
				"id" => $proid
			);
			$list[$key]['prourl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}, "homemakingQuanList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}}';
	}
	die;

//登记
}elseif($dopost == "reg"){
	if(!testPurview("homemakingQuanOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each  = explode(",", $id);
	$error = array();
	$now   = GetMkTime(time());

	foreach($each as $val){
		$updateSql = $dsql->SetQuery("UPDATE `#@__homemakingquan` SET `usedate` = ".GetMkTime(time())." WHERE `id` = ".$val." AND `usedate` = 0");
		$dsql->dsqlOper($updateSql, "update");

		//查询订单信息
		$sql = $dsql->SetQuery("SELECT q.`orderid`, o.`orderprice`, o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`ordernum`,l.`title`, s.`userid` as uid FROM `#@__homemakingquan` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE q.`id` = ".$val);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$orderid    = $ret[0]['orderid'];
			$ordernum   = $ret[0]['ordernum'];
			$uid        = $ret[0]['uid'];

			$procount   = $ret[0]['procount'];   //数量
			$orderprice = $ret[0]['orderprice']; //单价
			$balance    = $ret[0]['balance'];    //余额金额
			$payprice   = $ret[0]['payprice'];   //支付金额
			$userid     = $ret[0]['userid'];     //买家ID
			$title		= $ret[0]['title'];


			//如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
			$ret = $dsql->dsqlOper($sql, "results");
            $pid = '';
			if($ret){
				$pid 			= $ret[0]['id'];
			}
			$totalPayPrice = $balance + $payprice;
			if($totalPayPrice > 0){

				//减去消费会员的冻结金额
				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
				$dsql->dsqlOper($archives, "update");

				 $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $orderid
                );
				 global  $userLogin;

                $urlParam = serialize($paramUser);
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $money  = sprintf('%.2f',($usermoney-$totalPayPrice));
                $title_ = '家政消费';
				//保存操作日志
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPayPrice', '家政券消费：$orderid', '$now','homemaking','xiaofei','$pid','$urlParam','$title_','$ordernum','$money')");
				$dsql->dsqlOper($archives, "update");

			}

			//扣除佣金
			global $cfg_homemakingFee;
			global $userLogin;
			$cfg_homemakingFee = (float)$cfg_homemakingFee;

			$fee = $orderprice * $cfg_homemakingFee / 100;
			$fee = $fee < 0.01 ? 0 : $fee;
			$orderprice_ = sprintf('%.2f', $orderprice - $fee);

			//将费用转至商家帐户
			$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$orderprice_' WHERE `id` = '$uid'");
			$dsql->dsqlOper($archives, "update");

			//保存操作日志
			$paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "homemaking",
                "id"       => $orderid
            );
            $urlParam = serialize($paramBusi);
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money  = sprintf('%.2f',($usermoney+$orderprice_));
            $title_ = '家政消费';
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$orderprice_', '家政券消费-".$title."：$orderid', '$now','homemaking','shangpinxiaoshou','$pid','$urlParam','$title_','$ordernum','$usermoney')");
			$dsql->dsqlOper($archives, "update");


			//更新订单状态，如果券都用掉了，就更新订单状态为已使用
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemakingquan` WHERE `orderid` = (SELECT `orderid` FROM `#@__homemakingquan` WHERE `id` = ".$val.") AND `usedate` = 0");
			$ret = $dsql->dsqlOper($sql, "totalCount");
			if($ret == 0){
				$sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 4, `ret-state` = 0 WHERE `id` = '$orderid'");
				$dsql->dsqlOper($sql, "update");
			}

		}

	}
	adminLog("消费登记家政服务码", $id);
	echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	die;

//取消登记
}elseif($dopost == "cangelreg"){
	if(!testPurview("homemakingQuanOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each  = explode(",", $id);
	$error = array();
	$now   = GetMkTime(time());
	foreach($each as $val){

		$archives = $dsql->SetQuery("SELECT q.`cardnum`, q.`orderid`, o.`ordernum`,o.`orderprice`, o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`,  s.`userid` as uid FROM `#@__homemakingquan` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE q.`id` = ".$val);
		$results  = $dsql->dsqlOper($archives, "results");
		if($results){

			$orderid    = $results[0]['orderid'];
			$ordernum   = $results[0]['ordernum'];
			$cardnum    = $results[0]['cardnum'];
			$uid        = $results[0]['uid'];

			$procount   = $results[0]['procount'];   //数量
			$orderprice = $results[0]['orderprice']; //单价
			$balance    = $results[0]['balance'];    //余额金额
			$payprice   = $results[0]['payprice'];   //支付金额
			$userid     = $results[0]['userid'];     //买家ID

			//扣除佣金
			global $cfg_homemakingFee;
			$cfg_homemakingFee = (float)$cfg_homemakingFee;

			$fee = $orderprice * $cfg_homemakingFee / 100;
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
                "id"       => $orderid
            );

            $urlParam = serialize($paramUser);
            $tuikuan  = array(
            	'paytype' 				=> '余额',
            	'truemoneysy'			=> 0,
            	'money_amount'  		=> $orderprice,
            	'point'					=> 0,
            	'refrunddate'			=> 0,
            	'refrundno'				=> 0
            );
            global  $userLogin;
            $tuikuanparam = serialize($tuikuan);
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money  = sprintf('%.2f',($usermoney-$orderprice_));

            //保存操作日志
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`balance`) VALUES ('$uid', '0', '$orderprice_', '撤消家政券：$cardnum', '$now','homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','1','$usermoney')");
			$dsql->dsqlOper($archives, "update");

			//将家政券状态更改为未使用
			$sql = $dsql->SetQuery("UPDATE `#@__homemakingquan` SET `usedate` = 0 WHERE `id` = '$val'");
			$dsql->dsqlOper($sql, "update");

			//更新订单状态
			$sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 2 WHERE `id` = ".$orderid);
			$dsql->dsqlOper($sql, "update");

        	$pay_name = '';
        	$paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "homemaking",
                "id"       => $orderid
            );
            $urlParam = serialize($paramUser);
            $tuikuan  = array(
            	'paytype' 				=> '余额',
            	'truemoneysy'			=> 0,
            	'money_amount'  		=> $orderprice,
            	'point'					=> 0,
            	'refrunddate'			=> 0,
            	'refrundno'				=> 0
            );
            $tuikuanparam = serialize($tuikuan);
			//增加消费会员的冻结金额
			$archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$orderprice' WHERE `id` = '$userid'");
			$dsql->dsqlOper($archives, "update");
            $user  = $userLogin->getMemberInfo($userid);
            $usermoney = $user['freeze'];
//            $money  = sprintf('%.2f',($usermoney+$orderprice));

            //保存操作日志
			$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$orderprice', '家政券撤消后冻结：$cardnum', '$now','homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$usermoney')");
			$dsql->dsqlOper($archives, "update");
		}

	}
	adminLog("取消登记消费家政服务码", $id);
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
		'admin/homemaking/homemakingQuanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
