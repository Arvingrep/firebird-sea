<?php
if (!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if (isset($set_modules) && $set_modules == TRUE) {

    $i = isset($printment) ? count($printment) : 0;

    /* 代码 */
    $printment[$i]['print_code'] = "yilianyun";

    /* 名称 */
    $printment[$i]['print_name'] = "易联云";

    /* 版本号 */
    $printment[$i]['version'] = '1.0.0';

    /* 描述 */
    $printment[$i]['print_desc'] = '普通文本打印推荐K4/k7/X1，维语必须使用图片打印，推荐k6型号<br />易联云产品中心：<a href="https://www.yilianyun.net/productCenter" target="_blank">https://www.yilianyun.net/productCenter</a><br />终端管理：<a href="https://yilianyun.10ss.net/home/index" target="_blank">https://yilianyun.10ss.net/home/index</a><br />开放平台：<a href="https://dev.10ss.net/admin" target="_blank">https://dev.10ss.net/admin</a>';

    /* 作者 */
    $printment[$i]['author'] = '酷曼软件';

    /* 网址 */
    $printment[$i]['website'] = 'http://www.kumanyun.com';

    /* 配置信息 */
    $printment[$i]['config'] = array(
        array('title' => '用户id',     'name' => 'MembrID',     'type' => 'text'),
        array('title' => 'API秘钥',     'name' => 'signkey',     'type' => 'text'),
        array('title' => '应用ID',     'name' => 'clientId',     'type' => 'text'),
        array('title' => '应用秘钥',     'name' => 'client_secret',     'type' => 'text'),
        array('title' => '小票样式',     'name' => 'ticket',     'type' => ''),
    );

    return;
}