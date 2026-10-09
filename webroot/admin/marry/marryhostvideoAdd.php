<?php
/**
 * 添加主持人作品
 *
 * @version        $Id: marryhostvideoAdd.php 2014-1-14 上午08:49:02 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryhostvideoAdd.html";

$tab = "marry_hostvideo";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
$ptitle = $action == "hostvideo" ? "主持人" : "";
if($dopost == "edit"){
	$pagetitle = "修改".$ptitle."作品";
	checkPurview("marryhostEdit");
}else{
	$pagetitle = "添加".$ptitle."作品";
	checkPurview("marryhostAdd");
}

if(!isset($videoid)) $videoid = 0;
$weight = (int)$weight;
$pubdate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($videoid)){
		echo '{"state": 200, "info": "".$ptitle."ID传递错误！"}';
		exit();
	}

	if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入标题"}';
		exit();
	}

	if(trim($litpic) == ""){
		echo '{"state": 200, "info": "请上传缩略图"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `litpic`, `hostid`, `video`, `pubdate`, `weight`) VALUES ('$title', '$litpic', '$videoid', '$video', '$pubdate', '$weight')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		adminLog("添加".$ptitle."作品信息", $title);

		echo '{"state": 100}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `litpic` = '$litpic', `hostid` = '$videoid', `video` = '$video', `weight` = '$weight' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改".$ptitle."作品信息", $title);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if(!empty($results)){
			$title = $results[0]['title'];
			$litpic = $results[0]['litpic'];
			$video = $results[0]['video'];
			$weight = $results[0]['weight'];
		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/marry/marryhostvideoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/marry.inc.php");
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

	$huoniaoTag->assign('videoid', $videoid);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('video', $video);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
