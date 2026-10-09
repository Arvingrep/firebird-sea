<?php
/**
 * 添加一句话招聘/求职
 *
 * @version        $Id: jobSentenceAdd.php 2014-3-17 下午13:43:21 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobSentenceAdd.html";

//招聘
if($type==0){
    $tab = "job_pg";
}
//求职
else{
    $tab = "job_qz";
}

$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改一句话招聘/求职";
	checkPurview("jobSentencephptype".$type."Edit");
}else{
	$pagetitle = "添加一句话招聘/求职";
	checkPurview("jobSentencephptype".$type."Add");
}

if($type == "") die('Request Error!');

if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($cityid)){
			echo '{"state": 200, "info": "请选择城市"}';
			exit();
	}

	$adminCityIdsArr = explode(',', $adminCityIds);
	if(!in_array($cityid, $adminCityIdsArr)){
			echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
			exit();
	}

	if(empty($title)){
		echo '{"state": 200, "info": "请输入职位名称！"}';
		exit();
	}

	if(empty($people)){
		echo '{"state": 200, "info": "请输入联系人！"}';
		exit();
	}

	if(empty($contact)){
		echo '{"state": 200, "info": "请输入联系电话！"}';
		exit();
	}

	if($dopost == "save" && empty($password)){
		echo '{"state": 200, "info": "请输入管理密码！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `nickname`, `phone`, `description`, `weight`, `state`, `pubdate`) VALUES ('$cityid',  '$title', '$people', '$contact', '$note', '$weight', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		if($state == 1){
			// clearCache("job_sentence_total", "key");
		}
		adminLog("添加一句话招聘/求职", $userid);
		echo '{"state": 100, "id": "'.$aid.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `phone` = '$people', `phone` = '$contact', `description` = '$note', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改一句话招聘/求职信息", $id);
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

			$cityid    = $results[0]['cityid'];
			$type      = $tab == "job_pg" ? 0 : 1;
			$title     = $results[0]['title'];
			$people    = $results[0]['nickname'];
			$contact   = $results[0]['phone'];
			$note      = $results[0]['description'];
			$weight    = $results[0]['weight'];
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

	//css
	$cssFile = array(
	    'ui/jquery.chosen.css',
	    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/chosen.jquery.min.js',
		'admin/job/jobSentenceAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('type', $type);

	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('password', $password);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('note', $note);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('weight', $weight);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
