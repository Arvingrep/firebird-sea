<?php
/**
 * 添加景点门票
 *
 * @version        $Id: travelticketAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelticketAdd.html";

$tab = "travel_ticket";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改景点门票";
	checkPurview("travelticketEdit");
}else{
	$pagetitle = "添加景点门票";
	checkPurview("travelticketAdd");
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($flag)) $flag = 0;
if(empty($rec)) $rec = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(!empty($lnglat)){
	$lnglatArr = explode(',', $lnglat);
	$lng = $lnglatArr[0];
	$lat = $lnglatArr[1];
}
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

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_ticket` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它所属店铺，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_ticket` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它所属店铺，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`flag`, `rec`, `title`, `company`, `cityid`, `addrid`, `address`, `lng`, `lat`, `pics`, `video`, `opentime`, `tag`, `click`, `pubdate`, `weight`, `state`, `travelname`, `note`,`jdnote`,`mbody`) VALUES ('$flag', '$rec', '$title', '$comid', '$cityid', '$addrid', '$address', '$lng', '$lat', '$pics', '$video', '$opentime', '$tag', '$click', '$pubdate', '$weight', '$state', '$travelname', '$note','$jdnote','$mbody')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加景点门票", $userid);
		if($state == 1){
			updateCache("travel_ticket_list", 300);
			clearCache("travel_ticket_total", 'key');
		}
		$param = array(
			"service"  => "travel",
			"template" => "ticket-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("travel",$aid,"ticket");  // 景点门票-新增
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag', `rec` = '$rec', `title` = '$title', `company` = '$comid', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `pics` = '$pics', `video` = '$video', `opentime` = '$opentime', `tag` = '$tag', `click` = '$click', `weight` = '$weight', `state` = '$state', `travelname` = '$travelname', `note` = '$note',`jdnote`='$jdnote',`mbody`='$mbody' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改景点门票信息", $id);

			checkCache("travel_ticket_list", $id);
			clearCache("travel_ticket_detail", $id);
			clearCache("travel_ticket_total", 'key');

			$param = array(
				"service"  => "travel",
				"template" => "ticket-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("travel",$id,"ticket");  // 景点门票-修改

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
			$lnglat       = !empty($lng) && !empty($lat) ? $lng . ',' . $lat : '';
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
		'admin/travel/travelticketAdd.js'
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
	$huoniaoTag->assign('atlasMax', $custom_travelticket_atlasMax ? $custom_travelticket_atlasMax : 9);

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
	$huoniaoTag->assign('video', $video ? $video : '');
    $huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('tag', $tag);
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('opentime', $opentime);
	$huoniaoTag->assign('travelname', $travelname);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('jdnote', $jdnote);
	$huoniaoTag->assign('rec', $rec);

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
