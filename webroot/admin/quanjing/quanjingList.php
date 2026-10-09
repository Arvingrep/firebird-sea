<?php
/**
 * 管理全景信息
 *
 * @version        $Id: quanjingList.php 2018-6-6 下午16:45:11 $
 * @package        HuoNiao.Image
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/quanjing";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "quanjingList.html";

if($action == ""){
	$action = "quanjing";
}

$param = array(
    "service"     => $action,
    "template"    => "detail",
    "id"          => 202,
    "test" => "1"
);
$url = getUrlPath($param);
// echo $url;die;

checkPurview("quanjingList");
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
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/jquery-smartMenu.js',
        'ui/chosen.jquery.min.js',
		'admin/quanjing/quanjingList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('recycle', $recycle);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/quanjing";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
