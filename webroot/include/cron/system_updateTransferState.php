<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
// 查询提现状态&生成回单

// 支付相关定时计划
global $dsql;

//获取微信转账接口版本
global $cfg_withdrawWxVersion;
$cfg_withdrawWxVersion = (int)$cfg_withdrawWxVersion;

//查询微信回单...
$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `receipting`=1 and `bank`='weixin'");
$orders = $dsql->getArrList($sql);
if($orders){
    include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";  //加载函数
    $wxpayTransfers = new wxpayTransfers();
    foreach ($orders as $orders_i){
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

        $appId = $wxpayTransfers->appId;
        $app_appId = $wxpayTransfers->app_appId;

        //如果是旧版，按照旧版的逻辑设置参数，如果是新版，按照新版的逻辑设置参数
        if ($cfg_withdrawWxVersion == 4) {
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

            $wechat_openid = $openid;
        } else {
            //通过小程序直接登录的，会没有openid，只有mini_openid，这时openid要用小程序的，appid也要用小程序的
            if(!$wechat_openid && $wechat_mini_openid){
                include(HUONIAOINC."/config/wechatConfig.inc.php");
                $wechat_openid = $wechat_mini_openid;
                $app_appId = $cfg_miniProgramAppid;
                $appId = $cfg_miniProgramAppid;
            }
        }

        //请求微信接口，判断转账成功或失败
        $withdrawApply = array(
            'real_name'=>$realname,
            'left_money'=>0,  //金额，单位：分，函数内部还会 * 100
            'batch_no'=>$orders_i['ordernum'],  //只有一笔，则ordernum是总单号和第一批单号
            'sn'=>$orders_i['ordernum']
        );
        $userAuth = array(
            'openid'=>$wechat_openid
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
        if ($orders_i['transferJson'] != null) {
            $wxpayTransfers->v4_queryReceipt($withdrawApply,$userAuth,$pcConfig);
        } else {
            $wxpayTransfers->v3_queryReceipt($withdrawApply,$userAuth,$pcConfig);
        }

        //使用app再执行一次
        $appConfig = array(
            'app_id'=>$app_appId,
            'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_cert.pem',
            'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_key.pem',
            'mch_id'=>$wxpayTransfers->app_mch_id,
            'app_key'=>$wxpayTransfers->app_key,
            'id'=>$orders_i['id']
        );
        if ($orders_i['transferJson'] != null) {
            //新版两次查询的appid不变
            $appConfig['app_id'] = $appId;

            $wxpayTransfers->v4_queryReceipt($withdrawApply,$userAuth,$appConfig);
        } else {
            $wxpayTransfers->v3_queryReceipt($withdrawApply,$userAuth,$appConfig);
        }
    }
}

//申请微信回单...
$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `receipting`=3 and `bank`='weixin'");
$orders = $dsql->getArrList($sql);
if($orders){
    include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";  //加载函数
    $wxpayTransfers = new wxpayTransfers();
    foreach ($orders as $orders_i){
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

        $appId = $wxpayTransfers->appId;
        $app_appId = $wxpayTransfers->app_appId;

        //如果是旧版，按照旧版的逻辑设置参数，如果是新版，按照新版的逻辑设置参数
        if ($cfg_withdrawWxVersion == 4) {
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

            $wechat_openid = $openid;
        } else {
            //通过小程序直接登录的，会没有openid，只有mini_openid，这时openid要用小程序的，appid也要用小程序的
            if(!$wechat_openid && $wechat_mini_openid){
                include(HUONIAOINC."/config/wechatConfig.inc.php");
                $wechat_openid = $wechat_mini_openid;
                $app_appId = $cfg_miniProgramAppid;
                $appId = $cfg_miniProgramAppid;
            }
        }

        //请求微信接口，判断转账成功或失败
        $withdrawApply = array(
            'real_name'=>$realname,
            'left_money'=>0,  //金额，单位：分，函数内部还会 * 100
            'batch_no'=>$orders_i['ordernum'],  //只有一笔，则ordernum是总单号和第一批单号
            'sn'=>$orders_i['ordernum']
        );
        $userAuth = array(
            'openid'=>$wechat_openid
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
        //如果transferJson不为空，说明是v4接口，否则是v3接口
        if ($orders_i['transferJson'] != null) {
            $wxpayTransfers->v4_applyReceipt($withdrawApply,$userAuth,$pcConfig);
        } else {
            $wxpayTransfers->v3_applyReceipt($withdrawApply,$userAuth,$pcConfig);
        }

        //使用app再执行一次
        $appConfig = array(
            'app_id'=>$app_appId,
            'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_cert.pem',
            'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_key.pem',
            'mch_id'=>$wxpayTransfers->app_mch_id,
            'app_key'=>$wxpayTransfers->app_key,
            'id'=>$orders_i['id']
        );
        //如果transferJson不为空，说明是v4接口，否则是v3接口
        if ($orders_i['transferJson'] != null) {
            //新版两次查询的appid不变
            $appConfig['app_id'] = $appId;
            
            $wxpayTransfers->v4_applyReceipt($withdrawApply,$userAuth,$appConfig);
        } else {
            $wxpayTransfers->v3_applyReceipt($withdrawApply,$userAuth,$appConfig);
        }
    }
}

//微信支付转账中
//$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `state`=3 and `bank`='weixin'");
$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `state` IN (3,4,6) and `bank`='weixin'");
$orders = $dsql->getArrList($sql);
if($orders){
    include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";  //加载函数
    $wxpayTransfers = new wxpayTransfers();
    foreach ($orders as $orders_i){
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

        $appId = $wxpayTransfers->appId;
        $app_appId = $wxpayTransfers->app_appId;

        //如果订单状态是3，说明是旧版，按照旧版的逻辑设置参数，如果是4或者6，说明是新版，按照新版的逻辑设置参数
        if ($orders_i['state'] == 3) {
            //通过小程序直接登录的，会没有openid，只有mini_openid，这时openid要用小程序的，appid也要用小程序的
            if(!$wechat_openid && $wechat_mini_openid){
                include(HUONIAOINC."/config/wechatConfig.inc.php");
                $wechat_openid = $wechat_mini_openid;
                $app_appId = $cfg_miniProgramAppid;
                $appId = $cfg_miniProgramAppid;
            }
        } else {
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

            $wechat_openid = $openid;
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
            'openid'=>$wechat_openid
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

        //如果订单状态是3，就查询v3接口，如果是4或者6，就查询v4接口
        if ($orders_i['state'] == 3) {
            $res = $wxpayTransfers->v3_queryPaying($withdrawApply,$userAuth,$pcConfig);
            $pcRes = $res;
    
            if($res['state']!=100){  //说明未成功，再尝试一次app
                $appConfig = array(
                    'app_id'=>$app_appId,
                    'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_cert.pem',
                    'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_key.pem',
                    'mch_id'=>$wxpayTransfers->app_mch_id,
                    'app_key'=>$wxpayTransfers->app_key,
                    'id'=>$orders_i['id']
                );
                $res = $wxpayTransfers->v3_queryPaying($withdrawApply,$userAuth,$appConfig);
            }
        } else {
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
    }
}

//查询支付宝回单...
$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `receipting`=1 and `bank`='alipay'");
$orders = $dsql->getArrList($sql);
if($orders){
    include_once HUONIAOROOT."/api/payment/alipay/alipayTransfers.php";
    $alipayTransfer = new alipayTransfers();
    foreach ($orders as $orders_i){
        $order = array(
            'id'=>$orders_i['id'],
            'fid'=>$orders_i['receipt_ali_fid']
        );
        $alipayTransfer->queryIncubating($order);
    }
}


//开始生成支付宝回单【在下一轮，再查询回单，所以要在查询回单下方】
$sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `receipting`=3 and `bank`='alipay'");
$orders = $dsql->getArrList($sql);
if($orders){

    include_once HUONIAOROOT."/api/payment/alipay/alipayTransfers.php";
    $alipayTransfer = new alipayTransfers();
    foreach ($orders as $orders_i){
        $order = array(
            'id'=>$orders_i['id'],
            'order_id'=>$orders_i['note'],
            'ordernum'=>$orders_i['ordernum']
        );
        $alipayTransfer->applyIncubating($order);
    }
}


