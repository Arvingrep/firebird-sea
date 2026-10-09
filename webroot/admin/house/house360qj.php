<?php
/**
 * 楼盘全景展示
 *
 * @version        $Id: house360qj.php 2016-10-21 下午16:40:10 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2016, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("house360qj");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "楼盘全景展示";

if(empty($loupan)) die('网站信息传递失败！');

$tab = "house_360qj";

if($dopost != ""){
	$templates = "house360qjAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap.min.js',
		'publicUpload.js',
		'admin/house/house360qjAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "house360qj.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/house/house360qj.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate = GetMkTime(time());       //发布时间
	$click   = (int)$click;

	//对字符进行处理
	$title = cn_substrR($title,60);
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$where .= " order by `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `click`, `pubdate` FROM `#@__".$tab."` WHERE `loupan` = $loupan".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["click"] = $value["click"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "house360qj": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle = "新增楼盘全景";

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if(trim($litpic_) == ''){
			echo '{"state": 200, "info": "请上传缩略图"}';
			exit();
		}

		$file = $litpic;
		if($typeidArr == 0){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景图片"}';
				exit();
			}
		}elseif($typeidArr == 1){
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景文件"}';
				exit();
			}
		}elseif($typeidArr == 2){
			if(trim($url) == ''){
				echo '{"state": 200, "info": "请输入URL地址"}';
				exit();
			}
			$file = $url;
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`loupan`, `title`, `litpic`, `typeid`, `file`, `click`, `pubdate`) VALUES ('$loupan', '$title', '$litpic_', '$typeidArr', '$file', '$click', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增楼盘全景", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改楼盘全景";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			die;
		}

		if(trim($litpic_) == ''){
			echo '{"state": 200, "info": "请上传缩略图"}';
			exit();
		}

		if($typeidArr == 0){
			$file = $litpic;
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景图片"}';
				exit();
			}
		}elseif($typeidArr == 1){
			$file = $litpic;
			if(trim($file) == ''){
				echo '{"state": 200, "info": "请上传全景文件"}';
				exit();
			}
		}elseif($typeidArr == 2){
			if(trim($url) == ''){
				echo '{"state": 200, "info": "请输入URL地址"}';
				exit();
			}
			$file = $url;
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `litpic` = '$litpic_', `typeid` = '$typeidArr', `file` = '$file', `click` = '$click' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改楼盘全景", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title       = $results[0]['title'];
				$litpic      = $results[0]['litpic'];
				$typeid      = $results[0]['typeid'];
				$file        = $results[0]['file'];
				$click       = $results[0]['click'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			delPicFile($results[0]['litpic'], "delThumb", "house");
			if($results[0]['typeid'] == 0){
				delPicFile($results[0]['file'], "delThumb", "house");
			}else{
				delPicFile($results[0]['file'], "delFlash", "house");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除楼盘全景", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//楼盘信息
	$loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `id` = ". $loupan);
	$loupanResult = $dsql->getTypeName($loupanSql);
	if(!$loupanResult)die('楼盘不存在！');
	$huoniaoTag->assign('loupanid', $loupanResult[0]['id']);
	$huoniaoTag->assign('loupaname', $loupanResult[0]['title']);

	global $cfg_flashSize;
	$huoniaoTag->assign('flashSize', $cfg_flashSize);

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('loupan', (int)$loupan);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('litpic', $litpic);

	//全景类型
	$huoniaoTag->assign('typeidArr', array('0', '1', '2'));
	$huoniaoTag->assign('typeidNames',array('图片','swf','url'));
	$huoniaoTag->assign('typeid', (int)$typeid);

	$huoniaoTag->assign('file', $file);

	$huoniaoTag->assign('click', $click);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
