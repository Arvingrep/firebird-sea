<?php
/**
 * 管理招聘行业类别
 *
 * @version        $Id: jobIndustry.php 2014-3-16 下午22:51:18 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobIndustry");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobIndustry.html";

$action = "job_industry";

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

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入行业分类名').'}');
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
			// 更新缓存
			clearCache("job_industry", $id);
			clearCache("job_industry", $id."_0");
			clearCache("job_industry", $id."_1");
			
			adminLog("修改招聘行业类别", $typename);
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

	$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` in (".join(",", $idsArr).")");
	$dsql->dsqlOper($archives, "update");

	// 清除缓存
	foreach ($idsArr as $key => $value) {
		clearCache("job_industry", $value);
		clearCache("job_industry", $value."_0");
		clearCache("job_industry", $value."_1");
	}

	adminLog("删除招聘行业类别", join(",", $idsArr));
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');


//更新
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	$json = typeAjax($json, 0, $action);

	// 清除缓存
	clearTypeCache();

	echo $json;
	die;
}else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "招聘行业_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/job/jobIndustry.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

function clearTypeCache(){
    for($i = 0; $i < 400; $i++){
        clearCache("job_industry", $i);
        clearCache("job_industry", $i."_1");
        clearCache("job_industry", $i."_0");
    }
}

/**
 * 获取默认数据
 */
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__job_industry`;
ALTER TABLE `#@__job_industry` AUTO_INCREMENT = 1;
INSERT INTO `#@__job_industry` VALUES ('1', '0', '计算机/互联网/通信/电子', '0', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('2', '1', '计算机软件', '0', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('3', '1', '计算机硬件', '1', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('4', '1', '计算机服务(系统、数据服务、维修)', '2', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('5', '1', '通信/电信/网络设备', '3', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('6', '1', '通信/电信运营、增值服务', '4', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('7', '1', '互联网/电子商务', '5', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('8', '1', '网络游戏', '6', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('9', '1', '电子技术/半导体/集成电路', '7', '1678262172');
INSERT INTO `#@__job_industry` VALUES ('10', '1', '仪器仪表/工业自动化', '8', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('11', '0', '会计/金融/银行/保险', '1', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('12', '11', '会计/审计', '0', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('13', '11', '金融/投资/证券', '1', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('14', '11', '银行', '2', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('15', '11', '保险', '3', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('16', '11', '信托/担保/拍卖/典当', '4', '1678262173');
INSERT INTO `#@__job_industry` VALUES ('17', '0', '贸易/消费/制造/营运', '2', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('18', '17', '贸易/进出口', '0', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('19', '17', '批发/零售', '1', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('20', '17', '快速消费品(食品、饮料、化妆品)', '2', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('21', '17', '服装/纺织/皮革', '3', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('22', '17', '家具/家电/玩具/礼品', '4', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('23', '17', '奢侈品/收藏品/工艺品/珠宝', '5', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('24', '17', '办公用品及设备', '6', '1678262238');
INSERT INTO `#@__job_industry` VALUES ('25', '17', '机械/设备/重工', '7', '1678262239');
INSERT INTO `#@__job_industry` VALUES ('26', '17', '汽车', '8', '1678262239');
INSERT INTO `#@__job_industry` VALUES ('27', '17', '汽车零配件', '9', '1678262239');
INSERT INTO `#@__job_industry` VALUES ('28', '0', '制药/医疗', '3', '1678262258');
INSERT INTO `#@__job_industry` VALUES ('29', '28', '制药/生物工程', '0', '1678262258');
INSERT INTO `#@__job_industry` VALUES ('30', '28', '医疗/护理/卫生', '1', '1678262258');
INSERT INTO `#@__job_industry` VALUES ('31', '28', '医疗设备/器械', '2', '1678262258');
INSERT INTO `#@__job_industry` VALUES ('32', '0', '广告/媒体', '4', '1678262285');
INSERT INTO `#@__job_industry` VALUES ('33', '32', '广告', '0', '1678262285');
INSERT INTO `#@__job_industry` VALUES ('34', '32', '公关/市场推广/会展', '1', '1678262285');
INSERT INTO `#@__job_industry` VALUES ('35', '32', '影视/媒体/艺术/文化传播', '2', '1678262285');
INSERT INTO `#@__job_industry` VALUES ('36', '32', '文字媒体/出版', '3', '1678262285');
INSERT INTO `#@__job_industry` VALUES ('37', '32', '印刷/包装/造纸', '4', '1678262286');
INSERT INTO `#@__job_industry` VALUES ('38', '0', '房地产/建筑', '5', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('39', '38', '房地产', '0', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('40', '38', '建筑/建材/工程', '1', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('41', '38', '家居/室内设计/装潢', '2', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('42', '38', '物业管理/商业中心', '3', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('43', '38', '中介服务', '4', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('44', '38', '租赁服务', '5', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('45', '0', '专业服务/教育/培训', '6', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('46', '45', '专业服务(咨询、人力资源、财会)', '0', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('47', '45', '会) 外包服务', '1', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('48', '45', '检测，认证', '2', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('49', '45', '法律', '3', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('50', '45', '教育/培训/院校', '4', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('51', '45', '学术/科研', '5', '1678262351');
INSERT INTO `#@__job_industry` VALUES ('52', '0', '服务业', '7', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('53', '52', '餐饮业', '0', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('54', '52', '酒店/旅游', '1', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('55', '52', '娱乐/休闲/体育', '2', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('56', '52', '美容/保健', '3', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('57', '52', '生活服务', '4', '1678262657');
INSERT INTO `#@__job_industry` VALUES ('58', '0', '物流/运输', '8', '1678262678');
INSERT INTO `#@__job_industry` VALUES ('59', '58', '交通/运输/物流', '0', '1678262678');
INSERT INTO `#@__job_industry` VALUES ('60', '58', '航天/航空', '1', '1678262678');
INSERT INTO `#@__job_industry` VALUES ('61', '0', '能源/环保/化工', '9', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('62', '61', '石油/化工/矿产/地质', '0', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('63', '61', '采掘业/冶炼', '1', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('64', '61', '电气/电力/水利', '2', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('65', '61', '新能源', '3', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('66', '61', '原材料和加工', '4', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('67', '61', '环保', '5', '1678262712');
INSERT INTO `#@__job_industry` VALUES ('68', '0', '政府/非营利组织/其他', '10', '1678262737');
INSERT INTO `#@__job_industry` VALUES ('69', '68', '政府/公共事业', '0', '1678262737');
INSERT INTO `#@__job_industry` VALUES ('70', '68', '非营利组织', '1', '1678262737');
INSERT INTO `#@__job_industry` VALUES ('71', '68', '农/林/牧/渔', '2', '1678262737');
INSERT INTO `#@__job_industry` VALUES ('72', '68', '多元化业务集团公司', '3', '1678262737');
DEFAULTSQL;
}