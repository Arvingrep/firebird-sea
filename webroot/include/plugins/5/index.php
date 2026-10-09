<?php
/**
 * 一键转载插件
 *
 * @version        2021-02-18 上午10:17:21 $
 * @package        HuoNiao.Plugins
 * @copyright      Copyright (c) 2013 - 2021, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

require_once('../../common.inc.php');

if($userLogin->getUserID()==-1){
  echo '<script>top.location.reload();</script>';
  exit();
}

$tpl                      = dirname(__FILE__) . "/tpl";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "index.html";

$cur = realpath('.');
$par = realpath('..');

//当前文件夹就是当前插件的ID
$folder = str_replace($par, '', $cur);
$folder = str_replace('/', '', $folder);
$folder = str_replace('\\', '', $folder);

$jsFile = '//' . $cfg_basehost . '/include/plugins/' . $folder . '/index.js';

$huoniaoTag->assign('jsFile', $jsFile);
$huoniaoTag->assign('folder', $folder);
$huoniaoTag->display($templates);
