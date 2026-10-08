<?php
//if(defined('HUONIAOINC')){
//    return;
//}
//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');

$updatenoticesql  = $dsql ->SetQuery("SELECT * FROM `#@__updatemessage` WHERE `is_update` = 0 AND `online` = 0 ORDER BY `id` ASC");
$updatenoticeres  = $dsql->dsqlOper($updatenoticesql,"results");

if($updatenoticeres){
    foreach ($updatenoticeres as $k => $v){

        //先更新通知状态
        $sql = $dsql->SetQuery("UPDATE `#@__updatemessage` SET `is_update` = 1 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");

        //删除2天前已经发送成功的记录
        $time = GetMkTime(time());
        $etime = $time-172800;
        $desql = $dsql->SetQuery("DELETE FROM `#@__updatemessage` WHERE `is_update` = 1 AND `time` < $etime");
        $deres = $dsql->dsqlOper($desql,"update");

        //后发通知，防止出现重复发送的问题
        if($v['type'] ==0){
            $param = unserialize($v['param']);
            updateAdminNotice($v['module'], $v['part'],$param,1,$v['id']);
        }else{
            $param = unserialize($v['param']);
            $config = unserialize($v['config']);
            updateMemberNotice($v['uid'], $v['notify'], $param, $config,'','',1);
        }

    }
}

//同步数据到搜索引擎
global $esConfig;
if($esConfig['open']){
    
    //查询待同步的前100条数据
    $sql = $dsql->SetQuery("SELECT `id`, `service`, `aid`, `second` FROM `#@__site_es_queue` ORDER BY `id` ASC LIMIT 0, 100");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $value){
            $_es_id = $value['id'];
            $_es_service = $value['service'];
            $_es_aid = $value['aid'];
            $_es_second = $value['second'];

            //同步数据到ES，成功后删除队列数据
            $res = (int)dataAsync($_es_service, $_es_aid, $_es_second, 1);
            if($res){
                $sql = $dsql->SetQuery("DELETE FROM `#@__site_es_queue` WHERE `id` = ".$_es_id);
                $dsql->dsqlOper($sql, "update");
            }
        }
    }

}

?>
