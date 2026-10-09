<?php
/**
 * 管理商家分类
 *
 * @version        $Id: businessType.php 2017-03-22 下午18:34:20 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessType.html";

$action = "business_type";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
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

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改商家分类", $typename);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除分类
}else if($dopost == "del"){
	if($id == "") die;

	$idsArr = array();
	$idexp = explode(",", $id);

	//获取所有子级
	foreach ($idexp as $k => $id) {

        //删除分类图标
        $sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."` WHERE `id` = ".$id." AND `icon` != ''");
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            delPicFile($res[0]['icon'], "delAdv", "business");
        }

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

	adminLog("删除商家分类", join(",", $idsArr));
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

    adminLog("导入默认数据", "商家分类_business_type");
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
		'admin/business/businessType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__business_type`;
ALTER TABLE `#@__business_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('1', '0', '餐饮美食', '0', '1490179513', 'https://upload.ihuoniao.cn//business/adv/large/2020/08/03/15964413089053.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('2', '1', '早点早餐', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('3', '1', '饭店餐厅', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('4', '1', '快餐外卖', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('5', '1', '烧烤麻辣', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('6', '1', '夜宵天地', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('7', '1', '火锅香辣', '5', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('8', '1', '茶餐西餐', '6', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('9', '1', '甜品饮料', '7', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('10', '1', '零食特产', '8', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('11', '1', '生鲜水果', '9', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('12', '0', '休闲娱乐', '1', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472842045076.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('13', '12', '美容美发', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('14', '12', '游戏电玩', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('15', '12', '文体户外', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('16', '12', '汗蒸养生', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('17', '12', '网吧电竞', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('18', '12', '游泳馆', '5', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('19', '12', '时尚丽人', '6', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('20', '12', '健身房', '7', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('21', '12', '按摩推拿', '8', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('22', '12', '足浴洗浴', '9', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('23', '0', '酒店旅游', '2', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472860943065.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('24', '23', '民宿客栈', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('25', '23', '星级酒店', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('26', '23', '旅游包车', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('27', '23', '商务宾馆', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('28', '23', '旅行社', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('29', '23', '旅游景点', '5', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('30', '23', '农家乐', '6', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('31', '0', '购物天地', '3', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861058294.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('32', '31', '文具办公', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('33', '31', '美容护肤', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('34', '31', '数码科技', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('35', '31', '保健养生', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('36', '31', '服装鞋包', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('37', '0', '生活服务', '4', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861154635.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('38', '37', '的士/代驾', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('39', '37', '家政服务', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('40', '37', '送水站', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('41', '37', '宠物服务', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('42', '37', '开锁修锁', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('43', '37', '管道疏通', '5', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('44', '37', '日常维修', '6', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('45', '37', '二手回收', '7', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('46', '0', '汽车服务', '5', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/1547286124674.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('47', '46', '摩托车/电动车', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('48', '46', '4S店', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('49', '46', '汽车美容', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('50', '46', '维修保养', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('51', '46', '驾校教练', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('52', '46', '汽配销售', '5', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('53', '46', '保险信贷', '6', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('54', '46', '汽车销售', '7', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('55', '0', '母婴专区', '6', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861305723.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('56', '55', '儿童玩具', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('57', '55', '母婴食品', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('58', '55', '母婴用品', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('59', '55', '母婴健康', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('60', '55', '母婴教育', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('61', '0', '婚庆摄影', '7', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861371164.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('62', '61', '汽车销售', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('63', '61', '汽车租赁', '1', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('64', '61', '驾校陪练', '2', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('65', '61', '汽修美容', '3', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('66', '61', '汽车用品', '4', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('67', '0', '婚庆摄影', '8', '1490179513', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861441408.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('68', '67', '跟拍跟妆', '0', '1490179513', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('72', '0', '教育培训', '9', '1547283646', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861531970.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('73', '0', '家具建材', '10', '1547283734', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861594887.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('74', '0', '房产相关', '11', '1547283734', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861689864.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('75', '0', '商务服务', '12', '1547283734', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861731216.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('76', '0', '农林牧渔', '13', '1547283734', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/15472861796618.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('79', '0', '其他', '14', '1547283734', 'https://upload.ihuoniao.cn//huangye/adv/large/2019/01/12/1547286197970.png');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('110', '1', '海鲜肉类', '10', '1587864122', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('111', '12', '咖啡厅', '10', '1587864371', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('112', '12', 'KTV', '11', '1587864371', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('113', '12', '酒吧MUSIC', '12', '1587864371', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('114', '12', '电影院', '13', '1587864371', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('115', '12', '茶馆', '14', '1587864371', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('116', '23', '度假村', '7', '1587864424', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('117', '31', '眼镜饰品', '5', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('118', '31', '家用电器', '6', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('119', '31', '手机专卖', '7', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('120', '31', '户外运动', '8', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('121', '31', '茗茶烟酒', '9', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('122', '31', '珠宝钟表', '10', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('123', '31', '鲜花礼品', '11', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('124', '31', '商行超市', '12', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('125', '31', '生鲜特产', '13', '1587864556', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('127', '37', '搬家服务', '8', '1587864656', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('128', '37', '快递服务', '9', '1587864656', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('129', '37', '物流服务', '10', '1587864656', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('130', '37', '陵园公墓', '11', '1587864656', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('131', '46', '汽车租赁', '8', '1587864714', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('132', '55', '母婴服务', '5', '1587864868', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('133', '67', '影视制作', '1', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('134', '67', '儿童摄影', '2', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('135', '67', '婚庆公司', '3', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('136', '67', '庆典礼仪', '4', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('137', '67', '婚车租赁', '5', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('138', '67', '喜糖铺子', '6', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('139', '67', '主持司仪', '7', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('140', '67', '婚纱摄影', '8', '1587864928', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('141', '72', '办公培训', '0', '1587865052', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('142', '72', '特长培训', '1', '1587865052', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('143', '72', '职业技能', '2', '1587865052', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('144', '72', '家教辅导', '3', '1587865052', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('145', '72', '幼儿园', '4', '1587865052', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('146', '73', '木地板', '0', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('147', '73', '家私家具', '1', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('148', '73', '陶瓷卫浴', '2', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('149', '73', '衣柜橱柜', '3', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('150', '73', '油漆涂料', '4', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('151', '73', '装修装饰', '5', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('152', '73', '五金建材', '6', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('153', '73', '水电管道', '7', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('154', '73', '背景墙纸', '8', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('155', '73', '家饰工艺', '9', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('156', '73', '窗帘家纺', '10', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('157', '73', '门窗灶炉', '11', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('158', '73', '灯饰灯具', '12', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('159', '73', '智能家具', '13', '1587865128', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('160', '74', '新楼盘', '0', '1587865213', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('161', '74', '房屋中介', '1', '1587865213', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('162', '74', '房产评估', '2', '1587865213', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('163', '75', '广告传媒', '0', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('164', '75', '印刷包装', '1', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('165', '75', '网络营销', '2', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('166', '75', '法律咨询', '3', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('167', '75', '工商注册', '4', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('168', '75', '财务会计', '5', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('169', '75', '设计策划', '6', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('170', '75', '创业服务', '7', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('171', '75', '软件服务', '8', '1587865272', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('172', '76', '农作物', '0', '1587865300', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('173', '76', '园林花卉', '1', '1587865300', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('174', '76', '畜禽养殖', '2', '1587865300', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('175', '37', '其他服务', '12', '1587865339', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('178', '79', '类目一', '0', '1631860725', '');
INSERT INTO `#@__business_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('179', '79', '类目二', '1', '1699931129', '');
DEFAULTSQL;
}
