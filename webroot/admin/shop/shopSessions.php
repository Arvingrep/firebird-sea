<?php
/**
 * 限时抢购列表
 *
 * @version        $Id: memberLevelList.php 2017-07-21 下午19:28:16 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopHuodongConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//表名

$tab = "shopsessionsite";

//模板名
$templates = "shopSessions.html";
//css
$cssFile = array(
    'admin/bootstrap1.css',
    'admin/ace.min.css',
    'admin/jquery-ui.css',

    // 'admin/app.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//js
$jsFile = array(
	'ui/jquery.ajaxFileUpload.js',
    'ui/jquery-ui.min.js',
    'ui/jquery.form.js',
    'ui/jquery-ui-timepicker-addon.js',
	'admin/shop/shopSessions.js',

);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


//删除等级
if($dopost == "del"){
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$name = $results[0]['name'];
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

			adminLog("删除商城活动场次", $name);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;
		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的场次不存在或已删除！').'}';
			die;
		}
	}
	die;

//修改名称
}else if($dopost == "updateName"){
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($name == "") die('{"state": 101, "info": '.json_encode('请输入等级名称').'}');
			if($results[0]['name'] != $name){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `name` = '$name' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改会员等级名称", $name);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//新增管理组
}else if($dopost == "update"){
	if($token == "") die('token传递失败！');
	$data = str_replace("\\", '', $_REQUEST['data']);
	$pubdate = GetMkTime(time());
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);

        if(!is_array($json)) die('{"state": 200, "info": "格式错误！"}');
        
		for($i = 0; $i < count($json); $i++){
            $id     = $json[$i]["id"];
            $ktime  = $json[$i]["ktime"];
            $etime  = $json[$i]["etime"];
            $number = $json[$i]["number"];
            $name   = $json[$i]["name"];


			//如果ID为空则向数据库插入下级分类
			if($id == "" || $id == 0){
				$arr = serialize(array());
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `ktime`, `etime`,`number`,`pubdate`) VALUES ('$name', '$ktime', '$etime','$number','$pubdate')");
				$dsql->dsqlOper($archives, "update");
				adminLog("添加商城准点抢活动场次", $name);
			}
			//其它为数据库已存在的需要验证名称是否有改动，如果有改动则UPDATE
			else{
				$archives = $dsql->SetQuery("SELECT `title`, `ktime`, `etime`,`number` FROM `#@__".$tab."` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");
				if(!empty($results)){
					//验证分类名
					if($results[0]["title"] != $name || $results[0]["ktime"] != $ktime || $results[0]["etime"] != $etime || $results[0]["number"] != $number){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$name', `ktime` = '$ktime', `etime` = '$etime', `number` = '$number' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					adminLog("修改商城准点抢活动场次", $name);
				}
			}
		}
		echo '{"state": 100, "info": "保存成功！"}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$sql = $dsql->SetQuery("SELECT `id`,`title`, `ktime`, `etime`,`number` FROM `#@__".$tab."`");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		foreach ($results as $key => $value) {
			$levelList[$key] = $value;
		}

	}
	$huoniaoTag->assign('levelList', $levelList);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
