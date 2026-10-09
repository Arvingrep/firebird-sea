<?php
/**
 * 管理会员权益
 *
 * @version        $Id: taskMemberLevelEquity.php 2022-08-26 上午9:28:11 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskMemberLevelEquity");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskMemberLevelEquity.html";

$action = "task_member_level_equity";

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

        $value = $_REQUEST['value'];
        $_action = $_REQUEST['action'];

        if($_action == "single"){
            
            if($type == 'typename'){
                if($value == "") die('{"state": 101, "info": '.json_encode('请输入权益名称').'}');
                if($results[0]['typename'] != $value){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$value' WHERE `id` = ".$id);
                    $results = $dsql->dsqlOper($archives, "update");
                }else{
                    die('{"state": 101, "info": '.json_encode('无变化！').'}');
                }
            }elseif($type == 'note'){
                if($value == "") die('{"state": 101, "info": '.json_encode('请输入权益说明').'}');
                if($results[0]['note'] != $value){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `note` = '$value' WHERE `id` = ".$id);
                    $results = $dsql->dsqlOper($archives, "update");
                }else{
                    die('{"state": 101, "info": '.json_encode('无变化！').'}');
                }
            }

		}else{

			// //对字符进行处理
			// $typename    = cn_substrR($typename,30);
			// $price = (float)$price;
			// $count = (int)$count;

			// //保存到主表
			// $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename', `price` = '$price', `count` = '$count' WHERE `id` = ".$id);
			// $results = $dsql->dsqlOper($archives, "update");

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('任务会员权益修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改任务悬赏会员权益", $id . '=>' . $type . '=>' . $value);
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
		$childArr = $dsql->getTypeList($id, $action."", 1);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delLogo", "task");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除任务悬赏会员权益", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeOpera($json, $id, $action);
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
		'admin/task/taskMemberLevelEquity.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList($id, $action), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


function typeOpera($arr, $pid = 0, $db){
	global $dsql;

	if (!is_array($arr) && $arr != NULL) {
		return '{"state": 200, "info": "保存失败！"}';
	}
	for($i = 0; $i < count($arr); $i++){
		$id = $arr[$i]["id"];
		$typename = $arr[$i]["typename"];
		$note = $arr[$i]["note"];
		$icon = $arr[$i]["icon"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`parentid`, `typename`, `weight`, `note`, `icon`) VALUES ('$pid', '$typename', '$i', '$note', '$icon')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加任务悬赏等级权益", $typename);
		}
		//其它为数据库已存在的分类需要验证名称或天气ID是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `note`, `weight`, `icon` FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证名称
				if($results[0]["typename"] != $typename){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `typename` = '$typename' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏等级权益名称", $typename);
				}

				//验证图标
				if($results[0]["icon"] != $icon){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `icon` = '$icon' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏等级权益图标", $typename."=>".$i);
				}

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改任务悬赏等级权益排序", $typename."=>".$i);
				}

			}
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}