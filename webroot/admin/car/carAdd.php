<?php
/**
 * 添加二手车
 *
 * @version        $Id: carAdd.php 2019-03-15 下午16:34:13 $
 * @package        HuoNiao.car
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "carAdd.html";

$tab = "car_list";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改二手车";
	checkPurview("carEdit");
}else{
	$pagetitle = "添加二手车";
	checkPurview("carAdd");
}

if(empty($addrid)) $addrid = 0;
if(empty($cityid)) $cityid = 0;
if(empty($price)) $price = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($userid)) $userid = 0;
if(empty($click)) $click = mt_rand(50, 200);
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
		echo '{"state": 200, "info": "请输入二手车名称！"}';
		exit();
	}

	if($usertype == 0){
		if(empty($username)){
			echo '{"state": 200, "info": "请输入联系人！"}';
			exit();
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '".$users."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请重新选择"}';
			exit();
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = '".$userResult[0]['id']."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "该会员为顾问，请选择个人会员！"}';
			exit();
		}
		if(empty($contact)){
			echo '{"state": 200, "info": "请输入联系电话！"}';
			exit();
		}
	}else{
		if($userid == 0 && trim($user) == ''){
			echo '{"state": 200, "info": "请选择顾问"}';
			exit();
		}
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请重新选择"}';
				exit();
			}
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `userid` = '".$userResult[0]['id']."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "顾问不存在，请在联想列表中选择"}';
				exit();
			}

			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_adviser` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "顾问不存在，请在联想列表中选择"}';
				exit();
			}
		}
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
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`brand`, `carsystem`, `model`, `title`,`titlename`,`addrid`, `cityid`, `litpic`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `price`, `totalprice`, `ckprice`, `color`, `location`, `mileage`, `nature`, `staging`, `downpayment`, `seeway`, `transfertimes`, `njendtime`, `jqxendtime`, `businessendtime`, `note`, `pics`, `weight`, `state`, `flag`, `pubdate`, `tax`, `cardtime`, `click`)
		VALUES
		('$brand', '$carsystem', '$model', '$title','$titlename','$addrid', '$cityid', '$litpic', '$usertype', '$userid', '$username', '$areaCode', '$contact', '$price', '$totalprice', '$ckprice', '$colorname', '$location', '$mileage', '$nature', '$staging', '$downpayment', '$seeway', '$transfertimes', '$njendtime', '$jqxendtime', '$businessendtime', '$note', '$pics', '$weight', '$state', '$flag', '$pubdate', '$tax', '$cardtime', '$click')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		if($state == 1){
			updateCache("car_list", 300);
			clearCache("car_list_total", 'key');
		}
		adminLog("添加二手车信息", $title);
		$param = array(
			"service"  => "car",
			"template" => "detail",
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `click` = '$click', `brand` = '$brand', `carsystem` = '$carsystem', `model` = '$model', `title` = '$title',`titlename` = '$titlename', `addrid` = '$addrid', `cityid` = '$cityid', `litpic` = '$litpic', `usertype` = '$usertype', `userid` = '$userid', `username` = '$username', `areaCode` = '$areaCode', `contact` = '$contact', `price` = '$price', `totalprice` = '$totalprice', `ckprice` = '$ckprice', `color` = '$colorname', `location` = '$location', `mileage` = '$mileage', `nature` = '$nature', `staging` = '$staging', `downpayment` = '$downpayment', `seeway` = '$seeway', `transfertimes` = '$transfertimes', `njendtime` = '$njendtime', `jqxendtime` = '$jqxendtime', `businessendtime` = '$businessendtime', `note` = '$note', `pics` = '$pics', `weight` = '$weight', `state` = '$state', `flag` = '$flag', `tax` = '$tax', `cardtime` = '$cardtime' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			// 检查缓存
			checkCache("car_list", $id);
			clearCache("car_detail", $id);
			clearCache("car_list_total", 'key');

			adminLog("修改二手车信息", $title);
			$param = array(
				"service"  => "car",
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
		'admin/car/carAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/car.inc.php");
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

	//品牌分类
	$huoniaoTag->assign('brandListArr', json_encode($dsql->getTypeList(0, "car_brandtype")));
	$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_brandtype` WHERE `id` = ". $brand);
	$res = $dsql->dsqlOper($sql, "results");
	if(!empty($res[0]['typename'])){
		$brandname = $res[0]["typename"];
	}else{
		$brandname = '选择分类';
	}
	$huoniaoTag->assign('brandname', $brandname);

	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('titlename', $titlename);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('cityid', $cityid == "" ? 0 : $cityid);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('price', $price == 0 ? 0 : $price);
	$huoniaoTag->assign('totalprice', $totalprice == 0 ? "" : $totalprice);
	$huoniaoTag->assign('ckprice', $ckprice);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);

	$huoniaoTag->assign('brand', $brand ? $brand : 0);
	$huoniaoTag->assign('carsystem', $carsystem ? $carsystem : 0);
	$huoniaoTag->assign('model', $model ? $model : 0);

	$huoniaoTag->assign('colorname', $color);
	$huoniaoTag->assign('location', $location ? $location : 0);
	$huoniaoTag->assign('cardtime', $cardtime ? date("Y-m-d H:i:s", $cardtime) : '');
	$huoniaoTag->assign('njendtime', $njendtime ? date("Y-m-d H:i:s", $njendtime) : '');
	$huoniaoTag->assign('jqxendtime', $jqxendtime ? date("Y-m-d H:i:s", $jqxendtime) : '');
	$huoniaoTag->assign('businessendtime', $businessendtime ? date("Y-m-d H:i:s", $businessendtime) : '');
	$huoniaoTag->assign('tax', $tax ? $tax : 0);
	$huoniaoTag->assign('mileage', $mileage ? $mileage : '');
	$huoniaoTag->assign('downpayment', $downpayment ? $downpayment : '');
	$huoniaoTag->assign('seeway', $seeway ? $seeway : '');
	$huoniaoTag->assign('transfertimes', $transfertimes ? $transfertimes : '');

	$typeArr = array();
	$sql = $dsql->SetQuery("SELECT * FROM `#@__car_brandtype` where `parentid` = 0 ORDER BY `weight` DESC, `id` DESC");
	$rets = $dsql->dsqlOper($sql, "results");
	if($rets){
		foreach ($rets as $k => $v) {
			$typeArr[$k]['id'] = $v['id'];
			$typeArr[$k]['title'] = $v['typename'];
		}
	}
	$huoniaoTag->assign('typeArr', $typeArr);

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

	//房源性质
	$huoniaoTag->assign('typeopt', array('0', '1'));
	$huoniaoTag->assign('typenames',array('个人','顾问'));
	$huoniaoTag->assign('usertype', $usertype == "" ? 0 : $usertype);

	//车辆性质
	$huoniaoTag->assign('natureNames', array("非营运", "营运"));
	$huoniaoTag->assign('natureOpt', array("0", "1"));
	$huoniaoTag->assign('nature', $nature == "" ? 0 : (int)$nature);

	//可分期
	$huoniaoTag->assign('stagingNames', array("不可分期", "可分期"));
	$huoniaoTag->assign('stagingOpt', array("0", "1"));
	$huoniaoTag->assign('staging', $staging == "" ? 0 : (int)$staging);

	//首付比列
	$downpaymentArr = array('0.2', '0.3', '0.5', '0.6', '0.8');
	$huoniaoTag->assign('downpaymentArr', $downpaymentArr);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('flaglist', array("推荐", "准新车", "新车", "热销", "急售"));
	$huoniaoTag->assign('flagval', array("0", "1", "2", "3", "4"));
	$huoniaoTag->assign('flag', explode(",", $flag));

	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('areaCode', $areaCode);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('username', $username);
	if($usertype == 0){
		$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `phone` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('user', $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"]);
	}else{
		//会员
		$userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__car_adviser` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		if($username){
			$userSql = $dsql->SetQuery("SELECT `username`, `nickname`, `phone` FROM `#@__member` WHERE `id` = ". $username[0]["userid"]);
			$username = $dsql->getTypeName($userSql);
			$huoniaoTag->assign('user', $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"]);
		}
	}

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
