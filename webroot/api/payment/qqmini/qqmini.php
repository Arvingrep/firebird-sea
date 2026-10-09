<?php
/**
 * QQ小程序在线支付主文件
 *
 * @version        $Id: qqmini.php $v1.0 2020-12-24 下午17:43:26 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "qqmini";

	/* 名称 */
    $payment[$i]['pay_name'] = "QQ小程序";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = 'QQ小程序专用支付方式，支持度微信支付';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => 'AppID',        'name' => 'appid', 'type' => 'text'),
		array('title' => 'AppSecret',    'name' => 'secret', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class qqmini {

    protected $appid;
    protected $secret;

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){

		// 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("qqmini");

		$this->appid = $payment['appid'];
        $this->secret = $payment['secret'];

        $this->qqmini();
    }

    function qqmini(){}


	// 获取token
	function getToken(){

		$url = "https://api.q.qq.com/api/getToken?grant_type=client_credential&appid=".$this->appid."&secret=".$this->secret;

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
			if($data['errcode'] == 0){
				$access_token = $data['access_token'];
				return $access_token;
			}else{
				return array("state" => 200, "code" => $data['errmsg']);
			}

		}else{
			return array("state" => 200, "code" => "curl出错，错误代码：$error");
		}

	}


    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
		global $userLogin;
        global $dsql;
        $cfg_basehost_ = $cfg_secureAccess.$cfg_basehost;
        $notify_url_ = $cfg_basehost_.'/api/payment/wxpayNotify.php';

		// 加载支付方式操作函数
		loadPlug("payment");

		$order_amount = (sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100;

		$wxpayment = get_payment("wxpay");
		define('APPID', $wxpayment['APPID']);
		define('APPSECRET', $wxpayment['APPSECRET']);
		define('MCHID', $wxpayment['MCHID']);
		define('KEY', $wxpayment['KEY']);

		//获取accesstoken
		$token = self::getToken();
		if(is_array($token)){
			return $token;
		}

		$out_trade_no = $order['order_sn'];//平台内部订单号
		$nonce_str = MD5($out_trade_no);//随机字符串
		$body = $order['subject'];//内容
		$total_fee = $order_amount; //金额
		$spbill_create_ip = GetIP(); //IP
		$notify_url = "https://api.q.qq.com/wxpay/notify"; //回调地址
		$trade_type = 'MWEB';//交易类型 具体看API 里面有详细介绍
		$scene_info ='{"h5_info":{"type":"Wap","wap_url":"'.$cfg_basehost_.'","wap_name":"'.$cfg_shortname.'"}}';//场景信息 必要参数
		$signA ="appid=".APPID."&body=$body&mch_id=".MCHID."&nonce_str=$nonce_str&notify_url=$notify_url&out_trade_no=$out_trade_no&scene_info=$scene_info&spbill_create_ip=$spbill_create_ip&total_fee=$total_fee&trade_type=$trade_type";
		$strSignTmp = $signA."&key=".KEY; //拼接字符串  注意顺序微信有个测试网址 顺序按照他的来 直接点下面的校正测试 包括下面XML  是否正确
		$sign = strtoupper(MD5($strSignTmp)); // MD5 后转换成大写
		$post_data = "<xml>
					   <appid><![CDATA[".APPID."]]></appid>
					   <body><![CDATA[$body]]></body>
					   <mch_id><![CDATA[".MCHID."]]></mch_id>
					   <nonce_str><![CDATA[$nonce_str]]></nonce_str>
					   <notify_url><![CDATA[$notify_url]]></notify_url>
					   <out_trade_no><![CDATA[$out_trade_no]]></out_trade_no>
					   <scene_info><![CDATA[$scene_info]]></scene_info>
					   <spbill_create_ip><![CDATA[$spbill_create_ip]]></spbill_create_ip>
					   <total_fee><![CDATA[$total_fee]]></total_fee>
					   <trade_type><![CDATA[$trade_type]]></trade_type>
					   <sign><![CDATA[$sign]]></sign>
				   </xml>";//拼接成XML 格式
		$url = "https://api.q.qq.com/wxpay/unifiedorder?appid=".$this->appid."&access_token=".$token."&&real_notify_url=". urlencode($notify_url_);//微信传参地址

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL,$url);
		curl_setopt($ch, CURLOPT_HEADER,0);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$dataxml = curl_exec($ch);
		if ($dataxml === FALSE){
				echo 'cURL Error:'.curl_error($ch);
			}
		curl_close($ch);
		$objectxml = (array)simplexml_load_string($dataxml, 'SimpleXMLElement', LIBXML_NOCDATA); //将微信返回的XML 转换成数组

		//成功
		if($objectxml['return_code'] == 'SUCCESS' && $objectxml['result_code'] == 'SUCCESS'){
			$url = $objectxml['mweb_url'];

			if($order['service'] == "member"){
				if($payBody && is_array($payBody) && $payBody['type'] == 'join_pay'){
					$param = array(
					  "service"  => $order['service'],
					  "template" => "index"
					);
				}else{
					$param = array(
					  "service"  => $order['service'],
					  "type"     => "user",
					  "template" => "bill"
					);
				}
			}else{
				$param = array(
				  "service"  => $order['service'],
				  "template" => "payreturn",
				  "ordernum" => $order['order_sn']
				);
			}
			$returnUrl = getUrlPath($param);

			putSession('wxPayReturnUrl', $returnUrl);

			//配置页面信息
			$tpl = HUONIAOROOT."/api/payment/qqmini/";
			$templates = "pay.html";
			if(file_exists($tpl.$templates)){
				global $huoniaoTag;
				global $cfg_staticPath;
				$huoniaoTag->template_dir = $tpl;
				$huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
				$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
				$huoniaoTag->assign('returnUrl', $returnUrl);
				$huoniaoTag->assign('url', $url);
				$huoniaoTag->display($templates);
			}

		}else{
		  die('H5支付错误：' . $objectxml['return_code'] . " => " . $objectxml['return_msg']);
		}
		die;

    }

}
