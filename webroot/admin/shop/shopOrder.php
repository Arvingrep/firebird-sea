<?php
/**
 * 管理商城商品订单
 *
 * @version        $Id: shopOrder.php 2014-2-20 下午14:00:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("shopOrder");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "shopOrder.html";
global  $userLogin;
$action = "shop_order";

$paymentList = array('money'=>'余额支付', '管理员支付' => '管理员支付', 'delivery' => '货到付款');
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $paymentList[$val['pay_code']] = $val['pay_name'];
    }
}

//商城配置文件
include(HUONIAOINC . "/config/shop.inc.php");

if ($dopost == "getList") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = '';

    $where2 = getCityFilter('`cityid`');

    if ($adminCity) {
        $where2 .= getWrongCityFilter('`cityid`', $adminCity);
    }

    //分站筛选
    if($userType == 3 || $adminCity){
        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE 1=1" . $where2);
        $results  = $dsql->dsqlOper($archives, "results");
        if (count($results) > 0) {
            $list = array();
            foreach ($results as $key => $value) {
                $list[] = $value["id"];
            }
            $idList = join(",", $list);
            $where  .= " AND l.`store` in ($idList)";
        } else {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
            die;
        }
    }

    //商品类型，1实物商品 2电子券
    $shoptype = (int)$shoptype;
    if($shoptype == 1){
        $where .= " AND l.`protype` = 0";
    }elseif($shoptype == 2){
        $where .= " AND l.`protype` = 1";
    }

    //支付方式
    if($payment){
        $where .= " AND l.`paytype` = '$payment'";
    }

    //活动订单
    if($huodong != ''){

        //砍价-砍价中
        if($huodong == '3-0'){
            $where .= " AND l.`huodongtype` = 3 AND b.`state` = 0";
        }
        //砍价-成功
        elseif($huodong == '3-1'){
            $where .= " AND l.`huodongtype` = 3 AND b.`state` = 1";
        }
        //砍价-失败
        elseif($huodong == '3-2'){
            $where .= " AND l.`huodongtype` = 3 AND b.`state` = 2";
        }
        //砍价-已购买
        elseif($huodong == '3-3'){
            $where .= " AND l.`huodongtype` = 3 AND b.`state` = 3";
        }

        //拼团-待成团
        elseif($huodong == '4-0'){
            $where .= " AND l.`huodongtype` = 4 AND l.`pinstate` = 0";
        }
        //拼团-已成团
        elseif($huodong == '4-1'){
            $where .= " AND l.`huodongtype` = 4 AND l.`pinstate` = 1";
        }

        //其他
        else{
            $where .= " AND l.`huodongtype` = $huodong";
        }
    }

    //配送方式
    if($shipping != ''){
        $where .= " AND l.`shipping` = $shipping";
        if($shipping == 0){
            $where .= " AND l.`peisongid` != 0";
        }
    }

    if ($sKeyword != "") {

        $sKeyword = trim($sKeyword);

        //搜索类型
        //1 订单号
        //2 用户ID
        //3 收货人
        //4 收货电话
        //5 收货地址
        //6 商品ID
        //7 商品名称
        //8 店铺ID
        //9 店铺名称
        //10 拼团ID
        $searchtype = (int)$searchtype;

        //1 订单号
        if($searchtype == 1){
            $where .= " AND l.`ordernum` = '$sKeyword'";
        }
        //2 用户ID
        elseif($searchtype == 2){
            $sKeyword = (int)$sKeyword;
            $where .= " AND l.`userid` = '$sKeyword'";
        }
        //3 收货人
        elseif($searchtype == 3){
            $where .= " AND l.`people` = '$sKeyword'";
        }
        //4 收货电话
        elseif($searchtype == 4){
            $where .= " AND l.`contact` = '$sKeyword'";
        }
        //5 收货地址
        elseif($searchtype == 5){
            $where .= " AND l.`address` = like '%$sKeyword%'";
        }
        //6 商品ID
        elseif($searchtype == 6){

            $_where = array();
            $sKeyword = (int)$sKeyword;
            $proSql    = $dsql->SetQuery("SELECT `orderid` FROM `#@__shop_order_product` WHERE `proid` = '$sKeyword'");
            $proResult = $dsql->dsqlOper($proSql, "results");
            if ($proResult) {
                $orderid = array();
                foreach ($proResult as $key => $pro) {
                    if($pro['orderid']){
                        array_push($orderid, $pro['orderid']);
                    }
                }
                if (!empty($orderid)) {
                    array_push($_where, "l.`id` in (" . join(",", $orderid) . ")");
                }
            }

            if($_where){
                $where .= " AND (" . join(" OR ", $_where) . ")";
            }else{
                $where .= " AND 1 = 2";
            }

        }
        //7 商品名称
        elseif($searchtype == 6){

            $_where = array();
            $proSql    = $dsql->SetQuery("SELECT pp.`orderid` FROM `#@__shop_product` p LEFT JOIN `#@__shop_order_product` pp ON pp.`proid` = p.`id` WHERE p.`title` like '%$sKeyword%'");
            $proResult = $dsql->dsqlOper($proSql, "results");
            if ($proResult) {
                $orderid = array();
                foreach ($proResult as $key => $pro) {
                    if($pro['orderid']){
                        array_push($orderid, $pro['orderid']);
                    }
                }
                if (!empty($orderid)) {
                    array_push($_where, "l.`id` in (" . join(",", $orderid) . ")");
                }
            }

            if($_where){
                $where .= " AND (" . join(" OR ", $_where) . ")";
            }else{
                $where .= " AND 1 = 2";
            }

        }
        //8 店铺ID
        elseif($searchtype == 8){
            $sKeyword = (int)$sKeyword;
            $where .= " AND l.`store` = '$sKeyword'";
        }
        //9 店铺名称
        elseif($searchtype == 9){

            $_where = array();
            $proSql    = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `title` like '%$sKeyword%'");
            $proResult = $dsql->dsqlOper($proSql, "results");
            if ($proResult) {
                $orderid = array();
                foreach ($proResult as $key => $pro) {
                    if($pro['id']){
                        array_push($orderid, $pro['id']);
                    }
                }
                if (!empty($orderid)) {
                    array_push($_where, "l.`store` in (" . join(",", $orderid) . ")");
                }
            }

            if($_where){
                $where .= " AND (" . join(" OR ", $_where) . ")";
            }else{
                $where .= " AND 1 = 2";
            }

        }
        //10 拼团ID
        elseif($searchtype == 10){
            $sKeyword = (int)$sKeyword;
            $where .= " AND l.`pinid` = '$sKeyword'";
        }

    }

    //时间筛选
    $timetype = (int)$timetype;
    $timeField = 'orderdate';  //默认下单时间

    //付款时间
    if($timetype == 2){
        $timeField = 'paydate';
    }
    //发货时间
    elseif($timetype == 3){
        $timeField = 'exp_date';
    }
    //申请退款
    elseif($timetype == 4){
        $timeField = 'ret_date';
    }
    //退款时间
    elseif($timetype == 5){
        $timeField = 'ret_ok_date';
    }

    if ($start != "") {
        if($timeType == 5){
            $where .= " AND (l.`$timeField` >= " . GetMkTime($start . " 00:00:00") . " OR l.`refrunddate` >= " . GetMkTime($start . " 00:00:00") . ")";
        }else{
            $where .= " AND l.`$timeField` >= " . GetMkTime($start . " 00:00:00");
        }
    }

    if ($end != "") {
        if($timeType == 5){
            $where .= " AND (l.`$timeField` <= " . GetMkTime($start . " 23:59:59") . " OR l.`refrunddate` <= " . GetMkTime($start . " 23:59:59") . ")";
        }else{
            $where .= " AND l.`$timeField` <= " . GetMkTime($end . " 23:59:59");
        }
    }

    //筛选砍价指定状态
    if(strstr($huodong, '3-')){
        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $action . "` l LEFT JOIN `#@__shop_bargaining` b ON b.`oid` = l.`id` WHERE 1 = 1" . $where);
    }
    else{
        $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__" . $action . "` l WHERE 1 = 1" . $where);
    }

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    //导出时，不需要查询各状态的数据
    if ($do !="export"){

        //未付款
        $state0 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 0", "totalCount");
        //未使用
        $state1 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 1 AND l.`protype` = 0  AND 1 = (CASE WHEN l.`pinid` != 0 THEN CASE WHEN l.`pinstate` THEN 1 ELSE 0 END ELSE 1=1 END )", "totalCount");
        //成功
        $state3 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 3", "totalCount");
        //已退款
        $state4 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 1", "totalCount");
        //已发货-快递类型
        $state60 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 1", "totalCount");
        //已确认-商家配送
        $state61 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 2", "totalCount");
        //已接单
        $state62 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`songdate` = 0", "totalCount");
        //配送中
        $state63 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`songdate` != 0", "totalCount");
        //待配送-平台配送，待骑手接单
        $state64 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 0", "totalCount");
        //已接单+配送中-平台配送
        $state65 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`shipping` = 0", "totalCount");
        //已完成-平台配送
        $state66 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 3 AND l.`peisongid` != 0 AND l.`shipping` = 0", "totalCount");
        //退款成功
        $state7 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 7", "totalCount");
        //交易关闭
        $state10 = $dsql->dsqlOper($archives . " AND l.`orderstate` = 10", "totalCount");

        //异常订单
        $exceptionSql = array();
        $now_time = GetMkTime(time());
        //订单异常-多长时间未发货
        $deliveryValue = (int)$customDeliveryValue;  //订单超过多少未发货
        $deliveryType = (int)$customDeliveryType;  //0小时  1天
        if($deliveryValue){
            $_time = $deliveryType == 0 ? $deliveryValue * 3600 : $deliveryValue * 86400;
            $expired = $now_time - $_time;
            array_push($exceptionSql, "(l.`orderstate` = 1 AND l.`protype` = 0 AND 1 = (CASE WHEN l.`pinid` != 0 THEN CASE WHEN l.`pinstate` THEN 1 ELSE 0 END ELSE 1=1 END) AND l.`paydate` < $expired)");
        }

        //订单异常-多长时间未完成
        $incompleteValue = (int)$customIncompleteValue;  //订单超过多少未完成
        $incompleteType = (int)$customIncompleteType;  //0小时  1天
        if($incompleteValue){
            $_time = $incompleteType == 0 ? $incompleteValue * 3600 : $incompleteValue * 86400;
            $expired = $now_time - $_time;
            array_push($exceptionSql, "(l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`exp_date` < $expired)");
        }

        $exceptionSql = $exceptionSql ? " AND (" . join(' OR ', $exceptionSql) . ")" : " AND 1 = 2";
        $state11 = $dsql->dsqlOper($archives . $exceptionSql, "totalCount");

        //平台配送订单异常-多长时间未完成
        $exceptionSql1 = array();
        $platformDeliveryValue = (int)$customPlatformDeliveryValue;  //订单配送超过多少未完成
        $platformDeliveryType = (int)$customPlatformDeliveryType;  //0小时  1天
        if($platformDeliveryValue){
            $_time = $platformDeliveryType == 0 ? $platformDeliveryValue * 3600 : $platformDeliveryValue * 86400;
            $expired = $now_time - $_time;
            array_push($exceptionSql1, "(l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`shipping` = 0 AND l.`peidate` < $expired)");
        }

        $exceptionSql1 = $exceptionSql1 ? " AND (" . join(' OR ', $exceptionSql1) . ")" : " AND 1 = 2";
        $state12 = $dsql->dsqlOper($archives . $exceptionSql1, "totalCount");
    }


    if ($state != "") {
        if ($state != "" && $state != 4 && $state != 5 && $state != 6 && $state != 11 && $state != 12) {
            $where .= " AND l.`orderstate` = " . $state;

            if ($state == 1) {
//                $where .= " AND (`orderstate` = 1 OR `orderstate` = 11) ";
                $where .= ' AND l.`protype` = 0  AND 1 = (CASE WHEN `pinid` != 0 THEN CASE WHEN l.`pinstate` THEN 1 ELSE 0 END ELSE 1=1 END	)';
            } else {
                $where .= " AND l.`orderstate` = " . $state;
            }

        }

        //退款
        if ($state == 4) {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 1";
        }

        //已发货
        if ($state == '6,0') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 1";
        }
        //已确认-商家配送
        if ($state == '6,1') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 2";
        }
        //已接单
        if ($state == '6,2') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`songdate` = 0";
        }
        //配送中
        if ($state == '6,3') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`songdate` != 0";
        }
        //待配送-平台配送，待骑手接单
        if ($state == '6,4') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` = 0 AND l.`shipping` = 0";
        }
        //已接单+配送中-平台配送
        if ($state == '6,5') {
            $where .= " AND l.`orderstate` = 6 AND l.`ret_state` = 0 AND l.`exp_date` != 0 AND l.`peisongid` != 0 AND l.`shipping` = 0";
        }
        //已完成-平台配送
        if ($state == '6,6') {
            $where .= " AND l.`orderstate` = 3 AND l.`peisongid` != 0 AND l.`shipping` = 0";
        }

        //异常订单
        if($state == 11){
            $where .= $exceptionSql;
        }

        //平台配送异常订单
        if($state == 12){
            $where .= $exceptionSql1;
        }


        /* //已发货
        if($state == 6){
            $where = " AND `orderstate` = 6 AND `exp_date` != 0";
        } */

        /* if($state == 0){
            $totalPage = ceil($state0/$pagestep);
        }elseif($state == 1){
            $totalPage = ceil($state1/$pagestep);
        }elseif($state == 3){
            $totalPage = ceil($state3/$pagestep);
        }elseif($state == 4){
            $totalPage = ceil($state4/$pagestep);
        }elseif($state == 6){
            $totalPage = ceil($state6/$pagestep);
        }elseif($state == 7){
            $totalPage = ceil($state7/$pagestep);
        }elseif($state == 10){
            $totalPage = ceil($state10/$pagestep);
        } */
        if ($state == 0) {
            $totalPage = ceil($state0 / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($state1 / $pagestep);
        } elseif ($state == 3) {
            $totalPage = ceil($state3 / $pagestep);
        } elseif ($state == 4) {
            $totalPage = ceil($state4 / $pagestep);
        } elseif ($state == '6,0') {
            $totalPage = ceil($state60 / $pagestep);
        } elseif ($state == '6,1') {
            $totalPage = ceil($state61 / $pagestep);
        } elseif ($state == '6,2') {
            $totalPage = ceil($state62 / $pagestep);
        } elseif ($state == '6,3') {
            $totalPage = ceil($state63 / $pagestep);
        } elseif ($state == '6,4') {
            $totalPage = ceil($state64 / $pagestep);
        } elseif ($state == '6,5') {
            $totalPage = ceil($state65 / $pagestep);
        } elseif ($state == '6,6') {
            $totalPage = ceil($state66 / $pagestep);
        } elseif ($state == 7) {
            $totalPage = ceil($state7 / $pagestep);
        } elseif ($state == 10) {
            $totalPage = ceil($state10 / $pagestep);
        } elseif ($state == 11) {
            $totalPage = ceil($state11 / $pagestep);
        } elseif ($state == 12) {
            $totalPage = ceil($state12 / $pagestep);
        }
    }

    $peisongTotalPrice = $shopTotalPrice = 0;

    $where .= " order by l.`id` desc";

    $atpage   = $pagestep * ($page - 1);
    $where    .= " LIMIT $atpage, $pagestep";

    //筛选砍价指定状态
    if(strstr($huodong, '3-')){
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`ordernum`, l.`store`, l.`userid`, l.`orderstate`, l.`orderdate`, l.`paytype`, l.`logistic`, l.`ret_state`, l.`courier`, l.`peisongid`, l.`peidate`, l.`songdate`, l.`okdate`, l.`shipping`,l.`refrundamount`,l.`priceinfo`,l.`peerpay`,l.`amount`,l.`shopFee`,l.`paydate`,l.`address`,l.`lng`,l.`lat`,l.`people`,l.`contact`,l.`note`,l.`logistic`,l.`exp_date`,l.`user_refundtype`, l.`huodongtype`, l.`hid`, l.`protype`, l.`payprice`, l.`changetype`, l.`changeprice`, l.`changelogistic`, l.`exp_company`, l.`exp_number`, l.`exp_date`, l.`pinid`, l.`pinstate`, l.`pintype`, l.`point`, l.`balance` FROM `#@__" . $action . "` l LEFT JOIN `#@__shop_bargaining` b ON b.`oid` = l.`id` WHERE 1 = 1" . $where);
    }
    else{
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`ordernum`, l.`store`, l.`userid`, l.`orderstate`, l.`orderdate`, l.`paytype`, l.`logistic`, l.`ret_state`, l.`courier`, l.`peisongid`, l.`peidate`, l.`songdate`, l.`okdate`, l.`shipping`,l.`refrundamount`,l.`priceinfo`,l.`peerpay`,l.`amount`,l.`shopFee`,l.`paydate`,l.`address`,l.`lng`,l.`lat`,l.`people`,l.`contact`,l.`note`,l.`logistic`,l.`exp_date`,l.`user_refundtype`, l.`huodongtype`, l.`hid`, l.`protype`, l.`payprice`, l.`changetype`, l.`changeprice`, l.`changelogistic`, l.`exp_company`, l.`exp_number`, l.`exp_date`, l.`pinid`, l.`pinstate`, l.`pintype`, l.`point`, l.`balance` FROM `#@__" . $action . "` l WHERE 1 = 1" . $where);
    }
 
    $results  = $dsql->dsqlOper($archives, "results");

    if (count($results) > 0) {
        $list = array();
        foreach ($results as $key => $value) {
            $list[$key]["id"]              = (int)$value["id"];
            $list[$key]["ordernum"]        = $value["ordernum"];
            $list[$key]["userid"]          = (int)$value["userid"];
            $list[$key]["shipping"]        = (int)$value["shipping"];  //0：骑手配送；1：快递；2：商家配送
            $list[$key]["peidate"]         = !empty($value["peidate"]) ? date('Y-m-d H:i:s', $value["peidate"]) : "";
            $list[$key]["songdate"]        = !empty($value["songdate"]) ? date('Y-m-d H:i:s', $value["songdate"]) : "";
            $list[$key]["okdate"]          = !empty($value["okdate"]) ? date('Y-m-d H:i:s', $value["okdate"]) : "";
            $list[$key]["refrundamount"]   = (float)$value['refrundamount'];
            $list[$key]["paydate"]         = !empty($value["paydate"]) ? date('Y-m-d H:i:s', $value["paydate"]) : "";
            $list[$key]["address"]         = $value['address'];    //收货地址
            $list[$key]["lng"]             = $value['lng'];    
            $list[$key]["lat"]             = $value['lat'];    
            $list[$key]["people"]          = $value['people'];             //收货人姓名
            $list[$key]["exp_date"]        = !empty($value["exp_date"]) ? date('Y-m-d H:i:s', $value["exp_date"]) : "";
            $list[$key]["user_refundtype"] = (int)$value['user_refundtype'];
            $list[$key]["contact"]         = $value['contact'] ? $value['contact'] : '';             //联系方式
            $list[$key]["note"]            = $value['note'];
            $list[$key]["pinid"]           = (int)$value['pinid'];  //拼团id
            $list[$key]["pinstate"]        = (int)$value['pinstate'];  //拼状态 0:待成团 1:成团
            $list[$key]["pintype"]         = (int)$value['pintype'];  //成员类别 0:成员 1:团长

            //快递信息
            if($value["shipping"] == 1){
                $list[$key]["exp_company"] = $juhe_express_company[$value['exp_company']];
                $list[$key]["exp_number"] = $value['exp_number'];                
                $list[$key]["exp_date"] = !empty($value["exp_date"]) ? date('Y-m-d H:i:s', $value["exp_date"]) : "";
            }

            $auth_logistic = $auth_shop_price = $quan = 0;
            $quanbody = '';
            $priceinfo     = unserialize($value['priceinfo']);
            if ($priceinfo) {
                foreach ($priceinfo as $k => $v) {
                    if ($v['type'] == 'auth_peisong') {
                        $auth_logistic = $v['amount'];
                        $anth_peisongBody = $v['body'];
                    }
                    if($v['type'] == 'quan'){
                        $quan      = $v['amount'];
                        $quanbody  = $v['quanname'];
                    }
                    if ($v['type'] == 'auth_shop') {
                        $auth_shop_price = $v['amount'];
                        $anth_shopBody = $v['body'];
                    }
                }
            }

            //订单商品
            $proPrice = 0;
            $proCount = 0;       //商品数量
            $proName = array();         //商品名称
            $proList = array();
            $orderprice = $orderpayprice = 0;
            $sql = $dsql->SetQuery("SELECT `proid`, `specation`, `price`, `count`, `logistic`, `discount`, `point`, `balance`, `payprice` FROM `#@__".$action."_product` WHERE `orderid` = ".$value["id"]);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $k => $v) {

                    $param = array(
                        "service"  => "shop",
                        "template" => "detail",
                        "id"       => $v['proid']
                    );
                    $sql = $dsql->SetQuery("SELECT `title`, `litpic`,`shopunit` FROM `#@__shop_product` WHERE `id` = ".$v['proid']);
                    $res = $dsql->dsqlOper($sql, "results");

                    $specation = '';
                    $specationArr = array();
                    if($v['specation']){
                        $specationArr = explode('$$$', $v['specation']);
                        $specation = '【'.join('、', $specationArr).'】';
                    }

                    $proCount +=$v['count'];
                    if (!empty($res[0]['shopunit'])){
                        array_push($proName, (count($ret) > 1 ? $k+1 . '.' : '') . '['.$v['proid'].']' . $res[0]['title'] . $specation .'  x'. $v['count'].$res[0]['shopunit']);
                    }else{
                        array_push($proName, (count($ret) > 1 ? $k+1 . '.' : '') . '['.$v['proid'].']' . $res[0]['title'] . $specation .'  x'. $v['count']);
                    }

                    array_push($proList, array(
                        'id' => (int)$v['proid'],
                        'title' => $res[0]['title'],
                        'price' => (float)$v['price'],
                        'url' => getUrlPath($param),
                        'specation' => $specationArr,
                        'count' => (int)$v['count'],
                        'unit' => $res[0]['shopunit'],
                        'litpic' => getFilePath($res[0]['litpic'])
                    ));

                    //商品原价
                    $proPrice += $v['price'] * $v['count'];

                }
            }

            $orderprice = $proPrice;

            //减去会员折扣
            // if($auth_shop_price > 0){
            //     $orderprice -= $auth_shop_price;
            // }

            $list[$key]['proName'] = implode("\r\n",$proName);
            $list[$key]['proCount'] = $proCount;
            $list[$key]['proList'] = $proList;
            $list[$key]['proPrice'] = $proPrice;
            $list[$key]['auth_shop_price'] = (float)$auth_shop_price;  //会员优惠的金额
            $list[$key]['auth_logistic'] = (float)$auth_logistic;  //会员优惠配送费的金额
            $list[$key]['anth_peisongBody'] = $anth_peisongBody;
            $list[$key]['anth_shopBody'] = $anth_shopBody;
            $list[$key]['auth_quan'] = (float)$quan;  //优惠券

            //单价加上配送费
            $list[$key]['pricepeisong'] =  $value['logistic'] - $auth_logistic ? $value['logistic'] - $auth_logistic : '' ;

            //优惠券
            $list[$key]['quanbody']      = $quanbody;

            //用户名
            $userSql  = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = " . $value["userid"]);
            $username = $dsql->dsqlOper($userSql, "results");
            if (count($username) > 0) {
                $list[$key]["username"] = $username[0]['nickname'] ?: $username[0]['username'];
            } else {
                $list[$key]["username"] = "未知";
            }

            $list[$key]["storeid"] = $value["store"];

            //商家
            $storeUserid = 0;
            $userSql = $dsql->SetQuery("SELECT `title`, `userid` FROM `#@__shop_store` WHERE `id` = " . $value["store"]);
            $store   = $dsql->dsqlOper($userSql, "results");
            if (count($store) > 0) {
                $storeUserid = $store[0]['userid'];
                $param = array(
                    "service"  => "shop",
                    "template" => "store-detail",
                    "id"       => $value['store']
                );
                $list[$key]["storeUrl"] = getUrlPath($param);
                $list[$key]["store"]    = $store[0]['title'];
            } else {
                $list[$key]["storeUrl"] = "javascript:;";
                $list[$key]["store"]    = "未知";
            }

            $peisongid = $value["peisongid"];
            if ($peisongid) {
                $sql = $dsql->SetQuery("SELECT `name`,`phone` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $peisongid = $ret[0]['name'];
                    $peisongphone = $ret[0]['phone'];
                }
            } else {
                $peisongid = '';
                $peisongphone = "";
            }

            $list[$key]["peisongid"] = (int)$value["peisongid"];
            $list[$key]["peisongname"] = $peisongid;
            $list[$key]["peisongphone"] = $peisongphone;

            //指定配送员
            // $courier = $value["courier"];
            // if ($courier) {
            //     $sql = $dsql->SetQuery("SELECT `name`,`phone` FROM `#@__waimai_courier` WHERE `id` = $courier");
            //     $ret = $dsql->getArr($sql);
            //     if ($ret) {
            //         $courier = $ret['name'];
            //     }
            // } else {
            //     $courier = "默认优质配送员";
            // }


            //会员折扣信息
            $userinfo = $userLogin->getMemberInfo($value['userid']);
            if ($userinfo !='No data!'){
                $memberLevelAuth = getMemberLevelAuth($userinfo['level'] ? $userinfo['level'] : '');
                $list[$key]['shopDiscount']    = $memberLevelAuth['shop'].'折' ? $memberLevelAuth['shop'].'折'  : 0;               //  会员商城优惠几折
                $list[$key]['levelName']       = $userinfo['levelName'] ? $userinfo['levelName'] : '';         //会员类型
            }

            $list[$key]['huodongtype'] = (int)$value['huodongtype'];  //活动类型,0-无活动,1-准点抢,2-准点秒,3-砍价,4-拼团

            //砍价订单
            if($value['huodongtype'] == 3){
                //查询砍价金额
                $bargainsql = $dsql->SetQuery("SELECT `kj_num`,`shengyu_kj_num`,`gmoney`,`gnowmoney`,`gfinalmoney`,`state`,`enddate`,`pubdate` FROM `#@__shop_bargaining` WHERE `oid` = " . $value['id']);
                $bargainres = $dsql->dsqlOper($bargainsql, "results");
                if($bargainres){
                    $orderprice = $bargainres[0]['state'] == 2 ? (float)$bargainres[0]['gmoney'] : (float)$bargainres[0]['gnowmoney'];

                    $kj_num = (int)$bargainres[0]['kj_num'];  //可砍次数
                    $shengyu_kj_num = (int)$bargainres[0]['shengyu_kj_num'];  //剩余次数
                    $list[$key]['bargaining'] = array(
                        'kj_num' => $kj_num - $shengyu_kj_num,  //已砍次数
                        'shengyu_kj_num' => $shengyu_kj_num,  //剩余次数
                        'gmoney' => (float)$bargainres[0]['gmoney'],  //商品原价（没有参加活动时的价格）
                        'gnowmoney' => (float)$bargainres[0]['gnowmoney'],  //当前已砍至金额
                        'gfinalmoney' => (float)$bargainres[0]['gfinalmoney'],  //最低价
                        'state' => (int)$bargainres[0]['state'],  //状态0-砍价中,1-已成功,2-已失败,3-已购买
                        'enddate' => date('Y-m-d H:i:s', $bargainres[0]['enddate']),  //结束时间
                        'pubdate' => date('Y-m-d H:i:s', $bargainres[0]['pubdate'])  //开始时间
                    );

                }
            }


            $shopFee = $value['shopFee'];
            $orderprice += $value['logistic'];
            $list[$key]["countprice"] = $orderprice;  //加上配送费  总额
            $list[$key]["logistic"] = $value['changetype'] ? (float)$value['changelogistic'] : (float)$value['logistic'];  //配送费
            $list[$key]["payprice"] = (float)$value['payprice'];  //实际支付金额
            $list[$key]["changeprice"] = $value['changetype'] ? (float)$value['changeprice'] : 0;  //改价后的金额

            //如果有改价，订单金额等于改价的金额，下面再把优惠，抵扣的算上
            if($value['changetype']){
                $orderprice = $value['changeprice'];
            }

            //商家收
            //扣除佣金
            global $cfg_shopFee;
            $amount = $value['amount'];  //实际支付价格
            $cfg_shopFee = !empty((float)$shopFee) ? (float)$shopFee : (float)$cfg_shopFee;
            $ordershop = $orderprice - $quan;
            // $list[$key]['sjprice'] = sprintf("%.2f",($ordershop - (($orderprice - $quan)* $cfg_shopFee / 100)));    //计算商家所得

            // //平台收入
            // $list[$key]['pingtai']= sprintf("%.2f",$ordershop - $list[$key]['sjprice'] );

            //不可以实时计算商家收入，因为当前的参数配置不一定和之前的一样，商家的收入直接从member_money中获取即可
            $ordernum = $value["ordernum"];
            $sql = $dsql->SetQuery("SELECT `amount` FROM `#@__member_money`  WHERE `userid` = '$storeUserid' AND `showtype` = '0' AND `ordernum` = '$ordernum'");
            $sjprice = (float)$dsql->getOne($sql);

            $pingsql = $dsql->SetQuery("SELECT `platform`,`commission`,`bear`,`cityid`  FROM `#@__member_money`  WHERE `showtype` = '1' AND `info` like '%$ordernum%'");
            $pingres= $dsql->dsqlOper($pingsql,"results");
            //平台收入
            $pingtai= $pingres[0]['platform'];
            //分站收
            $fenzhan= $pingres[0]['commission'];
            //分站名称
            $fenzhanName = getSiteCityName($pingres[0]['cityid']);
            $fenzhanName = $fenzhanName == '未知' ? $pingres[0]['cityid'] : $fenzhanName;

            $list[$key]['sjprice'] = $sjprice;
            $list[$key]['pingtai'] = $pingtai;
            $list[$key]['fenzhan'] = $fenzhan;
            $list[$key]['fenzhanName'] = $fenzhanName;

            $cfgPointRatio = (int)$cfg_pointRatio;
            $pointValue = (int)$value['point'];
            $pointAmount = $cfgPointRatio !== 0 ? $pointValue / $cfgPointRatio : 0;

            $orderprice -= ($quan + $auth_logistic + $auth_shop_price + $pointAmount);  //列表看总额，实际支付到详情查看，商品金额-优惠券-会员商品折扣-会员配送费折扣
            $list[$key]["orderprice"] = sprintf("%.2f", $orderprice);
            $list[$key]["amount"] = (float)$amount;
            $list[$key]["pointAmount"] = (float)sprintf("%.2f", $pointAmount);

            $list[$key]["orderstate"] = $value["orderstate"];
            $list[$key]["orderdate"]  = date('Y-m-d H:i:s', $value["orderdate"]);

            //主表信息
            $list[$key]['paytypeold'] = $value['paytype'];
            
            if ($paymentList[$value['paytype']]) {
                $_paytype = $paymentList[$value['paytype']];
            } else {
                $_paytype = empty($value["paytype"]) ? "积分或余额" : ($value["paytype"] == 'delivery' ? '货到付款' : $value["paytype"]);
            }

            if($paymentList[$value['paytype']]){
                $payname = $paymentList[$value['paytype']];
            }else{

                global $cfg_pointName;
                $payname = "";
                if($value["paytype"] == "point,money"){
                    $payname = $cfg_pointName."+余额";
                }elseif($value["paytype"] == "point"){
                    $payname = $cfg_pointName;
                }elseif($value["paytype"] == "money"){
                    $payname = "余额";
                }elseif($value["paytype"] == "delivery"){
                    $payname = "货到付款";
                }else{
                    $payname = empty($value["paytype"]) ? "积分或余额" : $value["paytype"];
                }
            }

            //代付
            if($value['peerpay'] > 0){
                $userinfo = $userLogin->getMemberInfo($value['peerpay']);
        		if(is_array($userinfo)){
                    $_paytype = '['.$userinfo['nickname'].']'.$_paytype.'代付';
                }else{
                    $_paytype = '['.$value['peerpay'].']'.$_paytype.'代付';
                }
            }

            $list[$key]["paytype"] = $_paytype;
            $list[$key]["payname"] = $payname;

            $list[$key]['retState'] = $value['ret_state'];
            $list[$key]['protype'] = (int)$value['protype'];

            //会员等级信息
            $level = array();
            $sql = $dsql->SetQuery("SELECT l.`name`, l.`icon` FROM `#@__member_level` l LEFT JOIN `#@__member` m ON m.`level` = l.`id` WHERE m.`id` = " . $value['userid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $level = array(
                    'name' => $data['name'],
                    'icon' => getFilePath($data['icon'])
                );
            }
            $list[$key]['level'] = $level;

        }

        if (count($list) > 0) {
            if ($do !="export"){
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state60": ' . $state60 . ', "state61": ' . $state61 . ', "state62": ' . $state62 . ', "state63": ' . $state63 . ', "state64": ' . $state64 . ', "state65": ' . $state65 . ', "state66": ' . $state66 . ', "state7": ' . $state7 . ', "state10": ' . $state10 . ', "state11": ' . $state11 . ', "state12": ' . $state12 . '}, "shopOrder": ' . json_encode($list) . ', "shopTotalPrice" : ' . $shopTotalPrice . ', "peisongTotalPrice" : ' . $peisongTotalPrice . '}';
            }

        } else {
            if ($do !="export"){
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state60": ' . $state60 . ', "state61": ' . $state61 . ', "state62": ' . $state62 . ', "state63": ' . $state63 . ', "state64": ' . $state64 . ', "state65": ' . $state65 . ', "state66": ' . $state66 . ', "state7": ' . $state7 . ', "state10": ' . $state10 . ', "state11": ' . $state11 . ', "state12": ' . $state12 . '}}';
            }
        }

    } else {
        if ($do !="export"){
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state3": ' . $state3 . ', "state4": ' . $state4 . ', "state60": ' . $state60 . ', "state61": ' . $state61 . ', "state62": ' . $state62 . ', "state63": ' . $state63 . ', "state64": ' . $state64 . ', "state65": ' . $state65 . ', "state66": ' . $state66 . ', "state7": ' . $state7 . ', "state10": ' . $state10 . ', "state11": ' . $state11 . ', "state12": ' . $state12 . '}}';
        }

    }
    // 导出表格
    if($do == "export"){

        if(empty($list)){
            echo '{"state": 200, "info": "暂无数据！"}';
            die;
        }
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商品标题'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商品总数量'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '总额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '运费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员价格折扣'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员配送费折扣'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '优惠券'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', $cfg_pointName . '支付'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '实际支付'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台收入'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '所属分站'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分站收入'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家收入'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '付款时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '买家id'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '买家'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收货地址'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '收货人姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '备注'));

        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '快递公司'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '快递单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '发货时间'));

        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '骑手姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '骑手电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '接单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '取货时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '完成时间'));




        $filename = '商城订单数据(' . date("Y_m_d H_i_s").").csv";
        $folder = HUONIAOROOT . "/uploads/shop/export/";
        $filePath = $folder.$filename;
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        fputcsv($file, $tit);

        foreach($list as $data){
            switch ($data['orderstate']){
                case 0;
                    $data['orderstate'] = '未付款';
                    break;
                case 1;
                    $data['orderstate'] = '已付款';
                    break;
                case 2;
                    $data['orderstate'] = '已过期';
                    break;
                case 3;
                    $data['orderstate'] = '交易成功';
                    break;
                case 4;
                    $data['orderstate'] = '退款中';
                    break;
                case 6;
                    if ($data['shipping'] == 1){
                        $data['orderstate'] = '已发货';
                    }else{
                        if($data['peisongid'] == 0){
                            $data['orderstate'] = '已确认';
                        }else{
                            if ($data['songdate'] == 0){
                                $data['orderstate'] = '待取货';
                            }else{
                                $data['orderstate'] = '配送中';
                            }
                        }
                    }
                    break;
                case 7;
                    $data['orderstate'] = '退款成功';
                    $moneyname = '';
                    if($data['paytype'] =="paytypeold"){
                        $moneyname ="积分:";
                    }else{
                        $moneyname ="金额:";
                    }
                    $data['refrundamount'] = $data['refrundamount'] == 0 ? '全额' : $data['refrundamount'];
                    $data['orderstate'] = $data['orderstate'] . $moneyname.$data['refrundamount'];
                    break;
                case 10;
                    $data['orderstate'] = '关闭';
                    break;

            }
            // 详情
            $data['business'] = number_format($data['business'],2);
            $data['ptyd'] = number_format($data['ptyd'],2);
            $foods = array();
            if(is_array($data['food'])){
                foreach($data['food'] as $food){
                    if (empty($food['ntitle'])){
                        array_push($foods, $food['title']."【".$food['count']."】");
                    }else{
                        array_push($foods, $food['title']."-".$food['ntitle']."【".$food['count']."】");

                    }
                }
            }

            $auth_shop_price = (float)$data['auth_shop_price'];  //会员优惠的金额
            $auth_logistic = (float)$data['auth_logistic'];  //会员优惠配送费的金额
            $anth_peisongBody = $data['anth_peisongBody'];
            $anth_shopBody = $data['anth_shopBody'];

            if($auth_shop_price){
                $priceinfo = $anth_shopBody . '-' . $auth_shop_price;
            }
            if($auth_logistic){
                $peiinfo = $anth_peisongBody . '-' . $auth_logistic;
            }

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']."\t"));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['store']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['proName']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['proCount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['payname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderstate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['countprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['logistic']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $priceinfo));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $peiinfo));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['quanbody'].'-'.$data['auth_quan']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pointAmount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pingtai']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['fenzhanName']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['fenzhan']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['sjprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paydate'] > 0 ? $data['paydate'] : '' ));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['address']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['people']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['contact']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));

            //物流信息
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['exp_company']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['exp_number']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['exp_date']));

            //骑手信息
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peisongname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peisongphone']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['peidate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['songdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['okdate']));


            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename =".$filename);
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);
        die;
    }


    die;

//删除
} elseif ($dopost == "del") {
    if (!testPurview("shopOrderDel")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;
    $each  = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }

        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "_product` WHERE `orderid` = " . $val);
        $dsql->dsqlOper($archives, "update");
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除商城订单", $id);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

} 

//撤销申请退款
elseif ($dopost == "revoke") {
    if (!testPurview("shopOrderEdit")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;

    //判断是否已经发货
    $expdate = 0;
    $sql     = $dsql->SetQuery("SELECT `exp_date` FROM `#@__shop_order` WHERE `id` = " . $id);
    $ret     = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $expdate = $ret[0]['exp_date'];
    }
    if ($expdate) {
        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `ret_state` = 0 WHERE `id` = " . $id);
    } else {
        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `orderstate` = 1, `ret_state` = 0 WHERE `id` = " . $id);
    }
    $ret = $dsql->dsqlOper($sql, "update");

    if ($ret != 'ok') {
        echo '{"state": 200, "info": ' . json_encode($ret) . '}';
    } else {
        adminLog("撤销商城订单退款申请", $id);
        echo '{"state": 100, "info": ' . json_encode("撤销成功！") . '}';
    }
    die;

}

//付款
    /**
     * 付款业务逻辑
     * 1. 验证订单状态，只有状态为未付款时才可以往下进行
     * 2. 验证订单中的商品：1. 订单中含有不存在或已经下架的商品
     *                    2. 订单中的商品库存不足
     * 3. 会员账户余额，不足需要先到会员管理页面充值
     * 4. 上面三种都通过之后就可以进行支付成功后的操作：
     * 5. 更新订单的支付方式
     * 6. 更新订单中商品的已售数量、库存（包括不同规格的库存）
     * 7. 扣除会员账户余额并做相关记录
     * 8. 更新订单状态为已付款
     * 9. 后续操作（如：发送短信通知等）
     */
elseif ($dopost == "payment") {
    if (!testPurview("shopOrderEdit")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if (!empty($id)) {
        $archives = $dsql->SetQuery("SELECT `ordernum`, `userid`, `orderstate`, `logistic`, `amount`, `balance`, `point`, `store`, `changeprice`, `usequan` FROM `#@__" . $action . "` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");

        $now = GetMkTime(time());

        if ($results) {
            $ordernum   = $results[0]['ordernum'];
            $userid     = $results[0]["userid"];
            $orderstate = $results[0]["orderstate"];
            $logistic   = $results[0]["logistic"];
            $amount     = (float)$results[0]["amount"];  //订单金额
            $balance     = (float)$results[0]["balance"];  //余额支付的金额
            $point     = (float)$results[0]["point"];  //积分抵扣的金额
            $store      = $results[0]["store"];
            $changeprice = (float)$results[0]["changeprice"];
            $usequan = (int)$results[0]['usequan'];

            //积分抵扣的金额
            global $cfg_pointRatio;
            $pointAmount = $point / $cfg_pointRatio;

            $amount = $changeprice ? $changeprice : $amount;

            if ($orderstate == 0 || $admin) {

                $orderprice = $logistic;
                $opArr      = array();

                //订单商品
                $sql = $dsql->SetQuery("SELECT `id`, `proid`, `speid`, `specation`, `price`, `count`, `logistic`, `discount` FROM `#@__shop_order_product` WHERE `orderid` = " . $id);
                $res = $dsql->dsqlOper($sql, "results");
                if ($res) {

                    foreach ($res as $key => $value) {

                        $opid      = $value['id'];
                        $proid     = $value['proid'];
                        $speid     = $value['speid'];
                        $specation = $value['specation'];
                        $price     = $value['price'];
                        $count     = $value['count'];
//						$logistic  = $value['logistic'];
                        $discount = $value['discount'];

                        global $handler;
                        $handler       = true;
                        $detailHandels = new handlers("shop", "detail");
                        $detailConfig  = $detailHandels->getHandle($proid);
                        if (is_array($detailConfig) && $detailConfig['state'] == 100) {
                            $detail = $detailConfig['info'];
                            if (is_array($detail)) {

                                //验证商品库存
                                $inventor = $detail['inventory'];
                                if ($detail['specification']) {
                                    foreach ($detail['specification'] as $k => $v) {
                                        if ($v['spe'] == $speid) {
                                            $inventor = $v['price'][2];
                                        }
                                    }
                                }

                                if (($detail['limit'] < $count && $detail['limit'] != 0) || $inventor < $count && $inventor != 0) {
                                    echo '{"state": 200, "info": ' . json_encode('【' . $detail['title'] . '  ' . $specation . '】库存不足') . '}';
                                    die;
                                }

                                $oprice     = $price * $count + $discount;
                                $orderprice += $oprice;

                                array_push($opArr, array(
                                    "id"    => $opid,
                                    "proid" => $proid,
                                    "speid" => $speid,
                                    "count" => $count,
                                    "price" => $oprice
                                ));


                            } else {
                                echo '{"state": 200, "info": ' . json_encode("商品不存在，付款失败！") . '}';
                                die;
                            }
                        } else {
                            echo '{"state": 200, "info": ' . json_encode("商品不存在，付款失败！") . '}';
                            die;
                        }

                    }

                    //判断优惠券状态，这里只验证是否已使用和是否过期，不做是否满足使用条件的判断
                    if($usequan){
                        $sql = $dsql->SetQuery("SELECT `state`, `etime` FROM `#@__shop_quanlist` WHERE `id` = " . $usequan);
                        $res = $dsql->dsqlOper($sql, "results");
                        if($res[0]['state'] == 1){
                            echo '{"state": 200, "info": ' . json_encode("优惠券已被使用！") . '}';
                            die;
                        }
                        if($now > $res[0]['etime']){
                            echo '{"state": 200, "info": ' . json_encode("优惠券已过期！") . '}';
                            die;
                        }
                    }


                    //会员信息
                    $userSql    = $dsql->SetQuery("SELECT `money`, `point` FROM `#@__member` WHERE `id` = " . $userid);
                    $userResult = $dsql->dsqlOper($userSql, "results");

                    if ($userResult) {

                        //判断积分账户余额是否充足，不足时，积分抵扣的金额用余额补上
                        $pointLack = 0;
                        if($userResult[0]['point'] < $point){
                            $point = 0;
                            $pointLack = 1;  //积分不足标识
                            $balance += $pointAmount;
                        }

                        if ($userResult[0]['money'] >= $balance) {

                            //更新订单支付方式
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `paytype` = '管理员支付', `point` = '$point', `balance` = '$balance', `payprice` = '0', `orderstate` = 1, `paydate` = '$now' WHERE `id` = " . $id);
                            $dsql->dsqlOper($sql, "update");

                            //更新优惠券状态
                            if($usequan){
                                $sql = $dsql->SetQuery("UPDATE `#@__shop_quanlist` SET `state` = 1, `usedate` = '$now' WHERE `id` = " . $usequan);
                                $dsql->dsqlOper($sql, "update");
                            }

                            //更新商品信息
                            foreach ($opArr as $key => $value) {

                                $_id    = $value['id'];
                                $_proid = $value['proid'];
                                $_count = $value['count'];
                                $_speid = $value['speid'];
                                $_price = $value['price'];

                                //更新订单实付金额
                                $sql = $dsql->SetQuery("UPDATE `#@__shop_order_product` SET `point` = 0, `balance` = 0, `payprice` = '$_price' WHERE `id` = " . $_id);
                                $dsql->dsqlOper($sql, "update");

                                //更新已购买数量
                                $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `sales` = `sales` + $_count, `inventory` = `inventory` - $_count WHERE `id` = " . $_proid);
                                $dsql->dsqlOper($sql, "update");

                                //更新库存
                                $sql = $dsql->SetQuery("SELECT `specification` FROM `#@__shop_product` WHERE `id` = $_proid");
                                $ret = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    $specification = $ret[0]['specification'];
                                    if (!empty($specification)) {
                                        $nSpec         = array();
                                        $specification = explode("|", $specification);
                                        foreach ($specification as $k => $v) {
                                            $specArr = explode(",", $v);
                                            if ($specArr[0] == $_speid) {
                                                $spec   = explode("#", $v);
                                                $nCount = $spec[2] - $_count;
                                                $nCount = $nCount < 0 ? 0 : $nCount;
                                                array_push($nSpec, $spec[0] . "#" . $spec[1] . $nCount);
                                            } else {
                                                array_push($nSpec, $v);
                                            }
                                        }

                                        $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `specification` = '" . join("|", $nSpec) . "' WHERE `id` = '$_proid'");
                                        $dsql->dsqlOper($sql, "update");
                                    }
                                }

                            }


                            //扣除会员帐户
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $balance WHERE `id` = " . $userid);
                            $dsql->dsqlOper($userOpera, "update");

                            if($point){
                                $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - $point WHERE `id` = " . $userid);
                                $dsql->dsqlOper($userOpera, "update");
                            }

                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                            $ret = $dsql->dsqlOper($sql, "results");
                            $pid = 0;
                            if ($ret) {
                                $pid = $ret[0]['id'];
                            }

                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "shop",
                                "id"       => $orderid
                            );
                            global  $userLogin;
                            $shopnamesql = $dsql->SetQuery("SELECT `title` FROM `#@__shop_store` WHERE `id` = $store");
                            $shopnameres = $dsql->dsqlOper($shopnamesql, "results");
                            $urlParam    = serialize($paramUser);
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
                            $userpoint = $user['point'];
                            $title = '商城消费-' . $shopnameres[0]['title'];

                            //记录余额消费日志
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES (" . $userid . ", " . $balance . ", 0, '商城消费：" . $ordernum . "', '$now','shop','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                            //记录积分消费日志
                            if($point){
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$point', '商城消费：" . $ordernum . "', '$now','xiaofei','$userpoint')");
                                $dsql->dsqlOper($archives, "update");
                            }

                            adminLog("为用户授权支付商城订单", $ordernum . ($admin ? '=>强制恢复订单' : ''));

                            echo '{"state": 100, "info": ' . json_encode("付款成功！") . '}';
                            die;

                        } else {
                            echo '{"state": 200, "info": ' . json_encode("买家帐户余额不足，请先进行充值，该订单共需要使用余额支付【".echoCurrency(array('type' => 'symbol')) . $balance."】！" . ($pointLack ? '由于买家的'.$cfg_pointName.'也不足，需要将抵扣的【'.echoCurrency(array('type' => 'symbol')) . $pointAmount.'】也要用余额支付！' : '')) . '}';
                            die;
                        }

                    } else {
                        echo '{"state": 200, "info": ' . json_encode("买家账号不存在，无法继续支付！") . '}';
                        die;
                    }


                }

            } else {
                echo '{"state": 200, "info": ' . json_encode("此订单不是未付款状态，请确认后操作！") . '}';
                die;
            }
        } else {
            echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
            die;
        }

    } else {
        echo '{"state": 200, "info": ' . json_encode("订单ID为空，操作失败！") . '}';
        die;
    }
    die;

} 

//退款
/**
 * 退款业务逻辑
 * 1. 验证订单状态，只有状态为已付款、申请退款、已发货时才可以往下进行
 * 2. 计算需要退回的余额及积分
 * 3. 更新会员余额及积分并做相关记录
 * 4. 更新订单中商品的已售数量、库存（包括不同规格的库存）
 * 5. 更新订单状态为已退款
 * 6. 后续操作（如：发送短信通知等）
 */
elseif ($dopost == "refund") {
    if (!testPurview("shopOrderEdit")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    $setAmount = (float)$amount;

    if (!empty($id)) {
        $archives = $dsql->SetQuery("SELECT l.`ordernum`,l.`store`,l.`userid`, l.`paytype`,l.`orderstate`, l.`logistic`, l.`amount`, l.`balance`, l.`point`, l.`payprice`,l.`refrundno`,l.`refrundamount`,l.`peerpay`,t.`is_tuikuan`,l.`ret_negotiate`, l.`usequan`  FROM `#@__" . $action . "` l  LEFT JOIN  `#@__shop_order_product` o  ON o.`orderid` = l.`id` LEFT JOIN   `#@__shop_product` t  ON o.`proid` = t.`id`  WHERE l.`id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $is_tuikuan   = $results[0]['is_tuikuan'];
            // if ($is_tuikuan == 1) {
            //     echo '{"state": 200, "info": ' . json_encode("此商品不支持退款！") . '}';
            //     die;
            // }

            if ((int)$tuikuantype == 1) {

                $ret_negotiate = $results[0]["ret_negotiate"] !='' ? unserialize($results[0]["ret_negotiate"]) : array () ; /*协商历史*/

                $refundinfo = array();
                $refundinfo['typename'] = '平台介入处理完成';
                $info = '';
                if ($isCheck == 1) {
                    $info = '同意退款';
                } elseif ($isCheck == 2) {
                    $info = '拒绝退款';
                }
                $refundinfo['refundinfo'] = $info;
                $now = GetMkTime(time());
                $refundinfo['datetime']   = $now;
                $refundinfo['type']       = 2;

                if ($ret_negotiate) {

                    array_push($ret_negotiate['refundinfo'],$refundinfo);

                } else {

                    $ret_negotiate['refundinfo'][0] = $refundinfo;

                }

                $ret_negotiatestr = serialize($ret_negotiate);

                $orderOpera = $dsql->SetQuery("UPDATE `#@__shop_order` SET `ret_ptaudittype` = '$isCheck',`ret_negotiate` = '$ret_negotiatestr' WHERE `id` = " . $id);
                $dsql->dsqlOper($orderOpera, "update");

                if ($isCheck == 2) {
                    echo '{"state": 100, "info": ' . json_encode("操作成功！") . '}';
                    die;
                }

            }

            $ordernum   = $results[0]['ordernum'];
            $userid     = (int)$results[0]["userid"];
            $orderstate = (int)$results[0]["orderstate"];
            $logistic   = (float)$results[0]["logistic"];
            // $amount     = sprintf('%.2f',$results[0]["amount"] + $results[0]["logistic"]);
            $balance    = (float)$results[0]["balance"];
            $point      = (int)$results[0]["point"];
            $store      = (int)$results[0]["store"];
            $paytype    = $results[0]["paytype"];
            $refrundno  = $results[0]["refrundno"];
            $payprice   = (float)$results[0]["payprice"];
            $peerpay    = (int)$results[0]["peerpay"];
            $usequan    = (int)$results[0]['usequan'];

            //如果用了在线支付，则余额强制重置为0，现在不支持余额和在线支付混合支付
            if($payprice){
                $balance = 0;
            }

            if ($peerpay > 0) {
                $balance += $payprice;
            }
            $refrundamount = $results[0]["refrundamount"];

            //积分抵扣金额
            global $cfg_pointRatio;
            $pointAmount = $point / $cfg_pointRatio;

            //订单总金额 = 余额支付+积分抵扣+在线支付
            $amount = sprintf('%.2f', $balance + $pointAmount + $payprice);

//			if(empty($setAmount)){
//				$orderTotalAmount = $balance + $payprice + $point/$cfg_pointRatio;
//
//			}else{
//
//				$orderTotalAmount = $setAmount;
//			}

            // 全额
            $maxAmount = $amount - $refrundamount;
            if (empty($setAmount)) {
                $this_amount = $maxAmount;
            } else {
                $this_amount = $setAmount > $maxAmount ? $maxAmount : $setAmount;
            }

            $refrundamount_ = $refrundamount + $this_amount;

            // if ($refrundamount_ == $amount) {
            //     $refrundamount_ = 0;
            // }
            $online_amount = $refrund_online = $this_amount;
            // if ($orderstate == 1 || $orderstate == 4 || $orderstate == 6 || $orderstate == 3) {

                //计算需要退回的积分及余额
                $totalPoint = 0;
                $totalMoney = $logistic;

                $opArr = array();

                $sql = $dsql->SetQuery("SELECT `proid`, `speid`, `count`, `point`, `balance`, `payprice` FROM `#@__shop_order_product` WHERE `orderid` = " . $id);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $key => $value) {
                        $totalPoint += $value['point'];
                        $totalMoney += $value['balance'] + $value['payprice'];

                        array_push($opArr, array(
                            "proid" => $value['proid'],
                            "speid" => $value['speid'],
                            "count" => $value['count']
                        ));
                    }
                }

                //会员信息
                $userSql    = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = " . $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if ($userResult) {
                    $patypem = 0;
                    if ($payprice != 0 && $balance != 0 && $point != 0) {
                        $patypem = 1;
                    } elseif ($payprice != 0 && $balance != 0 && $point == 0) {
                        $patypem = 2;
                    } elseif ($payprice != 0 && $point != 0 && $balance == 0) {
                        $patypem = 3;
                    } elseif ($balance != 0 && $point != 0 && $payprice == 0) {
                        $patypem = 4;
                    }
                    /*$patypem 1- 实际+money+point ,2- 实际+money ,3- 实际+point ,4 point + money*/
                    //混合支付退款
                    $r           = true;
                    $refrunddate = GetMkTime(time());
                    if ($patypem != 0) {
                        /*混合支付情况 退款金额大于实际支付金额 实际支付还可以退多少*/
                        if ($patypem == 1 || $patypem == 2 || $patypem == 3) {
                            if ($payprice <= $this_amount) {
                                /*实际支付小于本次退款*/
                                if ($payprice <= $refrundamount) {
                                    /*实际支付小于退款金额说明实际支付的钱已经全部退完*/
                                    $truemoneysy = 0;
                                } else {

                                    $truemoneysy = $payprice;
                                }
                            } else {
                                if ($payprice > $refrundamount) {
                                    /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                                    $truemoneysy = bcsub($payprice, $refrundamount, 2);
                                    if ($truemoneysy > $this_amount) {
                                        /*实际部分未退款大于此次退款金额*/
                                        $truemoneysy = $this_amount;
                                    }
                                } else {
                                    /*实际支付小于退款记录 说明实际支付已经全部退完*/
                                    $truemoneysy = 0;
                                }
                            }

                            if ($patypem == 1 || $patypem == 2) {
                                /*余额部分*/
                                $money_amount = $this_amount - $truemoneysy;
                                $point = 0;
                            } else {

                                $point = ($this_amount - $truemoneysy) * $cfg_pointRatio;
                            }
                        } else {
                            if ($balance <= $this_amount) {
                                /*余额支付小于本次退款*/
                                if ($balance <= $refrundamount) {
                                    /*余额支付小于退款金额说明余额支付的钱已经全部退完*/
                                    $money_amount = 0;
                                } else {

                                    $money_amount = $balance;
                                }
                            } else {
                                if ($balance > $refrundamount) {
                                    /*实际支付大于等于退款记录 说明实际支付还有部分未退款*/
                                    $money_amount = bcsub($balance, $refrundamount, 2);
                                    if ($money_amount > $this_amount) {
                                        /*实际部分未退款大于此次退款金额*/
                                        $money_amount = $this_amount;
                                    }
                                } else {
                                    /*实际支付小于退款记录 说明实际支付已经全部退完*/
                                    $money_amount = 0;
                                }
                            }
                            $point = $this_amount * $cfg_pointRatio - $money_amount * $cfg_pointRatio;
                        }
                    } else {

                        $truemoneysy  = $this_amount >= $payprice ? (!empty($payprice) || $payprice != '0.00' ? $payprice : 0 ) : $this_amount;         // 在线支付金额

                        if(empty($truemoneysy) || $truemoneysy == '0.00'){

                            $money_amount = $this_amount >= ($balance - $payprice) ? (!empty(($balance - $payprice)) || ($balance - $payprice) != '0.00' ? ($balance - $payprice) : 0 )  : $this_amount;         // 余额支付金额
                        }


                    }

                    if ($patypem == 3) {
                        $pointtype = '1';
                    } else {
                        $pointtype = '0';
                    }

                    $arr = adminRefund('shop',$peerpay,$paytype,$truemoneysy,$ordernum,$refrundno,$balance,$id);    //后台退款
                    $r =$arr[0]['r'];
                    $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : GetMkTime(time());
                    $refrundno   = $arr[0]['refrundno'];
                    $refrundcode = $arr[0]['refrundcode'];
                    if ($r) {

                        //退回积分
                        if ($pointtype == '0' && $point != 0) {
                            global $userLogin;
                            $info = '商城订单退回：('.$cfg_pointName.'退款：' . (floatval($point)) . '，现金退款：' . (floatval($truemoneysy)) . '，余额退款：' . (floatval($money_amount)) . ')：' . $ordernum;
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$point);
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                            $dsql->dsqlOper($archives, "update");

                        }
                        //会员帐户充值
                        if ($patypem == 2) {
                            $balancetype = '1';
                        } else {
                            $balancetype = '0';
                        }
                        if ($balancetype == '0' && $money_amount != 0) {
                            $info = '商城订单退款：('.$cfg_pointName.'退款：' . (floatval($point)) . '，现金退款：' . (floatval($truemoneysy)) . '，余额退款：' . (floatval($money_amount)) . ')：' . $ordernum;
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $money_amount . " WHERE `id` = " . $userid);
                            $dsql->dsqlOper($userOpera, "update");


                            $pay_name    = '';
                            $pay_namearr = array();
                            $paramUser   = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "shop",
                                "id"       => $id
                            );
                            $urlParam    = serialize($paramUser);

                            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if (!empty($ret)) {
                                $pay_name = $ret[0]['pay_name'];
                            } else {
                                $pay_name = $ret[0]["paytype"];
                            }

                            if ($pay_name) {
                                array_push($pay_namearr, $pay_name);
                            }

                            if ($money_amount != '') {
                                array_push($pay_namearr, "余额");
                            }

                            if ($point != '') {
                                array_push($pay_namearr, $cfg_pointName);
                            }

                            if ($pay_namearr) {
                                $pay_name = join(',', $pay_namearr);
                            }

                            $tuikuan      = array(
                                'paytype'      => $pay_name,
                                'truemoneysy'  => $truemoneysy,
                                'money_amount' => $money_amount,
                                'point'        => $point,
                                'refrunddate'  => $refrunddate,
                                'refrundno'    => $refrundno
                            );
                            global  $userLogin;
                            $tuikuanparam = serialize($tuikuan);
                            //保存操作日志
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
//                            $money  = sprintf('%.2f',($usermoney + $money_amount));
                            //记录退款日志
                            $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (" . $userid . ", " . $money_amount . ", 1, '$info', " . GetMkTime(time()) . ",'shop','tuikuan','$urlParam','$ordernum','$tuikuanparam','商城消费','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                        }
                        /*商家扣除冻结金额*/
                        if($refrundamount >= $balance){
                            $freezeamount = 0;
                        }else{

                            $freezeamount = (float)$truemoneysy + (float)$money_amount;

                            if($balance <= $freezeamount){

                                $freezeamount = (float)$balance;
                            }
                        }

                        // $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezeamount WHERE `id` = " . $userid);
                        // $dsql->dsqlOper($usersql, "update");

                        //更新订单状态
                        // if ($amount == $refrundamount_) {
                        //     $refrundamount_ = '0';
                        // }
                        $orderOpera = $dsql->SetQuery("UPDATE `#@__" . $action . "` SET `orderstate` = 7, `ret_state` = 0, `ret_ok_date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$refrundamount_', `ret_amount` = '$refrundamount_', `refrundno` = '$refrundno' WHERE `id` = " . $id);
                        $dsql->dsqlOper($orderOpera, "update");

                        $orderOpera = $dsql->SetQuery("UPDATE `#@__" . $action . "` SET `ret_type` = '其他', `ret_note` = '平台授权退款' WHERE `ret_type` = '' AND `ret_note` = '' AND `id` = " . $id);
                        $dsql->dsqlOper($orderOpera, "update");

                        //如果使用了优惠券，更新优惠券的使用状态
                        if($usequan){
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_quanlist` SET `state` = 0, `usedate` = 0 WHERE `id` = $usequan");
                            $dsql->dsqlOper($sql, 'update');
                        }


                        //更新商品已售数量及库存
                        foreach ($opArr as $key => $value) {

                            $_proid = $value['proid'];
                            $_count = $value['count'];
                            $_speid = $value['speid'];

                            //更新已购买数量
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `sales` = `sales` - $_count, `inventory` = `inventory` + $_count WHERE `id` = " . $_proid);
                            $dsql->dsqlOper($sql, "update");

                            //更新库存
                            $sql = $dsql->SetQuery("SELECT `specification`,`inventoryCount` FROM `#@__shop_product` WHERE `id` = $_proid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $specification  = $ret[0]['specification'];
                                $inventoryCount = $ret[0]['inventoryCount'];
                                if (!empty($specification)) {
                                    $nSpec = array();
                                    if ($inventoryCount != 0) {
                                        $_count = 0;
                                    }
                                    $specification = explode("|", $specification);
                                    foreach ($specification as $k => $v) {
                                        $specArr = explode(",", $v);
                                        if ($specArr[0] == $_speid) {
                                            $spec   = explode("#", $v);
                                            $nCount = $spec[2] + $_count;
                                            array_push($nSpec, $spec[0] . "#" . $spec[1] . "#" . $nCount);
                                        } else {
                                            array_push($nSpec, $v);
                                        }
                                    }

                                    $sql = $dsql->SetQuery("UPDATE `#@__shop_product` SET `specification` = '" . join("|", $nSpec) . "' WHERE `id` = '$_proid'");
                                    $dsql->dsqlOper($sql, "update");
                                }
                            }

                        }

                        adminLog('为商城订单授权退款', $ordernum . '=>' . $this_amount);

                        echo '{"state": 100, "info": ' . json_encode("操作成功，款项已退还至会员帐户！") . '}';
                        die;
                    } else {
                        echo '{"state": 200, "info": ' . json_encode("退款失败，错误码：" . $refrundcode) . '}';
                        die;
                    }

                } else {
                    echo '{"state": 200, "info": ' . json_encode("会员不存在，无法继续退款！") . '}';
                    die;
                }

            // } else {
            //     echo '{"state": 200, "info": ' . json_encode("订单当前状态不支持手动退款！") . '}';
            //     die;
            // }
        } else {
            echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
            die;
        }

    } else {
        echo '{"state": 200, "info": ' . json_encode("订单ID为空，操作失败！") . '}';
        die;
    }


} elseif ($dopost == "setCourier") {


    if (!empty($id) && $courier) {

        $ids = explode(",", $id);

        $now  = GetMkTime(time());
        $date = date("Y-m-d H:i:s", $now);

        $err       = array();
        $state_err = 0;
        foreach ($ids as $key => $value) {

            $sql = $dsql->SetQuery("SELECT o.`orderdate`, o.`userid`, o.`store`, o.`ordernum`, o.`peisongid`, o.`peisongidlog`, o.`logistic` freight, s.`title` shopname FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE o.`id` = $value AND (o.`orderstate` = 6 AND o.`shipping` = 0)");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                $state_err++;
                continue;
            }

            $store        = $ret[0]['store'];
            $userid       = $ret[0]['userid'];
            $pubdate      = $ret[0]['orderdate'];
            $shopname     = $ret[0]['shopname'];
            $ordernum     = $ret[0]['ordernum'];
            $peisongid    = $ret[0]['peisongid'];
            $freight      = $ret[0]['freight'];
            $peisongidlog = $ret[0]['peisongidlog'];

            // 没有变更
            if ($courier == $peisongid) continue;

            $sql = $dsql->SetQuery("SELECT `id`, `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = $peisongid || `id` = $courier");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $k => $v) {
                    if ($v['id'] == $peisongid) {
                        $peisongname_ = $v['name'];
                        $peisongtel_  = $v['phone'];
                    } else {
                        $peisongname = $v['name'];
                        $peisongtel  = $v['phone'];
                    }
                }
            }

            if ($peisongid) {
                // 骑手变更记录
                $pslog = "此订单在 " . $date . " 重新分配了配送员，原配送员是：" . $peisongname_ . "（" . $peisongtel_ . "），新配送员是:" . $peisongname . "（" . $peisongtel . "）<hr>" . $peisongidlog;
            } else {
                $pslog = "";
            }


            if ($peisongid) {
                $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now', `courier_pushed` = 0 WHERE (`orderstate` = 1 || `orderstate` = 11 || `orderstate` = 6) AND `id` = $value");
            } else {
                $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `peisongid` = '$courier', `peisongidlog` = '$pslog', `peidate` = '$now' WHERE (`orderstate` = 6) AND `id` = $value");
            }

            $ret = $dsql->dsqlOper($sql, "update");

            if ($ret == "ok") {

                //推送消息给骑手
                global $cfg_basehost;
                global $cfg_secureAccess;
                sendapppush($courier, "您有新的商城配送订单", "订单号：" . $shopname . $ordernum, $cfg_secureAccess . $cfg_basehost . '/index.php?service=waimai&do=courier&ordertype=shop&template=detail&id=' . $value, "newfenpeiorderShop");

                if ($peisongid) {
                    sendapppush($peisongid, "您有商城订单被其他骑手派送", "订单号：" . $shopname . $ordernum, "", "peisongordercancel");
                }

                //消息通知用户
                $sql_ = $dsql->SetQuery("SELECT o.`ordernum`, o.`id`, o.`userid`, o.`orderdate`, o.`amount`, s.`title` shopname, c.`name`, c.`phone` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid`  WHERE o.`id` = $value");
                $ret_ = $dsql->dsqlOper($sql_, "results");
                if ($ret_) {
                    $data      = $ret_[0];
                    $id        = $data['id'];
                    $userid    = $data['userid'];
                    $ordernum  = $data['ordernum'];
                    $orderdate = $data['orderdate'];
                    $amount    = $data['amount'];
                    $shopname  = $data['shopname'];
                    $name      = $data['name'];
                    $phone     = $data['phone'];

                    $sql   = $dsql->SetQuery("SELECT o.`count`, s.`title` FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_product` s ON s.`id` = o.`proid` WHERE o.`orderid` = '$id'");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    $foods = array();
                    foreach ($ret as $k => $v) {
                        array_push($foods, $v['title'] . " " . $v['count'] . "份");
                    }

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "shop",
                        "id"       => $value
                    );

                    //自定义配置
                    $config = array(
                        "ordernum"   => $shopname . $ordernum,
                        "orderdate"  => date("Y-m-d H:i:s", $pubdate),
                        "orderinfo"  => join(" ", $foods),
                        "orderprice" => $amount,
                        "peisong"    => $name . "，" . $phone,
                        "fields"     => array(
                            'keyword1' => '订单号',
                            'keyword2' => '订单详情',
                            'keyword3' => '订单金额',
                            'keyword4' => '配送人员'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单配送提醒", $param, $config);

                }

            } else {
                array_push($err, $value);
            }

        }

        if ($state_err == count($ids)) {
            echo '{"state": 300, "info": "请检查订单状态"}';
            exit();
        }

        if ($err) {
            echo '{"state": 200, "info": ' . $err . '}';
            exit();
        } else {
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }

    } else {
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
} elseif ($dopost == "getDetail") {
    if($id == "") die;

    $where = ' AND `user_refundtype` = 2';

    $archives = $dsql->SetQuery("SELECT `user_exptype`, `ret_date`,`ret_negotiate` FROM `#@__shop_order` WHERE `id` = ".$id.$where);
    $results = $dsql->dsqlOper($archives, "results");
    if(count($results) > 0){

        $results[0]["user_exptype"]  = $results[0]["user_exptype"];
        $user_exptypename = '';

        if ($results[0]["user_exptype"] == 1) {
            $user_exptypename = '快递';
        } else {
            $user_exptypename = '自行';
        }
        $results[0]["user_exptypename"] = $user_exptypename;
        $results[0]["ret_date"]         = $results[0]["ret_date"];
        $results[0]["ret_datetime"]     = date('Y-m-d H:i:s',$results[0]["ret_date"]);
        $results[0]["ret_negotiate"]    = $results[0]["ret_negotiate"] != '' ? unserialize($results[0]["ret_negotiate"]) : array ();

        echo json_encode($results);

    }else{
        echo '{"state": 200, "info": '.json_encode("订单信息获取失败！").'}';
    }
    die;
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
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
        'admin/shop/shopOrder.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign("keywords", $keywords);

    //配送员
    $where2 = getCityFilter('`cityid`');
    if ($cityid) {
        $where2 .= getWrongCityFilter('`cityid`', $cityid);
    }

    $courier = array();
    $sql     = $dsql->SetQuery("SELECT `id`, `name`, `cityid` FROM `#@__waimai_courier` WHERE `state` = 1 AND `status` = 1 AND `quit` = 0 " . $where2 . " ORDER BY `id` ASC");
    $ret     = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        foreach ($ret as $key => $value) {
            array_push($courier, array(
                "id"   => $value['id'],
                "name" => $value['name'],
                "cityid" => $value['cityid'],
                "cityname" => getSiteCityName($value['cityid'])
            ));
        }
    }

    //按城市排序
    $count = array();
    foreach ($courier as $key => &$_data) {
        $count[$key] = $_data['cityid'];
    }
    unset($_data); // 释放引用变量

    // 按数量从多到少排序
    array_multisort($count, SORT_ASC, $courier);

    $huoniaoTag->assign("courier", $courier);
    $huoniaoTag->assign("paymentList", $paymentList);

    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->assign('shopCourierState', (int)$custom_shopCourierState);  //平台配送开关，0启用  1禁用

    $deliveryValue = (int)$customDeliveryValue;  //订单超过多少未发货
    $deliveryType = (int)$customDeliveryType;  //0小时  1天

    $incompleteValue = (int)$customIncompleteValue;  //订单超过多少未完成
    $incompleteType = (int)$customIncompleteType;  //0小时  1天

    $abnormalOrderTitle = array();
    if($deliveryValue){
        array_push($abnormalOrderTitle, '超过' . $deliveryValue . ($deliveryType == 0 ? '小时' : '天') . '未发货');
    }
    if($incompleteValue){
        array_push($abnormalOrderTitle, '超过' . $incompleteValue . ($incompleteType == 0 ? '小时' : '天') . '未完成');
    }
    $huoniaoTag->assign('abnormalOrderTitle', $abnormalOrderTitle ? join(' 和 ', $abnormalOrderTitle) . '的订单' : '超过多长时间未发货或未完成的订单-未设置异常时间');

    $platformDeliveryValue = (int)$customPlatformDeliveryValue;  //平台配送超过多少时
    $platformDeliveryType = (int)$customPlatformDeliveryType;  //0小时  1天
    $huoniaoTag->assign('platformAbnormalOrderTitle', $platformDeliveryValue ? '平台配送超过' . $platformDeliveryValue . ($platformDeliveryType == 0 ? '小时' : '天') . '未完成的订单' : '平台配送超过多长时间未配送完成的订单-未设置异常时间');
    
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/shop";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
