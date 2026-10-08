<?php
/**
 * 分站高级设置
 *
 * @version        $Id: siteCityAdvanced.php 2019-02-25 下午16:38:16 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCityAdvanced");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteCityAdvanced.html";

$db = "site_city";


//配置信息
if($cid) {
    $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $cid);
    $ret = $dsql->dsqlOper($sql, "results");
    if (!$ret) {
        die('分站不存在或已经删除，请确认后重试！');
    }
    $configArr = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
}


//删除模板文件夹
if($action == "delTpl") {
    if (empty($floder)) die('请选择要删除的模板！');

    $dir = HUONIAOROOT . "/templates/" . $dopost; //当前目录
    $floder = $dir . "/" . iconv('utf-8', 'gbk', $floder);

    $deldir = deldir($floder);
    if ($deldir) {
        adminLog("删除城市分站模板", $cid . '=>' . $floder);

        die('{"state": 100, "info": ' . json_encode("删除成功！") . '}');
    } else {
        die('{"state": 200, "info": ' . json_encode("删除失败！") . '}');
    }
}


//所属模块
$action = $action ? $action : 'siteConfig';


//获取模板
if($dopost == 'getTemplate'){

    //模板风格
    $dir = "../../templates/" . $action; //当前目录
    $floders = listDir($dir);
    $floderList = $tplList = $defaultTplList = array();

    if(!empty($floders)){
        foreach($floders as $key => $floder){
            $config = $dir . '/' . $floder . '/config.xml';
            $floderArr = explode('__', $floder);

            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if($floderArr && $floderArr[0] == $cid) {
                    array_push($floderList, $floderArr[1]);
                    array_push($tplList, array(
                        'tplname' => $tplname,
                        'directory' => $floder,
                        'copyright' => $copyright
                    ));
                }

                if(!in_array($floder, $floderList)) {

                    if (!strstr($floder, '__')) {
                        array_push($defaultTplList, array(
                            'tplname' => $tplname,
                            'directory' => $floder,
                            'copyright' => $copyright
                        ));
                    }
                }

            }

        }
    }


    //touch模板
    $floders = listDir($dir.'/touch');
    $floderList = $touchTplList = $touchDefaultTplList = array();

    //系统首页增加DIY模板
    if($action == 'siteConfig'){
        array_push($touchTplList, array(
            'tplname' => 'diy',
            'directory' => 'diy',
            'copyright' => '火鸟门户'
        ));
    }

    if(!empty($floders)){
        $i = 0;
        foreach($floders as $key => $floder){
            $config = $dir . '/touch/' . $floder . '/config.xml';
            $floderArr = explode('__', $floder);

            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if($floderArr && $floderArr[0] == $cid) {
                    array_push($floderList, $floderArr[1]);
                    array_push($touchTplList, array(
                        'tplname' => $tplname,
                        'directory' => $floder,
                        'copyright' => $copyright
                    ));
                }

                if(!in_array($floder, $floderList)) {

                    if (!strstr($floder, '__')) {
                        array_push($touchDefaultTplList, array(
                            'tplname' => $tplname,
                            'directory' => $floder,
                            'copyright' => $copyright
                        ));
                    }
                }
            }

        }
    }

    $current = $configArr[$action]['template'];
    if(!file_exists($dir . '/' . $current . '/config.xml')){
        $current = '';
    }

    $touchCurrent = $configArr[$action]['touchTemplate'];
    if(!file_exists($dir . '/touch/' . $touchCurrent . '/config.xml') && $touchCurrent != 'diy'){
        $touchCurrent = '';
    }


    echo json_encode(array(
        'current' => $current,
        'defaultTplList' => $defaultTplList,
        'tplList' => $tplList,
        'touchCurrent' => $touchCurrent,
        'touchDefaultTplList' => $touchDefaultTplList,
        'touchTplList' => $touchTplList
    ));
    die;

//复制模板
}elseif($dopost == 'copyTemplate'){

    $tempDir = HUONIAOROOT . '/templates/' . $action . ($type ? '/touch' : '');
    $oldTemp = $tempDir . '/' . $template;
    $newTemp = $tempDir . '/' . $cid . '__' . $template;
    copyDir($oldTemp, $newTemp);

    if(is_dir($newTemp)){

        //更改权限
        ChmodAll($newTemp, '777');

        adminLog("复制城市分站模板", $cid . '=>' . ($type ? 'touch/' : '') . '=>' . $template);

        echo json_encode(array(
            'state' => 100,
            'info' => '复制成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => '复制失败，请检查文件夹权限！'
        ));
    }
    die;

//保存
}elseif($dopost == 'save'){

    $data = array();

    //系统配置
    if($action == 'siteConfig'){
        $data = array(
            'webname' => $webname,
            'weblogo' => $litpic,
            'keywords' => $keywords,
            'description' => trim($description),
            'hotline' => $hotline,
            'areaCode' => $areaCode,
            'statisticscode' => stripslashes($statisticscode),
            'powerby' => $powerby,
            'template' => $template,
            'touchTemplate' => $touchTemplate,
            'cfg_fzrewardFee'       => (float)$fzrewardFee,
            'cfg_fzbusinessMaidanFee' => (float)$fzbusinessMaidanFee,
            'cfg_fztuanFee'         => (float)$fztuanFee,
            'cfg_fztravelFee'       => (float)$fztravelFee,
            'cfg_fzjobFee'          => (float)$fzjobFee,
            'cfg_fzshopFee'         => (float)$fzshopFee,
            'cfg_fzwaimaiFee'       => (float)$fzwaimaiFee,
            'cfg_fzwaimaiPaotuiFee' => (float)$fzwaimaiPaotuiFee,
            'cfg_fzhuodongFee'      => (float)$fzhuodongFee,
            'cfg_fzliveFee'         => (float)$fzliveFee,
            'cfg_fzvideoFee'        => (float)$fzvideoFee,
            'cfg_fzawardlegouFee'   => (float)$fzawardlegouFee,
            'cfg_fzhomemakingFee'   => (float)$fzhomemakingFee,
            'cfg_fzeducationFee'    => (float)$fzeducationFee,
            'cfg_roofFee'           => (float)$roofFee,
            'cfg_setmealFee'        => (float)$setmealFee,
            'cfg_fabulFee'          => (float)$fabulFee,
            'cfg_levelFee'          => (float)$levelFee,
            'cfg_storeFee'          => (float)$storeFee,
            'cfg_fenxiaoFee'        => (float)$fenxiaoFee,
            'cfg_jiliFee'           => (float)$jiliFee,
            'cfg_payPhoneFee'       => (float)$payPhoneFee,
            'wechatToken'           => trim($wechatToken),
            'wechatAppid'           => trim($wechatAppid),
            'wechatAppsecret'       => trim($wechatAppsecret),
            'wechatName'            => trim($wechatName),
            'wechatCode'            => trim($wechatCode),
            'wechatQr'              => trim($wechatQr),
            'miniProgramName'       => trim($miniProgramName),
            'miniProgramAppid'      => trim($miniProgramAppid),
            'miniProgramAppsecret'  => trim($miniProgramAppsecret),
            'miniProgramId'         => trim($miniProgramId),
            'miniProgramBindWechat' => (int)$miniProgramBindWechat,
            'miniProgramQr'         => trim($miniProgramQr),
            'wxpayAppid'            => trim($wxpayAppid),
            'wxpayAppSecret'        => trim($wxpayAppSecret),
            'wxpayMchid'            => trim($wxpayMchid),
            'wxpayKey'              => trim($wxpayKey)
        );

    }else{

        $data = array(
            'state' => $state,
            'title' => $title,
            'keywords' => $keywords,
            'description' => trim($description),
            'logo' => $litpic,
            'short_video_promote' => $short_video_promote,
            'hotline' => $hotline,
            'router' => $router,
            'template' => $template,
            'touchRouter' => $touchRouter,
            'touchTemplate' => $touchTemplate,
            'serviceMoney' => (float)$paotuiServiceMoney,
            'cityDispatch' => (int)$cityDispatch

        );

    }

    
    //如果是外卖模块，则增加恶劣天气配送费相关配置
    if ($action == 'waimai') {
        $data['badWeatherState'] = (int)$badWeatherState; //是否开启恶劣天气配送费 1启用 0关闭
        $data['badWeatherMoney'] = (float)$badWeatherMoney; //恶劣天气增加费用
        $data['badWeatherStart'] = trim($badWeatherStart); //开始时间
        $data['badWeatherEnd'] = trim($badWeatherEnd); //结束时间
    }

    //房产新增属性
    if ($action == 'house') {
        $data['qunQR'] = trim($qunQR); //购房群二维码
    } 

    //如果是城市招聘，则增加新功能的相关配置
    if ($action == 'zhaopin') {
        $data['share_title'] = trim($share_title); //分享标题
        $data['share_pic'] = trim($share_pic); //分享图片

        $data['autojobup'] = (int)$autojobup; //平台职位刷新，0系统默认 1关闭 2开启
        $data['autojobrange'] = (int)$autojobrange; //自动刷新范围，0所有职位 1后台发布职位
        $data['autojobfrequency'] = (float)$autojobfrequency; //自动刷新频率，单位小时
        $data['autojobperiod'] = (int)$autojobperiod; //自动刷新有效期，单位天
        $data['postRefreshCreatePeriod'] = (int)$postRefreshCreatePeriod; //平台职位刷新筛选创建时间范围，单位：天

        //如果职位刷新开启，且刷新频率为0，则报错
        if ($data['autojobup'] == 2 && $data['autojobfrequency'] == 0) {
            output('刷新频率不能为0！');
        }

        $data['autoApply'] = (int)$autoApply; //人才简历自动投递，0系统默认 1关闭 2开启

        //更新该城市对应的分站刷新配置
        $open = round($data['autojobup'] - 1); //是否开启 0:关闭 1:开启
        $custom = 1; //是否自定义 0:否 1:是
        $scope = $data['autojobrange']; //刷新范围 0:所有职位 1:后台发布职位
        $frequency = $data['autojobfrequency']; //自动刷新频率，单位小时
        $period = $data['autojobperiod']; //自动刷新有效期，单位天
        $createPeriod = $data['postRefreshCreatePeriod']; //平台职位刷新筛选创建时间范围，单位：天
        if ($data['autojobup'] == 0) {
            $custom = 0;
            //如果是选择的系统默认，则去查询默认的配置参数
            $sql = $dsql->SetQuery("SELECT `postRefresh`,`postRefreshScope`,`postRefreshFrequency`,`postRefreshPeriod`,`postRefreshCreatePeriod` FROM `#@__zhaopin_config` WHERE `cityid` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $open = (int)$ret[0]['postRefresh'];
                $scope = (int)$ret[0]['postRefreshScope'];
                $frequency = (float)$ret[0]['postRefreshFrequency'];
                $period = (int)$ret[0]['postRefreshPeriod'];
                $createPeriod = (int)$ret[0]['postRefreshCreatePeriod'];
            } else {
                //没有查询到系统默认配置就关闭分站刷新
                $open = 0;
            }
        }

        $starttime = 0; //刷新开始时间
        $endtime = 0; //刷新结束时间

        //查询是否已经有该分站的配置了，有就更新，没有就新增
        $nowTime = GetMkTime(time()); //当前时间
        $sql = $dsql->SetQuery("SELECT * FROM `#@__zhaopin_city_post_refresh` WHERE `cityid` = " . $cid);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret != null && is_array($ret)){
            //如果是开启，则开始时间为原来的开始时间，结束时间重新计算
            if ($open == 1) {
                $starttime = $ret[0]['starttime'];
                //如果开始时间为0，说明是重置过了，将开始时间设置为当前时间
                if ($starttime == 0) {
                    $starttime = $nowTime;
                }
                $endtime = $starttime + $period*86400;
            }
            $sql = $dsql->SetQuery("UPDATE `#@__zhaopin_city_post_refresh` SET `open` = ".$open.",`custom` = ".$custom.",`scope` = ".$scope.",`frequency` = ".$frequency.",`period` = ".$period.",`createPeriod` = ".$createPeriod.",`nexttime` = ".round($ret[0]['lasttime'] + $frequency*3600).",`starttime` = ".$starttime.",`endtime` = ".$endtime." WHERE `cityid` = ".$cid);
            $ret = $dsql->dsqlOper($sql, "update");
        } else {
            //如果是开启，则当前时间为开始时间
            if ($open == 1) {
                $starttime = $nowTime;
                $endtime = $starttime + $period*86400;
            }
            $sql = $dsql->SetQuery("INSERT INTO `#@__zhaopin_city_post_refresh` (`cityid`, `open`, `custom`, `scope`, `frequency`, `period`, `createPeriod`, `nexttime`, `starttime`, `endtime`) VALUES ('".$cid."', '".$open."', '".$custom."', '".$scope."', '".$frequency."', '".$period."', '".$createPeriod."', '".($frequency*3600)."', '".$starttime."', '".$endtime."')");
            $lastid = $dsql->dsqlOper($sql, "lastid");
        }
    }


    if(!$configArr[$action]){
        $configArr[$action] = array();
    }
    $configArr[$action] = $data;

    $config = serialize($configArr);
    $config = addslashes($config);
    $sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `config` = '$config' WHERE `cid` = $cid");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){

        adminLog("编辑城市分站高级设置", $cid);

        //更新高级配置到缓存文件
        updateCityAdvancedConfig();

        echo json_encode(array(
            'state' => 100,
            'info' => '配置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'publicUpload.js',
		'admin/siteConfig/siteCityAdvanced.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cid', (int)$cid);

	//系统模块
    $moduleArr = array();
    $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        foreach ($result as $key => $value) {
            if(!empty($value['name'])){
                $moduleArr[] = array(
                    "name" => $value['name'],
                    "title" => $value['subject'] ? $value['subject'] : $value['title']
                );
            }
        }
    }
    $huoniaoTag->assign('moduleArr', $moduleArr);
    $huoniaoTag->assign('action', $action);

    //配置
    $huoniaoTag->assign('config', $configArr);


    //如果是外卖模块，则向前端传递状态配置数组
    if ($action == 'waimai') {
        $badWeatherStateArr = array(1 => '启用', 0 => '关闭');
        $huoniaoTag->assign('badWeatherStateArr', $badWeatherStateArr);
    }


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}


//更新高级配置到缓存文件
// 更新高级配置到缓存文件
function updateCityAdvancedConfig(){
    global $dsql;

    // 获取所有城市分站的高级配置
    $sql = $dsql->SetQuery("SELECT a.`typename`, c.`cid`, c.`config` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON c.`cid` = a.`id` WHERE c.`state` = 1 ORDER BY c.`cid`");
    $ret = $dsql->dsqlOper($sql, "results");
    
    $configArr = ['wechat' => [], 'wxmini' => []];
    
    if (empty($ret) || !is_array($ret)) {
        generateConfigFile($configArr);
        return;
    }

    foreach ($ret as $value) {
        if (empty($value['config'])) continue;
        
        $config = unserialize($value['config']);
        if (!is_array($config) || !isset($config['siteConfig'])) continue;
        
        $siteConfig = $config['siteConfig'];
        $cid = $value['cid'];

        // 微信公众号配置
        if (!empty($siteConfig['wechatToken']) && !empty($siteConfig['wechatAppid']) && !empty($siteConfig['wechatAppsecret']) && !empty($siteConfig['wechatName'])) {
            $configArr['wechat'][$cid] = [
                'cityname' => $value['typename'],
                'token' => $siteConfig['wechatToken'],
                'appid' => $siteConfig['wechatAppid'],
                'appsecret' => $siteConfig['wechatAppsecret'],
                'name' => $siteConfig['wechatName'],
                'code' => $siteConfig['wechatCode'],
                'qr' => $siteConfig['wechatQr'] ?? ''
            ];
        }

        // 微信小程序配置
        if (!empty($siteConfig['miniProgramName']) && !empty($siteConfig['miniProgramAppid']) && !empty($siteConfig['miniProgramAppsecret'])) {
            $configArr['wxmini'][$cid] = [
                'cityname' => $value['typename'],
                'name' => $siteConfig['miniProgramName'],
                'appid' => $siteConfig['miniProgramAppid'],
                'appsecret' => $siteConfig['miniProgramAppsecret'],
                'id' => $siteConfig['miniProgramId'],
                'bindWechat' => $siteConfig['miniProgramBindWechat'],
                'qr' => $siteConfig['miniProgramQr'] ?? ''
            ];
        }

        // 微信支付配置
        if (!empty($siteConfig['wxpayAppid']) && !empty($siteConfig['wxpayAppSecret']) && !empty($siteConfig['wxpayMchid']) && !empty($siteConfig['wxpayKey'])) {
            $configArr['wxpay'][$cid] = [
                'cityname' => $value['typename'],
                'appid' => $siteConfig['wxpayAppid'],
                'appsecret' => $siteConfig['wxpayAppSecret'],
                'mchid' => $siteConfig['wxpayMchid'],
                'key' => $siteConfig['wxpayKey']
            ];
        }
    }

    generateConfigFile($configArr);
}

// 生成配置文件
function generateConfigFile($configArr) {
    
    // 生成数组字符串
    $wechatStr = generateArrayString($configArr['wechat']);
    $wxminiStr = generateArrayString($configArr['wxmini']);
    $wxpayStr = generateArrayString($configArr['wxpay']);
    
    $configFile = "<?php\n";
    $configFile .= "\$cfg_siteCityAdvanced_wechat = {$wechatStr};\n";
    $configFile .= "\$cfg_siteCityAdvanced_wxmini = {$wxminiStr};\n";
    $configFile .= "\$cfg_siteCityAdvanced_wxpay = {$wxpayStr};\n";
    $configFile .= "?>";

    $configIncFile = HUONIAOINC.'/config/siteCityAdvanced.inc.php';
    if (file_put_contents($configIncFile, $configFile) === false) {
        die('{"state": 200, "info": ' . json_encode("写入文件 $configIncFile 失败，请检查权限！") . '}');
    }
}

// 生成PHP数组字符串
function generateArrayString($array) {
    if (empty($array)) return 'array()';
    
    $parts = [];
    foreach ($array as $key => $value) {
        $innerParts = [];
        foreach ($value as $k => $v) {
            $innerParts[] = "        '$k' => '$v'";
        }
        $parts[] = "    $key => array(\n" . implode(",\n", $innerParts) . "\n    )";
    }
    
    return "array(\n" . implode(",\n", $parts) . "\n)";
}