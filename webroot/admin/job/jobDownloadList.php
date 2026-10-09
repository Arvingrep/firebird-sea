<?php
/**
 * 招聘文档
 *
 * @version        $Id: jobDownload.php 2016-05-24 下午17:32:21 $
 * @package        HuoNiao.job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobDownloadList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "招聘文档";

$tab = "job_download";

if($dopost != ""){
	$templates = "jobDownloadAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'ui/bootstrap.min.js',
		'admin/job/jobDownloadAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "jobDownloadList.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/job/jobDownloadList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());       //发布时间

	//对字符进行处理
	$title = cn_substrR($title,60);
	$file = $_POST['file'];
}

if(empty($click)) $click = 0;

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
		if($dsql->getTypeList($sType, $tab."_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, $tab."_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `click`, `arcrank`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["typeid"] = $value["typeid"];

			//分类
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."_type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["type"] = $typename[0]['typename'];

			$list[$key]["click"] = $value["click"];

			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "显示";
					break;
				case "1":
					$state = "隐藏";
					break;
			}

			$list[$key]["state"] = $state;

			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "jobDownloadList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle     = "新增招聘文档";

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `typeid`, `file`, `click`, `weight`, `note`, `arcrank`, `pubdate`) VALUES ('$title', '$typeid', '$file', '$click', '$weight', '$note', '$arcrank', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){

			clearCache("job_download_list", "key");
			clearCache("job_download_total", "key");

			adminLog("新增招聘文档", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改招聘文档";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == '')
		{
			echo '{"state": 200, "info": "标题不能为空"}';
			die;
		}

		$sql = $dsql->SetQuery("SELECT `arcrank` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($sql, "results");
		$arcrank_ = $res[0]['arcrank'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `typeid` = $typeid, `file` = '$file', `click` = '$click', `weight` = '$weight', `note` = '$note', `arcrank` = '$arcrank' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){

			// 清除缓存
			if(($arcrank != 1 && $arcrank_ == 1)|| ($arcrank == 1 && $arcrank_ != 1)){
				checkCache("job_download_list", $id);
				clearCache("job_download_total", "key");
			}

			adminLog("修改招聘文档", $title);
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
				$typeid      = $results[0]['typeid'];
				$file        = $results[0]['file'];
				$click       = $results[0]['click'];
				$weight      = $results[0]['weight'];
				$note        = $results[0]['note'];
				$arcrank     = $results[0]['arcrank'];

				global $data;
				$data = '';
				$typename = getParentArr($tab."_type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));

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

			//删除缩略图
			delPicFile($results[0]['file'], "delFile", "job");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

			checkCache("job_download_list", $val);
			clearCache("job_download_total", "key");
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除招聘文档", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	require_once(HUONIAOINC."/config/job.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_softSize;
		global $custom_softType;
		$huoniaoTag->assign('softSize', $custom_softSize);
		$huoniaoTag->assign('softType', "*.".str_replace("|", ";*.", $custom_softType));
	}else{
        global $cfg_softSize;
        global $cfg_softType;
        $huoniaoTag->assign('softSize', $cfg_softSize);
        $huoniaoTag->assign('softType', "*.".str_replace("|", ";*.", $cfg_softType));
    }

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('file', $file);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? 1 : $weight);
	$huoniaoTag->assign('note', $note);

	//阅读权限-单选
	$huoniaoTag->assign('arcrankList', array('0', '1'));
	$huoniaoTag->assign('arcrankName',array('显示','隐藏'));
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 0 : $arcrank);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $tab."_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
