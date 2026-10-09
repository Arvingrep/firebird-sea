<?php
/**
 * 添加专题
 *
 * @version        $Id: specialAdd.php 2014-4-26 上午11:24:21 $
 * @package        HuoNiao.Special
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/special";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "specialAdd.html";
$tab = "special";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改专题";
	checkPurview("specialEdit");
}else{
	$pagetitle = "添加专题";
	checkPurview("specialAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

if($_POST['submit'] == "提交"){

	$title = cn_substrR($title,60);

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
		echo '{"state": 200, "info": "请输入专题标题！"}';
		exit();
	}

	if($domaintype != 0){
		if(empty($domain)){
			echo '{"state": 200, "info": "请输入要绑定的域名！"}';
			exit();
		}

		//验证域名是否被使用
		if(!operaDomain('check', $domain, 'special', $tab, $id, GetMkTime($domainexp)))
		die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');
	}

	if(empty($typeid)){
		echo '{"state": 200, "info": "请选择专题分类！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `domaintype`, `typeid`, `note`, `head`, `footer`, `litpic`, `weight`, `state`, `pubdate`) VALUES ('$cityid', '$title', '$domaintype', '$typeid', '$note', '$head', '$footer', '$litpic', '$weight', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `pubdate`) VALUES ('$aid', '首页', 'index', '首页', '1', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		//域名操作
		operaDomain('update', $domain, 'special', $tab, $aid, GetMkTime($domainexp), $domaintip);

		adminLog("添加专题", $title);
		$RenrenCrypt = new RenrenCrypt();
		$projectid   = base64_encode($RenrenCrypt->php_encrypt($aid));

		$param = array(
			"service"  => "special",
			"template" => "detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "id": "'.$aid.'", "projectid": "'.$projectid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `domaintype` = '$domaintype', `typeid` = '$typeid', `note` = '$note', `head` = '$head', `footer` = '$footer', `litpic` = '$litpic', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			operaDomain('update', $domain, 'special', $tab, $id, GetMkTime($domainexp), $domaintip);

			adminLog("修改专题", $title);

			$param = array(
				"service"  => "special",
				"template" => "detail",
				"id"       => $id
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

			$title       = $results[0]['title'];
			$domaintype  = $results[0]['domaintype'];

			//获取域名信息
			$domainInfo = getDomain('special', $tab, $id);
			$domain      = $domainInfo['domain'];
			$domainexp   = $domainInfo['expires'];
			$domaintip   = $domainInfo['note'];

			$typeid      = $results[0]['typeid'];
			$note        = $results[0]['note'];
			$head        = $results[0]['head'];
			$footer      = $results[0]['footer'];
			$litpic      = $results[0]['litpic'];
			$weight      = $results[0]['weight'];
			$state       = $results[0]['state'];
            $cityid       = $results[0]['cityid'];

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
		'admin/special/specialAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/special.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('basehost', $cfg_basehost);

	//获取域名信息
	$domainInfo = getDomain('special', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);

	$huoniaoTag->assign('id', $id);

    $huoniaoTag->assign('cityid', (int)$cityid);

	$huoniaoTag->assign('title', $title);

	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);
	if($customSubDomain != 2){
		$huoniaoTag->assign('domaintype', array('0', '1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名','绑定子域名'));
	}else{
		$huoniaoTag->assign('domaintype', array('0', '1'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名'));
	}
	if($customSubDomain == 2 && $domaintype == 2) $domaintype = 0;

	$huoniaoTag->assign('domaintypeChecked', $domaintype == "" ? 0 : $domaintype);
	$huoniaoTag->assign('domain', $domain);
	$huoniaoTag->assign('domainexp', $domainexp == 0 ? "" : date("Y-m-d H:i:s", $domainexp));
	$huoniaoTag->assign('domaintip', $domaintip);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "special_type")));
	$huoniaoTag->assign('typeid', (int)$typeid);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('head', $head);
	$huoniaoTag->assign('footer', $footer);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('weight', $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/special";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
