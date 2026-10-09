<?php
/**
 * 添加养老店铺
 *
 * @version        $Id: pensionstoreAdd.php 2019-07-29 下午13:18:13 $
 * @package        HuoNiao.pension
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/pension";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "storeAdd.html";

$tab = "pension_store";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改养老店铺";
	checkPurview("pensionstoreEdit");
}else{
	$pagetitle = "添加养老店铺";
	checkPurview("pensionstoreAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($rec)) $rec = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(!empty($typeid)) $typeid = join(",", $typeid);
if(!empty($servicecontent)) $servicecontent = join(",", $servicecontent);
if(!empty($targetcare)) $targetcare = join(",", $targetcare);
if(!empty($roomtype)) $roomtype = join(",", $roomtype);
if(!empty($tag)) $tag = join(",", $tag);
if(!empty($catid)) $catid = join(",", $catid);
if(empty($visitday)) $visitday = 0;
if(empty($flags)) $flags = 0;
if(empty($award)) $award = 0;
if(empty($invite)) $invite = 0;
if(empty($advertising)) $advertising =0;

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

	if(empty($title)){
		echo '{"state": 200, "info": "请输入养老店铺名称！"}';
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
		echo '{"state": 200, "info": "请输入养老店铺联系电话！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入养老店铺联系地址！"}';
		exit();
	}


	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已存在，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它养老店铺，一个会员不可以管理多个养老店铺！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已存在，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它养老店铺，一个会员不可以管理多个养老店铺！"}';
			exit();
		}
	}

    $refuse = $state == 2 ? $refuse : '';

}

if($dopost == "save" && $submit == "提交"){

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`invite`, `rzprice`, `rec`, `title`, `userid`, `cityid`, `addrid`, `address`, `price`, `tag`, `visitday`, `visitdaydesc`, `typeid`,  `targetcare`, `roomtype`, `lng`, `lat`, `tel`, `pics`, `desc`, `catid`, `buildings`, `registration`, `landarea`, `builtuparea`, `rooms`, `peoplenums`, `ownedinstitutions`, `cooperativeinstitutions`, `diseases`, `careservices`, `lifeservice`, `foodsituation`, `othernotes`, `institutionadesc`, `longinstitutionadesc`, `shortinstitutionadesc`, `homecaredesc`, `homecareagedesc`, `residentialdesc`, `residentialagedesc`, `click`, `pubdate`, `weight`, `state`, `flag`, `award`, `awarddesc`, `explains`, `station`, `trans`, `roomarea`, `bednums`, `servicecontent`, `longexpenses`, `longbedfee`, `longotherfees`, `shortexpenses`, `shortbedfee`, `shortotherfees`, `homecyfw`, `homezlhl`, `homejzfw`, `homejsga`, `homejthd`, `hometlfw`, `residentialcard`, `residentialbedfee`, `residentialotherfees`,`is_vipguanggao`, `refuse`) VALUES ('$invite', '$rzprice', '$rec', '$title', '$userid', '$cityid', '$addrid', '$address', '$price', '$tag', '$visitday', '$visitdaydesc', '$typeid',  '$targetcare', '$roomtype', '$lng', '$lat', '$tel', '$pics', '$desc', '$catid', '$buildings', '$registration', '$landarea', '$builtuparea', '$rooms', '$peoplenums', '$ownedinstitutions', '$cooperativeinstitutions', '$diseases', '$careservices', '$lifeservice', '$foodsituation', '$othernotes', '$institutionadesc', '$longinstitutionadesc', '$shortinstitutionadesc', '$homecaredesc', '$homecareagedesc', '$residentialdesc', '$residentialagedesc', '$click', '$pubdate', '$weight', '$state', '$flag', '$award', '$awarddesc', '$explains', '$station', '$trans', '$roomarea', '$bednums', '$servicecontent', '$longexpenses', '$longbedfee', '$longotherfees', '$shortexpenses', '$shortbedfee', '$shortotherfees', '$homecyfw', '$homezlhl', '$homejzfw', '$homejsga', '$homejthd', '$hometlfw', '$residentialcard', '$residentialbedfee', '$residentialotherfees','$advertising', '$refuse')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		//域名操作
		//operaDomain('update', $domain, 'pension', $tab, $aid, GetMkTime($domainexp), $domaintip);
		if($state == 1){
			updateCache("pension_store_list", 300);
			clearCache("pension_store_total", 'key');
		}
		$param = array(
			"service"     => "pension",
			"template"    => "store-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);
        dataAsync("pension",$aid,"store");  // 养老机构、新增

		adminLog("添加养老店铺信息", $title);
		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").', "url": "'.$url.'"}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `invite` = '$invite', `rzprice` = '$rzprice', `rec` = '$rec', `title` = '$title', `userid` = '$userid', `cityid` = '$cityid', `addrid` = '$addrid', `address` = '$address', `price` = '$price', `tag` = '$tag', `visitday` = '$visitday', `visitdaydesc` = '$visitdaydesc', `typeid` = '$typeid',  `targetcare` = '$targetcare', `roomtype` = '$roomtype', `lng` = '$lng', `lat` = '$lat', `tel` = '$tel', `pics` = '$pics', `desc` = '$desc', `catid` = '$catid', `buildings` = '$buildings', `registration` = '$registration', `landarea` = '$landarea', `builtuparea` = '$builtuparea', `rooms` = '$rooms', `peoplenums` = '$peoplenums', `ownedinstitutions` = '$ownedinstitutions', `cooperativeinstitutions` = '$cooperativeinstitutions', `diseases` = '$diseases', `careservices` = '$careservices', `lifeservice` = '$lifeservice', `foodsituation` = '$foodsituation', `othernotes` = '$othernotes', `institutionadesc` = '$institutionadesc', `longinstitutionadesc` = '$longinstitutionadesc', `shortinstitutionadesc` = '$shortinstitutionadesc', `homecaredesc` = '$homecaredesc', `homecareagedesc` = '$homecareagedesc', `residentialdesc` = '$residentialdesc', `residentialagedesc` = '$residentialagedesc', `click` = '$click', `weight` = '$weight', `state` = '$state', `flag` = '$flag', `award` = '$award', `awarddesc` = '$awarddesc', `explains` = '$explains', `station` = '$station', `trans` = '$trans', `roomarea` = '$roomarea', `bednums` = '$bednums', `servicecontent` = '$servicecontent', `longexpenses` = '$longexpenses', `longbedfee` = '$longbedfee', `longotherfees` = '$longotherfees', `shortexpenses` = '$shortexpenses', `shortbedfee` = '$shortbedfee', `shortotherfees` = '$shortotherfees', `homecyfw` = '$homecyfw', `homezlhl` = '$homezlhl', `homejzfw` = '$homejzfw', `homejsga` = '$homejsga', `homejthd` = '$homejthd', `hometlfw` = '$hometlfw', `residentialcard` = '$residentialcard', `residentialbedfee` = '$residentialbedfee', `residentialotherfees` = '$residentialotherfees',`is_vipguanggao` = '$advertising', `refuse` = '$refuse' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			//operaDomain('update', $domain, 'pension', $tab, $id, GetMkTime($domainexp), $domaintip);

			// 检查缓存
			checkCache("pension_store_list", $id);
			clearCache("pension_store_total", 'key');
			clearCache("pension_store_detail", $id);
			
			$param = array(
				"service"     => "pension",
				"template"    => "store-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);

			adminLog("修改养老店铺信息", $title);
            dataAsync("pension",$id,"store");  // 养老机构、更新

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
		'admin/pension/storeAdd.js'
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

	//房间类型
	$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__pension_item` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$roomtypelist = array();
	foreach($results as $k => $value){
		$roomtypelist[$k]['id']       = $value['id'];
		$roomtypelist[$k]['typename'] = $value['typename'];
	}
	$huoniaoTag->assign('roomtypelist', array_column($roomtypelist, "typename"));
	$huoniaoTag->assign('roomtypeval', array_column($roomtypelist, "id"));
	$huoniaoTag->assign('roomtype', explode(",", $roomtype));

	//特殊服务
	$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__pension_item` WHERE `parentid` = 4 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$taglist = array();
	foreach($results as $k => $value){
		$taglist[$k]['id']       = $value['id'];
		$taglist[$k]['typename'] = $value['typename'];
	}
	$huoniaoTag->assign('taglist', array_column($taglist, "typename"));
	$huoniaoTag->assign('tagval', array_column($taglist, "id"));
	$huoniaoTag->assign('tag', explode(",", $tag));

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
	$huoniaoTag->assign('targetcare', explode(",", $targetcare));

	//机构类型
	$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__pension_item` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$typeidlist = array();
	foreach($results as $k => $value){
		$typeidlist[$k]['id']       = $value['id'];
		$typeidlist[$k]['typename'] = $value['typename'];
	}
	$huoniaoTag->assign('typeidlist', array_column($typeidlist, "typename"));
	$huoniaoTag->assign('typeidval', array_column($typeidlist, "id"));
	$huoniaoTag->assign('typeid', explode(",", $typeid));

	//服务内容
	$archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__pension_item` WHERE `parentid` = 5 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$servicecontentlist = array();
	foreach($results as $k => $value){
		$servicecontentlist[$k]['id']       = $value['id'];
		$servicecontentlist[$k]['typename'] = $value['typename'];
	}
	$huoniaoTag->assign('servicecontentlist', array_column($servicecontentlist, "typename"));
	$huoniaoTag->assign('servicecontentval', array_column($servicecontentlist, "id"));
	$huoniaoTag->assign('servicecontent', explode(",", $servicecontent));

	//分类
	include_once HUONIAOROOT."/api/handlers/pension.class.php";
	$pension = new pension();
	$pensionTypeList = $pension->catid_type();

	$huoniaoTag->assign('catidlist', array_column($pensionTypeList, "typename"));
	$huoniaoTag->assign('catidval', array_column($pensionTypeList, "id"));
	$huoniaoTag->assign('catid', $catid ? explode(",", $catid) : '');

	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('tag', explode(",", $tag));
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('station', $station);
	$huoniaoTag->assign('trans', $trans);
	$huoniaoTag->assign('explains', $explains);
	$huoniaoTag->assign('desc', $desc);
	$huoniaoTag->assign('visitday', $visitday);
	$huoniaoTag->assign('flag', $flag);
	$huoniaoTag->assign('award', $award);
	$huoniaoTag->assign('visitdaydesc', $visitdaydesc);
	$huoniaoTag->assign('awarddesc', $awarddesc);
	$huoniaoTag->assign('registration', $registration ? date("Y-m-d", $registration) : "");
	$huoniaoTag->assign('buildings', $buildings);
	$huoniaoTag->assign('landarea', $landarea);
	$huoniaoTag->assign('builtuparea', $builtuparea);
	$huoniaoTag->assign('roomarea', $roomarea);
	$huoniaoTag->assign('rooms', $rooms);
	$huoniaoTag->assign('bednums', $bednums);
	$huoniaoTag->assign('peoplenums', $peoplenums);
	$huoniaoTag->assign('ownedinstitutions', $ownedinstitutions);
	$huoniaoTag->assign('cooperativeinstitutions', $cooperativeinstitutions);
	$huoniaoTag->assign('diseases', $diseases);
	$huoniaoTag->assign('careservices', $careservices);
	$huoniaoTag->assign('lifeservice', $lifeservice);
	$huoniaoTag->assign('foodsituation', $foodsituation);
	$huoniaoTag->assign('othernotes', $othernotes);
	$huoniaoTag->assign('institutionadesc', $institutionadesc);
	$huoniaoTag->assign('longinstitutionadesc', $longinstitutionadesc);
	$huoniaoTag->assign('shortinstitutionadesc', $shortinstitutionadesc);
	$huoniaoTag->assign('homecaredesc', $homecaredesc);
	$huoniaoTag->assign('homecareagedesc', $homecareagedesc);
	$huoniaoTag->assign('residentialdesc', $residentialdesc);
	$huoniaoTag->assign('residentialagedesc', $residentialagedesc);
	$huoniaoTag->assign('rec', (int)$rec);
	$huoniaoTag->assign('rzprice', $rzprice);
	$huoniaoTag->assign('invite', $invite);

	$longexpensesArr = array();
	if(!empty($longexpenses)){
		$longexpenseses = explode("|||", $longexpenses);
		foreach ($longexpenseses as $k => $v) {
			$tr = explode("$$$", $v);
			$longexpensesArr[$k][0] = $tr[0];
			$longexpensesArr[$k][1] = $tr[1];
			$longexpensesArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('longexpensesArr', $longexpensesArr);

	$longbedfeeArr = array();
	if(!empty($longbedfee)){
		$longbedfees = explode("|||", $longbedfee);
		foreach ($longbedfees as $k => $v) {
			$tr = explode("$$$", $v);
			$longbedfeeArr[$k][0] = $tr[0];
			$longbedfeeArr[$k][1] = $tr[1];
			$longbedfeeArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('longbedfeeArr', $longbedfeeArr);

	$longotherfeesArr = array();
	if(!empty($longotherfees)){
		$longotherfees = explode("|||", $longotherfees);
		foreach ($longotherfees as $k => $v) {
			$tr = explode("$$$", $v);
			$longotherfeesArr[$k][0] = $tr[0];
			$longotherfeesArr[$k][1] = $tr[1];
			$longotherfeesArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('longotherfeesArr', $longotherfeesArr);

	$shortexpensesArr = array();
	if(!empty($shortexpenses)){
		$shortexpenses = explode("|||", $shortexpenses);
		foreach ($shortexpenses as $k => $v) {
			$tr = explode("$$$", $v);
			$shortexpensesArr[$k][0] = $tr[0];
			$shortexpensesArr[$k][1] = $tr[1];
			$shortexpensesArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('shortexpensesArr', $shortexpensesArr);

	$shortbedfeeArr = array();
	if(!empty($shortbedfee)){
		$shortbedfee = explode("|||", $shortbedfee);
		foreach ($shortbedfee as $k => $v) {
			$tr = explode("$$$", $v);
			$shortbedfeeArr[$k][0] = $tr[0];
			$shortbedfeeArr[$k][1] = $tr[1];
			$shortbedfeeArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('shortbedfeeArr', $shortbedfeeArr);

	$shortotherfeesArr = array();
	if(!empty($shortotherfees)){
		$shortotherfees = explode("|||", $shortotherfees);
		foreach ($shortotherfees as $k => $v) {
			$tr = explode("$$$", $v);
			$shortotherfeesArr[$k][0] = $tr[0];
			$shortotherfeesArr[$k][1] = $tr[1];
			$shortotherfeesArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('shortotherfeesArr', $shortotherfeesArr);

	$homecyfwArr = array();
	if(!empty($homecyfw)){
		$homecyfw = explode("|||", $homecyfw);
		foreach ($homecyfw as $k => $v) {
			$tr = explode("$$$", $v);
			$homecyfwArr[$k][0] = $tr[0];
			$homecyfwArr[$k][1] = $tr[1];
			$homecyfwArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('homecyfwArr', $homecyfwArr);

	$homezlhlArr = array();
	if(!empty($homezlhl)){
		$homezlhl = explode("|||", $homezlhl);
		foreach ($homezlhl as $k => $v) {
			$tr = explode("$$$", $v);
			$homezlhlArr[$k][0] = $tr[0];
			$homezlhlArr[$k][1] = $tr[1];
			$homezlhlArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('homezlhlArr', $homezlhlArr);

	$homejzfwArr = array();
	if(!empty($homejzfw)){
		$homejzfw = explode("|||", $homejzfw);
		foreach ($homejzfw as $k => $v) {
			$tr = explode("$$$", $v);
			$homejzfwArr[$k][0] = $tr[0];
			$homejzfwArr[$k][1] = $tr[1];
			$homejzfwArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('homejzfwArr', $homejzfwArr);

	$homejsgaArr = array();
	if(!empty($homejsga)){
		$homejsga = explode("|||", $homejsga);
		foreach ($homejsga as $k => $v) {
			$tr = explode("$$$", $v);
			$homejsgaArr[$k][0] = $tr[0];
			$homejsgaArr[$k][1] = $tr[1];
			$homejsgaArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('homejsgaArr', $homejsgaArr);

	$homejthdArr = array();
	if(!empty($homejthd)){
		$homejthd = explode("|||", $homejthd);
		foreach ($homejthd as $k => $v) {
			$tr = explode("$$$", $v);
			$homejthdArr[$k][0] = $tr[0];
			$homejthdArr[$k][1] = $tr[1];
			$homejthdArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('homejthdArr', $homejthdArr);

	$hometlfwArr = array();
	if(!empty($hometlfw)){
		$hometlfw = explode("|||", $hometlfw);
		foreach ($hometlfw as $k => $v) {
			$tr = explode("$$$", $v);
			$hometlfwArr[$k][0] = $tr[0];
			$hometlfwArr[$k][1] = $tr[1];
			$hometlfwArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('hometlfwArr', $hometlfwArr);

	$residentialbedfeeArr = array();
	if(!empty($residentialbedfee)){
		$residentialbedfee = explode("|||", $residentialbedfee);
		foreach ($residentialbedfee as $k => $v) {
			$tr = explode("$$$", $v);
			$residentialbedfeeArr[$k][0] = $tr[0];
			$residentialbedfeeArr[$k][1] = $tr[1];
			$residentialbedfeeArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('residentialbedfeeArr', $residentialbedfeeArr);

	$residentialcardArr = array();
	if(!empty($residentialcard)){
		$residentialcard = explode("|||", $residentialcard);
		foreach ($residentialcard as $k => $v) {
			$tr = explode("$$$", $v);
			$residentialcardArr[$k][0] = $tr[0];
			$residentialcardArr[$k][1] = $tr[1];
			$residentialcardArr[$k][2] = $tr[2];
		}
	}
	$huoniaoTag->assign('residentialcardArr', $residentialcardArr);

	$residentialotherfeesArr = array();
	if(!empty($residentialotherfees)){
		$residentialotherfees = explode("|||", $residentialotherfees);
		foreach ($residentialotherfees as $k => $v) {
			$tr = explode("$$$", $v);
			$residentialotherfeesArr[$k][0] = $tr[0];
			$residentialotherfeesArr[$k][1] = $tr[1];
			$residentialotherfeesArr[$k][2] = $tr[2];
			$residentialotherfeesArr[$k][3] = $tr[3];
			$residentialotherfeesArr[$k][4] = $tr[4];
			$residentialotherfeesArr[$k][5] = $tr[5];
		}
	}
	$huoniaoTag->assign('residentialotherfeesArr', $residentialotherfeesArr);

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
    $huoniaoTag->assign('refuse', $refuse);

	//店铺开关
	$huoniaoTag->assign('store_switchopt', array('0', '1'));
	$huoniaoTag->assign('store_switchnames',array('关闭','开启'));
	$huoniaoTag->assign('store_switch', $store_switch == "" ? 1 : $store_switch);

    $huoniaoTag->assign('advertisingopt', array('0', '1'));
    $huoniaoTag->assign('advertisingnames',array('显示','隐藏'));
    $huoniaoTag->assign('advertising', $is_vipguanggao == "" ? 0 : $is_vipguanggao);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pension";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
