<?php

/**
 * 系统移动端首页模板自定义
 *
 * @version        $Id: sitePageDiy.php 2023-05-29 上午09:57:43 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("siteDiyConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sitePageDiy.html";

$cityid = (int)$cityid;  //设置指定分站的页面
$platform = trim($platform);  //设置指定终端的页面，h5、app、wxmini、dymini
$platform = $platform ?: 'h5';  //默认h5

// 字段说明
// config: 模板配置数据
// browse: 预览模板配置数据

// global $dsql;
// $archives = $dsql->SetQuery("SELECT `config` FROM `#@__site_config` WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
// $results = $dsql->dsqlOper($archives, "results");
// $config = unserialize($results[0]['config']);
// $config = $config ? $config : array();

$config = array();
$siteConfigHandlers = new handlers("siteConfig", "sitePageDiy");
$siteConfigConfig   = $siteConfigHandlers->getHandle(array('platform' => $platform, 'cityid' => $cityid, 'admin' => true));
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

    $default = (int)$default;  //是否要恢复指定分站的自定义模板
    $ids = trim($ids);  //要恢复的分站id或者批量同步分站的id，多个用逗号分隔
    $terminal = trim($terminal);  //要同步的终端，多个用逗号分隔
    $cover = (int)$cover;  //是否覆盖已经单独设置过模板的分站  1表示要覆盖

    $time = GetMkTime(time());  //当前时间

    if($default && $ids){
        $idsArr = explode(',', $ids);
        foreach ($idsArr as $_id) {
            $_id = (int)$_id;
            $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = $_id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
                if($_config){
                    $_config['siteConfig']['touchTemplate'] = 0;
                    $_config = serialize($_config);
                    $_config = addslashes($_config);
                    $sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `config` = '$_config' WHERE `cid` = $_id");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
            }
        }
    }

    //预览，不需要传ids，并且platform只需要传当前正在编辑的终端值
    if ($type == 1) {
        
        //保存到主表
        $archives = $dsql->SetQuery("SELECT `config` FROM `#@__site_config` WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $archives = $dsql->SetQuery("UPDATE `#@__site_config` SET `browse` = '$browse' WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
            $aid = $dsql->dsqlOper($archives, "update");
        }else{
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `browse`, `children`, `title`) VALUES ('sitePage', '$browse', '$cityid', '$platform')");
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
        if($terminal && $ids){

            $terminalArr = explode(',', $terminal);
            $idsArr = explode(',', $ids);
            
            foreach ($idsArr as $key => $value) {
                foreach ($terminalArr as $k => $v){

                    $archives = $dsql->SetQuery("SELECT `config` FROM `#@__site_config` WHERE `children` = '$value' AND `title` = '$v' AND `type` = 'sitePage'");
                    $results = $dsql->dsqlOper($archives, "results");
                    if ($results) {
                        $_config = $results[0]['config'];
                        $_config = $_config ? unserialize($_config) : array();
                        if(($cover && $_config) || !$_config){

                            //旧的封面需要删除
                            $_cover = $_config['cover'];
                            if($_cover){
                                global $cfg_filedelstatus;
                                $cfg_filedelstatus = 1;  //强制删除文件
                                delPicFile($_cover, 'delAtlas', 'siteConfig', 1);
                            }

                            $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `children` = '$value' AND `title` = '$v' AND `type` = 'sitePage'");
                            $aid = $dsql->dsqlOper($archives, "update");
                        }
                    } else {
                        //保存到主表
                        $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `config`, `children`, `title`, `pubdate`) VALUES ('sitePage', '$config', '$value', '$v', '$time')");
                        $aid = $dsql->dsqlOper($archives, "update");
                    }

                }
            }

        }

        $archives = $dsql->SetQuery("SELECT `config` FROM `#@__site_config` WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $_config = $results[0]['config'];
            $_config = $_config ? unserialize($_config) : array();

            //旧的封面需要删除
            $_cover = $_config['cover'];
            if($_cover){
                global $cfg_filedelstatus;
                $cfg_filedelstatus = 1;  //强制删除文件
                delPicFile($_cover, 'delAtlas', 'siteConfig', 1);
            }

            $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
            $aid = $dsql->dsqlOper($archives, "update");
        } else {
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `config`, `children`, `title`, `pubdate`) VALUES ('sitePage', '$config', '$cityid', '$platform', '$time')");
            $aid = $dsql->dsqlOper($archives, "update");
        }
        if ($aid  == "ok") {

            adminLog("修改大首页DIY模板", "分站：" . $cityid . "，终端：" . $platform . "，其他分站：" . $ids . "，其他终端：" . $terminal . "，是否覆盖：" . ($cover ? '是' : '否'));

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
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `browse` = '$browse' WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
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
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config', `pubdate` = '$time' WHERE `children` = '$cityid' AND `title` = '$platform' AND `type` = 'sitePage'");
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

//获取所有模块数据
if($dopost == 'siteModuleList'){

    $list = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name`, `icon`, `wx`, `bd`, `qm`, `dy`, `app`, `h5`, `subject`, `title`, `link`, `android`, `ios`, `harmony` FROM `#@__site_module` WHERE ((`state` = 0 AND `name` != '') || `name` = '') AND `parentid` != 0 AND `name` != 'special' AND `name` != 'website' ORDER BY `weight`, `id`");
    $ret  = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $val){
            
            //获取链接时，去除分站信息
            global $withoutCityDomain;
            $withoutCityDomain = 1;
            
            $val['link'] = $val['name'] ? getUrlPath(array('service' => $val['name'])) : $val['link'];
            //图标
            $icon = empty($val['icon']) ? '/static/images/admin/nav/' . $val['name'] . '.png' : (strstr($val['icon'], '/') ? $val['icon'] : (strstr($val['icon'], '.') ? '/static/images/admin/nav/' . $val['icon'] : $val['icon']));
            
            array_push($list, array(
                'id' => (int)$val['id'],  //模块ID
                'name' => $val['name'],  //模块标识，为空表示自定义导航
                'title' => $val['title'],  //系统名称
                'subject' => $val['subject'] ? $val['subject'] : $val['title'],  //自定义名称
                'link' => $val['link'],  //跳转链接
                'icon' => $icon,  //保存数据时使用
                'iconurl' => empty($val['icon']) ? '/static/images/admin/nav/' . $val['name'] . '.png' : getFilePath($val['icon']),  //图片显示时使用
                'h5' => (int)$val['h5'],  //h5端开关  1开启  0关闭
                'app' => (int)$val['app'],  //app端开关  0开启  1关闭
                'wx' => (int)$val['wx'],  //微信小程序端开关  1开启  0关闭
                'bd' => (int)$val['bd'],  //百度小程序端开关  1开启  0关闭
                'qm' => (int)$val['qm'],  //QQ小程序端开关  1开启  0关闭
                'dy' => (int)$val['dy'],  //抖音小程序端开关  1开启  0关闭
                'android' => (int)$val['android'],  //安卓端开关  1开启  0关闭
                'ios' => (int)$val['ios'],  //苹果端开关  1开启  0关闭
                'harmony' => (int)$val['harmony'],  //鸿蒙端开关  1开启  0关闭
            ));

        }
    }

    die(json_encode($list));

}

//更新模块信息
//格式：
/**
    [
        {
            'id': 1,  //模块id
            'title': '火鸟商家',  //自定义名称
            'link': 'index.php',  //自定义链接，自定义链接时必传，否则留空
            'icon': '/xxx/xxx.png',  //自定义图标
            'h5': 1,  //h5端开关  1开启  0关闭
            'app': 1,  //app端开关  0开启  1关闭
            'wx': 1,  //微信小程序端开关  1开启  0关闭
            'bd': 1,  //百度小程序端开关  1开启  0关闭
            'qm': 1,  //QQ小程序端开关  1开启  0关闭
            'dy': 1,  //抖音小程序端开关  1开启  0关闭
            'android': 1,  //安卓端开关  1开启  0关闭
            'ios': 1,  //苹果端开关  1开启  0关闭
            'harmony': 1,  //鸿蒙端开关  1开启  0关闭
            'weight': 1,  //排序权重
            'del': 0,  //是否删除，自定义链接时才有效，为1表示要删除该自定义链接
        },
        ...
    ]
 */
elseif($dopost == 'siteModuleUpdate'){

    $data = str_replace("\\", '', $_POST['data']);
	if($data != ""){
		$json = json_decode($data);

		$json = objtoarr($json);
		
        if(is_array($json)){
            foreach($json as $k => $v){
                $id = (int)$v['id'];
                $subject = $v['subject'];
                $link = $v['link'];
                $icon = $v['icon'];
                $h5 = (int)$v['h5'];
                $app = (int)$v['app'];
                $wx = (int)$v['wx'];
                $bd = (int)$v['bd'];
                $qm = (int)$v['qm'];
                $dy = (int)$v['dy'];
                $android = (int)$v['android'];
                $ios = (int)$v['ios'];
                $harmony = (int)$v['harmony'];
                $weight = (int)$v['weight'];
                $del = (int)$v['del'];

                //修改|删除
                if($id){
                    //查询数据库模块信息
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_module` WHERE `id`='{$id}'");
                    $ret = $dsql->dsqlOper($sql, 'results');
                    if($ret){

                        $_name = $ret[0]['name'];  //模块标识
                        
                        //删除自定义链接
                        if(!$_name && $del){
                            $sql = $dsql->SetQuery("DELETE FROM `#@__site_module` WHERE `id` = '{$id}'");
                            $dsql->dsqlOper($sql, 'update');
                        }
                        //更新内容
                        else{
                            $sql = $dsql->SetQuery("UPDATE `#@__site_module` SET `subject`='{$subject}', `link`='{$link}', `icon`='{$icon}', `h5`='{$h5}', `app`='{$app}', `wx`='{$wx}', `bd`='{$bd}', `qm`='{$qm}', `dy`='{$dy}', `android`='{$android}', `ios`='{$ios}', `harmony`='{$harmony}', `weight`='{$weight}' WHERE `id`='{$id}'");
                            $dsql->dsqlOper($sql, 'update');
                        }

                    }
                }
                //新增
                else{
                    
                    $sql = $dsql->SetQuery("INSERT INTO `#@__site_module` (`parentid`, `type`, `subject`, `link`, `icon`, `h5`, `app`, `wx`, `bd`, `qm`, `dy`, `android`, `ios`, `harmony`, `weight`) VALUES (0, 1, '$subject', '$link', '$icon', '$h5', '$app', '$wx', '$bd', '$qm', '$dy', '$android', '$ios', '$harmony', '$weight')");
                    $dsql->dsqlOper($sql, 'update');

                }
            }

            adminLog("修改系统模块导航", "通过首页DIY页面");

            die(json_encode(array('state' => 100, 'info' => '更新成功！')));
            
        }
        else{
            die(json_encode(array('state' => 200, 'info' => '数据格式错误！')));
        }
	}
    else{
        die(json_encode(array('state' => 200, 'info' => '没有要更新的数据！')));
    }

}

//获取模板封面
elseif($dopost == 'getCover'){

    $data = getSiteConfig($cityid, $platform);
    if($data['cover']){
        $res = array();
        $res['cover'] = $data['cover'];
        $res['cover_pic'] = getFilePath($data['cover']);
        die(json_encode(array('state' => 100, 'info' => $res)));
    }else{
        die(json_encode(array('state' => 200, 'info' => '获取失败')));
    }

}

//获取指定分站的终端状态
elseif($dopost == 'getPlatformByCityid'){

    $sitePageData = array();
    $data = getSiteConfig($cityid, 'h5');
    $sitePageData['h5'] = (int)$data['state'];
    $sitePageData['h5_cover'] = $data['cover'];

    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $data = getSiteConfig($cityid, 'android');
        $sitePageData['android'] = (int)$data['state'];
        $sitePageData['android_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $data = getSiteConfig($cityid, 'ios');
        $sitePageData['ios'] = (int)$data['state'];
        $sitePageData['ios_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $data = getSiteConfig($cityid, 'harmony');
        $sitePageData['harmony'] = (int)$data['state'];
        $sitePageData['harmony_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $data = getSiteConfig($cityid, 'wxmini');
        $sitePageData['wxmini'] = (int)$data['state'];
        $sitePageData['wxmini_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $data = getSiteConfig($cityid, 'dymini');
        $sitePageData['dymini'] = (int)$data['state'];
        $sitePageData['dymini_cover'] = $data['cover'];
    }

    die(json_encode(array('state' => 100, 'info' => $sitePageData)));

}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {
    $huoniaoTag->assign('userDomain', $userDomain);
    $huoniaoTag->assign('busiDomain', $busiDomain);
    $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径

    $sitePageData = array();

    //是否设置过系统默认模板，通过type=sitePage
    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_config` WHERE `children` = 0 AND `type` = 'sitePage' AND `title` = 'h5'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret && $ret[0]['config']){
        $sitePageData['default'] = 1;
    }else{
        $sitePageData['default'] = 0;
    }

    //是否已经设置过系统默认h5端
    $data = getSiteConfig(0, 'h5');
    $sitePageData['h5'] = (int)$data['state'];
    $sitePageData['h5_cover'] = $data['cover'];


    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $data = getSiteConfig(0, 'android');
        $sitePageData['android'] = (int)$data['state'];
        $sitePageData['android_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $data = getSiteConfig(0, 'ios');
        $sitePageData['ios'] = (int)$data['state'];
        $sitePageData['ios_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $data = getSiteConfig(0, 'harmony');
        $sitePageData['harmony'] = (int)$data['state'];
        $sitePageData['harmony_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $data = getSiteConfig(0, 'wxmini');
        $sitePageData['wxmini'] = (int)$data['state'];
        $sitePageData['wxmini_cover'] = $data['cover'];
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $data = getSiteConfig(0, 'dymini');
        $sitePageData['dymini'] = (int)$data['state'];
        $sitePageData['dymini_cover'] = $data['cover'];
    }

    //查询分站已经自定义模板的数据
    //这里是给第一次diy保存时页面提示用的 site_city表
    $cityCustom = array();
    $sql = $dsql->SetQuery("SELECT c.`cid`, c.`config`, a.`typename` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`state` = 1 ORDER BY c.`cid` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            $cid = $val['cid'];
            $config = $val['config'] ? unserialize($val['config']) : array();
            if($config){
                $_siteConfig = $config['siteConfig'];
                $touchTemplate = $_siteConfig['touchTemplate'];

                if($touchTemplate && file_exists(HUONIAOROOT . '/templates/siteConfig/touch/' . $touchTemplate . '/config.xml')){
                    array_push($cityCustom, array(
                        'cid' => $cid,
                        'name' => $val['typename']
                    ));
                }
            }
        }
    }
    $sitePageData['cityCustom'] = $cityCustom;

    //这里是给选择分站diy模版时用的 site_config表
    $cityConfig = array();
    $sql = $dsql->SetQuery("SELECT c.`children` cid, c.`title`, c.`config`, a.`typename` FROM `#@__site_config` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`children` WHERE c.`type` = 'sitePage' AND c.`children` != 0 AND c.`title` != ''");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            $cid = (int)$val['cid'];
            $typename = $val['typename'];
            $title = $val['title'];

            $_has = false;
            if($cityConfig){
                foreach($cityConfig as $k => $v){
                    if($v['cid'] == $cid){
                        $_has = true;
                        array_push($cityConfig[$k]['platform'], array(
                            'name' => $title,
                            'config' => $val['config'] ? unserialize($val['config']) : array()
                        ));
                    }
                }
            }
            if(!$_has){
                array_push($cityConfig, array(
                    'cid' => $cid,
                    'name' => $val['typename'],
                    'platform' => array(array(
                        'name' => $title,
                        'config' => $val['config'] ? unserialize($val['config']) : array()
                    ))
                ));
            }
        }
    }
    $sitePageData['cityDiy'] = $cityConfig;
    
    $huoniaoTag->assign('sitePageData', $sitePageData);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}



//查询指定分站的指定终端配置
function getSiteConfig($cityid, $platform){
    global $dsql;

    $data = array();
    $sql = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_config` WHERE `children` = $cityid AND `type` = 'sitePage' AND `title` = '$platform'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data['state'] = 1;
        $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
        if($config){
            $data['cover'] = $config['cover'] ?: "";
        }
    }else{
        $data['state'] = 0;
        $data['cover'] = "";
    }
    return $data;
}