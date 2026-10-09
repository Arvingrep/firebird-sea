<?php
/**
 * 团购券管理
 *
 * @version        $Id: tuanQuanList.php 2013-12-16 下午16:27:16 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("tuanVoucherList");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanVoucherList.html";

$action = "tuan_voucher";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	if($sKeyword != ""){
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__tuanlist`  WHERE `title` like '%$sKeyword%'");
	    $results = $dsql->dsqlOper($userSql, "results");
	    foreach ($results as $key => $value) {
	        $sidArr[$key] = $value['id'];
	    }
	    if(!empty($sidArr)){
	        $where .= " AND `tid` in (".join(",",$sidArr).")";
	    }
	}

	if($start != ""){
		$where .= " AND `puctime` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `endtime` <= ". GetMkTime($end);
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);
	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//可使用
	$effective = $dsql->dsqlOper($archives." AND `state` = 1 ", "totalCount");
	//已过期
	$expired = $dsql->dsqlOper($archives." AND `state` = 2 ", "totalCount");
	//已消费
	$spend = $dsql->dsqlOper($archives." AND `state` = 3", "totalCount");

	if($state != ""){
		if($state == 0){
			$where .= " AND `state` = 1 ";
			$totalPage = ceil($effective/$pagestep);

		}elseif($state == 1){
			$where .= " AND `state` = 2 ";
			$totalPage = ceil($expired/$pagestep);

		}elseif($state == 2){
			$where .= " AND `state` = 3";
			$totalPage = ceil($spend/$pagestep);

		}

	}

	$where .= " order by `puctime` desc, `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `uid`, `tid`, `puctime`, `endtime`, `state` FROM `#@__".$action."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]  = $value["id"];
			$list[$key]["tid"] = $value["tid"];
			$list[$key]["uid"] = $value["uid"];
			$list[$key]["puctime"] = !empty($value["puctime"]) ? date('Y-m-d H:i:s', $value["puctime"]) : '';
			$list[$key]["state"] = $value["state"];
			$list[$key]["endtime"] = !empty($value["endtime"]) ? date('Y-m-d H:i:s', $value["endtime"]) : '';
			//会员
			$list[$key]["uid"] = $value["uid"];
			if($value["uid"] == 0){
				$list[$key]["username"] = "未知";
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `company`, `username` FROM `#@__member` WHERE `id` = ". $value['uid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			//团购商品
			$proSql = $dsql->SetQuery("SELECT `title` FROM `#@__tuanlist` WHERE `id` = ". $value['tid']);
			$proname = $dsql->dsqlOper($proSql, "results");
			if(count($proname) > 0){
				$list[$key]["proname"] = $proname[0]['title'];
			}else{
				$list[$key]["proname"] = "未知";
			}

			$param = array(
				"service" => "tuan",
				"template" => "detail",
				"id" => $value["tid"]
			);
			$list[$key]['prourl'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}, "tuanQuanList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "effective": '.$effective.', "expired": '.$expired.', "spend": '.$spend.'}}';
	}
	die;


}elseif($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除领券", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
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
		'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
		'admin/tuan/tuanVoucherList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
