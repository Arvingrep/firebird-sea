<?php
/**
 * 基础设置收费
 *
 * @version        $Id: jobCharge.php 2024-4-16 上午9:35:12 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobCharge");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobCharge.html";

$action =  $action == "" ? "job" : $action;
$dir = "../../templates/".$action; //当前目录

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/job/jobCharge.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");
	
	$huoniaoTag->assign('job_fee', (float)$customJob_fee);  //职位上架费用
    $huoniaoTag->assign('resume_down_fee', (float)$customResume_down_fee);  //下载简历费用
	$huoniaoTag->assign('job_top_fee', (float)$customJob_top_fee);  //职位置顶单天费用
	$huoniaoTag->assign('job_refresh_fee', (float)$customJob_refresh_fee);  //职位单次刷新费用
	$huoniaoTag->assign('free_jobs', $customFree_jobs ?: 0);  //新入驻体验_职位上架
	$huoniaoTag->assign('free_job_resume_down', $customFree_job_resume_down ?: 0);  //新入驻体验_简历下载
	$huoniaoTag->assign('free_job_refresh', $customFree_job_refresh ?: 0);  //新入驻体验_职位刷新
	$huoniaoTag->assign('free_job_top', $customFree_job_top ?: 0);  //新入驻体验_职位置顶

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
