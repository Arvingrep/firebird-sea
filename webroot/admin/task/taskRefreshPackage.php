<?php
/**
 * 刷新道具管理
 *
 * @version        $Id: taskRefreshPackage.php 2022-11-29 下午16:34:26 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskRefreshPackage");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskRefreshPackage.html";

$action = "task";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_refresh_package` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_refresh_package` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

        if($type == "typename"){
            $typename = (int)$_POST['value'];
            if($typename == "") die('{"state": 101, "info": '.json_encode('请输入道具次数').'}');

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_refresh_package` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}

        if($type == "price"){
            $price = (float)$_POST['value'];
            if($price == "") die('{"state": 101, "info": '.json_encode('请输入道具价格').'}');

			if($results[0]['price'] != $price){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_refresh_package` SET `price` = '$price' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('刷新道具修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改任务悬赏刷新道具", $type . '=>' . $typename . '=>' . $price);
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

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {
		$childArr = $dsql->getTypeList($id, $action."_refresh_package", 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$idsArr[] = $id;
	}

	// 删除分类图片
	foreach ($idsArr as $kk => $id) {
		//删除分类图标
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."_refresh_package` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delLogo", "task");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_refresh_package` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除任务悬赏刷新道具", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeOpera($json, $action."_refresh_package");
	echo $json;
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/task/taskRefreshPackage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_refresh_package"), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
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
		$price = $arr[$i]["price"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`price`, `typename`, `weight`) VALUES ('$price', '$name', '$i')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加任务悬赏刷新道具", $name);
		}
		//其它为数据库已存在
		else{
			$archives = $dsql->SetQuery("SELECT `price`, `typename`, `weight` FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证名称
				if($results[0]["typename"] != $name){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$name' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏刷新道具次数", $name);
				}
				//验证简称
				if($results[0]["price"] != $price){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `price` = '$price' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏刷新道具价格", $name."=>".$price);
				}

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏刷新道具排序", $name."=>".$i);
				}


			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}
