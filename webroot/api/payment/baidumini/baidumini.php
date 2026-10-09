<?php
/**
 * 百度收银台（小程序）在线支付主文件
 *
 * @version        $Id: baidumini.php $v1.0 2020-12-22 上午11:26:18 $
 * @package        HuoNiao.Payment
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($payment) ? count($payment) : 0;

    /* 代码 */
    $payment[$i]['pay_code'] = "baidumini";

	/* 名称 */
    $payment[$i]['pay_name'] = "百度收银台";

    /* 版本号 */
    $payment[$i]['version']  = '1.0.0';

    /* 描述 */
    $payment[$i]['pay_desc'] = '百度小程序专用支付方式，支持度小满、微信、支付宝等';

    /* 作者 */
    $payment[$i]['author']   = '酷曼软件';

    /* 网址 */
    $payment[$i]['website']  = 'http://www.kumanyun.com';

    /* 配置信息 */
    $payment[$i]['config'] = array(
        array('title' => '手续费比例',         'name'=>'charge',         'type' => 'text',  'class' => 'input-small', 'description' => '通过该平台收款需要扣除的手续费比例，单位%，如：1/0.6/0.3等，该配置用于统计平台纯收入！'),
		array('title' => 'App Key',        'name' => 'client_id', 'type' => 'text'),
		array('title' => 'App Secret',     'name' => 'client_secret', 'type' => 'text'),
		array('title' => '支付dealId',     'name' => 'dealId', 'type' => 'text'),
        array('title' => '支付APP KEY	',   'name' => 'appKey', 'type' => 'text'),
		array('title' => '平台公钥',       'name' => 'publicKey', 'type' => 'textarea'),
		array('title' => '开发者私钥',     'name' => 'privateKey', 'type' => 'textarea')
    );

    return;
}

/**
 * 类
 */
class baidumini {

    protected $dealId;
    protected $appKey;
	protected $publicKey;
    protected $privateKey;
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

		// 加载支付方式操作函数
        loadPlug("payment");
        $payment  = get_payment("baidumini");

		$this->dealId = $payment['dealId'];
        $this->appKey = $payment['appKey'];
        $this->privateKey = $payment['privateKey'];
        $this->publicKey = $payment['publicKey'];

		require_once HUONIAOROOT . "/api/payment/baidumini/RSASign.php";
        $this->signer = $signer ?: new RSASign();

        $this->baidumini();
    }

    function baidumini(){}

    /**
     * 生成支付代码
     * @param   array   $order      订单信息
     * @param   array   $payment    支付方式信息
     */
    function get_code($order, $payment){

        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $cfg_soft_lang;
        global $currency_rate;
		global $userLogin;
        global $dsql;

		// 加载支付方式操作函数
		loadPlug("payment");

		$totalAmount = (sprintf("%.2f", $order['order_amount'] / $currency_rate)) * 100;

		$params = [
            'appKey'    => $this->appKey,
            'dealId'    => $this->dealId,
			'totalAmount' => $totalAmount,
            'tpOrderId' => $order['order_sn']
        ];

        $sign = $this->signer->sign($params, $this->privateKey);

		$orderInfo = array(
			'dealId' => $this->dealId,
			'appKey' => $this->appKey,
			'totalAmount' => $totalAmount,
			'tpOrderId' => $order['order_sn'],
			'dealTitle' => $order['subject'],
			'rsaSign' => $sign,
			'signFieldsRange' => 1,
			'bizInfo' => array(),
		);

		$isBaiDuMiniprogram = GetCookie('isBaiDuMiniprogram');
		if($isBaiDuMiniprogram){

			//初始化日志
			require_once dirname(__FILE__)."/../log.php";
			$_baiduMiniPay = new CLogFileHandler(HUONIAOROOT . '/log/baidumini/'.date('Y-m-d').'-create.log');
			$_baiduMiniPay->DEBUG("报文：" . json_encode($orderInfo));

			//配置页面信息
			$tpl = HUONIAOROOT."/api/payment/baidumini/";
			$templates = "pay.html";
			if(file_exists($tpl.$templates)){
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

				$huoniaoTag->template_dir = $tpl;
				$huoniaoTag->assign('cfg_basehost', $cfg_basehost_);
				$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
				$huoniaoTag->assign('ordernum', $order['order_sn']);
				$huoniaoTag->assign('returnUrl', $returnUrl);
				$huoniaoTag->assign('orderInfo', json_encode($orderInfo));
				$huoniaoTag->display($templates);
				die;
			}else{
				die('支付模板加载失败，请同步丢失的文件！');
			}
		}else{
			die('请在百度小程序中使用！');
		}

    }


    /**
     * 响应操作
     */
    function respond(){

		$tpOrderId  = $_POST['tpOrderId'];  //传回的订单号
		$totalMoney = $_POST['totalMoney'];  //传回的订单金额
		$orderId    = $_POST['orderId'];  //百度平台订单号
		$userId     = $_POST['userId'];  //百度收银台用户id

		/* 检查支付的金额是否相符 */
        if (!check_money($tpOrderId, $totalMoney/100)){
			return false;
		}

		//验签
        $sign = $this->signer->checkSign($_POST, $this->publicKey);

		if($sign){
			order_paid($tpOrderId, $orderId, $userId);
			return true;
		}else{
			return false;
		}

    }

}
