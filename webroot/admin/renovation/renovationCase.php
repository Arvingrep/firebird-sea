<?php
/**
 * 管理装修效果图
 *
 * @version        $Id: renovationCase.php 2014-3-6 上午10:23:16 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationCase");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationCase.html";

$tab = "renovation_case";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where2);
    $storeResult = $dsql->dsqlOper($storeSql, "results");
    $userid = array();
    if($storeResult){
        foreach($storeResult as $key => $store){
//            $userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `company` =".$store['id']);
//            $userResult = $dsql->dsqlOper($userSql, "results");
//            if($userResult){
//                foreach($userResult as $key => $user){
                    array_push($userid, $store['id']);
//                }
//            }
        }
        $where .= " AND `company` in (0,".join(",", $userid).")";
    }else{
        // echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        // die;
    }
	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";

		$storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$sKeyword%'".$where2);
		$storeResult = $dsql->dsqlOper($storeSql, "results");
		$userid = array();
		if($storeResult){
			foreach($storeResult as $key => $store){
//				$userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `company` =".$store['id']);
//				$userResult = $dsql->dsqlOper($userSql, "results");
//				if($userResult){
//					foreach($userResult as $key => $user){
						array_push($userid, $store['id']);
//					}
//				}
			}
			if(!empty($userid)){
				$where .= " OR `company` in (".join(",", $userid).")";
			}
		}
//
//		$userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `name` like '%$sKeyword%'");
//		$userResult = $dsql->dsqlOper($userSql, "results");
//		if($userResult){
//			$userid = array();
//			foreach($userResult as $key => $user){
//				array_push($userid, $user['id']);
//			}
//			if(!empty($userid)){
//				$where .= " OR `designer` in (".join(",", $userid).")";
//			}
//		}
	}

//    if(!empty($designer)){
//		$where .= " AND `designer` = ".$designer;
//	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//未认证
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已认证
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//认证失败
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
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `company`, `apartment`, `units`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);

	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["litpic"] = $value["litpic"];

			/*$teamid = $companyid = 0;
			$teamname = $company = "";
			$userSql = $dsql->SetQuery("SELECT `id`, `name`, `company` FROM `#@__renovation_team` WHERE `id` =".$value['designer']);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if($userResult){
				$teamid = $userResult[0]['id'];
				$teamname = $userResult[0]['name'];
				$companyid = $userResult[0]['company'];
			}*/
            $company = '';
            $companyid = $value['company'];
			if(!empty($companyid)){
				$storeSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` =".$companyid);
				$storeResult = $dsql->dsqlOper($storeSql, "results");
				if($storeResult){
					$company = $storeResult[0]['company'];
				}
			}

//			$list[$key]["teamid"] = $teamid;
//			$list[$key]["teamname"] = $teamname;
			$list[$key]["companyid"]    = $value["company"];
			$list[$key]["company"]      = $company;

			$apartment = "";
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` =".$value['apartment']);
			$typeResult = $dsql->dsqlOper($typeSql, "results");
			if($typeResult){
				$apartment = $typeResult[0]['typename'];
			}
			$list[$key]["apartment"] = $apartment;

			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "renovation",
				"template"    => "company-detail",
				"id"          => $companyid
			);
			$list[$key]['curl'] = getUrlPath($param);

//			$param = array(
//				"service"     => "renovation",
//				"template"    => "designer-detail",
//				"id"          => $teamid
//			);
//			$list[$key]['durl'] = getUrlPath($param);

			$param = array(
				"service"     => "renovation",
				"template"    => "albums-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);


		}
//		echo "<pre>";
//        var_dump($list);die;
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "renovationCase": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("renovationCaseDel")){
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
			delPicFile($results[0]['litpic'], "delThumb", "renovation");

			//删除图集
			$pics = explode(",", $results[0]['pics']);
			foreach($pics as $k => $v){
				delPicFile($v, "delAtlas", "renovation");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("renovation",$async,"albums");  // 装修门户、删除效果图
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除装修效果图", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("renovationCaseEdit")){
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
		dataAsync("renovation",$async,"albums");  // 装修门户、效果图、修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新装修效果图状态", $id."=>".$state);
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
		'admin/renovation/renovationCase.js'
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

	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
