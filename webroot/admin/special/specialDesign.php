<?php
/**
 * 专题设计面板
 *
 * @version        $Id: specialDesign.php 2014-4-26 下午18:30:11 $
 * @package        HuoNiao.Special
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("specialDesign");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/special";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "specialDesign.html";

$tab = "special_design";

// $RenrenCrypt = new RenrenCrypt();
// $projectid = $RenrenCrypt->php_decrypt(base64_decode($id));

$projectid = (int)$id;
if(empty($projectid)) die("参数传递失败！");

$archives = $dsql->SetQuery("SELECT `id` FROM `#@__special` WHERE `id` = ".$projectid);
$results = $dsql->dsqlOper($archives, "results");
if(!$results) die("专题不存在或已删除，请确认后操作！");

//验证模板文件
if(file_exists($tpl."/".$templates)){
	global $cfg_attachment;
	$huoniaoTag->assign('PROJECTID', $id);
	$huoniaoTag->assign('cfg_attachment', $cfg_attachment);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/special";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
