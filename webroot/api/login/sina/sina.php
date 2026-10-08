<?php
/**
 * 新浪微博快捷登录
 *
 * @version        $Id: sina.php $v1.0 2015-2-14 下午14:24:15 $
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
    $login[$i]['name'] = "新浪微博快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=sina";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = '使用微博帐号访问你的网站，分享内容，同步信息。带入微博活跃用户，提升网站的用户数和访问量。';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
        array('title' => '网站应用', 'type' => 'split'),
		array('title' => 'WB_AKEY',   'name' => 'akey',  'type' => 'text'),
		array('title' => 'WB_SKEY',   'name' => 'skey',  'type' => 'text'),
        array('title' => '移动应用', 'type' => 'split'),
		array('title' => 'WB_AKEY',   'name' => 'akey_app',  'type' => 'text'),
		array('title' => 'WB_SKEY',   'name' => 'skey_app',  'type' => 'text'),
    );

    return;
}

/**
 * 类
 */
class Loginsina {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginsina();
    }

    function Loginsina(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){
        include_once(dirname(__FILE__)."/saetv2.ex.class.php");
        $o = new SaeTOAuthV2($data['akey'] , $data['skey']);
        $login_url = $o->getAuthorizeURL($data['callback']);
        header("Location:$login_url");
    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

        global $logincode;

        include_once(dirname(__FILE__)."/saetv2.ex.class.php");
        $o = new SaeTOAuthV2($data['akey'], $data['skey']);

        if (isset($return['code'])){
            $keys = array();
            $keys['code'] = $return['code'];
            $keys['redirect_uri'] = $data['callback'];
            try {
                $token = $o->getAccessToken('code', $keys) ;
            } catch (OAuthException $e) {}
        }

        if ($token) {

            $c = new SaeTClientV2($data['akey'], $data['skey'], $token['access_token']);
            $uid_get = $c->get_uid();
            $uid = $uid_get['uid'];
            $user = $c->show_user_by_id($uid);//根据ID获取用户等基本信息

            $key      = $user['id'];
            $nickname = trim($user['screen_name']);
            $photo    = trim($user['avatar_large']);
            $gender   = $user['gender'] == "f" ? "女" : "男";

            //登录验证
            $userLogin = new userLogin($dbo);

            $data = array(
                "code"     => $logincode,
                "key"      => $key,
                "nickname" => $nickname,
                "photo"    => $photo,
                "gender"   => $gender,
                "state"    => $return['qr']
            );

            $userLogin->loginConnect($data);

        }else{
            die("接口连接错误！");
        }

    }

	/**
	 * APP登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function appback($data, $return){

        global $logincode;

		if($return['access_token'] && $return['openid']){
			include_once(dirname(__FILE__)."/saetv2.ex.class.php");
			$c = new SaeTClientV2($data['akey_app'], $data['skey_app'], $return['access_token']);
			$user = $c->show_user_by_id($return['openid']);//根据ID获取用户等基本信息

			$key      = $user['id'];
			$nickname = trim($user['screen_name']);
			$photo    = trim($user['avatar_large']);
            $gender   = $user['gender'] == "f" ? "女" : "男";
            
            //记录当前设备s
            $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
            $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
            $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
            //记录当前设备e

			//登录验证
			$userLogin = new userLogin($dbo);

			$data = array(
				"code"     => $logincode,
				"key"      => $key,
				"nickname" => $nickname,
				"photo"    => $photo,
				"gender"   => $gender,
                "deviceTitle" => $deviceTitle,
                "deviceSerial" => $deviceSerial,
                "deviceType" => $deviceType
			);

			$userLogin->loginConnect($data);
		}

    }

}
