<?php
/**
 * @Description: AI助手插件接口
 * @Date       : 2024-11-11 13:15:26
 * Copyright (c) 2013 - 2024 火鸟门户系统(苏州酷曼软件技术有限公司) Inc All Rights Reserved.
 * 官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__) . '/../../common.inc.php');
require_once(dirname(__FILE__) . '/api.php');

$userid = $userLogin->getMemberID();
if($userid==-1){
    die("请先登录！");
}

//配置参数
require dirname(__FILE__) . '/config.inc.php';

//判断插件是否开启
$openPlugin = (int)$openPlugin;
if ($openPlugin != 1) {
    die("插件已关闭！");
}

//var_dump($_SESSION['token']);

//保证session中的防跨站标记与提交过来的标记一致
if($_POST['token'] == null || $_POST['token'] != $_SESSION['token']){
	die('Error!<br />Code:Token');
}

$userinfo = $userLogin->getMemberInfo(0, 1);  //获取当前登录用户信息

//判断使用限制
$useLimit = (int)$useLimit;
if ($useLimit == 1 && $userinfo['level'] == false) {
    die("您没有使用此插件的权限！");
}

//判断请求
$action = htmlspecialchars(RemoveXSS($action));

//拼接请求参数,并对参数进行安全过滤
$param = array();
foreach(Array('_GET','_POST') as $_request){
	foreach($$_request as $key => $value){
        if($key != "service" && $key != "action" && $key != "callback" && $key != "_"){
            if($key == 'module'){
                $value = htmlspecialchars(RemoveXSS($value));
                $param[$key] = $value;
            }
            else{
                $param[$key] = (is_string($value) && (strstr($value, '[{') || is_array(json_decode($value, true))) || is_array($value)) ? $value : RemoveXSS(addslashes(stripslashes($value)));
            }
        }
    }
}
$param['userid'] = $userid;
$param['level'] = $userinfo['level'];

$api = new api($param);
if(!method_exists($api, $action)){
    die("请求方法不存在");
}
$api->$action();