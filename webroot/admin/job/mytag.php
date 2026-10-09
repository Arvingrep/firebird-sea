<?php
/**
 * 模板标记
 *
 * @version        $Id: mytag.php 2014-5-13 上午10:11:25 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "mytag.html";

$action = "job";

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/'.$action.'/mytag.js'
);

checkPurview("mytag".$action);

//预览
if($submit == "预览"){

	$data = array();
	$handler = true;

	//招聘职位
	if($t == "post"){
		if(!empty($type))  $data["type"]               = $type;
		if(!empty($experience))  $data["experience"]   = $experience;
		if(!empty($educational))  $data["educational"] = $educational;
		if(!empty($nature))  $data["nature"]           = $nature;

	//招聘简历
	}elseif($t == "resume"){
		if(!empty($type))  $data["type"]               = $type;
		if(!empty($experience))  $data["experience"]   = $experience;
		if(!empty($educational))  $data["educational"] = $educational;
		if(!empty($nature))  $data["nature"]           = $nature;

	//一句话
	}elseif($t == "sentence"){
		if($type != "")  $data["type"] = $type;

	//装修大学
	}elseif($t == "news"){
		if(!empty($typeid))  $data["typeid"] = $typeid;
	}

	$handels = new handlers($action, $t);
	$return = $handels->getHandle($data);
	echo json_encode($return);
	die;
}

if($dopost == "getList"){

	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " WHERE `module` = '".$action."'";

	if($sKeyword != ""){
		$where .= " AND `name` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `type` = '".$sType."'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__mytag`".$where);

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
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `name`, `module`, `type`, `start`, `end`, `state`, `pubdate` FROM `#@__mytag`".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]      = $value["id"];
			$list[$key]["name"]    = $value["name"];
			$list[$key]["module"]  = $value["module"];
			$list[$key]["type"]    = $value["type"];
			$list[$key]["start"]   = !empty($value["start"]) ? date('Y-m-d', $value["start"]) : "";
			$list[$key]["end"]     = !empty($value["end"]) ? date('Y-m-d', $value["end"]) : "";
			$list[$key]["state"]   = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}, "mytag": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalPause": '.$totalPause.', "totalNormal": '.$totalNormal.'}}';
	}
	die;

//新增标记
}elseif($dopost == "save"){
	checkPurview("add".$action."Mytag");

	if($submit == "提交"){
		if($token == "") die('{"state": 200, "info": "token传递失败！"}');

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;
		$data = serialize($data);
		$name = $_POST['name'];

		$archives = $dsql->SetQuery("INSERT INTO `#@__mytag` (`name`, `type`, `module`, `start`, `end`, `config`, `expbody`, `state`, `pubdate`) VALUES ('$name', '$type', '$action', '$start', '$end', '$data', '$expbody', '$state', '".GetMkTime(time())."')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("生成模板标签", $action . " => " . $name);
			echo '{"state": 100, "info": "生成成功！"}';
		}else{
			echo '{"state": 200, "info": "保存失败！"}';
		}

		die;
	}


	$templates = "mytagAdd.html";
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'admin/'.$action.'/mytagAdd.js'
	);

	$huoniaoTag->assign('typeid', 0);
	$huoniaoTag->assign('newstypeid', 0);
	$huoniaoTag->assign('dopost', "save");
	$huoniaoTag->assign('state', 1);



//修改标记
}elseif($dopost == "edit"){
	checkPurview("edit".$action."Mytag");
	$templates = "mytagAdd.html";
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'admin/'.$action.'/mytagAdd.js'
	);

	$huoniaoTag->assign("dopost", "edit");

	if($submit == "提交"){
		if(empty($token)) die('{"state": 200, "info": "token传递失败！"}');
		if(empty($id)) die('{"state": 200, "info": "要修改的信息ID传递失败！"}');

		$data = !empty($_POST['item']) ? objtoarr(json_decode($_POST['item'])) : array();
		$start = !empty($start) ? GetMkTime($start) : 0;
		$end   = !empty($end) ? GetMkTime($end) : 0;

		$data = serialize($data);
		$name = $_POST['name'];

		$do = $type;
		//招聘职位
		if($type == "post"){
			$do = "jobPost";

		//招聘简历
		}elseif($type == "resume"){
			$do = "jobResume";

		//一句话
		}elseif($type == "sentence"){
			$do = "jobSentence";

		//装修大学
		}elseif($type == "news"){
			$do = "jobNews";
		}

		$archives = $dsql->SetQuery("UPDATE `#@__mytag` SET `name` = '$name', `type` = '$do', `start` = '$start', `end` = '$end', `config` = '$data', `expbody` = '$expbody', `state` = '$state' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改模板标签", $action . " => " . $name);
			echo '{"state": 100, "info": "修改成功！"}';
		}else{
			echo '{"state": 200, "info": "修改失败！"}';
		}

		die;
	}

	if(empty($id)) die('要修改的信息ID传递失败！');
	$archives = $dsql->SetQuery("SELECT * FROM `#@__mytag` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){
		$name     = $results[0]['name'];
		$type_    = $results[0]['type'];
		$start    = $results[0]['start'];
		$end      = $results[0]['end'];
		$config   = unserialize($results[0]['config']);
		$expbody  = $results[0]['expbody'];
		$state    = $results[0]['state'];

		$huoniaoTag->assign("id", $id);
		$huoniaoTag->assign("name", $name);
		$huoniaoTag->assign("type", $type_);
		$huoniaoTag->assign("start", !empty($start) ? date("Y-m-d", $start) : "");
		$huoniaoTag->assign("end", !empty($end) ? date("Y-m-d", $end) : "");
		$huoniaoTag->assign("expbody", $expbody);
		$huoniaoTag->assign("state", $state);
		$huoniaoTag->assign('typeid', 0);
		$huoniaoTag->assign('newstypeid', 0);
		$store = "";

		if(!empty($config)){
			foreach($config as $key => $val){
				$obj = $type_.$key;
				if($key == "type" && $type_ != "sentence"){
					$obj = "typeid";
				}
				$huoniaoTag->assign($obj, $val);
				$$obj = $val;
			}
		}

	}else{
		die('信息不存在或已删除！');
	}


//删除标记
}elseif($dopost == "del"){
	checkPurview("del".$action."Mytag");

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__mytag` WHERE `id` = ".$val);
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
	checkPurview("edit".$action."Mytag");

	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__mytag` SET `state` = $state WHERE `id` = ".$val);
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


	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('module', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_type")));
	$huoniaoTag->assign('newsListArr', json_encode($dsql->getTypeList(0, $action."_newstype")));

	//栏目
	$huoniaoTag->assign('typeList', array('post' => '招聘职位', 'resume' => '招聘简历', 'sentence' => '一句话', 'news' => '招聘资讯'));

	/* 招聘职位 start */
		//工作经验
		$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$typeList = array("" => "所有类别");
		foreach($results as $value){
			$typeList[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('experienceList', $typeList);
		$huoniaoTag->assign('postexperience', $postexperience);

		//学历要求
		$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$typeList = array("" => "所有类别");
		foreach($results as $value){
			$typeList[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('educationalList', $typeList);
		$huoniaoTag->assign('posteducational', $posteducational);

		//薪资范围
		$archives = $dsql->SetQuery("SELECT * FROM `#@__jobitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
		$results = $dsql->dsqlOper($archives, "results");
		$typeList = array("" => "所有类别");
		foreach($results as $value){
			$typeList[$value['id']] = $value['typename'];
		}
		$huoniaoTag->assign('natureList', $typeList);
		$huoniaoTag->assign('postnature', $postnature);

	/* 招聘职位 end */

	/* 一句话 start */
		//类别
		$huoniaoTag->assign('sentencetypeopt', array('0', '1'));
		$huoniaoTag->assign('sentencetypenames',array('招聘','求职'));
		$huoniaoTag->assign('sentencetype', $sentencetype == "" ? 0 : $sentencetype);

	/* 一句话 end */

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1'));
	$huoniaoTag->assign('statenames',array('暂停','正常'));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/".$action;  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
