<?php
/**
 * 自动执行阅读量任务
*/

// 1.查询表，列出可执行条件列表
$now = time();
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_18_read` WHERE `state` = 1 AND `nextTime` <= $now ORDER BY `nextTime`");

// 测试忽略时间
if($_GET['action']=="run"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_18_read` WHERE `state` = 1 ORDER BY `nextTime`");
}

$ret = $dsql->dsqlOper($sql, "results");
//$ret = null;
if($ret){
    // 2.调用执行代码即可
    foreach ($ret as $key => $value) {
        $tid = $value['id'];
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_read` where `id`=$tid order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $module = $res[0]['module'];
        $interval = $res[0]['interval'];
        // 包含该实现模块，调用该run方法
        $className = dirname(__FILE__)."/".$module.".cron.php";
        if(file_exists($className)){
            include_once($className);
            $Module = new $module();
            $res = $Module->read($tid);  // 获取执行结果
            // 执行成功后，上次执行时间为当前时间，下次下次执行时间计算得到
            if($res==1){
                $preTime  = time();
                $nextTime = time()+($interval*60);
                $sql = $dsql->SetQuery("update `#@__site_plugins_18_read` set `preTime`='$preTime', `nextTime`=$nextTime where `id`=$tid");
                $res = $dsql->dsqlOper($sql,"update");
            }
        }
        // 失败，无提示
    }
}



/**
 * 自动执行阅读量任务
 */

// 1.查询表，列出可执行条件列表
$now = time();
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_18_dianzan` WHERE `state` = 1 AND `nextTime` <= $now ORDER BY `nextTime`");

// 测试忽略时间
if($_GET['action']=="run"){
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_18_dianzan` WHERE `state` = 1 ORDER BY `nextTime`");
}

$ret = $dsql->dsqlOper($sql, "results");
//$ret = null;
if($ret){
    // 2.调用执行代码即可
    foreach ($ret as $key => $value) {
        $tid = $value['id'];
        $sql = $dsql->SetQuery("select * from `#@__site_plugins_18_dianzan` where `id`=$tid order by id desc");
        $res = $dsql->dsqlOper($sql,"results");
        $module = $res[0]['module'];
        $interval = $res[0]['interval'];
        // 包含该实现模块，调用该run方法
        $className = dirname(__FILE__)."/".$module.".cron.php";
        if(file_exists($className)){
            include_once($className);
            $Module = new $module();
            $res = $Module->dianzan($tid);  // 获取执行结果
            // 执行成功后，上次执行时间为当前时间，下次下次执行时间计算得到
            if($res==1){
                $preTime  = time();
                $nextTime = time()+($interval*60);
                $sql = $dsql->SetQuery("update `#@__site_plugins_18_dianzan` set `preTime`='$preTime', `nextTime`=$nextTime where `id`=$tid");
                $res = $dsql->dsqlOper($sql,"update");
            }
        }
        // 失败，无提示
    }
}


