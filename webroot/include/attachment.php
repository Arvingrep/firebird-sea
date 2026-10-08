<?php

/**
 * 网站附件访问中转
 *
 * @version        $Id: attachment.php 2014-4-24 下午14:46:18 $
 * @package        HuoNiao.Include
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

//系统核心配置文件
define('HUONIAOINC', str_replace("\\", '/', dirname(__FILE__)));         //当前目录
define('HUONIAOROOT', str_replace("\\", '/', substr(HUONIAOINC, 0, -8)));  //根目录
define('HUONIAODATA', HUONIAOROOT . '/data');                                //系统配置目录

if(!defined('HUONIAOADMIN')) {
	define('HUONIAOADMIN', "");
}

include_once(HUONIAOINC . '/config/siteConfig.inc.php');
include_once(HUONIAOINC . '/dbinfo.inc.php');

$cfg_siteDebug = (int)$cfg_siteDebug;

//生成一个PDO对象
$dbPort = $GLOBALS['DB_PORT'] ? $GLOBALS['DB_PORT'] : 3306;
$dsn = "mysql:host=" . $GLOBALS['DB_HOST'] . ";port=" . $dbPort . ";dbname=" . $GLOBALS['DB_NAME'];
try {
    $_opts_values = array(PDO::ATTR_PERSISTENT => true, PDO::ATTR_ERRMODE => 2, PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4');
    $dbo = @new PDO($dsn, $GLOBALS['DB_USER'], $GLOBALS['DB_PASS'], $_opts_values);
} catch (Exception $e) {
    //如果连接失败，输出错误
    if ($cfg_siteDebug) {
        die($e->getMessage());
    } else {
        die('<center><br /><br />数据库链接失败，请检查配置信息！<br /><br />Database link failed. Check configuration information!</center>');
    }
}

//扩展验证
if(!extension_loaded('swoole_loader')){
    die('请先安装火鸟PHP扩展！<br />安装教程：<a href="https://help.kumanyun.com/help-2-775.html" target="_blank">https://help.kumanyun.com/help-2-775.html</a>');
}

//授权文件
if(file_exists(HUONIAOROOT . "/huoniao")){
    ini_set("swoole_loader.license_files", HUONIAOROOT . "/huoniao");
}else{
    die('授权文件不存在，请联系售后获取！');
}

$cfg_secureAccess = $cfg_httpSecureAccess ? 'https://' : 'http://';

$hn_auth_license_host = 'fh580.net';
$hn_req_orig_host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$_SERVER['HTTP_HOST'] = $hn_auth_license_host;
include_once(HUONIAOINC . '/kernel.inc.php');
if ($hn_req_orig_host !== '') {
    $_SERVER['HTTP_HOST'] = $hn_req_orig_host;
}
require_once(dirname(__FILE__) . '/common.func.php');

loadPlug(array('filter', 'charset'));

$f = RemoveXSS($_GET['f']);

if (!empty($f)) {

    //如果是公众平台图片，因为有防盗链，需要远程读取
    if (strstr($f, "qpic.cn")) {
        echo GrabImage($f);
        die;
    }

    $f = str_replace('||', '', $f);
    if (!strstr($f, '?')) {
        $f = str_replace('&type=', '?type=', $f);
    }

    //远程链接直接跳转
    if (strstr($f, "http") || strstr($f, "//") || strstr($f, ".swf") || strstr($f, "../")) {
        $f_ = strtolower($f);
        if (
            !strstr($f_, '.png') &&
            !strstr($f_, '.jpg') &&
            !strstr($f_, '.jpeg') &&
            !strstr($f_, '.gif') &&
            !strstr($f_, '.bmp') &&
            !strstr($f_, '.swf') &&
            !strstr($f_, 'attachment.php') &&
            !strstr($f_, '.mp4') &&
            !strstr($f_, '.mov') &&
            !strstr($f_, '.wav') &&
            !strstr($f_, '.mp3') &&
            !strstr($f_, '.wma') &&
            !strstr($f_, '.amr') &&
            !strstr($f_, 'thirdwx.qlogo.cn')
        ) {
            if (strstr($f, "qpic.cn")) {
            } else {
                die('非法跳转！');
            }
        } else {
            header("location:" . $f);
            die;
        }
    }

    // 新版本直接调用获取图片真实路径
    $f = getRealFilePath($f);

    //图片不存在
    if (!$f) {
        header("location:/static/images/404.jpg");
    }

    if ($type != '') {
        $f = changeFileSize(array('url' => $f, 'type' => $type));
    }

    //更新附件的浏览次数
    updateAttachmentClickSql();

    header("location:" . $f);
} else {
    header("location:/static/images/404.jpg");
}


//本地图片
class imgdata
{
    public $imgsrc;
    public $imgdata;
    public $imgform;
    public function getdir($source)
    {
        $this->imgsrc  = $source;
    }
    public function img2data()
    {
        $this->_imgfrom($this->imgsrc);
        return $this->imgdata = @fread(@fopen($this->imgsrc, 'rb'), @filesize($this->imgsrc));
    }
    public function data2img()
    {
        header("content-type:$this->imgform");
        echo $this->imgdata;
    }
    public function _imgfrom($imgsrc)
    {
        $info = @getimagesize($imgsrc);
        return $this->imgform = $info['mime'];
    }
}

//远程图片
function GrabImage($url)
{
    if ($url == "") return false;

    //通过CURL方式读取远程图片内容
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_TIMEOUT, 5);
    $img = curl_exec($curl);
    curl_close($curl);

    header("content-type:image/jpeg");

    //如果下载失败则显示一张本地error图片
    if (empty($img)) {
        $n = new imgdata;
        $n->getdir(HUONIAOROOT . "/static/images/404.jpg");
        $n->img2data();
        $n->data2img();
    } else {
        return $img;
    }
}
