<?php
/**
 * 管理自助建站分类
 *
 * @version        $Id: websiteType.php 2014-6-15 上午10:10:11 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteType.html";

$action = "website_type";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;
	
//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(!empty($results)){
		
		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入自助建站分类名').'}');
		if($type == "single"){
			
			if($results[0]['typename'] != $typename){
				
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				
			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
			
		}else{
			//对字符进行处理
			$typename    = cn_substrR($typename,30);
			
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}
		
		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改自助建站分类", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
		
	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}else if($dopost == "del"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(!empty($results)){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `parentid` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if(!empty($results)){
			echo '{"state": 200, "info": '.json_encode('该分类下含有子级分类，请先删除(或转移)子级内容！').'}';
			die;
		}else{
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}
			
			//删除分类下网站
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `typeid` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			
			if(count($results) > 0){
				foreach($results as $key => $val){
					//删除下属信息 start
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_design` WHERE `projectid` = ".$val);
					$dsql->dsqlOper($archives, "update");
					//删除下属信息 end
					
					$archives = $dsql->SetQuery("SELECT * FROM `#@__website` WHERE `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "results");
					
					//删除缩略图
					delPicFile($results[0]['litpic'], "delThumb", "website");
					
					//删除域名配置
					$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'website' AND `part` = '$tab' AND `iid` = ".$val);
					$results = $dsql->dsqlOper($archives, "update");
					
					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website` WHERE `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "update");
				}
			}
			
			adminLog("删除自助建站分类", $id);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;
		}
	}else{
		echo '{"state": 200, "info": '.json_encode('要删除的信息不存在或已删除！').'}';
		die;
	}

//更新
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);
	
	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action);
	echo $json;	
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/website/websiteType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}