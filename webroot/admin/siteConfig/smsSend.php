<?php
/**
 * 手动发送短信
 *
 * @version        $Id: smsSend.php 2015-8-6 下午16:14:21 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("smsSend");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "smsSend.html";

if($action == "send" && $submit == "提交"){
	$user = explode(",", $phone);

	if($phone==''){
		echo '{"state": 200, "info": '.json_encode("请输入手机号码！").'}';
		exit();
	}
	if($content==''){
		echo '{"state": 200, "info": '.json_encode("请输入短信内容！").'}';
		exit();
	}

	$errUser = array();
	foreach($user as $key => $u){
		if(!preg_match('/0?(13|14|15|17|18)[0-9]{9}/',$u)){
			// array_push($errUser, $u);
		}
	}
	if(!empty($errUser)){
		echo '{"state": 200, "info": '.json_encode(join(", ", $errUser)."<br />请正确填写以上手机号码！").'}';
		exit();
	}


	$return = sendsms($phone, $content, "", "管理员手动发送", false, true);
	if($return != "ok"){
		adminLog("手动发送短信-失败", $phone."==>管理员手动发送");
		// messageLog("phone", "管理员手动", $phone, "管理员手动发送", $content, $admin, 1);
		echo '{"state": 200, "info": '.json_encode("发送失败！").'}';
	}else{
		adminLog("手动发送短信-成功", $phone."==>管理员手动发送");
		// messageLog("phone", "管理员手动", $phone, "管理员手动发送", $content, $admin, 0);
		echo '{"state": 100, "info": '.json_encode("短信已成功发送！").'}';
	}
	exit();
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/smsSend.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
