<?php
/**
 * 管理伯乐评论
 *
 * @version        $Id: jobBoleReview.php 2015-3-19 下午15:20:10 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobBoleReview");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobBoleReview.html";

$action = "job_bole_review";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `bole`, `userid`, `content`, `gx`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		
		$archives = $dsql->SetQuery("SELECT `userid` FROM `#@__job_bole` WHERE `id` = ".$results[0]["bole"]);
		$dsqlInfo = $dsql->dsqlOper($archives, "results");

		if($dsqlInfo){
			$archives = $dsql->SetQuery("SELECT `name` FROM `#@__job_resume` WHERE `id` = ".$dsqlInfo[0]["userid"]);
			$dsqlInfo = $dsql->dsqlOper($archives, "results");
			$results[0]["bole"] = $dsqlInfo[0]["name"];
		}		

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

	if(!testPurview("jobBoleReviewEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$dtime   = GetMkTime($commonTime);
	
	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `content` = '$commonContent', `gx` = '$commonGx', `dtime` = '".GetMkTime($commonTime)."', `ip` = '$commonIp', `ischeck` = '$commonIsCheck' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新招聘伯乐评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//更新评论状态
}else if($dopost == "updateState"){

	if(!testPurview("jobBoleReviewEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `ischeck` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新招聘伯乐评论信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;
	
//删除评论
}else if($dopost == "delCommon"){

	if(!testPurview("jobBoleReviewDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除招聘伯乐评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;
	
//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	
	$where = "";

    //城市
    if($adminCity){
        global $data;
        $data = '';
        $cityAreaData = $dsql->getTypeList($adminCity, 'site_area');
        $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
        $cityAreaIDs = join(',', $cityAreaIDArr);
        if($cityAreaIDs){
            $where2 = " AND `addr` in ($cityAreaIDs)";
        }else{
            $where2 = " 3 = 4";
        }
    }else{
        //城市管理员
        if($userType == 3){
            if($adminAreaIDs){
                $where2 = " AND `addr` in ($adminAreaIDs)";
            }else{
                $where2 = " AND 1 = 2";
            }
        }
    }
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE 1=1" . $where2);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){
        $list = array();
        foreach ($results as $ke=>$val) {
            $list[] = $val["id"];
        }
        $idList = join(",", $list);
        $where .= " AND `bole` in ($idList)";
    }
	
	if($sKeyword != ""){
		//按评论内容搜索
		if($sType == 0){
			$where .= " AND `content` like '%$sKeyword%'";
			
		//按伯乐搜索
		}elseif($sType == "1"){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `name` like '%$sKeyword%'");
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				$list = array();
				foreach ($results as $key=>$value) {
					$archives = $dsql->SetQuery("SELECT `id` FROM `#@__job_bole` WHERE `userid` = " . $value['id'].$where2);
					$results = $dsql->dsqlOper($archives, "results");
					if(count($results) > 0){
						foreach ($results as $k=>$val) {
							$list[] = $val["id"];
						}
					}else{
						echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
					}
				}				
				$idList = join(",", $list);
				$where .= " AND `bole` in ($idList)";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
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
				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
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
	$archives = $dsql->SetQuery("SELECT `id`, `bole`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `ischeck` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			
			$typeSql = $dsql->SetQuery("SELECT `userid` FROM `#@__job_bole` WHERE `id` = ". $value["bole"]);
			$typename = $dsql->getTypeName($typeSql);

			$typeSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__job_resume` WHERE `id` = ". $typename[0]['userid']);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["bid"] = $typename[0]['id'];
			$list[$key]["bole"] = $typename[0]['name'];
			
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
		'admin/job/jobBoleReview.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}