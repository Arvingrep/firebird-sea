<?php
/**
 * 管理后台首页
 *
 * @version        $Id: index.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Administrator
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "." );
require_once(dirname(__FILE__)."/inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/templates";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "index_2.0.html";

//域名检测 s
$httpHost  = $_SERVER['HTTP_HOST'];    //当前访问域名
$reqUri    = $_SERVER['REQUEST_URI'];  //当前访问目录

//判断是否为主域名，如果不是则跳转到主域名的后台目录
if($cfg_basehost != $httpHost && $cfg_basehost != str_replace("www.", "", $httpHost)){
    header("location:".$cfg_secureAccess.$cfg_basehost.$reqUri);
    die;
}

$cityidFilter = getCityFilter('`cityid`');

//当前登录管理员ID
$userid = $userLogin->getUserID();

//已开通的城市分站数量
$siteCityCount = 0;
$sql = $dsql->SetQuery("SELECT count(c.`id`) totalCount FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` != '' AND c.`state` = 1 ORDER BY c.`id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    $siteCityCount = $ret[0]['totalCount'];
}


//常用模块配置
if($dopost == "updateCommonModule"){
    
    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `admin_common_module` = '$module' WHERE `id` = " . $userid);
    $dsql->dsqlOper($sql, "update");

    // adminLog("设置常用模块", $module);
    die('{"state": 100, "info": '.json_encode("保存成功！").'}');

}
//更新我最近使用的功能
elseif($dopost == "updateCommonFunction"){

    $data = $_POST['data'];

    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `admin_common_function` = '$data' WHERE `id` = " . $userid);
    $dsql->dsqlOper($sql, "update");

    // adminLog("添加最近使用的菜单", $data);
    die('{"state": 100, "info": '.json_encode("保存成功！").'}');

}
//更新我收藏的功能
elseif($dopost == "updateCollectionFunction"){

    $data = $_POST['data'];

    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `admin_collection_function` = '$data' WHERE `id` = " . $userid);
    $dsql->dsqlOper($sql, "update");

    // adminLog("添加常用收藏菜单", $data);
    die('{"state": 100, "info": '.json_encode("保存成功！").'}');

}
//数据统计
elseif($dopost == "realtimedata"){
    $realtimedata = array();
    $time = GetMkTime(time());
    $today_start = GetMkTime(date('Y-m-d', $time));
    $today_end = $today_start + 86400;
    $yesterday_start = $today_start - 86400;

    //收益总计，今日，昨日
    $sql = $dsql->SetQuery("SELECT SUM(`platform`) as total, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE `date` >= $today_start AND `showtype` = 1 AND `type` = 1) today, (SELECT SUM(`platform`) FROM `#@__member_money` WHERE `date` >= $yesterday_start AND `date` < $today_start AND `showtype` = 1 AND `type` = 1) yesterday FROM `#@__member_money` WHERE `showtype` = 1 AND `type` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        //统计手续费信息
        $totalCharge = $todayCharge = $yesterdayCharge = 0;
        $_sql = $dsql->SetQuery("SELECT SUM(`pt_charge`) as total, (SELECT SUM(`pt_charge`) FROM `#@__pay_log` WHERE `pubdate` >= $today_start AND `state` = 1) today, (SELECT SUM(`pt_charge`) FROM `#@__pay_log` WHERE `pubdate` >= $yesterday_start AND `pubdate` < $today_start AND `state` = 1) yesterday FROM `#@__pay_log` WHERE `state` = 1");
        $_ret = $dsql->dsqlOper($_sql, "results");
        if($_ret){
            $totalCharge = $_ret[0]['total'];
            $todayCharge = $_ret[0]['today'];
            $yesterdayCharge = $_ret[0]['yesterday'];
        }

        $realtimedata['totalIncome'] = floatval(sprintf("%.2f", $ret[0]['total'] - $totalCharge));
        $realtimedata['todayIncome'] = floatval(sprintf("%.2f", $ret[0]['today'] - $todayCharge));
        $realtimedata['yesterdayIncome'] = floatval(sprintf("%.2f", $ret[0]['yesterday'] - $yesterdayCharge));
    }
    
    //总注册人数，在线总人数，今日注册人数
    $sql = $dsql->SetQuery("SELECT count(`id`) total, (SELECT count(`id`) FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND $time - `online` <= 300) online, (SELECT count(`id`) FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2) AND `regtime` >= $today_start) today FROM `#@__member` WHERE (`mtype` = 1 OR `mtype` = 2)");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $realtimedata['totalMember'] = (int)$ret[0]['total'];
        $realtimedata['onlineMember'] = (int)$ret[0]['online'];
        $realtimedata['todayMember'] = (int)$ret[0]['today'];
    }

    //商家总数，今日新增，昨日新增
    $sql = $dsql->SetQuery("SELECT count(`id`) total, (SELECT count(`id`) FROM `#@__business_list` WHERE `pubdate` >= $today_start AND `state` != 3 AND `state` != 4 ".$cityidFilter.") today, (SELECT count(`id`) FROM `#@__business_list` WHERE `pubdate` >= $yesterday_start AND `pubdate` < $today_start AND `state` != 3 AND `state` != 4 ".$cityidFilter.") yesterday FROM `#@__business_list` WHERE `state` != 3 AND `state` != 4 ".$cityidFilter."");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $realtimedata['totalBusiness'] = (int)$ret[0]['total'];
        $realtimedata['todayBusiness'] = (int)$ret[0]['today'];
        $realtimedata['yesterdayBusiness'] = (int)$ret[0]['yesterday'];
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
    $realtimedata['promotion'] = floatval(sprintf("%.2f", $info3[0] - $info2[0]));

    //分销商总数，今日新增，昨日新增
    $sql = $dsql->SetQuery("SELECT count(f.`id`) total, (SELECT count(f.`id`) FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE m.`id` != '' AND f.`pubdate` >= $today_start) today, (SELECT count(f.`id`) FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE m.`id` != '' AND f.`pubdate` >= $yesterday_start AND `pubdate` < $today_start) yesterday FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE m.`id` != ''");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $realtimedata['totalFenxiao'] = (int)$ret[0]['total'];
        $realtimedata['todayFenxiao'] = (int)$ret[0]['today'];
        $realtimedata['yesterdayFenxiao'] = (int)$ret[0]['yesterday'];
    }

    $return = array(
        'state' => '100',
        'info' => $realtimedata
    );
    echo json_encode($return);die;
}
//平台收益
elseif($dopost == "getPlatformRevenueData"){

    $_type = '';

    //周
    if($type == 'week'){
        $_type = '-6 day';
    }
    //月
    elseif($type == 'month'){
        $_type = '-1 month';
        
    }
    //年
    elseif($type == 'year'){
        $_type = '-1 year';
        
    }
    //自定义时间
    else{
        

    }

    $starttime = $start ? strtotime($start) : strtotime(date("Y-m-d", strtotime($_type)));

    if($type == 'month'){
        $starttime += 86400;
    }

    $endtime   = $end ? strtotime($end) : strtotime(date('Y-m-d'));
    $weekArr   = array("日","一","二","三","四","五","六");

    $coutinfo  = array();

    $startDate = $endDate = 0;

    //按月
    if($type == 'year'){

        $currentTime = time();
        $cyear = floor(date("Y", $currentTime));
        $cMonth = floor(date("m", $currentTime));

        for ($i = 0; $i < 12; $i++) {

            $nMonth = $cMonth - $i;
            $cyear = $nMonth == 0 ? ($cyear-1) : $cyear;
            $nMonth = $nMonth <= 0 ? 12+$nMonth : $nMonth;

            $time1 = GetMkTime($cyear . '-' . $nMonth);
            $time2 = strtotime(date('Y-m-d', $time1) . '+1 month');

            if($i == 0){
                $endDate = date('Y年m月', $time1);
            }
            if($i == 11){
                $startDate = date('Y年m月', $time1);
            }

            //总收入
            $sql = $dsql->SetQuery("SELECT SUM(`platform`) AS platform FROM `#@__member_money` WHERE `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");

            $_date = date('Y-m-d', $time1);

            //统计手续费信息
            $charge = 0;
            $_sql = $dsql->SetQuery("SELECT SUM(`pt_charge`) as charge FROM `#@__pay_log` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2");
            $_ret = $dsql->dsqlOper($_sql, "results");
            if($_ret){
                $charge = $_ret[0]['charge'];
            }

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('d', strtotime($_date)) . '日';
                
            }
            //年
            elseif($type == 'year'){
                $_date = date('m', strtotime($_date)) . '月';
                
            }

            $coutinfo[$_date]  = sprintf("%.2f", $ret[0]['platform'] - $charge);
        }

    }
    //按日
    else{

        if($type && $type != 'month'){
            $startDate = date('Y年m月d日', strtotime(date('Y-m-d', $starttime) . '+1 day'));
        }else{
            $startDate = date('Y年m月d日', $starttime);
        }
        $endDate = date('Y年m月d日', $endtime);

        for ($start = $endtime; $start >= $starttime; $start -= 24 * 3600) {
            $time1 = $start;
            $time2 = $start + 86400;
            //总收入
            $sql = $dsql->SetQuery("SELECT SUM(`platform`) AS platform FROM `#@__member_money` WHERE `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");

            $_date = date('Y-m-d', $time1);

            //统计手续费信息
            $charge = 0;
            $_sql = $dsql->SetQuery("SELECT SUM(`pt_charge`) as charge FROM `#@__pay_log` WHERE `state` = 1 AND `pubdate` >= $time1 AND `pubdate` < $time2");
            $_ret = $dsql->dsqlOper($_sql, "results");
            if($_ret){
                $charge = $_ret[0]['charge'];
            }

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('d', strtotime($_date)) . '日';
                
            }
            //年
            elseif($type == 'year'){
                $_date = '-1 year';
                
            }

            $coutinfo[$_date]  = sprintf("%.2f", $ret[0]['platform'] - $charge);
        }
    }

    $totalAmount = 0;
    $xAxis = $series = array();
    foreach ($coutinfo as $k => $v) {
        $totalAmount += sprintf("%.2f", $v);
        array_push($xAxis, $k);
        array_push($series, $v);
    }
    $return = array(
        'state' => '100',
        'info'  => array(
            'totalAmount' => floatval(sprintf("%.2f", $totalAmount)),
            'startDate'   => $startDate,
            'endDate'     => $endDate,
            'xAxis'       => array_reverse($xAxis),
            'series'      => array_reverse($series)
        )
    );
    echo json_encode($return);die;

}
//入账统计（入账金额 = 充值+佣金+加盟入驻/套餐+保障金），后续如有其他项目，再增加
elseif($dopost == "platformEntry"){

    //今日
    if($type == 'today'){
        $starttime = GetMkTime(date("Y-m-d"));
    }
    //本月
    elseif($type == 'month'){
        $starttime = GetMkTime(date("Y-m") . '-1');
    }
    //今年
    elseif($type == 'year'){
        $starttime = GetMkTime(date("Y") . '-1-1');
    }
    
    $endtime = time(); //当前时间

    //获取数据
    $platformEntry = platformEntry($starttime, $endtime);
    $totalAmount = $platformEntry['totalAmount'];
    $recharge = $platformEntry['recharge'];
    $platformCommission = $platformEntry['platformCommission'];
    $joinCommission = $platformEntry['joinCommission'];
    $promotion = $platformEntry['promotion'];

    //获取支付方式支付金额
    $paymentProportion = array();
    $totalProportion = 0;
    $sql = $dsql->SetQuery("SELECT `pay_code`, `pay_name` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC LIMIT 2");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $val){
            
            $pay_code = $val['pay_code'];
            $pay_name = $val['pay_name'];

            //查询pay_log
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__pay_log` WHERE `paytype` = '$pay_code' AND `state` = 1 AND `pubdate` >= $starttime AND `pubdate` <= $endtime");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $amount = floatval(sprintf("%.2f", $ret[0]['amount']));
                $proportion = $amount > 0 ? ($amount > $totalAmount ? 100 : floatval(sprintf("%.1f", ($amount / $totalAmount) * 100))) : 0;

                $totalProportion += $proportion;

                array_push($paymentProportion, array(
                    'name' => $pay_name,
                    'proportion' => $proportion,
                    'amount' => $amount
                ));
            }

        }
    }

    array_push($paymentProportion, array(
        'name' => '其他',
        'proportion' => $totalAmount > 0 ? floatval(sprintf("%.1f", 100 - $totalProportion)) : 0
    ));

    array_multisort(array_column($paymentProportion, 'proportion'), SORT_ASC, $paymentProportion);

    $return = array(
        'state' => '100',
        'info'  => array(
            'totalAmount'        => $totalAmount,
            'recharge'           => $recharge,
            'platformCommission' => $platformCommission,
            'joinCommission'     => $joinCommission,
            'promotion'          => $promotion,
            'paymentProportion'  => $paymentProportion
        )
    );
    echo json_encode($return);die;

}
//出账统计（出账金额 = 提现+分站分佣+分销商分佣），后续如有其他项目，再增加
elseif($dopost == "platformOutgoing"){

    //今日
    if($type == 'today'){
        $starttime = GetMkTime(date("Y-m-d"));
    }
    //本月
    elseif($type == 'month'){
        $starttime = GetMkTime(date("Y-m") . '-1');
    }
    //今年
    elseif($type == 'year'){
        $starttime = GetMkTime(date("Y") . '-1-1');
    }
    
    $endtime = time(); //当前时间

    //获取入账数据
    $platformEntry = platformEntry($starttime, $endtime);
    $totalEntryAmount = $platformEntry['totalAmount'];

    //获取出账数据
    $platformOutgoing = platformOutgoing($starttime, $endtime);
    $totalAmount = $platformOutgoing['totalAmount'];
    $withdraw = $platformOutgoing['withdraw'];
    $substation = $platformOutgoing['substation'];
    $fenxiao = $platformOutgoing['fenxiao'];

    //出入账比例
    $_totalAmount = $totalAmount + $totalEntryAmount;
    $entryProportion = $totalEntryAmount > 0 ? ($totalEntryAmount > $_totalAmount ? 100 : floatval(sprintf("%.1f", ($totalEntryAmount / $_totalAmount) * 100))) : 0;
    $proportion = array(
        'entry' => $entryProportion,
        'outgoing' => $totalAmount > 0 ? floatval(sprintf("%.1f", 100 - $entryProportion)) : 0
    );
    
    $return = array(
        'state' => '100',
        'info'  => array(
            'totalEntryAmount' => $totalEntryAmount,
            'totalAmount'      => $totalAmount,
            'withdraw'         => $withdraw,
            'substation'       => $substation,
            'fenxiao'          => $fenxiao,
            'proportion'       => $proportion
        )
    );
    echo json_encode($return);die;

}
//收支数据
elseif($dopost == "getExpensesReceipts"){

    $_type = '';

    //周
    if($type == 'week'){
        $_type = '-6 day';
    }
    //月
    elseif($type == 'month'){
        $_type = '-5 month';
    }

    $starttime = strtotime(date("Y-m-d", strtotime($_type)));
    $endtime   = strtotime(date('Y-m-d'));
    $weekArr   = array("日","一","二","三","四","五","六");

    $coutinfo  = array();

    //按月
    if($type == 'month'){

        $currentTime = time();
        $cyear = floor(date("Y", $currentTime));
        $cMonth = floor(date("m", $currentTime));

        for ($i = 0; $i < 6; $i++) {

            $nMonth = $cMonth - $i;
            $cyear = $nMonth == 0 ? ($cyear-1) : $cyear;
            $nMonth = $nMonth <= 0 ? 12+$nMonth : $nMonth;

            $time1 = GetMkTime($cyear . '-' . $nMonth);
            $time2 = strtotime(date('Y-m-d', $time1) . '+1 month');

            //获取入账数据
            $platformEntry = platformEntry($time1, $time2);
            $totalEntryAmount = $platformEntry['totalAmount'];

            //获取出账数据
            $platformOutgoing = platformOutgoing($time1, $time2);
            $withdraw = $platformOutgoing['withdraw'];
            $substation = $platformOutgoing['substation'];
            $fenxiao = $platformOutgoing['fenxiao'];

            $_date = date('Y-m-d', $time1);

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('m', strtotime($_date)) . '月';
            }

            $coutinfo[$_date]  = array(
                'totalEntryAmount' => $totalEntryAmount,
                'withdraw' => $withdraw,
                'substation' => $substation,
                'fenxiao' => $fenxiao
            );
        }

    }
    //按日
    else{

        for ($start = $endtime; $start >= $starttime; $start -= 24 * 3600) {
            $time1 = $start;
            $time2 = $start + 86400;
            
            //获取入账数据
            $platformEntry = platformEntry($time1, $time2);
            $totalEntryAmount = $platformEntry['totalAmount'];

            //获取出账数据
            $platformOutgoing = platformOutgoing($time1, $time2);
            $withdraw = $platformOutgoing['withdraw'];
            $substation = $platformOutgoing['substation'];
            $fenxiao = $platformOutgoing['fenxiao'];

            $_date = date('Y-m-d', $time1);

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('m', strtotime($_date)) . '月';
            }

            $coutinfo[$_date]  = array(
                'totalEntryAmount' => $totalEntryAmount,
                'withdraw' => $withdraw,
                'substation' => $substation,
                'fenxiao' => $fenxiao
            );
        }
    }

    $xAxis = $series = array();
    foreach ($coutinfo as $k => $v) {
        array_push($xAxis, $k);
    }

    //入账
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, $v['totalEntryAmount']);
    }
    array_push($series, array(
        "name" => "入账",
        "type" => "bar",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    //提现
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, $v['withdraw']);
    }
    array_push($series, array(
        "name" => "提现",
        "type" => "bar",
        "stack" => "out",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    //分站分佣
    if($siteCityCount > 1){
        $itemData = array();
        foreach ($coutinfo as $k => $v) {
            array_push($itemData, $v['substation']);
        }
        array_push($series, array(
            "name" => "城市分佣",
            "type" => "bar",
            "stack" => "out",
            "barWidth" => 10,
            "data" => array_reverse($itemData)
        ));
    }

    //分销商分佣
    global $cfg_fenxiaoState;
    if($cfg_fenxiaoState == 1){
        $itemData = array();
        foreach ($coutinfo as $k => $v) {
            array_push($itemData, $v['fenxiao']);
        }
        array_push($series, array(
            "name" => "分销",
            "type" => "bar",
            "stack" => "out",
            "barWidth" => 10,
            "data" => array_reverse($itemData)
        ));
    }

    $return = array(
        'state' => '100',
        'info'  => array(
            'xAxis'  => array_reverse($xAxis),
            'series' => $series
        )
    );
    echo json_encode($return);die;

}
//充值与提现
elseif($dopost == "getRechargeWithdraw"){

    $_type = '';

    //周
    if($type == 'week'){
        $_type = '-6 day';
    }
    //月
    elseif($type == 'month'){
        $_type = '-5 month';
    }

    $starttime = strtotime(date("Y-m-d", strtotime($_type)));
    $endtime   = strtotime(date('Y-m-d'));
    $weekArr   = array("日","一","二","三","四","五","六");

    $coutinfo  = array();

    //按月
    if($type == 'month'){

        $currentTime = time();
        $cyear = floor(date("Y", $currentTime));
        $cMonth = floor(date("m", $currentTime));

        for ($i = 0; $i < 6; $i++) {

            $nMonth = $cMonth - $i;
            $cyear = $nMonth == 0 ? ($cyear-1) : $cyear;
            $nMonth = $nMonth <= 0 ? 12+$nMonth : $nMonth;

            $time1 = GetMkTime($cyear . '-' . $nMonth);
            $time2 = strtotime(date('Y-m-d', $time1) . '+1 month');

            //统计余额充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_money` WHERE `type` = 1 AND `montype` = 1 AND `showtype` = 0 AND `ctype` = 'chongzhi' AND `title` = '账户充值' AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $money = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计积分充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_point` WHERE `type` = 1 AND `ctype` = 'duihuan' AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $point = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计购物卡/消费金充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_bonus` WHERE `type` = 1 AND `montype` = 1 AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $bonus = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计提现数据
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_withdraw` WHERE `state` = 1 AND `rdate` >= $time1 AND `rdate` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $withdraw = floatval(sprintf("%.2f", $ret[0]['amount']));

            $_date = date('Y-m-d', $time1);

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('m', strtotime($_date)) . '月';
            }

            $coutinfo[$_date]  = array(
                'money' => $money,
                'point' => $point,
                'bonus' => $bonus,
                'withdraw' => $withdraw
            );
        }

    }
    //按日
    else{

        for ($start = $endtime; $start >= $starttime; $start -= 24 * 3600) {
            $time1 = $start;
            $time2 = $start + 86400;
            
            //统计余额充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_money` WHERE `type` = 1 AND `montype` = 1 AND `showtype` = 0 AND `ctype` = 'chongzhi' AND `title` = '账户充值' AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $money = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计积分充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_point` WHERE `type` = 1 AND `ctype` = 'duihuan' AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $point = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计购物卡/消费金充值
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_bonus` WHERE `type` = 1 AND `montype` = 1 AND `date` >= $time1 AND `date` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $bonus = floatval(sprintf("%.2f", $ret[0]['amount']));

            //统计提现数据
            $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_withdraw` WHERE `state` = 1 AND `rdate` >= $time1 AND `rdate` < $time2");
            $ret = $dsql->dsqlOper($sql, "results");
            $withdraw = floatval(sprintf("%.2f", $ret[0]['amount']));

            $_date = date('Y-m-d', $time1);

            //周
            if($type == 'week'){
                $_date = '周' . $weekArr[date("w", strtotime($_date))] . date('m-d', strtotime($_date));
            }
            //月
            elseif($type == 'month'){
                $_date = date('m', strtotime($_date)) . '月';
            }

            $coutinfo[$_date]  = array(
                'money' => $money,
                'point' => $point,
                'bonus' => $bonus,
                'withdraw' => $withdraw
            );
        }
    }

    $xAxis = $series = array();
    foreach ($coutinfo as $k => $v) {
        array_push($xAxis, $k);
    }

    //余额
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, $v['money']);
    }
    array_push($series, array(
        "name" => "余额",
        "type" => "bar",
        "stack" => "in",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    //积分
    global $cfg_pointName;
    global $cfg_pointRatio;
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, floatval(sprintf("%.2f", $v['point'] / $cfg_pointRatio)));
    }
    array_push($series, array(
        "name" => $cfg_pointName,
        "type" => "bar",
        "stack" => "in",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    //购物卡/消费金
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, $v['bonus']);
    }
    array_push($series, array(
        "name" => $payname,
        "type" => "bar",
        "stack" => "in",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    //提现
    $itemData = array();
    foreach ($coutinfo as $k => $v) {
        array_push($itemData, $v['withdraw']);
    }
    array_push($series, array(
        "name" => "提现",
        "type" => "bar",
        "barWidth" => 10,
        "data" => array_reverse($itemData)
    ));

    $return = array(
        'state' => '100',
        'info'  => array(
            'xAxis'  => array_reverse($xAxis),
            'series' => $series
        )
    );
    echo json_encode($return);die;


}
//获取数据库尺寸
elseif($dopost == "getMysqlSize"){

    $connection = @mysqli_connect($GLOBALS['DB_HOST'], $GLOBALS['DB_USER'], $GLOBALS['DB_PASS']);
    if($connection === false){
        echo '{"state": 200, "mysqlSize": "无法连接数据库！' . mysqli_connect_error() . '"}';
        die;
    }
    $serverset = 'character_set_connection=utf8, character_set_results=utf8, character_set_client=binary';
    $serverset .= @mysqli_get_server_info($connection) > '5.0.1' ? ', sql_mode=\'\'' : '';
    @mysqli_query($connection, "SET $serverset");
    if(!@mysqli_select_db($connection, $GLOBALS['DB_NAME'])){
        @mysqli_close($connection);
        echo '{"state": 200, "mysqlSize": "无法使用数据库！"}';
        die;
    }

    $dbsize = 0;
    $tables = $dsql->query($connection, "show table status");
    foreach($tables as $table) {
        $dbsize += $table['Data_length'] + $table['Index_length'];
    }
    $dbsize = $dbsize ? _sizecount($dbsize) : '未知';

    echo '{"state": 100, "mysqlSize": "'.$dbsize.'"}';
    die;

}
//获取最新版本
elseif($dopost == "checkUpdate"){

    $ret = checkSystemUpdate();
    if($ret){
        die(json_encode($ret));
    }
    die;

}
//获取消息通知
elseif($dopost == "getAdminNotice"){

    $noticeArr = array();

    //提现
    if(testPurview('withdraw')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member_withdraw` WHERE `state` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "finance",
                "name"   => "提现申请",
                "id"     => "withdrawphp",
                "url"    => "member/withdraw.php",
                "count"  => $count,
                "group"  => "0member"
            ));
        }
    }

    //提取保障金
    if(testPurview('bondLog')){
        $sql = $dsql->SetQuery("SELECT count(p.`id`) as c FROM `#@__member_promotion` p LEFT JOIN `#@__member` m ON m.`id` = p.`uid` WHERE p.`type` = 0 AND p.`state` = 0" . getCityFilter('m.`cityid`'));
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "finance",
                "name"   => "提取保障金",
                "id"     => "bondLogphp",
                "url"    => "member/bondLog.php",
                "count"  => $count,
                "group"  => "0member"
            ));
        }
    }


    //认证
    if(testPurview('memberEdit')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member` WHERE `certifyState` = 3" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "member",
                "name"   => "个人认证",
                "id"     => "memberListphp",
                "url"    => "member/memberList.php",
                "count"  => $count,
                "openid"  => $openid,
                "group"  => "0member"
            ));
        }

        
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member` WHERE `licenseState` = 3" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "member",
                "name"   => "公司认证",
                "id"     => "memberListphp",
                "url"    => "member/memberList.php",
                "count"  => $count,
                "openid"  => $openid,
                "group"  => "0member"
            ));
        }
    }

    //注销
    if(testPurview('memberEdit')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member` WHERE `is_cancellation` = 1" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "member",
                "name"   => "会员注销",
                "id"     => "memberListphp",
                "url"    => "member/memberList.php",
                "count"  => $count,
                "openid"  => $openid,
                "group"  => "0member"
            ));
        }
    }

    //昵称审核
    if(testPurview('memberEdit')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member` WHERE `nickname_audit` != ''" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "member",
                "name"   => "昵称审核",
                "id"     => "memberListphp",
                "url"    => "member/memberList.php",
                "count"  => $count,
                "openid"  => $openid,
                "group"  => "0member"
            ));
        }
    }

    //头像审核
    if(testPurview('memberEdit')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member` WHERE `photo_audit` != ''" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "member",
                "name"   => "头像审核",
                "id"     => "memberListphp",
                "url"    => "member/memberList.php",
                "count"  => $count,
                "openid"  => $openid,
                "group"  => "0member"
            ));
        }
    }

    //商家店铺
    if(testPurview('businessList')){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__business_list` WHERE `state` = 0" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "business",
                "name"   => "商家店铺",
                "id"     => "businessListphp",
                "url"    => "business/businessList.php",
                "count"  => $count,
                "group"  => "0member"
            ));
        }
    }


    //查询所有可用模块
    $sql = $dsql->SetQuery("SELECT `name`,`title` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        foreach ($result as $key => $value) {

            $name  = $value['name'];
            $title = $value['title'];

            /*评论查询*/
            if ($name!='' && $name != 'waimai' && testPurview($name . 'Common')){
                $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__public_comment_all` WHERE `ischeck` = 0 AND `type` like '$name%'");
                if ($name == 'tuan') {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__public_comment_all` WHERE `ischeck` = 0 AND `type` like 'tuan-order%'");
                }else if ($name == 'info') {
                    

                }else if ($name == 'video') {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__public_comment_all` WHERE `ischeck` = 0 AND `type` like 'video-%'");
                }else if($name == 'house'){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__housecommon` WHERE `ischeck` = 0 AND `replydate` = 0");
                    $title = '学校';
                }else if($name == 'travel'){
                        /*视频管理*/
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__public_comment_all` WHERE 1 = 1 AND `ischeck` = 0");
                        $where0 = " AND `type` = 'travel-video'";
                        $state0 = $dsql->dsqlOper($sql.$where0, "results");
                        if(is_numeric($state0[0]['c']) && $state0[0]['c'] > 0){
                            $url   = "travel/travelCommon.php";
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "旅游视频评论",
                                "id"     => 'travelCommonphp',
                                "url"    => $url,
                                "count"  => $state0[0]['c'],
                                "group"  => "4comment"
                            ));
                        }
                        /*景点门票评论*/
                        $where2 = " AND `type` = 'travel-ticket'";
                        $state2 = $dsql->dsqlOper($sql.$where2, "results");
                        if(is_numeric($state2[0]['c']) && $state2[0]['c'] > 0){
                            $url   = "travel/travelCommon.php?typeid=2";
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "景点门票评论",
                                "id"     => 'travelCommonphptypeid2',
                                "url"    => $url,
                                "count"  => $state2[0]['c'],
                                "group"  => "4comment"
                            ));
                        }
                        $where1 = " AND `type` = 'travel-strategy'";
                        $state1 = $dsql->dsqlOper($sql.$where1, "results");
                        if(is_numeric($state1[0]['c']) && $state1[0]['c'] > 0){
                            $url   = "travel/travelCommon.php?typeid=1";
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "旅游攻略评论",
                                "id"     => 'travelCommonphptypeid1',
                                "url"    => $url,
                                "count"  => $state1[0]['c'],
                                "group"  => "4comment"
                            ));
                        }
                        $where3 = " AND `type` = 'travel-agency'";
                        $state3 = $dsql->dsqlOper($sql.$where3, "results");
                        if(is_numeric($state3[0]['c']) && $state3[0]['c'] > 0){
                            $url   = "travel/travelCommon.php?typeid=3";
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "周边游评论",
                                "id"     => 'travelCommonphptypeid3',
                                "url"    => $url,
                                "count"  => $state3[0]['c'],
                                "group"  => "4comment"
                            ));
                        }
                        $where4 = " AND `type` = 'travel-visa'";
                        $state4 = $dsql->dsqlOper($sql.$where4, "results");
                        if(is_numeric($state4[0]['c']) && $state4[0]['c'] > 0){
                            $url   = "travel/travelCommon.php?typeid=4";
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "签证评论",
                                "id"     => 'travelCommonphptypeid4',
                                "url"    => $url,
                                "count"  => $state4[0]['c'],
                                "group"  => "4comment"
                            ));
                        }
                }elseif($name == 'marry'){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__public_comment_all` WHERE 1 = 1 AND `ischeck` = 0");
                    $where0 = " AND `type` = 'marry-store'";
                    $state0 = $dsql->dsqlOper($sql.$where0, "results");
                    if(is_numeric($state0[0]['c']) && $state0[0]['c'] > 0){
                        $url   = "marry/marryStoreCommon.php";
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "婚嫁店铺评论",
                            "id"     => 'travelCommonphp',
                            "url"    => $url,
                            "count"  => $state0[0]['c'],
                            "group"  => "4comment"
                        ));
                    }

                    $where1 = " AND `type` = 'marry-rental'";
                    $state1 = $dsql->dsqlOper($sql.$where1, "results");
                    if(is_numeric($state0[0]['c']) && $state0[0]['c'] > 0){
                        $url   = "marry/marryStoreCommon.php?typeid=1";
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "婚车评论",
                            "id"     => 'travelCommonphptypeid1',
                            "url"    => $url,
                            "count"  => $state1[0]['c'],
                            "group"  => "4comment"
                        ));
                    }
                }
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                $url   = $name."/".$name."Common.php";
                if($name != 'travel' && $name != 'marry'){
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => $title."评论",
                            "id"     => '',
                            "url"    => $url,
                            "count"  => $count,
                            "group"  => "4comment"
                        ));
                    }
                }
            }

            //新闻资讯
            if($name == "article"){

                if(testPurview('editarticle')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__articlelist_all` WHERE `del` = 0 AND `arcrank` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "article",
                            "name"   => $title,
                            "id"     => "articleListphpactionarticle",
                            "url"    => "article/articleList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                if(testPurview('editselfmedia')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__article_selfmedia` WHERE (`state` = 0 || (`state` != 0 &&`editstate` = 0) )" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "article",
                            "name"   => "自媒体",
                            "id"     => "selfmediaListphpactionjoin",
                            "url"    => "article/selfmediaList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //分类信息
            }elseif($name == "info" && testPurview('editInfo')){
                $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__infolist` WHERE `arcrank` = 0 AND `waitpay` = 0 AND `del` = 0" . $cityidFilter);
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                if(is_numeric($count) && ($count > 0 || $show0)){
                    array_push($noticeArr, array(
                        "module" => $name,
                        "name"   => $title,
                        "id"     => "infoListphp",
                        "url"    => "info/infoList.php",
                        "count"  => $count,
                        "group"  => "3fabu"
                    ));
                }

                //团购秒杀
            }elseif($name == "tuan"){

                //商家审核
                if(testPurview('tuanStore')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__tuan_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "团购商家",
                            "id"     => "tuanStorephp",
                            "url"    => "tuan/tuanStore.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //团购审核
                if(testPurview('editTuan')){
                    $sql = $dsql->SetQuery("SELECT count(l.`id`) as c FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE l.`arcrank` = 0" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "团购商品",
                            "id"     => "tuanListphp",
                            "url"    => "tuan/tuanList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //房产
            }elseif($name == "house"){

                //信息订阅
                // $sql = $dsql->SetQuery("SELECT count(n.`id`) as c FROM `#@__house_notice` n LEFT JOIN `#@__house_loupan` l ON l.`id` = n.`aid` WHERE n.`state` = 0" . getCityFilter('l.`cityid`'));
                // $ret = $dsql->dsqlOper($sql, "results");
                // $count = $ret[0]['c'];
                // if(is_numeric($count) && ($count > 0 || $show0)){
                //     array_push($noticeArr, array(
                //         "module" => $name,
                //         "name"   => "信息订阅",
                //         "id"     => "houseNoticephpactionloupan",
                //         "url"    => "house/houseNotice.php?action=loupan",
                //         "count"  => $count,
                //         "group"  => "3fabu"
                //     ));
                // }

                //楼盘团购
                $sql = $dsql->SetQuery("SELECT count(n.`id`) as c FROM `#@__house_loupantuan` n LEFT JOIN `#@__house_loupan` l ON l.`id` = n.`aid` WHERE n.`state` = 0" . getCityFilter('l.`cityid`'));
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                if(is_numeric($count) && ($count > 0 || $show0)){
                    array_push($noticeArr, array(
                        "module" => $name,
                        "name"   => "楼盘团购",
                        "id"     => "houseTuanphp",
                        "url"    => "house/houseTuan.php",
                        "count"  => $count,
                        "group"  => "3fabu"
                    ));
                }

                //中介公司
                if(testPurview('zjComEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_zjcom` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "房产中介",
                            "id"     => "zjComListphp",
                            "url"    => "house/zjComList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                // 经纪人
                if(testPurview('zjUserEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_zjuser` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "经纪人",
                            "id"     => "zjUserListphp",
                            "url"    => "house/zjUserList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //二手房
                if(testPurview('houseSaleEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_sale` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "二手房",
                            "id"     => "houseSalephp",
                            "url"    => "house/houseSale.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //出租房
                if(testPurview('houseZuEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_zu` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "出租房",
                            "id"     => "houseZuphp",
                            "url"    => "house/houseZu.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //写字楼
                if(testPurview('houseXzlEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_xzl` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "写字楼",
                            "id"     => "houseXzlphp",
                            "url"    => "house/houseXzl.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //商铺
                if(testPurview('houseSpEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_sp` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商铺",
                            "id"     => "houseSpphp",
                            "url"    => "house/houseSp.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //厂房仓库
                if(testPurview('houseCfEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_cf` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "厂房仓库",
                            "id"     => "houseCfphp",
                            "url"    => "house/houseCf.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //车位
                if(testPurview('houseCwEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_cw` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "车位",
                            "id"     => "houseCwphp",
                            "url"    => "house/houseCw.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //求租求购
                if(testPurview('houseDemand')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__housedemand` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "求租求购",
                            "id"     => "houseDemandphp",
                            "url"    => "house/houseDemand.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                /*楼盘合作*/
                if(testPurview('houseCooperation')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__house_coop` WHERE `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "楼盘合作",
                            "id"     => "houseCooperation",
                            "url"    => "house/houseCooperation.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //商城
            }elseif($name == "shop"){

                //店铺审核
                if(testPurview('shopStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__shop_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城店铺",
                            "id"     => "shopStoreListphp",
                            "url"    => "shop/shopStoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //订单管理
                if(testPurview('shopOrder')){
                    $sql = $dsql->SetQuery("SELECT count(o.`id`) c FROM `#@__shop_order` o  LEFT JOIN  `#@__shop_store` e ON o.`store` = e.`id` WHERE 1 = 1 ".$cityidFilter." AND o.`orderstate` = 1 AND o.`protype` = 0  AND 1 = (CASE	WHEN  o.`pinid` != 0 THEN CASE WHEN o.`pinstate` THEN 1 ELSE 0 END ELSE 1=1 END )");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城订单",
                            "id"     => "shopOrderphp",
                            "url"    => "shop/shopOrder.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }
                }

                //分店审核
                if(testPurview('shopBranchStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(b.`id`) as c FROM `#@__shop_branch_store` b LEFT JOIN `#@__shop_store` s ON s.`id` = b.`branchid` WHERE b.`state` = 0 AND s.`id` != ''" . getCityFilter('b.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城分店",
                            "id"     => "shopBranchStorephp",
                            "url"    => "shop/shopBranchStore.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //商品审核
                if(testPurview('productEdit')){
                    $sql = $dsql->SetQuery("SELECT count(l.`id`) as c FROM `#@__shop_product` l LEFT JOIN `#@__shop_store` s ON s.`id` = l.`store` WHERE l.`state` = 0" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城商品",
                            "id"     => "productListphp",
                            "url"    => "shop/productList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                /*活动审核通知*/
                if(testPurview('huodongProductList')){
                    $sql = $dsql->SetQuery("SELECT count(l.`id`) as c FROM `#@__shop_huodongsign` b LEFT JOIN `#@__shop_product` l ON b.`proid` = l.`id` LEFT JOIN `#@__shop_store` s ON s.`id` = l.`store` WHERE b.`state` = 0" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城活动",
                            "id"     => "huodongProductList",
                            "url"    => "shop/huodongProductList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                /*商城配送审核*/
                if(testPurview('shopStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__shop_store` WHERE `psaudit` = 1" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "商城配送审核",
                            "id"     => "shopStoreListphp",
                            "url"    => "shop/shopStoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                /*平台介入订单*/
                if(testPurview('shopKeFuOrder')){
                    $sql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__shop_order_product` o LEFT JOIN `#@__shop_order` l ON o.`orderid` = l.`id` LEFT JOIN `#@__shop_store` store ON store.`id` = l.`store` WHERE o.`user_refundtype` = 2 AND o.`ret_ptaudittype` = 0 AND l.`orderstate` = 6" . getCityFilter('store.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "平台介入订单",
                            "id"     => "shopKeFuOrderphp",
                            "url"    => "shop/shopKeFuOrder.php",
                            "count"  => $count,
                            "group"  => "2order",
                            "danger"  => 1
                        ));
                    }
                }


                //装修公司
            }elseif($name == "renovation"){
                if(testPurview('renovationStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修公司",
                            "id"     => "renovationStorephp",
                            "url"    => "renovation/renovationStore.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                if(testPurview('renovationZhaobiao')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_zhaobiao` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修招标",
                            "id"     => "renovationZhaobiaophp",
                            "url"    => "renovation/renovationZhaobiao.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                if(testPurview('renovationStoreaptitudes')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_storeaptitudes` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修公司资质",
                            "id"     => "renovationStoreaptitudesphp",
                            "url"    => "renovation/renovationStoreaptitudes.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                if(testPurview('renovationConstruction')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_construction` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修工地",
                            "id"     => "renovationConstructionphp",
                            "url"    => "renovation/renovationConstruction.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                if(testPurview('renovationTeam')){

                    $houseid = array();
                    $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$cityidFilter);
                    $loupanResult = $dsql->dsqlOper($loupanSql, "results");
                    if($loupanResult){
                        foreach($loupanResult as $key => $loupan){
                            array_push($houseid, $loupan['id']);
                        }
                        $_where = " AND `company` in (".join(",", $houseid).")";
                    }else{
                        $_where = ' AND 1 = 2';
                    }

                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_team` WHERE `state` = 0" . $_where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "设计师",
                            "id"     => "renovationTeamphp",
                            "url"    => "renovation/renovationTeam.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }

                }

                if(testPurview('renovationForeman')){

                    $houseid = array();
                    $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1 = 1 ".$cityidFilter);
                    $loupanResult = $dsql->dsqlOper($loupanSql, "results");
                    if($loupanResult){
                        foreach($loupanResult as $key => $loupan){
                            array_push($houseid, $loupan['id']);
                        }
                        $where .= " AND `company` in (".join(",", $houseid).")";
                    }else{
                        $where .= " AND 1 = 2";
                    }

                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_foreman` WHERE `state` = 0" . $where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "工长",
                            "id"     => "renovationForemanphp",
                            "url"    => "renovation/renovationForeman.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }

                }

                if(testPurview('renovationCase')){

                    $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$cityidFilter);
                    $storeResult = $dsql->dsqlOper($storeSql, "results");
                    $_userid = array();
                    if($storeResult){
                        foreach($storeResult as $key => $store){
                            array_push($_userid, $store['id']);
                        }
                        $_where = " AND `company` in (".join(",", $_userid).")";
                    }else{
                        $_where = " AND 1 = 2";
                    }

                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_case` WHERE `state` = 0" . $_where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修效果图",
                            "id"     => "renovationCasephp",
                            "url"    => "renovation/renovationCase.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }


                if(testPurview('renovationDiary')){

                    $houseid = array();
                    $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1 = 1 ".$cityidFilter);
                    $loupanResult = $dsql->dsqlOper($loupanSql, "results");
                    if($loupanResult){
                        foreach($loupanResult as $key => $loupan){
                            array_push($houseid, $loupan['id']);
                        }
                        $_where = " AND `company` in (".join(",", $houseid).")";
                    }else{
                        $_where = " AND 1 = 2";
                    }

                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_diary` WHERE `state` = 0" . $_where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "施工案例",
                            "id"     => "renovationDiaryphp",
                            "url"    => "renovation/renovationDiary.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                if(testPurview('renovationArticlesList')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_article` WHERE `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修动态",
                            "id"     => "renovationArticlesListphp",
                            "url"    => "renovation/renovationArticlesList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                if(testPurview('renovationRese')){
                    $sql = $dsql->SetQuery("SELECT count(r.`id`) as c FROM `#@__renovation_rese` r LEFT JOIN `#@__renovation_store` s ON s.`id` = r.`company` WHERE r.`state` = 0" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "装修预约",
                            "id"     => "renovationResephp",
                            "url"    => "renovation/renovationRese.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                if(testPurview('renovationEntrust')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__renovation_entrust` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "免费设计",
                            "id"     => "renovationEntrustphp",
                            "url"    => "renovation/renovationEntrust.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

                if(testPurview('renovationVisit')){
                    $sql = $dsql->SetQuery("SELECT count(v.`id`) as c FROM `#@__renovation_visit` v LEFT JOIN `#@__renovation_construction` c ON v.`conid` = c.`id` WHERE v.`state` = 0" . getCityFilter('c.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "预约参观",
                            "id"     => "renovationVisitphp",
                            "url"    => "renovation/renovationVisit.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }


                //招聘
            }elseif($name == "job"){

                //公司
                if(testPurview('jobCompanyEdit')) {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__job_company` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if (is_numeric($count) && ($count > 0 || $show0)) {
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name" => "招聘企业",
                            "id" => "jobCompanyphp",
                            "url" => "job/jobCompany.php",
                            "count" => $count,
                            "group"  => "1business"
                        ));
                    }

                    //修改敏感信息
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__job_company` WHERE `changeState` = 1" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if (is_numeric($count) && ($count > 0 || $show0)) {
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name" => "更新敏感信息",
                            "id" => "jobCompanyphp",
                            "url" => "job/jobCompany.php",
                            "count" => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //职位
                if(testPurview('jobPost')) {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__job_post` WHERE `state` = 0 AND (`valid` >= ".time()." OR `valid`=0)" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if (is_numeric($count) && ($count > 0 || $show0)) {
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name" => "招聘职位",
                            "id" => "jobPostphp",
                            "url" => "job/jobPost.php",
                            "count" => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //简历
                if(testPurview('jobResumephp')) {
                    $sql = $dsql->SetQuery("SELECT count(r.`id`) as c FROM `#@__job_resume` r left join `#@__member` m on r.`userid`=m.`id` WHERE r.`need_complete` = 1 AND r.`state` = 0" . getCityFilter('r.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if (is_numeric($count) && ($count > 0 || $show0)) {
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name" => "招聘简历",
                            "id" => "jobResumephp",
                            "url" => "job/jobResume.php",
                            "count" => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //普工求职
                if(testPurview('jobSentencephptype0Edit')) {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__job_qz` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['c'];
                        if (is_numeric($count) && ($count > 0 || $show0)) {
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name" => "普工求职",
                                "id" => "jobSentencephptype0",
                                "url" => "job/jobSentence.php?type=1",
                                "count" => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //普工招聘
                if(testPurview('jobSentencephptype1Edit')) {
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__job_pg` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['c'];
                        if (is_numeric($count) && ($count > 0 || $show0)) {
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name" => "普工招聘",
                                "id" => "jobSentencephptype1",
                                "url" => "job/jobSentence.php?type=0",
                                "count" => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }




                //外卖餐厅
            }elseif($name == "waimai"){

                //配送员未审核
                if(testPurview('waimaiCourier')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__waimai_courier` WHERE `status` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "waimai",
                            "name"   => "配送员",
                            "id"     => "waimaiCourierphp",
                            "url"    => "waimai/waimaiCourier.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }


                if(testPurview("waimaiOrder")){

                    $date = GetMkTime(time());
                    //$sql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 2 AND s.`del` = 0" . getCityFilter('s.`cityid`'));

                    //统计新的外卖订单时，区分普通订单和预定订单，预定订单未到接单时间，即（预定时间-配送时间）时，不参与统计
                    $sql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 2 AND s.`del` = 0 AND (o.`reservesongdate` = 0 OR (o.`reservesongdate` > 0 AND ('$date' > (o.`reservesongdate` - s.`delivery_time`*60))))" . getCityFilter('s.`cityid`'));
                    /*出餐超时*/
                    //$chucansql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE (o.`state` = 3 OR  o.`state` = 4)  AND s.`del` = 0 AND (('$date' - o.`paydate`)/60) > s.`chucan_time`" . getCityFilter('s.`cityid`'));

                    //因为新增了订单预定逻辑，所以计算出餐超时时，需要区分，普通订单，以付款时间为标准计算，预定订单，以预定配送时间为标准计算
                    $chucansql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE (o.`state` = 3 OR  o.`state` = 4)  AND s.`del` = 0 AND ((o.`reservesongdate` = 0 AND (('$date' - o.`paydate`)/60) > s.`chucan_time`) OR (o.`reservesongdate` > 0 AND (('$date' - (o.`reservesongdate` - s.`delivery_time`*60))/60) > s.`chucan_time`))" . getCityFilter('s.`cityid`'));

                    /*配送超时*/
                    $peisongsql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 5 AND s.`del` = 0 AND (('$date' - o.`peidate`)/60) > s.`delivery_time`" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "外卖订单",
                            "id"     => "waimaiOrderphp",
                            "url"    => "waimai/waimaiOrder.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }
                    // 爆单
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__dispatch_warning` WHERE `module` = 'waimai' ORDER BY `id` DESC LIMIT 0, 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $state = $ret[0]['state'];
                        $count = $ret[0]['count'];
                        if($state == 0){
                            array_push($noticeArr, array(
                                "module" => $module,
                                "name"   => "外卖爆单",
                                "id"     => "orderWarning",
                                "url"    => "waimai/waimaiOrder.php",
                                "count"  => $count,
                                "group"  => "2order",
                                "danger"  => 1
                            ));
                        }
                    }
                    /*出餐超时*/
                    $chucanres  = $dsql->dsqlOper($chucansql,"results");

                    $chucancount = $chucanres[0]['c'];
                    if(is_numeric($chucancount) && $chucancount > 0){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "出餐超时",
                            "id"     => "Ordercctimeout",
                            "url"    => "waimai/waimaiOrder.php",
                            "count"  => $chucancount,
                            "group"  => "2order",
                            "danger"  => 1
                        ));
                    }
                    /*配送超时*/
                    $peisongres = $dsql->dsqlOper($peisongsql,"results");

                    $peisongcount = $peisongres[0]['c'];
                    if(is_numeric($peisongcount) && $peisongcount > 0){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "外卖配送超时",
                            "id"     => "Orderpstimeout",
                            "url"    => "waimai/waimaiOrder.php",
                            "count"  => $peisongcount,
                            "group"  => "2order",
                            "danger"  => 1
                        ));
                    }
                }

                if(testPurview("paotuiOrder")){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__paotui_order` WHERE `state` = 3" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "跑腿订单",
                            "id"     => "paotuiOrderphp",
                            "url"    => "waimai/paotuiOrder.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }
                }

                if(testPurview("waimaiCommon")){
                    $shopids = array();
                    $shopSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE 1=1 ".$cityidFilter);
                    $shopResult = $dsql->dsqlOper($shopSql, "results");
                    if($shopResult){
                        foreach($shopResult as $key => $loupan){
                            array_push($shopids, $loupan['id']);
                        }
                        $where = " AND c.`sid` in (".join(",", $shopids).")";
                    }else{
                        $where = " AND 1 = 2";
                    }
                    $sql = $dsql->SetQuery("SELECT c.*, o.`ordernumstore`, s.`shopname` FROM (`#@__waimai_common` c LEFT JOIN `#@__waimai_order_all` o ON c.`oid` = o.`id`) LEFT JOIN `#@__waimai_shop` s ON c.`sid` = s.`id` WHERE c.`replydate` = 0 AND c.`type` = 0".$where);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "外卖店铺评论",
                            "id"     => "waimaiCommonphp",
                            "url"    => "waimai/waimaiCommon.php",
                            "count"  => $count,
                            "group"  => "4comment"
                        ));
                    }
                }

                //外卖商品价格需要审核
                if(testPurview('waimaiShop')){
                    $sql = $dsql->SetQuery("SELECT count(s.`id`) as c FROM `#@__waimai_shop` s WHERE s.`del` = 0 AND EXISTS (SELECT 1 FROM `#@__waimai_list` WHERE `review_price` > 0 AND `sid` = s.`id`)" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "waimai",
                            "name"   => "外卖价格审核",
                            "id"     => "waimaiShopphp",
                            "url"    => "waimai/waimaiShop.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }


                //汽车商家
            }elseif($name == "car"){

                //经销商
                if(testPurview('carStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__car_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "汽车经销商",
                            "id"     => "carStoreListphp",
                            "url"    => "car/carStoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                // 顾问
                if(testPurview('gwUserEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__car_adviser` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "汽车顾问",
                            "id"     => "gwUserListphp",
                            "url"    => "car/gwUserList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //二手车
                if(testPurview('carEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__car_list` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "二手车",
                            "id"     => "carListphp",
                            "url"    => "car/carList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //汽车报废
                if(testPurview('carScrap')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__car_scrap` WHERE `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "汽车报废",
                            "id"     => "carScrapphp",
                            "url"    => "car/carScrap.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //自助建站
            }elseif($name == "website" && testPurview('websiteEdit')){

                $sql = $dsql->SetQuery("SELECT count(w.`id`) as c FROM `#@__website` w LEFT JOIN `#@__member` m ON m.`id` = w.`userid` WHERE w.`state` = 0 AND m.`id` != ''");
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                if(is_numeric($count) && ($count > 0 || $show0)){
                    array_push($noticeArr, array(
                        "module" => $name,
                        "name"   => "自助建站",
                        "id"     => "websitephp",
                        "url"    => "website/website.php",
                        "count"  => $count,
                        "group"  => "3fabu"
                    ));
                }

                //贴吧社区
            }elseif($name == "tieba" && testPurview('tiebaEdit')){
                $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__tieba_list` WHERE `state` = 0 AND `waitpay` = 0 AND `del` = 0" . $cityidFilter);
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                if(is_numeric($count) && ($count > 0 || $show0)){
                    array_push($noticeArr, array(
                        "module" => $name,
                        "name"   => $title,
                        "id"     => "tiebaListphp",
                        "url"    => "tieba/tiebaList.php",
                        "count"  => $count,
                        "group"  => "3fabu"
                    ));
                }

                //活动
            }elseif($name == "huodong" && testPurview('huodongEdit')){
                $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__huodong_list` WHERE `state` = 0 AND `waitpay` = 0" . $cityidFilter);
                $ret = $dsql->dsqlOper($sql, "results");
                $count = $ret[0]['c'];
                if(is_numeric($count) && ($count > 0 || $show0)){
                    array_push($noticeArr, array(
                        "module" => $name,
                        "name"   => $title,
                        "id"     => "huodongListphp",
                        "url"    => "huodong/huodongList.php",
                        "count"  => $count,
                        "group"  => "3fabu"
                    ));
                }

                //家政
            }elseif($name == "homemaking"){
                //家政服务
                if(testPurview('homemakingEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__homemaking_list` WHERE `state` = 0 " . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => $title,
                            "id"     => "homemakingListphp",
                            "url"    => "homemaking/homemakingList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //家政公司
                if(testPurview('homemakingStoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__homemaking_store` WHERE `state` = 0 " . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "家政公司",
                            "id"     => "homemakingStoreListphp",
                            "url"    => "homemaking/homemakingStoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //服务人员
                if(testPurview('personalEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__homemaking_personal` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "服务人员",
                                "id"     => "personalListphp",
                                "url"    => "homemaking/personalList.php",
                                "count"  => $count,
                                "group"  => "1business"
                            ));
                        }
                    }
                }

                //保姆/月嫂
                if(testPurview('nannyEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__homemaking_nanny` WHERE `state` = 0 " . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "保姆/月嫂",
                            "id"     => "nannyListphp",
                            "url"    => "homemaking/nannyList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                /*客服介入订单*/
                if(testPurview('kefuOrder')){
                    $sql = $dsql->SetQuery("SELECT count(o.`id`) as c FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_refund` r ON r.`orderid` = o.`id` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` WHERE o.`orderstate` = 8 AND r.`service` = 1" . getCityFilter('l.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "客服介入订单",
                            "id"     => "kefuOrderphp",
                            "url"    => "homemaking/kefuOrder.php",
                            "count"  => $count,
                            "group"  => "2order",
                            "danger"  => 1
                        ));
                    }
                }

                //婚嫁
            }elseif($name == "marry"){
                //婚嫁公司
                if(testPurview('storeEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_store` WHERE `state` = 0 " . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "婚嫁公司",
                            "id"     => "marrystoreListphp",
                            "url"    => "marry/marrystoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //婚宴场地
                if(testPurview('marryhotelfieldEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_hotelfield` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚宴场地",
                                "id"     => "marryhotelfieldListphp",
                                "url"    => "marry/marryhotelfieldList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚宴菜单
                if(testPurview('marryhotelmenuEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_hotelmenu` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚宴菜单",
                                "id"     => "marryhotelmenuListphp",
                                "url"    => "marry/marryhotelmenuList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //主持人
                if(testPurview('marryhostEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_host` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚宴主持",
                                "id"     => "marryhostListphp",
                                "url"    => "marry/marryhostList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚车
                if(testPurview('weddingcarEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_weddingcar` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚车管理",
                                "id"     => "weddingcarListphp",
                                "url"    => "marry/weddingcarList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //主持人案例
                if(testPurview('marryplancaseEdit7')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 7 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "主持人案例",
                                "id"     => "marryplancaseListphptypeid7",
                                "url"    => "marry/marryplancaseList.php?typeid=7",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚车案例
                if(testPurview('marryplancaseEdit10')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 10 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚车案例",
                                "id"     => "marryplancaseListphptypeid10",
                                "url"    => "marry/marryplancaseList.php?typeid=10",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚纱摄影案例
                if(testPurview('marryplancaseEdit1')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 1 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚纱摄影案例",
                                "id"     => "marryplancaseListphptypeid1",
                                "url"    => "marry/marryplancaseList.php?typeid=1",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //摄影跟拍案例
                if(testPurview('marryplancaseEdit2')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 2 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "摄影跟拍案例",
                                "id"     => "marryplancaseListphptypeid2",
                                "url"    => "marry/marryplancaseList.php?typeid=2",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //珠宝案例
                if(testPurview('marryplancaseEdit3')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 3 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "珠宝案例",
                                "id"     => "marryplancaseListphptypeid3",
                                "url"    => "marry/marryplancaseList.php?typeid=3",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚礼策划案例
                if(testPurview('marryplancaseEdit9')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 9 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚礼策划案例",
                                "id"     => "marryplancaseListphptypeid9",
                                "url"    => "marry/marryplancaseList.php?typeid=9",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //摄像跟拍案例
                if(testPurview('marryplancaseEdit4')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 4 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "摄像跟拍案例",
                                "id"     => "marryplancaseListphptypeid4",
                                "url"    => "marry/marryplancaseList.php?typeid=4",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //新娘跟妆案例
                if(testPurview('marryplancaseEdit5')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 5 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "新娘跟妆案例",
                                "id"     => "marryplancaseListphptypeid5",
                                "url"    => "marry/marryplancaseList.php?typeid=5",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚纱礼服案例
                if(testPurview('marryplancaseEdit6')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_plancase` WHERE `state` = 0 AND `typeid` = 6 AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚纱礼服案例",
                                "id"     => "marryplancaseListphptypeid6",
                                "url"    => "marry/marryplancaseList.php?typeid=6",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //商家套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 0  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "商家套餐",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚纱摄影套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 1  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚纱摄影",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=1",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //摄影跟拍套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 2  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "摄影跟拍",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=2",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //珠宝首饰套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 3  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "珠宝首饰",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=3",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //摄像跟拍套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 4  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "摄像跟拍",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=4",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //新娘跟妆套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 5  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "新娘跟妆",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=5",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //婚纱礼服套餐
                if(testPurview('marryplanmealEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__marry_planmeal` WHERE `type` = 6  AND `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "婚纱礼服",
                                "id"     => "marryplanmealListphp",
                                "url"    => "marry/marryplanmealList.php?typeid=6",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //旅游
            }elseif($name == "travel"){
                //旅游公司
                if(testPurview('travelstoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_store` WHERE `state` = 0 " . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "旅游公司",
                            "id"     => "travelstoreListphp",
                            "url"    => "travel/travelstoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //旅游视频
                if(testPurview('travelvideoEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_video` WHERE `state` = 0 ");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "旅游视频",
                            "id"     => "travelvideoListphp",
                            "url"    => "travel/travelvideoList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //旅游攻略
                if(testPurview('travelstrategyEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_strategy` WHERE `state` = 0 ");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "旅游攻略",
                            "id"     => "travelstrategyListphp",
                            "url"    => "travel/travelstrategyList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //旅游租车
                if(testPurview('travelrentcarEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_rentcar` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "旅游租车",
                                "id"     => "travelrentcarListphp",
                                "url"    => "travel/travelrentcarList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //旅游酒店
                if(testPurview('travelhotelEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_hotel` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "旅游酒店",
                                "id"     => "travelhotelListphp",
                                "url"    => "travel/travelhotelList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //景点门票
                if(testPurview('travelticketEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_ticket` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "景点门票",
                                "id"     => "travelticketListphp",
                                "url"    => "travel/travelticketList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //旅游签证
                if(testPurview('travelvisaEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_visa` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "旅游签证",
                                "id"     => "travelvisaListphp",
                                "url"    => "travel/travelvisaList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

                //周边游
                if(testPurview('travelagencyEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__travel_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__travel_agency` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "周边游",
                                "id"     => "travelagencyListphp",
                                "url"    => "travel/travelagencyList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }


            }elseif($name == "education"){//教育
                //教育公司
                if(testPurview('educationstoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__education_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "教育公司",
                            "id"     => "educationstoreListphp",
                            "url"    => "education/educationstoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //教育家教
                if(testPurview('educationfamilyEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__education_tutor` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "教育家教",
                            "id"     => "educationfamilyListphp",
                            "url"    => "education/educationfamilyList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //教育留言
                if(testPurview('educationWord')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__education_word` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "教育留言",
                            "id"     => "educationWordphp",
                            "url"    => "education/educationWord.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //教育课程
                if(testPurview('educationcoursesEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__education_courses` WHERE `state` = 0 AND `waitpay` = 0 ");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "教育课程",
                            "id"     => "educationcoursesListphp",
                            "url"    => "education/educationcoursesList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //教育教师
                if(testPurview('educationteacherEdit')){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE 1 = 1 " . $cityidFilter);
                    $res = $dsql->dsqlOper($sql, "results");
                    $ids = '';
                    if(!empty($res)){
                        foreach($res as $row){
                            $ids .= $row['id'] . ',';
                        }
                    }
                    $ids = rtrim($ids, ',');
                    if($ids){
                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__education_teacher` WHERE `state` = 0  AND `company` in ($ids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                        if(is_numeric($count) && ($count > 0 || $show0)){
                            array_push($noticeArr, array(
                                "module" => $name,
                                "name"   => "教育教师",
                                "id"     => "educationteacherListphp",
                                "url"    => "education/educationteacherList.php",
                                "count"  => $count,
                                "group"  => "3fabu"
                            ));
                        }
                    }
                }

            }elseif($name == "pension"){//养老
                //养老公司
                if(testPurview('pensionstoreEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__pension_store` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "养老机构",
                            "id"     => "pensionstoreListphp",
                            "url"    => "pension/pensionstoreList.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }

                //老人信息
                if(testPurview('pensionelderlyEdit')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__pension_elderly` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "老人信息",
                            "id"     => "pensionelderlyListphp",
                            "url"    => "pension/pensionelderlyList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

            }elseif($name == "circle"){//圈子
                
                if(testPurview('circleList')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__circle_dynamic_all` WHERE `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => $title,
                            "id"     => "circleListphp",
                            "url"    => "circle/circleList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

            }elseif($name == "sfcar"){//顺风车
                if(testPurview('sfcarList')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__sfcar_list` WHERE `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => $title,
                            "id"     => "sfcarListphp",
                            "url"    => "sfcar/sfcarList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

            }elseif($name == "integral"){//积分商城
                if(testPurview('integralOrder')){

                    $count = 0;
                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__integral_product` WHERE 1 = 1 " . $cityidFilter);
                    $results = $dsql->dsqlOper($archives, "results");
                    if (count($results) > 0) {
                        $list = array();
                        foreach ($results as $key => $value) {
                            $list[] = $value["id"];
                        }
                        $idList = join(",", $list);

                        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__integral_order` WHERE `orderstate` = 1 AND `proid` in ($idList)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $count = $ret[0]['c'];
                    }

                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => $title,
                            "id"     => "integralOrderphp",
                            "url"    => "integral/integralOrder.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }
                }

            }elseif($name == "live"){//直播
                if(testPurview('liveList')){

                    $count = 0;
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__livelist` WHERE `arcrank` = 0 AND `waitpay` = 0");
                    $results = $dsql->dsqlOper($archives, "results");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "直播",
                            "id"     => "liveListphp",
                            "url"    => "live/liveList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

            }elseif($name =='awardlegou'){

                if(testPurview('awardlegouProList')){
                    $sql = $dsql->SetQuery("SELECT count(l.`id`) as c FROM `#@__awardlegou_list` l LEFT JOIN `#@__business_list` s ON s.`id` = l.`sid` WHERE l.`state` = 0" . getCityFilter('s.`cityid`'));
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "有奖乐购商品",
                            "id"     => "awardlegouProListphp",
                            "url"    => "awardlegou/awardlegouProList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                if(testPurview('awardlegouOrderList')){

                    $count = 0;
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__awardlegou_order` WHERE  `orderstate` = 9");
                    $results = $dsql->dsqlOper($archives, "results");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "有奖乐购退款",
                            "id"     => "awardlegouOrderListphp",
                            "url"    => "awardlegou/awardlegouOrderList.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }

                }

            }
            elseif($name == "paimai"){
                if(testPurview('paimaiStore')){
                    $count = 0;
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__paimai_store` WHERE  `state` = 0");
                    $results = $dsql->dsqlOper($archives, "results");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "拍卖商家",
                            "id"     => "paimaiStore",
                            "url"    => "paimai/paimaiStore.php",
                            "count"  => $count,
                            "group"  => "1business"
                        ));
                    }
                }
                if(testPurview('paimaiList')){
                    $count = 0;
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__paimailist` WHERE  `arcrank` = 0");
                    $results = $dsql->dsqlOper($archives, "results");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "拍卖商品",
                            "id"     => "paiMaiList",
                            "url"    => "paimai/paimaiList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }
                if(testPurview('paimaiOrderList')){
                    $count = 0;
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__paimai_order` WHERE  `type`='pai' and `orderstate`=1");
                    $results = $dsql->dsqlOper($archives, "results");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "拍卖订单",
                            "id"     => "paimaiOrderList",
                            "url"    => "paimai/paimaiOrderList.php",
                            "count"  => $count,
                            "group"  => "2order"
                        ));
                    }
                }

            }elseif($name =='task'){

                //任务悬赏
                if(testPurview('taskList')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__task_list` WHERE `state` = 0 AND `haspay` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "待审任务",
                            "id"     => "taskListphp",
                            "url"    => "task/taskList.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //任务悬赏问题反馈
                if(testPurview('taskFeedback')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__task_feedback` WHERE `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "任务问题反馈",
                            "id"     => "taskFeedback",
                            "url"    => "task/taskFeedback.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //任务悬赏举报维权
                if(testPurview('taskReport')){
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__task_report` WHERE `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "任务举报维权",
                            "id"     => "taskReport",
                            "url"    => "task/taskReport.php",
                            "count"  => $count,
                            "group"  => "2order",
                            "danger"  => 1
                        ));
                    }
                }


            //交友
            }elseif($name == "dating"){

                if(testPurview('datingMember')){

                    //交友用户
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__dating_member` WHERE `type` = 0 AND `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "交友会员",
                            "id"     => "datingMemberphp0",
                            "url"    => "dating/datingMember.php?type=0",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                    //交友红娘
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__dating_member` WHERE `type` = 1 AND `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "交友红娘",
                            "id"     => "datingMemberphp1",
                            "url"    => "dating/datingMember.php?type=1",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                    //交友门店
                    $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__dating_member` WHERE `type` = 2 AND `state` = 0" . $cityidFilter);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $count = $ret[0]['c'];
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "交友门店",
                            "id"     => "datingMemberphp2",
                            "url"    => "dating/datingMember.php?type=2",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }

                }

            }elseif($name == "zhaopin"){ //城市招聘
                $today = GetMkTime(date("Y-m-d 00:00:00")); //今天
                // //统计全职审核，即全部未审核和审核拒绝的全职职位数量
                // $sql = $dsql->SetQuery("SELECT count(`id`) fullPostReview FROM `#@__zhaopin_post` WHERE `category` = 1 AND `status` IN (1,3) AND `del` = 0 AND `waitPay` = 0".getCityWhere());
                //统计全职待审核数量
                $sql = $dsql->SetQuery("SELECT count(`id`) fullPostReview FROM `#@__zhaopin_post` WHERE `category` = 1 AND `status` = 1 AND `del` = 0 AND `waitPay` = 0".getCityWhere());
                $fullPostReview = (int)$dsql->getOne($sql);
                if(testPurview('zhaopinPostListquanzhiList')){
                    $count = $fullPostReview;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "全职审核",
                            "id"     => "zhaopinPostListphptplquanzhiList",
                            "url"    => "zhaopin/zhaopinPostList.php?tpl=quanzhiList&source=2",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                // //统计兼职审核，即全部未审核和审核拒绝的兼职职位数量
                // $sql = $dsql->SetQuery("SELECT count(`id`) partPostReview FROM `#@__zhaopin_post` WHERE `category` = 2 AND `status` IN (1,3) AND `del` = 0 AND `waitPay` = 0".getCityWhere());
                //统计兼职待审核数量
                $sql = $dsql->SetQuery("SELECT count(`id`) partPostReview FROM `#@__zhaopin_post` WHERE `category` = 2 AND `status` = 1 AND `del` = 0 AND `waitPay` = 0".getCityWhere());
                $partPostReview = (int)$dsql->getOne($sql);
                if(testPurview('zhaopinPostListjianzhiList')){
                    $count = $partPostReview;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "兼职审核",
                            "id"     => "zhaopinPostListphptpljianzhiList",
                            "url"    => "zhaopin/zhaopinPostList.php?tpl=jianzhiList&source=2",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                // //统计简历审核，即全部未审核和审核拒绝的简历数量
                // $sql = $dsql->SetQuery("SELECT count(`id`) resumeReview FROM `#@__zhaopin_resume` WHERE `status` IN (1,3) AND `del` = 0".getCityWhere());
                //统计简历待审核数量
                $sql = $dsql->SetQuery("SELECT count(`id`) resumeReview FROM `#@__zhaopin_resume` WHERE `status` = 1 AND `del` = 0".getCityWhere());
                $resumeReview = (int)$dsql->getOne($sql);
                if(testPurview('zhaopinResumeList')){
                    $count = $resumeReview;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "简历审核",
                            "id"     => "zhaopinResumeListphptplzhaopinResumeList",
                            "url"    => "zhaopin/zhaopinResumeList.php?tpl=zhaopinResumeList&source=1",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                // //统计营业执照审核，即全部未审核和审核拒绝的营业执照数量
                // $sql = $dsql->SetQuery("SELECT count(`id`) licenseReview FROM `#@__zhaopin_company_license_log` WHERE `status` IN (1,3)".getCityWhere());
                //统计营业执照待审核数量
                $sql = $dsql->SetQuery("SELECT count(`id`) licenseReview FROM `#@__zhaopin_company_license_log` WHERE `status` = 1".getCityWhere());
                $licenseReview = (int)$dsql->getOne($sql);
                if(testPurview('zhaopinCompanyLicenseList')){
                    $count = $licenseReview;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "营业执照审核",
                            "id"     => "zhaopinCompanyLicenseListphptplzhaopinCompanyLicenseList",
                            "url"    => "zhaopin/zhaopinCompanyLicenseList.php?tpl=zhaopinCompanyLicenseList&source=1",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //统计全职信息被举报
                $sql = $dsql->SetQuery("SELECT count(`id`) fullPostComplain FROM `#@__member_complain` WHERE `state` = 0 AND `module` = 'zhaopin' AND `action` = 'quanzhi'".getCityWhere());
                $fullPostComplain = (int)$dsql->getOne($sql);
                if(testPurview('siteComplain')){
                    $count = $fullPostComplain;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "siteConfig",
                            "name"   => "全职被举报",
                            "id"     => "siteComplain",
                            "url"    => "siteConfig/siteComplain.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //统计兼职信息被举报
                $sql = $dsql->SetQuery("SELECT count(`id`) partPostComplain FROM `#@__member_complain` WHERE `state` = 0 AND `module` = 'zhaopin' AND `action` = 'jianzhi'".getCityWhere());
                $partPostComplain = (int)$dsql->getOne($sql);
                if(testPurview('siteComplain')){
                    $count = $partPostComplain;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "siteConfig",
                            "name"   => "兼职被举报",
                            "id"     => "siteComplain",
                            "url"    => "siteConfig/siteComplain.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //统计简历被举报
                $sql = $dsql->SetQuery("SELECT count(`id`) resumeComplain FROM `#@__member_complain` WHERE `state` = 0 AND `module` = 'zhaopin' AND `action` = 'resume'".getCityWhere());
                $resumeComplain = (int)$dsql->getOne($sql);
                if(testPurview('siteComplain')){
                    $count = $resumeComplain;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => "siteConfig",
                            "name"   => "简历被举报",
                            "id"     => "siteComplain",
                            "url"    => "siteConfig/siteComplain.php",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //统计今日简历异常投递
                $resumeAbnormalPost = 0;
                //统计今日电话异常拨打
                $dialAbnormal = 0;

                //获取后台设置阈值
                $field = '`abnormalDeliverDayCount`, `abnormalCallTelDayCount`';
                $tab0 = 'zhaopin_config';
                require_once(HUONIAOROOT."/api/handlers/zhaopin.config.php");
                global $userType;  //管理员类型  等于3说明是分站管理员
                global $adminCityIds;  //当前登录管理员可以管理的分站ID
                $cityid =  0;
                if ($userType == 3) {
                    $cityid = (int)$adminCityIds;
                }
                $zhaopinConfig = getCityData($cityid, $field, $tab0);

                //后台有相关设置且值不为0，才进行统计
                if ($zhaopinConfig != null && is_array($zhaopinConfig)) {
                    $zhaopinConfig = $zhaopinConfig[0];

                    //今日简历异常投递
                    if ($zhaopinConfig['abnormalDeliverDayCount'] > 0) {
                        $sql = $dsql->SetQuery("SELECT count(`userid`) resumeAbnormal FROM (SELECT count('id') AS total,`userid` FROM `#@__zhaopin_resume_post_log` WHERE `time_post` > ".$today.getCityWhere()." GROUP BY `userid` HAVING `total` >= ".$zhaopinConfig['abnormalDeliverDayCount'].") r");
                        $resumeAbnormalPost = (int)$dsql->getOne($sql);
                    }

                    //今日电话异常拨打
                    if ($zhaopinConfig['abnormalCallTelDayCount'] > 0) {
                        $sql = $dsql->SetQuery("SELECT count(`userid`) dialAbnormal FROM (SELECT count('id') AS total,`userid` FROM `#@__zhaopin_ptc_dial_log` WHERE `addtime` > ".$today.getCityWhere()." GROUP BY `userid`, `resumeid` HAVING `total` >= ".$zhaopinConfig['abnormalCallTelDayCount'].") r");
                        $dialAbnormal = (int)$dsql->getOne($sql);
                    }
                }

                //简历异常投递
                if(testPurview('zhaopinResumePostLogabnLogRecords')){
                    $count = $resumeAbnormalPost;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "简历异常投递",
                            "id"     => "zhaopinResumePostLogphptplabnLogRecords",
                            "url"    => "zhaopin/zhaopinResumePostLog.php?tpl=abnLogRecords",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }

                //电话异常拨打
                if(testPurview('zhaopinDialPTCListabnLogDial')){
                    $count = $dialAbnormal;
                    if(is_numeric($count) && ($count > 0 || $show0)){
                        array_push($noticeArr, array(
                            "module" => $name,
                            "name"   => "电话异常拨打",
                            "id"     => "zhaopinDialPTCListphptplabnLogDial",
                            "url"    => "zhaopin/zhaopinDialPTCList.php?tpl=abnLogDial",
                            "count"  => $count,
                            "group"  => "3fabu"
                        ));
                    }
                }
            }
        }
    }

    /*举报管理*/
    if(testPurview("siteComplain")){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member_complain` WHERE `state` = 0" . $cityidFilter);
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "siteConfig",
                "name"   => "举报管理",
                "id"     => "siteComplaintphp",
                "url"    => "siteConfig/siteComplain.php",
                "count"  => $count,
                "group"  => "0member"
            ));
        }
    }
    /*意见反馈*/
    if(testPurview("suggestion")){
        $sql = $dsql->SetQuery("SELECT count(`id`) as c FROM `#@__member_suggestion` WHERE `state` = 0 ");
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => "siteConfig",
                "name"   => "意见反馈",
                "id"     => "suggestionphp",
                "url"    => "siteConfig/suggestion.php",
                "count"  => $count,
                "group"  => "0member"
            ));
        }
    }
    //分销商
    if(testPurview('fenxiaoUser')){
        $sql = $dsql->SetQuery("SELECT count(u.`id`) as c FROM `#@__member_fenxiao_user` u LEFT JOIN `#@__member` m ON m.`id` = u.`uid` WHERE u.`state` = 0 AND m.`id` IS NOT NULL" . getCityFilter('m.`cityid`'));
        $ret = $dsql->dsqlOper($sql, "results");
        $count = $ret[0]['c'];
        if(is_numeric($count) && ($count > 0 || $show0)){
            array_push($noticeArr, array(
                "module" => $name,
                "name"   => "分销商",
                "id"     => "fenxiaoUser",
                "url"    => "member/fenxiaoUser.php",
                "count"  => $count,
                "group"  => "1business"
            ));
        }
    }





    //插件->电信专区
    if(testPurview('plugins')){
        $pid = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = 12 ");
        $repid = $dsql->dsqlOper($pid, "results");

        if ($repid){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_telecomfault` WHERE `status` = 0");   //故障
            $countfault= (int)$dsql->dsqlOper($sql, "totalCount");
            $telecom = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins_telecom` WHERE `telestatus` = 0 ");     //报装
            $counttelecom= (int)$dsql->dsqlOper($telecom, "totalCount");
            $count = $countfault+$counttelecom;
            if(is_numeric($count) && ($count > 0 || $show0)){
                array_push($noticeArr, array(
                    "module" => "plugins",
                    "name"   => "电信专区",
                    "id"     => "plugins",
                    "url"    => "/include/plugins/12/index.php",
                    "count"  => $count,
                    "openid"  => $openid,
                    "group"  => "3fabu"
                ));
            }
        }

    }

    //查询消息通知
    $sql = $dsql->SetQuery("SELECT count(`id`) c FROM `#@__site_admin_notice`");
    $ret = $dsql->dsqlOper($sql, "results");
    $hasnew = $ret[0]['c'];

    echo $callback."({'data': ".json_encode($noticeArr).", 'hasnew': ".$hasnew."})";die;

}
//清除消息通知
elseif($dopost == "clearAdminNotice"){
    $sql = $dsql->SetQuery("DELETE FROM `#@__site_admin_notice`");
    $dsql->dsqlOper($sql, "update");
    die;

}
//
elseif($dopost == "checkOnlineUserCount"){
    if(isMobile()){
        echo '{"state":200,"info":"cancel"}';
        die;
    }
    $r = checkOnlineUserCount($time, $max, $speed);
    if($r){
        echo '{"state":100,"info":"ok"}';
    }else{
        echo '{"state":200,"info":"cancel"}';
    }
    die;
}

function getCityWhere(){
    return getCityFilter('`cityid`');
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    $softVersion = getSoftVersion();
    $siteVersion  = explode("\n", $softVersion);  // 0：版本号  1：升级时间
    $version = trim($siteVersion[0]);
    $huoniaoTag->assign("update_version", $version);

    //系统功能数据
    require(HUONIAODATA."/admin/config_permission.php");

    $permission_data = array();

    //配置
    $permission = array();
    $menuId = $menuData[0]['menuId'];
    if(!empty($menuData[0]['subMenu'])){
        $permission_item = array();
        foreach($menuData[0]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? $menuId.'/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[0] = array(
                'name' => $menuData[0]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }


    //用户
    $permission = array();
    $menuId = $menuData[1]['menuId'];
    if(!empty($menuData[1]['subMenu'])){
        $permission_item = array();
        foreach($menuData[1]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? $menuId.'/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[1] = array(
                'name' => $menuData[1]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }


    //财务
    $permission = array();
    $menuId = $menuData[3]['menuId'];
    if(!empty($menuData[3]['subMenu'])){
        $permission_item = array();
        foreach($menuData[3]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? 'member/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[3] = array(
                'name' => $menuData[3]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }


    //模块
    $sql = $dsql->SetQuery("SELECT `id`, `parentid`, `icon`, `title`, `subject`, `name`, `subnav` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){//如果有子类

        $permissionArr = array();

        foreach($result as $f_key => $f_val){

            //拼接模块列表
            foreach($result as $s_key => $s_val){
                if($s_val['parentid'] == $f_val['id']){
                    $navdata = json_decode($s_val['subnav'], true);

                    $permission = array();

                    if($navdata && is_array($navdata)){

                        //拼接最终链接
                        foreach($navdata as $s_type){

                            $permission_child = array();

                            foreach($s_type['subMenu'] as $s_list){
                                $href = $s_list['menuUrl'];
                                if(strpos($href, "/") === false){
                                    $href = $s_val['name']."/".$href;
                                }

                                $value = $s_list['menuUrl'];
                                if(strpos($value, "/") !== false){
                                    $value = explode("/", $value);
                                    $value = $value[1];
                                }
                                //验证权限
                                if(testPurview($value)){
                                    array_push($permission_child, array(
                                        'url' => $href,
                                        'name' => $s_list['menuName']
                                    ));
                                }
                            }

                            if($permission_child){
                                array_push($permission, array(
                                    'name' => $s_type['menuName'],
                                    'data' => $permission_child
                                ));
                            }
                        }
                        
                    }

                    //如果链接不为空，则拼接外层代码
                    if($permission){

                        global $cfg_staticVersion;
                        $icon = empty($s_val['icon']) ? '/static/images/admin/nav/' . $s_val['name'] . '.png?v='.$cfg_staticVersion : getFilePath($s_val['icon']);

                        array_push($permissionArr, array(
                            'name' => $s_val['subject'] ? $s_val['subject'] : $s_val['title'],
                            'id' => $s_val['name'],
                            'icon' => $icon,
                            'data' => $permission
                        ));
                    }

                }
            }

        }

        if($permissionArr){
            $permission_data[2] = array(
                'name' => $menuData[2]['menuName'],
                'id' => 'module',
                'data' => $permissionArr
            );
        }
    }


    //微信
    $permission = array();
    $menuId = $menuData[4]['menuId'];
    if(!empty($menuData[4]['subMenu'])){
        $permission_item = array();
        foreach($menuData[4]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? $menuId.'/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[4] = array(
                'name' => $menuData[4]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }

    //商家
    $permission = array();
    $menuId = $menuData[5]['menuId'];
    if(!empty($menuData[5]['subMenu'])){
        $permission_item = array();
        foreach($menuData[5]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? $menuId.'/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[5] = array(
                'name' => $menuData[5]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }

    //APP
    $permission = array();
    $menuId = $menuData[6]['menuId'];
    if(!empty($menuData[6]['subMenu'])){
        $permission_item = array();
        foreach($menuData[6]['subMenu'] as $key => $val){
            //循环终级菜单
            $permission_child = array();
            foreach($val['subMenu'] as $f_key => $f_val){
                $value = $f_val['menuUrl'];
                if(strpos($value, "/") !== false){
                    $value = explode("/", $value);
                    $value = $value[1];
                }
                //验证权限
                if(testPurview($value)){
                    array_push($permission_child, array(
                        'url' => strpos($f_val['menuUrl'], "/") === false ? $menuId.'/'.$f_val['menuUrl'] : $f_val['menuUrl'],
                        'name' => $f_val['menuName']
                    ));
                }
            }
            //如果终级菜单不为空，则拼接菜单分组以及菜单列表
            if($permission_child){
                array_push($permission, array(
                    'name' => $val['menuName'],
                    'data' => $permission_child
                ));
            }
        }

        //如果有相关功能权限
        if($permission){
            $permission_data[6] = array(
                'name' => $menuData[6]['menuName'],
                'id' => $menuId,
                'data' => $permission
            );
        }
    }

    //插件
    if(testPurview("plugins")){
        $permission_data[7] = array(
            'name' => $menuData[7]['menuName'],
            'id' => 'plugins',
            'url' => 'siteConfig/plugins.php'
        );
    }

    //商店
    if(testPurview("store")){
        $permission_data[8] = array(
            'name' => $menuData[8]['menuName'],
            'id' => 'store',
            'url' => 'siteConfig/store.php'
        );
    }

    $huoniaoTag->assign('permission_data_json', json_encode($permission_data));
    $huoniaoTag->assign('permission_data', $permission_data);


    //当前登录管理员信息
    $archives = $dsql->SetQuery("SELECT `mtype`, `username`, `nickname`, `mgroupid`, `admin_common_module`, `admin_common_function`, `admin_collection_function` FROM `#@__member` WHERE `id` = ".$userid);
    $results = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('username', $results[0]['username']);
    $huoniaoTag->assign('mtype', $results[0]['mtype']);
    $huoniaoTag->assign('nickname', $results[0]['nickname'] ? $results[0]['nickname'] : $results[0]['username']);

    
    //管理员常用模块
    $common_module = $results[0]['admin_common_module'] ? explode(',', $results[0]['admin_common_module']) : array();
    $huoniaoTag->assign('common_module', json_encode($common_module));

    //管理员最近使用的菜单
    $common_function = $results[0]['admin_common_function'] ? json_decode($results[0]['admin_common_function'], true) : array();
    $huoniaoTag->assign('common_function', json_encode($common_function));

    //管理员收藏的菜单
    $collection_function = $results[0]['admin_collection_function'] ? json_decode($results[0]['admin_collection_function'], true) : array();
    $huoniaoTag->assign('collection_function', json_encode($collection_function));



    //管理员分组名称
    if($results[0]['mtype'] == 3){
        $sql = $dsql->SetQuery("SELECT a.`typename` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` = " . $results[0]['mgroupid']);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $huoniaoTag->assign('groupname', $ret[0]['typename'] . '分站管理员');
        }else{
            $huoniaoTag->assign('groupname', '未知分站管理员');
        }
    }else{
        $archives = $dsql->SetQuery("SELECT `groupname` FROM `#@__admingroup` WHERE `id` = ".$results[0]['mgroupid']);
        $results = $dsql->dsqlOper($archives, "results");
        $huoniaoTag->assign('groupname', $results[0]['groupname']);
    }

    $archives = $dsql->SetQuery("SELECT * FROM `#@__adminlogin` WHERE `userid` = ".$userid." ORDER BY `id` DESC LIMIT 0, 2");
    $results = $dsql->dsqlOper($archives, "results");
    $huoniaoTag->assign('logintime', date("Y-m-d H:i:s", $results[1]['logintime']));
    $huoniaoTag->assign('loginip', $results[1]['loginip']);

    //需要打开的页面
    $huoniaoTag->assign('gotopage', str_replace('index.php?gotopage=', '', $gotopage));

    //是否显示火鸟帮助信息
    $huoniaoOfficial = 0;
    if(testPurview("huoniaoOfficial")){
        $huoniaoOfficial = 1;
    }
    $huoniaoTag->assign('huoniaoOfficial', $huoniaoOfficial);

    //是否创始人身份
    $huoniaoFounder = 0;
    if(testPurview("founder")){
        $huoniaoFounder = 1;
    }
    $huoniaoTag->assign('huoniaoFounder', $huoniaoFounder);

    //早上好、中午好、下午好、晚上好
    // $huoniaoTag->assign('hour', getNowHour());

    // 后台配置项
    $huoniaoTag->assign('cfg_adminlogo', getFilePath($cfg_adminlogo));  //后台LOGO
    $huoniaoTag->assign('cfg_adminWaterMark', (int)$cfg_adminWaterMark);  //后台页面水印 0启用 1禁用

    $adminBackgroundColor = $cfg_adminBackgroundColor ? $cfg_adminBackgroundColor : '#3275FA';
    $huoniaoTag->assign('cfg_adminBackgroundColor', $adminBackgroundColor);  //后台背景色
    $huoniaoTag->assign('cfg_adminBackgroundColorRgb', hex2rgb($adminBackgroundColor));  //后台背景色RGB值

    //城市分站数量，大于1的才需要显示出账明细中的城市分站分佣
    $huoniaoTag->assign('siteCityCount', $siteCityCount);

    //分销功能状态，开启后才需要显示出账明细中的分销商分佣
    global $cfg_fenxiaoState;
    $cfg_fenxiaoState = (int)$cfg_fenxiaoState;
    $huoniaoTag->assign('fenxiaoState', $cfg_fenxiaoState);


    //是否为手机端访问
    $huoniaoTag->assign('isMobile', isMobile() ? 1 : 0);

    //服务器信息
    $huoniaoTag->assign("php_uname_s", php_uname('s'));
	$huoniaoTag->assign("php_uname_r", php_uname('r'));
	$huoniaoTag->assign("server_software", $_SERVER["SERVER_SOFTWARE"]);
	$huoniaoTag->assign("PHP_VERSION", PHP_VERSION);

	$huoniaoTag->assign("mysqlinfo", $dsql->getDriverVersion());

	$max_upload = ini_get("file_uploads") ? ini_get("upload_max_filesize") : "Disabled";
	$huoniaoTag->assign("max_upload", $max_upload);

	$huoniaoTag->assign("DB_CHARSET", $DB_CHARSET);

	$huoniaoTag->assign("cfg_bbsState", $cfg_bbsState);
	$huoniaoTag->assign("cfg_bbsType", $cfg_bbsType);

    global $cfg_pointName;
	$huoniaoTag->assign("cfg_pointName", $cfg_pointName);

    //后台首页权限
    $huoniaoTag->assign('adminIndex', testPurview("adminIndex") ? 1 : 0);

	// 服务器信息
	$huoniaoTag->assign("server_time", date("Y-m-d H:i:s", time()));
	$huoniaoTag->assign("server_dir", HUONIAOROOT);

    //渲染页面
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}



//格式化
function _sizecount($filesize) {
    if($filesize >= 1073741824) {
        $filesize = round($filesize / 1073741824 * 100) / 100 . ' GB';
    } elseif($filesize >= 1048576) {
        $filesize = round($filesize / 1048576 * 100) / 100 . ' MB';
    } elseif($filesize >= 1024) {
        $filesize = round($filesize / 1024 * 100) / 100 . ' KB';
    } else {
        $filesize = $filesize . ' Bytes';
    }
    return $filesize;
}


//入账统计
function platformEntry($starttime, $endtime){
    global $dsql;

    //总充值
	$sql = $dsql->SetQuery("SELECT SUM(a.`amount`) amount FROM `#@__member_money` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE a.`montype` = 1 AND a.`ctype` = 'chongzhi' AND a.`info` != '分销商每月返现' AND a.`date` >= $starttime AND a.`date` < $endtime");
	$ret = $dsql->dsqlOper($sql, "results");
	$recharge = floatval(sprintf("%.2f", $ret[0]['amount']));

	//佣金总和(除了：商家入驻、经纪人套餐、合伙人入驻)
	$sql = $dsql->SetQuery("SELECT SUM(a.`platform`) amount FROM `#@__member_money` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1 AND a.`showtype` = 1 AND a.`type` = 1 AND a.`date` >= $starttime AND a.`date` < $endtime AND a.`ctype` != 'shangjiaruzhu' AND a.`ctype` != 'jingjirentaocan' AND a.`ctype` != 'hehuorenruzhu'");
	$ret = $dsql->dsqlOper($sql, "results");
    $platformCommission = floatval(sprintf("%.2f", $ret[0]['amount']));

	//加盟入驻/套餐(只包含：商家入驻、经纪人套餐、合伙人入驻)
	$sql = $dsql->SetQuery("SELECT SUM(a.`platform`) amount FROM `#@__member_money` a LEFT JOIN `#@__member` m ON m.`id` = a.`userid` WHERE 1 = 1 AND a.`showtype` = 1 AND a.`type` = 1 AND a.`date` >= $starttime AND a.`date` < $endtime AND (a.`ctype` = 'shangjiaruzhu' OR a.`ctype` = 'jingjirentaocan' OR a.`ctype` = 'hehuorenruzhu')");
	$ret = $dsql->dsqlOper($sql, "results");
    $joinCommission = floatval(sprintf("%.2f", $ret[0]['amount']));

    //保障金
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_promotion` WHERE `type` = 1 AND `date` >= $starttime AND `date` < $endtime");
	$ret = $dsql->dsqlOper($sql, "results");
    $promotion = floatval(sprintf("%.2f", $ret[0]['amount']));

    //统计汇总金额
    $totalAmount = floatval(sprintf("%.2f", $recharge + $platformCommission + $joinCommission + $promotion));

    return array(
        "recharge" => $recharge,
        "platformCommission" => $platformCommission,
        "joinCommission" => $joinCommission,
        "promotion" => $promotion,
        "totalAmount" => $totalAmount
    );
}


//出账统计
function platformOutgoing($starttime, $endtime){
    global $dsql;
    global $siteCityCount;

    //统计提现数据
    $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_withdraw` WHERE `state` = 1 AND `rdate` >= $starttime AND `rdate` < $endtime");
    $ret = $dsql->dsqlOper($sql, "results");
    $withdraw = floatval(sprintf("%.2f", $ret[0]['amount']));
    
    //统计分站分佣数据
    $substation = 0;
    if($siteCityCount > 1){
        $sql = $dsql->SetQuery("SELECT SUM(`commission`) as amount  FROM `#@__member_money` WHERE `showtype`  = 1 AND `type` = 1 AND ctype != 'tixian' AND `date` >= $starttime AND `date` < $endtime");
        $ret = $dsql->dsqlOper($sql, "results");
        $substation = floatval(sprintf("%.2f", $ret[0]['amount']));
    }

    //统计分销商分佣数据
    $fenxiao = 0;
    global $cfg_fenxiaoState;
    $cfg_fenxiaoState = (int)$cfg_fenxiaoState;
    if($cfg_fenxiaoState == 1){
        $sql = $dsql->SetQuery("SELECT SUM(`amount`) amount FROM `#@__member_fenxiao` WHERE `pubdate` >= $starttime AND `pubdate` < $endtime");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $fenxiao = floatval(sprintf("%.2f", $ret[0]['amount']));
        }
    }

    //出账总金额
    $totalAmount = floatval(sprintf("%.2f", $withdraw + $substation + $fenxiao));

    return array(
        "withdraw" => $withdraw,
        "substation" => $substation,
        "fenxiao" => $fenxiao,
        "totalAmount" => $totalAmount
    );
}