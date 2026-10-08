<?php
/**
 * 系统核心函数存放文件
 *
 * @version        $Id: common.func.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Libraries
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */

if (!defined('HUONIAOINC')) exit('Request Error!');

if(!is_file(HUONIAOINC."/class/memory.class.php") || !is_file(HUONIAOINC."/class/memory_redis.class.php")){
    class memory2 {
        public $enable = false;
        public function get($key, $prefix = '') {}
        public function set($key, $value, $ttl = 0, $prefix = '') {}
        public function rm($key, $prefix = '') {}
        public function clear() {}
        public function inc($key, $step = 1) {}
        public function dec($key, $step = 1) {}
    }
    $HN_memory = new memory2();
}else{
    $HN_memory = new memory();
}


//七牛云
$autoload = true;
function classLoaderQiniu_($class){
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}

spl_autoload_register('classLoaderQiniu_');
require(HUONIAOROOT . '/api/upload/Qiniu/functions.php');
use Qiniu\Auth;
use Qiniu\Storage\UploadManager;
use Qiniu\Storage\BucketManager;


//华为云
$autoload = true;
function classLoaderHuawei_($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}

spl_autoload_register('classLoaderHuawei_');
require(HUONIAOROOT . '/api/upload/huawei/vendor/autoload.php');
require(HUONIAOROOT . '/api/upload/huawei/obs-autoloader.php');
use Obs\ObsClient;
use Obs\ObsException;


//阿里云
$autoload = true;
function classLoaderAliyun_($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/aliyun/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}

spl_autoload_register('classLoaderAliyun_');
require(HUONIAOROOT . '/api/upload/aliyun/OSS/OssClient.php');
use OSS\OssClient;
use OSS\Core\OssUtil;
use OSS\Core\OssException;


//腾讯云
$autoload = true;
function classLoaderTencent_($class)
{
    $path = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = HUONIAOROOT . '/api/upload/' . $path . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
}

spl_autoload_register('classLoaderTencent_');
require(HUONIAOROOT . '/api/upload/tencent/vendor/autoload.php');



$autoload = false;

/**
 *  系统默认载入插件
 *
 * @access    public
 * @param     mix $plug 插件名称,可以是数组,可以是单个字符串
 * @return    void
 */
$_plugs = array();
function loadPlug($plugs){
    //如果是数组,则进行递归操作
    if (is_array($plugs)) {
        foreach ($plugs as $huoniao) {
            loadPlug($huoniao);
        }
        return;
    }

    if (isset($_plugs[$plugs])) {
        return;
    }
    if (file_exists(HUONIAOINC . '/class/' . $plugs . '.class.php')) {
        include_once(HUONIAOINC . '/class/' . $plugs . '.class.php');
        $_plugs[$plugs] = TRUE;
    }
    //无法载入插件
    if (!isset($_plugs[$plugs])) {
        exit('Unable to load the requested file: class/' . $plugs . '.class.php');
    }
}

/**
 *  短消息函数,可以在某个动作处理后友好的提示信息
 *
 * @param     string $msg 消息提示信息
 * @param     string $gourl 跳转地址
 * @param     int $onlymsg 仅显示信息
 * @param     int $limittime 限制时间
 * @param     int $goback 是否后退到上个页面，主要用于小程序端
 * @return    void
 */
function ShowMsg($msg, $gourl, $onlymsg = 0, $limittime = 0, $goback = 0){
    global $langData;
    global $cfg_staticVersion;
    global $cfg_staticPath;
    global $cfg_basehost;
    $htmlhead = "<html>\r\n<head>\r\n<title>" . $langData['siteConfig'][21][5] . "</title>\r\n";
    $htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=" . $GLOBALS['cfg_soft_lang'] . "\" />\r\n";
    $htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='" . HUONIAOADMIN . "/../static/css/admin/bootstrap.css?v=".$cfg_staticVersion."' />";
    $htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='" . HUONIAOADMIN . "/../static/css/admin/common.css?v=".$cfg_staticVersion."' />";
    $htmlhead .= "<script type='text/javascript' src='/static/js/core/jquery-1.8.3.min.js?v=".$cfg_staticVersion."'></script>";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n<script>\r\n";
    $htmlfoot = "\r\n</script>\r\n</body>\r\n</html>\r\n";

    $litime = ($limittime == 0 ? 1000 : $limittime);
    $func = '';

    if ($gourl == '-1') {
        if ($limittime == 0) $litime = 5000;
        $gourl = "javascript:history.go(-1);";
    }

    if ($gourl == '' || $onlymsg == 1) {
        if($goback){
            $_msg = $msg;
            $msg = "<script>if (navigator.userAgent.toLowerCase().match(/micromessenger/) && typeof (wx) == 'undefined') {document.write(unescape(\"%3Cscript src='https://res.wx.qq.com/open/js/jweixin-1.6.0.js?v=$cfg_staticVersion' type='text/javascript'%3E%3C/script%3E\"));}if(navigator.userAgent.toLowerCase().match(/huoniao/)){document.write(unescape(\"%3Cscript src='".$cfg_staticPath."js/core/touchScale.js?v=$cfg_staticVersion' type='text/javascript'%3E%3C/script%3E\"));document.write(unescape(\"%3Cscript src='".$cfg_staticPath."js/core/zepto.min.js?v=$cfg_staticVersion' type='text/javascript'%3E%3C/script%3E\"));}var masterDomain = '".$cfg_basehost."', staticPath = '".$cfg_staticPath."';</script>";
        }
        $msg .= "<script>alert(\"" . str_replace("\"", "“", $_msg) . "\");</script>";

        if($goback){
            $msg .= "<script>
            var wx_miniprogram = 0;
            if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
                wx.miniProgram.getEnv(function (res) {
                    wx_miniprogram = 1;
                    wx.miniProgram.navigateBack();
                })
                
                if(!wx_miniprogram){
                    location.href='${gourl}';
                }
            }else if(navigator.userAgent.toLowerCase().match(/huoniao/)){
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler('goBack', {}, function (responseData) {
                    });
                });
            }else{
                location.href='${gourl}';
            }
            </script>";
        }
        elseif($gourl){
            $msg .= "<script>location.href='".$gourl."';</script>";
        }
    } else {
        //当网址为:close::objname 时, 关闭父框架的id=objname元素
        if (preg_match('/close::/', $gourl)) {
            $tgobj = trim(preg_replace('/close::/', '', $gourl));
            $gourl = 'javascript:;';
            $func .= "window.parent.document.getElementById('{$tgobj}').style.display='none';\r\n";
        }

        $func .= "  var pgo=0;\r\n";
        $func .= "  function JumpUrl(){\r\n";
        $func .= "      if(pgo==0){ location='$gourl'; pgo=1; }\r\n";
        $func .= "  }\r\n";
        $rmsg = $func;
        $rmsg .= "  document.write(\"<div class='s-tip'><div class='s-tip-head' style='display: none;'><h1>" . $GLOBALS['cfg_soft_enname'] . " " . $langData['siteConfig'][21][6] . "：</h1></div>\");\r\n";
        $rmsg .= "  document.write(\"<div class='s-tip-body'>" . str_replace("\"", "“", $msg) . "\");\r\n";
        $rmsg .= "  document.write(\"";

        if ($onlymsg == 0) {
            if ($gourl != 'javascript:;' && $gourl != '') {
                if($_GET['action'] != 'addSmsTemplate'){
                    $rmsg .= "<br /><a href='{$gourl}'>" . $langData['siteConfig'][21][7] . "</a></div>\");\r\n";
                }else{
                    $rmsg .= "</div>\");\r\n";
                }
                $rmsg .= "  setTimeout('JumpUrl()',$litime);";
            } else {
                $rmsg .= "<br /></div>\");\r\n";
            }
        } else {
            $rmsg .= "<br /><br /></div>\");\r\n";
        }
        $msg = $htmlhead . $rmsg . $htmlfoot;
    }
    echo $msg;
}

/*
 * 获取软件当前版本
 */
function getSoftVersion(){
    $m_file = HUONIAODATA . "/admin/version.txt";
    $version = "";
    if (filesize($m_file) > 0) {
        $fp = fopen($m_file, 'r');
        $version = fread($fp, filesize($m_file));
        fclose($fp);
    }
    return $version;
}

/**
 * 检查功能模块状态
 *
 * @param array $config
 * @return string
 */
function checkModuleState($config = array()){
    if ($config['visitState']) {
        die($config['visitMessage']);
    }
    if ($config['channelSwitch']) {
        die($config['closeCause']);
    }
}

/**
 *  获取验证码的session值
 *
 * @return    string
 */
function GetCkVdValue(){
    @session_id($_COOKIE['PHPSESSID']);
    return isset($_SESSION['huoniao_vdimg_value']) ? $_SESSION['huoniao_vdimg_value'] : '';
}

/**
 *  PHP某些版本有Bug，不能在同一作用域中同时读session并改注销它，因此调用后需执行本函数
 *
 * @return    void
 */
function ResetVdValue(){
    putSession('huoniao_vdimg_value');
}

//获取用户真实地址
function GetIP(){
    static $realip = NULL;
    if ($realip !== NULL) {
        return $realip;
    }
    if (isset($_SERVER)) {
        if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $arr = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            /* 取X-Forwarded-For中第x个非unknown的有效IP字符? */
            foreach ($arr as $ip) {
                $ip = trim($ip);
                if ($ip != 'unknown') {
                    $realip = $ip;
                    break;
                }
            }
        } elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
            $realip = $_SERVER['HTTP_CLIENT_IP'];
        } else {
            if (isset($_SERVER['REMOTE_ADDR'])) {
                $realip = $_SERVER['REMOTE_ADDR'];
            } else {
                $realip = '0.0.0.0';
            }
        }
    } else {
        if (getenv('HTTP_X_FORWARDED_FOR')) {
            $realip = getenv('HTTP_X_FORWARDED_FOR');
        } elseif (getenv('HTTP_CLIENT_IP')) {
            $realip = getenv('HTTP_CLIENT_IP');
        } else {
            $realip = getenv('REMOTE_ADDR');
        }
    }
    preg_match("/[\d\.]{7,15}/", $realip, $onlineip);
    $realip = !empty($onlineip[0]) ? $onlineip[0] : '0.0.0.0';
    return $realip;
}

//获取IP真实地址
function getIpAddr($ip, $type = 'string'){

    global $_G;
    global $cfg_juhe;
    $has = false;

    if(isset($_G[$ip]) != NULL) return $_G[$ip];

    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $key = $cfg_juhe['ipAddr'];

    //聚合数据接口
    if($key){

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "http://apis.juhe.cn/ip/ipNew?ip=$ip&key=" . $key);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT_MS, 200);
        $con = curl_exec($curl);
        curl_close($curl);

        $con = json_decode($con, true);
        if ($con['resultcode'] == 200) {
            $has = true;
            $data = $con['result'];
            if ($type == 'string') {
                $ret = $data['Province'] . ' ' . $data['City'] . ' ' . $data['Isp'];
                $_G[$ip] = $ret;
                return $ret;
            } elseif ($type == 'json') {
                $ret = array(
                    'location' => $data['Province'] . ' ' . $data['City'] . ' ' . $data['Isp'],
                    'region' => $data['Province'],
                    'city' => $data['City']
                );
                $_G[$ip] = $ret;
                return $ret;
            }
        } else {
            //失败后继续使用默认接口
            //return "未知";
        }

    }
    //阿里云

    if(!$has && $cfg_juhe['aliyun']){
        $host = "https://kzipquery.market.alicloudapi.com/api/ip/queryv2";
        $path = "";
        $method = "GET";
        $appcode = $cfg_juhe['aliyun'];
        $headers = array();
        array_push($headers, "Authorization:APPCODE " . $appcode);
        $querys = "ip=".$ip;
        $bodys = "";
        $url = $host . $path . "?" . $querys;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_FAILONERROR, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($curl, CURLOPT_TIMEOUT_MS, 200);
        $con = curl_exec($curl);
        curl_close($curl);
        $con = json_decode($con, true);
        if ($con['code'] == 200) {
            $has = true;
            $data = $con['data'];
            if ($type == 'string') {
                $ret = $data['province'] . ' ' . $data['city'] . ' ' . $data['isp'];
                $_G[$ip] = $ret;
                return $ret;
            } elseif ($type == 'json') {
                $ret = array(
                    'location' => $data['province'] . ' ' . $data['city'] . ' ' . $data['isp'],
                    'region' => $data['province'],
                    'city' => $data['city']
                );
                $_G[$ip] = $ret;
                return $ret;
            }
        } else {
            //失败后继续使用默认接口
            //return "未知";
        }
    }

    //百度
    if(!$has) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "https://opendata.baidu.com/api.php?resource_id=6006&ie=gbk&oe=utf8&query=$ip");
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT_MS, 200);
        $con = curl_exec($curl);
        curl_close($curl);

        $con = json_decode($con, true);
        if ($con['status'] == 0 && $con['data']) {
            $data = $con['data'][0];

            $location = $data['location'];
            $locationArr = explode(' ', $location);
            $pcData = $locationArr[0];
            $pcDataArr = explode('省', $pcData);
            $region = $pcDataArr[0];
            $city = $pcDataArr[1];
            $data['region'] = $region;
            $data['city'] = $city;

            if ($type == 'string') {
                $ret = $data['location'];
                $_G[$ip] = $ret;
                return $ret;
            } elseif ($type == 'json') {
                $_G[$ip] = $data;
                return $data;
            }
        } else {
            return "未知";
        }
    }


}

//检查IP段
function checkIpAccess($ip = '', $accesslist = ''){
    $accesslist = trim($accesslist);
    $accesslist = preg_replace('/($s*$)|(^s*^)/m', '',$accesslist);
    return preg_match("/^(" . str_replace(array("\r\n", ' '), array('|', ''), preg_quote($accesslist, '/')) . ")/", $ip);
}

//获取手机归属地
function getTelAddr($tel){

    global $cfg_juhe;
    $has = false;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $key = $cfg_juhe['mobileAddr'];

    //聚合数据接口
    if($key){

        $has = true;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "http://apis.juhe.cn/mobile/get?phone=$tel&key=" . $key);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT, 3);
        $con = curl_exec($curl);
        curl_close($curl);

        $con = json_decode($con, true);
        if ($con['resultcode'] == 200) {
            $data = $con['result'];
            return $data['province'] . $data['city'] . ' ' . $data['company'];
        } else {
            //return "未知";
        }

    }
    // 阿里云
    if(!$has) {

        $host = "https://api04.aliyun.venuscn.com";
        $path = "/mobile";
        $method = "GET";
        $appcode = $cfg_juhe['aliyun'];
        $headers = array();
        array_push($headers, "Authorization:APPCODE " . $appcode);
        $querys = "mobile=$tel";
        $bodys = "";
        $url = $host . $path . "?" . $querys;

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($curl, CURLOPT_FAILONERROR, false);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
        $con = curl_exec($curl);
        curl_close($curl);
        $con = json_decode($con, true);
        if ($con['ret'] == 200) {
            $has = true;
            $data = $con['data'];
            return $data['prov'] . $data['city'] . ' ' . $data['isp'];
        } else {
            //失败后继续使用默认接口
            return "未知";
        }
    }
}

//转换编码，将Unicode编码转换成可以浏览的utf-8编码
function unicode_decode($name){
    $pattern = '/([\w]+)|(\\\u([\w]{4}))/i';
    preg_match_all($pattern, $name, $matches);
    if (!empty($matches)) {
        $name = '';
        for ($j = 0; $j < count($matches[0]); $j++) {
            $str = $matches[0][$j];
            if (strpos($str, '\\u') === 0) {
                $code = base_convert(substr($str, 2, 2), 16, 10);
                $code2 = base_convert(substr($str, 4), 16, 10);
                $c = chr($code) . chr($code2);
                $c = iconv('UCS-2', 'UTF-8', $c);
                $name .= $c;
            } else {
                $name .= $str;
            }
        }
    }
    return $name;
}

/**
 * 获得当前的脚本网址
 *
 * @return    string
 */
function GetCurUrl(){
    if (!empty($_SERVER["REQUEST_URI"])) {
        $scriptName = $_SERVER["REQUEST_URI"];
        $nowurl = $scriptName;
    } else {
        $scriptName = $_SERVER["PHP_SELF"];
        if (empty($_SERVER["QUERY_STRING"])) {
            $nowurl = $scriptName;
        } else {
            $nowurl = $scriptName . "?" . $_SERVER["QUERY_STRING"];
        }
    }
    return $nowurl;
}

/*
 * 函数名称：create_sess_id()
 * 函数作用：产生以个随机的会话ID
 * 参   数：$len: 需要会话字符串的长度，默认为32位，不要低于16位
 * 返 回 值：返回会话ID
 */
function create_sess_id($len = 32){
    //校验提交的长度是否合法
    if (!is_numeric($len) || ($len > 32) || ($len < 16)) {
        return;
    }
    //获取当前时间的微秒
    list($u, $s) = explode(' ', microtime());
    $time = (float)$u + (float)$s;
    //产生一个随机数
    $rand_num = rand(100000, 999999);
    $rand_num = rand($rand_num, $time);
    mt_srand($rand_num);
    $rand_num = mt_rand();
    //产生SessionID
    $sess_id = md5(md5($time) . md5($rand_num));
    //截取指定需要长度的SessionID
    $sess_id = substr($sess_id, 0, $len);
    return $sess_id;
}

/*
 * 函数名称：create_check_code()
 * 函数作用：产生以个随机的校验码
 * 参   数：$len: 需要校验码的长度, 请不要长于16位,缺省为4位
 * 返 回 值：返回指定长度的校验码
 */
function create_check_code($len = 4){
    if (!is_numeric($len) || ($len > 15) || ($len < 1)) {
        return;
    }

    $check_code = substr(create_sess_id(), 16, $len);
    return strtoupper($check_code);
}


/**
 * 生成订单号
 * @return string
 */
function create_ordernum(){
    return intval(date('y')) .
        strtoupper(dechex(date('m'))) . date('d') .
        substr(time(), -5) . substr(microtime(), 2, 4) . sprintf('%02d', rand(0, 99));
}


/**
 * 生成指定数量的随机字符
 * $len 长度
 * $type 类型 1 数字  2 字母  3混合
 */
function genSecret($len = 6, $type = 1){
    $secret = '';
    for ($i = 0; $i < $len; $i++) {
        if ($type == 1) {
            if (0 == $i) {
                $secret .= chr(rand(49, 57));
            } else {
                $secret .= chr(rand(48, 57));
            }
        } else if ($type == 2) {
            $secret .= chr(rand(65, 90));
        } else {
            if (0 == $i) {
                $secret .= chr(rand(65, 90));
            } else {
                $secret .= (0 == rand(0, 1)) ? chr(rand(65, 90)) : chr(rand(48, 57));
            }
        }
    }
    return $secret;
}

/**
 * 遍历多维数组为一维数组
 *
 * @param array 传入的多维数组
 * @return array 返回一维数组
 */
function arr_foreach($arr){
    global $arr_data;
    if ((!is_array($arr) && $arr != NULL) || !$arr) {
        return $arr_data;
    }
    foreach ($arr as $key => $val) {
        if (is_array($val)) {
            arr_foreach($val);
        } else {
            if ($val && $val != NULL && $key == "id") {
                $arr_data = empty($arr_data) ? array() : $arr_data;
                array_push($arr_data, $val);
                // $arr_data[] = $val;
            }
        }
    }
    return $arr_data;
}

//stdClass Object对象转普通数组
function objtoarr($obj){
    $ret = array();
    if (!$obj) return false;
    foreach ($obj as $key => $value) {
        if (gettype($value) == 'array' || gettype($value) == 'object') {
            $ret[$key] = $value ? objtoarr($value) : array();
        } else {
            $ret[$key] = $value;
        }
    }
    return $ret;
}

//二维数组排序
function array_sort($arr, $keys, $type = 'asc'){
    $keysvalue = $new_array = array();
    foreach ($arr as $k => $v) {
        $keysvalue[$k] = $v[$keys];
    }
    if ($type == 'asc') {
        asort($keysvalue);
    } else {
        arsort($keysvalue);
    }
    reset($keysvalue);
    foreach ($keysvalue as $k => $v) {
        $new_array[$k] = $arr[$k];
    }
    return $new_array;
}

//分类操作
function typeAjax($arr, $pid = 0, $dopost, $more = array()){
    $dsql = new dsql($dbo);

    if (!is_array($arr) && $arr != NULL) {
        return '{"state": 200, "info": "保存失败！"}';
    }

    $more_field = $more_val = "";
    if($more){
        $more_field = $more[0] ? ", ".$more[0] : "";
        $more_val = isset($more[1]) ? ", ".$more[1] : "";
    }

    for ($i = 0; $i < count($arr); $i++) {
        $id = $arr[$i]["id"];
        $name = $arr[$i]["name"];
        $icon = $arr[$i]["icon"];
        $type = $arr[$i]["type"];
        $color = $arr[$i]["color"];
        $longitude = $arr[$i]["longitude"];
        $latitude = $arr[$i]["latitude"];

        if($more_val){
            $n = preg_match_all("/#(\w+)#/", $more_val, $res);
            if($n){
                foreach ($res[1] as $k => $v) {
                    $more_val = str_replace($res[0][$k], $arr[$i][$v], $more_val);
                }
            }
        }

        //如果ID为空则向数据库插入下级分类
        if ($id == "" || $id == 0) {
            //新闻频道包含拼音、拼音首字母
            if ($dopost == "articletype" || $dopost == "pictype" || $dopost == "car_brandtype" || $dopost == "travel_visacountrytype" || $dopost == "imagetype") {
                $pinyin = GetPinyin($name);
                $py = GetPinyin($name, 1);

                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $dopost . "` (`parentid`, `typename`, `pinyin`, `py`, `weight`, `pubdate` {$more_field}) VALUES ('$pid', '$name', '$pinyin', '$py', '$i', '" . GetMkTime(time()) . "' {$more_val})");

                //房产频道特殊字段
            } elseif ($dopost == "houseaddr") {
                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $dopost . "` (`parentid`, `typename`, `weight`, `pubdate`, `longitude`, `latitude`) VALUES ('$pid', '$name', '$i', '" . GetMkTime(time()) . "', '$longitude', '$latitude')");
            }elseif($dopost == "infotype"){
                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $dopost . "` (`parentid`,`typename`,`weight`, `pubdate` {$more_field}) VALUES ('$pid','$name', '$i', '" . GetMkTime(time()) . "' {$more_val})");
                // 招聘企业标签
            }elseif($dopost == "job_companytag"){
                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $dopost . "` (`parentid`, `typename`,`weight`, `color`) VALUES ('$pid', '$name', '$i', '$color')");
                // 其它
            } else {
                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $dopost . "` (`parentid`, `typename`,`weight`, `pubdate` {$more_field}) VALUES ('$pid', '$name', '$i', '" . GetMkTime(time()) . "' {$more_val})");
            }
            $id = $dsql->dsqlOper($archives, "lastid");

            adminLog("添加分类", $dopost . "=>" . $name);
        } //其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
        else {
            $hasIcon = false;
            $hasColor = false;
            //房产频道特殊字段
            if ($dopost == "houseaddr") {
                $archives = $dsql->SetQuery("SELECT `typename`, `weight`, `longitude`, `latitude` FROM `#@__" . $dopost . "` WHERE `id` = " . $id);
                // 分类有图标
            } elseif (
                $dopost == "education_type" || $dopost == "marry_type" || $dopost == "homemaking_type" ||
                $dopost == "car_brandtype" || $dopost == "business_type" || $dopost == "tieba_type" ||
                $dopost == "integral_type" || $dopost == "infotype" || $dopost == "tuantype" ||
                $dopost == "shop_type" || $dopost == "huangyetype"
            ) {
                $hasIcon = true;
                $archives = $dsql->SetQuery("SELECT `typename`, `weight`, `icon` FROM `#@__" . $dopost . "` WHERE `id` = " . $id);

            } elseif ($dopost == 'job_companytag'){
                $hasColor = true;
                $archives = $dsql->SetQuery("SELECT `typename`, `weight`, `color` FROM `#@__" . $dopost . "` WHERE `id` = " . $id);

            } else {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__" . $dopost . "` WHERE `id` = " . $id);
            }
            $results = $dsql->dsqlOper($archives, "results");
            if (!empty($results)) {
                //验证分类名
                if ($results[0]["typename"] != $name || $results[0]["type"] != $type ) {

                    //新闻频道包含拼音、拼音首字母
                    if ($dopost == "article" || $dopost == "pic" || $dopost == "image") {
                        $pinyin = GetPinyin($name);
                        $py = GetPinyin($name, 1);
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `typename` = '$name', `pinyin` = '$pinyin', `py` = '$py' WHERE `id` = " . $id);
                    } else {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `typename` = '$name', `type` = '$type' WHERE `id` = " . $id);
                    }
                    $dsql->dsqlOper($archives, "update");

                    adminLog("修改分类名", $dopost . "=>" . $name);
                }

                //验证排序
                if ($results[0]["weight"] != $i) {
                    $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `weight` = '$i' WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");

                    adminLog("修改分类排序", $dopost . "=>" . $name . "=>" . $i);
                }


                //房产频道特殊字段
                if ($dopost == "houseaddr") {
                    if ($results[0]["longitude"] != $longitude || $results[0]["latitude"] != $latitude) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `longitude` = '$longitude', `latitude` = '$latitude' WHERE `id` = " . $id);
                        $dsql->dsqlOper($archives, "update");
                        adminLog("修改房产区域坐标", $dopost . "=>" . $name . "=>" . $longitude . "," . $latitude);
                    }

                }

                // 带分类图标
                if ($hasIcon || isset($results[0]['icon'])) {
                    if ($results[0]['icon'] != $icon) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `icon` = '$icon' WHERE `id` = " . $id);
                        $dsql->dsqlOper($archives, "update");

                        if ($dopost == "integal_type") {
                            $tit = "积分商城";
                        }elseif ($dopost == "infotype") {
                            $tit = "分类信息";
                        }elseif ($dopost == "tuantype"){
                            $tit = "团购商家";
                        }elseif ($dopost == "shop_type"){
                            $tit = "商城";
                        }elseif ($dopost == "huangyetype"){
                            $tit = "黄页";
                        }elseif ($dopost == "business_type"){
                            $tit = "商家";
                        }else if($dopost == "car_brandtype"){
                            $tit = "汽车";
                        }elseif($dopost == "homemaking_type"){
                            $tit = "家政服务";
                        }elseif($dopost == "marry_type"){
                            $tit = "婚嫁";
                        }elseif($dopost == "education_type"){
                            $tit = "教育";
                        }elseif($dopost == "livetype"){
                            $tit = "直播";
                        }
                        adminLog("修改" . $tit . "分类图标", $dopost . "=>" . $name . "=>" . $icon);
                    }
                }

                // 带颜色
                if ($hasColor || isset($results[0]['color'])) {
                    if ($results[0]['color'] != $color) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $dopost . "` SET `color` = '$color' WHERE `id` = " . $id);
                        $dsql->dsqlOper($archives, "update");

                        adminLog("修改企业标签颜色", $dopost . "=>" . $name . "=>" . $color);
                    }
                }


            }
        }
        if (is_array($arr[$i]["lower"])) {
            typeAjax($arr[$i]["lower"], $id, $dopost, $more);
        }
    }
    return '{"state": 100, "info": "保存成功！"}';
}

/* 获取分类信息 */
function getTypeInfo($params){
    extract($params);
    $typeHandels = new handlers($service, "typeDetail");
    $typeConfig = $typeHandels->getHandle($typeid);

    if (is_array($typeConfig) && $typeConfig['state'] == 100) {
        $typeConfig = $typeConfig['info'];
        if (is_array($typeConfig)) {
            foreach ($typeConfig[0] as $key => $value) {
                if ($key == $return) {
                    return $value;
                }
            }
        }
    }
}

/* 获取分类名称 */
function getTypeName($params){
    $params['return'] = "typename";
    return getTypeInfo($params);
}

/**
 * 删除文件
 *
 * @param $picpath string 要删除的图片路径
 * @param $type string 要删除的图片类型
 * @param $mod string 要删除的模块
 * @return array
 */
function delPicFile($picpath, $type, $mod, $clearData = true){
    global $dsql;
    global $cfg_ftpState;
    global $cfg_ftpType;
    global $cfg_ftpSSL;
    global $cfg_ftpPasv;
    global $cfg_ftpUrl;
    global $cfg_uploadDir;
    global $cfg_ftpServer;
    global $cfg_ftpPort;
    global $cfg_ftpDir;
    global $cfg_ftpUser;
    global $cfg_ftpPwd;
    global $cfg_ftpTimeout;
    global $cfg_OSSUrl;
    global $cfg_OSSBucket;
    global $cfg_EndPoint;
    global $cfg_OSSKeyID;
    global $cfg_OSSKeySecret;
    global $cfg_fileUrl;
    global $cfg_basedir;
    global $cfg_QINIUAccessKey;
    global $cfg_QINIUSecretKey;
    global $cfg_QINIUbucket;
    global $cfg_QINIUdomain;
    global $cfg_OBSUrl;
    global $cfg_OBSBucket;
    global $cfg_OBSEndpoint;
    global $cfg_OBSKeyID;
    global $cfg_OBSKeySecret;
    global $cfg_COSUrl;
    global $cfg_COSBucket;
    global $cfg_COSRegion;
    global $cfg_COSSecretid;
    global $cfg_COSSecretkey;
    global $autoload;
    global $HN_memory;
    global $cfg_filedelstatus;

    $cfg_filedelstatus = (int)$cfg_filedelstatus;
    if($cfg_filedelstatus == 0) return;  //源文件删除开关

    $picpathArr = $picpathArr_ = array();
    $picpath = explode(",", $picpath);

    foreach ($picpath as $val) {
        $RenrenCrypt = new RenrenCrypt();
        $id = is_numeric($val) ? $val : $RenrenCrypt->php_decrypt(base64_decode($val));

        if (is_numeric($id)){
            $attachment = $dsql->SetQuery("SELECT `id`, `path`, `filetype`, `poster` FROM `#@__attachment` WHERE `id` = " . $id);
        }else{
            $attachment = $dsql->SetQuery("SELECT `id`, `path`, `filetype`, `poster` FROM `#@__attachment` WHERE `path` = '$val'");
        }
        $results = $dsql->dsqlOper($attachment, "results");
        
        if (!$results) continue;  //数据不存在
        $id = $results[0]['id'];
        $picpath = $results[0]['path'];
        $picpathArr_[] = $picpath;
        $filetype = $results[0]['filetype'];
        $poster = $results[0]['poster'];

        //删除视频封面
        if($filetype == 'video' && !empty($poster)){
            delPicFile($poster, 'delVideo', $mod, $clearData);
        }

        if ($type == "editor") {
            if (strpos($picpath, "file") !== false) {
                $picpath = explode("file/", $picpath);
            } elseif (strpos($picpath, "remote") !== false) {
                $picpath = explode("remote/", $picpath);
            } elseif (strpos($picpath, "plugins") !== false) {
                $mod = 'siteConfig';
                $picpath = explode("plugins/", $picpath);
            } else {
                $picpath = explode("image/", $picpath);
            }
        } elseif ($type == "delFile" || $type == "delfile") {
            $picpath = explode("file/", $picpath);
        } elseif ($type == "delWeixin" || $type == "delweixin") {
            $picpath = explode("weixin/", $picpath);
        } else {
            $_type = str_replace('del', '', $type);
            $_type = strtolower($_type);
            $picpath = explode($_type . "/", $picpath);
            // $picpath = explode("large/", $picpath);
        }
        $picpathArr[] = $picpath[1] ? $picpath[1] : ($picpath[2] ? $picpath[2] : $picpath[0]);

        if($clearData && is_numeric($id)){
            $attachment = $dsql->SetQuery("DELETE FROM `#@__attachment` WHERE `id` = " . $id);
            $dsql->dsqlOper($attachment, "update");

            //删除缓存
            $HN_memory->rm('attachment_' . $id);
        }

    }
    $picpath = join(",", $picpathArr);
    if (!empty($picpath)) {
        if ($mod != "siteConfig" && $mod) {
            require(HUONIAOINC . "/config/" . $mod . ".inc.php");

            if (empty($customFtp)) {
                global $customFtp;
            }
            if (empty($custom_ftpState)) {
                global $custom_ftpState;
            }
            if (empty($custom_ftpServer)) {
                global $custom_ftpServer;
            }
            if (empty($custom_ftpPort)) {
                global $custom_ftpPort;
            }
            if (empty($custom_ftpUser)) {
                global $custom_ftpUser;
            }
            if (empty($custom_ftpPwd)) {
                global $custom_ftpPwd;
            }
            if (empty($custom_ftpTimeout)) {
                global $custom_ftpTimeout;
            }
            if (empty($custom_ftpSSL)) {
                global $custom_ftpSSL;
            }
            if (empty($custom_ftpPasv)) {
                global $custom_ftpPasv;
            }
            if (empty($custom_ftpDir)) {
                global $custom_ftpDir;
            }
            if (empty($custom_ftpUrl)) {
                global $custom_ftpUrl;
            }
            if (empty($custom_uploadDir)) {
                global $custom_uploadDir;
            }
            if (empty($custom_ftpType)) {
                global $custom_ftpType;
            }
            if (empty($custom_OSSUrl)) {
                global $custom_OSSUrl;
            }
            if (empty($custom_OSSBucket)) {
                global $custom_OSSBucket;
            }
            if (empty($custom_EndPoint)) {
                global $custom_EndPoint;
            }
            if (empty($custom_OSSKeyID)) {
                global $custom_OSSKeyID;
            }
            if (empty($custom_OSSKeySecret)) {
                global $custom_OSSKeySecret;
            }
            if (empty($custom_QINIUAccessKey)) {
                global $custom_QINIUAccessKey;
            }
            if (empty($custom_QINIUSecretKey)) {
                global $custom_QINIUSecretKey;
            }
            if (empty($custom_QINIUbucket)) {
                global $custom_QINIUbucket;
            }
            if (empty($custom_QINIUdomain)) {
                global $custom_QINIUdomain;
            }
            if (empty($custom_OBSUrl)) {
                global $custom_OBSUrl;
            }
            if (empty($custom_OBSBucket)) {
                global $custom_OBSBucket;
            }
            if (empty($custom_OBSEndpoint)) {
                global $custom_OBSEndpoint;
            }
            if (empty($custom_OBSKeyID)) {
                global $custom_OBSKeyID;
            }
            if (empty($custom_OBSKeySecret)) {
                global $custom_OBSKeySecret;
            }
            if (empty($custom_COSUrl)) {
                global $custom_COSUrl;
            }
            if (empty($custom_COSBucket)) {
                global $custom_COSBucket;
            }
            if (empty($custom_COSRegion)) {
                global $custom_COSRegion;
            }
            if (empty($custom_COSSecretid)) {
                global $custom_COSSecretid;
            }
            if (empty($custom_COSSecretkey)) {
                global $custom_COSSecretkey;
            }

            //默认FTP帐号
            if ($customFtp == 0) {
                $custom_ftpState = $cfg_ftpState;
                $custom_ftpType = $cfg_ftpType;
                $custom_ftpSSL = $cfg_ftpSSL;
                $custom_ftpPasv = $cfg_ftpPasv;
                $custom_ftpUrl = $cfg_ftpUrl;
                $custom_uploadDir = $cfg_uploadDir;
                $custom_ftpServer = $cfg_ftpServer;
                $custom_ftpPort = $cfg_ftpPort;
                $custom_ftpDir = $cfg_ftpDir;
                $custom_ftpUser = $cfg_ftpUser;
                $custom_ftpPwd = $cfg_ftpPwd;
                $custom_ftpTimeout = $cfg_ftpTimeout;
                $custom_OSSUrl = $cfg_OSSUrl;
                $custom_OSSBucket = $cfg_OSSBucket;
                $custom_EndPoint = $cfg_EndPoint;
                $custom_OSSKeyID = $cfg_OSSKeyID;
                $custom_OSSKeySecret = $cfg_OSSKeySecret;
                $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
                $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
                $custom_QINIUbucket = $cfg_QINIUbucket;
                $custom_QINIUdomain = $cfg_QINIUdomain;
                $custom_OBSUrl = $cfg_OBSUrl;
                $custom_OBSBucket = $cfg_OBSBucket;
                $custom_OBSEndpoint = $cfg_OBSEndpoint;
                $custom_OBSKeyID = $cfg_OBSKeyID;
                $custom_OBSKeySecret = $cfg_OBSKeySecret;
                $custom_COSUrl = $cfg_COSUrl;
                $custom_COSBucket = $cfg_COSBucket;
                $custom_COSRegion = $cfg_COSRegion;
                $custom_COSSecretid = $cfg_COSSecretid;
                $custom_COSSecretkey = $cfg_COSSecretkey;
            }

            //自定义FTP配置
            if ($customFtp == 1) {
                //阿里云OSS
                if ($custom_ftpType == 1) {
                    if (strpos($custom_OSSUrl, "http://") !== false) {
                        $site_fileUrl = $custom_OSSUrl;
                    } else {
                        $site_fileUrl = "https://" . $custom_OSSUrl;
                    }
                    //七牛云
                } elseif ($custom_ftpType == 2) {
                    if (strpos($custom_QINIUdomain, "http://") !== false) {
                        $site_fileUrl = $custom_QINIUdomain;
                    } else {
                        $site_fileUrl = "http://" . $custom_QINIUdomain;
                    }
                    //华为云
                } elseif ($custom_ftpType == 3) {
                    if (strpos($custom_OBSUrl, "http://") !== false) {
                        $site_fileUrl = $custom_OBSUrl;
                    } else {
                        $site_fileUrl = "https://" . $custom_OBSUrl;
                    }
                    //腾讯云
                } elseif ($custom_ftpType == 4) {
                    if (strpos($custom_COSUrl, "http://") !== false) {
                        $site_fileUrl = $custom_COSUrl;
                    } else {
                        $site_fileUrl = "https://" . $custom_COSUrl;
                    }
                    //普通FTP
                } elseif ($custom_ftpState == 1) {
                    $site_fileUrl = $custom_ftpUrl . str_replace(".", "", $custom_ftpDir);
                    //本地
                } else {
                    if ($customUpload == 1) {
                        $site_fileUrl = $custom_uploadDir;
                    } else {
                        $site_fileUrl = $cfg_uploadDir;
                    }
                }
                //系统默认
            } else {
                //阿里云OSS
                if ($cfg_ftpType == 1) {
                    if (strpos($cfg_OSSUrl, "http://") !== false) {
                        $site_fileUrl = $cfg_OSSUrl;
                    } else {
                        $site_fileUrl = "https://" . $cfg_OSSUrl;
                    }
                    //七牛云
                } elseif ($cfg_ftpType == 2) {
                    if (strpos($cfg_QINIUdomain, "http://") !== false) {
                        $site_fileUrl = $cfg_QINIUdomain;
                    } else {
                        $site_fileUrl = "http://" . $cfg_QINIUdomain;
                    }
                    //华为云
                } elseif ($cfg_ftpType == 3) {
                    if (strpos($cfg_OBSUrl, "http://") !== false) {
                        $site_fileUrl = $cfg_OBSUrl;
                    } else {
                        $site_fileUrl = "https://" . $cfg_OBSUrl;
                    }
                    //腾讯云
                } elseif ($cfg_ftpType == 4) {
                    if (strpos($cfg_COSUrl, "http://") !== false) {
                        $site_fileUrl = $cfg_COSUrl;
                    } else {
                        $site_fileUrl = "https://" . $cfg_COSUrl;
                    }
                    //普通FTP
                } elseif ($cfg_ftpState == 1) {
                    $site_fileUrl = $custom_ftpDir;
                    //本地
                } else {
                    $site_fileUrl = $cfg_uploadDir;
                }
            }

            //模块自定义情况
            //普通FTP模式
            if ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 1) {
                $cfg_ftpType = 0;
                $cfg_ftpState = 1;
                $cfg_ftpDir = $custom_ftpDir;

                //阿里云OSS
            } elseif ($customFtp == 1 && $custom_ftpType == 1) {
                $cfg_ftpType = 1;
                $cfg_ftpState = 0;
                $cfg_ftpDir = $custom_uploadDir;

                //七牛云
            } elseif ($customFtp == 1 && $custom_ftpType == 2) {
                $cfg_ftpType = 2;
                $cfg_ftpState = 0;
                $cfg_ftpDir = $custom_uploadDir;

                //华为云OBS
            } elseif ($customFtp == 1 && $custom_ftpType == 3) {
                $cfg_ftpType = 3;
                $cfg_ftpState = 0;
                $cfg_ftpDir = $custom_uploadDir;

                //腾讯云OBS
            } elseif ($customFtp == 1 && $custom_ftpType == 4) {
                $cfg_ftpType = 4;
                $cfg_ftpState = 0;
                $cfg_ftpDir = $custom_uploadDir;

                //本地
            } elseif ($customFtp == 1 && $custom_ftpType == 0 && $custom_ftpState == 0) {
                $cfg_ftpType = 3;
                $cfg_ftpState = 0;
                $cfg_ftpDir = $custom_uploadDir;

            }

        } else {

            $custom_ftpState = $cfg_ftpState;
            $custom_ftpType = $cfg_ftpType;
            $custom_ftpSSL = $cfg_ftpSSL;
            $custom_ftpPasv = $cfg_ftpPasv;
            $custom_ftpUrl = $cfg_ftpUrl;
            $custom_uploadDir = $cfg_uploadDir;
            $custom_ftpServer = $cfg_ftpServer;
            $custom_ftpPort = $cfg_ftpPort;
            $custom_ftpDir = $cfg_ftpDir;
            $custom_ftpUser = $cfg_ftpUser;
            $custom_ftpPwd = $cfg_ftpPwd;
            $custom_ftpTimeout = $cfg_ftpTimeout;
            $custom_OSSUrl = $cfg_OSSUrl;
            $custom_OSSBucket = $cfg_OSSBucket;
            $custom_EndPoint = $cfg_EndPoint;
            $custom_OSSKeyID = $cfg_OSSKeyID;
            $custom_OSSKeySecret = $cfg_OSSKeySecret;
            $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
            $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
            $custom_QINIUbucket = $cfg_QINIUbucket;
            $custom_QINIUdomain = $cfg_QINIUdomain;
            $custom_OBSUrl = $cfg_OBSUrl;
            $custom_OBSBucket = $cfg_OBSBucket;
            $custom_OBSEndpoint = $cfg_OBSEndpoint;
            $custom_OBSKeyID = $cfg_OBSKeyID;
            $custom_OBSKeySecret = $cfg_OBSKeySecret;
            $custom_COSUrl = $cfg_COSUrl;
            $custom_COSBucket = $cfg_COSBucket;
            $custom_COSRegion = $cfg_COSRegion;
            $custom_COSSecretid = $cfg_COSSecretid;
            $custom_COSSecretkey = $cfg_COSSecretkey;

            //阿里云OSS
            if ($cfg_ftpType == 1) {
                if (strpos($cfg_OSSUrl, "http://") !== false) {
                    $site_fileUrl = $cfg_OSSUrl;
                } else {
                    $site_fileUrl = "https://" . $cfg_OSSUrl;
                }
                //七牛云
            } elseif ($cfg_ftpType == 2) {
                if (strpos($cfg_QINIUdomain, "http://") !== false) {
                    $site_fileUrl = $cfg_QINIUdomain;
                } else {
                    $site_fileUrl = "http://" . $cfg_QINIUdomain;
                }
                //华为云
            } elseif ($cfg_ftpType == 3) {
                if (strpos($cfg_OBSUrl, "http://") !== false) {
                    $site_fileUrl = $cfg_OBSUrl;
                } else {
                    $site_fileUrl = "https://" . $cfg_OBSUrl;
                }
                //腾讯云
            } elseif ($cfg_ftpType == 4) {
                if (strpos($cfg_COSUrl, "http://") !== false) {
                    $site_fileUrl = $cfg_COSUrl;
                } else {
                    $site_fileUrl = "https://" . $cfg_COSUrl;
                }
                //普通FTP
            } elseif ($cfg_ftpState == 1) {
                $site_fileUrl = $cfg_ftpDir;
                //本地
            } else {
                $site_fileUrl = $cfg_uploadDir;
            }
        }

        //列出要删除的文件类型
        if ($type == "delThumb" || $type == "delthumb") {
            $pathType = "thumb";
            // $pathModel = array("small", "middle", "large", "o_large");
            $pathModel = array("large");
        } else if ($type == "delAtlas" || $type == "delatlas") {
            $pathType = "atlas";
            // $pathModel = array("small", "large");
            $pathModel = array("large");
        } else if ($type == "delConfig" || $type == "delconfig") {
            $pathType = "config";
            $pathModel = array("large");
        } else if ($type == "delFriendLink" || $type == "delfriendLink") {
            $pathType = "friendlink";
            $pathModel = array("large");
        } else if ($type == "delAdv" || $type == "deladv" || $type == "deladvthumb") {
            $pathType = $type == "deladvthumb" ? "advthumb" : "adv";
            $pathModel = array("large");
        } else if ($type == "delCard" || $type == "delcard") {
            $pathType = "card";
            $pathModel = array("large");
        } else if ($type == "delLogo" || $type == "dellogo") {
            $pathType = "logo";
            $pathModel = array("large");
        } else if ($type == "delBrand" || $type == "delbrand") {
            $pathType = "brand";
            $pathModel = array("large");
        } else if ($type == "delbrandLogo" || $type == "delbrandlogo") {
            $pathType = "brandLogo";
            // $pathModel = array("small", "middle", "large");
            $pathModel = array("large");
        } else if ($type == "delFile" || $type == "delfile" || $type == "delfilenail") {
            $pathType = "file";
            $pathModel = array("large");
        } else if ($type == "delVideo" || $type == "delvideo") {
            $pathType = "video";
            $pathModel = array("large");
        } else if ($type == "delAudio" || $type == "delaudio") {
            $pathType = "audio";
            $pathModel = array("large");
        } else if ($type == "delFlash" || $type == "delflash") {
            $pathType = "flash";
            $pathModel = array("large");
        } else if ($type == "delPhoto" || $type == "delphoto") {
            $pathType = "photo";
            // $pathModel = array("small", "middle", "large");
            $pathModel = array("large");
        } else if ($type == "delWxUpImg") {
            $pathType = "wxupimg";
            $pathModel = array("large");
        } else if ($type == "delWxminProgram") {
            $pathType = "wxminProgram";
            $pathModel = array("large");
        } else if ($type == "delWeixin") {
            $pathType = "";
            $pathModel = array("weixin");
        } else if ($type == "delSingle" || $type == "delsingle") {
            $pathType = "single";
            $pathModel = array("large");
        } else if ($type == "delQuanj" || $type == "delquanj") {
            $pathType = "quanj";
            $pathModel = array("large");
        }else{
            $pathType = "";
            $pathModel = array($_type);
        }


        //编辑器附件
        if ($type == "editor") {
            //阿里云OSS
            if ($cfg_ftpType == 1) {
                $OSSConfig = array();
                if ($mod != "siteConfig") {
                    $OSSConfig = array(
                        "bucketName" => $custom_OSSBucket,
                        "endpoint" => $custom_EndPoint,
                        "accessKey" => $custom_OSSKeyID,
                        "accessSecret" => $custom_OSSKeySecret
                    );
                }

                include_once(HUONIAOINC . '/class/aliyunOSS.class.php');
                $aliyunOSS = new aliyunOSS($OSSConfig);

                foreach ($picpathArr_ as $val) {
                    $aliyunOSS->delete($val);
                    $ossError = $aliyunOSS->error();
                }

                if ($ossError) {
                    $error = $ossError;
                }
                //七牛云
            } elseif ($cfg_ftpType == 2) {
                $autoload = true;
                $accessKey = $custom_QINIUAccessKey;
                $secretKey = $custom_QINIUSecretKey;
                // 构建鉴权对象
                $auth = new Auth($accessKey, $secretKey);
                // 要上传的空间
                $bucket = $custom_QINIUbucket;
                //初始化BucketManager
                $bucketMgr = new BucketManager($auth);
                foreach ($picpathArr_ as $val) {
                    $err = $bucketMgr->delete($bucket, $val);
                }
                if ($err !== null) {
                    $error = $err;
                }
                //华为云
            } elseif ($cfg_ftpType == 3) {
                $ak = $custom_OBSKeyID;
                $sk = $custom_OBSKeySecret;
                $endpoint = $custom_OBSEndpoint;
                $bucketName = $custom_OBSBucket;

                $autoload = true;
                $obsClient = ObsClient::factory([
                    'key'             => $ak,
                    'secret'          => $sk,
                    'endpoint'        => $endpoint,
                    'socket_timeout'  => 30,
                    'connect_timeout' => 10
                ]);

                try{

                    foreach ($picpathArr_ as $val) {
                        $resp = $obsClient->deleteObject([
                            'Bucket'=>$bucketName,
                            'Key'=>$val,
                            'Quiet'=> false,
                        ]);
                    }

                } catch ( ObsException $e ) {
                    $error = '华为云接口操作失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                } finally{
                    $obsClient->close ();
                }

                //腾讯云
            } elseif ($cfg_ftpType == 4) {
                $autoload = true;
                $cosClient = new Qcloud\Cos\Client(array(
                    'region' => $custom_COSRegion,
                    'schema' => 'http', //协议头部，默认为http
                    'credentials'=> array(
                        'secretId'  => $custom_COSSecretid ,
                        'secretKey' => $custom_COSSecretkey
                    )
                ));

                try {
                    foreach ($picpathArr_ as $val) {
                        $cosClient->deleteObject(array(
                            "bucket" => $custom_COSBucket, //格式：BucketName-APPID
                            "key" => $val
                        ));
                    }
                } catch (\Exception $e) {
                    // 请求失败
                    $error = $e;
                };

                //普通FTP模式
            } elseif ($cfg_ftpType === 0 && $cfg_ftpState === 1) {
                $ftpConfig = array();
                if ($mod != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
                    $ftpConfig = array(
                        "on" => $custom_ftpState, //是否开启
                        "host" => $custom_ftpServer, //FTP服务器地址
                        "port" => $custom_ftpPort, //FTP服务器端口
                        "username" => $custom_ftpUser, //FTP帐号
                        "password" => $custom_ftpPwd,  //FTP密码
                        "attachdir" => $custom_ftpDir,  //FTP上传目录
                        "attachurl" => $custom_ftpUrl,  //远程附件地址
                        "timeout" => $custom_ftpTimeout,  //FTP超时
                        "ssl" => $custom_ftpSSL,  //启用SSL连接
                        "pasv" => $custom_ftpPasv  //被动模式连接
                    );
                }

                global $autoload;
                global $handler;
                $autoload = false;
                $handler = false;
                $huoniao_ftp = new ftp($ftpConfig);
                $huoniao_ftp->connect();
                if ($huoniao_ftp->connectid) {
                    foreach ($picpathArr_ as $val) {
                        $filePath = $cfg_ftpDir . $val;
                        if (!$huoniao_ftp->ftp_delete($filePath)) {
                            $error = "要删除的文件不存在";
                        }
                    }
                }

                //本地附件
            } else {
                foreach ($picpathArr_ as $val) {
                    $filePath = HUONIAOROOT . $site_fileUrl . $val;
                    if (file_exists($filePath)) {
                        unlinkFile($filePath);
                    } else {
                        $error = "要删除的文件不存在";
                    }
                }
            }

            //输出错误信息
            if (!empty($error)) {
                //echo '{"state":"ERROR","info":"'.$error.'"}';
            }

            //缩略图、图集、附件
        } else {
            if (!empty($pathModel)) {
                //循环操作相关文件
                foreach ($pathModel as $key => $value) {
                    $imgPath = explode(",", $picpath);

                    foreach ($imgPath as $val) {

                        $val = str_replace($value. '/', '', $val);  //如果val中已经包含value，需要先删除掉

                        //阿里云OSS
                        if ($cfg_ftpType == 1) {
                            $OSSConfig = array();
                            if ($mod != "siteConfig") {
                                $OSSConfig = array(
                                    "bucketName" => $custom_OSSBucket,
                                    "endpoint" => $custom_EndPoint,
                                    "accessKey" => $custom_OSSKeyID,
                                    "accessSecret" => $custom_OSSKeySecret
                                );
                            }

                            global $autoload;
                            $autoload = false;
                            require_once HUONIAOINC . '/class/aliyunOSS.class.php';
                            $aliyunOSS = new aliyunOSS($OSSConfig);
                            $aliyunOSS->delete($mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val);
                            $ossError = $aliyunOSS->error();

                            if ($ossError) {
                                $error = $ossError;
                            }
                            //七牛云
                        } elseif ($cfg_ftpType == 2) {
                            $autoload = true;
                            $accessKey = $custom_QINIUAccessKey;
                            $secretKey = $custom_QINIUSecretKey;
                            //echo $accessKey;die;
                            // 构建鉴权对象
                            $auth = new Auth($accessKey, $secretKey);
                            // 要上传的空间
                            $bucket = $custom_QINIUbucket;
                            //初始化BucketManager
                            $bucketMgr = new BucketManager($auth);
                            $err = $bucketMgr->delete($bucket, "/" . $mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val);
                            if ($err !== null) {
                                $error = $err;
                            }
                            //华为云
                        } elseif ($cfg_ftpType == 3) {

                            $ak = $custom_OBSKeyID;
                            $sk = $custom_OBSKeySecret;
                            $endpoint = $custom_OBSEndpoint;
                            $bucketName = $custom_OBSBucket;

                            if(!$endpoint) return;

                            $autoload = true;
                            $obsClient = ObsClient::factory([
                                'key' => $ak,
                                'secret' => $sk,
                                'endpoint' => $endpoint,
                                'socket_timeout' => 30,
                                'connect_timeout' => 10
                            ]);


                            try{
                                $resp = $obsClient->deleteObject([
                                    'Bucket'=>$bucketName,
                                    'Key'=>"/" . $mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val,
                                    'Quiet'=> false,
                                ]);

                            } catch ( ObsException $e ) {
                                $error = '华为云接口操作失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                            } finally{
                                $obsClient->close ();
                            }
                            //腾讯云
                        } elseif ($cfg_ftpType == 4) {
                            $autoload = true;
                            $cosClient = new Qcloud\Cos\Client(array(
                                'region' => $custom_COSRegion,
                                'schema' => 'http', //协议头部，默认为http
                                'credentials'=> array(
                                    'secretId'  => $custom_COSSecretid ,
                                    'secretKey' => $custom_COSSecretkey
                                )
                            ));

                            try {
                                $ret = $cosClient->deleteObject(array(
                                    "Bucket" => $custom_COSBucket, //格式：BucketName-APPID
                                    "Key" => "/" . $mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val
                                ));
                            } catch (\Exception $e) {
                                // 请求失败
                                $error = $e;
                            };

                            //普通FTP模式
                        } elseif ($cfg_ftpType == 0 && $cfg_ftpState == 1) {
                            $ftpConfig = array();
                            if ($mod != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
                                $ftpConfig = array(
                                    "on" => $custom_ftpState, //是否开启
                                    "host" => $custom_ftpServer, //FTP服务器地址
                                    "port" => $custom_ftpPort, //FTP服务器端口
                                    "username" => $custom_ftpUser, //FTP帐号
                                    "password" => $custom_ftpPwd,  //FTP密码
                                    "attachdir" => $custom_ftpDir,  //FTP上传目录
                                    "attachurl" => $custom_ftpUrl,  //远程附件地址
                                    "timeout" => $custom_ftpTimeout,  //FTP超时
                                    "ssl" => $custom_ftpSSL,  //启用SSL连接
                                    "pasv" => $custom_ftpPasv  //被动模式连接
                                );
                            }


                            global $autoload;
                            global $handler;
                            $autoload = false;
                            $handler = false;
                            $huoniao_ftp = new ftp($ftpConfig);
                            $huoniao_ftp->connect();
                            if ($huoniao_ftp->connectid) {
                                $filePath = $cfg_ftpDir . "/" . $mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val;
                                if (!$huoniao_ftp->ftp_delete($filePath)) {
                                    $error = "要删除的文件不存在";
                                }
                            }

                            //本地附件
                        } else {
                            $filePath = HUONIAOROOT . $site_fileUrl . "/" . $mod . "/" . ($pathType ? $pathType . "/" : "") . $value . "/" . $val;
                            include_once(HUONIAOINC . '/class/file.class.php');
                            if (!unlinkFile($filePath)) {
                                $error = "要删除的文件不存在";
                            }
                        }
                    }

                }

                //输出错误信息
                if (!empty($error)) {
                    //echo '{"state":"ERROR","info":"'.$error.'"}';
                }

            } else {
                //echo '{"state":"ERROR","info":"PathModel Is Wrong!"}';
            }
        }

    } else {
        //echo '{"state":"ERROR","info":"Empty Path!"}';
    }
}

//提取内容图片并删除
function delEditorPic($body, $dopost){
    global $cfg_attachment;
    global $cfg_secureAccess;
    global $cfg_basehost;

    $u = str_replace('//', '\/\/', $cfg_secureAccess) . $cfg_basehost . '\/include\/attachment.php';
    $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

    //特殊情况兼容处理
    $u = str_replace('//', '\/\/', $cfg_secureAccess) . 'www.' . $cfg_basehost . '\/include\/attachment.php';
    $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

    $attachment = substr($cfg_attachment, 1, strlen($cfg_attachment));

    $attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
    $attachment = str_replace("https://" . $cfg_basehost, "", $attachment);
    $attachment = substr($attachment, 1, strlen($attachment));

    $attachment = str_replace("/", "\/", $attachment);
    $attachment = str_replace(".", "\.", $attachment);
    $attachment = str_replace("?", "\?", $attachment);
    $attachment = str_replace("=", "\=", $attachment);

    preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $body, $picList);
    $picList = array_unique($picList[1]);

    //删除内容图片
    if (!empty($picList)) {
        $editorPic = array();
        foreach ($picList as $v_) {
            $editorPic[] = $v_;
        }
        $editorPic = !empty($editorPic) ? join(",", $editorPic) : "";
        if (!empty($editorPic)) {
            delPicFile($editorPic, "editor", $dopost);
        }
    }
}

//获取分类所有父级
function getParentArr($tab, $typeid){
    global $dsql;
    global $HN_memory;
    $typeid = (int)$typeid;
    if (!empty($typeid)) {

        //网站地区读缓存
        // $site_area_cache = $HN_memory->get('site_area_' . $typeid);
        // if($tab == 'site_area' && $site_area_cache){
        //     return $site_area_cache;
        // }else {
            $archives = $dsql->SetQuery("SELECT `id`, `parentid`, `typename`, `weight` FROM `#@__" . $tab . "` WHERE `id` = " . $typeid);

            if($tab == "article"){
                $results = getCache($tab."_par", $archives, 0, array("sign" => $typeid));
            }else{
                $results = $dsql->dsqlOper($archives, "results");
            }
            if ($results) {
                if ($results[0]['parentid'] != 0) {
                    $results[]["lower"] = getParentArr($tab, $results[0]['parentid']);
                }
            }

            //写缓存
            if($tab == 'site_area') {
                $HN_memory->set('site_area_' . $typeid, $results);
            }

            return $results;
        // }
    }
}

//只取数组中的分类名
function parent_foreach($arr, $type){
    global $data;
    $data = is_array($data) ? $data : array();
    if (!empty($arr)) {
        if (!is_array($arr) && $arr != NULL) {
            return $data;
        }
        foreach ($arr as $key => $val) {
            if (is_array($val)) {
                parent_foreach($val, $type);
            } else {
                if ($val != NULL && $key == $type) {
                    // $data[]=$val;
                    array_push($data, $val);
                }
            }
        }
        return $data;
    } else {
        return array();
    }
}

//笛卡尔集
function descartes(){
    $t = func_get_args();
    if(func_num_args() == 1 && is_array($t[0])){
        return call_user_func_array(__FUNCTION__, $t[0]);
    }
    $a = array_shift($t);
    if (!is_array($a)) $a = array($a);
    $a = array_chunk($a, 1);
    do {
        $r = array();
        $b = array_shift($t);
        if (!is_array($b)) $b = array($b);
        foreach ($a as $p)
            foreach (array_chunk($b, 1) as $q)
                $r[] = array_merge($p, $q);
        $a = $r;
    } while ($t);
    return $r;
}

//获取客户端远程端口
function getRemotePort(){
    $remote_port = $_SERVER['REMOTE_PORT'];
    if($remote_port){
        return $remote_port;
    }elseif($_SERVER['HTTP_ALI_CDN_REAL_PORT']){
        return $_SERVER['HTTP_ALI_CDN_REAL_PORT'];
    }
}

/**
 * 记录操作日志
 *
 * @param $name string 运作
 * @param $note string 其它
 */
function adminLog($name = "", $note = "", $module = ""){
    global $dsql;
    global $userLogin;
    global $max_siteLog_save_day;  //日志保存天数
    $max_siteLog_save_day = (int)$max_siteLog_save_day;
    
    //如果为0说明是还没有设置过最大天数，只有设置过的才做删除操作
    //这里设置为6小时缓存时间，防止频繁清理
    $lastClearTime = (int)cache_read('clearAdminLog.txt', '', true);
    $time = GetMkTime(time());
    if($max_siteLog_save_day && (!$lastClearTime || ($lastClearTime + 60 * 60 * 6) < $time)){
        $_time = GetMkTime(time()) - $max_siteLog_save_day * 86400;
        $_sql = $dsql->SetQuery("DELETE FROM `#@__sitelog` WHERE `pubdate` < ".$_time);
        $dsql->dsqlOper($_sql, "update");

        //更新清除时间
        cache_write('clearAdminLog.txt', $time, '', true);
    }
    
    $adminid = $userLogin->getUserID();
    $ip = $name == '同步文件' || $name == '同步数据库' ? '未知' : GetIp();

    //端口号
    $remote_port = getRemotePort();
    if($remote_port){
        $ip .= ':' . $remote_port;
    }

    //页面请求地址
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost');
    $url = 'http' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 's' : '')
    . '://'
    . $host
    . $_SERVER['SCRIPT_NAME'];
    
    if($name == '修改模板'){
        unset($_REQUEST['edit_content']);
    }
    $param = is_array($_REQUEST) ? http_build_query($_REQUEST) : $_REQUEST;
    $param = addslashes(urldecode($param));

    if($note == 'AES密钥'){
        $param = '';
    }

    $url = addslashes($url);
    $note = addslashes($note);
    $useragent = addslashes($_SERVER['HTTP_USER_AGENT']);

    $archives = $dsql->SetQuery("INSERT INTO `#@__sitelog` (`admin`, `name`, `note`, `ip`, `pubdate`, `url`, `param`, `useragent`, `module`) VALUES ('$adminid', '$name', '$note', '$ip', '" . GetMkTime(time()) . "', '$url', '$param', '$useragent', '$module')");
    $result = $dsql->dsqlOper($archives, "update");
    if ($result != "ok") {
        //echo "管理员日志记录失败！";
    }
}

/**
 * 记录用户行为日志
 *
 * @param $uid    int    要记录的用户ID
 * @param $module string 所属模块
 * @param $temp   string 模块业务(一般为detail，像旅游模块的酒店信息，这里的值就为hotel)
 * @param $aid    int    模块业务信息ID
 * @param $type   string 操作类型(select/insert/update/delete)
 * @param $note   string 操作描述
 * @param $link   string 模块业务信息链接
 * @param $sql    string 此次行为涉及到的sql语句
 */
function memberLog($uid = 0, $module = "siteConfig", $temp = 'detail', $aid = 0, $type = '', $note = '', $link = '', $sql = ''){
    global $dsql;
    global $max_memberBehaviorLog_save_day;  //日志保存天数
    $max_memberBehaviorLog_save_day = (int)$max_memberBehaviorLog_save_day;

    $tabName = '#@__member_log';
    //如果为0说明是还没有设置过最大天数，只有设置过的才做删除操作
    //这里设置为6小时缓存时间，防止频繁清理
    $lastClearTime = (int)cache_read('clearMemberLog.txt', '', true);
    $time = GetMkTime(time());
    if($max_memberBehaviorLog_save_day && (!$lastClearTime || ($lastClearTime + 60 * 60 * 6) < $time)){
        $_time = GetMkTime(time()) - $max_memberBehaviorLog_save_day * 86400;
        $_sql = $dsql->SetQuery("DELETE FROM `$tabName` WHERE `pubdate` < ".$_time);
        $dsql->dsqlOper($_sql, "update");

        //更新清除时间
        cache_write('clearMemberLog.txt', $time, '', true);
    }
    
    $uid = (int)$uid;
    $aid = (int)$aid;

    if(!$uid) return;

    $md5 = md5($note);
    $ip = GetIP();

    $_ip = $ip; 

    //端口号
    $remote_port = getRemotePort();
    if($remote_port){
        $_ip = $ip . ':' . $remote_port;
    }

    //如果相同动作一秒钟以内记录过一次，则不再重复记录
    if(strstr($note, '用户退出登录')){
        $pubdate = GetMkTime(time()) - 300;  //退出的动作5分钟记录一次
        
        $_sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `$tabName` WHERE `md5` = '$md5' AND `uid` = $uid AND `ip` = '$_ip' AND `pubdate` > '$pubdate'");
        $ret = $dsql->dsqlOper($_sql, "results");
        if($ret && $ret[0]['totalCount'] > 0){
            return;
        }
    }else{
        $pubdate = GetMkTime(time());
        
        $_sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `$tabName` WHERE `md5` = '$md5' AND `uid` = $uid AND `ip` = '$_ip' AND `pubdate` = '$pubdate'");
        $ret = $dsql->dsqlOper($_sql, "results");
        if($ret && $ret[0]['totalCount'] > 0){
            return;
        }
    }

    $ipaddr = getIpAddr($ip);
    $useragent = addslashes(htmlspecialchars(RemoveXSS($_SERVER['HTTP_USER_AGENT'])));

    $sql = addslashes($sql);

    //页面请求地址
    $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : (isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost');
    $url = 'http' . (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on' ? 's' : '')
    . '://'
    . $host
    . $_SERVER['SCRIPT_NAME'];

    //页面请求参数
    if(isset($_REQUEST['password'])){
        $_REQUEST['password'] = '密码不记录';
    }
    // $param = strstr($note, '用户登录') ? "" : http_build_query($_REQUEST);   //不记录登录时的表单信息
    $param = http_build_query($_REQUEST);
    $param = urldecode($param);

    //来源页面
    $referer = htmlspecialchars(RemoveXSS($_SERVER['HTTP_REFERER']));

    $archives = $dsql->SetQuery("INSERT INTO `$tabName` (`uid`, `module`, `temp`, `aid`, `type`, `note`, `link`, `ip`, `ipaddr`, `useragent`, `sql`, `pubdate`, `md5`, `url`, `param`, `referer`) VALUES ('$uid', '$module', '$temp', '$aid', '$type', '$note', '$link', '$_ip', '$ipaddr', '$useragent', '$sql', '$pubdate', '$md5', '$url', '$param', '$referer')");
    $dsql->dsqlOper($archives, "lastid", null, 'member_log', 0);

    //同步城市招聘的企业和简历最后登录时间
    global $installModuleArr;
    if(in_array("zhaopin", $installModuleArr) && strstr($note, '用户登录')){
        $sql = $dsql->SetQuery("SELECT `id`, `lastlogintime` FROM `#@__member` WHERE `zhaopin_company` = 2 AND `id` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $lastlogintime = $ret[0]['lastlogintime'];
            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_company` SET `time_lastLogin` = '$lastlogintime' WHERE `userid` = $uid");
            $dsql->dsqlOper($sql, "update");
        }

        //同步简历的最后登录时间
        $sql = $dsql->SetQuery("SELECT `id`, `lastlogintime` FROM `#@__member` WHERE `zhaopin_resume` = 2 AND `id` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $lastlogintime = $ret[0]['lastlogintime'];
            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_resume` SET `lastlogintime` = '$lastlogintime' WHERE `userid` = $uid");
            $dsql->dsqlOper($sql, "update");
        }
    }
}

/*
 * 邮件发送函数
 * @param $email      string 收件人
 * @param $mailtitle  string 主题
 * @param $mailbody   string 内容
 */
function sendmail($email, $mailtitle, $mailbody,$params = array()){
    global $cfg_mail, $cfg_mailServer, $cfg_mailPort, $cfg_mailFrom, $cfg_mailUser, $cfg_mailPass, $siteCityName, $cfg_shortname, $userLogin;
    $mailServer = explode(",", $cfg_mailServer);
    $mailPort = explode(",", $cfg_mailPort);
    $mailFrom = explode(",", $cfg_mailFrom);
    $mailUser = explode(",", $cfg_mailUser);
    $mailPass = explode(",", $cfg_mailPass);

    $shortname = str_replace('$city', $siteCityName, stripslashes($cfg_shortname));

    $c_mailServer = $c_mailPort = $c_mailFrom = $c_mailUser = $c_mailPass = "";
    foreach ($mailServer as $key => $value) {
        if ($key == $cfg_mail) {
            $c_mailServer = $mailServer[$key];
            $c_mailPort = $mailPort[$key];
            $c_mailFrom = $mailFrom[$key];
            $c_mailUser = $mailUser[$key];
            $c_mailPass = $mailPass[$key];
        }
    }

    $uid = $userLogin->getMemberID();

    //前台未登录的获取后台登录帐号
    if ($uid == -1) {
        $uid = $userLogin->getUserID();
    }


    if (!empty($c_mailServer)) {

        require_once(HUONIAOINC . '/class/PHPMailer.class.php');

        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->CharSet = "UTF-8";
        $mail->Host = $c_mailServer;
        $mail->SMTPAuth = true;
        $mail->Username = $c_mailUser;
        $mail->Password = $c_mailPass;
        if ($c_mailPort == "465") {
            $mail->SMTPSecure = 'ssl';
        }
        $mail->Port = $c_mailPort;

        //解决部分服务器无法正常发送的问题，原因是ssl认证未通过
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        $mail->setFrom($c_mailFrom, $shortname);
        $mail->addAddress($email);
        $mail->isHTML(true);

        $mail->Subject = $mailtitle;
        $mail->Body = htmlspecialchars_decode($mailbody);

        //提取附件列表
        $attaches = $params['attaches'] ?: array();
        foreach ($attaches as $attach){
            //第一个参数path是附件的本地路径，第二个参数是附件在邮件中的名称
            $mail->addAttachment($attach['path'],$attach['name']);
        }

        if (!$mail->send()) {

            if(HUONIAOBUG){
                require_once HUONIAOROOT."/api/payment/log.php";
                $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/mail/'.date('Y-m-d').'.log');
                $_mailLog->DEBUG("邮件发送错误日志");
                $_mailLog->DEBUG("发送内容：" . json_encode(array("邮箱：" => $email, "标题：" => $mailtitle, "内容：" => $mailbody), JSON_UNESCAPED_UNICODE));
                $_mailLog->DEBUG("错误内容：" . json_encode($mail->ErrorInfo, JSON_UNESCAPED_UNICODE) . "\r\n\r\n");
            }

            messageLog("email", '', $email, $mailtitle, $mailbody, $uid, 1);
            return $mail->ErrorInfo;
        }

        messageLog("email", '', $email, $mailtitle, $mailbody, $uid, 0);

    } else {

        messageLog("email", '', $email, $mailtitle, $mailbody, $uid, 1);

        return '邮件发送失败，ErrCode: 邮件配置2';
        exit();
    }

    // if(!empty($c_mailServer)){
    //  $mailtype = 'HTML';
    //  require_once(HUONIAOINC.'/class/mail.class.php');
    //  $smtp = new smtp($c_mailServer, $c_mailPort, true, $c_mailFrom, $c_mailPass);
    //  $smtp->debug = false;
    //  if(!$smtp->smtp_sockopen($c_mailServer)){
    //      return '邮件发送失败，ErrCode: 邮件配置1';exit();
    //  }
    //  $smtp->sendmail($email, $cfg_webname, $c_mailFrom, $mailtitle, htmlspecialchars_decode($mailbody), $mailtype);
    // }else{
    //  return '邮件发送失败，ErrCode: 邮件配置2';exit();
    // }

}

/*
 * 短信发送函数
 * @param $phone          string   接收手机号码
 * @param $id             string   短信模板ID（如果类型为数字则代表当前系统的数据ID，如果为其他则代表其他平台的营销型短信模板）
 * @param $code           int      变量内容
 * @param $type           string   类型
 * @param $has            boolean  是否已经存在
 * @param $promotion      boolean  是否为营销型短信
 * @
 */
function sendsms($phone, $id, $code, $type = "", $has = false, $promotion = false, $notify = "", $config = array()){

    global $dsql;
    global $userLogin;
    global $cfg_smsAlidayu;
    global $handler;
    global $autoload;
    $handler = false;
    $autoload = true;

    $areaCode = (int)$_REQUEST['areaCode'];
    $areaCode = !empty($areaCode) ? $areaCode : 86;

    $uid = $userLogin->getMemberID();
    $ip = GetIP();
    $now = GetMkTime(time());

    //前台未登录的获取后台登录帐号
    if ($uid == -1) {
        $uid = $userLogin->getUserID();
    }

    unset($config['fields']);

    //获取短信内容
    $tempid = "";
    $content = "";
    if (is_numeric($id) && $id == 1 && $notify) {
        if($code){
            $config['code'] = $code;
        }
        $contentTpl = getInfoTempContent("sms", $notify, $config);
        if ($contentTpl) {
            $tempid = $contentTpl['title'];
            $intempid = $contentTpl['intitle'];
            $content = $contentTpl['content'];

            if($areaCode != 86 && $intempid){
                $tempid = $intempid;
            }

            if(($tempid == "" && $cfg_smsAlidayu > 0) || $content == ""){
                return array("state" => 200, "info" => '短信通知未启用');
            }
        }else{
            return array("state" => 200, "info" => '短信通知未启用');
        }

//        if ($tempid == "" && $content == "") {
//            return array("state" => 200, "info" => "短信通知未开启，发送失败！");
//        }
    } else {
        //如果是营销型短信或重新发送短信，短信内容则为ID
        if ($promotion) {
            $content = $id;
        } else {
            $content = "您的短信验证码：" . $code;
        }
    }

//    if(empty($content) || empty($tempid)) return;

    //如果是阿里平台
    if ($cfg_smsAlidayu == 1) {

//        $phone_ = substr($phone, -11);
        $phone_ = $phone;

        $archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` WHERE `state` = 1");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $data = $results[0];
            $portal = $data['title'];
            $username = $data['username'];
            $password = $data['password'];
            $signCode = $data['signCode'];

            //如果是数据
            if (is_numeric($id) && $id == 1 && $notify) {
                // $sql = $dsql->SetQuery("SELECT `tempid` FROM `#@__site_smstemp` WHERE `id` = $id");
                // $ret = $dsql->dsqlOper($sql, "results");
                // if($ret){
                //     $tempid = $ret[0]['tempid'];
                // }else{
                //     //阿里大鱼测试模板
                //     $tempid   = "SMS_10652302";
                //     $signCode = "大鱼测试";
                // }
            } else {
                $tempid = $id;
            }

            if ($tempid) {

                //阿里云
                if ($portal == "阿里云") {

                    include_once HUONIAOINC . '/class/sms/aliyun/SendSmsRequest.php';

                    //短信API产品名
                    $product = "Dysmsapi";
                    //短信API产品域名
                    $domain = "dysmsapi.aliyuncs.com";
                    //暂时不支持多Region
                    $region = "cn-hangzhou";

                    //初始化访问的acsCleint
                    $profile = DefaultProfile::getProfile($region, $username, $password);
                    DefaultProfile::addEndpoint("cn-hangzhou", "cn-hangzhou", $product, $domain);
                    $acsClient = new DefaultAcsClient($profile);

                    $request = new SendSmsRequest();
                    //必填-短信接收号码
                    $request->setPhoneNumbers($phone_);
                    //必填-短信签名
                    $request->setSignName($signCode);
                    //必填-短信模板Code
                    $request->setTemplateCode($tempid);
                    //选填-假如模板中存在变量需要替换则为必填(JSON格式)
                    //测试短信不需要传递变量
                    if (is_numeric($id) && $id == 1 && $notify) {
                        $paramData = array();
                        foreach ($config as $key => $value) {
                            if ($key != "url") {
                                $value = removeEmojiChar($value);
                                $value = cn_substrR($value, 30);
                                $value = mb_substr($value, 0, 30);
                                $value = strstr($value, 'http') ? '' : $value;
                                array_push($paramData, "\"$key\":\"$value\"");
                            }
                        }
                        $request->setTemplateParam("{" . join(",", $paramData) . "}");
                    }

                    //发起访问请求
                    $acsResponse = $acsClient->getAcsResponse($request);
                    $resp = objtoarr($acsResponse);
                    if ($resp['Code'] == "OK") {
                        $return = "ok";
                    } else {

                        require_once HUONIAOROOT."/api/payment/log.php";
                        $_smsLog= new CLogFileHandler(HUONIAOROOT.'/log/sms/'.date('Y-m-d').'.log', true);
                        $_smsLog->DEBUG("短信发送错误日志");
                        $_smsLog->DEBUG("发送内容：" . json_encode(array("平台：" => "阿里云", "模板ID：" => $tempid, "发送号码：" => $phone_, "参数：" => $paramData, "签名：" => $signCode), JSON_UNESCAPED_UNICODE));
                        $_smsLog->DEBUG("错误返回：" . json_encode($resp, JSON_UNESCAPED_UNICODE) . "\r\n\r\n");

                        $return = "发送失败，" . $resp['Message'];
                    }

                    //阿里大于
                } elseif (strstr($portal, "大鱼") || strstr($portal, "大于")) {
                    $c = new TopClient();
                    $c->appkey = $username;
                    $c->secretKey = $password;
                    $req = new AlibabaAliqinFcSmsNumSendRequest();
                    $req->setSmsType("normal");
                    $req->setSmsFreeSignName($signCode);
                    //测试短信不需要传递变量
                    if (is_numeric($id) && $id == 1 && $notify) {
                        $paramData = array();
                        foreach ($config as $key => $value) {
                            if ($key != "url" && $key != "domain") {
                                $value = cn_substrR($value, 30);
                                array_push($paramData, $key . ":'" . $value . "'");
                            }
                        }
                        $req->setSmsParam("{" . join(",", $paramData) . "}");
                    } else {
                        $req->setSmsParam("{customer: '火鸟客服'}");
                    }


                    $req->setRecNum($phone_);
                    $req->setSmsTemplateCode($tempid);
                    $resp = objtoarr($c->execute($req));

                    if ($resp['result'] && $resp['result']['success']) {
                        $return = "ok";
                    } else {

                        require_once HUONIAOROOT."/api/payment/log.php";
                        $_smsLog= new CLogFileHandler(HUONIAOROOT.'/log/sms/'.date('Y-m-d').'.log', true);
                        $_smsLog->DEBUG("短信发送错误日志");
                        $_smsLog->DEBUG("发送内容：" . json_encode(array("平台：" => "阿里大于：", "模板ID：" => $tempid, "发送号码：" => $phone_, "参数：" => $paramData, "签名：" => $signCode), JSON_UNESCAPED_UNICODE));
                        $_smsLog->DEBUG("错误返回：" . json_encode($resp, JSON_UNESCAPED_UNICODE) . "\r\n\r\n");

                        $return = "发送失败，CODE[" . $resp['code'] . "]，MSG[" . $resp['msg'] . "], SUB_MSG[" . $resp['sub_msg'] . "]";
                    }
                }

            } else {
                $return = "短信模板ID未设置！";
            }

        } else {
            $return = "发送失败，短信平台未配置！";
        }



    } elseif($cfg_smsAlidayu == 2){//腾讯云短信
//      $phone_ = substr($phone, -11);
//      //获取区号
//      $areaCode = substr($phone, 0,-11);
//      $areaCode = !empty($areaCode) ? $areaCode : '86';

        if($areaCode == 86) {
            $phone_  = substr($phone, -11);
        }else{
            $phone_ = $areaCode ? substr($phone, strlen($areaCode)) : $phone;
        }

        include_once HUONIAOINC . '/class/sms/tencent/SmsSingleSender.php';

        $archives = $dsql->SetQuery("SELECT * FROM `#@__sitesms` WHERE `state` = 1");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $data = $results[0];
            $username = $data['username'];
            $password = $data['password'];
            $signCode = $data['signCode'];
            // 短信应用SDK AppID
            $appid ="$username";
            // 短信应用SDK AppKey
            $appkey = "$password";
            // 短信模板ID
            $templateId = $tempid;
            // 签名
            $smsSign = "$signCode";

            $ssender = new SmsSingleSender($appid, $appkey);
            //获取通知模板
            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_notify` WHERE `title` = '$notify' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                //短信模板
                $data=$ret[0];
                if ($data['sms_state']) {
                    $tencentContent = $data['sms_body'];
                }
            }
            $paramData = array();
            foreach($config as $key => $value){
                if(strpos($tencentContent,$key)){
                    $value = removeEmojiChar($value);
                    $value = cn_substrR($value, 30);
                    array_push($paramData, $value);
                }
            }

            /**
             * 腾讯云
             * 1、send 方法要把模板写死才能用 用sendWithParam这个方法
             * 2、$paramData 模板参数与传参数量对应才可以。
             */
            $result = $ssender->sendWithParam($areaCode, $phone_, $templateId,$paramData, $smsSign, "", "");
            $rsp = json_decode($result);
            $resp = objtoarr($rsp);
            if($resp['result']==0){
                $return = "ok";
            }else{

                require_once HUONIAOROOT."/api/payment/log.php";
                $_smsLog= new CLogFileHandler(HUONIAOROOT.'/log/sms/'.date('Y-m-d').'.log', true);
                $_smsLog->DEBUG("短信发送错误日志");
                $_smsLog->DEBUG("发送内容：" . json_encode(array("平台：" => "腾讯云", "区号：" => $areaCode, "发送号码：" => $phone_, "模板ID：" => $templateId, "参数：" => $paramData, "签名：" => $smsSign), JSON_UNESCAPED_UNICODE));
                $_smsLog->DEBUG("错误返回：" . json_encode($resp, JSON_UNESCAPED_UNICODE) . "\r\n\r\n");

                $return = "发送失败：" . $resp['errmsg'];
            }
        }else{
            $return = "发送失败，短信平台未配置！";
        }

        //其他普通短信平台
    } else {
        include_once(HUONIAOINC . '/class/sms.class.php');
        $sms = new sms($dbo);
        $return = $sms->send($phone, $content);
    }

    if ($return == "ok") {
        if ($has) {
            $archives = $dsql->SetQuery("UPDATE `#@__site_messagelog` SET `code` = '$code', `body` = '$content', `pubdate` = '$now', `ip` = '$ip' WHERE `type` = 'phone' AND `lei` = '$type' AND `user` = '$phone'");
            $results = $dsql->dsqlOper($archives, "update");
        } else {
            messageLog("phone", $type, $phone, $title, $content, $uid, 0, $code, $tempid);
        }
        return "ok";

    } else {
        messageLog("phone", $type, $phone, $title, $content, $uid, 1, $code, $tempid, $return);
        return array("state" => 200, "info" => $return);
    }

}

/*
 * 记录信息发送日志
 * @param $type    string 信息类型
 * @param $lei     string 类别
 * @param $user    string 收件人
 * @param $title   string 主题
 * @param $body    string 信息内容
 * @param $by      int    操作人
 * @param $state   int    状态
 * @param $code    string 验证关键字
 */
function messageLog($type, $lei, $user, $title, $body, $by, $state, $code = "", $tempid = "", $reason = ''){
    global $dsql;
    $ip = GetIP();
    $body = addslashes($body);
    $archives = $dsql->SetQuery("INSERT INTO `#@__site_messagelog` (`type`, `lei`, `user`, `title`, `body`, `code`, `tempid`, `byid`, `state`, `pubdate`, `ip`, `reason`) VALUES ('$type', '$lei', '$user', '$title', '$body', '$code', '$tempid', $by, $state, '" . GetMkTime(time()) . "', '$ip', '$reason')");
    $result = $dsql->dsqlOper($archives, "update");
    if ($result != "ok") {
        //echo "信息发送日志记录失败！";
    }
}


/*
 * 获取邮件、短信发送内容
 * @param string $type 类型 sms: 短信  mail: 邮件
 * @param int $id   模板ID
 * @param array config 系统配置参数
 * @return string
 */
function getInfoTempContent($type, $notify, $config = array()){
    global $dsql;
    global $cfg_basehost;
    global $cfg_webname;
    global $cfg_shortname;
    global $siteCityName;
    global $cfg_attachment;
    global $cfg_weblogo;
    global $cfg_hotline;
    $time = date("Y-m-d H:i:s", GetMkTime(time()));

    if (empty($type) || empty($notify)) return "";

    $webname = str_replace('$city', $siteCityName, stripslashes($cfg_webname));
    $shortname = str_replace('$city', $siteCityName, stripslashes($cfg_shortname));

    $configArr = array(
        "basehost" => $cfg_basehost,
        "webname" => $webname,
        "shortname" => $shortname,
        "weblogo" => $cfg_attachment . $cfg_weblogo,
        "hotline" => $cfg_hotline,
        "time" => $time
    );

    if ($config) {

        if($config['times']){
            unset($configArr['time']);
        }

        foreach ($config as $key => $value) {
            $configArr[$key] = $value;
        }
    }

    $return = array();

    //获取通知模板
    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_notify` WHERE `title` = '$notify' AND `state` = 1 ORDER BY `id` DESC");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {

        $data = $ret[0];

        $title = "";
        $intitle = "";
        $content = "";

        //邮件模板
        if ($type == "mail" && $data['email_state']) {
            $title = $data['email_title'];
            $content = $data['email_body'];
        }

        //短信模板
        if ($type == "sms" && $data['sms_state']) {
            $title = $data['sms_tempid'];
            $intitle = $data['sms_intempid'];
            $content = $data['sms_body'];
        }

        //短信模板
        if ($type == "wechat" && $data['wechat_state']) {
            $title = $data['wechat_tempid'];
            $content = $data['wechat_body'];
        }

        //网页即时消息
        if ($type == "site" && $data['site_state']) {
            $title = $data['site_title'];
            // $content = $data['site_body'];
            $content = $data['wechat_body'] ? $data['wechat_body'] : $data['site_body'];  //新版需要具体内容，换成公众号的模板内容。by:gz 20190614
        }

        //APP推送
        if ($type == "app" && $data['app_state']) {
            $title = $data['app_title'];
            $content = $data['app_body'];
        }

        if ($title || $content) {
            foreach ($configArr as $key => $value) {

                if($key == 'fields') continue;

                if ($key == "username"){
                    $sql = $dsql->SetQuery("SELECT `nickname`, `realname` FROM `#@__member` WHERE `username` = '$value'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $value = $ret[0]['realname'] ? $ret[0]['realname'] : ($ret[0]['nickname'] ? $ret[0]['nickname'] : $value);
                    }
                }

                //短信对变量内容长度有限制
                $_value = $type == 'sms' ? cn_substrR($value, 30) : $value;

                //微信公众号对变量内容长度有限制，最多20个
                $_value = $type == 'wechat' ? cn_substrR($value, 20) : $value;

                if ($title) {
                    $title = str_replace("$" . $key, $_value, $title);
                }
                if ($content) {
                    $content = str_replace("$" . $key, $_value, $content);
                }
            }
        }

        //新版替换模板key值 by:gz 20190614
        if($type == "site" && $content && $configArr['fields']){
            $fields = $configArr['fields'];
            foreach ($fields as $key => $value) {
                $content = str_replace($key, $value, $content);
            }
        }

        //自动将微信模板消息变量数组替换到内容模板中，并剔除多余的变量
        if($type == "site" && $content && $data['wechat_rule'] != null){
            //解析内容模板成数组
            $contentArr = json_decode($content, true);
            //解析出微信模板消息变量数组
            $wechatRules = json_decode($data['wechat_rule'], true);
            if ($contentArr != null && is_array($contentArr) && $wechatRules != null && is_array($wechatRules)) {
                //微信模板消息变量类型列表
                $wechatTypes = array('thing','character_string','time','amount','phone_number','car_number','const');

                //判断关键字是不是属于模板的变量类型，不是就删除掉对应的内容，是就依次替换对应的消息模板变量名称
                foreach ($contentArr as $key => $value) {
                    $isType = 0;
                    foreach ($wechatTypes as $v) {
                        if ($isType == 0 && strpos($key, $v) !== false) {
                            $isType = 1;
                            break;
                        }
                    }

                    //不属于就删除对应的内容
                    if ($isType == 0) {
                        unset($contentArr[$key]);
                    }
                }

                //如果还剩下的内容数组和微信模板消息变量数组的长度一致，则进行依次替换
                if (count($contentArr) == count($wechatRules)) {
                    //内容数组插入first和remark两个元素，以便列表页能够解析
                    $newArr = array();
                    $newArr['first'] = array('value' => $title);
                    foreach ($contentArr as $value) {
                        //每次取出微信模板消息变量数组的第一个元素，依次替换对应的关键字
                        $ruleText = array_shift($wechatRules);
                        $newArr[$ruleText] = $value;
                    }
                    $newArr['remark'] = array('value' => $title);

                    if ($newArr != null) {
                        $content = json_encode($newArr,JSON_UNESCAPED_UNICODE);
                    }
                }
            }
        }

        if($config['status']) {
            $content = str_replace("后台查看", $config['status'] . '", "color": "#44b549', $content);
        }

        return array("title" => $title, "intitle" => $intitle, "content" => $content);

    } else {
        return array("title" => "", "content" => "");
    }

}


/*
 * 载入脚本、样式
 * @param $type   string 文件类型
 * @param $file   array  文件列表
 */
function includeFile($type, $file = array()){
    global $cfg_attachment;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cfg_staticVersion;
    global $cfg_lang_dir;
    $v = $cfg_staticVersion;
    if(HUONIAOBUG){
        $v = time();
    }
    $f = !empty($file) ? '&f=' . join(",", $file) : "";
    if ($type == 'css') {
        $fileArr = array();
        $fileArr[] = "<link rel='stylesheet' type='text/css' href='" . $cfg_secureAccess . $cfg_basehost . "/static/css/admin/datetimepicker.css?v=$v' />";
        $fileArr[] = "<link rel='stylesheet' type='text/css' href='" . $cfg_secureAccess . $cfg_basehost . "/static/css/admin/common.css?v=$v' />";
        $fileArr[] = "<link rel='stylesheet' type='text/css' href='" . $cfg_secureAccess . $cfg_basehost . "/static/css/admin/bootstrap.css?v=$v' />";
        foreach ($file as $key => $value) {
            $fileArr[] = "<link rel='stylesheet' type='text/css' href='" . $cfg_secureAccess . $cfg_basehost . "/static/css/" . $value . "?v=$v'/>";
        }

        $huoniaoOfficial = '';
        if(!testPurview("huoniaoOfficial")){
            $huoniaoOfficial = "\r\n<style>.alert.alert-success, .huoniaoOfficial {display: none!important;} a[href^='https://help.kumanyun.com'] {display: none!important;}</style>";
        }

        return join("\r\n", $fileArr) . "\r\n" . $huoniaoOfficial . "\r\n<script>var cfg_attachment = '" . $cfg_attachment . "';</script>";
        //return "<link rel='stylesheet' type='text/css' href='".$hs."' />\r\n<script>var cfg_attachment = '".$cfg_attachment."';</script>";
    } elseif ($type == 'js') {
        $fileArr = array();
        // $fileArr[] = "<script>document.domain = '".$cfg_basehost."';</script>";
        $fileArr[] = "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/include/lang/".$cfg_lang_dir.".js?v=".$v."'></script>";
        $fileArr[] = "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/static/js/core/jquery-1.8.3.min.js?v=$v'></script>";
        $fileArr[] = "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/static/js/admin/common.js?v=$v'></script>";
        $fileArr[] = "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/static/js/ui/jquery.dialog-4.2.0.js?v=$v'></script>";
        foreach ($file as $key => $value) {
            $fileArr[] = "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/static/js/" . $value . "?v=$v'></script>";
        }
        return join("\r\n", $fileArr);

        //return "<script type='text/javascript' src='".$hs."'></script>";
    } elseif ($type == 'editor') {
        return "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/include/ueditor/ueditor.config.js?v=".$v."'></script>\r\n<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/include/ueditor/ueditor.all.js?v=".$v."'></script><script type='text/javascript' src='/include/ueditor/mp.weixin.js?v=".$v."'></script><script type='text/javascript' src='/include/ueditor/135editor.js?v=".$v."'></script>";
        //return '<script type="text/javascript" src="../../include/include.inc.php?t=include&f=ueditor/ueditor.config.js,ueditor/ueditor.all.js"></script>  <!-- editor -->';
    } elseif ($type == 'editorFile_adminInfo') {
        return "<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/include/ueditor/ueditor.config.js?v=".$v."'></script>\r\n<script type='text/javascript' src='" . $cfg_secureAccess . $cfg_basehost . "/include/ueditor/ueditor.all.js?v=".$v."'></script>";
        //return '<script type="text/javascript" src="../../include/include.inc.php?t=include&f=ueditor/ueditor.config.js,ueditor/ueditor.all.js"></script>  <!-- editor -->';
    }
}

/**
 *  清除指定后缀的模板缓存或编译文件
 *
 * @access  public
 * @param  bool $is_cache 是否清除缓存还是清出编译文件
 * @param  string $ext 模块名
 *
 * @return int        返回清除的文件个数
 */
function clear_tpl_files($is_cache = true, $admin = false, $ext = ''){
    $dirs = array();

    if ($is_cache) {
        $dirs[] = HUONIAOROOT . "/templates_c/caches/";
    } else {
        if ($admin) {
            $dirs[] = HUONIAOROOT . "/templates_c/admin/";
        }
        $dirs[] = HUONIAOROOT . "/templates_c/compiled/";
    }

    $str_len = strlen($ext);
    $count = 0;

    foreach ($dirs AS $dir) {
        $folder = @opendir($dir);

        if ($folder === false) {
            continue;
        }

        while ($file = @readdir($folder)) {

            if ($file == '.' || $file == '..' || $file == 'index.htm' || $file == 'index.html') {
                continue;
            }

            if ($file == $ext) {
                deldir($dir . $file);
                $count++;
            }

        }
        @closedir($folder);
    }

    return $count;
}

/**
 * 清除模版编译文件
 *
 * @access  public
 * @param   mix $ext 模块名
 * @return  void
 */
function clear_compiled_files($ext = '', $admin = false){
    return clear_tpl_files(false, $admin, $ext);
}

/**
 * 清除模板缓存文件
 *
 * @access  public
 * @param   mix $ext 模块名
 * @return  void
 */
function clear_cache_files($ext = '', $admin = false){
    return clear_tpl_files(true, $admin, $ext);
}

/**
 * 清除模版编译和缓存文件
 *
 * @access  public
 * @param   mix $ext 模块名
 * @return  void
 */
function clear_all_files($ext = '', $admin = false){
    return clear_tpl_files(false, $admin, $ext) + clear_tpl_files(true, $admin, $ext);
}

//换行格式化
function RpLine($str){
    $str = str_replace("\r", "\\r", $str);
    $str = str_replace("\n", "\\n", $str);
    return $str;
}

/**
 * 域名操作
 *
 * @param string $opera 操作类型  check: 检测是否可用, update: 更新/新增
 * @param string $domain 域名
 * @param string $module 模块
 * @param string $part 栏目
 * @param int $id 信息ID域名
 * @param int $expires 过期时间
 * @param string $note 过期提示
 * @return void
 */
function operaDomain($opera, $domain, $module, $part, $id = 0, $expires = 0, $note = "", $state = 0, $refund = ""){

    if (!empty($domain) && !empty($module) && !empty($part)) {
        global $cfg_basehost;
        global $dsql;
        global $cfg_holdsubdomain;
        global $HN_memory;

        $expires = !empty($expires) ? $expires : 0;

        $domain = strtolower($domain);

        if ($cfg_basehost == $domain) die('{"state": 200, "info": ' . json_encode("设置的域名与系统网站域名冲突，请重新输入！") . '}');

        $hold = explode("|", $cfg_holdsubdomain);
        if (in_array($domain, $hold)) die('{"state": 200, "info": ' . json_encode("设置的域名属于系统保留域名，请重新输入！") . '}');

        if (!preg_match("/^([0-9a-z][0-9a-z-.]{0,49})?[0-9a-z]$/", $domain)) {
            die('{"state": 2001, "info": ' . json_encode("域名：【".$domain."】不符合域名规则，请重新输入！<br /><br />提示：<br />1. 域名可由英文字母（不区分大小写）、数字、\"-\"构成；<br />2. 不能使用空格及特殊字符（如!、$、&、?等）；<br />3. \"-\"不能单独填写，不能放在开头或结尾。") . '}');
        }

        //检查是否可用
        if ($opera == "check") {

            $archives = $dsql->SetQuery("SELECT `module`, `part`, `iid` FROM `#@__domain` WHERE `domain` = '$domain'");
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                if ($results[0]['iid'] == $id && $results[0]['module'] == $module && $results[0]['part'] == $part) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
            die;


            //更新/新增
        } elseif ($opera == "update") {

            $where = "";
            if (!empty($id)) {
                $where = " AND `iid` = " . $id;
            }

            //先检查数据库是否存在
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__domain` WHERE `module` = '$module' AND `part` = '$part'" . $where);
            $results = $dsql->dsqlOper($archives, "results");
            //存在
            if ($results) {

                //更新数据库
                $archives = $dsql->SetQuery("UPDATE `#@__domain` SET `domain` = '$domain', `expires` = '$expires', `note` = '$note', `state` = '$state', `refund` = '$refund' WHERE `module` = '$module' AND `part` = '$part' AND `iid` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");
                if ($results == 'ok') {

                    //更新缓存
                    $HN_memory->set('domain_' . $module . '_' . $part . ($id ? '_' . $id : ''), array(
                        "domain" => $domain,
                        "expires" => $expires,
                        "note" => $note,
                        "state" => $state,
                        "refund" => $refund
                    ));

                    return true;
                } else {
                    die('{"state": 200, "info": ' . json_encode("系统错误，域名操作失败！") . '}');
                }

                //不存在
            } else {

                //新增
                $archives = $dsql->SetQuery("INSERT INTO `#@__domain` (`domain`, `module`, `part`, `iid`, `expires`, `note`, `state`, `refund`) VALUES ('$domain', '$module', '$part', '$id', '$expires', '$note', '$state', '$refund')");
                $results = $dsql->dsqlOper($archives, "lastid");
                if(is_numeric($results)){

                    //更新缓存
                    $HN_memory->set('domain_' . $module . '_' . $part . ($id ? '_' . $id : ''), array(
                        "domain" => $domain,
                        "expires" => $expires,
                        "note" => $note,
                        "state" => $state,
                        "refund" => $refund
                    ));

                    return true;
                } else {
                    die('{"state": 200, "info": ' . json_encode("系统错误，域名操作失败！") . '}');
                }

            }

        }

    } else {
        return false;
    }

}

/**
 * 获取指定模块的域名
 * @param string $module 模块
 * @param string $part 栏目
 * @param int $id 信息ID
 * @return array
 **/
function getDomain($module, $part, $id = 0){

    global $HN_memory;
    global $_G;

    if (!empty($module) && !empty($part)) {
        global $dsql;

        $where = "";
        if (!empty($id)) {
            $where = " AND `iid` = " . $id;
        }

        //读缓存
        $key = "domain_" . $module . "_" . $part . ($id ? "_" . $id : "");
        if(isset($_G[$key])){
            return $_G[$key];
        }
        $domain_cache = $HN_memory->get($key);
        if($domain_cache){
            return $domain_cache;
        }else {
            $archives = $dsql->SetQuery("SELECT `domain`, `expires`, `note`, `state`, `refund` FROM `#@__domain` WHERE `module` = '$module' AND `part` = '$part'" . $where);
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {

                //写缓存
                $HN_memory->set($key, $results[0]);
                $_G[$key] = $results[0];
                return $results[0];
            } else {
                $_G[$key] = array("domain" => "", "expires" => "", "note" => "");
                return $_G[$key];
            }
        }

    }

}

/**
 * 检测用户名是否可注册
 * @param string $username
 * @return string
 **/
function checkMember($username){
    global $cfg_holduser;
    global $langData;
    $hold = explode("|", $cfg_holduser);
    if (in_array($username, $hold)) die('{"state": 200, "info": ' . json_encode($langData['siteConfig'][33][52]) . '}');//该用户名归系统保留，请重新输入！

    $dsql = new dsql($dbo);
    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$username' OR `email` = '$username' OR `phone` = '$username'");
    $results = $dsql->dsqlOper($archives, "results");
    if ($results) {
        return false;
    } else {
        return true;
    }
}

/**
 * 远程抓取
 * @param $uri
 * @param $config
 */
function getRemoteImage($uri, $config, $type, $dirname, $smallImg = false, $stream = false, $fileType_ = ''){

    global $customFtp;
    global $custom_ftpState;
    global $custom_ftpDir;
    global $custom_ftpServer;
    global $custom_ftpPort;
    global $custom_ftpUser;
    global $custom_ftpPwd;
    global $custom_ftpUrl;
    global $custom_ftpTimeout;
    global $custom_ftpSSL;
    global $custom_ftpPasv;
    global $custom_OSSBucket;
    global $custom_EndPoint;
    global $custom_OSSKeyID;
    global $custom_OSSKeySecret;
    global $custom_QINIUAccessKey;
    global $custom_QINIUSecretKey;
    global $custom_QINIUbucket;
    global $cfg_OSSBucket;
    global $cfg_EndPoint;
    global $cfg_OSSKeyID;
    global $cfg_OSSKeySecret;
    global $cfg_QINIUAccessKey;
    global $cfg_QINIUSecretKey;
    global $cfg_QINIUbucket;
    global $cfg_QINIUdomain;
    global $cfg_OBSBucket;
    global $cfg_OBSEndpoint;
    global $cfg_OBSKeyID;
    global $cfg_OBSKeySecret;
    global $custom_OBSBucket;
    global $custom_OBSEndpoint;
    global $custom_OBSKeyID;
    global $custom_OBSKeySecret;
    global $cfg_COSBucket;
    global $cfg_COSRegion;
    global $cfg_COSSecretid;
    global $cfg_COSSecretkey;
    global $custom_COSBucket;
    global $custom_COSRegion;
    global $custom_COSSecretid;
    global $custom_COSSecretkey;

    if ($type != "siteConfig" && $customFtp == 0) {
        $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
        $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
        $custom_QINIUbucket = $cfg_QINIUbucket;

        $custom_OBSBucket = $cfg_OBSBucket;
        $custom_OBSEndpoint = $cfg_OBSEndpoint;
        $custom_OBSKeyID = $cfg_OBSKeyID;
        $custom_OBSKeySecret = $cfg_OBSKeySecret;

        $custom_COSBucket = $cfg_COSBucket;
        $custom_COSRegion = $cfg_COSRegion;
        $custom_COSSecretid = $cfg_COSSecretid;
        $custom_COSSecretkey = $cfg_COSSecretkey;
    }

    global $editor_uploadDir;
    global $editor_ftpState;
    global $editor_ftpDir;
    global $editor_ftpType;

    global $autoload;
    $autoload = false;

    $editor_uploadDir_ = $editor_uploadDir;

    if ($smallImg) {
        global $cfg_photoSmallWidth;
        global $cfg_photoSmallHeight;
        global $cfg_photoMiddleWidth;
        global $cfg_photoMiddleHeight;
        global $cfg_photoLargeWidth;
        global $cfg_photoLargeHeight;
        global $cfg_photoCutType;
        global $cfg_photoCutPostion;
        global $cfg_quality;
    }

    //忽略抓取时间限制
    set_time_limit($fileType_ == 'mp4' ? 0 : 10);
    //ue_separate_ue  ue用于传递数据分割符号
    //$imgUrls = explode("ue_separate_ue", $uri);
    $tmpNames = array();
    foreach ($uri as $imgUrl) {

        if(!$stream) {
            $imgUrl = htmlspecialchars($imgUrl);
            $imgUrl = str_replace("&amp;", "&", $imgUrl);

            //http开头验证
            if (strpos($imgUrl, "http") !== 0) {
                //ERROR_HTTP_LINK";
                array_push($tmpNames, array(
                    "url" => $imgUrl
                ));
                continue;
            }

            preg_match('/(^https*:\/\/[^:\/]+)/', $imgUrl, $matches);
            $host_with_protocol = count($matches) > 1 ? $matches[1] : '';

            //判断是否是合法 url
            if (!filter_var($host_with_protocol, FILTER_VALIDATE_URL)) {
                //INVALID_URL;
                array_push($tmpNames, array(
                    "url" => $imgUrl
                ));
                continue;
            }

            preg_match('/^https*:\/\/(.+)/', $host_with_protocol, $matches);
            $host_without_protocol = count($matches) > 1 ? $matches[1] : '';

            // 此时提取出来的可能是 ip 也有可能是域名，先获取 ip
            $ip = gethostbyname($host_without_protocol);
            // 判断是否是私有 ip
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE)) {
                //INVALID_IP;
                array_push($tmpNames, array(
                    "url" => $imgUrl
                ));
                continue;
            }

            //获取请求头并检测死链
            // $heads = @get_headers($imgUrl, 1);
            // if (!(stristr($heads[0], "200") && stristr($heads[0], "OK"))) {
            //   //ERROR_DEAD_LINK;
            //   array_push($tmpNames, array(
            //     "url" => $imgUrl
            //   ));
            //   continue;
            // }

            //格式验证(扩展名验证和Content-Type验证)
            // 显示此段将会影响微信头像的抓取，因为微信头像没有后缀，by: guozi 20170505
            $fileType = $fileType_ ? $fileType_ : str_replace(".", "", strtolower(strrchr($imgUrl, '.')));
            $fileType = (empty($fileType) || strlen($fileType) > 4) ? (strstr($fileType, 'wx_fmt=svg') ? "svg" : "png") : $fileType;
            // if (!in_array($fileType, $config['allowFiles']) || !isset($heads['Content-Type']) || !stristr($heads['Content-Type'], "image")) {
            //   //ERROR_HTTP_CONTENTTYPE;
            //   array_push($tmpNames, array(
            //     "url" => $imgUrl
            //   ));
            //   continue;
            // }

            //读取文件内容
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $imgUrl);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, $fileType_ == 'mp4' ? 120 : 5);
            $img = curl_exec($curl);
            curl_close($curl);


            //大小验证
            $uriSize = strlen($img); //得到图片大小
            $allowSize = 1024 * $config['maxSize'];
            if ($uriSize > $allowSize) {
                array_push($tmpNames, array(
                    "url" => $imgUrl
                ));
                continue;
            }

            //文件流形式，用于小程序码
        }else{
            $img = $imgUrl;
            $fileType = $fileType_ ? $fileType_ : 'png';
            $uriSize = strlen($img);
        }

        //创建保存位置
        $savePath = $config['savePath'];

        if (!file_exists($savePath)) {
            if (!mkdir("$savePath", 0777, true)) {
                continue;
            };
        }
        //写入文件
        $filename = $config['fileName'] ? $config['fileName'] : rand(1, 10000) . time() . '.' . $fileType;
        $tmpName = $savePath . $filename;
        try {

            if($stream == 2){
                $tmpName = $config['savePath'] . basename($img);
            }else{
                $fp2 = @fopen($tmpName, "a");
                @fwrite($fp2, $img);
                @fclose($fp2);
            }


            //图片文件，获取尺寸
            $picWidth = $picHeight = 0;
            $_fileType = explode('.', basename($img));
            $_fileType = $_fileType[1];
            if (in_array($_fileType, array('png','jpg','gif','jpeg')) || in_array($fileType, array('png','jpg','gif','jpeg'))) {
                $imgSize = @getimagesize($tmpName);
                $picWidth = (int)$imgSize[0];
                $picHeight = (int)$imgSize[1];
            }

            //音视频时长
            $duration = 0;

            //视频文件，
            $poster = '';  //视频封面
            $pushRemote = true;  //是否需要上传到远程，这里用于视频转码场景
            
            global $cfg_ffmpeg;
            $cfg_ffmpeg = (int)$cfg_ffmpeg;  //是否启用ffmpeg
            if($fileType == 'mp4' && isset($config['video'])){

                $poster = $config['video']['poster'];  //视频封面
                $picWidth = $config['video']['width'];  //视频宽度
                $picHeight = $config['video']['height'];  //视频高度
                $duration = $config['video']['duration'];  //视频时长

                //视频压缩
                global $cfg_videoCompress;
                $isVideoCompress = is_null($cfg_videoCompress) ? true : (int)$cfg_videoCompress;
                if($isVideoCompress){
                    $pushRemote = false;  //如果需要压缩，则不需要直接传到远程
                }
            }

            $fileMd5 = md5_file($tmpName);

            //对amr格式的音频文件进行转码
            global $cfg_ffmpeg;
            $cfg_ffmpeg = (int)$cfg_ffmpeg;  //是否启用ffmpeg
            if($fileType == 'amr' && $cfg_ffmpeg){

                //windows需要将ffmpeg.exe文件复制到网站根目录一份，linux需要把ffmpeg文件复制一份到/usr/bin/目录
                $dir = strtoupper(substr(PHP_OS,0,3)) === 'WIN' ? HUONIAOROOT . '/' : '';

                $_newName = str_replace('amr', 'mp3', $tmpName);

                //转码
                $cmd = $dir . "ffmpeg -i ".$tmpName." ".$_newName." 2>&1";  //结尾加 2>&1 可以输出调试信息
                exec($cmd, $ret);

                //转码成功
                if(file_exists($_newName)){

                    //获取时长
                    if($ret && is_array($ret)){
                        foreach ($ret as $everyLine){
                            if(preg_match("/Duration: (.*?),(.*)/",$everyLine,$matches)){
                                $duration = $matches[1]; //00:07:37.60
                                $duration = strtotime($duration) - strtotime("00:00:00");
                            }
                            if($duration){
                                break;
                            }
                        }
                    }

                    //删除amr文件
                    unlinkFile($tmpName);
                    $tmpName = $_newName;  //使用新文件地址
                    $filename = str_replace('.amr', '.mp3', $filename);

                }

            }

            $filePath = str_replace($dirname . $editor_uploadDir_, "", $tmpName);

            //缩小图片
            if ($smallImg) {
                $remote = array();
                $imgInfo = array();

                //获取文件信息
                $imageInfo = @getimagesize($tmpName); // 获取文件大小
                $imgInfo["width"] = $imageInfo[0];   // 获取文件宽度
                $imgInfo["height"] = $imageInfo[1];  // 获取文件高度
                $imgInfo["type"] = $imageInfo[2];    // 获取文件类型
                $imgInfo["name"] = $filename;        // 获取文件名称

                $remote['imgInfo'] = $imgInfo;
                $remote['fullName'] = $tmpName;
                $remote['savePath'] = ".." . $editor_uploadDir_ . "/siteConfig/photo";

                $up = new upload("", null, false, true);
                $small = $up->smallImg($cfg_photoSmallWidth, $cfg_photoSmallHeight, "small", $cfg_quality, $remote);
                $middle = $up->smallImg($cfg_photoMiddleWidth, $cfg_photoMiddleHeight, "middle", $cfg_quality, $remote);
                $large = $up->smallImg($cfg_photoLargeWidth, $cfg_photoLargeHeight, "large", $cfg_quality, $remote);
            }

            //普通FTP模式
            if ($editor_ftpType == 0 && $editor_ftpState == 1 && !strstr($filePath, 'house/community') && $pushRemote) {
                $ftpConfig = array();
                if ($type != "siteConfig" && $customFtp == 1 && $custom_ftpState == 1) {
                    $ftpConfig = array(
                        "on" => $custom_ftpState, //是否开启
                        "host" => $custom_ftpServer, //FTP服务器地址
                        "port" => $custom_ftpPort, //FTP服务器端口
                        "username" => $custom_ftpUser, //FTP帐号
                        "password" => $custom_ftpPwd,  //FTP密码
                        "attachdir" => $custom_ftpDir,  //FTP上传目录
                        "attachurl" => $custom_ftpUrl,  //远程附件地址
                        "timeout" => $custom_ftpTimeout,  //FTP超时
                        "ssl" => $custom_ftpSSL,  //启用SSL连接
                        "pasv" => $custom_ftpPasv  //被动模式连接
                    );
                }

                require_once HUONIAOINC . '/class/ftp.class.php';
                $huoniao_ftp = new ftp($ftpConfig);
                $huoniao_ftp->connect();
                if ($huoniao_ftp->connectid) {
                    $huoniao_ftp->upload(HUONIAOROOT . $editor_uploadDir_ . $filePath, $editor_ftpDir . $filePath);

                    if ($smallImg) {
                        $middleFile = str_replace("large", "middle", $filePath);
                        $fileRootUrl = HUONIAOROOT . $editor_uploadDir_ . $middleFile;
                        $huoniao_ftp->upload($fileRootUrl, $editor_ftpDir . $middleFile);

                        $smallFile = str_replace("large", "small", $filePath);
                        $fileRootUrl = HUONIAOROOT . $editor_uploadDir_ . $smallFile;
                        $huoniao_ftp->upload($fileRootUrl, $editor_ftpDir . $smallFile);
                    }
                }

                //阿里云OSS
            } elseif ($editor_ftpType == 1 && !strstr($filePath, 'house/community') && $pushRemote) {

                $OSSConfig = array(
                    "bucketName" => $cfg_OSSBucket,
                    "endpoint" => $cfg_EndPoint,
                    "accessKey" => $cfg_OSSKeyID,
                    "accessSecret" => $cfg_OSSKeySecret
                );

                if ($type != "siteConfig") {
                    $OSSConfig = array(
                        "bucketName" => $custom_OSSBucket,
                        "endpoint" => $custom_EndPoint,
                        "accessKey" => $custom_OSSKeyID,
                        "accessSecret" => $custom_OSSKeySecret
                    );
                }

                $OSSConfig['object'] = $filePath;
                $OSSConfig['uploadFile'] = HUONIAOROOT . $editor_uploadDir_ . $filePath;
                $ret = putObjectByRawApis($OSSConfig);

                if ($smallImg) {
                    $middleFile = str_replace("large", "middle", $filePath);
                    $OSSConfig['object'] = $middleFile;
                    $OSSConfig['uploadFile'] = HUONIAOROOT . $editor_uploadDir_ . $middleFile;
                    $ret = putObjectByRawApis($OSSConfig);


                    $smallFile = str_replace("large", "small", $filePath);
                    $OSSConfig['object'] = $smallFile;
                    $OSSConfig['uploadFile'] = HUONIAOROOT . $editor_uploadDir_ . $smallFile;
                    $ret = putObjectByRawApis($OSSConfig);
                }

                //七牛云
            } elseif ($editor_ftpType == 2 && !strstr($filePath, 'house/community') && $pushRemote) {

                $accessKey = $cfg_QINIUAccessKey;
                $secretKey = $cfg_QINIUSecretKey;
                $bucket = $cfg_QINIUbucket;

                if ($type != "siteConfig") {
                    $accessKey = $custom_QINIUAccessKey;
                    $secretKey = $custom_QINIUSecretKey;
                    $bucket = $custom_QINIUbucket;
                }

                $autoload = true;
                // 构建鉴权对象
                $auth = new Auth($accessKey, $secretKey);
                // 上传到七牛后保存的文件名
                $key = $filePath;
                // 生成上传 Token
                $token = $auth->uploadToken($bucket,$key);
                // 初始化 UploadManager 对象并进行文件的上传。
                $uploadMgr = new UploadManager();
                // 调用 UploadManager 的 putFile 方法进行文件的上传。
                $uploadMgr->putFile($token, $key, HUONIAOROOT . $editor_uploadDir_ . $filePath);

                if ($smallImg) {
                    $middleFile = str_replace("large", "middle", $filePath);
                    $token = $auth->uploadToken($bucket,$middleFile);
                    $uploadMgr->putFile($token, $middleFile, HUONIAOROOT . $editor_uploadDir_ . $middleFile);

                    $smallFile = str_replace("large", "small", $filePath);
                    $token = $auth->uploadToken($bucket,$smallFile);
                    $uploadMgr->putFile($token, $smallFile, HUONIAOROOT . $editor_uploadDir_ . $smallFile);
                }

                //华为云
            } elseif ($editor_ftpType == 3 && !strstr($filePath, 'house/community') && $pushRemote) {

                $ak = $cfg_OBSKeyID;
                $sk = $cfg_OBSKeySecret;
                $endpoint = $cfg_OBSEndpoint;
                $bucketName = $cfg_OBSBucket;

                if ($type != "siteConfig") {
                    $ak = $custom_OBSKeyID;
                    $sk = $custom_OBSKeySecret;
                    $endpoint = $custom_OBSEndpoint;
                    $bucketName = $custom_OBSBucket;
                }

                $autoload = true;
                $obsClient = ObsClient::factory([
                    'key' => $ak,
                    'secret' => $sk,
                    'endpoint' => $endpoint,
                    'socket_timeout' => 30,
                    'connect_timeout' => 10
                ]);

                try{

                    $objectKey = $filePath;
                    $sampleFilePath = HUONIAOROOT . $editor_uploadDir_ . $filePath;

                    //上传到的桶名，文件名
                    $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                    $uploadId = $resp['UploadId'];

                    //要上传的本地文件
                    createSampleFile($sampleFilePath);
                    $partSize = 5 * 1024 * 1024;
                    $fileLength = filesize($sampleFilePath);

                    $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                    $parts = [];
                    $promise = null;

                    for($i = 0; $i < $partCount; $i++){
                        $offset = $i * $partSize;
                        $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                        $partNumber = $i + 1;
                        $p = $obsClient->uploadPartAsync([
                            'Bucket' => $bucketName,
                            'Key' => $objectKey,
                            'UploadId' => $uploadId,
                            'PartNumber' => $partNumber,
                            'SourceFile' => $sampleFilePath,
                            'Offset' => $offset,
                            'PartSize' => $currPartSize
                        ], function($exception, $resp) use(&$parts, $partNumber) {
                            $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                        });

                        if($promise === null){
                            $promise = $p;
                        }
                    }

                    $promise -> wait();
                    usort($parts, function($a, $b){
                        if($a['PartNumber'] === $b['PartNumber']){
                            return 0;
                        }
                        return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                    });

                    $resp = $obsClient->completeMultipartUpload([
                        'Bucket' => $bucketName,
                        'Key' => $objectKey,
                        'UploadId' => $uploadId,
                        'Parts'=> $parts
                    ]);
                    unlinkFile($sampleFilePath);  //删除本地文件

                    if ($smallImg) {
                        $objectKey = $middleFile;
                        $sampleFilePath = HUONIAOROOT . $editor_uploadDir_ . $middleFile;

                        //上传到的桶名，文件名
                        $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                        $uploadId = $resp['UploadId'];

                        //要上传的本地文件
                        createSampleFile($sampleFilePath);
                        $partSize = 5 * 1024 * 1024;
                        $fileLength = filesize($sampleFilePath);

                        $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                        $parts = [];
                        $promise = null;

                        for($i = 0; $i < $partCount; $i++){
                            $offset = $i * $partSize;
                            $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                            $partNumber = $i + 1;
                            $p = $obsClient->uploadPartAsync([
                                'Bucket' => $bucketName,
                                'Key' => $objectKey,
                                'UploadId' => $uploadId,
                                'PartNumber' => $partNumber,
                                'SourceFile' => $sampleFilePath,
                                'Offset' => $offset,
                                'PartSize' => $currPartSize
                            ], function($exception, $resp) use(&$parts, $partNumber) {
                                $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                            });

                            if($promise === null){
                                $promise = $p;
                            }
                        }

                        $promise -> wait();
                        usort($parts, function($a, $b){
                            if($a['PartNumber'] === $b['PartNumber']){
                                return 0;
                            }
                            return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        });

                        $resp = $obsClient->completeMultipartUpload([
                            'Bucket' => $bucketName,
                            'Key' => $objectKey,
                            'UploadId' => $uploadId,
                            'Parts'=> $parts
                        ]);
                        unlinkFile($sampleFilePath);  //删除本地文件



                        $smallFile = str_replace("large", "small", $filePath);

                        $objectKey = $smallFile;
                        $sampleFilePath = HUONIAOROOT . $editor_uploadDir_ . $smallFile;

                        //上传到的桶名，文件名
                        $resp = $obsClient->initiateMultipartUpload(['Bucket' => $bucketName, 'Key' => $objectKey]);
                        $uploadId = $resp['UploadId'];

                        //要上传的本地文件
                        createSampleFile($sampleFilePath);
                        $partSize = 5 * 1024 * 1024;
                        $fileLength = filesize($sampleFilePath);

                        $partCount = $fileLength % $partSize === 0 ?  intval($fileLength / $partSize) : intval($fileLength / $partSize) + 1;
                        $parts = [];
                        $promise = null;

                        for($i = 0; $i < $partCount; $i++){
                            $offset = $i * $partSize;
                            $currPartSize = ($i + 1 === $partCount) ? $fileLength - $offset : $partSize;
                            $partNumber = $i + 1;
                            $p = $obsClient->uploadPartAsync([
                                'Bucket' => $bucketName,
                                'Key' => $objectKey,
                                'UploadId' => $uploadId,
                                'PartNumber' => $partNumber,
                                'SourceFile' => $sampleFilePath,
                                'Offset' => $offset,
                                'PartSize' => $currPartSize
                            ], function($exception, $resp) use(&$parts, $partNumber) {
                                $parts[] = ['PartNumber' => $partNumber, 'ETag' => $resp['ETag']];
                            });

                            if($promise === null){
                                $promise = $p;
                            }
                        }

                        $promise -> wait();
                        usort($parts, function($a, $b){
                            if($a['PartNumber'] === $b['PartNumber']){
                                return 0;
                            }
                            return $a['PartNumber'] > $b['PartNumber'] ? 1 : -1;
                        });

                        $resp = $obsClient->completeMultipartUpload([
                            'Bucket' => $bucketName,
                            'Key' => $objectKey,
                            'UploadId' => $uploadId,
                            'Parts'=> $parts
                        ]);
                        unlinkFile($sampleFilePath);  //删除本地文件
                    }

                } catch ( ObsException $e ) {
                    $error = '华为云接口上传失败，返回码：' . $e->getStatusCode() . '，错误码：' . $e->getExceptionCode() . '，错误信息：' . $e->getExceptionMessage();
                } finally{
                    $obsClient->close ();
                }

                //腾讯云
            } elseif ($editor_ftpType == 4 && !strstr($filePath, 'house/community') && $pushRemote) {

                $COSBucket = $cfg_COSBucket;
                $COSRegion = $cfg_COSRegion;
                $COSSecretid = $cfg_COSSecretid;
                $COSSecretkey = $cfg_COSSecretkey;

                if($type != 'siteConfig'){
                    $COSBucket = $custom_COSBucket;
                    $COSRegion = $custom_COSRegion;
                    $COSSecretid = $custom_COSSecretid;
                    $COSSecretkey = $custom_COSSecretkey;
                }

                $autoload = true;
                $cosClient = new Qcloud\Cos\Client(array(
                    'region' => $COSRegion,
                    'schema' => $cfg_httpSecureAccess ? 'https' : 'http', //协议头部，默认为http
                    'credentials'=> array(
                        'secretId'  => $COSSecretid,
                        'secretKey' => $COSSecretkey
                    )
                ));

                try {
                    $cosClient->upload(
                        $bucket = $COSBucket, //格式：BucketName-APPID
                        $key = $filePath,
                        $body = fopen(HUONIAOROOT . $editor_uploadDir_ . $filePath, 'rb')
                    );
                    unlinkFile(HUONIAOROOT . $editor_uploadDir_ . $filePath);  //删除本地文件

                    if ($smallImg) {
                        $middleFile = str_replace("large", "middle", $filePath);
                        $cosClient->upload(
                            $bucket = $COSBucket, //格式：BucketName-APPID
                            $key = $middleFile,
                            $body = fopen(HUONIAOROOT . $editor_uploadDir_ . $middleFile, 'rb')
                        );
                        unlinkFile(HUONIAOROOT . $editor_uploadDir_ . $middleFile);  //删除本地文件

                        $smallFile = str_replace("large", "small", $filePath);
                        $cosClient->upload(
                            $bucket = $COSBucket, //格式：BucketName-APPID
                            $key = $smallFile,
                            $body = fopen(HUONIAOROOT . $editor_uploadDir_ . $smallFile, 'rb')
                        );
                        unlinkFile(HUONIAOROOT . $editor_uploadDir_ . $smallFile);  //删除本地文件
                    }
                } catch (\Exception $e) {
                    // 请求失败
                    $error = $e;
                };

            }

            $dsql = new dsql($dbo);
            $userLogin = new userLogin($dbo);
            $userid = $userLogin->getMemberID();

            $fileLei = $fileType_ == 'amr' ? 'audio' : ($fileType_ == 'mp4' ? 'video' : 'image');
            $videoParse = $pushRemote ? 0 : 1;  //视频解码？如果解码，则记录到数据库中，通过定时计划解码上传到远程然后删除本地文件

            $name = substr(strrchr($filePath, "/"), 1);
            $attachment = $dsql->SetQuery("INSERT INTO `#@__attachment` (`userid`, `filename`, `filetype`, `filesize`, `name`, `path`, `pubdate`, `width`, `height`, `click`, `duration`, `md5`, `poster`, `videoParse`) VALUES ('$userid', '$filename', '$fileLei', '$uriSize', '$name', '$filePath', '" . GetMkTime(time()) . "', '$picWidth', '$picHeight', 0, '$duration', '$fileMd5', '$poster', '$videoParse')");
            $aid = $dsql->dsqlOper($attachment, "lastid");
            if (!is_numeric($aid)) die('{"state":"数据写入失败！"}');

            $RenrenCrypt = new RenrenCrypt();
            $fid = base64_encode($RenrenCrypt->php_encrypt($aid));


            global $cfg_basehost;
            global $cfg_attachment;
            $attachmentPath = str_replace("http://" . $cfg_basehost, "", str_replace("https://" . $cfg_basehost, "", $cfg_attachment));
            $path = $attachmentPath . $fid;

            array_push($tmpNames, array(
                "state" => "SUCCESS",
                "url" => $path,
                "turl" => getFilePath($fid),
                "fid" => $fid,
                "aid" => $aid,
                "size" => $uriSize,
                "path" => $editor_uploadDir_ . $filePath,
                "filePath" => $filePath,
                "filename" => $filename,
                "source" => $stream && $stream == 1 ? '小程序码' : htmlspecialchars($imgUrl)
            ));

        } catch (Exception $e) {
            array_push($tmpNames, array(
                "url" => $imgUrl
            ));
        }
    }

    $state = count($tmpNames) ? 'SUCCESS' : 'ERROR';

    $returnArr = json_encode(array(
        'state' => $state,
        'list' => $tmpNames
    ));

    return $returnArr;
}


//根据第三方云存储平台类型返回图片缩放参数
//因为阿里云不能使用0尺寸的数值，所以这里使用阿里云的最大值代替，前端使用时以此值来替换
function getRemoteImageResizeParam($platform, $file, $resize = true, $fid = 0){

    if(strstr($file, 'plugins') || strstr($file, 'editor')) return '';  //如果是插件转载的图片或者内容图片，不做缩放处理。

    searchAttachmentByFile($file, $fid);

    if($resize && $platform && $file && (strstr($file, ".jpg") || strstr($file, ".jpeg") || strstr($file, ".gif") || strstr($file, ".png") || strstr($file, ".bmp")) && !strstr($file, "?")){
        //阿里云
        if($platform == 1){
            return '?x-oss-process=image/resize,m_fill,w_4096,h_4096';

        //七牛云
        }elseif($platform == 2){
            return '?imageView2/2/interlace/1/q/90/w/4096/h/4096';

        //华为云
        }elseif($platform == 3){
            return '?x-image-process=image/resize,m_fill,w_4096,h_4096';

        //腾讯云
        }elseif($platform == 4){
            return '?imageMogr2/gravity/center/crop/4096x4096/interlace/1';
        }
    }
}


//对远程附件图片进行压缩，主要用于身份证信息读取时第三方接口对图片大小有要求的场景
//固定宽度最大1500像素，质量70%
function remoteImageCompressParam($url){

    if($url){

        $urlArr = explode('?', $url);  //获取图片地址，去除多余参数
        $imgUrl = $urlArr[0];

        //阿里云
        if(strstr($url, 'x-oss-process')){
            return $imgUrl . '?x-oss-process=image/resize,m_mfit,w_1500/quality,q_75';

        //七牛云
        }elseif(strstr($url, 'imageView2')){
            return $imgUrl . '?imageView2/2/interlace/1/q/75/w/1500';

        //华为云
        }elseif(strstr($url, 'x-image-process')){
            return $imgUrl . '?x-image-process=image/resize,w_1500/imageslim';

        //腾讯云
        }elseif(strstr($url, 'imageMogr2')){
            return $imgUrl . '?imageMogr2/gravity/thumbnail/1500x/interlace/1/quality/75'; 
        }

    }
    return $url;

}



/**
 * 获取附件的真实地址
 * @param string $file 文件ID
 * @return booblean $resize 是否需要裁剪
 */
function getRealFilePath($file, $resize = true, $local = true){

	$file = str_replace('||', '', $file);
	if(!strstr($file, '?')){
	    $file = str_replace('&type=', '?type=', $file);
	}

    //如果是多张图片，取第一张
    if(!strstr($file, 'http')){
        $fileArr = explode(',', $file);
        $file = $fileArr[0];
    }

    global $dsql;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cfg_fileUrl;
    global $cfg_uploadDir;
    global $editor_uploadDir;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpUrl;
    global $cfg_ftpDir;
    global $cfg_OSSUrl;
    global $cfg_QINIUdomain;
    global $cfg_OBSUrl;
    global $cfg_COSUrl;
    global $HN_memory;
    global $cfg_remoteFtpUnify;  //附件统一管理，开启后不需要再截取附件归属哪个模块，以及是否启用自定义远程附件，减轻服务器压力
    global $_G;

    $md5FileKey = "realFilePath_" . $file;
    if(isset($_G[$md5FileKey]) && $local){
        return $_G[$md5FileKey];
    }

    $memberCache = $HN_memory->get($md5FileKey);
    if($memberCache && $local){
        return $memberCache;
    }

    $cfg_uploadDir = str_replace('../', '', $cfg_uploadDir);

    if (strstr($file, "http") || strstr($file, "//")) {
        if(substr($file , 0 , 2) == '//'){
            $realPath = 'https:' . $file . getRemoteImageResizeParam($cfg_ftpType, $file, $resize);
            $_G[$md5FileKey] = $realPath;
            $HN_memory->set($md5FileKey, $realPath);
            return $realPath;
        }else{
            $realPath = $file . getRemoteImageResizeParam($cfg_ftpType, $file, $resize);
            $_G[$md5FileKey] = $realPath;
            $HN_memory->set($md5FileKey, $realPath);
            return $realPath;
        }
    }

    if (strstr($file, ".jpg") || strstr($file, ".jpeg") || strstr($file, ".gif") || strstr($file, ".png") || strstr($file, ".bmp") || strstr($file, ".mp4") || strstr($file, ".mov") || strstr($file, ".wav") || strstr($file, ".mp3") || strstr($file, ".wma") || strstr($file, ".amr")) {

        $_filetype = 0;
        $fileDomain = $cfg_secureAccess . $cfg_basehost . (strstr($file, $cfg_uploadDir) ? '' : $cfg_uploadDir);
        if(strstr($file, '/static/')){
            $_filetype = 1;
            $fileDomain = $cfg_secureAccess . $cfg_basehost;
            //本地文件存在，直接跳走
            if(file_exists(HUONIAOROOT . $file)){
                $realPath = $fileDomain . $file;
                $_G[$md5FileKey] = $realPath;
                $HN_memory->set($md5FileKey, $realPath);
                return $realPath;
            }
        }else if($cfg_ftpType == 0 && $cfg_ftpState == 1){
            $fileDomain = $cfg_ftpUrl . $cfg_ftpDir;
            $file = strstr($file, '/uploads') ? str_replace('/uploads', '', $file) : $file;
        }elseif($cfg_ftpType == 1){
            $fileDomain = (strstr($cfg_OSSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_OSSUrl;
            $file = strstr($file, '/uploads') ? str_replace('/uploads', '', $file) : $file;
        }elseif($cfg_ftpType == 2){
            $fileDomain = $cfg_QINIUdomain;
        }elseif($cfg_ftpType == 3){
            $fileDomain = (strstr($cfg_OBSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_OBSUrl;
            $file = strstr($file, '/uploads') ? str_replace('/uploads', '', $file) : $file;
        }elseif($cfg_ftpType == 4){
            $fileDomain = (strstr($cfg_COSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_COSUrl;
            $file = strstr($file, '/uploads') ? str_replace('/uploads', '', $file) : $file;
        }else{
            //验证本地文件是否存在
            $_filePath = (strstr($file, $cfg_uploadDir) ? '' : $cfg_uploadDir) . $file;
            if(file_exists(HUONIAOROOT . $_filePath)){
                searchAttachmentByFile($file);
                $realPath = $fileDomain . $file;
                $_G[$md5FileKey] = $realPath;
                $HN_memory->set($md5FileKey, $realPath);
                return $realPath;
            }
        }
        //非本地文件，直接跳走
        if(!$_filetype && $cfg_remoteFtpUnify){

            //先判断本地是否有这个文件
            $localFilePath = HUONIAOROOT .$cfg_uploadDir. $file;
            //由于有些图片在同步到远程时没有将本地文件删除干净（可能是权限的原因），导致有些图片是远程地址，有些是本地地址，所以这里暂时统一全用远程的，不验证本地文件了
            if(1 == 2){
            // if($local && file_exists($localFilePath)){
                $realPath = $cfg_secureAccess . $cfg_basehost . $cfg_uploadDir. $file;
                $_G[$md5FileKey] = $realPath;
                $HN_memory->set($md5FileKey, $realPath);
                return $realPath;
            }else{
                $realPath = $fileDomain . $file . getRemoteImageResizeParam($cfg_ftpType, $file, $resize);
                $_G[$md5FileKey] = $realPath;
                $HN_memory->set($md5FileKey, $realPath);
                return $realPath;
            }
            
        }
    }

    $RenrenCrypt = new RenrenCrypt();
    $fid = is_numeric($file) || strstr($file, '/') ? $file : $RenrenCrypt->php_decrypt(base64_decode($file));

    //如果不是数字类型，则直接返回字段内容，主要用于兼容数据导入
    if (!is_numeric($fid) && 1 == 2){
        if(file_exists(HUONIAOROOT . (strstr($file, $cfg_uploadDir) ? '' : $cfg_uploadDir) . $file)){
            searchAttachmentByFile($file);
            $realPath = $cfg_secureAccess . $cfg_basehost . (strstr($file, $cfg_uploadDir) ? '' : $cfg_uploadDir) . $file;
            $_G[$md5FileKey] = $realPath;
            $HN_memory->set($md5FileKey, $realPath);
            return $realPath;
        }
    }

    //读缓存
    // $attachmentCache = $HN_memory->get('attachment_' . $fid);
    // if($attachmentCache && is_numeric($fid)){
    //     $results = $attachmentCache;
    // }else {
        if(is_numeric($fid)){
            $archives = $dsql->SetQuery("SELECT `id`, `path` FROM `#@__attachment` WHERE `id` = $fid");
        }else{
            $file = addslashes(strip_tags(trim($file)));
            $archives = $dsql->SetQuery("SELECT `id`, `path` FROM `#@__attachment` WHERE `path` = '$file'");
        }
        $results = $dsql->dsqlOper($archives, "results");
    // }
    if ($results && is_array($results)) {

        //写入缓存
        // $HN_memory->set('attachment_' . $fid, $results);
        if($local && 1 == 2){
            $localFilePath = HUONIAOROOT .$cfg_uploadDir. $results[0]['path'];
            if(file_exists($localFilePath)){
                $realPath = $cfg_secureAccess . $cfg_basehost . $cfg_uploadDir. $results[0]['path'];
                $_G[$md5FileKey] = $realPath;
                $HN_memory->set($md5FileKey, $realPath);
                return $realPath;
            }
        }
        $path = str_replace('/uploads', '', $results[0]['path']);
        $module = explode("/", $path);
        $module = $module[1] == 'uploads' ? 'siteConfig' : $module[1];

        $_fid = $results[0]['id'];

        $incFile = HUONIAOINC . "/config/" . $module . ".inc.php";
        if (!file_exists($incFile)) return "";
        require $incFile;

        if (empty($editor_uploadDir) && $custom_uploadDir) {
            $editor_uploadDir = $custom_uploadDir;
        }else{
            $editor_uploadDir = $cfg_uploadDir;
        }

        //模块自定义配置
        if ($customFtp == 1) {

            //普通FTP模式
            if ($custom_ftpType == 0) {

                //启用远程FTP
                if ($custom_ftpState == 1) {
                    $site_fileUrl = $custom_ftpUrl . $custom_ftpDir;

                    //本地模式
                } else {
                    $site_fileUrl = $customUpload == 1 ? $cfg_secureAccess . $cfg_basehost . $custom_uploadDir : $cfg_secureAccess . $cfg_basehost . $editor_uploadDir;
                }

                //阿里云
            } elseif ($custom_ftpType == 1) {
                $site_fileUrl = (strstr($custom_OSSUrl, 'http') ? '' : $cfg_secureAccess) . $custom_OSSUrl;
            } elseif ($custom_ftpType == 2) {
                $site_fileUrl = (strstr($custom_QINIUdomain, 'http') ? '' : $cfg_secureAccess) . $custom_QINIUdomain;
                // $path=substr(str_replace('/','_',$path),1);
                //华为云
            } elseif ($custom_ftpType == 3) {
                $site_fileUrl = (strstr($custom_OBSUrl, 'http') ? '' : $cfg_secureAccess) . $custom_OBSUrl;
                //腾讯云
            } elseif ($custom_ftpType == 4) {
                $site_fileUrl = (strstr($custom_COSUrl, 'http') ? '' : $cfg_secureAccess) . $custom_COSUrl;
            }

            //系统默认
        } else {

            //普通FTP模式
            if ($cfg_ftpType == 0) {

                //启用远程FTP
                if ($cfg_ftpState == 1) {
                    $site_fileUrl = $cfg_ftpUrl . $cfg_ftpDir;

                    //本地模式
                } else {
                    $site_fileUrl = $cfg_secureAccess . $cfg_basehost . $editor_uploadDir;
                }

                //阿里云
            } elseif ($cfg_ftpType == 1) {
                $site_fileUrl = (strstr($cfg_OSSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_OSSUrl;

                //七牛云
            } elseif ($cfg_ftpType == 2) {
                $site_fileUrl = (strstr($cfg_QINIUdomain, 'http') ? '' : $cfg_secureAccess) . $cfg_QINIUdomain;
                if(strpos($path, "photo") !== false){
                    // $path=substr(str_replace('/','_',$path),1);
                }

                //华为云
            } elseif ($cfg_ftpType == 3) {
                $site_fileUrl = (strstr($cfg_OBSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_OBSUrl;

                //腾讯云
            } elseif ($cfg_ftpType == 4) {
                $site_fileUrl = (strstr($cfg_COSUrl, 'http') ? '' : $cfg_secureAccess) . $cfg_COSUrl;
            }

        }

        $realPath = $site_fileUrl . $path . getRemoteImageResizeParam($customFtp == 1 ? $custom_ftpType : $cfg_ftpType, $path, $resize, $_fid);
        $_G[$md5FileKey] = $realPath;
        $HN_memory->set($md5FileKey, $realPath);
        return $realPath;

    } else {
        return "";
    }

}


//根据文件地址信息查询附件表，并增加浏览次数
function searchAttachmentByFile($file, $fid = 0){

    global $dsql;
    global $updateAttachmentClickSql;
    global $cfg_record_attachment_count;  //是否记录附件使用次数  0开启  1关闭

    if($cfg_record_attachment_count) return;

    $updateAttachmentClickSql = !is_array($updateAttachmentClickSql) ? array() : $updateAttachmentClickSql;

    //用于需要记录附件访问次数的条件：
    //1. 通过/index.php文件伪静态访问的页面
    //2. 通过/include/ajax.php接口文件请求的数据
    //3. 通过/include/json.php请求的数据
    //4. 通过/include/attachment.php请求
    //5. 通过/include/360panorama.php请求
    //6. 通过/wmsj访问的页面

    //如果有其他方式，后期在这里完善
    global $singlePageTemplate;  //有这个值说明是通过首页伪静态规则进行访问

    //获取访问详情  兼容win
    $_reqUri = $_SERVER["HTTP_X_REWRITE_URL"];
    if($_reqUri == null){
        $_reqUri = $_SERVER["HTTP_X_ORIGINAL_URL"];
        if($_reqUri == null){
            $_reqUri = $_SERVER["REQUEST_URI"];
        }
    }

    $needAddCount = 0;
    if(
        (
            $singlePageTemplate || 
            strstr($_SERVER['PHP_SELF'], '/index.php') || 
            strstr($_SERVER['PHP_SELF'], '/include/ajax.php') || 
            strstr($_SERVER['PHP_SELF'], '/include/json.php') || 
            strstr($_SERVER['PHP_SELF'], '/include/attachment.php') || 
            strstr($_SERVER['PHP_SELF'], '/include/360panorama.php') || 
            strstr($_SERVER['PHP_SELF'], '/wmsj')
        )
    ){
        $needAddCount = 1;
    }
    

    //符合条件的进行更新
    if($needAddCount){

        //如果已经确定了文件ID，直接更新浏览次数
        if(is_numeric($fid) && $fid){

            // $sql = $dsql->SetQuery("UPDATE `#@__attachment` SET `click` = `click` + 1 WHERE `id` = $fid");
            // $dsql->dsqlOper($sql, "update");

            array_push($updateAttachmentClickSql, $fid);
        }
        else{
            
            //获取文件名
            $_fileArr = parse_url($file);
            $_filePath = $_fileArr['path'] == '/hn_upload.php' ? $_fileArr['query'] : $_fileArr['path'];
            $fileName = substr(strrchr($_filePath, "/"), 1);

            if($fileName){

                //根据文件名查询表并更新浏览次数
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__attachment` WHERE `name` = '$fileName' ORDER BY `id` DESC LIMIT 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $fid = (int)$ret[0]['id'];
                    // $sql = $dsql->SetQuery("UPDATE `#@__attachment` SET `click` = `click` + 1 WHERE `id` = '$fid'");
                    // $dsql->dsqlOper($sql, "update");
                    if($fid){
                        array_push($updateAttachmentClickSql, $fid);
                    }
                    
                }
            }

        }
    }

}


//统一更新附件浏览次数
function updateAttachmentClickSql(){
    global $dsql;
    global $updateAttachmentClickSql;
    global $cfg_record_attachment_count;  //是否记录附件使用次数  0开启  1关闭

    if($updateAttachmentClickSql && !$cfg_record_attachment_count){

        //先去重
        $updateAttachmentClickSql = array_unique($updateAttachmentClickSql);
        $updateAttachmentClickSql = array_values($updateAttachmentClickSql);

        $ids = join(",", $updateAttachmentClickSql);

        // require_once HUONIAOROOT."/api/payment/log.php";
        // $_attachmentLog= new CLogFileHandler(HUONIAOROOT.'/log/attachment/'.date('Y-m-d').'.log', true);
        // $_attachmentLog->DEBUG($ids);

        $sql = $dsql->SetQuery("UPDATE `#@__attachment` SET `click` = `click` + 1 WHERE `id` IN ($ids)");
        $dsql->dsqlOper($sql, "update");
        
    }
}



/**
 * 获取附件的真实地址
 * @param string $file 文件ID
 * @return booblean $resize 是否需要裁剪
 */
function getFilePath($file, $resize = true, $local = true){
    if (empty($file)) return "";
    // global $cfg_hideUrl;
    // if ($cfg_hideUrl == 1) {
    //     global $cfg_attachment;
    //     return $cfg_attachment . $file;
    // } elseif ($cfg_hideUrl == 0) {
        return getRealFilePath($file, $resize, $local);
    // }
}


/**
 * 获取附件不同尺寸
 * 此功能只适用于远程附件（非FTP模式）
 * @param string $url 文件地址
 * @param string $type 要转换的类型
 * @param int $width 宽度
 * @param int $height 高度
 * @return string *
 */
function changeFileSize($params){
    extract($params);
    if(empty($url)) return false;
    global $cfg_hideUrl;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpUrl;
    global $cfg_ftpDir;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cfg_OSSUrl;
    global $cfg_QINIUdomain;
    global $cfg_OBSUrl;
    global $cfg_uploadDir;

    //默认尺寸
    $width = $width ? $width : 800;
    $height = $height ? $height : 800;

    //小图尺寸
    if($type == 'small'){
        $width = 200;
        $height = 200;
    }

    //中图尺寸
    if($type == 'middle'){
        $width = 500;
        $height = 500;
    }

    //阿里云、华为云
    $url = str_replace("w_4096", "w_" . $width, $url);
    $url = str_replace("h_4096", "h_" . $height, $url);

    //七牛云
    $url = str_replace("w/4096", "w/" . $width, $url);
    $url = str_replace("h/4096", "h/" . $height, $url);

    //腾讯云
    $url = str_replace("4096x4096", $width."x".$height, $url);

    return $url;


    //以下功能弃用
    if($type == "small" || $type == "middle"){
        if(!strstr($url, "atlas") && !strstr($url, "photo") && !strstr($url, "thumb")){
            return $url;
        }
    }
    $localpath = $cfg_secureAccess . $cfg_basehost . $cfg_uploadDir;
    $urls = explode($localpath, $url);
    $url_ = $urls[1];

    if($url_){
        if(strstr($url, "http") || strstr($url, "//") || strstr($url_, "editor")){
            return $url;
        }
        //普通FTP模式
        if ($cfg_ftpType == 0) {

            //启用远程FTP
            if ($cfg_ftpState == 1) {
                $site_fileUrl = $cfg_ftpUrl . $cfg_ftpDir;

                //本地模式
            } else {
                $site_fileUrl = $cfg_secureAccess . $cfg_basehost . $cfg_uploadDir;
            }

            //阿里云
        } elseif ($cfg_ftpType == 1) {
            $site_fileUrl = "https://" . $cfg_OSSUrl;

            //七牛云
        } elseif ($cfg_ftpType == 2) {
            $site_fileUrl = "http://" . $cfg_QINIUdomain;
            // $url_='/'.substr(str_replace('/','_',$url_),1);

            //华为云
        } elseif ($cfg_ftpType == 3) {
            $site_fileUrl = "https://" . $cfg_OBSUrl;
        }

        if (empty($type)) return $site_fileUrl.$url_;

        if ($cfg_hideUrl == 1) {
            if($cfg_ftpType == 2){
                // $url_=substr(str_replace('/','_',$url_),1);
            }
            return $site_fileUrl.$url_ . "&type=" . $type;
        } else {
            $file = str_replace("large", $type, $url_);
            return $site_fileUrl.$file;
        }
    }else{
        if (empty($type)) return $url;

        // if ($cfg_hideUrl == 1) {
        //     if($cfg_ftpType == 2){
        //         // $url=substr(str_replace('/','_',$url),1);
        //     }
        //     return $url . "&type=" . $type;
        // } else {
        $file = str_replace("large", $type, $url);
        return $file;
        // }
    }
}


/**
 * 判断是否为电脑端
 * @return bool
 */
function isPc(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (preg_match("/(windows|macintosh|linux).+(chrome|firefox|safari|ie|edge)/", $useragent)) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为手机端
 * @return bool
 */
function isMobile(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (preg_match("/iphone|ios|android|mini|mobile|mobi|Nokia|Symbian|iPod|iPad|Windows\s+Phone|MQQBrowser|wp7|wp8|UCBrowser7|UCWEB|360\s+Aphone\s+Browser|AppleWebKit|cfnetwork|harmony/", $useragent)) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为微信端
 * @return bool
 */
function isWeixin(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'micromessenger') !== false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为支付宝端
 * @return bool
 */
function isAlipay(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'alipay') !== false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为APP端
 * @return bool
 */
function isApp(){
    if (isAndroidApp() || isIOSApp() || isHarmonyApp()) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为安卓APP端
 * @return bool
 */
function isAndroidApp(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'huoniao') !== false && strpos($useragent, 'android') !== false && strpos($useragent, 'harmony') == false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为苹果APP端
 * @return bool
 */
function isIOSApp(){
    global $reqUri;
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    $queryString = strtolower($_SERVER['QUERY_STRING']);
    if (
        (strpos($useragent, 'huoniao_ios') !== false && strpos($useragent, 'android') == false && strpos($useragent, 'harmony') == false) || 
        (isMobile() && (strpos($queryString, 'appfullscreen') !== false || strpos($queryString, 'appindex') !== false) && strpos($useragent, 'iphone') != false && strpos($useragent, 'android') == false && strpos($useragent, 'harmony') == false) || 
        (strpos($useragent, 'cfnetwork') !== false && strpos($useragent, 'darwin') !== false)
    ) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为鸿蒙APP端
 * @return bool
 */
function isHarmonyApp(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'huoniao') !== false && strpos($useragent, 'harmony') !== false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 获取URL指定参数值
 * @param string $url 要处理的字符串（默认为当前页面地址）
 * @param string $key 要获取的key值
 * @return string
 */
function getUrlQuery($url, $key){
    $conf = explode("?", ($url ? $url : $_SERVER['REQUEST_URI']));
    $conf = $conf[1];
    $arr = $conf ? explode("&", $conf) : array();
    foreach ($arr as $k => $v) {
        $query = explode("=", $arr[$k]);
        if ($query[0] == $key) {
            return $query[1];
        }
    }
    return false;
}

/**
 * 根据出生日期计算年龄
 * @param string $birth 要计算的出生日期（格式：1970-1-1）
 * @return int
 */
function getBirthAge($birth){
    if ($birth && $birth > 0) {
        if(!strstr($birth, '-')){
            $birth = date('Y-m-d', $birth);
        }
        list($by, $bm, $bd) = explode('-', $birth);
        $cm = date('n');
        $cd = date('j');
        $age = date('Y') - $by - 1;
        if ($cm > $bm || $cm == $bm && $cd > $bd) $age++;
        $age = $age > 0 ? $age : 0;
        return $age;
    }
}


/**
 * 取得URL链接地址
 * @param array $params 参数集
 * @return string
 */
function getUrlPath($params = array()){
    if(!$params || !is_array($params)) return;
    global $_G;
    global $HN_memory;

    $_params = $params;
    if($_params['service'] != 'member'){
        global $siteCityInfo;
        $_params['cityid'] = $siteCityInfo['cityid'];
    }
    $md5Params = base64_encode(json_encode($_params));

    $cacheData = getCacheData($md5Params, 'urlPath');
    if($cacheData){
        return $cacheData['data'];
    }

    //重复的参数取当前请求的首次结果，避免重复查询
    if(isset($_G[$md5Params]) != NULL){
        return $_G[$md5Params];
    }

    $memberCache = $HN_memory->get($md5Params);
    if($memberCache){
        return $memberCache;
    }

    //招聘原生页面链接适配
    if($params['service']=="job"){
        $jobParam = $params;
        if(empty($params['param'])){
            $jobParamLine = "";
        }else{
            $jobParamLine = $params['param']; // a=1&b=1
        }
        foreach ($params as $parami => $paramj){
            if($parami != "service" && $parami!="template"){
                unset($params[$parami]);
            }
        }
        unset($params['id']);
        unset($jobParam['service']);
        unset($jobParam['template']);
        unset($jobParam['param']);
        foreach ($jobParam as $jobParamK => $jobParamV){
            $jobParamLine .= ($jobParamLine ? "&" : "").$jobParamK."=".$jobParamV;
        }

        //APP端全面屏链接适配
        if(isApp()){
            $jobParamLine .= ($jobParamLine ? "&" : "") . "appFullScreen=1";
        }

        //安卓端APP，做了原生化的页面，需要增加自定义参数，用于安卓端做页面拦截
        if(isAndroidApp()){

            $_appPath = '';

            //职位列表
            if($params['template'] == 'job-list'){
                $_appPath = 'job-list';
            }
            //职位详情
            elseif($params['template'] == 'job' && $jobParam['id']){
                $_appPath = 'job&appPathId=' . $jobParam['id'];
            }
            //招聘会首页
            elseif($params['template'] == 'zhaopinhui' && !$jobParam['id']){
                $_appPath = 'zhaopinhui';
            }
            //招聘会详情
            elseif($params['template'] == 'zhaopinhui' && $jobParam['id']){
                $_appPath = 'zhaopinhui-detail&appPathId=' . $jobParam['id'];
            }
            //普工招聘列表
            elseif($params['template'] == 'general' && !$jobParam['type']){
                $_appPath = 'general';
            }
            //普工招聘详情
            elseif($params['template'] == 'general-detailzg' && $jobParam['id']){
                $_appPath = 'general-detailzg&appPathId=' . $jobParam['id'];
            }
            //普工求职列表
            elseif($params['template'] == 'general' && $jobParam['type']){
                $_appPath = 'general&type=1';
            }
            //普工求职详情
            elseif($params['template'] == 'general-detailqz' && $jobParam['id']){
                $_appPath = 'general-detailqz&appPathId=' . $jobParam['id'];
            }
            //公司列表
            elseif($params['template'] == 'company-list'){
                $_appPath = 'company-list';
            }
            //公司详情
            elseif($params['template'] == 'company' && $jobParam['id']){
                $_appPath = 'company&appPathId=' . $jobParam['id'];
            }
            //资讯首页
            elseif($params['template'] == 'news'){
                $_appPath = 'news';
            }
            //公司详情
            elseif($params['template'] == 'news-detail' && $jobParam['id']){
                $_appPath = 'news-detail&appPathId=' . $jobParam['id'];
            }

            //如果触发了上面的条件
            if($_appPath){
                $jobParamLine .= ($jobParamLine ? "&" : "") . "appPage=job&appPath=".$_appPath;
            }

        }

        $params['param'] = $jobParamLine;
    }

    //资讯原生页面链接适配
    if($params['service']=="article" && isApp()){
        $articleParam = $params;
        if(empty($params['param'])){
            $articleParamLine = "";
        }else{
            $articleParamLine = $params['param']; // a=1&b=1
        }

        $_appPath = '';

        //资讯详情
        if($params['template'] == 'detail' && $params['id']){
            $_appPath = 'detail&appPathId=' . $params['id'];
        }

        //如果触发了上面的条件
        if($_appPath){
            $articleParamLine .= ($articleParamLine ? "&" : "") . "appPage=article&appPath=".$_appPath;
        }

        $params['param'] = $articleParamLine . ($articleParamLine ? "&" : "") . "appFullScreen=1";
    }

    //贴吧原生页面链接适配
    if($params['service']=="tieba" && isAndroidApp()){
        $articleParam = $params;
        if(empty($params['param'])){
            $articleParamLine = "";
        }else{
            $articleParamLine = $params['param']; // a=1&b=1
        }

        $_appPath = '';

        //贴吧详情
        if($params['template'] == 'detail' && $params['id']){
            $_appPath = 'detail&appPathId=' . $params['id'];
        }

        //如果触发了上面的条件
        if($_appPath){
            $articleParamLine .= ($articleParamLine ? "&" : "") . "appPage=tieba&appPath=".$_appPath;
        }

        $params['param'] = $articleParamLine . ($articleParamLine ? "&" : "") . "appFullScreen=1";
    }

    //任务悬赏原生页面链接适配
    if($params['service']=="task"){
        $taskParam = $params;
        if(empty($params['param'])){
            $taskParamLine = "";
        }else{
            $taskParamLine = $params['param']; // a=1&b=1
        }

        $_appPath = '';

        $params['param'] = $taskParamLine . ($taskParamLine ? "&" : "") . "appFullScreen=1";
    }

    extract($params);
    global $dsql;
    global $cfg_urlRewrite;
    global $cfg_secureAccess;
    global $cfg_basehost;

    //完全自定义
    if($service == 'custom'){
        setCacheData($md5Params, $param, 'urlPath');

        $_G[$md5Params] = $param;
        $HN_memory->set($md5Params, $param);

        return $param;
    }

    $configFilePath = HUONIAOINC."/config/$service.inc.php";
    if(file_exists($configFilePath)){
        include($configFilePath);
    }else{
        return;
    }

    $encodeParam = array();
    if (!empty($params['param'])) {
        $paramArr = explode('&', $params['param']);
        foreach ($paramArr as $key => $val){
            $par = explode('=', $val);
            array_push($encodeParam, $par[0] . '=' . (preg_match('/[\x{4e00}-\x{9fa5}]/u', $par[1]) > 0 ? urlencode(urldecode($par[1])) : $par[1]));
        }
        $params['param'] = join('&', $encodeParam);
    }


    //系统模块
    if ($service == "siteConfig") {
        $domain = $cfg_secureAccess . $cfg_basehost;

        //服务协议兼容标题生成链接
        if($template == 'protocol' && $title){
            unset($params['title']);
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'agree' AND `title` = '$title'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $params['id'] = $ret[0]['id'];
            }
            //如果标题完全匹配不上，则进行模糊匹配
            else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_singellist` WHERE `type` = 'agree' AND `title` like '%$title%' ORDER BY `id` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $params['id'] = $ret[0]['id'];
                }
            }
        }

    } elseif ($service != "member") {

        //模块域名
        $domain = getDomainFullUrl($service, $customSubDomain, array(), $params);

        //新闻频道自定义URL
        if ($service == "article" || $service == "image") {
            $ser = $service;

            // $claFile = HUONIAOROOT . '/api/handlers/' . $ser . '.class.php';
            // if (is_file($claFile)) {
            //     include_once $claFile;
            // } else {
            //     return;
            // }

            // $articleService = new $ser();
            // $articleConfig = $articleService->config();
            // $listRule = $articleConfig['listRule'];
            // $detailRule = $articleConfig['detailRule'];

            $listRule = $custom_listRule;
            $detailRule = $custom_detailRule;

            //验证不是跳转类型
            $flag1 = explode(",", $flag);
            if (!in_array("t", $flag1) || empty($redirecturl)) {

                $after = "";
                if (!empty($params['param'])) {
                    $after = "?" . $params['param'];
                }
                
                if ($template == "list") {

                    if (!empty($typeid) && is_numeric($typeid)) {

                        //查询分类信息
                        $sql = $dsql->SetQuery("SELECT `pinyin`, `py` FROM `#@__" . $ser . "type` WHERE `id` = $typeid");
                        if($ser == "article"){
                            $ret = getCache($ser."type_py", $sql, 0, array("sign" => $typeid));
                        }else{
                            $ret = $dsql->dsqlOper($sql, "results");
                        }
                        if ($ret) {

                            $pinyin = $ret[0]['pinyin'];
                            $py = $ret[0]['py'];

                            //分类全拼
                            if ($listRule == 1) {
                                $urlPath = $domain . "/" . $pinyin . "/" . $after;

                                setCacheData($md5Params, $urlPath, 'urlPath');

                                $_G[$md5Params] = $urlPath;
                                $HN_memory->set($md5Params, $urlPath);

                                return $urlPath;

                                //分类首字母
                            } elseif ($listRule == 2) {
                                $urlPath = $domain . "/" . $py . "/" . $after;
                                
                                setCacheData($md5Params, $urlPath, 'urlPath');

                                $_G[$md5Params] = $urlPath;
                                $HN_memory->set($md5Params, $urlPath);

                                return $urlPath;

                            }

                        }

                    }
                } elseif ($template == "detail" && $id) {

                    //查询分类信息
                    $folder = "";

                    // 优先传入typeid，不需要join查询
                    if (!empty($typeid) && is_numeric($typeid)) {
                        $sql = $dsql->SetQuery("SELECT `pinyin`, `py` FROM `#@__" . $ser . "type` WHERE `id` = $typeid");
                        if($ser == "article"){
                            $ret = getCache($ser."type_py", $sql, 0, array("sign" => $typeid));
                        }else{
                            $ret = $dsql->dsqlOper($sql, "results");

                        }
                    }else{
                        $sql = $dsql->SetQuery("SELECT t.`pinyin`, t.`py` FROM `#@__" . $ser . "type` t LEFT JOIN `#@__" . $ser . "list` l ON l.`typeid` = t.`id` WHERE l.`id` = $id");
                        $ret = $dsql->dsqlOper($sql, "results");
                    }
                    if ($ret) {
                        $pinyin = $ret[0]['pinyin'];
                        $py = $ret[0]['py'];

                        //分类全拼
                        if ($listRule == 1) {
                            $folder = "/" . $pinyin;

                            //分类首字母
                        } elseif ($listRule == 2) {
                            $folder = "/" . $py;
                        }
                    }

                    //不需要前缀
                    if ($detailRule == 1) {
                        $urlPath = $domain . $folder . "/" . $id . ".html" . $after;

                        setCacheData($md5Params, $urlPath, 'urlPath');

                        $_G[$md5Params] = $urlPath;
                        $HN_memory->set($md5Params, $urlPath);

                        return $urlPath;
                    } else {
                        $urlPath = $domain . $folder . "/detail-" . $id . ".html" . $after;

                        setCacheData($md5Params, $urlPath, 'urlPath');

                        $_G[$md5Params] = $urlPath;
                        $HN_memory->set($md5Params, $urlPath);

                        return $urlPath;
                    }

                }

            }


        }

        //团购频道域名配置
        if ($service == "tuan_tuan") {

            include_once HUONIAOROOT . '/api/handlers/tuan.class.php';

            //团购商品详细页链接，需要根据商品相关信息获取相应的URL
            if (!empty($id) && is_numeric($id)) {

                $sql = $dsql->SetQuery("SELECT d.`domain` FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` LEFT JOIN `#@__site_area` a ON a.`id` = s.`addrid` LEFT JOIN `#@__tuan_city` c ON c.`cid` = a.`parentid` LEFT JOIN `#@__domain` d ON d.`iid` = c.`id` WHERE d.`module` = 'tuan' AND d.`part` = 'city' AND l.`id` = $id");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    global $city;
                    $city = $ret[0]['domain'];
                    $tuanService = new tuan();
                    $domainInfo = $tuanService->getCity();
                    $tuanDomain = $domainInfo['url'];
                    $domain = $tuanDomain;

                } else {

                    //其他例外情况，比如获取商家链接
                    global $city;
                    $tuanService = new tuan();
                    $domainInfo = $tuanService->getCity();
                    $tuanDomain = $domainInfo['url'];
                    $domain = $tuanDomain;

                }

            } else {

                //重置自定义配置
                $subDomain = $customSubDomain;
                global $customSubDomain;
                $customSubDomain = $subDomain;
                $tuanService = new tuan();
                $domainInfo = $tuanService->getCity();
                $tuanDomain = $domainInfo['url'];
                $domain = $tuanDomain;

            }


            // 此处少验证一种情况
            // 当cookie中没有城市信息时，domain输出为空，这里需要调整为：
            // 如果template为detail时，需要根据传过来的商品ID所属商家的所在城市输出相应的domain


        }

        //会员链接
    } else {

        // $domain = $type == "user" ? getDomain('member', 'user') : getDomain('member', 'busi');

        global $handler;
        $handler = true;
        $configHandels = new handlers("member", "config");
        $moduleConfig = $configHandels->getHandle();
        if (is_array($moduleConfig) && $moduleConfig['state'] == 100) {
            $moduleConfig = $moduleConfig['info'];
            global $cfg_userSubDomain;
            global $cfg_busiSubDomain;

            $domain = $type == "user" ? $moduleConfig['userDomain'] : $moduleConfig['busiDomain'];
            // if($type == "user"){
            //  $sub = "";
            //  if($cfg_userSubDomain == 1){
            //      $sub = "/u";
            //  }
            //  $domain = $moduleConfig['userDomain'].$sub;
            // }else{
            //  $sub = "";
            //  if($cfg_busiSubDomain == 1){
            //      $sub = "/b";
            //  }
            //  $domain = $moduleConfig['busiDomain'].$sub;
            // }

            unset($params['type']);

        } else {
            $domain = $cfg_secureAccess . $cfg_basehost . "/" . $service;
        }
    }

    //如果是列表页面，判断页码值是否存在，如果不存在则初始化
    if ($template == "list" && empty($page)) {
        // $params['page'] = 1;
    }

    $flag = explode(",", $flag);
    //跳转类型
    if (in_array("t", $flag) && $redirecturl) {
        $urlPath = $redirecturl . '" target="_blank';

        setCacheData($md5Params, $urlPath, 'urlPath');

        $_G[$md5Params] = $urlPath;
        $HN_memory->set($md5Params, $urlPath);

        return $urlPath;

        //站内类型
    } else {
        $param = array();
        $paramRewrite = array();
        foreach ($params as $key => $value) {
            if ($key != "flag" && $key != "redirecturl") {
                if ($key == "param") {
                    $param[] = $value;
                } else {
                    $param[] = $key . "=" . $value;
                }
                if (($cfg_urlRewrite || $service == "member") && $key != "service" && $key != "param") {
                    $paramRewrite[] = $value;
                }
            }
        }

        $after = "";
        if (!empty($params['param'])) {
            $after = "?" . $params['param'];
        }

        //伪静态
        if ($cfg_urlRewrite || $service == "member") {
            if (!empty($paramRewrite)) {
                if ($service == "website" && (strstr($template, "preview") || strstr($template, "site"))) {

                    //站点独立域名验证
                    if (strstr($template, "site")) {
                        $websiteid = (int)str_replace("site", "", $template);

                        if (is_numeric($websiteid)) {
                            $sql = $dsql->SetQuery("SELECT `domaintype` FROM `#@__website` WHERE `id` = $websiteid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $getDomain = getDomain("website", "website", $websiteid);
                                if ($getDomain && $ret[0]['domaintype'] && $getDomain['state'] == 1 && !isMobile()) {
                                    $urlPath = $cfg_secureAccess . $getDomain['domain'] . ($alias ? "/" . $alias . ".html" : "");

                                    setCacheData($md5Params, $urlPath, 'urlPath');

                                    $_G[$md5Params] = $urlPath;
                                    $HN_memory->set($md5Params, $urlPath);

                                    return $urlPath;
                                }
                            }
                        }


                    }

                    $urlPath = $domain . (substr($domain, -1) == '/' ? '' : '/') . $template . ($alias ? "/" . $alias . ".html" : "") . $after;

                    setCacheData($md5Params, $urlPath, 'urlPath');

                    $_G[$md5Params] = $urlPath;
                    $HN_memory->set($md5Params, $urlPath);

                    return $urlPath;
                } else {
                    $urlPath = $domain . (substr($domain, -1) == '/' ? '' : '/') . ($service == 'member' && $template == 'chat' ? 'im/' : '') . join("-", $paramRewrite) . (($template == 'announcement-detail' || ($service == 'job' && isMobile())) ? '' : ".html") . $after;

                    setCacheData($md5Params, $urlPath, 'urlPath');

                    $_G[$md5Params] = $urlPath;
                    $HN_memory->set($md5Params, $urlPath);

                    return $urlPath;
                }
            } else {
                $urlPath = $domain . (substr($domain, -1) == '/' ? '' : ($after ? '/' : '')) . $after;

                setCacheData($md5Params, $urlPath, 'urlPath');

                $_G[$md5Params] = $urlPath;
                $HN_memory->set($md5Params, $urlPath);

                return $urlPath;
            }

            //动态
        } else {
            if ($service == "website" && (strstr($template, "preview") || strstr($template, "site"))) {
                if (strstr($template, "preview")) {
                    $urlPath = $cfg_secureAccess . $cfg_basehost . '/website.php?type=template&id=' . str_replace("preview", "", $template) . ($alias ? "&alias=" . $alias : "");

                    setCacheData($md5Params, $urlPath, 'urlPath');

                    $_G[$md5Params] = $urlPath;
                    $HN_memory->set($md5Params, $urlPath);

                    return $urlPath;
                } elseif (strstr($template, "site")) {
                    $urlPath = $cfg_secureAccess . $cfg_basehost . '/website.php?id=' . str_replace("site", "", $template) . ($alias ? "&alias=" . $alias : "");

                    setCacheData($md5Params, $urlPath, 'urlPath');

                    $_G[$md5Params] = $urlPath;
                    $HN_memory->set($md5Params, $urlPath);

                    return $urlPath;
                }
            } else {
                $urlPath = $cfg_secureAccess . $cfg_basehost . '/index.php?' . join("&", $param);

                setCacheData($md5Params, $urlPath, 'urlPath');

                $_G[$md5Params] = $urlPath;
                $HN_memory->set($md5Params, $urlPath);

                return $urlPath;
            }
        }
    }

}


/**
 * 取得URL链接地址
 * @param array $params 参数集
 * @param $url  域名前缀 格式：http://domain.com/list.html
 * @param $data 现有参数 格式：a=1&b=2&c=3
 * @param $item 组合参数 格式：item=1:a;2:aa;3:aaa 一组有两个值，用冒号隔开，多个组之间用分号隔开
 * @param $specification 组合参数 格式：specification=1;2;3  多个值之间用分号隔开
 * @param 新参数 a=2 (数组格式)   返回结果会把$data中的a=1更新为a=2
 * @return string
 */
function getUrlParam($params){
    extract($params);
    $paramData = array();

    $ljf = strpos($url, ".html") !== false ? "?" : "&";

    //现有参数
    if ($data) {
        parse_str($data, $nData);
        foreach ($nData as $k => $v) {
            if ($v !== "") {
                $paramData[$k] = $v;
            }
        }
    }


    //新参数&&覆盖旧参数
    // print_r($params);
    foreach ($params as $key => $value) {
        if ($key != "url" && $key != "data" && $key != "item" && $key != "specification") {
            if ($value !== "") {  //flag为属性值，有为0的情况，这里要排除限制
                $paramData[$key] = $value;
            } else {
                unset($paramData[$key]);
            }
        }
    }


    //特殊情况 item
    //更新：当现有值为：1:a;2:aa;3:aaa时，新传过来的值为：1:b，此时要更新1:a的值为：1:b
    //新增：当现有值为：1:a;2:aa;3:aaa时，新传过来的值为：4:aaaa，此时要更新现有值为：1:a;2:aa;3:aaa;4:aaaa
    //删除：当现有值为：1:a;2:aa;3:aaa时，新传过来的值为：2:0，此时要更新现有值为：1:a;3:aaa;4:aaaa
    if ($item !== "") {
        $nItem = explode(":", $item);
        $pItem = $paramData['item'];
        $pItem = !empty($nItem[1]) ? (($pItem ? $pItem . ";" : "") . $item) : $pItem;
        $pItemArr = explode(";", $pItem);
        $pItemArr = array_flip(array_flip($pItemArr));   //去除相同元素
        sort($pItemArr);

        //更新相同级别的选项值
        $nItemArr = array();
        foreach ($pItemArr as $key => $value) {
            $vArr = explode(":", $value);
            if ($vArr[0] == $nItem[0]) {
                $nItemArr[$vArr[0]] = $nItem[1];
            } else {
                $nItemArr[$vArr[0]] = $vArr[1];
            }
        }

        //组合新的选项值
        $newArr = array();
        foreach ($nItemArr as $key => $value) {
            if (!empty($value)) {
                array_push($newArr, $key . ":" . $value);
            }
        }
        $paramData['item'] = join(";", $newArr);
    } else {
        $paramData['item'] = "";
    }


    //特殊情况 specification
    //情况参考上面的item
    if ($specification !== "") {
        $nSpe = explode(":", $specification);
        $pSpe = $paramData['specification'];
        $pSpe = !empty($nSpe[1]) ? (($pSpe ? $pSpe . ";" : "") . $specification) : $pSpe;
        $pSpeArr = explode(";", $pSpe);
        $pSpeArr = array_flip(array_flip($pSpeArr));   //去除相同元素
        sort($pSpeArr);

        //更新相同级别的选项值
        $nSpeArr = array();
        foreach ($pSpeArr as $key => $value) {
            $vArr = explode(":", $value);
            if ($vArr[0] == $nSpe[0]) {
                $nSpeArr[$vArr[0]] = $nSpe[1];
            } else {
                $nSpeArr[$vArr[0]] = $vArr[1];
            }
        }

        //组合新的选项值
        $newArr = array();
        foreach ($nSpeArr as $key => $value) {
            if (!empty($value)) {
                array_push($newArr, $key . ":" . $value);
            }
        }
        $paramData['specification'] = join(";", $newArr);
    } else {
        $paramData['specification'] = "";
    }

    $param = array();
    if ($paramData) {
        foreach ($paramData as $key => $value) {
            if ($value !== "") {
                array_push($param, $key . "=" . $value);
            }
        }
    }

    //sort($param);
    $param = $ljf . join("&", $param);
    return $url . $param;
}


/**
 * 打印分页html
 * @param array $params 参数集
 * @return string
 */
function getPageList($params){
    extract($params);
    unset($params['pageInfo']);

    //引入分页类
    include_once(HUONIAOINC . '/class/pagelist.class.php');

    //获取pageInfo
    if(!$pageInfo){
        global $pageInfo;
    }
    global $typeid;
    global $cfg_secureAccess;
    global $cfg_basehost;

    $page = (int)$pageInfo['page'];
    $pageSize = (int)$pageInfo['pageSize'];
    $totalPage = (int)$pageInfo['totalPage'];
    $totalCount = (int)$pageInfo['totalCount'];

    $param = array();
    foreach ($params as $key => $value) {
        if ($key != "pageType") {
            $param[$key] = $value;
        }
    }

    if (!array_key_exists("typeid", $params)) {
        //$param['typeid'] = $typeid;
    }

    if ($pageType != "dynamic") {
        $param['page'] = "#page#";
    }

    $url = getUrlPath($param);
    if ($params['service'] == "siteConfig") {
        if ($params['template'] == "user") {
            if ($params['action'] == "follow" || $params['action'] == "fans" || $params['action'] == "visitor" || $params['action'] == "fabu") {
                $url = $cfg_secureAccess . $cfg_basehost . "/user/" . $params['id'] . "/" . $params['action'] . ".html?" . ($params['param'] ? $params['param'] : 'page=#page#');
            }
        }
    }
    $pageConfig = array(
        'total_rows' => $totalCount,
        'method' => 'html',
        'parameter' => $url,
        'now_page' => $page,
        'list_rows' => $pageSize,
    );
    $page = new pagelist($pageConfig);
    echo $page->show();

}

/* 内容分页 */
function bodyPageList($params){
    extract($params);
    global $all;
    global $langData;
    $pagesss = '_huoniao_page_break_tag_';  //设定分页标签
    $a = strpos($body, $pagesss);
    if ($a && !$all) {
        $con = explode($pagesss, $body);
        $cons = count($con);
        @$p = ceil($page);
        if (!$p || $p < 0) $p = 1;
        // $url = $_SERVER["REQUEST_URI"];
        // $parse_url = parse_url($url);
        // $url_query = $parse_url["query"];
        // if($url_query){
        //  $url_query = ereg_replace("(^|&)p=$p", "", $url_query);
        //  $url = str_replace($parse_url["query"], $url_query, $url);
        //  if($url_query) $url .= "&p"; else $url .= "p";
        // }else {
        //  $url .= "?p";
        // }
        if ($cons <= 1) return false;//只有一页时不显示分页
        $pagenav = '<div class="page fn-clear"><ul>';
        //上一页
        if ($p == 1) {
            $pagenav .= '<li><span class="disabled">' . $langData['siteConfig'][6][33] . '</span></li>';
        } else {
            $pagenav .= "<li><a href='?p=" . ($p - 1) . "'>" . $langData['siteConfig'][6][33] . "</a></li>";
        }
        for ($i = 1; $i <= $cons; $i++) {
            if ($i == $p) {
                $pagenav .= '<li><span>' . $i . '</span></li>';
            } else {
                $pagenav .= "<li><a href='?p=$i'>$i</a></li>";
            }
        }
        //下一页
        if ($p == $cons) {
            $pagenav .= '<li><span class="disabled">' . $langData['siteConfig'][6][34] . '</span></li>';
        } else {
            $pagenav .= "<li><a href='?p=" . ($p + 1) . "'>" . $langData['siteConfig'][6][34] . "</a></li>";
        }
        //显示全文
        $pagenav .= "<li><a href='?all=1'>" . $langData['siteConfig'][21][8] . "</a></li>";
        $pagenav .= "</ul></div>";
        return $pagenav;
    }
}

/* 打印导航 */
function getChannel($params){
    extract($params);
    global $typeid;
    $pid = 0;
    if ($tab) {
        $typeName = getParentArr($tab, $typeid);
        $typeName = !empty($typeName) ? array_reverse(parent_foreach($typeName, "id")) : 1;
        $pid = $typeName[0];
    }
    $params['son'] = "1";
    $handler = true;
    $channel = "";
    $moduleHandels = new handlers($service, "type");
    $moduleReturn = $moduleHandels->getHandle($params);
    if ($moduleReturn['state'] == 100 && is_array($moduleReturn['info'])) {
        $channel = printChannel($moduleReturn['info'], $pid);
    }
    return $channel;
}

function printChannel($data, $pid = 0){
    $return = "";
    if ($data) {
        foreach ($data as $key => $value) {
            $lower = $value['lower'];
            $cla = array();
            if ($lower) {
                $cla[] = "sub";
            }
            if ($pid == $value['id']) {
                $cla[] = 'on';
            }
            $clas = $cla ? ' class="' . join(" ", $cla) . '"' : '';
            $return .= '<li' . $clas . '>';
            $return .= '<a href="' . $value['url'] . '">' . $value['typename'] . '</a>';
            if ($lower) {
                $return .= '<ul>';
                $return .= printChannel($lower);
                $return .= '</ul>';
            }
            $return .= '</li>';
        }
    }
    return $return;
}

/* 获取附件后缀名 */
function getAttachType($id){
    if (!empty($id)) {
        global $dsql;
        $RenrenCrypt = new RenrenCrypt();
        $id = $RenrenCrypt->php_decrypt(base64_decode($id));

        if (is_numeric($id)) {
            $attachment = $dsql->SetQuery("SELECT `filename` FROM `#@__attachment` WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($attachment, "results");
            if ($results) {
                $filename = $results[0]['filename'];
                $filetype = strtolower(strrchr($filename, '.'));
                return $filetype;
            }
        }
    }
}

/* 根据文件类型输出不同的内容 */
function getAttachHtml($id = "", $href = "", $title = "", $width = 0, $height = 0, $exp = false, $insert = "", $advMark = ""){
    $html = "";
    $width = !empty($width) ? $width : "100%";
    $height = !empty($height) ? $height : "";
    $src = getFilePath($id); //附件路径
    global $langData;

    //验证附件后缀
    global $cfg_hideUrl;
    if ($cfg_hideUrl == 1) {
        $filetype = getAttachType($id);
    } else {
        $filetype = strtolower(strrchr($src, '.'));
    }

    if ($filetype == ".swf") {
        $html = '<div class="siteAdvObj"><embed width="' . $width . '" height="' . $height . '" src="' . $src . '" type="application/x-shockwave-flash" quality="high" wmode="opaque">' . $advMark . '</div>';
    } else {
        if ($href == "") {
            $html = '<div class="siteAdvObj"><a href="javascript:;" style="cursor:default;"><img src="' . $src . '" width="' . $width . '" height="' . $height . '" alt="' . $title . '" />' . (!empty($insert) ? $insert : "") . '</a>' . $advMark . '</div>';
            if ($exp) {
                $html .= '<p>' . $title . '</p>';
            }
        } else {
            $html = '<div class="siteAdvObj"><a href="' . $href . '" target="_blank"><img src="' . $src . '" width="' . $width . '" height="' . $height . '" alt="' . $title . '" />' . (!empty($insert) ? $insert : "") . '</a>' . $advMark . '</div>';
            if ($exp) {
                $html .= '<p>' . $title . '<a href="' . $href . '" target="_blank">' . $langData['siteConfig'][21][9] . '</a></p>';
            }
        }
    }
    return $html;
}

/* 静态页面获取当前时间 */
function getMyTime($params, $smarty){
    if (empty($params["format"])) {
        $format = "%b %e, %Y";
    } else {
        $format = $params["format"];
    }

    $rtime = strftime($format, time());

    if ($params["type"] == "nongli") {
        require_once HUONIAOINC . '/class/lunar.class.php';
        $lunar = new lunar();
        $rtime = $lunar->S2L($rtime);
        $rtime = explode("年", $rtime);
        $rtime = $rtime[1];
    }
    return $rtime;
}

/* 静态页面获取当前星期几 */
function getMyWeek($params, $smarty){
    global $langData;
    $prefix = $params['prefix'];  //前缀，升级多语言版本后，此前缀暂时不用了
    $week = !empty($params['date']) ? date("w", strtotime($params['date'])) : date("w");
    $weekarray = array($langData['siteConfig'][14][10], $langData['siteConfig'][14][4], $langData['siteConfig'][14][5], $langData['siteConfig'][14][6], $langData['siteConfig'][14][7], $langData['siteConfig'][14][8], $langData['siteConfig'][14][9]);
    return $weekarray[$week];
}

/* 天气数据 */
function getWeather($params, $smarty){
    extract($params);
    global $cfg_secureAccess;
    global $cfg_basehost;

    $day = (int)$day;
    $skin = (int)$skin;

    $day = $day < 1 ? 1 : $day;
    $day = $day > 6 ? 6 : $day;
    $skin = $skin < 1 ? 1 : $skin;

    $imgUrl = $cfg_secureAccess . $cfg_basehost . "/static/images/ui/weather/" . $skin . "/";

    //如果没有传城市名称
    if (empty($city)) {

        //先判断系统默认城市
        global $siteCityInfo;
        if (!empty($siteCityInfo)) {
            $city = $siteCityInfo['name'];

            //如果系统默认城市为空，则自动获取当前城市
        } else {
            $cityData = getIpAddr(GetIP());
            if ($cityData == "本地局域网") {
                $city = "北京";
            } else {
                $cityData = explode("省", $cityData);
                $cityData = explode("市", $cityData[1]);
                $city = $cityData[0];
            }
        }
    }

    //根据城市名获取数据库中的编码
    global $dsql;
    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_area` WHERE `typename` = '$city' AND `weather_code` <> ''");
    $results = $dsql->dsqlOper($sql, "results");
    if ($results) {
        $code = $results[count($results) - 1]['weather_code'];
    } else {
        $code = '101010100';
    }

    $weatherArr = array();

    // 360
    $url = "http://cdn.weather.hao.360.cn/sed_api_weather_info.php?app=360chrome&code=$code";

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_TIMEOUT, 5);
    $con = curl_exec($curl);
    curl_close($curl);

    if ($con) {
        $con = str_replace("callback(", "", $con);
        $con = str_replace(");", "", $con);
        $weatherinfo = json_decode($con, true);
        if (is_array($weatherinfo)) {
            $weatherinfo = $weatherinfo['weather'];
            for ($i = 0; $i < $day; $i++) {
                $f = $i + 1;

                $info = $weatherinfo[$i]['info'];

                $bday = $info['day'];
                $night = $info['night'];

                //白天
                $dimg = $bday[0];
                $dweather = $bday[1];
                $dtemp = $bday[2];
                $dwind = $bday[3] == "无持续风向" ? $bday[4] : $bday[3];

                //晚上
                $nimg = $night[0];
                $nweather = $night[1];
                $ntemp = $night[2];
                $nwind = $night[3] == "无持续风向" ? $night[4] : $night[3];

                $weather = $dweather . ($nweather == $dweather ? "" : "转" . $nweather);
                $temp = ($ntemp == $dtemp ? "" : $ntemp . "-") . $dtemp . "°C";
                $wind = $dwind . ($nwind == $dwind ? "" : "转" . $nwind);

                $img = ($dimg !== "" ? '<img src="' . $imgUrl . $dimg . '.png" class="wd" />' : "") . ($nimg !== "" ? '<img src="' . $imgUrl . $nimg . '.png" class="wn" />' : "");
                if ($dimg == $nimg) {
                    $img = $dimg !== "" ? '<img src="' . $imgUrl . $dimg . '.png" class="w0" />' : "";
                }

                $param = array(
                    "date" => $weatherinfo['date'],
                    "prefix" => "周"
                );
                $date = getMyWeek($param, $smarty);

                if ($f == 1) {
                    $date = "今天";
                } else if ($f == 2) {
                    $date = "明天";
                } else if ($f == 3) {
                    $date = "后天";
                }

                $weatherArr[$i] = '<li class="weather' . $f . '">
                <span class="date">' . $date . '</span>
                <span class="pic" title="' . $weather . '">' . $img . '</span>
                <span class="weather">' . $weather . '</span>
                <span class="temp">' . $temp . '</span>
                <span class="wind">' . $wind . '</span>
            </li>';
            }

        }
    }


    // 小米
    // $url = "http://weatherapi.market.xiaomi.com/wtr-v2/weather?cityId=$code";

    // $curl = curl_init();
    //  curl_setopt($curl, CURLOPT_URL, $url);
    //  curl_setopt($curl, CURLOPT_HEADER, 0);
    //  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    //  curl_setopt($curl, CURLOPT_TIMEOUT, 5);
    //  $con = curl_exec($curl);
    //  curl_close($curl);

    //  if($con){
    //   $weatherinfo = json_decode($con, true);
    //   if(is_array($weatherinfo)){
    //    $weatherinfo = $weatherinfo['forecast'];
    //    for($i = 0; $i < $day; $i++) {
    //      $f = $i + 1;
    //      $d = $i*2+1;
    //      $n = $i*2+2;

    //      $weather = $weatherinfo['weather'.$f];
    //      $temp    = $weatherinfo['temp'.$f];
    //      $wind    = $weatherinfo['wind'.$f];
    //      $dimg    = getWeatherIcon($weatherinfo['img_title'.$d]);
    //      $nimg    = getWeatherIcon($weatherinfo['img_title'.$n]);

    //      $img = ($dimg !== "" ? '<img src="'.$imgUrl.$dimg.'.png" class="wd" />' : "").($nimg !== "" ? '<img src="'.$imgUrl.$nimg.'.png" class="wn" />' : "");
    //      if($dimg == $nimg){
    //          $img = $dimg !== "" ? '<img src="'.$imgUrl.$dimg.'.png" class="w0" />' : "";
    //      }

    //      $param = array(
    //          "date"   => date("Y-m-d", strtotime("+".$i." day")),
    //          "prefix" => "周"
    //      );
    //      $date = getMyWeek($param, $smarty);

    //      if($f == 1){
    //          $date = "今天";
    //      }else if($f == 2){
    //          $date = "明天";
    //      }else if($f == 3){
    //          $date = "后天";
    //      }

    //      $weatherArr[$i] = '<li class="weather'.$f.'">
    //          <span class="date">'.$date.'</span>
    //          <span class="pic" title="'.$weather.'">'.$img.'</span>
    //          <span class="weather">'.$weather.'</span>
    //          <span class="temp">'.$temp.'</span>
    //          <span class="wind">'.$wind.'</span>
    //      </li>';
    //    }

    //  }
    // }

    return join(" ", $weatherArr);
}

//根据天气名称返回相应的图标名
function getWeatherIcon($tit){
    $code = 0;
    switch ($tit) {
        case '晴':
            $code = 0;
            break;
        case '多云':
            $code = 1;
            break;
        case '阴':
            $code = 2;
            break;
        case '阵雨':
            $code = 3;
            break;
        case '雷阵雨':
            $code = 4;
            break;
        case '雷阵雨伴有冰雹':
            $code = 5;
            break;
        case '雨夹雪':
            $code = 6;
            break;
        case '小雨':
            $code = 7;
            break;
        case '中雨':
            $code = 8;
            break;
        case '大雨':
            $code = 9;
            break;
        case '暴雨':
            $code = 10;
            break;
        case '大暴雪':
            $code = 11;
            break;
        case '特大暴雪':
            $code = 12;
            break;
        case '阵雪':
            $code = 13;
            break;
        case '小雪':
            $code = 14;
            break;
        case '中雪':
            $code = 15;
            break;
        case '大雪':
            $code = 16;
            break;
        case '暴雪':
            $code = 17;
            break;
        case '雾':
            $code = 18;
            break;
        case '冻雨':
            $code = 19;
            break;
        case '沙尘暴':
            $code = 20;
            break;
        case '小雨-中雨':
            $code = 21;
            break;
        case '中雨-大雨':
            $code = 22;
            break;
        case '大雨-暴雨':
            $code = 23;
            break;
        case '暴雨-大暴雨':
            $code = 24;
            break;
        case '大暴雨-特大暴雨':
            $code = 25;
            break;
        case '小雪-中雪':
            $code = 26;
            break;
        case '中雪-大雪':
            $code = 27;
            break;
        case '大雪-暴雪':
            $code = 28;
            break;
        case '浮尘':
            $code = 29;
            break;
        case '扬沙':
            $code = 30;
            break;
        case '强沙尘暴':
            $code = 31;
            break;
        case '飑':
            $code = 32;
            break;
        case '龙卷风':
            $code = 33;
            break;
        case '弱高吹雪':
            $code = 34;
            break;
        case '轻雾':
            $code = 35;
            break;
        default:
            $code = 0;
            break;
    }
    return $code;
}


/**
 * 数字大小写转换
 *
 */
function numberDaxie($params){
    extract($params);
    $number = substr($number, 0, 2);
    $arr = array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
    if (strlen($number) == 1) {
        $result = $arr[$number];
    } else {
        if ($number == 10) {
            $result = "十";
        } else {
            if ($number < 20) {
                $result = "十";
            } else {
                $result = $arr[substr($number, 0, 1)] . "十";
            }
            if (substr($number, 1, 1) != "0") {
                $result .= $arr[substr($number, 1, 1)];
            }
        }
    }
    return $result;
}


/**
 * 获取等比缩放后的值
 * @param int $pic_width 原图宽
 * @param int $pic_height 原图高
 * @param int $maxwidth 最大宽
 * @param int $maxheight 最大高
 *
 */
function resizeImage($pic_width, $pic_height, $maxwidth, $maxheight){
    if (($maxwidth && $pic_width > $maxwidth) || ($maxheight && $pic_height > $maxheight)) {
        if ($maxwidth && $pic_width > $maxwidth) {
            $widthratio = $maxwidth / $pic_width;
            $resizewidth_tag = true;
        }

        if ($maxheight && $pic_height > $maxheight) {
            $heightratio = $maxheight / $pic_height;
            $resizeheight_tag = true;
        }

        if ($resizewidth_tag && $resizeheight_tag) {
            if ($widthratio < $heightratio) {
                $ratio = $widthratio;
            } else {
                $ratio = $heightratio;
            }
        }

        if ($resizewidth_tag && !$resizeheight_tag) {
            $ratio = $widthratio;
        }
        if ($resizeheight_tag && !$resizewidth_tag) {
            $ratio = $heightratio;
        }

        $newSize = array(
            "width" => intval($pic_width * $ratio),
            "height" => intval($pic_height * $ratio)
        );

        if ($return) {
            return $newSize[$return];
        } else {
            return $newSize;
        }

    } else {
        if ($return == "width") {
            return $pic_width;
        } elseif ($return == "height") {
            return $pic_height;
        } else {
            return array("width" => $pic_width, "height" => $pic_height);
        }
    }
}


function resizeImageSize($params){
    extract($params);
    $arr = resizeImage($pic_width, $pic_height, $maxwidth, $maxheight);
    if ($return == "width") {
        return $arr['width'];
    } elseif ($return == "height") {
        return $arr['height'];
    } else {
        return $arr;
    }
}


/**
 * 根据图片路径、指定宽度，获取等比缩放后的高度
 * @param string $src 图片路径
 * @param int $width 最大宽度
 */
function getImgHeightByGeometric($params){
    extract($params);
    if (!empty($src) && !empty($width)) {
        $img = getimagesize($src);
        $imgSize = resizeImage($img[0], $img[1], $width, $img[1]);
        if ($imgSize) {
            return $imgSize['height'];
        }
    }
}

//对字符串内容按指定长度进行分割
function mb_str_split_($string, $split_length = 1) {
    $len = mb_strlen($string, "UTF-8");
    $array = [];
    for ($i = 0; $i < $len; $i += $split_length) {
        $array[] = mb_substr($string, $i, $split_length, "UTF-8");
    }
    return $array;
}

/**
 * 对内容进行敏感词过虑
 * @param string $body 需要处理的内容
 * @return string
 */
function filterSensitiveWords($body, $removeXSS = true){
    if (empty($body)) return $body;

    $body = addslashes(stripslashes($body));

    //华为云内容审核接口
    global $cfg_moderationWB;
    global $cfg_moderation_region;
    global $cfg_moderation_key;
    global $cfg_moderation_secret;
    global $cfg_moderation_platform;
    global $cfg_moderation_aliyun_region;
    global $cfg_moderation_aliyun_key;
    global $cfg_moderation_aliyun_secret;

    $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

    //开启文本检测
    if($cfg_moderationWB){

        //检测到的敏感词
        $allDetails = [];

        //华为云
        if($cfg_moderation_platform == 'huawei'){
        
            //华为云每次最多检测1500个字符
            $maxLength = 1500;

            require_once HUONIAOINC . "/class/moderation/huawei/text.php";
            require_once HUONIAOINC . "/class/moderation/huawei/utils.php";

            //要检测的内容类型:广告、辱骂、政治、色情、暴恐
            $items = array("ad", "abuse", "politics", "porn", "contraband");

            // 如果文本长度超过1500个字符，则进行分段  
            $segments = str_split($body, $maxLength);
            
            // 对每个分段进行处理  
            foreach ($segments as $segment) {  

                $categories = array(
                    array(
                        "text" => $segment,
                        "type" => "content"
                    )
                );
            
                init_region($cfg_moderation_region);  
                $_data = moderation_text_aksk($cfg_moderation_key, $cfg_moderation_secret, $categories, $items);  
                $_data = json_decode($_data, true);  
            
                if(is_array($_data) && !$_data['error_msg'] && $_data['result']['suggestion'] != 'pass' && $_data['result']['detail']){
                    foreach ($_data['result']['detail'] as $item) {
                        $allDetails = array_merge($allDetails, $item);
                    }
                }  

            }

        }

        //阿里云
        elseif($cfg_moderation_platform == 'aliyun'){
        
            //阿里云每次最多检测600个字符
            $maxLength = 600;

            require_once HUONIAOINC . "/class/moderation/aliyun/text.php";

            // 如果文本长度超过1500个字符，则进行分段  
            $segments = mb_str_split_($body, $maxLength);
            
            // 对每个分段进行处理  
            foreach ($segments as $segment) {  
                $config = array(
                    "accessKeyId" => $cfg_moderation_aliyun_key,
                    "accessKeySecret" => $cfg_moderation_aliyun_secret,
                    "endpoint" => $cfg_moderation_aliyun_region,
                    "content" => $segment
                );
    
                $moderation_text = new moderation_text();
                $ret = $moderation_text::main($config);
                if($ret['Code'] == 200){
                    $Data = $ret['Data'];
                    $RiskLevel = $Data['RiskLevel'];
                    $Result = $Data['Result'];
                    if($RiskLevel != 'none'){
                        if($Result){
                            foreach($Result as $key => $value){
                                $RiskWords = explode(',', $value['RiskWords']);
                                $allDetails = array_merge($allDetails, $RiskWords);
                            }
                        }
                    }
                }
            }

        }
        
        // 如果检测到了敏感词，进行替换  
        if (!empty($allDetails)) {  
            $uniqueDetails = array_unique($allDetails); // 去除重复的敏感词  
            $body = str_replace($uniqueDetails, '**', $body);  
        }  


        // 以下弃用，因为没有考虑到检测字符串有最大长度限制
        // $categories = array(
        //     array(
        //         "text" => $body,
        //         "type" => "content"
        //     )
        // );
        // $items = array("ad", "abuse", "politics", "porn", "contraband");

        // init_region($cfg_moderation_region);
        // $_data = moderation_text_aksk($cfg_moderation_key, $cfg_moderation_secret, $categories, $items);
        // $_data = json_decode($_data, true);
        // if(is_array($_data) && !$_data['error_msg'] && $_data['result']['suggestion'] != 'pass' && $_data['result']['detail']){
        //     $arr = array();
        //     foreach ($_data['result']['detail'] as $item) {
        //         $arr = array_merge($arr, $item);
        //     }
        //     $body = str_replace($arr, '**', $body);
        // }
    }

    global $cfg_replacestr;
    if (!empty($cfg_replacestr)) {

        //删除有两个||的情况
        $cfg_replacestr = str_replace('||', '|', $cfg_replacestr);

        //修复如果后台一个字段串为|时，数据最后一个值为空，导致替换的内容全部为空的问题；  by: 20180402  guozi
        $lastStr = substr($cfg_replacestr, -1);
        if($lastStr == '|'){
            $cfg_replacestr = substr($cfg_replacestr, 0, strlen($cfg_replacestr)-1);
        }

        $replacestr = explode("|", $cfg_replacestr);
        $badword = array_combine($replacestr, array_fill(0, count($replacestr), '***'));
        return $removeXSS ? RemoveXSS(strtr($body, $badword)) : strtr($body, $badword);
    } else {
        return $removeXSS ? RemoveXSS($body) : $body;
    }

}


/**
 * 判断点是否在多边形区域内
 * @param array $polygon 多边形坐标集
 * @param array $lnglat 指定坐标点
 * @param return $boolean
 */
function isPointInPolygon($polygon, $lnglat){
    $c = 0;
    $i = $j = 0;
    for ($j = count($polygon) - 1; $i < count($polygon); $j = $i++) {
        if (((($polygon[$i][1] <= $lnglat[1]) && ($lnglat[1] < $polygon[$j][1])) ||
                (($polygon[$j][1] <= $lnglat[1]) && ($lnglat[1] < $polygon[$i][1])))
            && ($lnglat[0] < ($polygon[$j][0] - $polygon[$i][0]) * ($lnglat[1] - $polygon[$i][1]) / ($polygon[$j][1] - $polygon[$i][1]) + $polygon[$i][0])
        ) {
            $c = 1;
        }
    }
    return $c;
}

//获取会员详情
function getMemberDetail($id, $simple = 0){
    $detail = array();
    global $handler;
    $handler = true;
    $memberHandels = new handlers("member", "detail");
    $memberConfig = $memberHandels->getHandle(array("id" => $id, "simple" => $simple));
    if (is_array($memberConfig) && $memberConfig['state'] == 100) {
        $memberConfig = $memberConfig['info'];
        $detail = $memberConfig;
    }
    return $detail;
}


//验证信息是否已经收藏
function checkIsCollect($param){
    global $handler;
    $handler = true;
    $Handels = new handlers("member", "collect");
    $return = $Handels->getHandle($param);
    if (is_array($return) && $return['state'] == 100) {
        $returns = $return['info'];
        return $returns;
    }
}

//验证信息是否已经点赞
function checkIsZan($param){
    global $handler;
    $handler = true;
    $Handels = new handlers("member", "getZan");
    $return = $Handels->getHandle($param);
    if (is_array($return) && $return['state'] == 100) {
        $returns = $return['info'];
        return $returns;
    }
}


/**
 * 后台消息通知
 * @param $module 模块
 * @param $part   栏目
 */
function updateAdminNotice($module, $part ,$param = array(),$uptype=0,$id=0){
    global $dsql;
    global $HN_memory;

    //如果启用了redis，并且uptype=2时
    //或者没有启用redis，并且uptype=1时
    //才会直接执行
    if(($HN_memory->enable && $uptype == 2) || (!$HN_memory->enable && $uptype == 1)){
        $uptype = 1;
    }else{
        // $uptype = 0;
    }


    //存表计划任务执行
    if($uptype == 0){
        $jsonparam = serialize($param);
        $time = GetMkTime(time());

        //查询是否有相同的通知
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__updatemessage` WHERE `param` = '$jsonparam' LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            $upsql  = $dsql->SetQuery("INSERT INTO `#@__updatemessage` (`module`,`part`,`param`,`time`) VALUES ('$module','$part','$jsonparam','$time')");
            $lastid = $dsql->dsqlOper($upsql,"lastid");
            
            //通知redis有新的消息
            if($HN_memory->enable){
                $HN_memory->rpush('updatemessage', $lastid);
            }
        }

        return;
    }

    if($part != 'branchstore' && $part != 'deposit'){
        global $dsql;
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_admin_notice` (`module`, `part`) VALUES ('$module', '$part')");
        $dsql->dsqlOper($sql, "update");
    }

    //微信推送
    $notify = $param['notify'];
    $cityid = (int)$param['cityid'];
    $type = $param['type'];//这里是拥挤发送微信消息 type 用来区分 平台or 分站 1pt 2 fz 3指定openid
    $config = $param['fields'];
    $config = str_replace("\r\n","\\r\\n",$config);
    $cArr = getInfoTempContent("wechat", $notify, $config);
    $title = $cArr['title'];
    $content = $cArr['content'];
    if ($type ==1) {
        $where = " mgroupid = $cityid AND notice = 1";
    }elseif($type ==2){
        $where = " mtype = '0' AND notice = 1";
    }elseif($type == 3){

    }else{
        $where = " (mgroupid = $cityid AND notice = 1) or (mtype = '0' AND notice = 1) ";
    }
    if($id){
        global $cfg_basedomain;
        $url = $cfg_basedomain . '/include/json.php?action=wechatTemplateNotifyDetail&id=' . $id;
    }else{
        $url = "";
    }
    if ($title || $content) {
        //指定openid
        if($type == 3){
            sendwechat($param['openid'], $title, $content, $url);
        }else{
            $openidsql = $dsql->SetQuery("SELECT `id` , `wechat_openid` FROM `#@__member` WHERE".$where);
            $results = $dsql->dsqlOper($openidsql, "results");
            for ($i=0; $i <= count($results) ; $i++) {
                sendwechat($results[$i]['wechat_openid'], $title, $content, $url);
            }
        }
        
    }


}


/**
 * 前台会员消息通知
 * @param $module 模块
 * @param $part   栏目
 * @param array $methodConfig 额外的参数控制
 */
function updateMemberNotice($uid, $notify, $param = array(), $config = array(), $customPhone = '', $im = array(),$uptype=0,$online=0,$methodConfig=array()){
    global $dsql;
    global $HN_memory;

    if(!is_array($config)) return;

    $online = 0; //不再需要同步发送消息，这里强制使用不同步发送

    //如果启用了redis，并且uptype=2时
    //或者没有启用redis，并且uptype=1时
    //才会直接执行
    if(($HN_memory->enable && $uptype == 2) || (!$HN_memory->enable && $uptype == 1)){
        $uptype = 1;
        $online = 0;
    }else{
        // 如果重置为0，为出现死循环
        // $uptype = 0;
    }

    global $cfg_timeZone;
    //存表计划任务执行
    if($uptype == 0){
        
        // 递归检查 config 中是否有 SimpleXMLElement 类型的元素
        array_walk_recursive($config, function (&$value) {
            if ($value instanceof SimpleXMLElement) {
                // 将 SimpleXMLElement 转换为字符串
                $value = $value->asXML();
            }
        });
        
        $jsonparam  = serialize($param);
        $jsonconfig = serialize($config);
        $time = GetMkTime(time());
        if($uid){
            $upsql  = $dsql->SetQuery("INSERT INTO `#@__updatemessage` (`uid`,`notify`,`param`,`config`,`type`,`online`,`time`) VALUES ('$uid','$notify','$jsonparam','$jsonconfig','1','$online','$time')");
            $lastid = $dsql->dsqlOper($upsql,"lastid");
        }

        //通知redis有新的消息
        $HN_memory->rpush('updatemessage', $lastid);

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_cron` WHERE `file` = 'update_notice_onlice' ");
        $ret = $dsql->dsqlOper($sql, "results");

        $id = $ret[0]['id'];
        /*
         * $online 说明是用户直接支付,消息通知是通过计划任务执行,用户直接执行不可以有延迟通知
         * 传入区分直接run计划任务还是自动执行 不更计划任务执行时间
         * 
         * 不再需要同步发送消息功能，这里执行为造成死循环，后续有其他方案再优化并写明原因 by gz 20220512
         * */
        if($online==1){
            // Cron::run($id,$online);
        }else{
            return;
        }
        return;
    }

    $time51 = $cfg_timeZone * -1;
    @date_default_timezone_set('Etc/GMT'.$time51);

    if (!$uid) return;

    // 直接传入手机号或邮箱，包含uid用来发送微信消息。
    // 用处：发送消息给简历上填写的联系方式
    if(is_array($uid)){
        extract($uid);
    }
    if (!$uid) return;

    //查询会员信息
    $sql = $dsql->SetQuery("SELECT `phone`, `phoneCheck`, `email`, `emailCheck`, `wechat_openid` FROM `#@__member` WHERE `id` = $uid AND `state` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if (!$ret) return;

    $phone = $phone ? $phone : $ret[0]['phone'];
    $phoneCheck = $phone ? 1 : $ret[0]['phoneCheck'];
    $email = $email ? $email : $ret[0]['email'];
    $emailCheck = $email ? 1 : $ret[0]['emailCheck'];
    $wechat_openid = $ret[0]['wechat_openid'];

    //信息URL
    $url = "";
    if ($param) {
        $url = is_array($param) ? getUrlPath($param) : $param;
        $config['url'] = $url;
    }

    if(!$config['time'] && !$config['times']){
        $config['time'] = date('Y-m-d H:i:s', GetMkTime(time()));
    }
    if(!$config['date']){
        $config['date'] = date('Y-m-d H:i:s', GetMkTime(time()));
    }

    //邮件通知
    //外部参数控制是否发送
    if(isset($methodConfig['pushEmail'])){
        if ($methodConfig['pushEmail'] && $email && $emailCheck) {
            $cArr = getInfoTempContent("mail", $notify, $config);
            $title = $cArr['title'];
            $content = $cArr['content'];
            if ($title || $content) {
                sendmail($email, $title, $content);
            }
        }
    }
    //默认
    else{
        if ($email && $emailCheck) {
            $cArr = getInfoTempContent("mail", $notify, $config);
            $title = $cArr['title'];
            $content = $cArr['content'];
            if ($title || $content) {
                sendmail($email, $title, $content);
            }
        }
    }

    //短信通知
    //外部参数控制是否发送
    if(isset($methodConfig['pushSms'])){
        if ($methodConfig['pushSms'] && ($phone && $phoneCheck) || $customPhone) {
            sendsms($customPhone ? $customPhone : $phone, 1, "", "", false, false, $notify, $config);
        }
    }
    //默认
    else{
        if (($phone && $phoneCheck) || $customPhone) {
            sendsms($customPhone ? $customPhone : $phone, 1, "", "", false, false, $notify, $config);
        }
    }

    //微信公众号
    if ($wechat_openid) {
        $cArr = getInfoTempContent("wechat", $notify, $config);
        $title = $cArr['title'];
        $content = $cArr['content'];
        if ($title || $content) {

            //如果是招聘模块，param里面还要把模板标题和uid带进来
            $_param = $param;
            if (isset($param['service']) && $param['service'] == "zhaopin") {
                $_param['moban'] = $notify;
                $_param['uid'] = $uid;
            }

            sendwechat($wechat_openid, $title, $content, $url, $_param);
        }
    }

    //网页即时消息
    $cArr = getInfoTempContent("site", $notify, $config);
    $title = $cArr['title'];
    $content = $cArr['content'];
    if ($title != "" || $content != "") {
        $time = GetMkTime(time());
        $urlParam = serialize($param);
        $log = $dsql->SetQuery("INSERT INTO `#@__member_letter` (`admin`, `type`, `title`, `body`, `urlParam`, `success`, `date`) VALUE ('0', '0', '$title', '$content', '$urlParam', 1, '$time')");
        $lid = $dsql->dsqlOper($log, "lastid");
        if (!is_numeric($lid)) return;

        $sql = $dsql->SetQuery("INSERT INTO `#@__member_letter_log` (`lid`, `uid`, `state`, `date`) VALUE ('$lid', '$uid', 0, 0)");
        $ret = $dsql->dsqlOper($sql, "update");
    }

    //APP推送
    $cArr = getInfoTempContent("app", $notify, $config);
    $title = $cArr['title'];
    $content = $cArr['content'];
    if ($title || $content) {
        sendapppush($uid, $title, $content, $url, "default", false, $im);
    }

}


/**
 * 发送微信模板消息
 * @param $conn    会员绑定的微信公众平台唯一ID
 * @param $tempid  微信消息模板ID
 * @param $config  配置数据
 * @param $url     点击后跳转的位置
 */
function sendwechat($conn, $tempid, $config, $url, $urlParam = array()){

    if(empty($conn)) return false;

    global $dsql;
    global $cfg_secureAccess;
    global $cfg_basehost;

    //引入配置文件
    $wechatConfig = HUONIAOINC . "/config/wechatConfig.inc.php";
    if (!file_exists($wechatConfig)) return '{"state": 200, "info": "请先设置微信开发者信息！"}';
    require($wechatConfig);

    $_config = $config;
    $config = str_replace("<br/>", "\\r\\n", $config);

    //2023年5月4日起，模板消息不再支持头尾、颜色、表情符号、换行等，公告：https://mp.weixin.qq.com/s/xFhCqMnlQhwWJ64ueWN8hQ
    $config = str_replace("\\r\\n", " - ", $config);

    //小程序链接
    //格式：miniprogram://appid|path
    //例如：miniprogram://wx1d194d1bb07a517e|/suzhou/shop
    if(strstr($url, 'miniprogram://') || strstr($url, 'wxMiniprogram://')){

        if(strstr($url, 'wxMiniprogram://')){
            $miniprogramArr = explode('wxMiniprogram://', $url);
            $miniprogramArr = explode('?/', $miniprogramArr[1]);
            $appid = $miniprogramArr[0];
            $pagepath = $miniprogramArr[1];
            $miniprogram = '{"appid":"'.$appid.'","pagepath":"'.$pagepath.'"}';
        }else{
            $miniprogramArr = explode('miniprogram://', $url);
            $miniprogramArr = explode('|', $miniprogramArr[1]);
            $appid = $miniprogramArr[0];
            $pagepath = $miniprogramArr[1];
            $miniprogram = '{"appid":"'.$appid.'","pagepath":"'.$pagepath.'"}';
        }

        $url = $cfg_secureAccess . $cfg_basehost;  //不支持小程序的，打开系统首页
        $msgData = '{"touser":"' . $conn . '", "template_id":"' . $tempid . '", "url":"' . $url . '", "miniprogram": '.$miniprogram.', "data": ' . $config . '}';
    }else{
        $msgData = '{"touser":"' . $conn . '", "template_id":"' . $tempid . '", "url":"' . $url . '", "data": ' . $config . '}';
    }

    //如果是招聘模块，则处理分站独立公众号配置逻辑
    if ($urlParam != null && is_array($urlParam) && $urlParam['service'] == 'zhaopin') {
        //解析跳转链接参数，根据不同的跳转内容，分别去不同的表查询对应的分站id，并形成对应的小程序跳转参数
        $_template = $urlParam['template'];
        $_id = (int)$urlParam['id'];
        if ($_template != null && $_id > 0) {
            $_tab = ''; //查询cityid的表
            if ($_template == 'company') {
                $_tab = 'zhaopin_company';
                $pagepath = 'pages/packages/zhaopin/companyDetail/companyDetail?id='.$_id;
            } elseif ($_template == 'postDetail') {
                $_tab = 'zhaopin_post';
                $pagepath = 'pages/packages/zhaopin/postDetail/postDetail?id='.$_id;
            } elseif ($_template == 'resume') {
                $_tab = 'zhaopin_resume';
                $pagepath = 'pages/packages/zhaopin/resumeDetail/resumeDetail?id='.$_id;
            //跳转个人中心
            } elseif ($_template == 'u_center') {
                //如果是求职者，就查询简历
                if ($urlParam['param'] == 'user_type=1') {
                    $_tab = 'zhaopin_resume';
                    $pagepath = 'pages/packages/zhaopin_center/zp_center/index/index?'.$urlParam['param'];
                //如果是企业
                } else if ($urlParam['param'] == 'user_type=2') {
                    $_tab = 'zhaopin_company';
                    $pagepath = 'pages/packages/zhaopin_center/zp_center/index/index?'.$urlParam['param'];
                }
            //跳转职位管理
            } elseif ($_template == 'b_manage-job') {
                $_tab = 'zhaopin_post';
                $pagepath = 'pages/packages/zhaopin_bcenter/zp_bcenter/manageJob/manageJob';
            //跳转简历点明细
            } elseif ($_template == 'b_jld-list') {
                $_tab = 'zhaopin_company';
                $pagepath = 'pages/packages/zhaopin_bcenter/zp_bcenter/jldList/jldList';
            //跳转推广金明细
            } elseif ($_template == 'b_tgj-list') {
                $_tab = 'zhaopin_company';
                $pagepath = 'pages/packages/zhaopin_bcenter/zp_bcenter/tgjList/tgjList';
            //跳转招聘会详情
            } elseif ($_template == 'jobfair') {
                $_tab = 'zhaopin_fair';
                $pagepath = 'pages/packages/zhaopin/jobFairDetail/jobFairDetail?id='.$_id;
            }

            //查询分站的cityid
            $_cityid = 0;
            if ($_tab != null) {
                $sql = $dsql->SetQuery("SELECT `cityid` FROM `#@__".$_tab."` WHERE `id` = ".$_id);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret != null && is_array($ret)) {
                    $_cityid = (int)$ret[0]['cityid'];
                }
            }

            if ($_cityid > 0) {

                $pagepath .= (strstr($pagepath, '?') ? '&' : '?') . 'cityid='.$_cityid.'&cityname='.getSiteCityName($_cityid);

                //根据cityid查询分站绑定的独立公众号
                $wechatCityAdvancedConfig = getWechatCityAdvancedConfig('', $_cityid);
                if($wechatCityAdvancedConfig){
                    $cfg_wechatAppid = $wechatCityAdvancedConfig['appid'];
                    $cfg_wechatAppsecret = $wechatCityAdvancedConfig['appsecret'];
                }

                //根据cityid查询分站绑定的独立小程序
                global $cfg_miniProgramAppid;
                global $cfg_miniProgramAppid_msg;
                $appid = $cfg_miniProgramAppid_msg ? $cfg_miniProgramAppid_msg : $cfg_miniProgramAppid;
                $weminiCityAdvancedConfig = getMiniProgramCityAdvancedConfig('', $_cityid);
                if($weminiCityAdvancedConfig){
                    //已经绑定了公众号的，才会用独立小程序的APPID
                    $bindWechat = (int)$weminiCityAdvancedConfig['bindWechat'];
                    if($bindWechat){
                        $appid = $weminiCityAdvancedConfig['appid'];
                    }
                }

                //查询模板id是否有配置对应的分站模板id，有就进行替换
                if ($urlParam['moban'] != null) {
                    $sql = $dsql->SetQuery("SELECT `wechat_city_tempid` FROM `#@__site_notify` WHERE `title` = '".$urlParam['moban']."'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret != null && is_array($ret)) {
                        $wechat_city_tempid = json_decode($ret[0]['wechat_city_tempid'],true);
                        if (isset($wechat_city_tempid[$_cityid]) && $wechat_city_tempid[$_cityid] != null) {
                            $tempid = $wechat_city_tempid[$_cityid];
                        }
                    }
                }

                //查询用户在该分站是否有独立的openid
                if ($urlParam['uid'] != null) {
                    $sql = $dsql->SetQuery("SELECT `openid` FROM `#@__member_wechat_subscribe` WHERE `cityid` = ".$_cityid." AND `userid` = ".$urlParam['uid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret != null && is_array($ret)) {
                        $conn = $ret[0]['openid'];
                    }
                }
            }

            //重新生成接口请求的数据
            $miniprogram = '{"appid":"'.$appid.'","pagepath":"'.$pagepath.'"}';
            $msgData = '{"touser":"' . $conn . '", "template_id":"' . $tempid . '", "url":"' . $url . '", "miniprogram": '.$miniprogram.', "data": ' . $config . '}';
        }
    }

    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
    $token = $jssdk->getAccessToken();


    // $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$cfg_wechatAppid&secret=$cfg_wechatAppsecret";
    // $ch = curl_init($url);
    // curl_setopt($ch, CURLOPT_HEADER, 0);
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    // curl_setopt($ch, CURLOPT_POST, 0);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    // curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    // $output = curl_exec($ch);
    // curl_close($ch);
    // if(empty($output)){
    //  return '{"state": 200, "info": "Token获取失败，请检查微信开发者帐号配置信息！"}';
    // }
    // $result = json_decode($output, true);
    // if(isset($result['errcode'])) {
    //  return '{"state": 200, "info": "'.$result['errcode']."：".$result['errmsg'].'"}';
    // }
    //
    // $token = $result['access_token'];

    //发送模板消息
    $url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=$token";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $msgData);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $output = curl_exec($ch);
    curl_close($ch);
    if (empty($output)) {
        return '{"state": 200, "info": "请求失败，请稍候重试！"}';
    }
    $result = json_decode($output, true);
    if (isset($result['errcode']) && $result['errmsg'] != 'ok') {

        if(HUONIAOBUG){
            require_once HUONIAOROOT."/api/payment/log.php";
            $_wechatLog= new CLogFileHandler(HUONIAOROOT.'/log/wechat/'.date('Y-m-d').'.log');
            $_wechatLog->DEBUG("微信模板消息发送错误日志");
            $_wechatLog->DEBUG("原始数据：".$_config);
            $_wechatLog->DEBUG("发送数据：".$msgData);
            $_wechatLog->DEBUG("微信返回：".json_encode($result, JSON_UNESCAPED_UNICODE) . "\r\n\r\n");
        }

        return '{"state": 200, "info": "' . getWechatMsgErrCode($result['errcode']) . '"}';
    }

    return '{"state": 100, "info": "发送成功！"}';
}


//根据返回码取中文说明
function getWechatMsgErrCode($code){
    $info = "未知错误！";
    switch ($code) {
        case -1:
            $info = "系统繁忙";
            break;
        case 0:
            $info = "请求成功";
            break;
        case 40001:
            $info = "验证失败";
            break;
        case 40002:
            $info = "不合法的凭证类型";
            break;
        case 40003:
            $info = "不合法的OpenID";
            break;
        case 40004:
            $info = "不合法的媒体文件类型";
            break;
        case 40005:
            $info = "不合法的文件类型";
            break;
        case 40006:
            $info = "不合法的文件大小";
            break;
        case 40007:
            $info = "不合法的媒体文件id";
            break;
        case 40008:
            $info = "不合法的消息类型";
            break;
        case 40009:
            $info = "不合法的图片文件大小";
            break;
        case 40010:
            $info = "不合法的语音文件大小";
            break;
        case 40011:
            $info = "不合法的视频文件大小";
            break;
        case 40012:
            $info = "不合法的缩略图文件大小";
            break;
        case 40013:
            $info = "不合法的APPID";
            break;
        case 41001:
            $info = "缺少access_token参数";
            break;
        case 41002:
            $info = "缺少appid参数";
            break;
        case 41003:
            $info = "缺少refresh_token参数";
            break;
        case 41004:
            $info = "缺少secret参数";
            break;
        case 41005:
            $info = "缺少多媒体文件数据";
            break;
        case 41006:
            $info = "access_token超时";
            break;
        case 42001:
            $info = "需要GET请求";
            break;
        case 43002:
            $info = "需要POST请求";
            break;
        case 43003:
            $info = "需要HTTPS请求";
            break;
        case 44001:
            $info = "多媒体文件为空";
            break;
        case 44002:
            $info = "POST的数据包为空";
            break;
        case 44003:
            $info = "图文消息内容为空";
            break;
        case 45001:
            $info = "多媒体文件大小超过限制";
            break;
        case 45002:
            $info = "消息内容超过限制";
            break;
        case 45003:
            $info = "标题字段超过限制";
            break;
        case 45004:
            $info = "描述字段超过限制";
            break;
        case 45005:
            $info = "链接字段超过限制";
            break;
        case 45006:
            $info = "图片链接字段超过限制";
            break;
        case 45007:
            $info = "语音播放时间超过限制";
            break;
        case 45008:
            $info = "图文消息超过限制";
            break;
        case 45009:
            $info = "接口调用超过限制";
            break;
        case 46001:
            $info = "不存在媒体数据";
            break;
        case 47001:
            $info = "解析JSON/XML内容错误";
            break;
    }
    return $info;
}


/**
 * APP推送消息
 * @param $uid     会员id
 * @param $title   消息标题
 * @param $body    消息内容
 * @param $url     跳转地址
 * @param $music   音效
 * @param $all     是否推送所有设备
 */
function sendapppush($uid, $title, $body, $url = "", $music = "default", $all = false, $im = array()){
    global $dsql;
    global $cfg_basehost;
    global $cfg_secureAccess;
    global $cfg_basedomain;
    $body = strip_tags($body);

    if (!$all && (!$uid || $uid < 1)) return;

    if(!$all && $music != "peisongordercancel" && $music != "newfenpeiorder" && $music != "paotuidaiqiang" && $music != "newfenpeiorderShop" && $music != "newshoporder" && $music != "shopordercancel" && $music != 'readymeal' && $music != 'deliverytimeout' && $music != 'readymealtimeout'){
        //是否登录设备s
        $sourceclientAll = '';
        $iosSend = $androidSend = false;
        $sql = $dsql->SetQuery("SELECT `sourceclient` FROM `#@__member`  WHERE `id` = $uid");
        $res = $dsql->dsqlOper($sql, "results");
        if($res[0]['sourceclient']){
            $sourceclientAll = unserialize($res[0]['sourceclient']);
            foreach ($sourceclientAll as $key => $value) {
                $val = strtolower($value['type']);
                if (preg_match("/android|mini|mobile|mobi|Nokia|Symbian/", $val)) {
                    $androidSend = true;
                }
                if(preg_match("/iphone|ios|iPod|iPad|/", $val)){
                    $iosSend = true;
                }
            }
        }
        //是否登录设备e
        $msgnum = 0;
        //查询会员未读消息数量
        $sql    = $dsql->SetQuery("SELECT log.`id` FROM `#@__member_letter_log` log LEFT JOIN `#@__member_letter` l ON l.`id` = log.`lid` WHERE log.`state` = 0 AND l.`type` = 0 AND log.`uid` = $uid");
        $unread = (int)$dsql->dsqlOper($sql, "totalCount");

        $archives = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__public_up` WHERE `isread` = 0 and `uid` = " . $uid);
        $upunread = (int)$dsql->getOne($archives);

        //评论未读
        $where_  = " AND `userid` = '$uid'";
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment` WHERE `ischeck` = 1" . $where_);
        $ret = $dsql->dsqlOper($sql, "results");
        $sidList = array();
        foreach ($ret as $k => $v) {
            array_push($sidList, $v['id']);
        }
        if (!empty($sidList)) {
            $whereC = " AND  (`sid` in(" . join(',', $sidList) . ") or (`masterid` = '$uid' AND `sid` = '0'))";
        } else {
            $whereC = " AND  `masterid` = '$uid' AND `sid` = '0'";
        }

        $archives = $dsql->SetQuery("SELECT count(`id`) FROM `#@__public_comment` WHERE `isread` = 0 " . $whereC);
        $commentunread = (int)$dsql->getOne($archives);

        $_im = 0;
        require_once(HUONIAOINC . '/class/SendRequest_.class.php');
        $handels = new handlers("siteConfig", "getImFriendList");
        $return  = $handels->getHandle(array("userid" => $uid, "type" => "temp", "tongji" => 1));
        if($return['state'] == 100){
            foreach ($return['info'] as $key => $value) {
                $_im += (int)$value['lastMessage']['unread'];
            }
        }

        $msgnum  = $unread + $upunread + $commentunread + $_im;
    }else{
        $iosSend = $androidSend = true;
    }

    //查询推送配置
    $platform = $android_access_id = $android_access_key = $android_secret_key = $android_package_activity = $ios_access_id = $ios_access_key = $ios_secret_key = "";
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_push_config` LIMIT 0, 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data = $ret[0];
        $platform = $data['platform'];
        $android_access_id = $data['android_access_id'];
        $android_access_key = $data['android_access_key'];
        $android_secret_key = $data['android_secret_key'];
        $android_package_activity = $data['android_package_activity'];
        $ios_access_id = $data['ios_access_id'];
        $ios_access_key = $data['ios_access_key'];
        $ios_secret_key = $data['ios_secret_key'];


        //配送员版
        if ($music == "peisongordercancel" || $music == "newfenpeiorder" || $music == "paotuidaiqiang" || $music == "newfenpeiorderShop" || $music == 'readymeal' || $music == 'deliverytimeout') {

            $url = empty($url) ? $cfg_secureAccess . $cfg_basehost . "/?service=waimai&do=courier&state=4,5" : $url;

            if($music == "peisongordercancel"){
                $url = '';
            }
            $android_access_id = $data['peisong_android_access_id'];
            $android_access_key = $data['peisong_android_access_key'];
            $android_secret_key = $data['peisong_android_secret_key'];
            $android_package_activity = $data['peisong_android_package_activity'];

            $ios_access_id = $data['peisong_ios_access_id'];
            $ios_access_key = $data['peisong_ios_access_key'];
            $ios_secret_key = $data['peisong_ios_secret_key'];

            $music_android = $cfg_basedomain . '/static/audio/app/' . $music . '.mp3';

        } //商家版
        elseif ($music == "shopordercancel" || $music == "newshoporder" || $music == "readymealtimeout") {
            $android_access_id = $data['business_android_access_id'];
            $android_access_key = $data['business_android_access_key'];
            $android_secret_key = $data['business_android_secret_key'];
            $android_package_activity = $data['business_android_package_activity'];

            $ios_access_id = $data['business_ios_access_id'];
            $ios_access_key = $data['business_ios_access_key'];
            $ios_secret_key = $data['business_ios_secret_key'];

            if ($music == "shopordercancel") {
                $music = "peisongordercancel";
            } else if ($music == "newshoporder") {
                $music = "newwaimaiorder";
            }

            //$music = $music == "shopordercancel" ? "peisongordercancel" : "newwaimaiorder";

            $music_android = $cfg_basedomain . '/static/audio/app/' . $music . '.mp3';
        }

    }

    $music = $music == 'newfenpeiorderShop' ? 'newfenpeiorder' : $music;  //临时用外卖，苹果端音乐文件不存在导致闪退，下个版本升级后恢复 by gz 20210511

    $music = strtolower($music);


    // 初始化日志
    require_once HUONIAOROOT."/api/payment/log.php";
    $_apppushLog= new CLogFileHandler(HUONIAOROOT.'/log/apppush/'.date('Y-m-d').'.log');



    //友盟推送
    if ($platform == "umeng") {
        require_once(HUONIAOINC . '/class/push/umeng/AndroidCustomizedcast.php');
        require_once(HUONIAOINC . '/class/push/umeng/IOSCustomizedcast.php');

        //安卓推送
        if($androidSend){
            $customizedcast = new AndroidCustomizedcast();
            $customizedcast->setAppMasterSecret($android_secret_key);
            $customizedcast->setPredefinedKeyValue("appkey", $android_access_key);
            $customizedcast->setPredefinedKeyValue("timestamp", strval(time()));
            if(!$all){
                $customizedcast->setPredefinedKeyValue("alias", $uid);
                $customizedcast->setPredefinedKeyValue("alias_type", "userID");
            }
            $customizedcast->setPredefinedKeyValue("ticker", $title);
            $customizedcast->setPredefinedKeyValue("title", $title);
            $customizedcast->setPredefinedKeyValue("text", $body);
            $customizedcast->setPredefinedKeyValue("after_open", "go_app");
            $customizedcast->setExtraField("url", $url);
            if($im){
                foreach ($im as $key => $value) {
                    $customizedcast->setExtraField($key, $value);
                }
            }
            $customizedcast->send();
        }

        //ios推送
        if($iosSend){
            $customizedcast = new IOSCustomizedcast();
            $customizedcast->setAppMasterSecret($ios_secret_key);
            $customizedcast->setPredefinedKeyValue("appkey", $ios_access_key);
            $customizedcast->setPredefinedKeyValue("timestamp", strval(time()));
            if(!$all){
                $customizedcast->setPredefinedKeyValue("alias", $uid);
                $customizedcast->setPredefinedKeyValue("alias_type", "userID");
            }
            $customizedcast->setPredefinedKeyValue("alert", $body);
            $customizedcast->setPredefinedKeyValue("badge", $msgnum);
            $customizedcast->setPredefinedKeyValue("sound", "chime");
            $customizedcast->setPredefinedKeyValue("production_mode", "false");
            $customizedcast->setCustomizedField("url", $url);
            if($im){
                foreach ($im as $key => $value) {
                    // $customizedcast->setExtraField($key, $value);
                }
            }
            $customizedcast->send();
        }

        //阿里云推送
    } elseif ($platform == "aliyun") {
        include_once HUONIAOINC . '/class/push/aliyun/PushRequest.php';


        // ------------------------------android
        if($androidSend){
            $iClientProfile = DefaultProfile::getProfile("cn-hangzhou", $android_access_id, $android_secret_key);
            if($iClientProfile){
                $client = new DefaultAcsClient($iClientProfile);
                $request = new PushRequest();

                // 推送目标
                $request->setAppKey($android_access_key);
                if($all){
                    $request->setTarget("ALL");
                    $request->setTargetValue("ALL");
                }else{
                    $request->setTarget("ACCOUNT"); //推送目标: DEVICE:推送给设备; ACCOUNT:推送给指定帐号,TAG:推送给自定义标签; ALL: 推送给全部
                    $request->setTargetValue($uid); //根据Target来设定，如Target=device, 则对应的值为 设备id1,设备id2. 多个值使用逗号分隔.(帐号与设备有一次最多100个的限制)
                }
                $request->setDeviceType("ANDROID"); //设备类型 ANDROID iOS ALL.
                $request->setPushType("NOTICE"); //消息类型 MESSAGE NOTICE
                $request->setTitle($title); // 消息的标题
                $request->setBody($body); // 消息的内容

                // 推送配置: Android
                $request->setAndroidNotifyType("BOTH");//通知的提醒方式 "VIBRATE" : 震动 "SOUND" : 声音 "BOTH" : 声音和震动 NONE : 静音
                $request->setAndroidNotificationBarType(1);//通知栏自定义样式0-100
                $request->setAndroidNotificationChannel("huoniao");
                $request->setAndroidMusic($music_android);//Android通知音乐

                $request->setAndroidNotificationVivoChannel("1");  //设置vivo通知类型的classification，需要在vivo平台申请

                $params = array(
                    "music" => $music_android,
                    "url" => $url,
                    "badge" => $msgnum
                );
                if($im && is_array($im)){
                    $request->setAndroidOpenType("NONE");//点击通知后动作 "APPLICATION" : 打开应用 "ACTIVITY" : 打开AndroidActivity "URL" : 打开URL "NONE" : 无跳转
                    foreach ($im as $key => $value) {
                        $params[$key] = $value;
                    }
                }else{
                    $request->setAndroidOpenType("NONE");//点击通知后动作 "APPLICATION" : 打开应用 "ACTIVITY" : 打开AndroidActivity "URL" : 打开URL "NONE" : 无跳转
                }
                $request->setAndroidExtParameters(json_encode($params)); // 设定android类型设备通知的扩展属性设定android类型设备通知的扩展属性

                // 设置辅助弹窗打开Activity
                $request->setAndroidPopupActivity($android_package_activity);
                // 设置辅助弹窗通知标题
                $request->setAndroidPopupTitle($title);
                // 设置辅助弹窗通知内容
                $request->setAndroidPopupBody($body);
                // 离线消息保存
                $request->setStoreOffline(true);

                $response = $client->getAcsResponse($request);

                $_apppushLog->DEBUG("Android推送结果：" . json_encode($response));
            }
        }


        // ------------------------------ios
        if($iosSend){
            $iClientProfile_ios = DefaultProfile::getProfile("cn-hangzhou", $ios_access_id, $ios_secret_key);
            if($iClientProfile_ios){
                $client = new DefaultAcsClient($iClientProfile_ios);
                $request = new PushRequest();

                // 推送目标
                $request->setAppKey($ios_access_key);
                if($all){
                    $request->setTarget("ALL");
                    $request->setTargetValue("ALL");
                }else{
                    $request->setTarget("ACCOUNT"); //推送目标: DEVICE:推送给设备; ACCOUNT:推送给指定帐号,TAG:推送给自定义标签; ALL: 推送给全部
                    $request->setTargetValue($uid); //根据Target来设定，如Target=device, 则对应的值为 设备id1,设备id2. 多个值使用逗号分隔.(帐号与设备有一次最多100个的限制)
                }
                $request->setDeviceType("iOS"); //设备类型 ANDROID iOS ALL.
                $request->setPushType("NOTICE"); //消息类型 MESSAGE NOTICE
                $request->setTitle($title); // 消息的标题
                $request->setBody($body); // 消息的内容

                // 推送配置: iOS
                $request->setiOSSilentNotification("false");//是否开启静默通知
                $request->setiOSMusic($music . ".m4a"); // iOS通知声音
                $request->setiOSBadge($msgnum); // iOS应用图标右上角角标
                $request->setiOSApnsEnv("PRODUCT");//iOS的通知是通过APNs中心来发送的，需要填写对应的环境信息。"DEV" : 表示开发环境 "PRODUCT" : 表示生产环境
                $request->setiOSRemind("false"); // 推送时设备不在线（既与移动推送的服务端的长连接通道不通），则这条推送会做为通知，通过苹果的APNs通道送达一次(发送通知时,Summary为通知的内容,Message不起作用)。注意：离线消息转通知仅适用于生产环境
                $request->setiOSRemindBody("iOSRemindBody");//iOS消息转通知时使用的iOS通知内容，仅当iOSApnsEnv=PRODUCT && iOSRemind为true时有效

                $params = array(
                    "url" => $url
                );
                if($im && is_array($im)){
                    foreach ($im as $key => $value) {
                        $params[$key] = $value;
                    }
                }
                $request->setiOSExtParameters(json_encode($params)); //自定义的kv结构,开发者扩展用 针对iOS设备

                $response = $client->getAcsResponse($request);

                $_apppushLog->DEBUG("iOS推送结果：" . json_encode($response));
            }
        }

    }

    $arr = array(
        "uid" => $uid,
        "title" => $title,
        "body" => $body,
        "url" => $url,
        "music" => $music,
        "msgnum" => $msgnum,
        // "android_access_id" => $android_access_id,
        // "android_secret_key" => $android_secret_key,
        "android_access_key" => $android_access_key,
        // "ios_access_id" => $ios_access_id,
        // "ios_secret_key" => $ios_secret_key,
        "ios_access_key" => $ios_access_key,
    );
    $str = [];
    foreach ($arr as $key => $value) {
        array_push($str, $key . " : " . $value);
    }
    $_apppushLog->DEBUG("\r" . join("\r\n", $str) . "\r\n\r\n");

}


/**
 * 创建支付中转页面
 * @param $service  所属频道
 * @param $ordernum 订单号
 * @param $price    订单金额
 * @param $paytype  支付方式
 * @return html
 */
function createPayForm($service, $ordernum, $price, $paytype, $subject, $param = array(),$createtype = 0){
    global $qr;
    global $quickpay;
    global $cfg_ucenterLinks;
    $cfg_ucenterLinks = is_array($cfg_ucenterLinks) ? $cfg_ucenterLinks : explode(',', $cfg_ucenterLinks);
    if(strstr($subject, '打赏') && !in_array('reward', $cfg_ucenterLinks)) die('系统未开启打赏功能！');

    //修复APP端重复发起问题
    if($_REQUEST['app'] && !isApp() && !isWxMiniprogram()){
        die('APP请求错误！');
    }
    if (!empty($service) && !empty($ordernum) && (!empty($price) || (empty($price) && $createtype == 1)) && (!empty($paytype) || !empty($qr) || $createtype == 1)) {

        global $cfg_shortname;
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $siteCityName = $siteCityInfo ? $siteCityInfo['name'] : '';
        $siteCityid = $siteCityInfo ? $siteCityInfo['cityid'] : 0;

        $paytype = explode("$", $paytype);
        $paycode = $paytype[0];
        $bank = empty($paytype[1]) || $paytype[1] == null ? '' : $paytype[1];

        $paymentFile = HUONIAOROOT . "/api/payment/$paycode/$paycode.php";
        //验证支付类文件是否存在
        if ((!$qr && file_exists($paymentFile)) || $qr || $createtype == 1) {
            if(!$qr && $createtype == 0){
                require_once($paymentFile);
                $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = '$paycode' AND `state` = 1");
                $payment = $dsql->dsqlOper($archives, "results");
            }
            if ($payment || $qr || $createtype == 1) {

                if(!$qr && $createtype == 0){
                    $pay_config = unserialize($payment[0]['pay_config']);
                    $paymentArr = array();

                    //验证配置
                    foreach ($pay_config as $key => $value) {
                        if (!empty($value['value'])) {
                            $paymentArr[$value['name']] = $value['value'];
                        }
                    }
                }

                if (!empty($paymentArr) || $qr || $createtype == 1) {
                    //   global $autoload;
                    //   $autoload = true;

                    if(!$qr && $createtype == 0){
                        $pay = new $paycode();
                        $order = array();
                    }

                    //如果订单号有多个，需要重新生成支付订单号  by: guozi  20170711
                    if (strstr($ordernum, ",")) {

                        $order_sn = create_ordernum();

                        $paramurl = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "order",
                            "module"   => $service
                        );
                        $orderurl   = getUrlPath($paramurl);

                    } else {

                        $order_sn = $ordernum;

                        if($param['url'] && (is_array($param['url']) || $param['url'] == 'stay')){
                            $orderurl = $param['url'] == 'stay' ? 'stay' : getUrlPath($param['url']);
                        }

                        if(!$orderurl){
                            $orderurl = orderDetailUrl($service,$ordernum);
                        }
                    }

                    $order['service'] = $service;
                    $order['order_amount'] = sprintf('%.2f', $price);
                    $order['order_sn'] = $order_sn;
                    $order['subject'] = $subject;
                    $order['bank'] = $bank;
                    $order['ordernum'] = $ordernum;
                    $order['orderurl'] = $orderurl;

                    //判断是否使用了积分抵扣，如果使用了，则取消服务商特约商户的收款能力，因为会涉及到分账问题，有积分抵扣，分账时情况比较复杂，暂时做强制取消。
                    $usePoint = $_REQUEST['usePinput'] ? 1 : 0;
                    
                    $sql = $dsql->SetQuery("SELECT `usePoint` FROM `#@__pay_log` WHERE `ordernum` = '$order_sn'");
                    $results = $dsql->dsqlOper($sql, "results");
                    if($results){
                        $usePoint = (int)$results[0]['usePoint'];
                    }

                    if($paycode== 'wxpay' && isWxMiniprogram()){ //增加微信小程序支付标识
                       $order['wxmini_payment'] = 1; 
                    }

                    if ($paycode == 'allinpay_wxpay' && (isWxMiniprogram() || isApp())) { //通联支付-微信小程序
                        $order['wxmini_payment'] = 1;
                    }

                    if($paycode == 'wxpay' && !$usePoint){
                        $order['submchid'] = getWxpaySubMchid($service, $order_sn,0);  //根据模块和订单号，获取微信特约商户号
                    }
                    if($paycode == 'alipay' && !$usePoint){
                        $alipaySubMchInfo = getWxpaySubMchid($service, $order_sn,1);  //根据模块和订单号，获取支付宝商家pid和应用授权令牌
                        $order['alipay_pid'] = $alipaySubMchInfo['alipay_pid'];
                        $order['alipay_app_auth_token'] = $alipaySubMchInfo['alipay_app_auth_token'];
                    }
                    if($paycode == 'huoniao_bonus'){
                        global $userLogin;
                        $userid = $userLogin->getMemberID();
                        $biusid = $userLogin->getMemberInfo($userid);
                        $busiId = $biusid['busiId'] ? $biusid['busiId'] : 0;
                        $order['busiId'] = getWxpaySubMchid($service, $order_sn,1);  //根据模块和订单号，获取商家id
                        if ($order['busiId'] == $busiId && $service == 'business') {
                            echo json_encode(array('state' => 101, 'info' => '禁止在自己店铺消费!'));
                            die;
                        }
                    }

                    //向数据库插入记录
                    $userid = $userLogin->getMemberID();
                    $userid = $userid == -1 ? ($param['userid'] ? $param['userid'] : 0) : $userid;

                    //删除当前订单没有支付的历史记录
                    $sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 0");
                    $dsql->dsqlOper($sql, "update");


                    //如果需要获取微信小程序的openid
                    if($_GET['wxmini_code'] && isWxMiniprogram()){

                        global $cfg_miniProgramAppid;
                        global $cfg_miniProgramAppsecret;

                        //根据用户信息获取 openid和unionid
                        $url = "https://api.weixin.qq.com/sns/jscode2session?appid=".$cfg_miniProgramAppid."&secret=".$cfg_miniProgramAppsecret."&js_code=".$_GET['wxmini_code']."&grant_type=authorization_code";

                        $curl = curl_init();
                        curl_setopt($curl,CURLOPT_URL,$url);
                        curl_setopt($curl,CURLOPT_HEADER,0);
                        curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
                        curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);//证书检查
                        $result = curl_exec($curl);
                        curl_close($curl);

                        $data = json_decode($result);
                        $data = objtoarr($data);

                        //失败
                        if(isset($data['errcode'])){
                            die("获取用户信息失败，ErrCode:" . $data['errcode'] . "，ErrMsg:" . $data['errmsg']);
                        }

                        $miniProgram_openid = $data['openid'];

                        //更新用户的小程序openid
                        $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_mini_openid` = '$miniProgram_openid' WHERE `id` = $userid");
                        $dsql->dsqlOper($sql, "update");

                    }


                    //会员付款、外卖单独配置
                    if ($service == "member" || $service == "waimai" || $param) {
                        $ordernum = serialize($param);
                    }

                    /*有奖了乐购退款订单*/

                    $where = '';
                    if ($service == "awardlegou" && $param ){
                        $ordernum = $param['trueordernum'];
                        $where = ' AND `body` = '.$ordernum;
                    }

                    $param_data = serialize($order);

                    // 删除一小时未付款的支付记录
                    $time = time() - 3600;
                    $sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `state` = 0 AND `pubdate` < $time");
                    $dsql->dsqlOper($sql, "update");

                    //验证订单号是否已经存在
                    $sql = $dsql->SetQuery("SELECT `id`,`paytype`,`amount` FROM `#@__pay_log` WHERE `ordernum` = '$order_sn' $where");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!$ret){
                        $date = GetMkTime(time());
                        $paytypecharge = countPayTypeCharge($paycode,$price);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`cityid`, `ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`, `param_data`,`pt_charge`, `usePoint`) VALUES ('$siteCityid', '$service', '$order_sn', '$userid', '$ordernum', '$price', '$paycode', 0, $date, '$param_data',$paytypecharge, '$usePoint')");
                        $dsql->dsqlOper($archives, "results");
                    }else{
                        $logpaytype = $ret[0]['paytype'];
                        if($logpaytype != $paycode){
                            $updatesql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `paytype` = '$paycode' WHERE  `ordernum` = '$order_sn'");
                            $dsql->dsqlOper($updatesql, "update");
                        }
                        $amount= $ret[0]['amount'];
                        $paytypecharge = countPayTypeCharge($paycode,$amount);
                        // if($amount != $price){
                            $updatesql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$price', `param_data` = '$param_data',`pt_charge`=$paytypecharge WHERE  `ordernum` = '$order_sn'");
                            $dsql->dsqlOper($updatesql, "update");
                        // }

                    }


                    if ($qr || $createtype == 1) {
                        return $order;
                    }else{

                        if ($paycode == 'wxpay' && isMobile() && !isWeixin() && !isApp()) {
                           /*是手机不是微信内*/
                            $returnjson = 1;
                            if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtoupper($_SERVER['HTTP_X_REQUESTED_WITH'])=='XMLHTTPREQUEST' && $_GET['service'] == 'live'){
                                $returnjson = 0;
                            }
                            return $pay->get_code($order, $paymentArr,$returnjson);
                        }
                        elseif(isApp()){
                            $returnjson = 0;
                            if((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtoupper($_SERVER['HTTP_X_REQUESTED_WITH'])=='XMLHTTPREQUEST') || ($_REQUEST['app'] && $_GET['service'] != 'live')){
                                $returnjson = 1;
                            }

                            //老页面兼容，直接跳走，不需要返回json数据
                            if($_GET['sync']){
                                $returnjson = 0;
                            }
                            return $pay->get_code($order, $paymentArr,$returnjson);
                        }
                        elseif(isWeixin()){
                            $returnjson = 0;
                            if(($_REQUEST['app'] && isWxMiniprogram()) || $_REQUEST['platform_name'] || $quickpay){
                                if((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtoupper($_SERVER['HTTP_X_REQUESTED_WITH'])=='XMLHTTPREQUEST') || $_REQUEST['app'] || $_REQUEST['platform_name'] || $quickpay){
                                    $returnjson = 1;
                                }
                            }
                            if($returnjson){
                                return $pay->get_code($order, $paymentArr,$returnjson);
                            }else{
                                echo $pay->get_code($order, $paymentArr,$returnjson);
                            }
                        }
                        else{
                            $returnjson = 0;
                            if((isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtoupper($_SERVER['HTTP_X_REQUESTED_WITH'])=='XMLHTTPREQUEST') || $quickpay){
                                $returnjson = 1;
                            }
                            if($returnjson){
                                return $pay->get_code($order, $paymentArr,$returnjson,$param);
                            }else{
                                echo $pay->get_code($order, $paymentArr,$returnjson,$param);
                            }
                        }

                    }
                    die;

                } else {
                    die("配置错误，请联系管理员000！");
                }


            } else {
                die("支付方式不存在，001！");
            }

        } else {
            die("支付方式不存在，002！");
        }


    } else {
        die("配置错误，请联系管理员003！");
    }

}


/**
 * 数组排序
 * @param $arrays     要操作的数组
 * @param $sort_key   指定的键值
 * @param $sort_order 排列顺序  SORT_ASC、SORT_DESC
 * @param $sort_type  排序类型  SORT_REGULAR、SORT_NUMERIC、SORT_STRING
 * @return array
 */
function array_sortby($arrays, $sort_key, $sort_order = SORT_ASC, $sort_type = SORT_NUMERIC){
    if (is_array($arrays)) {
        foreach ($arrays as $array) {
            if (is_array($array)) {
                $key_arrays[] = $array[$sort_key];
            } else {
                return false;
            }
        }
    } else {
        return false;
    }

    array_multisort($key_arrays, $sort_order, $sort_type, $arrays);
    return $arrays;
}


/**
 * 拼接运费详细
 * @param $bearFreight           是否包邮 0：自定义  1：免费
 * @param $valuation             计价方式 0：按件  1：按重量  2：按体积
 * @param $express_start         默认运费几件以内
 * @param $express_postage       默认运费
 * @param $express_plus          递增数量
 * @param $express_postageplus   递增费用
 * @param $preferentialStandard  超过数量免费
 * @param $preferentialMoney     超过费用免费
 * @return string
 */
function getPriceDetail($bearFreight, $valuation, $express_start, $express_postage, $express_plus, $express_postageplus, $preferentialStandard, $preferentialMoney, $logisticId = 0){
    global $dsql;
    $ret = "";
    $currency = echoCurrency(array("type" => "short"));

    global $langData;

    if ($bearFreight == 0) {

        $val = "";
        switch ($valuation) {
            case 0:
                $val = $langData['siteConfig'][21][10];  //件
                break;
            case 1:
                $val = "kg";
                break;
            case 2:
                $val = "m³";
                break;
        }

        $express_start = !$valuation ? (int)$express_start : $express_start;
        $express_plus = !$valuation ? (int)$express_plus : $express_plus;

        $ret = $langData['siteConfig'][19][325] . "：" . $express_start . $val . $langData['siteConfig'][21][11] . $express_postage . $currency;   //运费     内

        if ($express_plus > 0) {
            $ret .= "，" . $langData['siteConfig'][21][12] . $express_plus . $val . "，" . $langData['siteConfig'][21][13] . $express_postageplus . $currency;   //每增加      加
        }

        if ($preferentialStandard > 0 && $preferentialMoney > 0) {
            $ret .= "（" . $langData['siteConfig'][21][14] . $preferentialStandard . $val . "，" . $langData['siteConfig'][21][15] . $preferentialMoney . $currency . $langData['siteConfig'][21][16] . "）";   //满     并且满     免邮费
        } elseif ($preferentialStandard > 0) {
            $ret .= "（" . $langData['siteConfig'][21][14] . $preferentialStandard . $val . $currency . $langData['siteConfig'][21][16] . "）";   //满    免邮费
        } elseif ($preferentialMoney > 0) {
            $ret .= "（" . $langData['siteConfig'][21][14] . $preferentialMoney . $currency . $langData['siteConfig'][21][16] . "）";   //满     免邮费
        }

    } else {
        if($logisticId){
            $archives   = $dsql->SetQuery("SELECT `note` FROM `#@__shop_logistictemplate` WHERE `id` = $logisticId");
            $ret        = $dsql->dsqlOper($archives, "results");
            if($ret){
                $ret = $ret[0]['note'];
            }else{
                $ret = $langData['siteConfig'][21][16];    //免邮费
            }
        }else{
            $ret = $langData['siteConfig'][21][16];    //免邮费
        }
    }
    return $ret;
}



/**
 * 合并订单运费，一个订单只需要一次运费
 * @param $data : 订单信息  参考：shop.controller confirm-order
 * @return array  array('店铺ID' => 运费, '店铺ID' => 运费)
 */
function  orderLogistic($config,$addridarr,$addressid = 0){     //之前的版本
    global $dsql;
    $logisticArr = array();

    //先将同一店铺相册运费模板的数据分离

    $logistictem = array();
    if ($addressid != 0) {

        $archives = $dsql->SetQuery("SELECT `lng`,`lat` FROM `#@__member_address` WHERE  `id` = '".(int)$addressid."'");
        $userAddr = $dsql->dsqlOper($archives, "results");

        $lng = $userAddr&&is_array($userAddr) ? $userAddr[0]['lng'] : '';
        $lat = $userAddr&&is_array($userAddr) ? $userAddr[0]['lat'] : '';
    }
    foreach ($config as $key => $val){
        /*这里用的是老版本的计算距离方式 考虑到新版还要请求接口耗时*/
        $juli     = oldgetDistance($lng,$lat,$val['lng'],$val['lat'])/1000;
        $logistictem[$val['sid']] = $juli;
        foreach ($val['list'] as $k => $v){
//            $logisticArr[$val['sid']][$v['logisticId']][] = $v;
            $logisticArr[$val['sid']][] = $v;
        }
    }

    foreach ($logisticArr as $key => $val){

        $logistic = 0;
        foreach ($val as $k => $v){
            $price = $count = $volume = $weight = 0;

            $bearFreight = 0;
            $valuation = 0;
            $express_start = 0;
            $express_postage = 0;
            $express_plus = 0;
            $express_postageplus = 0;
            $preferentialStandard = 0;
            $preferentialMoney = 0;

//            $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `id` = $k");
//            $ret = $dsql->dsqlOper($archives, "results");
//            if($ret){
//                $value = $ret[0];
//                $bearFreight = $value["bearFreight"];
//                $valuation = $value["valuation"];
//                $express_start = $value["express_start"];
//                $express_postage = $value["express_postage"];
//                $express_plus = $value["express_plus"];
//                $express_postageplus = $value["express_postageplus"];
//                $preferentialStandard = $value["preferentialStandard"];
//                $preferentialMoney = $value["preferentialMoney"];
//            }
//
//            $arr = array(
//                'bearFreight' => $bearFreight,
//                'valuation' => $valuation,
//                'express_start' => $express_start,
//                'express_postage' => $express_postage,
//                'express_plus' => $express_plus,
//                'express_postageplus' => $express_postageplus,
//                'preferentialStandard' => $preferentialStandard,
//                'preferentialMoney' => $preferentialMoney,
//            );

            $archives = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE `id` = '".(int)$v['logisticId']."'");
            $ret      = $dsql->dsqlOper($archives, "results");

            $addrid = 0;
            $devspecification = array();
            if ($ret) {
                $devspecification = !empty($ret[0]['devspecification'])? unserialize($ret[0]['devspecification']) : array();

                if(empty($devspecification)){
                    $deliveryarea = array();
                    $deliveryarea[0]['cityid']              = '';
                    $deliveryarea[0]['express_start']       = $ret[0]['express_start'];
                    $deliveryarea[0]['express_postage']     = $ret[0]['express_postage'];
                    $deliveryarea[0]['express_plus']        = $ret[0]['express_plus'];
                    $deliveryarea[0]['express_postageplus'] = $ret[0]['express_postageplus'];
                    $deliveryarea[0]['area']                = '默认全国';

                    $devspecification['deliveryarea']       = $deliveryarea;
                    $devspecification['valuation']          = $ret[0]['valuation'];

                }
                if(array_key_exists('nospecify',$devspecification) && $addridarr && $devspecification['opennospecify'] == 1 ){

                    $cityid = array_column($devspecification['nospecify'],"cityid");

                    $cityidarr = !empty($cityid) ? join(',',$cityid)  : '' ;


                    $nocityid = $cityidarr!='' ? explode(',',$cityidarr): array();
                    foreach ($addridarr as $a => $b){

                        if(!in_array($b,$nocityid)){
                            $addrid = $b;
                            break;
                        }else{

                            $addrid = $addridarr[0];
                        }
                    }

                }else{
                    $addrid =  $addridarr[0];
                }

            }
            $price  = $v['price'];
            $count  = $v['count'];
            $volume = $v['volume'];
            $weight = $v['weight'];
            $logistic += getLogisticPrice($devspecification, $price, $count, $volume, $weight,$addrid,(int)$v['proid'],(float)$logistictem[$key]);
        }
        $data[$key] = $logistic;
    }
    return $data;
}


/**
 * 更新htaccess静态规则文件
 */
function updateHtaccess(){
    return false;
}


//Geetest 极验验证码验证
function verifyGeetest($challenge, $validate, $seccode, $type = "pc"){
    global $cfg_geetest;
    global $cfg_geetest_id;
    global $cfg_geetest_key;
    global $userLogin;

    $cfg_geetest = (int)$cfg_geetest;  //0关闭  1极验  2阿里云

    if(!$cfg_geetest) return '{"status":"fail"}';

    $userid = $userLogin->getMemberID();

    global $handler;
    $handler = false;

    //苹果原生APP端没有接入阿里云，这里强制用极验
    if(isIOSApp() && $validate && $seccode){
        $cfg_geetest = 1;
    }

    //极验
    if($cfg_geetest == 1){
        $GtSdk = new geetestlib($cfg_geetest_id, $cfg_geetest_key);

        //服务器正常
        if ($userid >= -1) {
            $result = $GtSdk->success_validate($challenge, $validate, $seccode, $userid);
            if ($result) {
                return '{"status":"success"}';
            } else {
                return '{"status":"fail"}';
            }
        } else {  //服务器宕机,走failback模式
            if ($GtSdk->fail_validate($challenge, $validate, $seccode)) {
                return '{"status":"success"}';
            } else {
                return '{"status":"fail"}';
            }
        }
    }
    //阿里云
    elseif($cfg_geetest == 2){

        return verifyAliyunCaptcha($challenge);
        
    }


}


//aliyun 阿里云验证码
function verifyAliyunCaptcha($data = ''){

    // global $handler;
    // $handler = false;
    global $cfg_geetest;  //0关闭  1极验  2阿里云
    global $cfg_geetest_AccessKeyID;
    global $cfg_geetest_AccessKeySecret;

    $cfg_geetest = (int)$cfg_geetest;
    if($cfg_geetest != 2) return '{"status":"fail"}';

    $config = array(
        "accessKeyId" => $cfg_geetest_AccessKeyID,
        "accessKeySecret" => $cfg_geetest_AccessKeySecret,
        "endpoint" => "captcha.cn-shanghai.aliyuncs.com",
        'captchaVerifyParam' => $data
    );

    $aliyunCaptcha = new aliyunCaptcha();
    $ret = $aliyunCaptcha->main($config);
    
    if($ret['state'] == 100){
        return '{"status":"success"}';
    }else{
        return '{"status":"fail"}';
    }

}


//更新APP配置文件
function updateAppConfig(){

    global $dsql;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cfg_webname;
    global $cfg_description;
    global $cfg_shortname;
    global $cfg_wechatName;
    global $cfg_wechatQr;
    global $cfg_miniProgramName;
    global $cfg_miniProgramId;
    global $cfg_miniProgramQr;
    global $cfg_lang;
    global $cfg_smsLoginState;
    global $cfg_regstatus;
    global $cfg_miniProgramBindPhone;
    global $cfg_qiandao_state;
    global $cfg_sitePageGray;    //页面变灰
    global $cfg_useWxMiniProgramLogin;  //使用微信原生登录
    global $cfg_miniProgramLocationAuth;  //获取当前位置接口权限
    global $cfg_iosVirtualPaymentState;
    global $cfg_iosVirtualPaymentTip;
    global $cfg_memberVerified;
    global $cfg_timeZone;  //时区
    global $cfg_server_wx;
    global $cfg_server_wxQr;
    global $cfg_miniProgramShippingManage; //小程序收货管理
    
    $cfg_timeZoneName = date_default_timezone_get();

    $cfg_sitePageGray = (int)$cfg_sitePageGray;

    $language = $cfg_lang ? $cfg_lang : 'zh-CN';

    //引导页
    $android_guide = array();
    $ios_guide = array();

    //广告
    $ad_pic = $ad_link = $ad_time = $ad_TencentGDT_android_app_id = $ad_TencentGDT_android_placement_id = "";

    //登录
    $qq_appid = $qq_appkey = $wechat_appid = $wechat_appsecret = $sina_akey = $sina_skey = "";
    $umeng_phoneLoginState = 0;

    //APP配置参数
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data = $ret[0];

        $ios_shelf = $data['ios_shelf'];
        $android = $data['android_guide'];
        $ios = $data['ios_guide'];
        $android_index = $data['android_index'];
        $ios_index = $data['ios_index'];
        $ios_test = $data['ios_test'];
        $ios_test_1 = $data['ios_test_1'];
        $ios_test_2 = $data['ios_test_2'];
        $map_baidu_android = $data['map_baidu_android'];
        $map_baidu_ios = $data['map_baidu_ios'];
        $map_google_android = $data['map_google_android'];
        $map_google_ios = $data['map_google_ios'];
        $map_amap_android = $data['map_amap_android'];
        $map_amap_ios = $data['map_amap_ios'];
        $map_set = $data['map_set'];
        $peisong_map_baidu_android = $data['peisong_map_baidu_android'];
        $peisong_map_baidu_ios = $data['peisong_map_baidu_ios'];
        $peisong_map_google_android = $data['peisong_map_google_android'];
        $peisong_map_google_ios = $data['peisong_map_google_ios'];
        $peisong_map_amap_android = $data['peisong_map_amap_android'];
        $peisong_map_amap_ios = $data['peisong_map_amap_ios'];
        $peisong_map_set = $data['peisong_map_set'];
        $business_noticeCount = (int)$data['business_noticeCount'];
        $peisong_noticeCount = (int)$data['peisong_noticeCount'];
        $disagreePrivacy = (int)$data['disagreePrivacy'];

        $appname = $data['appname'];
        $subtitle = $data['subtitle'];
        $app_logo = getFilePath($data['logo']);
        $wx_appid = $data['wx_appid'];
        $URLScheme_Android = $data['URLScheme_Android'];
        $URLScheme_iOS = $data['URLScheme_iOS'];

        //安卓引导页
        if (!empty($android)) {
            $androidArr = explode(",", $android);
            foreach ($androidArr as $key => $value) {
                array_push($android_guide, getFilePath($value));
            }
        }

        //IOS引导页
        if (!empty($ios)) {
            $iosArr = explode(",", $ios);
            foreach ($iosArr as $key => $value) {
                array_push($ios_guide, getFilePath($value));
            }
        }

        $ad_pic = $data['ad_pic'] ? getFilePath($data['ad_pic']) : "";
        $ad_link = $data['ad_link'];
        $ad_time = $data['ad_time'];
        $ad_TencentGDT_android_app_id = $data['ad_TencentGDT_android_app_id'];
        $ad_TencentGDT_android_placement_id = $data['ad_TencentGDT_android_placement_id'];

        //安装包信息
        $android_version = $data['android_version'];
        $android_update = $data['android_update'];
        $android_force = $data['android_force'];
        $android_size = $data['android_size'];
        $android_note = str_replace("\r\n", '\r\n', $data['android_note']);
        $ios_version = $data['ios_version'];
        $ios_update = $data['ios_update'];
        $ios_force = $data['ios_force'];
        $ios_note = str_replace("\r\n", '\r\n', $data['ios_note']);
        $harmony_version = $data['harmony_version'];
        $harmony_update = $data['harmony_update'];
        $harmony_force = $data['harmony_force'];
        $harmony_size = $data['harmony_size'];
        $harmony_note = str_replace("\r\n", '\r\n', $data['harmony_note']);

        $android_download = $data['android_download'];
        $ios_download = $data['ios_download'];
        $harmony_download = $data['harmony_download'];

        $business_android_version = $data['business_android_version'];
        $business_android_update = $data['business_android_update'];
        $business_android_force = $data['business_android_force'];
        $business_android_size = $data['business_android_size'];
        $business_android_note = str_replace("\r\n", '\r\n', $data['business_android_note']);
        $business_ios_version = $data['business_ios_version'];
        $business_ios_update = $data['business_ios_update'];
        $business_ios_force = $data['business_ios_force'];
        $business_ios_note = str_replace("\r\n", '\r\n', $data['business_ios_note']);
        $business_android_download = $data['business_android_download'];
        $business_ios_download = $data['business_ios_download'];
        $peisong_android_version = $data['peisong_android_version'];
        $peisong_android_update = $data['peisong_android_update'];
        $peisong_android_force = $data['peisong_android_force'];
        $peisong_android_size = $data['peisong_android_size'];
        $peisong_android_note = str_replace("\r\n", '\r\n', $data['peisong_android_note']);
        $peisong_ios_version = $data['peisong_ios_version'];
        $peisong_ios_update = $data['peisong_ios_update'];
        $peisong_ios_force = $data['peisong_ios_force'];
        $peisong_ios_note = str_replace("\r\n", '\r\n', $data['peisong_ios_note']);
        $peisong_android_download = $data['peisong_android_download'];
        $peisong_ios_download = $data['peisong_ios_download'];
        $rongKeyID = $data['rongKeyID'];
        $rongKeySecret = $data['rongKeySecret'];
        $umeng_phoneLoginState = (int)$data['umeng_phoneLoginState'];

        //模板风格
        $template = $data['template'];
    }

    //登录配置参数
    $sql = $dsql->SetQuery("SELECT `code`, `config` FROM `#@__site_loginconnect`");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        foreach ($ret as $key => $value) {
            $config = unserialize($value['config']);

            $configArr = array();
            foreach ($config as $k => $v) {
                $configArr[$v['name']] = $v['value'];
            }

            //QQ
            if ($value['code'] == 'qq') {
                $qq_appid = $configArr['app_appid'];
                $qq_appkey = $configArr['app_appkey'];

                //微信
            } elseif ($value['code'] == 'wechat') {
                $wechat_appid = $configArr['appid_app'];
                $wechat_appsecret = $configArr['appsecret_app'];

                //新浪
            } elseif ($value['code'] == 'sina') {
                $sina_akey = $configArr['akey_app'];
                $sina_skey = $configArr['skey_app'];
            }
        }
    }

    //推送
    $android_access_id = $android_access_key = $android_secret_key = $ios_access_id = $ios_access_key = $ios_secret_key = "";
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_push_config` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data = $ret[0];

        $android_access_id = $data['android_access_id'];
        $android_access_key = $data['android_access_key'];
        $android_secret_key = $data['android_secret_key'];
        $ios_access_id = $data['ios_access_id'];
        $ios_access_key = $data['ios_access_key'];
        $ios_secret_key = $data['ios_secret_key'];

        $business_android_access_id = $data['business_android_access_id'];
        $business_android_access_key = $data['business_android_access_key'];
        $business_android_secret_key = $data['business_android_secret_key'];
        $business_ios_access_id = $data['business_ios_access_id'];
        $business_ios_access_key = $data['business_ios_access_key'];
        $business_ios_secret_key = $data['business_ios_secret_key'];

        $peisong_android_access_id = $data['peisong_android_access_id'];
        $peisong_android_access_key = $data['peisong_android_access_key'];
        $peisong_android_secret_key = $data['peisong_android_secret_key'];
        $peisong_ios_access_id = $data['peisong_ios_access_id'];
        $peisong_ios_access_key = $data['peisong_ios_access_key'];
        $peisong_ios_secret_key = $data['peisong_ios_secret_key'];


    }

    $siteCityName = "";
    $siteCityInfoCookie = GetCookie('siteCityInfo');
    if($siteCityInfoCookie){
        $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
        if(is_array($siteCityInfoJson)){
            $siteCityInfo = $siteCityInfoJson;
            $siteCityName = $siteCityInfo['name'];
        }
    }

    //基本设置文件内容
    $customInc = "{";
    //基本设置
    $customInc .= "\"cfg_basehost\": \"" . $cfg_secureAccess . $cfg_basehost . "\",";
    $customInc .= "\"cfg_ios_index\": \"" . $ios_index . "\",";
    $customInc .= "\"cfg_ios_test\": \"" . $ios_test . "\",";
    $customInc .= "\"cfg_ios_test_1\": \"" . $ios_test_1 . "\",";
    $customInc .= "\"cfg_ios_test_2\": \"" . $ios_test_2 . "\",";
    $customInc .= "\"cfg_android_index\": \"" . $android_index . "\",";
    $customInc .= "\"cfg_ios_review\": \"" . $ios_shelf . "\",";
    $customInc .= "\"cfg_user_index\": \"" . getUrlPath(array("service" => "member", "type" => "user")) . "\",";
    $customInc .= "\"cfg_business_index\": \"" . getUrlPath(array("service" => "member")) . "\",";
    $customInc .= "\"cfg_webname\": " . json_encode(str_replace('$city', $siteCityName, stripslashes($cfg_webname)), JSON_UNESCAPED_UNICODE) . ",";
    $customInc .= "\"cfg_shortname\": " . json_encode(str_replace('$city', $siteCityName, stripslashes($cfg_shortname)), JSON_UNESCAPED_UNICODE) . ",";
    $customInc .= "\"cfg_wechatName\": \"" . $cfg_wechatName . "\",";
    $customInc .= "\"cfg_wechatQr\": \"" . getFilePath($cfg_wechatQr) . "\",";
    $customInc .= "\"cfg_miniProgramName\": \"" . $cfg_miniProgramName . "\",";
    $customInc .= "\"cfg_miniProgramId\": \"" . $cfg_miniProgramId . "\",";
    $customInc .= "\"cfg_miniProgramQr\": \"" . getFilePath($cfg_miniProgramQr) . "\",";
    $customInc .= "\"cfg_server_wx\": \"" . $cfg_server_wx . "\",";
    $customInc .= "\"cfg_server_wxQr\": \"" . getFilePath($cfg_server_wxQr) . "\",";
    $customInc .= "\"cfg_miniProgramShippingManage\": \"" . $cfg_miniProgramShippingManage . "\",";

    //商家功能开关
    $business_state = 1;  //0禁用  1启用
    $businessInc = HUONIAOINC . "/config/business.inc.php";
    if(file_exists($businessInc)){
        require($businessInc);
        $business_state = (int)$customBusinessState;  //配置文件中 0表示启用  1表示禁用  因为默认要开启商家功能
        $business_state = intval(!$business_state);
    }
    $customInc .= "\"cfg_business_state\": $business_state,";

    //用户信息，v8.0(2022.12.12)后不再支持获取用户昵称和头像，微信小程序登录需要强制获取手机号码
    //微信官方公告：https://developers.weixin.qq.com/community/develop/doc/00022c683e8a80b29bed2142b56c01
    // $customInc .= "\"cfg_miniProgramBindPhone\": \"" . (int)$cfg_miniProgramBindPhone . "\",";
    $customInc .= "\"cfg_miniProgramBindPhone\": \"1\",";
    $customInc .= "\"cfg_useWxMiniProgramLogin\": ".(int)$cfg_useWxMiniProgramLogin.",";

    $miniProgramLocationAuth = $cfg_miniProgramLocationAuth ? $cfg_miniProgramLocationAuth : 'chooseLocation';  //默认用chooseLocation
    $customInc .= "\"cfg_miniProgramLocationAuth\": \"" . $miniProgramLocationAuth . "\",";

    //iOS端虚拟支付功能
    $iosVirtualPaymentState = (int)$cfg_iosVirtualPaymentState;  //0启用  1禁用
    $iosVirtualPaymentTip = $cfg_iosVirtualPaymentTip ?: 'iOS端小程序不支持该功能';
    $customInc .= "\"cfg_iosVirtualPaymentState\": ".(int)$iosVirtualPaymentState.",";
    $customInc .= "\"cfg_iosVirtualPaymentTip\": \"".$iosVirtualPaymentTip."\",";

    $customInc .= "\"business_noticeCount\": \"" . $business_noticeCount . "\",";
    $customInc .= "\"peisong_noticeCount\": \"" . $peisong_noticeCount . "\",";
    $customInc .= "\"cfg_guide\": {";
    $customInc .= "\"android\": " . json_encode($android_guide) . ",";
    $customInc .= "\"ios\": " . json_encode($ios_guide) . "";
    $customInc .= "},";
    $customInc .= "\"cfg_rongcloud\": {";
    $customInc .= "\"id\": \"$rongKeyID\",";
    $customInc .= "\"secret\": \"$rongKeySecret\"";
    $customInc .= "},";
    $customInc .= "\"cfg_startad\": {";
    $customInc .= "\"time\": \"$ad_time\",";
    $customInc .= "\"src\": \"$ad_pic\",";
    $customInc .= "\"link\": \"$ad_link\",";
    $customInc .= "\"TencentGDT_android_app_id\": \"$ad_TencentGDT_android_app_id\",";
    $customInc .= "\"TencentGDT_android_placement_id\": \"$ad_TencentGDT_android_placement_id\"";
    $customInc .= "},";
    $customInc .= "\"cfg_umeng\": {";
    $customInc .= "\"android\": \"$android_access_key\",";
    $customInc .= "\"ios\": \"$ios_access_key\"";
    $customInc .= "},";
    $customInc .= "\"cfg_loginconnect\": {";
    $customInc .= "\"qq\": {";
    $customInc .= "\"appid\": \"$qq_appid\",";
    $customInc .= "\"appkey\": \"$qq_appkey\"";
    $customInc .= "},";
    $customInc .= "\"wechat\": {";
    $customInc .= "\"appid\": \"$wechat_appid\",";
    $customInc .= "\"appsecret\": \"$wechat_appsecret\"";
    $customInc .= "},";
    $customInc .= "\"sina\": {";
    $customInc .= "\"akey\": \"$sina_akey\",";
    $customInc .= "\"skey\": \"$sina_skey\"";
    $customInc .= "}";
    $customInc .= "},";

    //ios端适配
    $_template = $template == 'diy' ? '' : $template;

    $customInc .= "\"template\": \"$_template\",";
    $customInc .= "\"template_android\": \"$template\",";
    
    $customInc .= "\"language\": \"$language\",";
    $customInc .= "\"umeng_phoneLoginState\": \"0\",";
    // $customInc .= "\"umeng_phoneLoginState\": \"$umeng_phoneLoginState\",";
    $customInc .= "\"umeng_phoneLoginState_android\": \"$umeng_phoneLoginState\",";
    $customInc .= "\"disagreePrivacy\": \"$disagreePrivacy\",";
    $customInc .= "\"sitePageGray\": \"$cfg_sitePageGray\",";
    

    //此处只为信鸽配置，由于将推送换成了友盟，此处就不需要了  by: 20170621  guozi
    // $customInc .= "\"cfg_push\":{";
    // $customInc .= "\"android\":{";
    // $customInc .= "\"access_id\": \"$android_access_id\",";
    // $customInc .= "\"access_key\": \"$android_access_key\",";
    // $customInc .= "\"secret_key\": \"$android_secret_key\"";
    // $customInc .= "},";
    // $customInc .= "\"ios\":{";
    // $customInc .= "\"access_id\": \"$ios_access_id\",";
    // $customInc .= "\"access_key\": \"$ios_access_key\",";
    // $customInc .= "\"secret_key\": \"$ios_secret_key\"";
    // $customInc .= "}";
    // $customInc .= "},";

    $customInc .= "\"cfg_app_info\":{";
    // $customInc .= "\"portal\":{";
    $customInc .= "\"android\":{";
    $customInc .= "\"version\": \"$android_version\",";
    $customInc .= "\"update\": \"$android_update\",";
    $customInc .= "\"size\": \"$android_size\",";
    $customInc .= "\"note\": \"$android_note\",";
    $customInc .= "\"url\": \"$android_download\",";
    $customInc .= "\"force\": \"$android_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($android_update)."\"";
    $customInc .= "},";
    $customInc .= "\"ios\":{";
    $customInc .= "\"version\": \"$ios_version\",";
    $customInc .= "\"update\": \"$ios_update\",";
    $customInc .= "\"note\": \"$ios_note\",";
    $customInc .= "\"url\": \"$ios_download\",";
    $customInc .= "\"force\": \"$ios_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($ios_update)."\"";
    $customInc .= "},";
    $customInc .= "\"harmony\":{";
    $customInc .= "\"version\": \"$harmony_version\",";
    $customInc .= "\"update\": \"$harmony_update\",";
    $customInc .= "\"size\": \"$harmony_size\",";
    $customInc .= "\"note\": \"$harmony_note\",";
    $customInc .= "\"url\": \"$harmony_download\",";
    $customInc .= "\"force\": \"$harmony_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($harmony_update)."\"";
    $customInc .= "},";
    // $customInc .= "},";
    $customInc .= "\"business\":{";
    $customInc .= "\"android\":{";
    $customInc .= "\"version\": \"$business_android_version\",";
    $customInc .= "\"update\": \"$business_android_update\",";
    $customInc .= "\"size\": \"$business_android_size\",";
    $customInc .= "\"note\": \"$business_android_note\",";
    $customInc .= "\"url\": \"$business_android_download\",";
    $customInc .= "\"force\": \"$business_android_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($business_android_update)."\"";
    $customInc .= "},";
    $customInc .= "\"ios\":{";
    $customInc .= "\"version\": \"$business_ios_version\",";
    $customInc .= "\"update\": \"$business_ios_update\",";
    $customInc .= "\"note\": \"$business_ios_note\",";
    $customInc .= "\"url\": \"$business_ios_download\",";
    $customInc .= "\"force\": \"$business_ios_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($business_ios_update)."\"";
    $customInc .= "}";
    $customInc .= "},";
    $customInc .= "\"peisong\":{";
    $customInc .= "\"android\":{";
    $customInc .= "\"version\": \"$peisong_android_version\",";
    $customInc .= "\"update\": \"$peisong_android_update\",";
    $customInc .= "\"size\": \"$peisong_android_size\",";
    $customInc .= "\"note\": \"$peisong_android_note\",";
    $customInc .= "\"url\": \"$peisong_android_download\",";
    $customInc .= "\"force\": \"$peisong_android_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($peisong_android_update)."\"";
    $customInc .= "},";
    $customInc .= "\"ios\":{";
    $customInc .= "\"version\": \"$peisong_ios_version\",";
    $customInc .= "\"update\": \"$peisong_ios_update\",";
    $customInc .= "\"note\": \"$peisong_ios_note\",";
    $customInc .= "\"url\": \"$peisong_ios_download\",";
    $customInc .= "\"force\": \"$peisong_ios_force\",";
    $customInc .= "\"timestamp\": \"".getMktime($peisong_ios_update)."\"";
    $customInc .= "}";
    $customInc .= "},";
    $customInc .= "\"basic\":{";
    $customInc .= "\"name\": \"$appname\",";
    $customInc .= "\"subtitle\": \"$subtitle\",";
    $customInc .= "\"logo\": \"$app_logo\",";
    $customInc .= "\"wx_appid\": \"$wx_appid\",";
    $customInc .= "\"URLScheme_Android\": \"$URLScheme_Android\",";
    $customInc .= "\"URLScheme_iOS\": \"$URLScheme_iOS\"";
    $customInc .= "}";
    $customInc .= "},";

    //门户地图
    $map_current = "";
    if ($map_set == 1) {
        $map_current = "google";
    } elseif ($map_set == 2) {
        $map_current = "baidu";
    } elseif ($map_set == 3) {
        $map_current = "qq";
    } elseif ($map_set == 4) {
        $map_current = "amap";
    }
    $customInc .= "\"cfg_map_current\":\"$map_current\",";

    $customInc .= "\"cfg_map\":{";
    $customInc .= "\"baidu\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "},";
    $customInc .= "\"google\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "},";
    $customInc .= "\"amap\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "}";
    $customInc .= "},";

    //骑手地图
    $map_current = "";
    if ($peisong_map_set == 1) {
        $map_current = "google";
    } elseif ($peisong_map_set == 2) {
        $map_current = "baidu";
    } elseif ($peisong_map_set == 3) {
        $map_current = "qq";
    } elseif ($peisong_map_set == 4) {
        $map_current = "amap";
    }
    $customInc .= "\"peisong_map_current\":\"$map_current\",";

    $customInc .= "\"peisong_map\":{";
    $customInc .= "\"baidu\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "},";
    $customInc .= "\"google\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "},";
    $customInc .= "\"amap\":{";
    $customInc .= "\"android\": \"\",";
    $customInc .= "\"ios\": \"\"";
    $customInc .= "}";
    $customInc .= "},";

    global $cfg_geetest;
    $cfg_geetest = (int)$cfg_geetest;
    $cfg_geetest_ = $cfg_geetest ? 1 : 0;
    $customInc .= "\"cfg_geetest\": $cfg_geetest_,";  //0关闭  1极验  2阿里云
    $customInc .= "\"cfg_geetest_new\": $cfg_geetest,";  //0关闭  1极验  2阿里云

    //阿里云验证码
    global $cfg_geetest_prefix;
    global $cfg_geetest_web;
    global $cfg_geetest_h5;
    global $cfg_geetest_app;
    global $cfg_geetest_wxmini;
    
    $customInc .= "\"cfg_aliyun_captcha_prefix\": \"" . $cfg_geetest_prefix . "\",";
    $customInc .= "\"cfg_aliyun_captcha_web\": \"" . $cfg_geetest_web . "\",";
    $customInc .= "\"cfg_aliyun_captcha_h5\": \"" . $cfg_geetest_h5 . "\",";
    $customInc .= "\"cfg_aliyun_captcha_app\": \"" . $cfg_geetest_app . "\",";
    $customInc .= "\"cfg_aliyun_captcha_wxmini\": \"" . $cfg_geetest_wxmini . "\",";

    $customInc .= "\"cfg_smsLogin_state\": $cfg_smsLoginState,";
    $customInc .= "\"cfg_register_state\": $cfg_regstatus,";
    $customInc .= "\"cfg_qiandao_state\": $cfg_qiandao_state,";

    //积分名称
    global $cfg_pointName;
    $customInc .= "\"cfg_pointName\": \"" . $cfg_pointName . "\",";

    //消费金名称
    $configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
    $Payconfig= $dsql->dsqlOper($configPay, "results");
    $payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
    $customInc .= "\"cfg_bonusName\": \"" . $payname . "\",";

    global $huawei_privatenumber_state;  //是否启用隐私保护通话
    $huawei_privatenumber_state = (int)$huawei_privatenumber_state;
    $customInc .= "\"cfg_privateNumber_state\": $huawei_privatenumber_state,";

    global $cfg_payPhoneState;  //是否启用付费解锁电话
    global $cfg_payPhonePrice;  //付费解锁电话单次价格
    global $cfg_tencentGDT_app_id;  //优量汇激励广告媒体ID
    global $cfg_tencentGDT_placement_id;  //优量汇激励广告位ID
    global $cfg_payPhone_wxmini;  //微信小程序激励广告ID
    global $cfg_payPhone_entrance;  //付费查看广告入口  0显示  1关闭
    global $huawei_privatenumber_state;  //是否启用隐私保护通话

    $cfg_payPhoneState = (int)$cfg_payPhoneState;
    $cfg_payPhonePrice = (float)$cfg_payPhonePrice;
    $cfg_privatenumberState = (int)$huawei_privatenumber_state;
    $customInc .= "\"cfg_payPhoneState\": $cfg_payPhoneState,";
    $customInc .= "\"cfg_privatenumberState\": $cfg_privatenumberState,";
    
    //看广告解锁电话
    $payPhone_entrance = (int)$cfg_payPhone_entrance;
    $customInc .= "\"cfg_payPhone\": {";
    $customInc .= "\"payPhone_price\": $cfg_payPhonePrice,";
    $customInc .= "\"payPhone_entrance\": $payPhone_entrance,";
    $customInc .= "\"tencentGDP_app_id\": \"$cfg_tencentGDT_app_id\",";
    $customInc .= "\"tencentGDP_placement_id\": \"$cfg_tencentGDT_placement_id\",";
    $customInc .= "\"wxmini\": \"$cfg_payPhone_wxmini\"";
    $customInc .= "},";

    //视频上传开关
    global $cfg_videoUploadState;
    $videoUploadState = isset($cfg_videoUploadState) ? (int)$cfg_videoUploadState : 1;  //默认开启
    $customInc .= "\"cfg_videoUpload_state\": $videoUploadState,";

    //评论框提示文案
    global $cfg_commentPlaceholder;
    $commentPlaceholder = isset($cfg_commentPlaceholder) && $cfg_commentPlaceholder != '' ? $cfg_commentPlaceholder : '发条友善的评论~';
    $customInc .= "\"cfg_commentPlaceholder\": \"$commentPlaceholder\",";

    //协议
    $customInc .= "\"protocol\":{";
    $customInc .= "\"用户注册协议\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '会员注册协议')) . "\",";
    $customInc .= "\"隐私政策\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '隐私政策')) . "\",";
    $customInc .= "\"商家注册协议\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '商家注册协议', 'param' => 'from=wmsj')) . "\",";
    $customInc .= "\"商家隐私政策\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '商家隐私政策', 'param' => 'from=wmsj')) . "\",";
    $customInc .= "\"骑手注册协议\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '骑手注册协议', 'param' => 'from=wmsj')) . "\",";
    $customInc .= "\"骑手隐私政策\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '骑手隐私政策', 'param' => 'from=wmsj')) . "\",";
    $customInc .= "\"打赏须知\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '打赏须知')) . "\",";
    $customInc .= "\"房源发布及交易服务协议\": \"" . getUrlPath(array('service' => 'siteConfig', 'template' => 'protocol', 'title' => '房源发布及交易服务协议')) . "\"";
    $customInc .= "},";

    //货币单位
    global $currencyArr;
    $area_unit = array(
        'name' => $currencyArr['areaname'],
        'symbol' => $currencyArr['areasymbol']
    );
    unset($currencyArr['areaname']);
    unset($currencyArr['areasymbol']);
    $customInc .= "\"currency\": ".json_encode($currencyArr, JSON_UNESCAPED_UNICODE).",";
    $customInc .= "\"area_unit\": ".json_encode($area_unit, JSON_UNESCAPED_UNICODE).",";

    //海报分享信息
    global $cfg_shareTitle;
    global $cfg_shareDesc;

    //未设置分享标题和描述时，使用网站名称和seo描述
    $cfg_shareTitle = $cfg_shareTitle ? $cfg_shareTitle : $cfg_webname;
    $cfg_shareDesc = $cfg_shareDesc ? $cfg_shareDesc : $cfg_description;
    
    $share = array('title' => $cfg_shareTitle, 'description' => $cfg_shareDesc);
    $customInc .= "\"share\": ".json_encode($share, JSON_UNESCAPED_UNICODE).",";

    //原生模块
    //放在这里是因为H5端要跳原生时，APP端需要判断落地页是否使用了原生，比如从H5首页要跳到H5的分类信息的列表页，但是原生端默认是根据底部菜单判断的，直接打开分类页，并不知道模块是否启用了原生，所以需要提前告知APP哪些模块启用了原生
    $native_module = array();
    $wxmini_native_module = array();
    $dymini_native_module = array();

    //APP配置参数
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {

        //APP端
        $customBottomButton = $ret[0]['customBottomButton'] ? unserialize($ret[0]['customBottomButton']) : array();
        if($customBottomButton['app']){
            $customBottomButton = $customBottomButton['app'];
        }
        //如果没有数据，获取系统默认数据
        if(!$customBottomButton || 1 == 1){
            
            $moduleArr = array();
            array_push($moduleArr, array(
                'name' => 'business',
                'title' => '商家'
            ));
            array_push($moduleArr, array(
                'name' => 'siteConfig',
                'title' => '首页'
            ));

            $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {
                    if(!empty($value['name']) && $value['name'] != 'special' && $value['name'] != 'website'){
                        $moduleArr[] = array(
                            "name" => $value['name'],
                            "title" => $value['subject'] ? $value['subject'] : $value['title']
                        );
                    }
                }
            }
    
            $_data = array();
    
            $handels = new handlers('siteConfig', 'touchHomePageFooter');
            foreach($moduleArr as $key => $val){
                $return = $handels->getHandle(array('version' => '2.0', 'module' => $val['name'], 'platform' => 'android'));
                if($return['state'] == 100){
                    $buttonArr = $return['info'];
                    $_data[$val['name']] = $buttonArr;
                }
            }
            $customBottomButton = $_data;
        }
        if($customBottomButton){
            foreach($customBottomButton as $key => $val){
                if(is_array($val) && $val[0]['code']){
                    array_push($native_module, $key);
                }
            }
        }

        //微信小程序端
        $customBottomButton = $ret[0]['customBottomButton'] ? unserialize($ret[0]['customBottomButton']) : array();
        if($customBottomButton['wxmini']){
            $customBottomButton = $customBottomButton['wxmini'];
        }
        //如果没有数据，获取系统默认数据
        if(!$customBottomButton || 1 == 1){
            
            $moduleArr = array();
            array_push($moduleArr, array(
                'name' => 'business',
                'title' => '商家'
            ));
            array_push($moduleArr, array(
                'name' => 'siteConfig',
                'title' => '首页'
            ));

            $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {
                    if(!empty($value['name']) && $value['name'] != 'special' && $value['name'] != 'website'){
                        $moduleArr[] = array(
                            "name" => $value['name'],
                            "title" => $value['subject'] ? $value['subject'] : $value['title']
                        );
                    }
                }
            }
    
            $_data = array();
    
            $handels = new handlers('siteConfig', 'touchHomePageFooter');
            foreach($moduleArr as $key => $val){
                $return = $handels->getHandle(array('version' => '2.0', 'module' => $val['name'], 'platform' => 'wxmini'));
                if($return['state'] == 100){
                    $buttonArr = $return['info'];
                    $_data[$val['name']] = $buttonArr;
                }
            }
            $customBottomButton = $_data;
        }
        if($customBottomButton){
            foreach($customBottomButton as $key => $val){
                if(is_array($val) && $val[0]['miniPath']){
                    array_push($wxmini_native_module, $key);
                }
            }
        }

        //抖音小程序端
        $customBottomButton = $ret[0]['customBottomButton'] ? unserialize($ret[0]['customBottomButton']) : array();
        if($customBottomButton['dymini']){
            $customBottomButton = $customBottomButton['dymini'];
        }
        //如果没有数据，获取系统默认数据
        if(!$customBottomButton || 1 == 1){
            
            $moduleArr = array();
            array_push($moduleArr, array(
                'name' => 'business',
                'title' => '商家'
            ));
            array_push($moduleArr, array(
                'name' => 'siteConfig',
                'title' => '首页'
            ));

            $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {
                    if(!empty($value['name']) && $value['name'] != 'special' && $value['name'] != 'website'){
                        $moduleArr[] = array(
                            "name" => $value['name'],
                            "title" => $value['subject'] ? $value['subject'] : $value['title']
                        );
                    }
                }
            }
    
            $_data = array();
    
            $handels = new handlers('siteConfig', 'touchHomePageFooter');
            foreach($moduleArr as $key => $val){
                $return = $handels->getHandle(array('version' => '2.0', 'module' => $val['name'], 'platform' => 'wxmini'));
                if($return['state'] == 100){
                    $buttonArr = $return['info'];
                    $_data[$val['name']] = $buttonArr;
                }
            }
            $customBottomButton = $_data;
        }
        if($customBottomButton){
            foreach($customBottomButton as $key => $val){
                if(is_array($val) && $val[0]['miniPath']){
                    array_push($dymini_native_module, $key);
                }
            }
        }
    }

    $customInc .= "\"native_module\": " . json_encode($native_module) . ",";
    $customInc .= "\"wxmini_native_module\": " . json_encode($wxmini_native_module) . ",";
    $customInc .= "\"dymini_native_module\": " . json_encode($dymini_native_module) . ",";

    //会员中心链接
    global $cfg_ucenterLinks;
    $cfg_ucenterLinks = is_array($cfg_ucenterLinks) ? $cfg_ucenterLinks : explode(',', $cfg_ucenterLinks);
    $customInc .= "\"ucenterLinks\": " . json_encode($cfg_ucenterLinks) . ",";

    //时区
    $customInc .= "\"cfg_timeZone\": " . (int)$cfg_timeZone . ",";
    $customInc .= "\"cfg_timeZoneName\": \"" . $cfg_timeZoneName . "\",";

    //发布信息是否验证实名：1开启 2关闭
    $customInc .= "\"cfg_memberVerified\": " . (int)$cfg_memberVerified . ",";

    //安全域名
    $secureDomain = getSecureDomain();
    $customInc .= "\"cfg_secureDomain\": " . json_encode($secureDomain) . ",";

    //RSA公钥
    global $cfg_encryptPubkey;
    $encryptPubkey = str_replace(array("\r\n", "\r", "\n"), '\n', $cfg_encryptPubkey);
    $customInc .= "\"cfg_encryptPubkey\": \"" . $encryptPubkey . "\",";

    //城市分站分组类型
    global $cfg_sameAddr_group;
    global $cfg_auto_location;
    $cfg_auto_location = (int)$cfg_auto_location;
    $customInc .= "\"site_city_grouptype\": " . (int)$cfg_sameAddr_group . ",";
    $customInc .= "\"site_city_auto_location\": " . (int)!$cfg_auto_location . ",";

    //用户中心DIY模式开关
    global $cfg_userCenterTouchTemplateType;
    global $cfg_busiCenterTouchTemplateType;
    $cfg_userCenterDiy = (int)$cfg_userCenterTouchTemplateType;
    $cfg_busiCenterDiy = (int)$cfg_busiCenterTouchTemplateType;
    $customInc .= "\"cfg_userCenterDiy\": " . (int)$cfg_userCenterDiy . ",";
    $customInc .= "\"cfg_busiCenterDiy\": " . (int)$cfg_busiCenterDiy . ",";

    //区域级别名称
    global $cfg_areaName_0;
    global $cfg_areaName_1;
    global $cfg_areaName_2;
    global $cfg_areaName_3;
    global $cfg_areaName_4;
    global $cfg_areaName_5;

    $areaName_0 = $cfg_areaName_0 ?: '省份';
    $areaName_1 = $cfg_areaName_1 ?: '城市';
    $areaName_2 = $cfg_areaName_2 ?: '区县';
    $areaName_3 = $cfg_areaName_3 ?: '乡镇';
    $areaName_4 = $cfg_areaName_4 ?: '村庄';
    $areaName_5 = $cfg_areaName_5 ?: '自定义';

    $areaNameArr = array($areaName_0, $areaName_1, $areaName_2, $areaName_3, $areaName_4, $areaName_5);

    $customInc .= "\"site_areaname\": " . json_encode($areaNameArr, JSON_UNESCAPED_UNICODE) . ",";
    
    //商城配置中的展示商品类型
    $shopInc = HUONIAOINC . "/config/shop.inc.php";
    if(file_exists($shopInc)){
        require_once($shopInc);
        $customInc .= "\"shop_pagetype\": " . (int)$custom_huodongshoptypeopen . ",";
    }


    //系统分站数量
    $siteCityCount = 0;
    $siteConfigHandlers = new handlers("siteConfig", "config");
    $siteConfigConfig   = $siteConfigHandlers->getHandle();
    if($siteConfigConfig && $siteConfigConfig['state'] == 100){
        $config = $siteConfigConfig['info'];
        $siteCityCount = $config['siteCityCount'];
    }
    $customInc .= "\"site_city_count\": " . $siteCityCount . ",";

    //只有一个分站时，输出当前分站信息
    $siteCityInfo = array();
    if($siteCityCount == 1){
        $siteConfigHandlers = new handlers("siteConfig", "siteCity");
        $siteConfigConfig   = $siteConfigHandlers->getHandle();
        if($siteConfigConfig && $siteConfigConfig['state'] == 100){
            $config = $siteConfigConfig['info'];
            $siteCityInfo = $config[0];
        }
    }
    $customInc .= "\"site_city_info\": " . json_encode($siteCityInfo, JSON_UNESCAPED_UNICODE) . ",";

    //上传压缩配置
    global $cfg_imageCompress;
    global $cfg_videoCompress;
    $imageCompress = (int)$cfg_imageCompress;
    $videoCompress = (int)$cfg_videoCompress;
    $uploadCompress = array(
        'image_state' => $imageCompress,
        'video_state' => $videoCompress,
        'video_limit' => 20  //单位M，20M以内的不压缩
        // 'video_config' => array(
        //     'frame_rate' => '30',  //帧率
        //     'bit_rate' => '1000k',  //码率
        //     'audio_bit_rate' => '48k'  //音频码率
        // )
    );
    $customInc .= "\"upload_compress\": " . json_encode($uploadCompress) . "";


    $customInc .= "}";

    $customIncFile = HUONIAOROOT . "/api/appConfig.json";
    $fp = fopen($customIncFile, "w") or die('{"state": 200, "info": ' . json_encode("写入文件 $customIncFile 失败，请检查权限！") . '}');
    fwrite($fp, $customInc);
    fclose($fp);
}


/**
 * 根据指定表、指定ID获取相关信息
 * 根据指定区域ID，获取所在分站   使用方法：getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid, 'split' => '/', 'type' => 'typename', 'action' => 'addr'));
 * @return array
 */
function getPublicParentInfo($params){
    global $dsql;
    extract($params);
    if (empty($tab) || empty($id)) return;
    $currIndex = 0;
    $cityArr = array();

    $type = $type ? $type : "id";
    $split = $split ? $split : ",";

    $typeArr = getParentArr($tab, $id);

    global $data;
    $data = "";
    $typeIds = array_reverse(parent_foreach($typeArr, 'id'));

    global $data;
    $data = "";
    $arr = array_reverse(parent_foreach($typeArr, $type));

    //当action为area时，代表输出全部信息，不需要验证开通的城市
    if($action != 'area'){

        //此操作为了不让前台输出多余信息，比如开通了苏州分站，城市的详细信息只需要从苏州开始显示就可以了，不需要显示江苏
        $sql = $dsql->SetQuery("SELECT a.`id` cid FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` ORDER BY c.`id`");
        $result = $dsql->dsqlOper($sql, "results");
        if($result){
            foreach ($result as $key => $value) {
                array_push($cityArr, $value['cid']);
            }
        }

        foreach ($typeIds as $key => $value) {
            foreach ($cityArr as $k => $v) {
                if($v == $value){
                    $cityid = $value;
                    $currIndex = $key;
                }
            }
        }

    }
    if($returntype !=1){

        return join($split, array_slice($arr, $currIndex));
    }else{
        return $cityid;
    }

}


//输出货币标识
function echoCurrency($params, $smarty = array()){
    $type = $params['type'];

    global $currency_name;
    global $currency_short;
    global $currency_symbol;
    global $currency_code;

    global $currency_areaname;
    global $currency_areasymbol;

    $currency_name = !empty($currency_name) ? $currency_name : "人民币";
    $currency_short = !empty($currency_short) ? $currency_short : "元";
    $currency_symbol = !empty($currency_symbol) ? $currency_symbol : "¥";
    $currency_code = !empty($currency_code) ? $currency_code : "RMB";

    $currency_areaname   = !empty($currency_areaname) ? $currency_areaname : "平方米";
    $currency_areasymbol = !empty($currency_areasymbol) ? $currency_areasymbol : "㎡";

    if ($type == "name") {
        return $currency_name;
    } elseif ($type == "short") {
        return $currency_short;
    } elseif ($type == "symbol") {
        return $currency_symbol;
    } elseif ($type == "code") {
        return $currency_code;
    }elseif ($type == "areaname") {
        return $currency_areaname;
    }elseif ($type == "areasymbol") {
        return $currency_areasymbol;
    }
}


//根据模块标识获取模块名称
function getModuleTitle($params, $smarty = array()){
    global $dsql;

    $name = $params['name'];
    if (!empty($name)) {
        $sql = $dsql->SetQuery("SELECT `title`, `subject` FROM `#@__site_module` WHERE `name` = '$name'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret && is_array($ret)) {
            return $ret[0]['subject'] ? $ret[0]['subject'] : $ret[0]['title'];
        }
    }
}


//搜索记录
function siteSearchLog($module, $keyword){
    global $dsql;
    if (empty($module) || empty($keyword)) {
        return;
    }

    $cid = getCityId();
    $time = GetMkTime(time());

    //查询是否搜索过
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_search` WHERE `module` = '$module' AND `keyword` = '$keyword' AND `cityid` = '$cid'");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        //搜索过的增加搜索次数
        $sql = $dsql->SetQuery("UPDATE `#@__site_search` SET `count` = `count` + 1, `lasttime` = $time WHERE `module` = '$module' AND `keyword` = '$keyword' AND `cityid` = '$cid'");
        $dsql->dsqlOper($sql, "update");
    } else {
        //没有搜索过的新增记录
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_search` (`cityid`, `module`, `keyword`, `count`, `lasttime`) VALUES ('$cid', '$module', '$keyword', '1', $time)");
        $dsql->dsqlOper($sql, "update");
    }
}


//获取会员等级特权
function getMemberLevelAuth($level){
    global      $dsql;
    global      $cfg_fabuFreeCount;
    $level = (int)$level;
    $return = array();
    if (!$level){
        $return = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();
        return $return;
    }else{
        //验证是否合法
        $sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = $level");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $return = !empty($ret[0]['privilege']) ? unserialize($ret[0]['privilege']) : array();
        }
        return $return;
    }


}


//根据模块标识验证会员是否有权限
//type=userCenter时，判断会员类型，个人会员直接通过，企业会员则验证绑定模块
function verifyModuleAuth($params, $smarty = array()){
    global $dsql;
    global $userLogin;

    $now = time();
    $module = $params['module'];
    $type   = $params['type'];
    $userid = $userLogin->getMemberID();

    $userinfo = $userLogin->getMemberInfo();

    $userid = $userinfo['is_staff'] ==1 ? $userinfo['companyuid'] : $userid;

    $bind_module = array();
    if($userid != -1){

        // 不需要验证的模块
        if($module == "business" || $module == "huangye" || $module == "integral" || $module == "sfcar") return true;

        if($type == "userCenter"){
            $sql = $dsql->SetQuery("SELECT `mtype` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret[0]['mtype'] == 1){
                return true;
            }
        }

        $showModule = checkShowModule(array(), 'manage');
        if(isset($showModule[$module])){
            return true;
        }else{
            return false;
        }
    }

}


/**
 * @desc 根据两点间的经纬度计算距离 老版
 * @param float $lat 纬度值
 * @param float $lng 经度值
 */
function oldgetDistance($lng1, $lat1, $lng2, $lat2){ // 自动派单时的正确参数顺序

    if(!$lng1 || !$lat1 || !$lng2 || !$lat2) return;

    // function getDistance($lat1, $lng1, $lat2, $lng2){
    $earthRadius = 6367000; //approximate radius of earth in meters

    /*
       Convert these degrees to radians
       to work with the formula
     */

    $lat1 = (float)$lat1;
    $lng1 = (float)$lng1;
    $lat2 = (float)$lat2;
    $lng2 = (float)$lng2;

    $lat1 = ($lat1 * pi()) / 180;
    $lng1 = ($lng1 * pi()) / 180;

    $lat2 = ($lat2 * pi()) / 180;
    $lng2 = ($lng2 * pi()) / 180;

    /*
       Using the
       Haversine formula

       http://en.wikipedia.org/wiki/Haversine_formula

       calculate the distance
     */

    $calcLongitude = $lng2 - $lng1;
    $calcLatitude = $lat2 - $lat1;
    $stepOne = pow(sin($calcLatitude / 2), 2) + cos($lat1) * cos($lat2) * pow(sin($calcLongitude / 2), 2);
    $stepTwo = 2 * asin(min(1, sqrt($stepOne)));
    $calculatedDistance = $earthRadius * $stepTwo;

    return round($calculatedDistance);
}

/**
 * Notes: 新版接口返回距离计算
 * Ueser: Administrator
 * DateTime: 2021/10/22 17:20
 * Param1:
 * Param2:
 * Param3:
 * Return:
 */
function getDistance($lng1, $lat1, $lng2, $lat2){

    global $cronData;
    require_once HUONIAOROOT . "/api/payment/log.php";
    //初始化日志
    $_dituReport = new CLogFileHandler(HUONIAOROOT . '/log/ditu_qixing/' . date('Y-m-d') . '.log', true);
    $_dituReport->DEBUG("cronData:" . json_encode($cronData));
    $_dituReport->DEBUG("data:" . $lng1 .','. $lat1 .'    '. $lng2 .','. $lat2);

    global $cfg_map;
    $originlat      = $cfg_map != 1 && $lat1 > $lng1 ? $lng1 : $lat1;
    $originlng      = $cfg_map != 1 && $lng1 < $lat1 ? $lat1 : $lng1;
    $destinationlat = $cfg_map != 1 && $lat2 > $lng2 ? $lng2 : $lat2;
    $destinationlng = $cfg_map != 1 && $lng2 < $lat2 ? $lat2 : $lng2;
    if ($originlng == '' || $originlat == '' || $destinationlng == '' || $destinationlat == '') {
        return;
    }
    if ($cfg_map == 2 || $cfg_map == 'baidu') {
        $origin      = $originlat . "," . $originlng;
        $destination = $destinationlat . "," . $destinationlng;
        global $cfg_map_baidu_server;
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL,
            'http://api.map.baidu.com/directionlite/v1/riding?riding_type=1&origin=' . $origin . '&destination=' . $destination . '&ak=' . $cfg_map_baidu_server);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_TIMEOUT, 20);
        $con = curl_exec($curl);
        curl_close($curl);

        $_dituReport->DEBUG("DATA:" . $con . "\r\n");

        if ($con) {
            $con = json_decode($con, true);
            if ($con['status'] == 0) {
                $routes   = $con['result']['routes'];
                $duration = $routes['0']['duration'];
                $distance = $routes['0']['distance'];
            }

        }

        //高德
    } else {
        if ($cfg_map == 4 || $cfg_map == 'amap') {
            $origin      = $originlng . "," . $originlat;
            $destination = $destinationlng . "," . $destinationlat;
            global $cfg_map_amap_server;
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL,
                'https://restapi.amap.com/v5/direction/electrobike?origin=' . $origin . '&destination=' . $destination . '&key=' . $cfg_map_amap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $con = curl_exec($curl);
            curl_close($curl);

            if ($con) {
                $con = json_decode($con, true);
                if ($con['status'] == 1) {
                    $routes   = $con['route'];
                    $duration = $routes['paths'][0]['duration'];
                    $distance = $routes['paths'][0]['distance'];
                }
            }
        }

        //其他地图直接使用直线距离
        else{

            $distance = oldgetDistance($originlng, $originlat, $destinationlng, $destinationlat);

        }
    }
    if (!is_numeric($distance)) {
        $distance = 0;
    }

    //如果骑行距离为0，按直线距离计算
    if ($distance == 0 ) {
        $distance = oldgetDistance($originlng, $originlat, $destinationlng, $destinationlat);
    }

    return  floatval(sprintf('%.2f', $distance));

}


//打印
// pp 为强制打印，不需要验证是否开启自动打印外卖新订单选项
function printerWaimaiOrder($id, $pp = false){
    global $cfg_shortname;
    global $dsql;
    global $langData;
    global $userLogin;
    global $cfg_fenxiaoState;
    global $cfg_fenxiaoName;
    global $cfg_secureAccess;
    global $cfg_basehost;

    $date = GetMkTime(date("Y-m-d"));


    //消息通知
    $sql = $dsql->SetQuery("SELECT s.`id`, s.`shopname`, s.`smsvalid`, s.`sms_phone`, s.`auto_printer`, s.`showordernum`, s.`bind_print`, o.`state`, o.`ordernum`, o.`ordernumstore`, o.`food`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`amount`, o.`priceinfo`, o.`preset`, o.`note`, o.`pubdate`, o.`uid`,o.`ordertype`,o.`desk`,o.`selftime`,o.`reservesongdate` FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_order_all` o ON o.`sid` = s.`id` WHERE o.`id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data           = $ret[0];
        $shopid         = $data['id'];
        $shopname       = $data['shopname'];
        $smsvalid       = $data['smsvalid'];
        $sms_phone      = $data['sms_phone'];
        $auto_printer   = $data['auto_printer'];
        $showordernum   = $data['showordernum'];
        // $bind_print     = $data['bind_print'];
        // $print_config   = $data['print_config'];
        // $print_state    = $data['print_state'];

        $state          = $data['state'];
        $ordernum       = $data['ordernum'];
        $ordernumstore  = $data['ordernumstore'];
        $food           = unserialize($data['food']);
        $person         = $data['person'];
        $tel            = $data['tel'];
        $address        = $data['address'];
        $paytype        = $data['paytype'];
        $amount         = $data['amount'];
        $priceinfo      = unserialize($data['priceinfo']);
        $preset         = unserialize($data['preset']);
        $note           = $data['note'];
        $pubdate        = $data['pubdate'];
        $uid            = $data['uid'];
        $count          = explode("-", $ordernumstore);
        $count          = $showordernum ? $count[1] : 0;

        $desk           = $data['desk'];
        $selftime       = $data['selftime'];
        $ordertype      = $data['ordertype'];

        $reservesongdate = (int)$data['reservesongdate']; //预定配送时间


        //打印机查询(2020/4/28)
//        $printsql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shopprint` WHERE `sid` = ".$shopid);
//        $printret = $dsql->dsqlOper($printsql,"results");


        $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE `sid` = ".$shopid." AND `service` = 'waimai' ");
        $printret = $dsql->dsqlOper($printsql,"results");


        //分销商信息
        // $fxs = array();
        // $sql = $dsql->SetQuery("SELECT u.`uid` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` u ON u.`uid` = m.`from_uid` WHERE m.`id` = " . $uid);
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret && $cfg_fenxiaoState){
        //     $fxs_id = $ret[0]['uid'];
        //     $fxs = $userLogin->getMemberInfo($fxs_id);
        // }

        $fenxiaoshang = "";
        // if($fxs){
        //     $fenxiaoshang = "********************************\r";
        //     $fenxiaoshang .= $cfg_fenxiaoName . $langData['siteConfig'][3][17] . "：" . $fxs['phone'] . "\r";
        //     $fenxiaoshang .= $cfg_fenxiaoName . $langData['siteConfig'][19][4] . "：" . $fxs['person'] . "\r";
        // }
        //
        // $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = $shopid ORDER BY `id` ASC");
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //     $shopUserid = $ret[0]['userid'];
        //     $shopUserinfo = $userLogin->getMemberInfo($shopUserid);
        //
        //     $fenxiaoshang .= "********************************\r";
        //     $fenxiaoshang .= "店长手机：" . $shopUserinfo['phone'] . "\r";
        //     $fenxiaoshang .= "店长姓名：" . $shopUserinfo['person'];
        // }

        //货到付款     已付款
        $ktvippirce = 0;
        if ($priceinfo) {
            foreach ($priceinfo as $key => $value) {
                if($value['type'] == 'ktvip'){
                    $ktvippirce = floatval($value['amount']);
                }
            }
        }
        $amountInfo = $paytype == "delivery" ? $langData['siteConfig'][16][51] . "：" . (floatval($amount) - $ktvippirce) : $langData['siteConfig'][9][24] . "：" . (floatval($amount) - $ktvippirce);

        //短信通知
        if ($smsvalid && $sms_phone && !$pp) {
            sendsms($sms_phone, 1, "", "", false, false, "会员-商家新订单通知", array("title" => ""));
        }


        //微信通知买家
        if ($state == 3) {
            $foods = array();
            foreach ($food as $key => $value) {
                array_push($foods, $value['title'] . " " . $value['count'] . $langData['siteConfig'][21][17]);  //份
            }

            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "orderdetail",
                "module" => "waimai",
                "id" => $id
            );

            //自定义配置
            $config = array(
                "ordernum" => $shopname . $ordernumstore,
                "orderdate" => date("Y-m-d H:i:s", $pubdate),
                "orderinfo" => join(" ", $foods),
                "orderprice" => $amount,
                "fields" => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '下单时间',
                    'keyword3' => '订单详情',
                    'keyword4' => '订单金额'
                )
            );

            updateMemberNotice($uid, "会员-订单确认提醒",$param, $config,'','',0,1);
        }

        $shopUrl = getUrlPath(array('service' => 'waimai', 'template' => 'shop', 'id' => $shopid));

        $defaultPrintTemplate = array();
        include(HUONIAOINC . '/config/waimai.inc.php');
//        $defaultPrintTemplate = $customPrintTemplate;
//        $customPrintPlat = (int)$customPrintPlat; //打印机品牌  0易联云  1飞鹅
//        $defaultPrintTemplateArr = $customPrintTemplate ? unserialize($customPrintTemplate) : array();
//        if(!$defaultPrintTemplate){
//            $defaultPrintTemplate = '{"title":{"shopname":{"state":1,"style":"center h2w2"},"titlecustom":{"state":0,"style":"center line","value":"自定义文字"}},"info":{"ordernum":{"state":1,"style":""},"ordertime":{"state":1,"style":""},"orderaddress":{"state":1,"style":""},"orderpeople":{"state":1,"style":""},"ordertel":{"state":1,"style":"line"},"note":{"state":1,"style":"h2w2 line"}},"menu":{"menutitle":{"state":1,"style":""},"menulist":{"state":1,"style":"line h2w1"}},"price":{"pricelist":{"state":1,"style":"line"},"amount":{"state":1,"style":"h2w2 center"}},"footer":{"qr":{"state":0,"style":"mtop30"},"footercustom":{"state":0,"style":"center mtop20","value":"自定义文字"}}}';
//            $defaultPrintTemplateArr = json_decode($defaultPrintTemplate, true);
//        }
//
//        //初始化日志
//        require_once HUONIAOROOT . "/api/payment/log.php";
//        $_waimaiPrintLog = new CLogFileHandler(HUONIAOROOT . '/log/waimaiPrint'.$customPrintPlat.'/'.date('Y-m-d').'.log');
//
//        //易联云
//        if($customPrintPlat == 0){
//            require_once(HUONIAOINC . '/class/waimaiPrint.class.php');
//            $printClass = new waimaiPrint();
//
//        //飞鹅
//        }elseif($customPrintPlat == 1){
//            require_once(HUONIAOINC . '/class/HttpClient.class.php');
//            $printClass = new HttpClient('api.feieyun.cn', 80);
//        }


        //计算
        /*此处多台打印机*/
        // $picdayin =1;

        $picurl   ='';
        if($printret){
            foreach ($printret as $j => $l) {

                global $customPrintPlat;
                $sqlprint = $dsql->SetQuery("SELECT * FROM `#@__business_print` p  LEFT JOIN `#@__business_print_config` c ON p.`type` = c.`print_code` WHERE p.`id` = ".$l['printid']." ");
                $printresult = $dsql->dsqlOper($sqlprint,"results");
                //$customPrintPlat = $printresult[0]['print_code'] == 'yilianyun' ? 1 : 2;  //目前只有两种平台，易联云为1，其他为2

                //打印机扩展，开始以print_code来直接判断，不再用1和2
                $customPrintPlat = $printresult[0]['print_code'];

                $customPrintType =  $printresult[0]['printmodule'];
                $defaultPrintTemplateArr = $l['printtemplate'] ? unserialize($l['printtemplate']) : array();
                $printConfig = $printresult[0]['print_config'] ? unserialize($printresult[0]['print_config']) : array();
                $printConfigArr = array();
                //验证配置
                if(is_array($printConfig)){
                    foreach ($printConfig as $key => $value) {
                        if (!empty($value['value'])) {
                            $printConfigArr[$value['name']] = $value['value'];
                        }
                    }
                }
                
                //打印模板
                if(!$defaultPrintTemplateArr){
                    $defaultPrintTemplateArr = $printConfigArr['printTemplate'];
                }

                //初始化日志
                require_once HUONIAOROOT . "/api/payment/log.php";
                $_waimaiPrintLog = new CLogFileHandler(HUONIAOROOT . '/log/waimaiPrint_'.$customPrintPlat.'/'.date('Y-m-d').'.log', true);
                $_waimaiPrintLog->DEBUG(json_encode($food, JSON_UNESCAPED_UNICODE));

                //易联云
                if($customPrintPlat == 'yilianyun'){
                    require_once(HUONIAOINC . '/class/waimaiPrint.class.php');
                    $printClass = new waimaiPrint();

                    //飞鹅
                }elseif($customPrintPlat == 'feie'){
                    require_once(HUONIAOINC . '/class/HttpClient.class.php');
                    $printClass = new HttpClient('api.feieyun.cn', 80);
                }

//                if (($auto_printer || $pp) && $l['bind_print'] == 1 && (($l['print_state'] == 1 && $customPrintPlat == 0) || $customPrintPlat == 1)) {
                if (($auto_printer || $pp) && $customPrintPlat == 'yilianyun' || $customPrintPlat == 'feie' || $customPrintPlat == 'xpyun' || $customPrintPlat == 'trenditiot') {

                        if($customPrintType == 0) {

                        $printTemplate = $l['printtemplate'];  //小票自定义样式
                        $printTemplateArr = $printTemplate ? unserialize($printTemplate) : array();

                        //默认
                        if (empty($printTemplateArr) || !is_array($printTemplateArr)) {

                            $printTemplate = $defaultPrintTemplate;
                            $printTemplateArr = $defaultPrintTemplateArr;

                        }

                        $p_title = $printTemplateArr['title'];  //标题
                        $p_info = $printTemplateArr['info'];  //基础信息
                        $p_menu = $printTemplateArr['menu'];  //菜品信息
                        $p_price = $printTemplateArr['price'];  //结算信息
                        $p_footer = $printTemplateArr['footer'];  //底栏

                        $p_shopname = $p_title['shopname'];  //店铺名
                        $p_titlecustom = $p_title['titlecustom'];  //自定义文字

                        $p_ordernum = $p_info['ordernum'];  //订单号
                        $p_ordertime = $p_info['ordertime'];  //时间
                        $p_orderaddress = $p_info['orderaddress'];  //地址
                        $p_orderpeople = $p_info['orderpeople'];  //姓名
                        $p_ordertel = $p_info['ordertel'];  //电话
                        $p_note = $p_info['note'];  //备注

                        $p_menutitle = $p_menu['menutitle'];  //菜单表头
                        $p_menulist = $p_menu['menulist'];  //菜单内容

                        $p_pricelist = $p_price['pricelist'];  //费用明细
                        $p_amount = $p_price['amount'];  //实收合计

                        $p_qr = $p_footer['qr'];  //二维码
                        $p_footercustom = $p_footer['footercustom'];  //自定义文字


                        $num = "";
                        if ($count) {
                            $num = " #" . $count;
                        }

                        $desknote = "";
                        if ($ordertype == 1) {
                            $desknote = "\r(桌号:" . $desk . ")";
                        }

                        $selfnote = "";
                        if ($selftime != 0) {
                            $selfnote = "\n自取订单 (自取时间：" . date('Y-m-d H:i:s', $selftime) . ")";
                        }

                        //标题
                        $_title = '';
                        if ($p_shopname['state']) {
                            $titleCon = $shopname . $num . $desknote . $selfnote;
                            $_title .= printCustomStyle($p_shopname['style'], $titleCon);
                        }

                        if ($p_titlecustom['state']) {
                            $_title .= printCustomStyle($p_titlecustom['style'], $p_titlecustom['value']) . '\r';
                        }

                        //基础信息
                        $_info = '';

                        //订单号
                        if ($p_ordernum['state']) {
                            $_info .= printCustomStyle($p_ordernum['style'], $langData['siteConfig'][19][308] . '：' . $ordernumstore) . '\r';  //订单号
                        }

                        //时间
                        if ($p_ordertime['state']) {
                            $_info .= printCustomStyle($p_ordertime['style'], $langData['siteConfig'][19][384] . '：' . date("Y-m-d H:i:s", $pubdate)) . '\r';  //时间
                            //如果有预定时间，就显示出来
                            if ($reservesongdate > 0) {
                                $_info .= printCustomStyle($p_ordertime['style'], '预定时间' . '：' . date("Y-m-d H:i:s", $reservesongdate)) . '\r';
                            }
                        }
                        //地址
                        if ($p_orderaddress['state'] && $ordertype!=1) {
                            $_info .= printCustomStyle($p_orderaddress['style'], $langData['siteConfig'][19][9] . '：' . $address) . '\r';  //地址
                        }
                        //姓名
                        if ($p_orderpeople['state']&& $ordertype!=1) {
                            $_info .= printCustomStyle($p_orderpeople['style'], $langData['siteConfig'][19][4] . '：' . $person) . '\r';  //姓名
                        }
                        //电话
                        if ($p_ordertel['state']&& $ordertype!=1) {
                            $_info .= printCustomStyle($p_ordertel['style'], $langData['siteConfig'][3][1] . '：' . $tel) . '\r';  //电话
                        }
                        //备注
                        if ($p_note['state'] && $note) {
                            $_info .= printCustomStyle($p_note['style'], $note) . '\r';
                        }

                        //预设内容
                        $presets = "";
                        $presetArr = array();
                        if ($preset) {
                            foreach ($preset as $key => $value) {
                                if (!empty($value['value'])) {
                                    array_push($presetArr, $value['title'] . "：" . $value['value'] . "\r");
                                }
                            }
                        }
                        if ($presetArr) {
                            $presets = join("", $presetArr) . (($customPrintPlat == 'feie') ? '<BR>' : '') . "--------------------------------" . (($customPrintPlat == 'feie' || $customPrintPlat == 'xpyun' || $customPrintPlat == 'trenditiot') ? '<BR>' : '');
                        }

                        //菜单内容
                        $_menu = '';

                        //表头
                        if ($p_menutitle['state']) {

                            //易联云
                            if($customPrintPlat == 'yilianyun'){
                                $_menu .= printCustomStyle($p_menutitle['style'], "<table><tr><td>" . $langData['siteConfig'][19][486] . "</td><td>    " . $langData['siteConfig'][19][311] . "</td><td>" . $langData['siteConfig'][19][549] . "</td></tr></table>");  //商品名称  数量  小计

                            //飞鹅
                            }elseif($customPrintPlat == 'feie'){
                                $_menu .= printCustomStyle($p_menutitle['style'], $langData['siteConfig'][19][486] . "             " .  $langData['siteConfig'][19][311] . " " . $langData['siteConfig'][19][549] . "<BR>");  //商品名称  数量  小计

                            //芯烨云
                            }elseif($customPrintPlat == 'xpyun'){
                                $_menu .= printCustomStyle($p_menutitle['style'], '<TABLE col="21,5,6" w=1 h=1 b=0 lh=68><tr>' . $langData['siteConfig'][19][486] . '<td>' . $langData['siteConfig'][19][311] . '<td>' . $langData['siteConfig'][19][549] . '</tr></TABLE>');  //商品名称  数量  小计

                                //大趋智能
                            }elseif($customPrintPlat == 'trenditiot'){
                                $_menu .= printCustomStyle($p_menutitle['style'], $langData['siteConfig'][19][486] . "             " .  $langData['siteConfig'][19][311] . " " . $langData['siteConfig'][19][549] . "<BR>");  //商品名称  数量  小计

                            }
                        }

                        $foods = array();
                        if ($food) {

                            //易联云
                            if($customPrintPlat == 'yilianyun'){
                                foreach ($food as $key => $value) {
                                    /*$title = $value['title'];
                                    if ($value['ntitle']) {
                                        $title .= "（" . $value['ntitle'] . "）";
                                    }
                                    // array_push($foods, $title . "\r                 ×<FB>" . $value['count'] . "</FB>     " . (sprintf('%.2f', $value['price'] * $value['count'])) . "\r................................");
                                    $amo = sprintf('%.2f', $value['price'] * $value['count']);
                                    array_push($foods, "<tr><td>" . $title . "</td><td>    ×" . $value['count'] . "</td><td>" . floatval($amo) . "</td></tr>");*/

                                    //格式改版，属性换行显示，表格里使用换行容易造成格式错乱，因此采用另起一行的形式
                                    $title = $value['title'];
                                    $amo = sprintf('%.2f', (float)$value['price'] * (int)$value['count']);
                                    array_push($foods, "<tr><td>". ($key+1) .'.' . $title . "</td><td>    ×" . $value['count'] . "</td><td>" . floatval($amo) . "</td></tr>");
                                    if ($value['ntitle']) {
                                        $ntitles = preg_split('/[#\/]/', $value['ntitle']);
                                        foreach($ntitles as $v){
                                            //解析属性名称和数量
                                            $v_ = explode('x', $v);
                                            $v_name = $v_[0];
                                            $v_num = 1;
                                            if (isset($v_[1])) {
                                                $v_num = (int)$v_[1];
                                            }
                                            array_push($foods, "<tr><td>  " . $v_name . " ×" . $v_num . "</td><td> </td><td> </td></tr>");
                                        }
                                    }
                                }
                                $foods = join("", $foods);

                            //飞鹅
                            }elseif($customPrintPlat == 'feie'){

                                //将小计金额计算为数量*单价
                                $_food_list = $food;
                                if($food){
                                    foreach($food as $key => $value){
                                        $amo = sprintf('%.2f', (float)$value['price'] * (int)$value['count']);
                                        $_food_list[$key]['price'] = $amo;
                                    }
                                }

                                $foods = printFeieFoodList($_food_list, 20, 3, 6);
                                // echo $_menu . "\r\n";
                                // echo $foods;die;

                            //芯烨云
                            }elseif($customPrintPlat == 'xpyun'){

                                foreach ($food as $key => $value) {
                                    /*$title = $value['title'];
                                    if ($value['ntitle']) {
                                        $title .= "（" . $value['ntitle'] . "）";
                                    }
                                    $amo = sprintf('%.2f', $value['price'] * $value['count']);
                                    array_push($foods, "<tr>" . $title . "<td>×" . $value['count'] . "<td>" . floatval($amo) . "</tr>");*/

                                    //格式改版，属性换行显示，表格里使用换行容易造成格式错乱，因此采用另起一行的形式
                                    $title = $value['title'];
                                    $amo = sprintf('%.2f', (float)$value['price'] * (int)$value['count']);
                                    array_push($foods, "<tr>". ($key+1) .'.'. $title . "<td>×" . $value['count'] . "<td>" . floatval($amo) . "</tr>");
                                    if ($value['ntitle']) {
                                        $ntitles = preg_split('/[#\/]/', $value['ntitle']);
                                        foreach($ntitles as $v){
                                            //解析属性名称和数量
                                            $v_ = explode('x', $v);
                                            $v_name = $v_[0];
                                            $v_num = 1;
                                            if (isset($v_[1])) {
                                                $v_num = (int)$v_[1];
                                            }
                                            array_push($foods, "<tr>  " . $v_name . " ×" . $v_num . "<td> <td> </tr>");
                                        }
                                    }
                                }
                                $foods = join("", $foods);

                                //大趋智能
                            }elseif($customPrintPlat == 'trenditiot'){

                                //将小计金额计算为数量*单价
                                if($food){
                                    foreach($food as $key => $value){
                                        $amo = sprintf('%.2f', (float)$value['price'] * (int)$value['count']);
                                        $food[$key]['price'] = $amo;
                                    }
                                }

                                $foods = printTrenditiotFoodList($food, 20, 3, 6);

                            }
                        }

                        //菜单
                        if ($p_menulist['state']) {
                            //大趋智能的标签里不能有<BR>，因此需要把文字根据<BR>拆开，分别包裹，包裹时，要去掉下划线和上空格，留到最后再统一包裹
                            if ($customPrintPlat == 'trenditiot') {
                                //把风格分割，字体相关和空格下划线相关的分开
                                $printStyleArr = explode(' ', $p_menulist['style']);
                                $lastStyleArr = array();
                                foreach ($printStyleArr as $key => $value) {
                                    if ($value == 'line' || strpos($value, 'mtop') !== false) {
                                        $lastStyleArr[] = $value;
                                        unset($printStyleArr[$key]);
                                    }
                                }

                                //每段只包裹字体相关
                                $foodsArr = explode('<BR>', $foods);
                                $foods = '';
                                foreach ($foodsArr as $key => $item) {
                                    if ($item != null) {
                                        if ($key > 0) {
                                            $foods .= '<BR>';
                                        }
    
                                        $foods .= printCustomStyle(join(' ',$printStyleArr), $item, false);
                                    }
                                    
                                }

                                //最后整体再包裹空格下划线相关
                                $foods = printCustomStyle(join(' ',$lastStyleArr), $foods, false).'<BR>';

                                $_menu .= $foods;
                            } else {
                                $_menu .= printCustomStyle($p_menulist['style'], $foods, true);
                            }
                        }


                        //费用详细
                        $_price = '';
                        $prices = "";
                        $priceArr = array();
                        if ($priceinfo) {

                            //易联云
                            if($customPrintPlat == 'yilianyun'){
                                foreach ($priceinfo as $key => $value) {
                                    $oper = "";
                                    if($value['type'] != 'ktvip'){
                                        if ($value['type'] == "youhui" || $value['type'] == "manjian" || $value['type'] == "shoudan") {
                                            $oper = "-";
                                        }
                                        array_push($priceArr, "<tr><td>" . $value['body'] . "</td><td></td><td>" . $oper . floatval($value['amount']) . "</td></tr>");
                                    }
                                }
                                if ($priceArr) {
                                    $prices = join("", $priceArr);
                                }

                            //飞鹅
                            }elseif($customPrintPlat == 'feie'){
                                $prices = printFeiePriceList($priceinfo, 24, 6);

                            //芯烨云
                            }elseif($customPrintPlat == 'xpyun'){
                                foreach ($priceinfo as $key => $value) {
                                    $oper = "";
                                    if($value['type'] != 'ktvip'){
                                        if ($value['type'] == "youhui" || $value['type'] == "manjian" || $value['type'] == "shoudan") {
                                            $oper = "-";
                                        }
                                        array_push($priceArr, "<tr>" . $value['body'] . "<td><td>" . $oper . floatval($value['amount']) . "</tr>");
                                    }
                                }
                                if ($priceArr) {
                                    $prices = join("", $priceArr);
                                }

                                //大趋智能
                            }elseif($customPrintPlat == 'trenditiot'){
                                $prices = printTrenditiotPriceList($priceinfo, 24, 6);
                            }

                        }

                        //费用明细
                        if ($p_pricelist['state']) {
                            //大趋智能的标签里不能有<BR>，因此需要把文字根据<BR>拆开，分别包裹
                            if ($customPrintPlat == 'trenditiot') {
                                //把风格分割，字体相关和空格下划线相关的分开
                                $printStyleArr = explode(' ', $p_pricelist['style']);
                                $lastStyleArr = array();
                                foreach ($printStyleArr as $key => $value) {
                                    if ($value == 'line' || strpos($value, 'mtop') !== false) {
                                        $lastStyleArr[] = $value;
                                        unset($printStyleArr[$key]);
                                    }
                                }

                                //每段只包裹字体相关
                                $pricesArr = explode('<BR>', $prices);
                                $prices = '';
                                foreach ($pricesArr as $key => $item) {
                                    if ($item != null) {
                                        if ($key > 0) {
                                            $prices .= '<BR>';
                                        }
    
                                        $prices .= printCustomStyle(join(' ',$printStyleArr), $item, false);
                                    }
                                }

                                //最后整体再包裹空格下划线相关
                                $prices = printCustomStyle(join(' ',$lastStyleArr), $prices, false).'<BR>';

                                $_price .= $prices;
                            } else {
                                $_price .= printCustomStyle($p_pricelist['style'], $prices, true);
                            }
                        }

                        //实收合计
                        if ($p_amount['state']) {
                            $_price .= printCustomStyle($p_amount['style'], $amountInfo . echoCurrency(array("type" => "short")));
                            //大趋智能要在后面加一个换行
                            if ($customPrintPlat == 'trenditiot') {
                                $_price .= '<BR>';
                            }
                        }

                        //底部
                        $_footer = '';

                        //二维码
                        if ($p_qr['state']) {
                            if ($customPrintPlat == 'yilianyun' || $customPrintPlat == 'feie') {
                                $_footer .= printCustomStyle($p_qr['style'], '<QR>' . $shopUrl . '</QR>');
                            } else if ($customPrintPlat == 'xpyun') {
                                //前面要加一个<BR>，不然不打印二维码
                                $_footer .= printCustomStyle($p_qr['style'], '<BR><QRCODE s=6 e=L l=center>' . $shopUrl . '</QRCODE>');
                            //大趋智能要在前面加一个换行
                            } else if ($customPrintPlat == 'trenditiot') {
                                $_footer .= '<BR>'.printCustomStyle($p_qr['style'], '<QR>' . $shopUrl . '</QR>');
                            }
                            
                        }

                        //自定义文字
                        if ($p_footercustom['state']) {
                            $_footer .= printCustomStyle($p_footercustom['style'], $p_footercustom['value']);
                        }

                        //祝您购物愉快    完

                        //易联云
                        if($customPrintPlat == 'yilianyun'){
                            $content = $_title . $_info . $presets . $_menu . $_price . $_footer . "\r<center>" . ($ordertype == 1 ? '' : ($cfg_shortname . $langData['siteConfig'][21][19] . '<FS2>' . $num . '</FS2>' . ($num ? $langData['siteConfig'][21][18] : ""))) . "</center>";

                        //飞鹅
                        }elseif($customPrintPlat == 'feie'){
                            $content = $_title . $_info . $presets . $_menu . $_price . $_footer . "<BR><C>" . ($ordertype == 1 ? '' : ($cfg_shortname . $langData['siteConfig'][21][19] . '<CB>' . $num . '</CB>' . ($num ? $langData['siteConfig'][21][18] : ""))) . "</C>";

                        //芯烨云
                        }elseif($customPrintPlat == 'xpyun'){
                            //后面要加一个<BR>，不然不居中
                            $content = $_title . $_info . $presets . $_menu . $_price . $_footer . "<BR><C>" . ($ordertype == 1 ? '' : ($cfg_shortname . $langData['siteConfig'][21][19] . ($num ? '<CB>' . $num . '</CB>' . $langData['siteConfig'][21][18] : ""))) . "</C><BR>";

                        //大趋智能
                        }elseif($customPrintPlat == 'trenditiot'){
                            $content = $_title . $_info . $presets . $_menu . $_price . $_footer . "<BR><C>" . ($ordertype == 1 ? '' : ($cfg_shortname . $langData['siteConfig'][21][19] . ($num ? '<font# bolder=0 height=1 width=1>' . $num . '</font#>' . $langData['siteConfig'][21][18] : ""))) . "</C>";

                        }

                        $_waimaiPrintLog->DEBUG($pubdate . "\r" . $content . "\r");


                        //平台账号信息
//                        $partner = $customPartnerId;
//                        $apikey = $customPrintKey;
//                        $user = $customPrint_user;
//                        $ukey = $customPrint_ukey;
//                        $ucount = (int)$customPrint_ucount;
//                        $ucount = $ucount ? $ucount : 1;  //打印份数
                        $partner = $printConfigArr['MembrID'];
                        $apikey = $printConfigArr['signkey'];
                        $user = $printConfigArr['user'];
                        $ukey = $printConfigArr['ukey'];
                        $ucount = $printConfigArr['number'] ? $printConfigArr['number']  : 1;
                        $UserKEY = $printConfigArr['UserKEY'];
                        $appid = $printConfigArr['appid'];
                        $appsecrect = $printConfigArr['appsecrect'];
                        $ucount = $ucount ? $ucount : 1;  //打印份数
                        //店铺打印机信息
//                        $mcode = $l['mcode'];
//                        $msign = $l['msign'];
                        $mcode =   $printresult[0]['mcode'];
                        $msign =   $printresult[0]['msign'];

                        if ((($customPrintPlat == 'yilianyun' && $partner && $apikey) || ($customPrintPlat == 'feie' && $user && $ukey) || ($customPrintPlat == 'xpyun' && $user && $UserKEY) || ($customPrintPlat == 'trenditiot' && $appid && $appsecrect)) && $mcode && $msign && $content) {

                            //易联云
                            if($customPrintPlat == 'yilianyun'){
                                $report = $printClass->action_print($partner, $mcode, $content, $apikey, $msign);
                                $report = json_decode($report, true);

                                $_waimaiPrintLog->DEBUG(json_encode($report) . "\r\n\r\n");

                                //打印成功后更新订单打印接口id
                                if ($report['state'] == 1) {
                                    $time = GetMkTime(time());
                                    $print_dataid = $report['id'];
                                    $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                                    $dsql->dsqlOper($sql, "update");

                                    //初始化日志
                                    require_once HUONIAOROOT . "/api/payment/log.php";
                                    $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/yilianyun_printReport/' . date('Y-m-d') . '.log', true);
                                    $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                                }

                            //飞鹅
                            }elseif($customPrintPlat == 'feie'){

                                //换行符
                                $content = str_replace(array("\r", '\r'), '<BR>', $content);

                                $time = time();         //请求时间
                                $msgInfo = array(
                                  'user' => $user,
                                  'stime' => $time,
                                  'backurl' => $cfg_secureAccess . $cfg_basehost . '/api/printReport.php?type=1',
                                  'sig' => sha1($user.$ukey.$time),
                                  'apiname' => 'Open_printMsg',
                                  'sn' => $mcode,
                                  'content' => $content,
                                  'times' => $ucount
                                );

                                $_waimaiPrintLog->DEBUG("打印请求参数：");
                                $_waimaiPrintLog->DEBUG(json_encode($msgInfo, JSON_UNESCAPED_UNICODE));

                                if(!$printClass->post('/Api/Open/', $msgInfo)){
                                    $_waimaiPrintLog->DEBUG("打印机配置错误" . "\r\n\r\n");
                                  // echo 'error';
                                }else{

                                    //服务器返回的JSON字符串，建议要当做日志记录起来
                                    $report = json_decode($printClass->getContent(), true);

                                    $_waimaiPrintLog->DEBUG(json_encode($report) . "\r\n\r\n");

                                    //打印成功后更新订单打印接口id
                                    if ($report['ret'] == 0) {
                                        $time = GetMkTime(time());
                                        $print_dataid = $report['data'];
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                                        $dsql->dsqlOper($sql, "update");

                                        //初始化日志
                                        require_once HUONIAOROOT . "/api/payment/log.php";
                                        $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/feie_printReport/' . date('Y-m-d') . '.log', true);
                                        $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                                    }

                                }

                            //芯烨云
                            }elseif($customPrintPlat == 'xpyun'){

                                //换行符
                                $content = str_replace(array("\r", '\r'), '<BR>', $content);

                                $time = time();         //请求时间
                                $msgInfo = array(
                                  'user' => $user,
                                  'timestamp' => $time,
                                  //'backurl' => $cfg_secureAccess . $cfg_basehost . '/api/printReport.php?type=1',
                                  'sign' => sha1($user.$UserKEY.$time),
                                  'copies' => $ucount, //打印份数
                                  'sn' => $mcode,
                                  //'content' => $content,
                                  "content" => $content,
                                  'voice' => 2, //声音模式 0取消订单 1静音 2来单播报 3申请退单
                                  'mode' => 1, //打印模式 0直接打印 1缓存打印
                                  'backurlFlag' => 1, //回调标识，只有传此字段才会有回调，标识对应后台配置页面的标识
                                );

                                $_waimaiPrintLog->DEBUG("打印请求参数：");
                                $_waimaiPrintLog->DEBUG(json_encode($msgInfo, JSON_UNESCAPED_UNICODE));

                                //接口请求
                                $postUrl = 'https://open.xpyun.net/api/openapi/xprinter/print';
                                $postResult = hn_curl($postUrl,$msgInfo,'json');


                                if($postResult == null){
                                    $_waimaiPrintLog->DEBUG("打印机配置错误" . "\r\n\r\n");
                                  // echo 'error';
                                }else{

                                    //服务器返回的JSON字符串，建议要当做日志记录起来
                                    $report = json_decode($postResult, true);

                                    $_waimaiPrintLog->DEBUG(json_encode($report) . "\r\n\r\n");

                                    //打印成功后更新订单打印接口id
                                    if ($report['code'] == 0) {
                                        $time = GetMkTime(time());
                                        $print_dataid = $report['data'];
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                                        $dsql->dsqlOper($sql, "update");

                                        //初始化日志
                                        require_once HUONIAOROOT . "/api/payment/log.php";
                                        $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/xpyun_printReport/' . date('Y-m-d') . '.log', true);
                                        $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                                    }

                                }

                                //大趋智能
                            }elseif($customPrintPlat == 'trenditiot'){

                                //换行符
                                $content = str_replace(array("\r", '\r'), '<BR>', $content);

                                /*var_dump($content);
                                die();*/

                                $time = time();         //请求时间
                                $msgInfo = array(
                                    "sn" => $mcode, //打印机SN码
                                    "voice" => 4, //播报音源，空字符串为不播报声音
                                    "voicePlayTimes" => 1, //播报次数，最大为3次
                                    "voicePlayInterval" => 3, //播报间隔秒数，默认3秒
                                    "expiresInSeconds" => 86400, //任务有效期，默认2小时
                                    "content" => $content,
                                    "copies" => 1 //打印份数
                                );

                                //定义请求头
                                $printUid = 'huoniao'.$time.rand(100000,999999);
                                $printMd5 = md5($printUid . $appid . $time . $appsecrect . json_encode($msgInfo));
                                $printHeaderArr = array();
                                $printHeaderArr[] = "appid:" . $appid; //开发者ID
                                $printHeaderArr[] = "uid:" . $printUid; //唯一编码
                                $printHeaderArr[] = "stime:" . $time; //时间戳
                                $printHeaderArr[] = "sign:" . $printMd5; //签名，md5(uid+appid+stime+appsecrect+请求体Body的Json内容)

                                $_waimaiPrintLog->DEBUG("打印请求参数：");
                                $_waimaiPrintLog->DEBUG(json_encode($printHeaderArr, JSON_UNESCAPED_UNICODE));
                                $_waimaiPrintLog->DEBUG(json_encode($msgInfo, JSON_UNESCAPED_UNICODE));

                                //接口请求
                                $postUrl = 'https://iot-device.trenditiot.com/openapi/print';
                                $postResult = hn_curl($postUrl,$msgInfo,'json','POST',$printHeaderArr);

                                if($postResult == null){
                                    $_waimaiPrintLog->DEBUG("打印机配置错误" . "\r\n\r\n");
                                  // echo 'error';
                                }else{
                                    //服务器返回的JSON字符串，建议要当做日志记录起来
                                    $report = json_decode($postResult, true);

                                    $_waimaiPrintLog->DEBUG(json_encode($report) . "\r\n\r\n");

                                    //打印成功后更新订单打印接口id
                                    if ($report['code'] == 0) {
                                        $time = GetMkTime(time());
                                        $print_dataid = $report['data']['printId'];
                                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                                        $dsql->dsqlOper($sql, "update");

                                        //初始化日志
                                        require_once HUONIAOROOT . "/api/payment/log.php";
                                        $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/trenditiot_printReport/' . date('Y-m-d') . '.log', true);
                                        $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                                    }

                                }

                            }

                        }
                    }else{
                        testprinterWaimaiOrder($id);
                    }

                }
            }

        }

    }
}


// 易联云图片打印接口
function testprinterWaimaiOrder($id, $pp = false){
    global $cfg_shortname;
    global $dsql;
    global $langData;
    global $userLogin;
    global $cfg_fenxiaoState;
    global $cfg_fenxiaoName;

    $date = GetMkTime(date("Y-m-d"));


    //消息通知
    $sql = $dsql->SetQuery("SELECT
          s.`id`, s.`shopname`, s.`smsvalid`, s.`sms_phone`, s.`auto_printer`, s.`showordernum`,s.`access_token`,s.`bind_print`, o.`state`, o.`ordernum`, o.`ordernumstore`, o.`food`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`amount`, o.`priceinfo`, o.`preset`, o.`note`, o.`pubdate`, o.`uid`,o.`ordertype`,o.`desk`,o.`selftime`
          FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_order_all` o ON o.`sid` = s.`id` WHERE o.`id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data           = $ret[0];
        $shopid         = $data['id'];
        $shopname       = $data['shopname'];
        $selftime       = $data['selftime'];
        $smsvalid       = $data['smsvalid'];
        $sms_phone      = $data['sms_phone'];
        $auto_printer   = $data['auto_printer'];
        $showordernum   = $data['showordernum'];
        $state          = $data['state'];
        $ordernum       = $data['ordernum'];
        $ordernumstore  = $data['ordernumstore'];
        $food           = unserialize($data['food']);
        $person         = $data['person'];
        $tel            = $data['tel'];
        $access_token   = $data['access_token'];
        $address        = $data['address'];
        $paytype        = $data['paytype'];
        $amount         = $data['amount'];
        $priceinfo      = unserialize($data['priceinfo']);
        $preset         = unserialize($data['preset']);
        $note           = $data['note'];
        $pubdate        = $data['pubdate'];
        $uid            = $data['uid'];
        $count          = explode("-", $ordernumstore);
        $count          = $showordernum ? $count[1] : 0;

        $desk           = $data['desk'];
        $ordertype      = $data['ordertype'];


        //打印机查询(2020/4/28)
//        $printsql = $dsql->SetQuery("SELECT * FROM `#@__waimai_shopprint` WHERE `sid` = ".$shopid);
//        $printret = $dsql->dsqlOper($printsql,"results");
        $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE `sid` = ".$shopid." AND `service` = 'waimai' ");
        $printret = $dsql->dsqlOper($printsql,"results");


        //分销商信息

        $fenxiaoshang = "";


        //货到付款     已付款
        $amountInfo = $paytype == "delivery" ? $langData['siteConfig'][16][51] . "：" . floatval($amount) : $langData['siteConfig'][9][24] . "：" . floatval($amount);
        $picurl   ='';
        require_once(HUONIAOINC . '/class/UyghurCharUtilities.class.php');
        if($printret){
            foreach ($printret as $j => $l) {
//                if (($auto_printer || $pp) && $l['bind_print'] == 1 && $l['print_state'] == 1) {
                    if ($auto_printer || $pp) {

                        $dayinarr = array();
                    if ($count) {
                        $num = " #" . $count;
                    }

                    $desknote = "";
                    if($ordertype ==1){
                        $desknote = "(桌号:".$desk.")";
                    }

                    $selfnote = "";
                    if ($selftime != 0) {
                        $selfnote = "\n自取订单 (自取时间：" . date('Y-m-d H:i:s', $selftime) . ")";
                    }
                    //标题
                    $titleCon = $num . $shopname.$desknote.$selfnote;
                    $u = new UyghurCharUtilities();
                    $dayinarr['shopname']           = $u->getPFRevGb($titleCon);
                    $dayinarr['ordernumstore']      = $u->getUyPFStr($langData['siteConfig'][19][308] . '：' . $ordernumstore);
                    $dayinarr['pubdate']            = $langData['siteConfig'][19][384] . '：' . date("Y-m-d H:i:s", $pubdate);
                    $dayinarr['address']            = $langData['siteConfig'][19][9] . '：' . $address;
                    $dayinarr['person']             = $langData['siteConfig'][19][4] . '：' . $person;
                    $dayinarr['tel']                = $langData['siteConfig'][3][1] . '：' . $tel;
                    $dayinarr['note']               = $note;
                    $dayinarr['preset']             = $preset;
                    $dayinarr['food']               = $food;
                    $dayinarr['priceinfo']          = $priceinfo;
                    $dayinarr['amountInfo']         = $amountInfo;
                    $dayinarr['ordernum']           = $ordernum;
                    $dayinarr['ordertype']          = $ordertype;
                    $dayinarr['bt']                 = $langData['siteConfig'][19][486] ."        ". $langData['siteConfig'][19][311] ."        ". $langData['siteConfig'][19][549];

                    $picurl = Printsavepicture($dayinarr);
                    //初始化日志
                    require_once HUONIAOROOT . "/api/payment/log.php";
                    $_waimaiPrintLog = new CLogFileHandler(HUONIAOROOT . '/log/waimaiPrint/'.date('Y-m-d').'_pic.log');
                    //  $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($dayinarr) . "\r\n\r\n");

                    include(HUONIAOINC . '/config/waimai.inc.php');
                    require_once(HUONIAOINC . '/class/waimaiPrint.class.php');

                    $sqlprint = $dsql->SetQuery("SELECT * FROM `#@__business_print` p  LEFT JOIN `#@__business_print_config` c ON p.`type` = c.`print_code` WHERE p.`id` = ".$l['printid']." ");
                    $printresult = $dsql->dsqlOper($sqlprint,"results");
                    $printConfig = unserialize($printresult[0]['print_config']);

                    $printConfigArr = array();
                    //验证配置
                    foreach ($printConfig as $key => $value) {
                        if (!empty($value['value'])) {
                            $printConfigArr[$value['name']] = $value['value'];
                        }
                    }

//                    $partner = $customPartnerId;
//                    $apikey = $customPrintKey;
//
                    $print = new waimaiPrint();
//
//                    $mcode = $l['mcode'];
//                    $msign = $l['msign'];

                    

                    $partner = $printConfigArr['MembrID'];
                    $apikey = $printConfigArr['signkey'];

                    //店铺打印机信息
//                        $mcode = $l['mcode'];
//                        $msign = $l['msign'];
                    $mcode =   $printresult[0]['mcode'];
                    $msign =   $printresult[0]['msign'];


                    $content = $picurl;

                    if ($partner && $apikey && $mcode && $msign && $content) {
//                        $client_secret = $customClient_secret;
//                        $clientId      = $customClientId;
                        $client_secret = $printConfigArr['client_secret'];
                        $clientId      = $printConfigArr['clientId'];
                        if($access_token == ''){

                            /*token 是空的 要请求保存token*/
                            $token    = $print->getToken('',$clientId,$client_secret);

                            $tokenarr = json_decode($token,true);
                            
                            $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($token) . "\r\n\r\n");

                            if ($tokenarr['error'] ==0) {

                                $access_token = $tokenarr['body']['access_token'];

                                $sql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET `access_token` ='".$access_token."' WHERE `id` = '".$shopid."'");

                                $dsql->dsqlOper($sql,"update");

                            }else{

                                // $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($token) . "\r\n\r\n");
                            }
                        }

                        $report = $print->action_picprint($clientId,$mcode,$picurl,$client_secret,$ordernum,$access_token);

                        $report  = json_decode($report,true);
                        if($report['error'] == 18){
                            /*请求接口报错 token错误的时候再次请求获取token并且保存*/
                            $token    = $print->getToken('',$clientId,$client_secret);
                            $tokenarr = json_decode($token,true);
                            
                            $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($token) . "\r\n\r\n");
                            
                            if ($tokenarr['error'] ==0) {
                                $sql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET `access_token` ='".$tokenarr['body']['access_token']."' WHERE `id` = '".$shopid."'");

                                $dsql->dsqlOper($sql,"update");

                                $report = $print->action_picprint($clientId,$mcode,$picurl,$client_secret,$ordernum,$tokenarr['body']['access_token']);

                                $report  = json_decode($report,true);

                            }else{

                                // $_waimaiPrintLog->DEBUG($pubdate . "\r" . $token . "\r\n\r\n");
                            }
                        }
                        
                        $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($report) . "\r\n\r\n");

                        if($report['error'] == 0) {

                            $time = GetMkTime(time());

                            $print_dataid = $report['body']['id'];

                            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                            $dsql->dsqlOper($sql, "update");

                        }else{
                            // $_waimaiPrintLog->DEBUG($pubdate . "\r" . json_encode($report) . "\r\n\r\n");
                        }


                    }
                }
            }
        }

    }
}


//小票样式自定义输出模板
function printCustomStyle($style = '', $con, $table = false){

    //打印机品牌  按照标识进行判断，不再按照数字
    global $customPrintPlat;

    //$customPrintPlat = (int)$customPrintPlat;

    //飞鹅不支持表格
    if($customPrintPlat == 'feie'){
        $table = false;
    }

    //大趋智能不支持表格
    if($customPrintPlat == 'trenditiot'){
        $table = false;
    }

    if($style){

        $start = array();
        $end   = array();
        $styleArr = explode(' ', $style);

        //大趋智能的C和RIGHT标签必须包裹在最外面，且里面不能有<BR>，因此将这两个标签提到最前面
        if ($customPrintPlat == 'trenditiot'){
            foreach ($styleArr as $key => $value) {
                if ($value == 'center' || $value == 'right'){
                    unset($styleArr[$key]);
                    array_unshift($styleArr, $value);
                }
            }
        }

        if($styleArr[count($styleArr)-1] == 'line' && count($styleArr) > 1){
            array_pop($styleArr);
            array_unshift($styleArr, 'line');
        }

        $tableTagStart = '<table>'; //表格的开始标签
        $tableTagEnd = '</table>'; //表格的结束标签

        //芯烨云的table标签不一样
        if ($customPrintPlat == 'xpyun') {
            $tableTagStart = '<TABLE col="21,5,6" w=1 h=1 b=0 lh=68>';
            $tableTagEnd = '</TABLE>';
        }

        foreach ($styleArr as $key => $value) {
            if($value == 'h2w1'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($start, '<FH2>');
                    array_push($end, '</FH2>');
                }elseif($customPrintPlat == 'feie'){
                    array_push($start, '<L>');
                    array_push($end, '</L>');
                }elseif($customPrintPlat == 'xpyun'){
                    if ($table) {
                        $tableTagStart = '<TABLE col="21,5,6" w=1 h=2 b=0 lh=68>';
                    } else {
                        array_push($start, '<HB2>');
                        array_push($end, '</HB2>');
                    }
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($start, '<font# bolder=0 height=2 width=1>');
                    array_push($end, '</font#>');
                }

            }elseif($value == 'h1w2'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($start, '<FW2>');
                    array_push($end, '</FW2>');
                }elseif($customPrintPlat == 'feie'){
                    array_push($start, '<W>');
                    array_push($end, '</W>');
                }elseif($customPrintPlat == 'xpyun'){
                    if ($table) {
                        $tableTagStart = '<TABLE col="21,5,6" w=2 h=1 b=0 lh=68>';
                    } else {
                        array_push($start, '<WB2>');
                        array_push($end, '</WB2>');
                    }
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($start, '<font# bolder=0 height=1 width=2>');
                    array_push($end, '</font#>');
                }

            }elseif($value == 'h2w2'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($start, '<FS2>');
                    array_push($end, '</FS2>');
                }elseif($customPrintPlat == 'feie'){
                    array_push($start, '<B>');
                    array_push($end, '</B>');
                }elseif($customPrintPlat == 'xpyun'){
                    if ($table) {
                        $tableTagStart = '<TABLE col="21,5,6" w=2 h=2 b=0 lh=68>';
                    } else {
                        array_push($start, '<B2>');
                        array_push($end, '</B2>');
                    }
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($start, '<font# bolder=0 height=2 width=2>');
                    array_push($end, '</font#>');
                }

            }elseif($value == 'center'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($start, '<center>');
                    array_push($end, '</center>');
                }elseif($customPrintPlat == 'feie'){
                    array_push($start, '<C>');
                    array_push($end, '</C>');
                }elseif($customPrintPlat == 'xpyun'){
                    array_push($start, '<C>');
                    array_push($end, '</C>');
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($start, '<C>');
                    array_push($end, '</C>');
                }

            }elseif($value == 'right'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($start, '<right>');
                    array_push($end, '</right>');
                }elseif($customPrintPlat == 'feie'){
                    array_push($start, '<RIGHT>');
                    array_push($end, '</RIGHT>');
                }elseif($customPrintPlat == 'xpyun'){
                    array_push($start, '<R>');
                    array_push($end, '</R>');
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($start, '<RIGHT>');
                    array_push($end, '</RIGHT>');
                }

            }elseif($value == 'line'){

                if($customPrintPlat == 'yilianyun'){
                    array_push($end, ($table ? '' : '\r') . '--------------------------------');
                }elseif($customPrintPlat == 'feie'){
                    array_push($end, ($table ? '' : '\r') . '--------------------------------');
                }elseif($customPrintPlat == 'xpyun'){
                    array_push($end, ($table ? '' : '\r') . '--------------------------------');
                }elseif($customPrintPlat == 'trenditiot'){
                    array_push($end, ($table ? '' : '\r') . '--------------------------------');
                }

            }elseif(strstr($value, 'mtop')){
                $count = (int)str_replace('mtop', '', $value);
                $count = $count/10;
                for ($i=0; $i < $count; $i++) {

                    if($customPrintPlat == 'yilianyun'){
                        array_push($start, '\r');
                    }elseif($customPrintPlat == 'feie'){
                        array_push($start, '<BR>');
                    }elseif($customPrintPlat == 'xpyun'){
                        array_push($start, '<BR>');
                    }elseif($customPrintPlat == 'trenditiot'){
                        //大趋智能的标签里面不能有<BR>，因此将<BR>提到最前面
                        array_unshift($start, '<BR>');
                    }

                }
            }
        }

        $end = array_reverse($end);
        return join('', $start) . ($table && $con ? $tableTagStart . $con . $tableTagEnd : $con) . join('', $end);

    }else{
        return $con;
    }
}


//飞鹅打印机菜单内容排版
function printFeieFoodList($arr, $A, $B, $C){
    $orderInfo = '';
    foreach ($arr as $k5 => $v5) {
        //$name = ($k5+1) . '.' . $v5['title'] . ($v5['ntitle'] ? '('.$v5['ntitle'].')' : '');
        //格式改版，属性换行显示
        $name = ($k5+1) . '.' . $v5['title'];

        $price = $v5['price'];
        $num = '×'.$v5['count'];
        $prices = $v5['price'];
        $kw3 = '';
        $kw1 = '';
        $kw2 = '';
        $kw4 = '';
        $str = $name;
        $blankNum = $A;//名称控制为16个字节
        $lan = mb_strlen($str,'utf-8');
        $m = 0;
        $j=1;
        $blankNum++;
        $result = array();

        if(strlen($num) < $B){
            $k2 = $B - strlen($num);
            for($q=0;$q<$k2;$q++){
                $kw2 .= ' ';
            }
            $num = $num.$kw2;
        }
        if(strlen($prices) < $C){
            $k3 = $C - strlen($prices);
            for($q=0;$q<$k3;$q++){
                $kw4 .= ' ';
            }
            $prices = $prices.$kw4 . '';
        }
        for ($i=0;$i<$lan;$i++){
            $new = mb_substr($str,$m,$j,'utf-8');
            $j++;
            if(mb_strwidth($new,'utf-8')<$blankNum) {
                if($m+$j>$lan) {
                    $m = $m+$j;
                    $tail = $new;
                    $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                    $k = $A - strlen($lenght);
                    for($q=0;$q<$k;$q++){
                        $kw3 .= ' ';
                    }
                    if($m==$j){
                        $tail .= $kw3.' '.$num.'  '.$prices;
                    }else{
                        $tail .= $kw3.'<BR>';
                    }
                    break;
                }else{
                    $next_new = mb_substr($str,$m,$j,'utf-8');
                    if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                    else{   
                        $m = $i+1;
                        $result[] = $new;
                        $j=1;
                    }
                }
            }
        }
        $head = '';
        foreach ($result as $key=>$value) {
            if($key < 1){
                $v_lenght = iconv("UTF-8", "GBK//IGNORE", $value);
                $v_lenght = strlen($v_lenght);
                if($v_lenght == 13) $value = $value." ";
                $head .= $value.' '.$num.'  '.$prices;
            }else{
                $head .= $value.'<BR>';
            }
        }
        $orderInfo .= $head.$tail;

        //如果有属性，就进行处理
        if ($v5['ntitle']) {
            $orderInfo .= '<BR>';
            $ntitles = preg_split('/[#\/]/', $v5['ntitle']);
            foreach($ntitles as $v){
                //解析属性名称和数量
                $v_ = explode('x', $v);
                $v_name = $v_[0];
                $v_num = 1;
                if (isset($v_[1])) {
                    $v_num = (int)$v_[1];
                }
                $name = '  '.$v_name . " ×" . $v_num;

                //解析显示格式
                $str = $name;
                $lan = mb_strlen($str,'utf-8');
                $m = 0;
                $j = 1;
                $kw3 = '';
                for ($i=0;$i<$lan;$i++){
                    $new = mb_substr($str,$m,$j,'utf-8');
                    $j++;
                    if(mb_strwidth($new,'utf-8')<$blankNum) {
                        if($m+$j>$lan) {
                            $m = $m+$j;
                            $tail = $new;
                            $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                            $k = $A - strlen($lenght);
                            for($q=0;$q<$k;$q++){
                                $kw3 .= ' ';
                            }
                            if($m==$j){
                                $tail .= $kw3.' '.$num.'  '.$prices;
                            }else{
                                $tail .= $kw3.'<BR>';
                            }
                            $orderInfo .= $tail;
                            break;
                        }else{
                            $next_new = mb_substr($str,$m,$j,'utf-8');
                            if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                            else{   
                                $m = $i+1;
                                // $result[] = $new;
                                $orderInfo .= $new.'<BR>';
                                $j=1;
                            }
                        }
                    }
                }
            }
        }
    }
    return $orderInfo;
}


//飞鹅打印机价格内容排版
function printFeiePriceList($arr, $A, $B){
    $orderInfo = '';
    foreach ($arr as $k5 => $v5) {
        $name = $v5['body'];
        $prices = $v5['amount'];
        $kw3 = '';
        $kw1 = '';
        $kw2 = '';
        $kw4 = '';
        $str = $name;
        $blankNum = $A;//名称控制为16个字节
        $lan = mb_strlen($str,'utf-8');
        $m = 0;
        $j=1;
        $blankNum++;
        $result = array();

        if(strlen($prices) < $B){
            $k3 = $B - strlen($prices);
            for($q=0;$q<$k3;$q++){
                $kw4 .= ' ';
            }
            $prices = $prices.$kw4;
        }
        for ($i=0;$i<$lan;$i++){
            $new = mb_substr($str,$m,$j,'utf-8');
            $j++;
            if(mb_strwidth($new,'utf-8')<$blankNum) {
                if($m+$j>$lan) {
                    $m = $m+$j;
                    $tail = $new;
                    $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                    $k = $A - strlen($lenght);
                    for($q=0;$q<$k;$q++){
                        $kw3 .= ' ';
                    }
                    if($m==$j){
                        $tail .= $kw3.' '.$prices;
                    }else{
                        $tail .= $kw3.'<BR>';
                    }
                    break;
                }else{
                    $next_new = mb_substr($str,$m,$j,'utf-8');
                    if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                    else{
                        $m = $i+1;
                        $result[] = $new;
                        $j=1;
                    }
                }
            }
        }
        $head = '';
        foreach ($result as $key=>$value) {
            if($key < 1){
                $v_lenght = iconv("UTF-8", "GBK//IGNORE", $value);
                $v_lenght = strlen($v_lenght);
                if($v_lenght == 13) $value = $value." ";
                $head .= $value.'  '.$prices;
            }else{
                $head .= $value.'<BR>';
            }
        }
        $orderInfo .= $head.$tail;
    }
    return $orderInfo;
}

//大趋智能打印机菜单内容排版
function printTrenditiotFoodList($arr, $A, $B, $C){
    $orderInfo = '';
    foreach ($arr as $k5 => $v5) {
        //$name = ($k5+1) . '.' . $v5['title'] . ($v5['ntitle'] ? '('.$v5['ntitle'].')' : '');
        //格式改版，属性换行显示
        $name = ($k5+1) . '.' . $v5['title'];

        $price = $v5['price'];
        $num = '×'.$v5['count'];
        $prices = $v5['price'];
        $kw3 = '';
        $kw1 = '';
        $kw2 = '';
        $kw4 = '';
        $str = $name;
        $blankNum = $A;//名称控制为16个字节
        $lan = mb_strlen($str,'utf-8');
        $m = 0;
        $j=1;
        $blankNum++;
        $result = array();

        if(strlen($num) < $B){
            $k2 = $B - strlen($num);
            for($q=0;$q<$k2;$q++){
                $kw2 .= ' ';
            }
            $num = $num.$kw2;
        }
        if(strlen($prices) < $C){
            $k3 = $C - strlen($prices);
            for($q=0;$q<$k3;$q++){
                $kw4 .= ' ';
            }
            $prices = $prices.$kw4 . '';
        }
        for ($i=0;$i<$lan;$i++){
            $new = mb_substr($str,$m,$j,'utf-8');
            $j++;
            if(mb_strwidth($new,'utf-8')<$blankNum) {
                if($m+$j>$lan) {
                    $m = $m+$j;
                    $tail = $new;
                    $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                    $k = $A - strlen($lenght);
                    for($q=0;$q<$k;$q++){
                        $kw3 .= ' ';
                    }
                    if($m==$j){
                        $tail .= $kw3.' '.$num.'  '.$prices;
                    }else{
                        $tail .= $kw3.'<BR>';
                    }
                    break;
                }else{
                    $next_new = mb_substr($str,$m,$j,'utf-8');
                    if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                    else{   
                        $m = $i+1;
                        $result[] = $new;
                        $j=1;
                    }
                }
            }
        }
        $head = '';
        foreach ($result as $key=>$value) {
            if($key < 1){
                $v_lenght = iconv("UTF-8", "GBK//IGNORE", $value);
                $v_lenght = strlen($v_lenght);
                if($v_lenght == 13) $value = $value." ";
                $head .= $value.' '.$num.'  '.$prices;
            }else{
                $head .= $value.'<BR>';
            }
        }
        $orderInfo .= $head.$tail;

        //如果有属性，就进行处理
        if ($v5['ntitle']) {
            $orderInfo .= '<BR>';
            $ntitles = preg_split('/[#\/]/', $v5['ntitle']);
            foreach($ntitles as $v){
                //解析属性名称和数量
                $v_ = explode('x', $v);
                $v_name = $v_[0];
                $v_num = 1;
                if (isset($v_[1])) {
                    $v_num = (int)$v_[1];
                }
                $name = '  '.$v_name . " ×" . $v_num;

                //解析显示格式
                $str = $name;
                $lan = mb_strlen($str,'utf-8');
                $m = 0;
                $j = 1;
                $kw3 = '';
                for ($i=0;$i<$lan;$i++){
                    $new = mb_substr($str,$m,$j,'utf-8');
                    $j++;
                    if(mb_strwidth($new,'utf-8')<$blankNum) {
                        if($m+$j>$lan) {
                            $m = $m+$j;
                            $tail = $new;
                            $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                            $k = $A - strlen($lenght);
                            for($q=0;$q<$k;$q++){
                                $kw3 .= ' ';
                            }
                            if($m==$j){
                                $tail .= $kw3.' '.$num.'  '.$prices;
                            }else{
                                $tail .= $kw3.'<BR>';
                            }
                            $orderInfo .= $tail;
                            break;
                        }else{
                            $next_new = mb_substr($str,$m,$j,'utf-8');
                            if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                            else{   
                                $m = $i+1;
                                // $result[] = $new;
                                $orderInfo .= $new.'<BR>';
                                $j=1;
                            }
                        }
                    }
                }
            }
        }
    }
    return $orderInfo;
}


//大趋智能打印机价格内容排版
function printTrenditiotPriceList($arr, $A, $B){
    $orderInfo = '';
    foreach ($arr as $k5 => $v5) {
        $name = $v5['body'];
        $prices = $v5['amount'];
        $kw3 = '';
        $kw1 = '';
        $kw2 = '';
        $kw4 = '';
        $str = $name;
        $blankNum = $A;//名称控制为16个字节
        $lan = mb_strlen($str,'utf-8');
        $m = 0;
        $j=1;
        $blankNum++;
        $result = array();

        if(strlen($prices) < $B){
            $k3 = $B - strlen($prices);
            for($q=0;$q<$k3;$q++){
                $kw4 .= ' ';
            }
            $prices = $prices.$kw4;
        }
        for ($i=0;$i<$lan;$i++){
            $new = mb_substr($str,$m,$j,'utf-8');
            $j++;
            if(mb_strwidth($new,'utf-8')<$blankNum) {
                if($m+$j>$lan) {
                    $m = $m+$j;
                    $tail = $new;
                    $lenght = iconv("UTF-8", "GBK//IGNORE", $new);
                    $k = $A - strlen($lenght);
                    for($q=0;$q<$k;$q++){
                        $kw3 .= ' ';
                    }
                    if($m==$j){
                        $tail .= $kw3.' '.$prices;
                    }else{
                        $tail .= $kw3.'<BR>';
                    }
                    break;
                }else{
                    $next_new = mb_substr($str,$m,$j,'utf-8');
                    if(mb_strwidth($next_new,'utf-8')<$blankNum) continue;
                    else{
                        $m = $i+1;
                        $result[] = $new;
                        $j=1;
                    }
                }
            }
        }
        $head = '';
        foreach ($result as $key=>$value) {
            if($key < 1){
                $v_lenght = iconv("UTF-8", "GBK//IGNORE", $value);
                $v_lenght = strlen($v_lenght);
                if($v_lenght == 13) $value = $value." ";
                $head .= $value.'  '.$prices;
            }else{
                $head .= $value.'<BR>';
            }
        }
        $orderInfo .= $head.$tail;
    }
    return $orderInfo;
}


//打印商家点餐订单
function printBusinesDiancan($id)
{

    global $dsql;
    global $langData;
    global $cfg_shortname;
    global $cfg_timeZone;

    $time51 = $cfg_timeZone * -1;
    @date_default_timezone_set('Etc/GMT' . $time51);

    $sql = $dsql->SetQuery("SELECT o.*, s.`title` AS shopname, s.`bind_print`,s.`id` sid FROM `#@__business_diancan_order` o LEFT JOIN `#@__business_list` s ON s.`id` = o.`sid` WHERE o.`id` = '$id'");
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $data = $ret[0];
        $sid = $data['sid'];
        //店铺打印机信息
        $sid = $data['sid'];
        $shopname = $data['shopname'];
        $ordernum = $data['ordernum'];
        $table = $data['tablenum'];
        $people = $data['people'];
        $food = unserialize($data['food']);
        $amount = $data['amount'];
        $priceinfo = unserialize($data['priceinfo']);
        $note = $data['note'];
        $pubdate = date("Y-m-d H:i:s", $data['pubdate']);
        $print_dataid = $data['print_dataid'];

        $foodArr = array();
        foreach ($food as $key => $value) {
            if (!$foodArr[$value['type']]) {
                $foodArr[$value['type']] = array();
            }

            $foodArr[$value['type']][] = $value;
        }


        //打印机查询(2020/4/28)
//        $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shopprint` WHERE  `sid` = ".$sid);
//        $printret = $dsql->dsqlOper($printsql,"results");
        $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE `sid` = " . $sid . " AND `service` = 'maidan' ");
        $printret = $dsql->dsqlOper($printsql, "results");
        $print_config = $printret;
        if (empty($printret)) {
            // if (!$data['bind_print'] || !$data['print_state'] || empty($data['print_config']) || unserialize($data['print_config']) === false) {
            return;
        }

        foreach ($print_config as $k => $v) {
            $sqlprint = $dsql->SetQuery("SELECT * FROM `#@__business_print` p  LEFT JOIN `#@__business_print_config` c ON p.`type` = c.`print_code` WHERE p.`id` = " . $v['printid'] . " ");
            $printresult = $dsql->dsqlOper($sqlprint, "results");
//            $customPrintPlat = $printresult[0]['type'];
            //$customPrintPlat = $printresult[0]['print_code'] == 'yilianyun' ? 1 : 2;  //目前只有两种平台，易联云为1，其他为2

            //打印机扩展，开始以print_code来直接判断，不再用1和2
            $customPrintPlat = $printresult[0]['print_code'];

            $customPrintType = $printresult[0]['printmodule'];
            $printConfig = unserialize($printresult[0]['print_config']);

            //配置为空就不进行后续打印
            if ($printConfig == null || !is_array($printConfig)) {
                continue;
            }

            $printConfigArr = array();
            //验证配置
            foreach ($printConfig as $key => $value) {
                if (!empty($value['value'])) {
                    $printConfigArr[$value['name']] = $value['value'];
                }
            }

            require_once HUONIAOROOT . "/api/payment/log.php";
            $_diancanPrintLog = new CLogFileHandler(HUONIAOROOT . '/log/diancanPrint/' . date('Y-m-d') . '.log');

            //商家配置信息
//        $customPrintPlat = (int)$customPrintPlat; //打印机品牌  0易联云  1飞鹅

            //易联云
            if ($customPrintPlat == 'yilianyun') {
                require_once(HUONIAOINC . '/class/waimaiPrint.class.php');
                $printClass = new waimaiPrint();

                //飞鹅
            } elseif ($customPrintPlat == 'feie') {
                require_once(HUONIAOINC . '/class/HttpClient.class.php');
                $printClass = new HttpClient('api.feieyun.cn', 80);
            }

            //平台账号信息
//        $partner = $customPartnerId;
//        $apikey = $customPrintKey;
//        $user = $customPrint_user;
//        $ukey = $customPrint_ukey;
//        $ucount = (int)$customPrint_ucount;
//        $ucount = $ucount ? $ucount : 1;  //打印份数


            //易联云
            if ($customPrintPlat == 'yilianyun') {

                //菜单内容
                $foods = array();
                if ($foodArr) {
                    foreach ($foodArr as $key => $value) {
                        array_push($foods, "<FS><center>（" . $key . "）</center></FS>\r");
                        array_push($foods, "<FS>");
                        array_push($foods, "<table>");
                        foreach ($value as $k => $v) {
                            array_push($foods, "<tr>");
                            $title = $v['title'];
                            if ($v['ntitle']) {
                                $title .= "（" . $v['ntitle'] . "）";
                            }
                            array_push($foods, "<td>" . $title . "</td><td>  ×<FB>" . $v['count'] . "</FB>  </td><td>" . (sprintf('%.2f', $v['price'] * $v['count'])) . "</td>");
                            array_push($foods, "</tr>");
                        }
                        array_push($foods, "</table>");
                        array_push($foods, "</FS>");
                        array_push($foods, "................................\r\r");
                    }
                }
                $foods = join("", $foods);

                //费用详细
                $prices = "";
                $priceArr = array();
                if ($priceinfo) {
                    array_push($priceArr, "<table><tr><td></td><td></td><td></td></tr>");
                    foreach ($priceinfo as $key => $value) {
                        $oper = "";
                        array_push($priceArr, "<tr><td>" . $value['body'] . "</td><td></td><td>" . $oper . $value['amount'] . "</td></tr>");
                    }
                    array_push($priceArr, "</table>");
                }
                if ($priceArr) {
                    $prices = join("", $priceArr) . "\r********************************";
                }

                $noteText = !empty($note) ? "<FH><FW><FB>$note</FB></FW></FH>" . "\r********************************" : "";

                //飞鹅
            } elseif ($customPrintPlat == 'feie') {

                //菜单内容
                $foods = array();
                if ($foodArr) {
                    foreach ($foodArr as $key => $value) {
                        array_push($foods, "<B><C>（" . $key . "）</C></B><BR>");
                        $_foodArr = array();
                        foreach ($value as $k => $v) {
                            array_push($_foodArr, array(
                                'title' => $v['title'],
                                'ntitle' => $v['ntitle'],
                                'count' => $v['count'],
                                'price' => sprintf('%.2f', $v['price'] * $v['count'])
                            ));
                        }
                        array_push($foods, printFeieFoodList($_foodArr, 20, 3, 6) . "<BR>");
                        array_push($foods, "................................<BR>");
                    }
                }
                $foods = join("", $foods);

                //费用详细
                $prices = "";
                if ($priceinfo) {
                    $prices = printFeiePriceList($priceinfo, 24, 6);
                }
                if ($prices) {
                    $prices .= "<BR>********************************";
                }

                $noteText = !empty($note) ? "<B><BOLD>$note</BOLD></B>" . "<BR>********************************" : "";

                //芯烨云
            } elseif ($customPrintPlat == 'xpyun') {

                //菜单内容
                $foods = array();
                if ($foodArr) {
                    foreach ($foodArr as $key => $value) {
                        array_push($foods, "<BR><BR><CB>（" . $key . "）</CB><BR><BR>");
                        array_push($foods, '<TABLE col="21,5,6" w=1 h=1 b=0 lh=68>');
                        foreach ($value as $k => $v) {
                            array_push($foods, "<tr>");
                            $title = $v['title'];
                            if ($v['ntitle']) {
                                $title .= "（" . $v['ntitle'] . "）";
                            }
                            array_push($foods, $title . "<td>×" . $v['count'] . "<td>" . (sprintf('%.2f', $v['price'] * $v['count'])));
                            array_push($foods, "</tr>");
                        }
                        array_push($foods, "</TABLE>");
                        array_push($foods, "................................");
                    }
                }
                $foods = join("", $foods);

                //费用详细
                $prices = "";
                $priceArr = array();
                if ($priceinfo) {
                    array_push($priceArr, '<TABLE col="21,5,6" w=1 h=1 b=0 lh=68><tr> <td> <td> </tr></TABLE>');
                    foreach ($priceinfo as $key => $value) {
                        $oper = "";
                        array_push($priceArr, '<TABLE col="21,5,6" w=1 h=1 b=0 lh=68><tr>' . $value['body'] . "<td> <td>" . $oper . $value['amount'] . "</tr></TABLE>");
                    }
                }
                if ($priceArr) {
                    $prices = join("", $priceArr) . "<BR>********************************";
                }

                $noteText = !empty($note) ? "<B><BOLD>$note</BOLD></B>" . "<BR><BR>********************************<BR><BR>" : "";

            //大趋智能
            } elseif ($customPrintPlat == 'trenditiot') {

                //菜单内容
                $foods = array();
                if ($foodArr) {
                    foreach ($foodArr as $key => $value) {
                        array_push($foods, "<BR><C><font# bolder=1 height=2 width=2>（" . $key . "）</font#></C><BR><BR>");
                        $_foodArr = array();
                        foreach ($value as $k => $v) {
                            array_push($_foodArr, array(
                                'title' => $v['title'],
                                'ntitle' => $v['ntitle'],
                                'count' => $v['count'],
                                'price' => sprintf('%.2f', $v['price'] * $v['count'])
                            ));
                        }
                        array_push($foods, printTrenditiotFoodList($_foodArr, 20, 3, 6));
                        array_push($foods, "................................<BR>");
                    }
                }
                $foods = join("", $foods);

                //费用详细
                $prices = "";
                if ($priceinfo) {
                    $prices = printTrenditiotPriceList($priceinfo, 24, 6);
                }
                if ($prices) {
                    $prices .= "<BR>********************************";
                }

                $noteText = !empty($note) ? "<BR><font# bolder=1 height=2 width=2>$note</font#>" . "<BR><BR>********************************" : "";

            }


//单号
//时间
//桌号
//人数
//商品名称    数量     小计
//合计
//祝您就餐愉快

            //易联云
            if ($customPrintPlat == 'yilianyun') {

                $content = "<FB><FH2><center>" . $shopname . "</center></FH2></FB>
********************************
<FS2>" . $langData['siteConfig'][16][73] . "：$table</FS2>
" . $langData['siteConfig'][19][359] . "：$ordernum
" . $langData['siteConfig'][19][384] . "：$pubdate
<FS>" . $langData['siteConfig'][16][72] . "：$people</FS>
********************************
" . $langData['siteConfig'][19][486] . "           " . $langData['siteConfig'][19][311] . "    " . $langData['siteConfig'][19][549] . "
********************************
$foods
$noteText
<FH2><FW>" . $langData['siteConfig'][21][20] . "：" . $amount . echoCurrency(array("type" => "short")) . "</FW></FH2>\r\r
<center>" . $langData['siteConfig'][21][21] . "</center>";

                //飞鹅
            } elseif ($customPrintPlat == 'feie') {

                $content = "<B><C>" . $shopname . "</C></B>
********************************
<B>" . $langData['siteConfig'][16][73] . "：$table</B>
" . $langData['siteConfig'][19][359] . "：$ordernum
" . $langData['siteConfig'][19][384] . "：$pubdate
<L>" . $langData['siteConfig'][16][72] . "：$people</L>
********************************
" . $langData['siteConfig'][19][486] . "            " . $langData['siteConfig'][19][311] . " " . $langData['siteConfig'][19][549] . "
********************************
$foods
$noteText
<L>" . $langData['siteConfig'][21][20] . "：" . $amount . echoCurrency(array("type" => "short")) . "</L><BR>
<C>" . $langData['siteConfig'][21][21] . "</C>";

                //芯烨云
            } elseif ($customPrintPlat == 'xpyun') {

                $content = "<CB>" . $shopname . "</CB>
********************************
<BOLD>" . $langData['siteConfig'][16][73] . "：$table</BOLD>
" . $langData['siteConfig'][19][359] . "：$ordernum
" . $langData['siteConfig'][19][384] . "：$pubdate
<L>" . $langData['siteConfig'][16][72] . "：$people</L>
********************************
<TABLE col=\"21,5,6\" w=1 h=1 b=0 lh=120><tr>" . $langData['siteConfig'][19][486] . "<td>" . $langData['siteConfig'][19][311] . "<td>" . $langData['siteConfig'][19][549] . "</tr></TABLE>********************************$foods
$noteText<L>" . $langData['siteConfig'][21][20] . "：" . $amount . echoCurrency(array("type" => "short")) . "</L><BR>
<C>" . $langData['siteConfig'][21][21] . "</C><BR>";

            //大趋智能
            } elseif ($customPrintPlat == 'trenditiot') {

                $content = "<C><font# bolder=1 height=2 width=2>" . $shopname . "</font#></C>
********************************
<font# bolder=1 height=1 width=1>" . $langData['siteConfig'][16][73] . "：$table</font#>
" . $langData['siteConfig'][19][359] . "：$ordernum
" . $langData['siteConfig'][19][384] . "：$pubdate
<LEFT>" . $langData['siteConfig'][16][72] . "：$people</LEFT>
********************************
" . $langData['siteConfig'][19][486] . "            " . $langData['siteConfig'][19][311] . " " . $langData['siteConfig'][19][549] . "
********************************
$foods$noteText
<LEFT>" . $langData['siteConfig'][21][20] . "：" . $amount . echoCurrency(array("type" => "short")) . "</LEFT><BR>
<C>" . $langData['siteConfig'][21][21] . "</C>";

            }

            //初始化日志
            $_diancanPrintLog->DEBUG($pubdate . "\r" . $content . "\r\n\r\n");

            $mcode = $printresult[0]['mcode'];
            $msign = $printresult[0]['msign'];
            $partner = $printConfigArr['MembrID'];
            $apikey = $printConfigArr['signkey'];
            $user = $printConfigArr['user'];
            $ukey = $printConfigArr['ukey'];;
            $ucount = $printConfigArr['number'] ? $printConfigArr['number'] : 1;
            $UserKEY = $printConfigArr['UserKEY'];
            $appid = $printConfigArr['appid'];
            $appsecrect = $printConfigArr['appsecrect'];
            $ucount = $ucount ? $ucount : 1;  //打印份数

            if ((($customPrintPlat == 'yilianyun' && $partner && $apikey) || ($customPrintPlat == 'feie' && $user && $ukey) || ($customPrintPlat == 'xpyun' && $user && $UserKEY) || ($customPrintPlat == 'trenditiot' && $appid && $appsecrect)) && $mcode && $msign && $content) {

                //易联云
                if ($customPrintPlat == 'yilianyun') {
                    $report = $printClass->action_print($partner, $mcode, $content, $apikey, $msign);
                    $report = json_decode($report, true);

                    //打印成功后更新订单打印接口id
                    // 更新打印记录状态，订单状态为已确认
                    if ($report['state'] == 1) {

                        $print_dataid = $report['id'];

                        $sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `print_dataid` = '$print_dataid', `state` = 3 WHERE `id` = $id");
                        $dsql->dsqlOper($sql, "update");

                        //初始化日志
                        require_once HUONIAOROOT . "/api/payment/log.php";
                        $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/yilianyun_printReport/' . date('Y-m-d') . '.log', true);
                        $_printReport->DEBUG("打印成功:" . $sql . "\r\n");

                    }

                    //飞鹅
                } elseif ($customPrintPlat == 'feie') {
                    //换行符
                    $content = str_replace(array("\r", '\r'), '<BR>', $content);

                    $time = time();         //请求时间
                    $msgInfo = array(
                        'user' => $user,
                        'stime' => $time,
                        'sig' => sha1($user . $ukey . $time),
                        'apiname' => 'Open_printMsg',
                        'sn' => $mcode,
                        'content' => $content,
                        'times' => $ucount
                    );
                    if (!$printClass->post('/Api/Open/', $msgInfo)) {
                        // echo 'error';
                    } else {

                        //服务器返回的JSON字符串，建议要当做日志记录起来
                        $report = json_decode($printClass->getContent(), true);

                        //打印成功后更新订单打印接口id
                        if ($report['ret'] == 0) {
                            $time = GetMkTime(time());
                            $print_dataid = $report['data'];
                            $sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                            $dsql->dsqlOper($sql, "update");

                            //初始化日志
                            require_once HUONIAOROOT . "/api/payment/log.php";
                            $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/feie_printReport/' . date('Y-m-d') . '.log', true);
                            $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                        }

                    }

                    //芯烨云
                }elseif($customPrintPlat == 'xpyun'){

                    //换行符
                    $content = str_replace(array("\r", '\r'), '<BR>', $content);

                    $time = time();         //请求时间
                    $msgInfo = array(
                      'user' => $user,
                      'timestamp' => $time,
                      //'backurl' => $cfg_secureAccess . $cfg_basehost . '/api/printReport.php?type=1',
                      'sign' => sha1($user.$UserKEY.$time),
                      'copies' => $ucount, //打印份数
                      'sn' => $mcode,
                      //'content' => $content,
                      "content" => $content,
                      'voice' => 2, //声音模式 0取消订单 1静音 2来单播报 3申请退单
                      'mode' => 1, //打印模式 0直接打印 1缓存打印
                      'backurlFlag' => 1, //回调标识，只有传此字段才会有回调，标识对应后台配置页面的标识
                    );

                    //接口请求
                    $postUrl = 'https://open.xpyun.net/api/openapi/xprinter/print';
                    $postResult = hn_curl($postUrl,$msgInfo,'json');


                    if($postResult == null){
                      // echo 'error';
                    }else{

                        //服务器返回的JSON字符串，建议要当做日志记录起来
                        $report = json_decode($postResult, true);

                        //打印成功后更新订单打印接口id
                        if ($report['code'] == 0) {
                            $time = GetMkTime(time());
                            $print_dataid = $report['data'];
                            $sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                            $dsql->dsqlOper($sql, "update");

                            //初始化日志
                            require_once HUONIAOROOT . "/api/payment/log.php";
                            $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/xpyun_printReport/' . date('Y-m-d') . '.log', true);
                            $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                        }

                    }

                //大趋智能
                }elseif($customPrintPlat == 'trenditiot'){

                    //换行符
                    $content = str_replace(array("\r", '\r'), '<BR>', $content);

                    /*var_dump($content);
                    die();*/

                    $time = time();         //请求时间
                    $msgInfo = array(
                        "sn" => $mcode, //打印机SN码
                        "voice" => 4, //播报音源，空字符串为不播报声音
                        "voicePlayTimes" => 1, //播报次数，最大为3次
                        "voicePlayInterval" => 3, //播报间隔秒数，默认3秒
                        "expiresInSeconds" => 86400, //任务有效期，默认2小时
                        "content" => $content,
                        "copies" => 1 //打印份数
                    );

                    //定义请求头
                    $printUid = 'huoniao'.$time.rand(100000,999999);
                    $printMd5 = md5($printUid . $appid . $time . $appsecrect . json_encode($msgInfo));
                    $printHeaderArr = array();
                    $printHeaderArr[] = "appid:" . $appid; //开发者ID
                    $printHeaderArr[] = "uid:" . $printUid; //唯一编码
                    $printHeaderArr[] = "stime:" . $time; //时间戳
                    $printHeaderArr[] = "sign:" . $printMd5; //签名，md5(uid+appid+stime+appsecrect+请求体Body的Json内容)

                    //接口请求
                    $postUrl = 'https://iot-device.trenditiot.com/openapi/print';
                    $postResult = hn_curl($postUrl,$msgInfo,'json','POST',$printHeaderArr);

                    if($postResult == null){
                      // echo 'error';
                    }else{
                        //服务器返回的JSON字符串，建议要当做日志记录起来
                        $report = json_decode($postResult, true);

                        //打印成功后更新订单打印接口id
                        if ($report['code'] == 0) {
                            $time = GetMkTime(time());
                            $print_dataid = $report['data']['printId'];
                            $sql = $dsql->SetQuery("UPDATE `#@__business_diancan_order` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                            $dsql->dsqlOper($sql, "update");

                            //初始化日志
                            require_once HUONIAOROOT . "/api/payment/log.php";
                            $_printReport = new CLogFileHandler(HUONIAOROOT . '/log/trenditiot_printReport/' . date('Y-m-d') . '.log', true);
                            $_printReport->DEBUG("打印成功:" . $sql . "\r\n");
                        }

                    }

                }

            }
        }

    }else{
        return;
    }
}


/**
 * 判断一个坐标是否在一个多边形内（由多个坐标围成的）
 * 基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
 * 在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。
 * @param $point 指定点坐标
 * @param $pts 多边形坐标 顺时针方向
 */
function is_point_in_polygon($point, $pts){
    $N = count($pts);
    $boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
    $intersectCount = 0;//cross points count of x
    $precision = 2e-10; //浮点类型计算时候与0比较时候的容差
    $p1 = 0;//neighbour bound vertices
    $p2 = 0;
    $p = $point; //测试点

    $p1 = $pts[0];//left vertex
    for ($i = 1; $i <= $N; ++$i) {//check all rays
        // dump($p1);
        if ($p['lng'] == $p1['lng'] && $p['lat'] == $p1['lat']) {
            return $boundOrVertex;//p is an vertex
        }

        $p2 = $pts[$i % $N];//right vertex
        if ($p['lat'] < min($p1['lat'], $p2['lat']) || $p['lat'] > max($p1['lat'], $p2['lat'])) {//ray is outside of our interests
            $p1 = $p2;
            continue;//next ray left point
        }

        if ($p['lat'] > min($p1['lat'], $p2['lat']) && $p['lat'] < max($p1['lat'], $p2['lat'])) {//ray is crossing over by the algorithm (common part of)
            if ($p['lng'] <= max($p1['lng'], $p2['lng'])) {//x is before of ray
                if ($p1['lat'] == $p2['lat'] && $p['lng'] >= min($p1['lng'], $p2['lng'])) {//overlies on a horizontal ray
                    return $boundOrVertex;
                }

                if ($p1['lng'] == $p2['lng']) {//ray is vertical
                    if ($p1['lng'] == $p['lng']) {//overlies on a vertical ray
                        return $boundOrVertex;
                    } else {//before ray
                        ++$intersectCount;
                    }
                } else {//cross point on the left side
                    $xinters = ($p['lat'] - $p1['lat']) * ($p2['lng'] - $p1['lng']) / ($p2['lat'] - $p1['lat']) + $p1['lng'];//cross point of lng
                    if (abs($p['lng'] - $xinters) < $precision) {//overlies on a ray
                        return $boundOrVertex;
                    }

                    if ($p['lng'] < $xinters) {//before ray
                        ++$intersectCount;
                    }
                }
            }
        } else {//special case when ray is crossing through the vertex
            if ($p['lat'] == $p2['lat'] && $p['lng'] <= $p2['lng']) {//p crossing over p2
                $p3 = $pts[($i + 1) % $N]; //next vertex
                if ($p['lat'] >= min($p1['lat'], $p3['lat']) && $p['lat'] <= max($p1['lat'], $p3['lat'])) { //p.lat lies between p1.lat & p3.lat
                    ++$intersectCount;
                } else {
                    $intersectCount += 2;
                }
            }
        }
        $p1 = $p2;//next ray left point
    }

    if ($intersectCount % 2 == 0) {//偶数在多边形外
        return false;
    } else { //奇数在多边形内
        return true;
    }
}

//验证多少天连续
function getContinueDay($day_list){
    //昨天开始时间戳
    $beginToday = mktime(0, 0, 0, date('m'), date('d'), date('Y'));
    $beginYesterday = mktime(0, 0, 0, date('m'), date('d') - 1, date('Y'));

    $day_list0 = GetMkTime(date("Y-m-d", $day_list[0]));

    $days = 1;

    //如果今天没有签到
    if ($beginToday == $day_list0) {
        $days = 1;
    } else {
        if ($beginYesterday != $day_list0) {
            if ($beginToday == $day_list0) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    $count = count($day_list);
    for ($i = 0; $i < $count; $i++) {
        if ($i < $count - 1) {
            $res = compareDay($day_list[$i], $day_list[$i + 1]);
            if ($res) {
                $days++;
            } else {
                break;
            }
        }
    }
    return $days;
}

function compareDay($curDay, $nextDay){
    $lastBegin = mktime(0, 0, 0, date('m', $curDay), date('d', $curDay) - 1, date('Y', $curDay));
    $lastEnd = mktime(0, 0, 0, date('m', $curDay), date('d', $curDay), date('Y', $curDay)) - 1;
    if ($nextDay >= $lastBegin && $nextDay <= $lastEnd) {
        return true;
    } else {
        return false;
    }
}


//根据城市ID，获取分站城市名
function getSiteCityName($cid){
    if(!is_numeric($cid)) return '未知';
    if($cid == -1) return '异常分站';
    global $dsql;
    $sql = $dsql->SetQuery("SELECT a.`typename` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` = " . $cid);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret && is_array($ret)){
        return $ret[0]['typename'];
    }else{
        return '未知';
    }
}

//获取模块数据
function getModuleList($showIndex = false){
    global $HN_memory;
    global $dsql;

    $isWxMiniprogram = isWxMiniprogram();
    $isBaiDuMiniprogram = isBaiDuMiniprogram();
    $isQqMiniprogram = isQqMiniprogram();
    $isByteMiniprogram = isByteMiniprogram();

    //读缓存
    // $module_cache = $HN_memory->get('site_module');
    $module_cache = false;
    if($module_cache){

        //二次清洗验证
        $list = array();
        foreach ($module_cache as $key => $value) {
            if(
                (!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $value['h5'] && !isApp()) ||
                ($isWxMiniprogram && $value['wx'] && !isApp()) ||
                ($isBaiDuMiniprogram && $value['bd'] && !isApp()) ||
                ($isQqMiniprogram && $value['qm'] && !isApp()) ||
                (isApp() && $value['app'] == 0)
            ){
                array_push($list, array(
                    'title' => $value['title'],
                    'name' => $value['name']
                ));
            }
        }

        if ($showIndex) {
            array_unshift($list, array(
                "title" => "首页",
                "name" => "index"
            ));
        }

        return $list;
    }else {

        $sql = $dsql->SetQuery("SELECT `name`, `title`, `subject`, `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5` FROM `#@__site_module` WHERE `parentid` != 0 AND `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
        try {
            $result = $dsql->dsqlOper($sql, "results");

            $i = 0;
            if ($result) {//如果有子类

                $results = array();
                foreach ($result as $key => $value) {
                    $results[$i]["title"] = $value['subject'] ? $value['subject'] : $value['title'];
                    $results[$i]["name"] = $value['name'];
                    $results[$i]["wx"] = $value['wx'];
                    $results[$i]["bd"] = $value['bd'];
                    $results[$i]["qm"] = $value['qm'];
                    $results[$i]["dy"] = $value['dy'];
                    $results[$i]["app"] = $value['app'];
                    $results[$i]["pc"] = $value['pc'];
                    $results[$i]["h5"] = $value['h5'];
                    $i++;
                }

                //写缓存
                // $HN_memory->set('site_module', $results);

                //二次清洗验证
                $list = array();
                foreach ($results as $key => $value) {
                    if(
                        (!isMobile() && $value['pc']) ||
              		    (
              			    isMobile() && (
                            (!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $value['h5'] && !isApp()) ||
                            ($isWxMiniprogram && $value['wx'] && !isApp()) ||
                            ($isBaiDuMiniprogram && $value['bd'] && !isApp()) ||
                            ($isQqMiniprogram && $value['qm'] && !isApp()) ||
                            ($isByteMiniprogram && $value['dy'] && !isApp()) ||
                            (isApp() && $value['app'] == 0)
                            )
                        )
                    ){
                        array_push($list, array(
                            'title' => $value['title'],
                            'name' => $value['name']
                        ));
                    }
                }

                if ($showIndex) {
                    array_unshift($list, array(
                        "title" => "首页",
                        "name" => "index"
                    ));
                }

                return $list;
            } else {
                return "";
            }

        } catch (Exception $e) {
            //die("模块数据获取失败！");
        }
    }
}

/** 自动显示用户使用过的模块
 * @param int $uid 调用的用户ID
 * @return bool 是否自动增加了显示模块
 */
function autoShowUserModule(int $uid,string $module)
{
    // 用户编辑某个模块时，调用本方法。
    global $dsql;
    $archives = $dsql->SetQuery("SELECT `sortPackage`, `hidePackage` FROM `#@__member` WHERE `state` = 1 AND `mtype` != 0 AND `mtype` != 3 AND `id` = " . $uid);
    $results = $dsql->dsqlOper($archives, "results");
    $user_sortPackage = $results[0]['sortPackage'];
    $user_hidePackage = $results[0]['hidePackage'];
    // 1.查询用户所有已隐藏的模块，如果当前模块在隐藏模块中，则无操作
    $hide_packages = explode(',', $user_hidePackage);
    foreach ($hide_packages as $k=>$v){
        if($module == $v){
            return false;
        }
    }
    // 2.判断是否在模块排序中，若在模块排序中则无操作
    $sort_packages= explode(',', $user_sortPackage);
    foreach ($sort_packages as $k=>$v){
        if($module == $v){
            return false;
        }
    }
    // 3.在排序模块最后加上本模块
    if($user_sortPackage != ""){
        $user_sortPackage.=",";  // 第一个不要,
    }
    $user_sortPackage.=$module;
    $archives = $dsql->SetQuery("UPDATE `#@__member` set `sortPackage`='$user_sortPackage' where `id`= $uid");
    $results = $dsql->dsqlOper($archives, "update");
    if($results != "ok"){
        return false;
    }else{
        return true;
    }
}


//系统入口城市域名检测
function checkSiteCity(){
    global $service;
    global $template;
    global $city;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cityDomainType;

    $spider = isSpider();
    if($spider && $service == 'siteConfig' && $template == 'index' && empty($city) && (!$cityDomainType || $cityDomainType == 2)){
        global $cfg_spiderIndex;

        //切换城市页
        if(!$cfg_spiderIndex){
            header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?spider=' . $spider);
            die;
        }
    }

    //定位所在城市
    if(((($template == 'index' || $template == 'appindex') && $service == 'siteConfig') || $service != 'siteConfig') && $service != 'member' && $template != 'changecity' && !strstr($_SERVER['PHP_SELF'], 'ajax.php') || ($service == 'member' && $template == 'logistic') || ($service == 'member' && $template == 'fabu')){

        include_once(HUONIAOROOT.'/api/handlers/siteConfig.class.php');

        //已经传了城市，需要验证传过来的城市信息是否合法
        if($city){

            $siteConfigService = new siteConfig($city);
            $cityDomain = $siteConfigService->verifyCityDomain();
            if(is_array($cityDomain)){

                //验证失败
                if($cityDomain['state'] == 200){

                    //先清除cookie，不然系统只有一个分站时，会死循环  by gz 20191106
                    DropCookie('siteCityInfo');

                    $singelCityInfo = checkDefaultCity();
                    if($singelCityInfo){
                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                        return $singelCityInfo;

                        // header('location:' . $singelCityInfo['url']);
                        // die;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=1');
                        die;
                    }

                    //系统暂未开通分站功能！
                }elseif($cityDomain['state'] == 201){

                    $singelCityInfo = checkDefaultCity();
                    if($singelCityInfo){
                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                        return $singelCityInfo;

                        // header('location:' . $singelCityInfo['url']);
                        // die;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=2');
                        die;
                    }

                    //验证成功
                }else{
                    //数据共享
                    $serviceConfigFile = HUONIAOINC."/config/".$service.".inc.php";
                    if(file_exists($serviceConfigFile)){
                        require($serviceConfigFile);
                        $dataShare = (int)$customDataShare;
                        if(!$dataShare){
                            PutCookie('siteCityInfo', json_encode($cityDomain, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $cityDomain['type'] == 0 ? $city : "");
                        }
                        return $cityDomain;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?state=error_service');
                        die;
                    }
                }

                //获取失败
            }else{

                $singelCityInfo = checkDefaultCity();
                if($singelCityInfo){
                    PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                    return $singelCityInfo;

                    // header('location:' . $singelCityInfo['url']);
                    // die;
                }else{
                    header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=3');
                    die;
                }

            }

            //没有传任何城市信息，等于刚进来，需要走IP自动定位功能
        }else{

            //验证Cookie
            $siteCityInfoCookie = GetCookie('siteCityInfo');
            if($siteCityInfoCookie){
                $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
                if(is_array($siteCityInfoJson)){

                    //验证Cookie中保存的城市信息是否存在，主要考虑到如果把城市信息删除后，访问过这个城市的用户会跳到404
                    $siteConfigService = new siteConfig($siteCityInfoJson['domain']);
                    $cityDomain = $siteConfigService->verifyCityDomain();
                    if(is_array($cityDomain)){

                        //验证失败
                        if($cityDomain['state'] == 200){

                            $singelCityInfo = checkDefaultCity();
                            if($singelCityInfo){
                                PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                                return $singelCityInfo;

                                // header('location:' . $singelCityInfo['url']);
                                // die;
                            }else{
                                header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=4');
                                die;
                            }

                            //系统暂未开通分站功能！
                        }elseif($cityDomain['state'] == 201){

                            $singelCityInfo = checkDefaultCity();
                            if($singelCityInfo){
                                PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                                return $singelCityInfo;

                                // header('location:' . $singelCityInfo['url']);
                                // die;
                            }else{
                                header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=5');
                                die;
                            }

                            //验证成功
                        }else{
                            //数据共享时，不记录cookie
                            $serviceConfigFile = HUONIAOINC."/config/".$service.".inc.php";
                            if(file_exists($serviceConfigFile)){                                
                                require($serviceConfigFile);
                                $dataShare = (int)$customDataShare;
                                if(!$dataShare){
                                    PutCookie('siteCityInfo', json_encode($cityDomain, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $cityDomain['type'] == 0 ? $city : "");
                                }
                                return $cityDomain;
                                // header('location:'.$siteCityInfoJson['url']);
                                // die;
                            }else{
                                header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?state=error_service');
                                die;
                            }
                        }

                        //获取失败
                    }else{

                        $singelCityInfo = checkDefaultCity();
                        if($singelCityInfo){
                            PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                            return $singelCityInfo;

                            // header('location:' . $singelCityInfo['url']);
                            // die;
                        }else{
                            header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=6');
                            die;
                        }

                    }


                }else{

                    $singelCityInfo = checkDefaultCity();
                    if($singelCityInfo){
                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                        return $singelCityInfo;

                        // header('location:' . $singelCityInfo['url']);
                        // die;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=7');
                        die;
                    }

                }

                //IP定位
            }else{

                //验证是否搜索引擎抓取
                $spider = isSpider();
                if($spider){
                    global $cfg_spiderIndex;

                    //切换城市页
                    if(!$cfg_spiderIndex){
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?spider=' . $spider);
                        die;
                    }
                }

                //如果只开通了一个分站，直接使用这个分站数据
                $siteConfigService = new siteConfig();
                $cityDomain = $siteConfigService->siteCity();
                if(count($cityDomain) == 1){
                    $singelCityInfo = $cityDomain[0];

                    //数据共享
                    $serviceConfigFile = HUONIAOINC."/config/".$service.".inc.php";
                    if(file_exists($serviceConfigFile)){                                
                        require($serviceConfigFile);
                        $dataShare = (int)$customDataShare;
                        if(!$dataShare){
                            PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                        }
                        return $singelCityInfo;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?state=error_service');
                        die;
                    }
                }

                //当前城市
                $cityData = getIpAddr(getIP(), 'json');
                if(is_array($cityData)){
                    $siteConfigService = new siteConfig(array(
                        'province' => $cityData['region'],
                        'city' => $cityData['city']
                    ));
                    $cityInfo = $siteConfigService->verifyCity();
                    if(is_array($cityInfo)){

                        //您所在的地区暂未开通分站
                        if($cityInfo['state'] == 200){

                            $singelCityInfo = checkDefaultCity();
                            if($singelCityInfo){
                                //数据共享
                                $serviceConfigFile = HUONIAOINC."/config/".$service.".inc.php";
                                if(file_exists($serviceConfigFile)){                                
                                    require($serviceConfigFile);
                                    $dataShare = (int)$customDataShare;
                                    if(!$dataShare){
                                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                                    }
                                    return $singelCityInfo;
                                    // header('location:' . $singelCityInfo['url']);
                                }else{
                                    header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?state=error_service');
                                    die;
                                }

                            }else{
                                header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=8');
                                die;
                            }

                            //系统暂未添加分站城市
                        }elseif($cityInfo['state'] == 201){

                        }else{
                            //获取成功
                            //数据共享
                            $serviceConfigFile = HUONIAOINC."/config/".$service.".inc.php";
                            if(file_exists($serviceConfigFile)){                                
                                require($serviceConfigFile);
                                $dataShare = (int)$customDataShare;
                                if(!$dataShare){
                                    PutCookie('siteCityInfo', json_encode($cityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $cityInfo['type'] == 0 ? $city : "");
                                }
                                return $cityInfo;

                                // header('location:'.$cityInfo['url']);
                                // die;
                            }else{
                                header('location:'.$cfg_secureAccess.$cfg_basehost.'/404.html?state=error_service');
                                die;
                            }
                        }

                        //识别失败，手动选择分站
                    }else{

                        $singelCityInfo = checkDefaultCity();
                        if($singelCityInfo){
                            PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                            return $singelCityInfo;

                            // header('location:' . $singelCityInfo['url']);
                            // die;
                        }else{
                            header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=9');
                            die;
                        }

                    }

                    //IP获取失败，手动选择分站
                }else{

                    $singelCityInfo = checkDefaultCity();
                    if($singelCityInfo){
                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                        return $singelCityInfo;

                        // header('location:' . $singelCityInfo['url']);
                        // die;
                    }else{
                        header('location:'.$cfg_secureAccess.$cfg_basehost.'/changecity.html?state=10');
                        die;
                    }

                }

            }

        }

    }else{
        $siteCityInfoCookie = GetCookie('siteCityInfo');
        if($siteCityInfoCookie){
            $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
            if(is_array($siteCityInfoJson)){
                return $siteCityInfoJson;
            }
        }else{
            $singelCityInfo = checkDefaultCity();
            if($singelCityInfo){
                PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                return $singelCityInfo;

                // header('location:' . $singelCityInfo['url']);
                // die;
            }else{
                
                //如果只开通了一个分站，直接使用这个分站数据
                $siteConfigService = new siteConfig();
                $cityDomain = $siteConfigService->siteCity();
                if(count($cityDomain) == 1){
                    $singelCityInfo = $cityDomain[0];

                    //数据共享
                    require(HUONIAOINC."/config/".$service.".inc.php");
                    $dataShare = (int)$customDataShare;
                    if(!$dataShare){
                        PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                    }
                    return $singelCityInfo;
                }

                //当前城市
                $cityData = getIpAddr(getIP(), 'json');
                if(is_array($cityData)){
                    $siteConfigService = new siteConfig(array(
                        'province' => $cityData['region'],
                        'city' => $cityData['city']
                    ));
                    $cityInfo = $siteConfigService->verifyCity();
                    if(is_array($cityInfo)){

                        //您所在的地区暂未开通分站
                        if($cityInfo['state'] == 200){

                            $singelCityInfo = checkDefaultCity();
                            if($singelCityInfo){
                                //数据共享
                                require(HUONIAOINC."/config/".$service.".inc.php");
                                $dataShare = (int)$customDataShare;
                                if(!$dataShare){
                                    PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                                }
                                return $singelCityInfo;
                                // header('location:' . $singelCityInfo['url']);

                            }

                            //系统暂未添加分站城市
                        }elseif($cityInfo['state'] == 201){

                        }else{
                            //获取成功
                            //数据共享
                            require(HUONIAOINC."/config/".$service.".inc.php");
                            $dataShare = (int)$customDataShare;
                            if(!$dataShare){
                                PutCookie('siteCityInfo', json_encode($cityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $cityInfo['type'] == 0 ? $city : "");
                            }
                            return $cityInfo;

                            // header('location:'.$cityInfo['url']);
                            // die;
                        }

                        //识别失败，手动选择分站
                    }else{

                        $singelCityInfo = checkDefaultCity();
                        if($singelCityInfo){
                            PutCookie('siteCityInfo', json_encode($singelCityInfo, JSON_UNESCAPED_UNICODE), 86400 * 7, "/", $singelCityInfo['type'] == 0 ? $city : "");
                            return $singelCityInfo;

                            // header('location:' . $singelCityInfo['url']);
                            // die;
                        }

                    }

                    //IP获取失败，手动选择分站
                }
                
            }
        }
    }

}


//判断是否为单城市或是否设置了默认城市，如果条件成立，则返回城市信息
function checkDefaultCity(){
    $siteConfigService = new siteConfig();
    $cityDomain = $siteConfigService->siteCity();
    if(count($cityDomain) == 1){
        return $cityDomain[0];
    }else{
        $cityData = array();
        foreach ($cityDomain as $key => $value) {
            if($value['default']){
                $cityData = $value;
            }
        }
        return $cityData;
    }
}


//根据addrid获取所在分站
function getCityidByAddrid($addrid = 0){

    global $data;
    $data = "";
    $addrName = getParentArr("site_area", $addrid);
    $ids = array_reverse(parent_foreach($addrName, "id"));
    if($ids){

        $ids = array_reverse($ids);

        $cityid = 0;

        //获取所有分站数据
        $siteConfigService = new siteConfig();
        $cityDomain = $siteConfigService->siteCity();
        
        foreach($ids as $key => $id){

            foreach ($cityDomain as $_key => $_city) {
                if($_city['cityid'] == $id){
                    $cityid = $id;
                    break 2;
                }
            }

        }

        return $cityid;

    }
}


//根据模块名及域名类型拼接完整url
function getDomainFullUrl($module, $customSubDomain, $customModule = array(), $params = array()){
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $siteCityInfo;
    global $dsql;
    global $HN_memory;
    global $_G;
    global $domainNoCity;
    global $withoutCityDomain;
    global $cityid;

    $withoutCityDomain = (int)$withoutCityDomain;  //获取的链接是否需要分站域名

    $siteCityInfo_ = $customModule ? $customModule : $siteCityInfo;

    //如果cookie中的分站与url中指定的分站不一致，以url中的为准
    $_cityid = (int)$siteCityInfo_['cityid'];
    if($cityid && $_cityid != $cityid){
        $siteCityInfo_ = cityInfoById($cityid);
    }

    $md5DomainFullUrl = base64_encode($module . $customSubDomain . json_encode($siteCityInfo_) . json_encode($params));

    //重复的获取直接返回当前请求的首次结果，避免重复获取
    if(isset($_G[$md5DomainFullUrl]) != NULL){
        return $_G[$md5DomainFullUrl];
    }

    //如果只开通了一个模块，直接使用系统域名

    //读缓存
    if(isset($_G['site_module_count'])){
        $siteModule = $_G['site_module_count'];
    }else{
        $moduleCountCache = $HN_memory->get('site_module_count');
        if($moduleCountCache){
            $siteModule = $moduleCountCache;
        }else {
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $siteModule = $ret[0]['total'];

                //写缓存
                $HN_memory->set('site_module_count', $siteModule);
            }
        }
        $_G['site_module_count'] = $siteModule;
    }
    $domainInfo = getDomain($module, 'config');
    if(!is_array($domainInfo)) return $cfg_secureAccess.$cfg_basehost;
    $domain = $domainInfo['domain'];

    //如果是不需要城市信息的，这里直接返回：主域名/模块
    if($domainNoCity){
        $_G[$md5DomainFullUrl] = $cfg_secureAccess.$cfg_basehost."/".$domain;
        return $cfg_secureAccess.$cfg_basehost."/".$domain;
    }
    
    //如果有分站，如果不验证自助建站，当有多城市，并且自助建站开启二级域名后，会导致模板预览链接不可用
    //if($siteCityInfo_ && is_array($siteCityInfo_) && $siteCityInfo_['count'] > 1 && $module != "website"){
    if($siteCityInfo_ && is_array($siteCityInfo_) && $siteCityInfo_['count'] > 1 && !$withoutCityDomain){

        $cityUrl    = $_GET['action'] == 'verifyCity' ? $siteCityInfo_['link'] : $siteCityInfo_['url'];  //https://ihuoniao.cn/sz
        $cityDomain = $siteCityInfo_['domain'];  //sz
        $cityType   = $siteCityInfo_['type'];

        //如果cityUrl最后是以/结尾，则cityUrl去掉最后的/
        $lastStr = substr($cityUrl, -1);
        $cityUrl = $lastStr == '/' ? substr($cityUrl, 0, strlen($cityUrl) - 1) : $cityUrl;

        //子域名
        if($customSubDomain == 1){

            //如果分站绑定了独立域名，模块如果绑定二级域名，最终将是：article.suzhou.com
            if($cityType == 0){
                $domain = $cfg_secureAccess.$domain.".".str_replace("www.", "", $cityDomain);

                //如果分站绑定了子域名，模块如果绑定二级域名，最终将是：article.suzhou.ihuoniao.cn
            }elseif($cityType == 1){
                $domain = $cfg_secureAccess.$domain.".".str_replace("www.", "", $cityDomain).".".$cfg_basehost;

                //如果分站绑定了子目录，模块如果绑定二级域名，最终将是：ihuoniao.cn/suzhou/article
            }elseif($cityType == 2){
                $domain = $cityUrl . ($siteModule == 1 && $module != "business" ? "" : "/" . $domain);
            }

            //子目录
        }elseif($customSubDomain == 2 && $cityType == 2){

            $cityUrl = $cfg_secureAccess.$cfg_basehost.'/'.$cityDomain;  //这里强制用主域名加自定定目录，防止cookie中的数据被污染导致生成错误的链接

            $domain = $cityUrl . ($siteModule == 1 && $module != "business" ? "" : "/" . $domain);

            //主域名及其他
        }else{
            $domain = $cityUrl . ($siteModule == 1 && $module != "business" ? "" : "/" . $domain);
        }

    }else{
        if($siteModule == 1 && $module != 'business' && $module != 'website' && ((isMobile() && $module != 'job') || (!isMobile() && $module == 'job'))){
            $_G[$md5DomainFullUrl] = $cfg_secureAccess.$cfg_basehost;
            return $cfg_secureAccess.$cfg_basehost;
        }else{
            if($customSubDomain == 0){
                $domain = $cfg_secureAccess.$domain;
            }elseif($customSubDomain == 1){
                $domain = $cfg_secureAccess.$domain.".".str_replace("www.", "", $cfg_basehost);
            }elseif($customSubDomain == 2){
                if($module == 'website' && (strstr($params['template'], 'site') || strstr($params['template'], 'preview'))){
                    $singelCityInfo = checkDefaultCity();
                    if($singelCityInfo){
                        $domain = $singelCityInfo['url']."/".$domain;
                    }
                }else{
                    $domain = $cfg_secureAccess.$cfg_basehost."/".$domain;
                }
            }
        }
    }

    //给模块链接后边加斜杠，uni打包的h5页面，会用到最后的斜杠来判断路由并渲染页面，如果没有后边的斜杠，js会自动加上，这样会导致wechatJSSDK生成的签名会和实际的链接不一致导致验签失败
    if(!$params){
        $domain .= "/";
    }

    $_G[$md5DomainFullUrl] = $domain;

    $withoutCityDomain = 0;  //恢复默认值

    return $domain;
}

// 接口获取城市id
function getCityId($cid = 0){
    global $_G;
    global $siteCityInfo;

    $md5CityidKey = "getCityid_" . $cid;
    if(isset($_G[$md5CityidKey])){
        return $_G[$md5CityidKey];
    }

    if(empty($cid)){
        $siteCityInfoCookie = GetCookie('siteCityInfo');
        if($siteCityInfoCookie){
            $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
            if(is_array($siteCityInfoJson)){
                $siteCityInfo = $siteCityInfoJson;
                $cid = $siteCityInfo['cityid'];
            }
        }elseif($siteCityInfo && is_array($siteCityInfo)){
            $cid = $siteCityInfo['cityid'];
        }else{
            $url = $_SERVER['HTTP_REFERER'];
            $data = "dopost=getSiteCityInfo";
            $curl = curl_init();
            curl_setopt($curl,CURLOPT_URL,$url);
            curl_setopt($curl,CURLOPT_HEADER,0);
            curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
            curl_setopt($curl,CURLOPT_SSL_VERIFYHOST, FALSE);
            curl_setopt($curl,CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($curl,CURLOPT_POST,1);
            curl_setopt($curl,CURLOPT_POSTFIELDS,$data);
            curl_setopt($curl, CURLOPT_USERAGENT, "kumanyun/getCityId");
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $cid = curl_exec($curl);
            curl_close($curl);
        }
    }
    $_G[$md5CityidKey] = (int)$cid;
    return (int)$cid;
}

// 详情页判断城市
function detailCheckCity($service, $id, $cityid, $template = "detail"){
    $id = (int)$id;
    $cityid = (int)$cityid;
    $cid = (int)getCityId();
    global $siteCityInfo;
    global $cfg_secureAccess;
    global $do;
    global $service;

    if($do == 'edit' || $service == 'member') return;

    $site = new siteConfig();
    $arr = $site->siteCity();
    $count = count($arr);
    if($count == 1){
        return;
    }

    $incFile = HUONIAOINC . "/config/" . $service . ".inc.php";
    require $incFile;

    $dataShare = (int)$customDataShare;
    if($dataShare){
        return;
    }

    $url = $siteCityInfo['url'];
    if(substr($url, 0, 4) == 'www.') {
        $url = substr($url, 4);
    }

    $url = str_replace('http://', '', str_replace('https://', '', $url));
    $currUrl = $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    if($cid && $cityid && ($cityid != $cid || ($customSubDomain != 0 && !strstr($currUrl, $url)))){
        global $siteCityInfo;
        global $city;
        global $dsql;
        global $data;

        $sql = $dsql->SetQuery("SELECT d.`domain` FROM `#@__domain` d LEFT JOIN `#@__site_city` c ON c.`cid` = d.`iid` WHERE d.`module` = 'siteConfig' AND d.`part` = 'city' AND c.`cid` = $cityid");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret) return false;
        $city = $ret[0]['domain'];

        $_siteCityInfo = cityInfoById($cityid);
        if($_siteCityInfo && $_siteCityInfo['state'] == 100){
            global $siteCityInfo;
            $siteCityInfo = $_siteCityInfo;

            $url = getUrlPath(array("service" => $service, "template" => $template, "id" => $id));
            $desk = $_REQUEST['desk'];
            if(!empty($desk)){
                $deskparam = "?desk=".$desk;
                $url.= $deskparam;
            }
            header("location:".$url);
            die;
        }        
    }
}

// 重置template,获取参数
function checkPagePath(&$service, $pagePath, $reqUri){
    global $dsql;
    global $cityDomainType;
    global $huoniaoTag;
    global $installModuleArr;

    //游戏
    if(strstr($reqUri, '/game.html')){
        require(HUONIAODATA . '/admin/config_official.php');
        global $cfg_km_accesskey_id;
        global $userLogin;

        $uinfo = array();

        $userInfo = $userLogin->getMemberInfo();
        if($userInfo){
            $uinfo = array(
                'id' => $userInfo['userid'],
                'nick' => $userInfo['nickname'],
                'avatar' => $userInfo['photo'] ? $userInfo['photo'] : getFilePath('/static/images/noPhoto_100.jpg'),
                'sex' => $userInfo['sex'],
                'phone' => $userInfo['phone'],
            );
        }else{
            //未登录，不允许访问游戏
            header('location:/login.html');
            die;
        }

        header('location:' . $cloudHost . '/include/ajax.php?action=game&accesskey_id=' . $cfg_km_accesskey_id . '&data=' . json_encode($uinfo));
        die;
    }

    $arr = array_filter($installModuleArr);
    $moduleCount = count($arr);
    $sql = $dsql->SetQuery("SELECT * FROM `#@__domain` WHERE `domain` = '$service'");
    $results = $dsql->dsqlOper($sql, "results");
    if($results){
        $module     = $results[0]['module'];
        $expires    = $results[0]['expires'];
        $note       = $results[0]['note'];
        //判断是否过期
        if($todayDate < $expires || empty($expires)){
            $service = $module;
        }else{
            die($note);
        }
    }

    if($service == "website"){
        $reqUri_ = trim($reqUri, "/");
        $reqUriArr = explode("/", $reqUri_);

        if($cityDomainType == 1){
            array_unshift($reqUriArr, $service);
        }

        $siteConfigService = new siteConfig();
        $cityDomain = $siteConfigService->siteCity();
        if(count($cityDomain) == 1){
            global $installModuleArr;
            if(count($installModuleArr) == 1){
                $reqUriArr2 = $reqUriArr[0];
                $reqUriArr3 = $reqUriArr[1];
            }else{
                $reqUriArr2 = isset($reqUriArr[1]) ? $reqUriArr[1] : $reqUriArr[0];
                $reqUriArr3 = isset($reqUriArr[2]) ? $reqUriArr[2] : $reqUriArr[1];
            }
        }else{
            $reqUriArr2 = isset($reqUriArr[2]) ? $reqUriArr[2] : $reqUriArr[1];
            $reqUriArr3 = isset($reqUriArr[3]) ? $reqUriArr[3] : $reqUriArr[2];
        }
        $reqUriArr3 = $reqUriArr3 == $reqUriArr2 ? null : $reqUriArr3;

        if(isset($reqUriArr2)){
            if(strstr($reqUriArr2, ".html")){
                $pagePathArr = explode('-', $pagePath);
                $pagePath = $pagePathArr[0];
                if($pagePath == "templates"){
                    $_REQUEST['typeid'] = (int)$pagePathArr[1];
                }elseif($pagePath == "mobile"){
                    $pagePath = "mobile-market";
                }
            }elseif(strstr($reqUriArr2, "preview") || strstr($reqUriArr2, "site")){
                global $id;
                global $alias;
                global $type;

                $id = str_replace("preview", "", $reqUriArr2);
                $id = (int)str_replace("site", "", $id);

                if(isset($reqUriArr3)){
                    $req = explode('?', $reqUriArr3);
                    $req = $req[0];
                    $alias = str_replace(".html", "", $req);
                }else{
                    $alias = "index";
                }

                if(strstr($reqUriArr2, "preview")){
                    $type = "template";
                }

                if(!isMobile()){
                    include("website.php");
                    die;
                }else{
                    return $alias;
                }
            }
        }

        if($moduleCount == 1 &&
            (strstr($pagePath, "about-")
                || $pagePath == "about"
                || strstr($pagePath, "help-")
                || $pagePath == "help"
                || $pagePath == "404"
            )
        ){
        }else{
            return $pagePath;
        }

        // 专题
    }elseif($service == "special"){
        $pagePathArr = explode('-', $pagePath);
        $pagePath = $pagePathArr[0];
        if($pagePath == "detail"){
            global $id;
            $id = (int)$pagePathArr[1];

            include("special.php");
            die;
        }else{
            if(isset($pagePathArr[1])){
                $_REQUEST['id'] = (int)$pagePathArr[1];
            }
            return $pagePath;
        }
    }


    global $cityDomainType;

    if(($pagePath == "index" || $pagePath == "404") && trim($reqUri, "/") != 'user') return $pagePath;

    if($service == "member"){
        $reqUri_ = trim($reqUri, "/");

        $reqUri_ = explode('?', $reqUri_);
        $reqUri_ = $reqUri_[0];
        $reqUriArr = explode("/", $reqUri_);

        foreach ($reqUriArr as $key => $value) {
            if($reqUriArr[$key] == "user"){
                $_REQUEST['id'] = (int)$reqUriArr[$key+1];
                if(empty($reqUriArr[$key+2])){
                    return "user";
                }else{
                    return "user_".str_replace('.html','',$reqUriArr[$key+2]);
                }
            }
            if(stripos($reqUriArr[$key], 'config-house') !== false){
                $param = array("service"  => "member");
                $busiDomain = getUrlPath($param);     //商家会员域名
                global $cfg_secureAccess;
                global $httpHost;
                $fullUri = $cfg_secureAccess . $httpHost . $reqUri;
                if(!strstr($fullUri, $busiDomain)){
                    return str_replace('.html', '', $reqUriArr[$key]);
                }
            }
            if(stripos($reqUriArr[$key], 'config-selfmedia') !== false){
                return str_replace(".html", "", $reqUriArr[$key]);
            }

            if(strstr($reqUriArr[$key], 'write-comment')){

                $pathArr_wc = explode('-', $reqUriArr[$key]);
                $_REQUEST['module'] = $pathArr_wc[$key+1];
                $_REQUEST['id'] = (int)str_replace('.html', '', $pathArr_wc[$key+2]);
                return 'write-comment';
            }

            if($reqUriArr[$key] == 'config-tuan.html'){
                $_REQUEST['template'] = 'config';
                $_REQUEST['module'] = 'tuan';
                return "config";
            }

            if(stripos($reqUriArr[$key], 'config-car') !== false){
                $param = array("service"  => "member");
                $busiDomain = getUrlPath($param);     //商家会员域名
                global $cfg_secureAccess;
                global $httpHost;
                $fullUri = $cfg_secureAccess . $httpHost . $reqUri;
                if(!strstr($fullUri, $busiDomain)){
                    return str_replace('.html', '', $reqUriArr[$key]);
                }
            }

            // if(($reqUriArr[$key] == 'dressup-website.html' || $reqUriArr[$key] == 'website-news.html' || $reqUriArr[$key] == 'website-guest.html' || $reqUriArr[$key] == 'website-honor.html' || $reqUriArr[$key] == 'alipay-record.html')){
            //   return str_replace('.html', '', $reqUriArr[$key]);
            // }
            if(($reqUriArr[$key] == 'dressup-website.html' || (strpos($reqUriArr[$key], 'fabu') === false && strpos($reqUriArr[$key], 'website-') !== false) || $reqUriArr[$key] == 'alipay-record.html')){
                $f = explode('?', $reqUriArr[$key]);
                $f = $f[0];
                return str_replace('.html', '', $f);
            }
        }



    }

    $isSpecial = false; // 特殊页面
    //默认URL规则
    if(strstr($pagePath, '-')){

        $pagePathArr = explode('-', $pagePath);
        $pagePath = $pagePathArr[0];

        //列表
        if(($pagePath == 'list' || $pagePath == 'slist') && count($pagePathArr) == 2){
            $typeid = $pagePathArr[1];
            $_REQUEST['typeid'] = (int)$typeid;
            $_REQUEST['id'] = (int)$typeid;

            //详情
        }elseif($pagePath == 'detail' && count($pagePathArr) == 2){
            $id = $pagePathArr[1];
            $_REQUEST['id'] = (int)$id;

            // 支付返回
        }elseif($pagePath == 'payreturn'){
            $_REQUEST['ordernum'] = $pagePathArr[1];

            // 评论
        }elseif($pagePath == 'comment'){
            $_REQUEST['id'] = (int)$pagePathArr[1];

        }else{
            $isSpecial = true;
        }

    }else{

        // 可以自定义URL规则的模块
        if($service == "image" || $service == "article" || ($service=="job" && $_REQUEST['id'])){
            $isSpecial = true;
        }
        // $isSpecial = true;
        // $pagePathArr = array($pagePath);
    }

    if(!$isSpecial) return $pagePath;

    $fields = array();
    $data = array();
    $fields = array();
    $dataArr = array();

    // if($service == "siteConfig"){
    if($pagePath == "help" || $pagePath == "notice"){
        if(isset($pagePathArr[1])){
            if(is_numeric($pagePathArr[1])){
                $_REQUEST['id'] = (int)$pagePathArr[1];
            }else{
                $pagePath = $pagePath.'-detail';
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
        }
    }elseif($pagePath == "about" || $pagePath == "protocol"){
        $_REQUEST['id'] = $pagePathArr[1];
    }elseif($pagePath == "complain"){
        $_REQUEST['module'] = $pagePathArr[1];
        $_REQUEST['dopost'] = $pagePathArr[2];
        $_REQUEST['aid'] = (int)$pagePathArr[3];
    }elseif($pagePathArr[0] == 'search' && $pagePathArr[1] == 'list'){
        $pagePath = 'search-list';
    }
    // }

//     print_r($service);
    if($service == "member"){
        // module

        if($pagePath == "order" || $pagePath == "collect" || $pagePath == "job" || $pagePath == "category" || $pagePath == "team" || $pagePath == "teamAdd" || $pagePath == "albums" || $pagePath == "albumsAdd" || $pagePath == "case" || $pagePath == "caseAdd" || $pagePath == "booking" || $pagePath == "resume" || $pagePath == "invitation" || $pagePath == "collections" || $pagePath == "renovation" || $pagePath=="marry" || $pagePath=="refund" || $pagePath=="refunddetail" ||$pagePath=="talkhistory" || $pagePath=="platformjoin" ||$pagePath == "saleafter" ||$pagePath == "refuserefund"  || $pagePath == "travel" || $pagePath == "returngoods" || $pagePath == "refunddetail_shop_express" || $pagePath == "commentdetail_shop" ){

            $_REQUEST['module'] = $pagePathArr[1];

            if($pagePath == 'refund'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'refunddetail'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'talkhistory'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'platformjoin'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'saleafter'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'refuserefund'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }
            if($pagePath == 'returngoods'){
                $_REQUEST['id'] = (int)$pagePathArr[2];
            }

            if($pagePath == 'refunddetail_shop_express'){
                $_REQUEST['id'] = (int)$pagePathArr[1];
            }
            if($pagePath == 'travel' && isMobile()){
                $pagePath .= "-".$pagePathArr[1];
                $_REQUEST['id'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';
            }
            if ($pagePath == 'commentdetail_shop'){
                $_REQUEST['id'] = $pagePathArr[1];
            }
            // id
        }elseif($pagePath == "message_detail" || $pagePath == "withdraw_log_detail" || $pagePath == "user"){

            $_REQUEST['id'] = (int)$pagePathArr[1];

            // module,id
        }elseif($pagePath == "orderdetail" || $pagePath == "logistic" || $pagePath == "write-comment"){

            if($pagePathArr[1] == 'business'){
                $_REQUEST['module'] = $pagePathArr[1];
                $_REQUEST['type'] = $pagePathArr[2];
                $_REQUEST['id'] = (int)$pagePathArr[3];
            }else{
                $_REQUEST['module'] = $pagePathArr[1];
                $_REQUEST['id'] = isset($pagePathArr[2]) ? $pagePathArr[2] : 0;
            }

        }elseif($pagePath == "config"){

            if($domainPart == "user"){
                $pagePath .= "-".$pagePathArr[1];
            }
            $mdf = explode('_', $pagePathArr[1]);
            // 不改变 controller中action的值，根据pagePath_ 重新指定模板
            if(count($mdf) > 1){
                $huoniaoTag->assign('pagePath_', "config-".$pagePathArr[1]);
            }
            $_REQUEST['module'] = $mdf[0];

            // add file

        }elseif($pagePath == "car" || $pagePath == "dating" || $pagePath == "huodong" || $pagePath == "verify" || $pagePath == "quan" || $pagePath == "house" || $pagePath == "checkout" || $pagePath == "payment-success" || $pagePath == "alipay-record" || strstr($pagePath, "enter") || strstr($pagePath, "select") || strstr($pagePath, "confirm") || strstr($pagePath, "upgrade") || $pagePath == "quan-tuan" || $pagePath == "select-module" || $pagePath == "confirm-order" || $pagePath == "payment-success" || $pagePath == "vote" || $pagePath =="sfcar" || $pagePath == 'proquan'){

            // 横线连接的不是数字则认为是文件名的一部分
            $pagePath = "";
            foreach ($pagePathArr as $v) {
                if(!is_numeric($v)){
                    $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
                }else{
                    $_REQUEST['id'] = (int)$v;
                }
            }
            // $pagePath .= isset($pagePathArr[1]) ? "-".$pagePathArr[1] : "";

            // file,type
        }elseif($pagePath == "business"){

            if(($pagePathArr[1] == "diancan" || $pagePathArr[1] == "dingzuo" || $pagePathArr[1] == "paidui" || $pagePathArr[1] == "maidan") && $pagePathArr[2] != 'orderdetail'){
                $pagePath .= "-service".(isset($pagePathArr[2]) ? "-".$pagePathArr[2] : "");
                $_REQUEST['type'] = $pagePathArr[1];
            }else{
                if($pagePathArr[2]){
                    $pagePath .= "-".$pagePathArr[1] . "-".$pagePathArr[2];
                }else{
                    $pagePath .= "-".$pagePathArr[1];
                }
            }

            // module,typeid,type
        }elseif($pagePath == "manage" || $pagePath == "fabu" || $pagePath == "statistics"){

            $_REQUEST['module'] = $pagePathArr[1];
            if(isset($pagePathArr[2])){
                if(is_numeric($pagePathArr[2])){
                    $_REQUEST['typeid'] = (int)$pagePathArr[2];
                }else{
                    $_REQUEST['type'] = $pagePathArr[2];
                }
            }

        }elseif($pagePath == "security"){

            $_REQUEST['doget'] = $pagePathArr[1];

        }elseif($pagePath == "complain"){
            $_REQUEST['module'] = $pagePathArr[1];
            $_REQUEST['dopost'] = $pagePathArr[2];
            $_REQUEST['aid'] = (int)$pagePathArr[3];
        }elseif($pagePath == "housem"){
            $_REQUEST['type'] = $pagePathArr[1];

        }elseif($pagePath == "homemaking"){
            $_REQUEST['module'] = $pagePathArr[1];
            $pagePath .= "-".$pagePathArr[1];
            $_REQUEST['id'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';
        }elseif($pagePath == "refund"){
//            $pagePath .= "-".$pagePathArr[1];
            $_REQUEST['module'] = $pagePathArr[1];
            $_REQUEST['id'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';
        }
        elseif($pagePath == "marry"){
            $pagePath .= "-".$pagePathArr[1];
            $_REQUEST['id'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';

            // module,id,type
        }elseif($pagePath == "fabusuccess"){
            $_REQUEST['module'] = $pagePathArr[1];
            if(isset($pagePathArr[2])){
                if(is_numeric($pagePathArr[2])){
                    $_REQUEST['id'] = (int)$pagePathArr[2];
                }else{
                    $_REQUEST['type'] = $pagePathArr[2];
                }
            }
        }elseif($pagePath == "travel" || $pagePath == "education" || $pagePath == "pension"){
            $pagePath .= "-".$pagePathArr[1];
            $_REQUEST['id'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';
        }
    }

    //新闻资讯
    if($service == 'article'){

        include_once(HUONIAOINC . '/config/'.$service.'.inc.php');

        if($pagePath == 'detailVideo'){
            $pagePath = 'detail';
        }

        //自定义路由
        $customTouchRouter = (int)$customTouchRouter;

        //自定义URL规则
        if($pagePath != "pay" && !strstr($pagePath, '-')){

            //根据reqUri判断是否为详细页
            //reqUri包含.html则代表详细页   比如：1.html
            //这里可能是媒体列表和详情页、头条、图片等新闻类型
            if(empty($pagePath)){
                $pagePath = 'index';
            }else{
                if(strstr($reqUri, '.html') || $pagePath == 'detail' || $pagePath == 'search'){
                    if(is_numeric($pagePath)){
                        $_REQUEST['id'] = (int)$pagePath;
                        $pagePath = 'detail';
                    }else{
                        $reqUri_ = basename($reqUri, ".html");
                        $reqUri_ = explode("-", $reqUri_);
                        if(isset($reqUri_[1])){
                            $_REQUEST['id'] = (int)$reqUri_[1];
                        }
                    }

                    //其他情况为列表页，包含分类全拼和简拼
                }else{
                    //全拼
                    if($custom_listRule == 1){
                        $_REQUEST['pinyin'] = $pagePath;
                        $pagePath = 'list';

                        //简拼
                    }elseif($custom_listRule == 2){
                        $_REQUEST['py'] = $pagePath;
                        $pagePath = 'list';
                    }
                }
            }
        }

        if(strstr($reqUri, 'search.html')){
            $pagePath = 'search';
        }

        //图说新闻
    }elseif($service == 'image'){
        include_once(HUONIAOINC . '/config/'.$service.'.inc.php');
        //自定义URL规则
        if(!strstr($pagePath, '-')){

            //根据reqUri判断是否为详细页
            //reqUri包含.html则代表详细页   比如：1.html
            if(strstr($reqUri, '.html')){
                $_REQUEST['id'] = (int)$pagePath;
                $pagePath = 'detail';

                //其他情况为列表页，包含分类全拼和简拼
            }else{
                //全拼
                if($custom_listRule == 1){
                    $_REQUEST['pinyin'] = $pagePath;
                    $pagePath = 'list';

                    //简拼
                }elseif($custom_listRule == 2){
                    $_REQUEST['py'] = $pagePath;
                    $pagePath = 'list';
                }

            }

        }

        if(strstr($reqUri, 'search.html')){
            $pagePath = 'search';
        }

        // 分类信息
    }elseif($service == 'info'){
        if($pagePathArr[0] == "store"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif ($pagePathArr[0] == "homepage"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif ($pagePathArr[0] == "business"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif ($pagePathArr[0] == "confirm"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif ($pagePathArr[0] == "pay"){
            $_REQUEST['ordernum'] = $pagePathArr[1];
        }elseif ($pagePathArr[0] == "store_list"){
            $_REQUEST['list_id'] = (int)$pagePathArr[1];
            $_REQUEST['addr_id'] = (int)$pagePathArr[2];
        }elseif ($pagePathArr[0] == "category"){
            $_REQUEST['typeid'] = (int)$pagePathArr[1];
        }elseif ($pagePathArr[0] == "comdetail"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        // 团
    }elseif($service == 'tuan') {
        if ($pagePath == 'list' || $pagePath == 'pintuan' || $pagePath == 'haodian' || $pagePath == 'voucher') {
            for ($s = 1; $s <= count($pagePathArr); $s++) {
                $dataArr[] = $pagePathArr[$s];
            }
            $fields = array("typeid", "addrid", "business", "subway", "station", "circle");
        } elseif ($pagePath == 'tdetail' || $pagePath == 'ptdetail' || $pagePath == 'detail' || $pagePath == 'pic' || $pagePath == 'review') {
            $_REQUEST['id'] = (int)$pagePathArr[1];
        } elseif ($pagePath == 'new') {
            $_REQUEST['typeid'] = isset($pagePathArr[1]) ? $pagePathArr[1] : 0;
        } elseif ($pagePath == 'store') {
            $_REQUEST['uid'] = (int)$pagePathArr[1];
        } elseif ($pagePath == 'buy') {
            $_REQUEST['id'] = (int)$pagePathArr[1];
            $_REQUEST['count'] = (int)$pagePathArr[2];
        } elseif ($pagePath == 'sqdetail' || $pagePath == 'dindan' || $pagePath == 'storereview' || $pagePath == 'storecommon') {
            $_REQUEST['id'] = (int)$pagePathArr[1];
        } elseif ($pagePath == 'shangquan') {
            for ($s = 1; $s <= count($pagePathArr); $s++) {
                $dataArr[] = $pagePathArr[$s];
            }
            $fields = array("typeid", "addrid", "circle");
        }
    }elseif($service == "paimai"){  // 拍卖
        if ($pagePath == 'store') {
            $_REQUEST['uid'] = (int)$pagePathArr[1];
        }
        elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        elseif($pagePath == "confirm"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        elseif($pagePath == "buy"){
            $_REQUEST['type'] = $pagePathArr[1];
            $_REQUEST['id'] = (int)$pagePathArr[2];
            $_REQUEST['num'] = (int)$pagePathArr[3];
        }
        elseif($pagePath == "list"){
            $_REQUEST['typeid'] = (int)$pagePathArr[1];
        }
        // 房产
    }elseif($service == 'house'){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if($pagePath == "faq"){
            $fields = array("typeid");
        }elseif($pagePath == "faq-detail"){
            $fields = array("id");
        }elseif($pagePath == "broker"){
            $fields = array("addrid", "business", "page");
        }elseif($pagePath == "broker-detail"){
            $fields = array("id", "tpl", "page");
        }elseif($pagePath == "loupan-news"){
            $fields = array("id", "page");
        }elseif($pagePath == "news" || $pagePath == "news-list"){
            $fields = array("typeid", "page");
        }elseif(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif(strstr($pagePath, "calculator") || strstr($pagePath, "map")){
            $pagePath = $pagePathArr[0];
            $fields = array("do");
            $dataArr = array($pagePathArr[1]);
        }elseif($pagePath == "xzl" || $pagePath == "cf"){
            $fields = array("type", "addrid", "business","area","price","protype","usertype","keywords","page");
        }elseif($pagePath == "sp"){
            $fields = array("type", "addrid", "business","area","price","protype","industry","usertype","keywords","page");
        }elseif($pagePath == "cw"){
            $fields = array("type", "addrid", "business","area","price","usertype","keywords","page");
        }else{
            if($pagePathArr[1] == "album" || $pagePathArr[1] == "album"){
                if($pagePathArr[2] != "detail"){
                    $fields = array("id", $pagePathArr[1]);
                }
            }elseif($pagePathArr[1] == "hx"){
                if($pagePathArr[2] != "detail"){
                    $fields = array("id", "room");
                }else{
                    $fields = array("id", "aid");
                }
            }elseif($pagePathArr[1] == "sale" || $pagePathArr[1] == "zu"){
                $fields = array("id", "page");

            }elseif($pagePathArr[1] == "broker"){
                if($pagePathArr[2] != "detail"){
                    $fields = array("addrid", "business", "page");
                }else{
                    $fields = array("id", "tpl", "page", "keywords");
                }
            }
        }
        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
        // 商城
    }elseif($service == 'shop'){

        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        if($pagePathArr[0] == "brand"){
            if($pagePathArr[1] != "detail"){
                $fields = array("typeid", "page");
            }else{
                $fields = array("id", "typeid", "page");
            }
        }elseif($pagePathArr[0] == "store"){
            if($pagePathArr[1] != "detail" && $pagePathArr[1] != "express"){
                $fields = array("typeid", "addrid", "business", "page");
                if($pagePathArr[1] == "category"){
                    $fields = array("id", "typeid", "addrid", "business", "page");
                }
            }else{
                $fields = array("id", "typeid", "page");
            }
        }elseif($pagePathArr[0] == "news"){
            if($pagePathArr[1] != "detail"){
                $fields = array("typeid", "page");
            }else{
                $fields = array("id", "typeid", "page");
            }
        }elseif($pagePathArr[0] == "bargain_detail" || $pagePathArr[0] == "dindan" || $pagePathArr[0] == "comment_detail"){
            $fields = array("id");
        }
        // 装修
    }elseif($service == 'renovation'){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "page");
        if($pagePathArr[0] == "zb"){
            if($pagePathArr[1] != "detail"){
                $fields = array("page");
            }
        }

        if($pagePathArr[0] == 'raiders' && is_numeric($pagePathArr[1])){
            $pagePath = 'raiders-list';
        }elseif($pagePathArr[0] == 'raiders' && $pagePathArr[1] == 'detail' && is_numeric($pagePathArr[2])){
            $pagePath = 'raiders-detail';
        }

        // 招聘
    }elseif($service == 'job'){
        if($pagePath=="company" && $_REQUEST['id']){
            $pagePath = "company-detail";
        }elseif($pagePath=="job" && $_REQUEST['id']){
            $pagePath="job";
        }elseif($pagePath=="resume" && $_REQUEST['id']){
            $pagePath="resume-detail";
        }elseif($pagePath=="zhaopinhui" && $_REQUEST['id']){
            $pagePath="zhaopinhui-detail";
        }elseif($pagePath=="displayimg"){
            $pagePath="displayimg";
        }else{
            $pagePath = "";
            $i = $end = 0;
            if(is_array($pagePathArr)){
                foreach ($pagePathArr as $k => $v) {
                    if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                        $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
                    }else{
                        $dataArr[] = urldecode($v);
                        $i++;
                        $end = 1;
                    }
                }
            }
        }

        if($i == 1){
            if($pagePath == "company" || $pagePath == "resume" || $pagePath == "zhaopinhui"){
                $pagePath = $pagePath."-detail";
            }
        }
        $fields = array("id");
        if($pagePathArr[0] == "news" || $pagePathArr[0] == "doc"){
            if($pagePathArr[1] != "detail"){
                $fields = array("typeid", "page");
            }
        }

        // 交友
    }elseif($service == 'dating'){
        if($pagePath == "activity" || $pagePath == "story" || $pagePath == "news"){
            if(isset($pagePathArr[1])){
                if($pagePath == "news"){
                    if($pagePathArr[1] == "list"){
                        $pagePath = $pagePath."-list";
                        if(isset($pagePathArr[2])){
                            $_REQUEST['typeid'] = (int)$pagePathArr[2];
                        }
                    }elseif($pagePathArr[1] == "detail"){
                        $pagePath = $pagePath."-detail";
                        $_REQUEST['id'] = (int)$pagePathArr[2];
                    }
                }else{
                    $pagePath = $pagePath."-detail";
                    $_REQUEST['id'] = (int)$pagePathArr[1];
                }
            }
        }elseif($pagePathArr[0] == "u" || $pagePathArr[0] == "getGift" || $pagePath == "hn_detail" || $pagePath == "store_detail" || $pagePath == "applyStore" || $pagePath == "hn_lead" || $pagePath == "fans" || $pagePath == "store_income_hn" || $pagePath == "my_user"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        // 外卖
    }elseif($service == 'waimai'){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id");
        if($pagePathArr[0] == "paotuipay"){
            $fields = array("orderid");
        }elseif($pagePathArr[0] == "detail"){
            $fields = array("id", "fid");
        }
        // 专题
    }elseif($service == "zhuanti"){
        if(isset($pagePathArr[1])){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        // 报刊
    }elseif($service == "paper"){
        if(isset($pagePathArr[1])){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        // 视频
    }elseif($service == "video"){
        if($pagePath == "list"){
            $_REQUEST['typeid'] = (int)$pagePathArr[1];
            if(isset($pagePathArr[2])){
                $_REQUEST['page'] = (int)$pagePathArr[2];
            }
        }else if($pagePath == "personal"){
            $_REQUEST['service'] = $pagePathArr[1];
            $_REQUEST['id'] = (int)$pagePathArr[1];

        }else if($pagePath == "albumlist"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }

        // 黄页
    }elseif($service == "huangye"){
        if($pagePath == "list"){
            $data = array();
            for($s = 1; $s <= count($pagePathArr); $s++){
                $data[] = $pagePathArr[$s];
            }
        }elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
        // 投票
    }elseif($service == "vote"){
        foreach ($pagePathArr as $k => $v) {
            if(is_numeric($v)){
                $dataArr[] = urldecode($v);
            }
        }
        $fields = array("id", "orderby", "page");
        if($pagePath=="search"){
            $fields = array("state", "orderby", "page");
        }
        // 贴吧
    }elseif($service == "tieba"){
        foreach ($pagePathArr as $k => $v) {
            if(is_numeric($v)){
                $dataArr[] = urldecode($v);
            }
        }
        $fields = array("id");
        // 活动
    }elseif($service == "huodong"){
        if($pagePath == "list"){
            $_REQUEST['typeid'] = isset($pagePathArr[1]) ? (int)$pagePathArr[1] : 0;
        }elseif($pagePath == "detail" || $pagePath == "business"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePath == "order"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
            $_REQUEST['fid'] = isset($pagePathArr[2]) ? (int)$pagePathArr[2] : '';
            $_REQUEST['ordernum'] = isset($pagePathArr[3]) ? $pagePathArr[3] : '';
        }
        // 积分商城
    }elseif($service == "integral"){
        if($pagePath == "confirm"){
            $pagePath = "confirm-order";
        }
        // 商家
    }elseif($service == "awardlegou"){
        if($pagePath == "confirm"){
            $pagePath = "confirm-order";
        }
        // 商家
    }if($service == "business"){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            // (int)substr($v, 0, 2) != 0 时 是订单号
            if(!$end && $v && strstr($v, ',') === false && (!is_numeric($v) && (int)$v == 0 && (int)substr($v, 0, 2) == 0) ){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }

        if($pagePath == "paidui-results" || $pagePath == "dingzuo-results"){
            $_REQUEST['ordernum'] = $dataArr[0];
        }else{
            $fields = array("bid", "id");
            if($pagePathArr[0] == "diancan"){
                $fields = array("bid", "fid");
            }elseif($pagePathArr[0] == "noticesdetail" || $pagePathArr[0] == "detail" || $pagePathArr[0] == "panord" || $pagePathArr[0] == "discovery"){
                $fields = array("id");
            }
        }

        // 直播
    }elseif($service == "live"){
        /* foreach ($pagePathArr as $k => $v) {
            if(is_numeric($v)){
                $dataArr[] = urldecode($v);
            }
        } */
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        if($pagePathArr[0] == "anchor_index"){
            $fields = array("userid");
        }elseif($pagePathArr[0] == "livelist"){
            $fields = array("typeid", "state", "orderby", "page");
        }elseif($pagePathArr[0] == "h_detail"){
            $fields = array("id");
        }elseif($pagePathArr[0] == "check_pass"){
            $fields = array("id");
        }elseif($pagePathArr[0] == "returnLivePay"){
            $fields = array("ordernum");
        }elseif ($pagePathArr[0] == "sharePage"){
            $fields = array("liveid");
        }elseif ($pagePathArr[0] == 'pay'){
            $fields = array("ordernum");
        }elseif($pagePathArr[0] =='sharePageAfter'){
            $fields = array("share_user","share_live");
        }elseif($pagePathArr[0] =='redPacket'){
            $fields = array("liveid", "chatid");
        }elseif($pagePathArr[0] == "search"){
            $fields = array("type", "orderby", "state", "page");
        }
        //汽车
    }elseif($service == "car"){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if($pagePath == "broker"){
            $fields = array("addrid", "business", "page");
        }elseif($pagePath == "broker-detail"){
            $fields = array("id", "tpl", "page");
        }elseif($pagePath == "news" || $pagePath == "news-list"){
            $fields = array("typeid", "page");
        }elseif(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }else{
            if($pagePathArr[1] == "detail"){
                $fields = array("id", "page");
            }
        }
        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
        //家政
    }elseif($service == "homemaking"){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif($pagePath == 'buy'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
            $_REQUEST['count'] = (int)$pagePathArr[2];
        }else{
            if($pagePathArr[1] == "detail"){
                $fields = array("id", "page");
            }
        }
        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
        //婚嫁
    }elseif($service == "marry"){
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if(strstr($pagePath, "store-detail")){
            $fields = array("id", "istype", "typeid");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
            $_REQUEST['typeid'] = (int)$pagePathArr[2];
        }elseif($pagePath == 'planmeallist'){
            $fields = array("id", "typeid", "istype", "businessid");
        }else{
            if($pagePathArr[1] == "detail"){
                $fields = array("id", "page");
            }
        }

        if($pagePath == "planmeal-detail"){
            $fields = array("id", "typeid", "istype", "businessid");
        }

        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
    }elseif($service == "travel"){//旅游
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePath == 'visa'){
            $fields = array("country");
        }elseif($pagePath == 'confirm-order'){
            $fields = array("type", "id");
        }elseif($pagePath == 'travel-ticketstate' || $pagePath == 'travel-hotelstate'){
            $fields = array("ordernum");
        }

        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
    }elseif($service == "education"){//教育
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePath == 'confirm-order'){
            $fields = array("type", "id");
        }

        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
    }elseif($service == "pension"){//养老
        $pagePath = "";
        $i = $end = 0;
        foreach ($pagePathArr as $k => $v) {
            if(!$end && $v && strstr($v, ',') === false && !is_numeric($v)){
                $pagePath = $pagePath ? ($pagePath."-".$v) : $v;
            }else{
                $dataArr[] = urldecode($v);
                $i++;
                $end = 1;
            }
        }
        $fields = array("id", "aid", "page");

        if(strstr($pagePath, "store-detail")){
            $fields = array("id");
            if($pagePath != "store-detail"){
                $data = array();
                for($s = 4; $s < count($pagePathArr); $s++){
                    $data[] = $pagePathArr[$s];
                }
                $pagePath = "store-detail";
                $_REQUEST['tpl'] = $pagePathArr[2];
            }
        }elseif($pagePath == 'detail'){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePath == 'confirm-order'){
            $fields = array("type", "id");
        }

        if(!strstr($pagePath, "-") && $i >= 1){
            $data = $dataArr;
        }
    }elseif($service == "circle"){
        if($pagePathArr[0] == "topic_detail"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePathArr[0] == "topic_charts"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }elseif($pagePathArr[0] == "blog_detail"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }


    }elseif($service == "sfcar"){
        if($pagePathArr[0] == "fabusuccess"){
            $_REQUEST['id'] = (int)$pagePathArr[1];
        }
    }elseif($service == "awardlegou"){
        if($pagePath == 'confirm-order'){
            $fields = array("proid");
        }
    }


    if($fields && $dataArr){
        foreach ($fields as $key => $value) {
            if(isset($dataArr[$key])){
                $_REQUEST[$value] = $dataArr[$key];
            }
        }
    }
    if($data){
        $_GET['data'] = join('-', $data);
    }
//     print_r($fields);
//     print_r($dataArr);
//     die;
    return $pagePath;
}


//根据第三方视频链接，获取真实文件播放地址
function getRealVideoUrl($url){
    if(!empty($url)){

        //腾讯视频
        //获取教程 https://www.jiezhe.net/post/38.html
        if(strstr($url, 'v.qq.com')){
            $vid = getUrlQuery($url, 'vid');
            if($vid){
                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, "http://vv.video.qq.com/getinfo?vids=$vid&platform=101001&charge=0&otype=json");
                curl_setopt($curl, CURLOPT_HEADER, 0);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($curl, CURLOPT_TIMEOUT, 5);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                $con = curl_exec($curl);
                curl_close($curl);

                if($con){
                    $con = str_replace('QZOutputJson=', '', $con);
                    $con = substr($con, 0, -1);
                    $con = json_decode($con, true);

                    if(is_array($con)){
                        $vl = $con['vl'];
                        $vi = $vl['vi'][0];
                        $ui = $vi['ul']['ui'][0];

                        $fn = $vi['fn'];  //mp4地址
                        $fvkey = $vi['fvkey'];  //fvkey
                        $url = $ui['url'];

                        return $url . $fn . '?vkey=' . $fvkey;
                    }
                }
            }
        }
        return $url;
    }
}


//替换emoji表情
function filter_emoji($str) {
    $regex = '/(\\\u[ed][0-9a-f]{3})/i';
    $str = json_encode($str);
    $str = preg_replace($regex, '', $str);
    return json_decode($str);
}


// ----------------------------审核流程
// 审核配置
function getAuditConfig($module = "article"){
    include HUONIAOINC."/config/".$module.".inc.php";
    return array(
        "switch" => (int)$custom_auditSwitch,
        "auth" => (int)$custom_auditAuth,
        "type" => (int)$custom_auditType,
    );
}
// 获取组织架构
function getAdminOrganizatList($id = 0){
    global $dsql;
    if($id){
        $parList = getParentArr("site_organizat", $id);
        if($parList && isset($parList[1])){

            $ret = array();
            global $data;
            $data     = $par_id = $par_admin = $par_name = array();
            $par_id   = parent_foreach($parList[1], "id");
            $data     = array();
            $par_name = parent_foreach($parList[1], "typename");

            foreach ($par_id as $key => $value) {
                $ret[$key] = array(
                    "id" => $par_id[$key],
                    "typename" => $par_name[$key],
                );
            }
            return $ret;
        }else{
            $ret = array();
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_organizat` WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "results");
            if($res){
                $ret[0] = array(
                    "top" => 1,
                    "id" => $id,
                    "typename" => $res[0]['typename'],
                );
            }
            return $ret;
        }
    }else{
        $ret = $dsql->getTypeList(0, "site_organizat", true, 1, 1000, "", "admin");
        return $ret;
    }
}
/**
 * [判断管理员是否在组织架构中]
 * @param  integer $admin   [管理员id]
 * @param  integer $checkid [有多个平行审核级别时，需要checkid]
 * @return [type]           [所在组织架构id]
 */
function getAdminOrganId($admin = 0, $checkid = 0){
    global $dsql;
    global $userLogin;
    if($admin == 0) $admin = $userLogin->getUserID();
    $reg = "(^$admin$|^$admin,|,$admin,|,$admin$)";
    $where = " `admin` REGEXP '".$reg."' ";
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_organizat` WHERE ".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        if($checkid){
            if($checkid == $ret[0]['id']){
                return $ret[0]['id'];
            }else{
                global $data;
                $data = "";
                $typeArr = getParentArr("site_organizat", $checkid);
                $typeArr = array_reverse(parent_foreach($typeArr, "id"));

                if(in_array($checkid, $typeArr)){
                    return $ret[0]['id'];
                }else{
                    return 0;
                }
            }
        }else{
            return $ret[0]['id'];
        }
    }else{
        return 0;
    }
}
/**
 * [判断当前管理员是否需要走审核流程]
 * 如果开启了审核流程，不是超管或一级审核人员，则走审核流程
 * @param  string  $module [description]
 * @param  boolean $strict [为true时，一级审核人员也返回true]
 * @return [type]          [description]
 */
function checkAdminArcrank($module = "article", $strict = false){
    global $dsql;
    global $userLogin;
    $adminID = $userLogin->getUserID();
    $config = getAuditConfig($module);
    $need_audit = 0;
    // 开启审核
    if($config['switch']){
        $purview = $userLogin->getPurview();
        // 排除超级管理员
        if(!preg_match('/founder/i', $purview)){
            $organizat = getAdminOrganizatList();
            if($organizat){
                $need_audit = 1;
                global $data;
                $data = array();
                $organizat_admin = parent_foreach($organizat, "admin");
                $has = false;
                foreach ($organizat_admin as $key => $value) {
                    $ids = explode(',', $value);
                    if(in_array($adminID, $ids)){
                        $has = true;
                        // 顶级管理员不需要走审核流程
                        if($key == 0){
                            if($strict){
                                $need_audit = 2;
                            }else{
                                $need_audit = 0;
                            }
                        }
                        // if($key == 0 && !$strict){
                        //     $need_audit = false;
                        // }
                        break;
                    }
                }
                // if(!$has) $need_audit = false;
            }

        }
    }

    return $need_audit;
}
// 获取管理员在组织机构中的详细信息
function getAdminOrganDetail($admin = 0){
    global $dsql;
    global $userLogin;
    if($admin == 0) $admin = $userLogin->getUserID();

    $detail = array();

    $reg = "(^$admin$|^$admin,|,$admin,|,$admin$)";
    $where = " `admin` REGEXP '".$reg."' ";
    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_organizat` WHERE ".$where);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $ret = $ret[0];
        $arc = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = ".$admin);
        $res = $dsql->dsqlOper($arc, "results");
        $nickname = $res[0]['nickname'];

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_organizat` WHERE `parentid` = ".$ret['id']);
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            $bottom = 0;
        }else{
            $bottom = 1;
        }
        $top = $ret['parentid'] ? 0 : 1;

        $detail = array(
            "id" => $ret[id],
            "typename" => $ret['typename'],
            "nickname" => $nickname,
            "top" => $top,
            "bottom" => $bottom,
        );
    }

    return $detail;
}
// 验证当前管理员是否可修改信息状态，并且审核人员没有审核通过
function checkAdminEditAuth($module, $aid){
    global $dsql;
    global $userLogin;
    $adminID = $userLogin->getUserID();

    $config = getAuditConfig($module);
    // 开启审核
    if($config['switch']){

        $tab = $module."list";
        $sql = $dsql->SetQuery("SELECT `arcrank`, `audit_log` FROM `#@__".$tab."` WHERE `id` = $aid AND `admin` = $adminID");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            // 全部为待审核状态才可编辑
            $audit_log = $ret[0]['audit_log'];
            if($audit_log){
                $audit_log = unserialize($audit_log);
                if($audit_log){
                    if($ret[0]['arcrank'] == 1){
                        return false;
                    }
                    $all_wait = true;
                    foreach ($audit_log as $key => $value) {
                        if($value['state'] != 0){
                            $all_wait = false;
                            break;
                        }
                    }
                    if($all_wait){
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return true;
                }
            }else{
                return true;
            }
        }else{
            return false;
        }
    }else{
        return true;
    }

    return true;
}

//获取蜘蛛爬虫名或防采集
function isSpider(){
    $bots = array(
        'Google'    => 'googlebot',
        'Baidu'     => 'baiduspider',
        '360'       => '360spider',
        'Yahoo'     => 'yahoo! slurp',
        'Soso'      => 'sosospider',
        'Msn'       => 'msnbot',
        'Altavista' => 'scooter',
        'Sogou'     => 'sogou spider',
        'Sogou1'     => 'sogou',
        'Yodao'     => 'yodaobot',
        'Bing'      => 'bingbot',
        'Slurp'     => 'slurp'
    );
    $userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if($userAgent){
        foreach($bots as $k => $v){
            // 有浏览器标识不作为爬虫
            if((strstr($v,$userAgent) || strstr($userAgent,$v)) && strstr($userAgent, 'browser') == false){
                return $k;
                break;
            }
        }
    }
    return false;
}



//通过出生年月获取属相及生肖
function birthdayInfo($bithday){
    if(strstr($bithday,'-') === false && strlen($bithday) !== 8){
        $bithday = date("Y-m-d",$bithday);
    }

    if(strlen($bithday) < 8){
        return false;
    }
    $tmpstr= explode('-',$bithday);
    if(count($tmpstr)!==3){
        return false;
    }
    $y=(int)$tmpstr[0];
    $m=(int)$tmpstr[1];
    $d=(int)$tmpstr[2];
    $result=array();
    $xzdict=array('摩羯','水瓶','双鱼','白羊','金牛','双子','巨蟹','狮子','处女','天秤','天蝎','射手');
    $zone=array(1222,122,222,321,421,522,622,722,822,922,1022,1122,1222);
    if((100*$m+$d)>=$zone[0]||(100*$m+$d)<$zone[1]){
        $i=0;
    }else{
        for($i=1;$i<12;$i++){
            if((100 * $m + $d) >= $zone[$i] && (100 * $m + $d) < $zone[$i+1]){
                break;
            }
        }
    }
    $result['xz']=$xzdict[$i].'座';
    $gzdict=array(array('甲','乙','丙','丁','戊','己','庚','辛','壬','癸'),array('子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'));
    $i= $y-1900+36;
    $result['gz']=$gzdict[0][($i%10)].$gzdict[1][($i%12)];
    $sxdict=array('鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪');
    $result['sx']=$sxdict[(($y-4)%12)];
    return $result;
}

//获取融云Token
function getRongCloudToken($uid = 0, $username = '', $photo = ''){
    global $dsql;

    if(empty($uid)) return array("state" => 200, "info" => '会员ID不得为空！');

    //获取融云配置
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data = $ret[0];
        $appKey = $data['rongKeyID'];
        $appSecret = $data['rongKeySecret'];

        if($appKey && $appSecret){
            //获取token
            include_once(HUONIAOINC."/class/imserver/im.class.php");
            $RongCloud = new im($appKey, $appSecret);

            $token = $RongCloud->getToken($uid, $username, $photo);
            $tokenArr = json_decode($token, true);
            if($tokenArr['code'] != 200){
                return array("state" => 200, "info" => '获取token参数错误！');
            }

            return $tokenArr['token'];
        }else{
            return array("state" => 200, "info" => '融云参数未填写，请至后台APP配置中填写完整！');
        }

    }else{
        return array("state" => 200, "info" => '服务器配置参数获取失败！');
    }

}


//查找文章id所在的表
function getBreakTableById($articleId)
{
    global $dsql;
    $sql_choose = $dsql->SetQuery("SELECT * FROM `#@__article_breakup_table`");
    $breakup_table_res = $dsql->dsqlOper($sql_choose, "results");
    $compareArr = array_column($breakup_table_res, 'begin_id');
    if($index = array_search($articleId, $compareArr)){
        $break_table_name = $breakup_table_res[$index]['table_name'];
    }else{
        array_push($compareArr, $articleId);
        array_push($compareArr, 0);
        sort($compareArr);
        $index = array_search($articleId, $compareArr);
        $search_begin_id = $compareArr[$index-1];
        if($search_begin_id == 0){
            $break_table_name = '#@__articlelist';
        }else{
            $table_index = array_search($search_begin_id, array_column($breakup_table_res, 'begin_id'));
            $break_table_name = $breakup_table_res[$table_index]['table_name'];
        }
    }
    return $break_table_name;
}

//计算两个时间戳相差的时分秒
function timediff($begin_time,$end_time){
    if($begin_time < $end_time){
        $starttime = $begin_time;
        $endtime = $end_time;
    }else{
        $starttime = $end_time;
        $endtime = $begin_time;
    }
    //计算天数
    $timediff = $endtime-$starttime;
    $days = intval($timediff/86400);
    //计算小时数
    $remain = $timediff%86400;
    $hours = intval($remain/3600);
    //计算分钟数
    $remain = $remain%3600;
    $mins = intval($remain/60);
    //计算秒数
    $secs = $remain%60;
    $res = array("day" => $days,"hour" => $hours,"min" => $mins,"sec" => $secs);
    return $res;
}
//创建文章分表
function createArticleTable($lastId){
    global $dsql;
    global $DB_PREFIX;
    $startId = (int)$lastId+1;
    $tableName = '#@__articlelist_' . $startId;
//     $sql = $dsql->SetQuery("DESC `#@__articlelist`");
//     $res = $dsql->dsqlOper($sql, "results");
//     $sql2 = "CREATE TABLE `$tableName`(";
//     foreach ($res as $re){
//         $Field = $re['Field'];
//         $Type = $re['Type'];
//         $Null = $re['Null'] == "NO" ? "NOT NULL" : "";
//         $Extra = $re['Extra'];
//         if(is_null($re['Default'])){
//             $Default = '';
//         }else{
//             $Default = $re['Default'] == "" ? 'DEFAULT \'\'' : ("DEFAULT " . $re['Default']);
//         }
//         $sql2 .= "$Field $Type $Null $Extra $Default, ";
//     }
//     $sql2 .= "  PRIMARY KEY (`id`),
//   KEY `title` (`title`),
//   KEY `typeid` (`typeid`),
//   KEY `arcrank` (`arcrank`),
//   KEY `del` (`del`,`arcrank`,`typeid`,`flag`,`litpic`,`weight`) USING BTREE,
//   KEY `flag` (`flag`),
//   KEY `admin` (`admin`),
//   KEY `keywords` (`keywords`),
//   KEY `weight` (`weight`,`id`),
//   KEY `flag_` (`flag_h`,`flag_b`,`flag_r`,`flag_t`,`flag_p`)
// ) ";
// $sql2 .= "ENGINE=MyISAM AUTO_INCREMENT=$startId DEFAULT CHARSET=utf8 COMMENT='新闻信息';";
// $sql3 = $dsql->SetQuery($sql2);
// $dsql->dsqlOper($sql3, "update");

    $sql = $dsql->SetQuery("show create table #@__articlelist");
    $res = $dsql->dsqlOper($sql, "results");
    $defSql = $res[0]['Create Table'];
    $defSql = str_replace("\r","",$defSql);
    $defSql = str_replace("\n","",$defSql);
    $defSql = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "AUTO_INCREMENT=$startId", $defSql);

    // 创建分表
    $sql = str_replace($DB_PREFIX.'articlelist', "{$tableName}", $defSql);
    $sql = $dsql->SetQuery($sql);
    $res = $dsql->dsqlOper($sql, "update");

    // $sql = $dsql->SetQuery("CREATE TABLE IF NOT EXISTS {$tableName} (LIKE `#@__articlelist`)");
    // $res = $dsql->dsqlOper($sql, "udpate");

    // 更新主表总表关联表
    $sql = $dsql->SetQuery("SELECT * FROM `#@__article_breakup_table`");
    $res = $dsql->dsqlOper($sql, "results");
    $un = array();
    $un[] = "`#@__articlelist`";
    foreach ($res as $key => $value) {
        $un[] = "`".$value['table_name']."`";
    }
    $un[] = "`{$tableName}`";


    $sql = $dsql->SetQuery("DROP TABLE IF EXISTS `#@__articlelist_all`");
    $res = $dsql->dsqlOper($sql, "update");

    $sql = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "", $defSql);
    $sql = str_replace('articlelist', "articlelist_all", $sql);
    $sql = str_replace('ENGINE=MyISAM', 'ENGINE=MRG_MyISAM', $sql);
    $sql .= " UNION=(".join(",", $un).");";
    $sql = $dsql->SetQuery($sql);
    $res = $dsql->dsqlOper($sql, "update");

    // // 更新主表总表关联表
    // $sql = $dsql->SetQuery("SELECT * FROM `#@__article_breakup_table`");
    // $res = $dsql->dsqlOper($sql, "results");

    // $un = array();
    // $un[] = "`#@__articlelist`";
    // foreach ($res as $key => $value) {
    //     $un[] = "`".$value['table_name']."`";
    // }
    // $un[] = "`{$tableName}`";
    // $sql = $dsql->SetQuery("ALTER TABLE `#@__articlelist_all` UNION=(".join(",", $un).")");
    // $res = $dsql->dsqlOper($sql, "update");
    return $tableName;
}

//保存分表记录
function saveBreakUpTable($new_table, $startId){
    global $dsql;
    $startId = $startId + 1;
    $sql = $dsql->SetQuery("INSERT INTO `#@__article_breakup_table` (`table_name`, `begin_id`) VALUES ('$new_table', $startId)");
    $dsql->dsqlOper($sql, "update");
}
//获取分表
function getReverseBreakTable(){
    global $dsql;
    $sql_choose = $dsql->SetQuery("SELECT * FROM `#@__article_breakup_table`");
    $breakup_table_res = $dsql->dsqlOper($sql_choose, "results");
    $break_last_table = $breakup_table_res[count($breakup_table_res)-1]['table_name']; //最新的表
    $rev_break_table_res = array_reverse($breakup_table_res);
    array_push($rev_break_table_res, array('table_name' => '#@__articlelist', 'begin_id' =>0));
    return array('tables' => $rev_break_table_res, 'last_table' => $break_last_table);
}


//获取指定key
function pageCountGet($key)
{
    global $dsql;
    $now = time();
    $key = str_replace("'", "\"", $key);
    $sql = $dsql->SetQuery("SELECT * FROM `#@__article_pagecount_cache` WHERE `key` = '$key'");
    $res = $dsql->dsqlOper($sql, "results");
    return $res[0]['value'];
}
//是否存在
function pageCountHas($key)
{
    global $dsql;
    $key = str_replace("'", "\"", $key);
    $sql = $dsql->SetQuery("SELECT * FROM `#@__article_pagecount_cache` WHERE `key` = '$key'");
    $res = $dsql->dsqlOper($sql, "results");
    if(!empty($res)){
        return 1;
    }else{
        return 0;
    }
}
//是否过期
function pageCountGuoQi($key)
{
    global $dsql;
    $now = time();
    $key = str_replace("'", "\"", $key);
    $sql = $dsql->SetQuery("SELECT * FROM `#@__article_pagecount_cache` WHERE `key` = '$key'");
    $res = $dsql->dsqlOper($sql, "results");
    $insert_time = $res[0]['update_at'];
    $diff = timediff($insert_time, $now);
    if($diff['hour'] > 2){
        return 0;
    }else{
        return 1;
    }
}
//更新key
function pageCountUp($key, $value)
{
    global $dsql;
    $time = time();
    $key = str_replace("'", "\"", $key);
    $sql = $dsql->SetQuery("UPDATE `#@__article_pagecount_cache` SET `value` = $value, `update_at` = $time WHERE `key` = '$key'");
    $dsql->dsqlOper($sql, "update");
}
//设置key
function pageCountSet($key, $value){
    global $dsql;
    $time = time();
    $key = str_replace("'", "\"", $key);
    $sql = $dsql->SetQuery("INSERT INTO `#@__article_pagecount_cache` (`key`, `value`, `update_at`) VALUES ('$key', $value, $time)");
    $dsql->dsqlOper($sql, "lastid");
}

// 创建店铺时更新店铺开关
function updateStoreSwitch($module, $tab, $uid, $aid){
    global $dsql;
    if(empty($module) || empty($tab) || empty($uid) || empty($aid)) return;
    $state = 1;

    $sql = $dsql->SetQuery("SELECT `bind_module` FROM `#@__business_list` WHERE `uid` = $uid");
    $ret = $dsql->dsqlOper($sql, "results");
    if(!$ret) return;

    $bind_module = $ret[0]['bind_module'];
    if(empty($bind_module)){
        $state = 0;
    }else{
        $bind_module = explode(",", $bind_module);
        if(!in_array($module, $bind_module)){
            $state = 0;
        }
    }
    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `store_switch` = $state WHERE `id` = $aid");
    $dsql->dsqlOper($sql, "update");
}

// 商家模块管理
function checkShowModule($bind_module = array(), $usetype = "manage", $getConfig = "", $getUrl = "", $uid = 0){
    global $dsql;
    global $userLogin;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $langData;
    global $cfg_staticVersion;

    $uid = $uid ? $uid : $userLogin->getMemberID();
    if($uid < 0) return;

    $userinfo = $userLogin->getMemberPackage($uid);
    $package = is_array($userinfo) && $userinfo['package'] ? $userinfo['package'] : array();
    $modules = $package ? $package['modules'] : array();

    $bind_module = array();

    if($modules){
        if($modules['privilege']){
            foreach ($modules['privilege'] as $key => $value) {
                if($value['name'] != 'daohang' && $value['name'] != 'caidan' && $value['name'] != 'xiaochengxu'){
                    $bind_module[$value['name']] = $value;
                }
            }
        }

        if($modules['store']){
            foreach ($modules['store'] as $key => $value) {
                $bind_module[$value['name']] = $value;
            }
        }
    }
    return $bind_module;
}



//生成自定义小程序二维码
function createWxMiniProgramScene($url = '', $path = '../..', $async = false, $module = '', $cityid = 0){
    if(empty($url)) {
        if($async){
            return array("state" => 200, "info" => '链接不能为空！');
        }else {
            die(json_encode(array("state" => 200, "info" => '链接不能为空！')));
        }
    }

    //往数据库添加数据
    global $dsql;
    $sql = $dsql->SetQuery("SELECT `id`, `fid` FROM `#@__site_wxmini_scene` WHERE `url` = '$url' AND `module` = '$module' AND `cityid` = '$cityid'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret && $ret[0]['fid']){
        if($async) {
            return getFilePath($ret[0]['fid']);
            // return array("state" => 200, "info" => '要生成的链接已经存在，无须重复创建！');
        }else{
            die(json_encode(array("state" => 100, "info" => "要生成的链接已经存在，无须重复创建！")));
            // die(json_encode(array("state" => 200, "info" => '要生成的链接已经存在，无须重复创建！')));
        }
    }

    $time = time();
    $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxmini_scene` (`url`, `date`, `fid`, `count`, `module`, `cityid`) VALUES ('$url', '$time', '', '0', '$module', '$cityid')");
    $lid = $dsql->dsqlOper($sql, "lastid");
    if(!is_numeric($lid)){
        if($async) {
            return array("state" => 200, "info" => '添加失败，请到商店中校验并同步最新的数据库结构！');
        }else{
            die(json_encode(array("state" => 200, "info" => '添加失败，请到商店中校验并同步最新的数据库结构！')));
        }
    }

    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    $miniAppid = $cfg_miniProgramAppid;
    $miniSecret = $cfg_miniProgramAppsecret;

    //如果指定了分站，查询该分站是否绑定独立小程序
    if($cityid){
        $config = getMiniProgramCityAdvancedConfig('', $cityid);
        if($config){
            $miniAppid = $config['appid'];
            $miniSecret = $config['appsecret'];
        }
        //如果分站没有绑定独立小程序，再获取下请求来源中的小程序APPID，根据APPID再获取自定义配置
        else{
            $referer = $_SERVER['HTTP_REFERER'];
            if($referer && strstr($referer, 'servicewechat.com')){
                $referer = str_replace('https://servicewechat.com/', '', $referer);
                $refererArr = explode('/', $referer);
                $_appid = $refererArr[0];
                $config = getMiniProgramCityAdvancedConfig($_appid);
                if($config){
                    $miniAppid = $config['appid'];
                    $miniSecret = $config['appsecret'];
                }
            }
        }
    }

    //获取小程序token
    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($miniAppid, $miniSecret);
    $access_token = $jssdk->getWxminiAccessToken(); //获取token


    // $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$miniAppid&secret=$miniSecret";
    // $curl = curl_init();
    // curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($curl, CURLOPT_TIMEOUT, 3);
    // curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    // curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    // curl_setopt($curl, CURLOPT_URL, $url);
    // $res = json_decode(curl_exec($curl));
    // curl_close($curl);
    // if(isset($res->errcode)) {
    //     $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_scene` WHERE `id` = $lid");
    //     $dsql->dsqlOper($sql, "update");
    //     if($async) {
    //         return array("state" => 200, "info" => $res->errcode . "_" . $res->errmsg);
    //     }else {
    //         die(json_encode(array("state" => 200, "info" => $res->errcode . "_" . $res->errmsg)));
    //     }
    // }
    // $access_token = $res->access_token;

    $url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='.$access_token;
    $data = array(
        'scene'         => $lid,
        'width'         => 500,
        'page'          => 'pages/redirect/index'
    );

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_TIMEOUT, 3);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_POST, true);// 是否为POST请求
    curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));// 处理请求数据
    $res = curl_exec($curl);
    $res_ = json_decode($res, true);
    curl_close($curl);

    if(isset($res_['errcode'])) {
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_scene` WHERE `id` = $lid");
        $dsql->dsqlOper($sql, "update");
        if($async) {
            return array("state" => 200, "info" => $res_['errcode'] . "_" . $res_['errmsg']);
        }else {
            die(json_encode(array("state" => 200, "info" => $res_['errcode'] . "_" . $res_['errmsg'])));
        }
    }

    /* 上传配置 */
    $config = array(
        "savePath" => $path . "/uploads/siteConfig/wxminProgram/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/"
    );
    $fieldName = array($res);

    global $cfg_ftpUrl;
    global $cfg_fileUrl;
    global $cfg_uploadDir;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpDir;
    global $cfg_quality;
    global $cfg_softSize;
    global $cfg_softType;
    global $cfg_editorSize;
    global $cfg_editorType;
    global $cfg_videoSize;
    global $cfg_videoType;
    global $cfg_meditorPicWidth;
    global $editorMarkState;
    global $editor_ftpType;
    global $editor_ftpState;
    global $customUpload;
    global $custom_uploadDir;
    global $customFtp;
    global $custom_ftpType;
    global $custom_ftpState;
    global $custom_ftpDir;
    global $custom_ftpServer;
    global $custom_ftpPort;
    global $custom_ftpUser;
    global $custom_ftpPwd;
    global $custom_ftpDir;
    global $custom_ftpUrl;
    global $custom_ftpTimeout;
    global $custom_ftpSSL;
    global $custom_ftpPasv;
    global $custom_OSSUrl;
    global $custom_OSSBucket;
    global $custom_EndPoint;
    global $custom_OSSKeyID;
    global $custom_OSSKeySecret;
    global $custom_QINIUAccessKey;
    global $custom_QINIUSecretKey;
    global $custom_QINIUbucket;
    global $custom_QINIUdomain;
    global $editor_ftpDir;
    global $custom_OBSUrl;
    global $custom_OBSBucket;
    global $custom_OBSEndpoint;
    global $custom_OBSKeyID;
    global $custom_OBSKeySecret;
    global $custom_COSUrl;
    global $custom_COSBucket;
    global $custom_COSRegion;
    global $custom_COSSecretid;
    global $custom_COSSecretkey;
    global $editor_uploadDir;

    $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
    $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
    $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

    $editor_uploadDir = $cfg_uploadDir;
    $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
    $editor_ftpType = $cfg_ftpType;

    $custom_ftpState = $editor_ftpState = $cfg_ftpState;
    $custom_ftpType = $cfg_ftpType;
    $custom_ftpSSL = $cfg_ftpSSL;
    $custom_ftpPasv = $cfg_ftpPasv;
    $custom_ftpUrl = $cfg_ftpUrl;
    $custom_ftpServer = $cfg_ftpServer;
    $custom_ftpPort = $cfg_ftpPort;
    $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
    $custom_ftpUser = $cfg_ftpUser;
    $custom_ftpPwd = $cfg_ftpPwd;
    $custom_ftpTimeout = $cfg_ftpTimeout;
    $custom_OSSUrl = $cfg_OSSUrl;
    $custom_OSSBucket = $cfg_OSSBucket;
    $custom_EndPoint = $cfg_EndPoint;
    $custom_OSSKeyID = $cfg_OSSKeyID;
    $custom_OSSKeySecret = $cfg_OSSKeySecret;
    $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
    $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
    $custom_QINIUbucket = $cfg_QINIUbucket;
    $custom_QINIUdomain = $cfg_QINIUdomain;
    $custom_OBSUrl = $cfg_OBSUrl;
    $custom_OBSBucket = $cfg_OBSBucket;
    $custom_OBSEndpoint = $cfg_OBSEndpoint;
    $custom_OBSKeyID = $cfg_OBSKeyID;
    $custom_OBSKeySecret = $cfg_OBSKeySecret;
    $custom_COSUrl = $cfg_COSUrl;
    $custom_COSBucket = $cfg_COSBucket;
    $custom_COSRegion = $cfg_COSRegion;
    $custom_COSSecretid = $cfg_COSSecretid;
    $custom_COSSecretkey = $cfg_COSSecretkey;

    $remoteImg = json_decode(getRemoteImage($fieldName, $config, 'siteConfig', $path, false, 1), true);
    if($remoteImg['state'] == 'SUCCESS'){
        $fid = $remoteImg['list'][0]['fid'];
    }else{
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_scene` WHERE `id` = $lid");
        $dsql->dsqlOper($sql, "update");
        if($async) {
            return array("state" => 200, "info" => "文件创建失败，请检查上传配置！");
        }else{
            die(json_encode(array("state" => 200, "info" => "文件创建失败，请检查上传配置！")));
        }
    }

    $sql = $dsql->SetQuery("UPDATE `#@__site_wxmini_scene` SET `fid` = '$fid' WHERE `id` = $lid");
    $ret = $dsql->dsqlOper($sql, 'update');
    if($ret == 'ok') {
        if($async) {
            return getFilePath($fid);
        }else{
            die(json_encode(array("state" => 100, "info" => "创建成功！")));
        }
    }else{
        $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxmini_scene` WHERE `id` = $lid");
        $dsql->dsqlOper($sql, "update");
        if($async) {
            return array("state" => 200, "info" => "创建失败！");
        }else{
            die(json_encode(array("state" => 200, "info" => "创建失败！")));
        }
    }
}


function checkOnlineUserCount($time = 0, $max = 10, $speed = 0){
    set_time_limit(1);
    if($time == 0) return true;
    $file = HUONIAOROOT."/data/cache/";

    if (!file_exists($file)) {
        if (!mkdir("$file", 0777, true)) {
            return false;
        };
    }

    $file = $file . 'user.txt';

    if(!is_file($file)){
        @fopen($file, "w");
        $content = "";
    }else{
        $fp = @fopen($file, "r");
        $content = @fread($fp, filesize($file));
    }

    $max += 3;
    $ratio = $time > 1234567890 ? 1000 : 1;

    $r = false;
    $body = array();
    $now = time() * $ratio;
    if(empty($content)){
        $r = true;
        $body = array(
            "s".$time => array($time, $now, $speed)
        );
    }else{
        $content = unserialize($content);
        // print_r($content);

        $has = false;
        $all_use = true;
        foreach ($content as $key => $value) {
            if( ($now - $value[1]) < ($max * $ratio) ){
                if($key == "s".$time){
                    $has = true;
                    $body[$key] = array($value[1], $now, $speed);
                }else{
                    $body[$key] = $value;
                }
                if($value[2] == 0) $all_use = false;
            }
        }
        if(!$has){
            $body["s".$time] = array($time, $now, $speed);
        }
    }

    if(!$all_use){
        $i = 0;
        foreach ($body as $key => $value) {
            if($value[2] == 0){
                if($i == 0 && "s".$time == $key){
                    $r = true;
                    break;
                }
                $i++;
            }
        }
    }else{
        $body_ = array_sortby($body, 2, SORT_DESC);
        $first_key = key($body_);
        if("s".$time == $first_key) $r = true;
    }

    $body = serialize($body);
    $fp = @fopen($file, "w");
    @fwrite($fp, $body);
    @fclose($fp);

    return $r;

}


//查询快递进度
// {
//     "datetime": "2019-01-26 11:27:28",
//     "remark": "[郑州市]顺丰速运 已收取快件",
//     "zone": ""
// }
function getExpressTrack($com, $no, $tab, $id){
    global $dsql;
    global $cfg_juhe;
    $no = trim($no);
    $sq = $dsql->SetQuery("SELECT `exp_time`,`exp_track` FROM `#@__".$tab."` WHERE `id` = $id");
    $wuliu = $dsql->dsqlOper($sq, "results");
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $cfg_time  = $cfg_juhe['exp_time'] ? $cfg_juhe['exp_time'] : 0;

    $now       = GetMkTime(time());                   //当前时间分钟
    $exo_time  = $wuliu[0]['exp_time'];               //数据时间分钟
    $time_exp  = ($now - $exo_time) * 60;             //当前减去之前的 分钟
    $time      = $cfg_time * 60 ;                     //后台设置的分钟

    if ($time_exp < $time && !empty($wuliu[0]['exp_track']) && $wuliu[0]['exp_track'] != 'a:0:{}'){          //如果减去后的分钟小于后台设置的分钟 直接返回
        $list = $wuliu[0]['exp_track'];
        return $list;
    }else{
        $key = $cfg_juhe['express'];

        if(!empty($key) && $com && $no) {

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, "http://v.juhe.cn/exp/index?com=$com&no=$no&key=" . $key);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 1);
            $con = curl_exec($curl);
            curl_close($curl);

            $con = json_decode($con, true);
            if ($con['resultcode'] == 200) {
                $data = $con['result'];
                $list = serialize(array_reverse($data['list']));

                //物流信息不会发生变化时将数据存到订单信息表中
                if($data['status']){
                    $checktime = GetMkTime(time());
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `exp_track` = '$list',`exp_time` = '$checktime' WHERE `id` = $id");
                    $dsql->dsqlOper($sql, "update");
                }

                return $list;
            }

        }else{

            $key = $cfg_juhe['aliyun'];
            $com = getAliyunWdexpressCompany($com);
            $appcode = $key;//开通服务后 买家中心-查看AppCode
            $headers = array();
            array_push($headers, "Authorization:APPCODE " . $appcode);
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, "https://wdexpress.market.alicloudapi.com/gxali?n=$no&t=$com");
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($curl, CURLOPT_FAILONERROR, false);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_HEADER, true);
            curl_setopt($curl, CURLOPT_TIMEOUT, 1);

            if (1 == strpos("$" . 'https://wdexpress.market.alicloudapi.com', "https://")) {
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            }
            $out_put = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            list($header, $body) = explode("\r\n\r\n", $out_put, 2);
            if ($httpCode == 200) {
                //初始化日志
                include_once(HUONIAOROOT."/api/payment/log.php");
                $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/logistic/'.date('Y-m-d').'.log', true);
                $_courierOrderLog->DEBUG('物流查询');

                $data = json_decode($body, true);

                foreach ($data['Traces'] as &$key){
                    $key['remark'] = $key['AcceptStation'];
                    $key['datetime'] = $key['AcceptTime'];
                    unset($key['AcceptStation'],$key['AcceptTime']);
                }
                $list = serialize(array_reverse($data['Traces']));

                //签收后，将快递时间更新为10年后，相当于不用再查接口了
                $checktime = GetMkTime(time());
                if($data['State'] == 3){
                    $checktime = GetMkTime(time()) + (86400 * 365 * 10);
                }
                $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `exp_track` = '$list',`exp_time` = '$checktime' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
                return $list;
            }
        }
    }
}


/**
 * 读取缓存
 * disabled 禁用缓存，如会员中心信息列表
 */
function getCache($module, $sql, $time = 0, $param = array()){
    global $HN_memory;
    global $dsql;
    $cache = true;
    if(is_array($param)){
        extract($param);
    }else{
        $sign = $param;
    }

    if(gettype($sql) == "string"){
        $sql = str_replace("\t", " ", $sql);
        $sql = str_replace("\n", " ", $sql);
        $sql = str_replace("\r", " ", $sql);
        $sql = str_replace("  ", " ", $sql);

        $sql2 = strtolower($sql);
        $sign = $sign ? $sign : base64_encode($sql2);
        $sign = $module . '_' . $sign;


        // 列表只缓存第一页的数据
        $limit = strstr($sql2, "limit");
        if($limit){
            if(strstr($limit, ",")){
                $limit_ = str_replace("limit", "", $limit);
                $limit_ = trim($limit_);
                $num = explode(",", $limit_);
                $s = (int)$num[0];
                $e = (int)$num[1];
                if($s >= $e && $s >= 10){
                    $cache = false;
                }
            }
        }
    }else{
        $sign = $module . ($sign ? "_".$sign : "");
    }

    global $_G;
    $md5Key = base64_encode("getCache_" . $sign);

    if(isset($_G[$md5Key])){
        return $_G[$md5Key];
    }

    $memberCache = empty($disabled) && $cache ? $HN_memory->get($sign) : FALSE;
    if($test){
        // var_dump($memberCache);die;
    }
    if($memberCache !== NULL && $memberCache !== FALSE){
        $results = $memberCache;
    }else{
        if(gettype($sql) == "string"){
            $results = $dsql->dsqlOper($sql, $type ? $type : "results", "ASSOC", null, $sensitive);
        }else{
            $results = call_user_func($sql);
        }
        if($name && is_array($results)){
            $results = $results ? $results[0][$name] : "";
        }
        if($disabled || !$cache) {
            $_G[$md5Key] = $results;
            return $results;
        }
        // 如果结果为空，缓存时间强制设为300秒
        if(empty($results) && $time == 0) $time = 300;
        $HN_memory->set($sign, $results, $time);

        // 列表查询，保存这条缓存包含哪些数据
        if(empty($name) && $limit && $results && isset($results[0]['id'])){
            $now = time();
            $sign_key = $module."_key";
            $data = $HN_memory->get($sign_key);
            $data = $data ? $data : array();
            if($data){
                $has = false;
                foreach ($data as $key => $value) {
                    if($key == $sign){
                        $has = true;
                        $list = array_merge($data[$sign]['list'], array_column($results, 'id'));
                        $data[$key]['list'] = $list;

                    }elseif($HN_memory->get($key) === false){
                        unset($data[$key]);
                    }
                }
                if(!$has){
                    $data[$sign] = array(
                        'sql' => $sql,
                        'list' => array_column($results, 'id')
                    );
                }
            }else{
                $data[$sign] = array(
                    'sql' => $sql,
                    'list' => array_column($results, 'id')
                );
            }
            $HN_memory->set($sign_key, $data);
        }elseif($savekey){
            $sign_key = $module."_key";
            $save_sign = gettype($sql) == 'string' ? $sql : '';
            $data = $HN_memory->get($sign_key);
            $data = $data ? $data : array();
            if($data){
                if(!array_search($sign, $data)){
                    $data[$sign] = $save_sign;
                }
            }else{
                $data[$sign] = $save_sign;
            }
            $HN_memory->set($sign_key, $data);
        }

    }
    if(strstr($sign, 'detail') && count($results) == 1 && isset($results[0]['click'])){
        $results[0]['click']++;
        $HN_memory->set($sign, $results);
        $results[0]['click']--;
    }
    $_G[$md5Key] = $results;
    return $results;
}

/**
 * 清除缓存
 * sign=key 时清除所有结果集缓存
 */
function clearCache($module, $sign = "key"){
    global $HN_memory;
    if($sign == "key"){
        $sign_key = $module."_key";
        $data = $HN_memory->get($sign_key);
        if($data){
            foreach ($data as $key => $value) {
                $HN_memory->rm($key);
            }
        }
        // 清除分类名称缓存
        if(!strstr($module, "list")){
            for($i = 1; $i < 400; $i++){
                $HN_memory->rm($module."_".$i);
            }
        }

        $HN_memory->rm($sign_key);
        return;
    }
    $arr = is_array($sign) ? $sign : explode(",", $sign);
    foreach ($arr as $key => $value) {
        $HN_memory->rm($module . "_" . $value);
    }
}

/**
 * 检查缓存，结果集类型
 */
function checkCache($module, $ids){
    if(empty($ids)) return;
    global $HN_memory;
    $sign_key = $module."_key";
    $data = $HN_memory->get($sign_key);
    if($data){
        $count = count($data);
        $idArr = is_array($ids) ? $ids : explode(",", $ids);
        foreach ($idArr as $id) {
            foreach ($data as $key => $value) {
                if($value && is_array($value) && in_array($id, $value['list'])){
                    $HN_memory->rm($key);
                    unset($data[$key]);

                    // 遍历清除 sql中limit左边部分相同的缓存
                    $sql = explode("limit", $value['sql']);
                    $sql = $sql[0];
                    foreach ($data as $k => $v) {
                        if(strstr($v['sql'], $sql)){
                            $HN_memory->rm($k);
                            unset($data[$k]);
                        }
                    }
                }
            }
        }
        if($data){
            if(count($data) != $count){
                $HN_memory->set($sign_key, $data);
            }
        }else{
            $HN_memory->rm($sign_key);
        }
    }
}


/**
 * 发布新信息时更新缓存
 */
function updateCache($module, $time = 0){
    global $dsql;
    global $HN_memory;

    $sign_key = $module."_key";
    $data = $HN_memory->get($sign_key);
    if($data){
        foreach ($data as $key => $value) {
            $sql = $value['sql'];
            $res = $dsql->dsqlOper($sql, "results");
            $HN_memory->set($key, $res, $time);
        }
    }
}

/**
 * 取每个5分钟整的时间戳
 */
function getTimeStep(){
    $time = time();
    $hour = date("H");
    $minute = date("i");
    $minute_ = 0;
    $step = 5;
    if($minute > 10){
        $g = $minute % 10;
        $minute_ = $minute - $g;
        if($g >= $step){
            $minute_ += $step;
        }
    }
    return strtotime(date("Y-m-d {$hour}:{$minute_}"));
}

/**
 * 商城订单打印
 */
function printerShopOrder($id){
    global $cfg_shortname;
    global $dsql;
    global $langData;

    $date = GetMkTime(date("Y-m-d"));

    $sql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`people`, o.`address`, o.`contact`, o.`note`, o.`paytype`, o.`orderdate`, o.`branchid`, s.`title` shoptitle,s.`id` sid, b.`title` branchtitle FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE o.`id` = '$id'");
    // $sql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`people`, o.`address`, o.`contact`, o.`note`, o.`paytype`, o.`orderdate`, o.`branchid`, s.`bind_print`, s.`print_config`, s.`title` shoptitle, b.`title` branchtitle, b.`bind_print` branchbind_print, b.`print_config` branchprint_config FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE o.`id` = '$id'");

    require_once(HUONIAOROOT."/api/payment/log.php");
    $_shopPrintLog = new CLogFileHandler(HUONIAOROOT . '/log/shopPrint/'.date('Y-m-d').'.log');
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data               = $ret[0];
        $id                 = $data['id'];
        $note               = $data['note'];
        $ordernum           = $data['ordernum'];
        $paytype            = $data['paytype'];
        $orderdate          = date("Y-m-d H:i:s", $data['orderdate']);
        $branchid           = $data['branchid'];
        $shoptitle          = $data['shoptitle'];
        // $bind_print         = $data['bind_print'];
        // $print_config       = $data['print_config'];
        $branchtitle        = $data['branchtitle'];
        // $branchbind_print   = $data['branchbind_print'];
        // $branchprint_config = $data['branchprint_config'];
        $people             = $data['people'];
        $address            = $data['address'];
        $contact            = $data['contact'];
        $sid                = $data['sid'];
        //打印机查询(2020/4/28)
        $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE `sid` = ".$sid." AND `service` = 'shop' ");
        $printret = $dsql->dsqlOper($printsql,"results");
        // $printret = $printret[0];

        // $bind_print = $printret['bind_print'];
        if(!empty($branchid)){
            $storeName    = $branchtitle;
            $bprintsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE  `sid` = ".$branchid." AND `service` = 'shop'");
            $bprintret = $dsql->dsqlOper($bprintsql,"results");

            // $bprintret = $bprintret[0];
            if(empty($bprintret)){
                // $bind_print   = $bind_print;
                $print_config = $printret;
            }else{
                // $bind_print   = $branchbind_print;
                $print_config = $bprintret;
            }
        }else{
            $storeName    = $shoptitle;
            // $bind_print   = $bind_print;
            $print_config = $printret;
        }
        if (empty($printret)) {
            return;
        }

        $totalAmount = 0;
        //查询商品信息
        $productTitle = '<table><tr><td>商品名</td><td>数量</td><td>小计</td></tr>';
        $productTitle .= '</table>';
        $productList = array();
        $sql = $dsql->SetQuery("SELECT p.`title`, op.`specation`, op.`price`, op.`count`, op.`logistic` FROM `#@__shop_order_product` op LEFT JOIN `#@__shop_product` p ON p.`id` = op.`proid` WHERE op.`orderid` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){
                $price = sprintf("%.2f", $val['price'] * $val['count']);
                $val['specation'] = (str_replace('$$$',',',$val['specation']));
                array_push($productList, $val['title']. ($val['specation'] ? "(". $val['specation'].")" : "")."\r                 ×<FB>".$val['count']."</FB>     ".$price . "\r................................");

                $totalAmount += $val['price'] * $val['count'];
            }
        }
        $productList = join("\r", $productList);
        //备注
//        $noteText = $note ? $note : "";
        $noteText = $note ? "<FH2><FW>备注：$note</FW></FH2>" : "";


        //支付方式
        $paytypeName = "";
        $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '$paytype'");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!empty($ret)){
            $paytypeName = $ret[0]['pay_name'];
        }else{
            $paytypeName = empty($paytype) ? "积分或余额" : ($paytype == 'delivery' ? '货到付款' : ($paytype == 'money' ? '余额' : ($paytype == 'point' ? '积分' : $paytype)));
        }


        $content = "<FB><FH2><center>".$storeName."</center></FH2></FB>
********************************
单号：$ordernum
时间：$orderdate
姓名：$people
电话：$contact
地址：$address
********************************
$productTitle
$productList

<FS>合计：".sprintf("%.2f", $totalAmount)."元</FS>
支付：$paytypeName
********************************
$noteText



";
        include(HUONIAOINC . '/config/shop.inc.php');
        require_once(HUONIAOINC . '/class/waimaiPrint.class.php');
//        $partner = $customPartnerId;
//        $apikey = $customPrintKey;
        $print = new waimaiPrint();

        // if($bind_print==1 && $print_config){
        // $print_config = unserialize($print_config);
        if(!empty($print_config)){
            foreach ($print_config as $k => $v) {
                    $sqlprint = $dsql->SetQuery("SELECT * FROM `#@__business_print` p  LEFT JOIN `#@__business_print_config` c ON p.`type` = c.`print_code` WHERE p.`id` = " . $v['printid'] . " ");
                    $printresult = $dsql->dsqlOper($sqlprint, "results");
      //            $customPrintPlat = $printresult[0]['type'];
                    $customPrintPlat = $printresult[0]['print_code'] == 'yilianyun' ? 1 : 2;  //目前只有两种平台，易联云为1，其他为2
                    $customPrintType = $printresult[0]['printmodule'];
                    $printConfig = unserialize($printresult[0]['print_config']);

                    $printConfigArr = array();
                    //验证配置
                    foreach ($printConfig as $key => $value) {
                        if (!empty($value['value'])) {
                            $printConfigArr[$value['name']] = $value['value'];
                        }
                    }
                    $partner = $printConfigArr['MembrID'];
                    $apikey = $printConfigArr['signkey'];
                    $user = $printConfigArr['user'];
                    $ukey = $printConfigArr['ukey'];;
                    $ucount = $printConfigArr['number'] ? $printConfigArr['number']  : 1;
                    $ucount = $ucount ? $ucount : 1;  //打印份数
                    $mcode =   $printresult[0]['mcode'];
                    $msign =   $printresult[0]['msign'];
                    if ($partner && $apikey && $mcode && $msign && $content) {
                        $report = $print->action_print($partner, $mcode, $content, $apikey, $msign);
                        $report = json_decode($report, true);
                        $_shopPrintLog->DEBUG(date("Y-m-d H:i:s",time()) . "\r" . json_encode($report) . "\r\n\r\n");
                        if ($report['state'] == 1) {
                            $print_dataid = $report['id'];
                            $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `print_dataid` = '$print_dataid' WHERE `id` = $id");
                            $dsql->dsqlOper($sql, "update");
                        }
                    }

            }
        }
        // }


    }

}


//全局输出商家入驻配置信息
function getBusinessJoinConfig(){
    $businessHandlers = new handlers("business", "config");
    $businessConfig   = $businessHandlers->getHandle();
    if($businessConfig && $businessConfig['state'] == 100){
        $config = $businessConfig['info'];
        return array(
            'joinState' => (int)$config['joinState'],  //商家入驻功能  0开启  1关闭
            'joinTimesUnit' => (int)$config['joinTimesUnit'],  //入驻时长单位  0按月  1按年
            'privilege' => $config['privilege'],  //店铺特权
            'store' => $config['store'],  //行业店铺
            // 'package' => $config['package'],  //套餐
            'joinTimes' => $config['joinTimes'],  //入驻时间
            // 'joinSale' => $config['joinSale'],  //满减
            // 'joinPoint' => $config['joinPoint']  //送积分
        );
    }else{
        return array();
    }
}


//华为云上传接口使用
function createSampleFile($filePath)
{
    if(file_exists($filePath)){
        return;
    }
    $filePath = iconv('UTF-8', 'GBK', $filePath);
    if(is_string($filePath) && $filePath !== '')
    {
        $fp = null;
        $dir = dirname($filePath);
        try{
            if(!is_dir($dir))
            {
                mkdir($dir,0755,true);
            }

            if(($fp = fopen($filePath, 'w')))
            {

                for($i=0;$i< 1000000;$i++){
                    fwrite($fp, uniqid() . "\n");
                    fwrite($fp, uniqid() . "\n");
                    if($i % 100 === 0){
                        fflush($fp);
                    }
                }
            }
        }finally{
            if($fp){
                fclose($fp);
            }
        }
    }
}


/**
 * Use basic multipart upload for file upload.
 *
 * @param OssClient $ossClient OssClient instance
 * @param string $bucket bucket name
 * @throws OssException
 */
function putObjectByRawApis($config = array()){

    global $autoload;
    $accessKey    = $config['accessKey'];    //Access Key ID
    $accessSecret = $config['accessSecret']; //Access Key Secret
    $endpoint     = $config['endpoint'];     //EndPoint
    $bucketName   = $config['bucketName'];   //Bucket名称
    $object       = $config['object'];       //上传后的文件路径
    $uploadFile   = $config['uploadFile'];   //本地文件路径

    if(substr($object, 0, 1) == "/"){
        $object = substr($object, 1);
    }

    try {
        $autoload = true;
        $ossClient = new OssClient($accessKey, $accessSecret, $endpoint, false);
    } catch (OssException $e) {
        return array(
            'state' => 200,
            'info'  => $e->getMessage()
        );
    }

    /**
     *  step 1. Initialize a block upload event, that is, a multipart upload process to get an upload id
     */
    try {
        $uploadId = $ossClient->initiateMultipartUpload($bucketName, $object);
    } catch (OssException $e) {
        return array(
            'state' => 200,
            'info'  => $e->getMessage()
        );
    }

    /*
     * step 2. Upload parts
     */
    $partSize = 5 * 1024 * 1024;  //每片最大5M

    $uploadFileSize = filesize($uploadFile);
    $pieces = $ossClient->generateMultiuploadParts($uploadFileSize, $partSize);
    $responseUploadPart = array();
    $uploadPosition = 0;
    $isCheckMd5 = true;
    foreach ($pieces as $i => $piece) {
        $fromPos = $uploadPosition + (integer)$piece[$ossClient::OSS_SEEK_TO];
        $toPos = (integer)$piece[$ossClient::OSS_LENGTH] + $fromPos - 1;
        $upOptions = array(
            $ossClient::OSS_FILE_UPLOAD => $uploadFile,
            $ossClient::OSS_PART_NUM => ($i + 1),
            $ossClient::OSS_SEEK_TO => $fromPos,
            $ossClient::OSS_LENGTH => $toPos - $fromPos + 1,
            $ossClient::OSS_CHECK_MD5 => $isCheckMd5,
        );
        if ($isCheckMd5) {
            $contentMd5 = OssUtil::getMd5SumForFile($uploadFile, $fromPos, $toPos);
            $upOptions[$ossClient::OSS_CONTENT_MD5] = $contentMd5;
        }
        //2. Upload each part to OSS
        try {
            $responseUploadPart[] = $ossClient->uploadPart($bucketName, $object, $uploadId, $upOptions);
        } catch (OssException $e) {
            return array(
                'state' => 200,
                'info'  => $e->getMessage()
            );
        }
    }
    $uploadParts = array();
    foreach ($responseUploadPart as $i => $eTag) {
        $uploadParts[] = array(
            'PartNumber' => ($i + 1),
            'ETag' => $eTag,
        );
    }
    /**
     * step 3. Complete the upload
     */
    try {
        $ret = $ossClient->completeMultipartUpload($bucketName, $object, $uploadId, $uploadParts);
    } catch (OssException $e) {
        return array(
            'state' => 200,
            'info'  => $e->getMessage()
        );
    }

    //删除本地文件
    $arr = explode('.', $uploadFile);
    if(end($arr) != 'xls' && end($arr) != 'xlsx' && !strstr($uploadFile, 'house/community') && !strstr($uploadFile, "card") && !strstr($uploadFile, "photo")){
        // 房产小区远程图片本地化上传会太慢，有时会失败，所以先不删除本地附件，待本地化成功后，将本地文件夹上传至OSS后可恢复此行 by gz 20190219
        unlinkFile($uploadFile);
    }

    return true;
}


// 经纬度转换
function bd_decrypt($bd_lon, $bd_lat){
    $x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    $x = $bd_lon - 0.0065;
    $y = $bd_lat - 0.006;
    $z = sqrt($x * $x + $y * $y) - 0.00002 * sin($y * $x_pi);
    $theta = atan2($y, $x) - 0.000003 * cos($x * $x_pi);
    $data['lng'] = $z * cos($theta);
    $data['lat'] = $z * sin($theta);
    return$data;
}

/*
    $type       1  结算  2获取结算佣金
*/
function getwaimai_staticmoney($type,$id,$fenxiaoarr=array()){
    global $userLogin;
    global $fencheng_foodprice;
    global $paytypee;
    global $dsql;
    global $cfg_pointName;
    global $cfg_pointRatio;

    $type = (int)$type;

    $inc = HUONIAOINC . "/config/waimai.inc.php";
    include $inc;

    $sql = $dsql->SetQuery("SELECT o.`state`,o.`ordernumstore`,o.`id`, o.`sid`,o.`ordernum`, m.`userid`,o.`food`, o.`priceinfo`, o.`usequan`,o.`refrundstate`, o.`refrundamount`, o.`fencheng_foodprice`, o.`fencheng_delivery`, o.`fids`,o.`fencheng_dabao`, o.`fencheng_addservice`,o.`fencheng_zsb`,  o.`fencheng_addservice`,o.`fencheng_discount`, o.`fencheng_promotion`, o.`fencheng_firstdiscount`, o.`fencheng_quan`,o.`zsbprice` ,o.`cpmoney`, o.`cptype`, o.`ordertype`,o.`songdate`,o.`okdate`,s.`underpay`,s.`shopname`,o.`amount`,o.`ptprofit`,o.`lng`,o.`lat`,o.`peidate`,o.`okdate`,o.`peisongid`,o.`courierfencheng`,s.`coordX`,s.`coordY`,s.`open_additional`,s.`additional_name`,s.`additional_rule`,o.`point`,o.`additional`, s.`peisong_type` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop_manager` m ON o.`sid` = m.`shopid` LEFT JOIN `#@__waimai_shop` s ON s.`id` = m.`shopid`  WHERE o.`id` = ".$id . " ORDER BY m.`id` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $business = 0;
        $orderres = $ret[0];

        /*查询有无结算*/
        $jiesuansql = $dsql->SetQuery("SELECT `id` FROM `#@__member_money` WHERE `ordernum` = '".$orderres['ordernum']."' AND `ordertype` = 'waimai' AND `ctype` = 'shangpinxiaoshou'");
        $jiesuanres = $dsql->dsqlOper($jiesuansql, "results");
        if($jiesuanres && is_array($jiesuanres) && $type!=2) return;

        $fenxiaoTotalPricept = $fenxiaoTotalPricebu = $foodTotal = $peisongTotal = $dabaoTotal = $addserviceTotal = $discountTotal = $promotionTotal = $firstdiscountTotal = $youhuiquanTotal = $memberYouhuiTotal = $ktvipTotal = $refundTotalPrice= $refund = $additional = 0;
        $food                   = unserialize($orderres['food']);
        $priceinfo              = unserialize($orderres['priceinfo']);
        $fencheng_foodprice     = (int)$orderres['fencheng_foodprice'];     //商品原价分成
        $fencheng_delivery      = (int)$orderres['fencheng_delivery'];      //配送费分成
        $fencheng_dabao         = (int)$orderres['fencheng_dabao'];         //打包分成
        $fencheng_addservice    = (int)$orderres['fencheng_addservice'];    //增值服务费分成
        $fencheng_zsb           = (int)$orderres['fencheng_zsb'];           //准时宝分成
        $fencheng_discount      = (int)$orderres['fencheng_discount'];      //折扣分摊
        $fencheng_promotion     = (int)$orderres['fencheng_promotion'];     //满减分摊
        $fencheng_firstdiscount = (int)$orderres['fencheng_firstdiscount']; //首单减免分摊
        $fencheng_quan          = (int)$orderres['fencheng_quan'];          //优惠券分摊
        $ordertype              = (int)$orderres['ordertype'];              //0-外送,1-店内
        $underpay               = (int)$orderres['underpay'];               //线下支付关闭0-,1-开启
        $shopname               = $orderres['shopname'];
        $amount                 = $orderres['amount'];
        $ptprofit               = $orderres['ptprofit'];
        $courierfencheng        = (float)$orderres['courierfencheng'];             /*骑手分成*/
        $point        = (int)$orderres['point'];             //积分抵扣
        $_additional = (float)$orderres['additional'];  //该笔订单商家承担的额外费用
        $peisong_type = (int)$orderres['peisong_type'];  //配送方式  0默认  1强制平台自己配送
        
        $orderstate = (int)$orderres['state'];  //订单状态 1为已完成

        $pointAmount = $point > 0 ? (float)sprintf('%.2f',($point / $cfg_pointRatio)) : 0;

        $open_additional = (int)$orderres['open_additional'];  //是否开启额外费用  0关闭  1开启
        $additional_name = $orderres['additional_name'] ? $orderres['additional_name'] : '额外承担';  //额外费用的名称
        $additional_rule = $orderres['additional_rule'] ? unserialize($orderres['additional_rule']) : array();  //额外费用规则


        if($ordertype == 1 && $underpay ==1) return array('ptyd' => '0','business'=>$amount);
        $fidsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list` WHERE `is_discount` = 1 AND `id` In (".$orderres['fids'].")");
        $foodis_discount = $dsql->dsqlOper($fidsql,"results");


        // 优惠券
        $usequan = (int)$orderres['usequan'];
        //准时宝费用
        $zsbprice = $orderres['zsbprice'];

        $quanBili = 100;
        if($usequan){
            $quanSql = $dsql->SetQuery("SELECT `bear` FROM `#@__waimai_quanlist` WHERE `id` = $usequan");
            $quanRet = $dsql->dsqlOper($quanSql, "results");
            if($quanRet){
                $bear = $quanRet[0]['bear'];
                // 平台和店铺分担
                if(!$bear){
                    $quanBili = $fencheng_quan;
                }
            }
        }

        //计算单个订单的商品原价
        if($food){
            foreach ($food as $k_ => $v_) {
//                if($v_['is_discount'] ==1 && empty((float)$ptprofit)){
//                    $v_['price'] = $v_['price']/($v_['discount_value']/10);
//                }elseif(!empty((float)$ptprofit) && isset($v_['yuanpprice'])){
//                    $v_['price'] =  (float)$v_['yuanpprice'];
//                }改功能已经丢弃

                if($v_['is_discount'] ==1 && (float)$v_['price']!=0){
                    $v_['price'] = $v_['price']/($v_['discount_value']/10);
                }
                $foodTotal += $v_['price'] * $v_['count'];
            }
        }

        //计算商家需要承担的额外费用
        // if($type == 3){
            if($open_additional && $additional_rule){
                foreach ($additional_rule as $k => $v) {
                    if ($foodTotal >= $v[0] && $foodTotal <= $v[1]) {
                        $additional = (float)$v[2];
                    }
                }
            }

            //如果商品的金额 < 需要承担的额外费用，则强制将额外承担费用归0
            if($foodTotal < $additional){
                $additional = 0;
            }
            
        //订单完成后，并且不是结算请求时，额外费用取数据库中的值
        if($orderstate == 1 && $type != 3){
            $additional = $_additional;
        }

        //店内扫码点餐，不加额外费用
        if($ordertype == 1){
            $additional = 0;
        }

        //费用详情
        if($priceinfo){

            $auth_peisong = 0;
            foreach ($priceinfo as $k_ => $v_) {
                if($v_['type'] == "peisong"){
                    $peisongTotal += $v_['amount'];
                }
                if($v_['type'] == "dabao"){
                    $dabaoTotal += $v_['amount'];
                }
                if($v_['type'] == "fuwu"){
                    $addserviceTotal += $v_['amount'];
                }
                if($v_['type'] == "youhui"){
                    $discountTotal += $v_['amount'];
                }
                if($v_['type'] == "manjian"){
                    $promotionTotal += $v_['amount'];
                }
                if($v_['type'] == "shoudan"){
                    $firstdiscountTotal += $v_['amount'];
                }
                if($v_['type'] == "quan"){
                    $youhuiquanTotal += -$v_['amount'];
                }
                if(strpos($v_['type'], "uth_") !== false){
                    $memberYouhuiTotal += $v_['amount'];
                }
                if($v_['type'] == "ktvip"){
                    $ktvipTotal +=$v_['amount'];
                    $ktvipTotalPrice +=$v_['amount'];
                }
                if($v_['type'] == "auth_peisong"){
                    $auth_peisong+=$v_['amount'];
                }

                //恶劣天气配送费
                if($v_['type'] == "peisong_badWeather"){
                    $peisongTotal += $v_['amount'];
                }
            }
        }

        if($orderres['refrundstate'] == 1){
            $refund = $orderres['refrundamount'] != "0.00" ? $orderres['refrundamount'] : $orderres['amount'];
            $refundTotalPrice += $refund;
        }


        //计算准时宝(平台)
        if($orderres['cptype'] == 3){
            $ptzsb = $orderres['cpmoney'];
            $btzsb = 0;
            $qszsb = 0;

        //计算准时宝(骑手)
        }elseif($orderres['cptype'] == 2){
            $qszsb = $orderres['cpmoney'];
            $ptzsb = 0;
            $btzsb = 0;

        //计算准时宝(商家)
        }else{
            $btzsb = $orderres['cpmoney'];
            $ptzsb = 0;
            $qszsb = 0;
        }

        $zjye = ($foodTotal -$refund) - $discountTotal - $promotionTotal - $firstdiscountTotal + $dabaoTotal + $peisongTotal + $addserviceTotal - $youhuiquanTotal+ $zsbprice -$memberYouhuiTotal; //$ktvipTotal

        /*骑手所得*/
        $courreward = 0;
        $peisongid = $orderres['peisongid'];
        if ($peisongTotal !='0' && $peisongid != 0 && $ordertype == 0 && $type !=2 && ($custom_otherpeisong == 0 || $peisong_type == 1)) {

            $ulng      = $orderres['lng'];
            $ulat      = $orderres['lat'];
            $coordX    = $orderres['coordX'];
            $coordY    = $orderres['coordY'];
            $peidate   = $orderres['peidate'];
            $okdate    = $orderres['okdate'];

            $couriersql = $dsql->SetQuery("SELECT `getproportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
            $courierres = $dsql->dsqlOper($couriersql,"results");

            $getproportion = (float)$courierres[0]['getproportion'];

            /*商城距离用户*/
            $shopjluser = getDistance($coordY, $coordX, $ulng, $ulat);
            $shopjluser = $shopjluser / 1000;
            if ($shopjluser == 0 ) {
                $shopjluser = oldgetDistance($coordY, $coordX, $ulng, $ulat)/1000;
            }
            /*骑手完成时间 从骑手接单时间开始计算*/
            $qsoktime   = ($okdate - $peidate)%86400/60;

            /*骑手额外所得*/
            $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array();
            /*外卖额外加成要求*/
            $waimaadditionkm  = $custom_waimaadditionkm  != '' ? unserialize($custom_waimaadditionkm) : array();

//            $courierfencheng = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;

//            $peisongTotal -= $auth_peisong;
            $courreward   = $peisongTotal * $courierfencheng / 100;
            sort($waimaadditionkm);
            $satisfy = $additionprice = 0;
            for ($i=0; $i < count($waimaadditionkm); $i++) {
                if ($shopjluser > $waimaadditionkm[$i][0] && $shopjluser <= $waimaadditionkm[$i][2] && $qsoktime <= $waimaadditionkm[$i][1]) {
                    $satisfy = 1;
                    break;
                }
            }
            if ($satisfy == 1) {

                for ($a=0; $a < count($waimaiorderprice); $a++) {

                    if ($amount >= $waimaiorderprice[$a][0] && $amount <= $waimaiorderprice[$a][1]) {
                        $additionprice = $waimaiorderprice[$a][2];
                    }
                }
            }

            $courierarr = array();
            $courierarr['peisongTotal']     = $peisongTotal;        /*配送费*/
            $courierarr['courierfencheng']  = $courierfencheng;     /*骑手分成*/
            $courierarr['shopjluser']       = $shopjluser;          /*商城距离用户*/
            $courierarr['qsoktime']         = $qsoktime;            /*骑手完成用时*/
            $courierarr['amount']           = $amount;              /*订单总金额*/
            $courierarr['additionprice']    = $additionprice;       /*骑手加成所得*/
            $courierarr     = serialize($courierarr);

            $courreward += $additionprice;

            $courreward -= $qszsb; //准时宝

            $waimaiordersql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `courier_gebili` = '$courierarr' ,`courier_get` = '$courreward' WHERE `id` = '$id'");
            $dsql->dsqlOper($waimaiordersql,"update");
            $updatesql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money`+'$courreward' WHERE `id` = '$peisongid'");
            $dsql->dsqlOper($updatesql,"update");
            $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$peisongid'");           //查询骑手余额
            $courieMoney = $dsql->dsqlOper($selectsql,"results");
            $courierMoney = $courieMoney[0]['money'];
            $date = GetMkTime(time());
            $info ='外卖收入:'.$shopname.','.$orderres['ordernumstore'].','.$orderres['ordernum'];

            if($additionprice > 0){
                $info .= ",含额外加成：" . $additionprice;
            }

            //记录操作日志
            $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`) VALUES ('$peisongid','1','$courreward','$info','$date','$courierMoney')");
            $dsql->dsqlOper($insertsql,"update");
            //初始化日志
            include_once(HUONIAOROOT."/api/payment/log.php");
            $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
            $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
            $_courierOrderLog->DEBUG('骑手外卖收入:'.$courreward.'骑手账户:'.$courierMoney);

        }
        //查询骑手收入
        elseif($peisongid){
            $info ='外卖收入:'.$shopname.','.$orderres['ordernumstore'].','.$orderres['ordernum'];
            $sql = $dsql->SetQuery("SELECT `amount` FROM `#@__member_courier_money` WHERE `userid` = '$peisongid' AND `type` = 1 AND `info` like '".$info."%'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $courreward = $ret[0]['amount'];
            }
        }

        $zjyearr = array(
            array(
                'name'  => '商品总价(商品价格-退款价格)',
                'price' => floatval(sprintf('%.2f',$foodTotal)).' - '. sprintf('%.2f',$refund),
                'type'  => '',
                'money' => sprintf('%.2f',$foodTotal - $refund)
            ),
            array(
                'name'  => '折扣',
                'price' => sprintf('%.2f',$discountTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$discountTotal)
            ),
            array(
                'name'  => '满减',
                'price' => sprintf('%.2f',$promotionTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$promotionTotal)
            ),
            array(
                'name'  => '首单',
                'price' => sprintf('%.2f',$firstdiscountTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$firstdiscountTotal)
            ),
            array(
                'name'  => '打包',
                'price' => sprintf('%.2f',$dabaoTotal),
                'type'  => '+',
                'money' => sprintf('%.2f',$dabaoTotal)
            ),
            array(
                'name'  => '配送',
                'price' => sprintf('%.2f',$peisongTotal),
                'type'  => '+',
                'money' => sprintf('%.2f',$peisongTotal)
            ),
            array(
                'name'  => '增值服务',
                'price' => sprintf('%.2f',$addserviceTotal),
                'type'  => '+',
                'money' => sprintf('%.2f',$addserviceTotal)
            ),
            array(
                'name'  => '优惠券',
                'price' => sprintf('%.2f',$youhuiquanTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$youhuiquanTotal)
            ),
            array(
                'name'  => '准时宝',
                'price' => sprintf('%.2f',$zsbprice),
                'type'  => '+',
                'money' => sprintf('%.2f',$zsbprice)
            ),
            array(
                'name'  => '会员优惠',
                'price' => sprintf('%.2f',$memberYouhuiTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$memberYouhuiTotal)
            ),
            array(
                'name'  => $cfg_pointName . '抵扣',
                'price' => sprintf('%.2f',$pointAmount),
                'type'  => '-',
                'money' => sprintf('%.2f',$pointAmount)
            ),
             array(
                 'name'     => '平台提价收益结算',
                 'price'    => sprintf('%.2f',$ptprofit),
                 'type'     => '+',
                 'money'    => sprintf('%.2f',$ptprofit)
             )
        );
        if (empty($foodis_discount)) {
            $manjian = $promotionTotal * $fencheng_promotion / 100;

        }else{
            $manjian = 0;
        }



        //平台应得（不含分销佣金）
        $_ptyd = ($foodTotal -$refund) * $fencheng_foodprice / 100 - $discountTotal * $fencheng_discount / 100 - $manjian - $firstdiscountTotal * $fencheng_firstdiscount / 100 + $dabaoTotal * $fencheng_dabao / 100 + $peisongTotal * $fencheng_delivery / 100 + $addserviceTotal * $fencheng_addservice / 100 - $youhuiquanTotal * $quanBili / 100 -$memberYouhuiTotal + $zsbprice * $fencheng_zsb / 100  - $ptzsb + $ktvipTotal;


        include HUONIAOINC."/config/fenxiaoConfig.inc.php";
        $fenxiaoSource = (int)$cfg_fenxiaoSource;  //分销承担方  0平台  1商家

        //如果是平台承担，则计算佣金的底价以平台应得为准
        if(!$fenxiaoSource){
            $fenxiaoarr['amount'] = $_ptyd;
        }
        
        include HUONIAOINC."/config/waimai.inc.php";
        $fenXiao = (int)$customfenXiao;  //是否开启分销
        global $cfg_fenxiaoDeposit;

        if($fenxiaoarr){

            $ordertype          = $fenxiaoarr['ordertype'];
            $uid                = $fenxiaoarr['uid'];
            $ordernum           = $fenxiaoarr['ordernum'];
            $paramarr['amount'] = $fenxiaoarr['amount'];

            if($fenXiao ==1 && $ordertype != 1 && $uid){
                (new member())->returnFxMoney("waimai", $uid, $ordernum, $paramarr);
            }

            if($uid){
                (new member())->returnPoint("waimai", $uid, $amount, $ordernum);
            }
        }

        //获取外卖佣金
        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '".$orderres['ordernum']."' AND `module`= 'waimai'");
        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
        $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];

        if($fenxiaoSource == 0){
            $fenxiaoTotalPricept  = $fenxiaoTotalPrice;
        }else{
            if($fenXiao ==1 && $ordertype != 1 && $cfg_fenxiaoDeposit){  //商家承担分销并且沉淀，记录沉淀
                //分销分不完的钱 = 应该分销的钱【佣金总额】 - 实际分销的钱
                $sql = $dsql->SetQuery(
                    "SELECT o.`food`, o.`priceinfo`, s.`userid` storeuid, s.`cityid`, m.`username` FROM `#@__waimai_order_all` o
                    LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid`
                    LEFT JOIN `#@__member` m ON m.`id` = o.`uid`
                    WHERE o.`ordernum` = '{$orderres['ordernum']}'"
                );// AND `state` = 1
                $res = $dsql->dsqlOper($sql, "results");
                if($res){
                    $order = $res[0];
                    $cityid = $order['cityid'];
                    $totalAmount = 0;//佣金总额
                    $food = unserialize($order['food']);
                    global $cfg_fenxiaoAmount;
                    $fenxiaoAmount      = $cfg_fenxiaoAmount;
                    foreach ($food as $k => $v) {
                        $totalPrice_ = $v['price'] * $v['count'];
                        $totalPrice += $totalPrice_;
                        if($v['fx_reward'] == '0'){
                            $fx_reward = 0;
                        }elseif($v['fx_reward']){
                            if(strstr($v['fx_reward'], '%')){
                                $fx_reward = $v['price'] * $v['count'] * (float)$v['fx_reward'] / 100;
                            }else{
                                $fx_reward = $v['fx_reward'] * $v['count'];
                            }
                        }else{
                            $fx_reward = $totalPrice_ * $fenxiaoAmount / 100;
                        }
                        $totalAmount_ = $fx_reward;
                        $totalAmount += $totalAmount_;
                    }
                    $fenxiaoTotalPrice = $totalAmount; //应该分销的金额【佣金总额】
                    $precipitateMoney = $totalAmount - $fenxiaomonyeres[0]['allfenxiao']; //实际沉淀的金额
                    //记录沉淀资金
                    if($precipitateMoney > 0 && $uid){
                        (new member())->recodePrecipitationMoney($uid,$orderres['ordernum'],'外卖订单-'.$orderres['ordernum'],$precipitateMoney,$cityid,"waimai");
                    }
                }
            }

            $fenxiaoTotalPricebu  = $fenxiaoTotalPrice;
        }

        //平台应得（扣除分销佣金，只有平台承担时生效）
        $ptyd = $_ptyd - $fenxiaoTotalPricept;

        $ptydarr = array(
            array(
                'name'  => '商品总价(商品价格-退款价格) * 平台分成',
                'price' => '('.sprintf('%.2f',$foodTotal).' - '. sprintf('%.2f',$refund).') * '.floatval($fencheng_foodprice)."%",
                'type'  => '',
                'money' => sprintf('%.2f',($foodTotal -$refund) * $fencheng_foodprice / 100)
            ),
            array(
                'name'  => '折扣 * 折扣承担比例',
                'price' => sprintf('%.2f',$discountTotal).' * '.floatval($fencheng_discount)."%",
                'type'  => '-',
                'money' => sprintf('%.2f',$discountTotal*($fencheng_discount / 100))

            ),
            array(
                'name'  => '满减',
                'price' => sprintf('%.2f',$manjian),
                'type'  => '-',
                'money' => sprintf('%.2f',$manjian)
            ),
            array(
                'name'  => '首单 * 首单承担比例',
                'price' => sprintf('%.2f',$firstdiscountTotal).' * '.floatval($fencheng_firstdiscount)."%",
                'type'  => '-',
                'money' => sprintf('%.2f',$firstdiscountTotal*($fencheng_firstdiscount / 100))
            ),
            array(
                'name'  => '打包 * 打包分成比例',
                'price' => sprintf('%.2f',$dabaoTotal) .' * '.floatval($fencheng_dabao)."%",
                'type'  => '+',
                'money' => sprintf('%.2f',$dabaoTotal*($fencheng_dabao / 100))
            ),
            array(
                'name'  => '配送费 * 配送费分成比例',
                'price' => sprintf('%.2f',$peisongTotal) .' * '.floatval($fencheng_delivery)."%",
                'type'  => '+',
                'money' => sprintf('%.2f',$peisongTotal*($fencheng_delivery / 100))
            ),
            array(
                'name'  => '增值服务费 * 增值服务费分成比例',
                'price' => sprintf('%.2f',$addserviceTotal) .' * '.floatval($fencheng_addservice)."%",
                'type'  => '+',
                'money' => sprintf('%.2f',$addserviceTotal*($fencheng_addservice / 100))
            ),
            array(
                'name'  => '优惠券 * 优惠券承担比例',
                'price' => sprintf('%.2f',$youhuiquanTotal) .' * '.floatval($quanBili)."%",
                'type'  => '-',
                'money' => sprintf('%.2f',$youhuiquanTotal*($quanBili / 100))
            ),
            array(
                'name'  => '会员优惠',
                'price' => sprintf('%.2f',$memberYouhuiTotal),
                'type'  => '-',
                'money' => sprintf('%.2f',$memberYouhuiTotal)
            ),
            array(
                'name'  => '准时宝 * 准时宝分成比例',
                'price' => sprintf('%.2f',$zsbprice) .' * '. floatval($fencheng_zsb)."%",
                'type'  => '+',
                'money' => sprintf('%.2f',$zsbprice * $fencheng_zsb /100)
            ),
            array(
                'name'  => '准时宝赔付费用',
                'price' => sprintf('%.2f',$ptzsb),
                'type'  => '-',
                'money' => sprintf('%.2f',$ptzsb)
            ),
            array(
                'name'  => '分销承担费用',
                'price' => sprintf('%.2f',$fenxiaoTotalPricept),
                'type'  => '-',
                'money' => sprintf('%.2f',$fenxiaoTotalPricept)
            ),
            array(
                'name'  => '开通会员费用',
                'price' => sprintf('%.2f',$ktvipTotal),
                'type'  => '+',
                'money' => sprintf('%.2f',$ktvipTotal)
            ),
            array(
                 'name'     => '平台提价收益结算',
                 'price'    => sprintf('%.2f',$ptprofit),
                 'type'     => '+',
                 'money'    => sprintf('%.2f',$ptprofit)
            ),
            array(
               'name' => $additional_name,
               'price' => sprintf('%.2f',$additional),
               'type' => '+',
               'money' => sprintf('%.2f',$additional),
            )
        );
        
        $ptyd += $additional;
        
        $_ptyd_show = $ptyd;  //平台收入，显示在商家订单详情页面中的值
        
        //店内扫码点餐，不抽成
        if($ordertype == 0){
            $business = $zjye <= 0 ? 0 : $zjye - ($ptyd+$fenxiaoTotalPricept-$ktvipTotal) - $btzsb - $fenxiaoTotalPricebu;
            
            $_ptyd_show = sprintf('%.2f',$ptyd + $fenxiaoTotalPricept - $ktvipTotal - $additional);
            
            $businesarr = array(
                array(
                    'name'  => '订单收入',
                    'price' => sprintf('%.2f',$zjye),
                    'type'  =>'',
                    'money' => sprintf('%.2f',$zjye)
                ),
                array(
                    'name'  => '平台所得(平台收入+分销承担费用-会员开通费用-'.$additional_name.')',
                    'price' => sprintf('%.2f',$ptyd)." + ".sprintf('%.2f',$fenxiaoTotalPricept)." - ".sprintf('%.2f',$ktvipTotal)." - ".sprintf('%.2f',$additional),
                    'type'  =>'-',
                    'money' => $_ptyd_show
                ),
                array(
                    'name'  => '商家准时宝承担费用',
                    'price' => $btzsb,
                    'type'  =>'-',
                    'money' => sprintf('%.2f',$btzsb)
                ),
                array(
                    'name'  => '商家分销承担费用',
                    'price' => $fenxiaoTotalPricebu,
                    'type'  =>'-',
                    'money' => sprintf('%.2f',$fenxiaoTotalPricebu)
                ),
                array(
                   'name' => $additional_name,
                   'price' => sprintf('%.2f',$additional),
                   'type' => '-',
                   'money' => sprintf('%.2f',$additional),
                )
            );
        }else{
            $ptyd     = 0;
            $business = $zjye;
            $businesarr = array(
                array(
                    'name'  => '总价',
                    'price' => $zjye,
                    'type'  => '',
                    'money' => sprintf('%.2f',$zjye)
                ),
                array(
                    'name'  => '平台所得（平台所得 + 分销承担费用 - 会员开通费用）',
                    'price' => '0.00',
                    'type'  => '-',
                    'money' => '0.00'
                ),
                array(
                    'name'  => '商家准时宝承担费用',
                    'price' => '0.00',
                    'type'  => '-',
                    'money' => '0.00'
                ),
                array(
                    'name'  => '商家分销承担费用',
                    'price' => '0.00',
                    'type'  => '-',
                    'money' => '0.00'
                ),
                array(
                   'name' => $additional_name,
                   'price' => sprintf('%.2f',$additional),
                   'type' => '-',
                   'money' => sprintf('%.2f',$additional),
                )
            );
        }

//        echo "<pre>";
//        var_dump($businesarr,$ptydarr);die;
        include HUONIAOINC."/config/waimai.inc.php";
        $clearingswitch = (int)$customClearingswitch;

//        /*记录结算金额*/
//        require_once HUONIAOROOT."/api/payment/log.php";
//        $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
//
//        $jiesuanstrr = "jiesuanmoney:".$business." | " . $zjye." | ". $ptyd."|>>>".$clearingswitch;
//        $_mailLog->DEBUG($jiesuanstrr, true);

        //这里之前判断了如果给商家的钱小于0时，就不往下走给商家结算了，但是会出现订单详情页面结算信息显示的对不上账
        if($business <= 0) {
            // return array('ptyd' => $ptyd + $ptprofit,'business'=>$business,'zjyearr' => $zjyearr,'ptydarr' => $ptydarr,'businesarr' => $businesarr, 'ptyd_show' => $_ptyd_show, 'additional' => $additional, 'additional_name' => $additional_name);
            //return array('ptyd' => $ptyd,'business'=>$business);  //商家收入为0时，说明不需要给商家分，都是平台收入
        }

        $business = $business < 0 ? 0 : $business;

        //获取transaction_id
        $transaction_id = $paytype = '';
        $ordernum = $orderres['ordernum'];
        $sql = $dsql->SetQuery("SELECT `transaction_id`, `paytype`,`id`,`amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        $pid = '';
        $truepayprice = 0;
        if($ret){
            $transaction_id  = $ret[0]['transaction_id'];
            $paytype         = $ret[0]['paytype'];
            $pid             = $ret[0]['id'];
            $truepayprice    = $ret[0]['amount'];
        }

        //给商户平台加钱
        if($type ==1){
            global $userLogin;
            $ordernum = $orderres['ordernum'];
            $uid = $orderres['userid'];
            $date = time();
            if($clearingswitch == 0){

                //记录会员余额变动日志
                // require_once HUONIAOROOT."/api/payment/log.php";
                // $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);

                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $business WHERE `id` =".$uid);
                // $_mailLog->DEBUG($sql, true);
                $dsql->dsqlOper($sql, "update");

                $param = array(
                    "action"      => 'waimai',
                    "id"          => $id
                );
                $urlParam = serialize($param);

                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money   = sprintf('%.2f',($usermoney));
                $title_ = '外卖商家('.$shopname.')收入';
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$uid', '1', '$business', '外卖订单结算:$ordernum', '$date','waimai','shangpinxiaoshou','$pid','$title_','$ordernum','$urlParam','$usermoney')");
                // $_mailLog->DEBUG($archives, true);
                $result =  $dsql->dsqlOper($archives, "update");

                //工行E商通银行分账
                if($transaction_id){
                    // if($truepayprice <=0){
                    //     $truepayprice = $business;
                    // }
                    rfbpShareAllocation(array(
                        "uid"               => $uid,
                        "ordertitle"        => "外卖收入",
                        "ordernum"          => $ordernum,
                        "orderdata"         => array(),
                        "totalAmount"       => $zjye,
                        "amount"            => $business,
                        "channelPayOrderNo" => $transaction_id,
                        "paytype"           => $paytype
                    ));
                }
            }
        }elseif($type ==2){
            /*结算收益*/
            $ptyd += $ptprofit;
            $array = array('ptyd' => $ptyd,'business'=>$business,'zjyearr' => $zjyearr,'ptydarr' => $ptydarr,'businesarr' => $businesarr,'courierMoney' => $courreward, 'ptyd_show' => $_ptyd_show, 'additional' => $additional, 'additional_name' => $additional_name);
            return $array;
        }else{

            //更新订单的商家承担的额外费用
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `additional` = '$additional' WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");

            $ordernum = $orderres['ordernum'];
            $uid = $orderres['userid'];
            $date = time();
            if($clearingswitch == 0) {

                //记录会员余额变动日志
                // require_once HUONIAOROOT."/api/payment/log.php";
                // $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);

                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $business WHERE `id` =" . $uid);
                $dsql->dsqlOper($sql, "update");

                $param = array(
                    "action"      => 'waimai',
                    "id"          => $id
                );
                global $userLogin;
                $urlParam = serialize($param);
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money   = sprintf('%.2f',($usermoney));
                $title_ = '外卖商家('.$shopname.')收入';
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$uid', '1', '$business', '外卖订单结算：$ordernum', '$date','waimai','shangpinxiaoshou','$pid','$title_','$ordernum','$urlParam','$usermoney')");
                // $_mailLog->DEBUG($archives, true);
                $result = $dsql->dsqlOper($archives, "update");

                //工行E商通银行分账
                if($transaction_id){
                    // if($truepayprice <=0){
                    //     $truepayprice = $business;
                    // }
                    rfbpShareAllocation(array(
                        "uid"                 => $uid,
                        "ordertitle"          => "外卖收入",
                        "ordernum"            => $ordernum,
                        "orderdata"           => array(),
                        "totalAmount"         => $zjye,
                        "amount"              => $business,
                        "channelPayOrderNo"   => $transaction_id,
                        "paytype"             => $paytype
                    ));
                }
            }

            /*结算收益*/
            $ptyd += $ptprofit;
            $ptyd -= $courreward;  //结算时平台应得扣除给配送员的费用
            $array = array('ptyd' => sprintf("%.2f", $ptyd),'business'=>sprintf("%.2f", $business),'zjyearr' => $zjyearr,'ptydarr' => $ptydarr,'businesarr' => $businesarr,'courierMoney' => $courreward, 'ptyd_show' => $_ptyd_show, 'additional' => $additional, 'additional_name' => $additional_name);

            return $array;
        }

    }
}

/**
 * Notes:外卖订单小票保存图片
 * Ueser: Administrator
 * DateTime: 2020/10/12 11:28
 * Param1:订单数据
 * Param2:
 * Param3:
 * Return:
 */
function Printsavepicture($params) {
    global $cfg_basehost;
    $width = 0;
    $height = 0;
    $offset_x = 0;
    $offset_y = 0;


    $font = HUONIAOROOT.'/include/data/fonts/UKIJCJK.ttf'; // 默认字体. 相对于脚本存放目录的相对路径.simhei.ttf msuighur.ttf UKIJTuT.ttf UKIJEkran-b.ttf
    $msg = "";
    $ordertype = $params['ordertype'];

    $userinfonotice = "";
    if($ordertype !=1){
        $userinfonotice  = "\n".$params['address']."\n".$params['person']."\n".$params['tel'];
    }
    $msg.= $params['shopname']."\n------------------------------------------------------\n".$params['ordernumstore']."\n".$params['pubdate'].$userinfonotice."\n------------------------------------------------------\n";
    if($params['note']){
        $msg.= $params['note']."\n---------------------------------------------------\n";
    }

    $foods = '';
    $u = new UyghurCharUtilities();

    if ($params['food']) {
        foreach ($params['food'] as $key => $value) {
            $title = $value['title'];
            if ($value['ntitle']) {
                $title .= "（" . $value['ntitle'] . "）";
            }
            $amo = sprintf('%.2f', $value['price'] * $value['count']);
            $foods.=$u->getPFRevGb($title)."     ".$value['count']."     X".floatval($amo).$params['currency']."\n";
        }
        $msg.=$foods."------------------------------------------------------";
    }
    $pricestr = '';
    if ($params['priceinfo']) {
        foreach ($params['priceinfo'] as $key => $value) {
            $oper = "";
            if ($value['type'] == "youhui" || $value['type'] == "manjian" || $value['type'] == "shoudan") {
                $oper = "-";
            }
            $pricestr.= $u->getPFRevGb($value['body']).$oper . floatval($value['amount'])."\n";
        }
        $msg.=$pricestr."------------------------------------------------------";
    }
    $msg.= $params['amountInfo'];
    $width = "384"; // 默认宽度.
    $size = 17;
    $rot = 0; // 旋转角度.
    $pad = 4.5; // 填充.
    $transparent = 1; // 文字透明度.
    $red = 0; // 在白色背景中...
    $grn = 0;
    $blu = 0;
    $bg_red = 255; // 将文字设置为白色.
    $bg_grn = 255;
    $bg_blu = 255;
    $bounds = array();
    $image = "";
    $msg = autowrap($size,0, $font, $msg,$width-2);
    // 确定文字高度.
    $bounds = ImageTTFBBox($size, $rot,$font, "W");
    if ($rot < 0) {
        $font_height = abs($bounds[7] - $bounds[1]);
    } else if ($rot > 0) {
        $font_height = abs($bounds[1] - $bounds[7]);
    } else {
        $font_height = abs($bounds[7] - $bounds[1]);
    }
    // 确定边框高度.
    $bounds = ImageTTFBBox($size, $rot,$font, $msg);
    if ($rot < 0) {
        // $width = abs($bounds[4] - $bounds[0]);
        $height = abs($bounds[3] - $bounds[7]);
        $offset_y = $font_height;
        $offset_x = 0;
    } else if ($rot > 0) {
        // $width = abs($bounds[2] - $bounds[6]);
        $height = abs($bounds[1] - $bounds[5]);
        $offset_y = abs($bounds[7] - $bounds[5]) + $font_height;
        $offset_x = abs($bounds[0] - $bounds[6]);
    } else {
        // $width = abs($bounds[4] - $bounds[6]);
        $height = abs($bounds[7] - $bounds[1]);
        $offset_y = $font_height;

        $offset_x = 0;
    }
    $image = imagecreate($width, $height + ($pad * 2) + 5);

    $background = ImageColorAllocate($image, $bg_red, $bg_grn, $bg_blu);
    $foreground = ImageColorAllocate($image, $red, $grn, $blu);
    // imagefill($image,0,0,$background);
    // ImageColorTransparent($image, $background);

    ImageInterlace($image, false);
    // 画图.
    ImageTTFText($image, $size, $rot, $offset_x + $pad, $offset_y + $pad, $foreground, $font,$msg);
//    ImageTTFText($image, $size, 0, 0, 30, $foreground, $font,$msg);
    // 输出为png格式.
    // Header("Content-type: image/png");
    $filepath = HUONIAOROOT . '/uploads/printpic/';
    if(!file_exists($filepath)){
        mkdir($filepath,0777,true);
    }

    imagejpeg($image,$filepath.$params['ordernum'].".jpg");
    imagedestroy($image);
    $picurl = 'https://'.$cfg_basehost.'/uploads/printpic/'.$params['ordernum'].".jpg";
    return $picurl;die;
    // file_put_contents($filepath.date("Y-m-d H:i:s",time())."png", $image);
    // imagePNG($image);
}

/**
 * Notes:
 * Ueser: Administrator
 * DateTime: 2020/10/19 17:30
 * @param $fontsize
 * @param $fontangle
 * @param $ttfpath
 * @param $str
 * @param $width
 * @param string $charset
 * @return string
 */

function autowrap($fontsize,$fontangle,$ttfpath,$str,$width,$charset='utf-8'){
    $_string = "";
    $_temp = "";
    $strArr = chararray($str);
    foreach ($strArr as $k=>$v){
        $_temp .= $v;
        $w = charwidth($fontsize,$fontangle,$ttfpath,$_temp);
        if (($w >= $width) && ($v !== "")){
            $_string .= "\n";
            $_temp = "";
        }
        $_string .= $v;
        $w = 0;
    }
    $_string = mb_convert_encoding($_string, "html-entities","utf-8" );
    return $_string;
}

function chararray($str,$charset="utf-8"){
    $re['utf-8']   = "/[\x01-\x7f]|[\xc2-\xdf][\x80-\xbf]|[\xe0-\xef][\x80-\xbf]{2}|[\xf0-\xff][\x80-\xbf]{3}/";
    $re['gb2312'] = "/[\x01-\x7f]|[\xb0-\xf7][\xa0-\xfe]/";
    $re['gbk']    = "/[\x01-\x7f]|[\x81-\xfe][\x40-\xfe]/";
    $re['big5']   = "/[\x01-\x7f]|[\x81-\xfe]([\x40-\x7e]|\xa1-\xfe])/";
    preg_match_all($re[$charset], $str, $match);
    return $match[0];
}

//$fontsize字体大小 $fontangle字体角度 $ttfpath字体路径 $char字符串
function charwidth($fontsize,$fontangle,$ttfpath,$char){
    $box = @imagettfbbox($fontsize,$fontangle,$ttfpath,$char);
    $width = abs(max($box[2], $box[4]) - min($box[0], $box[6]));
    return $width;
}


//工行E商通银行、微信服务商分账
/**
 * uid  用户ID
 * ordertitle  订单信息
 * ordernum  订单号
 * orderdata  订单内容
 * totalAmount  总金额
 * amount  分账金额
 * channelPayOrderNo  E商通支付成功订单号
 */
function rfbpShareAllocation($param = array()){

    extract($param);
    global $dsql;
    $time = time();

    //用户消费自动绑定商家
    include(HUONIAOINC . '/config/business.inc.php');
    $customBusinessPayBindRec = (int)$customBusinessPayBindRec;

    require_once(HUONIAOINC.'/config/fenxiaoConfig.inc.php');
    $fenxiaoBinding = (int)$cfg_fenxiaoBinding;

    if($customBusinessPayBindRec){

        if($bindFenxiaoshang && $userid){

            //判断用户是否已经绑定过推荐人，没有绑定过的才进行绑定
            $sql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $from_uid = (int)$ret[0]['from_uid'];
                if($from_uid == 0){

                    //防止出现两个会员之前循环推荐
                    $sj_uidsql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = " . $uid);
                    $sj_uidres = $dsql->dsqlOper($sj_uidsql, "results");
                    if($sj_uidres[0]['from_uid'] != $userid){

                        $nowTime = GetMkTime(time());//当前时间，绑定的时候保存绑定时间
                        
                        $pass = false;
                        if ($fenxiaoBinding == 1) {
                            //分销商查询
                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` where `uid` = '$uid' AND `state`=1");
                            $fxuid = $dsql->getOne($sql);
                            $pass = $fxuid ? true : false;
                        } else {
                            $pass = true;
                        }

                        if($pass){
                            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `from_uid` = $uid, `from_bindtime` = '$nowTime' WHERE `id` = $userid");
                            $dsql->dsqlOper($sql, "update");
                        }
                        
                    }

                }
            }

        }else{
            //根据订单号查询付款人信息
            $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_uid = (int)$ret[0]['uid'];
                if($_uid > 0){

                    //判断用户是否已经绑定过推荐人，没有绑定过的才进行绑定
                    $sql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = $_uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $from_uid = (int)$ret[0]['from_uid'];
                        if($from_uid == 0){

                            //防止出现两个会员之前循环推荐
                            $sj_uidsql = $dsql->SetQuery("SELECT `from_uid` FROM `#@__member` WHERE `id` = " . $uid);
                            $sj_uidres = $dsql->dsqlOper($sj_uidsql, "results");
                            if($sj_uidres[0]['from_uid'] != $userid){

                                $nowTime = GetMkTime(time());//当前时间，绑定的时候保存绑定时间

                                $pass = false;
                                if ($fenxiaoBinding == 1) {
                                    //分销商查询
                                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` where `uid` = '$uid' AND `state`=1");
                                    $fxuid = $dsql->getOne($sql);
                                    $pass = $fxuid ? true : false;
                                } else {
                                    $pass = true;
                                }

                                if($pass){
                                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `from_uid` = $uid, `from_bindtime` = '$nowTime' WHERE `id` = $_uid");
                                    $dsql->dsqlOper($sql, "update");
                                }
                            }
                            
                        }
                    }

                }
            }
        }
    }

    //根据订单号查询该笔订单是否使用了积分抵扣，如果使用了，则不再继续下面的分账，有积分抵扣，分账时情况比较复杂，暂时做强制取消。
    $sql = $dsql->SetQuery("SELECT `usePoint` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $usePoint = (int)$ret[0]['usePoint'];
        if($usePoint) {
            return;
        }
    }


    //分账原订单号验证
    if(strlen($param['ordernum']) != 16){
        return;
    }


    //根据用户ID查询商家信息
    //工行E商通支付方式才有分账功能
    if($paytype == 'rfbp_icbc'){
        $sql = $dsql->SetQuery("SELECT b.`id`, b.`icbc_subMerId`, b.`icbc_subMerPrtclNo` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE m.`id` = $uid AND b.`state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['id'];  //商家ID
            $icbc_subMerId = $ret[0]['icbc_subMerId'];  //二级商编号
            $icbc_subMerPrtclNo = $ret[0]['icbc_subMerPrtclNo'];  //二级商户协议编号

            //没有配置二级商户信息的和分账金额为0的，不执行分账流程
            if($icbc_subMerId && $icbc_subMerPrtclNo && $param['amount'] > 0) {
                $order = array(
                    "bid" => $bid,
                    "ordertitle" => $param['ordertitle'],
                    "ordernum" => $param['ordernum'],
                    "orderdata" => $param['orderdata'],
                    "totalAmount" => $param['totalAmount'],
                    "amount" => $param['amount'],
                    "icbc_subMerId" => $icbc_subMerId,
                    "icbc_subMerPrtclNo" => $icbc_subMerPrtclNo,
                    "channelPayOrderNo" => $param['channelPayOrderNo']
                );

                //写入分账表，此处不再直接发起分账请求，后续依赖计划任务执行分账请求
                $sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('rfbp_icbc', '$bid', '".$order['ordertitle']."', '".$order['ordernum']."', '".$order['orderdata']."', '".$order['totalAmount']."', '".$order['amount']."', '".$order['icbc_subMerId']."', '".$order['icbc_subMerPrtclNo']."', '".$order['channelPayOrderNo']."', '', '', '', '0', '等待分账')");
		        $dsql->dsqlOper($sql, "update");
                return;

                require_once(HUONIAOROOT."/api/payment/rfbp_icbc/rfbp_shareAllocation.php");
                $rfbp_shareAllocation = new rfbp_shareAllocation();
                $ret = $rfbp_shareAllocation->shareAllocation($order);

                //成功后，减少用户余额并增加提现记录
                if($ret['state'] == 1){
                    global $userLogin;
                    $orderid = $ret['orderid'];
                    $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $bid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid = $ret[0]['uid'];

                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $info   = "系统自动分账，订单号：" . $ordernum;
                        $title_ = '系统自动分账';
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$info', '$time','waimai','tixian','$title_','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }
                }
            }

        }
    }


    //根据用户ID查询商家信息
    //微信服务商才有分账功能
    if($paytype == 'wxpay'){
		// sleep(1);  //延迟1秒，不然会出现订单还在处理中，导致分账不成功，这里延迟没效果，已增加计划任务
        $sql = $dsql->SetQuery("SELECT b.`id`, b.`wxpay_submchid` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE m.`id` = $uid AND b.`state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['id'];  //商家ID
            $wxpay_submchid = $ret[0]['wxpay_submchid'];  //微信支付分配的子商户号

            //没有配置二级商户信息的和分账金额为0的，不执行分账流程
            if($wxpay_submchid && $param['amount'] > 0) {

                //获取支付配置信息
                $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'wxpay' AND `state` = 1");
                $payment   = $dsql->dsqlOper($archives, "results");

                $pay_config = unserialize($payment[0]['pay_config']);
                $paymentArr = array();

                //验证配置
                foreach ($pay_config as $key => $value) {
                	if(!empty($value['value'])){
                		$paymentArr[$value['name']] = $value['value'];
                	}
                }

                $order = array(
                    "bid" => $bid,
                    "ordertitle" => $param['ordertitle'],
                    "ordernum" => $param['ordernum'],
                    "orderdata" => $param['orderdata'],
                    "totalAmount" => $param['totalAmount'],
                    "amount" => sprintf("%.2f", $param['totalAmount']-$param['amount']),  //分账金额（分给平台）=订单金额减去商家应得
                    "submchid" => $wxpay_submchid,
                    "transaction_id" => $param['channelPayOrderNo']
                );

                //写入分账表，此处不再直接发起分账请求，后续依赖计划任务执行分账请求
                $sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('wxpay', '$bid', '".$order['ordertitle']."', '".$order['ordernum']."', '".$order['orderdata']."', '".$order['totalAmount']."', '".$order['amount']."', '".$order['submchid']."', '', '".$order['transaction_id']."', '', '', '', '0', '等待分账')");
		        $dsql->dsqlOper($sql, "update");
                return;

                require_once(HUONIAOROOT."/api/payment/wxpay/wxpayProfitsharing.php");
                $wxpayProfitsharing = new wxpayProfitsharing();
                $ret = $wxpayProfitsharing->profitsharing($order);

                //成功后，减少用户余额并增加提现记录
                if($ret['state'] == 1){
                    global $userLogin;
                    $orderid = $ret['orderid'];
                    $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $bid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid = $ret[0]['uid'];

                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $info   = "系统自动分账，订单号：" . $ordernum;
                        $title_ = '系统自动分账';
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$info', '$time','waimai','tixian','$title_','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }
                }

            }

        }
    }


    //根据用户ID查询商家信息
    //支付宝分账
    if($paytype == 'alipay'){
		// sleep(1);  //延迟1秒，不然会出现订单还在处理中，导致分账不成功，这里延迟没效果，已增加计划任务，官方建议30秒后发起分账
        $sql = $dsql->SetQuery("SELECT b.`id`, b.`alipay_pid`, b.`alipay_app_auth_token` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE m.`id` = $uid AND b.`state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['id'];  //商家ID
            $alipay_pid = $ret[0]['alipay_pid'];  //支付宝商家PID
            $alipay_app_auth_token = $ret[0]['alipay_app_auth_token'];  //支付宝商家应用授权令牌

            //没有配置二级商户信息的和分账金额为0的，不执行分账流程
            if($alipay_pid && $param['amount'] > 0) {

                //获取支付配置信息
                $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = 'alipay' AND `state` = 1");
                $payment   = $dsql->dsqlOper($archives, "results");

                $pay_config = unserialize($payment[0]['pay_config']);
                $paymentArr = array();

                //验证配置
                foreach ($pay_config as $key => $value) {
                	if(!empty($value['value'])){
                		$paymentArr[$value['name']] = $value['value'];
                	}
                }

                $order = array(
                    "bid" => $bid,
                    "ordertitle" => $param['ordertitle'],
                    "ordernum" => $param['ordernum'],
                    "orderdata" => $param['orderdata'],
                    "totalAmount" => $param['totalAmount'],
                    "amount" => sprintf("%.2f", $param['totalAmount']-$param['amount']),  //分账金额（分给平台）=订单金额减去商家应得
                    "alipay_pid" => $alipay_pid,
                    "alipay_app_auth_token" => $alipay_app_auth_token,
                    "transaction_id" => $param['channelPayOrderNo']
                );

                //写入分账表，此处不再直接发起分账请求，后续依赖计划任务执行分账请求
                $sql = $dsql->SetQuery("INSERT INTO `#@__business_shareallocation` (`platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo`, `subOrderNo`, `subOrderTrxid`, `pubdate`, `state`, `info`) VALUES ('alipay', '$bid', '".$order['ordertitle']."', '".$order['ordernum']."', '".$order['orderdata']."', '".$order['totalAmount']."', '".$order['amount']."', '".$order['alipay_pid']."', '".$order['alipay_app_auth_token']."', '".$order['transaction_id']."', '', '', '', '0', '等待分账')");
		        $dsql->dsqlOper($sql, "update");
                return;

                require_once(HUONIAOROOT."/api/payment/alipay/alipayProfitsharing.php");
                $alipayProfitsharing = new alipayProfitsharing();
                $ret = $alipayProfitsharing->profitsharing($order);

                //成功后，减少用户余额并增加提现记录
                if($ret['state'] == 1){
                    global $userLogin;
                    $orderid = $ret['orderid'];
                    $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $bid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid = $ret[0]['uid'];

                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $info   = "系统自动分账，订单号：" . $ordernum;
                        $title_ = '系统自动分账';
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$info', '$time','waimai','tixian','$title_','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }
                }

            }

        }
    }


}

/**
 * Notes: 团购商城计算佣金金额
 * Ueser: Administrator
 * DateTime: 2020/12/1 14:08
 * Param1:
 * Param2:
 * Param3:
 * Return:
 * @param $module
 * @param $ordernum
 * @return array|void
 */
function fenXiaoMoneyCalculation($module,$ordernum){
    global $dsql;
    global $userLogin;
    include HUONIAOINC . '/config/'.$module.'.inc.php';
    include HUONIAOINC."/config/fenxiaoConfig.inc.php";
    $fenxiaoSource = (int)$cfg_fenxiaoSource;
    global $cfg_fenxiaoAmount;
    global $cfg_shopFee;  //平台抽成
    global $cfg_tuanFee;  //平台抽成
    $fenxiaoAmount  = $cfg_fenxiaoAmount;
    $paramarr = array();
    if($module =='shop'){
        $sql = $dsql->SetQuery("SELECT p.`id`, p.`fx_reward`, p.`title`, op.`price`, op.`count`, o.`id` orderid, o.`userid`, o.`huodongtype`, s.`userid` storeuid, m.`username`,o.`changeprice`,o.`changetype` FROM `#@__shop_product` p LEFT JOIN `#@__shop_order_product` op ON op.`proid` = p.`id` LEFT JOIN `#@__shop_order` o ON o.`id` = op.`orderid` LEFT JOIN `#@__shop_store` s ON s.`id` = p.`store` LEFT JOIN `#@__member` m ON m.`id` = o.`userid` WHERE o.`ordernum` = '$ordernum'");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res) return;

        $storeuid = $res[0]['storeuid'];
        $username = $res[0]['username'];
        $totalPrice = 0;//商品总金额
        $totalAmount = 0;//佣金总额
        foreach ($res as $k => $v) {
            $userinfo = $userLogin->getMemberInfo($v['userid']);
            $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
            $shopDiscount = $memberLevelAuth['shop'];               //  商城优惠

            //分销金额不计算是否是会员
            // if ($shopDiscount){
            //     $totalPrice_ = $v['price'] * $v['count'] *$shopDiscount /10;
            // }else{
               $totalPrice_ = $v['price'] * $v['count'] ;
            // }
            if ($v['changetype'] == 1){
                $totalPrice_ = $res[0]['changeprice'];
            }

            //砍价订单
            if($v['huodongtype'] == 3){
                //查询砍价金额
                $bargainsql = $dsql->SetQuery("SELECT `gnowmoney`,`state`,`gmoney` FROM `#@__shop_bargaining` WHERE `oid` = " . $v['orderid']);
                $bargainres = $dsql->dsqlOper($bargainsql, "results");
                $totalPrice_ = $bargainres[0]['state'] == 2 ? (float)$bargainres[0]['gmoney'] : (float)$bargainres[0]['gnowmoney'];
            }

            $totalPrice += $totalPrice_;

            //如果是平台承担，则计算佣金的底价以平台应得为准
            if(!$fenxiaoSource){
                $totalPrice = $totalPrice_ = $totalPrice * $cfg_shopFee / 100;
            }

            $fx_reward_ratio = $v['fx_reward'];
            if($v['fx_reward'] == '0'){
                $fx_reward = 0;
            }elseif($v['fx_reward']){
                if(strstr($v['fx_reward'], '%')){
                      $fx_reward = $totalPrice_ * (float)$v['fx_reward'] / 100;
                }else{
                    $fx_reward = $v['fx_reward'] * $v['count'];
                }
            }else{
                $fx_reward_ratio = $fenxiaoAmount."%";
                $fx_reward = $totalPrice_ * $fenxiaoAmount / 100;
            }
            $totalAmount_ = $fx_reward;
            $totalAmount += $totalAmount_;
            if($fx_reward > 0){
                $product[] = array(
                    'id' => $v['id'],
                    'title' => $v['title'],
                    'price' => $v['price'],
                    'count' => $v['count'],
                    'fx_reward_ratio' => $fx_reward_ratio,
                    'fx_reward' => sprintf("%.2f", $fx_reward),
                    'settlement' => $totalPrice
                );
            }

        }

        $paramarr['totalAmount'] = sprintf("%.2f", $totalAmount);
        $paramarr['product']     = $product;
        $paramarr['storeuid']    = $storeuid;
        $paramarr['username']    = $username;
    }elseif($module =='tuan'){
        $is_quan = 0;
        if(strlen((string)$ordernum) == 12){
            $is_quan = 1;
            $sql = $dsql->SetQuery(
                "SELECT p.`id`, p.`fx_reward`, p.`title`, o.`userid`, o.`orderprice`, o.`procount`, o.`ordernum`, s.`uid` storeuid, m.`username` FROM `#@__tuanlist` p
                        LEFT JOIN `#@__tuan_order` o ON o.`proid` = p.`id`
                        LEFT JOIN `#@__tuanquan` q ON q.`orderid` = o.`id`
                        LEFT JOIN `#@__tuan_store` s ON s.`id` = p.`sid`
                        LEFT JOIN `#@__member` m ON m.`id` = o.`userid`
                        WHERE o.`ordernum` = '$ordernum' AND q.`usedate` <> 0"
            );
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) return;

            $storeuid = $res[0]['storeuid'];
            $username = $res[0]['username'];
            $procount = (int)$res[0]['procount'];
            $ordernum = $res[0]['ordernum'];
            $totalPrice = 0;//商品总金额
            $totalAmount = 0;//佣金总额

            $totalPrice = $res[0]['orderprice'];

            //如果是平台承担，则计算佣金的底价以平台应得为准
            if(!$fenxiaoSource){
                $totalPrice = $totalPrice * $cfg_tuanFee / 100;
            }

            $fx_reward_ratio = $res[0]['fx_reward'];
            if($res[0]['fx_reward'] == '0'){
                $fx_reward = 0;
            }elseif($res[0]['fx_reward']){
                if(strstr($res[0]['fx_reward'], '%')){
                    $fx_reward = $res[0]['orderprice'] * (float)$res[0]['fx_reward'] / 100;
                }else{
                    $fx_reward = $res[0]['fx_reward'];
                }
            }else{
                $fx_reward_ratio = $fenxiaoAmount."%";
                $fx_reward = ($totalPrice * $fenxiaoAmount / 100);
            }
            $totalAmount += $fx_reward;

//            $totalAmount  = $totalAmount/$procount;

            // 快递
        }else{
            $sql = $dsql->SetQuery(
                "SELECT p.`id`, p.`fx_reward`, p.`title`, o.`userid`, o.`orderprice`, o.`procount`, s.`uid` storeuid, m.`username` FROM `#@__tuanlist` p
                        LEFT JOIN `#@__tuan_order` o ON o.`proid` = p.`id`
                        LEFT JOIN `#@__tuan_store` s ON s.`id` = p.`sid`
                        LEFT JOIN `#@__member` m ON m.`id` = o.`userid`
                        WHERE o.`ordernum` = '$ordernum'"
            );
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) return;

            $storeuid = $res[0]['storeuid'];
            $username = $res[0]['username'];
            $procount = (int)$res[0]['procount'];
            $totalPrice = 0;//商品总金额
            $totalAmount = 0;//佣金总额

            $totalPrice = $res[0]['orderprice'] * $res[0]['procount'];

            //如果是平台承担，则计算佣金的底价以平台应得为准
            if(!$fenxiaoSource){
                $totalPrice = $totalPrice * $cfg_tuanFee / 100;
            }

            $fx_reward_ratio = $res[0]['fx_reward'];
            if($res[0]['fx_reward'] == '0'){
                $fx_reward = 0;
            }elseif($res[0]['fx_reward']){
                if(strstr($res[0]['fx_reward'], '%')){
                    $fx_reward = $res[0]['orderprice'] * $res[0]['procount'] * (float)$res[0]['fx_reward'] / 100;
                }else{
                    $fx_reward = $res[0]['fx_reward'] * $res[0]['procount'];
                }
            }else{
                $fx_reward_ratio = $fenxiaoAmount."%";
                $fx_reward = ($totalPrice * $fenxiaoAmount / 100);
            }
            $totalAmount += $fx_reward;

            /*该订单购买数量大于1 拥挤处理*/
            $totalAmount  = $totalAmount/$procount;
        }

        if($fx_reward > 0){
            $product[] = array(
                'id' => $res[0]['id'],
                'title' => $res[0]['title'],
                'price' => $res[0]['orderprice'],
                'count' => $is_quan ? 1 : $res[0]['procount'],
                'fx_reward_ratio' => $fx_reward_ratio,
                'fx_reward' => sprintf("%.2f", $fx_reward),
                'settlement' => $totalPrice
            );
        }

        $paramarr['totalAmount'] = sprintf("%.2f", $totalAmount);
        $paramarr['product']     = $product;
        $paramarr['storeuid']    = $storeuid;
        $paramarr['username']    = $username;
        $paramarr['ordernum']    = $ordernum;
    }

    return $paramarr;
}


/**
 * Notes:更新浏览记录表
 * Ueser: Administrator
 * DateTime: 2020/12/21 13:29
 * Param1:
 * Param2:
 * Param3:
 * Return:
 * @param $param
 */
function updateHistoryClick($param){
    global $dsql;
    if(!empty($param) && $_GET['action'] != 'footprintsGet'){
        extract($param);
        if($module!='' && $module != 'circle'){
            $date = time();

            $uid = (int)$uid;
            $fuid = (int)$fuid;
            $aid = (int)$aid;

            //强制删除3个月前的数据，这里设置为6小时缓存时间，防止频繁清理
            $lastClearTime = (int)cache_read('clearHistoryClick_'.$module.'.txt', '', true);
            $time = GetMkTime(time());
            if(!$lastClearTime || ($lastClearTime + 60 * 60 * 6) < $time){

                //只有数据量大于50万的时候才需要删除
                $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM `#@__".$module."_historyclick`");
                $total = (int)$dsql->getOne($sql);
                if($total > 500000){
                    $_time = GetMkTime(time()) - 30 * 86400;
                    $_sql = $dsql->SetQuery("DELETE FROM `#@__".$module."_historyclick` WHERE `date` < ".$_time);
                    $dsql->dsqlOper($_sql, "update");

                    //更新清除时间
                    cache_write('clearHistoryClick_'.$module.'.txt', $time, '', true);
                }
                
            }

            $began = strtotime(date("Y-m-d") . " 00:00");
            $end   = strtotime(date("Y-m-d") . " 23:59");
            $historysql = $dsql ->SetQuery("SELECT `id` FROM `#@__".$module."_historyclick` WHERE `uid` = $uid AND `fuid` = '$fuid' AND `aid` = '$aid' AND `module2` = '$module2'");
            $historyres = $dsql ->dsqlOper($historysql,'results');
            if(empty($historyres) ) {
                if($module == 'job'){
                    $updatesql = $dsql->SetQuery("INSERT INTO `#@__" . $module . "_historyclick` (`uid`,`fuid`,`aid`,`module`,`module2`,`date`,`first`) VALUES ('$uid','$fuid','$aid','$module','$module2','$date','$date')");
                }else{
                    $updatesql = $dsql->SetQuery("INSERT INTO `#@__" . $module . "_historyclick` (`uid`,`fuid`,`aid`,`module`,`module2`,`date`) VALUES ('$uid','$fuid','$aid','$module','$module2','$date')");
                }
                $dsql->dsqlOper($updatesql, "update");
            }else{
                $updatesql = $dsql->SetQuery("UPDATE `#@__" . $module . "_historyclick` SET `date` = '$date' WHERE `uid` = $uid AND `fuid` = '$fuid' AND `aid` = '$aid'");
                $dsql->dsqlOper($updatesql, "update");
            }
        }
    }
}


// 收款云喇叭播报
function shoukuanSpeaker($sn, $amount){
    
    require HUONIAOINC . "/config/business.inc.php";
    $amount = floatval($amount);

    //智联博众
    if(strstr($sn, 'ZLBZ')){
        $privateKey = 'MIICdQIBADANBgkqhkiG9w0BAQEFAASCAl8wggJbAgEAAoGBAJt1RHyT613vvf2PTZDlv/+Q5SOvDpk45WrlxQMdvuzc5v0ciMrzeZ88po9QoSH5ADitXw7j06NZoWPmIB755z22/Ga54VPcKqvOJJFOdezDZYhSkvzv4dlEMCmWCxsnqgvBrMe7fYn4SwS57R26txkBCw59i5FlAFoxyIzu5aMbAgMBAAECgYALWa+LbP1lWWjEx57BMpUnIrwoM9LcCxRtDqOoy5YyExrmZhvyvX4myzXaBugM4/JJMRdcrfO43IV1FstHl7VzZfO/aioMsX5yV9vPb8RHkKGB9dMOfyX1vk18gdgXZ7Vh4o+jtGT/QZVIsq0HwmjFhV6RYb9tYFuuRMgBd6zzEQJBAMng01jXZOPwud2L3tBNNEEBBt2X9HJDNESjcVmSA6JnzfA6RZxoTdxG9qbc/c+3f24wXyi5s5dTbHRvRy8HwwMCQQDFIpCMWXFf9NTEBbcrhBT2idFDEE8nZ+tWXmX8/UdA8zB/4mrLGmO452rLAyd91Db28u8WSbNxRuxS6+dx8pgJAj8gVOGEWPrPhr49vSjyM2sq/f8bfjqoEhtM4uBEeB4c5IMW9j4vzoSpwrO+BaagncLK4vRakWMx2SqFe0zrO1MCQCYdQ7NPC8OQs55euIZ6WA8+oC4GNjeZOQAO6ksasS8Wldbz8M/p/0PdwmET8Au8/w+J8r3ta/tHyiNSJwJ58/kCQQC38pnZqC/cXYl1OvSg4sC0fJUJZRXYVVNHKyTSKbc1Wa+rFtZYMak9ig4iqN9SFMlTWdtSxLj1SsDYuR1JqFct';


        $params = array(
            'signType' => 'RSA',
            'developerSn' => 'VWUiOybGeIJP6uPE',
            'deviceDescriptionSn' => 'Speaker',
            'supplierDeviceSn' => $sn,
            'broadCastContentInfo' => '{"text":"'.$customSpeakerPrefix.'，'.$amount.'元"}'
        );

        require_once HUONIAOINC . "/class/RSASign.class.php";
        $signer = new RSASign();
        $sign = $signer->sign($params, $privateKey);

        $params['sign'] = $sign;
        $data = http_build_query($params);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://open-service.smart4s.com/Api/Service/Device/Mode/broadCast');
        curl_setopt($ch, CURLOPT_POST, 'POST');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $ret = curl_exec($ch);
        curl_close($ch);
    }

    //飞鱼
    elseif(strstr($sn, 'CUPSFYITHORNG')){
        $appKey = '25451309';
        $appSecret = '5bcf56c4040a4467b8d49e4ce213e0e8';

        $params = array(
            'appKey' => $appKey,
            'type' => '33',
            'device' => $sn,
            'str' => create_sess_id(),
            'context' => $customSpeakerPrefix . ' ' . $amount . '元'
        );
        
        //签名
        foreach ($params as $k => $v){
            $Parameters[$k] = $v;
        }
        ksort($Parameters);
        $String = urldecode(http_build_query($Parameters));
        $sign = strtoupper(md5($String.$appSecret));
        
        $params['sign'] = $sign;
        
        hn_curl('https://open.gzfyit.com/iot-cloud/v1/third/send', $params, 'json');
    }

}


//将当前楼层高度转为低层、中层、高层
function getFloorHeight($bno = 0, $floor = 0){
    $bno = (int)$bno;
    $floor = (int)$floor;

    //4层以下直接返回具体楼层，不做转换
    if($floor < 4 || !$bno){
        return $bno;
    }else{
        $l = intval($floor/3);
        $h = $l*2;

        $ret = '';
        if($bno > 0 && $bno <= $l){
            $ret = '低层';
        }

        if($bno > $l && $bno <= $h){
            $ret = '中层';
        }

        if($bno > $h){
            $ret = '高层';
        }

        return $ret;
    }

}

function verificationStaff($modules = array()){
    global $dsql;

    global $userLogin;

    $userid   = $userLogin->getMemberID();

    $userinfo = $userLogin->getMemberInfo();


    if($userid >-1 && !empty($modules)){

        if($userinfo['is_staff'] ==1){
            if($userinfo['autharr'] && array_key_exists($modules['module'],$userinfo['autharr'])){
                if(in_array($modules['type'],$userinfo['autharr'][$modules['module']])){

                    return  true;
                }else{
                    return  false;
                }

            }else{
                return  false;
            }

        }else{
            return false;
        }

    }
}

function storeUpdateState($storeuid,$state = 0,$joinModuel = array()){
    global $dsql;
    $where = '';

    if($state == 0){
        $where = ' AND `state` = 1';
    }else{
        $where = ' AND `state` = 0';
    }

    /*二手信息模块*/
    if(in_array('info',$joinModuel) || $state == 1) {
        $infostatesql = $dsql->SetQuery("SELECT `id` FROM `#@__infoshop` WHERE `uid`  = '$storeuid' $where");

        $infostateres = $dsql->dsqlOper($infostatesql, "results");

        if ($infostateres && is_array($infostateres)) {

            $infosql = $dsql->SetQuery("UPDATE `#@__infoshop` SET `state` = '$state' WHERE `uid` = '$storeuid'");

            $dsql->dsqlOper($infosql, "update");
        }
    }

    /*房产*/
    if(in_array('house',$joinModuel) || $state == 1) {
        if($state == 0){
            $where_house = ' AND `status` = 1';
        }else{
            $where_house = ' AND `status` = 0';
        }
        $housestatesql = $dsql->SetQuery("SELECT `id` FROM `#@__house_distributor_company` WHERE `uid`  = '$storeuid' $where_house");

        $housestateres = $dsql->dsqlOper($housestatesql, "results");

        if ($housestateres && is_array($housestateres)) {

            $housesql = $dsql->SetQuery("UPDATE `#@__house_distributor_company` SET `status` = '$state' WHERE `uid` = '$storeuid'");

            $dsql->dsqlOper($housesql, "update");
        }
    }

    /*商城*/
    if(in_array('shop',$joinModuel) || $state == 1) {
        $shopstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid`  = '$storeuid' $where");

        $shopstateres = $dsql->dsqlOper($shopstatesql, "results");

        if ($shopstateres && is_array($shopstateres)) {

            $shopsql = $dsql->SetQuery("UPDATE `#@__shop_store` SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($shopsql, "update");
        }
    }

    /*外卖*/
    if(in_array('waimai',$joinModuel) || $state == 1) {
        $waimaistoresql = $dsql->SetQuery("SELECT `shopid` FROM `#@__waimai_shop_manager` WHERE `userid` = '$storeuid'");

        $waimaistoreres = $dsql->dsqlOper($waimaistoresql, "results");
        if ($waimaistoreres && is_array($waimaistoreres)) {

            if($state == 0){
                $where_waimai = ' AND `status` = 1';
            }else{
                $where_waimai = ' AND `status` = 0';
            }

            foreach ($waimaistoreres as $index => $waimaistorere) {

                $waimaistatesql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE `id`  = '" . $waimaistorere['shopid'] . "' $where_waimai");
                $waimaistateres = $dsql->dsqlOper($waimaistatesql, "results");
                if ($waimaistateres && is_array($waimaistateres)) {

                    $waimaisql = $dsql->SetQuery("UPDATE `#@__waimai_shop` SET `status` = '$state' WHERE `id` = '" . $waimaistorere['shopid'] . "'");
                    $dsql->dsqlOper($waimaisql, "update");
                }
            }
        }
    }

    /*团购*/
    if(in_array('tuan',$joinModuel) || $state == 1) {
        $taunstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = '$storeuid'  $where");

        $taunstateres = $dsql->dsqlOper($taunstatesql, "results");

        if ($taunstateres && is_array($taunstateres)) {

            $tuansql = $dsql->SetQuery("UPDATE `#@__tuan_store`  SET `state` = '$state' WHERE `uid` = '$storeuid'");

            $dsql->dsqlOper($tuansql, "update");
        }
    }

    /*养老*/
    if(in_array('pension',$joinModuel) || $state == 1) {
        $pensionstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__pension_store` WHERE `userid` = '$storeuid'  $where");

        $pensionstateres = $dsql->dsqlOper($pensionstatesql, "results");

        if ($pensionstateres && is_array($pensionstateres)) {

            $pensionsql = $dsql->SetQuery("UPDATE `#@__pension_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($pensionsql, "update");
        }
    }

    /*教育*/
    if(in_array('education', $joinModuel) || $state == 1) {
        $educationstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = '$storeuid'  $where");

        $educationstateres = $dsql->dsqlOper($educationstatesql, "results");

        if ($educationstateres && is_array($educationstateres)) {

            $educationsql = $dsql->SetQuery("UPDATE `#@__education_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($educationsql, "update");
        }
    }

    /*婚嫁*/
    if(in_array('marry', $joinModuel) || $state == 1) {
        $marrystatesql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = '$storeuid'  $where");

        $marrystateres = $dsql->dsqlOper($marrystatesql, "results");

        if ($marrystateres && is_array($marrystateres)) {

            $marrysql = $dsql->SetQuery("UPDATE `#@__marry_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($marrysql, "update");
        }
    }

    /*家政*/
    if(in_array('homemaking', $joinModuel) || $state == 1) {
        $homemakingstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = '$storeuid'  $where");

        $homemakingstateres = $dsql->dsqlOper($homemakingstatesql, "results");

        if ($homemakingstateres && is_array($homemakingstateres)) {

            $homemakingsql = $dsql->SetQuery("UPDATE `#@__homemaking_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($homemakingsql, "update");
        }
    }

    /*汽车模块*/
    if(in_array('car', $joinModuel) || $state == 1) {
        $carstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = '$storeuid'  $where");

        $carstateres = $dsql->dsqlOper($carstatesql, "results");

        if ($carstateres && is_array($carstateres)) {

            $carsql = $dsql->SetQuery("UPDATE `#@__car_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($carsql, "update");
        }
    }

    /*装修*/
    if(in_array('renovation', $joinModuel) || $state == 1) {
        $renovationstatesql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = '$storeuid'  $where");

        $renovationstateres = $dsql->dsqlOper($renovationstatesql, "results");

        if ($renovationstateres && is_array($renovationstateres)) {

            $renovationsql = $dsql->SetQuery("UPDATE `#@__renovation_store`  SET `state` = '$state' WHERE `userid` = '$storeuid'");

            $dsql->dsqlOper($renovationsql, "update");
        }
    }

    //更新会员绑定的店铺特权状态
    updateStorePrivilege($storeuid);
}


//查询会员绑定的店铺特权状态，如果都过期了或者没有过期，则更新店铺字段状态
function updateStorePrivilege($uid = 0){
    global $dsql;
    global $userLogin;

    if(!$uid) return;

    $userinfo = $userLogin->getMemberPackage($uid);

    if(!$userinfo) return;

    $package = $userinfo['package'];
    $modules = $package['modules'];
    $privilege = $modules['privilege'];
    $store = $modules['store'];

    //如果都过期了，更新商家特权状态字段为0，用于列表接口blist中排除已过期的商家
    if(!$privilege && !$store){
        $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `pstate` = 0 WHERE `uid` = $uid");
    }
    //如果有特权，说明没有过期，更新商家特权状态字段为1
    else{
        $sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `pstate` = 1 WHERE `uid` = $uid");
    }
    $dsql->dsqlOper($sql, "update");

}

function getCityname($lng,$lat){

    if($lng =='' || $lat =='') return false;
    include(HUONIAOROOT . "/include/config/waimai.inc.php");

    $origin      = $lat.",".$lng;
    global $cfg_map_baidu_server;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, 'http://api.map.baidu.com/reverse_geocoding/v3/?ak='.$cfg_map_baidu_server.'&output=json&coordtype=wgs84ll&location='.$origin);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_TIMEOUT, 3);
    $con = curl_exec($curl);
    curl_close($curl);

    if($con){
        $con = json_decode($con, true);
        if($con['status'] == 0){
            $cityname   = $con['result']['addressComponent']['city'];
            return $cityname;
        }

    }else{
        return  false;
    }
}


/**
 * Notes: 计算模块积分
 * Return:
 * @param $module
 * @param $totalPrice
 * @return array|void
 */
function getJifen($module,$totalPrice){
    include HUONIAOINC . '/config/'.$module.'.inc.php';
    global  $cfg_offset_tuan;
    global  $cfg_offset_shop;
    global  $cfg_pointRatio;
    global  $cfg_offset_waimai;
    global  $cfg_offset_homemaking;
    global  $cfg_offset_education;
    global  $cfg_offset_travel;
    if ($module == 'tuan'){
        if (!isset($cfg_offset_tuan)) {
            $cfg_offset_tuan = 100;
        }
        $price = $totalPrice * $cfg_offset_tuan / 100 ;
    }elseif($module == 'shop'){
        if (!isset($cfg_offset_shop)) {
            $cfg_offset_shop = 100;
        }
        $price = $totalPrice *  $cfg_offset_shop  /100;
    }elseif ($module == 'waimai'){
        if (!isset($cfg_offset_waimai)) {
            $cfg_offset_waimai = 100;
        }
        $price = $totalPrice *   $cfg_offset_waimai / 100;
    }elseif ($module == 'homemaking'){
        if (!isset($cfg_offset_homemaking)) {
            $cfg_offset_homemaking = 100;
        }
        $price = $totalPrice * $cfg_offset_homemaking / 100;
    }elseif ($module == 'travel'){
        if (!isset($cfg_offset_travel)) {
            $cfg_offset_travel = 100;
        }
        $price = $totalPrice * $cfg_offset_travel / 100;
    }elseif ($module == 'education'){
        if (!isset($cfg_offset_education)) {
            $cfg_offset_education = 100;
        }
        $price = $totalPrice * $cfg_offset_education / 100;
    }

    $cfg_pointRatio = (float)$cfg_pointRatio;
    if($cfg_pointRatio <= 0) return 0;
        /*
         * 分开写 比如 263.34*100 = 26334 如果直接写成floor($price*100) 就会变成26333
         * 主要就是如果有小数,保留两位小数且不四舍五入
         */
    $price = (string)($price*100);
    $price = (int)(floor($price)/100 * $cfg_pointRatio);  //比例换算后取整数，防止积分出现小数
    $price = $price / $cfg_pointRatio;
    return $price;

}


//统计每个模块的互动积分
function hudongJifen($module){
     global $cfg_returnInteraction_sfcar;
     global $cfg_returnInteraction_info;
     global $cfg_returnInteraction_house;
     global $cfg_returnInteraction_live;
     global $cfg_returnInteraction_tieba;
     global $cfg_returnInteraction_car;
     global $cfg_returnInteraction_huodong;
     global $cfg_returnInteraction_vote;
     global $cfg_returnInteraction_article;
     global $langData;

    if ($module =='sfcar'){
        $integral = $cfg_returnInteraction_sfcar;
        $info = getModuleTitle(array('name' => 'sfcar'));
    }elseif($module =='info'){
        $integral = $cfg_returnInteraction_info;
        $info = getModuleTitle(array('name' => 'info'));
    }elseif($module =='live'){
        $integral = $cfg_returnInteraction_live;
        $info = getModuleTitle(array('name' => 'live'));
    }elseif($module =='tieba'){
        $integral = $cfg_returnInteraction_tieba;
        $info = getModuleTitle(array('name' => 'tieba'));
    }elseif($module =='car'){
        $integral = $cfg_returnInteraction_car;
        $info = getModuleTitle(array('name' => 'car'));
    }elseif($module =='huodong'){
        $integral = $cfg_returnInteraction_huodong;
        $info = getModuleTitle(array('name' => 'huodong'));
    }elseif($module =='vote'){
        $integral = $cfg_returnInteraction_vote;
        $info = getModuleTitle(array('name' => 'vote'));
    }elseif($module =='article'){
        $integral = $cfg_returnInteraction_article;
        $info = getModuleTitle(array('name' => 'article'));

    }
    $product[] = array(
        'integral' => $integral,
        'info' => $info,
    );
    return $product;

}

//统计互动积分到达上限
    function  countIntegral($userid){
    global $dsql;
    $start = GetMkTime(date('Y-m-d'));
    $end = $start+86400;

    //统计评论积分到达后台配置的限制
    $archives = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__member_point` WHERE `userid` = '$userid' AND `type` = 1 AND `interaction` ='1' AND `date` >= $start AND `date` < $end ");
    $countresults  = $dsql->dsqlOper($archives, "results");
    $amount = 0;
    if ($countresults[0]['total']){
        $amount = $countresults[0]['total'];
    }
    return  $amount;

}


//分站佣金计算
function cityCommission($city,$module){
    global $dsql;
    global $cfg_fzrewardFee;
    global $cfg_fzbusinessMaidanFee;
    global $cfg_fztuanFee;
    global $cfg_fztravelFee;
    global $cfg_fzshopFee;
    global $cfg_fzwaimaiFee;
    global $cfg_fzhuodongFee;
    global $cfg_fzhomemakingFee;
    global $cfg_fzeducationFee;
    global $cfg_fzawardlegouFee;
    global $cfg_roofFee;
    global $cfg_setmealFee;
    global $cfg_fabulFee;
    global $cfg_fzliveFee;
    global $cfg_fzvideoFee;
    global $cfg_storeFee;
    global $cfg_fenxiaoFee;
    global $cfg_jiliFee;
    global $cfg_payPhoneFee;
    global $cfg_fzwaimaiPaotuiFee;
    global $cfg_levelFee;
    global $paytypee;
    // if ($paytypee == 'huoniao_bonus') return '0';
    $archives = $dsql->SetQuery("SELECT  `config`  FROM `#@__site_city` WHERE `cid` = '$city'");
    $sql = $dsql->dsqlOper($archives, "results");
    if ($module == 'reward'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzrewardFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzrewardFee'] ? $arrayCity['siteConfig']['cfg_fzrewardFee'] :$cfg_fzrewardFee;
        }
    }
    if ($module == 'businessMaidan'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzbusinessMaidanFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzbusinessMaidanFee'] ? $arrayCity['siteConfig']['cfg_fzbusinessMaidanFee'] :$cfg_fzbusinessMaidanFee;
        }
    }
    if ($module == 'tuan'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fztuanFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fztuanFee'] ? $arrayCity['siteConfig']['cfg_fztuanFee'] : $cfg_fztuanFee;
        }
    }
    if ($module == 'travel'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fztravelFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fztravelFee'] ? $arrayCity['siteConfig']['cfg_fztravelFee'] : $cfg_fztravelFee;
        }
    }
    if ($module == 'homemaking'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzhomemakingFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzhomemakingFee'] ? $arrayCity['siteConfig']['cfg_fzhomemakingFee'] : $cfg_fzhomemakingFee;
        }
    }
    if ($module == 'education'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzeducationFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzeducationFee'] ? $arrayCity['siteConfig']['cfg_fzeducationFee'] : $cfg_fzeducationFee;
        }
    }
    if ($module == 'shop'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzshopFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzshopFee'] ? $arrayCity['siteConfig']['cfg_fzshopFee'] : $cfg_fzshopFee;
        }
    }
    if ($module == 'waimai'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzwaimaiFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzwaimaiFee'] ? $arrayCity['siteConfig']['cfg_fzwaimaiFee'] : $cfg_fzwaimaiFee;
        }
    }
    if ($module == 'waimaiPaotui'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzwaimaiPaotuiFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzwaimaiPaotuiFee'] ? $arrayCity['siteConfig']['cfg_fzwaimaiPaotuiFee'] : $cfg_fzwaimaiPaotuiFee;
        }
    }
    if ($module == 'huodong'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzhuodongFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzhuodongFee'] ? $arrayCity['siteConfig']['cfg_fzhuodongFee'] : $cfg_fzhuodongFee;
        }
    }

    if ($module == 'live'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzliveFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzliveFee'] ? $arrayCity['siteConfig']['cfg_fzliveFee'] : $cfg_fzliveFee;
        }
    }
    if ($module == 'video'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzvideoFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzvideoFee'] ? $arrayCity['siteConfig']['cfg_fzvideoFee'] : $cfg_fzvideoFee;
        }
    }
    if ($module == 'awardlegou'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fzawardlegouFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fzawardlegouFee'] ? $arrayCity['siteConfig']['cfg_fzawardlegouFee'] : $cfg_fzawardlegouFee;
        }
    }
    if ($module == 'roof'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_roofFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_roofFee'] ? $arrayCity['siteConfig']['cfg_roofFee'] : $cfg_roofFee;
        }
    }
    if ($module == 'setmeal'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_setmealFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_setmealFee'] ? $arrayCity['siteConfig']['cfg_setmealFee'] : $cfg_setmealFee;
        }
    }
    if ($module == 'fabu'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fabulFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fabulFee'] ? $arrayCity['siteConfig']['cfg_fabulFee'] : $cfg_fabulFee;
        }
    }
    if ($module == 'level'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_levelFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_levelFee'] ? $arrayCity['siteConfig']['cfg_levelFee'] : $cfg_levelFee;
        }
    }
    if ($module == 'store'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_storeFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_storeFee'] ? $arrayCity['siteConfig']['cfg_storeFee'] : $cfg_storeFee;
        }
    }
    if ($module == 'fenxiao'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_fenxiaoFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_fenxiaoFee'] ? $arrayCity['siteConfig']['cfg_fenxiaoFee'] : $cfg_fenxiaoFee;
        }
    }
    if ($module == 'jili'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_jiliFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_jiliFee'] ? $arrayCity['siteConfig']['cfg_jiliFee'] : $cfg_jiliFee;
        }
    }
    if ($module == 'payPhone'){
        if (empty($sql[0]['config'])){
            $fzFee = $cfg_payPhoneFee;
        }else{
            $arrayCity = unserialize($sql[0]['config']);
            $fzFee = $arrayCity['siteConfig']['cfg_payPhoneFee'] ? $arrayCity['siteConfig']['cfg_payPhoneFee'] : $cfg_payPhoneFee;
        }
    }

    return (float)$fzFee;

}

//分站余额
 function substationAmount($lastid,$cityid){
     global $dsql;
     
     $cityid = (int)$cityid;
    
     if($cityid){
         $fzarchives = $dsql->Setquery("SELECT `money` FROM `#@__site_city` WHERE `cid` =".$cityid);
         $ret = $dsql->dsqlOper($fzarchives, "results");
         $money = $ret[0]['money'];
         $archives = $dsql->SetQuery("UPDATE `#@__member_money` SET  `substation` = '$money' WHERE `id` = $lastid AND `cityid` = $cityid");
         $dsql->dsqlOper($archives, "update");
     }

 }

 /**
  *  取得某支付方式信息
  *  @param  string  $code   支付方式代码
  */
 function getPaymentName($code){
    global $dsql;
    global $cfg_pointName;

    $name = $code;

    if($code == 'money' || $code == 'balance'){
        $name = '余额支付';
    }elseif($code == 'delivery'){
        $name = '货到付款';
    }elseif($code == 'integral'){
        $name = $cfg_pointName.'抵扣';
    }elseif($code == 'underpay'){
        $name = '线下支付';
    }elseif($code == 'point,money'){
        $name = '余额+'.$cfg_pointName;
    }else{
     	$archives = $dsql->SetQuery("SELECT * FROM `#@__site_payment` WHERE `pay_code` = '$code'");
     	$results = $dsql->dsqlOper($archives, "results");
        if ($results){
            $name = $results[0]['pay_name'];
        }
    }

    return $name;
 }

/**
 *  取得某支付方式信息
 *  @param  string  $code   支付方式代码
 *  @param  string  $amount   花费的钱
 *  @param  string  $point   积分抵扣的钱
 */
function getDetailPaymentName($code,$amount,$point,$payprice){
    global $dsql;

    $name = $code;
    $amount = sprintf("%.2f", $amount);
    $point = sprintf("%.2f", $point);

    $symbol = echoCurrency(array('type' => 'symbol'));

    if($code == 'money'){
        $name = '余额支付'.$symbol.$amount;
    }elseif($code == 'delivery'){
        $price = $amount+$point;
        $name = '货到付款'.$symbol.$price;
    }elseif($code == 'integral'){
        if ($point > 0){
            $name = '积分支付'.$symbol.$point;
        }
    }elseif($code == 'underpay'){
        $name = '线下支付'.$symbol.$amount;
    }else{
        $archives = $dsql->SetQuery("SELECT * FROM `#@__site_payment` WHERE `pay_code` = '$code'");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results){
            $name = $results[0]['pay_name'].$symbol.$payprice;;
        }
    }

    return $name;
}
/**
 *  商城取得某支付方式信息
 *  @param  string  $code   支付方式代码
 *  @param  string  $amount   花费的钱
 *  @param  string  $point   积分抵扣的钱
 */
function getshopDetailPaymentName($code,$amount,$point,$payprice)
{
    global $dsql;

    $name = $code;
    $amount = sprintf("%.2f", $amount);
    $point = sprintf("%.2f", $point);

    $symbol = echoCurrency(array('type' => 'symbol'));

    if ($code == 'money') {
        $name = '余额支付'.$symbol.$amount;
    } elseif ($code == 'delivery') {
        // $price = $amount + $point;
        $name = '货到付款'.$symbol.$payprice;
    } elseif ($code == 'point') {
        $name = '积分支付'.$symbol.$point;
    } elseif ($code == 'underpay') {
        $name = '线下支付'.$symbol.$amount;
    } else {
        $archives = $dsql->SetQuery("SELECT * FROM `#@__site_payment` WHERE `pay_code` = '$code'");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $name = $results[0]['pay_name'].$symbol.$payprice;;
        }
    }

    return $name;
}


/**
 * Notes: 获取订单详情地址
 * Ueser: Administrator
 * DateTime: 2021/8/26 18:00
 * Param1:
 * Param2:
 * Param3:
 * Return:
 * @param $service
 * @param $ordernum
 */
function orderDetailUrl($service,$ordernum){

    global $cfg_secureAccess;
    global $dsql;
    global $param;

    $table = '';

    if( empty($ordernum) || empty($service)){

        return $cfg_secureAccess;
    }

    switch ($service){

        case 'shop':
            $table = '__shop_order';
            break;

        case 'waimai':
            $table = '__waimai_order_all';
            break;

        case 'tuan':
            $table = '__tuan_order';
            break;
        case 'homemaking':
            $table = '__homemaking_order';
            break;
        case 'travel':
            $table = '__travel_order';
            break;
        case 'education':
            $table = '__education_order';
            break;
        case 'business':
            $table = '__business_maidan_order';
            break;
        case "paimai":
            $table = "__paimai_order";
    }


    if($service == 'business'){
        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "order-business",
            "param"    => "type=maidan"
        );
        return  getUrlPath($param);

    }else{
        if ($table != '') {
            $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@" . $table . "` WHERE `ordernum` = '$ordernum'");
            $orderres = $dsql->dsqlOper($ordersql, "results");
            $oid = (int)$orderres[0]['id'];

            //跑腿订单
            if(!$oid && $service == 'waimai'){
                $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `ordernum` = '$ordernum'");
                $orderres = $dsql->dsqlOper($ordersql, "results");
                $oid = (int)$orderres[0]['id'];
                $service = "paotui";
            }

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => $service,
                "id"       => $oid
            );
            return  getUrlPath($param);
        }else{

            //支付成功后不需要跳转的业务（安卓APP端特有功能）
            //打赏支付成功后，刷新当前页面
            if(isAndroidApp() && ($service == 'article' || $service == 'tieba' || $service == 'job')){

                if($service == 'job'){
                    return 'stay';  //APP支付成功后，返回ok，由H5进行后续操作。
                }
                else{
                    $param = array(
                        "service"  => $service,
                        "template" => "payreturn",
                        "param"    => "ordernum=".$ordernum
                    );
    
                    return getUrlPath($param);
                }

                return '';  //如果返回stay，客户端将不进行任何操作
            }else{
                if($service == 'job'){
                    global $cfg_basedomain;
                    $param = array(
                        "service"   => "custom",
                        "param"     => $cfg_basedomain . "/supplier/job?appFullScreen"
                    );
                }else{
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "bill"
                    );
                }
                return  getUrlPath($param);
            }
            
        }
    }
}

/**
 * Notes: 优闪速达获取店铺分类
 * Ueser: Administrator
 * DateTime: 2021/9/3 14:25
 * Param1:
 * Param2:
 * Param3:
 * Return:
 */
function ysShopType() {
    $data = json_decode(@file_get_contents(HUONIAOROOT . "/yssdshoptype.json"), true);

    if (!$data) {
        $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
        require_once($pluginFile);
        $youshansudaClass = new youshansuda();

        $results = $youshansudaClass->shopType();

        if ($results['code'] == '200') {
            $fp = @fopen(HUONIAOROOT . "/yssdshoptype.json", "w");
            @fwrite($fp, json_encode($results['data']));
            @fclose($fp);
        }

        return $results['data'];

    }
    return $data;
}



/**
*  取得某支付方式信息
*  @param  string  $code   支付方式代码
*  @param  string  $amount   花费的钱
*  @param  string  $point   积分抵扣的钱
*/
function cityInfoById($cityid){
   global $dsql;

   $siteConfigService = new siteConfig(array('cityid' => $cityid));
   $cityDomain = $siteConfigService->cityInfoById();
   if(is_array($cityDomain)){
       return $cityDomain;
   }
}


/**
 * 数组混合排序
 * 数字、字母、中文
 * 1. 用默认的sort会出现意外情况
 * 比如：曜石黑  会排在  标准版  的前面
 * 2. collator_sort(collator_create('zh_CN'),$str)
 * 会出现：M 排在 黑色 后面
 *
 * 这里做下优化，将需要排序的数组项先转成GBK，再进行sort，然后再转成utf8
 */
function hnSortArr($arr = array()){
    if($arr && is_array($arr)){

        //先转拼音
        foreach ($arr as $key => $value) {
            $value = GetPinyin($value) . '$-$-$' . $value;
            // $arr[$key] = iconv('UTF-8', 'GBK', $value);
            $arr[$key] = $value;
        }

//        //正序
//        sort($arr);

        //删除拼音
        foreach ($arr as $key => $value) {
            $value = explode('$-$-$', $value);
            // $arr[$key] = iconv('GBK','UTF-8',$value);
            $arr[$key] = $value[1];
        }
        //正序
        asort($arr, SORT_STRING | SORT_FLAG_CASE | SORT_NATURAL);
    }
    return $arr;
}


 /**
  * 退款
  */

 function refund($module,$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id,$orderamount=0){
     global $dsql;
     global $userLogin;
     global $langData;
     $r = true;
     
     $orderamount = $orderamount ? $orderamount : $payprice;  //订单金额，主要用于团购，因为有部分退款的情况，如果直接用实际退款金额，接口会报错

     //如果是代付的，直接退到购买人账户余额
    //  if($peerpay > 0){

    //      $balance += $payprice;  //强制转为余额付

    //  }
     if ($paytype == "alipay" && $payprice != 0) {

         $order = array(
             "ordernum"    => $ordernum,
             "orderamount" => $orderamount,
             "amount"      => $payprice
         );


         require_once(HUONIAOROOT . "/api/payment/alipay/alipayRefund.php");
         $alipayRefund = new alipayRefund();

         $return = $alipayRefund->refund($order);


         // 成功
         if ($return['state'] == 100) {

             $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
             $refrunddate = GetMkTime($return['date']);

         } else {

             $r           = false;
             $refrundcode = $return['code'];

         }


         // 微信
     } elseif (($paytype == "wxpay" || $paytype == "qqmini") && $payprice != 0) {
         $order = array(
             "ordernum"    => $ordernum,
             "orderamount" => $orderamount,
             "amount"      => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
         $wxpayRefund = new wxpayRefund();

         $return = $wxpayRefund->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
             if ($module == 'tuan'){
                 $sql       = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                 $ret       = $dsql->dsqlOper($sql, "update");
             }elseif ($module == 'shop'){
                 $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                 $ret       = $dsql->dsqlOper($sql, "update");
             }elseif($module == 'awardlegou'){
                 $sql       = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                 $ret       = $dsql->dsqlOper($sql, "update");
             }elseif($module == 'info'){
                 $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$refrundno."' WHERE `id` = $id");
                 $ret       = $dsql->dsqlOper($sql, "update");
             }




         } else {

            $returnCode = $return['code'];
            if(strstr($returnCode, '余额不足')){
                $r           = false;
                $refrundcode = $returnCode;
            }else{

                require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayRefund.php");
                $wxpayRefund = new wxpayRefund();

                $return = $wxpayRefund->refund($order, true);

                // 成功
                if ($return['state'] == 100) {

                    $refrundno = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
                    if ($module == 'tuan'){
                        $sql       = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }elseif($module == 'shop'){
                        $sql = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }elseif ($module == 'awardlegou'){
                        $sql       = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }elseif ($module == 'info'){
                        $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$refrundno."' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }

                } else {
                    $r           = false;
                    $refrundcode = '错误信息1：' . $returnCode . '；错误信息2：' . $return['code'];
                }
            }

         }


         // 银联
     } elseif ($paytype == "unionpay" && $payprice != 0) {

         $order = array(
             "ordernum"       => $ordernum,
             "orderamount"    => $orderamount,
             "amount"         => $payprice,
             "transaction_id" => $transaction_id
         );

         require_once(HUONIAOROOT . "/api/payment/unionpay/unionpayRefund.php");
         $unionpayRefund = new unionpayRefund();

         $return = $unionpayRefund->refund($order);

         // 成功
         if ($return['state'] == 100) {

             $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
             $refrunddate = GetMkTime($return['date']);

         } else {

             $r           = false;
             $refrundcode = $return['code'];

         }


         // 工行E商通
     } elseif ($paytype == "rfbp_icbc" && $payprice != 0) {

         $order = array(
             "service"     => $module,
             "ordernum"    => $ordernum,
             "orderamount" => $orderamount,
             "amount"      => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/rfbp_icbc/rfbp_refund.php");
         $rfbp_refund = new rfbp_refund();

         $return = $rfbp_refund->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
             $refrunddate = GetMkTime($return['date']);
         } else {
             $refrundcode = $return['code'];
             $r           = false;
         }


         // 百度小程序
     } elseif ($paytype == "baidumini" && $payprice != 0) {

         $order = array(
             "service"     => $module,
             "ordernum"    => $ordernum,
             "orderamount" => $orderamount,
             "amount"      => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/baidumini/refund.php");
         $baiduminiRefund = new baiduminiRefund();

         $return = $baiduminiRefund->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
             $refrunddate = GetMkTime($return['date']);
         } else {
             $refrundcode = $return['code'];
             $r           = false;
         }


         // YabandPay
     } elseif (($paytype == "yabandpay_wxpay" || $paytype == "yabandpay_alipay") && $payprice != 0) {

         $order = array(
             "service" =>$module,
             "ordernum" => $ordernum,
             "orderamount" => $orderamount,
             "amount" => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/yabandpay_wxpay/yabandpay_refund.php");
         $yabandpay_refund = new yabandpay_refund();

         $return = $yabandpay_refund->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
             $refrunddate = GetMkTime($return['date']);
         } else {
             $refrundcode = $return['code'];
             $r           = false;
         }


         // bytemini
     } elseif ($paytype == "bytemini" && $payprice != 0) {

         $order = array(
             "service" => $module,
             "ordernum" => $ordernum,
             "orderamount" => $orderamount,
             "amount" => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/bytemini/bytemini_refund.php");
         $bytemini_refund = new bytemini_refund();

         $return = $bytemini_refund->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
             $refrunddate = GetMkTime($return['date']);
         } else {
             $refrundcode = $return['code'];
             $r           = false;
         }

         // allinpay 通联支付
     } elseif (($paytype == "allinpay_wxpay" || $paytype == "allinpay_alipay") && $payprice != 0) {

         $order = array(
             "service" =>$module,
             "ordernum" => $ordernum,
             "orderamount" => $orderamount,
             "amount" => $payprice
         );

         require_once(HUONIAOROOT . "/api/payment/allinpay_alipay/allinpay_alipay.php");
         $allinpay_alipay = new allinpay_alipay();

         $return = $allinpay_alipay->refund($order);

         // 成功
         if ($return['state'] == 100) {
             $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
             $refrunddate = GetMkTime($return['date']);
         } else {
             $refrundcode = $return['code'];
             $r           = false;
         }

     }elseif($paytype == 'huoniao_bonus' && $payprice!=0){
         $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__pay_log` WHERE (`ordernum` = '$ordernum' OR FIND_IN_SET('$ordernum', `body`)) AND `state` = 1");
         $ret = $dsql->dsqlOper($sql, "results");
         $uid = $ret[0]['uid'] ? $ret[0]['uid'] : 0;
         $archives = $dsql->SetQuery("UPDATE `#@__member` SET `bonus` = `bonus` + '$payprice' WHERE `id` = '$uid'");

         $dsql->dsqlOper($archives, "update");
         $user  = $userLogin->getMemberInfo($uid);
         $userbonus = $user['bonus'];
         $refrunddate = GetMkTime(time());
         if ($module == 'paotui'){
             $infoname = '跑腿';
         }else{
             $infoname = getModuleTitle(array('name' => $module));    //获取模块名
         }
         //保存操作日志
         $archives = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`balance`) VALUES ('$uid', '1', '$payprice', '".$infoname."订单退回(消费金退款:$payprice)：$ordernum', '$refrunddate','$module','$userbonus')");
         $dsql->dsqlOper($archives, "update");
     }
     $arr = array([
            'r'        =>$r,
         'refrundno'   =>$refrundno,
         'refrunddate' =>$refrunddate,
         'refrundcode' =>$refrundcode,
         'balance'    =>$balance
     ]);
     return $arr;
}

function adminRefund($module,$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id){
    global $dsql;
    global $userLogin;
    global $langData;
    $r = true;
    if($paytype == "alipay" && $payprice!=0){

        $order = array(
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );


        require_once(HUONIAOROOT."/api/payment/alipay/alipayRefund.php");
        $alipayRefund = new alipayRefund();

        $return = $alipayRefund->refund($order);


        // 成功
        if($return['state'] == 100){

            $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno.','.$return['trade_no'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
            }

        }else{

            $r = false;
            $refrundcode = $return['code'];

        }


        // 微信
    }elseif(($paytype == "wxpay" || $paytype == "qqmini") && $payprice!=0){

        $order = array(
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT."/api/payment/wxpay/wxpayRefund.php");
        $wxpayRefund = new wxpayRefund();

        $return = $wxpayRefund->refund($order);

        // 成功
        if($return['state'] == 100){
            $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno.','.$return['trade_no'];
            if ($module == 'info') {
                $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
            }elseif ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
            }elseif($module == 'awardlegou'){
                $sql       = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret       = $dsql->dsqlOper($sql, "update");
            }elseif ($module == 'tuan'){
                $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$refrundno."' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
            }elseif($module == 'shop'){
                $sql       = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret       = $dsql->dsqlOper($sql, "update");
            }
        }else{

            if(strstr($return['code'], '余额不足')){
                $r           = false;
                $refrundcode = $return['code'];
            }else{
                require_once(HUONIAOROOT."/api/payment/wxpay/wxpayRefund.php");
                $wxpayRefund = new wxpayRefund();

                $return = $wxpayRefund->refund($order, true);

                // 成功
                if($return['state'] == 100){

                    $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno.','.$return['trade_no'];
                    if ($module == 'info'){
                        $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$refrundno."' WHERE `id` = $id");
                        $ret = $dsql->dsqlOper($sql, "update");
                    }elseif ($module == 'paotui'){
                        $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
                        $ret = $dsql->dsqlOper($sql, "update");
                    }elseif($module == 'awardlegou'){
                        $sql       = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }elseif ($module == 'tuan'){
                        $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$refrundno."' WHERE `id` = $id");
                        $ret = $dsql->dsqlOper($sql, "update");
                    }elseif($module == 'shop'){
                        $sql       = $dsql->SetQuery("UPDATE `#@__shop_order` SET `refrunddate` = '" . GetMkTime($return['date']) . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                        $ret       = $dsql->dsqlOper($sql, "update");
                    }

                }else{
                    $r = false;
                    $refrundcode = $return['code'];
                }
            }

        }


        // 银联
    }elseif($paytype == "unionpay" && $payprice!=0){

        $order = array(
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice,
            "transaction_id" => $transaction_id
        );

        require_once(HUONIAOROOT."/api/payment/unionpay/unionpayRefund.php");
        $unionpayRefund = new unionpayRefund();

        $return = $unionpayRefund->refund($order);

        // 成功
        if($return['state'] == 100){

            $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno.','.$return['trade_no'];
            $refrunddate = GetMkTime($return['date']);

        }else{

            $r = false;
            $refrundcode = $return['code'];

        }


        // 工行E商通
    }elseif($paytype == "rfbp_icbc" && $payprice!=0){

        $order = array(
            "service" => $module,
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT."/api/payment/rfbp_icbc/rfbp_refund.php");
        $rfbp_refund = new rfbp_refund();

        $return = $rfbp_refund->refund($order);

        // 成功
        if($return['state'] == 100){
            $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno.','.$return['refundOrderNo'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['refundOrderNo']."' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");

            }
        }else{
            $refrundcode = $return['code'];
            $r = false;
        }


        // 百度小程序
    }elseif($paytype == "baidumini" && $payprice!=0){

        $order = array(
            "service" =>$module,
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT."/api/payment/baidumini/refund.php");
        $baiduminiRefund = new baiduminiRefund();

        $return = $baiduminiRefund->refund($order);

        // 成功
        if($return['state'] == 100){
            $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno.','.$return['refundOrderNo'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['refundOrderNo']."' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
        }else{
            $refrundcode = $return['code'];
            $r = false;
        }


        // YabandPay
    } elseif (($paytype == "yabandpay_wxpay" || $paytype == "yabandpay_alipay") && $payprice != 0) {

        $order = array(
            "service" => $module,
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT . "/api/payment/yabandpay_wxpay/yabandpay_refund.php");
        $yabandpay_refund = new yabandpay_refund();

        $return = $yabandpay_refund->refund($order);

        // 成功
        if ($return['state'] == 100) {
            $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['refundOrderNo']."' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
        } else {
            $refrundcode = $return['code'];
            $r           = false;
        }


        // bytemini
    } elseif ($paytype == "bytemini" && $payprice != 0) {

        $order = array(
            "service" => $module,
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT . "/api/payment/bytemini/bytemini_refund.php");
        $bytemini_refund = new bytemini_refund();

        $return = $bytemini_refund->refund($order);

        // 成功
        if ($return['state'] == 100) {
            $refrundno   = empty($refrundno) ? $return['refundOrderNo'] : $refrundno . ',' . $return['refundOrderNo'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['refundOrderNo']."' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
        } else {
            $refrundcode = $return['code'];
            $r           = false;
        }

        // allinpay 通联支付
    } elseif (($paytype == "allinpay_wxpay" || $paytype == "allinpay_alipay") && $payprice != 0) {

        $order = array(
            "service" => $module,
            "ordernum" => $ordernum,
            "orderamount" => $payprice,
            "amount" => $payprice
        );

        require_once(HUONIAOROOT . "/api/payment/allinpay_alipay/allinpay_alipay.php");
        $allinpay_alipay = new allinpay_alipay();

        $return = $allinpay_alipay->refund($order);

        // 成功
        if ($return['state'] == 100) {
            $refrundno   = empty($refrundno) ? $return['trade_no'] : $refrundno . ',' . $return['trade_no'];
            $refrunddate = GetMkTime($return['date']);
            if ($module == 'paotui'){
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrunddate` = '".GetMkTime($return['date'])."', `refrundno` = '".$return['trade_no']."' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
        } else {
            $r = false;
        }

        //自定义第三方支付
    }elseif($paytype == "huoniao_bonus" && $payprice != 0){
        $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__pay_log` WHERE (`ordernum` = '$ordernum' OR FIND_IN_SET('$ordernum', `body`)) AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");
        $uid = $ret[0]['uid'] ? $ret[0]['uid'] : 0;
        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `bonus` = `bonus` + '$payprice' WHERE `id` = '$uid'");

        $dsql->dsqlOper($archives, "update");
        $user  = $userLogin->getMemberInfo($uid);
        $userbonus = $user['bonus'];
        $refrunddate = GetMkTime(time());
        $infoname = getModuleTitle(array('name' => $module));    //获取模块名
        //保存操作日志
        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`balance`) VALUES ('$uid', '1', '$payprice', '".$infoname."订单退回(消费金退款:$payprice)：$ordernum', '$refrunddate','$module','$userbonus')");
        $dsql->dsqlOper($archives, "update");
    }
    $arr = array([
        'r'        =>$r,
        'refrundno'   =>$refrundno,
        'refrunddate' =>$refrunddate,
        'refrundcode' =>$refrundcode,
        'balance'    =>$balance
    ]);
    return $arr;

}


//根据模块和订单号，获取微信特约商户号
/*
 * $order_sn       pay_log表中的ordernum字段
 * $type           0 取微信商户号  1取支付宝商家PID  其他：取商家ID
 */
function getWxpaySubMchid($service, $order_sn, $type = 0){
    global $dsql;
    $s_uid = 0;
    $sql = $dsql->SetQuery("SELECT `body`,`ordernum` FROM `#@__pay_log` WHERE `ordernum` = '$order_sn'");
    $results = $dsql->dsqlOper($sql, "results");
    if ($service == 'shop' || $service == 'tuan' || $service == 'awardlegou'){
        if (strpos($results[0]['body'], ',') !== false){
            $s_uid = 0;
        }else{
            if ($service =='tuan'){
                $sql = $dsql->SetQuery("SELECT e.`uid` FROM `#@__tuan_order` o LEFT JOIN  `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` e  ON l.`sid` = e.`id` WHERE `ordernum` = '".$results[0]['body']."'");
                $results = $dsql->dsqlOper($sql, "results");
                if ($results){
                    $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
                }
            }
            if ($service == 'shop'){
                $sql = $dsql->SetQuery("SELECT e.`userid` FROM `#@__shop_order` o LEFT JOIN  `#@__shop_store` e ON o.`store` = e.`id` WHERE `ordernum` = '".$results[0]['body']."'");
                $results = $dsql->dsqlOper($sql, "results");
                if ($results){
                    $s_uid = $results[0]['userid'] ? $results[0]['userid'] : 0;
                }
            }
            if ($service == 'awardlegou'){
                $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__awardlegou_order` o   LEFT JOIN `#@__awardlegou_list` a ON o.`proid` = a.`id` LEFT JOIN `#@__business_list` l ON  a.`sid` = l.`id` WHERE `ordernum` = '".$results[0]['body']."'");
                $results = $dsql->dsqlOper($sql, "results");
                if ($results){
                    $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
                }
            }

        }
    }elseif($service == 'business'){
        $sql = $dsql->SetQuery("SELECT l.`uid` FROM `#@__business_maidan_order` o LEFT JOIN  `#@__business_list` l ON o.`sid` = l.`id`  WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
        }
    }elseif ($service == 'homemaking'){
        $sql = $dsql->SetQuery("SELECT e.`userid` FROM `#@__homemaking_order` o LEFT JOIN  `#@__homemaking_list` l ON o.`proid` = l.`id`  LEFT JOIN `#@__homemaking_store` e  ON l.`company` = e.`id` WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['userid'] ? $results[0]['userid'] : 0 ;
        }
    }elseif ($service == 'waimai'){
        $sql = $dsql->SetQuery("SELECT m.`userid` FROM `#@__waimai_order_all` o LEFT JOIN  `#@__waimai_shop` s ON o.`sid` = s.`id`  LEFT JOIN `#@__waimai_shop_manager` m ON s.`id` = m.`shopid` WHERE `ordernum` = '".$results[0]['ordernum']."' ORDER BY m.`id` ASC");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['userid'] ? $results[0]['userid'] : 0 ;
        }
    }elseif ($service == 'travel'){
        $sql = $dsql->SetQuery("SELECT s.`userid` FROM `#@__travel_order` o LEFT JOIN  `#@__travel_store` s ON o.`store` = s.`id`  WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['userid'] ? $results[0]['userid'] : 0 ;
        }
    }elseif ($service == 'info'){
        $sql = $dsql->SetQuery("SELECT s.`uid` FROM `#@__info_order` o LEFT JOIN  `#@__infoshop` s ON o.`store` = s.`id`  WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
        }
    }elseif ($service == 'huodong'){
        $sql = $dsql->SetQuery("SELECT b.`uid` FROM `#@__huodong_order` o LEFT JOIN  `#@__huodong_list` l ON o.`hid` = l.`id` LEFT JOIN  `#@__business_list` b ON l.`uid` = b.`uid`  WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
        }
    }elseif ($service == 'education'){
        $sql = $dsql->SetQuery("SELECT t.`userid` FROM `#@__education_order` o LEFT JOIN  `#@__education_class` s ON o.`proid` = s.`id`  LEFT JOIN  `#@__education_courses` c ON s.`coursesid` = c.`id`  LEFT JOIN  `#@__education_store` t ON c.`userid` = t.`id`  WHERE `ordernum` = '".$results[0]['ordernum']."'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['userid'] ? $results[0]['userid'] : 0 ;
        }
    }elseif ($service == 'integral'){
        $s_uid = 0;
    }elseif ($service == 'member'){
        $s_uid = 0;
    }elseif ($service == 'house'){
        $s_uid = 0;
    }else{
        //打赏
        $sql = $dsql->SetQuery("SELECT l.`uid` FROM `#@__member_reward` d LEFT JOIN  `#@__business_list` l ON d.`touid` = l.`uid`  WHERE `ordernum` = '".$results[0]['ordernum']."' AND d.`module` ='$service'");
        $results = $dsql->dsqlOper($sql, "results");
        if ($results){
            $s_uid = $results[0]['uid'] ? $results[0]['uid'] : 0 ;
        }
    }

    //根据获取到的用户ID，查询商家表的wxpay_submchid
    if($s_uid){
        $sql = $dsql->SetQuery("SELECT `wxpay_submchid`,`alipay_pid`,`alipay_app_auth_token`,`id` FROM `#@__business_list` WHERE `uid` = $s_uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if ($type == 0){
                $wxpay_submchid = $ret[0]['wxpay_submchid'];
                return $wxpay_submchid;
            }elseif($type == 1){
                $alipay_pid = $ret[0]['alipay_pid'];
                $alipay_app_auth_token = $ret[0]['alipay_app_auth_token'];
                return array(
                    'alipay_pid' => $alipay_pid,
                    'alipay_app_auth_token' => $alipay_app_auth_token
                );
            }else{
                $sid = $ret[0]['id'];
                return $sid;
            }

        }else{
            return false;
        }

    }else{
        return false;
    }

}


//根据聚合数据快递公司简称，获取阿里云快速公司信息
function getAliyunWdexpressCompany($com){
    switch ($com) {
        case 'yt':
            $com = 'yto';
            break;
        case 'tt':
            $com = 'hhtt';
            break;
        case 'qf':
            $com = 'qfkd';
            break;
        case 'db':
            $com = 'dbl';
            break;
        case 'gt':
            $com = 'gto';
            break;
        case 'tt':
            $com = 'hhtt';
            break;
        case 'tt':
            $com = 'hhtt';
            break;
    }
    return strtoupper($com);
}


//今日总收益
function getAllincome(){
    global $dsql;

    //查询今日总收益
    $start_time=strtotime(date("Y-m-d",time()));
    $end_time=$start_time+3600*24;

    $profitsql = $dsql->SetQuery("SELECT SUM( case when `montype` = 1 then `amount` else 0 end) as czamount , SUM(`platform`) as platform   FROM `#@__member_money` WHERE `date` >= $start_time AND `date` <= $end_time");
    $allprofit = $dsql->dsqlOper($profitsql, "results");
    $allincome = $allprofit[0]['czamount'] + $allprofit[0]['platform'];
    $realtimedata  = (float)$allincome;
    return sprintf("%.2f",$realtimedata);
}

//分站总收益

function getcityMoney($cityid){
    global $dsql;
    //查询今日总收益
    $start_time=strtotime(date("Y-m-d",time()));
    $end_time=$start_time+3600*24;
    $totalMoneysql = $dsql->SetQuery("SELECT SUM(`commission`) as totalMoney  FROM `#@__member_money` WHERE `cityid`='$cityid' AND `showtype`  = 1 AND ctype != 'tixian' AND `date` >= $start_time AND `date` <= $end_time ");
    $totalMoneyres = $dsql->dsqlOper($totalMoneysql, "results");
    $totalMoney    = (float)$totalMoneyres[0]['totalMoney'];
    return sprintf("%.2f",$totalMoney);
}


function fenXiaoMoneyCalculationTwo($module,$ordernum,$price){
    global $dsql;
    global $userLogin;
    include HUONIAOINC . '/config/'.$module.'.inc.php';
    include HUONIAOINC."/config/fenxiaoConfig.inc.php";
    $fenxiaoSource = (float)$cfg_fenxiaoSource;
    global $cfg_fenxiaoAmount;
    $fenxiaoAmount  = $cfg_fenxiaoAmount;
    $paramarr = array();
    if($module =='tuan'){
        $is_quan = 0;
        if(strlen((string)$ordernum) == 12){
            $is_quan = 1;
            $sql = $dsql->SetQuery(
                "SELECT p.`id`, p.`fx_reward`, p.`title`, o.`userid`, o.`orderprice`, o.`procount`, o.`ordernum`, s.`uid` storeuid, m.`username` FROM `#@__tuanlist` p
                        LEFT JOIN `#@__tuan_order` o ON o.`proid` = p.`id`
                        LEFT JOIN `#@__tuanquan` q ON q.`orderid` = o.`id`
                        LEFT JOIN `#@__tuan_store` s ON s.`id` = p.`sid`
                        LEFT JOIN `#@__member` m ON m.`id` = o.`userid`
                        WHERE q.`cardnum` = '$ordernum'"
            );
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) return;

            $storeuid = $res[0]['storeuid'];
            $username = $res[0]['username'];
            $procount = (int)$res[0]['procount'];
            $ordernum = $res[0]['ordernum'];
            $totalPrice = 0;//商品总金额
            $totalAmount = 0;//佣金总额

            $totalPrice = $price;
            $fx_reward_ratio = $res[0]['fx_reward'];
            if($res[0]['fx_reward'] == '0'){
                $fx_reward = 0;
            }elseif($res[0]['fx_reward']){
                if(strstr($res[0]['fx_reward'], '%')){
                    $fx_reward = $totalPrice * (float)$res[0]['fx_reward'] / 100;
                }else{
                    $fx_reward = $res[0]['fx_reward'];
                }
            }else{
                $fx_reward_ratio = $fenxiaoAmount."%";
                $fx_reward = $totalPrice * $fenxiaoAmount / 100;
            }
            $totalAmount += $fx_reward;
//            $totalAmount  = $totalAmount/$procount;

            // 快递
        }else{
            $sql = $dsql->SetQuery(
                "SELECT p.`id`, p.`fx_reward`, p.`title`, o.`userid`, o.`orderprice`, o.`procount`, s.`uid` storeuid, m.`username` FROM `#@__tuanlist` p
                        LEFT JOIN `#@__tuan_order` o ON o.`proid` = p.`id`
                        LEFT JOIN `#@__tuan_store` s ON s.`id` = p.`sid`
                        LEFT JOIN `#@__member` m ON m.`id` = o.`userid`
                        WHERE o.`ordernum` = '$ordernum'"
            );
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) return;

            $storeuid = $res[0]['storeuid'];
            $username = $res[0]['username'];
            $procount = (int)$res[0]['procount'];
            $totalPrice = 0;//商品总金额
            $totalAmount = 0;//佣金总额

            $totalPrice = $price;
            $fx_reward_ratio = $res[0]['fx_reward'];
            if($res[0]['fx_reward'] == '0'){
                $fx_reward = 0;
            }elseif($res[0]['fx_reward']){
                if(strstr($res[0]['fx_reward'], '%')){
                    $fx_reward = $res[0]['orderprice'] * $res[0]['procount'] * (float)$res[0]['fx_reward'] / 100;
                }else{
                    $fx_reward = $res[0]['fx_reward'] * $res[0]['procount'];
                }
            }else{
                $fx_reward_ratio = $fenxiaoAmount."%";
                $fx_reward = ($totalPrice * $fenxiaoAmount / 100);
            }
            $totalAmount += $fx_reward;

            /*该订单购买数量大于1 拥挤处理*/
//            $totalAmount  = $totalAmount/$procount;
        }

        if($fx_reward > 0){
            $product[] = array(
                'id' => $res[0]['id'],
                'title' => $res[0]['title'],
                'price' => $res[0]['orderprice'],
                'count' => $is_quan ? 1 : $res[0]['procount'],
                'fx_reward_ratio' => $fx_reward_ratio,
                'fx_reward' => $fx_reward,
            );
        }

        $paramarr['totalAmount'] = $totalAmount;
        $paramarr['product']     = $product;
        $paramarr['storeuid']    = $storeuid;
        $paramarr['username']    = $username;
        $paramarr['ordernum']    = $ordernum;
    }

    return $paramarr;
}

//分销金额退款
function tuiFenXiao($ordernum,$module,$urlParam,$tuikuanparam){
    global  $dsql;
    global  $userLogin;

    //查询分销
    $fenxiaomoneysql = $dsql->SetQuery("SELECT `amount`,`uid` FROM `#@__member_fenxiao` WHERE `ordernum` LIKE '%" . $ordernum . "%'  AND `module`= '$module'");
    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
    foreach ($fenxiaomonyeres as $k=>$v){
        $tuiuid    = $v['uid'];                 //退款账号
        $tuiamount = $v['amount'];                 //退款金额
        //扣除商家资金
        $tuisql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $tuiamount WHERE `id` = $tuiuid");
        $dsql->dsqlOper($tuisql, "update");
        $user  = $userLogin->getMemberInfo($tuiuid);
        $usermoney = $user['money'];
        $now          = GetMkTime(time());
        $shoparchives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`balance`) VALUES ('$tuiuid','0' ,'$tuiamount', '分销退款:$ordernum', '$now','','','$module','','tuikuan','$urlParam','$ordernum','$tuikuanparam','分销退款','1','$usermoney')");
        $dsql->dsqlOper($shoparchives, "update");
    }

}


//基础跑腿费
function paotuiServiceMoney($city)
{
    global $dsql;
    global $serviceMoney;
    $archives = $dsql->SetQuery("SELECT  `config`  FROM `#@__site_city` WHERE `cid` = '$city'");
    $sql = $dsql->dsqlOper($archives, "results");
    if (empty($sql[0]['config'])) {
        $fzFee = $serviceMoney;
    } else {
        $arrayCity = unserialize($sql[0]['config']);
        $fzFee = $arrayCity['waimai']['serviceMoney'] ? $arrayCity['waimai']['serviceMoney'] : $serviceMoney;
    }
    return $fzFee;

}

//会员中心发布页默认数据
function fabuJoin(){
    global $dsql;
    global $cfg_secureAccess;
    global $cfg_basehost;
    $detailHandels = new handlers('siteConfig', "siteModule");
    $detailConfig  = $detailHandels->getHandle();
    $arr = array();
    foreach ($detailConfig['info'] as $k=>$v){
        if ($v['code'] == 'article'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu-article",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);
        }elseif ($v['code'] == 'info'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "info",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'tuan'){
            $params = array(
                "service"     => "member",
                "type"        => "fabu",
                "template"    => "tuan",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'tieba'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu-tieba",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'huodong'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu-huodong",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'live'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu",
                "action"    => "live",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>0,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'dating'){
            $params = array(
                "service"     => "dating",
                "template"    => "my",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>0,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'car'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu",
                "action"     => "car",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'circle'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu_circle",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }elseif ($v['code'] == 'sfcar'){
            $params = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "fabu-sfcar",
            );
            $url         = getUrlPath($params);
            $info = array(
                'code' =>$v['code'],
                'name'=>$v['name'],
                'state' =>1,
                'icon'=>$v['icon'],
                'url' =>$url
            );
            array_push($arr,$info);

        }
    }
    $ershouf = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-sale",
    );
    $ershouf         = getUrlPath($ershouf);
    //chuzu
    $chuzu = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-zu",
    );
    $chuzu         = getUrlPath($chuzu);
    //xzl
    $xzl= array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-xzl",
    );
    $xzl         = getUrlPath($xzl);
    //sp
    $sp = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-sp",
    );
    $sp         = getUrlPath($sp);
    //cf
    $cf = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-cf",
    );
    $cf         = getUrlPath($cf);
    //cw
    $cw = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu-house-cw",
    );
    $cw         = getUrlPath($cw);

    $jianli = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "job-resume",
        "param"       => "appFullScreen=1"
    );
    $jianli = getUrlPath($jianli);

    // $zhiwei = array(
    //     "service"     => "member",
    //     "template"    => "post",
    //     "param"       => "do=add"
    // );
    $zhiwei = $cfg_secureAccess.$cfg_basehost.'/supplier/job/add_post.html?appFullScreen';

    $kszhaopin = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu_worker_seek",
        "param"       => "appFullScreen=1"
    );
    $kszhaopin = getUrlPath($kszhaopin);

    $ksqiuzhi = array(
        "service"     => "member",
        "type"        => "user",
        "template"    => "fabu_post_seek",
        "param"       => "appFullScreen=1"
    );
    $ksqiuzhi = getUrlPath($ksqiuzhi);
    
    $job = array([
        'state' => 1,
        'name' => getModuleTitle(array('name' => 'house')) ,
        'color' =>'#316BFF',
        'column' =>'5',
        'code' =>'house',
        'content' =>array([
            'name' =>'二手房',
            'url' =>$ershouf,
            'code' =>'sale',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon1.png',
            'state' =>1,
        ],array(
            'name' =>'出租房',
            'url' =>$chuzu,
            'code' =>'zu',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon2.png',
            'state' =>1,
        ),array(
            'name' =>'写字楼',
            'url' =>$xzl,
            'code' =>'xzl',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon3.png',
            'state' =>1,
        ),array(
            'name' =>'商铺',
            'url' =>$sp,
            'code' =>'sp',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon4.png',
            'state' =>1,
        ),array(
            'name' =>'厂房仓库',
            'url' =>$cf,
            'code' =>'cf',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon5.png',
            'state' =>1,
        ),array(
            'name' =>'车位',
            'url' =>$cw,
            'code' =>'cw',
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/f_icon6.png',
            'state' =>0,
        ))
    ],array(
        'state' => 1,
        'name' => getModuleTitle(array('name' => 'job')),
        'color' =>'#00C490',
        'column' =>'4',
        'code' =>'job',
        'content' =>array([
            'name' =>'简历',
            'url' =>$jianli,
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/j_icon1.png',
            'state' =>1,
            'code' =>'resume',
        ],array(
            'name' =>'职位',
            'url' =>$zhiwei,
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/j_icon4.png',
            'state' =>1,
            'code' =>'post',
        ),array(
            'name' =>'快速招聘',
            'url' =>$kszhaopin,
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/j_icon2.png',
            'state' =>1,
            'code' =>'sentence',
        ),array(
            'name' =>'快速求职',
            'url' =>$ksqiuzhi,
            'icon' =>$cfg_secureAccess.$cfg_basehost.'/templates/member/touch/images/fabuJoin_touch_popup_3.4/j_icon3.png',
            'state' =>1,
            'code' =>'sentencel',
        ))
    ));
    $infoarr = array();
    $title  = array(
        'state'=>1,
        'title'=>'快捷发布'
    );
    $infoarr['config'] = $arr;
    $infoarr['children'] = $job;
    $infoarr['title'] = $title;
    return $infoarr;

}

//个人会员移动端首页模板自定义
function userCenterDiy(){
    global $cfg_basedomain;
    global $userDomain;
    global $busiDomain;
    $defaultTemplate = '{"memberComp":{"theme":1,"themeType":"dark","bgType":"image","style":{"bg_color":"#ffffff","initBg_color":"#ffffff","bg_image":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/bg_01.png"},"business":{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/icon01.png","link":"'.$busiDomain.'","text":"商家版"},"branch":{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/icon01.png","link":"'.$userDomain.'/workPlatform.html","text":"工作台"},"setBtns":{"btnType":2,"btns":[{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/icon02.png","link":"'.$userDomain.'/setting.html","text":"","edit":0}]},"qiandaoBtn":{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/icon03.png","link":"'.$userDomain.'/qiandao.html","text":"签到","style":{"color":"#192233","init_color":"#192233","opciaty":"100","background":"#ffffff","init_background":"#ffffff"}},"vipCard":{"theme":1,"title":"会员","titleStyle":{"arrColor":"#f00","color":"#ffffff","initColor":"#ffffff"},"subtitle":[{"type":1,"text":"会员有效期"}],"subStyle":{"color":"#EDF2FA","initColor":"#EDF2FA"},"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/vip_icon01.png","style":{"bgType":"color","background":"linear-gradient(90deg, #33364D 0%, #3A3D57 100%)","backimg":"","initBackground":"linear-gradient(90deg, #33364D 0%, #3A3D57 100%)"},"btnText":"立即开通","btnLink":"'.$userDomain.'/upgrade.html","btnStyle":{"styleType":"radius","style":{"arrColor":"#ff0000","color":"#ffffff","initColor":"#ffffff","background":"#FE3535","initBackground":"#FE3535","borderRadius":"13"}}},"vipBtnsGroup":[{"link":"","icon":"","text":"我的发布"},{"link":"","icon":"","text":"我的收藏"},{"link":"","icon":"","text":"历史记录"},{"link":"","icon":"","text":"我的订阅"}],"numberCount":{"showItems":[1,2,3,4],"numberStyle":{"color":"#FF3419","init_color":"#FF3419"},"titleStyle":{"color":"#45474D","init_color":"#45474D"},"style":{"background":"#ffffff","init_background":"#ffffff","opacity":"70","borderColor":"#ffffff","init_borderColor":"#ffffff","borderSize":"2"},"splitLine":0},"financeCount":{"showItems":[1,2,3],"numberStyle":{"color":"#F0DEBD","init_color":"#F0DEBD"},"titleStyle":{"color":"#ffffff","init_color":"#ffffff"},"style":{"background":"#262738","init_background":"#262738"}},"cardStyle":{"borderRadius":12,"marginLeft":15,"marginTop":10}},"compArrs":[{"id":2,"typename":"order","content":{"popid":"","title":{"text":"我的订单","show":1,"style":{"color":"#070F21","initColor":"#070F21"}},"more":{"text":"查看更多","arr":0,"showType":0,"link":"'.$userDomain.'/order.html","style":{"color":"#AFB4BE","initColor":"#AFB4BE"}},"btnStyle":{"color":"#45474C","initColor":"#45474C"},"tipNumStyle":{"background":"#FF3419","initBackground":"#FF3419"},"showItems":[1,2,3,4,5],"orderOption":[{"id":1,"text":"待付款","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_01.png?v=1","link":"'.$userDomain.'/order.html?state=1","btnText":"待付款","code":"daifukuan"},{"id":2,"text":"待使用","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_02.png?v=1","link":"'.$userDomain.'/order.html?state=2","btnText":"待使用","code":"daixiaofei"},{"id":3,"text":"待发货","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_03.png?v=1","link":"'.$userDomain.'/order.html?state=3","btnText":"待发货","code":"daifahuo"},{"id":4,"text":"待收货","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_04.png?v=1","link":"'.$userDomain.'/order.html?state=4","btnText":"待收货","code":"daishouhuo"},{"id":5,"text":"待评价","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_05.png?v=1","link":"'.$userDomain.'/order.html?state=5","btnText":"待评价","code":"daipingjia"},{"id":6,"text":"待分享","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_06.png?v=1","link":"'.$userDomain.'/order.html?state=6","btnText":"待分享","code":"daifenxiang"},{"id":7,"text":"退款售后","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_07.png?v=1","link":"'.$userDomain.'/order.html?state=7","btnText":"退款售后","code":"tuikuanshouhou"},{"id":8,"text":"全部","icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/order_08.png?v=1","link":"'.$userDomain.'/order.html","btnText":"全部","code":"all"}],"showNumItems":[1,2,3],"style":{"borderRadius":12,"marginTop":11,"marginLeft":15}}},{"id":7,"typename":"adv","content":{"column":2,"list":[{"image":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/invite.png","link":"'.$userDomain.'/invite.html"},{"image":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/upgrade.png","link":"'.$userDomain.'/upgrade.html"}],"style":{"marginTop":11,"marginLeft":15,"borderRadius":12,"height":"120"}}},{"id":4,"typename":"icons","content":{"qiandao":{"show":1,"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png","style":{"color":"#FFAA21","background":"#FFF8ED"}},"title":{"text":"常用功能","show":1,"style":{"color":"#070F21"}},"btns":{"list":[{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_01.png","text":"我的发布","link":"'.$userDomain.'/manage"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_02.png","text":"购物卡","link":"'.$userDomain.'/consume.html"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_03.png","text":"合伙人","link":"'.$userDomain.'/fenxiao.html"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_04.png","text":"打赏收益","link":"'.$userDomain.'/reward.html"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_05.png","text":"待兑券码","link":"'.$userDomain.'/quan.html"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_06.png","link":"'.$userDomain.'/address.html","text":"收货地址"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_07.png","link":"'.$userDomain.'/security.html","text":"安全中心"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_08.png","link":"tel:0512-67581578","text":"官方客服"},{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/icons_09.png","link":"'.$cfg_basedomain.'/mobile.html","text":"下载App"}],"style":{"color":"#45474C"}},"more":{"text":"查看更多","arr":1,"show":0,"link":"","style":{"color":"#AFB4BE","initColor":"#AFB4BE"}},"style":{"borderRadius":12,"marginTop":11,"marginLeft":15,"bg_color":"#ffffff","initBg_color":"#ffffff","bg_image":""}}},{"id":6,"sid":1,"typename":"wechat","content":{"sid":1,"custom":0,"iconShow":1,"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/wx_icon01.png","title":"点击关注公众号有礼","titleStyle":{"color":"#070F21"},"subtitle":"随时掌握订单动态、优惠活动","subtitleStyle":{"color":"#AFB4BE"},"btnStyle":{"color":"#0ECF4E"},"style":{"marginLeft":15,"marginTop":11,"borderRadius":12,"height":60},"image":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/defaultImg/qiandao_icon.png"}}],"pageSet":{"showType":0,"layout":0,"title":"","style":{"background":"#ffffff","init_background":"#ffffff","color":"#070F21","init_color":"#070F21","borderRadius":12,"marginTop":11,"marginLeft":15},"btns":{"showType":0,"themeType":"dark","list":[{"icon":"'.$cfg_basedomain.'/static/images/admin/siteMemberPage/icon02.png","link":"'.$userDomain.'/setting.html","text":"","edit":0}],"style":{"color":"","init_color":""}},"infoData":["point","money","quan","collect","qiandao"],"orderData":["daifukuan","daixiaofei","daifahuo"]}}';
    return json_decode($defaultTemplate, true);
}


// 生成隐私号码
function createPrivatenumber($data){

    global $dsql;

    include HUONIAOINC . "/config/privatenumberConfig.inc.php";
    //$huawei_privatenumber_state;  //隐私号码开关
    //$huawei_privatenumber_duration;  //绑定关系保持时间，单位为秒，0表示永不过期
    //$huawei_privatenumber_maxDuration;   //设置允许单次通话进行的最长时间，单位为分钟。通话时间从接通被叫的时刻开始计算
    //$huawei_privatenumber_sound;  //通话前等待音
    //$huawei_privatenumber_areaCode;  //指定城市码，0不指定，1是指定
    //$huawei_privatenumber_burden;  //负载规则，0显示真实号码，1解除先添加的绑定给新的申请使用
    //$huawei_privatenumber_limit_time;  //限制时间，单位为分钟，规定时间内可以绑定的次数
    //$huawei_privatenumber_limit_count;  //限制次数，规定时间内可以绑定的次数
    
    global $cfg_privatenumberModule;  //隐私保护通话模块开关

    $service = $data['service'];  //所属模块
    $title = $data['title'];  //信息标题（方便后台查看哪条信息发起的绑定）
    $url = $data['url'];  //信息链接
    $uidA = (int)$data['uidA'];  //发起人用户ID，一般指当前登录用户
    $numberA = $data['numberA'];  //发起人号码
    $uidB = (int)$data['uidB'];  //被叫人用户ID
    $numberB = $data['numberB'];  //被叫人号码
    $expire = $data['expire'] ? $data['expire'] : ($huawei_privatenumber_duration > 0 ? $huawei_privatenumber_duration : 0); //如果指定了过期时间，则使用指定的过期时间，否则使用默认的过期时间

    //如果发起人的号码和被叫人的号码一样，说明是一个人，直接返回真实号码
    if(($numberA == $numberB) || ($uidA == $uidB)){
        return array('from' => $numberA, 'number' => $numberB, 'type' => 0, 'expire' => 0);  //type为0表示是是真实号码
    }

    //如果没有开启，直接返回真实号码
    $ccPrivatenumberModule = $cfg_privatenumberModule;
    $ccPrivatenumberModule = $ccPrivatenumberModule ? is_string($ccPrivatenumberModule) ? explode(",",$ccPrivatenumberModule) : $ccPrivatenumberModule : array();
    if(!$huawei_privatenumber_state || !in_array($service, $ccPrivatenumberModule)){
        return array('from' => $numberA, 'number' => $numberB, 'type' => 0, 'expire' => 0);  //type为0表示是是真实号码
    }

    //如果有多个号码，取第一个
    if(strstr($numberB, ',')){
        $numberArr = explode(',', $numberB);
        $numberB = $numberArr[0];
    }

    //如果不是正确的手机号码，直接 返回真实号码
    if(!preg_match("/^1[2345789]\d{9}$/", $numberB)){
        return array('from' => $numberA, 'number' => $numberB, 'type' => 0, 'expire' => 0);  //type为0表示是是真实号码
    }

    //获取城市分站自定义配置信息
    $areaCode = '';
    if($huawei_privatenumber_areaCode && $data['cityid']){
        $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $data['cityid']);
        $ret = $dsql->dsqlOper($sql, "results");
        if(is_array($ret)){
            $advancedConfig = $ret[0]['config'] ? $ret[0]['config'] : '';
            $advancedConfigArr = $advancedConfig ? unserialize($advancedConfig) : array();
            if($advancedConfigArr){
                $areaCode = $advancedConfigArr['siteConfig']['areaCode'];
            }
        }
    }

    $time = time();

    //先更新所有已经过期的绑定记录的解绑时间
    $sql = $dsql->SetQuery("UPDATE `#@__site_privatenumber_bind` SET `time2` = `expire` WHERE `expire` < $time AND `expire` != 0 AND `time2` = 0");
    $dsql->dsqlOper($sql, "update");

    //查询是否绑定过，并且未过期
    $sql = $dsql->SetQuery("SELECT `id`, `number`, `expire`, `subscriptionId` FROM `#@__site_privatenumber_bind` WHERE (`numberA` = '$numberA' OR `numberA` = '$numberB') AND (`numberB` = '$numberA' OR `numberB` = '$numberB') AND (`expire` > $time OR `expire` = 0) AND `time2` = 0");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        //如果之前绑定过的记录超时时间大于30秒，这里直接返回之前的记录，节约资源
        if($ret[0]['expire'] - $time > 30){
            //如果有未过期的虚拟号码，直接返回
            $numberA = substr($numberA, 0, 3) . '****' . substr($numberA, -4);
            return array('from' => $numberA, 'number' => $ret[0]['number'], 'type' => 1, 'expire' => $ret[0]['expire'], 'expire_second' => $ret[0]['expire'] - $time);  //type为1表示是虚拟号码
        }else{

            //直接直接返回未过期的号码，有效期会有问题，这里优化为解除绑定后，重新绑定
            unbindPrivateNumber($ret[0]['subscriptionId'], $ret[0]['id']);
        }
    }

    //查询是否满足限制条件，x分钟x次，
    $limit_time = (int)$huawei_privatenumber_limit_time;
    $limit_count = (int)$huawei_privatenumber_limit_count;
    if($limit_time && $limit_count){
        $time1 = time() - ($limit_time * 60);
        $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_privatenumber_bind` WHERE `numberA` = '$numberA' AND `time1` > $time1");
        $ret = $dsql->dsqlOper($sql, "results");
        $totalCount = $ret[0]['totalCount'];
        if($totalCount >= $limit_count){
            return array('state' => 200, 'info' => '获取电话号码次数已达上限，请稍后再试！');
        }
    }

    //分配号码
    //查询号码库
    $number = '';  //分配的号码
    $where = '';
    if($areaCode){
        $where .= " AND l.`cityCode` = '$areaCode'";
    }
    $sql = $dsql->SetQuery("SELECT l.`number`, (SELECT count(*) FROM `#@__site_privatenumber_bind` WHERE `number` = l.`number` AND `time2` = 0) bindCount FROM `#@__site_privatenumber_list` l WHERE l.`state` = 1" . $where . " ORDER BY l.`id` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){

            //1个X号码允许绑定5000对用户号码
            if($val['bindCount'] < 5000){

                $_number = $val['number'];

                //查询是否已经绑定并且正在使用还未过期
                $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_privatenumber_bind` WHERE `number` = '$_number' AND (`numberA` = '$numberA' OR `numberA` = '$numberB' OR `numberB` = '$numberA' OR `numberB` = '$numberB') AND `expire` > $time AND `expire` != 0 AND `time2` = 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret[0]['totalCount'] == 0){
                    $number = $_number;
                    break;
                }

            }

        }
    }

    //如果到达负载状态，没有可用号码
    if($number == ''){
        $burden = (int)$huawei_privatenumber_burden;

        //输出真实号码
        if(!$burden){
            return array('from' => $numberA, 'number' => $numberB, 'type' => 0, 'expire' => 0);  //type为0表示是是真实号码
        
        //解除先添加的绑定给新的申请使用
        }else{

            //查询所有没有过期的绑定记录，并且过期时间不是长期有效的
            $where = '';
            if($areaCode){
                $where .= " AND l.`cityCode` = '$areaCode'";
            }
            $sql = $dsql->SetQuery("SELECT b.`id`, b.`subscriptionId`, b.`number` FROM `#@__site_privatenumber_bind` b LEFT JOIN `#@__site_privatenumber_list` l ON l.`number` = b.`number` WHERE l.`state` = 1 AND b.`expire` != 0 AND b.`time2` = 0 ".$where." ORDER BY b.`id` ASC LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $bid = $ret[0]['id'];
                $subscriptionId = $ret[0]['subscriptionId'];
                $number = $ret[0]['number'];

                //解除绑定
                $ret = unbindPrivateNumber($subscriptionId, $bid);

                //如果解绑失败，直接返回
                if($ret['state'] == 200){
                    return $ret;
                }

            }

        }
    }
    
    //如果到这里还是没有可用号码，说明系统的负载规则为1，但是所有号码均处于长期有效状态（比如外卖，号码必须在配送结束后才可以解绑），需要增加号码库数量
    if($number == ''){
        return array('state' => 200, 'info' => '号码获取失败，请稍后再试！\r\n错误信息：没有可用号码');
    }

    //添加绑定关系
    $data = json_encode([
        'relationNum' => '+86'.$number,
        'areaCode' => $areaCode,
        'callerNum' => '+86'.$numberA,
        'calleeNum' => '+86'.$numberB,
        'callDirection' => 0,  //允许双向呼叫
        'duration' => $expire,
        'maxDuration' => $huawei_privatenumber_maxDuration,
        'preVoice' => [
            'callerHintTone' => $huawei_privatenumber_sound,
            'calleeHintTone' => $huawei_privatenumber_sound
        ]
    ]);

    //引入类库
    $huaweiPrivatenumber = new huaweiPrivatenumber();
    $ret = $huaweiPrivatenumber->execute('https://rtcpns.cn-north-1.myhuaweicloud.com/rest/caas/relationnumber/partners/v1.0', $data, 'POST');
    if($ret['resultcode'] == 0){
    
        $subscriptionId = $ret['subscriptionId'];
        $time1 = time();
        $_expire = $expire ? $time1 + $expire : 0;
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_privatenumber_bind` (`number`, `subscriptionId`, `service`, `title`, `url`, `uidA`, `numberA`, `uidB`, `numberB`, `expire`, `time1`) VALUES ('$number', '$subscriptionId', '$service', '$title', '$url', '$uidA', '$numberA', '$uidB', '$numberB', '$_expire', '$time1')");
        $dsql->dsqlOper($sql, "update");

        $numberA = substr($numberA, 0, 3) . '****' . substr($numberA, -4);

        return array('from' => $numberA, 'number' => $number, 'type' => 1, 'expire' => $_expire, 'expire_second' => $expire);  //type为1表示是虚拟号码

    }else{
        return array('state' => 200, 'info' => $ret['resultcode'] . '_' . $ret['resultdesc']);
    }
}

//解绑隐私号码
function unbindPrivateNumber($subscriptionId, $bid = 0){

    global $dsql;

    //解除绑定
    $data = http_build_query([
        'subscriptionId' => $subscriptionId
    ]);

    $id = $bid;

    //根据subscriptionId获取绑定ID
    if(!$bid){
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_privatenumber_bind` WHERE `subscriptionId` = '$subscriptionId'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = $ret[0]['id'];
        }else{
            return array('state' => 200, 'info' => '绑定信息查询失败');
        }
    }

    //引入类库
    $huaweiPrivatenumber = new huaweiPrivatenumber();
    $ret = $huaweiPrivatenumber->execute('https://rtcpns.cn-north-1.myhuaweicloud.com/rest/caas/relationnumber/partners/v1.0?' . $data, '', 'DELETE');

    if($ret['resultcode'] == 0){
        $time = time();
        $sql = $dsql->SetQuery("UPDATE `#@__site_privatenumber_bind` SET `time2` = $time WHERE `id` = $id");
        $dsql->dsqlOper($sql, "update");
        return array('state' => 100, 'info' => '解绑成功');
    }else{
        if($bid){
            return array('state' => 200, 'info' => '号码获取失败，请稍后再试！\r\n错误信息：解除绑定_' . $ret['resultcode'] . '_' . $ret['resultdesc']);
        }else{
            return array('state' => 200, 'info' => '解绑失败\r\n错误信息：' . $ret['resultcode'] . '_' . $ret['resultdesc']);
        }
    }

}

/**
 * 识别身份证正面
 */
function getIdentCardPositive($turl){
    global $cfg_juhe;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $host = "https://zid.market.alicloudapi.com";
    $path ="/thirdnode/ImageAI/idcardfrontrecongnition";
    $method = "POST";
    $appcode = $cfg_juhe['aliyun'];
    $headers = array();
    array_push($headers, "Authorization:APPCODE " . $appcode);
    //根据API的要求，定义相对应的Content-Type
    array_push($headers, "Content-Type".":"."application/x-www-form-urlencoded; charset=UTF-8");
    $querys = "";
    $bodys = "base64Str=$turl";
    $url = $host . $path;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_FAILONERROR, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, true);
    if (1 == strpos("$".$host, "https://"))
    {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    curl_setopt($curl, CURLOPT_POSTFIELDS, $bodys);
    $con = curl_exec($curl);
    $result=strstr($con,"{");
    curl_close($curl);
    return json_decode($result,true);
}

/**
 * 识别身份证反面
 */
function getIdentCardContrary($turl){
    global $cfg_juhe;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $host = "https://zid.market.alicloudapi.com";
    $path ="/thirdnode/ImageAI/idcardbackrecongnition";
    $method = "POST";
    $appcode = $cfg_juhe['aliyun'];
    $headers = array();
    array_push($headers, "Authorization:APPCODE " . $appcode);
    //根据API的要求，定义相对应的Content-Type
    array_push($headers, "Content-Type".":"."application/x-www-form-urlencoded; charset=UTF-8");
    $querys = "";
    $bodys = "base64Str=$turl";
    $url = $host . $path;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_FAILONERROR, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, true);
    if (1 == strpos("$".$host, "https://"))
    {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    curl_setopt($curl, CURLOPT_POSTFIELDS, $bodys);
    $con = curl_exec($curl);
    $result=strstr($con,"{");
    curl_close($curl);
    return json_decode($result,true);
}
/*
 * 验证身份证号以及姓名
 */
function  getIdCheck($cardNo,$realName){
    global $cfg_juhe;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $host = "https://zid.market.alicloudapi.com";
    $path ="/idcheck/Post";
    $method = "POST";
    $appcode = $cfg_juhe['aliyun'];
    $headers = array();
    array_push($headers, "Authorization:APPCODE " . $appcode);
    //根据API的要求，定义相对应的Content-Type
    array_push($headers, "Content-Type".":"."application/x-www-form-urlencoded; charset=UTF-8");
    $querys = "";
    $bodys = "cardNo=$cardNo&realName=$realName";;
    $url = $host . $path;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_FAILONERROR, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, true);
    if (1 == strpos("$".$host, "https://"))
    {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    curl_setopt($curl, CURLOPT_POSTFIELDS, $bodys);
    $con = curl_exec($curl);
    $result=strstr($con,"{");
    curl_close($curl);
    return json_decode($result,true);
}

/**
 * 识别营业执照
 */
function getLicenseCardInfo($turl){
    global $cfg_juhe;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $host = "https://cardnotwo.market.alicloudapi.com";
    $path ="/ocr";
    $method = "POST";
    $appcode = $cfg_juhe['aliyun'];
    $headers = array();
    array_push($headers, "Authorization:APPCODE " . $appcode);
    //根据API的要求，定义相对应的Content-Type
    array_push($headers, "Content-Type".":"."application/x-www-form-urlencoded; charset=UTF-8");
    $querys = "";
    $bodys = "image=$turl";
    $url = $host . $path;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_FAILONERROR, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, true);
    if (1 == strpos("$".$host, "https://"))
    {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    curl_setopt($curl, CURLOPT_POSTFIELDS, $bodys);
    $con = curl_exec($curl);
    $result=strstr($con,"{");
    curl_close($curl);
    return json_decode($result,true);
}


/**
 * 验证中国大陆居民身份证号码合法性
 * @param string $idCard 身份证号码
 * @return bool 验证结果
 */
function validateIdCard(string $idCard): bool
{
    // 去除首尾空格
    $idCard = trim($idCard);
    $idCardLength = strlen($idCard);

    // 1. 正则验证格式
    // 18位身份证正则：6位地址码 + 8位出生日期(19/20开头) + 3位顺序码 + 1位校验码(X/x)
    $reg18 = '/^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[\dXx]$/';
    // 15位旧身份证正则：6位地址码 + 6位出生日期 + 3位顺序码
    $reg15 = '/^[1-9]\d{5}\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}$/';

    // 格式不匹配直接返回false
    if ($idCardLength === 18 && !preg_match($reg18, $idCard)) {
        return false;
    } elseif ($idCardLength === 15 && !preg_match($reg15, $idCard)) {
        return false;
    } elseif ($idCardLength !== 18 && $idCardLength !== 15) {
        return false;
    }

    // 2. 18位身份证校验码验证（核心）
    if ($idCardLength === 18) {
        // 国家标准加权因子
        $weightFactors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        // 校验码对应值（索引0-10）
        $checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
        
        $sum = 0;
        // 计算前17位加权和
        for ($i = 0; $i < 17; $i++) {
            // 确保每一位都是数字
            if (!is_numeric($idCard[$i])) {
                return false;
            }
            $sum += intval($idCard[$i]) * $weightFactors[$i];
        }
        
        // 计算校验码索引
        $checkCodeIndex = $sum % 11;
        $expectedCheckCode = $checkCodes[$checkCodeIndex];
        // 统一转为大写，兼容x/X
        $actualCheckCode = strtoupper(substr($idCard, 17, 1));
        
        // 校验码不一致则返回false
        if ($actualCheckCode !== $expectedCheckCode) {
            return false;
        }
    }

    // 所有验证通过
    return true;
}


/** 规范生成 es_id
 * 应该存在 service, id, 如果有二级目录应该存在 second
 * 如果只有一级分类，如 article_15
 * 如果有二级分类，如 house_loupan_33
 * 更准确的说，es_id是一个sql的"表名_ID"唯一识别的
 * （注：如果传递 _name，则可以缺少ID）
 */
function buildEsId($relation){
    $service = $relation['service'];
    $aid = $relation['id'];
    $second = $relation['second'];
    $_name = $relation['_name']; // 只拼接名称，无需ID
    $es_id = $service;  // 默认名称
    if(empty($service)){
        return false;   // 缺少模块信息
    }
    if(!empty($second)){ // 可选二级
        $es_id .= "_".$second;
    }
    if(empty($_name) && empty($aid)){
        return false;  // 需要ID，但缺少信息ID
    }elseif(empty($_name)){  // 并非拼接名称
        $es_id .= "_".$aid;
    }
    return $es_id;  // 如果return false，则说明参数错误
}

/** 同步一条或多条信息到其他缓存中，如同步到ES中(增加、删除、修改自动识别，应该先修改sql状态，再执行此步骤，也就是确保sql已执行，再调用本方法）
 * @param $service 模块名
 * @param $id 数据表中的ID
 * @param string $second 子模块名
 *
 * 注：模块名和子模块名，是固定的，目前注册在 es.class.php 中的 getRegisterModule 方法注册或取得所有已注册模块
 */

function dataAsync($service,$id,$second="",$sync=0){

    //是否同步，通过计划任务update_notice.php触发
    if($sync){

        // 校验是否打开了ES
        global $esConfig;
        if(!$esConfig['open']){
            return "服务未开启";
        }
        require_once(HUONIAOROOT . "/include/class/es.class.php");
        $es = new es();
        // 检测ES状态
        if(empty($es) || !$es->isOk()){
            return false;
        }
        // 校验$id
        if(empty($id)){
            return false;
        }
        // 如果不是数组，统一改为数组
        if(!is_array($id)){
            $id = array_unique(explode(",", "$id"));
        }
        // 本次操作结果状态码（0.失败，2.已更新，1.删除）
        $res = 0;  // 失败
        // 先尝试新增或修改，（如果不符合数据条件，则不会增加）
        $up2 = $es->asyncIds($service,$id,$second);
        if($up2){
            $res = 2; // 已更新到ES中（新增或更新）
        }else{  // 说明不符合新增、修改条件，该数据不合法，需要在es中也删除（直接批量删除）。
            $es_ids = array();
            foreach ($id as $k => $v){
                $es_id_i = buildEsId(['service'=>$service,'id'=>$v,'second'=>$second]);
                array_push($es_ids,$es_id_i);
            }
            $up2 = $es->delIds($es_ids);
            if($up2){
                $res = 1;  // 已删除。
            }
        }

        return $res;
    }

    //先把要同步的数据放入队列
    else{

        global $dsql;
        $pubdate = GetMkTime(time());
        $id = (int)$id;
        $sql = $dsql->SetQuery("INSERT INTO `#@__site_es_queue` (`service`, `aid`, `second`, `pubdate`) VALUES ('$service', '$id', '$second', '$pubdate')");
        $ret = $dsql->dsqlOper($sql, "update");
        return $ret;

    }
}

/**
 * 从html字符串，生成pdf文件（需要exec函数，以及环境中存在wkhtmltopdf）
 * @param string $htmlStr 要转换为pdf的html字符串
 * @param string $saveDir 生成文件的存储目录
 * @param string $model 模块名
 */
function strToPdf($htmlStr,$saveDir="",$model = 'job')
{
    global $cfg_uploadDir;
    //存储目录
    $saveDir = $saveDir ?: HUONIAOROOT.$cfg_uploadDir."/".$model."/pdf/".date("Y")."/".date('m');
    if(!is_dir($saveDir)){
        mkdir($saveDir,0777,true);
    }
    //随机生成名称
    $rand_str = md5(create_ordernum());
    //生成html
    $htmlFilename = $rand_str.".html";
    $htmlFilePath = "{$saveDir}/{$htmlFilename}";
    file_put_contents($htmlFilePath,$htmlStr);
    //wkhtmltopdf将生成的html文件转为相应的pdf
    $pdfFilename = $rand_str.".pdf";
    $pdfFilePath = "{$saveDir}/{$pdfFilename}";
    exec("wkhtmltopdf -B 0 -L 0 -R 0 -T 0 --enable-local-file-access $htmlFilePath $pdfFilePath");  // -B -T设置边距问题
    //删除生成的临时html文件
    unlinkFile($htmlFilePath);
    //返回pdf文件的名称、所在目录，文件的绝对路径等
    return array("name"=>$pdfFilename,"dir"=>$saveDir,"path"=>$pdfFilePath);
}


/**
 * 订单推送到抖音小程序
 */
function pushOrderToDouyin($uid, $order_detail, $order_status){

    //服务端access_token
    include_once(HUONIAOROOT."/include/class/douyinSDK.class.php");
    $douyinSDK = new douyinSDK();
    $ret = $douyinSDK->pushOrder($uid, json_encode($order_detail, JSON_UNESCAPED_UNICODE), $order_status);
    
}


/**
 * 获取IP属地
 * @param string $ipaddr 根据IP获取到的地址完整信息，如：未知、本地局域网、内网IP内网IP 内网IP、江苏 苏州 电信、河南省郑州市 联通、新疆维吾尔自治区巴音郭楞蒙古自治州 移动、宁夏回族自治区固原市 电信
 */
function getIpHome($ipaddr){
    global $cfg_iphome;
    $iphome = (int)$cfg_iphome;  //0不显示  1显示省份  2显示城市  3显示省份城市
    if(!$iphome) return '';

    if($ipaddr){

        //清理网络信息
        $ipaddr = trim(str_replace(array(
            '未知', '本地局域网', '内网IP', '电信', '移动', '联通', '鹏博士', '鹏博士宽带', '长城宽带', '华数传媒', '移动/基站WiFi', '阿里云', '东方有线', '腾讯云', '联通漕河泾数据中心', '有线宽带', '电信数据上网公共出口', '移动数据上网公共出口', '广电', '方正宽带', '歌华', '皓宽网络', '科技网', 'BGP多线', '世纪互联', '华为云', '铁通', '联通/基站WiFi',
        ), '', $ipaddr));

        //清理省份、城市数据
        $ipaddr = trim(str_replace(array(
            '回族自治区', '壮族自治区', '维吾尔自治区', '自治区',
            '朝鲜族自治州', '土家族苗族自治州', '土家族苗族自治州', '藏族羌族自治州', '蒙古族藏族自治州', '藏族自治州', '哈尼族彝族自治州', '彝族自治州', '南苗族侗族自治州', '布依族苗族自治州', '南布依族苗族自治州', '壮族苗族自治州', '傣族自治州', '白族自治州', '傣族景颇族自治州', '傈僳族自治州', '回族自治州', '哈萨克自治州', '蒙古自治州', '自治州',
            '省', '市'
        ), ' ', $ipaddr));
        
        //分隔数据
        $ipaddrArr = explode(' ', $ipaddr);
        if($ipaddrArr){
            $ipaddrArr = array_filter($ipaddrArr);  //清除掉空数据
        }

        //提取数据
        $province = $city = '';
        if($ipaddrArr){
            $province = $ipaddrArr[0] ?: '';
            $city = $ipaddrArr[1] ?: '';
        }
        
        //省份城市
        if($iphome == 3){
            return $province . ($city == $province ? '' : $city);  //城市和省份一样时，不需要输出
        }
        //城市
        elseif($iphome == 2){
            return $city ?: $province;  //城市信息不存在时，使用省份信息
        }
        //省份
        elseif($iphome == 1){
            return $province;
        }
    }
    return '';
}

/**
 * 给str转换特殊字符
 * {#$char|parseStrSpecialChar#}
 *
*/
function parseStrSpecialChar($str){
    $str = str_replace("<","&lt;",$str);
    $str = str_replace(">","&gt;",$str);
    $str = str_replace('"',"&quot;",$str);
    $str = str_replace("'","&#x27;",$str);
    $str = str_replace("`","&#x60;",$str);
    return $str;
}

/**
 * 从html字符串，生成img文件（需要exec函数，以及环境中存在wkhtmltopdf【带wkhtmltoimage】）
 * @param string $htmlStr 要转换为img的html字符串
 * @param string $saveDir 生成文件的存储目录
 * @param string $model 模块名
 */
function strToImg($htmlStr,$saveDir="",$model = 'job'){
    global $cfg_ftpUrl;
    global $cfg_fileUrl;
    global $cfg_uploadDir;
    global $cfg_ftpType;
    global $cfg_ftpState;
    global $cfg_ftpDir;
    global $cfg_quality;
    global $cfg_softSize;
    global $cfg_softType;
    global $cfg_editorSize;
    global $cfg_editorType;
    global $cfg_videoSize;
    global $cfg_videoType;
    global $cfg_meditorPicWidth;
    global $cfg_ftpSSL;
    global $cfg_ftpPasv;
    global $cfg_ftpServer;
    global $cfg_ftpPort;
    global $cfg_ftpUser;
    global $cfg_ftpPwd;
    global $cfg_ftpTimeout;
    global $cfg_OSSUrl;
    global $cfg_OSSBucket;
    global $cfg_EndPoint;
    global $cfg_OSSKeyID;
    global $cfg_OSSKeySecret;
    global $cfg_QINIUAccessKey;
    global $cfg_QINIUSecretKey;
    global $cfg_QINIUbucket;
    global $cfg_QINIUdomain;
    global $cfg_OBSUrl;
    global $cfg_OBSBucket;
    global $cfg_OBSEndpoint;
    global $cfg_OBSKeyID;
    global $cfg_OBSKeySecret;
    global $cfg_COSUrl;
    global $cfg_COSBucket;
    global $cfg_COSRegion;
    global $cfg_COSSecretid;
    global $cfg_COSSecretkey;

    global $editorMarkState;
    global $editor_ftpType;
    global $editor_ftpState;
    global $customUpload;
    global $custom_uploadDir;
    global $customFtp;
    global $custom_ftpType;
    global $custom_ftpState;
    global $custom_ftpDir;
    global $custom_ftpServer;
    global $custom_ftpPort;
    global $custom_ftpUser;
    global $custom_ftpPwd;
    global $custom_ftpDir;
    global $custom_ftpUrl;
    global $custom_ftpTimeout;
    global $custom_ftpSSL;
    global $custom_ftpPasv;
    global $custom_OSSUrl;
    global $custom_OSSBucket;
    global $custom_EndPoint;
    global $custom_OSSKeyID;
    global $custom_OSSKeySecret;
    global $custom_QINIUAccessKey;
    global $custom_QINIUSecretKey;
    global $custom_QINIUbucket;
    global $custom_QINIUdomain;
    global $editor_ftpDir;
    global $custom_OBSUrl;
    global $custom_OBSBucket;
    global $custom_OBSEndpoint;
    global $custom_OBSKeyID;
    global $custom_OBSKeySecret;
    global $custom_COSUrl;
    global $custom_COSBucket;
    global $custom_COSRegion;
    global $custom_COSSecretid;
    global $custom_COSSecretkey;
    global $editor_uploadDir;

    // $cfg_softType = $cfg_softType ? explode("|", $cfg_softType) : array();
    // $cfg_editorType = $cfg_editorType ? explode("|", $cfg_editorType) : array();
    // $cfg_videoType = $cfg_videoType ? explode("|", $cfg_videoType) : array();

    $editor_uploadDir = $cfg_uploadDir;
    // $cfg_uploadDir = "/" . $path . $cfg_uploadDir;
    $editor_ftpType = $cfg_ftpType;

    $custom_ftpState = $editor_ftpState = $cfg_ftpState;
    $custom_ftpType = $cfg_ftpType;
    $custom_ftpSSL = $cfg_ftpSSL;
    $custom_ftpPasv = $cfg_ftpPasv;
    $custom_ftpUrl = $cfg_ftpUrl;
    $custom_ftpServer = $cfg_ftpServer;
    $custom_ftpPort = $cfg_ftpPort;
    $custom_ftpDir = $editor_ftpDir = $cfg_ftpDir;
    $custom_ftpUser = $cfg_ftpUser;
    $custom_ftpPwd = $cfg_ftpPwd;
    $custom_ftpTimeout = $cfg_ftpTimeout;
    $custom_OSSUrl = $cfg_OSSUrl;
    $custom_OSSBucket = $cfg_OSSBucket;
    $custom_EndPoint = $cfg_EndPoint;
    $custom_OSSKeyID = $cfg_OSSKeyID;
    $custom_OSSKeySecret = $cfg_OSSKeySecret;
    $custom_QINIUAccessKey = $cfg_QINIUAccessKey;
    $custom_QINIUSecretKey = $cfg_QINIUSecretKey;
    $custom_QINIUbucket = $cfg_QINIUbucket;
    $custom_QINIUdomain = $cfg_QINIUdomain;
    $custom_OBSUrl = $cfg_OBSUrl;
    $custom_OBSBucket = $cfg_OBSBucket;
    $custom_OBSEndpoint = $cfg_OBSEndpoint;
    $custom_OBSKeyID = $cfg_OBSKeyID;
    $custom_OBSKeySecret = $cfg_OBSKeySecret;
    $custom_COSUrl = $cfg_COSUrl;
    $custom_COSBucket = $cfg_COSBucket;
    $custom_COSRegion = $cfg_COSRegion;
    $custom_COSSecretid = $cfg_COSSecretid;
    $custom_COSSecretkey = $cfg_COSSecretkey;

    //存储目录
    $saveDir = $saveDir ?: HUONIAOROOT.$editor_uploadDir."/".$model."/poster/large/".date("Y")."/".date('m')."/".date("d");
    if(!is_dir($saveDir)){
        mkdir($saveDir,0777,true);
    }
    //随机生成名称
    $rand_str = time() . rand(1, 10000);
    //生成html
    $htmlFilename = $rand_str.".html";
    $htmlFilePath = "{$saveDir}/{$htmlFilename}";
    file_put_contents($htmlFilePath,$htmlStr);
    //wkhtmltopdf将生成的html文件转为相应的pdf
    $pdfFilename = $rand_str.".png";
    $pdfFilePath = "{$saveDir}/{$pdfFilename}";
    exec("wkhtmltoimage --quality 75 --enable-local-file-access $htmlFilePath $pdfFilePath");
    //删除生成的临时html文件
    unlinkFile($htmlFilePath);

    //判断文件是否存在
    if (!file_exists($pdfFilePath)) {
        return false;
    }

    //上传pdf文件
    $remotePath = "..".$editor_uploadDir."/".$model."/poster/large/".date( "Y" )."/".date( "m" )."/".date( "d" )."/";
    $res = getRemoteImage(array($pdfFilePath), array("savePath" => $remotePath), 'job', '..', false, 2);
    $fid = "";
    if($res){
        $res = json_decode($res,true);
        if($res['state']=="SUCCESS"){
            if($res['list'][0]['state']=="SUCCESS"){
                $fid = $res['list'][0]['fid'];
            }
        }
    }
    //返回pdf文件的名称、所在目录，文件的绝对路径等
    return array("name"=>$pdfFilename,"dir"=>$saveDir,"path"=>$pdfFilePath,"fid"=>$fid);
}

/**
 * 企业工商数据接口
 */
function getEnterpriseBusinessData($com){
    //获取aliyun参数
    global $cfg_juhe;
    $cfg_juhe = is_array($cfg_juhe) ? $cfg_juhe : unserialize($cfg_juhe);
    $host = "https://cardnotwo.market.alicloudapi.com";
    $path ="/company";
    $method = "POST";
    $appcode = $cfg_juhe['aliyun'];
    $headers = array();
    array_push($headers, "Authorization:APPCODE " . $appcode);
    //请求数据
    $querys = "com=".urlencode($com);
    $bodys = "";
    $url = $host . $path . "?" . $querys;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($curl, CURLOPT_FAILONERROR, false);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HEADER, true);
    if (1 == strpos("$".$host, "https://"))
    {
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    curl_setopt($curl, CURLOPT_POSTFIELDS, $bodys);
    $con = curl_exec($curl);
    $result=strstr($con,"{");
    curl_close($curl);
    return json_decode($result,true);
}

/**
 * 获取系统安全域名，用于前端中转页跳转
 */
function getSecureDomain(){
    global $cfg_basehost;
    global $cfg_secure_domain;

    $cfg_basehost = substr($cfg_basehost,0,4) == 'www.' ? str_replace('www.', '', $cfg_basehost) : $cfg_basehost;  //去掉前面的www.
    $cfg_secure_domain = trim($cfg_secure_domain);

    $domainArr = array();
    if($cfg_secure_domain && $cfg_secure_domain != '*'){

        //默认常用域名
        $defaultDomain = array(
            $cfg_basehost,
            'ihuoniao.cn',
            'kumanyun.com',
            'beian.miit.gov.cn',
            'qq.com',
            'baidu.com',
            'amap.com',
            'google.com'
        );

        //后台设置的域名
        $domainList = explode('|', $cfg_secure_domain);

        return array_merge($defaultDomain, $domainList);
    }
    return $domainArr;
    
}

/**
 * 计算某种支付方式，指定金额的平台手续费
 * @param string $paytype 支付方式，某种第三方支付
*/
function countPayTypeCharge(string $paytype,$amount){
    global $dsql;
    if($paytype == 'money') return 0;
    $sql = $dsql::SetQuery("select `pay_config` from `#@__site_payment` where `pay_code`='$paytype'");
    $payConfig = $dsql->getOne($sql);
    if(!empty($payConfig)){
        $payConfig = unserialize($payConfig);
        $payConfig = array_column($payConfig,'value','name');
        //手续费率
        $charge = isset($payConfig['charge']) ? (float)$payConfig['charge'] / 100 : 0;
        return round($amount * $charge,2);  //仅保留2位小数，四舍五入
    }else{
        return 0;
    }
}


/** 
* 将16进制颜色转换为RGB
*/
function hex2rgb($hexColor, $hsl = 0){
    $color=str_replace('#','',$hexColor);
    if (strlen($color)> 3){
        $r = hexdec(substr($color,0,2));
        $g = hexdec(substr($color,2,2));
        $b = hexdec(substr($color,4,2));
        $rgb = array(
            'r' => $r,
            'g' => $g,
            'b' => $b
        );
    }else{
        $r = substr($color,0,1). substr($color,0,1);
        $g = substr($color,1,1). substr($color,1,1);
        $b = substr($color,2,1). substr($color,2,1);
        $rgb = array( 
            'r' => hexdec($r),
            'g' => hexdec($g),
            'b' => hexdec($b)
        );
    }

    if($hsl){
        $r /= 255;
        $g /= 255;
        $b /= 255;

        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $h;
        $s;
        $l = ($max + $min) / 2;

        if ($max == $min) {
            $h = $s = 0; // achromatic
        } else {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);

            switch ($max) {
                case $r:
                    $h = ($g - $b) / $d + ($g < $b ? 6 : 0);
                    break;
                case $g:
                    $h = ($b - $r) / $d + 2;
                    break;
                case $b:
                    $h = ($r - $g) / $d + 4;
                    break;
            }

            $h /= 6;
        }

        $h = (float)sprintf('%.2f', $h * 360);
        $s = (float)sprintf('%.2f', $s * 100);
        $l = (float)sprintf('%.2f', $l * 100);

        return array(
            'h' => $h,
            's' => $s,
            'l' => $l
        );
    
    }
    //返回rgb
    else{
        return $rgb;
    }
}


/**
 * 获取默认分享图标
 * @param string $module 模块标识
 * @return string
 */
function getShareImage($module){
    global $cfg_sharePic;
    global $cfg_weblogo;
    global $dsql;

    //系统默认分享图
    $sharePic = $cfg_sharePic;

    //获取模块自定义分享图
    if($module != 'siteConfig'){
        include HUONIAOINC . "/config/".$module.".inc.php";
        if($customSharePic){
            $sharePic = $customSharePic;
        }
    }

    //如果没有设置分享图，取APP配置中的logo
    if($sharePic == ''){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $appRet = $dsql->dsqlOper($sql, "results");
        if($appRet && is_array($appRet)){
            $data = $appRet[0];
            $sharePic = $data['logo'];
        }
    }

    //如果以上都没有，使用系统基本参数中的logo
    if($sharePic == ''){
        $sharePic = $cfg_weblogo;
    }

    return getFilePath($sharePic);

}


/**
 * 重写实现 http_build_query 提交实现(同名key)key=val1&key=val2
 * @param array $formData 数据数组
 * @param string $numericPrefix 数字索引时附加的Key前缀
 * @param string $argSeparator 参数分隔符(默认为&)
 * @param string $prefixKey Key 数组参数，实现同名方式调用接口
 * @return string
 */
 function hn_build_query($formData, $numericPrefix = '', $argSeparator = '&', $prefixKey = '') {
    $str = '';
    foreach ($formData as $key => $val) {
        if (!is_array($val)) {
            $str .= $argSeparator;
            if ($prefixKey === '') {
                if (is_int($key)) {
                    $str .= $numericPrefix;
                }
                $str .= urlencode($key) . '=' . urlencode($val);
            } else {
                $str .= urlencode($prefixKey) . '=' . urlencode($val);
            }
        } else {
            if ($prefixKey == '') {
                $prefixKey .= $key;
            }
            if (isset($val[0]) && is_array($val[0])) {
                $arr = array();
                $arr[$key] = $val[0];
                $str .= $argSeparator . http_build_query($arr);
            } else {
                $str .= $argSeparator . hn_build_query($val, $numericPrefix, $argSeparator, $prefixKey);
            }
            $prefixKey = '';
        }
    }
    return substr($str, strlen($argSeparator));
}

/**
 * 发起 server 请求
 * @param $url
 * @param $params
 * @param $httpHeader
 * @return mixed
 */
function hn_curl($url, $params, $contentType = 'urlencoded', $httpMethod = 'POST', $headers = array(), $timeout = 3, $jsonFlags=0) {
    $httpHeader = array();
    $ch = curl_init();
    if ($httpMethod=='POST' && $contentType=='urlencoded') {
        $httpHeader[] = 'Content-Type:application/x-www-form-urlencoded';
        curl_setopt($ch, CURLOPT_POSTFIELDS, hn_build_query($params));
    }
    if ($httpMethod=='POST' && $contentType=='json') {
        $httpHeader[] = 'Content-Type:Application/json';
        $params = $jsonFlags ? json_encode($params, $jsonFlags) : json_encode($params);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    }
    if ($httpMethod=='GET' && $contentType=='urlencoded') {
        $url .= strpos($url, '?') === false?'?':'&';
        $url .= hn_build_query($params);
    }
    if($headers){
        $httpHeader = array_merge($httpHeader, $headers);
    }
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, $httpMethod=='POST');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false); //处理http证书问题
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, "kumanyun/curl");
    $ret = curl_exec($ch);
    if (false === $ret) {
    }
    curl_close($ch);
    return $ret;
}

/**
 * 创建音频内容审核作业
*/
function RunCreateAudioModerationJob(string $url,string $callback=""){
    // ak 和 sk 分别是密钥对
    global $cfg_moderation_key;
    global $cfg_moderation_secret;
    global $cfg_moderation_region;
    global $cfg_moderation_projectId;
    global $cfg_moderation_platform;
    global $cfg_moderation_aliyun_region;
    global $cfg_moderation_aliyun_key;
    global $cfg_moderation_aliyun_secret;
        
    $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

    //华为云
    if($cfg_moderation_platform == 'huawei'){
        include_once HUONIAOINC."/class/moderation/huawei/RunCreateAudioModerationJob.php";
        $ak = $cfg_moderation_key;
        $sk = $cfg_moderation_secret;
        $projectId = $cfg_moderation_projectId;  //用户的project_id 登陆华为云 -> 用户中心 -> 我的凭证 -> api凭证 即可查看对应区域的项目ID。
        $endpoint = "https://moderation.{$cfg_moderation_region}.myhuaweicloud.com";  //地区，例如 : https://moderation.cn-north-1.myhuaweicloud.com
        $HuaweiCloudCreateAudioModerationJob = new HuaweiCloud\SDK\Moderation\V3\Model\HuaweiCloudCreateAudioModerationJob();

        return $HuaweiCloudCreateAudioModerationJob->exec($ak,$sk,$projectId,$endpoint,$url,$callback);
    }

    //阿里云
    elseif($cfg_moderation_platform == 'aliyun'){
        require_once HUONIAOINC . "/class/moderation/aliyun/audio.php";
        $config = array(
            "accessKeyId" => $cfg_moderation_aliyun_key,
            "accessKeySecret" => $cfg_moderation_aliyun_secret,
            "endpoint" => $cfg_moderation_aliyun_region,
            "url" => $url,
            "callback" => $callback
        );

        $moderation_audio = new moderation_audio();
        $ret = $moderation_audio::main($config);
        if($ret['Code'] == 200){
            $Data = $ret['Data'];
            $TaskId = $Data['TaskId'];
            return json_encode(array('job_id' => $TaskId));
        }

    }
}

/**
 * 查询音频内容审核作业
*/
function RunQueryAudioModerationJob(string $jobId){

    // ak 和 sk 分别是密钥对
    global $cfg_moderation_key;
    global $cfg_moderation_secret;
    global $cfg_moderation_region;
    global $cfg_moderation_projectId;
    global $cfg_moderation_platform;
    global $cfg_moderation_aliyun_region;
    global $cfg_moderation_aliyun_key;
    global $cfg_moderation_aliyun_secret;
        
    $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

    //华为云
    if($cfg_moderation_platform == 'huawei'){
        include_once HUONIAOINC."/class/moderation/huawei/RunQueryAudioModerationJob.php";
        $ak = $cfg_moderation_key;
        $sk = $cfg_moderation_secret;
        $projectId = $cfg_moderation_projectId;  //用户的project_id 登陆华为云 -> 用户中心 -> 我的凭证 -> api凭证 即可查看对应区域的项目ID。
        $endpoint = "https://moderation.{$cfg_moderation_region}.myhuaweicloud.com";  //地区，例如 : https://moderation.cn-north-1.myhuaweicloud.com

        $HuaweiCloudQueryAudioModerationJob = new HuaweiCloud\SDK\Moderation\V3\Model\HuaweiCloudQueryAudioModerationJob();

        return $HuaweiCloudQueryAudioModerationJob->exec($ak,$sk,$projectId,$endpoint,$jobId);
    }

    //阿里云
    elseif($cfg_moderation_platform == 'aliyun'){
        require_once HUONIAOINC . "/class/moderation/aliyun/audio.php";
        $config = array(
            "action" => "VoiceModerationResult",
            "accessKeyId" => $cfg_moderation_aliyun_key,
            "accessKeySecret" => $cfg_moderation_aliyun_secret,
            "endpoint" => $cfg_moderation_aliyun_region,
            "taskId" => $jobId
        );

        $moderation_audio = new moderation_audio();
        $ret = $moderation_audio::main($config);
        if($ret['Code'] == 200){
            $Data = $ret['Data'];
            $SliceDetails = $Data['SliceDetails'];
            $block = false;
            if($SliceDetails){
                foreach($SliceDetails as $key => $value){
                    //命名违规标签内容
                    if($value['Labels']){
                        $block = true;
                    }
                }
            }
            if($block){
                return json_encode(array('result' => array('suggestion' => 'block'), 'ret' => $ret));
            }
        }

    }
}

/**
 * 创建视频内容审核作业
*/
function RunCreateVideoModerationJob(string $url,int $interval=5,string $callback=""){
    // ak 和 sk 分别是密钥对
    global $cfg_moderation_key;
    global $cfg_moderation_secret;
    global $cfg_moderation_region;
    global $cfg_moderation_projectId;
    global $cfg_moderation_platform;
    global $cfg_moderation_aliyun_region;
    global $cfg_moderation_aliyun_key;
    global $cfg_moderation_aliyun_secret;
        
    $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

    //华为云
    if($cfg_moderation_platform == 'huawei'){
        include_once HUONIAOINC."/class/moderation/huawei/RunCreateVideoModerationJob.php";
        $ak = $cfg_moderation_key;
        $sk = $cfg_moderation_secret;
        $projectId = $cfg_moderation_projectId;  //用户的project_id 登陆华为云 -> 用户中心 -> 我的凭证 -> api凭证 即可查看对应区域的项目ID。
        $endpoint = "https://moderation.{$cfg_moderation_region}.myhuaweicloud.com";  //地区，例如 : https://moderation.cn-north-1.myhuaweicloud.com
        $HuaweiCloudCreateVideoModerationJob = new HuaweiCloud\SDK\Moderation\V3\Model\HuaweiCloudCreateVideoModerationJob();

        return $HuaweiCloudCreateVideoModerationJob->exec($ak,$sk,$projectId,$endpoint,array("url"=>$url,"interval"=>$interval),$callback);
    }

    //阿里云
    elseif($cfg_moderation_platform == 'aliyun'){
        require_once HUONIAOINC . "/class/moderation/aliyun/video.php";
        $config = array(
            "accessKeyId" => $cfg_moderation_aliyun_key,
            "accessKeySecret" => $cfg_moderation_aliyun_secret,
            "endpoint" => $cfg_moderation_aliyun_region,
            "url" => $url,
            "callback" => $callback
        );

        $moderation_video = new moderation_video();
        $ret = $moderation_video::main($config);
        if($ret['Code'] == 200){
            $Data = $ret['Data'];
            $TaskId = $Data['TaskId'];
            return json_encode(array('job_id' => $TaskId));
        }

    }
}

/**
 * 查询视频内容审核作业
*/
function RunQueryVideoModerationJob(string $jobId){
    // ak 和 sk 分别是密钥对
    global $cfg_moderation_key;
    global $cfg_moderation_secret;
    global $cfg_moderation_region;
    global $cfg_moderation_projectId;
    global $cfg_moderation_platform;
    global $cfg_moderation_aliyun_region;
    global $cfg_moderation_aliyun_key;
    global $cfg_moderation_aliyun_secret;
        
    $cfg_moderation_platform = $cfg_moderation_platform ? $cfg_moderation_platform : 'huawei';

    //华为云
    if($cfg_moderation_platform == 'huawei'){
        include_once HUONIAOINC."/class/moderation/huawei/RunQueryVideoModerationJob.php";
        $ak = $cfg_moderation_key;
        $sk = $cfg_moderation_secret;
        $projectId = $cfg_moderation_projectId;  //用户的project_id 登陆华为云 -> 用户中心 -> 我的凭证 -> api凭证 即可查看对应区域的项目ID。
        $endpoint = "https://moderation.{$cfg_moderation_region}.myhuaweicloud.com";  //地区，例如 : https://moderation.cn-north-1.myhuaweicloud.com

        $HuaweiCloudQueryVideoModerationJob = new HuaweiCloud\SDK\Moderation\V3\Model\HuaweiCloudQueryVideoModerationJob();

        return $HuaweiCloudQueryVideoModerationJob->exec($ak,$sk,$projectId,$endpoint,$jobId);
    }

    //阿里云
    elseif($cfg_moderation_platform == 'aliyun'){
        require_once HUONIAOINC . "/class/moderation/aliyun/video.php";
        $config = array(
            "action" => "VideoModerationResult",
            "accessKeyId" => $cfg_moderation_aliyun_key,
            "accessKeySecret" => $cfg_moderation_aliyun_secret,
            "endpoint" => $cfg_moderation_aliyun_region,
            "taskId" => $jobId
        );

        $moderation_video = new moderation_video();
        $ret = $moderation_video::main($config);
        if($ret['Code'] == 200){
            $Data = $ret['Data'];
            $FrameSummarys = $Data['FrameResult']['FrameSummarys'];
            $block = false;
            if($FrameSummarys){
                foreach($FrameSummarys as $key => $value){
                    //命名违规标签内容
                    if($value['Label']){
                        $block = true;
                    }
                }
            }
            if($block){
                return json_encode(array('result' => array('suggestion' => 'block'), 'ret' => $ret));
            }
        }

    }
}


/**
 * function：计算两个日期相隔多少年，多少月，多少天
 * param string $date1[格式如：2011-11-5]
 * param string $date2[格式如：2012-12-01]
 */
function diffDate($date1, $date2){
    $datetime1 = new DateTime($date1);
    $datetime2 = new DateTime($date2);
    $interval = $datetime1->diff($datetime2);
    $time['y'] = $interval->format('%Y');
    $time['m'] = $interval->format('%m');
    $time['d'] = $interval->format('%d');
    $time['h'] = $interval->format('%H');
    $time['i'] = $interval->format('%i');
    $time['s'] = $interval->format('%s');
    $time['a'] = $interval->format('%a');    // 两个时间相差总天数
    return $time;
}


/**
 * 生成静态HTML页面
 * param string $url 动态页面
 * param string $module 所属模块
 * param string $template 要生成的静态文件名
 * param string $platform 设备类型 pc/touch
 */
function createStaticPage($url, $module, $template, $cityid, $platform = 'pc'){
    $url = $url . (strstr($url, '?') ? '&' : '?') . 'csp=1';
    $html = hn_curl($url, array());

    //只有源码获取成功并且有系统关键字才需要创建文件
    if($html && strstr($html, 'masterDomain')){
        //生成目录
        $dir = HUONIAOROOT . '/templates_c/html/';
        $dir .= '/' . $module . '/' . $platform . '/' . $template . '/' . $cityid . '.html'; 
        createFile($dir, true);

        //没有权限时
        if(!file_exists($dir)){
            ShowMsg('权限错误，生成失败，请为' . HUONIAOROOT . '/templates_c/html/' . '文件夹设置写入权限！', '-1');
            die;
        }

        //创建html文件
        PutFile($dir, $html);
    }
}


/**
 * 判断系统是否有某个终端
 * param string $platform 终端标识  app/wxmini/dymini
 */
function verifyTerminalState($platform){
    global $dsql;

    //是否有app，根据安卓或者苹果的下载链接进行判断
    if($platform == 'android'){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $android_download = $ret[0]['android_download'];
            if($android_download ){
                return true;
            }
        }

    }
    if($platform == 'ios'){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $ios_download = $ret[0]['ios_download'];
            if($ios_download){
                return true;
            }
        }

    }
    if($platform == 'harmony'){
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $harmony_download = $ret[0]['harmony_download'];
            if($harmony_download){
                return true;
            }
        }

    }
    //是否有微信小程序，根据appid、appsecret、原始id进行判断
    elseif($platform == 'wxmini'){
        
        global $cfg_miniProgramAppid;
        global $cfg_miniProgramAppsecret;
        global $cfg_miniProgramId;

        if($cfg_miniProgramAppid && $cfg_miniProgramAppsecret && $cfg_miniProgramId){
            return true;
        }

    }
    //是否有抖音小程序，根据插件id为20进行判断
    elseif($platform == 'dymini'){

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = 20");
        $ret = (int)$dsql->dsqlOper($sql, "totalCount");
        if($ret > 0){
            return true;
        }

    }
    //是否有QQ小程序，根据插件id为10进行判断
    elseif($platform == 'qqmini'){

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = 10");
        $ret = (int)$dsql->dsqlOper($sql, "totalCount");
        if($ret > 0){
            return true;
        }

    }
    //是否有百度小程序，根据插件id为9进行判断
    elseif($platform == 'bdmini'){

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = 9");
        $ret = (int)$dsql->dsqlOper($sql, "totalCount");
        if($ret > 0){
            return true;
        }

    }

    return false;

}


//判断当前useragent属于哪个终端
function getCurrentTerminal(){

    $data = 'pc';

    //是否为安卓端
    if(isAndroidApp()){
        $data = 'android';
    }
    elseif(isIOSApp()){
        $data = 'ios';
    }
    //是否鸿蒙APP
    elseif(isHarmonyApp()){
        $data = 'harmony';
    }
    //微信小程序
    elseif(isWxMiniprogram()){
        $data = 'wxmini';
    }
    //微信公众号
    elseif(isWeixin()){
        $data = 'weixin';
    }
    //抖音小程序
    elseif(isByteMiniprogram()){
        $data = 'dymini';
    }
    //QQ小程序
    elseif(isQqMiniprogram()){
        $data = 'qqmini';
    }
    //百度小程序
    elseif(isBaiDuMiniprogram()){
        $data = 'bdmini';
    }
    //h5浏览器
    elseif(isMobile()){
        $data = 'h5';
    }

    return $data;
}


//根据终端标识输出终端名称
function getTerminalName($code){
    $config = array(
        'pc' => 'PC电脑端',
        'h5' => 'H5浏览器',
        'android' => '安卓APP',
        'ios' => '苹果APP',
        'weixin' => '微信公众号',
        'wxmini' => '微信小程序',
        'dymini' => '抖音小程序',
        'qqmini' => 'QQ小程序',
        'bdmini' => '百度小程序',
        'bbs' => '论坛同步',
    );
    return $config[$code] ?: '本站';
}


//读取文件缓存
function cache_read($file, $dir = '', $mode = '') {
    if(HUONIAOADMIN != '' && $dir != 'tableColumns') return;  //管理后台访问不读缓存
	$file = $dir ? HUONIAODATA.'/cache/'.$dir.'/'.$file : HUONIAODATA.'/cache/'.$file;
	if(!is_file($file)) return $mode ? '' : array();
	return $mode ? file_get($file) : include $file;
}

//写入文件缓存
function cache_write($file, $string, $dir = '', $force = false) {
    if(HUONIAOADMIN == '' && !$force) return;  //非管理后台访问不写缓存
	if(is_array($string)) $string = "<?php defined('HUONIAOINC') or exit('Access Denied'); return ".strip_nr(var_export($string, true))."; ?>";
	$file = $dir ? HUONIAODATA.'/cache/'.$dir.'/'.$file : HUONIAODATA.'/cache/'.$file;
	$strlen = PutFile($file, $string);
	return $strlen;
}

//删除指定文件缓存
function cache_delete($file, $dir = '') {
	$file = $dir ? HUONIAODATA.'/cache/'.$dir.'/'.$file : HUONIAODATA.'/cache/'.$file;
	return unlinkFile($file);
}

//清空指定目录文件缓存
function cache_clear($str, $type = '', $dir = '') {
	$dir = $dir ? HUONIAODATA.'/cache/'.$dir.'/' : HUONIAODATA.'/cache/';
	$files = glob($dir.'*');
	if(is_array($files)) {
		if($type == 'dir') {
			foreach($files as $file) {
				if(is_dir($file)) {deldir($file);} else {if(file_ext($file) == $str) unlinkFile($file);}
			}
		} else {
			foreach($files as $file) {
				if(!is_dir($file) && strpos(basename($file), $str) !== false) unlinkFile($file);
			}
		}
	}
}

function strip_nr($string, $js = false) {
	$string =  str_replace(array(chr(13), chr(10), "\n", "\r", "\t", '  '),array('', '', '', '', '', ''), $string);
	if($js) $string = str_replace("'", "\'", $string);
	return $string;
}


//获取数据缓存，多个数据保存在一个文件中
function getCacheData($str, $file){
    return;

    //数据缓存相关
    $cacheKey = md5($str);
    $cacheFile = HUONIAODATA . '/cache/' . $file;
    if(file_exists($cacheFile) && HUONIAOADMIN == ''){
        $cacheData = json_decode(file_get_contents($cacheFile), true);

        //如果有数据，直接返回
        if($cacheData[$cacheKey]){
            return $cacheData[$cacheKey];
        }
    }

}

//更新分类数据缓存
function setCacheData($str, $data, $file){
    return;

    //数据缓存相关
    $cacheData = array();
    $cacheKey = md5($str);
    $cacheFile = HUONIAODATA . '/cache/' . $file;
    if(file_exists($cacheFile)){
        $_cacheData = file_get_contents($cacheFile);
        $cacheData = json_decode($_cacheData, true);

        //缓存文件有内容，并且是数组时，增加新的内容
        if($_cacheData && is_array($cacheData)){
            $cacheData[$cacheKey] = array(
                'key' => $str,
                'data' => $data
            );
    
            PutFile($cacheFile, json_encode($cacheData, JSON_UNESCAPED_UNICODE));
        }
        
    }
    //缓存文件不存在时，正常写入
    else{       
        $cacheData[$cacheKey] = array(
            'key' => $str,
            'data' => $data
        );

        PutFile($cacheFile, json_encode($cacheData, JSON_UNESCAPED_UNICODE));
    }

}



//格式化招聘薪资
function salaryFormat($salary_type = 0, $min_salary = 0, $max_salary = 0, $mianyi = 0){
    global $service;
    $show_salary = '';

    if ($salary_type == 1) {
        //两者大于千，且百位均为0
        if ($min_salary >= 1000 && $max_salary >= 1000 && $min_salary / 100 % 10 === 0 && $max_salary / 100 % 10 === 0) {
            //如果最小最大不超万，显示千
            if ($min_salary < 10000 && $max_salary < 10000) {
                if (floor($min_salary / 1000) == floor($max_salary / 1000)) {
                    if($service == 'zhaopin'){
                        $show_salary = $min_salary;
                    }else{
                        $show_salary = floor($min_salary / 1000) . "千";
                    }
                } else {
                    if($service == 'zhaopin'){
                        $show_salary = $min_salary . "-" . $max_salary;
                    }else{
                        $show_salary = floor($min_salary / 1000) . "-" . floor($max_salary / 1000) . "千";
                    }
                }
            }
            //最小为千，最大为万，显示千-万
            elseif ($min_salary < 10000 && $max_salary >= 10000) {
                $smax_salary = sprintf("%.1f", $max_salary / 1000);
                if ($smax_salary % 10 == 0) {
                    $smax_salary = (int)($smax_salary / 10);
                } else {
                    $smax_salary = $smax_salary / 10;
                }
                if($service == 'zhaopin'){
                    $show_salary = $min_salary . '-' . $max_salary;
                }else{
                    $show_salary = floor($min_salary / 1000) . "千-" . $smax_salary . "万";
                }
            }
            //两者均过万，显示万-万
            else {
                $smin_salary = sprintf("%.2f", $min_salary / 1000);
                $smax_salary = sprintf("%.2f", $max_salary / 1000);
                if ($smin_salary % 10 == 0) {
                    $smin_salary = (int)($smin_salary / 10);
                } else {
                    $smin_salary = $smin_salary / 10;
                }
                if ($smax_salary % 10 == 0) {
                    $smax_salary = (int)($smax_salary / 10);
                } else {
                    $smax_salary = $smax_salary / 10;
                }
                if ($smin_salary == $smax_salary) {
                    if($service == 'zhaopin'){
                        $show_salary = $min_salary;
                    }else{
                        $show_salary = $smin_salary . "万";
                    }
                } else {
                    if($service == 'zhaopin'){
                        $show_salary = $min_salary . '-' . $max_salary;
                    }else{
                        $show_salary = $smin_salary . "-" . $smax_salary . "万";
                    }
                }
            }
        }
        //百位有数字，直接显示
        else {
            if($min_salary == $max_salary){
                $show_salary = $min_salary;
            }else{
                $show_salary = $min_salary . "-" . $max_salary;
            }

            //如果最小最大都为0，则面议
            if ($min_salary == 0 && $max_salary == 0) {
                $mianyi = 1;
            }
        }
    } else {
        $show_salary = $min_salary . "-" . $max_salary . "/小时";
    }

    //面议
    if ($mianyi) {
        $show_salary = '面议';
    }
    //加上元
    else {
        $currency = echoCurrency(array("type" => "short"));
        if (strstr($show_salary, '/小时')) {
            $show_salary = str_replace('/小时', $currency . '/小时', $show_salary);
        } else {
            $show_salary .= $currency;
        }
    }

    return $show_salary;
}


//将图片加密地址转为正常地址
function decodeAttachmentUrl($body){
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $cfg_attachment;

    $u = str_replace('//', '\/\/', $cfg_secureAccess) . $cfg_basehost . '\/include\/attachment.php';
    $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

    //特殊情况兼容处理
    $u = str_replace('//', '\/\/', $cfg_secureAccess) . 'www.' . $cfg_basehost . '\/include\/attachment.php';
    $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

    //将附件地址转为真实地址
    $attachment = substr($cfg_attachment, 1, strlen($cfg_attachment));
    $attachment = substr("/include/attachment.php?f=", 1, strlen("/include/attachment.php?f="));

    $attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
    $attachment = str_replace("https://" . $cfg_basehost, "", $attachment);
    $attachment = substr($attachment, 1, strlen($attachment));

    $attachment = str_replace("/", "\/", $attachment);
    $attachment = str_replace(".", "\.", $attachment);
    $attachment = str_replace("?", "\?", $attachment);
    $attachment = str_replace("=", "\=", $attachment);

    preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $body, $fileList);
    $fileList = array_unique($fileList[1]);

    //内容图片
    $fileArr = array();
    if (!empty($fileList)) {
        foreach ($fileList as $v_) {
            $filePath = getRealFilePath($v_, false);
            array_push($fileArr, array(
                'source' => '/include/attachment.php?f=' . $v_,
                'turl' => $filePath
            ));
        }
    }

    //替换内容中的文件地址
    if($fileArr){
        foreach ($fileArr as $key => $val){
            $file_source = $val['source'];
            $file_turl = $val['turl'];
            $body = str_replace($file_source, $file_turl, $body);
        }
    }

    return stripslashes($body);
}


//根据身份证号码获取出生日期和性别
function getBirthAndGenderFromIdCard($idCard) {
    $birthday = ''; // 出生年月
    $gender = ''; // 性别
 
    // 检查身份证长度
    if (strlen($idCard) == 18) {
        // 提取出生年月
        $birthday = substr($idCard, 6, 8); // 获取出生年月日（YYYYMMDD）
        
        $birthday = preg_replace('/^(\d{4})(\d{2})(\d{2})$/', '$1-$2-$3', $birthday);
 
        // 提取性别
        $genderNum = substr($idCard, -2, 1); // 获取倒数第2位
        $genderNum = (int) $genderNum;
        $gender = ($genderNum % 2 === 0) ? 0 : 1; // 根据最后一位数字判断性别
    }
 
    return [
        'birthday' => $birthday,
        'gender' => $gender,   // 0女  1男  
    ];
}


//手机号码增加区号前缀
//返回格式：+853-xxxxxx，如果是国内86区号则不显示区号前缀，直接显示号码
function addAreaCodePrefix($areaCode, $mobile){
    if(!$mobile) return '';
    $areaCode = (int)$areaCode;
    if($areaCode == 86 || $areaCode == 0){
        $areaCode = '';
    }

    //如果是971区号，号码第一位如果不是0，需要补0
    if($areaCode == 971){
        if(substr($mobile, 0, 1) != '0'){
            $mobile = '0' . $mobile;
        }
    }

    return ($areaCode ? '+' . $areaCode . '-' : '') . $mobile;
}


//生成平台Token
function createApiTokenByPlatform($aid, $path = ''){

    $access_token = $refresh_token = '';

    //APP端
    if (isApp()) {

        //安卓APP
        if (isAndroidApp()) {
            $token = createApiToken('android', $aid);
            $access_token = $token['access_token'];
            $refresh_token = $token['refresh_token'];

        } 
        //苹果APP
        elseif(isIOSApp()) {
            $token = createApiToken('ios', $aid);
            $access_token = $token['access_token'];
            $refresh_token = $token['refresh_token'];
        }
        //鸿蒙APP
        elseif(isHarmonyApp()) {
            $token = createApiToken('harmony', $aid);
            $access_token = $token['access_token'];
            $refresh_token = $token['refresh_token'];
        }

    } 

    //小程序端
    elseif ($path || isWxMiniprogram() || isByteMiniprogram()) {

        //微信小程序
        if(isWxMiniprogram()){
            $token = createApiToken('wxmini', $aid);
            $access_token = $token['access_token'];
            $refresh_token = $token['refresh_token'];
        }
        //抖音小程序
        elseif(isByteMiniprogram()){
            $token = createApiToken('dymini', $aid);
            $access_token = $token['access_token'];
            $refresh_token = $token['refresh_token'];
        }

    }

    return array(
        'access_token' => $access_token,
        'refresh_token' => $refresh_token,
    );

}


//获取sql语句执行失败时的info内容
function getSqlErrInfo($errInfo){
    if(is_array(json_decode($errInfo, true))){
        $errInfoArr = json_decode($errInfo, true);
        $errInfo = $errInfoArr['info'];
    }
    return $errInfo;
}


//生成微信小程序加密链接进行跳转
function createWxMiniProgramUrl($path, $param){

    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$cfg_miniProgramAppid&secret=$cfg_miniProgramAppsecret";
    $res = json_decode(hn_curl($url, array()), true);

    if (isset($res['errcode'])) {
        die('获取小程序AccessToken失败！错误信息：' . $res['errcode'] . "_" . $res['errmsg']);
    }

    //如果是在微信内部浏览器打开，则生成加密scheme码进行跳转
    if (isWeixin()) {
        $access_token = $res['access_token'];
        $url = 'https://api.weixin.qq.com/wxa/generatescheme?access_token=' . $access_token;
        $data = array(
            'jump_wxa' => array(
                'path' => $path,    //跳转路径
                'query' => $param,    //携带参数
            ),            
            'is_expire'       => true,  //链接是否设置过期时间
            'expire_type'     => 1,     //过期类型 0指定时间 1指定天数
            'expire_interval' => 30     //有效期30天
        );

        $res = json_decode(hn_curl($url, $data, 'json'), true);
        if (isset($res['errcode']) && $res['errcode'] == 0) {
            $openlink = $res['openlink'];
            header('location:' . $openlink);
            die;
        }
    }

    //如果不在微信内部浏览器或者在微信内部浏览器时生成scheme码失败时，再次生成URLLink进行跳转
    $access_token = $res['access_token'];
    $url = 'https://api.weixin.qq.com/wxa/generate_urllink?access_token=' . $access_token;
    $data = array(
        'path'            => $path,    //跳转路径
        'query'           => $param,    //携带参数
        'is_expire'       => true,  //链接是否设置过期时间
        'expire_type'     => 1,     //过期类型 0指定时间 1指定天数
        'expire_interval' => 30     //有效期30天
    );

    $res = json_decode(hn_curl($url, $data, 'json'), true);
    if (isset($res['errcode']) && $res['errcode'] != 0) {
        die('获取小程序访问链接失败！错误信息：' . $res['errcode'] . "_" . $res['errmsg']);
    }

    $url_link = $res['url_link'];
    header('location:' . $url_link);
    die;
}

//获取微信小程序短链地址
function getWxMiniProgramShortUrl($pageUrl, $title='', $cityid = 0){
    global $dsql;
    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    //分站独立小程序的情况
    if($cityid){
        $config = getMiniProgramCityAdvancedConfig('', $cityid);
        if($config){
            $cfg_miniProgramAppid = $config['appid'];
            $cfg_miniProgramAppsecret = $config['appsecret'];
        }
        //如果分站没有绑定独立小程序，再获取下请求来源中的小程序APPID，根据APPID再获取自定义配置
        else{
            $referer = $_SERVER['HTTP_REFERER'];
            if($referer && strstr($referer, 'servicewechat.com')){
                $referer = str_replace('https://servicewechat.com/', '', $referer);
                $refererArr = explode('/', $referer);
                $_appid = $refererArr[0];
                $config = getMiniProgramCityAdvancedConfig($_appid);
                if($config){
                    $cfg_miniProgramAppid = $config['appid'];
                    $cfg_miniProgramAppsecret = $config['appsecret'];
                }
            }
        }
    }

    //获取小程序token
    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_miniProgramAppid, $cfg_miniProgramAppsecret);
    $access_token = $jssdk->getWxminiAccessToken(); //获取token

    // $url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=$cfg_miniProgramAppid&secret=$cfg_miniProgramAppsecret";
    // $res = json_decode(hn_curl($url, array()), true);
    // if (isset($res['errcode'])) {
    //     return '';
    // }
    // $access_token = $res['access_token'];
    $url = 'https://api.weixin.qq.com/wxa/genwxashortlink?access_token=' . $access_token;
    $data = array(
        'page_url' => $pageUrl,    //小程序存在的页面，可携带 query
        'page_title' => $title,    //页面标题
        'is_permanent' => false,  //生成的 Short Link 类型，短期有效：false，永久有效：true
    );

    $res = json_decode(hn_curl($url, $data, 'json'), true);
    if (isset($res['errcode']) && $res['errcode'] != 0) {
        return '';
    }
    return $res['link'];
}


// 根据appid或者cityid获取分站高级配置
function getCityAdvancedConfig($type = 'wechat', $appid = '', $cityid = 0) {
    global $cfg_siteCityAdvanced_wechat, $cfg_siteCityAdvanced_wxmini, $cfg_siteCityAdvanced_wxpay;
    
    // 使用数组映射优化配置选择逻辑
    $configMap = array(
        'wechat' => $cfg_siteCityAdvanced_wechat,
        'wxmini' => $cfg_siteCityAdvanced_wxmini,
        'wxpay' => $cfg_siteCityAdvanced_wxpay
    );
    
    $configArray = isset($configMap[$type]) ? $configMap[$type] : null;
    
    if (empty($configArray)) return false;
    
    $cityid = (int)$cityid;
    
    // 优先通过cityid查找
    if ($cityid && isset($configArray[$cityid])) {
        return $configArray[$cityid];
    }
    
    // 通过appid查找
    if ($appid) {
        foreach ($configArray as $key => $value) {
            if (isset($value['appid']) && $value['appid'] === $appid) {
                $value['cityid'] = $key;
                return $value;
            }
        }
    }
    
    return false;
}

// 根据appid或者cityid获取分站高级配置中的公众号信息（兼容旧版本）
function getWechatCityAdvancedConfig($appid = '', $cityid = 0) {
    $config = getCityAdvancedConfig('wechat', $appid, $cityid);

    //如果没有配置，则返回默认的公众号信息
    if((!$appid && !$cityid) || !$config){
        global $cfg_wechatToken;
        global $cfg_wechatAppid;
        global $cfg_wechatAppsecret;
        global $cfg_wechatName;
        global $cfg_wechatCode;
        global $cfg_wechatQr;
        return array(
            'token' => $cfg_wechatToken,
            'appid' => $cfg_wechatAppid,
            'appsecret' => $cfg_wechatAppsecret,
            'name' => $cfg_wechatName,
            'code' => $cfg_wechatCode,
            'qr' => $cfg_wechatQr
        );
    }
    
    return $config;
}

// 根据appid或者cityid获取分站高级配置中的小程序信息（兼容旧版本）
function getMiniProgramCityAdvancedConfig($appid = '', $cityid = 0) {
    return getCityAdvancedConfig('wxmini', $appid, $cityid);
}

// 根据appid或者cityid获取分站高级配置中的支付信息（兼容旧版本）
function getWxpayCityAdvancedConfig($appid = '', $cityid = 0) {
    return getCityAdvancedConfig('wxpay', $appid, $cityid);
}


//通过内部快递名字或编码获取小程序中快递编码
// type 1-通过编码查询 2-通过快递名称查询
function getWxMiniProgramExpressCode($type, $value)
{
    $express = 'OTHER'; //默认其他
    if (!$value) return $express;
    global $juhe_express_company;
    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_miniProgramAppid, $cfg_miniProgramAppsecret);
    $accessToken = $jssdk->getWxminiAccessToken(); //获取token
    if (!$accessToken) return $express;
    $items = array();
    $data = json_decode(@file_get_contents(HUONIAOROOT . "/data/cache/wxmini_express_code_" . $cfg_miniProgramAppid . ".json"), true);
    if (!$data || $data['expire_time'] < time()) {
        $url = "https://api.weixin.qq.com/cgi-bin/express/delivery/open_msg/get_delivery_list?access_token=$accessToken";
        $result = hn_curl($url, new stdClass(), 'json');
        $res = json_decode($result, true);
        $list = $res['delivery_list'];
        //处理快递地址
        if ($list) {
            foreach ($list as $val) {
                $items[$val['delivery_id']] = $val['delivery_name']; //id
            }
            $data = array();
            $data['expire_time'] = time() + 86400; //1天有效期
            $data['express_list'] = $items;
            $fp = @fopen(HUONIAOROOT . "/data/cache/wxmini_express_code_" . $cfg_miniProgramAppid . ".json", "w");
            @fwrite($fp, json_encode($data, JSON_UNESCAPED_UNICODE));
            @fclose($fp);
        }
    } else {
        $items = $data['express_list'];
    }

    if(!$items) return $express;

    if ($type == 1) { //编码查询
        if (!isset($juhe_express_company[$value])) return $express;
        $fixArr = array('yt' => 'yto', 'db' => 'dbl', 'jitu'=>'jtsd'); //修正圆通速递 德邦 极兔速递的数据 
        $innerCode = isset($fixArr[$value]) ? $fixArr[$value] : $value;
        $innerCode = strtoupper($value);
        $express = isset($items[$innerCode]) ? $innerCode : $express; //取key值就好
    } elseif ($type == 2) { //名称查询
        $flipped = array_flip($items); //名称作为key
        $express = isset($flipped[$value]) ? $flipped[$value] : $express;
    }
    return $express;
}

//设置微信小程序收货管理确认收货跳转页
function setWxMiniProgramDeliveryPath($path)
{
    if (!$path) return;
    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_miniProgramAppid, $cfg_miniProgramAppsecret);
    $access_token = $jssdk->getWxminiAccessToken(); //获取token
    if (!$access_token) {
        return '小程序token获取失败';
    }

    $data = array('path' => $path); //收货确认地址
    $url = 'https://api.weixin.qq.com/wxa/sec/order/set_msg_jump_path?access_token=' . $access_token;
    $result = hn_curl($url, $data, 'json');
    $res = json_decode($result, true);
    if ($res['errcoe'] != 0) {
        return '接口返回错误:' . $result;
    }
    return 'ok';
}

/**
 * 微信小程序发货信息录入接口
 * 
 * ordernum string 订单号
 * type     int    类型参数 shop  模块     1-实物 2-虚拟
 *                        waimai 模块     3-同城
 *                        member 充值模块 2-虚拟物品
 * 
 * playload array  自定义参数 waimai 模块 peisong => array('mode'=>'配送模式 0-骑手配送 1-确认订单(商家配送|用户自取) 2-扫码点餐','platform' => '平台商家/uu跑腿/麦芽田',  'driver_name' => '骑手姓名',  'driver_mobile' => '骑手手机号');
 *  
 */
function sendWxMiniProgramUploadShipping($ordernum, $type=1, $playload=array()){
    //小程序收货管理上报配置 开关
    include_once(HUONIAOINC . "/config/wechatConfig.inc.php");
    $checked = (int)$cfg_miniProgramShippingManage;
    if ($checked != 1) return 'pass';

    //初始化日志
    include_once(HUONIAOROOT."/api/payment/log.php");
    $log= new CLogFileHandler(HUONIAOROOT . '/log/wxmini_uploadshipping/'.date('Y-m-d').'.log', true);

    global $dsql;
    global $cfg_miniProgramAppid;
    global $cfg_miniProgramAppsecret;

    include_once(HUONIAOROOT . "/include/class/WechatJSSDK.class.php");
    $jssdk = new WechatJSSDK($cfg_miniProgramAppid, $cfg_miniProgramAppsecret);
    $access_token = $jssdk->getWxminiAccessToken(); //获取token
    if(!$access_token){
        $_paotuiOrderLog->DEBUG("小程序token获取失败");
        return 'fail';
    } 
    //订单信息
    $sql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `paytype` IN ('wxpay', 'allinpay_wxpay') AND `state` = 1"); //已支付的微信订单
    $ret = $dsql->dsqlOper($sql, "results");

    $data = array(); //发送的数据
    if($ret){
        $payInfo = $ret[0];
        $param = $payInfo['param_data'] ? unserialize($payInfo['param_data']) : array();
        $log->DEBUG("解析小程序支付订单, param:".json_encode($param));
        if (!$param) {
            $log->DEBUG("解析小程序支付订单, param 解析失败:".$payInfo['param_data']);
            return 'fail';
        }

        if ($param['wxmini_payment'] != 1){
            return "pass"; //非小程序支付订单跳过
        }
 
        $sql = $dsql->SetQuery("SELECT `wechat_mini_openid` FROM `#@__member` WHERE `id` = '{$payInfo['uid']}'");
        $wxminiOpenid = $dsql->getOne($sql);
        if (!$wxminiOpenid) {
            $log->DEBUG("支付订单用户 uid:{$payInfo['uid']}, 小程序openid 获取失败");
            return 'fail';
        }

        $shippingList=array();//快递信息数据
        $logisticsType = 3; //物流模式，发货方式枚举值：1、实体物流配送采用快递公司进行实体物流配送形式 2、同城配送 3、虚拟商品，虚拟商品，例如话费充值，点卡等，无实体配送形式 4、用户自提
        $deliveryMode = 1; //发货模式，1、UNIFIED_DELIVERY（统一发货）2、SPLIT_DELIVERY（分拆发货） 示例值: UNIFIED_DELIVERY
        $isAllDelivered = false; // 分拆发货模式时必填，用于标识分拆发货模式下是否已全部发货完成，只有全部发货完成的情况下才会向用户推送发货完成通知。示例值: true/false
        if ($payInfo['ordertype'] == 'shop') { //商城
            $ordernums = $payInfo['body'] ? explode(',', $payInfo['body']) : array(); //订单号
            if (!$ordernums) {
                $log->DEBUG("商城模块订单, body参数解析失败, orderNum:{$val['ordernum']}");
                return 'fail';
            }
            $valArr = array();
            foreach ($ordernums as $val) {
                $valArr[] = "'$val'";
            }
            $whereVal = join(',', $valArr);
            $sql = $dsql->SetQuery("SELECT `id`, `ordernum`, `protype`, `orderstate`, `shipping`, `contact`, `exp_company`, `exp_number` FROM `#@__shop_order` WHERE `ordernum` in ($whereVal)");
            $shopOrders= $dsql->dsqlOper($sql, 'results');
            if(!$shopOrders){
                $log->DEBUG("在线商城订单不存在, ordernum:{$ordernums}");
                return 'fail';
            }
            //实物数量+虚拟物品 都需要发货
            $missexpinfo = 0; //缺少快递信息标识
            $totalOrders = 0; //订单总数
            $shipping = 0; //统计已发货数量
            foreach($shopOrders as $val){
                $totalOrders++;
                $sql = $dsql->SetQuery("SELECT p.`title` FROM `#@__shop_order_product` op LEFT JOIN `#@__shop_product` p ON op.`proid`= p.`id` WHERE op.`orderid`='{$val['id']}'");
                $ptitle = $dsql->getOne($sql); //商品订单标题
                if ($val['orderstate'] == 6) {
                    if ($type == 1) { //实物发货
                        if ($val['shipping'] == 1) { //0：骑手配送；1：快递；2：商家配送
                            if (!$val['exp_company'] && !$val['exp_number']) { //缺少快递必备的信息
                                $missexpinfo = 1;
                                break;
                            }
                            $logisticsType = 1; //快递发货
                            $expressCode = getWxMiniProgramExpressCode(1, $val['exp_company']); //获取快递公司编码
                            //顺丰收货人
                            $item = array(
                                'tracking_no' => $val['exp_number'],
                                'express_company' => $expressCode,
                                'item_desc' => $ptitle ? cn_substrR($ptitle, 120) : '商城订单'
                            );
                            if ($express == 'SF') { //顺非收货人或发件人必填
                                if (!$val['contact']) {
                                    $missexpinfo = 2;
                                    break;
                                }
                                $item['receiver_contact'] = substr_replace($otuan['contact'], '****', 3, 4); //收件人联系方式
                            }
                        } elseif ($val['shipping'] == 0 || $val['shipping'] == 2) { //0-平台骑手配送
                            $logisticsType = 2;  //同城配送
                            $item = array(
                                'item_desc' => $ptitle ? cn_substrR($ptitle, 120) : '商城订单'
                            );
                        }
                    } elseif ($type == 2) { //虚拟发货
                        $item = array(
                            'item_desc' => $ptitle ? cn_substrR($ptitle, 120) : '商城订单'
                        );
                    }
                    $shipping++; //统计发货的数量
                    $shippingList[] = $item;
                }
            }

            if ($type == 1) { //实物快递发货
                if ($missexpinfo == 1) {
                    $log->DEBUG("商城模块订单号, orderNum:{$val['ordernum']} 缺少快递公司或单号信息");
                    return 'fail';
                }
                if ($missexpinfo == 2){
                    $log->DEBUG("商城模块订单号, orderNum:{$val['ordernum']} 使用顺丰快递缺少收货人联系电话");
                    return 'fail';
                }

                if ($totalOrders > 1) { //订单存在多单的情况 分拆发货模式
                    $deliveryMode = 2; //存在一条支付记录多家发货，全部购买的商品未全部发完的情况 
                    if ($totalOrders != $shipping) {
                        $isAllDelivered = false;
                    } else {
                        $isAllDelivered = true;
                    }
                }
            }
        } elseif ($payInfo['ordertype'] == 'waimai') { //外卖
            $logisticsType = 2; //同城配送
            $ordernum = $payInfo['ordernum'];
            $tab = 'waimai_order_all';
            $type = 'waimai';
            if ($payInfo['ordernum'] == $payInfo['body']) {
                $ordernum = $payInfo['ordernum'];
            } elseif ($payInfo['body'] == 'N;') {
                $ordernum = $payInfo['ordernum'];
            } elseif ($payInfo['body'] != '') {
                $body = $payInfo['body'] ? unserialize($payInfo['body']) : array();
                if (!$body) {
                    $log->DEBUG("外卖模块订单body解析失败, id:{$payInfo['id']}");
                    return 'fail';
                }
                $ordernum = $payInfo['ordernum'];
                $type = $body['type'];
                if ($body['type'] == 'paotui') {
                    $tab = 'paotui_order';
                }
            } else {
                $log->DEBUG("外卖模块订单数据获取异常, id:{$payInfo['id']}");
                return 'fail';
            }

            $where = "AND `state`=5"; //默认为骑手配送订单模式
            if ($type == 'waimai') {
                //0-骑手配送 1-确认订单 2-扫码点餐
                $peisong = $playload['peisong'];
                if ($peisong['mode'] == 1) { //确认订单模式
                    $where = " AND `state`=3";
                } elseif ($peisong['mode'] == 2) { //扫码点餐
                    $where = " AND `ordertype`=1 AND `desk`!='0'";
                }
            }
            $sql = $dsql->SetQuery("SELECT * FROM `#@__$tab` WHERE `ordernum` = '$ordernum' $where"); //配送中的订单
            $waimaiOrder = $dsql->getArr($sql);

            if (!$waimaiOrder) {
                $log->DEBUG("外卖模块无配送中的订单数据, ordernum:{$ordernum}");
                return 'pass';
            }

            //商品信息
            $title = "";
            if ($body['type'] == 'waimai') {
                $foods = $waimaiOrder['food'] ? unserialize($waimaiOrder['food']) : array();
                $items = array();
                foreach ($foods as $val) {
                    $items[] = sprintf("%s*%d", $val['title'], $val['count']);
                }
                $title = $items ? join(' ', $items) : '订单';
            } elseif ($body['type'] == 'paotui') {
                $title = $waimaiOrder['shop'] ? $waimaiOrder['shop'] : '跑腿订单';
            }

            $desc = $title;
            if (isset($playload['peisong'])) {
                $peisong = $playload['peisong'];
                // 0-骑手配送 1-商家自配送 2-扫码点餐 3-用户自取
                if ($peisong['mode'] == 0) { //骑手配送
                    $desc = sprintf("%s, %s配送-骑手%s, 联系方式 %s", $title, $peisong['platform'], $peisong['driver_name'], substr_replace($peisong['driver_mobile'], '****', 3, 4));
                } elseif ($peisong['mode'] == 1) { //确认订单模式 店内点餐 用户自提 商家配送
                    $desc = sprintf("%s, 商家配送", $title); //商家配送
                    if(($waimaiOrder['ordertype'] == 1 && $waimaiOrder['desk'] != '0')){ //店内点餐
                        $logisticsType = 4; //用户自提
                        $desc = sprintf("下单商品：%s", $title);

                    }elseif($waimaiOrder['selftime'] != 0){ //用户自提
                        $logisticsType = 4; //用户自提
                        $desc = sprintf("下单商品：%s", $title);
                    }

                    // if (($waimaiOrder['ordertype'] == 1 && $waimaiOrder['desk'] != '0') || $waimaiOrder['selftime'] != 0) {
                    //     $log->DEBUG("店内点餐/用户自取订单已发送过通知, ordernum:{$ordernum}");
                    //     return 'pass';
                    // }
                }
                //  elseif ($peisong['mode'] == 2) { //扫码点餐|用户自取
                //     $logisticsType = 4; //用户自提
                //     $desc = sprintf("下单商品：%s", $title);
                // }
            }
            $shippingList[] = array(
                'item_desc' => cn_substrR($desc, 120),
            );
  
        } elseif ($payInfo['ordertype'] == 'member') { //会员中心
            $body = $payInfo['body'] ? unserialize($payInfo['body']) : array();
            if(!$body){
               $log->DEBUG("会员模块订单, body参数解析失败, orderNum:{$val['ordernum']}");
               return 'fail'; 
            }
            if ($body['type'] == 'deposit') { //充值
                $item = array(
                    'item_desc' => '用户在平台充值' . $payInfo['amount'] . '元'
                );
            }

            $shippingList[] = $item;
        }
        
        if (!$shippingList) {
            $log->DEBUG("发货接口没有shipping数据, ordernum:{$ordernum}");
            return 'pass';
        }

        $data['order_key'] = array(
            'order_number_type' => 2, //订单号类型 1，使用下单商户号和商户侧单号；枚举值2，使用微信支付单号
            'transaction_id' => $payInfo['transaction_id'],
            'out_trade_no' => $payInfo['ordernum'],
        );
        $data['logistics_type'] = $logisticsType;
        $data['delivery_mode'] = 1;
        if ($type == 1) { //实物发货
            $data['delivery_mode'] = $deliveryMode;
            if($deliveryMode==2){ //分拆模式必填
                $data['is_all_delivered'] = $isAllDelivered;
            }
        }
        
        $data['upload_time'] = date('Y-m-d\TH:i:sP', time());
        $data['shipping_list'] = $shippingList;
        $data['payer']['openid']=$wxminiOpenid; //用户小程序openid
    }
    if(!$data) return 'pass'; //没有数据直接跳过
    
    //虚拟发货,支付完毕后直接发货会出现订单村不存在的情况
    if($type==2) sleep(1); //延迟1秒

    $log->DEBUG("向小程序上传发货信息数据, data:" . json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    //上传发货信息
    $url = 'https://api.weixin.qq.com/wxa/sec/order/upload_shipping_info?access_token='.$access_token;
    $result = hn_curl($url, $data, 'json', 'POST', array(), 3, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    $res = json_decode($result, true);
    $log->DEBUG("小程序上传发货信息返回值信息, res:" . $result);
    if ($res['errcoe'] != 0) {
        return 'fail';
    }

    //更新订单发货信息
    $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `wxmini_shipping`=1, `logistics_type`='$logisticsType'  WHERE `ordernum` = '$ordernum'"); 
    $dsql->dsqlOper($sql, "update");

    adminLog('微信小程序上传发货信息完成', "订单号：{$payInfo['ordernum']}, 微信交易单号：{$payInfo['transaction_id']}, 用户id: {$payInfo['uid']}", $payInfo['ordertype']);
    return 'ok';
}


if(!$_GET['debug']){

    /**
     * 计算单个商品的运费
     * @param $config : 运费配置信息
     * @param $price : 单价
     * @param $count : 商品数量
     * @param $volume : 体积
     * @param $weight : 重量
     * @param $addrid : 实际为 addressid
     * @return int
     */

    function getLogisticPrice($config, $price, $count, $volume, $weight, $addrid = 0, $productid = 0, $juli = 0, $gettype = 0)
    {
        global $dsql;
        //商家配送
        $businesslogitc = $businesslogitcprice = 0;

        //平台配送及其价格
        $pslogistic = $psprice = 0;

        //快递配送
        $logistic = $logisticprice = 0;

        //错误计算
        $logisticError = "";

        if ($productid != 0) {   // 传递了商品id ( 新版本 ）

            //不规范的情况下，没有传递 addrid ，导致一些规则失效
            if ($addrid != 0) {

                $archives = $dsql->SetQuery("SELECT `lng`,`lat`,`addrid` FROM `#@__member_address` WHERE  `id` = '" . (int)$addrid . "'");

                $userAddr = $dsql->dsqlOper($archives, "results");

                $lng = $userAddr && is_array($userAddr) ? $userAddr[0]['lng'] : '';
                $lat = $userAddr && is_array($userAddr) ? $userAddr[0]['lat'] : '';
                $addrid = $userAddr && is_array($userAddr) ? $userAddr[0]['addrid'] : '';


                $addrName = getParentArr("site_area",$addrid);
                $addrIdArr = array_reverse(parent_foreach($addrName, "id"));

                $addrid = $addrIdArr[1];
            }
            if(empty($addrid)){
                return array('logistic' => 0, 'logistictype' => 0, 'logistic_errMsg'=> '');
                die(json_encode(["info"=>"request param  addrid ",'state'=>200]));
            }

            //单个商品总价
            $totalPrice = $price * $count;

            //查询运费模板，以及该商品的销售类型
            $Sql = $dsql->SetQuery("SELECT l.`id`,l.`logistic`,l.`blogistic`,l.`typesales`,s.`distribution`,s.`merchant_deliver` FROM `#@__shop_product` l LEFT JOIN `#@__shop_store` s ON l.`store`=s.`id` WHERE 1=1 AND l.`id` = '$productid'");
            $Res = $dsql->dsqlOper($Sql, "results");
            if ($Res) {
                //typesales为销售类型，4快递、3平台、2商家、1到店，多值以逗号分割。多个计费时以最低的为准。
                $typesales        = $Res[0]['typesales'];
                $blogisticid      = $Res[0]['blogistic'];  // 商家模板id
                $logisticid       = $Res[0]['logistic']; // 外卖模板id
                //如果店铺是平台配送，则 typesales 不能同时有商家自配
                if($Res[0]['distribution']){
                    $typesales = str_replace("2","3",$typesales);
                }
                //如果店铺是商家配送，则 typesales 不能同时有平台配送
                if($Res[0]['merchant_deliver']){
                    $typesales = str_replace("3","2",$typesales);
                }
                // （typesales为空时默认为4，也就是快递）
                if (empty($typesales)) {
                    $typesales = '4';
                }
                //取得销售类型列表
                $typesalesarr   = explode(',', $typesales);
                //计算商家配送模板价格
                if (in_array('2', $typesalesarr) && $blogisticid) {

                    $businesslogitc = 1;

                    $Sql = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE 1=1 AND `id` = '$blogisticid'");
                    $Res = $dsql->dsqlOper($Sql, "results");

                    if ($Res) {
                        $delivery_fee_mode  = (int)$Res[0]['delivery_fee_mode']; // { 0.固定起送费、1.按距离}
                        $express_postage    = (float)$Res[0]['express_postage']; // 固定配送费
                        $express_juli    = (float)$Res[0]['express_juli']; // 最远配送距离
                        $basicprice         = (float)$Res[0]['basicprice'];  // // 固定起送价
                        $preferentialMoney  = (float)$Res[0]['preferentialMoney'];  // 满多少元包邮

                        //按距离配送规则
                        $range_delivery_fee_value = $Res[0]['range_delivery_fee_value'] != '' ? unserialize($Res[0]['range_delivery_fee_value']) : array();

                        /*固定配送费、起送价*/
                        if ($delivery_fee_mode == 0) {

                            //小于起送价，不送
                            if($totalPrice<$basicprice){
                                $businesslogitcprice = 111001;
                                $logisticError = $basicprice;
                            }
                            //超过距离，不送
                            // if(($express_juli>0 && $juli>$express_juli) || $juli==0){
                            if(($express_juli>0 && $juli>$express_juli)){
                                $businesslogitcprice = 111002;
                                $logisticError = $express_juli;
                            }
                            //如果没触发不送规则
                            if(!$businesslogitcprice){
                                //到达免费金额？ ( 如果此项设置大于0，设置才有效）
                                if ($preferentialMoney > 0 && $totalPrice >= $preferentialMoney) {
                                    $businesslogitcprice = 0;
                                }
                                //正常价
                                else{
                                    $businesslogitcprice = $express_postage;
                                }
                            }
                        } else {
                            /*按距离*/
                            $is_business_range_delivery = false; // 标记变量，如果始终为false，则说明没有任意一个满足的距离
                            foreach ($range_delivery_fee_value as $key => $value) {
                                //寻找满足条件的运费模板
                                if ($value[0] <= $juli && $value[1] >= $juli) {
                                    //低于起送价，不送
                                    if ($totalPrice < $value[3]) {
                                        $businesslogitcprice = 111001;
                                        $logisticError = $value[3];
                                    }
                                    else{
                                        $businesslogitcprice = $value[2];  // 外送费
                                        //找到了符合的规则，并且只取第一个满足的设置（正常情况下不会有多个）
                                        $is_business_range_delivery = true;
                                        break;
                                    }
                                }
                            }
                            //没找到符合的运费规则
                            if(!$is_business_range_delivery){
                                $businesslogitcprice = 111003;
                            }
                        }
                    }
                    //运费模板不存在
                    else{
                        $businesslogitcprice = 111000;
                    }
                }

                //typesales 包含3. 如果平台配送
                if (in_array('3', $typesalesarr)){
                    //引入平台配送的相关配置
                    $pslogistic = 1;
                    global $custom_delivery_fee_mode;  //费用类型{0.固定配送费、起送费， 1.按距离}
                    global $custom_basicprice; //固定起送价
                    global $custom_express_postage; //固定配送费
                    global $custom_express_fdistance; //最远配送距离
                    global $custom_preferentialMoney; //满xxx元免配送费
                    global $custom_range_delivery_fee_value; //按距离配送列表
                    //固定配送费、起送费
                    if($custom_delivery_fee_mode==0){
                        $custom_basicprice = (float)$custom_basicprice;
                        $custom_express_fdistance = (float)$custom_express_fdistance;
                        //小于起送价，不送
                        if($custom_basicprice>0 && $totalPrice<$custom_basicprice){
                            $psprice = 111001;
                            $logisticError = $custom_basicprice;
                        }
                        //超过距离，不送
                        if(($custom_express_fdistance>0 && $juli>$custom_express_fdistance)){
                            $psprice = 111002;
                            $logisticError = $custom_express_fdistance;
                        }
                        //没有触发不送规则
                        if(!$psprice){
                            //是否到达免费金额（该设置大于0才生效）
                            if($custom_preferentialMoney >0 && $totalPrice>=$custom_preferentialMoney){
                                $psprice = 0;
                            }
                            //正常价格
                            else{
                                $psprice = $custom_express_postage;
                            }
                        }
                    }
                    //按距离
                    else{
                        //初始化距离配送设置
                        $myrang_delivery_fee_value = $custom_range_delivery_fee_value; //不直接修改全局变量，这里操作局部变量
                        $myrang_delivery_fee_value = !empty($myrang_delivery_fee_value) ? unserialize($myrang_delivery_fee_value) : array();
                        //设置flag，后续判断是否找到符合规则
                        $is_ps_range_delivery = false; // 如果没找到，则始终为false
                        foreach ($myrang_delivery_fee_value as $item){
                            //低于起送价，不送
                            if($totalPrice < $item[3]){
                                $psprice = 111001;
                                $logisticError = $item[3];
                            }
                            else{
                                if($juli>=$item[0] && $juli<=$item[1]){
                                    $psprice = $item[2]; // 外送费
                                    //找到了符合的规则，并且只取第一个满足的设置（正常情况下不会有多个）
                                    $is_ps_range_delivery = true;
                                    break;
                                }
                            }
                        }
                        //如果没找到符合的条件
                        if(!$is_ps_range_delivery){
                            $psprice = 111003;
                        }
                    }
                }

                /* typesales 为 4，则快递配送 */
                if ((in_array('4', $typesalesarr) && $logisticid)) {
                    $logistic = 1;

                    $Sql = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE 1=1 AND `id` = '$logisticid'");
                    $Res = $dsql->dsqlOper($Sql, "results");

                    if ($Res) {

                        $devspecification = !empty($Res[0]['devspecification']) ? unserialize($Res[0]['devspecification']) : $config;   //兼容老版本
                        $devspecification = $devspecification ?: array();   //兼容老版本

                        $bearFreight = $devspecification['bearFreight'];  // 是否包邮
                        $valuation   = $devspecification['valuation'];  // 计价方式{0.按件数、1.按体重、2.按体积}

                        $totalWeight = $weight * $count;  // 总重量
                        $totalVolume = $volume * $count;  // 总重量

                        // 可配送地区
                        if (array_key_exists('deliveryarea', $devspecification)) {
                            //取出该复杂配置
                            $deliveryarea = (array)$devspecification['deliveryarea'];
                            //第一个配置是，全国配送价格，特殊处理，先弹出来
                            $quanguo = array_shift($deliveryarea);
                            //尝试从其他地区选出配送费，如果没找到标记变量始终为false
                            $e_is_deliveryarea = false;
                            foreach ($deliveryarea as $key => $val){
                                //取出地区列表
                                $areaArr = $val['area'] ?: array();
                                $areaArrNew = array();
                                foreach ($areaArr as $ii){
                                    $areaArrNew[] = join(",",$ii);
                                }
                                $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                                $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                                //如果匹配到所在地区
                                if(in_array($addrid,$areaArrNew)){

                                    /* 价格计算比较复杂，设置一个计数变量  */
                                    $express_money = $val['express_postage']; // 首件、首重、首体积
                                    //按件计费
                                    if($valuation==0){
                                        //是否有续件
                                        $countObj = $count;
                                    }
                                    //按重量计费
                                    elseif($valuation==1){
                                        //是否超重
                                        $countObj = $totalWeight;
                                    }
                                    //按体积计费
                                    elseif($valuation==2){
                                        //是否超大
                                        $countObj = $totalVolume;
                                    }
                                    if($val['express_plus']){
                                        $moreCount = floor(($countObj - $val['express_start'])/$val['express_plus']);
                                        if($moreCount > 0){
                                            $express_money += $moreCount * $val['express_postageplus'];
                                        }
                                    }
                                    //找到一个匹配规则，终止
                                    $logisticprice = $express_money;
                                    $e_is_deliveryarea = true;
                                    break;
                                }
                            }
                            //如果在额外的地区没找到，默认按全国地区的价格计费
                            if(!$e_is_deliveryarea){
                                $express_money = $quanguo['express_postage']; // 首件、首重、首体积
                                //按件计费
                                if($valuation==0){
                                    //是否有续件
                                    $countObj = $count;
                                }
                                //按重量计费
                                elseif($valuation==1){
                                    //是否超重
                                    $countObj = $totalWeight;
                                }
                                //按体积计费
                                elseif($valuation==2){
                                    //是否超大
                                    $countObj = $totalVolume;
                                }
                                if($countObj && $quanguo['express_start'] && $quanguo['express_plus'] > 0){
                                    $moreCount = floor(($countObj - $quanguo['express_start'])/$quanguo['express_plus']);
                                    if($moreCount > 0){
                                        $express_money += $moreCount * $quanguo['express_postageplus'];
                                    }
                                }
                                //取得费用
                                $logisticprice = $express_money;
                            }
                        }

                        //是否满足指定包邮规则，如果是，则免费
                        if (array_key_exists('specify', $devspecification) && $devspecification['openspecify'] == 1) {
                            $specify = $devspecification['specify'] ?: array();

                            foreach ($specify as $item){
                                //优先取出地区
                                $areaArr = $item['area'] ?: array();
                                $areaArrNew = array();
                                foreach ($areaArr as $ii){
                                    $areaArrNew[] = join(",",$ii);
                                }
                                $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                                $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                                //如果地区符合
                                if(in_array($addrid,$areaArrNew)){
                                    //如果购买件数 + 最低购买金额同时满足
                                    if($count >= $item['preferentialStandard'] && $totalPrice >= $item['preferentialMoney']){
                                        //免运费
                                        $logisticprice = 0;
                                        break;
                                    }
                                }
                            }
                        }

                        //是否直接设置为包邮？如果是，则免费
                        if ($bearFreight == 1) {
                            $logisticprice = 0;
                        }

                        //是否指定不配送地区，如果在该地区，则不配送
                        if(array_key_exists('nospecify', $devspecification) && $devspecification['opennospecify'] = 1){
                            //数据原数据
                            $nospecify =  (array)$devspecification['nospecify'] ?: array();
                            $nospecify =  $nospecify[0];
                            //取得地区...
                            $areaArr = $nospecify['area'] ?: array();
                            $areaArrNew = array();
                            foreach ($areaArr as $ii){
                                $areaArrNew[] = join(",",$ii);
                            }
                            $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                            $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                            //在不被配送的地区
                            if(in_array($addrid,$areaArrNew)){
                                $logisticprice = 111004;
                            }
                        }
                    }
                    // 运费模板不存在
                    else {
                        $logisticprice = 111000;
                    }
                }

                /*     多个计费方式，取最小值（已知商家配送 和 平台配送之间，二选一）      */

                $finalprice = 0; // 最终金额
                $logistictype = 0; //最终金额（0.快递、 1.商家、 2.平台）

                //快递 + 商家配送
                if($logistic && $businesslogitc){
                    //商家配送更优惠
                    if ((float)$businesslogitcprice <= (float)$logisticprice) {
                        $finalprice   = $businesslogitcprice;
                        $logistictype = 1;
                    }
                    //快递配送更优惠
                    else {
                        $finalprice = $logisticprice;
                        $logistictype = 0;
                    }
                }
                //快递 + 平台
                elseif($logistic && $pslogistic){
                    //平台配送更优惠
                    if ((float)$psprice <= (float)$logisticprice) {
                        $finalprice   = $psprice;
                        $logistictype = 2;
                    }
                    //快递配送更优惠
                    else {
                        $finalprice = $logisticprice;
                        $logistictype = 0;
                    }
                }
                //仅快递
                elseif($logistic){
                    $finalprice = $logisticprice;
                    $logistictype = 0;
                }
                //仅商家
                elseif($businesslogitc){
                    $finalprice = $businesslogitcprice;
                    $logistictype = 1;
                }
                //仅平台
                elseif($pslogistic){
                    $finalprice = $psprice;
                    $logistictype = 2;
                }
                //出错啦
                else{
                    $finalprice = 999999;
                    $logistictype = -1;
                }

                // 仅返回金额
                if ($gettype == 0) {
                    return $finalprice;
                }
                // 返回金额 + 配送方式 + 错误信息等
                else {
                    $logistic_errType = array(
                        111000=>"运费模板不存在",
                        111001=>"订单金额未达到商家配送要求，起送价为".$logisticError.echoCurrency(array('type' => 'short')),
                        111002=>"收货地址超出最远配送距离(".$logisticError."公里内)",
                        111003=>"不在配送规则内",
                        111004=>"指定不配送的地区",
                        999999=>"运费模板配置错误"
                    );
                    $logistic_errMsg = $logistic_errType[$finalprice] ?: "";
                    if($logistic_errMsg){
                        $finalprice = 0;
                    }
                    return array('logistic' => $finalprice, 'logistictype' => $logistictype,'logistic_errMsg'=>$logistic_errMsg);
                }
            }
        } else {
            /*兼容老版本*/

            $bearFreight = $config['bearFreight'];
            $valuation   = $config['valuation'];

            $specify = array();
            if (array_key_exists('specify', $config) && $config['openspecify'] == 1) {

                $specify = $config['specify'];
            }


            //    $express_start = $config['express_start'];
            //    $express_postage = $config['express_postage'];
            //    $express_plus = $config['express_plus'];
            //    $express_postageplus = $config['express_postageplus'];
            //    $preferentialStandard = $config['preferentialStandard'];
            //    $preferentialMoney = $config['preferentialMoney'];

            if ($bearFreight == 1) {
                return 0;
            }

            //总价
            $totalPrice = $price * $count;

            $logistic = 0;

            //计费对象
            $obj    = $count;
            $ncount = $count;

            //按重量
            if ($valuation == 1) {
                $obj    = $weight * $count;
                $ncount = $count * $weight;

                //按体积
            } elseif ($valuation == 2) {
                $obj    = $volume * $count;
                $ncount = $count * $volume;
            }

            if (array_key_exists('deliveryarea', $config)) {

                $cityidarr = array_column($config['deliveryarea'], 'cityid');

                $deliveryareacityid = !empty($cityidarr) ? join(',', $cityidarr) : '';

                $deliveryareacityidarr = explode(",", $deliveryareacityid);

                if (!in_array($addrid, $deliveryareacityidarr)) {

                    $logistic += $config['deliveryarea'][0]['express_postage'];

                    //续加
                    if ($config['deliveryarea'][0]['express_start'] > 0) {
                        $postage = $obj - $config['deliveryarea'][0]['express_start'];
                        if ($postage > 0 && $config['deliveryarea'][0]['express_plus'] > 0) {
                            $logistic += floor($postage / $config['deliveryarea'][0]['express_plus']) * $config['deliveryarea'][0]['express_postageplus'];
                        }
                    }
                } else {

                    foreach ($config['deliveryarea'] as $a => $b) {
                        $ctyid = $b['cityid'] != '' ? explode(',', $b['cityid']) : array('0' => 0);

                        if (in_array($addrid, $ctyid)) {

                            //默认运费
                            $logistic += $b['express_postage'];

                            //续加
                            if ($b['express_start'] > 0) {
                                $postage = $obj - $b['express_start'];
                                if ($postage > 0 && $b['express_plus'] > 0) {
                                    $logistic += floor($postage / $b['express_plus']) * $b['express_postageplus'];
                                }
                            }


                            break;
                        }
                    }
                }
            }


            //免费政策
            if ($specify) {
                foreach ($specify as $k => $v) {
                    $ctyid = $v['cityid'] != '' ? explode(',', $v['cityid']) : array();

                    if (in_array($addrid, $ctyid)) {

                        if (!empty($v['preferentialStandard']) && $ncount >= $v['preferentialStandard'] && !empty($v['preferentialMoney']) && $totalPrice >= $v['preferentialMoney']) {
                            $logistic = 0;
                        } elseif (($v['preferentialStandard'] > 0 && $ncount >= $v['preferentialStandard'] && $v['preferentialMoney'] == 0) || ($v['preferentialMoney'] > 0 && $totalPrice >= $v['preferentialMoney'] && $v['preferentialStandard'] == 0)) {
                            $logistic = 0;
                        }
                        break;
                    }
                }
            }

            return $logistic;
            /*兼容老版本*/
        }
    }


    /**
     * 合并订单运费，一个订单只需要一次运费 （本方法只负责简单的合并运费，多种配送方式对比，请调用getLogisticPrice方法）
     * @param $data : 订单信息  参考：shop.controller confirm-order
     * @return array  array('店铺ID' => 运费, '店铺ID' => 运费)
     */
    function calculationOrderLogistic($config, $addridarr, $addressid = 0,$param=array())
    {
        global $dsql;
        //快递类型订单列表
        $logisticArr = array();
        $logisticType = 0;

        //商家配送类型列表
        $arrlogistic = array();
        $arrlogisticType = 0;

        //平台配送类型列表
        $pslogistic    = array();
        $pslogisticType = 0;

        $returnType = $param['returnType'];

        //错误信息（如果合并了，则必定为同商家，此时错误信息重置）
        $error = array();

        //店铺发货 与 下单地址距离
        $julis = array();
        if ($addressid != 0) {

            $archives = $dsql->SetQuery("SELECT `lng`,`lat`,`addrid` FROM `#@__member_address` WHERE  `id` = '" . (int)$addressid . "'");

            $userAddr = $dsql->dsqlOper($archives, "results");

            $lng = $userAddr && is_array($userAddr) ? $userAddr[0]['lng'] : '';
            $lat = $userAddr && is_array($userAddr) ? $userAddr[0]['lat'] : '';
            $addrid = $userAddr && is_array($userAddr) ? $userAddr[0]['addrid'] : '';

            $addrName = getParentArr("site_area",$addrid);
            $addrIdArr = array_reverse(parent_foreach($addrName, "id"));

            $addrid = $addrIdArr[1];
        }

        $resData = array();

        /*       返回数据格式：  按相同商家sid  -->  相同模板tid  -->  商品列表pid
                 平台类型，比较特殊，没有模板id
        */

        foreach ($config as $key => $val) {  // 遍历商家
            $juli     = oldgetDistance($lng, $lat, $val['lng'], $val['lat']) / 1000;
            $julis[$val['sid']] = $juli;

            foreach ($val['list'] as $k => $v) {  // 遍历订单
//                //商家配送
                $typesalesarr = explode(",",$v['typesales']);
                //只有商家（或平台） 或 只有快递  ----------  只有一种配送方式，暂时记录为可合并的大订单（同一个商家、同一个模板、同一种配送方式，则进行合并）
                if((!in_array(4,$typesalesarr) && !in_array(0,$typesalesarr)) || ($v['typesales']==4 && is_numeric($v['typesales']))){
                    //如果只是快递
                    if($v['typesales']==4 && is_numeric($v['typesales'])){
                        $logisticType = 1;
                        $logisticArr[$val['sid']][$v['logisticId']][$v['id']] = $v;
                    }
                    //平台或商家
                    else{
                        //如果是商家
                        if($v['logistictype']==1){
                            $arrlogisticType = 1;
                            $arrlogistic[$val['sid']][$v['blogisticId']][$v['id']] = $v;
                        }
                        //如果是平台
                        if($v['logistictype']==2){
                            $pslogisticType = 1;
                            $pslogistic[$val['sid']][$v['id']] = $v;
                        }
                    }
                }
                //多种配送方式？ 暂无法合并处理
                else{
                    //在不合并运费模板的情况，直接累计金额
                    // $resData[$val['sid']] = (float)$resData[$val['sid']] + (float)$v['logistic'];
                    
                    //多种配送方式优先用商家配送的计算，如果买家地址超出模板设置的配送范围则按快递收费
                    
                    //平台配送
                    $pslogisticType = in_array('3', $typesalesarr) ? 1 : 0;
                    $pslogistic[$val['sid']][$v['id']] = $v;
                    
                    //快递配送
                    //不判断blogisticId的原因是：如果优先以商家配送，但是快递的相对又便宜时，就违背了为用户考虑的原则。
                    //这里暂时两种情况都考虑，到下面再分别计算各自的价格，最后再根据价格低的入选
                    // $logisticType = in_array('2', $typesalesarr) && $v['blogisticId'] ? 0 : 1;
                    $logisticType = in_array('4', $typesalesarr);
                    $logisticArr[$val['sid']][$v['logisticId']][$v['id']] = $v;
                    
                    //商家配送
                    // $arrlogisticType = in_array('2', $typesalesarr) && $v['blogisticId'] ? 1 : 0;
                    $arrlogisticType = in_array('2', $typesalesarr);
                    $arrlogistic[$val['sid']][$v['blogisticId']][$v['id']] = $v;
                }

            }
        }

        //存储每个配置方式的价格，用于最终的价格对比，选用最低价
        $pslogisticPriceArr = $logisticPriceArr = $arrlogisticPriceArr = array();

        //平台配送大订单？
        if($pslogisticType){
            $error = [];  //恢复错误信息
            foreach ($pslogistic as $k=>$v){// $v 是商家
                $juli = $julis[$k];
                //实际只有一个商品id，则不需要重新计算
                //只有一个时也需要计算，免费时没有问题，需要运费时会出现运费为0的问题 by gz 20220823
                if(count($v)<=0){
                    // $resData[$k] += (float)$v[key($v)]['logistic'];
                    $pslogisticPriceArr[$k] += (float)$v[key($v)]['logistic'];
                }
                else{
                    /*   计算多个商品合并后商家配送运费   */
                    $allPrice = $allCount = $allWeight = $allVolume = 0;
                    foreach ($v as $kk=>$vv){
                        //合并订单总费用（订单原始总费用）
                        $allPrice += ($vv['mprice'] ? $vv['mprice'] : $vv['price']) * $vv['count'];  //price是计算过会员折扣的，mprice是没有计算会员折扣的
                        //合并总数量、总体积、总重量
                        $allCount += $vv['count'];
                        $allWeight += $vv['weight'] * $vv['count'];
                        $allVolume += $vv['volume'] * $vv['count'];
                    }
                    //引入平台配送的相关配置
                    global $custom_delivery_fee_mode;  //费用类型{0.固定配送费、起送费， 1.按距离}
                    global $custom_basicprice; //固定起送价
                    global $custom_express_postage; //固定配送费
                    global $custom_express_fdistance; //最远配送距离
                    global $custom_preferentialMoney; //满xxx元免配送费
                    global $custom_range_delivery_fee_value; //按距离配送列表
                    
                    //固定配送费、起送费
                    if($custom_delivery_fee_mode==0){
                        $custom_basicprice = (float)$custom_basicprice;
                        $custom_express_fdistance = (float)$custom_express_fdistance;
                        //小于起送价，不送
                        if($custom_basicprice>0 && $allPrice<$custom_basicprice){
                            $psprice = 111001;
                            $logisticError = $custom_basicprice;
                            
                            //平台送不了的，用快递
                            $logisticArr[$k][$v[key($v)]['logisticId']][key($v)] = $v;
                        }
                        //超过距离，不送
                        if(($custom_express_fdistance>0 && $juli>$custom_express_fdistance)){
                            $psprice = 111002;
                            $logisticError = $custom_express_fdistance;
                            
                            //平台送不了的，用快递
                            $logisticArr[$k][$v[key($v)]['logisticId']][key($v)] = $v;
                        }
                        //没有触发不送规则
                        if(!$psprice){
                            //是否到达免费金额（该设置大于0才生效）
                            if($custom_preferentialMoney >0 && $allPrice>=$custom_preferentialMoney){
                                $psprice = 0;
                            }
                            //正常价格
                            else{
                                $psprice = $custom_express_postage;
                            }
                        }
                    }
                    //按距离
                    else{
                        //初始化距离配送设置
                        $myrang_delivery_fee_value = $custom_range_delivery_fee_value; //不直接修改全局变量，这里操作局部变量
                        $myrang_delivery_fee_value = !empty($myrang_delivery_fee_value) ? unserialize($myrang_delivery_fee_value) : array();
                        //设置flag，后续判断是否找到符合规则
                        $is_ps_range_delivery = false; // 如果没找到，则始终为false
                        foreach ($myrang_delivery_fee_value as $item){
                            //低于起送价，不送
                            if($allPrice < $item[3]){
                                $psprice = 111001;
                                $logisticError = $item[3];
                            
                                //平台送不了的，用快递
                                $logisticArr[$k][$v[key($v)]['logisticId']][key($v)] = $v;
                            }
                            else{
                                if($juli>=$item[0] && $juli<=$item[1]){
                                    $psprice = $item[2]; // 外送费
                                    //找到了符合的规则，并且只取第一个满足的设置（正常情况下不会有多个）
                                    $is_ps_range_delivery = true;
                                    break;
                                }
                            }
                        }
                        //如果没找到符合的条件
                        if(!$is_ps_range_delivery){
                            $psprice = 111003;
                            
                            //平台送不了的，用快递
                            $logisticArr[$k][$v[key($v)]['logisticId']][key($v)] = $v;
                        }
                    }
                    // $resData[$k] += (float)$psprice;
                    $pslogisticPriceArr[$k] += (float)$psprice;
                    //商品是否错误
                    $logistic_errType = array(
                        111000=>"运费模板不存在",
                        111001=>"订单金额未达到商家配送要求，起送价为".$logisticError.echoCurrency(array('type' => 'short')),
                        111002=>"收货地址超出最远配送距离(".$logisticError."公里内)",
                        111003=>"不在配送规则内",
                        111004=>"指定不配送的地区"
                    );
                    //覆盖商家错误信息
                    $error[$k] = $logistic_errType[$psprice] ?: "";
                }
                //其中一个商品错误，则商家配送金额显示0
                if($error[$k]){
                    // $resData[$k] = 0;
                    $pslogisticPriceArr[$k] = 999999999;
                }
            }
        }

        //商家配送大订单？
        if($arrlogisticType){
            $error = [];  //恢复错误信息
            foreach ($arrlogistic as $k=>$v){// $v 是商家
                $juli = $julis[$k];
                foreach ($v as $key=>$val){ // $val 是模板下的订单列表
                    //实际只有一个商品id，则不需要重新计算
                    //只有一个时也需要计算，免费时没有问题，需要运费时会出现运费为0的问题 by gz 20220823
                    if(count($val)<=0){
                        // $resData[$k] += (float)$val[key($val)]['logistic'];
                        $logisticPriceArr[$k] += (float)$val[key($val)]['logistic'];
                    }
                    else{
                        /*   计算多个商品合并后商家配送运费   */
                        $allPrice = $allCount = $allWeight = $allVolume = 0;
                        foreach ($val as $kk=>$vv){
                            //合并订单总费用（订单原始总费用）
                            $allPrice += ($vv['mprice'] ? $vv['mprice'] : $vv['price']) * $vv['count'];  //price是计算过会员折扣的，mprice是没有计算会员折扣的
                            //合并总数量、总体积、总重量
                            $allCount += $vv['count'];
                            $allWeight += $vv['weight'] * $vv['count'];
                            $allVolume += $vv['volume'] * $vv['count'];
                        }
                        //取出运费模板中的具体信息
                        $Sql = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE 1=1 AND `id` = '$key'");
                        $Res = $dsql->dsqlOper($Sql, "results");

                        if ($Res) {
                            $delivery_fee_mode  = (int)$Res[0]['delivery_fee_mode']; // { 0.固定起送费、1.按距离}
                            $express_postage    = (float)$Res[0]['express_postage']; // 固定配送费
                            $express_juli    = (float)$Res[0]['express_juli']; // 最远配送距离
                            $basicprice         = (float)$Res[0]['basicprice'];  // // 固定起送价
                            $preferentialMoney  = (float)$Res[0]['preferentialMoney'];  // 满多少元包邮

                            //按距离配送规则
                            $range_delivery_fee_value = $Res[0]['range_delivery_fee_value'] != '' ? unserialize($Res[0]['range_delivery_fee_value']) : array();

                            /*固定配送费、起送价*/
                            if ($delivery_fee_mode == 0) {

                                //小于起送价，不送
                                if($allPrice<$basicprice){
                                    $businesslogitcprice = 111001;
                                    $logisticError = $basicprice;
                                }
                                //超过距离，不送
                                // if(($express_juli>0 && $juli>$express_juli) || $juli==0){
                                if(($express_juli>0 && $juli>$express_juli)){
                                    $businesslogitcprice = 111002;
                                    $logisticError = $express_juli;
                                    
                                    $logisticType = 1;
                                }
                                //如果没触发不送规则
                                if(!$businesslogitcprice){
                                    //到达免费金额？ ( 如果此项设置大于0，设置才有效）
                                    if ($preferentialMoney > 0 && $allPrice >= $preferentialMoney) {
                                        $businesslogitcprice = 0;
                                    }
                                    //正常价
                                    else{
                                        $businesslogitcprice = $express_postage;
                                    }
                                }
                            } else {
                                /*按距离*/
                                $is_business_range_delivery = false; // 标记变量，如果始终为false，则说明没有任意一个满足的距离
                                foreach ($range_delivery_fee_value as $key2 => $value2) {
                                    //寻找满足条件的运费模板
                                    if ($value2[0] <= $juli && $value2[1] >= $juli) {
                                        //低于起送价，不送
                                        if ($allPrice < $value2[3]) {
                                            $businesslogitcprice = 111001;
                                            $logisticError = $value2[3];
                                        }
                                        else{
                                            $businesslogitcprice = $value2[2];  // 外送费
                                            //找到了符合的规则，并且只取第一个满足的设置（正常情况下不会有多个）
                                            $is_business_range_delivery = true;
                                            break;
                                        }
                                    }
                                }
                                //没找到符合的运费规则
                                if(!$is_business_range_delivery){
                                    $businesslogitcprice = 111003;
                                }
                            }
                        }
                        //运费模板不存在
                        else{
                            $businesslogitcprice = 111000;
                        }
                        // $resData[$k] += (float)$businesslogitcprice;
                        $logisticPriceArr[$k] += (float)$businesslogitcprice;
                        //商品是否错误
                        $logistic_errType = array(
                            111000=>"运费模板不存在",
                            111001=>"订单金额未达到商家配送要求，起送价为".$logisticError.echoCurrency(array('type' => 'short')),
                            111002=>"收货地址超出最远配送距离(".$logisticError."公里内)",
                            111003=>"不在配送规则内",
                            111004=>"指定不配送的地区"
                        );
                        //覆盖商家错误信息
                        $error[$k] = $logistic_errType[$businesslogitcprice] ?: "";
                    }
                }
                //其中一个商品错误，则商家配送金额显示0
                if($error[$k]){
                    // $resData[$k] = 0;
                    $logisticPriceArr[$k] = 999999999;
                }
            }
        }

        //快递类是否有大订单？
        if($logisticType){
            $error = [];  //恢复错误信息
            foreach ($logisticArr as $k=>$v){  // $v 是商家
                $juli = $julis[$k];
                foreach ($v as $key=>$val){ // $val 是模板下的订单列表
                    //实际只有一个商品id，则不需要重新计算
                    //只有一个时也需要计算，免费时没有问题，需要运费时会出现运费为0的问题 by gz 20220823
                    if(count($val)<=0){
                        $__price = (float)(is_array($val[key($val)]['logistic']) ? $val[key($val)]['logistic']['logistic'] : $val[key($val)]['logistic']);
                        // $resData[$k] += $__price;
                        $arrlogisticPriceArr[$k] += $__price;
                    }
                    //确实有多个商品ID
                    else{
                        $logisticError = "";
                        /*   计算多个商品合并后商家配送运费   */
                        $allPrice = $allCount = $allWeight = $allVolume = 0;
                        foreach ($val as $kk=>$vv){
                            //合并订单总费用（订单原始总费用）
                            $allPrice += ($vv['mprice'] ? $vv['mprice'] : $vv['price']) * $vv['count'];  //price是计算过会员折扣的，mprice是没有计算会员折扣的
                            //合并总数量、总体积、总重量
                            $allCount += $vv['count'];
                            $allWeight += $vv['weight'] * $vv['count'];
                            $allVolume += $vv['volume'] * $vv['count'];
                        }
                        //取出运费模板中的具体信息
                        $Sql = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE 1=1 AND `id` = '$key'");
                        $Res = $dsql->dsqlOper($Sql, "results");
                        if ($Res) {
                            
                            $devspecification = !empty($Res[0]['devspecification']) ? unserialize($Res[0]['devspecification']) : $Res[0];   //兼容老版本
                            
                            $bearFreight = $devspecification['bearFreight'];  // 是否包邮
                            $valuation   = $devspecification['valuation'];  // 计价方式{0.按件数、1.按体重、2.按体积}

                            // 可配送地区
                            if (array_key_exists('deliveryarea', $devspecification)) {
                                //取出该复杂配置
                                $deliveryarea = (array)$devspecification['deliveryarea'];
                                //第一个配置是，全国配送价格，特殊处理，先弹出来
                                $quanguo = array_shift($deliveryarea);
                                //尝试从其他地区选出配送费，如果没找到标记变量始终为false
                                $e_is_deliveryarea = false;
                                foreach ($deliveryarea as $key2 => $val2){
                                    //取出地区列表
                                    $areaArr = $val2['area'] ?: array();
                                    $areaArrNew = array();
                                    foreach ($areaArr as $ii){
                                        $areaArrNew[] = join(",",$ii);
                                    }
                                    $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                                    $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                                    //如果匹配到所在地区
                                    if(in_array($addrid,$areaArrNew)){

                                        /* 价格计算比较复杂，设置一个计数变量  */
                                        $express_money = $val2['express_postage']; // 首件、首重、首体积
                                        //按件计费
                                        if($valuation==0){
                                            //是否有续件
                                            $countObj = $allCount;
                                        }
                                        //按重量计费
                                        elseif($valuation==1){
                                            //是否超重
                                            $countObj = $allWeight;
                                        }
                                        //按体积计费
                                        elseif($valuation==2){
                                            //是否超大
                                            $countObj = $allVolume;
                                        }
                                        if($val2['express_plus']){
                                            $moreCount = floor(($countObj - $val2['express_start'])/$val2['express_plus']);
                                            if($moreCount > 0){
                                                $express_money += $moreCount * $val2['express_postageplus'];
                                            }
                                        }
                                        //找到一个匹配规则，终止
                                        $logisticprice = $express_money;
                                        $e_is_deliveryarea = true;
                                        break;
                                    }
                                }
                                //如果在额外的地区没找到，默认按全国地区的价格计费
                                if(!$e_is_deliveryarea){
                                    $express_money = $quanguo['express_postage']; // 首件、首重、首体积
                                    //按件计费
                                    if($valuation==0){
                                        //是否有续件
                                        $countObj = $allCount;
                                    }
                                    //按重量计费
                                    elseif($valuation==1){
                                        //是否超重
                                        $countObj = $allWeight;
                                    }
                                    //按体积计费
                                    elseif($valuation==2){
                                        //是否超大
                                        $countObj = $allVolume;
                                    }
                                    if($quanguo['express_plus']){
                                        $moreCount = floor(($countObj - $quanguo['express_start'])/$quanguo['express_plus']);
                                        if($moreCount > 0){
                                            $express_money += $moreCount * $quanguo['express_postageplus'];
                                        }
                                    }
                                    //取得费用
                                    $logisticprice = $express_money;
                                }
                            }

                            //是否满足指定包邮规则，如果是，则免费
                            if (array_key_exists('specify', $devspecification) && $devspecification['openspecify'] == 1) {
                                $specify = $devspecification['specify'] ?: array();

                                foreach ($specify as $item){
                                    //优先取出地区
                                    $areaArr = $item['area'] ?: array();
                                    $areaArrNew = array();
                                    foreach ($areaArr as $ii){
                                        $areaArrNew[] = join(",",$ii);
                                    }
                                    $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                                    $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                                    //如果地区符合
                                    if(in_array($addrid,$areaArrNew)){
                                        //如果购买件数 + 最低购买金额同时满足
                                        if($allCount >= $item['preferentialStandard'] && $allPrice >= $item['preferentialMoney']){
                                            //免运费
                                            $logisticprice = 0;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            //是否直接设置为包邮？如果是，则免费
                            if ($bearFreight == 1) {
                                $logisticprice = 0;
                            }

                            //是否指定不配送地区，如果在该地区，则不配送
                            if(array_key_exists('nospecify', $devspecification) && $devspecification['opennospecify'] = 1){
                                //数据原数据
                                $nospecify =  (array)$devspecification['nospecify'] ?: array();
                                $nospecify =  $nospecify[0];
                                //取得地区...
                                $areaArr = $nospecify['area'] ?: array();
                                $areaArrNew = array();
                                foreach ($areaArr as $ii){
                                    $areaArrNew[] = join(",",$ii);
                                }
                                $areaArrNew = array_unique(explode(",",join(",",$areaArrNew)));
                                $areaArrNew = $areaArrNew==array("") ? array("-1") : $areaArrNew;
                                //在不被配送的地区
                                if(in_array($addrid,$areaArrNew)){
                                    $logisticprice = 111004;
                                }
                            }
                        }
                        // 运费模板不存在
                        else {
                            $logisticprice = 111000;
                        }
                        // $resData[$k] += (float)$logisticprice;
                        $arrlogisticPriceArr[$k] += (float)$logisticprice;
                        //商品是否错误
                        $logistic_errType = array(
                            111000=>"运费模板不存在",
                            111001=>"订单金额未达到商家配送要求，起送价为".$logisticError.echoCurrency(array('type' => 'short')),
                            111002=>"收货地址超出最远配送距离(".$logisticError."公里内)",
                            111003=>"不在配送规则内",
                            111004=>"指定不配送的地区"
                        );
                        //如果上一个商品的运费有问题，则继续显示上次的错误
                        $error[$k] = $error[$k] ? $error[$k] : ($logistic_errType[$logisticprice] ?: "");
                    }
                }
                //其中一个商品错误，则商家配送金额显示0
                if($error[$k]){
                    // $resData[$k] = 0;
                    $arrlogisticPriceArr[$k] = 999999999;
                }
            }
        }

        //比对所有配送方式提供的价格，并从中选中最低价
        foreach ($config as $key => $val) {
            $_key = $val['sid'];
            $_price = array();
            if(array_key_exists($_key, $pslogisticPriceArr)){
                array_push($_price, $pslogisticPriceArr[$_key]);
            }
            if(array_key_exists($_key, $logisticPriceArr)){
                array_push($_price, $logisticPriceArr[$_key]);
            }
            if(array_key_exists($_key, $arrlogisticPriceArr)){
                array_push($_price, $arrlogisticPriceArr[$_key]);
            }
            $resData[$_key] = $_price ? min($_price) : 0;
        }
        
        //返回数组
        if($returnType==1){
            return array('error'=>$error,"data"=>$resData);
        }
        //原样返回
        else {
            return $resData;
        }
    }

    function getLogistic($config, $price, $count, $volume, $weight, $addrid = 0, $logisticid, $juli = 0, $gettype = 0)
    {
        global $dsql;

        if (empty($typesales)) {
            $typesales = '4';
        }
        $typesalesarr   = $typesales;
        /*快递配送*/
        $logistic = 1;
        $Sql = $dsql->SetQuery("SELECT * FROM `#@__shop_logistictemplate` WHERE 1=1 AND `id` = '$logisticid'");
        $Res = $dsql->dsqlOper($Sql, "results");

        if ($Res) {

            // $devspecification = !empty($Res[0]['devspecification'])? unserialize($Res[0]['devspecification']) : array();

            $devspecification = !empty($Res[0]['devspecification']) ? unserialize($Res[0]['devspecification']) : $config;   //兼容老版本
            $bearFreight  = $devspecification['bearFreight'];
            $valuation   = $devspecification['valuation'];
            $specify = array();
            if (array_key_exists('specify', $devspecification) && $devspecification['openspecify'] == 1) {

                $specify = $devspecification['specify'];
            }

            if ($bearFreight == 1) {
                return 0;
            }

            //总价
            $totalPrice = $price * $count;

            // $logisticprice = 999999;

            $logisticprice = 0;
            //计费对象
            $obj    = $count;
            $ncount = $count;

            //按重量
            if ($valuation == 1) {
                $obj    = $weight * $count;
                $ncount = $count * $weight;

                //按体积
            } elseif ($valuation == 2) {
                $obj    = $volume * $count;
                $ncount = $count * $volume;
            }
            if (array_key_exists('deliveryarea', $devspecification)) {

                $cityidarr = array_column($devspecification['deliveryarea'], 'cityid');
                $deliveryareacityid = !empty($cityidarr) ? join(',', $cityidarr) : '';

                $deliveryareacityidarr = explode(",", $deliveryareacityid);
                if (!in_array($addrid, $deliveryareacityidarr)) {
                    $logisticprice += $devspecification['deliveryarea'][0]['express_postage'];
                    //续加
                    if ($devspecification['deliveryarea'][0]['express_start'] > 0) {
                        $postage = $obj - $devspecification['deliveryarea'][0]['express_start'];
                        if ($postage > 0 && $devspecification['deliveryarea'][0]['express_plus'] > 0) {
                            $logisticprice += floor($postage / $devspecification['deliveryarea'][0]['express_plus']) * $devspecification['deliveryarea'][0]['express_postageplus'];
                        }
                    }
                } else {

                    foreach ($devspecification['deliveryarea'] as $a => $b) {
                        $ctyid = $b['cityid'] != '' ? explode(',', $b['cityid']) : array('0' => 0);

                        if (in_array($addrid, $ctyid)) {

                            //默认运费
                            $logisticprice += $b['express_postage'];

                            //续加
                            if ($b['express_start'] > 0) {
                                $postage = $obj - $b['express_start'];
                                if ($postage > 0 && $b['express_plus'] > 0) {
                                    $logisticprice += floor($postage / $b['express_plus']) * $b['express_postageplus'];
                                }
                            }


                            break;
                        }
                    }
                }
            }


            //免费政策
            if ($specify) {
                foreach ($specify as $k => $v) {
                    $ctyid = $v['cityid'] != '' ? explode(',', $v['cityid']) : array();

                    if (in_array($addrid, $ctyid)) {

                        if (!empty($v['preferentialStandard']) && $ncount >= $v['preferentialStandard'] && !empty($v['preferentialMoney']) && $totalPrice >= $v['preferentialMoney']) {
                            $logisticprice = 0;
                        } elseif (($v['preferentialStandard'] > 0 && $ncount >= $v['preferentialStandard'] && $v['preferentialMoney'] == 0) || ($v['preferentialMoney'] > 0 && $totalPrice >= $v['preferentialMoney'] && $v['preferentialStandard'] == 0)) {
                            $logisticprice = 0;
                        }
                        break;
                    }
                }
            }
        }
        $finalprice = $logisticprice;

        if ($gettype == 0) {
            return $finalprice;
        } else {
            return array('logistic' => $finalprice, 'logistictype' => $logistictype);
        }
    }

}