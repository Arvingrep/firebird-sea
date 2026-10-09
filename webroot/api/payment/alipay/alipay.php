<?php
/**
 * 支付宝在线支付主文件
 *
 * @version        $Id: alipay.php $v1.0 2014-3-12 下午17:19:21 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "alipay";

    /* 名称 */
    $payment[$i]['pay_name'] = "支付宝在线支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '国内先进的网上支付平台。三种支付接口：担保交易，即时到账，双接口。在线即可开通，零预付，免年费，单笔阶梯费率，无流量限制。';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => '网页支付',           'type' => 'split',        'description' => '适用于：PC端、H5端、APP端'),
        array('title' => '支付宝帐户',         'name' => 'account', 'type' => 'text'),
        array('title' => '合作伙伴身份（PID）', 'name' => 'partner', 'type' => 'text'),
        array('title' => '开放平台应用APPID',  'name' => 'appid',         'type' => 'text'),
        array('title' => '商户应用私钥',       'name' => 'appPrivate',    'type' => 'textarea'),
        array('title' => '服务商模式',         'type' => 'split',       'description' => '可选模式，主要用于分账，如果没有申请服务商，可以不配置！<br />开启服务商模式后，需要为商家签约并将商家PID填写到商家资料中，并且在开放平台三方应用中发起授权。<br />如果开启了服务商模式，但是商家资料又没有绑定支付宝商家PID，交易将支付到平台配置的默认网页支付的商户中。'),
		array('title' => '三方应用APPID', 'name' => 'partner_appid',  'type' => 'text'),
		array('title' => '三方应用私钥',  'name' => 'partner_appPrivate',    'type' => 'textarea'),
    );

    return;
}

/**
 * 类
 */
class alipay {

    /**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->alipay();
    }

    function alipay(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment,$returnjson=0){

        global $app;  //是否为客户端app支付
        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
        require 'aop/AopCertClient.php';
        require 'aop/AopClient.php';

        // 加载支付方式操作函数
        loadPlug("payment");

        //如果是签约商家订单
        $certPath = dirname(__FILE__) . "/cert/";
        if($order['alipay_pid']){
            $payment['appid'] = $payment['partner_appid'];
            $payment['appPrivate'] = $payment['partner_appPrivate'];
            $certPath .= "partner/";
        }


        //客户端APP支付
        if($app){
            $rsaPrivateKey = $payment['appPrivate'];
            require 'aop/request/AlipayTradeAppPayRequest.php';

            /** 初始化 **/
            $aop = new AopCertClient();

            /** 支付宝网关 **/
            $aop->gatewayUrl = "https://openapi.alipay.com/gateway.do";

            /** 应用id,如何获取请参考：https://opensupport.alipay.com/support/helpcenter/190/201602493024 **/
            $aop->appId = $payment['appid'];

            /** 密钥格式为pkcs1，如何获取私钥请参考：https://opensupport.alipay.com/support/helpcenter/207/201602469554 **/
            $aop->rsaPrivateKey = $rsaPrivateKey;

            //应用证书路径
            $appCertPath = $certPath . "appCertPublicKey.crt";

            //支付宝公钥证书路径
            $alipayCertPath = $certPath . "alipayCertPublicKey_RSA2.crt";

            //支付宝根证书路径
            $rootCertPath = $certPath . "alipayRootCert.crt";

            /** 设置签名类型 **/
            $aop->signType= "RSA2";

            /** 设置请求格式，固定值json **/
            $aop->format = "json";

            /** 设置编码格式 **/
            $aop->charset= "utf-8";

            /** 调用getPublicKey从支付宝公钥证书中提取公钥 **/
            $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);

            /** 是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内 **/
            $aop->isCheckAlipayPublicCert = true;

            /** 调用getCertSN获取证书序列号 **/
            $aop->appCertSN = $aop->getCertSN($appCertPath);

            /** 调用getRootCertSN获取支付宝根证书序列号 **/
            // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
            $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变
            /** 实例化具体API对应的request类，类名称和接口名称对应，当前调用接口名称：alipay.trade.app.pay **/
            $request = new AlipayTradeAppPayRequest();

            $subject = $order['subject'];
            $order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);

            $parameter = array(
                'subject'           => $subject,  //订单名称
                'out_trade_no'      => $order['order_sn'],  //商户订单号
                'total_amount'      => $order_amount,  //付款金额
                'product_code'      => 'QUICK_MSECURITY_PAY'  //销售产品码,固定值：QUICK_MSECURITY_PAY
            );

            if($order['service'] =='waimai'){
                $parameter['timeout_express'] = '30m';
                $parameter['time_expire'] = date("Y-m-d H:i", time() + 1800);
            }

            //如果开通了分账功能，支付参数增加冻结参数
            if($order['alipay_pid']){
                $parameter['extend_params'] = array(
                    'royalty_freeze' => true
                );
            }

            //商家应用授权令牌
            $appAuthToken = null;
            if($order['alipay_app_auth_token']){
                $appAuthToken = $order['alipay_app_auth_token'];
            }
            
            $bizcontent = json_encode($parameter);

            /** 设置业务参数 **/
            $request->setBizContent($bizcontent);
            /** 异步通知地址，以http或者https开头的，商户外网可以post访问的异步地址，用于接收支付宝返回的支付结果，如果未收到该通知可参考该文档进行确认：https://opensupport.alipay.com/support/helpcenter/193/201602475759 **/
            $request->setNotifyUrl($cfg_secureAccess.$cfg_basehost.'/api/payment/alipayAppNotify.php');

            /** 调用SDK生成支付链接，可在浏览器打开链接进入支付页面 **/
            $result = $aop->sdkExecute ($request, $appAuthToken);
            /**第三方调用（服务商模式），传值app_auth_token后，会收款至授权token对应商家账号，如何获传值app_auth_token请参考文档：https://opensupport.alipay.com/support/helpcenter/79/201602494631 **/
            //$result = $aop->sdkExecute($request,"");

            /** response.getBody()打印结果就是orderString，可以直接给客户端请求，无需再做处理。如果传值客户端失败，可根据返回错误信息到该文档寻找排查方案：https://opensupport.alipay.com/support/helpcenter/89 **/
            // print_r(htmlspecialchars($result));die;


            if ($returnjson == 1) {
                return $result;
            }

            //配置页面信息
            $tpl = HUONIAOROOT."/templates/member/touch/";
            $templates = "public-app-pay.html";
            if(file_exists($tpl.$templates)){
                $huoniaoTag->template_dir = $tpl;
                $huoniaoTag->assign('cfg_basehost', $cfg_secureAccess.$cfg_basehost);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                $huoniaoTag->assign('appCall', "aliPay");
                $huoniaoTag->assign('service', $order['service']);
                $huoniaoTag->assign('ordernum', $order['ordernum']);
                $huoniaoTag->assign('orderInfo', $result);
                $huoniaoTag->display($templates);
            }

            die;
        }


        //H5支付
        if(isMobile() && !$app){
            require 'aop/request/AlipayTradeWapPayRequest.php';
            $c = new AopCertClient();
            $rsaPrivateKey = $payment['appPrivate'];
            //应用证书路径
            $appCertPath = $certPath . "appCertPublicKey.crt";

            //支付宝公钥证书路径
            $alipayCertPath = $certPath . "alipayCertPublicKey_RSA2.crt";

            //支付宝根证书路径
            $rootCertPath = $certPath . "alipayRootCert.crt";

            $c->gatewayUrl = "https://openapi.alipay.com/gateway.do";
            $c->appId = $payment['appid'];
            $c->rsaPrivateKey = $rsaPrivateKey;

            $c->format = "json";
            $c->charset = "utf-8";
            $c->signType= "RSA2";

            //调用getPublicKey从支付宝公钥证书中提取公钥
            $c->alipayrsaPublicKey = $c->getPublicKey($alipayCertPath);
            //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
            $c->isCheckAlipayPublicCert = true;
            //调用getCertSN获取证书序列号
            $c->appCertSN = $c->getCertSN($appCertPath);
            $c->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变
            $request = new AlipayTradeWapPayRequest();

            $paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];
            $order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);
            $url = return_url("alipay", $paramUrl);     //页面跳转同步通知页面路径
            $parameter = array(
                'subject'           => $order['subject'],          //订单名称
                'out_trade_no'      => $order['order_sn'],         //商户订单号
                'total_amount'      => $order_amount,     //付款金额
                'product_code'      => 'QUICK_WAP_WAY'
            );

            if($order['service'] =='waimai'){
                $parameter['timeout_express'] = '30m';
                $parameter['time_expire'] = date("Y-m-d H:i", time() + 1800);
            }

            //如果开通了分账功能，支付参数增加冻结参数
            if($order['alipay_pid']){
                $parameter['extend_params'] = array(
                    'royalty_freeze' => true
                );
            }

            //商家应用授权令牌
            $appAuthToken = null;
            if($order['alipay_app_auth_token']){
                $appAuthToken = $order['alipay_app_auth_token'];
            }
            
            $bizcontent = json_encode($parameter);

            $request->setReturnUrl($url);
            $request->setNotifyUrl(notify_url("alipay", $paramUrl));
            $request->setBizContent($bizcontent);
            $response = $c->pageExecute($request, null, $appAuthToken);
            return  $response;
        }





        //PC
        require 'aop/request/AlipayTradePagePayRequest.php';

        $c = new AopCertClient();
        $rsaPrivateKey = $payment['appPrivate'];
        //应用证书路径
        $appCertPath = $certPath . "appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = $certPath . "alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = $certPath . "alipayRootCert.crt";

        $c->gatewayUrl = "https://openapi.alipay.com/gateway.do";
        $c->appId = $payment['appid'];
        $c->rsaPrivateKey = $rsaPrivateKey;

        $c->format = "json";
        $c->charset = "utf-8";
        $c->signType= "RSA2";

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $c->alipayrsaPublicKey = $c->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $c->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $c->appCertSN = $c->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        $c->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变
        $request = new AlipayTradePagePayRequest();
        $paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];
        $order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);
        $url = return_url("alipay", $paramUrl);       //页面跳转同步通知页面路径
        $parameter = array(
            'subject'           => $order['subject'],          //订单名称
            'out_trade_no'      => $order['order_sn'],         //商户订单号
            'total_amount'      => $order_amount,     //付款金额
            'product_code'      => 'FAST_INSTANT_TRADE_PAY'
        );

        if($order['service'] =='waimai'){
            $parameter['timeout_express'] = '30m';
            $parameter['time_expire'] = date("Y-m-d H:i", time() + 1800);
        }

        //如果开通了分账功能，支付参数增加冻结参数
        if($order['alipay_pid']){
            $parameter['extend_params'] = array(
                'royalty_freeze' => true
            );
        }

        //商家应用授权令牌
        $appAuthToken = null;
        if($order['alipay_app_auth_token']){
            $appAuthToken = $order['alipay_app_auth_token'];
        }

        $bizcontent = json_encode($parameter);

        $request->setReturnUrl($url);
        $request->setNotifyUrl(notify_url("alipay", $paramUrl));
        $request->setBizContent($bizcontent);
        $response = $c->pageExecute($request, null, $appAuthToken);
        return  $response;

    }


    /**
     * 响应操作
     */
    function respond(){
        global $dsql;
        
        /* GET */
        foreach($_GET as $k => $v) {
            $_GET[$k] = $v;
        }
        /* POST */
        foreach($_POST as $k => $v) {
            $_GET[$k] = $v;
        }

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("alipay");

        $order_sn  = $_GET['out_trade_no'];  //内部订单号
        $trade_no  = $_GET['trade_no'];  //支付宝交易号
        $seller_id = $_GET['seller_id'];  //商家PID，如果此值不是系统配置中的partner，则需要根据此值查询business_list表的alipay_app_auth_token

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayTradeQueryRequest.php");

        $appId = $payment['appid'];
		$partner = $payment['partner'];
        $rsaPrivateKey = $payment['appPrivate'];
        $alipayrsaPublicKey = $payment['alipayPublic'];

        $certPath = dirname(__FILE__) . "/cert/";

        //服务商模式
        $authToken = null;
        if($seller_id != $partner){
            $appId = $payment['partner_appid'];
            $rsaPrivateKey = $payment['partner_appPrivate'];
            $certPath .= "partner/";

            //根据seller_id查询商家应用授权令牌
            $sql = $dsql->SetQuery("SELECT `alipay_app_auth_token` FROM `#@__business_list` WHERE `alipay_pid` = '$seller_id'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $authToken = $ret[0]['alipay_app_auth_token'];

            //没有找到商家
            }else{
                return false;
            }
        }

        //应用证书路径
        $appCertPath = $certPath . "appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = $certPath . "alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = $certPath . "alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayTradeQueryRequest ();
        $request->setBizContent("{" .
            "\"out_trade_no\":\"".$order_sn."\"" .
        "  }");

        $result = $aop->execute($request, null, $authToken);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $response = $result->$responseNode;
        
        //成功
        if($response->code == 10000 && $response->trade_status == 'TRADE_SUCCESS'){
            order_paid($order_sn, $trade_no);
            return true;
        }else{
            return false;
        }

    }

    /**
     * 响应操作
     */
    function respondApp(){

        return $this->respond();  //验证订单支付状态，统一和网页版的一样

        // 加载支付方式操作函数
        loadPlug("payment");

        /* GET */
        foreach($_GET as $k => $v) {
            $_GET[$k] = $v;
        }
        /* POST */
        foreach($_POST as $k => $v) {
            $_GET[$k] = $v;
        }

        //订单号
        $order_sn = $_GET['out_trade_no'];

        //签名
        $sign = base64_decode($_GET['sign']);

        /* 检查支付的金额是否相符 */
        if (!check_money($order_sn, $_GET['total_amount'])){
            return false;
        }

        require 'aop/AopCertClient.php';
        $aop = new AopCertClient();

        //证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/alipayCertPublicKey_RSA2.crt";
        //支付宝公钥赋值
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //编码格式
        $aop->postCharset="UTF-8";
        //签名方式
        $sign_type="RSA2";

        //验签代码
        $flag = $aop->rsaCheckV1($_GET, null, $sign_type);

        if (!$flag){
            return false;
        }

        //买家付款，等待卖家发货
        if ($_GET['trade_status'] == 'WAIT_SELLER_SEND_GOODS'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

            //交易完成
        }elseif ($_GET['trade_status'] == 'TRADE_FINISHED'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

            //支付成功
        }elseif ($_GET['trade_status'] == 'TRADE_SUCCESS'){
            /* 改变订单状态 */
            order_paid($order_sn);

            return true;

        }else{
            return false;
        }



    }


    //商家应用授权通知，获取商家应用的app_auth_token
    function appAuth($code = ''){

        global $dsql;

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment = get_payment("alipay");

        $appId = $payment['partner_appid'];
		$partner = $payment['partner'];
        $rsaPrivateKey = $payment['partner_appPrivate'];
        $alipayrsaPublicKey = $payment['alipayPublic'];

        require_once ("aop/AopCertClient.php");
        require_once ("aop/request/AlipayOpenAuthTokenAppRequest.php");

        //应用证书路径
        $appCertPath = dirname(__FILE__) . "/cert/partner/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = dirname(__FILE__) . "/cert/partner/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = dirname(__FILE__) . "/cert/partner/alipayRootCert.crt";

        $aop = new AopCertClient ();
        $aop->gatewayUrl = 'https://openapi.alipay.com/gateway.do';
        $aop->appId = $appId;
        $aop->rsaPrivateKey = $rsaPrivateKey;
        // $aop->alipayrsaPublicKey = $alipayrsaPublicKey;
        $aop->apiVersion = '1.0';
        $aop->signType = 'RSA2';
        $aop->postCharset='UTF-8';
        $aop->format='json';

        //调用getPublicKey从支付宝公钥证书中提取公钥
        $aop->alipayrsaPublicKey = $aop->getPublicKey($alipayCertPath);
        //是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内
        $aop->isCheckAlipayPublicCert = true;
        //调用getCertSN获取证书序列号
        $aop->appCertSN = $aop->getCertSN($appCertPath);
        //调用getRootCertSN获取支付宝根证书序列号
        // $aop->alipayRootCertSN = $aop->getRootCertSN($rootCertPath);
        $aop->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $request = new AlipayOpenAuthTokenAppRequest ();
        $request->setBizContent("{" .
            "\"grant_type\":\"authorization_code\"," .
            "\"code\":\"".$code."\"" .
        "  }");

        $result = $aop->execute($request);
        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $response = $result->$responseNode;

        //成功
        if($response->code == 10000){

            $tokens = array();

            //多个应用的情况
            if(isset($response->tokens)){
                foreach($response->tokens as $key => $val){
                    array_push($tokens, array(
                        'user_id' => $val->user_id,
                        'app_auth_token' => $val->app_auth_token
                    ));
                }

            //单个应用的情况
            }else{
                array_push($tokens, array(
                    'user_id' => $response->user_id,
                    'app_auth_token' => $response->app_auth_token
                ));
            }

            foreach($tokens as $key => $val){

                $user_id = $val['user_id'];  //商家PID，我们需要根据后台绑定的商家PID查询、更新商家的应用授权令牌
                $app_auth_token = $val['app_auth_token'];  //应用授权令牌

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `alipay_pid` = '$user_id'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    //更新商家授权令牌
                    $bid = $ret[0]['id'];
                    $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `alipay_app_auth_token` = '$app_auth_token' WHERE `id` = $bid");
                    $ret = $dsql->dsqlOper($sql, "update");
                    if($ret == 'ok'){

                        echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                        echo '<br /><h2><center>授权成功</center></h2>';

                    }else{

                        echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                        echo '<br /><h2><center>授权失败</center></h2>';
                        echo "<br /><p style='color:red;'><center>系统错误，请联系管理员处理！</center></p>";

                    }

                //商家未绑定PID，页面给出提示
                }else{

                    echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                    echo '<br /><h2><center>授权失败</center></h2>';
                    echo "<br /><p style='color:red;'><center>请联系管理员为您先绑定商家PID！</center></p>";

                }

            }

        //失败
        }else{
            echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
            echo '<br /><h2><center>授权解析失败</center></h2>';
            echo "<dl><dt>code:</dt><dd style='margin:0;'>" . $response->code . "</dd></dl>";
            echo "<dl><dt>msg:</dt><dd style='margin:0;'>" . $response->msg . "</dd></dl>";
            echo "<dl><dt>sub_code:</dt><dd style='margin:0;'>" . $response->sub_code . "</dd></dl>";
            echo "<dl><dt>sub_msg:</dt><dd style='margin:0;'>" . $response->sub_msg . "</dd></dl>";
            echo "<br /><p style='color:red;'>请提供以上信息联系管理员处理！</p>";
        }

    }

}
