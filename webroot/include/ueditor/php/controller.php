<?php
//header('Access-Control-Allow-Origin: http://www.baidu.com'); //设置http://www.baidu.com允许跨域访问
//header('Access-Control-Allow-Headers: X-Requested-With,X_Requested_With'); //设置允许的跨域header
// date_default_timezone_set("Asia/chongqing");
// error_reporting(E_ERROR);
// header("Content-Type: text/html; charset=utf-8");

require_once('../../common.inc.php');

$CONFIG = json_decode(preg_replace("/\/\*[\s\S]+?\*\//", "", file_get_contents("config.json")), true);
$action = $_GET['action'];

/* 引入系统参数 */
require_once(HUONIAOINC . "/config/" . $modelType . ".inc.php");

global $cfg_ftpUrl;
global $cfg_fileUrl;
global $cfg_uploadDir;
global $cfg_ftpType;
global $cfg_ftpState;
global $cfg_ftpDir;
global $cfg_quality;
global $cfg_softSize;
global $cfg_softType;
global $cfg_editorSize;
global $cfg_editorType;
global $cfg_videoSize;
global $cfg_videoType;
global $cfg_meditorPicWidth;
global $editorMarkState;

$cfg_softType = explode("|", $cfg_softType);
$cfg_editorType = explode("|", $cfg_editorType);
$cfg_videoType = explode("|", $cfg_videoType);

$editor_fileUrl = $cfg_ftpUrl;
$editor_uploadDir = $cfg_uploadDir;
$cfg_uploadDir = "/../.." . $cfg_uploadDir;
$editor_ftpState = $cfg_ftpState;
$editor_ftpDir = $cfg_ftpDir;
$cfg_photoCutType = "scale_width";
$editor_ftpType = $cfg_ftpType;

global $customUpload;
global $custom_uploadDir;
global $customFtp;
global $custom_ftpType;
global $custom_ftpState;
global $custom_ftpDir;
global $custom_ftpServer;
global $custom_ftpPort;
global $custom_ftpUser;
global $custom_ftpPwd;
global $custom_ftpDir;
global $custom_ftpUrl;
global $custom_ftpTimeout;
global $custom_ftpSSL;
global $custom_ftpPasv;
global $custom_OSSUrl;
global $custom_OSSBucket;
global $custom_EndPoint;
global $custom_OSSKeyID;
global $custom_OSSKeySecret;
global $custom_QINIUAccessKey;
global $custom_QINIUSecretKey;
global $custom_QINIUbucket;
global $custom_QINIUdomain;
global $custom_OBSUrl;
global $custom_OBSBucket;
global $custom_OBSEndpoint;
global $custom_OBSKeyID;
global $custom_OBSKeySecret;
global $custom_COSUrl;
global $custom_COSBucket;
global $custom_COSRegion;
global $custom_COSSecretid;
global $custom_COSSecretkey;

//默认FTP帐号
if ($customFtp == 0) {
    $custom_ftpState = $cfg_ftpState;
    $custom_ftpType = $cfg_ftpType;
    $custom_ftpSSL = $cfg_ftpSSL;
    $custom_ftpPasv = $cfg_ftpPasv;
    $custom_ftpUrl = $cfg_ftpUrl;
    $custom_ftpServer = $cfg_ftpServer;
    $custom_ftpPort = $cfg_ftpPort;
    $custom_ftpDir = $cfg_ftpDir;
    $custom_ftpUser = $cfg_ftpUser;
    $custom_ftpPwd = $cfg_ftpPwd;
    $custom_ftpTimeout = $cfg_ftpTimeout;
    $custom_OSSUrl = $cfg_OSSUrl;
    $custom_OSSBucket = $cfg_OSSBucket;
    $custom_EndPoint = $cfg_EndPoint;
    $custom_OSSKeyID = $cfg_OSSKeyID;
    $custom_OSSKeySecret = $cfg_OSSKeySecret;
    $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
    $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
    $custom_QINIUbucket = $cfg_QINIUbucket;
    $custom_QINIUdomain = $cfg_QINIUdomain;
    $custom_OBSUrl = $cfg_OBSUrl;
    $custom_OBSBucket = $cfg_OBSBucket;
    $custom_OBSEndpoint = $cfg_OBSEndpoint;
    $custom_OBSKeyID = $cfg_OBSKeyID;
    $custom_OBSKeySecret = $cfg_OBSKeySecret;
    $custom_COSUrl = $cfg_COSUrl;
    $custom_COSBucket = $cfg_COSBucket;
    $custom_COSRegion = $cfg_COSRegion;
    $custom_COSSecretid = $cfg_COSSecretid;
    $custom_COSSecretkey = $cfg_COSSecretkey;
}

$editor_ftpType = $custom_ftpType;

global $thumbMarkState;
global $atlasMarkState;
global $editorMarkState;
global $waterMarkWidth;
global $waterMarkHeight;
global $waterMarkPostion;
global $waterMarkType;
global $waterMarkText;
global $markFontfamily;
global $markFontsize;
global $markFontColor;
global $markFile;
global $markPadding;
global $markTransparent;
global $markQuality;

$markConfig = array(
    "thumbMarkState" => $thumbMarkState,
    "atlasMarkState" => $atlasMarkState,
    "editorMarkState" => $editorMarkState,
    "waterMarkWidth" => $waterMarkWidth,
    "waterMarkHeight" => $waterMarkHeight,
    "waterMarkPostion" => $waterMarkPostion,
    "waterMarkType" => $waterMarkType,
    "waterMarkText" => $waterMarkText,
    "markFontfamily" => $markFontfamily,
    "markFontsize" => $markFontsize,
    "markFontColor" => $markFontColor,
    "markFile" => $markFile,
    "markPadding" => $markPadding,
    "markTransparent" => $markTransparent,
    "markQuality" => $markQuality
);

if ($modelType != "siteConfig") {
    global $customMark;
    global $custom_thumbMarkState;
    global $custom_atlasMarkState;
    global $custom_editorMarkState;
    global $custom_waterMarkWidth;
    global $custom_waterMarkHeight;
    global $custom_waterMarkPostion;
    global $custom_waterMarkType;
    global $custom_waterMarkText;
    global $custom_markFontfamily;
    global $custom_markFontsize;
    global $custom_markFontColor;
    global $custom_markFile;
    global $custom_markPadding;
    global $custom_markTransparent;
    global $custom_markQuality;

    if ($customMark == 1) {
        $markConfig = array(
            "thumbMarkState" => $custom_thumbMarkState,
            "atlasMarkState" => $custom_atlasMarkState,
            "editorMarkState" => $custom_editorMarkState,
            "waterMarkWidth" => $custom_waterMarkWidth,
            "waterMarkHeight" => $custom_waterMarkHeight,
            "waterMarkPostion" => $custom_waterMarkPostion,
            "waterMarkType" => $custom_waterMarkType,
            "waterMarkText" => $custom_waterMarkText,
            "markFontfamily" => $custom_markFontfamily,
            "markFontsize" => $custom_markFontsize,
            "markFontColor" => $custom_markFontColor,
            "markFile" => $custom_markFile,
            "markPadding" => $custom_markPadding,
            "markTransparent" => $custom_markTransparent,
            "markQuality" => $custom_markQuality
        );
    }
}

if ($customUpload == 1 && $custom_ftpState == 1) {
    $editor_fileUrl = $custom_ftpUrl;
    $editor_uploadDir = $custom_uploadDir;
    $editor_ftpDir = $custom_ftpDir;
}
//普通FTP模式
if ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 1) {
    $editor_ftpType = 0;
    $editor_ftpState = 1;

//阿里云OSS
} elseif ($customFtp == 1 && $custom_ftpType == 1) {
    $editor_ftpType = 1;
    $editor_ftpState = 0;

    //七牛云
} elseif ($customFtp == 1 && $custom_ftpType == 2) {
    $editor_ftpType = 2;
    $editor_ftpState = 0;

    //华为云
} elseif ($customFtp == 1 && $custom_ftpType == 3) {
    $editor_ftpType = 3;
    $editor_ftpState = 0;

	//腾讯云
} elseif ($customFtp == 1 && $custom_ftpType == 4) {
	$cfg_ftpType = 4;
	$cfg_ftpState = 0;

//本地
} elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
    $editor_ftpType = 5;
    $editor_ftpState = 0;

}

//为兼容页面播放器，此处将文件真实地址输出
// if($action == "uploadvideo"){
//     global $cfg_fileUrl;
//     global $cfg_uploadDir;
//     global $cfg_ftpState;
//     global $cfg_ftpType;
//     global $cfg_ftpState;
//     global $cfg_ftpDir;
//     global $cfg_OSSUrl;

//     if($modelType != "siteConfig"){
//         global $customUpload;
//         global $custom_uploadDir;
//         global $customFtp;
//         global $customFtpType;
//         global $custom_ftpState;
//         global $custom_ftpDir;
//         global $custom_ftpUrl;
//         global $custom_OSSUrl;

//         //自定义FTP配置
//         if($customFtp == 1){
//             //阿里云OSS
//             if($custom_ftpType == 1){
//                 if(strpos($custom_OSSUrl, "http://") > 0){
//                     $site_fileUrl = $custom_OSSUrl;
//                 }else{
//                     $site_fileUrl = "http://".$custom_OSSUrl;
//                 }
//             //普通FTP
//             }elseif($custom_ftpState == 1){
//                 $site_fileUrl = $custom_ftpUrl.str_replace(".", "", $custom_ftpDir);
//             //本地
//             }else{
//                 if($customUpload == 1){
//                     $site_fileUrl = "..".$custom_uploadDir;
//                 }else{
//                     $site_fileUrl = "..".$cfg_uploadDir;
//                 }
//             }
//         //系统默认
//         }else{
//             //阿里云OSS
//             if($cfg_ftpType == 1){
//                 if(strpos($cfg_OSSUrl, "http://") > 0){
//                     $site_fileUrl = $cfg_OSSUrl;
//                 }else{
//                     $site_fileUrl = "http://".$cfg_OSSUrl;
//                 }
//             //普通FTP
//             }elseif($cfg_ftpState == 1){
//                 $site_fileUrl = $cfg_fileUrl;
//             //本地
//             }else{
//                 $site_fileUrl = "..".$cfg_uploadDir;
//             }
//         }
//     }else{
//         //阿里云OSS
//         if($cfg_ftpType == 1){
//             if(strpos($cfg_OSSUrl, "http://") > 0){
//                 $site_fileUrl = $cfg_OSSUrl;
//             }else{
//                 $site_fileUrl = "http://".$cfg_OSSUrl;
//             }
//         //普通FTP
//         }elseif($cfg_ftpType == 0 && $cfg_ftpState == 1){
//             $site_fileUrl = $cfg_fileUrl;
//         //本地
//         }else{
//             $site_fileUrl = "..".$cfg_uploadDir;
//         }
//     }
// }


switch ($action) {
    case 'config':
        $result = json_encode($CONFIG);
        break;

    /* 上传图片 */
    case 'uploadimage':
        /* 上传涂鸦 */
    case 'uploadscrawl':
        /* 上传视频 */
    case 'uploadvideo':
        /* 上传文件 */
    case 'uploadfile':
        $result = include("action_upload.php");
        break;

    /* 列出图片 */
    case 'listimage':
        $result = include("action_list.php");
        break;
    /* 列出文件 */
    case 'listfile':
        $result = include("action_list.php");
        break;

    /* 抓取远程文件 */
    case 'catchimage':
        $result = include("action_crawler.php");
        break;

    default:
        $result = json_encode(array(
            'state' => '请求地址出错'
        ));
        break;
}

/* 输出结果 */
if (isset($_GET["callback"])) {
    if (preg_match("/^[\w_]+$/", $_GET["callback"])) {
        echo htmlspecialchars($_GET["callback"]) . '(' . $result . ')';
    } else {
        echo json_encode(array(
            'state' => 'callback参数不合法'
        ));
    }
} else {
    echo $result;
}
