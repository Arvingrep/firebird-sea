<?php
/**
 * 添加顾问
 *
 * @version        $Id: gwUserAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "gwUserAdd.html";

$tab = "car_adviser";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改顾问";
	checkPurview("gwUserEdit");
}else{
	$pagetitle = "添加顾问";
	checkPurview("gwUserAdd");
}
if(empty($suc)) $suc = 0;
if(empty($comid)) $comid = 0;
if(empty($post)) $post = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(empty($suc)) $suc = 0;
$quality = (int)$quality;
$joindate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	$type = (int)$type;

	//二次验证
	if($type == 0){
		if($comid == 0 && trim($comid) == ''){
			echo '{"state": 200, "info": "请选择经销商"}';
			exit();
		}
		if($comid == 0){
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `title` = '".$zjcom."'");
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "经销商不存在，请在联想列表中选择"}';
				exit();
			}
			$comid = $comResult[0]['id'];
		}else{
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `id` = ".$comid);
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "经销商不存在，请在联想列表中选择"}';
				exit();
			}
		}
	}else{
		$comid = 0;
		$post = 0;
	}

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

	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它经销商，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它经销商，不可以重复添加！"}';
			exit();
		}

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`userid`, `name`, `store`, `tel`, `cityid`, `addr`, `litpic`, `click`, `weight`, `state`, `pubdate`, `quality`, `suc`, `joindate`) VALUES ('$userid', '$name', '$comid', '$tel', '$cityid', '$addr', '$litpic', '$click', '$weight', '$state', '$joindate', '$quality', '$suc', '$joindate')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加顾问", $userid);
		$param = array(
			"service"  => "car",
			"template" => "store-detail",
			"id"       => $comid
		);
		$url = getUrlPath($param);

		if($state == 1){
			updateCache("car_adviser_list", 300);
			clearCache("car_adviser_total", 'key');
		}

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `suc` = '$suc', `userid` = '$userid', `name` = '$name', `store` = '$comid', `tel` = '$tel', `cityid` = '$cityid', `addr` = '$addr', `litpic` = '$litpic', `click` = '$click', `weight` = '$weight', `state` = '$state', `quality` = '$quality' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改顾问信息", $id);

			// 检查缓存
			checkCache("car_adviser_list", $id);
			clearCache("car_adviser_detail", $id);
			clearCache("car_adviser_total", 'key');

			$param = array(
				"service"  => "car",
				"template" => "store-detail",
				"id"       => $comid
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

			$userid    = $results[0]['userid'];
			$store     = $results[0]['store'];
			$addr      = $results[0]['addr'];
			$litpic    = $results[0]['litpic'];
			$weight    = $results[0]['weight'];
			$click     = $results[0]['click'];
			$state     = $results[0]['state'];
			$cityid    = $results[0]['cityid'];
			$tel       = $results[0]['tel'];
			$name      = $results[0]['name'];
			$quality   = $results[0]['quality'];
			$suc       = $results[0]['suc'];

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
		'admin/car/gwUserAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/car.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('userid', $userid);
		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('username', $username[0]['username']);

		$huoniaoTag->assign('comid', $store);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__car_store` WHERE `id` = ". $store);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);

		$huoniaoTag->assign('litpic', $litpic);
	}

	$huoniaoTag->assign('addr', $addr == "" ? 0 : $addr);
    $huoniaoTag->assign('cityid', (int)$cityid);

	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('name', $name);
	$huoniaoTag->assign('quality', (int)$quality);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('flag', $flag == "" ? 1 : $flag);

	//独立顾问
	$huoniaoTag->assign('typeopt', array('0', '1'));
	$huoniaoTag->assign('typenames',array('否','是'));
	$huoniaoTag->assign('type', $store == "" || $store != 0 ? 0 : 1);

	$huoniaoTag->assign('postList', array("0" => "请选择", "2" => "店长", "1" => "经理"));
	$huoniaoTag->assign('post', $post == "" ? 0 : $post);

	$huoniaoTag->assign('suc', (int)$suc);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
