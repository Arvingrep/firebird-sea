<?php
//服务器异步通知页面路径

require_once(dirname(__FILE__)."/../../include/common.inc.php");

//初始化日志
require_once dirname(__FILE__)."/log.php";
$_fomopayLog= new CLogFileHandler(HUONIAOROOT . '/log/fomopay/' . date('Y-m-d').'_retun.log', true);

//引入配置文件
require_once(dirname(__FILE__)."/fomopay_paynow/fomopay_paynow.php");
$payRequest = new fomopay_paynow();

$_fomopayLog->DEBUG("return:" . json_encode($_REQUEST));
if($payRequest->respond()){
    echo "success";
}else{
    echo "fail";
}
