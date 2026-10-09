<?php
/**
 * 登录记录
 *
 * @version        $Id: adminLogin.php 2014-1-2 上午09:54:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "adminLogin.html";

$db = "adminlogin";

if($id != ""){
	checkPurview("adminList");
}

$adminid = $id ? $id : $userLogin->getUserID();
if(empty($adminid)){
	ShowMsg("管理员ID传递失败！", 'javascript:;');
	exit();
}

//验证城市管理员是否有权限
if($userType == 3){
	//登录人的mgroupid
	$mgroupid = 0;
	$sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$mgroupid = $ret[0]['mgroupid'];
	}

	//要查看的管理员的mgroupid
	$mgroupid_ = 0;
	$sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $adminid);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$mgroupid_ = $ret[0]['mgroupid'];
	}

	if($mgroupid != $mgroupid_){
		ShowMsg("权限验证失败！", 'javascript:;');
		exit();
	}
}


//删除记录
if($dopost == "delLogs"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
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
			adminLog("删除登录记录", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//清空记录
}elseif($dopost == "delAllLogs"){
	if($admin == ""){
		$admin = $userLogin->getUserID();
	}
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `userid` = ".$admin);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("清空登录记录", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取日志列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `loginip` like '%".$sKeyword."%'";
	}

	if($admin != ""){
		$where .= " AND `userid` = ". $admin;
	}else{
		$where .= " AND `userid` = ". $userLogin->getUserID();
	}

	$where .= " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `logintime`, `loginip`, `ipaddr`, `type` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["userid"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["admin"]  = $username[0]["username"] == null ? "" : $username[0]["username"];

			$list[$key]["logintime"] = date('Y-m-d H:i:s', $value["logintime"]);
			$list[$key]["loginip"] = $value["loginip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];
			$list[$key]["type"] = $value["type"] == 1 ? '短信验证码' : ($value["type"] == 2 ? '微信扫码' : '账号密码');
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "logsList": '.json_encode($list).'}';
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
		'admin/member/adminLogin.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('admin', $id);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
