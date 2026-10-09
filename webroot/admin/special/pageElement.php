<?php
/**
 * 页面元素
 *
 * @version        $Id: pageElement.php 2014-4-28 下午18:17:21 $
 * @package        HuoNiao.Special
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("pageElement");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/special";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "pageElement.html";

$tab = "pageelement";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	if($sType != ""){
		$where .= " AND `sort` = '$sType'";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `sort`, `title`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$sortName = "组件";
			if($value["sort"] == "apps"){
				$sortName = "应用";
			}

			$list[$key]["sort"] = $value["sort"];
			$list[$key]["sortName"] = $sortName;
			$list[$key]["title"] = $value["title"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "pageElement": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("specialDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除风格
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_theme` WHERE `pid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除页面元素", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("specialEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新页面元素状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
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

    adminLog("导入默认数据", "专题页面元素");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'admin/special/pageElement.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/special";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__pageelement`;
ALTER TABLE `#@__pageelement` AUTO_INCREMENT = 1;
DELETE FROM `#@__pageelement_theme`;
ALTER TABLE `#@__pageelement_theme` AUTO_INCREMENT = 1;
INSERT INTO `#@__pageelement` VALUES ('3', 'widgets', '容器', 'area', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"margin\": {\r\n            \"top\": \"\",\r\n            \"right\": \"auto\",\r\n            \"bottom\": \"\",\r\n            \"left\": \"auto\"\r\n        },\r\n        \"padding\": {\r\n            \"top\": \"10px\",\r\n            \"right\": \"10px\",\r\n            \"bottom\": \"10px\",\r\n            \"left\": \"10px\"\r\n        }\r\n    }\r\n}', '', '1', '1398847513');
INSERT INTO `#@__pageelement` VALUES ('4', 'widgets', '标题容器', 'titlebox', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"margin\": {\r\n            \"top\": \"\",\r\n            \"right\": \"auto\",\r\n            \"bottom\": \"\",\r\n            \"left\": \"auto\"\r\n        }\r\n    }\r\n},\r\n\"heading\": {\r\n    \"name\": \"标题\",\r\n    \"type\": \"heading\",\r\n    \"params\": {\r\n        \"title\": \"标题\"\r\n    }\r\n},\r\n\"items\": [\r\n    {\r\n        \"name\": \"容器\",\r\n        \"type\": \"area\",\r\n        \"tagName\": \"\",\r\n        \"theme\": {\r\n            \"style\": {\r\n                \"margin\": {\r\n                    \"top\": \"5px\",\r\n                    \"right\": \"5px\",\r\n                    \"bottom\": \"5px\",\r\n                    \"left\": \"5px\"\r\n                }\r\n            }\r\n        }\r\n    }\r\n]', 'heading', '1', '1398847556');
INSERT INTO `#@__pageelement` VALUES ('5', 'widgets', '分栏', 'columnbox', '0', '1', '\"params\": {\r\n    \"columnSpacing\": \"10px\"\r\n},\r\n\"theme\": {\r\n    \"style\": {\r\n        \"margin\": {\r\n            \"top\": \"\",\r\n            \"right\": \"auto\",\r\n            \"bottom\": \"\",\r\n            \"left\": \"auto\"\r\n        },\r\n        \"padding\": {\r\n            \"top\": \"10px\",\r\n            \"right\": \"10px\",\r\n            \"bottom\": \"10px\",\r\n            \"left\": \"10px\"\r\n        }\r\n    }\r\n}', '', '1', '1398848084');
INSERT INTO `#@__pageelement` VALUES ('6', 'widgets', '标签页', 'tabbox', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"margin\": {\r\n            \"top\": \"\",\r\n            \"right\": \"auto\",\r\n            \"bottom\": \"\",\r\n            \"left\": \"auto\"\r\n        }\r\n    }\r\n}', 'tabbox', '1', '1398848105');
INSERT INTO `#@__pageelement` VALUES ('7', 'widgets', '分割线', 'divider', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"margin\": {\r\n            \"top\": \"\",\r\n            \"right\": \"auto\",\r\n            \"bottom\": \"\",\r\n            \"left\": \"auto\"\r\n        },\r\n        \"padding\": {\r\n            \"top\": \"10px\",\r\n            \"right\": \"0\",\r\n            \"bottom\": \"10px\",\r\n            \"left\": \"0\"\r\n        }\r\n    }\r\n}', '', '1', '1398848131');
INSERT INTO `#@__pageelement` VALUES ('8', 'widgets', '文字', 'text', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"line-height\": \"1.6\"\r\n    }\r\n}', '', '1', '1398848150');
INSERT INTO `#@__pageelement` VALUES ('9', 'widgets', '图片', 'image', '0', '1', '\"theme\": {\r\n    \"style\": {\r\n        \"font-size\": \"12px\",\r\n        \"line-height\": \"24px\"\r\n    }\r\n}', '', '1', '1398848914');
INSERT INTO `#@__pageelement` VALUES ('10', 'widgets', '按钮', 'button', '0', '1', '', 'button', '1', '1398852709');
INSERT INTO `#@__pageelement` VALUES ('11', 'widgets', 'Flash', 'Flash', '0', '1', '', '', '1', '1398852782');
INSERT INTO `#@__pageelement` VALUES ('12', 'widgets', '视频', 'video', '0', '1', '', '', '1', '1398852789');
INSERT INTO `#@__pageelement` VALUES ('13', 'widgets', '音频', 'audio', '0', '1', '', 'audio', '1', '1398852815');
INSERT INTO `#@__pageelement` VALUES ('14', 'widgets', '导航菜单', 'menu', '0', '1', '', 'menu', '1', '1398853445');
INSERT INTO `#@__pageelement` VALUES ('15', 'widgets', '幻灯片', 'slider', '0', '1', '', 'slider', '1', '1398853509');
INSERT INTO `#@__pageelement` VALUES ('16', 'widgets', '图文', 'image-text', '0', '1', '', '', '1', '1398853521');
INSERT INTO `#@__pageelement` VALUES ('17', 'widgets', '图组', 'gallery', '0', '1', '', '', '1', '1398853528');
INSERT INTO `#@__pageelement` VALUES ('18', 'widgets', '地图', 'map', '0', '1', '', '', '1', '1398853535');
INSERT INTO `#@__pageelement` VALUES ('19', 'widgets', '框架', 'iframe', '0', '1', '', '', '1', '1398853541');
INSERT INTO `#@__pageelement` VALUES ('20', 'widgets', 'HTML', 'html', '0', '1', '', '', '1', '1398853548');
INSERT INTO `#@__pageelement` VALUES ('21', 'widgets', '评论', 'common', '0', '1', '', '', '0', '1398853555');
INSERT INTO `#@__pageelement` VALUES ('22', 'widgets', '关注', 'follow', '0', '1', '', '', '1', '1398853561');
INSERT INTO `#@__pageelement` VALUES ('23', 'widgets', '分享', 'share', '0', '1', '', '', '1', '1398853568');
INSERT INTO `#@__pageelement` VALUES ('24', 'widgets', 'QQ客服', 'wpqq', '0', '1', '', '', '1', '1398853577');
INSERT INTO `#@__pageelement` VALUES ('25', 'apps', '数据列表', 'autolist', '1', '1', '', '', '1', '1398854450');
INSERT INTO `#@__pageelement_theme` VALUES ('1', '4', '01', '', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('2', '4', '02', '', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('3', '4', '03', '', '2');
INSERT INTO `#@__pageelement_theme` VALUES ('4', '4', '04', '', '3');
INSERT INTO `#@__pageelement_theme` VALUES ('5', '4', '05', '', '4');
INSERT INTO `#@__pageelement_theme` VALUES ('6', '4', '06', '', '5');
INSERT INTO `#@__pageelement_theme` VALUES ('7', '4', '07', '', '6');
INSERT INTO `#@__pageelement_theme` VALUES ('8', '4', '08', '', '7');
INSERT INTO `#@__pageelement_theme` VALUES ('9', '4', '09', '', '8');
INSERT INTO `#@__pageelement_theme` VALUES ('10', '4', '10', '', '9');
INSERT INTO `#@__pageelement_theme` VALUES ('11', '4', '11', '', '10');
INSERT INTO `#@__pageelement_theme` VALUES ('12', '4', '12-black', 'black', '11');
INSERT INTO `#@__pageelement_theme` VALUES ('13', '4', '12-blue', 'blue', '12');
INSERT INTO `#@__pageelement_theme` VALUES ('14', '4', '12-cyan', 'cyan', '13');
INSERT INTO `#@__pageelement_theme` VALUES ('15', '4', '12-green', 'green', '14');
INSERT INTO `#@__pageelement_theme` VALUES ('16', '4', '12-orange', 'orange', '15');
INSERT INTO `#@__pageelement_theme` VALUES ('17', '4', '12-purple', 'purple', '16');
INSERT INTO `#@__pageelement_theme` VALUES ('18', '4', '12-fd7682', '', '17');
INSERT INTO `#@__pageelement_theme` VALUES ('19', '4', '12-ff4d46', '', '18');
INSERT INTO `#@__pageelement_theme` VALUES ('20', '4', '12-white', 'white', '19');
INSERT INTO `#@__pageelement_theme` VALUES ('21', '4', '12-yellow', 'yellow', '20');
INSERT INTO `#@__pageelement_theme` VALUES ('22', '4', '13-black', 'black', '21');
INSERT INTO `#@__pageelement_theme` VALUES ('23', '4', '13-blue', 'blue', '22');
INSERT INTO `#@__pageelement_theme` VALUES ('24', '4', '13-cyan', 'cyan', '23');
INSERT INTO `#@__pageelement_theme` VALUES ('25', '4', '13-green', 'green', '24');
INSERT INTO `#@__pageelement_theme` VALUES ('26', '4', '13-orange', 'orange', '25');
INSERT INTO `#@__pageelement_theme` VALUES ('27', '4', '13-purple', 'purple', '26');
INSERT INTO `#@__pageelement_theme` VALUES ('28', '4', '13-red', 'red', '27');
INSERT INTO `#@__pageelement_theme` VALUES ('29', '4', '13-white', 'white', '28');
INSERT INTO `#@__pageelement_theme` VALUES ('30', '4', '13-yellow', 'yellow', '29');
INSERT INTO `#@__pageelement_theme` VALUES ('31', '4', 'default', '', '30');
INSERT INTO `#@__pageelement_theme` VALUES ('33', '6', '01', '', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('34', '6', '02', '', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('35', '6', '03', '', '2');
INSERT INTO `#@__pageelement_theme` VALUES ('36', '6', '04', '', '3');
INSERT INTO `#@__pageelement_theme` VALUES ('37', '6', '05-black', 'black', '4');
INSERT INTO `#@__pageelement_theme` VALUES ('38', '6', '05-184f78', 'blue', '5');
INSERT INTO `#@__pageelement_theme` VALUES ('39', '6', '05-27a2f0', 'blue', '6');
INSERT INTO `#@__pageelement_theme` VALUES ('40', '6', '05-39cb9b', 'cyan', '7');
INSERT INTO `#@__pageelement_theme` VALUES ('41', '6', '05-6dbc0c', 'green', '8');
INSERT INTO `#@__pageelement_theme` VALUES ('42', '6', '05-a04a35', 'orange', '9');
INSERT INTO `#@__pageelement_theme` VALUES ('43', '6', '05-e97936', 'orange', '10');
INSERT INTO `#@__pageelement_theme` VALUES ('44', '6', '05-7f6ccc', 'purple', '11');
INSERT INTO `#@__pageelement_theme` VALUES ('45', '6', '05-red', 'red', '12');
INSERT INTO `#@__pageelement_theme` VALUES ('46', '6', '05-white', 'white', '13');
INSERT INTO `#@__pageelement_theme` VALUES ('47', '6', '05-f7b637', 'yellow', '14');
INSERT INTO `#@__pageelement_theme` VALUES ('48', '6', '06-black', 'black', '15');
INSERT INTO `#@__pageelement_theme` VALUES ('49', '6', '06-184f78', 'blue', '16');
INSERT INTO `#@__pageelement_theme` VALUES ('50', '6', '06-27a2f0', 'blue', '17');
INSERT INTO `#@__pageelement_theme` VALUES ('51', '6', '06-39cb9b', 'cyan', '18');
INSERT INTO `#@__pageelement_theme` VALUES ('52', '6', '06-6dbc0c', 'green', '19');
INSERT INTO `#@__pageelement_theme` VALUES ('53', '6', '06-a04a35', 'orange', '20');
INSERT INTO `#@__pageelement_theme` VALUES ('54', '6', '06-e97936', 'orange', '21');
INSERT INTO `#@__pageelement_theme` VALUES ('55', '6', '06-7f6ccc', 'purple', '22');
INSERT INTO `#@__pageelement_theme` VALUES ('56', '6', '06-red', 'red', '23');
INSERT INTO `#@__pageelement_theme` VALUES ('57', '6', '06-white', 'white', '24');
INSERT INTO `#@__pageelement_theme` VALUES ('58', '6', '06-f7b637', 'yellow', '25');
INSERT INTO `#@__pageelement_theme` VALUES ('59', '6', '07-red', 'red', '26');
INSERT INTO `#@__pageelement_theme` VALUES ('60', '6', '07-white', 'white', '27');
INSERT INTO `#@__pageelement_theme` VALUES ('61', '6', '07-f7b637', 'yellow', '28');
INSERT INTO `#@__pageelement_theme` VALUES ('62', '6', '07-black', 'black', '29');
INSERT INTO `#@__pageelement_theme` VALUES ('63', '6', '07-184f78', 'blue', '30');
INSERT INTO `#@__pageelement_theme` VALUES ('64', '6', '07-27a2f0', 'blue', '31');
INSERT INTO `#@__pageelement_theme` VALUES ('65', '6', '07-39cb9b', 'cyan', '32');
INSERT INTO `#@__pageelement_theme` VALUES ('66', '6', '07-6dbc0c', 'green', '33');
INSERT INTO `#@__pageelement_theme` VALUES ('67', '6', '07-a04a35', 'orange', '34');
INSERT INTO `#@__pageelement_theme` VALUES ('68', '6', '07-e97936', 'orange', '35');
INSERT INTO `#@__pageelement_theme` VALUES ('69', '6', '07-7f6ccc', 'purple', '36');
INSERT INTO `#@__pageelement_theme` VALUES ('70', '6', 'default', '', '37');
INSERT INTO `#@__pageelement_theme` VALUES ('71', '10', 's03-yellow', 'yellow', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('72', '10', 's04-black', 'black', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('73', '10', 's04-blue', 'blue', '2');
INSERT INTO `#@__pageelement_theme` VALUES ('74', '10', 's04-cyan', 'cyan', '3');
INSERT INTO `#@__pageelement_theme` VALUES ('75', '10', 's04-green', 'green', '4');
INSERT INTO `#@__pageelement_theme` VALUES ('76', '10', 's04-orange', 'orange', '5');
INSERT INTO `#@__pageelement_theme` VALUES ('77', '10', 's04-42457e', 'purple', '6');
INSERT INTO `#@__pageelement_theme` VALUES ('78', '10', 's04-643ea2', 'purple', '7');
INSERT INTO `#@__pageelement_theme` VALUES ('79', '10', 's04-red', 'red', '8');
INSERT INTO `#@__pageelement_theme` VALUES ('80', '10', 's04-white', 'white', '9');
INSERT INTO `#@__pageelement_theme` VALUES ('81', '10', 's04-yellow', 'yellow', '10');
INSERT INTO `#@__pageelement_theme` VALUES ('82', '10', 's05-black', 'black', '11');
INSERT INTO `#@__pageelement_theme` VALUES ('83', '10', 's05-blue', 'blue', '12');
INSERT INTO `#@__pageelement_theme` VALUES ('84', '10', 's05-cyan', 'cyan', '13');
INSERT INTO `#@__pageelement_theme` VALUES ('85', '10', 's05-green', 'green', '14');
INSERT INTO `#@__pageelement_theme` VALUES ('86', '10', 's05-orange', 'orange', '15');
INSERT INTO `#@__pageelement_theme` VALUES ('87', '10', 's05-42457e', 'purple', '16');
INSERT INTO `#@__pageelement_theme` VALUES ('88', '10', 's05-643ea2', 'purple', '17');
INSERT INTO `#@__pageelement_theme` VALUES ('89', '10', 's05-red', 'red', '18');
INSERT INTO `#@__pageelement_theme` VALUES ('90', '10', 's05-white', 'white', '19');
INSERT INTO `#@__pageelement_theme` VALUES ('91', '10', 's05-yellow', 'yellow', '20');
INSERT INTO `#@__pageelement_theme` VALUES ('92', '10', 's06-black', 'black', '21');
INSERT INTO `#@__pageelement_theme` VALUES ('93', '10', 's06-blue', 'blue', '22');
INSERT INTO `#@__pageelement_theme` VALUES ('94', '10', 's06-cyan', 'cyan', '23');
INSERT INTO `#@__pageelement_theme` VALUES ('95', '10', 's06-green', 'green', '24');
INSERT INTO `#@__pageelement_theme` VALUES ('96', '10', 's06-orange', 'orange', '25');
INSERT INTO `#@__pageelement_theme` VALUES ('97', '10', 's06-42457e', 'purple', '26');
INSERT INTO `#@__pageelement_theme` VALUES ('98', '10', 's06-643ea2', 'purple', '27');
INSERT INTO `#@__pageelement_theme` VALUES ('99', '10', 's06-red', 'red', '28');
INSERT INTO `#@__pageelement_theme` VALUES ('100', '10', 's06-white', 'white', '29');
INSERT INTO `#@__pageelement_theme` VALUES ('101', '10', 's06-yellow', 'yellow', '30');
INSERT INTO `#@__pageelement_theme` VALUES ('102', '10', 'l03-blue', 'blue', '31');
INSERT INTO `#@__pageelement_theme` VALUES ('103', '10', 'l03-cyan', 'cyan', '32');
INSERT INTO `#@__pageelement_theme` VALUES ('104', '10', 'l03-green', 'green', '33');
INSERT INTO `#@__pageelement_theme` VALUES ('105', '10', 'l03-orange', 'orange', '34');
INSERT INTO `#@__pageelement_theme` VALUES ('106', '10', 'l03-42457e', 'purple', '35');
INSERT INTO `#@__pageelement_theme` VALUES ('107', '10', 'l03-643ea2', 'purple', '36');
INSERT INTO `#@__pageelement_theme` VALUES ('108', '10', 'l03-red', 'red', '37');
INSERT INTO `#@__pageelement_theme` VALUES ('109', '10', 'l03-white', 'white', '38');
INSERT INTO `#@__pageelement_theme` VALUES ('110', '10', 'l03-yellow', 'yellow', '39');
INSERT INTO `#@__pageelement_theme` VALUES ('111', '10', 'l04-black', 'black', '40');
INSERT INTO `#@__pageelement_theme` VALUES ('112', '10', 'l04-blue', 'blue', '41');
INSERT INTO `#@__pageelement_theme` VALUES ('113', '10', 'l04-cyan', 'cyan', '42');
INSERT INTO `#@__pageelement_theme` VALUES ('114', '10', 'l04-green', 'green', '43');
INSERT INTO `#@__pageelement_theme` VALUES ('115', '10', 'l04-orange', 'orange', '44');
INSERT INTO `#@__pageelement_theme` VALUES ('116', '10', 'l04-42457e', 'purple', '45');
INSERT INTO `#@__pageelement_theme` VALUES ('117', '10', 'l04-643ea2', 'purple', '46');
INSERT INTO `#@__pageelement_theme` VALUES ('118', '10', 'l04-red', 'red', '47');
INSERT INTO `#@__pageelement_theme` VALUES ('119', '10', 'l04-white', 'white', '48');
INSERT INTO `#@__pageelement_theme` VALUES ('120', '10', 'l04-yellow', 'yellow', '49');
INSERT INTO `#@__pageelement_theme` VALUES ('121', '10', 'l05-black', 'black', '50');
INSERT INTO `#@__pageelement_theme` VALUES ('122', '10', 'l05-blue', 'blue', '51');
INSERT INTO `#@__pageelement_theme` VALUES ('123', '10', 'l05-cyan', 'cyan', '52');
INSERT INTO `#@__pageelement_theme` VALUES ('124', '10', 'l05-green', 'green', '53');
INSERT INTO `#@__pageelement_theme` VALUES ('125', '10', 'l05-orange', 'orange', '54');
INSERT INTO `#@__pageelement_theme` VALUES ('126', '10', 'l05-42457e', 'purple', '55');
INSERT INTO `#@__pageelement_theme` VALUES ('127', '10', 'l05-643ea2', 'purple', '56');
INSERT INTO `#@__pageelement_theme` VALUES ('128', '10', 'l05-red', 'red', '57');
INSERT INTO `#@__pageelement_theme` VALUES ('129', '10', 'l05-white', 'white', '58');
INSERT INTO `#@__pageelement_theme` VALUES ('130', '10', 'l05-yellow', 'yellow', '59');
INSERT INTO `#@__pageelement_theme` VALUES ('131', '10', 'l06-black', 'black', '60');
INSERT INTO `#@__pageelement_theme` VALUES ('132', '10', 'l06-blue', 'blue', '61');
INSERT INTO `#@__pageelement_theme` VALUES ('133', '10', 'l06-cyan', 'cyan', '62');
INSERT INTO `#@__pageelement_theme` VALUES ('134', '10', 'l06-green', 'green', '63');
INSERT INTO `#@__pageelement_theme` VALUES ('135', '10', 'l06-orange', 'orange', '64');
INSERT INTO `#@__pageelement_theme` VALUES ('136', '10', 'l06-42457e', 'purple', '65');
INSERT INTO `#@__pageelement_theme` VALUES ('137', '10', 'l06-643ea2', 'purple', '66');
INSERT INTO `#@__pageelement_theme` VALUES ('138', '10', 'l06-red', 'red', '67');
INSERT INTO `#@__pageelement_theme` VALUES ('139', '10', 'l06-white', 'white', '68');
INSERT INTO `#@__pageelement_theme` VALUES ('140', '10', 'l06-yellow', 'yellow', '69');
INSERT INTO `#@__pageelement_theme` VALUES ('141', '10', 'm01-black', 'black', '70');
INSERT INTO `#@__pageelement_theme` VALUES ('142', '10', 'm01-blue', 'blue', '71');
INSERT INTO `#@__pageelement_theme` VALUES ('143', '10', 'm01-cyan', 'cyan', '72');
INSERT INTO `#@__pageelement_theme` VALUES ('144', '10', 'm01-green', 'green', '73');
INSERT INTO `#@__pageelement_theme` VALUES ('145', '10', 'm01-orange', 'orange', '74');
INSERT INTO `#@__pageelement_theme` VALUES ('146', '10', 'm01-42457e', 'purple', '75');
INSERT INTO `#@__pageelement_theme` VALUES ('147', '10', 'm01-643ea2', 'purple', '76');
INSERT INTO `#@__pageelement_theme` VALUES ('148', '10', 'm01-red', 'red', '77');
INSERT INTO `#@__pageelement_theme` VALUES ('149', '10', 'm01-white', 'white', '78');
INSERT INTO `#@__pageelement_theme` VALUES ('150', '10', 'm01-yellow', 'yellow', '79');
INSERT INTO `#@__pageelement_theme` VALUES ('151', '10', 'm02-black', 'black', '80');
INSERT INTO `#@__pageelement_theme` VALUES ('152', '10', 'm02-blue', 'blue', '81');
INSERT INTO `#@__pageelement_theme` VALUES ('153', '10', 'm02-cyan', 'cyan', '82');
INSERT INTO `#@__pageelement_theme` VALUES ('154', '10', 'm02-green', 'green', '83');
INSERT INTO `#@__pageelement_theme` VALUES ('155', '10', 'm02-orange', 'orange', '84');
INSERT INTO `#@__pageelement_theme` VALUES ('156', '10', 'm02-5a5da3', 'purple', '85');
INSERT INTO `#@__pageelement_theme` VALUES ('157', '10', 'm02-8149ae', 'purple', '86');
INSERT INTO `#@__pageelement_theme` VALUES ('158', '10', 'm02-red', 'red', '87');
INSERT INTO `#@__pageelement_theme` VALUES ('159', '10', 'm02-white', 'white', '88');
INSERT INTO `#@__pageelement_theme` VALUES ('160', '10', 'm02-yellow', 'yellow', '89');
INSERT INTO `#@__pageelement_theme` VALUES ('161', '10', 'm03-black', 'black', '90');
INSERT INTO `#@__pageelement_theme` VALUES ('162', '10', 'm03-blue', 'blue', '91');
INSERT INTO `#@__pageelement_theme` VALUES ('163', '10', 'm03-cyan', 'cyan', '92');
INSERT INTO `#@__pageelement_theme` VALUES ('164', '10', 'm03-green', 'green', '93');
INSERT INTO `#@__pageelement_theme` VALUES ('165', '10', 'm03-orange', 'orange', '94');
INSERT INTO `#@__pageelement_theme` VALUES ('166', '10', 'm03-42457e', 'purple', '95');
INSERT INTO `#@__pageelement_theme` VALUES ('167', '10', 'm03-643ea2', 'purple', '96');
INSERT INTO `#@__pageelement_theme` VALUES ('168', '10', 'm03-red', 'red', '97');
INSERT INTO `#@__pageelement_theme` VALUES ('169', '10', 'm03-white', 'white', '98');
INSERT INTO `#@__pageelement_theme` VALUES ('170', '10', 'm03-yellow', 'yellow', '99');
INSERT INTO `#@__pageelement_theme` VALUES ('171', '13', 'default', 'white', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('172', '13', 'black', 'black', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('173', '14', '10-blue', 'blue', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('174', '14', '10-cyan', 'cyan', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('175', '14', '10-green', 'green', '2');
INSERT INTO `#@__pageelement_theme` VALUES ('176', '14', '10-orange', 'orange', '3');
INSERT INTO `#@__pageelement_theme` VALUES ('177', '14', '10-56589d', 'purple', '4');
INSERT INTO `#@__pageelement_theme` VALUES ('178', '14', '10-8344a3', 'purple', '5');
INSERT INTO `#@__pageelement_theme` VALUES ('179', '14', '10-red', 'red', '6');
INSERT INTO `#@__pageelement_theme` VALUES ('180', '14', '10-white', 'white', '7');
INSERT INTO `#@__pageelement_theme` VALUES ('181', '14', '10-yellow', 'yellow', '8');
INSERT INTO `#@__pageelement_theme` VALUES ('182', '14', 'default-184f78', 'blue', '9');
INSERT INTO `#@__pageelement_theme` VALUES ('183', '14', 'default-27a2f0', 'blue', '10');
INSERT INTO `#@__pageelement_theme` VALUES ('184', '14', 'default-39cb9b', 'cyan', '11');
INSERT INTO `#@__pageelement_theme` VALUES ('185', '14', 'default-6dbc0c', 'green', '12');
INSERT INTO `#@__pageelement_theme` VALUES ('186', '14', 'default-a04a35', 'orange', '13');
INSERT INTO `#@__pageelement_theme` VALUES ('187', '14', 'default-e97936', 'orange', '14');
INSERT INTO `#@__pageelement_theme` VALUES ('188', '14', 'default-7f6ccc', 'purple', '15');
INSERT INTO `#@__pageelement_theme` VALUES ('189', '14', 'default-red', 'red', '16');
INSERT INTO `#@__pageelement_theme` VALUES ('190', '14', 'default-white', 'white', '17');
INSERT INTO `#@__pageelement_theme` VALUES ('191', '14', 'default-f7b637', 'yellow', '18');
INSERT INTO `#@__pageelement_theme` VALUES ('192', '14', '08-e97936', 'orange', '19');
INSERT INTO `#@__pageelement_theme` VALUES ('193', '14', '08-7f6ccc', 'purple', '20');
INSERT INTO `#@__pageelement_theme` VALUES ('194', '14', '08-red', 'red', '21');
INSERT INTO `#@__pageelement_theme` VALUES ('195', '14', '08-white', 'white', '22');
INSERT INTO `#@__pageelement_theme` VALUES ('196', '14', '08-f7b637', 'yellow', '23');
INSERT INTO `#@__pageelement_theme` VALUES ('197', '14', '09-blue', 'blue', '24');
INSERT INTO `#@__pageelement_theme` VALUES ('198', '14', '09-cyan', 'cyan', '25');
INSERT INTO `#@__pageelement_theme` VALUES ('199', '14', '09-green', 'green', '26');
INSERT INTO `#@__pageelement_theme` VALUES ('200', '14', '09-orange', 'orange', '27');
INSERT INTO `#@__pageelement_theme` VALUES ('201', '14', '09-56589d', 'purple', '28');
INSERT INTO `#@__pageelement_theme` VALUES ('202', '14', '09-8344a3', 'purple', '29');
INSERT INTO `#@__pageelement_theme` VALUES ('203', '14', '09-red', 'red', '30');
INSERT INTO `#@__pageelement_theme` VALUES ('204', '14', '09-white', 'white', '31');
INSERT INTO `#@__pageelement_theme` VALUES ('205', '14', '09-yellow', 'yellow', '32');
INSERT INTO `#@__pageelement_theme` VALUES ('206', '14', '10-black', 'black', '33');
INSERT INTO `#@__pageelement_theme` VALUES ('207', '14', '00-184f78', 'blue', '34');
INSERT INTO `#@__pageelement_theme` VALUES ('208', '14', '00-27a2f0', 'blue', '35');
INSERT INTO `#@__pageelement_theme` VALUES ('209', '14', '00-39cb9b', 'cyan', '36');
INSERT INTO `#@__pageelement_theme` VALUES ('210', '14', '00-6dbc0c', 'green', '37');
INSERT INTO `#@__pageelement_theme` VALUES ('211', '14', '00-a04a35', 'orange', '38');
INSERT INTO `#@__pageelement_theme` VALUES ('212', '14', '00-e97936', 'orange', '39');
INSERT INTO `#@__pageelement_theme` VALUES ('213', '14', '00-7f6ccc', 'purple', '40');
INSERT INTO `#@__pageelement_theme` VALUES ('214', '14', '00-red', 'red', '41');
INSERT INTO `#@__pageelement_theme` VALUES ('215', '14', '00-white', 'white', '42');
INSERT INTO `#@__pageelement_theme` VALUES ('216', '14', '00-f7b637', 'yellow', '43');
INSERT INTO `#@__pageelement_theme` VALUES ('217', '14', '01-184f78', 'blue', '44');
INSERT INTO `#@__pageelement_theme` VALUES ('218', '14', '01-27a2f0', 'blue', '45');
INSERT INTO `#@__pageelement_theme` VALUES ('219', '14', '01-39cb9b', 'cyan', '46');
INSERT INTO `#@__pageelement_theme` VALUES ('220', '14', '01-6dbc0c', 'green', '47');
INSERT INTO `#@__pageelement_theme` VALUES ('221', '14', '01-a04a35', 'orange', '48');
INSERT INTO `#@__pageelement_theme` VALUES ('222', '14', '01-e97936', 'orange', '49');
INSERT INTO `#@__pageelement_theme` VALUES ('223', '14', '01-7f6ccc', 'purple', '50');
INSERT INTO `#@__pageelement_theme` VALUES ('224', '14', '01-red', 'red', '51');
INSERT INTO `#@__pageelement_theme` VALUES ('225', '14', '01-white', 'white', '52');
INSERT INTO `#@__pageelement_theme` VALUES ('226', '14', '01-f7b637', 'yellow', '53');
INSERT INTO `#@__pageelement_theme` VALUES ('227', '14', '02-184f78', 'blue', '54');
INSERT INTO `#@__pageelement_theme` VALUES ('228', '14', '02-27a2f0', 'blue', '55');
INSERT INTO `#@__pageelement_theme` VALUES ('229', '14', '02-39cb9b', 'cyan', '56');
INSERT INTO `#@__pageelement_theme` VALUES ('230', '14', '02-e97936', 'orange', '57');
INSERT INTO `#@__pageelement_theme` VALUES ('231', '14', '02-red', 'red', '58');
INSERT INTO `#@__pageelement_theme` VALUES ('232', '14', '03-black', 'black', '59');
INSERT INTO `#@__pageelement_theme` VALUES ('233', '14', '03-184f78', 'blue', '60');
INSERT INTO `#@__pageelement_theme` VALUES ('234', '14', '03-27a2f0', 'blue', '61');
INSERT INTO `#@__pageelement_theme` VALUES ('235', '14', '03-39cb9b', 'cyan', '62');
INSERT INTO `#@__pageelement_theme` VALUES ('236', '14', '03-6dbc0c', 'green', '63');
INSERT INTO `#@__pageelement_theme` VALUES ('237', '14', '03-a04a35', 'orange', '64');
INSERT INTO `#@__pageelement_theme` VALUES ('238', '14', '03-e97936', 'orange', '65');
INSERT INTO `#@__pageelement_theme` VALUES ('239', '14', '03-7f6ccc', 'purple', '66');
INSERT INTO `#@__pageelement_theme` VALUES ('240', '14', '03-red', 'red', '67');
INSERT INTO `#@__pageelement_theme` VALUES ('241', '14', '03-white', 'white', '68');
INSERT INTO `#@__pageelement_theme` VALUES ('242', '14', '03-f7b637', 'yellow', '69');
INSERT INTO `#@__pageelement_theme` VALUES ('243', '14', '04-black', 'black', '70');
INSERT INTO `#@__pageelement_theme` VALUES ('244', '14', '05-184f78', 'blue', '71');
INSERT INTO `#@__pageelement_theme` VALUES ('245', '14', '05-27a2f0', 'blue', '72');
INSERT INTO `#@__pageelement_theme` VALUES ('246', '14', '05-39cb9b', 'cyan', '73');
INSERT INTO `#@__pageelement_theme` VALUES ('247', '14', '05-6dbc0c', 'green', '74');
INSERT INTO `#@__pageelement_theme` VALUES ('248', '14', '05-a04a35', 'orange', '75');
INSERT INTO `#@__pageelement_theme` VALUES ('249', '14', '05-e97936', 'orange', '76');
INSERT INTO `#@__pageelement_theme` VALUES ('250', '14', '05-7f6ccc', 'purple', '77');
INSERT INTO `#@__pageelement_theme` VALUES ('251', '14', '05-red', 'red', '78');
INSERT INTO `#@__pageelement_theme` VALUES ('252', '14', '05-white', 'white', '79');
INSERT INTO `#@__pageelement_theme` VALUES ('253', '14', '05-f7b637', 'yellow', '80');
INSERT INTO `#@__pageelement_theme` VALUES ('254', '14', '06-white', 'white', '81');
INSERT INTO `#@__pageelement_theme` VALUES ('255', '14', '07-184f78', 'blue', '82');
INSERT INTO `#@__pageelement_theme` VALUES ('256', '14', '07-27a2f0', 'blue', '83');
INSERT INTO `#@__pageelement_theme` VALUES ('257', '14', '07-39cb9b', 'cyan', '84');
INSERT INTO `#@__pageelement_theme` VALUES ('258', '14', '07-6dbc0c', 'green', '85');
INSERT INTO `#@__pageelement_theme` VALUES ('259', '14', '07-a04a35', 'orange', '86');
INSERT INTO `#@__pageelement_theme` VALUES ('260', '14', '07-e97936', 'orange', '87');
INSERT INTO `#@__pageelement_theme` VALUES ('261', '14', '07-7f6ccc', 'purple', '88');
INSERT INTO `#@__pageelement_theme` VALUES ('262', '14', '07-red', 'red', '89');
INSERT INTO `#@__pageelement_theme` VALUES ('263', '14', '07-white', 'white', '90');
INSERT INTO `#@__pageelement_theme` VALUES ('264', '14', '07-f7b637', 'yellow', '91');
INSERT INTO `#@__pageelement_theme` VALUES ('265', '14', '08-184f78', 'blue', '92');
INSERT INTO `#@__pageelement_theme` VALUES ('266', '14', '08-27a2f0', 'blue', '93');
INSERT INTO `#@__pageelement_theme` VALUES ('267', '14', '08-39cb9b', 'cyan', '94');
INSERT INTO `#@__pageelement_theme` VALUES ('268', '14', '08-6dbc0c', 'green', '95');
INSERT INTO `#@__pageelement_theme` VALUES ('269', '14', '08-a04a35', 'orange', '96');
INSERT INTO `#@__pageelement_theme` VALUES ('270', '15', '01', '', '0');
INSERT INTO `#@__pageelement_theme` VALUES ('271', '15', '02', '', '1');
INSERT INTO `#@__pageelement_theme` VALUES ('272', '15', '03', '', '2');
INSERT INTO `#@__pageelement_theme` VALUES ('273', '15', '04', '', '3');
INSERT INTO `#@__pageelement_theme` VALUES ('274', '15', '05', '', '4');
INSERT INTO `#@__pageelement_theme` VALUES ('275', '15', '06', '', '5');
INSERT INTO `#@__pageelement_theme` VALUES ('276', '15', '07', '', '6');
INSERT INTO `#@__pageelement_theme` VALUES ('277', '15', '08', '', '7');
INSERT INTO `#@__pageelement_theme` VALUES ('278', '15', '09', '', '8');
INSERT INTO `#@__pageelement_theme` VALUES ('279', '15', 'default', '', '9');
DEFAULTSQL;
}

