<?php
/**
 * 商城管理平台
 *
 * @version        $Id: shopOverview.php 2024-3-25 下午13:47:30 $
 * @package        HuoNiao.shop
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopOverview");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopOverview.html";

//商城基本配置信息
include(HUONIAOINC . "/config/shop.inc.php");
$deliveryValue = (int)$customDeliveryValue;  //订单超过多少未发货
$deliveryType = (int)$customDeliveryType;  //0小时  1天
$shopCourierState = (int)$custom_shopCourierState;  //平台配送开关，0启用  1禁用


//当前时间
$now_time = GetMkTime(time());

//今日开始时间
$today_start = GetMkTime(date('Y-m-d')." 00:00:00");

//今日结束时间
$today_end = GetMkTime(date('Y-m-d')." 23:59:59");

//昨天开始时间
$yesterday_start = GetMkTime(date('Y-m-d', strtotime("-1 day"))." 00:00:00");

//昨天结束时间
$yesterday_end = GetMkTime(date('Y-m-d', strtotime("-1 day"))." 23:59:59");

//六天前-用于近七日数据
$week_start = GetMkTime(date('Y-m-d', strtotime("-6 day")));

//前七日开始时间
$lastweek_start = GetMkTime(date('Y-m-d', strtotime("-13 day")));

//前七日结束时间
$lastweek_end = GetMkTime(date('Y-m-d', strtotime("-7 day"))." 23:59:59");

//本月开始时间
$month_start = GetMkTime(date('Y-m-01'));

//本月结束时间
$month_end = GetMkTime(date('Y-m-d', strtotime(date('Y-m-t')))." 23:59:59");

//上个月开始时间
$lastmonth_start = GetMkTime(date('Y-m-01', strtotime("-1 month")));

//上个月结束时间
$lastmonth_end = GetMkTime(date('Y-m-t', strtotime('-1 month', time()))." 23:59:59");

//一个月后
$nextmonth_start = GetMkTime(date('Y-m-d', strtotime("+1 month"))." 23:59:59");

//本年开始时间
$year_start = GetMkTime(date('Y-01-01'));

//本年结束时间
$year_end = GetMkTime(date('Y-12-31')." 23:59:59");

//去年开始时间
$lastyear_start = GetMkTime(date('Y-01-01', strtotime("-1 year")));

//去年结束时间
$lastyear_end = GetMkTime(date('Y-12-31', strtotime("-1 year"))." 23:59:59");




//基本统计数据
//商家[总数、今日入驻、昨日入驻、保障金总额]、注册会员[总数、今日新增、昨日新增]、订单[总数、今日新增、昨日新增]、累计收益[总数、今日、昨日]
if($dopost == 'basic'){

    $data = array(
        'store' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0,
            'promotion' => 0
        ),
        'member' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        ),
        'order' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        ),
        'income' => array(
            'totalCount' => 0,
            'today' => 0,
            'yesterday' => 0
        )
    );

    //商家[总数、今日入驻、昨日入驻、保障金总额]
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(*) FROM `#@__shop_store` WHERE 1 = 1 ".getCityFilter('`cityid`').") AS totalCount, (SELECT COUNT(*) FROM `#@__shop_store` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $today_start AND `pubdate` <= $today_end) AS today, (SELECT COUNT(*) FROM `#@__shop_store` WHERE 1 = 1 ".getCityFilter('`cityid`')." AND `pubdate` >= $yesterday_start AND `pubdate` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['store'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }

    //剩余可提取保障金
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_promotion` WHERE 1 = 1");

    global $cfg_promotion_limitVal;
    global $cfg_promotion_limitType;

    $limitType = '';
    if($cfg_promotion_limitType == 1){
        $limitType = 'day';
    }elseif($cfg_promotion_limitType == 2){
        $limitType = 'month';
    }elseif($cfg_promotion_limitType == 3){
        $limitType = 'year';
    }

    $year=strtotime("-".$cfg_promotion_limitVal." ".$limitType);

    //已提取
    $info2 = $dsql->getArr($sql." AND `type` = 0 AND `state` = 1");
    //可提取
    if($cfg_promotion_limitVal){
        $info3 = $dsql->getArr($sql." AND `type` = 1 AND date < $year"); 
    }else{
        $info3 = $dsql->getArr($sql." AND `type` = 1"); 
    }
    $data['store']['promotion'] = floatval(sprintf("%.2f", $info3[0] - $info2[0]));


    //注册会员[总数、今日新增、昨日新增]
    $sql = $dsql->SetQuery("SELECT count(`id`) totalCount, (SELECT count(`id`) FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND `regtime` >= $today_start ".getCityFilter('`cityid`').") today, (SELECT count(`id`) FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND `regtime` >= $yesterday_start AND `regtime` <= $yesterday_end ".getCityFilter('`cityid`').") yesterday FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2)" . getCityFilter('`cityid`'));
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['member'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }


    //订单[总数、今日新增、昨日新增]
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`').") AS totalCount, (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND `orderdate` >= $today_start AND `orderdate` <= $today_end) AS today, (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND `orderdate` >= $yesterday_start AND `orderdate` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['order'] = array(
            'totalCount' => (int)$ret['totalCount'],
            'today' => (int)$ret['today'],
            'yesterday' => (int)$ret['yesterday']
        );
    }

    //累计收益[总数、今日收益、昨日收益]
    $sql = $dsql->SetQuery("SELECT (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'shop' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`').") AS totalCount, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'shop' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`')." AND `date` >= $today_start AND `date` <= $today_end) AS today, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE ((`ordertype` != '' AND `platform` !=0 AND `showtype` = 1) or (`montype` = 1 AND `info` != '分销商每月返现')) AND `ordertype` = 'shop' AND `showtype`  = 1 AND `type` = 1 ".getCityFilter('`cityid`')." AND `date` >= $yesterday_start AND `date` <= $yesterday_end) AS yesterday");
    $ret = $dsql->getArr($sql);
    if($ret){
        $data['income'] = array(
            'totalCount' => (float)sprintf("%.2f", $ret['totalCount']),
            'today' => (float)sprintf("%.2f", $ret['today']),
            'yesterday' => (float)sprintf("%.2f", $ret['yesterday'])
        );
    }

    echo json_encode($data);die;

}

//统计指定时间段内的数据[今日|近一周|本月|本年、昨日|上周|上月|去年]
//订单量、交易额、客单均价、实付金额、账户抵扣
//订单量和交易额提供刻度明细
elseif($dopost == 'count'){

    $data = array();

    //时间筛选类型
    $start_time = $end_time = 0;
    $last_start_time = $last_end_time = 0;
    
    //今日
    if($type == 1){
        $start_time = $today_start;
        $end_time = $today_end;

        $last_start_time = $yesterday_start;
        $last_end_time = $yesterday_end;
    }
    //最近一周
    elseif($type == 2){
        $start_time = $week_start;
        $end_time = $now_time;

        $last_start_time = $lastweek_start;
        $last_end_time = $week_start - 1;
    }
    //本月
    elseif($type == 3){
        $start_time = $month_start;
        $end_time = $now_time;

        $last_start_time = $lastmonth_start;
        $last_end_time = $month_start - 1;
    }
    //本年
    elseif($type == 4){
        $start_time = $year_start;
        $end_time = $year_end;

        $last_start_time = $lastyear_start;
        $last_end_time = $year_start - 1;
    }
    //自定义时间
    else{

        if(!$start || !$end){
            die('时间未传');
        }

        $start_time = GetMkTime($start);
        $end_time = GetMkTime($end);

        if($start_time == $end_time) $type = 1;

        $end_time += 86400 - 1;
    }

    //订单量、交易额、客单均价、实付金额、账户抵扣-新数据
    $sql = $dsql->SetQuery("SELECT (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderdate` >= $start_time AND o.`orderdate` <= $end_time) AS orderCount, (SELECT SUM(o.`amount`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderdate` >= $start_time AND o.`orderdate` <= $end_time) AS totalAmount, (SELECT COUNT(*) FROM (SELECT o.`id` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderdate` >= $start_time AND o.`orderdate` <= $end_time GROUP BY o.`userid`) as orderPeople) AS orderPeople, (SELECT SUM(o.`amount`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 3 AND `orderdate` >= $start_time AND `orderdate` <= $end_time) AS orderAmount, (SELECT SUM(o.`payprice`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 3 AND `paytype` != 'huoniao_bonus' AND `orderdate` >= $start_time AND `orderdate` <= $end_time) AS payAmount");
    $ret = $dsql->getArr($sql);
    if($ret){
        $orderCount = (int)$ret['orderCount'];  //订单数
        $totalAmount = (float)$ret['totalAmount'];  //订单总金额
        $orderPeople = (int)$ret['orderPeople'];  //下单人数
        $orderAmount = (float)$ret['orderAmount'];  //成功交易金额
        $payAmount = (float)$ret['payAmount'];  //实付金额（排除余额、积分、购买卡）
        $deductAmount = (float)sprintf("%.2f", $orderAmount - $payAmount);  //抵扣金额
        $orderAverage = $orderPeople > 0 ? (float)sprintf("%.2f", $totalAmount / $orderPeople) : 0;  //客单均价

        $data['orderCount'] = $orderCount;
        $data['orderAmount'] = $orderAmount;
        $data['orderAverage'] = $orderAverage;
        $data['payAmount'] = $payAmount;
        $data['deductAmount'] = $deductAmount;
    }

    //订单量、交易额-老数据
    if($type){
        $sql = $dsql->SetQuery("SELECT (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderdate` >= $last_start_time AND o.`orderdate` <= $last_end_time) AS orderCount, (SELECT SUM(o.`amount`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 3 AND `orderdate` >= $last_start_time AND `orderdate` <= $last_end_time) AS orderAmount");
        $ret = $dsql->getArr($sql);
        if($ret){
            $orderCount = (int)$ret['orderCount'];  //订单数
            $orderAmount = (float)$ret['orderAmount'];  //成功交易金额

            $data['lastOrderCount'] = $orderCount;
            $data['lastOrderAmount'] = $orderAmount;
        }
    }

    //订单量与交易额-刻度明细
    $weekArr   = array("日","一","二","三","四","五","六");

    //时间间隔
    if($type == 1){
        $timeStep = 1;  //按小时统计
    }
    elseif($type == 4){
        $timeStep = 30;  //按月统计
    }
    else{
        $timeStep = 24;  //按天统计
    }

    //计算时间
    //$start  需要计算的时间
    //$timeStep 计算时间间隔  1按小时  24按天   30按月
    function calculateTime($start, $timeStep){
        if($timeStep == 30){
            return strtotime("+1 month", $start);
        }else{
            return $start + $timeStep * 3600;
        }
    }
    
    //按日查询
    $coutinfo = array();
    for ($start = $start_time; $start <= $end_time; $start = calculateTime($start, $timeStep)) {
        $time1 = $start;
        $time2 = calculateTime($start, $timeStep);

        $_date = date('Y-m-d', $time1);
        
        //今日/昨日
        if($type == 1){

            $_date = date('Y-m-d H:i:s', $time1);

            $timeStr = '';
            $thour = (int)date('H', strtotime($_date));
            if($thour >= 0 && $thour < 7){
                $timeStr = '凌晨';
            }
            elseif($thour >= 7 && $thour < 12){
                $timeStr = '上午';
            }
            elseif($thour >= 12 && $thour < 14){
                $timeStr = '中午';
            }
            elseif($thour >= 14 && $thour < 18){
                $timeStr = '下午';
            }
            elseif($thour >= 18 && $thour <= 23){
                $timeStr = '晚上';
            }
            $_date = $timeStr . date('H', strtotime($_date)) . ':00';
        }
        //周
        elseif($type == 2){
            $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
        }
        //今年
        elseif(date('Y', strtotime($_date)) == date('Y', time())){
            $_date = date('m-d', strtotime($_date));
        }
        //非今年
        else{
            $_date = date('Y-m-d', strtotime($_date));
        }

        //获取指定时间内的数据
        $_count = $_amount = 0;
        $sql = $dsql->SetQuery("SELECT (SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderdate` >= $time1 AND o.`orderdate` < $time2) AS orderCount, (SELECT SUM(o.`amount`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 3 AND `orderdate` >= $time1 AND `orderdate` < $time2) AS orderAmount");
        $ret = $dsql->getArr($sql);
        if($ret){
            $_count = (int)$ret['orderCount'];
            $_amount = (float)$ret['orderAmount'];
        }

        $coutinfo[$_date] = array(
            'count' => $_count,
            'amount' => $_amount,
        );
    }
    
    $xAxis = $series = array();
    $totalView = $totalJoin = $totalWinner = 0;
    foreach ($coutinfo as $k => $v) {
        array_push($xAxis, $k);
        array_push($series, $v);
    }

    $data['xAxis'] = $xAxis;
    $data['series'] = $series;

    echo json_encode($data);die;

}

//待处理
//商家入驻审核、商品修改、活动商品审核、平台介入订单、订单异常
elseif($dopost == 'todo'){

    $data = array(
        'store' => 0,
        'product' => 0,
        'huodong' => 0,
        'kefu' => 0,
        'exception' => 0
    );

    //商家入驻审核
    $sql = $dsql->SetQuery("SELECT COUNT(*) FROM `#@__shop_store` WHERE `state` = 0" . getCityFilter('`cityid`'));
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['store'] = $ret;
    }

    //商品修改
    $sql = $dsql->SetQuery("SELECT COUNT(p.`id`) FROM `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND p.`state` = 0");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['product'] = $ret;
    }

    //活动商品审核
    $sql = $dsql->SetQuery("SELECT COUNT(h.`id`) FROM `#@__shop_huodongsign` h LEFT JOIN `#@__shop_store` s ON s.`id` = h.`sid` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND h.`state` = 0");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['huodong'] = $ret;
    }

    //平台介入订单
    $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_order` l ON o.`orderid` = l.`id` LEFT JOIN `#@__shop_store` s ON s.`id` = l.`store` WHERE 1 = 1 AND l.`orderstate` = 6 AND o.`ret_ptaudittype` = 0 AND o.`user_refundtype` = 2 AND 1 = 1 ".getCityFilter('s.`cityid`')." GROUP BY o.`orderid`");
    $ret = (int)$dsql->getOne($sql);
    if($ret){
        $data['kefu'] = $ret;
    }

    //订单异常-多长时间未发货
    if($deliveryValue){
        $_time = $deliveryType == 0 ? $deliveryValue * 3600 : $deliveryValue * 86400;
        $expired = $now_time - $_time;
        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 1 AND o.`protype` = 0 AND 1 = (CASE WHEN o.`pinid` != 0 THEN CASE WHEN o.`pinstate` THEN 1 ELSE 0 END ELSE 1=1 END) AND o.`paydate` < $expired");
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['exception'] = $ret;
        }
    }

    //订单异常-多长时间未完成
    $incompleteValue = (int)$customIncompleteValue;  //订单超过多少未完成
    $incompleteType = (int)$customIncompleteType;  //0小时  1天
    if($incompleteValue){
        $_time = $incompleteType == 0 ? $incompleteValue * 3600 : $incompleteValue * 86400;
        $expired = $now_time - $_time;
        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 6 AND o.`ret_state` = 0 AND o.`exp_date` != 0 AND o.`peisongid` = 0 AND o.`exp_date` < $expired");
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['exception'] += $ret;
        }
    }

    echo json_encode($data);die;

}

//占比分析，按分类统计
//商品、商家、订单、交易额
elseif($dopost == 'ratio'){

    $data = array();

    //商品
    if($type == 'product'){

        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_type` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
			    $lower_data = $dsql->getTypeList($value['id'], "shop_type");
			    if($lower_data){
                    $lower = arr_foreach($lower_data);
                    if($lower){
                        $typeArr = array_merge($typeArr, $lower);
                    }
			    }

                $typeIds = join(',', $typeArr);

                $sql = $dsql->SetQuery("SELECT COUNT(p.`id`) AS num FROM `#@__shop_product` p LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE p.`type` in ($typeIds)" . getCityFilter('s.`cityid`'));
                $ret1 = $dsql->dsqlOper($sql, "results");
                if($ret1){
                    $totalCount += (int)$ret1[0]['num'];
                    array_push($data, array(
                        'typename' => $value['typename'],
                        'count' => (int)$ret1[0]['num']
                    ));
                }
                
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);

    }

    //商家
    elseif($type == 'store'){
        
        $sql = $dsql->SetQuery("SELECT t.`typename`, COUNT(p.`id`) AS count, ROUND(COUNT(p.`id`) / (SELECT COUNT(DISTINCT p2.`id`) FROM `#@__shop_store` p2 WHERE 1 = 1 ".getCityFilter('p.`cityid`').") * 100, 2) AS ratio FROM `#@__shop_store` p JOIN `#@__shop_type` t ON p.`industry` = t.`id` WHERE t.`parentid` = 0 ".getCityFilter('p.`cityid`')." GROUP BY p.`industry` ORDER BY count DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $data = $ret;
        }

    }

    //订单
    elseif($type == 'order'){

        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_type` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($value['id'], "shop_type"));
                if($lower){
                    $typeArr = array_merge($typeArr, $lower);
                }

                $typeIds = join(',', $typeArr);

                $sql = $dsql->SetQuery("SELECT SUM(op.`count`) AS num FROM `#@__shop_order_product` op LEFT JOIN `#@__shop_product` p ON p.`id` = op.`proid` LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE p.`type` in ($typeIds)" . getCityFilter('s.`cityid`'));
                $ret1 = $dsql->dsqlOper($sql, "results");
                if($ret1){
                    $totalCount += (int)$ret1[0]['num'];
                    array_push($data, array(
                        'typename' => $value['typename'],
                        'count' => (int)$ret1[0]['num']
                    ));
                }
                
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);

    }

    //交易额
    elseif($type == 'income'){

        $totalCount = 0;
        $sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__shop_type` WHERE `parentid` = 0");  //只统计一级分类
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {

                $typeArr = array($value['id']);
                global $arr_data;
			    $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($value['id'], "shop_type"));
                if($lower){
                    $typeArr = array_merge($typeArr, $lower);
                }

                $typeIds = join(',', $typeArr);
                
                $sql = $dsql->SetQuery("SELECT SUM(o.`amount`) AS num FROM `#@__shop_order` o LEFT JOIN `#@__shop_order_product` op ON op.`orderid` = o.`id` LEFT JOIN `#@__shop_product` p ON p.`id` = op.`proid` LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` WHERE o.`orderstate` = 3 AND p.`type` in ($typeIds)" . getCityFilter('s.`cityid`'));
                $ret1 = $dsql->dsqlOper($sql, "results");
                if($ret1){
                    $totalCount += (float)$ret1[0]['num'];
                    array_push($data, array(
                        'typename' => $value['typename'],
                        'count' => (float)$ret1[0]['num']
                    ));
                }
                
            }
        }

        // 提取需要排序的字段作为关联数组
        $count = array();
        foreach ($data as $key => &$_data) {
            if($_data['count'] == 0){
                unset($data[$key]);
            }else{
                $data[$key]['ratio'] = (float)sprintf("%.2f", $_data['count'] / $totalCount * 100);
                $count[$key] = $_data['count'];
            }
        }
        unset($_data); // 释放引用变量

        // 按数量从多到少排序
        array_multisort($count, SORT_DESC, $data);

    }

    echo json_encode($data);die;

}

//平台配送订单统计
//待配送、配送中、配送异常、已完成
elseif($dopost == 'peisong'){

    $data = array();
    if(!$shopCourierState){

        //待配送
        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) AS num FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 6 AND o.`ret_state` = 0 AND o.`exp_date` != 0 AND o.`peisongid` = 0 AND o.`shipping` = 0");
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['state1'] = $ret;
        }

        //配送中
        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) AS num FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 6 AND o.`ret_state` = 0 AND o.`exp_date` != 0 AND o.`peisongid` != 0 AND o.`shipping` = 0");
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['state2'] = $ret;
        }

        //配送异常
        $exceptionSql1 = array();
        $platformDeliveryValue = (int)$customPlatformDeliveryValue;  //订单配送超过多少未完成
        $platformDeliveryType = (int)$customPlatformDeliveryType;  //0小时  1天
        if($platformDeliveryValue){
            $_time = $platformDeliveryType == 0 ? $platformDeliveryValue * 3600 : $platformDeliveryValue * 86400;
            $expired = $now_time - $_time;
            array_push($exceptionSql1, "(`orderstate` = 6 AND `ret_state` = 0 AND `exp_date` != 0 AND `peisongid` != 0 AND `shipping` = 0 AND `peidate` < $expired)");
        }

        $exceptionSql1 = $exceptionSql1 ? " AND (" . join(' OR ', $exceptionSql1) . ")" : " AND 1 = 2";

        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) AS num FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')."" . $exceptionSql1);
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['state3'] = $ret;
        }

        //已完成
        $sql = $dsql->SetQuery("SELECT COUNT(o.`id`) AS num FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` WHERE 1 = 1 ".getCityFilter('s.`cityid`')." AND o.`orderstate` = 3 AND o.`peisongid` != 0 AND o.`shipping` = 0");
        $ret = (int)$dsql->getOne($sql);
        if($ret){
            $data['state4'] = $ret;
        }
    }

    echo json_encode($data);die;
    
}



//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
	$cssFile = array(
        'admin/base.css',
        'ui/element_ui_index.css',
		'admin/shopOverview.css'
	);
	$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
        'vue/vue.min.js',
        'ui/echarts/echart.5.5.0.js',
        'ui/element_ui_index.js',
		'admin/shop/shopOverview.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $joinCheck = $customJoinCheck;  //商家入驻是否需要审核  0需要审核  1不需要审核
    $fabuCheck = $customFabuCheck;  //发布商品审核是否需要审核  0需要审核  1不需要审核
    $platformDeliveryValue = (int)$customPlatformDeliveryValue;  //平台配送订单配送超过多少提醒
    $platformDeliveryType = (int)$customPlatformDeliveryType;  //0小时  1天
    $deliveryValue = (int)$customDeliveryValue;  //订单超过多少未发货
    $deliveryType = (int)$customDeliveryType;  //0小时  1天
    $incompleteValue = (int)$customIncompleteValue;  //订单超过多少未完成
    $incompleteType = (int)$customIncompleteType;  //0小时  1天

    $huoniaoTag->assign('joinCheck', (int)$joinCheck);
    $huoniaoTag->assign('fabuCheck', (int)$fabuCheck);

    $huoniaoTag->assign('platformDeliveryValue', (int)$platformDeliveryValue);
    $huoniaoTag->assign('platformDeliveryType', (int)$platformDeliveryType);
    $huoniaoTag->assign('deliveryValue', (int)$deliveryValue);
    $huoniaoTag->assign('deliveryType', (int)$deliveryType);
    $huoniaoTag->assign('incompleteValue', (int)$incompleteValue);
    $huoniaoTag->assign('incompleteType', (int)$incompleteType);

    $huoniaoTag->assign('shopCourierState', $shopCourierState);  //平台配送开关，0启用  1禁用

    //获取系统已安装插件，抽奖活动、小程序直播、商品采集
    $sql = $dsql->SetQuery("SELECT `pid` FROM `#@__site_plugins` WHERE `pid` in (8,22,23)");
    $ret = $dsql->getArr($sql);
    $huoniaoTag->assign('plugins', $ret);

    //结算相关配置文件
    require_once(HUONIAOINC . '/config/settlement.inc.php');
    $shopFee = (float)$cfg_shopFee;  //平台抽商城佣金比例
    $fzshopFee = (float)$cfg_fzshopFee;  //分站抽商城佣金比例
    $levelFee = (float)$cfg_levelFee;  //分站抽会员升级佣金比例
    $storeFee = (float)$cfg_storeFee;  //分站抽商家入驻佣金比例
    $fenxiaoFee = (float)$cfg_fenxiaoFee;  //分站抽分销商入驻佣金比例
    
    $huoniaoTag->assign('shopFee', $shopFee);
    $huoniaoTag->assign('fzshopFee', $fzshopFee);
    $huoniaoTag->assign('levelFee', $levelFee);
    $huoniaoTag->assign('storeFee', $storeFee);
    $huoniaoTag->assign('fenxiaoFee', $fenxiaoFee);


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
