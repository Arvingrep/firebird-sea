<?php
/**
 * 管理房产举报信息
 *
 * @version        $Id: houseReport.php 2015-6-13 下午21:47:11 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseReport");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseReport.html";

$action = "member_complain";

if($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT `module`, `action`, `aid`, `type`, `desc`, `userid`, `ip`, `ipaddr`, `pubdate`, `state`, `note` FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	$return = array();
	if(count($results) > 0){

		$param = array(
			"service"     => $results[0]['module'],
			"template"    => $results[0]['action'],
			"id"          => $results[0]['aid']
		);
		$return['url'] = getUrlPath($param);

		$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_".$results[0]['action']."` WHERE `id` = ". $results[0]['aid']);
		$typename = $dsql->getTypeName($typeSql);
		$return["title"] = $typename[0]['title'];


		if($results[0]["userid"] == 0 || $results[0]["userid"] == -1){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["userid"]);
			$member = $dsql->dsqlOper($archives, "results");
			$username = $member[0]["username"];
		}
		$return["username"] = $username;

		$type = "";
		switch ($results[0]['type']) {
			case 1:
				$type = "冒用电话";
				break;
			case 2:
				$type = "虚假信息";
				break;
			case 3:
				$type = "违法信息";
				break;
			case 4:
				$type = "服务糟糕";
				break;
			case 5:
				$type = "骗子信息";
				break;
			case 6:
				$type = "虚假电话";
				break;
		}
		$return['type'] = $type;
		$return['desc'] = $results[0]['desc'];
		$return['ip'] = $results[0]['ip'];
		$return['ipaddr'] = $results[0]['ipaddr'];
		$return['pubdate'] = $results[0]['pubdate'];
		$return['state'] = $results[0]['state'];
		$return['note'] = $results[0]['note'];

		echo json_encode($return);

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;

//更新举报信息
}else if($dopost == "updateDetail"){
	if($id == "") die;

	$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = '$state', `note` = '$note' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{
		adminLog("更新信息举报信息", $id);
		echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	}
	die;

//更新举报状态
}else if($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = $arcrank WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("更新房产举报信息状态", $id."=>".$arcrank);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;

//删除举报
}else if($dopost == "del"){
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
		adminLog("删除房产举报信息", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取举报列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != "" && !empty($act)){
		//按内容搜索
		if($sType == 0){
			$where .= " AND `desc` like '%$sKeyword%'";

		//按信息标题搜索
		}elseif($sType == "1"){
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house".$act."` WHERE `title` like '%$sKeyword%'");
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				$list = array();
				foreach ($results as $key=>$value) {
					$list[] = $value["id"];
				}
				$idList = join(",", $list);
				$where .= " AND `module` = 'info' AND `aid` in ($idList)";
			}else{
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';die;
			}

		//按举报人搜索
		}elseif($sType == "2"){
			if($sKeyword == "游客"){
				$where .= " AND (`userid` = 0 OR `userid` = -1)";
			}else{
				$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
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


	if(!empty($act)){
		$where .= " AND `action` = '".$act."'";
	}


	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE `module` = 'info'");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives.$where." AND `state` = 0", "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives.$where." AND `state` = 1", "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives.$where." AND `state` = 2", "totalCount");

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
	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `aid`, `action`, `type`, `userid`, `pubdate`, `ip`, `ipaddr`, `state` FROM `#@__".$action."` WHERE `module` = 'house'".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["type"] = $value["type"];
			$list[$key]["aid"] = $value["aid"];

			$typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__house_".$value["action"]."` WHERE `id` = ". $value["aid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["title"] = $typename[0]['title'];

			$param = array(
				"service" => "house",
				"template" => $value['action']."-detail",
				"id" => $value['aid']
			);
			$list[$key]["url"] = getUrlPath($param);

			$list[$key]["userid"] = $value["userid"];

			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["userid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["username"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"] = $value["ip"];
			$list[$key]["ipaddr"] = $value["ipaddr"];

			$state = "";
			switch($value["state"]){
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

			$list[$key]["state"] = $state;
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "complainList": '.json_encode($list).'}';
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

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/house/houseReport.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
