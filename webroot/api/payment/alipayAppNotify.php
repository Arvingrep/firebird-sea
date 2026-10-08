<?php
//服务器异步通知页面路径

require_once(dirname(__FILE__)."/../../include/common.inc.php");

//初始化日志
require_once dirname(__FILE__)."/log.php";
$_alipayLog= new CLogFileHandler(HUONIAOROOT . '/log/alipay/' . date('Y-m-d').'_app.log', true);

//引入配置文件
require_once(dirname(__FILE__)."/alipay/alipay.php");
$payRequest = new alipay();

//商家应用授权通知
if(isset($app_id) && isset($source) && $source == 'alipay_app_auth' && $app_auth_code){

	$payRequest->appAuth($app_auth_code);

//支付回调
}else{
	if($payRequest->respondApp()){
		echo "success";
	}else{
		echo "fail";
	}
}
