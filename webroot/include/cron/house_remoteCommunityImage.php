<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 远程下载房产小区第三方图片
 *
 * 1. 查询小区表
 * 2. 查询图集表
 *
 * @version        $Id: house_remoteCommunityImage.php 2019-02-19 上午11:32:21 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

//查找小区表
$tab = '#@__house_community';
$field = 'litpic';
$sql = $dsql->SetQuery("SELECT `id`, `".$field."` FROM `".$tab."` WHERE `".$field."` like 'http%' ORDER BY `id` ASC LIMIT 50");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $val){
        $id = $val['id'];
        $litpic = $val[$field];

        remoteCommunityImage($litpic, $tab, $id, $field);
    }
}else{

    $tab = '#@__house_pic';
    $field = 'picPath';
    $sql = $dsql->SetQuery("SELECT `id`, `".$field."` FROM `".$tab."` WHERE `".$field."` like 'http%' ORDER BY `id` ASC LIMIT 50");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $val){
            $id = $val['id'];
            $litpic = $val[$field];

            remoteCommunityImage($litpic, $tab, $id, $field);
        }
    }
}


function remoteCommunityImage($url, $tab, $id, $field){

    $path = HUONIAOROOT;
//    $path = '..';

    /* 上传配置 */
    $config = array(
        "savePath" => $path . "/uploads/house/community/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/",
        "maxSize" => 1024000
    );
    $fieldName = array($url);

    global $dsql;
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
    global $editor_uploadDir;

    $cfg_softType = explode("|", $cfg_softType);
    $cfg_editorType = explode("|", $cfg_editorType);
    $cfg_videoType = explode("|", $cfg_videoType);

    $editor_uploadDir = $cfg_uploadDir;
//    $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
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

    $remoteImg = json_decode(getRemoteImage($fieldName, $config, 'house', $path, false, false), true);

    if($remoteImg['state'] == 'SUCCESS'){
        $fid = $remoteImg['list'][0]['fid'];
        $path_ = $remoteImg['list'][0]['path'];

        if(file_exists(HUONIAOROOT . $path_)) {
            //更新表
            $sql = $dsql->SetQuery("UPDATE `" . $tab . "` SET `" . $field . "` = '$fid' WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");
        }
    }

}