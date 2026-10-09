<?php
/**
 * 管理后台首页
 *
 * @version        $Id: index.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/";
$tpl = isMobile() ? $tpl."touch/statistics" : $tpl."statistics";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "statistics.html";

//域名检测 s
$httpHost  = $_SERVER['HTTP_HOST'];    //当前访问域名
$reqUri    = $_SERVER['REQUEST_URI'];  //当前访问目录

//判断是否为主域名，如果不是则跳转到主域名的后台目录
if($cfg_basehost != $httpHost && $cfg_basehost != str_replace("www.", "", $httpHost)){
	header("location:".$cfg_secureAccess.$cfg_basehost.$reqUri);
	die;
}




// echo $tpl."/".$templates;
//验证模板文件
if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('templets_skin', $cfg_secureAccess.$cfg_basehost."/wmsj/templates/".(isMobile() ? "touch/" : ""));  //模块路径
	$huoniaoTag->display($templates);
}else{
	echo $tpl."/".$templates."模板文件未找到！";
}
