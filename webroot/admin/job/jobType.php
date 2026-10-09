<?php
/**
 * 管理职位类别
 *
 * @version        $Id: jobType.php 2014-3-16 下午22:37:05 $
 * @package        HuoNiao.Job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("jobType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobType.html";

$action = "job_type";

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

		if($typename == "") die('{"state": 101, "info": '.json_encode('请输入职位类别名').'}');
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
			clearCache("job_type", $id);
			clearCache("job_type", $id."_0");
			clearCache("job_type", $id."_1");

			adminLog("修改职位类别", $typename);
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

    include_once(HUONIAOROOT . '/api/handlers/job.class.php');
    $jobClass = new job();

    //查看该分类下所有的简历，并删除简历中的该意向职位ID
    foreach($idsArr as $tid){
        $sql = $dsql->SetQuery("SELECT `uid`, `value` FROM `#@__job_u_common` WHERE `name` = 'resume.job' AND FIND_IN_SET($tid, `value`)");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $rid = $val['id'];
                $uid = $val['uid'];
                $job = explode(',', $val['value']);

                //从现有意向中删除
                foreach($idsArr as $k => $v){
                    foreach($job as $_k => $_v){
                        if($_v == $v){
                            unset($job[$_k]);
                        }
                    }
                }

                $_job = join(',', $job);

                //简历必填项全部填完，如果所有的意向职位都被删除了，简历的必须项更新为0
                $sql = $dsql->SetQuery("UPDATE `#@__job_resume` SET `job` = '$_job' WHERE `userid` = $uid");
                $dsql->dsqlOper($sql, "update");

                //更新简历配置表的意向职位，用于同步其他所有简历
                $sql = $dsql->SetQuery("UPDATE `#@__job_u_common` SET `value`='$_job' WHERE `uid`=$uid AND `name` = 'resume.job'");
                $dsql->update($sql);

                //查询该用户的所有简历，并清除缓存
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_resume` WHERE `userid` = $uid");
                $ret = $dsql->getArr($sql);

                //重新计算默认简历完善度
                foreach($ret as $rid){
                    $jobClass->countResumeCompletion($rid);
                }

                // 清除缓存
                checkCache("job_resume_list", $ret);
                clearCache("job_resume_detail", $ret);
            }
            clearCache("job_resume_total", "key");
        }
    }

	// 清除缓存
	foreach ($idsArr as $key => $value) {
		clearCache("job_type", $value);
		clearCache("job_type", $value."_0");
		clearCache("job_type", $value."_1");
	}

	adminLog("删除职位类别", join(",", $idsArr));
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

    adminLog("导入默认数据", "招聘分类_" . $action);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/job/jobType.js'
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
        clearCache("job_type", $i);
        clearCache("job_type", $i."_1");
        clearCache("job_type", $i."_0");
    }
}

/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__job_type`;
ALTER TABLE `#@__job_type` AUTO_INCREMENT = 1;
INSERT INTO `#@__job_type` VALUES ('1', '0', '生活/服务业', '0', '1678262617');
INSERT INTO `#@__job_type` VALUES ('2', '1', '餐饮', '0', '1678262617');
INSERT INTO `#@__job_type` VALUES ('3', '2', '服务员', '0', '1678262617');
INSERT INTO `#@__job_type` VALUES ('4', '2', '送餐员', '1', '1678262617');
INSERT INTO `#@__job_type` VALUES ('5', '2', '厨师/厨师长', '2', '1678262617');
INSERT INTO `#@__job_type` VALUES ('6', '2', '后厨', '3', '1678262617');
INSERT INTO `#@__job_type` VALUES ('7', '2', '传菜员', '4', '1678262617');
INSERT INTO `#@__job_type` VALUES ('8', '2', '配菜/打荷', '5', '1678262618');
INSERT INTO `#@__job_type` VALUES ('9', '2', '洗碗工', '6', '1678262618');
INSERT INTO `#@__job_type` VALUES ('10', '2', '面点师', '7', '1678262618');
INSERT INTO `#@__job_type` VALUES ('11', '2', '茶艺师', '8', '1678262618');
INSERT INTO `#@__job_type` VALUES ('12', '2', '迎宾/接待', '9', '1678262618');
INSERT INTO `#@__job_type` VALUES ('13', '2', '大堂经理/领班', '10', '1678262618');
INSERT INTO `#@__job_type` VALUES ('14', '2', '餐饮管理', '11', '1678262618');
INSERT INTO `#@__job_type` VALUES ('15', '2', '学徒', '12', '1678262618');
INSERT INTO `#@__job_type` VALUES ('16', '2', '杂工', '13', '1678262618');
INSERT INTO `#@__job_type` VALUES ('17', '2', '咖啡师', '14', '1678262618');
INSERT INTO `#@__job_type` VALUES ('18', '2', '预订员', '15', '1678262618');
INSERT INTO `#@__job_type` VALUES ('19', '1', '家政保洁/安保', '1', '1678262618');
INSERT INTO `#@__job_type` VALUES ('20', '19', '保姆', '0', '1678262619');
INSERT INTO `#@__job_type` VALUES ('21', '19', '保洁', '1', '1678262619');
INSERT INTO `#@__job_type` VALUES ('22', '19', '月嫂', '2', '1678262619');
INSERT INTO `#@__job_type` VALUES ('23', '19', '育婴师/保育员', '3', '1678262619');
INSERT INTO `#@__job_type` VALUES ('24', '19', '洗衣工', '4', '1678262619');
INSERT INTO `#@__job_type` VALUES ('25', '19', '钟点工', '5', '1678262619');
INSERT INTO `#@__job_type` VALUES ('26', '19', '保安', '6', '1678262619');
INSERT INTO `#@__job_type` VALUES ('27', '19', '护工', '7', '1678262619');
INSERT INTO `#@__job_type` VALUES ('28', '19', '送水工', '8', '1678262619');
INSERT INTO `#@__job_type` VALUES ('29', '19', '其他', '9', '1678262619');
INSERT INTO `#@__job_type` VALUES ('30', '1', '美容/美发', '2', '1678262619');
INSERT INTO `#@__job_type` VALUES ('31', '30', '发型师', '0', '1678262619');
INSERT INTO `#@__job_type` VALUES ('32', '30', '美发助理/学徒', '1', '1678262619');
INSERT INTO `#@__job_type` VALUES ('33', '30', '洗头工', '2', '1678262619');
INSERT INTO `#@__job_type` VALUES ('34', '30', '美容导师', '3', '1678262619');
INSERT INTO `#@__job_type` VALUES ('35', '30', '美容师', '4', '1678262619');
INSERT INTO `#@__job_type` VALUES ('36', '30', '美容助理/学徒', '5', '1678262619');
INSERT INTO `#@__job_type` VALUES ('37', '30', '化妆师', '6', '1678262619');
INSERT INTO `#@__job_type` VALUES ('38', '30', '美甲师', '7', '1678262619');
INSERT INTO `#@__job_type` VALUES ('39', '30', '宠物美容', '8', '1678262619');
INSERT INTO `#@__job_type` VALUES ('40', '30', '美容店长', '9', '1678262620');
INSERT INTO `#@__job_type` VALUES ('41', '30', '美容/瘦身顾问', '10', '1678262620');
INSERT INTO `#@__job_type` VALUES ('42', '30', '彩妆培训师', '11', '1678262620');
INSERT INTO `#@__job_type` VALUES ('43', '30', '美体师', '12', '1678262620');
INSERT INTO `#@__job_type` VALUES ('44', '30', '纹身师', '13', '1678262620');
INSERT INTO `#@__job_type` VALUES ('45', '1', '旅游', '3', '1678262620');
INSERT INTO `#@__job_type` VALUES ('46', '45', '订票员', '0', '1678262620');
INSERT INTO `#@__job_type` VALUES ('47', '45', '导游', '1', '1678262620');
INSERT INTO `#@__job_type` VALUES ('48', '45', '计调', '2', '1678262620');
INSERT INTO `#@__job_type` VALUES ('49', '45', '签证专员', '3', '1678262620');
INSERT INTO `#@__job_type` VALUES ('50', '45', '旅游顾问', '4', '1678262620');
INSERT INTO `#@__job_type` VALUES ('51', '1', '娱乐/休闲', '4', '1678262620');
INSERT INTO `#@__job_type` VALUES ('52', '51', '酒吧服务员', '0', '1678262621');
INSERT INTO `#@__job_type` VALUES ('53', '51', '娱乐厅服务员', '1', '1678262621');
INSERT INTO `#@__job_type` VALUES ('54', '51', '礼仪/迎宾', '2', '1678262621');
INSERT INTO `#@__job_type` VALUES ('55', '51', '主持人', '3', '1678262621');
INSERT INTO `#@__job_type` VALUES ('56', '51', '调酒师', '4', '1678262621');
INSERT INTO `#@__job_type` VALUES ('57', '51', '音效师', '5', '1678262621');
INSERT INTO `#@__job_type` VALUES ('58', '51', '灯光师', '6', '1678262621');
INSERT INTO `#@__job_type` VALUES ('59', '51', '摄影师/摄像师', '7', '1678262621');
INSERT INTO `#@__job_type` VALUES ('60', '51', '影视/后期制作', '8', '1678262621');
INSERT INTO `#@__job_type` VALUES ('61', '51', '配音员', '9', '1678262621');
INSERT INTO `#@__job_type` VALUES ('62', '51', '放映员', '10', '1678262621');
INSERT INTO `#@__job_type` VALUES ('63', '1', '保健按摩', '5', '1678262621');
INSERT INTO `#@__job_type` VALUES ('64', '63', '按摩师', '0', '1678262621');
INSERT INTO `#@__job_type` VALUES ('65', '63', '足疗师', '1', '1678262622');
INSERT INTO `#@__job_type` VALUES ('66', '63', '搓澡工', '2', '1678262622');
INSERT INTO `#@__job_type` VALUES ('67', '63', '针灸推拿', '3', '1678262622');
INSERT INTO `#@__job_type` VALUES ('68', '1', '运动健身', '6', '1678262622');
INSERT INTO `#@__job_type` VALUES ('69', '68', '健身教练', '0', '1678262622');
INSERT INTO `#@__job_type` VALUES ('70', '68', '瑜伽教练', '1', '1678262622');
INSERT INTO `#@__job_type` VALUES ('71', '68', '舞蹈老师', '2', '1678262622');
INSERT INTO `#@__job_type` VALUES ('942', '935', '安防工程师', '6', '1678267166');
INSERT INTO `#@__job_type` VALUES ('72', '68', '游泳教练', '3', '1678262622');
INSERT INTO `#@__job_type` VALUES ('941', '935', '幕墙工程师', '5', '1678267166');
INSERT INTO `#@__job_type` VALUES ('73', '68', '台球教练', '4', '1678262622');
INSERT INTO `#@__job_type` VALUES ('940', '935', '造价师/预算师', '4', '1678267166');
INSERT INTO `#@__job_type` VALUES ('74', '68', '高尔夫球助理', '5', '1678262622');
INSERT INTO `#@__job_type` VALUES ('939', '935', '土木/土建工程师', '3', '1678267166');
INSERT INTO `#@__job_type` VALUES ('505', '0', '人力/行政/管理', '1', '1678263582');
INSERT INTO `#@__job_type` VALUES ('938', '935', '建筑工程师/总工', '2', '1678267166');
INSERT INTO `#@__job_type` VALUES ('506', '505', '人事/行政/后勤', '0', '1678263583');
INSERT INTO `#@__job_type` VALUES ('937', '935', '工程监理', '1', '1678267166');
INSERT INTO `#@__job_type` VALUES ('755', '750', '汽车电子工程师', '4', '1678265716');
INSERT INTO `#@__job_type` VALUES ('936', '935', '工程项目管理', '0', '1678267166');
INSERT INTO `#@__job_type` VALUES ('760', '750', '发动机/总装工程师', '9', '1678265716');
INSERT INTO `#@__job_type` VALUES ('935', '934', '建筑', '0', '1678267166');
INSERT INTO `#@__job_type` VALUES ('765', '750', '加油站工作员', '14', '1678265717');
INSERT INTO `#@__job_type` VALUES ('934', '0', '建筑/装修/物业/其他', '10', '1678267166');
INSERT INTO `#@__job_type` VALUES ('770', '768', '技术支持/维护', '1', '1678266107');
INSERT INTO `#@__job_type` VALUES ('933', '924', '环境绿化', '8', '1678266945');
INSERT INTO `#@__job_type` VALUES ('775', '768', '质量工程师', '6', '1678266108');
INSERT INTO `#@__job_type` VALUES ('932', '924', '水质检测员', '7', '1678266945');
INSERT INTO `#@__job_type` VALUES ('507', '506', '文员', '0', '1678263583');
INSERT INTO `#@__job_type` VALUES ('931', '924', '环保检测', '6', '1678266945');
INSERT INTO `#@__job_type` VALUES ('786', '768', '网站策划', '17', '1678266108');
INSERT INTO `#@__job_type` VALUES ('930', '924', '环保工程师', '5', '1678266945');
INSERT INTO `#@__job_type` VALUES ('508', '506', '前台/总机/接待', '1', '1678263583');
INSERT INTO `#@__job_type` VALUES ('929', '924', 'EHS管理', '4', '1678266945');
INSERT INTO `#@__job_type` VALUES ('928', '924', '环保技术', '3', '1678266945');
INSERT INTO `#@__job_type` VALUES ('868', '862', '审计专员/助理', '5', '1678266756');
INSERT INTO `#@__job_type` VALUES ('927', '924', '环境管理/保护', '2', '1678266945');
INSERT INTO `#@__job_type` VALUES ('867', '862', '出纳', '4', '1678266756');
INSERT INTO `#@__job_type` VALUES ('744', '743', '质量管理/测试经理', '0', '1678265715');
INSERT INTO `#@__job_type` VALUES ('926', '924', '环境工程技术', '1', '1678266945');
INSERT INTO `#@__job_type` VALUES ('866', '862', '财务/会计助理', '3', '1678266756');
INSERT INTO `#@__job_type` VALUES ('743', '676', '质控/安防', '4', '1678265715');
INSERT INTO `#@__job_type` VALUES ('925', '924', '污水处理工程师', '0', '1678266945');
INSERT INTO `#@__job_type` VALUES ('865', '862', '会计/会计师', '2', '1678266756');
INSERT INTO `#@__job_type` VALUES ('670', '665', '美术指导', '4', '1678265113');
INSERT INTO `#@__job_type` VALUES ('742', '733', '纸样师/车板工', '8', '1678265715');
INSERT INTO `#@__job_type` VALUES ('924', '904', '环保', '2', '1678266945');
INSERT INTO `#@__job_type` VALUES ('864', '862', '财务总监', '1', '1678266756');
INSERT INTO `#@__job_type` VALUES ('669', '665', '平面设计', '3', '1678265113');
INSERT INTO `#@__job_type` VALUES ('741', '733', '电脑放码员', '7', '1678265715');
INSERT INTO `#@__job_type` VALUES ('596', '549', '电商职位', '4', '1678264677');
INSERT INTO `#@__job_type` VALUES ('923', '919', '医疗器械研发/维修', '3', '1678266945');
INSERT INTO `#@__job_type` VALUES ('863', '862', '财务经理/主管', '0', '1678266755');
INSERT INTO `#@__job_type` VALUES ('668', '665', '家具/家居用品设计', '2', '1678265113');
INSERT INTO `#@__job_type` VALUES ('740', '733', '板房/底格出格师', '6', '1678265715');
INSERT INTO `#@__job_type` VALUES ('595', '584', '督导', '10', '1678264677');
INSERT INTO `#@__job_type` VALUES ('922', '919', '生物工程/生物制药', '2', '1678266945');
INSERT INTO `#@__job_type` VALUES ('862', '861', '财务/审计/统计', '0', '1678266755');
INSERT INTO `#@__job_type` VALUES ('667', '665', '服装设计', '1', '1678265113');
INSERT INTO `#@__job_type` VALUES ('739', '733', '食品/饮料研发/检验', '5', '1678265715');
INSERT INTO `#@__job_type` VALUES ('594', '584', '食品加工/处理', '9', '1678264677');
INSERT INTO `#@__job_type` VALUES ('921', '919', '临床研究/协调', '1', '1678266945');
INSERT INTO `#@__job_type` VALUES ('861', '0', '财会/金融/保险', '8', '1678266755');
INSERT INTO `#@__job_type` VALUES ('666', '665', '美编/美术设计', '0', '1678265113');
INSERT INTO `#@__job_type` VALUES ('738', '733', '样衣工', '4', '1678265715');
INSERT INTO `#@__job_type` VALUES ('593', '584', '品类管理', '8', '1678264677');
INSERT INTO `#@__job_type` VALUES ('920', '919', '医药研发/生产/注册', '0', '1678266945');
INSERT INTO `#@__job_type` VALUES ('860', '849', '其他培训', '10', '1678266453');
INSERT INTO `#@__job_type` VALUES ('665', '639', '美术/设计/创意', '2', '1678265113');
INSERT INTO `#@__job_type` VALUES ('737', '733', '生产管理', '3', '1678265715');
INSERT INTO `#@__job_type` VALUES ('592', '584', '奢侈品业务', '7', '1678264677');
INSERT INTO `#@__job_type` VALUES ('919', '904', '制药/生物工程', '1', '1678266945');
INSERT INTO `#@__job_type` VALUES ('859', '849', '家政服务/育婴', '9', '1678266453');
INSERT INTO `#@__job_type` VALUES ('664', '653', '企业策划', '10', '1678265113');
INSERT INTO `#@__job_type` VALUES ('736', '733', '服装打样/制版', '2', '1678265715');
INSERT INTO `#@__job_type` VALUES ('591', '584', '招商经理/主管', '6', '1678264677');
INSERT INTO `#@__job_type` VALUES ('918', '905', '宠物护理/兽医', '12', '1678266945');
INSERT INTO `#@__job_type` VALUES ('858', '849', '语言学习', '8', '1678266453');
INSERT INTO `#@__job_type` VALUES ('663', '653', '客户主管/专员', '9', '1678265113');
INSERT INTO `#@__job_type` VALUES ('735', '733', '纺织品设计师', '1', '1678265715');
INSERT INTO `#@__job_type` VALUES ('590', '584', '店长/卖场经理', '5', '1678264677');
INSERT INTO `#@__job_type` VALUES ('917', '905', '营养师', '11', '1678266945');
INSERT INTO `#@__job_type` VALUES ('857', '849', '丽人健身', '7', '1678266453');
INSERT INTO `#@__job_type` VALUES ('662', '653', '咨询经理/主管', '8', '1678265113');
INSERT INTO `#@__job_type` VALUES ('734', '733', '服装设计师', '0', '1678265715');
INSERT INTO `#@__job_type` VALUES ('589', '584', '防损员/内保', '4', '1678264677');
INSERT INTO `#@__job_type` VALUES ('916', '905', '验光师', '10', '1678266944');
INSERT INTO `#@__job_type` VALUES ('856', '849', '汽车物流', '6', '1678266453');
INSERT INTO `#@__job_type` VALUES ('661', '653', '咨询顾问', '7', '1678265113');
INSERT INTO `#@__job_type` VALUES ('733', '676', '服装/纺织/食品', '3', '1678265715');
INSERT INTO `#@__job_type` VALUES ('588', '584', '理货员/陈列员', '3', '1678264677');
INSERT INTO `#@__job_type` VALUES ('915', '905', '美容整形师', '9', '1678266944');
INSERT INTO `#@__job_type` VALUES ('855', '849', '影视表演', '5', '1678266453');
INSERT INTO `#@__job_type` VALUES ('660', '653', '婚礼策划师', '6', '1678265113');
INSERT INTO `#@__job_type` VALUES ('732', '721', '国际货运', '10', '1678265714');
INSERT INTO `#@__job_type` VALUES ('587', '584', '促销/导购员', '2', '1678264677');
INSERT INTO `#@__job_type` VALUES ('914', '905', '医药质检医疗管理', '8', '1678266944');
INSERT INTO `#@__job_type` VALUES ('854', '849', '烹饪营养', '4', '1678266453');
INSERT INTO `#@__job_type` VALUES ('659', '653', '会展策划/设计', '5', '1678265113');
INSERT INTO `#@__job_type` VALUES ('731', '721', '单证员', '9', '1678265714');
INSERT INTO `#@__job_type` VALUES ('586', '584', '收银员', '1', '1678264677');
INSERT INTO `#@__job_type` VALUES ('913', '905', '理疗师', '7', '1678266944');
INSERT INTO `#@__job_type` VALUES ('853', '849', '互联网营销与管理', '3', '1678266452');
INSERT INTO `#@__job_type` VALUES ('658', '653', '媒介策划/管理', '4', '1678265113');
INSERT INTO `#@__job_type` VALUES ('730', '721', '供应链管理', '8', '1678265714');
INSERT INTO `#@__job_type` VALUES ('585', '584', '店员/营业员', '0', '1678264677');
INSERT INTO `#@__job_type` VALUES ('912', '905', '药剂师', '6', '1678266944');
INSERT INTO `#@__job_type` VALUES ('852', '849', '设计创作', '2', '1678266452');
INSERT INTO `#@__job_type` VALUES ('657', '653', '广告创意', '3', '1678265112');
INSERT INTO `#@__job_type` VALUES ('729', '721', '装卸/搬运工', '7', '1678265714');
INSERT INTO `#@__job_type` VALUES ('584', '549', '超市/百货/零售', '3', '1678264677');
INSERT INTO `#@__job_type` VALUES ('911', '905', '导医', '5', '1678266944');
INSERT INTO `#@__job_type` VALUES ('851', '849', 'IT计算机', '1', '1678266452');
INSERT INTO `#@__job_type` VALUES ('656', '653', '广告设计/制作', '2', '1678265112');
INSERT INTO `#@__job_type` VALUES ('728', '721', '仓库经理/主管', '6', '1678265714');
INSERT INTO `#@__job_type` VALUES ('583', '576', '商务专员/经理买手', '6', '1678264677');
INSERT INTO `#@__job_type` VALUES ('910', '905', '护理主任/护士长', '4', '1678266944');
INSERT INTO `#@__job_type` VALUES ('850', '849', '金融财经', '0', '1678266452');
INSERT INTO `#@__job_type` VALUES ('655', '653', '创意指导/总监', '1', '1678265112');
INSERT INTO `#@__job_type` VALUES ('727', '721', '仓库管理员', '5', '1678265714');
INSERT INTO `#@__job_type` VALUES ('582', '576', '报关员', '5', '1678264677');
INSERT INTO `#@__job_type` VALUES ('909', '905', '护士/护理', '3', '1678266944');
INSERT INTO `#@__job_type` VALUES ('849', '809', '职业培训', '4', '1678266452');
INSERT INTO `#@__job_type` VALUES ('654', '653', '广告文案', '0', '1678265112');
INSERT INTO `#@__job_type` VALUES ('726', '721', '快递员', '4', '1678265714');
INSERT INTO `#@__job_type` VALUES ('581', '576', '采购经理/总监', '4', '1678264677');
INSERT INTO `#@__job_type` VALUES ('908', '905', '心理医生', '2', '1678266944');
INSERT INTO `#@__job_type` VALUES ('848', '841', '装订/烫金', '6', '1678266452');
INSERT INTO `#@__job_type` VALUES ('653', '639', '广告/会展/咨询', '1', '1678265112');
INSERT INTO `#@__job_type` VALUES ('725', '721', '调度员', '3', '1678265714');
INSERT INTO `#@__job_type` VALUES ('580', '576', '采购助理', '3', '1678264677');
INSERT INTO `#@__job_type` VALUES ('907', '905', '保健医生', '1', '1678266944');
INSERT INTO `#@__job_type` VALUES ('847', '841', '印刷操作', '5', '1678266452');
INSERT INTO `#@__job_type` VALUES ('652', '640', '企划经理/主管', '11', '1678265112');
INSERT INTO `#@__job_type` VALUES ('724', '721', '物流总监', '2', '1678265714');
INSERT INTO `#@__job_type` VALUES ('579', '576', '采购员', '2', '1678264676');
INSERT INTO `#@__job_type` VALUES ('906', '905', '医生', '0', '1678266944');
INSERT INTO `#@__job_type` VALUES ('846', '841', '排版设计/制作', '4', '1678266452');
INSERT INTO `#@__job_type` VALUES ('651', '640', '公关经理/主管', '10', '1678265112');
INSERT INTO `#@__job_type` VALUES ('723', '721', '物流经理/主管', '1', '1678265714');
INSERT INTO `#@__job_type` VALUES ('578', '576', '外贸经理/主管', '1', '1678264676');
INSERT INTO `#@__job_type` VALUES ('905', '904', '医院/医疗/护理', '0', '1678266944');
INSERT INTO `#@__job_type` VALUES ('845', '841', '出版/发行', '3', '1678266452');
INSERT INTO `#@__job_type` VALUES ('650', '640', '公关专员/助理', '9', '1678265112');
INSERT INTO `#@__job_type` VALUES ('722', '721', '物流专员/助理', '0', '1678265714');
INSERT INTO `#@__job_type` VALUES ('577', '576', '外贸专员/助理', '0', '1678264676');
INSERT INTO `#@__job_type` VALUES ('904', '0', '医疗/制药/环保', '9', '1678266944');
INSERT INTO `#@__job_type` VALUES ('844', '841', '记者/采编', '2', '1678266451');
INSERT INTO `#@__job_type` VALUES ('649', '640', '品牌专员/经理', '8', '1678265112');
INSERT INTO `#@__job_type` VALUES ('721', '676', '物流/仓储', '2', '1678265714');
INSERT INTO `#@__job_type` VALUES ('576', '549', '贸易/采购', '2', '1678264676');
INSERT INTO `#@__job_type` VALUES ('903', '892', '保险其他职位', '10', '1678266758');
INSERT INTO `#@__job_type` VALUES ('843', '841', '编辑/撰稿', '1', '1678266451');
INSERT INTO `#@__job_type` VALUES ('648', '640', '会务会展专员/经理', '7', '1678265112');
INSERT INTO `#@__job_type` VALUES ('720', '706', '生产主管/组长', '13', '1678265714');
INSERT INTO `#@__job_type` VALUES ('575', '569', '客户关系管理', '5', '1678264428');
INSERT INTO `#@__job_type` VALUES ('902', '892', '保险精算师', '9', '1678266758');
INSERT INTO `#@__job_type` VALUES ('842', '841', '总编/副总编/主编', '0', '1678266451');
INSERT INTO `#@__job_type` VALUES ('647', '640', '媒介经理/主管', '6', '1678265112');
INSERT INTO `#@__job_type` VALUES ('719', '706', '技术工程师', '12', '1678265714');
INSERT INTO `#@__job_type` VALUES ('574', '569', '电话客服', '4', '1678264428');
INSERT INTO `#@__job_type` VALUES ('901', '892', '保险项目经理', '8', '1678266758');
INSERT INTO `#@__job_type` VALUES ('841', '809', '编辑/出版/印刷', '3', '1678266451');
INSERT INTO `#@__job_type` VALUES ('646', '640', '媒介专员/助理', '5', '1678265112');
INSERT INTO `#@__job_type` VALUES ('718', '706', '材料工程师', '11', '1678265714');
INSERT INTO `#@__job_type` VALUES ('573', '569', '售前/售后服务', '3', '1678264428');
INSERT INTO `#@__job_type` VALUES ('900', '892', '保险经纪人', '7', '1678266758');
INSERT INTO `#@__job_type` VALUES ('840', '829', '小语种翻译', '10', '1678266451');
INSERT INTO `#@__job_type` VALUES ('645', '640', '市场策划', '4', '1678265112');
INSERT INTO `#@__job_type` VALUES ('717', '706', '工业工程师', '10', '1678265714');
INSERT INTO `#@__job_type` VALUES ('572', '569', '客服总监', '2', '1678264428');
INSERT INTO `#@__job_type` VALUES ('899', '892', '保险顾问', '6', '1678266758');
INSERT INTO `#@__job_type` VALUES ('839', '829', '阿拉伯语翻译', '9', '1678266451');
INSERT INTO `#@__job_type` VALUES ('644', '640', '市场调研', '3', '1678265112');
INSERT INTO `#@__job_type` VALUES ('716', '706', '维修工程师', '9', '1678265713');
INSERT INTO `#@__job_type` VALUES ('571', '569', '客服经理/主管', '1', '1678264427');
INSERT INTO `#@__job_type` VALUES ('898', '892', '保险客服', '5', '1678266758');
INSERT INTO `#@__job_type` VALUES ('838', '829', '葡萄牙语翻译', '8', '1678266451');
INSERT INTO `#@__job_type` VALUES ('643', '640', '市场拓展', '2', '1678265112');
INSERT INTO `#@__job_type` VALUES ('715', '706', '生产总监', '8', '1678265713');
INSERT INTO `#@__job_type` VALUES ('570', '569', '客服专员/助理', '0', '1678264427');
INSERT INTO `#@__job_type` VALUES ('897', '892', '保险培训师', '4', '1678266758');
INSERT INTO `#@__job_type` VALUES ('837', '829', '意大利语翻译', '7', '1678266451');
INSERT INTO `#@__job_type` VALUES ('642', '640', '市场经理/总监', '1', '1678265111');
INSERT INTO `#@__job_type` VALUES ('714', '706', '厂长/副厂长', '7', '1678265713');
INSERT INTO `#@__job_type` VALUES ('569', '549', '客服', '1', '1678264427');
INSERT INTO `#@__job_type` VALUES ('896', '892', '保险内勤', '3', '1678266758');
INSERT INTO `#@__job_type` VALUES ('836', '829', '西班牙语翻译', '6', '1678266451');
INSERT INTO `#@__job_type` VALUES ('641', '640', '市场专员/助理', '0', '1678265111');
INSERT INTO `#@__job_type` VALUES ('713', '706', '化验/检验', '6', '1678265713');
INSERT INTO `#@__job_type` VALUES ('568', '550', '其他', '17', '1678264360');
INSERT INTO `#@__job_type` VALUES ('895', '892', '车险专员', '2', '1678266758');
INSERT INTO `#@__job_type` VALUES ('835', '829', '德语翻译', '5', '1678266451');
INSERT INTO `#@__job_type` VALUES ('640', '639', '市场/媒介/公关', '0', '1678265111');
INSERT INTO `#@__job_type` VALUES ('712', '706', '生产计划', '5', '1678265713');
INSERT INTO `#@__job_type` VALUES ('567', '550', '经理会籍顾问', '16', '1678264334');
INSERT INTO `#@__job_type` VALUES ('894', '892', '保险客户经理', '1', '1678266758');
INSERT INTO `#@__job_type` VALUES ('834', '829', '俄语翻译', '4', '1678266451');
INSERT INTO `#@__job_type` VALUES ('639', '0', '市场/媒介/广告/设计', '4', '1678265111');
INSERT INTO `#@__job_type` VALUES ('711', '706', '车间主任', '4', '1678265713');
INSERT INTO `#@__job_type` VALUES ('566', '550', '团购业务员', '15', '1678264334');
INSERT INTO `#@__job_type` VALUES ('893', '892', '储备经理人', '0', '1678266758');
INSERT INTO `#@__job_type` VALUES ('833', '829', '法语翻译', '3', '1678266451');
INSERT INTO `#@__job_type` VALUES ('638', '616', '酒店店长', '21', '1678264889');
INSERT INTO `#@__job_type` VALUES ('710', '706', '工艺设计', '3', '1678265713');
INSERT INTO `#@__job_type` VALUES ('565', '550', '大客户经理', '14', '1678264334');
INSERT INTO `#@__job_type` VALUES ('892', '861', '保险', '2', '1678266757');
INSERT INTO `#@__job_type` VALUES ('832', '829', '韩语翻译', '2', '1678266451');
INSERT INTO `#@__job_type` VALUES ('637', '616', '总经理助理', '20', '1678264889');
INSERT INTO `#@__job_type` VALUES ('709', '706', '设备管理维护', '2', '1678265713');
INSERT INTO `#@__job_type` VALUES ('564', '550', '客户经理/主管', '13', '1678264334');
INSERT INTO `#@__job_type` VALUES ('891', '875', '股票交易员', '15', '1678266757');
INSERT INTO `#@__job_type` VALUES ('831', '829', '日语翻译', '1', '1678266450');
INSERT INTO `#@__job_type` VALUES ('636', '616', '总经理', '19', '1678264889');
INSERT INTO `#@__job_type` VALUES ('708', '706', '总工程师/副总工程师', '1', '1678265713');
INSERT INTO `#@__job_type` VALUES ('563', '550', '渠道经理/总监', '12', '1678264333');
INSERT INTO `#@__job_type` VALUES ('890', '875', '风险管理/控制', '14', '1678266757');
INSERT INTO `#@__job_type` VALUES ('830', '829', '英语翻译', '0', '1678266450');
INSERT INTO `#@__job_type` VALUES ('635', '616', '救生员', '18', '1678264889');
INSERT INTO `#@__job_type` VALUES ('707', '706', '质量管理', '0', '1678265713');
INSERT INTO `#@__job_type` VALUES ('562', '550', '渠道专员', '11', '1678264333');
INSERT INTO `#@__job_type` VALUES ('889', '875', '融资经理/总监', '13', '1678266757');
INSERT INTO `#@__job_type` VALUES ('829', '809', '翻译', '2', '1678266450');
INSERT INTO `#@__job_type` VALUES ('634', '616', '前台/接待', '17', '1678264888');
INSERT INTO `#@__job_type` VALUES ('706', '676', '生产管理/研发', '1', '1678265713');
INSERT INTO `#@__job_type` VALUES ('561', '550', '区域销售', '10', '1678264333');
INSERT INTO `#@__job_type` VALUES ('888', '875', '融资专员', '12', '1678266757');
INSERT INTO `#@__job_type` VALUES ('828', '816', '野外拓展训练师', '11', '1678266450');
INSERT INTO `#@__job_type` VALUES ('633', '616', '值班经理', '16', '1678264888');
INSERT INTO `#@__job_type` VALUES ('705', '677', '压熨工', '27', '1678265713');
INSERT INTO `#@__job_type` VALUES ('560', '550', '网络销售', '9', '1678264333');
INSERT INTO `#@__job_type` VALUES ('887', '875', '投资/理财顾问', '11', '1678266757');
INSERT INTO `#@__job_type` VALUES ('827', '816', '校长', '10', '1678266450');
INSERT INTO `#@__job_type` VALUES ('632', '616', '大堂副理', '15', '1678264888');
INSERT INTO `#@__job_type` VALUES ('704', '677', '印花工', '26', '1678265713');
INSERT INTO `#@__job_type` VALUES ('559', '550', '医疗器械销售', '8', '1678264333');
INSERT INTO `#@__job_type` VALUES ('886', '875', '外汇/基金/国债经理人', '10', '1678266757');
INSERT INTO `#@__job_type` VALUES ('826', '816', '招生/课程顾问', '9', '1678266450');
INSERT INTO `#@__job_type` VALUES ('631', '616', '前厅部员工', '14', '1678264888');
INSERT INTO `#@__job_type` VALUES ('703', '677', '纺织工', '25', '1678265713');
INSERT INTO `#@__job_type` VALUES ('558', '550', '医药代表', '7', '1678264333');
INSERT INTO `#@__job_type` VALUES ('885', '875', '拍卖师', '9', '1678266757');
INSERT INTO `#@__job_type` VALUES ('825', '816', '学术研究/科研', '8', '1678266450');
INSERT INTO `#@__job_type` VALUES ('630', '616', '宾客关系主任', '13', '1678264888');
INSERT INTO `#@__job_type` VALUES ('702', '677', '染工', '24', '1678265713');
INSERT INTO `#@__job_type` VALUES ('557', '550', '汽车销售', '6', '1678264333');
INSERT INTO `#@__job_type` VALUES ('884', '875', '担保/拍卖/典当', '8', '1678266757');
INSERT INTO `#@__job_type` VALUES ('824', '816', '教育产品开发', '7', '1678266450');
INSERT INTO `#@__job_type` VALUES ('629', '616', '礼宾经理', '12', '1678264888');
INSERT INTO `#@__job_type` VALUES ('701', '677', '样衣工', '23', '1678265713');
INSERT INTO `#@__job_type` VALUES ('556', '550', '销售支持', '5', '1678264333');
INSERT INTO `#@__job_type` VALUES ('883', '875', '资产评估', '7', '1678266757');
INSERT INTO `#@__job_type` VALUES ('823', '816', '教学/教务管理', '6', '1678266450');
INSERT INTO `#@__job_type` VALUES ('628', '616', '前台主管', '11', '1678264888');
INSERT INTO `#@__job_type` VALUES ('700', '677', '组装工', '22', '1678265713');
INSERT INTO `#@__job_type` VALUES ('555', '550', '电话销售', '4', '1678264333');
INSERT INTO `#@__job_type` VALUES ('882', '875', '信贷管理/资信评估', '6', '1678266757');
INSERT INTO `#@__job_type` VALUES ('822', '816', '培训助理', '5', '1678266450');
INSERT INTO `#@__job_type` VALUES ('627', '616', '前厅部经理', '10', '1678264888');
INSERT INTO `#@__job_type` VALUES ('699', '677', '瓦工', '21', '1678265713');
INSERT INTO `#@__job_type` VALUES ('554', '550', '销售总监', '3', '1678264333');
INSERT INTO `#@__job_type` VALUES ('881', '875', '银行会计/柜员', '5', '1678266757');
INSERT INTO `#@__job_type` VALUES ('821', '816', '培训策划', '4', '1678266450');
INSERT INTO `#@__job_type` VALUES ('626', '616', '总机员工', '9', '1678264888');
INSERT INTO `#@__job_type` VALUES ('698', '677', '管道工', '20', '1678265713');
INSERT INTO `#@__job_type` VALUES ('553', '550', '销售经理/主管', '2', '1678264333');
INSERT INTO `#@__job_type` VALUES ('880', '875', '银行经理/主任', '4', '1678266757');
INSERT INTO `#@__job_type` VALUES ('820', '816', '培训师/讲师', '3', '1678266450');
INSERT INTO `#@__job_type` VALUES ('625', '616', '总机经理', '8', '1678264888');
INSERT INTO `#@__job_type` VALUES ('697', '677', '钢筋工', '19', '1678265713');
INSERT INTO `#@__job_type` VALUES ('552', '550', '销售助理', '1', '1678264333');
INSERT INTO `#@__job_type` VALUES ('879', '875', '信用卡/银行卡业务', '3', '1678266757');
INSERT INTO `#@__job_type` VALUES ('819', '816', '幼教/早教', '2', '1678266450');
INSERT INTO `#@__job_type` VALUES ('624', '616', '预订员', '7', '1678264888');
INSERT INTO `#@__job_type` VALUES ('696', '677', '水泥工', '18', '1678265713');
INSERT INTO `#@__job_type` VALUES ('551', '550', '销售代表', '0', '1678264333');
INSERT INTO `#@__job_type` VALUES ('878', '875', '证券分析/金融研究', '2', '1678266757');
INSERT INTO `#@__job_type` VALUES ('818', '816', '家教', '1', '1678266450');
INSERT INTO `#@__job_type` VALUES ('623', '616', '预订经理', '6', '1678264888');
INSERT INTO `#@__job_type` VALUES ('695', '677', '手机维修', '17', '1678265713');
INSERT INTO `#@__job_type` VALUES ('550', '549', '销售', '0', '1678264333');
INSERT INTO `#@__job_type` VALUES ('877', '875', '证券经理/总监', '1', '1678266757');
INSERT INTO `#@__job_type` VALUES ('817', '816', '教师/助教', '0', '1678266450');
INSERT INTO `#@__job_type` VALUES ('622', '616', '客房部经理', '5', '1678264888');
INSERT INTO `#@__job_type` VALUES ('694', '677', '包装工', '16', '1678265712');
INSERT INTO `#@__job_type` VALUES ('549', '0', '销售/客服/采购/电商', '2', '1678264333');
INSERT INTO `#@__job_type` VALUES ('876', '875', '证券/期货/外汇经纪人', '0', '1678266756');
INSERT INTO `#@__job_type` VALUES ('816', '809', '教育培训', '1', '1678266450');
INSERT INTO `#@__job_type` VALUES ('621', '616', '房务部总监', '4', '1678264888');
INSERT INTO `#@__job_type` VALUES ('693', '677', '操作工', '15', '1678265712');
INSERT INTO `#@__job_type` VALUES ('548', '539', '合伙人', '8', '1678263831');
INSERT INTO `#@__job_type` VALUES ('875', '861', '金融/银行/证券/投资', '1', '1678266756');
INSERT INTO `#@__job_type` VALUES ('815', '810', '合规管理', '4', '1678266449');
INSERT INTO `#@__job_type` VALUES ('620', '616', '客房服务员', '3', '1678264888');
INSERT INTO `#@__job_type` VALUES ('692', '677', '电梯工', '14', '1678265712');
INSERT INTO `#@__job_type` VALUES ('547', '539', '分公司经理', '7', '1678263831');
INSERT INTO `#@__job_type` VALUES ('874', '862', '成本管理员', '11', '1678266756');
INSERT INTO `#@__job_type` VALUES ('814', '810', '产权/专利顾问', '3', '1678266449');
INSERT INTO `#@__job_type` VALUES ('619', '616', '公共区域经理', '2', '1678264888');
INSERT INTO `#@__job_type` VALUES ('691', '677', '铸造/注塑/模具工', '13', '1678265712');
INSERT INTO `#@__job_type` VALUES ('546', '539', '总监', '6', '1678263831');
INSERT INTO `#@__job_type` VALUES ('873', '862', '财务分析员', '10', '1678266756');
INSERT INTO `#@__job_type` VALUES ('813', '810', '法务专员/主管', '2', '1678266449');
INSERT INTO `#@__job_type` VALUES ('618', '616', '洗衣房经理', '1', '1678264888');
INSERT INTO `#@__job_type` VALUES ('690', '677', '铲车/叉车工', '12', '1678265712');
INSERT INTO `#@__job_type` VALUES ('545', '539', '总裁助理/总经理助理', '5', '1678263831');
INSERT INTO `#@__job_type` VALUES ('872', '862', '税务经理/主管', '9', '1678266756');
INSERT INTO `#@__job_type` VALUES ('812', '810', '律师助理', '1', '1678266449');
INSERT INTO `#@__job_type` VALUES ('617', '616', '楼层经理', '0', '1678264888');
INSERT INTO `#@__job_type` VALUES ('689', '677', '车工/铣工', '11', '1678265712');
INSERT INTO `#@__job_type` VALUES ('544', '539', '副总裁/副总经理', '4', '1678263831');
INSERT INTO `#@__job_type` VALUES ('871', '862', '税务专员/助理', '8', '1678266756');
INSERT INTO `#@__job_type` VALUES ('811', '810', '律师/法律顾问', '0', '1678266449');
INSERT INTO `#@__job_type` VALUES ('616', '615', '酒店', '0', '1678264888');
INSERT INTO `#@__job_type` VALUES ('688', '677', '锅炉工', '10', '1678265712');
INSERT INTO `#@__job_type` VALUES ('543', '539', '首席技术官CTO', '3', '1678263831');
INSERT INTO `#@__job_type` VALUES ('870', '862', '统计员', '7', '1678266756');
INSERT INTO `#@__job_type` VALUES ('810', '809', '法律', '0', '1678266449');
INSERT INTO `#@__job_type` VALUES ('615', '0', '酒店', '3', '1678264888');
INSERT INTO `#@__job_type` VALUES ('687', '677', '缝纫工', '9', '1678265712');
INSERT INTO `#@__job_type` VALUES ('542', '539', '首席财务官CFO', '2', '1678263831');
INSERT INTO `#@__job_type` VALUES ('869', '862', '审计经理/主管', '6', '1678266756');
INSERT INTO `#@__job_type` VALUES ('809', '0', '法律/教育/翻译/出版', '7', '1678266449');
INSERT INTO `#@__job_type` VALUES ('614', '605', '其他房产职位', '8', '1678264678');
INSERT INTO `#@__job_type` VALUES ('686', '677', '油漆工', '8', '1678265712');
INSERT INTO `#@__job_type` VALUES ('541', '539', '首席运营官COO', '1', '1678263831');
INSERT INTO `#@__job_type` VALUES ('749', '743', '安全管理', '5', '1678265715');
INSERT INTO `#@__job_type` VALUES ('808', '802', '仪器/仪表/计量', '5', '1678266110');
INSERT INTO `#@__job_type` VALUES ('613', '605', '房产开发/策划', '7', '1678264678');
INSERT INTO `#@__job_type` VALUES ('685', '677', '钣金工', '7', '1678265712');
INSERT INTO `#@__job_type` VALUES ('540', '539', 'CEO/总裁/总经理', '0', '1678263831');
INSERT INTO `#@__job_type` VALUES ('753', '750', '汽车/摩托车修理', '2', '1678265716');
INSERT INTO `#@__job_type` VALUES ('807', '802', '版图设计工程师', '4', '1678266110');
INSERT INTO `#@__job_type` VALUES ('612', '605', '房产评估师', '6', '1678264678');
INSERT INTO `#@__job_type` VALUES ('684', '677', '切割/焊工', '6', '1678265712');
INSERT INTO `#@__job_type` VALUES ('539', '505', '高级管理', '2', '1678263831');
INSERT INTO `#@__job_type` VALUES ('758', '750', '汽车美容', '7', '1678265716');
INSERT INTO `#@__job_type` VALUES ('806', '802', '测试/可靠性工程师', '3', '1678266110');
INSERT INTO `#@__job_type` VALUES ('611', '605', '房产内勤', '5', '1678264678');
INSERT INTO `#@__job_type` VALUES ('683', '677', '钳工', '5', '1678265712');
INSERT INTO `#@__job_type` VALUES ('531', '505', '司机', '1', '1678263830');
INSERT INTO `#@__job_type` VALUES ('762', '750', '理赔专员/顾问', '11', '1678265716');
INSERT INTO `#@__job_type` VALUES ('805', '802', '研发工程师', '2', '1678266110');
INSERT INTO `#@__job_type` VALUES ('610', '605', '房产客服', '4', '1678264678');
INSERT INTO `#@__job_type` VALUES ('682', '677', '木工', '4', '1678265712');
INSERT INTO `#@__job_type` VALUES ('532', '531', '商务司机', '0', '1678263830');
INSERT INTO `#@__job_type` VALUES ('767', '0', '网络/通信/电子', '6', '1678266107');
INSERT INTO `#@__job_type` VALUES ('804', '802', '机械工程师', '1', '1678266110');
INSERT INTO `#@__job_type` VALUES ('609', '605', '房产店员/助理', '3', '1678264678');
INSERT INTO `#@__job_type` VALUES ('681', '677', '电工', '3', '1678265712');
INSERT INTO `#@__job_type` VALUES ('533', '531', '客运司机', '1', '1678263830');
INSERT INTO `#@__job_type` VALUES ('773', '768', '程序员', '4', '1678266107');
INSERT INTO `#@__job_type` VALUES ('803', '802', '机电工程师', '0', '1678266110');
INSERT INTO `#@__job_type` VALUES ('608', '605', '房产店长/经理', '2', '1678264678');
INSERT INTO `#@__job_type` VALUES ('680', '677', '制冷/水暖工', '2', '1678265712');
INSERT INTO `#@__job_type` VALUES ('534', '531', '货运司机', '2', '1678263831');
INSERT INTO `#@__job_type` VALUES ('778', '768', '数据库管理/DBA', '9', '1678266108');
INSERT INTO `#@__job_type` VALUES ('802', '767', '机械/仪器仪表', '2', '1678266110');
INSERT INTO `#@__job_type` VALUES ('607', '605', '置业顾问', '1', '1678264678');
INSERT INTO `#@__job_type` VALUES ('679', '677', '综合维修工', '1', '1678265712');
INSERT INTO `#@__job_type` VALUES ('535', '531', '出租车司机', '3', '1678263831');
INSERT INTO `#@__job_type` VALUES ('780', '768', '网页设计/制作', '11', '1678266108');
INSERT INTO `#@__job_type` VALUES ('801', '791', '电子/电器维修', '9', '1678266109');
INSERT INTO `#@__job_type` VALUES ('606', '605', '房产经纪人', '0', '1678264678');
INSERT INTO `#@__job_type` VALUES ('678', '677', '普工', '0', '1678265712');
INSERT INTO `#@__job_type` VALUES ('536', '531', '班车司机', '4', '1678263831');
INSERT INTO `#@__job_type` VALUES ('787', '768', '网络管理员', '18', '1678266108');
INSERT INTO `#@__job_type` VALUES ('800', '791', '研发工程师', '8', '1678266109');
INSERT INTO `#@__job_type` VALUES ('605', '549', '房产中介', '5', '1678264678');
INSERT INTO `#@__job_type` VALUES ('677', '676', '普工/技工', '0', '1678265712');
INSERT INTO `#@__job_type` VALUES ('537', '531', '特种车司机', '5', '1678263831');
INSERT INTO `#@__job_type` VALUES ('791', '767', '电子/电气', '1', '1678266109');
INSERT INTO `#@__job_type` VALUES ('799', '791', '灯光/照明设计工程师', '7', '1678266109');
INSERT INTO `#@__job_type` VALUES ('604', '596', '其他', '7', '1678264678');
INSERT INTO `#@__job_type` VALUES ('676', '0', '生产/物流/质控/汽车', '5', '1678265712');
INSERT INTO `#@__job_type` VALUES ('538', '531', '驾校教练/陪练', '6', '1678263831');
INSERT INTO `#@__job_type` VALUES ('798', '791', '音频/视频工程师', '6', '1678266109');
INSERT INTO `#@__job_type` VALUES ('603', '596', '视频主播', '6', '1678264678');
INSERT INTO `#@__job_type` VALUES ('675', '665', 'CAD设计/制图', '9', '1678265113');
INSERT INTO `#@__job_type` VALUES ('522', '506', '招聘经理/主管', '15', '1678263583');
INSERT INTO `#@__job_type` VALUES ('797', '791', '产品工艺/规划工程师', '5', '1678266109');
INSERT INTO `#@__job_type` VALUES ('602', '596', '活动策划', '5', '1678264677');
INSERT INTO `#@__job_type` VALUES ('674', '665', '装修装潢设计', '8', '1678265113');
INSERT INTO `#@__job_type` VALUES ('521', '506', '招聘专员/助理', '14', '1678263583');
INSERT INTO `#@__job_type` VALUES ('796', '791', '测试/可靠性工程师', '4', '1678266109');
INSERT INTO `#@__job_type` VALUES ('601', '596', '店铺推广', '4', '1678264677');
INSERT INTO `#@__job_type` VALUES ('673', '665', '产品/包装设计', '7', '1678265113');
INSERT INTO `#@__job_type` VALUES ('520', '506', '培训经理/主管', '13', '1678263583');
INSERT INTO `#@__job_type` VALUES ('795', '791', '无线电工程师', '3', '1678266109');
INSERT INTO `#@__job_type` VALUES ('600', '596', '店铺文案编辑', '3', '1678264677');
INSERT INTO `#@__job_type` VALUES ('672', '665', '多媒体/动画设计', '6', '1678265113');
INSERT INTO `#@__job_type` VALUES ('519', '506', '培训专员/助理', '12', '1678263583');
INSERT INTO `#@__job_type` VALUES ('745', '743', '质量检验员/测试员', '1', '1678265715');
INSERT INTO `#@__job_type` VALUES ('599', '596', '电商美工', '2', '1678264677');
INSERT INTO `#@__job_type` VALUES ('671', '665', '店面/陈列/展览设计工艺/珠宝设计', '5', '1678265113');
INSERT INTO `#@__job_type` VALUES ('518', '506', '后勤', '11', '1678263583');
INSERT INTO `#@__job_type` VALUES ('750', '676', '汽车制造/服务', '5', '1678265715');
INSERT INTO `#@__job_type` VALUES ('598', '596', '电商客服', '1', '1678264677');
INSERT INTO `#@__job_type` VALUES ('746', '743', '测试工程师', '2', '1678265715');
INSERT INTO `#@__job_type` VALUES ('517', '506', '猎头顾问', '10', '1678263583');
INSERT INTO `#@__job_type` VALUES ('509', '506', '人事专员/助理', '2', '1678263583');
INSERT INTO `#@__job_type` VALUES ('597', '596', '网店店长', '0', '1678264677');
INSERT INTO `#@__job_type` VALUES ('751', '750', '汽车设计工程师', '0', '1678265716');
INSERT INTO `#@__job_type` VALUES ('516', '506', '薪酬/绩效/员工关系', '9', '1678263583');
INSERT INTO `#@__job_type` VALUES ('510', '506', '人事经理/主管', '3', '1678263583');
INSERT INTO `#@__job_type` VALUES ('747', '743', '安全消防', '3', '1678265715');
INSERT INTO `#@__job_type` VALUES ('756', '750', '4S店管理', '5', '1678265716');
INSERT INTO `#@__job_type` VALUES ('515', '506', '经理助理/秘书', '8', '1678263583');
INSERT INTO `#@__job_type` VALUES ('769', '768', '技术总监/经理', '0', '1678266107');
INSERT INTO `#@__job_type` VALUES ('754', '750', '汽车机械工程师', '3', '1678265716');
INSERT INTO `#@__job_type` VALUES ('763', '750', '洗车工', '12', '1678265716');
INSERT INTO `#@__job_type` VALUES ('748', '743', '认证工程师/审核员', '4', '1678265715');
INSERT INTO `#@__job_type` VALUES ('511', '506', '人事总监', '4', '1678263583');
INSERT INTO `#@__job_type` VALUES ('757', '750', '汽车检验/检测', '6', '1678265716');
INSERT INTO `#@__job_type` VALUES ('766', '750', '轮胎工', '15', '1678265717');
INSERT INTO `#@__job_type` VALUES ('752', '750', '装配工艺工程师', '1', '1678265716');
INSERT INTO `#@__job_type` VALUES ('777', '768', '系统架构师', '8', '1678266108');
INSERT INTO `#@__job_type` VALUES ('761', '750', '安全性能工程师', '10', '1678265716');
INSERT INTO `#@__job_type` VALUES ('771', '768', '技术专员/助理', '2', '1678266107');
INSERT INTO `#@__job_type` VALUES ('759', '750', '二手车评估师', '8', '1678265716');
INSERT INTO `#@__job_type` VALUES ('783', '768', '产品经理/专员', '14', '1678266108');
INSERT INTO `#@__job_type` VALUES ('512', '506', '行政专员/助理', '5', '1678263583');
INSERT INTO `#@__job_type` VALUES ('779', '768', '游戏设计/开发', '10', '1678266108');
INSERT INTO `#@__job_type` VALUES ('764', '750', '停车管理员', '13', '1678265717');
INSERT INTO `#@__job_type` VALUES ('785', '768', '网站编辑', '16', '1678266108');
INSERT INTO `#@__job_type` VALUES ('774', '768', '硬件工程师', '5', '1678266108');
INSERT INTO `#@__job_type` VALUES ('781', '768', '语音/视频/图形', '12', '1678266108');
INSERT INTO `#@__job_type` VALUES ('768', '767', '计算机/互联网/通信', '0', '1678266107');
INSERT INTO `#@__job_type` VALUES ('790', '768', '通信技术工程师', '21', '1678266109');
INSERT INTO `#@__job_type` VALUES ('513', '506', '行政经理/主管', '6', '1678263583');
INSERT INTO `#@__job_type` VALUES ('514', '506', '行政总监', '7', '1678263583');
INSERT INTO `#@__job_type` VALUES ('772', '768', '软件工程师', '3', '1678266107');
INSERT INTO `#@__job_type` VALUES ('782', '768', '项目经理/主管', '13', '1678266108');
INSERT INTO `#@__job_type` VALUES ('792', '791', '自动化工程师', '0', '1678266109');
INSERT INTO `#@__job_type` VALUES ('776', '768', '测试工程师', '7', '1678266108');
INSERT INTO `#@__job_type` VALUES ('788', '768', '网络与信息安全工程师', '19', '1678266108');
INSERT INTO `#@__job_type` VALUES ('784', '768', '网站运营', '15', '1678266108');
INSERT INTO `#@__job_type` VALUES ('793', '791', '电子/电气工程师', '1', '1678266109');
INSERT INTO `#@__job_type` VALUES ('789', '768', '实施工程师', '20', '1678266108');
INSERT INTO `#@__job_type` VALUES ('794', '791', '电路工程师/技术员', '2', '1678266109');
INSERT INTO `#@__job_type` VALUES ('943', '935', '安全管理/安全员', '7', '1678267166');
INSERT INTO `#@__job_type` VALUES ('944', '935', '道路桥梁技术', '8', '1678267167');
INSERT INTO `#@__job_type` VALUES ('945', '935', '给排水/制冷/暖通', '9', '1678267167');
INSERT INTO `#@__job_type` VALUES ('946', '935', '测绘/测量', '10', '1678267167');
INSERT INTO `#@__job_type` VALUES ('947', '935', '园林/景观设计', '11', '1678267167');
INSERT INTO `#@__job_type` VALUES ('948', '935', '资料员', '12', '1678267167');
INSERT INTO `#@__job_type` VALUES ('949', '935', '市政工程师', '13', '1678267167');
INSERT INTO `#@__job_type` VALUES ('950', '935', '综合布线/弱电', '14', '1678267167');
INSERT INTO `#@__job_type` VALUES ('951', '934', '物业管理', '1', '1678267167');
INSERT INTO `#@__job_type` VALUES ('952', '951', '物业管理员', '0', '1678267167');
INSERT INTO `#@__job_type` VALUES ('953', '951', '物业维修', '1', '1678267167');
INSERT INTO `#@__job_type` VALUES ('954', '951', '物业经理/主管', '2', '1678267167');
INSERT INTO `#@__job_type` VALUES ('955', '951', '合同管理', '3', '1678267167');
INSERT INTO `#@__job_type` VALUES ('956', '951', '招商经理/主管', '4', '1678267167');
INSERT INTO `#@__job_type` VALUES ('957', '934', '农/林/牧/渔业', '2', '1678267167');
INSERT INTO `#@__job_type` VALUES ('958', '957', '饲料业务', '0', '1678267167');
INSERT INTO `#@__job_type` VALUES ('959', '957', '养殖人员', '1', '1678267168');
INSERT INTO `#@__job_type` VALUES ('960', '957', '农艺师/花艺师', '2', '1678267168');
INSERT INTO `#@__job_type` VALUES ('961', '957', '畜牧师', '3', '1678267168');
INSERT INTO `#@__job_type` VALUES ('962', '957', '场长', '4', '1678267168');
INSERT INTO `#@__job_type` VALUES ('963', '957', '养殖部主管', '5', '1678267168');
INSERT INTO `#@__job_type` VALUES ('964', '957', '动物营养/饲料研发', '6', '1678267168');
INSERT INTO `#@__job_type` VALUES ('965', '934', '其他招聘信息', '3', '1678267168');
INSERT INTO `#@__job_type` VALUES ('966', '965', '其他职位', '0', '1678267168');
DEFAULTSQL;
}