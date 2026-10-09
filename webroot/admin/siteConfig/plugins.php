<?php
/**
 * 插件
 *
 * @version        $Id: plugins.php 2018-07-09 下午13:22:10 $
 * @package        HuoNiao.SiteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("plugins");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "plugins.html";

$action = "site_plugins";

$adminRoute = str_replace('plugins.php', '', $_SERVER['SCRIPT_NAME']);  //后台目录

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `author` like '%$sKeyword%')";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `pid`, `title`, `version`, `uptime`, `description`,  `litpic`,  `author`, `pubdate`, `state` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["pid"] = $value["pid"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["version"] = $value["version"] ? $value["version"] : 'v1.0';
			$list[$key]["update"] = $value["uptime"];
			$list[$key]["author"] = $value["author"];
			$list[$key]["pubdate"] = $value["pubdate"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["description"] = $value["description"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//更新状态
}elseif($dopost == "updateState"){

	if($id){

		$sql = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = $val WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo '{"state": 200, "info": '.json_encode("修改失败！").'}';
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("信息传递失败！").'}';
	}
	die;

//删除
}elseif($dopost == "del"){
	$sql = $dsql->SetQuery("SELECT `pid`, `title`, `delsql` FROM `#@__".$action."` WHERE `id` = $id");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){

		$pid = $ret[0]['pid'];
		$title = $ret[0]['title'];

		//删除数据库
		$delsql = $ret[0]['delsql'];
		if($delsql){
			$delsql = explode("\r\n",$delsql);
			foreach($delsql as $v){
				$archives = $dsql->SetQuery($v);
				$dsql->dsqlOper($archives, "update");
			}
		}

		//删除插件目录
		$pluginsFloder = HUONIAOINC."/plugins/".$pid."/";
		deldir($pluginsFloder);

		//删除记录
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("卸载插件", $id . " => " . $title);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}else{
		echo '{"state": 200, "info": '.json_encode("插件不存在，删除失败！").'}';
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/plugins.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('adminRoute', $adminRoute);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
