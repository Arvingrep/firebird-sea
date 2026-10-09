<?php
/**
 * 管理任务悬赏会员等级
 *
 * @version        $Id: taskMemberLevel.php 2022-08-20 下午21:18:16 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskMemberLevel");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskMemberLevel.html";

$action = "task";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_member_level` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_member_level` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入等级名称').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_member_level` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}else{

			//对字符进行处理
			$typename = cn_substrR($typename, 30);
			$price = (float)$price;  //现价
			$mprice = (float)$mprice;  //原价
            $duration_month = (int)$duration_month;  //会员时长（单位：月）
            $duration_note = cn_substrR($duration_note, 50);  //时长描述
            $refresh_coupon = (int)$refresh_coupon;  //开通后赠送刷新券数量（单位：个/次）
            $refresh_discount = (int)$refresh_discount;  //刷新折扣比例
            $bid_coupon = (int)$bid_coupon;  //开通后赠送推荐置顶时长（单位：小时）
            $bid_discount = (int)$bid_discount;  //置顶折扣比例
            $fabu_count = (int)$fabu_count;  //发布任务数量限制
            // $fabu_fee = (int)$fabu_fee;  //发布任务手续费比例
            $bgcolor = cn_substrR($bgcolor, 7);  //背景色
            $fontcolor = cn_substrR($fontcolor, 7);  //文字颜色
            $fabu_fee = (int)$fabu_fee;  //发布任务平台抽取佣金比例
            $task_fee = (int)$task_fee;  //做任务佣金增加比例

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_member_level` SET `typename` = '$typename', `price` = '$price', `mprice` = '$mprice', `duration_month` = '$duration_month', `duration_note` = '$duration_note', `refresh_coupon` = '$refresh_coupon', `refresh_discount` = '$refresh_discount', `bid_coupon` = '$bid_coupon', `bid_discount` = '$bid_discount', `fabu_count` = '$fabu_count', `bgcolor` = '$bgcolor', `fontcolor` = '$fontcolor', `fabu_fee` = '$fabu_fee', `task_fee` = '$task_fee' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('会员等级修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改任务悬赏会员等级", $typename);
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
		$childArr = $dsql->getTypeList($id, $action."_member_level", 1);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."_member_level` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delLogo", "task");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_member_level` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除任务悬赏会员等级", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action."_member_level");
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

    adminLog("导入默认数据", "任务悬赏会员等级");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/task/taskMemberLevel.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_member_level"), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}




/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__task_member_level`;
ALTER TABLE `#@__task_member_level` AUTO_INCREMENT = 1;
DELETE FROM `#@__task_member_level_equity`;
ALTER TABLE `#@__task_member_level_equity` AUTO_INCREMENT = 1;
INSERT INTO `#@__task_member_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `price`, `mprice`, `duration_month`, `duration_note`, `refresh_coupon`, `refresh_discount`, `bid_coupon`, `bid_discount`, `fabu_count`, `bgcolor`, `fontcolor`, `fabu_fee`, `task_fee`) VALUES ('1', '0', '白金会员', '0', '1665803171', 'undefined', '88.00', '98.00', '1', '1个月', '8', '90', '3', '90', '25', '#c7e1f4', '#385380', '10', '2');
INSERT INTO `#@__task_member_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `price`, `mprice`, `duration_month`, `duration_note`, `refresh_coupon`, `refresh_discount`, `bid_coupon`, `bid_discount`, `fabu_count`, `bgcolor`, `fontcolor`, `fabu_fee`, `task_fee`) VALUES ('2', '0', '黄金会员', '1', '1665803171', 'undefined', '248.00', '294.00', '3', '3个月', '24', '88', '10', '88', '25', '#fee0b8', '#b35f00', '8', '5');
INSERT INTO `#@__task_member_level` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `price`, `mprice`, `duration_month`, `duration_note`, `refresh_coupon`, `refresh_discount`, `bid_coupon`, `bid_discount`, `fabu_count`, `bgcolor`, `fontcolor`, `fabu_fee`, `task_fee`) VALUES ('3', '0', '黑金会员', '2', '1665803171', 'undefined', '888.00', '1176.00', '13', '1年+送1个月', '96', '80', '62', '80', '9999', '#271f11', '#ffebc5', '5', '8');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('1', '1', '上推荐费用减免', '0', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686914954.png', '减少58.0%推荐任务费');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('2', '1', '优选分区', '1', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686921631.png', '首页分区显示');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('3', '1', '自动刷新', '2', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686942557.png', '间隔最低2分钟');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('4', '1', '新手任务', '3', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686961416.png', '优先上新手任务');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('5', '1', '极速审核', '4', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686995272.png', '客服极速审核');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('6', '1', '举报优先处理', '5', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687016652.png', '纠纷专员优先处理');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('7', '1', '客服快速接入', '6', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687033274.png', '客服优先回复问题');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('8', '1', '会员标识', '7', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687053676.png', '获得平台特殊标识');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('9', '1', '佣金提升', '8', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/1666768708366.png', '佣金至少提高29%');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('10', '2', '上推荐费用减免', '0', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686914954.png', '减少68.0%推荐任务费');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('11', '2', '优选分区', '1', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686921631.png', '首页分区显示');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('12', '2', '自动刷新', '2', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686942557.png', '间隔最低1分钟');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('13', '2', '新手任务', '3', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686961416.png', '优先上新手任务');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('14', '2', '极速审核', '4', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686995272.png', '客服极速审核');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('15', '2', '举报优先处理', '5', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687016652.png', '纠纷专员优先处理');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('16', '2', '客服快速接入', '6', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687033274.png', '客服优先回复问题');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('17', '2', '会员标识', '7', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687053676.png', '获得平台特殊标识');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('18', '2', '佣金提升', '8', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/1666768708366.png', '佣金至少提高40%');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('19', '3', '上推荐费用减免', '0', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686914954.png', '减少88.0%推荐任务费');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('20', '3', '优选分区', '1', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686921631.png', '首页分区显示');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('21', '3', '自动刷新', '2', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686942557.png', '间隔最低1分钟');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('22', '3', '新手任务', '3', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686961416.png', '优先上新手任务');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('23', '3', '极速审核', '4', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667686995272.png', '客服极速审核');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('24', '3', '举报优先处理', '5', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687016652.png', '纠纷专员优先处理');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('25', '3', '客服快速接入', '6', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687033274.png', '客服优先回复问题');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('26', '3', '会员标识', '7', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667687053676.png', '获得平台特殊标识');
INSERT INTO `#@__task_member_level_equity` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`, `note`) VALUES ('27', '3', '佣金提升', '8', '0', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/1666768708366.png', '佣金至少提高50%');

DEFAULTSQL;
}
