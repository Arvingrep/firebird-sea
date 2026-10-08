<?php
/**
 * 百度快捷登录
 *
 * @version        $Id: baidu.php $v1.0 2015-2-14 下午14:24:15 $
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
    $login[$i]['name'] = "百度快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=baidu";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = 'OAuth2.0（开放授权）是一个开放标准，用户授权后，第三方应用无需获取用户的用户名和密码就可以访问该用户在某一网站上存储的私密的资源（如照片，视频，联系人列表）。';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
		array('title' => 'API Key',     'name' => 'clientId',     'type' => 'text'),
		array('title' => 'Secret Key', 'name' => 'clientSecret', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class Loginbaidu {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginbaidu();
    }

    function Loginbaidu(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){
        include_once(dirname(__FILE__)."/BaiduApi.php");
        $baidu = new Baidu($data['clientId'], $data['clientSecret'], $data['callback'], new BaiduCookieStore($data['clientId']));
        $login_url = $baidu->getLoginUrl('', 'popup');
        header("Location:$login_url");
    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

        global $logincode;

        include_once(dirname(__FILE__)."/BaiduApi.php");
        $baidu = new Baidu($data['clientId'], $data['clientSecret'], $data['callback'], new BaiduCookieStore($data['clientId']));
        $user = $baidu->getLoggedInUser();

        if($user){
            $apiClient = $baidu->getBaiduApiClientService();
            $profile = $apiClient->api('/rest/2.0/passport/users/getInfo', array('fields' => 'userid,username,portrait,sex'));
            if ($profile === false) {
                var_dump(var_export(array('errcode' => $baidu->errcode(), 'errmsg' => $baidu->errmsg()), true));
                $user = null;
                exit();
            }

            //登录验证
            $userLogin = new userLogin($dbo);

            $data = array(
                "code"     => $logincode,
                "key"      => $user['uid'],
                "nickname" => $profile['username'],
                "photo"    => "http://tb.himg.baidu.com/sys/portrait/item/".$profile['portrait'],
                "gender"   => $profile['sex'] == 1 ? "男" : "女"
            );

            $userLogin->loginConnect($data);

        }else{
            die("接口连接错误！");
        }

    }

}
