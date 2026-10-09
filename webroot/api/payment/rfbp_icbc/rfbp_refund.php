<?php
/**
 * 工行E商通退款接口
 *
 * @version        $Id: rfbp_refund.php $v1.0 2020-11-21 下午17:33:15 $
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
class rfbp_refund {

  /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    public $merid;
    public $merprtclno;
    public $icbcappid;

    function __construct(){
        $this->rfbp_refund();
    }

    function rfbp_refund(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("rfbp_icbc");

        $this->merid = $payment['merid'];
        $this->merprtclno = $payment['merprtclno'];
        $this->icbcappid = $payment['icbcappid'];

		define('EST_mchid', $payment['mchid']);    //商户号
		define('EST_prikey', $payment['prikey']);  //商户私钥
		define('EST_pubkey', $payment['pubkey']);  //商户公钥
    }

    function refund($order){

		global $dsql;

		require_once "ESTApi.php";
		$ESTApi = new ESTApi("prod"); //正式环境

		$merid = $this->merid;  //服务商编号
		$merprtclno = $this->merprtclno;  //服务商协议号
		$icbcappid = $this->icbcappid;  //服务商AppID

		$ordernum = $order['ordernum'];  //订单ID
		$orderamount = $order['orderamount'] * 100;  //订单总金额
		$amount = $order['amount'] * 100;  //退款金额
		$time = time();  //当前时间

		//查询工行E商通支付订单ID
		$icbc_orderid = '';
		if($order['service'] == 'shop'){
			$sql = $dsql->SetQuery("SELECT `icbc_orderid` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
		}else{
			$sql = $dsql->SetQuery("SELECT `icbc_orderid` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
		}
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$icbc_orderid = $ret[0]['icbc_orderid'];
		}else{
			return array("state" => 200, "code" => "支付订单查询失败");
		}

		if(empty($icbc_orderid)){
			return array("state" => 200, "code" => "工行E商通支付订单ID获取失败");
		}

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/rfbp_icbc/'.date('Y-m-d').'-refund.log');
		$_weixinAppPay->DEBUG("订单：" . json_encode($order));

		$mchRefundNo = "REFUND_" . create_ordernum();
		$paramUrl = "&type=refund&ordernum=".$ordernum."&orderamount=".$orderamount."&amount=".$amount;

		$bizRequestContent = [
		    "clientIp" => GetIP(),
		    "mchOrderNo" => $ordernum,
		    "orderNo" => $icbc_orderid,
		    "mchRefundNo" => $mchRefundNo,
		    "totalAmount" => $orderamount,
		    "refundAmount" => $amount,
		    "refundDesc" => "接口退款",
		    "notifyUrl" => notify_url("rfbp_icbc", $paramUrl)
		];
		$_weixinAppPay->DEBUG("报文：" . json_encode($bizRequestContent));
		$data = [
		    "appId" => $icbcappid,
		    "timestamp" => date("YmdHis000"),
		    "msgId" => $ESTApi->makeMsgId(),
		    "signType" => "RSA2",
		    "encryptType" => "AES",
		    "bizRequestContent" => $ESTApi->jsonEncode($bizRequestContent)
		];

		$res = $ESTApi->refundCreate($data);
		if ($res === false) {
		    $info = $ESTApi->getError();
		}

		//日志
		$_weixinAppPay->DEBUG("接口返回：" . json_encode($res));

		$res = json_decode($res, true);
		if($res['bizResponseContent']['success'] == true && $res['bizResponseContent']['result']['status'] == "3"){

			return array("state" => 100, "date" => $time, "refundOrderNo" => $res['bizResponseContent']['result']['refundOrderNo']);

		//创建失败
		}else{
			$info = $res['bizResponseContent']['summary'];
			return array("state" => 200, "code" => $info);
		}

    }

}
