<?php
/**
 * 管理家教
 *
 * @version        $Id: educationfamilyList.php 2019-7-11 上午11:28:16 $
 * @package        HuoNiao.education
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("educationfamilyList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/education";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "educationfamilyList.html";

$tab = "education_tutor";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('`cityid`', $cityid);
	}

    if($sKeyword != ""){

		$where .= " AND `username` like '%$sKeyword%' or `tel` like '%$sKeyword%'";

	}

	if($mType!=''){
		$where .= " AND `typeid` = '$mType'";
	}

	if($sCat!=''){
		$where .= " AND `catid` = '$sCat'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

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

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `username`, `tel`, `cityid`, `catid`, `usertype`, `price`, `userid`, `state`, `weight`, `pubdate`, `typeid`, `sex` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]    = $value["id"];
			$list[$key]["tutoiname"] = $value["username"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["sex"] = $value["sex"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["tel"] = $value["tel"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["usertype"] = $value["usertype"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__education_type` WHERE `id` = ". $value['catid']);
			$typename= $dsql->getTypeName($typeSql);
			$list[$key]["catname"]  = !empty($typename[0]['typename']) ? $typename[0]['typename'] : '';

			$username = $contact = "无";
			if($value['userid'] != 0 && $value['usertype'] == 1){
				//会员
				$userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__education_store` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				if($username){
					$userSql = $dsql->SetQuery("SELECT `id`, `username`, `phone` FROM `#@__member` WHERE `id` = ". $username[0]["userid"]);
					$username = $dsql->getTypeName($userSql);
					$list[$key]["userid"] = $username[0]["id"];
					$contact = $username[0]["phone"];
					$username = $username[0]["username"];
				}
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username`, `phone` FROM `#@__member` WHERE `id` = ". $value["userid"]);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["userid"] = $username[0]["id"];
				$contact = $username[0]["phone"];
				$username = $username[0]["username"];
			}
			$list[$key]["username"] = $username;

			include_once HUONIAOROOT."/api/handlers/education.class.php";
			$education = new education();
			if($value['typeid']!=''){
				$typename = $education->gettypename("typeid_type", $value['typeid']);
			}
			$list[$key]["typename"]  = !empty($typename) ? $typename : '';

			$param = array(
				"service"  => "education",
				"template" => "tutor-detail",
				"id"       => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);

			$param = array(
				"service"  => "education",
				"template" => "store-detail",
				"id"       => $value['userid']
			);
			$list[$key]['zjurl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "educationfamilyList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("educationfamilyDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT `photo`, `idcardFront`, `idcardFront`, `degree`, `diploma` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			//删除缩略图
			delPicFile($results[0]['photo'], "delThumb", "education");
			delPicFile($results[0]['idcardFront'], "delThumb", "education");
			delPicFile($results[0]['idcardFront'], "delThumb", "education");
			delPicFile($results[0]['degree'], "delThumb", "education");
			delPicFile($results[0]['diploma'], "delThumb", "education");

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
			checkEducationFamilyCache($id);
			adminLog("删除家教信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("educationfamilyEdit")){
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
			checkEducationFamilyCache($id);
			adminLog("更新家教状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkEducationFamilyCache($id){
	checkCache("education_tutor_list", $id);
	clearCache("education_tutor_detail", $id);
	clearCache("education_tutor_total", 'key');
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
		'admin/education/educationfamilyList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	include_once HUONIAOROOT."/api/handlers/education.class.php";
	$education = new education();
	$typeList = $education->typeid_type();
	$huoniaoTag->assign('typeListArr', json_encode($typeList));

	$huoniaoTag->assign('catListArr', json_encode($dsql->getTypeList(0, "education_type")));
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/education";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
