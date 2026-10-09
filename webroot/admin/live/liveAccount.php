<?php
/**
 * 直播平台管理
 *
 * @version        $Id: smsAccount.php 2015-8-5 下午23:58:11 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("liveAccount");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/live";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "liveAccount.html";

if($action != "" || $dopost != ""){
	if($token == "") die('token传递失败！');

	//获取直播平台信息
	if($action == "getInfo"){
		if($id !== ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `id` = $id");
			$results  = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				echo json_encode($results[0]);
			}
		}
		die;

	//启用直播帐号
	}elseif($action == "update"){

		if($id !== ""){

			$archives = $dsql->SetQuery("UPDATE `#@__liveaccount` SET `state` = 0");
			$dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("UPDATE `#@__liveaccount` SET `state` = 1 WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

			if($results != "ok"){
				echo '{"state": 200, "info": "启用失败！"}';
				exit();
			}else{
				adminLog("启用直播平台", $id);
				echo '{"state": 100, "info": "启用成功！"}';
				exit();
			}

		}else{
			die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
		}

	}elseif($action == "surplus"){

		if(!empty($id)){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` where `id` = $id");
			$results  = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$sms = new sms($dbo, $results[0]);
				$count = (int)$sms->check();
				echo $count;die;
			}else{
				echo 0;die;
			}

		}else{
			echo 0;die;
		}

	}else{

		//添加直播平台
		if($dopost == "add"){

			$title    = $title;
			$username = $username;
			$password = $password;

			if(empty($title) || empty($username) || empty($password))
			die('{"state": 200, "info": '.json_encode("请填写完整！").'}');

			$state = 0;

			$archives = $dsql->SetQuery("INSERT INTO `#@__liveaccount` (`title`, `username`, `password`, `vhost`, `appname`, `pushdomain`, `privatekey`, `website`, `contact`, `state`, `playdomain`, `playprivatekey`, `duration`) VALUES ('$title', '$username', '$password', '$vhost', '$appname', '$pushdomain', '$privatekey',  '$website', '$contact', '$state', '$playdomain', '$playprivatekey', '$duration')");
			$results = $dsql->dsqlOper($archives, "update");

			if($results != "ok"){
				echo '{"state": 200, "info": "添加失败！"}';
				exit();
			}else{
				adminLog("添加直播平台", $title);
				echo '{"state": 100, "info": "添加成功！"}';
				exit();
			}

		}elseif($dopost == "edit"){

			if($id !== ""){
				$title    = $title;
				$username = $username;
				$password = $password;

				if(empty($title) || empty($username) || empty($password))
				die('{"state": 200, "info": '.json_encode("请填写完整！").'}');

				$archives = $dsql->SetQuery("UPDATE `#@__liveaccount` SET `title` = '$title', `username` = '$username', `password` = '$password', `vhost` = '$vhost', `appname` = '$appname', `pushdomain` = '$pushdomain', `privatekey` = '$privatekey', `website` = '$website', `contact` = '$contact', `playdomain` = '$playdomain', `playprivatekey` = '$playprivatekey', `duration` = '$duration' WHERE `id` = $id");
				$results = $dsql->dsqlOper($archives, "update");

				if($results != "ok"){
					echo '{"state": 200, "info": "修改失败！"}';
					exit();
				}else{
					adminLog("修改直播平台", $title);
					echo '{"state": 100, "info": "修改成功！"}';
					exit();
				}


			}else{
				die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
			}
		}elseif($dopost == "del"){
			if($id !== ""){

				$archives = $dsql->SetQuery("SELECT * FROM `#@__liveaccount` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");

				if($results[0]['state'] == 1){
					die('{"state": 200, "info": '.json_encode("启用状态下无法删除！").'}');
				}

				$title = $results[0]['title'];

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__liveaccount` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					echo '{"state": 200, "info": "删除失败！"}';
					exit();
				}else{
					adminLog("删除直播平台", $title);
					echo '{"state": 100, "info": "删除成功！"}';
					exit();
				}
			}else{
				die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
			}
		}
	}
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/live/liveAccount.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


	//直播平台
	$smsItem  = array();
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `website`, `contact`, `state` FROM `#@__liveaccount` ORDER BY `id` DESC");
	$results  = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {
			$state = '<font class="muted">未启用</font>';
			$cla = '';
			if($value['state'] == 1){
				$state = '<font class="text-success">已启用</font>';
				$cla = ' current';
			}
			$smsItem[] = '<dl class="mail-item clearfix'.$cla.'" data-title="'.$value['title'].'" data-id="'.$value['id'].'"><div class="bg">启用此帐号</div><dt>平台：</dt><dd>'.$value['title'].'</dd><dt>官网：</dt><dd>'.$value['website'].'</dd><dt>联系：</dt><dd>'.$value['contact'].'</dd><div class="opera">'.$state.'<a href="javascript:;" class="del btn btn-mini" title="删除"><s class="icon-trash"></s></a><a href="javascript:;" class="edit btn btn-mini" title="修改"><s class="icon-edit"></s></a></div></dl>';
		}
	}

    $huoniaoTag->assign('smsItem', join("", $smsItem));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/live";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
