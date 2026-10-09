<?php
/**
 * 添加招聘企业
 *
 * @version        $Id: jobCompanyAdd.php 2014-3-17 上午09:07:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobComboAdd.html";

$tab = "job_combo";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改招聘企业";
	checkPurview("jobCompanyEdit");
}else{
	$pagetitle = "添加招聘企业";
	checkPurview("jobCompanyAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
$weight = (int)$weight;
if(empty($state)) $state = 0;
if(!empty($property)) $property = join(",", $property);
if(!empty($welfare)) $welfare = join(",", $welfare);

if($_POST['submit'] == "提交"){

	if(empty($postcode)) $postcode = 0;

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入套餐名称！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
    $valid = $valid_type==-1 ? -1 : $valid;
    $job = $job_type==-1 ? -1 : $job;
    $resume = $resume_type==-1 ? -1 : $resume;
    //转int
    $refresh = (int)$refresh;
    $buy = (int)$buy;
    $money = (float)(sprintf("%.2f", $money));
    $top = (int)$top;
    //保存到数据库中
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `valid`, `money`, `buy`, `job`, `resume`, `refresh`, `top`) VALUES ('$title', '$valid', '$money', '$buy', '$job', '$resume', '$refresh', '$top') ");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){

		$param = array(
			"service"  => "job",
			"template" => "company",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加招聘套餐", $title);
//        dataAsync("job",$aid,"company");  // 求职招聘-企业-新增
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

        $valid = $valid_type==-1 ? -1 : $valid;
        $job = $job_type==-1 ? -1 : $job;
        $resume = $resume_type==-1 ? -1 : $resume;
        //转int
        $refresh = (int)$refresh;
        $buy = (int)$buy;
        $money = (float)(sprintf("%.2f", $money));
        $top = (int)$top;
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title`='$title',`valid`=$valid,`money`=$money,`buy`=$buy,`job`=$job,`resume`=$resume,`refresh`=$refresh,`top`=$top WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $id
			);
			$url = getUrlPath($param);
			adminLog("修改招聘套餐", $title);
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
			$valid  = $results[0]['valid'];
			$money  = $results[0]['money'];
			$buy  = $results[0]['buy'];
			$job  = $results[0]['job'];
			$resume  = $results[0]['resume'];
			$refresh  = $results[0]['refresh'];
			$top  = $results[0]['top'];
		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/job/jobComboAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/job.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('valid', $valid);
	$huoniaoTag->assign('valid_type', $valid<0 ? -1 : 1);
	$huoniaoTag->assign('valid_types', array(-1,1));
	$huoniaoTag->assign('valid_type_names', array("永久","指定天数"));
    $huoniaoTag->assign('job_type', $job<0 ? -1 : 1);
    $huoniaoTag->assign('job_types', array(-1,1));
    $huoniaoTag->assign('job_type_names', array("无限","指定个数"));
    $huoniaoTag->assign('resume_type', $resume<0 ? -1 : 1);
    $huoniaoTag->assign('resume_types', array(-1,1));
    $huoniaoTag->assign('resume_type_names', array("无限","指定个数"));
	$huoniaoTag->assign('money', $money);
	$huoniaoTag->assign('buy', $buy);
	$huoniaoTag->assign('job', $job);
	$huoniaoTag->assign('resume', $resume);
	$huoniaoTag->assign('refresh', $refresh);
	$huoniaoTag->assign('top', $top);



	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
