<?php
/**
 * 分销设置
 *
 * @version        $Id: fenxiaoConfig.php 2015-8-4 下午15:09:11 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("fenxiaoConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "fenxiaoConfig.html";
$dir       = "../../templates/member"; //当前目录

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	if(empty($fenxiaoName)){
		die('{"state": 200, "info": '.json_encode("请填写属性名称").'}');
	}
	$cfg_fenxiaoName        = $fenxiaoName;
	$cfg_fenxiaoState       = (int)$fenxiaoState;
	$cfg_fenxiaoSource      = (int)$fenxiaoSource;
	$cfg_fenxiaoDeposit      = (int)$fenxiaoDeposit;
	$cfg_fenxiaoJoinCheck   = (int)$fenxiaoJoinCheck;
    $cfg_fenxiaoJoinCheckPhone = (int)$fenxiaoJoinCheckPhone;
	$cfg_fenxiaoType        = (int)$fenxiaoType;
	$cfg_fenxiaoZigou       = (int)$fenxiaoZigou;
	$cfg_fenxiaoHjType      = (int)$fenxiaoHjType;
	$cfg_fenxiaoRecAmount   = (float)$fenxiaoRecAmount;
	$cfg_fenxiaoRecAmountPercent   = (float)$fenxiaoRecAmountPercent;
	$cfg_fenxiaoAmount      = (int)$fenxiaoAmount;
	$cfg_fabufenxiaoAmount  = (int)$fabufenxiaoAmount;
	$cfg_livefenxiaoAmount  = (int)$livefenxiaoAmount;
	$cfg_memberfenxiaoAmount   = (int)$memberfenxiaoAmount;
	$cfg_rooffenxiaoAmount   = (int)$rooffenxiaoAmount;
	$cfg_businessfenxiaoAmount = (int)$businessfenxiaoAmount;
	$cfg_fenxiaoQrType      = (int)$fenxiaoQrType;
    $cfg_memberBinding      = (int)$memberBinding;

    $cfg_fenxiaoOfflineItems = isset($fenxiaoOfflineItems) ? join(',',$fenxiaoOfflineItems) : '';

    $fenxiaoLevel           = $fenxiaoLevel ? $fenxiaoLevel : array();
	$cfg_fenxiaoJoinNote        = $fenxiaoJoinNote;
	$cfg_fenxiaoNote        = $fenxiaoNote;
	$cfg_fenxiaoLevel       = array();
	if($fenxiaoLevel){
		foreach ($fenxiaoLevel['name'] as $key => $value) {
			$cfg_fenxiaoLevel[] = array(
				"name" => $value,
				"fee" => (float)$fenxiaoLevel['fee'][$key],
				"amount" => (float)$fenxiaoLevel['amount'][$key],
				"back" => (float)$fenxiaoLevel['back'][$key],
				"count" => (int)$fenxiaoLevel['count'][$key]
			);
		}
	}
	$config = $_POST['config'];
	if($config){
		foreach ($config as $key => $value) {
			$sql = "";
			switch($value){
				case 'shop':
					$sql = "UPDATE `#@__shop_product` SET `fx_reward` = '0'";
					break;
				case 'tuan':
					$sql = "UPDATE `#@__tuanlist` SET `fx_reward` = '0'";
					break;
				case 'info':
					$sql = "UPDATE `#@__infolist` SET `fx_reward` = '0'";
					break;
				case 'waimai':
					$sql = "UPDATE `#@__waimai_list` SET `fx_reward` = '0'";
					break;
			}
			if($sql){
				$sql = $dsql->SetQuery($sql);
				$dsql->dsqlOper($sql, "update");
			}

		}
	}

	adminLog("修改分销设置");

	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_fenxiaoName = '".$cfg_fenxiaoName."';\r\n";
	$configFile .= "\$cfg_fenxiaoState = ".$cfg_fenxiaoState.";\r\n";
	$configFile .= "\$cfg_fenxiaoSource = ".$cfg_fenxiaoSource.";\r\n";
	$configFile .= "\$cfg_fenxiaoDeposit = ".$cfg_fenxiaoDeposit.";\r\n";
	$configFile .= "\$cfg_fenxiaoJoinCheck = ".(int)$cfg_fenxiaoJoinCheck.";\r\n";
	$configFile .= "\$cfg_fenxiaoJoinCheckPhone = ".(int)$cfg_fenxiaoJoinCheckPhone.";\r\n";
	$configFile .= "\$cfg_fenxiaoType = ".$cfg_fenxiaoType.";\r\n";
	$configFile .= "\$cfg_fenxiaoZigou = ".$cfg_fenxiaoZigou.";\r\n";
	$configFile .= "\$cfg_fenxiaoHjType = '".$cfg_fenxiaoHjType."';\r\n";
	$configFile .= "\$cfg_fenxiaoRecAmount = '".$cfg_fenxiaoRecAmount."';\r\n";
	$configFile .= "\$cfg_fenxiaoRecAmountPercent = '".$cfg_fenxiaoRecAmountPercent."';\r\n";
	$configFile .= "\$cfg_fenxiaoAmount = '".$cfg_fenxiaoAmount."';\r\n";
	$configFile .= "\$cfg_fabufenxiaoAmount = '".$cfg_fabufenxiaoAmount."';\r\n";
	$configFile .= "\$cfg_livefenxiaoAmount = '".$cfg_livefenxiaoAmount."';\r\n";
	$configFile .= "\$cfg_memberfenxiaoAmount = '".$cfg_memberfenxiaoAmount."';\r\n";
	$configFile .= "\$cfg_rooffenxiaoAmount = '".$cfg_rooffenxiaoAmount."';\r\n";
	$configFile .= "\$cfg_businessfenxiaoAmount = '".$cfg_businessfenxiaoAmount."';\r\n";
	// $configFile .= "\$cfg_fenxiaoFee = '".serialize($cfg_fenxiaoFee)."';\r\n";
	$configFile .= "\$cfg_fenxiaoLevel = '".serialize($cfg_fenxiaoLevel)."';\r\n";
	$configFile .= "\$cfg_fenxiaoJoinNote = '".$cfg_fenxiaoJoinNote."';\r\n";
	$configFile .= "\$cfg_fenxiaoNote = '".$cfg_fenxiaoNote."';\r\n";
	$configFile .= "\$cfg_fenxiaoQrType = ".$cfg_fenxiaoQrType.";\r\n";
    $configFile .= "\$cfg_memberBinding = ".$cfg_memberBinding.";\r\n";
    $configFile .= "\$cfg_fenxiaoOfflineItems = '"._RunMagicQuotes($cfg_fenxiaoOfflineItems)."';\r\n";
	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/fenxiaoConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/member/fenxiaoConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('fenxiaoName', $cfg_fenxiaoName);
	$huoniaoTag->assign('fenxiaoJoinNote', stripslashes($cfg_fenxiaoJoinNote));
	$huoniaoTag->assign('fenxiaoNote', stripslashes($cfg_fenxiaoNote));
	//状态
	$huoniaoTag->assign('fenxiaoState', array('0', '1'));
	$huoniaoTag->assign('fenxiaoStateNames',array('关闭','开启'));
	$huoniaoTag->assign('fenxiaoStateChecked', (int)$cfg_fenxiaoState);
	//分销模式
	$huoniaoTag->assign('fenxiaoType', array('0', '1'));
	$huoniaoTag->assign('fenxiaoTypeNames',array('等级模式','固定上级'));
	$huoniaoTag->assign('fenxiaoTypeChecked', (int)$cfg_fenxiaoType);
    //分销来源
    $huoniaoTag->assign('fenxiaoSource', array('0', '1'));
    $huoniaoTag->assign('fenxiaoSourceNames',array('平台','商家'));
    $huoniaoTag->assign('fenxiaoSourceChecked', (int)$cfg_fenxiaoSource);
    //资金沉淀
    $huoniaoTag->assign('fenxiaoDeposit', array('0', '1'));
    $huoniaoTag->assign('fenxiaoDepositNames',array('关闭','开启'));
    $huoniaoTag->assign('fenxiaoDepositChecked', (int)$cfg_fenxiaoDeposit);
    //入驻审核
    $huoniaoTag->assign('fenxiaoJoinCheck', array('0', '1'));
    $huoniaoTag->assign('fenxiaoJoinCheckNames',array('需要审核','不需要审核'));
    $huoniaoTag->assign('fenxiaoJoinCheckChecked', (int)$cfg_fenxiaoJoinCheck);
	//入驻验证手机
    $huoniaoTag->assign('fenxiaoJoinCheckPhone', array('0', '1'));
    $huoniaoTag->assign('fenxiaoJoinCheckPhoneNames', array('需要验证', '不需要验证'));
    $huoniaoTag->assign('fenxiaoJoinCheckPhoneChecked', (int)$cfg_fenxiaoJoinCheckPhone);
	//自购返佣
	$huoniaoTag->assign('fenxiaoZigou', array('0', '1'));
	$huoniaoTag->assign('fenxiaoZigouNames',array('关闭','开启'));
	$huoniaoTag->assign('fenxiaoZigouChecked', (int)$cfg_fenxiaoZigou);

	//分销佣金模式
    $huoniaoTag->assign('fenxiaoHjType', array('0', '1'));
    $huoniaoTag->assign('fenxiaoHjTypeNames',array('固定金额','入驻费百分比（固定上级模式推荐）'));
    $huoniaoTag->assign('fenxiaoHjTypeChecked', (int)$cfg_fenxiaoHjType);

	$huoniaoTag->assign('fenxiaoRecAmount', (float)$cfg_fenxiaoRecAmount);
	$huoniaoTag->assign('fenxiaoRecAmountPercent', (float)$cfg_fenxiaoRecAmountPercent);
	$huoniaoTag->assign('fenxiaoAmount', (int)$cfg_fenxiaoAmount);
	$huoniaoTag->assign('fabufenxiaoAmount', (int)$cfg_fabufenxiaoAmount);
	$huoniaoTag->assign('livefenxiaoAmount', (int)$cfg_livefenxiaoAmount);
	$huoniaoTag->assign('memberfenxiaoAmount', (int)$cfg_memberfenxiaoAmount);
	$huoniaoTag->assign('rooffenxiaoAmount', (int)$cfg_rooffenxiaoAmount);
	$huoniaoTag->assign('businessfenxiaoAmount', (int)$cfg_businessfenxiaoAmount);
	$huoniaoTag->assign('fenxiaoLevel', $cfg_fenxiaoLevel ? unserialize($cfg_fenxiaoLevel) : array());

    //推广二维码类型
    $huoniaoTag->assign('fenxiaoQrType', array('0', '1'));
    $huoniaoTag->assign('fenxiaoQrTypeNames',array('普通二维码','微信小程序码'));
    $huoniaoTag->assign('fenxiaoQrTypeChecked', (int)$cfg_fenxiaoQrType);

    //绑定会员类型
    $huoniaoTag->assign('memberBinding', array('0', '1'));
    $huoniaoTag->assign('memberBindingNames',array('开启','关闭'));
    $huoniaoTag->assign('memberBindingChecked', (int)$cfg_memberBinding);

	//我的团队显示内容
	$huoniaoTag->assign('fenxiaoOfflineItems', $cfg_fenxiaoOfflineItems ? explode(',', $cfg_fenxiaoOfflineItems) : array());

	$configval = array();
	$configlist = array();
	foreach ($installModuleArr as $key => $value) {
		if($value == 'shop' || $value == 'tuan' || $value == 'waimai'){
			$configval[] = $value;
			$configlist[] = $installModuleTitleArr[$value];
		}
	}
	// print_r($configval);die;
	$huoniaoTag->assign('configlist', $configlist);
	$huoniaoTag->assign('configval', $configval);
	$huoniaoTag->assign('config', explode(",", $config));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/fenxiaoConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
