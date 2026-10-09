<?php
/**
 * 添加老人信息
 *
 * @version        $Id: pensionelderlyAdd.php 2019-07-29 下午13:18:13 $
 * @package        HuoNiao.pension
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/pension";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pensionelderlyAdd.html";

$tab = "pension_elderly";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改老人信息";
	checkPurview("pensionelderlyEdit");
}else{
	$pagetitle = "添加老人信息";
	checkPurview("pensionelderlyAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($rec)) $rec = 0;
if(empty($click)) $click = mt_rand(50, 200);
// if(!empty($targetcare)) $targetcare = join(",", $targetcare);
if(empty($targetcare)) $targetcare = 0;
if(empty($catid)) $catid = 0;
if(empty($switch)) $switch = 0;
// if(!empty($catid)) $catid = join(",", $catid);

if(!empty($lnglat)){
	$lnglatArr = explode(',', $lnglat);
	$lng = $lnglatArr[0];
	$lat = $lnglatArr[1];
}
$registration = GetMkTime($registration);
$pubdate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
    //表单二次验证
    if(empty($cityid)){
        echo '{"state": 200, "info": "请选择城市"}';
        exit();
    }

    $adminCityIdsArr = explode(',', $adminCityIds);
    if(!in_array($cityid, $adminCityIdsArr)){
        echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
        exit();
    }

	if(empty($elderlyname)){
		echo '{"state": 200, "info": "请输入老人信息名称！"}';
		exit();
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员"}';
		exit();
	}
	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择!"}';
			exit();
		}
		$userid = $userResult[0]['id'];
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
	}

	if(empty($tel)){
		echo '{"state": 200, "info": "请输入老人信息联系电话！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入老人信息联系地址！"}';
		exit();
	}


	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `elderlyname` = '".$elderlyname."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "老人信息已存在，不可以重复添加！"}';
			exit();
		}*/

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它老人信息，一个会员不可以管理多个老人信息！"}';
			exit();
		}

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `elderlyname` = '".$elderlyname."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "老人信息已存在，不可以重复添加！"}';
			exit();
		}*/

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它老人信息，一个会员不可以管理多个老人信息！"}';
			exit();
		}
	}


}

if($dopost == "save" && $submit == "提交"){

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`wx`, `email`, `elderlyname`, `userid`, `photo`, `sex`, `age`, `cityid`, `addrid`, `address`, `lng`, `lat`,  `tel`, `catid`, `relationship`, `situation`, `personalsituation`, `level`, `accommodation`, `rzmaxprice`, `rzminprice`, `monthmaxprice`, `monthminprice`, `desc`, `people`, `targetcare`, `click`, `pubdate`, `weight`, `state`, `switch`) VALUES ('$wx', '$email', '$elderlyname', '$userid', '$photo', '$sex', '$age', '$cityid', '$addrid', '$address', '$lng', '$lat',  '$tel', '$catid', '$relationship', '$situation', '$personalsituation', '$level', '$accommodation', '$rzmaxprice', '$rzminprice', '$monthmaxprice', '$monthminprice', '$desc', '$people', '$targetcare', '$click', '$pubdate', '$weight', '$state', '$switch')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		//域名操作
		//operaDomain('update', $domain, 'pension', $tab, $aid, GetMkTime($domainexp), $domaintip);
		if($state == 1){
			updateCache("pension_elderly_list", 300);
			clearCache("pension_elderly_total", 'key');
		}
		$param = array(
			"service"     => "pension",
			"template"    => "elderly-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加老人信息信息", $title);
		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").', "url": "'.$url.'"}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `wx` = '$wx', `email` = '$email', `elderlyname` = '$elderlyname', `userid` = '$userid', `photo` = '$photo', `sex` = '$sex', `age` = '$age', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat',  `tel` = '$tel', `catid` = '$catid', `relationship` = '$relationship', `situation` = '$situation', `personalsituation` = '$personalsituation', `level` = '$level', `accommodation` = '$accommodation', `rzmaxprice` = '$rzmaxprice', `rzminprice` = '$rzminprice', `monthmaxprice` = '$monthmaxprice', `monthminprice` = '$monthminprice', `desc` = '$desc', `people` = '$people', `targetcare` = '$targetcare', `click` = '$click', `weight` = '$weight', `state` = '$state', `switch` = '$switch' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			//operaDomain('update', $domain, 'pension', $tab, $id, GetMkTime($domainexp), $domaintip);

			// 检查缓存
			checkCache("pension_elderly_list", $id);
			clearCache("pension_elderly_total", 'key');
			clearCache("pension_elderly_detail", $id);

			$param = array(
				"service"     => "pension",
				"template"    => "elderly-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);

			adminLog("修改老人信息信息", $title);
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
			$lnglat       = !empty($lng) && !empty($lat) ? $lng . ',' . $lat : '';
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/pension/pensionelderlyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/pension.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('basehost', $cfg_basehost);
	$huoniaoTag->assign('mapCity', $cfg_mapCity);
	$storeatlasMax = $custom_store_atlasMax ? $custom_store_atlasMax : 9;
	$huoniaoTag->assign('storeatlasMax', $storeatlasMax);

	//获取域名信息
	$domainInfo = getDomain('pension', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);
	$huoniaoTag->assign('id', $id);

	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);
	if($customSubDomain != 2){
		$huoniaoTag->assign('domaintype', array('0', '1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名','绑定子域名'));
	}else{
		$huoniaoTag->assign('domaintype', array('0', '1'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名'));
	}
	if($customSubDomain == 2 && $domaintype == 2) $domaintype = 0;

	$huoniaoTag->assign('domaintypeChecked', $domaintype == "" ? 0 : $domaintype);
	$huoniaoTag->assign('domain', $domain);
	$huoniaoTag->assign('domainexp', $domainexp == 0 ? "" : date("Y-m-d H:i:s", $domainexp));
	$huoniaoTag->assign('domaintip', $domaintip);

	//照护对象
	$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__pension_item` WHERE `parentid` = 1 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$targetcarelist = array();
	foreach($results as $k => $value){
		$targetcarelist[$k]['id']       = $value['id'];
		$targetcarelist[$k]['typename'] = $value['typename'];
	}
	$huoniaoTag->assign('targetcarelist', array_column($targetcarelist, "typename"));
	$huoniaoTag->assign('targetcareval', array_column($targetcarelist, "id"));
	$huoniaoTag->assign('targetcare', $targetcare);

	//分类
	include_once HUONIAOROOT."/api/handlers/pension.class.php";
	$pension = new pension();
	$pensionTypeList = $pension->catid_type();

	$huoniaoTag->assign('catidlist', array_column($pensionTypeList, "typename"));
	$huoniaoTag->assign('catidval', array_column($pensionTypeList, "id"));
	$huoniaoTag->assign('catid', (int)$catid);

	$pensionTypeList = $pension->accommodation_type();
	$huoniaoTag->assign('accommodationopt', array_column($pensionTypeList, "id"));
	$huoniaoTag->assign('accommodationnames', array_column($pensionTypeList, "typename"));
	$huoniaoTag->assign('accommodation', $accommodation == "" ? 1 : $accommodation);

	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('elderlyname', $elderlyname);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('desc', $desc);
	$huoniaoTag->assign('relationship', $relationship);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('station', $station);
	$huoniaoTag->assign('trans', $trans);
	$huoniaoTag->assign('explains', $explains);
	$huoniaoTag->assign('situation', $situation);
	$huoniaoTag->assign('personalsituation', $personalsituation);
	$huoniaoTag->assign('level', $level);
	$huoniaoTag->assign('accommodation', $accommodation);
	$huoniaoTag->assign('rzmaxprice', $rzmaxprice);
	$huoniaoTag->assign('rzminprice', $rzminprice);
	$huoniaoTag->assign('monthmaxprice', $monthmaxprice);
	$huoniaoTag->assign('monthminprice', $monthminprice);
	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('age', $age);
	$huoniaoTag->assign('photo', $photo);
	$huoniaoTag->assign('wx', $wx);
	$huoniaoTag->assign('email', $email);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('address', $address);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('click', $click);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//开关
	$huoniaoTag->assign('switchopt', array('0', '1'));
	$huoniaoTag->assign('switchnames',array('关闭','开启'));
	$huoniaoTag->assign('switch', $switch == "" ? 1 : $switch);

	$huoniaoTag->assign('sexopt', array('0', '1'));
	$huoniaoTag->assign('sexnames',array('女','男'));
	$huoniaoTag->assign('sex', (int)$sex);

	//店铺开关
	$huoniaoTag->assign('store_switchopt', array('0', '1'));
	$huoniaoTag->assign('store_switchnames',array('关闭','开启'));
	$huoniaoTag->assign('store_switch', $store_switch == "" ? 1 : $store_switch);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pension";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
