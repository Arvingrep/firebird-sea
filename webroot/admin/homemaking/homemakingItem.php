<?php
/**
 * 家政服务字段管理
 *
 * @version        $Id: homemakingItem.php 2019-04-01 下午14:03:15 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingItem.html";

$tab    = "homemakingitem";
checkPurview("homemakingItem");

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
				adminLog("修改家政服务字段", $typename);
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

			adminLog($oper."家政服务字段", $title);
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

    adminLog("导入默认数据", "家政字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/homemaking/homemakingItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
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
			adminLog("添加家政服务字段", $model."=>".$name);
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
					adminLog("修改家政服务字段", $model."=>".$id);
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
DELETE FROM `#@__homemakingitem`;
ALTER TABLE `#@__homemakingitem` AUTO_INCREMENT = 1;
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('1', '0', '学历', '0', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('2', '0', '民族', '1', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('3', '0', '从业经验', '2', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('4', '0', '薪资范围', '3', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('5', '0', '工作类型', '4', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('6', '0', '服务内容', '5', '0');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('7', '1', '高中及以下', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('8', '1', '中专/职高', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('9', '1', '大专', '2', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('10', '1', '本科', '3', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('11', '1', '硕士', '4', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('12', '1', 'MBA', '5', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('13', '1', '博士', '6', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('14', '2', '汉族', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('15', '2', '壮族', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('16', '2', '侗族', '2', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('17', '2', '土家族', '3', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('18', '2', '塔吉克族', '4', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('19', '2', '傣族', '5', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('20', '2', '苗族', '6', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('21', '3', '一年以下', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('22', '3', '1-2年', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('23', '3', '3-5年', '2', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('24', '3', '6-7年', '3', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('25', '3', '8-10年及以上', '4', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('26', '4', '面议', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('27', '4', '1000以下', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('28', '4', '1000-3000', '2', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('29', '4', '4000-6000', '3', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('30', '5', '钟点工', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('31', '5', '住家型', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('32', '6', '洗衣', '0', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('33', '6', '打扫卫生', '1', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('34', '6', '照顾小孩', '2', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('35', '6', '照顾老人', '3', '1555555386');
INSERT INTO `#@__homemakingitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`) VALUES ('36', '6', '照顾宠物', '4', '1555555386');
DEFAULTSQL;
}
