<?php
/**
 * 自助建站留言
 *
 * @version        $Id: websiteGuest.php 2014-6-25 下午17:54:25 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteGuest");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteGuest.html";

if(empty($website)) die('网站信息传递失败！');

$action = "website_guest";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `people`, `contact`, `ip`, `ipaddr`, `note`, `reply`, `state`, `pubdate` FROM `#@__".$action."` WHERE `website` = $website AND `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		echo json_encode($results);
	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;
	
//更新评论信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `note` = '$note', `reply` = '$reply', `state` = '$state' WHERE `website` = $website AND `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新自助建站留言", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//更新评论状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = $arcrank WHERE `website` = $website AND `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新自助建站留言状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//删除评论
}else if($dopost == "delGuest"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除自助建站留言", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
	
//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";
	
	if($sKeyword != ""){
		$where .= " AND `people` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `ip` like '%$sKeyword%' OR `note` like '%$sKeyword%'";
	}
	
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."`");
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE `website` = $website".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." WHERE `website` = $website AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." WHERE `website` = $website AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." WHERE `website` = $website AND `state` = 2".$where, "totalCount");
	
	if($state != ""){
		$where .= " AND `state` = $state";
	}
	$where .= " order by `id` desc";
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `people`, `contact`, `ip`, `ipaddr`, `state`, `pubdate` FROM `#@__".$action."` WHERE `website` = $website".$where);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["people"] = $value["people"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["people"] = $value["people"];
			$list[$key]["ipaddr"] = $value["ipaddr"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "guestList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/website/websiteGuest.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('website', (int)$website);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}