<?php
//系统核心配置文件
require_once(dirname(__FILE__).'/../include/common.inc.php');
// $autoload = true;
//
// function classLoader($class){
//     $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
//     $file = __DIR__ . '/upload/' . $path . '.php';
//
//     if (file_exists($file)) {
//         require_once $file;
//     }
// }
// spl_autoload_register('classLoader');
//
// require_once(dirname(__FILE__).'/upload/Qiniu/functions.php');
//
// use Qiniu\Auth;
// use Qiniu\Storage\UploadManager;
// use Qiniu\Storage\BucketManager;

global $cfg_wechatAppid;
global $cfg_wechatAppsecret;
global $cfg_uploadDir;
global $cfg_basehost;
global $cfg_audioSize;
global $cfg_audioType;

$media_id = $_REQUEST["media_id"];
$module   = $_REQUEST["module"];
$module   = empty($module) ? "siteConfig" : $module;

if(empty($media_id)) die(json_encode(array("state" => 200, "info" => "微信配置错误！")));

// $sql = $dsql->SetQuery("SELECT * FROM `#@__app_audio_video_config` LIMIT 0, 1");
// $ret = $dsql->dsqlOper($sql, "results");
// if($ret){
//     $data = $ret[0];
//     $access_key    = $data['access_key'];
//     $secret_key    = $data['secret_key'];
//     $bucket        = $data['bucket'];
//     $pipeline      = $data['pipeline'];
//     $domain        = $data['domain'];
//     $audio_quality = $data['audio_quality'];
// }else{
//     die(json_encode(array("state" => 200, "info" => "请先配置APP音视频处理参数！")));
// }


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

$cfg_softType = explode("|", $cfg_softType);
$cfg_editorType = explode("|", $cfg_editorType);
$cfg_videoType = explode("|", $cfg_videoType);

$editor_fileUrl = $cfg_ftpUrl;
$editor_uploadDir = $cfg_uploadDir;
// $cfg_uploadDir = ".." . $cfg_uploadDir;
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
    $editor_ftpType = 4;
    $editor_ftpState = 0;

//本地
} elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
    $editor_ftpType = 5;
    $editor_ftpState = 0;

}


if($cfg_wechatAppid && $cfg_wechatAppsecret){
    include HUONIAOINC."/class/WechatJSSDK.class.php";
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $access_token = $jssdk->getAccessToken();

    //微信上传下载媒体文件
    $url = "https://api.weixin.qq.com/cgi-bin/media/get?access_token={$access_token}&media_id={$media_id}";

    /* 上传配置 */
    $config = array(
        "savePath" => ".." . $editor_uploadDir . '/' . $module . "/audio/weixin/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
        "maxSize" => $cfg_audioSize,
        "allowFiles" => $cfg_audioType
    );

    $ret = getRemoteImage(array($url),$config,$module,"..",false,false,'amr');
    $ret = json_decode($ret, true);
    if($ret['state'] == 'SUCCESS'){
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $dsql;
        $moderationCallbackUrl = $cfg_secureAccess.$cfg_basehost."/api/moderationCallback.php?id=".$ret['list'][0]['aid'];
        global $cfg_moderationYP;
        if(isset($cfg_moderationYP) && !empty($cfg_moderationYP)){
            //音频审核
            global $autoload;
            $autoload = true;
            $moderationRes = RunCreateAudioModerationJob($ret['list'][0]['turl'],$moderationCallbackUrl);
            if($moderationRes!==false){
                $moderationRes = json_decode($moderationRes,true);
                $job_id = $moderationRes['job_id'];
                $sql = $dsql::SetQuery("update `#@__attachment` set `moderateJobId`='$job_id' where `id`={$ret['list'][0]['aid']}");
                $dsql->update($sql);
            }
        }

        die(json_encode(array("state" => 100, "info" => $ret['list'][0]['turl'])));
    }else{
        die(json_encode(array("state" => 200, "info" => "Error!")));
    }


    //保存的路径及文件名
    $dir = $cfg_uploadDir . "/audio/weixin/";
    $name = time() . rand(1, 10000) . ".amr";

    if(!is_dir(HUONIAOROOT . $dir)){
        if (!@mkdir(HUONIAOROOT . $dir, 0777, true)){
          die(json_encode(array("state" => 200, "info" => "服务器没有创建文件夹权限！")));
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
	file_put_contents(HUONIAOROOT . $dir . $name, $con);


    // include HUONIAOINC."/class/httpdown.class.php";
    // $httpdown = new httpdown();
  	// $httpdown->OpenUrl($url); # 远程文件地址
  	// $httpdown->SaveToBin(HUONIAOROOT . $dir . $name); # 保存路径及文件名
  	// $httpdown->Close(); # 释放资源

    //七牛转码
    $auth = new Auth($access_key, $secret_key);
    $newName = create_sess_id();
    $savekey = Qiniu\base64_urlSafeEncode($bucket.':'.$newName.'.mp3');

    //设置转码参数
    $fops = "avthumb/mp3/ab/{$audio_quality}k/ar/44100/acodec/libmp3lame";
    $fops = $fops.'|saveas/'.$savekey;

    $policy = array(
        'persistentOps' => $fops,
        'persistentPipeline' => $pipeline,
        // 'persistentNotifyUrl' => 'https://'  成功通知
    );

    //成功通知结果   https://developer.qiniu.com/dora/manual/3686/pfop-directions-for-use

    //实例
    //{"id":"z0.0A22344148402AA8255D522E3A269638","pipeline":"1380999352.huoniao","code":3,"desc":"The fop is failed","reqid":"nksAAGutzcK_XboV","inputBucket":"huoniao","inputKey":"/article/audio/large/2019/08/13/15656668738589.amr","items":[{"cmd":"avthumb/mp3/ab/160k/ar/44100/acodec/libmp3lame|saveas/aHVvbmlhbzoyODk2ZjdhMTQ2Y2VhNTFhNTQ5M2Q3NTdmZWVmZjg4MC5tcDM=","code":3,"desc":"The fop is failed","error":"execute fop cmd failed: source data is empty or fail to get source data","returnOld":0}]}

    //{"id":"z0.0A22344148402AA8255D522F4F27B893","pipeline":"1380999352.huoniao","code":0,"desc":"The fop was completed successfully","reqid":"nksAAALa_ZH8XboV","inputBucket":"huoniao","inputKey":"/article/audio/large/2019/08/13/1565667150637.amr","items":[{"cmd":"avthumb/mp3/ab/160k/ar/44100/acodec/libmp3lame|saveas/aHVvbmlhbzpkNzZkNGE2YWM2YjlmMjYzMmUxMzJjMDU5MjU5Njg3Zi5tcDM=","code":0,"desc":"The fop was completed successfully","hash":"Ftn_1AbvWzJBoTdrDbF081Drd1Ef","key":"d76d4a6ac6b9f2632e132c059259687f.mp3","returnOld":0}]}

    //code	int	状态码，0 表示成功，1 表示等待处理，2 表示正在处理，3 表示处理失败，4 表示回调失败。
    //desc	string	状态码对应的详细描述。

    //指定上传转码命令
    $uptoken = $auth->uploadToken($bucket, null, 3600, $policy);
    $key = $media_id.'.amr'; //七牛云中保存的amr文件名
    $uploadMgr = new UploadManager();
    list($ret, $err) = $uploadMgr->putFile($uptoken, $key, HUONIAOROOT . $dir . $name);

    if ($err !== null) {
        echo json_encode(array("state" => 200, "info" => "上传失败！"));
    }else{

        //此时七牛云中同一段音频文件有amr和MP3两个格式的两个文件同时存在
        // $bucketMgr = new BucketManager($auth);

        //为节省空间,删除amr格式文件
        //不要删除，删除会影响七牛云转码，因为在转码过程中，如果将此文件删除，会导致转码失败
        // $bucketMgr->delete($bucket, $key);

        //删除服务器上的amr文件
        unlinkFile(HUONIAOROOT . $dir . $name);

        //由于使用七牛的地址直接播放会有延迟的问题，所以这里多做了一步从七牛再下载到本地的操作
        // $file->OpenUrl("http://{$domain}/{$newName}.mp3"); # 远程文件地址
        // $file->SaveToBin(HUONIAOROOT . $dir . $newName . ".mp3"); # 保存路径及文件名
        // $file->Close(); # 释放资源

        //验证文件是否下载成功
        // if(!file_exists(HUONIAOROOT . $dir . $newName . ".mp3")){
        // 	echo json_encode(array("state" => 200, "info" => "云端下载失败！"));
        // }else{

        sleep(2);  //延迟2秒
    	echo json_encode(array("state" => 100, "info" => $cfg_secureAccess . "{$domain}/{$newName}.mp3"));
        // }
    }

}else{
    echo json_encode(array("state" => 200, "info" => "微信配置错误！"));
}
