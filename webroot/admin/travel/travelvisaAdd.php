<?php
/**
 * 添加旅游签证
 *
 * @version        $Id: travelvisaAdd.php 2019-03-14 下午13:18:13 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelvisaAdd.html";

$tab = "travel_visa";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改旅游签证";
	checkPurview("travelvisaEdit");
}else{
	$pagetitle = "添加旅游签证";
	checkPurview("travelvisaAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(!empty($incumbents)) $incumbents = join(",", $incumbents);
if(!empty($retiree)) $retiree = join(",", $retiree);
if(!empty($professional)) $professional = join(",", $professional);
if(!empty($students)) $students = join(",", $students);
if(!empty($children)) $children = join(",", $children);
$earliestdate = GetMkTime($earliestdate);
$pubdate = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
    //表单二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入旅游签证名称！"}';
		exit();
	}

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择所属店铺"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "所属店铺不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "所属店铺不存在，请在联想列表中选择"}';
			exit();
		}
	}

}

if($dopost == "save" && $submit == "提交"){

	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`company`, `title`, `subtitle`, `country`, `typeid`, `price`, `entrytimes`, `staytimes`, `earliestdate`, `valid`, `processingtime`, `pics`, `video`, `scope`, `materials`, `serviceincludes`, `incumbentsscience`, `retireescience`, `professionalscience`, `studentsscience`, `others`, `reminder`, `notice`, `processingflow`, `click`, `pubdate`, `weight`, `state`) VALUES ('$comid', '$title', '$subtitle', '$country', '$typeid', '$price', '$entrytimes', '$staytimes', '$earliestdate', '$valid', '$processingtime', '$pics', '$video', '$scope', '$materials', '$serviceincludes', '$incumbentsscience', '$retireescience', '$professionalscience', '$studentsscience', '$others', '$reminder', '$notice', '$processingflow', '$click', '$pubdate', '$weight', '$state')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		//域名操作
		//operaDomain('update', $domain, 'travel', $tab, $aid, GetMkTime($domainexp), $domaintip);
		if($state == 1){
			updateCache("travel_visa_list", 300);
			clearCache("travel_visa_total", 'key');
		}
		$param = array(
			"service"     => "travel",
			"template"    => "visa-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加旅游签证信息", $title);
		dataAsync("travel",$aid,"visa");  // 新增旅游签证
		echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").', "url": "'.$url.'"}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `company` = '$comid', `title` = '$title', `subtitle` = '$subtitle', `country` = '$country', `typeid` = '$typeid', `price` = '$price', `entrytimes` = '$entrytimes', `staytimes` = '$staytimes', `earliestdate` = '$earliestdate', `valid` = '$valid', `processingtime` = '$processingtime', `pics` = '$pics', `video` = '$video', `scope` = '$scope', `materials` = '$materials', `serviceincludes` = '$serviceincludes', `incumbentsscience` = '$incumbentsscience', `retireescience` = '$retireescience', `professionalscience` = '$professionalscience', `studentsscience` = '$studentsscience', `childrenscience` = '$childrenscience', `others` = '$others', `reminder` = '$reminder', `notice` = '$notice', `processingflow` = '$processingflow', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			//operaDomain('update', $domain, 'travel', $tab, $id, GetMkTime($domainexp), $domaintip);

			// 检查缓存
			checkCache("travel_visa_list", $id);
			clearCache("travel_visa_total", 'key');
			clearCache("travel_visa_detail", $id);

			$param = array(
				"service"     => "travel",
				"template"    => "visa-detail",
				"id"          => $id
			);
			$url = getUrlPath($param);

			adminLog("修改旅游签证信息", $title);
            dataAsync("travel",$id,"visa");  // 更新旅游签证
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/travel/travelvisaAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/travel.inc.php");
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
	$huoniaoTag->assign('atlasMax', $custom_travelstrategy_atlasMax ? $custom_travelstrategy_atlasMax : 9);

	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('subtitle', $subtitle);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('entrytimes', $entrytimes);
	$huoniaoTag->assign('staytimes', $staytimes);
	$huoniaoTag->assign('video', $video);
	$huoniaoTag->assign('earliestdate', $earliestdate ? date("Y-m-d", $earliestdate) : '');
	$huoniaoTag->assign('valid', $valid);
	$huoniaoTag->assign('processingtime', $processingtime);
	$huoniaoTag->assign('scope', $scope);
	$huoniaoTag->assign('materials', $materials);
	$huoniaoTag->assign('serviceincludes', $serviceincludes);
	$huoniaoTag->assign('others', $others);
	$huoniaoTag->assign('reminder', $reminder);
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('sale', $sale);

	$processingflowArr = array();
	if(!empty($processingflow)){
		$processingflow = explode("|||", $processingflow);
		foreach ($processingflow as $key => $value) {
			$val = explode("$$$", $value);
			$processingflowArr[$key]['title'] = $val[0];
			$processingflowArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('processingflow', $processingflowArr);

	//在职人员

	$incumbentsscienceArr = array();
	if(!empty($incumbentsscience)){
		$incumbentsscience = explode("|||", $incumbentsscience);
		foreach ($incumbentsscience as $key => $value) {
			$val = explode("$$$", $value);
			$incumbentsscienceArr[$key]['title'] = $val[0];
			$incumbentsscienceArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('incumbentsscience', $incumbentsscienceArr);

	//退休
	$retireescienceArr = array();
	if(!empty($retireescience)){
		$retireescience = explode("|||", $retireescience);
		foreach ($retireescience as $key => $value) {
			$val = explode("$$$", $value);
			$retireescienceArr[$key]['title'] = $val[0];
			$retireescienceArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('retireescience', $retireescienceArr);

	//自由职业
	$professionalscienceArr = array();
	if(!empty($professionalscience)){
		$professionalscience = explode("|||", $professionalscience);
		foreach ($professionalscience as $key => $value) {
			$val = explode("$$$", $value);
			$professionalscienceArr[$key]['title'] = $val[0];
			$professionalscienceArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('professionalscience', $professionalscienceArr);

	//学生
	$studentsscienceArr = array();
	if(!empty($studentsscience)){
		$studentsscience = explode("|||", $studentsscience);
		foreach ($studentsscience as $key => $value) {
			$val = explode("$$$", $value);
			$studentsscienceArr[$key]['title'] = $val[0];
			$studentsscienceArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('studentsscience', $studentsscienceArr);

	//儿童
	$childrenscienceceArr = array();
	if(!empty($studentsscience)){
		$childrenscience = explode("|||", $childrenscience);
		foreach ($childrenscience as $key => $value) {
			$val = explode("$$$", $value);
			$childrenscienceceArr[$key]['title'] = $val[0];
			$childrenscienceceArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('childrenscience', $childrenscienceceArr);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__travel_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);

        $huoniaoTag->assign('country', $country);
        $countrySql  = $dsql->SetQuery("SELECT `typename` FROM `#@__travel_visacountrytype` WHERE `id` = ". $country);
        $countryname = $dsql->getTypeName($countrySql);

		//分类
        $huoniaoTag->assign('typeid', $typeid);
        $typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__travel_visatype` WHERE `id` = ". $typeid);
        $typename = $dsql->getTypeName($typeSql);

	}
	$huoniaoTag->assign('typename', $typename[0]["typename"] ?  $typename[0]["typename"] : '请选择类型');
	$huoniaoTag->assign('countryname', $countryname[0]["typename"] ?  $countryname[0]["typename"] : '请选择国家');
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('weight',  empty($weight) ? "1" : $weight);
	$huoniaoTag->assign('click', $click);

	$commonList = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__travelitem`  ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key=>$value){
			$commonList[$key]['id'] = $value['id'];
			$commonList[$key]['typename'] = $value['typename'];
		}
	}
	$huoniaoTag->assign('common_val', array_column($commonList, "id"));
	$huoniaoTag->assign('common_name', array_column($commonList, "typename"));
	$huoniaoTag->assign('incumbents', $incumbents ? explode(",", $incumbents) : array());
	$huoniaoTag->assign('retiree', $retiree ? explode(",", $retiree) : array());
	$huoniaoTag->assign('professional', $professional ? explode(",", $professional) : array());
	$huoniaoTag->assign('students', $students ? explode(",", $students) : array());
	$huoniaoTag->assign('children', $incumbents ? explode(",", $children) : array());

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//签证开关
	$huoniaoTag->assign('store_switchopt', array('0', '1'));
	$huoniaoTag->assign('store_switchnames',array('关闭','开启'));
	$huoniaoTag->assign('store_switch', $store_switch == "" ? 1 : $store_switch);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('countryListArr', json_encode($dsql->getTypeList(0, "travel_visacountrytype")));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "travel_visatype")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
