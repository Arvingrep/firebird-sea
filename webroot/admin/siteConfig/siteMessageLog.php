<?php
/**
 * 信息发送日志
 *
 * @version        $Id: siteMessageLog.php 2013-12-2 上午11:07:12 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteMessageLog.html";

$db     = 'site_messagelog';

checkPurview("siteMessageLog".$action);

//获取信息详情
if($dopost == "getDetail"){
	$archives = $dsql->SetQuery("SELECT `user`, `title`, `body`, `byid`, `state`, `pubdate`, `ip`, `reason` FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		if($results[0]["user"] == 0){
			$username = "游客";
		}else{
			$archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$results[0]["byid"]);
			$member = $dsql->dsqlOper($archives, "results");

			$username = $member[0]["username"];
		}
		$results[0]["by"] = $username;
		$results[0]["pubdate"] = date('Y-m-d H:i:s', $results[0]['pubdate']);


		echo json_encode($results);

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;

//删除记录
}else if($dopost == "del"){
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除信息发送日志", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;

//清空
}else if($dopost == "delAll"){
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."`");
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("清空信息发送日志");
		echo '{"state": 100, "info": '.json_encode("操作成功！").'}';
	}
	die;

//获取列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";
	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `user` like '%$sKeyword%')";
	}

	if($sState != ""){
		$where .= " AND `state` = $sState";
	}
	$where .= " order by `id` desc";
	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE `type` = '".$action."'".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `user`, `title`, `body`, `byid`, `state`, `pubdate` FROM `#@__".$db."` WHERE `type` = '".$action."'".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["user"] = $value["user"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["body"] = $value["body"];
			$member = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value["byid"]);
			$username = $dsql->dsqlOper($member, "results");
			$list[$key]["by"]  = $username[0]["username"] == null ? "游客" : $username[0]["username"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}
		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "messageList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//重新发送
}elseif($dopost == "replay"){
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){

		$admin = $userLogin->getUserID();

		//邮件
		if($action == "email"){
			$return = sendmail($results[0]['user'],$results[0]['title'],$results[0]['body']);
			if(!empty($return)){
				adminLog("重新发送邮件-失败", $results[0]['user']."==>".$results[0]['title']);
				messageLog("email", $results[0]['lei'], $results[0]['user'], $results[0]['title'], $results[0]['body'], $admin, 1, $results[0]['code']);
				echo '{"state": 200, "info": '.json_encode("发送失败！").'}';
			}else{

				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = 0 WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "results");

				adminLog("重新发送邮件-成功", $results[0]['user']."==>".$results[0]['title']);
				echo '{"state": 100, "info": '.json_encode("发送成功！").'}';
			}

		//短信
		}elseif($action == "phone"){

			global $cfg_smsAlidayu;
			$body = $cfg_smsAlidayu ? $results[0]['tempid'] : $results[0]['body'];
			$return = sendsms($results[0]['user'], $body, $results[0]['code'], $results[0]['lei'], false, true);
			if($return != "ok"){
				adminLog("重新发送短信-失败", $results[0]['user']."==>".$results[0]['title']);
				// messageLog("phone", $results[0]['lei'], $results[0]['user'], $results[0]['title'], $results[0]['body'], $admin, 1, $results[0]['code']);
				echo '{"state": 200, "info": '.json_encode("发送失败！").'}';
			}else{
				$archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = 0 WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "results");

				adminLog("重新发送短信-成功", $results[0]['user']."==>".$results[0]['title']);
				echo '{"state": 100, "info": '.json_encode("发送成功！").'}';
			}
		}

	}else{
		echo '{"state": 200, "info": '.json_encode("信息获取失败！").'}';
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/siteConfig/siteMessageLog.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
