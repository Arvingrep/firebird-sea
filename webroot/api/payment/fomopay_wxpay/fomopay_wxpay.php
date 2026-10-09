<?php
if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "fomopay_wxpay";

    /* 名称 */
    $payment[$i]['pay_name'] = "WxPay";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = 'FOMO Pay是新加坡一家获得支付牌照的金融科技公司，为中国跨境市场提供一站式支付解决方案。官网：https://www.fomopay.com/';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => 'API用户名', 'name' => 'merchantid', 'type' => 'text'),
        array('title' => 'API秘钥', 'name' => 'signkey', 'type' => 'text'),
        //        array('title' => 'APPID',     'name' => 'APPID',      'type' => 'text'),
        //        array('title' => 'APPSECRET', 'name' => 'APPSECRET',  'type' => 'text'),
    );

    return;
}

class fomopay_wxpay {

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->fomopay_wxpay();
    }

    function fomopay_wxpay(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $app;  //是否为客户端app支付
        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
        global $userLogin;
        global $dsql;

        if($app && !isApp()) return false;

        // 查询该笔订单有没有支付成功

        $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '".$order["order_sn"]."' AND `state` = 1");

        $orderres = $dsql->dsqlOper($ordersql,"results");

        if($orderres){
            die("This order has already been paid, please do not pay again");
        }

        define('EST_merchantid', $payment['merchantid']);    //账号
        define('EST_signkey', $payment['signkey']);  //密钥
        define('APPID', $payment['APPID']);
        define('APPSECRET', $payment['APPSECRET']);

        // 加载支付方式操作函数
        loadPlug("payment");

        $order_amount = sprintf("%.2f", $order['order_amount']);
        $paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

        //验证是否为小程序端
        $isWxMiniprogram = isWxMiniprogram();

        //$fomoorder 兼容平台唯一订单号问题
        $fomoorder = create_ordernum();
        //支付参数
        $bizRequestContent = array(
            'mode'               => 'DIRECT',
            'orderNo'            => $fomoorder,
            //            'subMid'             => EST_merchantid,
            'subject'            => $order['subject'],
            'description'        => $order['subject'] . "：" . $order['order_sn'],
            'amount'             => $order_amount,
            'currencyCode'       => 'SGD',
            'notifyUrl'          => $cfg_secureAccess.$cfg_basehost.'/api/payment/fomopayNotify.php',
            'returnUrl'          => $cfg_secureAccess.$cfg_basehost,
            'sourceOfFund'       => 'WECHATPAY',
        );


        $transactionOptions = array();
        //小程序端
        if($isWxMiniprogram){

            $userid = $userLogin->getMemberID();

            $openId = '';
            $conn = '';
            $sql = $dsql->SetQuery("SELECT `wechat_mini_openid`, `wechat_conn` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $openId = $ret[0]['wechat_mini_openid'];
                $conn   = $ret[0]['wechat_conn'];
            }

            if(!$openId){

                //读取unionid
                $sql = $dsql->SetQuery("SELECT `id`, `openid`, `unionid` FROM `#@__site_wxmini_unionid` WHERE `conn` = '$conn'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_unionid = $ret[0]['id'];
                    $miniProgram_openid = $ret[0]['openid'];
                    $miniProgram_unionid = $ret[0]['unionid'];

                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_mini_session` = '$miniProgram_unionid', `wechat_mini_openid` = '$miniProgram_openid' WHERE `id` = $userid");
                    $dsql->dsqlOper($sql, "update");
                    $openId = $miniProgram_openid;

                    //用完后删除记录
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_unionid` WHERE `id` = $_unionid");
                    $dsql->dsqlOper($sql, "update");

                }else{
                    //已经绑定过微信快捷登录，但是没有登录小程序登录的
                    if($conn){
                        $param = array(
                            'service' => 'member',
                            'type' => 'user'
                        );
                        $url = getUrlPath($param);

                        $userLogin->exitMember();
                        die("<script>alert('账号异常，请在小程序端使用微信快捷登录重新授权登录！');location.href='/login.html?furl=".$url."';</script>");

                        //未绑定过微信快捷登录，先提示绑定
                    }else{
                        $param = array(
                            'service' => 'member',
                            'type' => 'user',
                            'template' => 'connect'
                        );
                        $url = getUrlPath($param);
                        die("<script>alert('请先在我的会员中心=>安全中心=>社交账号关联绑定中，绑定微信快捷登录，然后再支付！');location.href='".$url."';</script>");
                    }
                }

            }

            include HUONIAOINC . '/config/wechatConfig.inc.php';

            $transactionOptions['txnType'] = 'WXA';
            $transactionOptions['timeout'] = 1800;
            $transactionOptions['openid']  = $openId;

            //APP端
        }elseif(isMobile() && isWeixin() && !$isWxMiniprogram){

            die("错误的支付方式");
            include HUONIAOROOT . "/api/payment/wxpay/WxPay.JsApiPay.php";
            //①、获取用户openid
            $tools  = new JsApiPay();
            $openId = $tools->GetOpenid();

            $transactionOptions['txnType'] = 'JSAPI';
            $transactionOptions['timeout'] = 1800;
            $transactionOptions['openid']  = $openId;
            $transactionOptions['ip']      = GetIP();

        }else{
            $transactionOptions['txnType'] = 'NATIVE';
            $transactionOptions['timeout'] = 1800;
        }

        $bizRequestContent['transactionOptions'] = $transactionOptions;

//        ksort($bizRequestContent); // 参数按字典顺序排序
//
//        $parts = array();
//        foreach ($bizRequestContent as $k => $v) {
//            $parts[] = $k . '=' . $v;
//        }
//        $str = implode('&', $parts);
//
//        $sign = hash_hmac("sha256", $str, EST_secret_key); //注：HMAC-SHA256签名方式
//
//        $_param = $bizRequestContent;
//        unset($_param['user']);
//        unset($_param['method']);
//        unset($_param['time']);
//
//        $params = array(
//            'user' => $bizRequestContent['user'],
//            'sign' => $sign,
//            'method' => $bizRequestContent['method'],
//            'time' => $bizRequestContent['time'],
//            'data' => $_param
//        );

        $params = $bizRequestContent;
//        echo "<pre>";
//        var_dump($params);die;
        //初始化日志
        require_once dirname(__FILE__)."/../log.php";
        $_fomoPay = new CLogFileHandler(HUONIAOROOT . '/log/fomopay/'.date('Y-m-d').'-create.log', true);
        $_fomoPay->DEBUG("报文：" . json_encode($params));

        $httpHeader = array();
        $httpHeader[]   = 'Authorization: Basic '.base64_encode(EST_merchantid.":".EST_signkey);
        $httpHeader[]   = 'Content-Type:application/json';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://ipg.fomopay.net/api/orders');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params) );
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $data = curl_exec($ch);
        if($data){
            curl_close($ch);
            $data = json_decode($data, true);
            //日志
            $_fomoPay->DEBUG("Result：" . json_encode($data));

            if(isset($data['status']) && $data['status'] == 'CREATED'){

                //更新transaction_id
                $trade_id = $data['id'];
                $primaryTransactionId  = $data['primaryTransactionId'];
                $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `transaction_id` = '$trade_id',`primaryTransactionId` ='$primaryTransactionId' WHERE `ordernum` = '".$order["order_sn"]."'");

                $_fomoPay->DEBUG("Resultsql：" . $sql);
                $dsql->dsqlOper($sql, "update");

                //小程序端
                if($isWxMiniprogram){

                    //配置页面信息
                    $tpl = HUONIAOROOT."/templates/siteConfig/";
                    $templates = "wxpayTouch.html";
                    if(file_exists($tpl.$templates)){
                        global $huoniaoTag;
                        global $cfg_staticPath;
                        $cfg_basehost_ = $cfg_secureAccess.$cfg_basehost;

                        if($order['service'] == "member"){
                            if($payBody && is_array($payBody) && $payBody['type'] == 'join_pay'){
                                $param = array(
                                    "service"  => $order['service'],
                                    "template" => "index"
                                );
                            }else{
                                $param = array(
                                    "service"  => $order['service'],
                                    "type"     => "user",
                                    "template" => "bill"
                                );
                            }
                        }else{
                            $param = array(
                                "service"  => $order['service'],
                                "template" => "payreturn",
                                "ordernum" => $order['order_sn']
                            );
                        }
                        $returnUrl = getUrlPath($param);
                        putSession('wxPayReturnUrl', $returnUrl);

                        //小程序必要参数
                        $parameters = $data['payReq'];

                        $orderInfo = array(
                            "appId"     => $parameters['appid'],
                            "timeStamp" => $parameters['timestamp'],
                            "nonceStr"  => $parameters['noncestr'],
                            "package"   => $parameters['package'],
                            "signType"  => $parameters['signType'],
                            "paySign"   => $parameters['paysign'],
                        );

                        $huoniaoTag->template_dir = $tpl;
                        $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
                        $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                        $huoniaoTag->assign('ordernum', $order['order_sn']);
                        $huoniaoTag->assign('returnUrl', $returnUrl);
                        $huoniaoTag->assign('jsApiParameters', json_encode($orderInfo));
                        $huoniaoTag->display($templates);
                        die;
                    }

                    //APP端
                }elseif(isWeixin()){

                    //配置页面信息
                    $tpl = HUONIAOROOT."/templates/siteConfig/";
                    $templates = "wxpayTouch.html";
                    if(file_exists($tpl.$templates)&&$returnjson==0){
                        global $huoniaoTag;
                        global $cfg_staticPath;
                        $huoniaoTag->template_dir = $tpl;
                        $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
                        $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                        $huoniaoTag->assign('ordernum', $order['order_sn']);
                        $huoniaoTag->assign('returnUrl', $returnUrl);
                        $huoniaoTag->assign('jsApiParameters', $jsApiParameters);
                        $huoniaoTag->display($templates);
                    }else{
                        $returnjsonarr = array(
                            'cfg_basehost' =>$cfg_basehost_,
                            'cfg_staticPath' =>$cfg_staticPath,
                            'ordernum' =>$order['order_sn'],
                            'returnUrl' =>$returnUrl,
                            'jsApiParameters' =>$jsApiParameters
                        );
                        return json_encode($returnjsonarr);
                    }
                    die;

                    //h5端
                }else{
                    if($data['status'] != "CREATED"){
                        die("PC支付错误：" . $data['status']);
                    }
                    $url = $data["codeUrl"];
                    //配置页面信息
                    $tpl = HUONIAOROOT."/templates/siteConfig/";
                    $templates = "wxpay.html";
                    if(file_exists($tpl.$templates)){
                        global $huoniaoTag;
                        global $cfg_staticPath;
                        $huoniaoTag->template_dir = $tpl;
                        $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                        $huoniaoTag->assign('url', $url);
                        $huoniaoTag->assign('order', $order);
                        $huoniaoTag->display($templates);
                    }else{
                        echo '<img src="/include/qrcode.php?data='.urlencode($url).'" style="width:150px;height:150px;"/>';
                    }
                }

            }else{
                die($data['message']);
            }
        }else{
            $error = curl_error($ch);
            curl_close($ch);
            print_r($error);
        }

    }

}
