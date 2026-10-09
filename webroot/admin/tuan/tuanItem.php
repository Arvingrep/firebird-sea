<?php
/**
 * 团购信息字段管理
 *
 * @version        $Id: tuanItem.php 2013-12-6 下午22:43:24 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanItem");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanItem.html";

$typeid = $tid;
if($typeid == "") die;

$pagestep = $pagestep == "" ? 10 : $pagestep;
$page     = $page == "" ? 1 : $page;
$where    = "";

if($action == "list"){
	if($keyword != ""){
		$where .= " AND `tname` like '%$keyword%'";
	}
	$where .= " order by `orderby` desc";
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuantypeitem` WHERE `tid` = ".$typeid);
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `field`, `title`, `formtype` FROM `#@__tuantypeitem` WHERE `tid` = ".$typeid.$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["field"] = $value["field"];
			$list[$key]["title"] = $value["title"];
			switch($value["formtype"]){
				case "text":
					$list[$key]["formtype"] = "文本框";
					break;
				case "select":
					$list[$key]["formtype"] = "下拉列表";
					break;
				case "radio":
					$list[$key]["formtype"] = "单选按钮";
					break;
				case "checkbox":
					$list[$key]["formtype"] = "多选按钮";
					break;
			}
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
		
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;
}elseif($action == "add"){
	if(!testPurview("addTuanItem")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	
	//对字符进行处理
	$title       = cn_substrR($title, 30);
	
	//表单二次验证
	if(trim($field) == ''){
		echo '{"state": 101, "info": '.json_encode("字段名不能为空！").'}';
		exit();
	}
	
	if(trim($title) == ''){
		echo '{"state": 101, "info": '.json_encode("字段别名不能为空！").'}';
		exit();
	}
	
	$archives = $dsql->SetQuery("INSERT INTO `#@__tuantypeitem` (`tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES (".$typeid.", '".$field."', '".$title."', ".$orderby.", '".$formtype."', ".$required.", '".$options."', '".$default."')");
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("添加团购分类字段", $field."=>".$title);
		echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
	}
	die;
	
}elseif($action == "edit"){
	if(!testPurview("editTuanItem")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	
	if($id == "") die;
	
	//对字符进行处理
	$title       = cn_substrR($title, 30);
	
	//表单二次验证
	if(trim($field) == ''){
		echo '{"state": 101, "info": '.json_encode("字段名不能为空！").'}';
		exit();
	}
	
	if(trim($title) == ''){
		echo '{"state": 101, "info": '.json_encode("字段别名不能为空！").'}';
		exit();
	}
	
	$archives = $dsql->SetQuery("UPDATE `#@__tuantypeitem` SET `tid` = ".$typeid.", `field` = '".$field."', `title` = '".$title."', `orderby` = ".$orderby.", `formtype` = '".$formtype."', `required` = ".$required.", `options` = '".$options."', `default` = '".$default."' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("修改团购分类字段", $title);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

}elseif($action == "getDetail"){
	if($id == ""){
		echo '{"state": 200, "info": '.json_encode("ID传递失败！").'}';
		exit();
	}else{
		$archives = $dsql->SetQuery("SELECT `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default` FROM `#@__tuantypeitem` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;
	
//删除字段
}else if($action == "del"){
	if(!testPurview("delTuanItem")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__tuantypeitem` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除团购分类字段", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/tuan/tuanItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}