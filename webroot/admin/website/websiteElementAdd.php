<?php
/**
 * 添加功能组件
 *
 * @version        $Id: websiteElementAdd.php 2014-6-12 下午16:20:18 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteElementAdd.html";

$tab = "websiteelement";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改功能组件";
	checkPurview("websiteElementEdit");
}else{
	$pagetitle = "添加功能组件";
	checkPurview("websiteElementAdd");
}

if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

if($_POST['submit'] == "提交"){

	$title = cn_substrR($title,20);
	$type  = cn_substrR($type,20);

	if($token == "") die('token传递失败！');

	//二次验证
	if(empty($sort)){
		echo '{"state": 200, "info": "请选择功能组件分类！"}';
		exit();
	}

	if(empty($title)){
		echo '{"state": 200, "info": "请输入功能组件名称！"}';
		exit();
	}

	if($sort == "apps"){
		if(empty($appstype)){
			echo '{"state": 200, "info": "请选择应用所属分类！"}';
			exit();
		}
	}else{
		if(empty($type)){
			echo '{"state": 200, "info": "请输入功能组件英文名称！"}';
			exit();
		}
	}


}

if($dopost == "save" && $submit == "提交"){
	if($theme != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `theme` = '".$theme."'");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			echo '{"state": 200, "info": '.json_encode("风格目录已存在，不得重复使用！").'}';
			die;
		}
	}

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`sort`, `title`, `type`, `appstype`, `weight`, `config`, `theme`, `state`, `pubdate`) VALUES ('$sort', '$title', '$type', '$appstype', '$weight', '$config', '$theme', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		if(count($ids) > 0){
			foreach($ids as $key => $val){
				if(!empty($val)){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_theme` WHERE `id` = ".$val);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						$where = array();
						if($results[0]['weight'] != $key){
							$where[] = '`weight` = '.$key;
						}
						if($results[0]['name'] != $name[$key]){
							$where[] = '`name` = "'.$name[$key].'"';
						}
						if(!empty($where)){
							$archives = $dsql->SetQuery("UPDATE `#@__".$tab."_theme` SET ".join(",", $where)." WHERE `id` = ".$val);
							$dsql->dsqlOper($archives, "update");
						}
					}
				}else{
					if(!empty($name[$key])){
						$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_theme` (`pid`, `name`, `color`, `weight`) VALUES ('".$aid."', '".$name[$key]."', '".$color[$key]."', ".$key.")");
						$dsql->dsqlOper($archives, "update");
					}
				}
			}
		}

		adminLog("添加功能组件", $title);
		echo '{"state": 100, "id": "'.$aid.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

		if($theme != ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `theme` = '".$theme."' AND `id` != ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				echo '{"state": 200, "info": '.json_encode("风格目录已存在，不得重复使用！").'}';
				die;
			}
		}

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `sort` = '$sort', `title` = '$title', `type` = '$type', `appstype` = '$appstype', `weight` = '$weight', `config` = '$config', `theme` = '$theme', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			if(count($ids) > 0){
				foreach($ids as $key => $val){
					if(!empty($val)){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_theme` WHERE `id` = ".$val);
						$results = $dsql->dsqlOper($archives, "results");
						if($results){
							$where = array();
							if($results[0]['weight'] != $key){
								$where[] = '`weight` = '.$key;
							}
							if($results[0]['name'] != $name[$key]){
								$where[] = '`name` = "'.$name[$key].'"';
							}
							if(!empty($where)){
								$archives = $dsql->SetQuery("UPDATE `#@__".$tab."_theme` SET ".join(",", $where)." WHERE `id` = ".$val);
								$dsql->dsqlOper($archives, "update");
							}
						}
					}else{
						if(!empty($name[$key])){
							$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_theme` (`pid`, `name`, `color`, `weight`) VALUES ('".$id."', '".$name[$key]."', '".$color[$key]."', ".$key.")");
							$dsql->dsqlOper($archives, "update");
						}
					}
				}
			}

			adminLog("修改功能组件", $title);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$sort   = $results[0]['sort'];
			$title  = $results[0]['title'];
			$type   = $results[0]['type'];
			$appstype   = $results[0]['appstype'];
			$weight = $results[0]['weight'];
			$config = $results[0]['config'];
			$theme  = $results[0]['theme'];
			$state  = $results[0]['state'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

//管理应用分类
}elseif($dopost == "manageType"){
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_type` ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$types = array();
	if($results){
		foreach($results as $key => $val){
			$types[$key]['id'] = $val['id'];
			$types[$key]['val'] = $val['name'];
		}
	}
	echo json_encode($types);
	die;

//修改应用分类
}elseif($dopost == "saveManageType"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	foreach($json as $key => $val){
		if($val['id'] != ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_type` WHERE `id` = ".$val['id']);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$where = array();
				if($results[0]['weight'] != $val['weight']){
					$where[] = '`weight` = '.$val['weight'];
				}
				if($results[0]['name'] != $val['val']){
					$where[] = '`name` = "'.$val['val'].'"';
				}
				if(!empty($where)){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."_type` SET ".join(",", $where)." WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}
		}else{
			if(!empty($val['val'])){
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_type` (`name`, `weight`) VALUES ('".$val['val']."', ".$val['weight'].")");
				$dsql->dsqlOper($archives, "update");
			}
		}
	}
	$appstypeList = array();
	array_push($appstypeList, array("id" => 0, "name" => "请选择"));
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_type` ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			array_push($appstypeList, $val);
		}
	}
	echo json_encode($appstypeList);
	die;

//删除应用分类
}elseif($dopost == "delManageType"){
	if(!empty($id)){
		//删除风格
		$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `sort` = 'apps' AND `appstype` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_theme` WHERE `pid` = ".$results[0]['id']);
			$dsql->dsqlOper($archives, "update");
		}

		//删除应用
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `sort` = 'apps' AND `appstype` = ".$id);
		$dsql->dsqlOper($archives, "update");

		//删除分类
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_type` WHERE `id` = ".$id);
		$dsql->dsqlOper($archives, "update");
	}
	die;

//删除风格
}elseif($dopost == "delTheme"){
	if(!empty($id)){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_theme` WHERE `id` = ".$id);
		$dsql->dsqlOper($archives, "update");
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap.min.js',
		'admin/website/websiteElementAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);

	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('sortopt', array('widgets', 'apps'));
	$huoniaoTag->assign('sortnames',array('组件','应用'));
	$huoniaoTag->assign('sort', $sort == "" ? 'widgets' : $sort);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('type', $type);

	//应用分类
	$appstypeList = array(0 => "请选择");
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_type` ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$appstypeList[$val['id']] = $val['name'];
		}
	}

	$huoniaoTag->assign('appstypeList', $appstypeList);
	$huoniaoTag->assign('appstype', $appstype);

	$huoniaoTag->assign('weight', $weight);
	$huoniaoTag->assign('config', $config);

	$huoniaoTag->assign('theme', $theme);

	//风格
	$themeList = "";
	if($dopost == "edit"){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_theme` WHERE `pid` = $id ORDER BY `weight` ASC, `id` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key => $val){
				$themeList .= '<li><i data-toggle="tooltip" data-placement="right" data-original-title="拖动以排序" class="icon-move"></i><input class="ids" type="hidden" name="ids[]" value="'.$val['id'].'"><input type="text" name="name[]" value="'.$val['name'].'" placeholder="风格名"><input class="color" type="hidden" name="color[]" value="'.$val['color'].'"><div class="color_pick"><em style="background:'.$val['color'].'"></em></div><a data-toggle="tooltip" data-placement="right" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>';
			}
		}
	}
	$huoniaoTag->assign('themeList', $themeList);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
