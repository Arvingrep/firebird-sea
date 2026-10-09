<?php
if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "fomopay_paynow";

    /* 名称 */
    $payment[$i]['pay_name'] = "PAYNOW";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = 'FOMO Pay是新加坡一家获得支付牌照的金融科技公司，为中国跨境市场提供一站式支付解决方案。官网：https://www.fomopay.com/';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => 'API用户名', 'name' => 'merchantid', 'type' => 'text'),
        array('title' => 'API秘钥', 'name' => 'signkey', 'type' => 'text')
    );

    return;
}

class fomopay_paynow {
    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->fomopay_paynow();
    }

    function fomopay_paynow(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $app;  //是否为客户端app支付
        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
        global $userLogin;
        global $dsql;

        if($app && !isApp()) return false;

        // 查询该笔订单有没有支付成功

        $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '".$order["order_sn"]."' AND `state` = 1");

        $orderres = $dsql->dsqlOper($ordersql,"results");

        if($orderres){
            die("This order has already been paid, please do not pay again");
        }

        define('EST_merchantid', $payment['merchantid']);    //账号
        define('EST_signkey', $payment['signkey']);  //密钥

        // 加载支付方式操作函数
        loadPlug("payment");

        $order_amount = sprintf("%.2f", $order['order_amount']);
        $paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

        //验证是否为小程序端

        //$fomoorder 兼容平台唯一订单号问题
        $fomoorder = create_ordernum();
        //支付参数
        $bizRequestContent = array(
            'mode'               => 'DIRECT',
            'orderNo'            => $fomoorder,
            'subject'            => $order['subject'],
            'description'        => $order['subject'] . "：" . $order['order_sn'],
            'amount'             => $order_amount,
            'currencyCode'       => 'SGD',
            'notifyUrl'          => $cfg_secureAccess.$cfg_basehost.'/api/payment/fomopayNotify.php',
            'returnUrl'          => $cfg_secureAccess.$cfg_basehost,
            'sourceOfFund'       => 'PAYNOW',
            'transactionOptions' => array(
                'timeout' => 1800
            )
        );

        $params = $bizRequestContent;
        //初始化日志
        require_once dirname(__FILE__)."/../log.php";
        $_fomoPay = new CLogFileHandler(HUONIAOROOT . '/log/fomopay/'.date('Y-m-d').'-create.log', true);
        $_fomoPay->DEBUG("报文：" . json_encode($params));

        $httpHeader = array();
        $httpHeader[] = "Authorization: Basic ".base64_encode(EST_merchantid.":".EST_signkey);
        $httpHeader[] = 'Content-Type:application/json';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://ipg.fomopay.net/api/orders');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params) );
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $data = curl_exec($ch);
        if($data){
            curl_close($ch);
            $data = json_decode($data, true);

            //日志
            $_fomoPay->DEBUG("Result：" . json_encode($data));

            if(isset($data['status']) && $data['status'] == 'CREATED'){

                //更新transaction_id
                $trade_id = $data['id'];
                $codeUrl  = $data['codeUrl'];
                $primaryTransactionId  = $data['primaryTransactionId'];
                $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `transaction_id` = '$trade_id',`primaryTransactionId` ='$primaryTransactionId' WHERE `ordernum` = '".$order["order_sn"]."'");
                $dsql->dsqlOper($sql, "update");

                $tpl = HUONIAOROOT."/api/payment/fomopay_paynow/";
                $templates = "payQr.html";
                if(file_exists($tpl.$templates)){
                    $huoniaoTag->template_dir = $tpl;
                    $huoniaoTag->assign('codeUrl', $codeUrl);
                    $huoniaoTag->assign('service', $order["service"]);
                    $huoniaoTag->assign('ordernum', $order["order_sn"]);
                    $huoniaoTag->assign('order_amount', $order_amount);
                    $huoniaoTag->display($templates);
                }

            }else{
                die($data['message']);
            }
        }else{
            $error = curl_error($ch);
            curl_close($ch);
            print_r($error);
        }

    }


    /**
     * 响应操作
     */
    function respond(){
        global $dsql;

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("fomopay_wxpay");

        /* GET */
        define('EST_merchantid', $payment['merchantid']);    //账号
        define('EST_signkey', $payment['signkey']);  //密钥

        $respond = file_get_contents("php://input");

        $respond = json_decode($respond,true);

        //初始化日志
        require_once dirname(__FILE__)."/../log.php";
        $_fomoPay = new CLogFileHandler(HUONIAOROOT . '/log/fomopay/'.date('Y-m-d').'-respond.log', true);

        $_fomoPay->DEBUG("respond：" . json_encode($respond));

        //根据订单号查询trade_id
        $trade_id = '';
        $sql = $dsql->SetQuery("SELECT `id`,`ordernum` FROM `#@__pay_log` WHERE `transaction_id` = '".$respond['orderId']."'");

        $_fomoPay->DEBUG("respondsql：" . $sql);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $trade_id = $respond['orderId'];

            $ordernum = $ret[0]['ordernum'];
        }else{
            return false;
        }

        if(!$trade_id){
            return false;
        }

        $httpHeader = array();
        $httpHeader[] = 'Content-Type:Application/json';
        $httpHeader[] = "Authorization: Basic ".base64_encode(EST_merchantid.":".EST_signkey);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://ipg.fomopay.net/api/orders/'.$trade_id);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $data = curl_exec($ch);
        if($data){
            curl_close($ch);
            $data = json_decode($data, true);

            //日志
            $_fomoPay->DEBUG("Result：" . json_encode($data));

            if(isset($data['status'])){

                $status = $data['status'];
                if($status == 'SUCCESS'){
                    order_paid($ordernum, $trade_id);
                    return true;
                }else{
                    return false;
                }


            }else{
                return false;
                die($status);
            }
        }else{
            $error = curl_error($ch);
            curl_close($ch);
            return false;
        }

    }
}
