<?php
/**
 * 模板标记风格
 *
 * @version        $Id: mytagTemp.php 2014-5-14 上午09:26:21 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "mytagTemp.html";

$action = "info";

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/'.$action.'/mytagTemp.js'
);

checkPurview("mytagTemp".$action);

if($dopost == "getList"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " WHERE `module` = '".$action."'";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__mytag_temp`".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//暂停
	$totalPause = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
	//正常
	$totalNormal = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalPause/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalNormal/$pagestep);
		}
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `module`, `litpic`, `isSystem`, `state`, `pubdate` FROM `#@__mytag_temp`".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]      = $value["id"];
			$list[$key]["title"]    = $value["title"];
			$list[$key]["module"]  = $value["module"];
			$list[$key]["litpic"]   = $value["litpic"];
			$list[$key]["isSystem"]     = $value["isSystem"];
			$list[$key]["state"]   = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}, "mytagTemp": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
	}
	die;

//新增标记
}elseif($dopost == "save"){
	checkPurview("addmytagTemp".$action);

	if($submit == "提交"){
		if($token == "") die('{"state": 200, "info": "token传递失败！"}');

		if(empty($title)) die('{"state": 200, "info": "模板名称不得为空！"}');
		if(empty($litpic)) die('{"state": 200, "info": "缩略图不得为空！"}');
		if(empty($html)) die('{"state": 200, "info": "页面代码不得为空！"}');

		$archives = $dsql->SetQuery("INSERT INTO `#@__mytag_temp` (`title`, `module`, `type`, `litpic`, `css`, `isSystem`, `state`, `pubdate`) VALUES ('$title', '$action', '".$action."List', '$litpic', '$css', '$isSystem', '$state', '".GetMkTime(time())."')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if($aid){
			//创建模板文件
			$tempFile = HUONIAOROOT."/templates/mytag/".$aid.".html";
			createFile($tempFile);
			PutFile($tempFile, $_POST['html']);

			adminLog("添加模板标记风格", $action . " => " . $title);
			echo '{"state": 100, "info": "生成成功！"}';
		}else{
			echo '{"state": 200, "info": "保存失败！"}';
		}

		die;
	}


	$templates = "mytagTempAdd.html";
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/'.$action.'/mytagTempAdd.js'
	);


	$huoniaoTag->assign("isSystem", 1);
	$huoniaoTag->assign("state", 1);
	$huoniaoTag->assign("html", "{#mytag#}\r\n	{#foreach from=\$list item=v#}\r\n		{#\$v.title#}\r\n	{#/foreach#}\r\n{#/mytag#}");


//修改标记
}elseif($dopost == "edit"){
	checkPurview("editmytagTemp".$action);
	$templates = "mytagTempAdd.html";
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/'.$action.'/mytagTempAdd.js'
	);

	$huoniaoTag->assign("dopost", "edit");

	if($submit == "提交"){
		if(empty($token)) die('{"state": 200, "info": "token传递失败！"}');
		if(empty($id)) die('{"state": 200, "info": "要修改的信息ID传递失败！"}');

		if(empty($title)) die('{"state": 200, "info": "模板名称不得为空！"}');
		if(empty($litpic)) die('{"state": 200, "info": "缩略图不得为空！"}');
		if(empty($html)) die('{"state": 200, "info": "页面代码不得为空！"}');

		$archives = $dsql->SetQuery("UPDATE `#@__mytag_temp` SET `title` = '$title', `litpic` = '$litpic', `css` = '$css', `isSystem` = '$isSystem', `state` = '$state' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			//模板文件
			$tempFile = HUONIAOROOT."/templates/mytag/".$id.".html";
			if(!file_exists($tempFile)){
				createFile($tempFile);
			}
			PutFile($tempFile, $_POST['html']);

			adminLog("修改模板标记风格", $action . " => " . $title);
			echo '{"state": 100, "info": "修改成功！"}';
		}else{
			echo '{"state": 200, "info": "修改失败！"}';
		}

		die;
	}

	if(empty($id)) die('要修改的信息ID传递失败！');
	$archives = $dsql->SetQuery("SELECT * FROM `#@__mytag_temp` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){
		$title     = $results[0]['title'];
		$litpic    = $results[0]['litpic'];
		$css       = $results[0]['css'];
		$isSystem  = $results[0]['isSystem'];
		$state     = $results[0]['state'];

		$html = "";
		$tempFile = HUONIAOROOT."/templates/mytag/".$id.".html";
		if(file_exists($tempFile)){
			$fp = fopen($tempFile,'r');
			$html = fread($fp,filesize($tempFile));
			fclose($fp);
		}

		$huoniaoTag->assign("id", $id);
		$huoniaoTag->assign("title", $title);
		$huoniaoTag->assign("litpic", $litpic);
		$huoniaoTag->assign("html", $html);
		$huoniaoTag->assign("css", $css);
		$huoniaoTag->assign("isSystem", $isSystem);
		$huoniaoTag->assign("state", $state);

	}else{
		die('信息不存在或已删除！');
	}


//删除标记
}elseif($dopost == "del"){
	checkPurview("delmytagTemp".$action);

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__mytag_temp` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除模板标签", $action ." => ". $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}

	die;

//更新状态
}elseif($dopost == "updateState"){
	checkPurview("editmytagTemp".$action);

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__mytag_temp` SET `state` = $state WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新模板标签状态", $action ." => ". $state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}

	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign("dopost", $dopost);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('module', $action);

	//状态
	$huoniaoTag->assign('isSystemopt', array('1', '0'));
	$huoniaoTag->assign('isSystemnames',array('系统默认','自定义'));

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('暂停','正常'));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
