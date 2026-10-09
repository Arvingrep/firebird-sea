<?php
/**
 * 楼盘团购报名
 *
 * @version        $Id: houseCooperation.php 2014-01-14 下午23:52:11 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("houseCooperation");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "houseCooperation.html";

$db = "house_coop";

//删除
if($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$db."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除楼盘合作申请", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//获取列表
}else if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";
	if($sKeyword != ""){
        $where .= " AND (`title` like '%$sKeyword%' OR `usename` like '%$sKeyword%')";

	}

	$order = " order by `id` desc";

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$db."`");

	//总条数
	$totalCount = $dsql->dsqlOper($archives." WHERE 1 = 1".$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$atpage = $pagestep*($page-1);
	$limit = " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`,`title`, `usename`, `tel`, `state`, `pubdate` FROM `#@__".$db."` WHERE 1 = 1".$where.$order.$limit);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {

            $list[$key]["id"]      = $value["id"];
            $list[$key]["title"]   = $value["title"];
            $list[$key]["usename"] = $value["usename"];
            $list[$key]["tel"]     = $value["tel"];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);
            $list[$key]["state"]   = $value["state"];
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "tuanList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
		}
	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").'}';
	}
	die;
//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("houseCooperation")){
        die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
    };
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
        foreach($each as $val){
            $sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$db."` WHERE `id` = ".$val);
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) continue;
            $state_ = $res[0]['state'];

            $archives = $dsql->SetQuery("UPDATE `#@__".$db."` SET `state` = ".$state." WHERE `id` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                $error[] = $val;
            }
        }

        if(!empty($error)){
            echo '{"state": 200, "info": '.json_encode($error).'}';
        }else{
            adminLog("更新楼盘活动状态状态", $id."=>".$state);
            echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
        }
    }
	die;

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
		'admin/house/houseCooperation.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
