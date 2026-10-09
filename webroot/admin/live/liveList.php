<?php
/**
 * 管理图片信息
 *
 * @version        $Id: imageList.php 2017-1-18 下午16:45:11 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/live";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "liveList.html";

if($action == ""){
	$action = "live";
}

checkPurview("liveList");

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/jquery-smartMenu.js',
		'admin/live/liveList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('recycle', $recycle);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/live";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
