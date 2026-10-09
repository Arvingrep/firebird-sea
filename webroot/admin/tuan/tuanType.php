<?php
/**
 * 管理团购分类
 *
 * @version        $Id: tuanType.php 2013-12-6 下午22:17:18 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanType.html";

$action = "tuan";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."type` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if(!testPurview("editTuanType")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."type` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."type` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}else{

			//对字符进行处理
			$typename    = cn_substrR($typename,30);
			$seotitle    = cn_substrR($seotitle,80);
			$keywords    = cn_substrR($keywords,60);
			$description = cn_substrR($description,150);
			$hot         = (int)$hot;
			$color       = cn_substrR($color,7);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."type` SET `parentid` = '$parentid', `typename` = '$typename', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description', `hot` = '$hot', `color` = '$color' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改团购分类", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}else if($dopost == "del"){
	if(!testPurview("editTuanType")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	if($id == "") die;

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {
		$childArr = $dsql->getTypeList($id, $action."type", 1);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__tuantype` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delAdv", "tuan");
		}
	}

	//删除分类下的信息
	// foreach ($idsArr as $kk => $id) {
	//
	// 	//查询此分类下所有信息ID
	// 	$archives = $dsql->SetQuery("SELECT `id`, `litpic`, `pics`, `body` FROM `#@__".$action."list` WHERE `typeid` = ".$id);
	// 	$results = $dsql->dsqlOper($archives, "results");
	//
	// 	if(count($results) > 0){
	// 		foreach($results as $key => $val){
	// 			//删除评论
	// 			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."common` WHERE `aid` = ".$val['id']);
	// 			$dsql->dsqlOper($archives, "update");
	//
	// 			$orderid = array();
	// 			//删除相应的订单、团购券、充值卡数据
	// 			$orderSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_order` WHERE `proid` = ".$val['id']);
	// 			$orderResult = $dsql->dsqlOper($orderSql, "results");
	//
	// 			if($orderResult){
	// 				foreach($orderResult as $key => $order){
	// 					array_push($orderid, $order['id']);
	// 				}
	//
	// 				if(!empty($orderid)){
	// 					$orderid = join(",", $orderid);
	//
	// 					$quanSql = $dsql->SetQuery("DELETE FROM `#@__".$action."quan` WHERE `orderid` in (".$orderid.")");
	// 					$dsql->dsqlOper($quanSql, "update");
	//
	// 					$quanSql = $dsql->SetQuery("DELETE FROM `#@__paycard` WHERE `orderid` in (".$orderid.")");
	// 					$dsql->dsqlOper($quanSql, "update");
	// 				}
	//
	// 			}
	//
	// 			$quanSql = $dsql->SetQuery("DELETE FROM `#@__".$action."_order` WHERE `proid` = ".$val['id']);
	// 			$dsql->dsqlOper($quanSql, "update");
	//
	//
	// 			//删除缩略图
	// 			delPicFile($val['litpic'], "delThumb", $action);
	//
	// 			//删除图集
	// 			delPicFile($val['pics'], "delAtlas", $action);
	//
	// 			$body = $val['body'];
	// 			if(!empty($body)){
	// 				delEditorPic($body, $action);
	// 			}
	//
	// 		}
	// 	}
	//
	// }
	//
	// //删除信息表
	// $archives = $dsql->SetQuery("DELETE FROM `#@__".$action."list` WHERE `typeid` in (".join(",", $idsArr).")");
	// $results = $dsql->dsqlOper($archives, "update");

	//删除字段表
	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."typeitem` WHERE `tid` in (".join(",", $idsArr).")");
	$results = $dsql->dsqlOper($archives, "update");

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."type` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除团购分类", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	if(!testPurview("addTuanType")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	}
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action."type");
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

    adminLog("导入默认数据", "团购分类_tuantype");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/tuan/tuanType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type"), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__tuantype`;
ALTER TABLE `#@__tuantype` AUTO_INCREMENT = 1;
DELETE FROM `#@__tuantypeitem`;
ALTER TABLE `#@__tuantypeitem` AUTO_INCREMENT = 1;
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('1', '0', '餐饮美食', '0', '0', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2019/01/12/15472883052364.png', '1', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('2', '0', '酒店民宿', '0', '5', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2018/09/27/15380461174563.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('3', '0', '休闲娱乐', '0', '1', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2019/01/12/15472885062583.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('4', '0', '生活服务', '0', '6', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2018/09/27/1538046121515.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('5', '0', '丽人美发', '0', '7', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2018/09/27/15380461239697.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('6', '0', '亲子母婴', '0', '4', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2019/01/12/15472884222960.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('8', '0', '学习培训', '0', '3', '', '', '', '1514890535', 'https://upload.ihuoniao.cn//tuan/adv/large/2019/01/12/15472883606076.png', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('12', '1', '甜点饮品', '0', '0', '', '', '', '1514890752', '', '0', '#b2a2c7');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('13', '1', '火锅', '0', '1', '', '', '', '1514890752', '', '1', '#31859b');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('14', '1', '自助餐', '0', '2', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('15', '1', '小吃快餐', '0', '3', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('16', '1', '日韩料理', '0', '4', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('17', '1', '西餐', '0', '5', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('18', '1', '聚餐宴请', '0', '6', '', '', '', '1514890752', '', '1', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('19', '1', '烧烤烤肉', '0', '7', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('20', '1', '东北菜', '0', '8', '', '', '', '1514890752', '', '1', '#e36c09');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('21', '1', '川湘菜', '0', '9', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('22', '1', '江浙菜', '0', '10', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('23', '1', '香锅烤鱼', '0', '11', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('24', '1', '粤港菜', '0', '12', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('25', '1', '西北菜', '0', '13', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('26', '1', '云贵菜', '0', '14', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('27', '1', '东南亚菜', '0', '15', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('28', '1', '海鲜', '0', '16', '', '', '', '1514890752', '', '1', '#c00000');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('29', '1', '素食', '0', '17', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('30', '1', '台湾/客家菜', '0', '18', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('31', '1', '京菜鲁菜', '0', '19', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('32', '1', '新疆菜', '0', '20', '', '', '', '1514890752', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('33', '1', '汤/粥/炖菜', '0', '21', '', '', '', '1514890840', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('34', '1', '其他美食', '0', '22', '', '', '', '1514890840', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('35', '2', '经济型', '0', '0', '', '', '', '1514945394', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('36', '2', '舒适/三星', '0', '1', '', '', '', '1514945394', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('37', '2', '高档/四星', '0', '2', '', '', '', '1514945394', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('38', '2', '豪华/五星', '0', '3', '', '', '', '1514945394', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('39', '2', '民宿', '0', '4', '', '', '', '1514945394', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('40', '2', '客栈', '0', '5', '', '', '', '1514945394', '', '1', '#9bbb59');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('41', '3', '足疗按摩', '0', '0', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('42', '3', '洗浴/汗蒸', '0', '1', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('43', '3', 'KTV', '0', '2', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('44', '3', '酒吧', '0', '3', '', '', '', '1514945574', '', '1', '#7030a0');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('45', '3', '电玩/游戏厅', '0', '4', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('47', '3', 'DIY手工坊', '0', '5', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('48', '3', '密室逃脱', '0', '6', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('49', '3', '网吧网咖', '0', '7', '', '', '', '1514945574', '', '1', '#76923c');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('50', '3', '茶馆', '0', '8', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('51', '3', '棋牌室', '0', '9', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('52', '3', '桌游', '0', '10', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('53', '3', '真人CS', '0', '11', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('54', '3', '采摘/农家乐', '0', '12', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('55', '3', 'VR', '0', '13', '', '', '', '1514945574', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('56', '4', '衣物/皮具洗护', '0', '0', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('57', '4', '家政服务', '0', '1', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('58', '4', '证件照/照片冲洗', '0', '2', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('59', '4', '汽车服务', '0', '3', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('60', '4', '搬家', '0', '4', '', '', '', '1514946222', '', '1', '#ff0000');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('61', '4', '宠物服务', '0', '5', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('62', '4', '体检/齿科', '0', '6', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('63', '4', '电脑维修', '0', '7', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('64', '4', '家电维修', '0', '8', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('65', '4', '手机维修', '0', '9', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('66', '4', '鲜花', '0', '10', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('67', '4', '配镜', '0', '11', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('68', '4', '母婴亲子', '0', '12', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('69', '4', '培训课程', '0', '13', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('70', '4', '婚庆', '0', '14', '', '', '', '1514946222', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('71', '5', '美发', '0', '0', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('72', '5', '美容美体', '0', '1', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('73', '5', '美甲美睫', '0', '2', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('74', '5', '瑜伽舞蹈', '0', '3', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('75', '5', '瘦身纤体', '0', '4', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('76', '5', '韩式定妆', '0', '5', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('77', '5', '祛痘', '0', '6', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('78', '5', '纹身', '0', '7', '', '', '', '1514946572', '', '1', '#ffc000');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('79', '5', '化妆品', '0', '8', '', '', '', '1514946572', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('80', '6', '婴儿游泳', '0', '0', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('81', '6', '早教中心', '0', '1', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('82', '6', '少儿英语', '0', '2', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('83', '6', '智力开发', '0', '3', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('84', '6', '托班/幼儿园', '0', '4', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('85', '6', '幼儿教育', '0', '5', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('86', '6', '儿童摄影', '0', '6', '', '', '', '1514947272', '', '1', '#548dd4');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('87', '6', '孕妇写真', '0', '7', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('88', '6', '月子会所', '0', '8', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('89', '6', '产后恢复', '0', '9', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('90', '6', '妇幼医院', '0', '10', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('91', '6', '孕产用品', '0', '11', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('92', '6', '月嫂', '0', '12', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('93', '6', '亲子购物', '0', '13', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('94', '6', '宝宝派对', '0', '14', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('95', '6', '亲子服务', '0', '15', '', '', '', '1514947272', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('109', '8', '钢琴', '0', '0', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('110', '8', '吉他', '0', '1', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('111', '8', '小提琴', '0', '2', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('112', '8', '古筝', '0', '3', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('113', '8', '架子鼓', '0', '4', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('114', '8', '声乐', '0', '5', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('115', '8', '美容化妆', '0', '6', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('116', '8', '会计', '0', '7', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('117', '8', '厨艺', '0', '8', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('118', '8', '管理培训', '0', '9', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('119', '8', '摄影培训', '0', '10', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('120', '8', '司法考试', '0', '11', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('121', '8', '公务员培训', '0', '12', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('122', '8', '外语培训', '0', '13', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('123', '8', '美术培训', '0', '14', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('124', '8', '书法', '0', '15', '', '', '', '1514947726', '', '0', '');
INSERT INTO `#@__tuantype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `hot`, `color`) VALUES ('133', '0', '服饰鞋包', '0', '2', '', '', '', '1547287709', 'https://upload.ihuoniao.cn//tuan/adv/large/2019/01/12/154728858018.png', '1', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('185', '174', 'peopleCount', '人数', '1', 'radio', '1', '单人餐\r\n双人餐\r\n3-4人\r\n5-10人\r\n10人以上\r\n其他', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('186', '174', 'priceType', '价格', '1', 'checkbox', '1', '20元以下\r\n21-50元\r\n51-80元\r\n81-120元\r\n121-200元\r\n201-500元\r\n501-800元\r\n801元以上', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('187', '215', 'star', '酒店星级', '1', 'radio', '1', '经济型酒店\r\n豪华酒店\r\n公寓式酒店\r\n主题酒店\r\n度假酒店\r\n客栈\r\n青年旅舍\r\n钟点房', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('188', '215', 'price_', '价格', '1', 'radio', '1', '50元以下\r\n51-100元\r\n101-150元\r\n151-200元\r\n201－500元\r\n500元以上', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('189', '215', 'bedType', '房型', '1', 'radio', '1', '大床房\r\n双床房\r\n单人房\r\n三人间\r\n其他', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('190', '215', 'inTime', '时间', '1', 'radio', '1', '过夜房\r\n钟点房', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('191', '215', 'facility', '设施', '0', 'checkbox', '1', '免费WIFI\r\n免费宽带\r\n免费早餐', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('192', '188', 'type', '类型', '10', 'radio', '1', '经济型酒店\r\n豪华酒店\r\n度假酒店\r\n主题精品酒店\r\n温泉酒店\r\n公寓式酒店\r\n客栈/青旅/民宿\r\n亲子酒店', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('193', '188', 'price', '价格', '1', 'radio', '0', '0-50元\r\n50-100元\r\n100-150元\r\n150-200元\r\n200-500元\r\n500元以上', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('199', '1', '口味', '餐厅风格', '1', 'select', '0', '异域\r\n中式\r\n西式', '');
INSERT INTO `#@__tuantypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`) VALUES ('200', '1', '定制', '口味定制', '1', 'radio', '0', '接受\r\n不接受\r\n视情况而定', '');
DEFAULTSQL;
}
