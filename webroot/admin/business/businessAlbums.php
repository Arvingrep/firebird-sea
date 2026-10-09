<?php
/**
 * 管理商家相册
 *
 * @version        $Id: businessAlbums.php 2017-03-24 下午16:38:15 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessAlbums");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessAlbums.html";

$tab = "business";

$cssFile = array();
$jsFile = array(
	'ui/bootstrap.min.js',
	'admin/business/businessAlbums.js'
);

$uid = $_REQUEST['uid'];

if($dopost == "add"){
	$cssFile = array(
		'ui/chosen.min.css'
	);
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/business/businessAlbumsAdd.js'
	);
	$templates = "businessAlbumsAdd.html";
}

//提前前验证
if(!empty($_POST) && $dopost == "add"){
	if($token == "") die('token传递失败！');

	if(empty($uid)){
		echo '{"state": 200, "info": "请选择所属商家"}';
		exit();
	}

	//城市管理员权限
	if($userType == 3){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` = $uid" . getCityFilter('`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			die('{"state": 200, "info": '.json_encode("对不起，您无权操作此商家！").'}');
		}
	}

	if(empty($typeid)){
		echo '{"state": 200, "info": "请选择分类"}';
		exit();
	}

	if(empty($pics)){
		echo '{"state": 200, "info": "请上传照片"}';
		exit();
	}

	//查询商家ID
	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` = $uid");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$sid = $ret[0]['id'];
	}else{
		echo '{"state": 200, "info": "所选商家不存在或已经删除！"}';
		exit();
	}
}

$time = time();

if($dopost == "add" && !empty($_POST)){

	$picsArr = explode(",", $pics);
	$time = time();

	foreach ($picsArr as $key => $value) {
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_albums` (`uid`, `typeid`, `litpic`, `pubdate`) VALUES ('$uid', '$typeid', '$value', '$time')");
		$dsql->dsqlOper($archives, "lastid");
	}

	adminLog("新增商家相册", $uid);

	$param = array(
		"service"  => "business",
		"template" => "albums",
		"bid"      => $sid,
		"id"       => $typeid
	);
	$url = getUrlPath($param);

	echo '{"state": 100, "url": "'.$url.'"}';die;
}

//获取商家动态分类
if($dopost == "getTypeList"){
	if(!empty($id)){
		$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__business_albums_type` WHERE `uid` = $id ORDER BY `weight` ASC, `id` ASC");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			echo json_encode($ret);
		}
	}die;
}


//更新分类
if($dopost == "saveManageType"){

	//城市管理员权限
	if($userType == 3){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` = $uid" . getCityFilter('`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			die('{"state": 200, "info": '.json_encode("对不起，您无权操作此商家！").'}');
		}
	}

	$data = str_replace("\\", '', $_POST['data']);
	if($data == "") die;
	$json = json_decode($data);

	$json = objtoarr($json);
	foreach($json as $key => $val){
		if($val['id'] != ""){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_albums_type` WHERE `id` = ".$val['id']);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				$where = array();
				if($results[0]['weight'] != $val['weight']){
					$where[] = '`weight` = '.$val['weight'];
				}
				if($results[0]['typename'] != $val['val']){
					$where[] = '`typename` = "'.$val['val'].'"';
				}
				if(!empty($where)){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."_albums_type` SET ".join(",", $where)." WHERE `id` = ".$val['id']);
					$dsql->dsqlOper($archives, "update");
				}
			}
		}else{
			if(!empty($val['val'])){
				$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."_albums_type` (`uid`, `typename`, `weight`) VALUES ('$uid', '".$val['val']."', ".$val['weight'].")");
				$dsql->dsqlOper($archives, "update");
			}
		}
	}
	$typeListArr = array();
	array_push($typeListArr, array("id" => 0, "typename" => "请选择"));
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."_albums_type` WHERE `uid` = '$uid' ORDER BY `weight` ASC, `id` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach($results as $key => $val){
			array_push($typeListArr, $val);
		}
	}
	echo json_encode($typeListArr);
	die;
}


//删除分类
if($dopost == "delManageType"){

	//城市管理员权限
	if($userType == 3){
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `id` = $uid" . getCityFilter('`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if(!$ret){
			die('{"state": 200, "info": '.json_encode("对不起，您无权操作此商家！").'}');
		}
	}

	if($uid && $id){
		$sql = $dsql->SetQuery("DELETE FROM `#@__business_albums_type` WHERE `uid` = $uid AND `id` = $id");
		$dsql->dsqlOper($sql, "update");

		$sql = $dsql->SetQuery("DELETE FROM `#@__business_albums` WHERE `uid` = $uid AND `typeid` = $id");
		$dsql->dsqlOper($sql, "update");
	}die;
}

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//城市管理员
	if($userType == 3){
		if($adminCityIds){
			$where .= getCityFilter('l.`cityid`');
		}else{
			$where .= " AND 1 = 2";
		}
	}

	if($sKeyword != ""){
		$userSql = $dsql->SetQuery("SELECT l.`id` FROM `#@__member` m LEFT JOIN `#@__".$tab."_list` l ON l.`uid` = m.`id` WHERE m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR l.`title` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				if($user['id']){
					array_push($userid, $user['id']);
				}
			}
			if(!empty($userid)){
				$where .= " AND a.`uid` in (".join(",", $userid).")";
			}
		}

		if(empty($userid)){
			$where .= " AND 1 = 2";
		}
	}

	$archives = $dsql->SetQuery("SELECT a.`id` FROM `#@__".$tab."_albums` a LEFT JOIN `#@__business_list` l ON l.`id` = a.`uid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by a.`id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT a.`id`, a.`uid`, a.`typeid`, a.`litpic`, a.`pubdate` FROM `#@__".$tab."_albums` a LEFT JOIN `#@__business_list` l ON l.`id` = a.`uid` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$list[$key]["typeid"] = $value["typeid"];
			$userSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."_albums_type` WHERE `id` = ". $value['typeid']);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["typename"] = $username[0]["typename"];

			$list[$key]["uid"] = $value["uid"];
			$userSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__".$tab."_list` WHERE `id` = ". $value['uid']);
			$username = $dsql->getTypeName($userSql);
			$list[$key]["store"] = $username[0]["title"];

			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "business",
				"template" => "albums",
                "business" => $username[0]["id"]
			);
			$list[$key]['url'] = getUrlPath($param);

			$param = array(
				"service"  => "business",
				"template" => "detail",
				"business" => $username[0]["id"]
			);
			$list[$key]['storeUrl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "businessAlbums": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//城市管理员
			if($userType == 3){
				if($adminCityIds){
					$where = getCityFilter('l.`cityid`');
				}else{
					$where = " AND 1 = 2";
				}
			}

			$archives = $dsql->SetQuery("SELECT a.* FROM `#@__".$tab."_albums` a LEFT JOIN `#@__business_list` l ON l.`id` = a.`uid` WHERE a.`id` = ".$val.$where);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){

				//删除缩略图
				array_push($title, $results[0]['title']);
				delPicFile($results[0]['litpic'], "delAtlas", $action);

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_albums` WHERE `id` = ".$val);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					$error[] = $val;
				}
			}else{
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除商家相册信息", $id."：".join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$businessList = array();
    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__business_list` WHERE `state` = 1 " . getCityFilter('`cityid`') . " ORDER BY `id` DESC");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $key => $value) {
			array_push($businessList, array(
				"id" => $value['id'],
				"title" => $value['title']
			));
		}
	}
	$huoniaoTag->assign('businessList', $businessList);

	//js
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
