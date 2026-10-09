<?php
/**
 * 添加机构相册
 *
 * @version        $Id: pensionalbumAdd.php 2014-1-14 上午14:11:09 $
 * @package        HuoNiao.pension
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/pension";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pensionalbumAdd.html";

$tab = "pension_album";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
$ptitle = $action == "store" ? "机构" : "小区&nbsp;";

if($dopost == "edit"){
	$pagetitle = "修改".$ptitle."相册";
	checkPurview("pensionalbumEdit");
}else{
	$pagetitle = "添加".$ptitle."相册";
	checkPurview("pensionalbumAdd");
}

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($loupanid)){
		echo '{"state": 200, "info": "".$ptitle."ID传递错误！"}';
		exit();
	}

	if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入相册名称"}';
		exit();
	}

	if(trim($litpic) == ""){
		echo '{"state": 200, "info": "请上传图片"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`litpic`, `store`, `title`, `weight`, `pubdate`) VALUES ('$litpic', '$loupanid', '$title', '$weight', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
        dataAsync("pension",$aid,"album"); // 养老机构相册新增
		adminLog("添加".$ptitle."相册信息", $title);

		$param = array(
			"service"  => "pension",
			"template" => $action."-album",
			"id"       => $loupanid,
			"aid"      => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "info": '.json_encode('添加成功！').'}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;

}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `litpic` = '$litpic', `title` = '$title', `weight` = '$weight' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
		    dataAsync("pension",$id,"album"); // 养老机构相册修改
			adminLog("修改".$ptitle."相册信息", $title);

			$param = array(
				"service"  => "pension",
				"template" => $action."-album",
				"id"       => $loupanid,
				"aid"      => $id
			);
			$url = getUrlPath($param);

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

			$title     = $results[0]['title'];
			$weight    = $results[0]['weight'];
			$litpic    = $results[0]['litpic'];

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
		'admin/pension/pensionalbumAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/pension.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('action', $action);

	$huoniaoTag->assign('loupanid', $loupanid);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);

	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pension";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
