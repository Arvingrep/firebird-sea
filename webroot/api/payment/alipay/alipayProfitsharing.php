<?php
/**
 * 支付宝分账
 *
 * @version        $Id: alipayProfitsharing.php $v1.0 2022-2-22 下午18:26:44 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2022, HuoNiao, Inc.
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
class alipayProfitsharing {

  /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $APPID;
    public $MCHID;
    public $KEY;

    function __construct(){
        $this->alipayProfitsharing();
    }

    function alipayProfitsharing(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("alipay");

        $this->appId = $payment['appid'];
		$this->partner = $payment['partner'];
        $this->rsaPrivateKey = $payment['appPrivate'];
        $this->alipayrsaPublicKey = $payment['alipayPublic'];
        $this->partner_appid = $payment['partner_appid'];
        $this->partner_appPrivate = $payment['partner_appPrivate'];

    }

    function profitsharing($order){
		global $dsql;

		$bid = $order['bid'];  //商家ID
		$ordertitle = $order['ordertitle'];  //原订单信息
		$ordernum = $order['ordernum'];  //原订单号
		$orderdata = serialize($order['orderdata']);  //原订单内容
		$totalAmount = $order['totalAmount'];  //原订单金额
		$amount = $order['amount'];  //分账金额
		$transaction_id = $order['transaction_id'];  //支付宝支付成功订单号
		$alipay_pid = $order['alipay_pid'];  //支付宝商家PID
		$alipay_app_auth_token = $order['alipay_app_auth_token'];  //支付宝商家应用授权令牌
		$time = time();  //当前时间
		

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_alipayPartnerLog = new CLogFileHandler(HUONIAOROOT . '/log/alipayPartner/'.date('Y-m-d').'-profitsharing.log', true);
		$_alipayPartnerLog->DEBUG("分账订单：" . json_encode($order));

		$seqNo = $transaction_id ? $transaction_id : create_ordernum();

		//判断是否已有记录
		$sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__business_shareallocation` WHERE `seqNo` = '$seqNo' AND `bid` = $bid AND `ordernum` = '$ordernum'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			if($ret[0]['state'] == 0){
				$sql = $dsql->SetQuery("DELETE FROM `#@__business_shareallocation` WHERE `seqNo` = '$seqNo' AND `bid` = $bid AND `ordernum` = '$ordernum' AND `state` = 0");
				$dsql->dsqlOper($sql, "update");
			}else{
				return;
			}
		}

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayTradeRoyaltyRelationBindRequest.php");
        require_once ("aop/request/AlipayTradeOrderSettleRequest.php");

        $appId = $this->partner_appid;
		$partner = $this->partner;
        $rsaPrivateKey = $this->partner_appPrivate;
        $alipayrsaPublicKey = $this->alipayrsaPublicKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/partner/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/partner/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/partner/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayTradeRoyaltyRelationBindRequest ();
        $request->setBizContent("{" .
        "  \"receiver_list\":[" .
        "    {" .
        "      \"type\":\"userId\"," .
        "      \"account\":\"".$partner."\"" .
        "    }" .
        "  ]," .
        "  \"out_request_no\":\"".md5(create_ordernum())."\"" .
        "}");

        $result = $aop->execute($request, null, $alipay_app_auth_token);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";

		$_alipayPartnerLog->DEBUG("分账关系绑定结果：" . json_encode($result->$responseNode));

        
        //开始分账
		$request = new AlipayTradeOrderSettleRequest ();
		$request->setBizContent("{" .
		"  \"out_request_no\":\"".md5(create_ordernum())."\"," .
		"  \"trade_no\":\"".$transaction_id."\"," .
		"  \"royalty_parameters\":[" .
		"    {" .
		"      \"royalty_type\":\"transfer\"," .
		"      \"trans_out\":\"".$alipay_pid."\"," .
		"      \"trans_out_type\":\"userId\"," .
		"      \"trans_in_type\":\"userId\"," .
		"      \"trans_in\":\"".$partner."\"," .
		"      \"amount\":".$amount."," .
		"      \"desc\":\"".$ordertitle."\"" .
		"    }" .
		"  ]," .
		"  \"extend_params\":{" .
		"    \"royalty_finish\":\"true\"" .
		"  }," .
		"  \"royalty_mode\":\"async\"" .
		"}");
		$result = $aop->execute ( $request, null, $alipay_app_auth_token); 

		$responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
		$resultCode = $result->$responseNode->code;

        $_alipayPartnerLog->DEBUG("分账结果：" . json_encode($result->$responseNode));

		$state = 0;
		$info = '';
		if(!empty($resultCode)&&$resultCode == 10000){
			$state = 1;
			$info = '分账成功';
			$subOrderTrxid = $result->$responseNode->settle_no;
		} else {
			$info = $result->$responseNode->sub_msg;
		}

		//记录
		$sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('alipay', '$bid', '$ordertitle', '$ordernum', '$orderdata', '$totalAmount', '$amount', '$alipay_pid', '$alipay_app_auth_token', '$seqNo', '', '$subOrderTrxid', '$time', '$state', '$info')");
		$dsql->dsqlOper($sql, "update");

		$_alipayPartnerLog->DEBUG("分账记录SQL：" . $sql);

		return array('state' => $state, 'info' => $info, 'orderid' => $subOrderTrxid);

    }


    // 分账关系查询
    public function batchquery(){

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayTradeRoyaltyRelationBatchqueryRequest.php");

        $appId = $this->partner_appid;
        $rsaPrivateKey = $this->partner_appPrivate;
        $alipayrsaPublicKey = $this->alipayrsaPublicKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/partner/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/partner/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/partner/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayTradeRoyaltyRelationBatchqueryRequest ();
        $request->setBizContent("{" .
            "\"page_num\":1," .
            "\"page_size\":20," .
            "\"out_request_no\":\"".md5(create_ordernum())."\"" .
        "  }");

        $result = $aop->execute($request, null, $authToken);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        print_r($result->$responseNode);
    }


    // 查询分账订单
    public function query($settle_no = '', $authToken = null){

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayTradeOrderSettleQueryRequest.php");

        $appId = $this->partner_appid;
        $rsaPrivateKey = $this->partner_appPrivate;
        $alipayrsaPublicKey = $this->alipayrsaPublicKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/partner/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/partner/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/partner/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayTradeOrderSettleQueryRequest ();
        $request->setBizContent("{" .
            "\"settle_no\":\"".$settle_no."\"" .
        "  }");

        $result = $aop->execute($request, null, $authToken);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        print_r($result->$responseNode);
    }


    // 查询分账订单
    public function refundQuery($trade_no = '', $authToken = null){

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayTradeFastpayRefundQueryRequest.php");

        $appId = $this->partner_appid;
        $rsaPrivateKey = $this->partner_appPrivate;
        $alipayrsaPublicKey = $this->alipayrsaPublicKey;

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/partner/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/partner/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/partner/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayTradeFastpayRefundQueryRequest ();
        $request->setBizContent("{" .
            "\"out_trade_no\":\"".$trade_no."\"," .
            "\"out_request_no\":\"".$trade_no."\"" .
        "  }");

        $result = $aop->execute($request, null, $authToken);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        print_r($result->$responseNode);
    }

}
