<?php
/**
 * 管理养老机构相册
 *
 * @version        $Id: pensionalbum.php 2014-1-14 上午13:54:10 $
 * @package        HuoNiao.pension
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("pensionalbumloupan");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/pension";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pensionalbum.html";

$tab = "pension_album";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `store` = ".$id);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE `store` = ".$id.$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = $value["pubdate"] ? date("Y-m-d", $value["pubdate"]) : '';

			$param = array(
				"service"  => "pension",
				"template" => $action."-album",
				"id"       => $id,
				"aid"      => $value["id"]
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "pensionalbum": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("pensionalbumDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "pension");

			//删除相册表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除养老机构相册信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/pension/pensionalbum.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/pension.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('action', $action);

	if($action == "loupan"){
		//楼盘信息
		$loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__pension_store` WHERE `id` = ". $id);
		$loupanResult = $dsql->getTypeName($loupanSql);
		if(!$loupanResult)die('楼盘不存在！');
		$huoniaoTag->assign('loupanid', $loupanResult[0]['id']);
		$huoniaoTag->assign('loupaname', $loupanResult[0]['title']);
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pension";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
