<?php
//微信转账4.0版本回调接口
require_once(dirname(__FILE__)."/../../include/common.inc.php");
require_once dirname(__FILE__)."/log.php";

//初始化日志
$_wxpayLog= new CLogFileHandler(HUONIAOROOT . '/log/wxpayTransfer/' . date('Y-m-d').'.log', true);
$_wxpayLog->DEBUG("printReport:" . json_encode($_SERVER) . "\r\n");

$reportData = $GLOBALS["HTTP_RAW_POST_DATA"] ? $GLOBALS["HTTP_RAW_POST_DATA"] : file_get_contents("php://input"); //普通$_REQUEST获取不到回调的数据
$_wxpayLog->DEBUG("printReport:" . $reportData . "\r\n");

//获取头数据
$server = $_SERVER;

//获取回调正文
$reportArr = json_decode($reportData,true);

if ($server == null || !is_array($server) || $reportArr == null || !is_array($reportArr)) {
    http_response_code(504);
    echo '{"code":"FAIL","message":"获取数据错误！"}';
    die();
}

//验签头属性
$signature = $server['HTTP_WECHATPAY_SIGNATURE'];
$serial = $server['HTTP_WECHATPAY_SERIAL'];
$timestamp = $server['HTTP_WECHATPAY_TIMESTAMP'];
$nonce = $server['HTTP_WECHATPAY_NONCE'];

include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";
$wxpayTransfers = new wxpayTransfers();

require(HUONIAOINC."/config/wechatConfig.inc.php");

//签名尝试数组
$appArr = array(
    array('appId' => $wxpayTransfers->appId,'mchId' => $wxpayTransfers->mch_id,'appKey' => $wxpayTransfers->key,'keyPath' => dirname(__FILE__).'/wxpay/cert/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/apiclient_key.pem'),
    array('appId' => $cfg_miniProgramAppid,'mchId' => $wxpayTransfers->mch_id,'appKey' => $wxpayTransfers->key,'keyPath' => dirname(__FILE__).'/wxpay/cert/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/apiclient_key.pem'),
    array('appId' => $wxpayTransfers->wmsj_app_appId,'mchId' => $wxpayTransfers->mch_id,'appKey' => $wxpayTransfers->key,'keyPath' => dirname(__FILE__).'/wxpay/cert/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/apiclient_key.pem'),
    array('appId' => $wxpayTransfers->qishou_app_appId,'mchId' => $wxpayTransfers->mch_id,'appKey' => $wxpayTransfers->key,'keyPath' => dirname(__FILE__).'/wxpay/cert/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/apiclient_key.pem'),
    array('appId' => $wxpayTransfers->app_appId,'mchId' => $wxpayTransfers->app_mch_id,'appKey' => $wxpayTransfers->app_key,'keyPath' => dirname(__FILE__).'/wxpay/cert/app/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/app/apiclient_key.pem'),
    array('appId' => $cfg_miniProgramAppid,'mchId' => $wxpayTransfers->app_mch_id,'appKey' => $wxpayTransfers->app_key,'keyPath' => dirname(__FILE__).'/wxpay/cert/app/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/app/apiclient_key.pem'),
    array('appId' => $wxpayTransfers->wmsj_app_appId,'mchId' => $wxpayTransfers->app_mch_id,'appKey' => $wxpayTransfers->app_key,'keyPath' => dirname(__FILE__).'/wxpay/cert/app/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/app/apiclient_key.pem'),
    array('appId' => $wxpayTransfers->qishou_app_appId,'mchId' => $wxpayTransfers->app_mch_id,'appKey' => $wxpayTransfers->app_key,'keyPath' => dirname(__FILE__).'/wxpay/cert/app/apiclient_cert.pem','certPath' => dirname(__FILE__).'/cert/app/apiclient_key.pem'),
);

//循环尝试每一种配置，找出符合的配置
$isweixin = 0;
$appItem = array();
foreach ($appArr as $appInfo) {
    if ($appInfo['appId'] != null && $appInfo['mchId'] != null && $appInfo['appKey'] != null && $isweixin == 0) {
        /*$stream_opts = [
            "ssl" => [
                "verify_peer"=>false,
                "verify_peer_name"=>false,
            ]
        ];

        $mch_private_key = file_get_contents($appInfo['keyPath'],false, stream_context_create($stream_opts));//密钥
        $message = $timestamp."\n".$nonce."\n".$reportData."\n";
        $result = openssl_verify($message, base64_decode($signature), $mch_private_key, OPENSSL_ALGO_SHA256);*/

        $result = true;

        //验签通过执行解密操作
        if ($result) {

            $associatedData = $reportArr['resource']['associated_data'];
            $nonceStr = $reportArr['resource']['nonce'];
            $ciphertext = $reportArr['resource']['ciphertext'];

            $aesUtil = new AesUtil($appInfo['appKey']); //apiKey
            $backArr = $aesUtil->decryptToString($associatedData, $nonceStr, $ciphertext);
            $backArr = json_decode($backArr,true);

            if ($backArr != null && is_array($backArr)) {
                $isweixin = 1;
                $appItem = $appInfo;
            }
            
        }
    }
}

//验签失败
if ($isweixin == 0) {
    http_response_code(504);
    echo '{"code":"FAIL","message":"验签失败！"}';
    die();
}

//查询转账单信息
if (!isset($backArr['out_bill_no']) || $backArr['out_bill_no'] == null) {
    http_response_code(504);
    echo '{"code":"FAIL","message":"验签失败！"}';
    die();
}

$sql = $dsql->SetQuery("SELECT * FROM `#@__member_withdraw` WHERE `ordernum` = '".$backArr['out_bill_no']."'");
$result = $dsql->dsqlOper($sql, "results");
if ($result == null || !is_array($result)) {
    http_response_code(504);
    echo '{"code":"FAIL","message":"验签失败！"}';
    die();
}
$withdrawInfo = $result[0];

//如果状态已经是最终态，就不进行后续处理，以免重复执行
if ($withdrawInfo['state'] != 4 && $withdrawInfo['state'] != 6) {
    echo "SUCCESS";
    die();
}

//查询转账结果
$orders_i = $withdrawInfo;

/*0-普通用户,1-骑手*/
if ($orders_i['usertype'] == 0) {
    $sql = $dsql->SetQuery("SELECT `realname`, `wechat_openid`, `wechat_mini_openid`, `wechat_app_openid`, `wechat_wmsj_openid` FROM `#@__member` WHERE `id` = " . $orders_i['uid']);
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $realname           = $ret[0]['realname'];
        $wechat_openid      = $ret[0]['wechat_openid'];
        $wechat_mini_openid = $ret[0]['wechat_mini_openid'];
        $wechat_app_openid = $ret[0]['wechat_app_openid'];
        $wechat_wmsj_openid = $ret[0]['wechat_wmsj_openid'];
    }
} else {
    $Sql = $dsql->SetQuery("SELECT `name`,`openid`,`app_openid` FROM `#@__waimai_courier` WHERE 1=1 AND `id` = " . $orders_i['uid']);
    $Res = $dsql->dsqlOper($Sql, "results");
    if ($Res) {
        $realname           = $Res[0]['name'];
        $wechat_openid      = '';
        $wechat_mini_openid = $Res[0]['openid'];
        $wechat_app_openid = $Res[0]['app_openid'];
        $wechat_wmsj_openid = '';
    }
}

//如果来源是小程序，则使用小程序的openid
if ($orders_i['source'] == 1) {
    $openid = $wechat_mini_openid;
    $appId = $cfg_miniProgramAppid;
} else if ($orders_i['source'] == 2) {
    //如果来源是APP，则使用APP的openid
    $appId = $wxpayTransfers->app_appId;
    $openid = $wechat_app_openid;
} else if ($orders_i['source'] == 3) {
    //如果来源是商家端，则使用商家端的openid
    $appId = $wxpayTransfers->wmsj_app_appId;
    $openid = $wechat_wmsj_openid;
} else if ($orders_i['source'] == 4) {
    //如果来源是骑手端，则使用骑手端的openid
    $appId = $wxpayTransfers->qishou_app_appId;
    $openid = $wechat_app_openid;
}

//请求微信接口，判断转账成功或失败
$withdrawApply = array(
    'real_name'=>$realname,
    'left_money'=>$orders_i['amount'],  //金额，单位：分，函数内部还会 * 100
    'batch_no'=>$orders_i['ordernum'],  //只有一笔，则ordernum是总单号和第一批单号
    'sn'=>$orders_i['ordernum'],
    'note'=>$orders_i['note'],
);
$userAuth = array(
    'openid'=>$openid
);

//先使用网页，然后使用app
$pcConfig = array(
    'app_id'=>$appId,
    'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/apiclient_cert.pem',
    'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/apiclient_key.pem',
    'mch_id'=>$wxpayTransfers->mch_id,
    'app_key'=>$wxpayTransfers->key,
    'id'=>$orders_i['id']
);

$res = $wxpayTransfers->v4_queryPaying($withdrawApply,$userAuth,$pcConfig);
$pcRes = $res;

if($res['state']!=100){  //说明未成功，再尝试一次app
    $appConfig = array(
        'app_id'=>$appId,
        'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_cert.pem',
        'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_key.pem',
        'mch_id'=>$wxpayTransfers->app_mch_id,
        'app_key'=>$wxpayTransfers->app_key,
        'id'=>$orders_i['id']
    );
    $res = $wxpayTransfers->v4_queryPaying($withdrawApply,$userAuth,$appConfig);
}

//如果成功了，执行一些用户操作等
if($res['state']==100){
    //只有余额提现才需要变更账户余额和交易日志
    if(!$orders_i['type']){
        //扣除冻结金额
        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '{$orders_i['amount']}' WHERE `id` = '{$orders_i['uid']}'");
        $dsql->dsqlOper($archives, "update");
    }
    //更新记录状态
    $note = $res['note'];
    $rdate = time();
    $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 1, `note` = '$note', `rdate` = '$rdate' WHERE `id` = {$orders_i['id']}");
    $dsql->dsqlOper($sql, "update");

    //如果是骑手，就更新提现记录的状态
    if ($orders_i['usertype'] == 1) {
        $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 2 WHERE `wid` = {$orders_i['id']}");
        $dsql->dsqlOper($sql, "update");
    }

    //查询提现手续费【shouxuprice是最终手续费，proportion是手续百分比】
    $orderDetail = $dsql->getArr($dsql::SetQuery("select `shouxuprice` 'proportion',`ordernum` from `#@__member_withdraw` where `id`={$orders_i['id']}"));
    $proportion = $orderDetail['proportion'];
    $ordernum = $orderDetail['ordernum'];
    //如果有手续费，既然已经提现成功，记录下来
    if(!empty($proportion)){
        $sql = $dsql::SetQuery("select `cityid` from `#@__member` where `id`={$orders_i['uid']}");
        $cityid = (int)$dsql->getOne($sql);
        $time = time();
        $info = '提现手续费，提现金额：' . $amount . '，流水号：' . $note;
        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$orders_i['uid']}', '1', '{$orders_i['amount']}', '$info', '$time','$cityid','0','siteConfig',$proportion,'1','tixian','{$ordernum}')");
        $lastid = $dsql->dsqlOper($archives, "lastid");
    }

    //自定义配置
    $param = array(
        "service"  => "member",
        "type"     => "user",
        "template" => "withdraw_log_detail",
        "id"       => $orders_i['id']
    );
    $config = array(
        "username" => $realname,
        "amount" => $orders_i['amount'],
        "date" => date("Y-m-d H:i:s", $rdate),
        "info" => $note,
        "fields" => array(
            'keyword1' => '提现金额',
            'keyword2' => '提现时间',
            'keyword3' => '提现状态'
        )
    );
    updateMemberNotice($orders_i['uid'], "会员-提现申请审核通过", $param, $config);
}
//如果转账失败了，两次执行均不成功，且有一次检测失败【只要不是成功，一定会执行2次】
elseif( ($pcRes['type']=="FAIL" && !$pcRes['signError']) || ($res['type']=="FAIL" && !$res['signError'])){
    $failError = $wxpayTransfers->wxPayV3TransferError; //错误字典
    $failErrorKeys = array_keys($failError);
    $failErrorVals = array_values($failError);
    $real_fail_reason = !$pcRes['signError'] ? $pcRes['info'] : $res['info'];  //优先取非signError的错误提示
    if(in_array($pcRes['info'],$failErrorVals)){ //取pc键值
        $real_fail_reason = $pcRes['info'];
    }
    elseif(in_array($res['info'],$failErrorVals)){ //取app键值
        $real_fail_reason = $res['info'];
    }
    elseif(in_array($pcRes['info'],$failErrorKeys)){ //取pc键名
        $real_fail_reason = $pcRes['info'];
    }
    elseif(in_array($res['info'],$failErrorKeys)){ //取app键名
        $real_fail_reason = $res['info'];
    }
    $wxpayTransfers->v3_payFailReturn($real_fail_reason,$withdrawApply,$userAuth,$pcConfig);
}

//应答
echo "SUCCESS";