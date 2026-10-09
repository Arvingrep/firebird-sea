<?php
/**
 * 品牌型号
 *
 * @version        $Id: carBrand.php 2019-3-15 下午21:32:58 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "car_brand";

checkPurview("carBrand");

//css
$cssFile = array(
    'ui/jquery.chosen.css',
	'admin/chosen.min.css',
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if(!empty($category)) $category = join(",", $category);
if(!empty($internalsetting)) $internalsetting = join(",", $internalsetting);
if(!empty($securitysetting)) $securitysetting = join(",", $securitysetting);
if(!empty($externalsetting)) $externalsetting = join(",", $externalsetting);
$prodate= GetMkTime($prodate);
if($dopost != "" || $dopost == "Add" || $dopost == "Edit"){

	require_once(HUONIAOINC."/config/car.inc.php");

	//安全设置
	$securitysettingList = array();
	if($customsecuritysettingTag){
		$securitysettingTagArr = explode('|', $customsecuritysettingTag);
		foreach ($securitysettingTagArr as $key => $row) {
			$childAecurity = explode('-', $row);
			$securitysettingList[$key]['id']       = $childAecurity[0];
			$securitysettingList[$key]['typename'] = $childAecurity[1];
		}
		$huoniaoTag->assign('securitysettinglist', array_column($securitysettingList, "typename"));
		$huoniaoTag->assign('securitysettingval', array_column($securitysettingList, "id"));
	}

	//外部配置
	$externalsettingList = array();
	if($customexternalsettingTag){
		$externalsettingTagArr = explode('|', $customexternalsettingTag);
		foreach ($externalsettingTagArr as $key => $row) {
			$childExternal = explode('-', $row);
			$externalsettingList[$key]['id']       = $childExternal[0];
			$externalsettingList[$key]['typename'] = $childExternal[1];
		}
		$huoniaoTag->assign('externalsettinglist', array_column($externalsettingList, "typename"));
		$huoniaoTag->assign('externalsettingval', array_column($externalsettingList, "id"));
	}

	//内部配置
	$internalsettingList = array();
	if($custominternalsettingTag){
		$internalsettingTagArr = explode('|', $custominternalsettingTag);
		foreach ($internalsettingTagArr as $key => $row) {
			$childInternal = explode('-', $row);
			$internalsettingList[$key]['id']       = $childInternal[0];
			$internalsettingList[$key]['typename'] = $childInternal[1];
		}
		$huoniaoTag->assign('internalsettinglist', array_column($internalsettingList, "typename"));
		$huoniaoTag->assign('internalsettingval', array_column($internalsettingList, "id"));
	}

	//级别
	$huoniaoTag->assign('levelListArr', json_encode($dsql->getTypeList(0, "car_level")));
	$huoniaoTag->assign('levelname', empty($levelname) ? "选择分类" : $levelname);

	//品牌分类
	$huoniaoTag->assign('brandListArr', json_encode($dsql->getTypeList(0, "car_brandtype", true)));
	$huoniaoTag->assign('brandname', empty($brandname) ? "选择分类" : $brandname);

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
}
if($dopost != ""){
	$templates = "carBrandAdd.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'publicUpload.js',
        'ui/chosen.jquery.min.js',
		'admin/car/carBrandAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "carBrand.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/car/carBrand.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

$pagetitle = "品牌型号管理";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate = GetMkTime(time());       //发布时间
	$rec     = (int)$rec;

	$carsystem = $carsystem ? $carsystem : 0;
    $gearbox = $gearbox ? $gearbox : 0;
    $standard = $standard ? $standard : 0;
    $wheelbase = $wheelbase ? $wheelbase : 0;
    $intakeform = $intakeform ? $intakeform : 0;
    $fueltype = $fueltype ? $fueltype : 0;
    $fuelgrade = $fuelgrade ? $fuelgrade : 0;
    $fuelsupplymode = $fuelsupplymode ? $fuelsupplymode : 0;
    $drivingmode = $drivingmode ? $drivingmode : 0;
    $assistancetype = $assistancetype ? $assistancetype : 0;
    $frontsuspensiontype = $frontsuspensiontype ? $frontsuspensiontype : 0;
    $rearsuspensiontype = $rearsuspensiontype ? $rearsuspensiontype : 0;
    $frontbraketype = $frontbraketype ? $frontbraketype : 0;
    $rearbraketype = $rearbraketype ? $rearbraketype : 0;
    $parkingbraketype = $parkingbraketype ? $parkingbraketype : 0;
    $fronttirespecification = $fronttirespecification ? $fronttirespecification : '';
    $reartirespecification = $reartirespecification ? $reartirespecification : '';
    $securitysetting = $securitysetting ? $securitysetting : 0;
    $externalsetting = $externalsetting ? $externalsetting : 0;
    $internalsetting = $internalsetting ? $internalsetting : 0;

	if($dopost == "Add"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_brand` WHERE `brand` = '$brand' and `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "已有该型号，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__car_brand` WHERE `brand` = '$brand' and `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "已有该型号，不可以重复添加！"}';
			exit();
		}

	}
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
        $sTypeArr = $dsql->getTypeList($sType, "car_brandtype", false);
		if($sTypeArr){
			$lower = arr_foreach($sTypeArr);
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `brand` in ($lower)";
	}

	$where .= " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `logo`, `brand`, `carsystem`, `weight`, `level`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["logo"] = $value["logo"];
			$list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_brandtype` WHERE `id` = ". $value["brand"]);
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res[0]['typename'])){
				$list[$key]["brandname"] = $res[0]["typename"];
			}else{
				$list[$key]["brandname"] = '';
			}

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_brandtype` WHERE `id` = ". $value["carsystem"]);
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res[0]['typename'])){
				$list[$key]["carsystemname"] = $res[0]["typename"];
			}else{
				$list[$key]["carsystemname"] = '';
			}

			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_level` WHERE `id` = ". $value["level"]);
			$res = $dsql->dsqlOper($sql, "results");
			if(!empty($res[0]['typename'])){
				$list[$key]["levelname"] = $res[0]["typename"];
			}else{
				$list[$key]["levelname"] = '';
			}

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "shopBrandList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle     = "新增品牌型号";

	//表单提交
	if($submit == "提交"){

		if(trim($brand) == ''){
			echo '{"state": 200, "info": "请选择品牌分类"}';
			exit();
		}

		if(trim($carsystem) == ''){
			//echo '{"state": 200, "info": "请填写品牌车系"}';
			//exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "请填写品牌型号"}';
			exit();
		}

		if(empty($level)){
			echo '{"state": 200, "info": "请填写级别分类"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `logo`, `weight`, `rec`, `pubdate`, `brand`, `carsystem`, `emissions`, `gearbox`, `standard`, `company`, `level`, `certificatebrandmodel`, `engine`, `transmissioncase`, `bodystructure`, `lengthwidthheight`, `wheelbase`, `cargovolume`, `quality`, `intakeform`, `cylinder`, `maximumhorsepower`, `maximumtorque`, `fueltype`, `fuelgrade`, `fuelsupplymode`, `drivingmode`, `assistancetype`, `frontsuspensiontype`, `rearsuspensiontype`, `frontbraketype`, `rearbraketype`, `parkingbraketype`, `fronttirespecification`, `reartirespecification`, `securitysetting`, `externalsetting`, `internalsetting`, `state`, `prodate`,`totalprice`) VALUES ('$title', '$litpic', '$weight', '$rec', '$pubdate', '$brand', '$carsystem', '$emissions', '$gearbox', '$standard', '$company', '$level', '$certificatebrandmodel', '$engine', '$transmissioncase', '$bodystructure', '$lengthwidthheight', '$wheelbase', '$cargovolume', '$quality', '$intakeform', '$cylinder', '$maximumhorsepower', '$maximumtorque', '$fueltype', '$fuelgrade', '$fuelsupplymode', '$drivingmode', '$assistancetype', '$frontsuspensiontype', '$rearsuspensiontype', '$frontbraketype', '$rearbraketype', '$parkingbraketype', '$fronttirespecification', '$reartirespecification', '$securitysetting', '$externalsetting', '$internalsetting', '$state', '$prodate','$totalprice')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增品牌型号", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改品牌型号";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

        //表单二次验证
        if(trim($brand) == ''){
			echo '{"state": 200, "info": "请选择品牌分类"}';
			exit();
		}

		if(trim($carsystem) == ''){
			//echo '{"state": 200, "info": "请填写品牌车系"}';
			//exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "请填写品牌型号"}';
			exit();
		}

		if(empty($level)){
			echo '{"state": 200, "info": "请填写级别分类"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `prodate` = '$prodate', `certificatebrandmodel` = '$certificatebrandmodel', `engine` = '$engine', `transmissioncase` = '$transmissioncase', `bodystructure` = '$bodystructure', `lengthwidthheight` = '$lengthwidthheight', `wheelbase` = '$wheelbase', `cargovolume` = '$cargovolume', `quality` = '$quality', `intakeform` = '$intakeform', `cylinder` = '$cylinder', `maximumhorsepower` = '$maximumhorsepower', `maximumtorque` = '$maximumtorque', `fueltype` = '$fueltype', `fuelgrade` = '$fuelgrade', `fuelsupplymode` = '$fuelsupplymode', `drivingmode` = '$drivingmode', `assistancetype` = '$assistancetype', `frontsuspensiontype` = '$frontsuspensiontype', `rearsuspensiontype` = '$rearsuspensiontype', `frontbraketype` = '$frontbraketype', `rearbraketype` = '$rearbraketype', `parkingbraketype` = '$parkingbraketype', `fronttirespecification` = '$fronttirespecification', `reartirespecification` = '$reartirespecification', `securitysetting` = '$securitysetting', `externalsetting` = '$externalsetting', `internalsetting` = '$internalsetting', `state` = '$state', `title` = '$title', `logo` = '$litpic', `weight` = '$weight', `rec` = '$rec', `brand` = '$brand', `carsystem` = '$carsystem', `emissions` = '$emissions', `gearbox` = '$gearbox', `standard` = '$standard', `company` = '$company', `level` = '$level' ,`totalprice` = '$totalprice' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改品牌型号", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$title     = $results[0]['title'];
				$logo      = $results[0]['logo'];
				$weight    = $results[0]['weight'];
				$rec       = $results[0]['rec'];
				$pubdate   = $results[0]['pubdate'];
				$brand     = $results[0]['brand'];
				$carsystem = $results[0]['carsystem'];
				$emissions = $results[0]['emissions'];
				$gearbox   = $results[0]['gearbox'];
				$standard  = $results[0]['standard'];
				$company   = $results[0]['company'];
				$level     = $results[0]['level'];
				$certificatebrandmodel = $results[0]['certificatebrandmodel'];
				$engine = $results[0]['engine'];
				$transmissioncase = $results[0]['transmissioncase'];
				$bodystructure = $results[0]['bodystructure'];
				$lengthwidthheight = $results[0]['lengthwidthheight'];
				$wheelbase = $results[0]['wheelbase'];
				$cargovolume = $results[0]['cargovolume'];
				$quality = $results[0]['quality'];
				$totalprice = $results[0]['totalprice'];
				$intakeform = $results[0]['intakeform'];
				$cylinder = $results[0]['cylinder'];
				$maximumhorsepower = $results[0]['maximumhorsepower'];
				$maximumtorque = $results[0]['maximumtorque'];
				$fueltype = $results[0]['fueltype'];
				$fuelgrade = $results[0]['fuelgrade'];
				$fuelsupplymode = $results[0]['fuelsupplymode'];
				$drivingmode = $results[0]['drivingmode'];
				$assistancetype = $results[0]['assistancetype'];
				$frontsuspensiontype = $results[0]['frontsuspensiontype'];
				$rearsuspensiontype = $results[0]['rearsuspensiontype'];
				$frontbraketype = $results[0]['frontbraketype'];
				$rearbraketype = $results[0]['rearbraketype'];
				$parkingbraketype = $results[0]['parkingbraketype'];
				$fronttirespecification = $results[0]['fronttirespecification'];
				$reartirespecification = $results[0]['reartirespecification'];
				$securitysetting = $results[0]['securitysetting'];
				$externalsetting = $results[0]['externalsetting'];
				$internalsetting = $results[0]['internalsetting'];
				$state = $results[0]['state'];
				$prodate = $results[0]['prodate'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			delPicFile($results[0]['logo'], "delBrand", "car");

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除品牌型号", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;
}elseif($dopost == "getChildType"){
	if($type!=''){
		$sql = $dsql->SetQuery("SELECT * FROM `#@__car_brandtype` where `parentid` = '$type' ORDER BY `weight` DESC, `id` DESC");
		$rets = $dsql->dsqlOper($sql, "results");
		$typeArr = array();
		if($rets){
			foreach ($rets as $k => $v) {
				$typeArr[$k]['id'] = $v['id'];
				$typeArr[$k]['title'] = $v['typename'];
			}
		}
		if(count($typeArr) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "list": '.json_encode($typeArr).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;
}elseif($dopost == "getmodel"){
	if($type!=''){
        $sTypeArr = $dsql->getTypeList($type, "car_brandtype", false);
		if($sTypeArr){
			$lower = arr_foreach($sTypeArr);
			$lower = $type.",".join(',',$lower);
		}else{
			$lower = $type;
		}
		$where = " AND `brand` in ($lower)";

		$sql = $dsql->SetQuery("SELECT * FROM `#@__car_brand` where 1=1 $where ORDER BY `weight` DESC, `id` DESC");
		$rets = $dsql->dsqlOper($sql, "results");
		$typeArr = array();
		if($rets){
			foreach ($rets as $k => $v) {
				$typeArr[$k]['id'] = $v['id'];
				$typeArr[$k]['title'] = $v['title'];
			}
		}
		if(count($typeArr) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "list": '.json_encode($typeArr).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $tab."type", false)));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('litpic', $logo);
		$huoniaoTag->assign('weight', $weight == "" ? 1 : $weight);
		$huoniaoTag->assign('rec', $rec);

		$huoniaoTag->assign('brand', $brand);
		$huoniaoTag->assign('carsystem', $carsystem);
		$huoniaoTag->assign('emissions', $emissions);
		$huoniaoTag->assign('company', $company);

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

		$huoniaoTag->assign('level', $level ? $level : 0);
		$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_level` WHERE `id` = ". $level);
		$res = $dsql->dsqlOper($sql, "results");
		if(!empty($res[0]['typename'])){
			$levelname = $res[0]["typename"];
		}else{
			$levelname = '选择分类';
		}
		$huoniaoTag->assign('levelname', $levelname);

		$huoniaoTag->assign('brand', $brand ? $brand : 0);
		$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__car_brandtype` WHERE `id` = ". $brand);
		$res = $dsql->dsqlOper($sql, "results");
		if(!empty($res[0]['typename'])){
			$brandname = $res[0]["typename"];
		}else{
			$brandname = '选择分类';
		}
		$huoniaoTag->assign('brandname', $brandname);


		$huoniaoTag->assign('totalprice', $totalprice);
		$huoniaoTag->assign('certificatebrandmodel', $certificatebrandmodel);
		$huoniaoTag->assign('engine', $engine);
		$huoniaoTag->assign('transmissioncase', $transmissioncase);
		$huoniaoTag->assign('bodystructure', $bodystructure);
		$huoniaoTag->assign('lengthwidthheight', $lengthwidthheight);
		$huoniaoTag->assign('wheelbase', $wheelbase);
		$huoniaoTag->assign('cargovolume', $cargovolume);
		$huoniaoTag->assign('quality', $quality);
		$huoniaoTag->assign('cylinder', $cylinder);
		$huoniaoTag->assign('maximumhorsepower', $maximumhorsepower);
		$huoniaoTag->assign('maximumtorque', $maximumtorque);
		$huoniaoTag->assign('fronttirespecification', $fronttirespecification);
		$huoniaoTag->assign('reartirespecification', $reartirespecification);

		include_once HUONIAOROOT."/api/handlers/car.class.php";
		$car = new car();

		//排放标准
		//$standardList = $car->standard_type();
		$standardList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$standardList[$key]['id'] = $value['id'];
				$standardList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('standardList', array_column($standardList, "id"));
		$huoniaoTag->assign('standardName', array_column($standardList, "typename"));
		$huoniaoTag->assign('standard', $standard == "" ? 1 : $standard);

		//变速箱
		$gearboxList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$gearboxList[$key]['id'] = $value['id'];
				$gearboxList[$key]['typename'] = $value['typename'];
			}
		}
		//$gearboxList = $car->gearbox_type();
		$huoniaoTag->assign('gearboxList', array_column($gearboxList, "id"));
		$huoniaoTag->assign('gearboxName', array_column($gearboxList, "typename"));
		$huoniaoTag->assign('gearbox', $gearbox == "" ? 1 : $gearbox);

		//进气形式
		//$intakeformList = $car->intakeform_type();
		$intakeformList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$intakeformList[$key]['id'] = $value['id'];
				$intakeformList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('intakeformList', array_column($intakeformList, "id"));
		$huoniaoTag->assign('intakeformName', array_column($intakeformList, "typename"));
		$huoniaoTag->assign('intakeform', $intakeform);

		//燃料类型
		//$fueltypeList = $car->fueltype_type();
		$fueltypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 4 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$fueltypeList[$key]['id'] = $value['id'];
				$fueltypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('fueltypeList', array_column($fueltypeList, "id"));
		$huoniaoTag->assign('fueltypeName', array_column($fueltypeList, "typename"));
		$huoniaoTag->assign('fueltype', $fueltype);

		//燃油标号
		//$fuelgradeList = $car->fuelgrade_type();
		$fuelgradeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 5 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$fuelgradeList[$key]['id'] = $value['id'];
				$fuelgradeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('fuelgradeList', array_column($fuelgradeList, "id"));
		$huoniaoTag->assign('fuelgradeName', array_column($fuelgradeList, "typename"));
		$huoniaoTag->assign('fuelgrade', $fuelgrade);

		//供油方式
		//$fuelsupplymodeList = $car->fuelsupplymode_type();
		$fuelsupplymodeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$fuelsupplymodeList[$key]['id'] = $value['id'];
				$fuelsupplymodeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('fuelsupplymodeList', array_column($fuelsupplymodeList, "id"));
		$huoniaoTag->assign('fuelsupplymodeName', array_column($fuelsupplymodeList, "typename"));
		$huoniaoTag->assign('fuelsupplymode', $fuelsupplymode);

		//驱动方式
		//$drivingmodeList = $car->drivingmode_type();
		$drivingmodeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 7 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$drivingmodeList[$key]['id'] = $value['id'];
				$drivingmodeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('drivingmodeList', array_column($drivingmodeList, "id"));
		$huoniaoTag->assign('drivingmodeName', array_column($drivingmodeList, "typename"));
		$huoniaoTag->assign('drivingmode', $drivingmode);

		//助力类型
		//$assistancetypeList = $car->assistancetype_type();
		$assistancetypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$assistancetypeList[$key]['id'] = $value['id'];
				$assistancetypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('assistancetypeList', array_column($assistancetypeList, "id"));
		$huoniaoTag->assign('assistancetypeName', array_column($assistancetypeList, "typename"));
		$huoniaoTag->assign('assistancetype', $assistancetype);

		//前悬挂类型
		//$frontsuspensiontypeList = $car->frontsuspensiontype_type();
		$frontsuspensiontypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 9 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$frontsuspensiontypeList[$key]['id'] = $value['id'];
				$frontsuspensiontypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('frontsuspensiontypeList', array_column($frontsuspensiontypeList, "id"));
		$huoniaoTag->assign('frontsuspensiontypeName', array_column($frontsuspensiontypeList, "typename"));
		$huoniaoTag->assign('frontsuspensiontype', $frontsuspensiontype);

		//后悬挂类型
		//$rearsuspensiontypeList = $car->rearsuspensiontype_type();
		$rearsuspensiontypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 10 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$rearsuspensiontypeList[$key]['id'] = $value['id'];
				$rearsuspensiontypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('rearsuspensiontypeList', array_column($rearsuspensiontypeList, "id"));
		$huoniaoTag->assign('rearsuspensiontypeName', array_column($rearsuspensiontypeList, "typename"));
		$huoniaoTag->assign('rearsuspensiontype', $rearsuspensiontype);

		//前制动器类型
		//$frontbraketypeList = $car->frontbraketype_type();
		$frontbraketypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 11 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$frontbraketypeList[$key]['id'] = $value['id'];
				$frontbraketypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('frontbraketypeList', array_column($frontbraketypeList, "id"));
		$huoniaoTag->assign('frontbraketypeName', array_column($frontbraketypeList, "typename"));
		$huoniaoTag->assign('frontbraketype', $frontbraketype);

		//后制动类型
		//$rearbraketypeList = $car->rearbraketype_type();
		$rearbraketypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$rearbraketypeList[$key]['id'] = $value['id'];
				$rearbraketypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('rearbraketypeList', array_column($rearbraketypeList, "id"));
		$huoniaoTag->assign('rearbraketypeName', array_column($rearbraketypeList, "typename"));
		$huoniaoTag->assign('rearbraketype', $rearbraketype);

		//驻车制动类型
		//$parkingbraketypeList = $car->parkingbraketype_type();
		$parkingbraketypeList = array();
		$archives = $dsql->SetQuery("SELECT * FROM `#@__caritem` WHERE `parentid` = 13 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			foreach($results as $key=>$value){
				$parkingbraketypeList[$key]['id'] = $value['id'];
				$parkingbraketypeList[$key]['typename'] = $value['typename'];
			}
		}
		$huoniaoTag->assign('parkingbraketypeList', array_column($parkingbraketypeList, "id"));
		$huoniaoTag->assign('parkingbraketypeName', array_column($parkingbraketypeList, "typename"));
		$huoniaoTag->assign('parkingbraketype', $parkingbraketype);

		//安全设置
		//$securitysettingList = $car->securitysetting_type();
		//$huoniaoTag->assign('securitysettinglist', array_column($securitysettingList, "typename"));
		//$huoniaoTag->assign('securitysettingval', array_column($securitysettingList, "id"));
		$huoniaoTag->assign('securitysetting', explode(",", $securitysetting));

		//外部配置
		//$externalsettingList = $car->externalsetting_type();
		//$huoniaoTag->assign('externalsettinglist', array_column($externalsettingList, "typename"));
		//$huoniaoTag->assign('externalsettingval', array_column($externalsettingList, "id"));
		$huoniaoTag->assign('externalsetting', explode(",", $externalsetting));

		//内部配置
		//$internalsettingList = $car->internalsetting_type();
		//$huoniaoTag->assign('internalsettinglist', array_column($internalsettingList, "typename"));
		//$huoniaoTag->assign('internalsettingval', array_column($internalsettingList, "id"));
		$huoniaoTag->assign('internalsetting', explode(",", $internalsetting));

		//显示状态
		$huoniaoTag->assign('stateopt', array('0', '1', '2'));
		$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
		$huoniaoTag->assign('state', $state == "" ? 1 : $state);

		$huoniaoTag->assign('emissions', $emissions == "" ? '1.0' : $emissions);

		$huoniaoTag->assign('prodate', $prodate == "" ? '' : $prodate);

	}




	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
function getTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
