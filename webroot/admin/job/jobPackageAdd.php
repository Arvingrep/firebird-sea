<?php
/**
 * 添加招聘企业
 *
 * @version        $Id: jobCompanyAdd.php 2014-3-17 上午09:07:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobPackageAdd.html";

$tab = "job_package";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改招聘企业";
	checkPurview("jobCompanyEdit");
}else{
	$pagetitle = "添加招聘企业";
	checkPurview("jobCompanyAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
$weight = (int)$weight;
if(empty($state)) $state = 0;
if(!empty($property)) $property = join(",", $property);
if(!empty($welfare)) $welfare = join(",", $welfare);

if($_POST['submit'] == "提交"){

	if(empty($postcode)) $postcode = 0;

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入增值包名称！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
    //保存到数据库中
    $type = (int)$type;
    $mprice = (float)$mprice;
    $price = (float)$price;
    $recommand = (int)$recommand;
    $job = (int)$job;
    $resume = (int)$resume;
    $refresh = (int)$refresh;
    $top = (int)$top;
    $buy = (int)$buy;
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`type`, `mprice`, `price`, `recommand`, `title`, `job`, `resume`, `refresh`, `top`, `buy`) VALUES ('$type', '$mprice', '$price', '$recommand', '$title', '$job', '$resume', '$refresh', '$top', '$buy') ");
	//echo $archives;die;
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){
		$param = array(
			"service"  => "job",
			"template" => "company",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加招聘增值包", $title);
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `type` = '$type', `mprice` = '$mprice', `price` = '$price', `recommand` = '$recommand', `title` = '$title', `job` = '$job', `resume` = '$resume', `refresh` = '$refresh', `top` = '$top', `buy` = '$buy' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			$param = array(
				"service"  => "job",
				"template" => "company",
				"id"       => $id
			);
			$url = getUrlPath($param);

			adminLog("修改招聘增值包", $title);
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

			$title       = $results[0]['title'];
			$type       = $results[0]['type'];
			$mprice       = $results[0]['mprice'];
			$price       = $results[0]['price'];
			$recommand       = $results[0]['recommand'];
			$title       = $results[0]['title'];
			$job       = $results[0]['job'];
			$resume       = $results[0]['resume'];
			$refresh       = $results[0]['refresh'];
			$top       = $results[0]['top'];
			$buy       = $results[0]['buy'];


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
		'publicUpload.js',
		'publicAddr.js',
		'admin/job/jobPackageAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/job.inc.php");
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
	$domainInfo = getDomain('job', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('type', $type ?: 1);
	$huoniaoTag->assign('typenames', array("组合包","职位包","简历包","置顶包","刷新包"));
	$huoniaoTag->assign('types', array(1,2,3,4,5));
	$huoniaoTag->assign('mprice', $mprice);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('recommand', $recommand ?: 0);
	$huoniaoTag->assign('recommands', array(0,1));
	$huoniaoTag->assign('recommandnames', array("默认","推荐"));
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('job', $job);
	$huoniaoTag->assign('resume', $resume);
	$huoniaoTag->assign('refresh', $refresh);
	$huoniaoTag->assign('top', $top);
	$huoniaoTag->assign('buy', $buy);

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

	//公司性质
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 5 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('natureList', $list);
	$huoniaoTag->assign('nature', $nature == "" ? 0 : $nature);

	//公司规模
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('scaleList', $list);
	$huoniaoTag->assign('scale', $scale == "" ? 0 : $scale);

	//经营行业
	$huoniaoTag->assign('industry', $industry == "" ? 0 : $industry);
	$huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "job_industry")));

	$huoniaoTag->assign('litpic', $logo);

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('contact', $contact);

	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);

	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('lnglat', $lnglat);
	$huoniaoTag->assign('postcode', empty($postcode) ? "" : $postcode);
	$huoniaoTag->assign('email', $email);
	$huoniaoTag->assign('site', $site);
	$huoniaoTag->assign('body', $body);

	$huoniaoTag->assign('picsList', '[]');
	if(!empty($pics)){
		$picsArr = array();
		$pics = explode("###", $pics);
		foreach ($pics as $key => $value) {
			$val = explode("||", $value);
			$picsArr[$key] = $val;
		}
		$huoniaoTag->assign('picsList', json_encode($picsArr));
	}

	$huoniaoTag->assign('weight', $weight);

    $huoniaoTag->assign('cityid', $cityid);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//审核状态
    $huoniaoTag->assign('cerState', array('0', '1'));
    $huoniaoTag->assign('cerNames',array('待认证','认证通过'));
    $huoniaoTag->assign('cerCheck', $certification);

	//属性
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $propertyVal = array_column($results,'id');
	$huoniaoTag->assign('propertyVal',$propertyVal);
    $propertyList = array_column($results,'typename');
	$huoniaoTag->assign('propertyList',$propertyList);
	$huoniaoTag->assign('property', !empty($property) ? explode(",", $property) : "");

	//公司福利
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 7 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $welfareKeys = array_column($results,'id');
    $huoniaoTag->assign('welfareKeys', $welfareKeys);
    $welfareList = array_column($results,'typename');
    $huoniaoTag->assign('welfareList', $welfareList);
    $huoniaoTag->assign('welfare', !empty($welfare) ? explode(",",$welfare) : "");

    $huoniaoTag->assign('business_license', $business_license);
    $huoniaoTag->assign('enterprise_people', $enterprise_people);
    $huoniaoTag->assign('enterprise_type', $enterprise_type);
    $huoniaoTag->assign('full_name', $full_name);
    $huoniaoTag->assign('enterprise_establish', $enterprise_establish);
    $huoniaoTag->assign('full_name', $full_name);
    $huoniaoTag->assign('enterprise_money', $enterprise_money);
    $huoniaoTag->assign('enterprise_code', $enterprise_code);
    $huoniaoTag->assign('changeState', $changeState);
    $huoniaoTag->assign('changeContent', $changeContent ? json_decode($changeContent,true) : array());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
