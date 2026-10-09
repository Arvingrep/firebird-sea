<?php
//服务器异步通知页面路径

require_once(dirname(__FILE__)."/../../include/common.inc.php");

$code = !empty($_REQUEST['code']) ? trim($_REQUEST['code']) : '';

if(empty($code)) die('PayCode Request Error!');

//初始化日志
require_once dirname(__FILE__)."/log.php";
$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/payreturn/'.date('Y-m-d').'-notify.log', true);
$_weixinAppPay->DEBUG(json_encode($_REQUEST));

$postStr = $GLOBALS["HTTP_RAW_POST_DATA"];
if(!$postStr){
  $postStr = file_get_contents("php://input");
}
$_weixinAppPay->DEBUG("return_data:" . json_encode($_REQUEST));

//引入配置文件
require_once(dirname(__FILE__)."/$code/$code.php");
$payRequest = new $code();

//如果是百度小程序，成功或者失败，都正常返回，不然，用户已付款金额不能顺利进入企业余额，如果业务程序处理失败，线下确认支付成功后，管理员在后台再手动操作
if($payRequest->respond()){
	if($code == 'rfbp_icbc'){
		echo '{code: "OK", summary: "成功"}';
	}elseif($code == 'baidumini'){
		echo '{"errno": 0, "msg": "success", "data": {"isConsumed": 2}}';
	}else{
		echo "success";
	}
}else{
	if($code == 'baidumini'){
		echo '{"errno": 0, "msg": "success", "data": {"isConsumed": 2}}';
	}else{
		echo "fail";
	}
}
