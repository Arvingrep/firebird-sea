<?php  if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * Cookie处理插件
 *
 * @version        $Id: cookie.class.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.class
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

/**
 *  设置Cookie记录
 *
 * @param     string  $key    键
 * @param     string  $value  值
 * @param     string  $kptime  保持时间
 * @param     string  $pa     保存路径
 * @return    void
 */
if (!function_exists('PutCookie')){
    function PutCookie($key, $value, $kptime=0, $pa="/", $domain = ""){
        global $cfg_cookiePath, $cfg_cookieDomain, $cfg_cookiePre, $cfg_httpSecureAccess;
        $domain = $domain ? $domain : $cfg_cookieDomain;
        $_COOKIE[$cfg_cookiePre.$key] = $value;

		//cookie配置参数
		$arr_cookie_options = array (
            'expires' => time()+$kptime,
            'path' => $cfg_cookiePath,
            'domain' => $domain,
            'HttpOnly' => $key == 'admin_auth' ? true : false  //账号信息做httpOnly处理
        );

		//secure
		if($cfg_httpSecureAccess){
			$arr_cookie_options['secure'] = true;
		}

		//7.3及以上版本支持samesite
		if(PHP_VERSION >= '7.3'){

			//先写一次没有samesite，兼容老版本
	        setcookie($cfg_cookiePre.$key, $value, $arr_cookie_options);

			//samesite
			if($cfg_httpSecureAccess && !isAndroidApp()){
				$arr_cookie_options['samesite'] = 'None';
	            setcookie($cfg_cookiePre.$key, $value, $arr_cookie_options);
			}

		}else{
			setcookie($cfg_cookiePre.$key, $value, $arr_cookie_options['expires'], $arr_cookie_options['path'], $arr_cookie_options['domain'], $arr_cookie_options['secure'], $arr_cookie_options['HttpOnly']);
		}

		//域名兼容
        if(!strstr($domain, 'www.')){
			$arr_cookie_options['domain'] = 'www.' . $domain;

			//7.3及以上版本支持samesite
			if(PHP_VERSION >= '7.3'){
	            setcookie($cfg_cookiePre.$key, $value, $arr_cookie_options);
			}else{
				setcookie($cfg_cookiePre.$key, $value, $arr_cookie_options['expires'], $arr_cookie_options['path'], $arr_cookie_options['domain'], $arr_cookie_options['secure'], $arr_cookie_options['HttpOnly']);
			}
        }
    }
}

/**
 *  清除Cookie记录
 *
 * @param     $key   键名
 * @return    void
 */
if (!function_exists('DropCookie')){
    function DropCookie($key){
        global $cfg_cookieDomain, $cfg_cookiePath, $cfg_cookiePre;
        unset($_COOKIE[$cfg_cookiePre.$key]);
        setcookie($cfg_cookiePre.$key, '', time()-360000, $cfg_cookiePath, $cfg_cookieDomain);

        $host = $_SERVER['HTTP_HOST'];
        $host_ = explode(".", $host);
        $domain = "";
        $len = count($host_);
        $start = $len > 2 ? $len - 2 : 0;
        for($i = $start; $i < $len; $i++){
            $domain .= ".".$host_[$i];
        }
        setcookie($cfg_cookiePre.$key, '', time()-360000, $cfg_cookiePath, $domain);
        if(!strstr($domain, 'www')){
            setcookie($cfg_cookiePre.$key, '', time()-360000, $cfg_cookiePath, 'www' . $domain);
        }
    }
}

/**
 *  获取Cookie记录
 *
 * @param     $key   键名
 * @return    string
 */
if (!function_exists('GetCookie')){
    function GetCookie($key){
        global $cfg_cookiePath, $cfg_cookieDomain, $cfg_cookiePre;
        $ret = '';

        //城市分站信息，兼容苹果APP，先获取APP的cookie
        if($key == 'siteCityInfo'){
            $_key = 'siteCityInfo_iOS_APP';

            if(!isset($_COOKIE[$cfg_cookiePre.$_key])){
                $ret = '';
            }else{
                $ret = $_COOKIE[$cfg_cookiePre.$_key];
            }
        }

        if(!$ret){
            if(!isset($_COOKIE[$cfg_cookiePre.$key])){
                $ret = '';
            }else{
                $ret = $_COOKIE[$cfg_cookiePre.$key];
            }
        }

        return $ret;
    }
}
