<?php
/**
 * 养老频道字段管理
 *
 * @version        $Id: pensionItem.php 2019-7-29 下午13:41:15 $
 * @package        HuoNiao.pension
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/pension";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pensionItem.html";

$tab    = "pension_item";
checkPurview("pensionItem");

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
				adminLog("修改养老字段", $typename);
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

			adminLog($oper."删除养老字段", $title);
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

    adminLog("导入默认数据", "养老字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/pension/pensionItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/pension";  //设置编译目录
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
			adminLog("添加养老字段", $model."=>".$name);
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
					adminLog("修改养老字段", $model."=>".$id);
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
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id AND `hide` = 0 ORDER BY `weight`");
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
DELETE FROM `#@__pension_item`;
ALTER TABLE `#@__pension_item` AUTO_INCREMENT = 1;
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('1', '0', '能力等级', '50', '0', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('2', '0', '机构类型', '50', '0', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('3', '0', '房间类型', '50', '0', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('4', '0', '特色服务', '50', '0', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('5', '0', '服务内容', '50', '0', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('9', '1', '能力完好', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('10', '1', '轻度失能', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('11', '1', '中度失能', '2', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('12', '1', '重度失能', '3', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('13', '1', '失智', '4', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('14', '2', '综合性养老机构', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('15', '2', '日间照料中心', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('16', '2', '养老社区/CCRC', '2', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('17', '2', '老年公寓', '3', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('18', '2', '医养结合', '4', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('19', '2', '护理院', '5', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('20', '3', '一人间', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('21', '3', '二人间', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('22', '3', '三人间', '2', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('23', '3', '多人间', '3', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('24', '3', '包间', '4', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('25', '3', '套房', '5', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('26', '4', '提供点餐服务', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('27', '4', '专车接送', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('36', '7', '老年社区/CCRC', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('37', '7', '疗养院', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('38', '7', '老年公寓', '2', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('39', '7', '养老酒店', '3', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('40', '7', '养老小镇', '4', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('41', '7', '休闲娱乐', '5', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('42', '8', '生活照料', '0', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('43', '8', '专业护理', '1', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('44', '8', '康复服务', '2', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('45', '8', '认知症照护', '3', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('46', '8', '精神慰藉', '4', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('47', '8', '健康管理', '5', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('48', '8', '医疗服务', '6', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('49', '8', '特殊疾病患者', '7', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('50', '8', '临终关怀', '8', '1564395439', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('52', '5', '更换穿洗衣物', '0', '1583284306', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('53', '5', '卫生清洁', '1', '1583284306', '0');
INSERT INTO `#@__pension_item` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `hide`) VALUES ('54', '5', '营养膳食', '2', '1583284306', '0');
DEFAULTSQL;
}
