<?php
/**
 * 管理城市分站广告
 *
 * @version        $Id: advCityList.php 2018-01-20 上午11:44:20 $
 * @package        HuoNiao.Adv
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "advCityList.html";
$dir = HUONIAOROOT."/templates/".$action;

$tab = "advlist_city";

checkPurview("advList".$action);

if(empty($aid)){
	ShowMsg("广告ID传递失败！", 'javascript:;');
	exit();
}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	$where .= " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `aid` = ".$aid);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `aid`, `cityid`, `body`, `admin`, `date` FROM `#@__".$tab."` WHERE `aid` = ".$aid.$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["aid"] = $value["aid"];
			$list[$key]["cityid"] = $value["cityid"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$list[$key]["admin"] = $value["admin"];
			$list[$key]["adminname"] = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $value['admin']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$list[$key]['adminname'] = $ret[0]['username'];
			}

			$list[$key]["date"] = date('Y-m-d H:i:s', $value["date"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "adList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['aid'] . " => " . $results[0]['cityid']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除城市分站广告", $tab."=>".join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
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
		'admin/siteConfig/advCityList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('aid', $aid);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
