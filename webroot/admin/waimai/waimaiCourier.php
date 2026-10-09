<?php
/**
 * 配送员管理
 *
 * @version        $Id: waimaiCourier.php 2017-5-26 上午10:46:21 $
 * @package        HuoNiao.Courier
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
$dsql                     = new dsql($dbo);
$userLogin                = new userLogin($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$dbname    = "waimai_courier";
$templates = "waimaiCourier.html";

checkPurview("waimaiCourier");


//删除店铺
if ($action == "delete") {

    if (!testPurview("waimaiCourierDelete")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id)) {

        $sql = $dsql->SetQuery("DELETE FROM `#@__$dbname` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {
            echo '{"state": 100, "info": "删除成功！"}';
            exit();
        } else {
            echo '{"state": 200, "info": "删除失败！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}

/*更新骑手审核状态*/
if ($action == "updateStatus") {

    if (!testPurview("waimaiCourierEdit")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }

    if (!empty($id)) {

        $val = (int)$val;

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `status` = $val WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {
            echo '{"state": 100, "info": "更新成功！"}';
            exit();
        } else {
            echo '{"state": 200, "info": "更新失败！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


$where = " WHERE 1 = 1" . getCityFilter('c.`cityid`');

if ($cityid) {
    $where .= getWrongCityFilter('c.`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

if ($keyword){
    $where .= " AND (c.`name` like '%$keyword%'  OR  c.`username`  like  '%$keyword%' OR  c.`photo` like '%$keyword%') ";
}

if ($_GET['notice']){                //待办事项
    $where .= " AND c.`status` ='0'";           //拒绝审核
}
if ($status){
    switch ($status){
        case 1;
            $where .= " AND c.`status` ='1'";           //通过审核
            break;
        case 2;
            $where .= " AND c.`status` ='0'";           //拒绝审核
            break;
        default;
    }
}
if ($state){
    if ($state == 3){       //离职
        $where .= " AND c.`quit` = 1";
    }else{
        $where .= " AND c.`state` = '$state'";
    }
}
$pageSize = 15;

$sql = $dsql->SetQuery("SELECT c.`id`, c.`name`,c.`cityid`, c.`username`, c.`phone`, c.`age`, c.`sex`, c.`photo`, c.`lng`, c.`lat`,c.`status`,c.`quit`, c.`state`,c.`money`, c.`regtime`, c.`offtime`  FROM `#@__$dbname` c " . $where . " ORDER BY c.`quit` ASC, c.`id` DESC");
//var_dump($sql);
//die;
//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount / $pageSize);

$p       = (int)$p == 0 ? 1 : (int)$p;
$atpage  = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql . " LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
    $list[$key]['id']       = $value['id'];
    $list[$key]['cityname'] = getSiteCityName($value['cityid']);
    $list[$key]['name']     = $value['name'];
    $list[$key]['username'] = $value['username'];
    $list[$key]['phone']    = $value['phone'];
    $list[$key]['age']      = $value['age'];
    $list[$key]['sex']      = $value['sex'];
    $list[$key]['photo']    = $value['photo'];
    $list[$key]['lng']      = $value['lng'];
    $list[$key]['lat']      = $value['lat'];
    $list[$key]['total']    = $value['total'];
    $list[$key]['ok']       = $value['ok'];
    $list[$key]['failed']   = $value['failed'];
    $list[$key]['state']    = $value['state'];
    $list[$key]['quit']     = $value['quit'];
    $list[$key]['status']   = $value['status'];
    $list[$key]['money']    = $value['money'];
    $list[$key]['regtime']  = $value['regtime'];
    $list[$key]['offtime']  = $value['offtime'];

    //外卖
    $totalsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `peisongid` = '" . $value['id'] . "' AND `state` = 1");

    $total    = $dsql->dsqlOper($totalsql, "totalCount");

    //跑腿
    $paotuitotalsql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `peisongid` = '" . $value['id'] . "' ");

    $paotuitotal    = $dsql->dsqlOper($paotuitotalsql, "totalCount");

    //商城
    if(in_array('shop', $installModuleArr)){
        $shoptotalsql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `peisongid` = '" . $value['id'] . "' ");
        $shoptotal    = $dsql->dsqlOper($shoptotalsql, "totalCount");
    }

    $list[$key]['total'] = $total;
    $list[$key]['paotuitotal'] = $paotuitotal;
    $list[$key]['shoptotal'] = (int)$shoptotal;


    $oksql    = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `peisongid` = '" . $value['id'] . "' AND `state` = 1");

    $ok       = $dsql->dsqlOper($oksql, "totalCount");

    $list[$key]['ok'] = $ok;

    //paotui
    $paooksql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `peisongid` = '" . $value['id'] . "' AND `state` = 1");

    $paototal    = $dsql->dsqlOper($paooksql, "totalCount");
    $list[$key]['paotuiok'] = $paototal;

    //商城
    if(in_array('shop', $installModuleArr)){
        $shopsql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `peisongid` = '" . $value['id'] . "' AND `orderstate` = 3");
        $sptotal    = $dsql->dsqlOper($shopsql, "totalCount");
    }
    $list[$key]['shopok'] = (int)$sptotal;


    //paotui
    $failedpaooksql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `peisongid` = '" . $value['id'] . "' AND (`state` = 6 OR `state` = 7)");

    $failedpaototal    = $dsql->dsqlOper($failedpaooksql, "totalCount");
    $list[$key]['paofailed'] = $failedpaototal;

    //商城
    if(in_array('shop', $installModuleArr)){
        $failedshopsql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `peisongid` = '" . $value['id'] . "' AND (`orderstate` = 6 OR `orderstate` = 7)");
        $failedsptotal    = $dsql->dsqlOper($failedshopsql, "totalCount");
    }
    $list[$key]['shopfailed'] = (int)$failedsptotal;


    $failedsql= $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `peisongid` = '" . $value['id'] . "' AND `state` = 1 AND (`state` = 6 OR `state` = 7)");

    $failed   = $dsql->dsqlOper($failedsql, "totalCount");

    $list[$key]['failed'] = $failed;
}
$huoniaoTag->assign("list", $list);

$pagelist = new pagelist(array(
    "list_rows"   => $pageSize,
    "total_pages" => $totalPage,
    "total_rows"  => $totalCount,
    "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());

$huoniaoTag->assign('city', $adminCityArr);
$huoniaoTag->assign('keyword', $keyword);
$huoniaoTag->assign('status', $status);
$huoniaoTag->assign('state', $state);
$huoniaoTag->assign('peisongstatus', $_GET['notice']);



//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

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
        'ui/chosen.jquery.min.js',
        'admin/waimai/waimaiCourier.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
