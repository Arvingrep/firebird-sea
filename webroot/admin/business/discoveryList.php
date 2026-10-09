<?php
/**
 * 管理探店列表
 *
 * @version        $Id: discoveryList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("discoveryList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "discoveryList.html";

global $handler;
$handler = true;

$action = "business";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//城市管理员
    $where .= getCityFilter('l.`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('l.`cityid`', $cityid);
    }

    if($sKeyword != ""){

		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($userSql, "results");
		foreach ($results as $key => $value) {
			$sidArr[$key] = $value['id'];
		}

		if(!empty($sidArr)){
			$where .= " AND (l.`title` like '%$sKeyword%' OR l.`company` like '%$sKeyword%' OR l.`phone` like '%$sKeyword%' OR l.`address` like '%$sKeyword%' OR l.`tel` like '%$sKeyword%' OR l.`uid` in (".join(",",$sidArr)."))";
		}else{
			$where .= " AND (l.`title` like '%$sKeyword%' OR l.`company` like '%$sKeyword%' OR l.`phone` like '%$sKeyword%' OR l.`address` like '%$sKeyword%' OR l.`tel` like '%$sKeyword%')";
		}

	}

	if($sType != ""){
		if($dsql->getTypeList($sType, $action."_discoverytype")){
			global $arr_data;
			$arr_data = array();
			$lower = arr_foreach($dsql->getTypeList($sType, $action."_discoverytype"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}

		$where .= " AND l.`typeid` in (".$lower.")";
	}

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."_discoverylist` l WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND l.`state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND l.`state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND l.`state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND l.`state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by l.`pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, l.`title`, l.`typeid`, l.`pubdate`, l.`state`, l.`sid` FROM `#@__".$action."_discoverylist` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		$i = 0;
		$time = time();

		$bobj = new business();
		$config = $bobj->config();
		$busiType = array( 0 => '类型错误', 1 => $config['trialName'], 2 => $config['enterpriseName']);

		foreach ($results as $key=>$value) {
			$list[$i]["id"] = $value["id"];
			$list[$i]["uid"] = $value["uid"];

			$user = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value['uid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$user = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
			}
			$list[$i]['user'] = $user;

			$list[$i]["title"] = $value["title"];
			$list[$i]["pubdate"] = $value["pubdate"];

			//分类
			$list[$i]["typeid"] = $value["typeid"];
			$typename = "";
			if($value["typeid"]){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$action."_discoverytype` WHERE `id` = ".$value['typeid']);
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$typename = $ret[0]['typename'];
				}
			}
			$list[$i]['typename'] = $typename;

			$store = array();
			if($value['sid']){
				$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__business_list` WHERE `id` IN (".$value['sid'].")");
				$res = $dsql->dsqlOper($sql, "results");
				$store = $res;
			}
			$list[$i]['store'] = $store;

			$list[$i]["state"] = $value['state'];

			$param = array(
				"service"     => "business",
				"template"    => "discovery_detail",
				"id"          => $value['id']
			);
			$list[$i]["url"] = getUrlPath($param);

			$i++;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "discoveryList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//更新状态
}elseif($dopost == "updateState"){

	if (!testPurview("editdiscovery")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){

		//查询信息之前的状态

		//验证权限
		// $sql = $dsql->SetQuery("SELECT `title`, `state`, `pubdate`, `uid` FROM `#@__".$action."_discoverylist` WHERE `id` = $val" . getCityFilter('`cityid`'));
		// $ret = $dsql->dsqlOper($sql, "results");
		// if($ret){

		// }



		//验证权限
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."_discoverylist` SET `state` = $arcrank WHERE `id` = ".$val . getCityFilter('`cityid`'));
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新探店信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除
}elseif($dopost == "del"){

	if (!testPurview("deldiscovery")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

	if($id == "") die;

	$each = explode(",", $id);
	$error = array();
	$title = array();
	foreach($each as $val){

		//验证权限
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_discoverylist` WHERE `id` = $val" . getCityFilter('`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){


			//删除点评
			// $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_comment_all` WHERE `uid` = ".$val);
			// $dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_discoverylist` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}else{
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除探店信息", join(", ", $title));
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;


}

checkPurview("discoveryList");

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
		'ui/chosen.jquery.min.js',
		'admin/business/discoveryList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_discoverytype")));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
