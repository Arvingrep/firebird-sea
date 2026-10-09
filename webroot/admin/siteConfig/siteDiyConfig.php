<?php

/**
 * DIY页面管理
 *
 * @version        $Id: siteDiyConfig.php 2024-01-23 下午13:33:51 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2024, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("siteDiyConfig");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__) . "/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteDiyConfig.html";


//默认值
global $sitePagePlatform;
$sitePagePlatform = array(
    'h5' => array('state' => 0, 'info' => ''),
    'android' => array('state' => 0, 'info' => ''),
    'ios' => array('state' => 0, 'info' => ''),
    'harmony' => array('state' => 0, 'info' => ''),
    'wxmini' => array('state' => 0, 'info' => ''),
    'dymini' => array('state' => 0, 'info' => '')
);

//终端名称
$platformName = array(
    'h5' => 'H5',
    'android' => '安卓',
    'ios' => '苹果',
    'harmony' => '鸿蒙',
    'wxmini' => '微信',
    'dymini' => '抖音'
);

//获取首页模板列表
if($dopost == 'index'){

    $_state = $state != '' ? (int)$state : '';  //筛选状态   1启用中  0未启用
    $_platform = trim($platform);  //筛选终端  h5/app/wxmini/dymini
    $_keyword = trim($keyword);  //筛选关键字

    //系统默认/各终端默认
    $sitePageData = array();

    //是否已经设置过系统默认h5端
    $_data = getSiteConfig(0, 'h5');
    
    //判断系统默认模板是否使用了diy
    if($cfg_touchTemplate != 'diy'){

        //获取模板名称
        $info = '';
        $config = HUONIAOROOT . '/templates/siteConfig/touch/' . $cfg_touchTemplate . '/config.xml';
        if (file_exists($config)) {
            //解析xml配置文件
            $xml = new DOMDocument();
            libxml_disable_entity_loader(false);
            $xml->load($config);
            $__data = $xml->getElementsByTagName('Data')->item(0);
            $tplname = $__data->getElementsByTagName("tplname")->item(0)->nodeValue;
            $info = 'H5端' . $tplname . '[' . $cfg_touchTemplate . ']';
        }

        $sitePagePlatform['h5'] = array('state' => 0, 'info' => $info);
    }
    else{
        $sitePagePlatform['h5'] = array('state' => 1, 'info' => '系统默认DIY模板');
    }

    array_push($sitePageData, array(
        'weight' => 0,  //排序值
        'platorm' => '全部终端',
        'key' => 'h5',
        'cityid' => 0,
        'title' => '系统默认DIY模板',
        'subtitle' => '',
        'cover' => $_data['cover'],
        'pubdate' => $_data['pubdate'],
        'state' => $cfg_touchTemplate == 'diy' ? 1 : 0
    ));


    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $_data = getSiteConfig(0, 'android');
        if($_data['state'] != 2){
            $sitePagePlatform['android'] = array('state' => $_data['state'], 'info' => $_data['info']);
            array_push($sitePageData, array(
                'weight' => 1,  //排序值
                'platorm' => $platformName['android'],
                'key' => 'android',
                'cityid' => 0,
                'title' => '安卓默认DIY模板',
                'subtitle' => $_data['info'],  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $_data['state']
            ));
        }
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $_data = getSiteConfig(0, 'ios');
        if($_data['state'] != 2){
            $sitePagePlatform['ios'] = array('state' => $_data['state'], 'info' => $_data['info']);
            array_push($sitePageData, array(
                'weight' => 1,  //排序值
                'platorm' => $platformName['ios'],
                'key' => 'ios',
                'cityid' => 0,
                'title' => '苹果默认DIY模板',
                'subtitle' => $_data['info'],  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $_data['state']
            ));
        }
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $_data = getSiteConfig(0, 'harmony');
        if($_data['state'] != 2){
            $sitePagePlatform['harmony'] = array('state' => $_data['state'], 'info' => $_data['info']);
            array_push($sitePageData, array(
                'weight' => 1,  //排序值
                'platorm' => $platformName['harmony'],
                'key' => 'harmony',
                'cityid' => 0,
                'title' => '鸿蒙默认DIY模板',
                'subtitle' => $_data['info'],  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $_data['state']
            ));
        }
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $_data = getSiteConfig(0, 'wxmini');
        if($_data['state'] != 2){
            $sitePagePlatform['wxmini'] = array('state' => $_data['state'], 'info' => $_data['info']);
            array_push($sitePageData, array(
                'weight' => 2,  //排序值
                'platorm' => $platformName['wxmini'],
                'key' => 'wxmini',
                'cityid' => 0,
                'title' => '微信默认DIY模板',
                'subtitle' => $_data['info'],  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $_data['state']
            ));
        }
    }
    
    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $_data = getSiteConfig(0, 'dymini');
        if($_data['state'] != 2){
            $sitePagePlatform['dymini'] = array('state' => $_data['state'], 'info' => $_data['info']);
            array_push($sitePageData, array(
                'weight' => 3,  //排序值
                'platorm' => $platformName['dymini'],
                'key' => 'dymini',
                'cityid' => 0,
                'title' => '抖音默认DIY模板',
                'subtitle' => $_data['info'],  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $_data['state']
            ));
        }
    }


    //分站DIY数据
    $cityConfig = array();
    $sql = $dsql->SetQuery("SELECT c.`children` cid, c.`title`, c.`config`, c.`state`, c.`pubdate`, a.`typename` FROM `#@__site_config` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`children` WHERE c.`type` = 'sitePage' AND c.`children` != 0 AND c.`title` != ''");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            $cid = (int)$val['cid'];  //城市id
            $cityname = $val['typename'];  //城市名
            $title = $val['title'];  //终端  h5/app/wxmini/dymini
            $state = (int)$val['state'];  //启用状态  1启用  0未启用
            $pubdate = (int)$val['pubdate'];

            $cover = '';
            $config = $val['config'] ? unserialize($val['config']) : array();
            if($config){
                $cover = getFilePath($config['cover']);
            }

            //如果分站DIY没有启用，则查询实际正在使用的模板
            $info = '';
            if($state == 0){
                //终端DIY默认模板已启用时
                if($sitePagePlatform[$title]['state']){
                    $info = $platformName[$title] . '默认DIY模板';
                }else{
                    $info = $sitePagePlatform[$title]['info'];
                }
            }
            elseif($title == 'h5'){
                $state = 0;
                $info = $sitePagePlatform[$title]['info'];
            }

            if($title != 'h5'){
                if(verifyTerminalState($title)){
                    array_push($sitePageData, array(
                        'weight' => 100000 + $cid,  //排序值，100000+城市id
                        'platorm' => $platformName[$title],
                        'key' => $title,
                        'cityid' => $cid,
                        'title' => $cityname,
                        'subtitle' => $info,  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                        'cover' => $cover,
                        'pubdate' => $pubdate,
                        'state' => $state
                    ));
                }
            }
            //h5端需要根据城市分站高级设置中的状态来判断是否启用
            else{

                $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `state` = 1 AND `cid` = " . $cid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
                    if($config){
                        $_siteConfig = $config['siteConfig'];
                        $touchTemplate = $_siteConfig['touchTemplate'];

                        if($touchTemplate == 'diy'){
                            $state = 1;
                            $info = '';
                        }elseif($touchTemplate){
                            $state = 0;

                            //获取模板名称
                            $config = HUONIAOROOT . '/templates/siteConfig/touch/' . $touchTemplate . '/config.xml';
                            if (file_exists($config)) {
                                //解析xml配置文件
                                $xml = new DOMDocument();
                                libxml_disable_entity_loader(false);
                                $xml->load($config);
                                $_data = $xml->getElementsByTagName('Data')->item(0);
                                $tplname = $_data->getElementsByTagName("tplname")->item(0)->nodeValue;
                                $info = 'H5端' . $tplname . '[' . $touchTemplate . ']';
                            }
                        }else{

                        }
                    }
                }

                array_push($sitePageData, array(
                    'weight' => 100000 + $cid,  //排序值，100000+城市id
                    'platorm' => $platformName['h5'],
                    'key' => 'h5',
                    'cityid' => $cid,
                    'title' => $cityname,
                    'subtitle' => $info,  //如果没有启用终端自定义，这个值用来确定该终端正在使用的模板
                    'cover' => $cover,
                    'state' => $state
                ));
            }

        }
    }

    //对筛选条件进行处理
    $return = array();
    if($sitePageData && (is_numeric($_state) || $_platform || $_keyword)){

        //对状态进行筛选
        if(is_numeric($_state)){
            $_state_filter = function($item) {
                global $_state;
                return $item['state'] == $_state;
            };
            $sitePageData = array_filter($sitePageData, $_state_filter);
        }

        //对终端进行筛选
        if($_platform){
            $_platform_filter = function($item) {
                global $_platform;
                return $item['key'] == $_platform;
            };
            $sitePageData = array_filter($sitePageData, $_platform_filter);
        }

        //对关键字进行筛选
        if($_keyword){
            $_keyword_filter = function($item) {
                global $_keyword;
                return strstr($item['title'], $_keyword) || strstr($item['subtitle'], $_keyword) || strstr($item['platorm'], $_keyword);
            };
            $sitePageData = array_filter($sitePageData, $_keyword_filter);
        }
    }

    if($sitePageData){
        $sitePageData = uniqueArray($sitePageData);
    }

    //排序
    $_data = array();
    foreach ($sitePageData as $key => &$data) {
        $_data[$key] = $data['weight'];
    }
    unset($data); // 释放引用变量
    
    array_multisort($_data, SORT_ASC, $sitePageData);

    die(json_encode(array('state' => 100, 'info' => $sitePageData)));

}

//获取用户中心模板列表
elseif($dopost == 'member'){

    $sitePageData = array();

    //个人会员移动端首页模板类型
    $userCenterTouchTemplateType = (int)$cfg_userCenterTouchTemplateType;

    //是否已经设置过系统默认h5端
    $_data = getMemberConfig('h5');
    array_push($sitePageData, array(
        'weight' => 0,
        'platorm' => $platformName['h5'],
        'key' => 'h5',
        'cityid' => 0,
        'title' => '',
        'subtitle' => '',
        'cover' => $_data['cover'],
        'pubdate' => $_data['pubdate'],
        'state' => $userCenterTouchTemplateType
    ));

    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $_data = getMemberConfig('android');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['android'],
                'key' => 'android',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $userCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $_data = getMemberConfig('ios');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['ios'],
                'key' => 'ios',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $userCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $_data = getMemberConfig('harmony');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['harmony'],
                'key' => 'harmony',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $userCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $_data = getMemberConfig('wxmini');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 2,
                'platorm' => $platformName['wxmini'],
                'key' => 'wxmini',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $userCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $_data = getMemberConfig('dymini');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 3,
                'platorm' => $platformName['dymini'],
                'key' => 'dymini',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $userCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    die(json_encode(array('state' => 100, 'info' => $sitePageData)));

}

//获取商家中心模板列表
elseif($dopost == 'business'){

    $sitePageData = array();

    //个人会员移动端首页模板类型
    $busiCenterTouchTemplateType = (int)$cfg_busiCenterTouchTemplateType;

    //是否已经设置过系统默认h5端
    $_data = getBusinessConfig('h5');
    array_push($sitePageData, array(
        'weight' => 0,
        'platorm' => $platformName['h5'],
        'key' => 'h5',
        'cityid' => 0,
        'title' => '',
        'subtitle' => '',
        'cover' => $_data['cover'],
        'pubdate' => $_data['pubdate'],
        'state' => $busiCenterTouchTemplateType
    ));

    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $_data = getBusinessConfig('android');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['android'],
                'key' => 'android',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $busiCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $_data = getBusinessConfig('ios');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['ios'],
                'key' => 'ios',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $busiCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $_data = getBusinessConfig('harmony');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 1,
                'platorm' => $platformName['harmony'],
                'key' => 'harmony',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $busiCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $_data = getBusinessConfig('wxmini');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 2,
                'platorm' => $platformName['wxmini'],
                'key' => 'wxmini',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $busiCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $_data = getBusinessConfig('dymini');

        if($_data['state'] != 2){
            array_push($sitePageData, array(
                'weight' => 3,
                'platorm' => $platformName['dymini'],
                'key' => 'dymini',
                'cityid' => 0,
                'title' => '',
                'subtitle' => '',
                'cover' => $_data['cover'],
                'pubdate' => $_data['pubdate'],
                'state' => $busiCenterTouchTemplateType ? $_data['state'] : 0
            ));
        }
    }

    die(json_encode(array('state' => 100, 'info' => $sitePageData)));

}

//取消应用/启用模板
elseif($dopost == 'updateState'){

    $type = trim($type); //index/member  首页/会员中心
    $platform = trim($platform); //终端  h5/app/wxmini/dymini
    $cityid = (int)$cityid; //城市id
    $state = (int)$state; //状态  1启用  0禁用
    $del = (int)$del; //是否删除  1删除  0不删除

    //如果是删除，状态改为0，用于更新关联的地方
    if($del){
        $state = 0;
    }

    //首页相关操作
    if($type == 'index'){

        if($del){
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_config` WHERE `type` = 'sitePage' AND `children` = $cityid AND `title` = '$platform'");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__site_config` SET `state` = $state WHERE `type` = 'sitePage' AND `children` = $cityid AND `title` = '$platform'");
        }
        $dsql->dsqlOper($sql, "update");

        //APP端默认模板
        if(!$cityid && ($platform == 'android' || $platform == 'ios' || $platform == 'harmony')){
            $appTemplate = $state ? 'diy' : '';
            $sql = $dsql->SetQuery("UPDATE `#@__app_config` SET `template` = '$appTemplate'");
            $ret = $dsql->dsqlOper($sql, "update");
        }

        //分站的h5端更新状态，需要同步更新site_city表
        if($cityid && $platform == 'h5'){

            //先查询该分站是否有高级设置
            $sql = $dsql->SetQuery("SELECT `id`, `config` FROM `#@__site_city` WHERE `cid` = " . $cityid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $configArr = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();

                if(!$configArr['siteConfig']){
                    $configArr['siteConfig'] = array();
                }
                $configArr['siteConfig']['touchTemplate'] = $state ? 'diy' : '';

                $config = serialize($configArr);
                $config = addslashes($config);
                $sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `config` = '$config' WHERE `cid` = $cityid");
                $ret = $dsql->dsqlOper($sql, "update");
            }
            
        }

        if($del){
            adminLog("删除DIY页面状态", "页面：" . $type . '，终端：' . $platform . '，分站：' . $cityid);
        }else{
            adminLog("更新DIY页面状态", "页面：" . $type . '，终端：' . $platform . '，分站：' . $cityid . '，状态：' . ($state ? '启用' : '禁用'));
        }
    }
    //会员中心相关操作
    elseif($type == 'member'){

        if($del){
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_config` WHERE `type` = 'userCenter' AND `title` = '$platform'");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__site_config` SET `state` = $state WHERE `type` = 'userCenter' AND `title` = '$platform'");
        }
        $dsql->dsqlOper($sql, "update");

        if($del){
            adminLog("删除DIY页面状态", "页面：" . $type . '，终端：' . $platform);
        }else{
            adminLog("更新DIY页面状态", "页面：" . $type . '，终端：' . $platform . '，状态：' . ($state ? '启用' : '禁用'));
        }
    }
    //商家中心相关操作
    elseif($type == 'business'){

        if($del){
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_config` WHERE `type` = 'busiCenter' AND `title` = '$platform'");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__site_config` SET `state` = $state WHERE `type` = 'busiCenter' AND `title` = '$platform'");
        }
        $dsql->dsqlOper($sql, "update");

        if($del){
            adminLog("删除DIY页面状态", "页面：" . $type . '，终端：' . $platform);
        }else{
            adminLog("更新DIY页面状态", "页面：" . $type . '，终端：' . $platform . '，状态：' . ($state ? '启用' : '禁用'));
        }
    }


    die(json_encode(array('state' => 100, 'info' => '操作成功！')));
}


//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

    //获取首页DIY页面数量
    $indexPageCount = 0;
    $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_config` WHERE `type` = 'sitePage'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $indexPageCount = (int)$ret[0]['totalCount'];
    }

    //获取用户中心DIY页面数量
    $memberPageCount = 0;
    $sql = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_config` WHERE `type` = 'userCenter'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $memberPageCount = (int)$ret[0]['totalCount'];
    }

    $huoniaoTag->assign('indexPageCount', $indexPageCount);  //首页DIY页面数量
    $huoniaoTag->assign('memberPageCount', $memberPageCount);  //用户中心DIY页面数量
    $huoniaoTag->assign('userCenterTouchTemplateType', (int)$cfg_userCenterTouchTemplateType);  //用户中心页面类型   0 默认  1 DIY
    $huoniaoTag->assign('busiCenterTouchTemplateType', (int)$cfg_busiCenterTouchTemplateType);  //商家中心页面类型   0 默认  1 DIY


    //获取系统正在使用的终端
    $platformList = array();

    //是否已经设置过系统默认安卓端
    if(verifyTerminalState('android')){
        $platformList['android'] = 1;
    }

    //是否已经设置过系统默认苹果端
    if(verifyTerminalState('ios')){
        $platformList['ios'] = 1;
    }

    //是否已经设置过系统默认鸿蒙端
    if(verifyTerminalState('harmony')){
        $platformList['harmony'] = 1;
    }

    //是否已经设置过系统默认微信小程序端
    if(verifyTerminalState('wxmini')){
        $platformList['wxmini'] = 1;
    }

    //是否已经设置过系统默认抖音小程序端
    if(verifyTerminalState('dymini')){
        $platformList['dymini'] = 1;
    }
    $huoniaoTag->assign('platformList', $platformList);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/siteConfig";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}



//查询指定分站的指定终端配置
function getSiteConfig($cityid, $platform){
    global $dsql;

    $data = array();
    $sql = $dsql->SetQuery("SELECT `id`, `config`, `state`, `pubdate` FROM `#@__site_config` WHERE `children` = $cityid AND `type` = 'sitePage' AND `title` = '$platform'");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data['state'] = (int)$ret[0]['state'];
        $data['pubdate'] = (int)$ret[0]['pubdate'];
        $data['info'] = '';
        $data['cover'] = '';

        $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
        if($config){
            $data['cover'] = getFilePath($config['cover']);
        }

        //判断终端默认模板是否正在使用
        if(!$cityid && ($platform == 'android' || $platform == 'ios' || $platform == 'harmony')){
            // $data['info'] = 'App默认模板';
            $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $_data = $ret[0];
                $app_template = $_data['template'];
                if($app_template == ''){
                    $data['info'] = '系统默认模板';
                    $data['state'] = 0;
                }elseif($app_template != 'diy'){

                    //获取模板名称
                    $config = HUONIAOROOT . '/static/images/admin/platform/app/' . $app_template . '/config.xml';
                    if (file_exists($config)) {
                        //解析xml配置文件
                        $xml = new DOMDocument();
                        libxml_disable_entity_loader(false);
                        $xml->load($config);
                        $_data = $xml->getElementsByTagName('Data')->item(0);
                        $tplname = $_data->getElementsByTagName("tplname")->item(0)->nodeValue;
                        $app_template = 'APP端' . $tplname . '[' . $app_template . ']';
                    }

                    $data['info'] = $app_template;
                    $data['state'] = 0;
                }
            }
        }

        //判断终端默认模板是否正在使用
        if(!$cityid && $platform == 'wxmini'){
            // $data['info'] = '微信小程序默认模板';
            include HUONIAOINC . '/config/wechatConfig.inc.php';
            $wxmini_template = $cfg_miniProgramTemplate;
            if($wxmini_template == ''){
                $data['info'] = '系统默认模板';
                $data['state'] = 0;
            }elseif($wxmini_template != 'diy'){

                //获取模板名称
                $config = HUONIAOROOT . '/static/images/admin/platform/wxmini/' . $wxmini_template . '/config.xml';
                if (file_exists($config)) {
                    //解析xml配置文件
                    $xml = new DOMDocument();
                    libxml_disable_entity_loader(false);
                    $xml->load($config);
                    $_data = $xml->getElementsByTagName('Data')->item(0);
                    $tplname = $_data->getElementsByTagName("tplname")->item(0)->nodeValue;
                    $wxmini_template = '微信端' . $tplname . '[' . $wxmini_template . ']';
                }

                $data['info'] = $wxmini_template;
                $data['state'] = 0;
            }
        }

        //判断终端默认模板是否正在使用
        if(!$cityid && $platform == 'dymini'){
            // $data['info'] = '抖音小程序默认模板';
            $douyinConfigFile = HUONIAOINC . '/plugins/20/douyin.inc.php';
            if(file_exists($customIncFile)){
                include $douyinConfigFile;
                $dymini_template = $template;
                if($dymini_template == ''){
                    $data['info'] = '系统默认模板';
                    $data['state'] = 0;
                }elseif($dymini_template != 'diy'){

                    //获取模板名称
                    $config = HUONIAOROOT . '/static/images/admin/platform/dymini/' . $dymini_template . '/config.xml';
                    if (file_exists($config)) {
                        //解析xml配置文件
                        $xml = new DOMDocument();
                        libxml_disable_entity_loader(false);
                        $xml->load($config);
                        $_data = $xml->getElementsByTagName('Data')->item(0);
                        $tplname = $_data->getElementsByTagName("tplname")->item(0)->nodeValue;
                        $dymini_template = '抖音端' . $tplname . '[' . $dymini_template . ']';
                    }

                    $data['info'] = $dymini_template;
                    $data['state'] = 0;
                }
            }
        }

    }else{
        $data['state'] = 2;
        $data['cover'] = "";
    }
    return $data;
}


//查询指定分站的指定终端配置
function getMemberConfig($platform){
    global $dsql;

    $data = array();
    if($platform == 'h5'){
        $sql = $dsql->SetQuery("SELECT `id`, `config`, `pubdate`, `state` FROM `#@__site_config` WHERE `type` = 'userCenter' AND (`title` = 'h5' OR `title` = '' OR `title` IS NULL) ORDER BY `id` DESC LIMIT 1");
    }else{
        $sql = $dsql->SetQuery("SELECT `id`, `config`, `pubdate`, `state` FROM `#@__site_config` WHERE `type` = 'userCenter' AND `title` = '$platform' ORDER BY `id` DESC LIMIT 1");
    }
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data['state'] = (int)$ret[0]['state'];
        $data['pubdate'] = (int)$ret[0]['pubdate'];
        $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
        if($config){
            $data['cover'] = $config['cover'];
        }
    }else{
        $data['state'] = 2;
    }
    return $data;
}


//查询指定分站的指定终端配置
function getBusinessConfig($platform){
    global $dsql;

    $data = array();
    if($platform == 'h5'){
        $sql = $dsql->SetQuery("SELECT `id`, `config`, `pubdate`, `state` FROM `#@__site_config` WHERE `type` = 'busiCenter' AND (`title` = 'h5' OR `title` = '' OR `title` IS NULL) ORDER BY `id` DESC LIMIT 1");
    }else{
        $sql = $dsql->SetQuery("SELECT `id`, `config`, `pubdate`, `state` FROM `#@__site_config` WHERE `type` = 'busiCenter' AND `title` = '$platform' ORDER BY `id` DESC LIMIT 1");
    }
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $data['state'] = (int)$ret[0]['state'];
        $data['pubdate'] = (int)$ret[0]['pubdate'];
        $config = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
        if($config){
            $data['cover'] = $config['cover'];
        }
    }else{
        $data['state'] = 2;
    }
    return $data;
}


//二维数组去重
function uniqueArray($array){
    return array_map("unserialize", array_unique(array_map("serialize", $array)));
}