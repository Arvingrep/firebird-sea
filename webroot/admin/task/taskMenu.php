<?php
/**
 * 管理自定义菜单
 *
 * @version        $Id: taskMenu.php 2022-08-21 上午10:40:18 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskMenu");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskMenu.html";

$action = "task";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_menu` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_menu` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入菜单名称').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_menu` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}else{

			//对字符进行处理
			$typename = cn_substrR($typename,30);
			$url = cn_substrR($url,250);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_menu` SET `typename` = '$typename', `url` = '$url' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('自定义菜单修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改任务悬赏自定义菜单", $typename);
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
		$childArr = $dsql->getTypeList($id, $action."_menu", 1);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."_menu` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delLogo", "task");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_menu` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除任务悬赏自定义菜单", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action."_menu");
	echo $json;
	die;
}
//默认数据
else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "任务悬赏自定义菜单");
    echo json_encode($importRes);
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
		'admin/task/taskMenu.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_menu"), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__task_menu`;
ALTER TABLE `#@__task_menu` AUTO_INCREMENT = 1;
INSERT INTO `#@__task_menu` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('1', '0', '极速审核', '1', '', '', '', '1651139756', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667688368349.png', '/pages/packages/task/audit/audit');
INSERT INTO `#@__task_menu` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('5', '0', '首发新单', '0', '', '', '', '1655792899', 'https://upload.ihuoniao.cn//task/logo/large/2022/12/09/16705748176421.png', '/pages/packages/task/newlist/newlist');
INSERT INTO `#@__task_menu` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('6', '0', '商家入驻', '2', '', '', '', '1655792936', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689133585.png', '/pages/packages/task/merjoin/merjoin');
INSERT INTO `#@__task_menu` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('7', '0', '会员中心', '3', '', '', '', '1655792976', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689199741.png', '/pages/packages/task/vip/vip?index=0');
DEFAULTSQL;
}
