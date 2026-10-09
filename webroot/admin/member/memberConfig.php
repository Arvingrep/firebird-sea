<?php
/**
 * 会员频道配置
 *
 * @version        $Id: memberConfig.php 2015-6-21 下午13:57:10 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//频道配置参数
require_once(HUONIAOINC."/config/member.inc.php");

//异步提交
$name = $_REQUEST['name'];
if($name != ""){
	if($token == "") die('token传递失败！');

	if($name == "user"){

		$cfg_userSubDomain     = $subdomain;
		$customChannelDomain   = $channeldomain;

	}elseif($name == "busi"){

		$cfg_busiSubDomain     = $subdomain;
		$customChannelDomain   = $channeldomain;

	}

	//域名操作
	operaDomain('update', $customChannelDomain, "member", $name);

	//基本设置文件内容
	$customInc = "<"."?php\r\n";
	$customInc .= "\$cfg_userSubDomain = ".$cfg_userSubDomain.";\r\n";
	$customInc .= "\$cfg_busiSubDomain = ".$cfg_busiSubDomain.";\r\n";
	$customInc .= "?".">";

	$customIncFile = HUONIAOINC."/config/member.inc.php";
	$fp = fopen($customIncFile, "w") or die('{"state": 200, "info": '.json_encode("写入文件 $customIncFile 失败，请检查权限！").'}');
	fwrite($fp, $customInc);
	fclose($fp);

	die('{"state": 100, "info": '.json_encode("配置成功！").'}');
	exit;
}
