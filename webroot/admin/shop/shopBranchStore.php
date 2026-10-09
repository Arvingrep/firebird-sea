<?php
/**
 * 管理商城店铺分店
 *
 * @version        $Id: shopBranchStore.php 2014-2-11 下午17:26:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopBranchStore");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopBranchStore.html";

$tab = "shop_branch_store";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('b.`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('b.`cityid`', $cityid);
    }

	$where .= " AND s.`id` != ''";

	if($sid){
		$where .= " AND b.`branchid` = '$sid'";
	}

	if($sKeyword != ""){

        $_where = array();
        array_push($_where, "b.`title` like '%$sKeyword%' OR b.`tel` like '%$sKeyword%' OR s.`title` like '%$sKeyword%'");

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
                array_push($_where, "b.`userid` in (".join(",", $userid).")");
			}
		}

		$where .= " AND (".join(" OR ", $_where).")";

	}

	if($sIndustry != ""){
		$where .= " AND b.`industry` = $sIndustry";
	}

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "shopaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "shopaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND b.`addrid` in ($lower)";
	}

	if($sCerti != ""){
		$where .= " AND b.`certi` = $sCerti";
	}

	$archives = $dsql->SetQuery("SELECT b.`id` FROM `#@__".$tab."` b LEFT JOIN `#@__shop_store` s ON s.`id` = b.`branchid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND b.`state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND b.`state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND b.`state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND b.`state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by b.`pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT b.`id`, b.`title`, b.`addrid`, b.`industry`, b.`userid`, b.`tel`, b.`state`, b.`certi`, b.`weight`, b.`pubdate`, b.`branchid`, s.`title` company FROM `#@__".$tab."` b LEFT JOIN `#@__shop_store` s ON s.`id` = b.`branchid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];

			$list[$key]["addrid"] = $value["addrid"];
			$list[$key]["company"] = $value["company"];

			$shopUrl = getUrlPath(array(
				"service"  => "shop",
				"template" => "store-detail",
				"id"       => $value['branchid']
			));
			$list[$key]["shopUrl"] = $shopUrl;

			//地区
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__shopaddr` WHERE `id` = ". $value["addrid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["addr"] = $typename[0]['typename'];

			$list[$key]["industryid"] = $value["industry"];

			//行业
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_type` WHERE `id` = ". $value["industry"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["industry"] = $typename[0]['typename'];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] ='<font color="gray">未绑定会员</font>';
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username ? ($username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"]) : '<font color="red">会员异常</font>';
			}

			$list[$key]["contact"] = $value["tel"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["certi"] = $value["certi"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "shop",
				"template" => "storebranch-detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "shopStoreList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("shopBranchStoreDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['logo'], "delLogo", "shop");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除商城店铺分店", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("shopBranchStoreEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新商城店铺分店状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/shop/shopBranchStore.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('sid', $sid);

	$company = '';
	if($sid){
		$sql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `id` = " . $sid);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$company = $ret[0]['title'];
		}
	}
	$huoniaoTag->assign('company', $company);
    $huoniaoTag->assign('cityid', (int)$cityid);
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "shopaddr")));
	$huoniaoTag->assign('industryListArr', json_encode(getTypeList(0, "shop_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取行业分类列表
function getTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
