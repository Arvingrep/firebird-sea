<?php
/**
 * 微信扫码支付主文件
 *
 * @version        $Id: wxpay.php $v1.0 2015-12-10 下午23:35:11 $
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
class wxpayRefund {

  /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $appId;
    public $mch_id;
    public $key;
    public $app_appId;
    public $app_mch_id;
    public $app_key;
    public $partner_mch_id;
    public $partner_key;
    public $rsaPrivateKey;
    public $wxpayrsaPublicKey;

    function __construct(){
        $this->wxpayRefund();
    }

    function wxpayRefund(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("wxpay");

        $this->appId = $payment['APPID'];
        $this->mch_id = $payment['MCHID'];
        $this->key = $payment['KEY'];

        $this->app_appId = $payment['APP_APPID'];
        $this->app_mch_id = $payment['APP_MCHID'];
        $this->app_key = $payment['APP_KEY'];

        $this->partner_mch_id = $payment['PARTNER_MCHID'];  //服务商商户号
        $this->partner_key = $payment['PARTNER_KEY'];  //服务商平台 API密钥(KEY)
    }

    function refund($order, $app = false){

        global $dsql;

        if($app){
            $appId = $this->app_appId;
            $mch_id = $this->app_mch_id;
            $key = $this->app_key;
        }else{
            $appId = $this->appId;
            $mch_id = $this->mch_id;
            $key = $this->key;
        }

        $date = GetMkTime(time());
        // 随机数
        $nonce_str = genSecret(16, 2);

        // ----------订单信息
        // 交易号
        $trade_no = "";
        // 商户订单号
        $out_trade_no = $order['ordernum'];
        // 退款金额
        $refund_amount = $order['amount'] * 100;
        //订单总金额
        $total_fee     = $order['orderamount'] * 100;
        // 退款单号
        $out_refund_no = date('YmdHis').$out_trade_no;

        //根据订单号查询商家信息，确定是否开通特约商户
        $module = $submchid = '';
        $sql = $dsql->SetQuery("SELECT `ordertype` FROM `#@__pay_log` WHERE `ordernum` = '$out_trade_no'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $module = $ret[0]['ordertype'];
            $submchid = getWxpaySubMchid($module, $out_trade_no, 0);
        }

        //服务商配置
        if($submchid){
            $mch_id = $this->partner_mch_id;
            $key = $this->partner_key;
        }
        
        $refund = array(
            'appid' => $appId,                  //应用ID，固定
            'mch_id' => $mch_id,                //商户号，固定
            'nonce_str' => $nonce_str,          //随机字符串
            'out_refund_no' => $out_refund_no,  //商户内部唯一退款单号
            'out_trade_no' => $out_trade_no,    //商户订单号,pay_sn码 1.1二选一,微信生成的订单号，在支付通知中有返回
            // 'transaction_id'=>'1',//微信订单号 1.2二选一,商户侧传给微信的订单号
            'refund_fee' => $refund_amount,     //退款金额
            'total_fee' => $total_fee     //总金额
        );

        if($submchid){
            $refund['sub_mch_id'] = $submchid;
        }

        ksort($refund);

        $stringA = "";
        foreach ($refund as $k => $v) {
            $stringA = $stringA.$k."=".$v."&";
        }

        $stringSignTemp = $stringA."key=".$key; //注：key为商户平台设置的密钥key

        $sign = strtoupper(MD5($stringSignTemp)); //注：MD5签名方式
        // $sign = hash_hmac("sha256", $stringSignTemp, $key); //注：HMAC-SHA256签名方式

        $refund['sign'] = $sign;

        $url = "https://api.mch.weixin.qq.com/secapi/pay/refund";;//微信退款地址，post请求
        $xml = arrayToXml($refund);

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL,$url);
        curl_setopt($ch,CURLOPT_HEADER,1);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER,0);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,0);//证书检查
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_SSLCERT,dirname(__FILE__).'/cert'. ($submchid ? '/partner' : ($app ? '/app' : '')) .'/apiclient_cert.pem');
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_SSLKEY,dirname(__FILE__).'/cert'. ($submchid ? '/partner' : ($app ? '/app' : '')) .'/apiclient_key.pem');
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'pem');
        curl_setopt($ch,CURLOPT_CAINFO,dirname(__FILE__).'/cert'. ($submchid ? '/partner' : ($app ? '/app' : '')) .'/rootca.pem');
        curl_setopt($ch,CURLOPT_POST,1);
        curl_setopt($ch,CURLOPT_POSTFIELDS,$xml);
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT , 5);
        curl_setopt($ch,CURLOPT_TIMEOUT, 10);

        $data = curl_exec($ch);


        //返回来的是xml格式需要转换成数组再提取值，用来做更新
        if($data){
        //初始化日志
            require_once dirname(__FILE__)."/../log.php";
			$_weixinRefund = new CLogFileHandler(HUONIAOROOT . '/log/weixinRefund/'.date('Y-m-d').'.log', true);
            $_weixinRefund->DEBUG($data);
            $_weixinRefund->DEBUG(json_encode($refund));
            $_weixinRefund->DEBUG("\r\n");

            $data = strstr($data, "<xml");

            if($app){
                // echo $data;
                // return array("state" => 200, "code" => "退款失败，请稍后重试");
            }

            $r = false;
            $errcode = "";

            $p = xml_parser_create();
            $parse = xml_parse_into_struct($p, $data, $vals, $title);
            xml_parser_free($p);


            foreach ($title as $k => $value) {
                $k = strtoupper($k);
                $res = $vals[$value[0]]['value'];
                $$k = strtoupper($res);
            }

            // 请求结果
            if($RETURN_CODE == "SUCCESS"){

                // 业务结果 退款申请接收成功
                if($RESULT_CODE == "SUCCESS"){
                    return array("state" => 100, "date" => $date, "trade_no" => $out_refund_no);

                }else{
                    // ORDERNOTEXIST : 订单不存在，使用APP配置
                    if($ERR_CODE == "ORDERNOTEXIST" && !$app){
                        return $this->refund($order, true);
                    }else{
                        if($ERR_CODE_DES == '订单已全额退款'){
                            return array("state" => 100, "date" => $date, "trade_no" => $out_refund_no);
                        }else{
                            return array("state" => 200, "code" => "$ERR_CODE_DES - $RETURN_MSG 订单号：$out_trade_no 金额：".$refund_amount/100);
                        }
                    }
                }
            }else{
                curl_close($ch);
                return array("state" => 200, "code" => "$RETURN_MSG");
            }
        }else{
            $error = curl_error($ch);
            curl_close($ch);
            return array("state" => 200, "code" => "curl出错，错误代码：$error");
        }



    }

}

function arrayToXml($arr){
    $xml = "<root>";
    foreach ($arr as $key=>$val){
        if(is_array($val)){
            $xml.="<".$key.">".arrayToXml($val)."</".$key.">";
        }else{
            $xml.="<".$key.">".$val."</".$key.">";
        }
    }
    $xml.="</root>";
    return $xml ;
}
