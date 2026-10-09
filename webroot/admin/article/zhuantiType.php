<?php
/**
 * 专题
 *
 * @version        $Id: zhuanti.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/article";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "zhuantiType.html";

$action = "article";
$db = "article_zhuanti";

checkPurview("zhuanti");

$title = "新闻专题";
$dopost = $dopost ? $dopost : "";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$pid = (int)$pid;

	$where = "";
    // $where = getCityFilter('`cityid`');

    // if ($adminCity) {
    //     $where = " AND `cityid` = $adminCity";
    // }

    if($sKeyword != ""){
		$where .= " AND (`typename` like '%$sKeyword%' OR `description` like '%$sKeyword%')";
	}


	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."` WHERE `parentid` = $pid");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by `weight` DESC, `id`";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `parentid` = $pid".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["typename"] = $value["typename"];
			$list[$key]["description"] = cn_substrR($value["description"], 60);
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["date"] = date("Y-m-d H:i:s", $value["pubdate"]);

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
				case "3":
					$state = "取消显示";
					break;
			}
			$list[$key]["state"] = $state;

			$param = array(
				"service"     => "article",
				"template"    => "zhuanti",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "zhuantiList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;
}else if($dopost == "updateState"){
	if($id != ""){
		$state = (int)$state;

		$sql = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = $state WHERE `id` IN ($id)");
		$res = $dsql->dsqlOper($sql, "update");
		if($results == "ok"){
			adminLog("更新" . $title . "信息状态", $id . "=>" . $state);
			echo '{"state": 100, "info": '.json_encode('操作成功').'}';
			exit();
		}else{
			echo '{"state": 100, "info": '.json_encode('操作失败').'}';
			exit();
		}
	}
	die;

//删除专题
}else if($dopost == "del"){
	if($id != ""){

		$idsArr = array();

		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $action."type", 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}

		foreach ($idsArr as $kk => $id) {

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

		}

		adminLog("删除".$title."分类", join(",", $idsArr));
		echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
		die;


	}
	die;
}
// $archives = $dsql->SetQuery("SELECT `id`, `username`, `nickname`, `mtype` FROM `#@__member` WHERE (`mtype` = 0 || `mtype` = 3) AND `state` = 0");
// $adminList = $dsql->dsqlOper($archives, "results");

//验证模板文件
if(file_exists($tpl."/".$templates)){


	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery-smartMenu.js',
		'admin/article/zhuantiType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pid', $pid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/article";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
