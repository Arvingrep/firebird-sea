<?php
/**
 * 抖音小程序在线支付主文件
 *
 * @version        $Id: bytemini.php $v1.0 2021-8-5 下午13:14:15 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "bytemini";

	/* 名称 */
    $payment[$i]['pay_name'] = "抖音小程序";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '抖音小程序专用支付方式，支持微信、支付宝';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => 'AppID',   'name' => 'appid', 'type' => 'text'),
		array('title' => 'AppSecret', 'name' => 'appsecret', 'type' => 'text'),
		array('title' => 'Token',   'name' => 'token', 'type' => 'text'),
		array('title' => 'SALT',    'name' => 'salt',  'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class bytemini {

    protected $appid;
    protected $token;
    protected $salt;

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
        $payment  = get_payment("bytemini");

		$this->appid = $payment['appid'];
		$this->token = $payment['token'];
        $this->salt = $payment['salt'];

        $this->bytemini();
    }

    function bytemini(){}

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

        //下单参数
        $valid_time = $order['service'] =='waimai' ? 1800 : 3600;
        $data = array(
            'out_order_no' => $order['order_sn'],  //开发者侧的订单号, 同一小程序下不可重复
            'total_amount' => (int)$order_amount,  //支付价格; 接口中参数支付金额单位为[分]
            'subject' => $order['subject'],  //商品描述; 长度限制 128 字节，不超过 42 个汉字
            'body' => $order['subject']."：".$order['order_sn'],  //商品详情
            'valid_time' => $valid_time,  //订单过期时间(秒); 最小 15 分钟，最大两天
            'notify_url' => $cfg_basehost_.'/api/payment/bytemini/notify.php',  //商户自定义回调地址
        );

		$parts = array();
		foreach ($data as $k => $v) {
			$parts[] = (string)$v;
		}
        $parts[] = $this->salt;
        sort($parts, SORT_STRING);
		$str = implode('&', $parts);
        $sign = md5($str);

        $data['app_id'] = $this->appid;
        $data['sign'] = $sign;

        $ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://developer.toutiao.com/api/apps/ecpay/v1/create_order');
		curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data) );
		curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:Application/json'));
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
		curl_setopt($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_TIMEOUT, 5);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$ret = curl_exec($ch);
		if($ret){
            curl_close($ch);

            $ret = json_decode($ret, true);

            //错误码
            $err_no = $ret['err_no'];

            if($err_no > 0){
                die('支付接口调用失败，错误信息：' . $err_no . ' => ' . $ret['err_tips']);
            }

            $_data = $ret['data'];
            $order_id = $_data['order_id'];
            $order_token = $_data['order_token'];

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
			$tpl = HUONIAOROOT."/api/payment/bytemini/";
			$templates = "pay.html";
			if(file_exists($tpl.$templates)){
				global $huoniaoTag;
				global $cfg_staticPath;
				$huoniaoTag->template_dir = $tpl;
				$huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
				$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
				$huoniaoTag->assign('returnUrl', $returnUrl);
				$huoniaoTag->assign('order_id', $order_id);
				$huoniaoTag->assign('order_token', $order_token);
				$huoniaoTag->display($templates);
			}

        }else{
			$error = curl_error($ch);
			curl_close($ch);
			print_r($error);
		}
        die;

    }


    function respond(){

        // require_once dirname(__FILE__)."/../log.php";
        // $_byteminiLog= new CLogFileHandler(HUONIAOROOT . '/log/bytemini/' . date('Y-m-d').'_retun.log', true);

        $str = file_get_contents("php://input");
        $strArr = json_decode($str, true);

        $timestamp = $strArr['timestamp'];
        $nonce = $strArr['nonce'];
        $msg_signature = $strArr['msg_signature'];
        $msg = $strArr['msg'];
        $msgArr = json_decode($msg, true);

        $dataArr = array(
            $this->token, $timestamp, $nonce, $msg
        );
        sort($dataArr, SORT_STRING);
        // $_byteminiLog->DEBUG("签名数据:" . json_encode($dataArr));

        $data = join('', $dataArr);
        // $_byteminiLog->DEBUG("签名结果:" . $data);
        $signature = sha1($data);  //验签

        // $_byteminiLog->DEBUG("signature:" . $signature);

        //验签成功
        if($msg_signature == $signature){
            $status = $msgArr['status'];  //PROCESSING-处理中|SUCCESS-成功|FAIL-失败|TIMEOUT-超时
            $channel_no = $msgArr['channel_no'];  //渠道单号
            $cp_orderno = $msgArr['cp_orderno'];  //开发者传入订单号
            $way = $msgArr['way'];  //支付渠道：2-支付宝，1-微信

            if($status == 'SUCCESS'){
                // $_byteminiLog->DEBUG("SUCCESS");
                order_paid($cp_orderno, $channel_no);
                return true;
            }else{
                // $_byteminiLog->DEBUG($status);
                return false;
            }
        }else{
            // $_byteminiLog->DEBUG("验签失败");
            return false;
        }
    }

}
