<?php
/**
 * 会员等级列表
 *
 * @version        $Id: memberLevelList.php 2017-07-21 下午19:28:16 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberLevelList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//表名
$tab = "member_level";

//模板名
$templates = "memberLevelList.html";

//js
$jsFile = array(
	'ui/jquery.ajaxFileUpload.js',
	'admin/member/memberLevelList.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


//删除等级
if($dopost == "del"){
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$name = $results[0]['name'];
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

			//将删除的等级下的会员等级归0
			$sql = $dsql->SetQuery("UPDATE `#@__member` SET `level` = 0, `expired` = 0 WHERE `level` = $id");
			$dsql->dsqlOper($sql, "update");

			adminLog("删除会员等级", $name);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;
		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的会员等级不存在或已删除！').'}';
			die;
		}
	}
	die;

//修改名称
}else if($dopost == "updateName"){
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($name == "") die('{"state": 101, "info": '.json_encode('请输入等级名称').'}');
			if($results[0]['name'] != $name){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `name` = '$name' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改会员等级名称", $name);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//新增管理组
}else if($dopost == "update"){
	if($token == "") die('token传递失败！');
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);

		for($i = 0; $i < count($json); $i++){
			$id = $json[$i]["id"];
			$name = $json[$i]["name"];
			$icon = $json[$i]["icon"];

			//如果ID为空则向数据库插入下级分类
			if($id == "" || $id == 0){
				$arr = serialize(array());
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`name`, `privilege`, `icon`) VALUES ('$name', '$arr', '$icon')");
				$dsql->dsqlOper($archives, "update");
				adminLog("添加会员等级", $name);
			}
			//其它为数据库已存在的需要验证名称是否有改动，如果有改动则UPDATE
			else{
				$archives = $dsql->SetQuery("SELECT `name`, `icon` FROM `#@__".$tab."` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");
				if(!empty($results)){
					//验证分类名
					if($results[0]["name"] != $name || $results[0]["icon"] != $icon){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `name` = '$name', `icon` = '$icon' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					adminLog("修改会员等级", $name);
				}
			}
		}
		echo '{"state": 100, "info": "保存成功！"}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$sql = $dsql->SetQuery("SELECT `id`, `name`, `icon` FROM `#@__".$tab."` ORDER BY `id` ASC");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		foreach ($results as $key => $value) {
			if($value['icon'] != ''){
				$value['iconturl'] = getFilePath($value['icon']);
			}else{
				$value['iconturl'] = '';
			}
			$levelList[$key] = $value;
		}

	}
	$huoniaoTag->assign('levelList', $levelList);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
