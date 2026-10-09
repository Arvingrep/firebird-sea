<?php
/**
 * 添加家政
 *
 * @version        $Id: homemakingAdd.php 2019-04-02 下午16:34:13 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingAdd.html";

$tab = "homemaking_list";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	$pagetitle = "修改家政服务";
	checkPurview("homemakingEdit");
}else{
	$pagetitle = "添加家政服务";
	checkPurview("homemakingAdd");
}

if(empty($addrid)) $addrid = 0;
if(empty($cityid)) $cityid = 0;
if(empty($price)) $price = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);
if(empty($userid)) $userid = 0;
if(!empty($flag)) $flag = join("|", $flag);
if(!empty($rec)) $rec = join(",", $rec);
if($homemakingtype == 0){
	$price = 0;
}

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');
	//二次验证
	if(empty($title)){
		echo '{"state": 200, "info": "请输入家政服务名称！"}';
		exit();
	}

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择家政公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "家政公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	if($homemakingtype != 0 && empty($price)){
		echo '{"state": 200, "info": "请输入价格"}';
		exit();
	}

	$pubdate = GetMkTime(time());

}

if($dopost == "save" && $submit == "提交"){
	//保存到表
	$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`typeid`, `title`, `addrid`, `cityid`, `company`, `username`, `contact`, `homemakingtype`, `price`, `pics`, `flag`, `weight`, `state`, `rec`, `note`, `pubdate`, `click`) VALUES ('$typeid', '$title', '$addrid', '$cityid', '$comid', '$username', '$contact', '$homemakingtype', '$price', '$pics', '$flag', '$weight', '$state', '$rec', '$note', '$pubdate', '$click')");
	$aid = $dsql->dsqlOper($archives, "lastid");

	if(is_numeric($aid)){
		if($state == 1){
			updateCache("homemaking_list", 300);
			clearCache("homemaking_list_total", 'key');
		}
		adminLog("添加家政服务信息", $title);
		$param = array(
			"service"  => "homemaking",
			"template" => "detail",
			"id"       => $aid
		);
		$url = getUrlPath($param);
        dataAsync("homemaking",$aid,"list");  // 家政、服务、新增

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typeid` = '$typeid', `title` = '$title', `addrid` = '$addrid', `cityid` = '$cityid', `company` = '$comid', `username` = '$username', `contact` = '$contact', `homemakingtype` = '$homemakingtype', `price` = '$price', `pics` = '$pics', `flag` = '$flag', `weight` = '$weight', `state` = '$state', `rec` = '$rec', `note` = '$note', `click` = '$click' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results == "ok"){

			// 检查缓存
			checkCache("homemaking_list", $id);
			clearCache("homemaking_detail", $id);
			clearCache("homemaking_list_total", 'key');

			adminLog("修改家政服务信息", $title);
			$param = array(
				"service"  => "homemaking",
				"template" => "detail",
				"id"       => $id
			);
			$url = getUrlPath($param);
            dataAsync("homemaking",$id,"list");  // 家政、服务、修改

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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/homemaking/homemakingAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/homemaking.inc.php");
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
	$homemakingatlasMax = $custom_homemaking_atlasMax ? $custom_homemaking_atlasMax : 9;
	$huoniaoTag->assign('homemakingatlasMax', $homemakingatlasMax);

	//品牌分类
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "homemaking_type")));
	$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemaking_type` WHERE `id` = ". $typeid);
	$res = $dsql->dsqlOper($sql, "results");
	if(!empty($res[0]['typename'])){
		$typename = $res[0]["typename"];
	}else{
		$typename = '选择分类';
	}
	$huoniaoTag->assign('typename', $typename);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('addrid', $addrid == "" ? 0 : $addrid);
	$huoniaoTag->assign('cityid', $cityid == "" ? 0 : $cityid);
	$huoniaoTag->assign('typeid', $typeid ? $typeid : 0);
	$huoniaoTag->assign('homemakingtype', $homemakingtype);
	$huoniaoTag->assign('price', $price == 0 ? 0 : $price);
	$huoniaoTag->assign('note', $note);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('flag', $flag);
	$huoniaoTag->assign('flagSel', $flag ? explode("|", $flag) : array());
	$huoniaoTag->assign('tag', $tag);
	$huoniaoTag->assign('tagSel', $tag ? explode("|", $tag) : array());
	$huoniaoTag->assign('username', $username ? $username : '');
	$huoniaoTag->assign('contact', $contact ? $contact : '');
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('sale', $sale ? $sale : 0);

	if($id != ""){
		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__homemaking_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
	}
	
	//家政性质
	$huoniaoTag->assign('homemakingtypeNames', array("免费预约", "预约金",  "实价"));
	$huoniaoTag->assign('homemakingtypeOpt', array("0", "1", "2"));
	$huoniaoTag->assign('homemakingtype', $homemakingtype == "" ? 0 : (int)$homemakingtype);

	//认证属性
	$tagArr = $customshomemakingTag ? explode("|", $customshomemakingTag) : array();
	$huoniaoTag->assign('tagArr', $tagArr);
	//属性
	$flagArr = $customshomemakingFlag ? explode("|", $customshomemakingFlag) : array();
	$huoniaoTag->assign('flagArr', $flagArr);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//属性
	$huoniaoTag->assign('reclist', array("推荐"));
	$huoniaoTag->assign('recval', array("1"));
	$huoniaoTag->assign('rec', explode(",", $rec));

	$huoniaoTag->assign('userid', $userid);
	$huoniaoTag->assign('contact', $contact);
	$huoniaoTag->assign('username', $username);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
