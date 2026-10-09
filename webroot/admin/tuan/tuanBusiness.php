<?php
/**
 * 团购商务合作
 *
 * @version        $Id: tuanBusiness.php 2013-12-6 下午20:50:12 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanBusiness");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanBusiness.html";

$db = "tuan_business";

//更新状态
if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `arcrank` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新团购商务合作信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//删除
}else if($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
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
		adminLog("删除团购商务合作信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
	
//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";
	
	if($sKeyword != ""){
		$where .= " AND (`name` like '%$sKeyword%' OR `phone` like `$$sKeyword$` OR `shopname` like `%$sKeyword%`)";
	}
	
	if($arcrank != ""){
		$where .= " AND `arcrank` = $arcrank";
	}
	$where .= " order by `id` desc";
	
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."`");
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `name`, `phone`, `shopname`, `pubdate`, `ip`, `ipaddr`, `arcrank` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["name"] = $value["name"];
			$list[$key]["phone"] = $value["phone"];
			$list[$key]["shopname"] = $value["shopname"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];
			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核失败";
					break;
			}
			
			$list[$key]["state"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "businessList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/tuan/tuanBusiness.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}