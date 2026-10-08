<?php
//服务器异步通知页面路径

require_once(dirname(__FILE__)."/../../include/common.inc.php");

//初始化日志
require_once dirname(__FILE__)."/log.php";
$_allinpayLog = new CLogFileHandler(HUONIAOROOT . '/log/allinpay_notify/' . date('Y-m-d').'.log', true);

//引入配置文件
require_once(dirname(__FILE__)."/allinpay_alipay/allinpay_alipay.php");
$payRequest = new allinpay_alipay();

$params = array();

//动态遍历获取所有收到的参数,此步非常关键,因为收银宝以后可能会加字段,动态获取可以兼容由于收银宝加字段而引起的签名异常
foreach($_POST as $key => $val) {
    $params[$key] = $val;
}

if(count($params) < 1){//如果参数为空,则不进行处理
    echo "error";
    exit();
}

if($payRequest->validSign($params)){//验签成功
    //此处进行业务逻辑处理

    //获取订单号
    $order_sn = $_POST['cusorderid'];

    //渠道流水号，如支付宝，微信平台订单号，注意，此流水号非通联原交易流水
    $chnltrxid = $_POST['chnltrxid'];

    loadPlug("payment");
    order_paid($order_sn, $chnltrxid);

    echo "success";
}
else{
    echo "error";
}
