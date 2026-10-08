<?php
/**
 * 上传处理插件
 *
 * @version        $Id: upload.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once('./common.inc.php');

$cfg_changeFileSize = 1;  //动态处理图片尺寸  1为不生成  0为生成     图片大中小图由程序处理，这个操作会增加上传时长和存储空间，开启远程附件后不需要生成

//七牛云
$autoload = true;
function classLoaderQiniu($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }

}

spl_autoload_register('classLoaderQiniu');
require(HUONIAOROOT . '/api/upload/Qiniu/functions.php');
use Qiniu\Auth;
use Qiniu\Storage\UploadManager;
use Qiniu\Storage\BucketManager;


//华为云
$autoload = true;
function classLoaderHuawei($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }

}

spl_autoload_register('classLoaderHuawei');
require(HUONIAOROOT . '/api/upload/huawei/vendor/autoload.php');
require(HUONIAOROOT . '/api/upload/huawei/obs-autoloader.php');
use Obs\ObsClient;
use Obs\ObsException;


//腾讯云
$autoload = true;
function classLoaderTencent($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }

}

spl_autoload_register('classLoaderTencent');
require(HUONIAOROOT . '/api/upload/tencent/vendor/autoload.php');


$autoload = false;
header("Content-Type: text/html; charset=utf-8");
$mod = htmlspecialchars(RemoveXSS($_REQUEST['mod']));       //模块 article:新闻
$type = str_replace('.', '', htmlspecialchars(RemoveXSS($_REQUEST['type'])));      //类型 thumb:缩略图 atlas:图集
$filetype = str_replace('.', '', htmlspecialchars(RemoveXSS($_REQUEST['filetype'])));  //指定文件类型 此处为兼容flash/mp3文件
$o = htmlspecialchars(RemoveXSS($_REQUEST['o']));         //如果为true则保留大图
$picpath = htmlspecialchars(RemoveXSS($_REQUEST['picpath']));      //要操作的图片路径
$direction = htmlspecialchars(RemoveXSS($_POST['direction']));    //图片旋转方向 left:逆时针 right:顺时针
$obj = htmlspecialchars(RemoveXSS($_REQUEST['obj']));
$aid = (int)$_POST['aid'];    //图片旋转方向 left:逆时针 right:顺时针
$custom_folder = "";

//获取用户ID和管理员ID，如果未登录，返回错误信息
//骑手注册时上传身份证除外
//小程序端旧版本上传接口没有携带token，暂时先放行
$_userid = $userLogin->getMemberID();
$_uid = $userLogin->getUserID();
if($_userid == -1 && $_uid == -1 && !strstr($_SERVER['HTTP_REFERER'], 'courier') && !strstr($_SERVER['HTTP_REFERER'], 'servicewechat')){
    if ($obj != "" && $obj != 'front' && $obj != 'back' && $obj != 'license') {
        echo "<script language='javascript'>";
        echo "alert('请先登录！');location.href = '/include/upfile.inc.php?mod=$mod&type=$type&obj=$obj&filetype=$filetype';";
        echo "</script>";
    } else {
        echo json_encode(array('state' => '请先登录！'));
    }
    die;
}

if (!empty($aid)) {
    $RenrenCrypt = new RenrenCrypt();
    $aid = $RenrenCrypt->php_decrypt(base64_decode($aid));
}
$aid = (int)$aid;

global $cfg_fileUrl;
global $site_fileUrl;
global $cfg_uploadDir;
global $cfg_softSize;
global $cfg_softType;
global $cfg_thumbSize;
global $cfg_thumbType;
global $cfg_atlasSize;
global $cfg_atlasType;
global $cfg_photoSize;
global $cfg_photoType;
global $cfg_flashSize;
global $cfg_audioSize;
global $cfg_audioType;
global $cfg_videoSize;
global $cfg_videoType;
global $cfg_thumbSmallWidth;
global $cfg_thumbSmallHeight;
global $cfg_thumbMiddleWidth;
global $cfg_thumbMiddleHeight;
global $cfg_thumbLargeWidth;
global $cfg_thumbLargeHeight;
global $cfg_atlasSmallWidth;
global $cfg_atlasSmallHeight;
global $cfg_photoSmallWidth;
global $cfg_photoSmallHeight;
global $cfg_photoMiddleWidth;
global $cfg_photoMiddleHeight;
global $cfg_photoLargeWidth;
global $cfg_photoLargeHeight;
global $cfg_photoCutType;
global $cfg_photoCutPostion;
global $cfg_quality;
global $cfg_ftpType;
global $cfg_ftpState;
global $cfg_ftpDir;
global $cfg_filedelstatus;

global $thumbMarkState;
global $atlasMarkState;
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

$custom_folder = $cfg_uploadDir;
$isVideoCompress = false;  //默认值

$markConfig = array(
    "thumbMarkState" => $thumbMarkState,
    "atlasMarkState" => $atlasMarkState,
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

//载入频道配置参数
if ($mod != "siteConfig") {
    require(HUONIAOINC . "/config/" . $mod . ".inc.php");
    global $customUpload;
    global $custom_uploadDir;
    global $custom_softSize;
    global $custom_softType;
    global $custom_thumbSize;
    global $custom_thumbType;
    global $custom_atlasSize;
    global $custom_atlasType;
    global $custom_thumbSmallWidth;
    global $custom_thumbSmallHeight;
    global $custom_thumbMiddleWidth;
    global $custom_thumbMiddleHeight;
    global $custom_thumbLargeWidth;
    global $custom_thumbLargeHeight;
    global $custom_atlasSmallWidth;
    global $custom_atlasSmallHeight;
    global $custom_photoCutType;
    global $custom_photoCutPostion;
    global $custom_quality;
    global $customFtp;
    global $custom_ftpType;
    global $custom_ftpState;
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

    global $customMark;
    global $custom_thumbMarkState;
    global $custom_atlasMarkState;
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
        $thumbMarkState = $custom_thumbMarkState;
        $atlasMarkState = $custom_atlasMarkState;

        $markConfig = array(
            "thumbMarkState" => $custom_thumbMarkState,
            "atlasMarkState" => $custom_atlasMarkState,
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

    if ($customUpload == 1) {
        $cfg_uploadDir = $custom_uploadDir;
        $cfg_softSize = $custom_softSize;
        $cfg_softType = $custom_softType;
        $cfg_thumbSize = $custom_thumbSize;
        $cfg_thumbType = $custom_thumbType;
        $cfg_atlasSize = $custom_atlasSize;
        $cfg_atlasType = $custom_atlasType;
        $cfg_thumbSmallWidth = $custom_thumbSmallWidth;
        $cfg_thumbSmallHeight = $custom_thumbSmallHeight;
        $cfg_thumbMiddleWidth = $custom_thumbMiddleWidth;
        $cfg_thumbMiddleHeight = $custom_thumbMiddleHeight;
        $cfg_thumbLargeWidth = $custom_thumbLargeWidth;
        $cfg_thumbLargeHeight = $custom_thumbLargeHeight;
        $cfg_atlasSmallWidth = $custom_atlasSmallWidth;
        $cfg_atlasSmallHeight = $custom_atlasSmallHeight;
        $cfg_photoCutType = $custom_photoCutType;
        $cfg_photoCutPostion = $custom_photoCutPostion;
        $cfg_quality = $custom_quality;
    }

    if($_POST['thumbLargeWidth']){
        $cfg_thumbLargeWidth = (int)$_POST['thumbLargeWidth'];
    }
    if($_POST['thumbLargeHeight']){
        $cfg_thumbLargeHeight = (int)$_POST['thumbLargeHeight'];
    }

    //普通FTP模式
    if ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 1) {
        $cfg_ftpType = 0;
        $cfg_ftpState = 1;
        $cfg_ftpDir = $custom_ftpDir;

        //阿里云OSS
    } elseif ($customFtp == 1 && $custom_ftpType == 1) {
        $cfg_ftpType = 1;
        $cfg_ftpState = 0;
        $cfg_ftpDir = $custom_uploadDir;

        //七牛云
    } elseif ($customFtp == 1 && $custom_ftpType == 2) {
        $cfg_ftpType = 2;
        $cfg_ftpState = 0;
        $cfg_ftpDir = $custom_uploadDir;

        //华为云
    } elseif ($customFtp == 1 && $custom_ftpType == 3) {
        $cfg_ftpType = 3;
        $cfg_ftpState = 0;
        $cfg_ftpDir = $custom_uploadDir;

		//腾讯云
    } elseif ($customFtp == 1 && $custom_ftpType == 4) {
        $cfg_ftpType = 4;
        $cfg_ftpState = 0;
        $cfg_ftpDir = $custom_uploadDir;

        //本地
    } elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
        $cfg_ftpType = 5;
        $cfg_ftpState = 0;
        $cfg_ftpDir = $custom_uploadDir;
    }

    //自定义FTP配置
    if ($customFtp == 1) {

        //阿里云OSS
        if ($custom_ftpType == 1) {
            if (strpos($custom_OSSUrl, "http") !== false) {
                $site_fileUrl = $custom_OSSUrl;
            } else {
                $site_fileUrl = "https://" . $custom_OSSUrl;
            }
            $custom_folder = $custom_uploadDir;
            //七牛云
        } elseif ($custom_ftpType == 2) {
            if (strpos($custom_QINIUdomain, "http") !== false) {
                $site_fileUrl = $custom_QINIUdomain;
            } else {
                $site_fileUrl = "https://" . $custom_QINIUdomain;
            }
            $custom_folder = $custom_uploadDir;
            //华为云
        } elseif ($custom_ftpType == 3) {
            if (strpos($custom_OBSUrl, "http") !== false) {
                $site_fileUrl = $custom_OBSUrl;
            } else {
                $site_fileUrl = "https://" . $custom_OBSUrl;
            }
            $custom_folder = $custom_uploadDir;
            //腾讯云
        } elseif ($custom_ftpType == 4) {
            if (strpos($custom_COSUrl, "http") !== false) {
                $site_fileUrl = $custom_COSUrl;
            } else {
                $site_fileUrl = "https://" . $custom_COSUrl;
            }
            $custom_folder = $custom_uploadDir;
            //普通FTP
        } elseif ($custom_ftpState == 1) {
            $site_fileUrl = $custom_ftpUrl . str_replace(".", "", $custom_ftpDir);
            $custom_folder = $custom_ftpDir;
            //本地
        } else {
            if ($customUpload == 1) {
                $site_fileUrl = ".." . $custom_uploadDir;
                $custom_folder = $custom_uploadDir;
            } else {
                $site_fileUrl = ".." . $cfg_uploadDir;
            }
        }
        //系统默认
    } else {
        //阿里云OSS
        if ($cfg_ftpType == 1) {
            if (strpos($cfg_OSSUrl, "http") !== false) {
                $site_fileUrl = $cfg_OSSUrl;
            } else {
                $site_fileUrl = "https://" . $cfg_OSSUrl;
            }
            //七牛云
        } elseif ($cfg_ftpType == 2) {
            if (strpos($cfg_QINIUdomain, "http") !== false) {
                $site_fileUrl = $cfg_QINIUdomain;
            } else {
                $site_fileUrl = "https://" . $cfg_QINIUdomain;
            }
            //华为云
        } elseif ($cfg_ftpType == 3) {
            if (strpos($cfg_OBSUrl, "http") !== false) {
                $site_fileUrl = $cfg_OBSUrl;
            } else {
                $site_fileUrl = "https://" . $cfg_OBSUrl;
            }
            //腾讯云
        } elseif ($cfg_ftpType == 4) {
            if (strpos($cfg_COSUrl, "http") !== false) {
                $site_fileUrl = $cfg_COSUrl;
            } else {
                $site_fileUrl = "https://" . $cfg_COSUrl;
            }
            //普通FTP
        } elseif ($cfg_ftpState == 1) {
            $site_fileUrl = $cfg_fileUrl;
            $custom_folder = $cfg_ftpDir;
            //本地
        } else {
            $site_fileUrl = ".." . $cfg_uploadDir;
        }

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
    }
} else {
    //阿里云OSS
    if ($cfg_ftpType == 1) {
        if (strpos($cfg_OSSUrl, "http") !== false) {
            $site_fileUrl = $cfg_OSSUrl;
        } else {
            $site_fileUrl = "https://" . $cfg_OSSUrl;
        }
        //七牛云
    } elseif ($cfg_ftpType == 2) {
        if (strpos($cfg_QINIUdomain, "http") !== false) {
            $site_fileUrl = $cfg_QINIUdomain;
        } else {
            $site_fileUrl = "https://" . $cfg_QINIUdomain;
        }
        //华为云
    } elseif ($cfg_ftpType == 3) {
        if (strpos($cfg_OBSUrl, "http") !== false) {
            $site_fileUrl = $cfg_OBSUrl;
        } else {
            $site_fileUrl = "https://" . $cfg_OBSUrl;
        }
        //腾讯云
    } elseif ($cfg_ftpType == 4) {
        if (strpos($cfg_COSUrl, "http") !== false) {
            $site_fileUrl = $cfg_COSUrl;
        } else {
            $site_fileUrl = "https://" . $cfg_COSUrl;
        }
        //普通FTP
    } elseif ($cfg_ftpState == 1) {
        $site_fileUrl = $cfg_fileUrl;
        $custom_folder = $cfg_ftpDir;
        //本地
    } else {
        $site_fileUrl = ".." . $cfg_uploadDir;
    }
}

//删除文件
if ($type == "delThumb" || $type == "delAtlas" || $type == "delConfig" || $type == "delLogo" || $type == "delFriendLink" || $type == "delAdv" || $type == "delCard" || $type == "delBrand" || $type == "delbrandLogo" || $type == "delFile" || $type == "delVideo" || $type == "delFlash" || $type == "delPhoto" || $type == "delthumb" || $type == "delatlas" || $type == "delconfig" || $type == "dellogo" || $type == "delfriendLink" || $type == "deladv" || $type == "delcard" || $type == "delbrand" || $type == "delbrandLogo" || $type == "delfile" || $type == "delvideo" || $type == "delflash" || $type == "delphoto" || $type == "deladvthumb" || $type == "delsingle" || $type == "delSingle" || $type == "delfilenail" || $type == "delImage" || $type == "delcertificate") {

  $type = $type == "delImage" ? "delAtlas" : $type;

  $fids = explode(',', $picpath);
  foreach ($fids as $key => $value) {
    //验证是否为微信传图
    $RenrenCrypt = new RenrenCrypt();
    $id = $RenrenCrypt->php_decrypt(base64_decode($value));

    if (is_numeric($id)){
        $attachment = $dsql->SetQuery("SELECT `userid`, `path` FROM `#@__attachment` WHERE `id` = " . $id);
    }else{
        $attachment = $dsql->SetQuery("SELECT `userid`, `path` FROM `#@__attachment` WHERE `path` = '$value'");
    }
    $results = $dsql->dsqlOper($attachment, "results");

    if (!$results) return;  //数据不存在
	$_userid = $results[0]['userid'];
    $picpath_ = $results[0]['path'];

	//删除权限
	if($userLogin->getUserID() == -1 && ($userLogin->getMemberID() == -1 || $userLogin->getMemberID() != $_userid)) return;

    $cfg_filedelstatus = (int)$cfg_filedelstatus;
	if($cfg_filedelstatus == 0 && !strstr($picpath_, 'wxupimg')) return;

    //删除缩略图，如果图片为提取的内容第一张，则不执行删除操作
    if($type == 'delthumb' && strstr($picpath_, 'editor')) return;

    //微信传图删除
    if(strstr($picpath_, 'wxupimg')){

      //取ticket
      $sql = $dsql->SetQuery("SELECT `ticket` FROM `#@__site_wxupimg` WHERE `fid` = '$value'");
      $ret = $dsql->dsqlOper($sql, "results");
      if($ret){
        $ticket = $ret[0]['ticket'];

        $claFile = HUONIAOROOT . '/api/handlers/siteConfig.class.php';
        if (is_file($claFile)) {
            include_once $claFile;
        } else {
            return;
        }

        $ser = new siteConfig(array('ticket' => $ticket, 'fid' => $value));
        $ser->delWeixinUpImg();
      }


    }else{
      delPicFile($picpath, $type, $mod);
    }
  }

//旋转图片
} else if ($type == "rotateAtlas") {
    // $pathModel = $action == "thumb" ? array("small", "middle", "large", "o_large") : array("large", "small");
    $pathModel = array("large");
    $direction = $direction == "left" ? 90 : 270;

    $dsql = new dsql($dbo);
    $_time = GetMkTime(time());

    $RenrenCrypt = new RenrenCrypt();
    $id = $RenrenCrypt->php_decrypt(base64_decode($picpath));

    if(is_numeric($id)){
        $attachment = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($attachment, "results");
        if (!$results) die('{"state":"ERROR","info":' . json_encode("数据不存在！") . '}');  //数据不存在
        $picpath = $results[0]['path'];
    }else{
        $archives = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `path` = '$picpath'");
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            $id = $results[0]['id'];
        }
    }

    $_userid = $results[0]['userid'];

	//验证权限
	if($userLogin->getUserID() == -1 && ($userLogin->getMemberID() == -1 || $userLogin->getMemberID() != $_userid)){
        die('{"state":"ERROR","info":' . json_encode("权限错误！") . '}');
    }

    $_picpathArr = explode('/', $picpath);

    if($mod != $_picpathArr[1]){
        $mod = $_picpathArr[1];
    }

    if(!$action){
        $action = $_picpathArr[2];
    }

    $wxupimg = false;
    if(strstr($picpath, 'wxupimg')){
      $pathModel = array("large");
      $wxupimg = true;
    }

    $picpath = explode("large/", $picpath);
    $picpath = $picpath[1];

    //循环操作相关文件
    foreach ($pathModel as $key => $value) {

        //读取远程文件
        set_time_limit(24 * 60 * 60);

        // $folder = $action == "thumb" ? "thumb" : "atlas";
        $folder = $action;
        if($wxupimg){
          $mod = 'siteConfig';
          $folder = 'wxupimg';
        }
        if ($cfg_ftpType == 2) {
            $fileUrl = $site_fileUrl . "//" . $mod . "/" . $folder . "/" . $value . "/" . $picpath . '?v=' . time();
        } else {
            //本地
            if(strstr($site_fileUrl, '../')){
                $fileUrl = HUONIAOROOT . (str_replace('..', '', $site_fileUrl)) . "/" . $mod . "/" . $folder . "/" . $value . "/" . $picpath;
            }
            else{
                $fileUrl = $site_fileUrl . "/" . $mod . "/" . $folder . "/" . $value . "/" . $picpath . '?v=' . time();
            }
        }

        //变更文件名，防止缓存导致的图片不更新
        $picpath = updateFilenameWithTimestamp($picpath);

        $__filepath = "/" . $mod . "/" . $folder . "/" . $value . "/" . $picpath;

        $local_fileUrl = HUONIAOROOT . $custom_folder . $__filepath;
        $fileContent = @file_get_contents($fileUrl);

        //保存至本地
        if ($fileContent) {
            createFile($local_fileUrl);
            PutFile($local_fileUrl, $fileContent);
        }

        if (file_exists($local_fileUrl)) {
            //对本地文件进行旋转操作
            rotateAtlas($local_fileUrl, $degrees = $direction);

            //记录文件的更新时间
            if(is_numeric($id)){
                $attachment = $dsql->SetQuery("UPDATE `#@__attachment` SET `updatetime` = $_time, `path` = '$__filepath' WHERE `id` = " . $id);
                $dsql->dsqlOper($attachment, "update");
            }

            //上传到远程服务器

            //普通FTP模式
            if ($cfg_ftpType == 0 && $cfg_ftpState == 1) {
                $ftpConfig = array();
                if ($mod != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
                    $ftpConfig = array(
                        "on" => $custom_ftpState, //是否开启
                        "host" => $custom_ftpServer, //FTP服务器地址
                        "port" => $custom_ftpPort, //FTP服务器端口
                        "username" => $custom_ftpUser, //FTP帐号
                        "password" => $custom_ftpPwd,  //FTP密码
                        "attachdir" => $custom_ftpDir,  //FTP上传目录
                        "attachurl" => $custom_ftpUrl,  //远程附件地址
                        "timeout" => $custom_ftpTimeout,  //FTP超时
                        "ssl" => $custom_ftpSSL,  //启用SSL连接
                        "pasv" => $custom_ftpPasv  //被动模式连接
                    );
                }

                $huoniao_ftp = new ftp($ftpConfig);
                $huoniao_ftp->connect();
                if ($huoniao_ftp->connectid) {
                    $huoniao_ftp->upload($local_fileUrl, $cfg_ftpDir . $__filepath);
                } else {
                    $error = 'FTP连接失败，请检查配置信息！';
                }

                //阿里云OSS
            } elseif ($cfg_ftpType == 1) {

		        $OSSConfig = array(
		            "bucketName" => $cfg_OSSBucket,
		            "endpoint" => $cfg_EndPoint,
		            "accessKey" => $cfg_OSSKeyID,
		            "accessSecret" => $cfg_OSSKeySecret
		        );

                if ($mod != "siteConfig" && $customFtp == 1) {
                    $OSSConfig = array(
                        "bucketName" => $custom_OSSBucket,
                        "endpoint" => $custom_EndPoint,
                        "accessKey" => $custom_OSSKeyID,
                        "accessSecret" => $custom_OSSKeySecret
                    );
                }

				$OSSConfig['object'] = $mod . "/" . $folder . "/" . $value . "/" . $picpath;
				$OSSConfig['uploadFile'] = $local_fileUrl;

                $ret = putObjectByRawApis($OSSConfig);
                if ($ret['state'] == 200) {
                    $error = $ret['info'];
                }

            //七牛云
            } elseif ($cfg_ftpType == 2) {
                $autoload = true;
                $accessKey = $custom_QINIUAccessKey;
                $secretKey = $custom_QINIUSecretKey;
                // 构建鉴权对象
                $auth = new Auth($accessKey, $secretKey);
                // 要上传的空间
                $bucket = $custom_QINIUbucket;
                // 上传到七牛后保存的文件名
                $key = $__filepath;
                // 生成上传 Token
                $token = $auth->uploadToken($bucket,$key);
                // 要上传文件的本地路径
                $filePath = $local_fileUrl;
                // 初始化 UploadManager 对象并进行文件的上传。
                $uploadMgr = new UploadManager();
                // 调用 UploadManager 的 putFile 方法进行文件的上传。
                list($ret, $err) = $uploadMgr->putFile($token, $key, $filePath);
                if ($err !== null) {
                    $error = $err;
                }

            //华为云
            } elseif ($cfg_ftpType == 3) {
                $ak = $custom_OBSKeyID;
                $sk = $custom_OBSKeySecret;
                $endpoint = $custom_OBSEndpoint;
                $bucketName = $custom_OBSBucket;

                $autoload = true;
                $obsClient = ObsClient::factory([
                	'key' => $ak,
                	'secret' => $sk,
                	'endpoint' => $endpoint,
                	'socket_timeout' => 30,
                	'connect_timeout' => 10
                ]);

                try{

                    $objectKey = $__filepath;
                    $sampleFilePath = $local_fileUrl;

                    //上传到的桶名，文件名
                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                    $uploadId = $resp['UploadId'];

                    //要上传的本地文件
                    createSampleFile($sampleFilePath);
                    $partSize = 5 * 1024 * 1024;
                	$fileLength = filesize($sampleFilePath);

                	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                    $parts = [];
                	$promise = null;

                    for($i = 0; $i < $partCount; $i++){
                		$offset = $i * $partSize;
                		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                		$partNumber = $i + 1;
                		$p = $obsClient->uploadPartAsync([
                				'Bucket' => $bucketName,
                				'Key' => $objectKey,
                				'UploadId' => $uploadId,
                				'PartNumber' => $partNumber,
                				'SourceFile' => $sampleFilePath,
                				'Offset' => $offset,
                				'PartSize' => $currPartSize
                		], function($exception, $resp) use(&$parts, $partNumber) {
                			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                		});

                		if($promise === null){
                			$promise = $p;
                		}
                	}

                    $promise -> wait();
                    usort($parts, function($a, $b){
                		if($a['PartNumber'] === $b['PartNumber']){
                			return 0;
                		}
                		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                	});

                    $resp = $obsClient->completeMultipartUpload([
            			'Bucket' => $bucketName,
            			'Key' => $objectKey,
            			'UploadId' => $uploadId,
            			'Parts'=> $parts
                	]);

					$arr = explode('.', $sampleFilePath);
			        if(end($arr) != 'xls' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
			            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
			            unlinkFile($sampleFilePath);
			        }
					// unlinkFile($sampleFilePath);  //删除本地文件

                } catch ( ObsException $e ) {
                    $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                } finally{
                	$obsClient->close ();
                }

            //腾讯云
			} elseif ($cfg_ftpType == 4) {
                $autoload = true;
				$cosClient = new Qcloud\Cos\Client(array(
			        'region' => $custom_COSRegion,
			        'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
			        'credentials'=> array(
			            'secretId'  => $custom_COSSecretid,
			            'secretKey' => $custom_COSSecretkey
					)
				));

				try {
				    $result = $cosClient->upload(
				        $bucket = $custom_COSBucket, //格式：BucketName-APPID
				        $key = $__filepath,
				        $body = fopen($local_fileUrl, 'rb')
				    );

                    $arr = explode('.', $local_fileUrl);
			        if(end($arr) != 'xls' && !strstr($local_fileUrl, 'house/community') && !strstr($local_fileUrl, "card") && !strstr($local_fileUrl, "photo")){
			            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
			            unlinkFile($local_fileUrl);
			        }
				} catch (\Exception $e) {
				    // 请求失败
					$error = $e;
				}

            }

        } else {
            $error = "要操作的文件不存在";
        }

    }

    //输出错误信息
    if (!empty($error)) {
        echo '{"state":"ERROR","info":"' . $error . '"}';
        die;
    } else {
        echo '{"state":"SUCCESS","info":"' . $__filepath . '"}';
        die;
    }


//上传文件
} else {

    $canUse = '';

    //图集
    if ($type == "atlas") {
        //上传配置
        $config = array(
            "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $type, //保存路径
            "allowFiles" => explode("|", $cfg_atlasType), //文件允许格式
            "maxSize" => $cfg_atlasSize, //文件大小限制，单位KB
            "fileType" => $type  //要操作的图片类型
        );

        //附件
    } elseif ($type == "file") {
        //上传配置
        $config = array(
            "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $type, //保存路径
            "allowFiles" => explode("|", $cfg_softType), //文件允许格式
            "maxSize" => $cfg_softSize, //文件大小限制，单位KB
            "fileType" => $type  //要操作的图片类型
        );

        //照片
    } elseif ($type == "photo") {

        //判断功能是否可用
        global $cfg_avatarEditState;
        global $cfg_avatarEditInfo;
        $avatarEditState = (int)$cfg_avatarEditState;
        $avatarEditInfo = $cfg_avatarEditInfo ? $cfg_avatarEditInfo : "功能维护中，暂停使用！";
        if($avatarEditState){
            $canUse = $avatarEditInfo;
        }

        //上传配置
        $config = array(
            "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $type, //保存路径
            "allowFiles" => explode("|", $cfg_photoType), //文件允许格式
            "maxSize" => $cfg_photoSize, //文件大小限制，单位KB
            "fileType" => $type  //要操作的图片类型
        );

        //品牌LOGO
    } elseif ($type == "brandLogo") {
        //上传配置
        $config = array(
            "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $type, //保存路径
            "allowFiles" => explode("|", $cfg_thumbType), //文件允许格式
            "maxSize" => $cfg_thumbSize, //文件大小限制，单位KB
            "fileType" => $type  //要操作的图片类型
        );

    //favicon图标
    } elseif ($type == "favicon"){

      //上传配置
      $config = array(
          "savePath" => '', //保存路径
          "allowFiles" => array('ico'), //文件允许格式
          "maxSize" => $cfg_thumbSize, //文件大小限制，单位KB
          "fileType" => $type  //要操作的图片类型
      );

        //缩略图
    } else {
        if ($filetype == "flash") {
            //flash配置
            $config = array(
                "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $filetype, //保存路径
                "allowFiles" => array("swf"), //文件允许格式
                "maxSize" => $cfg_thumbSize, //文件大小限制，单位KB
                "fileType" => $filetype  //要操作的类型
            );
        } elseif ($filetype == "audio") {
            //音频配置
            $config = array(
                "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $filetype, //保存路径
                "allowFiles" => explode("|", $cfg_audioType), //文件允许格式
                "maxSize" => $cfg_audioSize, //文件大小限制，单位KB
                "fileType" => $filetype  //要操作的类型
            );

        } elseif ($filetype == "video") {

            //视频配置
            $config = array(
                "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $filetype, //保存路径
                "allowFiles" => explode("|", $cfg_videoType), //文件允许格式
                "maxSize" => $cfg_videoSize, //文件大小限制，单位KB
                "fileType" => $filetype  //要操作的类型
            );
        } elseif ($filetype == "file") {
            //附件配置
            $config = array(
                "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $filetype, //保存路径
                "allowFiles" => explode("|", $cfg_softType), //文件允许格式
                "maxSize" => $cfg_softSize, //文件大小限制，单位KB
                "fileType" => $filetype  //要操作的图片类型
            );
        } else {
            //缩略图配置
            $config = array(
                "savePath" => ".." . $cfg_uploadDir . "/" . $mod . "/" . $type, //保存路径
                "allowFiles" => explode("|", $cfg_thumbType), //文件允许格式
                "maxSize" => $cfg_thumbSize, //文件大小限制，单位KB
                "fileType" => $type  //要操作的图片类型
            );
        }
    }

    $error = "";

    //视频上传开关
    global $cfg_videoUploadState;
    $videoUploadState = isset($cfg_videoUploadState) ? (int)$cfg_videoUploadState : 1;
    if($filetype == 'video' && ($mod == 'tieba' || $mod == 'circle') && !$videoUploadState){
        $canUse = '视频上传功能已禁用！';
    }

    //不能上传的提前判断
    if($canUse){
        $error = $canUse;
        $info['state'] = $canUse;
    }else{
        //生成上传实例对象并完成上传
        $up = new upload("Filedata", $config, $base64);
        $info = $up->getFileInfo();
        $url = explode($cfg_uploadDir, $info["url"]);

        if($type == 'favicon'){
            $url = explode(HUONIAOROOT, $info["url"]);
        }
    }

    $picWidth = $picHeight = $duration = 0;

    $remoteType = '';

    $autoload = false;
    $dsql = new dsql($dbo);
    $userLogin = new userLogin($dbo);
    $userid = $userLogin->getMemberID();
    $uid = $userLogin->getUserID();

    //图片压缩
    global $cfg_imageCompress;
    $isImageCompress = is_null($cfg_imageCompress) ? true : (int)$cfg_imageCompress;
    if($isImageCompress && !strstr($filetype, 'adv') && !strstr($utype, 'adv') && !isAndroidApp()){
        if($info['state'] == "SUCCESS"){
            $fileClass_ = explode(".", $info["originalName"]);
            $fileClass_ = $fileClass_[count($fileClass_) - 1];
            $fileClass = chkType($fileClass_);
            if($fileClass=="image"){
                $imgSize = @getimagesize($info['url']);
                $picWidth = (int)$imgSize[0];
                $picHeight = (int)$imgSize[1];

                //开始压缩图片...
                $source =  $info['url'];
                //原图片名称
                $dst_img = $info['url'];
                //压缩后图片的名称
                $percent = 1;
                if($picWidth>1000 && $picWidth<5000){
                    $percent = 0.8;
                }elseif($picWidth>=5000){
                    $percent = 0.5;
                }
                #原图压缩，不缩放，但体积大大降低
                (new imgcompress($source,$percent))->compressImg($dst_img);

                $info['size'] = filesize(HUONIAOROOT . str_replace('../', '/', $info['url']));
            }
        }
    }

    //如果是非管理员上传，查询华为云内容审核接口
    if($uid < 0 && $info['state'] == "SUCCESS"){
        $fileClass_ = explode(".", $info["originalName"]);
        $fileClass_ = $fileClass_[count($fileClass_) - 1];
        $fileClass = chkType($fileClass_);

        //如果图片类型的
        if($fileClass == 'image'){

            //华为云内容审核接口
            global $cfg_moderationTP;
            global $cfg_moderation_region;
            global $cfg_moderation_key;
            global $cfg_moderation_secret;
            global $cfg_moderation_platform;
            global $cfg_moderation_aliyun_region;
            global $cfg_moderation_aliyun_key;
            global $cfg_moderation_aliyun_secret;
        
            $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

            //开启图片内容审核
            if($cfg_moderationTP){

                //华为云
                if($cfg_moderation_platform == 'huawei'){
                    require_once HUONIAOINC . "/class/moderation/huawei/image.php";
                    require_once HUONIAOINC . "/class/moderation/huawei/utils.php";

                    init_region($cfg_moderation_region);

                    //url方式
                    $_url = $cfg_secureAccess . $cfg_basehost . '/' . str_replace('../', '', $info['url']);
                    // $_data = image_content_aksk($cfg_moderation_key, $cfg_moderation_secret, "", $_url, array("all"), 0);

                    //base64方式
                    $_data = image_content_aksk($cfg_moderation_key, $cfg_moderation_secret, file_to_base64($info['url']), "", array("all"), 0);

                    $_data = json_decode($_data, true);
                    if(is_array($_data)){
                        //接口验证失败
                        if($_data['error_msg']){
                            $info['state'] = "内容审核接口验证失败：" . $_data['error_msg'];

                        //图片被拦截
                        }else{
                            if($_data['result']['suggestion'] != 'pass'){
                                $arr = array();
                                $category_suggestions = $_data['result']['category_suggestions'];
                                if($category_suggestions['politics'] != 'pass'){
                                    array_push($arr, '涉及政治人物');
                                }
                                if($category_suggestions['terrorism'] != 'pass'){
                                    array_push($arr, '涉政暴恐');
                                }
                                if($category_suggestions['porn'] != 'pass'){
                                    array_push($arr, '涉黄');
                                }

                                $info['state'] = '图片内容' . join('、', $arr) . '，上传失败！';

                                //删除本地图片
                                unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
                            }
                        }
                    }
                }

                //阿里云
                elseif($cfg_moderation_platform == 'aliyun'){

                    require_once HUONIAOINC . "/class/moderation/aliyun/image.php";
                    $config = array(
                        "accessKeyId" => $cfg_moderation_aliyun_key,
                        "accessKeySecret" => $cfg_moderation_aliyun_secret,
                        "endpoint" => $cfg_moderation_aliyun_region,
                        "url" => $cfg_secureAccess . $cfg_basehost . str_replace('../', '/', $info['url'])
                    );
        
                    $moderation_image = new moderation_image();
                    $ret = $moderation_image::main($config);
                    if($ret['Code'] == 200){
                        $Data = $ret['Data'];
                        $RiskLevel = $Data['RiskLevel'];
                        $Result = $Data['Result'];
                        if($RiskLevel != 'none'){
                            $arr = array();
                            if($Result){
                                foreach($Result as $key => $value){
                                    $Description = $value['Description'];
                                    array_push($arr, $Description);
                                }
                            }
                            $info['state'] = '图片中含有【' . join('、', $arr) . '】相关内容，上传失败！';

                            //删除本地图片
                            unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
                        }
                    }

                }

            }

        }
    }

    $pushRemote = true;

    //判断状态
    if ($info['state'] == "SUCCESS") {

        $fileClass_ = explode(".", $info["originalName"]);
        $fileClass_ = $fileClass_[count($fileClass_) - 1];
        $fileClass = chkType($fileClass_);

        //APP端IM即时通讯附件
        //需要记录附件发送相关信息，发送人，接收人，发送时间，附件地址
        //在原接口地址基础上，新增：&chat=1&from=发送人ID&to=接收人ID&date=1531906792
        if($chat){

          // $date = (int)substr($date, 0, 10);

          //音频转码
          if($fileClass == 'audio' && $fileClass_ == 'amr'){
            $cfg_ftpType = -1;

            //七牛转码
            $sql = $dsql->SetQuery("SELECT * FROM `#@__app_audio_video_config` LIMIT 0, 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $access_key    = $data['access_key'];
                $secret_key    = $data['secret_key'];
                $bucket        = $data['bucket'];
                $pipeline      = $data['pipeline'];
                $domain        = $data['domain'];
                $audio_quality = $data['audio_quality'];
            }else{
                $error = "请先配置APP音视频处理参数！";
            }

            if(!$error){
              $auth = new Auth($access_key, $secret_key);
              $newName = create_sess_id();
              $savekey = Qiniu\base64_urlSafeEncode($bucket.':'.$newName.'.mp3');

              //设置转码参数
              $fops = "avthumb/mp3/ab/{$audio_quality}k/ar/44100/acodec/libmp3lame";
              $fops = $fops.'|saveas/'.$savekey;

              $policy = array(
                  'persistentOps' => $fops,
                  'persistentPipeline' => $pipeline,
                  // 'persistentNotifyUrl' => 'https://www.kumanyun.com/qiniu.php'  //成功通知
              );

              //成功通知结果   https://developer.qiniu.com/dora/manual/3686/pfop-directions-for-use

              //实例
              //{"id":"z0.0A22344148402AA8255D522E3A269638","pipeline":"1380999352.huoniao","code":3,"desc":"The fop is failed","reqid":"nksAAGutzcK_XboV","inputBucket":"huoniao","inputKey":"/article/audio/large/2019/08/13/15656668738589.amr","items":[{"cmd":"avthumb/mp3/ab/160k/ar/44100/acodec/libmp3lame|saveas/aHVvbmlhbzoyODk2ZjdhMTQ2Y2VhNTFhNTQ5M2Q3NTdmZWVmZjg4MC5tcDM=","code":3,"desc":"The fop is failed","error":"execute fop cmd failed: source data is empty or fail to get source data","returnOld":0}]}

              //{"id":"z0.0A22344148402AA8255D522F4F27B893","pipeline":"1380999352.huoniao","code":0,"desc":"The fop was completed successfully","reqid":"nksAAALa_ZH8XboV","inputBucket":"huoniao","inputKey":"/article/audio/large/2019/08/13/1565667150637.amr","items":[{"cmd":"avthumb/mp3/ab/160k/ar/44100/acodec/libmp3lame|saveas/aHVvbmlhbzpkNzZkNGE2YWM2YjlmMjYzMmUxMzJjMDU5MjU5Njg3Zi5tcDM=","code":0,"desc":"The fop was completed successfully","hash":"Ftn_1AbvWzJBoTdrDbF081Drd1Ef","key":"d76d4a6ac6b9f2632e132c059259687f.mp3","returnOld":0}]}

              //code	int	状态码，0 表示成功，1 表示等待处理，2 表示正在处理，3 表示处理失败，4 表示回调失败。
              //desc	string	状态码对应的详细描述。



              //指定上传转码命令
              $uptoken = $auth->uploadToken($bucket, null, 3600, $policy);

              $uploadMgr = new UploadManager();
              list($ret, $err) = $uploadMgr->putFile($uptoken, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

              if ($err !== null) {
                  $error = "转码失败！" . $err;
              }else{

                  //此时七牛云中同一段音频文件有amr和MP3两个格式的两个文件同时存在
                  //$bucketMgr = new BucketManager($auth);
                  //
                  //为节省空间,删除amr格式文件
                  //不要删除，删除会影响七牛云转码，因为在转码过程中，如果将此文件删除，会导致转码失败
                  //$bucketMgr->delete($bucket, $url[1]);

                  //删除服务器上的amr文件
                  unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);

                  //由于使用七牛的地址直接播放会有延迟的问题，所以这里多做了一步从七牛再下载到本地的操作
                  // $file->OpenUrl("http://{$domain}/{$newName}.mp3"); # 远程文件地址
                  // $file->SaveToBin(HUONIAOROOT . $dir . $newName . ".mp3"); # 保存路径及文件名
                  // $file->Close(); # 释放资源

                  //验证文件是否下载成功
                  // if(!file_exists(HUONIAOROOT . $dir . $newName . ".mp3")){
                  // 	echo json_encode(array("state" => 200, "info" => "云端下载失败！"));
                  // }else{
                  $url[1] = "//{$domain}/{$newName}.mp3";
                  // }
              }
            }
          }

          if(!$error){
            $sql = $dsql->SetQuery("INSERT INTO `#@__".$mod."_chat` (`from`, `to`, `msg`, `date`) VALUE ('$from', '$to', '', '$date')");
            $aid = 0;
            $sql = $dsql->SetQuery("SELECT `id`, `date` FROM `#@__".$mod."_chat` WHERE `pid` = 0 AND ( (`from` = $from && `to` = $to) || (`from` = $to && `to` = $from) ) ");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $aid = $ret[0]['id'];
                if(strlen($ret[0]['date']) == 10){
                    $now = GetMkTime(time());
                    $sql = $dsql->SetQuery("UPDATE `#@__".$mod."_chat` SET `date` = '$now' WHERE `id` = $aid");
                    $dsql->dsqlOper($sql, "update");
                }
            }
            $sql = $dsql->SetQuery("INSERT INTO `#@__".$mod."_chat` (`from`, `to`, `msg`, `date`, `pid`) VALUE ('$from', '$to', '', '$date', '$aid')");
            $lastid = $dsql->dsqlOper($sql, "lastid");
          }
        }


        //视频文件创建生成封面，依赖ffmpeg
        $poster = '';
        $posterOrigin = '';
        global $cfg_ffmpeg;
        $cfg_ffmpeg = (int)$cfg_ffmpeg;  //是否启用ffmpeg
        if($fileClass == 'video' && $cfg_ffmpeg){

             $extractRes = extractVideoCover($info['url'], $info["originalName"]);
             if(is_array($extractRes)){
                $posterOrigin = $extractRes['url'];
                $poster = getFilePath($extractRes['url'], false);
                 $picWidth = $extractRes['videoWidth'];
                 $picHeight = $extractRes['videoHeight'];
                 $duration = $extractRes['videoLength'];
             }else{
                 $poster= '';
             }

             //视频压缩
            global $cfg_videoCompress;
            $isVideoCompress = is_null($cfg_videoCompress) ? true : (int)$cfg_videoCompress;
            //考虑到画质清晰度小于20M的视频不进行压缩
            if($info["size"] <= 20 * 1024 * 1024){
                $isVideoCompress = false;
            }
            if($isVideoCompress && !isAndroidApp()){
                $pushRemote = false;
            }
        }

        //音频转码并获取时长
        if($fileClass == 'audio' && $cfg_ffmpeg){

            //windows需要将ffmpeg.exe文件复制到网站根目录一份，linux需要把ffmpeg文件复制一份到/usr/bin/目录
            $dir = strtoupper(substr(PHP_OS,0,3)) === 'WIN' ? HUONIAOROOT . '/' : '';

            //对amr格式转码
            if($fileClass_ == 'amr'){
                $audio = HUONIAOROOT . str_replace('../', '/', $info['url']);
                $_newName = str_replace('amr', 'mp3', $audio);

                //转码
                $_ret = array();
                $cmd = $dir . "ffmpeg -i ".$audio." ".$_newName." 2>&1";  //结尾加 2>&1 可以输出调试信息
                exec($cmd, $_ret);

                //转码成功
                if(file_exists($_newName)){

                    //获取时长
                    if($_ret && is_array($_ret)){
                        foreach ($_ret as $everyLine){
                            if(preg_match("/Duration: (.*?),(.*)/",$everyLine,$matches)){
                                $duration = $matches[1]; //00:07:37.60
                                $duration = strtotime($duration) - strtotime("00:00:00");
                            }
                            if($duration){
                                break;
                            }
                        }
                    }

                    //删除amr文件
                    unlinkFile($info['url']);
                    $info['url'] = $_newName;  //使用新文件地址

                    $url = explode($cfg_uploadDir, $info["url"]);
                    $info["originalName"] = str_replace('.amr', '.mp3', $info["originalName"]);
                    $info["name"] = str_replace('.amr', '.mp3', $info["name"]);
                    $info["type"] = ".mp3";

                }
            
            }
            //其他格式直接获取时长
            else{

                $audio = HUONIAOROOT . str_replace('../', '/', $info['url']);

                //转码
                $_ret = array();
                $cmd = $dir . "ffmpeg -i ".$audio." 2>&1";  //结尾加 2>&1 可以输出调试信息
                exec($cmd, $_ret);

                //获取时长
                if($_ret && is_array($_ret)){
                    foreach ($_ret as $everyLine){
                        if(preg_match("/Duration: (.*?),(.*)/",$everyLine,$matches)){
                            $duration = $matches[1]; //00:07:37.60
                            $duration = strtotime($duration) - strtotime("00:00:00");
                        }
                        if($duration){
                            break;
                        }
                    }
                }

            }

       }


        if ($cardType){   //只用于身份证识别
            $up->smallImg(2000, 2000, "large", 80);
        }
        // 全景模块上传压缩包时只能上传到本地
        if(($mod == "quanjing" && $filetype == "zip") || $type == "favicon"){
            $cfg_ftpType = -1;
        }

        //资质类，自动加平铺水印
        if($type=="certificate" && !empty($cfg_waterZizhiText)){
            $markConfig['waterMarkPostion'] = 10; //平铺
            $markConfig['waterMarkType'] = 1; //文本类型
            $markConfig['waterMarkText'] = $cfg_waterZizhiText; //文本
            $markConfig['markFontsize'] = $cfg_zizhiTextFontsize;  //字体大小
            $markConfig['markFontColor'] = $cfg_zizhiTextColor;  //颜色
            $markConfig['markTransparent'] = $cfg_zizhiTextTransparent;  //透明度
            $markConfig['markQuality'] = 100;  //透明度
            $waterMark = $up->waterMark($markConfig);
        }
        //生成缩略图
        elseif ($type == "thumb") {
            if ($mod == "special" || $mod == "website") {
                if ($filetype == "image" && !$cfg_changeFileSize) {
                    $small = $up->smallImg($cfg_thumbSmallWidth, $cfg_thumbSmallHeight, "small", $cfg_quality);
                }
            } else {
				// $large = $up->smallImg($cfg_thumbLargeWidth, $cfg_thumbLargeHeight, "large", $cfg_quality);

				//非动态处理图片尺寸的，生成真实图片
				if(!$cfg_changeFileSize){
	                $small = $up->smallImg($cfg_thumbSmallWidth, $cfg_thumbSmallHeight, "small", $cfg_quality);
	                $middle = $up->smallImg($cfg_thumbMiddleWidth, $cfg_thumbMiddleHeight, "middle", $cfg_quality);
	                $o_large = $up->smallImg($cfg_thumbLargeWidth, $cfg_thumbLargeHeight, "o_large", $cfg_quality);
				}
            }

            //生成水印图片
            if ($thumbMarkState == 1 && $mod != "special" && $mod != "website" && $mod != "siteConfig") {
                if (empty($filetype) || $filetype == "image") {
                    $waterMark = $up->waterMark($markConfig);
                }
            }

        } else if ($type == "atlas" && $mod != "siteConfig" && $utype != "adv") {
			//非动态处理图片尺寸的，生成真实图片
			if(!$cfg_changeFileSize){
	            $small = $up->smallImg($cfg_atlasSmallWidth, $cfg_atlasSmallHeight, "small", $cfg_quality);
			}

            //生成水印图片
            if ($atlasMarkState == 1) {
                $waterMark = $up->waterMark($markConfig);
            }

        } else if ($type == "photo") {
			// $large = $up->smallImg($cfg_photoLargeWidth, $cfg_photoLargeHeight, "large", $cfg_quality);

			//非动态处理图片尺寸的，生成真实图片
			if(!$cfg_changeFileSize){
	            $small = $up->smallImg($cfg_photoSmallWidth, $cfg_photoSmallHeight, "small", $cfg_quality);
	            $middle = $up->smallImg($cfg_photoMiddleWidth, $cfg_photoMiddleHeight, "middle", $cfg_quality);
			}

        } elseif ($type == "brandLogo") {
            global $custom_brandSmallWidth;
            global $custom_brandSmallHeight;
            global $custom_brandMiddleWidth;
            global $custom_brandMiddleHeight;
            global $custom_brandLargeWidth;
            global $custom_brandLargeHeight;
			// $large = $up->smallImg($custom_brandLargeWidth, $custom_brandLargeHeight, "large", $cfg_quality);

			//非动态处理图片尺寸的，生成真实图片
			if(!$cfg_changeFileSize){
	            $small = $up->smallImg($custom_brandSmallWidth, $custom_brandSmallHeight, "small", $cfg_quality);
	            $middle = $up->smallImg($custom_brandMiddleWidth, $custom_brandMiddleHeight, "middle", $cfg_quality);
			}

        }


        if ($fileClass == "image") {
            $imgSize = @getimagesize($info['url']);
            $picWidth = (int)$imgSize[0];
            $picHeight = (int)$imgSize[1];
        }

        //上传到远程服务器

        //普通FTP模式
        if ($cfg_ftpType == 0 && $cfg_ftpState == 1 && $pushRemote) {
            $ftpConfig = array();
            if ($mod != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
                $ftpConfig = array(
                    "on" => $custom_ftpState, //是否开启
                    "host" => $custom_ftpServer, //FTP服务器地址
                    "port" => $custom_ftpPort, //FTP服务器端口
                    "username" => $custom_ftpUser, //FTP帐号
                    "password" => $custom_ftpPwd,  //FTP密码
                    "attachdir" => $custom_ftpDir,  //FTP上传目录
                    "attachurl" => $custom_ftpUrl,  //远程附件地址
                    "timeout" => $custom_ftpTimeout,  //FTP超时
                    "ssl" => $custom_ftpSSL,  //启用SSL连接
                    "pasv" => $custom_ftpPasv  //被动模式连接
                );
            }

            $huoniao_ftp = new ftp($ftpConfig);
            $huoniao_ftp->connect();
            if ($huoniao_ftp->connectid) {

                //专题和自助建站不需要大图
                if ($mod != "special" && $mod != "website") {
                    $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

                    if ($type != "config" && !$cfg_changeFileSize) {
                        $smallFile = str_replace("large", "small", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
                        $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $smallFile);
                    }
                    if ($type == "thumb" && !$cfg_changeFileSize) {
                        $middleFile = str_replace("large", "middle", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                        $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $middleFile);

                        $o_largeFile = str_replace("large", "o_large", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $o_largeFile;
                        $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $o_largeFile);
                    }
                    if (($type == "photo" || $type == "brandLogo") && !$cfg_changeFileSize) {
                        $middleFile = str_replace("large", "middle", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                        $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $middleFile);
                    }
                } else {
                    if ($type == "thumb" && ($filetype == "" || $filetype == "image")) {
                        //保留原图
                        if ($o == 'true') {
                            $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

							if(!$cfg_changeFileSize){
	                            $smallFile = str_replace("large", "small", $url[1]);
	                            $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
	                            $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $smallFile);
							}

                            //只留小图
                        } else {
                            $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

							if(!$cfg_changeFileSize){
	                            $smallFile = str_replace("large", "small", $url[1]);
	                            $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
	                            $huoniao_ftp->upload($fileRootUrl, $cfg_ftpDir . $smallFile);
							}
                        }
                    } else {
                        $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);
                    }
                }


            } else {
                $error = 'FTP连接失败，请检查配置信息！';
            }

            //阿里云OSS
        } elseif ($cfg_ftpType == 1 && $pushRemote) {
            $remoteType = 'aliyun';

			$OSSConfig = array(
				"bucketName" => $cfg_OSSBucket,
				"endpoint" => $cfg_EndPoint,
				"accessKey" => $cfg_OSSKeyID,
				"accessSecret" => $cfg_OSSKeySecret
			);

			if ($mod != "siteConfig") {
				$OSSConfig = array(
					"bucketName" => $custom_OSSBucket,
					"endpoint" => $custom_EndPoint,
					"accessKey" => $custom_OSSKeyID,
					"accessSecret" => $custom_OSSKeySecret
				);
			}

            //专题和自助建站不需要大图
            if ($mod != "special" && $mod != "website") {

				$OSSConfig['object'] = $url[1];
				$OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
				$ret = putObjectByRawApis($OSSConfig);

                if ($type != "config" && !$cfg_changeFileSize) {
                    $smallFile = str_replace("large", "small", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;

                    if(file_exists($fileRootUrl)){
						$OSSConfig['object'] = $smallFile;
						$OSSConfig['uploadFile'] = $fileRootUrl;
						$ret = putObjectByRawApis($OSSConfig);
                    }
                }
                if ($type == "thumb" && !$cfg_changeFileSize) {
                    $middleFile = str_replace("large", "middle", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                    if(file_exists($fileRootUrl)){
						$OSSConfig['object'] = $middleFile;
						$OSSConfig['uploadFile'] = $fileRootUrl;
						$ret = putObjectByRawApis($OSSConfig);
                    }

                    $o_largeFile = str_replace("large", "o_large", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $o_largeFile;
                    if(file_exists($fileRootUrl)){
						$OSSConfig['object'] = $o_largeFile;
						$OSSConfig['uploadFile'] = $fileRootUrl;
						$ret = putObjectByRawApis($OSSConfig);
                    }
                }
                if (($type == "photo" || $type == "brandLogo") && !$cfg_changeFileSize) {
                    $middleFile = str_replace("large", "middle", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                    if(file_exists($fileRootUrl)){
						$OSSConfig['object'] = $middleFile;
						$OSSConfig['uploadFile'] = $fileRootUrl;
						$ret = putObjectByRawApis($OSSConfig);
                    }
                }
            } else {
				$OSSConfig['object'] = $url[1];
				$OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
				$ret = putObjectByRawApis($OSSConfig);

                if ($type == "thumb" && ($filetype == "" || $filetype == "image") && !$cfg_changeFileSize) {
                    //保留原图
                    if ($o == 'true') {

                        $smallFile = str_replace("large", "small", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
                        if(file_exists($fileRootUrl)){
							$OSSConfig['object'] = $smallFile;
							$OSSConfig['uploadFile'] = $fileRootUrl;
							$ret = putObjectByRawApis($OSSConfig);
                        }

                        //只留小图
                    } else {
                        $smallFile = str_replace("large", "small", $url[1]);
                        if(file_exists($smallFile)){
                            if(file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])){
								$OSSConfig['object'] = $smallFile;
								$OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
								$ret = putObjectByRawApis($OSSConfig);
                            }
                        }
                    }
                } else {
                    if(file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])){
						$OSSConfig['object'] = $url[1];
						$OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
						$ret = putObjectByRawApis($OSSConfig);
                    }
                }
            }

			if ($ret['state'] == 200) {
				$error = addslashes($ret['info']);
			}

        //七牛云
        } elseif ($cfg_ftpType == 2 && $pushRemote) {
            $remoteType = 'qiniu';
            $autoload = true;
            $accessKey = $cfg_QINIUAccessKey;
            $secretKey = $cfg_QINIUSecretKey;
            $bucket = $cfg_QINIUbucket;

            if($mod != 'siteConfig'){
              $accessKey = $custom_QINIUAccessKey;
              $secretKey = $custom_QINIUSecretKey;
              $bucket = $custom_QINIUbucket;
            }

            // 构建鉴权对象
            $auth = new Auth($accessKey, $secretKey);

            //视频转码
            // if($filetype == 'video' && $fileClass_ != 'mp4'){
            //   $url1 = str_replace('.'.$fileClass_, '.mp4', $url[1]);
            //   $newName = substr(str_replace('/', '_', $url1), 1);
            //   $savekey = Qiniu\base64_urlSafeEncode($bucket.':'.$url1);
            //
            //   //设置转码参数
            //   $fops = "avthumb/mp4";
            //   $fops = $fops.'|saveas/'.$savekey;
            //
            //   $policy = array(
            //       'persistentOps' => $fops,
            //       'persistentPipeline' => $bucket
            //   );
            //   $token = $auth->uploadToken($bucket, null, 3600, $policy);
            // }else{
            // }
            $token = $auth->uploadToken($bucket, null);

            // 生成上传 Token

            $uploadMgr = new UploadManager();

            //专题和自助建站不需要大图
            if ($mod != "special" && $mod != "website") {
                list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

                if($filetype == 'video' && $fileClass_ != 'mp4'){
                  // $url[1] = $url1;
                }

                if ($type != "config" && !$cfg_changeFileSize) {
                    $smallFile = str_replace("large", "small", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
                    if (file_exists($fileRootUrl)) {
                        list($ret, $err) = $uploadMgr->putFile($token, $smallFile, $fileRootUrl);
                    }
                }
                if ($type == "thumb" && ($filetype == "" || $filetype == "image") && !$cfg_changeFileSize) {
                    $middleFile = str_replace("large", "middle", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                    if(file_exists($fileRootUrl)){
                        list($ret, $err) = $uploadMgr->putFile($token, $middleFile, $fileRootUrl);
                    }

                    $o_largeFile = str_replace("large", "o_large", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $o_largeFile;
                    if(file_exists($fileRootUrl)){
                        list($ret, $err) = $uploadMgr->putFile($token, $o_largeFile, $fileRootUrl);
                    }
                }
                if ($type == "photo" || $type == "brandLogo" && !$cfg_changeFileSize) {
                    $middleFile = str_replace("large", "middle", $url[1]);
                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
                    if(file_exists($fileRootUrl)){
                        list($ret, $err) = $uploadMgr->putFile($token, $middleFile, $fileRootUrl);
                    }
                }
            } else {
                list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

                if ($type == "thumb" && ($filetype == "" || $filetype == "image") && !$cfg_changeFileSize) {
                    //保留原图
                    if ($o == 'true') {

                        $smallFile = str_replace("large", "small", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
                        if(file_exists($fileRootUrl)){
                            list($ret, $err) = $uploadMgr->putFile($token, $smallFile, $fileRootUrl);
                        }

                        //只留小图
                    } else {
                        $smallFile = str_replace("large", "small", $url[1]);
                        if(file_exists($smallFile)){
                            if(file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])){
                                list($ret, $err) = $uploadMgr->putFile($token, $smallFile, HUONIAOROOT . $cfg_uploadDir . $url[1]);
                            }
                        }
                    }
                } else {
                    // list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);
                }
            }
            if ($err !== null) {
                $error = $err;
            }

        //华为云
        } elseif ($cfg_ftpType == 3 && $pushRemote) {
            $ak = $cfg_OBSKeyID;
            $sk = $cfg_OBSKeySecret;
            $endpoint = $cfg_OBSEndpoint;
            $bucketName = $cfg_OBSBucket;

            if($mod != 'siteConfig'){
                $ak = $custom_OBSKeyID;
                $sk = $custom_OBSKeySecret;
                $endpoint = $custom_OBSEndpoint;
                $bucketName = $custom_OBSBucket;
            }

            $autoload = true;
            $obsClient = ObsClient::factory([
            	'key' => $ak,
            	'secret' => $sk,
            	'endpoint' => $endpoint,
            	'socket_timeout' => 30,
            	'connect_timeout' => 10
            ]);



            try{

                //专题和自助建站不需要大图
                if ($mod != "special" && $mod != "website") {

                    $objectKey = $url[1];
                    $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $objectKey;

                    //上传到的桶名，文件名
                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                    $uploadId = $resp['UploadId'];

                    //要上传的本地文件
                    createSampleFile($sampleFilePath);
                    $partSize = 5 * 1024 * 1024;
                	$fileLength = filesize($sampleFilePath);

                	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                    $parts = [];
                	$promise = null;

                    for($i = 0; $i < $partCount; $i++){
                		$offset = $i * $partSize;
                		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                		$partNumber = $i + 1;
                		$p = $obsClient->uploadPartAsync([
                				'Bucket' => $bucketName,
                				'Key' => $objectKey,
                				'UploadId' => $uploadId,
                				'PartNumber' => $partNumber,
                				'SourceFile' => $sampleFilePath,
                				'Offset' => $offset,
                				'PartSize' => $currPartSize
                		], function($exception, $resp) use(&$parts, $partNumber) {
                			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                		});

                		if($promise === null){
                			$promise = $p;
                		}
                	}

                    $promise -> wait();
                    usort($parts, function($a, $b){
                		if($a['PartNumber'] === $b['PartNumber']){
                			return 0;
                		}
                		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                	});

                    $resp = $obsClient->completeMultipartUpload([
            			'Bucket' => $bucketName,
            			'Key' => $objectKey,
            			'UploadId' => $uploadId,
            			'Parts'=> $parts
                	]);

					$arr = explode('.', $sampleFilePath);
			        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
			            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
			            unlinkFile($sampleFilePath);
			        }
					// unlinkFile($sampleFilePath);  //删除本地文件


                    if ($type != "config" && !$cfg_changeFileSize) {
                        $smallFile = str_replace("large", "small", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;

                        if(file_exists($fileRootUrl)){
                            $objectKey = $smallFile;
                            $sampleFilePath = $fileRootUrl;

                            //上传到的桶名，文件名
                            $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                            $uploadId = $resp['UploadId'];

                            //要上传的本地文件
                            createSampleFile($sampleFilePath);
                            $partSize = 5 * 1024 * 1024;
                        	$fileLength = filesize($sampleFilePath);

                        	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                            $parts = [];
                        	$promise = null;

                            for($i = 0; $i < $partCount; $i++){
                        		$offset = $i * $partSize;
                        		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                        		$partNumber = $i + 1;
                        		$p = $obsClient->uploadPartAsync([
                        				'Bucket' => $bucketName,
                        				'Key' => $objectKey,
                        				'UploadId' => $uploadId,
                        				'PartNumber' => $partNumber,
                        				'SourceFile' => $sampleFilePath,
                        				'Offset' => $offset,
                        				'PartSize' => $currPartSize
                        		], function($exception, $resp) use(&$parts, $partNumber) {
                        			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        		});

                        		if($promise === null){
                        			$promise = $p;
                        		}
                        	}

                            $promise -> wait();
                            usort($parts, function($a, $b){
                        		if($a['PartNumber'] === $b['PartNumber']){
                        			return 0;
                        		}
                        		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        	});

                            $resp = $obsClient->completeMultipartUpload([
                    			'Bucket' => $bucketName,
                    			'Key' => $objectKey,
                    			'UploadId' => $uploadId,
                    			'Parts'=> $parts
                        	]);

							$arr = explode('.', $sampleFilePath);
					        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
					            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
					            unlinkFile($sampleFilePath);
					        }
							// unlinkFile($sampleFilePath);  //删除本地文件
                        }

                    }
                    if ($type == "thumb" && !$cfg_changeFileSize) {
                        $middleFile = str_replace("large", "middle", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;

                        if(file_exists($fileRootUrl)){
                            $objectKey = $middleFile;
                            $sampleFilePath = $fileRootUrl;

                            //上传到的桶名，文件名
                            $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                            $uploadId = $resp['UploadId'];

                            //要上传的本地文件
                            createSampleFile($sampleFilePath);
                            $partSize = 5 * 1024 * 1024;
                        	$fileLength = filesize($sampleFilePath);

                        	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                            $parts = [];
                        	$promise = null;

                            for($i = 0; $i < $partCount; $i++){
                        		$offset = $i * $partSize;
                        		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                        		$partNumber = $i + 1;
                        		$p = $obsClient->uploadPartAsync([
                        				'Bucket' => $bucketName,
                        				'Key' => $objectKey,
                        				'UploadId' => $uploadId,
                        				'PartNumber' => $partNumber,
                        				'SourceFile' => $sampleFilePath,
                        				'Offset' => $offset,
                        				'PartSize' => $currPartSize
                        		], function($exception, $resp) use(&$parts, $partNumber) {
                        			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        		});

                        		if($promise === null){
                        			$promise = $p;
                        		}
                        	}

                            $promise -> wait();
                            usort($parts, function($a, $b){
                        		if($a['PartNumber'] === $b['PartNumber']){
                        			return 0;
                        		}
                        		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        	});

                            $resp = $obsClient->completeMultipartUpload([
                    			'Bucket' => $bucketName,
                    			'Key' => $objectKey,
                    			'UploadId' => $uploadId,
                    			'Parts'=> $parts
                        	]);

							$arr = explode('.', $sampleFilePath);
					        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
					            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
					            unlinkFile($sampleFilePath);
					        }
							// unlinkFile($sampleFilePath);  //删除本地文件

                        }



                        $o_largeFile = str_replace("large", "o_large", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $o_largeFile;

                        if(file_exists($fileRootUrl)){
                            $objectKey = $o_largeFile;
                            $sampleFilePath = $fileRootUrl;

                            //上传到的桶名，文件名
                            $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                            $uploadId = $resp['UploadId'];

                            //要上传的本地文件
                            createSampleFile($sampleFilePath);
                            $partSize = 5 * 1024 * 1024;
                        	$fileLength = filesize($sampleFilePath);

                        	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                            $parts = [];
                        	$promise = null;

                            for($i = 0; $i < $partCount; $i++){
                        		$offset = $i * $partSize;
                        		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                        		$partNumber = $i + 1;
                        		$p = $obsClient->uploadPartAsync([
                        				'Bucket' => $bucketName,
                        				'Key' => $objectKey,
                        				'UploadId' => $uploadId,
                        				'PartNumber' => $partNumber,
                        				'SourceFile' => $sampleFilePath,
                        				'Offset' => $offset,
                        				'PartSize' => $currPartSize
                        		], function($exception, $resp) use(&$parts, $partNumber) {
                        			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        		});

                        		if($promise === null){
                        			$promise = $p;
                        		}
                        	}

                            $promise -> wait();
                            usort($parts, function($a, $b){
                        		if($a['PartNumber'] === $b['PartNumber']){
                        			return 0;
                        		}
                        		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        	});

                            $resp = $obsClient->completeMultipartUpload([
                    			'Bucket' => $bucketName,
                    			'Key' => $objectKey,
                    			'UploadId' => $uploadId,
                    			'Parts'=> $parts
                        	]);

							$arr = explode('.', $sampleFilePath);
					        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
					            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
					            unlinkFile($sampleFilePath);
					        }
							// unlinkFile($sampleFilePath);  //删除本地文件
                        }

                    }
                    if (($type == "photo" || $type == "brandLogo") && !$cfg_changeFileSize) {
                        $middleFile = str_replace("large", "middle", $url[1]);
                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;

                        if(file_exists($fileRootUrl)){
                            $objectKey = $middleFile;
                            $sampleFilePath = $fileRootUrl;

                            //上传到的桶名，文件名
                            $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                            $uploadId = $resp['UploadId'];

                            //要上传的本地文件
                            createSampleFile($sampleFilePath);
                            $partSize = 5 * 1024 * 1024;
                        	$fileLength = filesize($sampleFilePath);

                        	$partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                            $parts = [];
                        	$promise = null;

                            for($i = 0; $i < $partCount; $i++){
                        		$offset = $i * $partSize;
                        		$currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                        		$partNumber = $i + 1;
                        		$p = $obsClient->uploadPartAsync([
                        				'Bucket' => $bucketName,
                        				'Key' => $objectKey,
                        				'UploadId' => $uploadId,
                        				'PartNumber' => $partNumber,
                        				'SourceFile' => $sampleFilePath,
                        				'Offset' => $offset,
                        				'PartSize' => $currPartSize
                        		], function($exception, $resp) use(&$parts, $partNumber) {
                        			$parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        		});

                        		if($promise === null){
                        			$promise = $p;
                        		}
                        	}

                            $promise -> wait();
                            usort($parts, function($a, $b){
                        		if($a['PartNumber'] === $b['PartNumber']){
                        			return 0;
                        		}
                        		return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        	});

                            $resp = $obsClient->completeMultipartUpload([
                    			'Bucket' => $bucketName,
                    			'Key' => $objectKey,
                    			'UploadId' => $uploadId,
                    			'Parts'=> $parts
                        	]);

							$arr = explode('.', $sampleFilePath);
					        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
					            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
					            unlinkFile($sampleFilePath);
					        }
							// unlinkFile($sampleFilePath);  //删除本地文件
                        }

                    }
                } else {

                    $objectKey = $url[1];
                    $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $url[1];

                    if(file_exists($sampleFilePath)){
                        //上传到的桶名，文件名
                        $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                        $uploadId = $resp['UploadId'];

                        //要上传的本地文件
                        createSampleFile($sampleFilePath);
                        $partSize = 5 * 1024 * 1024;
                        $fileLength = filesize($sampleFilePath);

                        $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                        $parts = [];
                        $promise = null;

                        for($i = 0; $i < $partCount; $i++){
                            $offset = $i * $partSize;
                            $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                            $partNumber = $i + 1;
                            $p = $obsClient->uploadPartAsync([
                                    'Bucket' => $bucketName,
                                    'Key' => $objectKey,
                                    'UploadId' => $uploadId,
                                    'PartNumber' => $partNumber,
                                    'SourceFile' => $sampleFilePath,
                                    'Offset' => $offset,
                                    'PartSize' => $currPartSize
                            ], function($exception, $resp) use(&$parts, $partNumber) {
                                $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                            });

                            if($promise === null){
                                $promise = $p;
                            }
                        }

                        $promise -> wait();
                        usort($parts, function($a, $b){
                            if($a['PartNumber'] === $b['PartNumber']){
                                return 0;
                            }
                            return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        });

                        $resp = $obsClient->completeMultipartUpload([
                            'Bucket' => $bucketName,
                            'Key' => $objectKey,
                            'UploadId' => $uploadId,
                            'Parts'=> $parts
                        ]);

						$arr = explode('.', $sampleFilePath);
				        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
				            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
				            unlinkFile($sampleFilePath);
				        }
						// unlinkFile($sampleFilePath);  //删除本地文件
                    }



                    if ($type == "thumb" && ($filetype == "" || $filetype == "image") && !$cfg_changeFileSize) {
                        //保留原图
                        if ($o == 'true') {

                            $smallFile = str_replace("large", "small", $url[1]);
                            $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;

                            if(file_exists($fileRootUrl)){
                                $objectKey = $smallFile;
                                $sampleFilePath = $fileRootUrl;

                                //上传到的桶名，文件名
                                $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                                $uploadId = $resp['UploadId'];

                                //要上传的本地文件
                                createSampleFile($sampleFilePath);
                                $partSize = 5 * 1024 * 1024;
                                $fileLength = filesize($sampleFilePath);

                                $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                                $parts = [];
                                $promise = null;

                                for($i = 0; $i < $partCount; $i++){
                                    $offset = $i * $partSize;
                                    $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                                    $partNumber = $i + 1;
                                    $p = $obsClient->uploadPartAsync([
                                            'Bucket' => $bucketName,
                                            'Key' => $objectKey,
                                            'UploadId' => $uploadId,
                                            'PartNumber' => $partNumber,
                                            'SourceFile' => $sampleFilePath,
                                            'Offset' => $offset,
                                            'PartSize' => $currPartSize
                                    ], function($exception, $resp) use(&$parts, $partNumber) {
                                        $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                                    });

                                    if($promise === null){
                                        $promise = $p;
                                    }
                                }

                                $promise -> wait();
                                usort($parts, function($a, $b){
                                    if($a['PartNumber'] === $b['PartNumber']){
                                        return 0;
                                    }
                                    return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                                });

                                $resp = $obsClient->completeMultipartUpload([
                                    'Bucket' => $bucketName,
                                    'Key' => $objectKey,
                                    'UploadId' => $uploadId,
                                    'Parts'=> $parts
                                ]);

								$arr = explode('.', $sampleFilePath);
						        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
						            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
						            unlinkFile($sampleFilePath);
						        }
								// unlinkFile($sampleFilePath);  //删除本地文件
                            }

                            //只留小图
                        } else {
                            $smallFile = str_replace("large", "small", $url[1]);
                            if(file_exists($smallFile)){

                                $objectKey = $smallFile;
                                $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $url[1];

                                if(file_exists($sampleFilePath)){
                                    //上传到的桶名，文件名
                                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                                    $uploadId = $resp['UploadId'];

                                    //要上传的本地文件
                                    createSampleFile($sampleFilePath);
                                    $partSize = 5 * 1024 * 1024;
                                    $fileLength = filesize($sampleFilePath);

                                    $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                                    $parts = [];
                                    $promise = null;

                                    for($i = 0; $i < $partCount; $i++){
                                        $offset = $i * $partSize;
                                        $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                                        $partNumber = $i + 1;
                                        $p = $obsClient->uploadPartAsync([
                                                'Bucket' => $bucketName,
                                                'Key' => $objectKey,
                                                'UploadId' => $uploadId,
                                                'PartNumber' => $partNumber,
                                                'SourceFile' => $sampleFilePath,
                                                'Offset' => $offset,
                                                'PartSize' => $currPartSize
                                        ], function($exception, $resp) use(&$parts, $partNumber) {
                                            $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                                        });

                                        if($promise === null){
                                            $promise = $p;
                                        }
                                    }

                                    $promise -> wait();
                                    usort($parts, function($a, $b){
                                        if($a['PartNumber'] === $b['PartNumber']){
                                            return 0;
                                        }
                                        return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                                    });

                                    $resp = $obsClient->completeMultipartUpload([
                                        'Bucket' => $bucketName,
                                        'Key' => $objectKey,
                                        'UploadId' => $uploadId,
                                        'Parts'=> $parts
                                    ]);

									$arr = explode('.', $sampleFilePath);
							        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
							            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
							            unlinkFile($sampleFilePath);
							        }
									// unlinkFile($sampleFilePath);  //删除本地文件
                                }

                            }
                        }
                    } else {
                        $objectKey = $url[1];
                        $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $url[1];

                        if(file_exists($sampleFilePath)){
                            //上传到的桶名，文件名
                            $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                            $uploadId = $resp['UploadId'];

                            //要上传的本地文件
                            createSampleFile($sampleFilePath);
                            $partSize = 5 * 1024 * 1024;
                            $fileLength = filesize($sampleFilePath);

                            $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                            $parts = [];
                            $promise = null;

                            for($i = 0; $i < $partCount; $i++){
                                $offset = $i * $partSize;
                                $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                                $partNumber = $i + 1;
                                $p = $obsClient->uploadPartAsync([
                                        'Bucket' => $bucketName,
                                        'Key' => $objectKey,
                                        'UploadId' => $uploadId,
                                        'PartNumber' => $partNumber,
                                        'SourceFile' => $sampleFilePath,
                                        'Offset' => $offset,
                                        'PartSize' => $currPartSize
                                ], function($exception, $resp) use(&$parts, $partNumber) {
                                    $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                                });

                                if($promise === null){
                                    $promise = $p;
                                }
                            }

                            $promise -> wait();
                            usort($parts, function($a, $b){
                                if($a['PartNumber'] === $b['PartNumber']){
                                    return 0;
                                }
                                return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                            });

                            $resp = $obsClient->completeMultipartUpload([
                                'Bucket' => $bucketName,
                                'Key' => $objectKey,
                                'UploadId' => $uploadId,
                                'Parts'=> $parts
                            ]);

							$arr = explode('.', $sampleFilePath);
					        if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($sampleFilePath, 'house/community') && !strstr($sampleFilePath, "card") && !strstr($sampleFilePath, "photo")){
					            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
					            unlinkFile($sampleFilePath);
					        }
							// unlinkFile($sampleFilePath);  //删除本地文件
                        }

                    }
                }

            } catch ( ObsException $e ) {
                $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
            } finally{
            	$obsClient->close ();
            }

            //腾讯云COS
        } elseif ($cfg_ftpType == 4 && $pushRemote) {

			$COSBucket = $cfg_COSBucket;
            $COSRegion = $cfg_COSRegion;
            $COSSecretid = $cfg_COSSecretid;
            $COSSecretkey = $cfg_COSSecretkey;

            if($mod != 'siteConfig'){
                $COSBucket = $custom_COSBucket;
                $COSRegion = $custom_COSRegion;
                $COSSecretid = $custom_COSSecretid;
                $COSSecretkey = $custom_COSSecretkey;
            }

			$autoload = true;
			$cosClient = new Qcloud\Cos\Client(array(
				'region' => $COSRegion,
				'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
				'credentials'=> array(
					'secretId'  => $COSSecretid,
					'secretKey' => $COSSecretkey
				)
			));

			try {

	            //专题和自助建站不需要大图
	            if ($mod != "special" && $mod != "website") {

					$cosClient->upload(
						$bucket = $COSBucket, //格式：BucketName-APPID
						$key = $url[1],
						$body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
					);

					$arr = explode('.', $url[1]);
					if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($url[1], 'house/community') && !strstr($url[1], "card") && !strstr($url[1], "photo")){
						// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
						unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
					}

	                if ($type != "config" && !$cfg_changeFileSize) {
	                    $smallFile = str_replace("large", "small", $url[1]);
	                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;

	                    if(file_exists($fileRootUrl)){
							$cosClient->upload(
								$bucket = $COSBucket, //格式：BucketName-APPID
								$key = $smallFile,
								$body = fopen($fileRootUrl, 'rb')
							);
							$arr = explode('.', $fileRootUrl);
							if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($fileRootUrl, 'house/community') && !strstr($fileRootUrl, "card") && !strstr($fileRootUrl, "photo")){
								// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
								unlinkFile($fileRootUrl);
							}
	                    }
	                }
	                if ($type == "thumb" && !$cfg_changeFileSize) {
	                    $middleFile = str_replace("large", "middle", $url[1]);
	                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
	                    if(file_exists($fileRootUrl)){
							$cosClient->upload(
								$bucket = $COSBucket, //格式：BucketName-APPID
								$key = $middleFile,
								$body = fopen($fileRootUrl, 'rb')
							);
							$arr = explode('.', $fileRootUrl);
							if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($fileRootUrl, 'house/community') && !strstr($fileRootUrl, "card") && !strstr($fileRootUrl, "photo")){
								// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
								unlinkFile($fileRootUrl);
							}
	                    }

	                    $o_largeFile = str_replace("large", "o_large", $url[1]);
	                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $o_largeFile;
	                    if(file_exists($fileRootUrl)){
							$cosClient->upload(
								$bucket = $COSBucket, //格式：BucketName-APPID
								$key = $o_largeFile,
								$body = fopen($fileRootUrl, 'rb')
							);
							$arr = explode('.', $fileRootUrl);
							if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($fileRootUrl, 'house/community') && !strstr($fileRootUrl, "card") && !strstr($fileRootUrl, "photo")){
								// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
								unlinkFile($fileRootUrl);
							}
	                    }
	                }
	                if (($type == "photo" || $type == "brandLogo") && !$cfg_changeFileSize) {
	                    $middleFile = str_replace("large", "middle", $url[1]);
	                    $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $middleFile;
	                    if(file_exists($fileRootUrl)){
							$cosClient->upload(
								$bucket = $COSBucket, //格式：BucketName-APPID
								$key = $middleFile,
								$body = fopen($fileRootUrl, 'rb')
							);
							$arr = explode('.', $fileRootUrl);
							if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($fileRootUrl, 'house/community') && !strstr($fileRootUrl, "card") && !strstr($fileRootUrl, "photo")){
								// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
								unlinkFile($fileRootUrl);
							}
	                    }
	                }
	            } else {
					$cosClient->upload(
						$bucket = $COSBucket, //格式：BucketName-APPID
						$key = $url[1],
						$body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
					);
					$arr = explode('.', $url[1]);
					if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($url[1], 'house/community') && !strstr($url[1], "card") && !strstr($url[1], "photo")){
						// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
						unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
					}

	                if ($type == "thumb" && ($filetype == "" || $filetype == "image") && !$cfg_changeFileSize) {
	                    //保留原图
	                    if ($o == 'true') {

	                        $smallFile = str_replace("large", "small", $url[1]);
	                        $fileRootUrl = HUONIAOROOT . $cfg_uploadDir . $smallFile;
	                        if(file_exists($fileRootUrl)){
								$cosClient->upload(
									$bucket = $COSBucket, //格式：BucketName-APPID
									$key = $smallFile,
									$body = fopen($fileRootUrl, 'rb')
								);
								$arr = explode('.', $fileRootUrl);
								if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($fileRootUrl, 'house/community') && !strstr($fileRootUrl, "card") && !strstr($fileRootUrl, "photo")){
									// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
									unlinkFile($fileRootUrl);
								}
	                        }

	                        //只留小图
	                    } else {
	                        $smallFile = str_replace("large", "small", $url[1]);
	                        if(file_exists($smallFile)){
	                            if(file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])){
									$cosClient->upload(
										$bucket = $COSBucket, //格式：BucketName-APPID
										$key = $smallFile,
										$body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
									);
									$arr = explode('.', $url[1]);
									if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($url[1], 'house/community') && !strstr($url[1], "card") && !strstr($url[1], "photo")){
										// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
										unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
									}
	                            }
	                        }
	                    }
	                } else {
	                    if(file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])){
							$cosClient->upload(
								$bucket = $COSBucket, //格式：BucketName-APPID
								$key = $url[1],
								$body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
							);
							$arr = explode('.', $url[1]);
							if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($url[1], 'house/community') && !strstr($url[1], "card") && !strstr($url[1], "photo")){
								// 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
								unlinkFile(HUONIAOROOT . $cfg_uploadDir . $url[1]);
							}
	                    }
	                }
	            }

			} catch (\Exception $e) {
				// 请求失败
				$error = $e;
			};

        }
    } else {
        $error = $info["state"];
    }

    $fid = "";
    $obj = htmlspecialchars(RemoveXSS($_REQUEST['obj']));

    if (($info["state"] == "SUCCESS" && $error == "") || $info["state"] == "REPEAT") {

        $originalName = addslashes($info["originalName"]);
        if (strlen($originalName) > 50) {
//            $originalName = substr($originalName, strlen($originalName) - 50);
            $originalName = cn_substrR($originalName, 50);
        }

        //对已经上传过的文件不做
        if($info["state"] == "REPEAT"){

            $fileClass_ = explode(".", $info["originalName"]);
            $fileClass_ = $fileClass_[count($fileClass_) - 1];
            $fileClass = chkType($fileClass_);

            $error = "";
            $info["state"] = "SUCCESS";
            $aid = $info["data"]["id"];
            $picWidth = $info["data"]["width"];
            $picHeight = $info["data"]['height'];
            $url[1] = $url[0];

            $fid = $aid;

            $_filePath = $info["data"]['path'];
            $_filePathArr = explode('.', $_filePath);
            $_filePathName = $_filePathArr[0] . '.jpg';

            //获取视频历史封面，规则：文件名除了后缀不一样，路径和文件名都是一样的
            if($fileClass == 'video'){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__attachment` WHERE `path` = '$_filePathName'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $poster = getFilePath($_filePathName, false);
                } 
            }
        }else{
            $videoParse = $pushRemote ? 0 : 1;  //视频解码？如果解码，则记录到数据库中，通过定时计划解码上传到远程然后删除本地文件
            $name = substr(strrchr($url[1], "/"), 1);
            $attachment = $dsql->SetQuery("INSERT INTO `#@__attachment` (`userid`, `filename`, `filetype`, `filesize`, `name`, `path`, `width`, `height`, `aid`, `pubdate`, `md5`, `duration`,`videoParse`) VALUES ('$userid', '" . $originalName . "', '" . $fileClass . "', '" . $info["size"] . "', '$name', '" . $url[1] . "', '$picWidth', '$picHeight', '" . $aid . "', '" . GetMkTime(time()) . "', '" . $info["md5"] . "',$duration,$videoParse)");
            $aid = $dsql->dsqlOper($attachment, "lastid");
        }
        if (is_numeric($aid)) {
            if($info['lockFile']!='' && file_exists($info['lockFile'])){
                unlinkFile($info['lockFile']);
            }

            $fid = $aid;

            //APP端即时聊天附件
            if(is_numeric($lastid) && $chat){

              $filePath_ = '/include/attachment.php?f='.$aid;
              $msg = '';
              if($fileClass == 'image'){
                $msg = '<img src="'.$filePath_.'" />';
              }elseif($fileClass == 'audio'){
                $msg = '<audio data-duration="'.$duration.'"><source src="'.$filePath_.'"></audio>';
              }elseif($fileClass == 'video'){
                $msg = '<video><source src="'.$filePath_.'" type="video/mp4"></video>';
              }

              if($msg){
                $sql = $dsql->SetQuery("UPDATE `#@__".$mod."_chat` SET `msg` = '$msg' WHERE `id` = $lastid");
                $dsql->dsqlOper($sql, "update");
              }else{
                $sql = $dsql->SetQuery("DELETE FROM `#@__".$mod."_chat` WHERE `id` = $lastid");
                $dsql->dsqlOper($sql, "update");
              }

            }

        } else {
            $error = "数据写入失败！";
        }
    }

    $info["state"] = $error != "" ? $error : $info["state"];

    //附件真实路径
    $turl = getFilePath($fid, false);
    //视频审核、音频审核
    global $cfg_moderationSP;
    global $cfg_moderationYP;
    global $cfg_secureAccess;
    global $cfg_basehost;
    $moderationCallbackUrl = $cfg_secureAccess.$cfg_basehost."/api/moderationCallback.php?id=".$fid;  //通知查询该id的审核信息
    if($fileClass=="audio" && isset($cfg_moderationYP) && !empty($cfg_moderationYP)){
        //音频审核
        global $autoload;
        $autoload = true;
        $moderationRes = RunCreateAudioModerationJob($turl,$moderationCallbackUrl);
        if($moderationRes!==false){
            $moderationRes = json_decode($moderationRes,true);
            $job_id = $moderationRes['job_id'];
            $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`=$fid");
            $dsql->update($sql);
        }
    }
    if($fileClass=="video" && isset($cfg_moderationSP) && !empty($cfg_moderationSP) && isset($isVideoCompress) && !$isVideoCompress){ //如果视频压缩了，则在压缩上传远程后再调用
        //视频审核
        $moderationRes = RunCreateVideoModerationJob($turl,5,$moderationCallbackUrl);
        if($moderationRes!==false){
            $moderationRes = json_decode($moderationRes,true);
            $job_id = $moderationRes['job_id'];
            $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`=$fid");
            $dsql->update($sql);
        }
    }

    //如果上面没有创建成功，这里根据云平台提供的方法，直接生成    
    if($fileClass == 'video' && $remoteType && $poster == ''){
        if($remoteType == 'aliyun'){
            $poster = $turl.'?x-oss-process=video/snapshot,t_0,f_jpg,w_0,h_0,m_fast,ar_auto';
        }elseif($remoteType == 'qiniu'){
            $poster = $turl.'?vframe/jpg/offset/1/rotate/auto';
        }
    }

    if($fileClass == "video" && !empty($posterOrigin) && empty($error)){
        $sql = $dsql::SetQuery("update `#@__attachment` set `poster`='".addslashes($posterOrigin)."' where `id`=$aid");
        $dsql->update($sql);
    }

    //考虑到服务器性能，这里直接保存
    $__fid = $fid;
    global $cfg_hideUrl;
    if($cfg_hideUrl && !strstr($info["originalName"], 'ImportTemp')){
        $fid = $fileClass=="video" ? $aid : $turl;
    }else{
        $fid = $fileClass=="video" ? $aid : $url[1];
    }
    $datetime = date('Ymd',time());
    $backstate =1;          //  控制验证反面的,暂时不使用
    if ($obj == 'front' && $cfg_cardState == 1){            //身份证正面
        $cardRes = getIdentCardPositive(remoteImageCompressParam(getFilePath($__fid, true, false)));
        if ($cardRes['error_code'] == 0 && $cardRes['result']['idcardno']) {
            $idcardno      = $cardRes['result']['idcardno'];
            $name          = $cardRes['result']['name'];
            $nationality   = $cardRes['result']['nationality'];
            $sex           = $cardRes['result']['sex'];
            $birth         = $cardRes['result']['birth'];
            $address       = $cardRes['result']['address'];
            echo '{"url":"' . $fid . '","turl": "' . $turl . '","fileType":"' . $info["type"] . '","fileSize":"' . $info["size"] . '","original":"' . $info["originalName"] . '","name":"' . $info["name"] . '","state":"' . $info["state"] . '","type":"' . $type . '","poster":"' . $poster . '", "width":"'.$picWidth.'", "height":"'.$picHeight.'","idcardno":"' . $idcardno . '","idcardname":"' . $name . '","nationality":"' . $nationality . '","sex":"' . $sex . '","birth":"' . $birth . '","address":"' . $address . '"}';
            die;
        }else{
            $info["state"] = '身份信息解析失败，请重新上传清晰有效的身份证照片!';
            echo '{"state":"' . $info["state"] . '"}';
            die;
        }
    }elseif($obj == 'back' && $cfg_cardState == 1 && $backstate == 0){                //身份证反面
        $cardRes = getIdentCardContrary(remoteImageCompressParam(getFilePath($__fid, true, false)));
        if ($cardRes['error_code'] == 0 && $cardRes['result']['image_status'] == 'normal') {
            $start_date        = $cardRes['result']['start_date'];
            $end_date          = $cardRes['result']['end_date'];
            if ($end_date  && ($end_date < $datetime)){
                $info["state"] = '身份证件已过期，请上传最新的身份证照片!';
                echo '{"state":"' . $info["state"] . '"}';
                die;
            }
            echo '{"url":"' . $fid . '","turl": "' . $turl . '","fileType":"' . $info["type"] . '","fileSize":"' . $info["size"] . '","original":"' . $info["originalName"] . '","name":"' . $info["name"] . '","state":"' . $info["state"] . '","type":"' . $type . '","poster":"' . $poster . '", "width":"'.$picWidth.'", "height":"'.$picHeight.'","start_date":"' . $start_date . '","end_date":"' . $end_date . '"}';
            die;
        }else{
            $info["state"] = '身份信息解析失败，请重新上传清晰有效的身份证照片!';
            echo '{"state":"' . $info["state"] . '"}';
            die;
        }
    
    //营业执照识别
    }elseif($obj == 'license' && $cfg_enterpriseBusinessDataState == 1){
        $cardRes = getLicenseCardInfo(remoteImageCompressParam(getFilePath($__fid, true, false)));
        if ($cardRes['error_code'] == 0 && $cardRes['result']['name']) {
            $companyName = $cardRes['result']['name'];  //识别到的公司名称
            $companyAddress = $cardRes['result']['address'];  //识别到的公司地址
            $companyPerson = $cardRes['result']['person'];  //识别到的公司法人
            $companyRegnum = $cardRes['result']['reg_num'];  //识别到的公司注册号
            $companyCreditcode = $cardRes['result']['creditcode'];  //识别到的公司信用代码
            $companyNumber = $cardRes['result']['number'];  //识别到的公司编号
            $companyRegtime = $cardRes['result']['regtime'];  //识别到的公司注册时间
            $companyValidperiod = $cardRes['result']['valid_period'];  //识别到的公司营业期限

            echo '{"url":"' . $fid . '","turl": "' . $turl . '","fileType":"' . $info["type"] . '","fileSize":"' . $info["size"] . '","original":"' . $info["originalName"] . '","name":"' . $info["name"] . '","state":"' . $info["state"] . '","type":"' . $type . '","poster":"' . $poster . '", "width":"'.$picWidth.'", "height":"'.$picHeight.'","companyName":"' . $companyName . '","companyAddress":"' . $companyAddress . '","companyPerson":"' . $companyPerson . '","companyRegnum":"' . $companyRegnum . '","companyCreditcode":"' . $companyCreditcode . '","companyNumber":"' . $companyNumber . '","companyRegtime":"' . $companyRegtime . '","companyValidperiod":"' . $companyValidperiod . '"}';
            die;
        }else{
            $info["state"] = '营业执照解析失败，请重新上传清晰有效的营业执照图片!';
            echo '{"state":"' . $info["state"] . '"}';
            die;
        }

    }else{
        if ($obj != "" && $obj != 'front' && $obj != 'back' && $obj != 'license') {
            echo "<script language='javascript'>";
            if (empty($fid) || !empty($error)) {
                echo "alert('" . $info["state"] . "');location.href = '/include/upfile.inc.php?mod=$mod&type=$type&obj=$obj&filetype=$filetype';";
            } else {
                echo "parent.uploadSuccess('" . $obj . "', '" . $fid . "', '" . str_replace(".", "", $info["type"]) . "', '" . $turl . "', '" . $poster . "');";
            }
            echo "</script>";
        } else {
            $ret = array(
                'url' => $fid,
                'turl' => $turl,
                'fileType' => $info["type"],
                'fileSize' => $info["size"],
                'original' => $info["originalName"],
                'name' => $info["name"],
                'state' => $info["state"],
                'type' => $type,
                'poster' => $poster,
                'width' => $picWidth,
                'height' => $picHeight,
                'duration' => $duration,
            );
            echo json_encode($ret);
        }
    }


    die;
}

/**
 * 修改一个图片 让其翻转指定度数
 *
 * @param string $filename 文件名（包括文件路径）
 * @param float $degrees 旋转度数
 * @return boolean
 */
function rotateAtlas($filename, $degrees = 90)
{
    //读取图片
    $data = @getimagesize($filename);
    if ($data == false) return false;
    //读取旧图片
    switch ($data[2]) {
        case 1:
            $src_f = imagecreatefromgif($filename);
            break;
        case 2:
            $src_f = imagecreatefromjpeg($filename);
            break;
        case 3:
            $src_f = imagecreatefrompng($filename);
            break;
    }
    if ($src_f == "") return false;
    $rotate = @imagerotate($src_f, $degrees, 0);
    if (!imagejpeg($rotate, $filename, 100)) return false;
    @imagedestroy($rotate);
    return true;
}

//判断文件类型
function chkType($f = NULL)
{
    if (!empty($f)) {
        $f = strtolower($f);
        global $cfg_softType;
        global $cfg_thumbType;
        $flashType = "swf";
        global $cfg_audioType;
        global $cfg_videoType;

        $softType_ = explode("|", $cfg_softType);
        $thumbType_ = explode("|", $cfg_thumbType);
        $flashType_ = explode("|", $flashType);
        $audioType_ = explode("|", $cfg_audioType);
        $videoType_ = explode("|", $cfg_videoType);

        if (in_array($f, $thumbType_)) return "image";
        if (in_array($f, $flashType_)) return "flash";
        if (in_array($f, $audioType_)) return "audio";
        if (in_array($f, $videoType_)) return "video";
        if (in_array($f, $softType_)) return "file";
    } else {
        return "file";
    }
}


//提取视频封面
function extractVideoCover($videoPath, $_filename){

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
    global $cfg_ftpSSL;
    global $cfg_ftpPasv;
    global $cfg_ftpServer;
    global $cfg_ftpPort;
    global $cfg_ftpUser;
    global $cfg_ftpPwd;
    global $cfg_ftpTimeout;
    global $cfg_OSSUrl;
    global $cfg_OSSBucket;
    global $cfg_EndPoint;
    global $cfg_OSSKeyID;
    global $cfg_OSSKeySecret;
    global $cfg_QINIUAccessKey;
    global $cfg_QINIUSecretKey;
    global $cfg_QINIUbucket;
    global $cfg_QINIUdomain;
    global $cfg_OBSUrl;
    global $cfg_OBSBucket;
    global $cfg_OBSEndpoint;
    global $cfg_OBSKeyID;
    global $cfg_OBSKeySecret;
    global $cfg_COSUrl;
    global $cfg_COSBucket;
    global $cfg_COSRegion;
    global $cfg_COSSecretid;
    global $cfg_COSSecretkey;

    global $editorMarkState;
    global $editor_ftpType;
    global $editor_ftpState;
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
    global $editor_ftpDir;
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
    global $editor_uploadDir;

    $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
    $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
    $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

    $editor_uploadDir = $cfg_uploadDir;
    // $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
    $editor_ftpType = $cfg_ftpType;

    $custom_ftpState = $editor_ftpState = $cfg_ftpState;
    $custom_ftpType = $cfg_ftpType;
    $custom_ftpSSL = $cfg_ftpSSL;
    $custom_ftpPasv = $cfg_ftpPasv;
    $custom_ftpUrl = $cfg_ftpUrl;
    $custom_ftpServer = $cfg_ftpServer;
    $custom_ftpPort = $cfg_ftpPort;
    $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
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

    //windows需要将ffmpeg.exe文件复制到网站根目录一份，linux需要把ffmpeg文件复制一份到/usr/bin/目录
    $dir = strtoupper(substr(PHP_OS,0,3)) === 'WIN' ? HUONIAOROOT . '/' : '';

    $video = HUONIAOROOT . str_replace('../', '/', $videoPath);
    $saveDir = dirname($video);
    $filename = explode('.', basename($video));
    $filename = $filename[0] . '.jpg';
    $image = $saveDir . '/' . $filename;

    //取第一秒截图
    $cmd = $dir . "ffmpeg -ss 00:00:01 -i ".$video." -f image2 -vframes 1 ".$image." 2>&1";  //结尾加 2>&1 可以输出调试信息
    exec($cmd, $ret);

    //提取成功
    if(file_exists($image)){

        $videoLength = 0;
        $videoWidth = 0;
        $videoHeight = 0;

        //先获取视频的宽高、时长等信息
        if($ret && is_array($ret)){
            //找出视频时长
            $videoLength = 0;
            $videoWidth = 0;
            $videoHeight = 0;
            foreach ($ret as $everyLine){
                if(preg_match("/Duration: (.*), start: .*,/",$everyLine,$matches)){
                    $videoLength = $matches[1]; //00:07:37.60
                    $videoLength = strtotime($videoLength) - strtotime("00:00:00");
                }
                if(preg_match("/Video: .*, (\d*)x(\d*)/",$everyLine,$matches)){
                    $videoWidth = $matches[1];  // 1074
                    $videoHeight = $matches[2];  // 952
                }
                if($videoLength && $videoWidth && $videoHeight){
                    break;
                }
            }

        }
        /* 上传配置 */
        $config = array(
            "savePath" => dirname($videoPath) . "/",
            "fileName" => 'videoCover_' . $_filename
        );
        $fieldName = array($image);

        $remoteImg = json_decode(getRemoteImage($fieldName, $config, 'siteConfig', '..', false, 2, 'jpg'), true);
        if($remoteImg['state'] == 'SUCCESS'){
            $path = $remoteImg['list'][0]['path'];
            $url =  str_replace($cfg_uploadDir, '', $path);
            return array("url"=>$url,
                "videoLength" => $videoLength,
                "videoWidth" => $videoWidth,
                "videoHeight" => $videoHeight);
        }
    }

    //提取失败，返回空
    return '';

}

/**
 * 图片压缩类：通过缩放来压缩。
 * 如果要保持源图比例，把参数$percent保持为1即可。
 * 即使原比例压缩，也可大幅度缩小。数码相机4M图片。也可以缩为700KB左右。如果缩小比例，则体积会更小。
 *
 * 结果：可保存、可直接显示。
 */
class imgcompress {
    private $srcurlurl;
    private $image;
    private $imageinfo;
    private $percent = 0.5;
    /**
     * 图片压缩
     * @param $srcurl 源图
     * @param float $percent  压缩比例
     */
    public function __construct($srcurl, $percent=1) {
        $this->src = $srcurl;
        $this->percent = $percent;
    }
    /** 高清压缩图片
     * @param string $saveName  提供图片名（可不带扩展名，用源图扩展名）用于保存。或不提供文件名直接显示
     */
    public function compressImg($saveName='') {
        list($width, $height, $type, $attr) = getimagesize($this->src);
        $this->imageinfo = array(
            'width'=>$width,
            'height'=>$height,
            'type'=>image_type_to_extension($type,false),
            'attr'=>$attr
        );
        //gif图不压缩
        if($this->imageinfo['type'] != 'gif'){
            $this->_openImage();
            if(!empty($saveName)) $this->_saveImage($saveName);
            //保存 else $this->_showImage();
        }
    }
    /**
     * 内部：打开图片     */
    private function _openImage() {
        $fun = "imagecreatefrom".$this->imageinfo['type'];
        $this->image = $fun($this->src);
        $this->_thumpImage();
    }
    /**
     * 内部：操作图片
     */
    private function _thumpImage() {
        $new_width = $this->imageinfo['width'] * $this->percent;
        $new_height = $this->imageinfo['height'] * $this->percent;
        $image_thump = imagecreatetruecolor($new_width,$new_height);

        //png图透明
        if($this->imageinfo['type'] == 'png'){
            imagealphablending($image_thump, false);
            imagesavealpha($image_thump,true);
            $transparent = imagecolorallocatealpha($image_thump, 255, 255, 255, 127);
            imagefilledrectangle($image_thump, 0, 0, $new_width, $new_height, $transparent);
        }

        //将原图复制到图片载体上面，并且按照一定比例压缩,极大的保持了清晰度
        imagecopyresampled($image_thump,$this->image,0,0,0,0,$new_width,$new_height,$this->imageinfo['width'],$this->imageinfo['height']);
        // ImageJpeg($image_thump, HUONIAOROOT."/aaa.jpg", 90);
        imagedestroy($this->image);
        $this->image = $image_thump;
    }
    /**
     * 输出图片:保存图片则用saveImage()
     */
    private function _showImage() {
        header('Content-Type: image/'.$this->imageinfo['type']);
        $funcs = "image".$this->imageinfo['type'];
        $funcs($this->image);
    }
    /**
     * 保存图片到硬盘：
     * @param  string $dstImgName  1、可指定字符串不带后缀的名称，使用源图扩展名 。2、直接指定目标图片名带扩展名。     */
    private function _saveImage($dstImgName) {
        if(empty($dstImgName)) return false;
        $allowImgs = ['.jpg', '.jpeg', '.png', '.bmp', '.wbmp','.gif'];
        //如果目标图片名有后缀就用目标图片扩展名 后缀，如果没有，则用源图的扩展名
        $dstExt =  strrchr($dstImgName ,".");
        $sourseExt = strrchr($this->src ,".");
        if(!empty($dstExt)) $dstExt =strtolower($dstExt);
        if(!empty($sourseExt)) $sourseExt =strtolower($sourseExt);
        //有指定目标名扩展名
        if(!empty($dstExt) && in_array($dstExt,$allowImgs)) {
            $dstName = $dstImgName;
        } elseif(!empty($sourseExt) && in_array($sourseExt,$allowImgs)) {
            $dstName = $dstImgName.$sourseExt;
        } else {
            $dstName = $dstImgName.$this->imageinfo['type'];
        }
        $funcs = "image".$this->imageinfo['type'];
        $funcs($this->image,$dstName);
    }
    /**
     * 销毁图片
     */
    public function __destruct() {
        if($this->image){
            imagedestroy($this->image);
        }
    }
}


function updateFilenameWithTimestamp($originalPath) {  
    // 获取当前时间戳  
    $currentTimestamp = GetMktime(time());  
      
    // 提取路径和文件名  
    $pathInfo = pathinfo($originalPath);  
    $directory = $pathInfo['dirname'];  
    $filename = $pathInfo['basename'];  
    $extension = $pathInfo['extension'];  
      
    // 提取文件名（不含扩展名）  
    $nameWithoutExtension = $pathInfo['filename'];  
      
    // 检查文件名中是否包含 _ 时间戳  
    if (preg_match('/(.*)_\d+$/', $nameWithoutExtension, $matches)) {  
        // 已有时间戳，更新为当前时间戳  
        $newNameWithoutExtension = $matches[1] . '_' . $currentTimestamp;  
    } else {  
        // 没有时间戳，添加当前时间戳  
        $newNameWithoutExtension = $nameWithoutExtension . '_' . $currentTimestamp;  
    }  
      
    // 拼接新的文件名和路径  
    $newFilename = $newNameWithoutExtension . '.' . $extension;  
    $newPath = $directory . '/' . $newFilename;  
      
    return $newPath;  
}