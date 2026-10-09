<?php
/**
 * 第三方登录整合接口
 *
 * @version        $Id: login.php $v1.0 2015-2-14 下午17:54:18 $
 * @package        HuoNiao.Login
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

$type = $_GET['type'];
$type = empty($type) ? "qq" : $type;
$login = array();
$set_modules = true;

require_once(dirname(__FILE__)."/../include/common.inc.php");
if(file_exists(dirname(__FILE__)."/../api/login/$type/$type.php")){
    require_once(dirname(__FILE__)."/../api/login/$type/$type.php");
}else{
    die('接口不存在！');
}

$uid = $userLogin->getMemberID();
$dsql = new dsql($dbo);
if(isApp() && $qr && !is_numeric($qr)){
    $tpl = HUONIAOROOT."/templates/siteConfig/";
    $templates = "qrLogin_touch.html";
    if(file_exists($tpl.$templates)){
        if($uid < 1){
            header("location:".$cfg_secureAccess.$cfg_basehost . "/login.html");
            die;
        }
        //获取当前模块配置参数
        $configHandels = new handlers("siteConfig", "config");
        $moduleConfig  = $configHandels->getHandle();

        $contorllerFile = HUONIAOROOT.'/api/handlers/siteConfig.controller.php';
        if(file_exists($contorllerFile)){
            require_once($contorllerFile);
            $huoniaoTag->registerPlugin("block", "siteConfig", "siteConfig");
        }
        
        //注册公共模块函数，主要给在当前模块下调用其他模块数据时使用
        $contorllerFile = HUONIAOINC.'/loop.php';
        if(file_exists($contorllerFile)){
        	require_once($contorllerFile);
        	$huoniaoTag->registerPlugin("block", "loop", "loop");
        }
        
        if($qr!=''){
            $huoniaoTag->assign('qr', $qr);
            $time = GetMkTime(time());
        }else{
            die('app扫码登录页面加载失败,请确认后重试!');
        }
        global $huoniaoTag;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticPath;
        global $notclose;
        $huoniaoTag->template_dir = $tpl;
        $huoniaoTag->assign('cfg_basehost', $cfg_secureAccess.$cfg_basehost);
        $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
        $huoniaoTag->assign('state', $state);
        $huoniaoTag->assign('notclose', $notclose);
        $huoniaoTag->assign('getopenid', $getopenid);
        $huoniaoTag->assign('loginRedirect', strip_tags($loginRedirect));
        $huoniaoTag->display($templates);
    }
    die;
}
$typeName = "Login".$type;
$loginConfig = new $typeName();
$data = array();

$callback = $login[0]['callback'];
//主要配合微信扫码登录成功后不让窗口关闭
if($notclose){
    $callback .= "&notclose=1";
}

//主要配合微信扫码登录成功后不让窗口关闭
if($qr){
    $callback .= "&qr=".$qr;
}
if ($getopenid) {
    $callback .="&getopenid=" .$getopenid;
    $data['getopenid'] = $getopenid;
}
$data['callback'] = $callback;
if($uid != -1){
    $data['loginUserid'] = $uid;
}

$archives = $dsql->SetQuery("SELECT * FROM `#@__site_loginconnect` WHERE `state` = 1 AND `code` = '$type'");
$loginData = $dsql->dsqlOper($archives, "results");
if($loginData){
    $config = unserialize($loginData[0]['config']);
    foreach ($config as $key => $value) {
        $data[$value['name']] = $value['value'];
    }

    //登录
    if($action == ""){
        $furl = $_GET['furl'];
        if($furl){
            global $cfg_cookiePath;
            PutCookie("furl", $furl, 15, $cfg_cookiePath);
        }
        echo $loginConfig->login($data);

        //登录成功
    }elseif($action == "back"){

        echo $loginConfig->back($data, $_GET);

        //APP登录
    }elseif($action == "appback"){

        echo $loginConfig->appback($data, $_GET);

    }

}else{
    die("接口不存在！");
}
