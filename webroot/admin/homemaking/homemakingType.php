<?php
/**
 * 管理家政分类
 *
 * @version        $Id: homemakingType.php 2019-4-1 下午16:40:21 $
 * @package        HuoNiao.Tieba
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingType.html";

$action = "homemaking_type";

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

		if($typename == "" && !$type1) die('{"state": 101, "info": '.json_encode('请输入分类名').'}');
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
			if($type1){
				$typename = $results[0]['typename'];
			}
			$typename    	= cn_substrR($typename,30);
			$title		 	= cn_substrR($title,30);
			$note 			= trim(cn_substrR($note,150));
			$litpic 		= $litpic;
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename',`title` = '$title',`note` = '$note',`litpic` = '$litpic'  WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改家政分类", $typename);
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
		$childArr = $dsql->getTypeList($id, $action, 1);
		if(is_array($childArr)){
			global $data;
			$data = "";
			$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
		}
		$idsArr[] = $id;
	}

	// 删除分类图片
	foreach ($idsArr as $kk => $id) {
		//删除分类图标
		$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__".$action."` WHERE `id` = ".$id." AND `litpic` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['litpic'], "delAdv", "homemaking");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除家政分类", join(",", $idsArr));
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

    adminLog("导入默认数据", "家政分类_" . $action);
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
		'admin/homemaking/homemakingType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__homemaking_type`;
ALTER TABLE `#@__homemaking_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('1', '0', '保洁清洗', '0', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866275707.png', '专业上门清洁服务', '专业设备、专业手法保洁、彻底清洁、不留死角、让您的家焕然一新', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/15887590277636.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('2', '0', '做饭阿姨', '7', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2021/08/12/16287513182872.png', '', NULL, '');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('3', '0', '搬家货运', '1', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866635962.png', '提供物品搬运服务', '专业人员配合家庭或办公 家具等搬运服务', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/158875906288.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('4', '0', '家电维修', '2', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866675349.png', '电器安装、维修、清洗', '上门安装、维修空调、洗衣 机、热水器、燃气灶、电视 等不同品牌家电', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/15887590724415.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('5', '0', '开锁换锁', '3', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866696323.png', '快速上门开锁换锁', '顾客为尊想顾客之“锁”想 急顾客之“锁”急 解顾客之“锁”难', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/1588759080507.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('6', '0', '鲜花绿植', '4', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866725169.png', '鲜花速递送花订花', '开业花篮、生日鲜花、生日 蛋糕、发财树、富贵竹、探 望探病鲜花、绿植租摆等各 种您需要的鲜花', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/1588759088802.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('7', '0', '医护健康', '5', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866751844.png', '呵护您与家人的健康', '体检、产妇护理、口腔医院、就医陪诊、医护上门等各类 健康相关服务', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/15887590971605.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('8', '0', '美食餐饮', '6', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866773132.png', '美食餐饮,吃的放心', '制作家庭便餐，想吃的美食 在家做，家人更健康', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/15887591066571.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('9', '0', '按摩护理', '8', '1555555445', 'https://upload.ihuoniao.cn//homemaking/adv/large/2020/12/17/16081866826475.png', '按摩护理服务', '按摩护理服务叫到家，足不 出户，放松劳累的身体', 'https://upload.ihuoniao.cn//homemaking/thumb/large/2020/05/06/15887591145698.png');
INSERT INTO `#@__homemaking_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `title`, `note`, `litpic`) VALUES ('11', '0', '骑手配送', '9', '1575539985', 'https://upload.ihuoniao.cn//homemaking/adv/large/2021/08/12/16287513109245.png', '', NULL, '');
DEFAULTSQL;
}
