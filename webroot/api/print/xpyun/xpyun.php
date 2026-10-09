<?php
if (!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if (isset($set_modules) && $set_modules == TRUE) {

    $i = isset($printment) ? count($printment) : 0;

    /* 代码 */
    $printment[$i]['print_code'] = "xpyun";

    /* 名称 */
    $printment[$i]['print_name'] = "芯烨云";

    /* 版本号 */
    $printment[$i]['version'] = '1.0.0';

    /* 描述 */
    $printment[$i]['print_desc'] = '设备管理中心：<a href="https://admin.xpyun.net/home/index" target="_blank">https://admin.xpyun.net/home/index</a>';

    /* 作者 */
    $printment[$i]['author'] = '酷曼软件';

    /* 网址 */
    $printment[$i]['website'] = 'http://www.kumanyun.com';

    /* 配置信息 */
    $printment[$i]['config'] = array(
        array('title' => '开发者ID',     'name' => 'user',     'type' => 'text'),
        array('title' => '开发者密钥',     'name' => 'UserKEY',      'type' => 'text'),
        array('title' => '打印份数',     'name' => 'copies',      'type' => 'text'),
        array('title' => '小票样式',     'name' => 'ticket',     'type' => ''),
    );

    return;
}

