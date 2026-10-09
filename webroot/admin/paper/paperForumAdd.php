<?php
/**
 * 添加报刊版面
 *
 * @version        $Id: paperForumAdd.php 2014-3-15 下午23:16:18 $
 * @package        HuoNiao.Paper
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/paper";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paperForumAdd.html";

$tab = "paper_forum";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改报刊版面";
	checkPurview("paperForumEdit");
}else{
	$pagetitle = "添加报刊版面";
	checkPurview("paperForumAdd");
}

if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($company)){
		echo '{"state": 200, "info": "请选择所属报刊！"}';
		exit();
	}

	if(empty($date)){
		echo '{"state": 200, "info": "请选择报刊日期！"}';
		exit();
	}

	if(empty($title)){
		echo '{"state": 200, "info": "请输入版面名称！"}';
		exit();
	}

	if(empty($litpic)){
		echo '{"state": 200, "info": "请上传版面图片！"}';
		exit();
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`company`, `date`, `title`, `type`, `litpic`, `seotitle`, `keywords`, `description`, `weight`, `state`, `pubdate`, `pdf`) VALUES ('$company', '".GetMkTime($date)."', '$title', '$type', '$litpic', '$seotitle', '$keywords', '$description', '$weight', '$state', '".GetMkTime(time())."', '$pdf')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		$param = array(
			"service"     => "paper",
			"template"    => "forum",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		adminLog("添加报刊版面", $title);
        dataAsync("paper",$aid);  //  电子报刊、新增

        echo '{"state": 100, "id": "'.$aid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `company` = '$company', `date` = '".GetMkTime($date)."', `title` = '$title', `type` = '$type', `litpic` = '$litpic', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description', `weight` = '$weight', `state` = '$state', `pdf` = '$pdf' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			$param = array(
				"service"     => "paper",
				"template"    => "forum",
				"id"          => $id
			);
			$url = getUrlPath($param);

			adminLog("修改报刊版面", $title);
            dataAsync("paper",$id);  //  电子报刊、更新

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
			$date        = $results[0]['date'];
			$title       = $results[0]['title'];
			$type        = $results[0]['type'];
			$litpic      = $results[0]['litpic'];
			$seotitle    = $results[0]['seotitle'];
			$keywords    = $results[0]['keywords'];
			$description = $results[0]['description'];
			$weight      = $results[0]['weight'];
			$state       = $results[0]['state'];
			$pdf         = $results[0]['pdf'];

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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/paper/paperForumAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/paper.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('id', $id);

	//报刊公司
	$archives = $dsql->SetQuery("SELECT * FROM `#@__paper_company` WHERE 1 = 1 " . getCityFilter('`cityid`') . " ORDER BY `weight` DESC, `pubdate` DESC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['title'];
	}
	$huoniaoTag->assign('companyList', $list);
	$huoniaoTag->assign('company', $company == "" ? 0 : $company);

	$huoniaoTag->assign('date', $date != "" ? date("Y-m-d", $date) : "");
	$huoniaoTag->assign('title', $title);

	//类别
	$huoniaoTag->assign('typeopt', array('0', '1'));
	$huoniaoTag->assign('typenames',array('普通','DM报刊'));
	$huoniaoTag->assign('type', $type == "" ? 0 : $type);

	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('seotitle', $seotitle);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);

	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('pdf', $pdf);
	
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/paper";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
