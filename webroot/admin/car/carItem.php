<?php
/**
 * 汽车频道字段管理
 *
 * @version        $Id: carItem.php 2019-03-28 下午14:03:15 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "carItem.html";

$tab    = "caritem";
checkPurview("carItem");

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
				adminLog("修改汽车字段", $typename);
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

			adminLog($oper."汽车字段", $title);
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

    adminLog("导入默认数据", "汽车字段_caritem");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/car/carItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
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
			adminLog("添加汽车字段", $model."=>".$name);
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
					adminLog("修改汽车字段", $model."=>".$id);
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


/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__caritem`;
ALTER TABLE `#@__caritem` AUTO_INCREMENT = 1;
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '变速箱', '0', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '排放标准', '1', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '进气形式', '2', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '燃料类型', '3', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '燃油标号', '4', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '供油方式', '5', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '0', '驱动方式', '6', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '0', '助力类型', '7', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '0', '前悬挂类型', '8', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '0', '后悬挂类型', '9', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '0', '前制动器类型', '10', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '0', '后制动类型', '11', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('13', '0', '驻车制动类型', '12', '0');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '1', '手动', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '1', '自动', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '2', '国II', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '2', '国III', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '2', '国IV', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '2', '国V', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '3', '涡轮增压', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '3', '机械增压', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '4', '汽油', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '4', '柴油', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '4', '混合油', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '4', '天然气', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '4', '太阳能', '4', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '4', '电', '5', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '5', '92号', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '5', '93号', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '5', '95号', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '5', '97号', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '6', '化油器', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '6', '单点电喷', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '6', '多点电喷', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '6', '直喷', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '7', '前置后驱', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '7', '前置前驱', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '7', '后置后驱', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '7', '中置后驱', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('41', '7', '四轮驱动', '4', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '8', '电动助力', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('43', '8', '电子液压助力', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '8', '机械辅助', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '8', '机械辅助助力', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '9', '麦弗逊悬架', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '9', '双叉臂独立悬架', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '9', '多连杆式独立悬架', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '9', '双球节弹簧减震支柱悬架', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '10', '非独立悬挂系统', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '10', '独立悬挂系统', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('52', '10', '横臂式悬挂系统', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('53', '10', '多连杆式悬挂系统', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('54', '10', '纵臂式悬挂系统', '4', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('55', '10', '烛式悬挂系统', '5', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('56', '10', '麦弗逊式悬挂系统', '6', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('57', '10', '主动悬挂系统', '7', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('58', '11', '盘式', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('59', '11', '鼓式', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('60', '11', '通风盘', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('61', '11', '陶瓷通风盘式', '3', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('62', '12', '盘式制动器', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('63', '12', '鼓式制动器', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('64', '13', '机械脚刹', '0', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('65', '13', '机械手刹', '1', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('66', '13', '电子手刹', '2', '1553764722');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('67', '7', '前轮驱动', '0', '1596179521');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('68', '13', '电子驻车', '0', '1596179538');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('69', '3', '自然吸气', '0', '1596180144');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('70', '13', '手拉式', '0', '1596180144');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('71', '7', '分时四驱', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('72', '7', '后轮驱动', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('73', '10', '拖拽臂式半独立悬架', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('74', '1', '手自一体', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('75', '10', '麦弗逊独立悬架', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('76', '7', '全时四驱', '0', '1596180203');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('77', '10', '扭力梁式非独立悬架', '0', '1596180254');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('79', '7', '适时四驱', '0', '1596180257');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('80', '10', '双叉臂式独立悬架', '0', '1596180257');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('81', '13', '脚踩式', '0', '1596180257');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('82', '1', 'CVT无级变速', '0', '1596180261');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('83', '1', '双离合', '0', '1596180282');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('84', '3', '双增压', '0', '1596180286');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('85', '1', '机械自动', '0', '1596180292');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('86', '10', '整体桥式非独立悬架', '0', '1596180792');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('87', '10', '叶片式弹簧', '0', '1596180945');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('88', '1', '单速变速箱', '0', '1596180981');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('89', '1', 'E-CVT无级变速', '0', '1596181064');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('90', '10', '霍奇基斯悬架', '0', '1596181549');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('91', '10', '扭力梁式后悬架', '0', '1596181567');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('92', '7', '4x2', '0', '1596181855');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('93', '10', '钢板弹簧非独立', '0', '1596182481');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('94', '7', '14x2', '0', '1596182632');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('95', '7', '12x2', '0', '1596182632');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('96', '10', '螺旋簧前置斜定位式单臂独立悬架', '0', '1596182808');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('97', '10', '钢板弹簧非独立悬架', '0', '1596182961');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('98', '10', '纵置板簧', '0', '1596183059');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('99', '10', '后多片簧', '0', '1596183086');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('100', '10', '后钢板弹簧非独立悬架', '0', '1596183207');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('101', '10', '变截面钢板弹簧', '0', '1596183398');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('102', '10', '非独立五片钢板弹簧', '0', '1596183450');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('103', '10', '纵置板簧式非独立悬挂', '0', '1596183500');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('104', '10', '双横臂式独立悬架', '0', '1596183509');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('105', '10', '纵置钢板弹簧', '0', '1596183542');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('106', '10', '钢板弹簧式非独立悬架', '0', '1596183639');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('107', '10', '钢板弹簧', '0', '1596183639');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('108', '10', '少片簧', '0', '1596183650');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('109', '10', '多片簧', '0', '1596183650');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('110', '10', '单斜臂式螺簧独立悬架', '0', '1596184079');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('111', '10', '霍奇基斯后悬', '0', '1596184115');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('112', '10', '空气悬架', '0', '1596184119');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('113', '10', '非独立悬架', '0', '1596184119');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('114', '10', '变截面板簧非独立悬挂', '0', '1596184123');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('115', '10', '纵置板簧(5片)', '0', '1596184123');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('116', '10', '纵置板簧（三片）', '0', '1596184127');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('117', '10', '非独立悬挂(4片)', '0', '1596184127');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('118', '10', '变截面纵置板簧(3片)', '0', '1596184127');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('119', '10', '非独立悬挂（3片）', '0', '1596184127');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('120', '10', '后少片簧', '0', '1596184131');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('121', '10', '五片钢板弹簧非独立悬架', '0', '1596184198');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('122', '10', '麦弗逊式独立悬架', '0', '1596184198');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('123', '10', '变截面钢板弹簧非独立悬架', '0', '1596184248');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('124', '10', '后10片簧', '0', '1596184303');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('125', '10', '单臂式后独立悬架', '0', '1596184307');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('126', '1', '序列式', '0', '1596184454');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('127', '10', '后非独悬架', '0', '1596184525');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('128', '10', '后非独立悬架2片簧', '0', '1596184562');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('129', '10', '后非独立悬架3片簧', '0', '1596184562');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('130', '10', '非独立悬架3片簧', '0', '1596184562');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('131', '10', '非独立悬架2片簧', '0', '1596184562');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('132', '10', '少片簧/空气悬架（选装）', '0', '1596184569');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('133', '7', '电动四驱', '0', '1596184980');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('134', '10', '后变截面钢板弹簧非独立悬挂', '0', '1596185098');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('135', '10', '变截面板簧非独立悬挂（3片）', '0', '1596185141');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('136', '10', '后非独立悬架', '0', '1596185296');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('137', '10', '螺旋簧独立悬架', '0', '1596185388');
INSERT INTO `#@__caritem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('138', '10', '多连杆', '0', '1596185567');
DEFAULTSQL;
}
