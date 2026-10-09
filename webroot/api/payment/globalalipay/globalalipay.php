<?php
/**
 * 支付宝国际版在线支付主文件
 *
 * @version        $Id: globalalipay.php $v1.0 2017-10-25 下午15:18:20 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "globalalipay";

	/* 名称 */
    $payment[$i]['pay_name'] = "支付宝国际版在线支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = 'Alipay, China\'s leading third-party online payment solution.';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => '合作伙伴身份（PID）', 'name' => 'partner', 'type' => 'text'),
        array('title' => 'MD5密钥', 'name' => 'key', 'type' => 'text'),
    		array('title' => '支付货币', 'name' => 'currency', 'type' => 'select', 'options' => array(
          'USD' => '美元 - USD',
          'AUD' => '澳元 - AUD',
          'CAD' => '加元 - CAD',
          'CHF' => '瑞士法郎 - CHF',
          'DKK' => '丹麦克朗 - DKK',
          'EUR' => '欧元 - EUR',
          'GBP' => '英镑 - GBP',
          'HKD' => '港元 - HKD',
          'JPY' => '日元 - JPY',
          'NOK' => '挪威克朗 - NOK',
          'NZD' => '新西兰元 - NZD',
          'SGD' => '新加坡元 - SGD',
          'SEK' => '瑞典克朗 - SEK',
          'THB' => '泰铢 - THB',
        ))
    );

    return;
}

/**
 * 类
 */
class globalalipay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->globalalipay();
    }

    function globalalipay(){}

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

        // 加载支付方式操作函数
        loadPlug("payment");

        $service = "create_forex_trade";

        //无线支付
        if(isMobile()){
            $service = 'create_forex_trade_wap';
        }

        $paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

        $order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);

        //构造要请求的参数数组，无需改动
        $parameter = array(
        		"service" => $service,
        		"partner" => $payment['partner'],
        		"out_trade_no"	=> $order['order_sn'],
        		"currency"	=> $payment['currency'],
        		"subject"	=> $order['subject'],
        		"body"	=> $order['subject']."：".$order['order_sn'],
        		"rmb_fee"	=> $order_amount,
            'notify_url' => notify_url("globalalipay", $paramUrl),       //服务器异步通知页面路径
            'return_url' => return_url("globalalipay", $paramUrl),       //页面跳转同步通知页面路径
        		"_input_charset"	=> 'utf-8'
        );


        ksort($parameter);
        reset($parameter);

        $param = array();
        $sign  = '';

        foreach ($parameter as $key => $val){
            $param[$key] = $val;
            $sign  .= "$key=$val&";
        }

        $sign  = substr($sign, 0, -1). $payment['key'];
        return $this->create_html($param, md5($sign));
    }

	/**
	 * 生成跳转表单
	 */
	function create_html($param, $sign){
		global $cfg_soft_lang;
        $html = <<<eot
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=$cfg_soft_lang" />
</head>
<body onload="javascript:document.pay_form.submit();">
  <form id="pay_form" name="pay_form" action="https://mapi.alipay.com/gateway.do?_input_charset=utf-8" method="get">

eot;
        foreach ($param as $key => $value) {
            $html .= "    <input type=\"hidden\" name=\"{$key}\" value=\"{$value}\" />\n";
        }
		$html .= "    <input type=\"hidden\" name=\"sign\" value=\"{$sign}\" />\n";
		$html .= "    <input type=\"hidden\" name=\"sign_type\" value=\"MD5\" />\n";
        $html .= <<<eot
    <input type="submit" type="hidden" style="display:none;">
  </form>
</body>
</html>
eot;
		return $html;
    }

    /**
     * 响应操作
     */
    function respond(){

        // 加载支付方式操作函数
        loadPlug("payment");

        $payment  = get_payment("globalalipay");

        /* GET */
        foreach($_GET as $k => $v) {
          $_GET[$k] = $v;
        }
        /* POST */
        foreach($_POST as $k => $v) {
          $_GET[$k] = $v;
        }

        $order_sn = $_GET['out_trade_no'];

        /* 检查支付的金额是否相符 */
        // 国际版支付宝返回的是经过转换过的金额，无法与人民币金额进行对比
      //   if (!check_money($order_sn, $_GET['total_fee'])){
      //      return false;
      //  }

        /* 检查数字签名是否正确 */
        ksort($_GET);
        reset($_GET);

        $sign = '';
        foreach ($_GET AS $key=>$val){
            if ($key != 'sign' && $key != 'sign_type' && $key != 'code' && $key != 'module' && $key != 'sn' && $key != ''){
                $sign .= "$key=$val&";
            }
        }

        $sign = substr($sign, 0, -1) . $payment['key'];

        if (md5($sign) != $_GET['sign']){
            return false;
        }

        //买家付款，等待卖家发货
        if ($_GET['trade_status'] == 'WAIT_SELLER_SEND_GOODS'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

        //交易完成
        }elseif ($_GET['trade_status'] == 'TRADE_FINISHED'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

        //支付成功
        }elseif ($_GET['trade_status'] == 'TRADE_SUCCESS'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

        }else{
            return false;
        }
    }

}
