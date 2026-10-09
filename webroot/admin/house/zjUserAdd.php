<?php
/**
 * 添加经纪人
 *
 * @version        $Id: zjUserAdd.php 2014-1-20 上午00:21:14 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "zjUserAdd.html";

$tab = "house_zjuser";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改经纪人";
	checkPurview("zjUserEdit");
}else{
	$pagetitle = "添加经纪人";
	checkPurview("zjUserAdd");
}
if(empty($suc)) $suc = 0;
if(empty($comid)) $comid = 0;
if(empty($post)) $post = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	$type = (int)$type;

	//二次验证
	if($type == 0){
		if($comid == 0 && trim($comid) == ''){
			echo '{"state": 200, "info": "请选择中介公司"}';
			exit();
		}
		if($comid == 0){
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `title` = '".$zjcom."'");
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "中介公司不存在，请在联想列表中选择"}';
				exit();
			}
			$comid = $comResult[0]['id'];
		}else{
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `id` = ".$comid);
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "中介公司不存在，请在联想列表中选择"}';
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

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它中介公司，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它中介公司，不可以重复添加！"}';
			exit();
		}

	}

}

if($dopost == "save" && $submit == "提交"){

	//读取经纪人免费套餐的配置，每个经纪人新建时都应用一个免费的套餐配置
	include(HUONIAOINC . "/config/house.inc.php");
	$trialFree = unserialize($custom_zjuserPriceFree);
	$nowTime = GetMktime(time());
	$expired = $nowTime + 86400*365*999; //过期时间设置为很长
	$meal = array(
		"name"    => '经纪人免费套餐',
		"type"    => 0,
		"item"    => 0,
		"began"   => (int)$nowTime,
		"expired" => (int)$expired,
		"house"   => (int)$trialFree['house'],
		"refresh" => (int)$trialFree['refresh'],
		"settop"  => (int)$trialFree['settop'],
	);
	$meal = serialize($meal);

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `userid`, `zjcom`, `store`, `addr`, `community`, `litpic`, `note`, `weight`, `click`, `state`, `flag`, `pubdate`, `wx`, `wxQr`, `qq`, `qqQr`, `license`, `post`, `suc`, `ext_title_1`, `ext_val_1`, `ext_title_2`, `ext_val_2`, `meal`) VALUES ('$cityid', '$userid', '$comid', '$store', '$addr', '$community', '$litpic', '$note', '$weight', '$click', '$state', '$flag', '".GetMkTime(time())."', '$wx', '$wxQr', '$qq', '$qqQr', '$license', $post, $suc, '$ext_title_1', '$ext_val_1', '$ext_title_2', '$ext_val_2', '$meal')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		if($state == 1){
			updateCache("house_zjuser_list", 300);
			clearCache("house_zjuser_list", "key");
			clearCache("house_zjuser_total", "key");
		}

		adminLog("添加经纪人", $userid);
		$param = array(
			"service"  => "house",
			"template" => "broker-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		updateZjuserHouse($userid, $aid);
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		$sql = $dsql->SetQuery("SELECT `userid`, `state` FROM `#@__".$tab."` WHERE `id` = $id");
		$res = $dsql->dsqlOper($sql, "results");
		if(!$res){
			echo '{"state": 200, "info": '.json_encode('信息不存在，或已经删除！').'}';
		}
		$userid_old = $res[0]['userid'];
		$state_     = $res[0]['state'];

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `userid` = '$userid', `zjcom` = '$comid', `store` = '$store', `addr` = '$addr', `community` = '$community', `litpic` = '$litpic', `note` = '$note', `weight` = '$weight', `click` = '$click', `state` = '$state', `flag` = '$flag', `wx` = '$wx', `wxQr` = '$wxQr', `qq` = '$qq', `qqQr` = '$qqQr', `license` = '$license', `post` = $post, `suc` = $suc, `ext_title_1` = '$ext_title_1', `ext_val_1` = '$ext_val_1', `ext_title_2` = '$ext_title_2', `ext_val_2` = '$ext_val_2' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			// 清除缓存
			clearCache("house_zjuser_detail", $id);
			checkCache("house_zjuser_list", $id);
			if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
				clearCache("house_zjuser_total", "key");
			}

			adminLog("修改经纪人信息", $aid);

			$param = array(
				"service"  => "house",
				"template" => "broker-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);

			if($userid != $userid_old){
				updateZjuserHouse2($userid_old, $id);
				updateZjuserHouse($userid, $id);
			}

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
			$zjcom     = $results[0]['zjcom'];
			$store     = $results[0]['store'];
			$addr      = $results[0]['addr'];
			$community = $results[0]['community'];
			$litpic    = $results[0]['litpic'];
			$note      = $results[0]['note'];
			$weight    = $results[0]['weight'];
			$click     = $results[0]['click'];
			$state     = $results[0]['state'];
			$flag      = $results[0]['flag'];
			$cityid    = $results[0]['cityid'];
			$qq        = $results[0]['qq'];
			$qqQr      = $results[0]['qqQr'];
			$wx        = $results[0]['wx'];
			$wxQr      = $results[0]['wxQr'];
			$license   = $results[0]['license'];
			$post      = $results[0]['post'];
			$suc       = $results[0]['suc'];
            $ext_title_1 = $results[0]['ext_title_1'];
            $ext_val_1 = $results[0]['ext_val_1'];
            $ext_title_2 = $results[0]['ext_title_2'];
            $ext_val_2 = $results[0]['ext_val_2'];

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
		'admin/house/zjUserAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/house.inc.php");
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

		$huoniaoTag->assign('comid', $zjcom);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_zjcom` WHERE `id` = ". $zjcom);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);

		$huoniaoTag->assign('store', $store);
		$huoniaoTag->assign('litpic', $litpic);
		$huoniaoTag->assign('note', $note);
	}

	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->assign('addr', $addr == "" ? 0 : $addr);
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('community', $community);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('click', $click);

	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('qqQr', $qqQr);
	$huoniaoTag->assign('wx', $wx);
	$huoniaoTag->assign('wxQr', $wxQr);
	$huoniaoTag->assign('license', $license);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('flag', $flag == "" ? 1 : $flag);

	//独立经纪人
	$huoniaoTag->assign('typeopt', array('0', '1'));
	$huoniaoTag->assign('typenames',array('否','是'));
	$huoniaoTag->assign('type', $zjcom == "" || $zjcom != 0 ? 0 : 1);

	$huoniaoTag->assign('postList', array("0" => "请选择", "2" => "店长", "1" => "经理"));
	$huoniaoTag->assign('post', $post == "" ? 0 : $post);
    
    $huoniaoTag->assign('ext_title_1', $ext_title_1);
    $huoniaoTag->assign('ext_val_1', $ext_val_1);
    $huoniaoTag->assign('ext_title_2', $ext_title_2);
    $huoniaoTag->assign('ext_val_2', $ext_val_2);

	$huoniaoTag->assign('suc', (int)$suc);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
// 入驻经纪人
function updateZjuserHouse($userid, $aid){
	global $dsql;
	//更新当前会员下已经发布的房源信息性质
	$sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_cw` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
	$dsql->dsqlOper($sql, "update");
}
// 取消经纪人身份 
function updateZjuserHouse2($userid, $aid){
	global $dsql;
	//更新当前会员下已经发布的房源信息性质
	$sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
	$sql = $dsql->SetQuery("UPDATE `#@__house_cw` SET `usertype` = 0, `userid` = $userid WHERE `userid` = $aid AND `usertype` = 1");
	$dsql->dsqlOper($sql, "update");
}