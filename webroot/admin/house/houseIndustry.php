<?php
/**
 * 管理房产行业分类
 *
 * @version        $Id: houseIndustry.php 2014-1-7 下午22:29:11 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseIndustry");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseIndustry.html";

$action = "house_industry";

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
			// 更新缓存
			clearCache("house_industry", "key");
			clearCache("house_industry", $id);

			adminLog("修改房产行业分类", $typename);
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

	// 清除缓存
	clearCache("house_industry", "key");
	clearCache("house_industry", $id);

	adminLog("删除房产行业分类", join(",", $idsArr));
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');


//更新
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action);

	// 清除缓存
	clearCache("house_industry", "key");

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

    adminLog("导入默认数据", "房产行业_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/house/houseIndustry.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__house_industry`;
ALTER TABLE `#@__house_industry` AUTO_INCREMENT = 1;
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '酒店餐饮', '0', '1390017301');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '美容美发', '1', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '服饰鞋包', '2', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '专柜转让', '3', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '休闲娱乐', '4', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '百货超市', '5', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '0', '生活服务', '6', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '0', '电子通讯', '7', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '0', '汽修美容', '8', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '0', '医药保健', '9', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '0', '家居建材', '10', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '0', '教育培训', '11', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('13', '0', '旅馆宾馆', '12', '1390017302');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '1', '餐馆', '0', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '1', '食堂', '1', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '1', '面包店', '2', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '1', '冷饮甜品店', '3', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '1', '咖啡馆', '4', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '1', '茶艺馆', '5', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '1', '小吃店', '6', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '1', '水果食品店', '7', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '1', '凉茶店', '8', '1390017351');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '1', '快餐店', '9', '1390017357');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '2', '美容院', '0', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '2', '美发店', '1', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '2', '美甲店', '2', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '2', 'SPA馆', '3', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '3', '服装店', '0', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '3', '内衣店', '1', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '3', '童装店', '2', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '3', '鞋店', '3', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '3', '箱包店', '4', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '3', '饰品店', '5', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '4', '商场专柜', '0', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '4', '电子专柜', '1', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '4', '其它专柜', '2', '1390017446');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '5', '网吧', '0', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '5', '酒吧', '1', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '5', '足浴', '2', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('41', '5', '水疗', '3', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '5', '球馆', '4', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('43', '5', '麻将馆', '5', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '5', '瑜伽馆', '6', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '5', '歌舞厅(ktv)', '7', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '5', '养生馆', '8', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '5', '夜总会', '9', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '5', '桌球城', '10', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '5', '健身房', '11', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '5', '游泳馆', '12', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '5', '休闲中心', '13', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('52', '5', '棋牌室', '14', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('53', '5', '电玩城', '15', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('54', '5', '溜冰场', '16', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('55', '5', '儿童乐园', '17', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('56', '5', '婴儿游泳馆', '18', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('57', '5', '度假山庄', '19', '1390017561');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('58', '6', '超市', '0', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('59', '6', '便利店', '1', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('60', '6', '小卖部', '2', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('61', '6', '精品店', '3', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('62', '6', '干货杂货店', '4', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('63', '6', '烟酒茶叶店', '5', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('64', '6', '母婴用品店', '6', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('65', '6', '玩具店', '7', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('66', '6', '文具店', '8', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('67', '6', '书店', '9', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('68', '6', '音像店', '10', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('69', '6', '眼镜店', '11', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('70', '6', '化妆品店', '12', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('71', '6', '乐器店', '13', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('72', '6', '工艺品店', '14', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('73', '6', '珠宝首饰', '15', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('74', '6', '床上用品', '16', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('75', '6', '体育用品店', '17', '1390017635');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('76', '7', '干洗店', '0', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('77', '7', '花店水族', '1', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('78', '7', '公话超市', '2', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('79', '7', '彩票店', '3', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('80', '7', '报刊亭', '4', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('81', '7', '送水送气店', '5', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('82', '7', '宠物店', '6', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('83', '7', '照相馆', '7', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('84', '7', '婚纱摄影店', '8', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('85', '7', '婚介所', '9', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('86', '7', '职介所', '10', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('87', '7', '家政中心', '11', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('88', '7', '打字复印', '12', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('89', '7', '美鞋修鞋店', '13', '1390017687');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('90', '8', '手机店', '0', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('91', '8', '电脑店', '1', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('92', '8', '电器店', '2', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('93', '8', '维修店', '3', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('94', '8', '通讯用品店', '4', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('95', '9', '汽修厂', '0', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('96', '9', '汽配店', '1', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('97', '9', '轮胎店', '2', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('98', '9', '汽车美容店', '3', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('99', '9', '车场', '4', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('100', '10', '医院', '0', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('101', '10', '诊所', '1', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('102', '10', '药店', '2', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('103', '10', '保健品店', '3', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('104', '10', '成人用品店', '4', '1390017758');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('105', '11', '五金店', '0', '1390017827');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('106', '11', '建材店', '1', '1390017827');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('107', '11', '家具店', '2', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('108', '11', '灯饰店', '3', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('109', '11', '家居饰品店', '4', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('110', '11', '装饰装修材料店', '5', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('111', '12', '学校', '0', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('112', '12', '幼儿园', '1', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('113', '12', '培训机构', '2', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('114', '12', '家教中心', '3', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('115', '12', '早教中心', '4', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('116', '13', '旅馆', '0', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('117', '13', '宾馆酒店', '1', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('118', '13', '招待所', '2', '1390017828');
INSERT INTO `#@__house_industry` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('119', '13', '公寓房', '3', '1390017828');
DEFAULTSQL;
}
