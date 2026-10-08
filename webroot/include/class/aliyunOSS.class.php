<?php   if(!defined('HUONIAOINC')) exit("Request Error!");
/**
 * 阿里云开放式存储服务OSS
 *
 * @version        $Id: aliyunOSS.class.php 2014-8-11 下午18:26:15 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit("Request Error!");

$autoload = true;

function classLoader($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . 'upload' . DIRECTORY_SEPARATOR . 'aliyun' . DIRECTORY_SEPARATOR . $path . '.php';
		// echo $file;die;
    if (file_exists($file)) {
        require_once $file;
    }
}
spl_autoload_register('classLoader');

use OSS\OssClient;
use OSS\Core\OssException;

if(!defined('AccessDenied')) {
	define('AccessDenied', '拒绝访问');
	define('BucketAlreadyExists', 'Bucket已经存在');
	define('BucketNotEmpty', 'Bucket不为空');
	define('EntityTooLarge', '实体过大');
	define('EntityTooSmall', '实体过小');
	define('FileGroupTooLarge', '文件组过大');
	define('FilePartNotExist', '文件Part不存在');
	define('FilePartStale', '文件Part过时');
	define('InvalidArgument', '参数格式错误');
	define('InvalidAccessKeyId', 'Access Key ID不存在');
	define('InvalidBucketName', '无效的Bucket名字');
	define('InvalidDigest', '无效的摘要');
	define('InvalidObjectName', '无效的Object名字');
	define('InvalidPart', '无效的Part');
	define('InvalidPartOrder', '无效的part顺序');
	define('InvalidTargetBucketForLogging', 'Logging操作中有无效的目标bucket');
	define('InternalError', 'OSS内部发生错误');
	define('MalformedXML', 'XML格式非法');
	define('MethodNotAllowed', '不支持的方法');
	define('MissingArgument', '缺少参数');
	define('MissingContentLength', '缺少内容长度');
	define('NoSuchBucket', 'Bucket不存在');
	define('NoSuchKey', '文件不存在');
	define('NoSuchUpload', 'Multipart Upload ID不存在');
	define('NotImplemented', '无法处理的方法');
	define('PreconditionFailed', '预处理错误');
	define('RequestTimeTooSkewed', '发起请求的时间和服务器时间超出15分钟');
	define('RequestTimeout', '请求超时');
	define('SignatureDoesNotMatch', '签名错误');
	define('TooManyBuckets', '用户的Bucket数目超过限制');
}

class aliyunOSS{

	var $enabled = false;
	var $config = array();

	var $_error;
	var $client;

	function &instance($config = array()) {
		static $object;
		if(empty($object)) {
			$object = new aliyunOSS($config);
		}
		return $object;
	}

	function __construct($config = array())
    {

        global $cfg_OSSBucket;
        global $cfg_EndPoint;
        global $cfg_OSSKeyID;
        global $cfg_OSSKeySecret;

        $OSSConfig = array(
            "bucketName" => $cfg_OSSBucket,
            "endpoint" => $cfg_EndPoint,
            "accessKey" => $cfg_OSSKeyID,
            "accessSecret" => $cfg_OSSKeySecret
        );

        $this->set_error(0);
        $this->config = !$config ? $OSSConfig : $config;

        $this->enabled = false;

        $client = $this->tryCatch("client");
        $this->client = $client;

    }

	function upload($target, $source) {
		if($this->error()) {
			return 0;
		}

		if(substr($target, 0, 1) == "/"){
			$target = substr($target, 1);
		}

		$this->tryCatch("putObject", $target, $source);
        $arr = explode('.', $source);
        if(end($arr) != 'xls' && !strstr($source, 'house/community') && !strstr($source, "card") && !strstr($source, "photo")){
            // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
            unlinkFile($source);
        }

	}

	function delete($target){
		$key = str_split($target);
		$target = $key[0] === "/" ? substr($target, 1) : $target;
		$this->tryCatch("delete", $target);
	}

	function checkConn(){
		return $this->tryCatch("checkConn");
	}

	function set_error($code = 0) {
		$this->_error = $code;
	}

	function error() {
		return $this->_error;
	}

	function tryCatch($action, $key = '', $source = '')
    {
        try {
            if ($action == "client") {
                try {
                    $ossClient = new OssClient($this->config['accessKey'], $this->config['accessSecret'], $this->config['endpoint'], false);
                } catch (OssException $e) {
                    return null;
                }
                return $ossClient;
            } elseif ($action == "putObject") {
                if (file_exists($source)) {
                    $content = file_get_contents($source);
                    $this->client->putObject($this->config['bucketName'], $key, $content);
                }
            } elseif ($action == "delete") {
                try {
                    $this->client->deleteObject($this->config['bucketName'], $key);
                } catch (OssException $e) {
                    return;
                }
            } elseif ($action == "checkConn") {
                if ($this->client) {
                    try {
                        $res = $this->client->doesBucketExist($this->config['bucketName']);
                    } catch (OssException $e) {
                        $this->set_error(AccessDenied);
                        // printf(__FUNCTION__ . ": FAILED\n");
                        // printf($e->getMessage() . "\n");
                        // return;
                    }
                    if ($res === true) {
                        return "成功";
                    } else {
                        $this->set_error(AccessDenied);
                    }
                } else {
                    $this->set_error(AccessDenied);
                }
            }
        } catch (\Aliyun\OSS\Exceptions\OSSException $ex) {
            $errCode = $ex->getErrorCode();
            $this->catchErr($errCode);

        } catch (\Aliyun\Common\Exceptions\ClientException $ex) {
            $errCode = $ex->getMessage();
            $this->catchErr($errCode);
        }
    }

	function catchErr($errCode){
		switch ($errCode) {
			case 'AccessDenied':
				$this->set_error(AccessDenied);
				break;
			case 'BucketAlreadyExists':
				$this->set_error(BucketAlreadyExists);
				break;
			case 'BucketNotEmpty':
				$this->set_error(BucketNotEmpty);
				break;
			case 'EntityTooLarge':
				$this->set_error(EntityTooLarge);
				break;
			case 'EntityTooSmall':
				$this->set_error(EntityTooSmall);
				break;
			case 'FileGroupTooLarge':
				$this->set_error(FileGroupTooLarge);
				break;
			case 'FilePartNotExist':
				$this->set_error(FilePartNotExist);
				break;
			case 'FilePartStale':
				$this->set_error(FilePartStale);
				break;
			case 'InvalidArgument':
				$this->set_error(InvalidArgument);
				break;
			case 'InvalidAccessKeyId':
				$this->set_error(InvalidAccessKeyId);
				break;
			case 'InvalidBucketName':
				$this->set_error(InvalidBucketName);
				break;
			case 'InvalidDigest':
				$this->set_error(InvalidDigest);
				break;
			case 'InvalidObjectName':
				$this->set_error(InvalidObjectName);
				break;
			case 'InvalidPart':
				$this->set_error(InvalidPart);
				break;
			case 'InvalidPartOrder':
				$this->set_error(InvalidPartOrder);
				break;
			case 'InvalidTargetBucketForLogging':
				$this->set_error(InvalidTargetBucketForLogging);
				break;
			case 'InternalError':
				$this->set_error(InternalError);
				break;
			case 'MalformedXML':
				$this->set_error(MalformedXML);
				break;
			case 'MethodNotAllowed':
				$this->set_error(MethodNotAllowed);
				break;
			case 'MissingArgument':
				$this->set_error(MissingArgument);
				break;
			case 'MissingContentLength':
				$this->set_error(MissingContentLength);
				break;
			case 'NoSuchBucket':
				$this->set_error(NoSuchBucket);
				break;
			case 'NoSuchKey':
				$this->set_error(NoSuchKey);
				break;
			case 'NoSuchUpload':
				$this->set_error(NoSuchUpload);
				break;
			case 'NotImplemented':
				$this->set_error(NotImplemented);
				break;
			case 'PreconditionFailed':
				$this->set_error(PreconditionFailed);
				break;
			case 'RequestTimeTooSkewed':
				$this->set_error(RequestTimeTooSkewed);
				break;
			case 'RequestTimeout':
				$this->set_error(RequestTimeout);
				break;
			case 'SignatureDoesNotMatch':
				$this->set_error(SignatureDoesNotMatch);
				break;
			case 'TooManyBuckets':
				$this->set_error(TooManyBuckets);
				break;
			default:
				$this->set_error($errCode);
				break;
		}
	}


}
