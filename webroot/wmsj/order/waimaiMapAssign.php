<?php
/**
 * 地图派单
 *
 * @version        $Id: waimaiMapAssign.php 2017-5-26 下午15:34:22 $
 * @package        HuoNiao.map
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "../" );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/order";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$templates = "waimaiMapAssign.html";

// 商家只能看到自己管理的店铺（$managerIds 由 wmsj/inc/config.inc.php 按登录账号生成）
// 订单按店铺过滤（越权/隐私），骑手是平台运力（无 sid），按商家店铺所在城市过滤
$courierCityWhere = "";
$citySql = $dsql->SetQuery("SELECT DISTINCT `cityid` FROM `#@__waimai_shop` WHERE `id` in ($managerIds)");
$cityRet = $dsql->dsqlOper($citySql, "results");
if($cityRet){
    $cityIds = array();
    foreach ($cityRet as $key => $value) {
        if((int)$value['cityid']) array_push($cityIds, (int)$value['cityid']);
    }
    if($cityIds) $courierCityWhere = " AND c.`cityid` in (".join(",", $cityIds).")";
}

//配送员信息
$courier = array();
$sql = $dsql->SetQuery("SELECT c.*, (SELECT count(`id`) FROM `#@__waimai_order_all` WHERE (`state` = 4 OR `state` = 5) AND `peisongid` = c.`id`) as count FROM `#@__waimai_courier` c WHERE c.`state` = 1 AND c.`quit` = 0 ".$courierCityWhere." ORDER BY count ASC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        array_push($courier, array(
            "id"   => $value['id'],
            "name" => $value['name'],
            "lng"  => $value['lng'],
            "lat"  => $value['lat'],
            "count" => $value['count']
        ));
    }
}
$huoniaoTag->assign("courier", json_encode($courier));



//已确认订单
$order = array();
$sql = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`sid`, o.`ordernum`, o.`person`, o.`tel`, o.`address`, o.`lng`, o.`lat`, o.`confirmdate`, s.`shopname`, s.`address` address1, s.`coordX`, s.`coordY` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 3 AND o.`sid` in ($managerIds)");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        array_push($order, array(
            "id"          => $value['id'],
            "uid"         => $value['uid'],
            "sid"         => $value['sid'],
            "ordernum"    => $value['ordernum'],
            "person"      => $value['person'],
            "tel"         => $value['tel'],
            "address"     => $value['address'],
            "lng"         => $value['lng'],
            "lat"         => $value['lat'],
            "confirmdate" => date("Y-m-d H:i:s", $value['confirmdate']),
            "shopname"    => $value['shopname'],
            "address1"     => $value['address1'],
            "coordX"      => $value['coordX'],
            "coordY"      => $value['coordY'],
        ));
    }
}
$huoniaoTag->assign("order", json_encode($order));

//验证模板文件
if(file_exists($tpl."/".$templates)){

  $jsFile = array(
    'shop/waimaiMapAssign.js'
  );
  $huoniaoTag->assign('jsFile', $jsFile);

  $huoniaoTag->assign('HUONIAOADMIN', HUONIAOADMIN);
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
