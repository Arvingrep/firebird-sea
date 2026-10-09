<?php
/**
 * 装修分类管理
 *
 * @version        $Id: renovationType.php 2014-2-28 下午14:49:21 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationType.html";

$tab    = "renovation_type";
checkPurview("renovationType");

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
				adminLog("修改装修分类", $typename);
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

			adminLog($oper."装修分类", $title);
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

    adminLog("导入默认数据", "装修分类_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/renovation/renovationType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
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
			adminLog("添加装修分类", $name);
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
					adminLog("修改装修分类", $model."=>".$id);
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
DELETE FROM `#@__renovation_type`;
ALTER TABLE `#@__renovation_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '招标项目类型', '1', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '家庭装修分类', '3', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '商业装修分类', '4', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '装修风格', '7', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '设计专长', '9', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '装修预算', '10', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '0', '装修模式', '2', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '0', '房屋户型', '8', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '0', '装修阶段', '11', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('14', '1', '住宅公寓', '0', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '1', '办公楼', '1', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '1', '别墅', '2', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '1', '专卖展示店', '3', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '1', '酒店宾馆', '4', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '2', '小户型', '0', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '2', '公寓', '1', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '2', '别墅', '2', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '2', '普通住宅', '3', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '2', '局部装修', '4', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '3', '美容院', '0', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '3', '酒店', '1', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '3', 'ktv', '2', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '3', '酒吧', '3', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '3', '美发', '4', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '3', '写字楼', '5', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '3', '办公室', '6', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '3', '宾馆', '7', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '3', '会所', '8', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '3', '咖啡厅', '9', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '3', '商铺', '10', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '4', '简约', '0', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '4', '现代', '1', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('37', '4', '中式', '2', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('38', '4', '欧式', '3', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('39', '4', '美式', '4', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('40', '4', '田园', '5', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('41', '4', '古典', '6', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('42', '4', '混搭', '7', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('43', '4', '地中海', '8', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('44', '5', '住宅公寓', '0', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('45', '5', '写字楼', '1', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('46', '5', '别墅', '2', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('47', '5', '专卖展示店', '3', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('48', '5', '酒店宾馆', '4', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('49', '5', '餐饮酒吧', '5', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('50', '5', '歌舞迪厅', '6', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('51', '5', '其他', '7', '1393572463');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('511', '6', '3万以下', '0', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('512', '6', '3-5万', '1', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('513', '6', ' 5-8万', '2', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('514', '6', '8-12万', '3', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('515', '6', '12-18万', '4', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('516', '7', '全包', '0', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('517', '7', '半包', '1', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('518', '8', '二居', '0', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('519', '8', '三居', '1', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('520', '8', '大户型', '2', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('521', '8', '别墅', '3', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('522', '8', '复式楼', '4', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('523', '8', '小户型', '5', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('524', '8', '跃层', '6', '1393860403');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('533', '0', '装修空间', '5', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('534', '533', '客厅', '0', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('535', '533', '卧室', '1', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('536', '533', '餐厅', '2', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('537', '533', '厨房', '3', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('538', '533', '卫生间', '4', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('539', '533', '阳台', '5', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('540', '533', '书房', '6', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('541', '533', '玄关', '7', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('542', '533', '儿童房', '8', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('543', '533', '衣帽间', '9', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('544', '533', '花园', '10', '1422718455');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('545', '0', '局部位置', '6', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('546', '545', '背景墙', '0', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('547', '545', '吊顶', '1', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('548', '545', '隔断', '2', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('549', '545', '窗帘', '3', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('550', '545', '飘窗', '4', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('551', '545', '榻榻米', '5', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('552', '545', '橱柜', '6', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('553', '545', '博古架', '7', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('554', '545', '阁楼', '8', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('555', '545', '隐形门', '9', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('556', '545', '吧台', '10', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('557', '545', '酒柜', '11', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('558', '545', '鞋柜', '12', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('559', '545', '衣柜', '13', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('560', '545', '窗户', '14', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('561', '545', '相片墙', '15', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('562', '545', '楼梯', '16', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('563', '545', '其它', '17', '1422718682');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('564', '4', '东南亚', '9', '1422774448');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('565', '4', '日式', '10', '1422774448');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('566', '4', '宜家', '11', '1422774448');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('567', '4', '北欧', '12', '1422774448');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('568', '4', '简欧', '13', '1422774448');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('569', '8', '80㎡', '7', '1422774513');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('570', '3', '服装店', '11', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('571', '3', '厂房', '12', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('572', '3', '医院', '13', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('573', '3', '图书馆', '14', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('574', '3', '学校', '15', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('575', '3', '广场', '16', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('576', '3', '公园', '17', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('577', '3', '会议室', '18', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('578', '3', '体育馆', '19', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('579', '3', '其它', '20', '1422774662');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('580', '8', '100㎡', '8', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('581', '8', '90㎡', '9', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('582', '8', '120㎡', '10', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('583', '8', '110㎡', '11', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('584', '8', '70㎡', '12', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('585', '8', '单身公寓', '13', '1422774779');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('586', '7', '清包', '2', '1422775018');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('587', '7', '平米包', '3', '1422775018');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('588', '6', '18-30万', '5', '1422775092');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('589', '6', '30-100万', '6', '1422775092');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('590', '6', '100万以上', '7', '1422775092');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('591', '0', '工种类型', '0', '0');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('595', '591', '木工', '0', '1595992085');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('596', '591', '电工', '1', '1595992085');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('597', '591', '普工', '2', '1595992085');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('599', '9', '准备开工', '0', '1596168036');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('600', '9', '水电阶段', '1', '1596168036');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('601', '9', '泥木阶段', '2', '1596168036');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('602', '9', '油漆阶段', '3', '1596168036');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('603', '9', '验收完成', '4', '1596168036');
INSERT INTO `#@__renovation_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('604', '591', '瓦工', '3', '1596502429');
DEFAULTSQL;
}
