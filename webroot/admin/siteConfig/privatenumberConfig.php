<?php
/**
 * 隐私通话保护基本设置
 *
 * @version        $Id: privatenumberConfig.php 2022-05-16 下午15:52:12 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("privatenumberConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "privatenumberConfig.html";
$dir       = "../../templates/siteConfig"; //当前目录

$configIncFile = HUONIAOINC.'/config/privatenumberConfig.inc.php';

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$huawei_privatenumber_state = $privatenumberState;
	$huawei_privatenumber_app_key = $app_key;
	$huawei_privatenumber_app_secret  = $app_secret;
	$huawei_privatenumber_sound = $sound;
	$huawei_privatenumber_duration   = (int)$duration;
	$huawei_privatenumber_maxDuration   = (int)$maxDuration;
	$huawei_privatenumber_areaCode   = (int)$areaCodeState;
	$huawei_privatenumber_burden   = (int)$burdenState;
	$huawei_privatenumber_limit_time   = (int)$limit_time;
	$huawei_privatenumber_limit_count   = (int)$limit_count;
    $huawei_privatenumber_module = isset($module) ? join(',',$module) : '';

    adminLog("修改隐私通话保护基本设置");


	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$huawei_privatenumber_state = ".$huawei_privatenumber_state.";\r\n";
	$configFile .= "\$huawei_privatenumber_app_key = '".$huawei_privatenumber_app_key."';\r\n";
	$configFile .= "\$huawei_privatenumber_app_secret = '".$huawei_privatenumber_app_secret."';\r\n";
	$configFile .= "\$huawei_privatenumber_sound = '".$huawei_privatenumber_sound."';\r\n";
	$configFile .= "\$huawei_privatenumber_duration = ".$huawei_privatenumber_duration.";\r\n";
	$configFile .= "\$huawei_privatenumber_maxDuration = ".$huawei_privatenumber_maxDuration.";\r\n";
	$configFile .= "\$huawei_privatenumber_areaCode = ".$huawei_privatenumber_areaCode.";\r\n";
	$configFile .= "\$huawei_privatenumber_burden = ".$huawei_privatenumber_burden.";\r\n";
	$configFile .= "\$huawei_privatenumber_limit_time = ".$huawei_privatenumber_limit_time.";\r\n";
	$configFile .= "\$huawei_privatenumber_limit_count = ".$huawei_privatenumber_limit_count.";\r\n";
	$configFile .= "\$huawei_privatenumber_module = '".$huawei_privatenumber_module."';\r\n";

    $configFile .= "?".">";

	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);
    
    updateAppConfig();

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//配置参数
if(file_exists($configIncFile)){
    require_once($configIncFile);
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/privatenumberConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//隐私号码状态
	$huoniaoTag->assign('privatenumberState', array('0', '1'));
	$huoniaoTag->assign('privatenumberStateNames',array('关闭','开启'));
	$huoniaoTag->assign('privatenumberStateChecked', (int)$huawei_privatenumber_state);

	$huoniaoTag->assign('app_key', $huawei_privatenumber_app_key);
	$huoniaoTag->assign('app_secret', $huawei_privatenumber_app_secret);
	$huoniaoTag->assign('sound', $huawei_privatenumber_sound);
	$huoniaoTag->assign('duration', $huawei_privatenumber_duration);
	$huoniaoTag->assign('maxDuration', $huawei_privatenumber_maxDuration);

	//启用归属地状态
	$huoniaoTag->assign('areaCodeState', array('0', '1'));
	$huoniaoTag->assign('areaCodeStateNames',array('关闭','开启'));
	$huoniaoTag->assign('areaCodeStateChecked', (int)$huawei_privatenumber_areaCode);

	//负载规则
	$huoniaoTag->assign('burdenState', array('0', '1'));
	$huoniaoTag->assign('burdenStateNames',array('显示真实号码','解绑正在使用的号码'));
	$huoniaoTag->assign('burdenStateChecked', (int)$huawei_privatenumber_burden);

	$huoniaoTag->assign('limit_time', $huawei_privatenumber_limit_time);
	$huoniaoTag->assign('limit_count', $huawei_privatenumber_limit_count);
	$huoniaoTag->assign('module', explode(',', $huawei_privatenumber_module));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
