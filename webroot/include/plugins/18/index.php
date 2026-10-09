<?php
require_once('../../common.inc.php');

// 插件通用配置
require_once("./inc.php");

// 注销session缓存
putSession($plugin_18_data);

$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "index.html";

$huoniaoTag->display($templates);

