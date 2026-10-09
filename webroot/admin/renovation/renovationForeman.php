<?php
/**
 * 管理装修设计师
 *
 * @version        $Id: renovationForeman.php 2014-3-5 下午18:33:10 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationForeman");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationForeman.html";
$tab = "renovation_foreman";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

	$typeArr = array();

	//公司类型
	$houseid = array();
	$loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1 = 1 ".$where2);
	$loupanResult = $dsql->dsqlOper($loupanSql, "results");
	if($loupanResult){
		foreach($loupanResult as $key => $loupan){
			array_push($houseid, $loupan['id']);
		}

		array_push($typeArr, " `type` = 1 AND `company` in (".join(",", $houseid).")");
		// $where .= " AND `company` in (".join(",", $houseid).")";
	}else{
		array_push($typeArr, " `type` = 1 AND 1 = 2");
		// $where .= " AND 1 = 2";
	}

	//自由人类型
	$houseid = array();
	$loupanSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE 1 = 1 ".$where2);
	$loupanResult = $dsql->dsqlOper($loupanSql, "results");
	if($loupanResult){
		foreach($loupanResult as $key => $loupan){
			array_push($houseid, $loupan['id']);
		}

		array_push($typeArr, " `type` = 0 AND `userid` in (".join(",", $houseid).")");
		// $where .= " AND `company` in (".join(",", $houseid).")";
	}else{
		array_push($typeArr, " `type` = 0 AND 1 = 2");
		// $where .= " AND 1 = 2";
	}

	if($typeArr){
		$where .= " AND (" . join(" OR ", $typeArr) . ")";
	}

//    $houseid = array();
//    $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where2);
//    $loupanResult = $dsql->dsqlOper($loupanSql, "results");
//    if($loupanResult){
//        foreach($loupanResult as $key => $loupan){
//            array_push($houseid, $loupan['id']);
//        }
//        // $where .= " AND `company` in (".join(",", $houseid).")";
//    }else{
//        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
//        die;
//    }

    if($sKeyword != ""){

		$searchArr = array("`name` like '%$sKeyword%'");

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				array_push($searchArr, "`userid` in (".join(",", $userid).")");
			}
		}

        $houseid = array();
        $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE `company` like '%$sKeyword%'".$where2);
        $loupanResult = $dsql->dsqlOper($loupanSql, "results");
        if($loupanResult){
            foreach($loupanResult as $key => $loupan){
                array_push($houseid, $loupan['id']);
            }
			array_push($searchArr, "`company` in (".join(",", $houseid).")");
        }

        $where .= " AND " . join(' OR ', $searchArr);
	}

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
	$archives = $dsql->SetQuery("SELECT `id`, `name`, `photo`, `company`,`type`, `works`, `userid`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] 		= $value["id"];
			$list[$key]["name"]     = $value["name"];
			$list[$key]["photo"]    = $value["photo"] ? getFilePath($value["photo"]) : '/static/images/noPhoto_100.jpg';
			$list[$key]["type"]     = $value["type"];

			$list[$key]["companyid"] = $value["company"];
			//公司
			if($value["type"] == 1){

				$comSql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ". $value["company"]);
				$comname = $dsql->getTypeName($comSql);
				$list[$key]["company"] = $comname[0]['company'];
			}else{
				$list[$key]["company"] = '自由人';
			}
			$list[$key]["works"] =  $value["works"];

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
				"template"    => "foreman-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "renovationForeman": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("renovationForemanDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

//			//删除作品 start
//			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_case` WHERE `designer` = ".$val);
//			$results = $dsql->dsqlOper($archives, "results");
//
//			foreach($results as $k_ => $v_){
//				//删除缩略图
//				delPicFile($v_['litpic'], "delThumb", "renovation");
//
//				//删除图集
//				$pics = explode(",", $v_['pics']);
//				foreach($pics as $k__ => $v__){
//					delPicFile($v__, "delAtlas", "renovation");
//				}
//
//				//删除表
//				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_case` WHERE `id` = ".$v_['id']);
//				$dsql->dsqlOper($archives, "update");
//			}
			//删除作品 end

			//删除日记 start
			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_diary` WHERE `fid` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			foreach($results as $k_ => $v_){

				//删除日记列表 start
				$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_diarylist` WHERE `diary` = ".$v_['id']);
				$results = $dsql->dsqlOper($archives, "results");

				foreach($results as $k__ => $v__){
					//删除内容图片
					$body = $v__['body'];
					if(!empty($body)){
						delEditorPic($body, "renovation");
					}

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_diarylist` WHERE `id` = ".$v__['id']);
					$dsql->dsqlOper($archives, "update");
				}
				//删除日记列表end

				//删除缩略图
				delPicFile($v_['litpic'], "delThumb", "renovation");

				//删除户型图
				$pics = explode(",", $v_['unitspic']);
				foreach($pics as $k__ => $v__){
					delPicFile($v__, "delCard", "renovation");
				}

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_diary` WHERE `id` = ".$v_['id']);
				$dsql->dsqlOper($archives, "update");
			}
			//删除日记 end

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
		dataAsync("renovation",$async,"foreman");  // 装修门户-工长-删除
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
	if(!testPurview("renovationForemanEdit")){
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
		dataAsync("renovation",$async,"foreman");  // 装修门户-工长-改状态
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
		'admin/renovation/renovationForeman.js'
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
