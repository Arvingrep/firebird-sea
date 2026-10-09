<?php
/**
 * 网站论坛整合
 *
 * @version        $Id: siteBBS.php 2014-12-25 下午16:22:16 $
 * @package        HuoNiao.SiteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteBBS");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteBBS.html";

if($submit == "提交"){
	if(empty($bbs_name)){
		echo '{"state": 200, "info": "请输入论坛名称"}';
		exit();
	}
	if(empty($bbs_url) || !preg_match("/^(http(s?):\/\/)/i", $bbs_url)){
		echo '{"state": 200, "info": "请填论坛地址以http://、https:// 开头！"}';
		exit();
	}

	//启用
	if($state == 1){

		//discuz
		if($bbs_type == "discuz"){
			if(empty($discuz_config)){
				echo '{"state": 200, "info": "请填写UCenter配置信息！"}';
				exit();
			}

			//配置文件
			$configHtml = "";
			$discuz_config = explode("\r\n", $_POST['discuz_config']);
			foreach ($discuz_config as $key => $val){
				$con = str_replace("define('", "", str_replace("');", "", $val));
				$con = explode("', '", $con);
				if(!empty($con[0])){
					$configHtml .= "define('".$con[0]."', '".$con[1]."');\r\n";
				}
			}
			$configFile = HUONIAOROOT."/api/bbs/discuz/config.inc.php";
			if(!file_exists($configFile)){
				createFile($configFile);
			}
			PutFile($configFile, "<"."?php\r\n".$configHtml);

		//phpwind
		}elseif($bbs_type == "phpwind"){
			if(empty($phpwind_config)){
				echo '{"state": 200, "info": "请填写通行证密钥！"}';
				exit();
			}

			//配置文件
			$configHtml = "";
			$phpwind_config = explode("\r\n", $_POST['phpwind_config']);
			foreach ($phpwind_config as $key => $val){
				$con = str_replace("define('", "", str_replace("');", "", $val));
				$con = explode("', '", $con);
				if(!empty($con[0])){
					$configHtml .= "define('".$con[0]."', '".$con[1]."');\r\n";
				}
			}
			$configFile = HUONIAOROOT."/api/bbs/phpwind/config.inc.php";
			if(!file_exists($configFile)){
				createFile($configFile);
			}
			PutFile($configFile, "<"."?php\r\n".$configHtml);
		}

	}

	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_basehost = '"._RunMagicQuotes($cfg_basehost)."';\r\n";
	$configFile .= "\$cfg_webname = '"._RunMagicQuotes($cfg_webname)."';\r\n";
	$configFile .= "\$cfg_weblogo = '"._RunMagicQuotes($cfg_weblogo)."';\r\n";
    $configFile .= "\$cfg_touchlogo = '"._RunMagicQuotes($cfg_touchlogo)."';\r\n";
    $configFile .= "\$cfg_adminlogo = '"._RunMagicQuotes($cfg_adminlogo)."';\r\n";
    $configFile .= "\$cfg_businesslogo = '"._RunMagicQuotes($cfg_businesslogo)."';\r\n";
    $configFile .= "\$cfg_adminWaterMark = '"._RunMagicQuotes($cfg_adminWaterMark)."';\r\n";
    $configFile .= "\$cfg_adminBackgroundColor = '"._RunMagicQuotes($cfg_adminBackgroundColor)."';\r\n";
    $configFile .= "\$cfg_sharePic = '"._RunMagicQuotes($cfg_sharePic)."';\r\n";
    $configFile .= "\$cfg_shareTitle = '"._RunMagicQuotes($cfg_shareTitle)."';\r\n";
    $configFile .= "\$cfg_shareDesc = '"._RunMagicQuotes($cfg_shareDesc)."';\r\n";
	$configFile .= "\$cfg_keywords = '"._RunMagicQuotes($cfg_keywords)."';\r\n";
	$configFile .= "\$cfg_description = '"._RunMagicQuotes($cfg_description)."';\r\n";
	$configFile .= "\$cfg_beian = '"._RunMagicQuotes($cfg_beian)."';\r\n";
	$configFile .= "\$cfg_hotline = '"._RunMagicQuotes($cfg_hotline)."';\r\n";
	$configFile .= "\$cfg_powerby = '"._RunMagicQuotes($cfg_powerby)."';\r\n";
	$configFile .= "\$cfg_statisticscode = '"._RunMagicQuotes($cfg_statisticscode)."';\r\n";
	$configFile .= "\$cfg_visitState = "._RunMagicQuotes($cfg_visitState).";\r\n";
	$configFile .= "\$cfg_visitMessage = '"._RunMagicQuotes($cfg_visitMessage)."';\r\n";
	$configFile .= "\$cfg_pcState = ".(int)_RunMagicQuotes($cfg_pcState).";\r\n";
	$configFile .= "\$cfg_timeZone = "._RunMagicQuotes($cfg_timeZone).";\r\n";
	$configFile .= "\$cfg_mapCity = '"._RunMagicQuotes($cfg_mapCity)."';\r\n";
	$configFile .= "\$cfg_map = "._RunMagicQuotes($cfg_map).";\r\n";
	$configFile .= "\$cfg_map_google = '"._RunMagicQuotes($cfg_map_google)."';\r\n";
	$configFile .= "\$cfg_map_baidu = '"._RunMagicQuotes($cfg_map_baidu)."';\r\n";
	$configFile .= "\$cfg_map_baidu_server = '"._RunMagicQuotes($cfg_map_baidu_server)."';\r\n";
	$configFile .= "\$cfg_map_baidu_wxmini = '"._RunMagicQuotes($cfg_map_baidu_wxmini)."';\r\n";
	$configFile .= "\$cfg_map_qq = '"._RunMagicQuotes($cfg_map_qq)."';\r\n";
	$configFile .= "\$cfg_map_amap = '"._RunMagicQuotes($cfg_map_amap)."';\r\n";
	$configFile .= "\$cfg_map_amap_server = '"._RunMagicQuotes($cfg_map_amap_server)."';\r\n";
	$configFile .= "\$cfg_map_amap_jscode = '"._RunMagicQuotes($cfg_map_amap_jscode)."';\r\n";
    $configFile .= "\$cfg_map_tmap = '"._RunMagicQuotes($cfg_map_tmap)."';\r\n";
    $configFile .= "\$cfg_map_tmap_server = '"._RunMagicQuotes($cfg_map_tmap_server)."';\r\n";
	$configFile .= "\$cfg_onlinetime = "._RunMagicQuotes($cfg_onlinetime).";\r\n";
	$configFile .= "\$cfg_cookiePath = '"._RunMagicQuotes($cfg_cookiePath)."';\r\n";
	$configFile .= "\$cfg_cookieDomain = '"._RunMagicQuotes($cfg_cookieDomain)."';\r\n";
	$configFile .= "\$cfg_cookiePre = '"._RunMagicQuotes($cfg_cookiePre)."';\r\n";
	$configFile .= "\$cfg_cache_lifetime = '"._RunMagicQuotes($cfg_cache_lifetime)."';\r\n";
	$configFile .= "\$cfg_lang = '"._RunMagicQuotes($cfg_lang)."';\r\n";
	$configFile .= "\$cfg_remoteStatic = '"._RunMagicQuotes($cfg_remoteStatic)."';\r\n";
	$configFile .= "\$cfg_spiderIndex = '".(int)_RunMagicQuotes($cfg_spiderIndex)."';\r\n";
	$configFile .= "\$cfg_urlRewrite = '"._RunMagicQuotes($cfg_urlRewrite)."';\r\n";
	$configFile .= "\$cfg_hideUrl = '"._RunMagicQuotes($cfg_hideUrl)."';\r\n";
	$configFile .= "\$cfg_bindMobile = '"._RunMagicQuotes($cfg_bindMobile)."';\r\n";
    $configFile .= "\$cfg_member_card = '".(int)_RunMagicQuotes($cfg_member_card)."';\r\n";
	$configFile .= "\$cfg_httpSecureAccess = '"._RunMagicQuotes($cfg_httpSecureAccess)."';\r\n";
    $configFile .= "\$cfg_slb = '".(int)_RunMagicQuotes($cfg_slb)."';\r\n";
	$configFile .= "\$cfg_siteDebug = '"._RunMagicQuotes($cfg_siteDebug)."';\r\n";
	$configFile .= "\$cfg_memberCityid = '".(int)_RunMagicQuotes($cfg_memberCityid)."';\r\n";
	$configFile .= "\$cfg_sitePageGray = '".(int)_RunMagicQuotes($cfg_sitePageGray)."';\r\n";
	$configFile .= "\$cfg_vipAdvertising = '".(int)_RunMagicQuotes($cfg_vipAdvertising)."';\r\n";
	$configFile .= "\$cfg_kefu_pc_url = '"._RunMagicQuotes($cfg_kefu_pc_url)."';\r\n";
	$configFile .= "\$cfg_kefu_touch_url = '"._RunMagicQuotes($cfg_kefu_touch_url)."';\r\n";
	$configFile .= "\$cfg_kefuMiniProgram = '".(int)_RunMagicQuotes($cfg_kefuMiniProgram)."';\r\n";
	$configFile .= "\$cfg_weixinQr = '"._RunMagicQuotes($cfg_weixinQr)."';\r\n";
	$configFile .= "\$cfg_template = '"._RunMagicQuotes($cfg_template)."';\r\n";
	$configFile .= "\$cfg_touchTemplate = '"._RunMagicQuotes($cfg_touchTemplate)."';\r\n";
    $configFile .= "\$cfg_userCenterTouchTemplateType = '"._RunMagicQuotes($cfg_userCenterTouchTemplateType)."';\r\n";
    $configFile .= "\$cfg_busiCenterTouchTemplateType = '"._RunMagicQuotes($cfg_busiCenterTouchTemplateType)."';\r\n";
    $configFile .= "\$cfg_defaultindex = '"._RunMagicQuotes($cfg_defaultindex)."';\r\n";
	$configFile .= "\$cfg_smsAlidayu = ".(int)$cfg_smsAlidayu.";\r\n";
	// 客服联系方式
	$configFile .= "\$cfg_server_tel = '".$cfg_server_tel."';\r\n";
	$configFile .= "\$cfg_server_qq = '".$cfg_server_qq."';\r\n";
	$configFile .= "\$cfg_server_wx = '".$cfg_server_wx."';\r\n";
	$configFile .= "\$cfg_server_wxQr = '".$cfg_server_wxQr."';\r\n";


	$configFile .= "\$cfg_mail = "._RunMagicQuotes($cfg_mail).";\r\n";
	$configFile .= "\$cfg_mailServer = '"._RunMagicQuotes($cfg_mailServer)."';\r\n";
	$configFile .= "\$cfg_mailPort = '"._RunMagicQuotes($cfg_mailPort)."';\r\n";
	$configFile .= "\$cfg_mailFrom = '"._RunMagicQuotes($cfg_mailFrom)."';\r\n";
	$configFile .= "\$cfg_mailUser = '"._RunMagicQuotes($cfg_mailUser)."';\r\n";
	$configFile .= "\$cfg_mailPass = '"._RunMagicQuotes($cfg_mailPass)."';\r\n";
	$configFile .= "\$cfg_uploadDir = '"._RunMagicQuotes($cfg_uploadDir)."';\r\n";
	$configFile .= "\$cfg_softSize = "._RunMagicQuotes($cfg_softSize).";\r\n";
	$configFile .= "\$cfg_softType = '"._RunMagicQuotes($cfg_softType)."';\r\n";
	$configFile .= "\$cfg_thumbSize = "._RunMagicQuotes($cfg_thumbSize).";\r\n";
	$configFile .= "\$cfg_thumbType = '"._RunMagicQuotes($cfg_thumbType)."';\r\n";
	$configFile .= "\$cfg_atlasSize = "._RunMagicQuotes($cfg_atlasSize).";\r\n";
	$configFile .= "\$cfg_atlasType = '"._RunMagicQuotes($cfg_atlasType)."';\r\n";
	$configFile .= "\$cfg_editorSize = "._RunMagicQuotes($cfg_editorSize).";\r\n";
	$configFile .= "\$cfg_editorType = '"._RunMagicQuotes($cfg_editorType)."';\r\n";
	$configFile .= "\$cfg_photoSize = "._RunMagicQuotes($cfg_photoSize).";\r\n";
	$configFile .= "\$cfg_photoType = '"._RunMagicQuotes($cfg_photoType)."';\r\n";
	$configFile .= "\$cfg_flashSize = "._RunMagicQuotes($cfg_flashSize).";\r\n";
	$configFile .= "\$cfg_audioSize = "._RunMagicQuotes($cfg_audioSize).";\r\n";
	$configFile .= "\$cfg_audioType = '"._RunMagicQuotes($cfg_audioType)."';\r\n";
    $configFile .= "\$cfg_fastUpload = '".(int)$cfg_fastUpload."';\r\n";
    $configFile .= "\$cfg_imageCompress = '".(int)$cfg_imageCompress."';\r\n";
    $configFile .= "\$cfg_videoUploadState = '".(int)$cfg_videoUploadState."';\r\n";
    $configFile .= "\$cfg_videoCompress = '".(int)$cfg_videoCompress."';\r\n";
	$configFile .= "\$cfg_videoSize = "._RunMagicQuotes($cfg_videoSize).";\r\n";
	$configFile .= "\$cfg_videoType = '"._RunMagicQuotes($cfg_videoType)."';\r\n";
	$configFile .= "\$cfg_thumbSmallWidth = "._RunMagicQuotes($cfg_thumbSmallWidth).";\r\n";
	$configFile .= "\$cfg_thumbSmallHeight = "._RunMagicQuotes($cfg_thumbSmallHeight).";\r\n";
	$configFile .= "\$cfg_thumbMiddleWidth = "._RunMagicQuotes($cfg_thumbMiddleWidth).";\r\n";
	$configFile .= "\$cfg_thumbMiddleHeight = "._RunMagicQuotes($cfg_thumbMiddleHeight).";\r\n";
	$configFile .= "\$cfg_thumbLargeWidth = "._RunMagicQuotes($cfg_thumbLargeWidth).";\r\n";
	$configFile .= "\$cfg_thumbLargeHeight = "._RunMagicQuotes($cfg_thumbLargeHeight).";\r\n";
	$configFile .= "\$cfg_atlasSmallWidth = "._RunMagicQuotes($cfg_atlasSmallWidth).";\r\n";
	$configFile .= "\$cfg_atlasSmallHeight = "._RunMagicQuotes($cfg_atlasSmallHeight).";\r\n";
	$configFile .= "\$cfg_photoSmallWidth = "._RunMagicQuotes($cfg_photoSmallWidth).";\r\n";
	$configFile .= "\$cfg_photoSmallHeight = "._RunMagicQuotes($cfg_photoSmallHeight).";\r\n";
	$configFile .= "\$cfg_photoMiddleWidth = "._RunMagicQuotes($cfg_photoMiddleWidth).";\r\n";
	$configFile .= "\$cfg_photoMiddleHeight = "._RunMagicQuotes($cfg_photoMiddleHeight).";\r\n";
	$configFile .= "\$cfg_photoLargeWidth = "._RunMagicQuotes($cfg_photoLargeWidth).";\r\n";
	$configFile .= "\$cfg_photoLargeHeight = "._RunMagicQuotes($cfg_photoLargeHeight).";\r\n";
	$configFile .= "\$cfg_meditorPicWidth = "._RunMagicQuotes($cfg_meditorPicWidth).";\r\n";
	$configFile .= "\$cfg_photoCutType = '"._RunMagicQuotes($cfg_photoCutType)."';\r\n";
	$configFile .= "\$cfg_photoCutPostion = '"._RunMagicQuotes($cfg_photoCutPostion)."';\r\n";
	$configFile .= "\$cfg_quality = "._RunMagicQuotes($cfg_quality).";\r\n";
	$configFile .= "\$cfg_ftpType = "._RunMagicQuotes($cfg_ftpType).";\r\n";
	$configFile .= "\$cfg_ftpState = "._RunMagicQuotes($cfg_ftpState).";\r\n";
	$configFile .= "\$cfg_ftpSSL = "._RunMagicQuotes($cfg_ftpSSL).";\r\n";
	$configFile .= "\$cfg_ftpPasv = "._RunMagicQuotes($cfg_ftpPasv).";\r\n";
	$configFile .= "\$cfg_ftpUrl = '"._RunMagicQuotes($cfg_ftpUrl)."';\r\n";
	$configFile .= "\$cfg_ftpServer = '"._RunMagicQuotes($cfg_ftpServer)."';\r\n";
	$configFile .= "\$cfg_ftpPort = "._RunMagicQuotes($cfg_ftpPort).";\r\n";
	$configFile .= "\$cfg_ftpDir = '"._RunMagicQuotes($cfg_ftpDir)."';\r\n";
	$configFile .= "\$cfg_ftpUser = '"._RunMagicQuotes($cfg_ftpUser)."';\r\n";
	$configFile .= "\$cfg_ftpPwd = '"._RunMagicQuotes($cfg_ftpPwd)."';\r\n";
	$configFile .= "\$cfg_ftpTimeout = "._RunMagicQuotes($cfg_ftpTimeout).";\r\n";
	$configFile .= "\$cfg_OSSUrl = '"._RunMagicQuotes($cfg_OSSUrl)."';\r\n";
	$configFile .= "\$cfg_OSSBucket = '"._RunMagicQuotes($cfg_OSSBucket)."';\r\n";
	$configFile .= "\$cfg_EndPoint = '"._RunMagicQuotes($cfg_EndPoint)."';\r\n";
	$configFile .= "\$cfg_OSSKeyID = '"._RunMagicQuotes($cfg_OSSKeyID)."';\r\n";
	$configFile .= "\$cfg_OSSKeySecret = '"._RunMagicQuotes($cfg_OSSKeySecret)."';\r\n";
    $configFile .= "\$cfg_QINIUAccessKey = '"._RunMagicQuotes($cfg_QINIUAccessKey)."';\r\n";
    $configFile .= "\$cfg_QINIUSecretKey = '"._RunMagicQuotes($cfg_QINIUSecretKey)."';\r\n";
    $configFile .= "\$cfg_QINIUbucket = '"._RunMagicQuotes($cfg_QINIUbucket)."';\r\n";
    $configFile .= "\$cfg_QINIUdomain = '"._RunMagicQuotes($cfg_QINIUdomain)."';\r\n";
	$configFile .= "\$cfg_OBSUrl = '"._RunMagicQuotes($cfg_OBSUrl)."';\r\n";
	$configFile .= "\$cfg_OBSBucket = '"._RunMagicQuotes($cfg_OBSBucket)."';\r\n";
	$configFile .= "\$cfg_OBSEndpoint = '"._RunMagicQuotes($cfg_OBSEndpoint)."';\r\n";
	$configFile .= "\$cfg_OBSKeyID = '"._RunMagicQuotes($cfg_OBSKeyID)."';\r\n";
	$configFile .= "\$cfg_OBSKeySecret = '"._RunMagicQuotes($cfg_OBSKeySecret)."';\r\n";
	$configFile .= "\$cfg_COSUrl = '"._RunMagicQuotes($cfg_COSUrl)."';\r\n";
	$configFile .= "\$cfg_COSBucket = '"._RunMagicQuotes($cfg_COSBucket)."';\r\n";
	$configFile .= "\$cfg_COSRegion = '"._RunMagicQuotes($cfg_COSRegion)."';\r\n";
	$configFile .= "\$cfg_COSSecretid = '"._RunMagicQuotes($cfg_COSSecretid)."';\r\n";
	$configFile .= "\$cfg_COSSecretkey = '"._RunMagicQuotes($cfg_COSSecretkey)."';\r\n";
    $configFile .= "\$cfg_remoteFtpUnify = '"._RunMagicQuotes($cfg_remoteFtpUnify)."';\r\n";
    $configFile .= "\$cfg_ffmpeg = '"._RunMagicQuotes($cfg_ffmpeg)."';\r\n";

	$configFile .= "\$thumbMarkState = "._RunMagicQuotes($thumbMarkState).";\r\n";
	$configFile .= "\$atlasMarkState = "._RunMagicQuotes($atlasMarkState).";\r\n";
	$configFile .= "\$editorMarkState = "._RunMagicQuotes($editorMarkState).";\r\n";
	$configFile .= "\$waterMarkWidth = "._RunMagicQuotes($waterMarkWidth).";\r\n";
	$configFile .= "\$waterMarkHeight = "._RunMagicQuotes($waterMarkHeight).";\r\n";
	$configFile .= "\$waterMarkPostion = "._RunMagicQuotes($waterMarkPostion).";\r\n";
	$configFile .= "\$waterMarkType = "._RunMagicQuotes($waterMarkType).";\r\n";
	$configFile .= "\$waterMarkText = '"._RunMagicQuotes($waterMarkText)."';\r\n";
	$configFile .= "\$markFontfamily = '"._RunMagicQuotes($markFontfamily)."';\r\n";
	$configFile .= "\$markFontsize = "._RunMagicQuotes($markFontsize).";\r\n";
	$configFile .= "\$markFontColor = '"._RunMagicQuotes($markFontColor)."';\r\n";
	$configFile .= "\$markFile = '"._RunMagicQuotes($markFile)."';\r\n";
	$configFile .= "\$markPadding = "._RunMagicQuotes($markPadding).";\r\n";
	$configFile .= "\$markTransparent = "._RunMagicQuotes($markTransparent).";\r\n";
	$configFile .= "\$markQuality = "._RunMagicQuotes($markQuality).";\r\n";
	$configFile .= "\$cfg_regtype = '"._RunMagicQuotes($cfg_regtype)."';\r\n";
	$configFile .= "\$cfg_regfields = '"._RunMagicQuotes($cfg_regfields)."';\r\n";
    $configFile .= "\$cfg_waterZizhiText = '"._RunMagicQuotes($cfg_waterZizhiText)."';\r\n";
    $configFile .= "\$cfg_zizhiTextFontsize = ".(int)_RunMagicQuotes($cfg_zizhiTextFontsize).";\r\n";
    $configFile .= "\$cfg_zizhiTextTransparent = ".(int)_RunMagicQuotes($cfg_zizhiTextTransparent).";\r\n";
    $configFile .= "\$cfg_zizhiTextColor = '"._RunMagicQuotes($cfg_zizhiTextColor)."';\r\n";

	//计量单位
	$currency_name   = !empty($currency_name) ? $currency_name : "人民币";
	$currency_short  = !empty($currency_short) ? $currency_short : "元";
	$currency_symbol = !empty($currency_symbol) ? $currency_symbol : "¥";
	$currency_code   = !empty($currency_code) ? $currency_code : "RMB";
	$currency_rate   = !empty($currency_rate) ? $currency_rate : "1";
	$currency_areaname   = !empty($currency_areaname) ? $currency_areaname : "平方米";
    $currency_areasymbol = !empty($currency_areasymbol) ? $currency_areasymbol : "㎡";

	$configFile .= "\$currency_name = '"._RunMagicQuotes($currency_name)."';\r\n";
	$configFile .= "\$currency_short = '"._RunMagicQuotes($currency_short)."';\r\n";
	$configFile .= "\$currency_symbol = '"._RunMagicQuotes($currency_symbol)."';\r\n";
	$configFile .= "\$currency_code = '"._RunMagicQuotes($currency_code)."';\r\n";
	$configFile .= "\$currency_rate = '"._RunMagicQuotes($currency_rate)."';\r\n";
	$configFile .= "\$currency_areaname = '"._RunMagicQuotes($currency_areaname)."';\r\n";
    $configFile .= "\$currency_areasymbol = '"._RunMagicQuotes($currency_areasymbol)."';\r\n";

	//广告标识
	$configFile .= "\$cfg_advMarkState = ".(int)_RunMagicQuotes($cfg_advMarkState).";\r\n";
	$configFile .= "\$cfg_advMarkPostion = ".(int)_RunMagicQuotes($cfg_advMarkPostion).";\r\n";

	//会员中心链接管理
	$configFile .= "\$cfg_ucenterLinks = '"._RunMagicQuotes($cfg_ucenterLinks)."';\r\n";

	//自然语言处理
	$configFile .= "\$cfg_nlp_AppID = '"._RunMagicQuotes($cfg_nlp_AppID)."';\r\n";
	$configFile .= "\$cfg_nlp_APIKey = '"._RunMagicQuotes($cfg_nlp_APIKey)."';\r\n";
	$configFile .= "\$cfg_nlp_Secret = '"._RunMagicQuotes($cfg_nlp_Secret)."';\r\n";

    //聚合数据接口
    $configFile .= "\$cfg_juhe = '".$cfg_juhe."';\r\n";
    $configFile .= "\$cfg_cardState = '".$cfg_cardState."';\r\n";

	//即时通讯接口
	$configFile .= "\$cfg_km_accesskey_id = '"._RunMagicQuotes($cfg_km_accesskey_id)."';\r\n";
	$configFile .= "\$cfg_km_accesskey_secret = '"._RunMagicQuotes($cfg_km_accesskey_secret)."';\r\n";

	//公交地铁
	$configFile .= "\$cfg_subway_state = ".(int)_RunMagicQuotes($cfg_subway_state).";\r\n";
	$configFile .= "\$cfg_subway_title = '"._RunMagicQuotes($cfg_subway_title)."';\r\n";

    //重复区域
    $configFile .= "\$cfg_auto_location = ".(int)_RunMagicQuotes($cfg_auto_location).";\r\n";
    $configFile .= "\$cfg_sameAddr_state = ".(int)_RunMagicQuotes($cfg_sameAddr_state).";\r\n";
    $configFile .= "\$cfg_sameAddr_group = ".(int)_RunMagicQuotes($cfg_sameAddr_group).";\r\n";
    $configFile .= "\$cfg_sameAddr_nearby = ".(int)_RunMagicQuotes($cfg_sameAddr_nearby).";\r\n";

    //区域名称
    $configFile .= "\$cfg_areaName_0 = '"._RunMagicQuotes($cfg_areaName_0)."';\r\n";
    $configFile .= "\$cfg_areaName_1 = '"._RunMagicQuotes($cfg_areaName_1)."';\r\n";
    $configFile .= "\$cfg_areaName_2 = '"._RunMagicQuotes($cfg_areaName_2)."';\r\n";
    $configFile .= "\$cfg_areaName_3 = '"._RunMagicQuotes($cfg_areaName_3)."';\r\n";

    //计划任务
    $configFile .= "\$cfg_cronType = ".(int)_RunMagicQuotes($cfg_cronType).";\r\n";

    //附件使用次数
    $configFile .= "\$cfg_record_attachment_count = ".(int)_RunMagicQuotes($cfg_record_attachment_count).";\r\n";

	$configFile .= "\$cfg_holdsubdomain = '"._RunMagicQuotes($cfg_holdsubdomain)."';\r\n";
	$configFile .= "\$cfg_iplimit = '"._RunMagicQuotes($cfg_iplimit)."';\r\n";
	$configFile .= "\$cfg_errLoginCount = ".(int)_RunMagicQuotes($cfg_errLoginCount).";\r\n";
	$configFile .= "\$cfg_loginLock = ".(int)_RunMagicQuotes($cfg_loginLock).";\r\n";
	$configFile .= "\$cfg_smsLoginState = ".(int)$cfg_smsLoginState.";\r\n";
	$configFile .= "\$cfg_smsAutoRegister = ".(int)$cfg_smsAutoRegister.";\r\n";
	$configFile .= "\$cfg_agreeProtocol = ".(int)$cfg_agreeProtocol.";\r\n";
	$configFile .= "\$cfg_pwdLevel = ".(int)$cfg_pwdLevel.";\r\n";
	$configFile .= "\$cfg_memberVerified = ".(int)$cfg_memberVerified.";\r\n";
	$configFile .= "\$cfg_memberVerifiedInfo = '"._RunMagicQuotes($cfg_memberVerifiedInfo)."';\r\n";
	$configFile .= "\$cfg_memberBindPhone = ".(int)$cfg_memberBindPhone.";\r\n";
	$configFile .= "\$cfg_memberBindPhoneInfo = '"._RunMagicQuotes($cfg_memberBindPhoneInfo)."';\r\n";
	$configFile .= "\$cfg_memberFollowWechat = ".(int)$cfg_memberFollowWechat.";\r\n";
	$configFile .= "\$cfg_memberFollowWechatInfo = '"._RunMagicQuotes($cfg_memberFollowWechatInfo)."';\r\n";
	$configFile .= "\$cfg_regstatus = ".(int)_RunMagicQuotes($cfg_regstatus).";\r\n";
	$configFile .= "\$cfg_regverify = "._RunMagicQuotes($cfg_regverify).";\r\n";
	$configFile .= "\$cfg_regtime = "._RunMagicQuotes($cfg_regtime).";\r\n";
	$configFile .= "\$cfg_payReturnType = ".(int)_RunMagicQuotes($cfg_payReturnType).";\r\n";
	$configFile .= "\$cfg_payReturnUrlPc = '"._RunMagicQuotes($cfg_payReturnUrlPc)."';\r\n";
	$configFile .= "\$cfg_payReturnUrlTouch = '"._RunMagicQuotes($cfg_payReturnUrlTouch)."';\r\n";
	$configFile .= "\$cfg_holduser = '"._RunMagicQuotes($cfg_holduser)."';\r\n";
    $configFile .= "\$cfg_max_subtable_count = ".(int)_RunMagicQuotes($cfg_max_subtable_count).";\r\n";
	$configFile .= "\$cfg_regclosemessage = '"._RunMagicQuotes($cfg_regclosemessage)."';\r\n";
	$configFile .= "\$cfg_periodicCheckPhone = ".(int)$cfg_periodicCheckPhone.";\r\n";
	$configFile .= "\$cfg_periodicCheckPhoneCycle = ".(int)$cfg_periodicCheckPhoneCycle.";\r\n";
	$configFile .= "\$cfg_replacestr = '"._RunMagicQuotes($cfg_replacestr)."';\r\n";
    $configFile .= "\$cfg_nicknameEditState = '".(int)$cfg_nicknameEditState."';\r\n";
    $configFile .= "\$cfg_nicknameEditInfo = '".$cfg_nicknameEditInfo."';\r\n";
    $configFile .= "\$cfg_nicknameEditAudit = '".(int)$cfg_nicknameEditAudit."';\r\n";
    $configFile .= "\$cfg_avatarEditState = '".(int)$cfg_avatarEditState."';\r\n";
    $configFile .= "\$cfg_avatarEditInfo = '".$cfg_avatarEditInfo."';\r\n";
    $configFile .= "\$cfg_avatarEditAudit = '".(int)$cfg_avatarEditAudit."';\r\n";
	$configFile .= "\$cfg_disableCommentState = '".(int)$cfg_disableCommentState."';\r\n";
	$configFile .= "\$cfg_disableCommentInfo = '".$cfg_disableCommentInfo."';\r\n";
	$configFile .= "\$cfg_disableLikeState = '".(int)$cfg_disableLikeState."';\r\n";
	$configFile .= "\$cfg_disableLikeInfo = '".$cfg_disableLikeInfo."';\r\n";
	$configFile .= "\$cfg_commentPlaceholder = '".$cfg_commentPlaceholder."';\r\n";
	$configFile .= "\$cfg_maliciousSplider = '"._RunMagicQuotes($cfg_maliciousSplider)."';\r\n";
    $configFile .= "\$cfg_secure_domain = '"._RunMagicQuotes($cfg_secure_domain)."';\r\n";
	$configFile .= "\$cfg_seccodestatus = '"._RunMagicQuotes($cfg_seccodestatus)."';\r\n";
	$configFile .= "\$cfg_seccodetype = "._RunMagicQuotes($cfg_seccodetype).";\r\n";
	$configFile .= "\$cfg_seccodewidth = "._RunMagicQuotes($cfg_seccodewidth).";\r\n";
	$configFile .= "\$cfg_seccodeheight = "._RunMagicQuotes($cfg_seccodeheight).";\r\n";
	$configFile .= "\$cfg_seccodefamily = '"._RunMagicQuotes($cfg_seccodefamily)."';\r\n";
	$configFile .= "\$cfg_scecodeangle = "._RunMagicQuotes($cfg_scecodeangle).";\r\n";
	$configFile .= "\$cfg_scecodewarping = "._RunMagicQuotes($cfg_scecodewarping).";\r\n";
	$configFile .= "\$cfg_scecodeshadow = "._RunMagicQuotes($cfg_scecodeshadow).";\r\n";
	$configFile .= "\$cfg_scecodeanimator = "._RunMagicQuotes($cfg_scecodeanimator).";\r\n";
	$configFile .= "\$cfg_secqaastatus = '"._RunMagicQuotes($cfg_secqaastatus)."';\r\n";
	$configFile .= "\$cfg_filedelstatus = '".(int)_RunMagicQuotes($cfg_filedelstatus)."';\r\n";
    $configFile .= "\$cfg_memberstatus = '".(int)_RunMagicQuotes($cfg_memberstatus)."';\r\n";
    $configFile .= "\$cfg_cancellation_state = '".(int)_RunMagicQuotes($cfg_cancellation_state)."';\r\n";
    $configFile .= "\$cfg_iphome = '".(int)_RunMagicQuotes($cfg_iphome)."';\r\n";


    //论坛配置参数
	$configFile .= "\$cfg_bbsName = '".$bbs_name."';\r\n";
	$configFile .= "\$cfg_bbsUrl = '".$bbs_url."';\r\n";
	$configFile .= "\$cfg_bbsState = ".(int)$state.";\r\n";
	$configFile .= "\$cfg_bbsType = '".$bbs_type."';\r\n";

	//极验验证码
	$configFile .= "\$cfg_geetest = ".(int)$cfg_geetest.";\r\n";
	$configFile .= "\$cfg_geetest_id = '"._RunMagicQuotes($cfg_geetest_id)."';\r\n";
	$configFile .= "\$cfg_geetest_key = '"._RunMagicQuotes($cfg_geetest_key)."';\r\n";
	$configFile .= "\$cfg_geetest_AccessKeyID = '"._RunMagicQuotes($cfg_geetest_AccessKeyID)."';\r\n";
	$configFile .= "\$cfg_geetest_AccessKeySecret = '"._RunMagicQuotes($cfg_geetest_AccessKeySecret)."';\r\n";
	$configFile .= "\$cfg_geetest_prefix = '"._RunMagicQuotes($cfg_geetest_prefix)."';\r\n";
	$configFile .= "\$cfg_geetest_web = '"._RunMagicQuotes($cfg_geetest_web)."';\r\n";
	$configFile .= "\$cfg_geetest_h5 = '"._RunMagicQuotes($cfg_geetest_h5)."';\r\n";
	$configFile .= "\$cfg_geetest_app = '"._RunMagicQuotes($cfg_geetest_app)."';\r\n";

	//内容审核
    $configFile .= "\$cfg_moderationWB = ".(int)$cfg_moderationWB.";\r\n";
    $configFile .= "\$cfg_moderationTP = ".(int)$cfg_moderationTP.";\r\n";
    $configFile .= "\$cfg_moderationYP = ".(int)$cfg_moderationYP.";\r\n";
    $configFile .= "\$cfg_moderationSP = ".(int)$cfg_moderationSP.";\r\n";
    $configFile .= "\$cfg_moderation_projectId = '"._RunMagicQuotes($cfg_moderation_projectId)."';\r\n";
	$configFile .= "\$cfg_moderation_region = '"._RunMagicQuotes($cfg_moderation_region)."';\r\n";
	$configFile .= "\$cfg_moderation_key = '"._RunMagicQuotes($cfg_moderation_key)."';\r\n";
	$configFile .= "\$cfg_moderation_secret = '"._RunMagicQuotes($cfg_moderation_secret)."';\r\n";
	$configFile .= "\$cfg_moderation_platform = '"._RunMagicQuotes($cfg_moderation_platform)."';\r\n";
	$configFile .= "\$cfg_moderation_aliyun_region = '"._RunMagicQuotes($cfg_moderation_aliyun_region)."';\r\n";
	$configFile .= "\$cfg_moderation_aliyun_key = '"._RunMagicQuotes($cfg_moderation_aliyun_key)."';\r\n";
	$configFile .= "\$cfg_moderation_aliyun_secret = '"._RunMagicQuotes($cfg_moderation_aliyun_secret)."';\r\n";

    //RSA密钥
	$configFile .= "\$cfg_encryptPrivkey = '".$cfg_encryptPrivkey."';\r\n";
	$configFile .= "\$cfg_encryptPubkey = '".$cfg_encryptPubkey."';\r\n";

    //AES密钥
	$configFile .= "\$cfg_aes_key_last = '".$cfg_aes_key_last."';\r\n";
	$configFile .= "\$cfg_aes_key = '".$cfg_aes_key."';\r\n";

    //保障金配置
    $configFile .= "\$cfg_promotion_note = '"._RunMagicQuotes($cfg_promotion_note)."';\r\n";
    $configFile .= "\$cfg_promotion_least = ".(float)$cfg_promotion_least.";\r\n";
    $configFile .= "\$cfg_promotion_limitVal = ".(int)$cfg_promotion_limitVal.";\r\n";
    $configFile .= "\$cfg_promotion_limitType = ".(int)$cfg_promotion_limitType.";\r\n";
    $configFile .= "\$cfg_promotion_reason = '"._RunMagicQuotes($cfg_promotion_reason)."';\r\n";

    //日志保存天数
    $configFile .= "\$max_siteLog_save_day = ".(int)$max_siteLog_save_day.";\r\n";
    $configFile .= "\$max_memberBehaviorLog_save_day = ".(int)$max_memberBehaviorLog_save_day.";\r\n";

	$configFile .= "?".">";

	$configIncFile = HUONIAOINC.'/config/siteConfig.inc.php';
	$fp = fopen($configIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $configIncFile 失败，请检查权限！").'}');
	fwrite($fp, $configFile);
	fclose($fp);

	adminLog("修改论坛整合配置");
	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('bbs_name', $cfg_bbsName);
	$huoniaoTag->assign('bbs_url', $cfg_bbsUrl);

	//状态-单选
	$huoniaoTag->assign('stateList', array('1', '2'));
	$huoniaoTag->assign('stateName',array('启用','禁用'));
	$huoniaoTag->assign('state', $cfg_bbsState);

	//平台
	$huoniaoTag->assign('bbs_typeList', array('discuz', 'phpwind'));
	$huoniaoTag->assign('bbs_typeName',array('Discuz','PHPwind'));
	$huoniaoTag->assign('bbs_type', $cfg_bbsType);

	//discuz配置参数
	$configFile = HUONIAOROOT."/api/bbs/discuz/config.inc.php";
	if(file_exists($configFile)){
		$fp = @fopen($configFile,'r');
		$config = @fread($fp,filesize($configFile));
		@fclose($fp);
		$huoniaoTag->assign('discuz_config', str_replace("<?php", "", str_replace("?>", "", $config)));
	}

	//phpwind配置参数
	$configFile = HUONIAOROOT."/api/bbs/phpwind/config.inc.php";
	if(file_exists($configFile)){
		$fp = @fopen($configFile,'r');
		$config = @fread($fp,filesize($configFile));
		@fclose($fp);
		$huoniaoTag->assign('phpwind_config', str_replace("<?php", "", str_replace("?>", "", $config)));
	}


	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteBBS.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
