<?php
/**
 * 邮件模板
 *
 * @version        $Id: mailtemp.php 2016-6-17 上午10:34:10 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("mailTemp");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "mailtemp.html";

$action = "site_mailtemp";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	if($sKeyword != ""){
		$where .= " AND (`temp` like '%$sKeyword%' OR `title` like '%$sKeyword%')";
	}

	if($sType != ""){
		$where .= " AND `module` = '$sType'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `system` asc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$sql = $dsql->SetQuery("SELECT `title`, `subject` FROM `#@__site_module` WHERE `name` = '".$value['module']."'");
			$results = $dsql->dsqlOper($sql, "results");
			if($results){
				$list[$key]["module"] = $results[0]["subject"] ? $results[0]["subject"] : $results[0]["title"];
			}else{
				$list[$key]["module"] = '会员';
			}

			$list[$key]["system"]  = $value["system"];
			$list[$key]["temp"]    = $value["temp"];
			$list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "mailtemp": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `system` != 1 AND `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除邮件模板", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/mailtemp.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取模块数据
function getModuleList(){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `parentid` != 0 AND `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
	try{
		$result = $dsql->dsqlOper($sql, "results");

		if($result){//如果有子类
			$i = 0;
			foreach($result as $key => $value){
				$results[$i]["title"] = $value['subject'] ? $value['subject'] : $value['title'];
				$results[$i]["name"] = $value['name'];

				if($value['name'] == "article"){
					$i++;
					$results[$i]["title"] = "图片";
					$results[$i]["name"] = "pic";
				}

				$i++;
			}
			return $results;
		}else{
			return "";
		}

	}catch(Exception $e){
		//die("模块数据获取失败！");
	}
}
