<?php
/**
 * 管理汽车级别分类
 *
 * @version        $Id: carlevel.php 2019-03-15 下午22:29:11 $
 * @package        HuoNiao.car
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("carlevel");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "carlevel.html";

$action = "car_level";
//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入行业分类名').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}else{
			//对字符进行处理
			$typename    = cn_substrR($typename,30);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改汽车级别分类", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}else if($dopost == "del"){
	if($id == "") die;

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {
		$childArr = $dsql->getTypeList($id, $action, 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$idsArr[] = $id;
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除汽车级别分类", join(",", $idsArr));
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');


//更新
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action);
	echo $json;
	die;
}
//默认数据
else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "汽车级别_car_level");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/car/carlevel.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__car_level`;
ALTER TABLE `#@__car_level` AUTO_INCREMENT = 1;
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('20', '0', '轿车', '0', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900418634266.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('21', '20', '微型车', '0', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('22', '20', '小型车', '1', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('23', '20', '紧凑型车', '2', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('24', '20', '中型车', '3', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('25', '20', '中大型车', '4', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('26', '20', '豪华车', '5', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('27', '0', 'SUV', '1', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900418674899.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('28', '27', '小型SUV', '0', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('29', '27', '紧凑型SUV', '1', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('30', '27', '中型SUV', '2', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('31', '27', '中大型SUV', '3', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('32', '27', '全尺寸SUV', '4', '1553764368', '');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('33', '0', 'MPV', '2', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900418753555.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('34', '0', '跑车', '3', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/1590041880404.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('35', '0', '微面', '4', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900419415385.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('36', '0', '皮卡', '5', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900422771843.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('37', '0', '轻客', '6', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900422828808.png');
INSERT INTO `#@__car_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('38', '0', '微卡', '7', '1553764368', 'https://upload.ihuoniao.cn//car/adv/large/2020/05/21/15900422897270.png');
DEFAULTSQL;
}
