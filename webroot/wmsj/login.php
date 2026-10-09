<?php
/**
 * 后台登陆
 *
 * @version        $Id: login.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
require_once(dirname(__FILE__).'/../include/common.inc.php');
$tpl = dirname(__FILE__)."/templates";
$huoniaoTag->caching         = FALSE;
$huoniaoTag->compile_dir  = HUONIAOROOT."/templates_c/admin";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$rember = $rember != 1 ? 0 : 1;

//判断是否已登录（用于异步数据出错时判断是否登录，超时则刷新当前页面）
if($action == "checkLogin"){
	if($userLogin->getUserID()==-1){
		echo "0";
	}else{
		echo "1";
	}
	die;
}

//登录检测
if($dopost=='login'){
	if(!empty($userid) && !empty($pwd)){
		$res = $userLogin->checkUser($userid,$pwd,true);

		//success
		if($res == 1){
			//自动登录，有效期7天
			if($rember == 1){
				$userLogin->keepUser();
			}

			$userid = $userLogin->getUserID();
			$archives = $dsql->SetQuery("INSERT INTO `#@__adminlogin` (`userid`, `logintime`, `loginip`, `ipaddr`) VALUES ($userid, ".GetMkTime(time()).", '".GetIP()."', '".getIpAddr(GetIP())."')");
			$dsql->dsqlOper($archives, "update");

			echo '{"state": 100, "info": "登录成功！"}';
			die;

		//error
		}else if($res == -1 || $res == -2){

			$ip = GetIP();
			$archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
			$results = $dsql->dsqlOper($archives, "results");

			//如果有记录则错误次数加1
			if($results){
				$timedifference = GetMkTime(time()) - $results[0]['date'];
				//计算最后一次错误是否是在15分钟之前，如果是则重置错误次数
				if($timedifference/60 > 15){
					$count = 1;
				}else{
					$count = $results[0]['count'];
					$count++;
				}
				$archives = $dsql->SetQuery("UPDATE `#@__failedlogin` SET `count` = ".$count.", `date` = ".GetMkTime(time())." WHERE `ip` = '".$ip."'");
				$results = $dsql->dsqlOper($archives, "update");

			//没有记录则新增一条
			}else{
				$count = 1;
				$archives = $dsql->SetQuery("INSERT INTO `#@__failedlogin` (`ip`, `count`, `date`) VALUES ('$ip', $count, ".GetMkTime(time()).")");
				$results = $dsql->dsqlOper($archives, "update");
			}

			echo '{"state": 200, "info": "用户名或密码错误，请重试！", "count": '.$count.'}';
			die;

		}else if($res == -3){
			echo '{"state": 300, "info": "帐号处于锁定状态，暂时无法登录，请联系管理员!"}';
			die;
		}
	}

	//password empty
	else{
		echo '{"state": 300, "info": "用户名和密码没填写完整!"}';
		die;
	}
}

//检验用户登录状态
if($userLogin->getUserID()!=-1){
    header("location:index.php");
    exit();
}

//登录成功后跳转页面
if(!empty($gotopage)) {
	$gotopage = RemoveXSS($gotopage);
}

//模板标签赋值
$huoniaoTag->assign("gotopage", $gotopage);

//验证模板文件
$templates = "login.html";
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'admin/login.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$ip = GetIP();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__failedlogin` WHERE `ip` = '$ip'");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		//验证错误次数，并且上次登录错误是在15分钟之内
		if($results[0]['count'] >= 5){
			$timedifference = GetMkTime(time()) - $results[0]['date'];
			if($timedifference/60 < 15){
				$huoniaoTag->assign('failedlogin', 1);
			}
		}
	}

	global $cfg_agreeProtocol;
	$huoniaoTag->assign('cfg_agreeProtocol', (int)$cfg_agreeProtocol);

	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
