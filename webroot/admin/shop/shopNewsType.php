<?php
/**
 * 商城资讯分类
 *
 * @version        $Id: shopNewsType.php 2016-6-19 下午19:04:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopNewsType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopNewsType.html";

$action = "shop_news";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_type` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if(!testPurview("editShopNews")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_type` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_type` SET `typename` = '$typename' WHERE `id` = ".$id);
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
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_type` SET `typename` = '$typename' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改团购常见问题分类", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}else if($dopost == "del"){
	if(!testPurview("delShopNews")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {
		$childArr = $dsql->getTypeList($id, $action."_type", 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$idsArr[] = $id;
	}

	//删除分类下的信息
	foreach ($idsArr as $kk => $id) {

		//查询此分类下所有信息ID
		$archives = $dsql->SetQuery("SELECT `id`, `body` FROM `#@__".$action."` WHERE `typeid` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(count($results) > 0){
			$idList = array();
			foreach($results as $key => $val){

				$body = $val['body'];
				if(!empty($body)){
					delEditorPic($body, "shop");
				}

			}
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `typeid` = ".$id);
		$dsql->dsqlOper($archives, "update");

	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_type` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除团购常见问题分类", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	if(!testPurview("addShopNews")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action."_type");
	echo $json;
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/shop/shopNewsType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
