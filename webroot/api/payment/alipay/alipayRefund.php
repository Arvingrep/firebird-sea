<?php
/**
 * 支付宝退款主文件
 *
 * @version        $Id: alipay.php $v1.0 2014-3-12 下午17:19:21 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');



/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "alipay";

	/* 名称 */
    $payment[$i]['pay_name'] = "支付宝退款";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '国内先进的网上支付平台。三种支付接口：担保交易，即时到账，双接口。在线即可开通，零预付，免年费，单笔阶梯费率，无流量限制。';

    /* 作者 */
    $payment[$i]['author']   = '火鸟软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.huoniao.co';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        'title' => '网页支付',
		'title' => '支付宝帐户'
    );

    return;
}

/**
 * 类
 */
class alipayRefund {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $appId;

    public $rsaPrivateKey;

    public $alipayrsaPublicKey;

    function __construct(){
        $this->alipayRefund();
    }

    function alipayRefund(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("alipay");

        $this->appId = $payment['appid'];

        $this->rsaPrivateKey = $payment['appPrivate'];

        $this->alipayrsaPublicKey = $payment['alipayPublic'];

        $this->partner_appid = $payment['partner_appid'];

        $this->partner_rsaPrivateKey = $payment['partner_appPrivate'];

    }

    function refund($order){
        global $dsql;

        include_once('aop/AopCertClient.php');
        include_once('aop/request/AlipayTradeRefundRequest.php');

        $appId = $this->appId;
        $rsaPrivateKey = $this->rsaPrivateKey;

        // ----------订单信息
        // 交易号
        $trade_no = "";
        // 商户订单号
        $out_trade_no = $order['ordernum'];
        // 退款金额
        $refund_amount = $order['amount'];
        global $cfg_shortname;
        $desc = $cfg_shortname . "退款";

        // 标志一次退款请求 格式为：退款日期（8位）+流水号（3～24位）。不可重复，且退款日期必须是当天日期。流水号可以接受数字或英文字符，建议使用数字，但不可接受“000”
        $out_request_no = date('YmdHis').$out_trade_no;

        //证书路径
        $certPath = dirname(__FILE__) . "/cert/";

        //根据订单号查询商家信息，确定是否开通特约商户
        $module = '';
        $alipay_app_auth_token = null;
        $sql = $dsql->SetQuery("SELECT `ordertype` FROM `#@__pay_log` WHERE `ordernum` = '$out_trade_no'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $module = $ret[0]['ordertype'];
            $alipaySubMchInfo = getWxpaySubMchid($module, $out_trade_no, 1);
            $alipay_pid = $alipaySubMchInfo['alipay_pid'];
            $alipay_app_auth_token = $alipaySubMchInfo['alipay_app_auth_token'];

            //用服务商模式
            if($alipay_pid && $alipay_app_auth_token){
                $appId = $this->partner_appid;
                $rsaPrivateKey = $this->partner_rsaPrivateKey;
                $certPath .= "partner/";
            }
        }

        //应用证书路径
        $appCertPath = $certPath . "appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = $certPath . "alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = $certPath . "alipayRootCert.crt";

        /** 初始化 **/
        $aop = new AopCertClient;

        /** 支付宝网关 **/
        $aop->gatewayUrl = "https://openapi.alipay.com/gateway.do";

        /** 应用id,如何获取请参考：https://opensupport.alipay.com/support/helpcenter/190/201602493024 **/
        $aop->appId = $appId;

        /** 密钥格式为pkcs1，如何获取私钥请参考：https://opensupport.alipay.com/support/helpcenter/207/201602469554 **/
        $aop->rsaPrivateKey = $rsaPrivateKey;

        /** 设置签名类型 **/
        $aop->signType= "RSA2";

        /** 设置请求格式，固定值json **/
        $aop->format = "json";

        /** 设置编码格式 **/
        $aop->charset= "utf-8";

        /** 调用getPublicKey从支付宝公钥证书中提取公钥 **/
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);

        /** 是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内 **/
        $aop->isCheckAlipayPublicCert = true;

        /** 调用getCertSN获取证书序列号 **/
        $aop->appCertSN = $aop->getCertSN($appCertPath);

        /** 调用getRootCertSN获取支付宝根证书序列号 **/
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        /** 实例化具体API对应的request类，类名称和接口名称对应，当前调用接口名称：alipay.trade.refund（统一收单交易退款接口）**/
        $request = new AlipayTradeRefundRequest();

        $request->setBizContent("{" .

        /** 支付接口传入的商户订单号。如：2020061601290011200000140004 **/
        "\"out_trade_no\":\"" . $out_trade_no . "\"," .

        /** 退款金额，退款总金额不能大于该笔订单支付最大金额 **/
        "\"refund_amount\":" . $refund_amount . "," .

        /** 异步通知/查询接口返回的支付宝交易号，如：2020061622001473951448314322 **/
        // "\"trade_no\":\"2020061622001473951448314322\"," .

        /** 如需部分退款，则此参数必传，且每次请求不能重复，如：202006230001 **/
        "\"out_request_no\":\"" . $out_request_no . "\"," .

        /** 备注 **/
        "\"remark\":\"" . $desc . "\"" .

        "}");

        $result = $aop->execute ($request, null, $alipay_app_auth_token);

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $resultCode = $result->$responseNode->code;
        $sub_code = $result->$responseNode->sub_code;
        if(!empty($resultCode) && $resultCode == 10000){
            return array("state" => 100, "date" => $result->$responseNode->gmt_refund_pay, "trade_no" => $out_request_no);
        } else {
            return array("state" => 200, "code" => "$resultCode - $sub_code 订单号：$out_trade_no 金额：$refund_amount");
        }


    }

}
