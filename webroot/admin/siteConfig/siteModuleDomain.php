<?php
/**
 * 模块域名管理
 *
 * @version        $Id: siteModuleDomain.php 2015-05-23 下午16:49:22 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteModuleDomain");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteModuleDomain.html";

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteModuleDomain.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//获取模块域名配置数据
	$handler = true;
	$moduleArr = array();
	$config_path = HUONIAOINC."/config/";


	//获取会员模块配置参数
	$configHandels = new handlers("member", "config");
	$moduleConfig  = $configHandels->getHandle();
	$moduleConfig  = $moduleConfig['info'];

	$userDomain = str_replace($cfg_basehost, "", str_replace("http://", "", str_replace("https://", "", $moduleConfig['userDomain'])));
	$busiDomain = str_replace($cfg_basehost, "", str_replace("http://", "", str_replace("https://", "", $moduleConfig['busiDomain'])));

	if($cfg_userSubDomain){
		$userDomain = preg_replace("/[\.\/]/", "", $userDomain);
	}
	if($cfg_busiSubDomain){
		$busiDomain = preg_replace("/[\.\/]/", "", $busiDomain);
	}

	//兼容主域名是带www的情况
    $cfg_basehost_ = $cfg_basehost;
    if(substr($cfg_basehost, 0, 4) == 'www.') {
        $cfg_basehost_ = substr($cfg_basehost, 4);
    }
	$cfg_basehost_ = preg_replace("/[\.\/]/", "", $cfg_basehost_);
	$userDomain = str_replace($cfg_basehost_, "", $userDomain);
	$busiDomain = str_replace($cfg_basehost_, "", $busiDomain);


	$moduleArr[] = array(
		"module" => "member",
		"name" => "个人会员",
		"type" => $cfg_userSubDomain,
		"typeName" => getDomainTypeName($cfg_userSubDomain),
		"domain" => $userDomain
	);
	$moduleArr[] = array(
		"module" => "member",
		"name" => "企业会员",
		"type" => $cfg_busiSubDomain,
		"typeName" => getDomainTypeName($cfg_busiSubDomain),
		"domain" => $busiDomain
	);


	//获取商家模块配置参数
	$configHandels = new handlers("business", "config");
	$moduleConfig  = $configHandels->getHandle();
	$moduleConfig  = $moduleConfig['info'];
	$subDomain = $moduleConfig['subDomain'];
	$channelDomain = $moduleConfig['channelDomain'];

	$channelDomainArr = explode('/', $channelDomain);
	$businessDomain = $channelDomainArr[count($channelDomainArr)-1];
	// $businessDomain = str_replace($cfg_basehost, "", str_replace("http://", "", str_replace("https://", "", $channelDomain)));
	//
	// if($subDomain){
	// 	$businessDomain = preg_replace("/[\.\/]/", "", $businessDomain);
	// }
	//
	// //兼容主域名是带www的情况
	// $cfg_basehost_ = str_replace("www.", "", $cfg_basehost);
	// $cfg_basehost_ = preg_replace("/[\.\/]/", "", $cfg_basehost_);
	// $businessDomain = str_replace($cfg_basehost_, "", $businessDomain);


	$moduleArr[] = array(
		"module" => "business",
		"name" => "商家中心",
		"type" => $subDomain,
		"typeName" => getDomainTypeName($subDomain),
		"domain" => $businessDomain
	);



	$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
	$result = $dsql->dsqlOper($sql, "results");
	if($result){
		foreach ($result as $key => $value) {
			if(!empty($value['name'])){
				$sName = $value['name'];

				//引入配置文件
				// $serviceInc = $config_path.$sName.".inc.php";
				// if(file_exists($serviceInc)){
				// 	require($serviceInc);
				// }

				//获取功能模块配置参数
				$configHandels = new handlers($sName, "config");
				$moduleConfig  = $configHandels->getHandle();

				if(is_array($moduleConfig) && $moduleConfig['state'] == 100){
					$moduleConfig  = $moduleConfig['info'];

					//域名
					$domain = '';
					$sql = $dsql->SetQuery("SELECT `domain` FROM `#@__domain` WHERE `module` = '$sName' AND `part` = 'config'");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$domain = $ret[0]['domain'];
					}

					// $channelDomain = $moduleConfig['channelDomain'];
					// $domain = str_replace($cfg_basehost, "", str_replace("http://", "", str_replace("https://", "", $channelDomain)));
					// $channelDomainArr = explode('/', $channelDomain);
					// $domain = $channelDomainArr[count($channelDomainArr)-1];

					//域名类型
					$subDomain = $moduleConfig['subDomain'];
					// if($subDomain){
					// 	$domain = preg_replace("/[\.\/]/", "", $domain);
					//
					// 	//兼容主域名是带www的情况
					// 	$cfg_basehost_ = str_replace("www.", "", $cfg_basehost);
					// 	$cfg_basehost_ = preg_replace("/[\.\/]/", "", $cfg_basehost_);
					// 	$domain = str_replace($cfg_basehost_, "", $domain);
					// }

					$moduleArr[] = array(
						"module" => $sName,
						"name" => $value['subject'] ? $value['subject'] : $value['title'],
						"type" => $subDomain,
						"typeName" => getDomainTypeName($subDomain),
						"domain" => $domain
					);
				}
			}
		}
	}

	$huoniaoTag->assign('moduleArr', json_encode($moduleArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


function getDomainTypeName($type){
	$typeName = "";
	switch ($type) {
		case 0:
			$typeName = "主域名";
			break;
		case 1:
			$typeName = "子域名";
			break;
		case 2:
			$typeName = "子目录";
			break;
	}
	return $typeName;
}
