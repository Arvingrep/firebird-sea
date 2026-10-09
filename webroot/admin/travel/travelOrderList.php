<?php
/**
 * 管理景点门票订单
 *
 * @version        $Id: travelOrderList.php 2019-6-15 下午21:11:13 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$typeid = $typeid ? $typeid : 1;
checkPurview("travelOrderList".$typeid);
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelOrderList.html";

$action = "travel_order";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `type` = '$typeid'";

    $where2 = getCityFilter('store.`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }

    $sidArr = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id  FROM `#@__travel_store` store WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if(!empty($sidArr)){
        $where3 = " AND `company` in (".join(",",$sidArr).")";
    }else{
        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
	}

	if($typeid==1){
		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_ticket` WHERE 1=1".$where3);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where4 = " AND `ticketid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}

		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_ticketinfo` WHERE `typeid` = 0 ".$where4);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where .= " AND `proid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}
	}elseif($typeid==2){
		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_agency` WHERE 1=1".$where3);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where4 = " AND `ticketid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}

		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_ticketinfo` WHERE `typeid` = 1 ".$where4);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where .= " AND `proid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}
	}elseif($typeid==3){
		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_hotel` WHERE 1=1".$where3);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where4 = " AND `hotelid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}

		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_hotelroom` WHERE 1=1 ".$where4);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where .= " AND `proid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}
	}elseif($typeid==4){
		$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_visa` WHERE 1=1".$where3);
		$proResult = $dsql->dsqlOper($proSql, "results");
		if($proResult){
			$proid = array();
			foreach($proResult as $key => $pro){
				array_push($proid, $pro['id']);
			}
			if(!empty($proid)){
				$where .= " AND `proid` in (".join(",", $proid).")";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}
		}
	}

	if($sKeyword != ""){

		$where .= " AND (`ordernum` like '%$sKeyword%'";

		if($typeid==1){
			$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_ticketinfo` WHERE `typeid` = 0 and `title` like '%$sKeyword%' ".$where4);
			$proResult = $dsql->dsqlOper($proSql, "results");
			if($proResult){
				$proid = array();
				foreach($proResult as $key => $pro){
					array_push($proid, $pro['id']);
				}
				if(!empty($proid)){
					$where .= " OR `proid` in (".join(",", $proid).")";
				}
			}
		}elseif($typeid==2){
			$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_ticketinfo` WHERE `typeid` = 1 and `title` like '%$sKeyword%' ".$where4);
			$proResult = $dsql->dsqlOper($proSql, "results");
			if($proResult){
				$proid = array();
				foreach($proResult as $key => $pro){
					array_push($proid, $pro['id']);
				}
				if(!empty($proid)){
					$where .= " OR `proid` in (".join(",", $proid).")";
				}
			}
		}elseif($typeid==3){
			$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_hotelroom` WHERE `title` like '%$sKeyword%' ".$where4);
			$proResult = $dsql->dsqlOper($proSql, "results");
			if($proResult){
				$proid = array();
				foreach($proResult as $key => $pro){
					array_push($proid, $pro['id']);
				}
				if(!empty($proid)){
					$where .= " OR `proid` in (".join(",", $proid).")";
				}
			}
		}elseif($typeid==4){
			$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_visa` WHERE `title` like '%$sKeyword%' ".$where3);
			$proResult = $dsql->dsqlOper($proSql, "results");
			if($proResult){
				$proid = array();
				foreach($proResult as $key => $pro){
					array_push($proid, $pro['id']);
				}
				if(!empty($proid)){
					$where .= " OR `proid` in (".join(",", $proid).")";
				}
			}
		}


		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)) {
                $where .= " OR `userid` in (" . join(",", $userid) . "))";
            }
		}else{
            $where .= " ) ";
        }

	}
	if($start != ""){
		$where .= " AND `orderdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND `orderdate` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未付款
	$state0 = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount");
	//已付款 待使用
	$state1 = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount");
	//交易完成
	$state3 = $dsql->dsqlOper($archives." AND `orderstate` = 3", "totalCount");
	//订单取消
	$state7 = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount");
	//申请退款
	$state8 = $dsql->dsqlOper($archives." AND `orderstate` = 8", "totalCount");
	//退款成功
	$state9 = $dsql->dsqlOper($archives." AND `orderstate` = 9", "totalCount");

	if($state != ""){
		if($state != ""){
			$where = " AND `orderstate` = " . $state;
		}

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($state == 7){
			$totalPage = ceil($state7/$pagestep);
		}elseif($state == 8){
			$totalPage = ceil($state8/$pagestep);
		}elseif($state == 9){
			$totalPage = ceil($state9/$pagestep);
		}
	}

	$where .= " order by `id` desc";
	$totalPrice = 0;

	//计算总价
	$sql = $dsql->SetQuery("SELECT SUM(`orderprice` * `procount`) as price FROM `#@__".$action."` WHERE 1 = 1".$where);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$totalPrice = (float)$ret[0]['price'];
	}

	$totalPrice = sprintf("%.2f", $totalPrice);


	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `type`, `userid`, `proid`, `orderprice`, `procount`, `orderstate`, `ret-state`, `contact`, `orderdate`, `paytype`, `paydate` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["ordernum"] = $value["ordernum"];
			$list[$key]["userid"] = $value["userid"];
			$list[$key]["paydate"] = $value["paydate"];

			//用户名
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value["userid"]);
			$username = $dsql->dsqlOper($userSql, "results");
			if(count($username) > 0){
				$list[$key]["username"] = $username[0]['username'];
			}else{
				$list[$key]["username"] = "未知";
			}

			$list[$key]["proid"] = $value["proid"];

			if($value["type"]==1){//景点
				$proSql = $dsql->SetQuery("SELECT `id`, `title`, `ticketid` FROM `#@__travel_ticketinfo` WHERE `typeid` = 0 and `id` = ". $value["proid"]);
			}elseif($value["type"]==2){//周边游
				$proSql = $dsql->SetQuery("SELECT `id`, `title`, `ticketid` FROM `#@__travel_ticketinfo` WHERE `typeid` = 1 and `id` = ". $value["proid"]);
			}elseif($value["type"]==3){//酒店
				$proSql = $dsql->SetQuery("SELECT `id`, `title`, `hotelid` FROM `#@__travel_hotelroom` WHERE `id` = ". $value["proid"]);
			}elseif($value["type"]==4){//签证
				$proSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_visa` WHERE `id` = ". $value["proid"]);
			}
			$proname = $dsql->dsqlOper($proSql, "results");
			if(count($proname) > 0){
				$list[$key]["proname"] = $proname[0]['title'];
			}else{
				$list[$key]["proname"] = "未知";
			}

			if($value["type"]==1){//景点
				$param = array(
					"service"     => "travel",
					"template"    => "ticket-detail",
					"id"          => $proname[0]['ticketid']
				);
			}elseif($value["type"]==2){//周边游
				$param = array(
					"service"     => "travel",
					"template"    => "agency-detail",
					"id"          => $proname[0]['ticketid']
				);
			}elseif($value["type"]==3){//酒店
				$param = array(
					"service"     => "travel",
					"template"    => "hotel-detail",
					"id"          => $proname[0]['hotelid']
				);
			}elseif($value["type"]==4){//签证
				$param = array(
					"service"     => "travel",
					"template"    => "visa-detail",
					"id"          => $proname[0]['id']
				);
			}
			$list[$key]['prourl'] = getUrlPath($param);

			//计算订单价格
			$price = $value['orderprice'] * $value['procount'];
			$list[$key]["orderprice"] = sprintf("%.2f", $price);

			$list[$key]["orderstate"] = $value["orderstate"];
			$list[$key]["retState"] = $value["ret-state"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["orderdate"] = date('Y-m-d H:i:s', $value["orderdate"]);

			//主表信息
			$sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$value["paytype"]."'");
			$ret = $dsql->dsqlOper($sql, "results");
			if(!empty($ret)){
				$list[$key]["paytype"] = $ret[0]['pay_name'];
			}else{
				$list[$key]["paytype"] = $value["paytype"];
			}
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state7": '.$state7.', "state8": '.$state8.', "state9": '.$state9.'}, "totalPrice": '.$totalPrice.', "travelOrderList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state7": '.$state7.', "state8": '.$state8.', "state9": '.$state9.'}, "totalPrice": '.$totalPrice.'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state3": '.$state3.', "state7": '.$state7.', "state8": '.$state8.', "state9": '.$state9.'}, "totalPrice": '.$totalPrice.'}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("deltravelOrder")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `type`, `userid`, `proid`, `procount`, `orderprice`, `orderstate`, `paydate` FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "results");

		$orderid = $results[0]['id'];
		$ordernum = $results[0]['ordernum'];
		$orderprice = $results[0]['orderprice'];
		$userid = $results[0]["userid"];
		$proid = $results[0]["proid"];
		$procount = $results[0]["procount"];
		$orderstate = $results[0]["orderstate"];
		$paydate = $results[0]['paydate'];
		$type = $results[0]['type'];

		//退款
		if($orderstate != 0 && $orderstate != 9 && $orderstate != 7 && $orderstate != 3){
			//会员信息
			$userSql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ". $userid);
			$userResult = $dsql->dsqlOper($userSql, "results");

			if($userResult){

				//会员帐户充值
				$price = $userResult[0]['money'] + $orderprice * $procount;
				$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
				$dsql->dsqlOper($userOpera, "update");

            	$pay_name = '';
            	$paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "travel",
                    "id"       => $orderid
                );
                $urlParam = serialize($paramUser);

                $tuikuan  = array(
                	'paytype' 				=> '余额',
                	'truemoneysy'			=> 0,
                	'money_amount'  		=> $price,
                	'point'					=> 0,
                	'refrunddate'			=> 0,
                	'refrundno'				=> 0

                );
                global  $userLogin;
                $tuikuanparam = serialize($tuikuan);
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
				//记录退款日志
				$logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$orderprice', '旅游退款：$ordernum', ".GetMkTime(time()).",'travel','tuikuan','$urlParam','$ordernum','$tuikuanparam','商城消费','$usermoney')");
				$dsql->dsqlOper($logs, "update");

			}

			//更新已购买数量
			if($type==1 || $type==2){//景点 周边游
				if($type==1){
					$whereT = " AND `typeid` = 0 AND `id` = '$proid' ";
				}elseif($type==2){
					$whereT = " AND `typeid` = 1 AND `id` = '$proid' ";
				}
				$proSql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
				$dsql->dsqlOper($proSql, "update");
				$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_ticketinfo` WHERE 1=1 $whereT ");
				$pro = $dsql->dsqlOper($sql, "results");
				if($pro[0]['sale']==0){
					$proSql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = 0  WHERE 1=1 $whereT ");
					$dsql->dsqlOper($proSql, "update");
				}
			}elseif($type==3){//酒店
				$whereT = " AND `id` = '$proid' ";
				$proSql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
				$dsql->dsqlOper($proSql, "update");
				$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_hotelroom` WHERE 1=1 $whereT ");
				$pro = $dsql->dsqlOper($sql, "results");
				if($pro[0]['sale']==0){
					$proSql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `sale` = 0  WHERE 1=1 $whereT ");
					$dsql->dsqlOper($proSql, "update");
				}
			}elseif($type==4){//签证
				$whereT = " AND `id` = '$proid' ";
				$proSql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
				$dsql->dsqlOper($proSql, "update");
				$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_visa` WHERE 1=1 $whereT ");
				$pro = $dsql->dsqlOper($sql, "results");
				if($pro[0]['sale']==0){
					$proSql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = 0  WHERE 1=1 $whereT ");
					$dsql->dsqlOper($proSql, "update");
				}
			}

			$archives = $dsql->SetQuery("DELETE FROM `#@__travelquan` WHERE `orderid` = ".$orderid);
			$results = $dsql->dsqlOper($archives, "update");
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除旅游订单", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//付款
}elseif($dopost == "payment"){
	if(!testPurview("refundtravelOrder")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if(!empty($id)){
		$archives = $dsql->SetQuery("SELECT `ordernum`, `type`, `userid`, `proid`, `procount`, `orderprice`, `orderstate`, `walktime` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if($results){
			$ordernum = $results[0]['ordernum'];
			$orderprice = $results[0]['orderprice'];
			$userid = $results[0]["userid"];
			$proid = $results[0]["proid"];
			$procount = $results[0]["procount"];
			$orderstate = $results[0]["orderstate"];
			$type = $results[0]["type"];
			$walktime = $results[0]["walktime"];

			if($orderstate == 0){
				//旅游商品
				$typename = '';
				if($type==1){//景点门票
					$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid FROM `#@__travel_ticketinfo` l LEFT JOIN `#@__travel_ticket` s ON s.`id` = l.`ticketid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`typeid` = 0 and l.`id` = ". $proid);
					$proname = $dsql->dsqlOper($proSql, "results");
					$typename = '景点门票';
				}elseif($type==2){//周边游
					$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid  FROM `#@__travel_ticketinfo` l LEFT JOIN `#@__travel_agency` s ON s.`id` = l.`ticketid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`typeid` = 1 and l.`id` = ". $proid);
					$proname = $dsql->dsqlOper($proSql, "results");
					$typename = '周边游';
				}elseif($type==3){//酒店
					$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid  FROM `#@__travel_hotelroom` l LEFT JOIN `#@__travel_hotel` s ON s.`id` = l.`hotelid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`id` = ". $proid);
					$proname = $dsql->dsqlOper($proSql, "results");
					$typename = '酒店';
				}elseif($type==4){//签证
					$proSql = $dsql->SetQuery("SELECT l.`title`, s.`userid` uid FROM `#@__travel_visa` l LEFT JOIN `#@__travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ". $proid);
					$proname = $dsql->dsqlOper($proSql, "results");
					$typename = '签证';
				}
				if(!$proname){
					echo '{"state": 200, "info": '.json_encode("商品不存在，付款失败！").'}';
					die;
				}
				$title     = $proname[0]['title'];
				$uid       = $proname[0]['uid'];

				$orderprice = $orderprice * $procount;

				//会员信息
				$userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
				$userResult = $dsql->dsqlOper($userSql, "results");

				if($userResult){

					if($userResult[0]['money'] > $orderprice){
						//扣除会员帐户
						$price = $userResult[0]['money'] - $orderprice;
						$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
						$dsql->dsqlOper($userOpera, "update");

						//记录消费日志
						$paramUser = array(
							"service"  => "member",
							"type"     => "user",
							"template" => "orderdetail",
							"action"   => "travel",
							"id"       => $id
						);
						$urlParam = serialize($paramUser);

						$sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
						$ret = $dsql->dsqlOper($sql, "results");
                        $pid ='';
						if($ret){
							$pid 			= $ret[0]['id'];
						}
						global  $userLogin;
                        $user  = $userLogin->getMemberInfo($userid);
                        $usermoney = $user['money'];
						$title = "旅游频道消费-".$typename;
						$logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES (".$userid.", ".$orderprice.", 0, '旅游消费：".$ordernum."', ".GetMkTime(time()).",'travel','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
						$dsql->dsqlOper($logs, "update");

						//更新旅游已购买数量
						if($type==1 || $type==2){//景点门票 周边游
							$sql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = `sale` + $procount WHERE `id` = '$proid'");
							$dsql->dsqlOper($sql, "update");
						}elseif($type==3){
							$sql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `sale` = `sale` + $procount WHERE `id` = '$proid'");
							$dsql->dsqlOper($sql, "update");
						}elseif($type==4){
							$sql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = `sale` + $procount WHERE `id` = '$proid'");
							$dsql->dsqlOper($sql, "update");
						}

						//更新订单状态
						$orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `balance` = '$orderprice', `orderstate` = 1, `paydate` = ".GetMkTime(time())." WHERE `id` = ". $id);
						$dsql->dsqlOper($orderOpera, "update");

						//生成旅游券
						$sqlQuan = array();
						$carddate = GetMkTime(time());
						//for ($i = 0; $i < $procount; $i++) {
							$cardnum = genSecret(12, 1);
							$sqlQuan[$i] = "('$id', '$cardnum', '$carddate', 0, '$walktime')";
						//}

						$sql = $dsql->SetQuery("INSERT INTO `#@__travelquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES ".join(",", $sqlQuan));
						$dsql->dsqlOper($sql, "update");


						//支付成功，会员消息通知
						$paramBusi = array(
							"service"  => "member",
							"template" => "orderdetail",
							"action"   => "travel",
							"id"       => $id
						);

						updateMemberNotice($userid, "会员-订单支付成功", $paramUser, array("username" => $userResult[0]['username'], "order" => $ordernum, "amount" => $orderprice),'','',0,1);


						//获取会员名
						$username = "";
						$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
						$ret = $dsql->dsqlOper($sql, "results");
						if($ret){
							$username = $ret[0]['username'];
						}
						updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, array("username" => $username, "title" => $title, "order" => $ordernum, "amount" => $amount),'','',0,1);


						adminLog("为会员手动支付旅游订单", $ordernum);

						echo '{"state": 100, "info": '.json_encode("付款成功！").'}';
						die;

					}else{
						echo '{"state": 200, "info": '.json_encode("会员帐户余额不足，请先进行充值！").'}';
						die;
					}

				}else{
					echo '{"state": 200, "info": '.json_encode("会员不存在，无法继续支付！").'}';
					die;
				}

			}else{
				echo '{"state": 200, "info": '.json_encode("此订单不是未付款状态，请确认后操作！").'}';
				die;
			}
		}else{
			echo '{"state": 200, "info": '.json_encode("订单不存在，请刷新页面！").'}';
			die;
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("订单ID为空，操作失败！").'}';
		die;
	}

//退款
}elseif($dopost == "refund"){
    global  $userLogin;
	if(!testPurview("refundtravelOrder")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if(!empty($id)){
		$archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`type`, o.`point`, o.`balance`, o.`payprice`, o.`userid`, o.`proid`, o.`procount`, o.`orderprice`, o.`orderstate` FROM `#@__".$action."` o WHERE o.`id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if($results){

			$ordernum   = $results[0]['ordernum'];
			$orderprice = $results[0]['balance'] + $results[0]['payprice'];
			$userid     = $results[0]["userid"];
			$proid      = $results[0]["proid"];
			$procount   = $results[0]["procount"];
			$type       = $results[0]["type"];
			$orderstate = $results[0]["orderstate"];
			$point      = $results[0]["point"];

			//旅游商品
			if($type==1){//景点门票
				$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid FROM `#@__travel_ticketinfo` l LEFT JOIN `#@__travel_ticket` s ON s.`id` = l.`ticketid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`typeid` = 0 and l.`id` = ". $proid);
				$proname = $dsql->dsqlOper($proSql, "results");
			}elseif($type==2){//周边游
				$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid  FROM `#@__travel_ticketinfo` l LEFT JOIN `#@__travel_agency` s ON s.`id` = l.`ticketid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`typeid` = 1 and l.`id` = ". $proid);
				$proname = $dsql->dsqlOper($proSql, "results");
			}elseif($type==3){//酒店
				$proSql = $dsql->SetQuery("SELECT l.`title`, c.`userid` uid  FROM `#@__travel_hotelroom` l LEFT JOIN `#@__travel_hotel` s ON s.`id` = l.`hotelid` LEFT JOIN `#@__travel_store` c ON c.`id` = s.`company` WHERE l.`id` = ". $proid);
				$proname = $dsql->dsqlOper($proSql, "results");
			}elseif($type==4){//签证
				$proSql = $dsql->SetQuery("SELECT l.`title`, s.`userid` uid FROM `#@__travel_visa` l LEFT JOIN `#@__travel_store` s ON s.`id` = l.`company` WHERE l.`id` = ". $proid);
				$proname = $dsql->dsqlOper($proSql, "results");
			}

			$uid        = $proname[0]["uid"];
			$title      = $proname[0]["title"];

			if($orderstate == 1){

				//会员信息
				$userSql = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = ". $userid);
				$userResult = $dsql->dsqlOper($userSql, "results");

				if($userResult){

					//退回积分 by: guozi 20160425
					if(!empty($point) && $point>0){
					    global  $userLogin;
						$archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
						$dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($userpoint+$point);
						//保存操作日志
						$archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '旅游订单退回：$ordernum', ".GetMkTime(time()).",'tuihui','$userpoint')");
						$dsql->dsqlOper($archives, "update");
					}

                	$pay_name = '';
                	$pay_namearr = array();
                	$paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "travel",
                        "id"       => $id
                    );
                    $urlParam = serialize($paramUser);

                    if($orderprice != ''){
                    	array_push($pay_namearr,'余额');
                    }

                    if($point != ''){
                    	array_push($pay_namearr,'积分');
                    }

                    if($pay_namearr){
			            $pay_name = join(',',$pay_namearr);
			        }
                    $tuikuan= array(
                    	'paytype' 				=> $pay_name,
                    	'truemoneysy'			=> 0,
                    	'money_amount'  		=> $orderprice,
                    	'point'					=> $point,
                    	'refrunddate'			=> 0,
                    	'refrundno'				=> 0

                    );
		            $tuikuanparam = serialize($tuikuan);
					//会员帐户充值
					if($orderprice > 0){
						$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + ".$orderprice." WHERE `id` = ". $userid);
						$dsql->dsqlOper($userOpera, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $usermoney = $user['money'];
//                        $money = sprintf('%.2f',($usermoney + $orderprice));
						//记录退款日志
						$logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (".$userid.", ".$orderprice.", 1, '旅游订单退款：".$ordernum."', ".GetMkTime(time()).",'travel','tuikuan','$urlParam','$ordernum','$tuikuanparam','旅游消费','$usermoney')");
						$dsql->dsqlOper($logs, "update");
					}

					//更新旅游已购买数量
					if($type==1 || $type==2){//景点 周边游
						if($type==1){
							$whereT = " AND `typeid` = 0 AND `id` = '$proid' ";
						}elseif($type==2){
							$whereT = " AND `typeid` = 1 AND `id` = '$proid' ";
						}
						$proSql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
						$dsql->dsqlOper($proSql, "update");
						$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_ticketinfo` WHERE 1=1 $whereT ");
						$pro = $dsql->dsqlOper($sql, "results");
						if($pro[0]['sale']==0){
							$proSql = $dsql->SetQuery("UPDATE `#@__travel_ticketinfo` SET `sale` = 0  WHERE 1=1 $whereT ");
							$dsql->dsqlOper($proSql, "update");
						}
					}elseif($type==3){//酒店
						$whereT = " AND `id` = '$proid' ";
						$proSql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
						$dsql->dsqlOper($proSql, "update");
						$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_hotelroom` WHERE 1=1 $whereT ");
						$pro = $dsql->dsqlOper($sql, "results");
						if($pro[0]['sale']==0){
							$proSql = $dsql->SetQuery("UPDATE `#@__travel_hotelroom` SET `sale` = 0  WHERE 1=1 $whereT ");
							$dsql->dsqlOper($proSql, "update");
						}
					}elseif($type==4){//签证
						$whereT = " AND `id` = '$proid' ";
						$proSql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = `sale` - $procount  WHERE 1=1 $whereT ");
						$dsql->dsqlOper($proSql, "update");
						$sql = $dsql->SetQuery("SELECT `sale` FROM `#@__travel_visa` WHERE 1=1 $whereT ");
						$pro = $dsql->dsqlOper($sql, "results");
						if($pro[0]['sale']==0){
							$proSql = $dsql->SetQuery("UPDATE `#@__travel_visa` SET `sale` = 0  WHERE 1=1 $whereT ");
							$dsql->dsqlOper($proSql, "update");
						}
					}

					//更新订单状态
					$orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."` SET `orderstate` = 9, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = ".GetMkTime(time())." WHERE `id` = ". $id);
					$dsql->dsqlOper($orderOpera, "update");


					//退款成功，会员消息通知
					$paramUser = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "orderdetail",
						"action"   => "travel",
						"id"       => $id
					);

					$paramBusi = array(
						"service"  => "member",
						"template" => "orderdetail",
						"action"   => "travel",
						"id"       => $id
					);

					updateMemberNotice($userid, "会员-订单退款成功", $param, array("username" => $userResult[0]['username'], "order" => $ordernum, 'amount' => $orderprice),'','',0,1);


					//获取会员名
					$username = "";
					$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$username = $ret[0]['username'];
					}
					updateMemberNotice($uid, "会员-订单退款通知", $param, array("username" => $username, "order" => $ordernum, 'amount' => $orderprice, 'info' => "管理员手动退款"),'','',0,1);



					adminLog("为会员手动退款旅游订单", $ordernum);

					echo '{"state": 100, "info": '.json_encode("操作成功，款项已退还至会员帐户！").'}';
					die;

				}else{
					echo '{"state": 200, "info": '.json_encode("会员不存在，无法继续退款！").'}';
					die;
				}

			}else{
				echo '{"state": 200, "info": '.json_encode("订单当前状态不支持手动退款！").'}';
				die;
			}
		}else{
			echo '{"state": 200, "info": '.json_encode("订单不存在，请刷新页面！").'}';
			die;
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("订单ID为空，操作失败！").'}';
		die;
	}
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
		'admin/travel/travelOrderList.js'
	);
	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
