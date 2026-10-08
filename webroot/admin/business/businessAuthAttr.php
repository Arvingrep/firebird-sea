<?php
/**
 * 商家自定义认证属性
 *
 * @version        $Id: businessAuthAttr.php 2017-03-29 上午11:57:36 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessAuthAttr");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessAuthAttr.html";

$db = "business_authattr";

//修改
if($dopost == "updateType"){

	$value = $_REQUEST['value'];

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__$db` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($action == "single"){

				//简称
				if($type == "jc"){
					if($results[0]['jc'] != $value){
						$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `jc` = '$value' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}else{
						die('{"state": 101, "info": '.json_encode('无变化！').'}');
					}

				//名称
				}else{
					if($value == "") die('{"state": 101, "info": '.json_encode('请输入内容').'}');
					if($results[0]['typename'] != $value){
						$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `typename` = '$value' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}else{
						die('{"state": 101, "info": '.json_encode('无变化！').'}');
					}
				}


			}else{
				//简称
				if($type == "jc"){
					$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `jc` = '$value' WHERE `id` = ".$id);

				//名称
				}else{
					if($value == "") die('{"state": 101, "info": '.json_encode('请输入内容').'}');
					$value  = cn_substrR($value,30);
					$archives = $dsql->SetQuery("UPDATE `#@__$db` SET `typename` = '$value' WHERE `id` = ".$id);
				}
				$results  = $dsql->dsqlOper($archives, "update");
			}

			if($results != "ok"){
				die('{"state": 101, "info": '.json_encode('修改失败，请重试！').'}');
			}else{
				$title = $type == "jc" ? "简称" : "";
				adminLog("修改商家自定义认证属性".$title, $value);
				die('{"state": 100, "info": '.json_encode('修改成功！').'}');
			}

		}else{
			die('{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}');
		}
	}
	die;

//删除
}else if($dopost == "del"){
	if($id != ""){

		$idsArr = array();
		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $db, 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__$db` WHERE `id` in (".join(",", $idsArr).")");
		$dsql->dsqlOper($archives, "update");

		adminLog("删除商家自定义认证属性", join(",", $idsArr));
		die('{"state": 100, "info": '.json_encode('删除成功！').'}');

	}
	die;

//更新
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);
		$json = typeOpera($json, $db);
		echo $json;
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/business/businessAuthAttr.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);

	//查询已有信息
	$list = array();
	$sql = $dsql->SetQuery("SELECT `id`, `jc`, `typename`, `weight` FROM `#@__".$db."` ORDER BY `weight`");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $key => $value) {
			array_push($list, array(
				"id" => $value['id'],
				"jc" => $value['jc'],
				"typename" => $value['typename'],
				"weight" => $value['weight']
			));
		}
	}

	$huoniaoTag->assign('typeListArr', json_encode($list));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



function typeOpera($arr, $db){
	$dsql = new dsql($dbo);

	if (!is_array($arr) && $arr != NULL) {
		return '{"state": 200, "info": "保存失败！"}';
	}
	for($i = 0; $i < count($arr); $i++){
		$id = $arr[$i]["id"];
		$name = $arr[$i]["name"];
		$jc = $arr[$i]["jc"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`jc`, `typename`, `weight`) VALUES ('$jc', '$name', '$i')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加商家自定义认证属性", $name);
		}
		//其它为数据库已存在
		else{
			$archives = $dsql->SetQuery("SELECT `jc`, `typename`, `weight` FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证名称
				if($results[0]["typename"] != $name){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$name' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改商家自定义认证属性", $name);
				}
				//验证简称
				if($results[0]["jc"] != $jc){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `jc` = '$jc' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改商家自定义认证属性简称", $name."=>".$jc);
				}

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改商家自定义认证属性排序", $name."=>".$i);
				}


			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}
