<?php
/**
 * 商家入驻配置
 *
 * @version        $Id: businessJoinConfig.php 2019-01-07 下午15:13:20 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2020, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessJoinConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessJoinConfig.html";


//频道配置参数
include(HUONIAOINC."/config/business.inc.php");

//异步提交
if($type != ""){
	if($token == "") die('token传递失败！');

	//基本设置
	if($type == 'config'){

		$customJoinState  = (int)$joinState;
		$customJoinCheck  = (int)$joinCheck;
        $customJoinCheckPhone = (int)$joinCheckPhone;
		$customEditJoinCheck = (int)$editJoinCheck;
		$customModuleJoinCheck = (int)$moduleJoinCheck;
		$customEditModuleJoinCheck = (int)$editModuleJoinCheck;
		$customJoinTimesUnit = (int)$joinTimesUnit;
        $customJoinRepeat = (int)$joinRepeat;
        $customJoinCheckMaterial = join(',', $joinCheckMaterial);

		//商家特权
		$businessPrivilege = array();
		foreach ($cfg_businessPrivilegeArr as $key => $value) {
			// if($business[$value['name']]['price']){
				$businessPrivilege[$value['name']] = array(
					'title' => trim($business[$value['name']]['title']) ? trim($business[$value['name']]['title']) : $value['title'],
					'label' => trim($business[$value['name']]['label']),
					'note' => trim($business[$value['name']]['note']),
					'price' => (float)$business[$value['name']]['price'],
					'mprice' => (float)$business[$value['name']]['mprice'],
					'state' => (int)$business[$value['name']]['state']  //状态  0启用  1停用
				);
			// }
		}
		$businessPrivilege = serialize($businessPrivilege);

		//行业店铺
		$businessStore = array();
		foreach ($cfg_businessStoreModuleArr as $key => $value) {
			// if($store[$value['name']]['price']){
				$businessStore[$value['name']] = array(
					'title' => trim($store[$value['name']]['title']) ? trim($store[$value['name']]['title']) : $value['title'],
					'label' => trim($store[$value['name']]['label']),
					'note' => trim($store[$value['name']]['note']),
					'price' => (float)$store[$value['name']]['price'],
					'mprice' => (float)$store[$value['name']]['mprice']
				);
			// }
		}
		$businessStore = serialize($businessStore);


	//套餐管理
	}elseif($type == 'package'){

		$packageArr = array();
		if($package['title']){
			foreach ($package['title'] as $key => $value) {
				array_push($packageArr, array(
					'title' => trim($value),
					'icon' => trim($package['icon'][$key]),
					'label' => trim($package['label'][$key]),
					'price' => (float)$package['price'][$key],
					'mprice' => (float)$package['mprice'][$key],
					'list' => trim($package['list'][$key])
				));
			}
		}
		$businessPackage = serialize($packageArr);


	//活动管理
	}elseif($type == 'activity'){

		// //开通时长
		// $businessJoinTimes = array();
		// if($times){
		// 	foreach ($times as $key => $value) {
		// 		array_push($businessJoinTimes, $value);
		// 	}
		// }
		// $businessJoinTimes = serialize($businessJoinTimes);

		// //满减
		// $businessJoinSale = array();
		// if($price){
		// 	foreach ($price as $key => $value) {
		// 		array_push($businessJoinSale, array(
		// 			'price' => $value,
		// 			'amount' => $_POST['amount'][$key]
		// 		));
		// 	}
		// }
		// $businessJoinSale = serialize($businessJoinSale);

		// //送积分
		// $businessJoinPoint = array();
		// if($month){
		// 	foreach ($month as $key => $value) {
		// 		array_push($businessJoinPoint, array(
		// 			'month' => $value,
		// 			'point' => $point[$key]
		// 		));
		// 	}
		// }
		// $businessJoinPoint = serialize($businessJoinPoint);

		//时长设置
		$businessJoinRule = array();
		if($times){
			foreach ($times as $key => $value) {
				array_push($businessJoinRule, array(
					'times' => (int)$value,
					'discount' => (float)$discount[$key],
					'point' => (int)$point[$key],
				));
			}
		}
		$businessJoinRule = serialize($businessJoinRule);

	}


	//基本设置文件内容
	$customInc = "<"."?php\r\n";
	//基本设置
	$customInc .= "\$customChannelName = '".$customChannelName."';\r\n";
	$customInc .= "\$customLogo = ".$customLogo.";\r\n";
	$customInc .= "\$customLogoUrl = '".$customLogoUrl."';\r\n";
	$customInc .= "\$customSharePic = '".$customSharePic."';\r\n";
	$customInc .= "\$customSubDomain = ".$customSubDomain.";\r\n";
	$customInc .= "\$customChannelSwitch = ".$customChannelSwitch.";\r\n";
	$customInc .= "\$customCloseCause = '".$customCloseCause."';\r\n";
	$customInc .= "\$customSeoTitle = '".$customSeoTitle."';\r\n";
	$customInc .= "\$customSeoKeyword = '".$customSeoKeyword."';\r\n";
	$customInc .= "\$customSeoDescription = '".$customSeoDescription."';\r\n";
	// $customInc .= "\$customAgreement = '".$customAgreement."';\r\n";
	$customInc .= "\$customBusinessTag = '".$customBusinessTag."';\r\n";
	$customInc .= "\$customCommentCheck = ".(int)$customCommentCheck.";\r\n";
    $customInc .= "\$custommaidanFenXiao = ".(int)$custommaidanFenXiao.";\r\n";
	$customInc .= "\$customBusinessState = ".(int)$customBusinessState.";\r\n";

	$customInc .= "\$customJoinState = ".(int)$customJoinState.";\r\n";
	$customInc .= "\$customJoinCheck = ".(int)$customJoinCheck.";\r\n";
	$customInc .= "\$customJoinCheckPhone = ".(int)$customJoinCheckPhone.";\r\n";
	$customInc .= "\$customEditJoinCheck = ".(int)$customEditJoinCheck.";\r\n";
	$customInc .= "\$customModuleJoinCheck = ".(int)$customModuleJoinCheck.";\r\n";
	$customInc .= "\$customEditModuleJoinCheck = ".(int)$customEditModuleJoinCheck.";\r\n";
	$customInc .= "\$customJoinTimesUnit = ".(int)$customJoinTimesUnit.";\r\n";
	$customInc .= "\$customJoinRepeat = ".(int)$customJoinRepeat.";\r\n";
	$customInc .= "\$customJoinCheckMaterial = '".$customJoinCheckMaterial."';\r\n";
	$customInc .= "\$customBusinessJoinFenxiao = ".(int)$customBusinessJoinFenxiao.";\r\n";
	$customInc .= "\$customBusinessPayBindRec = ".(int)$customBusinessPayBindRec.";\r\n";
	$customInc .= "\$customDataShare = ".(int)$customDataShare.";\r\n";
	$customInc .= "\$customSpeakerPrefix = '".$customSpeakerPrefix."';\r\n";
	$customInc .= "\$customMaidanTemp = '".$customMaidanTemp."';\r\n";
	$customInc .= "\$customShort_video_promote = '".$customShort_video_promote."';\r\n";
    $customInc .= "\$customTemplateCheck = '".$customTemplateCheck."';\r\n";

    //入驻基本配置
	$customInc .= "\$businessPrivilege = '".$businessPrivilege."';\r\n";
	$customInc .= "\$businessStore = '".$businessStore."';\r\n";
	$customInc .= "\$businessInformation = '".$businessInformation."';\r\n";

	//入驻套餐
	// $customInc .= "\$businessPackage = '".$businessPackage."';\r\n";

	//入驻活动
	// $customInc .= "\$businessJoinTimes = '".$businessJoinTimes."';\r\n";
	// $customInc .= "\$businessJoinSale = '".$businessJoinSale."';\r\n";
	// $customInc .= "\$businessJoinPoint = '".$businessJoinPoint."';\r\n";
	$customInc .= "\$businessJoinRule = '".$businessJoinRule."';\r\n";

	//模板风格
	$customInc .= "\$customRouter = ".(int)$customRouter.";\r\n";
	$customInc .= "\$customTemplate = '".$customTemplate."';\r\n";
	$customInc .= "\$customTouchRouter = ".(int)$customTouchRouter.";\r\n";
	$customInc .= "\$customTouchTemplate = '".$customTouchTemplate."';\r\n";
	//上传设置
	$customInc .= "\$customUpload = ".$customUpload.";\r\n";
	$customInc .= "\$custom_uploadDir = '".$custom_uploadDir."';\r\n";
	$customInc .= "\$custom_softSize = ".$custom_softSize.";\r\n";
	$customInc .= "\$custom_softType = '".$custom_softType."';\r\n";
	$customInc .= "\$custom_thumbSize = ".$custom_thumbSize.";\r\n";
	$customInc .= "\$custom_thumbType = '".$custom_thumbType."';\r\n";
	$customInc .= "\$custom_atlasSize = ".$custom_atlasSize.";\r\n";
	$customInc .= "\$custom_atlasType = '".$custom_atlasType."';\r\n";
	$customInc .= "\$custom_brandSmallWidth = ".$custom_brandSmallWidth.";\r\n";
	$customInc .= "\$custom_brandSmallHeight = ".$custom_brandSmallHeight.";\r\n";
	$customInc .= "\$custom_brandMiddleWidth = ".$custom_brandMiddleWidth.";\r\n";
	$customInc .= "\$custom_brandMiddleHeight = ".$custom_brandMiddleHeight.";\r\n";
	$customInc .= "\$custom_brandLargeWidth = ".$custom_brandLargeWidth.";\r\n";
	$customInc .= "\$custom_brandLargeHeight = ".$custom_brandLargeHeight.";\r\n";
	$customInc .= "\$custom_thumbSmallWidth = ".$custom_thumbSmallWidth.";\r\n";
	$customInc .= "\$custom_thumbSmallHeight = ".$custom_thumbSmallHeight.";\r\n";
	$customInc .= "\$custom_thumbMiddleWidth = ".$custom_thumbMiddleWidth.";\r\n";
	$customInc .= "\$custom_thumbMiddleHeight = ".$custom_thumbMiddleHeight.";\r\n";
	$customInc .= "\$custom_thumbLargeWidth = ".$custom_thumbLargeWidth.";\r\n";
	$customInc .= "\$custom_thumbLargeHeight = ".$custom_thumbLargeHeight.";\r\n";
	$customInc .= "\$custom_atlasSmallWidth = ".$custom_atlasSmallWidth.";\r\n";
	$customInc .= "\$custom_atlasSmallHeight = ".$custom_atlasSmallHeight.";\r\n";
	$customInc .= "\$custom_photoCutType = '".$custom_photoCutType."';\r\n";
	$customInc .= "\$custom_photoCutPostion = '".$custom_photoCutPostion."';\r\n";
	$customInc .= "\$custom_quality = ".$custom_quality.";\r\n";
	//远程附件
	$customInc .= "\$customFtp = ".$customFtp.";\r\n";
	$customInc .= "\$custom_ftpState = ".$custom_ftpState.";\r\n";
	$customInc .= "\$custom_ftpType = ".$custom_ftpType.";\r\n";
	$customInc .= "\$custom_ftpSSL = ".$custom_ftpSSL.";\r\n";
	$customInc .= "\$custom_ftpPasv = ".$custom_ftpPasv.";\r\n";
	$customInc .= "\$custom_ftpUrl = '".$custom_ftpUrl."';\r\n";
	$customInc .= "\$custom_ftpServer = '".$custom_ftpServer."';\r\n";
	$customInc .= "\$custom_ftpPort = ".$custom_ftpPort.";\r\n";
	$customInc .= "\$custom_ftpDir = '".$custom_ftpDir."';\r\n";
	$customInc .= "\$custom_ftpUser = '".$custom_ftpUser."';\r\n";
	$customInc .= "\$custom_ftpPwd = '".$custom_ftpPwd."';\r\n";
	$customInc .= "\$custom_ftpTimeout = ".$custom_ftpTimeout.";\r\n";
	$customInc .= "\$custom_OSSUrl = '".$custom_OSSUrl."';\r\n";
	$customInc .= "\$custom_OSSBucket = '".$custom_OSSBucket."';\r\n";
	$customInc .= "\$custom_EndPoint = '".$custom_EndPoint."';\r\n";
	$customInc .= "\$custom_OSSKeyID = '".$custom_OSSKeyID."';\r\n";
	$customInc .= "\$custom_OSSKeySecret = '".$custom_OSSKeySecret."';\r\n";
	$customInc .= "\$custom_QINIUAccessKey = '".$custom_QINIUAccessKey."';\r\n";
	$customInc .= "\$custom_QINIUSecretKey = '".$custom_QINIUSecretKey."';\r\n";
	$customInc .= "\$custom_QINIUbucket = '".$custom_QINIUbucket."';\r\n";
	$customInc .= "\$custom_QINIUdomain = '".$custom_QINIUdomain."';\r\n";
	$customInc .= "\$custom_OBSUrl = '".$custom_OBSUrl."';\r\n";
	$customInc .= "\$custom_OBSBucket = '".$custom_OBSBucket."';\r\n";
	$customInc .= "\$custom_OBSEndpoint = '".$custom_OBSEndpoint."';\r\n";
	$customInc .= "\$custom_OBSKeyID = '".$custom_OBSKeyID."';\r\n";
	$customInc .= "\$custom_OBSKeySecret = '".$custom_OBSKeySecret."';\r\n";
	$customInc .= "\$custom_COSUrl = '".$custom_COSUrl."';\r\n";
	$customInc .= "\$custom_COSBucket = '".$custom_COSBucket."';\r\n";
	$customInc .= "\$custom_COSRegion = '".$custom_COSRegion."';\r\n";
	$customInc .= "\$custom_COSSecretid = '".$custom_COSSecretid."';\r\n";
	$customInc .= "\$custom_COSSecretkey = '".$custom_COSSecretkey."';\r\n";
	//水印设置
	$customInc .= "\$customMark = ".$customMark.";\r\n";
	$customInc .= "\$custom_thumbMarkState = ".$custom_thumbMarkState.";\r\n";
	$customInc .= "\$custom_atlasMarkState = ".$custom_atlasMarkState.";\r\n";
	$customInc .= "\$custom_editorMarkState = ".$custom_editorMarkState.";\r\n";
	$customInc .= "\$custom_waterMarkWidth = ".$custom_waterMarkWidth.";\r\n";
	$customInc .= "\$custom_waterMarkHeight = ".$custom_waterMarkHeight.";\r\n";
	$customInc .= "\$custom_waterMarkPostion = ".$custom_waterMarkPostion.";\r\n";
	$customInc .= "\$custom_waterMarkType = ".$custom_waterMarkType.";\r\n";
	$customInc .= "\$custom_waterMarkText = '".$custom_markText."';\r\n";
	$customInc .= "\$custom_markFontfamily = '".$custom_markFontfamily."';\r\n";
	$customInc .= "\$custom_markFontsize = ".$custom_markFontsize.";\r\n";
	$customInc .= "\$custom_markFontColor = '".$custom_markFontColor."';\r\n";
	$customInc .= "\$custom_markFile = '".$custom_markFile."';\r\n";
	$customInc .= "\$custom_markPadding = ".$custom_markPadding.";\r\n";
	$customInc .= "\$custom_markTransparent = ".$custom_markTransparent.";\r\n";
	$customInc .= "\$custom_markQuality = ".$custom_markQuality.";\r\n";
	//打印机设置
	$customInc .= "\$customPrintPlat = ".(int)$customPrintPlat.";\r\n";
	$customInc .= "\$customPartnerId = ".(int)$customPartnerId.";\r\n";
	$customInc .= "\$customPrintKey = '".$customPrintKey."';\r\n";
    $customInc .= "\$customPrint_user    = '" . $customPrint_user . "';\r\n";
    $customInc .= "\$customPrint_ukey    = '" . $customPrint_ukey . "';\r\n";
    $customInc .= "\$customPrint_ucount    = '" . $customPrint_ucount . "';\r\n";
	// $customInc .= "\$customAcceptType = ".(int)$customAcceptType.";\r\n";
	$customInc .= "?".">";

	$customIncFile = HUONIAOINC."/config/business.inc.php";
	$fp = fopen($customIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $customIncFile 失败，请检查权限！").'}');
	fwrite($fp, $customInc);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/business/businessJoinConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//入驻开关-单选
    $huoniaoTag->assign('joinState', array('0', '1'));
    $huoniaoTag->assign('joinStateNames', array('开启', '关闭'));
    $huoniaoTag->assign('joinStateChecked', (int)$customJoinState);

	//入驻审核-单选
    $huoniaoTag->assign('joinCheck', array('0', '1'));
    $huoniaoTag->assign('joinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('joinCheckChecked', (int)$customJoinCheck);

	//入驻验证手机-单选
    $huoniaoTag->assign('joinCheckPhone', array('0', '1'));
    $huoniaoTag->assign('joinCheckPhoneNames', array('需要验证', '不需要验证'));
    $huoniaoTag->assign('joinCheckPhoneChecked', (int)$customJoinCheckPhone);

	//修改商家信息审核-单选
    $huoniaoTag->assign('editJoinCheck', array('0', '1'));
    $huoniaoTag->assign('editJoinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('editJoinCheckChecked', (int)$customEditJoinCheck);

	//模块店铺入驻审核-单选
    $huoniaoTag->assign('moduleJoinCheck', array('0', '1'));
    $huoniaoTag->assign('moduleJoinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('moduleJoinCheckChecked', (int)$customModuleJoinCheck);

	//修改模块店铺信息审核-单选
    $huoniaoTag->assign('editModuleJoinCheck', array('0', '1'));
    $huoniaoTag->assign('editModuleJoinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('editModuleJoinCheckChecked', (int)$customEditModuleJoinCheck);

	//入驻时长单位-单选
    $huoniaoTag->assign('joinTimesUnit', array('0', '1'));
    $huoniaoTag->assign('joinTimesUnitNames', array('按月计费', '按年计费'));
    $huoniaoTag->assign('joinTimesUnitChecked', (int)$customJoinTimesUnit);

	//重复入驻-单选
    $huoniaoTag->assign('joinRepeat', array('0', '1'));
    $huoniaoTag->assign('joinRepeatNames', array('不限制', '限制'));
    $huoniaoTag->assign('joinRepeatChecked', (int)$customJoinRepeat);

	//商家特权
	$huoniaoTag->assign('businessPrivilege', $businessPrivilege ? unserialize($businessPrivilege) : array());
	$huoniaoTag->assign('businessPrivilegeJson', json_encode($businessPrivilege ? unserialize($businessPrivilege) : array()));

	//行业店铺
	$huoniaoTag->assign('businessStore', $businessStore ? unserialize($businessStore) : array());
	$huoniaoTag->assign('businessStoreJson', json_encode($businessStore ? unserialize($businessStore) : array()));

	//套餐
	// $huoniaoTag->assign('businessPackage', $businessPackage ? unserialize($businessPackage) : array());

	//活动
	// $huoniaoTag->assign('businessJoinTimes', $businessJoinTimes ? unserialize($businessJoinTimes) : array());
	// $huoniaoTag->assign('businessJoinSale', $businessJoinSale ? unserialize($businessJoinSale) : array());
	// $huoniaoTag->assign('businessJoinPoint', $businessJoinPoint ? unserialize($businessJoinPoint) : array());

    $defaultRule = array(
        array('times' => 1, 'discount' => 9.8, 'point' => 10),
        array('times' => 3, 'discount' => 9.5, 'point' => 30),
        array('times' => 6, 'discount' => 9, 'point' => 60),
        array('times' => 12, 'discount' => 8, 'point' => 100),
    );
	$huoniaoTag->assign('businessJoinRule', $businessJoinRule ? unserialize($businessJoinRule) : $defaultRule);

    //认证材料
    $huoniaoTag->assign('joinCheckMaterialArr', $customJoinCheckMaterial ? explode(',', $customJoinCheckMaterial) : array());


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
