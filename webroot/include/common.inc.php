<?php
/**
 * 系统核心配置文件
 *
 * @version        $Id: common.inc.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Libraries
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
ob_start();
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);

// xhprof
// xhprof_enable();
// $XHPROF_ROOT = realpath(dirname(__FILE__) .'/../xhprof');
// include_once $XHPROF_ROOT . "/xhprof_lib/utils/xhprof_lib.php";
// include_once $XHPROF_ROOT . "/xhprof_lib/utils/xhprof_runs.php";
// $xhprof_runs = new XHProfRuns_Default();

//系统全局变量
define('HUONIAOINC', str_replace("\\", '/', dirname(__FILE__) ) );         //当前目录
define('HUONIAOROOT', str_replace("\\", '/', substr(HUONIAOINC,0,-8) ) );  //根目录
define('HUONIAODATA', HUONIAOROOT.'/data');                                //系统配置目录
define('sysBtime', microtime(true));
define("ARTICLE_TABLE_SIZE", 100000);

//软件摘要信息
$cfg_softname     = '火鸟网站管理系统';              //软件中文名
$cfg_soft_enname  = 'HuoNiaoCMS';                  //软件英文名
$cfg_soft_devteam = 'HuoNiaoCMS官方团队';           //软件团队名
$cfg_soft_lang    = 'utf-8';                       //软件语言

header("Content-Type: text/html; charset={$cfg_soft_lang}");
header('Cache-Control: private');  //指定浏览器请求和响应遵循的缓存机制
// header('X-Frame-Options: SAMEORIGIN');  //页面只能被本站页面嵌入到iframe或者frame中。开启后将影响多域名同步登录功能

//扩展验证
if(!extension_loaded('swoole_loader')){
    die('请先安装火鸟PHP扩展！<br />安装教程：<a href="https://help.kumanyun.com/help-2-775.html" target="_blank">https://help.kumanyun.com/help-2-775.html</a>');
}

//PHP版本限制
if(version_compare(PHP_VERSION,'7.4','<')){
    die("<center><br /><br />请将PHP版本升级到7.4！</center>");
}elseif(version_compare(PHP_VERSION,'7.5','>=')){
    die("<center><br /><br />请将PHP版本切换到7.4！</center>");
}

// 定义全局变量
$_G = [];

if(!defined('HUONIAOADMIN')) {
	define('HUONIAOADMIN', "");
}

//系统基本配置信息
$cacheConfigFile = HUONIAODATA . '/cache/config.php';
if(file_exists($cacheConfigFile) && !HUONIAOADMIN){
    include_once($cacheConfigFile);
}
else{
    include_once(HUONIAOINC.'/config/siteConfig.inc.php');    //系统配置参数
    include_once(HUONIAOINC.'/config/pointsConfig.inc.php');  //会员积分配置
    include_once(HUONIAOINC.'/config/member.inc.php');  //会员配置参数
    include_once(HUONIAOINC.'/config/business.inc.php');  //会员配置参数
    include_once(HUONIAOINC.'/config/wechatConfig.inc.php');  //微信基本配置
    include_once(HUONIAOINC.'/config/settlement.inc.php');    //会员结算配置
    include_once(HUONIAOINC.'/config/qiandaoConfig.inc.php'); //签到规则配置
    @include_once(HUONIAOINC.'/config/fenxiaoConfig.inc.php'); //分销配置
    @include_once(HUONIAOINC.'/config/privatenumberConfig.inc.php'); //隐私保护通话配置
    @include_once(HUONIAOINC.'/config/payPhoneConfig.inc.php'); //付费查看电话配置
    @include_once(HUONIAOINC.'/config/siteCityAdvanced.inc.php'); //付费查看电话配置
}

if (empty($cfg_basehost) || $cfg_basehost === '~domain') {
    $cfg_basehost = 'fbird.men';
}

define('HUONIAOBUG', (int)$cfg_siteDebug); //开启调试
ini_set('display_errors', $cfg_siteDebug ? 'On' : 'Off'); //Debug设置

//新版本不支持cookie作用域和隐藏附件真实路径自定义
$cfg_cookiePre = 'HN_';

//通过user-agent屏蔽访问
if($cfg_maliciousSplider){
	$maliciousSplider = explode('|', $cfg_maliciousSplider);

	$isMaliciousSplider = false;
	$userAgent = strtolower($_SERVER['HTTP_USER_AGENT']);
	if($userAgent){
		foreach($maliciousSplider as $k => $v){
			$v = strtolower($v);
			// 有浏览器标识不作为爬虫
			if(!empty($v) && (strstr($v,$userAgent) || strstr($userAgent,$v))){
				$isMaliciousSplider = true;
				break;
			}
		}
	}

	//阻止userAgent为空的请求，排除易联云打印机验证
    elseif(!strstr($_SERVER["REQUEST_URI"], 'printReport') && !strstr($_SERVER["PHP_SELF"], 'cron') && !strstr($_SERVER["HTTP_HOST"], $cfg_basehost)){
	    $isMaliciousSplider = true;
	}

	if($isMaliciousSplider){
		header('HTTP/1.0 403 Forbidden');
		echo '<title>403 Forbidden</title>';
		echo '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover">';
		echo '<h1><center>403 Forbidden</center></h1>';
		echo '<hr><center>By Huoniao CMS</center>';
		die;
	}
}

//安全协议
$cfg_secureAccess = $cfg_httpSecureAccess ? 'https://' : 'http://';

//负载均衡
$cfg_slb = (int)$cfg_slb;

//http强制跳转
//如果访问协议与网站配置不符，将强制跳转至网站配置的协议
//如果接口必须使用https，但是网站却配置了http，可以在接口参数中增加https=1配置
$currentHttp = 'http';
if((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') || (isset($_SERVER['HTTP_X_CLIENT_SCHEME']) && $_SERVER['HTTP_X_CLIENT_SCHEME'] == 'https')){
	if(!$cfg_httpSecureAccess && !$_GET['https'] && !strstr($_SERVER["PHP_SELF"], 'cron')){
        header("location:http://".$_SERVER['HTTP_HOST'].$_SERVER["REQUEST_URI"]);
        die;
    }
	$currentHttp = 'https';
}else {
    if ($cfg_httpSecureAccess && !$cfg_slb && !strstr($_SERVER['PHP_SELF'], 'appConfig.json') && !$_GET['signature'] && !strstr($_SERVER["PHP_SELF"], 'cron')) {
        header("location:https://" . $_SERVER['HTTP_HOST'] . $_SERVER["REQUEST_URI"]);
        die;
    }
}

//Session跨域设置
if(!empty($cfg_cookieDomain)){
  ini_set('session.cookie_path', '/');
  ini_set('session.cookie_domain', '.'.$cfg_cookieDomain);
  ini_set('session.cookie_lifetime', '1800');
  ini_set('session.cookie_httponly', 1);
  if($cfg_httpSecureAccess){
	  ini_set('session.cookie_samesite', 'None');
	  ini_set("session.cookie_secure", 1);
  }
  @session_set_cookie_params(0, '/', $cfg_cookieDomain);
}

//Session保存路径
// $sessSavePath = HUONIAODATA."/sessions/";
// if(is_writeable($sessSavePath) && is_readable($sessSavePath)){
//     @session_save_path($sessSavePath);
// }

session_start();
session_write_close();
header("Cache-control: private");

$cfg_attachment   = $cfg_secureAccess.$cfg_basehost.'/include/attachment.php?f=';  //附件访问地址
$cfg_staticPath   = $cfg_secureAccess.$cfg_basehost.'/static/'; //静态文件地址
$cfg_basedomain   = $cfg_secureAccess.$cfg_basehost;  //完整域名，带http前缀

//获取静态文件版本号
$m_file = HUONIAODATA."/admin/staticVersion.txt";
$cfg_staticVersion = time();
if(@filesize($m_file) > 0){
  $fp = @fopen($m_file,'r');
  $cfg_staticVersion = @fread($fp,filesize($m_file));
  fclose($fp);
}

//php5.1版本以上时区设置
//由于这个函数对于是php5.1以下版本并无意义，因此实际上的时间调用，应该用MyDate函数调用
if(version_compare(PHP_VERSION,'5.1','>')){
    $time51 = $cfg_timeZone * -1;
    @date_default_timezone_set('Etc/GMT'.$time51);
}

//配置全局附件路径 $cfg_fileUrl
if($cfg_ftpState == 1){
	$cfg_fileUrl = $cfg_ftpUrl.str_replace(".", "", $cfg_ftpDir);
}else{
	$cfg_fileUrl = $cfg_uploadDir;
}

//转换上传的文件相关的变量及安全处理、并引用前台通用的上传函数
if($_FILES){
    include_once(HUONIAOINC.'/uploadsafe.inc.php');
}

//数据库配置文件
include_once(HUONIAOINC.'/dbinfo.inc.php');

//需要更新浏览次数的附件SQL
$updateAttachmentClickSql = array();

//系统核心文件 (适配多城市分站与多域名：在底层授权校验期间桥接官方授权基准域名)
$hn_auth_license_host = 'fh580.net';
$hn_req_orig_host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$_SERVER['HTTP_HOST'] = $hn_auth_license_host;
include_once(HUONIAOINC.'/kernel.inc.php');
if ($hn_req_orig_host !== '') {
    $_SERVER['HTTP_HOST'] = $hn_req_orig_host;
}

//检测IP段
if(checkIpAccess(GetIP(), $cfg_iplimit) && !empty($cfg_iplimit)){
	die("<center><br /><br />您的IP已被限制！<br /><br />Your IP has been limited!</center>");
}

// include_once(HUONIAOINC.'/class/aliyun-php-sdk-core/Config.php');   //引入阿里云SDK

//载入插件配置,并对其进行默认初始化
$cfg_plug_autoload = array(
	'charset',    /* 编码插件 */
	'string',     /* 字符串插件 */
	'time',       /* 日期插件 */
	'file',       /* 文件插件 */
	'util',       /* 单元插件 */
	'validate',   /* 数据验证插件 */
	'filter',     /* 过滤器插件 */
	'cookie',     /* cookies插件 */
	'upload',     /* 上传插件 */
	'debug',      /* 验证插件 */
	'myad',				/* 广告插件 */
	'cron',				/* 计划任务 */
	'SubTable',				/* 分表插件 */
	'FileCache',				/* 文件缓存插件 */
);
loadPlug($cfg_plug_autoload);

function _RunMagicQuotes(&$svar){
    // if(!get_magic_quotes_gpc()){
        if( is_array($svar)){
            foreach($svar as $_k => $_v) $svar[$_k] = _RunMagicQuotes($_v);
        }else{
            if( strlen($svar)>0 && preg_match('#^(_GET|_POST|_COOKIE)#',$svar)){
              exit('Request var not allow!');
            }

            //先删除反斜杠，再增加反斜杠，如果不先删除，多提交几次就会出现：\\\\\\\'这种情况，同时去除字符串中的不可见字符
            $svar = (is_string($svar) && (strstr($svar, '[{') || is_array(json_decode($svar, true))) || is_array($svar)) ? $svar : addslashes(stripslashes(removeInvisibleCharacters($svar)));
        }
    // }
    return $svar;
}

//检查和注册外部提交的变量
function CheckRequest(&$val){
	if (is_array($val)){
		foreach ($val as $_k=>$_v) {
			if($_k == 'nvarname') continue;
			CheckRequest($_k);
			CheckRequest($val[$_k]);
		}
	}else{
		if( strlen($val)>0 && preg_match('#^(_GET|_POST|_COOKIE)#',$val)){
			exit('Request var not allow!');
		}
	}
}

CheckRequest($_REQUEST);

foreach(Array('_GET','_POST','_COOKIE') as $_request){
	foreach($$_request as $_k => $_v){
		if($_k == 'nvarname') ${$_k} = $_v;
		else ${$_k} = _RunMagicQuotes($_v);
        
        if($_REQUEST['rsaEncrypt'] == 1 && is_string(${$_k}) && (strlen(${$_k}) == 172 || strstr(${$_k}, '||rsa||'))){
            ${$_k} = rsaDecrypt(${$_k});  //RSA解密
        }

		//get请求过滤
		if($_request == '_GET' && $_v != 'getDatabaseStructure'){
			${$_k} = RemoveXSS(${$_k});
		}

        //对callback值进行处理
        if($_k == 'callback' && is_string(${$_k})){
            ${$_k} = strip_tags(trim(${$_k}));
        }

		//搜索关键字过滤
		if((strstr($_k, 'title') || strstr($_k, 'keyword'))){
			${$_k} = RemoveXSS(${$_k});
		}

        //金额强制转数字、防止表达式注入漏洞
        if($_k == 'amount'){
            ${$_k} = (float)(${$_k});
        }

        //ID强制转数字、防止表达式注入漏洞
        if(($_k == 'id' || $_k == 'cityid' || $_k == 'sid' || $_k == 'state')){
            ${$_k} = convertArrToStrWithComma(${$_k});
        }

        if($_k == 'page' || $_k == 'pageSize'){
            ${$_k} = (int)(${$_k});
            ${$_k} = ${$_k} <= 0 ? ($_k == 'page' ? 1 : 10) : ${$_k};
            ${$_k} = ${$_k} > 50000 ? 5000 : ${$_k};
		}

        if(($_k == 'lng' || $_k == 'lat' || $_k == 'userlng' || $_k == 'userlat') && ${$_k} == 'undefined'){
            ${$_k} = '';
        }

        if($_k == 'price' && ${$_k} == 'pricePlaceholder'){
            ${$_k} = '';
        }

        if(${$_k} == 'undefined'){
            ${$_k} = '';
        }
	}
}

//如果session没有防跨站请求标记则生成一个
if(!isset($_SESSION['token'])){
	putSession('token', sha1(uniqid(mt_rand(), TRUE)));
}

//微信小程序授权登录，原生页面已登录的情况，跳转到H5时，也同步登录
if($wxMiniProgramLoginByToken && $_GET['access_token']){
    $tokenState = verifyApiToken($_GET['access_token']);
    if($tokenState['state'] == 100){
        $_tokenUid = $tokenState['info'];
        $sql = $dsql->SetQuery("SELECT `id`, `password` FROM `#@__member` WHERE `id` = " . $_tokenUid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $userLogin->keepUserID = $userLogin->keepMemberID;
            $userLogin->userID = $ret[0]['id'];
            $userLogin->userPASSWORD = $ret[0]['password'];
            $userLogin->keepUser();
        }
    }    
}

//如果参数中有forcelogout，则强制退出
if(isset($_GET['forcelogout']) && $_GET['action'] != 'wxMiniProgramLogin'){
    $userLogin->exitMember();
}

//获取当前城市

//获取访问详情  兼容win
$reqUri = $_SERVER["HTTP_X_REWRITE_URL"];
if($reqUri == null){
	$reqUri = $_SERVER["HTTP_X_ORIGINAL_URL"];
	if($reqUri == null){
		$reqUri = $_SERVER["REQUEST_URI"];
	}
}

$siteCityInfoCookie = GetCookie('siteCityInfo');
$siteCityName = '';
if($siteCityInfoCookie && !strstr($reqUri, 'changecity')){
	$siteCityInfoJson = json_decode($siteCityInfoCookie, true);
	if(is_array($siteCityInfoJson)){
		$siteCityInfo = $siteCityInfoJson;
	}
}


//是否为异步请求，如果是异步请求，则不加载用不到的资源，比如：smarty
//由于请求附件的业务比较频繁(attachment.php)，并且也用不到smarty等资源，所以也归到条件中
//如果是支付相关业务，则排除，因为支付类中有需要渲染模板的功能
$isAsyncRequest = 0;
if(
    strstr($_SERVER['PHP_SELF'], '/include/attachment.php') ||
    (
        strstr($_SERVER['PHP_SELF'], '/include/ajax.php') && 
        !$paytype && 
        !$ordertype
    )
){
    $isAsyncRequest = 1;
}



//站点根目录
$cfg_basedir = preg_replace('#\/include$#i', '', HUONIAOINC);

global $huawei_privatenumber_state;
global $huawei_privatenumber_module;
global $cfg_payPhoneState;
global $cfg_payPhoneModule;

$cfg_privatenumberState = (int)$huawei_privatenumber_state;
$cfg_privatenumberModule = explode(',', $huawei_privatenumber_module);
$cfg_payPhoneModule = explode(',', $cfg_payPhoneModule);

//会员中心链接
$param = array("service" => "member",	"type" => "user");
$userDomain = getUrlPath($param);
$param = array("service"  => "member");
$busiDomain = getUrlPath($param);

//注册公共模块函数，主要给在当前模块下调用其他模块数据时使用
$contorllerFile = HUONIAOINC.'/loop.php';
if(file_exists($contorllerFile)){
	require_once($contorllerFile);
}

function initTemplateTag(){
    global $cfg_soft_lang;
    global $cfg_cache_lifetime;
    global $cfg_basehost;
    global $currentHttp;
    global $cfg_softname;
    global $cfg_soft_enname;
    global $cfg_thumbSize;
    global $cfg_atlasSize;
    global $cfg_thumbType;
    global $cfg_atlasType;
    global $cfg_audioType;
    global $cfg_audioSize;
    global $cfg_fileUrl;
    global $cfg_attachment;
    global $cfg_staticVersion;
    global $cfg_hotline;
    global $cfg_secureAccess;
    global $cfg_smsLoginState;
    global $cfg_regstatus;
    global $cfg_sameAddr_group;
    global $cfg_auto_location;
    global $cfg_areaName_0;
    global $cfg_areaName_1;
    global $cfg_areaName_2;
    global $cfg_areaName_3;
    global $cfg_areaName_4;
    global $cfg_areaName_5;
    global $cfg_privatenumberState;
    global $cfg_privatenumberModule;
    global $cfg_payPhoneModule;
    global $cfg_payPhoneState;
    global $cfg_payPhoneModule;
    global $cfg_iosVirtualPaymentState;
    global $cfg_iosVirtualPaymentTip;
    global $userLogin;
    global $dsql;
    global $reqUri;
    global $customBusinessState;
    global $userDomain;
    global $busiDomain;

    $httpHost = $_SERVER['HTTP_HOST'];  //来访域名
    $dirDomain = $cfg_secureAccess . $httpHost . $reqUri;
    $ischeck_user = explode($userDomain, $dirDomain);
    $ischeck_busi = explode($busiDomain, $dirDomain);

    $useCache = 1;
    
    //不需要缓存的页面：用户中心，商家平台，外卖商家中心，骑手中心
    if(
        (count($ischeck_user) > 1 && (substr($ischeck_user[1], 0, 1) == "/" || substr($ischeck_user[1], 0, 1) == "" || substr($ischeck_user[1], 0, 1) == "?"))
        ||
        (count($ischeck_busi) > 1 && (substr($ischeck_busi[1], 0, 1) == "/" || substr($ischeck_busi[1], 0, 1) == "" || substr($ischeck_busi[1], 0, 1) == "?"))
        ||
        strstr($reqUri, '/include')
        ||
        strstr($reqUri, '/supplier')
        ||
        strstr($reqUri, '/wmsj')
        ||
        strstr($reqUri, 'courier')
        ||
        strstr($reqUri, 'cart')
        ||
        strstr($reqUri, 'confirm')
        ||
        strstr($reqUri, 'order')
        ||
        strstr($reqUri, 'waimai')
        ||
        strstr($reqUri, 'zhaopin')
        ||
        strstr($reqUri, '/plugins')
        ||
        strstr($reqUri, 'maidan')
        ||
        strstr($reqUri, 'appFullScreen')
        ||
        strstr($reqUri, 'appIndex')
        ||
        strstr($reqUri, '/login')
        ||
        strstr($reqUri, '/business')
        ||
        $reqUri == '/'  //大首页不需要模板缓存
        ||
        HUONIAOADMIN
        ||
        $userLogin->getUserID() > 0
    ){
        $useCache = 0;
    }

    //模板引擎初始化配置
    mb_regex_encoding($cfg_soft_lang);
    include_once(HUONIAOINC."/tpl/Smarty.class.php");                   //包含smarty类文件
    $huoniaoTag = new Smarty();                                         //建立smarty实例对象$smarty
    $huoniaoTag->template_dir    = HUONIAOROOT."/templates";            //设置模板目录
    $huoniaoTag->compile_dir     = HUONIAOROOT."/templates_c/compiled"; //设置编译目录
    $huoniaoTag->cache_dir       = HUONIAOROOT."/templates_c/caches";   //页面缓存文件夹
    
    //用户中心不设置缓存
    if($useCache){
        $huoniaoTag->caching = empty($cfg_cache_lifetime) ? FALSE : TRUE;  //是否使用缓存，项目在调试期间，不建议启用缓存
        $huoniaoTag->cache_lifetime  = $cfg_cache_lifetime;                 //缓存时间

        $cacheId = md5($_SERVER['REQUEST_URI'] . $_SERVER['QUERY_STRING']); // 或者只取你关心的参数，如 $cacheId = md5('page='.$_GET['page'].'&category='.$_GET['category']);
        $huoniaoTag->cache_id = $cacheId; // 设置缓存ID
    }

    $huoniaoTag->left_delimiter  = "{#";                                //模板开始标记
    $huoniaoTag->right_delimiter = "#}";                                //模板结束标记

    if (HUONIAOBUG === TRUE){
        $huoniaoTag->force_compile = true;
    }else{
        $huoniaoTag->force_compile = false;
    }

    // $huoniaoTag->compile_check   = false;								//每次访问都必须检测模板，默认为true
    // spl_autoload_register("__autoload");                                //解决 __autoload 和 Smarty 冲突

    //初始化通用模板标签
    $huoniaoTag->assign("HUONIAOROOT",    HUONIAOROOT);          //网站根目录
    $huoniaoTag->assign("cfg_clihost",    $cfg_basehost);        //域名
    $huoniaoTag->assign("cfg_currentHost",    $currentHttp . '://' . $_SERVER['HTTP_HOST']);        //当前域名
    $huoniaoTag->assign("cfg_softname",   $cfg_softname);        //软件名
    $huoniaoTag->assign("cfg_softenname", $cfg_soft_enname);     //软件英文名

    $softVersion = getSoftVersion();
    $siteVersion  = explode("\n", $softVersion);  // 0：版本号  1：升级时间
    $huoniao_version = trim($siteVersion[0]);

    $huoniaoTag->assign("cfg_version",    $huoniao_version);      //软件版本
    $huoniaoTag->assign("cfg_soft_lang",  $cfg_soft_lang);       //软件语言
    $huoniaoTag->assign("thumbSize",      $cfg_thumbSize);       //缩略图上传大小限制
    $huoniaoTag->assign("atlasSize",      $cfg_atlasSize);       //图集单张图片上传大小限制
    $huoniaoTag->assign("thumbType",      "*.".str_replace("|", ";*.", $cfg_thumbType));     //缩略图上传类型限制
    $huoniaoTag->assign("atlasType",      "*.".str_replace("|", ";*.", $cfg_atlasType));     //图集上传类型限制
    $huoniaoTag->assign("audioType",      "*.".str_replace("|", ";*.", $cfg_audioType));     //音频上传类型限制
    $huoniaoTag->assign("audioSize",      $cfg_audioSize);     //音频上传大小
    $huoniaoTag->assign("HUONIAOINC",     HUONIAOINC);
    $huoniaoTag->assign("HUONIAOROOT",    HUONIAOROOT);
    $huoniaoTag->assign("HUONIAODATA",    HUONIAODATA);
    $huoniaoTag->assign("HTTP_REFERER",   strip_tags($_SERVER['HTTP_REFERER']));   //上一页的地址
    $huoniaoTag->assign("HTTP_REFERER_ENCODE", urlencode(strip_tags($_SERVER['HTTP_REFERER'])));   //上一页的地址
    $huoniaoTag->assign("HTTP_URI",   strip_tags($cfg_secureAccess.$_SERVER['HTTP_HOST'].$reqUri));   //当前页面的地址
    $huoniaoTag->assign("HTTP_ACCEPT_LANGUAGE",   $_SERVER['HTTP_ACCEPT_LANGUAGE']);   //当前浏览器的语言
    $huoniaoTag->assign("http_domestic",   strstr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 'zh-CN') ? 1 : 0);   //当前浏览器的语言是否为国内
    $huoniaoTag->assign("cfg_fileUrl",    $cfg_fileUrl);
    $huoniaoTag->assign("token",          $_SESSION['token']);         //全站token
    $huoniaoTag->assign("editorFile",     includeFile('editor'));      //载入编辑器脚本
    $huoniaoTag->assign("editorFile_adminInfo",     includeFile('editorFile_adminInfo'));      //载入编辑器脚本，不需要插件
    $huoniaoTag->assign("cfg_attachment", $cfg_attachment);            //附件访问地址
    $huoniaoTag->assign('cfg_staticVersion', $cfg_staticVersion);  //静态资源版本号
    $huoniaoTag->assign("cfg_hotline",    stripslashes($cfg_hotline));

    $huoniaoTag->assign("cfg_secureAccess",   $cfg_secureAccess);
    $huoniaoTag->assign("cfg_basehost",       $cfg_secureAccess.$cfg_basehost);

    $huoniaoTag->assign("cfg_adminid", $userLogin->getUserID());  //登录管理员的ID，未登录返回-1

    //短信登录开关
    $huoniaoTag->assign("cfg_smsLoginState",   (int)$cfg_smsLoginState);

    //会员注册开关
    $huoniaoTag->assign("cfg_regstatus",   (int)$cfg_regstatus);

    //隐私保护通话开关
    $huoniaoTag->assign("cfg_privatenumberState",   $cfg_privatenumberState);

    //隐私保护通话模块开关
    $huoniaoTag->assign("cfg_privatenumberModule",   $cfg_privatenumberModule);

    //付费查看电话开关
    $huoniaoTag->assign("cfg_payPhoneState",   (int)$cfg_payPhoneState);

    //付费查看电话模块开关
    $huoniaoTag->assign("cfg_payPhoneModule",   $cfg_payPhoneModule);

    //城市分站选择城市分组类型 0默认1按省
    $huoniaoTag->assign("cfg_sameAddr_group",   (int)$cfg_sameAddr_group);

    //区域级别名称自定义
    $areaName_0 = $cfg_areaName_0 ?: '省份';
    $areaName_1 = $cfg_areaName_1 ?: '城市';
    $areaName_2 = $cfg_areaName_2 ?: '区县';
    $areaName_3 = $cfg_areaName_3 ?: '乡镇';
    $areaName_4 = $cfg_areaName_4 ?: '村庄';
    $areaName_5 = $cfg_areaName_5 ?: '自定义';

    $areaNameArr = array($areaName_0, $areaName_1, $areaName_2, $areaName_3, $areaName_4, $areaName_5);
    $huoniaoTag->assign("cfg_site_areaname", $areaNameArr);

    //消费金名称
    $configPay = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = 'huoniao_bonus'");
    $Payconfig= $dsql->dsqlOper($configPay, "results");
    $payname = $Payconfig[0]['pay_name'] ? $Payconfig[0]['pay_name'] : '消费金';
    $huoniaoTag->assign('cfg_bonusName', $payname);

    //iOS端虚拟支付功能
    $iosVirtualPaymentState = (int)$cfg_iosVirtualPaymentState;  //0启用  1禁用
    $iosVirtualPaymentTip = $cfg_iosVirtualPaymentTip ?: 'iOS端小程序不支持该功能';
    $huoniaoTag->assign("cfg_iosVirtualPaymentState",   $iosVirtualPaymentState);
    $huoniaoTag->assign("cfg_iosVirtualPaymentTip",   $iosVirtualPaymentTip);

    //时区
    $huoniaoTag->assign("cfg_timezone", date_default_timezone_get());

    //商家功能开关
    $business_state = 1;  //0禁用  1启用
    $business_state = (int)$customBusinessState;  //配置文件中 0表示启用  1表示禁用  因为默认要开启商家功能
    $business_state = intval(!$business_state);
    $huoniaoTag->assign("cfg_business_state", $business_state);

    return $huoniaoTag;
}

if(!$isAsyncRequest){
    $huoniaoTag = initTemplateTag();
}

//缓存
if(!is_file(HUONIAOINC."/class/memory.class.php") || !is_file(HUONIAOINC."/class/memory_redis.class.php")){
    class memory {
        public $enable = false;
        public function get($key, $prefix = '') {}
        public function set($key, $value, $ttl = 0, $prefix = '') {}
        public function rm($key, $prefix = '') {}
        public function clear() {}
        public function inc($key, $step = 1) {}
        public function dec($key, $step = 1) {}
    }
}
$HN_memory = new memory();


$siteCityName = "";
$_getCityid = (int)$_GET['cityid'];  //URL传过来指定的城市ID
if($_getCityid){
	$siteCityInfo = cityInfoById($_getCityid);
	$siteCityName = $siteCityInfo['name'];
}else{
    $siteCityInfoCookie = GetCookie('siteCityInfo');
    if($siteCityInfoCookie){
        $siteCityInfoJson = json_decode($siteCityInfoCookie, true);
        if(is_array($siteCityInfoJson)){
            $siteCityInfo = $siteCityInfoJson;
            $siteCityName = $siteCityInfo['name'];
        }
    }
}

//如果是选择城市页面，不需要进行城市关键字替换
if(strstr($_SERVER['REQUEST_URI'], 'changecity')){
	$siteCityName = '';
}



//获取城市分站自定义配置信息
$siteCityAdvancedConfig = array();
if($siteCityInfo && $siteCityInfo['cityid']){
    $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $siteCityInfo['cityid']);
    $ret = $dsql->dsqlOper($sql, "results");
    if(is_array($ret)){
        $advancedConfig = $ret[0]['config'] ? $ret[0]['config'] : '';
        $advancedConfigArr = $advancedConfig ? unserialize($advancedConfig) : array();
        if($advancedConfigArr){
            $siteCityAdvancedConfig = $advancedConfigArr;
        }
    }
}


$cfg_webname_h = $cfg_webname;
if($siteCityAdvancedConfig && $siteCityAdvancedConfig['siteConfig'] && $siteCityAdvancedConfig['siteConfig']['webname']){
    $cfg_webname_h = $siteCityAdvancedConfig['siteConfig']['webname'];
}

//后台配置文件不需要替换
$cfg_webname_ = $cfg_webname_h;
$cfg_shortname_ = $cfg_shortname;
if(!strstr($_SERVER['REQUEST_URI'], 'siteConfig') && !strstr($_SERVER['REQUEST_URI'], 'wechatConfig')){
    $cfg_webname_ = str_replace('$city', $siteCityName, stripslashes($cfg_webname_h));
    $cfg_shortname_ = str_replace('$city', $siteCityName, stripslashes($cfg_shortname));
}

if(!$isAsyncRequest){
    
    $cfg_powerby = str_replace('$city', $siteCityName, stripslashes($cfg_powerby));
    $huoniaoTag->assign("cfg_webname",        $cfg_webname_);
    $huoniaoTag->assign("cfg_shortname",      $cfg_shortname_);
    $huoniaoTag->assign("cfg_powerby",        $cfg_powerby);

    //会员积分配置
    $huoniaoTag->assign("cfg_pointState",     $cfg_pointState);
    $huoniaoTag->assign("cfg_pointName",      $cfg_pointName);
    $huoniaoTag->assign("cfg_pointRatio",     $cfg_pointRatio);
    $huoniaoTag->assign("cfg_pointFee",       $cfg_pointFee);

    //公交地铁状态
    $huoniaoTag->assign("cfg_subway_state",       (int)$cfg_subway_state);
    $huoniaoTag->assign("cfg_subway_title",       $cfg_subway_title ? $cfg_subway_title : '公交/地铁');

    //微信基本配置

    $_check_cityid = (int)$_GET['cityid'] ?? '';
    if(!$_check_cityid){
        global $siteCityInfo;
        $_check_cityid = (int)$siteCityInfo['cityid'] ?? '';
    }

    if($_check_cityid){
        $_wechatConfig = getWechatCityAdvancedConfig('', $_check_cityid);
        $_wxminiConfig = getMiniProgramCityAdvancedConfig('', $_check_cityid);

        if($_wechatConfig){
            $cfg_wechatName = $_wechatConfig['name'];
            $cfg_wechatCode = $_wechatConfig['code'];
            $cfg_wechatQr = $_wechatConfig['qr'];
        }
        if($_wxminiConfig){
            $cfg_miniProgramName = $_wxminiConfig['name'];
            $cfg_miniProgramQr = $_wxminiConfig['qr'];
        }
    }
    
    $huoniaoTag->assign("cfg_weixinName",     $cfg_wechatName);  //公众号名称
    $huoniaoTag->assign("cfg_weixinCode",     $cfg_wechatCode);  //微信号
    $huoniaoTag->assign("cfg_weixinQr",       getAttachemntFile($cfg_wechatQr));  //二维码
    $huoniaoTag->assign("cfg_miniProgramName", $cfg_miniProgramName);  //小程序名称
    $huoniaoTag->assign("cfg_miniProgramQr",   getAttachemntFile($cfg_miniProgramQr));  //二维码
    $huoniaoTag->assign("cfg_wechatTips",     (int)$cfg_wechatTips);  //关注公众号提示

    //会员结算配置
    $huoniaoTag->assign("cfg_rewardFee",      $cfg_rewardFee);

    //商家结算配置
    $huoniaoTag->assign("cfg_tuanFee",        $cfg_tuanFee);
    $huoniaoTag->assign("cfg_shopFee",        $cfg_shopFee);
    $huoniaoTag->assign("cfg_waimaiFee",      $cfg_waimaiFee);
    $huoniaoTag->assign("cfg_homemakingFee",  $cfg_homemakingFee);
    $huoniaoTag->assign("cfg_travelFee",      $cfg_travelFee);

    //普通会员发布信息收费配置
    $huoniaoTag->assign("cfg_fabuAmount",     $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array());
    $huoniaoTag->assign("cfg_fabuFreeCount",     $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array());

    //极验验证
    $huoniaoTag->assign("cfg_geetest",            (int)$cfg_geetest);            //0关闭  1极验  2阿里云
    $huoniaoTag->assign("cfg_geetest_pc_id",      $cfg_geetest_pc_id);      //网页端ID
    $huoniaoTag->assign("cfg_geetest_pc_key",     $cfg_geetest_pc_key);     //网页端KEY
    $huoniaoTag->assign("cfg_geetest_mobile_id",  $cfg_geetest_mobile_id);  //移动端ID
    $huoniaoTag->assign("cfg_geetest_mobile_key", $cfg_geetest_mobile_key);     //移动端KEY

    //阿里云
    $huoniaoTag->assign("cfg_aliyun_captcha_prefix", $cfg_geetest_prefix);
    $huoniaoTag->assign("cfg_aliyun_captcha_web", $cfg_geetest_web);
    $huoniaoTag->assign("cfg_aliyun_captcha_h5", $cfg_geetest_h5);
    $huoniaoTag->assign("cfg_aliyun_captcha_app", $cfg_geetest_app);

    //签到规则
    $huoniaoTag->assign("cfg_qiandao_state", $cfg_qiandao_state);
    $huoniaoTag->assign("cfg_qiandao_buqianState", $cfg_qiandao_buqianState);
    $huoniaoTag->assign("cfg_qiandao_buqianPrice", $cfg_qiandao_buqianPrice);
    $huoniaoTag->assign("cfg_qiandao_note", $cfg_qiandao_note);

    //分销
    $huoniaoTag->assign("cfg_fenxiaoState", isset($cfg_fenxiaoState) ? $cfg_fenxiaoState : null);
    $huoniaoTag->assign("cfg_fenxiaoType", $cfg_fenxiaoType);
    $huoniaoTag->assign("cfg_fenxiaoName", $cfg_fenxiaoName);
    $huoniaoTag->assign("cfg_fenxiaoLevel", $cfg_fenxiaoLevel ? unserialize($cfg_fenxiaoLevel) : array());
    $huoniaoTag->assign("cfg_fenxiaoJoinNote", stripslashes($cfg_fenxiaoJoinNote));
    $huoniaoTag->assign("cfg_fenxiaoNote", stripslashes($cfg_fenxiaoNote));
    $huoniaoTag->assign("cfg_fenxiaoQrType", (int)$cfg_fenxiaoQrType);

    //购买抵扣积分
    $huoniaoTag->assign('cfg_offset_tuan', $cfg_offset_tuan);
    $huoniaoTag->assign('cfg_offset_shop', $cfg_offset_shop);
    $huoniaoTag->assign('cfg_offset_waimai', $cfg_offset_waimai);
    $huoniaoTag->assign('cfg_offset_homemaking', $cfg_offset_homemaking);
    $huoniaoTag->assign('cfg_offset_travel', $cfg_offset_travel);
    $huoniaoTag->assign('cfg_offset_education', $cfg_offset_education);

    //充值送积分，提现扣积分
    $huoniaoTag->assign('cfg_chongzhiSongJiFen', $cfg_chongzhiSongJiFen);
    $huoniaoTag->assign('cfg_chongzhijfFee', $cfg_chongzhijfFee);
    $huoniaoTag->assign('cfg_chongzhiJfLimit', $cfg_chongzhiJfLimit);
    $huoniaoTag->assign('cfg_withdrawJfFee', $cfg_withdrawJfFee);

    //会员中心链接管理
    $huoniaoTag->assign("cfg_ucenterLinks", is_array($cfg_ucenterLinks) ? $cfg_ucenterLinks : explode(",", $cfg_ucenterLinks));

    //聚合数据
    $huoniaoTag->assign("cfg_juhe", $cfg_juhe ? unserialize($cfg_juhe) : array());

    //是否为蜘蛛
    $huoniaoTag->assign("isSpider", isSpider());

    //自动定位：0开启 1关闭
    $_auto_location = (int)$cfg_auto_location;
    $huoniaoTag->assign("cfg_auto_location", $_auto_location ? 0 : 1);

    //发布信息是否验证实名：1开启 2关闭
    $cfg_memberVerified = (int)$cfg_memberVerified;
    $huoniaoTag->assign("cfg_memberVerified", $cfg_memberVerified);

    //app配置
    $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
    $appRet = $dsql->dsqlOper($sql, "results");
    if($appRet && is_array($appRet)){
        $data = $appRet[0];
        $huoniaoTag->assign('cfg_appname', $data['appname']);
        $huoniaoTag->assign('cfg_app_logo', getAttachemntFile($data['logo']));
        $huoniaoTag->assign('cfg_app_android_version', $data['android_version']);
        $huoniaoTag->assign('cfg_app_ios_version', $data['ios_version']);
        $huoniaoTag->assign('cfg_app_android_download', $data['android_download']);
        $huoniaoTag->assign('cfg_app_yyb_download', $data['yyb_download']);
        $huoniaoTag->assign('cfg_app_ios_download', $data['ios_download']);
        $huoniaoTag->assign('cfg_app_harmony_download', $data['harmony_download']);

        $huoniaoTag->assign('cfg_app_business_appname', $data['business_appname']);
        $huoniaoTag->assign('cfg_app_business_logo', getAttachemntFile($data['business_logo']));
        $huoniaoTag->assign('cfg_app_business_android_version', $data['business_android_version']);
        $huoniaoTag->assign('cfg_app_business_ios_version', $data['business_ios_version']);
        $huoniaoTag->assign('cfg_app_business_android_download', $data['business_android_download']);
        $huoniaoTag->assign('cfg_app_business_yyb_download', $data['business_yyb_download']);
        $huoniaoTag->assign('cfg_app_business_ios_download', $data['business_ios_download']);

        $huoniaoTag->assign('cfg_app_peisong_appname', $data['peisong_appname']);
        $huoniaoTag->assign('cfg_app_peisong_logo', getAttachemntFile($data['peisong_logo']));
        $huoniaoTag->assign('cfg_app_peisong_android_version', $data['peisong_android_version']);
        $huoniaoTag->assign('cfg_app_peisong_ios_version', $data['peisong_ios_version']);
        $huoniaoTag->assign('cfg_app_peisong_android_download', $data['peisong_android_download']);
        $huoniaoTag->assign('cfg_app_peisong_yyb_download', $data['peisong_yyb_download']);
        $huoniaoTag->assign('cfg_app_peisong_ios_download', $data['peisong_ios_download']);

        $huoniaoTag->assign('cfg_ios_shelf', $data['ios_shelf']);
        $huoniaoTag->assign('umeng_phoneLoginState', $data['umeng_phoneLoginState']);

        $huoniaoTag->assign('cfg_app_copyright', $data['copyright'] ? $data['copyright'] : $cfg_powerby);
        $huoniaoTag->assign('cfg_app_business_copyright', $data['business_copyright'] ? $data['business_copyright'] : $cfg_powerby);
        $huoniaoTag->assign('cfg_app_peisong_copyright', $data['peisong_copyright'] ? $data['peisong_copyright'] : $cfg_powerby);
    }


    //PC端主题色，从PC端发布页DIY中获取
    //默认为绿色 #07BF77
    $defaultThemeColor = '#07BF77';
    $_sql = $dsql->SetQuery("SELECT `children` FROM `#@__site_config` WHERE `type` = 'fabuPc'");
    $_ret = $dsql->dsqlOper($_sql, "results");
    if($_ret){
        $children = $_ret[0]['children'] ? unserialize($_ret[0]['children']) : '';
        if($children && $children['themeColor']){
            $defaultThemeColor = $children['themeColor'];
        }
    }
    $huoniaoTag->assign('defaultThemeColor', $defaultThemeColor);

}

//地图配置
switch ($cfg_map) {
	case 1:
		$site_map = "google";
		$site_map_key = $cfg_map_google;
		$site_map_apiFile = $cfg_secureAccess . "maps.googleapis.com/maps/api/js?key=".$site_map_key."&sensor=false&libraries=places";
		break;
	case 2:
		$site_map = "baidu";
		$site_map_key = $cfg_map_baidu;
		$site_map_server_key = $cfg_map_baidu_server;
		$site_map_apiFile = $cfg_secureAccess . "api.map.baidu.com/api?v=2.0&ak=".$site_map_key;
		break;
	case 3:
		$site_map = "qq";
		$site_map_key = $cfg_map_qq;
		$site_map_apiFile = $cfg_secureAccess . "map.qq.com/api/js?key=".$cfg_map_qq."&libraries=drawing";
		break;
	case 4:
		$site_map = "amap";
		$site_map_key = $cfg_map_amap;
		$site_map_server_key = $cfg_map_amap_server;
		$site_map_apiFile = $cfg_secureAccess . "webapi.amap.com/maps?v=1.4.15&key=".$site_map_key;
		break;
    case 5:
        $site_map = "tmap";
        $site_map_key = $cfg_map_tmap;
        $site_map_apiFile = $cfg_secureAccess . "api.tianditu.gov.cn/api?v=4.0&tk=".$site_map_key;
        break;
	default:
		$site_map = "baidu";
		$site_map_key = $cfg_map_baidu;
		$site_map_apiFile = $cfg_secureAccess . "api.map.baidu.com/api?v=2.0&ak=".$site_map_key;
		break;
}

if(!$isAsyncRequest){
    $huoniaoTag->assign('site_map', $site_map);
    $huoniaoTag->assign('site_map_key', $site_map_key);
    $huoniaoTag->assign('site_map_google', $cfg_map_google);
    $huoniaoTag->assign('site_map_baidu', $cfg_map_baidu);
    $huoniaoTag->assign('site_map_qq', $cfg_map_qq);
    $huoniaoTag->assign('site_map_amap', $cfg_map_amap);
    $huoniaoTag->assign('site_map_tmap', $cfg_map_tmap);
    $huoniaoTag->assign('site_map_apiFile', $site_map_apiFile);

    $huoniaoTag->assign('site_map_server_key', $site_map_server_key);

    //高德地图新版
    $amap_jscode = '<script>window._AMapSecurityConfig = {securityJsCode:"'.$cfg_map_amap_jscode.'"}; var amap_server_key = "'.$cfg_map_amap_server.'";</script>';
    $huoniaoTag->assign('amap_jscode', $amap_jscode);


    $site_map_waimai = 'amap';

    $huoniaoTag->assign('site_map_waimai', $site_map_waimai);   // 外卖使用地图平台

    //百度单独显示
    $huoniaoTag->assign('site_map_baidu_key', $cfg_map_baidu);
    //高德单独显示
    $huoniaoTag->assign('site_map_amap_key', $cfg_map_amap);
    $huoniaoTag->assign('site_map_amap_apiFile', $cfg_secureAccess . "webapi.amap.com/maps?v=1.4.15&key=".$cfg_map_amap);

    $huoniaoTag->registerPlugin("function", 'getUrlPath', 'getUrlPath');    //注册获取链接函数   主要以拼接静态URL为主  例：list-1-1-1-1-1-1-1.html
    $huoniaoTag->registerPlugin("function", 'getUrlParam', 'getUrlParam');  //注册获取链接函数   主要以拼接URL参数为主  例：list.html?a=1&b=1&c=1&d=1
    $huoniaoTag->registerPlugin("function", 'getPageList', 'getPageList');  //打印分页信息
	$huoniaoTag->registerPlugin("function", "getModuleConfig", "smarty_function_getModuleConfig");  //模板中获取模块配置信息
	$huoniaoTag->registerPlugin("block", "loop", "loop");


    //是否APP端
    $appIndex = (int)$appIndex;
    $huoniaoTag->assign('is_app', isApp() || $appIndex ? 1 : 0);

    //是否苹果APP端
    $huoniaoTag->assign('is_ios_app', isIOSApp() ? 1 : 0);

    //是否安卓APP端
    $huoniaoTag->assign('is_android_app', isAndroidApp() ? 1 : 0);

    //是否鸿蒙APP端
    $huoniaoTag->assign('is_harmony_app', isHarmonyApp() ? 1 : 0);

    //终端名称
    $app_platform = '';
    if(isIOSApp()){
        $app_platform = 'ios';
    }elseif(isAndroidApp()){
        $app_platform = 'android';
    }elseif(isHarmonyApp()){
        $app_platform = 'harmony';
    }
    $huoniaoTag->assign('app_platform', $app_platform);

    //是否微信端
    $huoniaoTag->assign('isWeixin', isWeixin());

    //是否微信小程序端
    $huoniaoTag->assign('isWxMiniprogram', isWxMiniprogram());

    //是否百度小程序端
    $huoniaoTag->assign('isBaiDuMiniprogram', isBaiDuMiniprogram());

    //是否QQ小程序端
    $huoniaoTag->assign('isQqMiniprogram', isQqMiniprogram());

    //是否抖音小程序端
    $huoniaoTag->assign('isByteMiniprogram', isByteMiniprogram());

    //小程序
    $isminiprogram = 0;
    if(isWxMiniprogram() || isBaiDuMiniprogram() || isQqMiniprogram() || isByteMiniprogram()){
        $isminiprogram = 1;
    }
    $huoniaoTag->assign("isminiprogram", $isminiprogram);

    //客服
    $cfg_kefuMiniProgram = (int)$cfg_kefuMiniProgram;
    if(!$cfg_kefuMiniProgram && $isminiprogram){
        $cfg_kefu_touch_url = '';
    }
    //苹果APP中不支持企业微信客服
    if(strstr($cfg_kefu_touch_url, 'work.weixin.qq.com') && (isIOSApp() || isHarmonyApp())){
        $cfg_kefu_touch_url = 'tel:' . $cfg_hotline;
    }
    $huoniaoTag->assign("cfg_kefu_pc_url", $cfg_kefu_pc_url);
    $huoniaoTag->assign("cfg_kefu_touch_url", $cfg_kefu_touch_url);
    $huoniaoTag->assign("cfg_kefuMiniProgram", (int)$cfg_kefuMiniProgram);

    //注册模板函数
    $registerPlugin = array(
        "myad"           => "getMyAd",         //广告函数
        "echoCurrency"   => "echoCurrency",    //货币输出
        "getMyTime"      => "getMyTime",       //时间函数
        "getMyWeek"      => "getMyWeek",       //星期函数
        "bodyPageList"   => "bodyPageList",    //内容分页函数
        "getTypeInfo"    => "getTypeInfo",     //分类详细信息
        "getTypeName"    => "getTypeName",     //分类名称
        "getChannel"     => "getChannel",      //导航函数
        "getWeather"     => "getWeather",      //天气预报
        "changeFileSize" => "changeFileSize",  //附件地址
        "numberDaxie"    => "numberDaxie",     //数字大小写转换
        "FloorDay"       => "FloorDay",        //精确天数
        "FloorTimeByTemp" => "FloorTimeByTemp",  //XX时间前
        "getImgHeightByGeometric" => "getImgHeightByGeometric",      //根据图片路径、指定宽度，获取等比缩放后的高度
        "resizeImageSize" => "resizeImageSize",      //获取等比例缩放后的图片尺寸
        "getPublicParentInfo" => "getPublicParentInfo",      //根据指定表、指定ID获取相关信息
        "getModuleTitle" => "getModuleTitle",      //根据指定表、指定ID获取相关信息
        "verifyModuleAuth" => "verifyModuleAuth",      //根据模块标识验证会员是否有权限
        "hex2rgb" => "hex2rgb",   //十六进制转rgb值
    );

    if(!empty($registerPlugin)){
        foreach ($registerPlugin as $key => $value) {
            $huoniaoTag->registerPlugin("function", $key, $value);
        }
    }


    //临时解决模块中调用没有安装的模块时报错的问题 -by guozi 20160811
    function registerPluginBlockNull(){};
    $allModuleArr = array("article", "image", "info", "tuan", "house", "shop", "build", "furniture", "home", "renovation", "job", "dating", "marry", "paper", "special", "website", "waimai", "car", "travel", "tieba", "huodong", "huangye", "vote", "pic", "video", "live", "integral", "quanjing", "homemaking", "education", "circle", "sfcar", "awardlegou");
    foreach ($allModuleArr as $key => $value) {
    // $huoniaoTag->registerPlugin("block", $value, "registerPluginBlockNull");
    }
}

//获取系统模块
$isWxMiniprogram = $miniprogram ? $miniprogram : isWxMiniprogram();
$isBaiDuMiniprogram = $baiduMiniProgram ? $baiduMiniProgram : isBaiDuMiniprogram();
$isQqMiniprogram = $QqMiniProgram ? $QqMiniProgram : isQqMiniprogram();
$isByteMiniprogram = $ByteMiniProgram ? $ByteMiniProgram : isByteMiniprogram();

$installModuleArr = array();
$installModuleTitleArr = array();
$installModuleIconArr = array();
$cfg_businessStoreModuleArr = array();
$sql = $dsql->SetQuery("SELECT `name`, `title`, `subject`, `wx`, `bd`, `qm`, `dy`, `icon`, `app`, `pc`, `h5`, `android`, `ios`, `harmony` FROM `#@__site_module` WHERE `state` = 0 AND `parentid` != 0 AND `type` = 0 ORDER BY `weight` ASC");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
  foreach ($ret as $key => $value) {
      if(
		  (!isMobile() && $value['pc']) ||
		  (
			  isMobile() && (
				  (!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $value['h5'] && !isApp()) ||
				  ($isWxMiniprogram && $value['wx'] && !isApp()) ||
				  ($isBaiDuMiniprogram && $value['bd'] && !isApp()) ||
				  ($isQqMiniprogram && $value['qm'] && !isApp()) ||
				  ($isByteMiniprogram && $value['dy'] && !isApp()) ||
				  (isAndroidApp() && $value['android'] == 1) ||
				  (isIOSApp() && $value['ios'] == 1) ||
				  (isHarmonyApp() && $value['harmony'] == 1)
			  )
		  )
	  ) {
		  //城市分站配置模块开关状态
		  if(!$siteCityAdvancedConfig || ($siteCityAdvancedConfig && !$siteCityAdvancedConfig[$value['name']]['state'])){

	          $installModuleArr[] = $value['name'];
	          $installModuleTitleArr[$value['name']] = $value['subject'] ? $value['subject'] : $value['title'];
	          $installModuleIconArr[$value['name']] = getAttachemntFile($value['icon']);

		  }
      }

	  //需要商家入驻的模块
	  if(
		//   $value['name'] == 'article' ||
//		  $value['name'] == 'info' ||
		  $value['name'] == 'house' ||
		//   $value['name'] == 'job' ||
		  $value['name'] == 'shop' ||
		//   $value['name'] == 'tieba' ||
		  $value['name'] == 'huodong' ||
		  $value['name'] == 'waimai' ||
		  $value['name'] == 'tuan' ||
		  $value['name'] == 'website' ||
		//   $value['name'] == 'vote' ||
		  $value['name'] == 'dating' ||
		  $value['name'] == 'renovation' ||
		  $value['name'] == 'car' ||
		  $value['name'] == 'homemaking' ||
		  $value['name'] == 'marry' ||
		  $value['name'] == 'travel' ||
		  $value['name'] == 'education' ||
		  $value['name'] == 'live' ||
		  $value['name'] == 'pension'||
		  $value['name'] == 'awardlegou'||
          $value['name'] == 'paimai'
	  ){
		  array_push($cfg_businessStoreModuleArr, array(
			 'name' => $value['name'],
			 'title' =>  $value['subject'] ? $value['subject'] : $value['title'],
			 'icon' => empty($value['icon']) ? $cfg_secureAccess.$cfg_basehost.'/static/images/admin/nav/' . $value['name'] . '.png' : getAttachemntFile($value['icon'])
		  ));
	  }
  }
}

if(!$isAsyncRequest){
    $huoniaoTag->assign('installModuleArr', $installModuleArr);
    $huoniaoTag->assign('installModuleTitleArr', $installModuleTitleArr);
    $huoniaoTag->assign('installModuleIconArr', $installModuleIconArr);
}

//商家特权
$cfg_businessPrivilegeArr = array(
	array(
		'name' => 'daohang',
		'title' => '自定义导航'
	),
	array(
		'name' => 'caidan',
		'title' => '自定义菜单'
	),
	array(
		'name' => 'xiaochengxu',
		'title' => '商家小程序'
	)
);

//后台权限
$_cfg_ucenterLinks = explode(',', $cfg_ucenterLinks);
if(in_array('food', $_cfg_ucenterLinks)){
	array_push($cfg_businessPrivilegeArr, array(
		'name' => 'diancan',
		'title' => '点餐'
	));
	array_push($cfg_businessPrivilegeArr, array(
		'name' => 'dingzuo',
		'title' => '订座'
	));
	array_push($cfg_businessPrivilegeArr, array(
		'name' => 'paidui',
		'title' => '排队'
	));
	array_push($cfg_businessPrivilegeArr, array(
		'name' => 'maidan',
		'title' => '买单'
	));
}

if(!$isAsyncRequest){
    $huoniaoTag->assign('cfg_businessPrivilegeArr', $cfg_businessPrivilegeArr);
    $huoniaoTag->assign('cfg_businessStoreModuleArr', $cfg_businessStoreModuleArr);
}

//保证session中的防跨站标记与提交过来的标记一致
if($_POST['token'] != "" && $_POST['token'] != $_SESSION['token']){
	// die('Error!<br />Code:Token');
}

//更新会员所在分站
$_uid_ = $userLogin->getMemberID();
if($_uid_ > -1 && $siteCityInfo){
	$_userinfo_ = $userLogin->getMemberInfo(0, 1);
	if(is_array($_userinfo_)){
    	$_user_cityid = (int)$_userinfo_['cityid'];
    	$_site_cityid = (int)$siteCityInfo['cityid'];

    	//系统开启自动更新，或者会员cityid未设置
    	if(($cfg_memberCityid && $_user_cityid != $_site_cityid) || !$_user_cityid){
    		$sql = $dsql->SetQuery("UPDATE `#@__member` SET `cityid` = '$_site_cityid' WHERE `id` = $_uid_ AND `lock_cityid` = 0");
    		$dsql->dsqlOper($sql, "update");
    	}
	}
}

//将货币单位存入cookie
$currency_areaname      = $currency_areaname == '' ? "平方米" : $currency_areaname;
$currency_areasymbol    = $currency_areasymbol == '' ? "㎡" : $currency_areasymbol;
$currencyArr = array(
    "name"   => $currency_name,
    "short"  => $currency_short,
    "symbol" => $currency_symbol,
    "code"   => $currency_code,
    "rate"   => $currency_rate,
    "areaname"      => $currency_areaname,
    "areasymbol"    => $currency_areasymbol
);
// 由于漏洞扫描软件会反映出json劫持漏洞，这里不再使用cookie的方式，index.php中已经向页面中输出了cfg_currency脚本变量，common.js和touchScale.js中也有做适配，后面如果遇到必须使用cookie的地方再单独优化
PutCookie("currency", base64_encode(json_encode($currencyArr)), 60 * 60, "/");

//记录推荐人信息
if($_GET['fromShare']){
	PutCookie('fromShare', $_GET['fromShare'], $cfg_onlinetime * 60 * 60);
}

//多语言
$langData = array();

//默认以后台配置为准，如果后台没有配置，取中文
$cfg_lang_dir = $cfg_lang ? $cfg_lang : 'zh-CN';

//获取cookie中的语言配置
$cookieLang = GetCookie('lang');

//如果url中指定了语言，第一优先考虑
if ($_GET['lang']) {
    $cfg_lang_dir = $_GET['lang'];

//如果cookie中指定了语言，第二优先考虑
} elseif ($cookieLang) {
    $cfg_lang_dir = $cookieLang;

//判断浏览器类型，如有新语言包，需要手动新增
} else {
    // $HTTP_ACCEPT_LANGUAGE = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 4); //只取前4位，这样只判断最优先的语言。如果取前5位，可能出现en,zh的情况，影响判断。
    // if (preg_match("/zh-c/i", $HTTP_ACCEPT_LANGUAGE)){
    // 	$cfg_lang_dir = 'zh-CN';
    // }else if (preg_match("/zh/i", $HTTP_ACCEPT_LANGUAGE)){
    // 	$cfg_lang_dir = 'zh-HK';
    // }else if (preg_match("/en/i", $HTTP_ACCEPT_LANGUAGE)){
    // 	$cfg_lang_dir = 'en-US';
    // }
}

$lang_path = HUONIAOINC . "/lang/" . $cfg_lang_dir . "/";

//如果经过一系列判断之后获取到的语言包不存在，则使用系统默认配置
if (!is_dir($lang_path)) {
    $cfg_lang_dir = $cfg_lang ? $cfg_lang : 'zh-CN';
    $lang_path = HUONIAOINC . "/lang/" . $cfg_lang_dir . "/";
}

//如果使用系统默认配置的语言包依然不存在，则输入错误，结束浏览
if (!is_dir($lang_path)) {
    die('<center><br /><br />语言包读取失败，请联系管理员。<br /><br />Language package read failed. Please contact the administrator.</center>');
}

//读文件缓存
$langDataCache = cache_read($cfg_lang_dir . '.php');
if($langDataCache){
    foreach($langDataCache as $key => $value){
        $langData[$key] = $value;
    }
}
else{
    $langData_cache = $HN_memory->get('langData_' . $cfg_lang_dir);
    if($langData_cache && !HUONIAOBUG){
        $langData = $langData_cache;
    }else {
        $siteConfiglangnametxt = HUONIAOINC . "/lang/siteConfiglangname.txt";
        $Lanname = file_exists($siteConfiglangnametxt)?file_get_contents(HUONIAOINC . "/lang/siteConfiglangname.txt"):'';

        $siteConfiglangname = array();
        if($Lanname !=''){
            $siteConfiglangname = explode(',', $Lanname);
        }

        foreach ($siteConfiglangname as $s => $l) {
            if($l !=''){

                $sName = str_replace(".inc.php", "", $l);
                $sub_dir = $lang_path . $l;
                if (file_exists($sub_dir)) {
                    include_once($sub_dir);
                    $langData[$sName] = $lang;
                }
            }
        }

        //写入缓存
        $HN_memory->set('langData_' . $cfg_lang_dir, $langData);
    }
}

if(!$isAsyncRequest){
    $huoniaoTag->assign('langData', $langData);
}

PutCookie("lang", $cfg_lang_dir, 60 * 60, "/");

//多语言列表
$lang_dir = HUONIAOINC . '/lang/';
$floders = listDir($lang_dir);
$langArr = array();
$langCurrentName = '';
if(!empty($floders)){
	$i = 0;
	foreach($floders as $key => $floder_){
		$langConfig = $lang_dir.'/'.$floder_.'/config.xml';
		if(file_exists($langConfig)){
			//解析xml配置文件
			$xml = new DOMDocument();
			libxml_disable_entity_loader(false);
			$xml->load($langConfig);
			$langDataXml = $xml->getElementsByTagName('Data')->item(0);
			$langName = $langDataXml->getElementsByTagName("name")->item(0)->nodeValue;

			array_push($langArr, array(
				'name' => $langName,
				'code' => $floder_
			));

			if($floder_ == $cfg_lang_dir){
				$langCurrentName = $langName;
			}
			$i++;
		}
	}
}

//多语言列表
$langList = array(
    'list' => $langArr,
    'currCode' => $cfg_lang_dir,
    'currName' => $langCurrentName
);

if(!$isAsyncRequest){
    $huoniaoTag->assign('langList', $langList);
    $huoniaoTag->assign('nowHour', getNowHour());   //获取当前时辰
}

//商家入驻配置信息
// $cfg_BusinessJoinConfig = getBusinessJoinConfig();
// if(!$isAsyncRequest){
//     $huoniaoTag->assign('businessConfig', $cfg_BusinessJoinConfig);
// }

//国际电话区号----基础库，如非新增号段，此处不需要修改
//如果此处修改了，请在多语言中同步修改
$internationalPhoneAreaCode = array(
	'0' => array('name' => '阿尔巴尼亚', 'code' => '355'),
    '1' => array('name' => '阿尔及利亚', 'code' => '213'),
    '2' => array('name' => '阿富汗', 'code' => '93'),
    '3' => array('name' => '阿根廷', 'code' => '54'),
    '4' => array('name' => '爱尔兰', 'code' => '353'),
    '5' => array('name' => '埃及', 'code' => '20'),
    '6' => array('name' => '埃塞俄比亚', 'code' => '251'),
    '7' => array('name' => '爱沙尼亚', 'code' => '372'),
    '8' => array('name' => '阿联酋', 'code' => '971'),
    '9' => array('name' => '阿鲁巴', 'code' => '297'),
    '10' => array('name' => '阿曼', 'code' => '968'),
    '11' => array('name' => '安道尔', 'code' => '376'),
    '12' => array('name' => '安哥拉', 'code' => '244'),
    '13' => array('name' => '安圭拉', 'code' => '1'),
    '14' => array('name' => '安提瓜和巴布达', 'code' => '1'),
    '15' => array('name' => '澳大利亚', 'code' => '61'),
    '16' => array('name' => '奥地利', 'code' => '43'),
    '17' => array('name' => '阿塞拜疆', 'code' => '994'),
    '18' => array('name' => '巴巴多斯', 'code' => '1'),
    '19' => array('name' => '巴布亚新几内亚', 'code' => '675'),
    '20' => array('name' => '巴哈马', 'code' => '1'),
    '21' => array('name' => '白俄罗斯', 'code' => '375'),
    '22' => array('name' => '百慕大', 'code' => '1'),
    '23' => array('name' => '巴基斯坦', 'code' => '92'),
    '24' => array('name' => '巴拉圭', 'code' => '595'),
    '25' => array('name' => '巴勒斯坦', 'code' => '970'),
    '26' => array('name' => '巴林', 'code' => '973'),
    '27' => array('name' => '巴拿马', 'code' => '507'),
    '28' => array('name' => '保加利亚', 'code' => '359'),
    '29' => array('name' => '巴西', 'code' => '55'),
    '30' => array('name' => '北马里亚纳群岛', 'code' => '1'),
    '31' => array('name' => '北马其顿', 'code' => '389'),
    '32' => array('name' => '贝宁', 'code' => '229'),
    '33' => array('name' => '比利时', 'code' => '32'),
    '34' => array('name' => '秘鲁', 'code' => '51'),
    '35' => array('name' => '冰岛', 'code' => '354'),
    '36' => array('name' => '博茨瓦纳', 'code' => '267'),
    '37' => array('name' => '波多黎各', 'code' => '1'),
    '38' => array('name' => '波兰', 'code' => '48'),
    '39' => array('name' => '玻利维亚', 'code' => '591'),
    '40' => array('name' => '伯利兹', 'code' => '501'),
    '41' => array('name' => '波斯尼亚和黑塞哥维那', 'code' => '387'),
    '42' => array('name' => '不丹', 'code' => '975'),
    '43' => array('name' => '布基纳法索', 'code' => '226'),
    '44' => array('name' => '布隆迪', 'code' => '257'),
    '45' => array('name' => '朝鲜', 'code' => '850'),
    '46' => array('name' => '赤道几内亚', 'code' => '240'),
    '47' => array('name' => '丹麦', 'code' => '45'),
    '48' => array('name' => '德国', 'code' => '49'),
    '49' => array('name' => '东帝汶', 'code' => '670'),
    '50' => array('name' => '多哥', 'code' => '228'),
    '51' => array('name' => '多米尼加', 'code' => '1'),
    '52' => array('name' => '多米尼克', 'code' => '1'),
    '53' => array('name' => '厄瓜多尔', 'code' => '593'),
    '54' => array('name' => '厄立特里亚', 'code' => '291'),
    '55' => array('name' => '俄罗斯', 'code' => '7'),
    '56' => array('name' => '法国', 'code' => '33'),
    '57' => array('name' => '法罗群岛', 'code' => '298'),
    '58' => array('name' => '梵蒂冈', 'code' => '379'),
    '59' => array('name' => '法属波利尼西亚', 'code' => '689'),
    '60' => array('name' => '法属圭亚那', 'code' => '594'),
    '61' => array('name' => '法属圣马丁', 'code' => '590'),
    '62' => array('name' => '斐济', 'code' => '679'),
    '63' => array('name' => '菲律宾', 'code' => '63'),
    '64' => array('name' => '芬兰', 'code' => '358'),
    '65' => array('name' => '佛得角', 'code' => '238'),
    '66' => array('name' => '福克兰群岛', 'code' => '500'),
    '67' => array('name' => '冈比亚', 'code' => '220'),
    '68' => array('name' => '刚果（布）', 'code' => '242'),
    '69' => array('name' => '刚果（金）', 'code' => '243'),
    '70' => array('name' => '格陵兰', 'code' => '299'),
    '71' => array('name' => '格林纳达', 'code' => '1'),
    '72' => array('name' => '格鲁吉亚', 'code' => '995'),
    '73' => array('name' => '哥伦比亚', 'code' => '57'),
    '74' => array('name' => '根西', 'code' => '44'),
    '75' => array('name' => '哥斯达黎加', 'code' => '506'),
    '76' => array('name' => '瓜德罗普', 'code' => '590'),
    '77' => array('name' => '关岛', 'code' => '1'),
    '78' => array('name' => '古巴', 'code' => '53'),
    '79' => array('name' => '圭亚那', 'code' => '592'),
    '80' => array('name' => '海地', 'code' => '509'),
    '81' => array('name' => '韩国', 'code' => '82'),
    '82' => array('name' => '哈萨克斯坦', 'code' => '7'),
    '83' => array('name' => '黑山', 'code' => '382'),
    '84' => array('name' => '荷兰', 'code' => '31'),
    '85' => array('name' => '荷兰加勒比区', 'code' => '599'),
    '86' => array('name' => '洪都拉斯', 'code' => '504'),
    '87' => array('name' => '加纳', 'code' => '233'),
    '88' => array('name' => '加拿大', 'code' => '1'),
    '89' => array('name' => '柬埔寨', 'code' => '855'),
    '90' => array('name' => '加蓬', 'code' => '241'),
    '91' => array('name' => '吉布提', 'code' => '253'),
    '92' => array('name' => '捷克', 'code' => '420'),
    '93' => array('name' => '吉尔吉斯斯坦', 'code' => '996'),
    '94' => array('name' => '基里巴斯', 'code' => '686'),
    '95' => array('name' => '津巴布韦', 'code' => '263'),
    '96' => array('name' => '几内亚', 'code' => '224'),
    '97' => array('name' => '几内亚比绍', 'code' => '245'),
    '98' => array('name' => '开曼群岛', 'code' => '1'),
    '99' => array('name' => '喀麦隆', 'code' => '237'),
    '100' => array('name' => '卡塔尔', 'code' => '974'),
    '101' => array('name' => '科科斯（基林）群岛', 'code' => '61'),
    '102' => array('name' => '克罗地亚', 'code' => '385'),
    '103' => array('name' => '科摩罗', 'code' => '269'),
    '104' => array('name' => '肯尼亚', 'code' => '254'),
    '105' => array('name' => '科特迪瓦', 'code' => '225'),
    '106' => array('name' => '科威特', 'code' => '965'),
    '107' => array('name' => '库克群岛', 'code' => '682'),
    '108' => array('name' => '库拉索', 'code' => '599'),
    '109' => array('name' => '莱索托', 'code' => '266'),
    '110' => array('name' => '老挝', 'code' => '856'),
    '111' => array('name' => '拉脱维亚', 'code' => '371'),
    '112' => array('name' => '黎巴嫩', 'code' => '961'),
    '113' => array('name' => '利比里亚', 'code' => '231'),
    '114' => array('name' => '利比亚', 'code' => '218'),
    '115' => array('name' => '列支敦士登', 'code' => '423'),
    '116' => array('name' => '立陶宛', 'code' => '370'),
    '117' => array('name' => '留尼汪', 'code' => '262'),
    '118' => array('name' => '罗马尼亚', 'code' => '40'),
    '119' => array('name' => '卢森堡', 'code' => '352'),
    '120' => array('name' => '卢旺达', 'code' => '250'),
    '121' => array('name' => '马达加斯加', 'code' => '261'),
    '122' => array('name' => '马恩岛', 'code' => '44'),
    '123' => array('name' => '马尔代夫', 'code' => '960'),
    '124' => array('name' => '马耳他', 'code' => '356'),
    '125' => array('name' => '马来西亚', 'code' => '60'),
    '126' => array('name' => '马拉维', 'code' => '265'),
    '127' => array('name' => '马里', 'code' => '223'),
    '128' => array('name' => '毛里求斯', 'code' => '230'),
    '129' => array('name' => '毛里塔尼亚', 'code' => '222'),
    '130' => array('name' => '马绍尔群岛', 'code' => '692'),
    '131' => array('name' => '马提尼克', 'code' => '596'),
    '132' => array('name' => '马约特', 'code' => '262'),
    '133' => array('name' => '美国', 'code' => '1'),
    '134' => array('name' => '美属萨摩亚', 'code' => '1'),
    '135' => array('name' => '美属维尔京群岛', 'code' => '1'),
    '136' => array('name' => '蒙古国', 'code' => '976'),
    '137' => array('name' => '孟加拉国', 'code' => '880'),
    '138' => array('name' => '蒙特塞拉特', 'code' => '1'),
    '139' => array('name' => '缅甸', 'code' => '95'),
    '140' => array('name' => '密克罗尼西亚联邦', 'code' => '691'),
    '141' => array('name' => '摩尔多瓦', 'code' => '373'),
    '142' => array('name' => '摩洛哥', 'code' => '212'),
    '143' => array('name' => '摩纳哥', 'code' => '377'),
    '144' => array('name' => '莫桑比克', 'code' => '258'),
    '145' => array('name' => '墨西哥', 'code' => '52'),
    '146' => array('name' => '纳米比亚', 'code' => '264'),
    '147' => array('name' => '南非', 'code' => '27'),
    '148' => array('name' => '南极洲', 'code' => '672'),
    '149' => array('name' => '南乔治亚和南桑威奇群岛', 'code' => '500'),
    '150' => array('name' => '南苏丹', 'code' => '211'),
    '151' => array('name' => '瑙鲁', 'code' => '674'),
    '152' => array('name' => '尼泊尔', 'code' => '977'),
    '153' => array('name' => '尼加拉瓜', 'code' => '505'),
    '154' => array('name' => '尼日尔', 'code' => '227'),
    '155' => array('name' => '尼日利亚', 'code' => '234'),
    '156' => array('name' => '纽埃', 'code' => '683'),
    '157' => array('name' => '诺福克岛', 'code' => '672'),
    '158' => array('name' => '挪威', 'code' => '47'),
    '159' => array('name' => '帕劳', 'code' => '680'),
    '160' => array('name' => '皮特凯恩群岛', 'code' => '64'),
    '161' => array('name' => '葡萄牙', 'code' => '351'),
    '162' => array('name' => '日本', 'code' => '81'),
    '163' => array('name' => '瑞典', 'code' => '46'),
    '164' => array('name' => '瑞士', 'code' => '41'),
    '165' => array('name' => '萨尔瓦多', 'code' => '503'),
    '166' => array('name' => '塞尔维亚', 'code' => '381'),
    '167' => array('name' => '塞拉利昂', 'code' => '232'),
    '168' => array('name' => '塞内加尔', 'code' => '221'),
    '169' => array('name' => '塞浦路斯', 'code' => '357'),
    '170' => array('name' => '塞舌尔', 'code' => '248'),
    '171' => array('name' => '萨摩亚', 'code' => '685'),
    '172' => array('name' => '沙特阿拉伯', 'code' => '966'),
    '173' => array('name' => '圣巴泰勒米', 'code' => '590'),
    '174' => array('name' => '圣诞岛', 'code' => '61'),
    '175' => array('name' => '圣多美和普林西比', 'code' => '239'),
    '176' => array('name' => '圣赫勒拿', 'code' => '290'),
    '177' => array('name' => '圣基茨和尼维斯', 'code' => '1'),
    '178' => array('name' => '圣卢西亚', 'code' => '1'),
    '179' => array('name' => '圣马丁', 'code' => '1'),
    '180' => array('name' => '圣马力诺', 'code' => '378'),
    '181' => array('name' => '圣皮埃尔和密克隆', 'code' => '508'),
    '182' => array('name' => '圣文森特和格林纳丁斯', 'code' => '1'),
    '183' => array('name' => '斯里兰卡', 'code' => '94'),
    '184' => array('name' => '斯洛伐克', 'code' => '421'),
    '185' => array('name' => '斯洛文尼亚', 'code' => '386'),
    '186' => array('name' => '斯瓦尔巴和扬马延', 'code' => '47'),
    '187' => array('name' => '斯威士兰', 'code' => '268'),
    '188' => array('name' => '苏丹', 'code' => '249'),
    '189' => array('name' => '苏里南', 'code' => '597'),
    '190' => array('name' => '所罗门群岛', 'code' => '677'),
    '191' => array('name' => '索马里', 'code' => '252'),
    '192' => array('name' => '泰国', 'code' => '66'),
    '193' => array('name' => '塔吉克斯坦', 'code' => '992'),
    '194' => array('name' => '汤加', 'code' => '676'),
    '195' => array('name' => '坦桑尼亚', 'code' => '255'),
    '196' => array('name' => '特克斯和凯科斯群岛', 'code' => '1'),
    '197' => array('name' => '特立尼达和多巴哥', 'code' => '1'),
    '198' => array('name' => '土耳其', 'code' => '90'),
    '199' => array('name' => '土库曼斯坦', 'code' => '993'),
    '200' => array('name' => '突尼斯', 'code' => '216'),
    '201' => array('name' => '托克劳', 'code' => '690'),
    '202' => array('name' => '图瓦卢', 'code' => '688'),
    '203' => array('name' => '瓦利斯和富图纳', 'code' => '681'),
    '204' => array('name' => '瓦努阿图', 'code' => '678'),
    '205' => array('name' => '危地马拉', 'code' => '502'),
    '206' => array('name' => '委内瑞拉', 'code' => '58'),
    '207' => array('name' => '文莱', 'code' => '673'),
    '208' => array('name' => '乌干达', 'code' => '256'),
    '209' => array('name' => '乌克兰', 'code' => '380'),
    '210' => array('name' => '乌拉圭', 'code' => '598'),
    '211' => array('name' => '乌兹别克斯坦', 'code' => '998'),
    '212' => array('name' => '西班牙', 'code' => '34'),
    '213' => array('name' => '希腊', 'code' => '30'),
    '214' => array('name' => '新加坡', 'code' => '65'),
    '215' => array('name' => '新喀里多尼亚', 'code' => '687'),
    '216' => array('name' => '新西兰', 'code' => '64'),
    '217' => array('name' => '匈牙利', 'code' => '36'),
    '218' => array('name' => '西撒哈拉', 'code' => '212'),
    '219' => array('name' => '叙利亚', 'code' => '963'),
    '220' => array('name' => '牙买加', 'code' => '1'),
    '221' => array('name' => '亚美尼亚', 'code' => '374'),
    '222' => array('name' => '也门', 'code' => '967'),
    '223' => array('name' => '意大利', 'code' => '39'),
    '224' => array('name' => '伊拉克', 'code' => '964'),
    '225' => array('name' => '伊朗', 'code' => '98'),
    '226' => array('name' => '印度', 'code' => '91'),
    '227' => array('name' => '英国', 'code' => '44'),
    '228' => array('name' => '英属维尔京群岛', 'code' => '1'),
    '229' => array('name' => '英属印度洋领地', 'code' => '246'),
    '230' => array('name' => '印尼', 'code' => '62'),
    '231' => array('name' => '以色列', 'code' => '972'),
    '232' => array('name' => '约旦', 'code' => '962'),
    '233' => array('name' => '越南', 'code' => '84'),
    '234' => array('name' => '赞比亚', 'code' => '260'),
    '235' => array('name' => '泽西', 'code' => '44'),
    '236' => array('name' => '乍得', 'code' => '235'),
    '237' => array('name' => '直布罗陀', 'code' => '350'),
    '238' => array('name' => '智利', 'code' => '56'),
    '239' => array('name' => '中非', 'code' => '236'),
    '240' => array('name' => '中国', 'code' => '86'),
    '241' => array('name' => '中国澳门', 'code' => '853'),
    '242' => array('name' => '中国台湾', 'code' => '886'),
    '243' => array('name' => '中国香港', 'code' => '852')
);
//页面调用
$internationalPhoneSection = array('name' => '中国大陆', 'code' => 86);
$configHandels = new handlers('siteConfig', 'internationalPhoneSection');
$moduleConfig  = $configHandels->getHandle();
if($moduleConfig && $moduleConfig['state'] == 100){
	$internationalPhoneSection = $moduleConfig['info'];
}
if(!$isAsyncRequest){
    $huoniaoTag->assign('internationalPhoneSection', $internationalPhoneSection);
}

//聚合数据接口-快递公司
$juhe_express_company = array(
    "sf" => "顺丰",
    "sto" => "申通",
    "yt" => "圆通",
    "yd" => "韵达",
    "yd56" => "韵达快运",
    "tt" => "天天",
    "ems" => "EMS",
    "zto" => "中通",
    "ht" => "汇通",
    "qf" => "全峰",
    "db" => "德邦",
    "gt" => "国通",
    "rfd" => "如风达",
    "jd" => "京东快递",
    "zjs" => "宅急送",
    "jitu" => "极兔速递",
    "ztky" => "中铁快运",
    "jiaji" => "佳吉快运",
    "suer" => "速尔快递",
    "xfwl" => "信丰物流",
    "yousu" => "优速快递",
    "zhongyou" => "中邮物流",
    "yimidida" => "壹米滴答",
    "tdhy" => "天地华宇",
    "axd" => "安信达快递",
    "kuaijie" => "快捷速递",
    "dhl" => "DHL",
    "ds" => "D速物流",
    "fedexcn" => "FEDEX国内快递",
    "ocs" => "OCS",
    "tnt" => "TNT",
    "coe" => "东方快递",
    "cxwl" => "传喜物流",
    "cs" => "城市100",
    "cszx" => "城市之星物流",
    "aj" => "安捷快递",
    "bfdf" => "百福东方",
    "chengguang" => "程光快递",
    "dsf" => "递四方快递",
    "ctwl" => "长通物流",
    "feibao" => "飞豹快递",
    "ane66" => "安能快递",
    "ztoky" => "中通快运",
    "ycgky" => "远成物流",
    "ycky" => "远成快运",
    "youzheng" => "邮政快递",
    "bsky" => "百世快运",
    "suning" => "苏宁快递",
    "anneng" => "安能物流",
    "emsg" => "EMS国际",
    "fedex" => "Fedex国际",
    "ups" => "UPS国际快递",
    "aae" => "AAE全球专递",
    "else" => "其他"
);

/**
 * es 配置文件
 */
$esConfig_path = HUONIAOINC.'/config/esConfig.inc.php'; // es配置文件位置
if(file_exists($esConfig_path)){
    $esConfig = require_once($esConfig_path);
}else{
    $esConfig = array();
}

if(!$isAsyncRequest){
    $huoniaoTag->assign('juhe_express_company', $juhe_express_company);
    
    if($esConfig){
        $huoniaoTag->assign("es_status", (int)$esConfig['open']);
    }else{
        $huoniaoTag->assign("es_status", 0);
    }
}


//默认银行数据
$bankConfig = array(
    "ICBC" => "中国工商银行",
    "CMB" => "招商银行",
    "CCB" => "中国建设银行",
    "BOC" => "中国银行",
    "ABC" => "中国农业银行",
    "COMM" => "交通银行",
    "SPDB" => "浦发银行",
    "GDB" => "广发银行",
    "CITIC" => "中信银行",
    "CEB" => "中国光大银行",
    "CIB" => "兴业银行",
    "SPABANK" => "平安银行",
    "CMBC" => "中国民生银行",
    "PSBC" => "中国邮政储蓄银行",
    "EGBANK" => "恒丰银行",
    "HXBANK" => "华夏银行",
    "HSBC" => "汇丰银行",
    "other" => "其他银行",
);

if(!$isAsyncRequest){
    $huoniaoTag->assign('bankConfig', $bankConfig);
}



/**
 * 判断是否为微信小程序端
 * @return bool
 */
function isWxMiniprogram(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'micromessenger') !== false && (strpos($useragent, 'wechatdevtools') !== false || strpos($useragent, 'miniprogram') !== false)) {
        return true;
    } else {
        if($_REQUEST['platform_name'] == 'wx_miniprogram'){
            return true;
        }
        return false;
    }
}


/**
 * 判断是否为百度小程序端
 * @return bool
 */
function isBaiDuMiniprogram(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'swan-baiduboxapp') !== false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为QQ小程序端
 * @return bool
 */
function isQqMiniprogram(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'qq') !== false && strpos($useragent, 'miniprogram') !== false) {
        return true;
    } else {
        return false;
    }
}


/**
 * 判断是否为抖音小程序端
 * @return bool
 */
function isByteMiniprogram(){
    $useragent = strtolower($_SERVER['HTTP_USER_AGENT']);
    if (strpos($useragent, 'toutiaomicroapp') !== false) {
        return true;
    } else {
        if($_REQUEST['platform_name'] == 'dy_miniprogram'){
            return true;
        }
        return false;
    }
}

/**
 *  更新SESSION
 *
 * @param     $name
 * @param     $value
 */
function putSession($name, $value = ''){
    session_start();
    if(!$value){
        unset($_SESSION[$name]);
    }else{
        $_SESSION[$name] = $value;
    }
    session_write_close();
}


//生成附件动态地址
function getAttachemntFile($file){
    global $cfg_attachment;
    return $cfg_attachment . $file;
}


//将指定数据用逗号分隔，并对数据类型验证
function convertArrToStrWithComma($arr, $int = true){
    $data = array();
    if($arr == '' || $arr == 'pricePlaceholder' || (!is_array($arr) && strstr($arr, 'Placeholder'))) return '';
    if(is_array($arr) && !empty($arr)){
        foreach($arr as $val){
            $val = $int ? (int)$val : $val;
            array_push($data, $val);
        }
    }
    elseif(strstr($arr, ',')){
        $_arr = explode(',', $arr);
        foreach($_arr as $val){
            $val = $int ? (int)$val : $val;
            array_push($data, $val);
        }
    }elseif($arr !== '' && $arr != NULL){
        $arr = (int)$arr;
        if($arr){
            array_push($data, (int)$arr);
        }
    }
    return implode(',', $data);
}


//删除不可见字符
function removeInvisibleCharacters($str) {
    
    // 正则表达式匹配所有不可见字符
    $pattern = "/[\x{007f}-\x{009f}]|\x{00ad}|[\x{0483}-\x{0489}]|[\x{0559}-\x{055a}]|\x{058a}|[\x{0591}-\x{05bd}]|\x{05bf}|[\x{05c1}-\x{05c2}]|[\x{05c4}-\x{05c7}]|[\x{0606}-\x{060a}]|[\x{063b}-\x{063f}]|\x{0674}|[\x{06e5}-\x{06e6}]|\x{070f}|[\x{076e}-\x{077f}]|\x{0a51}|\x{0a75}|\x{0b44}|[\x{0b62}-\x{0b63}]|[\x{0c62}-\x{0c63}]|[\x{0ce2}-\x{0ce3}]|[\x{0d62}-\x{0d63}]|\x{135f}|[\x{200b}-\x{200f}]|[\x{2028}-\x{202e}]|\x{2044}|\x{2071}|[\x{f701}-\x{f70e}]|[\x{f710}-\x{f71a}]|\x{fb1e}|[\x{fc5e}-\x{fc62}]|\x{feff}|\x{fffc}/u";
    
    // 使用正则表达式替换掉所有不可见字符
    $cleanString = preg_replace($pattern, '', $str);
    
    return $cleanString;
}


//执行计划任务
//使用系统内置方式执行
$cfg_cronType = (int)$cfg_cronType;
if($cfg_cronType){
    Cron::run();
}


