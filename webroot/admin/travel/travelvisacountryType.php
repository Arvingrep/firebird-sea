<?php
/**
 * 管理签证国家
 *
 * @version        $Id: travelvisacountryType.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("travelvisacountryType");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelvisacountryType.html";

global $handler;
$handler = true;

$action = "travel";
$now = GetMkTime(time());

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    if($sKeyword != ""){
		$where .= " AND `typename` like '%$sKeyword%' ";
	}

	if($sType != ""){
		$where .= " AND `typeid` = '$sType'";
	}

	if($scontinent != ""){
		$where .= " AND `continent` = '$scontinent'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__travel_visacountrytype` WHERE 1=1");

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
		}elseif($state == 3){
			$totalPage = ceil($totalNoshow/$pagestep);
		}
	}

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `typename`, `weight`, `pubdate`, `id`, `continent`, `typeid`, `price`, `state` FROM `#@__travel_visacountrytype` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["typename"] = $value["typename"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = $value["pubdate"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["continent"] = $value["continent"];
			$list[$key]["typeid"] = $value["typeid"];

			include_once HUONIAOROOT."/api/handlers/travel.class.php";
			$travel = new travel();
			if($value['typeid']!=''){
				$typename = $travel->gettypename("typeid_type", $value['typeid']);
			}
			$list[$key]["typeidname"]  = !empty($typename) ? $typename : '';

			$list[$key]["continentname"]  = $value['continent'] ? $travel->gettypename("continent_type", $value['continent']) : '';

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
			}

			$list[$key]["state"] = $state;

			$list[$key]["date"] = date('y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "travel",
				"template"    => "visacountry",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "articleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("travelvisacountryType")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){
		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__travel_visacountrytype` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['typename']);

			//删除缩略图
			delPicFile($results[0]['icon'], "delThumb", $action);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__travel_visacountrytype` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

			checkTravelVisacountrytypeCache($val);
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除签证国家", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;

//删除所有待审核信息
}elseif($dopost == "delAllGray"){
	if(!testPurview("travelvisacountryType")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$archives = $dsql->SetQuery("SELECT * FROM `#@__travel_visacountrytype` WHERE `state` = 0");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {
			//删除缩略图
			delPicFile($value['icon'], "delThumb", $action);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__travel_visacountrytype` WHERE `id` = ".$value['id']);
			$dsql->dsqlOper($archives, "update");

			checkTravelVisacountrytypeCache($value['id']);
		}

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("travelvisacountryType")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__travel_visacountrytype` SET `state` = ".$arcrank." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
			checkTravelVisacountrytypeCache($val);
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新签证国家状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
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
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/travel/travelvisacountryType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);

	//分类
	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$travelTypeList = $travel->typeid_type();
	$huoniaoTag->assign('typeListArr', json_encode($travelTypeList));

	$continentTypeList = $travel->continent_type();
	$huoniaoTag->assign('continentTypeListArr', json_encode($continentTypeList));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

// 检查缓存
function checkTravelVisacountrytypeCache($id){
    checkCache("travel_visacountrytype_list", $id);
    clearCache("travel_visacountrytype_total", "key");
    clearCache("travel_visacountrytype_detail", $id);
}