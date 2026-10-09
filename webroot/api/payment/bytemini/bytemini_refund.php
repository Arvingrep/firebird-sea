<?php
/**
 * 抖音退款接口
 *
 * @version        $Id: refund.php $v1.0 2021-08-05 下午18:10:16 $
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
class bytemini_refund {

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $appid;
    public $token;
    public $salt;

    function __construct(){
        $this->bytemini_refund();
    }

    function bytemini_refund(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("bytemini");

        $this->appid = $payment['appid'];
        $this->token = $payment['token'];
        $this->salt   = $payment['salt'];
    }

    function refund($order){

        global $dsql;

        // 退款单号
        $out_refund_no = date('YmdHis').$out_trade_no;

        //下单参数
        $data = array(
            'out_order_no' => $order['ordernum'],  //商户分配订单号，标识进行退款的订单
            'out_refund_no' => $out_refund_no,  //商户分配退款号
            'reason' => '退款',  //退款原因
            'refund_amount' => ($order['amount'] * 100),  //退款金额，单位[分]
            'notify_url' => $cfg_basehost_.'/api/payment/bytemini/refund_notify.php',  //商户自定义回调地址
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
		curl_setopt($ch, CURLOPT_URL, 'https://developer.toutiao.com/api/apps/ecpay/v1/create_refund');
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

            if($ret['err_no'] == 0){
                return array("state" => 100, "date" => GetMkTime(time()), "refundOrderNo" => $data['refund_no']);
            }else{
                return array("state" => 200, "code" =>$ret['err_tips']);
            }

        }else{
			$error = curl_error($ch);
			curl_close($ch);
            return array("state" => 200, "code" => "退款接口请求错误，退款失败！");
		}
        die;

    }

}
