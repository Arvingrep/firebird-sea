<?php
/**
 * 管理商城商品
 *
 * @version        $Id: integralList.php 2014-2-11 下午17:26:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("integralList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "integralList.html";

$tab = "integral_product";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	if($sIndustry!=''){
		if($dsql->getTypeList($sIndustry, "integral_type")){
			$lower = arr_foreach($dsql->getTypeList($sIndustry, "integral_type"));
			$lower = $sIndustry.",".join(',',$lower);
		}else{
			$lower = $sIndustry;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已上架
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//已下架
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " order by `id` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`,`cityid`, `typeid`, `title`, `litpic`, `pics`, `price`, `point`, `sales`, `inventory`, `state`, `flag`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]        = $value["id"];
            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;
			$list[$key]["title"]     = $value["title"];
			$list[$key]["litpic"]    = $value["litpic"];
			$list[$key]["price"]     = $value['price'];
			$list[$key]["point"]     = $value["point"];
			$list[$key]["sales"]     = $value["sales"];
			$list[$key]["inventory"] = $value["inventory"];

			//分类
			$list[$key]["typeid"] = $value["typeid"];
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__integral_type` WHERE `id` = ". $value["typeid"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["typename"] = $typename[0]['typename'];

			$list[$key]["state"] = $value["state"];

			$append = array();
			if(!empty($value["flag"])){
				$flag = explode(",", $value["flag"]);
				if(in_array(0, $flag)){
					array_push($append, "推");
				}
				if(in_array(1, $flag)){
					array_push($append, "特");
				}
				if(in_array(2, $flag)){
					array_push($append, "热");
				}
			}
			$list[$key]["flag"] = join(",", $append);

			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "integral",
				"template" => "detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "integralList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("integralDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){
			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__integral_common` WHERE `aid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "integral");

			//删除图集
			$pics = explode(",", $results[0]['pics']);
			foreach($pics as $k => $v){
				delPicFile($v, "delAtlas", "integral");

			}

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "integral");
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("integral",$async);  // 积分商城，删除商品
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除商城商品", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("integralEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("integral",$async);  // 积分商城、修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新商城商品状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

//验证模板文件
if(file_exists($tpl."/".$templates)){
	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/integral/integralList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('industryListArr', json_encode($dsql->getTypeList(0, "integral_type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/integral";  //设置编译目录
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
