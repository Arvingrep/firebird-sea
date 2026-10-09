<?php
/**
 * 管理网站留言反馈信息
 *
 * @version        $Id: suggestion.php 2019-02-11 下午13:41:25 $
 * @package        HuoNiao.SiteConfig
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("suggestion");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "suggestion.html";

$action = "member_suggestion";


//更新留言信息
if($dopost == "updateDetail"){
	if($id == "") die;

	$opuid = $userLogin->getUserID();
	$optime = time();

	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = '1', `note` = '$note', `opuid` = '$opuid', `optime` = '$optime' WHERE  `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新网站留言信息", $id . " => " . $state . " => " . $note);
		echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	}
	die;

//删除留言
}else if($dopost == "delComplain"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除网站留言信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取留言列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	//$where = getCityFilter('`cityid`');

	//if($adminCity){
		//$where .= " AND `cityid` = $adminCity";
	//}

	$search = array();

	//if($sType){
		//$where .= " AND `module` = '$sType'";
	//}

	if($sKeyword != ""){

		array_push($search, "`info` like '%$sKeyword%'");
		array_push($search, "`phone` like '%$sKeyword%'");
		array_push($search, "`ip` like '%$sKeyword%'");
		array_push($search, "`ipaddr` like '%$sKeyword%'");
		array_push($search, "`note` like '%$sKeyword%'");

		$where = " AND (" . join(" OR ", $search) . ")";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil((int)$totalCount/(int)$pagestep);
	//待处理
	$totalGray = $dsql->dsqlOper($archives.$where." AND `state` = 0", "totalCount");
	//已处理
	$totalAudit = $dsql->dsqlOper($archives.$where." AND `state` = 1", "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}
	}
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if($results && is_array($results)){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["desc"] = $value["info"];
			$list[$key]["phone"] = $value["phone"];
			$list[$key]["note"] = $value["note"];

			$opuid = $value['opuid'];
			$opname = "未知";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $opuid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret && is_array($ret)){
				$opname = $ret[0]['username'];
			}
			$list[$key]["opuid"] = $opuid;
			$list[$key]['opname'] = $opname;

			$list[$key]["optime"] = date('Y-m-d H:i:s', $value["optime"]);

			$title = "未知";
			$url = "";

			//$list[$key]["title"] = $value["title"];
			$list[$key]["commoncontent"] = $value['desc'];
			$list[$key]["url"] = 'javascript:;';

			$list[$key]["userid"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["username"]  = $username[0]["username"] == null ? "匿名" : $username[0]["username"];

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "未回复";
					break;
				case "1":
					$state = "已回复";
					break;
			}

			$list[$key]["state"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}, "complainList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
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
		'ui/bootstrap.min.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/suggestion.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
