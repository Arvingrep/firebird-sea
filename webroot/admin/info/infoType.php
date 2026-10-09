<?php
/**
 * 管理信息分类
 *
 * @version        $Id: infoType.php 2013-11-6 上午11:06:10 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("infoType");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoType.html";

$action = "info";

//获取指定ID信息详情
if($dopost == "getTypeDetail"){
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."type` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//修改分类
}else if($dopost == "updateType") {
    checkPurview("editInfoType");

    if ($id != "") {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $action . "type` WHERE `id` = " . $id);
        $results = $dsql->dsqlOper($archives, "results");

        if (!empty($results)) {

            if ($typename == "") die('{"state": 101, "info": ' . json_encode('请输入分类名') . '}');
            if ($type == "single") {

                if ($results[0]['typename'] != $typename) {

                    //保存到主表
                    $archives = $dsql->SetQuery("UPDATE `#@__" . $action . "type` SET `typename` = '$typename' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");

                } else {
                    //分类没有变化
                    echo '{"state": 101, "info": ' . json_encode('无变化！') . '}';
                    die;
                }

            } else {

                //对字符进行处理
                $typename = cn_substrR($typename, 30);
                $seotitle = cn_substrR($seotitle, 80);
                $keywords = cn_substrR($keywords, 60);
                $description = cn_substrR($description, 150);
                $redirect = cn_substrR($redirect, 250);
                $style = (int)$style;
                $searchall = (int)$searchall;
                $freecall = (int)$freecall;
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__" . $action . "type` SET `parentid` = '$parentid', `typename` = '$typename', `seotitle` = '$seotitle', `keywords` = '$keywords', `description` = '$description', `redirect` = '$redirect', `style` = '$style', `searchall` = '$searchall', `freecall` = '$freecall' WHERE `id` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");

            }

            if ($results != "ok") {
                echo '{"state": 101, "info": ' . json_encode('分类修改失败，请重试！') . '}';
                exit();
            } else {
                adminLog("修改分类信息分类", $typename);

                // 清除缓存
                clearCache($action . "type_par", $id);
                clearCache($action . "_type", $id);

                echo '{"state": 100, "info": ' . json_encode('修改成功！') . '}';
                exit();
            }

        } else {
            echo '{"state": 101, "info": ' . json_encode('要修改的信息不存在或已删除！') . '}';
            die;
        }
    }
    die;
}elseif($dopost == 'manageType'){
    $archives = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `tid`= '$tid'  ORDER BY `weight` ASC, `id` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $types = array();
    if($results){
        foreach($results as $key => $val){
            $types[$key]['id'] = $val['id'];
            $types[$key]['val'] = $val['name'];
        }
    }
    echo json_encode($types);
    die;
//修改特色
}elseif($dopost == "saveManageType"){
    $data = str_replace("\\", '', $_POST['data']);
    if($data == "") die;
    $json = json_decode($data);

    $json = objtoarr($json);
    foreach($json as $key => $val){
        if($val['id'] != ""){
            $archives = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `id` = ".$val['id']);
            $results = $dsql->dsqlOper($archives, "results");
            if($results){
                $where = array();
                if($results[0]['weight'] != $val['weight']){
                    $where[] = '`weight` = '.$val['weight'];
                }
                if($results[0]['name'] != $val['val']){
                    $where[] = '`name` = "'.$val['val'].'"';
                }
                if($results[0]['tid'] != $val['tid']){
                    $where[] = '`tid` = "'.$val['tid'].'"';
                }
                if(!empty($where)){
                    $archives = $dsql->SetQuery("UPDATE `#@__infoitemtype` SET ".join(",", $where)." WHERE `id` = ".$val['id']);
                    $dsql->dsqlOper($archives, "update");
                }
            }
        }else{
            if(!empty($val['val'])){
                $archives = $dsql->SetQuery("INSERT INTO `#@__infoitemtype` (`name`, `weight`,`tid`) VALUES ('".$val['val']."', ".$val['weight'].", ".$val['tid'].")");
                $dsql->dsqlOper($archives, "update");
            }
        }
    }
    $appstypeList = array();
    array_push($appstypeList, array("id" => 0, "name" => "请选择"));
    $archives = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` ORDER BY `weight` ASC, `id` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    if($results){
        foreach($results as $key => $val){
            array_push($appstypeList, $val);
        }
    }
    echo json_encode($appstypeList);
    die;
	
//删除特色
}elseif($dopost == "delManageType"){
		
	$archives = $dsql->SetQuery("DELETE FROM `#@__infoitemtype` WHERE `id` in (".$id.")");
	$dsql->dsqlOper($archives, "update");
	adminLog("删除分类信息分类特色", $id);
	echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
	die;

//删除分类
}else if($dopost == "del"){
	checkPurview("delInfoType");

	if($id != ""){

		$idsArr = array();
		$idexp = explode(",", $id);

		//获取所有子级
		foreach ($idexp as $k => $id) {
			$childArr = $dsql->getTypeList($id, $action."type", 1);
			if(is_array($childArr)){
				global $data;
				$data = "";
				$idsArr = array_merge($idsArr, array_reverse(parent_foreach($childArr, "id")));
			}
			$idsArr[] = $id;
		}

		//删除分类下的信息
		foreach ($idsArr as $kk => $id) {

			//删除分类图标
			$sql = $dsql->SetQuery("SELECT `icon` FROM `#@__".$action."type` WHERE `id` = ".$id." AND `icon` != ''");
			$res = $dsql->dsqlOper($sql, "results");
			if($res){
				delPicFile($res[0]['icon'], "delAdv", "info");
			}

			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."list` WHERE `typeid` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(count($results) > 0){
				$idList = array();
				foreach($results as $key => $val){
					//删除评论
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."common` WHERE `aid` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");

					$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除缩略图
					delPicFile($results[0]['litpic'], "delThumb", $action);

					//删除内容图片
					$body = $results[0]['body'];
					if(!empty($body)){
						delEditorPic($body, $action);
					}

					//删除图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__".$action."pic` WHERE `aid` = ".$val['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $value){
							$atlasPic .= $value['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", $action);
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");


					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."item` WHERE `aid` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."list` WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}

			//查询此分类下所有信息ID
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."typeitem` WHERE `tid` = ".$id);
			$dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."type` WHERE `id` = ".$id);
			$dsql->dsqlOper($archives, "update");

			clearCache("info_type", $id);

		}
		// 清除缓存
		clearCache($action."type_par", $idsArr);

		adminLog("删除分类信息分类", $id);
		echo '{"state": 100, "info": '.json_encode('删除成功！').'}';
		die;

	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	checkPurview("addInfoType");
	$data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);

		$json = objtoarr($json);
		$json = typeAjax($json, 0, $action."type");
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

    adminLog("导入默认数据", "信息分类_infotype");
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
		'admin/info/infoType.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}



/**
 * 获取默认数据
*/
function getDefaultSql(){
    return <<<DEFAULTSQL
DELETE FROM `#@__infotype`;
ALTER TABLE `#@__infotype` AUTO_INCREMENT = 1;
DELETE FROM `#@__infotypeitem`;
ALTER TABLE `#@__infotypeitem` AUTO_INCREMENT = 1;
DELETE FROM `#@__infoitemtype`;
ALTER TABLE `#@__infoitemtype` AUTO_INCREMENT = 1;
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('1', '0', '生活服务', '0', '0', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/1.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('2', '0', '二手闲置', '0', '1', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/2.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('3', '0', '招聘求职', '0', '2', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/3.png', '', '0', '1', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('4', '0', '租房买房', '0', '3', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/4.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('5', '0', '保姆月嫂', '0', '4', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/5.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('6', '0', '优惠团购', '0', '5', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/6.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('7', '0', '汽车生活', '0', '6', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/7.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('8', '0', '生意转让', '0', '7', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/8.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('9', '0', '商业服务', '0', '8', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/9.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('10', '0', '顺风车', '0', '9', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/10.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('11', '0', '家居装修', '0', '11', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/11.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('12', '0', '婚庆摄影', '0', '13', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/12.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('13', '0', '保健养生', '0', '12', '', '', '', '1637743903', 'https://upload.ihuoniao.cn//info/demo/icon/13.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('14', '0', '万能求助', '0', '14', '', '', '', '1637743904', 'https://upload.ihuoniao.cn//info/demo/icon/14.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('15', '1', '开锁换锁', '0', '0', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/15.png', '', '1', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('16', '1', '搬家', '0', '1', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/16.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('17', '1', '配送跑腿', '0', '2', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/17.png', '', '0', '0', '1');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('18', '1', '保洁开荒', '0', '3', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/18.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('19', '1', '二手回收', '0', '4', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/19.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('20', '1', '管道疏通', '0', '5', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/20.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('21', '1', '家电维修', '0', '6', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/21.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('22', '1', '水电暖维修', '0', '7', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/22.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('23', '1', '房屋维修', '0', '8', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/23.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('24', '1', '保养翻新', '0', '9', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/24.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('25', '1', '鲜花到家', '0', '10', '', '', '', '1637744045', 'https://upload.ihuoniao.cn//info/demo/icon/25.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('26', '2', '手机', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/26.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('27', '2', '数码', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/27.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('28', '2', '美容保健', '0', '5', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/28.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('30', '2', '家电', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/30.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('31', '2', '家居软装', '0', '9', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/31.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('32', '2', '服装鞋包', '0', '4', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/32.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('33', '2', '宠物用品', '0', '10', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/33.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('34', '3', '招聘', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/34.png', '', '1', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('35', '3', '求职', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/35.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('36', '3', '兼职', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/36.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('37', '4', '二手房', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/37.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('38', '4', '租房', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/38.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('39', '4', '商铺办公', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/39.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('40', '5', '住家保姆', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/40.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('41', '5', '月嫂', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/41.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('42', '5', '育儿嫂', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/42.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('43', '5', '育婴师', '0', '3', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/43.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('44', '5', '做饭阿姨', '0', '4', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/44.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('45', '5', '护工', '0', '5', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/45.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('46', '5', '钟点工', '0', '6', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/46.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('47', '6', '汗蒸按摩', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/47.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('48', '6', '丽人美容', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/48.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('49', '6', '美食餐饮', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/49.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('50', '6', '聚会烧烤', '0', '3', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/50.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('52', '6', '漂流采摘', '0', '5', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/52.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('53', '6', '农家乐', '0', '6', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/53.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('54', '6', '周末游', '0', '7', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/54.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('55', '7', '租车', '0', '0', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/55.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('56', '7', '买车', '0', '1', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/56.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('57', '7', '改装配件', '0', '2', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/57.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('58', '7', '维修保养', '0', '3', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/58.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('59', '7', '驾校学车', '0', '4', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/59.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('60', '7', '陪练代驾', '0', '5', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/60.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('61', '7', '车位', '0', '6', '', '', '', '1637744284', 'https://upload.ihuoniao.cn//info/demo/icon/61.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('62', '8', '商业街', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/62.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('63', '8', '社区底商', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/63.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('64', '8', '临街门面', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/64.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('65', '8', '档口摊位', '0', '3', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/65.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('66', '9', '工商财税', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/66.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('67', '9', '网站建设', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/67.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('68', '9', '货运物流', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/68.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('69', '9', '法律/翻译', '0', '3', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/69.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('70', '9', '广告/印刷', '0', '4', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/70.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('71', '9', '办公设备', '0', '5', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/71.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('72', '10', '乘客找车', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/72.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('73', '10', '顺风车', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/73.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('74', '10', '货运专线', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/74.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('75', '11', '装修公司', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/75.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('76', '11', '家装设计', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/76.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('77', '11', '装修队', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/77.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('78', '11', '散工', '0', '3', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/78.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('79', '11', '建材工具', '0', '4', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/79.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('80', '11', '家具定制', '0', '5', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/80.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('81', '11', '家纺家饰', '0', '6', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/81.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('82', '11', '建房改造', '0', '7', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/82.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('83', '12', '婚纱写真', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/83.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('84', '12', '婚宴场地', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/84.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('85', '12', '策划布置', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/85.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('86', '12', '彩妆跟妆', '0', '3', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/86.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('87', '12', '司仪主持', '0', '4', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/87.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('88', '12', '摄影摄像', '0', '5', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/88.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('89', '12', '婚车租赁', '0', '6', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/89.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('90', '12', '婚庆用品', '0', '7', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/90.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('91', '13', '送药上门', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/91.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('92', '13', '养生补品', '0', '1', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/92.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('93', '13', '生活防疫', '0', '2', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/93.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('94', '13', '足疗按摩', '0', '3', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/94.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('95', '14', '宠物丢失', '0', '0', '', '', '', '1637744422', 'https://upload.ihuoniao.cn//info/demo/icon/95.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('96', '9', '起名风水', '0', '6', '', '', '', '1637752032', 'https://upload.ihuoniao.cn//info/demo/icon/96.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('97', '9', '签证签注', '0', '7', '', '', '', '1637752032', 'https://upload.ihuoniao.cn//info/demo/icon/97.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('98', '0', '批发采购', '0', '10', '', '', '', '1637752269', 'https://upload.ihuoniao.cn//info/demo/icon/98.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('99', '98', '化妆品', '0', '0', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/99.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('100', '98', '服装鞋饰', '0', '1', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/100.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('101', '98', '运动用品', '0', '2', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/101.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('102', '98', '食品特产', '0', '3', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/102.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('103', '98', '商超', '0', '4', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/103.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('104', '98', '安防设备', '0', '5', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/104.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('105', '98', '玩具礼品', '0', '6', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/105.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('106', '98', '农林牧渔', '0', '7', '', '', '', '1637752297', 'https://upload.ihuoniao.cn//info/demo/icon/106.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('107', '14', '寻人启事', '0', '1', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/107.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('108', '14', '情感问题', '0', '2', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/108.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('109', '14', '租房问题', '0', '3', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/109.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('110', '14', '工作问题', '0', '4', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/110.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('111', '14', '买房问题', '0', '5', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/111.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('112', '14', '消费维权', '0', '6', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/112.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('113', '14', '装修问题', '0', '7', '', '', '', '1637752379', 'https://upload.ihuoniao.cn//info/demo/icon/113.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('114', '2', '代步工具', '0', '3', '', '', '', '1637926610', 'https://upload.ihuoniao.cn//info/demo/icon/114.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('116', '2', '母婴玩具', '0', '6', '', '', '', '1637926677', 'https://upload.ihuoniao.cn//info/demo/icon/116.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('117', '2', '文体户外', '0', '7', '', '', '', '1637926745', 'https://upload.ihuoniao.cn//info/demo/icon/117.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('118', '2', '二手设备', '0', '8', '', '', '', '1637926745', 'https://upload.ihuoniao.cn//info/demo/icon/118.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('119', '2', '二手求购', '0', '11', '', '', '', '1637926745', 'https://upload.ihuoniao.cn//info/demo/icon/119.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('120', '6', '家用日化', '0', '4', '', '', '', '1637926876', 'https://upload.ihuoniao.cn//info/demo/icon/120.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('121', '5', '月子中心', '0', '7', '', '', '', '1638262911', 'https://upload.ihuoniao.cn//info/demo/icon/121.png', '', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('122', '1', '二级外链', '0', '11', '', '', '', '1646992994', 'https://upload.ihuoniao.cn//info/adv/large/2022/03/11/16469931744.png', 'https://www.baidu.com', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('123', '0', '一级外链', '0', '15', '', '', '', '1646993013', 'https://upload.ihuoniao.cn//info/adv/large/2022/03/11/16469931689040.png', 'https://ihuoniao.cn/sz/shop/search_list.html?typeid=5&pagetype=1', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('124', '0', '商家列表', '0', '16', '', '', '', '1654826993', 'https://upload.ihuoniao.cn//info/adv/large/2022/06/10/1654827016854.png', 'https://ihuoniao.cn/sz/business/list.html?typeid=61', '0', '0', '0');
INSERT INTO `#@__infotype` (`id`, `parentid`, `typename`, `ishidden`, `weight`, `seotitle`, `keywords`, `description`, `pubdate`, `icon`, `redirect`, `style`, `searchall`, `freecall`) VALUES ('125', '0', '商城店铺', '0', '17', '', '', '', '1656997383', 'https://upload.ihuoniao.cn//info/adv/large/2022/07/05/16569974762616.png', 'https://ihuoniao.cn/shop', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('1', '16', 'user_1', '类型', '1', 'checkbox', '0', '公司搬家\r\n长途搬家\r\n设备搬迁\r\n家具拆装', '', '0', '0', '1');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('2', '18', 'user_2', '类型', '1', 'checkbox', '0', '外墙清洗\r\n开荒保洁\r\n空气治理', '', '1', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('3', '19', 'user_3', '类型', '1', 'radio', '0', '电器回收\r\n电脑回收\r\n手机回收\r\n数码回收\r\n废品回收\r\n垃圾处理\r\n奢侈品', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('4', '20', 'user_4', '类型', '1', 'checkbox', '0', '马桶疏通\r\n下水道疏通\r\n工业管道', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('5', '21', 'user_5', '类型', '1', 'checkbox', '0', '冰箱维修\r\n洗衣机维修\r\n电视维修\r\n空调维修\r\n影音家电\r\n小家电\r\n厨房电器', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('6', '22', 'user_6', '类型', '1', 'checkbox', '0', '水电改造\r\n水管维修\r\n电路维修\r\n暖气维修', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('7', '23', 'user_7', '类型', '1', 'checkbox', '0', '防水补漏\r\n地板维修\r\n墙面补漆\r\n门窗维修', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('8', '24', 'user_8', '类型', '1', 'checkbox', '0', '地板养护\r\n实木家具保养\r\n沙发维修\r\n墙纸翻新\r\n皮具护理\r\n改衣\r\n修鞋\r\n干洗', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('9', '25', 'user_9', '类型', '1', 'checkbox', '0', '包月花\r\n开业花篮\r\n园林绿化\r\n绿植租赁\r\n场地布置\r\n景观设计', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('10', '26', 'user_10', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('11', '26', 'user_11', '品牌', '1', 'radio', '0', 'OPPO\r\nVIVO\r\n诺基亚\r\n华为\r\n小米\r\n苹果\r\n酷派\r\n金立\r\n联想\r\n三星\r\n小新\r\n一加\r\n坚果', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('12', '27', 'user_12', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('13', '27', 'user_13', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('14', '28', 'user_14', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('15', '28', 'user_15', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('18', '30', 'user_18', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('19', '30', 'user_19', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('20', '31', 'user_20', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('21', '31', 'user_21', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('22', '32', 'user_22', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('23', '32', 'user_23', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('24', '33', 'user_24', '成色', '1', 'radio', '0', '全新\r\n几乎全新\r\n轻微使用痕迹\r\n明显使用痕迹', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('25', '33', 'user_25', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('26', '34', 'user_26', '行业', '1', 'checkbox', '0', '电工/水电工\r\n泥瓦工/砌筑工\r\n钢筋/翻样/后台\r\n铆工/钳工/钣金\r\n电焊/亚弧焊/二保\r\n幕墙/门窗/玻璃\r\n水暖/管道/通风\r\n架子工\r\n小工/力工/杂工/搬运\r\n打墙/开孔/切割/拆除\r\n木工/家具定制\r\n油漆/涂料/大白\r\n抹灰/贴砖/墙纸\r\n美缝/打胶\r\n防水/补漏\r\n施工员/安全员/材料员/质量员\r\n建造师/监理/项目经理\r\n测绘/库管/取样员/会计\r\n整体施工\r\n地面固化\r\n广告安装\r\n平面设计\r\n开荒保洁\r\n钟点清洁\r\n除甲醛\r\n保姆/月嫂/陪护\r\n家电清洗\r\n家电安装/维修\r\n房屋维修\r\n手机维修\r\n灯具安装/维修\r\n管道疏通\r\n开锁换锁\r\n安防弱电\r\n摩修/汽修\r\n租车/代驾\r\n货运/搬家\r\n设备出租\r\n废旧回收\r\n物业管理\r\n门卫/保安\r\n外卖/快递\r\n装车/卸货\r\n会计/出纳/记账/审计\r\n文员/行政/前台\r\n机修/机械安装\r\n塔吊/指挥/吊车\r\n挖机/推土机/压路机\r\n货车/渣土车/运输车\r\n叉车/铲车/泵车\r\n人货电梯/升降机司机\r\n销售/导购/收银/专场主管\r\n厨师/刀工/洗碗/服务员\r\n视频主播/直播\r\n网店客服/电商美工\r\n房产经纪/置业顾问\r\n医师/护士\r\n幼师/教师', '', '1', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('27', '35', 'user_27', '行业', '1', 'radio', '0', '服务业\r\n互联网\r\n汽车制造\r\n金融财会\r\n商超\r\n物流\r\n人力行政\r\n建筑装修\r\n医疗制药\r\n保险', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('28', '36', 'user_28', '类型', '1', 'radio', '0', '配送员\r\n传单派发\r\n服务员\r\n客服\r\n家教\r\n翻译\r\n法务\r\n礼仪模特\r\n司仪', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('29', '37', 'user_29', '户型', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('30', '37', 'user_30', '面积', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('31', '37', 'user_31', '类型', '1', 'radio', '0', '住宅\r\n公寓\r\n别墅\r\n复式\r\n商住两用\r\n写字楼\r\n商铺', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('32', '37', 'user_32', '装修', '1', 'radio', '0', '毛坯\r\n精装修\r\n简装\r\n豪华装修', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('33', '38', 'user_33', '类型', '1', 'radio', '0', '整租\r\n合租', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('34', '38', 'user_34', '付款方式', '1', 'radio', '0', '付3押1\r\n付1押1\r\n付2押1\r\n付1押2\r\n年付不押\r\n半年付不押\r\n面议', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('35', '39', 'user_35', '类型', '1', 'radio', '0', '商铺出粗\r\n商铺出售\r\n生意转让\r\n写字楼出租\r\n写字楼出售\r\n土地仓库', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('36', '39', 'user_36', '装修', '1', 'radio', '0', '毛坯\r\n简装\r\n精装修\r\n豪华装修', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('37', '40', 'user_37', '户籍', '1', 'text', '0', '', '', '0', '0', '1');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('38', '40', 'user_38', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('39', '40', 'user_39', '持证', '1', 'checkbox', '0', '厨师证\r\n健康证\r\n营养师', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('40', '41', 'user_40', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('41', '41', 'user_41', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('42', '42', 'user_42', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('43', '42', 'user_43', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('44', '43', 'user_44', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('45', '43', 'user_45', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('46', '44', 'user_46', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('47', '44', 'user_47', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('48', '45', 'user_48', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('49', '45', 'user_49', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('50', '46', 'user_50', '户籍', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('51', '46', 'user_51', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('52', '55', 'user_52', '车型', '1', 'checkbox', '0', '轿车\r\n面包车\r\n大巴\r\n货车\r\n新能源\r\n冷藏车', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('53', '56', 'user_53', '品牌', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('54', '56', 'user_54', '车型', '1', 'radio', '0', '轿车\r\nSUV\r\nMPV\r\n跑车\r\n微面\r\n皮卡\r\n轻客\r\n微卡\r\n工程车', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('55', '57', 'user_55', '类型', '1', 'checkbox', '0', '视听设备\r\n养护用品\r\n拆车件\r\n改装配件\r\n汽车改装', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('56', '58', 'user_56', '类型', '1', 'checkbox', '0', '道路救援\r\n电瓶更换/修复\r\n换胎补胎\r\n凹陷修复\r\n发动机维修\r\n钣金喷漆\r\n送油\r\n搭电', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('57', '59', 'user_57', '驾照', '1', 'checkbox', '0', 'C1\r\nC2\r\nB1\r\nB2\r\nC3\r\nC4\r\nD\r\nE\r\nA\r\nA2\r\nA3\r\nF\r\nC5', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('58', '59', 'user_58', '类型', '1', 'radio', '0', '驾校招生\r\n教练招生', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('59', '59', 'user_59', '拿证时间', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('60', '60', 'user_60', '驾龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('61', '61', 'user_61', '类型', '1', 'radio', '0', '出售\r\n转让\r\n出租', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('62', '62', 'user_62', '类型', '1', 'radio', '0', '餐饮美食\r\n美容美发\r\n服饰鞋包\r\n休闲娱乐\r\n百货超市\r\n生活服务\r\n电器通讯\r\n汽修美容\r\n医疗器械\r\n家居建材\r\n教育培训\r\n酒店宾馆', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('63', '63', 'user_63', '类型', '1', 'radio', '0', '餐饮美食\r\n美容美发\r\n服饰鞋包\r\n休闲娱乐\r\n百货超市\r\n生活服务\r\n电器通讯\r\n汽修美容\r\n医疗器械\r\n家居建材\r\n教育培训\r\n酒店宾馆', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('64', '64', 'user_64', '类型', '1', 'radio', '0', '餐饮美食\r\n美容美发\r\n服饰鞋包\r\n休闲娱乐\r\n百货超市\r\n生活服务\r\n电器通讯\r\n汽修美容\r\n医疗器械\r\n家居建材\r\n教育培训\r\n酒店宾馆', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('65', '66', 'user_65', '类别', '1', 'checkbox', '0', '工商注册\r\n证件代办\r\n贷款/担保\r\n财务/会计\r\n商标服务\r\n专利服务', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('66', '70', 'user_66', '类别', '1', 'checkbox', '0', '广告设计\r\n平面设计\r\n视频制作\r\nLOGO设计\r\n品牌推广\r\n名片设计\r\n印刷包装\r\n办公礼品', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('67', '71', 'user_67', '类别', '1', 'checkbox', '0', '办公设备租赁\r\n打印机\r\n复印机\r\n投影仪\r\n安防系统\r\n监控/门禁\r\nLED显示屏\r\n集团电话\r\n一体机\r\n音/视频系统', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('68', '77', 'user_68', '类型', '1', 'checkbox', '0', '软装设计\r\n二手房装修\r\n水电改造\r\n灯具安装\r\n房屋拆除\r\n墙面粉刷\r\n贴墙纸\r\n贴瓷砖', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('69', '78', 'user_69', '类型', '1', 'checkbox', '0', '泥瓦工\r\n油漆工\r\n木工\r\n电工\r\n美缝\r\n管道', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('70', '79', 'user_70', '类型', '1', 'checkbox', '0', '基础建材', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('71', '80', 'user_71', '类型', '1', 'checkbox', '0', '全屋定制\r\n整体橱柜\r\n酒柜\r\n玄关\r\n定制沙发\r\n红木家具', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('73', '37', 'user_73', '小区', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('74', '37', 'user_74', '年代', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('75', '37', 'user_75', '楼层', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('76', '38', 'user_29', '户型', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('77', '38', 'user_30', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('79', '38', 'user_32', '装修', '1', 'radio', '0', '毛坯\r\n精装修\r\n简装\r\n豪华装修', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('80', '38', 'user_73', '配置', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('82', '38', 'user_75', '楼层', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('83', '38', 'user_83', '小区', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('84', '39', 'user_84', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('85', '17', 'user_85', '类别', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('86', '26', 'user_86', '价格', '5', 'text', '0', '', '面议', '0', '0', '1');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('87', '27', 'user_87', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('88', '28', 'user_88', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('89', '77', 'user_89', '软装设计', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('90', '77', 'user_90', '二手房装修', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('91', '77', 'user_91', '水电改造', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('92', '77', 'user_92', '灯具安装', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('93', '77', 'user_93', '房屋拆除', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('94', '77', 'user_94', '墙面粉刷', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('95', '77', 'user_95', '贴墙纸', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('96', '77', 'user_96', '贴瓷砖', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('98', '30', 'user_98', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('99', '31', 'user_99', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('100', '32', 'user_100', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('101', '34', 'user_101', '招聘人数', '1', 'text', '0', '11', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('103', '34', 'user_103', '薪资报酬', '1', 'text', '0', '', '', '0', '0', '1');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('104', '34', 'user_104', '学历', '1', 'checkbox', '0', '中专\r\n大专\r\n本科\r\n研究生\r\n博士\r\n硕士', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('105', '34', 'user_105', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('106', '35', 'user_106', '性别', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('107', '35', 'user_107', '经验描述', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('108', '35', 'user_108', '专业', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('109', '35', 'user_109', '学历', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('110', '36', 'user_26', '行业', '1', 'radio', '0', '服务业\r\n互联网\r\n汽车制造\r\n金融财会\r\n商超\r\n物流\r\n人力行政\r\n建筑装修\r\n医疗制药\r\n保险', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('111', '36', 'user_101', '招聘人数', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('112', '36', 'user_102', '经验要求', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('113', '36', 'user_103', '薪资报酬', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('114', '36', 'user_104', '学历', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('115', '36', 'user_115', '年龄', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('118', '43', 'user_118', '能力', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('119', '44', 'user_119', '能力', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('120', '45', 'user_120', '能力', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('121', '46', 'user_121', '能力', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('122', '15', 'user_4', '类型', '1', 'checkbox', '0', '马桶疏通\r\n下水道疏通\r\n工业管道\r\n专业开锁\r\n空调清洗', '', '1', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('123', '15', 'user_85', '类别', '1', 'text', '0', '', '', '0', '1', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('128', '62', 'user_128', '行业', '1', 'radio', '0', '自助餐\r\n美容美发\r\n宠物用品', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('129', '62', 'user_129', '租售', '1', 'radio', '0', '转租\r\n转售', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('130', '62', 'user_130', '装修', '1', 'radio', '0', '一般\r\n普通\r\n高级', '', '0', '0', '0');
INSERT INTO `#@__infotypeitem` (`id`, `tid`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default`, `custom`, `search`, `heightlight`) VALUES ('131', '62', 'user_131', '价格', '1', 'text', '0', '', '', '0', '0', '0');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('1', '1小时上门', '0', '15');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('2', '智能锁', '0', '15');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('3', '防盗门', '0', '15');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('4', '公安备案', '0', '15');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('5', '1小时上门', '0', '16');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('6', '1小时上门', '0', '17');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('7', '生鲜', '0', '17');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('8', '桶装水', '0', '17');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('9', '粮油', '0', '17');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('10', '机场接送', '0', '17');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('11', '1小时上门', '0', '18');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('12', '在线预约', '0', '18');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('13', '验收售后', '0', '18');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('14', '1小时上门', '0', '19');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('17', '在线预约', '2', '20');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('18', '1小时上门', '0', '20');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('20', '验收售后', '1', '20');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('21', '1小时上门', '0', '21');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('22', '在线预约', '0', '21');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('23', '验收售后', '0', '21');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('24', '1小时上门', '0', '22');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('25', '在线预约', '0', '22');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('26', '验收售后', '0', '22');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('27', '1小时上门', '0', '23');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('28', '在线预约', '0', '23');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('29', '验收售后', '0', '23');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('30', '1小时上门', '0', '24');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('31', '在线预约', '0', '24');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('32', '验收售后', '0', '24');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('33', '进口鲜花', '0', '25');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('34', '1小时配送', '0', '25');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('35', '个人闲置', '0', '26');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('36', '付邮送', '0', '26');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('37', '可置换', '0', '26');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('38', '个人闲置', '0', '27');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('39', '付邮送', '0', '27');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('40', '可置换', '0', '27');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('41', '个人闲置', '0', '28');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('42', '付邮送', '0', '28');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('43', '可置换', '0', '28');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('44', '个人闲置', '0', '29');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('45', '付邮送', '0', '29');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('46', '可置换', '0', '29');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('47', '个人闲置', '0', '30');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('48', '付邮送', '0', '30');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('49', '可置换', '0', '30');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('50', '个人闲置', '0', '31');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('51', '付邮送', '0', '31');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('52', '可置换', '0', '31');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('53', '个人闲置', '0', '32');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('54', '付邮送', '0', '32');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('55', '可置换', '0', '32');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('56', '个人闲置', '0', '33');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('57', '付邮送', '0', '33');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('58', '可置换', '0', '33');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('59', '五险一金', '4', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('60', '应届生', '3', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('61', '包吃住', '2', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('62', '双休', '0', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('63', '年底双薪', '5', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('64', '配车', '1', '34');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('65', '日结', '0', '36');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('66', '门槛低', '0', '36');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('67', '个人招', '0', '36');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('68', '0押金', '0', '36');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('69', '房东直售', '0', '37');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('70', '低总价', '0', '37');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('71', '准新房', '0', '37');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('72', '免中介费', '0', '38');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('73', '可短租', '0', '38');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('74', '品质公寓', '0', '38');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('75', '近地铁', '0', '38');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('76', '免中介费', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('77', '免租1个月', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('78', '临街', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('79', '外摆区', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('80', '天然气', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('81', '明火', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('82', '可注册', '0', '39');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('83', '24h上岗', '0', '40');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('84', '非中介', '0', '40');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('85', '背调', '0', '40');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('86', '24h上岗', '0', '41');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('87', '非中介', '0', '41');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('88', '背调', '0', '41');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('89', '月子餐', '0', '41');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('90', '24h上岗', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('91', '非中介', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('92', '背调', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('93', '厨师证', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('94', '健康证', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('95', '营养师', '0', '42');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('96', '24h上岗', '0', '43');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('97', '非中介', '0', '43');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('98', '背调', '0', '43');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('99', '资格证', '0', '43');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('100', '24h上岗', '0', '44');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('101', '非中介', '0', '44');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('102', '厨师证', '0', '44');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('103', '营养师', '0', '44');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('104', '24h上岗', '0', '45');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('105', '非中介', '0', '45');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('106', '背调', '0', '45');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('107', '资格证', '0', '45');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('108', '护士证', '0', '45');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('109', '1小时上门', '0', '46');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('110', '非中介', '0', '46');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('111', '背调', '0', '46');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('112', '经验丰富', '0', '46');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('113', '可日租', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('114', '带司机', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('115', '自驾租车', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('116', '搬家拉货', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('117', '团体用车', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('118', '商务用', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('119', '网约车', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('120', '婚庆', '0', '55');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('121', '4s店', '0', '56');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('122', '个人车源', '0', '56');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('123', '汽贸', '0', '56');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('124', '个人闲置', '0', '57');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('125', '高价回收', '0', '57');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('126', '24小时在线', '0', '58');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('127', '分期付款', '0', '59');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('128', '一对一', '0', '59');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('129', '先学后付', '0', '59');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('130', '车接车送', '0', '59');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('131', '随到随学', '0', '59');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('132', '24小时在线', '0', '60');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('133', '免中介费', '0', '61');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('134', '地库', '0', '61');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('135', '地面', '0', '61');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('136', '大车位', '0', '61');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('137', '个人转让', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('138', '免租1个月', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('139', '临街', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('140', '外摆区', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('141', '天然气', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('142', '明火', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('143', '可餐饮', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('144', '380v', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('145', '上水', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('146', '下水', '0', '62');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('147', '个人转让', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('148', '免租1个月', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('149', '临街', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('150', '外摆区', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('151', '天然气', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('152', '明火', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('153', '可餐饮', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('154', '380v', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('155', '上水', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('156', '下水', '0', '63');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('157', '个人转让', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('158', '免租1个月', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('159', '临街', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('160', '外摆区', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('161', '天然气', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('162', '明火', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('163', '可餐饮', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('164', '380v', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('165', '上水', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('166', '下水', '0', '64');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('167', '个人转让', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('168', '免租1个月', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('169', '可餐饮', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('170', '明火', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('171', '380v', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('172', '上水', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('173', '下水', '0', '65');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('174', '批量优惠', '0', '70');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('175', '带行李', '0', '72');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('176', '带小孩', '0', '72');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('177', '带宠物', '0', '72');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('178', '承担高速费', '0', '72');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('179', '天天发车', '0', '73');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('180', '余位多', '0', '73');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('181', '可包车', '0', '73');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('182', '可带行李', '0', '73');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('183', '天天发车', '0', '74');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('184', '可包车', '0', '74');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('185', '货物拼车', '0', '74');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('186', '回程车', '0', '74');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('187', '免费测量', '0', '75');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('188', '免费测量', '0', '76');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('189', '免费测量', '0', '77');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('190', '在线预约', '0', '77');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('191', '在线预约', '0', '78');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('192', '送货上门', '0', '79');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('193', '免费测量', '0', '80');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('194', '厂家直销', '0', '80');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('195', '免费测量', '0', '81');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('196', '厂家直销', '0', '81');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('197', '免费测量', '0', '82');
INSERT INTO `#@__infoitemtype` (`id`, `name`, `weight`, `tid`) VALUES ('198', '24小时在线', '0', '91');
DEFAULTSQL;
}
