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

checkPurview("waimaiCourierCommon");

$dbname = "waimai_common";
// $dbname = "public_comment_all";
$templates = "waimaiCourierCommon.html";

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
    $where .= " AND `peisongid` in (".join(",", $peisongids).")";
}else{
    $where .= " AND 1 = 2";
}
$pageSize = 20;

// 指定配送员
if($peisongid){
    $where = " AND c.`peisongid` = $peisongid";
    $huoniaoTag->assign('peisongid', $peisongid);


    // 查询个人评分情况

    // 外卖
    $sql = $dsql->SetQuery("SELECT avg(`starps`) s, p.`name` FROM `#@__waimai_common` c LEFT JOIN `#@__waimai_courier` p ON p.`id` = $peisongid WHERE `peisongid` = $peisongid AND `type` = '0'");
    $ret = $dsql->dsqlOper($sql, "results");
    $starperson = $ret[0]['s'];
    $starperson = number_format($starperson, 1);
    $huoniaoTag->assign('starperson', $starperson);

    $huoniaoTag->assign('peisong', $ret[0]['name']);
    //当天
    $todayk = strtotime(date('Y-m-d'));
    //当天结束
    $todaye = strtotime(date('Y-m-d 23:59:59'));
    // 今日
    $sql = $dsql->SetQuery("SELECT avg(`starps`) s  FROM `#@__waimai_common` WHERE `peisongid` = $peisongid AND `dtime` > $todayk AND `dtime` <  $todaye AND `type` = '0'");
    $ret = $dsql->dsqlOper($sql, "results");
    $starpersonToday = $ret[0]['s'];
    $starpersonToday = number_format($starpersonToday, 1);
    $huoniaoTag->assign('starpersonToday', $starpersonToday);

    // 跑腿
    $sql = $dsql->SetQuery("SELECT avg(`starps`) s FROM `#@__waimai_common` c LEFT JOIN `#@__waimai_courier` p ON p.`id` = $peisongid WHERE `peisongid` = $peisongid AND `type` = '1'");
    $ret = $dsql->dsqlOper($sql, "results");
    $paotui_starperson = $ret[0]['s'];
    $paotui_starperson = number_format($paotui_starperson, 1);
    $huoniaoTag->assign('paotui_starperson', $paotui_starperson);
    //当天
    $todayk = strtotime(date('Y-m-d'));
    //当天结束
    $todaye = strtotime(date('Y-m-d 23:59:59'));
    // 今日
    $sql = $dsql->SetQuery("SELECT avg(`starps`) s  FROM `#@__waimai_common` WHERE `peisongid` = $peisongid AND `dtime` > $todayk AND `dtime` < $todaye AND `type` = '1'");
    $ret = $dsql->dsqlOper($sql, "results");
    $paotui_starpersonToday = $ret[0]['s'];
    $paotui_starpersonToday = number_format($paotui_starpersonToday, 1);
    $huoniaoTag->assign('paotui_starpersonToday', $paotui_starpersonToday);

}
// 指定评分
if($starps){
    $where = " AND c.`starps` = $starps";
    $huoniaoTag->assign('starps', $starps);
}

$sql = $dsql->SetQuery("SELECT `id` FROM `#@__$dbname` WHERE 1 = 1".$where);
//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);

$sql = $dsql->SetQuery("SELECT c.*, p.`name`, m.`username` FROM (`#@__$dbname` c LEFT JOIN `#@__waimai_courier` p ON p.`id` = c.`peisongid`)
    LEFT JOIN `#@__member` m ON m.`id` = c.`uid`
    WHERE `peisongid` != 0".$where." ORDER BY `id` DESC");
// var_dump($sql);die;
$ret = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

if($ret){
    foreach ($ret as $key => $value) {

        if($value['type'] == '0'){
            $sql = $dsql->SetQuery("SELECT o.`ordernumstore`, s.`shopname` FROM (`#@__$dbname` c LEFT JOIN `#@__waimai_order_all` o ON c.`oid` = o.`id`)
                LEFT JOIN `#@__waimai_shop` s ON c.`sid` = s.`id`
                WHERE c.`id` = ".$value['id']);
                // var_dump($sql);die;
            $shop = $dsql->dsqlOper($sql, "results");
            if($shop){
                foreach ($shop[0] as $k => $val) {
                    $value[$k] = $val;
                }
            }
        }else{
            $sql = $dsql->SetQuery("SELECT o.`shop` shopname, o.`ordernum` ordernumstore FROM (`#@__$dbname` c LEFT JOIN `#@__paotui_order` o ON c.`oid` = o.`id`)
                WHERE c.`id` = ".$value['id']);
                // var_dump($sql);die;
            $shop = $dsql->dsqlOper($sql, "results");
            if($shop){
                foreach ($shop[0] as $k => $val) {
                    $value[$k] = $val;
                }
            }
        }

        $list[$key] = $value;

    }
    // $list = $ret;
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
        'admin/waimai/waimaiCourierCommon.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
