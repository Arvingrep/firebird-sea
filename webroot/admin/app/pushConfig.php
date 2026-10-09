<?php
/**
 * APP推送配置
 *
 * @version        $Id: pushConfig.php 2017-4-18 下午13:41:20 $
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
$templates = "pushConfig.html";

//异步提交
if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$sql = $dsql->SetQuery("SELECT `android_access_id` FROM `#@__app_push_config`");
	$ret = $dsql->dsqlOper($sql, "totalCount");

	//存在则更新，不存在插入
	if($ret){
		$sql = $dsql->SetQuery("UPDATE `#@__app_push_config` SET `platform` = '$platform', `android_access_id` = '$android_access_id', `android_access_key` = '$android_access_key', `android_secret_key` = '$android_secret_key', `android_package_activity` = '$android_package_activity', `ios_access_id` = '$ios_access_id', `ios_access_key` = '$ios_access_key', `ios_secret_key` = '$ios_secret_key', `business_android_access_id` = '$business_android_access_id', `business_android_access_key` = '$business_android_access_key', `business_android_secret_key` = '$business_android_secret_key', `business_android_package_activity` = '$business_android_package_activity', `business_ios_access_id` = '$business_ios_access_id', `business_ios_access_key` = '$business_ios_access_key', `business_ios_secret_key` = '$business_ios_secret_key', `peisong_android_access_id` = '$peisong_android_access_id', `peisong_android_access_key` = '$peisong_android_access_key', `peisong_android_secret_key` = '$peisong_android_secret_key', `peisong_android_package_activity` = '$peisong_android_package_activity', `peisong_ios_access_id` = '$peisong_ios_access_id', `peisong_ios_access_key` = '$peisong_ios_access_key', `peisong_ios_secret_key` = '$peisong_ios_secret_key'");
	}else{
		$sql = $dsql->SetQuery("INSERT INTO `#@__app_push_config` (`platform`, `android_access_id`, `android_access_key`, `android_secret_key`, `android_package_activity`, `ios_access_id`, `ios_access_key`, `ios_secret_key`, `business_android_access_id`, `business_android_access_key`, `business_android_secret_key`, `business_android_package_activity`, `business_ios_access_id`, `business_ios_access_key`, `business_ios_secret_key`, `peisong_android_access_id`, `peisong_android_access_key`, `peisong_android_secret_key`, `peisong_android_package_activity`, `peisong_ios_access_id`, `peisong_ios_access_key`, `peisong_ios_secret_key`) VALUES ('$platform', '$android_access_id', '$android_access_key', '$android_secret_key', '$android_package_activity', '$ios_access_id', '$ios_access_key', '$ios_secret_key', '$business_android_access_id', '$business_android_access_key', '$business_android_secret_key', '$business_android_package_activity', '$business_ios_access_id', '$business_ios_access_key', '$business_ios_secret_key', '$peisong_android_access_id', '$peisong_android_access_key', '$peisong_android_secret_key', '$peisong_android_package_activity', '$peisong_ios_access_id', '$peisong_ios_access_key', '$peisong_ios_secret_key')");
	}

	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok"){
		updateAppConfig();  //更新APP配置文件
		adminLog("APP配置", "修改APP推送配置");
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
		'admin/app/pushConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$installWaimai = getModuleTitle(array('name'=>'waimai'));
	$huoniaoTag->assign('installWaimai', $installWaimai);

	//查询当前配置
	$sql = $dsql->SetQuery("SELECT * FROM `#@__app_push_config` LIMIT 1");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$data = $ret[0];
		foreach ($data as $key => $value) {
			$huoniaoTag->assign($key, $value);
		}
	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/app";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
