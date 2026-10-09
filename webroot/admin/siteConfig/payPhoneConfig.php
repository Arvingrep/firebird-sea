<?php
/**
 * 付费查看电话基本设置
 *
 * @version        $Id: payPhoneConfig.php 2022-05-16 下午15:52:12 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("payPhoneConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "payPhoneConfig.html";
$dir       = "../../templates/siteConfig"; //当前目录

$configIncFile = HUONIAOINC.'/config/payPhoneConfig.inc.php';

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$cfg_payPhoneState = (int)$payPhoneState;
	$cfg_payPhonePrice = sprintf("%.2f", $payPhonePrice);
	$cfg_payPhoneVipFree = (int)$payPhoneVipFree;
	$cfg_payPhoneFenxiao = (int)$payPhoneFenxiao;
	$cfg_payPhoneFenxiaoFee = sprintf("%.2f", $payPhoneFenxiaoFee);
    $cfg_payPhoneModule = isset($payPhoneModule) ? join(',',$payPhoneModule) : '';

    $cfg_tencentGDT_app_id = trim($tencentGDT_app_id);
    $cfg_tencentGDT_placement_id = trim($tencentGDT_placement_id);
    $cfg_tencentGDT_secret = trim($tencentGDT_secret);
    $cfg_payPhone_wxmini = trim($payPhone_wxmini);
    $cfg_payPhone_entrance = (int)$payPhone_entrance;

    adminLog("修改付费查看电话基本设置");


	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_payPhoneState = ".$cfg_payPhoneState.";\r\n";
	$configFile .= "\$cfg_payPhonePrice = ".$cfg_payPhonePrice.";\r\n";
	$configFile .= "\$cfg_payPhoneVipFree = ".$cfg_payPhoneVipFree.";\r\n";
	$configFile .= "\$cfg_payPhoneFenxiao = ".$cfg_payPhoneFenxiao.";\r\n";
	$configFile .= "\$cfg_payPhoneFenxiaoFee = ".$cfg_payPhoneFenxiaoFee.";\r\n";
	$configFile .= "\$cfg_payPhoneModule = '".$cfg_payPhoneModule."';\r\n";
	$configFile .= "\$cfg_tencentGDT_app_id = '".$cfg_tencentGDT_app_id."';\r\n";
	$configFile .= "\$cfg_tencentGDT_placement_id = '".$cfg_tencentGDT_placement_id."';\r\n";
	$configFile .= "\$cfg_tencentGDT_secret = '".$cfg_tencentGDT_secret."';\r\n";
	$configFile .= "\$cfg_payPhone_wxmini = '".$cfg_payPhone_wxmini."';\r\n";
	$configFile .= "\$cfg_payPhone_entrance = ".(int)$cfg_payPhone_entrance.";\r\n";

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
    include($configIncFile);
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/payPhoneConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//付费查看电话状态
	$huoniaoTag->assign('payPhoneState', array('0', '1'));
	$huoniaoTag->assign('payPhoneStateNames',array('关闭','开启'));
	$huoniaoTag->assign('payPhoneStateChecked', (int)$cfg_payPhoneState);

	$huoniaoTag->assign('payPhonePrice', (float)$cfg_payPhonePrice);

	//会员是否免费
	$huoniaoTag->assign('payPhoneVipFree', array('0', '1'));
	$huoniaoTag->assign('payPhoneVipFreeNames',array('关闭','开启'));
	$huoniaoTag->assign('payPhoneVipFreeChecked', (int)$cfg_payPhoneVipFree);

	//是否开启分销
	$huoniaoTag->assign('payPhoneFenxiao', array('0', '1'));
	$huoniaoTag->assign('payPhoneFenxiaoNames',array('关闭','开启'));
	$huoniaoTag->assign('payPhoneFenxiaoChecked', (int)$cfg_payPhoneFenxiao);

	$huoniaoTag->assign('payPhoneFenxiaoFee', (float)$cfg_payPhoneFenxiaoFee);
	$huoniaoTag->assign('payPhoneModule', $cfg_payPhoneModule ? explode(',', $cfg_payPhoneModule) : array());

	$huoniaoTag->assign('tencentGDT_app_id', $cfg_tencentGDT_app_id);
	$huoniaoTag->assign('tencentGDT_placement_id', $cfg_tencentGDT_placement_id);
	$huoniaoTag->assign('tencentGDT_secret', $cfg_tencentGDT_secret);
	$huoniaoTag->assign('payPhone_wxmini', $cfg_payPhone_wxmini);

	$huoniaoTag->assign('payPhone_entrance', (int)$cfg_payPhone_entrance);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
