<?php
/**
 * 添加婚宴场地
 *
 * @version        $Id: marryhotelfieldAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryhotelfieldAdd.html";

$tab = "marry_hotelfield";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改婚宴场地";
	checkPurview("marryhotelfieldEdit");
}else{
	$pagetitle = "添加婚宴场地";
	checkPurview("marryhotelfieldAdd");
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());
$filter = 8;
if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择婚嫁公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `company`, `maxtable`, `besttable`, `floorheight`, `area`, `column`, `fields`, `pics`, `click`, `weight`, `state`, `pubdate`) VALUES ('$title', '$comid', '$maxtable', '$besttable', '$floorheight', '$area', '$column', '$fields', '$pics', '$click', '$weight', '$state', '$pubdate')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加婚宴场地", $userid);
		if($state == 1){
			updateCache("marry_hotelfield_list", 300);
			clearCache("marry_hotelfield_total", 'key');
		}
		$param = array(
			"service"  => "marry",
			"template" => "hotelfield-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("marry",$aid,"hotelfield");  // 婚嫁、酒店场地、新增

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `maxtable` = '$maxtable', `besttable` = '$besttable', `floorheight` = '$floorheight', `area` = '$area', `column` = '$column', `fields` = '$fields', `pics` = '$pics', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改婚宴场地信息", $id);

			checkCache("marry_hotelfield_list", $id);
			clearCache("marry_hotelfield_detail", $id);
			clearCache("marry_hotelfield_total", 'key');

			$param = array(
				"service"  => "marry",
				"template" => "hotelfield-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("marry",$id,"hotelfield");  // 婚嫁、酒店场地、更新

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
		'admin/marry/marryhotelfieldAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/marry.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('atlasMax', $custom_marryhotelfield_atlasMax ? $custom_marryhotelfield_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
	}
    $huoniaoTag->assign('filter', $filter);
    $huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('maxtable', $maxtable);
    $huoniaoTag->assign('besttable', $besttable);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('floorheight', $floorheight);
	$huoniaoTag->assign('area', $area == "" ? 0 : $area);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");

	//有无立柱
	$huoniaoTag->assign('columnOpt', array('0', '1'));
	$huoniaoTag->assign('columnNames',array('无','有'));
	$huoniaoTag->assign('column', $column == "" ? 0 : $column);

	//场地
	$huoniaoTag->assign('fieldsOpt', array('0', '1'));
	$huoniaoTag->assign('fieldsNames',array('正方形','长方形'));
	$huoniaoTag->assign('fields', $fields == "" ? 0 : $fields);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
