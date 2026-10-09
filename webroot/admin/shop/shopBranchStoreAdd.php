<?php
/**
 * 添加商城商铺分店
 *
 * @version        $Id: shopBranchStoreAdd.php 2014-2-11 上午10:21:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopBranchStoreAdd.html";

$tab = "shop_branch_store";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改商城店铺分店";
	checkPurview("shopBranchStoreEdit");
}else{
	$pagetitle = "添加商城店铺分店";
	checkPurview("shopBranchStoreAdd");
}

if($dopost == "del"){
    $sql        = $dsql->SetQuery("DELETE FROM `#@__shop_shopprint` WHERE `sid` = '$sid' AND `id` = '$printid' AND `type` = 1");
    $results    = $dsql->dsqlOper($sql,"update");
    if($results =="ok"){
         echo '{"state": 100, "info": '.json_encode("删除成功！").'}';die;

    } else{
        echo '{"state": 100, "info": '.json_encode("删除失败！").'}';die;

    }
}
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($certi)) $certi = 0;
if(empty($click)) $click = 0;

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入店铺名称！"}';
		exit();
	}

	if(empty($branchid)){
		echo '{"state": 200, "info": "参数错误！"}';
		exit();
	}

	if(empty($addrid)){
		echo '{"state": 200, "info": "请选择所在区域！"}';
		exit();
	}

	if(empty($industry)){
		echo '{"state": 200, "info": "请选择经营行业！"}';
		exit();
	}

	if(empty($project)){
		echo '{"state": 200, "info": "请输入主营项目！"}';
		exit();
	}

	if(empty($litpic)){
		echo '{"state": 200, "info": "请上传店铺logo！"}';
		exit();
	}

	if($userid == 0 && trim($user) == ''){
		echo '{"state": 200, "info": "请选择会员名"}';
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

	if(empty($people)){
		echo '{"state": 200, "info": "请输入联系人！"}';
		exit();
	}

	if(empty($tel)){
		echo '{"state": 200, "info": "请输入客服电话！"}';
		exit();
	}

	$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phone` = '$tel'");
	$userResult = $dsql->dsqlOper($userSql, "results");
	if(!$userResult){
		echo '{"state": 200, "info": "请填写已注册会员的手机号码"}';
		exit();
	}

	if(empty($lnglat)){
		echo '{"state": 200, "info": "请定位店铺位置！"}';
		exit();
	}

	//打印机
	if($print_config){
		$mcodearr =  array_column($print_config, 'mcode');
	    if(count($mcodearr) != count(array_unique($mcodearr))){
	        echo '{"state": 200, "info": "重复的终端号"}';
	        exit();
	    }
	    //查询有无绑定
	    foreach ($print_config as $key => $value) {

	        if ($value['id']!='') {
	            $printsql        = $dsql->SetQuery("UPDATE `#@__shop_shopprint` SET  `mcode`= '".$value['mcode']."', `msign` = '".$value['msign']."',`remarks` ='".$value['remarks']."',`bind_print` = '".$value['bind_print']."' WHERE `id` = ".$value['id']." AND `type` = 1" );

	        }else{
	            $printsql   = $dsql->SetQuery("INSERT INTO `#@__shop_shopprint` (`sid`,`mcode`,`msign`,`remarks`,`bind_print`,`type`)VALUES('$id','".$value['mcode']."','".$value['msign']."','".$value['remarks']."','".$value['bind_print']."','1')");

	        }
	        $dsql->dsqlOper($printsql, "update");

	    }
	}
	if($dopost == "save"){
		$print_state = 0;
	}

	$lnglat = explode(",", $lnglat);
	$lng = $lnglat[0];
	$lat = $lnglat[1];

	//检测是否已经注册
	if($dopost == "save"){

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "店铺名称已存在，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它店铺分店，一个会员不可以管理多个店铺分店！"}';
			exit();
		}

	}else{

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "店铺名称已存在，不可以重复添加！"}';
			exit();
		}

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `userid` = '".$userid."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已授权管理其它店铺分店，一个会员不可以管理多个店铺分店！"}';
			exit();
		}
	}

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`, `addrid`, `address`, `industry`, `project`, `logo`, `userid`, `people`, `tel`, `qq`, `click`, `weight`, `state`, `certi`, `pubdate`, `wechatcode`, `lng`, `lat`, `branchid`, `cityid`) VALUES ('$title', '$addrid', '$address', '$industry', '$project', '$litpic', '$userid', '$people', '$tel', '$qq', '$click', '$weight', '$state', '$certi', '".GetMkTime(time())."', '$wechatcode', '$lng', '$lat', '$branchid', '$cityid')");
	$aid = $dsql->dsqlOper($archives, "lastid");
	if($aid){

		adminLog("添加商城店铺分店", $title);

		$param = array(
			"service"  => "shop",
			"template" => "storebranch-detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `addrid` = '$addrid', `address` = '$address', `industry` = '$industry', `project` = '$project', `logo` = '$litpic', `userid` = '$userid', `people` = '$people', `tel` = '$tel', `qq` = '$qq', `click` = '$click', `weight` = '$weight', `state` = '$state', `certi` = '$certi', `wechatcode` = '$wechatcode', `lng` = '$lng', `lat` = '$lat',  `branchid` = '$branchid', `cityid` = '$cityid' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){
			adminLog("修改商城店铺分店", $title);

			$param = array(
				"service"  => "shop",
				"template" => "storebranch-detail",
				"id"       => $id
			);
			$url = getUrlPath($param);

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
			$address    = $results[0]['address'];
			$industry   = $results[0]['industry'];
			$project    = $results[0]['project'];
			$logo       = $results[0]['logo'];
			$userid     = $results[0]['userid'];
			$people     = $results[0]['people'];
			$contact    = $results[0]['contact'];
			$tel        = $results[0]['tel'];
			$qq         = $results[0]['qq'];
			$note       = $results[0]['note'];
			$click      = $results[0]['click'];
			$weight     = $results[0]['weight'];
			$state      = $results[0]['state'];
			$certi      = $results[0]['certi'];
			$rec        = $results[0]['rec'];
			$wechatcode = $results[0]['wechatcode'];
			$lng        = $results[0]['lng'];
			$lat        = $results[0]['lat'];
			$sid        = $results[0]['branchid'];
			// $bind_print   = $results[0]['bind_print'];
			// $print_config = empty($results[0]['print_config']) ? array('mcode' => '', 'msign' => '') : unserialize($results[0]['print_config']);
			$print_state  = $results[0]['print_state'];
			$cityid     = $results[0]['cityid'];

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

	//css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));


	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/jquery-ui.min.js',
        'ui/jquery.form.js',
        'ui/chosen.jquery.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/shop/shopBranchStoreAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	require_once(HUONIAOINC."/config/shop.inc.php");
	global $cfg_basehost;
	global $customChannelDomain;
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('basehost', $cfg_basehost);
	//获取域名信息
	$huoniaoTag->assign('id', $id);

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "shopaddr")));
	$huoniaoTag->assign('address', $address);
	$huoniaoTag->assign('industry', $industry == "" ? 0 : $industry);
	$huoniaoTag->assign('industryListArr', json_encode(getTypeList(0, "shop_type")));
	$huoniaoTag->assign('project', $project);
	$huoniaoTag->assign('litpic', $logo);
	$huoniaoTag->assign('cityid', $cityid);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['username']);

	$huoniaoTag->assign('people', $people);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('click', $click == "" ? "1" : $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('certiopt', array('0', '1', '2'));
	$huoniaoTag->assign('certinames',array('待认证','已认证','认证失败'));
	$huoniaoTag->assign('certi', $certi == "" ? 1 : $certi);

	$huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('sid', $sid);

	$companyArr = array();
	$sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__shop_store` WHERE `state` = 1 ORDER BY `id` DESC");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		foreach ($ret as $key => $value) {
			array_push($companyArr, array(
				'id' => $value['id'],
				'title' => $value['title']
			));
		}
	}
	$huoniaoTag->assign('companyArr', $companyArr);

	$huoniaoTag->assign('wechatcode', $wechatcode);
	// 店铺坐标
	$huoniaoTag->assign('lnglat', $lng.",".$lat);

	// // 打印机配置
	// $huoniaoTag->assign('bind_printList', array(0 => '关闭', 1 => '开启'));
	// $huoniaoTag->assign('bind_print', $bind_print);
	// $huoniaoTag->assign('print_config', $print_config);
	// $huoniaoTag->assign('print_state', $print_state);
	if($id !=''){

	    $printsql = $dsql->SetQuery("SELECT * FROM `#@__shop_shopprint` WHERE `sid` = $id");
	    $printret = $dsql->dsqlOper($printsql,"results");
	}
    $huoniaoTag->assign('printret', $printret ? $printret : array());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取行业分类列表
function getTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
