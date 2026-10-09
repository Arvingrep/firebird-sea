<?php
/**
 * UCenter 应用程序开发 API
 */

define('UC_VERSION', '1.0.0');
define('API_DELETEUSER', 1);		        //用户删除 API 接口开关
define('API_RENAMEUSER', 1);		        //用户改名 API 接口开关
define('API_UPDATEPW', 1);		          //用户改密码 API 接口开关
define('API_GETTAG', 1);		            //获取标签 API 接口开关
define('API_SYNLOGIN', 1);		          //同步登录 API 接口开关
define('API_SYNLOGOUT', 1);		          //同步登出 API 接口开关
define('API_UPDATEBADWORDS', 1);	      //更新关键字列表 开关
define('API_UPDATEHOSTS', 1);		        //更新域名解析缓存 开关
define('API_UPDATEAPPS', 1);		        //更新应用列表 开关
define('API_UPDATECLIENT', 1);		      //更新客户端缓存 开关
define('API_UPDATECREDIT', 1);		      //更新用户积分 开关
define('API_GETCREDITSETTINGS', 1);	    //向 UCenter 提供积分设置 开关
define('API_UPDATECREDITSETTINGS', 1);	//更新应用积分设置 开关
define('API_RETURN_SUCCEED', '1');
define('API_RETURN_FAILED', '-1');
define('API_RETURN_FORBIDDEN', '-2');

error_reporting(7);
require_once '../include/common.inc.php';

define('UC_CLIENT_ROOT', HUONIAOROOT.'./api/bbs/discuz/uc_client/');

chdir('../');
require_once './api/bbs/'.$cfg_bbsType.'/config.inc.php';

$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);

$code = $_GET['code'];
parse_str(authcode($code, 'DECODE', UC_KEY), $get);

if(MAGIC_QUOTES_GPC) {
	$get = dstripslashes($get);
}

if(time() - $get['time'] > 3600) {
	exit('Authracation has expiried');
}
if(empty($get)) {
	exit('Invalid Request');
}
$action = $get['action'];
$timestamp = time();

if($action == 'test') {

	exit(API_RETURN_SUCCEED);

//同步登录 API 接口
} elseif($action == 'synlogin') {

	!API_SYNLOGIN && exit(API_RETURN_FORBIDDEN);

	$sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `username` = '".$get['username']."' LIMIT 1");
	$results = $dsql->dsqlOper($sql, "results");

	if($results){
		header('P3P: CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
		global $cfg_cookiePath;
		global $cfg_onlinetime;
		$data = $results[0]['id'].'&'.$results[0]['password'];
		$RenrenCrypt = new RenrenCrypt();
		$userid = base64_encode($RenrenCrypt->php_encrypt($data));
		PutCookie("login_user", $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
	}

//同步注册 API 接口
} elseif($action == 'synregister') {

	!API_SYNLOGIN && exit(API_RETURN_FORBIDDEN);

	$username = $get['username'];
	$password = $get['password'];
	$email    = $get['email'];
	if(!empty($username) && !empty($email)){

		//判断是否已经存在，如果存在则自动登录
		$sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `username` = '".$username."' LIMIT 1");
		$results = $dsql->dsqlOper($sql, "results");

		if($results){
			header('P3P: CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
			global $cfg_cookiePath;
			global $cfg_onlinetime;
			$data = $results[0]['id'].'&'.$results[0]['password'];
			$RenrenCrypt = new RenrenCrypt();
			$userid = base64_encode($RenrenCrypt->php_encrypt($data));
			PutCookie("login_user", $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
		}else{
			$passwd = $userLogin->_getSaltedHash($password);
			$regtime  = GetMkTime(time());
			$regip    = GetIP();
			$sql = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `email`, `emailCheck`, `phone`, `phoneCheck`, `regtime`, `regip`, `state`, `regfrom`) VALUES (1, '$username', '$passwd', '$username', '$email', '0', '', '0', '$regtime', '$regip', '1', 'bbs')");
			$rid = $dsql->dsqlOper($sql, "lastid");

			//注册成功，登录
			if($rid){
				header('P3P: CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
				global $cfg_cookiePath;
				global $cfg_onlinetime;
				$data = $rid.'&'.$passwd;
				$RenrenCrypt = new RenrenCrypt();
				$userid = base64_encode($RenrenCrypt->php_encrypt($data));
				PutCookie("login_user", $userid, $cfg_onlinetime * 60 * 60, $cfg_cookiePath);
			}
		}
	}

//同步登出 API 接口
} elseif($action == 'synlogout') {

	!API_SYNLOGOUT && exit(API_RETURN_FORBIDDEN);

	header('P3P: CP="CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR"');
	$userLogin->exitMember();

} else {

	exit(API_RETURN_FAILED);

}

function authcode($string, $operation = 'DECODE', $key = '', $expiry = 0) {

	$ckey_length = 4;

	$key = md5($key ? $key : UC_KEY);
	$keya = md5(substr($key, 0, 16));
	$keyb = md5(substr($key, 16, 16));
	$keyc = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length): substr(md5(microtime()), -$ckey_length)) : '';

	$cryptkey = $keya.md5($keya.$keyc);
	$key_length = strlen($cryptkey);

	$string = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0).substr(md5($string.$keyb), 0, 16).$string;
	$string_length = strlen($string);

	$result = '';
	$box = range(0, 255);

	$rndkey = array();
	for($i = 0; $i <= 255; $i++) {
		$rndkey[$i] = ord($cryptkey[$i % $key_length]);
	}

	for($j = $i = 0; $i < 256; $i++) {
		$j = ($j + $box[$i] + $rndkey[$i]) % 256;
		$tmp = $box[$i];
		$box[$i] = $box[$j];
		$box[$j] = $tmp;
	}

	for($a = $j = $i = 0; $i < $string_length; $i++) {
		$a = ($a + 1) % 256;
		$j = ($j + $box[$a]) % 256;
		$tmp = $box[$a];
		$box[$a] = $box[$j];
		$box[$j] = $tmp;
		$result .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
	}

	if($operation == 'DECODE') {
		if((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26).$keyb), 0, 16)) {
			return substr($result, 26);
		} else {
			return '';
		}
	} else {
		return $keyc.str_replace('=', '', base64_encode($result));
	}

}

function dstripslashes($string) {
	if(is_array($string)) {
		foreach($string as $key => $val) {
			$string[$key] = dstripslashes($val);
		}
	} else {
		$string = stripslashes($string);
	}
	return $string;
}
