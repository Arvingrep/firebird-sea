<?php

/**
 * huoniaoTag模板标签函数插件
 *
 * @param $params array 参数集
 * @return array
 */
function loop($params, $content = "", &$smarty = array(), &$repeat = array()){
    extract($params);

    global $huoniaoTag;
    global $cfg_secureAccess;
    global $cfg_basehost;
    global $dsql;
    global $userLogin;

    global $template;
    if (empty($smarty)) return;

    if (!isset($return))
        $return = 'row'; //返回的变量数组名

    //注册一个block的索引，照顾smarty的版本
    if (method_exists($smarty, 'get_template_vars')) {
        $_bindex = $smarty->get_template_vars('_bindex');
    } else {
        $_bindex = $smarty->getVariable('_bindex')->value;
    }

    if (!$_bindex) {
        $_bindex = array();
    }

    if ($return) {
        if (!isset($_bindex[$return])) {
            $_bindex[$return] = 1;
        } else {
            $_bindex[$return]++;
        }
    }

    $smarty->assign('_bindex', $_bindex);

    //对象$smarty上注册一个数组以供block使用
    if (!isset($smarty->block_data)) {
        $smarty->block_data = array();
    }

    //得一个本区块的专属数据存储空间
    // $dataindex = md5(__FUNCTION__ . md5(serialize($params)));
    // $dataindex = substr($dataindex, 0, 16);
    $dataindex = base64_encode(json_encode($params));

    //使用$smarty->block_data[$dataindex]来存储
    if (!$smarty->block_data[$dataindex]) {

        //取得指定动作名
        $moduleHandels = new handlers($service, $action);

        $param = $params;
        if (!isset($param['isAjax'])) {
            if (isset($smarty->tpl_vars['isAjax'])) {
                $param['isAjax'] = (int)$smarty->tpl_vars['isAjax'];
            }
        }

        //获取分类
        if ($action == "type" || $action == "addr") {
            $param['son'] = $son ? $son : 0;

            //信息列表
        } elseif ($action == "alist") {
            //如果是列表页面，则获取地址栏传过来的typeid
            if ($template == "list" && !$typeid) {
                global $typeid;
            }
            !empty($typeid) ? $param['typeid'] = $typeid : "";
        }

        $moduleReturn  = $moduleHandels->getHandle($param);

        //只返回数据统计信息
        if ($pageData == 1) {
            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $pageInfo_ = array("totalCount" => 0, "gray" => 0, "audit" => 0, "refuse" => 0);
            } else {
                $moduleReturn  = $moduleReturn['info'];  //返回数据
                $pageInfo_ = $moduleReturn['pageInfo'];
            }
            $smarty->block_data[$dataindex] = array($pageInfo_);

            //正常返回
        } else {

            if (!is_array($moduleReturn) || $moduleReturn['state'] != 100) {
                $repeat = false;
                return '';
            }
            $moduleReturn  = $moduleReturn['info'];  //返回数据
            $pageInfo_ = $moduleReturn['pageInfo'];
            if ($pageInfo_) {
                //如果有分页数据则提取list键
                $moduleReturn  = $moduleReturn['list'];
                //把pageInfo定义为global变量
                global $pageInfo;
                $pageInfo = $pageInfo_;
                $smarty->assign('pageInfo', $pageInfo);
            } else {
                if (array_key_exists('list', $moduleReturn)) {
                    $moduleReturn  = $moduleReturn['list'];
                }
            }

            $smarty->block_data[$dataindex] = $moduleReturn;  //存储数据

        }
    }

    //果没有数据，直接返回null,不必再执行了
    if (!$smarty->block_data[$dataindex]) {
        $repeat = false;
        return '';
    }

    if ($action == "type") {
        //print_r($smarty->block_data[$dataindex]);die;
    }

    //一条数据出栈，并把它指派给$return，重复执行开关置位1
    if (list($key, $item) = each($smarty->block_data[$dataindex])) {
        if ($action == "type") {
            //print_r($item);die;
        }
        $smarty->assign($return, $item);
        $repeat = true;
    }

    //如果已经到达最后，重置数组指针，重复执行开关置位0
    if (!$item) {
        reset($smarty->block_data[$dataindex]);
        $repeat = false;
    }

    //打印内容
    print $content;
}


//模板中获取模块配置信息
function smarty_function_getModuleConfig($params){
    extract($params);

    $moduleConfig = getModuleConfig($module);
    if($moduleConfig && isset($moduleConfig[$key])){
        return $moduleConfig[$key];
    }
    return '';
}

//输出模块配置相关信息
//以前是通过模块.class中的config进行获取，由于模块越来越多，而且模块的class文件也越来越大，通过include的方式加载占用太多资源，通过这里来单独获取模块的配置信息
function getModuleConfig($module = ''){

    global $_G;
    global $siteCityInfo;

    $cityid = $siteCityInfo['cityid'];

    $md5ModuleKey = "moduleConfig_" . $cityid . "_" . $module;
    if(isset($_G[$md5ModuleKey])){
        return $_G[$md5ModuleKey];
    }

    $module_cache = cache_read($md5ModuleKey . '.php', 'moduleConfig/'.$cityid);
    if($module_cache){
        return $module_cache;
    }

    $configFile = HUONIAOINC."/config/".$module.".inc.php";
    if(file_exists($configFile)){
        require($configFile);
    }else{
        return;
    }

    global $cfg_basehost;          //系统主域名
    global $cfg_secureAccess;

    global $cfg_userSubDomain;     //个人会员
    global $cfg_busiSubDomain;     //企业会员

    global $cfg_webname;         //网站名称
    global $cfg_shortname;       //简称
    global $cfg_keywords;        //网站关键字
    global $cfg_description;     //网站描述
    global $cfg_beian;           //网站ICP备案号
    global $cfg_powerby;         //网站版权信息
    global $cfg_statisticscode;  //统计代码
    global $cfg_visitState;      //网站运营状态
    global $cfg_visitMessage;    //禁用时的说明信息
    global $cfg_timeZone;        //网站默认时区
    global $cfg_mapCity;         //地图默认城市
    global $cfg_map;             //地图配置
    global $cfg_map_baidu_wxmini;  //百度地图小程序密钥
    global $cfg_template;        //首页风格
    global $cfg_touchTemplate;   //首页风格
    global $cfg_defaultindex;    //默认首页
    global $cfg_photoSize;       //头像上传限制大小
    global $cfg_photoType;       //头像上传类型限制
    global $cfg_siteDebug;       //调试模式
    global $cfg_sitePageGray;    //页面变灰
    global $cfg_miniProgramName;  //小程序名称
    global $cfg_smsLoginState;   //是否短信验证码登录
    global $huawei_privatenumber_state;  //是否启用隐私保护通话
    global $cfg_payPhoneState;  //是否启用付费查看电话
    
    global $cfg_hotline;              //系统默认咨询热线
    global $cfg_weblogo;              //系统默认logo地址
    global $cfg_touchlogo;            //系统默认移动端logo地址  
    global $cfg_softSize;             //系统附件上传限制大小
    global $cfg_softType;             //系统附件上传类型限制
    global $cfg_thumbSize;            //系统缩略图上传限制大小
    global $cfg_thumbType;            //系统缩略图上传类型限制
    global $cfg_atlasSize;            //系统图集上传限制大小
    global $cfg_atlasType;            //系统图集上传类型限制

    //获取当前城市名
    global $siteCityInfo;
    if(is_array($siteCityInfo)){
        $cityName = $siteCityInfo['name'];
    }

    //如果上传设置为系统默认，则以下参数使用系统默认
    if($customUpload == 0){
        $custom_softSize = $cfg_softSize;
        $custom_softType  = $cfg_softType;
        $custom_thumbSize = $cfg_thumbSize;
        $custom_thumbType = $cfg_thumbType;
        $custom_atlasSize = $cfg_atlasSize;
        $custom_atlasType = $cfg_atlasType;
    }

    $hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;
    $customChannelDomain = getDomainFullUrl($module, $customSubDomain);

    //分站自定义配置
    global $siteCityAdvancedConfig;
    if($siteCityAdvancedConfig && $siteCityAdvancedConfig[$module]){
        if($siteCityAdvancedConfig[$module]['title']){
            $customSeoTitle = $siteCityAdvancedConfig[$module]['title'];
        }
        if($siteCityAdvancedConfig[$module]['keywords']){
            $customSeoKeyword = $siteCityAdvancedConfig[$module]['keywords'];
        }
        if($siteCityAdvancedConfig[$module]['description']){
            $customSeoDescription = $siteCityAdvancedConfig[$module]['description'];
        }
        if($siteCityAdvancedConfig[$module]['logo']){
            $customLogoUrl = $siteCityAdvancedConfig[$module]['logo'];
        }
        if($siteCityAdvancedConfig[$module]['hotline']){
            $hotline = $siteCityAdvancedConfig[$module]['hotline'];
        }
    }

    $customSeoDescription = trim($customSeoDescription);

    $return = array();

    //自定义LOGO
    if($customLogo == 1){
        $customLogoPath = getAttachemntFile($customLogoUrl);
    }else{
        $customLogoPath = getAttachemntFile($cfg_weblogo);
    }

    if (empty($custom_map)) $custom_map = $cfg_map;

    //$cfg_map有可能不是int，可能为字符串，这里做下转换
    $mapMapping = [
        'google' => 1,
        'baidu' => 2,
        'qq' => 3,
        'amap' => 4,
        'tmap' => 5
    ];
    
    $custom_map = isset($mapMapping[$custom_map]) ? $mapMapping[$custom_map] : $custom_map; // 默认为百度地图

    $return['channelName']   = str_replace('$city', $cityName, $customChannelName);
    $return['logoUrl']       = $customLogoPath;
    $return['subDomain']     = $customSubDomain;
    $return['channelDomain'] = $customChannelDomain;
    $return['channelSwitch'] = $customChannelSwitch;
    $return['closeCause']    = $customCloseCause;
    $return['title']         = str_replace('$city', $cityName, $customSeoTitle);
    $return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
    $return['description']   = str_replace(PHP_EOL, ' ', str_replace('$city', $cityName, $customSeoDescription));
    $return['hotline']       = $hotline;
    $return['submission']    = $submission;
    $return['atlasMax']      = $customAtlasMax ? $customAtlasMax : 20;
    $return['template']      = $customTemplate;
    $return['touchTemplate'] = $customTouchTemplate;
    $return['softSize']      = $custom_softSize;
    $return['softType']      = $custom_softType;
    $return['thumbSize']     = $custom_thumbSize;
    $return['thumbType']     = $custom_thumbType;
    $return['atlasSize']     = $custom_atlasSize;
    $return['atlasType']     = $custom_atlasType;
    $return['listRule']      = $custom_listRule;
    $return['detailRule']    = $custom_detailRule;

    //地图配置
    global $cfg_map_google;
    global $cfg_map_baidu;
    global $cfg_map_qq;
    global $cfg_map_amap;
    global $cfg_map_tmap;
    global $cfg_map_baidu_server;
    global $cfg_map_amap_server;

    $site_map = $site_map_key = $site_map_apiFile = '';
    switch ($custom_map) {
        case 1:
            $site_map = "google";
            $site_map_key = $cfg_map_google;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "maps.googleapis.com/maps/api/js?key=".$site_map_key."&sensor=false&libraries=places") : "/static/js/map_fallback.js";
            break;
        case 2:
            $site_map = "baidu";
            $site_map_key = $cfg_map_baidu;
            $site_map_server_key = $cfg_map_baidu_server;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "api.map.baidu.com/api?v=2.0&ak=".$site_map_key) : "/static/js/map_fallback.js";
            break;
        case 3:
            $site_map = "qq";
            $site_map_key = $cfg_map_qq;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "map.qq.com/api/js?key=".$cfg_map_qq."&libraries=drawing") : "/static/js/map_fallback.js";
            break;
        case 4:
            $site_map = "amap";
            $site_map_key = $cfg_map_amap;
            $site_map_server_key = $cfg_map_amap_server;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "webapi.amap.com/maps?v=1.4.15&key=".$site_map_key) : "/static/js/map_fallback.js";
            break;
        case 5:
            $site_map = "tmap";
            $site_map_key = $cfg_map_tmap;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "api.tianditu.gov.cn/api?v=4.0&tk=".$site_map_key) : "/static/js/map_fallback.js";
            break;
        default:
            $site_map = "baidu";
            $site_map_key = $cfg_map_baidu;
            $site_map_apiFile = !empty($site_map_key) ? ($cfg_secureAccess . "api.map.baidu.com/api?v=2.0&ak=".$site_map_key) : "/static/js/map_fallback.js";
            break;
    }
    $return['map'] = $site_map;
    $return['map_key'] = $site_map_key;
    $return['map_server_key'] = $site_map_server_key;
    $return['map_apiFile'] = $site_map_apiFile;


    //系统
    if($module == 'siteConfig'){
        $return['baseHost']       = $cfg_basehost;
        $return['webName']        = str_replace('$city', $cityName, $cfg_webname);
        $return['shortName']      = str_replace('$city', $cityName, $cfg_shortname);
        $return['webLogo']        = $cfg_weblogo;
        $return['touchLogo']      = $cfg_touchlogo;
        $return['keywords']       = str_replace('$city', $cityName, $cfg_keywords);
        $return['description']    = str_replace(PHP_EOL, ' ', str_replace('$city', $cityName, $cfg_description));
        $return['beian']          = $cfg_beian;
        $return['hotline']        = $cfg_hotline;
        $return['powerby']        = str_replace('$city', $cityName, $cfg_powerby);
        $return['statisticscode'] = $cfg_statisticscode;
        $return['visitState']     = $cfg_visitState;
        $return['visitMessage']   = $cfg_visitMessage;
        $return['timeZone']       = $cfg_timeZone;
        $return['mapCity']        = $cfg_mapCity;
        // $return['map']            = $cfg_map;
        $return['mapKey']         = $cfg_map_key;
        $return['baiduMapKey_wxmini']  = $cfg_map_baidu_wxmini;
        $return['template']       = $cfg_template;
        $return['touchTemplate']  = $cfg_touchTemplate;
        $return['defaultindex']   = $cfg_defaultindex;
        $return['softSize']       = $cfg_softSize;
        $return['softType']       = $cfg_softType;
        $return['thumbSize']      = $cfg_thumbSize;
        $return['thumbType']      = $cfg_thumbType;
        $return['atlasSize']      = $cfg_atlasSize;
        $return['atlasType']      = $cfg_atlasType;
        $return['photoSize']      = $cfg_photoSize;
        $return['photoType']      = $cfg_photoType;
        $return['siteDebug']      = (int)$cfg_siteDebug;
        $return['sitePageGray']   = (int)$cfg_sitePageGray;
        $return['miniProgramName'] = $cfg_miniProgramName;
        $return['smsLoginState']  = (int)$cfg_smsLoginState;
        $return['privatenumberState']  = (int)$huawei_privatenumber_state;
        $return['payPhoneState']  = (int)$cfg_payPhoneState;
    }

    //会员
    if($module == 'member'){

        //个人会员
        $userDomainInfo = getDomain('member', 'user');
        $userChannelDomain = $userDomainInfo['domain'];
        if($cfg_userSubDomain == 0){
            $userChannelDomain = $cfg_secureAccess.$userChannelDomain;
        }elseif($cfg_userSubDomain == 1){
            $userChannelDomain = $cfg_secureAccess.$userChannelDomain.".".str_replace("www.", "", $cfg_basehost);
        }elseif($cfg_userSubDomain == 2){
            $userChannelDomain = $cfg_secureAccess.$cfg_basehost."/".$userChannelDomain;
        }

        //企业会员
        $busiDomainInfo = getDomain('member', 'busi');
        $busiChannelDomain = $busiDomainInfo['domain'];
        if($cfg_busiSubDomain == 0){
            $busiChannelDomain = $cfg_secureAccess.$busiChannelDomain;
        }elseif($cfg_busiSubDomain == 1){
            $busiChannelDomain = $cfg_secureAccess.$busiChannelDomain.".".str_replace("www.", "", $cfg_basehost);
        }elseif($cfg_busiSubDomain == 2){
            $busiChannelDomain = $cfg_secureAccess.$cfg_basehost."/".$busiChannelDomain;
        }

        $return['userDomain'] = $userChannelDomain;
        $return['busiDomain'] = $busiChannelDomain;

        //分销入驻验证手机
        global $cfg_fenxiaoJoinCheckPhone;
        $fenxiaoJoinCheckPhone = (int)$cfg_fenxiaoJoinCheckPhone;
        $return['fenxiaoJoinCheckPhone'] = $fenxiaoJoinCheckPhone;
    }

    //商家
    if($module == 'business'){
        $businessTag_ = array();
        if($customBusinessTag){
            $arr = explode("\n", $customBusinessTag);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $businessTag_[] = trim($r);
                    }
                }
            }
        }
        $return['businessTag'] = $businessTag_;
        $return['joinCheckPhone'] = (int)$customJoinCheckPhone;


        //商家入驻配置
        $isWxMiniprogram = isWxMiniprogram();
        $isBaiDuMiniprogram = isBaiDuMiniprogram();
        $isQqMiniprogram = isQqMiniprogram();
        $isByteMiniprogram = isByteMiniprogram();

        //获取模块信息
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticVersion;
        global $dsql;
        $moduleListArr = array();
        $sql = $dsql->SetQuery("SELECT `icon`, `name` FROM `#@__site_module` WHERE `parentid` != 0 AND `state` = 0 AND `type` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $value) {
                $moduleListArr[$value['name']] = (empty($value['icon']) ? $cfg_secureAccess.$cfg_basehost.'/static/images/admin/nav/' . $value['name'] . '.png?v='.$cfg_staticVersion : getAttachemntFile($value['icon']));
            }
        }

        //商家特权
        $businessPrivilege = $businessPrivilege ? unserialize($businessPrivilege) : array();
        $return['privilege'] = $businessPrivilege;

        //商家特权
        $storeArr = array();
        $businessStore = $businessStore ? unserialize($businessStore) : array();
        if($businessStore){
            foreach ($businessStore as $key => $value) {

                $sql = $dsql->SetQuery("SELECT `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5` FROM `#@__site_module` WHERE `name` = '$key'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $_ret = $ret[0];

                    //模块开关
                    if(
                        (!isMobile() && $_ret['pc']) ||
                        (
                            isMobile() && (
                            (!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $_ret['h5'] && !isApp()) ||
                            ($isWxMiniprogram && $_ret['wx'] && !isApp()) ||
                            ($isBaiDuMiniprogram && $_ret['bd'] && !isApp()) ||
                            ($isQqMiniprogram && $_ret['qm'] && !isApp()) ||
                            ($isByteMiniprogram && $_ret['dy'] && !isApp()) ||
                            (isApp() && $_ret['app'] == 0)
                            )
                        )
                    ){
                        $storeArr[$key] = $value;
                        $storeArr[$key]['icon'] = $moduleListArr[$key];
                    }
                }
            }
        }
        $return['store'] = $storeArr;


        //套餐管理
        global $installModuleArr;
        $businessPackage = $businessPackage ? unserialize($businessPackage) : array();
        $packageArr = array();
        if($businessPackage){

            foreach ($businessPackage as $key => $value) {
                $value['icon'] = $value['icon'] ? getAttachemntFile($value['icon']) : '';
                $list = $value['list'];

                $listArr = array();
                $listContent = array();
                $listCount = 0;
                $listPrice = 0;
                if($list){

                    $listArr['privilege'] = array();
                    $listArr['store'] = array();

                    $listContent = explode(',', $list);
                    $listCount = count($listContent);
                    foreach ($listContent as $k => $v) {

                        //商家权限
                        if($businessPrivilege[$v]){
                            $listArr['privilege'][] = array(
                                'name' => $v,
                                'title' => $businessPrivilege[$v]['title'],
                                'price' => $businessPrivilege[$v]['price'],
                                'note'  => $businessPrivilege[$v]['note']
                            );

                            $listPrice += $businessPrivilege[$v]['price'];
                        }

                        //模块权限
                        $ret = array();
                        if(in_array($v, $installModuleArr)){
                            $sql = $dsql->SetQuery("SELECT `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5` FROM `#@__site_module` WHERE `name` = '$v'");
                            $ret = $dsql->dsqlOper($sql, "results");
                        }
                        if($ret){

                            $_ret = $ret[0];

                            //模块开关
                            if(
                                (!isMobile() && $_ret['pc']) ||
                                (
                                    isMobile() && (
                                    (!$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $_ret['h5'] && !isApp()) ||
                                    ($isWxMiniprogram && $_ret['wx'] && !isApp()) ||
                                    ($isBaiDuMiniprogram && $_ret['bd'] && !isApp()) ||
                                    ($isQqMiniprogram && $_ret['qm'] && !isApp()) ||
                                    ($isByteMiniprogram && $_ret['dy'] && !isApp()) ||
                                    (isApp() && $_ret['app'] == 0)
                                    )
                                )
                            ){
                                if($businessStore[$v]){
                                    $listArr['store'][] = array(
                                        'name' => $v,
                                        'title' => $businessStore[$v]['title'],
                                        'price' => $businessStore[$v]['price'],
                                        'note'  => $businessStore[$v]['note'],
                                        'icon'  => $moduleListArr[$v]
                                    );

                                    $listPrice += $businessStore[$v]['price'];
                                }
                            }
                        }
                    }

                }
                $value['listCount'] = (int)$listCount;  //套餐内容数量
                $value['listContent'] = $listContent;  //套餐内容模块
                $value['listArr'] = $listArr;  //套餐具体内容
                $value['listPrice'] = (float)$listPrice;  //总价值
                array_push($packageArr, $value);
            }
        }
        $return['package'] = $packageArr;


        //活动管理
        //开通时长
        $businessJoinTimes = $businessJoinTimes ? unserialize($businessJoinTimes) : array();
        $joinTimesArr = array();
        if($businessJoinTimes){
            foreach ($businessJoinTimes as $key => $value) {
                array_push($joinTimesArr, array(
                    'month' => $value,
                    'title' => $value > 11 ? ($value/12) . $langData['siteConfig'][13][14] : $value . $langData['siteConfig'][13][31]
                ));
            }
        }
        $return['joinTimes'] = $joinTimesArr;

        //满减
        $businessJoinSale = $businessJoinSale ? unserialize($businessJoinSale) : array();
        $return['joinSale'] = $businessJoinSale;

        //送积分
        $businessJoinPoint = $businessJoinPoint ? unserialize($businessJoinPoint) : array();
        $return['joinPoint'] = $businessJoinPoint;
    }


    //资讯
    if($module == 'article'){
        $return['selfmediaGrantImg'] = getAttachemntFile($custom_selfmediaGrantImg);
        $return['selfmediaGrantTpl'] = getAttachemntFile($custom_selfmediaGrantTpl);
        $return['selfmediaAgreement'] = $custom_selfmediaAgreement ? stripslashes($custom_selfmediaAgreement) : '';
        $return['rewardSwitch'] = (int)$customRewardSwitch;
        $return['rewardLimit'] = (float)$customRewardLimit;
        $return['rewardOption'] = $customRewardOption ? array_map('floatval', explode("\r\n", $customRewardOption)) : array(1,2,5,10,20);
        $return['articleTypeOption'] = $customArticleTypeOption ? ($customArticleTypeOption == ',' ? array() : explode(',', $customArticleTypeOption)) : array('pic', 'video', 'short_video', 'media', 'special');
    }


    //直播、圈子
    if($module == 'live' || $module == 'circle' || $module == 'tieba'){
        $return['rewardSwitch'] = (int)$customRewardSwitch;
        $return['rewardLimit'] = $customRewardLimit ? (float)$customRewardLimit : 100;
        $return['rewardOption'] = $customRewardOption ? array_map('floatval', explode("\r\n", $customRewardOption)) : ($module == 'live' ? array(1,2,5,8,10,20) : array(1,2,5,10,20));
    }

    //招聘
    if($module == 'job'){
        $return['resume_point']  = $resume_point;
        $return['pgCustomName']  = $customPgCustomName ?? '普工/店招';
        $return['pgCustomDescription']  = $customPgCustomDescription ?? '求职招工如此简单';
        $return['newCheck']  = (int)$customNewCheck;
        $return['changeCheck']  = (int)$customChangeCheck;
        $return['fabuResumeCheck']  = (int)$custom_fabuResumeCheck;
    }

    //汽车
    if($module == 'car'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
        $return['caratlasMax'] = $custom_car_atlasMax;
        $return['wechat'] = getFilePath($customWechat);

        $carTag_ = array();
        if($customCarTag){
            $arr = explode("\n", $customCarTag);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $carTag_[] = trim($r);
                    }
                }
            }
        }
        $return['carTag'] = $carTag_;
    }

    //交友
    if($module == 'dating'){
        $return['goldName'] = $goldName;
        $return['goldRatio'] = $goldRatio;
        $return['goldDeposit'] = $goldDeposit;
        $return['keyPrice'] = $keyPrice;
        $return['leadPrice'] = $leadPrice ? unserialize($leadPrice) : array();

        if(!empty($extractRatio)){
            $extractRatio = unserialize($extractRatio);
            $r = array();
            foreach ($extractRatio as $k => $v) {
                $r[$v['type']] = array(
                    "hn1" => $v['hn1'],
                    "hn2" => $v['hn2'],
                    "u2" => $v['u2'],
                    "pt" => $v['pt'],
                );
            }
            $return['extractRatio'] = $r;
        }else{
            $return['extractRatio'] = "";
        }
        $return['withdrawRatio'] = (float)$withdrawRatio;
        $return['withdrawMinAmount'] = (float)$withdrawMinAmount;
        $return['voiceswitch'] = (int)$voiceswitch;
        $return['videoswitch'] = (int)$videoswitch;

        $return['plat_title'] = $plat_title;
        $return['plat_litpic'] = $plat_litpic ? getAttachemntFile($plat_litpic) : "";
        $return['plat_service'] = $plat_service;
    }

    //教育
    if($module == 'education'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
        $return['educationcoursesatlasMax'] = $custom_educationcourses_atlasMax;
        $return['educationcoursesCheck'] = $customeducationcoursesCheck;
        $return['educationteacherCheck'] = $customeducationteacherCheck;
        $return['educationtutorCheck'] = $customeducationtutorCheck;
    }

    //家政
    if($module == 'homemaking'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
        $return['homemakingatlasMax'] = $custom_homemaking_atlasMax;

        $homemakingTag_ = array();
        if($customshomemakingTag){
            $arr = explode("\n", $customshomemakingTag);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $homemakingTag_[] = trim($r);
                    }
                }
            }
        }
        $return['homemakingTag'] = $homemakingTag_;

        $homemakingFlag_ = array();
        if($customshomemakingFlag){
            $arr = explode("\n", $customshomemakingFlag);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $homemakingFlag_[] = trim($r);
                    }
                }
            }
        }
        $return['homemakingFlag'] = $homemakingFlag_;

        $refundReason_ = array();
        if($customrefundReason){
            $arr = explode("\n", $customrefundReason);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $refundReason_[] = trim($r);
                    }
                }
            }
        }
        $return['refundReason'] = $refundReason_;

        $afterSalesType_ = array();
        if($customafterSalesType){
            $arr = explode("\n", $customafterSalesType);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $afterSalesType_[] = trim($r);
                    }
                }
            }
        }
        $return['afterSalesType'] = $afterSalesType_;
    }

    //房产
    if($module == 'house'){
        $return['la_atlasMax'] = $custom_la_atlasMax;
        $return['ll_atlasMax'] = $custom_ll_atlasMax;
        $return['ca_atlasMax'] = $custom_ca_atlasMax;
        $return['houseSale_atlasMax'] = $custom_houseSale_atlasMax;
        $return['houseZu_atlasMax'] = $custom_houseZu_atlasMax;
        $return['houseXzl_atlasMax'] = $custom_houseXzl_atlasMax;
        $return['houseSp_atlasMax'] = $custom_houseSp_atlasMax;
        $return['houseCf_atlasMax'] = $custom_houseCf_atlasMax;
        $return['zjuserPriceCost'] = $custom_zjuserPriceCost ? unserialize($custom_zjuserPriceCost) : array();
        $return['fabuCheckPhone'] = (int)$customFabuCheckPhone;  //发布信息验证手机号码，0不需要验证  1需要验证
    }

    //婚嫁
    if($module == 'marry'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
        $return['marryhotelfieldatlasMax'] = $custom_marryhotelfield_atlasMax;
        $return['marryweddingcaratlasMax'] = $custom_marryweddingcar_atlasMax;
        $return['marryplancaseatlasMax'] = $custom_marryplancase_atlasMax;
        $return['marryplanmealatlasMax'] = $custom_marryplanmeal_atlasMax;

        $marryTag_ = array();
        if($custommarryTag){
            $arr = explode("\n", $custommarryTag);
            foreach ($arr as $k => $v) {
                $arr_ = explode('|', $v);
                foreach ($arr_ as $s => $r) {
                    if(trim($r)){
                        $marryTag_[] = trim($r);
                    }
                }
            }
        }
        $return['marryTag'] = $marryTag_;
    }

    //养老
    if($module == 'pension'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
    }

    //装修
    if($module == 'renovation'){
        $return['xq_atlasMax'] = $custom_xq_atlasMax;
        $return['gs_atlasMax'] = $custom_gs_atlasMax;
        $return['case_atlasMax'] = $custom_case_atlasMax;
        $return['diary_atlasMax'] = $custom_diary_atlasMax;
    }

    //商城
    if($module == 'shop'){
        $huodongshoptypeopen = (int)$custom_huodongshoptypeopen;
        $return['pagetype'] = $huodongshoptypeopen;   //展示商品类型 1团购 2 电商 0混合
        $return['huodongopen'] = $custom_huodongopen;               // 1准点抢购 2特价秒杀 3砍价 5拼团特惠
        $return['shopopen'] = $custom_shopopen;                 // 4热门商品
        $return['shopCheck'] = $customshopCheck;                // 1团购 2电商
        $return['tagarr'] = explode("|",$customtuanTag);

        //页面显示配置
        $pageTypeConfig = array();
        $_pageTypeConfig = $custom_pageTypeConfig ? json_decode($custom_pageTypeConfig, true) : array();
        if(!$_pageTypeConfig || !is_array($_pageTypeConfig)){
            //兼容老数据
            
            $pageTypeConfigNames = array('到店优惠', '送到家', '商家');
            $pageTypeConfig = array(
                array('id' => 1, 'name' => $pageTypeConfigNames[0], 'title' => $pageTypeConfigNames[0], 'show' => 1),
                array('id' => 2, 'name' => $pageTypeConfigNames[1], 'title' => $pageTypeConfigNames[1], 'show' => 1),
                array('id' => 3, 'name' => $pageTypeConfigNames[2], 'title' => $pageTypeConfigNames[2], 'show' => 1),
            );
    
            //团购
            if($huodongshoptypeopen == 1){
                $pageTypeConfig[1]['show'] = 0;
            }
            //电商
            elseif($huodongshoptypeopen == 2){
                $pageTypeConfig[0]['show'] = 0;
            }
        }else{
            $pageTypeConfig = $_pageTypeConfig;
        }
        $return['pageTypeConfig'] = $pageTypeConfig;
    }

    //旅游
    if($module == 'travel'){
        $return['storeatlasMax'] = $custom_store_atlasMax;
        $return['travelhotelatlasMax'] = $custom_travelhotel_atlasMax;
        $return['travelticketatlasMax'] = $custom_travelticket_atlasMax;
        $return['travelstrategyatlasMax'] = $custom_travelstrategy_atlasMax;
        $return['travelrentcaratlasMax'] = $custom_travelrentcar_atlasMax;
        $return['travelvisaatlasMax'] = $custom_travelvisa_atlasMax;
        $return['travelagencyatlasMax'] = $custom_travelagency_atlasMax;
        $return['travelTrainCheck'] = $customtravelTrainCheck;
        $return['travelTrainTouchUrl'] = $customtravelTrainTouchUrl;
        $return['travelTrainPcUrl'] = $customtravelTrainPcUrl;
        $return['travelPlaneCheck'] = $customtravelPlaneCheck;
        $return['travelPlaneTouchUrl'] = $customtravelPlaneTouchUrl;
        $return['travelPlanePcUrl'] = $customtravelPlanePcUrl;
    }

    //外卖
    if($module == 'waimai'){
        $return['saleState'] = $customSaleState;
        $return['saleTitle'] = $customSaleTitle;
        $return['saleSubTitle'] = $customSaleSubTitle;

        $paotuiMaxAmount = (int)$custompaotuiMaxAmount;
        $return['paotuiMaxAmount'] = $paotuiMaxAmount ?: 500;
    }

    //顺风车
    if($module == 'sfcar'){
        $return['fabuCheckPhone'] = (int)$customFabuCheckPhone;  //发布信息验证手机号码，0需要验证  1不需要验证

        $return['displayConfig'] = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
            array('title' => '人找车', 'subtitle' => '乘用载货'),
            array('title' => '车找人', 'subtitle' => '找客找货'),
        );
    }

    //分类信息
    if($module == 'info'){
        //发布信息地图相关配置
        $return['fabuMapConfig'] = (int)$customFabuMapConfig;  //发布信息时定位功能配置  0系统默认  1选项一  2选项二
        $return['fabuMapDisplayLocation'] = (int)$customFabuMapDisplayLocation;  //发布信息时不显示位置选项  0显示  1隐藏
    }
    
    $_G[$md5ModuleKey] = $return;

    cache_write($md5ModuleKey . '.php', $return, 'moduleConfig/'.$cityid, 1);

    return $return;
    
}