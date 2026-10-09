<?php
/**
 * 自助建站设计面板
 *
 * @version        $Id: websiteDesign.php 2014-6-21 下午14:02:08 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteDesign");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteDesign.html";

$tab = "website_design";

$id = $_GET['id'];

$RenrenCrypt = new RenrenCrypt();
$projectid = $RenrenCrypt->php_decrypt(base64_decode($id));

$projectid = (int)$projectid;
if(empty($projectid)) die("参数传递失败！");

$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `id` = ".$projectid);
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("网站不存在或已删除，请确认后操作！");

//验证模板文件
if(file_exists($tpl."/".$templates)){
	global $cfg_attachment;	
	$huoniaoTag->assign('PROJECTID', $id);
	$huoniaoTag->assign('cfg_attachment', $cfg_attachment);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}