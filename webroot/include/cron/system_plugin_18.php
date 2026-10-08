<?php

// 虚拟用户插件，已知PID为18

// 1.判断是否安装了虚拟用户插件（查表）

$sql = $dsql->SetQuery("select * from `#@__site_plugins` where pid=18");
$ret = $dsql->dsqlOper($sql,"results");

$checkPre = true;

// 1.1 插件是否安装
if(empty($ret)){
    $checkPre = false;
}
// 1.2.插件的状态是否开启（查表）
if($ret[0]['state']!=1){
    $checkPre=false;
}

// 2.如果通过前面的检测，包含该文件即可（文件不能有输出，否则报错）
if($checkPre){
    // 引入模块
    $plugin_read_path = dirname(__FILE__)."/../plugins/18/cron/cron.php";
    if(file_exists($plugin_read_path)){
        require_once($plugin_read_path);
    }

}