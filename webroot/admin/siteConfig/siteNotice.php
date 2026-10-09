<?php
/**
 * 网站公告
 *
 * @version        $Id: siteNotice.php 2013-11-30 下午14:43:36 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteNotice");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle     = "管理公告";

//css
$cssFile = array(
  'ui/jquery.chosen.css',
  'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if($dopost != ""){
	$templates = "siteNoticeAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.colorPicker.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/siteNoticeAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "siteNotice.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
		'ui/chosen.jquery.min.js',
		'admin/siteConfig/siteNotice.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate       = GetMkTime(time());       //发布时间

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$color       = cn_substrR($color,6);
}

//公告列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = getCityFilter('`cityid`');

	if($adminCity){
		$where .= getWrongCityFilter('`cityid`', $adminCity);
	}

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__site_noticelist` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `color`, `weight`, `arcrank`, `pubdate` FROM `#@__site_noticelist` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$cityname = getSiteCityName($value['cityid']);
			$list[$key]['cityname'] = $cityname;

			$list[$key]["title"] = $value["title"];
			$list[$key]["color"] = $value["color"];
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

			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "siteConfig",
				"template"    => "notice-detail",
				"typeid"      => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "siteNoticeList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增公告
}elseif($dopost == "Add"){

	$pagetitle     = "新增公告";

	//表单提交
	if($submit == "提交"){

		//表单二次验证
		if(empty($cityid)){
			echo '{"state": 200, "info": "请选择城市"}';
			exit();
		}

    $adminCityIdsArr = explode(',', $adminCityIds);
  	if(!in_array($cityid, $adminCityIdsArr)){
			echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
			exit();
		}
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__site_noticelist` (`cityid`, `title`, `color`, `redirecturl`, `weight`, `body`, `arcrank`, `pubdate`) VALUES ('$cityid', '$title', '$color', '$redirecturl', $weight, '$body', $arcrank, $pubdate)");
		$return = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($return)){
			adminLog("新增公告", $title);

			$param = array(
				"service"     => "siteConfig",
				"template"    => "notice-detail",
				"typeid"      => $return
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode("添加成功！").', "url": "'.$url.'"}';
		}else{
			echo $return;
		}
		die;
	}

//修改公告
}elseif($dopost == "Edit"){

	$pagetitle = "修改公告";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		//表单二次验证
		if(empty($cityid)){
			echo '{"state": 200, "info": "请选择城市"}';
			exit();
		}
    
    $adminCityIdsArr = explode(',', $adminCityIds);
  	if(!in_array($cityid, $adminCityIdsArr)){
			echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
			exit();
		}
		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			die;
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__site_noticelist` SET `cityid` = '$cityid', `title` = '$title', `color` = '$color', `redirecturl` = '$redirecturl', `weight` = '$weight', `body` = '$body', `arcrank` = '$arcrank' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改公告", $title);

			$param = array(
				"service"     => "siteConfig",
				"template"    => "notice-detail",
				"typeid"      => $id
			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode("修改成功！").', "url": "'.$url.'"}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__site_noticelist` WHERE `id` = ".$id . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$cityid      = $results[0]['cityid'];
				$title       = $results[0]['title'];
				$color       = $results[0]['color'];
				$redirecturl = $results[0]['redirecturl'];
				$weight      = $results[0]['weight'];
				$body        = $results[0]['body'];
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

			$archives = $dsql->SetQuery("SELECT * FROM `#@__site_noticelist` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "siteConfig");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__site_noticelist` WHERE `id` = ".$val . getCityFilter('`cityid`'));
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除网站公告信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
	$huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('redirecturl', $redirecturl);
	$huoniaoTag->assign('weight', $weight == "" ? 50 : $weight);
	$huoniaoTag->assign('body', $body);

	//阅读权限-单选
	$huoniaoTag->assign('arcrankList', array('0', '1'));
	$huoniaoTag->assign('arcrankName',array('显示','隐藏'));
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 0 : $arcrank);
	$huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
