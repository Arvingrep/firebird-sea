<?php
/**
 * 管理房源评论
 *
 * @version        $Id: houseCommon.php 2013-12-13 上午9:55:16 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseCommon");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseCommon.html";

$tab = "house";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `aid`, `userid`, `content`,`pics`,`dtime`,`reply`, `replydate`,`ip`, `ipaddr`, `good`, `bad`, `ischeck`,`isanony` FROM `#@__".$tab."common` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		if($action == "loupan"){
			$archives = $dsql->SetQuery("SELECT `title` FROM `#@__house_loupan` WHERE `id` = ".$results[0]["aid"]);
			$dsqlInfo = $dsql->dsqlOper($archives, "results");
		}else{
			$archives = $dsql->SetQuery("SELECT `title` FROM `#@__house_community` WHERE `id` = ".$results[0]["aid"]);
			$dsqlInfo = $dsql->dsqlOper($archives, "results");
		}
		$title = $dsqlInfo[0]["title"];
		$results[0]["title"] = $title;

		if($results[0]["userid"] == 0 || $results[0]["userid"] == -1){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["userid"]);
			$member = $dsql->dsqlOper($archives, "results");

			$username = $member[0]["username"];
		}
		$results[0]["username"] = $username;
        $picpath = explode(',',$results[0]["pics"]);
        $picpatharr = array();
        for ($i=0; $i<count($picpath); $i++){
            $picpatharr[$i] = getFilePath($picpath[$i]);
        }
        $results[0]['picpath'] = $picpatharr;
		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("评论信息获取失败！").'}';
	}
	die;

//更新评论信息
}else if($dopost == "updateDetail"){
	if($id == "") die;
	$content = $_POST["commonContent"];
//	$dtime   = GetMkTime($_POST["commonTime"]);
	$ip      = $_POST["commonIp"];
	$good    = $_POST["commonGood"];
	$bad     = $_POST["commonBad"];
	$ischeck = $_POST["commonIsCheck"];
	$reply   = $_POST["reply"];
	$replydate = $_POST['replydate'] ? GetMkTime($_POST['replydate']) :time();

	$ipAddr = getIpAddr($ip);

	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."common` SET `content` = '$commonContent', `dtime` = '".GetMkTime($commonTime)."',`reply` = '$reply', `replydate` = '$replydate',`ip` = '$commonIp', `good` = '$commonGood', `bad` = '$commonBad', `ischeck` = '$commonIsCheck' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新分类评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//更新评论状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."common` SET `ischeck` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新分类评论信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除评论
}else if($dopost == "delCommon"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."common` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除分类评论信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取评论列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    $where = getCityFilter('s.`cityid`');

    if ($adminCity){
        $where .= getWrongCityFilter('s.`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		//按评论内容搜索
		if($sType == 0){
			$where .= " AND c.`content` like '%$sKeyword%'";

		//按信息标题搜索
		}elseif($sType == "1"){
            $where .= " AND s.`title` like '%$sKeyword%'";

		//按评论人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND (c.`userid` = 0 OR c.`userid` = -1)";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
				$results = $dsql->dsqlOper($archives, "results");

				if(count($results) > 0){
					$list = array();
					foreach ($results as $key=>$value) {
						$list[] = $value["id"];
					}
					$idList = join(",", $list);

					$where .= " AND c.`userid` in ($idList)";

				}else{
					echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
				}
			}

		//按IP搜索
		}elseif($sType == "3"){
			$where .= " AND c.`ip` like '%$sKeyword%'";
		}
	}

//    if($action == "loupan"){
//        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE 1=1".$where2);
//        $results = $dsql->dsqlOper($archives, "results");
//    }elseif($action == ""){
//        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE 1=1".$where2);
//        $results = $dsql->dsqlOper($archives, "results");
//    }
//
//    if(count($results) > 0){
//        $list = array();
//        foreach ($results as $key=>$value) {
//            $list[] = $value["id"];
//        }
//        $idList = join(",", $list);
//        $where .= " AND `aid` in ($idList)";
//    }else{
//        echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
//    }

	$archives = $dsql->SetQuery("SELECT c.`id` FROM `#@__".$tab."common` c LEFT JOIN `#@__house_releaseschool` s ON s.`id` = c.`aid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives."  AND c.`ischeck` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND c.`ischeck` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives."  AND c.`ischeck` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND c.`ischeck` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}
	$where .= " order by c.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT c.`id`, c.`aid`, c.`userid`, c.`content`, c.`dtime`, c.`ip`, c.`ipaddr`, c.`ischeck`, s.`title` FROM `#@__".$tab."common` c LEFT JOIN `#@__house_releaseschool` s ON s.`id` = c.`aid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["articleId"] = $value["aid"];
            // $typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_releaseschool` WHERE `id` = ". $value["aid"]);
			// $typename = $dsql->getTypeName($typeSql);
			$list[$key]["articleTitle"] = $value['title'];

			$list[$key]["commonUserId"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["commonUserName"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];

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
		'admin/house/houseCommon.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
