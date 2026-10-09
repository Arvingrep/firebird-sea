<?php
/**
 * 贴吧回复管理
 *
 * @version        $Id: tiebaReply.php 2016-11-21 上午10:39:10 $
 * @package        HuoNiao.Tieba
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tiebaReply");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tieba";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle = "贴吧回复管理";

if(empty($tid)) die('网站信息传递失败！');
// $tab = "tieba_reply";
$tab = "public_comment";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `aid` = $tid AND `type` = 'tieba-detail'";

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
	$archives = $dsql->SetQuery("SELECT `id`, `aid` tid, `userid` uid, `content`, `dtime` pubdate, `ip`, `ischeck` state FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["tid"] = $value["tid"];

			$title = "";
			$sql = $dsql->SetQuery("SELECT `title` FROM `#@__tieba_list` WHERE `id` = ".$value['tid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$title = $ret[0]['title'];
			}
			$list[$key]['title'] = $title;

			$param = array(
				"service"  => "tieba",
				"template" => "detail",
				"id"       => $value['tid']
			);
			$list[$key]["url"] = getUrlPath($param);
			$list[$key]["uid"] = $value["uid"];

			$username = "无";
			if($value['uid'] != 0){
				$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['uid']);
				$username = $dsql->getTypeName($userSql);
				$username = $username[0]['username'];
			}
			$list[$key]["username"] = $username;

			$list[$key]["content"]   = $value["content"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
			$list[$key]["ip"]      = $value["ip"];
			$list[$key]["state"]   = $value["state"];

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "tiebaReply": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("tiebaReply")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
    $selectiup  = $dsql->SetQuery("SELECT  `aid` FROM `#@__".$tab."`  WHERE  `id` IN (".$id.")");
    $coutcomment = $dsql->dsqlOper($selectiup, "totalCount");
    $result = $dsql->dsqlOper($selectiup, "results");
    $sql = $dsql->SetQuery("DELETE FROM `#@__public_up` WHERE `type` = '1' and `tid` IN (".$id.")");
	$countip = $dsql->dsqlOper($sql, "results");
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` IN (".$id.")");
	$dsql->dsqlOper($archives, "update");
    $aid = $result[0]['aid'];
    $updatecomment= $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = `comment` -'$coutcomment'  WHERE `id` = $aid");
    $dsql->dsqlOper($updatecomment, "update");
	adminLog("删除贴吧帖子回复信息", $id);
	echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("tiebaReply")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){

        $sql = $dsql->SetQuery("SELECT  `aid` FROM `#@__public_comment` WHERE `id`  IN (".$id.")");
        $coutcomment = $dsql->dsqlOper($sql, "totalCount");
        $ret = $dsql->dsqlOper($sql, "results");
        $aid= $ret[0]['aid'];
        $increasetieba = $dsql->SetQuery("UPDATE `#@__tieba_list` SET `comment` = `comment` + '$coutcomment'  WHERE `id` = $aid");
        $dsql->dsqlOper($increasetieba, "update");
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
			  updateCache("tieba_detail", 300);
              updateCache("tieba_list", 300);
			adminLog("更新贴吧帖子回复状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

//验证模板文件
$templates = "tiebaReply.html";
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-selectable.js',
		'admin/tieba/tiebaReply.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('tid', $tid);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tieba";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
