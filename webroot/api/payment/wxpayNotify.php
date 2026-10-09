<?php
//微信支付服务器异步通知页面路径
require_once(dirname(__FILE__)."/../../include/common.inc.php");
require_once dirname(__FILE__)."/log.php";

//初始化日志
$_wxpayLog= new CLogFileHandler(HUONIAOROOT . '/log/wxpay/' . date('Y-m-d').'.log', true);

//获取配置信息
$archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'wxpay' AND `state` = 1");
$payment   = $dsql->dsqlOper($archives, "results");
if(!$payment) die("支付方式不存在！");

$pay_config = unserialize($payment[0]['pay_config']);
$paymentArr = array();

//验证配置
foreach ($pay_config as $key => $value) {
	if(!empty($value['value'])){
		$paymentArr[$value['name']] = $value['value'];
	}
}

// 加载支付方式操作函数
loadPlug("payment");

//查询订单是否属于服务商
$isPartner = false;
$_inputData = $GLOBALS["HTTP_RAW_POST_DATA"] ? $GLOBALS["HTTP_RAW_POST_DATA"] : file_get_contents("php://input");
$postObj = simplexml_load_string($_inputData, 'SimpleXMLElement', LIBXML_NOCDATA);
$_out_trade_no = $postObj->out_trade_no;
if($_out_trade_no){

	//查询订单所属模块
	$sql = $dsql->SetQuery("SELECT `ordertype` FROM `#@__pay_log` WHERE `ordernum` = '$_out_trade_no'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$_ordertype = $ret[0]['ordertype'];

		$_submchid = getWxpaySubMchid($_ordertype, $_out_trade_no);
		if($_submchid && $paymentArr['PARTNER_MCHID'] && $paymentArr['PARTNER_KEY']){
			$isPartner = true;
		}
	}

}

define('APPID', $paymentArr['APPID']);

//服务商模式
if($isPartner){
	define('MCHID', $paymentArr['PARTNER_MCHID']);
	define('KEY', $paymentArr['PARTNER_KEY']);
	define('SUBMCHID', $_submchid);
}else{
	define('MCHID', $paymentArr['MCHID']);
	define('KEY', $paymentArr['KEY']);
}

//=======【curl代理设置】===================================
/**
* TODO：这里设置代理机器，只有需要代理的时候才设置，不需要代理，请设置为0.0.0.0和0
* 本例程通过curl使用HTTP POST方法，此处可修改代理服务器，
* 默认CURL_PROXY_HOST=0.0.0.0和CURL_PROXY_PORT=0，此时不开启代理（如有需要才设置）
* @var unknown_type
*/
define('CURL_PROXY_HOST', "0.0.0.0");
define('CURL_PROXY_PORT', 0);

//=======【上报信息配置】===================================
/**
* TODO：接口调用上报等级，默认紧错误上报（注意：上报超时间为【1s】，上报无论成败【永不抛出异常】，
* 不会影响接口调用流程），开启上报之后，方便微信监控请求调用的质量，建议至少
* 开启错误上报。
* 上报等级，0.关闭上报; 1.仅错误出错上报; 2.全量上报
* @var int
*/
define('REPORT_LEVENL', 1);

require_once dirname(__FILE__)."/wxpay/WxPay.Api.php";
require_once dirname(__FILE__)."/wxpay/WxPay.Notify.php";

class PayNotifyCallBack extends WxPayNotify{
  //查询订单
  public function Queryorder($transaction_id){
	  global $_wxpayLog;
      $input = new WxPayOrderQuery();
      $input->SetTransaction_id($transaction_id);
      $result = WxPayApi::orderQuery($input);

      $_wxpayLog->DEBUG("query:" . json_encode($result));
      if(array_key_exists("return_code", $result)
          && array_key_exists("result_code", $result)
          && $result["return_code"] == "SUCCESS"
          && $result["result_code"] == "SUCCESS")
      {
        return true;
      }
      return false;
  }

  //重写回调处理函数
  public function NotifyProcess($data, &$msg){
	  global $_wxpayLog;
      $_wxpayLog->DEBUG("call back:" . json_encode($data));
      $notfiyOutput = array();

      if(!array_key_exists("transaction_id", $data)){
          $_wxpayLog->DEBUG("transaction_id:参数不正确");
          $msg = "输入参数不正确";
          return false;
      }
      //查询订单，判断订单真实性
      if(!$this->Queryorder($data["transaction_id"])){
          $_wxpayLog->DEBUG("订单查询失败");
          $msg = "订单查询失败";
          return false;
      }

      //支付金额
      $total_fee = sprintf("%.2f", $data['total_fee'] / 100);

      //验证通过，更新订单状态
      $orderid = $data["out_trade_no"];

      //和数据库金额对比
      if(!check_money($orderid, $total_fee)){
           $_wxpayLog->DEBUG("支付金额与订单金额不符");
           $msg = "支付金额与订单金额不符";
           return false;
      }

      order_paid($orderid, $data["transaction_id"]);

      return true;
  }
}

$_wxpayLog->DEBUG("begin notify");
$notify = new PayNotifyCallBack();
$notify->Handle(false);
