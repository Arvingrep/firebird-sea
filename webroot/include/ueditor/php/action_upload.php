<?php
/**
 * 上传附件和上传视频
 * User: Jinqn
 * Date: 14-04-09
 * Time: 上午10:17
 */

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


/* 上传配置 */
$base64 = "upload";
switch (htmlspecialchars($action)) {
    case 'uploadimage':
        $config = array(
            "savePath" => "../../.." . $editor_uploadDir . "/" . $modelType . "/editor/image",
            "maxSize" => $cfg_editorSize,
            "allowFiles" => $cfg_editorType
        );
        $fieldName = $CONFIG['imageFieldName'];
        break;
    case 'uploadscrawl':
        $config = array(
            "savePath" => "../../.." . $editor_uploadDir . "/" . $modelType . "/editor/image",
            "maxSize" => $cfg_editorSize,
            "allowFiles" => $cfg_editorType,
            "oriName" => "scrawl.png"
        );
        $fieldName = $CONFIG['scrawlFieldName'];
        $base64 = "base64";
        break;
    case 'uploadvideo':
        $config = array(
            "savePath" => "../../.." . $editor_uploadDir . "/" . $modelType . "/editor/video",
            "maxSize" => $cfg_videoSize,
            "allowFiles" => $cfg_videoType
        );
        $fieldName = $CONFIG['videoFieldName'];
        break;
    case 'uploadfile':
    default:
        $config = array(
            "savePath" => "../../.." . $editor_uploadDir . "/" . $modelType . "/editor/file",
            "maxSize" => $cfg_softSize,
            "allowFiles" => $cfg_softType
        );
        $fieldName = $CONFIG['fileFieldName'];
        break;
}
/* 生成上传实例对象并完成上传 */
$up = new upload($fieldName, $config, $base64);

$info = $up->getFileInfo();
$url = explode($editor_uploadDir, $info["url"]);

$isVideoCompress = false;  //默认值


$autoload = false;
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$userid = $userLogin->getMemberID();
$uid = $userLogin->getUserID();

//图片压缩
global $cfg_imageCompress;
$isImageCompress = is_null($cfg_imageCompress) ? true : (int)$cfg_imageCompress;
if($isImageCompress){
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

        if($cfg_moderationTP){
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
                    $info['state'] = $_data['error_msg'];

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
                        unlinkFile($info['url']);
                    }
                }
            }

        }

    }
}

global $cfg_ffmpeg;
$cfg_ffmpeg = (int)$cfg_ffmpeg;  //是否启用ffmpeg

$fid = $path = $poster = $posterOrigin = '';

$pushRemote = true;

$picWidth = $picHeight = $videoLength = 0;
if ($info["state"] == "SUCCESS") {

    if ($term == "mobile") {
        // $large = $up->smallImg($cfg_meditorPicWidth, 9999, "large", $cfg_quality);
    }

    //获取文件后缀
    $fileClass_ = explode(".", $info["originalName"]);
    $fileClass_ = $fileClass_[count($fileClass_) - 1];
    $fileClass = chkType($fileClass_);

    //对图片文件添加水印
    if (($action == "uploadimage" || $action == "uploadscrawl") && $markConfig['editorMarkState'] == 1 && $fileClass_ != 'gif') {
        $waterMark = $up->waterMark($markConfig);
    }

    if ($fileClass == "image") {
        $imgSize = @getimagesize($info['url']);
        $picWidth = (int)$imgSize[0];
        $picHeight = (int)$imgSize[1];
    }

    //视频文件创建生成封面，依赖ffmpeg
    if($fileClass == 'video' && $cfg_ffmpeg){

        $extractRes = extractVideoCover($info['url']);
        if(is_array($extractRes)){
            $posterOrigin = $extractRes['url'];
            $poster = getFilePath($extractRes['url'], false);
            $picWidth = $extractRes['videoWidth'];
            $picHeight = $extractRes['videoHeight'];
            $videoLength = $extractRes['videoLength'];
        }else{
            $poster = '';
        }

        //视频压缩
        global $cfg_videoCompress;
        $isVideoCompress = is_null($cfg_videoCompress) ? true : (int)$cfg_videoCompress;
        if($isVideoCompress){
            $pushRemote = false;
        }
    }

    //普通FTP模式
    if ($editor_ftpType == 0 && $editor_ftpState == 1 && $pushRemote) {
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

        $huoniao_ftp = new ftp($ftpConfig);
        $huoniao_ftp->connect();
        if ($huoniao_ftp->connectid) {
            $huoniao_ftp->upload(HUONIAOROOT . $editor_uploadDir . $url[1], $editor_ftpDir . $url[1]);
        }

        //阿里云OSS
    } elseif ($editor_ftpType == 1 && $pushRemote) {

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

		$OSSConfig['object'] = $url[1];
		$OSSConfig['uploadFile'] = HUONIAOROOT . $editor_uploadDir . $url[1];
		$ret = putObjectByRawApis($OSSConfig);

    //七牛云
    } elseif ($editor_ftpType == 2 && $pushRemote) {
        $autoload = true;
        $accessKey = $custom_QINIUAccessKey;
        $secretKey = $custom_QINIUSecretKey;
        // 构建鉴权对象
        $auth = new \Qiniu\Auth($accessKey, $secretKey);
        // 要上传的空间
        $bucket = $custom_QINIUbucket;
        // 上传到七牛后保存的文件名
        // $key = substr(str_replace('/', '_', $url[1]), 1);
        $key = $url[1];
        // 生成上传 Token
        $token = $auth->uploadToken($bucket,$key);
        // 要上传文件的本地路径
        $filePath = $local_fileUrl;
        // 初始化 UploadManager 对象并进行文件的上传。
        $uploadMgr = new \Qiniu\Storage\UploadManager();
        // 调用 UploadManager 的 putFile 方法进行文件的上传。
        $uploadMgr->putFile($token, $key, HUONIAOROOT . $editor_uploadDir . $url[1]);

    //华为云
    } elseif ($editor_ftpType == 3 && $pushRemote) {

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

			$objectKey = $url[1];
			$sampleFilePath = HUONIAOROOT . $editor_uploadDir . $objectKey;

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

            if($fileClass == 'video' && $cfg_ffmpeg){

            }else{
                unlinkFile($sampleFilePath);  //删除本地文件
            }

		} catch ( ObsException $e ) {
            die('{"state":"华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage().'"}');
		} finally{
			$obsClient->close ();
		}

        //腾讯云COS
    } elseif ($editor_ftpType == 4 && $pushRemote) {

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
				$key = $url[1],
				$body = fopen(HUONIAOROOT . $editor_uploadDir . $url[1], 'rb')
			);
            if($fileClass != 'video' && !$cfg_ffmpeg){
			    unlinkFile(HUONIAOROOT . $editor_uploadDir . $url[1]);  //删除本地文件
            }
		} catch (\Exception $e) {
			// 请求失败
			die($e);
		};

    }
    $videoParse = $pushRemote ? 0 : 1;  //视频解码？如果解码，则记录到数据库中，通过定时计划解码上传到远程然后删除本地文件

    $originalName = ($editor_ftpType == 1 || $editor_ftpType == 2) ? 'is_createface_' : '';
    $name = substr(strrchr($url[1], "/"), 1);
    $attachment = $dsql->SetQuery("INSERT INTO `#@__attachment` (`userid`, `filename`, `filetype`, `filesize`, `name`, `path`, `pubdate`,`width`,`height`,`duration`,`poster`,`md5`, `click`,`videoParse`) VALUES ('$userid', '" . $info["originalName"] . "', '" . $fileClass . "', '" . $info["size"] . "', '$name', '" . $url[1] . "', '" . GetMkTime(time()) . "',$picWidth,$picHeight,$videoLength,'$posterOrigin','{$info["md5"]}', 0,$videoParse)");
    $aid = $dsql->dsqlOper($attachment, "lastid");
    if (!$aid) die('{"state":"数据写入失败！"}');

    $RenrenCrypt = new RenrenCrypt();
    $fid = $aid;

    $path = $cfg_attachment . $fid;

    //20160128修复编辑器输出域名问题
    global $cfg_basehost;
    $cfg_attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
    $cfg_attachment = str_replace("https://" . $cfg_basehost, "", $cfg_attachment);
    $attachmentPath = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
    $attachmentPath = str_replace("https://" . $cfg_basehost, "", $cfg_attachment);
    $path = $attachmentPath . $fid;


    //如果是视频文件则输出真实路径
    if ($action == "uploadvideo") {
        // $path = $site_fileUrl.$url[1];
        $path = getFilePath($fid, false);
    }
}

//对已经上传过的文件不做
if($info["state"] == "REPEAT" && !$poster){

    $fileClass_ = explode(".", $info["originalName"]);
    $fileClass_ = $fileClass_[count($fileClass_) - 1];
    $fileClass = chkType($fileClass_);

    $error = "";
    $info["state"] = "SUCCESS";
    $fid = $info["data"]["id"];
    $picWidth = $info["data"]["width"];
    $picHeight = $info["data"]['height'];
    $url[1] = $url[0];

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
}

$__url = $cfg_attachment . $url[1];
$turl = getFilePath($fid, false);
//视频审核、音频审核
global $cfg_moderationSP;
global $cfg_moderationYP;
global $cfg_secureAccess;
global $cfg_basehost;
$moderationCallbackUrl = $cfg_secureAccess.$cfg_basehost."/api/moderationCallback.php?id=".$fid;  //通知查询该id的审核信息
if($fileClass=="audio" && isset($cfg_moderationYP) && !empty($cfg_moderationYP)){
    //音频审核
    $moderationRes = RunCreateAudioModerationJob($turl,$moderationCallbackUrl);
    if($moderationRes!==false){
        $moderationRes = json_decode($moderationRes,true);
        $job_id = $moderationRes['job_id'];
        $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`=$fid");
        $dsql->update($sql);
    }
}
if($fileClass=="video" && isset($cfg_moderationSP) && !empty($cfg_moderationSP)  && isset($isVideoCompress) && !$isVideoCompress){
    //视频审核
    $moderationRes = RunCreateVideoModerationJob($turl,5,$moderationCallbackUrl);
    if($moderationRes!==false){
        $moderationRes = json_decode($moderationRes,true);
        $job_id = $moderationRes['job_id'];
        $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`=$fid");
        $dsql->update($sql);
    }
}

global $cfg_hideUrl;
if($cfg_hideUrl){
    $__url = $turl;
}

$videoimg = $poster ? $poster : ($editor_ftpType == 1 ? $turl."?x-oss-process=video/snapshot,t_0,f_jpg,w_0,h_0,m_fast,ar_auto" : ($editor_ftpType == 2 ? $turl."?vframe/jpg/offset/1/rotate/auto" : ""));
PutCookie('ftpType', $editor_ftpType, 3600);
return json_encode(array(
    // "url" => str_replace('../', '', $path),
    "url" => $__url,
    "turl" => str_replace('../', '', $turl),
    "videoimg" => $videoimg,
    "original" => $info["originalName"],
    "name" => $info["originalName"],
    "type" => $info["type"],
    "size" => $info["size"],
    "state" => $info["state"]
));



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

        $thumbType_ = explode("|", $cfg_thumbType);
        $flashType_ = explode("|", $flashType);
        $audioType_ = explode("|", $cfg_audioType);

        if (in_array($f, $thumbType_)) return "image";
        if (in_array($f, $flashType_)) return "flash";
        if (in_array($f, $audioType_)) return "audio";
        if (in_array($f, $cfg_videoType)) return "video";
        if (in_array($f, $cfg_softType)) return "file";
    } else {
        return "file";
    }
}



//提取视频封面
function extractVideoCover($videoPath){

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
    
    $cfg_softType = $cfg_softType ? (is_array($cfg_softType) ? $cfg_softType : explode("|", $cfg_softType)) : array();
    $cfg_editorType = $cfg_editorType ? (is_array($cfg_editorType) ? $cfg_editorType : explode("|", $cfg_editorType)) : array();
    $cfg_videoType = $cfg_videoType ? (is_array($cfg_videoType) ? $cfg_videoType : explode("|", $cfg_videoType)) : array();

    $editor_uploadDir = str_replace('../', '', $cfg_uploadDir);
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

    $video = HUONIAOROOT . '/' . str_replace('../', '', $videoPath);
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
            "savePath" => dirname($videoPath) . "/"
        );
        $fieldName = array($image);

        $remoteImg = json_decode(getRemoteImage($fieldName, $config, 'siteConfig', '../../..', false, 2), true);
        if($remoteImg['state'] == 'SUCCESS'){
            $path = $remoteImg['list'][0]['path'];
            $url = str_replace($cfg_uploadDir, '', $path);
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
        $this->_openImage();
        if(!empty($saveName)) $this->_saveImage($saveName);
        //保存 else $this->_showImage();
    }
    /**
     * 内部：打开图片     */
    private function _openImage() {
        list($width, $height, $type, $attr) = getimagesize($this->src);
        $this->imageinfo = array(
            'width'=>$width,
            'height'=>$height,
            'type'=>image_type_to_extension($type,false),
            'attr'=>$attr
        );
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
        imagedestroy($this->image);
    }
}