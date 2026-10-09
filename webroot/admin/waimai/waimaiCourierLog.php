<?php
/**
 * 配送员开停工记录
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

checkPurview("waimaiCourierLog");

$dbname = "waimai_courier_log";
$templates = "waimaiCourierLog.html";

$where2 = getCityFilter('`cityid`');
if ($cityid) {
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

$shop = array();
$sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname` FROM `#@__waimai_shop` s WHERE 1=1".$where2);
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $shop = $ret;
}
$huoniaoTag->assign('shop', $shop);

//配送员
$courier = array();
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` WHERE `state` = 1 ".$where2." ORDER BY `id` DESC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        array_push($courier, array(
            "id" => $value['id'],
            "name" => $value['name']
        ));
    }
}
$huoniaoTag->assign("courier", $courier);

$list = array();

$sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE 1=1".$where2);
$ret = $dsql->dsqlOper($sql, "results");
$peisongids = array();
if($ret){
    foreach($ret as $key => $val){
        array_push($peisongids, $val['id']);
    }
    $where .= " AND `uid` in (".join(",", $peisongids).")";
}else{
    $where .= " AND 1 = 2";
}
$pageSize = 20;

// 指定配送员
if($peisongid){
    $where = " AND l.`uid` = $peisongid";
    $huoniaoTag->assign('peisongid', $peisongid);
}

$sql = $dsql->SetQuery("SELECT l.`id` FROM `#@__$dbname` l WHERE 1 = 1".$where);

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);

$sql = $dsql->SetQuery("SELECT l.*, c.`name` FROM `#@__$dbname` l LEFT JOIN `#@__waimai_courier` c ON c.`id` = l.`uid` WHERE 1 = 1".$where." ORDER BY `id` DESC");
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

$huoniaoTag->assign('city', $adminCityArr);

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
		'admin/waimai/waimaiCourierLog.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
