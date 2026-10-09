<?php
/**
 * 管理婚嫁套餐
 *
 * @version        $Id: marryplanmealList.php 2019-04-01 上午11:28:16 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryplanmealList.html";

$tab = "marry_planmeal";

$typeid = $typeid ? $typeid : 0;

if($typeid == 0){
	$pagetitle = "婚嫁套餐";
    checkPurview("marryplanmealList");

}elseif($typeid == 1){
	$pagetitle = "婚纱摄影套餐";
    checkPurview("marryplanmealList1");
}elseif($typeid == 2){
	$pagetitle = "摄影跟拍套餐";
    checkPurview("marryplanmealList2");

}elseif($typeid == 3){
	$pagetitle = "珠宝首饰套餐";
    checkPurview("marryplanmealList3");

}elseif($typeid == 4){
	$pagetitle = "摄像跟拍套餐";
    checkPurview("marryplanmealList4");

}elseif($typeid == 5){
	$pagetitle = "新娘跟妆套餐";
    checkPurview("marryplanmealList5");

}elseif($typeid == 6){
	$pagetitle = "婚纱礼服套餐";
    checkPurview("marryplanmealList6");

}elseif($typeid == 9){
    $pagetitle = "婚礼策划套餐";
    checkPurview("marryplanmealList9");

}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `type` = '$typeid'";

    $where1 = getCityFilter('`cityid`');

    if ($cityid){
        $where1 .= getWrongCityFilter('`cityid`', $cityid);
	}

    if($sKeyword != ""){

        $comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__marry_store` WHERE `title` like '%$sKeyword%'" . $where1);
        $comResult = $dsql->dsqlOper($comSql, "results");
        if($comResult) {
            $comid = array();
            foreach ($comResult as $key => $com) {
                array_push($comid, $com['id']);
            }
            if (!empty($comid)) {
                $where .= " AND (`company` in (" . join(",", $comid) . ") OR ";
            }
        }else{
            $where .= " AND (";
        }
		$where .= " `title` like '%$sKeyword%')";

	}else{
		$comSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__marry_store` WHERE `title` like '%$sKeyword%'" . $where1);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if($comResult) {
			$comid = array();
			foreach ($comResult as $key => $com) {
				array_push($comid, $com['id']);
			}
			if (!empty($comid)) {
				$where .= " AND `company` in (" . join(",", $comid) . ") ";
			}
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
		}
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
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `company`, `state`, `weight`, `pubdate`, `price`, `click`,`type` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]    = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["click"] = $value["click"];
			$list[$key]["zjcom"] = $value["company"];
            $list[$key]["type"] = $value["type"];

            $zjcom = "";
			if($value["company"]){
				$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $value['company']);
				$comname = $dsql->getTypeName($comSql);
				$zjcom = $comname ? $comname[0]['title'] : "";
			}else{
				$zjcom = "个人";
			}
			$list[$key]["comname"] = $zjcom;
			$list[$key]["company"] = $value["company"];

			$param = array(
				"service"  => "marry",
				"template" => "planmeal-detail",
				"id"       => $value['id'],
                "typeid" => $list[$key]['type'] ,


			);
			$list[$key]['url'] = getUrlPath($param);
			$param = array(
				"service"  => "marry",
				"template" => "store-detail",
				"id"       => $value['company']
			);
			$list[$key]['zjurl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "planmealList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("marryplanmealDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT `pics`, `type` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			//删除缩略图
			delPicFile($results[0]['pics'], "delAtlas", "marry");

			if($results[0]['type'] == 0){
				$pagetitle = "婚嫁套餐";
			}elseif($results[0]['type'] == 1){
				$pagetitle = "婚纱摄影套餐";
			}elseif($results[0]['type'] == 2){
				$pagetitle = "摄影跟拍套餐";
			}elseif($results[0]['type'] == 3){
				$pagetitle = "珠宝首饰套餐";
			}elseif($results[0]['type'] == 4){
				$pagetitle = "摄像跟拍套餐";
			}elseif($results[0]['type'] == 5){
				$pagetitle = "新娘跟妆套餐";
			}elseif($results[0]['type'] == 6){
				$pagetitle = "婚纱礼服套餐";
			}elseif($results[0]['type'] == 9){
                $pagetitle = "婚礼策划套餐";
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
		dataAsync("marry",$async,"weddingphoto");  // 删除婚嫁套餐
		dataAsync("marry",$async,"weddingggraphy");
		dataAsync("marry",$async,"weddinggjewelry");
		dataAsync("marry",$async,"weddingplan");
		dataAsync("marry",$async,"weddingpo");
		dataAsync("marry",$async,"weddingmakeup");
		dataAsync("marry",$async,"weddingdress");
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkmarryplanmealCache($id);

			adminLog("删除".$pagetitle."信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("marryplanmealEdit" . $typeid)){
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

			$archives = $dsql->SetQuery("SELECT `pics`, `type` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results  = $dsql->dsqlOper($archives, "results");

			if($results[0]['type'] == 0){
				$pagetitle = "婚嫁套餐";
			}elseif($results[0]['type'] == 1){
				$pagetitle = "婚纱摄影套餐";
			}elseif($results[0]['type'] == 2){
				$pagetitle = "摄影跟拍套餐";
			}elseif($results[0]['type'] == 3){
				$pagetitle = "珠宝首饰套餐";
			}elseif($results[0]['type'] == 4){
				$pagetitle = "摄像跟拍套餐";
			}elseif($results[0]['type'] == 5){
				$pagetitle = "新娘跟妆套餐";
			}elseif($results[0]['type'] == 6){
				$pagetitle = "婚纱礼服套餐";
			}

		}
        dataAsync("marry",$async,"weddingphoto");  // 修改婚嫁套餐
        dataAsync("marry",$async,"weddingggraphy");
        dataAsync("marry",$async,"weddinggjewelry");
        dataAsync("marry",$async,"weddingplan");
        dataAsync("marry",$async,"weddingpo");
        dataAsync("marry",$async,"weddingmakeup");
        dataAsync("marry",$async,"weddingdress");
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkmarryplanmealCache($id);
			adminLog("更新".$pagetitle."状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkmarryplanmealCache($id){
	checkCache("marry_planmeal_list", $id);
	clearCache("marry_planmeal_detail", $id);
	clearCache("marry_planmeal_total", 'key');
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
		'admin/marry/marryplanmealList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('typeid', $typeid);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
