<?php
/**
 * 支付宝快捷登录
 *
 * @version        $Id: alipay.php $v1.0 2015-2-14 下午14:24:15 $
 * @package        HuoNiao.Login
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.kumanyun.com/
 */

if(!defined('HUONIAOINC')) exit('Request Error!');

$logincode = basename(__FILE__, '.php');

/* 基本信息 */
if(isset($set_modules) && $set_modules == TRUE){

    $i = isset($login) ? count($login) : 0;

    /* 代码 */
    $login[$i]['code'] = $logincode;

	/* 名称 */
    $login[$i]['name'] = "支付宝快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=alipay";

    /* 版本号 */
    $login[$i]['version']  = '2.0.0';

    /* 描述 */
    $login[$i]['desc'] = '让6亿支付宝会员直接用支付宝账号登录您的网站，简单快捷的购物操作将帮助您获得更多订单！';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
		array('title' => '合作伙伴PID',  'name' => 'partner',  'type' => 'text'),
		array('title' => '开放平台应用APPID',  'name' => 'appid',         'type' => 'text'),
		// array('title' => '支付宝公钥',         'name' => 'alipayPublic',  'type' => 'textarea'),
		array('title' => '商户应用私钥',       'name' => 'appPrivate',    'type' => 'textarea'),
    );

    return;
}

/**
 * 类
 */
class Loginalipay {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginalipay();
    }

    function Loginalipay(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){
      $app_id = $data['appid'];
      $return_url = $data['callback'];

      header('location:https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id='.$app_id.'&scope=auth_user&redirect_uri='.$return_url);
    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

        global $logincode;
        $app_id = $data['appid'];
        $rsaPrivateKey = $data['appPrivate'];
        $alipayrsaPublicKey = $data['alipayPublic'];

        require_once (HUONIAOROOT . "/api/payment/alipay/aop/AopCertClient.php");
        require_once (HUONIAOROOT . "/api/payment/alipay/aop/request/AlipaySystemOauthTokenRequest.php");
        require_once (HUONIAOROOT . "/api/payment/alipay/aop/request/AlipayUserInfoShareRequest.php");

        //应用证书路径
        $appCertPath = HUONIAOROOT . "/api/payment/alipay/cert/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = HUONIAOROOT . "/api/payment/alipay/cert/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = HUONIAOROOT . "/api/payment/alipay/cert/alipayRootCert.crt";

        $c = new AopCertClient;
        $c->gatewayUrl = "https://openapi.alipay.com/gateway.do";
        $c->appId = $app_id;
        $c->rsaPrivateKey = $rsaPrivateKey;
        // $c->alipayrsaPublicKey = $alipayrsaPublicKey;

        /** 调用getPublicKey从支付宝公钥证书中提取公钥 **/
        $c->alipayrsaPublicKey = $c->getPublicKey($alipayCertPath);

        /** 是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内 **/
        $c->isCheckAlipayPublicCert = true;

        /** 调用getCertSN获取证书序列号 **/
        $c->appCertSN = $c->getCertSN($appCertPath);

        /** 调用getRootCertSN获取支付宝根证书序列号 **/
        // $c->alipayRootCertSN = $c->getRootCertSN($rootCertPath);
        $c->alipayRootCertSN = '687b59193f3f462dd5336e5abf83c5d8_02941eef3187dddf3d3b83462e1dfcf6';  //到2028年之前都不会变

        $c->apiVersion = '1.0';
        $c->format = "json";
        $c->charset = "utf-8";
        $c->signType= "RSA2";

        //获取access_token
        $request = new AlipaySystemOauthTokenRequest();
        $request->setGrantType("authorization_code");
        $request->setCode($return['auth_code']);
        $result = $c->execute($request);
        $result = objtoarr($result);

        if($result['error_response']){
          echo $result['error_response']['code']."<br />".$result['error_response']['sub_msg'];die;
        }

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $node = $result[$responseNode];
        $access_token = $node['access_token'];
        $refresh_token = $node['refresh_token'];
        $alipay_user_id = $node['alipay_user_id'];
        $user_id = $node['user_id'];

        //根据access_token获取用户信息
        $request = new AlipayUserinfoShareRequest();
        $result = $c->execute($request, $access_token);
        $result = objtoarr($result);

        if($result['error_response']){
          echo $result['error_response']['code']."<br />".$result['error_response']['sub_msg'];die;
        }

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $node = $result[$responseNode];
        $user_id   = $node['user_id'] ?: $node['open_id'];  //支付宝用户的userId
        $user_type = $node['user_type'];  //用户类型   1代表公司账户2代表个人账户
        $avatar    = $node['avatar'];  //头像
        $nick_name = $node['nick_name'];  //昵称  备注：截止20180814，用户类型为公司账户时没有昵称和性别字段
        $gender    = $node['gender'] == 'f' ? '女' : '男';

        //登录验证
        $userLogin = new userLogin($dbo);
        $data = array(
            "code"     => $logincode,
            "key"      => $user_id,
            "nickname" => $nick_name,
            "photo"    => $avatar,
            "gender"   => $gender,
			"state"    => $return['qr']
        );
        $userLogin->loginConnect($data);

    }

	/**
	 * APP登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function appback($data, $return){

        global $logincode;
        $app_id = $data['appid'];
        $rsaPrivateKey = $data['appPrivate'];
        $alipayrsaPublicKey = $data['alipayPublic'];

        require_once (HUONIAOROOT . "/api/payment/alipay/aop/AopCertClient.php");
        require_once (HUONIAOROOT . "/api/payment/alipay/aop/request/AlipaySystemOauthTokenRequest.php");
        require_once (HUONIAOROOT . "/api/payment/alipay/aop/request/AlipayUserInfoShareRequest.php");

        //应用证书路径
        $appCertPath = HUONIAOROOT . "/api/payment/alipay/cert/appCertPublicKey.crt";

        //支付宝公钥证书路径
        $alipayCertPath = HUONIAOROOT . "/api/payment/alipay/cert/alipayCertPublicKey_RSA2.crt";

        //支付宝根证书路径
        $rootCertPath = HUONIAOROOT . "/api/payment/alipay/cert/alipayRootCert.crt";

        $c = new AopCertClient;
        $c->gatewayUrl = "https://openapi.alipay.com/gateway.do";
        $c->appId = $app_id;
        $c->rsaPrivateKey = $rsaPrivateKey;
        // $c->alipayrsaPublicKey = $alipayrsaPublicKey;

        /** 调用getPublicKey从支付宝公钥证书中提取公钥 **/
        $c->alipayrsaPublicKey = $c->getPublicKey($alipayCertPath);

        /** 是否校验自动下载的支付宝公钥证书，如果开启校验要保证支付宝根证书在有效期内 **/
        $c->isCheckAlipayPublicCert = true;

        /** 调用getCertSN获取证书序列号 **/
        $c->appCertSN = $c->getCertSN($appCertPath);

        /** 调用getRootCertSN获取支付宝根证书序列号 **/
        $c->alipayRootCertSN = $c->getRootCertSN($rootCertPath);

        $c->apiVersion = '1.0';
        $c->format = "json";
        $c->charset = "utf-8";
        $c->signType= "RSA2";

        //获取access_token
        $request = new AlipaySystemOauthTokenRequest();
        $request->setGrantType("authorization_code");
        $request->setCode($return['access_token']);
        $result = $c->execute($request);
        $result = objtoarr($result);

        if($result['error_response']){
          echo $result['error_response']['code']."<br />".$result['error_response']['sub_msg'];die;
        }

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $node = $result[$responseNode];
        $access_token = $node['access_token'];
        $refresh_token = $node['refresh_token'];
        $alipay_user_id = $node['alipay_user_id'];
        $user_id = $node['user_id'];

        //根据access_token获取用户信息
        $request = new AlipayUserinfoShareRequest();
        $result = $c->execute($request, $access_token);
        $result = objtoarr($result);

        $responseNode = str_replace(".", "_", $request->getApiMethodName()) . "_response";
        $node = $result[$responseNode];
        $user_id   = $node['user_id'] ?: $node['open_id'];  //支付宝用户的userId
        $user_type = $node['user_type'];  //用户类型   1代表公司账户2代表个人账户
        $avatar    = $node['avatar'];  //头像
        $nick_name = $node['nick_name'];  //昵称  备注：截止20180814，用户类型为公司账户时没有昵称和性别字段
        $gender    = $node['gender'] == 'f' ? '女' : '男';

        //记录当前设备s
        $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
        $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
        $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
        //记录当前设备e

        //登录验证
        $userLogin = new userLogin($dbo);
        $data = array(
            "code"     => $logincode,
            "key"      => $user_id,
            "nickname" => $nick_name,
            "photo"    => $avatar,
            "gender"   => $gender,
            "deviceTitle" => $deviceTitle,
            "deviceSerial" => $deviceSerial,
            "deviceType" => $deviceType,
			"state"    => $return['qr'],
			"isapp" => 1
        );
        $userLogin->loginConnect($data);

    }

}
