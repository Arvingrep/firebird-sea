<?php
/**
 * 团购城市管理
 *
 * @version        $Id: tuanCity.php 2015-10-29 下午12:10:11 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanCity");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanCity.html";


//开通城市
if($dopost == "add"){

	if(empty($cid)) die('{"state": 200, "info": "请选择所属城市"}');
	if(empty($type)) die('{"state": 200, "info": "请选择域名类型"}');
	if(empty($domain)) die('{"state": 200, "info": "请输入要绑定的域名"}');

	//查询是否已经开通
	$sql = $dsql->SetQuery("SELECT * FROM `#@__tuan_city` WHERE `cid` = ".$cid);
	$count = $dsql->dsqlOper($sql, "totalCount");
	if($count > 0) die('{"state": 200, "info": "您选择的城市已经开通，无需再次开通"}');

	//验证域名是否被使用
	if(!operaDomain('check', $domain, "tuan", 'city'))
	die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');

	//新增
	$sql = $dsql->SetQuery("INSERT INTO `#@__tuan_city` (`cid`, `type`) VALUE ('$cid', '$type')");
	$lid = $dsql->dsqlOper($sql, "lastid");

	if(is_numeric($lid)){
		//域名操作
		operaDomain('update', $domain, 'tuan', "city", $lid);

		echo '{"state": 100, "info": "开通成功！"}';
	}else{
		die('{"state": 200, "info": "开通失败"}');
	}

	die;


//更新
}elseif($dopost == "update"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');
	if($type === "") die('{"state": 200, "info": "请选择域名类型"}');
	if(empty($domain)) die('{"state": 200, "info": "请输入要绑定的域名"}');

	//验证域名是否被使用
	if(!operaDomain('check', $domain, "tuan", 'city', $id))
	die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');

	//域名操作
	operaDomain('update', $domain, 'tuan', "city", $id);

	$sql = $dsql->SetQuery("UPDATE `#@__tuan_city` SET `type` = '$type' WHERE `id` = ".$id);
	$dsql->dsqlOper($sql, "update");
	echo '{"state": 100, "info": "修改成功！"}';
	die;


//删除
}elseif($dopost == "del"){

	if(empty($id)) die('{"state": 200, "info": "Error"}');

	$archives = $dsql->SetQuery("DELETE FROM `#@__tuan_city` WHERE `id` = ".$id);
	$dsql->dsqlOper($archives, "update");

	//删除商圈
	$archives = $dsql->SetQuery("DELETE FROM `#@__tuan_circle` WHERE `cid` = ".$id);
	$dsql->dsqlOper($archives, "update");

	//删除域名配置
	$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'tuan' AND `part` = 'city' AND `iid` = ".$id);
	$dsql->dsqlOper($archives, "update");

	echo '{"state": 100, "info": "删除成功！"}';
	die;

}



//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/tuan/tuanCity.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//获取模块域名配置数据
	$domainArr = array();

	$sql = $dsql->SetQuery("SELECT c.*, a.`typename` FROM `#@__tuan_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` ORDER BY c.`id`");
	$result = $dsql->dsqlOper($sql, "results");
	if($result){
		foreach ($result as $key => $value) {

			$domainInfo = getDomain('tuan', 'city', $value['id']);
			$domainArr[] = array(
				"id" => $value['id'],
				"name" => $value['typename'],
				"type" => $value['type'],
				"typeName" => getDomainTypeName($value['type']),
				"domain" => $domainInfo['domain']
			);

		}
	}

	$huoniaoTag->assign('domainArr', json_encode($domainArr));

	//省
	$province = $dsql->getTypeList(0, "site_area", false);
	$huoniaoTag->assign('province', $province);

	require_once(HUONIAOINC."/config/tuan.inc.php");
	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);

	if($customSubDomain == 2){
		$huoniaoTag->assign('domaintype', array('2'));
		$huoniaoTag->assign('domaintypeNames',array('子目录'));
		$huoniaoTag->assign('domaintypeChecked', 2);
	}else{
		$huoniaoTag->assign('domaintype', array('1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('子域名','子目录'));
		$huoniaoTag->assign('domaintypeChecked', 2);
	}

	//获取域名信息
	global $cfg_basehost;
	$domainInfo = getDomain('tuan', 'config');

	if($customSubDomain == 0){
		$huoniaoTag->assign('subdomain', $domainInfo['domain']);
	}elseif($customSubDomain == 1){
		$huoniaoTag->assign('subdomain', $domainInfo['domain'].".".$cfg_basehost);
	}elseif($customSubDomain == 2){
		$huoniaoTag->assign('subdomain', $cfg_basehost."/".$domainInfo['domain']);
	}

	$huoniaoTag->assign('basehost', $cfg_basehost);
	$huoniaoTag->assign('defaultCity', (int)$tuanDefaultCity);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
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
