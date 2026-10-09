<?php
/**
 * 活动评论管理
 *
 * @version        $Id: huodongReply.php 2016-12-24 下午15:49:22 $
 * @package        HuoNiao.Huodong
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("huodongReply");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/huodong";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle = "活动评论管理";

if(empty($hid)) die('网站信息传递失败！');
$tab = "public_comment";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `type` = 'huodong-detail' AND `aid` = $hid";

	if($sKeyword != ""){
		$where .= " AND (`content` like '%$sKeyword%' OR `ip` like '%$sKeyword%')";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `ischeck` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `ischeck` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `ischeck` = 2".$where, "totalCount");

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
	$archives = $dsql->SetQuery("SELECT `id`, `aid`, `rid`, `userid`, `content`, `dtime`, `ip`, `ischeck` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["hid"] = $value["aid"];

			$title = "";
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__huodong_list` WHERE `id` = ".$value['aid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$title = $ret[0]['title'];
			}
			$list[$key]['title'] = $title;

			$param = array(
				"service"  => "huodong",
				"template" => "detail",
				"id"       => $value['aid']
			);
			$list[$key]["url"] = getUrlPath($param);
			$list[$key]["rid"] = $value["rid"];
			$list[$key]["uid"] = $value["userid"];

			$username = "无";
			if($value['userid'] != 0){
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$username = $username[0]['username'];
			}
			$list[$key]["username"] = $username;

			$list[$key]["content"]   = $value["content"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["dtime"]);
			$list[$key]["ip"]      = $value["ip"];
			$list[$key]["state"]   = $value["ischeck"];

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "huodongReply": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("huodongReply")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` IN (".$id.")");
	$dsql->dsqlOper($archives, "update");
	adminLog("删除贴吧帖子回复信息", $id);
	echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("huodongReply")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `ischeck` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新活动评论状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
$templates = "huodongReply.html";
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-selectable.js',
		'admin/huodong/huodongReply.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('hid', $hid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/huodong";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
