<?php
/**
 * 计划任务管理
 *
 * @version        $Id: siteCron.php 2015-10-19 下午15:39:10 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCron");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "site_cron";

//更新状态
if($action == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = $state WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新计划任务状态", $id."=>".$state);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif($action == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除系统计划任务", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//手动执行任务
}elseif($action == "run"){
	if($id == "") die;
	Cron::run($id);
	echo '{"state": 100, "info": '.json_encode("执行成功！").'}';
	die;

//一键删除重复任务
}elseif($action == "clearRepeat"){

	$sql = $dsql->SetQuery("SELECT c.`id` FROM (SELECT * FROM `#@__site_cron` ORDER BY `id` ASC LIMIT 99999999) c GROUP BY c.`file`");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$ids = array();
		foreach ($ret as $key => $value) {
			array_push($ids, $value['id']);
		}

		if($ids){
			$idsArr = join(',', $ids);

			$sql = $dsql->SetQuery("DELETE FROM `#@__site_cron` WHERE `id` NOT IN ($idsArr)");
			$dsql->dsqlOper($sql, "update");
		}
	}
	
	echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	die;

//一键删除无效任务
//删除不存在或已卸载的模块计划任务
}elseif($action == "clearInvalid"){

    //查询所有模块
    $moduleArr = array('siteConfig', 'member');

    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` WHERE `type` = 0 AND `parentid` != 0");
    $ret = $dsql->getArr($sql);

    $moduleArr = array_merge($moduleArr, $ret);

    $placeholders = "'". join("', '", $moduleArr) . "'";

    $sql = $dsql->SetQuery("DELETE FROM `#@__site_cron` WHERE `module` NOT IN ($placeholders)");
    $dsql->dsqlOper($sql, "update");

    echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    die;

//一键删除停用任务
}elseif($action == "clearStop"){

    $sql = $dsql->SetQuery("DELETE FROM `#@__site_cron` WHERE `state` = 0");
    $dsql->dsqlOper($sql, "update");

    echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
    die;

}


//获取任务列表
$moduleArr[] = array(
	"name" => 'siteConfig',
	"title" => '系统相关'
);
$moduleArr[] = array(
	"name" => 'member',
	"title" => '会员相关'
);

$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
$result = $dsql->dsqlOper($sql, "results");
if($result){
	foreach ($result as $key => $value) {
		if(!empty($value['name'])){
			$moduleArr[] = array(
				"name" => $value['name'],
				"title" => $value['subject'] ? $value['subject'] : $value['title']
			);

			// if($value['name'] == "article"){
			// 	$moduleArr[] = array(
			// 		"name" => "pic",
			// 		"title" => "图片"
			// 	);
			// }
		}
	}
}

$jsFile = array();

//任务列表
if(empty($action)){

	$templates = "siteCron.html";
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteCron.js'
	);

	$list = array();
	// foreach ($moduleArr as $key => $value) {
		$sql = $dsql->SetQuery("SELECT * FROM `#@__site_cron` ORDER BY `ntime` DESC");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			foreach ($ret as $k => $v) {

				$cycle = "";
				switch ($v['type']) {
					case 'month':
						$cycle = "每月";
						break;
					case 'week':
						$cycle = "每周";
						break;
					case 'day':
						$cycle = "每日";
						break;
					case 'hour':
						$cycle = "每小时";
						break;
					case 'now':
						$cycle = "每隔";
						break;
				}

				$daytime = explode("-", $v['daytime']);
				foreach ($daytime as $k_ => $val) {
					if($val){
						if($k_ == 0){
							$vk = array("日", "一","二","三","四","五","六");
							$cycle .= $v['type'] == "week" ? $vk[$val] : $val."日";
						}
						if($k_ == 1){
							$cycle .= sprintf("%02d", $val).($v['type'] == "now" ? "小时" : "时");
						}
						if($k_ == 2){
							$cycle .= sprintf("%02d", $val).($v['type'] == "now" ? "分钟" : "分");
						}
					}
				}

				$state = $v['state'] ? '<span class="audit">开启</span>' : '<span class="refuse">关闭</span>';

                $moduleTitle = $v['module'] == 'siteConfig' ? '系统相关' : ($v['module'] == 'member' ? '会员相关' : getModuleTitle(array('name' => $v['module'])));

				$arr = array(
					"id"          => $v['id'],
					"moduleName"  => $v['module'],
					"moduleTitle" => $moduleTitle ? $moduleTitle : '未知',
					"title"       => $v['title'],
					"cycle"       => $cycle,
					"file"        => $v['file'],
					"state"       => $state,
					"ctime"       => $v['ctime'],
					"ltime"       => $v['ltime'],
					"ntime"       => $v['ntime']
				);

				array_push($list, $arr);

			}
		}
	// }

	$huoniaoTag->assign('list', $list);


//新增、修改
}else{

	//表单验证
	if($submit == "提交"){

		if($token == "") die('token传递失败！');

		if(empty($module)){
			echo '{"state": 200, "info": "请选择所属模块"}';
			exit();
		}
		if(empty($title)){
			echo '{"state": 200, "info": "请输入任务名称"}';
			exit();
		}

		$daytime = array();
		//每月
		if($type == "month"){
			$daytime = $day."-".$hour."-".$minute;

		//每周
		}elseif($type == "week"){
			$daytime = $week."-".$hour."-".$minute;

		//每日
		}elseif($type == "day"){
			$daytime = "0-".$hour."-".$minute;

		//每小时
		}elseif($type == "hour"){
			$daytime = "0-0-".$minute;

		//每隔
		}elseif($type == "now"){

			if($now_type == "day"){
				$daytime = $now_time."-0-0";
			}elseif($now_type == "hour"){
				$daytime = "0-".$now_time."-0";
			}elseif($now_type == "minute"){
				$daytime = "0-0-".$now_time;
			}

		}

		$file = $_POST['file'];
		if(empty($file)){
			echo '{"state": 200, "info": "请选择执行文件"}';
			exit();
		}

		$title   = cn_substrR($title,30);
		$state   = (int)$state;
		$pubdate = GetMkTime(time()); //发布时间


		//新增
		if($action == "add"){

			$dotitle = "新增";

			$archives = $dsql->SetQuery("INSERT INTO `#@__".$db."` (`module`, `title`, `type`, `daytime`, `file`, `state`, `ctime`, `ltime`, `ntime`) VALUES ('$module', '$title', '$type', '$daytime', '$file', '$state', '$pubdate', '0', '0')");

		//修改
		}else{

			if(empty($id)) die('{"state": 200, "info": "参数传递失败！"}');

			$dotitle = "修改";

			$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `module` = '$module', `title` = '$title', `type` = '$type', `daytime` = '$daytime', `file` = '$file', `state` = '$state' WHERE `id` = ".$id);


		}

		$return = $dsql->dsqlOper($archives, "update");
		if($return == "ok"){
			adminLog($dotitle."计划任务", $title);
			echo '{"state": 100, "info": '.json_encode("提交成功！").'}';
		}else{
			echo $return;
		}
		die;

	}


	$templates = "siteCronAdd.html";
	$jsFile = array(
		'admin/siteConfig/siteCronAdd.js'
	);


	//修改
	if($action == "edit"){

		if(empty($id)){
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$module  = $results[0]['module'];
			$title   = $results[0]['title'];
			$type    = $results[0]['type'];
			$daytime = $results[0]['daytime'];
			$file    = $results[0]['file'];
			$state   = $results[0]['state'];

			$huoniaoTag->assign('id', $id);
			$huoniaoTag->assign('module', $module);
			$huoniaoTag->assign('title', $title);
			$huoniaoTag->assign('type', $type);

			$daytime = explode("-", $daytime);

			//每月
			if($type == "month"){
				$huoniaoTag->assign('day', $daytime[0]);
				$huoniaoTag->assign('hour', $daytime[1]);
				$huoniaoTag->assign('minute', $daytime[2]);

			//每周
			}elseif($type == "week"){
				$huoniaoTag->assign('day', $daytime[0]);
				$huoniaoTag->assign('hour', $daytime[1]);
				$huoniaoTag->assign('minute', $daytime[2]);

			//每日
			}elseif($type == "day"){
				$huoniaoTag->assign('day', 0);
				$huoniaoTag->assign('hour', $daytime[1]);
				$huoniaoTag->assign('minute', $daytime[2]);

			//每小时
			}elseif($type == "hour"){
				$huoniaoTag->assign('day', 0);
				$huoniaoTag->assign('hour', 0);
				$huoniaoTag->assign('minute', $daytime[2]);

			//每隔
			}elseif($type == "now"){

				$now_type = "";
				$now_day = $now_hour = $now_minute = 0;

				//天
				if($daytime[0] != 0){
					$now_type = "day";
					$now_day = $daytime[0];

				//小时
				}elseif($daytime[1] != 0){
					$now_type = "hour";
					$now_hour = $daytime[1];

				//分钟
				}elseif($daytime[2] != 0){
					$now_type = "minute";
					$now_minute = $daytime[2];

				}

				$huoniaoTag->assign('now_type', $now_type);
				$huoniaoTag->assign('day', $now_day);
				$huoniaoTag->assign('hour', $now_hour);
				$huoniaoTag->assign('minute', $now_minute);


			}

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}



	}


	//执行文件
	$dir = HUONIAOINC."/cron/";
	$floders = listFile($dir);
	$files = array();
	$fileName = array();
	if(!empty($floders)){
		foreach($floders as $key => $f){
			if($f && pathinfo($f, PATHINFO_EXTENSION) == "php"){
				$files[$key] = $f;
				$fileName[$key] = basename($f,".php");
			}
		}
	}
	sort($files);
	sort($fileName);
	$huoniaoTag->assign('fileList', $files);
	$huoniaoTag->assign('fileName', $fileName);
	$huoniaoTag->assign('file', $file);


	$huoniaoTag->assign('stateopt', array('1', '0'));
	$huoniaoTag->assign('statenames',array('开启','停用'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('moduleArr', $moduleArr);

    $huoniaoTag->assign('cfg_cronType', (int)$cfg_cronType);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
