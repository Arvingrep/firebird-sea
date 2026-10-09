<?php
/**
 * 管理活动分类
 *
 * @version        $Id: huodongType.php 2016-12-22 下午12:38:15 $
 * @package        HuoNiao.huodong
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("huodongType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/huodong";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "huodongType.html";

$action = "huodong_type";

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
			$litpic 	 = $icon;
			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `typename` = '$typename',`litpic`='$litpic' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('分类修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改活动分类", $typename);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delAdv", "huodong");
		}
	}


	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除活动分类", join(",", $idsArr));
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

    adminLog("导入默认数据", "活动分类_" . $action);
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
		'admin/huodong/huodongType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/huodong";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__huodong_type`;
ALTER TABLE `#@__huodong_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('1', '0', '亲子', '0', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2021/01/21/16112205328050.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('2', '0', '互联网', '1', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413382586.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('3', '0', '户外出游', '2', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413436442.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('4', '0', '运动健身', '3', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413468911.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('5', '0', '职场培训', '4', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413524257.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('6', '0', '创投', '5', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413586266.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('7', '0', '演出娱乐', '6', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413616408.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('8', '0', '周边游', '7', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413644927.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('9', '0', '跑步', '8', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907414274713.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('10', '0', '丽人时尚', '9', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907413761071.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('11', '0', '交友', '10', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907414171591.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('12', '0', '文艺', '11', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907414319123.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('13', '0', '公益文化', '12', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907414047959.png');
INSERT INTO `#@__huodong_type` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES ('14', '0', 'live', '13', '1517538281', 'https://upload.ihuoniao.cn//huodong/adv/large/2020/05/29/15907414345218.png');
DEFAULTSQL;
}
