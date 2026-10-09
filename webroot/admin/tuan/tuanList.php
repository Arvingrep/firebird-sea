<?php
/**
 * 管理团购信息
 *
 * @version        $Id: tuanList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanList.html";

global $handler;
$handler = true;

$action = "tuan";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('store.`cityid`');

    if ($cityid){
        $where2 .= getWrongCityFilter('store.`cityid`', $cityid);
    }

    // $sidArr = array();
    // $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store WHERE 1=1".$where2);
    // $results = $dsql->dsqlOper($userSql, "results");
    // foreach ($results as $key => $value) {
    //     $sidArr[$key] = $value['id'];
    // }

    // if(!empty($sidArr)){
    //     $where .= " AND `sid` in (".join(",",$sidArr).")";
    // }else{
    //     echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
    // }

	if($sKeyword != ""){

		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE `user`.company like '%$sKeyword%'".$where2);
		$results = $dsql->dsqlOper($userSql, "results");
		foreach ($results as $key => $value) {
			$sidArr[$key] = $value['id'];
		}

		if(!empty($sidArr)){
			$where .= " AND (l.`title` like '%$sKeyword%' OR l.`sid` in (".join(",",$sidArr)."))";
		}else{
			$where .= " AND l.`title` like '%$sKeyword%'";
		}

	}

	if($sType != ""){
		if($dsql->getTypeList($sType, $action."type")){
			global $arr_data;
			$arr_data = array();
			$lower = arr_foreach($dsql->getTypeList($sType, $action."type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}

		$sidArr = array();
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_store` WHERE `stype` in ($lower)");
		$results = $dsql->dsqlOper($archives, "results");
		foreach ($results as $key => $value) {
			$sidArr[$key] = $value['id'];
		}
		if(!empty($sidArr)){
			$where .= " AND l.`sid` in (".join(",",$sidArr).")";
		}else{
			$where .= " AND 1 = 2";
		}

	}

	if($property != ""){
		//整点团
		if($property == "hourly"){
			$where .= " AND l.`hourly` = 1";
		}

		//推荐
		elseif($property == "rec"){
			$where .= " AND l.`rec` = 1";
		}

		//其它属性
		else{
			$where .= " AND l.`flag` like '%".$property."%'";
		}

	}

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."list` l LEFT JOIN `#@__tuan_store` store ON store.`id` = l.`sid` WHERE 1 = 1".$where2);

	//总条数
	$totalCount = (int)$dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2".$where, "totalCount");

	//结束
	// $finishArchives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE ((`enddate` < ".GetMkTime(time())." AND `defbuynum` + `buynum` > `maxnum`) OR (`maxnum` != 0 AND `defbuynum` + `buynum` > `maxnum`))".$where);
	$finishArchives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."list` l LEFT JOIN `#@__tuan_store` store ON store.`id` = l.`sid` WHERE l.`enddate` < ".GetMkTime(time()).$where2.$where);
	$finish = $dsql->dsqlOper($finishArchives, "totalCount");

	//失败
	$failArchives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."list` l LEFT JOIN `#@__tuan_store` store ON store.`id` = l.`sid` WHERE (l.`enddate` < ".GetMkTime(time())." AND l.`defbuynum` + l.`buynum` < l.`maxnum` AND l.`refund` = 0)".$where2.$where);
	$fail = $dsql->dsqlOper($failArchives, "totalCount");

	//失败已退款
	$refundArchives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."list` l LEFT JOIN `#@__tuan_store` store ON store.`id` = l.`sid` WHERE (l.`enddate` < ".GetMkTime(time())." AND l.`defbuynum` + l.`buynum` < l.`maxnum` AND l.`refund` = 0)".$where2.$where);
	$refund = $dsql->dsqlOper($refundArchives, "totalCount");

    //已下架
    $totalOffshelf = $dsql->dsqlOper($archives." AND l.`arcrank` = 6".$where2.$where, "totalCount");

	if($state != "" && $state != 3 && $state != 4 && $state != 5){
		$where .= " AND l.`arcrank` = $state";
	}else{
		$ids = array();
		//结束信息ID
		if($state == 3){
			$finishResults = $dsql->dsqlOper($finishArchives, "results");
			if($finishResults){
				foreach($finishResults as $v){
					$ids[] = $v['id'];
				}
			}

		//失败信息ID
		}elseif($state == 4){
			$failResults = $dsql->dsqlOper($failArchives, "results");
			if($failResults){
				foreach($failResults as $v){
					$ids[] = $v['id'];
				}
			}

		//失败已退款ID
		}elseif($state == 5){
			$refundResults = $dsql->dsqlOper($refundArchives, "results");
			if($refundResults){
				foreach($refundResults as $v){
					$ids[] = $v['id'];
				}
			}
		}elseif($state == 6){
            $refundResults = $dsql->dsqlOper($refundArchives, "results");
            if($refundResults){
                foreach($refundResults as $v){
                    $ids[] = $v['id'];
                }
            }
        }

		if($state != ""){
			if(!empty($ids)){
				$where .= " AND l.`id` in (".join(",", $ids).")";
			}else{
				$where .= " AND 1 = 2";
			}
		}
	}

	if($state != ""){
		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($finish/$pagestep);
		}elseif($state == 4){
			$totalPage = ceil($fail/$pagestep);
		}elseif($state == 5){
			$totalPage = ceil($refund/$pagestep);
		}elseif($state == 6){
            $totalPage = ceil($totalOffshelf/$pagestep);
        }
	}

	$where .= " order by l.`weight` desc, l.`pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT l.`id`, l.`sid`, l.`title`, l.`startdate`, l.`enddate`, l.`minnum`, l.`maxnum`, l.`defbuynum`, l.`buynum`, l.`litpic`, l.`weight`, l.`tuantype`, l.`market`, l.`price`, l.`arcrank`, l.`pubdate`, l.`refund` FROM `#@__".$action."list` l LEFT JOIN `#@__tuan_store` store ON store.`id` = l.`sid` WHERE 1 = 1".$where2.$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		$i = 0;
		foreach ($results as $key=>$value) {
			$property = "";
			if(GetMkTime(time()) > $value["enddate"]){
				$property = "结束";
				// if(($value["defbuynum"] + $value["buynum"]) > $value["maxnum"]){
				// 	$property = "结束";
				// }else{
				// 	if($value["refund"] == 0){
				// 		$property = "失败";
				// 	}else{
				// 		$property = "失败已退款";
				// 	}
				// }
			}else{
				// if($value["maxnum"] != 0 && ($value["defbuynum"] + $value["buynum"]) > $value["maxnum"]){
				// 	$property = "结束";
				// }
			}

			//实际购买数量，不统计未付款和已退款的
			$ordersql = $dsql->SetQuery("SELECT count(`procount`) as countid FROM `#@__tuan_order` WHERE `proid` = ".$value['id']." AND `orderstate` != 0 AND `orderstate` != 7");
			$ordernum = $dsql->dsqlOper($ordersql, "results");
			$buynum = $ordernum[0]['countid'];
			// var_dump($buynum);die;
			$list[$i]["property"] = $property;

			$list[$i]["id"] = $value["id"];
			$list[$i]["title"] = $value["title"];
			$list[$i]["startdate"] = date('Y-m-d H:i:s', $value["startdate"]);
			$list[$i]["enddate"] = date('Y-m-d H:i:s', $value["enddate"]);

			$list[$i]["minnum"] = $value["minnum"] == 0 ? "不限" : $value["minnum"];
			$list[$i]["maxnum"] = $value["maxnum"] == 0 ? "不限" : $value["maxnum"];
			$list[$i]["defbuynum"] = $value["defbuynum"];
			$list[$i]["buynum"] = $buynum;
			$list[$i]["totalbuy"] = $value["defbuynum"] + $buynum;
			$list[$i]["weight"] = $value["weight"];
			$list[$i]["tuantype"] = $value["tuantype"];
			$list[$i]["market"] = $value["market"];
			$list[$i]["price"] = $value["price"];
			$list[$i]["litpic"] = $value["litpic"];

			$state_ = "";
			switch($value["arcrank"]){
				case "0":
					$state_ = "等待审核";
					break;
				case "1":
					$state_ = "审核通过";
					break;
				case "2":
					$state_ = "审核拒绝";
					break;
                case "6":
                    $state_ = "已下架";
			}
			$list[$i]["state"] = $state_;



			//区域、分类
			$userSql = $dsql->SetQuery("SELECT `stype`,`addrid` FROM `#@__tuan_store` WHERE `id` = ".$value['sid']);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if($userResult){
				$stype = $userResult[0]["stype"];
				$list[$i]["typeid"] = $stype;
                $list[$i]["addrid"] = $userResult[0]["addrid"];

				$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$action."type` WHERE `id` = ". $stype);
				$typename = $dsql->getTypeName($typeSql);
				$list[$i]["type"] = $typename[0]['typename'];

                //区域
                if($userResult[0]["addrid"] == 0){
                    $list[$i]["addrname"] = "未知";
                }else{
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $userResult[0]["addrid"], 'type' => 'typename', 'split' => ' '));
                    $list[$i]["addrname"] = $addrname;
                }
			}

			$list[$i]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "tuan",
				"template"    => "detail",
				"id"          => $value['id']
			);
			$list[$i]["url"] = getUrlPath($param);

			$i++;


		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "finish": '.$finish.', "fail": '.$fail.', "refund": '.$refund.', "offshelf": '.$totalOffshelf.'}, "tuanList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "finish": '.$finish.', "fail": '.$fail.', "refund": '.$refund.', "offshelf": '.$totalOffshelf.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "finish": '.$finish.', "fail": '.$fail.', "refund": '.$refund.', "offshelf": '.$totalOffshelf.'}}';
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("editTuan")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){


		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT l.`title`, l.`arcrank`, l.`pubdate`, s.`uid` FROM `#@__".$action."list` l LEFT JOIN `#@__".$action."_store` store ON store.`id` = l.`sid` WHERE l.`id` = $val");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$title    = $ret[0]['title'];
			$arcrank_ = $ret[0]['arcrank'];
			$pubdate  = $ret[0]['pubdate'];
			$userid   = $ret[0]['uid'];

			//会员消息通知
			if($arcrank != $arcrank_){

				$status = "";

				//等待审核
				if($arcrank == 0){
					$status = "进入等待审核状态。";

				//已审核
				}elseif($arcrank == 1){
					$status = "已经通过审核。";

				//审核失败
				}elseif($arcrank == 2){
					$status = "审核失败。";
				}
				//已下架
				elseif($arcrank == 6){
				    $status = "商品下架";
                }

				$param = array(
					"service"  => "member",
					"template" => "manage",
					"action"   => "tuan",
					"param"    => "state=".$arcrank
				);

				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['username'];
				}

				//自定义配置
				$config = array(
					"username" => $username,
					"title" => $title,
					"status" => $status,
					"date" => date("Y-m-d H:i:s", $pubdate),
					"fields" => array(
						'keyword1' => '信息标题',
						'keyword2' => '发布时间',
						'keyword3' => '进展状态'
					)
				);

				updateMemberNotice($userid, "会员-发布信息审核通知", $param, $config);

			}

		}



		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `arcrank` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新团购商品信息状态", $id."=>".$arcrank);
		dataAsync("tuan",$id,"product"); // 团购修改商品状态
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif($dopost == "del") {
    if (!testPurview("delTuan")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    $each = explode(",", $id);
    $error = array();
    $async = array();
    $title = array();
    foreach ($each as $val) {

        //删除评论
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "common` WHERE `aid` = " . $val);
        $dsql->dsqlOper($archives, "update");

        $orderid = array();
        //删除相应的订单、团购券、充值卡数据
        $orderSql = $dsql->SetQuery("SELECT `id` FROM `#@__" . $action . "_order` WHERE `proid` = " . $val);
        $orderResult = $dsql->dsqlOper($orderSql, "results");

        if ($orderResult) {
            foreach ($orderResult as $key => $order) {
                array_push($orderid, $order['id']);
            }

            if (!empty($orderid)) {
                $orderid = join(",", $orderid);

                $quanSql = $dsql->SetQuery("DELETE FROM `#@__" . $action . "quan` WHERE `orderid` in (" . $orderid . ")");
                $dsql->dsqlOper($quanSql, "update");

                $quanSql = $dsql->SetQuery("DELETE FROM `#@__paycard` WHERE `module` = 'tuan' AND `orderid` in (" . $orderid . ")");
                $dsql->dsqlOper($quanSql, "update");
            }

            $quanSql = $dsql->SetQuery("DELETE FROM `#@__" . $action . "_order` WHERE `proid` = " . $val);
            $dsql->dsqlOper($quanSql, "update");

        }


        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "list` WHERE `id` = " . $val);
        $results = $dsql->dsqlOper($archives, "results");

        array_push($title, $results[0]['title']);
        //删除缩略图
        delPicFile($results[0]['litpic'], "delThumb", $action);
        //删除图集
        delPicFile($results[0]['pics'], "delAtlas", $action);

        $body = $results[0]['body'];
        if (!empty($body)) {
            delEditorPic($body, $action);
        }

        //删除表
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "list` WHERE `id` = " . $val);
        $results = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }else{
            $async[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除团购信息", join(", ", $title));
        dataAsync("tuan",$async,"product"); // 团购删除
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

}
//商品下架
elseif($dopost == "offshelf") {
    if (!testPurview("editTuan")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    $each = explode(",", $id);
    $error = array();
    $async = array();
    $title = array();
    foreach ($each as $val) {

        //更新商品状态
        $archives = $dsql->SetQuery("update `#@__tuanlist` set arcrank = 6 WHERE `id` = " . $val);
        $up = $dsql->dsqlOper($archives, "update");
        if($up!="ok"){
            $error[] = $val;
        }else{
            $async[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("下架团购信息", join(", ", $title));
        dataAsync("tuan",$async,"product"); // 团购下架
        echo '{"state": 100, "info": ' . json_encode("下架成功！") . '}';
    }
    die;
}
//商品上架
elseif($dopost == "onshelf"){
    if (!testPurview("editTuan")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    $each = explode(",", $id);
    $error = array();
    $async = array();
    $title = array();
    foreach ($each as $val) {

        //更新商品状态
        $archives = $dsql->SetQuery("update `#@__tuanlist` set arcrank = 1 WHERE `id` = " . $val);
        $up = $dsql->dsqlOper($archives, "update");
        if($up != "ok"){
            $error[] = $val;
        }else{
            $async[] = $val;
        }
    }
    dataAsync("tuan",$async,"product");  // 团购商品、上架
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("上架团购信息", join(", ", $title));
        echo '{"state": 100, "info": ' . json_encode("上架成功！") . '}';
    }
    die;
}
//退还已购买用户的款项
elseif($dopost == "refund"){
	if(!testPurview("refundTuanList")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}

	if($id == "") die;

	//团购商品
	$proSql = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ". $id);
	$proResult = $dsql->dsqlOper($proSql, "results");

	if($proResult){

		if(date('Y-m-d', time()) > date('Y-m-d', $proResult[0]["enddate"])){
			if(($proResult[0]["defbuynum"] + $proResult[0]["buynum"]) > $proResult[0]["minnum"]){
				echo '{"state": 200, "info": '.json_encode("已结束的商品不可以退款！").'}';
				die;

			}else{
				if($proResult[0]["refund"] != 0){
					echo '{"state": 200, "info": '.json_encode("此商品已经退过款！").'}';
					die;
				}
			}
		}

		$title = $proResult[0]['title'];
		$enddate = $proResult[0]['enddate'];
		$minnum = $proResult[0]['minnum'];
		$defbuynum = $proResult[0]['defbuynum'];
		$buynum = $proResult[0]['buynum'];

		$archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderstate`, `emstype` FROM `#@__".$action."_order` WHERE `proid` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if($results){
			foreach($results as $key => $orderdetail){
				$orderid = $orderdetail['id'];
				$ordernum = $orderdetail['ordernum'];
				$orderprice = $orderdetail['orderprice'];
				$userid = $orderdetail["userid"];
				$procount = $orderdetail["procount"];
				$orderstate = $orderdetail["orderstate"];
				$proid = $orderdetail["proid"];

				//计算运费
				if($proResult[0]['tuantype'] == 2){
					if($procount < $proResult[0]["freeshi"] && $orderdetail['emstype'] == 0){
						$orderprice = $orderprice + $proResult[0]['freight'];
					}
				}

				if($orderstate == 1 || $orderstate == 4){
					//会员信息
					$userSql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ". $userid);
					$userResult = $dsql->dsqlOper($userSql, "results");

					if($userResult){

						//会员帐户充值
						$price = $userResult[0]['money'] + $orderprice;
						$userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$price." WHERE `id` = ". $userid);
						$dsql->dsqlOper($userOpera, "update");

						//记录退款日志
						$logs = $dsql->SetQuery("INSERT INTO `#@__transactionlogs` (`userid`, `amout`, `type`, `note`, `pubdate`) VALUES (".$userid.", ".$orderprice.", 1, '订单退款：".$ordernum."', ".GetMkTime(time()).")");
						$dsql->dsqlOper($logs, "update");

						$totalBuy = $buynum - $procount;
						$totalBuy = $totalBuy < 0 ? 0 : $totalBuy;
						//更新团购已购买数量
						$proSql = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `buynum` = ".$totalBuy." WHERE `id` = " . $proid);
						$dsql->dsqlOper($proSql, "update");

						//更新订单状态
						$orderOpera = $dsql->SetQuery("UPDATE `#@__".$action."_order` SET `orderstate` = 5 WHERE `id` = ". $orderid);
						$dsql->dsqlOper($orderOpera, "update");

					}

				}
			}

			//更新团购属性为已退款
			$proSql = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `refund` = 1");
			$dsql->dsqlOper($proSql, "update");

			echo '{"state": 100, "info": '.json_encode("操作成功，款项已退还至会员帐户！").'}';
			die;

		}else{

			$proOpera = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `refund` = 1 WHERE `id` = ". $userid);
			$dsql->dsqlOper($proOpera, "update");

			echo '{"state": 100, "info": '.json_encode("此商品暂无订单，不需要退款！").'}';
			die;
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("商品不存在，请确认后操作！").'}';
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
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/tuan/tuanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));

	//区域
	$addrListArr = array();
	// $sql = $dsql->SetQuery("SELECT c.*, a.`typename` FROM `#@__tuan_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` ORDER BY c.`id`");
	// $ret = $dsql->dsqlOper($sql, "results");
	// if($ret){
	// 	foreach ($ret as $key => $value) {
	// 		$addrListArr[$key]['id'] = $value['cid'];
	// 		$addrListArr[$key]['typename'] = $value['typename'];

	// 		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__site_area` WHERE `parentid` = ".$value['cid']." ORDER BY `weight`");
	// 		$res = $dsql->dsqlOper($sql, "results");
	// 		foreach ($res as $k => $v) {
	// 			$addrListArr[$key]['lower'][$k]['id'] = $v['id'];
	// 			$addrListArr[$key]['lower'][$k]['typename'] = $v['typename'];
	// 			$addrListArr[$key]['lower'][$k]['lower'] = array();
	// 		}
	// 	}
	// }


	$huoniaoTag->assign('addrListArr', json_encode($addrListArr));

	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	// $huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, $action."addr", false)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
