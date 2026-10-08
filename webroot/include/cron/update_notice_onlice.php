<?php
//if(defined('HUONIAOINC')){
//    return;
//}
//系统核心配置文件
require_once(dirname(__FILE__).'/../common.inc.php');
require_once(dirname(__FILE__).'/../common.func.php');

$updatenoticesql  = $dsql ->SetQuery("SELECT * FROM `#@__updatemessage` WHERE `is_update` =  0 AND `online` = 1 ORDER BY `id` ASC");

$updatenoticeres  = $dsql->dsqlOper($updatenoticesql,"results");

if($updatenoticeres){
    foreach ($updatenoticeres as $k => $v){
        if($v['type'] ==0){
            $param = unserialize($v['param']);
            updateAdminNotice($v['module'], $v['part'],$param,1,$v['id']);
        }else{
            $param = unserialize($v['param']);
            $config = unserialize($v['config']);
            updateMemberNotice($v['uid'], $v['notify'], $param, $config,'','',1);
        }
        $sql = $dsql->SetQuery("UPDATE `#@__updatemessage` SET `is_update` = 1 WHERE `id` = ".$v['id']);
        $dsql->dsqlOper($sql, "update");
        $time = GetMkTime(time());
        $desql = $dsql->SetQuery("DELETE FROM `#@__updatemessage` WHERE `is_update` = 1 AND `time` <".($time-172800));

        $deres = $dsql->dsqlOper($desql,"update");

    }
}

?>