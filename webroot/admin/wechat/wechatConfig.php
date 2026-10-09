<?php
/**
 * 微信基本设置
 *
 * @version        $Id: wechatConfig.php 2017-2-23 上午12:05:11 $
 * @package        HuoNiao.Wechat
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("wechatConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/wechat";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "wechatConfig.html";

if($_POST){
	if($token == "") die('token传递失败！');

    if($action == 'touchTemplate'){
        $cfg_miniProgramTemplate = $template;
    }
    else{
        //站点信息
        $cfg_wechatType      = (int)$wechatType;
        $cfg_wechatToken     = $wechatToken ? $wechatToken : substr(md5(time()), 8, 16);
        $cfg_wechatAppid     = $wechatAppid;
        $cfg_wechatAppsecret = $wechatAppsecret;
        $cfg_wechatName      = $wechatName;
        $cfg_wechatCode      = $wechatCode;
        $cfg_wechatQr        = $wechatQr;
        $cfg_wechatAutoLogin = (int)$wechatAutoLogin;
        $cfg_wechatBindPhone = (int)$wechatBindPhone;
        $cfg_wechatRedirect  = (int)$wechatRedirect;
        $cfg_wechatPoster    = (int)$wechatPoster;
        $cfg_wechatTips      = (int)$wechatTips;
        //小程序
        $cfg_miniProgramName = $miniProgramName;
        $cfg_miniProgramAppid = $miniProgramAppid;
        $cfg_miniProgramAppsecret = $miniProgramAppsecret;
        $cfg_miniProgramId = $miniProgramId;
        $cfg_useWxMiniProgramLogin = (int)$useWxMiniProgramLogin;
        $cfg_miniProgramLocationAuth = $miniProgramLocationAuth;
        $cfg_miniProgramLoginProfile = (int)$miniProgramLoginProfile;
        $cfg_miniProgramBindPhone = (int)$miniProgramBindPhone;
        $cfg_iosVirtualPaymentState = (int)$iosVirtualPaymentState;
        $cfg_iosVirtualPaymentTip = $iosVirtualPaymentTip;
        $cfg_miniProgramQr   = $miniProgramQr;
        $cfg_miniProgramTemplate   = $touchTemplate;
    }

	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_wechatType = '".$cfg_wechatType."';\r\n";
	$configFile .= "\$cfg_wechatToken = '".$cfg_wechatToken."';\r\n";
	$configFile .= "\$cfg_wechatAppid = '".$cfg_wechatAppid."';\r\n";
	$configFile .= "\$cfg_wechatAppsecret = '".$cfg_wechatAppsecret."';\r\n";
	$configFile .= "\$cfg_wechatName = '"._RunMagicQuotes($cfg_wechatName)."';\r\n";
	$configFile .= "\$cfg_wechatCode = '"._RunMagicQuotes($cfg_wechatCode)."';\r\n";
	$configFile .= "\$cfg_wechatQr = '"._RunMagicQuotes($cfg_wechatQr)."';\r\n";
	$configFile .= "\$cfg_wechatSubscribeType = '".(int)$cfg_wechatSubscribeType."';\r\n";
	$configFile .= "\$cfg_wechatSubscribe = '".$cfg_wechatSubscribe."';\r\n";
	$configFile .= "\$cfg_wechatSubscribeMedia = '".$cfg_wechatSubscribeMedia."';\r\n";
	$configFile .= "\$cfg_wechatAutoLogin = '".$cfg_wechatAutoLogin."';\r\n";
	$configFile .= "\$cfg_wechatBindPhone = '".$cfg_wechatBindPhone."';\r\n";
	$configFile .= "\$cfg_wechatRedirect = '".$cfg_wechatRedirect."';\r\n";
	$configFile .= "\$cfg_wechatPoster = '".$cfg_wechatPoster."';\r\n";
	$configFile .= "\$cfg_wechatTips = '".$cfg_wechatTips."';\r\n";
	$configFile .= "\$cfg_miniProgramName = '".$cfg_miniProgramName."';\r\n";
	$configFile .= "\$cfg_miniProgramAppid = '".$cfg_miniProgramAppid."';\r\n";
	$configFile .= "\$cfg_miniProgramAppsecret = '".$cfg_miniProgramAppsecret."';\r\n";
	$configFile .= "\$cfg_miniProgramId = '".$cfg_miniProgramId."';\r\n";
	$configFile .= "\$cfg_useWxMiniProgramLogin = ".$cfg_useWxMiniProgramLogin.";\r\n";
	$configFile .= "\$cfg_miniProgramLocationAuth = '".$cfg_miniProgramLocationAuth."';\r\n";
	$configFile .= "\$cfg_miniProgramLoginProfile = ".$cfg_miniProgramLoginProfile.";\r\n";
	$configFile .= "\$cfg_miniProgramBindPhone = ".$cfg_miniProgramBindPhone.";\r\n";
	$configFile .= "\$cfg_iosVirtualPaymentState = ".$cfg_iosVirtualPaymentState.";\r\n";
	$configFile .= "\$cfg_iosVirtualPaymentTip = '".$cfg_iosVirtualPaymentTip."';\r\n";
	$configFile .= "\$cfg_miniProgramQr = '".$cfg_miniProgramQr."';\r\n";
	$configFile .= "\$cfg_miniProgramTemplate = '".$cfg_miniProgramTemplate."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchState = ".(int)$cfg_autoReplyWithSiteSearchState.";\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchModule = '".$cfg_autoReplyWithSiteSearchModule."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchTitle = '".$cfg_autoReplyWithSiteSearchTitle."';\r\n";
	$configFile .= "\$cfg_autoReplyWithSiteSearchDescption = '".$cfg_autoReplyWithSiteSearchDescption."';\r\n";
	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/wechatConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	$cfg_bindMobile = $cfg_wechatBindPhone ? 1 : $cfg_bindMobile;

    // 高德地图密钥不需要配置了，所以这里的系统基本参数也不需要再更新
	// //站点信息文件内容
	// $configFile = "<"."?php\r\n";
	// $configFile .= "\$cfg_basehost = '"._RunMagicQuotes($cfg_basehost)."';\r\n";
	// $configFile .= "\$cfg_webname = '"._RunMagicQuotes($cfg_webname)."';\r\n";
	// $configFile .= "\$cfg_shortname = '"._RunMagicQuotes($cfg_shortname)."';\r\n";
	// $configFile .= "\$cfg_weblogo = '"._RunMagicQuotes($cfg_weblogo)."';\r\n";
    // $configFile .= "\$cfg_sharePic = '"._RunMagicQuotes($cfg_sharePic)."';\r\n";
    // $configFile .= "\$cfg_shareTitle = '"._RunMagicQuotes($cfg_shareTitle)."';\r\n";
    // $configFile .= "\$cfg_shareDesc = '"._RunMagicQuotes($cfg_shareDesc)."';\r\n";
	// $configFile .= "\$cfg_keywords = '"._RunMagicQuotes($cfg_keywords)."';\r\n";
	// $configFile .= "\$cfg_description = '"._RunMagicQuotes($cfg_description)."';\r\n";
	// $configFile .= "\$cfg_beian = '"._RunMagicQuotes($cfg_beian)."';\r\n";
	// $configFile .= "\$cfg_hotline = '"._RunMagicQuotes($cfg_hotline)."';\r\n";
	// $configFile .= "\$cfg_powerby = '"._RunMagicQuotes($cfg_powerby)."';\r\n";
	// $configFile .= "\$cfg_statisticscode = '"._RunMagicQuotes($cfg_statisticscode)."';\r\n";
	// $configFile .= "\$cfg_visitState = "._RunMagicQuotes($cfg_visitState).";\r\n";
	// $configFile .= "\$cfg_visitMessage = '"._RunMagicQuotes($cfg_visitMessage)."';\r\n";
	// $configFile .= "\$cfg_pcState = ".(int)_RunMagicQuotes($cfg_pcState).";\r\n";
	// $configFile .= "\$cfg_timeZone = "._RunMagicQuotes($cfg_timeZone).";\r\n";
	// $configFile .= "\$cfg_mapCity = '"._RunMagicQuotes($cfg_mapCity)."';\r\n";
	// $configFile .= "\$cfg_map = "._RunMagicQuotes($cfg_map).";\r\n";
	// $configFile .= "\$cfg_map_google = '"._RunMagicQuotes($cfg_map_google)."';\r\n";
	// $configFile .= "\$cfg_map_baidu = '"._RunMagicQuotes($cfg_map_baidu)."';\r\n";
	// $configFile .= "\$cfg_map_baidu_server = '"._RunMagicQuotes($cfg_map_baidu_server)."';\r\n";
	// $configFile .= "\$cfg_map_baidu_wxmini = '"._RunMagicQuotes($cfg_map_baidu_wxmini)."';\r\n";
	// $configFile .= "\$cfg_map_qq = '"._RunMagicQuotes($cfg_map_qq)."';\r\n";
	// $configFile .= "\$cfg_map_amap = '"._RunMagicQuotes($mapkey_amap)."';\r\n";
	// $configFile .= "\$cfg_map_amap_server = '"._RunMagicQuotes($mapkey_amap_server)."';\r\n";
	// $configFile .= "\$cfg_map_amap_jscode = '"._RunMagicQuotes($mapkey_amap_jscode)."';\r\n";
    // $configFile .= "\$cfg_map_tmap = '"._RunMagicQuotes($cfg_map_tmap)."';\r\n";
    // $configFile .= "\$cfg_map_tmap_server = '"._RunMagicQuotes($cfg_map_tmap_server)."';\r\n";
	// $configFile .= "\$cfg_weatherCity = '"._RunMagicQuotes($cfg_weatherCity)."';\r\n";
	// $configFile .= "\$cfg_onlinetime = "._RunMagicQuotes($cfg_onlinetime).";\r\n";
	// $configFile .= "\$cfg_cookiePath = '"._RunMagicQuotes($cfg_cookiePath)."';\r\n";
	// $configFile .= "\$cfg_cookieDomain = '"._RunMagicQuotes($cfg_cookieDomain)."';\r\n";
	// $configFile .= "\$cfg_cookiePre = '"._RunMagicQuotes($cfg_cookiePre)."';\r\n";
	// $configFile .= "\$cfg_cache_lifetime = '"._RunMagicQuotes($cfg_cache_lifetime)."';\r\n";
	// $configFile .= "\$cfg_lang = '"._RunMagicQuotes($cfg_lang)."';\r\n";
	// $configFile .= "\$cfg_remoteStatic = '"._RunMagicQuotes($cfg_remoteStatic)."';\r\n";
	// $configFile .= "\$cfg_spiderIndex = '".(int)_RunMagicQuotes($cfg_spiderIndex)."';\r\n";
	// $configFile .= "\$cfg_urlRewrite = '"._RunMagicQuotes($cfg_urlRewrite)."';\r\n";
	// $configFile .= "\$cfg_hideUrl = '"._RunMagicQuotes($cfg_hideUrl)."';\r\n";
	// $configFile .= "\$cfg_bindMobile = '"._RunMagicQuotes($cfg_bindMobile)."';\r\n";
    // $configFile .= "\$cfg_member_card = '".(int)_RunMagicQuotes($cfg_member_card)."';\r\n";
	// $configFile .= "\$cfg_httpSecureAccess = '"._RunMagicQuotes($cfg_httpSecureAccess)."';\r\n";
	// $configFile .= "\$cfg_siteDebug = '"._RunMagicQuotes($cfg_siteDebug)."';\r\n";
	// $configFile .= "\$cfg_memberCityid = '".(int)_RunMagicQuotes($cfg_memberCityid)."';\r\n";
	// $configFile .= "\$cfg_sitePageGray = '".(int)_RunMagicQuotes($cfg_sitePageGray)."';\r\n";
	// $configFile .= "\$cfg_vipAdvertising = '".(int)_RunMagicQuotes($cfg_vipAdvertising)."';\r\n";
	// $configFile .= "\$cfg_kefu_pc_url = '"._RunMagicQuotes($cfg_kefu_pc_url)."';\r\n";
	// $configFile .= "\$cfg_kefu_touch_url = '"._RunMagicQuotes($cfg_kefu_touch_url)."';\r\n";
	// $configFile .= "\$cfg_kefuMiniProgram = '".(int)_RunMagicQuotes($cfg_kefuMiniProgram)."';\r\n";
	// $configFile .= "\$cfg_weixinQr = '"._RunMagicQuotes($cfg_weixinQr)."';\r\n";
	// $configFile .= "\$cfg_template = '"._RunMagicQuotes($cfg_template)."';\r\n";
	// $configFile .= "\$cfg_touchTemplate = '"._RunMagicQuotes($cfg_touchTemplate)."';\r\n";
	// $configFile .= "\$cfg_defaultindex = '"._RunMagicQuotes($cfg_defaultindex)."';\r\n";
	// $configFile .= "\$cfg_smsAlidayu = ".(int)$cfg_smsAlidayu.";\r\n";
	// // 客服联系方式
	// $configFile .= "\$cfg_server_tel = '".$cfg_server_tel."';\r\n";
	// $configFile .= "\$cfg_server_qq = '".$cfg_server_qq."';\r\n";
	// $configFile .= "\$cfg_server_wx = '".$cfg_server_wx."';\r\n";
	// $configFile .= "\$cfg_server_wxQr = '".$cfg_server_wxQr."';\r\n";

	// //邮件配置
	// $configFile .= "\$cfg_mail = "._RunMagicQuotes($cfg_mail).";\r\n";
	// $configFile .= "\$cfg_mailServer = '"._RunMagicQuotes($cfg_mailServer)."';\r\n";
	// $configFile .= "\$cfg_mailPort = '"._RunMagicQuotes($cfg_mailPort)."';\r\n";
	// $configFile .= "\$cfg_mailFrom = '"._RunMagicQuotes($cfg_mailFrom)."';\r\n";
	// $configFile .= "\$cfg_mailUser = '"._RunMagicQuotes($cfg_mailUser)."';\r\n";
	// $configFile .= "\$cfg_mailPass = '"._RunMagicQuotes($cfg_mailPass)."';\r\n";

	// //上传配置
	// $configFile .= "\$cfg_uploadDir = '"._RunMagicQuotes($cfg_uploadDir)."';\r\n";
	// $configFile .= "\$cfg_softSize = "._RunMagicQuotes($cfg_softSize).";\r\n";
	// $configFile .= "\$cfg_softType = '"._RunMagicQuotes($cfg_softType)."';\r\n";
	// $configFile .= "\$cfg_thumbSize = "._RunMagicQuotes($cfg_thumbSize).";\r\n";
	// $configFile .= "\$cfg_thumbType = '"._RunMagicQuotes($cfg_thumbType)."';\r\n";
	// $configFile .= "\$cfg_atlasSize = "._RunMagicQuotes($cfg_atlasSize).";\r\n";
	// $configFile .= "\$cfg_atlasType = '"._RunMagicQuotes($cfg_atlasType)."';\r\n";
	// $configFile .= "\$cfg_editorSize = "._RunMagicQuotes($cfg_editorSize).";\r\n";
	// $configFile .= "\$cfg_editorType = '"._RunMagicQuotes($cfg_editorType)."';\r\n";
	// $configFile .= "\$cfg_photoSize = "._RunMagicQuotes($cfg_photoSize).";\r\n";
	// $configFile .= "\$cfg_photoType = '"._RunMagicQuotes($cfg_photoType)."';\r\n";
	// $configFile .= "\$cfg_flashSize = "._RunMagicQuotes($cfg_flashSize).";\r\n";
	// $configFile .= "\$cfg_audioSize = "._RunMagicQuotes($cfg_audioSize).";\r\n";
	// $configFile .= "\$cfg_audioType = '"._RunMagicQuotes($cfg_audioType)."';\r\n";
	// $configFile .= "\$cfg_videoSize = "._RunMagicQuotes($cfg_videoSize).";\r\n";
	// $configFile .= "\$cfg_videoType = '"._RunMagicQuotes($cfg_videoType)."';\r\n";
	// $configFile .= "\$cfg_thumbSmallWidth = "._RunMagicQuotes($cfg_thumbSmallWidth).";\r\n";
	// $configFile .= "\$cfg_thumbSmallHeight = "._RunMagicQuotes($cfg_thumbSmallHeight).";\r\n";
	// $configFile .= "\$cfg_thumbMiddleWidth = "._RunMagicQuotes($cfg_thumbMiddleWidth).";\r\n";
	// $configFile .= "\$cfg_thumbMiddleHeight = "._RunMagicQuotes($cfg_thumbMiddleHeight).";\r\n";
	// $configFile .= "\$cfg_thumbLargeWidth = "._RunMagicQuotes($cfg_thumbLargeWidth).";\r\n";
	// $configFile .= "\$cfg_thumbLargeHeight = "._RunMagicQuotes($cfg_thumbLargeHeight).";\r\n";
	// $configFile .= "\$cfg_atlasSmallWidth = "._RunMagicQuotes($cfg_atlasSmallWidth).";\r\n";
	// $configFile .= "\$cfg_atlasSmallHeight = "._RunMagicQuotes($cfg_atlasSmallHeight).";\r\n";
	// $configFile .= "\$cfg_photoSmallWidth = "._RunMagicQuotes($cfg_photoSmallWidth).";\r\n";
	// $configFile .= "\$cfg_photoSmallHeight = "._RunMagicQuotes($cfg_photoSmallHeight).";\r\n";
	// $configFile .= "\$cfg_photoMiddleWidth = "._RunMagicQuotes($cfg_photoMiddleWidth).";\r\n";
	// $configFile .= "\$cfg_photoMiddleHeight = "._RunMagicQuotes($cfg_photoMiddleHeight).";\r\n";
	// $configFile .= "\$cfg_photoLargeWidth = "._RunMagicQuotes($cfg_photoLargeWidth).";\r\n";
	// $configFile .= "\$cfg_photoLargeHeight = "._RunMagicQuotes($cfg_photoLargeHeight).";\r\n";
	// $configFile .= "\$cfg_meditorPicWidth = "._RunMagicQuotes($cfg_meditorPicWidth).";\r\n";
	// $configFile .= "\$cfg_photoCutType = '"._RunMagicQuotes($cfg_photoCutType)."';\r\n";
	// $configFile .= "\$cfg_photoCutPostion = '"._RunMagicQuotes($cfg_photoCutPostion)."';\r\n";
	// $configFile .= "\$cfg_quality = "._RunMagicQuotes($cfg_quality).";\r\n";

	// //远程附件
	// $configFile .= "\$cfg_ftpType = "._RunMagicQuotes($cfg_ftpType).";\r\n";
	// $configFile .= "\$cfg_ftpState = "._RunMagicQuotes($cfg_ftpState).";\r\n";
	// $configFile .= "\$cfg_ftpSSL = "._RunMagicQuotes($cfg_ftpSSL).";\r\n";
	// $configFile .= "\$cfg_ftpPasv = "._RunMagicQuotes($cfg_ftpPasv).";\r\n";
	// $configFile .= "\$cfg_ftpUrl = '"._RunMagicQuotes($cfg_ftpUrl)."';\r\n";
	// $configFile .= "\$cfg_ftpServer = '"._RunMagicQuotes($cfg_ftpServer)."';\r\n";
	// $configFile .= "\$cfg_ftpPort = "._RunMagicQuotes($cfg_ftpPort).";\r\n";
	// $configFile .= "\$cfg_ftpDir = '"._RunMagicQuotes($cfg_ftpDir)."';\r\n";
	// $configFile .= "\$cfg_ftpUser = '"._RunMagicQuotes($cfg_ftpUser)."';\r\n";
	// $configFile .= "\$cfg_ftpPwd = '"._RunMagicQuotes($cfg_ftpPwd)."';\r\n";
	// $configFile .= "\$cfg_ftpTimeout = "._RunMagicQuotes($cfg_ftpTimeout).";\r\n";
	// $configFile .= "\$cfg_OSSUrl = '"._RunMagicQuotes($cfg_OSSUrl)."';\r\n";
	// $configFile .= "\$cfg_OSSBucket = '"._RunMagicQuotes($cfg_OSSBucket)."';\r\n";
	// $configFile .= "\$cfg_EndPoint = '"._RunMagicQuotes($cfg_EndPoint)."';\r\n";
	// $configFile .= "\$cfg_OSSKeyID = '"._RunMagicQuotes($cfg_OSSKeyID)."';\r\n";
	// $configFile .= "\$cfg_OSSKeySecret = '"._RunMagicQuotes($cfg_OSSKeySecret)."';\r\n";
    // $configFile .= "\$cfg_QINIUAccessKey = '"._RunMagicQuotes($cfg_QINIUAccessKey)."';\r\n";
    // $configFile .= "\$cfg_QINIUSecretKey = '"._RunMagicQuotes($cfg_QINIUSecretKey)."';\r\n";
    // $configFile .= "\$cfg_QINIUbucket = '"._RunMagicQuotes($cfg_QINIUbucket)."';\r\n";
    // $configFile .= "\$cfg_QINIUdomain = '"._RunMagicQuotes($cfg_QINIUdomain)."';\r\n";
	// $configFile .= "\$cfg_OBSUrl = '"._RunMagicQuotes($cfg_OBSUrl)."';\r\n";
	// $configFile .= "\$cfg_OBSBucket = '"._RunMagicQuotes($cfg_OBSBucket)."';\r\n";
	// $configFile .= "\$cfg_OBSEndpoint = '"._RunMagicQuotes($cfg_OBSEndpoint)."';\r\n";
	// $configFile .= "\$cfg_OBSKeyID = '"._RunMagicQuotes($cfg_OBSKeyID)."';\r\n";
	// $configFile .= "\$cfg_OBSKeySecret = '"._RunMagicQuotes($cfg_OBSKeySecret)."';\r\n";
	// $configFile .= "\$cfg_COSUrl = '"._RunMagicQuotes($cfg_COSUrl)."';\r\n";
	// $configFile .= "\$cfg_COSBucket = '"._RunMagicQuotes($cfg_COSBucket)."';\r\n";
	// $configFile .= "\$cfg_COSRegion = '"._RunMagicQuotes($cfg_COSRegion)."';\r\n";
	// $configFile .= "\$cfg_COSSecretid = '"._RunMagicQuotes($cfg_COSSecretid)."';\r\n";
	// $configFile .= "\$cfg_COSSecretkey = '"._RunMagicQuotes($cfg_COSSecretkey)."';\r\n";
    // $configFile .= "\$cfg_remoteFtpUnify = '"._RunMagicQuotes($cfg_remoteFtpUnify)."';\r\n";
    // $configFile .= "\$cfg_ffmpeg = '"._RunMagicQuotes($cfg_ffmpeg)."';\r\n";

	// //水印设置
	// $configFile .= "\$thumbMarkState = "._RunMagicQuotes($thumbMarkState).";\r\n";
	// $configFile .= "\$atlasMarkState = "._RunMagicQuotes($atlasMarkState).";\r\n";
	// $configFile .= "\$editorMarkState = "._RunMagicQuotes($editorMarkState).";\r\n";
	// $configFile .= "\$waterMarkWidth = "._RunMagicQuotes($waterMarkWidth).";\r\n";
	// $configFile .= "\$waterMarkHeight = "._RunMagicQuotes($waterMarkHeight).";\r\n";
	// $configFile .= "\$waterMarkPostion = "._RunMagicQuotes($waterMarkPostion).";\r\n";
	// $configFile .= "\$waterMarkType = "._RunMagicQuotes($waterMarkType).";\r\n";
	// $configFile .= "\$waterMarkText = '"._RunMagicQuotes($waterMarkText)."';\r\n";
	// $configFile .= "\$markFontfamily = '"._RunMagicQuotes($markFontfamily)."';\r\n";
	// $configFile .= "\$markFontsize = "._RunMagicQuotes($markFontsize).";\r\n";
	// $configFile .= "\$markFontColor = '"._RunMagicQuotes($markFontColor)."';\r\n";
	// $configFile .= "\$markFile = '"._RunMagicQuotes($markFile)."';\r\n";
	// $configFile .= "\$markPadding = "._RunMagicQuotes($markPadding).";\r\n";
	// $configFile .= "\$markTransparent = "._RunMagicQuotes($markTransparent).";\r\n";
	// $configFile .= "\$markQuality = "._RunMagicQuotes($markQuality).";\r\n";

	// //计量单位
	// $currency_name   = !empty($currency_name) ? $currency_name : "人民币";
	// $currency_short  = !empty($currency_short) ? $currency_short : "元";
	// $currency_symbol = !empty($currency_symbol) ? $currency_symbol : "¥";
	// $currency_code   = !empty($currency_code) ? $currency_code : "RMB";
	// $currency_rate   = !empty($currency_rate) ? $currency_rate : "1";
	// $currency_areaname   = !empty($currency_areaname) ? $currency_areaname : "平方米";
    // $currency_areasymbol = !empty($currency_areasymbol) ? $currency_areasymbol : "㎡";

	// $configFile .= "\$currency_name = '"._RunMagicQuotes($currency_name)."';\r\n";
	// $configFile .= "\$currency_short = '"._RunMagicQuotes($currency_short)."';\r\n";
	// $configFile .= "\$currency_symbol = '"._RunMagicQuotes($currency_symbol)."';\r\n";
	// $configFile .= "\$currency_code = '"._RunMagicQuotes($currency_code)."';\r\n";
	// $configFile .= "\$currency_rate = '"._RunMagicQuotes($currency_rate)."';\r\n";
	// $configFile .= "\$currency_areaname = '"._RunMagicQuotes($currency_areaname)."';\r\n";
    // $configFile .= "\$currency_areasymbol = '"._RunMagicQuotes($currency_areasymbol)."';\r\n";

	// //广告标识
	// $configFile .= "\$cfg_advMarkState = ".(int)_RunMagicQuotes($cfg_advMarkState).";\r\n";
	// $configFile .= "\$cfg_advMarkPostion = ".(int)_RunMagicQuotes($cfg_advMarkPostion).";\r\n";

	// //会员中心链接管理
	// $configFile .= "\$cfg_ucenterLinks = '"._RunMagicQuotes($cfg_ucenterLinks)."';\r\n";

	// //自然语言处理
	// $configFile .= "\$cfg_nlp_AppID = '"._RunMagicQuotes($cfg_nlp_AppID)."';\r\n";
	// $configFile .= "\$cfg_nlp_APIKey = '"._RunMagicQuotes($cfg_nlp_APIKey)."';\r\n";
	// $configFile .= "\$cfg_nlp_Secret = '"._RunMagicQuotes($cfg_nlp_Secret)."';\r\n";

    // //聚合数据接口
    // $configFile .= "\$cfg_juhe = '".$cfg_juhe."';\r\n";
    // $configFile .= "\$cfg_cardState = '".$cfg_cardState."';\r\n";

	// //即时通讯接口
	// $configFile .= "\$cfg_km_accesskey_id = '"._RunMagicQuotes($cfg_km_accesskey_id)."';\r\n";
	// $configFile .= "\$cfg_km_accesskey_secret = '"._RunMagicQuotes($cfg_km_accesskey_secret)."';\r\n";

	// //公交地铁
	// $configFile .= "\$cfg_subway_state = ".(int)_RunMagicQuotes($cfg_subway_state).";\r\n";
	// $configFile .= "\$cfg_subway_title = '"._RunMagicQuotes($cfg_subway_title)."';\r\n";

    // //重复区域
    // $configFile .= "\$cfg_sameAddr_state = ".(int)_RunMagicQuotes($cfg_sameAddr_state).";\r\n";
    // $configFile .= "\$cfg_sameAddr_group = ".(int)_RunMagicQuotes($cfg_sameAddr_group).";\r\n";
    // $configFile .= "\$cfg_sameAddr_nearby = ".(int)_RunMagicQuotes($cfg_sameAddr_nearby).";\r\n";

    // //区域名称
    // $configFile .= "\$cfg_areaName_0 = '"._RunMagicQuotes($cfg_areaName_0)."';\r\n";
    // $configFile .= "\$cfg_areaName_1 = '"._RunMagicQuotes($cfg_areaName_1)."';\r\n";
    // $configFile .= "\$cfg_areaName_2 = '"._RunMagicQuotes($cfg_areaName_2)."';\r\n";
    // $configFile .= "\$cfg_areaName_3 = '"._RunMagicQuotes($cfg_areaName_3)."';\r\n";
    
    // //计划任务
    // $configFile .= "\$cfg_cronType = ".(int)_RunMagicQuotes($cfg_cronType).";\r\n";

    // //附件使用次数
    // $configFile .= "\$cfg_record_attachment_count = ".(int)_RunMagicQuotes($cfg_record_attachment_count).";\r\n";

	// //基本安全配置
	// $configFile .= "\$cfg_holdsubdomain = '"._RunMagicQuotes($cfg_holdsubdomain)."';\r\n";
	// $configFile .= "\$cfg_iplimit = '"._RunMagicQuotes($cfg_iplimit)."';\r\n";
	// $configFile .= "\$cfg_errLoginCount = ".(int)_RunMagicQuotes($cfg_errLoginCount).";\r\n";
	// $configFile .= "\$cfg_loginLock = ".(int)_RunMagicQuotes($cfg_loginLock).";\r\n";
	// $configFile .= "\$cfg_smsLoginState = ".(int)$cfg_smsLoginState.";\r\n";
	// $configFile .= "\$cfg_agreeProtocol = ".(int)$cfg_agreeProtocol.";\r\n";
	// $configFile .= "\$cfg_memberVerified = ".(int)$cfg_memberVerified.";\r\n";
	// $configFile .= "\$cfg_memberVerifiedInfo = '"._RunMagicQuotes($cfg_memberVerifiedInfo)."';\r\n";
	// $configFile .= "\$cfg_memberBindPhone = ".(int)$cfg_memberBindPhone.";\r\n";
	// $configFile .= "\$cfg_memberBindPhoneInfo = '"._RunMagicQuotes($cfg_memberBindPhoneInfo)."';\r\n";
	// $configFile .= "\$cfg_memberFollowWechat = ".(int)$cfg_memberFollowWechat.";\r\n";
	// $configFile .= "\$cfg_memberFollowWechatInfo = '"._RunMagicQuotes($cfg_memberFollowWechatInfo)."';\r\n";
	// $configFile .= "\$cfg_regstatus = ".(int)_RunMagicQuotes($cfg_regstatus).";\r\n";
	// $configFile .= "\$cfg_regverify = "._RunMagicQuotes($cfg_regverify).";\r\n";
	// $configFile .= "\$cfg_regtime = "._RunMagicQuotes($cfg_regtime).";\r\n";
	// $configFile .= "\$cfg_payReturnType = ".(int)_RunMagicQuotes($cfg_payReturnType).";\r\n";
	// $configFile .= "\$cfg_payReturnUrlPc = '"._RunMagicQuotes($cfg_payReturnUrlPc)."';\r\n";
	// $configFile .= "\$cfg_payReturnUrlTouch = '"._RunMagicQuotes($cfg_payReturnUrlTouch)."';\r\n";
	// $configFile .= "\$cfg_holduser = '"._RunMagicQuotes($cfg_holduser)."';\r\n";
	// $configFile .= "\$cfg_regclosemessage = '"._RunMagicQuotes($cfg_regclosemessage)."';\r\n";
	// $configFile .= "\$cfg_periodicCheckPhone = ".(int)$cfg_periodicCheckPhone.";\r\n";
	// $configFile .= "\$cfg_periodicCheckPhoneCycle = ".(int)$cfg_periodicCheckPhoneCycle.";\r\n";
	// $configFile .= "\$cfg_replacestr = '"._RunMagicQuotes($cfg_replacestr)."';\r\n";
	// $configFile .= "\$cfg_maliciousSplider = '"._RunMagicQuotes($cfg_maliciousSplider)."';\r\n";
	// $configFile .= "\$cfg_regtype = '"._RunMagicQuotes($cfg_regtype)."';\r\n";
	// $configFile .= "\$cfg_regfields = '"._RunMagicQuotes($cfg_regfields)."';\r\n";
	// $configFile .= "\$cfg_nicknameEditState = '".(int)$cfg_nicknameEditState."';\r\n";
	// $configFile .= "\$cfg_nicknameEditAudit = '".(int)$cfg_nicknameEditAudit."';\r\n";
	// $configFile .= "\$cfg_avatarEditState = '".(int)$cfg_avatarEditState."';\r\n";
	// $configFile .= "\$cfg_avatarEditAudit = '".(int)$cfg_avatarEditAudit."';\r\n";

	// //验证码
	// $configFile .= "\$cfg_seccodestatus = '"._RunMagicQuotes($cfg_seccodestatus)."';\r\n";
	// $configFile .= "\$cfg_seccodetype = "._RunMagicQuotes($cfg_seccodetype).";\r\n";
	// $configFile .= "\$cfg_seccodewidth = "._RunMagicQuotes($cfg_seccodewidth).";\r\n";
	// $configFile .= "\$cfg_seccodeheight = "._RunMagicQuotes($cfg_seccodeheight).";\r\n";
	// $configFile .= "\$cfg_seccodefamily = '"._RunMagicQuotes($cfg_seccodefamily)."';\r\n";
	// $configFile .= "\$cfg_scecodeangle = "._RunMagicQuotes($cfg_scecodeangle).";\r\n";
	// $configFile .= "\$cfg_scecodewarping = "._RunMagicQuotes($cfg_scecodewarping).";\r\n";
	// $configFile .= "\$cfg_scecodeshadow = "._RunMagicQuotes($cfg_scecodeshadow).";\r\n";
	// $configFile .= "\$cfg_scecodeanimator = "._RunMagicQuotes($cfg_scecodeanimator).";\r\n";

	// //安全问题
	// $configFile .= "\$cfg_secqaastatus = '"._RunMagicQuotes($cfg_secqaastatus)."';\r\n";
	// $configFile .= "\$cfg_filedelstatus = '".(int)_RunMagicQuotes($cfg_filedelstatus)."';\r\n";
    // $configFile .= "\$cfg_memberstatus = '".(int)_RunMagicQuotes($cfg_memberstatus)."';\r\n";
    // $configFile .= "\$cfg_cancellation_state = '".(int)_RunMagicQuotes($cfg_cancellation_state)."';\r\n";

	// //论坛配置参数
	// $configFile .= "\$cfg_bbsName = '"._RunMagicQuotes($cfg_bbsName)."';\r\n";
	// $configFile .= "\$cfg_bbsUrl = '"._RunMagicQuotes($cfg_bbsUrl)."';\r\n";
	// $configFile .= "\$cfg_bbsState = ".(int)$cfg_bbsState.";\r\n";
	// $configFile .= "\$cfg_bbsType = '"._RunMagicQuotes($cfg_bbsType)."';\r\n";

	// //极验验证码
	// $configFile .= "\$cfg_geetest = ".(int)$cfg_geetest.";\r\n";
	// $configFile .= "\$cfg_geetest_id = '"._RunMagicQuotes($cfg_geetest_id)."';\r\n";
	// $configFile .= "\$cfg_geetest_key = '"._RunMagicQuotes($cfg_geetest_key)."';\r\n";

	// //内容审核
	// $configFile .= "\$cfg_moderation = ".(int)$cfg_moderation.";\r\n";
	// $configFile .= "\$cfg_moderation_region = '"._RunMagicQuotes($cfg_moderation_region)."';\r\n";
	// $configFile .= "\$cfg_moderation_key = '"._RunMagicQuotes($cfg_moderation_key)."';\r\n";
	// $configFile .= "\$cfg_moderation_secret = '"._RunMagicQuotes($cfg_moderation_secret)."';\r\n";

    // //RSA密钥
	// $configFile .= "\$cfg_encryptPrivkey = '".$cfg_encryptPrivkey."';\r\n";
	// $configFile .= "\$cfg_encryptPubkey = '".$cfg_encryptPubkey."';\r\n";


	// $configFile .= "?".">";

	// $configIncFile = HUONIAOINC.'/config/siteConfig.inc.php';
	// $fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	// fwrite($fp, $configFile);
	// fclose($fp);

	updateAppConfig();  //更新APP配置文件
	adminLog("修改微信基本设置");
	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//配置参数
require_once(HUONIAOINC.'/config/wechatConfig.inc.php');

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/wechat/wechatConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$wechatToken = substr(md5(time()), 8, 16);
	$huoniaoTag->assign('wechatToken', $cfg_wechatToken ? $cfg_wechatToken : $wechatToken);
	$huoniaoTag->assign('wechatAppid', $cfg_wechatAppid);
	$huoniaoTag->assign('wechatAppsecret', $cfg_wechatAppsecret);
	$huoniaoTag->assign('wechatName', $cfg_wechatName);
	$huoniaoTag->assign('wechatCode', $cfg_wechatCode);
	$huoniaoTag->assign('wechatQr', $cfg_wechatQr);

	$huoniaoTag->assign('map_amap', $cfg_map_amap);
	$huoniaoTag->assign('map_amap_server', $cfg_map_amap_server);
	$huoniaoTag->assign('map_amap_jscode', $cfg_map_amap_jscode);

	//小程序
	$huoniaoTag->assign('miniProgramName', $cfg_miniProgramName);
	$huoniaoTag->assign('miniProgramAppid', $cfg_miniProgramAppid);
	$huoniaoTag->assign('miniProgramAppsecret', $cfg_miniProgramAppsecret);
	$huoniaoTag->assign('miniProgramId', $cfg_miniProgramId);
	$huoniaoTag->assign('miniProgramQr', $cfg_miniProgramQr);

	//登录确认
	$huoniaoTag->assign('typeState', array('1', '0'));
	$huoniaoTag->assign('typeStateNames',array('需要确认','无需确认直接登录'));
	$huoniaoTag->assign('typeStateChecked', (int)$cfg_wechatType);

	//微信自动登录
	$huoniaoTag->assign('loginState', array('1', '0'));
	$huoniaoTag->assign('loginStateNames',array('开启','关闭'));
	$huoniaoTag->assign('loginStateChecked', (int)$cfg_wechatAutoLogin);

	//微信登录必须绑定手机
	$huoniaoTag->assign('bindState', array('1', '0'));
	$huoniaoTag->assign('bindStateNames',array('开启','关闭'));
	$huoniaoTag->assign('bindStateChecked', (int)$cfg_wechatBindPhone);

	//图文消息跳转方式
	$huoniaoTag->assign('redirectState', array('1', '0'));
	$huoniaoTag->assign('redirectStateNames',array('原文链接(直接跳走)','默认(进入信息详细页)'));
	$huoniaoTag->assign('redirectStateChecked', (int)$cfg_wechatRedirect);

	//海报二维码
	$huoniaoTag->assign('posterState', array('1', '2', '0'));
	$huoniaoTag->assign('posterStateNames',array('关注(扫码关注公众号后自动发送链接)','小程序码','默认(扫码直接打开链接)'));
	$huoniaoTag->assign('posterStateChecked', (int)$cfg_wechatPoster);

	//关注公众号提示
	$huoniaoTag->assign('wechatTips', array('1', '0'));
	$huoniaoTag->assign('wechatTipsNames',array('开启','关闭'));
	$huoniaoTag->assign('wechatTipsChecked', (int)$cfg_wechatTips);

	//使用微信原生登录
	$huoniaoTag->assign('useWxMiniProgramLoginState', array('0', '1'));
	$huoniaoTag->assign('useWxMiniProgramLoginStateNames',array('关闭','开启'));
	$huoniaoTag->assign('useWxMiniProgramLoginStateChecked', (int)$cfg_useWxMiniProgramLogin);

	//定位接口权限
	$huoniaoTag->assign('miniProgramLocationAuthState', array('chooseLocation', 'getLocation'));
	$huoniaoTag->assign('miniProgramLocationAuthStateNames',array('打开地图选择位置[chooseLocation]','无感自动获取[getLocation]'));
	$huoniaoTag->assign('miniProgramLocationAuthStateChecked', $cfg_miniProgramLocationAuth ? $cfg_miniProgramLocationAuth : 'chooseLocation');  //默认为chooseLocation

	//登录后引导进入个人资料页
	$huoniaoTag->assign('miniProgramLoginProfileState', array('0', '1'));
	$huoniaoTag->assign('miniProgramLoginProfileStateNames',array('关闭','开启'));
	$huoniaoTag->assign('miniProgramLoginProfileStateChecked', (int)$cfg_miniProgramLoginProfile);

	//小程序登录时获取手机号码
	$huoniaoTag->assign('miniProgramBindPhoneState', array('0', '1'));
	$huoniaoTag->assign('miniProgramBindPhoneStateNames',array('开启','关闭'));
	$huoniaoTag->assign('miniProgramBindPhoneStateChecked', (int)$cfg_miniProgramBindPhone);

	//iOS端虚拟支付功能
	$huoniaoTag->assign('iosVirtualPaymentState', array('0', '1'));
	$huoniaoTag->assign('iosVirtualPaymentStateNames',array('启用','禁用'));
	$huoniaoTag->assign('iosVirtualPaymentStateChecked', (int)$cfg_iosVirtualPaymentState);

	$huoniaoTag->assign('iosVirtualPaymentTip', $cfg_iosVirtualPaymentTip);


    //模板风格
    $dir = "../../static/images/admin/platform"; //当前目录
    $floders = listDir($dir);
    $skins = array();
    $floders = listDir($dir . '/wxminiprogram');
	$skins = array(
		array('tplname' => 'diy', 'directory' => 'diy', 'copyright' => '火鸟门户')
    );
    if (!empty($floders)) {
        $i = 1;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/wxminiprogram/' . $floder . '/config.xml';
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
	$huoniaoTag->assign('touchTemplate', $cfg_miniProgramTemplate);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/wechat";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
