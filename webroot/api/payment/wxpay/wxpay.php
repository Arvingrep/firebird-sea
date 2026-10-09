<?php
/**
 * 微信扫码支付主文件
 *
 * @version        $Id: wxpay.php $v1.0 2015-12-10 下午23:35:11 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "wxpay";

	/* 名称 */
    $payment[$i]['pay_name'] = "微信扫码支付";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '用户使用微信“扫一扫”扫描二维码后，引导用户完成支付。';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',            'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
        array('title' => '网页支付',              'type' => 'split',        'description' => '适用于：PC端、公众号端、小程序端、H5端'),
		array('title' => '服务号 APPID',          'name' => 'APPID',        'type' => 'text'),
        array('title' => '服务号 APPSECRET',      'name' => 'APPSECRET',    'type' => 'text'),
		array('title' => '商户平台 商户号',        'name' => 'MCHID',        'type' => 'text'),
		array('title' => '商户平台 API密钥(KEY)',  'name' => 'KEY',          'type' => 'text'),
        array('title' => 'APP支付',               'type' => 'split',        'description' => '如果移动应用的微信支付直接关联了公众号申请好的商户号，下方的商户号和API密钥(KEY)直接填写网页支付的商户号和API密钥(KEY)即可！<br />如果单独给移动应用接入了微信支付，需要填写单独申请好的商户号和API密钥(KEY)！'),
		array('title' => '开放平台 APPID',        'name' => 'APP_APPID',     'type' => 'text'),
        array('title' => '开放平台 APPSECRET',    'name' => 'APP_APPSECRET', 'type' => 'text'),
		array('title' => '商户平台 商户号',        'name' => 'APP_MCHID',     'type' => 'text'),
		array('title' => '商户平台 API密钥(KEY)',  'name' => 'APP_KEY',       'type' => 'text'),
        array('title' => '服务商模式',             'type' => 'split',       'description' => '可选模式，主要用于分账，如果没有申请服务商，可以不配置！<br />开启服务商模式后，需要为商家申请特约商户并将特约商户号填写到商家资料中，网页支付/APP支付的 <u>商户平台商户号</u> 和 <u>商户平台API密钥(KEY)</u> <font color="green">可以留空</font>！<br />如果开启了服务商模式，但是商家又没有申请特约商户，交易将支付到平台配置的默认微信商户中（这种情况，网页支付/APP支付的 <u>商户平台商户号</u> 和 <u>商户平台API密钥(KEY)</u> <font color="red">必须配置</font>，否则将支付失败）。'),
		array('title' => '服务商平台 商户名称',      'name' => 'PARTNER_NAME',  'type' => 'text'),
		array('title' => '服务商平台 商户号',        'name' => 'PARTNER_MCHID',  'type' => 'text'),
		array('title' => '服务商平台 API密钥(KEY)',  'name' => 'PARTNER_KEY',    'type' => 'text'),
    );

    return;
}

/**
 * 类
 */
class wxpay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->wxpay();
    }

    function wxpay(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment,$returnjson=0){

        // 加载支付方式操作函数
        loadPlug("payment");
        global $app;  //是否为客户端app支付
        global $huoniaoTag;
        global $cfg_basehost;
        global $cfg_webname;
        global $cfg_shortname;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $cfg_secureAccess;
        global $dsql;
        global $userLogin;
        $cfg_basehost_ = $cfg_secureAccess.$cfg_basehost;
        $notify_url = $cfg_basehost_.'/api/payment/wxpayNotify.php';

		//=======【curl代理设置】===================================
		/**
		 * TODO：这里设置代理机器，只有需要代理的时候才设置，不需要代理，请设置为0.0.0.0和0
		 * 本例程通过curl使用HTTP POST方法，此处可修改代理服务器，
		 * 默认CURL_PROXY_HOST=0.0.0.0和CURL_PROXY_PORT=0，此时不开启代理（如有需要才设置）
		 * @var unknown_type
		 */
		define('CURL_PROXY_HOST', "0.0.0.0");
		define('CURL_PROXY_PORT', 0);
	    define('REPORT_LEVENL', 1);

        //如果商家配置了特约商户号 并且 系统配置了 服务商模式
        $isPartner = false;
        if($order['submchid'] && $payment['PARTNER_MCHID'] && $payment['PARTNER_KEY']){
            $isPartner = true;

            define('MCHID', $payment['PARTNER_MCHID']);  //服务商商户号
            define('KEY', $payment['PARTNER_KEY']);  //服务商平台 API密钥(KEY)
            define('SUBMCHID', $order['submchid']);  //特约商户号（后台大商家列表详情页设置）
        }

        global $currency_rate;
        $order_amount = (sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100;

        require_once "WxPay.Api.php";

        //小程序
        $isWxMiniprogram = isWxMiniprogram();

        $ownWxminiprogram = 0;  //是否独立小程序

        if($app && !$isWxMiniprogram){
            define('APPID', $payment['APP_APPID']);
            define('APPSECRET', $payment['APP_APPSECRET']);

            if(!$isPartner){
                define('MCHID', $payment['APP_MCHID']);
                define('KEY', $payment['APP_KEY']);
            }

        }elseif($isWxMiniprogram){
            global $cfg_miniProgramAppid;
            global $cfg_miniProgramAppsecret;

            $appid = $_GET['appid'];  //由小程序端传过来当前正在使用的小程序appid

            //验证分站是否绑定的独立小程序
            if($appid && $appid != $cfg_miniProgramAppid){
                $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `config` LIKE '%$appid%' ORDER BY `id` DESC LIMIT 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $config = $ret[0]['config'];
                    $config = unserialize($config);
                    if(is_array($config)){
                        $cfg_miniProgramAppid = $config['siteConfig']['miniProgramAppid'];
                        $cfg_miniProgramAppsecret = $config['siteConfig']['miniProgramAppsecret'];

                        if(!$cfg_miniProgramAppid || !$cfg_miniProgramAppsecret){
                            die("该小程序在系统后台绑定错误，请检查后重试！");
                        }

                        $ownWxminiprogram = 1;
                    }else{
                        die("该小程序在系统后台绑定错误，请检查后重试！");
                    }
                }else{
                    die("该小程序未在系统后台绑定，请检查后重试！");
                }
            }

            define('APPID', $cfg_miniProgramAppid);
            define('APPSECRET', $cfg_miniProgramAppsecret);

            if(!$isPartner){
                define('MCHID', $payment['MCHID']);
                define('KEY', $payment['KEY']);
            }

        }else{
            define('APPID', $payment['APPID']);
            define('APPSECRET', $payment['APPSECRET']);

            if(!$isPartner){
                define('MCHID', $payment['MCHID']);
                define('KEY', $payment['KEY']);
            }
        }

        //内容最长40个字
        $order['subject'] = strlen($order['subject']) > 20 ? cn_substrR($order['subject'], 20) : $order['subject'];

        //客户端APP支付
        if($app && !$isWxMiniprogram){

            $input = new WxPayUnifiedOrder();
            $input->SetBody($order['subject']."：".$order['order_sn']);
            $input->SetAttach("huoniaoCMS");
            $input->SetOut_trade_no($order['order_sn']);
            $input->SetTotal_fee($order_amount);
            $input->SetTime_start(date("YmdHis"));

            if($order['service'] =='waimai'){
                $input->SetTime_expire(date("YmdHis", time() + 1800));
            }

            $input->SetGoods_tag("huoniaoCMS");
            $input->SetNotify_url($cfg_basehost_.'/api/payment/wxpayAppNotify.php');
            $input->SetTrade_type("APP");

            if($isPartner){
                $input->SetSub_mch_id(SUBMCHID);  //微信支付分配的子商户号
                $input->SetProfit_sharing('Y');  //Y-是，需要分账  N-否，不分账  字母要求大写，不传默认不分账
            }


            $wxorder = WxPayApi::unifiedOrder($input);
			if($wxorder['return_code'] == "FAIL" || $wxorder['result_code'] == "FAIL"){

				$msg = "APP支付失败，错误信息：" . ($wxorder['result_code'] == "FAIL" ? $wxorder['err_code_des'] : $wxorder['return_msg']) . "，请重新支付！";

				if ($returnjson == 1) {

                    return $msg;
                }
				global $cfg_staticVersion;

				$html = <<<eot
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;" />
<script type="text/javascript" src="/static/js/core/touchScale.js?v={$cfg_staticVersion}"></script>
<script type="text/javascript" src="/static/js/core/zepto.min.js?v={$cfg_staticVersion}"></script>
<script>
$(function(){
	alert('{$msg}');
	setTimeout(function(){
		setupWebViewJavascriptBridge(function(bridge) {
			bridge.callHandler('goBack', {}, function(responseData){});
		});
	}, 1000);
});
</script>
</head>
<body>
</body>
</html>
eot;
		echo $html;die;
            }

            $param              = array();
            $param["appid"]     = $wxorder["appid"];
            $param["partnerid"] = $isPartner ? SUBMCHID : $wxorder["mch_id"];
            $param["noncestr"]  = $wxorder["nonce_str"];
            $param["package"]   = "Sign=WXPay";
            $param["prepayid"]  = $wxorder["prepay_id"];
            $param["timestamp"] = time();
            ksort($param);

            $paramStr = "";
            foreach ($param as $key => $val){
                $paramStr .= $key."=".$val."&";
            }
            $param["sign"] = strtoupper(md5($paramStr."key=". ($isPartner ? $payment['PARTNER_KEY'] : $payment['APP_KEY'])));

            //对数据重新拼装
            $orderInfo = array(
                "appId" => $param['appid'],
                "partnerId" => $param['partnerid'],
                "nonceStr"  => $param['noncestr'],
                "package"   => $param['package'],
                "prepayId"  => $param['prepayid'],
                "timeStamp" => $param['timestamp'],
                "sign"      => $param['sign']
            );

            //初始化日志
            require_once dirname(__FILE__)."/../log.php";
			$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/weixinAppPay/'.date('Y-m-d').'.log', true);
            $_weixinAppPay->DEBUG(json_encode($wxorder));
            $_weixinAppPay->DEBUG(json_encode($param));
            $_weixinAppPay->DEBUG(json_encode($orderInfo));
            $_weixinAppPay->DEBUG("\r\n");


            if ($returnjson == 1) {

                return $orderInfo;
            }
            //配置页面信息
            $tpl = HUONIAOROOT."/templates/member/touch/";
            $templates = "public-app-pay.html";
            if(file_exists($tpl.$templates)){
                $huoniaoTag->template_dir = $tpl;
                $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                $huoniaoTag->assign('appCall', "wechatPay");
                $huoniaoTag->assign('service', $order['service']);
                $huoniaoTag->assign('ordernum', $order['ordernum']);
                $huoniaoTag->assign('orderInfo', json_encode($orderInfo));
                $huoniaoTag->display($templates);
            }

            die;
        }



        //无线支付
        if(isMobile()){

          //公众号支付
          if(isWeixin()){
            //根据支付订单号查询商品订单号
            global $dsql;
			$payBody = array();
            $sql = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordernum` = '".$order['order_sn']."'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
				$payBody = unserialize($ret[0]['body']);
			}

              // $RenrenCrypt = new RenrenCrypt();
              // $encodeid = base64_encode($RenrenCrypt->php_encrypt($ret[0]['body']));

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


              /*订单详情url 给发起支付并未支付使用*/

              if (strstr($order['order_sn'], ",")) {
                  $paramurl = array(
                      "service"  => "member",
                      "type"     => "user",
                      "template" => "order",
                      "module"   => $order['service']
                  );
                  $orderurl   = getUrlPath($paramurl);

              } else {
                  $orderurl = orderDetailUrl($order['service'],$order['order_sn']);
              }

              /*end*/

              putSession('wxPayReturnUrl', $returnUrl);
            //}else{
              //$returnUrl = $cfg_basehost_;
            //}

            require_once "WxPay.JsApiPay.php";
            //①、获取用户openid
            $tools = new JsApiPay();
            $userid = $userLogin->getMemberID();
            if($isWxMiniprogram){

                $url_param = '';
                $openId = '';
                $conn = '';
                $sql = $dsql->SetQuery("SELECT `wechat_mini_openid`, `wechat_conn` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $openId = $ownWxminiprogram ? '' : $ret[0]['wechat_mini_openid'];
                    $conn = $ret[0]['wechat_conn'];
                }
                if(!$openId){

                    //读取unionid
                    $sql = $dsql->SetQuery("SELECT `id`, `openid`, `unionid` FROM `#@__site_wxmini_unionid` WHERE `appid` = '$appid' AND `conn` = '$conn'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $_unionid = $ret[0]['id'];
                        $miniProgram_openid = $ret[0]['openid'];
                        $miniProgram_unionid = $ret[0]['unionid'];

                        //独立小程序时，只使用获取到的openid，不更新用户信息
                        if(!$ownWxminiprogram){
                            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_mini_session` = '$miniProgram_unionid', `wechat_mini_openid` = '$miniProgram_openid' WHERE `id` = $userid");
                            $dsql->dsqlOper($sql, "update");

                            //用完后删除记录
                            // $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_unionid` WHERE `id` = $_unionid");
                            // $dsql->dsqlOper($sql, "update");
                        }
                        $openId = $miniProgram_openid;

                    }else{

                        //没有小程序openid的情况
                        // 下单后，接口端如果获取不到用户的wxmini_openid，直接告诉页面openid=0，否则openid=xxxxxx
                        // param=base64_encode(service=member&ction=xxxxxxx)
                        // 如果openid==0，/pages/pay/pay?openid=0&param=param
                        // pay页面判断如果openid==0，则调用wx.login，获取wx的code，
                        // 把code和业务参数一起再请求下单接口，最终拿到支付用的数据。
                        // /include/ajax.php?param + &wxmini_code=code
                        // 在common.func.php的createPayForm方法中根据wxmini_code去获取wxmini_openid

                        //获取当前所有url参数
                        $url_param = $_SERVER['QUERY_STRING'];
                        $url_param = base64_encode(str_replace('undefined', '', $url_param));

						// //已经绑定过微信快捷登录，但是没有登录小程序登录的
                    	// if($conn){

	                    // 	$userLogin->exitMember();

                        //     $str = '账号异常，请在小程序端使用微信快捷登录重新授权登录！';
                        //     if ($returnjson == 1) {
                        //         return json_encode(array('state' => 200, 'info' => $str));
                        //     }else{
                        //         $param = array(
                        //             'service' => 'member',
                        //             'type' => 'user'
                        //         );
                        //         $url = getUrlPath($param);
	                    // 	    die("<script>alert('".$str."');location.href='/login.html?furl=".$url."';</script>");
                        //     }

                    	// //未绑定过微信快捷登录，先提示绑定
                    	// }else{
                        //     $str = '请先在我的会员中心=>安全中心=>社交账号关联绑定中，绑定微信快捷登录，然后再支付！';
                        //     if($returnjson == 1){
                        //         return json_encode(array('state' => 200, 'info' => $str));
                        //     }else{
                        //         $param = array(
                        //             'service' => 'member',
                        //             'type' => 'user',
                        //             'template' => 'connect'
                        //         );
                        //         $url = getUrlPath($param);
                        //         die("<script>alert('".$str."');location.href='".$url."';</script>");
                        //     }
                    	// }

                    }

                }

            } else{

                $openId = $tools->GetOpenid();

                /*提交订单前返回openid*/
            }

			//初始化日志
            require_once dirname(__FILE__)."/../log.php";
			$_weixinPay = new CLogFileHandler(HUONIAOROOT . '/log/weixinPay/'.date('Y-m-d').'.log', true);
            $_weixinPay->DEBUG(json_encode($order, JSON_UNESCAPED_UNICODE));

            //有openid的，直接下单
            if($openId){
                //②、统一下单
                $input = new WxPayUnifiedOrder();
                $input->SetBody($order['subject']."：".$order['order_sn']);
                $input->SetAttach("huoniaoCMS");
                $input->SetOut_trade_no($order['order_sn']);
                $input->SetTotal_fee($order_amount);
                $input->SetTime_start(date("YmdHis"));
                if($order['service'] =='waimai'){
                    $input->SetTime_expire(date("YmdHis", time() + 1800));
                }
                $input->SetGoods_tag("huoniaoCMS");
                $input->SetNotify_url($notify_url);
                $input->SetTrade_type("JSAPI");

                if($isPartner){
                    $input->SetSub_mch_id(SUBMCHID);  //微信支付分配的子商户号
                    $input->SetProfit_sharing('Y');  //Y-是，需要分账  N-否，不分账  字母要求大写，不传默认不分账
                }

                $input->SetOpenid($openId);
                $order = WxPayApi::unifiedOrder($input);
                $_weixinPay->DEBUG(json_encode($order, JSON_UNESCAPED_UNICODE));

                if($order['return_code'] == "FAIL"){
                    die("公众号支付错误：" . $order['return_msg'] . " => " . $order['err_code_des'] . " => openid:" . $openId . ',conn:' . $conn);
                }
                if($order['result_code'] == "FAIL"){
                    if(strstr($order['err_code_des'], '订单号重复')){
                        die('请在下单时的终端进行付款，或者先取消订单，重新下单再支付！');
                    }
                    die("公众号支付错误：" . $order['err_code_des']);
                }

                $jsApiParameters = $tools->GetJsApiParameters($order);

                if($returnjson == 1){
                    return json_encode(array('state' => 100, 'info' => json_decode($jsApiParameters, true)));
                }
            }

            //配置页面信息
            $tpl = HUONIAOROOT."/templates/siteConfig/";
            $templates = "wxpayTouch.html";
            if(file_exists($tpl.$templates)){
                global $huoniaoTag;
                global $cfg_staticPath;
                $huoniaoTag->template_dir = $tpl;
                $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                $huoniaoTag->assign('ordernum', $order['order_sn']);
                $huoniaoTag->assign('returnUrl', $returnUrl);
                $huoniaoTag->assign('orderurl', $orderurl);
                $huoniaoTag->assign('jsApiParameters', $jsApiParameters);
                $huoniaoTag->assign('openId', $openId);
                $huoniaoTag->assign('url_param', $url_param);
                $huoniaoTag->display($templates);
            }


          //H5支付
          }else{

            $out_trade_no = $order['order_sn'];//平台内部订单号
            $nonce_str = MD5($out_trade_no);//随机字符串
            $body = $order['subject'];//内容
            $total_fee = $order_amount; //金额
            $spbill_create_ip = GetIP(); //IP
            $notify_url = $notify_url; //回调地址
            $trade_type = 'MWEB';//交易类型 具体看API 里面有详细介绍
            $scene_info ='{"h5_info":{"type":"Wap","wap_url":"'.$cfg_basehost_.'","wap_name":"'.$cfg_shortname.'"}}';//场景信息 必要参数
            $signA ="appid=".APPID."&body=$body&mch_id=".MCHID."&nonce_str=$nonce_str&notify_url=$notify_url&out_trade_no=$out_trade_no".($isPartner ? "&profit_sharing=Y" : "")."&scene_info=$scene_info&spbill_create_ip=$spbill_create_ip".($isPartner ? "&sub_mch_id=".SUBMCHID : "")."&total_fee=$total_fee&trade_type=$trade_type";
            $strSignTmp = $signA."&key=".KEY; //拼接字符串  注意顺序微信有个测试网址 顺序按照他的来 直接点下面的校正测试 包括下面XML  是否正确
            $sign = strtoupper(MD5($strSignTmp)); // MD5 后转换成大写
            $post_data = "<xml>
                           <appid><![CDATA[".APPID."]]></appid>
                           <body><![CDATA[$body]]></body>
                           <mch_id><![CDATA[".MCHID."]]></mch_id>
                           ".($isPartner ? "<sub_mch_id><![CDATA[".SUBMCHID."]]></sub_mch_id><profit_sharing><![CDATA[Y]]></profit_sharing>" : "")."
                           <nonce_str><![CDATA[$nonce_str]]></nonce_str>
                           <notify_url><![CDATA[$notify_url]]></notify_url>
                           <out_trade_no><![CDATA[$out_trade_no]]></out_trade_no>
                           <scene_info><![CDATA[$scene_info]]></scene_info>
                           <spbill_create_ip><![CDATA[$spbill_create_ip]]></spbill_create_ip>
                           <total_fee><![CDATA[$total_fee]]></total_fee>
                           <trade_type><![CDATA[$trade_type]]></trade_type>
                           <sign><![CDATA[$sign]]></sign>
                       </xml>";//拼接成XML 格式
            $url = "https://api.mch.weixin.qq.com/pay/unifiedorder";//微信传参地址

			//初始化日志
            require_once dirname(__FILE__)."/../log.php";
			$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/weixinPay/'.date('Y-m-d').'.log', true);
            $_weixinAppPay->DEBUG($post_data);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL,$url);
            curl_setopt($ch, CURLOPT_HEADER,0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $dataxml = curl_exec($ch);
            if ($dataxml === FALSE){
    			    echo 'cURL Error:'.curl_error($ch);
      			}
            curl_close($ch);
            $objectxml = (array)simplexml_load_string($dataxml, 'SimpleXMLElement', LIBXML_NOCDATA); //将微信返回的XML 转换成数组

            //成功
            if($objectxml['return_code'] == 'SUCCESS' && $objectxml['result_code'] == 'SUCCESS'){
                if($returnjson == 1){

                    header("Location:" . $objectxml['mweb_url']);
                }else{

                    return $objectxml['mweb_url'];
                }
            }else{
              die('H5支付错误：' . $objectxml['return_code'] . " => " . $objectxml['return_msg'] . " => " . $objectxml['err_code_des']);
            }
            die;

          }


        //PC端支付
        }else{


            //=======【上报信息配置】===================================
            /**
             * TODO：接口调用上报等级，默认紧错误上报（注意：上报超时间为【1s】，上报无论成败【永不抛出异常】，
             * 不会影响接口调用流程），开启上报之后，方便微信监控请求调用的质量，建议至少
             * 开启错误上报。
             * 上报等级，0.关闭上报; 1.仅错误出错上报; 2.全量上报
             * @var int
             */

            require_once "WxPay.NativePay.php";


            //组合付款参数，并生成付款URL
            $notify = new NativePay();
            $input = new WxPayUnifiedOrder();
            $input->SetBody($order['subject']."：".$order['order_sn']);
            $input->SetOut_trade_no($order['order_sn']);
            $input->SetTotal_fee($order_amount);
            $input->SetTime_start(date("YmdHis"));
            if($order['service'] =='waimai'){
                $input->SetTime_expire(date("YmdHis", time() + 1800));
            }

            $input->SetNotify_url($notify_url);
            $input->SetTrade_type("NATIVE");

            if($isPartner){
                $input->SetSub_mch_id(SUBMCHID);  //微信支付分配的子商户号
                $input->SetProfit_sharing('Y');  //Y-是，需要分账  N-否，不分账  字母要求大写，不传默认不分账
            }

            $input->SetProduct_id($order['subject']);
            $result = $notify->GetPayUrl($input);
            if($result['return_code'] == "FAIL"){
                die("PC支付错误：" . $result['return_msg'] . " => " . $order['err_code_des']);
            }
            $url = $result["code_url"];
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


    }


}
