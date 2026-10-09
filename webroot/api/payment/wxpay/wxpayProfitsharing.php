<?php
/**
 * 微信服务商分账
 *
 * @version        $Id: wxpayProfitsharing.php $v1.0 2021-10-16 下午18:04:52 $
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
class wxpayProfitsharing {

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
        $this->wxpayProfitsharing();
    }

    function wxpayProfitsharing(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("wxpay");

        $this->PARTNER_NAME = $payment['PARTNER_NAME'];
        $this->PARTNER_MCHID = $payment['PARTNER_MCHID'];
        $this->PARTNER_KEY = $payment['PARTNER_KEY'];

        $this->APPID = $payment['APPID'];
        $this->MCHID = $payment['MCHID'];
        $this->KEY = $payment['KEY'];

    }

    function profitsharing($order){
		global $dsql;

		$bid = $order['bid'];  //商家ID
		$ordertitle = $order['ordertitle'];  //原订单信息
		$ordernum = $order['ordernum'];  //原订单号
		$orderdata = serialize($order['orderdata']);  //原订单内容
		$totalAmount = $order['totalAmount'] * 100;  //原订单金额
		$amount = (float)sprintf("%.2f", $order['amount'] * 100);  //分账金额
		$transaction_id = $order['transaction_id'];  //微信支付成功订单号
		$submchid = $order['submchid'];  //特约商户号
		$time = time();  //当前时间

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_wxpayPartnerLog = new CLogFileHandler(HUONIAOROOT . '/log/wxpayPartner/'.date('Y-m-d').'-profitsharing.log', true);
		$_wxpayPartnerLog->DEBUG("订单：" . json_encode($order));
		$_wxpayPartnerLog->DEBUG("APP：" . (int)$app);

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

		//添加分账接收方
		$bizRequestContent = array(
			'mch_id'    => $this->PARTNER_MCHID,
			'sub_mch_id' => $submchid,
			'appid' => $this->APPID,
			'nonce_str' => md5(create_ordernum()),
			'receiver' => json_encode(array(
				'type' => 'MERCHANT_ID',  //商户号
				'account' => $this->PARTNER_MCHID,  //服务商商户号
				'name' => $this->PARTNER_NAME,  //分账接收方类型是MERCHANT_ID时必传
				'relation_type' => 'SERVICE_PROVIDER'  //SERVICE_PROVIDER  服务商    USER  用户
			), JSON_UNESCAPED_UNICODE)
		);
		$_wxpayPartnerLog->DEBUG("分账接收方参数：" . json_encode($bizRequestContent));

		$req = $this->curl('https://api.mch.weixin.qq.com/pay/profitsharingaddreceiver', $bizRequestContent);

		// print_r($req);
		// <xml>
		// <return_code><![CDATA[SUCCESS]]></return_code>
		// <result_code><![CDATA[SUCCESS]]></result_code>
		// <mch_id><![CDATA[1523761271]]></mch_id>
		// <sub_mch_id><![CDATA[1614016970]]></sub_mch_id>
		// <appid><![CDATA[wx1e7f6dcca57d4dc3]]></appid>
		// <receiver><![CDATA[{"type":"MERCHANT_ID","account":"1523761271","relation_type":"SERVICE_PROVIDER"}]]></receiver>
		// <nonce_str><![CDATA[5a973a050b3a36d9]]></nonce_str>
		// <sign><![CDATA[5E0AA31C772D7A654E5A14590D6BE47FDEF4D9F752D8E7D9544A46072FBA629C]]></sign>
		// </xml>

		//单次分账，接口请求请功后，则不可以再次进行分账，除非使用多次分账接口
		//分完账后再退款，会从子商户账户余额直接扣除，分账分出去的钱将收不回来
        //如果分账金额小于等于0，则请求完结分账接口
        if($amount <= 0){
            $bizRequestContent = array(
    			'mch_id' => $this->PARTNER_MCHID,
    			'sub_mch_id' => $submchid,
    			'appid' => $this->APPID,
    			'nonce_str' => md5(create_ordernum()),
    			'transaction_id' => $transaction_id,
    			'out_order_no' => $ordernum,
    			'description' => '分账已完成'
    		);
    		$_wxpayPartnerLog->DEBUG("完结分账参数：" . json_encode($bizRequestContent));

    		$req = $this->curl('https://api.mch.weixin.qq.com/secapi/pay/profitsharingfinish', $bizRequestContent);
        }else{
    		$bizRequestContent = array(
    			'mch_id' => $this->PARTNER_MCHID,
    			'sub_mch_id' => $submchid,
    			'appid' => $this->APPID,
    			'nonce_str' => md5(create_ordernum()),
    			'transaction_id' => $transaction_id,
    			'out_order_no' => $ordernum,
    			'receivers' => json_encode(array(
    				'type' => 'MERCHANT_ID',
    				'account' => $this->PARTNER_MCHID,
    				'amount' => $amount,
    				'description' => $ordertitle
    			), JSON_UNESCAPED_UNICODE)
    		);
    		$_wxpayPartnerLog->DEBUG("单次分账参数：" . json_encode($bizRequestContent));

    		$req = $this->curl('https://api.mch.weixin.qq.com/secapi/pay/profitsharing', $bizRequestContent);
        }

		// print_r($req);die;
		// <xml>
		// <return_code><![CDATA[SUCCESS]]></return_code>
		// <result_code><![CDATA[SUCCESS]]></result_code>
		// <mch_id><![CDATA[1523761271]]></mch_id>
		// <sub_mch_id><![CDATA[1614016970]]></sub_mch_id>
		// <appid><![CDATA[wx1e7f6dcca57d4dc3]]></appid>
		// <nonce_str><![CDATA[95b8fdcae906b621]]></nonce_str>
		// <sign><![CDATA[4C45A3D6CA5E31EC8FED50240C5FB0B93F0422BC4425FB5EED40EC975EA086CB]]></sign>
		// <transaction_id><![CDATA[4200001184202110155342502015]]></transaction_id>
		// <out_order_no><![CDATA[21A1579267574290]]></out_order_no>
		// <order_id><![CDATA[30000701142021101719884384919]]></order_id>
		// <receivers><![CDATA[[{"type":"MERCHANT_ID","account":"1523761271","amount":2,"description":"测试分账订单","result":"PENDING","finish_time":"19700101080000","detail_id":"36000701142021101725949358140"},{"type":"MERCHANT_ID","account":"1614016970","amount":8,"description":"解冻给分账方","result":"PENDING","finish_time":"19700101080000","detail_id":"36000701142021101725949358142"}]]]></receivers>
		// <status><![CDATA[PROCESSING]]></status>
		// </xml>

		$state = 0;
		if(strstr($req, '<xml>')){
			$p = xml_parser_create();
			$parse = xml_parse_into_struct($p, $req, $vals, $title);
			xml_parser_free($p);

			foreach ($title as $k => $value) {
				$k = strtoupper($k);
				$res = $vals[$value[0]]['value'];
				$$k = strtoupper($res);
			}

			if($RETURN_CODE == 'SUCCESS'){
				if($RESULT_CODE == 'SUCCESS'){
					$subOrderTrxid = $ORDER_ID;
					$info = '分账成功';
					$state = 1;
				}else{
					$info = $ERR_CODE_DES;
				}
			}else{
				$info = $RETURN_MSG;
			}

		}else{
			$info = "curl出错，错误代码：$error";
		}

		//记录
		$totalAmount = sprintf("%.2f", $totalAmount/100);
		$amount = sprintf("%.2f", $amount/100);
		$sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('wxpay', '$bid', '$ordertitle', '$ordernum', '$orderdata', '$totalAmount', '$amount', '$submchid', '', '$seqNo', '', '$subOrderTrxid', '$time', '$state', '$info')");
		$dsql->dsqlOper($sql, "update");

		$_wxpayPartnerLog->DEBUG("分账记录SQL：" . $sql);

		return array('state' => $state, 'info' => $info, 'orderid' => $subOrderTrxid);

    }


	function curl($url, $bizRequestContent){

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_wxpayPartnerLog = new CLogFileHandler(HUONIAOROOT . '/log/wxpayPartner/'.date('Y-m-d').'-profitsharing.log', true);

		ksort($bizRequestContent); // 参数按字典顺序排序

		$parts = array();
		foreach ($bizRequestContent as $k => $v) {
			$parts[] = $k . '=' . $v;
		}
		$str = implode('&', $parts);

		$sign = strtoupper(hash_hmac("sha256", $str.'&key=' . $this->PARTNER_KEY, $this->PARTNER_KEY)); //注：HMAC-SHA256签名方式

		$bizRequestContent['sign'] = $sign;
		$xml = $this->arrayToXml($bizRequestContent);

		$_wxpayPartnerLog->DEBUG("XML：" . $xml);
		//
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch,CURLOPT_HEADER, 0);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, 0);
		curl_setopt($ch,CURLOPT_SSL_VERIFYPEER, 0);//证书检查
		curl_setopt($ch,CURLOPT_SSLCERTTYPE, 'pem');
		curl_setopt($ch,CURLOPT_SSLCERT, HUONIAOROOT.'/api/payment/wxpay/cert/partner/apiclient_cert.pem');
		curl_setopt($ch,CURLOPT_SSLCERTTYPE, 'pem');
		curl_setopt($ch,CURLOPT_SSLKEY, HUONIAOROOT.'/api/payment/wxpay/cert/partner/apiclient_key.pem');
		curl_setopt($ch,CURLOPT_SSLCERTTYPE, 'pem');
		curl_setopt($ch,CURLOPT_CAINFO, HUONIAOROOT.'/api/payment/wxpay/cert/partner/rootca.pem');
		curl_setopt($ch,CURLOPT_POST, 1);
		curl_setopt($ch,CURLOPT_POSTFIELDS, $xml);
		curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch,CURLOPT_CONNECTTIMEOUT ,5);
		curl_setopt($ch,CURLOPT_TIMEOUT, 10);
		$data = curl_exec($ch);

		$_wxpayPartnerLog->DEBUG("DATA：" . json_encode($data));

		if($data){
			curl_close($ch);
			return $data;

		}else{
			$error = curl_error($ch);
			curl_close($ch);
			return $error;
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

}
