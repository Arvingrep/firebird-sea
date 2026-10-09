<?php
/**
 * APP音视频处理配置
 *
 * @version        $Id: audioVideoProcess.php 2017-7-6 下午15:17:10 $
 * @package        HuoNiao.App
 * @copyright      Copyright (c) 2013 - 2017, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("pushConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/app";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "audioVideoProcess.html";

//异步提交
if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$sql = $dsql->SetQuery("SELECT `access_key` FROM `#@__app_audio_video_config`");
	$ret = $dsql->dsqlOper($sql, "totalCount");

	//存在则更新，不存在插入
	if($ret){
		$sql = $dsql->SetQuery("UPDATE `#@__app_audio_video_config` SET `access_key` = '$access_key', `secret_key` = '$secret_key', `bucket` = '$bucket', `pipeline` = '$pipeline', `domain` = '$domain', `audio_quality` = '$audio_quality'");
	}else{
		$sql = $dsql->SetQuery("INSERT INTO `#@__app_audio_video_config` (`access_key`, `secret_key`, `bucket`, `pipeline`, `domain`, `audio_quality`) VALUES ('$access_key', '$secret_key', '$bucket', '$pipeline', '$domain', '$audio_quality')");
	}

	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok"){
		adminLog("APP配置", "修改APP音视频处理配置");
		die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	}else{
		die('{"state": 200, "info": '.json_encode("配置失败，请联系管理员！").'}');
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/app/audioVideoProcess.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('audioQualityArr', array(128 => '128k', 160 => '160k', 192 => '192k', 320 => '320k'));

	//查询当前配置
	$sql = $dsql->SetQuery("SELECT * FROM `#@__app_audio_video_config` LIMIT 1");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$data = $ret[0];

		$huoniaoTag->assign('access_key', $data['access_key']);
		$huoniaoTag->assign('secret_key', $data['secret_key']);
		$huoniaoTag->assign('bucket', $data['bucket']);
		$huoniaoTag->assign('pipeline', $data['pipeline']);
		$huoniaoTag->assign('domain', $data['domain']);
		$huoniaoTag->assign('audio_quality', $data['audio_quality']);
	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/app";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
