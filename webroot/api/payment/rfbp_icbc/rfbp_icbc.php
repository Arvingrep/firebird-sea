<?php
/**
 * 工行E商通在线支付主文件
 *
 * @version        $Id: rfbp_icbc.php $v1.0 2020-10-28 下午18:29:16 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "rfbp_icbc";

	/* 名称 */
    $payment[$i]['pay_name'] = "工行E商通";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '中国工商银行版权所有，支持商户费用自动到账。';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => '商户号',         'name' => 'mchid', 'type' => 'text'),
        array('title' => '商户私钥',       'name' => 'prikey', 'type' => 'textarea'),
		array('title' => '商户公钥',       'name' => 'pubkey', 'type' => 'textarea'),
		array('title' => '服务商编号',     'name' => 'merid', 'type' => 'text'),
		array('title' => '服务商协议号',   'name' => 'merprtclno', 'type' => 'text'),
		array('title' => '服务商AppID',    'name' => 'icbcappid', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class rfbp_icbc {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->rfbp_icbc();
    }

    function rfbp_icbc(){}

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

		define('EST_mchid', $payment['mchid']);    //商户号
		define('EST_prikey', $payment['prikey']);  //商户私钥
		define('EST_pubkey', $payment['pubkey']);  //商户公钥
		define('EST_icbcappid', $payment['icbcappid']);  //服务商AppID

		// 加载支付方式操作函数
		loadPlug("payment");

        require_once "ESTApi.php";
		$ESTApi = new ESTApi("prod"); //正式环境

		$order_amount = (sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100;
		$paramUrl = "&module=".$order['service']."&sn=".$order['order_sn'];

		$isWxMiniprogram = isWxMiniprogram();
		$extra = '';

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
			$extra = "{'accessType':9,'payMode':9,'appId':'$cfg_miniProgramAppid','openId':'$openId'}";
		}

		$bizRequestContent = [
		    "clientIp" => GetIP(),
		    "mchOrderNo" => $order['order_sn'], //需唯一值
		    "totalAmount" => $order_amount,
		    "goodsName" => $order['subject']."：".$order['order_sn'],
		    "goodsDesc" => "",
		    "payWayCode" => $isWxMiniprogram ? "20001" : "20002",  //10001：小程序支付，10002:二维码，20001：新一体化B2C聚合支付（无界面），20002新一体化B2C聚合支付（有界面）
		    "notifyUrl" => notify_url("rfbp_icbc", $paramUrl),
		    "returnUrl" => return_url("rfbp_icbc", $paramUrl),
		    "expireTime" => "3600",
			"extra" => $extra
		];

		$data = [
		    "appId" => EST_icbcappid,
		    "timestamp" => date("YmdHis000"),
		    "msgId" => $ESTApi->makeMsgId(),
		    "signType" => "RSA2",
		    "encryptType" => "AES",
		    "bizRequestContent" => $ESTApi->jsonEncode($bizRequestContent)
		];

		$res = $ESTApi->payCreate($data);
		if($res === false){
		    die($ESTApi->getError());
		}
		$res = json_decode($res, true);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/rfbp_icbc/'.date('Y-m-d').'-create.log');
		$_weixinAppPay->DEBUG("报文：" . json_encode($data));
		$_weixinAppPay->DEBUG("Result：" . json_encode($res));

		if($res['bizResponseContent']['success'] == true){
			//移动端跳转支付
			if(isMobile()){

				$payParam = $res['bizResponseContent']['result']['payParam'];

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

		                $payParam = json_decode($payParam, true);
						$signData = json_decode($payParam['signData'], true);
						$signData['timeStamp'] = $signData['timestamp'];
						$signData['nonceStr'] = $signData['noncestr'];
						$signData['paySign'] = $signData['sign'];

		                $huoniaoTag->template_dir = $tpl;
		                $huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
		                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
		                $huoniaoTag->assign('ordernum', $order['order_sn']);
		                $huoniaoTag->assign('returnUrl', $returnUrl);
		                $huoniaoTag->assign('jsApiParameters', json_encode($signData));
		                $huoniaoTag->display($templates);
						die;
		            }
				}else{
					echo $payParam;die;
				}

			//电脑端展示二维码
			}else{

				// $url = $res['bizResponseContent']['result']['payParam'];
				$url = $cfg_secureAccess.$cfg_basehost.'/include/qrPay.php?' . http_build_query($order);

				//配置页面信息
	            $tpl = HUONIAOROOT."/api/payment/rfbp_icbc/";
	            $templates = "pay.html";
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

		//创建失败
		}else{
			die($res['bizResponseContent']['summary']);
		}

    }


    /**
     * 响应操作
     */
    function respond(){

        // 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("rfbp_icbc");

        $order_sn = $_GET['sn'];

		require_once "ESTApi.php";
		$ESTApi = new ESTApi("prod"); //正式环境

		define('EST_mchid', $payment['mchid']);    //商户号
		define('EST_prikey', $payment['prikey']);  //商户私钥
		define('EST_pubkey', $payment['pubkey']);  //商户公钥
		define('EST_icbcappid', $payment['icbcappid']);  //服务商AppID

		$bizRequestContent = [
		    "mchOrderNo" => $order_sn,
		    "orderNo" => ""
		];

		$data = [
		    "appId" => EST_icbcappid,
		    "timestamp" => date("YmdHis000"),
		    "msgId" => $ESTApi->makeMsgId(),
		    "signType" => "RSA2",
		    "encryptType" => "AES",
		    "bizRequestContent" => $ESTApi->jsonEncode($bizRequestContent)
		];

		$res = $ESTApi->payQuery($data);

		//初始化日志
		require_once dirname(__FILE__)."/../log.php";
		$_weixinAppPay = new CLogFileHandler(HUONIAOROOT . '/log/rfbp_icbc/'.date('Y-m-d').'-respond.log');
		$_weixinAppPay->DEBUG('rfbp_icbc_get:'.json_encode($_GET));
		$_weixinAppPay->DEBUG('rfbp_icbc_res:'.json_encode($res));

		if($res === false){
			$_weixinAppPay->DEBUG(json_encode($ESTApi->getError()));
			return false;
		}
		$res = json_decode($res, true);

		if($res['bizResponseContent']['success'] == true && $res['bizResponseContent']['result']['status'] == "3"){
			$_weixinAppPay->DEBUG("成功" . $res['bizResponseContent']['result']['channelPayOrderNo']);
			order_paid($order_sn, $res['bizResponseContent']['result']['channelPayOrderNo'], $res['bizResponseContent']['result']['orderNo']);
			return true;
		}else{
			$_weixinAppPay->DEBUG("失败");
			return false;
		}

    }

}
