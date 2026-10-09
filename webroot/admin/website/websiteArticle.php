<?php
/**
 * 自助建站新闻中心
 *
 * @version        $Id: websiteArticle.php 2014-06-23 上午10:32:21 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteArticle");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "自助建站新闻中心";

if(empty($website)) die('网站信息传递失败！');

$tab = "website_article";

if($dopost != ""){
	$templates = "websiteArticleAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap.min.js',
		'publicUpload.js',
		'admin/website/websiteArticleAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "websiteArticle.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/website/websiteArticle.js'
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
	if($sType != ""){
		$where .= " AND `typeid` = $sType";
	}

	$where .= " order by `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `website` = $website");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `click`, `pubdate` FROM `#@__".$tab."` WHERE `website` = $website".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["typeid"] = $value["typeid"];

			//分类
			$typeSql = $dsql->SetQuery("SELECT `name` FROM `#@__".$tab."type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["type"] = $typename[0]['name'];

			$list[$key]["click"] = $value["click"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "website",
				"template" => "site".$website,
				"param"     => "/newsd.html?sid=".$value['id']
			);
			$url = str_replace("?/newsd.html", "/newsd.html", getUrlPath($param));
			$list[$key]['url'] = $url;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "websiteArticle": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle = "新增自助建站新闻";

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`website`, `title`, `typeid`, `litpic`, `click`, `keywords`, `description`, `body`, `pubdate`) VALUES ('$website', '$title', '$typeid', '$litpic', '$click', '$keywords', '$description', '$body', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增自助建站新闻", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改房产资讯";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			die;
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `typeid` = $typeid, `litpic` = '$litpic', `click` = '$click', `keywords` = '$keywords', `description` = '$description', `body` = '$body' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改自助建站新闻", $title);
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
				$litpic      = $results[0]['litpic'];
				$click       = $results[0]['click'];
				$keywords     = $results[0]['keywords'];
				$description = $results[0]['description'];
				$body        = $results[0]['body'];

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
			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "website");
			}

			delPicFile($results[0]['litpic'], "delThumb", "website");

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
			adminLog("删除自助建站新闻", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;


//管理应用分类
}elseif($dopost == "manageType"){
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."type` WHERE `website` = $website ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$types = array();
	if($results){
		foreach($results as $key => $val){
			$types[$key]['id'] = $val['id'];
			$types[$key]['val'] = $val['name'];
		}
	}
	echo json_encode($types);
	die;

//修改应用分类
}elseif($dopost == "saveManageType"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	foreach($json as $key => $val){
		if($val['id'] != ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."type` WHERE `id` = ".$val['id']);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$where = array();
				if($results[0]['weight'] != $val['weight']){
					$where[] = '`weight` = '.$val['weight'];
				}
				if($results[0]['name'] != $val['val']){
					$where[] = '`name` = "'.$val['val'].'"';
				}
				if(!empty($where)){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."type` SET ".join(",", $where)." WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}
		}else{
			if(!empty($val['val'])){
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."type` (`website`, `name`, `weight`) VALUES ('$website', '".$val['val']."', ".$val['weight'].")");
				$dsql->dsqlOper($archives, "update");
			}
		}
	}
	$typeListArr = array();
	array_push($typeListArr, array("id" => 0, "name" => "请选择"));
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."type` WHERE `website` = '$website' ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			array_push($typeListArr, $val);
		}
	}
	echo json_encode($typeListArr);
	die;

//删除应用分类
}elseif($dopost == "delManageType"){
	if(!empty($id)){
		//删除分类下信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `typeid` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(count($results) > 0){
			foreach($results as $key => $val){

				//删除内容图片
				$body = $val['body'];
				if(!empty($body)){
					delEditorPic($body, "website");
				}

				delPicFile($val['litpic'], "delThumb", "website");

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val['id']);
				$results = $dsql->dsqlOper($archives, "update");

			}
		}

		//删除分类
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."type` WHERE `id` = ".$id);
		$dsql->dsqlOper($archives, "update");
	}
	die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	require_once(HUONIAOINC."/config/website.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('website', (int)$website);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('typeid', empty($typeid) ? "''" : $typeid);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('keywords', $keywords);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('body', $body);

	$typeListArr = array();
	$typeListArr_ = array("0" => "请选择");
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."type` WHERE `website` = $website ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			$typeListArr[$key]['id'] = $val['id'];
			$typeListArr[$key]['typename'] = $val['name'];

			$typeListArr_[$val['id']] = $val['name'];
		}
	}

	$huoniaoTag->assign('typeListArr', json_encode($typeListArr));
	$huoniaoTag->assign('typeListArr_', $typeListArr_);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
