<?php
/**
 * Facebook快捷登录
 *
 * @version        $Id: facebook.php $v1.0 2017-10-26 下午16:37:18 $
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
    $login[$i]['name'] = "Facebook快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=facebook";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = '通过我们的快速启动功能，轻松将 Facebook 登录功能加入你的应用。';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
        array('title' => 'APP ID',   'name' => 'appid',  'type' => 'text'),
        array('title' => 'APP Secret',  'name' => 'appsecret', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class Loginfacebook {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginfacebook();
    }

    function Loginfacebook(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){

      global $autoload;
      $autoload = true;
      include_once(dirname(__FILE__).'/src/autoload.php');

      $fb = new Facebook\Facebook([
        'app_id' => $data['appid'], // Replace {app-id} with your app id
        'app_secret' => $data['appsecret'],
        'default_graph_version' => 'v2.2',
      ]);

      $helper = $fb->getRedirectLoginHelper();

      $permissions = ['email']; // Optional permissions
      $loginUrl = $helper->getLoginUrl($data['callback'], $permissions);

      header("Location:$loginUrl");

    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

        global $logincode;

        global $autoload;
        $autoload = true;
        global $cfg_secureAccess;
        global $cfg_basehost;
        include_once(dirname(__FILE__).'/src/autoload.php');

        $fb = new Facebook\Facebook([
          'app_id' => $data['appid'], // Replace {app-id} with your app id
          'app_secret' => $data['appsecret'],
          'default_graph_version' => 'v2.2',
        ]);

        $helper = $fb->getRedirectLoginHelper();

        try {
          $accessToken = $helper->getAccessToken($cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=facebook");
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
          // When Graph returns an error
          echo 'Graph returned an error: ' . $e->getMessage();
          exit;
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
          // When validation fails or other local issues
          echo 'Facebook SDK returned an error: ' . $e->getMessage();
          exit;
        }

        if (! isset($accessToken)) {
          if ($helper->getError()) {
            header('HTTP/1.0 401 Unauthorized');
            echo "Error: " . $helper->getError() . "\n";
            echo "Error Code: " . $helper->getErrorCode() . "\n";
            echo "Error Reason: " . $helper->getErrorReason() . "\n";
            echo "Error Description: " . $helper->getErrorDescription() . "\n";
          } else {
            header('HTTP/1.0 400 Bad Request');
            echo 'Bad request';
          }
          exit;
        }

        // The OAuth 2.0 client handler helps us manage access tokens
        $oAuth2Client = $fb->getOAuth2Client();

        // Get the access token metadata from /debug_token
        $tokenMetadata = $oAuth2Client->debugToken($accessToken);

        // Validation (these will throw FacebookSDKException's when they fail)
        $tokenMetadata->validateAppId($data['appid']); // Replace {app-id} with your app id
        // If you know the user ID this access token belongs to, you can validate it here
        //$tokenMetadata->validateUserId('123');
        $tokenMetadata->validateExpiration();

        if (! $accessToken->isLongLived()) {
          // Exchanges a short-lived access token for a long-lived one
          try {
            $accessToken = $oAuth2Client->getLongLivedAccessToken($accessToken);
          } catch (Facebook\Exceptions\FacebookSDKException $e) {
            echo "<p>Error getting long-lived access token: " . $helper->getMessage() . "</p>\n\n";
            exit;
          }

        }

        putSession('fb_access_token', (string) $accessToken);

        try {
          // Returns a `Facebook\FacebookResponse` object
          $response = $fb->get('/me?fields=id,name,gender,picture.type(large)', $accessToken);
        } catch(Facebook\Exceptions\FacebookResponseException $e) {
          echo 'Graph returned an error: ' . $e->getMessage();
          exit;
        } catch(Facebook\Exceptions\FacebookSDKException $e) {
          echo 'Facebook SDK returned an error: ' . $e->getMessage();
          exit;
        }

        $user = $response->getGraphUser();

        if($user){
          $key      = $user['id'];
          $nickname = trim($user['name']);
          $photo    = $user['picture']['url'];
          $gender   = trim($user['gender']);

          //登录验证
          $autoload = false;
          $userLogin = new userLogin($dbo);

          $data = array(
              "code"     => $logincode,
              "key"      => $key,
              "nickname" => $nickname,
              "photo"    => $photo,
              "gender"   => $gender == "male" ? "男" : "女"
          );

          $userLogin->loginConnect($data);
        }
    }

	/**
	 * APP登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function appback($data, $return){

        global $logincode;

        $uid = $return['uid'];  //支付宝用户的userId
        $iconurl = $return['iconurl'];  //头像
        $name = $return['name'];  //名称

        //记录当前设备s
        $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
        $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
        $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
        //记录当前设备e

        //登录验证
        $userLogin = new userLogin($dbo);
        $data = array(
            "code"     => $logincode,
            "key"      => $uid,
            "nickname" => $name,
            "photo"    => $iconurl,
            "gender"   => '男',
            "deviceTitle" => $deviceTitle,
            "deviceSerial" => $deviceSerial,
            "deviceType" => $deviceType
        );
        $userLogin->loginConnect($data);

    }


}
