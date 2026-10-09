<?php
/**
 * 添加分类信息
 *
 * @version        $Id: infoAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/sfcar";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sfcarAdd.html";

global $handler;
$handler = true;

$action     = "sfcar";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("editInfo");
}
if(empty($userid)) $userid = 0;

if($dopost != ""){
	$pubdate = GetMkTime(time());	//发布时间
	$rec     = (int)$rec;
	$fire    = (int)$fire;
	$top     = (int)$top;

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$color       = cn_substrR($color,6);

	//获取当前管理员
	$adminid = $userLogin->getUserID();

	//获取分类下相应字段
	$infoitem = $dsql->SetQuery("SELECT `id`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default` FROM `#@__".$action."typeitem` WHERE `tid` = ".$typeid." ORDER BY `orderby` DESC");
	$itemResults = $dsql->dsqlOper($infoitem, "results");

	$valid = empty($valid) ? 0 : GetMkTime($valid);  //有效期

}

if(empty($click)) $click = mt_rand(50, 200);

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝', 3 => '取消显示'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
        //表单二次验证
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if($userid == 0 && trim($user) == ''){
			echo '{"state": 200, "info": "请选择会员"}';
			exit();
		}
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
		}

		//验证字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				$field = 'user_'.$value['field'];
				if($value["required"] == 1 && $$field == ""){
					if($value["formtype"] == "text"){
						echo '{"state": 200, "info": "'.$value['title'].'不能为空"}';
					}else{
						echo '{"state": 200, "info": "请选择'.$value['title'].'"}';
					}
					exit();
				}
			}
		}

		if(trim($addr) == ''){
			echo '{"state": 200, "info": "请选择所属地区"}';
			exit();
		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请输入信息内容"}';
			exit();
		}

		if(trim($person) == ''){
			echo '{"state": 200, "info": "请输入联系人信息"}';
			exit();
		}

		if(trim($tel) == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		if(empty($valid)){
			echo '{"state": 200, "info": "请选择有效期"}';
			exit();
		}



		$price = (float)$price;
		$yunfei = (float)$yunfei;

		$teladdr = getTelAddr($tel);


		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT `arcrank`, `userid`, `pubdate` FROM `#@__".$action."list` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$arcrank_ = $ret[0]['arcrank'];
//			$userid   = $ret[0]['userid'];
			$pubdate  = $ret[0]['pubdate'];

			//会员消息通知
			if($arcrank != $arcrank_){

				$state = "";
				$status = "";

				//等待审核
				if($arcrank == 0){
					$state = 0;
					$status = "进入等待审核状态。";

				//已审核
				}elseif($arcrank == 1){
					$state = 1;
					$status = "已经通过审核。";

				//审核失败
				}elseif($arcrank == 2){
					$state = 2;
					$status = "审核失败。";
				}

				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "manage",
					"action"   => "info"
				);

				//会员信息
				if($userid){
					$uinfo = $userLogin->getMemberInfo($userid);
					if($uinfo['userType'] == 2){
						$param = array(
							"service"  => "member",
							"template" => "manage",
							"action"   => "info"
						);
					}
				}

				$param['param'] = "state=".$state;

				//获取会员名
				$username = "";
				$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$username = $ret[0]['username'];
				}

				//自定义配置
				$config = array(
					"username" => $username,
					"title" => $title,
					"status" => $status,
					"date" => date("Y-m-d H:i:s", $pubdate),
					"fields" => array(
						'keyword1' => '信息标题',
						'keyword2' => '发布时间',
						'keyword3' => '进展状态'
					)
				);

				updateMemberNotice($userid, "会员-发布信息审核通知", $param, $config);

			}

		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `cityid` = ".$cityid.", `typeid` = ".$typeid.", `title` = '".$title."', `color` = '".$color."', `weight` = ".$weight.", `valid` = ".$valid.", `addr` = ".$addr.", `price` = '$price', `body` = '".$body."', `mbody` = '".$mbody."', `person` = '".$person."', `areaCode` = '$areaCode', `tel` = '".$tel."', `teladdr` = '".$teladdr."', `qq` = '".$qq."', `click` = ".$click.", `arcrank` = ".$arcrank.", `rec` = '$rec', `fire` = '$fire', `top` = '$top',`video`='$video', `yunfei` = $yunfei, `price_switch`='$price_switch', `userid`='$userid' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		//先删除信息所属字段
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."item` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {

				$user_field = 'user_'.$value['field'];
				$val = $$user_field;
				if($value['formtype'] == "checkbox" && $val){
					$val = join(",", $val);
				}

				$infoitem = $dsql->SetQuery("INSERT INTO `#@__".$action."item` (`aid`, `iid`, `value`) VALUES (".$id.", ".$value['id'].", '".$val."')");
				$dsql->dsqlOper($infoitem, "update");
			}
		}

		//先删除信息所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode(",",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES (".$id.", '".$picInfo[0]."', '".$picInfo[1]."')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		adminLog("修改分类信息", $title);

		$param = array(
			"service"     => "info",
			"template"    => "detail",
			"id"          => $id
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;


	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//固定字段
				$itemsql = $dsql->SetQuery("SELECT * FROM `#@__sfcaritem` WHERE `parentid`!=0");

				$itemres = $dsql->dsqlOper($itemsql,"results");

				$itemarr = array_combine(array_column($itemres, 'id'), array_column($itemres, 'typename'));
				$tagarr  = array(); 
				$id				= $results[0]['id'];
				$cityid 		= $results[0]['cityid'];
				$type 			= $results[0]['type'];
				$typename    	= $results[0]['type'] == 0 ? '我要用车' : '我是车主' ;
				$missiontype 	= $results[0]['missiontype'];
				$missiontime 	= $results[0]['missiontime'];
				if($v['missiontype'] ==0){

					$ymdhis = explode(' ',$results[0]['missiontime']);
					$ymd  	= $ymdhis[0];
					$his  	= $ymdhis[1];

				}

				$usetype 		= $results[0]['usetype'];
				$startaddrid 	= $results[0]['startaddrid'];
				$endaddrid 		= $results[0]['endaddrid'];
				if($results[0]['usetype'] == 1){

					if($results[0]['usetype'] == 0 ){

						$usetypename 	= '乘用车';

					}else{

						$usetypename 	= '载货车';
					}

				}else{

					if($results[0]['usetype'] == 0 ){

						$usetypename 	= '乘客';

					}else{

						$usetypename 	= '货物';
					}
				}
				$userid 		= $results[0]['userid'];
				$username 	= $results[0]['username'];
				$tel 		= $results[0]['tel'];
				$tag 						= $results[0]['tag'] ? explode(',',$results[0]['tag'])  : '' ;
				foreach ($tag as $a => $b) {

						array_push($tagarr, $itemarr[$b]);

				}
				$tag         = $results[0]['tag'];
				$tagarr      = $tagarr;
				$number 		= $results[0]['number'];
				$carseat 	= $results[0]['carseat'];
				$note 		= $results[0]['note'];
				$accessaddr  = $results[0]['accessaddr'];
				$cartype  	= $itemarr[$results[0]['cartype']];
				$startaddr  	= $results[0]['startaddr'];
				$endaddr 	= $results[0]['endaddr'];
				$onclick  	= $results[0]['onclick'];
				$pubdata  	= date("Y-m-d H:i:s",$results[0]['pubdata']);

				$piclsitarr = $results[0]['piclsit']!='' ? explode(',', $results[0]['piclsit']) : '';
				$piclsitarray =array();

				if($piclsitarray){

					for ($i=0; $i <count($piclsitarr) ; $i++) { 
						array_push($piclsitarray,getFilePath($piclsitarr[$i]));
					}
					
				}
				$piclsit 	= $piclsitarray;
					

				}else{
					ShowMsg('要修改的信息不存在或已删除！', "-1");
					die;
				}

				//图表信息
				$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."pic` WHERE `aid` = ".$id." ORDER BY `id` ASC");
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
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
//获取字段信息
}elseif($dopost == "getInfoItem"){
	if($typeid != ""){
		if(count($itemResults) > 0){
			$list = array();
			foreach ($itemResults as $key=>$value) {
				$options = "";
				if($value["options"] != ""){
					$options = join(',', preg_split("[\r\n]", $value["options"]));
				}

				$itemVal = "";
				//获取分类下相应字段
				if($id != ""){
					$infoitem = $dsql->SetQuery("SELECT `value` FROM `#@__".$action."item` WHERE `aid` = ".$id." AND `iid` = ".$value["id"]);
					$itemResults = $dsql->dsqlOper($infoitem, "results");
					$itemVal = $itemResults[0]['value'];
				}

				array_push($list, '{"id": "'.$value["id"].'", "field": "user_'.$value["field"].'", "title": "'.$value["title"].'", "type": "'.$value["formtype"].'", "required": '.$value["required"].', "options": "'.$options.'", "default": "'.$value["default"].'", "value": "'.$itemVal.'"}');
			}
			echo '{"itemList": ['.join(",", $list).']}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/info/infoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', $cityid);
	$huoniaoTag->assign('type', empty($type) ? "''" : $type);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('addr', empty($addr) ? "''" : $addr);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('yunfei', $yunfei);
	$huoniaoTag->assign('person', $person);
	$huoniaoTag->assign('areaCode', $areaCode);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('valid', !empty($valid) ? date("Y-m-d", $valid) : "");
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, $action."addr")));

	$huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('fire', $fire);
	$huoniaoTag->assign('top', $top);

	$huoniaoTag->assign('video', $video);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	//价格开关-单选
	$huoniaoTag->assign('priceopt', array('0', '1'));
	$huoniaoTag->assign('pricenames',array('开启','关闭'));
	$huoniaoTag->assign('price_switch', $price_switch==1 ? 1 : 0);  //价格开关默认开启

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/sfcar";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
