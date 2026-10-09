<?php
/**
 * 添加报刊公司
 *
 * @version        $Id: paperCompanyAdd.php 2014-3-14 下午21:26:19 $
 * @package        HuoNiao.Paper
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/paper";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paperCompanyAdd.html";

$tab = "paper_company";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改报刊公司";
	checkPurview("paperCompanyEdit");
}else{
	$pagetitle = "添加报刊公司";
	checkPurview("paperCompanyAdd");
}

if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
    //表单二次验证
    if(empty($cityid)){
        echo '{"state": 200, "info": "请选择城市"}';
        exit();
    }

    $adminCityIdsArr = explode(',', $adminCityIds);
    if(!in_array($cityid, $adminCityIdsArr)){
        echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
        exit();
    }

	if(empty($title)){
		echo '{"state": 200, "info": "请输入公司名！"}';
		exit();
	}

	if(empty($litpic)){
		echo '{"state": 200, "info": "请上传公司logo！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `litpic`, `weight`, `state`, `people`, `contact`, `qq`, `pubdate`) VALUES ('$cityid', '$title', '$litpic', '$weight', '$state', '$people', '$contact', '$qq', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		$param = array(
			"service"     => "paper",
			"template"    => "list",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加报刊公司", $title);
		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `litpic` = '$litpic', `weight` = '$weight', `state` = '$state', `people` = '$people', `contact` = '$contact', `qq` = '$qq' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			$param = array(
				"service"     => "paper",
				"template"    => "list",
				"id"          => $id
			);
			$url = getUrlPath($param);

			adminLog("修改报刊公司", $title);
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

			$title     = $results[0]['title'];
			$litpic    = $results[0]['litpic'];
			$weight    = $results[0]['weight'];
			$state     = $results[0]['state'];
			$people    = $results[0]['people'];
			$contact   = $results[0]['contact'];
			$qq        = $results[0]['qq'];
            $cityid    = $results[0]['cityid'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/paper/paperCompanyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/paper.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('qq', $qq);

	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/paper";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
