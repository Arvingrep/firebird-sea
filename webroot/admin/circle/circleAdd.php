<?php
/**
 * 添加圈子话题
 *
 * @version        $Id: circleAdd.php 2019-03-15 下午16:34:13 $
 * @package        HuoNiao.circle
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/circle";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "circleAdd.html";

$tab = "circle_topic";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改话题";
	checkPurview("circleTopic");
}else{
	$pagetitle = "添加话题";
	checkPurview("circleTopic");
}

if(empty($addrid)) $addrid = 0;
if(empty($cityid)) $cityid = 0;
if(empty($price)) $price = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($userid)) $userid = 0;
// if(empty($click)) $click = mt_rand(50, 200);
if(!empty($flag)) $flag = join(",", $flag);
$carsystem = $carsystem ? $carsystem : 0;
$model = $model ? $model : 0;
$mileage = $mileage ? $mileage : 0;
$model = $model ? $model : 0;
$model = $model ? $model : 0;
$model = $model ? $model : 0;
$tax = $tax ? $tax : 0;
$location = $location ? $location : 0;
$price = $price ? $price : 0;
$totalprice = $totalprice ? $totalprice : 0;
$ckprice = $ckprice ? $ckprice : '';
$transfertimes = $transfertimes ? $transfertimes : 0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入话题名称！"}';
		exit();
	}



	if($staging==0){
		$downpayment = '';
	}

	$pubdate = GetMkTime(time());
	$cardtime= $cardtime ? GetMkTime($cardtime) : 0;
	$njendtime= $njendtime ? GetMkTime($njendtime) :0;
	$jqxendtime= $jqxendtime ? GetMkTime($jqxendtime) : 0;
	$businessendtime= $businessendtime ? GetMkTime($businessendtime) : 0;

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	if($uid==""||$browse==""){
		$uid = "0";
		$browse = '0';
	}
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`uid`, `title`, `litpic`, `banner`, `state`, `browse`, `rec`, `pubdate`,`note`)
		VALUES
		('$uid', '$title', '$litpic', '$banner', '$state', '$browse', '$rec', '$pubdate','$note')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		if($state == 1){
			updateCache("circle_list", 300);
			clearCache("circle_list_total", 'key');
		}
		adminLog("添加话题", $title);
		$param = array(
			"service"  => "circle",
			"template" => "circle_topic",
			"id"       => $aid
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `uid` = '$uid', `title` = '$title', `litpic` = '$litpic', `banner` = '$banner', `state` = '$state', `note` = '$note', `browse` = '$browse', `rec` = '$rec' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			// 检查缓存
			checkCache("circle_list", $id);
			clearCache("circle_detail", $id);
			clearCache("circle_list_total", 'key');

			adminLog("修改话题", $title);
			$param = array(
				"service"  => "circle",
				"template" => "detail",
				"id"       => $id
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

			foreach ($results[0] as $key => $value) {
				${$key} = $value;
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

	//css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/circle/circleAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/circle.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$caratlasMax = $custom_car_atlasMax ? $custom_car_atlasMax : 9;
	$huoniaoTag->assign('caratlasMax', $caratlasMax);

	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('uid', $uid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('browse', $browse);
	$huoniaoTag->assign('banner', $banner);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('cityid', $cityid == "" ? 0 : $cityid);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('price', $price == 0 ? 0 : $price);
	$huoniaoTag->assign('totalprice', $totalprice == 0 ? "" : $totalprice);
	$huoniaoTag->assign('ckprice', $ckprice);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);



	/* $typeArrCar = array();
	if(!empty($brand)){
		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__car_brandtype` WHERE `parentid` = ". $brand);
		$rets = $dsql->dsqlOper($sql, "results");
		if($rets){
			foreach ($rets as $k => $v) {
				$typeArrCar[$k]['id'] = $v['id'];
				$typeArrCar[$k]['title'] = $v['typename'];
			}
		}
	}
	$huoniaoTag->assign('typeArrCar', $typeArrCar); */

	$modelArrCar = array();
	/* if(!empty($model)){
		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__car_brand` WHERE `id` = ". $model);
		$rets = $dsql->dsqlOper($sql, "results");
		if($rets){
			foreach ($rets as $k => $v) {
				$modelArrCar[$k]['id'] = $v['id'];
				$modelArrCar[$k]['title'] = $v['title'];
			}
		}
	} */

	if(!empty($brand)){

		if($dsql->getTypeList($brand, "car_brandtype")){
			$lower = arr_foreach($dsql->getTypeList($brand, "car_brandtype"));
			$lower = $brand.",".join(',',$lower);
		}else{
			$lower = $brand;
		}
		$where = " AND `brand` in ($lower)";

		$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__car_brand` WHERE 1=1 ". $where);
		$rets = $dsql->dsqlOper($sql, "results");
		if($rets){
			foreach ($rets as $k => $v) {
				$modelArrCar[$k]['id'] = $v['id'];
				$modelArrCar[$k]['title'] = $v['title'];
			}
		}
	}
	$huoniaoTag->assign('modelArrCar', $modelArrCar);

	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");


	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('否','是'));
	$huoniaoTag->assign('state', $state == "" ? 0 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/circle";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
