<?php
/**
 * 自助建站模板页面管理
 *
 * @version        $Id: websiteTempPages.php 2014-6-13 上午11:11:21 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteTempPages");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "自助建站模板页面管理";

$tab = "website_temp_pages";

if($dopost != ""){
	$templates = "websiteTempPagesAdd.html";

	//js
	$jsFile = array(
		'admin/website/websiteTempPagesAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "websiteTempPages.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/website/websiteTempPages.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());       //发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$where .= " order by `sort` asc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `tempid` = ".$tempid);

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `name`, `alias`, `sort`, `pubdate` FROM `#@__".$tab."` WHERE `tempid` = ".$tempid.$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["name"] = $value["name"];
			$list[$key]["alias"] = $value["alias"];
			$list[$key]["sort"] = $value["sort"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "website",
				"template" => "preview".$tempid,
				"alias"    => $value['alias']
			);
			$list[$key]['url'] = getUrlPath($param);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "websiteTempPages": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "add"){

	$pagetitle = "新增自助建站模板页面";

	//表单提交
	if($submit == "提交"){
		$name = $_POST['name'];

		//表单二次验证
		if(trim($name) == ''){
			echo '{"state": 200, "info": "页面名称不能为空"}';
			exit();
		}
		if(trim($alias) == ''){
			echo '{"state": 200, "info": "文件名不能为空"}';
			exit();
		}
		if(trim($pagedata) == ''){
			echo '{"state": 200, "info": "页面内容不能为空"}';
			exit();
		}

		$pagedata = addslashes(urldecode($_POST['pagedata']));

		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `tempid` = ".$tempid." AND `alias` = '$alias'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			echo '{"state": 200, "info": "文件名已存在！"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`tempid`, `name`, `alias`, `title`, `keywords`, `description`, `sort`, `pagedata`, `appname`, `pubdate`) VALUES ('$tempid', '$name', '$alias', '$title', '$keywords', '$description', '$sort', '$pagedata', '$appname', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增自助建站模板页面", $name);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "edit"){

	$pagetitle = "修改自助建站模板页面";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){
		$name = $_POST['name'];

		//表单二次验证
		if(trim($name) == ''){
			echo '{"state": 200, "info": "页面名称不能为空"}';
			exit();
		}
		if(trim($alias) == ''){
			echo '{"state": 200, "info": "文件名不能为空"}';
			exit();
		}
		if(trim($pagedata) == ''){
			echo '{"state": 200, "info": "页面内容不能为空"}';
			exit();
		}

		$pagedata = addslashes(urldecode($_POST['pagedata']));

		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `tempid` = ".$tempid." AND `alias` = '$alias' AND `id` != ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			echo '{"state": 200, "info": "文件名已存在！"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `name` = '$name', `alias` = '$alias', `title` = '$title', `keywords` = '$keywords', `description` = '$description', `sort` = '$sort', `pagedata` = '$pagedata', `appname` = '$appname' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改自助建站模板页面", $name);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$name        = $results[0]['name'];
				$alias       = $results[0]['alias'];
				$title       = $results[0]['title'];
				$keywords    = $results[0]['keywords'];
				$description = $results[0]['description'];
				$sort        = $results[0]['sort'];
				$pagedata    = $results[0]['pagedata'];
				$appname     = $results[0]['appname'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	if(!testPurview("websiteTempPagesDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$name = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($name, $results[0]['name']);

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
			adminLog("删除自助建站模板页面", join(", ", $name));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('tempid', (int)$tempid);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('name', $name);
	$huoniaoTag->assign('alias', $alias);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('sort', empty($sort) ? 1 : $sort);
	$huoniaoTag->assign('pagedata', $pagedata);
	$huoniaoTag->assign('appname', $appname);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
