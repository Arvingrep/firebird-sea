<?php
/**
 * 装修公司促销
 *
 * @version        $Id: renovationStoreSale.php 2014-3-6 下午23:06:12 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationStoreSale");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "装修公司促销";

$tab = "renovation_storesale";

if($dopost != ""){
	$templates = "renovationStoreSaleAdd.html";
	
	//js
	$jsFile = array(
		'admin/renovation/renovationStoreSaleAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "renovationStoreSale.html";
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/renovation/renovationStoreSale.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());       //发布时间
	
	//表单二次验证
	if(trim($title) == ''){
		echo '{"state": 200, "info": "标题不能为空"}';
		exit();
	}
	
	if(trim($body) == ''){
		echo '{"state": 200, "info": "促销内容不能为空"}';
		exit();
	}
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";
	
	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	
	$where .= " order by `weight` desc, `pubdate` desc";
	
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `weight`, `click`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["click"] = $value["click"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}
		
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "renovationStoreSaleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
		
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){
	
	$pagetitle     = "新增装修公司促销";
	
	//表单提交
	if($submit == "提交"){
		
		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`store`, `title`, `weight`, `click`, `body`, `pubdate`) VALUES ('$store', '$title', '$weight', '$click', '$body', '$pubdate')");
		$return = $dsql->dsqlOper($archives, "update");
		
		if($return == "ok"){
			adminLog("新增装修公司促销", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){
	
	$pagetitle = "修改装修公司促销";
	
	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){
		
		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `weight` = '$weight', `click` = '$click', `body` = '$body' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");
		
		if($return == "ok"){
			adminLog("修改装修公司促销", $title);
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
				$weight      = $results[0]['weight'];
				$click       = $results[0]['click'];
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
				delEditorPic($body, "renovation");
			}
			
			//删除资讯
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除装修公司促销", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;
		
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('weight', $weight == "" ? 50 : $weight);
	$huoniaoTag->assign('click', $click == 0 ? 1 : $click);
	$huoniaoTag->assign('body', $body);
	
	//楼盘信息
	$loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `id` = ". $store);
	$loupanResult = $dsql->getTypeName($loupanSql);
	if(!$loupanResult)die('公司不存在！');
	$huoniaoTag->assign('store', $loupanResult[0]['id']);
	$huoniaoTag->assign('storename', $loupanResult[0]['company']);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}