<?php
/**
 * 招聘频道字段管理
 *
 * @version        $Id: jobItem.php 2014-3-16 下午23:02:14 $
 * @package        HuoNiao.job
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/job";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "jobItem.html";

$tab    = "jobitem";
checkPurview("jobItem");

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
				// 更新缓存
				clearCache("job_item", $id);
				clearCache("job_item_all", $id);

				adminLog("修改招聘字段", $typename);
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

			// 清除缓存
			clearCache("job_item", $id);
			clearCache("job_item_all", $id);

			adminLog($oper."招聘字段", $title);
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

		// 清除缓存
		clearTypeCache();

		echo $json;	
	}
	die;
}else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $sqls =  getDefaultSql();
    $sqls = explode(";",$sqls);
    foreach ($sqls as $sqlItem){
        $sqlItem = $dsql::SetQuery($sqlItem);
        $dsql->update($sqlItem);
    }

    adminLog("导入默认数据", "招聘字段_" . $tab);
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
        'ui/jquery.ajaxFileUpload.js',
		'admin/job/jobItem.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('huoniaoroot', HUONIAOROOT);
	
	$huoniaoTag->assign('typeListArr', json_encode(getItemTypeList(0, $tab)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/job";  //设置编译目录
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
		$icon = $json[$i]["icon"] == 'undefined' ? '' : $json[$i]["icon"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`parentid`, `typename`, `weight`, `pubdate`,`icon`) VALUES ('$pid', '$name', '$i', '".GetMkTime(time())."','$icon')");
			$id = $dsql->dsqlOper($archives, "lastid");
			adminLog("添加招聘字段", $model."=>".$name);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `typename`, `weight`, `parentid`,`icon` FROM `#@__".$tab."` WHERE `id` = ".$id);
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

					//验证图标
                    if($results[0]['icon'] != $icon){
                        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `icon` = '$icon' WHERE `id` = ".$id);
                        $results = $dsql->dsqlOper($archives, "update");
                    }
					adminLog("修改招聘字段", $model."=>".$id);
				}else{
                    //验证图标
                    if($results[0]['icon'] != $icon){
                        $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `icon` = '$icon' WHERE `id` = ".$id);
                        $results = $dsql->dsqlOper($archives, "update");
                    }
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
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename`,`icon` FROM `#@__".$tab."` WHERE `parentid` = $id and `id`!=4 ORDER BY `weight`");
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


function clearTypeCache(){
    for($i = 1; $i < 400; $i++){
        clearCache("job_item", $i);
        clearCache("job_item_all", $i);
    }
}

function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__jobitem`;
ALTER TABLE `#@__jobitem` AUTO_INCREMENT = 1;
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (1, 0, '工作经验', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (2, 0, '职位学历', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (4, 0, '到岗时间', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (5, 0, '公司性质', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (162, 1, '>=8', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (161, 1, '6-7', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (160, 1, '3-5', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (159, 1, '1-2', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (158, 1, '<=1', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (7, 0, '公司福利', 7, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (6, 0, '公司规模', 6, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (164, 6, '1 - 49人', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (165, 5, '中外合营(合资．合作)', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (166, 7, '五险一金', 0, 0, '/static/images/job/welfare_icon/wuxianyijin.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (167, 7, '定期体检', 1, 0, '/static/images/job/welfare_icon/dingqitijian.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (168, 7, '员工旅游', 2, 0, '/static/images/job/welfare_icon/yuangonglvyou.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (169, 7, '证书补贴', 3, 0, '/static/images/job/welfare_icon/zhengshubutie.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (170, 7, '餐补', 4, 0, '/static/images/job/welfare_icon/canbu.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (171, 7, '包吃', 5, 0, '/static/images/job/welfare_icon/baochi.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (172, 7, '年终奖', 6, 0, '/static/images/job/welfare_icon/nianzhongjiang.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (173, 7, '带薪年假', 7, 0, '/static/images/job/welfare_icon/daixinnianjia.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (174, 7, '通讯补贴', 8, 0, '/static/images/job/welfare_icon/tongxunbutie.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (175, 7, '交通补助', 9, 0, '/static/images/job/welfare_icon/jiaotongbuzhu.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (176, 7, '全勤奖', 10, 0, '/static/images/job/welfare_icon/quanqinjiang.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (177, 7, '出差补贴', 11, 0, '/static/images/job/welfare_icon/chuchaibutie.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (178, 7, '出国机会', 12, 0, '/static/images/job/welfare_icon/chuguojihui.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (179, 7, '住房补贴', 13, 0, '/static/images/job/welfare_icon/zhufangbutie.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (180, 7, '加班补贴', 14, 0, '/static/images/job/welfare_icon/jiabanbutie.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (275, 7, '团队聚餐', 14, 0, '/static/images/job/welfare_icon/tuanduijucan.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (276, 7, '健身房', 14, 0, '/static/images/job/welfare_icon/jianshenfang.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (277, 7, '下午茶', 14, 0, '/static/images/job/welfare_icon/xiawucha.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (278, 7, '节日福利', 14, 0, '/static/images/job/welfare_icon/jierifuli.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (279, 7, '每年调薪', 14, 0, '/static/images/job/welfare_icon/meiniantiaoxin.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (280, 7, '免费班车', 14, 0, '/static/images/job/welfare_icon/mianfeibanche.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (281, 7, '季度奖金', 14, 0, '/static/images/job/welfare_icon/jidujiangjin.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (282, 7, '包住', 14, 0, '/static/images/job/welfare_icon/baozhu.png');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (181, 5, '外商独资．外企办事处', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (182, 5, '股份制企业', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (183, 5, '国内上市公司', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (184, 5, '私营．民营企业', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (185, 5, '国有企业', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (186, 5, '政府机关/非营利机构', 6, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (187, 5, '事业单位', 7, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (188, 5, '其他', 8, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (189, 6, '50 - 99人', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (190, 6, '100 - 499人', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (191, 6, '500 - 999人', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (192, 6, '1000人以上', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (193, 4, '1周以内', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (194, 4, '2周以内', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (195, 4, '3周以内', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (196, 4, '1月以内', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (207, 2, '高中及以下', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (208, 2, '中专/职高', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (209, 2, '大专', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (210, 2, '本科', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (211, 2, '硕士', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (212, 2, 'MBA', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (213, 2, '博士', 6, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (8, 0, '属性', 8, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (214, 8, '推荐', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (250, 0, '普工学历', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (216, 8, '紧急', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (259, 257, '餐补', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (258, 257, '加班补贴', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (257, 0, '普工福利', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (256, 250, '本科', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (255, 250, '大专', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (254, 250, '中专', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (253, 250, '高中', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (12, 0, '个人优势', 12, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (231, 12, '海归', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (232, 12, '项目主管', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (233, 12, '高管', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (234, 12, '高级工程师', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (235, 12, '创业经历', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (236, 12, '独立项目经验', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (238, 13, '周末双休', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (13, 0, '职位标签', 13, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (239, 13, '公司配车', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (240, 13, '可兼职', 2, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (241, 13, '带薪培训', 3, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (242, 13, '居家办公', 4, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (243, 13, '线上面试', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (244, 13, '英语六级', 6, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (245, 13, '管理经验', 7, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (246, 13, '薪资可谈', 8, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (247, 13, '接收应届生', 9, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (252, 250, '初中', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (251, 250, '小学', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (260, 257, '五险一金', 5, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (261, 257, '定期体检', 6, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (262, 257, '交通补贴', 7, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (263, 257, '通讯补贴', 8, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (264, 257, '带薪年假', 9, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (265, 257, '年度旅游', 10, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (272, 257, '包吃', 0, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (273, 257, '包住', 1, 0, '');
INSERT INTO `#@__jobitem` (`id`, `parentid`, `typename`, `weight`, `pubdate`, `icon`) VALUES (274, 257, '免费班车', 2, 0, '');
DELETE FROM `#@__job_int_static_dict`;
ALTER TABLE `#@__job_int_static_dict` AUTO_INCREMENT = 1;
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('1', 'identify', '1', '职场人士');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('2', 'identify', '2', '学生');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('3', 'jobNature', '1', '全职');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('4', 'jobNature', '2', '兼职');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('5', 'jobNature', '3', '实习/校招');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('6', 'jobNature', '4', '假期工');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('7', 'workState', '1', '离职，正在找工作');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('8', 'workState', '2', '在职，正在找工作');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('9', 'workState', '3', '在职，看看新机会');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('10', 'workState', '4', '在职，暂不找工作');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('11', 'workState', '5', '应届毕业生');
INSERT INTO `#@__job_int_static_dict` (`id`, `name`, `value`, `zh`) VALUES ('12', 'workState', '6', '在校生');
DEFAULTSQL;
}
