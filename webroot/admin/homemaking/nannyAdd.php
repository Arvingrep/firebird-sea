<?php
/**
 * 添加保姆/月嫂
 *
 * @version        $Id: nannyAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "nannyAdd.html";

$tab = "homemaking_nanny";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改保姆/月嫂";
	checkPurview("nannyEdit");
}else{
	$pagetitle = "添加保姆/月嫂";
	checkPurview("nannyAdd");
}
if(empty($suc)) $suc = 0;
if(empty($comid)) $comid = 0;
if(empty($post)) $post = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($bond)) $bond = 0;
if(empty($click)) $click = mt_rand(50, 200);

if(!empty($nature)) $nature = join(",", $nature);
if(!empty($naturedesc)) $naturedesc = join(",", $naturedesc);
if(!empty($tag)) $tag = join(",", $tag);

if(empty($certifyState)) $certifyState = 0;
if(empty($healthcertifyState)) $healthcertifyState = 0;
if(empty($cookingcertifyState)) $cookingcertifyState = 0;

$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	//$type = (int)$type;

	//二次验证
	//if($type == 0){
		if($comid == 0 && trim($comid) == ''){
			echo '{"state": 200, "info": "请选择家政公司"}';
			exit();
		}
		if($comid == 0){
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `title` = '".$zjcom."'");
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
				exit();
			}
			$comid = $comResult[0]['id'];
		}else{
			$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `id` = ".$comid);
			$comResult = $dsql->dsqlOper($comSql, "results");
			if(!$comResult){
				echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
				exit();
			}
		}
	//}else{
		//$comid = 0;
		//$post = 0;
	//}

	/* if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员"}';
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
	} */

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_nanny` WHERE `username` = '".$username."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它家政公司，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_nanny` WHERE `username` = '".$username."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它家政公司，不可以重复添加！"}';
			exit();
		} */

	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`userid`, `username`, `company`, `tel`, `cityid`, `addrid`, `photo`, `age`, `place`, `education`, `nation`, `experience`, `servicenums`, `salary`, `nature`, `naturedesc`, `tag`, `cooking`, `watchbaby`, `watchold`, `watchcat`, `otherskills`, `idcardFront`, `idcardBack`, `certifyState`, `healthchart`, `healthcertifyState`, `cookingchart`, `cookingcertifyState`, `bond`, `click`, `weight`, `state`, `pubdate`) VALUES ('$userid', '$username', '$comid', '$tel', '$cityid', '$addrid', '$photo', '$age', '$place', '$education', '$nation', '$experience', '$servicenums', '$salary', '$nature', '$naturedesc', '$tag', '$cooking', '$watchbaby', '$watchold', '$watchcat', '$otherskills', '$idcardFront', '$idcardBack', '$certifyState', '$healthchart', '$healthcertifyState', '$cookingchart', '$cookingcertifyState', '$bond', '$click', '$weight', '$state', '$pubdate')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){
		adminLog("添加保姆/月嫂", $userid);
		if($state == 1){
			updateCache("homemaking_nanny_list", 300);
			clearCache("homemaking_nanny_total", 'key');
		}
		$param = array(
			"service"  => "homemaking",
			"template" => "nanny-detail",
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `userid` = '$userid', `username` = '$username', `company` = '$comid', `tel` = '$tel', `cityid` = '$cityid', `addrid` = '$addrid', `photo` = '$photo', `age` = '$age', `place` = '$place', `education` = '$education', `nation` = '$nation', `experience` = '$experience', `servicenums` = '$servicenums', `salary` = '$salary', `nature` = '$nature', `naturedesc` = '$naturedesc', `tag` = '$tag', `cooking` = '$cooking', `watchbaby` = '$watchbaby', `watchold` = '$watchold', `watchcat` = '$watchcat', `otherskills` = '$otherskills', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `certifyState` = '$certifyState', `healthchart` = '$healthchart', `healthcertifyState` = '$healthcertifyState', `cookingchart` = '$cookingchart', `cookingcertifyState` = '$cookingcertifyState', `bond` = '$bond', `click` = '$click', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改保姆/月嫂信息", $id);

			checkCache("homemaking_nanny_list", $id);
			clearCache("homemaking_nanny_detail", $id);
			clearCache("homemaking_nanny_total", 'key');

			$param = array(
				"service"  => "homemaking",
				"template" => "nanny-detail",
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
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/homemaking/nannyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/homemaking.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}

	$huoniaoTag->assign('username', $username ? $username : '');

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('userid', $userid);
		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('usernames', $username[0]['username']);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
		$huoniaoTag->assign('photo', $photo);
		$huoniaoTag->assign('idcardFront', $idcardFront);
		$huoniaoTag->assign('idcardBack', $idcardBack);
		$huoniaoTag->assign('healthchart', $healthchart);
		$huoniaoTag->assign('cookingchart', $cookingchart);
		
	}
	$huoniaoTag->assign('bond', $bond);
	$huoniaoTag->assign('age', $age);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('place', $place == "" ? 0 : $place);
	$huoniaoTag->assign('cooking', $cooking);
	$huoniaoTag->assign('watchbaby', $watchbaby);
	$huoniaoTag->assign('watchold', $watchold);
	$huoniaoTag->assign('watchcat', $watchcat);
	$huoniaoTag->assign('otherskills', $otherskills);
	$huoniaoTag->assign('servicenums', $servicenums);

	//学历
	$archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('educationalList', $list);
	$huoniaoTag->assign('education', $education);

	//民族
	$archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('nationList', $list);
	$huoniaoTag->assign('nation', $nation);

	//从业经验
	$archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('experienceList', $list);
	$huoniaoTag->assign('experience', $experience);

	//薪资范围
	/* $archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 4 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('salaryList', $list); */
	$huoniaoTag->assign('salary', $salary);

	//工作类型
	$natureList = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 5 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key=>$value){
			$natureList[$key]['id'] = $value['id'];
			$natureList[$key]['typename'] = $value['typename'];
		}
	}
	$huoniaoTag->assign('natureval', array_column($natureList, "id"));
	$huoniaoTag->assign('naturelist', array_column($natureList, "typename"));
	$huoniaoTag->assign('nature', explode(",", $nature));

	//工作内容
	$naturedescList = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__homemakingitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key=>$value){
			$naturedescList[$key]['id'] = $value['id'];
			$naturedescList[$key]['typename'] = $value['typename'];
		}
	}
	$huoniaoTag->assign('naturedescval', array_column($naturedescList, "id"));
	$huoniaoTag->assign('naturedesclist', array_column($naturedescList, "typename"));
	$huoniaoTag->assign('naturedesc', explode(",", $naturedesc));

	//属性
	$huoniaoTag->assign('taglist', array('金牌', '推荐'));
	$huoniaoTag->assign('tagval', array('0', '1'));
	$huoniaoTag->assign('tag', $tag == "" ? '' : explode(',', $tag));

	//实名认证
	$huoniaoTag->assign('certifyStateopt', array('0', '1', '2'));
	$huoniaoTag->assign('certifyStatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('certifyState', $certifyState == "" ? 1 : $certifyState);

	//健康证认证
	$huoniaoTag->assign('healthcertifyStateopt', array('0', '1', '2'));
	$huoniaoTag->assign('healthcertifyStatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('healthcertifyState', $healthcertifyState == "" ? 1 : $healthcertifyState);

	//厨师证认证
	$huoniaoTag->assign('cookingcertifyStateopt', array('0', '1', '2'));
	$huoniaoTag->assign('cookingcertifyStatenames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('cookingcertifyState', $cookingcertifyState == "" ? 1 : $cookingcertifyState);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
