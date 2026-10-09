<?php
/**
 * 短信平台管理
 *
 * @version        $Id: smsAccount.php 2015-8-5 下午23:58:11 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("smsAccount");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "smsAccount.html";

if($action != "" || $dopost != ""){
	if($token == "") die('token传递失败！');

	//获取短信帐号信息
	if($action == "getInfo"){
		if($id !== ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` where `id` = $id");
			$results  = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				echo json_encode($results[0]);
			}
		}
		die;

	//启用短信帐号
	}elseif($action == "update"){

		if($id !== ""){

			$archives = $dsql->SetQuery("UPDATE `#@__sitesms` SET `state` = 0");
			$dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("UPDATE `#@__sitesms` SET `state` = 1 WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

			if($results != "ok"){
				echo '{"state": 200, "info": "启用失败！"}';
				exit();
			}else{
				adminLog("启用短信平台", $id);
				echo '{"state": 100, "info": "启用成功！"}';
				exit();
			}

		}else{
			die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
		}

	}elseif($action == "surplus"){

		if(!empty($id)){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` where `id` = $id");
			$results  = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$sms   = new sms($dbo, $results[0]);
				$r     = $sms->check();
				$count = (int)$r;

				$title = $results[0]['title'];
				$international = $results[0]['international'];

				if(strpos($title, "创蓝") !== true || strpos($title, "253") !== true || strpos("cl2009", $title) !== true){

                    if($international){
                    	$count = $r." 元";
                    }
                }

				echo json_encode($count);die;
			}else{
				echo 0;die;
			}

		}else{
			echo 0;die;
		}

	}else{

		//添加短信平台
		if($dopost == "add"){

			$title    = $title;
			$username = $username;
			$password = $password;

			if(empty($title) || empty($username) || empty($password))
			die('{"state": 200, "info": '.json_encode("请填写完整！").'}');

			$state = 0;

			//下面注释掉的功能是：如果短信平台为空的时候，添加第一个平台将自动为选择状态；
			//注释掉的原因是：增加阿里大于平台后，前端脚本会根据选择的平台判断是否为阿里大于，然后再去请求一次系统基本设置的功能，由于需要异步，利用前端脚本更容易实现，所以暂时先将这个功能注释掉
			// $archives = $dsql->SetQuery("SELECT `id` FROM `#@__sitesms`");
			// $results  = $dsql->dsqlOper($archives, "totalCount");
			// if($results == 0){
			// 	$state = 1;
			// }
			$charset = (int)$charset;
			$international = (int)$international;
			$china = (int)$china;
			$archives = $dsql->SetQuery("INSERT INTO `#@__sitesms` (`title`, `username`, `password`, `signCode`, `charset`, `sendUrl`, `sendCode`, `accountUrl`, `accountCode`, `website`, `contact`, `international`, `china`, `state`) VALUES ('$title', '$username', '$password', '$signCode', '$charset', '$sendUrl', '$sendCode', '$accountUrl', '$accountCode', '$website', '$contact', '$international', '$china', '$state')");
			$results = $dsql->dsqlOper($archives, "update");

			if($results != "ok"){
				echo '{"state": 200, "info": "添加失败！"}';
				exit();
			}else{
				adminLog("添加短信平台", $title);
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

				$charset = (int)$charset;
				$international = (int)$international;
				$china = (int)$china;
				$archives = $dsql->SetQuery("UPDATE `#@__sitesms` SET `title` = '$title', `username` = '$username', `password` = '$password', `signCode` = '$signCode', `charset` = '$charset', `sendUrl` = '$sendUrl', `sendCode` = '$sendCode', `accountUrl` = '$accountUrl', `accountCode` = '$accountCode', `website` = '$website', `contact` = '$contact', `international` = '$international', `china` = '$china' WHERE `id` = $id");
				$results = $dsql->dsqlOper($archives, "update");

				if($results != "ok"){
					echo '{"state": 200, "info": "修改失败！"}';
					exit();
				}else{
					adminLog("修改短信平台", $title);
					echo '{"state": 100, "info": "修改成功！"}';
					exit();
				}


			}else{
				die('{"state": 200, "info": '.json_encode("参数传递失败！").'}');
			}
		}elseif($dopost == "del"){
			if($id !== ""){

				$archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");

				if($results[0]['state'] == 1){
					die('{"state": 200, "info": '.json_encode("启用状态下无法删除！").'}');
				}

				$title = $results[0]['title'];

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__sitesms` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					echo '{"state": 200, "info": "删除失败！"}';
					exit();
				}else{
					adminLog("删除短信平台", $title);
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
		'admin/siteConfig/smsAccount.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


	//短信平台
	$smsItem  = array();
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `website`, `contact`, `state` FROM `#@__sitesms` ORDER BY `id` DESC");
	$results  = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {
			$state = '<font class="muted">未启用</font>';
			$cla = '';
			if($value['state'] == 1){
				$state = '<font class="text-success">已启用</font>';
				$cla = ' current';
			}
			$smsItem[] = '<dl class="mail-item clearfix'.$cla.'" data-title="'.$value['title'].'" data-id="'.$value['id'].'"><div class="bg">启用此帐号</div><dt>平台：</dt><dd>'.$value['title'].'</dd><dt>官网：</dt><dd>'.$value['website'].'</dd><dt>联系：</dt><dd>'.$value['contact'].'</dd><dt>剩余：</dt><dd class="sur"><img src="/static/images/loading_16.gif" /></dd><div class="opera">'.$state.'<a href="javascript:;" class="del btn btn-mini" title="删除"><s class="icon-trash"></s></a><a href="javascript:;" class="edit btn btn-mini" title="修改"><s class="icon-edit"></s></a></div></dl>';
		}
	}

	$huoniaoTag->assign('smsItem', join("", $smsItem));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
