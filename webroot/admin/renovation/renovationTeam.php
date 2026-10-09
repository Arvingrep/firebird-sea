<?php
/**
 * 管理装修设计师
 *
 * @version        $Id: renovationTeam.php 2014-3-5 下午18:33:10 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationTeam");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationTeam.html";

$tab = "renovation_team";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND 1 = 1";
	$mcitywhere = " AND 1 = 1";
	$scitywhere = " AND 1 = 1";

    $mcitywhere = getCityFilter('m.`cityid`');
    $scitywhere = getCityFilter('s.`cityid`');
    // $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $mcitywhere .= getWrongCityFilter('m.`cityid`', $adminCity);
        $scitywhere .= getWrongCityFilter('s.`cityid`', $adminCity);
        // $where2 = " AND `cityid` = $adminCity";
    }



// 	$houseid = array();
// 	$loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1 = 1 ".$where2);
// 	$loupanResult = $dsql->dsqlOper($loupanSql, "results");
// 	if($loupanResult){
// 		foreach($loupanResult as $key => $loupan){
// 			array_push($houseid, $loupan['id']);
// 		}
// 		//$where .= " AND `company` in (".join(",", $houseid).")";
// 	}else{
// 		$where .= " AND 1 = 2";
// 	}



    // $houseid = array();
    // $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where2);
    // $loupanResult = $dsql->dsqlOper($loupanSql, "results");
    // if($loupanResult){
    //     foreach($loupanResult as $key => $loupan){
    //         array_push($houseid, $loupan['id']);
    //     }
    //     $where .= " AND `company` in (".join(",", $houseid).")";
    // }else{
    //     echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
    //     die;
    // }

    if($sKeyword != ""){

		$searchArr = array("t.`name` like '%$sKeyword%'");

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				array_push($searchArr, "t.`userid` in (".join(",", $userid).")");
			}
		}

        $houseid = array();
        $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$sKeyword%'".$where2);
        $loupanResult = $dsql->dsqlOper($loupanSql, "results");
        if($loupanResult){
            foreach($loupanResult as $key => $loupan){
                array_push($houseid, $loupan['id']);
            }
			array_push($searchArr, "t.`company` in (".join(",", $houseid).")");
        }

        $where .= " AND (" . join(' OR ', $searchArr) . ")";
	}

    $archives = $dsql->SetQuery("SELECT t.`id`, t.`name`, t.`photo`, t.`company`, t.`works`, t.`userid`, t.`state`, t.`weight`, t.`pubdate`, t.`type` FROM `#@__".$tab."` t LEFT JOIN `#@__member` m ON m.`id` = t.`userid` LEFT JOIN `#@__renovation_store` s ON s.`id` = t.`company` WHERE 1 = 1 AND ((t.`type` = 0 ".$mcitywhere.") OR (t.`type` = 1 ".$scitywhere."))".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未认证
	$totalGray = $dsql->dsqlOper($archives." AND t.`state` = 0".$where, "totalCount");
	//已认证
	$totalAudit = $dsql->dsqlOper($archives." AND t.`state` = 1".$where, "totalCount");
	//认证失败
	$totalRefuse = $dsql->dsqlOper($archives." AND t.`state` = 2".$where, "totalCount");
    
    $where = "";
	if($state != ""){
		$where .= " AND t.`state` = $state";

		if($state == 0){
		    $totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
		    $totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
		    $totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by t.`id` desc , t.`weight` desc, t.`pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$results = $dsql->dsqlOper($archives . $where, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["name"] = $value["name"];
			$list[$key]["photo"] = $value["photo"];

			if($value["type"] == 1){

				$comSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $value["company"]);
				$comname = $dsql->getTypeName($comSql);
				$list[$key]["company"] = $comname[0]['company'];
			}else{
				$list[$key]["company"] = '自由人';
			}
			$list[$key]["companyid"] = $value["company"];
			$list[$key]["works"] = $value["works"];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$list[$key]["state"] = $value["state"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "renovation",
				"template"    => "company-detail",
				"id"          => $value['company']
			);
			$list[$key]['curl'] = getUrlPath($param);

			$param = array(
				"service"     => "renovation",
				"template"    => "designer-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "renovationTeam": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("renovationTeamDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['photo'], "delPhoto", "renovation");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("renovation",$async,"designer");  // 装修门户-设计师-删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除装修设计师", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("renovationTeamEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
    $async = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("renovation",$async,"designer");  // 装修门户-设计师-修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新装修设计师状态", $id."=>".$state);
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
		'admin/renovation/renovationTeam.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/renovation.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
