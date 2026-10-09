<?php
/**
 * 管理酒店房间信息
 *
 * @version        $Id: travelhotelroom.php 2019-5-20 上午00:07:12 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("travelhotelList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelhotelroom.html";

$tab = "travel_hotelroom";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE  `hotelid` = ".$id);
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `id` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `hotelid`, `area`, `price`, `pubdate`, `weight`, `sale`, `valid` FROM `#@__".$tab."` WHERE `hotelid` = ".$id.$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"] . ($value["valid"] ? '（已售出）' : '（未售出）');
			$list[$key]["hotelid"] = $value["hotelid"];
			$list[$key]["sale"] = $value["sale"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["pubdate"] = $value["pubdate"] ? date("Y-m-d H:i:s", $value["pubdate"]) : '';
			$list[$key]["weight"] = $value["weight"];

			$videoSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_hotel` WHERE `id` = ". $value['hotelid']);
			$videoResult = $dsql->getTypeName($videoSql);
			$list[$key]["hostname"] = $videoResult[0]["title"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "travelhotelroom": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("travelhotelDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT `title` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除酒店房间信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/travel/travelhotelroom.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/travel.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('action', $action);

	if($action == "hotelroom"){
		//楼盘信息
		$videoSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__travel_hotel` WHERE `id` = ". $id);
		$videoResult = $dsql->getTypeName($videoSql);
		if(!$videoResult)die('酒店不存在！');
		$huoniaoTag->assign('videoid', $videoResult[0]['id']);
		$huoniaoTag->assign('videoname', $videoResult[0]['title']);
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
