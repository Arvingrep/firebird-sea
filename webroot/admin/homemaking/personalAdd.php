<?php
/**
 * 添加服务人员
 *
 * @version        $Id: personalAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "personalAdd.html";

$tab = "homemaking_personal";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改服务人员";
	checkPurview("personalEdit");
}else{
	$pagetitle = "添加服务人员";
	checkPurview("personalAdd");
}
if(empty($suc)) $suc = 0;
if(empty($comid)) $comid = 0;
if(empty($post)) $post = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(empty($suc)) $suc = 0;
$joindate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	//$type = (int)$type;

	//二次验证
	//if($type == 0){
		if($comid == 0 && trim($comid) == ''){
			echo '{"state": 200, "info": "请选择家政公司"}';
			exit();
		}
		if($comid == 0){
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `title` = '".$zjcom."'");
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
				exit();
			}
			$comid = $comResult[0]['id'];
		}else{
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `id` = ".$comid);
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
				exit();
			}
		}
	/* }else{
		$comid = 0;
		$post = 0;
	} */


	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_personal` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它家政公司，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_personal` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它家政公司，不可以重复添加！"}';
			exit();
		}

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`userid`, `company`, `weight`, `state`, `click`, `pubdate`) VALUES ('$userid', '$comid', '$weight', '$state', '$click', '$joindate')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加服务人员", $userid);
		if($state == 1){
			updateCache("homemaking_personal_list", 300);
			clearCache("homemaking_personal_total", 'key');
		}
		$param = array(
			"service"  => "homemaking",
			"template" => "personal-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `userid` = '$userid', `company` = '$comid', `weight` = '$weight', `state` = '$state', `click` = '$click' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改服务人员信息", $id);

			checkCache("homemaking_personal_list", $id);
			clearCache("homemaking_personal_detail", $id);
			clearCache("homemaking_personal_total", 'key');

			$param = array(
				"service"  => "homemaking",
				"template" => "personal-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
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

			foreach ($results[0] as $key => $value) {
				${$key} = $value;
			}

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
		'publicAddr.js',
		'admin/homemaking/personalAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/homemaking.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}

	$huoniaoTag->assign('username', $username);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('userid', $userid);
		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('usernames', $username[0]['username']);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
	}

	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "50" : $weight);
	$huoniaoTag->assign('click', $click);
	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('flag', $flag == "" ? 1 : $flag);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
