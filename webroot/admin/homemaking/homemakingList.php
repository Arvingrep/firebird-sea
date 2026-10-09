<?php
/**
 * 管理家政服务
 *
 * @version        $Id: homemakingList.php 2019-04-01 上午90:27:11 $
 * @package        HuoNiao.homemaking
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("homemakingList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/homemaking";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "homemakingList.html";

$tab = "homemaking_list";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

  $where =  getCityFilter('`cityid`');
  if ($cityid){
      $where .= getWrongCityFilter('`cityid`', $cityid);
  }

	if($sKeyword != ""){
		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT zj.id FROM `#@__homemaking_store` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE (zj.title like '%$sKeyword%' OR user.username like '%$sKeyword%' OR user.phone like '%$sKeyword%')");
		$userResult = $dsql->dsqlOper($userSql, "results");
		foreach ($userResult as $key => $value) {
			$sidArr[$key] = $value['id'];
		}
		if(!empty($sidArr)){
			$where .= " AND (`title` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `company` in (".join(",",$sidArr)."))";
		}else{
			$where .= " AND (`title` like '%$sKeyword%' OR `contact` like '%$sKeyword%')";
		}
	}

	if($sType){
		if($dsql->getTypeList($sType, "homemaking_type")){
			$lower = arr_foreach($dsql->getTypeList($sType, "homemaking_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `typeid` in ($lower)";
	}

	

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1=1");
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
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

	$where .= "  order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `addrid`, `company`, `username`, `contact`, `sale`, `price`, `state`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			//分类
			global $data;
			$data = "";
			$typeArr = getParentArr("homemaking_type", $value['typeid']);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$list[$key]['typeidname']    = join("-", $typeArr);

			//地区
			$addrname = $value['addrid'];
			if($addrname){
				$addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
			}
			$list[$key]["addrname"] = $addrname;

			//店铺
			$list[$key]["storeid"] = $value["company"];
			if($value["company"] != 0){
				$storeSql = $dsql->SetQuery("SELECT `title`,`addrid` FROM `#@__homemaking_store` WHERE `id` = ". $value["company"]);
				$storename = $dsql->getTypeName($storeSql);
				$list[$key]["store"] = $storename[0]['title'];

				$param = array(
					"service"  => "homemaking",
					"template" => "store-detail",
					"id"       => $value['company']
				);
				$list[$key]["storeUrl"] = getUrlPath($param);

                //区域
                if($storename[0]['addrid'] == 0){
                    $list[$key]["addrname"] = "未知";
                }else{
                    $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $storename[0]['addrid'], 'type' => 'typename', 'split' => ' '));
                    $list[$key]["storeaddrname"] = $addrname;
                }

			}else{
				$list[$key]["store"] = "官方直营";
                $list[$key]["storeaddrname"] = "未知";
			}
			
			$list[$key]["username"] = $value["username"];
			$list[$key]["contact"] = $value["contact"];
			$list[$key]["sale"] = $value["sale"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "homemaking",
				"template" => "detail",
				"id"       => $value["id"]
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "homemakingList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("homemakingDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['pics'], "delAtlas", "homemaking");

			//删除举报信息
			$archives = $dsql->SetQuery("DELETE FROM `#@__member_complain` WHERE `module` = 'homemaking' AND `action` = 'detail' AND `aid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("homemaking",$async,"list");  // 家政、服务、删除
        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkHomemakingCache($id);
			adminLog("删除家政服务信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("homemakingEdit")){
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
		dataAsync("homemaking",$async,"list");  // 家政、服务、更新状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkHomemakingCache($id);
			adminLog("更新家政服务状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}

// 检查缓存
function checkHomemakingCache($id){
    checkCache("homemaking_list", $id);
	clearCache("homemaking_detail", $id);
	clearCache("homemaking_list_total", 'key');
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
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/homemaking/homemakingList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "homemaking_type")));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/homemaking";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
