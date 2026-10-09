<?php
/**
 * 管理投票评论
 *
 * @version        $Id: voteCommon.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$action = "vote";
$actiontxt = "投票";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview($action."Common");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action."Common.html";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `tid`, `uid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck` FROM `#@__".$action."_common` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		$archives = $dsql->SetQuery("SELECT `name` FROM `#@__".$action."_user` WHERE `id` = ".$results[0]["uid"]);
		$dsqlInfo = $dsql->dsqlOper($archives, "results");

		$name = $dsqlInfo[0]["name"];
		$results[0]["name"] = $name;

		if($results[0]["userid"] == 0 || $results[0]["userid"] == -1){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["userid"]);
			$member = $dsql->dsqlOper($archives, "results");

			$username = $member[0]["username"];
		}
		$results[0]["username"] = $username;

		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("评论信息获取失败！").'}';
	}
	die;

//更新评论信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$dtime   = GetMkTime($commonTime);
	$ipAddr = getIpAddr($ip);

	$archives = $dsql->SetQuery("UPDATE `#@__".$action."_common` SET `content` = '$commonContent', `dtime` = '".GetMkTime($commonTime)."', `ip` = '$commonIp', `good` = '$commonGood', `bad` = '$commonBad', `ischeck` = '$commonIsCheck' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新".$actiontxt."评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//更新评论状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."_common` SET `ischeck` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新投票评论信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除评论
}else if($dopost == "delCommon"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_common` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除".$actiontxt."评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		//按评论内容搜索
		if($sType == 0){
			$where .= " AND `content` like '%$sKeyword%'";

		//按活动标题搜索
		}elseif($sType == "1"){
            $where2 .= " AND `title` like '%$sKeyword%'";

		//按评论人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND (`userid` = 0 OR `userid` = -1)";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
				$results = $dsql->dsqlOper($archives, "results");

				if(count($results) > 0){
					$list = array();
					foreach ($results as $key=>$value) {
						$list[] = $value["id"];
					}
					$idList = join(",", $list);

					$where .= " AND `userid` in ($idList)";

				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
				}
			}

		//按IP搜索
		}elseif($sType == "3"){
			$where .= " AND `ip` like '%$sKeyword%'";
		}
	}

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_list` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `tid` in ($idList)";
    }else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_common`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." WHERE `ischeck` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." WHERE `ischeck` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." WHERE `ischeck` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `ischeck` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `tid`, `uid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$action."_common` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]  = $value["id"];
			$list[$key]["tId"] = $value["tid"];
			$list[$key]["uId"] = $value["uid"];

			// 选手
			$typeSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__".$action."_user` WHERE `id` = ". $value["uid"]);
			$typename = $dsql->dsqlOper($typeSql, "results");
			$list[$key]["uName"] = $typename[0]['name'];
			$param = array(
				"service"  => "vote",
				"template" => "user",
				"id"       => $typename[0]['id']
			);
			$list[$key]["uUrl"] = getUrlPath($param);

			// 活动
			$typeSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__".$action."_list` WHERE `id` = ". $value["tid"]);
			$typename = $dsql->dsqlOper($typeSql, "results");
			$list[$key]["tTitle"] = $typename[0]['title'];
			$param = array(
				"service"  => "vote",
				"template" => "detail",
				"id"       => $value["tid"]
			);
			$list[$key]["tUrl"] = getUrlPath($param);

			$list[$key]["commonUserId"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["commonUserName"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];

			$list[$key]["commonContent"] = cn_substrR(strip_tags($value["content"]), 30)."...";
			$list[$key]["commonTime"] = date('Y-m-d H:i:s', $value["dtime"]);
			$list[$key]["commonIp"] = $value["ip"];
			$list[$key]["commonIpAddr"] = $value["ipaddr"];

			$state = "";
			switch($value["ischeck"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
			}

			$list[$key]["commonIsCheck"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "commonList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;
}

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/'.$action.'/'.$action.'Common.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/huangye";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}