<?php
/**
 * 商城店铺
 *
 * @version        $Id: shopBrand.php 2014-2-10 下午21:32:58 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = "shop_brand";

checkPurview("shopBrand");

//css
$cssFile = array(
    'ui/jquery.chosen.css',
	'admin/chosen.min.css',
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

if(!empty($category)) $category = join(",", $category);

if($dopost != "" || $dopost == "Add" || $dopost == "Edit"){
	//$typeArr = array();
	$sql = $dsql->SetQuery("SELECT * FROM `#@__shop_type` where `parentid` = 0 ORDER BY `weight` DESC, `id` DESC");
	$rets = $dsql->dsqlOper($sql, "results");
	if($rets){
		foreach ($rets as $k => $v) {
			$typeArr[$k]['id'] = $v['id'];
			$typeArr[$k]['title'] = $v['typename'];
		}
	}
	$huoniaoTag->assign('typeArr', $typeArr);
}
if($dopost != ""){
	$templates = "shopBrandAdd.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
        'ui/chosen.jquery.min.js',
		'admin/shop/shopBrandAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}else{
	$templates = "shopBrand.html";

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/shop/shopBrand.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
}

$pagetitle = "品牌管理";

if($submit == "提交"){
	if($token == "") die('token传递失败！');
	$pubdate = GetMkTime(time());       //发布时间
	$rec     = (int)$rec;
}

//列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    // $where = getCityFilter('`cityid`');
    $where = "";

    if ($adminCity) {
        $where = getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}
	if($sType != ""){
		$where .= " AND `type` = $sType";
	}

	$where .= " order by `weight` desc, `pubdate` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `cityid`, `id`, `type`, `title`, `logo`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["typeid"] = $value["type"];

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

			//分类
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$tab."type` WHERE `id` = ". $value["type"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["type"] = $typename[0]['typename'];

			$list[$key]["title"] = $value["title"];
			$list[$key]["logo"] = $value["logo"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "shopBrandList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;

//新增
}elseif($dopost == "Add"){

	$pagetitle     = "新增品牌";

	//表单提交
	if($submit == "提交"){

		$cityid = (int)$cityid;
        //表单二次验证
        // if(empty($cityid)){
        //     echo '{"state": 200, "info": "请选择城市"}';
        //     exit();
        // }
		//
        // $adminCityIdsArr = explode(',', $adminCityIds);
        // if(!in_array($cityid, $adminCityIdsArr)){
        //     echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
        //     exit();
        // }

		if(trim($typeid) == ''){
			echo '{"state": 200, "info": "请选择分类"}';
			exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "请填写品牌名称"}';
			exit();
		}

		if(trim($litpic) == ''){
			echo '{"state": 200, "info": "请上传品牌logo"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`cityid`, `type`, `title`, `logo`, `weight`, `rec`, `pubdate`, `category`) VALUES ('$cityid', '$typeid', '$title', '$litpic', $weight, $rec, $pubdate, '$category')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("新增商城品牌", $sitename);
			echo '{"state": 100, "info": '.json_encode("添加成功！").'}';
		}else{
			echo $return;
		}
		die;
	}

//修改
}elseif($dopost == "Edit"){

	$pagetitle = "修改品牌";

	if($id == "") die('要修改的信息ID传递失败！');
	if($submit == "提交"){

		$cityid = (int)$cityid;

        //表单二次验证
        // if(empty($cityid)){
        //     echo '{"state": 200, "info": "请选择城市"}';
        //     exit();
        // }
		//
        // $adminCityIdsArr = explode(',', $adminCityIds);
        // if(!in_array($cityid, $adminCityIdsArr)){
        //     echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
        //     exit();
        // }

		if(trim($typeid) == ''){
			echo '{"state": 200, "info": "请选择分类"}';
			exit();
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "请填写品牌名称"}';
			exit();
		}

		if(trim($litpic) == ''){
			echo '{"state": 200, "info": "请上传品牌logo"}';
			exit();
		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `cityid` = '$cityid', `type` = '$typeid', `title` = '$title', `logo` = '$litpic', `weight` = $weight, `rec` = $rec, `category` = '$category' WHERE `id` = ".$id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改商城品牌", $title);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}else{
			echo $return;
		}
		die;

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$type   = $results[0]['type'];
				$title  = $results[0]['title'];
				$logo   = $results[0]['logo'];
				$weight = $results[0]['weight'];
				$rec    = $results[0]['rec'];
				$cityid = $results[0]['cityid'];
				$category = $results[0]['category'];

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
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			delPicFile($results[0]['logo'], "delBrand", "siteConfig");

			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除商城品牌", $id);
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('typeListArr', json_encode(getTypeList(0, $tab."type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	if($dopost != ""){
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('typeid', (int)$type);
		$huoniaoTag->assign('title', $title);
		$huoniaoTag->assign('litpic', $logo);
		$huoniaoTag->assign('weight', $weight == "" ? 1 : $weight);
		$huoniaoTag->assign('rec', $rec);
		$huoniaoTag->assign('cityid', (int)$cityid);
		$huoniaoTag->assign('category', !empty($category) ? explode(",", $category) : '');
	}
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取分类列表
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
