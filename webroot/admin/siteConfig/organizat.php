<?php
/**
 * 管理组织架构
 *
 * @version        $Id: articleOrganizat.php 2018-5-14 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "organizat.html";

$tab = "site_organizat";
$title = "组织架构";

checkPurview("organizat");

$dopost = $dopost ? $dopost : "";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__site_organizat` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		// 列出可选择的管理员
		$archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `mtype` FROM `#@__member` WHERE (`mtype` = 0 || `mtype` = 3) AND `state` = 0");
		$adminList = $dsql->dsqlOper($archives, "results");
		$archives = $dsql->SetQuery("SELECT `admin` FROM `#@__site_organizat` WHERE `id` != ".$id);
		$hasUsed  = $dsql->dsqlOper($archives, "results");
		if($hasUsed){
			global $data;
            $data = array();
            $hasUsed = parent_foreach($hasUsed, "admin");
            $hasUsed = join(",", $hasUsed);
            $hasUsed = explode(",", $hasUsed);
			foreach ($adminList as $key => $value) {
				if(in_array($value['id'], $hasUsed)){
					unset($adminList[$key]);
				}
			}
		}
		$results[1] = $adminList;

		echo json_encode($results);
	}
	die;

//修改分类
}else if($dopost == "updateType"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__site_organizat` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');

			if($type == "single"){
				if($results[0]['typename'] != $typename){
					//保存到主表
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$typename' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");

				}else{
					//分类没有变化
					echo '{"state": 101, "info": '.json_encode('无变化！').'}';
					die;
				}
			}else{

				if($admin){
					$admin = join(",", $admin);
				}else{
					$admin = "";
				}

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__site_organizat` SET `typename` = '$typename', `admin` = '$admin' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改组织架构", $typename);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}
		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
			die;
		}
	}
	die;

//删除分类
}else if($dopost == "del"){
	if($id != ""){

		$idsArr = array();

		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $tab, 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` IN (".join(",", $idsArr).")");
			$dsql->dsqlOper($archives, "update");
		}

		adminLog("删除".$title."分类", join(",", $idsArr));
		echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
		die;


	}
	die;

//更新组织架构
}else if($dopost == "organizatAjax") {
    if (!testPurview("orgainzat")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $data = str_replace("\\", '', $_POST['data']);
    if ($data != "") {
        $json = json_decode($data);

        $json = objtoarr($json);
        $json = typeAjax($json, 0, "site_organizat");
        echo $json;
    }
    exit();
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
        'ui/chosen.jquery.min.js',
		'admin/siteConfig/organizat.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "site_organizat", true, 1, 1000, "", "admin")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！11";
}
