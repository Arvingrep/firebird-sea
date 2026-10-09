<?php
/**
 * 添加修改消息通知
 *
 * @version        $Id: siteNotifyAdd.php 2017-03-07 下午15:24:10 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteNotify");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteNotifyAdd.html";

$action     = "site_notify";
$pagetitle  = "新增消息通知";

//表单二次验证
if($submit == "提交"){
	if($token == "") die('token传递失败！');

	if($title == ''){
		echo '{"state": 200, "info": "请输入消息名称"}';
		exit();
	}
}

if($dopost == "edit"){

	$pagetitle = "修改消息通知";
	if($submit == "提交"){

		$where = "";

		//系统通知消息名称不可以修改
		$sql = $dsql->SetQuery("SELECT `system` FROM `#@__".$action."` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			if($ret[0]['system'] == 2){
				$where = ", `title` = '$title'";

				//消息名称重复检测
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE `title` = $title");
				$ret = $dsql->dsqlOper($sql, "totalCount");
				if($ret > 0){
					echo '{"state": 200, "info": "消息名称已经存在，请换个名称！"}';
					die;
				}
			}
		}else{
			echo '{"state": 200, "info": "信息不存在，保存失败！"}';
			die;
		}

		$email_state = (int)$email_state;
		$sms_state = (int)$sms_state;
		$wechat_state = (int)$wechat_state;
		$site_state = (int)$site_state;
		$app_state = (int)$app_state;
		$state = (int)$state;

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `email_state` = '$email_state', `email_title` = '$email_title', `email_body` = '$email_body', `sms_state` = '$sms_state', `sms_tempid` = '$sms_tempid', `sms_intempid` = '$sms_intempid',`sms_body` = '$sms_body',`sms_note` = '$sms_note', `wechat_state` = '$wechat_state', `wechat_tempid` = '$wechat_tempid', `wechat_body` = '$wechat_body', `site_state` = '$site_state', `site_title` = '$site_title', `site_body` = '$site_body', `app_state` = '$app_state', `app_title` = '$app_title', `app_body` = '$app_body',`wechat_serial` = '$wechat_serial',`state` = '$state'".$where." WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "修改失败！"}';
			exit();
		}

		adminLog("修改消息通知", $title);
		echo '{"state": 100, "info": "修改成功！"}';
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title         = $results[0]['title'];
				$email_state   = $results[0]['email_state'];
				$email_title   = $results[0]['email_title'];
				$email_body    = $results[0]['email_body'];
				$sms_state     = $results[0]['sms_state'];
				$sms_tempid    = $results[0]['sms_tempid'];
				$sms_intempid  = $results[0]['sms_intempid'];
				$sms_body      = $results[0]['sms_body'];
				$sms_note      = $results[0]['sms_note'];
				$wechat_state  = $results[0]['wechat_state'];
				$wechat_tempid = $results[0]['wechat_tempid'];
				$wechat_body   = $results[0]['wechat_body'];
				$wechat_serial = $results[0]['wechat_serial'];
				$site_state    = $results[0]['site_state'];
				$site_title    = $results[0]['site_title'];
				$site_body     = $results[0]['site_body'];
				$app_state     = $results[0]['app_state'];
				$app_title     = $results[0]['app_title'];
				$app_body      = $results[0]['app_body'];
				$state         = $results[0]['state'];
				$system        = $results[0]['system'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){

		//消息名称重复检测
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE `title` = '$title'");
		$ret = $dsql->dsqlOper($sql, "totalCount");
		if($ret > 0){
			echo '{"state": 200, "info": "消息名称已经存在，请换个名称！"}';
			die;
		}

		$email_state = (int)$email_state;
		$sms_state = (int)$sms_state;
		$wechat_state = (int)$wechat_state;
		$site_state = (int)$site_state;
		$app_state = (int)$app_state;
		$state = (int)$state;

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`title`, `email_state`, `email_title`, `email_body`, `sms_state`, `sms_tempid`, `sms_intempid`,`sms_body`,`sms_note`, `wechat_state`, `wechat_tempid`, `wechat_body`, `site_state`, `site_title`, `site_body`, `app_state`, `app_title`, `app_body`, `state`, `system`,`wechat_serial`) VALUES ('$title', '$email_state', '$email_title', '$email_body', '$sms_state', '$sms_tempid','$sms_intempid', '$sms_body', '$sms_note', '$wechat_state', '$wechat_tempid', '$wechat_body', '$site_state', '$site_title', '$site_body', '$app_state', '$app_title', '$app_body', '$state', '2','$wechat_serial')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增消息通知", $title);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/siteNotifyAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('email_state', $email_state);
	$huoniaoTag->assign('email_title', $email_title);
	$huoniaoTag->assign('email_body', $email_body);
	$huoniaoTag->assign('sms_state', $sms_state);
	$huoniaoTag->assign('sms_tempid', $sms_tempid);
	$huoniaoTag->assign('sms_intempid', $sms_intempid);
	$huoniaoTag->assign('sms_body', $sms_body);
	$huoniaoTag->assign('sms_note', $sms_note);
	$huoniaoTag->assign('wechat_state', $wechat_state);
	$huoniaoTag->assign('wechat_tempid', $wechat_tempid);
	$huoniaoTag->assign('wechat_serial', $wechat_serial);
	$huoniaoTag->assign('wechat_body', $wechat_body);
	$huoniaoTag->assign('site_state', $site_state);
	$huoniaoTag->assign('site_title', $site_title);
	$huoniaoTag->assign('site_body', $site_body);
	$huoniaoTag->assign('app_state', $app_state);
	$huoniaoTag->assign('app_title', $app_title);
	$huoniaoTag->assign('app_body', $app_body);
	$huoniaoTag->assign('state', $state);
	$huoniaoTag->assign('system', $system);

	global $cfg_smsAlidayu;
	$huoniaoTag->assign('cfg_smsAlidayu', $cfg_smsAlidayu);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
