<?php
/**
 * 管理公司评论
 *
 * @version        $Id: jobCompanyReview.php 2015-3-19 下午14:35:22 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobCompanyReview");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobCompanyReview.html";

$action = "job_company_review";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `cid`, `userid`, `content`, `gx`, `dtime`, `ip`, `ipaddr`, `score`, `ischeck` FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		
		$archives = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ".$results[0]["cid"]);
		$dsqlInfo = $dsql->dsqlOper($archives, "results");
		
		$title = $dsqlInfo[0]["title"];
		$results[0]["title"] = $title;

		if($results[0]["userid"] == 0){
			$name = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `name` FROM `#@__job_resume` WHERE `id` = ".$results[0]["userid"]);
			$job_resume = $dsql->dsqlOper($archives, "results");
			
			$name = $job_resume[0]["name"];
		}
		$results[0]["name"] = $name;
		
		echo json_encode($results);
		
	}else{
		echo '{"state": 200, "info": '.json_encode("评论信息获取失败！").'}';
	}
	die;
	
//更新评论信息
}else if($dopost == "updateDetail"){

	if(!testPurview("jobCompanyReviewEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$dtime   = GetMkTime($commonTime);
	
	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `content` = '$commonContent', `score` = '$score', `gx` = '$commonGx', `dtime` = '".GetMkTime($commonTime)."', `ip` = '$commonIp', `ischeck` = '$commonIsCheck' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		$archives = $dsql->SetQuery("SELECT `cid` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			updateCompanyScore($results[0]['cid']);
		}
		adminLog("更新招聘公司评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//更新评论状态
}else if($dopost == "updateState"){

	if(!testPurview("jobCompanyReviewEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){

		$cid = 0;
		$archives = $dsql->SetQuery("SELECT `cid` FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$cid = $results[0]['cid'];
		}
		
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `ischeck` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}else{
			if($cid){
				updateCompanyScore($cid);
			}
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新招聘公司评论信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//删除评论
}else if($dopost == "delCommon"){

	if(!testPurview("jobCompanyReviewDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$cid = 0;
		$archives = $dsql->SetQuery("SELECT `cid` FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			$cid = $results[0]['cid'];
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}else{
			if($cid){
				updateCompanyScore($cid);
			}
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除招聘公司评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
	
//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";

    $where2 = getCityFilter('`cityid`');

    if ($adminCity){
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE 1=1".$where2);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $key=>$value) {
            $list[] = $value["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `cid` in ($idList)";
    }
	if($sKeyword != ""){
		//按评论内容搜索
		if($sType == 0){
			$where .= " AND `content` like '%$sKeyword%'";
			
		//按信息标题搜索
		}elseif($sType == "1"){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `title` like '%$sKeyword%'".$where2);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				$list = array();
				foreach ($results as $key=>$value) {
					$list[] = $value["id"];
				}
				$idList = join(",", $list);
				$where .= " AND `cid` in ($idList)";
			}
			
		//按评论人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND `userid` = 0";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
				$results = $dsql->dsqlOper($archives, "results");
				
				if(count($results) > 0){
					$list = array();
					foreach ($results as $key=>$value) {
						$list[] = $value["id"];
					}
					$idList = join(",", $list);
					
					$where .= " AND `userid` in ($idList)";
					
				}
			}
			
		//按IP搜索
		}elseif($sType == "3"){
			$where .= " AND `ip` like '%$sKeyword%'";
		}
	}
	
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."`");
	
	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." WHERE `ischeck` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." WHERE `ischeck` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." WHERE `ischeck` = 2".$where, "totalCount");
	
	if($state != ""){
		$where .= " AND `ischeck` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}
	$where .= " order by `id` desc";
	
	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cid`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["cid"] = $value["cid"];
			
			$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__job_company` WHERE `id` = ". $value["cid"]);
			$typename = $dsql->getTypeName($typeSql);
			
			$list[$key]["company"] = $typename[0]['title'];
			
			$list[$key]["commonUserId"] = $value["userid"];
			
			$job_resume = $dsql->SetQuery("SELECT `name` FROM `#@__job_resume` WHERE `id` = ".$value["userid"]);
			$name = $dsql->dsqlOper($job_resume, "results");
			$list[$key]["commonname"]  = $name[0]["name"] == null ? "游客" : $name[0]["name"];
			
			$list[$key]["commonContent"] = cn_substrR(strip_tags($value["content"]), 30)."...";
			$list[$key]["commonTime"] = date('Y-m-d H:i:s', $value["dtime"]);
			$list[$key]["commonIp"] = $value["ip"];
			$list[$key]["commonIpAddr"] = $value["ipaddr"];
			
			$state = "";
			switch($value["ischeck"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;
			}
			
			$list[$key]["commonIsCheck"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "commonList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
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
		'admin/job/jobCompanyReview.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//更新招聘公司综合评分
function updateCompanyScore($cid){
	global $dsql;
	global $action;

	$archives = $dsql->SetQuery("SELECT AVG(`score`) as score FROM `#@__".$action."` WHERE `ischeck` = 1 AND `cid` = ".$cid);
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		$score = round($results[0]['score']);

		$archives = $dsql->SetQuery("UPDATE `#@__job_company` SET `score` = '$score' WHERE `id` = ".$cid);
		$dsql->dsqlOper($archives, "update");
	}

}