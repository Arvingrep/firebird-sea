<?php
/**
 * 银联在线支付主文件
 *
 * @version        $Id: unionpay.php $v1.0 2014-3-11 上午11:30:28 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "unionpay";

	/* 名称 */
    $payment[$i]['pay_name'] = "银联在线支付";

    /* 版本号 */
    $payment[$i]['version']  = '2.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '银联在线支付是中国银联推出的网上支付平台，支持多家发卡银行，涵盖借记卡和信用卡等，包含认证支付、快捷支付和网银支付多种方式！
请根据银联提供的文档生成密钥文件，下载保存为：acp_sign.pfx，并上传到：
/api/payment/unionpay/acp_sign.pfx';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '商户号', 'name' => 'account', 'type' => 'text'),
		array('title' => '证书密码', 'name' => 'certpwd', 'type' => 'text')
    );

    return;
}


// 加载支付方式操作函数
loadPlug("payment");

include_once(dirname(__FILE__)."/acp_service.php");
define('SDK_SIGN_CERT_PATH', HUONIAOROOT.'/api/payment/unionpay/acp_sign.pfx');
define('SDK_VERIFY_CERT_DIR', HUONIAOROOT.'/api/payment/unionpay/');
define('SDK_FRONT_TRANS_URL', 'https://gateway.95516.com/gateway/api/frontTransReq.do');
define('SDK_BACK_TRANS_URL', 'https://gateway.95516.com/gateway/api/backTransReq.do');
define('SDK_LOG_LEVEL', PhpLog::OFF);

$payment = get_payment("unionpay");
define('UNIONPAY_ACCOUNT', $payment['account']);
define('SDK_SIGN_CERT_PWD', $payment['certpwd']);


/**
 * 类
 */
class unionpay {

	/**
   * 构造函数
   *
   * @access  public
   * @param
   *
   * @return void
   */

  function __construct(){
    $this->unionpay();
  }

  function unionpay(){}

  /**
   * 生成支付代码
   * @param   array   $order    订单信息
   * @param   array   $payment  支付方式信息
   */
  function get_code($order, $payment){

    define('SDK_FRONT_NOTIFY_URL', return_url("unionpay", "&module=".$order['service']."&sn=".$order['order_sn']));
    define('SDK_BACK_NOTIFY_URL', notify_url("unionpay", "&module=".$order['service']."&sn=".$order['order_sn']));

    $params = array(
  		//以下信息非特殊情况不需要改动
  		'version' => '5.0.0',           //版本号
  		'encoding' => 'utf-8',				  //编码方式
  		'txnType' => '01',				      //交易类型
  		'txnSubType' => '01',				    //交易子类
  		'bizType' => '000201',				  //业务类型
  		'frontUrl' =>  SDK_FRONT_NOTIFY_URL,  //前台通知地址
  		'backUrl' => SDK_BACK_NOTIFY_URL,	  //后台通知地址
  		'signMethod' => '01',	          //签名方法
  		'channelType' => '08',	        //渠道类型，07-PC，08-手机
  		'accessType' => '0',		        //接入类型
  		'currencyCode' => '156',	      //交易币种，境内商户固定156

  		//TODO 以下信息需要填写
  		'merId'   => UNIONPAY_ACCOUNT,		//商户代码，请改自己的测试商户号，此处默认取demo演示页面传递的参数
  		'orderId' => $order['order_sn'],	//商户订单号，8-32位数字字母，不能含“-”或“_”，此处默认取demo演示页面传递的参数，可以自行定制规则
  		'txnTime' => date('YmdHis'),	 //订单发送时间，格式为YYYYMMDDhhmmss，取北京时间，此处默认取demo演示页面传递的参数
  		'txnAmt'  => $order['order_amount'] * 100,	//交易金额，单位分，此处默认取demo演示页面传递的参数
   		// 'reqReserved' =>'module='.$order['service'].'&order_sn='.$order['order_sn'], //请求方保留域，透传字段，查询、通知、对账文件中均会原样出现，如有需要请启用并修改自己希望透传的数据

  		//TODO 其他特殊用法请查看 special_use_purchase.php
  	);

    AcpService::sign($params);
    echo AcpService::createAutoFormHtml($params, SDK_FRONT_TRANS_URL);

  }

  /**
   * 响应操作
   */
  function respond(){

		// 加载支付方式操作函数
    loadPlug("payment");
    $payment = get_payment("unionpay");

    if(isset($_POST['signature'])){
			if(AcpService::validate($_POST)){
        // echo '验签成功';
        $merId     = $_POST['merId'];     //商户号
        $orderId   = $_POST['orderId'];   //订单ID
        $settleAmt = $_POST['settleAmt']; //订单金额
        $queryId   = $_POST['queryId'];   //交易流水号
  			$respCode  = $_POST['respCode'];  //判断respCode=00或A6即可认为交易成功

        // 检查商户账号是否一致。
  			if($payment['account'] != $merId){
  				return false;
  			}

        // 检查支付的金额是否相符
  			if(!check_money($orderId, $settleAmt/100)){
  				return false;
  			}

        // 如果未支付成功。
  			if($respCode != '00' && $respCode != 'A6'){
  				return false;
  			}

        order_paid($orderId, $queryId);
        return true;

      }else{
        // echo '验签失败';
        return false;
      }
		}else{
			//echo '签名为空';
      return false;
		}

  }

}
