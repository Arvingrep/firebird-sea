<?php
/**
 * 楼盘沙盘
 *
 * @version        $Id: houseshapan.php 2016-10-31 下午15:13:22 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2016, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseshapan");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle = "楼盘电子沙盘";

if(empty($loupan)) die('网站信息传递失败！');

$tab = "house_shapan";

$templates = "houseshapan.html";

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'ui/jquery.event.drag-2.2.js',
	'ui/jquery.dragImg.js',
    'ui/chosen.jquery.min.js',
	'admin/house/houseshapan.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

if(!empty($_POST)){
	if($token == "") die('token传递失败！');

	$data = $_POST['data'];
	if(empty($loupan)) die('{"state": 200, "info": "参数传递失败！"}');
	if(empty($litpic)) die('{"state": 200, "info": "请先上传沙盘图片！"}');
	if(empty($data) || $data == '[]') die('{"state": 200, "info": "请先标注楼栋信息！"}');

	$data = serialize(json_decode($_POST['data'], true));

	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_shapan` WHERE `loupan` = $loupan");
	$ret = $dsql->dsqlOper($sql, "totalCount");
	if($ret == 0){

		$sql = $dsql->SetQuery("INSERT INTO `#@__house_shapan` (`loupan`, `litpic`, `data`) VALUES ('$loupan', '$litpic', '$data')");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
			die('{"state": 100, "info": "添加成功！"}');
		}else{
			die('{"state": 200, "info": "操作失败，请联系管理员！"}');
		}

	}else{

		$sql = $dsql->SetQuery("UPDATE `#@__house_shapan` SET `litpic` = '$litpic', `data` = '$data' WHERE `loupan` = $loupan");
		$ret = $dsql->dsqlOper($sql, "update");
		if($ret == "ok"){
			die('{"state": 100, "info": "更新成功！"}');
		}else{
			die('{"state": 200, "info": "操作失败，请联系管理员！"}');
		}

	}

	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//楼盘信息
	$loupanSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_loupan` WHERE `id` = ". $loupan);
	$loupanResult = $dsql->getTypeName($loupanSql);
	if(!$loupanResult)die('楼盘不存在！');
	$huoniaoTag->assign('loupanid', $loupanResult[0]['id']);
	$huoniaoTag->assign('loupaname', $loupanResult[0]['title']);

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('loupan', (int)$loupan);

	$sql = $dsql->SetQuery("SELECT `litpic`, `data` FROM `#@__house_shapan` WHERE `loupan` = $loupan");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$ret = $ret[0];
		$huoniaoTag->assign('litpic', $ret['litpic']);

        $dataArr = unserialize($ret['data']);
        foreach($dataArr as $k => $v){
            $dataArr[$k]['apartment'] = explode(',', $v['apartment']);
        }

		$huoniaoTag->assign('data', $dataArr);
	}


    //获取该楼盘的户型数据
    $apartment = array();
    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = $loupan");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$apartment = $ret;
	}
    $huoniaoTag->assign('apartment', $apartment);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
