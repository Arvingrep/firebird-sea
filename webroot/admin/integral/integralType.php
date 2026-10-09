<?php
/**
 * 管理积分商城分类
 *
 * @version        $Id: integralType.php 2014-2-9 下午23:30:21 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("integralType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "integralType.html";

$action = "integral_type";

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
	if(!testPurview("editIntegralType")) {
		die('{"state" : 200, "info" : '.json_encode("抱歉，您无权进行此操作").'}');
	}
	
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
				echo $archives;die;
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
	if(!testPurview("delIntegralType")) {
		die('{"state" : 200, "info" : '.json_encode("抱歉，您无权进行此操作").'}');
	}
	
	if($id != ""){

		$idsArr = array();
		$idexp = explode(",", $id);

		//获取所有子级
		global $data;
		foreach ($idexp as $k => $id) {		
			$childArr = $dsql->getTypeList($id, $action, 1);
			if(is_array($childArr)){
				$data = array();
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}
		foreach ($idsArr as $key => $id) {
			//删除分类下所有字段
			$archives = $dsql->SetQuery("DELETE FROM `#@__integral_item` WHERE `type` = ".$id);
			$dsql->dsqlOper($archives, "update");
			//删除分类图标
			$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__integral_type` WHERE `id` = ".$id." AND `icon` != ''");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				delPicFile($res[0]['icon'], "delAdv", "integral");
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
	if(!testPurview("addIntegralType")) {
		die('{"state" : 200, "info" : '.json_encode("抱歉，您无权进行此操作").'}');
	}
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

    adminLog("导入默认数据", "积分分类_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery.ajaxFileUpload.js',
		'ui/jquery-ui-sortable.js',
		'admin/integral/integralType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/integral";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//同步子级分类规格
function speRelevance($id, $spes){
	global $dsql;
	$typeSql = $dsql->SetQuery("SELECT `id` FROM `#@__integral_type` WHERE `parentid` = ".$id);
	$typeResult = $dsql->dsqlOper($typeSql, "results");
	if($typeResult){
		$typeSql = $dsql->SetQuery("UPDATE `#@__integral_type` SET `spe` = '$spes' WHERE `parentid` = ".$id);
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
DELETE FROM `#@__integral_type`;
ALTER TABLE `#@__integral_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('2', '0', '家居用品', '0', '', '', '', '', '1515983864', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479452822.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('3', '2', '餐厨百货', '0', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502214369454.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('4', '2', '创意家居', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502213636605.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('5', '2', '生活用品', '2', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502213001118.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('6', '2', '洗护清洁', '3', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/1550221215410.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('7', '0', '家用电器', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479486766.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('8', '7', '生活电器', '0', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502215857131.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('9', '7', '个护健康', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502216143950.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('10', '7', '厨房电器', '2', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502215572446.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('11', '0', '手机数码', '2', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/1538047950427.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('12', '11', '手机周边', '0', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502216472285.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('13', '11', '影音设备', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502216347861.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('14', '11', '电脑周边', '2', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502216541054.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('15', '0', '汽车周边', '3', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479524206.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('16', '15', '保养清洗', '0', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502217585906.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('17', '15', '汽车装饰', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502218328813.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('18', '15', '车载电器', '2', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502218808372.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('19', '0', '运动户外', '4', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479547978.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('20', '19', '户外装备', '0', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502219625551.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('21', '19', '运动器材', '1', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2019/02/15/15502220164686.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('22', '0', '箱包配饰', '5', '', '', '', '', '1515984671', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479563128.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('23', '22', '功能箱包', '0', '', '', '', '', '1515984671', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('24', '22', '时尚配饰', '1', '', '', '', '', '1515984671', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('25', '0', '食品保健', '6', '', '', '', '', '1515988545', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479579236.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('26', '25', '饮品酒水', '0', '', '', '', '', '1515988545', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('27', '25', '南北干货', '1', '', '', '', '', '1515988545', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('28', '25', '粮油米面', '2', '', '', '', '', '1515988598', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('29', '25', '冲调', '3', '', '', '', '', '1515988598', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('30', '25', '休闲食品', '4', '', '', '', '', '1515988598', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('31', '0', '个护化妆', '7', '', '', '', '', '1515988636', 'https://upload.ihuoniao.cn//integral/adv/large/2018/02/07/15179840375467.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('32', '31', '面部护理', '0', '', '', '', '', '1515988636', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('33', '31', '身体护理', '1', '', '', '', '', '1515988636', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('34', '31', '化妆造型', '2', '', '', '', '', '1515988636', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('35', '0', '母婴用品', '8', '', '', '', '', '1515988708', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479613891.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('36', '35', '玩具早教', '0', '', '', '', '', '1515988708', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('37', '35', '哺育喂养', '1', '', '', '', '', '1515988708', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('38', '35', '孕婴家纺', '2', '', '', '', '', '1515988708', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('39', '0', '商务', '9', '', '', '', '', '1515988805', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/15380479634900.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('40', '39', '旅行', '0', '', '', '', '', '1515988805', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('41', '39', '航空里程', '1', '', '', '', '', '1515988805', '');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('42', '0', '金融', '10', '', '', '', '', '1515988805', 'https://upload.ihuoniao.cn//integral/adv/large/2018/09/27/1538047965274.png');
INSERT INTO `#@__integral_type` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `spe`, `pubdate`, `icon`) VALUES ('49', '42', '理财', '0', '', '', '', '', '1632968239', '');
DEFAULTSQL;
}
