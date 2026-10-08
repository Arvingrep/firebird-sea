<?php
/**
 * 数据库内容替换
 *
 * @version        $Id: dbReplace.php 2013-11-25 下午10:59:36 $
 * @package        HuoNiao.DB
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("dbReplace");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "dbReplace.html";

//获取数据表
if($action == "getTables"){
	echo json_encode($dsql->getTables());die;

//获取表字段
}elseif($action == "getFields"){
	if($table != ""){
		echo json_encode($dsql->getTableFields($table));die;
	}

//提交
}elseif($action == "apply"){
	if($token == "") die('token传递失败！');

	if($table == ""){
		echo '{"state": 200, "info": '.json_encode("请选择要查找的表！").'}';die;
	}
	
	if($field == ""){
		echo '{"state": 200, "info": '.json_encode("请选择要查找的字段！").'}';die;
	}
	
	// if($rpstring == ""){
	// 	echo '{"state": 200, "info": '.json_encode("请输入要查找的内容！").'}';die;
	// }
	
	if(empty($rpstring)){
		$sql = "UPDATE `".$table."` SET `".$field."` = '".$tostring."'";
	}else{
		$sql = "UPDATE `".$table."` SET `".$field."` = REPLACE(`".$field."`,'".$rpstring."','".$tostring."')";
	}
	$results = $dsql->dsqlOper($sql, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("数据库内容替换", "表：".$table."==>字段：".$field."==>查找：".$rpstring."==>替换：".$tostring);
		echo '{"state": 100, "info": '.json_encode("成功完成数据替换！").'}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/dbReplace.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}