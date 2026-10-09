<?php
if (!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if (isset($set_modules) && $set_modules == TRUE) {

    $i = isset($printment) ? count($printment) : 0;

    /* 代码 */
    $printment[$i]['print_code'] = "feie";

    /* 名称 */
    $printment[$i]['print_name'] = "飞鹅";

    /* 版本号 */
    $printment[$i]['version'] = '1.0.0';

    /* 描述 */
    $printment[$i]['print_desc'] = '只支持普通文本打印，如果需要打印图片，请使用易联云K6打印机；<br />如果要打印维文，请先采购飞鹅云定制打印机，详情请联系火鸟门户售后；<br />飞鹅云产品中心：<a href="http://www.feieyun.com/product_class.html" target="_blank">http://www.feieyun.com/product_class.html</a><br />打印机管理中心：<a href="https://admin.feieyun.com/" target="_blank">https://admin.feieyun.com/</a>';

    /* 作者 */
    $printment[$i]['author'] = '酷曼软件';

    /* 网址 */
    $printment[$i]['website'] = 'http://www.kumanyun.com';

    /* 配置信息 */
    $printment[$i]['config'] = array(
        array('title' => 'USER',     'name' => 'user',     'type' => 'text'),
        array('title' => 'UKEY',     'name' => 'ukey',      'type' => 'text'),
        array('title' => '打印份数',     'name' => 'number',      'type' => 'text'),
        array('title' => '小票样式',     'name' => 'ticket',     'type' => ''),
    );

    return;
}

