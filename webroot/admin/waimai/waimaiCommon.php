<?php
/**
 * 评论管理
 *
 * @version        $Id: add.php 2017-4-25 上午11:19:16 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

checkPurview("waimaiCommon");

$dbname = "waimai_common";
// $dbname = "public_comment_all";
$templates = "waimaiCommon.html";

$shop = array();
$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1 = 1" . getCityFilter('s.`cityid`'));
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shop = $ret;
}
$huoniaoTag->assign('shop', $shop);

$huoniaoTag->assign('city', $adminCityArr);

$list = array();

$where = "";
$pageSize = 20;

$where2 = getCityFilter('`cityid`');
if ($cityid){
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}
$shopids = array();
$shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1".$where2);
$shopResult = $dsql->dsqlOper($shopSql, "results");
if($shopResult){
    foreach($shopResult as $key => $loupan){
        array_push($shopids, $loupan['id']);
    }
    $where = " AND c.`sid` in (".join(",", $shopids).")";
    // $where = " AND c.`aid` in (".join(",", $shopids).")";
}else{
    $where = " AND 1 = 2";
}

if($shopid){
    // $where = " AND c.`aid` = $shopid";
    $where = " AND c.`sid` = $shopid";
    $huoniaoTag->assign('shopid', $shopid);
}
$sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__$dbname` c WHERE 1 = 1".$where);

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);

// $sql = $dsql->SetQuery("SELECT c.*, o.`ordernumstore`, s.`shopname` FROM (`#@__$dbname` c LEFT JOIN `#@__waimai_order_all` o ON c.`oid` = o.`id`) LEFT JOIN `#@__waimai_shop` s ON c.`aid` = s.`id` WHERE c.`type` = 'waimai-order' ".$where." ORDER BY `id` DESC");

$sql = $dsql->SetQuery("SELECT c.*, o.`ordernumstore`, s.`shopname` FROM (`#@__$dbname` c LEFT JOIN `#@__waimai_order_all` o ON c.`oid` = o.`id`) LEFT JOIN `#@__waimai_shop` s ON c.`sid` = s.`id` WHERE 1= 1 ".$where." ORDER BY `id` DESC");

$ret = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");
if($ret){
    $list = $ret;
}
$huoniaoTag->assign('list', $list);

$pagelist = new pagelist(array(
  "list_rows"   => $pageSize,
  "total_pages" => $totalPage,
  "total_rows"  => $totalCount,
  "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());


//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
	$cssFile = array(
        'ui/jquery.chosen.css',
		'admin/jquery-ui.css',
		'admin/styles.css',
		'admin/chosen.min.css',
		'admin/ace-fonts.min.css',
		'admin/select.css',
		'admin/ace.min.css',
		'admin/animate.css',
		'admin/font-awesome.min.css',
		'admin/simple-line-icons.css',
		'admin/font.css',
		// 'admin/app.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    //js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery-ui.min.js',
		'ui/jquery.form.js',
		// 'ui/jquery-ui-timepicker-addon.js',
		// 'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		// 'publicUpload.js',
		'admin/waimai/waimaiCommon.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
