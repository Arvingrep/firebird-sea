<?php
/**
 * 添加装修招标
 *
 * @version        $Id: renovationZhaobiaoAdd.php 2014-3-4 下午13:03:11 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationZhaobiaoAdd.html";

$tab = "renovation_zhaobiao";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改装修招标";
	checkPurview("renovationZhaobiaoEdit");
}else{
	$pagetitle = "添加装修招标";
	checkPurview("renovationZhaobiaoAdd");
}

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
//	if(empty($btype)){
//		echo '{"state": 200, "info": "请选择装修类型！"}';
//		exit();
//	}

	if(empty($budget)){
		echo '{"state": 200, "info": "请选择装修预算！"}';
		exit();
	}

	if(empty($addrid)){
		echo '{"state": 200, "info": "请选择所在区域！"}';
		exit();
	}

	if(empty($community)){
		echo '{"state": 200, "info": "请输入小区名称！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入详细地址！"}';
		exit();
	}

	if(empty($area)){
		echo '{"state": 200, "info": "请输入建筑面积！"}';
		exit();
	}

//	if(empty($start)){
//		echo '{"state": 200, "info": "请选择开工时间！"}';
//		exit();
//	}
//
//	if(empty($end)){
//		echo '{"state": 200, "info": "请选择结束时间！"}';
//		exit();
//	}

	if($userid != 0 && trim($user) != ''){
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
	}

	if(empty($people)){
		echo '{"state": 200, "info": "请输入联系人！"}';
		exit();
	}

	if(empty($contact)){
		echo '{"state": 200, "info": "请输入联系电话！"}';
		exit();
	}
//
//	if(empty($appointment)){
//		echo '{"state": 200, "info": "请选择预约时间！"}';
//		exit();
//	}
	if(empty($unittype)){
		echo '{"state": 200, "info": "请选择户型结构！"}';
		exit();
	}
	//标题组合：地区+小区名+户型+面积+类型+"招标"
	$title = "";
	$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` =".$addrid);
	$results = $dsql->dsqlOper($archives, "results");
	$title .= $results[0]['typename'];

	$title .= $community;
	$title .= $area."㎡";

//	$archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` =".$btype);
//	$results = $dsql->dsqlOper($archives, "results");
//	$title .= $results[0]['typename'];
//
//	$title .= "招标";

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `btype`,`unittype`, `budget`, `addrid`, `community`, `address`, `nature`, `area`, `floorplans`, `start`, `end`, `note`, `userid`, `people`, `contact`, `email`, `qq`, `appointment`, `weight`, `click`, `state`, `pubdate`) VALUES ('$cityid', '$title', '$btype', '$unittype','$budget', '$addrid', '$community', '$address', '$nature', '$area', '$litpic', '".GetMkTime($start)."', '".GetMkTime($end)."', '$note', '$userid', '$people', '$contact', '$email', '$qq', '$appointment', '$weight', '$click', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加装修招标", $title);

		$param = array(
			"service"     => "renovation",
			"template"    => "zb-detail",
			"id"          => $aid
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `btype` = '$btype',`unittype` = '$unittype', `budget` = '$budget', `addrid` = '$addrid', `community` = '$community', `address` = '$address', `nature` = '$nature', `area` = '$area', `floorplans` = '$litpic', `start` = '".GetMkTime($start)."', `end` = '".GetMkTime($end)."', `note` = '$note', `userid` = '$userid', `people` = '$people', `contact` = '$contact', `email` = '$email', `qq` = '$qq', `appointment` = '$appointment', `weight` = '$weight', `click` = '$click', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改装修招标", $title);

			$param = array(
				"service"     => "renovation",
				"template"    => "zb-detail",
				"id"          => $id
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

			$btype       = $results[0]['btype'];
			$unittype    = $results[0]['unittype'];
			$budget      = $results[0]['budget'];
			$addrid      = $results[0]['addrid'];
			$community   = $results[0]['community'];
			$address     = $results[0]['address'];
			$nature      = $results[0]['nature'];
			$area        = $results[0]['area'];
			$floorplans  = $results[0]['floorplans'];
			$start       = $results[0]['start'];
			$end         = $results[0]['end'];
			$note        = $results[0]['note'];
			$userid      = $results[0]['userid'];
			$people      = $results[0]['people'];
			$contact     = $results[0]['contact'];
			$email       = $results[0]['email'];
			$qq          = $results[0]['qq'];
			$appointment = $results[0]['appointment'];
			$weight      = $results[0]['weight'];
			$click       = $results[0]['click'];
			$state       = $results[0]['state'];
			$cityid      = $results[0]['cityid'];

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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/renovation/renovationZhaobiaoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/renovation.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('id', $id);

	//类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 7 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$btypeopt = $btypenames = array();
	foreach($results as $value){
		array_push($btypeopt, $value['id']);
		array_push($btypenames, $value['typename']);
	}
	$huoniaoTag->assign('btypeopt', $btypeopt);
	$huoniaoTag->assign('btypenames', $btypenames);
	$huoniaoTag->assign('btype', $btype == "" ? $btypeopt[0] : $btype);

	//户型
	$hxsql  = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid`= 8 ORDER BY `weight` ASC");
	$hxres  = $dsql->dsqlOper($hxsql,"results");
	$hxopt = $hxnames = array();
	foreach($hxres as $value){
		array_push($hxopt, $value['id']);
		array_push($hxnames, $value['typename']);
	}
	$huoniaoTag->assign('hxopt', $hxopt);
	$huoniaoTag->assign('hxnames', $hxnames);
	$huoniaoTag->assign('unittype', $unittype == "" ? $hxopt[0] : $unittype);


	//预算
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 6 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('budgetList', $list);
	$huoniaoTag->assign('budget', $budget == "" ? 0 : $budget);

	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('addrListArr', array());
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('community', $community);
	$huoniaoTag->assign('address', $address);

	//性质
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 1 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$natureopt = $naturenames = array();
	foreach($results as $value){
		array_push($natureopt, $value['id']);
		array_push($naturenames, $value['typename']);
	}
	$huoniaoTag->assign('natureopt', $natureopt);
	$huoniaoTag->assign('naturenames', $naturenames);
	$huoniaoTag->assign('nature', $nature == "" ? $natureopt[0] : $nature);

	$huoniaoTag->assign('area', $area);
	$huoniaoTag->assign('floorplans', $floorplans);
	$huoniaoTag->assign('start', $start ? date("Y-m-d", $start) : "");
	$huoniaoTag->assign('end', $end ? date("Y-m-d", $end) : "");
	$huoniaoTag->assign('note', $note);

	if(!empty($userid)){
		$huoniaoTag->assign('userid', $userid);
		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('username', $username[0]['username']);
	}

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('email', $email);
	$huoniaoTag->assign('qq', $qq);

	//预约时间
	$huoniaoTag->assign('appointmentList',array(0 => '请选择', 1 => '随时联系', 2 => '上午', 3 => '下午', 4 =>'晚上'));
	$huoniaoTag->assign('appointment', $appointment == "" ? 0 : $appointment);

	$huoniaoTag->assign('click', empty($click) ? "1" : $click);
	$huoniaoTag->assign('weight', empty($weight) ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2', '3', '4'));
	$huoniaoTag->assign('statenames',array('待审核', '招标中', '招标成功', '招标结束', '停止招标'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
