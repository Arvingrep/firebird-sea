<?php
/**
 * 添加城市分站广告
 *
 * @version        $Id: advCityAdd.php 2018-01-22 上午11:44:20 $
 * @package        HuoNiao.Adv
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "advCityAdd.html";
$dir = HUONIAOROOT."/templates/".$action;

$tab        = "advlist_city";
$pagetitle  = "新增城市分站广告";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

checkPurview("advList".$action);

if(empty($aid)){
	ShowMsg("广告ID传递失败！", 'javascript:;');
	exit();
}

//查看广告信息
$sql = $dsql->SetQuery("SELECT `class`, `body` FROM `#@__advlist` WHERE `id` = $aid");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
	$ad_class = $ret[0]['class'];
	$ad_body  = $ret[0]['body'];

	$huoniaoTag->assign('ad_class', $ad_class);
	$huoniaoTag->assign('ad_body', $ad_body);
}else{
	ShowMsg("广告位不存在或已经删除！", 'javascript:;');
	exit();
}

//获取当前管理员
$adminid = $userLogin->getUserID();
$pubdate = GetMkTime(time());

if($dopost != "" && $submit == "提交"){
	if($token == "") die('token传递失败！');

	if(empty($cityid)){
		echo '{"state": 200, "info": "请选择城市"}';
		exit();
	}

	$adminCityIdsArr = explode(',', $adminCityIds);
	if(!in_array($cityid, $adminCityIdsArr)){
		echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
		exit();
	}

	//验证是否重复添加
	$w = '';
	if($dopost == 'edit'){
		$w = ' AND `id` != ' . $id;
	}
	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `cityid` = $cityid AND `aid` = $aid" . $w);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		echo '{"state": 200, "info": "同一城市，同一广告位，只能添加一个！"}';
		exit();
	}

	if(empty($body)){
		echo '{"state": 200, "info": "请设置广告内容"}';
		exit();
	}
}

if($dopost == "edit"){
	if($id == "") die("要修改的信息ID传递失败！");
	$pagetitle = "修改广告";
	if($submit == "提交"){
		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `body` = '$body', `admin` = '$adminid', `date` = '$pubdate' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "修改失败！"}';
			exit();
		}else{
			adminLog("修改城市分站广告", $action."=>".$aid."=>".$id);
			echo '{"state": 100, "info": "修改成功！"}';
			exit();
		}
	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$cityid = $results[0]['cityid'];
				$body   = $results[0]['body'];
			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`aid`, `cityid`, `body`, `admin`, `date`) VALUES ('$aid', '$cityid', '$body', '$adminid', '$pubdate')");
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "添加失败！"}';
			exit();
		}else{
			adminLog("添加城市分站广告", $action."=>".$aid);
			echo '{"state": 100, "info": "添加成功！"}';
			exit();
		}

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
		'ui/jquery.colorPicker.js',
		'ui/chosen.jquery.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/siteConfig/advCityAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('aid', $aid);
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->assign('body', $body);

	$huoniaoTag->assign('ad_class', $ad_class);
	$huoniaoTag->assign('ad_body', $ad_body);

	$ad_body = explode("$$", $ad_body);
	if($class == 3){
		$huoniaoTag->assign("type1", getAttachType($ad_body[3]));
		$huoniaoTag->assign("type2", getAttachType($ad_body[5]));
	}elseif($class == 4){
		$left = explode("##", $ad_body[4]);
		$right = explode("##", $ad_body[5]);
		$huoniaoTag->assign("type1", getAttachType($left[0]));
		$huoniaoTag->assign("type2", getAttachType($left[0]));
	}elseif($class == 5){

	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
