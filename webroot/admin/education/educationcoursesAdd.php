<?php
/**
 * 添加课程
 *
 * @version        $Id: educationcoursesAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationcoursesAdd.html";

$tab = "education_courses";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改交友课程";
	checkPurview("educationcoursesEdit");
}else{
	$pagetitle = "添加交友课程";
	checkPurview("educationcoursesAdd");
}

if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($rec)) $rec = 0;
if(empty($click)) $click = mt_rand(50, 200);
$pubdate  = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员"}';
		exit();
	}
	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
		$userid = $userResult[0]['id'];
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
	}
	$usertype = 0;
	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = '".$userid."'");
	$res = $dsql->dsqlOper($sql, "results");
	if($res){
		$userid = $res[0]['id'];
		$usertype = 1;
	}

	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_courses` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_courses` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "不可以重复添加！"}';
			exit();
		}

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`usertype`, `userid`, `title`, `pics`, `coursesdesc`, `coursesrange`, `coursescontent`, `coursesnotes`, `click`, `pubdate`, `weight`, `state`, `typeid`, `rec`) VALUES ('$usertype', '$userid', '$title', '$pics', '$coursesdesc', '$coursesrange', '$coursescontent', '$coursesnotes', '$click', '$pubdate', '$weight', '$state', '$typeid', '$rec')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加交友课程", $userid);
		if($state == 1){
			updateCache("education_courses_list", 300);
			clearCache("education_courses_total", 'key');
		}
		$param = array(
			"service"  => "education",
			"template" => "courses-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("education",$aid,"list");  // 教育机构、课程、新增
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `usertype` = '$usertype', `userid` = '$userid', `title` = '$title', `pics` = '$pics', `coursesdesc` = '$coursesdesc', `coursesrange` = '$coursesrange', `coursescontent` = '$coursescontent', `coursesnotes` = '$coursesnotes',  `click` = '$click', `weight` = '$weight', `state` = '$state', `typeid` = '$typeid', `rec` = '$rec' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改交友课程信息", $id);

			checkCache("education_courses_list", $id);
			clearCache("education_courses_detail", $id);
			clearCache("education_courses_total", 'key');

			$param = array(
				"service"  => "education",
				"template" => "courses-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("education",$id,"list");  // 教育、课程、编辑

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

	//css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/education/educationcoursesAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/education.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('atlasMax', $custom_educationcourses_atlasMax ? $custom_educationcourses_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		if($usertype==1){
			$sql = $dsql->SetQuery("SELECT `userid` FROM `#@__education_store` WHERE `id` = ". $userid);
			$res = $dsql->getTypeName($sql);

			$sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $res[0]['userid']);
			$ret = $dsql->getTypeName($sql);
		}else{
			$sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $userid);
			$ret = $dsql->getTypeName($sql);
		}

		$sql = $dsql->SetQuery("SELECT`typename` FROM `#@__education_type` WHERE `id` = ". $typeid);
		$typenameret = $dsql->getTypeName($sql);
		
		$huoniaoTag->assign('userid', $ret[0]['id']);
		$huoniaoTag->assign('username', $ret[0]['username']);
		$huoniaoTag->assign('typename', $typenameret[0]['typename'] ? $typenameret[0]['typename'] : '选择分类');
		
	}else{
		$huoniaoTag->assign('typename', "选择分类");
	}
	$huoniaoTag->assign('usertype', $usertype);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
    $huoniaoTag->assign('coursesnotes', $coursesnotes);
	$huoniaoTag->assign('coursescontent', $coursescontent);
	$huoniaoTag->assign('coursesrange', $coursesrange);
	$huoniaoTag->assign('coursesdesc', $coursesdesc);
	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->assign('rec', $rec);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "education_type")));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
