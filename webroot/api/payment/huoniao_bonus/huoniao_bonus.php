<?php
if (!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if (isset($set_modules) && $set_modules == TRUE) {

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "huoniao_bonus";

    /* 名称 */
    $payment[$i]['pay_name'] = "消费金";

    /* 版本号 */
    $payment[$i]['version'] = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '此功能主要用于平台推广获客，已覆盖全站所有消费场景，支持充值卡充值，自定义设置每月消费限制！';

    /* 作者 */
    $payment[$i]['author'] = '酷曼软件';

    /* 网址 */
    $payment[$i]['website'] = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '商家买单每月消费限制', 'name' => 'bonuslimit', 'type' => 'text'),
//        array('title' => 'API秘钥', 'name' => 'signkey', 'type' => 'text'),
        //        array('title' => 'APPID',     'name' => 'APPID',      'type' => 'text'),
        //        array('title' => 'APPSECRET', 'name' => 'APPSECRET',  'type' => 'text'),
    );

    return;
}

class huoniao_bonus
{

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct()
    {
        $this->huoniao_bonus();
    }

    function huoniao_bonus()
    {
    }

    /**
     * 生成支付代码
     * @param array $order 订单信息
     * @param array $payment 支付方式信息
     */
    function get_code($order, $payment, $returnjson = '', $param = array())
    {
        global $app;  //是否为客户端app支付
        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
        global $userLogin;
        global $dsql;

        if ($app && !isApp() && !isWxMiniprogram()) return false;

        // 查询该笔订单有没有支付成功
        $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '" . $order["order_sn"] . "' AND `state` = 1");
        $orderres = $dsql->dsqlOper($ordersql, "results");
        if ($orderres) {
            die("This order has already been paid, please do not pay again");
        }
        $userid = $userLogin->getMemberID();
        $order_amount = sprintf("%.2f", $order['order_amount']);

        //查询购买人id
        $useridsql = $dsql->SetQuery("SELECT `uid`,`ordertype`,`amount` FROM `#@__pay_log` WHERE `ordernum` = '" . $order["order_sn"] . "' ");
        $user = $dsql->dsqlOper($useridsql, "results");
        if ($order['service'] == 'business'){
            $BeginDate                  = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
            $overDate                   = date('Y-m-d', strtotime("$BeginDate +1 month -1 day"));//本月最后一天
            $overDate                   = GetMkTime($overDate);  //本月第一天
            $BeginDate                  = GetMkTime($BeginDate);  //本月最后一天
            //查询本月消费金使用情况
            $Sumsql = $dsql->SetQuery("SELECT SUM(`amount`)bonusPrice FROM `#@__member_bonus` WHERE `userid` = '$userid'  AND `date` >= $BeginDate AND `date` <= $overDate AND `type` = 0");
            $bonusSum= $dsql->dsqlOper($Sumsql, "results");
            $usebonus            = (float)$bonusSum[0]['bonusPrice'];                     //本月已用消费金
            //额度;
            $configPay = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
            $Payconfig= $dsql->dsqlOper($configPay, "results");
            $monBonus = 0 ;
            if ($Payconfig){
                $monBonus = unserialize($Payconfig[0]['pay_config']);
                $monBonus = $monBonus[0]['value'];
            }
            $surplusbonus        = sprintf("%.2f",$monBonus - $usebonus);                     //本月剩余消费金额度
            //查询退回的订单
            $tui = $dsql->SetQuery("SELECT SUM(`amount`)amount  FROM `#@__member_bonus` WHERE `userid` = '$userid' AND `info` like '%消费金退款%' ");
            $tuisql= $dsql->dsqlOper($tui, "results");
            $usebonus         -= $tuisql[0]['amount'] ? $tuisql[0]['amount'] : 0 ;
            $surplusbonus      += $tuisql[0]['amount'] ? $tuisql[0]['amount'] : 0 ;
            if ($surplusbonus < $order_amount){
                echo json_encode(array('state' => 101, 'info' => '额度不足,本月剩余额度'.$surplusbonus.'元!'));
                die;
            }
        }
        $userbonus = $userLogin->getMemberInfo($userid);
        $userbonus = $userbonus['bonus'];
        if ($userbonus <  $order_amount) {
            echo json_encode(array('state' => 101, 'info' => '账户金额不足!'));
            die;
        }
        define('EST_bonuslimit', $payment['bonuslimit']);    //消费限制
        // 加载支付方式操作函数
        loadPlug("payment");
        $ordernum = create_ordernum();
        //减少账户消费金
        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `bonus` = `bonus` - '$order_amount' WHERE `id` = '$userid'");
        $dsql->dsqlOper($archives, "update");
        //保存操作日志
        $user = $userLogin->getMemberInfo($userid);
        $userbonus = $user['bonus'];            //账户消费金
        $subject = $order['subject'];
        $info = $subject . ':' . $order["order_sn"];
        global  $siteCityInfo;
        $cityid  = $siteCityInfo['cityid'];   //调取当前的分站id
        if (!$cityid){
            $cityid = $user['cityid'];
        }
        $date = GetMkTime(time());
        $param = serialize($param);

        $param_data = serialize($order);

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`param`,`ordertype`,`balance`,`ordernum`,`cityid`,`param_data`) VALUES ('$userid', '0', '$order_amount', '$info', '$date','$param','" . $order['service'] . "','$userbonus','" . $order['order_sn'] . "','$cityid','$param_data')");
        $dsql->dsqlOper($archives, "update");

        //支付成功操作
        order_paid($order['order_sn'], $ordernum);

        $pramtype = unserialize($param);
        if ($pramtype['type'] !='paotui'){
            $data['order'] = $order['order_sn'];
            $handels = new handlers("member", "tradePayResult");
            $url = $handels->getHandle($data);
            echo json_encode(array('state' => 100, 'info' => $url['info']));
            die;
        }else{
            $ordernum = $order["order_sn"];
            $params = array (
                "service"  => "waimai",
                "template" => "payreturn-".$ordernum
            );
            $url   = getUrlPath($params);
            echo json_encode(array('state' => 100, 'info' => $url));
            die;
        }



    }

}
