<?php
/**
 * 商城频道配置
 *
 * @version        $Id: shopConfig.php 2014-1-24 上午00:02:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("shopConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopConfig.html";

$action = $action == "" ? "shop" : $action;
$dir = "../../templates/" . $action; //当前目录

//删除模板文件夹
if ($action == "delTpl") {
    if ($token == "") die('token传递失败！');
    if ($dopost == "") die('参数传递失败！');

    if (empty($floder)) die('请选择要删除的模板！');

    $dir = "../../templates/" . $dopost; //当前目录
    $floder = $dir . "/" . iconv('utf-8', 'gbk', $floder);
    $deldir = deldir($floder);
    if ($deldir) {
        adminLog("修改商城设置", "删除模板：" . $floder);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    } else {
        echo '{"state": 200, "info": ' . json_encode("删除失败！") . '}';
    }
    die;
}

//频道配置参数
include(HUONIAOINC . "/config/" . $action . ".inc.php");

$pageTypeConfigNames = array('到店优惠', '送到家', '商家');

//异步提交
if ($type != "") {
    if ($token == "") die('token传递失败！');

    if ($type == "site") {
        //基本设置
        $customChannelName = $channelname;
        $customLogo             = $articleLogo;
        $customLogoUrl          = $litpic;
        $customSharePic         = $sharePic;
        $customSubDomain        = $subdomain;
        $customChannelDomain    = $channeldomain;
        $customChannelSwitch    = $channelswitch;
        $customCloseCause       = $closecause;
        $customCommentCheck     = (int)$commentCheck;
        $customFabuCheck        = (int)$fabuCheck;
        $customshopbranchCheck  = (int)$shopbranchCheck;
        $customtuanTag          = $tuanTag;
        $customJoinCheck        = (int)$joinCheck;
        $customEditJoinCheck    = (int)$editJoinCheck;
        $customfenXiao          = $fenXiao;
//        $customshopPeisongState         = $shopPeisongState;
        $customshopPeisongState         = 1;
        // $custom_huodongshoptypeopen     = (int)$huodongshoptype;
        $customtuikuanday       = $tuikuanday;
        $customclosetuikuanday  = $closetuikuanday;
        $customfabuShopPromotion = (float)$fabuShopPromotion;
        $custompeerpay          = (int)$peerpay;
        $customconfirmDay       = $confirmDay;
        $customhuodongFabuCheck = $huodongfabuCheck;


        //seo设置
        $customSeoTitle = $title;
        $customSeoKeyword = $keywords;
        $customSeoDescription = $description;
        $hotline_config = $hotline_rad;
        $customHotline = $hotline;
        $customAtlasMax = (int)$atlasMax;
		$customDataShare       = (int)$dataShareSwtich;

        //自动派单
        $custom_autoDispatchJuli = $autoDispatchJuli;
        $custom_autoDispatchCount = $autoDispatchCount;

        $custom_shopquanopen = is_array($shopquanopen) && $shopquanopen ? join(',',$shopquanopen) : '' ;

        if ($customChannelName == "" || $customLogo == "" || $customChannelDomain == "")
            die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');

        //验证域名是否被使用
        if (!operaDomain('check', $customChannelDomain, $action, 'config'))
            die('{"state": 200, "info": ' . json_encode("域名已被占用，请重试！") . '}');

        adminLog("修改商城设置", "基本设置");

    }
    //首页显示
    elseif($type == 'display'){

        //活动商品
        $custom_huodongshopopen = is_array($huodongshopopen) && $huodongshopopen ? join(',',$huodongshopopen) : '' ;

        $custom_shopopen = is_array($shopopen) && $shopopen ? join(',',$shopopen) : '' ;
        $customshopCheck = (int)$shopCheck;

        //页面显示配置
        $huodongshoptypeopen = array();
        $_pageTypeConfig = array();
        if($pageTypeConfig && is_array($pageTypeConfig)){
            foreach($pageTypeConfig['sid'] as $key=>$val){
                array_push($_pageTypeConfig, array(
                    'id' => (int)$val, 
                    'name' => $pageTypeConfigNames[$val-1], 
                    'title' => $pageTypeConfig['title'][$key] ?: $pageTypeConfigNames[$val-1], 
                    'show' => (int)$pageTypeConfig['show'][$key]
                ));

                if($val == 1 && $pageTypeConfig['show'][$key]){
                    array_push($huodongshoptypeopen, 1);
                }
                if($val == 2 && $pageTypeConfig['show'][$key]){
                    array_push($huodongshoptypeopen, 2);
                }
            }
        }
        $custom_pageTypeConfig = json_encode($_pageTypeConfig, JSON_UNESCAPED_UNICODE);

        //根据显示配置判断huodongshoptypeopen的值
        //到店优惠和送到家都勾选表示混合
        sort($huodongshoptypeopen);
        $_huodongshoptypeopen = join(',', $huodongshoptypeopen);
        if($_huodongshoptypeopen == '1,2'){
            $custom_huodongshoptypeopen = 0; //混合
        }elseif($_huodongshoptypeopen == '1'){
            $custom_huodongshoptypeopen = 1; //到店优惠
        }elseif($_huodongshoptypeopen == '2'){
            $custom_huodongshoptypeopen = 2; //送到家
        }else{
            die('{"state": 200, "info": ' . json_encode("显示设置中【到店优惠】和【送到家】至少开启一个！") . '}');
        }

        //判断销售类型
        $custom_saleType = is_array($saleType) && $saleType ? join(',',$saleType) : '' ;

        //到店优惠类型必须选择到店消费
        if(($custom_huodongshoptypeopen == 0 || $custom_huodongshoptypeopen == 1) && !in_array(1, $saleType)){
            die('{"state": 200, "info": ' . json_encode("显示设置中开启【到店优惠】后，销售类型必须勾选【到店消费】！") . '}');
        }

        //送到家类型必须选择商家自配或者快递
        if(($custom_huodongshoptypeopen == 0 || $custom_huodongshoptypeopen == 2) && !in_array(3, $saleType) && !in_array(4, $saleType)){
            die('{"state": 200, "info": ' . json_encode("显示设置中开启【送到家】后，销售类型的【商家自配】和【快递】至少选择一项！") . '}');
        }

        //如果只启用了送到家，则到店消费的选项强制取消
        if($custom_huodongshoptypeopen == 2){
            $saleType = array_diff($saleType, [1]);
            $custom_saleType = join(',', $saleType);
        }

        //如果只启用了到店优惠，则商家自配和快递的选项强制取消
        if($custom_huodongshoptypeopen == 1){
            $saleType = array_diff($saleType, [3, 4]);
            $custom_saleType = join(',', $saleType);
        }


        adminLog("修改商城设置", "首页显示设置");

    
    }
    //审核开关
    elseif($type == 'switch'){

        $customJoinCheck = isset($joinCheck) ? (int)$joinCheck : $customJoinCheck;
        $customFabuCheck = isset($fabuCheck) ? (int)$fabuCheck : $customFabuCheck;

        adminLog("修改商城设置", "快速设置审核开关");

    }
    //平台配送异常配置
    elseif($type == 'delivery'){

        $customPlatformDeliveryValue = (int)$deliveryValue;  //平台配送订单配送超过多少提醒
        $customPlatformDeliveryType = (int)$deliveryType;  //0小时  1天

        adminLog("修改商城设置", "快速设置平台配送异常规则");

    }
    //订单异常提醒配置
    elseif($type == 'exception'){

        $customDeliveryValue = (int)$deliveryValue;  //订单超过多少未发货
        $customDeliveryType = (int)$deliveryType;  //0小时  1天
        $customIncompleteValue = (int)$incompleteValue;  //订单超过多少未完成
        $customIncompleteType = (int)$incompleteType;  //0小时  1天

        adminLog("修改商城设置", "快速设置订单异常提醒规则");


    }
    //活动促销设置
    elseif($type == 'huodong'){

        $custom_huodongopen = is_array($huodongopen) && $huodongopen ? join(',',$huodongopen) : '' ;  //活动开启
        $customhuodongygtime = (int)$huodongygtime;  //活动预告时限，在距离准点抢购和特价秒杀活动开始前的几个小时内，页面显示活动倒计时。
        $customshopbargainingnomoney = (int)$shopbargainingnomoney;  //未到底价，0可以下单  1不可以下单
        $customselfbargain = (int)$selfbargain;  //自己砍价，0禁止  1允许
        $custombargaintime = (int)$bargaintime;  //砍价时限，买家发起砍价后，最多可以在几个小时内让别人砍价，超过设置的时间，将不可以再继续砍价。
        $customhelpbargain = (int)$helpbargain;  //帮砍次数，用户每天最多可以帮别人砍价的次数。
        $custom_shopKanjiaGuize = $KanjiaGuize;  //砍价规则

        adminLog("修改商城设置", "设置活动促销规则");


        //单独配置域名
    } elseif ($type == "domain") {

        $customSubDomain = $subdomain;
        $customChannelDomain = $channeldomain;

    } elseif ($type == "temp") {

        //模板风格
        $customRouter = (int)$router;
        $customTemplate = $articleTemplate;
        $customTouchRouter = (int)$touchRouter;
        $customTouchTemplate = $touchTemplate;

        adminLog("修改商城设置", "模板风格");

    } elseif ($type == "imagesearch") {

        //模板风格
        $imagesearch_AppID = $_POST['imagesearch_AppID'];
        $imagesearch_APIKey = $_POST['imagesearch_APIKey'];
        $imagesearch_Secret = $_POST['imagesearch_Secret'];

        adminLog("修改商城设置", "图像搜索接口");

    } elseif ($type == "upload") {

        //上传设置
        $customUpload = $articleUpload;

        //自定义
        if ($customUpload == 1) {
            $custom_uploadDir = str_replace('.', '', $uploadDir);
            $custom_softSize = $softSize;
            $custom_softType = $softType;
            $custom_thumbSize = $thumbSize;
            $custom_thumbType = $thumbType;
            $custom_atlasSize = $atlasSize;
            $custom_atlasType = $atlasType;
            $custom_thumbSmallWidth = $thumbSmallWidth;
            $custom_thumbSmallHeight = $thumbSmallHeight;
            $custom_thumbMiddleWidth = $thumbMiddleWidth;
            $custom_thumbMiddleHeight = $thumbMiddleHeight;
            $custom_thumbLargeWidth = $thumbLargeWidth;
            $custom_thumbLargeHeight = $thumbLargeHeight;
            $custom_atlasSmallWidth = $atlasSmallWidth;
            $custom_atlasSmallHeight = $atlasSmallHeight;
            $custom_photoCutType = $photoCutType;
            $custom_photoCutPostion = $photoCutPostion;
            $custom_quality = $quality;

            $custom_softSize = $custom_softSize == "" ? 10240 : $custom_softSize;
            $custom_thumbSize = $custom_thumbSize == "" ? 1024 : $custom_thumbSize;
            $custom_atlasSize = $custom_atlasSize == "" ? 2048 : $custom_atlasSize;
            $custom_thumbSmallWidth = $custom_thumbSmallWidth == "" ? 104 : $custom_thumbSmallWidth;
            $custom_thumbSmallHeight = $custom_thumbSmallHeight == "" ? 80 : $custom_thumbSmallHeight;
            $custom_thumbMiddleWidth = $custom_thumbMiddleWidth == "" ? 240 : $custom_thumbMiddleWidth;
            $custom_thumbMiddleHeight = $custom_thumbMiddleHeight == "" ? 180 : $custom_thumbMiddleHeight;
            $custom_thumbLargeWidth = $custom_thumbLargeWidth == "" ? 400 : $custom_thumbLargeWidth;
            $custom_thumbLargeHeight = $custom_thumbLargeHeight == "" ? 300 : $custom_thumbLargeHeight;
            $custom_atlasSmallWidth = $custom_atlasSmallWidth == "" ? 115 : $custom_atlasSmallWidth;
            $custom_atlasSmallHeight = $custom_atlasSmallHeight == "" ? 75 : $custom_atlasSmallHeight;
            $custom_quality = $custom_quality == "" ? 90 : $custom_quality;

            if ($custom_uploadDir == "" || $custom_softType == "" || $custom_thumbType == "" || $custom_atlasType == "")
                die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
        }

        adminLog("修改商城设置", "上传设置");

    } elseif ($type == "ftp") {

        //远程附件
        $customFtp = $articleFtp;

        //自定义
        if ($customFtp == 1) {
            $custom_ftpState = $ftpStateType;
            $custom_ftpType = $ftpType;
            $custom_ftpSSL = $ftpSSL;
            $custom_ftpPasv = $ftpPasv;
            $custom_ftpUrl = $ftpUrl;
            $custom_ftpServer = $ftpServer;
            $custom_ftpPort = $ftpPort;
            $custom_ftpDir = $ftpDir;
            $custom_ftpUser = $ftpUser;
            $custom_ftpPwd = $ftpPwd;
            $custom_ftpTimeout = $ftpTimeout;
            $custom_OSSUrl = $OSSUrl;
            $custom_OSSBucket = $OSSBucket;
            $custom_EndPoint = $EndPoint;
            $custom_OSSKeyID = $OSSKeyID;
            $custom_OSSKeySecret = $OSSKeySecret;
            $custom_QINIUAccessKey = $access_key;
            $custom_QINIUSecretKey = $secret_key;
            $custom_QINIUbucket = $bucket;
            $custom_QINIUdomain = $domain;
			$custom_OBSUrl         = $OBSUrl;
			$custom_OBSBucket      = $OBSBucket;
			$custom_OBSEndpoint    = $OBSEndpoint;
			$custom_OBSKeyID       = $OBSKeyID;
			$custom_OBSKeySecret   = $OBSKeySecret;
			$custom_COSUrl         = $COSUrl;
			$custom_COSBucket      = $COSBucket;
			$custom_COSRegion      = $COSRegion;
			$custom_COSSecretid    = $COSSecretid;
			$custom_COSSecretkey   = $COSSecretkey;

            $custom_ftpState = $custom_ftpState == "" ? 0 : $custom_ftpState;
            $custom_ftpType = $custom_ftpType == "" ? 0 : $custom_ftpType;
            $custom_ftpSSL = $custom_ftpSSL == "" ? 0 : $custom_ftpSSL;
            $custom_ftpPasv = $custom_ftpPasv == "" ? 0 : $custom_ftpPasv;
            $custom_ftpPort = $custom_ftpPort == "" ? 21 : $custom_ftpPort;
            $custom_ftpTimeout = $custom_ftpTimeout == "" ? 0 : $custom_ftpTimeout;

            if ($custom_ftpType == 1) {
                if ($custom_OSSUrl == "" || $custom_OSSBucket == "" || $custom_EndPoint == "" || $custom_OSSKeyID == "" || $custom_OSSKeySecret == "")
                    die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
            }

            if ($custom_ftpType == 2) {
                if ($custom_QINIUAccessKey == "" || $custom_QINIUSecretKey == "" || $custom_QINIUbucket == "" || $custom_QINIUdomain == "")
                    die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
            }

			if($custom_ftpType == 3){
		        if($custom_OBSUrl == "" || $custom_OBSBucket == "" || $custom_OBSEndpoint == "" || $custom_OBSKeyID == "" || $custom_OBSKeySecret == "")
		        die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
		    }

			if($custom_ftpType == 4){
		        if($custom_COSUrl == "" || $custom_COSBucket == "" || $custom_COSRegion == "" || $custom_COSSecretid == "" || $custom_COSSecretkey == "")
		        die('{"state": 200, "info": '.json_encode("请填写完整！").'}');
		    }

            if ($custom_ftpType == 0 && $custom_ftpState == 1) {
                if ($custom_ftpUrl == "" || $custom_ftpServer == "" || $custom_ftpDir == "" || $custom_ftpUser == "" || $custom_ftpPwd == "")
                    die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
            }
        }

        adminLog("修改商城设置", "远程附件");

    } elseif ($type == "mark") {

        //水印设置
        $customMark = $articleMark;

        //自定义
        if ($customMark == 1) {
            $custom_thumbMarkState = $thumbMarkState;
            $custom_atlasMarkState = $atlasMarkState;
            $custom_editorMarkState = $editorMarkState;
            $custom_waterMarkWidth = $waterMarkWidth;
            $custom_waterMarkHeight = $waterMarkHeight;
            $custom_waterMarkPostion = $waterMarkPostion;
            $custom_waterMarkType = $waterMarkType;
            $custom_markText = $markText;
            $custom_markFontfamily = $markFontfamily;
            $custom_markFontsize = $markFontsize;
            $custom_markFontColor = $markFontColor;
            $custom_markFile = $markFile;
            $custom_markPadding = $markPadding;
            $custom_transparent = $transparent;
            $custom_markQuality = $markQuality;

            $custom_thumbMarkState = $custom_thumbMarkState == "" ? 1 : $custom_thumbMarkState;
            $custom_atlasMarkState = $custom_atlasMarkState == "" ? 0 : $custom_atlasMarkState;
            $custom_editorMarkState = $custom_editorMarkState == "" ? 0 : $custom_editorMarkState;
            $custom_waterMarkWidth = $custom_waterMarkWidth == "" ? 400 : $custom_waterMarkWidth;
            $custom_waterMarkHeight = $custom_waterMarkHeight == "" ? 300 : $custom_waterMarkHeight;
            $custom_waterMarkPostion = $custom_waterMarkPostion == "" ? 9 : $custom_waterMarkPostion;
            $custom_waterMarkType = $custom_waterMarkType == "" ? 1 : $custom_waterMarkType;
            $custom_markFontsize = $custom_markFontsize == "" ? 12 : $custom_markFontsize;
            $custom_markPadding = $custom_markPadding == "" ? 10 : $custom_markPadding;
            $custom_markTransparent = $custom_transparent == "" ? 100 : $custom_transparent;
            $custom_markQuality = $custom_markQuality == "" ? 90 : $custom_markQuality;

            if ($custom_waterMarkType == 1) {
                if ($custom_markText == "" || $custom_markFontfamily == "")
                    die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
            } elseif ($custom_waterMarkType == 2 || $custom_waterMarkType == 3) {
                if ($custom_markFile == "")
                    die('{"state": 200, "info": ' . json_encode("请填写完整！") . '}');
            }
        }

        adminLog("修改商城设置", "水印设置");

    }elseif($type == "print") {
        $customPrintPlat = $printPlat;
        $customPartnerId = $partnerId;
        $customPrintKey  = $printKey;
        $customPrint_user    = $user;
        $customPrint_ukey    = $ukey;
        $customPrint_ucount    = $ucount;
    }elseif ($type == "guize"){
        /*有奖乐购*/
        $custom_shopKanjiaGuize = $body;
    }elseif($type == 'logistic'){
        $range_delivery_fee_value = $range_delivery_fee_value != '' ? json_decode(stripslashes($range_delivery_fee_value), true) : array (); /*按距离配送模板规格*/
        $range_delivery_fee_value = serialize($range_delivery_fee_value);

        //如果没有勾选
        if(!$openFree){
            $preferentialMoney = 0;
        }

        $logarr = array([
            'logtitle' => $logtitle,
            'content' => $content,
            'delivery_fee_mode' => $delivery_fee_mode,
            'basicprice' => $basicprice,
            'express_postage' => $express_postage,
            'express_fdistance' => $express_fdistance,
            'openFree' => $openFree,
            'preferentialMoney' => $preferentialMoney,
            'free_delivery_mode' => $free_delivery_mode,
            'free_delivery_static' => $free_delivery_static,
            'free_delivery_ps' => $free_delivery_ps,
            'free_delivery_pr' => $free_delivery_pr,
            'range_delivery_fee_value' =>$range_delivery_fee_value

        ]);
        $custom_logArr = serialize($logarr);

        $custom_lostitle                 = $logtitle;
        $custom_content                  = $content;
        $custom_delivery_fee_mode        = $delivery_fee_mode;
        $custom_basicprice               = $basicprice;
        $custom_express_postage          = $express_postage;
        $custom_express_fdistance        = $express_fdistance;
        $custom_openFree                 = $openFree;
        $custom_preferentialMoney        = $preferentialMoney;
        $custom_free_delivery_mode       = $free_delivery_mode;
        $custom_free_delivery_static     = $free_delivery_static;
        $custom_free_delivery_ps        = $free_delivery_ps;
        $custom_free_delivery_pr        = $free_delivery_pr;
        $custom_range_delivery_fee_value = $range_delivery_fee_value;
        $custom_shopCourierP             = $shopCourierP;
        $custom_shopCourierState         = (int)$shopCourierState;
    }

    //域名操作
    operaDomain('update', $customChannelDomain, $action, 'config');

    //基本设置文件内容
    $customInc = "<" . "?php\r\n";
    //基本设置
    $customInc .= "\$customChannelName = '" . $customChannelName . "';\r\n";
    $customInc .= "\$customLogo = " . $customLogo . ";\r\n";
    $customInc .= "\$customLogoUrl = '" . $customLogoUrl . "';\r\n";
    $customInc .= "\$customSharePic = '" . $customSharePic . "';\r\n";
    $customInc .= "\$customSubDomain = " . $customSubDomain . ";\r\n";
    $customInc .= "\$customChannelSwitch = " . $customChannelSwitch . ";\r\n";
    $customInc .= "\$customCloseCause = '" . $customCloseCause . "';\r\n";
    $customInc .= "\$customSeoTitle = '" . $customSeoTitle . "';\r\n";
    $customInc .= "\$customSeoKeyword = '" . $customSeoKeyword . "';\r\n";
    $customInc .= "\$customSeoDescription = '" . $customSeoDescription . "';\r\n";
    $customInc .= "\$hotline_config = " . $hotline_config . ";\r\n";
    $customInc .= "\$customHotline = '" . $customHotline . "';\r\n";
    $customInc .= "\$customAtlasMax = " . $customAtlasMax . ";\r\n";
    $customInc .= "\$customCommentCheck = " . (int)$customCommentCheck . ";\r\n";
    $customInc .= "\$customFabuCheck = " . (int)$customFabuCheck . ";\r\n";
    $customInc .= "\$customhuodongFabuCheck = " . (int)$customhuodongFabuCheck . ";\r\n";
    $customInc .= "\$customshopbranchCheck = " . (int)$customshopbranchCheck . ";\r\n";
    $customInc .= "\$customshopCheck = " . (int)$customshopCheck . ";\r\n";
    $customInc .= "\$custom_autoDispatchJuli = " . (int)$custom_autoDispatchJuli . ";\r\n";
    $customInc .= "\$custom_autoDispatchCount = " . (int)$custom_autoDispatchCount . ";\r\n";
	$customInc .= "\$customDataShare = ".(int)$customDataShare.";\r\n";
    $customInc .= "\$customfenXiao = ".(int)$customfenXiao.";\r\n";
    $customInc .= "\$customshopPeisongState = ".(int)$customshopPeisongState.";\r\n";
    $customInc .= "\$custom_huodongshoptypeopen = ".(int)$custom_huodongshoptypeopen.";\r\n";
    $customInc .= "\$custom_saleType = '".$custom_saleType."';\r\n";
    $customInc .= "\$custom_pageTypeConfig = '".$custom_pageTypeConfig."';\r\n";
    $customInc .= "\$customselfbargain = ".(int)$customselfbargain.";\r\n";
    $customInc .= "\$custombargaintime = ".(int)$custombargaintime.";\r\n";
    $customInc .= "\$customhelpbargain = ".(int)$customhelpbargain.";\r\n";
    $customInc .= "\$customtuikuanday = ".(int)$customtuikuanday.";\r\n";
    $customInc .= "\$customclosetuikuanday = ".(int)$customclosetuikuanday.";\r\n";
    $customInc .= "\$customfabuShopPromotion = ".(float)$customfabuShopPromotion.";\r\n";
    $customInc .= "\$customshopbargainingnomoney = ".(int)$customshopbargainingnomoney.";\r\n";
    $customInc .= "\$custompeerpay = ".(int)$custompeerpay.";\r\n";
    $customInc .= "\$customconfirmDay = ".(int)$customconfirmDay.";\r\n";
    $customInc .= "\$customhuodongygtime = '".$customhuodongygtime."';\r\n";
    $customInc .= "\$customtuanTag = '".$customtuanTag."';\r\n";
    $customInc .= "\$customJoinCheck = ".(int)$customJoinCheck.";\r\n";
    $customInc .= "\$customEditJoinCheck = ".(int)$customEditJoinCheck.";\r\n";
    $customInc .= "\$customPlatformDeliveryValue = ".(int)$customPlatformDeliveryValue.";\r\n";
    $customInc .= "\$customPlatformDeliveryType = ".(int)$customPlatformDeliveryType.";\r\n";
    $customInc .= "\$customDeliveryValue = ".(int)$customDeliveryValue.";\r\n";
    $customInc .= "\$customDeliveryType = ".(int)$customDeliveryType.";\r\n";
    $customInc .= "\$customIncompleteValue = ".(int)$customIncompleteValue.";\r\n";
    $customInc .= "\$customIncompleteType = ".(int)$customIncompleteType.";\r\n";
    //模板风格
	$customInc .= "\$customRouter = ".(int)$customRouter.";\r\n";
    $customInc .= "\$customTemplate = '" . $customTemplate . "';\r\n";
	$customInc .= "\$customTouchRouter = ".(int)$customTouchRouter.";\r\n";
    $customInc .= "\$customTouchTemplate = '" . $customTouchTemplate . "';\r\n";
    //图像搜索
    $customInc .= "\$imagesearch_AppID = '" . trim($imagesearch_AppID) . "';\r\n";
    $customInc .= "\$imagesearch_APIKey = '" . trim($imagesearch_APIKey) . "';\r\n";
    $customInc .= "\$imagesearch_Secret = '" . trim($imagesearch_Secret) . "';\r\n";
    //上传设置
    $customInc .= "\$customUpload = " . $customUpload . ";\r\n";
    $customInc .= "\$custom_uploadDir = '" . $custom_uploadDir . "';\r\n";
    $customInc .= "\$custom_softSize = " . $custom_softSize . ";\r\n";
    $customInc .= "\$custom_softType = '" . $custom_softType . "';\r\n";
    $customInc .= "\$custom_thumbSize = " . $custom_thumbSize . ";\r\n";
    $customInc .= "\$custom_thumbType = '" . $custom_thumbType . "';\r\n";
    $customInc .= "\$custom_atlasSize = " . $custom_atlasSize . ";\r\n";
    $customInc .= "\$custom_atlasType = '" . $custom_atlasType . "';\r\n";
    $customInc .= "\$custom_thumbSmallWidth = " . $custom_thumbSmallWidth . ";\r\n";
    $customInc .= "\$custom_thumbSmallHeight = " . $custom_thumbSmallHeight . ";\r\n";
    $customInc .= "\$custom_thumbMiddleWidth = " . $custom_thumbMiddleWidth . ";\r\n";
    $customInc .= "\$custom_thumbMiddleHeight = " . $custom_thumbMiddleHeight . ";\r\n";
    $customInc .= "\$custom_thumbLargeWidth = " . $custom_thumbLargeWidth . ";\r\n";
    $customInc .= "\$custom_thumbLargeHeight = " . $custom_thumbLargeHeight . ";\r\n";
    $customInc .= "\$custom_atlasSmallWidth = " . $custom_atlasSmallWidth . ";\r\n";
    $customInc .= "\$custom_atlasSmallHeight = " . $custom_atlasSmallHeight . ";\r\n";
    $customInc .= "\$custom_photoCutType = '" . $custom_photoCutType . "';\r\n";
    $customInc .= "\$custom_photoCutPostion = '" . $custom_photoCutPostion . "';\r\n";
    $customInc .= "\$custom_quality = " . $custom_quality . ";\r\n";
    //远程附件
    $customInc .= "\$customFtp = " . $customFtp . ";\r\n";
    $customInc .= "\$custom_ftpState = " . $custom_ftpState . ";\r\n";
    $customInc .= "\$custom_ftpType = " . $custom_ftpType . ";\r\n";
    $customInc .= "\$custom_ftpSSL = " . $custom_ftpSSL . ";\r\n";
    $customInc .= "\$custom_ftpPasv = " . $custom_ftpPasv . ";\r\n";
    $customInc .= "\$custom_ftpUrl = '" . $custom_ftpUrl . "';\r\n";
    $customInc .= "\$custom_ftpServer = '" . $custom_ftpServer . "';\r\n";
    $customInc .= "\$custom_ftpPort = " . $custom_ftpPort . ";\r\n";
    $customInc .= "\$custom_ftpDir = '" . $custom_ftpDir . "';\r\n";
    $customInc .= "\$custom_ftpUser = '" . $custom_ftpUser . "';\r\n";
    $customInc .= "\$custom_ftpPwd = '" . $custom_ftpPwd . "';\r\n";
    $customInc .= "\$custom_ftpTimeout = " . $custom_ftpTimeout . ";\r\n";
    $customInc .= "\$custom_OSSUrl = '" . $custom_OSSUrl . "';\r\n";
    $customInc .= "\$custom_OSSBucket = '" . $custom_OSSBucket . "';\r\n";
    $customInc .= "\$custom_EndPoint = '" . $custom_EndPoint . "';\r\n";
    $customInc .= "\$custom_OSSKeyID = '" . $custom_OSSKeyID . "';\r\n";
    $customInc .= "\$custom_OSSKeySecret = '" . $custom_OSSKeySecret . "';\r\n";
    $customInc .= "\$custom_QINIUAccessKey = '" . $custom_QINIUAccessKey . "';\r\n";
    $customInc .= "\$custom_QINIUSecretKey = '" . $custom_QINIUSecretKey . "';\r\n";
    $customInc .= "\$custom_QINIUbucket = '" . $custom_QINIUbucket . "';\r\n";
    $customInc .= "\$custom_QINIUdomain = '" . $custom_QINIUdomain . "';\r\n";
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
    $customInc .= "\$customMark = " . $customMark . ";\r\n";
    $customInc .= "\$custom_thumbMarkState = " . $custom_thumbMarkState . ";\r\n";
    $customInc .= "\$custom_atlasMarkState = " . $custom_atlasMarkState . ";\r\n";
    $customInc .= "\$custom_editorMarkState = " . $custom_editorMarkState . ";\r\n";
    $customInc .= "\$custom_waterMarkWidth = " . $custom_waterMarkWidth . ";\r\n";
    $customInc .= "\$custom_waterMarkHeight = " . $custom_waterMarkHeight . ";\r\n";
    $customInc .= "\$custom_waterMarkPostion = " . $custom_waterMarkPostion . ";\r\n";
    $customInc .= "\$custom_waterMarkType = " . $custom_waterMarkType . ";\r\n";
    $customInc .= "\$custom_waterMarkText = '" . $custom_markText . "';\r\n";
    $customInc .= "\$custom_markFontfamily = '" . $custom_markFontfamily . "';\r\n";
    $customInc .= "\$custom_markFontsize = " . $custom_markFontsize . ";\r\n";
    $customInc .= "\$custom_markFontColor = '" . $custom_markFontColor . "';\r\n";
    $customInc .= "\$custom_markFile = '" . $custom_markFile . "';\r\n";
    $customInc .= "\$custom_markPadding = " . $custom_markPadding . ";\r\n";
    $customInc .= "\$custom_markTransparent = " . $custom_markTransparent . ";\r\n";
    $customInc .= "\$custom_markQuality = " . $custom_markQuality . ";\r\n";
    //打印机设置
    $customInc .= "\$customPrintPlat = " . (int)$customPrintPlat . ";\r\n";
    $customInc .= "\$customPartnerId = " . (int)$customPartnerId . ";\r\n";
    $customInc .= "\$customPrintKey = '" . $customPrintKey . "';\r\n";
    $customInc .= "\$customPrint_user    = '" . $customPrint_user . "';\r\n";
    $customInc .= "\$customPrint_ukey    = '" . $customPrint_ukey . "';\r\n";
    $customInc .= "\$customPrint_ucount    = '" . $customPrint_ucount . "';\r\n";
    $customInc .= "\$custom_huodongopen = '" . $custom_huodongopen . "';\r\n";
    $customInc .= "\$custom_huodongshopopen = '" . $custom_huodongshopopen . "';\r\n";
    $customInc .= "\$custom_shopopen = '" . $custom_shopopen . "';\r\n";
    $customInc .= "\$custom_shopquanopen = '" . $custom_shopquanopen . "';\r\n";

    $customInc .= "\$custom_shopKanjiaGuize = '" . $custom_shopKanjiaGuize . "';\r\n";
    $customInc .= "\$custom_lostitle= '" . $custom_lostitle . "';\r\n";
    $customInc .= "\$custom_content = '" . $custom_content . "';\r\n";
    $customInc .= "\$custom_delivery_fee_mode = '" . $custom_delivery_fee_mode . "';\r\n";
    $customInc .= "\$custom_basicprice = '" . $custom_basicprice . "';\r\n";
    $customInc .= "\$custom_express_postage = '" . $custom_express_postage . "';\r\n";
    $customInc .= "\$custom_express_fdistance = '" . $custom_express_fdistance . "';\r\n";
    $customInc .= "\$custom_openFree= '" . $custom_openFree . "';\r\n";
    $customInc .= "\$custom_preferentialMoney = '" . $custom_preferentialMoney . "';\r\n";
    $customInc .= "\$custom_free_delivery_mode = '" . $custom_free_delivery_mode . "';\r\n";
    $customInc .= "\$custom_free_delivery_static = '" . $custom_free_delivery_static . "';\r\n";
    $customInc .= "\$custom_free_delivery_ps = '" . $custom_free_delivery_ps . "';\r\n";
    $customInc .= "\$custom_free_delivery_pr = '" . $custom_free_delivery_pr . "';\r\n";
    $customInc .= "\$custom_range_delivery_fee_value = '" . $custom_range_delivery_fee_value . "';\r\n";
    $customInc .= "\$custom_logArr = '" . $custom_logArr . "';\r\n";
    $customInc .= "\$custom_shopCourierP = '" . $custom_shopCourierP . "';\r\n";
    $customInc .= "\$custom_shopCourierState = " . (int)$custom_shopCourierState . ";\r\n";

    $customInc .= "?" . ">";

    $customIncFile = HUONIAOINC . "/config/" . $action . ".inc.php";
    $fp = fopen($customIncFile, "w") or die('{"state": 200, "info": ' . json_encode("写入文件 $customIncFile 失败，请检查权限！") . '}');
    fwrite($fp, $customInc);
    fclose($fp);

    //更新APP配置文件
    updateAppConfig();

    die('{"state": 100, "info": ' . json_encode("配置成功！") . '}');
    exit;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery.colorPicker.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'publicUpload.js',
        'admin/shop/shopConfig.js',
        'ui/bootstrap-datetimepicker.min.js',
        'publicAddr.js',
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    include(HUONIAOINC . "/config/" . $action . ".inc.php");
    global $cfg_basehost;
    global $customUpload;
    if ($customUpload == 1) {
        global $custom_thumbSize;
        global $custom_thumbType;
        $huoniaoTag->assign('thumbSize', $custom_thumbSize);
        $huoniaoTag->assign('thumbType', "*." . str_replace("|", ";*.", $custom_thumbType));
    }

    //基本设置
    $huoniaoTag->assign('channelname', $customChannelName);

    $huoniaoTag->assign('fenXiaoSwitch', array('1', '0'));
    $huoniaoTag->assign('fenXiaoSwitchNames',array('启用','禁用'));
    $huoniaoTag->assign('fenXiaoSwitchChecked', (int)$customfenXiao);

    $huoniaoTag->assign('shopbargainingnomoneyCheckNum', array('0', '1'));
    $huoniaoTag->assign('shopbargainingnomoneyNames',array('可以下单','不可以下单'));
    $huoniaoTag->assign('shopbargainingnomoneyChecked', (int)$customshopbargainingnomoney);

    $huoniaoTag->assign('selfbargainCheckNum', array('0', '1'));
    $huoniaoTag->assign('selfbargainNames',array('禁止','允许'));
    $huoniaoTag->assign('selfbargainChecked', (int)$customselfbargain);
    $huoniaoTag->assign('tuanTag', $customtuanTag);


    //频道LOGO
    $huoniaoTag->assign('articleLogo', array('0', '1'));
    $huoniaoTag->assign('articleLogoNames', array('系统默认', '自定义'));
    $huoniaoTag->assign('articleLogoChecked', $customLogo);
    $huoniaoTag->assign('articleLogoUrl', $customLogoUrl);

    $huoniaoTag->assign('bargaintime', $custombargaintime);
    $huoniaoTag->assign('huodongygtime', $customhuodongygtime);
    $huoniaoTag->assign('helpbargain', $customhelpbargain);
    $huoniaoTag->assign('tuikuanday', $customtuikuanday);
    $huoniaoTag->assign('closetuikuanday', $customclosetuikuanday);
    $huoniaoTag->assign('fabuShopPromotion', $customfabuShopPromotion);
    $huoniaoTag->assign('sharePic', $customSharePic);
    $huoniaoTag->assign('confirmDay', $customconfirmDay);

    //启用频道域名-单选
    $huoniaoTag->assign('cfg_basehost', $cfg_basehost);
    $huoniaoTag->assign('subdomain', array('0', '1', '2'));
    $huoniaoTag->assign('subdomainNames', array('主域名', '子域名', '子目录'));
    $huoniaoTag->assign('subdomainChecked', $customSubDomain);

    //获取域名信息
    $domainInfo = getDomain($action, 'config');
    $huoniaoTag->assign('channeldomain', $domainInfo['domain']);

    //频道开关-单选
    $huoniaoTag->assign('channelswitch', array('0', '1'));
    $huoniaoTag->assign('channelswitchNames', array('启用', '禁用'));
    $huoniaoTag->assign('channelswitchChecked', $customChannelSwitch);
    $huoniaoTag->assign('closecause', $customCloseCause);

    //seo设置
    $huoniaoTag->assign('title', $customSeoTitle);
    $huoniaoTag->assign('keywords', $customSeoKeyword);
    $huoniaoTag->assign('description', $customSeoDescription);

    //咨询热线
    $huoniaoTag->assign('hotlineVal', array('0', '1'));
    $huoniaoTag->assign('hotlineNames', array('系统默认', '自定义'));
    $huoniaoTag->assign('hotlineChecked', (int)$hotline_config);
    $huoniaoTag->assign('hotline', $customHotline);

    $huoniaoTag->assign('atlasMax', $customAtlasMax);


    //入驻审核-单选
    $huoniaoTag->assign('joinCheck', array('0', '1'));
    $huoniaoTag->assign('joinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('joinCheckChecked', (int)$customJoinCheck);

    //修改商家信息审核-单选
    $huoniaoTag->assign('editJoinCheck', array('0', '1'));
    $huoniaoTag->assign('editJoinCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('editJoinCheckChecked', (int)$customEditJoinCheck);


	//数据共享-单选
	$huoniaoTag->assign('dataShareSwitch', array('0', '1'));
	$huoniaoTag->assign('dataShareSwitchNames',array('禁用', '启用'));
	$huoniaoTag->assign('dataShareSwitchChecked', (int)$customDataShare);

    $huoniaoTag->assign('body', stripslashes($custom_shopKanjiaGuize));

    //模板风格
    $floders = listDir($dir);
    $skins = array();
    if (!empty($floders)) {
        $i = 0;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/' . $floder . '/config.xml';
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
    $huoniaoTag->assign('tplList', $skins);
	$huoniaoTag->assign('router', (int)$customRouter);
    $huoniaoTag->assign('articleTemplate', $customTemplate);


    //touch模板
    $floders = listDir($dir . '/touch');
    $skins = array();
    if (!empty($floders)) {
        $i = 0;
        foreach ($floders as $key => $floder) {
            $config = $dir . '/touch/' . $floder . '/config.xml';
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
	$huoniaoTag->assign('touchRouter', (int)$customTouchRouter);
    $huoniaoTag->assign('touchTemplate', $customTouchTemplate);

    //图像搜索
    $huoniaoTag->assign('imagesearch_AppID', $imagesearch_AppID);
    $huoniaoTag->assign('imagesearch_APIKey', $imagesearch_APIKey);
    $huoniaoTag->assign('imagesearch_Secret', $imagesearch_Secret);


    //上传设置
    $huoniaoTag->assign('articleUpload', array('0', '1'));
    $huoniaoTag->assign('articleUploadNames', array('系统默认', '自定义'));
    $huoniaoTag->assign('articleUploadChecked', $customUpload);

    $huoniaoTag->assign('uploadDir', $custom_uploadDir);
    $huoniaoTag->assign('softSize', $custom_softSize);
    $huoniaoTag->assign('softType', $custom_softType);
    $huoniaoTag->assign('thumbSize', $custom_thumbSize);
    $huoniaoTag->assign('thumbType_', $custom_thumbType);
    $huoniaoTag->assign('atlasSize', $custom_atlasSize);
    $huoniaoTag->assign('atlasType', $custom_atlasType);
    $huoniaoTag->assign('thumbSmallWidth', $custom_thumbSmallWidth);
    $huoniaoTag->assign('thumbSmallHeight', $custom_thumbSmallHeight);
    $huoniaoTag->assign('thumbMiddleWidth', $custom_thumbMiddleWidth);
    $huoniaoTag->assign('thumbMiddleHeight', $custom_thumbMiddleHeight);
    $huoniaoTag->assign('thumbLargeWidth', $custom_thumbLargeWidth);
    $huoniaoTag->assign('thumbLargeHeight', $custom_thumbLargeHeight);
    $huoniaoTag->assign('atlasSmallWidth', $custom_atlasSmallWidth);
    $huoniaoTag->assign('atlasSmallHeight', $custom_atlasSmallHeight);
    $huoniaoTag->assign('photoCutType', $custom_photoCutType);
    $huoniaoTag->assign('photoCutPostion', $custom_photoCutPostion);
    $huoniaoTag->assign('quality', $custom_quality);

    //远程附件
    $huoniaoTag->assign('articleFtp', array('0', '1'));
    $huoniaoTag->assign('articleFtpNames', array('系统默认', '自定义'));
    $huoniaoTag->assign('articleFtpChecked', $customFtp);

	$huoniaoTag->assign('ftpType', array('0', '1','2','3','4'));
	$huoniaoTag->assign('ftpTypeNames',array('普通FTP模式','阿里云OSS','七牛云','华为云OBS','腾讯云COS'));
	$huoniaoTag->assign('ftpTypeChecked', (int)$custom_ftpType);

    $huoniaoTag->assign('ftpStateType', array('0', '1'));
    $huoniaoTag->assign('ftpStateNames', array('否', '是'));
    $huoniaoTag->assign('ftpStateChecked', $custom_ftpState);

    $huoniaoTag->assign('ftpSSL', array('0', '1'));
    $huoniaoTag->assign('ftpSSLNames', array('否', '是'));
    $huoniaoTag->assign('ftpSSLChecked', $custom_ftpSSL);

    $huoniaoTag->assign('ftpPasv', array('0', '1'));
    $huoniaoTag->assign('ftpPasvNames', array('否', '是'));
    $huoniaoTag->assign('ftpPasvChecked', $custom_ftpPasv);

    $huoniaoTag->assign('ftpUrl', $custom_ftpUrl);
    $huoniaoTag->assign('ftpServer', $custom_ftpServer);
    $huoniaoTag->assign('ftpPort', $custom_ftpPort);
    $huoniaoTag->assign('ftpDir', $custom_ftpDir);
    $huoniaoTag->assign('ftpUser', $custom_ftpUser);
    $huoniaoTag->assign('ftpPwd', $custom_ftpPwd);
    $huoniaoTag->assign('ftpTimeout', $custom_ftpTimeout);
    $huoniaoTag->assign('OSSUrl', $custom_OSSUrl);
    $huoniaoTag->assign('OSSBucket', $custom_OSSBucket);
    $huoniaoTag->assign('EndPoint', $custom_EndPoint);
    $huoniaoTag->assign('OSSKeyID', $custom_OSSKeyID);
    $huoniaoTag->assign('OSSKeySecret', $custom_OSSKeySecret);
    $huoniaoTag->assign('access_key', $custom_QINIUAccessKey);
    $huoniaoTag->assign('secret_key', $custom_QINIUSecretKey);
    $huoniaoTag->assign('bucket', $custom_QINIUbucket);
    $huoniaoTag->assign('domain', $custom_QINIUdomain);
	$huoniaoTag->assign('OBSUrl', $custom_OBSUrl);
	$huoniaoTag->assign('OBSBucket', $custom_OBSBucket);
	$huoniaoTag->assign('OBSEndpoint', $custom_OBSEndpoint);
	$huoniaoTag->assign('OBSKeyID', $custom_OBSKeyID);
	$huoniaoTag->assign('OBSKeySecret', $custom_OBSKeySecret);
	$huoniaoTag->assign('COSUrl', $custom_COSUrl);
	$huoniaoTag->assign('COSBucket', $custom_COSBucket);
	$huoniaoTag->assign('COSRegion', $custom_COSRegion);
	$huoniaoTag->assign('COSSecretid', $custom_COSSecretid);
	$huoniaoTag->assign('COSSecretkey', $custom_COSSecretkey);

    //水印设置
    $huoniaoTag->assign('articleMark', array('0', '1'));
    $huoniaoTag->assign('articleMarkNames', array('系统默认', '自定义'));
    $huoniaoTag->assign('articleMarkChecked', $customMark);

    $huoniaoTag->assign('thumbMarkState', array('0', '1'));
    $huoniaoTag->assign('thumbMarkStateNames', array('关闭', '开启'));
    $huoniaoTag->assign('thumbMarkStateChecked', $custom_thumbMarkState);

    $huoniaoTag->assign('atlasMarkState', array('0', '1'));
    $huoniaoTag->assign('atlasMarkStateNames', array('关闭', '开启'));
    $huoniaoTag->assign('atlasMarkStateChecked', $custom_atlasMarkState);

    $huoniaoTag->assign('editorMarkState', array('0', '1'));
    $huoniaoTag->assign('editorMarkStateNames', array('关闭', '开启'));
    $huoniaoTag->assign('editorMarkStateChecked', $custom_editorMarkState);

    $huoniaoTag->assign('waterMarkWidth', $custom_waterMarkWidth);
    $huoniaoTag->assign('waterMarkHeight', $custom_waterMarkHeight);
    $huoniaoTag->assign('waterMarkPostion', $custom_waterMarkPostion);
    //水印类型-单选
    $huoniaoTag->assign('waterMarkType', array('1', '2', '3'));
    $huoniaoTag->assign('waterMarkTypeNames', array('文字', 'PNG图片', 'GIF图片'));
    $huoniaoTag->assign('waterMarkTypeChecked', $custom_waterMarkType);
    $huoniaoTag->assign('markText', $custom_waterMarkText);

    //平台配送
    $huoniaoTag->assign('logtitle', $custom_lostitle);
    $huoniaoTag->assign('content', $custom_content);
    $huoniaoTag->assign('delivery_fee_mode', $custom_delivery_fee_mode);
    $huoniaoTag->assign('basicprice', $custom_basicprice);
    $huoniaoTag->assign('express_postage', $custom_express_postage);
    $huoniaoTag->assign('express_fdistance', $custom_express_fdistance);
    $huoniaoTag->assign('openFree', $custom_openFree);
    $huoniaoTag->assign('shopCourierP', $custom_shopCourierP);
    $huoniaoTag->assign('preferentialMoney', $custom_preferentialMoney);
    $huoniaoTag->assign('free_delivery_mode', $custom_free_delivery_mode);
    $huoniaoTag->assign('free_delivery_static', $custom_free_delivery_static);
    $huoniaoTag->assign('free_delivery_ps', $custom_free_delivery_ps);
    $huoniaoTag->assign('free_delivery_pr', $custom_free_delivery_pr);
    $huoniaoTag->assign('range_delivery_fee_value', unserialize($custom_range_delivery_fee_value));

    $huoniaoTag->assign('shopCourierStateSwitch', array('0', '1'));
    $huoniaoTag->assign('shopCourierStateSwitchNames',array('启用','禁用'));
    $huoniaoTag->assign('shopCourierStateSwitchChecked', (int)$custom_shopCourierState);


    //水印字体
    $ttfFloder = HUONIAOINC . "/data/fonts/";
    if (is_dir($ttfFloder)) {
        if ($file = opendir($ttfFloder)) {
            $fileArray = array();
            while ($f = readdir($file)) {
                if ($f != '.' && $f != '..') {
                    array_push($fileArray, $f);
                }
            }
            //字体文件-下拉菜单
            $huoniaoTag->assign('markFontfamily', $fileArray);
            $huoniaoTag->assign('markFontfamilySelected', $custom_markFontfamily);
        }
    }

    $huoniaoTag->assign('markFontsize', $custom_markFontsize);
    $huoniaoTag->assign('markFontColor', $custom_markFontColor);

    //水印图片
    $markFloder = HUONIAOINC . "/data/mark/";
    if (is_dir($markFloder)) {
        if ($file = opendir($markFloder)) {
            $fileArray = array();
            while ($f = readdir($file)) {
                if ($f != '.' && $f != '..') {
                    array_push($fileArray, $f);
                }
            }
            //字体文件-下拉菜单
            $huoniaoTag->assign('markFile', $fileArray);
            $huoniaoTag->assign('markFileSelected', $custom_markFile);
        }
    }

    $huoniaoTag->assign('markPadding', $custom_markPadding);
    $huoniaoTag->assign('transparent', $custom_markTransparent);
    $huoniaoTag->assign('markQuality', $custom_markQuality);

    // 自动派单
    $huoniaoTag->assign('autoDispatchJuli', (int)$custom_autoDispatchJuli);
    $huoniaoTag->assign('autoDispatchCount', (int)$custom_autoDispatchCount);

    //评论审核-单选
    $huoniaoTag->assign('commentCheck', array('0', '1'));
    $huoniaoTag->assign('commentCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('commentCheckChecked', (int)$customCommentCheck);

    //发布审核-单选
    $huoniaoTag->assign('fabuCheck', array('0', '1'));
    $huoniaoTag->assign('fabuCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('fabuCheckChecked', (int)$customFabuCheck);

    //活动发布审核-单选
    $huoniaoTag->assign('huodongfabuCheck', array('0', '1'));
    $huoniaoTag->assign('huodongfabuCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('huodongfabuCheckChecked', (int)$customhuodongFabuCheck);

    $huoniaoTag->assign('shopbranchCheckNum', array('0', '1'));
    $huoniaoTag->assign('shopbranchCheckNames', array('需要审核', '不需要审核'));
    $huoniaoTag->assign('shopbranchCheckChecked', (int)$customshopbranchCheck);

    /*活动开启管理 活动类型1-准点抢,2-准点秒,3-砍价,4-拼团*/
    $huoniaoTag->assign('huodongopt', array( '1', '2', '3', '4'));
    $huoniaoTag->assign('huodongnames',array('准点抢购','特价秒杀','砍价','拼团特惠'));
    $huodongopen = $custom_huodongopen === '' ? array() : explode(",", $custom_huodongopen);
    $huoniaoTag->assign('huodongopen', $huodongopen);
    /*活动开启商品管理 活动类型1-准点抢,2-准点秒,3-砍价,4-拼团*/
    $huoniaoTag->assign('huodongshopopt', array( '1', '2', '3','4'));
    $huoniaoTag->assign('huodongshopnames',array('准点抢购','特价秒杀','砍价','拼团特惠'));

    $huodongshopopen = $custom_huodongshopopen === '' ? array() : explode(",", $custom_huodongshopopen);
    $huoniaoTag->assign('huodongshopopen', $huodongshopopen);

    
    $huoniaoTag->assign('saleTypeopt', array( '1', '3','4'));
    $huoniaoTag->assign('saleTypenames',array('到店消费','商家自配','快递'));
    $saleType = $custom_saleType == '' ? array( '1', '3','4') : explode(",", $custom_saleType);
    $huoniaoTag->assign('saleType', $saleType);

    //没有开启的活动
    $huodongshopnotopen = array();
    if(!$huodongopen){
        $huodongshopnotopen = array('抢购', '秒杀', '砍价', '拼团');
    }else{
        if(!in_array(1, $huodongopen)) $huodongshopnotopen[] = '抢购';
        if(!in_array(2, $huodongopen)) $huodongshopnotopen[] = '秒杀';
        if(!in_array(3, $huodongopen)) $huodongshopnotopen[] = '砍价';
        if(!in_array(4, $huodongopen)) $huodongshopnotopen[] = '拼团';
    }
    $huoniaoTag->assign('huodongshopnotopen', $huodongshopnotopen);


    $huoniaoTag->assign('shopopt', array( '4'));
    $huoniaoTag->assign('shopnames',array('热门商品'));
    $huoniaoTag->assign('shopopen', $custom_shopopen === '' ? "" : explode(",", $custom_shopopen));
        //平台配送服务
    $huoniaoTag->assign('shopPeisongState', array('0', '1'));
    $huoniaoTag->assign('shopPeisongStateNames', array('关闭', '开启'));
    $huoniaoTag->assign('shopPeisongStateChecked', $customshopPeisongState);
    //展示商品类型
    $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
    $huoniaoTag->assign('huodongshoptype', array(0,1,2));
    $huoniaoTag->assign('huodongshoptypenames',array('混合','团购','电商'));
    $huoniaoTag->assign('huodongshoptypeopen', (int)$huodongshoptypeopen);

    //页面显示配置
    $pageTypeConfig = array();
    $_pageTypeConfig = $custom_pageTypeConfig ? json_decode($custom_pageTypeConfig, true) : array();
    if(!$_pageTypeConfig || !is_array($_pageTypeConfig)){
        //兼容老数据

        $pageTypeConfig = array(
            array('id' => 1, 'name' => $pageTypeConfigNames[0], 'title' => $pageTypeConfigNames[0], 'show' => 1),
            array('id' => 2, 'name' => $pageTypeConfigNames[1], 'title' => $pageTypeConfigNames[1], 'show' => 1),
            array('id' => 3, 'name' => $pageTypeConfigNames[2], 'title' => $pageTypeConfigNames[2], 'show' => 1),
        );

        //团购
        if($huodongshoptypeopen == 1){
            $pageTypeConfig[1]['show'] = 0;
        }
        //电商
        elseif($huodongshoptypeopen == 2){
            $pageTypeConfig[0]['show'] = 0;
        }
    }else{
        $pageTypeConfig = $_pageTypeConfig;
    }
    $huoniaoTag->assign('pageTypeConfig', $pageTypeConfig);


    $huoniaoTag->assign('shopCheckNum', array('1', '2'));
    $huoniaoTag->assign('shopCheckNames', array('团购类[热门团购]', '电商类[发现好货]'));
    $huoniaoTag->assign('shopCheckChecked', (int)$customshopCheck);

    //pc领券中心
    $huoniaoTag->assign('shopquanopt', array( '1'));
    $huoniaoTag->assign('shopquannames',array('领券中心'));
    $huoniaoTag->assign('shopquanopen', $custom_shopquanopen === '' ? "" : explode(",", $custom_shopquanopen));

    //打印机配置
    $huoniaoTag->assign('printPlatList', array(0 => '易联云', 1 => '飞鹅'));
	$huoniaoTag->assign('printPlatSelected', $customPrintPlat);
	$huoniaoTag->assign('partnerId', $customPartnerId);
    $huoniaoTag->assign('printKey', $customPrintKey);

    $huoniaoTag->assign('user', $customPrint_user);
    $huoniaoTag->assign('ukey', $customPrint_ukey);
    $huoniaoTag->assign('ucount', $customPrint_ucount ? $customPrint_ucount : 1);

    $huoniaoTag->assign('peerpaySwitch', array('1', '0'));
    $huoniaoTag->assign('peerpaySwitchNames',array('启用','禁用'));
    $huoniaoTag->assign('peerpaySwitchChecked', (int)$custompeerpay);

    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );

    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/shop";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
