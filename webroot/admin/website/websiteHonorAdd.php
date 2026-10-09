<?php
/**
 * 自助建站企业荣誉-添加图片
 *
 * @version        $Id: websiteHonorAdd.php 2014-6-25 下午17:54:25 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("websiteGuest");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "websiteHonorAdd.html";

if(empty($website)) die('网站信息传递失败！');

$action = "website_touch_info";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$title   = $title;
	$imglist  = $imglist;
	$weight  = (int)$weight;
	$pubdate = GetMkTime(time()); //发布时间

	if(empty($title)){
		echo '{"state": 200, "info": "请输入图片名称"}';
		exit();
	}

	if(empty($imglist)){
		echo '{"state": 200, "info": "请上传图片"}';
		exit();
	}

	$imgArr = explode(',', $imglist);
	$imgArr = array_reverse($imgArr);

}

//新增
if($dopost == "Add"){

	$pagetitle = "添加企业荣誉";

	//表单提交
	if($submit == "提交"){

		foreach ($imgArr as $key => $value) {
			//保存到主表
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `pubdate`) VALUES ('$website', 'honor', '$title', '$value', '0', '$body', '$weight', '$pubdate')");
			$aid = $dsql->dsqlOper($archives, "lastid");
		}

		adminLog("添加企业荣誉", $title);
		echo '{"state": 100, "id": '.$aid.', "info": '.json_encode("添加成功！").'}';
		die;
	}

//修改
}elseif($dopost == "edit"){

	$pagetitle = "修改企业荣誉";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		foreach ($imgArr as $key => $value) {

			if($key == 0){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `title` = '$title', `litpic` = '$value', `weight` = '$weight' WHERE `id` = ".$id);
				$return = $dsql->dsqlOper($archives, "update");
			}else{
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`website`, `type`, `title`, `litpic`, `date`, `body`, `weight`, `pubdate`) VALUES ('$website', 'honor', '$title', '$value', '0', '$body', '$weight', '$pubdate')");
				$aid = $dsql->dsqlOper($archives, "lastid");
			}

		}

		adminLog("修改企业荣誉", $title);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title  = $results[0]['title'];
				$litpic = $results[0]['litpic'];
				$weight = $results[0]['weight'];

				$huoniaoTag->assign('title', $title);
				$huoniaoTag->assign('litpic', $litpic);
				$huoniaoTag->assign('weight', $weight);

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/website/websiteHonorAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('website', (int)$website);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', (int)$id);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}