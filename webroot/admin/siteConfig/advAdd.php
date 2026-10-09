<?php
/**
 * 添加广告
 *
 * @version        $Id: advAdd.php 2013-11-15 下午16:33:36 $
 * @package        HuoNiao.Adv
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "advAdd.html";
$dir = HUONIAOROOT."/templates/".$action;

$tab        = "adv";
$pagetitle  = "新增广告";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

checkPurview("advList".$action);
if($userType == 3){
	ShowMsg("对不起，您无权使用此功能！", 'javascript:;');
	exit();
}

if($dopost != ""){
	$starttime = GetMkTime($starttime);   //开始时间
	$endtime   = GetMkTime($endtime);     //结束时间
	$pubdate   = GetMkTime(time());				//添加时间

	//对字符进行处理
	$title     = cn_substrR($title,60);
}

if($dopost == "edit"){
	if($id == "") die("要修改的信息ID传递失败！");
	$pagetitle = "修改广告";
	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		//表单二次验证
		// if($typeid == ''){
		// 	echo '{"state": 200, "info": "请选择广告分类"}';
		// 	exit();
		// }

		$cityid = (int)$cityid;

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($starttime != "" && $endtime != "" && $endtime - $starttime < 0){
			echo '{"state": 200, "info": "结束时间不能小于开始时间"}';
			exit();
		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请设置广告内容"}';
			exit();
		}

		if($type){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."list` WHERE `model` = '".$action."' AND `type` = '$type' AND `template` = '$typeid' AND `class` = '$class' AND `id` != ".$id);
			$results = $dsql->dsqlOper($sql, "results");
			if($results){//如果有子类
				echo '{"state": 200, "info": "分类广告限制：<br />每个模板下的每个类型只能添加一个广告！"}';
				exit();
			}
		}

		$starttime = $starttime == "" ? 0 : $starttime;
		$endtime = $endtime == "" ? 0 : $endtime;
		//保存到主表
		if($type){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."list` SET `template` = '".$typeid."', `cityid` = '".$cityid."', `title` = '".$title."', `weight` = ".$weight.", `starttime` = ".$starttime.", `endtime` = ".$endtime.", `body` = '".$body."', `state` = '$state' WHERE `id` = ".$id);
		}else{
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."list` SET `typeid` = ".$typeid.", `cityid` = '".$cityid."', `title` = '".$title."', `weight` = ".$weight.", `starttime` = ".$starttime.", `endtime` = ".$endtime.", `body` = '".$body."', `state` = '$state' WHERE `id` = ".$id);
		}
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "修改失败！"}';
			exit();
		}else{
			adminLog("修改广告", $action."=>".$title);
			echo '{"state": 100, "info": "修改成功！"}';
			exit();
		}
	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$class     = $results[0]['class'];
				$typeid    = $results[0]['typeid'];
				$template  = $results[0]['template'];
				$title     = $results[0]['title'];
				$weight    = $results[0]['weight'];
				$starttime = $results[0]['starttime'];
				$endtime   = $results[0]['endtime'];
				$body      = $results[0]['body'];
				$state     = $results[0]['state'];
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
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择广告分类"}';
			exit();
		}

		$cityid = (int)$cityid;

		$class = $_POST['class'];

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($starttime != "" && $endtime != "" && $endtime - $starttime < 0){
			echo '{"state": 200, "info": "结束时间不能小于开始时间"}';
			exit();
		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请设置广告内容"}';
			exit();
		}

		if($type){
			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."list` WHERE `model` = '".$action."' AND `type` = '$type' AND `template` = '$typeid' AND `class` = '$class'");
			$results = $dsql->dsqlOper($sql, "results");
			if($results){//如果有子类
				echo '{"state": 200, "info": "分类广告限制：<br />每个模板下的每个类型只能添加一个广告！"}';
				exit();
			}
		}

		$starttime = $starttime == "" ? 0 : $starttime;
		$endtime = $endtime == "" ? 0 : $endtime;
		//保存到主表
		if($type){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."list` (`model`, `type`, `class`, `typeid`, `template`, `cityid`, `title`, `weight`, `starttime`, `endtime`, `body`, `state`, `pubdate`) VALUES ('".$action."', ".$type.", ".$class.", 0, '".$typeid."', '".$cityid."', '".$title."', ".$weight.", ".$starttime.", ".$endtime.", '".$body."', '$state', ".$pubdate.")");
		}else{
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."list` (`model`, `type`, `class`, `typeid`, `cityid`, `title`, `weight`, `starttime`, `endtime`, `body`, `state`, `pubdate`) VALUES ('".$action."', ".$type.", ".$class.", ".$typeid.", '".$cityid."', '".$title."', ".$weight.", ".$starttime.", ".$endtime.", '".$body."', '$state', ".$pubdate.")");
		}

		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "添加失败！"}';
			exit();
		}else{
			adminLog("添加广告", $action."=>".$title);
			echo '{"state": 100, "info": "添加成功！"}';
			exit();
		}

	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/siteConfig/advAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('type', (int)$type);
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('classList', array(1 => '普通广告', 2 => '多图广告', 3 => '伸缩广告', 4 => '对联广告', 5 => '节日广告', 6 => '弹窗公告'));
	$huoniaoTag->assign('classid', empty($class) ? "0" : $class);

	if($type){
		$floders = listDir($dir);
		$skins = array();
		if(!empty($floders)){
			foreach($floders as $key => $floder){
				if($floder != 'touch'){
					//解析xml配置文件
					$xml = new DOMDocument();
					$xml->load($dir.'/'.$floder.'/config.xml');
					$data = $xml->getElementsByTagName('Data')->item(0);
					$tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
					$copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

					$skins[$key]['tplname'] = $tplname;
					$skins[$key]['directory'] = $floder;
				}
			}
		}
		$huoniaoTag->assign('typeListArr', json_encode($skins));
		$huoniaoTag->assign('typeid', $template);
	}else{
		$huoniaoTag->assign('typeListArr', json_encode(getAdvTypeList(0, $action, $tab)));
		$huoniaoTag->assign('typeid', (int)$typeid);
	}

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('starttime', $starttime == 0 ? "" : date('Y-m-d', $starttime));
	$huoniaoTag->assign('endtime', $endtime == 0 ? "" : date('Y-m-d', $endtime));
	$huoniaoTag->assign('body', $body);

	$body = explode("$$", $body);
	if($class == 3){
		$huoniaoTag->assign("type1", getAttachType($body[3]));
		$huoniaoTag->assign("type2", getAttachType($body[5]));
	}elseif($class == 4){
		$left = explode("##", $body[4]);
		$right = explode("##", $body[5]);
		$huoniaoTag->assign("type1", getAttachType($left[0]));
		$huoniaoTag->assign("type2", getAttachType($left[0]));
	}elseif($class == 5){

	}


	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('隐藏','显示'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
function getAdvTypeList($id, $model, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."type` WHERE `parentid` = $id AND `model` = '$model' ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){//如果有子类
		foreach($results as $key => $value){
			$results[$key]["lower"] = getAdvTypeList($value['id'], $model, $tab);
		}
		return $results;
	}else{
		return "";
	}
}
