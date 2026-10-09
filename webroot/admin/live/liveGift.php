<?php
/**
 * 直播礼物管理
 *
 * @version        $Id: liveGift.php 2018-11-28 上午11:07:22 $
 * @package        HuoNiao.Live
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("liveGift");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/live";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

//表名
$tab = "live_gift";

//模板名
$templates = "liveGift.html";

//js
$jsFile = array(
	'ui/jquery.ajaxFileUpload.js',
	'admin/live/liveGift.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


//删除礼物
if($dopost == "del"){
	if($token == "") die('token传递失败！');

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$name = $results[0]['gift_name'];
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				echo '{"state": 200, "info": '.json_encode('删除失败，请重试！').'}';
				die;
			}

			adminLog("删除直播礼物", $name);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;
		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的礼物不存在或已删除！').'}';
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

			if($name == "") die('{"state": 101, "info": '.json_encode('请输入礼物名称').'}');
			if($results[0]['gift_name'] != $name){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `gift_name` = '$name' WHERE `id` = ".$id);
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
				adminLog("修改直播礼物名称", $name);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//修改价格
}else if($dopost == "updatePrice"){
    if($token == "") die('token传递失败！');

    if($id != ""){
        $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");

        if(!empty($results)){

            if($name == "") die('{"state": 101, "info": '.json_encode('请输入礼物价格').'}');
            if($results[0]['gift_price'] != $name){

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `gift_price` = '$name' WHERE `id` = ".$id);
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
                adminLog("修改直播礼物价格", $name);
                echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
                exit();
            }

        }else{
            echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
            die;
        }
    }
    die;

//新增礼物
}else if($dopost == "update"){
	if($token == "") die('token传递失败！');
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		$json = objtoarr($json);

		for($i = 0; $i < count($json); $i++){
			$id = $json[$i]["id"];
			$name = $json[$i]["name"];
			$price = $json[$i]["price"];
			$icon = $json[$i]["icon"];

			//如果ID为空则向数据库插入下级分类
			if($id == "" || $id == 0){
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`gift_name`, `gift_price`, `gift_litpic`) VALUES ('$name', '$price', '$icon')");
				$dsql->dsqlOper($archives, "update");
				adminLog("添加直播礼物", $name);
			}
			//其它为数据库已存在的需要验证名称是否有改动，如果有改动则UPDATE
			else{
				$archives = $dsql->SetQuery("SELECT `gift_name`, `gift_price`, `gift_litpic` FROM `#@__".$tab."` WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "results");
				if(!empty($results)){
					//验证分类名
					if($results[0]["gift_name"] != $name || $results[0]["gift_litpic"] != $icon || $results[0]["gift_price"] != $price){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `gift_name` = '$name', `gift_price` = '$price', `gift_litpic` = '$icon' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					adminLog("修改直播礼物", $name);
				}
			}
		}
		echo '{"state": 100, "info": "保存成功！"}';
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$sql = $dsql->SetQuery("SELECT `id`, `gift_name`, `gift_price`, `gift_litpic` FROM `#@__".$tab."`");
	$results = $dsql->dsqlOper($sql, "results");
	$giftList = array();
	if($results){
		foreach ($results as $key => $value) {
			if($value['gift_litpic'] != ''){
				$value['url'] = getFilePath($value['gift_litpic']);
			}else{
				$value['url'] = '';
			}
			$giftList[$key] = $value;
		}

	}
	$huoniaoTag->assign('giftList', $giftList);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/live";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
