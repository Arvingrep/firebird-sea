<?php
/**
 * 添加签证国家
 *
 * @version        $Id: travelvisacountryTypeAdd.php 2019-6-5 上午10:33:36 $
 * @package        HuoNiao.travel
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/travel";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "travelvisacountryTypeAdd.html";

global $handler;
$handler = true;

$action     = "travel";
$pagetitle  = "增加签证国家";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("travelvisacountryType");
}else{
	checkPurview("travelvisacountryType");
}
if(empty($hot)) $hot = 0;
if(empty($price)) $price = 0;

if($dopost != ""){
	$pubdate = GetMkTime(time());	//发布时间

	//检测是否已经注册
	if($dopost == "save"){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_visacountrytype` WHERE `typename` = '".$typename."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此国家或地区已添加，不可以重复添加！"}';
			exit();
		}
	}else{
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_visacountrytype` WHERE `typename` = '".$typename."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此国家或地区已添加，不可以重复添加！"}';
			exit();
		}
	}

	if(empty($pinyin)){
		$pinyin = GetPinyin($typename);
	}
	if(empty($py)){
		$py = GetPinyin($typename, 1);
	}

}

if(empty($click)) $click = mt_rand(50, 200);

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
        //表单二次验证
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择签证类型"}';
			exit();
		}

		if(trim($typename) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__travel_visacountrytype` SET  `typename` = '$typename', `weight` = '$weight', `icon` = '$icon', `pinyin` = '$pinyin', `py` = '$py', `hot` = '$hot', `continent` = '$continent', `typeid` = '$typeid', `duration` = '$duration', `condition` = '$condition', `price` = '$price',`state` = '$state', `click` = '$click', `expenses` = '$expenses' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		checkCache("travel_visacountrytype_list", $id);
		clearCache("travel_visacountrytype_detail", $id);
		clearCache("travel_visacountrytype_total", 'key');

		adminLog("修改签证国家信息", $typename);

		$param = array(
			"service"     => "travel",
			"template"    => "visacountry-detail",
			"id"          => $id
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';die;


	}else{
		if(!empty($id)){
			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__travel_visacountrytype` WHERE `id` = ".$id);
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
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');
        //表单二次验证
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择签证类型"}';
			exit();
		}

		if(trim($typename) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__travel_visacountrytype` (`typename`, `weight`, `pubdate`, `icon`, `pinyin`, `py`, `hot`, `continent`, `typeid`, `duration`, `condition`, `price`, `state`, `click`, `expenses`) VALUES ('$typename', '$weight', '$pubdate', '$icon', '$pinyin', '$py', '$hot', '$continent', '$typeid', '$duration', '$condition', '$price', '$state', '$click', '$expenses')");

		$aid = $dsql->dsqlOper($archives, "lastid");
		
		adminLog("发布签证国家信息", $typename);

		$param = array(
			"service"     => "travel",
			"template"    => "visacountry-detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		if($arcrank == 1){
			updateCache("travel_visacountrytype_list", 300);
			clearCache("travel_visacountrytype_total", 'key');
		}

		echo '{"state": 100, "url": "'.$url.'"}';die;

	}


}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/travel/travelvisacountryTypeAdd.js'
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

    $huoniaoTag->assign('typename', $typename);
	$huoniaoTag->assign('typeid', empty($typeid) ? 0 : $typeid);
	$huoniaoTag->assign('icon', $icon);
	$huoniaoTag->assign('pinyin', $pinyin);
	$huoniaoTag->assign('py', $py);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);
	$huoniaoTag->assign('hot', $hot);
	$huoniaoTag->assign('continent', $continent);
	$huoniaoTag->assign('duration', $duration);
	$huoniaoTag->assign('condition', $condition);
	$huoniaoTag->assign('expenses', $expenses);

	//洲
	include_once HUONIAOROOT."/api/handlers/travel.class.php";
	$travel = new travel();
	$travelTypeList = $travel->continent_type();

	$huoniaoTag->assign('continentopt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('continentnames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('continent', $continent ? $continent : 1);

	//签证国家
	$travelTypeList = $travel->typeid_type();

	$huoniaoTag->assign('typeidopt', array_column($travelTypeList, "id"));
	$huoniaoTag->assign('typeidnames', array_column($travelTypeList, "typename"));
	$huoniaoTag->assign('typeid', $typeid ? $typeid : 0);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/travel";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
