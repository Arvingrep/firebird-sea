<?php
/**
 * 添加装修公司
 *
 * @version        $Id: renovationStoreAdd.php 2014-3-5 下午14:29:12 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationStoreAdd.html";

$tab = "renovation_store";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改装修公司";
	checkPurview("renovationStoreEdit");
}else{
	$pagetitle = "添加装修公司";
	checkPurview("renovationStoreAdd");
}

$safeguard = !empty($safeguard) ? $safeguard : 0;
if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($certi)) $certi = 0;
if(empty($license)) $license = 0;
if(empty($click)) $click = 0;
if(!empty($jiastyle)) $jiastyle = join(",", $jiastyle);
if(!empty($comstyle)) $comstyle = join(",", $comstyle);
if(!empty($style)) $style = join(",", $style);
if(!empty($property)) $property = join(",", $property);
$operPeriodb = empty($operPeriodb) ? 0 : GetMkTime($operPeriodb);
$operPeriode = empty($operPeriode) ? 0 : GetMkTime($operPeriode);
$founded = empty($founded) ? 0 : GetMkTime($founded);
$inspection = empty($inspection) ? 0 : GetMkTime($inspection);
if(empty($advertising)) $advertising =0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($company)){
		echo '{"state": 200, "info": "请输入公司名！"}';
		exit();
	}

	if($domaintype != 0){
		if(empty($domain)){
			echo '{"state": 200, "info": "请输入要绑定的域名！"}';
			exit();
		}

		//验证域名是否被使用
		if(!operaDomain('check', $domain, 'renovation', $tab, $id, GetMkTime($domainexp)))
		die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');
	}

	if(empty($addrid)){
		echo '{"state": 200, "info": "请选择所在区域！"}';
		exit();
	}

	if(empty($address)){
		echo '{"state": 200, "info": "请输入详细地址！"}';
		exit();
	}

	if(empty($litpic)){
		echo '{"state": 200, "info": "请上传公司logo！"}';
		exit();
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员名"}';
		exit();
	}
	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
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

	if(empty($people)){
		echo '{"state": 200, "info": "请输入联系人！"}';
		exit();
	}

	if(empty($contact)){
		echo '{"state": 200, "info": "请输入联系电话！"}';
		exit();
	}



	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `company` = '".$company."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已被注册，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它公司，一个会员不可以管理多个公司！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `company` = '".$company."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "公司名称已被注册，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它公司，一个会员不可以管理多个公司！"}';
			exit();
		}
	}

    $refuse = $state == 2 ? $refuse : '';

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `company`, `safeguard`, `domaintype`, `addrid`, `logo`, `userid`, `people`, `contact`, `qq`, `address`, `lnglat`, `range`, `jiastyle`, `comstyle`, `style`, `body`, `weight`, `click`, `state`, `certi`, `license`, `property`, `certs`, `storetemp`, `seotitle`, `keywords`, `description`, `pubdate`, `scale`, `afterService`, `initDesign`, `initBudget`, `detaDesign`, `detaBudget`, `material`, `normative`, `speService`, `comType`, `regFunds`, `operPeriodb`, `operPeriode`, `founded`, `authority`, `operRange`, `inspection`, `regnumber`, `legalPer`,`wechat`,`website`,`is_vipguanggao`, `refuse`) VALUES ('$cityid', '$company', '$safeguard', '$domaintype', '$addrid', '$litpic', '$userid', '$people', '$contact', '$qq', '$address', '$lnglat', '$range', '$jiastyle', '$comstyle', '$style', '$body', '$weight', '$click', '$state', '$certi', '$license', '$property', '$imglist', '$storetemp', '$seotitle', '$keywords', '$description', '".GetMkTime(time())."', '$scale', '$afterService', '$initDesign', '$initBudget', '$detaDesign', '$detaBudget', '$material', '$normative', '$speService', '$comType', '$regFunds', '$operPeriodb', '$operPeriode', '$founded', '$authority', '$operRange', '$inspection', '$regnumber', '$legalPer','$wechat','$website','$advertising', '$refuse')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		//域名操作
		operaDomain('update', $domain, 'renovation', $tab, $aid, GetMkTime($domainexp), $domaintip);

		adminLog("添加装修公司", $title);

		$param = array(
			"service"     => "renovation",
			"template"    => "company-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);
		dataAsync("renovation",$aid,"store");  // 装修门户、商店、新增
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;

//获取地址信息
}elseif($dopost == "getAddr"){
	echo json_encode($dsql->getTypeList(0, "renovationaddr", false));
	die;

}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `company` = '$company', `safeguard` = '$safeguard', `domaintype` = '$domaintype', `addrid` = '$addrid', `logo` = '$litpic', `userid` = '$userid', `people` = '$people', `contact` = '$contact', `qq` = '$qq', `address` = '$address', `lnglat` = '$lnglat', `range` = '$range', `jiastyle` = '$jiastyle', `comstyle` = '$comstyle', `style` = '$style', `body` = '$body', `weight` = '$weight', `click` = '$click', `state` = '$state', `certi` = '$certi', `license` = '$license', `property` = '$property', `certs` = '$imglist', `storetemp` = '$storetemp', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description', `scale` = '$scale', `afterService` = '$afterService', `initDesign` = '$initDesign', `initBudget` = '$initBudget', `detaDesign` = '$detaDesign', `detaBudget` = '$detaBudget', `material` = '$material', `normative` = '$normative', `speService` = '$speService', `comType` = '$comType', `regFunds` = '$regFunds', `operPeriodb` = '$operPeriodb', `operPeriode` = '$operPeriode', `founded` = '$founded', `authority` = '$authority', `operRange` = '$operRange', `inspection` = '$inspection', `regnumber` = '$regnumber', `legalPer` = '$legalPer', `wechat` = '$wechat',`website` = '$website',`is_vipguanggao` = '$advertising', `refuse` = '$refuse' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			operaDomain('update', $domain, 'renovation', $tab, $id, GetMkTime($domainexp), $domaintip);

			adminLog("修改装修公司", $title);

			$param = array(
				"service"     => "renovation",
				"template"    => "company-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);
            dataAsync("renovation",$id,"store");  // 装修门户、商店、修改
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

			$company     = $results[0]['company'];
			$safeguard   = $results[0]['safeguard'];
			$domaintype  = $results[0]['domaintype'];
			//获取域名信息
			$domainInfo = getDomain('renovation', $tab, $id);
			$domain      = $domainInfo['domain'];
			$domainexp   = $domainInfo['expires'];
			$domaintip   = $domainInfo['note'];
			$addrid      = $results[0]['addrid'];
			$logo        = $results[0]['logo'];
			$userid      = $results[0]['userid'];
			$people      = $results[0]['people'];
			$contact     = $results[0]['contact'];
			$qq          = $results[0]['qq'];
			$address     = $results[0]['address'];
			$lnglat      = $results[0]['lnglat'];
			$range       = $results[0]['range'];
			$jiastyle    = $results[0]['jiastyle'];
			$comstyle    = $results[0]['comstyle'];
			$style       = $results[0]['style'];
			$body        = $results[0]['body'];
			$weight      = $results[0]['weight'];
			$click       = $results[0]['click'];
			$state       = $results[0]['state'];
			$refuse      = $results[0]['refuse'];
			$certi       = $results[0]['certi'];
			$license     = $results[0]['license'];
			$property    = $results[0]['property'];
			$certs       = $results[0]['certs'];
			$storetemp   = $results[0]['storetemp'];
			$seotitle    = $results[0]['seotitle'];
			$keywords    = $results[0]['keywords'];
			$description = $results[0]['description'];
			$scale        = $results[0]['scale'];
			$afterService = $results[0]['afterService'];
			$initDesign   = $results[0]['initDesign'];
			$initBudget   = $results[0]['initBudget'];
			$detaDesign   = $results[0]['detaDesign'];
			$detaBudget   = $results[0]['detaBudget'];
			$material     = $results[0]['material'];
			$normative    = $results[0]['normative'];
			$speService   = $results[0]['speService'];
			$comType      = $results[0]['comType'];
			$regFunds     = $results[0]['regFunds'];
			$operPeriodb  = $results[0]['operPeriodb'];
			$operPeriode  = $results[0]['operPeriode'];
			$founded      = $results[0]['founded'];
			$authority    = $results[0]['authority'];
			$operRange    = $results[0]['operRange'];
			$inspection   = $results[0]['inspection'];
			$regnumber    = $results[0]['regnumber'];
			$legalPer     = $results[0]['legalPer'];
			$cityid       = $results[0]['cityid'];
			$website      = $results[0]['website'];
			$wechat       = $results[0]['wechat'];
			$advertising  = $results[0]['is_vipguanggao'];

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
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/renovation/renovationStoreAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/renovation.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
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
	$huoniaoTag->assign('mapCity', $cfg_mapCity);
	$huoniaoTag->assign('basehost', $cfg_basehost);

	//获取域名信息
	$domainInfo = getDomain('house', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('company', $company);
	$huoniaoTag->assign('safeguard', $safeguard);

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

	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "renovationaddr")));
	$huoniaoTag->assign('litpic', $logo);
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('lnglat', $lnglat);

	$huoniaoTag->assign('range', $range);

	$rangeSelected = "";
	if(!empty($range)){
		$range = explode(",", $range);
		foreach($range as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovationaddr` WHERE `id` = $val");
			$results = $dsql->dsqlOper($archives, "results");
			$name = $results ? $results[0]['typename'] : "";
			$rangeSelected .= '<span data-id="'.$val.'">'.$name.'<a href="javascript:;">×</a></span>';
		}
	}
	$huoniaoTag->assign('rangeSelected', $rangeSelected);

	//家庭装修
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$jiastylelist = array();
	$jiastyleval  = array();
	foreach($results as $value){
		array_push($jiastylelist, $value['typename']);
		array_push($jiastyleval, $value['id']);
	}
	$huoniaoTag->assign('jiastylelist', $jiastylelist);
	$huoniaoTag->assign('jiastyleval', $jiastyleval);
	$huoniaoTag->assign('jiastyle', explode(",", $jiastyle));

	//商业装修
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$comstylelist = array();
	$comstyleval  = array();
	foreach($results as $value){
		array_push($comstylelist, $value['typename']);
		array_push($comstyleval, $value['id']);
	}
	$huoniaoTag->assign('comstylelist', $comstylelist);
	$huoniaoTag->assign('comstyleval', $comstyleval);
	$huoniaoTag->assign('comstyle', explode(",", $comstyle));

	//装修风格
	$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_type` WHERE `parentid` = 4 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$stylelist = array();
	$styleval  = array();
	foreach($results as $value){
		array_push($stylelist, $value['typename']);
		array_push($styleval, $value['id']);
	}
	$huoniaoTag->assign('stylelist', $stylelist);
	$huoniaoTag->assign('styleval', $styleval);
	$huoniaoTag->assign('style', explode(",", $style));

	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('click', $click == "" ? "1" : $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
    $huoniaoTag->assign('refuse', $refuse);

	//认证
	$huoniaoTag->assign('certiopt', array('0', '1', '2'));
	$huoniaoTag->assign('certinames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('certi', $certi == "" ? 1 : $certi);

	//营业执照认证
	$huoniaoTag->assign('licenseopt', array('0', '1', '2'));
	$huoniaoTag->assign('licensenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('license', $license == "" ? 1 : $license);

	//属性
	$huoniaoTag->assign('propertylist', array(1 => '推荐'));
	$huoniaoTag->assign('propertyval', array(1 => 'r'));
	$huoniaoTag->assign('property', explode(",", $property));

	$huoniaoTag->assign('certs', $certs);

	//店铺模板
	$floders = listDir("../../templates/store/renovation");
	$skins = array("请选择");
	if(!empty($floders)){
		foreach($floders as $key => $floder){
			array_push($skins, $floder);
		}
	}
	$huoniaoTag->assign('storetemp', $skins);
	$huoniaoTag->assign('storetempSelected', $storetemp);

	//企业类型
	$huoniaoTag->assign('comType', array(
		0 => '请选择',
		1 => '国有企业',
		2 => '集体所有制',
		3 => '私营企业',
		4 => '股份制企业',
		5 => '有限责任公司',
		6 => '联营企业',
		7 => '外商投资企业',
		8 => '港、澳、台',
		9 => '股份合作企业'
	));
	$huoniaoTag->assign('comTypeSelected', $comType);

	$huoniaoTag->assign('operPeriodb', $operPeriodb == 0 ? "" : date("Y-m-d", $operPeriodb));
	$huoniaoTag->assign('operPeriode', $operPeriode == 0 ? "" : date("Y-m-d", $operPeriode));
	$huoniaoTag->assign('founded', $founded == 0 ? "" : date("Y-m-d", $founded));
	$huoniaoTag->assign('inspection', $inspection == 0 ? "" : date("Y-m-d", $inspection));

	$huoniaoTag->assign('scale', $scale);
	$huoniaoTag->assign('afterService', $afterService);
	$huoniaoTag->assign('initDesign', $initDesign);
	$huoniaoTag->assign('initBudget', $initBudget);
	$huoniaoTag->assign('detaDesign', $detaDesign);
	$huoniaoTag->assign('detaBudget', $detaBudget);
	$huoniaoTag->assign('material', $material);
	$huoniaoTag->assign('normative', $normative);
	$huoniaoTag->assign('speService', $speService);
	$huoniaoTag->assign('regFunds', $regFunds);
	$huoniaoTag->assign('authority', $authority);
	$huoniaoTag->assign('operRange', $operRange);
	$huoniaoTag->assign('regnumber', $regnumber);
	$huoniaoTag->assign('legalPer', $legalPer);

	$huoniaoTag->assign('wechat', $wechat);
	$huoniaoTag->assign('website', $website);

	$huoniaoTag->assign('seotitle', $seotitle);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);

    $huoniaoTag->assign('advertisingopt', array('0', '1'));
    $huoniaoTag->assign('advertisingnames',array('显示','隐藏'));
    $huoniaoTag->assign('advertising', $advertising == "" ? 0 : $advertising);
    
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
