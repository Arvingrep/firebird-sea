<?php
/**
 * 添加酒店房间
 *
 * @version        $Id: travelhotelroomAdd.php 2019-5-14 上午08:49:02 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelhotelroomAdd.html";

$tab = "travel_hotelroom";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
$ptitle = $action == "hotelroom" ? "房间" : "";
if($dopost == "edit"){
	$pagetitle = "修改".$ptitle."房间";
	checkPurview("travelhotelEdit");
}else{
	$pagetitle = "添加".$ptitle."房间";
	checkPurview("travelhotelAdd");
}

if(!isset($videoid)) $videoid = 0;
$iswindow = $iswindow ? $iswindow : 0;
$typeid = $typeid ? $typeid : 0;
$breakfast = $breakfast ? $breakfast : 0;
$weight = (int)$weight;
$pubdate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($hotelid)){
		echo '{"state": 200, "info": "".$ptitle."ID传递错误！"}';
		exit();
	}

	if(trim($title) == ""){
		echo '{"state": 200, "info": "请输入标题"}';
		exit();
	}

	if($specialtime){
		$specialtime = stripslashes($specialtime);
		$specialtime = json_decode($specialtime, true);
		$specialtime = serialize($specialtime);
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `hotelid`, `area`, `iswindow`, `typeid`, `breakfast`, `price`, `specialtime`, `pubdate`, `weight`,`pics`) VALUES ('$title', '$hotelid', '$area', '$iswindow', '$typeid', '$breakfast', '$price', '$specialtime', '$pubdate', '$weight','$pics')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		adminLog("添加".$ptitle."房间信息", $title);

		echo '{"state": 100}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `hotelid` = '$hotelid', `area` = '$area', `iswindow` = '$iswindow', `typeid` = '$typeid', `breakfast` = '$breakfast', `price` = '$price', `specialtime` = '$specialtime', `weight` = '$weight',`pics` = '$pics' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改".$ptitle."房间信息", $title);

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
			foreach ($results[0] as $key => $value) {
				${$key} = $value;
			}
			$specialtime = unserialize($specialtime);
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/travel/travelhotelroomAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/travel.inc.php");
	global $customUpload;
    if($customUpload == 1){
        global $custom_thumbSize;
        global $custom_thumbType;
        $huoniaoTag->assign('thumbSize', $custom_thumbSize);
        $huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
    }
    $huoniaoTag->assign('atlasMax', $custom_travelhotel_atlasMax ? $custom_travelhotel_atlasMax : 9);
	$huoniaoTag->assign('action', $action);

	//分类
	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$travelTypeList = $travel->room_type();
	$huoniaoTag->assign('typeidOpt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('typeidNames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('typeid', $typeid? $typeid : 0);

    $huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");

	$travelTypeList = $travel->iswindow_type();
	$huoniaoTag->assign('iswindowOpt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('iswindowNames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('iswindow', $iswindow? $iswindow : 0);

	$travelTypeList = $travel->breakfast_type();
	$huoniaoTag->assign('breakfastOpt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('breakfastNames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('breakfast', $breakfast? $breakfast : 0);

	$huoniaoTag->assign('validOpt', array(0, 1));
	$huoniaoTag->assign('validNames', array("未售出", "已售出"));
	$huoniaoTag->assign('valid', $valid? $valid : 0);

	$huoniaoTag->assign('hotelid', $hotelid);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('area', $area);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('sale', $sale);
	$huoniaoTag->assign('specialtime', $specialtime);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
