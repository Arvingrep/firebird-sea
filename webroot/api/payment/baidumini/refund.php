<?php
/**
 * 百度小程序退款
 *
 * @version        $Id: refund.php $v1.0 2020-12-23 下午14:21:22 $
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
class baiduminiRefund {

  /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

	 protected $client_id;
     protected $client_secret;

    function __construct(){
		// 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("baidumini");

        $this->client_id = $payment['client_id'];
        $this->client_secret = $payment['client_secret'];

        $this->baiduminiRefund();
    }

    function baiduminiRefund(){}

	// 获取token
	function getToken(){

		$url = "https://openapi.baidu.com/oauth/2.0/token?grant_type=client_credentials&client_id=".$this->client_id."&client_secret=".$this->client_secret."&scope=smartapp_snsapi_base";

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $url);
        curl_setopt($ch,CURLOPT_HEADER, 0);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 0);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, 0);//证书检查
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch,CURLOPT_TIMEOUT, 10);
        $data = curl_exec($ch);
		$error = curl_error($ch);
		curl_close($ch);

		if($data){
			$data = json_decode($data, true);
			$access_token = $data['access_token'];
			return $access_token;

		}else{
			return array("state" => 200, "code" => "curl出错，错误代码：$error");
		}

	}


	// 退款
    function refund($order){

		global $dsql;

		$ordernum = $order['ordernum'];  //订单ID
		$orderamount = $order['orderamount'] * 100;  //订单总金额
		$amount = $order['amount'] * 100;  //退款金额
		$time = time();  //当前时间

		$token = self::getToken();

		if(is_array($token)){
			return $token;
		}

		//查询百度平台订单号、百度平台用户id
		$transaction_id = $icbc_orderid = '';
		if($order['service'] == 'shop'){
			$sql = $dsql->SetQuery("SELECT `transaction_id`, `icbc_orderid` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
		}else{
			$sql = $dsql->SetQuery("SELECT `transaction_id`, `icbc_orderid` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
		}
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$transaction_id = $ret[0]['transaction_id'];
			$icbc_orderid = $ret[0]['icbc_orderid'];
		}else{
			return array("state" => 200, "code" => "支付订单查询失败");
		}

		if(empty($transaction_id)){
			return array("state" => 200, "code" => "百度平台支付订单ID获取失败");
		}

		if(empty($icbc_orderid)){
			return array("state" => 200, "code" => "百度平台支付用户ID获取失败");
		}

		$params = array(
			'access_token' => $token,
			'applyRefundMoney' => $amount,
			'bizRefundBatchId' => "REFUND_" . create_ordernum(),
			'isSkipAudit' => 1,
			'orderId' => $transaction_id,
			'refundReason' => '申请退款',
			'refundType' => 1,
			'tpOrderId' => $ordernum,
			'userId' => $icbc_orderid
		);

		$url = "https://openapi.baidu.com/rest/2.0/smartapp/pay/paymentservice/applyOrderRefund";

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_POST, 1);
		curl_setopt($ch,CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch,CURLOPT_HEADER, 0);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 0);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, 0);//证书检查
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch,CURLOPT_TIMEOUT, 10);
        $data = curl_exec($ch);
		$error = curl_error($ch);
		curl_close($ch);

		if($data){
			$data = json_decode($data, true);
			if($data['errno'] == 0 && $data['msg'] == 'success'){
				return array("state" => 100, "date" => $time, "trade_no" => $data['data']['refundBatchId']);
			}else{
				return array("state" => 200, "code" => $data['msg']);
			}

		}else{
			return array("state" => 200, "code" => "curl出错，错误代码：$error");
		}


    }

}
