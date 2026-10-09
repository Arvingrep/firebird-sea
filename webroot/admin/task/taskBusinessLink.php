<?php
/**
 * 管理商家中心链接
 *
 * @version        $Id: taskBusinessLink.php 2022-08-22 下午14:57:32 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2030, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskBusinessLink");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "taskBusinessLink.html";

$action = "task";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_business_link` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
	echo json_encode($results);die;

//修改分类
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_business_link` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入链接名称').'}');
		if($type == "single"){

			if($results[0]['typename'] != $typename){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__".$action."_business_link` SET `typename` = '$typename' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//分类没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}else{

			//对字符进行处理
			$typename = cn_substrR($typename,30);
			$url = cn_substrR($url,250);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_business_link` SET `typename` = '$typename', `url` = '$url' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

		}

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('链接修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改任务悬赏商家中心链接", $typename);
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
		$childArr = $dsql->getTypeList($id, $action."_business_link", 1);
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
		$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."_business_link` WHERE `id` = ".$id." AND `icon` != ''");
		$res = $dsql->dsqlOper($sql, "results");
		if($res){
			delPicFile($res[0]['icon'], "delLogo", "task");
		}
	}

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_business_link` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除任务悬赏商家中心链接", join(",", $idsArr));
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;


//更新信息分类
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action."_business_link");
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

    adminLog("导入默认数据", "任务悬赏商家链接_");
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
		'admin/task/taskBusinessLink.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_business_link"), JSON_UNESCAPED_UNICODE));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){

    global $cfg_basedomain;
    $userDomain = getUrlPath(array('service' => 'member', 'type' => 'user'));
    $busiDomain = getUrlPath(array('service' => 'member'));

    return <<<DEFAULTSQL
DELETE FROM `#@__task_business_link`;
ALTER TABLE `#@__task_business_link` AUTO_INCREMENT = 1;
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('1', '0', '资产管理', '0', '', '', '', '1665731321', '', '');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('2', '1', '发布余额', '0', '', '', '', '1665731321', '', '');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('3', '1', '保证金', '2', '', '', '', '1665731322', '', '');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('4', '0', '其他服务', '1', '', '', '', '1665731322', '', '');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('5', '2', '充值', '0', '', '', '', '1665731384', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689436100.png', '{$userDomain}/deposit.html?paytype=deposit');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('6', '2', '提现', '1', '', '', '', '1665731384', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689506564.png', '{$userDomain}/withdraw.html');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('7', '2', '明细', '2', '', '', '', '1665731384', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689568621.png', '{$userDomain}/record.html');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('8', '3', '保证金', '0', '', '', '', '1665731384', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689789449.png', '{$busiDomain}/promotion.html');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('9', '4', '会员中心', '0', '', '', '', '1665731477', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689873266.png', '/pages/packages/task/vip/vip?index=0');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('10', '4', '商家帮助', '1', '', '', '', '1665731477', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689939405.png', '{$cfg_basedomain}/help.html');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('11', '4', '邀友赚钱', '2', '', '', '', '1665731477', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/1666769000813.png', '{$userDomain}/invite.html');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('12', '1', '刷新', '1', '', '', '', '1670569653', '', '');
INSERT INTO `#@__task_business_link` (`id`, `parentid`, `typename`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `url`) VALUES ('13', '12', '购买刷新', '0', '', '', '', '1670569653', 'https://upload.ihuoniao.cn//task/logo/large/2022/10/26/16667689653508.png', '/pages/packages/task/purRefresh/purRefresh');
DEFAULTSQL;
}
