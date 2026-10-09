<?php
/**
 * 友情链接
 *
 * @version        $Id: friendLink.php 2014-1-7 下午16:41:12 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "site_friendlink";

checkPurview("friendLink".$action);

//css
$cssFile = array(
  'ui/jquery.chosen.css',
  'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if($dopost != ""){
	$templates = "friendLinkAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/friendLinkAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "friendLink.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/friendLink.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

$pagetitle = "友情链接管理";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate     = GetMkTime(time());       //发布时间
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	if($sKeyword != ""){
		$where .= " AND (`sitename` like '%$sKeyword%' OR `sitelink` like '%$sKeyword%')";
	}
	if($sType != ""){
		$where .= " AND `type` = $sType";
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."list` WHERE `module` = '$action'");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `type`, `sitename`, `sitelink`, `litpic`, `weight`, `arcrank` FROM `#@__".$tab."list` WHERE `module` = '$action'".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$list[$key]["typeid"] = $value["type"];

			//分类
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."type` WHERE `id` = ". $value["type"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["type"] = $typename[0]['typename'];

			$list[$key]["sitename"] = $value["sitename"];
			$list[$key]["sitelink"] = $value["sitelink"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["weight"] = $value["weight"];

			$state = "";
			switch($value["arcrank"]){
				case "0":
					$state = "显示";
					break;
				case "1":
					$state = "隐藏";
					break;
			}

			$list[$key]["state"] = $state;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "friendLinkList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle = "新增友情链接";

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(trim($cityid) == ''){
			echo '{"state": 200, "info": "请选择城市"}';
			exit();
		}

		$adminCityIdsArr = explode(',', $adminCityIds);
		if(!in_array($cityid, $adminCityIdsArr)){
			echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
			exit();
		}

		if(trim($typeid) == ''){
			echo '{"state": 200, "info": "请选择分类"}';
			exit();
		}

		if(trim($sitename) == ''){
			echo '{"state": 200, "info": "请填写网站名称"}';
			exit();
		}

		if(trim($sitelink) == ''){
			echo '{"state": 200, "info": "请填写网站链接"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."list` (`cityid`, `module`, `type`, `sitename`, `sitelink`, `litpic`, `weight`, `arcrank`, `pubdate`) VALUES ('$cityid', '$action', $typeid, '$sitename', '$sitelink', '$litpic', $weight, $arcrank, $pubdate)");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增友情链接", $action .'=>'. $sitename);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改友情链接";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(trim($cityid) == ''){
			echo '{"state": 200, "info": "请选择城市"}';
			exit();
		}

		$adminCityIdsArr = explode(',', $adminCityIds);
		if(!in_array($cityid, $adminCityIdsArr)){
			echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
			exit();
		}

		if(trim($typeid) == ''){
			echo '{"state": 200, "info": "请选择分类"}';
			exit();
		}

		if(trim($sitename) == ''){
			echo '{"state": 200, "info": "请填写网站名称"}';
			exit();
		}

		if(trim($sitelink) == ''){
			echo '{"state": 200, "info": "请填写网站链接"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."list` SET `cityid` = '$cityid', `type` = $typeid, `sitename` = '$sitename', `sitelink` = '$sitelink', `litpic` = '$litpic', `weight` = $weight, `arcrank` = '$arcrank' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改友情链接", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."list` WHERE `id` = ".$id . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$cityid      = $results[0]['cityid'];
				$type        = $results[0]['type'];
				$sitename    = $results[0]['sitename'];
				$sitelink    = $results[0]['sitelink'];
				$litpic      = $results[0]['litpic'];
				$weight      = $results[0]['weight'];
				$arcrank     = $results[0]['arcrank'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}

}elseif($dopost == "del"){
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."list` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['sitename']);

			//删除缩略图
			delPicFile($results[0]['litpic'], "delFriendLink", $action);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."list` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除友情链接", $tab."=>".join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;
}

if(empty($action)) die("ERROR: action is empty!");
//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('action', $action);
  $typeList = getTypeList(0, $action, $tab."type");
	$huoniaoTag->assign('typeListArr', $typeList ? $typeList : array());

	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('typeid', (int)$type);

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('sitename', $sitename);
		$huoniaoTag->assign('sitelink', $sitelink == "" ? "http://" : $sitelink);
		$huoniaoTag->assign('litpic', $litpic);
		$huoniaoTag->assign('weight', $weight == "" ? 50 : $weight);

		$huoniaoTag->assign('arcrankList', array('0', '1'));
		$huoniaoTag->assign('arcrankName',array('显示','隐藏'));
		$huoniaoTag->assign('arcrank', $arcrank == "" ? 0 : $arcrank);
	}

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
function getTypeList($id, $model, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id AND `model` = '$model' ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
