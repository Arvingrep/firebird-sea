<?php
/**
 * 管理家政服务人员
 *
 * @version        $Id: personalList.php 2019-01-01 上午11:28:16 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("personalList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "personalList.html";

$tab = "homemaking_personal";

$adminAreaIDs = '';
if($userType == 3){
    $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $adminCityID = $ret[0]['mgroupid'];

        global $data;
        $data = '';
        $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
        $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
        $adminAreaIDs = join(',', $adminAreaIDArr);
    }
}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    //$where = getCityFilter('`cityid`');

    //if ($cityid){
        //$where = " AND `cityid` = $cityid";
	//}

	//城市管理员
	if($userType == 3){
		if($adminAreaIDs){
			$where1 .= " AND `addr` in ($adminAreaIDs)";
		}else{
			$where1 .= " AND 1 = 2";
		}
	}

	//城市
	if($cityid){
		global $data;
		$data = '';
		$cityAreaData = $dsql->getTypeList($cityid, 'site_area');
		$cityAreaIDArr = parent_foreach($cityAreaData, 'id');
		$cityAreaIDs = join(',', $cityAreaIDArr);
		if($cityAreaIDs){
			$where1 .= " AND `addr` in ($cityAreaIDs)";
		}else{
			$where1 .= " 3 = 4";
		}
	}

	if($sKeyword != ""){
		$where1 .= " AND (`username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `realname` like '%$sKeyword%' OR `email` like '%$sKeyword%' OR `phone` like '%$sKeyword%')";
	}

	$userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE 1=1" . $where1);
	$userResult = $dsql->dsqlOper($userSql, "results");
	if($userResult) {
		$useridA = array();
		foreach ($userResult as $key => $com) {
			array_push($useridA, $com['id']);
		}
		if (!empty($useridA)) {
			$where .= " AND `userid` in (" . join(",", $useridA) . ") ";
		}
	}

    if($sKeyword != ""){

        $comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__homemaking_store` WHERE `title` like '%$sKeyword%'");
        $comResult = $dsql->dsqlOper($comSql, "results");
        if($comResult) {
            $comid = array();
            foreach ($comResult as $key => $com) {
                array_push($comid, $com['id']);
            }
            if (!empty($comid)) {
                $where .= " AND `company` in (" . join(",", $comid) . ") ";
            }
		}
	}

	if(empty($userResult) && empty($comResult)){
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
	}

	if($sFlag != ""){
		//$where .= " AND `flag` = $sFlag";
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
	$archives = $dsql->SetQuery("SELECT `id`, `userid`, `company`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["userid"] = $value["userid"];
			$userSql  = $dsql->SetQuery("SELECT `username`, `nickname`, `phone`, `addr` FROM `#@__member` WHERE `id` = ". $value['userid']);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["username"]   = $username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"];
			$list[$key]["tel"]   = $username[0]["phone"] ? $username[0]["phone"] : '';

			$list[$key]["zjcom"] = $value["company"];
			$zjcom = "";
			if($value["company"]){
				$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_store` WHERE `id` = ". $value['company']);
				$comname = $dsql->getTypeName($comSql);
				$zjcom = $comname ? $comname[0]['title'] : "";
			}else{
				$zjcom = "个人";
			}
			$list[$key]["comname"] = $zjcom;
			$list[$key]["company"] = $value["company"];

			$list[$key]["addrid"] = $username[0]["addr"];
            //地区
            $addrname = $username[0]['addr'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addr"] = $addrname;

			$list[$key]["state"] = $value["state"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "homemaking",
				"template" => "personal-detail",
				"id"       => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);

			$param = array(
				"service"  => "homemaking",
				"template" => "store-detail",
				"id"       => $value['company']
			);
			$list[$key]['zjurl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "personalList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("personalDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
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
			checkHomemakingPersonalCache($id);
			adminLog("删除家政服务人员信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("personalEdit")){
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
			checkHomemakingPersonalCache($id);
			adminLog("更新家政服务人员状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkHomemakingPersonalCache($id){
	checkCache("homemaking_personal_list", $id);
	clearCache("homemaking_personal_detail", $id);
	clearCache("homemaking_personal_total", 'key');
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
		'admin/homemaking/personalList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
