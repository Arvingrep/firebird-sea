<?php
/**
 * 添加教育店铺
 *
 * @version        $Id: educationstoreAdd.php 2019-03-14 下午13:18:13 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "storeAdd.html";

$tab = "education_store";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改教育店铺";
	checkPurview("educationstoreEdit");
}else{
	$pagetitle = "添加教育店铺";
	checkPurview("educationstoreAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($rec)) $rec = 0;
if(!empty($tag)) $tag = join(",", $tag);
if(empty($click)) $click = mt_rand(50, 200);
if(empty($advertising)) $advertising =0;

if(!empty($lnglat)){
	$lnglatArr = explode(',', $lnglat);
	$lng = $lnglatArr[0];
	$lat = $lnglatArr[1];
}

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
		echo '{"state": 200, "info": "请输入教育店铺名称！"}';
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
		echo '{"state": 200, "info": "请输入教育店铺联系电话！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入教育店铺联系地址！"}';
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
			echo '{"state": 200, "info": "此会员已授权管理其它教育店铺，一个会员不可以管理多个教育店铺！"}';
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
			echo '{"state": 200, "info": "此会员已授权管理其它教育店铺，一个会员不可以管理多个教育店铺！"}';
			exit();
		}
	}

    $refuse = $state == 2 ? $refuse : '';

}

if($dopost == "save" && $submit == "提交"){

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`flag`, `cityid`, `title`, `userid`, `addrid`, `address`, `lng`, `lat`, `tel`, `pics`,  `click`, `pubdate`, `weight`, `state`, `tag`,`taglist`,`rec`, `body`,`is_vipguanggao`, `refuse`) VALUES ('$flag', '$cityid', '$title', '$userid', '$addrid', '$address', '$lng', '$lat', '$tel', '$pics', '$click', '$pubdate', '$weight', '$state', '$tag', '$taglist','$rec', '$body','$advertising', '$refuse')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		//域名操作
		//operaDomain('update', $domain, 'education', $tab, $aid, GetMkTime($domainexp), $domaintip);
		if($state == 1){
			updateCache("education_store_list", 300);
			clearCache("education_store_total", 'key');
		}
		$param = array(
			"service"     => "education",
			"template"    => "store-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加教育店铺信息", $title);
		dataAsync("education",$aid,"store");  // 新增
		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").', "url": "'.$url.'"}';
	}
	die;
}elseif($dopost == "edit"){
	if (is_array($tag)) {
		$tag=implode(",", $tag);
	}
	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `flag` = '$flag', `cityid` = '$cityid', `title` = '$title', `userid` = '$userid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `tel` = '$tel', `pics` = '$pics', `click` = '$click', `weight` = '$weight', `state` = '$state', `rec` = '$rec', `tag` = '$tag',`taglist` = '$taglist',`body` = '$body',`is_vipguanggao` = '$advertising', `refuse` = '$refuse' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			//operaDomain('update', $domain, 'education', $tab, $id, GetMkTime($domainexp), $domaintip);

			// 检查缓存
			checkCache("education_store_list", $id);
			clearCache("education_store_total", 'key');
			clearCache("education_store_detail", $id);

			$param = array(
				"service"     => "education",
				"template"    => "store-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);
            dataAsync("education",$id,"store");  // 修改

			adminLog("修改教育店铺信息", $title);
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
			$tag       = $results[0]['tag'];

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
		'admin/education/storeAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/education.inc.php");
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


	//学习方向
	$archives = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__education_type` ORDER BY `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$tagslist = array();
	$tagsval  = array();
	foreach($results as $value){
		array_push($tagslist, $value['typename']);
		array_push($tagsval, $value['id']);
	}
	$huoniaoTag->assign('tagslist', $tagslist);
	$huoniaoTag->assign('taglist', $taglist);
	$huoniaoTag->assign('tagsval', $tagsval);
	$tag = explode(",", $tag);
	$huoniaoTag->assign('tag', $tag);

	//获取域名信息
	$domainInfo = getDomain('education', 'config');
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

	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('tag', $tag);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('address', $address);
    $huoniaoTag->assign('cityid', (int)$cityid);
    $huoniaoTag->assign('rec', (int)$rec);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('body', $body);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
    $huoniaoTag->assign('refuse', $refuse);

	//属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('flag', $flag == "" ? 1 : $flag);

	//店铺开关
	$huoniaoTag->assign('store_switchopt', array('0', '1'));
	$huoniaoTag->assign('store_switchnames',array('关闭','开启'));
	$huoniaoTag->assign('store_switch', $store_switch == "" ? 1 : $store_switch);

    $huoniaoTag->assign('advertisingopt', array('0', '1'));
    $huoniaoTag->assign('advertisingnames',array('显示','隐藏'));
    $huoniaoTag->assign('advertising', $is_vipguanggao == "" ? 0 : $is_vipguanggao);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
