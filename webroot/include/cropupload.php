<?php
/**
 * 自定义头像
 *
 * @version        $Id: cropupload.php 2015-7-16 下午20:07:41 $
 * @package        HuoNiao.Include
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once('./common.inc.php');


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



if(empty($coordW) || empty($coordH) || empty($width) || empty($height)) callBack(200, '参数传递失败！', $callback);

$mod = $mod == "dating" ? "dating" : "member";

global $dsql;
global $userLogin;

global $cfg_avatarEditState;
global $cfg_avatarEditInfo;
global $cfg_avatarEditAudit;
$avatarEditState = (int)$cfg_avatarEditState;
$avatarEditInfo = $cfg_avatarEditInfo ? $cfg_avatarEditInfo : "功能维护中，暂停使用！";
$avatarEditAudit = (int)$cfg_avatarEditAudit;
if($avatarEditState){
    callBack(200, $avatarEditInfo, $callback);
}

$uid = $userLogin->getMemberID();
if($uid == -1) callBack(200, '登录超时，请重新登录！', $callback);

$RenrenCrypt = new RenrenCrypt();

if(strstr($picid, ".jpg") || strstr($picid, ".jpeg") || strstr($picid, ".gif") || strstr($picid, ".png") || strstr($picid, ".bmp")){
	$picpath = $picid;
}else{
	$id = (int)$RenrenCrypt->php_decrypt(base64_decode($picid));

	$attachment = $dsql->SetQuery("SELECT * FROM `#@__attachment` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($attachment, "results");

	if(!$results) callBack(200, '图片不存在或已删除，请重试！', $callback);
	$picpath = $results[0]['path'];
}
$picpath = explode("large/", $picpath);
$picpath = $picpath[1];

//声明全局变量
global $site_fileUrl;
global $cfg_uploadDir;
global $cfg_ftpDir;
global $cfg_ftpType;
global $cfg_ftpState;
global $cfg_OSSBucket;
global $cfg_EndPoint;
global $cfg_OSSKeyID;
global $cfg_OSSKeySecret;
global $cfg_QINIUAccessKey;
global $cfg_QINIUSecretKey;
global $cfg_QINIUbucket;
global $cfg_OBSBucket;
global $cfg_OBSEndpoint;
global $cfg_OBSKeyID;
global $cfg_OBSKeySecret;
global $cfg_COSBucket;
global $cfg_COSRegion;
global $cfg_COSSecretid;
global $cfg_COSSecretkey;

global $cfg_photoSmallWidth;
global $cfg_photoSmallHeight;
global $cfg_photoMiddleWidth;
global $cfg_photoMiddleHeight;
global $cfg_photoLargeWidth;
global $cfg_photoLargeHeight;

$custom_folder = $cfg_uploadDir;

//读取远程文件
set_time_limit(24*60*60);

$folder = "/siteConfig/photo/large/";
$local_fileUrl = HUONIAOROOT.$custom_folder.$folder.$picpath;

createDir(HUONIAOROOT.$custom_folder.$folder);

$arrContextOptions = [
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ]
];

$fileContent = @file_get_contents(getRealFilePath($picid), false, stream_context_create($arrContextOptions));

//保存至本地
if($fileContent && !file_exists($local_fileUrl)){
	createFile($local_fileUrl);
	PutFile($local_fileUrl, $fileContent);
}

if(file_exists($local_fileUrl)){
	//生成大头像
	$imageInfo = getimagesize($local_fileUrl);
	$srcW = $imageInfo[0];
	$srcH = $imageInfo[1];

	if($imageInfo[2] == 1) {
		$img   = imagecreatefromgif($local_fileUrl);
		$img_t = ".gif";
	} elseif($imageInfo[2] == 2) {
		$img   = imagecreatefromjpeg($local_fileUrl);
		$img_t = ".jpg";
	} elseif($imageInfo[2] == 3) {
		$img   = imagecreatefrompng($local_fileUrl);
		$img_t = ".png";
	} else {
		$img   = "";
		$img_t = "";
	}

	//根据传回的参数缩放图片
	$operaArr = array(
		array(
			"folder" => "large",
			"width" => $cfg_photoLargeWidth,
			"height" => $cfg_photoLargeHeight
		),
		array(
			"folder" => "middle",
			"width" => $cfg_photoMiddleWidth,
			"height" => $cfg_photoMiddleHeight
		),
		array(
			"folder" => "small",
			"width" => $cfg_photoSmallWidth,
			"height" => $cfg_photoSmallHeight
		)
	);

	//计算图片差值
	$rideW = 1;
	$rideH = 1;
	if($srcW > $width){
		$rideW = $srcW/$width;
		$coordX = $rideW*$coordX;
	}
	if($srcH > $height){
		$rideH = $srcH/$height;
		$coordY = $rideH*$coordY;
	}

	$timeFolder = date( "Y" )."/".date( "m" )."/".date("d");
	$newName = time() . rand( 1 , 10000 ) . $img_t;

	foreach ($operaArr as $key => $val) {
		if(function_exists("imagecreatetruecolor")) {
			$newImg = imagecreatetruecolor($val['width'], $val['height']);
			$background = imagecolorallocate($newImg, 255, 255, 255);
			imagefill($newImg,0,0,$background);
			ImageCopyResampled($newImg, $img, 0, 0, $coordX, $coordY, $val['width'], $val['height'], $coordW * $rideW, $coordH * $rideH);
		}else{
			$newImg = imagecreatetruecolor($val['width'], $val['height']);
			ImageCopyResized($newImg, $img, 0, 0, $coordX, $coordY, $val['width'], $val['height'], $coordW * $rideW, $coordH * $rideH);
		}

		$pathStr = HUONIAOROOT.$custom_folder."/siteConfig/photo/".$val['folder']."/".$timeFolder;
		createDir($pathStr);
		$newPath = $pathStr."/".$newName;
		if (file_exists($newPath)) unlinkFile($newPath);
		ImageJpeg($newImg, $newPath, 100);
		ImageDestroy($newImg);
	}

	ImageDestroy($img);


	//上传到远程服务器

	//普通FTP模式
	if($cfg_ftpType == 0 && $cfg_ftpState == 1){
		include_once(HUONIAOINC."/class/ftp.class.php");
		$huoniao_ftp = new ftp();
		$huoniao_ftp->connect();
		if($huoniao_ftp->connectid) {
			foreach ($operaArr as $key => $val) {
				$nfolder = "/siteConfig/photo/".$val['folder']."/".$timeFolder."/".$newName;
				$huoniao_ftp->upload(HUONIAOROOT.$custom_folder.$nfolder, $cfg_ftpDir.$nfolder);
			}
			// $huoniao_ftp->ftp_delete($custom_folder.$folder.$picpath);            
            unlinkFile(HUONIAOROOT.$custom_folder.$nfolder);
		}else{
			$error = 'FTP连接失败，请检查配置信息！';
		}

	//阿里云OSS
	}elseif($cfg_ftpType == 1){
		$OSSConfig = array(
			"bucketName" => $cfg_OSSBucket,
			"endpoint" => $cfg_EndPoint,
			"accessKey" => $cfg_OSSKeyID,
			"accessSecret" => $cfg_OSSKeySecret
		);

		foreach ($operaArr as $key => $val) {
			$nfolder = "/siteConfig/photo/".$val['folder']."/".$timeFolder."/".$newName;

			$OSSConfig['object'] = $nfolder;
			$OSSConfig['uploadFile'] = HUONIAOROOT.$custom_folder.$nfolder;
			$ret = putObjectByRawApis($OSSConfig);

            //echo $nfolder;
            //echo HUONIAOROOT.$custom_folder.$nfolder;
			if($ret['state'] == 200){
				$error = $ret['info'];
			}
            unlinkFile(HUONIAOROOT.$custom_folder.$nfolder);
		}

	//七牛云
	}elseif($cfg_ftpType==2){
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
        $autoload = false;

        $accessKey = $cfg_QINIUAccessKey;
        $secretKey = $cfg_QINIUSecretKey;
        $auth = new \Qiniu\Auth($accessKey, $secretKey);
        $bucket = $cfg_QINIUbucket;
        $uploadMgr = new \Qiniu\Storage\UploadManager();
        $bucketMgr = new \Qiniu\Storage\BucketManager($auth);
        foreach ($operaArr as $key => $val) {
            $nfolder = "/siteConfig/photo/".$val['folder']."/".$timeFolder."/".$newName;
            $key=substr(str_replace('/','_',$nfolder),1);
            $token = $auth->uploadToken($bucket,$nfolder);
            list($ret, $err)=$uploadMgr->putFile($token,$nfolder, HUONIAOROOT.$custom_folder.$nfolder);
            if ($err !== null) {
                $error = $err;
            }
            unlinkFile(HUONIAOROOT.$custom_folder.$nfolder);
            // $bucketMgr->delete($bucket, $nfolder);
        }

	//华为云OSS
	}elseif($cfg_ftpType == 3){

		$ak = $cfg_OBSKeyID;
		$sk = $cfg_OBSKeySecret;
		$endpoint = $cfg_OBSEndpoint;
		$bucketName = $cfg_OBSBucket;

		$autoload = true;
		$obsClient = ObsClient::factory([
			'key' => $ak,
			'secret' => $sk,
			'endpoint' => $endpoint,
			'socket_timeout' => 30,
			'connect_timeout' => 10
		]);

		try{

			foreach ($operaArr as $key => $val) {
				$objectKey = $nfolder = "/siteConfig/photo/".$val['folder']."/".$timeFolder."/".$newName;
				$sampleFilePath = HUONIAOROOT.$custom_folder.$objectKey;

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
    } elseif ($cfg_ftpType == 4) {

		$COSBucket = $cfg_COSBucket;
		$COSRegion = $cfg_COSRegion;
		$COSSecretid = $cfg_COSSecretid;
		$COSSecretkey = $cfg_COSSecretkey;

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
			foreach ($operaArr as $key => $val) {
				$nfolder = "/siteConfig/photo/".$val['folder']."/".$timeFolder."/".$newName;
				$cosClient->upload(
					$bucket = $COSBucket, //格式：BucketName-APPID
					$key = $nfolder,
					$body = fopen(HUONIAOROOT.$custom_folder.$nfolder, 'rb')
				);
				unlinkFile(HUONIAOROOT.$custom_folder.$nfolder);  //删除本地文件
			}
		} catch (\Exception $e) {
			// 请求失败
			$error = $e;
		};

    }

	unlinkFile($local_fileUrl);

    if(is_numeric($id)){
        $archives = $dsql->SetQuery("DELETE FROM `#@__attachment` WHERE `id` = ".$id);
        $dsql->dsqlOper($archives, "update");
    }

}else{
	$error = "图片操作失败，请检查服务器权限！";
}

//输出错误信息
if(!empty($error)){
	callBack(200, $error, $callback);
}else{

	$archives = $dsql->SetQuery("INSERT INTO `#@__attachment` (`userid`, `filename`, `filetype`, `filesize`, `name`, `path`, `aid`, `pubdate`) VALUES ('$uid', '$newName', 'image', 0, '$newName', '"."/siteConfig/photo/large/".$timeFolder."/".$newName."', 0, '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if(is_numeric($aid)){
		$fid = base64_encode($RenrenCrypt->php_encrypt($aid));

		//删除之前的头像文件
		// $handler = true;
		// $uinfo = $userLogin->getMemberInfo();
		// $oldPhoto = $uinfo['photoSource'];
		// if(!empty($oldPhoto)){
		// 	delPicFile($oldPhoto, "delPhoto", "siteConfig");
		// }

		// $archives = $dsql->SetQuery("UPDATE `#@__member` SET `photo` = '/siteConfig/photo/large/".$timeFolder."/".$newName."' WHERE `id` = '$uid'");
        if($mod == "dating"){
          $archives = $dsql->SetQuery("UPDATE `#@__dating_member` SET `photo` = '$fid' WHERE `userid` = '$uid'");
        }else{
            if($avatarEditAudit){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `photo_audit` = '$fid', `photo_state` = '审核中' WHERE `id` = '$uid'");
            }else{
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `photo` = '$fid' WHERE `id` = '$uid'");
            }
        }
		$dsql->dsqlOper($archives, "update");

		callBack(100, '操作成功！', $callback);
	}else{
		callBack(200, "数据写入失败！", $callback);
	}
}

function callBack($state, $info, $callback){

	$return = array("state" => $state, "info" => $info);

	//输出到浏览器
	if($callback){
		echo $callback."(".json_encode($return).")";
	}else{
		echo json_encode($return);
	}
	die;
}
