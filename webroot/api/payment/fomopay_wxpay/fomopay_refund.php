<?php
/**
 * yabandpay退款接口
 *
 * @version        $Id: yabandpay_refund.php $v1.0 2021-02-23 上午9:26:23 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){
    return;
}


/**
 * 类
 */
class yabandpay_refund {

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $merid;
    public $merprtclno;
    public $icbcappid;

    function __construct(){
        $this->yabandpay_refund();
    }

    function yabandpay_refund(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("yabandpay_wxpay");

        $this->user = $payment['user'];
        $this->secret_key = $payment['merchantid'];
        $this->currency   = $payment['signkey'];

        define('EST_merchantid', $payment['merchantid']);    //账号
        define('EST_signkey', $payment['signkey']);  //密钥
    }

    function refund($order){

        global $dsql;

        $user        = $this->user;  //账号
        $secret_key  = $this->secret_key;  //密钥

        $ordernum    = $order['ordernum'];  //订单ID
        $amount      = $order['amount'];  //退款金额
        $time        = time();  //当前时间

        //查询trade_id
        $trade_id = '';
        if($order['service'] == 'shop'){
            $sql = $dsql->SetQuery("SELECT `transaction_id`,`primaryTransactionId` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
        }else{
            $sql = $dsql->SetQuery("SELECT `transaction_id`,`primaryTransactionId` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
        }
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $trade_id               = $ret[0]['transaction_id'];
            $primaryTransactionId   = $ret[0]['primaryTransactionId'];
        }else{
            return array("state" => 200, "code" => "支付订单查询失败");
        }

        if(empty($trade_id)){
            return array("state" => 200, "code" => "YabandPay支付订单ID获取失败");
        }

        //初始化日志
        require_once dirname(__FILE__)."/../log.php";
        $_fomopayRefund = new CLogFileHandler(HUONIAOROOT . '/log/fomopay/'.date('Y-m-d').'-refund.log', true);
        $_fomopayRefund->DEBUG("订单：" . json_encode($order));

        $mchRefundNo = "REFUND_" . create_ordernum();

        //支付参数
        $params = array(
            'type'          => 'REFUND',
            'originalId'    => $trade_id,
            'transactionNo' => $primaryTransactionId,
            'amount'        => $amount,
            'currencyCode'  => 'SGD',
            'subject'       => '接口退款',
        );


        $_fomopayRefund->DEBUG("报文：" . json_encode($params));

        $httpHeader = array();
        $httpHeader[] = "Authorization: Basic ".base64_encode(EST_merchantid.":".EST_signkey);
        $httpHeader[] = 'Content-Type:Application/json';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://ipg.fomopay.net/api/orders/'.$trade_id.'/transactions');
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
            $_fomopayRefund->DEBUG("Result：" . json_encode($data));

            if($data['status'] == 'SUCCESS'){
                return array("state" => 100, "date" => $time, "refundOrderNo" => $data['id']);
            }else{
                return array("state" => 200, "code" =>$data['status']);
            }

        }else{
            $error = curl_error($ch);
            curl_close($ch);
            $_fomopayRefund->DEBUG("请求失败：" . json_encode($error));
            return array("state" => 200, "code" => $error);
        }

    }

}
