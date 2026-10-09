<?php
/**
 * 管理婚宴场地
 *
 * @version        $Id: marryhotelfieldList.php 2019-04-01 上午11:28:16 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("marryhotelfieldList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryhotelfieldList.html";

$tab = "marry_hotelfield";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

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
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `company`, `state`, `weight`, `pubdate`, `maxtable`, `besttable` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]    = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["maxtable"] = $value["maxtable"];
			$list[$key]["besttable"] = $value["besttable"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["zjcom"] = $value["company"];
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
				"template" => "hotel_detail",
				"id"       => $value['company']
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
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "hotelfieldList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("marryhotelfieldDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT `pics` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			//删除缩略图
			delPicFile($results[0]['pics'], "delAtlas", "marry");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("marry",$async,"hotelfield");  // 婚嫁、酒店场地、删除

        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkMarryHotelfieldCache($id);
			adminLog("删除婚宴场地信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("marryhotelfieldEdit")){
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
		dataAsync("marry",$async,"hotelfield");  // 婚嫁、酒店场地、更新状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkMarryHotelfieldCache($id);
			adminLog("更新婚宴场地状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkMarryHotelfieldCache($id){
	checkCache("marry_hotelfield_list", $id);
	clearCache("marry_hotelfield_detail", $id);
	clearCache("marry_hotelfield_total", 'key');
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
		'admin/marry/marryhotelfieldList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
