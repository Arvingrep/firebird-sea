<?php
//系统核心配置文件
require_once(dirname(__FILE__).'/../include/common.inc.php');


//华为云
$autoload = true;
function classLoaderHuawei_1($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}

spl_autoload_register('classLoaderHuawei_1');
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


global $cfg_wechatAppid;
global $cfg_wechatAppsecret;
global $cfg_uploadDir;
global $cfg_basehost;
global $cfg_secureAccess;

$media_id = $_REQUEST["media_id"];
$module   = $_REQUEST["module"];
$module   = empty($module) ? "siteConfig" : $module;

if(empty($media_id)) die(json_encode(array("state" => 200, "info" => "微信配置错误！")));

/* 引入系统参数 */
require_once(HUONIAOINC . "/config/" . $module . ".inc.php");

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

global $cfg_atlasSmallWidth;
global $cfg_atlasSmallHeight;

$editor_ftpState = $cfg_ftpState;
$editor_ftpDir = $cfg_ftpDir;
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
global $cfg_QINIUAccessKey;
global $cfg_QINIUSecretKey;
global $cfg_QINIUbucket;
global $cfg_QINIUdomain;
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
    global $custom_atlasSmallWidth;
    global $custom_atlasSmallHeight;

    if ($customMark == 1) {
        $atlasMarkState = $custom_atlasMarkState;
        
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

    $cfg_atlasSmallWidth = $custom_atlasSmallWidth;
    $cfg_atlasSmallHeight = $custom_atlasSmallHeight;
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
    $editor_ftpType = 4;
    $editor_ftpState = 0;

//本地
} elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
    $editor_ftpType = 5;
    $editor_ftpState = 0;

}

if($cfg_wechatAppid && $cfg_wechatAppsecret){
    include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $access_token = $jssdk->getAccessToken();

    //微信上传下载媒体文件
    $url = "https://api.weixin.qq.com/cgi-bin/media/get?access_token={$access_token}&media_id={$media_id}";

    //保存的路径及文件名
    $dir = $cfg_uploadDir . "/" . $module . "/atlas/large/" . date("Y") . "/" . date("m") . "/" . date("d") . "/";
    $name = time() . rand(1, 10000) . ".jpg";
    if(!file_exists(HUONIAOROOT . $dir)){
        if (!mkdir(HUONIAOROOT . $dir, 0777, true)){
        	echo json_encode(array("state" => 200, "info" => "服务器没有创建文件夹权限！"));die;
        }
    }

    /* 下载文件 */
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_HEADER, 0);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($curl, CURLOPT_TIMEOUT, 3);
	$con = curl_exec($curl);
	curl_close($curl);

    //access_token过期
    if(strstr($con, 'errcode') && strstr($con, '40001')){
        $jssdk->updateAccessToken();
        echo json_encode(array("state" => 200, "info" => "上传失败，请重新上传！"));die;
    }

	file_put_contents(HUONIAOROOT . $dir . $name, $con);


    // include_once(HUONIAOROOT."/include/class/httpdown.class.php");
    // $file = new httpdown();
    // $file->OpenUrl($url); # 远程文件地址
    // $file->SaveToBin(HUONIAOROOT . $dir . $name); # 保存路径及文件名
    // $file->Close(); # 释放资源

    $autoload = false;
    $dsql = new dsql($dbo);
    $userLogin = new userLogin($dbo);
    $userid = $userLogin->getMemberID();
    $uid = $userLogin->getUserID();

    //如果是非管理员上传，查询华为云内容审核接口
    if($uid < 0){

        global $cfg_moderationTP;
        global $cfg_moderation_region;
        global $cfg_moderation_key;
        global $cfg_moderation_secret;

        if($cfg_moderationTP){
            require_once HUONIAOINC . "/class/moderation/huawei/image.php";
            require_once HUONIAOINC . "/class/moderation/huawei/utils.php";

            init_region($cfg_moderation_region);
            $_data = image_content_aksk($cfg_moderation_key, $cfg_moderation_secret, file_to_base64(HUONIAOROOT . $dir . $name), "", array("all"), 0);

            $_data = json_decode($_data, true);
            if(is_array($_data)){
                //接口验证失败
                if($_data['error_msg']){
                    echo json_encode(array("state" => 200, "info" => $_data['error_msg']));die;

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

                        echo json_encode(array("state" => 200, "info" => '图片内容' . join('、', $arr) . '，上传失败！'));die;

                        //删除本地图片
                        unlinkFile(HUONIAOROOT . $dir . $name);
                    }
                }
            }
        }

    }


    $imageInfo = getimagesize(HUONIAOROOT . $dir . $name);
    $width = $imageInfo[0];
    $height = $imageInfo[1];
    $fileSize = filesize(HUONIAOROOT . $dir . $name);

    $remote = array(
        'imgInfo' => array(
            'width' => $width,
            'height' => $height,
            'type' => $imageInfo[2],
            'name' => $name
        ),
        'fullName' => '..' . $dir . $name,
        'savePath' => '..' . $cfg_uploadDir . "/" . $module . "/atlas/"
    );

    $up = new upload("Filedata", array());
    $small = $up->smallImg($cfg_atlasSmallWidth, $cfg_atlasSmallHeight, "small", 100, $remote);

    //生成水印图片
    if ($atlasMarkState == 1) {
        $waterMark = $up->waterMark($markConfig, $remote);
    }

    $filepath_1 = str_replace($cfg_uploadDir, '', $dir . $name);

    //普通FTP模式
    if ($editor_ftpType == 0 && $editor_ftpState == 1) {
        $ftpConfig = array();
        if ($modelType != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
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

        include_once(HUONIAOROOT."/include/class/ftp.class.php");
        $huoniao_ftp = new ftp($ftpConfig);
        $huoniao_ftp->connect();
        if ($huoniao_ftp->connectid) {
            $huoniao_ftp->upload(HUONIAOROOT . $dir . $name, $dir . $name);

            $smallFile = str_replace("large", "small", $dir . $name);
            $fileRootUrl = HUONIAOROOT . $smallFile;
            if(file_exists($fileRootUrl)){
                $huoniao_ftp->upload($fileRootUrl, $smallFile);
            }
        }

        //阿里云OSS
    } elseif ($editor_ftpType == 1) {

		$OSSConfig = array(
			"bucketName" => $cfg_OSSBucket,
			"endpoint" => $cfg_EndPoint,
			"accessKey" => $cfg_OSSKeyID,
			"accessSecret" => $cfg_OSSKeySecret
		);

		if ($modelType != "siteConfig") {
			$OSSConfig = array(
				"bucketName" => $custom_OSSBucket,
				"endpoint" => $custom_EndPoint,
				"accessKey" => $custom_OSSKeyID,
				"accessSecret" => $custom_OSSKeySecret
			);
		}

		$OSSConfig['object'] = $filepath_1;
		$OSSConfig['uploadFile'] = HUONIAOROOT . $dir . $name;
		$ret = putObjectByRawApis($OSSConfig);

		$smallFile = str_replace("large", "small", $dir . $name);
		$fileRootUrl = HUONIAOROOT . $smallFile;
		if(file_exists($fileRootUrl)){
			$OSSConfig['object'] = str_replace($cfg_uploadDir, '', $smallFile);
			$OSSConfig['uploadFile'] = $fileRootUrl;
			$ret = putObjectByRawApis($OSSConfig);
		}

    //七牛云
    } elseif ($editor_ftpType == 2) {
        $autoload = true;
        $accessKey = $custom_QINIUAccessKey;
        $secretKey = $custom_QINIUSecretKey;
        // 构建鉴权对象
        $auth = new \Qiniu\Auth($accessKey, $secretKey);
        // 要上传的空间
        $bucket = $custom_QINIUbucket;
        // 上传到七牛后保存的文件名
        //$key = substr(str_replace('/', '_', $filepath_1), 1);
        // $key = substr($filepath_1, 1);
        // 生成上传 Token
        $token = $auth->uploadToken($bucket,$filepath_1);
        // 要上传文件的本地路径
        $filePath = $local_fileUrl;
        // 初始化 UploadManager 对象并进行文件的上传。
        $uploadMgr = new \Qiniu\Storage\UploadManager();
        // 调用 UploadManager 的 putFile 方法进行文件的上传。
        $uploadMgr->putFile($token, $filepath_1, HUONIAOROOT . $dir . $name);

        $smallFile = str_replace("large", "small", $dir . $name);
        $fileRootUrl = HUONIAOROOT . $smallFile;
        if(file_exists($fileRootUrl)){
            $token = $auth->uploadToken($bucket, $fileRootUrl);
            $uploadMgr->putFile($token, str_replace($cfg_uploadDir, '', $smallFile), $fileRootUrl);
        }

    //华为云
    } elseif ($editor_ftpType == 3) {

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

            $objectKey = $filepath_1;
            $sampleFilePath = HUONIAOROOT . $dir . $name;

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
			unlinkFile($sampleFilePath);  //删除本地文件


            //小图
            $smallFile = str_replace("large", "small", $dir . $name);
            $objectKey = str_replace($cfg_uploadDir, '', $smallFile);
            $sampleFilePath = HUONIAOROOT . $smallFile;
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
				unlinkFile($sampleFilePath);  //删除本地文件
            }

        } catch ( ObsException $e ) {
            $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
        } finally{
            $obsClient->close ();
        }

        //腾讯云COS
    } elseif ($editor_ftpType == 4) {

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
			$cosClient->upload(
				$bucket = $COSBucket, //格式：BucketName-APPID
				$key = $filepath_1,
				$body = fopen(HUONIAOROOT . $dir . $name, 'rb')
			);
			unlinkFile(HUONIAOROOT . $dir . $name);  //删除本地文件

			$smallFile = str_replace("large", "small", $dir . $name);
			$fileRootUrl = HUONIAOROOT . $smallFile;
			if(file_exists($fileRootUrl)){
				$cosClient->upload(
					$bucket = $COSBucket, //格式：BucketName-APPID
					$key = str_replace($cfg_uploadDir, '', $smallFile),
					$body = fopen($fileRootUrl, 'rb')
				);
				unlinkFile($fileRootUrl);  //删除本地文件
			}
		} catch (\Exception $e) {
			// 请求失败
			die($e);
		};

    }

    $name = substr(strrchr($filepath_1, "/"), 1);
    $attachment = $dsql->SetQuery("INSERT INTO `#@__attachment` (`userid`, `filename`, `filetype`, `filesize`, `name`, `path`, `width`, `height`, `pubdate`, `click`) VALUES ('$userid', '" . $name . "', 'image', '" . $fileSize . "', '" . $name . "', '" . $filepath_1 . "', '$width', '$height', '" . GetMkTime(time()) . "', 0)");
    $aid = $dsql->dsqlOper($attachment, "lastid");
    if (!$aid) die('{"state":"数据写入失败！"}');

    $RenrenCrypt = new RenrenCrypt();
    $fid = base64_encode($RenrenCrypt->php_encrypt($aid));

    $path = $cfg_attachment . $fid;

    //20160128修复编辑器输出域名问题
    global $cfg_basehost;
    $cfg_attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
    $attachmentPath = str_replace("https://" . $cfg_basehost, "", $cfg_attachment);
    $path = $attachmentPath . $fid;

    echo json_encode(array("state" => 100, "fid" => $fid, "url" => $path, "turl" => getFilePath($fid)));

}else{
    echo json_encode(array("state" => 200, "info" => "微信配置错误！"));
}
