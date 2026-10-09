<?php
/**
 * 添加小区
 *
 * @version        $Id: communityAdd.php 2014-1-8 下午16:34:13 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "communityAdd.html";

$tab = "house_community";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改小区信息";
	checkPurview("communityEdit");
}else{
	$pagetitle = "添加新小区";
	checkPurview("communityAdd");
}
// $opendate = (int)$opendate;
if(!isset($weight)) $weight = 1;
if(!isset($state)) $state = 0;
if(empty($buildage)) $buildage = 0;
if(empty($buildarea)) $buildarea = 0;
if(empty($planarea)) $planarea = 0;
if(empty($planhouse)) $planhouse = 0;
if(empty($rongji)) $rongji = 0;
if(empty($green)) $green = 0;
if(!empty($opendate)) $opendate = GetMkTime($opendate);
if(!empty($tags)) $tags = join(",", $tags);
if(!empty($protype)) $protype = join(",", $protype);
if(empty($hot)) $hot = 0;
if(empty($rec)) $rec = 0;
if($_POST['submit'] == "提交"){
	if($token == "") die('token传递失败！');
	//二次验证
	if(trim($title) == ""){
		echo '{"state": 200, "info": "小区名称不能为空"}';
		exit();
	}
	if(trim($addrid) == ""){
		echo '{"state": 200, "info": "请选择区域板块"}';
		exit();
	}
	if(trim($addr) == ""){
		echo '{"state": 200, "info": "小区地址不能为空"}';
		exit();
	}
	if(trim($price) == ""){
		echo '{"state": 200, "info": "报价不能为空"}';
		exit();
	}
	if(empty($protype)){
		echo '{"state": 200, "info": "请选择物业类型"}';
		exit();
	}
	// if($userid == 0 && trim($user) == ''){
	// 	echo '{"state": 200, "info": "请选择房产顾问"}';
	// 	exit();
	// }else{
	// 	if($userid == 0){
	// 		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
	// 		$userResult = $dsql->dsqlOper($userSql, "results");
	// 		if(!$userResult){
	// 			echo '{"state": 200, "info": "会员不存在，请重新选择"}';
	// 			exit();
	// 		}
	// 		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '".$userResult[0]['id']."'");
	// 		$userResult = $dsql->dsqlOper($userSql, "results");
	// 		if(!$userResult){
	// 			echo '{"state": 200, "info": "经纪人不存在，请在联想列表中选择"}';
	// 			exit();
	// 		}

	// 		$userid = $userResult[0]['id'];
	// 	}else{
	// 		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `id` = ".$userid);
	// 		$userResult = $dsql->dsqlOper($userSql, "results");
	// 		if(!$userResult){
	// 			echo '{"state": 200, "info": "经纪人不存在，请在联想列表中选择"}';
	// 			exit();
	// 		}
	// 	}
	// }

	if(trim($opendate) == ""){
//		echo '{"state": 200, "info": "竣工时间不能为空"}';
//		exit();
	}

	$opendate = (int)$opendate;

	//坐标
	if(!empty($lnglat)){
		$lnglat = explode(",", $lnglat);
		$longitude = $lnglat[0];
		$latitude  = $lnglat[1];
	}

	// 全景
	$qj_type = (int)$typeidArr;
	if($qj_type == 0){
		$qj_file = $qj_pic;
	}else{
		$qj_file = $qj_url;
	}

	$userid = (int)$userid;

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `title`, `addrid`, `addr`, `longitude`, `latitude`, `subway`, `litpic`, `tags`, `post`, `buildage`, `protype`, `buildtype`, `property`, `proprice`, `protel`, `proaddr`, `water`, `heat`, `power`, `gas`, `newsletter`, `elevator`, `safe`, `clean`, `entrance`, `opendate`, `kfs`, `price`, `userid`, `weight`, `state`, `note`, `planhouse`, `parknum`, `rongji`, `planarea`, `buildarea`, `green`, `config`, `pubdate`, `video`, `qj_type`, `qj_file`, `hot`, `rec`,`titlealias`) VALUES ('$cityid', '$title', '$addrid', '$addr', '$longitude', '$latitude', '$subway', '$litpic', '$tags', '$post', '$buildage', '$protype', '$buildtype', '$property', '$proprice', '$protel', '$proaddr', '$water', '$heat', '$power', '$gas', '$newsletter', '$elevator', '$safe', '$clean', '$entrance', '$opendate', '$kfs', '$price', '$userid', '$weight', '$state', '$note', '$planhouse', '$parknum', '$rongji', '$planarea', '$buildarea', '$green', '$config', '".GetMkTime(time())."', '$video', '$qj_type', '$qj_file', $hot, $rec,'$titlealias')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){

		if($state == 1){
			updateCache("house_community_list", 300);
			clearCache("house_community_list", "key");
			clearCache("house_community_total", "key");
		}

		adminLog("添加小区信息", $title);
		$param = array(
			"service"  => "house",
			"template" => "community-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("house",$aid,"community"); //新增小区信息

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){

		$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$res = $dsql->dsqlOper($sql, "results");
		$state_ = $res[0]['state'];

		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `title` = '$title', `addrid` = '$addrid', `addr` = '$addr', `longitude` = '$longitude', `latitude` = '$latitude', `subway` = '$subway', `litpic` = '$litpic', `tags` = '$tags', `post` = '$post', `buildage` = '$buildage', `protype` = '$protype', `buildtype` = '$buildtype', `property` = '$property', `proprice` = '$proprice', `protel` = '$protel', `proaddr` = '$proaddr', `water` = '$water', `heat` = '$heat', `power` = '$power', `gas` = '$gas', `newsletter` = '$newsletter', `elevator` = '$elevator', `safe` = '$safe', `clean` = '$clean', `entrance` = '$entrance', `opendate` = '$opendate', `kfs` = '$kfs', `price` = '$price', `userid` = '$userid', `weight` = '$weight', `state` = '$state', `note` = '$note', `planhouse` = '$planhouse', `parknum` = '$parknum', `rongji` = '$rongji', `planarea` = '$planarea', `buildarea` = '$buildarea', `green` = '$green', `config` = '$config', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `hot` = '$hot', `rec` = '$rec',`titlealias` = '$titlealias' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			// 清除缓存
			clearCache("house_community_detail", $id);
			checkCache("house_community_list", $id);
			if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
				clearCache("house_community_total", "key");
			}

			adminLog("修改小区信息", $title);

			$param = array(
				"service"  => "house",
				"template" => "community-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("house",$id,"community"); //修改小区信息
			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title      = $results[0]['title'];
			$addrid     = $results[0]['addrid'];
			$addr       = $results[0]['addr'];
			$longitude  = $results[0]['longitude'];
			$latitude   = $results[0]['latitude'];
			$subway     = $results[0]['subway'];
			$litpic     = $results[0]['litpic'];
			$tags       = $results[0]['tags'];
			$titlealias   = $results[0]['titlealias'];
			$post       = $results[0]['post'];
			$buildage   = $results[0]['buildage'];
			$protype    = $results[0]['protype'];
			$buildtype  = $results[0]['buildtype'];
			$property   = $results[0]['property'];
			$proprice   = $results[0]['proprice'];
			$protel     = $results[0]['protel'];
			$proaddr    = $results[0]['proaddr'];
			$water      = $results[0]['water'];
			$heat       = $results[0]['heat'];
			$power      = $results[0]['power'];
			$gas        = $results[0]['gas'];
			$newsletter = $results[0]['newsletter'];
			$elevator   = $results[0]['elevator'];
			$safe       = $results[0]['safe'];
			$clean      = $results[0]['clean'];
			$entrance   = $results[0]['entrance'];
			$opendate   = $results[0]['opendate'];
			$kfs        = $results[0]['kfs'];
			$price      = $results[0]['price'];
			$userid     = $results[0]['userid'];
			$weight     = $results[0]['weight'];
			$state      = $results[0]['state'];
			$note       = $results[0]['note'];
			$planhouse  = $results[0]['planhouse'];
			$parknum    = $results[0]['parknum'];
			$rongji     = $results[0]['rongji'];
			$planarea   = $results[0]['planarea'];
			$buildarea  = $results[0]['buildarea'];
			$green      = $results[0]['green'];
			$config     = $results[0]['config'];
			$cityid     = $results[0]['cityid'];
			$video      = $results[0]['video'];
			$qj_type    = $results[0]['qj_type'];
			$qj_file    = $results[0]['qj_file'];
			$hot    = $results[0]['hot'];
			$rec    = $results[0]['rec'];

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

// 验证重复标题
}else if($action == "checkTitle"){
    $title = $_POST['title'];
    $id = (int)$_POST['id'];
    if($title){
        $where = $id ? " AND `id` <> $id" : "";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `title` = '$title'".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            echo $ret[0]['id'];
        }else{
            echo 0;
        }
    }
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/communityAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	// require_once(HUONIAOINC."/config/house.inc.php");
	// global $customUpload;
	// if($customUpload == 1){
	// 	global $custom_thumbSize;
	// 	global $custom_thumbType;
	// 	$huoniaoTag->assign('thumbSize', $custom_thumbSize);
	// 	$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	// }
	// $huoniaoTag->assign('mapCity', $cfg_mapCity);
	// $huoniaoTag->assign('subwayCity', $customSubwayCity);

	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);

	$huoniaoTag->assign('addr', $addr);
	$huoniaoTag->assign('lnglat', $longitude.','.$latitude);
	$huoniaoTag->assign('subway', $subway);

	$subwaySelected = "";
	if(!empty($subway)){
		$subway = explode(",", $subway);
		foreach($subway as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__site_subway_station` WHERE `id` = $val");
			$results = $dsql->dsqlOper($archives, "results");
			$name = $results ? $results[0]['title'] : "";
			$subwaySelected .= '<span data-id="'.$val.'">'.$name.'<a href="javascript:;">×</a></span>';
		}
	}
	$huoniaoTag->assign('subwaySelected', $subwaySelected);

	$huoniaoTag->assign('litpic', $litpic);

	//小区特色
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 76 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$tagslist = array();
	$tagsval  = array();
	foreach($results as $value){
		array_push($tagslist, $value['typename']);
		array_push($tagsval, $value['id']);
	}

	$huoniaoTag->assign('tagslist', $tagslist);
	$huoniaoTag->assign('tagsval', $tagsval);
	$huoniaoTag->assign('tags', explode(",", $tags));

	

	//物业类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 1 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$protypelist = array();
	$protypeval  = array();
	foreach($results as $value){
		array_push($protypelist, $value['typename']);
		array_push($protypeval, $value['id']);
	}
	$huoniaoTag->assign('protypelist', $protypelist);
	$huoniaoTag->assign('protypeval', $protypeval);
	$huoniaoTag->assign('protype', explode(",", $protype));

	//建筑类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	foreach($results as $value){
		array_push($list, $value['typename']);
	}
	$huoniaoTag->assign('buildlist', $list);

	$huoniaoTag->assign('property', $property);
	$huoniaoTag->assign('proprice', $proprice);
	$huoniaoTag->assign('opendate', !empty($opendate) ? date("Y-m-d", $opendate) : "");
	$huoniaoTag->assign('kfs', $kfs);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('userid', $userid);

	// $username = "";
	// if($userid != 0){
	// 	//会员
	// 	$userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_gw` WHERE `id` = ". $userid);
	// 	$user = $dsql->getTypeName($userSql);
	// 	if($userid && $user){
	// 		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $user[0]['userid']);
	// 		$username = $dsql->getTypeName($userSql);
	// 		if($username){
	// 			$username = $username[0]['username'];
	// 		}
	// 	}
	// }
	// $huoniaoTag->assign('username', $username);
	$huoniaoTag->assign('weight', $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('buildtype', $buildtype);
	$huoniaoTag->assign('post', $post);
	$huoniaoTag->assign('buildage', $buildage);
	$huoniaoTag->assign('planarea', $planarea);
	$huoniaoTag->assign('protel', $protel);
	$huoniaoTag->assign('proaddr', $proaddr);
	$huoniaoTag->assign('water', $water);
	$huoniaoTag->assign('heat', $heat);
    $huoniaoTag->assign('titlealias', $titlealias);
	$huoniaoTag->assign('power', $power);
	$huoniaoTag->assign('gas', $gas);
	$huoniaoTag->assign('newsletter', $newsletter);
	$huoniaoTag->assign('elevator', $elevator);
	$huoniaoTag->assign('safe', $safe);
	$huoniaoTag->assign('clean', $clean);
	$huoniaoTag->assign('entrance', $entrance);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('planhouse', $planhouse == 0 ? "" : $planhouse);
	$huoniaoTag->assign('parknum', $parknum);
	$huoniaoTag->assign('rongji', $rongji == 0 ? "" : $rongji);
	$huoniaoTag->assign('buildarea', $buildarea == 0 ? "" : $buildarea);
	$huoniaoTag->assign('green', $green == 0 ? "" : $green);
    $huoniaoTag->assign('cityid', $cityid);

	$configHtml = "";
	if(!empty($config)){
		$configArr = explode("|||", $config);
		foreach ($configArr as $key => $value) {
			$item = explode("###", $value);
			$configHtml .= '<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" value="'.$item[0].'" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容">'.$item[1].'</textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>';
		}
	}
	$huoniaoTag->assign('configHtml', $configHtml);

	// 视频 -------------
	$huoniaoTag->assign('video', $video);

	// 全景 -------------
	$huoniaoTag->assign('qj_type', (int)$qj_type);
	$huoniaoTag->assign('qj_file', $qj_file);
	$huoniaoTag->assign('typeidArr', array('0', '1'));
	$huoniaoTag->assign('typeidNames',array('图片','url'));

	$huoniaoTag->assign('hot', $hot);
	$huoniaoTag->assign('rec', $rec);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
