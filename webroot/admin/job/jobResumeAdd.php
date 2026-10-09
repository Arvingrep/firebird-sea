<?php
/**
 * 添加简历
 *
 * @version        $Id: jobResumeAdd.php 2014-3-17 下午22:54:18 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobResumeAdd.html";

$tab = "job_resume";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改简历";
	checkPurview("jobResumeEdit");
}else{
	$pagetitle = "添加简历";
	checkPurview("jobResumeAdd");
}

if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($salary)) $salary = 0;
if(empty($workyear)) $workyear = 0;
if(empty($graduation)) $graduation = 0;
if(empty($click)) $click = 0;
if(empty($workState)) $workState = 1;
$birth = empty($birth) ? 0 : GetMkTime($birth);
$graduation = empty($graduation) ? 0 : GetMkTime($graduation);
$name = $_POST['name'];

if($_POST['submit'] == "提交"){

	if(empty($postcode)) $postcode = 0;

	if($token == "") die('token传递失败！');

	//二次验证
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

	if(empty($name)){
		echo '{"state": 200, "info": "请输入简历名称！"}';
		exit();
	}

	if(empty($type)){
		echo '{"state": 200, "info": "请选择职业类别！"}';
		exit();
	}

	if(empty($phone)){
		echo '{"state": 200, "info": "请输入联系电话！"}';
		exit();
	}

	if(empty($email)){
		echo '{"state": 200, "info": "请输入联系邮箱！"}';
		exit();
	}

	//检测是否已经注册
	if($dopost == "save"){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经添加过简历，不可以重复添加！"}';
			exit();
		}

	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经添加过简历，不可以重复添加！"}';
			exit();
		}
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
    $cityid = getCityId();
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`skill`,`education`,`work_jl`,`cityid`,`userid`, `name`, `sex`, `nature`, `type`, `addr`, `birth`, `photo`, `phone`, `email`, `min_salary`,`max_salary`, `startWork`, `work_jy`, `edu_tallest`, `edu_school`, `edu_end`, `edu_profession`, `state`, `click`, `weight`, `pubdate`, `workState`) VALUES ('','','','$cityid', '$userid', '$name', '$sex', '$nature', '$type', '$addr', '$birth', '$litpic', '$phone', '$email', '$min_salary', '$max_salary','$startwork', '$work_jy', '$educational', '$edu_school', '$graduation', '$professional','$state', '$click', '$weight', '".GetMkTime(time())."', '$workState')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		if($state == 1){
			clearCache("job_resume_list", "key");
			clearCache("job_resume_total", "key");
		}

		adminLog("添加简历", $title);

		$param = array(
			"service"  => "job",
			"template" => "resume",
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

		$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($sql, "results");
		$state_ = $res[0]['state'];
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `userid` = '$userid', `name` = '$name', `sex` = '$sex', `nature` = '$nature', `type` = '$type', `addr` = '$addr', `birth` = '$birth', `photo` = '$litpic', `phone` = '$phone', `email` = '$email', `min_salary` = '$min_salary', `max_salary`='$max_salary', `startWork` = '$startwork', `edu_school` = '$edu_school', `work_jy` = '$work_jy', `state` = '$state', `click` = '$click', `weight` = '$weight', `workState` = '$workState' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			// 清除缓存
			clearCache("job_resume_detail", $id);
			// 取消审核
			if($state != 1 && $state_ == 1){
				checkCache("job_resume_list", $id);
				clearCache("job_resume_total", "key");
			}elseif($state == 1 && $state_ != 1){
				updateCache("job_resume_list", 300);
				clearCache("job_resume_total", "key");
			}

			adminLog("修改简历", $title);

			$param = array(
				"service"  => "job",
				"template" => "resume",
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

			$userid       = $results[0]['userid'];
			$name         = $results[0]['name'];
			$sex          = $results[0]['sex'];
			$nature       = $results[0]['nature'];
			$type         = $results[0]['type'];
			$addr         = $results[0]['addr'];
			$birth        = $results[0]['birth'];
			$photo        = $results[0]['photo'];
			$home         = $results[0]['home'];
			$address      = $results[0]['address'];
			$phone        = $results[0]['phone'];
			$email        = $results[0]['email'];
			$salary       = $results[0]['salary'];
			$startwork    = $results[0]['startWork'];
			$evaluation   = $results[0]['evaluation'];
			$objective    = $results[0]['objective'];
			$workyear     = $results[0]['workyear'];
			$experience   = $results[0]['experience'];
			$educational  = $results[0]['edu_tallest'];
			$edu_school      = $results[0]['edu_school'];
			$graduation   = $results[0]['edu_end'];
			$professional = $results[0]['edu_profession'];
			$language     = $results[0]['language'];
			$computer     = $results[0]['computer'];
			$education    = $results[0]['education'];
			$state        = $results[0]['state'];
			$click        = $results[0]['click'];
			$weight       = $results[0]['weight'];
			$gz           = $results[0]['gz'];
			$guanzhu      = $results[0]['guanzhu'];
			$fs           = $results[0]['fs'];
			$fensi        = $results[0]['fensi'];
            $cityid       = $results[0]['cityid'];
            $workState    = $results[0]['workState'];
            $work_jy    = $results[0]['work_jy'];
            $min_salary    = $results[0]['min_salary'];
            $max_salary    = $results[0]['max_salary'];

			if($addr){
				$data = "";
				$typename = getParentArr("site_area", $addr);
				$address_ = join(" > ", array_reverse(parent_foreach($typename, "typename")));
			}

			if($type){
				$data = "";
				$typename = getParentArr("job_type", $type);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));
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

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/job/jobResumeAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);

	global $cfg_photoSize;
	global $cfg_photoType;
	$huoniaoTag->assign('photoSize', $cfg_photoSize);
	$huoniaoTag->assign('photoType', "*.".str_replace("|", ";*.", $cfg_photoType));

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('name', $name);

	//性别
	$huoniaoTag->assign('sexopt', array('0', '1'));
	$huoniaoTag->assign('sexnames',array('男','女'));
	$huoniaoTag->assign('sex', $sex == "" ? 0 : $sex);

	//职位性质
    $huoniaoTag->assign('nature', $nature);
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 9 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('natureopt', array_column($results,"id"));
    $huoniaoTag->assign('naturenames',array_column($results,"typename"));


	$huoniaoTag->assign('type', empty($type) ? 0 : $type);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);

	$huoniaoTag->assign('addr', empty($addr) ? 0 : $addr);
	$huoniaoTag->assign('address_', empty($address_) ? "选择区域" : $address_);
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));

	$huoniaoTag->assign('birth', !empty($birth) ? date("Y-m-d", $birth) : "");
	$huoniaoTag->assign('litpic', $photo);
	$huoniaoTag->assign('home', $home);
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('phone', $phone);
	$huoniaoTag->assign('email', $email);

	//薪资范围
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('salaryList', $list);
	$huoniaoTag->assign('salary', $salary);

	//到岗时间
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 4 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('startworkList', $list);
	$huoniaoTag->assign('startwork', $startwork);

	$huoniaoTag->assign('evaluation', $evaluation);
	$huoniaoTag->assign('objective', $objective);
	$huoniaoTag->assign('workyear', $workyear);
	$huoniaoTag->assign('experience', $experience);

	//求职状态
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 11 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('workStateopt', array_column($results,"id"));
    $huoniaoTag->assign('workStatenames',array_column($results,"typename"));
	$huoniaoTag->assign('workState', $workState);

    //工作经验
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('work_jys', array_column($results,"id"));
    $huoniaoTag->assign('work_jynames',array_column($results,"typename"));
    $huoniaoTag->assign('work_jy', $work_jy);

    $huoniaoTag->assign('min_salary', $min_salary);
    $huoniaoTag->assign('max_salary', $max_salary);

	//学历要求
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('educationalList', $list);
	$huoniaoTag->assign('educational', $educational);

	$huoniaoTag->assign('edu_school', $edu_school);
	$huoniaoTag->assign('graduation', !empty($graduation) ? date("Y-m-d", $graduation) : "");
	$huoniaoTag->assign('professional', $professional);
	$huoniaoTag->assign('language', $language);
	$huoniaoTag->assign('computer', $computer);
	$huoniaoTag->assign('education', $education);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('weight', $weight);
	$huoniaoTag->assign('click', $click);

	if($dopost == "edit"){
		//关注
		if($gz > 0){
			$guanzhuArr = array();
			$guanzhu = explode(",", $guanzhu);
			foreach ($guanzhu as $key => $value) {
				$archives = $dsql->SetQuery("SELECT `id`, `name`, `photo` FROM `#@__".$tab."` WHERE `id` = ".$value);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$guanzhuArr[$key]['id'] = $results[0]['id'];
					$guanzhuArr[$key]['name'] = $results[0]['name'];
					$guanzhuArr[$key]['photo'] = $results[0]['photo'];
				}
			}
			$huoniaoTag->assign('guanzhu', $guanzhuArr);
		}
		$huoniaoTag->assign('gz', $gz);

		//粉丝
		if($fs > 0){
			$fensiArr = array();
			$fensi = explode(",", $fensi);
			foreach ($fensi as $key => $value) {
				$archives = $dsql->SetQuery("SELECT `id`, `name`, `photo` FROM `#@__".$tab."` WHERE `id` = ".$value);
				$results = $dsql->dsqlOper($archives, "results");
				if($results){
					$fensiArr[$key]['id'] = $results[0]['id'];
					$fensiArr[$key]['name'] = $results[0]['name'];
					$fensiArr[$key]['photo'] = $results[0]['photo'];
				}
			}
			$huoniaoTag->assign('fensi', $fensiArr);
		}
		$huoniaoTag->assign('fs', $fs);
	}

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
