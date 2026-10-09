<?php
/**
 * 系统基本参数
 *
 * @version        $Id: siteConfig.php 2013-9-21 下午10:59:36 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteConfig.html";
$dir       = "../../templates/siteConfig"; //当前目录

if($action != ""){
	if($token == "") die('token传递失败！');

	//删除模板文件夹
	if($action == "delTpl"){
		if(empty($floder)) die('请选择要删除的模板！');

		$floder = $dir."/".iconv('utf-8', 'gbk', $floder);
		$deldir = deldir($floder);
		if($deldir){
			adminLog("修改系统基本参数", "删除模板：".$floder);

			die('{"state": 100, "info": '.json_encode("删除成功！").'}');
		}else{
			die('{"state": 200, "info": '.json_encode("删除失败！").'}');
		}

	}else{
		if($action == "site"){
			//站点信息
			$cfg_basehost        = strtolower($basehost);
			$cfg_webname         = $webname;
			$cfg_shortname       = $shortname;
			$cfg_weblogo         = $litpic;
			$cfg_touchlogo       = $touchlogo;
			$cfg_adminlogo       = $adminlogo;
			$cfg_businesslogo    = $businesslogo;
			$cfg_adminWaterMark  = (int)$adminWaterMark;
			$cfg_adminBackgroundColor = $adminBackgroundColor ? $adminBackgroundColor : '#3275FA';
			$cfg_sharePic        = $sharePic;
			$cfg_shareTitle      = $shareTitle;
			$cfg_shareDesc       = str_replace(array("\r\n", "\r", "\n"), " ", $shareDesc);
			$cfg_keywords        = $keywords;
			$cfg_description     = str_replace(array("\r\n", "\r", "\n"), " ", $description);
			$cfg_beian           = $beian;
			$cfg_hotline         = $hotline;
			$cfg_powerby         = $powerby;
			$cfg_statisticscode  = $statisticscode;
			$cfg_visitState      = (int)$visitState;
			$cfg_visitMessage    = $visitMessage;
			$cfg_pcState         = $pcState;
			$cfg_timeZone        = $timeZone;
			$cfg_mapCity         = $mapCity;
			// 客服联系方式
			$cfg_server_tel      = $server_tel;
			$cfg_server_qq       = $server_qq;
			$cfg_server_wx       = $server_wx;
			$cfg_server_wxQr   = $server_wxQr;

			//地图配置
			$cfg_map             = $map;
			$cfg_map_google      = $mapkey_google;
			$cfg_map_baidu       = $mapkey_baidu;
			$cfg_map_baidu_server = $mapkey_baidu_server;
			$cfg_map_baidu_wxmini = $mapkey_baidu_wxmini;
			$cfg_map_qq          = $mapkey_qq;
			$cfg_map_amap        = $mapkey_amap;
			$cfg_map_amap_server = $mapkey_amap_server;
			$cfg_map_amap_jscode = $mapkey_amap_jscode;
			$cfg_map_tmap        = $mapkey_tmap;
			$cfg_map_tmap_server = $mapkey_tmap_server;

			//天气
			$cfg_weatherCity     = $weatherCity;

			$cfg_onlinetime      = $onlinetime > 0 ? (int)$onlinetime : 1;  //在线时长不得为0
			$cfg_cookiePath      = $cookiePath;
			$cfg_cookieDomain    = strtolower($cookieDomain);
			$cfg_cookiePre       = $cookiePre;
			$cfg_cache_lifetime  = $cache_lifetime;
			$cfg_lang            = $lang_;
			$cfg_remoteStatic    = $remoteStatic;
			$cfg_spiderIndex     = $spiderIndex;
			$cfg_urlRewrite      = $urlRewrite;
			$cfg_hideUrl         = $hideUrl;
			$cfg_bindMobile      = $bindMobile;
			$cfg_member_card     = $member_card;
			$cfg_httpSecureAccess = $httpSecureAccess;
			$cfg_slb             = $slb;
			$cfg_siteDebug       = $siteDebug;
			$cfg_memberCityid    = (int)$memberCityid;
			$cfg_sitePageGray    = (int)$sitePageGray;
			$cfg_vipAdvertising    = (int)$vipAdvertising;

			$cfg_visitState = $cfg_visitState == "" ? 0 : $cfg_visitState;
			$cfg_timeZone   = $cfg_timeZone == "" ? 8 : $cfg_timeZone;
			$cfg_onlinetime = $cfg_onlinetime == "" ? 30 : $cfg_onlinetime;
			$cfg_cache_lifetime = $cfg_cache_lifetime == "" ? 60 : $cfg_cache_lifetime;
			$cfg_lang = $cfg_lang == "" ? 'zh-CN' : $cfg_lang;
			$cfg_urlRewrite = $cfg_urlRewrite == "" ? 0 : $cfg_urlRewrite;
			$cfg_hideUrl    = $cfg_hideUrl == "" ? 0 : $cfg_hideUrl;
			$cfg_bindMobile = $cfg_bindMobile == "" ? 0 : $cfg_bindMobile;
			$cfg_member_card = $cfg_member_card =="" ? 0 : $cfg_member_card;
			$cfg_httpSecureAccess = $cfg_httpSecureAccess == "" ? 0 : $cfg_httpSecureAccess;
			$cfg_slb = $cfg_slb == "" ? 0 : $cfg_slb;
			$cfg_siteDebug = $cfg_siteDebug == "" ? 0 : $cfg_siteDebug;

			if($cfg_basehost == "" || $cfg_webname == "" || $cfg_weblogo == "")
			die('{"state": 200, "info": '.json_encode("请填写完整！").'}');

			adminLog("修改系统基本参数", "站点信息");

		}elseif($action == "temp"){
			//模板风格
			$cfg_template = $template;
			$cfg_touchTemplate = $touchTemplate;
			$cfg_userCenterTouchTemplateType = (int)$userCenterTouchTemplateType;
			$cfg_busiCenterTouchTemplateType = (int)$busiCenterTouchTemplateType;

			adminLog("修改系统基本参数", "站点风格");

        }elseif($action == 'touchTemplate'){
            //模板风格
			$cfg_touchTemplate = $template;

			adminLog("修改系统基本参数", "移动端站点风格：" . $template);

        }elseif($action == 'userCenterTemplate'){
            //模板风格
			$cfg_userCenterTouchTemplateType = (int)$template;

			adminLog("修改系统基本参数", "个人会员中心DIY模式" . ($template ? '开启' : '关闭'));

        }elseif($action == 'busiCenterTemplate'){
            //模板风格
			$cfg_busiCenterTouchTemplateType = (int)$template;

			adminLog("修改系统基本参数", "商家会员中心DIY模式" . ($template ? '开启' : '关闭'));

		}elseif($action == "upload"){
			//上传设置
			$cfg_uploadDir         = str_replace('.', '', $uploadDir);
			$cfg_softSize          = $softSize;
			$cfg_softType          = $softType;
			$cfg_thumbSize         = $thumbSize;
			$cfg_thumbType         = $thumbType;
			$cfg_atlasSize         = $atlasSize;
			$cfg_atlasType         = $atlasType;
			$cfg_editorSize        = $editorSize;
			$cfg_editorType        = $editorType;
			$cfg_photoSize         = $photoSize;
			$cfg_photoType         = $photoType;
			$cfg_flashSize         = $flashSize;
			$cfg_audioSize         = $audioSize;
			$cfg_audioType         = $audioType;
			$cfg_fastUpload        = $fastUpload;
			$cfg_imageCompress     = $imageCompress;
			$cfg_videoUploadState  = $videoUploadState;
			$cfg_videoCompress     = $videoCompress;
			$cfg_videoSize         = $videoSize;
			$cfg_videoType         = $videoType;
			$cfg_thumbSmallWidth   = $thumbSmallWidth;
			$cfg_thumbSmallHeight  = $thumbSmallHeight;
			$cfg_thumbMiddleWidth  = $thumbMiddleWidth;
			$cfg_thumbMiddleHeight = $thumbMiddleHeight;
			$cfg_thumbLargeWidth   = $thumbLargeWidth;
			$cfg_thumbLargeHeight  = $thumbLargeHeight;
			$cfg_atlasSmallWidth   = $atlasSmallWidth;
			$cfg_atlasSmallHeight  = $atlasSmallHeight;
			$cfg_photoSmallWidth   = $photoSmallWidth;
			$cfg_photoSmallHeight  = $photoSmallHeight;
			$cfg_photoMiddleWidth  = $photoMiddleWidth;
			$cfg_photoMiddleHeight = $photoMiddleHeight;
			$cfg_photoLargeWidth   = $photoLargeWidth;
			$cfg_photoLargeHeight  = $photoLargeHeight;
			$cfg_meditorPicWidth   = $meditorPicWidth;
			$cfg_photoCutType      = $photoCutType;
			$cfg_photoCutPostion   = $photoCutPostion;
			$cfg_quality           = $quality;

			$cfg_softSize = $cfg_softSize == "" ? 10240 : $cfg_softSize;
			$cfg_thumbSize = $cfg_thumbSize == "" ? 1024 : $cfg_thumbSize;
			$cfg_atlasSize = $cfg_atlasSize == "" ? 2048 : $cfg_atlasSize;
			$cfg_editorSize = $cfg_editorSize == "" ? 2048 : $cfg_editorSize;
			$cfg_photoSize = $cfg_photoSize == "" ? 1024 : $cfg_photoSize;
			$cfg_flashSize = $cfg_flashSize == "" ? 1024 : $cfg_flashSize;
			$cfg_audioSize = $cfg_audioSize == "" ? 1024 : $cfg_audioSize;
			$cfg_videoSize = $cfg_videoSize == "" ? 10240 : $cfg_videoSize;
			$cfg_thumbSmallWidth = $cfg_thumbSmallWidth == "" ? 104 : $cfg_thumbSmallWidth;
			$cfg_thumbSmallHeight = $cfg_thumbSmallHeight == "" ? 80 : $cfg_thumbSmallHeight;
			$cfg_thumbMiddleWidth = $cfg_thumbMiddleWidth == "" ? 240 : $cfg_thumbMiddleWidth;
			$cfg_thumbMiddleHeight = $cfg_thumbMiddleHeight == "" ? 180 : $cfg_thumbMiddleHeight;
			$cfg_thumbLargeWidth = $cfg_thumbLargeWidth == "" ? 400 : $cfg_thumbLargeWidth;
			$cfg_thumbLargeHeight = $cfg_thumbLargeHeight == "" ? 300 : $cfg_thumbLargeHeight;
			$cfg_atlasSmallWidth = $cfg_atlasSmallWidth == "" ? 115 : $cfg_atlasSmallWidth;
			$cfg_atlasSmallHeight = $cfg_atlasSmallHeight == "" ? 75 : $cfg_atlasSmallHeight;
			$cfg_photoSmallWidth = $cfg_photoSmallWidth == "" ? 50 : $cfg_photoSmallWidth;
			$cfg_photoSmallHeight = $cfg_photoSmallHeight == "" ? 50 : $cfg_photoSmallHeight;
			$cfg_photoMiddleWidth = $cfg_photoMiddleWidth == "" ? 100 : $cfg_photoMiddleWidth;
			$cfg_photoMiddleHeight = $cfg_photoMiddleHeight == "" ? 100 : $cfg_photoMiddleHeight;
			$cfg_photoLargeWidth = $cfg_photoLargeWidth == "" ? 200 : $cfg_photoLargeWidth;
			$cfg_meditorPicWidth = $cfg_meditorPicWidth == "" ? 700 : $cfg_meditorPicWidth;
			$cfg_photoLargeHeight = $cfg_photoLargeHeight == "" ? 200 : $cfg_photoLargeHeight;
			$cfg_quality = $cfg_quality == "" ? 90 : $cfg_quality;

			if($cfg_uploadDir == "" || $cfg_softType == "" || $cfg_thumbType == "" || $cfg_atlasType == "")
			die('{"state": 200, "info": '.json_encode("请填写完整！").'}');

			adminLog("修改系统基本参数", "上传设置");

		}elseif($action == "ftp"){
			//远程附件
			$cfg_ftpType        = $ftpType;
			$cfg_ftpState       = $ftpStateType;
			$cfg_ftpSSL         = $ftpSSL;
			$cfg_ftpPasv        = $ftpPasv;
			$cfg_ftpUrl         = $ftpUrl;
			$cfg_ftpServer      = $ftpServer;
			$cfg_ftpPort        = $ftpPort;
			$cfg_ftpDir         = $ftpDir;
			$cfg_ftpUser        = $ftpUser;
			$cfg_ftpPwd         = $ftpPwd;
			$cfg_ftpTimeout     = $ftpTimeout;
			$cfg_OSSUrl         = $OSSUrl;
			$cfg_OSSBucket      = $OSSBucket;
			$cfg_EndPoint       = $EndPoint;
			$cfg_OSSKeyID       = $OSSKeyID;
			$cfg_OSSKeySecret   = $OSSKeySecret;
			$cfg_QINIUAccessKey = $access_key;
			$cfg_QINIUSecretKey = $secret_key;
			$cfg_QINIUbucket    = $bucket;
			$cfg_QINIUdomain    = $domain;
			$cfg_OBSUrl         = $OBSUrl;
			$cfg_OBSBucket      = $OBSBucket;
			$cfg_OBSEndpoint    = $OBSEndpoint;
			$cfg_OBSKeyID       = $OBSKeyID;
			$cfg_OBSKeySecret   = $OBSKeySecret;
			$cfg_COSUrl         = $COSUrl;
			$cfg_COSBucket      = $COSBucket;
			$cfg_COSRegion      = $COSRegion;
			$cfg_COSSecretid    = $COSSecretid;
			$cfg_COSSecretkey   = $COSSecretkey;
			$cfg_remoteFtpUnify = $remoteFtpUnify;
			$cfg_ffmpeg         = $ffmpeg;

			$cfg_ftpType = $cfg_ftpType == "" ? 0 : $cfg_ftpType;
			$cfg_ftpState = $cfg_ftpState == "" ? 1 : $cfg_ftpState;
			$cfg_ftpSSL = $cfg_ftpSSL == "" ? 0 : $cfg_ftpSSL;
			$cfg_ftpPasv = $cfg_ftpPasv == "" ? 0 : $cfg_ftpPasv;
			$cfg_ftpPort = $cfg_ftpPort == "" ? 21 : $cfg_ftpPort;
			$cfg_ftpTimeout = $cfg_ftpTimeout == "" ? 0 : $cfg_ftpTimeout;

		    if($cfg_ftpType == 1){
		        if($cfg_OSSUrl == "" || $cfg_OSSBucket == "" || $cfg_EndPoint == "" || $cfg_OSSKeyID == "" || $cfg_OSSKeySecret == "")
		        die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
		    }

      		if($cfg_ftpType == 2){
				if($cfg_QINIUAccessKey == "" || $cfg_QINIUSecretKey == "" || $cfg_QINIUbucket == "" || $cfg_QINIUdomain == "")
				die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
			}

			if($cfg_ftpType == 3){
		        if($cfg_OBSUrl == "" || $cfg_OBSBucket == "" || $cfg_OBSEndpoint == "" || $cfg_OBSKeyID == "" || $cfg_OBSKeySecret == "")
		        die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
		    }

			if($cfg_ftpType == 4){
		        if($cfg_COSUrl == "" || $cfg_COSBucket == "" || $cfg_COSRegion == "" || $cfg_COSSecretid == "" || $cfg_COSSecretkey == "")
		        die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
		    }

			if($cfg_ftpType == 0 && $cfg_ftpState == 1){
				if($cfg_ftpUrl == "" || $cfg_ftpServer == "" || $cfg_ftpDir == "" || $cfg_ftpUser == "" || $cfg_ftpPwd == "")
				die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
			}

			adminLog("修改系统基本参数", "远程附件");

		}elseif($action == "mark"){
			//水印设置
			$thumbMarkState    = $thumbMarkState;
			$atlasMarkState    = $atlasMarkState;
			$editorMarkState   = $editorMarkState;
			$waterMarkWidth    = $waterMarkWidth;
			$waterMarkHeight   = $waterMarkHeight;
			$waterMarkPostion  = $waterMarkPostion;
			$waterMarkType     = $waterMarkType;
			$waterMarkText     = $markText;
            $cfg_waterZizhiText     = $zizhiText;
			$markFontfamily    = $markFontfamily;
			$markFontsize      = $markFontsize;
            $zizhiTextFontsize      = $zizhiTextFontsize;
            $zizhiTextTransparent      = $zizhiTextTransparent;
			$markFontColor     = $markFontColor;
            $cfg_zizhiTextColor    = $zizhiTextColor;
			$markFile          = $markFile;
			$markPadding       = $markPadding;
			$transparent       = $transparent;
			$markQuality       = $markQuality;

			$thumbMarkState = $thumbMarkState == "" ? 0 : $thumbMarkState;
			$atlasMarkState = $atlasMarkState == "" ? 0 : $atlasMarkState;
			$editorMarkState = $editorMarkState == "" ? 0 : $editorMarkState;
			$waterMarkWidth = $waterMarkWidth == "" ? 400 : $waterMarkWidth;
			$waterMarkHeight = $waterMarkHeight == "" ? 300 : $waterMarkHeight;
			$waterMarkPostion = $waterMarkPostion == "" ? 9 : $waterMarkPostion;
			$waterMarkType = $waterMarkType == "" ? 1 : $waterMarkType;
			$markFontsize = $markFontsize == "" ? 12 : $markFontsize;
            $cfg_zizhiTextFontsize = $zizhiTextFontsize == "" ? 12 : $zizhiTextFontsize;
            $cfg_zizhiTextTransparent = $zizhiTextTransparent == "" ? 10 : $zizhiTextTransparent;
			$markPadding = $markPadding == "" ? 10 : $markPadding;
			$markTransparent = $transparent == "" ? 100 : $transparent;
			$markQuality = $markQuality == "" ? 90 : $markQuality;

			if($waterMarkType == 1){
				if($waterMarkText == "" || $markFontfamily == "")
				die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
			}elseif($waterMarkType == 2 || $waterMarkType == 3){
				if($markFile == "")
				die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
			}

			adminLog("修改系统基本参数", "水印设置");


		//设置默认首页
		}elseif($action == "setSystemIndex"){

			//设置频道为首页
			if($type == "set"){

				if(!empty($module)){
					$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__site_module` WHERE `id` = $module");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$cfg_defaultindex = $ret[0]['name'] ? $ret[0]['name'] : $ret[0]['id'];
					}
				}

			//默认
			}else{

				$cfg_defaultindex = "siteConfig";

			}

			adminLog("设置默认首页", $type." => ".$cfg_defaultindex);

		//计量单位
		}elseif($action == "unit"){

			// $currency_name   = !empty($currency_name) ? $currency_name : "人民币";
			// $currency_short  = !empty($currency_short) ? $currency_short : "元";
			// $currency_symbol = !empty($currency_symbol) ? $currency_symbol : "¥";
			// $currency_code   = !empty($currency_code) ? $currency_code : "RMB";
			// $currency_rate   = !empty($currency_rate) ? $currency_rate : "1";

			adminLog("修改系统基本参数", "计量单位");

			updateAppConfig();

		//广告标识
		}elseif($action == "advMark"){

			$cfg_advMarkState = (int)$advMarkState;
			$cfg_advMarkPostion = (int)$advMarkPostion;
			adminLog("修改系统基本参数", "广告标识");

		//会员中心链接管理
		}elseif($action == "ucenterlinks"){

			$cfg_ucenterLinks = isset($ucenterLinks) ? join(',',$ucenterLinks) : '';
			adminLog("修改系统基本参数", "会员中心链接管理");

		//自然语言处理
		}elseif($action == "nlp"){

			$cfg_nlp_AppID = $nlp_AppID;
			$cfg_nlp_APIKey = $nlp_APIKey;
			$cfg_nlp_Secret = $nlp_Secret;
			adminLog("修改系统基本参数", "自然语言处理");

        //聚合数据接口
        }elseif($action == "juhe"){

            $cfg_juhe = $juhe ? serialize($juhe) : '';
            adminLog("修改系统基本参数", "聚合数据接口");

            $cfg_cardState = (int)$cardState;               //  身份证识别开启标识
            $cfg_enterpriseBusinessDataState = (int)$enterpriseBusinessDataState;               // 企业工商信息开启接口

        //即时通讯接口
		}elseif($action == "im"){

            $cfg_km_accesskey_id = $km_accesskey_id;
            $cfg_km_accesskey_secret = $km_accesskey_secret;
            adminLog("修改系统基本参数", "即时通讯接口");

		//设置默认首页
		}elseif($action == "Alidayu"){

			$cfg_smsAlidayu = (int)$smsAlidayu;
			adminLog("设置短信平台为阿里大于", $cfg_smsAlidayu);


		//设置地铁状态
		}elseif($action == "subway"){

			$cfg_subway_state = (int)$subway_state;
			$cfg_subway_title = $subway_title ? $subway_title : '公交/地铁';

			adminLog("设置公交地铁状态", $cfg_subway_state." => ".$cfg_subway_title);


        //设置重复区域状态
        }elseif($action == "sameAddr"){
            
            $cfg_auto_location = (int)$auto_location;
            $cfg_sameAddr_state = (int)$addr_state;
            $cfg_sameAddr_group = (int)$addr_group;
            $cfg_sameAddr_nearby = (int)$addr_nearby;
            
            adminLog("设置城市分站自定义配置", "自动定位：" . $cfg_auto_location . "，重复区域：" . $cfg_sameAddr_state . "，城市分组：" . $cfg_sameAddr_group . "，周边范围：" . $cfg_sameAddr_nearby);
            updateAppConfig();


        //自定义区域级别名称
        }elseif($action == "customAreaName"){

            $area0 = trim($area0);
            $area1 = trim($area1);
            $area2 = trim($area2);
            $area3 = trim($area3);
            $area4 = trim($area4);
            $area5 = trim($area5);

            $area0 = $area0 ?: '省份';
            $area1 = $area1 ?: '城市';
            $area2 = $area2 ?: '区县';
            $area3 = $area3 ?: '乡镇';
            $area4 = $area4 ?: '村庄';
            $area5 = $area5 ?: '自定义';

            adminLog("设置自定义区域级别名称", $area0 . '-' . $area1 . '-' . $area2 . '-' . $area3 . '-' . $area4 . '-' . $area5);

            $cfg_areaName_0 = $area0;
            $cfg_areaName_1 = $area1;
            $cfg_areaName_2 = $area2;
            $cfg_areaName_3 = $area3;
            $cfg_areaName_4 = $area4;
            $cfg_areaName_5 = $area5;

            updateAppConfig();

        //设置计划任务执行方式
        }elseif($action == "cronType"){

            $cfg_cronType = (int)$cronType;

            adminLog("计划任务执行方式", $cfg_cronType ? '程序内置' : '服务器端');

        //设置记录附件使用次数开关
        }elseif($action == "fileManage"){

            $cfg_record_attachment_count = (int)$record_attachment_count;

            adminLog("设置记录附件使用次数开关", $cfg_record_attachment_count ? '关闭' : '开启');

		//客服系统
		}elseif($action == 'kefu'){
			$cfg_kefu_pc_url     = $kefu_pc_url;
			$cfg_kefu_touch_url  = $kefu_touch_url;
			$cfg_kefuMiniProgram = (int)$kefuMiniProgram;

        //设置保障金配置
        }elseif($action == "promotionConfig"){

            $cfg_promotion_note = trim($note);
            $cfg_promotion_least = (float)$least;
            $cfg_promotion_limitVal = (int)$limitVal;
            $cfg_promotion_limitType = (int)$limitType;
            $cfg_promotion_reason = trim($reason);

            adminLog("设置保障金配置", "");
		}

        //操作日志保存天数配置
        elseif($action == "siteLog"){
            $day = (int)$day;
            $max_siteLog_save_day = $day > 0 ? $day : 180;  //默认180天

            //删除超过时间的日志
            $_time = GetMkTime(time()) - $max_siteLog_save_day * 86400;
            $sql = $dsql->SetQuery("DELETE FROM `#@__sitelog` WHERE `pubdate` < ".$_time);
            $dsql->dsqlOper($sql, "update");

            adminLog("设置操作日志保存天数", $max_siteLog_save_day . '天');
        }

        //用户行为日志保存天数配置
        elseif($action == "memberBehaviorLog"){
            $day = (int)$day;
            $max_memberBehaviorLog_save_day = $day > 0 ? $day : 180;  //默认180天

            //删除超过时间的日志
            $_time = GetMkTime(time()) - $max_memberBehaviorLog_save_day * 86400;
            $sql = $dsql->SetQuery("DELETE FROM `#@__member_log_all` WHERE `pubdate` < ".$_time);
            $dsql->dsqlOper($sql, "update");

            adminLog("设置用户行为日志保存天数", $max_memberBehaviorLog_save_day . '天');
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
		$configFile .= "\$cfg_hideUrl = ".(int)_RunMagicQuotes($cfg_hideUrl).";\r\n";
		$configFile .= "\$cfg_bindMobile = '"._RunMagicQuotes($cfg_bindMobile)."';\r\n";
		$configFile .= "\$cfg_member_card = '".(int)_RunMagicQuotes($cfg_member_card)."';\r\n";
		$configFile .= "\$cfg_httpSecureAccess = '"._RunMagicQuotes($cfg_httpSecureAccess)."';\r\n";
		$configFile .= "\$cfg_slb = '".(int)_RunMagicQuotes($cfg_slb)."';\r\n";
		$configFile .= "\$cfg_siteDebug = '"._RunMagicQuotes($cfg_siteDebug)."';\r\n";
		$configFile .= "\$cfg_memberCityid = '".(int)_RunMagicQuotes($cfg_memberCityid)."';\r\n";
		$configFile .= "\$cfg_sitePageGray = '".(int)_RunMagicQuotes($cfg_sitePageGray)."';\r\n";
		$configFile .= "\$cfg_vipAdvertising = '".(int)_RunMagicQuotes($cfg_vipAdvertising)."';\r\n";
		$configFile .= "\$cfg_vipAdvertising = '".(int)_RunMagicQuotes($cfg_vipAdvertising)."';\r\n";
		$configFile .= "\$cfg_kefu_pc_url = '"._RunMagicQuotes($cfg_kefu_pc_url)."';\r\n";
		$configFile .= "\$cfg_kefu_touch_url = '"._RunMagicQuotes($cfg_kefu_touch_url)."';\r\n";
		$configFile .= "\$cfg_kefuMiniProgram = '".(int)_RunMagicQuotes($cfg_kefuMiniProgram)."';\r\n";
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
		$configFile .= "\$cfg_waterZizhiText = '"._RunMagicQuotes($cfg_waterZizhiText)."';\r\n";
        $configFile .= "\$cfg_zizhiTextFontsize = ".(int)_RunMagicQuotes($cfg_zizhiTextFontsize).";\r\n";
        $configFile .= "\$cfg_zizhiTextTransparent = ".(int)_RunMagicQuotes($cfg_zizhiTextTransparent).";\r\n";
		$configFile .= "\$cfg_zizhiTextColor = '"._RunMagicQuotes($cfg_zizhiTextColor)."';\r\n";
		$configFile .= "\$markFontColor = '"._RunMagicQuotes($markFontColor)."';\r\n";
		$configFile .= "\$markFile = '"._RunMagicQuotes($markFile)."';\r\n";
		$configFile .= "\$markPadding = "._RunMagicQuotes($markPadding).";\r\n";
		$configFile .= "\$markTransparent = "._RunMagicQuotes($markTransparent).";\r\n";
		$configFile .= "\$markQuality = "._RunMagicQuotes($markQuality).";\r\n";

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
		$configFile .= "\$cfg_advMarkState = '"._RunMagicQuotes($cfg_advMarkState)."';\r\n";
		$configFile .= "\$cfg_advMarkPostion = '"._RunMagicQuotes($cfg_advMarkPostion)."';\r\n";

		//会员中心链接管理
		$configFile .= "\$cfg_ucenterLinks = '"._RunMagicQuotes($cfg_ucenterLinks)."';\r\n";

		//自然语言处理
		$configFile .= "\$cfg_nlp_AppID = '"._RunMagicQuotes($cfg_nlp_AppID)."';\r\n";
		$configFile .= "\$cfg_nlp_APIKey = '"._RunMagicQuotes($cfg_nlp_APIKey)."';\r\n";
		$configFile .= "\$cfg_nlp_Secret = '"._RunMagicQuotes($cfg_nlp_Secret)."';\r\n";

        //聚合数据接口
        $configFile .= "\$cfg_juhe = '".$cfg_juhe."';\r\n";
        $configFile .= "\$cfg_cardState = '".$cfg_cardState."';\r\n";
        $configFile .= "\$cfg_enterpriseBusinessDataState = '".$cfg_enterpriseBusinessDataState."';\r\n";

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
        $configFile .= "\$cfg_areaName_4 = '"._RunMagicQuotes($cfg_areaName_4)."';\r\n";
        $configFile .= "\$cfg_areaName_5 = '"._RunMagicQuotes($cfg_areaName_5)."';\r\n";

        //计划任务
        $configFile .= "\$cfg_cronType = ".(int)_RunMagicQuotes($cfg_cronType).";\r\n";

        //附件使用次数
        $configFile .= "\$cfg_record_attachment_count = ".(int)_RunMagicQuotes($cfg_record_attachment_count).";\r\n";

        //基本安全配置
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
		$configFile .= "\$cfg_maliciousSplider = '"._RunMagicQuotes($cfg_maliciousSplider)."';\r\n";
        $configFile .= "\$cfg_secure_domain = '"._RunMagicQuotes($cfg_secure_domain)."';\r\n";
		$configFile .= "\$cfg_regtype = '"._RunMagicQuotes($cfg_regtype)."';\r\n";
    	$configFile .= "\$cfg_regfields = '"._RunMagicQuotes($cfg_regfields)."';\r\n";
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

		//验证码
		$configFile .= "\$cfg_seccodestatus = '"._RunMagicQuotes($cfg_seccodestatus)."';\r\n";
		$configFile .= "\$cfg_seccodetype = "._RunMagicQuotes($cfg_seccodetype).";\r\n";
		$configFile .= "\$cfg_seccodewidth = "._RunMagicQuotes($cfg_seccodewidth).";\r\n";
		$configFile .= "\$cfg_seccodeheight = "._RunMagicQuotes($cfg_seccodeheight).";\r\n";
		$configFile .= "\$cfg_seccodefamily = '"._RunMagicQuotes($cfg_seccodefamily)."';\r\n";
		$configFile .= "\$cfg_scecodeangle = "._RunMagicQuotes($cfg_scecodeangle).";\r\n";
		$configFile .= "\$cfg_scecodewarping = "._RunMagicQuotes($cfg_scecodewarping).";\r\n";
		$configFile .= "\$cfg_scecodeshadow = "._RunMagicQuotes($cfg_scecodeshadow).";\r\n";
		$configFile .= "\$cfg_scecodeanimator = "._RunMagicQuotes($cfg_scecodeanimator).";\r\n";

		//安全问题
		$configFile .= "\$cfg_secqaastatus = '"._RunMagicQuotes($cfg_secqaastatus)."';\r\n";
		$configFile .= "\$cfg_filedelstatus = '".(int)_RunMagicQuotes($cfg_filedelstatus)."';\r\n";
        $configFile .= "\$cfg_memberstatus = '".(int)_RunMagicQuotes($cfg_memberstatus)."';\r\n";
        $configFile .= "\$cfg_cancellation_state = '".(int)_RunMagicQuotes($cfg_cancellation_state)."';\r\n";
        $configFile .= "\$cfg_iphome = '".(int)_RunMagicQuotes($cfg_iphome)."';\r\n";

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
}

//查看缓存目录大小
if($dopost == 'checkCacheFolderSize'){

    $s = getFolderSize(HUONIAOROOT . '/templates_c/caches/');
    $size = sizeFormat($s['size']);

    echo '{"state": 100, "size": "'.$size.'"}';
	die;
}

//配置参数
include HUONIAOINC.'/config/siteConfig.inc.php';

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
		'ui/jquery.tagsinput.css'
	);
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery.tagsinput.min.js',
		'publicUpload.js',
		'admin/siteConfig/siteConfig.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//基本设置
	$huoniaoTag->assign('basehost', $cfg_basehost);
	$huoniaoTag->assign('webname', $cfg_webname);
	$huoniaoTag->assign('shortname', $cfg_shortname);

    $weblogoArr = explode('attachment.php?f=', $cfg_weblogo);
    $weblogo = $weblogoArr[count($weblogoArr)-1];
	$huoniaoTag->assign('weblogo', $weblogo);

	$huoniaoTag->assign('sharePic', $cfg_sharePic);
	$huoniaoTag->assign('shareTitle', $cfg_shareTitle);
	$huoniaoTag->assign('shareDesc', $cfg_shareDesc);
	$huoniaoTag->assign('keywords', $cfg_keywords);
	$huoniaoTag->assign('description', $cfg_description);
	$huoniaoTag->assign('beian', $cfg_beian);
	$huoniaoTag->assign('hotline', $cfg_hotline);
	$huoniaoTag->assign('powerby', stripslashes($cfg_powerby));
	$huoniaoTag->assign('statisticscode', stripslashes($cfg_statisticscode));
	$huoniaoTag->assign('server_tel', $cfg_server_tel);
	$huoniaoTag->assign('server_qq', $cfg_server_qq);
	$huoniaoTag->assign('server_wx', $cfg_server_wx);
	$huoniaoTag->assign('server_wxQr', $cfg_server_wxQr);

    global $appRet;
	$huoniaoTag->assign('touchlogo', $cfg_touchlogo ? $cfg_touchlogo : ($appRet ? $appRet[0]['logo'] : ''));
	$huoniaoTag->assign('adminlogo', $cfg_adminlogo ? $cfg_adminlogo : '/static/images/admin/2.0/logo.png');

	$huoniaoTag->assign('businesslogo', $cfg_businesslogo ? $cfg_businesslogo : $cfg_secureAccess . $cfg_basehost . '/templates/member/company/images/index2/icon_title.png');
	$huoniaoTag->assign('adminBackgroundColor', $cfg_adminBackgroundColor ? $cfg_adminBackgroundColor : '#3275FA');

	//后台页面水印-单选
	$huoniaoTag->assign('adminWaterMark', array('0', '1'));
	$huoniaoTag->assign('adminWaterMarkNames',array('启用','禁用'));
	$huoniaoTag->assign('adminWaterMarkChecked', (int)$cfg_adminWaterMark);

	//网站状态-单选
	$huoniaoTag->assign('visitState', array('0', '1'));
	$huoniaoTag->assign('visitStateNames',array('启用','禁用'));
	$huoniaoTag->assign('visitStateChecked', $cfg_visitState);
	$huoniaoTag->assign('visitMessage', $cfg_visitMessage);

	//PC端状态-单选
	$huoniaoTag->assign('pcState', array('0', '1'));
	$huoniaoTag->assign('pcStateNames',array('启用','禁用'));
	$huoniaoTag->assign('pcStateChecked', (int)$cfg_pcState);

	//默认时区
	$timeZoneList = array(
		'-12' => '(标准时-12:00) 日界线西',
		'-11' => '(标准时-11:00) 中途岛、萨摩亚群岛',
		'-10' => '(标准时-10:00) 夏威夷',
		'-9' => '(标准时-9:00) 阿拉斯加',
		'-8' => '(标准时-8:00) 太平洋时间(美国和加拿大)',
		'-7' => '(标准时-7:00) 山地时间(美国和加拿大)',
		'-6' => '(标准时-6:00) 中部时间(美国和加拿大)、墨西哥城',
		'-5' => '(标准时-5:00) 东部时间(美国和加拿大)、波哥大',
		'-4' => '(标准时-4:00) 大西洋时间(加拿大)、加拉加斯',
		'-3.5' => '(标准时-3:30) 纽芬兰',
		'-3' => '(标准时-3:00) 巴西、布宜诺斯艾利斯、乔治敦',
		'-2' => '(标准时-2:00) 中大西洋',
		'-1' => '(标准时-1:00) 亚速尔群岛、佛得角群岛',
		'0' => '(格林尼治标准时) 西欧时间、伦敦、卡萨布兰卡',
		'1' => '(标准时+1:00) 中欧时间、安哥拉、利比亚',
		'2' => '(标准时+2:00) 东欧时间、开罗，雅典',
		'3' => '(标准时+3:00) 巴格达、科威特、莫斯科',
		'3.5' => '(标准时+3:30) 德黑兰',
		'4' => '(标准时+4:00) 阿布扎比、马斯喀特、巴库',
		'4.5' => '(标准时+4:30) 喀布尔',
		'5' => '(标准时+5:00) 叶卡捷琳堡、伊斯兰堡、卡拉奇',
		'5.5' => '(标准时+5:30) 孟买、加尔各答、新德里',
		'6' => '(标准时+6:00) 阿拉木图、 达卡、新亚伯利亚',
		'7' => '(标准时+7:00) 曼谷、河内、雅加达',
		'8' => '(北京时间) 北京、重庆、香港、新加坡',
		'9' => '(标准时+9:00) 东京、汉城、大阪、雅库茨克',
		'9.5' => '(标准时+9:30) 阿德莱德、达尔文',
		'10' => '(标准时+10:00) 悉尼、关岛',
		'11' => '(标准时+11:00) 马加丹、索罗门群岛',
		'12' => '(标准时+12:00) 奥克兰、惠灵顿、堪察加半岛'
	);
	$huoniaoTag->assign('timeZoneList', $timeZoneList);
	$huoniaoTag->assign('timeZone', $cfg_timeZone);
	$huoniaoTag->assign('mapCity', $cfg_mapCity);

	//地图配置
	$huoniaoTag->assign('mapList', array(2 => '百度', 4 => '高德', 5 => '天地图', 1 => '谷歌'));
	$huoniaoTag->assign('mapSelected', $cfg_map);

	$mapkeyhtml = array();
	$cla = "clearfix";
	if($cfg_map != 1) $cla .= " hide";
	array_push($mapkeyhtml, '<dl id="map1" class="'.$cla.'">
      <dt><label for="mapkey_google">谷歌地图API密钥：</label></dt>
      <dd><div class="input-prepend input-append"><input style="width: 360px;" type="text" name="mapkey_google" id="mapkey_google" value="'.$cfg_map_google.'" /><div class="btn-group"><a href="https://console.developers.google.com" class="btn" target="_blank">申请GoogleMap密钥 <i class="icon-share-alt"></i></a></div></div></dd>
    </dl>');
	$cla = "clearfix";
	if($cfg_map != 2) $cla .= " hide";
	array_push($mapkeyhtml, '<dl id="map2" class="'.$cla.'">
      <dt><label for="mapkey_baidu">百度地图ak：</label></dt>
      <dd><div class="input-prepend input-append"><span class="add-on">浏览器端：</span><input style="width: 360px;" type="text" name="mapkey_baidu" id="mapkey_baidu" value="'.$cfg_map_baidu.'" /><div class="btn-group"><a href="http://lbsyun.baidu.com/apiconsole/key?application=key" class="btn" target="_blank">申请BaiduMap AK <i class="icon-share-alt"></i></a></div></div><br /><div class="input-prepend input-append"><span class="add-on">服 务 端 ：</span><input style="width: 360px;" type="text" name="mapkey_baidu_server" id="mapkey_baidu_server" value="'.$cfg_map_baidu_server.'" /><div class="btn-group"><a href="http://lbsyun.baidu.com/apiconsole/key?application=key" class="btn" target="_blank">申请BaiduMap AK <i class="icon-share-alt"></i></a></div></div></dd>
    </dl>');
	$cla = "clearfix";
	if($cfg_map != 3) $cla .= " hide";
	array_push($mapkeyhtml, '<dl id="map3" class="'.$cla.'">
      <dt><label for="mapkey_qq">腾迅地图API密钥：</label></dt>
      <dd><div class="input-prepend input-append"><input style="width: 360px;" type="text" name="mapkey_qq" id="mapkey_qq" value="'.$cfg_map_qq.'" /><div class="btn-group"><a href="http://lbs.qq.com/console/mykey.html" class="btn" target="_blank">申请腾迅地图密钥 <i class="icon-share-alt"></i></a></div></div></dd>
    </dl>');
    $cla = "clearfix";
	if($cfg_map != 4) $cla .= " hide";
	array_push($mapkeyhtml, '<dl id="map4" class="'.$cla.'">
      <dt><label for="mapkey_amap">高德地图API密钥：</label></dt>
      <dd><div class="input-prepend input-append"><span class="add-on">Web端(JS API) Key：</span><input style="width: 360px;" type="text" name="mapkey_amap" id="mapkey_amap" value="'.$cfg_map_amap.'" /><div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div></div><br /><div class="input-prepend input-append"><span class="add-on">Web端(JS API) 安全密钥：</span><input style="width: 360px;" type="text" name="mapkey_amap_jscode" id="mapkey_amap_jscode" value="'.$cfg_map_amap_jscode.'" /><div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div></div><br /><div class="input-prepend input-append"><span class="add-on">Web服务：</span><input style="width: 360px;" type="text" name="mapkey_amap_server" id="mapkey_amap_server" value="'.$cfg_map_amap_server.'" /><div class="btn-group"><a href="http://lbs.amap.com/dev/key/app" class="btn" target="_blank">申请高德地图密钥 <i class="icon-share-alt"></i></a></div></div></dd>
    </dl>');
    $cla = "clearfix";
	if($cfg_map != 5) $cla .= " hide";
	array_push($mapkeyhtml, '<dl id="map5" class="'.$cla.'">
      <dt><label for="mapkey_amap">天地图API密钥：</label></dt>
      <dd><p><code>此地图解析精度最多到区级，无法精确到乡镇，如果使用了外卖、团购和商城的平台配送功能，请使用百度或者高德地图，否则将影响功能使用！</code></p><div class="input-prepend input-append"><span class="add-on">浏览器端 Key：</span><input style="width: 360px;" type="text" name="mapkey_tmap" id="mapkey_tmap" value="'.$cfg_map_tmap.'" /><div class="btn-group"><a href="https://console.tianditu.gov.cn/api/key" class="btn" target="_blank">申请天地图密钥 <i class="icon-share-alt"></i></a></div></div><br /><div class="input-prepend input-append"><span class="add-on">服务器端 Key：</span><input style="width: 360px;" type="text" name="mapkey_tmap_server" id="mapkey_tmap_server" value="'.$cfg_map_tmap_server.'" /><div class="btn-group"><a href="https://console.tianditu.gov.cn/api/key" class="btn" target="_blank">申请天地图密钥 <i class="icon-share-alt"></i></a></div></div></dd>
    </dl>');
	$huoniaoTag->assign('mapkey', join("", $mapkeyhtml));

	$huoniaoTag->assign('weatherCity', $cfg_weatherCity);

	//在线用户时限
	$huoniaoTag->assign('onlinetime', $cfg_onlinetime);
	//cookie设置
	$huoniaoTag->assign('cookiePath', $cfg_cookiePath);
	$huoniaoTag->assign('cookieDomain', $cfg_cookieDomain);
	$huoniaoTag->assign('cookiePre', $cfg_cookiePre);
	$huoniaoTag->assign('cache_lifetime', $cfg_cache_lifetime);


	//多语言
	$lang_dir = HUONIAOINC . '/lang/';
	$floders = listDir($lang_dir);
	$langName = array();
	$langValue = array();
	if(!empty($floders)){
		$i = 0;
		foreach($floders as $key => $floder){
			$config = $lang_dir.'/'.$floder.'/config.xml';
			if(file_exists($config)){
				//解析xml配置文件
				$xml = new DOMDocument();
				libxml_disable_entity_loader(false);
				$xml->load($config);
				$data = $xml->getElementsByTagName('Data')->item(0);
				$name = $data->getElementsByTagName("name")->item(0)->nodeValue;

				$langName[$i] = $name;
				$langValue[$i] = $floder;
				$i++;
			}
		}
	}
	$huoniaoTag->assign('langName', $langName);
	$huoniaoTag->assign('langValue', $langValue);
	$huoniaoTag->assign('langSelected', $cfg_lang);


	//搜索引擎抓取首页规则
	$huoniaoTag->assign('spiderIndexState', array('0', '1'));
	$huoniaoTag->assign('spiderIndexStateNames',array('切换城市页', '系统默认'));
	$huoniaoTag->assign('spiderIndexStateChecked', (int)$cfg_spiderIndex);


	//开启伪静态
	$huoniaoTag->assign('urlRewriteState', array('0', '1'));
	$huoniaoTag->assign('urlRewriteStateNames',array('关闭','开启'));
	$huoniaoTag->assign('urlRewriteStateChecked', $cfg_urlRewrite);

	//远程附件
	$huoniaoTag->assign('remoteStatic', $cfg_remoteStatic);

	//附件路径存储方式
	$huoniaoTag->assign('hideUrlState', array('0', '1'));
	$huoniaoTag->assign('hideUrlStateNames',array('默认[便于转移]','性能优先'));
	$huoniaoTag->assign('hideUrlStateChecked', (int)$cfg_hideUrl);

	//第三方登录必须绑定手机
	$huoniaoTag->assign('bindMobileState', array('0', '1'));
	$huoniaoTag->assign('bindMobileStateNames',array('关闭', '开启'));
	$huoniaoTag->assign('bindMobileStateChecked', (int)$cfg_bindMobile);

	//个人会员中心卡片
    $huoniaoTag->assign("member_card_state",array('0','1'));
    $huoniaoTag->assign('member_card_names',array('默认关闭', '默认开启'));
    $huoniaoTag->assign('member_card_state_checked', (int)$cfg_member_card);

	//https安全访问
	$huoniaoTag->assign('httpSecureAccessState', array('0', '1'));
	$huoniaoTag->assign('httpSecureAccessStateNames',array('关闭', '开启'));
	$huoniaoTag->assign('httpSecureAccessStateChecked', (int)$cfg_httpSecureAccess);

	//负载均衡
	$huoniaoTag->assign('slbState', array('0', '1'));
	$huoniaoTag->assign('slbStateNames',array('关闭', '开启'));
	$huoniaoTag->assign('slbStateChecked', (int)$cfg_slb);

	//调试模式
	$huoniaoTag->assign('siteDebugState', array('0', '1'));
	$huoniaoTag->assign('siteDebugStateNames',array('关闭', '开启'));
	$huoniaoTag->assign('siteDebugStateChecked', (int)$cfg_siteDebug);

	//会员分站状态
	$huoniaoTag->assign('memberCityidState', array('0', '1'));
	$huoniaoTag->assign('memberCityidStateNames',array('手动更新', '自动更新'));
	$huoniaoTag->assign('memberCityidStateChecked', (int)$cfg_memberCityid);

	//页面变灰
	$huoniaoTag->assign('sitePageGray', array('0', '1', '2'));
	$huoniaoTag->assign('sitePageGrayNames',array('关闭', '首页变灰', '全站变灰'));
	$huoniaoTag->assign('sitePageGrayChecked', (int)$cfg_sitePageGray);

    //幻灯片vip广告
    $huoniaoTag->assign('vipAdvertising', array('0', '1'));
    $huoniaoTag->assign('vipAdvertisingNames',array('关闭', '开启'));
    $huoniaoTag->assign('vipAdvertisingChecked', (int)$cfg_vipAdvertising);

	//客服
	$huoniaoTag->assign('kefu_pc_url', $cfg_kefu_pc_url);
	$huoniaoTag->assign('kefu_touch_url', $cfg_kefu_touch_url);

	$huoniaoTag->assign('kefuMiniProgram', array('0', '1'));
	$huoniaoTag->assign('kefuMiniProgramNames',array('不支持', '支持'));
	$huoniaoTag->assign('kefuMiniProgramChecked', (int)$cfg_kefuMiniProgram);

	//模板风格
	$floders = listDir($dir);
	$skins = array();
	if(!empty($floders)){
		$i = 0;
		foreach($floders as $key => $floder){
			$config = $dir.'/'.$floder.'/config.xml';
			if(file_exists($config)){
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
	$huoniaoTag->assign('tplList', $skins);
	$huoniaoTag->assign('template', $cfg_template);

	//touch模板
	$floders = listDir($dir.'/touch');
	$skins = array(
		array('tplname' => 'diy', 'directory' => 'diy', 'copyright' => '火鸟门户')
    );
	if(!empty($floders)){
		$i = 1;
		foreach($floders as $key => $floder){
			$config = $dir.'/touch/'.$floder.'/config.xml';
			if(file_exists($config)){
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
	$huoniaoTag->assign('touchTemplate', $cfg_touchTemplate);
	$huoniaoTag->assign('userCenterTouchTemplateType', (int)$cfg_userCenterTouchTemplateType);
	$huoniaoTag->assign('busiCenterTouchTemplateType', (int)$cfg_busiCenterTouchTemplateType);


	//上传设置
	$huoniaoTag->assign('uploadDir', $cfg_uploadDir);
	$huoniaoTag->assign('softSize', $cfg_softSize);
	$huoniaoTag->assign('softType', $cfg_softType);
	$huoniaoTag->assign('thumbSize', $cfg_thumbSize);
	$huoniaoTag->assign('thumbType_', $cfg_thumbType);
	$huoniaoTag->assign('atlasSize', $cfg_atlasSize);
	$huoniaoTag->assign('atlasType', $cfg_atlasType);
	$huoniaoTag->assign('editorSize', $cfg_editorSize);
	$huoniaoTag->assign('editorType', $cfg_editorType);
	$huoniaoTag->assign('photoSize', $cfg_photoSize);
	$huoniaoTag->assign('photoType_', $cfg_photoType);
	$huoniaoTag->assign('flashSize', $cfg_flashSize);
	$huoniaoTag->assign('audioSize', $cfg_audioSize);
	$huoniaoTag->assign('audioType_', $cfg_audioType);
	$huoniaoTag->assign('fastUpload', $cfg_fastUpload ?? 0);
	$huoniaoTag->assign('imageCompress', $cfg_imageCompress ?? 1);
	$huoniaoTag->assign('videoUploadState', $cfg_videoUploadState ?? 1);
	$huoniaoTag->assign('videoCompress', $cfg_videoCompress ?? 1);
	$huoniaoTag->assign('videoSize', $cfg_videoSize);
	$huoniaoTag->assign('videoType_', $cfg_videoType);
	$huoniaoTag->assign('thumbSmallWidth', $cfg_thumbSmallWidth);
	$huoniaoTag->assign('thumbSmallHeight', $cfg_thumbSmallHeight);
	$huoniaoTag->assign('thumbMiddleWidth', $cfg_thumbMiddleWidth);
	$huoniaoTag->assign('thumbMiddleHeight', $cfg_thumbMiddleHeight);
	$huoniaoTag->assign('thumbLargeWidth', $cfg_thumbLargeWidth);
	$huoniaoTag->assign('thumbLargeHeight', $cfg_thumbLargeHeight);
	$huoniaoTag->assign('atlasSmallWidth', $cfg_atlasSmallWidth);
	$huoniaoTag->assign('atlasSmallHeight', $cfg_atlasSmallHeight);
	$huoniaoTag->assign('photoSmallWidth', $cfg_photoSmallWidth);
	$huoniaoTag->assign('photoSmallHeight', $cfg_photoSmallHeight);
	$huoniaoTag->assign('photoMiddleWidth', $cfg_photoMiddleWidth);
	$huoniaoTag->assign('photoMiddleHeight', $cfg_photoMiddleHeight);
	$huoniaoTag->assign('photoLargeWidth', $cfg_photoLargeWidth);
	$huoniaoTag->assign('photoLargeHeight', $cfg_photoLargeHeight);
	$huoniaoTag->assign('meditorPicWidth', $cfg_meditorPicWidth);
	$huoniaoTag->assign('photoCutType', $cfg_photoCutType);
	$huoniaoTag->assign('photoCutPostion', $cfg_photoCutPostion);
	$huoniaoTag->assign('quality', $cfg_quality);

	//远程附件
	$huoniaoTag->assign('ftpType', array('0', '1','2','3','4'));
	$huoniaoTag->assign('ftpTypeNames',array('普通FTP模式','阿里云OSS','七牛云','华为云OBS','腾讯云COS'));
	$huoniaoTag->assign('ftpTypeChecked', (int)$cfg_ftpType);

	$huoniaoTag->assign('ftpStateType', array('0', '1'));
	$huoniaoTag->assign('ftpStateNames',array('否','是'));
	$huoniaoTag->assign('ftpStateChecked', $cfg_ftpState);

	$huoniaoTag->assign('ftpSSL', array('0', '1'));
	$huoniaoTag->assign('ftpSSLNames',array('否','是'));
	$huoniaoTag->assign('ftpSSLChecked', $cfg_ftpSSL);

	$huoniaoTag->assign('ftpPasv', array('0', '1'));
	$huoniaoTag->assign('ftpPasvNames',array('否','是'));
	$huoniaoTag->assign('ftpPasvChecked', $cfg_ftpPasv);

	$huoniaoTag->assign('ftpUrl', $cfg_ftpUrl);
	$huoniaoTag->assign('ftpServer', $cfg_ftpServer);
	$huoniaoTag->assign('ftpPort', $cfg_ftpPort);
	$huoniaoTag->assign('ftpDir', $cfg_ftpDir);
	$huoniaoTag->assign('ftpUser', $cfg_ftpUser);
	$huoniaoTag->assign('ftpPwd', $cfg_ftpPwd);
	$huoniaoTag->assign('ftpTimeout', $cfg_ftpTimeout);
	$huoniaoTag->assign('OSSUrl', $cfg_OSSUrl);
	$huoniaoTag->assign('OSSBucket', $cfg_OSSBucket);
	$huoniaoTag->assign('EndPoint', $cfg_EndPoint);
	$huoniaoTag->assign('OSSKeyID', $cfg_OSSKeyID);
	$huoniaoTag->assign('OSSKeySecret', $cfg_OSSKeySecret);
    $huoniaoTag->assign('access_key', $cfg_QINIUAccessKey);
    $huoniaoTag->assign('secret_key', $cfg_QINIUSecretKey);
    $huoniaoTag->assign('bucket', $cfg_QINIUbucket);
    $huoniaoTag->assign('domain', $cfg_QINIUdomain);
	$huoniaoTag->assign('OBSUrl', $cfg_OBSUrl);
	$huoniaoTag->assign('OBSBucket', $cfg_OBSBucket);
	$huoniaoTag->assign('OBSEndpoint', $cfg_OBSEndpoint);
	$huoniaoTag->assign('OBSKeyID', $cfg_OBSKeyID);
	$huoniaoTag->assign('OBSKeySecret', $cfg_OBSKeySecret);
	$huoniaoTag->assign('COSUrl', $cfg_COSUrl);
	$huoniaoTag->assign('COSBucket', $cfg_COSBucket);
	$huoniaoTag->assign('COSRegion', $cfg_COSRegion);
	$huoniaoTag->assign('COSSecretid', $cfg_COSSecretid);
	$huoniaoTag->assign('COSSecretkey', $cfg_COSSecretkey);

	//统一管理
	$huoniaoTag->assign('remoteFtpUnify', array('0', '1'));
	$huoniaoTag->assign('remoteFtpUnifyNames',array('关闭','开启'));
	$huoniaoTag->assign('remoteFtpUnifyChecked', (int)$cfg_remoteFtpUnify);

	//ffmpeg
	$huoniaoTag->assign('ffmpeg', array('0', '1'));
	$huoniaoTag->assign('ffmpegNames',array('关闭','开启'));
	$huoniaoTag->assign('ffmpegChecked', (int)$cfg_ffmpeg);


	//水印设置
	$huoniaoTag->assign('thumbMarkState', array('0', '1'));
	$huoniaoTag->assign('thumbMarkStateNames',array('关闭','开启'));
	$huoniaoTag->assign('thumbMarkStateChecked', $thumbMarkState);

	$huoniaoTag->assign('atlasMarkState', array('0', '1'));
	$huoniaoTag->assign('atlasMarkStateNames',array('关闭','开启'));
	$huoniaoTag->assign('atlasMarkStateChecked', $atlasMarkState);

	$huoniaoTag->assign('editorMarkState', array('0', '1'));
	$huoniaoTag->assign('editorMarkStateNames',array('关闭','开启'));
	$huoniaoTag->assign('editorMarkStateChecked', $editorMarkState);

	$huoniaoTag->assign('waterMarkWidth', $waterMarkWidth);
	$huoniaoTag->assign('waterMarkHeight', $waterMarkHeight);
	$huoniaoTag->assign('waterMarkPostion', $waterMarkPostion);
	//水印类型-单选
	$huoniaoTag->assign('waterMarkType', array('1', '2', '3'));
	$huoniaoTag->assign('waterMarkTypeNames',array('文字','PNG图片','GIF图片'));
	$huoniaoTag->assign('waterMarkTypeChecked', $waterMarkType);
	$huoniaoTag->assign('markText', $waterMarkText);
	$huoniaoTag->assign('zizhiText', $cfg_waterZizhiText);

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
			$huoniaoTag->assign('markFontfamily', $fileArray);
			$huoniaoTag->assign('markFontfamilySelected', $markFontfamily);
		}
	}

	$huoniaoTag->assign('markFontsize', $markFontsize);
	$huoniaoTag->assign('zizhiTextFontsize', $cfg_zizhiTextFontsize);
	$huoniaoTag->assign('zizhiTextTransparent', $cfg_zizhiTextTransparent);
	$huoniaoTag->assign('markFontColor', $markFontColor);
	$huoniaoTag->assign('zizhiTextColor', $cfg_zizhiTextColor);

	//水印图片
	$markFloder = HUONIAOINC."/data/mark/";
	if(is_dir($markFloder)){
		if ($file = opendir($markFloder)){
			$fileArray = array();
			while ($f = readdir($file)){
				if($f != '.' && $f != '..'){
					array_push($fileArray, $f);
				}
			}
			//字体文件-下拉菜单
			$huoniaoTag->assign('markFile', $fileArray);
			$huoniaoTag->assign('markFileSelected', $markFile);
		}
	}

	$huoniaoTag->assign('markPadding', $markPadding);
	$huoniaoTag->assign('transparent', $markTransparent);
	$huoniaoTag->assign('markQuality', $markQuality);

	//计量单位
	$huoniaoTag->assign('currency_name', $currency_name ? $currency_name : "人民币");
	$huoniaoTag->assign('currency_short', $currency_short ? $currency_short : "元");
	$huoniaoTag->assign('currency_symbol', $currency_symbol ? $currency_symbol : "¥");
	$huoniaoTag->assign('currency_code', $currency_code ? $currency_code : "RMB");
	$huoniaoTag->assign('currency_rate', $currency_rate ? $currency_rate : "1");

    $huoniaoTag->assign('currency_areaname', $currency_areaname ? $currency_areaname : "平方米");
    $huoniaoTag->assign('currency_areasymbol', $currency_areasymbol ? $currency_areasymbol : "㎡");


    //广告设置
	$huoniaoTag->assign('advMarkState', array('0', '1'));
	$huoniaoTag->assign('advMarkStateNames',array('关闭','开启'));
	$huoniaoTag->assign('advMarkStateChecked', (int)$cfg_advMarkState);
	$huoniaoTag->assign('advMarkPostion', (int)$cfg_advMarkPostion);

	//身份证设置
    $huoniaoTag->assign('cardState', array('0', '1'));
    $huoniaoTag->assign('cardStateNames',array('关闭', '开启'));
    $huoniaoTag->assign('cardStateChecked', (int)$cfg_cardState);

    //企业工商信息
    $huoniaoTag->assign('enterpriseBusinessDataState', array('0', '1'));
    $huoniaoTag->assign('getEnterpriseBusinessDataNames',array('关闭', '开启'));
    $huoniaoTag->assign('getEnterpriseBusinessDataChecked', (int)$cfg_enterpriseBusinessDataState);

	//会员中心链接管理
	$huoniaoTag->assign('ucenterLinks', explode(',', $cfg_ucenterLinks));

	//自然语言处理
	$huoniaoTag->assign('nlp_AppID', $cfg_nlp_AppID);
	$huoniaoTag->assign('nlp_APIKey', $cfg_nlp_APIKey);
	$huoniaoTag->assign('nlp_Secret', $cfg_nlp_Secret);

    //聚合数据接口
    $huoniaoTag->assign('juhe', $cfg_juhe ? unserialize($cfg_juhe) : array());

	//即时通讯接口
	$huoniaoTag->assign('km_accesskey_id', $cfg_km_accesskey_id);
	$huoniaoTag->assign('km_accesskey_secret', $cfg_km_accesskey_secret);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
