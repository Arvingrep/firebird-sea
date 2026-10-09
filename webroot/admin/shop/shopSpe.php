<?php
/**
 * 管理商城规格
 *
 * @version        $Id: shopSpe.php 2014-2-9 下午20:40:09 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopSpe");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopSpe.html";

$action = "shop_specification";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改规格
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入规格名').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//规格没有变化
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
			echo '{"state": 101, "info": '.json_encode('规格修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改商城规格", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除规格
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

	adminLog("删除商城规格", join(",", $idsArr));
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

    adminLog("导入默认数据", "商城规格_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/shop/shopSpe.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__shop_specification`;
ALTER TABLE `#@__shop_specification` AUTO_INCREMENT = 1;
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '颜色', '1', '1391950977');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '衣服尺码', '2', '1391950977');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '鞋子尺码', '3', '1391950977');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '胸围尺码', '4', '1391950977');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '内裤尺码', '5', '1391950977');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '1', '军绿色', '0', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '1', '天蓝色', '1', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '1', '灰色', '2', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '1', '桔色', '3', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '1', '绿色', '4', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '1', '黄色', '5', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '1', '白色', '6', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('13', '1', '蓝色', '7', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('14', '1', '紫色', '8', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '1', '红色', '9', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '1', '花色', '10', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '1', '黑色', '11', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '1', '黄色', '12', '1391951073');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '2', '160/80(XS)', '0', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '2', '165/84(S)', '1', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '2', '170/88(M)', '2', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '2', '175/92(L)', '3', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '2', '180/96(XL)', '4', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '2', '185/100(XXL)', '5', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '2', '160/84(XS)', '6', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '2', '165/88(S)', '7', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '2', '170/92(M)', '8', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '2', '175/96(L)', '9', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '2', '180/100(XL)', '10', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '2', '185/104(XXL)', '11', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '2', '均码', '12', '1391951188');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '3', '33', '0', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '3', '34', '1', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '3', '35', '2', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '3', '36', '3', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '3', '37', '4', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '3', '38', '5', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '3', '39', '6', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '3', '40', '7', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '3', '41', '8', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('41', '3', '42', '9', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '3', '43', '10', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('43', '3', '44', '11', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '3', '45', '12', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '3', '46', '13', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '3', '47', '14', '1391951249');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '4', '70AA', '0', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '4', '70f', '1', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '4', '70A', '2', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '4', '70B', '3', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '4', '70C', '4', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('52', '4', '70D', '5', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('53', '4', '70E', '6', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('54', '4', '70F以上', '7', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('55', '4', '65B', '8', '1391951395');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('57', '5', 'S', '0', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('58', '5', 'M', '1', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('59', '5', 'L', '2', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('60', '5', 'XL', '3', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('61', '5', 'XXL', '4', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('62', '5', 'XXXL', '5', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('63', '5', '均码', '6', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('64', '5', '其它尺码', '7', '1391951477');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('65', '1', '褐色', '13', '1554879965');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('66', '0', '重量', '0', '1557310544');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('67', '66', '3斤', '0', '1557310544');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('68', '66', '5斤', '1', '1557310544');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('69', '66', '9斤', '2', '1557310544');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('70', '66', '自提仅有10斤规格', '3', '1557310544');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('71', '0', '荔枝', '6', '1557310727');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('72', '71', '荔枝皇', '0', '1557310727');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('73', '71', '无核荔枝', '1', '1557310727');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('74', '0', '套餐', '7', '1575872763');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('75', '74', 'A套餐', '0', '1575872763');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('76', '74', 'B套餐', '1', '1575872763');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('77', '74', 'C套餐', '2', '1575872763');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('96', '1', '彩虹色', '14', '1592388830');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('97', '0', '风味', '8', '1617171555');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('98', '97', '麻辣', '0', '1617171555');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('99', '97', '五香', '1', '1617171555');
INSERT INTO `#@__shop_specification` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('100', '97', '椒盐', '2', '1617171555');
DEFAULTSQL;
}
