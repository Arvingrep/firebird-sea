<?php
/**
 * 添加装修投标
 *
 * @version        $Id: renovationToubiaoAdd.php 2014-3-4 下午13:03:11 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationToubiaoAdd.html";

$tab = "renovation_toubiao";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改装修投标";
	checkPurview("renovationToubiaoEdit");
}

if($_POST['submit'] == "提交"){
	
	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($material)){
		echo '{"state": 200, "info": "请输入主材费用！"}';
		exit();
	}
	
	if(empty($auxiliary)){
		echo '{"state": 200, "info": "请输入辅材费用！"}';
		exit();
	}
	
	if(empty($labor)){
		echo '{"state": 200, "info": "请输入人工费用！"}';
		exit();
	}
	
	if(empty($manage)){
		echo '{"state": 200, "info": "请输入管理费用！"}';
		exit();
	}
	
	if(empty($design)){
		echo '{"state": 200, "info": "请输入设计费用！"}';
		exit();
	}
	
	if(empty($design)){
		echo '{"state": 200, "info": "请输入设计费用！"}';
		exit();
	}
	
}

if($dopost == "edit"){
	
	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `material` = '$material', `auxiliary` = '$auxiliary', `labor` = '$labor', `manage` = '$manage', `design` = '$design', `note` = '$note', `property` = '$property', `file` = '$litpic', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		
		if($results == "ok"){
			adminLog("修改装修投标", $title);
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
			
			$aid       = $results[0]['aid'];
			$userid    = $results[0]['userid'];
			$material  = $results[0]['material'];
			$auxiliary = $results[0]['auxiliary'];
			$labor     = $results[0]['labor'];
			$manage    = $results[0]['manage'];
			$design    = $results[0]['design'];
			$note      = $results[0]['note'];
			$property  = $results[0]['property'];
			$file      = $results[0]['file'];
			$state     = $results[0]['state'];
			
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
		'swfupload/swfupload.js',
		'swfupload/handlers.js',
		'admin/renovation/renovationToubiaoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/renovation.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_softSize;
		global $custom_softType;
		$huoniaoTag->assign('softSize', $custom_softSize);
		$huoniaoTag->assign('softType', "*.".str_replace("|", ";*.", $custom_softType));
	}
	$huoniaoTag->assign('id', $id);
	
	$huoniaoTag->assign('aid', $aid);
	//招标项目
	$zhaoSql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_zhaobiao` WHERE `id` = ". $aid);
	$zhaoname = $dsql->getTypeName($zhaoSql);
	$huoniaoTag->assign('title', $zhaoname[0]['title']);
	
	$huoniaoTag->assign('userid', $userid);
	//会员
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);
			
	$huoniaoTag->assign('material', $material);
	$huoniaoTag->assign('auxiliary', $auxiliary);
	$huoniaoTag->assign('labor', $labor);
	$huoniaoTag->assign('manage', $manage);
	$huoniaoTag->assign('design', $design);
	$huoniaoTag->assign('note', $note);
	
	//附件属性
	$huoniaoTag->assign('propertyopt', array('0', '1'));
	$huoniaoTag->assign('propertynames',array('只能由业主查看', '任何人都能查看'));
	$huoniaoTag->assign('property', $property == "" ? 0 : $property);
	
	$huoniaoTag->assign('file', $file);
	
	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2', '3', '4'));
	$huoniaoTag->assign('statenames',array('待审核', '待业主评选', '入围', '中标', '淘汰'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}