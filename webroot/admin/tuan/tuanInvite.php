<?php
/**
 * 邀请购买记录
 *
 * @version        $Id: tuanInvite.php 2013-12-15 上午10:52:21 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanInvite");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanInvite.html";

if($dopost == "getList"){
	if(!testPurview("tuanInvite")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";
	$orderid = array();
	
	if($sKeyword != ""){
		$where .= " AND `username` like '%$sKeyword%'";
	}
	
	if($state != ""){
		$where .= " AND `recfan` = $state";
	}
	
	$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `recid` != 0".$where." ORDER BY `id` DESC");
	$userResult = $dsql->dsqlOper($userSql, "results");
	
	if($userResult){
		
		$where = "";
		if($start != ""){
			$where .= " AND `orderdate` >= ". GetMkTime($start);
		}
		
		if($end != ""){
			$where .= " AND `orderdate` <= ". GetMkTime($end);
		}
			
		foreach($userResult as $key => $user){
			$orderSql = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `orderstate` = 4 AND `userid` = ".$user['id'].$where." ORDER BY `id` ASC limit 0,1");
			$orderResult = $dsql->dsqlOper($orderSql, "results");
			if($orderResult){
				array_push($orderid, $orderResult[0]['id']);
			}
		}
	}
	
	if(!empty($orderid)){
		$orderid = join(",", $orderid);
		$archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `id` in (".$orderid.")");
		
		//总条数
		$totalCount = $dsql->dsqlOper($archives, "totalCount");
		//总分页数
		$totalPage = ceil($totalCount/$pagestep);
		//等待审核
		$pending = 0;
		//已批准
		$approved = 0;
		//已拒绝
		$rejected = 0;
		
		$atpage = $pagestep*($page-1);
		$results = $dsql->dsqlOper($archives." LIMIT $atpage, $pagestep", "results");
	}else{
		$totalCount = 0;
		$totalPage  = 0;
		$pending    = 0;
		$approved   = 0;
		$rejected   = 0;
		$results    = array();
	}
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			
			$userSql = $dsql->SetQuery("SELECT `id`, `username`, `recid`, `recfan`, `rectime` FROM `#@__member` WHERE `id` = ".$value['userid']);
			$userResult = $dsql->dsqlOper($userSql, "results");
			
			if($userResult){
				$list[$key]["userid"] = $userResult[0]["id"];
				$list[$key]["username"] = $userResult[0]["username"];
				$list[$key]["recfan"] = $userResult[0]["recfan"];
				$list[$key]["rectime"] = $userResult[0]["rectime"] == 0 ? "" : date('Y-m-d H:i:s', $userResult[0]["rectime"]);
				
				if($userResult[0]["recfan"] == 0){
					$pending++;
				}elseif($userResult[0]["recfan"] == 1){
					$approved++;
				}elseif($userResult[0]["recfan"] == 2){
					$rejected++;
				}
				
			}else{
				$list[$key]["userid"] = 0;
				$list[$key]["username"] = "未知";
				$list[$key]["recfan"] = -1;
				$list[$key]["rectime"] = "";
			}
			
			$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ".$userResult[0]["recid"]);
			$userResult = $dsql->dsqlOper($userSql, "results");
			
			if($userResult){
				$list[$key]["recuserid"] = $userResult[0]["id"];
				$list[$key]["recusername"] = $userResult[0]["username"];
			}else{
				$list[$key]["recuserid"] = 0;
				$list[$key]["recusername"] = "未知";
			}
			
			$list[$key]["orderid"] = $value["id"];
			$list[$key]["ordernum"] = $value["ordernum"];
			$list[$key]["orderdate"] = date('Y-m-d H:i:s', $value["orderdate"]);
			$list[$key]["orderprice"] = sprintf("%.2f", $value["orderprice"]);
			
		}

		if($state != ""){
			if($state == 0){
				$totalPage = ceil($pending/$pagestep);
			}elseif($state == 1){
				$totalPage = ceil($approved/$pagestep);
			}elseif($state == 2){
				$totalPage = ceil($rejected/$pagestep);
			}
		}
		
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "pending": '.$pending.', "approved": '.$approved.', "rejected": '.$rejected.'}, "tuanOrderList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "pending": '.$pending.', "approved": '.$approved.', "rejected": '.$rejected.'}}';
		}
		
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "pending": '.$pending.', "approved": '.$approved.', "rejected": '.$rejected.'}}';
	}
	die;

//批准	
}else if($dopost == "approve"){
	if(!testPurview("tuanInviteOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	
	require_once(HUONIAOINC."/config/tuan.inc.php");
	global $recMoney;
	
	foreach($each as $val){
		$archives = $dsql->SetQuery("SELECT `recid`, `recfan` FROM `#@__member` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "results");
		
		if($results){
			if($results[0]['recid'] != 0 && $results[0]['recfan'] == 0){
				
				$userSql = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = ".$results[0]['recid']);
				$userResult = $dsql->dsqlOper($userSql, "results");
				
				if($userResult){
					$money = $userResult[0]['money'] + $recMoney;
					$userSql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = ".$money." WHERE `id` = ".$results[0]['recid']);
					$dsql->dsqlOper($userSql, "update");
					
					$userSql = $dsql->SetQuery("UPDATE `#@__member` SET `recfan` = 1, `rectime` = ".GetMkTime(time())." WHERE `id` = ".$val);
					$dsql->dsqlOper($userSql, "update");
					
				}else{
					$error[] = $val;
				}
				
			}else{
				$error[] = $val;
			}
		}else{
			$error[] = $val;
		}
		
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("批准邀请购买记录", $id);
		echo '{"state": 100, "info": '.json_encode("批准成功！").'}';
	}
	die;

//拒绝	
}else if($dopost == "refusal"){
	if(!testPurview("tuanInviteOpera")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	
	foreach($each as $val){
		$archives = $dsql->SetQuery("SELECT `recid`, `recfan` FROM `#@__member` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "results");
		
		if($results){
			if($results[0]['recid'] != 0 && $results[0]['recfan'] == 0){
				$userSql = $dsql->SetQuery("UPDATE `#@__member` SET `recfan` = 2, `rectime` = ".GetMkTime(time())." WHERE `id` = ".$val);
				$dsql->dsqlOper($userSql, "update");
			}else{
				$error[] = $val;
			}
		}else{
			$error[] = $val;
		}
		
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("拒绝邀请购买记录", $id);
		echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/tuan/tuanInvite.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}