<?php
/**
 * XorPay 微信
 *
 * @version        $Id: allinpay_wxpay.php $v1.0 2024-4-10 下午17:54:31 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "allinpay_wxpay";

	/* 所属公司 */
    $payment[$i]['pay_name'] = "微信";

	/* 名称 */
    $payment[$i]['title'] = "通联支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '通联支付网络服务股份有限公司（简称“通联支付”）成立于2008年10月，总部位于上海，拥有支付业务许可，官网：https://www.allinpay.com/';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '支付平台',     'name' => 'paytype', 'type' => 'text',  'class' => 'input-small', 'description' => '默认为：wxpay'),
		array('title' => '小程序端交易方式',     'name' => 'mini_paytype', 'type' => 'text',  'class' => 'input-small', 'description' => '默认为：W06，如果小程序资金已被管控，请填写：W11，另外需要联系通联支付客服申请开通该方式！'),
		array('title' => '商户号',     'name' => 'cusid', 'type' => 'text'),
        array('title' => 'appid',     'name' => 'appid', 'type' => 'text'),
        array('title' => '通联RSA公钥',    'name' => 'rsa_public_key', 'type' => 'textarea'),
        array('title' => 'RSA私钥',    'name' => 'rsa_private_key', 'type' => 'textarea'),
    );

    return;
}

/**
 * 类
 */
class allinpay_wxpay {

    protected $signer;

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
		require_once HUONIAOINC . "/class/RSASign.class.php";
        $this->signer = $signer ?: new RSASign();
    }

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment, $returnjson = 0){

        global $dsql;
        global $userLogin;
        global $currency_rate;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $app;  //是否为客户端app支付

        $userid = $userLogin->getMemberID();

        //判断是否在小程序端
        $isWxMiniprogram = isWxMiniprogram();

		$order_amount = (int)((sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100);  //单位为分
		$notify_url = $cfg_secureAccess.$cfg_basehost.'/api/payment/allinpayNotify.php';  //交易结果通知地址

        $subject = $order['subject'];  //订单名称
        $order_sn = $order['order_sn'];  //订单号

        //获取订单信息
        $payBody = array();
        $sql = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordernum` = '".$order['order_sn']."'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $payBody = unserialize($ret[0]['body']);
        }

        if($order['service'] == "member" || $order['service'] == "siteConfig"){
            if($payBody && is_array($payBody) && $payBody['type'] == 'join_pay'){
                $param = array(
                "service"  => 'member',
                "template" => "index"
                );
            }elseif($payBody && is_array($payBody) && $payBody['type'] == 'fabu' && $payBody['module'] = 'info'){
                $param = array(
                "service"  => 'info',
                "template" => "payreturn",
                "param" => "ordernum=" . $order['order_sn'] . "&currentPageOpen=1"
                );

            }else{
                $param = array(
                "service"  => 'member',
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

        //订单详情链接
        if (strstr($order_sn, ",")) {
            $paramurl = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "order",
                "module"   => $order['service']
            );
            $orderurl = getUrlPath($paramurl);

        } else {
            $orderurl = orderDetailUrl($order['service'],$order_sn);
        }

        //获取当前所有url参数
        $url_param = $_SERVER['QUERY_STRING'];
        $url_param = base64_encode(str_replace('undefined', '', $url_param));

        // 交易方式
        // W01	微信扫码支付
        // W02	微信JS支付
        // W03	微信APP支付
        // W06	微信小程序支付
        // W11  微信订单支付，用于小程序被资金管控的情况（电商类已开通小程序发货时）
        $paytype = 'W01';

        if(isWeixin() && !$isWxMiniprogram){
            $paytype = 'W02';
        }
        elseif($isWxMiniprogram){
            $paytype = $payment['mini_paytype'] ?: 'W06';
        }
        elseif($app){
            $paytype = 'W06';
        }

        //拼接支付参数
        $params = [
            'cusid'  => $payment['cusid'],  //商户号
            'appid'  => $payment['appid'],  //应用ID
			'trxamt' => $order_amount,  //交易金额
            'reqsn'  => $order_sn, //商户订单号
            'paytype' => $paytype, //交易方式
            'randomstr' => time().rand('10000','99999'),  //请求随机串
            'body' => $subject,  //订单标题
            'validtime' => 30,  //订单有效时间，以分为单位，不填默认为5分钟
            'expiretime' => date('YmdHis', strtotime("+30 minutes")),  //截止支付时间  yyyyMMddHHmmss
            'notify_url' => $notify_url,  //交易结果通知地址
            'signtype' => 'RSA',  //签名方式
        ];

        //JS支付时使用，需要传用户的微信openid
        if($paytype == 'W02'){

            $openId = '';
            //先查询数据库是否有该用户的openid
            $sql = $dsql->SetQuery("SELECT `wechat_openid` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $openId = $ret[0]['wechat_openid'];
            }

            //如果数据库没有该用户的openid，则调用接口获取
            if(!$openId){
                require_once HUONIAOROOT . "/api/payment/wxpay/WxPay.JsApiPay.php";
                $tools = new JsApiPay();
                $openId = $tools->GetOpenid();
            }

            $params['acct'] = $openId;  //用户的微信openid
        }

        //小程序端获取openid
        if($isWxMiniprogram){

            //sub_appid  微信子appid
            global $cfg_miniProgramAppid;
            $params['sub_appid'] = $cfg_miniProgramAppid;
            
            global $dsql;
            global $userLogin;
            $userid = $userLogin->getMemberID();
            $openId = '';
            $conn = '';
            $sql = $dsql->SetQuery("SELECT `wechat_mini_openid`, `wechat_conn` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $openId = $ret[0]['wechat_mini_openid'];
                $conn = $ret[0]['wechat_conn'];
            }
            if(!$openId){

                //读取unionid
                $sql = $dsql->SetQuery("SELECT `id`, `openid`, `unionid` FROM `#@__site_wxmini_unionid` WHERE `appid` = '$appid' AND `conn` = '$conn'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $miniProgram_openid = $ret[0]['openid'];
                    $miniProgram_unionid = $ret[0]['unionid'];

                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_mini_session` = '$miniProgram_unionid', `wechat_mini_openid` = '$miniProgram_openid' WHERE `id` = $userid");
                    $dsql->dsqlOper($sql, "update");

                    $openId = $miniProgram_openid;
                }
            }

            if(!$openId){
                if ($returnjson == 1) {
                    return json_encode(array('state' => 101, 'info' => 'openid获取失败', 'url_param' => $url_param));
                }else{

                    $this->displayHtml($order, $returnUrl, $orderurl, $openId, $url_param);
                
                }
            }

            $params['acct'] = $openId;  //用户的微信openid
        }

        //APP端
        if($app){

            //sub_appid  微信子appid
            global $cfg_miniProgramAppid;
            $params['sub_appid'] = $cfg_miniProgramAppid;
            
            $params['version'] = "12";
        }

        //生成签名
        $sign = $this->signer->sign($params, $payment['rsa_private_key']);

        $params['sign'] = $sign;  //签名

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_allinpay_wxpay = new CLogFileHandler(HUONIAOROOT . '/log/allinpay_wxpay/'.date('Y-m-d').'.log', true);
		$_allinpay_wxpay->DEBUG("报文：" . json_encode($params, JSON_UNESCAPED_UNICODE));

        //APP端支付需要使用通联支付收银台，前端跳转到微信APP的小程序中进行支付
        if($app){
            return $params;
        }

        //接口地址：https://vsp.allinpay.com/apiweb/unitorder/pay
        //测试地址：https://syb-test.allinpay.com/apiweb/unitorder/pay
        $ret = hn_curl('https://vsp.allinpay.com/apiweb/unitorder/pay', $params);
        $ret = json_decode($ret, true);

		$_allinpay_wxpay->DEBUG("接口返回：" . json_encode($ret, JSON_UNESCAPED_UNICODE));

        if(!isset($ret['retmsg'])) {
            $payinfo = $ret['payinfo'];

            //微信扫码支付的方式直接跳走
            if($paytype == 'W01'){
                header('location:' . $payinfo);
            }
            //JS支付方式
            elseif($paytype == 'W02'){

                $this->displayHtml($order, $returnUrl, $orderurl, $openId, $url_param, json_decode($payinfo, true));

            }
            //原生支付，返回支付参数
            elseif($paytype == 'W06' || $paytype == 'W11'){
                
                if($returnjson == 1){
                    return json_encode(array('state' => 100, 'info' => json_decode($payinfo, true), 'openid' => $openId, 'url_param' => $url_param));
                }
                else{
                    $this->displayHtml($order, $returnUrl, $orderurl, $openId, $url_param, json_decode($payinfo, true));
                }
            }
        }
        else{
            echo $ret['retmsg'];
        }
        die;

    }

    function displayHtml($order, $returnUrl, $orderurl, $openId, $url_param, $payinfo = array()){
        
        //配置页面信息
        $tpl = HUONIAOROOT."/templates/siteConfig/";
        $templates = "wxpayTouch.html";
        if(file_exists($tpl.$templates)){
            global $huoniaoTag;
            global $cfg_staticPath;
            global $cfg_basehost_;
            $huoniaoTag->template_dir = $tpl;
            $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
            $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
            $huoniaoTag->assign('ordernum', $order['order_sn']);
            $huoniaoTag->assign('returnUrl', $returnUrl);
            $huoniaoTag->assign('orderurl', $orderurl);
            $huoniaoTag->assign('jsApiParameters', json_encode($payinfo));
            $huoniaoTag->assign('openId', $openId);
            $huoniaoTag->assign('url_param', $url_param);
            $huoniaoTag->display($templates);
        }

    }

}
