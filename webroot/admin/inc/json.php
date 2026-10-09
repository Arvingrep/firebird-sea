<?php
/**
 *  异步JSON
 */

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");


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

$dsql = new dsql($dbo);

$key = trim($key);

//城市管理员，只能管理管辖城市的会员
$adminAreaIDs = '';
if($userType == 3){
    $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $adminCityID = $ret[0]['mgroupid'];

        global $data;
        $data = '';
        $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
        $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
        $adminAreaIDs = join(',', $adminAreaIDArr);
    }
}

//检测FTP是否可连接
if ($action == "checkFtpConn") {

    if (empty($ftpUrl)) die('{"state":"101","info":' . json_encode("请输入远程附件地址！") . '}');
    if (empty($ftpServer)) die('{"state":"101","info":' . json_encode("请输入FTP服务器地址！") . '}');
    if (empty($ftpDir)) die('{"state":"101","info":' . json_encode("请输入FTP上传目录！") . '}');
    if (empty($ftpUser)) die('{"state":"101","info":' . json_encode("请输入FTP帐号！") . '}');
    if (empty($ftpPwd)) die('{"state":"101","info":' . json_encode("请输入FTP密码！") . '}');

    $ftpConfig = array(
        "on" => 1, //是否开启
        "host" => $ftpServer, //FTP服务器地址
        "port" => $ftpPort, //FTP服务器端口
        "username" => $ftpUser, //FTP帐号
        "password" => $ftpPwd,  //FTP密码
        "attachdir" => $ftpDir,  //FTP上传目录
        "attachurl" => $ftpUrl,  //远程附件地址
        "timeout" => $ftpTimeout,  //FTP超时
        "ssl" => $ftpSSL,  //启用SSL连接
        "pasv" => $ftpPasv  //被动模式连接
    );
    $huoniao_ftp = new ftp($ftpConfig);
    $huoniao_ftp->connect();
    if ($huoniao_ftp->connectid) {

        $floder = create_check_code(10);
        if ($huoniao_ftp->ftp_mkdir($floder)) {

            $huoniao_ftp->ftp_rmdir($floder);
            echo '{"state":"100","info":' . json_encode("可以连接！") . '}';

        } else {

            echo '{"state":"200","info":' . json_encode("远程FTP无写入权限，请修改服务器权限！") . '}';

        }


    } else {
        echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
    }
    die;

//检测阿里云OSS是否可连接
} elseif ($action == "checkOssConn") {

    if (empty($OSSUrl)) die('{"state":"101","info":' . json_encode("请输入Bucket域名！") . '}');
    if (empty($OSSBucket)) die('{"state":"101","info":' . json_encode("请输入Bucket名称！") . '}');
    if (empty($EndPoint)) die('{"state":"101","info":' . json_encode("请输入EndPoint！") . '}');
    if (empty($OSSKeyID)) die('{"state":"101","info":' . json_encode("请输入Access Key ID！") . '}');
    if (empty($OSSKeySecret)) die('{"state":"101","info":' . json_encode("请输入Access Key Secret！") . '}');

    $OSSConfig = array(
        "bucketName" => $OSSBucket,
        "bucketName" => $OSSBucket,
        "endpoint" => $EndPoint,
        "accessKey" => $OSSKeyID,
        "accessSecret" => $OSSKeySecret
    );

    $aliyunOSS = new aliyunOSS($OSSConfig);
    if ($aliyunOSS->checkConn() == "成功") {
        echo '{"state":"100","info":' . json_encode("可以连接！") . '}';
    } else {
        echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
    }
    die;

//检测七牛云是否可连接
} elseif ($action == "checkQINIUConn") {

    if (empty($access_key)) die('{"state":"101","info":' . json_encode("请输入AccessKey！") . '}');
    if (empty($secret_key)) die('{"state":"101","info":' . json_encode("请输入SecretKey！") . '}');
    if (empty($bucket)) die('{"state":"101","info":' . json_encode("请输入存储空间（bucket）！") . '}');
    if (empty($domain)) die('{"state":"101","info":' . json_encode("请输入外链域名！") . '}');

    $accessKey = $access_key;
    $secretKey = $secret_key;

    $autoload = true;
    $auth = new Auth($access_key, $secret_key);
    $bucketmanager = new BucketManager($auth);
    $bucketlists = $bucketmanager->buckets();
    if($bucketlists[0]!=null){
        if (in_array($bucket,$bucketlists[0])) {
            echo '{"state":"100","info":' . json_encode("可以连接！") . '}';
        } else {
            echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
        }
    }else{
        echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
    }

    die;

//检测华为云OBS是否可连接
} elseif ($action == "checkObsConn") {

    if (empty($OBSUrl)) die('{"state":"101","info":' . json_encode("请输入访问域名！") . '}');
    if (empty($OBSBucket)) die('{"state":"101","info":' . json_encode("请输入桶名称！") . '}');
    if (empty($OBSEndpoint)) die('{"state":"101","info":' . json_encode("请输入Endpoint！") . '}');
    if (empty($OBSKeyID)) die('{"state":"101","info":' . json_encode("请输入Access Key ID！") . '}');
    if (empty($OBSKeySecret)) die('{"state":"101","info":' . json_encode("请输入Secret Access Key！") . '}');

    $autoload = true;
    $obsClient = ObsClient::factory([
        'key' => $OBSKeyID,
        'secret' => $OBSKeySecret,
        'endpoint' => $OBSEndpoint,
        'socket_timeout' => 30,
        'connect_timeout' => 10
    ]);

    try{
        $resp = $obsClient->headBucket([
            'Bucket' => $OBSBucket
        ]);

        echo '{"state":"100","info":' . json_encode("可以连接！") . '}';

    } catch ( ObsException $e ) {
        echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
    } finally{
        $obsClient->close ();
    }
    die;

//检测腾讯云COS是否可连接
} elseif ($action == "checkCosConn") {

    if (empty($COSUrl)) die('{"state":"101","info":' . json_encode("请输入访问域名！") . '}');
    if (empty($COSBucket)) die('{"state":"101","info":' . json_encode("请输入存储桶名称！") . '}');
    if (empty($COSRegion)) die('{"state":"101","info":' . json_encode("请输入所属地域！") . '}');
    if (empty($COSSecretid)) die('{"state":"101","info":' . json_encode("请输入密钥SecretId！") . '}');
    if (empty($COSSecretkey)) die('{"state":"101","info":' . json_encode("请输入密钥SecretKey！") . '}');

    $autoload = true;

	$cosClient = new Qcloud\Cos\Client(array(
        'region' => $COSRegion,
        'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
        'credentials'=> array(
            'secretId'  => $COSSecretid ,
            'secretKey' => $COSSecretkey
		)
	));

	try {
	    $result = $cosClient->headBucket(array(
	        'Bucket' => $COSBucket //格式：BucketName-APPID
	    ));
	    // 请求成功
		echo '{"state":"100","info":' . json_encode("可以连接！") . '}';
	} catch (\Exception $e) {
	    // 请求失败
	    echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
	}
    die;

//检测系统默认FTP链接是否正常
} elseif ($action == "checkSystemConn") {

    $isOk = true;

    if ($cfg_ftpType == 0) {
        $ftpConfig = array(
            "on" => 1, //是否开启
            "host" => $cfg_ftpServer, //FTP服务器地址
            "port" => $cfg_ftpPort, //FTP服务器端口
            "username" => $cfg_ftpUser, //FTP帐号
            "password" => $cfg_ftpPwd,  //FTP密码
            "attachdir" => $cfg_ftpDir,  //FTP上传目录
            "attachurl" => $cfg_ftpUrl,  //远程附件地址
            "timeout" => $cfg_ftpTimeout,  //FTP超时
            "ssl" => $cfg_ftpSSL,  //启用SSL连接
            "pasv" => $cfg_ftpPasv  //被动模式连接
        );
        $huoniao_ftp = new ftp($ftpConfig);
        $huoniao_ftp->connect();
        if (!$huoniao_ftp->connectid) {
            $isOk = false;
        }

    //阿里云
    } elseif ($cfg_ftpType == 1) {
        $OSSConfig = array(
            "bucketName" => $cfg_OSSBucket,
            "endpoint" => $cfg_EndPoint,
            "accessKey" => $cfg_OSSKeyID,
            "accessSecret" => $cfg_OSSKeySecret
        );
        $aliyunOSS = new aliyunOSS($OSSConfig);
        if ($aliyunOSS->checkConn() != "成功") {
            $isOk = false;
        }

    //七牛云
    } elseif ($cfg_ftpType == 2){

      $autoload = true;
      $auth = new Auth($cfg_QINIUAccessKey, $cfg_QINIUSecretKey);
      $bucketmanager = new BucketManager($auth);
      $bucketlists = $bucketmanager->buckets();
      if($bucketlists[0]!=null){
          if (!in_array($cfg_QINIUbucket,$bucketlists[0])) {
              $isOk = false;
          }
      }else{
          $isOk = false;
      }

    //华为云
    } elseif ($cfg_ftpType == 3){

        $autoload = true;
        $obsClient = ObsClient::factory([
            'key' => $cfg_OBSKeyID,
            'secret' => $cfg_OBSKeySecret,
            'endpoint' => $cfg_OBSEndpoint,
            'socket_timeout' => 30,
            'connect_timeout' => 10
        ]);

        try{
            $resp = $obsClient->headBucket([
                'Bucket' => $cfg_OBSBucket
            ]);
        } catch ( ObsException $e ) {
            $isOk = false;
        } finally{
            $obsClient->close ();
        }

      //腾讯云
	  } elseif ($cfg_ftpType == 4){

        $autoload = true;
		$cosClient = new Qcloud\Cos\Client(array(
	          'region' => $cfg_COSRegion,
	          'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
	          'credentials'=> array(
	              'secretId'  => $cfg_COSSecretid ,
	              'secretKey' => $cfg_COSSecretkey
	  		)
	  	));

	  	try {
	  	    $result = $cosClient->headBucket(array(
	  	        'Bucket' => $cfg_COSBucket //格式：BucketName-APPID
	  	    ));
	  	    // 请求成功
	  	} catch (\Exception $e) {
	  	    // 请求失败
	  	    $isOk = false;
	  	}

    }

    if ($isOk) {
        echo '{"state":"100","info":' . json_encode("可以连接！") . '}';
    } else {
        echo '{"state":"200","info":' . json_encode("连接失败，请检查配置参数！") . '}';
    }
    die;

//检测启用帐号是否可用
} elseif ($action == "checkMail") {
    if (!empty($mailUser)) {
        $return = sendmail($mailUser, "系统测试邮件", "<center><br /><br />这是一封测试邮件，证明发送邮件系统正常。</center>");
        if (!empty($return)) {
            echo '{"state":"200","info":' . json_encode("邮件发送失败，请检查邮箱帐号！") . '}';
        } else {
            echo '{"state":"100","info":' . json_encode("测试邮件已发送到指定邮箱，请注意查收！&nbsp;&nbsp;如果没有收到邮件证明此帐号配置不正确 或 不支持发送邮件！") . '}';
        }
    } else {
        echo '{"state":"200","info":' . json_encode("请输入测试帐号！") . '}';
    }
    die;

//检测短信帐号是否可用
} elseif ($action == "checkSMS") {
    if (!empty($mobile)) {

        preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $mobile, $matchPhone);
        if (!$matchPhone) {
            // die('{"state":"101","info":'.json_encode("手机号码格式错误！").'}');
        }

        //发送短信
        $return = sendsms($mobile, 0, "123456");
        if ($return != "ok") {
            echo '{"state":"200","info":' . json_encode("发送失败，请检查帐号配置信息！") . '}';
        } else {
            echo '{"state":"100","info":' . json_encode("测试短信已发送到指定手机，请注意查收！&nbsp;&nbsp;如果没有收到短信证明此帐号配置不正确！") . '}';
        }
    } else {
        echo '{"state":"101","info":' . json_encode("请输入手机号码！") . '}';
    }
    die;

//一键导入系统地址库
} elseif ($action == "importAddr") {
    if (!empty($type) && !empty($id)) {

        $intable = "INSERT INTO `" . $DB_PREFIX . $type . "addr` VALUES(";

        //获取所选城市的所有信息
        $addrListArr = $dsql->getTypeList($id, "site_area");

        //根据城市数据生成SQL语句
        $i = 0;
        function getSqlStr($data, $id)
        {
            global $intable;
            global $i;
            $str = array();
            if (!empty($data)) {
                foreach ($data as $key => $value) {
                    $i++;

                    global $type;
                    if ($type == "house") {
                        $str[] = $intable . "'" . $i . "','" . $id . "','" . $value['typename'] . "','" . $key . "','" . GetMkTime(time()) . "','0','0');\r\n";
                    } else {
                        $str[] = $intable . "'" . $i . "','" . $id . "','" . $value['typename'] . "','" . $key . "','" . GetMkTime(time()) . "');\r\n";
                    }
                    //$str[] = $intable . "'".$i."','".$id."','".$value['typename']."','".$key."','".GetMkTime(time())."'".$el.");\r\n";
                    if ($value['lower']) {
                        $str[] = getSqlStr($value['lower'], $i);
                    }
                }
            }
            return join("", $str);
        }

        $insertSql = getSqlStr($addrListArr, 0);
        $insertArr = explode("\r\n", $insertSql);

        if (!empty($insertArr)) {

            //先清空表
            $userSql = $dsql->SetQuery("DELETE FROM `#@__" . $type . "addr`");
            $dsql->dsqlOper($userSql, "update");

            //执行导入数据
            foreach ($insertArr as $q) {
                if (!empty($q)) {
                    $dsql->dsqlOper(trim($q), "update");
                }
            }

            adminLog("导入系统地址库", $type);
            echo '{"state":"100","info":' . json_encode("导入成功！") . '}';

        } else {
            echo '{"state":"200","info":' . json_encode("系统地址库为空，导入失败！") . '}';
        }

    }
    die;

//获取会员信息
}elseif($action == "getMemberInfo"){
	if(!empty($id)){
		$userSql = $dsql->SetQuery("SELECT m.`username`, m.`nickname`, m.`company`, m.`realname`, m.`addr`, m.`money`, m.`bonus`, m.`promotion`, m.`point`, m.`email`, m.`emailCheck`, m.`phone`, m.`phoneCheck`, m.`qq`, m.`photo`, m.`sex`, m.`birthday`, m.`regtime`, m.`regip`, m.`state`, l.`name` as level FROM `#@__member` m LEFT JOIN `#@__member_level` l ON l.`id` = m.`level` WHERE m.`id` = ".$id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$addrname = $userResult[0]['addr'];
			if($addrname){
				$addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
			}
			$userResult[0]['addr'] = $addrname;
			$userResult[0]['photo'] = getFilePath($userResult[0]['photo']);
            $userResult[0]['realname'] = $userResult[0]['realname'] ? $userResult[0]['realname'] : '';
            $userResult[0]['phone'] = $userResult[0]['phone'] ? $userResult[0]['phone'] : '';
            $userResult[0]['email'] = $userResult[0]['email'] ? $userResult[0]['email'] : '';
			echo json_encode($userResult);
		}
	}
	die;

//模糊匹配会员
} elseif ($action == "checkUser") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        if($userType == 0)
            $where = "";
        if($userType == 3)
            $where = " AND `addr` in ($adminAreaIDs)";


        if($mtype == 1){
            $where = " AND `mtype` = 1";
        }elseif($mtype == 2){
            $where = " AND `mtype` = 2";
        }elseif($mtype == '1,2'){
            $where = " AND `mtype` BETWEEN 1 AND 2";
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone`, `email` FROM `#@__member` WHERE (`username` like '%$key%' || `nickname` like '%$key%')" .$where. " LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//模糊匹配顾问
} elseif ($action == "checkGw") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('gw.`cityid`');
        $userSql = $dsql->SetQuery("SELECT user.username, gw.id FROM `#@__house_gw` gw LEFT JOIN `#@__member` user ON user.id = gw.userid WHERE user.username like '%$key%'".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//检查顾问是否已经存在
} elseif ($action == "checkGw_") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND gw.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, gw.id FROM `#@__house_gw` gw LEFT JOIN `#@__member` user ON user.id = gw.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配小区
} elseif ($action == "checkCommunity") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('comm.`cityid`');
        $commSql = $dsql->SetQuery("SELECT comm.id, comm.title, addr.typename, comm.addr, comm.addrid FROM `#@__house_community` comm LEFT JOIN `#@__site_area` addr ON comm.addrid = addr.id WHERE comm.title like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            foreach ($commResult as $key=>$value) {
                //地区
                $addrname = $value['addrid'];
                if($addrname){
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
                }
                $commResult[$key]['typename']=$addrname;
            }
            echo json_encode($commResult);
        }
    }
    die;

//模糊匹配经纪人
} elseif ($action == "checkZjUser") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('zj.`cityid`');
        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__house_zjuser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE (user.username like '%$key%' OR user.nickname like '%$key%')".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//模糊匹配个人
} elseif($action == "checkPersonUser"){
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('zj.`cityid`');
        $zjSql = $dsql->SetQuery("SELECT user.id FROM `#@__house_zjuser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE zj.state = 1 ".$where."");
        $zjResult = $dsql->dsqlOper($zjSql, "results");
        $idArr = '0';
        if(!empty($zjResult)){
            array_walk($zjResult, function($value, $key) use (&$idArr ){
                if(!empty($value['id'])){
                    $idArr .= $value['id']. ',';
                }
            });
            if(!empty($idArr)){
	            $idArr = rtrim($idArr, ',');
	            $userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and `id` not in ($idArr) and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
	            $userResult = $dsql->dsqlOper($userSql, "results");
	            if ($userResult) {
	                echo json_encode($userResult);
	            }
            }else{
            	$userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
	            $userResult = $dsql->dsqlOper($userSql, "results");
	            if ($userResult) {
	                echo json_encode($userResult);
	            }
            }
        }else{
        	$userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
            $userResult = $dsql->dsqlOper($userSql, "results");
            if ($userResult) {
                echo json_encode($userResult);
            }
        }
    }
    die;

//检查经纪人是否已经存在（添加经纪人）
} elseif ($action == "checkZjUser_") {
    $result = "";
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND zj.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__house_zjuser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查经纪人是否已经存在（添加中介公司）
} elseif ($action == "checkZjUser_1") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND zj.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.userid FROM `#@__house_zjcom` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配中介
} elseif ($action == "checkZjCom") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_zjcom` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//检查会员是否已经存在（添加商城分店店铺）
} elseif ($action == "checkBranchStoreUser") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND store.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__shop_branch_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加商城店铺）
} elseif ($action == "checkStoreUser_1") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND store.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__shop_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加建材公司）
} elseif ($action == "checkStoreUser_2") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND store.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__" . $type . "_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加装修公司）
} elseif ($action == "checkStoreUser_3") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND store.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__" . $type . "_store` store LEFT JOIN `#@__member` user ON user.id = store.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加装修团队）
} elseif ($action == "checkTeamUser") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND team.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, team.id FROM `#@__" . $type . "_team` team LEFT JOIN `#@__member` user ON user.id = team.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加装修团队）
} elseif ($action == "checkRenovationCompany") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $key = str_replace("'","",$key );
        $commSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//检查会员是否已经存在（添加装修团队）
} elseif ($action == "checkTeamCompany") {
    $key = addslashes($_POST['key']);
    $key = str_replace("'","",$key );
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND store.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, store.id FROM `#@__" . $type . "_store` store LEFT JOIN `#@__member` user ON user.id = store.company WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//输入设计师（添加装修作品）
} elseif ($action == "checkDesigner") {
    $key = addslashes($_POST['key']);
    $key = str_replace("'","",$key );
    if (!empty($key)) {
        // $where1 = getCityFilter('`cityid`');
        // $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where1);
        // $storeResult = $dsql->dsqlOper($storeSql, "results");
        // $houseid=array();
        // foreach($storeResult as $ke => $loupan){
        //     array_push($houseid, $loupan['id']);
        // }
        // if($houseid){
        //     $where .= " AND `company` in (".join(",", $houseid).")";
        // }else{
        //     $where .= " AND 1=1 ";
        // }
        $teamSql = $dsql->SetQuery("SELECT `id`, `name`, `company` FROM `#@__renovation_team` WHERE `name` like '%$key%'".$where);
        $teamResult = $dsql->dsqlOper($teamSql, "results");
        $return = array();
        if ($teamResult) {
            foreach ($teamResult as $key => $val) {
                $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `id` = " . $val['company']);
                $storeResult = $dsql->dsqlOper($storeSql, "results");
                if ($storeResult) {
                    $return[$key]['id'] = $val['id'];
                    $return[$key]['name'] = $val['name'];
                    $return[$key]['company'] = $storeResult[0]['company'];
                }
            }
        }
        echo json_encode($return);
    }
    die;

//检查设计师是否存在（添加装修作品）
} elseif ($action == "checkDesignerName") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        // $where1 = getCityFilter('`cityid`');
        // $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where1);
        // $storeResult = $dsql->dsqlOper($storeSql, "results");
        // $houseid=array();
        // foreach($storeResult as $ke => $loupan){
        //     array_push($houseid, $loupan['id']);
        // }
        // $where .= " AND `company` in (".join(",", $houseid).")";
        $userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `name` like '%$key%'".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";

        $userSql = $dsql->SetQuery("SELECT team.id, team.name, user.id FROM `#@__" . $type . "_team` team LEFT JOIN `#@__member` user ON team.userid = user.id WHERE team.name = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo $result;
        } else {
            echo 200;
        }
    }
    die;
}elseif ($action == "checkForeman") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        // $where1 = getCityFilter('`cityid`');
        // $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where1);
        // $storeResult = $dsql->dsqlOper($storeSql, "results");
        // $houseid=array();
        // foreach($storeResult as $ke => $loupan){
        //     array_push($houseid, $loupan['id']);
        // }
        // if($houseid){
        //     $where .= " AND `company` in (".join(",", $houseid).")";
        // }else{
        //     $where .= " AND 1=1 ";
        // }
        $teamSql = $dsql->SetQuery("SELECT `id`, `name`, `company` FROM `#@__renovation_foreman` WHERE `name` like '%$key%'".$where);
        $teamResult = $dsql->dsqlOper($teamSql, "results");
        $return = array();
        if ($teamResult) {
            foreach ($teamResult as $key => $val) {
                $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `id` = " . $val['company']);
                $storeResult = $dsql->dsqlOper($storeSql, "results");
                if ($storeResult) {
                    $return[$key]['id'] = $val['id'];
                    $return[$key]['name'] = $val['name'];
                    $return[$key]['company'] = $storeResult[0]['company'];
                }
            }
        }
        echo json_encode($return);
    }
    die;
//检查工长是否存在（添加装修作品）
}elseif ($action == "checkForemanName") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        // $where1 = getCityFilter('`cityid`');
        // $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where1);
        // $storeResult = $dsql->dsqlOper($storeSql, "results");
        // $houseid=array();
        // foreach($storeResult as $ke => $loupan){
        //     array_push($houseid, $loupan['id']);
        // }
        // $where .= " AND `company` in (".join(",", $houseid).")";
        $userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_foreman` WHERE `name` like '%$key%'".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";

        $userSql = $dsql->SetQuery("SELECT team.id, team.name, user.id FROM `#@__" . $type . "_foreman` team LEFT JOIN `#@__member` user ON team.userid = user.id WHERE team.name = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo $result;
        } else {
            echo 200;
        }
    }
    die;

//检查会员是否已经存在（添加招聘企业）
} elseif ($action == "checkCompanyUser_job") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__" . $type . "_company` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配招聘企业
} elseif ($action == "checkJobCompany") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title`, `contact` FROM `#@__job_company` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//检查会员是否已经存在（添加招聘简历）
} elseif ($action == "checkResumeUser_job") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone`, `email` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND resume.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, user.email, resume.id FROM `#@__" . $type . "_resume` resume LEFT JOIN `#@__member` user ON user.id = resume.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经添加过网站（自助建站）
} elseif ($action == "checkWebsiteUser") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND ws.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.nickname, ws.id FROM `#@__website` ws LEFT JOIN `#@__member` user ON user.id = ws.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经开通交友功能
} elseif ($action == "checkDating") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND dating.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, dating.id FROM `#@__dating_member` dating LEFT JOIN `#@__member` user ON user.id = dating.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经开通交友成功故事
} elseif ($action == "checkDatingStory") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND story.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, story.id FROM `#@__dating_story` story LEFT JOIN `#@__member` user ON (user.id = story.fid OR user.id = story.tid) WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加婚嫁酒店）
} elseif ($action == "checkUser_marry") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__marry_" . $type . "` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加顾问）
}elseif($action == "checkUser_adviser"){
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__car_adviser` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加汽车经销商）
} elseif ($action == "checkUser_car") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__car_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配经销商
} elseif ($action == "checkCarStore") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__car_store` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//模糊匹配顾问
} elseif ($action == "checkCarAdviser") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('zj.`cityid`');
        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__car_adviser` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE (user.username like '%$key%' OR user.nickname like '%$key%')".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//模糊匹配汽车个人
} elseif($action == "checkCarPersonUser"){
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('zj.`cityid`');
        $zjSql = $dsql->SetQuery("SELECT user.id FROM `#@__car_store` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE zj.state = 1 ".$where."");
        $zjResult = $dsql->dsqlOper($zjSql, "results");
        $idArr = '0';
        if(!empty($zjResult)){
            array_walk($zjResult, function($value, $key) use (&$idArr ){
                if(!empty($value['id'])){
                    $idArr .= $value['id']. ',';
                }
            });
            $idArr = rtrim($idArr, ',');
            $userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and `id` not in ($idArr) and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
            $userResult = $dsql->dsqlOper($userSql, "results");
            if ($userResult) {
                echo json_encode($userResult);
            }
        }else{
        	$userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
            $userResult = $dsql->dsqlOper($userSql, "results");
            if ($userResult) {
                echo json_encode($userResult);
            }
        }
    }
    die;

//检查会员是否已经存在（添加外卖餐厅）
} elseif ($action == "checkUser_waimai") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__waimai_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

// 检查楼盘
} elseif($action == "checkLoupan"){
    $key = addslashes(addslashes($_POST['key']));
    $type = $_POST['type'];

    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__houseitem` WHERE `parentid` = 1 AND `typename` = '$type'");
    $res = $dsql->dsqlOper($sql, "results");
    if($res){
        $tid = $res[0]['id'];

        $where = getCityFilter('l.`cityid`');

        $sql = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`addrid`, l.`addr`, addr.typename FROM `#@__house_loupan` l LEFT JOIN `#@__site_area` addr ON l.addrid = addr.id WHERE FIND_IN_SET($tid, `protype`) AND l.`title` LIKE '%$key%' LIMIT 0, 10");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            foreach ($res as $key=>$value) {
                //地区
                $addrname = $value['addrid'];
                if($addrname){
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
                }
                $res[$key]['typename']=$addrname;
            }
            echo json_encode($res);
            die;
        }
    }

//检查会员是否已经存在（添加家政店铺）
} elseif ($action == "checkUser_homemaking") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__homemaking_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在（添加保姆/月嫂）
}elseif($action == "checkUser_nanny"){
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__homemaking_nanny` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;
//模糊匹配家政公司
} elseif ($action == "checkHomemakingStore") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__homemaking_store` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;
//检查会员是否已经存在（添加服务人员）
}elseif($action == "checkUser_personal"){
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__homemaking_personal` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配个人会员
}elseif ($action == "checkPersonalUser") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        if($userType == 0)
            $where = "";
        if($userType == 3)
            $where = " AND `addr` in ($adminAreaIDs)";

        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone`, `email` FROM `#@__member` WHERE `mtype` = '1' and `username` like '%$key%'" .$where. "LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//检查会员是否已经存在（添加婚嫁店铺）
} elseif ($action == "checkUser_marrystore") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__marry_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配婚嫁公司
} elseif ($action == "checkMarryStore") {
    $key    = addslashes($_POST['key']);
    $filter = $_POST['filter'];
    if (!empty($key)) {
        $where   = " AND FIND_IN_SET('".$filter."', `bind_module`)" . getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__marry_store` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//检查会员是否已经存在（添加旅游店铺）
} elseif ($action == "checkUser_travelstore") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__travel_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//模糊匹配旅游公司
} elseif ($action == "checkTravelStore") {
    $key    = addslashes($_POST['key']);
    $filter = $_POST['filter'];
    if (!empty($key)) {
        $where   = " AND FIND_IN_SET('".$filter."', `bind_module`)" . getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_store` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;

//模糊匹配旅游个人
} elseif($action == "checkTravelPersonUser"){
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('zj.`cityid`');
        $zjSql = $dsql->SetQuery("SELECT user.id FROM `#@__travel_store` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE zj.state = 1 ".$where."");
        $zjResult = $dsql->dsqlOper($zjSql, "results");
        $idArr = '0';
        if(!empty($zjResult)){
            array_walk($zjResult, function($value, $key) use (&$idArr ){
                if(!empty($value['id'])){
                    $idArr .= $value['id']. ',';
                }
            });
            $idArr = rtrim($idArr, ',');
            $userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and `id` not in ($idArr) and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
            $userResult = $dsql->dsqlOper($userSql, "results");
            if ($userResult) {
                echo json_encode($userResult);
            }
        }else{
        	$userSql = $dsql->SetQuery("SELECT username, phone, nickname, id FROM  `#@__member`  WHERE `state` = 1 and (username like '%$key%' OR nickname like '%$key%') LIMIT 0, 10");
            $userResult = $dsql->dsqlOper($userSql, "results");
            if ($userResult) {
                echo json_encode($userResult);
            }
        }
    }
    die;

//模糊旅游商家
} elseif ($action == "checkTravelUser") {
    $key    = addslashes($_POST['key']);
    $filter = $_POST['filter'];
    if (!empty($key)) {
        $where = "  AND FIND_IN_SET('".$filter."', zj.`bind_module`)" . getCityFilter('zj.`cityid`');
        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, zj.id FROM `#@__travel_store` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE (user.username like '%$key%' OR user.nickname like '%$key%' OR zj.title like '%$key%')".$where." LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo json_encode($userResult);
        }
    }
    die;

//检查会员是否已经存在（添加教育店铺）
} elseif ($action == "checkUser_educationstore") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__education_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;
//模糊匹配家政公司
} elseif ($action == "checkEducationStore") {
    $key = addslashes($_POST['key']);
    if (!empty($key)) {
        $where = getCityFilter('`cityid`');
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `title` like '%$key%'".$where." LIMIT 0, 10");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            echo json_encode($commResult);
        }
    }
    die;
//检查会员是否已经存在（添加教育店铺）
} elseif ($action == "checkUser_educationtutor") {

    $key = addslashes($_POST['key']);
    $id  = $_POST['id'];
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.userid = " . $id;
        }
        //商家
        $commSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__education_store` WHERE `userid` = '$id'");
        $commResult = $dsql->dsqlOper($commSql, "results");
        if ($commResult) {
            $where = " AND company.userid = " . $commResult[0]['id'];
        }

        $userSql = $dsql->SetQuery("SELECT company.id FROM `#@__education_tutor` company WHERE 1=1" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;
//检查会员是否已经存在（添加养老店铺）
} elseif ($action == "checkUser_pensionstore") {

    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__pension_store` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//检查会员是否已经存在老人信息
}elseif ($action == "checkUser_pensionelderly") {
    $key = addslashes($_POST['key']);
    $result = "";
    if (!empty($key)) {
        $userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `phone` FROM `#@__member` WHERE `username` like '%$key%' LIMIT 0, 10");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $result = json_encode($userResult);
        }

        $where = "";
        if (!empty($id)) {
            $where = " AND company.id != " . $id;
        }

        $userSql = $dsql->SetQuery("SELECT user.username, user.phone, user.nickname, company.id FROM `#@__pension_elderly` company LEFT JOIN `#@__member` user ON user.id = company.userid WHERE user.username = '$key'" . $where);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            echo 200;
        } else {
            echo $result;
        }
    }
    die;

//接口添加短信模板
}elseif($action == "addSmsTemplate"){

    global $cfg_smsAlidayu;
    global $cfg_wechatName;

    // if ($cfg_smsAlidayu != 1 && $cfg_smsAlidayu != 2) {
    if ($cfg_smsAlidayu != 1) {
        if($id){
            die('{"state":"200","info":' . json_encode("接口自动添加目前只支持【阿里云】平台！") . '}');
        }else{
            die('<h1>接口自动添加目前只支持【阿里云】平台！</h1>');
        }
    }

    //获取短信平台
    $archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` WHERE `state` = 1");
    $results = $dsql->dsqlOper($archives, "results");
    if ($results) {

        $data = $results[0];
        $portal = $data['title'];
        $username = $data['username'];
        $password = $data['password'];
        $signCode = $data['signCode'];

    }else{

        if($id){
            die('{"state":"200","info":' . json_encode("短信平台未配置，添加失败！") . '}');
        }else{
            die('<h1>短信平台未配置，添加失败！</h1>');
        }

    }

    //指定添加某个模板
    if($id){

        //获取模板信息
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `sms_body`, `sms_note`, `sms_rule` FROM `#@__site_notify` WHERE `id` = $id AND `sms_body` != '' AND `sms_note` != ''");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            die('{"state":"200","info":' . json_encode("请核实要添加的短信模板内容和申请说明是否完善！") . '}');
        }


    //批量全部添加
    }else{

        $pageSize = empty($pageSize) ? 1 : $pageSize;
		$page     = empty($page) ? 1 : $page;

        $atpage = $pageSize*($page-1);
		$where = " LIMIT $atpage, $pageSize";

        $sql = $dsql->SetQuery("SELECT `id`, `title`, `sms_body`, `sms_note`, `sms_rule` FROM `#@__site_notify` WHERE `sms_body` != '' AND `sms_note` != ''");
        $totalCount = $dsql->dsqlOper($sql, "totalCount");

        //获取模板信息
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `sms_body`, `sms_note`, `sms_rule` FROM `#@__site_notify` WHERE `sms_body` != '' AND `sms_note` != '' ORDER BY `id` ASC" . $where);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            die('{"state":"200","info":' . json_encode("消息通知未配置，请核实！") . '}');
        }

    }

    $sms_id    = $ret[0]['id'];  //模板ID
    $sms_title = $ret[0]['title'];  //模板标题
    $sms_body = $ret[0]['sms_body'];  //模板内容
    $sms_note = ($cfg_wechatName ? '公众号：' . $cfg_wechatName . "；" : '') . $ret[0]['sms_note'];  //申请说明
    $sms_type = strstr($sms_body, '$code') || $cfg_smsAlidayu == 2 ? 0 : 1;  //短信类型  0验证码  1短信通知
    $sms_rule = $ret[0]['sms_rule'];

    //阿里云，一个自然日最多可以申请100个模板，间隔建议您控制在30S以上。
    if($cfg_smsAlidayu == 1){
        $second = 2;  //间隔时间（秒）

        preg_match_all('/\$\w+/', $sms_body, $sms_bodyArr);
        if($sms_bodyArr){
            foreach ($sms_bodyArr[0] as $key => $value) {
                $sms_body = str_replace($value, str_replace('$', '${', $value) . '}', $sms_body);
            }
        }

        //初始化访问的acsCleint
        include_once HUONIAOINC . '/class/sms/aliyun/CreateSmsTemplateRequest.php';
        $profile = DefaultProfile::getProfile("cn-hangzhou", $username, $password);
        DefaultProfile::addEndpoint("cn-hangzhou", "cn-hangzhou", "Dysmsapi", "dysmsapi.aliyuncs.com");
        $acsClient = new DefaultAcsClient($profile);

        //短信模板添加请求
        $request = new CreateSmsTemplateRequest();
        $request->setTemplateType($sms_type);
        $request->setTemplateName($sms_title);
        $request->setTemplateContent($sms_body);
        $request->setRemark($sms_note);
        $request->setRelatedSignName($signCode);
        $request->setTemplateRule($sms_rule);
        $request->setApplySceneContent($cfg_secureAccess . $cfg_basehost);
        $acsResponse = $acsClient->getAcsResponse($request);
        $resp = objtoarr($acsResponse);

        if($resp['Code'] == 'OK'){
            $code = $resp['TemplateCode'];

            //更新模板ID
            $sql = $dsql->SetQuery("UPDATE `#@__site_notify` SET `sms_tempid` = '$code' WHERE `id` = $sms_id");
            $ret = $dsql->dsqlOper($sql, "update");

        }else{
            $err = 'Code[' . $resp['Code'] . ']；Message[' . $resp['Message'] . ']';
        }
    }

    //腾讯云，接口请求频率限制：2次/秒。
    if($cfg_smsAlidayu == 2){
        $second = 0.5;  //间隔时间（秒）
    }

    if($err){
        if($id){
            die('{"state":"200","info":' . json_encode("添加失败，请重试！消息名称：".$sms_title."，错误信息：" . $err) . '}');
        }else{
            die('<h1>添加失败！消息名称：'.$sms_title.'，错误信息：'.$err.'，请'.$second.'秒后刷新重试！</h1>');
        }
    }

    if($id){
        die('{"state":"100","info":' . json_encode("添加成功，模板正在审核中，请登录短信平台查看审核结果！") . ',"code":"'.$code.'"}');
    }else{

        if($page == $totalCount){
            ShowMsg("{$totalCount}条模板全部导入成功，当前页面可以关掉了！", "javascript:;");
        }else{
            $page++;
            ShowMsg("共有{$totalCount}条模板需要添加，正在导入第".($page-1)."条，请稍候...", "?action=addSmsTemplate&page=".$page, 0, $second*1000);
        }
    }


} elseif ($action == "addWxTemplate") {
    //引入配置文件
    $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
    if(!file_exists($wechatConfig)) return array("state" => 200, "info" => '请先设置微信开发者信息！');
    require($wechatConfig);

    include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $token = $jssdk->getAccessToken();

    if (!$token) die('{"state":"200","info":"Token获取失败！"}');
    if ((int)$addtype == 0) {
        /*设置所属行业*/
        $url = 'https://api.weixin.qq.com/cgi-bin/template/api_set_industry?access_token='.$token;
        $paramarr = array (
            'industry_id1' => '1',
            'industry_id2' => '39',
        );
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paramarr));
        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        $output = curl_exec($ch);
        curl_close($ch);

        if (empty($output)) {
            return '{"state": 200, "info": "请求失败，请稍候重试！"}';
        }
        $result = json_decode($output, true);

        if ($result['errmsg'] != 'ok') {
            if (strstr($result['errmsg'], 'change template too frequently')) {
                die('{"state":"200","info":"设置失败，请求过于频繁，请到微信公众平台模版库查看可修改的时间!"}');
            } elseif(strstr($result['errmsg'], 'invalid industry index')) {
                die('{"state":"200","info":"模板已设置请勿重复设置，或者到公众平台模版库设置；！"}');
            } else {
                die('{"state":"200","info":' . json_encode($result['errmsg']) . '}');
            }
        }
    } else {
        /*导入模板消息*/
        //指定添加某个模板
        $wechat_serialarr = array ();
        $template_title = "";
        if($id){

            //获取模板信息
            $sql = $dsql->SetQuery("SELECT `id`, `title`, `wechat_serial` FROM `#@__site_notify` WHERE `id` = $id AND `wechat_state` = 1 AND `wechat_serial` !='' ");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret ){
                die('{"state":"200","info":' . json_encode("请核实要添加的微信公众号模板得模板编号是否填写正常,或者微信模板是否已经启用！") . '}');
            }
            $template_title = $ret[0]['title'];
            $wechat_serialarr['template_id_short'] = $ret[0]['wechat_serial'];
            //批量全部添加
        }else{
            $pageSize = empty($pageSize) ? 1 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $atpage = $pageSize*($page-1);
            $where = " LIMIT $atpage, $pageSize";

            $sql = $dsql->SetQuery("SELECT `id`, `wechat_serial` FROM `#@__site_notify` WHERE `wechat_serial` != '' AND `wechat_state` = 1 GROUP  BY `wechat_serial` LIMIT 0,25");
            $totalCount = $dsql->dsqlOper($sql, "totalCount");

            //获取模板信息
            $sql = $dsql->SetQuery("SELECT `id`, `title`, `wechat_serial` FROM `#@__site_notify` WHERE `wechat_serial` != '' AND `wechat_state` = 1 GROUP  BY `wechat_serial` ORDER BY `id` ASC" . $where);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                die('{"state":"200","info":' . json_encode("消息通知未配置，请核实！") . '}');
            }

            $template_title = $ret[0]['title'];
            $wechat_serialarr['template_id_short'] = $ret[0]['wechat_serial'];
        }

        if (!empty($wechat_serialarr)) {

            $url = 'https://api.weixin.qq.com/cgi-bin/template/api_add_template?access_token='.$token;
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($wechat_serialarr));
            curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            $output = curl_exec($ch);
            curl_close($ch);

            if (empty($output)) {
                return '{"state": 200, "info": "请求失败，请稍候重试！"}';
            }
            $result = json_decode($output, true);
            if ($result['errmsg'] != 'ok') {
                if ($result['errcode'] == '45026') {
                    $err = "模板数量达到上限，请到微信公众平台模板库清理不用的模板后再导入！";
                } else {
                    $err = '标题[' . $template_title . ']；TemplateID[' . $wechat_serialarr['template_id_short'] . ']；Code[' . $result['errcode'] . ']；Message[' . $result['errmsg'] . ']';
                }
            } else {
                $code = $result['template_id'];
                $archives = $dsql->SetQuery("UPDATE `#@__site_notify` SET `wechat_tempid` = '" . $result['template_id'] . "' WHERE `wechat_serial` = '" . $wechat_serialarr['template_id_short']."'");
                $results  = $dsql->dsqlOper($archives, "update");
            }
        }


        $second = 0.5;  //间隔时间（秒）

        if($err){
            if($id){
                die('{"state":"200","info":' . json_encode("添加失败，请重试！错误信息：" . $err) . '}');
            }else{
                die('<h1>添加失败！错误信息：'.$err.'，请'.$second.'秒后刷新重试！</h1>');
            }
        }

        if($id){
            die('{"state":"100","info":' . json_encode("添加成功，模板正在审核中，请登录短信平台查看审核结果！") . ',"code":"'.$code.'"}');
        }else{

            if($page == $totalCount){
                ShowMsg("{$totalCount}条模板全部导入成功，当前页面可以关掉了！", "javascript:;");
            }else{
                $page++;
                ShowMsg("共有{$totalCount}条模板需要添加，正在导入第".($page-1)."条，".$second."秒后开始导入下一条。" , "?action=addWxTemplate&addtype=1&page=".$page, 0, $second*1000);
            }
        }

    }
} elseif($action == "tbshop") {

    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;
    $second = 0.5;

    $pageSize = empty($pageSize) ? 1 : $pageSize;
    $page     = empty($page) ? 1 : $page;


    $atpage = $pageSize*($page-1);
    $where = " LIMIT $atpage, $pageSize";

    $sql = $dsql->SetQuery("SELECT `id`,`phone`,`shopname`,`address`,`coordY`,`coordX`,`category`,`cityid` FROM `#@__waimai_shop` WHERE `ysshop_id` = 0");

    $totalCount = $dsql->dsqlOper($sql, "totalCount");

    $sql1 = $dsql->SetQuery("SELECT `id`,`phone`,`shopname`,`address`,`coordY`,`coordX`,`category`,`cityid` FROM `#@__waimai_shop` WHERE `ysshop_id` = 0".$where);
    $res = $dsql->dsqlOper($sql1, "results");

    if ($custom_otherpeisong == 2 ) {
        $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
        require_once $pluginFile;
        $youShanSuDaClass = new youshansuda();

        $error  = 0;
        if ($res) {
            $v = $res[0];
            if ($v['phone'] == '' || $v['shopname'] == '' || $v['cityid'] == '' || $v['address'] == '' || $v['coordY'] == '' || $v['coordX'] == '' || $v['category'] == '') {
                $error = 1;

                $msg = '第三方店铺同步缺少必要参数';
            }
            /*优闪速达*/
            include_once HUONIAOROOT . "/api/handlers/siteConfig.class.php";

            $siteConfigService = new siteConfig();

            $param   = array(
                'tab' => 'site_area',
                'id'  => (int)$v['cityid']
            );
            $handels = new handlers('siteConfig', 'getPublicParentInfo');
            $return  = $handels->getHandle($param);

            $province = $city = '';
            if ($return['state'] == 100) {

                $info     = $return['info'];
                $province = $info['names'][0];
                $city     = $info['names'][1];

            }

            if ($error == 0) {
                $category = explode(',', $v['category']);
                $data     = array(
                    'shop_phone'       => $v['phone'],
                    'shop_name'        => $v['shopname'],
                    'province'         => $province,
                    'city'             => $v['city'],
                    'address'          => str_replace(PHP_EOL, '', $v['address']),
                    'address_detailed' => str_replace(PHP_EOL, '', $v['address']),
                    'shop_lng'         => $v['coordY'],
                    'shop_lat'         => $v['coordX'],
                    'first_type'       => $category[0],
                    'second_type'      => $category[1],
                );

                $results = $youShanSuDaClass->addShop($data);

                if ($results['code'] == 200) {

                    $results     = $results['data'];
                    $other_param = serialize($results);
                    $sql         = $dsql->SetQuery("UPDATE `#@__$dbname` SET`ysshop_id` = '" . $results['shop_id'] . "' ,`other_param` = '$other_param' WHERE `id` = '$id'");
                    $dsql->dsqlOper($sql, "update");
                } else {
                    $error = 2;

                    $msg = $results['msg'];
                }
            }


        }

        if($page == $totalCount){
            ShowMsg("{$totalCount}条模板全部导入成功，当前页面可以关掉了！", "javascript:;");
        }else{

            $errormsg = '';
            if($error !=0 ){
                $errormsg = "同步【".$v['shopname']."】产生错误:<strong>".$msg."</strong>";
            }
            $page++;
            ShowMsg("共有{$totalCount}店铺需要同步，正在同步第".($page-1)."条，".$second."秒后开始导入下一条。" . ($cfg_smsAlidayu == 1 ? "<font color='#ff0000'>".$errormsg."</font>" : ''), "?action=tbshop&page=".$page, 0, $second*1000);
        }
    }
}

//生成随机密码
elseif($action == "generatePassword"){
    die(json_encode(array('state' => 100, 'info' => generatePassword(rand(10,20)))));
}
