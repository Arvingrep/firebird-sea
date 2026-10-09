<?php
/**
 * 房产问答
 *
 * @version        $Id: houseFaq.php 2016-11-26 下午14:37:10 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseFaqList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$pagetitle = "房产问答";

$tab = "house_faq";
$templates = "houseFaqList.html";

//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/jquery-ui-selectable.js',
    'ui/chosen.jquery.min.js',
	'admin/house/houseFaqList.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
		if($dsql->getTypeList($sType, $tab."type")){
			$lower = arr_foreach($dsql->getTypeList($sType, $tab."type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	$where .= " order by `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `cityid`, `id`, `title`, `typeid`, `people`, `phone`, `click`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["typeid"] = $value["typeid"];

			//分类
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->dsqlOper($typeSql, "results");
			if($typename){
				$list[$key]["type"] = $typename[0]['typename'];
			}else{
				$list[$key]["type"] = "";
			}

			$list[$key]["people"] = $value["people"];
			$list[$key]["phone"]  = $value["phone"];
			$list[$key]["click"]  = $value["click"];

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "显示";
					break;
				case "1":
					$state = "<font color='#ff0000'>隐藏</font>";
					break;
			}

			$list[$key]["state"] = $state;

			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

            $param = array(
				"service"  => "house",
				"template" => "faq-detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "houseFaqList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;


//获取信息详情
}elseif($dopost == "getDetail"){

	if(!testPurview("houseFaqEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `typeid`, `title`, `click`, `body`, `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//编辑
}elseif($dopost == "updateDetail"){

	if(!testPurview("houseFaqEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id == "") die('要修改的信息ID传递失败！');

	$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$id);
	$res = $dsql->dsqlOper($sql, "results");
	$state_ = $res[0]['state'];

	//表单二次验证
	if($typeid == ''){
		echo '{"state": 101, "info": '.json_encode("请选择文章分类！").'}';
		exit();
	}

	$click   = (int)$click;
	$body    = $body;
	$state   = (int)$state;

	$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `typeid` = $typeid, `click` = '$click', `body` = '$body', `state` = '$state' WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "update");
	if($results != "ok"){
		echo $results;
	}else{

		// 清除缓存
		clearCache("house_faq_detail", $id);
		if(($state != 1 && $state_ == 1)|| ($state == 1 && $state_ != 1)){
			clearCache("house_faq_total", "key");
			if($state == 1){
				checkCache("house_faq_list", $id);
			}else{
				clearCache("house_faq_list", "key");
			}
		}

		adminLog("编辑房产问题信息", $id);
		echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
	}
	die;


//删除
}elseif($dopost == "del"){

  if(!testPurview("houseFaqDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			array_push($title, $results[0]['title']);

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "house");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("house_faq_list", $val);
				clearCache("house_faq_detail", $val);
				clearCache("house_faq_total", "key");
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除房产问答", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $tab."type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
