<?php
/**
 * 添加教师
 *
 * @version        $Id: educationteacherAdd.php 2019-07-10 上午10:21:14 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationteacherAdd.html";

$tab = "education_teacher";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改教师";
	checkPurview("educationteacherEdit");
}else{
	$pagetitle = "添加教师";
	checkPurview("educationteacherAdd");
}
if(empty($suc)) $suc = 0;
if(empty($comid)) $comid = 0;
if(empty($post)) $post = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);

if(!empty($nature)) $nature = join(",", $nature);
if(!empty($naturedesc)) $naturedesc = join(",", $naturedesc);
if(!empty($tag)) $tag = join(",", $tag);

if(empty($certifyState)) $certifyState = 0;
if(empty($healthcertifyState)) $healthcertifyState = 0;
if(empty($cookingcertifyState)) $cookingcertifyState = 0;

$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	//$type = (int)$type;

	//二次验证
	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择培训公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__education_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "培训公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__education_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "培训公司不存在，请在联想列表中选择"}';
			exit();
		}
	}
	$userid = $comResult[0]['userid'];

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_teacher` WHERE `name` = '".$username."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它培训公司，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_teacher` WHERE `name` = '".$username."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它培训公司，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`sex`, `userid`, `company`, `name`, `photo`, `education`, `university`, `educationdesc`, `teachingage`,`educationidea`, `courses`, `idcardFront`, `idcardBack`, `certifyState`, `degree`, `degreestate`, `diploma`, `diplomastate`, `click`, `pubdate`, `weight`, `state`) VALUES ('$sex', '$userid', '$comid', '$username', '$photo', '$education', '$university', '$educationdesc', '$teachingage', '$educationidea', '$courses', '$idcardFront', '$idcardBack', '$certifyState', '$degree', '$degreestate', '$diploma', '$diplomastate', '$click', '$pubdate', '$weight', '$state')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加教师", $userid);
		if($state == 1){
			updateCache("education_teacher_list", 300);
			clearCache("education_teacher_total", 'key');
		}
		$param = array(
			"service"  => "education",
			"template" => "teacher-detail",
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `sex` = '$sex', `userid` = '$userid', `company` = '$comid', `name` = '$username', `photo` = '$photo', `education` = '$education', `university` = '$university', `educationdesc` = '$educationdesc', `teachingage` = '$teachingage',`educationidea` = '$educationidea', `courses` = '$courses', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `certifyState` = '$certifyState', `degree` = '$degree', `degreestate` = '$degreestate', `diploma` = '$diploma', `diplomastate` = '$diplomastate', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改教师信息", $id);

			checkCache("education_teacher_list", $id);
			clearCache("education_teacher_detail", $id);
			clearCache("education_teacher_total", 'key');

			$param = array(
				"service"  => "education",
				"template" => "teacher-detail",
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

	//css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/education/educationteacherAdd.js'
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

	$huoniaoTag->assign('username', $username ? $username : '');

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('userid', $userid);
		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('usernames', $username[0]['username']);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__education_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
		$huoniaoTag->assign('photo', $photo);
		$huoniaoTag->assign('idcardFront', $idcardFront);
		$huoniaoTag->assign('idcardBack', $idcardBack);

		$huoniaoTag->assign('degree', $degree);
		$huoniaoTag->assign('diploma', $diploma);
		
	}
	$huoniaoTag->assign('diplomastate', $diplomastate);
	$huoniaoTag->assign('degreestate', $degreestate);
	$huoniaoTag->assign('university', $university);
    $huoniaoTag->assign('educationdesc', $educationdesc);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('educationidea', $educationidea);
	$huoniaoTag->assign('courses', $courses);
	$huoniaoTag->assign('sex', (int)$sex);

	//学历
	$archives = $dsql->SetQuery("SELECT * FROM `#@__education_item` WHERE `parentid` = 1 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('educationalList', $list);
	$huoniaoTag->assign('education', $education);

	//教龄
	$archives = $dsql->SetQuery("SELECT * FROM `#@__education_item` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('teachingageList', $list);
	$huoniaoTag->assign('teachingage', $teachingage);
	$huoniaoTag->assign('username', $name);

	//实名认证
	$huoniaoTag->assign('certifyStateopt', array('0', '1', '2'));
	$huoniaoTag->assign('certifyStatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('certifyState', $certifyState == "" ? 1 : $certifyState);

	//学位证认证
	$huoniaoTag->assign('degreestateopt', array('0', '1', '2'));
	$huoniaoTag->assign('degreestatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('degreestate', $degreestate == "" ? 1 : $degreestate);

	//毕业证
	$huoniaoTag->assign('diplomastateopt', array('0', '1', '2'));
	$huoniaoTag->assign('diplomastatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('diplomastate', $diplomastate == "" ? 1 : $diplomastate);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
