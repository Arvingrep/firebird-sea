<?php
/**
 * 搜索关键词
 *
 * @version        $Id: searchKeywords.php 2015-02-09 上午11:05:15 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("searchKeywords");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "搜索关键词";

$tab = "site_search";

$templates = "searchKeywords.html";

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
	'admin/siteConfig/searchKeywords.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	if($sKeyword != ""){
		$where .= " AND `keyword` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `module` = '$sType'";
	}

	if($orderby == "count"){
		$where .= " order by `count` desc";
	}else{
		$where .= " order by `lasttime` desc";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `module`, `keyword`, `count`, `lasttime` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$sql = $dsql->SetQuery("SELECT `title`, `subject` FROM `#@__site_module` WHERE `name` = '".$value['module']."'");
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list[$key]["module"]   = $results[0]["subject"] ? $results[0]["subject"] : $results[0]["title"];
			}else{
				$list[$key]["module"]   = $value["module"];
			}

			$list[$key]["keyword"]  = $value["keyword"];
			$list[$key]["count"]    = $value["count"];
			$list[$key]["lasttime"] = date('Y-m-d H:i:s', $value["lasttime"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "searchKeywords": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['module']." => ".$results[0]['keyword']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除搜索关键词", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);

	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
