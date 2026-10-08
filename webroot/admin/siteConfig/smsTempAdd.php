<?php
/**
 * 添加短信模板
 *
 * @version        $Id: smsTempAdd.php 2016-06-17 上午11:14:20 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("smsTemp");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "smsTempAdd.html";

$action     = "site_smstemp";
$pagetitle  = "新增短信模板";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	//表单二次验证
	if($module == ''){
		echo '{"state": 200, "info": "请选择所属模块"}';
		exit();
	}

	if($temp == ''){
		echo '{"state": 200, "info": "请输入模板名称"}';
		exit();
	}

	if($content == '' && $tempid == ''){
		echo '{"state": 200, "info": "短信平台模板ID和短信内容至少填写一项"}';
		exit();
	}

	$pubdate = GetMkTime(time()); //发布时间
}

if($dopost == "edit"){

	$pagetitle = "修改短信模板";
	if($submit == "提交"){
		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `module` = '$module', `content` = '$content', `tempid` = '$tempid' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `temp` = '$temp' WHERE `system` = 0 AND `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "修改失败！"}';
			exit();
		}

		adminLog("修改短信模板", $keyword);
		echo '{"state": 100, "info": "修改成功！"}';
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$module  = $results[0]['module'];
				$temp    = $results[0]['temp'];
				$tempid  = $results[0]['tempid'];
				$system  = $results[0]['system'];
				$content = $results[0]['content'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`module`, `temp`, `tempid`, `content`, `pubdate`) VALUES ('$module', '$temp', '$tempid', '$content', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增短信模板", $keyword);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.shortcuts.js',
		'admin/siteConfig/smsTempAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);

	//所属模块
	$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `parentid` != 0 AND `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
	$result = $dsql->dsqlOper($sql, "results");
	$moduleList = array();
	$moduleVal = array();
	if($result){
		foreach ($result as $key => $value) {
			array_push($moduleList, $value['subject'] ? $value['subject'] : $value['title']);
			array_push($moduleVal, $value['name']);
			if($value['name'] == "article"){
				array_push($moduleList, "图片");
				array_push($moduleVal, "pic");
			}
		}
	}
	$huoniaoTag->assign('moduleList', $moduleList);
	$huoniaoTag->assign('moduleVal', $moduleVal);
	$huoniaoTag->assign('module', $module);

	$huoniaoTag->assign('system', $system);
	$huoniaoTag->assign('temp', $temp);
	$huoniaoTag->assign('tempid', $tempid);
	$huoniaoTag->assign('content', $content);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
