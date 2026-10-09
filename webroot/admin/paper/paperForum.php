<?php
/**
 * 管理报刊版面
 *
 * @version        $Id: paperForum.php 2014-3-15 上午10:15:12 $
 * @package        HuoNiao.Paper
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("paperForum");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/paper";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "paperForum.html";

$tab = "paper_forum";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where2 = getCityFilter('`cityid`');

    if($sCompany != ""){
		$where .= " AND `company` = ".$sCompany;
	}

	if($sDate != ""){
		$where .= " AND `date` = ".GetMkTime($sDate);
	}

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__paper_company` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `company` in ($idList)";
    }else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
		    $totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
		    $totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
		    $totalPage = ceil($state2/$pagestep);
		}
	}

	$where .= " order by `pubdate` desc, `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `company`, `date`, `title`, `type`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			//公司
			$list[$key]["companyid"] = $value["company"];
			$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__paper_company` WHERE `id` = ". $value["company"]);
			$typename = $dsql->getTypeName($typeSql);
			if($typename){
				$list[$key]["company"] = $typename[0]['title'];
			}else{
				$list[$key]["company"] = "";
			}

			$list[$key]["date"] = date("Y-m-d", $value["date"]);
			$list[$key]["title"] = $value["title"];
			$list[$key]["type"] = $value["type"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "paper",
				"template" => "forum",
				"id"       => $value['id']
			);
			$list[$key]['forum'] = getUrlPath($param);

			$param = array(
				"service"  => "paper",
				"template" => "list",
				"id"       => $value["company"]
			);
			$list[$key]['list'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}, "paperForum": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("paperForumDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			//删除下属信息 start
			$archives = $dsql->SetQuery("DELETE FROM `#@__paper_content` WHERE `forum` = ".$val);
			$dsql->dsqlOper($archives, "update");
			//删除下属信息 end

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "paper");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("paper",$async);  //  电子报刊、删除

        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除报刊版面", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("paperForumEdit")){
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
		dataAsync("paper",$async);  //  电子报刊、修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新报刊版面状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/paper/paperForum.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	//报刊公司
	$company = array();
	$storeSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__paper_company` WHERE 1 = 1 " . getCityFilter('`cityid`') . " ORDER BY `weight` DESC, `pubdate` DESC");
	$storeResult = $dsql->dsqlOper($storeSql, "results");
	if($storeResult){
		foreach($storeResult as $key => $store){
			$company[$key]['id'] = $store['id'];
			$company[$key]['title'] = $store['title'];
		}
	}
	$huoniaoTag->assign('company', $company);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/paper";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
