<?php

/**
 * 个人会员移动端首页模板自定义
 *
 * @version        $Id: userCenterDiy.php 2023-05-29 上午09:57:43 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("userCenterDiy");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "userCenterDiy.html";

$platform = trim($platform);  //设置指定终端的页面，android、ios、harmony、wxmini、dymini
$platform = $platform ?: 'h5';  //默认h5

// 字段说明
// config: 模板配置数据
// browse: 预览模板配置数据

// global $dsql;
// $infoarr = userCenterDiy();
// $archives = $dsql->SetQuery("SELECT `config` FROM `#@__site_config` WHERE `title` = '$platform' AND `type` = 'userCenter'");
// $results = $dsql->dsqlOper($archives, "results");
// $config = unserialize($results[0]['config']);
// $config = $config ? $config : $infoarr;

$config = array();
$siteConfigHandlers = new handlers("siteConfig", "userCenterDiy");
$siteConfigConfig   = $siteConfigHandlers->getHandle(array('platform' => $platform));
if($siteConfigConfig && $siteConfigConfig['state'] == 100){
    $config = $siteConfigConfig['info'];
}

$huoniaoTag->assign("config", str_replace("'", "\'", json_encode($config)));

//获取页面数据
if($dopost == 'getData'){
    if($config){
        echo json_encode(array(
            'state' => 100,
            'info' => $config
        ));
        die;
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => '该条件下未配置自定义页面！'
        ));
        die;
    }
}

//保存
if ($dopost == 'save') {
    $data = str_replace("\\", '', $_POST['config']);
    $json = json_decode($data);
    $config = objtoarr($json);
    $config = $config ? str_replace("'", "\'", serialize($config)) : '';

    $datas = str_replace("\\", '', $_POST['browse']);
    $jsons = json_decode($datas);
    $browse = objtoarr($jsons);
    $browse = $browse ? str_replace("'", "\'", serialize($browse)) : '';

    $terminal = trim($terminal);  //要同步的终端，多个用逗号分隔

    $time = GetMkTime(time());  //当前时间

    //预览
    if ($type == 1) {
        
        //保存到主表
        if($platform == 'h5'){
            $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE (`title` = '$platform' OR `title` = '' OR `title` IS NULL) AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
        }else{
            $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `title` = '$platform' AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
        }
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $_id = $results[0]['id'];
            $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `browse` = '$browse' WHERE `id` = " . $_id);
            $aid = $dsql->dsqlOper($archives, "update");
        }else{
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `browse`, `title`) VALUES ('userCenter', '$browse', '$platform')");
            $aid = $dsql->dsqlOper($archives, "update");
        }

        $param = array(
            "service"     => "member",
            "type"        => "user",
        );
        $url = getUrlPath($param);
        if ($aid  == "ok") {
            echo json_encode(array(
                'state' => 100,
                'info' => $url
            ));
        }
        die;
    }
    //保存
    else {

        //如果是批量发布
        if($terminal){

            $terminalArr = explode(',', $terminal);
            
            foreach ($terminalArr as $k => $v){

                if($v == 'h5'){
                    $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE (`title` = '$v' OR `title` = '' OR `title` IS NULL) AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
                }else{
                    $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `title` = '$v' AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
                }
                $results = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $_id = $results[0]['id'];

                    //旧的封面需要删除
                    $_config = $results[0]['config'];
                    $_config = $_config ? unserialize($_config) : array();
                    $_cover = $_config['cover'];
                    if($_cover){
                        global $cfg_filedelstatus;
                        $cfg_filedelstatus = 1;  //强制删除文件
                        delPicFile($_cover, 'delAtlas', 'siteConfig', 1);
                    }

                    $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `id` = " . $_id);
                    $aid = $dsql->dsqlOper($archives, "update");
                } else {
                    //保存到主表
                    $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `config`, `title`, `pubdate`) VALUES ('userCenter', '$config', '$v', '$time')");
                    $aid = $dsql->dsqlOper($archives, "update");
                }

            }

        }

        //保存到主表
        if($platform == 'h5'){
            $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE (`title` = '$platform' OR `title` = '' OR `title` IS NULL) AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
        }else{
            $archives = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `title` = '$platform' AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
        }
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $_id = $results[0]['id'];

            //旧的封面需要删除
            $_config = $results[0]['config'];
            $_config = $_config ? unserialize($_config) : array();
            $_cover = $_config['cover'];
            if($_cover){
                global $cfg_filedelstatus;
                $cfg_filedelstatus = 1;  //强制删除文件
                delPicFile($_cover, 'delAtlas', 'siteConfig', 1);
            }

            $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `id` = " . $_id);
            $aid = $dsql->dsqlOper($archives, "update");
        } else {
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `config`, `title`, `pubdate`) VALUES ('userCenter', '$config', '$platform', '$time')");
            $aid = $dsql->dsqlOper($archives, "update");
        }
        if ($aid  == "ok") {

            adminLog("修改用户中心DIY模板", "终端：" . $platform . "，其他终端：" . $terminal);

            echo json_encode(array(
                'state' => 100,
                'info' => '配置成功！'
            ));
        }
        die;
    }
}

//修改
if ($dopost == 'edit') {

    $data = str_replace("\\", '', $_POST['config']);
    $json = json_decode($data);
    $config = objtoarr($json);
    $config = $config ? serialize($config) : '';

    $datas = str_replace("\\", '', $_POST['browse']);
    $jsons = json_decode($datas);
    $browse = objtoarr($jsons);
    $browse = $browse ? serialize($browse) : '';

    $time = GetMkTime(time());  //当前时间

    //预览
    if ($type == 1) {
        
        //保存到主表
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `browse` = '$browse' WHERE `title` = '$platform' AND `type` = 'userCenter'");
        $aid = $dsql->dsqlOper($archives, "update");
        $param = array(
            "service"     => "member",
            "type"        => "user"
        );
        $url = getUrlPath($param);
        if ($aid  == "ok") {
            echo json_encode(array(
                'state' => 100,
                'info' => $url
            ));
        }
        die;
    } 
    //保存
    else {
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `title` = '$platform' AND `type` = 'userCenter'");
        $aid = $dsql->dsqlOper($archives, "update");
        if ($aid  == "ok") {
            echo json_encode(array(
                'state' => 100,
                'info' => '修改成功！'
            ));
        }
        die;
    }
}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
    $huoniaoTag->assign('userDomain', $userDomain);
    $huoniaoTag->assign('busiDomain', $busiDomain);
    $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
    $sitePageData = array();

    //是否设置过系统默认模板，通过type=userCenter
    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_config` WHERE (`title` = 'h5' OR `title` = '' OR `title` IS NULL) AND `type` = 'userCenter' ORDER BY `id` DESC LIMIT 1");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $sitePageData['default'] = 1;
    }else{
        $sitePageData['default'] = 0;
    }

    //是否已经设置过系统默认h5端
    $data = getSiteConfig('h5');
    $sitePageData['h5'] = (int)$data['state'];
    $sitePageData['h5_cover'] = $data['cover'];


    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $data = getSiteConfig('android');
        $sitePageData['android'] = (int)$data['state'];
        $sitePageData['android_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $data = getSiteConfig('ios');
        $sitePageData['ios'] = (int)$data['state'];
        $sitePageData['ios_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $data = getSiteConfig('harmony');
        $sitePageData['harmony'] = (int)$data['state'];
        $sitePageData['harmony_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $data = getSiteConfig('wxmini');
        $sitePageData['wxmini'] = (int)$data['state'];
        $sitePageData['wxmini_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $data = getSiteConfig('dymini');
        $sitePageData['dymini'] = (int)$data['state'];
        $sitePageData['dymini_cover'] = $data['cover'];
    }
    $huoniaoTag->assign('sitePageData', $sitePageData);

    //商家功能开关
    $business_state = 1;  //0禁用  1启用
    $businessInc = HUONIAOINC . "/config/business.inc.php";
    if(file_exists($businessInc)){
        require($businessInc);
        $business_state = (int)$customBusinessState;  //配置文件中 0表示启用  1表示禁用  因为默认要开启商家功能
        $business_state = intval(!$business_state);
    }
    $huoniaoTag->assign('cfg_business_state', $business_state);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}



//查询指定分站的指定终端配置
function getSiteConfig($platform){
    global $dsql;

    $data = array();
    if($platform == 'h5'){
        $sql = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `type` = 'userCenter' AND (`title` = 'h5' OR `title` = '' OR `title` IS NULL) ORDER BY `id` DESC LIMIT 1");
    }else{
        $sql = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `type` = 'userCenter' AND `title` = '$platform' ORDER BY `id` DESC LIMIT 1");
    }
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data['state'] = 1;
        $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
        if($config){
            $data['cover'] = $config['cover'];
        }
    }else{
        $data['state'] = 0;
    }
    return $data;
}