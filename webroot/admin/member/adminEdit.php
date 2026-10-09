<?php
/**
 * 修改当前登录管理员密码
 *
 * @version        $Id: adminEdit.php 2014-1-1 上午0:10:16 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "adminEdit.html";

$id = $userLogin->getUserID();
if($id == "") {
	header("location:".HUONIAOADMIN."/login.php");
	exit();
}

$tab = "member";
if($submit == "提交"){
	if($token == "") die('token传递失败！');
	
	//表单二次验证
	if(trim($username) == ''){
		echo '{"state": 200, "info": "请输入用户名！"}';
		exit();
	}
	if(trim($oldpass) == ''){
		echo '{"state": 200, "info": "请输入原始密码！"}';
		exit();
	}
	if(trim($password) == ''){
		echo '{"state": 200, "info": "请输入新密码！"}';
		exit();
	}

    $validatePassword = validatePassword($password);
    if($validatePassword != 'ok'){
        echo '{"state": 200, "info": "'.$validatePassword.'"}';
        exit();
    }
	if(trim($nickname) == ''){
		echo '{"state": 200, "info": "请输入真实姓名！"}';
		exit();
	}
	
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `username` = '$username' AND `id` != $id");
	$return = $dsql->dsqlOper($archives, "results");
	if($return){
		echo '{"state": 200, "info": "此用户名已经存在，请重新填写！"}';
		exit();
	}
	
	$archives = $dsql->SetQuery("SELECT `password` FROM `#@__".$tab."` WHERE `id` = $id");
	$return = $dsql->dsqlOper($archives, "results");
	if($return){
		$hash = $userLogin->_getSaltedHash($oldpass, $return[0]['password']);
		if($return[0]['password'] != $hash){
			echo '{"state": 200, "info": "原始密码不正确，请重新输入！"}';
			exit();
		}
	}else{
		header("location:".HUONIAOADMIN."/login.php");
    	exit();
	}
	
	$password = $userLogin->_getSaltedHash($password);
	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `username` = '$username', `password` = '$password', `nickname` = '$nickname' WHERE `id` = ".$id);
	$return = $dsql->dsqlOper($archives, "update");
	
	if($return == "ok"){
		adminLog("修改管理员密码", $username);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}else{
		echo $return;
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'admin/member/adminEdit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$archives = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__".$tab."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		$huoniaoTag->assign("username", $results[0]['username']);
		$huoniaoTag->assign("nickname", $results[0]['nickname']);
	}else{
		header("location:".HUONIAOADMIN."/login.php");
		exit();
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}