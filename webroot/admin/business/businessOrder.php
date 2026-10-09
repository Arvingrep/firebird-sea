<?php
/**
 * 管理商家入驻订单
 *
 * @version        $Id: businessOrder.php 2017-08-08 上午11:35:20 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessOrder");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessOrder.html";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    //城市管理员
    $where = getCityFilter('l.`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('l.`cityid`', $cityid);
    }

	if($sKeyword != ""){

		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($userSql, "results");
		foreach ($results as $key => $value) {
			$sidArr[$key] = $value['id'];
		}

		$where_ = "";
		if(!empty($sidArr)){
			$where_ .= " AND (`title` like '%$sKeyword%' OR `company` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `address` like '%$sKeyword%' OR `tel` like '%$sKeyword%' OR `uid` in (".join(",",$sidArr)."))";
		}else{
			$where_ .= " AND (`title` like '%$sKeyword%' OR `company` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `address` like '%$sKeyword%' OR `tel` like '%$sKeyword%')";
		}

		$bids = array();
		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE 1 = 1".$where_);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {
				$bids[$key] = $value['id'];
			}
		}

		if($bids){
			$where .= " AND (o.`bid` in (".join(",", $bids).") OR o.`ordernum` like '%$sKeyword%')";
		}else{
			$where .= " AND o.`ordernum` like '%$sKeyword%'";
		}

	}

	if($start != ""){
		$where .= " AND o.`date` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND o.`date` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT o.`id` FROM `#@__business_order` o LEFT JOIN `#@__business_list` l ON l.`id` = o.`bid` WHERE o.`state` = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " ORDER BY `id` DESC";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT o.* FROM `#@__business_order` o LEFT JOIN `#@__business_list` l ON l.`id` = o.`bid` WHERE o.`state` = 1 AND o.`paytype` != 'none'".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["bid"] = $value["bid"];

			$title = $company = "";
			$sql = $dsql->SetQuery("SELECT l.`title`, m.`company` FROM `#@__business_list` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` WHERE l.`id` = ".$value['bid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$title = $ret[0]['title'];
				$company = $ret[0]['company'];
			}
			$list[$key]['title'] = $title;
			$list[$key]['company'] = $company;

			$list[$key]["ordernum"] = $value['ordernum'];
			$list[$key]["totalprice"] = $value["totalprice"];
			$list[$key]["offer"] = $value["offer"];
			$list[$key]["balance"] = $value['balance'];
			$list[$key]["point"] = $value['point'];
			$list[$key]["paytype"] = getPaymentName($value['paytype']);
			$list[$key]["amount"] = $value['amount'];
			$list[$key]["paydate"] = date("Y-m-d H:i:s", $value["paydate"]);

			$name = '';
            $times = '';

			$package = $value['package'];
			if($package){
                $packageConfig = unserialize($package);
				$name = $packageConfig['name'];
                $times = $packageConfig['time'] . ($packageConfig['time'] ? '年' : '个月');

                //兼容老数据
                if(!$name){
                    $name = $packageConfig['package'] != -1 ? $packageConfig['package'] : $packageConfig['packageItem'];
                    $times = $packageConfig['month'] . '个月';
                }

			}
			$list[$key]["name"] = $name;
			$list[$key]["times"] = $times;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "list": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;


//删除
}elseif($dopost == "del"){
	if($id == "") die;

	$each = explode(",", $id);
	$error = array();
	$title = array();
	foreach($each as $val){

		//验证权限
        $sql = $dsql->SetQuery("SELECT `id`, `ordernum` FROM `#@__business_order` WHERE `id` = $val" . getCityFilter('`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			array_push($title, $ret[0]['ordernum']);

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__business_order` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}else{
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除商家入驻订单", join(", ", $title));
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/business/businessOrder.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
