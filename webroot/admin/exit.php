<?php
/**
 * 后台退出
 *
 * @version        $Id: exit.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/../include/common.inc.php');
require_once(HUONIAOINC.'/class/userLogin.class.php');
$userLogin = new userLogin($dbo);
$userLogin->exitUser();
header('location:login.php');
//ShowMsg('您已安全退出，正在返回网站首页！',"../");
exit();
