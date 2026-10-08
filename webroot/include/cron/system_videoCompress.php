<?php

if (!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 视频转码并压缩
 */

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

global $cfg_COSUrl;
global $cfg_OBSUrl;
global $cfg_QINIUdomain;
global $cfg_OSSUrl;
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

$custom_folder = $cfg_uploadDir;

global $dsql;
$sql = $dsql::SetQuery("select `id`,`path`,`filesize`,`videoParse`,`filename`,`videoParseStart`,`videoParseName` from `#@__attachment` where `videoParse`!=0 order by `id` asc limit 1");  //转码很费时间，单次一个待转码视频

$parse = $dsql->getArr($sql);
//正在转码中
if($parse['videoParse']==2){
    //判断转码时长，如果太长直接终止转码，并上传远程
    $parseTimeLength = time()- $parse['videoParseStart']; //秒
    if($parseTimeLength > 1800){ //半小时
        //先更新放弃转码标识
        $dsql->update($sql = $dsql::SetQuery("update `#@__attachment` set `videoParse`=0 where `id`={$parse['id']}"));
        //kill进程【不关闭进程，则文件被占用从而无法删除本地文件】
        $os_name = PHP_OS;
        if (strpos($os_name, "WIN") !== false) {
            $os_name = "win";
        } else {
            $os_name = "linux";
        }
        //windows关闭进程
        if($os_name=="win"){
            $cmd = "tasklist  /svc | findstr ffmpeg";
            exec($cmd,$output);
            if(!empty($output)){
                //提取进程号
                $port = 0;
                if(preg_match("/(\d+)/",$output[0],$matches)){
                    $port = $matches[1];
                }
                //根据进程号关闭该进程
                $cmd = "taskkill /f /pid $port";
                exec($cmd);
            }
        }
        //linux关闭进程
        else{
            $cmd = "ps -ef | grep ffmpeg";
            exec($cmd,$output);
            if(!empty($output)){
                //提取进程号
                $port = 0;
                foreach ($output as $out){
                    if(strstr($out,"-r 25 -b:v 900k -b:a 64k")){
                        $user = Get_Current_User();
                        preg_match("/^$user\D+(\d+)\D+/",$out,$matches);  // 尝试提取进程号
                        $port = $matches[1];
                        if(is_numeric($port)){
                            //kill进程
                            $cmd="kill -9 ".$port;
                            exec($cmd,$ret);
                        }
                        break;
                    }
                }
            }
        }
        $randName = $parse['videoParseName'];  //取之前的随机文件名
        //根据路径，获取远程配置
        $videoPath = $parse['path'];
        $mod = substr($videoPath, 1);
        $mod = substr($mod, 0, strpos($mod, "/"));  //取得模块名称
        $video = HUONIAOROOT . $cfg_uploadDir . str_replace('../', '/', $videoPath);
        $videoDirName = dirname($video);
        unlinkFile($videoDirName."/".$randName);
        $newPath = $video;
        //如果原文件确实存在，上传文件到远程
        $newPathSize = filesize($newPath);
        if (file_exists($newPath) && $newPathSize > 0) {

            $newVideoPath = substr($newPath, strlen(HUONIAOROOT . $cfg_uploadDir));  //去前缀

            //上传到远程服务器
            $url = array("",$newVideoPath);
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

                if ($_POST['thumbLargeWidth']) {
                    $cfg_thumbLargeWidth = $_POST['thumbLargeWidth'];
                }
                if ($_POST['thumbLargeHeight']) {
                    $cfg_thumbLargeHeight = $_POST['thumbLargeHeight'];
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

                    $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

                } else {
                    $error = 'FTP连接失败，请检查配置信息！';
                }

                //阿里云OSS
            } elseif ($cfg_ftpType == 1) {
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

                $OSSConfig['object'] = $url[1];
                $OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
                $ret = putObjectByRawApis($OSSConfig);

                //七牛云
            } elseif ($cfg_ftpType == 2) {
                $remoteType = 'qiniu';
                $autoload = true;
                $accessKey = $cfg_QINIUAccessKey;
                $secretKey = $cfg_QINIUSecretKey;
                $bucket = $cfg_QINIUbucket;

                if ($mod != 'siteConfig') {
                    $accessKey = $custom_QINIUAccessKey;
                    $secretKey = $custom_QINIUSecretKey;
                    $bucket = $custom_QINIUbucket;
                }

                // 构建鉴权对象
                $auth = new Auth($accessKey, $secretKey);

                $token = $auth->uploadToken($bucket, null);

                // 生成上传 Token

                $uploadMgr = new UploadManager();

                list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

                if ($err !== null) {
                    $error = $err;
                }else{
                    unlinkFile($newPath);
                }

                //华为云
            } elseif ($cfg_ftpType == 3) {
                $ak = $cfg_OBSKeyID;
                $sk = $cfg_OBSKeySecret;
                $endpoint = $cfg_OBSEndpoint;
                $bucketName = $cfg_OBSBucket;

                if ($mod != 'siteConfig') {
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

                $error = '';

                try {

                    $objectKey = $url[1];
                    $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $objectKey;

                    //上传到的桶名，文件名
                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                    $uploadId = $resp['UploadId'];

                    //要上传的本地文件
                    createSampleFile($sampleFilePath);
                    $partSize = 5 * 1024 * 1024;
                    $fileLength = filesize($sampleFilePath);

                    $partCount = $fileLength % $partSize === 0 ? intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                    $parts = [];
                    $promise = null;

                    for ($i = 0; $i < $partCount; $i++) {
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
                        ], function ($exception, $resp) use (&$parts, $partNumber) {
                            $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        });

                        if ($promise === null) {
                            $promise = $p;
                        }
                    }

                    $promise->wait();
                    usort($parts, function ($a, $b) {
                        if ($a['PartNumber'] === $b['PartNumber']) {
                            return 0;
                        }
                        return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                    });

                    $resp = $obsClient->completeMultipartUpload([
                        'Bucket' => $bucketName,
                        'Key' => $objectKey,
                        'UploadId' => $uploadId,
                        'Parts' => $parts
                    ]);

                } catch (ObsException $e) {
                    $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                } finally {
                    $obsClient->close();
                }

                if(empty($error)){
                    unlinkFile($newPath);
                }


                //腾讯云COS
            } elseif ($cfg_ftpType == 4) {

                $COSBucket = $cfg_COSBucket;
                $COSRegion = $cfg_COSRegion;
                $COSSecretid = $cfg_COSSecretid;
                $COSSecretkey = $cfg_COSSecretkey;

                if ($mod != 'siteConfig') {
                    $COSBucket = $custom_COSBucket;
                    $COSRegion = $custom_COSRegion;
                    $COSSecretid = $custom_COSSecretid;
                    $COSSecretkey = $custom_COSSecretkey;
                }

                $autoload = true;
                $cosClient = new Qcloud\Cos\Client(array(
                    'region' => $COSRegion,
                    'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
                    'credentials' => array(
                        'secretId' => $COSSecretid,
                        'secretKey' => $COSSecretkey
                    )
                ));

                try {
                    $cosClient->upload(
                        $bucket = $COSBucket, //格式：BucketName-APPID
                        $key = $url[1],
                        $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                    );
                    $arr = explode('.', $url[1]);

                    if (file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])) {
                        $cosClient->upload(
                            $bucket = $COSBucket, //格式：BucketName-APPID
                            $key = $url[1],
                            $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                        );
                    }

                } catch (\Exception $e) {
                    // 请求失败
                    $error = $e;
                };

                if(!empty($error)){
                    unlinkFile($newPath);
                }

            }
        }
    }
}
elseif ($parse['videoParse'] == 1) {  //视频等待转码，开始转码...
    //因为转码需要很长时间，先给个标识，转换为2，防止并发进程继续对该视频进行操作
    $time = time();
    $randName = time() . rand(100, 10000) . ".mp4";  //转码临时文件，记录到数据库中，如果超时失败则按此名称删除临时文件
    $sql = $dsql::SetQuery("update `#@__attachment` set `videoParse`=2,`videoParseStart`=$time,`videoParseName`='$randName' where `id`={$parse['id']}");  //标识为转码中...
    $dsql->update($sql);

    //根据路径，获取远程配置
    $videoPath = $parse['path'];
    $mod = substr($videoPath, 1);
    $mod = substr($mod, 0, strpos($mod, "/"));  //取得模块名称

    //开始转码
    $video = HUONIAOROOT . $cfg_uploadDir . str_replace('../', '/', $videoPath);
    $dir = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? HUONIAOROOT . '/' : '';  //根目录地址
    $videoDir = dirname($video);
    $newPath = $videoDir . "/" . $randName;  //转码新文件，随机文件名

    //压缩指令：
    //-r 30  每秒30帧
    //-b:v 1000k 视频码率1000k
    //-b:a 48k 音频码率48k
    $cmd = $dir . "ffmpeg -i $video  -r 30 -b:v 1000k -b:a 48k -threads 10 -preset ultrafast $newPath 2>&1";  //结尾加 2>&1 可以输出调试信息
    
    exec($cmd, $ret);
    //如果转码文件确实存在，转码成功了，其他业务，如上传文件到远程，更新数据库字段等...
    $newPathSize = filesize($newPath);
    if (file_exists($newPath) && $newPathSize > 0) {
        if (substr($video, -4) == ".mp4") {  //原文件名同为mp4，先删除旧文件，并把新文件重名为旧文件名

            //如果转码压缩后的文件小于旧文件，则用新文件替换旧文件并删除源文件
            if ($newPathSize < (int)$parse['filesize']) {
                unlinkFile($video); //删除本地旧文件
                rename($newPath, $video);  //重命名新文件名为旧文件名
            } else {
                unlinkFile($newPath); //删除本地新文件文件
                $newPathSize = $parse['filesize'];
            }

            $newPath = $video;   //新文件名就是老文件名
            $newVideoName = $parse['filename'];
        } else {
            unlinkFile($video); //删除本地文件
            //新文件名的后缀不同，名称相同
            $rindex = strrpos($video, ".");
            $eNewPath = substr($video, 0, $rindex) . ".mp4";  //预计要生成的新名称
            rename($newPath, $eNewPath);
            $newPath = $eNewPath;  //新文件名

            $rindex = strrpos($parse['filename'], ".");
            $newVideoName = substr($parse['filename'], 0, $rindex) . ".mp4";  //预计要生成的新名称
        }

        $videoMd5 = md5_file($newPath);

        $newVideoPath = substr($newPath, strlen(HUONIAOROOT . $cfg_uploadDir));  //去前缀

        //上传到远程服务器
        $url = array("", $newVideoPath);
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

            if ($_POST['thumbLargeWidth']) {
                $cfg_thumbLargeWidth = $_POST['thumbLargeWidth'];
            }
            if ($_POST['thumbLargeHeight']) {
                $cfg_thumbLargeHeight = $_POST['thumbLargeHeight'];
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

                $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

            } else {
                $error = 'FTP连接失败，请检查配置信息！';
            }

            //阿里云OSS
        } elseif ($cfg_ftpType == 1) {
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

            $OSSConfig['object'] = $url[1];
            $OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
            $ret = putObjectByRawApis($OSSConfig);

            //七牛云
        } elseif ($cfg_ftpType == 2) {
            $remoteType = 'qiniu';
            $autoload = true;
            $accessKey = $cfg_QINIUAccessKey;
            $secretKey = $cfg_QINIUSecretKey;
            $bucket = $cfg_QINIUbucket;

            if ($mod != 'siteConfig') {
                $accessKey = $custom_QINIUAccessKey;
                $secretKey = $custom_QINIUSecretKey;
                $bucket = $custom_QINIUbucket;
            }

            // 构建鉴权对象
            $auth = new Auth($accessKey, $secretKey);

            $token = $auth->uploadToken($bucket, null);

            // 生成上传 Token

            $uploadMgr = new UploadManager();

            list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

            if ($err !== null) {
                $error = $err;
            } else {
                unlinkFile($newPath);
            }

            //华为云
        } elseif ($cfg_ftpType == 3) {
            $ak = $cfg_OBSKeyID;
            $sk = $cfg_OBSKeySecret;
            $endpoint = $cfg_OBSEndpoint;
            $bucketName = $cfg_OBSBucket;

            if ($mod != 'siteConfig') {
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

            $error = '';

            try {

                $objectKey = $url[1];
                $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $objectKey;

                //上传到的桶名，文件名
                $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                $uploadId = $resp['UploadId'];

                //要上传的本地文件
                createSampleFile($sampleFilePath);
                $partSize = 5 * 1024 * 1024;
                $fileLength = filesize($sampleFilePath);

                $partCount = $fileLength % $partSize === 0 ? intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                $parts = [];
                $promise = null;

                for ($i = 0; $i < $partCount; $i++) {
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
                    ], function ($exception, $resp) use (&$parts, $partNumber) {
                        $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                    });

                    if ($promise === null) {
                        $promise = $p;
                    }
                }

                $promise->wait();
                usort($parts, function ($a, $b) {
                    if ($a['PartNumber'] === $b['PartNumber']) {
                        return 0;
                    }
                    return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                });

                $resp = $obsClient->completeMultipartUpload([
                    'Bucket' => $bucketName,
                    'Key' => $objectKey,
                    'UploadId' => $uploadId,
                    'Parts' => $parts
                ]);

            } catch (ObsException $e) {
                $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
            } finally {
                $obsClient->close();
            }

            if (empty($error)) {
                unlinkFile($newPath);
            }


            //腾讯云COS
        } elseif ($cfg_ftpType == 4) {

            $COSBucket = $cfg_COSBucket;
            $COSRegion = $cfg_COSRegion;
            $COSSecretid = $cfg_COSSecretid;
            $COSSecretkey = $cfg_COSSecretkey;

            if ($mod != 'siteConfig') {
                $COSBucket = $custom_COSBucket;
                $COSRegion = $custom_COSRegion;
                $COSSecretid = $custom_COSSecretid;
                $COSSecretkey = $custom_COSSecretkey;
            }

            $autoload = true;
            $cosClient = new Qcloud\Cos\Client(array(
                'region' => $COSRegion,
                'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
                'credentials' => array(
                    'secretId' => $COSSecretid,
                    'secretKey' => $COSSecretkey
                )
            ));

            try {
                $cosClient->upload(
                    $bucket = $COSBucket, //格式：BucketName-APPID
                    $key = $url[1],
                    $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                );
                $arr = explode('.', $url[1]);

                if (file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])) {
                    $cosClient->upload(
                        $bucket = $COSBucket, //格式：BucketName-APPID
                        $key = $url[1],
                        $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                    );
                }

            } catch (\Exception $e) {
                // 请求失败
                $error = $e;
            };

            if (!empty($error)) {
                unlinkFile($newPath);
            }

        }

        //把新文件记录到数据库中
        $dsql->update($sql = $dsql::SetQuery("update `#@__attachment` set `videoParse`=0,`path`='$newVideoPath',`md5`='$videoMd5',`filename`='$newVideoName',`filesize`=$newPathSize where `id`={$parse['id']}"));

    } //转码失败，放弃转码
    else {
        //先标识为不需要转码
        $sql = $dsql::SetQuery("update `#@__attachment` set `videoParse`=0 where `id`={$parse['id']}");
        $dsql->update($sql);

        //根据路径，获取远程配置
        $videoPath = $parse['path'];
        $mod = substr($videoPath, 1);
        $mod = substr($mod, 0, strpos($mod, "/"));  //取得模块名称
        $video = HUONIAOROOT . $cfg_uploadDir . str_replace('../', '/', $videoPath);
        $videoDirName = dirname($video);
        unlinkFile($videoDirName."/".$randName); //转码失败不一定有该临时文件
        $newPath = $video;
        //如果原文件确实存在，上传文件到远程
        $newPathSize = filesize($newPath);
        if (file_exists($newPath) && $newPathSize > 0) {

            $newVideoPath = substr($newPath, strlen(HUONIAOROOT . $cfg_uploadDir));  //去前缀

            //上传到远程服务器
            $url = array("",$newVideoPath);
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

                if ($_POST['thumbLargeWidth']) {
                    $cfg_thumbLargeWidth = $_POST['thumbLargeWidth'];
                }
                if ($_POST['thumbLargeHeight']) {
                    $cfg_thumbLargeHeight = $_POST['thumbLargeHeight'];
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

                    $huoniao_ftp->upload(HUONIAOROOT . $cfg_uploadDir . $url[1], $cfg_ftpDir . $url[1]);

                } else {
                    $error = 'FTP连接失败，请检查配置信息！';
                }

                //阿里云OSS
            } elseif ($cfg_ftpType == 1) {
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

                $OSSConfig['object'] = $url[1];
                $OSSConfig['uploadFile'] = HUONIAOROOT . $cfg_uploadDir . $url[1];
                $ret = putObjectByRawApis($OSSConfig);

                //七牛云
            } elseif ($cfg_ftpType == 2) {
                $remoteType = 'qiniu';
                $autoload = true;
                $accessKey = $cfg_QINIUAccessKey;
                $secretKey = $cfg_QINIUSecretKey;
                $bucket = $cfg_QINIUbucket;

                if ($mod != 'siteConfig') {
                    $accessKey = $custom_QINIUAccessKey;
                    $secretKey = $custom_QINIUSecretKey;
                    $bucket = $custom_QINIUbucket;
                }

                // 构建鉴权对象
                $auth = new Auth($accessKey, $secretKey);

                $token = $auth->uploadToken($bucket, null);

                // 生成上传 Token

                $uploadMgr = new UploadManager();

                list($ret, $err) = $uploadMgr->putFile($token, $url[1], HUONIAOROOT . $cfg_uploadDir . $url[1]);

                if ($err !== null) {
                    $error = $err;
                }else{
                    unlinkFile($newPath);
                }

                //华为云
            } elseif ($cfg_ftpType == 3) {
                $ak = $cfg_OBSKeyID;
                $sk = $cfg_OBSKeySecret;
                $endpoint = $cfg_OBSEndpoint;
                $bucketName = $cfg_OBSBucket;

                if ($mod != 'siteConfig') {
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

                $error = '';

                try {

                    $objectKey = $url[1];
                    $sampleFilePath = HUONIAOROOT . $cfg_uploadDir . $objectKey;

                    //上传到的桶名，文件名
                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                    $uploadId = $resp['UploadId'];

                    //要上传的本地文件
                    createSampleFile($sampleFilePath);
                    $partSize = 5 * 1024 * 1024;
                    $fileLength = filesize($sampleFilePath);

                    $partCount = $fileLength % $partSize === 0 ? intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                    $parts = [];
                    $promise = null;

                    for ($i = 0; $i < $partCount; $i++) {
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
                        ], function ($exception, $resp) use (&$parts, $partNumber) {
                            $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        });

                        if ($promise === null) {
                            $promise = $p;
                        }
                    }

                    $promise->wait();
                    usort($parts, function ($a, $b) {
                        if ($a['PartNumber'] === $b['PartNumber']) {
                            return 0;
                        }
                        return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                    });

                    $resp = $obsClient->completeMultipartUpload([
                        'Bucket' => $bucketName,
                        'Key' => $objectKey,
                        'UploadId' => $uploadId,
                        'Parts' => $parts
                    ]);

                } catch (ObsException $e) {
                    $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                } finally {
                    $obsClient->close();
                }

                if(empty($error)){
                    unlinkFile($newPath);
                }


                //腾讯云COS
            } elseif ($cfg_ftpType == 4) {

                $COSBucket = $cfg_COSBucket;
                $COSRegion = $cfg_COSRegion;
                $COSSecretid = $cfg_COSSecretid;
                $COSSecretkey = $cfg_COSSecretkey;

                if ($mod != 'siteConfig') {
                    $COSBucket = $custom_COSBucket;
                    $COSRegion = $custom_COSRegion;
                    $COSSecretid = $custom_COSSecretid;
                    $COSSecretkey = $custom_COSSecretkey;
                }

                $autoload = true;
                $cosClient = new Qcloud\Cos\Client(array(
                    'region' => $COSRegion,
                    'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
                    'credentials' => array(
                        'secretId' => $COSSecretid,
                        'secretKey' => $COSSecretkey
                    )
                ));

                try {
                    $cosClient->upload(
                        $bucket = $COSBucket, //格式：BucketName-APPID
                        $key = $url[1],
                        $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                    );
                    $arr = explode('.', $url[1]);

                    if (file_exists(HUONIAOROOT . $cfg_uploadDir . $url[1])) {
                        $cosClient->upload(
                            $bucket = $COSBucket, //格式：BucketName-APPID
                            $key = $url[1],
                            $body = fopen(HUONIAOROOT . $cfg_uploadDir . $url[1], 'rb')
                        );
                    }

                } catch (\Exception $e) {
                    // 请求失败
                    $error = $e;
                };

                if(!empty($error)){
                    unlinkFile($newPath);
                }
            }
        }
    }
}

//错误了
if(isset($error) && !empty($error)){

}else{
    //尝试调用视频审核
    $turl = getFilePath($parse['id'],false); //视频路径
    if($turl){
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_moderationSP;
        $moderationCallbackUrl = $cfg_secureAccess.$cfg_basehost."/api/moderationCallback.php?id=".$parse['id'];

        global $cfg_moderationSP;
        if(isset($cfg_moderationSP) && !empty($cfg_moderationSP)){
            //视频审核
            $moderationRes = RunCreateVideoModerationJob($turl,5,$moderationCallbackUrl);
            if($moderationRes!==false){
                $moderationRes = json_decode($moderationRes,true);
                $job_id = $moderationRes['job_id'];
                $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`={$parse['id']}");
                $dsql->update($sql);
            }
        }
    }
}

