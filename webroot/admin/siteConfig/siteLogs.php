<?php
/**
 * 操作日志管理
 *
 * @version        $Id: siteLogs.php 2013-11-25 上午09:21:18 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteLogs.html";

$db = "sitelog";

//删除记录
if($dopost == "delLogs"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `admin` in ($adminIds) AND `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除操作日志", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//清空记录
}elseif($dopost == "delAllLogs"){
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `admin` in ($adminIds,-1)");
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("清空操作日志", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取日志列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `admin` in (-1,$adminIds)";

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` < ". GetMkTime(date("Y-m-d",strtotime("$end +1 day")));
	}

	if($admin != ""){
		$where .= " AND `admin` = ". $admin;
	}

	if($module != ""){
		$where .= " AND `module` = '$module'";
	}

	if($keywords != ""){
		$where .= " AND (`name` like '%$keywords%' OR `note` like '%$keywords%' OR `ip` like '%$keywords%')";
	}

	$where .= " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `admin`, `name`, `note`, `ip`, `pubdate` FROM `#@__".$db."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			if($value['admin'] > 0){
				$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["admin"]);
				$username = $dsql->dsqlOper($member, "results");
				$list[$key]["admin"]  = $username[0]["username"] == null ? "已删除管理员" . $value["admin"] : $username[0]["username"];
			}else{
				$list[$key]["admin"]  = '管理员';
			}

			$list[$key]["name"] = $value["name"];
			$list[$key]["note"] = $value["note"];
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
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

	//css
	$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/siteLogs.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    
    $max_siteLog_save_day = (int)$max_siteLog_save_day;
    $huoniaoTag->assign('max_siteLog_save_day', $max_siteLog_save_day == 0 ? '' : $max_siteLog_save_day);

	$huoniaoTag->assign('adminList', json_encode($adminListArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
