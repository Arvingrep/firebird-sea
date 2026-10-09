<?php
/**
 * 添加投票信息
 *
 * @version        $Id: voteAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Vote
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$action = "vote";
$actioncap = "Vote";

$actiontxt = "投票";

define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/".$action;
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = $action."Add.html";


$pagetitle  = "发布".$actiontxt;
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	checkPurview("edit".$actioncap);
}else{
	checkPurview($action."Add");
}

if($submit == "提交"){
	$pubdate = GetMkTime(time());	//发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$color       = cn_substrR($color,6);
	$keywords    = cn_substrR($keywords,50);
	$description = cn_substrR($description,150);
	$color       = cn_substrR($color,6);

	//获取当前管理员
	$adminid = $userLogin->getUserID();
}

if(empty($click)) $click = mt_rand(50, 200);


//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝', 3 => '取消显示'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){

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

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		/*if(trim($litpic) == ''){
			echo '{"state": 200, "info": "请上传logo"}';
			exit();
		}*/

		if(trim($began) == ''){
			echo '{"state": 200, "info": "请输入活动开始时间"}';
			exit();
		}

		if(trim($end) == ''){
			echo '{"state": 200, "info": "请输入活动结束时间！"}';
			exit();
		}

		$began = GetMkTime(trim($began));
		$end   = GetMkTime(trim($end));

		if($end <= $began){
			echo '{"state": 200, "info": "活动结束时间必须晚于开始时间"}';
			exit();
		}

		if(trim($baomingend) != ''){
			$baomingend   = GetMkTime(trim($baomingend));
			if($baomingend <= $began || $baomingend > $end){
				echo '{"state": 200, "info": "报名截止时间不正确"}';
				exit();
			}

		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请填写活动详情"}';
			exit();
		}

		if(empty($ismore)){
			$ismore = 0;
		}
		if(empty($timelimit)){
			$timelimit = 0;
		}
		if(empty($voteuser)){
			$voteuser = 0;
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."_list` SET `cityid` = '".$cityid."', `title` = '".$title."', `color` = '".$color."', `keywords` = '".$keywords."', `description` = '".$description."', `litpic` = '".$litpic."', `began` = '".$began."', `end` = '".$end."', `baomingend` = '".$baomingend."', `ismore` = '".$ismore."', `timelimit` = ".$timelimit.", `voteuser` = '".$voteuser."', `body` = '".$body."', `mbody` = '".$mbody."', `click` = '".$click."', `arcrank` = '$arcrank', `weight` = '".$weight."' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "保存失败！"}';
			exit();
		}


		adminLog("修改".$actiontxt."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;


	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title      = $results[0]['title'];
				$color      = $results[0]['color'];
				$litpic     = $results[0]['litpic'];
				$weight     = $results[0]['weight'];
				$began      = $results[0]['began'];
				$end        = $results[0]['end'];
				$baomingend = $results[0]['baomingend'];
				$ismore     = $results[0]['ismore'];
				$timelimit  = $results[0]['timelimit'];
				$voteuser   = $results[0]['voteuser'];
				$body       = $results[0]['body'];
				$mbody      = $results[0]['mbody'];
				$click      = $results[0]['click'];
				$keywords   = $results[0]['keywords'];
				$description= $results[0]['description'];
				$arcrank    = $results[0]['arcrank'];
                $cityid  = $results[0]['cityid'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
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

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		/*if(trim($litpic) == ''){
			echo '{"state": 200, "info": "请上传logo"}';
			exit();
		}*/

		if(trim($began) == ''){
			echo '{"state": 200, "info": "请输入活动开始时间"}';
			exit();
		}

		if(trim($end) == ''){
			echo '{"state": 200, "info": "请输入活动结束时间！"}';
			exit();
		}

		$began = GetMkTime(trim($began));
		$end   = GetMkTime(trim($end));

		if($end <= $began){
			echo '{"state": 200, "info": "活动结束时间必须晚于开始时间"}';
			exit();
		}

		if(trim($baomingend) != ''){
			$baomingend   = GetMkTime(trim($baomingend));
			if($baomingend <= $began || $baomingend > $end){
				echo '{"state": 200, "info": "报名截止时间不正确"}';
				exit();
			}

		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请填写活动详情"}';
			exit();
		}

		if(empty($ismore)){
			$ismore = 0;
		}
		if(empty($timelimit)){
			$timelimit = 0;
		}
		if(empty($voteuser)){
			$voteuser = 0;
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_list` (`cityid`, `title`, `color`, `keywords`, `description`, `litpic`, `began`, `end`, `baomingend`, `ismore`, `timelimit`, `voteuser`, `body`, `mbody`, `click`, `arcrank`, `pubdate`, `admin`, `weight`) VALUES ('".$cityid."', '".$title."', '".$color."', '".$keywords."', '".$description."', '".$litpic."', ".$began.", ".$end.", '".$baomingend."', '$ismore', '$timelimit', '".$voteuser."', '$body', '".$mbody."', ".$click.", ".$arcrank.", ".GetMkTime(time()).", ".$adminid.", ".$weight.")");
		$aid = $dsql->dsqlOper($archives, "lastid");


		if(is_numeric($aid)){

		}

		adminLog("发布".$actiontxt."信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;

	}
}

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//验证模板文件
if(file_exists($tpl."/".$templates)){
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/'.$action.'/'.$action.'Add.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('began', empty($began) ? '' : date("Y-m-d H:i:s",$began));
	$huoniaoTag->assign('end', empty($end) ? '' : date("Y-m-d H:i:s",$end));
	$huoniaoTag->assign('baomingend', empty($baomingend) ? '' : date("Y-m-d H:i:s",$baomingend));
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('ismore', $ismore);
	$huoniaoTag->assign('timelimit', empty($timelimit) ? 0 : $timelimit);
	$huoniaoTag->assign('voteuser', $voteuser);
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
