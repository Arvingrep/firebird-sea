<?php
/**
 * 添加楼盘房源
 *
 * @version        $Id: listingAdd.php 2014-1-8 下午16:34:13 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "listingAdd.html";

$tab = "house_listing";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改楼盘房源";
	checkPurview("listingEdit");
}else{
	$pagetitle = "添加楼盘房源";
	checkPurview("listingAdd");
}

if(!isset($loupanid)) $loupanid = 0;
if(!isset($room)) $room = 1;
if(!isset($hall)) $hall = 0;
if(!isset($guard)) $guard = 0;
if(!isset($area)) $area = 0;
if(!isset($floor)) $floor = 0;
if(!isset($gwid)) $gwid = 0;
if(!isset($salable)) $salable = 0;
if(!empty($launch)) $launch = GetMkTime($launch);

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($loupanid)){
		echo '{"state": 200, "info": "楼盘ID传递错误！"}';
		exit();
	}

	if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入房源名称"}';
		exit();
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择置业顾问"}';
		exit();
	}else{
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$username."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if($userResult){
				//会员
				$gwSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `userid` = ". $userResult[0]['id']);
				$gwname = $dsql->getTypeName($gwSql);

				if(!$gwname){
					echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
					exit();
				}
				$userid = $gwname[0]['id'];
			}else{
				echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
				exit();
			}
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
				exit();
			}
		}
	}

	if(trim($note) == ""){
		echo '{"state": 200, "info": "请输入房源介绍"}';
		exit();
	}

	$flist = array();
	if(count($s_floor) > 0){
		for($i = 0; $i < count($s_floor); $i++){
			if($s_floor[$i] != "" && $s_price[$i] != ""){
				array_push($flist, $s_floor[$i].",".$s_price[$i]);
			}
		}
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`loupan`, `title`, `litpic`, `price`, `room`, `hall`, `guard`, `area`, `bno`, `floor`, `userid`, `salable`, `launch`, `flist`, `note`, `weight`, `state`, `pubdate`) VALUES ('$loupanid', '$title', '$litpic', '$price', '$room', '$hall', '$guard', '$area', '$bno', '$floor', '$userid', '$salable', '$launch', '".join("|", $flist)."', '$note', '$weight', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	//保存图集表
	if($imglist != ""){
		$picList = explode(",",$imglist);
		foreach($picList as $k => $v){
			$picInfo = explode("|", $v);
			$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('listing', '$aid', '$picInfo[0]', '$picInfo[1]')");
			$dsql->dsqlOper($pics, "update");
		}
	}

	if($aid){
		adminLog("添加楼盘房源信息", $title);

		$param = array(
			"service"  => "house",
			"template" => "loupan-listing-detail",
			"id"       => $loupanid,
			"aid"      => $aid
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `litpic` = '$litpic', `price` = '$price', `room` = '$room', `hall` = '$hall', `guard` = '$guard', `area` = '$area', `bno` = '$bno', `floor` = '$floor', `userid` = '$userid', `salable` = '$salable', `launch` = '$launch', `flist` = '".join("|", $flist)."', `note` = '$note', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//先删除文档所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$id);
		$dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",", $imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('listing', '$id', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		if($results == "ok"){
			adminLog("修改楼盘房源信息", $title);

			$param = array(
				"service"  => "house",
				"template" => "loupan-listing-detail",
				"id"       => $loupanid,
				"aid"      => $id
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

			$title    = $results[0]['title'];
			$litpic   = $results[0]['litpic'];
			$price    = $results[0]['price'];
			$room     = $results[0]['room'];
			$hall     = $results[0]['hall'];
			$guard    = $results[0]['guard'];
			$area     = $results[0]['area'];
			$bno      = $results[0]['bno'];
			$floor    = $results[0]['floor'];
			$userid   = $results[0]['userid'];
			$salable  = $results[0]['salable'];
			$launch   = $results[0]['launch'];

			$flistArr    = $results[0]['flist'];
			$flist = array();
			if(!empty($flistArr)){
				$flistArr = explode("|", $flistArr);
				if(count($flistArr) > 0){
					foreach($flistArr as $key => $val){
						$v = explode(",", $val);
						$flist[$key]['floor'] = $v[0];
						$flist[$key]['price'] = $v[1];
					}
				}
			}

			$note     = $results[0]['note'];

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = $value["picPath"];
					$imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

			$weight   = $results[0]['weight'];
			$state    = $results[0]['state'];

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
		'swfupload/swfupload.js',
		'swfupload/handlers.js',
		'admin/house/listingAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/house.inc.php");
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

	$huoniaoTag->assign('loupanid', $loupanid);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('price', $price);
	//室
	$list = array();
	for($i = 1; $i < 11; $i++){
		$list[$i] = $i;
	}
	$huoniaoTag->assign('roomList', $list);
	$huoniaoTag->assign('room', $room == "" ? 0 : $room);
	//厅
	$list = array();
	for($i = 0; $i < 11; $i++){
		$list[$i] = $i;
	}
	$huoniaoTag->assign('hallList', $list);
	$huoniaoTag->assign('hall', $hall == "" ? 0 : $hall);
	//卫
	$list = array();
	for($i = 0; $i < 11; $i++){
		$list[$i] = $i;
	}
	$huoniaoTag->assign('guardList', $list);
	$huoniaoTag->assign('guard', $guard == "" ? 0 : $guard);

	$huoniaoTag->assign('area', $area == 0 ? "" : $area);
	$huoniaoTag->assign('bno', $bno);
	$huoniaoTag->assign('floor', $floor == 0 ? "" : $floor);

	$username = "";
	if($userid != 0){
		//会员
		$gwSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_gw` WHERE `id` = ". $userid);
		$gwname = $dsql->getTypeName($gwSql);

		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $gwname[0]['userid']);
		$username = $dsql->getTypeName($userSql);
		$username = $username[0]['username'];
	}
	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('username', $username);

	$huoniaoTag->assign('salable', $salable == 0 ? "" : $salable);
	$huoniaoTag->assign('launch', $launch == "" ? "" : date("Y-m-d", $launch));
	$huoniaoTag->assign('flist', $flist);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
