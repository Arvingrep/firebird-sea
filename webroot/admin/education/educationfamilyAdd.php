<?php

/**
 * 添加家教
 *
 * @version        $Id: educationfamilyAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationfamilyAdd.html";

$tab = "education_tutor";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改家教";
	checkPurview("educationfamilyEdit");
}else{
	$pagetitle = "添加家教";
	checkPurview("educationfamilyAdd");
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

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "该会员已管理其他家教，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__education_tutor` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "该会员已管理其他家教，不可以重复添加！"}';
			exit();
		}

	}

	if(!empty($teachingtime)){
		$teachingtime = serialize($teachingtime);
	}else{
		$teachingtime = '';
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`catid`, `teachingage`, `sex`, `username`, `usertype`, `userid`, `cityid`, `addrid`, `photo`, `education`, `university`, `subjects`, `idcardFront`, `idcardBack`, `certifyState`, `degree`, `degreestate`, `diploma`, `diplomastate`, `price`, `typeid`, `areacityid`, `areaaddrid`, `area`, `teachingtime`, `note`, `tel`, `click`, `pubdate`, `weight`, `state`, `rec`) VALUES ('$catid', '$teachingage', '$sex', '$username', '$usertype', '$userid', '$cityid', '$addrid', '$photo', '$education', '$university', '$subjects', '$idcardFront', '$idcardBack', '$certifyState', '$degree', '$degreestate', '$diploma', '$diplomastate', '$price', '$typeid', '$areacityid', '$areaaddrid', '$area', '$teachingtime', '$note', '$tel', '$click', '$pubdate', '$weight', '$state', '$rec')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加家教", $userid);
		if($state == 1){
			updateCache("education_tutor_list", 300);
			clearCache("education_tutor_total", 'key');
		}
		$param = array(
			"service"  => "education",
			"template" => "tutor-detail",
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `catid` = '$catid', `teachingage` = '$teachingage', `sex` = '$sex', `username` = '$username', `usertype` = '$usertype', `userid` = '$userid', `cityid` = '$cityid', `addrid` = '$addrid', `photo` = '$photo', `education` = '$education', `university` = '$university', `subjects` = '$subjects', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `certifyState` = '$certifyState', `degree` = '$degree', `degreestate` = '$degreestate', `diploma` = '$diploma', `diplomastate` = '$diplomastate', `price` = '$price', `typeid` = '$typeid', `areacityid` = '$areacityid', `areaaddrid` = '$areaaddrid', `area` = '$area', `teachingtime` = '$teachingtime', `note` = '$note', `tel` = '$tel', `click` = '$click', `weight` = '$weight', `state` = '$state', `rec` = '$rec' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改家教信息", $id);

			checkCache("education_tutor_list", $id);
			clearCache("education_tutor_detail", $id);
			clearCache("education_tutor_total", 'key');

			$param = array(
				"service"  => "education",
				"template" => "tutor-detail",
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
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/education/educationfamilyAdd.js'
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
	$huoniaoTag->assign('atlasMax', $custom_educationfamily_atlasMax ? $custom_educationfamily_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		if($usertype==1){
			$sql = $dsql->SetQuery("SELECT `userid` FROM `#@__education_store` WHERE `id` = ". $userid);
			$res = $dsql->getTypeName($sql);
			
			if($res){
				$sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $res[0]['userid']);
				$ret = $dsql->getTypeName($sql);
			}
		}else{
			$sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $userid);
			$ret = $dsql->getTypeName($sql);
		}
		if($ret){
			$huoniaoTag->assign('userid', $ret[0]['id']);
			$huoniaoTag->assign('username', $ret[0]['username']);
		}

		$sql = $dsql->SetQuery("SELECT`typename` FROM `#@__education_type` WHERE `id` = ". $catid);
		$typenameret = $dsql->getTypeName($sql);
		$huoniaoTag->assign('catname', $typenameret[0]['typename'] ? $typenameret[0]['typename'] : '选择分类');
		
	}else{
		$huoniaoTag->assign('catname', "选择分类");
	}
	$huoniaoTag->assign('usertype', $usertype);
	$huoniaoTag->assign('tutorname', $username);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('catid', $catid);
	$huoniaoTag->assign('cityid', $cityid);
	$huoniaoTag->assign('addrid', $addrid);
	$huoniaoTag->assign('photo', $photo);
	$huoniaoTag->assign('university', $university);
	$huoniaoTag->assign('subjects', $subjects);
	$huoniaoTag->assign('idcardFront', $idcardFront);
	$huoniaoTag->assign('idcardBack', $idcardBack);
	$huoniaoTag->assign('certifyState', $certifyState);
	$huoniaoTag->assign('degree', $degree);
	$huoniaoTag->assign('degreestate', $degreestate);
	$huoniaoTag->assign('diploma', $diploma);
	$huoniaoTag->assign('diplomastate', $diplomastate);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('areacityid', $areacityid);
	$huoniaoTag->assign('areaaddrid', $areaaddrid);
	$huoniaoTag->assign('area', $area);
	$teachingtime = !empty($teachingtime) ? unserialize($teachingtime) : '';//print_R($teachingtime);exit;
	$huoniaoTag->assign('teachingtime', $teachingtime);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('sex', $sex);
	$huoniaoTag->assign('tel', $tel);

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

	//分类
	include_once HUONIAOROOT."/api/handlers/education.class.php";
	$education = new education();
	$educationTypeList = $education->typeid_type();

	$huoniaoTag->assign('typeidopt', array_column($educationTypeList, "id"));
	$huoniaoTag->assign('typeidnames', array_column($educationTypeList, "typename"));
	$huoniaoTag->assign('typeid', (int)$typeid);

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
