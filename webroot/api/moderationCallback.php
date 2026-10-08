<?php
/**
 * 音视频内容审核回调通知文件
*/

include "../include/common.inc.php";

$fid = $_GET['id'] ? (int)$_GET['id'] : 0;

if(!empty($fid)){

    //根据fid取出 jobid 和 job类型
    $sql = $dsql::SetQuery("select `id`,`moderateJobId`,`filetype`,`path` from `#@__attachment` where `id`=$fid");
    $attaDetail = $dsql->getArr($sql);

    if(!is_array($attaDetail)){
        die;
    }

    //初始化日志
    require_once HUONIAOROOT . "/api/payment/log.php";
    $_moderationLog= new CLogFileHandler(HUONIAOROOT . '/log/moderation/' . date('Y-m-d').'.log', true);

    $fid = $attaDetail['id'];
    $fileType = $attaDetail['filetype'];
    $jobId = $attaDetail['moderateJobId'];
    $filePath = $attaDetail['path'];
    $filePathArr = explode("/",$filePath);
    if(count($filePathArr)<3){
        die;
    }
    $mod = $filePathArr[1];
    $delType = $filePathArr[2];
    if($delType!="editor"){
        $delType = "del".$delType;
    }

    //这里需要强制声明可以删除文件
    global $cfg_filedelstatus;
    $cfg_filedelstatus = 1;
    
    if($fileType=="audio"){
        //查询音频
        $moderationRes = RunQueryAudioModerationJob($jobId);
        if($moderationRes!==false){
            $moderationRes = json_decode($moderationRes,true);
            if($moderationRes['result']['suggestion']=="block"){
                $_moderationLog->DEBUG(json_encode($moderationRes, JSON_UNESCAPED_UNICODE));
                delPicFile($fid,$delType,$mod,true);
                echo "删除成功";
            }
        }
    }

    if($fileType=="video"){
        //查询视频
        $moderationRes = RunQueryVideoModerationJob($jobId);
        if($moderationRes!==false){
            $moderationRes = json_decode($moderationRes,true);
            if($moderationRes['result']['suggestion']=="block"){
                $_moderationLog->DEBUG(json_encode($moderationRes, JSON_UNESCAPED_UNICODE));
                delPicFile($fid,$delType,$mod,true);
                echo "删除成功";
            }
        }
    }
}
