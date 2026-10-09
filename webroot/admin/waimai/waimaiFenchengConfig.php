<?php
/**
 * 默认分成
 *
 * @version        $Id: list.php 2017-4-25 上午10:16:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("defaultWaiMaiFenCheng");

$templates = "waimaiFenchengConfig.html";
$actionname = 'waimaiFenchengConfig';

//频道配置参数
include(HUONIAOINC . "/config/waimai.inc.php");

if ($action !=''){
if($action == "save") {
    $fencheng_foodprice = empty($fencheng_foodprice) ? 0 : (int)$fencheng_foodprice;
    $fencheng_delivery = empty($fencheng_delivery) ? 0 : (int)$fencheng_delivery;
    $fencheng_addservice = empty($fencheng_addservice) ? 0 : (int)$fencheng_addservice;
    $fencheng_zsb = empty($fencheng_zsb) ? 0 : (int)$fencheng_zsb;
    $fencheng_dabao = empty($fencheng_dabao) ? 0 : (int)$fencheng_dabao;
    $fencheng_discount = empty($fencheng_discount) ? 0 : (int)$fencheng_discount;
    $fencheng_promotion = empty($fencheng_promotion) ? 0 : (int)$fencheng_promotion;
    $fencheng_firstdiscount = empty($fencheng_firstdiscount) ? 0 : (int)$fencheng_firstdiscount;
    $fencheng_quan = empty($fencheng_quan) ? 0 : (int)$fencheng_quan;
}
    $customInc = "<" . "?php\r\n";
    //基本设置
    $customInc .= "\$customChannelName = '" ._RunMagicQuotes($customChannelName) . "';\r\n";
    $customInc .= "\$customLogo = '" . $customLogo . "';\r\n";
    $customInc .= "\$customLogoUrl = '" . $customLogoUrl . "';\r\n";
    $customInc .= "\$customSharePic = '" . $customSharePic . "';\r\n";
    $customInc .= "\$customSubDomain = '" . $customSubDomain . "';\r\n";
    $customInc .= "\$customChannelSwitch = '" . $customChannelSwitch . "';\r\n";
    $customInc .= "\$customMemberRefundswitch = " . (int)$customMemberRefundswitch . ";\r\n";
    $customInc .= "\$customCloseCause = '" . $customCloseCause . "';\r\n";
    $customInc .= "\$customSeoTitle = '" . $customSeoTitle . "';\r\n";
    $customInc .= "\$customSeoKeyword = '" . $customSeoKeyword . "';\r\n";
    $customInc .= "\$customSeoDescription = '" . $customSeoDescription . "';\r\n";
    $customInc .= "\$hotline_config = '" . $hotline_config . "';\r\n";
    $customInc .= "\$customHotline = '" . $customHotline . "';\r\n";
    $customInc .= "\$custom_map = '" . $custom_map . "';\r\n";
    $customInc .= "\$custom_firstOrderType = " . (int)$custom_firstOrderType . ";\r\n";
    $customInc .= "\$custom_autoDispatchJuli = " . (int)$custom_autoDispatchJuli . ";\r\n";
    $customInc .= "\$custom_autoDispatchCount = " . (int)$custom_autoDispatchCount . ";\r\n";
    $customInc .= "\$custom_systemturnnum = " . (int)$custom_systemturnnum . ";\r\n";
    $customInc .= "\$custom_paotuiStartTime = '" . $custom_paotuiStartTime . "';\r\n";
    $customInc .= "\$custom_paotuiEndTime = '" . $custom_paotuiEndTime . "';\r\n";
    $customInc .= "\$custom_paotuitime = " . (int)$custom_paotuitime . ";\r\n";
    $customInc .= "\$customCommentCheck = " . (int)$customCommentCheck . ";\r\n";
    $customInc .= "\$customClearingswitch = " . (int)$customClearingswitch . ";\r\n";
    $customInc .= "\$customDataShare = ".(int)$customDataShare.";\r\n";
    $customInc .= "\$customfenXiao = ".(int)$customfenXiao.";\r\n";
    $customInc .= "\$customIsopenqd = ".(int)$customIsopenqd.";\r\n";
    $customInc .= "\$customIsopencode = ".(int)$customIsopencode.";\r\n";
    $customInc .= "\$customDeskQrType = ".(int)$customDeskQrType.";\r\n";
    $customInc .= "\$customwaimaiCourierP = '".(float)$customwaimaiCourierP."';\r\n";
    $customInc .= "\$custompaotuiCourierP = '".(float)$custompaotuiCourierP."';\r\n";
    $customInc .= "\$customtakeLimit = '".$customtakeLimit."';\r\n";
    $customInc .= "\$customsuccessLimit = '".$customsuccessLimit."';\r\n";
    $customInc .= "\$customcourierFree = '".$customcourierFree."';\r\n";
    //模板风格
    $customInc .= "\$customTemplate = '" . $customTemplate . "';\r\n";
    $customInc .= "\$customTouchTemplate = '" . $customTouchTemplate . "';\r\n";
    //上传设置
    $customInc .= "\$customUpload = " . (int)$customUpload . ";\r\n";
    $customInc .= "\$custom_uploadDir = '" . $custom_uploadDir . "';\r\n";
    $customInc .= "\$custom_softSize = '" . $custom_softSize . "';\r\n";
    $customInc .= "\$custom_softType = '" . $custom_softType . "';\r\n";
    $customInc .= "\$custom_thumbSize = '" . $custom_thumbSize . "';\r\n";
    $customInc .= "\$custom_thumbType = '" . $custom_thumbType . "';\r\n";
    $customInc .= "\$custom_atlasSize = '" . $custom_atlasSize . "';\r\n";
    $customInc .= "\$custom_atlasType = '" . $custom_atlasType . "';\r\n";
    $customInc .= "\$custom_brandSmallWidth = '" . $custom_brandSmallWidth . "';\r\n";
    $customInc .= "\$custom_brandSmallHeight = '" . $custom_brandSmallHeight . "';\r\n";
    $customInc .= "\$custom_brandMiddleWidth = '" . $custom_brandMiddleWidth . "';\r\n";
    $customInc .= "\$custom_brandMiddleHeight = '" . $custom_brandMiddleHeight . "';\r\n";
    $customInc .= "\$custom_brandLargeWidth = '" . $custom_brandLargeWidth . "';\r\n";
    $customInc .= "\$custom_brandLargeHeight = '" . $custom_brandLargeHeight . "';\r\n";
    $customInc .= "\$custom_thumbSmallWidth = '" . $custom_thumbSmallWidth . "';\r\n";
    $customInc .= "\$custom_thumbSmallHeight = '" . $custom_thumbSmallHeight . "';\r\n";
    $customInc .= "\$custom_thumbMiddleWidth = '" . $custom_thumbMiddleWidth . "';\r\n";
    $customInc .= "\$custom_thumbMiddleHeight = '" . $custom_thumbMiddleHeight . "';\r\n";
    $customInc .= "\$custom_thumbLargeWidth = '" . $custom_thumbLargeWidth . "';\r\n";
    $customInc .= "\$custom_thumbLargeHeight = '" . $custom_thumbLargeHeight . "';\r\n";
    $customInc .= "\$custom_atlasSmallWidth = '" . $custom_atlasSmallWidth . "';\r\n";
    $customInc .= "\$custom_atlasSmallHeight = '" . $custom_atlasSmallHeight . "';\r\n";
    $customInc .= "\$custom_photoCutType = '" . $custom_photoCutType . "';\r\n";
    $customInc .= "\$custom_photoCutPostion = '" . $custom_photoCutPostion . "';\r\n";
    $customInc .= "\$custom_quality = '" . $custom_quality . "';\r\n";
    //远程附件
    $customInc .= "\$customFtp = '" . $customFtp . "';\r\n";
    $customInc .= "\$custom_ftpState = '" . $custom_ftpState . "';\r\n";
    $customInc .= "\$custom_ftpType = '" . $custom_ftpType . "';\r\n";
    $customInc .= "\$custom_ftpSSL = '" . $custom_ftpSSL . "';\r\n";
    $customInc .= "\$custom_ftpPasv = '" . $custom_ftpPasv . "';\r\n";
    $customInc .= "\$custom_ftpUrl = '" . $custom_ftpUrl . "';\r\n";
    $customInc .= "\$custom_ftpServer = '" . $custom_ftpServer . "';\r\n";
    $customInc .= "\$custom_ftpPort = '" . $custom_ftpPort . "';\r\n";
    $customInc .= "\$custom_ftpDir = '" . $custom_ftpDir . "';\r\n";
    $customInc .= "\$custom_ftpUser = '" . $custom_ftpUser . "';\r\n";
    $customInc .= "\$custom_ftpPwd = '" . $custom_ftpPwd . "';\r\n";
    $customInc .= "\$custom_ftpTimeout = '" . $custom_ftpTimeout . "';\r\n";
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
    $customInc .= "\$customMark = '" . $customMark . "';\r\n";
    $customInc .= "\$custom_thumbMarkState = '" . $custom_thumbMarkState . "';\r\n";
    $customInc .= "\$custom_atlasMarkState = '" . $custom_atlasMarkState . "';\r\n";
    $customInc .= "\$custom_editorMarkState = '" . $custom_editorMarkState . "';\r\n";
    $customInc .= "\$custom_waterMarkWidth = '" . $custom_waterMarkWidth . "';\r\n";
    $customInc .= "\$custom_waterMarkHeight = '" . $custom_waterMarkHeight . "';\r\n";
    $customInc .= "\$custom_waterMarkPostion = '" . $custom_waterMarkPostion . "';\r\n";
    $customInc .= "\$custom_waterMarkType   = '" . $custom_waterMarkType . "';\r\n";
    $customInc .= "\$custom_waterMarkText   = '" . $custom_waterMarkText . "';\r\n";
    $customInc .= "\$custom_markFontfamily  = '" . $custom_markFontfamily . "';\r\n";
    $customInc .= "\$custom_markFontsize    = '" . $custom_markFontsize . "';\r\n";
    $customInc .= "\$custom_markFontColor   = '" . $custom_markFontColor . "';\r\n";
    $customInc .= "\$custom_markFile        = '" . $custom_markFile . "';\r\n";
    $customInc .= "\$custom_markPadding     = '" . $custom_markPadding . "';\r\n";
    $customInc .= "\$custom_markTransparent = '" . $custom_markTransparent . "';\r\n";
    $customInc .= "\$custom_markQuality     = '" . $custom_markQuality . "';\r\n";
    //打印机设置
    $customInc .= "\$customPrintPlat        = '" . (int)$customPrintPlat . "';\r\n";
    $customInc .= "\$customPartnerId        = '" . (int)$customPartnerId . "';\r\n";
    $customInc .= "\$customPrintKey         = '" . $customPrintKey . "';\r\n";
    $customInc .= "\$customAcceptType       = '" . (int)$customAcceptType . "';\r\n";
    $customInc .= "\$customPrintType        = '" . (int)$customPrintType . "';\r\n";
    $customInc .= "\$customPrintTemplate    = '" . $customPrintTemplate . "';\r\n";
    $customInc .= "\$customClientId         = '" . $customClientId . "';\r\n";
    $customInc .= "\$customClient_secret    = '" . $customClient_secret . "';\r\n";
    $customInc .= "\$customPrint_user    = '" . $customPrint_user . "';\r\n";
    $customInc .= "\$customPrint_ukey    = '" . $customPrint_ukey . "';\r\n";
    $customInc .= "\$customPrint_ucount    = '" . $customPrint_ucount . "';\r\n";
    $customInc .= "\$serviceMoney           = '" . (int)$serviceMoney . "';\r\n";
    $customInc .= "\$ptweight               = '" . (int)$ptweight . "';\r\n";
    $customInc .= "\$maxtip                 = '" . (int)$maxtip . "';\r\n";
    $customInc .= "\$cstime                 = '" . (int)$cstime . "';\r\n";
    $customInc .= "\$csprice                = '" . (int)$csprice . "';\r\n";
    $customInc .= "\$custompaotuiMaxjuli    = '" . (int)$custompaotuiMaxjuli . "';\r\n";
    $customInc .= "\$custompeerpay = '".(int)$custompeerpay."';\r\n";
    $customInc .= "\$custom_otherpeisong = '".(int)$custom_otherpeisong."';\r\n";

    //准时宝配置
    $customInc .= "\$customZsbspe = '" . $customZsbspe . "';\r\n";

    //准时宝协议
    $customInc .= "\$customZsbxy = '" . $customZsbxy . "';\r\n";
    //会员开通协议
    $customInc .= "\$customHyxy = '" . $customHyxy . "';\r\n";
    //优惠推荐
    $customInc .= "\$customSaleState = '" . (int)$customSaleState . "';\r\n";
    $customInc .= "\$customSaleTitle = '" . $customSaleTitle . "';\r\n";
    $customInc .= "\$customSaleSubTitle = '" . $customSaleSubTitle . "';\r\n";
    $customInc .= "\$customSaleTimes = '" . $customSaleTimes . "';\r\n";

    /*跑腿计价规格*/
    $customInc .= "\$custompaotui_delivery  = '" . $custompaotui_delivery . "';\r\n";
    $customInc .= "\$customaddservice       = '" . $customaddservice . "';\r\n";
    $customInc .= "\$customweight           = '" . $customweight . "';\r\n";

    /*外卖额外加成*/
    $customInc .= "\$custom_waimaiorderprice          ='" .$custom_waimaiorderprice . "';\r\n";
    $customInc .= "\$custom_waimaadditionkm           = '" . $custom_waimaadditionkm . "';\r\n";

    //外卖默认分成
    $customInc .= "\$custom_fencheng_foodprice = " . (int)$fencheng_foodprice . ";\r\n";
    $customInc .= "\$custom_fencheng_delivery = " . (int)$fencheng_delivery . ";\r\n";
    $customInc .= "\$custom_fencheng_addservice = " . (int)$fencheng_addservice . ";\r\n";
    $customInc .= "\$custom_fencheng_zsb = " . (int)$fencheng_zsb . ";\r\n";
    $customInc .= "\$custom_fencheng_dabao = " . (int)$fencheng_dabao . ";\r\n";
    $customInc .= "\$custom_fencheng_discount = " . (int)$fencheng_discount . ";\r\n";
    $customInc .= "\$custom_fencheng_promotion = " . (int)$fencheng_promotion . ";\r\n";
    $customInc .= "\$custom_fencheng_firstdiscount = " . (int)$fencheng_firstdiscount . ";\r\n";
    $customInc .= "\$custom_fencheng_quan = " . (int)$fencheng_quan . ";\r\n";

    $customInc .= "?".">";
    $customIncFile = HUONIAOINC . "/config/waimai.inc.php";
    $fp = fopen($customIncFile, "w") or die('{"state": 200, "info": ' . json_encode("写入文件 $customIncFile 失败，请检查权限！") . '}');
    fwrite($fp, $customInc);
    fclose($fp);

    adminLog("修改外卖店铺默认分成比例", http_build_query($_POST), 1);
    die('{"state": 100, "info": ' . json_encode("配置成功！") . '}');
    exit;

}




//配置参数
//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
    $cssFile = array(
        'admin/jquery-ui.css',
        'admin/styles.css',
        'admin/chosen.min.css',
        'admin/ace-fonts.min.css',
        'admin/select.css',
        'admin/ace.min.css',
        'admin/animate.css',
        'admin/font-awesome.min.css',
        'admin/simple-line-icons.css',
        'admin/font.css',
        // 'admin/app.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
    $jsFile = array(
        'ui/bootstrap.min.js',
        'ui/jquery-ui.custom.min.js',
        'admin/waimai/waimaiFenchengConfig.js'
    );

    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    //基本设置
    $huoniaoTag->assign('fencheng_foodprice', $custom_fencheng_foodprice);
    $huoniaoTag->assign('fencheng_delivery', $custom_fencheng_delivery);
    $huoniaoTag->assign('fencheng_addservice', $custom_fencheng_addservice);
    $huoniaoTag->assign('fencheng_zsb', $custom_fencheng_zsb);
    $huoniaoTag->assign('fencheng_dabao', $custom_fencheng_dabao);
    $huoniaoTag->assign('fencheng_discount', $custom_fencheng_discount);
    $huoniaoTag->assign('fencheng_promotion', $custom_fencheng_promotion);
    $huoniaoTag->assign('fencheng_firstdiscount', $custom_fencheng_firstdiscount);
    $huoniaoTag->assign('fencheng_quan', $custom_fencheng_quan);



    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
