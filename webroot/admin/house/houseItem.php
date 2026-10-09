<?php
/**
 * 房产频道字段管理
 *
 * @version        $Id: houseItem.php 2014-1-7 下午23:03:15 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseItem.html";

$tab    = "houseitem";
checkPurview("houseItem");

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;
	
//修改分类
}else if($dopost == "updateType"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		
		if(!empty($results)){
			
			if($results[0]['parentid'] == 0) die('{"state": 200, "info": '.json_encode('顶级信息不可以修改！').'}');
			
			if($typename == "") die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
			if($type == "single"){
				
				if($results[0]['typename'] != $typename){
					//保存到主表
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$typename' WHERE `id` = ".$id);
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
				$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}
			
			if($results != "ok"){
				echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
				exit();
			}else{
				// 更新缓存
				clearCache("house_item", $id);
				clearCache("house_item_all", $id);

				adminLog("修改房产字段", $typename);
				echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
				exit();
			}
			
		}else{
			echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//删除分类
}else if($dopost == "del"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		
		if(!empty($results)){

			$title = $results[0]['typename'];
			$oper = "删除";

			//清空子级
			if($results[0]['parentid'] == 0) {
				$oper = "清空";

				$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `parentid` = ".$id);
				$dsql->dsqlOper($archives, "update");

			}else{
					
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
				
			}

			// 清除缓存
			clearCache("house_item", $id);
			clearCache("house_item_all", $id);

			adminLog($oper."房产字段", $title);
			echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
			die;

		}else{
			echo '{"state": 200, "info": '.json_encode('要删除的信息不存在或已删除！').'}';
			die;
		}
	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);
		
		$json = objtoarr($json);
		$json = itemTypeAjax($json, 0, $tab);

		// 清除缓存
		clearTypeCache();

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

    adminLog("导入默认数据", "房产字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/house/houseItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//更新分类
function itemTypeAjax($json, $pid = 0, $tab){
	global $dsql;
	for($i = 0; $i < count($json); $i++){
		$id = $json[$i]["id"];
		$name = $json[$i]["name"];
		
		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`parentid`, `typename`, `weight`, `pubdate`) VALUES ('$pid', '$name', '$i', '".GetMkTime(time())."')");
			$id = $dsql->dsqlOper($archives, "lastid");
			adminLog("添加房产字段", $model."=>".$name);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weight`, `parentid` FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				if($results[0]["parentid"] != 0){
					//验证分类名
					if($results[0]["typename"] != $name){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typename` = '$name' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					
					//验证排序
					if($results[0]["weight"] != $i){
						$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
						$results = $dsql->dsqlOper($archives, "update");
					}
					adminLog("修改房产字段", $model."=>".$id);
				}
			}
		}
		if(is_array($json[$i]["lower"])){
			itemTypeAjax($json[$i]["lower"], $id, $tab);
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}

//获取分类列表
function getItemTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){//如果有子类 
		foreach($results as $key => $value){
			$results[$key]["lower"] = getItemTypeList($value['id'], $tab);
		}
		return $results; 
	}else{
		return "";
	}
}

function clearTypeCache(){
    for($i = 1; $i < 400; $i++){
        clearCache("house_item", $i);
        clearCache("house_item_all", $i);
    }
}


/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__houseitem`;
ALTER TABLE `#@__houseitem` AUTO_INCREMENT = 1;
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '房屋类型', '0', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '装修情况', '1', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '建筑类型', '2', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '房屋朝向', '3', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '付款方式', '4', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '房屋配套设施', '5', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '0', '出租间', '6', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '0', '写字楼类型', '7', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '0', '商铺类型', '8', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '0', '厂房类型', '9', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '1', '住宅', '0', '1389108088');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '1', '别墅', '2', '1389108088');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('13', '1', '商住', '3', '1389108088');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('14', '1', '其它', '9', '1389108088');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '2', '毛坯', '0', '1389170928');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '2', '普通装修', '1', '1389170928');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '2', '精装修', '2', '1389170928');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '2', '豪华装修', '3', '1389170928');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '2', '其它', '4', '1389170928');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '3', '低层', '0', '1389193857');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '3', '高层', '1', '1389193857');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '3', '小高层', '2', '1389193857');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '3', '联排别墅', '3', '1389193857');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '3', '公寓', '4', '1389193857');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '4', '东', '0', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '4', '南', '1', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '4', '西', '2', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '4', '北', '3', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '4', '南北', '4', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '4', '东西', '5', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '4', '东南', '6', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '4', '西南', '7', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '4', '东北', '8', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '4', '西北', '9', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '4', '不知道朝向', '10', '1389663249');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '1', '酒店式公寓', '6', '1389717708');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '5', '付3押1', '0', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '5', '付1押1', '1', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '5', '付2押1', '2', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '5', '付1押2', '3', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('41', '5', '年付不押', '4', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '5', '半年付不押', '5', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('43', '5', '面议', '6', '1389717951');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '6', '床', '0', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '6', '电视', '1', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '6', '空调', '2', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '6', '冰箱', '3', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '6', '洗衣机', '4', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '6', '热水器', '5', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '6', '宽带', '6', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '6', '可做饭', '7', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('52', '6', '独立卫生间', '8', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('53', '6', '阳台', '9', '1389718021');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('54', '1', '公寓', '1', '1389881220');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('55', '7', '主卧', '0', '1389881617');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('56', '7', '次卧', '1', '1389881617');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('57', '7', '单间', '2', '1389881617');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('58', '7', '隔断间', '3', '1389881617');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('59', '7', '床位', '4', '1389881617');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('60', '1', '商住两用', '5', '1389882085');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('61', '1', '平房', '4', '1389882085');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('63', '8', '写字楼', '0', '1389925162');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('64', '8', '商务中心', '1', '1389925162');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('65', '8', '商住公寓', '2', '1389925168');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('66', '9', '商业街卖场', '0', '1389925201');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('67', '9', '写字楼配套', '1', '1389925201');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('68', '9', '住宅底商', '2', '1389925201');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('69', '9', '摊位柜台', '3', '1389925201');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('70', '9', '其它', '4', '1389925201');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('71', '10', '仓库', '0', '1389925242');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('72', '10', '车位', '1', '1389925242');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('73', '10', '土地', '2', '1389925242');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('74', '10', '厂房', '3', '1389925242');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('75', '10', '其他', '4', '1389925242');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('76', '0', '小区标签', '10', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('77', '76', '超人气小区', '0', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('78', '76', '最舒适小区', '1', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('79', '76', '交通便利小区', '2', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('80', '76', '商业繁华小区', '3', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('81', '76', '高端小区', '4', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('82', '76', '大型小区', '5', '1421859749');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('83', '0', '商铺配套设置', '11', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('84', '83', '客梯', '0', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('85', '83', '货梯', '1', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('86', '83', '暖气', '2', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('87', '83', '空调', '3', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('88', '83', '停车位', '4', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('89', '83', '水', '5', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('90', '83', '燃气', '6', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('91', '83', '网络', '7', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('92', '83', '扶梯', '8', '1421994768');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('93', '0', '写字楼特色', '12', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('94', '93', '无中介费', '0', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('95', '93', '可注册', '1', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('96', '93', '高回报率', '2', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('97', '93', '交通便利', '3', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('98', '93', '名企入驻', '4', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('99', '93', '中心商务区', '5', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('100', '93', '金鸡湖畔', '6', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('101', '93', '独墅湖畔', '7', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('102', '93', '地铁沿线', '9', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('103', '93', '创业首选', '8', '1422416470');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('104', '1', '商铺', '7', '1543995209');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('105', '1', '写字楼', '8', '1543995209');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('106', '10', '顶楼停机坪', '5', '1597892255');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('107', '0', '学校类型', '50', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('108', '107', '幼儿园', '0', '1598422111');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('109', '107', '小学', '1', '1598422111');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('110', '107', '初中', '2', '1598422111');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('111', '107', '高中', '3', '1598490183');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('112', '107', '大学', '4', '1598490183');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('113', '0', '写字楼配套设施', '50', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('114', '113', '员工餐厅', '0', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('115', '113', '扶梯', '1', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('116', '113', '办公家具', '2', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('117', '113', '集中供暖', '3', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('118', '113', '中央空调', '4', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('119', '113', '电', '5', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('120', '113', '货梯', '6', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('121', '113', '客梯', '7', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('122', '113', '电话', '8', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('123', '113', '宽带', '9', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('124', '113', '有线电视', '10', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('125', '113', '水', '11', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('126', '113', '监控', '12', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('127', '113', '车位', '13', '1673345200');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('666', '0', '楼盘特色', '50', '0');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('667', '666', '优惠楼盘', '0', '1711076766');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('668', '666', '品牌房企', '1', '1711076766');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('669', '666', '地铁沿线', '2', '1711076766');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('670', '666', '小户型', '3', '1711076766');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('671', '666', '现房', '4', '1711076766');
INSERT INTO `#@__houseitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('672', '666', '车位充足', '5', '1711076766');

DEFAULTSQL;
}
