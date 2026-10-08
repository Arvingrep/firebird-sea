<?php
/**
 * XorPay 支付宝
 *
 * @version        $Id: allinpay_alipay.php $v1.0 2024-4-10 下午17:54:31 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "allinpay_alipay";

	/* 名称 */
    $payment[$i]['pay_name'] = "支付宝";

	/* 所属公司 */
    $payment[$i]['title'] = "通联支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '通联支付网络服务股份有限公司（简称“通联支付”）成立于2008年10月，总部位于上海，拥有支付业务许可，官网：https://www.allinpay.com/';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '支付平台',     'name' => 'paytype', 'type' => 'text',  'class' => 'input-small', 'description' => '默认为：alipay'),
		array('title' => '商户号',     'name' => 'cusid', 'type' => 'text'),
        array('title' => 'appid',     'name' => 'appid', 'type' => 'text'),
        array('title' => '通联RSA公钥',    'name' => 'rsa_public_key', 'type' => 'textarea'),
        array('title' => 'RSA私钥',    'name' => 'rsa_private_key', 'type' => 'textarea'),
    );

    return;
}

/**
 * 类
 */
class allinpay_alipay {

    protected $signer;
    
	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
		require_once HUONIAOINC . "/class/RSASign.class.php";
        $this->signer = $signer ?: new RSASign();
    }

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $currency_rate;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $app;  //是否为客户端app支付

		$order_amount = (int)((sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100);  //单位为分
		$notify_url = $cfg_secureAccess.$cfg_basehost.'/api/payment/allinpayNotify.php';  //交易结果通知地址

        $subject = $order['subject'];  //订单名称
        $order_sn = $order['order_sn'];  //订单号

        // 交易方式
        // A01	支付宝扫码支付
        // A02	支付宝JS支付
        // A03	支付宝APP支付
        $paytype = 'A01';

        if($app){
            // $paytype = 'A02';
        }

        //拼接支付参数
        $params = [
            'cusid'  => $payment['cusid'],  //商户号
            'appid'  => $payment['appid'],  //应用ID
			'trxamt' => $order_amount,  //交易金额
            'reqsn'  => $order_sn, //商户订单号
            'paytype' => $paytype, //交易方式
            'randomstr' => time().rand('10000','99999'),  //请求随机串
            'body' => $subject,  //订单标题
            'validtime' => 30,  //订单有效时间，以分为单位，不填默认为5分钟
            'expiretime' => date('YmdHis', strtotime("+30 minutes")),  //截止支付时间  yyyyMMddHHmmss
            'notify_url' => $notify_url,  //交易结果通知地址
            'signtype' => 'RSA',  //签名方式
        ];

        //APP端
        if($app){
            // $params['version'] = "12";
        }

        //生成签名
        $sign = $this->signer->sign($params, $payment['rsa_private_key']);

        $params['sign'] = $sign;  //签名

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_allinpay_alipay = new CLogFileHandler(HUONIAOROOT . '/log/allinpay_alipay/'.date('Y-m-d').'.log', true);
		$_allinpay_alipay->DEBUG("报文：" . json_encode($params, JSON_UNESCAPED_UNICODE));

        //APP端支付需要使用通联支付收银台，前端跳转到支付宝APP的小程序中进行支付
        if($app){
            // return $params;
        }

        //接口地址：https://vsp.allinpay.com/apiweb/unitorder/pay
        //测试地址：https://syb-test.allinpay.com/apiweb/unitorder/pay
        $ret = hn_curl('https://vsp.allinpay.com/apiweb/unitorder/pay', $params);
        $ret = json_decode($ret, true);

		$_allinpay_alipay->DEBUG("接口返回：" . json_encode($ret, JSON_UNESCAPED_UNICODE));

        if(!isset($ret['retmsg'])) {
            $payinfo = $ret['payinfo'];

            if($app){
                die(json_encode(array('state' => 100, 'info' => $payinfo)));
            }

            header('location:' . $payinfo);
        }
        else{
            echo $ret['retmsg'];
        }
        die;

    }

    //验证签名
    function validSign(array $array){

        loadPlug("payment");
        $payment = get_payment("allinpay_alipay");

        $sign = $array['sign'];
        $array['rsaSign'] = $sign;
        unset($array['sign']);

        $result = $this->signer->checkSign($array, $payment['rsa_public_key']);

        return $result;  
	}

    //退款
    function refund($order){

        global $dsql;

        loadPlug("payment");
        $payment = get_payment("allinpay_alipay");

		$ordernum = $order['ordernum'];  //订单ID
		$orderamount = $order['orderamount'] * 100;  //订单总金额
		$amount = $order['amount'] * 100;  //退款金额
		$time = time();  //当前时间
        

        //拼接支付参数
        $params = [
            'cusid'  => $payment['cusid'],  //商户号
            'appid'  => $payment['appid'],  //应用ID
			'trxamt' => $amount,  //退款金额	
            'reqsn'  => create_ordernum(), //商户退款订单号
            'oldreqsn'  => $ordernum, //原交易订单号
            'randomstr' => time().rand('10000','99999'),  //请求随机串
            'signtype' => 'RSA',  //签名方式
        ];

        //生成签名
        $sign = $this->signer->sign($params, $payment['rsa_private_key']);

        $params['sign'] = $sign;  //签名

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/allinpay_refund/'.date('Y-m-d').'.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params, JSON_UNESCAPED_UNICODE));

        //接口地址：https://vsp.allinpay.com/apiweb/tranx/refund
        //测试地址：https://syb-test.allinpay.com/apiweb/tranx/refund
        $ret = hn_curl('https://vsp.allinpay.com/apiweb/tranx/refund', $params);
        $ret = json_decode($ret, true);

        if(!isset($ret['retmsg'])) {
            $chnltrxid = $ret['chnltrxid'];  //渠道流水号，如支付宝，微信平台订单号，注意，此流水号非通联原交易流水
            return array("state" => 100, "date" => $time, "trade_no" => $chnltrxid);
        }
        else{
            return array("state" => 200, "code" => "退款失败：" . $ret['retmsg']);
        }

    }

}
