<?php
/**
 * 火鸟门户初始安装包
 *
 * 安装教程：
 * Linux:https://help.kumanyun.com/help-11-632.html
 * Windows:https://help.kumanyun.com/help-8-631.html
 * 技术支持：
 *      QQ: 414644502
 *     TEL: 0512-67581578
 *
 * @version        $Id: index.php 2016-08-19 下午21:32:20 $
 * @package        HuoNiao.Install
 * @copyright      Copyright (c) 2013 - 2022, 火鸟门户系统(苏州酷曼软件技术有限公司), Inc.
 * @link           官网：https://www.kumanyun.com  演示站：https://www.ihuoniao.cn/
 */
$commonInc = dirname(__FILE__).'/../include/common.inc.php';
if(file_exists($commonInc)){
  require_once($commonInc);
}else{
  error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
  ini_set("set_time_limit",1000);
  ini_set("magic_quotes_runtime",0);
  session_start();
  ini_set('display_errors', 'On'); //Debug设置
  define('HUONIAOBUG', 0); //开启调试
}

//https判断
$https = 0;
if((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') || (isset($_SERVER['HTTP_X_CLIENT_SCHEME']) && $_SERVER['HTTP_X_CLIENT_SCHEME'] == 'https')){
    $https = 1;
}

//跨站
$userIni = 0;
if(file_exists(dirname(__FILE__).'/../.user.ini')){
	$userIni = 1;
}


define('OFFICIAL', 'https://www.kumanyun.com');
define('CLOUD', 'https://www.kumanyun.com');
define('version', 'V3');
define('charset', 'utf-8');
define('HUONIAOINC',dirname(__FILE__).'/../include');
define('HUONIAODATA',dirname(__FILE__).'/../data');
define('HUONIAOROOT',preg_replace("#[\\\\\/]install#", '', dirname(__FILE__)));
header("Content-Type: text/html; charset=".charset);
define('HTTPHOST', $_SERVER['HTTP_HOST']);

require_once(HUONIAOINC.'/class/httpdown.class.php');
require_once(HUONIAOINC.'/class/file.class.php');

function RunMagicQuotes_(&$svar){
  if(!get_magic_quotes_gpc()){
    if( is_array($svar)){
      foreach($svar as $_k => $_v) $svar[$_k] = RunMagicQuotes_($_v);
    }else{
      if( strlen($svar)>0 && preg_match('#^(_GET|_POST|_COOKIE)#',$svar)){
        exit('Request var not allow!');
      }
      $svar = addslashes($svar);
    }
  }
  return $svar;
}

//检查和注册外部提交的变量
function CheckRequest_(&$val){
  if (is_array($val)){
    foreach ($val as $_k=>$_v) {
      if($_k == 'nvarname') continue;
      CheckRequest_($_k);
      CheckRequest_($val[$_k]);
    }
  }else{
    if( strlen($val)>0 && preg_match('#^(_GET|_POST|_COOKIE)#',$val)){
      exit('Request var not allow!');
    }
  }
}

CheckRequest_($_REQUEST);

foreach(Array('_GET','_POST','_COOKIE') as $_request){
  foreach($$_request as $_k => $_v){
    if($_k == 'nvarname') ${$_k} = $_v;
    else ${$_k} = RunMagicQuotes_($_v);
  }
}


$isNext = true;

//服务器信息、组件检测、目录权限
$sp_name = $_SERVER['SERVER_NAME'];
$sp_os = PHP_OS;
$sp_server = $_SERVER['SERVER_SOFTWARE'];
$phpv = phpversion();
$installDir = preg_replace("#[\\\\\/]install#", '', dirname(__FILE__));

//验证PHP版本
$phpVersion = explode("-", $phpv);
$phpVersion = $phpVersion[0];
$phpVersion = str_replace('.', '', $phpVersion);
$phpVersion = substr($phpVersion, 0, 2);
$phpVersion = (int)$phpVersion;
if($phpVersion < 74 || $phpVersion > 74){
  $isNext = false;
  $phpv = $phpv . "&nbsp;&nbsp;&nbsp;&nbsp;<font color='#ff0000'>请使用PHP7.4进行安装</font>";
}


//GD库版本
function gdversion(){
  //没启用php.ini函数的情况下如果有GD默认视作2.0以上版本
  if(!function_exists('phpinfo')){
      if(function_exists('imagecreate')) return '2.0';
      else return 0;
  }else{
    ob_start();
    phpinfo(8);
    $module_info = ob_get_contents();
    ob_end_clean();
    if(preg_match("/\bgd\s+version\b[^\d\n\r]+?([\d\.]+)/i", $module_info, $matches)){
      $gdversion_h = $matches[1];
    }else{
      $gdversion_h = 0;
    }
    return $gdversion_h;
  }
}

if(ini_get('allow_url_fopen')){
  $sp_allow_url_fopen = '<s></s>';
}else{
  $isNext = false;
  $sp_allow_url_fopen = '<s class="err"></s>';
}
// $sp_allow_url_fopen = (ini_get('allow_url_fopen') ? '<s></s>' : '<s class="err"></s>');
$sp_gd = gdversion();
if($sp_gd > 0){
  $sp_gd = '<s></s>';
}else{
  $isNext = false;
  $sp_gd = '<s class="err"></s>';
}
// $sp_gd = ($sp_gd>0 ? '<s></s>' : '<s class="err"></s>');

if(function_exists('curl_init')){
  $sp_curl = '<s></s>';
}else{
  $isNext = false;
  $sp_curl = '<s class="err"></s>';
}
// $sp_curl = (function_exists('curl_init') ? '<s></s>' : '<s class="err"></s>');

if(function_exists('mysqli_connect')){
  $sp_mysql = '<s></s>';
}else{
  $isNext = false;
  $sp_mysql = '<s class="err"></s>';
}
// $sp_mysql = (function_exists('mysql_connect') ? '<s></s>' : '<s class="err"></s>');

//判断ZIP
$zipArchive = false;
$file = 'check.txt';
$zipfile = 'check.zip';
if (class_exists('ZipArchive')) {
	$zip = new ZipArchive;
	if ($zip->open($zipfile, ZIPARCHIVE::CREATE) === TRUE) {
		$zip->addFile($file);
		$zip->close();
		$zipArchive = true;
	}
}

if($zipArchive){
	$sp_zip = '<s></s>';
}else{
	$isNext = false;
	$sp_zip = '<s class="err"></s>';
}

$isNext = false;
$sp_huoniao = '<a href="https://help.kumanyun.com/help-2-775.html" target="_blank" style="color: #09f; text-decoration: underline;" title="安装教程">huoniao</a><s class="err"></s>';
if(extension_loaded('swoole_loader')){
    $sp_huoniao = 'huoniao<s></s>';
    $isNext = true;
}

$sp_testdirs = array(
  '/',
  '/include/*',
  '/install/*',
  '/index.php'
);

//测试写入文件
function testWrite($d){
  $tfile = '_km.txt';
  $d = preg_replace("#\/$#", '', $d);
  $fp = @fopen($d.'/'.$tfile,'w');
  if(!$fp){
    return false;
  }else{
    fclose($fp);
    $rs = @unlink($d.'/'.$tfile);
    if($rs) return true;
    else return false;
  }
}

if(empty($step)){
  include('./templates/index.html');
  die;
}


//第一步：登录验证
if($step == 1){

  DropCookie('module');
  DropCookie('moduleNames');

  if(empty($_POST) || empty($uname) || empty($upawd)){
    die(json_encode(array("state" => 200, "info" => "请填写完整！")));
  }else{
    $security = checkAccount($uname, $upawd);
    if(!empty($security)){
      die(json_encode(array("state" => 200, "info" => $security)));
    }else{
      die(json_encode(array("state" => 100, "info" => "验证成功！")));
    }
  }


//第二步：基本配置
}elseif($step == 2){

  if(empty($_POST)){
    $moduleArr = getModule();
    if($moduleArr == null || empty($moduleArr)){
      die(json_encode(array("state" => 500, "info" => "获取失败，请重新获取！")));
    }else{
      die(json_encode($moduleArr));
    }

  //提交验证
  }elseif(!empty($_POST)){

    $moduleList = $module;
    if(empty($moduleList)) $err = '请选择要安装的模块！';

    $moduleList = 'system,'.$moduleList;
    $moduleNames = '系统默认程序,'.$moduleNames;

    if(empty($err) && empty($dbhost)){
      $err = '请输入主机地址';
    }

    if(empty($err) && empty($dbname)){
      $err = '请输入数据库名称';
    }

    if(empty($err) && empty($dbuser)){
      $err = '请输入数据库用户';
    }

    if(empty($err) && empty($dbpwd)){
      $err = '请输入数据库密码';
    }

    if(empty($err) && empty($dbprefix)){
      $err = '请输入数据表前缀';
    }

    if(empty($err) && empty($adminuser)){
      $err = '请输入管理帐户';
    }

    if(empty($err) && empty($adminpwd)){
      $err = '请输入管理密码';
    }

    if(empty($err)) $conn = mysqli_connect($dbhost, $dbuser, $dbpwd, $dbname) or die(json_encode(array("state" => 200, "info" => "数据库服务器错误或登录密码无效！")));
    mysqli_query($conn, "CREATE DATABASE IF NOT EXISTS `".$dbname."`;");
    if(empty($err)) mysqli_select_db($conn, $dbname) or $err = '选择数据库失败，可能是你没权限，请预先创建一个数据库！';

    //验证MySql版本
    $rs = mysqli_query($conn, "SELECT VERSION();");
    $row = mysqli_fetch_array($rs);
    $mysqlVersions = explode('.', trim($row[0]));
    $mysqlVersion = $mysqlVersions[0].".".$mysqlVersions[1];
    if($mysqlVersion < 5.4){
      $err = '您的数据库版本为'.$mysqlVersion.'，请升级至5.5或者5.6或者5.7版本！';
    }
    if($mysqlVersion >= 8.0){
        $err = '您的数据库版本为'.$mysqlVersion.'，请使用5.5或者5.6或者5.7版本！';
    }


    if(empty($err)){

      DropCookie('module');
      DropCookie('moduleNames');

      PutCookie("module", $moduleList);
      PutCookie("moduleNames", $moduleNames);
      $_SESSION['dbhost']   = $dbhost;
      $_SESSION['dbname']   = $dbname;
      $_SESSION['dbuser']   = $dbuser;
      $_SESSION['dbpwd']    = $dbpwd;
      $_SESSION['dbprefix'] = $dbprefix;
      $_SESSION['adminuser'] = $adminuser;
      $_SESSION['adminpwd']  = $adminpwd;
      die(json_encode(array("state" => 100, "info" => "配置成功！")));
    }else{
      die(json_encode(array("state" => 200, "info" => $err)));
    }

  }

//第三步：创建数据库、默认数据
}elseif($step == 3){

  // $moduleList = $_SESSION['module'];
  // $checkModule = checkModule($moduleList);
  // if($checkModule['state'] == 200) die(json_encode(array("state" => 200, "info" => "访问超时，请重新安装！")));

  $dbhost   = $_SESSION['dbhost'];
  $dbname   = $_SESSION['dbname'];
  $dbuser   = $_SESSION['dbuser'];
  $dbpwd    = $_SESSION['dbpwd'];
  $dbprefix = $_SESSION['dbprefix'];
  $adminuser = $_SESSION['adminuser'];
  $adminpwd  = $_SESSION['adminpwd'];

  if(empty($dbhost) || empty($dbname) || empty($dbuser) || empty($dbpwd) || empty($dbprefix) || empty($adminuser) || empty($adminpwd)){
    header('location:?step=4');
  }

  $conn = mysqli_connect($dbhost, $dbuser, $dbpwd, $dbname) or die(json_encode(array("state" => 200, "info" => "数据库配置失败，无法连接数据库，请重新设定！")));
  mysqli_select_db($conn, $dbname) or die(json_encode(array("state" => 200, "info" => "选择数据库失败，可能是你没权限，请预先创建一个数据库！")));

  //获得数据库版本信息
  $rs = mysqli_query($conn, "SELECT VERSION();");
  $row = mysqli_fetch_array($rs);
  $mysqlVersions = explode('.', trim($row[0]));
  $mysqlVersion = $mysqlVersions[0].".".$mysqlVersions[1];
  $dblang = 'utf8';
  mysqli_query($conn, "SET NAMES '$dblang',character_set_client=binary,sql_mode='';");


  $fp = fopen(dirname(__FILE__)."/dbinfo.inc.php","r");
  $dbinfo = fread($fp, filesize(dirname(__FILE__)."/dbinfo.inc.php"));
  fclose($fp);

  //dbinfo.inc.php
  $dbinfo = str_replace("~host", $dbhost, $dbinfo);
  $dbinfo = str_replace("~name", $dbname, $dbinfo);
  $dbinfo = str_replace("~user", $dbuser, $dbinfo);
  $dbinfo = str_replace("~pass", $dbpwd, $dbinfo);
  $dbinfo = str_replace("~prefix", $dbprefix, $dbinfo);
  $dbinfo = str_replace("~charset", $dblang, $dbinfo);

  @chmod(HUONIAOINC, 0777);
  $fp = fopen(HUONIAOINC."/dbinfo.inc.php", "w") or die(json_encode(array("state" => 200, "info" => "写入配置失败，请检查../include目录是否可写入！")));
  fwrite($fp, $dbinfo);
  fclose($fp);

  if($mysqlVersion >= 4.1) $sql4tmp = "ENGINE=MyISAM DEFAULT CHARSET=".$dblang;

  //创建数据表结构
  $query = '';
  $fp = fopen(dirname(__FILE__).'/db_structure.txt','r');
  while(!feof($fp)){
    $line = rtrim(fgets($fp, 1024));
    if(preg_match("#;$#", $line)){
      $query .= $line."\n";
      $query = str_replace('#@__', $dbprefix, $query);
      $query = str_replace('NULLDEFAULT', 'NULL DEFAULT', $query);
      if($mysqlVersion < 4.1){
        $rs = mysqli_query($conn, $query);
      }else{
        if(preg_match('#CREATE#i', $query)){
          $rs = mysqli_query($conn, preg_replace("#TYPE=MyISAM#i", $sql4tmp, $query));
        }else{
          $rs = mysqli_query($conn, $query);
        }
      }
      $query='';
    }else if(!preg_match("#^(\/\/|--)#", $line)){
      $query .= $line;
    }
  }
  fclose($fp);

  //导入默认数据
  $query = '';
  $fp = fopen(dirname(__FILE__).'/db_default.txt','r');
  while(!feof($fp)){
    $line = rtrim(fgets($fp, 1024));
    if(preg_match("#;$#", $line)){
      $query .= $line;
      $query = str_replace('#@__', $dbprefix, $query);
      $query = str_replace('NULLDEFAULT', 'NULL DEFAULT', $query);
      if($mysqlVersion < 4.1) $rs = mysqli_query($query, $conn);
      else $rs = mysqli_query($conn, str_replace('#~lang~#', $dblang, $query));
      $query='';
    }else if(!preg_match("#^(\/\/|--)#", $line)){
      $query .= $line;
    }
  }
  fclose($fp);

  //生成密码
  function _getSaltedHash($string){
    $salt = substr(md5(time()), 0, 7);
    return $salt.sha1($salt.$string);
  }

  //增加管理员帐号
  $pwd = _getSaltedHash($adminpwd);
  $adminquery = "INSERT INTO `{$dbprefix}member` (`mtype`, `username`, `password`, `nickname`, `mgroupid`, `state`) VALUES (0, '$adminuser', '$pwd', '$adminuser', 1, 0);";
  mysqli_query($conn, $adminquery);

  die(json_encode(array("state" => 100, "info" => "数据库配置成功，进行下一步远程安装...")));

//第四步：远程下载
//根据选择的模块，1.远程下载安装包，2.解压，3.配置数据库等
}elseif($step == 4){

  $ok = false;
  //$security = checkAccount();
  //if(!empty($security)) die(json_encode(array("state" => 200, "info" => "账号验证失败，请重新登录验证！")));

  $module = GetCookie('module');
  $moduleNames = GetCookie('moduleNames');
  if(empty($module)) die(json_encode(array("state" => 200, "info" => "模块验证超时，请重新安装！")));

  $moduleArr = explode(",", $module);
  $moduleNamesArr = explode(",", $moduleNames);
  $mod = $moduleArr[0];
  $modName = $moduleNamesArr[0];

  if(empty($progress)){

    if($modName == "系统默认程序"){
      $modName = $modName."，大约需要1分钟";
    }

    $title = '正在从云服务器远程下载：'.$modName;
    die(json_encode(array("state" => 100, "info" => $title, "process" => 1)));
  }

  //下载
  elseif($progress == 1){

    $checkModule = checkModule($mod);
    if($checkModule['state'] == 200){
      die(json_encode(array("state" => 200, "info" => "模块验证失败，请选择您在官网购买的模块！")));
    }

    /* 下载文件 */
    $savefile  = dirname(__FILE__)."/module/".$mod.".zip";

    //如果本地存在，则不需要远程下载
    if(!file_exists($savefile)){
      $file = new httpdown();
      $file->OpenUrl($checkModule['info']); # 远程文件地址
      $file->SaveToBin($savefile); # 保存路径及文件名
      $file->Close(); # 释放资源

      if(!file_exists($savefile) || filesize($savefile) < 200 * 1024) die(json_encode(array("state" => 200, "info" => "模块下载失败，请重试！")));
      clearstatcache();
    }

    $title = '下载成功，正在解压安装包';
    die(json_encode(array("state" => 100, "info" => $title, "process" => 2)));
  }

  //解压
  elseif($progress == 2){

    $zipfile  = dirname(__FILE__)."/module/".$mod.".zip";
    $savepath = dirname(__FILE__)."/module/".$mod;

    if(!file_exists($zipfile) || filesize($zipfile) < 200 * 1024) die(json_encode(array("state" => 200, "info" => "安装包错误，安装失败！")));
    clearstatcache();

    $zip = new ZipArchive;
    $zipOpen = $zip->open($zipfile);
    if($zipOpen === TRUE){
      $zip->extractTo($savepath);
      $zip->close();
    }else{
      die(json_encode(array("state" => 200, "info" => "解压失败，请检查您的服务器配置！错误信息：" . $zipOpen)));
    }

    @unlink($zipfile); //删除压缩包

    if(is_dir($savepath)){

      $title = '解压成功，正在配置安装包相关信息';
      die(json_encode(array("state" => 100, "info" => $title, "process" => 3)));

    }else{

      die(json_encode(array("state" => 200, "info" => "解压失败，请重新安装！")));

    }


  }

  //配置
  elseif($progress == 3){

    //从session中删除已经安装好的
    array_splice($moduleArr, 0, 1);
    array_splice($moduleNamesArr, 0, 1);

    PutCookie('module', join(",", $moduleArr));
    PutCookie('moduleNames', join(",", $moduleNamesArr));

    $savepath = dirname(__FILE__)."/module/".$mod;

    //系统模块
    if($mod == 'system'){

      //移动后台文件夹至相应目录
      $current_dir = opendir($savepath);
      while(($file = readdir($current_dir)) !== false){
        $sub_dir = $savepath . "/" . $file;
        if($file == '.' || $file == '..'){
          continue;
        }else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, HUONIAOROOT."/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/".$file)));
            }
          }else{
            //判断是否移动成功
            if(!moveDir($sub_dir, HUONIAOROOT."/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/".$file)));
            }
          }
        }
      }


    //其他模块
    }else{

      //移动后台文件夹至相应目录
      $current_dir = opendir($savepath."/admin");
      while(($file = readdir($current_dir)) !== false) {
        $sub_dir = $savepath."/admin" . "/" . $file;
        if($file == '.' || $file == '..') {
          continue;
        }else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, HUONIAOROOT."/admin/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/admin/".$file)));
            }
          }else{
            //判断是否移动成功
            if(!moveDir($sub_dir, HUONIAOROOT."/admin/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/admin/".$file)));
            }
          }
        }
      }

      //移动前台文件夹至相应目录
      $current_dir = opendir($savepath."/front");
      while(($file = readdir($current_dir)) !== false) {
        $sub_dir = $savepath."/front" . "/" . $file;
        if($file == '.' || $file == '..') {
          continue;
        }else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, HUONIAOROOT."/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/".$file)));
            }
          }else{
            //判断是否移动成功
            if(!moveDir($sub_dir, HUONIAOROOT."/".$file, true)){
              die(json_encode(array("state" => 200, "info" => "文件移动失败，请给网站目录设置读写权限后重新安装！<br />".HUONIAOROOT."/".$file)));
            }
          }
        }
      }


      //遍历文件夹，获取文件和文件夹列表
      $fileList = traverseFloder($savepath);
      $fileList = singelArray($fileList);

      $files = "";
      foreach($fileList as $file){
        $file = iconv("UTF-8", "gb2312", $file);
        $file = str_replace($savepath.'/config.xml', '', $file);
        $file = str_replace($savepath."/front", '../..', str_replace($savepath."/admin", '..', $file));
        if($file != "../../" && $file != "../" && $file != ""){
          if($file[strlen($file)-1] == "/"){
            $f = explode("/", $file);
            if($name == $f[count($f) - 2]){
              $files .= $file."\r\n";
            }
          }else{
            $files .= $file."\r\n";
          }
        }
      }

      //读取模块配置文件
      if (file_exists($savepath.'/config.xml')){
        $xml = file_get_contents($savepath.'/config.xml');
        $xml = simplexml_load_string($xml);
        $baseinfo = $xml->baseinfo;
        $title    = $baseinfo->title;
        $name     = $baseinfo->name;
        $version  = $baseinfo->version;
        $note     = $baseinfo->note;

        $subnav   = RpLine_(addslashes(base64_decode($xml->subnav)));
        $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));
        $delsql   = str_replace("&#39;", "'", base64_decode($xml->delsql));

        $moduleSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_module` WHERE `parentid` = 0 ORDER BY `weight`");
        $moduleResult = $dsql->dsqlOper($moduleSql, "results");

        if($moduleResult){
          $parentid = $moduleResult[0]['id'];

          //先删除数据表
          $uninstallSql   = explode(";",$delsql);
          foreach($uninstallSql as $v){
            $archives = $dsql->SetQuery($v);
            $dsql->dsqlOper($archives, "update");
          }
          //建立表结构
          $querys = explode(';', $setupsql);
          foreach($querys as $q){
            $archives = $dsql->SetQuery($q);
            $dsql->dsqlOper($archives.';', "update");
          }

          $moduleSql = $dsql->SetQuery("INSERT INTO `#@__site_module` (`parentid`, `title`, `name`, `icon`, `note`, `state`, `weight`, `subnav`, `filelist`, `delsql`, `version`, `date`) VALUES ('$parentid', '$title', '$name', '', '$note', 0, 50, '$subnav', '".RpLine_($files)."', '".RpLine_(addslashes($delsql))."', '$version', ".GetMkTime(time()).")");
          $moduleResult = $dsql->dsqlOper($moduleSql, "update");

          if($moduleResult != "ok") die(json_encode(array("state" => 100, "info" => "数据库文件配置失败，操作终止！")));
        }

      }


    }


    //成功
    if(empty($moduleArr)){
      $title = '安装成功！';
      $ok = true;

      installSuccess();
      $_SESSION['installOk'] = true;

      DropCookie('module');
      DropCookie('moduleNames');

      die(json_encode(array("state" => 100, "info" => $title, "ok" => $ok)));

    //继续安装下一个
    }else{
      $title = '配置成功，继续安装下一个模块！';
    }
    die(json_encode(array("state" => 100, "info" => $title, "process" => 0)));

  }


//第五步：安装成功
}elseif($step == 7){

  //验证是否安装成功
  //if($_SESSION['installOk']){

    //更新系统配置
    $fp = fopen(HUONIAOINC."/config/siteConfig.inc.php","r");
    $siteConfig = fread($fp, filesize(HUONIAOINC."/config/siteConfig.inc.php"));
    fclose($fp);

    $siteConfig = str_replace("~domain", HTTPHOST, $siteConfig);

    $fp = fopen(HUONIAOINC."/config/siteConfig.inc.php", "w");
    fwrite($fp, $siteConfig);
    fclose($fp);

    //删除安装包
    if(deldir('../install')){
      die(json_encode(array("state" => 100, "info" => "删除成功！")));
    }else{
      die(json_encode(array("state" => 200, "info" => "安装文件删除失败，请手动将根目录的install文件夹移除！")));
    }
    //header('location:../');

  //}else{
    //header("location:?step=1");
  //}

}




//遍历文件夹
function traverseFloder($path = '.') {
  $fileList = array();
  $current_dir = opendir($path);    //opendir()返回一个目录句柄,失败返回false
  while(($file = readdir($current_dir)) !== false) {    //readdir()返回打开目录句柄中的一个条目
    $sub_dir = $path . "/" . $file;    //构建子目录路径
    if($file == '.' || $file == '..') {
      continue;
    } else if(is_dir($sub_dir)) {
      $fileList[] = $sub_dir."/";
      $fileList[] = traverseFloder($sub_dir);
    } else {
      $fileList[] = $sub_dir;
    }
  }
  return $fileList;
}

//遍历多维数组为一维数组
function singelArray($arr) {
  static $data;
  if (!is_array ($arr) && $arr != NULL) {
    return $data;
  }
  foreach ($arr as $key => $val ) {
    if (is_array ($val)) {
      singelArray ($val);
    } else {
      if($val != NULL){
        $data[]=$val;
      }
    }
  }
  return $data;
}


//换行格式化
function RpLine_($str){
  $str = str_replace("\r", "\\r", $str);
  $str = str_replace("\n", "\\n", $str);
  return $str;
}



//获取加密参数
function getEncrypt($data){
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, CLOUD.'/include/ajax.php?action=encrypt'.$data);
  curl_setopt($curl, CURLOPT_HEADER, 0);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_TIMEOUT, 20);
  curl_setopt($curl, CURLOPT_USERAGENT, "kumanyun/install");
  $con = curl_exec($curl);
  curl_close($curl);
  return $con;
}


//验证账户
function checkAccount($uname = '', $upawd = ''){
  if(empty($uname)) $uname = $_SESSION['uname'];
  if(empty($upawd)) $upawd = $_SESSION['upawd'];
  if(empty($uname) || empty($upawd)) return '请输入用户名和密码！';
  $param = getEncrypt("&domain=".HTTPHOST."&username=".urlencode($uname)."&passwd=".urlencode($upawd));
  $con = getCurl("&action=login&data=".$param);

  if($con){
    $info = json_decode($con, true);
    if($info['state'] == 100){
      $_SESSION['uname'] = $uname;
      $_SESSION['upawd'] = $upawd;
      $err = '';
    }else{
      $err = $info['info'];
    }
  }else{
    $err = '网络错误，验证失败！';
  }

  return $err;
}


//获取会员已购买的频道
function getModule(){
  $uname = urlencode($_SESSION['uname']);
  $upawd = urlencode($_SESSION['upawd']);
  if(empty($uname) || empty($upawd)) header('location:?step=1');
  $param = getEncrypt("&domain=".HTTPHOST."&username=".$uname."&passwd=".$upawd);
  $con = getCurl("&action=module&data=".$param);

  if($con){
    $err = json_decode($con, true);
  }else{
    $err = array("state" => 200, "info" => "网络错误，请刷新页面重试！");
  }
  return $err;
}


//验证选择的模块是否有权限安装
function checkModule($module){
  $uname = urlencode($_SESSION['uname']);
  $upawd = urlencode($_SESSION['upawd']);
  if(empty($uname) || empty($upawd)) header('location:?step=1');
  $param = getEncrypt("&domain=".HTTPHOST."&username=".$uname."&passwd=".$upawd."&module=".$module);
  $con = getCurl("&action=checkModule&data=".$param);

  if($con){
    $err = json_decode($con, true);
  }else{
    $err = array("state" => 200, "info" => "网络错误，请刷新页面重试！");
  }
  return $err;
}


//验证是否安装成功
function installSuccess(){
  $uname = urlencode($_SESSION['uname']);
  $upawd = urlencode($_SESSION['upawd']);
  if(empty($uname) || empty($upawd)) header('location:?step=1');
  $param = getEncrypt("&domain=".HTTPHOST."&username=".$uname."&passwd=".$upawd);
  $con = getCurl("&action=installSuccess&data=".$param);

  if($con){
    $err = json_decode($con, true);
  }else{
    $err = array("state" => 200, "info" => "安装失败，请重试！");
  }
  return $err;
}


//远程验证/获取官方数据
function getCurl($url){
  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, CLOUD.'/include/ajax.php?domain='.HTTPHOST.$url);
  curl_setopt($curl, CURLOPT_HEADER, 0);
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($curl, CURLOPT_TIMEOUT, 20);
  curl_setopt($curl, CURLOPT_USERAGENT, "kumanyun/install");
  $con = curl_exec($curl);
  curl_close($curl);
  return $con;
}


//添加cookie
function PutCookie($key, $value){
  setcookie($key, $value, time() + 3600 * 3, '/');
}

//清除Cookie记录
function DropCookie($key){
  setcookie($key, '', time() - 360000, '/');
}

//获取Cookie
function GetCookie($key){
  if(!isset($_COOKIE[$key])){
      return '';
  }else{
  	return $_COOKIE[$key];
  }
}
