<?php
if (!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if (isset($set_modules) && $set_modules == TRUE) {

    $i = isset($printment) ? count($printment) : 0;

    /* 代码 */
    $printment[$i]['print_code'] = "trenditiot";

    /* 名称 */
    $printment[$i]['print_name'] = "大趋智能";

    /* 版本号 */
    $printment[$i]['version'] = '1.0.0';

    /* 描述 */
    $printment[$i]['print_desc'] = '设备管理中心：<a href="https://open.trenditiot.com/dashboard" target="_blank">https://open.trenditiot.com/dashboard</a>';

    /* 作者 */
    $printment[$i]['author'] = '酷曼软件';

    /* 网址 */
    $printment[$i]['website'] = 'http://www.kumanyun.com';

    /* 配置信息 */
    $printment[$i]['config'] = array(
        array('title' => 'appid',     'name' => 'appid',     'type' => 'text'),
        array('title' => 'appsecrect',     'name' => 'appsecrect',      'type' => 'text'),
        array('title' => '打印份数',     'name' => 'copies',      'type' => 'text'),
        array('title' => '小票样式',     'name' => 'ticket',     'type' => ''),
    );

    return;
}

