<?php
/**
 * 经纪人等级
 *
 * @version        $Id: zjUserGroup.php 2014-1-11 下午16:25:12 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "zjUserGroup.html";

$tab = "house_zjusergroup";

checkPurview("zjUserGroup");

//删除
if($dopost == "del"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		
		if(!empty($results)){
			$title = $results[0]['typename'];
			
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}
			
			adminLog("删除经纪人等级", $title);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;

		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		
		$json = objtoarr($json);
		$json = zjUserGroupAjax($json, $tab);
		echo $json;	
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/house/zjUserGroup.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('action', $action);
	
	$zjUserGroupArr = "";
	$sql = $dsql->SetQuery("SELECT `id`, `typename`, `num`, `icon` FROM `#@__".$tab."` ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){//如果有子类 
		$zjUserGroupArr = $results; 
	}
	$huoniaoTag->assign('zjUserGroupArr', json_encode($zjUserGroupArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//更新分类
function zjUserGroupAjax($json, $tab){
	global $dsql;
	for($i = 0; $i < count($json); $i++){
		$id = $json[$i]["id"];
		$name = $json[$i]["name"];
		$num  = $json[$i]["num"];
		$icon = $json[$i]["icon"];
		
		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`typename`, `weight`, `num`, `icon`, `pubdate`) VALUES ('$name', '$i', '$num', '$icon', '".GetMkTime(time())."')");
			$id = $dsql->dsqlOper($archives, "lastid");
			adminLog("添加经纪人等级", $name);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weight` FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$name', `weight` = '$i', `num` = '$num', `icon` = '$icon' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				
				adminLog("修改经纪人等级", $name);
			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}