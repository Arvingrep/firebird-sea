<?php
/**
 * 管理分类信息
 *
 * @version        $Id: infoList.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoList.html";

global $handler;
$handler = true;
$dopost     = $dopost ? $dopost : "edit";        //操作类型 edit修改

$action = "info";
$now = GetMkTime(time());

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    $where1 = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }
    $del = 0;
    if($aType != ""){
        $del = 1;
    }


    if($sKeyword != ""){
        $sidArr = array();
        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`company` like '%$sKeyword%' OR `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%') ");
        $results = $dsql->dsqlOper($userSql, "results");
        foreach ($results as $key => $value) {
            $sidArr[$key] = $value['id'];
        }

        if (!empty($sidArr)){
            $where .= " AND (`body` like '%$sKeyword%' OR `tel` like '%$sKeyword%' OR `userid` in (".join(",",$sidArr).") ) ";
        }else{
            $where .= " AND (`body` like '%$sKeyword%' OR `tel` like '%$sKeyword%')";
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
		$where .= " AND `typeid` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}
    //置顶
    if($stateInfo ==1){
        $where .= " AND `isbid` = 1";
    }
    //刷新
    if($stateInfo == 2){
        $where .= " AND `refreshSmart` = 1";
    }
    //阅读红包
    if($stateInfo == 3){
        $where .= " AND `readInfo` = 1";
    }
    //分享红包
    if($stateInfo == 4){
        $where .= " AND `shareInfo` = 1";
    }



	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE `waitpay` = 0 AND `del` = $del");
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `arcrank` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `arcrank` = 1 AND (`valid` > ".$now." AND `valid` <> 0)".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `arcrank` = 2".$where, "totalCount");
	//取消显示
	$totalNoshow = $dsql->dsqlOper($archives." AND `arcrank` = 3".$where, "totalCount");
	//已过期
	$totalValid = $dsql->dsqlOper($archives." AND (`valid` < ".$now." OR `valid` = 0)".$where, "totalCount");
	//已售
	$totalIsSale = $dsql->dsqlOper($archives." AND `is_valid` = 1".$where, "totalCount");
	//置顶
    $totalBid= $dsql->dsqlOper($archives." AND `isbid` = 1", "totalCount");
    //刷新
    $totalRefresh = $dsql->dsqlOper($archives." AND `refreshSmart` = 1", "totalCount");

    //查询红包阅读红包
    $priceReadInfo = $dsql->SetQuery("SELECT count(`id`)id,SUM(`hongbaoPrice`)hongbaoPrice,SUM(`rewardPrice` * `rewardCount`)redprice FROM `#@__".$action."list` WHERE `waitpay` = 0 AND `del` = $del".$where1." order by `pubdate` desc ");
    $readPrice = $dsql->dsqlOper($priceReadInfo,'results');

    //统计阅读红包的钱
    $readlist = $dsql->SetQuery("SELECT SUM(`price`)priceCount,count(`id`) FROM `#@__info_hongbao_historyclick` WHERE  `type` = 2");
    $retread = $dsql->dsqlOper($readlist, "results");

    //统计分享红包的钱
    $priceShareInfo = $dsql->SetQuery("SELECT SUM(`price`)countFenxiang  FROM `#@__info_hongbao_historyclick` WHERE  `type` = 1");
    $Share = $dsql->dsqlOper($priceShareInfo,'results');

    $read = (float)($readPrice[0]['hongbaoPrice'] + $retread[0]['priceCount']);              //阅读红包总额
    $share = (float)($readPrice[0]['redprice'] + $Share[0]['countFenxiang']);            //分享红包总额
    $surplusRead =  (float)$readPrice[0]['hongbaoPrice'];        //剩余阅读红包
    $surplusShare = (float)$readPrice[0]['redprice'];   //剩余分享红包

    //阅读红包总额
    $readinfolist= $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE `waitpay` = 0  AND `readInfo` = 1 AND `del` = $del".$where1);
    $totalReadInfo = $dsql->dsqlOper($readinfolist,'totalCount');

    //分享红包总额
    $infolist= $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE `waitpay` = 0  AND `shareInfo` = 1 AND `del` = $del".$where1);
    $totalShareInfo = $dsql->dsqlOper($infolist,'totalCount');


    if($state != "" && $state != 4 && $state != 5){
		$where .= " AND `arcrank` = $state";

		if($state == 1){
			$where .= " AND (`valid` > ".$now." AND `valid` <> 0)";
		}

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($totalNoshow/$pagestep);
		}
	}

    //筛选已经过期的信息
	if($state == 4){
		$where .= " AND (`valid` < ".$now." OR `valid` = 0)";
		$totalPage = ceil($totalValid/$pagestep);
	}

	//筛选已经售出的信息
	if($state == 5){
		$where .= " AND `is_valid` = 1";
		$totalPage = ceil($totalIsSale/$pagestep);
	}




	$where .= " AND `waitpay` = 0 order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `cityid`, `id`, `title`,`body`,`color`, `typeid`, `price`, `addr`, `weight`, `userid`, `ip`, `ipaddr`, `arcrank`, `review`, `pubdate`, `valid`, `is_valid`,`isbid`,`refreshSmart`,`hasSetjili`,`hongbaoPrice`,`hongbaoCount`,`desc`,`rewardPrice`,`rewardCount`,`readInfo`,`shareInfo`,`bid_type`,`bid_price`,`bid_start`,`bid_end`,`bid_week0`,`bid_week1`,`bid_week2`,`bid_week3`,`bid_week4`,`bid_week5`,`bid_week6` FROM `#@__".$action."list` WHERE `del` = $del".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]                 = $value["id"];
            $list[$key]['title']              = cn_substrR(strip_tags($value['body']), 20);
            $list[$key]["color"]              = $value["color"];
			$list[$key]["typeid"]             = $value["typeid"];
			$list[$key]["price"]              = $value["price"];
            $list[$key]["bid_type"]           = $value["bid_type"];
            $list[$key]["addrid"]             = $value["addr"];
            $list[$key]["isbid"]              = $value["isbid"];                                        //是否置顶
            $list[$key]["refreshSmart"]       = $value["refreshSmart"];                                 //是否刷新
            $list[$key]["hasSetjili"]         = $value["hasSetjili"];                                   //是否设置用户激励(红包)
            $list[$key]["hongbaoPrice"]       = $value["hongbaoPrice"];                                 //红包金额
            $list[$key]["hongbaoCount"]       = $value["hongbaoCount"];                                 //阅读红包数量
            $list[$key]["desc"]               = $value["desc"];                                        //口令
            $list[$key]["rewardPrice"]        = $value["rewardPrice"];                                 //分享金额
            $list[$key]["rewardCount"]        = $value["rewardCount"];                                 //分享人数
            $list[$key]["readInfo"]           = $value["readInfo"];                                 //是否设置阅读红包
            $list[$key]["shareInfo"]          = $value["shareInfo"];                                 //是否设置分享红包
            $hisid =$value["id"];
            $isbid =$value["isbid"];
            $listt = $dsql->SetQuery("SELECT count(`id`)priceCount,SUM(`price`)price  FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = 2");           //阅读红包
            $ret = $dsql->dsqlOper($listt, "results");
            $list[$key]['readPrice']         = $ret[0]['price'] ? $ret[0]['price'] : '';                    //一共被抢的钱
            $list[$key]['priceCount']        = $ret[0]['priceCount'];              //阅读的人数
            $list[$key]['countHongbao']      = $value['hongbaoCount'] + (int)$ret[0]['priceCount'];    // 阅读一共的人数

            $lists = $dsql->SetQuery("SELECT count(`id`)countFenxiang,SUM(`price`)price FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` =1");              //  分享红包
            $rep = $dsql->dsqlOper($lists, "results");
            $list[$key]['sharePrice']        = $rep[0]['price'] ? $rep[0]['price'] : ''; //一共分享的钱
            $list[$key]['countFenxiang']     = $rep[0]['countFenxiang'];                    //  分享的人数
            $list[$key]['CountReward']       = $value['rewardCount'] + $rep[0]['countFenxiang'];              //一共的人数
            //显示置顶信息
            if ($isbid) {
                $list[$key]['bid_type']  = $value['bid_type'];
                $list[$key]['bid_price'] = $value['bid_price'];
                $list[$key]['bid_start'] = $value['bid_start'];
                $list[$key]['bid_end']   = $value['bid_end'];
                //计划置顶详细
                if ($value['bid_type'] == 'plan') {
                    $tp_beganDate = date('Y-m-d', $value['bid_start']);
                    $tp_endDate   = date('Y-m-d', $value['bid_end']);

                    $diffDays   = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
                    $tp_planArr = array();

                    $weekArr = array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

                    //时间范围内每天的明细
                    for ($i = 0; $i < $diffDays; $i++) {
                        $began = GetMkTime($tp_beganDate);
                        $day   = AddDay($began, $i);
                        $week  = date("w", $day);

                        if ($value['bid_week' . $week]) {
                            array_push($tp_planArr, array(
                                'date' => date('Y-m-d', $day),
                                'weekDay' => $week,
                                'week' => $weekArr[$week],
                                'type' => $value['bid_week' . $week],
                                'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
                            ));
                        }
                    }

                    $list[$key]['bid_plan'] = $tp_planArr;
                }
            }
            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;
			//分类
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$action."type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["type"] = $typename[0]['typename'];

			$list[$key]["sort"] = $value["weight"];

			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
				case "3":
					$state = "取消显示";
					break;
			}

			$list[$key]["state"] = $state;

			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];
			$list[$key]['isvalid'] = ($value['valid'] != 0 && $value['valid'] > $now) ? 0 : 1;
			$list[$key]["is_valid"] = (int)$value["is_valid"];
			$list[$key]["review"] = $value["review"];

			//会员信息
			$list[$key]['userid'] = $value['userid'];
			$username = "";
			$sql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$value['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['nickname'];
			}
			$list[$key]['username'] = $username;

			$list[$key]["date"] = date('y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["dateArr"] = explode(' ', date('Y-m-d H:i:s', $value["pubdate"]));

			$param = array(
				"service"     => "info",
				"template"    => "detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.', "totalValid": '.$totalValid.', "totalIsSale": '.$totalIsSale.', "totalBid": '.$totalBid.', "totalRefresh": '.$totalRefresh.', "totalReadInfo": '.$totalReadInfo.', "totalShareInfo": '.$totalShareInfo.', "totalSharePrice": '.$share.', "totalReadPrice": '.$read.', "totalsurRead": '.$surplusRead.', "totalsurShare": '.$surplusShare.'}, "articleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.', "totalValid": '.$totalValid.', "totalIsSale": '.$totalIsSale.', "totalBid": '.$totalBid.', "totalRefresh": '.$totalRefresh.', "totalReadInfo": '.$totalReadInfo.', "totalShareInfo": '.$totalShareInfo.', "totalSharePrice": '.$share.', "totalReadPrice": '.$read.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.', "totalNoshow": '.$totalNoshow.', "totalValid": '.$totalValid.', "totalIsSale": '.$totalIsSale.', "totalBid": '.$totalBid.', "totalRefresh": '.$totalRefresh.', "totalReadInfo": '.$totalReadInfo.', "totalShareInfo": '.$totalShareInfo.', "totalSharePrice": '.$share.', "totalReadPrice": '.$read.', "totalsurRead": '.$surplusRead.', "totalsurShare": '.$surplusShare.'}}';
	}
	die;

//删除
}elseif($doaction == "del") {

    if (!testPurview("delInfo")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();
    $async = array();
    if ($id != "") {
        foreach ($each as $val) {
            $archives = $dsql->SetQuery("UPDATE `#@__" . $action . "list` SET `del` = 1 WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }
        }
        dataAsync("info",$async);  // 分类信息、批量移动到回收站
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';die;
        } else {
            adminLog("转移" . $dowtitle . "信息至回收站", $id);
            echo '{"state": 100, "info": ' . json_encode("所选信息已转移至回收站！") . '}';die;
        }
    }
        die;
    //彻底删除
}elseif($doaction =='fullyDel') {
    if (!testPurview("delInfo")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    if ($id != "") {
        $each = explode(",", $id);
        $error = array();
        $async = array();
        $title = array();
        foreach ($each as $val) {

            //删除评论
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "common` WHERE `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "list` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            array_push($title, $results[0]['title']);

            //删除缩略图
            delPicFile($results[0]['litpic'], "delThumb", $action);

            $body = $results[0]['body'];
            if (!empty($body)) {
                delEditorPic($body, $action);
            }

            //删除图集
            $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__" . $action . "pic` WHERE `aid` = " . $val);
            $results = $dsql->dsqlOper($archives, "results");

            //删除图片文件
            if (!empty($results)) {
                $atlasPic = "";
                foreach ($results as $key => $value) {
                    $atlasPic .= $value['picPath'] . ",";
                }
                delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", $action);
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "pic` WHERE `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            //删除字段
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "item` WHERE `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            //删除举报信息
            $archives = $dsql->SetQuery("DELETE FROM `#@__member_complain` WHERE `module` = 'info' AND `aid` = " . $val);
            $dsql->dsqlOper($archives, "update");

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "list` WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }else{
                $async[] = $val;
            }

            checkArticleCache($val);
        }
        dataAsync("info",$async);  // 分类信息、批量彻底删除
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("删除分类信息", join(", ", $title));
            echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
        }
        die;
    }
    die;
//还原
}elseif($doaction == "revert"){
    if(!testPurview("delInfo")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
    $each = explode(",", $id);
    $error = array();
    if($id != ""){
        foreach($each as $val){
            $archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `del` = 0 WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }
        }
        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';die;
        }else{
            adminLog("还原".$dowtitle."信息", $id);
            echo '{"state": 100, "info": '.json_encode("所选信息还原成功！").'}';die;
        }
    }
    die;

//删除所有待审核信息
}elseif($dopost == "delAllGray") {
    if (!testPurview("delInfo")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "list` WHERE `arcrank` = 0");
    $results = $dsql->dsqlOper($archives, "results");
    if ($results) {
        foreach ($results as $key => $value) {
            //删除缩略图
            delPicFile($value['litpic'], "delThumb", $action);

            $body = $value['body'];
            if (!empty($body)) {
                delEditorPic($body, $action);
            }

            //删除图集
            $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__" . $action . "pic` WHERE `aid` = " . $value['id']);
            $results = $dsql->dsqlOper($archives, "results");

            //删除图片文件
            if (!empty($results)) {
                $atlasPic = "";
                foreach ($results as $k => $v) {
                    $atlasPic .= $v['picPath'] . ",";
                }
                delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", $action);
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "pic` WHERE `aid` = " . $value['id']);
            $dsql->dsqlOper($archives, "update");

            //删除字段
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "item` WHERE `aid` = " . $value['id']);
            $dsql->dsqlOper($archives, "update");

            //删除表
            $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "list` WHERE `id` = " . $value['id']);
            $dsql->dsqlOper($archives, "update");
        }

    }
    die;

    //置顶刷新
}elseif($dopost =='edit'){

	$refreshSmart = (int)$refreshSmart;
	$sr_times = (int)$sr_times;
	$sr_day = (int)$sr_day;
	$time = (int)$time;
	$nextRefreshTime = (int)$nextRefreshTime;
	$refreshSurplus = (int)$refreshSurplus;

    if ($config){
        $configArr = explode('|', $config);
        $tp_beganDate = $configArr[0];
        $tp_endDate = $configArr[1];
        $period = explode(',', $configArr[2]);

        $diffDays = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
        // $tp_planArr = array();
        $tp_week = array();
        global $langData;
        $weekArr = $langData['siteConfig'][34][5];

        $hasbid = 0;

        //时间范围内每天的明细
        for ($i = 0; $i < $diffDays; $i++) {
            $began = GetMkTime($tp_beganDate);
            $day = AddDay($began, $i);
            $week = date("w", $day);

            if($period[$week]){
                $hasbid = 1;
            }
                // array_push($tp_planArr, date('Y-m-d', $day) . " " . $weekArr[$week] . " " . ($period[$week] == 'all' ? '全天' : '早8点-晚8点'));
                array_push($tp_week, array(
                    'week' => $week,
                    'type' => $period[$week]
                ));
            // }
        }
        $tp_beganDate = GetMkTime($tp_beganDate);
        $tp_endDate = GetMkTime($tp_endDate);

        $tp_weekSet = array();
        foreach ($tp_week as $key => $value) {
            array_push($tp_weekSet, "`bid_week".$value["week"]."` = '".$value['type']."'");
        }
        $tp_weekUpdate = ', ' . join(', ', $tp_weekSet);

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `bid_start` = '$tp_beganDate',`bid_end` = '$tp_endDate'".$tp_weekUpdate.",`isbid`='$hasbid',`bid_type` = '$bid_type' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
		if($results == 'ok'){
	        echo '{"state": 200, "info": "置顶成功"}';
		}else{
	        echo '{"state": 300, "info": "置顶失败"}';
		}
        exit();
    }
    if ($type =='refresh'){

        $userid = 0;
        $archives = $dsql->SetQuery("SELECT `userid` from `#@__".$action."list` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            $userid = (int)$results[0]['userid'];
        }

        //刷新
        $arr= array(
            'module' => 'info',
            'act' => 'detail',
            'userid' => $userid
        );
        $refre = new siteConfig($arr);
        $refreshConfig =$refre->refreshTopConfig();
        if($refreshConfig['state'] == 200){
            echo '{"state": 300, "info": "'.$refreshConfig['info'].'"}';
            die;
        }else {
            $rtConfig = $refreshConfig['config'];
            $refresh = $rtConfig['refreshSmart'];  //智能刷新配置
        }
        $refreConfig = (int)$refreConfig;
        $smartData = $refresh[$refreConfig];
        if($smartData){
            $sr_day = $smartData['day'];
            $sr_discount = $smartData['discount'];
            $sr_offer = $smartData['offer'];
            $sr_price = $smartData['price'];
            $sr_times = $smartData['times'];
            $sr_unit = $smartData['unit'];
        }
        $time = GetMkTime(time());
        //下次刷新时间
        $nextRefreshTime = $time + (int)(24/($sr_times/$sr_day)) * 3600;
        $refreshSurplus = $sr_times - 1;
        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET`refreshCount` = '$sr_times',`refreshTimes`='$sr_day',`refreshBegan` = '$time',`refreshNext` = '$nextRefreshTime',`refreshSurplus` = '$refreshSurplus',`refreshSmart` = '$refreshSmart', `pubdate` = '$time' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
		if($results == 'ok'){
	        echo '{"state": 200, "info": "刷新成功"}';
		}else{
	        echo '{"state": 300, "info": "刷新失败"}';
		}
        exit();
    }



//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("editInfo")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){

			//查询信息之前的状态
			$sql = $dsql->SetQuery("SELECT `title`, `arcrank`, `userid`, `pubdate` FROM `#@__".$action."list` WHERE `id` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$title    = $ret[0]['title'];
				$arcrank_ = $ret[0]['arcrank'];
				$userid   = $ret[0]['userid'];
				$pubdate  = $ret[0]['pubdate'];

				//会员消息通知
				if($arcrank != $arcrank_){

					$state = "";
					$status = "";

					//等待审核
					if($arcrank == 0){
						$state = 0;
						$status = "进入等待审核状态。";

					//已审核
					}elseif($arcrank == 1){
						$state = 1;
						$status = "已经通过审核。";
                        $countIntegral = countIntegral($userid);    //统计积分上限
                        global $cfg_returnInteraction_info;
                        global $cfg_returnInteraction_commentDay;
                        if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_info > 0) {
                            $infoname = getModuleTitle(array('name' => 'info'));
                            //获取会员名
                            $username = "";
                            $point = "";
                            $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $userid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $username = $ret[0]['username'];
                                $point = $ret[0]['point'];

                            }

                            //发布得积分
                            $date = GetMkTime(time());
                            global  $userLogin;
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_info' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$cfg_returnInteraction_info);
                            //保存操作日志
                            global $langData;
                            $info = '发布'.$infoname;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_info', '$info', '$date','zengsong','1','$userpoint')");//发布info得积分
                            $dsql->dsqlOper($archives, "update");
                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_info,
                                "point" => $point,
                                "date" => date("Y-m-d H:i:s", $date),
                                "info" => $info,
                                "fields" => array(
                                    'keyword1' => '变动类型',
                                    'keyword2' => '变动积分',
                                    'keyword3' => '变动时间',
                                    'keyword4' => '积分余额'
                                )
                            );
                            updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                        }
					//审核失败
					}elseif($arcrank == 2){
						$state = 2;
						$status = "审核失败。";
					}

					$param = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "manage",
						"action"   => "info"
					);

					//会员信息
					// if($userid){
					// 	$uinfo = $userLogin->getMemberInfo($userid);
					// 	if($uinfo['userType'] == 2){
					// 		$param = array(
					// 			"service"  => "member",
					// 			"template" => "manage",
					// 			"action"   => "info"
					// 		);
					// 	}
					// }

					$param['param'] = "state=".$state;

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
						"title" => str_replace('&nbsp;', '', strip_tags($title)),
						"status" => $status,
						"date" => date("Y-m-d H:i:s", $pubdate),
						"fields" => array(
							'keyword1' => '信息标题',
							'keyword2' => '发布时间',
							'keyword3' => '进展状态'
						)
					);

					updateMemberNotice($userid, "会员-发布信息审核通知", $param, $config);

					checkArticleCache($val);

				}

			}

            //拒审原因
            $review = '';
            if($arcrank == 2){
                $review = $note;
            }

			$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `arcrank` = ".$arcrank.", `review` = '$note' WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("info",$async);   // 分类信息、批量修改状态
        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

//更新时间
}elseif($dopost == "updateTime"){
	if(!testPurview("editInfo")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `pubdate` = ".GetMkTime(time())." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				checkArticleCache($val);
				$async[] = $val;
			}
		}
		dataAsync("info",$async);  // 分类信息、批量更新时间
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息时间", $id);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/info/infoList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('addWeekDate', AddDay(time(), 6));
    $huoniaoTag->assign('recycle', $recycle);
    $huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

// 检查缓存
function checkArticleCache($id){
    checkCache("info_list", $id);
    clearCache("info_total", "key");
    clearCache("info_detail", $id);
}
