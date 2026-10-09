<?php
/**
 * 微信登录快捷登录
 *
 * @version        $Id: wechat.php $v1.0 2016-6-17 下午15:02:22 $
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
    $login[$i]['name'] = "微信快捷登录";

    /* 回调地址 */
    $login[$i]['callback'] = $cfg_secureAccess.$cfg_basehost."/api/login.php?action=back&type=wechat";

    /* 版本号 */
    $login[$i]['version']  = '1.0.0';

    /* 描述 */
    $login[$i]['desc'] = '通过接入微信登录功能，用户可使用微信帐号快速登录你的网站，降低注册门槛，提高用户留存';

    /* 作者 */
    $login[$i]['author']   = '酷曼软件';

    /* 网址 */
    $login[$i]['website']  = 'https://www.kumanyun.com';

    /* 配置信息 */
    $login[$i]['config'] = array(
        array('title' => '公众号', 'type' => 'split'),
		array('title' => 'AppId',   'name' => 'appid',  'type' => 'text'),
		array('title' => 'AppSecret',  'name' => 'appsecret', 'type' => 'text'),
        array('title' => '移动应用', 'type' => 'split'),
		array('title' => 'AppId',   'name' => 'appid_app',  'type' => 'text'),
		array('title' => 'AppSecret',  'name' => 'appsecret_app', 'type' => 'text')
    );

    return;
}

/**
 * 类
 */
class Loginwechat {

	/**
     * 构造函数
     *
     * @access  public
     * @param
     *
     * @return void
     */

    function __construct(){
        $this->Loginwechat();
    }

    function Loginwechat(){}

    /**
     * 跳转到登录地址
     * @param   array   $data  配置信息
     */
    function login($data){

        // 删除一小时前的过期凭证
        global $dsql;
        $time = time() - 3600;
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxlogin` WHERE `date` < $time");
        $dsql->dsqlOper($sql, "update");

        //移动端直接跳出
        if(isMobile()){
            global $cfg_wechatType;
            putSession('state', md5(uniqid(rand(), TRUE)));
            $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=";
            $redirect_uri = urlencode($data['callback']);
            $scope = $cfg_wechatType == "1" ? "snsapi_userinfo" : "snsapi_base";
            if($_SESSION['wxloginType'] == "userinfo"){
                $scope = "snsapi_userinfo";
            }
            putSession('wxloginType');
            $login_url = $url.$data['appid']."&redirect_uri=".$redirect_uri."&response_type=code&scope=".$scope."&state=".$_SESSION['state']."#wechat_redirect";
            header("Location:$login_url");

        //PC端显示二维码
        }else{

            global $dsql;
            $state = md5(uniqid(rand(), TRUE));

            //记录生成日志
            $loginUid = isset($data['loginUserid']) ? $data['loginUserid'] : 0;
            $time = GetMkTime(time());
            $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxlogin` (`state`, `uid`, `date`, `loginUid`) VALUES ('$state', '0', '$time', '$loginUid')");
            $dsql->dsqlOper($sql, "update");
            //配置页面信息
            $tpl = HUONIAOROOT."/templates/siteConfig/";
            $templates = "wxpayLogin.html";
            $getopenid = addslashes(stripslashes(htmlspecialchars(RemoveXSS($_REQUEST['getopenid']))));
            $getopenid = $getopenid ?$getopenid : '';
            if(file_exists($tpl.$templates)){
                global $huoniaoTag;
                global $cfg_secureAccess;
                global $cfg_basehost;
                global $cfg_staticPath;
                global $notclose;

                $loginRedirect = $_SESSION['loginRedirect'];
                $loginRedirect = $loginRedirect ? $loginRedirect : $cfg_secureAccess.$cfg_basehost;

                $huoniaoTag->template_dir = $tpl;
                $huoniaoTag->assign('cfg_basehost', $cfg_secureAccess.$cfg_basehost);
                $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
                $huoniaoTag->assign('state', $state);
                $huoniaoTag->assign('notclose', $notclose);
                $huoniaoTag->assign('getopenid', $getopenid);
                $huoniaoTag->assign('loginRedirect', $loginRedirect);
                $huoniaoTag->display($templates);
            }else{
                die('微信登录页面加载失败，请确认后重试！');
            }

        }
    }

	/**
	 * 登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function back($data, $return){

      global $dsql;
      global $logincode;
      global $cfg_secureAccess;
      global $cfg_basehost;

      // print_r($return);die;

      //获取access_token
      if(!empty($return['code'])){
        $token_url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" . $data["appid"]. "&secret=" . $data["appsecret"]. "&code=" . $return['code'] . "&grant_type=authorization_code";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $token_url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        $token = json_decode(curl_exec($curl), true);
        curl_close($curl);

        $openid = $token['openid'];
        $unionid = $token['unionid'] ? $token['unionid'] : $token['openid'];
        $getopenid = $return['getopenid'];
        if ($getopenid) {

            if(isset($token['errcode'])) {
                echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                die("<p style='text-align: center; font-size: 20px; padding-top: 150px;'>授权错误，错误码：" . $token['errcode'] . "，错误信息：" . $token['errmsg'] . "</p>");
            }

            //后台管理员扫码登录
            if($getopenid == 'admin_login'){

                //更新记录
                $archives = $dsql->SetQuery("UPDATE `#@__site_wxlogin` SET `sameConn` = '$openid' WHERE `state` = '".$return['qr']."'");
                $res = $dsql->dsqlOper($archives, "update");
                if ($res == 'ok') {
                    echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                    echo '<p style="text-align: center; font-size: 25px; padding-top: 200px;">已成功登录</p>';
                    die;
                }else{
                    echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                    exit("<p style='text-align: center; font-size: 20px; padding-top: 150px;'>操作失败，请联系管理员，错误信息：" . $res . "</p>");
                }

            }
            //后台管理员扫码绑定账号
            else{
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_openid` = '$openid' WHERE `id` =".$getopenid);
                $res = $dsql->dsqlOper($archives, "update");
                if ($res == 'ok') {
                    echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
                    echo '<p style="text-align: center; font-size: 25px; padding-top: 200px;">授权成功</p>';
                    die;
                }else{
                    exit("绑定失败，请联系管理员，错误信息：" . $res);
                }
            }
        }
        //根据获取到的unionid，查询用户是否已经注册过，如果已经注册过，直接登录
        if($unionid){
    		$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`".$logincode."_conn` = '$unionid' OR `wechat_openid` = '$unionid' OR `".$logincode."_conn` = '$openid' OR `wechat_openid` = '$openid') AND (`mtype` = 1 OR `mtype` = 2)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $userLogin = new userLogin($dbo);
                $data = array(
                    "code"     => $logincode,
                    "key"      => $unionid,
                    "openid"   => $openid,
                    "notclose" => $return['notclose'],
                    "state"    => $return['qr']
                );
                $userLogin->loginConnect($data);
                exit();
            }
        }

        if(isset($token['errcode'])) {
          //code been used 错误直接跳回首页
          if($token['errcode'] == 40163){
            header("Location:" . $cfg_secureAccess . $cfg_basehost);
            die;
          }

          echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
          echo '<h1>错误：</h1>'.$token['errcode'];
          echo '<br/><h2>错误信息：</h2>'.$token['errmsg'];
          exit;
          die("接口连接错误！");
        }

        $access_token_url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' . $data["appid"]. '&grant_type=refresh_token&refresh_token='.$token['refresh_token'];
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $access_token_url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        $access_token = json_decode(curl_exec($curl), true);
        curl_close($curl);

        if (isset($access_token['errcode'])) {
          //code been used 错误直接跳回首页
          if($token['errcode'] == 40163){
            header("Location:" . $cfg_secureAccess . $cfg_basehost);
            die;
          }

          echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
          echo '<h1>错误：</h1>'.$access_token['errcode'];
          echo '<br/><h2>错误信息：</h2>'.$access_token['errmsg'];
          exit;
          die("接口连接错误1！");
        }

        $openid = $access_token['openid'];
        $user_info_url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$access_token['access_token'].'&openid='.$openid.'&lang=zh_CN';
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $user_info_url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        $user_info = json_decode(curl_exec($curl), true);
        curl_close($curl);

        //如果获取失败，并且授权方式为静默，则重新以用户授权的方式获取权限
        global $cfg_wechatType;
        global $cfg_secureAccess;
        global $cfg_basehost;
        if(isset($user_info['errcode']) && $cfg_wechatType == "0"){
            putSession('wxloginType', 'userinfo');
            header("Location:".$cfg_secureAccess.$cfg_basehost."/api/login.php?type=wechat&qr=".$return['qr']);
            die;
        }

        if (isset($user_info['errcode'])) {
            echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
            echo '<h1>错误：</h1>'.$user_info['errcode'];
            echo '<br/><h2>错误信息：</h2>'.$user_info['errmsg'];
            exit;
            die("接口连接错误2！");
        }

        //如果获取到了用户信息
        if(is_array($user_info) && $user_info['nickname']){

            // $key      = $user_info['unionid'];
            // $key      = $openid;
            $key      = $unionid;
            $nickname = trim($user_info['nickname']);
            $photo    = trim($user_info['headimgurl']);
            // $gender   = $user_info['sex'] == 1 ? '男' : '女';
            $gender   = '男';  //微信规则升级后，不再返回性别、省市区、语言信息  https://mmbiz.qpic.cn/mmbiz_png/3Luz3T7WxtYb1clMcSI35oty2EFgicEgdn21AAgNl6VQy19XLLVd2shJbGD9sUJGtrPbMZ48p1E1B4Zxxps1C4w/0

            $userLogin = new userLogin($dbo);
            $data = array(
                "code"     => $logincode,
                "key"      => $key,
                "openid"   => $openid,
                "nickname" => $nickname,
                "photo"    => $photo,
                "gender"   => $gender,
                "notclose" => $return['notclose'],
                "state"    => $return['qr']
            );
            $userLogin->loginConnect($data);

        }

      }

    }

	/**
	 * APP登录成功返回
     * @param array $data 配置信息
     * @param array $return 返回信息
	 */
	function appback($data, $return){

        global $dsql;
        global $logincode;

        $access_token = $return['access_token'];
        $openid = $return['openid'];
        $unionid = $return['unionid'];

        require_once dirname(__FILE__)."/../../payment/log.php";
	    $_wechatAppLogin = new CLogFileHandler(HUONIAOROOT . '/log/wechatAppLogin/'.date('Y-m-d').'.log');
        $_wechatAppLogin->DEBUG("access_token：" . $access_token);
        $_wechatAppLogin->DEBUG("openid：" . $openid);
        $_wechatAppLogin->DEBUG("unionid：" . $unionid);


        //根据获取到的unionid，查询用户是否已经注册过，如果已经注册过，直接登录
        if($unionid){
    		$sql = $dsql->SetQuery("SELECT `id`, `wechat_openid` FROM `#@__member` WHERE `".$logincode."_conn` = '$unionid' OR `wechat_openid` = '$unionid' OR `".$logincode."_conn` = '$openid' OR `wechat_openid` = '$openid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                //记录当前设备s
                $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
                $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
                $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
                //记录当前设备e

                $openid = $ret[0]['wechat_openid'] ? $ret[0]['wechat_openid'] : $openid;  //如果已经注册过，APP端不需要更新openid，使用微信公众号的openid，如果更新会影响模板消息发送

                $userLogin = new userLogin($dbo);
                $data = array(
                    "code"     => $logincode,
                    "openid"   => $openid,
                    "key"      => $unionid,
                    "deviceTitle" => $deviceTitle,
                    "deviceSerial" => $deviceSerial,
                    "deviceType" => $deviceType,
					"state" => $return['qr'],
					"isapp" => 1
                );
                $userLogin->loginConnect($data);
                exit();

            //如果没有注册过，根据客户端得到的用户数据，注册一个新会员
            }else{
            	// $userLogin = new userLogin($dbo);
	            // $data = array(
	            //     "code"     => $logincode,
	            //     "key"      => $unionid,
	            //     "nickname" => $return['nickname'],
	            //     "photo"    => $return['headimgurl'],
	            //     "gender"   => $return['gender']
	            // );
	            // $userLogin->loginConnect($data);
	            // exit();
            }
        }


        $user_info_url = 'https://api.weixin.qq.com/sns/userinfo?access_token='.$access_token.'&openid='.$openid.'&lang=zh_CN';
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $user_info_url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        $user_info = json_decode(curl_exec($curl), true);
        curl_close($curl);

        if (isset($user_info['errcode'])) {
            echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no" />';
            echo '<h1>错误：</h1>'.$user_info['errcode'];
            echo '<br/><h2>错误信息：</h2>'.$user_info['errmsg'];
            exit;
            die("接口连接错误2！");
        }

        //如果获取到了用户信息
        if(is_array($user_info) && $user_info['nickname']){

            $key      = $user_info['unionid'];
            // $key      = $openid;
            $nickname = trim($user_info['nickname']);
            $photo    = trim($user_info['headimgurl']);
            // $gender   = $user_info['sex'] == 1 ? '男' : '女';
            $gender   = '男';  //微信规则升级后，不再返回性别、省市区、语言信息  https://mmbiz.qpic.cn/mmbiz_png/3Luz3T7WxtYb1clMcSI35oty2EFgicEgdn21AAgNl6VQy19XLLVd2shJbGD9sUJGtrPbMZ48p1E1B4Zxxps1C4w/0

            //记录当前设备s
            $deviceTitle  = !empty($return['deviceTitle'])  ? trim($return['deviceTitle'])  : '';
            $deviceSerial = !empty($return['deviceSerial']) ? trim($return['deviceSerial']) : '';
            $deviceType   = !empty($return['deviceType'])   ? trim($return['deviceType'])   : '';
            //记录当前设备e

            $userLogin = new userLogin($dbo);
            $data = array(
                "code"     => $logincode,
                "key"      => $key,
                "openid"   => $openid,
                'uid'      => $data['loginUserid'],
                "nickname" => $nickname,
                "photo"    => $photo,
                "gender"   => $gender,
                "deviceTitle" => $deviceTitle,
                "deviceSerial" => $deviceSerial,
                "deviceType" => $deviceType,
				"state" => $return['qr'],
				"isapp" => 1
            );
            $userLogin->loginConnect($data);

        }

    }

}
