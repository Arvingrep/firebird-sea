<?php
/**
 * XorPay 支付宝
 *
 * @version        $Id: xorpay_alipay.php $v1.0 2024-4-10 下午17:54:31 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "xorpay_alipay";

	/* 名称 */
    $payment[$i]['pay_name'] = "支付宝个人收款";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '「XorPay」作为 微信支付服务商 和 支付宝系统服务商ISV 专业为开发者 / 个体户 / 小微企业提供正规、安全、稳定的创收支持，该支付方式支持【PC电脑端、APP端、手机浏览器端】，官网：https://xorpay.com';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => 'aid',     'name' => 'aid', 'type' => 'text'),
        array('title' => 'app secret',           'name' => 'secret', 'type' => 'text'),
    );

    return;
}

/**
 * 类
 */
class xorpay_alipay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->xorpay_alipay();
    }

    function xorpay_alipay(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $currency_rate;
		global $userLogin;

		define('aid', $payment['aid']);    //aid
		define('secret', $payment['secret']);  //app secret

		// 加载支付方式操作函数
		loadPlug("payment");

		$order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);
		$paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];
		$redirect_url = return_url("xorpay_alipay", $paramUrl);
		$notify_url = notify_url("xorpay_alipay", $paramUrl);

        $subject = $order['subject'];
        $order_sn = $order['order_sn'];

        $order_uid = '';
        if($userLogin->getMemberID() > 0){
            $userinfo = $userLogin->getMemberInfo();
            $order_uid = $userinfo['nickname'];
        }

        $pay_type = 'alipay';

        $sign = $this->sign(array($subject, $pay_type, $order_amount, $order_sn, $notify_url, secret));

        $params = array(
            'name' => $subject,
            'pay_type' => $pay_type,
            'price' => $order_amount,
            'order_id' => $order_sn,
            'order_uid' => $order_uid,
            'notify_url' => $notify_url,
            'sign' => $sign
        );

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/xorpay_alipay/'.date('Y-m-d').'-create.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params, JSON_UNESCAPED_UNICODE));

        $ret = hn_curl('https://xorpay.com/api/pay/' . aid, $params);
        $ret = json_decode($ret, true);

        if($ret['status'] == 'ok'){
            $info = $ret['info'];
            header('location:' . $info['qr']);
        }
        else{
            echo $ret['status'];
        }        
        die;

    }


    /**
     * 响应操作
     */
    function respond(){
		global $dsql;

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("xorpay_alipay");

        $order_sn = $_POST['order_id'];

		define('aid', $payment['aid']);    //aid
		define('secret', $payment['secret']);  //app secret

        //初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/xorpay_alipay/'.date('Y-m-d').'-respond.log', true);

        //签名
        $sign = $this->sign(array($_POST['aoid'], $_POST['order_id'], $_POST['pay_price'], $_POST['pay_time'], secret));

        //对比签名
        if($sign == $_POST['sign']) {
            $_yabandPay->DEBUG("支付回调验证成功");
            order_paid($order_sn, $_POST['aoid']);
            return true;
        } else {
            $_yabandPay->DEBUG("支付回调验证失败");
            return false;
        };

    }

    function sign($data_arr){
        return md5(join('',$data_arr));
    }

}
