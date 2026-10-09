<?php
/**
 * 添加小区
 *
 * @version        $Id: renovationCommunityAdd.php 2015-2-4 上午00:18:12 $
 * @package        HuoNiao.renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationCommunityAdd.html";

$tab = "renovation_community";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改小区信息";
	checkPurview("renovationCommunity");
}else{
	$pagetitle = "添加新小区";
	checkPurview("renovationCommunity");
}

if(!isset($weight)) $weight = 1;
if(!isset($click)) $click = 1;
if(!isset($state)) $state = 0;
if(empty($buildage)) $buildage = 0;
if(empty($planarea)) $planarea = 0;
if(empty($buildarea)) $buildarea = 0;
if(empty($planhouse)) $planhouse = 0;
if(empty($rongji)) $rongji = 0;
if(empty($green)) $green = 0;
if(empty($zhuangxiu)) $zhuangxiu = 0;
if(!empty($opendate)) $opendate = GetMkTime($opendate);
if(!empty($protype)) $protype = join(",", $protype);
if(!empty($buildlist)) $buildlist = join(",", $buildlist);

if($_POST['submit'] == "提交" &&$dopost!= 'updateeditpic'){
	if($token == "") die('token传递失败！');
	//二次验证
	if(trim($title) == ""){
		echo '{"state": 200, "info": "小区名称不能为空"}';
		exit();
	}
	if(trim($addrid) == ""){
		echo '{"state": 200, "info": "请选择区域板块"}';
		exit();
	}
	if(trim($address) == ""){
		echo '{"state": 200, "info": "小区地址不能为空"}';
		exit();
	}
	if(trim($price) == ""){
		echo '{"state": 200, "info": "报价不能为空"}';
		exit();
	}
	if(empty($protype)){
		echo '{"state": 200, "info": "请选择物业类型"}';
		exit();
	}
	if(trim($opendate) == ""){
		echo '{"state": 200, "info": "竣工时间不能为空"}';
		exit();
	}
}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `litpic`, `addrid`, `address`, `lnglat`, `price`, `protype`, `tese`, `zhuangxiu`, `kfs`, `buildage`, `opendate`, `buildtype`, `huanxian`, `rongji`, `green`, `proprice`, `property`, `buildarea`, `planarea`, `planhouse`, `note`, `config`, `pics`, `click`, `weight`, `state`, `pubdate`) VALUES ('$cityid', '$title', '$litpic', '$addrid', '$address', '$lnglat', '$price', '$protype', '$tese', '$zhuangxiu', '$kfs', '$buildage', '$opendate', '$buildtype', '$huanxian', '$rongji', '$green', '$proprice', '$property', '$buildarea', '$planarea', '$planhouse', '$note', '$config', '$imglist', '$click', '$weight', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加小区信息", $title);

		$param = array(
			"service"  => "renovation",
			"template" => "community",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){
	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `litpic` = '$litpic', `addrid` = '$addrid', `address` = '$address', `lnglat` = '$lnglat', `price` = '$price', `protype` = '$protype', `tese` = '$tese', `zhuangxiu` = '$zhuangxiu', `kfs` = '$kfs', `buildage` = '$buildage', `opendate` = '$opendate', `buildtype` = '$buildtype', `huanxian` = '$huanxian', `rongji` = '$rongji', `green` = '$green', `proprice` = '$proprice', `property` = '$property', `buildarea` = '$buildarea', `planarea` = '$planarea', `planhouse` = '$planhouse', `note` = '$note', `config` = '$config', `pics` = '$imglist', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改小区信息", $title);

			$param = array(
				"service"  => "renovation",
				"template" => "community",
				"id"       => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title     = $results[0]['title'];
			$litpic    = $results[0]['litpic'];
			$addrid    = $results[0]['addrid'];
			$address   = $results[0]['address'];
			$lnglat    = $results[0]['lnglat'];
			$price     = $results[0]['price'];
			$protype   = $results[0]['protype'];
			$tese      = $results[0]['tese'];
			$zhuangxiu = $results[0]['zhuangxiu'];
			$kfs       = $results[0]['kfs'];
			$buildage  = $results[0]['buildage'];
			$opendate  = $results[0]['opendate'];
			$buildtype = $results[0]['buildtype'];
			$huanxian  = $results[0]['huanxian'];
			$rongji    = $results[0]['rongji'];
			$green     = $results[0]['green'];
			$proprice  = $results[0]['proprice'];
			$property  = $results[0]['property'];
			$buildarea = $results[0]['buildarea'];
			$planarea  = $results[0]['planarea'];
			$planhouse = $results[0]['planhouse'];
			$note   = $results[0]['note'];
			$config    = $results[0]['config'];
			$pics      = $results[0]['pics'];
			$click     = $results[0]['click'];
			$weight    = $results[0]['weight'];
			$state     = $results[0]['state'];
			$cityid    = $results[0]['cityid'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}elseif($dopost == "editpic"){
	$huoniaoTag->assign('id', $id);
	if($type == 1){
		$item = "`pics`";
		$items = "pics";
	}elseif($type == 2){
		$item = "`qjpics`";
		$items = "qjpics";
	}else{
		echo '{"state": 200, "info": '.json_encode("缺少type字段！").'}';
	}

	$picssql = $dsql->SetQuery("SELECT ".$item." FROM `#@__".$tab."` WHERE `id` = ".$id);

	$picsres = $dsql->dsqlOper($picssql,"results");
	if($picsres){
		$pics = $picsres[0][$items];
		$huoniaoTag->assign('imglists', json_encode(!empty($pics) ? explode("||", $pics) : array()));
	}
	$huoniaoTag->assign('type', $type);
	$templates = "renovationCommunitypicAdd.html";
}elseif($dopost =="updateeditpic"){
	if(!is_numeric($id)){
		echo '{"state": 200, "info": '.json_encode("缺少字段！").'}';
		exit();
	}
	if($type == 1){
		$item = "`pics`";
		$items = "pics";
	}elseif($type == 2){
		$item = "`qjpics`";
		$items = "qjpics";
	}else{
		echo '{"state": 200, "info": '.json_encode("缺少type字段！").'}';

		exit();
	}

	$updatepicsql   = $dsql->SetQuery("UPDATE `#@__".$tab."` SET ".$item." = '$imglist' WHERE `id` =" .$id);

	$results = $dsql->dsqlOper($updatepicsql, "update");

	if($results == "ok"){
		
		$param = array(
			"service"  => "renovation",
			"template" => "community",
			"id"       => $id
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		exit();
	}else{
		echo '{"state": 200, '.json_encode('修改失败！').'}';
		exit();
	}


}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	if($dopost =="updateeditpic" ||  $dopost=="editpic"){

		$jsFile = array(
			'ui/bootstrap.min.js',
			'ui/jquery.dragsort-0.5.1.min.js',
			'ui/bootstrap-datetimepicker.min.js',
			'publicUpload.js',
			'publicAddr.js',
			'admin/renovation/renovationCommunitypicAdd.js'
		);
	}else{
		$jsFile = array(
			'ui/bootstrap.min.js',
			'ui/jquery.dragsort-0.5.1.min.js',
			'ui/bootstrap-datetimepicker.min.js',
			'publicUpload.js',
			'publicAddr.js',
			'admin/renovation/renovationCommunityAdd.js'
		);
	}
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/renovation.inc.php");
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
	$huoniaoTag->assign('mapCity', $cfg_mapCity);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "renovationaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);

	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('tese', $tese);
	$huoniaoTag->assign('huanxian', $huanxian);
    $huoniaoTag->assign('cityid', $cityid);

	//物业类型
	$huoniaoTag->assign('protypeval', array(
		0 => '住宅',
		1 => '公寓',
		2 => '别墅',
		3 => '商住',
		4 => '平房',
		5 => '商住两用',
		6 => '酒店式公寓',
		7 => '其它'
	));
	$huoniaoTag->assign('protype', explode(",", $protype));

	//建筑类型
	$huoniaoTag->assign('buildlist', array(
		0 => '低层',
		1 => '高层',
		2 => '小高层',
		3 => '联排别墅',
		4 => '公寓'
	));

	//装修情况
	$huoniaoTag->assign('zhuangxiuList', array(
		0 => '请选择',
		'毛坯' => '毛坯',
		'普通装修' => '普通装修',
		'精装修' => '精装修',
		'豪华装修' => '豪华装修',
		'其它' => '其它'
	));
	$huoniaoTag->assign('zhuangxiu', $zhuangxiu == "" ? 0 : $zhuangxiu);

	$huoniaoTag->assign('property', $property);
	$huoniaoTag->assign('proprice', $proprice);
	$huoniaoTag->assign('opendate', !empty($opendate) ? date("Y-m-d", $opendate) : "");
	$huoniaoTag->assign('kfs', $kfs);
	$huoniaoTag->assign('price', $price);

	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('buildtype', $buildtype);
	$huoniaoTag->assign('buildage', $buildage);
	$huoniaoTag->assign('planarea', $planarea);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('planhouse', $planhouse == 0 ? "" : $planhouse);
	$huoniaoTag->assign('rongji', $rongji == 0 ? "" : $rongji);
	$huoniaoTag->assign('buildarea', $buildarea == 0 ? "" : $buildarea);
	$huoniaoTag->assign('green', $green == 0 ? "" : $green);

	$huoniaoTag->assign('imglist', json_encode(!empty($pics) ? explode("||", $pics) : array()));

	$configHtml = "";
	if(!empty($config)){
		$configArr = explode("|||", $config);
		foreach ($configArr as $key => $value) {
			$item = explode("###", $value);
			$configHtml .= '<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" value="'.$item[0].'" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容">'.$item[1].'</textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>';
		}
	}
	$huoniaoTag->assign('configHtml', $configHtml);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
