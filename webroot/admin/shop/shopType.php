<?php
/**
 * 管理商城分类
 *
 * @version        $Id: shopType.php 2014-2-9 下午23:30:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopType.html";

$action = "shop_type";

//获取指定ID详情
if($dopost == "getTypeDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//修改分类
}else if($dopost == "updateType"){
	checkPurview("editShopType");

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
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
				$seotitle    = cn_substrR($seotitle,80);
				$keywords    = cn_substrR($keywords,60);
				$description = cn_substrR($description,150);
				$spes = isset($spe) ? join(',',$spe) : '';

				//同步子级分类的规格
				if($replace){
					speRelevance($id, $spes);
				}

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `parentid` = '$parentid', `typename` = '$typename', `spe` = '$spes', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}

			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
				exit();
			}else{
				adminLog("修改分类商城分类", $typename);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}

		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的商城不存在或已删除！').'}';
			die;
		}
	}
	die;

//删除分类
}else if($dopost == "del"){
	checkPurview("delShopType");

	if($id != ""){

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

		foreach ($idsArr as $key => $id) {
			//删除分类下所有字段
			$archives = $dsql->SetQuery("DELETE FROM `#@__shop_item` WHERE `type` = ".$id);
			$dsql->dsqlOper($archives, "update");
			//删除分类图标
			$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."` WHERE `id` = ".$id." AND `icon` != ''");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				delPicFile($res[0]['icon'], "delAdv", "shop");
			}
		}

		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
		$dsql->dsqlOper($archives, "update");

		adminLog("删除分类商城分类", join(",", $idsArr));
		echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
		die;

	}
	die;

//更新商城分类
}else if($dopost == "typeAjax"){
	checkPurview("addShopType");
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);

		$json = objtoarr($json);
		$json = typeAjax($json, 0, $action);
		echo $json;
	}
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

    adminLog("导入默认数据", "商城分类_" . $action);
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
		'admin/shop/shopType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));

	//规格
	$speSql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_specification` WHERE `parentid` = 0 ORDER BY `weight`");
	$speResult = $dsql->dsqlOper($speSql, "results");
	$speListArr = array();
	if($speResult){
		$speListArr = $speResult;
	}
	$huoniaoTag->assign('speListArr', json_encode($speListArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//同步子级分类规格
function speRelevance($id, $spes){
	global $dsql;
	$typeSql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_type` WHERE `parentid` = ".$id);
	$typeResult = $dsql->dsqlOper($typeSql, "results");
	if($typeResult){
		$typeSql = $dsql->SetQuery("UPDATE `#@__shop_type` SET `spe` = '$spes' WHERE `parentid` = ".$id);
		$dsql->dsqlOper($typeSql, "results");

		foreach($typeResult as $key => $value){
			speRelevance($value['id'], $spes);
		}
	}
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__shop_type`;
ALTER TABLE `#@__shop_type` AUTO_INCREMENT = 1;
DELETE FROM `#@__shop_item`;
ALTER TABLE `#@__shop_item` AUTO_INCREMENT = 1;
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('1', '0', '服装配饰', '0', '', '', '', '1,2,3', '1391960756', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876952926837.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('2', '0', '手机数码', '1', '', '', '', '0', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876953007449.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('3', '0', '家用电器', '2', '', '', '', '74', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876953141962.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('4', '0', '美妆护肤', '3', '', '', '', '', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876953183866.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('5', '0', '母婴用品', '4', '', '', '', '', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876953339106.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('6', '0', '家居建材', '5', '', '', '', '', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587696516707.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('7', '0', '运动户外', '6', '', '', '', '', '1391960819', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876962191492.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('8', '0', '生活服务', '8', '', '', '', '', '1391960819', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('45', '2', '3C数码配件', '3', '', '', '', '', '1392272007', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502173936982.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('49', '2', '相机', '2', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502176421012.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('50', '2', '手机', '1', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876941607014.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('52', '2', '智能穿戴', '4', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502172753933.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('53', '2', '笔记本', '5', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502171466094.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('54', '2', '台式机/一体机', '6', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502170876191.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('56', '3', '冰箱', '0', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876961313639.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('57', '3', '洗衣机', '1', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876961285195.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('58', '3', '缝纫机', '2', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502179762740.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('59', '3', '保健/按摩', '3', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502180231950.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('61', '4', '底妆', '0', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587695667487.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('62', '4', '眼妆', '1', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876956811674.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('63', '4', '精华', '2', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876957033452.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('64', '4', '套盒', '3', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587695705217.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('65', '4', '香水', '4', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876957085650.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('66', '5', '成长裤', '2', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876951441538.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('67', '5', '纸巾/湿巾', '3', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876951563998.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('68', '5', '手部清洁', '4', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876951143896.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('69', '5', '理发器', '5', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876951003389.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('70', '5', '奶粉', '0', '', '', '', '', '1392272205', 'https://upload.ihuoniao.cn//shop/adv/large/2019/02/15/15502196079424.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('71', '6', '商业/办公家具', '0', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('72', '6', '家居饰品', '1', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('73', '6', '装修设计/施工/监理', '2', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('74', '6', '电子/电工', '3', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('75', '6', '床上用品/布艺软饰', '4', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('76', '6', '家装主材', '5', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('77', '7', '运动包/户外包/配件二级', '0', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('78', '7', '运动鞋new', '1', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('79', '7', '户外/登山/野营/旅行用品', '2', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('80', '7', '运动服/休闲服装', '3', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('81', '7', '运动/瑜伽/健身/球迷用品', '4', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('82', '8', '网店/网络服务/软件', '0', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('83', '8', '教育培训', '1', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('84', '8', '超市卡/商场购物卡', '2', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('85', '8', '房产/租房/新房/二手房', '3', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('86', '8', '外卖/外送/订餐服务', '4', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('87', '8', '个性定制/设计服务/DIY', '5', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('88', '8', '购物提货券/蛋糕面包', '6', '', '', '', '', '1392272205', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('92', '0', '文化玩乐', '9', '', '', '', '', '1392272958', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('93', '0', '百货食品', '10', '', '', '', '', '1392272958', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('94', '92', '音乐/影视/明星/音像', '0', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('95', '92', '度假线路/签证送关/旅游服务', '1', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('96', '92', '书籍/杂志/报纸', '2', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('97', '92', '交通票', '3', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('98', '92', '乐器/吉他/钢琴/配件', '4', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('99', '93', '茶/咖啡/冲饮', '0', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('100', '93', '洗护清洁剂/卫生巾/纸/香薰', '1', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('101', '93', '水产肉类/新鲜蔬果/熟食', '2', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('102', '93', '厨房/餐饮用具', '3', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('103', '93', '清洁/卫浴/收纳/整理用具', '4', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('104', '93', '粮油米面/南北干货/调味品', '5', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('105', '93', '成人用品/避孕/计生用品', '6', '', '', '', '', '1392273031', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('133', '0', '图书音像', '11', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('142', '133', '数字音乐', '0', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('143', '142', '通俗流行', '0', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('144', '142', '古典音乐', '1', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('145', '142', '摇滚说唱', '2', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('146', '142', '爵士蓝调', '3', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('147', '142', '乡村民谣', '4', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('148', '142', '有声读物', '5', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('149', '133', '音像', '1', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('150', '149', '音乐', '0', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('151', '149', '影视', '1', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('152', '149', '教育音像', '2', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('153', '149', '游戏', '3', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('154', '133', '文艺', '2', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('155', '133', '人文社科', '3', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('156', '133', '经管励志', '4', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('157', '133', '生活', '5', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('158', '133', '科技', '6', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('159', '133', '少儿', '7', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('160', '133', '教育', '8', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('161', '133', '其它', '9', '', '', '', '', '1434640197', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('162', '0', '汽车用品', '12', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('163', '162', '维修保养', '0', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('164', '163', '润滑油', '0', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('165', '163', '添加剂', '1', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('166', '163', '防冻液', '2', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('167', '163', '滤清器', '3', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('168', '163', '火花塞', '4', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('169', '163', '雨刷', '5', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('170', '163', '车灯', '6', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('171', '163', '后视镜', '7', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('172', '162', '车载电器', '1', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('173', '172', '导航仪', '0', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('174', '172', '安全预警仪', '1', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('175', '172', '行车记录仪', '2', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('176', '172', '倒车雷达', '3', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('177', '172', '蓝牙设备', '4', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('178', '172', '时尚影音', '5', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('179', '172', '净化器', '6', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('180', '172', '电源', '7', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('181', '172', '智能驾驶', '8', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('182', '162', '美容清洗', '2', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('183', '162', '汽车装饰', '3', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('184', '162', '安全自驾', '4', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('185', '162', '线下服务', '5', '', '', '', '', '1434640407', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('186', '0', '营养保健', '13', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('187', '186', '营养健康', '0', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('188', '187', '调节免疫', '0', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('189', '187', '调节三高', '1', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('190', '187', '缓解疲劳', '2', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('191', '187', '美体塑身', '3', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('192', '187', '美容养颜', '4', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('193', '187', '肝肾养护', '5', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('194', '187', '肠胃养护', '6', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('195', '187', '明目益智', '7', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('196', '186', '营养成分', '1', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('197', '196', '维生素/矿物质', '0', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('198', '196', '蛋白质', '1', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('199', '196', '鱼油/磷脂', '2', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('200', '186', '传统滋补', '2', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('201', '186', '成人用品', '3', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('202', '186', '保健器械', '4', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('203', '186', '急救卫生', '5', '', '', '', '', '1434640551', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('204', '0', '电脑办公', '14', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('205', '204', '电脑整机', '0', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('206', '205', '苹果笔记本', '0', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('207', '205', '超极本', '1', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('208', '205', '游戏本', '2', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('209', '205', '平板电脑', '3', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('210', '205', '电脑配件', '4', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('211', '205', '台式机', '5', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('212', '205', '服务器', '6', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('213', '204', '电脑配件', '1', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('214', '213', 'CPU', '0', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('215', '213', '主板', '1', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('216', '213', '显卡', '2', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('217', '213', '硬盘', '3', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('218', '213', 'SSD固态硬盘', '4', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('219', '213', '内存', '5', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('220', '213', '机箱', '6', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('221', '204', '外设产品', '2', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('222', '204', '网络产品', '3', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('223', '204', '办公设备', '4', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('224', '204', '文具耗材', '5', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('225', '204', '服务产品', '6', '', '', '', '', '1434640702', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('226', '0', '酒类生鲜', '15', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('227', '226', '中外名酒', '0', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('228', '227', '白酒', '0', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('229', '227', '葡萄酒', '1', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('230', '227', '洋酒', '2', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('231', '227', '啤酒', '3', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('232', '227', '黄酒/养生酒', '4', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('233', '227', '收藏酒/陈年老酒', '5', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('234', '226', '饮料冲调', '1', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('235', '226', '粮油调味', '2', '', '', '', '1', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('236', '226', '生鲜食品', '3', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('237', '226', '食品礼券', '4', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('238', '226', '进口食品', '5', '', '', '', '1,97', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('239', '226', '休闲食品', '6', '', '', '', '1,97', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('240', '226', '地方特产', '7', '', '', '', '', '1434640837', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('241', '0', '珠宝饰品', '16', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('242', '241', '珠宝', '0', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('243', '242', '黄金', '0', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('244', '242', '珍珠', '1', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('245', '242', '翡翠', '2', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('246', '242', '蜜蜡', '3', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('247', '242', '铂金项链', '4', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('248', '242', '铂金', '5', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('249', '241', '饰品', '1', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('250', '241', '手表', '2', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('251', '241', '眼镜', '3', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('252', '241', '礼品', '4', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('253', '241', '乐器', '5', '', '', '', '', '1434640925', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('259', '3', '咖啡机', '4', '', '', '', '', '1554876620', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876960865148.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('294', '1', '女装', '0', '', '', '', '1,2', '1587693653', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('295', '294', '毛衣', '1', '', '', '', '1,2', '1587693687', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876937573278.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('296', '294', '衬衫', '2', '', '', '', '1,2', '1587693705', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587693764582.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('297', '294', '西服/夹克', '3', '', '', '', '1,2', '1587693705', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876944828933.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('298', '294', '半身裙', '4', '', '', '', '1,2', '1587693705', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587693768770.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('299', '294', '棉服/羽绒服', '5', '', '', '', '1,2', '1587693705', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876937703594.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('300', '294', 'T恤/卫衣', '0', '', '', '', '1,2', '1587693746', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939755922.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('301', '1', '男装', '1', '', '', '', '1,2', '1587693794', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('302', '301', '休闲衬衫', '0', '', '', '', '', '1587693877', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939286638.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('303', '301', '商务衬衫', '1', '', '', '', '', '1587693877', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939248147.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('304', '301', '牛仔裤', '2', '', '', '', '', '1587693877', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939328762.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('305', '301', '格子', '3', '', '', '', '', '1587693877', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939341690.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('306', '301', '运动裤', '4', '', '', '', '', '1587693877', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939362661.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('307', '301', '短袖', '5', '', '', '', '', '1587693892', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876939197781.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('308', '301', '卫衣', '6', '', '', '', '', '1587693913', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587693916605.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('310', '0', '个护清洁', '7', '', '', '', '', '1587694858', '');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('311', '310', '护发素', '0', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876949136666.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('312', '310', '洗发水', '1', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876949174998.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('313', '310', '沐浴露', '2', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876949192580.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('314', '310', '牙膏', '3', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587694923419.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('315', '310', '洗衣凝珠', '4', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876949276553.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('316', '310', '电动牙刷', '5', '', '', '', '', '1587694909', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876949313549.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('317', '5', '童装', '6', '', '', '', '', '1587695042', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876950526037.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('318', '5', '童鞋', '7', '', '', '', '', '1587695042', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876950589152.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('319', '5', '洗发沐浴', '1', '', '', '', '', '1587695069', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876951483592.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('327', '4', '面膜', '5', '', '', '', '', '1587695636', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876957104077.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('328', '4', '眼唇护理', '6', '', '', '', '', '1587695636', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876957137239.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('329', '4', '卸妆/洁面', '7', '', '', '', '', '1587695636', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876957369185.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('330', '4', '防晒', '8', '', '', '', '', '1587695748', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587695753842.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('331', '3', '电热水壶', '5', '', '', '', '', '1587696027', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876961233963.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('332', '2', '耳机', '7', '', '', '', '', '1587696287', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876962977260.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('333', '2', '游戏机', '0', '', '', '', '', '1587696287', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/15876962953889.png');
INSERT INTO `#@__shop_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('334', '2', '音箱', '8', '', '', '', '', '1587696378', 'https://upload.ihuoniao.cn//shop/adv/large/2020/04/24/1587696381921.png');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('53', '1', '0', '颜色', '1', 'c', '1559552383');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('54', '1', '0', '尺码', '2', 'w,c', '1559552421');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('55', '1', '0', '款型', '3', 'c', '1574924950');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('111', '1', '53', '颜色', '0', '', '1583311958');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('112', '1', '53', '颜色', '1', '', '1583311958');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('118', '1', '54', '尺码1', '0', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('119', '1', '54', '尺码2', '1', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('120', '1', '54', '尺码3', '2', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('121', '1', '55', '款型1', '0', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('122', '1', '55', '款型2', '1', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('123', '1', '55', '款型3', '2', '', '1583998182');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('162', '294', '0', '衣服材质', '1', 'w', '1601369714');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('163', '294', '0', '尺码类型', '2', 'c', '1601369714');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('164', '294', '0', 'CCC证书编号', '0', 'w', '1601369714');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('165', '294', '0', '发货地址', '3', '', '1601369714');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('166', '294', '162', '棉麻', '0', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('167', '294', '162', '涤纶', '1', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('168', '294', '163', '均码', '0', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('169', '294', '163', '偏大', '1', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('170', '294', '164', '运动风', '0', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('171', '294', '164', '商务风', '1', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('172', '294', '165', '异地', '0', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('173', '294', '165', '店铺所在地', '1', '', '1601369865');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('174', '295', '0', 'CCC证书编号', '0', '', '1629787686');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('175', '1', '0', 'CCC证书编号', '4', 'w', '1629787795');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('180', '97', '0', '次数', '0', 'w', '1657014592');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('181', '97', '180', '50次', '0', '', '1657014610');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('182', '97', '180', '100次', '1', '', '1657014610');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('190', '333', '0', '定金', '0', 'c', '1685409101');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('191', '333', '190', '需要', '0', '', '1685409101');
INSERT INTO `#@__shop_item` (`id`, `type`, `parentid`, `typename`, `weight`, `flag`, `pubdate`) VALUES ('192', '333', '190', '不需要', '1', '', '1685409101');
DEFAULTSQL;
}
