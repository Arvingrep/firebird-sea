<?php
/**
 * YabandPay 支付
 *
 * @version        $Id: yabandpay_alipay.php $v1.0 2021-2-20 上午10:04:20 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "yabandpay_alipay";

	/* 名称 */
    $payment[$i]['pay_name'] = "YabandPay 支付宝";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '雅本传媒，荷兰数字新媒体行业的领先者，支持微信/支付宝多币种支付，接口文档：http://doc.yabandpay.com/web/#/6?page_id=114';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '收银员帐号',     'name' => 'user', 'type' => 'text'),
        array('title' => '密钥',           'name' => 'secret_key', 'type' => 'text'),
		array('title' => '货币',           'name' => 'currency', 'type' => 'select', 'options' => array(
			'EUR' => '欧元 - EUR',
			'CNY' => '人民币 - CNY',
			'HKD' => '港元 - HKD',
			'GBP' => '英镑 - GBP',
			'CHF' => '瑞士法郎 - CHF',
			'DKK' => '丹麦克朗 - DKK',
			'SEK' => '瑞典克朗 - SEK',
			'PLN' => '波兰兹罗提 - PLN',
			'NOK' => '挪威克朗 - NOK',
			'USD' => '美元	 - USD',
			'HUF' => '匈牙利福林 - HUF',
			'CZK' => '捷克克朗 - CZK'
		))
    );

    return;
}

/**
 * 类
 */
class yabandpay_alipay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->yabandpay_alipay();
    }

    function yabandpay_alipay(){}

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

		define('EST_user', $payment['user']);    //账号
		define('EST_secret_key', $payment['secret_key']);  //密钥
		define('EST_currency', $payment['currency']);  //币种

		// 加载支付方式操作函数
		loadPlug("payment");

		$order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);
		$paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

		//支付参数
		$bizRequestContent = array(
			'user'    => EST_user,
			'method'    => 'v3.CreatePayments',
			'time' => time(),
			'pay_method' => 'online',
			'sub_pay_method' => 'Alipay',  //WeChat Pay，Alipay，YabandPay
			'order_id' => $order['order_sn'],
			'amount' => $order_amount,
			'currency' => EST_currency,
			'description' => $order['subject']."：".$order['order_sn'],
			'timeout' => '0',
			'redirect_url' => return_url("yabandpay_alipay", $paramUrl),
			'notify_url' => notify_url("yabandpay_alipay", $paramUrl),
		);

		ksort($bizRequestContent); // 参数按字典顺序排序

		$parts = array();
		foreach ($bizRequestContent as $k => $v) {
			$parts[] = $k . '=' . $v;
		}
		$str = implode('&', $parts);

		$sign = hash_hmac("sha256", $str, EST_secret_key); //注：HMAC-SHA256签名方式

		$_param = $bizRequestContent;
		unset($_param['user']);
		unset($_param['method']);
		unset($_param['time']);

		$params = array(
			'user' => $bizRequestContent['user'],
			'sign' => $sign,
			'method' => $bizRequestContent['method'],
			'time' => $bizRequestContent['time'],
			'data' => $_param
		);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/yabandpay/'.date('Y-m-d').'-create.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params));

		$httpHeader = array();
		$httpHeader[] = 'Content-Type:Application/json';

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://mapi.yabandpay.com/Payments');
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
			$_yabandPay->DEBUG("Result：" . json_encode($data));

			if($data['status'] && $data['code'] == 200){

				//更新transaction_id
				$trade_id = $data['data']['trade_id'];
				$sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `transaction_id` = '$trade_id' WHERE `ordernum` = '".$order["order_sn"]."'");
				$dsql->dsqlOper($sql, "update");

				header('location:' . $data['data']['url']);

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
        $payment  = get_payment("yabandpay_alipay");

        $order_sn = $_GET['sn'];

		define('EST_user', $payment['user']);    //账号
		define('EST_secret_key', $payment['secret_key']);  //密钥
		define('EST_currency', $payment['currency']);  //币种

		//根据订单号查询trade_id
		$trade_id = '';
		$sql = $dsql->SetQuery("SELECT `transaction_id` FROM `#@__pay_log` WHERE `ordernum` = '$order_sn'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$trade_id = $ret[0]['transaction_id'];
		}else{
			return false;
		}

        if(!$trade_id){
            return false;
        }

		//支付参数
		$bizRequestContent = array(
			'user'    => EST_user,
			'method'    => 'v3.QueryOrder',
			'time' => time(),
			'trade_id' => $trade_id
		);

		ksort($bizRequestContent); // 参数按字典顺序排序

		$parts = array();
		foreach ($bizRequestContent as $k => $v) {
			$parts[] = $k . '=' . $v;
		}
		$str = implode('&', $parts);

		$sign = hash_hmac("sha256", $str, EST_secret_key); //注：HMAC-SHA256签名方式

		$_param = $bizRequestContent;
		unset($_param['user']);
		unset($_param['method']);
		unset($_param['time']);

		$params = array(
			'user' => $bizRequestContent['user'],
			'sign' => $sign,
			'method' => $bizRequestContent['method'],
			'time' => $bizRequestContent['time'],
			'data' => $_param
		);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/yabandpay/'.date('Y-m-d').'-respond.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params));

		$httpHeader = array();
		$httpHeader[] = 'Content-Type:Application/json';

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://mapi.yabandpay.com/Payments');
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
			$_yabandPay->DEBUG("Result：" . json_encode($data));

			if($data['status'] && $data['code'] == 200){

				$transaction_info = $data['data']['transaction_info'];
				$state = $transaction_info['state'];
				if($state == 'paid'){
					order_paid($order_sn, $trade_id);
					return true;
				}else{
					return false;
				}


			}else{
				return false;
				die($data['message']);
			}
		}else{
			$error = curl_error($ch);
			curl_close($ch);
			return false;
		}

    }

}
