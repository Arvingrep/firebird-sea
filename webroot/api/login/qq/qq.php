<?php
/**
 * QQ登录快捷登录
 *
 * @version        $Id: qq.php $v1.0 2015-2-14 下午14:24:15 $
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
    $login[$i]['name'] = "QQ快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=qq";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = '获取用户在QQ空间的个人资料，目前可获取用户在QQ空间的昵称、头像信息及黄钻信息。';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
        array('title' => '网站应用', 'type' => 'split'),
		array('title' => 'APP ID',   'name' => 'appid',  'type' => 'text'),
		array('title' => 'APP KEY',  'name' => 'appkey', 'type' => 'text'),
        array('title' => '移动应用', 'type' => 'split'),
		array('title' => 'APP ID',   'name' => 'app_appid',  'type' => 'text'),
		array('title' => 'APP KEY',  'name' => 'app_appkey', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class Loginqq {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginqq();
    }

    function Loginqq(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){
		putSession('state', md5(uniqid(rand(), TRUE))); //CSRF protection
        $login_url = "https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id="
            . $data['appid'] . "&redirect_uri=" . urlencode($data['callback'])
            . "&state=" . $_SESSION['state']
            . "&scope=".$data['scope'];
        header("Location:$login_url");
    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

        global $logincode;

        //获取access_token
        if($return['state'] == $_SESSION['state']){
            $token_url = "https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&"
                . "client_id=" . $data["appid"]. "&redirect_uri=" . urlencode($data["callback"])
                . "&client_secret=" . $data["appkey"]. "&code=" . $return["code"];

            $arrContextOptions=array(
                "ssl"=>array(
                    "verify_peer"=>false,
                    "verify_peer_name"=>false,
                ),
            );

            $response = file_get_contents($token_url, false, stream_context_create($arrContextOptions));
            if (strpos($response, "callback") !== false){
                $lpos = strpos($response, "(");
                $rpos = strrpos($response, ")");
                $response  = substr($response, $lpos + 1, $rpos - $lpos -1);
                $msg = json_decode($response);
                if (isset($msg->error)){
                    // echo "<h3>error1:</h3>" . $msg->error;
                    // echo "<h3>msg  :</h3>" . $msg->error_description;
                    //exit;
                    die($user->error . '_' . $user->error_description);
                }
            }

            $params = array();
            parse_str($response, $params);

            //获取openid
            // $graph_url = "https://graph.qq.com/oauth2.0/me?access_token=".$params["access_token"]."&unionid=1";   //集成APP时使用
            $graph_url = "https://graph.qq.com/oauth2.0/me?access_token=".$params["access_token"]."&unionid=1";

            $str  = file_get_contents($graph_url, false, stream_context_create($arrContextOptions));
            if (strpos($str, "callback") !== false){
                $lpos = strpos($str, "(");
                $rpos = strrpos($str, ")");
                $str  = substr($str, $lpos + 1, $rpos - $lpos -1);
            }

            $user = json_decode($str);
            if (isset($user->error)){
                // echo "<h3>error:</h3>" . $user->error;
                // echo "<h3>msg  :</h3>" . $user->error_description;
                // exit;
                die($user->error . '_' . $user->error_description);
            }

            //获取用户信息
            $user_url = "https://graph.qq.com/user/get_user_info?oauth_consumer_key=".$data["appid"]."&access_token=".$params["access_token"]."&openid=".$user->openid."&format=json";

            $info = file_get_contents($user_url, false, stream_context_create($arrContextOptions));
            $info = json_decode($info, true);

            if(is_array($info)){

                // $key = $user->unionid;   //集成APP时使用
                // $key = $user->openid;
                // $key = $data['app_appid'] ? $user->unionid : $user->openid;
                $key = $user->unionid ? $user->unionid : $user->openid;
                $nickname = trim($info['nickname']);
                $photo    = trim($info['figureurl_qq_2']);
                $gender   = trim($info['gender']);

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

            }

            //debug
            //echo("Hello " . $user->openid);die;

            //set openid to session
        }
    }

	/**
	 * APP登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function appback($data, $return){

        global $logincode;


        //获取openid
        $graph_url = "https://graph.qq.com/oauth2.0/me?access_token=".$return["access_token"]."&unionid=1";   //集成APP时使用
        // $graph_url = "https://graph.qq.com/oauth2.0/me?access_token=".$return["access_token"];

        $str  = file_get_contents($graph_url, false, stream_context_create($arrContextOptions));
        if (strpos($str, "callback") !== false){
            $lpos = strpos($str, "(");
            $rpos = strrpos($str, ")");
            $str  = substr($str, $lpos + 1, $rpos - $lpos -1);
        }

        $user = json_decode($str);
        if (isset($user->error)){
            // echo "<h3>error:</h3>" . $user->error;
            // echo "<h3>msg  :</h3>" . $user->error_description;
            // exit;
            die($user->error . '_' . $user->error_description);
        }


        //获取用户信息
        $user_url = "https://graph.qq.com/user/get_user_info?oauth_consumer_key=".$data['app_appid']."&access_token=".$return["access_token"]."&openid=".$return['openid']."&format=json";

        $info = file_get_contents($user_url, false, stream_context_create($arrContextOptions));
        $info = json_decode($info, true);

        if(is_array($info)){

            if($info['ret'] != 0){

                //获取用户信息
                $user_url = "https://graph.qq.com/user/get_user_info?oauth_consumer_key=".$data['appid']."&access_token=".$return["access_token"]."&openid=".$return['openid']."&format=json";

                $info = file_get_contents($user_url, false, stream_context_create($arrContextOptions));
                $info = json_decode($info, true);

            }

            $nickname = trim($info['nickname']);
            $photo    = trim($info['figureurl_qq_2']);
            $gender   = trim($info['gender']);

            //记录当前设备s
            $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
            $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
            $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
            //记录当前设备e

            //登录验证
            $userLogin = new userLogin($dbo);

            $data = array(
                "code"     => $logincode,
                "key"      => $user->unionid,   //集成APP时使用
                // "key"      => $user->openid,
                "nickname" => $nickname,
                "photo"    => $photo,
                'uid'      => $data['loginUserid'],
                "gender"   => $gender,
                "deviceTitle" => $deviceTitle,
                "deviceSerial" => $deviceSerial,
                "deviceType" => $deviceType,
                "state"    => $return['qr']
            );

            $userLogin->loginConnect($data);

        }

    }

}
