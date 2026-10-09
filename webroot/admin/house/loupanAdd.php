<?php
/**
 * 添加楼盘
 *
 * @version        $Id: loupanAdd.php 2014-1-8 下午16:34:13 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "loupanAdd.html";

$tab = "house_loupan";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改楼盘信息";
	checkPurview("loupanEdit");
}else{
	$pagetitle = "添加新楼盘";
	checkPurview("loupanAdd");
}

$id = $_REQUEST['id'];

if(empty($views)) $views = 1;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($salestate)) $salestate = 0;
if(empty($hot)) $hot = 0;
if(empty($rec)) $rec = 0;
if(empty($tuan)) $tuan = 0;
if(empty($zhuangxiu)) $zhuangxiu = 0;
if(empty($planarea)) $planarea = 0;
if(empty($buildarea)) $buildarea = 0;
if(empty($planhouse)) $planhouse = 0;
if(empty($rongji)) $rongji = 0;
if(empty($green)) $green = 0;
if(!empty($protype)) $protype = join(",", $protype);
if(!empty($feature)) $feature = join(",", $feature);

if(empty($advertising)) $advertising =0;

$existing = (int)$existing;

$deliverdate = $deliverdate ? GetMkTime($deliverdate) : 0;
$opendate = $opendate ? GetMkTime($opendate) : 0;

if($_POST['submit'] == "提交"){
	if($token == "") die('token传递失败！');
	//二次验证
	if(trim($title) == ""){
		echo '{"state": 200, "info": "楼盘名称不能为空"}';
		exit();
	}
	if(trim($addrid) == ""){
		echo '{"state": 200, "info": "请选择区域板块"}';
		exit();
	}
	if(trim($addr) == ""){
		echo '{"state": 200, "info": "楼盘地址不能为空"}';
		exit();
	}
	if(trim($deliverdate) == ""){
		// echo '{"state": 200, "info": "开盘时间不能为空"}';
		// exit();
	}
	if(trim($opendate) == ""){
		// echo '{"state": 200, "info": "交房不能为空"}';
		// exit();
	}
	if(trim($price) == ""){
		echo '{"state": 200, "info": "售价不能为空"}';
		exit();
	}

	$tuanbegan = $tuanbegan == "" ? 0 : GetMkTime($tuanbegan);
	$tuanend   = $tuanend == "" ? 0 : GetMkTime($tuanend);

	if($tuan == 1){
		if(empty($tuantitle)){
			echo '{"state": 200, "info": "请输入团购标题"}';
			exit();
		}
		if(empty($tuanbegan)){
			echo '{"state": 200, "info": "请输入团购开始时间"}';
			exit();
		}
		if(empty($tuanend)){
			echo '{"state": 200, "info": "请输入团购结束时间"}';
			exit();
		}
		if($tuanend - $tuanbegan < 0){
			echo '{"state": 200, "info": "结束时间不能小于开始时间"}';
			exit();
		}
	}

	// if($userid == 0 && trim($user) == ''){
	// 	echo '{"state": 200, "info": "请选择置业顾问"}';
	// 	exit();
	// }else{
	// 	if($userid == 0){
	// 		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$username."'");
	// 		$userResult = $dsql->dsqlOper($userSql, "results");
	// 		if($userResult){
	// 			//会员
	// 			$gwSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `userid` = ". $userResult[0]['id']);
	// 			$gwname = $dsql->getTypeName($gwSql);
	//
	// 			if(!$gwname){
	// 				echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
	// 				exit();
	// 			}
	// 			$userid = $gwname[0]['id'];
	// 		}else{
	// 			echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
	// 			exit();
	// 		}
	// 	}else{
	// 		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw` WHERE `id` = ".$userid);
	// 		$userResult = $dsql->dsqlOper($userSql, "results");
	// 		if(!$userResult){
	// 			echo '{"state": 200, "info": "置业顾问不存在，请在联想列表中选择"}';
	// 			exit();
	// 		}
	// 	}
	// }

	$userid = empty($userid) ? "" : join(",", $userid);

	if(trim($investor) == ""){
		echo '{"state": 200, "info": "投资商不能为空"}';
		exit();
	}
	if(empty($protype)){
		echo '{"state": 200, "info": "请选择物业类型"}';
		exit();
	}
	if(trim($address) == ""){
		echo '{"state": 200, "info": "售楼处地址不能为空"}';
		exit();
	}
	// if(trim($tel) == ""){
	// 	echo '{"state": 200, "info": "售楼处电话不能为空"}';
	// 	exit();
	// }
	if(empty($zhuangxiu)){
		echo '{"state": 200, "info": "请选择装修情况"}';
		exit();
	}
	if(empty($buildage)){
		echo '{"state": 200, "info": "产权年限不能为空"}';
		exit();
	}


	//坐标
	if(!empty($lnglat)){
		$lnglat = explode(",", $lnglat);
		$longitude = $lnglat[0];
		$latitude  = $lnglat[1];
	}

	if(!empty($manageuid)){

	    $loupansql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `manageuid` = '$manageuid'");

	    $loupanres = $dsql->dsqlOper($loupansql,"results");

	    if(!empty($loupanres) && $loupanres[0]['id'] != $id){
            echo '{"state": 200, "info": "该用户已管理其他楼盘!"}';
            exit();
        }
    }

	//带访确认单打印模板
    $receipt = array();
    $receipt['image'] = $receiptImg;

    $receiptArr = array();
    if($receiptData){
        $receiptData = explode('|||', $receiptData);
        foreach ($receiptData as $key => $value) {
            //rid, fontsize, color, width, height, left, top, pic, note
            $v = explode('@@', $value);

            array_push($receiptArr, array(
                'id' => $v[0],
                'fontsize' => $v[1],
                'color' => $v[2],
                'width' => $v[3],
                'height' => $v[4],
                'left' => $v[5],
                'top' => $v[6],
                'pic' => $v[7],
                'note' => $v[8]
            ));

        }
    }
    $receipt['data'] = $receiptArr;
    $visitConfirmPrintTemplate = serialize($receipt);
}

if($dopost == "save" && $submit == "提交"){
    $fenxiaotime = strtotime($fenxiaotime);
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`phone`, `cityid`, `title`, `addrid`, `addr`, `longitude`, `latitude`, `subway`, `litpic`, `bussiness`, `deliverdate`, `opendate`, `price`, `ptype`, `views`, `weight`, `state`, `salestate`, `hot`, `rec`, `tuan`, `tuantitle`, `tuanbegan`, `tuanend`, `userid`, `investor`, `protype`, `address`, `tel`, `worktime`, `note`, `buildtype`,`buildtypeval`,`zhuangxiu`, `buildage`, `planarea`, `buildarea`, `planhouse`, `linklocal`, `parknum`, `rongji`, `green`, `floor`, `property`, `proprice`, `config`, `pubdate`, `onsale_hx`, `existing`, `banner`,`fenxaiotype`,`fenxiaotime`,`fenxiaotitle`,`manageuid`,`is_vipguanggao`,`titlealias`, `visitConfirmPrintTemplate`, `feature`) VALUES ('$phone', '$cityid', '$title', '$addrid', '$addr', '$longitude', '$latitude', '$subway', '$litpic', '$bussiness', '$deliverdate', '$opendate', '$price', '$ptype', '$views', '$weight', '$state', '$salestate', '$hot', '$rec', '$tuan', '$tuantitle', '$tuanbegan', '$tuanend', '$userid', '$investor', '$protype', '$address', '$tel', '$worktime', '$note', '$buildtype','$buildlist','$zhuangxiu', '$buildage', '$planarea', '$buildarea', '$planhouse', '$linklocal', '$parknum', '$rongji', '$green', '$floor', '$property', '$proprice', '$config', '".GetMkTime(time())."', '$onsale_hx', '$existing', '$banner','$fenxaiotype','$fenxiaotime','$fenxiaotitle','$manageuid','$advertising','$titlealias', '$visitConfirmPrintTemplate', '$feature')");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){

		if($state == 1){
			clearCache("house_loupan_list", "key");
			clearCache("house_loupan_total", "key");
		}

		adminLog("添加楼盘信息", $title);

		$param = array(
			"service"  => "house",
			"template" => "loupan-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("house",$aid,"loupan");  // 新增楼盘
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

        $fenxiaotime = strtotime($fenxiaotime);
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `phone`='$phone', `cityid` = '$cityid', `title` = '$title', `addrid` = '$addrid', `addr` = '$addr', `longitude` = '$longitude', `latitude` = '$latitude', `subway` = '$subway', `litpic` = '$litpic', `bussiness` = '$bussiness', `deliverdate` = '$deliverdate', `opendate` = '$opendate', `price` = '$price', `ptype` = '$ptype', `views` = '$views', `weight` = '$weight', `state` = '$state', `salestate` = '$salestate', `hot` = '$hot', `rec` = '$rec', `tuan` = '$tuan', `tuantitle` = '$tuantitle', `tuanbegan` = '$tuanbegan', `tuanend` = '$tuanend', `userid` = '$userid', `investor` = '$investor', `protype` = '$protype', `address` = '$address', `tel` = '$tel', `worktime` = '$worktime', `note` = '$note', `buildtype` = '$buildtype',`buildtypeval` = '$buildlist', `zhuangxiu` = '$zhuangxiu', `buildage` = '$buildage', `planarea` = '$planarea', `buildarea` = '$buildarea', `planhouse` = '$planhouse', `linklocal` = '$linklocal', `parknum` = '$parknum', `rongji` = '$rongji', `green` = '$green', `floor` = '$floor', `property` = '$property', `proprice` = '$proprice', `config` = '$config', `pubdate` = '".GetMkTime(time())."', `onsale_hx` = '$onsale_hx', `existing` = '$existing', `banner` = '$banner',`fenxaiotype`  = '$fenxaiotype',`fenxiaotime` = '$fenxiaotime',`fenxiaotitle`= '$fenxiaotitle',`manageuid` = '$manageuid',`is_vipguanggao` ='$advertising',`titlealias` = '$titlealias', `visitConfirmPrintTemplate` = '$visitConfirmPrintTemplate', `feature` = '$feature' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){

			// 清除缓存
			clearCache("house_loupan_detail", $id);
			checkCache("house_loupan_list", $id);
			if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
				clearCache("house_loupan_total", "key");
			}

			adminLog("修改楼盘信息", $title);

			$param = array(
				"service"  => "house",
				"template" => "loupan-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);

			// 更新顾问业绩数据
			if($userid == ""){
				$sql = $dsql->SetQuery("UPDATE `#@__house_gw_tj` SET `state` = 0 WHERE `loupan` = $id");
				$dsql->dsqlOper($sql, "update");
			}else{
				$useridArr = explode(",", $userid);

				$sql = $dsql->SetQuery("UPDATE `#@__house_gw_tj` SET `state` = 0 WHERE `loupan` = $id");
	 			$res = $dsql->dsqlOper($sql, "update");

				foreach ($useridArr as $k => $v) {
				 	$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_gw_tj` WHERE `loupan` = $id AND `gw` = $v");
				 	$ret = $dsql->dsqlOper($sql, "results");
				 	if($ret){
			 			$sql = $dsql->SetQuery("UPDATE `#@__house_gw_tj` SET `state` = 1 WHERE `id` = ".$ret[0]['id']);
			 			$dsql->dsqlOper($sql, "update");
				 	}else{
				 		$sql = $dsql->SetQuery("INSERT INTO `#@__house_gw_tj` (`loupan`, `gw`, `see`, `suc`, `state`) VALUES ($id, $v, 0, 0, 1)");
			 			$dsql->dsqlOper($sql, "lastid");
				 	}
				 }
			}
            dataAsync("house",$id,"loupan");  // 修改楼盘
			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			$title        = $results[0]['title'];
            $titlealias   = $results[0]['titlealias'];
            $addrid       = $results[0]['addrid'];
			$addr         = $results[0]['addr'];
			$cityid       = $results[0]['cityid'];

			$lnglat = "";
			if(!empty($results[0]['longitude']) && !empty($results[0]['latitude'])){
				$lnglat = $results[0]['longitude'] . ',' . $results[0]['latitude'];
			}

			$subway       = $results[0]['subway'];
			$litpic       = $results[0]['litpic'];
			$bussiness    = $results[0]['bussiness'];
			$deliverdate  = $results[0]['deliverdate'];
			$opendate     = $results[0]['opendate'];
			$price        = $results[0]['price'];
			$ptype        = $results[0]['ptype'];
			$views        = $results[0]['views'];
			$weight       = $results[0]['weight'];
			$state        = $results[0]['state'];
			$salestate    = $results[0]['salestate'];
			$hot          = $results[0]['hot'];
			$rec          = $results[0]['rec'];
			$tuan         = $results[0]['tuan'];
			$tuantitle    = $results[0]['tuantitle'];
			$tuanbegan    = $results[0]['tuanbegan'];
			$tuanend      = $results[0]['tuanend'];
			$userid       = $results[0]['userid'];
			$investor     = $results[0]['investor'];
			$protype      = $results[0]['protype'];
			$address      = $results[0]['address'];
			$tel          = $results[0]['tel'];
			$worktime     = $results[0]['worktime'];
			$note         = $results[0]['note'];
			$buildtype    = $results[0]['buildtype'];
			$zhuangxiu    = $results[0]['zhuangxiu'];
			$buildage     = $results[0]['buildage'];
			$planarea     = $results[0]['planarea'];
			$buildarea    = $results[0]['buildarea'];
			$planhouse    = $results[0]['planhouse'];
			$linklocal    = $results[0]['linklocal'];
            $manageuid    = $results[0]['manageuid'];
			$parknum      = $results[0]['parknum'];
			$rongji       = $results[0]['rongji'];
			$green        = $results[0]['green'];
			$floor        = $results[0]['floor'];
			$property     = $results[0]['property'];
			$proprice     = $results[0]['proprice'];
			$config       = $results[0]['config'];
			$onsale_hx    = $results[0]['onsale_hx'];
			$existing     = $results[0]['existing'];
			$banner       = $results[0]['banner'];
			$phone        = $results[0]['phone'];
			$fenxaiotype  = $results[0]['fenxaiotype'];
			$fenxiaotime  = $results[0]['fenxiaotime'];
			$fenxiaotitle = $results[0]['fenxiaotitle'];
			$advertising  = $results[0]['is_vipguanggao'];
			$visitConfirmPrintTemplate  = $results[0]['visitConfirmPrintTemplate'];
            $feature      = $results[0]['feature'];

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
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `title` = '$title'".$where);
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

	//css
	$cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css',
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/chosen.jquery.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.event.drag-2.2.js',
		'ui/jquery.ajaxFileUpload.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/house/loupanAdd.js'
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
    $huoniaoTag->assign('cityid', $cityid);


	$huoniaoTag->assign('addr', $addr);
	$huoniaoTag->assign('lnglat', $lnglat);

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

    $huoniaoTag->assign('manageuid', $manageuid);
    if($manageuid!=''){

        $userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $manageuid);
        $username = $dsql->getTypeName($userSql);
        $huoniaoTag->assign('managename', $username[0]['username']);
    }

	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('bussiness', $bussiness);
	$huoniaoTag->assign('deliverdate', !empty($deliverdate) ? date("Y-m-d", $deliverdate) : "");
	$huoniaoTag->assign('opendate', !empty($opendate) ? date("Y-m-d", $opendate) : "");
	$huoniaoTag->assign('price', $price);

	$currency = echoCurrency(array("type" => "short"));
	$huoniaoTag->assign('ptypeList', array("1" => "{$currency}/㎡", "2" => "万{$currency}/套"));
	$huoniaoTag->assign('ptype', $ptype == "" ? 1 : $ptype);

	$huoniaoTag->assign('views', $views);
	$huoniaoTag->assign('weight', $weight);
	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	//销售状态
	$huoniaoTag->assign('salestateopt', array('0', '1', '2', '3'));
	$huoniaoTag->assign('salestatenames',array('新盘待售','在售','尾盘','售磬'));
	$huoniaoTag->assign('salestate', $salestate == "" ? 1 : $salestate);

    /*广告*/
    $huoniaoTag->assign('advertisingopt', array('0', '1'));
    $huoniaoTag->assign('advertisingnames',array('显示','隐藏'));
    $huoniaoTag->assign('advertising', $advertising == "" ? 1 : $advertising);

	//现房期房
	$huoniaoTag->assign('existingopt', array('1', '2'));
	$huoniaoTag->assign('existingnames',array('现房','期房'));
	$huoniaoTag->assign('existing', (int)$existing);

	/*全民分销*/
    $huoniaoTag->assign('fenxaiotypeopt', array('0', '1'));
    $huoniaoTag->assign('fenxiaonames',array('关闭','开启'));
    $huoniaoTag->assign('fenxaiotype', (int)$fenxaiotype);

    $huoniaoTag->assign('fenxiaotime', $fenxiaotime!='' ?date('Y-m-d',$fenxiaotime):'');
    $huoniaoTag->assign('fenxiaotitle', $fenxiaotitle);

	$huoniaoTag->assign('phone', $phone);
	$huoniaoTag->assign('hot', $hot);
    $huoniaoTag->assign('titlealias', $titlealias);

    $huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('tuan', $tuan);
	$huoniaoTag->assign('tuantitle', $tuantitle);
	$huoniaoTag->assign('tuanbegan', $tuanbegan == 0 ? "" : date("Y-m-d H:i:s", $tuanbegan));
	$huoniaoTag->assign('tuanend', $tuanend == 0 ? "" : date("Y-m-d H:i:s", $tuanend));
	$huoniaoTag->assign('userid', $userid == "" ? array() : explode(",", $userid));

	// $username = "";
	// if($userid != 0){
	// 	//会员
	// 	$gwSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_gw` WHERE `id` = ". $userid);
	// 	$gwname = $dsql->getTypeName($gwSql);
	// 	if($gwname){
	// 		$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $gwname[0]['userid']);
	// 		$username = $dsql->getTypeName($userSql);
	// 		$username = $username[0]['username'];
	// 	}
	// }
	// $huoniaoTag->assign('username', $username);

	//查询所有顾问
	$gwSql = $dsql->SetQuery("SELECT g.`id`, g.`state`, m.`nickname` name FROM `#@__house_gw` g LEFT JOIN `#@__member` m ON m.`id` = g.`userid` WHERE m.`id` IS NOT NULL");
	$gwList = $dsql->dsqlOper($gwSql, "results");

	$huoniaoTag->assign('gwList', $gwList ? $gwList : array());

	$huoniaoTag->assign('investor', $investor);

	//楼盘特色
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 666 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$featurelist = array();
	$featureval  = array();
	foreach($results as $value){
		array_push($featurelist, $value['typename']);
		array_push($featureval, $value['id']);
	}
	$huoniaoTag->assign('featurelist', $featurelist);
	$huoniaoTag->assign('featureval', $featureval);
	$huoniaoTag->assign('feature', explode(",", $feature));

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

	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('worktime', $worktime);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('buildtype', $buildtype);
	//装修情况
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 2 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array(0 => '请选择');
	foreach($results as $value){
		$list[$value['id']] = $value['typename'];
	}
	$huoniaoTag->assign('zhuangxiuList', $list);
	$huoniaoTag->assign('zhuangxiu', $zhuangxiu == "" ? 0 : $zhuangxiu);

	$huoniaoTag->assign('buildage', $buildage);
	$huoniaoTag->assign('planarea', $planarea == 0 ? "" : $planarea);
	$huoniaoTag->assign('buildarea', $buildarea == 0 ? "" : $buildarea);
	$huoniaoTag->assign('planhouse', $planhouse == 0 ? "" : $planhouse);
	$huoniaoTag->assign('linklocal', $linklocal);
	$huoniaoTag->assign('parknum', $parknum);
	$huoniaoTag->assign('rongji', $rongji == 0 ? "" : $rongji);
	$huoniaoTag->assign('green', $green == 0 ? "" : $green);
	$huoniaoTag->assign('floor', $floor);
	$huoniaoTag->assign('property', $property);
	$huoniaoTag->assign('proprice', $proprice);


    $huoniaoTag->assign('pics', json_encode(!empty($banner) ? array($banner) : array()));

	$huoniaoTag->assign('banner', $banner);

	$configHtml = "";
	if(!empty($config)){
		$configArr = explode("|||", $config);
		foreach ($configArr as $key => $value) {
			$item = explode("###", $value);
			$configHtml .= '<dl class="clearfix"><dt><input type="text" placeholder="名称" class="input-small" value="'.$item[0].'" /></dt><dd><textarea rows="3" class="input-xxlarge" placeholder="内容">'.$item[1].'</textarea><a href="javascript:;" class="icon-trash" title="删除"></a></dd></dl>';
		}
	}
	$huoniaoTag->assign('configHtml', $configHtml);

	$huoniaoTag->assign('onsale_hx', $onsale_hx);
	$huoniaoTag->assign('existing', $existing);

	//建筑类型
	$archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	foreach($results as $value){
		array_push($list, $value['typename']);
	}
	$huoniaoTag->assign('buildlist', $list);

	//带访确认单打印模板
    $receiptArr = $visitConfirmPrintTemplate ? unserialize($visitConfirmPrintTemplate) : array();
	$huoniaoTag->assign('receipt', $receiptArr);
	$huoniaoTag->assign('receiptImage', $receiptArr && $receiptArr['image'] ? getFilePath($receiptArr['image']) : '');
	$huoniaoTag->assign('receiptData', $receiptArr && $receiptArr['data'] ? json_encode($receiptArr['data']) : json_encode(array()));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
