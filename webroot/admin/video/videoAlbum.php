<?php
/**
 * 管理二手车
 *
 * @version        $Id: carList.php 2019-03-18 上午90:27:11 $
 * @package        HuoNiao.car
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("videoAlbum");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/video";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "videoAlbum.html";

$tab = "video_album";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;
	// $where =  getCityFilter('`cityid`');
	if($sKeyword != ""){

			$where .= " AND (`title` like '%$sKeyword%')";

	}

//	if($sType){
//		if($dsql->getTypeList($sType, "car_brandtype")){
//			$lower = arr_foreach($dsql->getTypeList($sType, "car_brandtype"));
//			$lower = $sType.",".join(',',$lower);
//		}else{
//			$lower = $sType;
//		}
//		$where .= " `brand` in ($lower)";
//	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);


	if($state != ""){
		$where .= " AND `state` = $state";
	}

	$where .= "  order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]           = $value["id"];
			$list[$key]["uid"]           = $value["uid"];
			$list[$key]["title"]        = $value["title"];
			$list[$key]["litpic"]       = $value["litpic"];
			$list[$key]["litpicsoure"]  = getFilePath($value["litpic"]);
			$list[$key]["browse"]       = (int)$value["browse"];
			$list[$key]["state"]        = $value["state"];
			$list[$key]["pubdate"]      = date('Y-m-d H:i:s', $value["pubdate"]);

            $username = $contact = "无";
            if($value['uid'] != 0 ){
                //会员
                $userSql = $dsql->SetQuery("SELECT `id`, `username`, `phone` FROM `#@__member` WHERE `id` = ". $value['uid']);
                $username = $dsql->getTypeName($userSql);
                $list[$key]["userid"] = $username[0]["id"];
                $contact = $username[0]["phone"];
                $username = $username[0]["username"];

            }

            $list[$key]['username']   = $username;
            $list[$key]['contact']    = $contact;
//			$param = array(
//				"service"  => "car",
//				"template" => "detail",
//				"id"       => $value["id"]
//			);
//			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "circleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("videoAlbum")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "car");
			delPicFile($results[0]['pics'], "delAtlas", "car");

			//删除举报信息
			$archives = $dsql->SetQuery("DELETE FROM `#@__member_complain` WHERE `module` = 'car' AND `action` = 'detail' AND `aid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkCarCache($id);
			adminLog("删除二手车信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("videoAlbum")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkCarCache($id);
			adminLog("更新二手车状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
// 检查缓存
function checkCarCache($id){
    checkCache("circle_list", $id);
	clearCache("circle_detail", $id);
	clearCache("circle_list_total", 'key');
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
		'admin/video/videoAlbum.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "car_brandtype")));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/video";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
