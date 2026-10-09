<?php
/**
 * 添加自助建站
 *
 * @version        $Id: websiteAdd.php 2014-6-16 下午15:23:28 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteAdd.html";

$tab = "website";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改自助建站";
	checkPurview("websiteEdit");
}else{
	$pagetitle = "添加自助建站";
	checkPurview("websiteAdd");
}

if(empty($domaintype)) $domaintype = 0;
if(empty($domainexp)) $domainexp = 0;
$domainexp = empty($domainexp) ? 0 : GetMkTime($domainexp);
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;

//如果访问方式为默认，则清空主域名的选项
if(!$domaintype){
	$domain = "";
	$domainexp = 0;
	$domaintip = "";
	$domainstate = 0;
	$domainrefund = "";
}

if($_POST['submit'] == "提交"){

	$title = cn_substrR($title,60);

	if($token == "") die('token传递失败！');
	//二次验证
	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员"}';
		exit();
	}
	if($userid == 0){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
		$userid = $userResult[0]['id'];
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
			exit();
		}
	}

	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经建立网站，不可以重复添加！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经建立网站，不可以重复添加！"}';
			exit();
		}

	}

	if(empty($title)){
		echo '{"state": 200, "info": "请输入网站名称！"}';
		exit();
	}

	if($domaintype != 0){
		if(empty($domain)){
			echo '{"state": 200, "info": "请输入要绑定的域名！"}';
			exit();
		}

		//验证域名是否被使用
		if(!operaDomain('check', $domain, 'website', $tab, $id, GetMkTime($domainexp)))
		die('{"state": 200, "info": '.json_encode("域名已被占用，请重试！").'}');
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `domaintype`, `userid`, `note`, `head`, `footer`, `weight`, `state`, `pubdate`) VALUES ('$title', '$domaintype', '$userid', '$note', '$head', '$footer', '$weight', '$state', '".GetMkTime(time())."')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if($aid){

		//首页
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `pubdate`) VALUES ('$aid', '首页', 'index', '首页', '1', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		//新闻列表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '新闻列表', 'news', '', '30', '新闻', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		//新闻阅读
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '新闻详细', 'newsd', '', '31', '新闻', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		// //活动列表
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '活动列表页', 'events-list', '', '32', '活动', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");
		//
		// //活动阅读
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '活动阅读页', 'events-view', '', '33', '活动', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");

		//产品列表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '产品列表页', 'product', '', '34', '产品', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");
		//
		//产品阅读
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '产品阅读页', 'productd', '', '35', '产品', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		// //案例列表
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '案例列表页', 'case-list', '', '36', '案例', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");
		//
		// //案例阅读
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '案例阅读页', 'case-view', '', '37', '案例', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");
		//
		//视频列表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '视频列表页', 'video', '', '38', '视频', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");

		//视频阅读
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '视频阅读页', 'videod', '', '39', '视频', '".GetMkTime(time())."')");
		$dsql->dsqlOper($archives, "update");
		//
		// //全景列表
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '全景列表页', '360qj-list', '', '40', '全景', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");
		//
		// //全景阅读
		// $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$aid', '全景阅读页', '360qj-view', '', '41', '全景', '".GetMkTime(time())."')");
		// $dsql->dsqlOper($archives, "update");

		//域名操作
		operaDomain('update', $domain, 'website', $tab, $aid, GetMkTime($domainexp), $domaintip, $domainstate, $domainrefund);

		$customDomain = "";
		$getDomain = getDomain("website", "website", $aid);
		if($getDomain && $getDomain['state'] == 1){
			$customDomain = $cfg_secureAccess . $getDomain['domain'];
		}
		if($customDomain && $domaintype){
			$url = $customDomain;
		}else{
			$param = array(
				"service"      => "website",
				"template"     => "site".$aid
			);
			$url = getUrlPath($param);
		}

		//更新规则文件
		updateHtaccess();

		adminLog("添加自助建站", $title);
		$RenrenCrypt = new RenrenCrypt();
		$projectid   = base64_encode($RenrenCrypt->php_encrypt($aid));
		echo '{"state": 100, "id": "'.$aid.'", "projectid": "'.$projectid.'", "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

		$getOldDomain = getDomain("website", "website", $id);

		//先删除域名配置
		$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'website' AND `part` = 'website' AND `iid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `domaintype` = '$domaintype', `userid` = '$userid', `note` = '$note', `head` = '$head', `footer` = '$footer', `weight` = '$weight', `state` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			//域名操作
			operaDomain('update', $domain, 'website', $tab, $id, GetMkTime($domainexp), $domaintip, $domainstate, $domainrefund);

			$customDomain = "";
			$getDomain = getDomain("website", "website", $id);
			if($getDomain && $getDomain['state'] == 1){
				$customDomain = $cfg_secureAccess . $getDomain['domain'];
			}
			if($customDomain && $domaintype){
				$url = $customDomain;
			}else{
				$param = array(
					"service"      => "website",
					"template"     => "site".$id
				);
				$url = getUrlPath($param);
			}

			//更新规则文件
			// updateHtaccess();

			//消息通知
			if($getOldDomain['state'] != $domainstate && $domainstate != 0){
				$param = array(
					"service"  => "member",
					"template" => "config",
					"action"   => "website"
				);
				$notify = $domainstate == 1 ? "会员-域名绑定成功" : "会员-域名绑定失败";

				//自定义配置
	            $config = array(
	                "title" => $title,
	                "domain" => $getDomain['domain'],
	                "refund" => $domainrefund,
	                "fields" => array(
	                    'keyword1' => '店铺名称',
	                    'keyword2' => '绑定域名',
	                    'keyword3' => '审核状态'
	                )
	            );

				updateMemberNotice($userid, $notify, $param, $config);
			}

			adminLog("修改自助建站", $title);
			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title       = $results[0]['title'];
			$domaintype  = $results[0]['domaintype'];

			//获取域名信息
			$domainInfo = getDomain('website', $tab, $id);
			$domain      = $domainInfo['domain'];
			$domainexp   = $domainInfo['expires'];
			$domaintip   = $domainInfo['note'];
			$domainstate = $domainInfo['state'];
			$domainrefund = $domainInfo['refund'];

			$userid      = $results[0]['userid'];
			$note        = $results[0]['note'];
			$head        = $results[0]['head'];
			$footer      = $results[0]['footer'];
			$weight      = $results[0]['weight'];
			$state       = $results[0]['state'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'admin/website/websiteAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/website.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('basehost', $cfg_basehost);

	//获取域名信息
	$domainInfo = getDomain('website', 'config');
	$huoniaoTag->assign('subdomain', $domainInfo['domain']);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);

	global $customSubDomain;
	$huoniaoTag->assign('customSubDomain', $customSubDomain);
	if($customSubDomain != 2){
		$huoniaoTag->assign('domaintype', array('0', '1', '2'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名','绑定子域名'));
	}else{
		$huoniaoTag->assign('domaintype', array('0', '1'));
		$huoniaoTag->assign('domaintypeNames',array('默认','绑定主域名'));
	}
	if($customSubDomain == 2 && $domaintype == 2) $domaintype = 0;

	$huoniaoTag->assign('domaintypeChecked', $domaintype == "" ? 0 : $domaintype);
	$huoniaoTag->assign('domain', $domain);
	$huoniaoTag->assign('domainexp', $domainexp == 0 ? "" : date("Y-m-d H:i:s", $domainexp));
	$huoniaoTag->assign('domaintip', $domaintip);

	//域名状态
	$huoniaoTag->assign('domainopt', array('0', '1', '2'));
	$huoniaoTag->assign('domainnames',array('待审核','已审核','审核拒绝'));

	$huoniaoTag->assign('domainstate', $domainstate);
	$huoniaoTag->assign('domainrefund', $domainrefund);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('head', $head);
	$huoniaoTag->assign('footer', $footer);
	$huoniaoTag->assign('weight', $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
