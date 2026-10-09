<?php
/**
 * 装修预约
 *
 * @version        $Id: renovationVisit.php 2014-3-6 下午23:47:22 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationVisit");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationVisit.html";

$action = "renovation_visit";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		$archives = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_case` WHERE `id` = ".$results[0]["case"]);
		$dsqlInfo = $dsql->dsqlOper($archives, "results");

		$results[0]["title"] = $dsqlInfo[0]["title"];

		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;

//更新预约信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = '$state' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新装修预约参观状态为已联系", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//更新预约状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新装修预约参观状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除预约
}else if($dopost == "delVisit"){
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
		adminLog("删除装修预约参观", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取预约列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where = getCityFilter('c.`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('c.`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND (v.`people` like '%$sKeyword%' OR v.`contact` like '%$sKeyword%' OR v.`ip` like '%$sKeyword%'";

		$storeSql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_construction` WHERE `title` like '%$sKeyword%'");
		$storeResult = $dsql->dsqlOper($storeSql, "results");
		if($storeResult){
			$storeid = array();
			foreach($storeResult as $key => $store){
				array_push($storeid, $store['id']);
			}
			if(!empty($storeid)){
				$where .= " OR v.`conid` in (".join(",", $storeid)."))";
			}else{
                $where .= ")";
            }
		}else{
            $where .= ")";
        }
	}

	$archives = $dsql->SetQuery("SELECT v.`id` FROM `#@__".$action."` v LEFT JOIN `#@__renovation_construction` c ON c.`id` = v.`conid`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待联系
	$totalGray = $dsql->dsqlOper($archives." WHERE `state` = 0".$where, "totalCount");
	//已联系
	$totalAudit = $dsql->dsqlOper($archives." WHERE `state` = 1".$where, "totalCount");

	if($state != ""){
		$where .= " AND v.`state` = $state";

		if($state == 0){
		    $totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
		    $totalPage = ceil($totalAudit/$pagestep);
		}
	}
	$where .= " order by v.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT v.`id`, v.`conid`, v.`people`, v.`contact`, v.`ip`, v.`ipaddr`, v.`state`, v.`pubdate` FROM `#@__".$action."` v LEFT JOIN `#@__renovation_construction` c ON c.`id` = v.`conid` WHERE 1 = 1".$where);

	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["conid"] = $value["conid"];

			$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_construction` WHERE `id` = ". $value["conid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["case"] = $typename[0]['title'];

			$list[$key]["people"] = $value["people"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["people"] = $value["people"];
			$list[$key]["ipaddr"] = $value["ipaddr"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "renovation",
				"template"    => "company-site-detail",
				"id"          => $value['conid']
			);
			$list[$key]['curl'] = getUrlPath($param);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}, "guestList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.'}}';
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
		'admin/renovation/renovationVisit.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
