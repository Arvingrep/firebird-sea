<?php
// 华为云隐私保护通话
// AXB模式话单通知接口
// 此文件用于接收挂断电话后，主动推送的话单数据，系统只对成功接听并主动挂断的账单和录音文件进行本地保存
require_once(dirname(__FILE__).'/../include/common.inc.php');

// 核心文件
include_once(HUONIAOINC . "/config/privatenumberConfig.inc.php");
$huaweiPrivatenumber = new huaweiPrivatenumber();

//请求Headers
$wsse = $_SERVER['HTTP_X_WSSE'];
// $wsse = "UsernameToken Username=\"xxx\",PasswordDigest=\"IQPdQvFy\/FIHOzDsI2ZGvc\/9LDKLcfeJmHpBB3Fc7YI=\",Nonce=\"57c7298675cf4f65b4ed42e4b9ab841e\",Created=\"2022-05-13T05:25:06Z\"";

//验签
$wsseArr = explode(',', stripslashes($wsse));
$username = $password = $nonce = $created = '';

foreach($wsseArr as $key => $val) {
    $data = preg_match_all('/\"(.*?)\"/',$val,$rows);
    $value = str_replace('"', '', $rows[0][0]);
    if($key == 0){
        $username = $value;
    }elseif($key == 1){
        $password = $value;
    }elseif($key == 2){
        $nonce = $value;
    }elseif($key == 3){
        $created = $value;
    }
}

$base64 = base64_encode(hash('sha256', ($nonce . $created . $huawei_privatenumber_app_secret), TRUE));

if($base64 != $password){
    exit('验签失败');
}

//接口内容
$report = $GLOBALS["HTTP_RAW_POST_DATA"] ? $GLOBALS["HTTP_RAW_POST_DATA"] : file_get_contents("php://input");
// $report = '{"eventType":"fee","feeLst":[{"direction":1,"spId":"kumanruanjian_pv","appKey":"xxx","icid":"c08dd88381a6deaa14e1c26e89e19b16.3861408249.24986516.29","bindNum":"+8617068754375","sessionId":"+8613442977762_+8615006212131_4_627e5c1f_963036_669_1_0","subscriptionId":"c1564552-844a-4048-9ac7-d4f5944543fc","callerNum":"+8615006212131","calleeNum":"+8617068754375","fwdDisplayNum":"+8617068754375","fwdDstNum":"+8618605222935","callInTime":"2022-05-13 05:24:57","fwdStartTime":"2022-05-13 05:24:58","fwdAlertingTime":"2022-05-13 05:25:01","fwdAnswerTime":"2022-05-13 05:25:18","callEndTime":"2022-05-13 05:25:41","fwdUnaswRsn":0,"ulFailReason":0,"sipStatusCode":0,"callOutUnaswRsn":0,"recordFlag":1,"recordStartTime":"2022-05-13 05:25:18","recordDomain":"ostorQH2.huawei.com","recordBucketName":"sp-xxx","recordObjectName":"22051313251812007961340.wav","ttsPlayTimes":0,"ttsTransDuration":0,"mptyId":"c1564552-844a-4048-9ac7-d4f5944543fc","serviceType":"004","hostName":"qhats01.huaweicaas.com","voiceCheckType":0}]}';

$jsonArr = json_decode($report, true); //将通知消息解析为关联数组
$eventType = $jsonArr['eventType']; //通知事件类型

if (strcasecmp($eventType, 'fee') != 0) {
    print_r('EventType error: ' . $eventType);
    return;
}

if (!array_key_exists('feeLst', $jsonArr)) {
    print_r('param error: no feeLst.');
    return;
}


/* 上传配置 */
$path = '..';

$config = array(
    "savePath" => $path . "/uploads/siteConfig/privatenumber/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
    "maxSize" => 10240, //单位KB
);

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
$cfg_uploadDir = "/" . $path . $cfg_uploadDir;
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


$feeLst = $jsonArr['feeLst']; //呼叫话单事件信息
foreach($feeLst as $key => $val){

    $ulFailReason = (int)$val['ulFailReason'];  //通话失败的拆线点

    //此处只记录为0的情况（表示接通后主动挂机）
    if($ulFailReason != 0){
        continue;
    }

    $subscriptionId = $val['subscriptionId'];  //绑定ID
    $time1 = GetMkTime($val['callInTime']);  //呼入的开始时间
    $time2 = GetMkTime($val['fwdAlertingTime']);  //转接呼叫操作后的振铃时间
    $time3 = GetMkTime($val['fwdAnswerTime']);  //转接呼叫操作后的应答时间
    $time4 = GetMkTime($val['callEndTime']);  //呼叫结束时间

    //根据绑定的ID，查询绑定记录表的自增ID
    $sql = $dsql->SetQuery("SELECT `id`, `number` FROM `#@__site_privatenumber_bind` WHERE `subscriptionId` = '$subscriptionId'");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!$ret){
        continue;
    }
    $bid = $ret[0]['id'];
    $number = $ret[0]['number'];

    $recordDomain = $val['recordDomain'];  //存放录音文件的域名
    $recordObjectName = $val['recordObjectName'];  //录音文件名

    // 请求URL参数
    $data = http_build_query([
        'recordDomain' => $recordDomain,
        'fileName' => $recordObjectName
    ]);

    //获取录音文件下载地址
    $ret = $huaweiPrivatenumber->execute('https://rtcpns.cn-north-1.myhuaweicloud.com/rest/provision/voice/record/v1.0?' . $data, '', 'GET');

    //远程下载录音到本地&云存储
    $fieldName = array($ret);
    $remote = json_decode(getRemoteImage($fieldName, $config, 'siteConfig', $path, false, 0, 'wav'), true);

    $record = '';
    if($remote['state'] == 'SUCCESS'){
        $record = $remote['list'][0]['path'];
    }

    //更新呼叫记录表
    $sql = $dsql->SetQuery("INSERT INTO `#@__site_privatenumber_call` (`number`, `bid`, `time1`, `time2`, `time3`, `time4`, `record`) VALUES ('$number', '$bid', '$time1', '$time2', '$time3', '$time4', '$record')");
    $dsql->dsqlOper($sql, "update");

}