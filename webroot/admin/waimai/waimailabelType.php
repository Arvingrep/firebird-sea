<?php
/**
 * 管理家政分类
 *
 * @version        $Id: waimailabelType.php 2019-4-1 下午16:40:21 $
 * @package        HuoNiao.Tieba
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("waimailabelType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "waimailabelType.html";

$action = "waimailabel_type";

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

		if($typename == "" && !$type1) die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
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
			if($type1){
				$typename = $results[0]['typename'];
			}
			$typename    	= cn_substrR($typename,30);
			$title		 	= cn_substrR($title,30);
			$note 			= trim(cn_substrR($note,150));
			$litpic 		= $litpic;
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename',`title` = '$title',`note` = '$note',`litpic` = '$litpic'  WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改跑腿分类", $typename);
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

	// 删除分类图片
	foreach ($idsArr as $kk => $id) {
		//删除分类图标
		$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__".$action."` WHERE `id` = ".$id." AND `litpic` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['litpic'], "delAdv", "waimai");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除跑腿分类", join(",", $idsArr));
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

    adminLog("导入默认数据", "外卖跑腿分类");
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
		'admin/waimai/waimailabelType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/waimai";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__waimailabel_type`;
ALTER TABLE `#@__waimailabel_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('12', '0', '代购', '1', '1606299799', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571603846.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('13', '12', '个护', '0', '1606299799', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('14', '0', '买菜', '0', '1606299799', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571728752.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('15', '0', '酒水', '7', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063570981434.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('16', '0', '咖啡', '6', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571263986.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('17', '0', '奶茶', '5', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/1606357137621.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('18', '0', '小吃', '4', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571413916.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('19', '0', '药品', '3', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571466362.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('20', '0', '日用', '2', '1606357006', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/11/26/16063571544723.png', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('21', '0', '公共分类', '8', '1606357175', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('22', '14', '新鲜蔬果', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('23', '14', '肉蛋禽类', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('24', '14', '安心净菜', '2', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('25', '12', '美妆', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('26', '20', '抽纸', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('27', '20', '香薰', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('28', '19', '计生用品', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('29', '19', '感冒用品', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('30', '19', '跌打损伤', '2', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('31', '18', '膨化食品', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('32', '18', '炸串烤串', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('33', '17', '芝士奶盖', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('34', '17', '清新茶饮', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('35', '16', '美式', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('36', '16', '冰咖', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('37', '15', '酒精饮料', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('38', '15', '洋酒', '1', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('39', '15', '白酒', '2', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('40', '21', '其他物品', '0', '1606441322', '', '', NULL, '');
INSERT INTO `#@__waimailabel_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('43', '21', '取件码', '1', '1645150978', '', '', NULL, '');
DEFAULTSQL;
}
