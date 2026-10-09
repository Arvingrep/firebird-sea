<?php
/**
 * 工行E商通分账接口
 *
 * @version        $Id: rfbp_shareAllocation.php $v1.0 2020-11-20 上午11:13:25 $
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
class rfbp_shareAllocation {

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
        $this->rfbp_shareAllocation();
    }

    function rfbp_shareAllocation(){

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

    function shareAllocation($order){

		global $dsql;

		require_once "ESTApi.php";
		$ESTApi = new ESTApi("prod"); //正式环境

		$merid = $this->merid;  //服务商编号
		$merprtclno = $this->merprtclno;  //服务商协议号
		$icbcappid = $this->icbcappid;  //服务商AppID

		$bid = $order['bid'];  //商家ID
		$ordertitle = $order['ordertitle'];  //原订单信息
		$ordernum = $order['ordernum'];  //原订单号
		$orderdata = serialize($order['orderdata']);  //原订单内容
		$totalAmount = $order['totalAmount'] * 100;  //原订单金额
		$amount = $order['amount'] * 100;  //分账金额
		$channelPayOrderNo = $order['channelPayOrderNo'];  //E商通支付成功订单号
		$icbc_subMerId = $order['icbc_subMerId'];  //二级商编号
		$icbc_subMerPrtclNo = $order['icbc_subMerPrtclNo'];  //二级商户协议编号
		$time = time();  //当前时间

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/rfbp_icbc/'.date('Y-m-d').'-shareAllocation.log');
		$_weixinAppPay->DEBUG("订单：" . json_encode($order));

		$seqNo = $channelPayOrderNo ? $channelPayOrderNo : create_ordernum();

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

		$state = 0;
		$info = $subOrderTrxid = '';
		$subOrderNo = "FZ_" . create_ordernum();
		$bizRequestContent = [
	        "merId" => $merid,
	        "merPrtclNo" => $merprtclno,
	        "icbcAppid" => $icbcappid,
	        "orderNum" => "1",
	        "subOrderSplitServiceInfos" => [
	            [
		            "busiType" => $channelPayOrderNo ? "2" : "1",
		            "classifyAmt" => $amount,
		            "operFlag" => "0",
		            "oriTrxDate" => date('Y-m-d'),
		            "recNum" => "1",
		            "seqNo" => $seqNo,
		            "subMerId" => $icbc_subMerId,
		            "subMerPrtclNo" => $icbc_subMerPrtclNo,
		            "subOrderId" => $subOrderNo
	            ]
	        ]
		];

		$data = [
		    "appId" => $icbcappid,
		    "timestamp" => date("YmdHis000"),
		    "msgId" => $ESTApi->makeMsgId(),
		    "signType" => "RSA2",
		    "encryptType" => "AES",
		    "bizRequestContent" => $ESTApi->jsonEncode($bizRequestContent)
		];

		$res = $ESTApi->shareAllocationApply($data);
		if ($res === false) {
		    $info = $ESTApi->getError();
		}

		//日志
		$_weixinAppPay->DEBUG("接口返回：" . json_encode($res));

		$res = json_decode($res, true);
		if($res['bizResponseContent']['success'] == true){

			$state = 1;
			$info = $res['bizResponseContent']['summary'];
			$subOrderTrxid = $res['bizResponseContent']['result']['orderSubmitActOutput'][0]['subOrderTrxid'];
			$subOrderTrxid = $subOrderTrxid ? $subOrderTrxid : $res['bizResponseContent']['result']['orderSubmitActOutput']['subOrderTrxid'];

			$retMsg = $res['bizResponseContent']['result']['orderSubmitActOutput'][0]['retMsg'];
			$retMsg = $retMsg ? $retMsg : $res['bizResponseContent']['result']['orderSubmitActOutput']['retMsg'];
			if($retMsg){
				$state = 0;
				$info = $retMsg;
			}

		//创建失败
		}else{
			$info = $res['bizResponseContent']['summary'];
		}

		//记录
		$totalAmount = sprintf("%.2f", $totalAmount/100);
		$amount = sprintf("%.2f", $amount/100);
		$sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('rfbp_icbc', '$bid', '$ordertitle', '$ordernum', '$orderdata', '$totalAmount', '$amount', '$icbc_subMerId', '$icbc_subMerPrtclNo', '$seqNo', '$subOrderNo', '$subOrderTrxid', '$time', '$state', '$info')");
		$dsql->dsqlOper($sql, "update");
		$_weixinAppPay->DEBUG("SQL：" . $sql);

		return array('state' => $state, 'info' => $info, 'orderid' => $subOrderTrxid);

    }

}
