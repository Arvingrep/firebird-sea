<?php
/**
 * 添加周边游
 *
 * @version        $Id: travelagencyAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelagencyAdd.html";

$tab = "travel_agency";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改周边游";
	checkPurview("travelagencyEdit");
}else{
	$pagetitle = "添加周边游";
	checkPurview("travelagencyAdd");
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($flag)) $flag = 0;
if(empty($click)) $click = mt_rand(50, 200);
$pubdate  = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择所属店铺"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "所属店铺不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "所属店铺不存在，请在联想列表中选择"}';
			exit();
		}
	}

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_agency` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它所属店铺，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_agency` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它所属店铺，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`flag`, `tag`, `imglist`, `title`, `company`, `cityid`, `addrid`, `address`, `typeid`, `missiontime`, `missiontype`,`ywday`,`travelservice`, `note`, `itinerary`, `expense`, `instructions`, `pics`, `video`, `click`, `pubdate`, `weight`, `state`) VALUES ('$flag', '$tag', '$imglist', '$title', '$comid', '$cityid', '$addrid', '$address', '$typeid', '$missiontime', '$missiontype','$ywday','$travelservice', '$note', '$itinerary', '$expense', '$instructions', '$pics', '$video', '$click', '$pubdate', '$weight', '$state')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加周边游", $userid);
		if($state == 1){
			updateCache("travel_agency_list", 300);
			clearCache("travel_agency_total", 'key');
		}
		$param = array(
			"service"  => "travel",
			"template" => "agency-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
		if($typeid==1){
            dataAsync("travel",$aid,"grouptravel");  // 编辑周边游
        }else{
            dataAsync("travel",$aid,"daytravel");  // 编辑周边游
        }
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag', `tag` = '$tag', `imglist` = '$imglist', `title` = '$title', `company` = '$comid', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `typeid` = '$typeid', `missiontime` = '$missiontime',`missiontype`='$missiontype',`ywday` = '$ywday' ,`travelservice` = '$travelservice', `note` = '$note', `itinerary` = '$itinerary', `expense` = '$expense', `instructions` = '$instructions', `pics` = '$pics', `video` = '$video', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改周边游信息", $id);

			checkCache("travel_agency_list", $id);
			clearCache("travel_agency_detail", $id);
			clearCache("travel_agency_total", 'key');

			$param = array(
				"service"  => "travel",
				"template" => "agency-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("travel",$id,"grouptravel");  // 新增周边游
            dataAsync("travel",$id,"daytravel");  // 新增周边游

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
		'admin/travel/travelagencyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/travel.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('atlasMax', $custom_travelagency_atlasMax ? $custom_travelagency_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__travel_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);

	}
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
	$huoniaoTag->assign('imglist', $imglist ? json_encode(explode(",", $imglist)) : "[]");
	$huoniaoTag->assign('video', $video ? $video : '');
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('missiontime', $missiontime);
	$huoniaoTag->assign('tag', $tag);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('expense', $expense);
	$huoniaoTag->assign('instructions', $instructions);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('flag', $flag);
	$huoniaoTag->assign('travelservice', $travelservice);
	$huoniaoTag->assign('missiontype', $missiontype);
	$huoniaoTag->assign('ywday', $ywday);

	$itineraryArr = array();
	if(!empty($itinerary)){
		$itinerary = explode("|||", $itinerary);
		foreach ($itinerary as $key => $value) {
			$val = explode("$$$", $value);
			$itineraryArr[$key]['title'] = $val[0];
			$itineraryArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('itinerary', $itineraryArr);

	//分类
	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$travelTypeList = $travel->travelagency_type();

	$huoniaoTag->assign('typeidopt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('typeidnames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('typeid', $typeid ? $typeid : 0);

	//分类
	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$travelTypeList = $travel->star_type();

	$huoniaoTag->assign('flagopt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('flagnames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('flag', $flag? $flag : 0);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
