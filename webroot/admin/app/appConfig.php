<?php
/**
 * APP基本配置
 *
 * @version        $Id: appConfig.php 2017-04-12 下午15:07:11 $
 * @package        HuoNiao.APP
 * @copyright      Copyright (c) 2013 - 2017, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("appConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/app";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "appConfig.html";

$dir = "../../static/images/admin/platform"; //当前目录

//异步提交
if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$sql = $dsql->SetQuery("SELECT `android_download` FROM `#@__app_config`");
	$ret = $dsql->dsqlOper($sql, "totalCount");

	//存在则更新，不存在插入
	$map_set = empty($map_set) ? 1 : $map_set;
	$peisong_map_set = empty($peisong_map_set) ? 1 : $peisong_map_set;
	$android_force = (int)$android_force;
	$ios_force = (int)$ios_force;
	$harmony_force = (int)$harmony_force;
	$business_android_force = (int)$business_android_force;
	$business_ios_force = (int)$business_ios_force;
	$peisong_android_force = (int)$peisong_android_force;
	$peisong_ios_force = (int)$peisong_ios_force;
    $ios_shelf = (int)$ios_shelf;
	$ad_time = (int)$ad_time;
	$business_noticeCount = (int)$business_noticeCount;
	$peisong_noticeCount = (int)$peisong_noticeCount;
	$downloadtips = (int)$downloadtips;
    $disagreePrivacy = (int)$disagreePrivacy;
	$wx_appid = $wx_appid;
	$URLScheme_Android = $URLScheme_Android;
	$URLScheme_iOS = $URLScheme_iOS;
	$umeng_phoneLoginState = (int)$umeng_phoneLoginState;

	if($ret){
		$sql = $dsql->SetQuery("UPDATE `#@__app_config` SET `appname` = '$appname', `subtitle` = '$subtitle', `logo` = '$logo', `android_version` = '$android_version', `ios_version` = '$ios_version', `harmony_version` = '$harmony_version', `android_download` = '$android_download', `yyb_download` = '$yyb_download', `ios_download` = '$ios_download', `harmony_download` = '$harmony_download', `huawei_download` = '$huawei_download', `honor_download` = '$honor_download', `mi_download` = '$mi_download', `oppo_download` = '$oppo_download', `vivo_download` = '$vivo_download', `android_guide` = '$android_guide', `ios_guide` = '$ios_guide', `ad_pic` = '$ad_pic', `ad_link` = '$ad_link', `ad_time` = '$ad_time', `ad_TencentGDT_android_app_id` = '$ad_TencentGDT_android_app_id', `ad_TencentGDT_android_placement_id` = '$ad_TencentGDT_android_placement_id', `android_index` = '$android_index', `ios_index` = '$ios_index', `ios_test` = '$ios_test', `ios_test_1` = '$ios_test_1', `ios_test_2` = '$ios_test_2', `map_baidu_android` = '$map_baidu_android', `map_baidu_ios` = '$map_baidu_ios', `map_google_android` = '$map_google_android', `map_google_ios` = '$map_google_ios', `map_amap_android` = '$map_amap_android', `map_amap_ios` = '$map_amap_ios', `map_set` = '$map_set', `android_update` = '$android_update', `android_force` = '$android_force', `android_size` = '$android_size', `android_note` = '$android_note', `ios_update` = '$ios_update', `ios_force` = '$ios_force', `ios_note` = '$ios_note', `harmony_update` = '$harmony_update', `harmony_force` = '$harmony_force', `harmony_size` = '$harmony_size', `harmony_note` = '$harmony_note', `business_appname` = '$business_appname', `business_android_version` = '$business_android_version', `business_android_update` = '$business_android_update', `business_android_force` = '$business_android_force', `business_android_size` = '$business_android_size', `business_android_note` = '$business_android_note', `business_ios_version` = '$business_ios_version', `business_ios_update` = '$business_ios_update', `business_ios_force` = '$business_ios_force', `business_ios_note` = '$business_ios_note', `business_android_download` = '$business_android_download', `business_yyb_download` = '$business_yyb_download', `business_ios_download` = '$business_ios_download', `business_huawei_download` = '$business_huawei_download', `business_honor_download` = '$business_honor_download', `business_mi_download` = '$business_mi_download', `business_oppo_download` = '$business_oppo_download', `business_vivo_download` = '$business_vivo_download', `peisong_appname` = '$peisong_appname', `peisong_android_version` = '$peisong_android_version', `peisong_android_update` = '$peisong_android_update', `peisong_android_force` = '$peisong_android_force', `peisong_android_size` = '$peisong_android_size', `peisong_android_note` = '$peisong_android_note', `peisong_ios_version` = '$peisong_ios_version', `peisong_ios_update` = '$peisong_ios_update', `peisong_ios_force` = '$peisong_ios_force', `peisong_ios_note` = '$peisong_ios_note', `peisong_android_download` = '$peisong_android_download', `peisong_yyb_download` = '$peisong_yyb_download', `peisong_ios_download` = '$peisong_ios_download', `peisong_huawei_download` = '$peisong_huawei_download', `peisong_honor_download` = '$peisong_honor_download', `peisong_mi_download` = '$peisong_mi_download', `peisong_oppo_download` = '$peisong_oppo_download', `peisong_vivo_download` = '$peisong_vivo_download', `business_logo` = '$business_logo', `peisong_logo` = '$peisong_logo', `rongKeyID` = '$rongKeyID', `rongKeySecret` = '$rongKeySecret', `peisong_map_baidu_android` = '$peisong_map_baidu_android', `peisong_map_baidu_ios` = '$peisong_map_baidu_ios', `peisong_map_google_android` = '$peisong_map_google_android', `peisong_map_google_ios` = '$peisong_map_google_ios', `peisong_map_amap_android` = '$peisong_map_amap_android', `peisong_map_amap_ios` = '$peisong_map_amap_ios', `peisong_map_set` = '$peisong_map_set', `template` = '$touchTemplate', `ios_shelf` = $ios_shelf, `disabledModule` = '$disabledModule', `business_noticeCount` = '$business_noticeCount', `peisong_noticeCount` = '$peisong_noticeCount', `downloadtips` = '$downloadtips', `disagreePrivacy` = '$disagreePrivacy', `wx_appid` = '$wx_appid', `URLScheme_Android` = '$URLScheme_Android', `URLScheme_iOS` = '$URLScheme_iOS', `umeng_aliyunAppKey` = '$umeng_aliyunAppKey', `umeng_aliyunAppSecret` = '$umeng_aliyunAppSecret', `umeng_androidAppKey` = '$umeng_androidAppKey', `umeng_iosAppKey` = '$umeng_iosAppKey', `umeng_phoneLoginState` = '$umeng_phoneLoginState', `copyright` = '$copyright', `business_copyright` = '$business_copyright', `peisong_copyright` = '$peisong_copyright'");
	}else{
		$sql = $dsql->SetQuery("INSERT INTO `#@__app_config` (`appname`, `subtitle`, `logo`, `android_version`, `ios_version`, `harmony_version`, `android_download`, `yyb_download`, `ios_download`, `harmony_download`, `huawei_download`, `honor_download`, `mi_download`, `oppo_download`, `vivo_download`, `android_guide`, `ios_guide`, `ad_pic`, `ad_link`, `ad_time`, `ad_TencentGDT_android_app_id`, `ad_TencentGDT_android_placement_id`, `android_index`, `ios_index`, `ios_test`, `ios_test_1`, `ios_test_2`, `map_baidu_android`, `map_baidu_ios`, `map_google_android`, `map_google_ios`, `map_amap_android`, `map_amap_ios`, `map_set`, `android_update`, `android_size`, `android_note`, `ios_update`, `ios_note`, `harmony_update`, `harmony_force`, `harmony_size`, `harmony_note`, `business_appname`, `business_android_version`, `business_android_update`, `business_android_size`, `business_android_note`, `business_ios_version`, `business_ios_update`, `business_ios_note`,  `business_android_download`, `business_yyb_download`, `business_ios_download`, `business_huawei_download`, `business_honor_download`, `business_mi_download`, `business_oppo_download`, `business_vivo_download`, `peisong_appname`, `peisong_android_version`, `peisong_android_update`, `peisong_android_size`, `peisong_android_note`, `peisong_ios_version`, `peisong_ios_update`, `peisong_ios_note`, `peisong_android_download`, `peisong_yyb_download`, `peisong_ios_download`, `peisong_huawei_download`, `peisong_honor_download`, `peisong_mi_download`, `peisong_oppo_download`, `peisong_vivo_download`, `business_logo`, `peisong_logo`, `android_force`, `ios_force`, `business_android_force`, `business_ios_force`, `peisong_android_force`, `peisong_ios_force`, `rongKeyID`, `rongKeySecret`, `peisong_map_baidu_android`, `peisong_map_baidu_ios`, `peisong_map_google_android`, `peisong_map_google_ios`, `peisong_map_amap_android`, `peisong_map_amap_ios`, `peisong_map_set`, `template`, `customBottomButton`, `ios_shelf`, `disabledModule`, `business_noticeCount`, `peisong_noticeCount`, `downloadtips`, `disagreePrivacy`, `wx_appid`, `URLScheme_Android`, `URLScheme_iOS`, `umeng_aliyunAppKey`, `umeng_aliyunAppSecret`, `umeng_androidAppKey`, `umeng_iosAppKey`, `umeng_phoneLoginState`, `copyright`, `business_copyright`, `peisong_copyright`) VALUES ('$appname', '$subtitle', '$logo', '$android_version', '$ios_version', '$harmony_version', '$android_download', '$yyb_download', '$ios_download', '$harmony_download', '$huawei_download', '$honor_download', '$mi_download', '$oppo_download', '$vivo_download', '$android_guide', '$ios_guide', '$ad_pic', '$ad_link', '$ad_time', '$ad_TencentGDT_android_app_id', '$ad_TencentGDT_android_placement_id', '$android_index', '$ios_index', '$ios_test', '$ios_test_1', '$ios_test_2', '$map_baidu_android', '$map_baidu_ios', '$map_google_android', '$map_google_ios', '$map_amap_android', '$map_amap_ios', '$map_set', '$android_update', '$android_size', '$android_note', '$ios_update', '$ios_note', '$harmony_update', '$harmony_force', '$harmony_size', '$harmony_note', '$business_appname', '$business_android_version', '$business_android_update', '$business_android_size', '$business_android_note', '$business_ios_version', '$business_ios_update', '$business_ios_note', '$business_android_download', '$business_yyb_download', '$business_ios_download', '$business_huawei_download', '$business_honor_download', '$business_mi_download', '$business_oppo_download', '$business_vivo_download', '$peisong_appname', '$peisong_android_version', '$peisong_android_update', '$peisong_android_size', '$peisong_android_note', '$peisong_ios_version', '$peisong_ios_update', '$peisong_ios_note', '$peisong_android_download', '$peisong_yyb_download', '$peisong_ios_download', '$peisong_huawei_download', '$peisong_honor_download', '$peisong_mi_download', '$peisong_oppo_download', '$peisong_vivo_download', '$business_logo', '$peisong_logo', '$android_force', '$ios_force', '$business_android_force', '$business_ios_force', '$peisong_android_force', '$peisong_ios_force', '$rongKeyID', '$rongKeySecret', '$peisong_map_baidu_android', '$peisong_map_baidu_ios', '$peisong_map_google_android', '$peisong_map_google_ios', '$peisong_map_amap_android', '$peisong_map_amap_ios', '$peisong_map_set', '$touchTemplate', '', $ios_shelf, '$disabledModule', '$business_noticeCount', '$peisong_noticeCount', '$downloadtips', '$disagreePrivacy', '$wx_appid', '$URLScheme_Android', '$URLScheme_iOS', '$umeng_aliyunAppKey', '$umeng_aliyunAppSecret', '$umeng_androidAppKey', '$umeng_iosAppKey', '$umeng_phoneLoginState', '$copyright', '$business_copyright', '$peisong_copyright')");
	}

	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok"){
		updateAppConfig();  //更新APP配置文件
		adminLog("APP配置", "修改APP基本配置");
		die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	}else{
		die('{"state": 200, "info": '.json_encode("配置失败，请联系管理员！" . $sql).'}');
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/app/appConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$installWaimai = getModuleTitle(array('name'=>'waimai'));
	$huoniaoTag->assign('installWaimai', $installWaimai);
	$huoniaoTag->assign('action', 'app');

	//模板风格
    $floders = listDir($dir);
    $skins = array();
    $floders = listDir($dir . '/app');
	$skins = array(
		array('tplname' => 'diy', 'directory' => 'diy', 'copyright' => '火鸟门户')
    );
    if (!empty($floders)) {
        $i = 1;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/app/' . $floder . '/config.xml';
            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if(!strstr($floder, '__')) {
                    $skins[$i]['tplname'] = $tplname;
                    $skins[$i]['directory'] = $floder;
                    $skins[$i]['copyright'] = $copyright;
                    $i++;
                }
            }
        }
    }
    $huoniaoTag->assign('touchTplList', $skins);


	//查询当前配置
	$sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$data = $ret[0];

		$huoniaoTag->assign('appname', $data['appname']);
		$huoniaoTag->assign('subtitle', $data['subtitle'] ? $data['subtitle'] : '使用APP操作更方便');
		$huoniaoTag->assign('logo', $data['logo']);
		$huoniaoTag->assign('android_version', $data['android_version']);
		$huoniaoTag->assign('android_update', $data['android_update']);
		$huoniaoTag->assign('android_force', $data['android_force']);
		$huoniaoTag->assign('android_size', $data['android_size']);
		$huoniaoTag->assign('android_note', $data['android_note']);
		$huoniaoTag->assign('ios_version', $data['ios_version']);
		$huoniaoTag->assign('ios_update', $data['ios_update']);
		$huoniaoTag->assign('ios_force', $data['ios_force']);
		$huoniaoTag->assign('ios_note', $data['ios_note']);
		$huoniaoTag->assign('harmony_version', $data['harmony_version']);
		$huoniaoTag->assign('harmony_update', $data['harmony_update']);
		$huoniaoTag->assign('harmony_force', $data['harmony_force']);
		$huoniaoTag->assign('harmony_size', $data['harmony_size']);
		$huoniaoTag->assign('harmony_note', $data['harmony_note']);
		$huoniaoTag->assign('android_download', $data['android_download']);
		$huoniaoTag->assign('yyb_download', $data['yyb_download']);
		$huoniaoTag->assign('ios_download', $data['ios_download']);
		$huoniaoTag->assign('harmony_download', $data['harmony_download']);
		$huoniaoTag->assign('huawei_download', $data['huawei_download']);
		$huoniaoTag->assign('honor_download', $data['honor_download']);
		$huoniaoTag->assign('mi_download', $data['mi_download']);
		$huoniaoTag->assign('oppo_download', $data['oppo_download']);
		$huoniaoTag->assign('vivo_download', $data['vivo_download']);
		$huoniaoTag->assign('android_guide', json_encode(explode(",", $data['android_guide'])));
		$huoniaoTag->assign('ios_guide', json_encode(explode(",", $data['ios_guide'])));
		$huoniaoTag->assign('ad_pic', $data['ad_pic']);
		$huoniaoTag->assign('ad_link', $data['ad_link']);
		$huoniaoTag->assign('ad_time', $data['ad_time']);
		$huoniaoTag->assign('ad_TencentGDT_android_app_id', $data['ad_TencentGDT_android_app_id']);
		$huoniaoTag->assign('ad_TencentGDT_android_placement_id', $data['ad_TencentGDT_android_placement_id']);
		$huoniaoTag->assign('android_index', $data['android_index']);
		$huoniaoTag->assign('ios_index', $data['ios_index']);
		$huoniaoTag->assign('ios_test', $data['ios_test']);
		$huoniaoTag->assign('ios_test_1', $data['ios_test_1']);
		$huoniaoTag->assign('ios_test_2', $data['ios_test_2']);
		$huoniaoTag->assign('map_baidu_android', $data['map_baidu_android']);
		$huoniaoTag->assign('map_baidu_ios', $data['map_baidu_ios']);
		$huoniaoTag->assign('map_google_android', $data['map_google_android']);
		$huoniaoTag->assign('map_google_ios', $data['map_google_ios']);
        $huoniaoTag->assign('map_amap_android', $data['map_amap_android']);
        $huoniaoTag->assign('map_amap_ios', $data['map_amap_ios']);
		$huoniaoTag->assign('map_set', empty($data['map_set']) ? 1 : $data['map_set']);
		$huoniaoTag->assign('business_appname', $data['business_appname']);
		$huoniaoTag->assign('business_android_version', $data['business_android_version']);
		$huoniaoTag->assign('business_android_update', $data['business_android_update']);
		$huoniaoTag->assign('business_android_force', $data['business_android_force']);
		$huoniaoTag->assign('business_android_size', $data['business_android_size']);
		$huoniaoTag->assign('business_android_note', $data['business_android_note']);
		$huoniaoTag->assign('business_ios_version', $data['business_ios_version']);
		$huoniaoTag->assign('business_ios_update', $data['business_ios_update']);
		$huoniaoTag->assign('business_ios_force', $data['business_ios_force']);
		$huoniaoTag->assign('business_ios_note', $data['business_ios_note']);
		$huoniaoTag->assign('business_android_download', $data['business_android_download']);
		$huoniaoTag->assign('business_yyb_download', $data['business_yyb_download']);
		$huoniaoTag->assign('business_ios_download', $data['business_ios_download']);
		$huoniaoTag->assign('business_huawei_download', $data['business_huawei_download']);
		$huoniaoTag->assign('business_honor_download', $data['business_honor_download']);
		$huoniaoTag->assign('business_mi_download', $data['business_mi_download']);
		$huoniaoTag->assign('business_oppo_download', $data['business_oppo_download']);
		$huoniaoTag->assign('business_vivo_download', $data['business_vivo_download']);
		$huoniaoTag->assign('peisong_appname', $data['peisong_appname']);
		$huoniaoTag->assign('peisong_android_version', $data['peisong_android_version']);
		$huoniaoTag->assign('peisong_android_update', $data['peisong_android_update']);
		$huoniaoTag->assign('peisong_android_force', $data['peisong_android_force']);
		$huoniaoTag->assign('peisong_android_size', $data['peisong_android_size']);
		$huoniaoTag->assign('peisong_android_note', $data['peisong_android_note']);
		$huoniaoTag->assign('peisong_ios_version', $data['peisong_ios_version']);
		$huoniaoTag->assign('peisong_ios_update', $data['peisong_ios_update']);
		$huoniaoTag->assign('peisong_ios_force', $data['peisong_ios_force']);
		$huoniaoTag->assign('peisong_ios_note', $data['peisong_ios_note']);
		$huoniaoTag->assign('peisong_android_download', $data['peisong_android_download']);
		$huoniaoTag->assign('peisong_yyb_download', $data['peisong_yyb_download']);
		$huoniaoTag->assign('peisong_ios_download', $data['peisong_ios_download']);
		$huoniaoTag->assign('peisong_huawei_download', $data['peisong_huawei_download']);
		$huoniaoTag->assign('peisong_honor_download', $data['peisong_honor_download']);
		$huoniaoTag->assign('peisong_mi_download', $data['peisong_mi_download']);
		$huoniaoTag->assign('peisong_oppo_download', $data['peisong_oppo_download']);
		$huoniaoTag->assign('peisong_vivo_download', $data['peisong_vivo_download']);
		$huoniaoTag->assign('business_logo', $data['business_logo']);
		$huoniaoTag->assign('peisong_logo', $data['peisong_logo']);
		$huoniaoTag->assign('rongKeyID', $data['rongKeyID']);
		$huoniaoTag->assign('rongKeySecret', $data['rongKeySecret']);
        $huoniaoTag->assign('peisong_map_baidu_android', $data['peisong_map_baidu_android']);
        $huoniaoTag->assign('peisong_map_baidu_ios', $data['peisong_map_baidu_ios']);
        $huoniaoTag->assign('peisong_map_google_android', $data['peisong_map_google_android']);
        $huoniaoTag->assign('peisong_map_google_ios', $data['peisong_map_google_ios']);
        $huoniaoTag->assign('peisong_map_amap_android', $data['peisong_map_amap_android']);
        $huoniaoTag->assign('peisong_map_amap_ios', $data['peisong_map_amap_ios']);
		$huoniaoTag->assign('peisong_map_set', empty($data['peisong_map_set']) ? 1 : $data['peisong_map_set']);
        $huoniaoTag->assign('touchTemplate', $data['template']);
		$huoniaoTag->assign('ios_shelf', $data['ios_shelf']);
		$huoniaoTag->assign('disabledModule', $data['disabledModule']);
		$huoniaoTag->assign('business_noticeCount', (int)$data['business_noticeCount']);
		$huoniaoTag->assign('peisong_noticeCount', (int)$data['peisong_noticeCount']);
		$huoniaoTag->assign('disabledModuleArr', explode(',', $data['disabledModule']));
		$huoniaoTag->assign('downloadtips', (int)$data['downloadtips']);
		$huoniaoTag->assign('disagreePrivacy', (int)$data['disagreePrivacy']);
		$huoniaoTag->assign('wx_appid', $data['wx_appid']);
		$huoniaoTag->assign('URLScheme_Android', $data['URLScheme_Android']);
		$huoniaoTag->assign('URLScheme_iOS', $data['URLScheme_iOS']);
		$huoniaoTag->assign('umeng_aliyunAppKey', $data['umeng_aliyunAppKey']);
		$huoniaoTag->assign('umeng_aliyunAppSecret', $data['umeng_aliyunAppSecret']);
		$huoniaoTag->assign('umeng_androidAppKey', $data['umeng_androidAppKey']);
		$huoniaoTag->assign('umeng_iosAppKey', $data['umeng_iosAppKey']);
		$huoniaoTag->assign('umeng_phoneLoginState', (int)$data['umeng_phoneLoginState']);
		$huoniaoTag->assign('copyright', $data['copyright']);
		$huoniaoTag->assign('business_copyright', $data['business_copyright']);
		$huoniaoTag->assign('peisong_copyright', $data['peisong_copyright']);

	}else{
		$huoniaoTag->assign('android_guide', '[]');
		$huoniaoTag->assign('ios_guide', '[]');
	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/app";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
