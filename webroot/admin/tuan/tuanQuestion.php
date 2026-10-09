<?php
/**
 * 团购答疑
 *
 * @version        $Id: tuanQuestion.php 2013-12-4 下午15:29:30 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanQuestion");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanQuestion.html";

$db = "tuan_question";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `userid`, `content`, `by`, `replay`, `rtime`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		
		$by = "";
		if($results[0]["by"] != ""){
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["by"]);
			$member = $dsql->dsqlOper($archives, "results");
			$by = $member[0]["username"];
		}
		$results[0]["by"] = $by;
		
		if($results[0]["userid"] == 0){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["userid"]);
			$member = $dsql->dsqlOper($archives, "results");
			
			$username = $member[0]["username"];
		}
		$results[0]["username"] = $username;
		$results[0]["rtime"] = date('Y-m-d H:i:s', $results[0]["rtime"]);
		$results[0]["dtime"] = date('Y-m-d H:i:s', $results[0]["dtime"]);
		
		echo json_encode($results);
		
	}else{
		echo '{"state": 200, "info": '.json_encode("评论信息获取失败！").'}';
	}
	die;
	
//更新信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	
	$by      = $userLogin->getUserID();
	$rtime   = GetMkTime(time());
	
	$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `replay` = '$replay', `ischeck` = '$isCheck', `by` = '$by', `rtime` = '$rtime' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新更新团购答疑信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//更新状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `ischeck` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新团购答疑信息状态", $id."=>".$arcrank);
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
		adminLog("删除团购答疑信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
	
//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";
	
	if($sKeyword != ""){
		$where .= " AND `content` like '%$sKeyword%'";
	}
	
	if($state != ""){
		$where .= " AND `ischeck` = $state";
	}
	$where .= " order by `id` desc";
	
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."`");
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `replay`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["userId"] = $value["userid"];
			
			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["userName"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];
			
			$list[$key]["content"] = cn_substrR(strip_tags($value["content"]), 30)."...";
			$list[$key]["time"] = date('Y-m-d H:i:s', $value["dtime"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipAddr"] = $value["ipaddr"];
			
			$state = "";
			switch($value["ischeck"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
			}
			
			$list[$key]["isCheck"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "questionList": '.json_encode($list).'}';
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
		'ui/jquery-ui-selectable.js',
		'admin/tuan/tuanQuestion.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}