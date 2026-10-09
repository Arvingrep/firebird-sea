<?php
/**
 * 添加厂房/仓库
 *
 * @version        $Id: houseCfAdd.php 2014-1-18 下午14:01:21 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseCfAdd.html";

$tab = "house_cf";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改厂房/仓库";
	checkPurview("houseCfEdit");
}else{
	$pagetitle = "添加厂房/仓库";
	checkPurview("houseCfAdd");
}

if(empty($addrid)) $addrid = 0;
if(empty($price)) $price = 0;
if(empty($transfer)) $transfer = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($userid)) $userid = 0;
if(empty($sellstate)) $sellstate = 0;

if(empty($advertising)) $advertising =0;
if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入厂房/仓库名称！"}';
		exit();
	}
	if(empty($addrid)){
		echo '{"state": 200, "info": "请选择所处区域！"}';
		exit();
	}
	if(empty($address)){
		echo '{"state": 200, "info": "请输入详细地址！"}';
		exit();
	}

	if($usertype == 0){
		if(empty($username)){
			echo '{"state": 200, "info": "请输入联系人！"}';
			exit();
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$users."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if(!$userResult){
			echo '{"state": 200, "info": "会员不存在，请重新选择"}';
			exit();
		}
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '".$userResult[0]['id']."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "该会员为经纪人，请选择个人会员！"}';
			exit();
		}
		if(empty($contact)){
			echo '{"state": 200, "info": "请输入联系电话！"}';
			exit();
		}
	}else{
		if($userid == 0 && trim($user) == ''){
			echo '{"state": 200, "info": "请选择中介"}';
			exit();
		}
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请重新选择"}';
				exit();
			}
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '".$userResult[0]['id']."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "经纪人不存在，请在联想列表中选择"}';
				exit();
			}

			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "经纪人不存在，请在联想列表中选择"}';
				exit();
			}
		}
	}

	if(trim($note) == ""){
		// echo '{"state": 200, "info": "请输入房源介绍"}';
		// exit();
	}

	$cenggao  = (float)$cenggao;
	$paytype = (int)$paytype;
	$bno     = (int)$bno;
	$floor   = (int)$floor;

	// 全景
	$qj_type = (int)$typeidArr;
	if($qj_type == 0){
		$qj_file = $qj_pic;
	}else{
		$qj_file = $qj_url;
	}

	//坐标
	if(!empty($lnglat)){
		$lnglat = explode(",", $lnglat);
		$longitude = $lnglat[0];
		$latitude  = $lnglat[1];
	}

	// 201903新增
	$floortype = (int)$floortype;
	$floorspr  = $floortype ? (int)$floorspr : 0;
	$sex       = (int)$sex;
	$wx_tel    = (int)$wx_tel;
	$wuye_in   = (int)$wuye_in;

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `type`, `title`, `addrid`, `address`, `nearby`, `litpic`, `protype`, `area`, `price`, `transfer`, `usertype`, `userid`, `username`, `contact`, `note`, `mbody`, `weight`, `state`,`sellstate`, `pubdate`, `video`, `qj_type`, `qj_file`, `cenggao`, `proprice`, `paytype`, `bno`, `floor`, `mintime`, `longitude`, `latitude`, `floortype`, `floorspr`, `sex`, `wx_tel`, `wuye_in`,`is_vipguanggao`)
		VALUES
		('$cityid', '$type', '$title', '$addrid', '$address', '$nearby', '$litpic', '$protype', '$area', '$price', '$transfer', '$usertype', '$userid', '$username', '$contact', '$note', '$mbody', '$weight', '$state', '$sellstate','".GetMkTime(time())."', '$video', '$qj_type', '$qj_file', '$cenggao', '$proprice', '$paytype', '$bno', '$floor', '$mintime', '$longitude', '$latitude', '$floortype', '$floorspr', '$sex', '$wx_tel', '$wuye_in', '$advertising')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	//保存图集表
	if($imglist != ""){
		$picList = explode(",",$imglist);
		foreach($picList as $k => $v){
			$picInfo = explode("|", $v);
			$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecf', '$aid', '$picInfo[0]', '$picInfo[1]')");
			$dsql->dsqlOper($pics, "update");
		}
	}

	if($aid){
		adminLog("添加厂房/仓库信息", $title);

		$param = array(
			"service"  => "house",
			"template" => "cf-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("house",$aid,"cf");  // 房产-厂房-发布信息
		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		if($type=='0'){
			$sellstate = $sellstate1; //出租
		}elseif($type=='1'){
			$sellstate = $sellstate2; //转让
		}
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `type` = '$type', `title` = '$title', `addrid` = '$addrid', `address` = '$address', `nearby` = '$nearby', `litpic` = '$litpic', `protype` = '$protype', `area` = '$area', `price` = '$price', `transfer` = '$transfer', `usertype` = '$usertype', `userid` = '$userid', `username` = '$username', `contact` = '$contact', `note` = '$note', `mbody` = '$mbody', `weight` = '$weight', `state` = '$state',`sellstate` = '$sellstate', `pubdate` = '".GetMkTime(time())."', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `cenggao` = '$cenggao', `proprice` = '$proprice', `paytype` = '$paytype', `bno` = '$bno', `floor` = '$floor', `mintime` = '$mintime', `longitude` = '$longitude', `latitude` = '$latitude', `floortype` = '$floortype', `floorspr` = '$floorspr', `sex` = '$sex', `wx_tel` = '$wx_tel', `wuye_in` = '$wuye_in',`is_vipguanggao` = '$advertising' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//先删除文档所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = ".$id);
		$dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",", $imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecf', '$id', '$picInfo[0]', '$picInfo[1]')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		if($results == "ok"){
			adminLog("修改厂房/仓库信息", $title);

			$param = array(
				"service"  => "house",
				"template" => "cf-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("house",$id,"cf");  // 房产-厂房-修改信息
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

			foreach ($results[0] as $key => $value) {
				${$key} = $value;
			}

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = $value["picPath"];
					$imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/houseCfAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/house.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}
	$huoniaoTag->assign('id', $id);

	//供求方式
	$huoniaoTag->assign('typeopt', array('0', '1', '2'));
	$huoniaoTag->assign('typenames',array('出租','转让', '出售'));
	$huoniaoTag->assign('type', $type == "" ? 0 : $type);

	$huoniaoTag->assign('title', $title);

	//区域
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('address', $address);
    $huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('price', $price == 0 ? 0 : $price);
	$huoniaoTag->assign('transfer', $transfer == 0 ? "" : $transfer);

	//物业类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 10 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('protypeList', $list);
	$huoniaoTag->assign('protype', $protype == "" ? 0 : $protype);

	$huoniaoTag->assign('regcom', $regcom);
	$huoniaoTag->assign('area', $area);

	//房源性质
	$huoniaoTag->assign('usertypeopt', array('0', '1'));
	$huoniaoTag->assign('usertypenames',array('个人','中介'));
	$huoniaoTag->assign('usertype', $usertype == "" ? 0 : $usertype);

	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('username', $username);
	if($usertype == 0){
		$userSql = $dsql->SetQuery("SELECT `username`, `phone` FROM `#@__member` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		$huoniaoTag->assign('user', $username[0]["username"]);
	}else{
		//会员
		$userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_zjuser` WHERE `id` = ". $userid);
		$username = $dsql->getTypeName($userSql);
		if($username){
			$userSql = $dsql->SetQuery("SELECT `username`, `phone` FROM `#@__member` WHERE `id` = ". $username[0]["userid"]);
			$username = $dsql->getTypeName($userSql);
			$huoniaoTag->assign('user', $username[0]["username"]);
		}
	}

	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//出售状态
	$huoniaoTag->assign('sellopt', array('0', '1'));
	$huoniaoTag->assign('selltypename', "出售状态");
	$huoniaoTag->assign('sellnames',array('未出售','已出售'));
	$huoniaoTag->assign('sell', $sellstate == "" ? 0 : $sellstate);

	//出租状态
	$huoniaoTag->assign('sellopt1', array('0','2'));
	$huoniaoTag->assign('selltypename1', "出租状态");
	$huoniaoTag->assign('sellnames1',array('未出租','已出租'));
	$huoniaoTag->assign('sell1', $sellstate == "" ? 0 : $sellstate);

	//转让状态
	$huoniaoTag->assign('sellopt2', array('0','3'));
	$huoniaoTag->assign('selltypename2', "转让状态");
	$huoniaoTag->assign('sellnames2',array('未转让','已转让'));
	$huoniaoTag->assign('sell2', $sellstate == "" ? 0 : $sellstate);

	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);

	// 视频 -------------
	$huoniaoTag->assign('video', $video);

	// 全景 -------------
	$huoniaoTag->assign('qj_type', (int)$qj_type);
	$huoniaoTag->assign('qj_file', $qj_file);
	$huoniaoTag->assign('typeidArr', array('0', '1'));
	$huoniaoTag->assign('typeidNames',array('图片','url'));

	$huoniaoTag->assign('cenggao', $cenggao);
	$huoniaoTag->assign('mintime', $mintime);
	$huoniaoTag->assign('bno', $bno);
	$huoniaoTag->assign('floor', $floor);
	$huoniaoTag->assign('proprice', $proprice);
	$huoniaoTag->assign('lnglat', $longitude.','.$latitude);

	//付款方式
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 5 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('paytypeList', $list);
	$huoniaoTag->assign('paytype', $paytype == "" ? 0 : $paytype);


	$huoniaoTag->assign('floorspr', $floorspr);
	$huoniaoTag->assign('sex', $sex);

	// 单层跃层
	$huoniaoTag->assign('floortypeNames', array("单层", "跃层"));
	$huoniaoTag->assign('floortypeOpt', array("0", "1"));
	$huoniaoTag->assign('floortype', $floortype == "" ? 0 : (int)$floortype);

	// 手机即微信
	$huoniaoTag->assign('wx_telNames', array("是", "否"));
	$huoniaoTag->assign('wx_telOpt', array("1", "0"));
	$huoniaoTag->assign('wx_tel', $wx_tel == "" ? 0 : (int)$wx_tel);

	// 联系人性别
	$huoniaoTag->assign('sexNames', array("男", "女"));
	$huoniaoTag->assign('sexOpt', array("1", "2"));
	$huoniaoTag->assign('sex', $sex == "" ? 0 : (int)$sex);

	// 价格是否包含物业费
	$huoniaoTag->assign('wuye_inNames', array("包含", "不含"));
	$huoniaoTag->assign('wuye_inOpt', array("1", "0"));
	$huoniaoTag->assign('wuye_in', $wuye_in == "" ? 0 : (int)$wuye_in);

    $huoniaoTag->assign('advertisingopt', array('0', '1'));
    $huoniaoTag->assign('advertisingnames',array('显示','隐藏'));
    $huoniaoTag->assign('advertising', $is_vipguanggao == "" ? 1 : $is_vipguanggao);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
