<?php
/**
 * 添加招聘信息
 *
 * @version        $Id: jobPostAdd.php 2014-3-17 下午13:43:21 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobPostAdd.html";

$tab = "job_post";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改招聘信息";
	checkPurview("jobPostEdit");
}else{
	$pagetitle = "添加招聘信息";
	checkPurview("jobPostAdd");
}

if(empty($comid)) $comid = 0;
if(empty($sex)) $sex = 0;
if(empty($nature)) $nature = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = 1;
if(!empty($property)) $property = join(",", $property);
$pubdate = $pubdate ? GetMkTime($pubdate) : time();
$bole = (int)$bole;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入职位名称！"}';
		exit();
	}

	if(empty($type)){
		echo '{"state": 200, "info": "请选择职位类别！"}';
		exit();
	}

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择所属公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` = '".$company."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	if(empty($valid)){
		echo '{"state": 200, "info": "请选择有效期！"}';
		exit();
	}

	if(empty($number)){
		echo '{"state": 200, "info": "请输入招聘人数！"}';
		exit();
	}

	if(empty($experience)){
		echo '{"state": 200, "info": "请选择工作经验要求！"}';
		exit();
	}

	if(empty($educational)){
		echo '{"state": 200, "info": "请选择学历要求！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
    $cityid = getCityId() ?: 0;
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`,`title`, `type`, `company`, `nature`, `valid`, `number`, `experience`, `educational`, `note`, `claim`, `weight`, `click`, `state`, `pubdate`) VALUES ($cityid,'$title', '$type', '$comid', '$nature', '".GetMkTime($valid)."', '$number', '$experience', '$educational', '$note', '$claim', '$weight', '$click', '$state', '$pubdate')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		if($state == 1){
			clearCache("job_post_list", "key");
			clearCache("job_post_total", "key");
		}

		adminLog("添加招聘信息", $userid);

		$param = array(
			"service"  => "job",
			"template" => "job",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("job",$aid,"post");  // 新增职位
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
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `type` = '$type', `company` = '$comid', `nature` = '$nature', `valid` = '".GetMkTime($valid)."', `number` = '$number', `experience` = '$experience', `educational` = '$educational', `note` = '$note', `claim` = '$claim', `weight` = '$weight', `click` = '$click', `state` = '$state', `pubdate` = '$pubdate' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			// 清除缓存
			clearCache("job_post_detail", $id);
			checkCache("job_post_list", $id);
			if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
				clearCache("job_post_total", "key");
			}

			adminLog("修改招聘信息信息", $id);

			$param = array(
				"service"  => "job",
				"template" => "job",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("job",$id,"post");  // 修改职位信息
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

			$title       = $results[0]['title'];
			$type        = $results[0]['type'];
			$company     = $results[0]['company'];
			$sex         = $results[0]['sex'];
			$nature      = $results[0]['nature'];
			$valid       = $results[0]['valid'];
			$number      = $results[0]['number'];
			$addr        = $results[0]['addr'];
			$experience  = $results[0]['experience'];
			$educational = $results[0]['educational'];
			$language    = $results[0]['language'];
			$salary      = $results[0]['salary'];
			$note        = $results[0]['note'];
			$claim       = $results[0]['claim'];
			$tel         = $results[0]['tel'];
			$email       = $results[0]['email'];
			$weight      = $results[0]['weight'];
			$click       = $results[0]['click'];
			$state       = $results[0]['state'];
			$property    = $results[0]['property'];
            $cityid      = $results[0]['cityid'];
            $pubdate     = $results[0]['pubdate'];

			if($addr){
				$data = "";
				$typename = getParentArr("site_area", $addr);
				$address = join(" > ", array_reverse(parent_foreach($typename, "typename")));
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
		'publicAddr.js',
		'admin/job/jobPostAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);

	if($id != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('title', $title);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('company', $comname[0]['title']);

		$huoniaoTag->assign('valid', !empty($valid) ? date("Y-m-d", $valid) : "");
		$huoniaoTag->assign('number', $number);
		$huoniaoTag->assign('experience', $experience == "" ? 0 : $experience);
		$huoniaoTag->assign('educational', $educational == "" ? 0 : $educational);
		$huoniaoTag->assign('language', $language);
		$huoniaoTag->assign('salary', $salary);
		$huoniaoTag->assign('note', $note);
		$huoniaoTag->assign('claim', $claim);
		$huoniaoTag->assign('tel', $tel);
		$huoniaoTag->assign('email', $email);
		$huoniaoTag->assign('property', !empty($property) ? explode(",", $property) : "");
	}

	$huoniaoTag->assign('addr', empty($addr) ? 0 : $addr);
	$huoniaoTag->assign('address', empty($address) ? "选择区域" : $address);
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('type', empty($type) ? 0 : $type);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);

	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "jobaddr")));
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "job_type")));

	//性别限制
	$huoniaoTag->assign('sexopt', array('0', '1', '2'));
	$huoniaoTag->assign('sexnames',array('不限','男','女'));
	$huoniaoTag->assign('sex', empty($sex) ? 0 : $sex);

	//职位性质
    $archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 9 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
	$huoniaoTag->assign('natureopt', array_column($results,"id"));
	$huoniaoTag->assign('naturenames',array_column($results,"typename"));
	$huoniaoTag->assign('nature', empty($nature) ? 0 : $nature);

	//学历要求
	$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('educationalList', $list);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);


	$huoniaoTag->assign('weight', $weight);
	$huoniaoTag->assign('pubdate', date("Y-m-d H:i:s", ($pubdate ? $pubdate : time())));
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
