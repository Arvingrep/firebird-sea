<?php
/**
 * YabandPay 微信
 *
 * @version        $Id: yabandpay_wxpay.php $v1.0 2021-2-20 上午10:04:20 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "yabandpay_wxpay";

	/* 名称 */
    $payment[$i]['pay_name'] = "YabandPay 微信";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '雅本传媒，荷兰数字新媒体行业的领先者，支持微信/支付宝多币种支付，接口文档：http://doc.yabandpay.com/web/#/6?page_id=114';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '收银员帐号',     'name' => 'user', 'type' => 'text'),
        array('title' => '密钥',           'name' => 'secret_key', 'type' => 'text'),
		array('title' => '货币',           'name' => 'currency', 'type' => 'select', 'options' => array(
			'EUR' => '欧元 - EUR',
			'CNY' => '人民币 - CNY',
			'HKD' => '港元 - HKD',
			'GBP' => '英镑 - GBP',
			'CHF' => '瑞士法郎 - CHF',
			'DKK' => '丹麦克朗 - DKK',
			'SEK' => '瑞典克朗 - SEK',
			'PLN' => '波兰兹罗提 - PLN',
			'NOK' => '挪威克朗 - NOK',
			'USD' => '美元	 - USD',
			'HUF' => '匈牙利福林 - HUF',
			'CZK' => '捷克克朗 - CZK'
		))
    );

    return;
}

/**
 * 类
 */
class yabandpay_wxpay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->yabandpay_wxpay();
    }

    function yabandpay_wxpay(){}

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

		define('EST_user', $payment['user']);    //账号
		define('EST_secret_key', $payment['secret_key']);  //密钥
		define('EST_currency', $payment['currency']);  //币种

		// 加载支付方式操作函数
		loadPlug("payment");

		$order_amount = sprintf("%.2f", $order['order_amount'] / $currency_rate);
		$paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

		//验证是否为小程序端
		$isWxMiniprogram = isWxMiniprogram();

		//支付参数
		$bizRequestContent = array(
			'user'    => EST_user,
			'method'    => $isWxMiniprogram ? 'v3.CreatePaymentsWechatMiniPay' : (isApp() || $app ? 'v3.CreatePaymentsWechatAPPPay' : 'v3.CreatePayments'),
			'time' => time(),
			'pay_method' => 'online',
			'sub_pay_method' => 'WeChat Pay',  //WeChat Pay，Alipay，YabandPay
			'order_id' => $order['order_sn'],
			'amount' => $order_amount,
			'currency' => EST_currency,
			'description' => $order['subject']."：".$order['order_sn'],
			'timeout' => '0',
			'redirect_url' => return_url("yabandpay_wxpay", $paramUrl),
			'notify_url' => notify_url("yabandpay_wxpay", $paramUrl),
		);

		//小程序端
		if($isWxMiniprogram){

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
			$bizRequestContent['sub_app_id'] = $cfg_miniProgramAppid;
			$bizRequestContent['sub_open_id'] = $openId;

		//APP端
        }elseif(isApp() || $app){

			//查询微信登录中的移动应用appid
			$sub_app_id = '';
			$data = array();
			$archives = $dsql->SetQuery("SELECT * FROM `#@__site_loginconnect` WHERE `state` = 1 AND `code` = 'wechat'");
			$loginData = $dsql->dsqlOper($archives, "results");
			if($loginData){
			    $config = unserialize($loginData[0]['config']);
			    foreach ($config as $key => $value) {
                    $data[$value['name']] = $value['value'];
                }
			    $sub_app_id = $data['appid_app'];
			}
			$bizRequestContent['sub_app_id'] = $sub_app_id;

		}

		ksort($bizRequestContent); // 参数按字典顺序排序

		$parts = array();
		foreach ($bizRequestContent as $k => $v) {
			$parts[] = $k . '=' . $v;
		}
		$str = implode('&', $parts);

		$sign = hash_hmac("sha256", $str, EST_secret_key); //注：HMAC-SHA256签名方式

		$_param = $bizRequestContent;
		unset($_param['user']);
		unset($_param['method']);
		unset($_param['time']);

		$params = array(
			'user' => $bizRequestContent['user'],
			'sign' => $sign,
			'method' => $bizRequestContent['method'],
			'time' => $bizRequestContent['time'],
			'data' => $_param
		);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/yabandpay/'.date('Y-m-d').'-create.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params));

		$httpHeader = array();
		$httpHeader[] = 'Content-Type:Application/json';

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://mapi.yabandpay.com/Payments');
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
			$_yabandPay->DEBUG("Result：" . json_encode($data));

			if($data['status'] && $data['code'] == 200){

				//更新transaction_id
				$trade_id = $data['data']['trade_id'];
				$sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `transaction_id` = '$trade_id' WHERE `ordernum` = '".$order["order_sn"]."'");
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
						$parameters = $data['data']['parameters'];

		                $huoniaoTag->template_dir = $tpl;
		                $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
		                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
		                $huoniaoTag->assign('ordernum', $order['order_sn']);
		                $huoniaoTag->assign('returnUrl', $returnUrl);
		                $huoniaoTag->assign('jsApiParameters', json_encode($parameters));
		                $huoniaoTag->display($templates);
						die;
		            }

				//APP端
				}elseif(isApp()){

					//配置页面信息
		            $tpl = HUONIAOROOT."/templates/member/touch/";
		            $templates = "public-app-pay.html";
		            if(file_exists($tpl.$templates)){
						global $huoniaoTag;
		                global $cfg_staticPath;
						$cfg_basehost_ = $cfg_secureAccess.$cfg_basehost;

						//APP支付必要参数
						$parameters = $data['data']['parameters'];

						$orderInfo = array(
			                "appId" => $parameters['appid'],
			                "partnerId" => $parameters['partnerid'],
			                "nonceStr"  => $parameters['noncestr'],
			                "package"   => $parameters['package'],
			                "prepayId"  => $parameters['prepayid'],
			                "timeStamp" => $parameters['timestamp'],
			                "sign"      => $parameters['sign']
			            );

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

				//h5端
				}else{
					header('location:' . $data['data']['url']);
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


    /**
     * 响应操作
     */
    function respond(){
		global $dsql;

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("yabandpay_wxpay");

        $order_sn = $_GET['sn'];

		define('EST_user', $payment['user']);    //账号
		define('EST_secret_key', $payment['secret_key']);  //密钥
		define('EST_currency', $payment['currency']);  //币种

		//根据订单号查询trade_id
		$trade_id = '';
		$sql = $dsql->SetQuery("SELECT `transaction_id` FROM `#@__pay_log` WHERE `ordernum` = '$order_sn'");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			$trade_id = $ret[0]['transaction_id'];
		}else{
			return false;
		}

        if(!$trade_id){
            return false;
        }

		//支付参数
		$bizRequestContent = array(
			'user'    => EST_user,
			'method'    => 'v3.QueryOrder',
			'time' => time(),
			'trade_id' => $trade_id
		);

		ksort($bizRequestContent); // 参数按字典顺序排序

		$parts = array();
		foreach ($bizRequestContent as $k => $v) {
			$parts[] = $k . '=' . $v;
		}
		$str = implode('&', $parts);

		$sign = hash_hmac("sha256", $str, EST_secret_key); //注：HMAC-SHA256签名方式

		$_param = $bizRequestContent;
		unset($_param['user']);
		unset($_param['method']);
		unset($_param['time']);

		$params = array(
			'user' => $bizRequestContent['user'],
			'sign' => $sign,
			'method' => $bizRequestContent['method'],
			'time' => $bizRequestContent['time'],
			'data' => $_param
		);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_yabandPay = new CLogFileHandler(HUONIAOROOT . '/log/yabandpay/'.date('Y-m-d').'-respond.log', true);
		$_yabandPay->DEBUG("报文：" . json_encode($params));

		$httpHeader = array();
		$httpHeader[] = 'Content-Type:Application/json';

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://mapi.yabandpay.com/Payments');
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
			$_yabandPay->DEBUG("Result：" . json_encode($data));

			if($data['status'] && $data['code'] == 200){

				$transaction_info = $data['data']['transaction_info'];
				$state = $transaction_info['state'];
				if($state == 'paid'){
					order_paid($order_sn, $trade_id);
					return true;
				}else{
					return false;
				}


			}else{
				return false;
				die($data['message']);
			}
		}else{
			$error = curl_error($ch);
			curl_close($ch);
			return false;
		}

    }

}
