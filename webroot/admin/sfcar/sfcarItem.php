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
$tpl  = dirname(__FILE__)."/../templates/sfcar";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sfcarItem.html";

$tab    = "sfcaritem";
checkPurview("sfcarItem");

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

    adminLog("导入默认数据", "顺风车字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/sfcar/sfcarItem.js'
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
DELETE FROM `#@__sfcaritem`;
ALTER TABLE `#@__sfcaritem` AUTO_INCREMENT = 1;
INSERT INTO `#@__sfcaritem` VALUES ('1', '0', '我要用车(载人)', '50', '0', '0');
INSERT INTO `#@__sfcaritem` VALUES ('2', '0', '我要用车(载货)', '50', '0', '0');
INSERT INTO `#@__sfcaritem` VALUES ('3', '0', '我是车主(载人)', '50', '0', '0');
INSERT INTO `#@__sfcaritem` VALUES ('4', '0', '我是车主(载货)', '50', '0', '0');
INSERT INTO `#@__sfcaritem` VALUES ('5', '0', '车型', '50', '0', '0');
INSERT INTO `#@__sfcaritem` VALUES ('6', '1', '需后备箱', '0', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('7', '1', '有小孩', '1', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('8', '1', '安全第一', '2', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('9', '2', '货物代运', '0', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('10', '2', '上门接货', '1', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('11', '2', '准时到达', '2', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('12', '3', '干净', '0', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('13', '3', '消毒', '1', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('14', '3', '限男性', '2', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('15', '4', '准时发车', '0', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('16', '4', '上门接货', '1', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('35', '3', '上门接送', '11', '1591062600', '0');
INSERT INTO `#@__sfcaritem` VALUES ('18', '5', '小型面包', '0', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('19', '5', '中型面包', '1', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('20', '5', '依维柯', '2', '1590563776', '0');
INSERT INTO `#@__sfcaritem` VALUES ('21', '1', '需走高速', '3', '1590570328', '0');
INSERT INTO `#@__sfcaritem` VALUES ('22', '1', '分摊路费', '4', '1590570328', '0');
INSERT INTO `#@__sfcaritem` VALUES ('39', '1', '赶时间', '6', '1591062702', '0');
INSERT INTO `#@__sfcaritem` VALUES ('34', '3', '准时发车', '9', '1591062600', '0');
INSERT INTO `#@__sfcaritem` VALUES ('36', '3', '可包车', '12', '1591062600', '0');
INSERT INTO `#@__sfcaritem` VALUES ('37', '3', '走高速', '13', '1591062600', '0');
INSERT INTO `#@__sfcaritem` VALUES ('38', '1', '多件行李', '5', '1591062676', '0');
INSERT INTO `#@__sfcaritem` VALUES ('40', '1', '携带宠物', '7', '1591062702', '0');
INSERT INTO `#@__sfcaritem` VALUES ('29', '3', '限女性', '3', '1591062329', '0');
INSERT INTO `#@__sfcaritem` VALUES ('30', '3', '能开车', '4', '1591062329', '0');
INSERT INTO `#@__sfcaritem` VALUES ('31', '3', '男女不限', '5', '1591062329', '0');
INSERT INTO `#@__sfcaritem` VALUES ('32', '3', '禁止宠物', '7', '1591062329', '0');
INSERT INTO `#@__sfcaritem` VALUES ('33', '3', '禁止吸烟', '8', '1591062329', '0');
INSERT INTO `#@__sfcaritem` VALUES ('41', '5', '中型平板', '3', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('42', '5', '中型厢货', '4', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('43', '5', '5米2', '5', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('44', '5', '6米8', '6', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('45', '5', '7米6', '7', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('46', '5', '9米6', '8', '1591063094', '0');
INSERT INTO `#@__sfcaritem` VALUES ('47', '1', '上门接送', '8', '1591063380', '0');
INSERT INTO `#@__sfcaritem` VALUES ('48', '1', '准时到达', '9', '1591063380', '0');
INSERT INTO `#@__sfcaritem` VALUES ('49', '1', '包车', '10', '1591063380', '0');
INSERT INTO `#@__sfcaritem` VALUES ('50', '2', '长期用车', '3', '1591063417', '0');
INSERT INTO `#@__sfcaritem` VALUES ('51', '2', '搬家', '4', '1591063417', '0');
INSERT INTO `#@__sfcaritem` VALUES ('52', '2', '包车', '5', '1591063417', '0');
INSERT INTO `#@__sfcaritem` VALUES ('53', '3', '准时到达', '10', '1591063453', '0');
INSERT INTO `#@__sfcaritem` VALUES ('54', '3', '可带宠物', '6', '1591063482', '0');
INSERT INTO `#@__sfcaritem` VALUES ('55', '3', '天天发车', '14', '1591063482', '0');
INSERT INTO `#@__sfcaritem` VALUES ('56', '4', '可包车', '2', '1591063537', '0');
INSERT INTO `#@__sfcaritem` VALUES ('57', '4', '准时到达', '3', '1591063537', '0');
INSERT INTO `#@__sfcaritem` VALUES ('58', '4', '走高速', '4', '1591063537', '0');
INSERT INTO `#@__sfcaritem` VALUES ('59', '4', '免费搬货', '5', '1591063537', '0');
INSERT INTO `#@__sfcaritem` VALUES ('60', '4', '天天发车', '6', '1591063537', '0');
DEFAULTSQL;
}
