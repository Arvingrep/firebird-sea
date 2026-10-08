<?php
/**
 * 管理城市商圈
 *
 * @version        $Id: siteCityBusiness.php 2015-10-29 下午22:15:20 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCity");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteCityBusiness.html";

$action = "site_city_circle";

//新增
if($dopost == "add"){

	$name = $_POST['name'];
	if(empty($qid)) die('{"state": 200, "info": '.json_encode('请选择所属区域').'}');
	if(empty($name)) die('{"state": 200, "info": '.json_encode('请输入商圈名').'}');

	$hot = (int)$hot;
	$sql = $dsql->SetQuery("INSERT INTO `#@__".$action."` (`cid`, `qid`, `name`, `hot`) VALUE ('$cid', '$qid', '$name', '$hot')");
	$ret = $dsql->dsqlOper($sql, "update");
	if($ret == "ok"){
		die('{"state": 100, "info": '.json_encode('添加成功').'}');
	}else{
		die('{"state": 200, "info": '.json_encode('添加失败').'}');
	}


//修改商圈
}else if($dopost == "updateType"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__$action` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");

	if(!empty($results)){

		if($name == "" && $type != "address" && $type != "hot" && $type !="lnglat" && $type != "tel" && $type != "openStart" && $type != "openEnd") die('{"state": 101, "info": '.json_encode('请输入商圈名').'}');
		if($type == "single"){

			if($results[0]['name'] != $name){

				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `name` = '$name' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");

			}else{
				//商圈没有变化
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}

		}elseif($type == "hot"){

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `hot` = '$val' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");

		}elseif($type == "openStart"){
			if($results[0]['openStart'] != $openStart){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `openStart` = '$openStart' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}else{
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
		}elseif($type == "openEnd"){
			if($results[0]['openEnd'] != $openEnd){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `openEnd` = '$openEnd' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}else{
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
		}elseif($type == "tel"){
			if($results[0]['tel'] != $tel){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `tel` = '$tel' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}else{
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
		}elseif($type == "lnglat"){
			if($results[0]['lng'] != $lng || $results[0]['lat'] != $lat){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `address`='$address',`lng`='$lng', `lat`='$lat' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}else{
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
		}elseif($type == "address"){
			if($results[0]['address'] != $address){
				//保存到主表
				$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `address`='$address' WHERE `id` = ".$id);
				$results = $dsql->dsqlOper($archives, "update");
			}else{
				echo '{"state": 101, "info": '.json_encode('无变化！').'}';
				die;
			}
		}else{
			//对字符进行处理
			$name    = cn_substrR($name,90);

			//保存到主表
			$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `name` = '$name' WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
		}

		if($results != "ok"){
			echo '{"state": 200, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{
			adminLog("修改城市商圈", $name);
			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}

	}else{
		echo '{"state": 101, "info": '.json_encode('要修改的信息不存在或已删除！').'}';
		die;
	}

//删除商圈
}else if($dopost == "del"){
	if($id == "") die;

	$archives = $dsql->SetQuery("DELETE FROM `#@__$action` WHERE `id` in ($id)");
	$dsql->dsqlOper($archives, "update");

	adminLog("删除城市商圈", $id);
	die('{"state": 100, "info": '.json_encode('删除成功！').'}');

}elseif($dopost == "typeAjaxImg"){//更新图标
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);
	$json = objtoarr($json);
	for($i = 0; $i < count($json); $i++){
		$id   = $json[$i]["id"];
		$icon = $json[$i]["icon"];
		if(!empty($icon)){
			$archives = $dsql->SetQuery("SELECT `litpic` FROM `#@__$action` WHERE `id` = ".$id);
			$results  = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				if($results[0]["litpic"] != $icon){
					$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `litpic` = '$icon' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");
					adminLog("修改城市商圈图标", $name);
				}
			}
		}
	}
	die('{"state": 100, "info": '.json_encode('保存成功！').'}');
//更新信息商圈
}else if($dopost == "typeAjax"){
	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);

	for($i = 0; $i < count($json); $i++){
		$id = $json[$i]["id"];
		$name = $json[$i]["name"];

		//如果ID为空则向数据库插入下级商圈
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__$action` (`cid`, `name`, `weight`) VALUES ('$cid', '$name', '$i')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加城市商圈", $name);
		}
		//其它为数据库已存在的商圈需要验证商圈名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `name`, `weight` FROM `#@__$action` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证商圈名
				if($results[0]["name"] != $name){
					$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `name` = '$name' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改城市商圈名", $name);
				}

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__$action` SET `weight` = '$i' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改城市商圈排序", $dopost."=>".$name."=>".$i);
				}


			}
		}
	}

	die('{"state": 100, "info": '.json_encode('保存成功！').'}');
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.ajaxFileUpload.js',
		'admin/siteConfig/siteCityBusiness.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cid', (int)$cid);

	//区域
	$area = $dsql->getTypeList($cid, "site_area", false);
	$huoniaoTag->assign('area', $area);

	//列表
	$where = "";
	if(!empty($qid)) $where = " AND c.`qid` = $qid";
	$sql = $dsql->SetQuery("SELECT c.*, c2.`typename` FROM `#@__$action` c LEFT JOIN `#@__site_city` c1 ON c1.`id` = c.`cid` LEFT JOIN `#@__site_area` c2 ON c2.`id` = c.`qid` WHERE c.`cid` = $cid".$where);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach($ret as $key=>$row){
			$ret[$key]['cityname'] = getSiteCityName($row['cid']);
		}
	}
	$huoniaoTag->assign('list', $ret);

	$typename = "区域筛选";
	if(!empty($qid)){
		$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = $qid");
		$ret = $dsql->dsqlOper($sql, "results");
		$typename = $ret[0]['typename'];
	}
	$huoniaoTag->assign('typename', $typename);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
