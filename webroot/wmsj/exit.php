<?php
/**
 * 商家退出
 *
 * @version        $Id: exit.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/../include/common.inc.php');
//TG 守卫（business 目前产品裁决放行，此调用为空操作；保留以便将来移出白名单时自动生效）
require_once(dirname(__FILE__).'/../include/tgWhitelist.inc.php');
fbsTgServiceGuard('business');
require_once(HUONIAOINC.'/class/userLogin.class.php');
$userLogin = new userLogin($dbo);
$userLogin->exitMember();
header('location:/wmsj');
//ShowMsg('您已安全退出，正在返回网站首页！',"../");
exit();
