<?php
/**
 * 添加房产相册
 *
 * @version        $Id: housealbumAdd.php 2014-1-14 上午14:11:09 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "housealbumAdd.html";

$tab = "house_album";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
$ptitle = $action == "loupan" ? "楼盘" : "小区&nbsp;";

if($dopost == "edit"){
	$pagetitle = "修改".$ptitle."相册";
	checkPurview("housealbumEdit".$action);
}else{
	$pagetitle = "添加".$ptitle."相册";
	checkPurview("housealbumAdd".$action);
}

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($loupanid)){
		echo '{"state": 200, "info": "".$ptitle."ID传递错误！"}';
		exit();
	}

	if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入相册名称"}';
		exit();
	}

	if(trim($imglist) == ""){
		echo '{"state": 200, "info": "请上传户型图"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`action`, `loupan`, `title`, `weight`, `pubdate`) VALUES ('$action', '$loupanid', '$title', '$weight', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	//保存图集表
	$picList = explode(",",$imglist);
	foreach($picList as $k => $v){
		$picInfo = explode("|", $v);
		$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('album".$action."', '$aid', '$picInfo[0]', '$picInfo[1]')");
		$dsql->dsqlOper($pics, "update");
	}

	if($aid){
		adminLog("添加".$ptitle."相册信息", $title);

		$param = array(
			"service"  => "house",
			"template" => $action."-album",
			"id"       => $loupanid,
			"aid"      => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;

}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `weight` = '$weight' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//先删除文档所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'album".$action."' AND `aid` = ".$id);
		$dsql->dsqlOper($archives, "update");

		//保存图集表
		$picList = explode(",", $imglist);
		foreach($picList as $k => $v){
			$picInfo = explode("|", $v);
			$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('album".$action."', '$id', '$picInfo[0]', '$picInfo[1]')");
			$dsql->dsqlOper($pics, "update");
		}

		if($results == "ok"){
			adminLog("修改".$ptitle."相册信息", $title);

			$param = array(
				"service"  => "house",
				"template" => $action."-album",
				"id"       => $loupanid,
				"aid"      => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
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

			$title     = $results[0]['title'];
			$weight    = $results[0]['weight'];

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'album".$action."' AND `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = $value["picPath"];
					$imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/house/housealbumAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/house.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('action', $action);

	$huoniaoTag->assign('loupanid', $loupanid);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);

	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
