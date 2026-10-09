<?php
/**
 * 网站安全设置
 *
 * @version        $Id: siteSafe.php 2013-11-20 下午21:09:15 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteSafe");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteSafe.html";
$dir       = "../../templates/siteConfig"; //当前目录

if($action != ""){

    if($action == 'createAesKey'){
        die('{"state": 100, "info": ' . json_encode(create_check_code(15)) .'}');
    }

	if($token == "") die('token传递失败！');

	if($action == "basic"){
		//基本配置
		$cfg_holdsubdomain     = $holdsubdomain;
		$cfg_iplimit           = $iplimit;
		$cfg_errLoginCount     = (int)$errLoginCount;
		$cfg_loginLock         = (int)$loginLock;
		$cfg_smsLoginState     = (int)$smsLoginState;
		$cfg_smsAutoRegister     = (int)$smsAutoRegister;
		$cfg_agreeProtocol     = (int)$agreeProtocol;
        $cfg_pwdLevel          = (int)$pwdLevel;
		$cfg_memberVerified    = (int)$memberVerified;
		$cfg_memberVerifiedInfo = $memberVerifiedInfo;
		$cfg_memberBindPhone    = (int)$memberBindPhone;
		$cfg_memberBindPhoneInfo = $memberBindPhoneInfo;
		$cfg_memberFollowWechat  = (int)$memberFollowWechat;
		$cfg_memberFollowWechatInfo = $memberFollowWechatInfo;
		$cfg_regstatus         = (int)$regstatus;
		$cfg_payReturnType     = (int)$payReturnType;
		$cfg_payReturnUrlPc    = $payReturnUrlPc;
		$cfg_payReturnUrlTouch = $payReturnUrlTouch;
		$cfg_regverify         = $regverify;
		$cfg_regtime           = $regtime;
		$cfg_holduser          = $holduser;
        $cfg_max_subtable_count   = (int)$max_subtable_count;
		$cfg_regclosemessage   = trim($regclosemessage);
        $cfg_periodicCheckPhone = (int)$periodicCheckPhone;
        $cfg_periodicCheckPhoneCycle = (int)$periodicCheckPhoneCycle;
		$cfg_replacestr        = trim($replacestr);
		$cfg_maliciousSplider  = trim($maliciousSplider);
		$cfg_regtype           = isset($regtype) ? join(',',$regtype) : '';
		$cfg_regfields         = isset($regfields) ? join(',',$regfields) : '';
        $cfg_secure_domain     = trim($secureDomain);

        $cfg_filedelstatus     = (int)$filedelstatus;
        $cfg_nicknameEditState = (int)$nicknameEditState;
        $cfg_nicknameEditInfo  = $nicknameEditInfo;
        $cfg_nicknameEditAudit = (int)$nicknameEditAudit;
        $cfg_avatarEditState   = (int)$avatarEditState;
        $cfg_avatarEditInfo    = $avatarEditInfo;
        $cfg_avatarEditAudit   = (int)$avatarEditAudit;
        $cfg_memberstatus     = (int)$cfgmemberstatus;  //会员付费发布是否需要审核
        $cfg_cancellation_state = (int)$cfgcancellation;         //注销账户开关
        $cfg_iphome            = (int)$iphome;
        $cfg_disableCommentState = (int)$disableCommentState;
        $cfg_disableCommentInfo  = $disableCommentInfo;
        $cfg_disableLikeState = (int)$disableLikeState;
        $cfg_disableLikeInfo  = $disableLikeInfo;
        $cfg_commentPlaceholder  = $commentPlaceholder;

        //新版三种方式不可以同时显示
		if($cfg_regtype == '1,2,3'){
			$cfg_regtype = '2,3';
		}

		$cfg_memberVerifiedInfo = $cfg_memberVerifiedInfo ? $cfg_memberVerifiedInfo : '请先进行实名认证！';

		adminLog("修改网站安全设置", "基本设置");

	}elseif($action == "verify"){
		//验证码
		$cfg_seccodestatus     = isset($seccodestatus) ? join(',',$seccodestatus) : '';
		$cfg_seccodetype       = $seccodetype;
		$cfg_seccodewidth      = $seccodewidth;
		$cfg_seccodeheight     = $seccodeheight;
		$cfg_seccodefamily     = $seccodefamily;
		$cfg_scecodeangle      = $scecodeangle;
		$cfg_scecodewarping    = $scecodewarping;
		$cfg_scecodeshadow     = $scecodeshadow;
		$cfg_scecodeanimator   = $scecodeanimator;

		adminLog("修改网站安全设置", "验证码设置");

	}elseif($action == "question"){
		//安全问题
		$cfg_secqaastatus      = isset($secqaastatus) ? join(',',$secqaastatus) : '';
		$question              = isset($question) ? join(',',$question) : '';
		$answer                = isset($answer) ? join(',',$answer) : '';

		$archives = $dsql->SetQuery("DELETE FROM `#@__safeqa`");
		$dsql->dsqlOper($archives, "results");

		$questionList = explode(",", $question);
		$answerList = explode(",", $answer);

		for($i = 0; $i < count($questionList); $i++){
			if($questionList[$i] != "" && $answerList[$i] != ""){
				$archives = $dsql->SetQuery("INSERT INTO `#@__safeqa` (`question`, `answer`) VALUES ('".$questionList[$i]."', '".$answerList[$i]."')");
				$dsql->dsqlOper($archives, "results");
			}
		}

		adminLog("修改网站安全设置", "验证问题设置");

	//极验验证码
	}elseif($action == "geetest"){
		$cfg_geetest         = (int)$geetest;
		$cfg_geetest_id      = trim($geetest_id);
		$cfg_geetest_key     = trim($geetest_key);

		$cfg_geetest_AccessKeyID = trim($geetest_AccessKeyID);
		$cfg_geetest_AccessKeySecret = trim($geetest_AccessKeySecret);
		$cfg_geetest_prefix = trim($geetest_prefix);
		$cfg_geetest_web = trim($geetest_web);
		$cfg_geetest_h5 = trim($geetest_h5);
		$cfg_geetest_app = trim($geetest_app);
		$cfg_geetest_wxmini = trim($geetest_wxmini);

		adminLog("修改网站安全设置", "配置滑块验证码");

	//内容审核
	}elseif($action == "moderation"){
		$cfg_moderationWB        = (int)$moderationWB;
		$cfg_moderationTP        = (int)$moderationTP;
		$cfg_moderationYP        = (int)$moderationYP;
		$cfg_moderationSP        = (int)$moderationSP;
        $cfg_moderation_platform = $moderationPlatform;
		$cfg_moderation_region = $moderation_region;
		$cfg_moderation_key    = $moderation_key;
		$cfg_moderation_secret = $moderation_secret;
		$cfg_moderation_projectId = $moderation_projectId;
		$cfg_moderation_aliyun_region = $moderation_aliyun_region;
		$cfg_moderation_aliyun_key = $moderation_aliyun_key;
		$cfg_moderation_aliyun_secret = $moderation_aliyun_secret;

		adminLog("修改网站安全设置", "内容审核");

    //RSA密钥
    }elseif($action == "rsa"){
        $cfg_encryptPrivkey = trim($encryptPrivkey);  //RSA私钥
        $cfg_encryptPubkey  = trim($encryptPubkey);   //RSA公钥

		adminLog("修改网站安全设置", "RSA密钥");

    //AES密钥
    }elseif($action == "aes"){
        $aes_key = trim($aes_key);

        $cfg_aes_key_last = $cfg_aes_key && $cfg_aes_key != $aes_key ? $cfg_aes_key : '';  //最后一次保存的AES密钥
        $cfg_aes_key = $aes_key;  //AES密钥

        adminLog("修改网站安全设置", "AES密钥");

	}

	//站点信息文件内容
	$configFile = "<"."?php\r\n";
	$configFile .= "\$cfg_basehost = '"._RunMagicQuotes($cfg_basehost)."';\r\n";
	$configFile .= "\$cfg_webname = '"._RunMagicQuotes($cfg_webname)."';\r\n";
	$configFile .= "\$cfg_shortname = '"._RunMagicQuotes($cfg_shortname)."';\r\n";
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
	$configFile .= "\$cfg_weatherCity = '"._RunMagicQuotes($cfg_weatherCity)."';\r\n";
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

	//邮件配置
	$configFile .= "\$cfg_mail = "._RunMagicQuotes($cfg_mail).";\r\n";
	$configFile .= "\$cfg_mailServer = '"._RunMagicQuotes($cfg_mailServer)."';\r\n";
	$configFile .= "\$cfg_mailPort = '"._RunMagicQuotes($cfg_mailPort)."';\r\n";
	$configFile .= "\$cfg_mailFrom = '"._RunMagicQuotes($cfg_mailFrom)."';\r\n";
	$configFile .= "\$cfg_mailUser = '"._RunMagicQuotes($cfg_mailUser)."';\r\n";
	$configFile .= "\$cfg_mailPass = '"._RunMagicQuotes($cfg_mailPass)."';\r\n";

	//上传配置
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

	//远程附件
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

	//水印设置
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

	//基本安全配置
	$configFile .= "\$cfg_holdsubdomain = '".$cfg_holdsubdomain."';\r\n";
	$configFile .= "\$cfg_iplimit = '".$cfg_iplimit."';\r\n";
	$configFile .= "\$cfg_errLoginCount = ".(int)$cfg_errLoginCount.";\r\n";
	$configFile .= "\$cfg_loginLock = ".(int)$cfg_loginLock.";\r\n";
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
	$configFile .= "\$cfg_regstatus = ".(int)$cfg_regstatus.";\r\n";
	$configFile .= "\$cfg_regverify = ".$cfg_regverify.";\r\n";
	$configFile .= "\$cfg_regtime = ".$cfg_regtime.";\r\n";
	$configFile .= "\$cfg_payReturnType = ".(int)$cfg_payReturnType.";\r\n";
	$configFile .= "\$cfg_payReturnUrlPc = '".$cfg_payReturnUrlPc."';\r\n";
	$configFile .= "\$cfg_payReturnUrlTouch = '".$cfg_payReturnUrlTouch."';\r\n";
	$configFile .= "\$cfg_holduser = '".$cfg_holduser."';\r\n";
	$configFile .= "\$cfg_max_subtable_count = ".$cfg_max_subtable_count.";\r\n";
	$configFile .= "\$cfg_regclosemessage = '".$cfg_regclosemessage."';\r\n";
	$configFile .= "\$cfg_periodicCheckPhone = ".(int)$cfg_periodicCheckPhone.";\r\n";
	$configFile .= "\$cfg_periodicCheckPhoneCycle = ".(int)$cfg_periodicCheckPhoneCycle.";\r\n";
	$configFile .= "\$cfg_replacestr = '".$cfg_replacestr."';\r\n";
	$configFile .= "\$cfg_maliciousSplider = '".$cfg_maliciousSplider."';\r\n";
	$configFile .= "\$cfg_secure_domain = '".$cfg_secure_domain."';\r\n";
	$configFile .= "\$cfg_regtype = '".$cfg_regtype."';\r\n";
	$configFile .= "\$cfg_regfields = '".$cfg_regfields."';\r\n";

	//验证码
	$configFile .= "\$cfg_seccodestatus = '".$cfg_seccodestatus."';\r\n";
	$configFile .= "\$cfg_seccodetype = ".$cfg_seccodetype.";\r\n";
	$configFile .= "\$cfg_seccodewidth = ".$cfg_seccodewidth.";\r\n";
	$configFile .= "\$cfg_seccodeheight = ".$cfg_seccodeheight.";\r\n";
	$configFile .= "\$cfg_seccodefamily = '".$cfg_seccodefamily."';\r\n";
	$configFile .= "\$cfg_scecodeangle = ".$cfg_scecodeangle.";\r\n";
	$configFile .= "\$cfg_scecodewarping = ".$cfg_scecodewarping.";\r\n";
	$configFile .= "\$cfg_scecodeshadow = ".$cfg_scecodeshadow.";\r\n";
	$configFile .= "\$cfg_scecodeanimator = ".$cfg_scecodeanimator.";\r\n";

	//安全问题
	$configFile .= "\$cfg_secqaastatus  = '".$cfg_secqaastatus."';\r\n";
	/*源文件删除*/
	$configFile .= "\$cfg_filedelstatus = '".(int)$cfg_filedelstatus."';\r\n";
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
   /*会员发布付费需要审核*/
    $configFile .= "\$cfg_memberstatus = '".(int)$cfg_memberstatus."';\r\n";
    /*注销账户开关*/
    $configFile .= "\$cfg_cancellation_state = '".(int)$cfg_cancellation_state."';\r\n";
    /*IP属地*/
    $configFile .= "\$cfg_iphome = '".(int)$cfg_iphome."';\r\n";
	//论坛配置参数
	$configFile .= "\$cfg_bbsName = '"._RunMagicQuotes($cfg_bbsName)."';\r\n";
	$configFile .= "\$cfg_bbsUrl = '"._RunMagicQuotes($cfg_bbsUrl)."';\r\n";
	$configFile .= "\$cfg_bbsState = ".(int)$cfg_bbsState.";\r\n";
	$configFile .= "\$cfg_bbsType = '"._RunMagicQuotes($cfg_bbsType)."';\r\n";

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
	$configFile .= "\$cfg_geetest_wxmini = '"._RunMagicQuotes($cfg_geetest_wxmini)."';\r\n";

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

    //更新APP配置信息
    updateAppConfig();

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;

}

//转换数据
if($dopost == 'convertAesData'){

    //检测网站状态
    $visitState = (int)$cfg_visitState;
    if($visitState == 0){
        die('{"state": 200, "info": '.json_encode("检测到网站目前还是【启用】状态，请先更新网站状态为【禁用】！").'}');
    }

    convertAesData($type);

    adminLog("敏感数据转换", $type);

    die('{"state": 100, "info": '.json_encode("转换完成！").'}');

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteSafe.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('holdsubdomain', $cfg_holdsubdomain);
	$huoniaoTag->assign('iplimit', $cfg_iplimit);
	$huoniaoTag->assign('errLoginCount', $cfg_errLoginCount);
	$huoniaoTag->assign('loginLock', $cfg_loginLock);

	//短信验证码登录-单选
	$huoniaoTag->assign('smsLoginState', array('1', '0'));
	$huoniaoTag->assign('smsLoginStateNames',array('开启','关闭'));
	$huoniaoTag->assign('smsLoginStateChecked', (int)$cfg_smsLoginState);
    
	//短信验证码自动注册-单选
	$huoniaoTag->assign('smsAutoRegister', array('0', '1'));
	$huoniaoTag->assign('smsAutoRegisterNames',array('开启','关闭'));
	$huoniaoTag->assign('smsAutoRegisterChecked', (int)$cfg_smsAutoRegister);

	//密码强度验证-单选
	$huoniaoTag->assign('pwdLevel', array(0, 1, 2, 3));
	$huoniaoTag->assign('pwdLevelNames',array('关闭','简单','复杂','极致'));
	$huoniaoTag->assign('pwdLevelChecked', (int)$cfg_pwdLevel);

	//登录/注册手动勾选协议-单选
	$huoniaoTag->assign('agreeProtocol', array('0', '1'));
	$huoniaoTag->assign('agreeProtocolNames',array('开启','关闭'));
	$huoniaoTag->assign('agreeProtocolChecked', (int)$cfg_agreeProtocol);

	//发布信息实名认证-单选
	$huoniaoTag->assign('memberVerified', array('1', '0'));
	$huoniaoTag->assign('memberVerifiedNames',array('开启','关闭'));
	$huoniaoTag->assign('memberVerifiedChecked', (int)$cfg_memberVerified);
	$huoniaoTag->assign('memberVerifiedInfo', $cfg_memberVerifiedInfo ? $cfg_memberVerifiedInfo : '请先进行实名认证！');

	//发布信息绑定手机-单选
	$huoniaoTag->assign('memberBindPhone', array('1', '0'));
	$huoniaoTag->assign('memberBindPhoneNames',array('开启','关闭'));
	$huoniaoTag->assign('memberBindPhoneChecked', (int)$cfg_memberBindPhone);
	$huoniaoTag->assign('memberBindPhoneInfo', $cfg_memberBindPhoneInfo ? $cfg_memberBindPhoneInfo : '请先进行手机绑定！');

	//发布信息关注微信-单选
	$huoniaoTag->assign('memberFollowWechat', array('1', '0'));
	$huoniaoTag->assign('memberFollowWechatNames',array('开启','关闭'));
	$huoniaoTag->assign('memberFollowWechatChecked', (int)$cfg_memberFollowWechat);
	$huoniaoTag->assign('memberFollowWechatInfo', $cfg_memberFollowWechatInfo ? $cfg_memberFollowWechatInfo : '请先关注公众号！');

	//会员注册开关-单选
	$huoniaoTag->assign('regstatus', array('1', '0'));
	$huoniaoTag->assign('regstatusNames',array('开启','关闭'));
	$huoniaoTag->assign('regstatusChecked', $cfg_regstatus);

	//周期性检测手机号码开关-单选
	$huoniaoTag->assign('periodicCheckPhone', array('1', '0'));
	$huoniaoTag->assign('periodicCheckPhoneNames',array('开启','关闭'));
	$huoniaoTag->assign('periodicCheckPhoneChecked', (int)$cfg_periodicCheckPhone);
	$huoniaoTag->assign('periodicCheckPhoneCycle', (int)$cfg_periodicCheckPhoneCycle);

	/*源文件删除*/
    $huoniaoTag->assign('filedelstatus', array('1', '0'));
    $huoniaoTag->assign('filedelstatusNames',array('开启','关闭'));
    $huoniaoTag->assign('filedelstatusChecked', (int)$cfg_filedelstatus);    

	/*昵称是否可以修改*/
    $huoniaoTag->assign('nicknameEditState', array('0', '1'));
    $huoniaoTag->assign('nicknameEditStateNames',array('可以修改','不可以修改'));
    $huoniaoTag->assign('nicknameEditStateChecked', (int)$cfg_nicknameEditState);

    $huoniaoTag->assign('nicknameEditInfo', $cfg_nicknameEditInfo);

	/*修改昵称是否需要审核*/
    $huoniaoTag->assign('nicknameEditAudit', array('0', '1'));
    $huoniaoTag->assign('nicknameEditAuditNames',array('不需要审核','需要审核'));
    $huoniaoTag->assign('nicknameEditAuditChecked', (int)$cfg_nicknameEditAudit);

	/*头像是否可以修改*/
    $huoniaoTag->assign('avatarEditState', array('0', '1'));
    $huoniaoTag->assign('avatarEditStateNames',array('可以修改','不可以修改'));
    $huoniaoTag->assign('avatarEditStateChecked', (int)$cfg_avatarEditState);

    $huoniaoTag->assign('avatarEditInfo', $cfg_avatarEditInfo);

	/*修改头像是否需要审核*/
    $huoniaoTag->assign('avatarEditAudit', array('0', '1'));
    $huoniaoTag->assign('avatarEditAuditNames',array('不需要审核','需要审核'));
    $huoniaoTag->assign('avatarEditAuditChecked', (int)$cfg_avatarEditAudit);

	/*禁止评论*/
    $huoniaoTag->assign('disableCommentState', array('1', '0'));
    $huoniaoTag->assign('disableCommentStateNames',array('开启(不可以评论)','关闭(可以评论)'));
    $huoniaoTag->assign('disableCommentStateChecked', (int)$cfg_disableCommentState);

    $huoniaoTag->assign('disableCommentInfo', $cfg_disableCommentInfo);

	/*禁止点赞*/
    $huoniaoTag->assign('disableLikeState', array('1', '0'));
    $huoniaoTag->assign('disableLikeStateNames',array('开启(不可以点赞)','关闭(可以点赞)'));
    $huoniaoTag->assign('disableLikeStateChecked', (int)$cfg_disableLikeState);

    $huoniaoTag->assign('disableLikeInfo', $cfg_disableLikeInfo);
    $huoniaoTag->assign('commentPlaceholder', $cfg_commentPlaceholder);

    /*会员发布付费需要审核*/
    $huoniaoTag->assign('cfgmemberstatus', array('1', '0'));
    $huoniaoTag->assign('cfgmemberstatusNames',array('模块默认设置','不需要审核'));
    $huoniaoTag->assign('cfgmemberstatusChecked', (int)$cfg_memberstatus);

    /*IP属地*/
    $huoniaoTag->assign('iphome', array('0', '1', '2', '3'));
    $huoniaoTag->assign('iphomeNames',array('不显示','显示省份', '显示城市', '显示省份城市'));
    $huoniaoTag->assign('iphomeChecked', (int)$cfg_iphome);

    //注销账户开关
    $huoniaoTag->assign('cfgcancellation', array('1', '0'));
    $huoniaoTag->assign('cfgcancellationNames',array('开启','关闭'));
    $huoniaoTag->assign('cfgcancellationChecked', (int)$cfg_cancellation_state);

	//会员注册类型开关-多选
	$huoniaoTag->assign('regType', array('2','3','1'));
	$huoniaoTag->assign('regTypeName',array('手机注册','邮箱注册','用户名注册'));

	//新版三种方式不可以同时显示
	if($cfg_regtype == '1,2,3'){
		$cfg_regtype = '2,3';
	}

	$huoniaoTag->assign('regTypeChecked', explode(",", $cfg_regtype));
	//会员注册字段开关-多选
	$huoniaoTag->assign('regFields', array('1', '2','3'));
	$huoniaoTag->assign('regFieldsName',array('真实姓名','邮箱','手机'));
	$huoniaoTag->assign('regFieldsChecked', explode(",", $cfg_regfields));

	//注册验证-单选
	$huoniaoTag->assign('regverify', array('0', '1', '2'));
	$huoniaoTag->assign('regverifyNames',array('不验证','邮件验证','短信验证'));
	$huoniaoTag->assign('regverifyChecked', $cfg_regverify);

	$huoniaoTag->assign('regtime', $cfg_regtime);
	$huoniaoTag->assign('holduser', $cfg_holduser);
	$huoniaoTag->assign('max_subtable_count', $cfg_max_subtable_count ?: 100000);

	//支付成功跳转页面-单选
	$huoniaoTag->assign('payReturnType', array('0', '1'));
	$huoniaoTag->assign('payReturnTypeNames',array('系统默认','自定义'));
	$huoniaoTag->assign('payReturnTypeChecked', (int)$cfg_payReturnType);
	$huoniaoTag->assign('payReturnUrlPc', $cfg_payReturnUrlPc);
	$huoniaoTag->assign('payReturnUrlTouch', $cfg_payReturnUrlTouch);

	$huoniaoTag->assign('regclosemessage', $cfg_regclosemessage);
	$huoniaoTag->assign('replacestr', $cfg_replacestr);
	$huoniaoTag->assign('maliciousSplider', $cfg_maliciousSplider);
	$huoniaoTag->assign('secureDomain', $cfg_secure_domain);

	//启用验证码-多选
	$huoniaoTag->assign('seccodestatus',array('reg','login'));
	$huoniaoTag->assign('seccodestatusList',array('新用户注册','用户登录'));
	$huoniaoTag->assign('seccodestatusitem', explode(",", $cfg_seccodestatus));

	//验证码类型-单选
	$huoniaoTag->assign('seccodetype', array('1', '2', '3', '4'));
	$huoniaoTag->assign('seccodetypeNames',array('数字','字母','汉字','算术'));
	$huoniaoTag->assign('seccodetypeChecked', $cfg_seccodetype);

	$huoniaoTag->assign('seccodewidth', $cfg_seccodewidth);
	$huoniaoTag->assign('seccodeheight', $cfg_seccodeheight);

	//水印字体
	$ttfFloder = HUONIAOINC."/data/fonts/";
	if(is_dir($ttfFloder)){
		if ($file = opendir($ttfFloder)){
			$fileArray = array();
			while ($f = readdir($file)){
				if($f != '.' && $f != '..'){
					array_push($fileArray, $f);
				}
			}
			//字体文件-下拉菜单
			$huoniaoTag->assign('seccodefamily', $fileArray);
			$huoniaoTag->assign('seccodefamilySelected', $cfg_seccodefamily);
		}
	}

	//随机倾斜度-单选
	$huoniaoTag->assign('scecodeangle', array('1', '0'));
	$huoniaoTag->assign('scecodeangleNames',array('是','否'));
	$huoniaoTag->assign('scecodeangleChecked', $cfg_scecodeangle);

	//随机扭曲-单选
	$huoniaoTag->assign('scecodewarping', array('1', '0'));
	$huoniaoTag->assign('scecodewarpingNames',array('是','否'));
	$huoniaoTag->assign('scecodewarpingChecked', $cfg_scecodewarping);

	//文字阴影-单选
	$huoniaoTag->assign('scecodeshadow', array('1', '0'));
	$huoniaoTag->assign('scecodeshadowNames',array('是','否'));
	$huoniaoTag->assign('scecodeshadowChecked', $cfg_scecodeshadow);

	//GIF 动画-单选
	$huoniaoTag->assign('scecodeanimator', array('1', '0'));
	$huoniaoTag->assign('scecodeanimatorNames',array('是','否'));
	$huoniaoTag->assign('scecodeanimatorChecked', $cfg_scecodeanimator);

	//启用验证问题-多选
	$huoniaoTag->assign('secqaastatus',array('reg'));
	$huoniaoTag->assign('secqaastatusList',array('新用户注册'));
	$huoniaoTag->assign('secqaastatusitem', explode(",", $cfg_secqaastatus));

	$archives = $dsql->SetQuery("SELECT `question`, `answer` FROM `#@__safeqa`");
	$results = $dsql->dsqlOper($archives, "results");

	//极验验证码
	$huoniaoTag->assign('geetest', array(0, 2, 1));
	$huoniaoTag->assign('geetestNames',array('关闭', '阿里云(验证码2.0)', '极验(行为验证3.0)'));
	$huoniaoTag->assign('geetestChecked', (int)$cfg_geetest);

	$huoniaoTag->assign('geetest_id', $cfg_geetest_id);
	$huoniaoTag->assign('geetest_key', $cfg_geetest_key);

	$huoniaoTag->assign('geetest_AccessKeyID', $cfg_geetest_AccessKeyID);
	$huoniaoTag->assign('geetest_AccessKeySecret', $cfg_geetest_AccessKeySecret);
	$huoniaoTag->assign('geetest_prefix', $cfg_geetest_prefix);
	$huoniaoTag->assign('geetest_web', $cfg_geetest_web);
	$huoniaoTag->assign('geetest_h5', $cfg_geetest_h5);
	$huoniaoTag->assign('geetest_app', $cfg_geetest_app);
	$huoniaoTag->assign('geetest_wxmini', $cfg_geetest_wxmini);

	$huoniaoTag->assign('safeqa', json_encode($results));

    //文本内容审核
    $huoniaoTag->assign('moderationWB', array('1', '0'));
    $huoniaoTag->assign('moderationWBNames',array('是','否'));
    $huoniaoTag->assign('moderationWBChecked', (int)$cfg_moderationWB);
    //图片
    $huoniaoTag->assign('moderationTP', array('1', '0'));
    $huoniaoTag->assign('moderationTPNames',array('是','否'));
    $huoniaoTag->assign('moderationTPChecked', (int)$cfg_moderationTP);

    //音频
    $huoniaoTag->assign('moderationYP', array('1', '0'));
    $huoniaoTag->assign('moderationYPNames',array('是','否'));
    $huoniaoTag->assign('moderationYPChecked', (int)$cfg_moderationYP);

    //视频
    $huoniaoTag->assign('moderationSP', array('1', '0'));
    $huoniaoTag->assign('moderationSPNames',array('是','否'));
    $huoniaoTag->assign('moderationSPChecked', (int)$cfg_moderationSP);

    //审核平台
	$huoniaoTag->assign('moderationPlatform', array('aliyun', 'huawei'));
	$huoniaoTag->assign('moderationPlatformNames',array('阿里云', '华为云'));
	$huoniaoTag->assign('moderationPlatformChecked', $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei');

    //审核密钥
    $huoniaoTag->assign('moderation_region', $cfg_moderation_region);
    $huoniaoTag->assign('moderation_projectId', $cfg_moderation_projectId);
    $huoniaoTag->assign('moderation_key', $cfg_moderation_key);
    $huoniaoTag->assign('moderation_secret', $cfg_moderation_secret);
    $huoniaoTag->assign('moderation_aliyun_region', $cfg_moderation_aliyun_region);
    $huoniaoTag->assign('moderation_aliyun_key', $cfg_moderation_aliyun_key);
    $huoniaoTag->assign('moderation_aliyun_secret', $cfg_moderation_aliyun_secret);

    //RSA密钥
	$huoniaoTag->assign('encryptPrivkey', $cfg_encryptPrivkey);
	$huoniaoTag->assign('encryptPubkey', $cfg_encryptPubkey);

    //AES密钥
	$huoniaoTag->assign('aes_key', $cfg_aes_key);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//转换数据
//type: first, last  //first: 首次转换，last: 更换密钥后转换
function convertAesData($type){

    global $cfg_aes_key_last;  //上一次使用的密钥，用于更换密钥时解密数据
    global $cfg_aes_key;  //最新的密钥

    //如果是首次转换，但是密钥为空，直接返回，无须转换
    if($type == 'first' && !$cfg_aes_key) die('{"state": 200, "info": '.json_encode("请先设置密钥！").'}');;

    //更换密钥，如果旧密钥和新密钥都为空，直接返回，无须转换
    if($type == 'last' && !$cfg_aes_key_last) die('{"state": 200, "info": '.json_encode("数据恢复错误，修改前的密钥获取失败，请根据教程手动恢复\$cfg_aes_key_last的值！").'}');

    //首次转换，直接对数据加密
    if($type == 'first'){
        $sqls = getAesSql('encrypt', $cfg_aes_key);
        execSql($sqls);
    }
    //更换密钥，先对数据进行解密，再加密
    elseif($type == 'last'){

        //解密
        $sqls = getAesSql('decrypt', $cfg_aes_key_last);
        execSql($sqls);

        //加密，如果新保存的密钥为空，则表示系统不需要对敏感数据做加密
        if($cfg_aes_key){
            $sqls = getAesSql('encrypt', $cfg_aes_key);
            execSql($sqls);
        }
    }
    
}


//批量执行sql
function execSql($sqls = array()){
    if(!$sqls) return;
    global $dsql;

    foreach ($sqls as $sql) {
        $dsql->dsqlOper($sql, "update", "", "", 0);
    }
}


//获取需要转换的sql
//type: decrypt、encrypt  //decrypt: 解密，encrypt: 加密
//key: 密钥
function getAesSql($type, $key){

    //需要加密处理的表和字段
    //规则配置项，格式为 ['表名' => ['字段1', '字段2', ...]]
    //后续如果要增加新的表或字段，需要先将老数据加密，否则会出现数据异常问题，include/class/dsql.class.php有也有一份，需要同步修改
    $_rules = array(
        'member' => array('realname', 'idcard', 'email', 'phone', 'address'),  //会员
        'member_address' => array('address', 'person', 'mobile'),  //收货地址
        'member_fenxiao_user' => array('phone'),  //分销商
        'member_withdraw' => array('cardnum', 'cardname'),  //提现记录
        'member_withdraw_card' => array('cardnum', 'cardname'),  //提现卡号
        'article_selfmedia' => array('op_name', 'op_idcard', 'op_phone', 'op_email'),  //媒体号
        'awardlegou_order' => array('useraddr', 'username', 'usercontact'),  //有奖乐购订单
        'business_dingzuo_order' => array('name', 'contact'),  //商家订座订单
        'car_appoint' => array('tel'),  //汽车预约到店
        'car_enturst' => array('contact'),  //汽车委托卖车
        'car_scrap' => array('name', 'phone'),  //汽车报废申请
        'education_order' => array('people', 'contact'),  //教育订单
        'education_word' => array('tel'),  //教育留言
        'education_yuyue' => array('tel'),  //教育预约
        'homemaking_order' => array('useraddr', 'username', 'usercontact'),  //家政订单
        'house_coop' => array('tel'),  //楼盘合作
        'house_entrust' => array('address', 'doornumber', 'username', 'contact'),  //房源委托
        'house_fenxiaobb' => array('username', 'usertel'),  //分销报备
        'house_loupantuan' => array('name', 'phone'),  //楼盘团购报名
        'house_notice' => array('name', 'phone'),  //楼盘降价通知
        'house_yuyue' => array('username', 'mobile'),  //房产预约
        'huodong_order' => array('property'),  //活动订单
        'huodong_reg' => array('property'),  //活动报名
        'integral_order' => array('people', 'address', 'contact'),  //积分商城订单
        'job_resume' => array('name', 'phone', 'email'),  //招聘简历
        'marry_contactlog' => array('tel', 'username'),  //婚嫁套餐咨询
        'marry_rese' => array('people', 'contact'),  //婚嫁预约
        'paimai_order' => array('useraddr', 'username', 'usercontact'),  //拍卖订单
        'paotui_order' => array('person', 'tel', 'address', 'getperson', 'gettel', 'buyaddress'),  //跑腿订单
        'shop_order' => array('people', 'address', 'contact'),  //商城订单
        'waimai_order_all' => array('person', 'tel', 'address'),  //外卖订单
        'pension_elderly' => array('elderlyname', 'address', 'tel', 'email'),  //养老老人信息
        'pension_yuyue' => array('people', 'tel'),  //养老预约
        'renovation_entrust' => array('people', 'contact'),  //装修申请
        'renovation_rese' => array('address', 'people', 'contact'),  //装修预约
        'renovation_visit' => array('people', 'contact'),  //装修申请
        'renovation_zhaobiao' => array('address', 'people', 'contact', 'email'),  //装修招标
        'travel_order' => array('people', 'contact', 'idcard', 'email', 'backpeople', 'backcontact', 'backaddress'),  //旅游订单
        'tuan_order' => array('useraddr', 'username', 'usercontact'),  //团购订单
        'waimai_address' => array('person', 'tel', 'street', 'address'),  //外卖收货地址
    );

    $sql = array();

    foreach ($_rules as $table => $fields) {
        foreach ($fields as $k => $v) {
            $sql[] = operateAesField($table, $v, $type, $key);
        }
    }

    return $sql;

}

//解密/加密字段
//$table 表名
//field 字段名
//type decrypt、encrypt  //decrypt: 解密，encrypt: 加密
//key 密钥
function operateAesField($table, $field, $type, $key){
    
    $prefix = $GLOBALS['DB_PREFIX'];  //表前缀
    $sql = '';

    //加密
    if($type == 'encrypt'){
        $sql = "UPDATE `{$prefix}{$table}` SET `$field` = HEX(AES_ENCRYPT(`$field`, '$key')) WHERE `$field` != '' AND `$field` IS NOT NULL";
    }

    //解密
    elseif($type == 'decrypt'){
        $sql = "UPDATE `{$prefix}{$table}` SET `$field` = CONVERT(AES_DECRYPT(UNHEX(`$field`), '$key') USING utf8mb4) WHERE `$field` != '' AND `$field` IS NOT NULL";
    }

    return $sql;

}