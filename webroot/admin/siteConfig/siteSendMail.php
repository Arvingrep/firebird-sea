<?php
/**
 * 手动发送邮件
 *
 * @version        $Id: siteSendMail.php 2013-12-1 下午21:59:30 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteSendMail");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteSendMail.html";

if($action == "send" && $submit == "提交"){
	$user = explode(",", $address);
	
	if($address==''){
		echo '{"state": 200, "info": '.json_encode("请输入收件人地址！").'}';
		exit();
	}
	if($title==''){
		echo '{"state": 200, "info": '.json_encode("请输入邮件主题！").'}';
		exit();
	}
	if($content==''){
		echo '{"state": 200, "info": '.json_encode("请输入邮件内容！").'}';
		exit();
	}
	
	$errUser = array();
	foreach($user as $key => $u){
		if(!preg_match('/^(.+)@(.+)$/',$u)){
			array_push($errUser, $u);
		}
	}
	if(!empty($errUser)){
		echo '{"state": 200, "info": '.json_encode(join(", ", $errUser)."<br />请正确填写以上邮件地址！").'}';
		exit();
	}
	
	$admin = $userLogin->getUserID();
	$errCode = array();
	foreach($user as $key => $u){
		$return = sendmail($u,$title,$content);
		if(!empty($return)){
			adminLog("手动发送邮件-失败", $u."==>".$title);
			messageLog("email", "管理员手动", $u, $title, $content, $admin, 1);
			array_push($errCode, $u);
		}else{
			adminLog("手动发送邮件-成功", $u."==>".$title);
			messageLog("email", "管理员手动", $u, $title, $content, $admin, 0);
		}
	}
	
	if(!empty($errCode)){
		echo '{"state": 200, "info": '.json_encode(join(",", $errCode)."<br />发送失败！").'}';
	}else{
		echo '{"state": 100, "info": '.json_encode("邮件已成功发送！").'}';
	}
	exit();
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteSendMail.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}