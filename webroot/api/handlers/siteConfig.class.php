<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 系统模块API接口
 *
 * @version        $Id: siteConfig.class.php 2014-3-20 下午17:56:16 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class siteConfig {
    private $param;  //参数
    public static $langData;
    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array()){
        $this->param = $param;
        global $langData;
        self::$langData = $langData;
    }

    /**
     * 系统基本参数
     * @return array
     */
    public function config(){

        global $cfg_basehost;        //网站域名
        global $cfg_webname;         //网站名称
        global $cfg_shortname;       //简称
        global $cfg_fileUrl;         //网站附件地址
        global $cfg_weblogo;         //网站logo地址
        global $cfg_keywords;        //网站关键字
        global $cfg_description;     //网站描述
        global $cfg_beian;           //网站ICP备案号
        global $cfg_hotline;         //网站咨询热线
        global $cfg_powerby;         //网站版权信息
        global $cfg_statisticscode;  //统计代码
        global $cfg_visitState;      //网站运营状态
        global $cfg_visitMessage;    //禁用时的说明信息
        global $cfg_timeZone;        //网站默认时区
        global $cfg_mapCity;         //地图默认城市
        global $cfg_map;             //地图配置
        global $cfg_map_google;      //google密钥
        global $cfg_map_baidu;       //百度密钥
        global $cfg_map_baidu_wxmini;  //百度地图小程序密钥
        global $cfg_map_qq;          //腾讯密钥
        global $cfg_map_amap;        //高德密钥
        global $cfg_template;        //首页风格
        global $cfg_touchTemplate;   //首页风格
        global $cfg_defaultindex;    //默认首页
        global $cfg_softSize;        //附件上传限制大小
        global $cfg_softType;        //附件上传类型限制
        global $cfg_thumbSize;       //缩略图上传限制大小
        global $cfg_thumbType;       //缩略图上传类型限制
        global $cfg_atlasSize;       //图集上传限制大小
        global $cfg_atlasType;       //图集上传类型限制
        global $cfg_photoSize;       //头像上传限制大小
        global $cfg_photoType;       //头像上传类型限制
        global $cfg_siteDebug;       //调试模式
        global $cfg_sitePageGray;    //页面变灰
        global $cfg_miniProgramName;  //小程序名称
        global $cfg_miniProgramTemplate;  //小程序首页模板
        global $cfg_smsLoginState;   //是否短信验证码登录
        global $huawei_privatenumber_state;  //是否启用隐私保护通话
        global $cfg_payPhoneState;  //是否启用付费查看电话
        global $cfg_ucenterLinks;  //会员中心链接
        global $cfg_sharePic;  //分享图标

        //获取当前城市名
        global $siteCityInfo;
        if(is_array($siteCityInfo)){
            $cityName = $siteCityInfo['name'];
        }


        $cfg_weblogo = getAttachemntFile($cfg_weblogo);
        $params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

        switch ($cfg_map) {
            case 1:
                $cfg_map_key = $cfg_map_google;
                break;
            case 2:
                $cfg_map_key = $cfg_map_baidu;
                break;
            case 3:
                $cfg_map_key = $cfg_map_qq;
                break;
            case 4:
                $cfg_map_key = $cfg_map_amap;
                break;
            default:
                $cfg_map_key = $cfg_map_baidu;
                break;
        }

        $cfg_description = trim($cfg_description);

        $return = array();
        if(!empty($params) > 0){

            foreach($params as $key => $param){
                if($param == "baseHost"){
                    $return['baseHost'] = $cfg_basehost;
                }elseif($param == "webName"){
                    $return['webName'] = str_replace('$city', $cityName, $cfg_webname);
                }elseif($param == "shortName"){
                    $return['shortName'] = str_replace('$city', $cityName, $cfg_shortname);
                }elseif($param == "webLogo"){
                    $return['webLogo'] = $cfg_weblogo;
                }elseif($param == "keywords"){
                    $return['keywords'] = str_replace('$city', $cityName, $cfg_keywords);
                }elseif($param == "description"){
                    $return['description'] = str_replace('$city', $cityName, $cfg_description);
                }elseif($param == "beian"){
                    $return['beian'] = $cfg_beian;
                }elseif($param == "hotline"){
                    $return['hotline'] = $cfg_hotline;
                }elseif($param == "powerby"){
                    $return['powerby'] = str_replace('$city', $cityName, $cfg_powerby);
                }elseif($param == "statisticscode"){
                    $return['statisticscode'] = $cfg_statisticscode;
                }elseif($param == "visitState"){
                    $return['visitState'] = $cfg_visitState;
                }elseif($param == "visitMessage"){
                    $return['visitMessage'] = $cfg_visitMessage;
                }elseif($param == "timeZone"){
                    $return['timeZone'] = $cfg_timeZone;
                }elseif($param == "mapCity"){
                    $return['mapCity'] = $cfg_mapCity;
                }elseif($param == "map"){
                    $return['map'] = $cfg_map;
                }elseif($param == "mapKey"){
                    $return['mapKey'] = $cfg_map_key;
                }elseif($param == "template"){
                    $return['template'] = $cfg_template;
                }elseif($param == "touchTemplate"){
                    $return['touchTemplate'] = $cfg_touchTemplate;
                }elseif($param == "defaultindex"){
                    $return['defaultindex'] = $cfg_defaultindex ?: 'siteConfig';
                }elseif($param == "softSize"){
                    $return['softSize'] = $cfg_softSize;
                }elseif($param == "softType"){
                    $return['softType'] = $cfg_softType;
                }elseif($param == "thumbSize"){
                    $return['thumbSize'] = $cfg_thumbSize;
                }elseif($param == "thumbType"){
                    $return['thumbType'] = $cfg_thumbType;
                }elseif($param == "atlasSize"){
                    $return['atlasSize'] = $cfg_atlasSize;
                }elseif($param == "atlasType"){
                    $return['atlasType'] = $cfg_atlasType;
                }elseif($param == "photoSize"){
                    $return['photoSize'] = $cfg_photoSize;
                }elseif($param == "photoType"){
                    $return['photoType'] = $cfg_photoType;
                }
            }

        }else{
            $return['baseHost']       = $cfg_basehost;
            $return['webName']        = str_replace('$city', $cityName, $cfg_webname);
            $return['shortName']      = str_replace('$city', $cityName, $cfg_shortname);
            $return['webLogo']        = $cfg_weblogo;
            $return['sharePic']       = getAttachemntFile($cfg_sharePic);
            $return['keywords']       = str_replace('$city', $cityName, $cfg_keywords);
            $return['description']    = str_replace('$city', $cityName, $cfg_description);
            $return['beian']          = $cfg_beian;
            $return['hotline']        = $cfg_hotline;
            $return['powerby']        = str_replace('$city', $cityName, $cfg_powerby);
            $return['statisticscode'] = $cfg_statisticscode;
            $return['visitState']     = $cfg_visitState;
            $return['visitMessage']   = $cfg_visitMessage;
            $return['timeZone']       = $cfg_timeZone;
            $return['mapCity']        = $cfg_mapCity;
            $return['map']            = $cfg_map;
            $return['mapKey']         = $cfg_map_key;
            $return['baiduMapKey_wxmini']  = $cfg_map_baidu_wxmini;
            $return['template']       = $cfg_template;
            $return['touchTemplate']  = $cfg_touchTemplate;
            $return['defaultindex']   = $cfg_defaultindex ?: 'siteConfig';
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
            $return['ucenterLinks']  = $cfg_ucenterLinks ? (is_array($cfg_ucenterLinks) ? $cfg_ucenterLinks : explode(',', $cfg_ucenterLinks)) : array();

            //分站城市数量，小程序原生端使用
            // if(isWxMiniprogram()){
                $siteCityData = $this->siteCity();
                $siteCityCount = (int)(count($siteCityData));
                $return['siteCityCount'] = $siteCityCount;

                if($siteCityCount == 1){
                    $return['siteCityData'] = $siteCityData[0];
                }

            // }

            // 小程序端首页模板
            // if(isWxMiniprogram()){
                $return['miniProgramTemplate'] = $cfg_miniProgramTemplate;
            // }

            //积分相关配置
            global $cfg_pointState;
            global $cfg_pointName;
            global $cfg_pointRatio;
            global $cfg_returnPoint_shop;  //商城消费返积分比例
            global $cfg_offset_shop;  //购买商城商品积分抵扣比例

            $return['point'] = array(
                'state' => (int)$cfg_pointState,
                'name' => $cfg_pointName,
                'ratio' => $cfg_pointRatio,
                'return_shop' => (int)$cfg_returnPoint_shop,
                'offset_shop' => (int)$cfg_offset_shop
            );
        }

        return $return;

    }


    /**
     * 获取默认首页
     * 直接用config接口，页面会神奇的卡几秒，临时开一个独立的接口使用
     * @return array
     */
    public function siteDefaultIndex(){

        global $cfg_defaultindex;    //默认首页

        $return = array();
        $return['defaultindex']   = $cfg_defaultindex ?: 'siteConfig';

        return $return;

    }


    /**
     * 系统所有模块
     * @return array
     */
    public function siteModule(){
        global $dsql;
        global $cfg_staticPath;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticVersion;
        global $cfg_sharePic;
        global $userLogin;
        global $_G;

        $platform = $this->param['platform'];    //平台
        $type = $this->param['type'];    //默认只输出系统已安装模块，如果为 1 则输出后台模块管理中的所有数据，包括自定义导航
        $cityid = $this->param['cityid'];  //城市分站ID
        $page = $this->param['page'];            //根据页面筛选

        //如果没有传入城市ID，获取默认城市ID
        if(empty($cityid)){
            $cityid = getCityId();
        }

        $md5SiteModuleKey = "siteModule_" . $platform . '_' . $type . '_' . $cityid . '_' . $page;
        if(isset($_G[$md5SiteModuleKey])){
            return $_G[$md5SiteModuleKey];
        }

        //获取分站设置
        $cityConfig = array();
        if($cityid){
            $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $cityid);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cityConfig = unserialize($ret[0]['config']);
            }
        }

        $isWxMiniprogram = $platform == 'wx_miniprogram' ? 1 : isWxMiniprogram();
        $isBaiDuMiniprogram = $platform == 'bd_miniprogram' ? 1 : isBaiDuMiniprogram();
        $isQqMiniprogram = $platform == 'qm_miniprogram' ? 1 : isQqMiniprogram();
        $isByteMiniprogram = $platform == 'dy_miniprogram' ? 1 : isByteMiniprogram();


        $moduleArr = array();
        $config_path = HUONIAOINC."/config/";

        $where = '';

        if($page == 'touchHome'){
            $type = 1;
        }
        if(!$type){
            $where = ' AND `type` = 0';
        }

        //移动端隐藏专题和自助建站
        if(isMobile()){
            $where .= " AND `name` != 'special' AND `name` != 'website'";
        }

        //APP端输出禁用模块
        $disabledModule = array();
        if(isApp()){
            //查询当前配置
            $sql = $dsql->SetQuery("SELECT `disabledModule` FROM `#@__app_config` LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $disabledModule = $data['disabledModule'] ? explode(',', $data['disabledModule']) : array();
            }
        }

        //商家域名
        $domainInfo = getDomain('business', 'config');
        $businessDomain = getUrlPath(array('service' => 'business'));

        $sql = $dsql->SetQuery("SELECT `id`, `type`, `title`, `subject`, `name`, `icon`, `link`, `bold`, `target`, `color`, `wx`, `bd`, `qm`, `dy`, `app`, `pc`, `h5`, `harmony`, `android`, `ios` FROM `#@__site_module` WHERE `state` = 0 AND `parentid` = 1".$where." ORDER BY `weight`, `id`");
        $result = $dsql->dsqlOper($sql, "results");
        if($result){
            foreach ($result as $key => $value) {
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
                ){
                    $sName = $value['name'];

                    //城市分站配置模块开关状态
                    if(!$cityConfig || ($cityConfig && !$cityConfig[$value['name']]['state'])){

                        if($page == "touchHome"){
                            if($sName == "special"|| $sName == "website") continue;
                        }

                        //引入配置文件
                        $serviceInc = $config_path.$sName.".inc.php";
                        if(file_exists($serviceInc)){
                            require($serviceInc);
                        }

                        //重置自定义配置
                        $subDomain = $customSubDomain;
                        global $customSubDomain;
                        $customSubDomain = $subDomain;

                        //获取功能模块配置参数
                        if($sName) {
                            $configHandels = new handlers($sName, "config");
                            $moduleConfig = $configHandels->getHandle();
                        }

                        if((is_array($moduleConfig) && $moduleConfig['state'] == 100) || $value['type'] == 1){
                            $moduleConfig  = $moduleConfig['info'];

                            //识别商家
                            if($value['type'] == 1 && $value['link'] == '{#$business_channelDomain#}' && !strstr($value['link'], '.html')){
                                $value['name'] = 'business';
                                $value['link'] = $businessDomain;
                            }

							//跳转链接
							$url = $value['link'];
							if($value['type']){
								if((isApp() || !isMobile()) && strstr($value['link'], 'miniProgramLive_')){
									$url = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $value['link']);
								}elseif((isApp() || !isMobile()) && strstr($value['link'], 'wxMiniprogram://')){
									$url = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$value['link'];
								}elseif(!isWxMiniprogram() && strstr($value['link'], 'openxcx_')){
									$url = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
								}else{
									$url = $value['link'];
								}
							}else{
								$url = $moduleConfig['channelDomain'] . (isApp() ? '?appTitle' : '');
							}

                            //苹果APP中不支持企业微信客服
                            global $cfg_hotline;
                            if(strstr($url, 'work.weixin.qq.com') && isIOSApp()){
                                $url = 'tel:' . $cfg_hotline;
                            }

                            $_data = array(
                                "id" => $value['id'],
                                "name" => $value['subject'] ? $value['subject'] : $value['title'],
                                "icon" => (empty($value['icon']) ? $cfg_secureAccess.$cfg_basehost.'/static/images/admin/nav/' . $value['name'] . '.png?v='.$cfg_staticVersion : getFilePath($value['icon'])),
                                "code" => $value['name'] ? $value['name'] : (isAndroidApp() && strstr($url, 'service=shop') ? 'shop' : ''),
                                "bold" => $value['bold'],
                                "target" => $value['target'],
                                "color" => $value['color'],
                                "wx" => $value['wx'],
                                "app" => $value['app'],
                                "searchUrl" => $cfg_secureAccess.$cfg_basehost.'/search-list.html?action='.$sName.'&keywords=',
                                "url" => str_replace('$city', $cityid, $url),
                                'title' => $moduleConfig['title'],
                                'description' => $moduleConfig['description'],
                                'logo' => $customSharePic ? getAttachemntFile($customSharePic) : ($cfg_sharePic ? getAttachemntFile($cfg_sharePic) : $moduleConfig['logoUrl']),
                                'disabled' => in_array($value['name'], $disabledModule) ? 1 : 0
                            );

                            //判断登录人是否为家政服务人员，用于订单集合页显示我服务的订单
                            if($value['name'] == 'homemaking'){
                                $personal = 0;
                                $userid = $userLogin->getMemberID();
                                if($userid > 0){
                                    $sql = $dsql->SetQuery("SELECT `id`,`company` FROM `#@__homemaking_personal` WHERE `userid` = $userid");
                                    $ret = $dsql->dsqlOper($sql, "results");
                                    if($ret && is_array($ret)){
                                        $personal = 1;
                                    }
                                }
                                $_data['personal'] = $personal;
                            }

                            $moduleArr[] = $_data;

                        }
                    }

                }
            }
        }

        $_G[$md5SiteModuleKey] = $moduleArr;
        return $moduleArr;
    }


    /**
     * 已开通的城市
     */
    public function siteCity(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $customSubDomain;
        global $cfg_staticVersion;
        global $HN_memory;
        global $cfg_sameAddr_group;

        $list = array();
        $module = is_array($this->param) && !isApp() ? $this->param['module'] : 'siteConfig';  //所在模块，APP中不需要使用此功能，如果使用此功能，会导致将模块设为首页后，获取其他模块信息的链接多了一层模块目录

        //读缓存
        $site_city_cache = $HN_memory->get('site_city');
        if($site_city_cache){
            $list = $site_city_cache;
        }else {
            //缓存城市数据
            $data = json_decode(@file_get_contents(HUONIAOROOT . "/data/cache/system_site_city.json"), true);
            if (!$data || $data['expire_time'] < $cfg_staticVersion || isIOSApp()) {
                $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin`, a.`longitude`, a.`latitude` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE a.`id` != '' AND c.`state` = 1 ORDER BY c.`id`");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    foreach ($ret as $key => $value) {
                        $domainInfo = getDomain('siteConfig', 'city', $value['cid']);
                        $domain = $domainInfo['domain'];
                        $ndomain = "";
                        if ($value['type'] == 0) {
                            $ndomain = $domain;
                        } elseif ($value['type'] == 1) {
                            $ndomain = $domain . "." . str_replace('www.', '', $cfg_basehost);
                        } elseif ($value['type'] == 2) {
                            $ndomain = $cfg_basehost . (count($ret) == 1 ? "" : "/" . $domain);
                        }

                        $list[$key]['id'] = isIOSApp() ? $value['id'] : (int)$value['id'];
                        $list[$key]['cityid'] = isIOSApp() ? $value['cid'] : (int)$value['cid'];
                        $list[$key]['domain'] = $domain;
                        $list[$key]['url'] = $cfg_secureAccess . $ndomain;
                        $list[$key]['link'] = $cfg_secureAccess . $ndomain;  //指定获取模块的分站首页链接时，这里用于记录分站大首页的链接，防止电脑端切换城市后地址栏出现两个模块目录的问题
                        $list[$key]['name'] = $value['typename'];
                        $list[$key]['pinyin'] = strtolower($value['pinyin']);
                        $list[$key]['type'] = (int)$value['type'];
                        $list[$key]['default'] = (int)$value['defaultcity'];
                        $list[$key]['hot'] = isIOSApp() ? $value['hot'] : (int)$value['hot'];
                        $list[$key]['lat'] = isIOSApp() ? $value['latitude'] : (float)$value['latitude'];
                        $list[$key]['lng'] = isIOSApp() ? $value['longitude'] : (float)$value['longitude'];
                        $list[$key]['count'] = count($ret);  //分站城市数量
                        if($cfg_sameAddr_group){
                            //计算son的数量
                            //不在这里计算了，分站数量多的话，太影响性能，此功能做在了添加分站时就直接查询并写入site_city表的son字段，如果有添加子站点，需要在分站管理中进行更新（保存全部）
                            // $this->param = array('tab' => 'site_area', 'id' => $value['cid']);
                            // $infos = $this->siteCityById();
                            // $son = 0;
                            // if(!$infos['state']){  // 成功
                            //     foreach ($infos as $ii){
                            //         if($ii['is_site']){
                            //             $son ++;
                            //         }
                            //         $son += $ii['son'];
                            //     }
                            // }
                            $list[$key]['son'] = $value['son'];
                            //必定是站点
                            $list[$key]['is_site'] = 1;
                            //父级信息
                            //不在这里计算了，分站数量多的话，太影响性能，此功能做在了添加分站时就直接查询并写入site_city表的parent字段，如果有添加子站点，需要在分站管理中进行更新（保存全部）
                            // $this->param = array('tab' => 'site_area', 'id' => $value['cid']);
                            // $parent = $this->getPublicParentInfo();
                            $list[$key]['parent'] = $value['parent'] ? unserialize($value['parent']) : array();
                        }
                    }

                    if ($list && !isIOSApp()) {

                        //写入缓存
                        $HN_memory->set('site_city', $list);

                        //文件缓存
                        $siteCityData = new stdClass();
                        $siteCityData->expire_time = time();
                        $siteCityData->data = $list;
                        $fp = @fopen(HUONIAOROOT . "/data/cache/system_site_city.json", "w");
                        @fwrite($fp, json_encode($siteCityData));
                        @fclose($fp);
                    }
                }
            } else {
                $list = $data['data'];
            }
        }

        //自定义模块
        if($module && $module != 'siteConfig'){

            $filePath = HUONIAOINC."/config/".$module.".inc.php";
            if(file_exists($filePath)){
                require($filePath);

                foreach ($list as $key => $val) {
                    $customChannelDomain = getDomainFullUrl($module, $customSubDomain, $val);
                    $list[$key]['url'] = $customChannelDomain;
                }
            }
        }

        return $list;
    }


    //获取系统默认城市信息
    public function getSiteCityInfo(){
        return checkDefaultCity();
    }


    /**
     * 根据定位的城市验证城市是否开通
     */
    public function verifyCity(){
        global $dsql;
        global $cfg_auto_location;

        $province = $this->param['region'];    //省
        $city     = $this->param['city'];      //市
        $district = $this->param['district'];  //区
        $town     = $this->param['town'];  //乡镇
        $module   = $this->param['module'];    //所在模块

        $cfg_auto_location = (int)$cfg_auto_location;  //自动定位功能开关
        $platform_name = $this->param['platform_name'];
        if($cfg_auto_location && $platform_name){
            return array("state" => 200, "info" => '系统未开启自动定位功能！');
        }

        if(empty($province) && empty($city)){
            return array("state" => 200, "info" => '数据不得为空！');
        }

        $data = array();
        $cityArr = array_sort($this->siteCity(), 'cityid');
        if($cityArr){
            foreach ($cityArr as $key => $value) {
                $_name = str_replace('测试专用', '', $value['name']);
                if(strpos($province, $_name) !== false || strpos($city, $_name) !== false || strpos($district, $_name) !== false || strpos($town, $_name) !== false){
                    $data = array("name" => $value['name'], "cityid" => $value['cityid'], "pinyin" => $value['pinyin'], "url" => $value['url'], "domain" => $value['domain'], "type" => $value['type'], "default" => $value['default'], "count" => $value['count'], "lng" => $value['lng'], "lat" => $value['lat']);

                    //自定义模块
                 if($module && $module != 'siteConfig'){
                     require(HUONIAOINC."/config/".$module.".inc.php");
                     $customChannelDomain = getDomainFullUrl($module, $customSubDomain, $value);
                     $data['url'] = $customChannelDomain;
                 }

                }
            }

            if($data){
                global $cfg_sameAddr_group;
                if($cfg_sameAddr_group){
                    //start 获取当前分站下的子分站数量
                    $cityid = $data['cityid'];
                    //取得所有分站
                    $sql = $dsql->SetQuery("select c.*,a.`id` 'aid',a.`typename`, a.`pinyin`,a.`parentid`,a.`longitude` 'lng',a.`latitude` 'lat' from `#@__site_city` c LEFT JOIN `#@__site_area` a ON c.`cid`=a.`id` where c.`state`=1");
                    $cityList = $dsql->getArrList($sql);
                    if(is_string($cityList)){
                        return array("info"=>200,"state"=>$cityList);
                    }
                    $son = 0;
                    foreach ($cityList as $k=>$value){
                        $lv = $value['aid'];  // aid
                        $parent = $value['parentid'];  // aid 的 parentid
                        //遍历出所有父元素
                        while ($parent!=0 && $parent!=$cityid){
                            $sql = $dsql->SetQuery("select * from `#@__site_area` where `id`=$parent");
                            $parentInfo = $dsql->getArr($sql);
                            //数据不存在，表损坏或数据不正常
                            if(!is_array($parentInfo)){
                                $parent = 0;
                                $lv = 0;
                            }
                            //迭代
                            else{
                                $parent = $parentInfo['parentid'];
                                $lv = $parentInfo['id'];
                            }
                        }
                        //如果匹配到了数据，统计数量
                        if($parent){
                            $son++;
                        }
                    }
                    $data['son'] = $son;
                
                    //父级信息
                    $this->param = array('tab' => 'site_area', 'id' => $cityid);
                    $parent = $this->getPublicParentInfo();
                    $data['parent'] = $parent;

                    //end
                }
                return $data;
            }else{
                return array("state" => 200, "info" => $city . ' ' . $district . '未开通分站');
            }

        }else{
            return array("state" => 200, "info" => '未开通分站');
        }

    }


    /**
     * 根据城市ID获取城市详情
     */
    public function cityInfoById(){
        global $dsql;
        $cityid = $this->param['cityid'];

        if(empty($cityid)){
            return array("state" => 200, "info" => '数据不得为空！');
        }

        $data = array();
        $cityArr = array_sort($this->siteCity(), 'cityid');
        if($cityArr){
            foreach ($cityArr as $key => $value) {
                if($value['cityid'] == $cityid){
                    $data = array("name" => $value['name'], "cityid" => $value['cityid'], "pinyin" => $value['pinyin'], "url" => $value['url'], "domain" => $value['domain'], "type" => $value['type'], "default" => $value['default'], "count" => $value['count'], "lng" => $value['lng'], "lat" => $value['lat']);
                }
            }

            if($data){
                return $data;
            }else{
                return array("state" => 200, "info" => '该城市ID['.$cityid.']未开通分站');
            }

        }else{
            return array("state" => 200, "info" => '未开通分站');
        }

    }


    /**
     * 根据定位的城市获取城市信息
     * 传入省市区：江苏省 苏州市 吴中区，返回数据库中的城市信息：array(ids => 166, 2066, names => 苏州, 吴中);
     */
    public function verifyCityInfo(){
        global $dsql;
        $province = $this->param['region'];    //省
        $city     = $this->param['city'];      //市
        $district = $this->param['district'];  //区
        $town = $this->param['town'];  //乡镇

        if(empty($province) && empty($city) && empty($district)){
            return array("state" => 200, "info" => '数据不得为空！');
        }

        $cid = $scid = 0;  //定位城市ID，下探到的最后一级区域ID
        $nameArr = array();
        $cityArr = $this->siteCity();
        if($cityArr){

            // 定义排序函数
            usort($cityArr, function($a, $b) {
                return $a['cityid'] - $b['cityid'];
            });

            foreach ($cityArr as $key => $value) {
                if(strpos($province, $value['name']) !== false){
                    $cid = $value['cityid'];
                    array_push($nameArr, $city);
                }
                if(strpos($city, $value['name']) !== false){
                    $cid = $value['cityid'];
                    array_push($nameArr, $district);
                }
                if(strpos($district, $value['name']) !== false){
                    $cid = $value['cityid'];
                    array_push($nameArr, $town);
                }
                if(strpos($town, $value['name']) !== false){
                    $cid = $value['cityid'];
                }
            }

            //默认赋值，区域ID等于城市ID
            $scid = $cid;

            //如果需要继续往下
            if($nameArr) {
                //获取分站城市下的区域
                $cityInfoArr = $dsql->getTypeList($cid, "site_area");

                foreach ($nameArr as $key => $val) {
                    foreach ($cityInfoArr as $k => $v) {
                        if(strpos($val, $v['typename']) !== false){
                            $scid = $v['id'];
                        }
                        //下级
                        if($v['lower']){
                            foreach ($v['lower'] as $k_ => $v_) {
                                if(strpos($val, $v_['typename']) !== false){
                                    $scid = $v_['id'];
                                }
                            }
                        }
                    }

                }
            }

            //取区域ID所有父级
            global $data;
            $data = "";
            $addrArr = getParentArr("site_area", $scid);
            $addrIds = array_reverse(parent_foreach($addrArr, "id"));

            global $data;
            $data = "";
            $addrNames = array_reverse(parent_foreach($addrArr, "typename"));

            $idIndex = array_search($cid, $addrIds);
            $newIdsArr = array_slice($addrIds, $idIndex);
            $newNamesArr = array_slice($addrNames, $idIndex);

            if($cid){
                return array('ids' => $newIdsArr, 'names' => $newNamesArr);
            }else{
                return array("state" => 200, "info" => $city . $district . '未开通分站');
            }

        }else{
            return array("state" => 200, "info" => '未开通分站');
        }

    }




    /**
     * 根据城市简拼验证城市是否开通
     */
    public function verifyCityDomain(){
        global $dsql;
        $domain = $this->param;
        $domain = is_array($domain) ? $domain['domain'] : $domain;
        if(empty($domain)){
            return array("state" => 200, "info" => '数据不得为空！');
        }

        $data = array();
        $cityArr = $this->siteCity();
        if($cityArr){
            foreach ($cityArr as $key => $value) {
                if($value['domain'] == $domain){
                    $data = array("cityid" => $value['cityid'], "name" => $value['name'], "pinyin" => $value['pinyin'], "url" => $value['url'], "domain" => $value['domain'], "type" => $value['type'], "default" => $value['default'], "count" => $value['count'], "lng" => $value['lng'], "lat" => $value['lat']);
                }
            }

            if($data){
                return $data;
            }else{
                return array("state" => 200, "info" => '验证失败！');
            }

        }else{
            return array("state" => 201, "info" => '系统暂未开通分站功能！');
        }



        //验证省份
    }
    

    //根据当前IP获取分站
    public function cityInfoByIp(){

        //当前城市
        $cityData = getIpAddr(getIP(), 'json');
        if(is_array($cityData)){

            $this->param = array(
                'province' => $cityData['region'],
                'city' => $cityData['city']
            );
            $cityInfo = $this->verifyCity();
            return $cityInfo;

            //IP获取失败
        }else{

            return array("state" => 200, "info" => '获取失败！');

        }
    }


    /**
     * 安全配置参数
     * @return array
     */
    public function safe(){

        global $cfg_regstatus;        //会员注册开关
        global $cfg_regclosemessage;  //会员注册关闭原因
        global $cfg_replacestr;       //敏感词过滤
        global $cfg_seccodestatus;    //启用验证码的功能
        global $cfg_secqaastatus;     //启用验证问题的功能
        $params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

        $return = array();
        if(!empty($params)){

            foreach($params as $key => $param){
                if($param == "regstatus"){
                    $return['regstatus'] = $cfg_regstatus;
                }elseif($param == "regclosemessage"){
                    $return['regclosemessage'] = $cfg_regclosemessage;
                }elseif($param == "replacestr"){
                    $return['replacestr'] = $cfg_replacestr;
                }elseif($param == "seccodestatus"){
                    $return['seccodestatus'] = $cfg_seccodestatus;
                }elseif($param == "secqaastatus"){
                    $return['secqaastatus'] = $cfg_secqaastatus;
                }elseif($param == "safeqa"){
                    $return['safeqa'] = $this->safeqa();
                }
            }

        }else{
            $return['regstatus'] = $cfg_regstatus;
            $return['regclosemessage'] = $cfg_regclosemessage;
            $return['replacestr'] = $cfg_replacestr;
            $return['seccodestatus'] = $cfg_seccodestatus;
            $return['secqaastatus'] = $cfg_secqaastatus;
            $return['safeqa'] = $this->safeqa();
        }

        return $return;

    }


    /**
     * 验证问题数据
     * @return array
     */
    public function safeqa(){
        global $dsql;
        $archives = $dsql->SetQuery("SELECT `id`, `question`, `answer` FROM `#@__safeqa`");
        $results = $dsql->dsqlOper($archives, "results");
        return $results;
    }


    /**
     * 支付方式
     * @return array
     */
    public function payment(){
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $isWxMiniprogram = isWxMiniprogram();
        $isBaiDuMiniprogram = isBaiDuMiniprogram();
        $isQqMiniprogram = isQqMiniprogram();
        $isByteMiniprogram = isByteMiniprogram();
        $list = array();

        $type = $this->param['type'];  //交易类型，用于APP端判断支付方式，像余额充值、积分充值类的操作，不需要输出余额、消费金支付方式

        $uinfo = array();
        $uid = $userLogin->getMemberID();
        if($uid != -1 && $type != 'deposit' && $type != 'recharge'){
            $uinfo = $userLogin->getMemberInfo();

            if($_GET['app'] == 1){
                $usermoney = $uinfo['money'];
                array_push($list, array(
                    'id' => 0,
                    'pay_code' => 'balance',
                    'pay_name' => '余额',
                    'pay_desc' => '系统账户余额',
                    'balance' => $usermoney,
                    'paypwd' => $uinfo['paypwdCheck'],
                    'pay_icon' => $cfg_secureAccess . $cfg_basehost . '/templates/member/touch/images/pay/balance.png'
                ));
            }
        }

        $archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            foreach ($results as $key => $val){

                $icon = '/api/payment/'.$val['pay_code'].'/images/'.$val['pay_code'].'.png';
                if(!file_exists(HUONIAOROOT . $icon)){
                    $icon = '/api/payment/'.$val['pay_code'].'/'.$val['pay_code'].'.png';
                }
                $val['pay_icon'] = $cfg_secureAccess . $cfg_basehost . $icon;

                // if($val['pay_code'] == 'wxpay'){
                //     $val['pay_icon'] = $cfg_secureAccess . $cfg_basehost . '/templates/member/touch/images/pay/wxpay.png';
                // }

                // if($val['pay_code'] == 'alipay'){
                //     $val['pay_icon'] = $cfg_secureAccess . $cfg_basehost . '/templates/member/touch/images/pay/alipay.png';
                // }

                if($val['pay_code'] == 'huoniao_bonus' && $type != 'deposit' && $type != 'recharge'){
                    $val['pay_icon'] = $cfg_secureAccess . $cfg_basehost . '/templates/member/touch/images/pay/bonus_pay.png';
                }

                if($isBaiDuMiniprogram && $val['pay_code'] == 'baidumini'){
                    array_push($list, $val);
                }elseif($isQqMiniprogram && $val['pay_code'] == 'qqmini'){
                    array_push($list, $val);
                }elseif($isByteMiniprogram && $val['pay_code'] == 'bytemini'){
                    array_push($list, $val);
                }elseif($isWxMiniprogram && ($val['pay_code'] == 'wxpay' || $val['pay_code'] == 'rfbp_icbc' || $val['pay_code'] == 'yabandpay_wxpay'|| $val['pay_code'] == 'fomopay_wxpay' || $val['pay_code'] == 'fomopay_paynow')){
                    array_push($list, $val);
                }elseif ($val['pay_code'] == 'huoniao_bonus' ){

                    //消费金，输出余额和可用余额
                    $balance = 0;
                    $available = 0;

                    if($uinfo){
                        $balance = $uinfo['bonus'];
                        $available = $uinfo['surplusbonus'];
                        $val['balance'] = $balance;
                        $val['available'] = $available;

                        array_push($list, $val);
                    }
                }elseif(
                    !$isWxMiniprogram && !$isBaiDuMiniprogram && !$isQqMiniprogram && !$isByteMiniprogram && $val['pay_code'] != 'baidumini' && $val['pay_code'] != 'qqmini' && $val['pay_code'] != 'bytemini' &&
                    ((isApp() && $val['pay_code'] != 'fomopay_wxpay' && $val['pay_code'] != 'fomopay_paynow' && $val['pay_code'] != 'xorpay_wxpay') || !isApp()) &&
                    ((isMobile() && $val['pay_code'] != 'fomopay_wxpay' ) || !isMobile()) && 
                    ((!isWeixin() && $val['pay_code'] != 'xorpay_wxpay' ) || (isWeixin() && $val['pay_code'] != 'xorpay_alipay') || isPc())
                ){
                    array_push($list, $val);
                }
            }
        }
        return $list;
    }


    /**
     * 网站地区
     * @return array
     */
    public function addr(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $type     = (int)$this->param['type'];
                $addtype  = (int)$this->param['addtype'];
                $hideSameCity = (int)$this->param['hideSameCity'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        //可操作的城市，多个以,分隔
        $userLogin = new userLogin($dbo);
        $adminCityIds = $userLogin->getAdminCityIds();
        $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

        //一级
        if(empty($type)){
            $cityArr = array();
            $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
            $result = $dsql->dsqlOper($sql, "results");
            if($result){
                foreach ($result as $key => $value) {

                    $lowerCount = array();
                    $sql   = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $lowerCount = $ret[0]['totalCount'];
                    }

                    array_push($cityArr, array(
                        "id" => $value['cid'],
                        "typename" => $value['typename'],
                        "pinyin" => $value['pinyin'],
                        "hot" => $value['hot'],
                        "lower" => $lowerCount
                    ));
                }
            }
            return $cityArr;

        }else{
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', $hideSameCity);
            if($addtype ==1){
                foreach ($results as $key => &$value) {
                    $value['lowerarr'] = $dsql->getTypeList($value['id'], "site_area", $son, $page, $pageSize, '', '', $hideSameCity);
                }

            }
            if($results){
                return $results;
            }
        }
    }


    /**
     * 网站地区
     * @return array
     */
    public function area(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = !$this->param['son'] ? false : $this->param['son'];
            }
        }
        $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize);
        if($results){
            return $results;
        }
    }


    /**
     * 地铁线路
     * @return array
     */
    public function subway(){
        global $dsql;
        $city = "";
        $subwayListArr = array();

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $city = (int)$this->param['city'];
                $addrids = $this->param['addrids'];
            }
        }

        if(empty($addrids)){
            $addrids = $city;
        }
        // if(empty($city)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        if(empty($addrids)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        // 地址集合
        $addrArr = explode(",", $addrids);
        rsort($addrArr);
        foreach ($addrArr as $key => $value) {
            $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway` WHERE `cid` = ".$value." ORDER BY `weight`");

            //获取缓存数据
            $_sql = $sql;
            $cacheData = getCacheData($_sql, 'subway');
            if($cacheData){
                return $cacheData['data'];
            }

            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $key => $value) {
                    $subwayListArr[$key]['id'] = $value['id'];
                    $subwayListArr[$key]['title'] = $value['title'];

                    $sql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_subway_station` WHERE `sid` = ".$value['id']." ORDER BY `weight`");
                    $res = $dsql->dsqlOper($sql, "results");
                    $subwayListArr[$key]['lower'] = $res;
                }
                break;
            }
        }

        //数据写入缓存
        setCacheData($_sql, $subwayListArr, 'subway');
        
        return $subwayListArr;
        // $sql = $dsql->SetQuery("SELECT * FROM `#@__site_subway` WHERE `cid` = $city ORDER BY `weight`");
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //  return $ret;
        // }
    }


    /**
     * 地铁站点
     * @return array
     */
    public function subwayStation(){
        global $dsql;
        $type = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $type = (int)$this->param['type'];
            }
        }

        if(empty($type)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_subway_station` WHERE `sid` = $type ORDER BY `weight`");

        //获取缓存数据
        $_sql = $sql;
        $cacheData = getCacheData($_sql, 'subway');
        if($cacheData){
            return $cacheData['data'];
        }

        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            //数据写入缓存
            setCacheData($_sql, $subwayListArr, 'subway');
            
            return $ret;
        }
    }


    /**
     * 已安装模块信息
     * @return array
     */
    public function module(){
        // global $dsql;

        // $archives = $dsql->SetQuery("SELECT `id`, `icon`, `subject` as title, `subject`, `name`  FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0 ORDER BY `weight`, `id`");
        // $results  = $dsql->dsqlOper($archives, "results");
        // if($results){
        //     return $results;
        // }
        
        $list = array();
        $data = $this->siteModule();
        if($data){
            foreach($data as $key => $val){
                array_push($list, array(
                    'id' => (int)$val['id'],
                    'name' => $val['code'],
                    'subject' => $val['name'],
                    'title' => $val['name'],
                    'icon' => $val['icon']
                ));
            }
        }
        return $list;
    }


    /**
     * 热门关键词
     */
    public function hotkeywords(){
        $module = $this->param['module'];

        $where = "";
        $cityid = getCityId($this->param['cityid']);
        if($cityid){
            $where .= " AND `cityid` = ".$cityid;
        }
        $list = array();
        if($module){
            global $dsql;
            $archives = $dsql->SetQuery("SELECT `keyword`, `color`, `href`, `blod`, `module`, `target`  FROM `#@__site_hotkeywords` WHERE `state` = 0 AND `module` = '$module' $where ORDER BY `weight` DESC, `id` DESC");
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                switch ($module){
                    case 'article':
                    case 'image':
                        $template='search';
                        break;
                    case 'vote':
                    case 'tieba':
                        $template='index';
                        break;
                    case 'house':
                        $template='sale';
                        break;
                    case 'renovation':
                        $template='albums';
                        break;
                    case 'shop':
                        $template='shop';
                        break;
                    case 'job':
                        $template='zhaopin';
                        break;
                    case 'website':
                        $template='templates';
                        break;
                    default:
                        $template='list';
                        break;
                }
                switch ($module){
                    case 'tuan':
                    case 'renovation':
                        $param='search_keyword=%key%';
                        break;
                    case 'job':
                        $param='title=%key%';
                        break;
                    default:
                        $param='keywords=%key%';
                        break;
                }
                $param = array(
                    "service"  => $module,
                    "template" => $template,
                    "param"    => $param
                );
                $urlParam = getUrlPath($param);

                foreach ($results as $key => $value) {
                    $keyword = $value['keyword'];
                    $list[$key]['oldkeyword'] = $keyword;
                    $list[$key]['color'] = $value['color'];
                    $list[$key]['blod'] = $value['blod'];
                    if(!empty($value['color'])){
                        $keyword = '<font color="'.$value['color'].'">'.$keyword.'</font>';
                    }
                    if($value['blod'] == 1){
                        $keyword = '<strong>'.$keyword.'</strong>';
                    }
                    $list[$key]['keyword'] = $keyword;

                    $url = $value['href'];
                    if(empty($url)){
                        $url = str_replace("%key%", $value['keyword'], $urlParam);
                    }
                    $list[$key]['href'] = $url;
                    $list[$key]['target'] = (int)$value['target'];
                    $list[$key]['module'] = $value['module'];
                    $list[$key]['rec'] = (int)$value['blod'];
                }
            }
        }
        return $list;
    }


    /**
     * 单页文档
     * @return array
     */
    public function singel(){
        global $dsql;
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 999 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_singellist` WHERE `type` = 'singel' ORDER BY `id` ASC".$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            return $results;
        }
    }


    /**
     * 单页文档内容
     * @return array
     */
    public function singelDetail(){
        global $dsql;
        $singeDetail = array();

        if(empty($this->param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }

        if(!is_numeric($this->param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $archives = $dsql->SetQuery("SELECT `title`, `body`, `pubdate` FROM `#@__site_singellist` WHERE `type` = 'singel' AND `id` = ".$this->param);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $singeDetail["title"]   = $results[0]['title'];
            $singeDetail["body"]    = $results[0]['body'];
            $singeDetail["pubdate"] = $results[0]['pubdate'];
        }
        return $singeDetail;
    }


    /**
     * 网站公告
     * @return array
     */
    public function notice(){
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $cityid = getCityId($this->param['cityid']);
        if($cityid){
            $where .= " AND `cityid` = ".$cityid;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `color`, `redirecturl`, `pubdate`, `body` FROM `#@__site_noticelist` WHERE `arcrank` = 0 $where ORDER BY `weight` DESC, `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]); //暂无数据

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $list = array();
        $results = $dsql->dsqlOper($archives.$where, "results");
        if($results && is_array($results)){
            foreach ($results as $key => $value) {
                $list[$key]['id'] = $value['id'];
                $list[$key]['title'] = $value['title'];
                $list[$key]['color'] = $value['color'];
                $list[$key]['pubdate'] = $value['pubdate'];
                $list[$key]['description'] = cn_substrR(strip_tags($value['body']), 100);

                $url = "";
                if($value['redirecturl']){
                    $url = $value['redirecturl'];
                }else{
                    $param = array(
                        "service"     => "siteConfig",
                        "template"    => "notice-detail",
                        "typeid"      => $value['id']
                    );
                    $url = getUrlPath($param);
                }
                $list[$key]['url'] = $url;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 公告内容
     * @return array
     */
    public function noticeDetail(){
        global $dsql;
        $noticeDetail = array();

        if(empty($this->param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }

		$id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $archives = $dsql->SetQuery("SELECT `title`, `color`, `redirecturl`, `body`, `pubdate` FROM `#@__site_noticelist` WHERE `arcrank` = 0 AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $noticeDetail["title"]       = $results[0]['title'];
            $noticeDetail["color"]       = $results[0]['color'];
            $noticeDetail["redirecturl"] = $results[0]['redirecturl'];
            $noticeDetail["body"]        = $results[0]['body'];
            $noticeDetail["pubdate"]     = $results[0]['pubdate'];
        }
        return $noticeDetail;
    }


    /**
     * 帮助信息
     * @return array
     */
    public function helps(){
        global $dsql;
        $pageinfo = $list = array();
        $type = $typeid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $type     = $this->param['type'];
                $typeid   = (int)$this->param['typeid'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //指定分类名
        if($type){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_helpstype` WHERE `typename` = '$type' LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $typeid = $ret[0]['id'];
            }else{
                $typeid = -1;
            }
        }

        //遍历分类
        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "site_helpstype")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "site_helpstype"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `pubdate` FROM `#@__site_helpslist` WHERE `arcrank` = 0".$where." ORDER BY `weight` DESC, `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => self::$langData['siteConfig'][21][64]); //暂无数据

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $list = array();
        $results = $dsql->dsqlOper($archives.$where, "results");
        if($results){
            foreach ($results as $key => $value) {
                $list[$key]['id'] = $value['id'];
                $list[$key]['title'] = $value['title'];
                $list[$key]['pubdate'] = $value['pubdate'];

                $param = array(
                    "service"     => "siteConfig",
                    "template"    => "help-detail",
                    "id"          => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 帮助信息详细
     * @return array
     */
    public function helpsDetail(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $helpsDetail = array();

        if(empty($this->param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }

        if(is_numeric($this->param)) {
            $archives = $dsql->SetQuery("SELECT `title`, `typeid`, `body`, `pubdate` FROM `#@__site_helpslist` WHERE `arcrank` = 0 AND `id` = ".$this->param);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $helpsDetail["title"]       = $results[0]['title'];
                $helpsDetail["typeid"]      = $results[0]['typeid'];
                $helpsDetail["body"]        = $results[0]['body'];
                $helpsDetail["pubdate"]     = $results[0]['pubdate'];
            }
        }else{
            $id = $this->param['id'];
            $archives = $dsql->SetQuery("SELECT `title`, `typeid`, `body`, `pubdate` FROM `#@__site_helpslist` WHERE `arcrank` = 0 AND `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $helpsDetail["title"]       = $results[0]['title'];
                $helpsDetail["typeid"]      = $results[0]['typeid'];

                $body = $results[0]['body'];
                $body = str_replace('/include/attachment.php?f=', $cfg_secureAccess . $cfg_basehost . '/include/attachment.php?f=', $body);

                $helpsDetail["body"]        = $body;
                $helpsDetail["pubdate"]     = $results[0]['pubdate'];
            }
        }


        return $helpsDetail;
    }


    /**
     * 帮助信息分类
     * @return array
     */
    public function helpsType(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "site_helpstype", $son, $page, $pageSize);
        if($results){
            return $results;
        }
    }


    /**
     * 单页文档 - 协议
     * @return array
     */
    public function agreeList(){
        global $dsql;
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
            }else{
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 999 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__site_singellist` WHERE `type` = 'agree' ORDER BY `id` ASC".$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            return $results;
        }
    }


    /**
     * 网站协议
     * @return array
     */
    public function agree(){
        global $dsql;

        if(empty($this->param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }

        if(!is_numeric($this->param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $archives = $dsql->SetQuery("SELECT `title`, `body` FROM `#@__site_singellist` WHERE `type` = 'agree' AND `id` = ".$this->param);
        $results  = $dsql->dsqlOper($archives, "results");
        return $results;
    }


    /**
     * 网站广告
     * @return array
     */
    public function adv(){
        global $dsql;
        global $cityid;
        global $userLogin;

        global $cfg_secureAccess;
        global $cfg_basehost;

        global $cfg_advMarkState;  //广告标识状态  0关闭  1开启
        global $cfg_advMarkPostion;  //标识位置  0左上  1右上  2左下  3右下

        $cfg_advMarkState = (int)$cfg_advMarkState;
        $cfg_advMarkPostion = (int)$cfg_advMarkPostion;

        $currentCityId = getCityId(is_array($this->param) ? $this->param['cityid'] : 0);
        $cityid = $cityid ? $cityid : $currentCityId;  //当前城市ID
        $cityid = (int)$cityid;

        $param = $this->param;

        //普通模式
        if(is_numeric($param)){
            $id = $param;

            //分站广告
        }else{
            $model = $param['model'];
            $title = htmlspecialchars($param['title']);

            if($model != "" && $title != ""){

                //团购，已作废
                if($model == 'tuan_'){
                    $tuanService = new tuan();
                    $domainInfo = $tuanService->getCity();
                    if(empty($domainInfo)) return array("state" => 200, "info" => '城市不存在！');

                    $cityid = $domainInfo['cid'];

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__advlist` WHERE `cityid` = $cityid AND `title` = '$title'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!$ret) return array("state" => 200, "info" => '广告不存在！');
                    $id = $ret[0]['id'];

                    //其他情况
                }else{
                    if($param['id'] == "stream"){
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__advlist` WHERE `title` = '$title' AND `state` = 1 AND (`class` = 1 || `class` = 2) ORDER BY rand() LIMIT 1");
                    }else{
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__advlist` WHERE `title` = '$title' ORDER BY `id` DESC LIMIT 1");
                    }
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret && is_array($ret)){
                        $id = $ret[0]['id'];
                    }else{
                        if($param['id'] == "stream"){
                            return "";
                        }
                        $uid = $userLogin->getUserID();
                        if($uid == -1 || !testPurview("huoniaoOfficial")){
                            return array("state" => 200, "info" => '广告不存在！');
                        }else{
                            $rand = create_check_code();
                            $adlist = array();
                            $adlist['class'] = 1;
                            $adlist['type'] = 'code';
                            $adlist['body'] = '<div class="advPlaceholder" id="adP_'.$rand.'"><div class="apCon"><span class="ad_tit">广告位：</span><a class="ad_stu" href="https://help.kumanyun.com/help-5-607.html" target="_blank">官方教程</a><div class="ad_title"><h5 title="这是广告位名称">'.$title.'</h5><h6></h6></div><div class="ad_tips" title="操作提示：复制广告位名称，后台添加此名称的广告即可！">操作提示：复制广告位名称，后台添加此名称的广告即可！</div></div></div><script>calculatedAdvSize("adP_'.$rand.'")</script>';
                            return $adlist;
                        }
                    }
                }

                //其他类型
            }else{
                $id = $param['id'];
            }
        }


        if(empty($id)){
            return array("state" => 200, "info" => '广告ID不得为空！');
        }

        if(!is_numeric($id)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $adlist = array();

        //先查询广告位默认数据
        $archives = $dsql->SetQuery("SELECT `class`, `title`, `starttime`, `endtime`, `body`, `state` FROM `#@__advlist` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $cla   = $results[0]['class'];
            $title = $results[0]['title'];
            $start = $results[0]['starttime'];
            $end   = $results[0]['endtime'];
            $body  = $results[0]['body'];
            $state = $results[0]['state'];
            $date  = GetMkTime(time());

            if($state != 1) return array("state" => 200, "info" => '广告已隐藏！');
            if($date < $start && !empty($start)) return array("state" => 200, "info" => '广告还未开始！');
            if($date > $end && !empty($end)) return array("state" => 200, "info" => '广告已结束！');

            $adlist['id'] = (int)$id;
            $adlist['class'] = (int)$cla;
            $adlist['advTitle'] = $title;
            $body = explode("$$", $body);

            //普通广告
            if($cla == 1){
                $adlist['type'] = $body[0];

                //代码
                if($body[0] == "code"){
                    $adlist['body'] = $body[1];
                    $adlist['mark'] = (int)$body[2];

                    //文字
                }elseif($body[0] == "text"){
                    $adlist['title'] = $body[1];
                    $adlist['color'] = $body[2];

					$link = $body[3];
					if(isApp() && strstr($body[3], 'miniProgramLive_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $body[3]);
                    }elseif(isApp() && strstr($body[3], 'wxMiniprogram://')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$body[3];
					}elseif(!isWxMiniprogram() && strstr($body[3], 'openxcx_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
					}

                    $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                    $adlist['link']  = $link;
                    $adlist['size']  = (int)$body[4];
                    $adlist['mark']  = (int)$body[5];

                    //图片
                }elseif($body[0] == "pic"){
                    $adlist['src']    = getRealFilePath($body[1]);
                    $adlist['turl']   = getRealFilePath($body[1]);

					$link = $body[2];
					if(isApp() && strstr($body[2], 'miniProgramLive_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $body[2]);
                    }elseif(isApp() && strstr($body[2], 'wxMiniprogram://')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$body[2];
					}elseif(!isWxMiniprogram() && strstr($body[2], 'openxcx_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
					}

                    $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                    $adlist['href']   = $link;
                    $adlist['link']   = $link;
                    $adlist['title']  = $body[3];
                    $adlist['width']  = (int)$body[4];
                    $adlist['height'] = (int)$body[5];
                    $adlist['mark']   = (int)$body[6];

                    $adlist['advMarkState'] = $cfg_advMarkState;
                    $adlist['advMarkPostion'] = $cfg_advMarkPostion;
                    $adlist['markState'] = (int)$body[6];

                    if(is_array($param) && $param['id'] == "stream"){
                        $adlist['advTitle'] = $body[3];
                    }

                    //flash
                }elseif($body[0] == "flash"){
                    $adlist['src']    = $body[1];
                    $adlist['width']  = (int)$body[2];
                    $adlist['height'] = (int)$body[3];
                    $adlist['mark']   = (int)$body[4];

                }

                //多图广告
            }elseif($cla == 2){
                $adlist['width']  = (int)$body[0];
                $adlist['height'] = (int)$body[1];
                $list = explode("||", $body[2]);
                foreach ($list as $key => $value) {
                    $bod = explode("##", $value);
                    $adlist['list'][$key]['src']   = isWxMiniprogram() ? getRealFilePath($bod[0]) : getRealFilePath($bod[0]);
                    $adlist['list'][$key]['turl']  = getRealFilePath($bod[0]);
                    $adlist['list'][$key]['title'] = $bod[1];

					$link = $bod[2];
					if(isApp() && strstr($bod[2], 'miniProgramLive_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $bod[2]);
                    }elseif(isApp() && strstr($bod[2], 'wxMiniprogram://')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$bod[2];
					}elseif(!isWxMiniprogram() && strstr($bod[2], 'openxcx_')){
						$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
					}

                    $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                    //苹果端APP，增加全屏关键字
                    if(isIOSApp() && strstr($title, '招聘求职')){
                        $link .= (strstr($link, '?') ? '&' : '?') . 'appFullScreen';
                    }

                    $adlist['list'][$key]['link']  = $link;
                    $adlist['list'][$key]['url']  = $adlist['list'][$key]['link'];
                    $adlist['list'][$key]['desc']  = $bod[3];
                    $adlist['list'][$key]['mark']  = (int)$bod[4];

                    $adlist['list'][$key]['advMarkState'] = $cfg_advMarkState;
                    $adlist['list'][$key]['advMarkPostion'] = $cfg_advMarkPostion;
                    $adlist['list'][$key]['markState'] = (int)$bod[4];

                    if(is_array($param) && $param['id'] == "stream" && $key == 0){
                        $adlist['advTitle'] = $bod[1];
                    }
                }

                //伸缩广告
            }elseif($cla == 3){
                $adlist['time']  = (int)$body[0];
                $adlist['width']  = (int)$body[1];
                $adlist['link']  = $body[2];
                $adlist['large'] = $body[3];
                $adlist['largeHeight'] = (int)$body[4];
                $adlist['small'] = $body[5];
                $adlist['smallHeight'] = (int)$body[6];
                $adlist['mark'] = (int)$body[7];

                //对联广告
            }elseif($cla == 4){
                $adlist['width']  = (int)$body[0];
                $adlist['adwidth']  = (int)$body[1];
                $adlist['adheight']  = (int)$body[2];
                $adlist['topheight']  = (int)$body[3];
                $left  = explode("##", $body[4]);
                $adlist['left']['src']   = $left[0];
                $adlist['left']['link']  = $left[1];
                $adlist['left']['title'] = $left[2];
                $adlist['left']['mark'] = (int)$left[3];
                $right = explode("##", $body[5]);
                $adlist['right']['src']   = $right[0];
                $adlist['right']['link']  = $right[1];
                $adlist['right']['title'] = $right[2];
                $adlist['right']['mark'] = (int)$right[3];

                //节日广告
            }elseif($cla == 5){
                $adlist['body'] = $body;

                //弹窗公告
            }elseif($cla == 6){
                $body[0] = str_replace('"/include/attachment.php', '"'.$cfg_secureAccess.$cfg_basehost.'/include/attachment.php', $body[0]);
                $adlist['body'] = $body[0];
                $adlist['link'] = $body[1];
            }


            //查询城市广告位数据
            if($cityid){
                $sql = $dsql->SetQuery("SELECT `body` FROM `#@__advlist_city` WHERE `aid` = $id AND `cityid` = $cityid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){

                    $adlist = array();
                    $adlist['id'] = (int)$id;
                    $adlist['class'] = (int)$cla;
                    $adlist['advTitle'] = $title;

                    $body = $ret[0]['body'];
                    $body = explode("$$", $body);

                    //普通广告
                    if($cla == 1){
                        $adlist['type'] = $body[0];

                        //代码
                        if($body[0] == "code"){
                            $adlist['body'] = $body[1];
                            $adlist['mark'] = (int)$body[2];

                            //文字
                        }elseif($body[0] == "text"){
                            $adlist['title'] = $body[1];
                            $adlist['color'] = $body[2];

							$link = $body[3];
							if(isApp() && strstr($body[3], 'miniProgramLive_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $body[3]);
                            }elseif(isApp() && strstr($body[3], 'wxMiniprogram://')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$body[3];
							}elseif(!isWxMiniprogram() && strstr($body[3], 'openxcx_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
							}

                            $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                            $adlist['link']  = $link;
                            $adlist['size']  = (int)$body[4];
                            $adlist['mark']  = (int)$body[5];

                            //图片
                        }elseif($body[0] == "pic"){
                            $adlist['src']    = getRealFilePath($body[1]);
                            $adlist['turl']   = getRealFilePath($body[1]);

							$link = $body[2];
							if(isApp() && strstr($body[2], 'miniProgramLive_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $body[2]);
                            }elseif(isApp() && strstr($body[2], 'wxMiniprogram://')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$body[2];
							}elseif(!isWxMiniprogram() && strstr($body[2], 'openxcx_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
							}

                            $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                            $adlist['href']   = $link;
                            $adlist['title']  = $body[3];
                            $adlist['width']  = (int)$body[4];
                            $adlist['height'] = (int)$body[5];
                            $adlist['mark']   = (int)$body[6];

                            $adlist['advMarkState'] = $cfg_advMarkState;
                            $adlist['advMarkPostion'] = $cfg_advMarkPostion;
                            $adlist['markState'] = (int)$body[6];

                            if(is_array($param) && $param['id'] == "stream"){
                                $adlist['advTitle'] = $body[3];
                            }

                            //flash
                        }elseif($body[0] == "flash"){
                            $adlist['src']    = $body[1];
                            $adlist['width']  = (int)$body[2];
                            $adlist['height'] = (int)$body[3];
                            $adlist['mark']   = (int)$body[4];

                        }

                        //多图广告
                    }elseif($cla == 2){
                        $adlist['width']  = (int)$body[0];
                        $adlist['height'] = (int)$body[1];
                        $list = explode("||", $body[2]);
                        foreach ($list as $key => $value) {
                            $bod = explode("##", $value);
                            $adlist['list'][$key]['src']   = getRealFilePath($bod[0]);
                            $adlist['list'][$key]['turl']  = getRealFilePath($bod[0]);
                            $adlist['list'][$key]['title'] = $bod[1];

							$link = $bod[2];
							if(isApp() && strstr($bod[2], 'miniProgramLive_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getMiniProgramLive&id='.str_replace('miniProgramLive_', '', $bod[2]);
                            }elseif(isApp() && strstr($bod[2], 'wxMiniprogram://')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=openWxMiniProgram&param='.$bod[2];
							}elseif(!isWxMiniprogram() && strstr($bod[2], 'openxcx_')){
								$link = $cfg_secureAccess.$cfg_basehost.'/include/json.php?action=getWxMiniProgram';
							}

                            $link = isApp() && $link[0] == "/" ? $cfg_secureAccess.$cfg_basehost.$link : $link;  //APP端，如果没有带域名，强制带上

                            $adlist['list'][$key]['link']  = $link;
                            $adlist['list'][$key]['url']  = $adlist['list'][$key]['link'];
                            $adlist['list'][$key]['desc']  = $bod[3];
                            $adlist['list'][$key]['mark']  = (int)$bod[4];

                            $adlist['list'][$key]['advMarkState'] = $cfg_advMarkState;
                            $adlist['list'][$key]['advMarkPostion'] = $cfg_advMarkPostion;
                            $adlist['list'][$key]['markState'] = (int)$bod[4];

                            if(is_array($param) && $param['id'] == "stream" && $key == 0){
                                $adlist['advTitle'] = $bod[1];
                            }
                        }

                        //伸缩广告
                    }elseif($cla == 3){
                        $adlist['time']  = (int)$body[0];
                        $adlist['width']  = (int)$body[1];
                        $adlist['link']  = $body[2];
                        $adlist['large'] = $body[3];
                        $adlist['largeHeight'] = (int)$body[4];
                        $adlist['small'] = $body[5];
                        $adlist['smallHeight'] = (int)$body[6];
                        $adlist['mark'] = (int)$body[7];

                        //对联广告
                    }elseif($cla == 4){
                        $adlist['width']  = (int)$body[0];
                        $adlist['adwidth']  = (int)$body[1];
                        $adlist['adheight']  = (int)$body[2];
                        $adlist['topheight']  = (int)$body[3];
                        $left  = explode("##", $body[4]);
                        $adlist['left']['src']   = $left[0];
                        $adlist['left']['link']  = $left[1];
                        $adlist['left']['title'] = $left[2];
                        $adlist['left']['mark'] = (int)$left[3];
                        $right = explode("##", $body[5]);
                        $adlist['right']['src']   = $right[0];
                        $adlist['right']['link']  = $right[1];
                        $adlist['right']['title'] = $right[2];
                        $adlist['right']['mark'] = (int)$right[3];

                        //节日广告
                    }elseif($cla == 5){
                        $adlist['body'] = $body;

                        //弹窗公告
                    }elseif($cla == 6){
                        $body[0] = str_replace('"/include/attachment.php', '"'.$cfg_secureAccess.$cfg_basehost.'/include/attachment.php', $body[0]);
                        $adlist['body'] = $body[0];
                        $adlist['link'] = $body[1];
                    }
                }
            }


        }
        return $adlist;
    }


    /**
     * 友情链接分类
     * @return array
     */
    public function friendLinkType(){
        global $dsql;
        $module = $this->param;
		$module = !is_array($module) ? $module : $module['module'];
        if(empty($module)){
            return array("state" => 200, "info" => '模块名为空！');
        }

        $archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__site_friendlinktype` WHERE `model` = '$module' ORDER BY `weight` DESC, `id` DESC");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            return $results;
        }
    }


    /**
     * 友情链接
     * @return array
     */
    public function friendLink(){
        global $dsql;
        $param = $this->param;
        $list = array();
        $where = "";

        $module = $param['module'];
        $type = $param['type'];

        if(empty($module)){
            return array("state" => 200, "info" => '模块名为空！');
        }

        //切换城市页显示所有城市首页友情链接
        global $template;
        if($template != 'changecity'){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where .= " AND `cityid` = ".$cityid;
            }
        }

        //遍历分类
        if(!empty($type)){
            if($dsql->getTypeList($type, "site_friendlinktype")){
                $lower = arr_foreach($dsql->getTypeList($type, "site_friendlinktype"));
                $lower = $type.",".join(',',$lower);
            }else{
                $lower = $type;
            }
            $where .= " AND `type` in ($lower)";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `sitename`, `sitelink`, `litpic` FROM `#@__site_friendlinklist` WHERE `module` = '$module' AND `arcrank` = 0".$where." ORDER BY `weight` DESC, `id` DESC");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            global $cfg_fileUrl;
            foreach($results as $key => $val){
                $list[$key]['id']       = $val['id'];
                $list[$key]['sitename'] = $val['sitename'];
                $list[$key]['sitelink'] = $val['sitelink'];
                $list[$key]['litpic']   = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
            }
            return $list;
        }
    }


    /**
     * 自动提取关键词、描述
     * @param $type  提取类型 keywords: 关键词  description: 描述
     * @param $body  需要提取的内容
     * @return string
     */
    public function autoget(){
        $param = $this->param;
        $type = $param['type'];
        $title = $param['title'];
        $body = $param['body'];

        if(!empty($type) && !empty($body)){

            $keywords = $description = "";
            $return = AnalyseHtmlBody($body, $description, $keywords, $title);

            if($type == "keywords"){
                return $keywords;
            }else{
                return $description;
            }

        }
    }


    /**
     * 获取天气预报
     *
     */
    public function getWeatherApi(){
        $param = $this->param;

        $weatherInfo = getWeather($param, $smarty);
        return $weatherInfo;
    }


    /**
     * 发送邮件
     * @return array
     */
    public function sendMail(){
        $param = $this->param;

        $email     = $param['email'];
        $mailtitle = $param['mailtitle'];
        $mailbody  = $param['mailbody'];

        if(empty($email) || empty($mailtitle) || empty($mailbody)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][1] ) ;//必填项不得为空！
        }

        //发送邮件
        $sendmail = sendmail($email, $mailtitle, $mailbody);
        if($sendmail != ""){
            return "200";
        }else{
            return self::$langData['siteConfig'][20][298]; //发送成功
        }

    }


    /**
     * 判断输入的验证码是否正确
     * @return array
     */
    public function checkVdimgck(){
        $param = $this->param;
        $code = $param['code'];

        $code = strtolower($code);
        if($code != $_SESSION['huoniao_vdimg_value']){
            return "error";
        }else{
            return "ok";
        }
    }


    /**
     * 发送手机验证码
     * @return array
     */
    public function getPhoneVerify(){
        $param = $this->param;

        global $dsql;
        global $userLogin;
        global $cfg_shortname;
        global $cfg_hotline;
        global $cfg_geetest;
        global $langData;

        //获取用户ID
        $uid = $userLogin->getMemberID();
        $ip  = GetIP();
        $now = GetMkTime(time());
        $has = false;

        if(!is_array($param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }else{
            $type     = $param['type'];
            $code     = $param['code'];         //　第三方登陆类型
            $phone    = $param['phone'];
            $from     = $param['from'];
            $vertype  = $param['vertype'];      /*骑手手机号验证*/
            $areaCode = (int)$param['areaCode'];
        }

        //如果把86重置为空，会影响国外短信的验证，下面已经有了非国际短信平台，会将areaCode重置为空的操作 by gz 20210923 from dibai
        //$areaCode = $areaCode == '86' ? '' : $areaCode;


        //如果是进行身份验证，需要进行登录验证，并获取登录用户的手机号码
        if($type == "auth"){

            //如果开启了极验
            if($cfg_geetest && $param['geetest_challenge']){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);   //图形验证错误，请重试！
                }
            }

            if($vertype != 1){
                if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
                $memberInfo = $userLogin->getMemberInfo();
                $phone    = $memberInfo['phone'];
                $areaCode = $memberInfo['areaCode'];
            }else{
                $did  = GetCookie("courier");
                if($did == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！

                $couriersql = $dsql->SetQuery("SELECT `phone`,`areaCode` FROM `#@__waimai_courier` WHERE `id` =".$did);

                $courierres = $dsql->dsqlOper($couriersql,"results");

                if(!$courierres){
                    return array("state" => 200, "info" => $langData['siteConfig'][33][0]);   //登录超时，请重新登录！
                }

                $phone    = $courierres[0]['phone'];
                $areaCode = $courierres[0]['areaCode'];

            }
        }

        //如果是入驻商家
        if($type == "join"){
            //如果开启了极验
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);   //图形验证错误，请重试！
                }
            }

            // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `phone` = '$phone'");
            // $results  = $dsql->dsqlOper($archives, "totalCount");
            // if($results > 0) return array("state" => 200, "info" => '该手机号码已经入驻过商家！');
        }

        if($type == "sms_login"){
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);   //图形验证错误，请重试！
                }
            }

            //验证是否开启短信自动注册功能，没有开启的话需要进行验证手机号码并做限制
            global $cfg_smsAutoRegister;
            $cfg_smsAutoRegister = (int)$cfg_smsAutoRegister;  //默认为0开启  1时为关闭
            if($cfg_smsAutoRegister){
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phone` = '$phone'");
                $results  = $dsql->dsqlOper($archives, "totalCount");
                if(!$results){
                    return array("state" => 200, "info" => "该手机号码还不是会员，请先注册！");
                }
            }
        }


        // $terminal = isMobile() ? "mobile" : "pc";

        //如果是注册，需要验证邮箱是否被注册
        if($type == "signup"){

            //如果开启了极验
            if($cfg_geetest){

                if($param['geetest_challenge']){
                    $geetest_challenge = $param['geetest_challenge'];
                    $geetest_validate  = $param['geetest_validate'];
                    $geetest_seccode   = $param['geetest_seccode'];
                    $terminal          = $param['terminal'];
                    $terminal = empty($terminal) ? "pc" : $terminal;

                    $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                    if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                        return array("state" => 200, "info" => $langData['siteConfig'][21][22]);    //图形验证错误，请重试！
                    }
                }else{
                    return array("state" => 200, "info" => "参数错误！");
                }
                
            }

            if($code){
                $code_field = ", `".$code."_conn`";
            }else{
                $code_field = "";
            }
            if($vertype !=1){

                $archives = $dsql->SetQuery("SELECT `id`".$code_field." FROM `#@__member` WHERE `phone` = '$phone'");
                $results  = $dsql->dsqlOper($archives, "totalCount");
                // if($results > 0) return array("state" => 200, "info" => $langData['siteConfig'][20][76]);   //该手机号码已经注册过会员！
                if($results){
                    // 如果来自绑定操作
                    if($from == "bind" && $code){
                        // 如果已绑定第三方账号，提示用户
                        if($results[0][$code.'_conn']){
                            return array("state" => 200, "info" => $langData['siteConfig'][33][2]);   //该手机号码已注册并绑定了此第三方账号，如需将手机号绑定此第三方账号，请先用手机登陆，然后在安全中心进行解绑，然后再绑定此第三方账号！
                        }
                    }else{
                        return array("state" => 200, "info" => $langData['siteConfig'][20][76]);   //该手机号码已经注册过会员！
                    }
                }
            }else{
                /*骑手验证*/
                $archives = $dsql->SetQuery("SELECT `id`  FROM `#@__waimai_courier` WHERE `phone` = '$phone'");
                $results  = $dsql->dsqlOper($archives, "totalCount");

                if($results) {
                    return array("state" => 200, "info" => $langData['siteConfig'][20][76]);   //该手机号码已经注册过会员！
                }
                // 判断手机号码归宿地黑白名单
                $phoneaddr = getTelAddr($phone);
                $inc = HUONIAOINC . "/config/waimai.inc.php";
                include $inc;
                // 是否存在黑名单
                if(isset($custom_phoneaddrblack) && $custom_phoneaddrblack!=""){
                    if($phoneaddr=="未知"){
                        return array('state' =>200, 'info' => "手机号码归属地获取失败");
                    }
                    $phoneaddr = explode(" ",$phoneaddr);
                    $phoneaddr = $phoneaddr[0];
                    $addrblacks = explode(",",$custom_phoneaddrblack);
                    if($addrblacks){
                        foreach($addrblacks as $k=>$v){
                            if($phoneaddr == $v){
                                return array('state' =>200, 'info' => "当前区域禁止注册");
                            }
                        }
                    }
                }
                // 是否为白名单中的任意一个
                if(isset($custom_phoneaddrwhite) && $custom_phoneaddrwhite!=""){
                    if($phoneaddr=="未知"){
                        return array('state' =>200, 'info' => "手机号码归属地获取失败");
                    }
                    $phoneaddr = explode(" ",$phoneaddr);
                    $phoneaddr = $phoneaddr[0];
                    $addrwhites = explode(",",$custom_phoneaddrwhite);
                    $contain_white = false;
                    if($addrwhites){
                        foreach($addrwhites as $k=>$v){
                            if($phoneaddr == $v){
                                $contain_white = true;
                                break;
                            }
                        }
                    }
                    if(!$contain_white){
                        return array('state' =>200, 'info' => "当前区域禁止注册");
                    }
                }
            }
        }

        //如果是找回密码，需要验证手机号码是否存在
        if($type == "fpwd"){

            $vericode = $param['vericode']; //验证码
            $isend    = $param['isend'];

            //如果开启了极验
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);    //图形验证错误，请重试！
                }
            }
            else{
                if(strtolower($vericode) != $_SESSION['huoniao_vdimg_value'] && !$isend) return array("state" => 200, "info" => $langData['siteConfig'][20][99]);   //验证码输入错误，请重试！
            }

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phone` = '$phone'");
            $results  = $dsql->dsqlOper($archives, "totalCount");
            if($results == 0) return array("state" => 200, "info" => $langData['siteConfig'][20][77]);    //该手机号码没有注册过会员！
        }



        if(empty($type) || empty($phone)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        //非国际版不需要验证区域码
        $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
        $results = $dsql->dsqlOper($archives, "results");
        if($results){
            $international = $results[0]['international'];
            if(!$international){
                $areaCode = "";
            }
        }else{
            return array("state" => 200, "info" => $langData['siteConfig'][33][3]); //短信平台未配置，发送失败！
        }

        $archives = $dsql->SetQuery("SELECT `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `byid` = '$uid' AND `lei` = '$type' AND `user` = '".$areaCode.$phone."'");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $has = true;
            $time = $now - $results[0]['time'];
            if($time < 60){
                return array("state" => 200, "info" => str_replace('1', (60-$time), $langData['siteConfig'][21][23]));    //您的发送频率太快，请1秒后稍候重试！
            }
        }

        $content = "";
        $code = $rand_num = rand(100000, 999999);

        //手机认证
        if($type == "verify"){

            //如果开启了极验
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);    //图形验证错误，请重试！
                }
            }

            //$archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phone` = '$phone' AND `phoneCheck` = 1");
            //$results  = $dsql->dsqlOper($archives, "totalCount");
            // // if($results > 0) return array("state" => 200, "info" => $langData['siteConfig'][20][76]);   //该手机号码已经注册过会员！
            //if($results){
            //  return array("state" => 200, "info" => $langData['siteConfig'][20][76]);   //该手机号码已经注册过会员！
            //}

            $smsTemp = "会员-手机邮箱绑定-发送验证码";
            //$content = "校验码".$code."，您正在进行手机绑定，工作人员不会向您索取，请勿泄漏。如有疑问请致电".$cfg_hotline."。";

            //注册验证
        }elseif($type == "signup"){
            $smsTemp = "会员-注册验证-发送验证码";
            //$content = "校验码".$code."，您`正在进行身份验证，工作人员不会向您索取，请勿泄漏。如有疑问请致电".$cfg_hotline."。";

            //身份验证
        }elseif($type == "auth" || $type == "join"){
            $smsTemp = "会员-安全验证-发送验证码";
            //$content = "校验码".$code."，您正在进行身份验证，工作人员不会向您索取，请勿泄漏。如有疑问请致电".$cfg_hotline."。";

            //找回密码
        }elseif($type == "fpwd"){
            $smsTemp = "会员-找回密码-发送验证码";
            //$content = "校验码".$code."，工作人员不会向您索取，请勿泄漏。如有疑问请致电".$cfg_hotline."。";

        }elseif($type == "sms_login"){
            $smsTemp = "会员-短信登录-发送验证码";
        }elseif ($type == 'shop_order_remind'){
            $smsTemp = "会员-短信登录-发送验证码";
        }

        //验证手机号码
        if($areaCode == '' || $areaCode == 86){
            if(!preg_match("/^1[23456789]\d{9}$/", $phone)){
                return array("state" => 200, "info" => "手机号码格式错误！");
            }
        }

        //发送短信
        if($smsTemp){
            return sendsms($areaCode.$phone, 1, $code, $type, $has, false, $smsTemp);
        }

        //获取短信内容
        // $content = "";
        // $contentTpl = getInfoTempContent("sms", $smsTempId, array("code" => $code));
        // if($contentTpl){
        //  $content = $contentTpl['content'];
        // }
        //
        // //调用发送短信接口
        // include_once(HUONIAOINC."/class/sms.class.php");
        // $sms = new sms($dbo);
        // $return = $sms->send($phone, $content);
        //
        // if($return == "ok"){
        //  if($has){
        //      $archives = $dsql->SetQuery("UPDATE `#@__site_messagelog` SET `code` = '$code', `body` = '$content', `pubdate` = '$now', `ip` = '$ip' WHERE `type` = 'phone' AND `lei` = '$type' AND `user` = '$phone'");
        //      $results  = $dsql->dsqlOper($archives, "update");
        //  }else{
        //      messageLog("phone", $type, $phone, $title, $content, $uid, 0, $code);
        //  }
        //  return "ok";
        //
        // }else{
        //  messageLog("phone", $type, $phone, $title, $content, $uid, 1, $code);
        //  return array("state" => 200, "info" => '验证码发送失败，请重试！');
        // }

    }


    /**
     * 发送邮箱验证码
     * @return array
     */
    public function getEmailVerify(){
        $param = $this->param;

        global $dsql;
        global $userLogin;
        global $cfg_shortname;
        global $cfg_hotline;
        global $cfg_webname;
        global $cfg_geetest;
        global $langData;

        //获取用户ID
        $uid = $userLogin->getMemberID();
        $ip  = GetIP();
        $now = GetMkTime(time());
        $has = false;

        if(!is_array($param)){
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！
        }else{
            $type  = $param['type'];
            $email = $param['email'];
        }

        // $terminal = isMobile() ? "mobile" : "pc";

        //如果是进行身份验证，需要进行登录验证，并获取登录用户的手机号码
        if($type == "auth"){
            if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
            $memberInfo = $userLogin->getMemberInfo();
            $email = $memberInfo['email'];

        //如果是注册，需要验证邮箱是否被注册
        }elseif($type == "signup"){

            //如果开启了极验
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);    //图形验证错误，请重试！
                }
            }

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `email` = '$email'");
            $results  = $dsql->dsqlOper($archives, "totalCount");
            if($results > 0) return array("state" => 200, "info" => $langData['siteConfig'][20][78]);    //该邮箱地址已经注册过会员！


        //如果是找回密码，需要验证邮箱是否存在
        }elseif($type == "fpwd"){

            $vericode = $param['vericode']; //验证码
            $isend    = $param['isend'];

            //如果开启了极验
            if($cfg_geetest){
                $geetest_challenge = $param['geetest_challenge'];
                $geetest_validate  = $param['geetest_validate'];
                $geetest_seccode   = $param['geetest_seccode'];
                $terminal          = $param['terminal'];
                $terminal = empty($terminal) ? "pc" : $terminal;

                $verifyGeetest = json_decode(verifyGeetest($geetest_challenge, $geetest_validate, $geetest_seccode, $terminal), true);
                if(!is_array($verifyGeetest) || $verifyGeetest['status'] == 'fail'){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][22]);    //图形验证错误，请重试！
                }
            }
            else{
                if(strtolower($vericode) != $_SESSION['huoniao_vdimg_value'] && !$isend) return array("state" => 200, "info" => $langData['siteConfig'][20][99]);   //验证码输入错误，请重试！
            }

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `email` = '$email'");
            $results  = $dsql->dsqlOper($archives, "totalCount");
            if(!$results) return array("state" => 200, "info" => $langData['siteConfig'][20][79]);     //该邮箱地址没有注册过会员！
        }

        if(empty($type) || empty($email)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $archives = $dsql->SetQuery("SELECT `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'email' AND `byid` = '$uid' AND `lei` = '$type' AND `user` = '$email'");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $has = true;
            $time = $now - $results[0]['pubdate'];
            if($time < 60){
                return array("state" => 200, "info" => str_replace('1', (60-$time), $langData['siteConfig'][21][23]));    //您的发送频率太快，请1秒后稍候重试！
            }
        }

        $title   = "";
        $content = "";
        $code = $rand_num = rand(100000, 999999);

        //身份验证
        if($type == "auth" || $type == "signup" || $type == "fpwd"){

            $tit = "会员-注册验证-发送验证码";
            if($type == "auth" || $type == "fpwd"){
                $tit = "会员-安全验证-发送验证码";
            }

            //获取邮件内容
            $cArr = getInfoTempContent("mail", $tit, array("code" => $code));

            $title = $cArr['title'];
            $content = $cArr['content'];

            // $title = $cfg_webname."-邮箱验证";
            // $content = "您正在进行邮箱验证，本次请求的验证码为：<strong>".$code."</strong>，<br /><br />为了保障您帐号的安全性，请在 48小时内完成绑定，此链接将在您绑定过后失效！<br />激活邮件将在您激活一次后失效。<br /><br />".$cfg_webname."<br />".date("Y-m-d", time())."<br /><br />如您错误的收到了此邮件，请不要点击绑定按钮。<br />这是一封系统自动发出的邮件，请不要直接回复。";
        }

        if($title == "" && $content == ""){
            return array("state" => 200, "info" => $langData['siteConfig'][33][4]);//邮件通知功能未开启，发送失败！
        }

        //调用发送邮件接口
        $replay = sendmail($email, $title, $content);

        $content = addslashes($content);

        if(empty($replay)){

            if($has){
                $archives = $dsql->SetQuery("UPDATE `#@__site_messagelog` SET `code` = '$code', `body` = '$content', `pubdate` = '$now', `ip` = '$ip' WHERE `type` = 'email' AND `lei` = '$type' AND `user` = '$email'");
                $dsql->dsqlOper($archives, "update");
            }else{
                messageLog("email", $type, $email, $title, $content, $uid, 0, $code);
            }

            return "ok";

        }else{
            messageLog("email", $type, $email, $title, $content, $uid, 1, $code);
            return array("state" => 200, "info" => $langData['siteConfig'][20][74]);     //验证码发送失败，请重试！
        }

    }


    /**
     * 获取网站已开通的第三方登录平台
     * @return array
     */
    public function getLoginConnect(){
        global $dsql;
        global $isQqMiniprogram;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticVersion;

        $list = array();
        $archives = $dsql->SetQuery("SELECT `id`, `code`, `name` FROM `#@__site_loginconnect` WHERE `state` = 1 ORDER BY `weight`, `id`");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            foreach($results as $key => $val){
                //苹果端快捷登录新打包的目前有问题，暂时取消快捷登录入口
                if((isIOSApp() && $val['code'] == 'wechat' && $cfg_basehost == 'ihuoniao.cn') || !isIOSApp()){
                    if(($isQqMiniprogram && $val['code'] == 'qq') || !$isQqMiniprogram){
                        $list[$key]['code']  = $val['code'];
                        $list[$key]['name']  = $val['name'];
                        $list[$key]['icon']  = $cfg_secureAccess . $cfg_basehost . '/api/login/' . $val['code'] . '/img/100.png?v=' . $cfg_staticVersion;
                    }
                }
            }
        }

        return $list;
    }


    /**
     * 获取用户已经绑定的登录平台
     * @return array
     */
    public function getUserBindLoginConnect(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => self::$langData['siteConfig'][21][121]);//登录超时，请刷新页面重试！

        $archives = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = $uid");
        $results = $dsql->dsqlOper($archives, "results");
        if(!$results) return array("state" => 200, "info" => self::$langData['siteConfig'][33][5]);//用户不存在！

        $open = array();
        $i = 0;
        foreach ($results[0] as $key => $value) {
            if(strstr($key, "_conn") && !empty($value)){
                $open[$i] = str_replace("_conn", "", $key);
                $i++;
            }
        }

        $list = array();
        $archives = $dsql->SetQuery("SELECT `id`, `code`, `name` FROM `#@__site_loginconnect` WHERE `state` = 1 ORDER BY `weight`, `id`");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            foreach($results as $key => $val){
                $state = 0;
                if(in_array($val['code'], $open)){
                    $state = 1;
                }
                $list[$key]['state'] = $state;
                $list[$key]['code']  = $val['code'];
                $list[$key]['name']  = $val['name'];
            }
        }

        $list = array_sort($list, "state", "desc");

        return $list;
    }



    /**
     * 根据指定表、指定ID获取相关信息
     * @return array
     */
    public function getPublicParentInfo(){
        global $dsql;
        $param = $this->param;

        $tab  = $param['tab'];
        $id   = $param['id'];

        global $data;
        $data = "";
        $typeArr = getParentArr($tab, $id);
        $ids = array_reverse(parent_foreach($typeArr, "id"));

        global $data;
        $data = "";
        $typeArr = getParentArr($tab, $id);
        $typenames = array_reverse(parent_foreach($typeArr, "typename"));

        return array(
            "ids" => $ids,
            "names" => $typenames
        );

    }

    /**
     * 移动端大首页底部菜单
     */
    public function touchHomePageFooter(){
        global $dsql;
        global $langData;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_staticVersion;
        $param = $this->param;
        
        // require_once HUONIAOROOT . "/api/payment/log.php";
        // $_touchHomePageFooter = new CLogFileHandler(HUONIAOROOT . '/log/touchHomePageFooter/' . date('Y-m-d') . '.log', true);
        // $_touchHomePageFooter->DEBUG("userAgent：" . $_SERVER['HTTP_USER_AGENT']);

        $tplDir = empty($tplDir) ? $cfg_secureAccess.$cfg_basehost."/static/" : $tplDir;

        $version  = $param['version'];
        $module   = $param['module'] ? $param['module'] : 'siteConfig';
        $platform = $param['platform'];
        $default  = (int)$param['default'];  //强制使用默认数据
        if($module =='paotui'){
            $module = "waimai";
        }
        //APP配置参数
        $ios_index = $cfg_secureAccess.$cfg_basehost;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $customBottomButton = $ret[0]['customBottomButton'] ? unserialize($ret[0]['customBottomButton']) : array();
        }

        //未指定终端的，判断userAgent
        if(!$platform){
            //安卓端
            if(isAndroidApp()){
                $platform = 'android';
            }
            //苹果端
            elseif(isIOSApp()){
                $platform = 'ios';
            }
            //鸿蒙端
            elseif(isHarmonyApp()){
                $platform = 'harmony';
            }
            //微信小程序
            elseif(isWxMiniprogram()){
                $platform = 'wxmini';
            }
            //抖音小程序
            elseif(isByteMiniprogram()){
                $platform = 'dymini';
            }
        }

        //指定终端
        if($platform && !$default){
            $_customBottomButton = $customBottomButton[$platform];
            if(!$_customBottomButton && isApp()){
                $customBottomButton = $customBottomButton['app'];
            }else{
                $customBottomButton = $_customBottomButton;
            }
        }

        if($version == '2.0'){
            if(!empty($customBottomButton) && is_array($customBottomButton) && count($customBottomButton)==100 && $module == 'siteConfig' && !$default){
                $menuArr = array();
                foreach ($customBottomButton as $key => $val) {
                    $menuArr[$key]['name']   = $val['name'];
                    $menuArr[$key]['icon']   = $val['icon']   ? getFilePath($val['icon'])   : '';
                    $menuArr[$key]['icon_h'] = $val['icon_h'] ? getFilePath($val['icon_h']) : '';
                    $menuArr[$key]['url']    = $val['url'];
                    $menuArr[$key]['miniPath'] = $val['miniPath'];
                    $menuArr[$key]['fabu']   = $val['fabu'] ? (int)$val['fabu'] : 0;
                    $menuArr[$key]['message'] = $val['message'] ? (int)$val['message'] : 0;
                    $menuArr[$key]['code']   = isIOSApp() && ($val['code'] == 'fabu' || $val['code'] == 'info' || $val['code'] == 'sfcar' || $val['code'] == 'tieba' || $val['code'] == 'circle' || $val['code'] == 'circle_topic' || $val['code'] == 'shop' || $val['code'] == 'shop_category' || $val['code'] == 'job' || $val['code'] == 'user_center') ? '' : $val['code'];  //iOS端暂不支持分类信息新版和原生发布页

                    //商城购物车数量
                    $cartNum = 0;
                    if($key == 2 && $module == 'shop'){
                        
                        $shopHandels = new handlers('shop', "getCartList");
                        $detail = $shopHandels->getHandle();
                        if($detail['state'] == 100){
                            $cartNum = (int)count($detail['info']);
                        }

                    }
                    $menuArr[$key]['cartNum'] = $cartNum;
                }
                $menu = $menuArr;
            }else{

                //调用指定模块的
                $_cart = $module;
                
                //商城购物车特殊处理
                if($_cart == 'cart'){
                    $module = 'shop';
                }
                if($customBottomButton[$module] && !$default){
                    $menuArr = array();
                    foreach ($customBottomButton[$module] as $key => $val) {

                        $url = $val['url'];

                        //APP端URL特殊处理
                        if(isApp() && $module != 'task'){
                            $url = $url . (strstr($url, '?') ? '&' : '?') . 'appIndex=1';
                        }

                        $menuArr[$key]['name']   = $val['name'];
                        $menuArr[$key]['icon']   = $val['icon']   ? getFilePath($val['icon'])   : '';
                        $menuArr[$key]['icon_h'] = $val['icon_h'] ? getFilePath($val['icon_h']) : '';
                        $menuArr[$key]['url']    = $url;
                        $menuArr[$key]['miniPath'] = $val['miniPath'];
                        $menuArr[$key]['fabu']   = $val['fabu'] ? (int)$val['fabu'] : 0;
                        $menuArr[$key]['message'] = $val['message'] ? (int)$val['message'] : 0;
                        // $menuArr[$key]['code']   = $val['code'];
                        $menuArr[$key]['code']   = ($module == 'shop' && strstr($url, 'cart') && !isIOSApp()) ? 'cart' : (isIOSApp() && ($val['code'] == 'fabu' || $val['code'] == 'info' || $val['code'] == 'sfcar' || $val['code'] == 'tieba' || $val['code'] == 'circle' || $val['code'] == 'circle_topic' || $val['code'] == 'shop' || $val['code'] == 'shop_category' || $val['code'] == 'job' || $val['code'] == 'user_center') ? '' : $val['code']);  //iOS端暂不支持分类信息新版和原生发布页

                        $menuArr[$key]['code']   = !isIOSApp() ? $menuArr[$key]['code'] : '';  //取消iOS端所有原生页面

                        //商城购物车数量
                        $cartNum = 0;
                        if($key == 2 && $module == 'shop'){
                        
                            $shopHandels = new handlers('shop', "getCartList");
                            $detail = $shopHandels->getHandle();
                            if($detail['state'] == 100){
                                $cartNum = (int)count($detail['info']);
                            }
                            
                        }
                        $menuArr[$key]['cartNum'] = $cartNum;
                    }
                    $menu = $menuArr;
                }else{

                    //域名中不需要分站信息
                    global $domainNoCity;
                    $domainNoCity = 1;

                    $platform = $platform == 'android' || $platform == 'ios' || $platform == 'harmony' ? 'app' : $platform;

                    //资讯
                    if($module == 'article'){

                        $menu = array(
                            0 => array(
                                "name" => '资讯',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/article/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'article' : ''
                            ),
                            1 => array(
                                "name" => '媒体号',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'index', 'param' => 'type=media' . ($platform == 'app' ? '&appIndex=1' : ''))),
                                "miniPath" => "/pages/packages/article/index/index?type=media",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'article_media' : ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu", "module" => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => !isIOSApp() ? 'fabu' : ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_article", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //二手信息
                    }elseif($module == 'info'){

                        $menu = array(
                            0 => array(
                                "name" => '信息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/info/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'info' : ''
                            ),
                            1 => array(
                                "name" => '分类',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'category', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/info/category/category",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu", "module" => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_info", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //房产门户
                    }elseif($module == 'house'){

                        $menu = array(
                            0 => array(
                                "name" => '房产',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'house' : ''
                            ),
                            1 => array(
                                "name" => '地图找房',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'map', 'action' => 'loupan', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "house", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))) . '#fabu',
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_house", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //招聘求职
                    }elseif($module == 'job'){

                        $menu = array(
                            0 => array(
                                "name" => '招聘',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/active_1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/default_1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen=1' : ''))),
                                "miniPath" => "/pages/packages/job/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'job' : ''
                            ),
                            1 => array(
                                "name" => '面试日程',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/active_2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/default_2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'job-invitation')),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/active_3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/default_3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ('module=job' . ($platform == 'app' ? '&appIndex=1&appFullScreen' : '')))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/active_4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/default_4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_job", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //城市招聘
                    }elseif($module == 'zhaopin'){

                        $menu = array(
                            0 => array(
                                "name" => '首页',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen=1' : ''))),
                                "miniPath" => "/pages/packages/zhaopin/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'zhaopin' : ''
                            ),
                            1 => array(
                                "name" => '职位',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'job-list')),
                                "miniPath" => "/pages/packages/zhaopin/qzJobList/qzJobList",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '公司',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'company-list')),
                                "miniPath" => "/pages/packages/zhaopin/companyList/companyList",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'msg-list')),
                                "miniPath" => "/pages/packages/zhaopin_center/zp_center/msgList/msgList",
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'u_center')),
                                "miniPath" => "/pages/packages/zhaopin_center/zp_center/index/index",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //贴吧社区
                    }elseif($module == 'tieba'){

                        $menu = array(
                            0 => array(
                                "name" => '贴吧',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/tieba/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'tieba' : ''
                            ),
                            1 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu-tieba", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle=1&appFabuTieba=1' : ''))) . '#fabu',
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_tieba", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //在线商城
                    }elseif($module == 'shop' || $module == 'cart'){

                        $module = 'shop';

                        //商城购物车数量
                        $cartNum = 0;
                        $shopHandels = new handlers('shop', "getCartList");
                        $detail = $shopHandels->getHandle();
                        if($detail['state'] == 100){
                            $cartNum = (int)count($detail['info']);
                        }
                        
                        $menu = array(
                            0 => array(
                                "name" => '商城',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/shop/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'shop' : ''
                            ),
                            1 => array(
                                "name" => '分类',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'category', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/shop/category/category",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '购物车',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "cart", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/shop/cart/cart",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'cart' : '', "cartNum" => $cartNum
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_shop", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //教育培训
                    }elseif($module == 'education'){

                        $menu = array(
                            0 => array(
                                "name" => '教育',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'education' : ''
                            ),
                            1 => array(
                                "name" => '机构',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'store', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '家教',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "tutor", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_education", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //美食外卖
                    }elseif($module == 'waimai'){

                        $menu = array(
                            0 => array(
                                "name" => '外卖',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/waimai/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'waimai' : ''
                            ),
                            1 => array(
                                "name" => '跑腿',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'paotui', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '订单',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "order", "action" => "waimai", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_waimai", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //外卖跑腿
                    }elseif($module == 'paotui'){

                        $menu = array(
                            0 => array(
                                "name" => '外卖',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'waimai', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'waimai' : ''
                            ),
                            1 => array(
                                "name" => '跑腿',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'waimai', 'template' => 'paotui', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '订单',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "order", "action" => "paotui", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => 'user_center'
                            )
                        );


                        //团购秒杀
                    }elseif($module == 'tuan'){

                        $menu = array(
                            0 => array(
                                "name" => '团购',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/tuan/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'tuan' : ''
                            ),
                            1 => array(
                                "name" => '好店',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'haodian', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/tuan/haodian/haodian",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_tuan", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //同城活动
                    }elseif($module == 'huodong'){

                        $menu = array(
                            0 => array(
                                "name" => '活动',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'huodong' : ''
                            ),
                            1 => array(
                                "name" => '推荐',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'list', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu-huodong", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))) . '#fabu',
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_huodong", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //养老机构
                    }elseif($module == 'pension'){

                        $menu = array(
                            0 => array(
                                "name" => '养老',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '地图',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'map', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_pension", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //在线旅游
                    }elseif($module == 'travel'){

                        $menu = array(
                            0 => array(
                                "name" => '旅游',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'travel' : ''
                            ),
                            1 => array(
                                "name" => '订单',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'order', 'action' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_travel", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //婚嫁频道
                    }elseif($module == 'marry'){

                        $menu = array(
                            0 => array(
                                "name" => '婚嫁',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'marry' : ''
                            ),
                            1 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            2 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //家政服务
                    }elseif($module == 'homemaking'){

                        $menu = array(
                            0 => array(
                                "name" => '家政',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'homemaking' : ''
                            ),
                            1 => array(
                                "name" => '订单',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'order', 'action' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_homemaking", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //二手汽车
                    }elseif($module == 'car'){

                        $menu = array(
                            0 => array(
                                "name" => '汽车',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'car' : ''
                            ),
                            1 => array(
                                "name" => '公司',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'store', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu", "action" => "car", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_car", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //装修门户
                    }elseif($module == 'renovation'){

                        $menu = array(
                            0 => array(
                                "name" => '装修',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '公司',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'company', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_renovation", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //互动交友
                    }elseif($module == 'dating'){

                        $menu = array(
                            0 => array(
                                "name" => '交友',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '动态',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'dongtai', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "my", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //积分商城
                    }elseif($module == 'integral'){

                        $menu = array(
                            0 => array(
                                "name" => '积分',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '分类',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'category', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '排行榜',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "ranking", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //圈子动态
                    }elseif($module == 'circle'){

                        $menu = array(
                            0 => array(
                                "name" => '圈子',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIosApp() ? 'circle' : ''
                            ),
                            1 => array(
                                "name" => '话题',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))) . '#4',
                                "fabu" => 0,    "message" => 0, "code" => !isIosApp() ? 'circle_topic' : ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu_circle", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //商家
                    }elseif($module == 'business'){

                        $menu = array(
                            0 => array(
                                "name" => '商家',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'business' : ''
                            ),
                            1 => array(
                                "name" => '推荐',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'list', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '入驻',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "enter_contrast", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_business", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //顺风车
                    }elseif($module == 'sfcar'){

                        $menu = array(
                            0 => array(
                                "name" => '顺风车',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "miniPath" => "/pages/packages/sfcar/index/index",
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'sfcar' : ''
                            ),
                            1 => array(
                                "name" => '收藏',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'collection', 'param' => 'module=sfcar', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu", 'action' => 'sfcar', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_sfcar", 'param' => ($platform == 'app' ? 'appTitle=1' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //黄页
                    }elseif($module == 'huangye'){

                        $menu = array(
                            0 => array(
                                "name" => '黄页',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '推荐',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'list', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '入驻',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "enter_contrast", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //直播
                    }elseif($module == 'live'){

                        $menu = array(
                            0 => array(
                                "name" => '首页',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '主播',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'template' => 'anchorlist', 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '发布',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabu", "action" => "live", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 1,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '关注',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "myanchor", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "index_live", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //投票
                    }elseif($module == 'vote'){

                        $menu = array(
                            0 => array(
                                "name" => '投票',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=vote",
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            2 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //拍卖
                    }elseif($module == 'paimai'){

                        $menu = array(
                            0 => array(
                                "name" => '拍卖',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '分类',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/info/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/info/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "category", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=paimai",
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            3 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //任务悬赏
                    }elseif($module == 'task'){

                        $menu = array(
                            0 => array(
                                "name" => '首页',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1' : ''))),
                                "miniPath" => "/pages/packages/task/index/index",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '推荐',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "list", 'param' => ($platform == 'app' ? 'appTitle=1' : ''))),
                                "miniPath" => "/pages/packages/task/list/list",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            2 => array(
                                "name" => '推广',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon3.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon3.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "invite", 'param' => "module=task" . ($platform == 'app' ? '&appIndex=1&appTitle=1' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            3 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon4.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon4.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => "module=task" . ($platform == 'app' ? '&appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=task",
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            4 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/".$module."/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/".$module."/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => $module, "template" => "my", 'param' => ($platform == 'app' ? 'appTitle=1' : ''))),
                                "miniPath" => "/pages/packages/task/my/my",
                                "fabu" => 0,    "message" => 0, "code" => ''
                            )
                        );


                        //VR全景、图说新闻、视频模块、电子报刊、有奖乐购
                    }elseif($module == 'quanjing' || $module == 'image' || $module == 'video' || $module == 'paper' || $module == 'awardlegou'){

                        $menu = array(
                            0 => array(
                                "name" => '首页',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon1.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon1.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array('service' => $module, 'param' => ($platform == 'app' ? 'appIndex=1&appTitle' : ''))),
                                "fabu" => 0,    "message" => 0, "code" => ''
                            ),
                            1 => array(
                                "name" => '消息',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon2.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon2.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/message/index?module=" . $module,
                                "fabu" => 0,    "message" => 1, "code" => ''
                            ),
                            2 => array(
                                "name" => '我的',
                                "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon5.png?v=" . $cfg_staticVersion,
                                "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon5.png?v=" . $cfg_staticVersion,
                                "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1&appFullScreen' : ''))),
                                "miniPath" => "/pages/member/index/index?module=".$module,
                                "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'user_center' : ''
                            )
                        );


                        //其他模块
                    }else{

                        if($customBottomButton['siteConfig'] && !$default){
                            $menuArr = array();
                            foreach ($customBottomButton['siteConfig'] as $key => $val) {

                                $url = $val['url'];

                                //APP端URL特殊处理
                                if($platform == 'app'){
                                    $url = $url . (strstr($url, '?') ? '&' : '?') . 'appIndex=1';
                                }

                                $menuArr[$key]['name']   = $val['name'];
                                $menuArr[$key]['icon']   = $val['icon']   ? getFilePath($val['icon'])   : '';
                                $menuArr[$key]['icon_h'] = $val['icon_h'] ? getFilePath($val['icon_h']) : '';
                                $menuArr[$key]['url']    = $url;
                                $menuArr[$key]['fabu']   = $val['fabu'] ? (int)$val['fabu'] : 0;
                                $menuArr[$key]['message'] = $val['message'] ? (int)$val['message'] : 0;
                                // $menuArr[$key]['code']   = $val['code'];
                                $menuArr[$key]['code']   = ($module == 'shop' && strstr($url, 'cart') && !isIOSApp()) ? 'cart' : (isIOSApp() && ($val['code'] == 'fabu' || $val['code'] == 'info' || $val['code'] == 'sfcar' || $val['code'] == 'circle' || $val['code'] == 'circle_topic' || $val['code'] == 'shop' || $val['code'] == 'shop_category' || $val['code'] == 'job' || $val['code'] == 'user_center') ? '' : $val['code']);  //iOS端暂不支持分类信息新版和原生发布页
                                
                                $menuArr[$key]['code']   = !isIOSApp() ? $val['code'] : '';
                            }
                            $menu = $menuArr;
                        }else{

                            $menu = array(
                                0 => array(
                                    "name" => '首页',
                                    "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon1.png?v=" . $cfg_staticVersion,
                                    "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon1.png?v=" . $cfg_staticVersion,
                                    "url" => $ios_index,
                                    "miniPath" => "/pages/index/index",
                                    "fabu" => 0,    "message" => 0, "code" => ''
                                ),
                                1 => array(
                                    "name" => '圈子',
                                    "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon2.png?v=" . $cfg_staticVersion,
                                    "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon2.png?v=" . $cfg_staticVersion,
                                    "url" => getUrlPath(array("service" => "circle")) . '?from=app',
                                    "fabu" => 0,    "message" => 0, "code" => !isIOSApp() ? 'circle' : ''
                                ),
                                2 => array(
                                    "name" => '发布',
                                    "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon3.png?v=" . $cfg_staticVersion,
                                    "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon3.png?v=" . $cfg_staticVersion,
                                    "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "fabuJoin_touch_popup_3.4", 'param' => ($platform == 'app' ? 'appIndex=1&appTitle=1' : ''))),
                                    "fabu" => 1,    "message" => 0, "code" => !isIOSApp() ? 'fabu' : ''
                                ),
                                3 => array(
                                    "name" => '消息',
                                    "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon4.png?v=" . $cfg_staticVersion,
                                    "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon4.png?v=" . $cfg_staticVersion,
                                    "url" => getUrlPath(array("service" => "member", "type" => "user", "template" => "message", 'param' => ($platform == 'app' ? 'appIndex=1' : ''))),
                                    "miniPath" => "/pages/member/message/index",
                                    "fabu" => 0,    "message" => 1, "code" => ''
                                ),
                                4 => array(
                                    "name" => '我的',
                                    "icon_h" => $tplDir."images/touchHomePageFooter/2.0/ficon5.png?v=" . $cfg_staticVersion,
                                    "icon" => $tplDir."images/touchHomePageFooter/2.0/aficon5.png?v=" . $cfg_staticVersion,
                                    "url" => getUrlPath(array("service" => "member", "type" => "user", 'param' => ($platform == 'app' ? 'appIndex=1' : ''))),
                                    "miniPath" => "/pages/member/index/index",
                                    "fabu" => 0,    "message" => 0, "code" => isIOSApp() ? '' : 'user_center'
                                )
                            );
                        }
                    }
                }
            }
        }else{
            $menu = array(
                0 => array(
                    "name" => $langData['siteConfig'][0][0],
                    "icon" => $tplDir."images/ficon1.png",
                    "icon_h" => $tplDir."images/aficon1.png",
                    "url" => $ios_index
                ),
                1 => array(
                    "name" => $langData['siteConfig'][16][0],
                    "icon" => $tplDir."images/ficon2.png",
                    "icon_h" => $tplDir."images/aficon2.png",
                    "url" => getUrlPath(array("service" => "siteConfig", "template" => "tcquan"))
                ),
                2 => array(
                    "name" => $langData['siteConfig'][11][0],
                    "icon" => $tplDir."images/ficon3.png",
                    "icon_h" => $tplDir."images/aficon3.png",
                    "url" => getUrlPath(array("service" => "siteConfig", "template" => "post"))
                ),
                3 => array(
                    "name" => $langData['siteConfig'][16][1],
                    "icon" => $tplDir."images/ficon4.png",
                    "icon_h" => $tplDir."images/aficon4.png",
                    "url" => getUrlPath(array("service" => "business"))
                ),
                4 => array(
                    "name" => $langData['siteConfig'][10][0],
                    "icon" => $tplDir."images/ficon5.png",
                    "icon_h" => $tplDir."images/aficon5.png",
                    "url" => getUrlPath(array("service" => "member", "type" => "user"))
                )
            );
        }
        
        // $_touchHomePageFooter->DEBUG("data：" . json_encode($menu, JSON_UNESCAPED_UNICODE));

        return $menu;
    }


    //获取数据库表结构
    public function getDatabaseStructure(){
        global $dsql;
        $table = $dsql->get_db_detail($GLOBALS['DB_HOST'], $GLOBALS['DB_USER'], $GLOBALS['DB_PASS'], $GLOBALS['DB_NAME'], $errors);
        $table['prefix'] = $GLOBALS['DB_PREFIX'];

        if($errors){
            return array("state" => 200, "info" => join("、", $errors));
        }

        //本地校验文件
        $huoniaofile = HUONIAODATA.'/admin/huoniaoDatabase.txt';

        //写入验证文件
        unlinkFile($huoniaofile);
        PutFile($huoniaofile, json_encode($table));

        return $table;
    }

    /**
     * [验证手机号是否被其他用户绑定]
     * @return [type] [description]
     */
    public function checkPhoneBindState(){
        global $dsql;
        global $userLogin;
        $admin = $userLogin->getMemberID();
        if($admin == -1) return array("state" => 200, "info" => self::$langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        $param = $this->param;
        $phone = $param['phone'];
        if(empty($phone)) return array("state" => 200, "info" => self::$langData['siteConfig'][20][239]);    //请输入手机号

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phone` = '$phone' AND `id` != $admin");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $RenrenCrypt = new RenrenCrypt();
            $sameConn = base64_encode($RenrenCrypt->php_encrypt($ret[0]['id']));
            return $sameConn;
        }else{
            return "no";
        }
    }


    /**
     * 根据GPS坐标获取详细信息
     * 由于使用的百度地图接口，需要在后台提前配置好百度地图的密钥
     */
    public function getLocationByGeocoding(){
        global $cfg_map;
        global $cfg_map_google;
        global $cfg_map_baidu_server;
        global $cfg_map_amap_server;
        global $cfg_map_tmap_server;
        $param = $this->param;
        $location = $param['location'];
        $module = $param['module'];
        $pois = (int)$param['pois'];  //是否需要pois数据

        if($module){
            $config = HUONIAOINC."/config/".$module.".inc.php";
            if(is_file($config)){
                include_once($config);
                $custom_map = (int)$custom_map;
            }
        }

        if($custom_map != 0){
            $cfg_map = $custom_map;
        }

        include_once HUONIAOROOT . "/api/payment/log.php";
        $_locationByGeocodingLog = new CLogFileHandler(HUONIAOROOT . '/log/getLocationByGeocoding/' . date('Y-m-d') . '.log', true);
        $_locationByGeocodingLog->DEBUG("cfg_map：" . $cfg_map);

        //百度
        if($cfg_map == 2){
            $curl = curl_init();

            //根据坐标获取详细信息，默认为百度经纬度坐标，如果是GPS坐标，需要传type为gps
            $coordtype = 'bd09ll';
            if($param['type'] == 'gps'){
                $coordtype = 'wgs84ll';
            }elseif(isWxMiniprogram()){
                // $coordtype = 'gcj02ll';  //前端已经转过，这里不需要再转
            }
            
            //自定义坐标系
            if($param['coordtype']){
                $coordtype = $param['coordtype'];
            }

            curl_setopt($curl, CURLOPT_URL, 'http://api.map.baidu.com/reverse_geocoding/v3/?location='.$location.'&coordtype='.$coordtype.'&output=json&extensions_poi=1&extensions_town=true&sort_strategy=distance&entire_poi=1&ak='.$cfg_map_baidu_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $con = curl_exec($curl);

            $curlError = '';
            if (curl_errno($curl)) {
                $curlError = curl_errno($curl) . ':' . curl_error($curl);
            }

            curl_close($curl);

            if($con){
                $con = json_decode($con, true);

                if($con['status'] == 0){
                    $result = $con['result'];
                    $lng = $result['location']['lng'];
                    $lat = $result['location']['lat'];
                    $name = $result['sematic_description'];
                    $address = $result['formatted_address'];
                    $province = $result['addressComponent']['province'];
                    $city = $result['addressComponent']['city'];
                    $district = $result['addressComponent']['district'];
                    $town = $result['addressComponent']['town'];

                    $city = $city ?: $district;  //自治县的情况，city可能没有数据

                    //周边poi
                    if(count($result['pois']) > 0){
                        $poi = $result['pois'][0];
                        $name = $poi['name'];
                        $address = $poi['addr'];
                    }

                    $name = $name ? $name : $district;

                    $poisList = array();
                    if($pois && count($result['pois']) > 0){
                        foreach($result['pois'] as $k => $v){
                            $poisList[] = array(
                                'name' => $v['name'],
                                'address' => $v['addr'],
                                'distance' => (int)$v['distance'],  //距离，单位：米
                                'lng' => (float)$v['point']['x'],
                                'lat' => (float)$v['point']['y'],
                            );
                        }
                    }

                    // 按照距离排序
                    if($poisList){
                        usort($poisList, function($a, $b) {
                            return $a['distance'] - $b['distance'];
                        });
                    }

                    $data = array(
                        'lng' => $lng,
                        'lat' => $lat,
                        'name' => (string)$name,
                        'address' => (string)$address,
                        'province' => (string)$province,
                        'city' => (string)$city,
                        'district' => (string)$district,
                        'town' => (string)$town,
                        'pois' => $poisList
                    );
                    $_locationByGeocodingLog->DEBUG(json_encode($data, JSON_UNESCAPED_UNICODE));
                    return $data;

                }else{
                    $_locationByGeocodingLog->DEBUG("map_key：" . $cfg_map_baidu_server);
                    $_locationByGeocodingLog->DEBUG(json_encode($con, JSON_UNESCAPED_UNICODE));
                    return array('state' => 200, 'info' => $con['message']);
                }
            }else{
                $_locationByGeocodingLog->DEBUG("curl_error：" . $curlError);
                $_locationByGeocodingLog->DEBUG("" . $con);
                return array('state' => 200, 'info' => 'Failed!');
            }

            //高德
        }elseif($cfg_map == 4){

            $lnglat = explode(',', $location);
            $location = $lnglat[1] . ',' . $lnglat[0];  //调整顺序，经度在前，纬度在后

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://restapi.amap.com/v3/geocode/regeo?location='.$location.'&extensions=all&batch=false&roadlevel=0&key='.$cfg_map_amap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $con = curl_exec($curl);

            $curlError = '';
            if (curl_errno($curl)) {
                $curlError = curl_errno($curl) . ':' . curl_error($curl);
            }

            curl_close($curl);

            if($con){
                $con = json_decode($con, true);

                if($con['status'] == 1){
                    $result = $con['regeocodes'] ? $con['regeocodes'] : $con['regeocode'];
                    $name = $result['addressComponent']['township'];
                    $address = $result['formatted_address'];
                    $province = $result['addressComponent']['province'];
                    $city = $result['addressComponent']['city'];
                    $district = $result['addressComponent']['district'];
                    $town = $result['addressComponent']['township'];

                    //周边poi
                    if($result['pois'] && count($result['pois']) > 0){
                        $poi = $result['pois'][0];
                        $name = $poi['name'];
                    }

                    $name = $name ? $name : $district;

                    $city = $city ?: $district;  //自治县的情况，city可能没有数据

                    $poisList = array();
                    if($pois && count($result['pois']) > 0){
                        foreach($result['pois'] as $k => $v){
                            $location = explode(',', $v['location']);
                            $poisList[] = array(
                                'name' => $v['name'],
                                'address' => $v['address'],
                                'distance' => (int)$v['distance'],  //距离，单位：米
                                'lng' => (float)$location[0],
                                'lat' => (float)$location[1],
                            );
                        }
                    }

                    // 按照距离排序
                    if($poisList){
                        usort($poisList, function($a, $b) {
                            return $a['distance'] - $b['distance'];
                        });
                    }

                    $data = array(
                        'lng' => $lnglat[1],
                        'lat' => $lnglat[0],
                        'name' => (string)$name,
                        'address' => (string)$address,
                        'province' => (string)$province,
                        'city' => (string)(is_array($city) ? $province : $city),
                        'district' => (string)($district ? $district : ''),
                        'town' => (string)$town,
                        'pois' => $poisList
                    );
                    $_locationByGeocodingLog->DEBUG(json_encode($data, JSON_UNESCAPED_UNICODE));
                    return $data;

                }else{
                    $_locationByGeocodingLog->DEBUG("map_key：" . $cfg_map_amap_server);
                    $_locationByGeocodingLog->DEBUG(json_encode($con, JSON_UNESCAPED_UNICODE));
                    return array('state' => 200, 'info' => $con['info']);
                }
            }else{
                $_locationByGeocodingLog->DEBUG("curl_error：" . $curlError);
                $_locationByGeocodingLog->DEBUG("" . $con);
                return array('state' => 200, 'info' => 'Failed!');
            }

        //天地图
        }elseif($cfg_map == 5){

            $lnglat = explode(',', $location);

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'http://api.tianditu.gov.cn/geocoder?postStr={"lon":'.$lnglat[1].',"lat":'.$lnglat[0].',"ver":1}&type=geocode&tk='.$cfg_map_tmap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $con = curl_exec($curl);

            $curlError = '';
            if (curl_errno($curl)) {
                $curlError = curl_errno($curl) . ':' . curl_error($curl);
            }

            curl_close($curl);

            if($con){
                $con = json_decode($con, true);

                if($con['status'] == 0){
                    $result = $con['result'];
                    $lng = $result['location']['lon'];
                    $lat = $result['location']['lat'];
                    $name = $result['addressComponent']['poi'];
                    $address = $result['addressComponent']['address'];
                    $province = $result['addressComponent']['province'];
                    $city = $result['addressComponent']['city'];
                    $district = $result['addressComponent']['county'];
                    $town = '';

                    $name = $name ? $name : $district;

                    $city = $city ?: $district;  //自治县的情况，city可能没有数据

                    $data = array(
                        'lng' => $lng,
                        'lat' => $lat,
                        'name' => (string)$name,
                        'address' => (string)$address,
                        'province' => (string)$province,
                        'city' => (string)$city,
                        'district' => (string)$district,
                        'town' => (string)$town
                    );
                    $_locationByGeocodingLog->DEBUG(json_encode($data, JSON_UNESCAPED_UNICODE));
                    return $data;

                }else{
                    $_locationByGeocodingLog->DEBUG("map_key：" . $cfg_map_tmap_server);
                    $_locationByGeocodingLog->DEBUG(json_encode($con, JSON_UNESCAPED_UNICODE));
                    return array('state' => 200, 'info' => $con['message']);
                }
            }else{
                $_locationByGeocodingLog->DEBUG("curl_error：" . $curlError);
                $_locationByGeocodingLog->DEBUG("" . $con);
                return array('state' => 200, 'info' => 'Failed!');
            }

            //google
        }elseif($cfg_map == 1){

            // $url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='.$location.'&location_type=ROOFTOP&key='.$cfg_map_google;
            $url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='.$location.'&key='.$cfg_map_google;

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($curl, CURLINFO_HEADER_OUT, TRUE);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            curl_setopt($curl, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
            $con = curl_exec($curl);
            // echo 'Curl error: ' . curl_error($curl);exit;

            $curlError = '';
            if (curl_errno($curl)) {
                $curlError = curl_errno($curl) . ':' . curl_error($curl);
            }
            
            curl_close($curl);

            if($con){
                $con = json_decode($con, true);

                if($con['status'] == 'OK'){
                    $result = $con['results'];

                    $data = array();

                    foreach ($result as $key => $value) {
                        if($value['types'][0] == 'premise'){
                            $data = $value;
                        }
                    }

                    //如果列表结果中没有可能性结果，则取第一条数据
                    if(!$data){
                        $data = $result[0];
                    }

                    $px = 0;
                    $addr = $data['address_components'][0];
                    if($addr['types'][0] == 'street_number'){
                        $px = 1;
                    }

                    $data = array(
                        'lng' => $data['geometry']['location']['lng'],
                        'lat' => $data['geometry']['location']['lat'],
                        'name' => ($px == 1 ? $data['address_components'][(0)]['short_name'] . ' ' : '') . $data['address_components'][(0+$px)]['short_name'],
                        'address' => $data['formatted_address'],
                        'province' => $data['address_components'][(3+$px)]['short_name'],
                        'city' => $data['address_components'][(2+$px)]['short_name'],
                        'district' => $data['address_components'][(1+$px)]['short_name']
                    );
                    $_locationByGeocodingLog->DEBUG(json_encode($data, JSON_UNESCAPED_UNICODE));
                    return $data;

                }else{
                    $_locationByGeocodingLog->DEBUG("map_key：" . $cfg_map_google);
                    $_locationByGeocodingLog->DEBUG(json_encode($con, JSON_UNESCAPED_UNICODE));
                    return array('state' => 200, 'info' => $con['error_message'] ? $con['error_message'] : $con['status']);
                }
            }else{
                $_locationByGeocodingLog->DEBUG("curl_error：" . $curlError);
                $_locationByGeocodingLog->DEBUG("" . $con);
                return array('state' => 200, 'info' => 'Failed!');
            }

        }
    }



    /**
     * 接口方式获取融云Token
     */
    public function getRongCloudToken(){
        global $dsql;
        global $userLogin;
        $id = (int)$this->param['id'];
        $type = $this->param['type'];
        if(empty($id)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        if($type == "dating"){
            $sql = $dsql->SetQuery("SELECT `id`, `nickname`, `photo` FROM `#@__dating_member` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $userinfo = array(
                    "nickname" => $ret[0]['nickname'],
                    "photo" => $ret[0]['photo'] ? getFilePath($ret[0]['photo']) : "",
                );
            }else{
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][5]);//用户不存在！
            }
        }else{
            $userinfo = $userLogin->getMemberInfo($id);
        }
        if(is_array($userinfo)){
            $rongCloudToken = getRongCloudToken($id, $userinfo['nickname'], $userinfo['photo']);
            return $rongCloudToken;
        }else{
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][5]);//用户不存在！
        }
    }


    /**
     * 新增即时聊天对话
     * @author gz
     * @param string $mod  模块
     * @param int    $from 发送人会员ID
     * @param int    $to   接收人会员ID
     * @param string $msg  对话内容
     * @param int    $date 时间 unit时间戳
     * @return array
     * @date 2018-07-18
     */
    public function sendChatTalk(){
        global $dsql;
        $param = $this->param;

        if(!is_array($param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $mod  = $param['mod'];
        $from = (int)$param['from'];
        $to   = (int)$param['to'];
        $msg  = $param['msg'];
        $date = $param['date'];

        if(empty($mod)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][6]);//模块名不得为空！
        if(empty($from)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][7]);//发送人会员ID不得为空！
        if(empty($to)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][8]);//接收人会员ID不得为空！
        if(empty($msg)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][9]);//对话内容不得为空！

        // $date = empty($date) ? GetMkTime(time()) : $date;

        $sql = $dsql->SetQuery("INSERT INTO `#@__".$mod."_chat` (`from`, `to`, `msg`, `date`) VALUES ('$from', '$to', '$msg', '$date')");
        if($mod == "dating"){

            $configHandels = new handlers($mod, "sendChatCheck");
            $check = $configHandels->getHandle(array("from" => $from, "to" => $to));

            if(is_array($check) && $check['state'] == 100){
                $pid = $check['info'];
            }else{
                return $check;
            }
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$mod."_chat` WHERE ( `pid` = 0 AND ( (`from` = $from && `to` = $to) || (`from` = $to && `to` = $from) ) )");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $pid = $ret[0]['id'];
        }else{
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][10]);//数据写入失败！
        }

        $sql = $dsql->SetQuery("INSERT INTO `#@__".$mod."_chat` (`from`, `to`, `msg`, `date`, `pid`) VALUES ('$from', '$to', '$msg', '$date', '$pid')");
        $ret = $dsql->dsqlOper($sql, 'lastid');
        if(is_numeric($ret)){

            //记录用户行为日志
            memberLog($from, 'member', 'im', $ret, 'insert', '向用户['.$to.']发送聊天消息：' . $msg, '', $sql);

            return self::$langData['siteConfig'][33][11];//对话成功！
        }else{
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][10]);//数据写入失败！
        }

    }


    /**
     * 获取即时聊天对话
     * @author gz
     * @param string $mod      模块
     * @param int    $userid1  会员ID1
     * @param int    $userid2  会员ID2
     * @param int    $page     页码
     * @param int    $pageSize 每页数量
     * @return array
     * @date 2018-07-18
     */
    public function getChatTalk(){
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $langData;
        $param = $this->param;
        $pageinfo = $list  = array();

        if(!is_array($param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $mod      = $param['mod'];
        $userid1  = $param['userid1'];
        $userid2  = $param['userid2'];
        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];

        if(empty($mod)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][6]);//模块名不得为空！
        if(empty($userid1) || empty($userid2)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][12]);//会员ID不得为空！

        $page = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 20 : $pageSize;

        $archives = $dsql->SetQuery("SELECT `from`, `to`, `msg`, `date` FROM `#@__".$mod."_chat` WHERE `pid` != 0 AND ( (`from` = '$userid1' AND `to` = '$userid2') OR (`from` = '$userid2' AND `to` = '$userid1') ) ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]); //暂无数据

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $results = $dsql->dsqlOper($archives." LIMIT $atpage, $pageSize", "results");

        if($results){
            // $user1 = $userLogin->getMemberInfo($userid1);
            // $user2 = $userLogin->getMemberInfo($userid2);
            //
            // $user1 = is_array($user1) ? array(
            //  'userid' => $user1['userid'],
            //  'username' => $user1['username'],
            //  'nickname' => $user1['nickname'],
            //  'photo' => $user1['photo'],
            //  'userType' => $user1['userType'],
            //  'level' => $user1['level'],
            //  'levelName' => $user1['levelName'],
            //  'online' => $user1['online']
            // ) : array();
            //
            // $user2 = is_array($user2) ? array(
            //  'userid' => $user2['userid'],
            //  'username' => $user2['username'],
            //  'nickname' => $user2['nickname'],
            //  'photo' => $user2['photo'],
            //  'userType' => $user2['userType'],
            //  'level' => $user2['level'],
            //  'levelName' => $user2['levelName'],
            //  'online' => $user2['online']
            // ) : array();

            foreach($results as $key=>$row){

                //普通情况直接输出字段内容
                $msg = $row['msg'];

                //APP下输出
                if($param['app']){
                    //文件内容
                    $msg = array(
                        'type' => 'text',
                        'value' => $row['msg']
                    );

                    //附件内容
                    if(strstr($row['msg'], 'src=')){
                        preg_match("/<(.*?)src=\"(.+?)\".*?>/", $row['msg'], $src);

                        if(strstr($row['msg'], '<img')){
                            $type = 'image';
                        }else if(strstr($row['msg'], '<audio')){
                            $type = 'audio';
                        }else if(strstr($row['msg'], '<video')){
                            $type = 'video';
                        }

                        $msg = array(
                            'type' => $type,
                            'value' => $cfg_secureAccess . $cfg_basehost . $src[2]
                        );
                        if($type == 'audio'){
                            preg_match("/<(.*?)data-duration=\"(.+?)\".*?>/", $row['msg'], $duration);
                            $msg['duration'] = $duration[2];
                        }
                    }
                }

                $list[$key] = array(
                    // 'user1' => $row['from'] == $userid1 ? $user1 : $user2,
                    // 'user2' => $row['to'] == $userid1 ? $user1 : $user2,
                    'from' => $row['from'],
                    'to' => $row['to'],
                    'msg' => $msg,
                    'date' => $row['date']
                );
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /*
     * 生成带参数的微信二维码
     * keyword: 微信传图
     */
    public function getWeixinQrCode(){
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登录超时！');

        //引入配置文件
        $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
        if(!file_exists($wechatConfig)) return array("state" => 200, "info" => '请先设置微信开发者信息！');
        require($wechatConfig);

        include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
        $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
        $token = $jssdk->getAccessToken();

        $rand = create_ordernum();

        $url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=$token";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, '{"expire_seconds": 1800, "action_name": "QR_STR_SCENE", "action_info": {"scene": {"scene_str": "微信传图_'.$rand.'"}}}');
        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        $output = curl_exec($ch);
        curl_close($ch);

        if(empty($output)){
            return array("state" => 200, "info" => '请求失败，请稍候重试！');
        }

        $result = json_decode($output, true);
        if($result['errcode']){
            return array("state" => 200, "info" => json_encode($result));
        }else{
            $ticket = $result['ticket'];
            return array(
                'ticket' => $rand,
                'url' => 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' . $ticket
            );
        }

    }


    /*
     * 根据ticket返回已上传图片
     * @param ticket string
     * @return array
     */
    public function getWeixinUpImg(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        $list  = array();

        if(!is_array($param)) return array("state" => 200, "info" => "格式错误！");

        $ticket = $param['ticket'];
        if(empty($ticket)) return array("state" => 200, "info" => '凭证错误！');

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登录超时！');

        $expTime = time() - 28800;  //8个小时以内有效
        $sql = $dsql->SetQuery("SELECT `fid` FROM `#@__site_wxupimg` WHERE `ticket` = '$ticket' AND `time` > $expTime AND `fid` != '' ORDER BY `id` ASC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            foreach ($ret as $key => $value) {
                array_push($list, array('fid' => $value['fid'], 'src' => getFilePath($value['fid'])));
            }
        }

        return $list;
    }


    /*
     * 删除微信传图的指定图片
     * @param ticket string
     * @param fid string
     * @return string
     */
    public function delWeixinUpImg(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        $list  = array();

        if(!is_array($param)) return array("state" => 200, "info" => "格式错误！");

        $ticket = $param['ticket'];
        if(empty($ticket)) return array("state" => 200, "info" => '凭证错误！');

        $fid = $param['fid'];
        if(empty($fid)) return array("state" => 200, "info" => '图片ID错误！');

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => '登录超时！');

        $sql = $dsql->SetQuery("DELETE FROM `#@__site_wxupimg` WHERE `ticket` = '$ticket' AND `fid` = '$fid'");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            delPicFile($fid, "delWxUpImg", "siteConfig");
            return 'success';
        }else{
            return array("state" => 200, "info" => '登录超时！');
        }
    }


    /*
     * 刷新置顶配置
     * @return array
     */
    public function getRefreshTopConfig(){

        // global $installModuleArr;

        $configFile = HUONIAOINC.'/config/refreshTop.inc.php';
        if(file_exists($configFile)){
            require($configFile);

            $arr = array();

            //二手
            // if(in_array('info', $installModuleArr)){
                $arr['info'] = array(
                    'refreshFreeTimes' => (int)$cfg_info_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_info_refreshNormalPrice,
                    'titleBlodlDay' => (int)$cfg_info_titleBlodlDay,
                    'titleBlodlPrice' => (float)$cfg_info_titleBlodlPrice,
                    'titleRedDay' => (int)$cfg_info_titleRedDay,
                    'titleRedPrice' => (float)$cfg_info_titleRedPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_info_refreshNormalPrice, $cfg_info_refreshSmart ? unserialize($cfg_info_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_info_topNormal ? unserialize($cfg_info_topNormal) : array()),
                    'topPlan' => $cfg_info_topPlan ? unserialize($cfg_info_topPlan) : array()
                );
            // }

            //房产
            // if(in_array('house', $installModuleArr)){
                $arr['house'] = array(
                    'refreshFreeTimes' => (int)$cfg_house_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_house_refreshNormalPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_house_refreshNormalPrice, $cfg_house_refreshSmart ? unserialize($cfg_house_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_house_topNormal ? unserialize($cfg_house_topNormal) : array()),
                    'topPlan' => $cfg_house_topPlan ? unserialize($cfg_house_topPlan) : array()
                );
            // }

            //招聘
            // if(in_array('job', $installModuleArr)){
                $arr['job'] = array(
                    'refreshFreeTimes' => (int)$cfg_job_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_job_refreshNormalPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_job_refreshNormalPrice, $cfg_job_refreshSmart ? unserialize($cfg_job_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_job_topNormal ? unserialize($cfg_job_topNormal) : array()),
                    'topPlan' => $cfg_job_topPlan ? unserialize($cfg_job_topPlan) : array(),
                    'deliveryTop'=> $cfg_job_deliveryTop ? unserialize($cfg_job_deliveryTop) : array()
                );
            // }

            //汽车
            // if(in_array('car', $installModuleArr)){
                $arr['car'] = array(
                    'refreshFreeTimes' => (int)$cfg_car_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_car_refreshNormalPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_car_refreshNormalPrice, $cfg_car_refreshSmart ? unserialize($cfg_car_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_car_topNormal ? unserialize($cfg_car_topNormal) : array()),
                    'topPlan' => $cfg_car_topPlan ? unserialize($cfg_car_topPlan) : array()
                );
            // }

            //教育
            // if(in_array('education', $installModuleArr)){
                $arr['education'] = array(
                    'refreshFreeTimes' => (int)$cfg_education_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_education_refreshNormalPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_education_refreshNormalPrice, $cfg_education_refreshSmart ? unserialize($cfg_education_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_education_topNormal ? unserialize($cfg_education_topNormal) : array()),
                    'topPlan' => $cfg_education_topPlan ? unserialize($cfg_education_topPlan) : array()
                );
            // }

            //家政
            // if(in_array('homemaking', $installModuleArr)){
                $arr['homemaking'] = array(
                    'refreshFreeTimes' => (int)$cfg_homemaking_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_homemaking_refreshNormalPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_homemaking_refreshNormalPrice, $cfg_homemaking_refreshSmart ? unserialize($cfg_homemaking_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_homemaking_topNormal ? unserialize($cfg_homemaking_topNormal) : array()),
                    'topPlan' => $cfg_homemaking_topPlan ? unserialize($cfg_homemaking_topPlan) : array()
                );
            // }

            //顺风车
            // if(in_array('sfcar', $installModuleArr)){
                $arr['sfcar'] = array(
                    'refreshFreeTimes' => (int)$cfg_sfcar_refreshFreeTimes,
                    'refreshNormalPrice' => (float)$cfg_sfcar_refreshNormalPrice,
                    'titleBlodlDay' => (int)$cfg_sfcar_titleBlodlDay,
                    'titleBlodlPrice' => (float)$cfg_sfcar_titleBlodlPrice,
                    'titleRedDay' => (int)$cfg_sfcar_titleRedDay,
                    'titleRedPrice' => (float)$cfg_sfcar_titleRedPrice,
                    'refreshSmart' => $this->computeRefreshSmart((float)$cfg_sfcar_refreshNormalPrice, $cfg_sfcar_refreshSmart ? unserialize($cfg_sfcar_refreshSmart) : array()),
                    'topNormal' => $this->computeTopNormal($cfg_sfcar_topNormal ? unserialize($cfg_sfcar_topNormal) : array()),
                    'topPlan' => $cfg_sfcar_topPlan ? unserialize($cfg_sfcar_topPlan) : array()
                );
            // }

            return $arr;

        }else{
            return array("state" => 200, "info" => '请管理员到后台配置刷新置顶费用！');
        }

    }


    //计算智能刷新折扣、单价、优惠
    public function computeRefreshSmart($normal = 0, $arr = array()){
        if($arr){
            foreach ($arr as $key => $value) {
                $times = (int)$value['times'];
                $price = sprintf("%.2f", $value['price']);
                if($times){
                    $discount = $normal ? sprintf("%.1f", ($price / ($normal * $times)) * 10) : 0;
                    $unit = sprintf("%.2f", $price / $times);
                    $offer = sprintf("%.2f", ($normal * $times) - $price);

                    $arr[$key]['times'] = $times;
                    $arr[$key]['day'] = (int)$value['day'];
                    $arr[$key]['price'] = $price;
                    $arr[$key]['discount'] = $discount < 10 && $discount > 0 ? $discount . self::$langData['siteConfig'][34][0] : self::$langData['siteConfig'][34][1];// 折 : 无折扣
                    $arr[$key]['unit'] = $unit;
                    $arr[$key]['offer'] = $offer;
                }
            }
        }
        return $arr;
    }


    //计算普通置顶折扣、优惠
    public function computeTopNormal($arr = array()){
        if($arr){
            $unitPrice = 0;
            foreach ($arr as $key => $value) {
                $day = (int)$value['day'];
                $price = sprintf("%.2f", $value['price']);
                if($day && $price){

                    $arr[$key]['day'] = $day;
                    $arr[$key]['price'] = $price;

                    //取第一条单价
                    if($key == 0){
                        $unitPrice = sprintf("%.2f", $price / $day);
                        $arr[$key]['discount'] = self::$langData['siteConfig'][34][1];//无折扣
                        $arr[$key]['offer'] = sprintf("%.2f", 0);
                    }else{
                        if($unitPrice > 0){
                            $discount = sprintf("%.1f", ($price / ($unitPrice * $day)) * 10);
                            $offer = sprintf("%.2f", ($unitPrice * $day) - $price);
                        }
                        $arr[$key]['discount'] = $discount < 10 && $discount > 0 ? $discount . self::$langData['siteConfig'][34][0] : self::$langData['siteConfig'][34][1];// 折 : 无折扣
                        $arr[$key]['offer'] = $offer;
                    }

                }
            }
        }
        return $arr;
    }


    //根据指定日期和时段，按照计划置顶规则，计算最终费用
    public function computeTopPlanAmount(){
        $param = $this->param;
        $plan = $param['plan'];
        array_unshift($plan, array_pop($plan));
        $data = explode('|', $param['data']);

        $beganDate = $data[0];
        $endDate = $data[1];
        $period = explode(',', $data[2]);

        $diffDays = (int)(diffBetweenTwoDays($beganDate, $endDate) + 1);
        $amount = 0;

        //时间范围内每天的费用
        for ($i = 0; $i < $diffDays; $i++) {
            $began = GetMkTime($beganDate);
            $day = AddDay($began, $i);
            $week = date("w", $day);

            if($period[$week]){
                $amount += $plan[$week][$period[$week]];
            }
        }
        return sprintf("%.2f", $amount);

    }


    /**
     * 信息刷新配置
     * @param module string 模块标识
     * @param act    string 模块二级标识   例：房产的二手房 租房等
     * @return array  具体配置，包括免费次数、普通刷新价格、智能刷新配置、会员当前模块已免费刷新次数
     */
    public function refreshTopConfig(){
        global $dsql;
        global $userLogin;
        $param = $this->param;

        if(!is_array($param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $module = $param['module'];
        $act    = $param['act'];
        $userid = (int)$param['userid'];
        $aid    = (int)$param['aid'];  //信息ID
        $typeid = (int)$param['typeid'];  //分类ID，用于获取分类高级设置

        //如果是分类信息模块，没有typeid时，从信息ID中获取
        if($module == 'info' && $aid && !$typeid){
            $sql = $dsql->SetQuery("SELECT `typeid` FROM `#@__infolist` WHERE `id` = $aid");
            $typeid = (int)$dsql->getOne($sql);
        }

        if(empty($module)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][13]."，module");//参数错误
        // if(empty($act)) return array("state" => 200, "info" => '参数传递错误，act！');

        $uid = $userid ? $userid : $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => self::$langData['siteConfig'][21][121]);//登录超时，请刷新页面重试！

        $refreshTopConfig = $this->getRefreshTopConfig();

        if($refreshTopConfig){

            $moduleConfig = $refreshTopConfig[$module];
            if($moduleConfig){
                $count = 0;

                //计算会员已经免费刷新的次数
                if($module == 'info'){
                    $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__".$module."list` WHERE `userid` = $uid AND `refreshFree` > 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['total'];
                    }

                    if($typeid){
                        $_infoClass = new info($typeid);
                        $_infoConfig = $_infoClass->typeDetail();
                        if($_infoConfig){
                            $_infoConfig = $_infoConfig[0];

                            //关闭刷新
                            if($_infoConfig['refreshSwitch'] == 0){
                                $moduleConfig['refreshNormalPrice'] = 0;
                                $moduleConfig['refreshSmart'] = array();
                            }
                            //自定义
                            elseif($_infoConfig['refreshConfig'] == 1){
                                $moduleConfig['refreshNormalPrice'] = $_infoConfig['refreshNormalPrice'];
                                $moduleConfig['refreshSmart'] = $_infoConfig['refreshSmart'];
                            }

                            //关闭置顶
                            if($_infoConfig['topSwitch'] == 0){
                                $moduleConfig['topNormal'] = array();
                                $moduleConfig['topPlan'] = array();
                            }
                            //自定义
                            elseif($_infoConfig['topConfig'] == 1){
                                $moduleConfig['topNormal'] = $_infoConfig['topNormal'];
                                $moduleConfig['topPlan'] = $_infoConfig['topPlan'];
                            }
                        }
                    }
                }
                if($module == 'house'){

                    $where = ' AND `userid` = ' . $uid;
                    $uid_ = $uid;

                    $ischeck_zjuserMeal = false;
                    $zjuserMeal = array(
                        "iszjuser" => 0,
                        "sys_openmeal" => 0,
                        "meal" => array(),
                    );

                    //查询当前会员是否为中介
                    $sql = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){

                        $meal = $ret[0]['meal'] ? unserialize($ret[0]['meal']) : array();
                        $house = new house();
                        $check = $house->checkZjuserMeal($meal);

                        if($check['state'] != 101){
                            $ischeck_zjuserMeal = true;
                            $zjuserMeal['sys_openmeal'] = 1;
                        }

                        $count = 0;

                        $zjuserMeal['iszjuser'] = 1;
                        $zjuserMeal['meal'] = $meal;
                        $zjuserMeal['meal_check'] = $check;


                        $uid_ = $ret[0]['id'];
                        $where = ' AND `usertype` = 1 AND `userid` = ' . $uid_;
                    }

                    if(!$ischeck_zjuserMeal){
                        $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__".$module."_".$act."` WHERE 1 = 1".$where." AND `refreshFree` > 0");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(is_array($ret)){
                            $count = $ret[0]['total'];
                        }
                    }

                    $moduleConfig['zjuserMeal'] = $zjuserMeal;
                }
                if($module == 'job'){
                    //仅刷新普通简历，计算已使用的次数
                    $sql = $dsql->SetQuery("SELECT `value` 'count' FROM `#@__job_u_common` WHERE `uid` = $uid and `name`='jobFreeRefreshCount'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = (int)$ret[0]['count'];
                    }
                }

                if($module == 'car'){
                    $uid_ = $uid;
                    //查询当前会员是否为顾问
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__car_store` WHERE `userid` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid_ = $ret[0]['id'];
                    }

                    $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__car_list` WHERE `userid` = $uid_ AND `refreshFree` > 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['total'];
                    }
                }

                if($module == 'education'){
                    $uid_ = $uid;
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__education_store` WHERE `userid` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid_ = $ret[0]['id'];
                    }

                    $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__education_courses` WHERE `userid` = $uid_ AND `refreshFree` > 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['total'];
                    }
                }

                if($module == 'homemaking'){
                    $uid_ = $uid;
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $uid_ = $ret[0]['id'];
                    }

                    $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__homemaking_list` WHERE `company` = $uid_ AND `refreshFree` > 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['total'];
                    }
                }
                if ($module == 'sfcar') {
                    $sql = $dsql->SetQuery("SELECT SUM(`refreshFree`) total FROM `#@__".$module."_list` WHERE `userid` = $uid AND `refreshFree` > 0");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(is_array($ret)){
                        $count = $ret[0]['total'];
                    }
                }
                return array('config' => $moduleConfig, 'memberFreeCount' => (int)$count);

            }else{
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][14]);//"请求的模块无配置内容，请确认系统是否安装此模块！\r或者联系网站管理员确认后台是否已经配置刷新置顶功能！"
            }

        }else{
            return array("state" => 200, "info" => self::$langData['siteConfig'][33][15]);//'配置信息错误，请联系管理员检查后台配置！'
        }
    }


    /**
     * 信息免费刷新
     * @param module string 模块标识
     * @param act    string 模块二级标识   例：房产的二手房 租房等
     * @param aid    int 信息ID
     * @return array
     */
    public function freeRefresh(){
        global $dsql;
        global $userLogin;
        $param = $this->param;

        if(!is_array($param)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][0]);    //格式错误！

        $module = $param['module'];
        $act    = $param['act'];
        $aid    = $param['aid'];

        if(empty($module)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][13]."，module");//参数错误
        // if(empty($act)) return array("state" => 200, "info" => '参数传递错误，act！');
        if(empty($aid)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][13]."，aid");//参数错误

        $uid = $userLogin->getMemberID();
        if($uid == -1) return array("state" => 200, "info" => self::$langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        $this->param = array(
            'module' => $module,
            'act' => $act
        );
        $refreshConfig = $this->refreshTopConfig();
        if($refreshConfig['state'] == 200){
            return $refreshConfig;
        }else{
            $rtConfig = $refreshConfig['config'];
            $refreshFreeTimes = $rtConfig['refreshFreeTimes'];  //可免费刷新次数
            $refreshNormalPrice = $rtConfig['refreshNormalPrice'];  //普通刷新价格
            $refreshSmart = $rtConfig['refreshSmart'];  //智能刷新配置
            $memberFreeCount = $refreshConfig['memberFreeCount'];
            $surplusFreeRefresh = (int)($refreshFreeTimes - $memberFreeCount);

            //如果还有免费次数
            if($surplusFreeRefresh > 0){

                $time = GetMkTime(time());

                //更新信息
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."list` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'house'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_".$act."` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'job'){
                    //记录已使用的次数+1【注意新版有多个简历，共同使用免费次数】
                    $sql = $dsql::SetQuery("select `id` from `#@__job_u_common` where `uid`=$uid and `name`='jobFreeRefreshCount'");
                    $hasDefault = (int)$dsql->getOne($sql);
                    if($hasDefault){
                        $sql = $dsql->SetQuery("UPDATE `#@__".$module."_u_common` SET `value` = `value`+1 where `name`='jobFreeRefreshCount' and `uid`=$uid");
                        $ret = $dsql->dsqlOper($sql, "update");
                    }else{
                        $sql = $dsql->SetQuery("INSERT INTO `#@__".$module."_u_common`(`name`,`uid`,`value`) values('jobFreeRefreshCount',$uid,'1')");
                        $ret = $dsql->dsqlOper($sql, "update");
                    }
                    //刷新简历
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_resume` SET `pubdate` = '$time' WHERE `id` = $aid");
                }

                if($module == 'car'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_list` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'education'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_courses` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'homemaking'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_list` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$module."_list` SET `refreshFree` = `refreshFree`+1, `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($ret == 'ok'){
                    // 更新缓存
                    if($module == "house"){
                        checkCache($module."_".$act."_list", $aid);
                        clearCache($module."_".$act."_detail", $aid);
                    }else{
                        checkCache($module."_list", $aid);
                        clearCache($module."_detail", $aid);
                    }
                    return self::$langData['siteConfig'][32][33].$module.($act ? "_".$act : "")."_detail"; //刷新成功;
                }else{
                    return array("state" => 200, "info" => self::$langData['siteConfig'][33][78]);//网络错误，刷新失败！
                }

            }else{
                return array("state" => 200, "info" => self::$langData['siteConfig'][33][16]);//您的免费刷新次数已用完，不再享有免费刷新。
            }
        }


    }
    /**
     * 用户激励红包
     */
    public function encourage()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $param = $this->param;
        $hongbaoPrice    = (float)$param['hbAmount'];
        $addPrice        = (float)$param['addhbAmount'];               //追加金额
        $addCount        = (int)$param['addhbnum'];                  //追加次数
        $hongbaoCount    = (int)$param['hbNum'];
        $desc            = $param['hbMessage'];
        $status          = (int)$param['ftype'];
        $rewardPrice     = (float)$param['share_money'];
        $rewardCount     = (int)$param['hbshareNum'];
        $id              = $param['id'];
        $type            = $param['type'];
        $hbAddshareNum   = (int)$param['hbAddshareNum'];             //分享追加人次
        $readInfo        = $param['readInfo'];             //阅读
        $shareInfo       = $param['shareInfo'];             //分享

        $ordernum = create_ordernum();
        $arr = serialize($param);
        if ($type == 'add'){
            if ($readInfo == '1') {
                $price = sprintf('%.2f',$addPrice);
            }
            if($shareInfo == '1'){
                if($rewardCount){
                    $hbAddshareNum = $rewardCount;
                    $price = sprintf('%.2f',($rewardPrice * $hbAddshareNum));
                }
                $price = sprintf('%.2f',$rewardPrice * $hbAddshareNum);

            }
            if ($readInfo == '1' && $shareInfo == '1') {
                if($rewardCount){
                    $hbAddshareNum = $rewardCount;
                }
                if ($hongbaoPrice) {
                    $addPrice = $hongbaoPrice;
                }

                $price = sprintf('%.2f',$addPrice+ ($rewardPrice * $hbAddshareNum));

            }
        }else{
            if ($readInfo == '1') {
                $price = sprintf('%.2f',$hongbaoPrice);
            }
            if($shareInfo == '1'){
                $price = sprintf('%.2f',($rewardPrice * $rewardCount ));
            }
            if ($readInfo == '1' && $shareInfo == '1') {
                $price = sprintf('%.2f',$hongbaoPrice + ($rewardPrice * $rewardCount ));
            }
        }
        include(HUONIAOROOT . "/include/config/info.inc.php");
        if ((int)$cfg_cost > 0 && $price > 0){
            $price += sprintf("%.2f",$price * ((int)$cfg_cost / 100));
        }
        $archives = $dsql->SetQuery("UPDATE  `#@__infolist`  SET `info` = '$arr' WHERE `id` = '$id'");
        $ret = $dsql->dsqlOper($archives, "update");
        $param = array(
            "userid" => $uid,
            "amount" => $price,
            "balance" => $price,
            "online" => $price,
            "type" => "yonghujili",
            "module" => 'info',
            "class" => '',
            "tab" => 'infolist',
            "aid" => $id,
            "title" =>cn_substrR(strip_tags($title),20),
            "ordernum" => $ordernum
        );
        $order = createPayForm("siteConfig", $ordernum, $price, '', '用户激励',$param,1);
        $timeout = GetMkTime(time()) + 1800;
        if(is_array($order)){
            $order['timeout'] = $timeout;
        }
        return  $order;


    }


    /*
     * 修改口令
     */
    public function  upDesc()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $param = $this->param;
        $id = (int)$param['id'];
        $hbMessage = filterSensitiveWords(addslashes($param['hbMessage']));
        $archives = $dsql->SetQuery("UPDATE  `#@__infolist`  SET `desc` = '$hbMessage' WHERE `id` = '$id' AND `userid` = '$uid'");
        $ret = $dsql->dsqlOper($archives, "update");

        $urlParam = array(
            'service' => 'info',
            'template' => 'detail',
            'id' => $id
        );
        $url = getUrlPath($urlParam);

        //记录用户行为日志
        memberLog($uid, 'info', 'info', $id, 'update', '修改阅读红包口令：' . $hbMessage, $url, $archives);

        return 'ok';

    }


    /**
     * 用户激励支付
     * @return array
     */
    public function payEncourage(){

        global $dsql;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $langData;
        global $userLogin;

        $param =  $this->param;

        //用户信息
        $userid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        //重置表单参数
        $this->param = $param;
        $ordernum   = $param['ordernum'];
        $paytype    = $param['paytype'];
        $useBalance = $param['useBalance'];
        $paypwd     = $param['paypwd'];
        $aid        = $param['aid'];
        $balance    = (float)$param['balance'];
        $module     = $param['module'];
        $orderfinal = (int)$param['orderfinal']; /*个人中心订单预下单 0,发起支付1 */
        $module     = $param['module'];
        $tourl      =  $param['tourl'];
        $amount     =  $param['amount'];
        $final      =  $param['final'];
        $check      = (int)$this->param['check'];
        $totalPrice = 0;
        if ($orderfinal == 1){
            $order = createPayForm("info",  $ordernum, $balance, '', '用户激励',array(),1);  //
            $timeout = GetMkTime(time()) + 1800;
            if(is_array($order)){
                $order['timeout'] = $timeout;
            }
            return  $order;
        }
        $payAmount = 0; // 在线支付金额;

        if(isMobile() && empty($final)){
            $useBalance = 0;
        }
        if ($paytype == 'huoniao_bonus'){
            $useBalance =0;
        }

        $paysql = $dsql->SetQuery("SELECT `amount`,`pubdate`  FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 0");
        $payres = $dsql->dsqlOper($paysql,"results");
        if (is_array($payres) && empty($payres)) return array("state" => 200, "info" => "订单查询失败，请重新提交！");
        $amount = $payres[0]['amount'];  //以数据库中的金额为准

        //验证余额
        if($useBalance && $amount > $userinfo['money']){
            return array("state" => 200, "info" => "余额不足！");
        }

        //验证支付密码
        if($useBalance){
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) {
                return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
            }
        }

        if ($paytype == 'huoniao_bonus'){
            $archives = $dsql->SetQuery(" SELECT `body` FROM `#@__pay_log`  WHERE  `ordernum` = '$ordernum'");
            $bonusmoney = $dsql->dsqlOper($archives, "results");
            $bonusmoney = unserialize($bonusmoney[0]['body']);
            $payAmount = $bonusmoney['amount'];
        }else{
            $payAmount = $amount;
        }

        if($check){
            return 'ok';
        }

        //更新支付日志
        if($useBalance){
            $archives = $dsql->SetQuery("UPDATE `#@__pay_log` SET `paytype` ='$paytype', `state` = 1 WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($archives, "update");
            $payAmount = 0;
        }

        $param = array(
            "userid" => $userid,
            "amount" => $amount,
            "paytype" => $paytype,
            "balance" => $balance,
            "online" => $payAmount,
            "module" => $module,
            "aid"    => $aid,

        );
        if ($payAmount){
            $param = array(
                "userid" => $userid,
                "amount" => sprintf("%.2f",$amount),
                "balance" => 0,
                "online" => sprintf("%.2f",$payAmount),
                "type" => "yonghujili",
                "module" => 'info',
                "class" => '',
                "tab" => 'infolist',
                "aid" => $aid,
                "ordernum" => $ordernum
            );
            $order = createPayForm("siteConfig", $ordernum, $payAmount, $paytype, '用户激励', $param);  //
            // $timeout = GetMkTime(time()) + 1800;
            // $order['timeout'] = $timeout;
            return  $order;
        }else{
            $this->jiliPaySuccess($param);
        }
        $params = array(
            "service"     => "member",
            "type"        => "user",
            "template"    => "manage-info",
        );
        $url         = getUrlPath($params);
        return $url;

    }
    /*
     * 用户激励支付之后
     */
    public function  jiliPaySuccess($param = array()){
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        if(empty($param)){
            $param = $this->param;
        }

        $paytype = $param['paytype'];
        $pid = (int)$param['aid'];
        
        if(!is_array($param)){
            $ordernum = $this->param;
            $archives = $dsql->SetQuery("SELECT `body`,`id`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            if($results){
                $param = unserialize($results[0]['body']);
                $pid   = (int)$results[0]['id'];
                $paytype   = $results[0]['paytype'];

            }else{
                die(self::$langData['siteConfig'][33][17]);//支付订单不存在！
            }
        }
        $userid      = (int)$param['userid'];
        $module      = $param['module'];
        $act         = $param['act'] ? $param['act'] : 'detail';
        $class       = $param['class'];
        $aid         = (int)$param['aid'];
        $amount      = (float)$param['amount'];
        $balance     = (float)$param['balance'];
        $online      = $param['online'];
        $type        = $param['type'];
        $config      = $param['config'];
        $titleblod   = $param['titleblod'];
        $titlered    = $param['titlered'];
        $this->param = $param;
        $time = GetMkTime(time());

        $tab = $module . 'list';
        $field  = '';
//        if($module == 'house'){
//            $tab = $module . '_' . $act;
//            $field = ",`cityid`";
//        }elseif($module == 'job'){
//            $tab = $module . '_post';
//            $field = ",`cityid`";
//        }elseif($module == 'car'){
//            $tab = $module . '_list';
//            $field = ",`cityid`";
//        }elseif($module == 'education'){
//            $tab = $module . '_courses';
//            $field = ",`userid`";
//
//        }elseif($module == 'homemaking'){
//            $tab = $module . '_list';
//            $field = ",`cityid`";
//        }elseif($module == 'sfcar'){
//            $tab = $module . '_list';
//            $field = ",`startaddr`,`endaddr`,`cityid`";
//        }
        $archive = $dsql->SetQuery("SELECT `cityid`,`id`, `title`".$field.",`info` FROM `#@__".$tab."` WHERE `id` = $aid");
        $results = $dsql->dsqlOper($archive, "results");

        if($results){
            $tname = self::$langData['siteConfig'][19][216];// '信息';
            if($module == 'info'){
                $tname = self::$langData['siteConfig'][16][18];//二手信息
            }elseif($module == 'house'){
                if($act == 'sale'){
                    $tname = self::$langData['siteConfig'][19][218];//二手房
                }elseif($act == 'zu'){
                    $tname = self::$langData['siteConfig'][19][219];//租房
                }elseif($act == 'xzl'){
                    $tname = self::$langData['siteConfig'][19][220];//写字楼
                }elseif($act == 'sp'){
                    $tname = self::$langData['siteConfig'][19][221];//商铺
                }elseif($act == 'cf'){
                    $tname = self::$langData['siteConfig'][19][761];//厂房
                }
            }elseif($module == 'job'){
                $tname = self::$langData['siteConfig'][34][6];//招聘职位
            }elseif($module == 'car'){
                $tname = self::$langData['siteConfig'][34][7];//汽车门户
            }elseif($module == 'education'){
                $tname = self::$langData['education'][7][18];//教育课程
            }elseif($module == 'homemaking'){
                $tname = self::$langData['homemaking'][8][26];//教育课程
            }elseif($module == 'sfcar'){
                $tname = self::$langData['sfcar'][0][7];//顺风车
            }
            $cityid = $results[0]['cityid'];
            //保存操作日志
            if($module == "sfcar"){
                $info = $tname.$tit."-".$results[0]['startaddr']."->".$results[0]['endaddr'];
            }else{

                $info = $tname.$tit."-".cn_substrR(strip_tags($results[0]['title']),20);
            }

            $modulenamesql = $dsql->SetQuery("SELECT `title` FROM `#@__site_module` WHERE `name` = '".$module."'");
            $modulenameres = $dsql->dsqlOper($modulenamesql,"results");
            if ($module == 'info'){
            $infoarchive = $dsql->SetQuery("SELECT `id`, `title`,`info`,`desc`,`body` FROM `#@__".$tab."` WHERE `id` = $aid");
            $inforesults = $dsql->dsqlOper($infoarchive, "results");
            $bodytitle      =  cn_substrR(strip_tags($inforesults[0]['body']),20);
            $arr = unserialize($inforesults[0]['info']);
            $desc           = $arr['hbMessage'] ? $arr['hbMessage'] : $inforesults[0]['desc'];
            $addPrice       = $arr['addhbAmount'] ? $arr['addhbAmount'] : 0;                  //追加金额
            $addCount       = $arr['addhbnum'] ? $arr['addhbnum'] : 0;                    //追加次数
            $hongbaoPrice   = $arr['hbAmount'];
            $hongbaoCount   = $arr['hbNum'];
            $status         = $arr['ftype'];
            $share_money    = (float)$arr['share_money'];                  //奖励金额
            $hbshareNum     = (int)$arr['hbshareNum'];                   //奖励次数
            $hbAddshareNum  = $arr['hbAddshareNum'] ? $arr['hbAddshareNum'] : 0 ;                //追加奖励次数
            $readInfo       = $arr['readInfo'];                 //阅读红包
            $shareInfo      = $arr['shareInfo'];                //分享红包
            if ($arr['type'] == 'add'){
                if($hbshareNum){
                    $hbAddshareNum = $hbshareNum;
                }
                if($hongbaoPrice){
                    $addPrice = $hongbaoPrice;
                }
                if ($hongbaoCount){
                    $addCount = $hongbaoCount;
                }
                $archives = $dsql->SetQuery("UPDATE  `#@__infolist` SET `desc` = '$desc',`hongbaoPrice` = `hongbaoPrice` + '$addPrice',`hongbaoCount` =`hongbaoCount`+'$addCount',`rewardCount` = `rewardCount`+'$hbAddshareNum',`rewardPrice` = '$share_money',`readInfo` = '$readInfo', `shareInfo` = '$shareInfo' WHERE `id` = '$aid'");
                $dsql->dsqlOper($archives, "update");

                if ($readInfo == '1') {
                    $price = sprintf('%.2f',$addPrice);
                }
                if($shareInfo == '1'){
                    $price = sprintf('%.2f',($share_money * $hbAddshareNum));
                }
                if ($readInfo == '1' && $shareInfo == '1') {
                    $price = sprintf('%.2f',$addPrice+ ($share_money * $hbAddshareNum));

                }
            }else{
                $archives = $dsql->SetQuery("UPDATE  `#@__infolist`  SET `hongbaoPrice` = '$hongbaoPrice',`hongbaoCount` ='$hongbaoCount',`desc` ='$desc',`status` ='$status',`rewardPrice` = '$share_money' ,`rewardCount` = '$hbshareNum',`hasSetjili` = '1' ,`readInfo` = '$readInfo', `shareInfo` = '$shareInfo' WHERE `id` = '$aid'");
                 $dsql->dsqlOper($archives, "update");
                if ($readInfo == '1') {
                    $price = sprintf('%.2f',$hongbaoPrice);
                }
                if($shareInfo == '1'){
                    $price = sprintf('%.2f',($share_money * $hbshareNum ));
                }
                if ($readInfo == '1' && $shareInfo == '1') {
                    $price = sprintf('%.2f',$hongbaoPrice + ($share_money * $hbshareNum ));
                }
            }

            $urlParam = array(
                'service' => 'info',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);

            //记录用户行为日志
            memberLog($userid, $module, 'jili', 0, 'update', '用户激励('.$module.'=>'.$act.'=>'.$aid.'=>'.$amount.'元)', $url, $archives);

            include(HUONIAOROOT . "/include/config/info.inc.php");
            if ((int)$cfg_cost > 0 || $price > 0){
                 //平台获得多少钱
//                global $paytypee;
//                $paytypee = $paytype;
                $pingtai =  $amount * (float)$cfg_cost / 100 ;
                $pingtai = $pingtai < 0.01 ? 0 : $pingtai;

                
//                $balance = $balance - $pingtai;
                $cityName   =  getSiteCityName($cityid);
                //分站佣金
                $fzFee = cityCommission($cityid,'jili');
                $fztotalAmount_ =  $pingtai * (float)$fzFee / 100 ;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

                $pingtai -= $fztotalAmount_;  //平台收入扣除分站收入

                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");

                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`ctype`,`pid`,`showtype`) VALUES ('$userid', '1', '$price', '$info', '$time','$cityid','$fztotalAmount_','$module',$pingtai,'yonghujili','$pid','1')");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                 substationAmount($lastid,$cityid);
            }
            $modulename = '';
            if($modulenameres){
                $modulename = $modulenameres[0]['title'];
            }
            $title =  $modulename.'-用户激励';
            $paramUser = array(
                "service"  => $module,
                "template" => $module == 'house' ? $act."-detail" : $act,
                "id"       => $aid
            );
            //扣除会员余额
            if($balance && ($paytype == 'money' || $paytype == 'balance')){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$balance' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");
                $urlParam = serialize($paramUser);
                
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`title`,`ordernum`,`ctype`,`urlParam`,`pid`,`balance`) VALUES ('$userid', '0', '$balance', '$info', '$time','$module','$title','$ordernum','yonghujili','$urlParam','$pid','$usermoney')");
                $dsql->dsqlOper($archives, "update");
            }
            if ($shareInfo == '1'){
                    $nametitle = '分享红包';
                }elseif ($readInfo == '1'){
                    $nametitle = '阅读红包';
                }elseif($shareInfo == '1' &&  $readInfo == '1'){
                    $nametitle = '分享红包,阅读红包';
                }
                $cityMoney = getcityMoney($cityid);   //获取分站总收益
                $allincom = getAllincome();             //获取平台今日收益
                $infoname = getModuleTitle(array('name' =>$module));    //获取模块名
                //微信通知
                $param = array(
                    'type'   => "1", // 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
//                            'contentrn'  =>$module.'模块——信息('.$bodytitle.')——'.$nametitle.'——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
                        'contentrn'  => $cityName."分站\r\n".$infoname."模块\r\n".$nametitle."\r\n信息：".$bodytitle."\r\n\r\n获得佣金：".sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                $params = array(
                    'type'   => "2", //给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
//                            'contentrn'  => $module.'模块——信息('.$bodytitle.')——'.$nametitle.'——平台获得佣金:'.$fee.' ——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
                        'contentrn'  => $cityName."分站\r\n".$infoname."模块\r\n".$nametitle."\r\n信息：".$bodytitle."\r\n\r\n平台获得佣金：".sprintf("%.2f", $pingtai)."\r\n分站获得佣金：".sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$allincom"
                    )
                );
                //后台微信通知
                updateAdminNotice($module, "detail",$param);
                updateAdminNotice($module, "detail",$params);
            }

         }

    }

    /**
     * 信息刷新置顶
     * @return array
     */
    public function refreshTop(){
        $param =  $this->param;
        $param_ = $param;

        $type       = $param['type'];
        $module     = $param['module'];
        $act        = $param['act'];
        $paytype    = $param['paytype'];
        $paytype    = $paytype == 'balance' ? 'money' : $paytype;
        $aid        = $param['aid'];
        $useBalance = (int)$param['useBalance'];
        $paypwd     = $param['paypwd'];
        $check      = (int)$this->param['check'];
        $config     = $param['config'];
        $tourl      = $param['tourl'];
        $qr         = (int)$param['qr'];
        $ordernum   = $param['ordernum'];
        $final      = (int)$param['final']; // 最终支付
        $titleblod  = $param['titleblod'] ? $param['titleblod'] : ''; //加粗
        $titlered   = $param['titlered'] ? $param['titlered'] : ''; //加红
        $isMobile = isMobile();

        if(empty($module) || empty($aid)) die(self::$langData['siteConfig'][33][13]);//参数错误

        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if($userid == -1) die($langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        //修复订单异常
        if(!empty($ordernum)){
            //查询是否有订单号，并且状态没有成功
            $archives = $dsql->SetQuery("select `id`,`state`,`body` from `#@__pay_log` WHERE `uid`=$userid and `ordernum` = '$ordernum'");
            $orderDetail = $dsql->getArr($archives);
            if(empty($orderDetail)){
                return array("state"=>200,"info"=>"订单不存在");
            }else{
                if($orderDetail['state']==1){
                    return self::$langData['siteConfig'][16][55];  //支付成功
                // }elseif($orderDetail['state']!=0){
                //     return array("state"=>200,"info"=>"订单状态异常，不可支付");
                }else{
                    //从订单里取config等数据，不要前端传递的值
                    $orderBody = unserialize($orderDetail['body']);
                    $config = $orderBody['config'];
                    $type = $orderBody['class'];
                    $module = $orderBody['module'];
                    $act = $orderBody['act'];
                    $aid = $orderBody['aid'];
                }
            }
        }

        if(!$isMobile && $type=="refresh"){
            $param_['act'] = "post";
        }

        //判断是否经纪人
        $check_zjuser = false;
        if($module == "house"){
            $sql = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $zjuid = $ret[0]['id'];
                $meal = $ret[0]['meal'] ? unserialize($ret[0]['meal']) : array();
                $house = new house();
                $mealCheck = $house->checkZjuserMeal($meal);
                if($mealCheck['state'] == 200){
                    return $mealCheck;

                }elseif($mealCheck['state'] == 100){
                    $check_zjuser = true;
                }
            }
        }
        //用户信息
        $userinfo = $userLogin->getMemberInfo();

        $this->param = $param;
        $refreshConfig = $this->refreshTopConfig();
        if($refreshConfig['state'] == 200){
            die($refreshConfig['info']);
        }else{
            $rtConfig = $refreshConfig['config'];
            $refreshFreeTimes = $rtConfig['refreshFreeTimes'];  //可免费刷新次数
            $refreshNormalPrice = $rtConfig['refreshNormalPrice'];  //普通刷新价格
            $refreshSmart = $rtConfig['refreshSmart'];  //智能刷新配置
            $topNormal = $rtConfig['topNormal'];  //普通置顶配置
            $topPlan = $rtConfig['topPlan'];  //计划置顶配置
            $deliveryTop = $rtConfig['deliveryTop'] ?? array(); //投递置顶、仅job

            $titleBlodlDay   = $rtConfig['titleBlodlDay'];  //标题加粗时长
            $titleBlodlPrice = $rtConfig['titleBlodlPrice'];  //标题加粗价格
            $titleRedDay     = $rtConfig['titleRedDay'];  //标题加红时长
            $titleRedPrice   = $rtConfig['titleRedPrice'];  //标题加红价格

            $memberFreeCount = $refreshConfig['memberFreeCount'];
            $surplusFreeRefresh = (int)($refreshFreeTimes - $memberFreeCount);
        }

        $tit = '';

        $need_times = 0;    // 经纪人操作 需要消耗的次数/天数

        //普通刷新
        if($type == 'refresh'){
            $amount = $refreshNormalPrice;
            $tit = self::$langData['siteConfig'][32][29];//普通刷新

            $need_times = 1;

            //智能刷新
        }elseif($type == 'smartRefresh'){
            $config = (int)$config;
            $amount = $refreshSmart[$config]['price'];
            $tit = self::$langData['siteConfig'][32][28];//智能刷新

            $need_times = $refreshSmart[$config]['times'];

            if(!$need_times) return array("state"=>200,"info"=>"选择的次数不存在");

            //普通置顶
        }elseif($type == 'topping'){
            /*不是经纪人套餐才转整型*/
            if ($check_zjuser!=1) {
                $config = (int)$config;
            }
            $amount = $topNormal[$config]['price'];
            $tit = self::$langData['siteConfig'][32][38];//立即置顶

            $need_times = $topNormal[$config]['day'];


            /*这里判断是不是经纪人用于计算经纪人套餐*/
            if($check_zjuser ==1){
                $configArr = explode('|', $config);
                $tp_beg = strtotime($configArr[0]);
                $tp_end = strtotime($configArr[1]);

                $tp_day = (($tp_end - $tp_beg) / 86400);
                if($tp_beg==$tp_end){
                    $tp_day = 1;
                }
                // $need_times = $tp_day +1;
                $need_times = $tp_day;
            }

            //计划置顶
        }elseif($type == 'toppingPlan'){
            $this->param = array('plan' => $topPlan, 'data' => $config);
            $amount = $this->computeTopPlanAmount();
            $tit = self::$langData['siteConfig'][32][39];//计划置顶

            $data = explode('|', $config);

            $beganDate = $data[0];
            $endDate = $data[1];
            $period = explode(',', $data[2]);

            $diffDays = (int)(diffBetweenTwoDays($beganDate, $endDate) + 1);
            $need_times = $diffDays;

        }elseif($type=="deliveryTop"){
            //根据选中的套餐，生成订单
            if(!isset($deliveryTop[$config])){
                return array("state"=>200,"info"=>"配置不存在");
            }
            $tit = $deliveryTop[$config]['title'];
            $amount = $deliveryTop[$config]['price'];
        }
        //标题加粗加红
        if(!empty($type) && $type == 'boldred'){
            if(!empty($titleblod) && $titleblod == 'titleblod'){
                $amount = $titleBlodlPrice;
                $tit = $langData['info'][1][56];//标题加粗
            }

            if(!empty($titlered) && $titlered == 'titlered'){
                $amount += $titleRedPrice;
                $tit .= $langData['info'][1][57];//标题加红
            }

        }elseif(!empty($type) && $type != 'boldred'){
            if(!empty($titleblod) && $titleblod == 'titleblod'){
                $amount += $titleBlodlPrice;
                $tit = $langData['info'][1][56];//标题加粗
            }

            if(!empty($titlered) && $titlered == 'titlered'){
                $amount += $titleRedPrice;
                $tit .= $langData['info'][1][57];//标题加红
            }
        }

        $balance = 0;   // 使用余额
        $payAmount = 0; // 在线支付金额;

        if($isMobile && empty($final)){
            $useBalance = 0;
        }
        // 使用余额
        if($useBalance){

            //验证余额
            if($amount > $userinfo['money']){
                return array("state" => 200, "info" => "余额不足！");
            }

            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) {
                return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
            }
            
            if($amount <= $userinfo['money']){
                $payAmount = 0;
            }else{
                $payAmount = $amount - $userinfo['money'];
            }
            $balance = $amount - $payAmount;

        }else{
            $payAmount = $amount;
        }
        
        $payAmount = (float)$payAmount;

        if($check){
            return 'ok';
        }

        $param = array(
            "userid" => $userid,
            "amount" => $amount,
            "balance" => $balance,
            "online" => $payAmount,
            "type" => "refreshTop",
            "module" => $module,
            "act" => $act,
            "class" => $type,
            "aid" => $aid,
            "config" => $config,
            "titleblod" => $titleblod,
            "titlered" => $titlered
        );

        if($module == 'job'){
            $param['url'] = 'stay';
        }

        if($check_zjuser){

            if(stripos($type, "refresh") !== false){
                $has_times = $meal['refresh'];
                $tit_ = self::$langData['siteConfig'][34][3];//刷新次数
                $type_ = "refresh";
            }elseif(stripos($type, "topping") !== false){
                $has_times = $meal['settop'];
                $type_ = "settop";
                $tit_ = self::$langData['siteConfig'][34][4];//置顶天数
            }
            if($has_times < $need_times){
                return array("state" => 200, "info" => self::$langData['siteConfig'][20][603].$tit_.self::$langData['siteConfig'][34][2]);//"剩余".$tit_."不足"
            }


        }
        
        // 非经纪人或者后台没有配置经纪人套餐时 实际支付金额大于0
        if(!$check_zjuser && ($payAmount || $qr) ){
            $ordernum = $ordernum ? $ordernum : create_ordernum();
//            $param['type'] = 'refreshTop';
//
//            if($isMobile && empty($final)){
//                $param_['ordernum'] = $ordernum;

//                $param_['ordertype'] = 'refreshTop';
//                $param = array(
//                    "service" => "member",
//                    "type" => "user",
//                    "template" => "pay",
//                    "param" => http_build_query($param_)
//                );
//                header("location:".getUrlPath($param));
//                die;
//            }elseif(!$isMobile && empty($final)){
//                $param_['ordernum'] = $ordernum;
//                $param_['ordertype'] = 'refreshTop';
//                $param = array(
//                    "service"   => "member",
//                    "type"      => "user",
//                    "template"  => "pay",
//                    "param"     => http_build_query($param_)
//                );
//                header("location:".getUrlPath($param));
//                die;
//            }
            if ($final != 1 && $paytype!='huoniao_bonus'){

                $order =  createPayForm("siteConfig", $ordernum, $payAmount, $paytype, $tit, $param,1);  //会员发布信息

                if(is_array($order)){
                    $timeout = GetMkTime(time()) + 3600;
                    $order['timeout'] = $timeout;
                }
                return $order;
            }


//            $param['type'] = 'refreshTop';
//
//            if($isMobile && empty($final)){
//                $param_['ordernum'] = $ordernum;
//                $param_['ordertype'] = 'refreshTop';
//                $param = array(
//                    "service" => "member",
//                    "type" => "user",
//                    "template" => "pay",
//                    "param" => http_build_query($param_)
//                );
//                header("location:".getUrlPath($param));
//                die;
//            }elseif(!$isMobile && empty($final)){
//                $param_['ordernum'] = $ordernum;
//                $param_['ordertype'] = 'refreshTop';
//                $param = array(
//                    "service"   => "member",
//                    "type"      => "user",
//                    "template"  => "pay",
//                    "param"     => http_build_query($param_)
//                );
//                header("location:".getUrlPath($param));
//                die;
//            }
//           return createPayForm("tuan", $ordernum, $payTotalAmount, $paytype, "团购订单");
            $order = createPayForm("siteConfig", $ordernum, $payAmount, $paytype, $tit, $param);  //会员发布信息

            if(is_array($order)){
                $timeout = GetMkTime(time()) + 3600;
                $order['timeout'] = $timeout;
            }
            return $order;

        }else{
            if($check_zjuser){
                $param['amount'] = 0;
                $param['balance'] = 0;
                $param['online'] = 0;
                $param['check_zjuser'] = 1;
            }

            //成功之后增加消费操作日志
            $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `paytype` ='$paytype', `state` = 1 WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($archives, "update");

            $this->refreshTopSuccess($param);

            // 更新套餐余量
            if($check_zjuser){
                $dopost = $type_ . ":" . $need_times;
                $house = new house();
                $house->updateZjuserMeal($zjuid, $dopost, $meal);

                return self::$langData['siteConfig'][20][244];//"操作成功";
            }

            if($tourl){
//                header("location:".$tourl);

                if(!$isMobile){

                    echo  json_encode(array('state' =>100,'info'=>$tourl));die;
                }else{
                    return $tourl;
                }

            }else{
                return self::$langData['siteConfig'][16][55];  //支付成功
            }

        }


    }

    /**
     * 刷新置顶支付成功
     * 安全考虑，接口调用传支付的ordernum，内部使用直接传array
     */
    public function refreshTopSuccess($param = array()){
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        if(empty($param)){
            $param = $this->param;
        }

        if(!is_array($param)){
            $ordernum = $this->param;
            $archives = $dsql->SetQuery("SELECT `body`,`id`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            if($results){
                $param = unserialize($results[0]['body']);
                $pid   = $results[0]['id'];
                $paytype   = $results[0]['paytype'];
            }else{
                die(self::$langData['siteConfig'][33][17]);//支付订单不存在！
            }
        }
        $userid      = $param['userid'];
        $module      = $param['module'];
        $act         = $param['act'];
        $class       = $param['class'];
        $aid         = $param['aid'];
        $amount      = $param['amount'];
        $balance     = $param['balance'];
        $online      = $param['online'];
        $type        = $param['type'];
        $config      = $param['config'];
        $titleblod   = $param['titleblod'];
        $titlered    = $param['titlered'];
        $pid = (int)$pid;

        // var_dump($param);die;
        $check_zjuser = $param['check_zjuser'];

        $this->param = $param;
        $refreshConfig = $this->refreshTopConfig();
        if($refreshConfig['state'] == 200){
            die($refreshConfig['info']);
        }else{
            $rtConfig = $refreshConfig['config'];
            $refreshFreeTimes = $rtConfig['refreshFreeTimes'];  //可免费刷新次数
            $refreshNormalPrice = $rtConfig['refreshNormalPrice'];  //普通刷新价格
            $refreshSmart = $rtConfig['refreshSmart'];  //智能刷新配置
            $topNormal = $rtConfig['topNormal'];  //智能刷新配置
            $topPlan = $rtConfig['topPlan'];  //智能刷新配置
            $deliveryTop = $rtConfig['deliveryTop'] ?? array(); //投递置顶、仅job

            $titleBlodlDay   = $rtConfig['titleBlodlDay'];  //标题加粗时长
            $titleBlodlPrice = $rtConfig['titleBlodlPrice'];  //标题加粗价格
            $titleRedDay     = $rtConfig['titleRedDay'];  //标题加红时长
            $titleRedPrice   = $rtConfig['titleRedPrice'];  //标题加红价格

            $memberFreeCount = $refreshConfig['memberFreeCount'];
            $surplusFreeRefresh = (int)($refreshFreeTimes - $memberFreeCount);
        }

        $time = GetMkTime(time());

        $tab = $module . 'list';
        $field  = '';
        $stitle = ",`title`";
        if($module == 'house'){
            $tab = $module . '_' . $act;
            $field = ",`cityid`";
        }elseif($module == 'job'){
            $tab = $module . '_resume';
            $stitle = ",`alias` as 'title'";
            $field = ",`cityid`";
        }elseif($module == 'car'){
            $tab = $module . '_list';
            $field = ",`cityid`";
        }elseif($module == 'education'){
            $tab = $module . '_courses';
            $field = ",`userid`";

        }elseif($module == 'homemaking'){
            $tab = $module . '_list';
            $field = ",`cityid`";
        }elseif($module == 'sfcar'){
            $tab = $module . '_list';
            $field = ",`startaddr`,`endaddr`,`cityid`";
        }

        //教育
        if($tab == 'education_courses'){
            $archive = $dsql->SetQuery("SELECT `id`".$stitle.$field." FROM `#@__".$tab."` WHERE `id` = $aid");
        }else{
            $archive = $dsql->SetQuery("SELECT `cityid`,`id`".$stitle.$field." FROM `#@__".$tab."` WHERE `id` = $aid");
        }
        $results = $dsql->dsqlOper($archive, "results");
        if($results){

            if($tab == 'education_courses'){
                $_uinfo = $userLogin->getMemberInfo($userid);
                $results[0]['cityid'] = (int)$_uinfo['cityid'];
            }

            //获取智能刷新的配置信息
            if($class == 'smartRefresh'){
                $config = (int)$config;
                $smartData = $refreshSmart[$config];
                if($smartData){
                    $sr_day = $smartData['day'];
                    $sr_discount = $smartData['discount'];
                    $sr_offer = $smartData['offer'];
                    $sr_price = $smartData['price'];
                    $sr_times = $smartData['times'];
                    $sr_unit = $smartData['unit'];
                }
            }

            //普通置顶信息
            if($class == 'topping'){
                if($check_zjuser !=1){
                    $config = (int)$config;
                }
                $topData = $topNormal[$config];
                if($topData){
                    $tp_day = $topData['day'];
                    $tp_price = $topData['price'];
                    $tp_discount = $topData['discount'];
                    $tp_offer = $topData['offer'];
                }
            }

            //计划置顶信息
            if($class == 'toppingPlan'){
                $configArr = explode('|', $config);
                $tp_beganDate = $configArr[0];
                $tp_endDate = $configArr[1];
                $period = explode(',', $configArr[2]);

                $diffDays = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
                $tp_planArr = array();
                $tp_week = array();

                $weekArr = self::$langData['siteConfig'][34][5];

                //时间范围内每天的明细
                for ($i = 0; $i < $diffDays; $i++) {
                    $began = GetMkTime($tp_beganDate);
                    $day = AddDay($began, $i);
                    $week = date("w", $day);

                    if($period[$week]){
                        array_push($tp_planArr, date('Y-m-d', $day) . " " . $weekArr[$week] . " " . ($period[$week] == 'all' ? '全天' : '早8点-晚8点'));
                        array_push($tp_week, array(
                            'week' => $week,
                            'type' => $period[$week]
                        ));
                    }
                }

                $this->param = array('plan' => $topPlan, 'data' => $config);
                $tp_amount = $this->computeTopPlanAmount();
            }

            $tit = $ctype = '';
            if($class == 'refresh'){
                $tit = self::$langData['siteConfig'][16][70];//刷新
                $ctype = 'shuaxin';
            }elseif($class == 'smartRefresh'){
                $tit = self::$langData['siteConfig'][32][28] . $sr_day . self::$langData['siteConfig'][13][6] . $sr_times . '次';//'智能刷新' . $sr_day . '天' . $sr_times . '次';
                $ctype = 'shuaxin';
            }elseif($class == 'topping'){
                $tit = self::$langData['siteConfig'][19][762] . $tp_day . self::$langData['siteConfig'][13][6];//'置顶' . $tp_day . '天';
                $ctype = 'zhiding';
            }elseif($class == 'toppingPlan'){
                $tit = self::$langData['siteConfig'][32][39] . '：' . join('、', $tp_planArr);//计划置顶：
                $ctype = 'zhiding';
            }
            //标题加粗加红
            $field = '';
            if($titleblod == 'titleblod'){
                $tit = $tit . '-' . $langData['info'][1][56];
                $titleBlodDay = AddDay($time, $titleBlodlDay);
                $field = " ,`titleBlod` = 1, `titleBlodDay` = '$titleBlodDay'";
                $ctype = 'jiacu';
            }
            if($titlered == 'titlered'){
                $tit = $tit . '-' . $langData['info'][1][57];
                $titleRedDay = AddDay($time, $titleRedDay);
                $field .= " ,`titleRed` = 1, `titleRedDay` = '$titleRedDay'";
                $ctype = 'jiahong';
            }

            $tname = self::$langData['siteConfig'][19][216];// '信息';
            if($module == 'info'){
                $tname = getModuleTitle(array('name' => $module));//二手信息
            }elseif($module == 'house'){
                if($act == 'sale'){
                    $tname = self::$langData['siteConfig'][19][218];//二手房
                }elseif($act == 'zu'){
                    $tname = self::$langData['siteConfig'][19][219];//租房
                }elseif($act == 'xzl'){
                    $tname = self::$langData['siteConfig'][19][220];//写字楼
                }elseif($act == 'sp'){
                    $tname = self::$langData['siteConfig'][19][221];//商铺
                }elseif($act == 'cf'){
                    $tname = self::$langData['siteConfig'][19][761];//厂房
                }
            }elseif($module == 'job'){
                if($act == "deliveryTop"){
                    $tname == "投递置顶";
                }else{
                    $tname = self::$langData['siteConfig'][19][895];//招聘简历
                }
            }elseif($module == 'car'){
                $tname = getModuleTitle(array('name' => $module));//汽车门户
            }elseif($module == 'education'){
                $tname = self::$langData['education'][7][18];//教育课程
            }elseif($module == 'homemaking'){
                $tname = self::$langData['homemaking'][8][26];//家政服务
            }elseif($module == 'sfcar'){
                $tname = getModuleTitle(array('name' => $module));//顺风车
            }

            if($check_zjuser){
                $amount = 0;
                $balance = 0;
                $tp_price = 0;
                $tp_amount = 0;

                if($check_zjuser){
                    $configArr = explode('|', $config);
                    $tp_beg = strtotime($configArr[0]);
                    $tp_end = strtotime($configArr[1]);

                    $tp_day = (($tp_end - $tp_beg) / 86400) +1;
                    if($tp_beg==$tp_end){
                        $tp_day = 1;
                    }
                }
            }


            //刷新业务
            if($class == 'refresh'){

                //更新信息
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'house'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'job'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'car'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'education'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'homemaking'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                //智能刷新
                //先进行一次刷新，然后更新信息，并查询需要更新的总次数，刷新时长，刷新价格，开始刷新时间，下次刷新时间，刷新剩余次数
            }elseif($class == 'smartRefresh'){

                //下次刷新时间
                $nextRefreshTime = $time + (int)(24/($sr_times/$sr_day)) * 3600;
                $refreshSurplus = $sr_times - 1;

                //更新信息
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' $field WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'house'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'job'){
                    //招聘智能刷新
                    $resumeLastEnd = $dsql->getArr($dsql::SetQuery("select `bid_end` from `#@__".$tab."` where `id`=$aid and `refreshSurplus`>0"));
                    if(is_array($resumeLastEnd) && !empty($resumeLastEnd)){  //叠加时，不会立刻刷新一次
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = `refreshCount`+$sr_times, `refreshTimes` = `refreshTimes`+$sr_day, `refreshPrice` = `refreshPrice`+'$sr_price', `refreshSurplus` = `refreshSurplus`+$refreshSurplus+1 WHERE `id` = $aid");
                    }else{
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    }
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'car'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'education'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'homemaking'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refreshSmart` = 1, `refreshCount` = '$sr_times', `refreshTimes` = '$sr_day', `refreshPrice` = '$sr_price', `refreshBegan` = '$time', `refreshNext` = '$nextRefreshTime', `refreshSurplus` = '$refreshSurplus', `pubdate` = '$time' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                //普通置顶
                //这里使用了最开始的竞价字段
            }elseif($class == 'topping'){


                $bid_end = AddDay($time, $tp_day);

                //更新信息
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' $field WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'house'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'job'){
                    //招聘置顶资源叠加
                    $resumeLastEnd = $dsql->getOne($dsql::SetQuery("select `bid_end` from `#@__".$tab."` where `id`=$aid and `bid_type` = 'normal'"));
                    if($resumeLastEnd>=time()){
                        //累加计算
                        $bid_end = AddDay($resumeLastEnd, $tp_day);
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `bid_price` =`bid_price`+$tp_price, `bid_end` = '$bid_end' WHERE `id` = $aid");
                    }
                    else{
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    }
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'car'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'education'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'homemaking'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'normal', `bid_price` = '$tp_price', `bid_start` = '$time', `bid_end` = '$bid_end' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                //计划置顶
            }elseif($class == 'toppingPlan'){

                $tp_beganDate = GetMkTime($tp_beganDate);
                $tp_endDate = GetMkTime($tp_endDate)+86400;

                $tp_weekSet = array();
                foreach ($tp_week as $key => $value) {
                    array_push($tp_weekSet, "`bid_week".$value["week"]."` = '".$value['type']."'");
                }
                $tp_weekUpdate = ', ' . join(', ', $tp_weekSet);

                //更新信息
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'house'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'job'){
                    //招聘置顶资源叠加
                    $resumeLastEnd = $dsql->getOne($dsql::SetQuery("select `bid_end` from `#@__".$tab."` where `id`=$aid and `bid_type` = 'plan'"));
                    if($resumeLastEnd>=time()){
                        $bid_end = AddDay($resumeLastEnd, $tp_day);
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `bid_price` =`bid_price`+$tp_amount, `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    }else{
                        $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    }
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'car'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                if($module == 'education'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'homemaking'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `isbid` = 1, `bid_type` = 'plan', `bid_price` = '$tp_amount', `bid_start` = '$tp_beganDate', `bid_end` = '$tp_endDate'".$tp_weekUpdate." WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }

                //标题加粗加红
            }elseif($class == 'boldred'){
                //更新信息
                $titleBlod = 0;
                $titleBlodDay = 0;
                if($titleblod == 'titleblod'){
                    $titleBlodDay = AddDay($time, $titleBlodlDay);
                    $titleBlod = 1;
                }
                $titleRed = 0;
                $titleRedDay = 0;
                if($titlered == 'titlered'){
                    $titleRedDay = AddDay($time, $titleRedDay);
                    $titleRed    = 1;
                }
                if($module == 'info'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `titleBlod` = '$titleBlod', `titleBlodDay` = '$titleBlodDay', `titleRed` = '$titleRed', `titleRedDay` = '$titleRedDay' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
                if($module == 'sfcar'){
                    $sql = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `titleBlod` = '$titleBlod', `titleBlodDay` = '$titleBlodDay', `titleRed` = '$titleRed', `titleRedDay` = '$titleRedDay' WHERE `id` = $aid");
                    $ret = $dsql->dsqlOper($sql, "update");
                }
            }elseif($class=="deliveryTop"){
                $newCount = (int)$deliveryTop[$config]['count'];  //增加多少次
                //是否已存在
                $sql = $dsql::SetQuery("select `id`,`value` from `#@__job_u_common` where `uid`=".$userid);
                $exist = $dsql->getArr($sql);
                if(empty($exist)){
                    $sql = $dsql::SetQuery("insert into `#@__job_u_common`(`name`,`value`,`uid`) values('jobDeliveryTopCount','$newCount',$userid)");
                    $dsql->update($sql);
                }else{
                    $newCount = $newCount + $exist['value'];
                    $sql = $dsql::SetQuery("update `#@__job_u_common` set `value`='$newCount' where `id`=".$exist['id']);
                    $dsql->update($sql);
                }
            }

            //记录用户行为日志
            memberLog($userid, 'member', 'refreshTop', 0, 'update', '刷新置顶信息('.$class.'=>'.$module.'=>'.$act.'=>'.$aid.'=>'.$amount.'元)', '', $sql);

            // 清除缓存
            clearCache($module."_list", "key");
            clearCache($module."_detail", $aid);


            //保存操作日志
            $_ordernum = create_ordernum();

            if($module == "sfcar"){
                $_title1 = $results[0]['startaddr']."->".$results[0]['endaddr'];
                $info = $tname.$tit."-".$_title1;
            }else{
                $_title1 = cn_substrR(strip_tags($results[0]['title']),20);
                $info = $tname.$tit."，订单号：".$_ordernum . '，信息：' . $_title1;
            }

            $modulename = getModuleTitle(array('name' => $module));
            $title =  $modulename.'-刷新置顶';

            $paramUser = array(
                "service"  => $module,
                "template" => $module == 'house' ? $act."-detail" : $act,
                "id"       => $aid
            );
            $urlParam = serialize($paramUser);

            $user  = $userLogin->getMemberInfo($userid);

            //扣除会员余额
            if($balance){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$balance' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");

                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`title`,`ordernum`,`ctype`,`urlParam`,`pid`,`balance`) VALUES ('$userid', '0', '$balance', '$info', '$time','$module','$title','$_ordernum','$ctype','$urlParam','$pid','$usermoney')");
                $dsql->dsqlOper($archives, "update");
            }
            global  $paytypee;
            $paytypee = $paytype;

            //分销，先进行分销，再进行结算，分销商优先级高于分站和平台收入
            include HUONIAOINC."/config/refreshTop.inc.php";
            include HUONIAOINC."/config/fenxiaoConfig.inc.php";
            $fenXiao = (int)$customfenXiao;
            $foof = (int)$cfg_rooffenxiaoAmount;

            $fxtotalAmount_ =  $amount * $foof / 100 ;
            $fxtotalAmount_ = $fxtotalAmount_ < 0.01 ? 0 : $fxtotalAmount_;

            //分佣 开关
            $fenxiaoTotalPrice = 0;
            $paramarr['amount'] = $fxtotalAmount_;
            if($fenXiao ==1){
                (new member())->returnFxMoney("refreshTop", $userid, $_ordernum,$paramarr, 0, $module);

                $_title = '刷新置顶，订单号：' . $_ordernum;
                //查询一共分销了多少佣金
                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= '$module'");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
            }


            //结算金额减去分销掉的金额
            $amount -= $fenxiaoTotalPrice;


            $cityid  = $results[0]['cityid'];    //调取本条信息的cityid
            $cityName = getSiteCityName($cityid);

            //分站佣金
            global $cfg_roofFee;
            $fzFee = cityCommission($cityid, 'roof');
            $fztotalAmount_ =  $amount * (float)$fzFee / 100 ;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

            //更新分站余额
            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");


            if($check_zjuser){
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
//                $money    = sprintf('%.2f',($usermoney-$amount));
                $info  = self::$langData['siteConfig'][34][8]."：".$info;//使用经纪人套餐
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$userid', '0', '$amount', '$info', '$time','$module','$ctype','$pid','$title','$ordernum','$urlParam','$usermoney')");
                $dsql->dsqlOper($archives, "update");
            }else{
                $amount_ = sprintf('%.2f',($amount - $fztotalAmount_));
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`ctype`,`pid`,`showtype`,`balance`) VALUES ('$userid', '1', '$amount', '$info', '$time','$cityid','$fztotalAmount_','$module',$amount_,'$ctype','$pid','1','0')");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);
            }

            $archives = $dsql->SetQuery("SELECT `param_data`FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            $uns = unserialize($results[0]['param_data']);
            $uns['subject'] = $info;
            $param_pay_data = serialize($uns);
            $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `param_data` = '$param_pay_data' WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $dsql->dsqlOper($archives, "update");

            $cityMoney = getcityMoney($cityid);   //获取分站总收益
            $allincom = getAllincome();             //获取平台今日收益

            //微信通知
            $param = array(
                'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
//                    'contentrn'  => $cityName.'分站——'.$tname.$tit.'获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                    'contentrn'  => $cityName."分站\r\n".$modulename.$tit."\r\n用户：".$user['nickname']."\r\n信息：".$_title1."\r\n\r\n获得佣金：".sprintf("%.2f", $fztotalAmount_),
                    'date' => date("Y-m-d H:i:s", time()),
                    'status' => "今日总收入：$cityMoney"
                )
            );

            $params = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
//                    'contentrn'  => $cityName.'分站——'.$tname.$tit.'——平台获得佣金 :'.$balance.' 元——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                    'contentrn'  => $cityName."分站 \r\n".$modulename.$tit."\r\n用户：".$user['nickname']."\r\n信息：".$_title1."\r\n\r\n平台获得佣金:".$amount_."\r\n分站获得佣金: ".sprintf("%.2f", $fztotalAmount_),
                    'date' => date("Y-m-d H:i:s", time()),
                    'status' => "今日总收入：$allincom"
                )
            );
            //后台微信通知
            updateAdminNotice($module, "detail",$param);
            updateAdminNotice($module, "detail",$params);
        }

    }

    /**
     * 获取商圈
     */
    public function getCircle(){
        global $dsql;

        $param = $this->param;
        $cid = (int)$param['cid'];
        $qid = (int)$param['qid'];

        $where = "";
        if($cid){
            $where .= " AND `cid` = $cid";
        }
        if($qid){
            $where .= " AND `qid` = $qid";
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE 1 = 1".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return $ret;
        }
    }

    // 114便民查询地图周边POI
    public function get114ConveniencePoiList(){
        global $cfg_map;
        global $site_map_key;
        global $cfg_map_baidu_server;
        global $cfg_map_amap_server;
        global $cfg_map_google;
        global $cfg_map_tmap_server;

        $lat = $this->param['lat'];
        $lng = $this->param['lng'];
        $directory = $this->param['directory'];
        $pageSize = (int)$this->param['pageSize'];
        $page = (int)$this->param['page'];
        $radius = (int)$this->param['radius'];
        $pagetoken = $this->param['pagetoken'];

        $pageSize = $pageSize ? $pageSize : 10;
        $radius = $radius ? $radius : 5000;

        if(empty($lat) || empty($lng) || empty($directory)){
            return array("state" => 200, "info" => '参数错误！');
        }

        //百度地图
        if($cfg_map == 2) {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'http://api.map.baidu.com/place/v2/search?query=' . $directory . '&scope=2&location=' . $lat . ',' . $lng . '&radius=' . $radius . '&page_num=' . $page . '&page_size=' . $pageSize . '&output=json&ak=' . $cfg_map_baidu_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);

            if ($data['status'] == 0 && $data['message'] == 'ok') {
                $total = $data['total'];
                $totalPage = ceil($total / $pageSize);
                $results = $data['results'];

                $list = array();
                foreach ($results as $key => $value) {
                    array_push($list, array(
                        'name' => $value['name'],
                        'lat' => $value['location']['lat'],
                        'lng' => $value['location']['lng'],
                        'address' => $value['address'],
                        'tel' => $value['telephone'],
                        'url' => getUrlPath(array(
                            'service' => 'siteConfig',
                            'template' => '114_detail',
                            'param' => 'name=' . urlencode($value['name']) . '&lat=' . $value['location']['lat'] . '&lng=' . $value['location']['lng'] . '&address=' . urlencode($value['address']) . '&tel=' . $value['telephone']
                        ))
                    ));
                }

                return array(
                    'totalCount' => $total,
                    'totalPage' => $totalPage,
                    'list' => $list
                );
            } else {
                return array("state" => 200, "info" => $data['message']);
            }

            //高德
        }elseif($cfg_map == 4){
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://restapi.amap.com/v3/place/around?key='. $cfg_map_amap_server .'&location=' . $lat . ',' . $lng . '&keywords=' . $directory . '&types=&radius=' . $radius . '&offset=' . $pageSize . '&page=' . $page . '&extensions=all');
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);

            if ($data['status'] == 1 && $data['info'] == 'OK') {
                $total = $data['count'];
                $totalPage = ceil($total / $pageSize);
                $results = $data['pois'];

                $list = array();
                foreach ($results as $key => $value) {

                    $location = explode(',', $value['location']);

                    if($value['address']) {
                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $location[1],
                            'lng' => $location[0],
                            'address' => $value['address'],
                            'tel' => $value['tel'] ? $value['tel'] : '',
                            'url' => getUrlPath(array(
                                'service' => 'siteConfig',
                                'template' => '114_detail',
                                'param' => 'name=' . urlencode($value['name']) . '&lat=' . $location[1] . '&lng=' . $location[0] . '&address=' . urlencode($value['address']) . '&tel=' . ($value['tel'] ? $value['tel'] : '')
                            ))
                        ));
                    }
                }

                return array(
                    'totalCount' => $total,
                    'totalPage' => $totalPage,
                    'list' => $list
                );
            } else {
                return array("state" => 200, "info" => $data['message']);
            }

        //天地图 
        }elseif($cfg_map == 5){

            $radius = $radius > 10000 ? 10000 : 5000;

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"' . $directory . '","queryRadius":' . $radius . ',"level":12,"show":1,"pointLonlat":"' . $lng . ',' . $lat . '","queryType":3,"start":' . ($page--) . ',"count":' . $pageSize . '}&type=query&tk=' . $cfg_map_tmap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);
            
            if ($data['status']['infocode'] == 1000) {
                $total = $data['count'];

                if($total == 0){
                    return array("state" => 200, "info" => "周边信息查询为空！");
                }else{
                    $totalPage = ceil($total / $pageSize);
                    $results = $data['pois'];

                    $list = array();
                    foreach ($results as $key => $value) {

                        $location = explode(',', $value['lonlat']);

                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $location[1],
                            'lng' => $location[0],
                            'address' => $value['address'],
                            'tel' => $value['phone'],
                            'url' => getUrlPath(array(
                                'service' => 'siteConfig',
                                'template' => '114_detail',
                                'param' => 'name=' . urlencode($value['name']) . '&lat=' . $location[1] . '&lng=' . $location[0] . '&address=' . urlencode($value['address']) . '&tel=' . $value['phone']
                            ))
                        ));
                    }

                    return array(
                        'totalCount' => $total,
                        'totalPage' => $totalPage,
                        'list' => $list
                    );
                }
            } else {
                return array("state" => 200, "info" => $data['status']['cndesc']);
            }

            //谷歌
		}elseif($cfg_map == 1){

            //https://developers.google.com/places/web-service/search?refresh=1
            $radius = $radius >= 50000 ? 50000 : $radius;//以米做单位的 最多查询20个

            //查找场所请求 @desc:查找位置请求接受文本输入，并返回一个位置 免费
            //$url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='. $directory . '&inputtype=textquery&language=ZH-CN&fields=icon,name,photos&locationbias=' . 'circle:' . $radius . '@' . $lat . ',' . $lng . '&key=' . $cfg_map_google;

            //附近搜索 会产生费用
            //$url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' . $lat . ',' . $lng . '&language=ZH-CN&radius=' . $radius . '&keyword=' . $directory . '&key=' . $cfg_map_google;

            //文本搜索 会产生费用 https://maps.googleapis.com/maps/api/place/textsearch/json?query=123+main+street&location=42.3675294,-71.186966&radius=10000&key=YOUR_API_KEY
            if(!empty($pagetoken) && $page>=0){
                $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=' . $pagetoken . '&keyword=' . $directory . '&language=ZH-CN&location=' . $lat . ',' . $lng . '&radius=' . $radius . '&key=' . $cfg_map_google;
            }else{
                $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=' . $directory . '&language=ZH-CN&location=' . $lat . ',' . $lng . '&radius=' . $radius . '&key=' . $cfg_map_google;
            }

            //https://developers.google.com/places/web-service/search?refresh=1#PlaceSearchPaging

            //查看其他结果
            //https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=$pagetoken&key=YOUR_API_KEY

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($curl, CURLINFO_HEADER_OUT, TRUE);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $data = json_decode(curl_exec($curl), true);
            //echo 'Curl error: ' . curl_error($curl);exit;
            curl_close($curl);
            if ($data['status'] == 'OK') {
                $pagetoken = $data['next_page_token'];
                $results   = $data['results'];

                $list = array();
                foreach ($results as $key => $value) {
                    if($value['vicinity']) {
                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $value['geometry']['location']['lat'],
                            'lng' => $value['geometry']['location']['lng'],
                            'address' => $value['vicinity'],
                            'tel' => $value['tel'] ? $value['tel'] : '',
                            'url' => getUrlPath(array(
                                'service' => 'siteConfig',
                                'template' => '114_detail',
                                'param' => 'name=' . urlencode($value['name']) . '&lat=' .$value['geometry']['location']['lat'] . '&lng=' . $value['geometry']['location']['lng'] . '&address=' . urlencode($value['vicinity']) . '&tel=' . ($value['tel'] ? $value['tel'] : '')
                            ))
                        ));
                    }
                }

                return array(
                    'totalCount' => 3,
                    'totalPage' => 2,
                    'pagetoken' => $pagetoken,
                    'list' => $list
                );
            }else{
                return array("state" => 200, "info" => $data['status']);
            }
        }


    }

    // 地点输入提示服务
    public function getMapSuggestion(){
        global $cfg_map;
        global $site_map_key;
        global $cfg_map_baidu_server;
        global $cfg_map_amap_server;
        global $cfg_map_tmap_server;
        global $cfg_map_google;

        $lat = $this->param['lat'];
        $lng = $this->param['lng'];
        $query = $this->param['query'];  //关键字
        $region = $this->param['region'];  //所在城市
        $module = $this->param['module'];  //模块

        if(empty($query) || empty($region)){
            return array("state" => 200, "info" => '参数错误！');
        }

        $radius = 10000;  //圆形区域检索半径，单位为米。

        //百度地图
        if($cfg_map == 2) {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://api.map.baidu.com/place/v2/suggestion?query='.$query.'&radius='.$radius.'&region='.$region.'&location='.$lat.','.$lng.'&city_limit=true&output=json&ak=' . $cfg_map_baidu_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);

            if ($data['status'] == 0 && $data['message'] == 'ok') {
                $result = $data['result'];

                $list = array();
                foreach ($result as $key => $value) {
                    array_push($list, array(
                        'name' => $value['name'],
                        'lat' => $value['location']['lat'],
                        'lng' => $value['location']['lng'],
                        'address' => $value['address']
                    ));
                }

                return $list;
            } else {
                return array("state" => 200, "info" => $data['message']);
            }

            //高德
        }elseif($cfg_map == 4){
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://restapi.amap.com/v5/place/around?keywords='.$query.'&location='.$lng.','.$lat.'&radius='.$radius.'&key='. $cfg_map_amap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);

            if ($data['status'] == 1 && $data['info'] == 'OK') {
                $total = $data['count'];
                $results = $data['pois'];

                $list = array();
                foreach ($results as $key => $value) {

                    $location = explode(',', $value['location']);

                    if($value['address']) {
                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $location[1],
                            'lng' => $location[0],
                            'address' => $value['address']
                        ));
                    }
                }

                return $list;
            } else {
                return array("state" => 200, "info" => $data['info']);
            }

        //天地图
        }elseif($cfg_map == 5){
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'http://api.tianditu.gov.cn/v2/search?postStr={"keyWord":"' . $query . '","queryRadius":'.$radius.',"level":12,"show":1,"pointLonlat":"' . $lng . ',' . $lat . '","queryType":3,"start":1,"count":20}&type=query&tk=' . $cfg_map_tmap_server);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_TIMEOUT, 5);
            $data = json_decode(curl_exec($curl), true);
            curl_close($curl);
            
            if ($data['status']['infocode'] == 1000) {
                $total = $data['count'];

                if($total == 0){
                    return array("state" => 200, "info" => "周边信息查询为空！");
                }else{
                    $results = $data['pois'];

                    $list = array();
                    foreach ($results as $key => $value) {

                        $location = explode(',', $value['lonlat']);

                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $location[1],
                            'lng' => $location[0],
                            'address' => $value['address']
                        ));
                    }

                    return $list;
                }
            } else {
                return array("state" => 200, "info" => $data['status']['cndesc']);
            }

            //谷歌
		}elseif($cfg_map == 1){

            //https://developers.google.com/places/web-service/search?refresh=1
            $radius = 20000;//以米做单位的 最多查询20个

            //查找场所请求 @desc:查找位置请求接受文本输入，并返回一个位置 免费
            //$url = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input='. $directory . '&inputtype=textquery&language=ZH-CN&fields=icon,name,photos&locationbias=' . 'circle:' . $radius . '@' . $lat . ',' . $lng . '&key=' . $cfg_map_google;

            //附近搜索 会产生费用
            //$url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' . $lat . ',' . $lng . '&language=ZH-CN&radius=' . $radius . '&keyword=' . $directory . '&key=' . $cfg_map_google;

            //文本搜索 会产生费用 https://maps.googleapis.com/maps/api/place/textsearch/json?query=123+main+street&location=42.3675294,-71.186966&radius=10000&key=YOUR_API_KEY
            if(!empty($pagetoken) && $page>=0){
                $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=' . $pagetoken . '&keyword=' . $query . '&language=ZH-CN&location=' . $lat . ',' . $lng . '&radius=' . $radius . '&key=' . $cfg_map_google;
            }else{
                $url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?keyword=' . $query . '&language=ZH-CN&location=' . $lat . ',' . $lng . '&radius=' . $radius . '&key=' . $cfg_map_google;
            }

            //https://developers.google.com/places/web-service/search?refresh=1#PlaceSearchPaging

            //查看其他结果
            //https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=$pagetoken&key=YOUR_API_KEY

            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_HEADER, 0);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, false);
            curl_setopt($curl, CURLINFO_HEADER_OUT, TRUE);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            $data = json_decode(curl_exec($curl), true);
            //echo 'Curl error: ' . curl_error($curl);exit;
            curl_close($curl);
            if ($data['status'] == 'OK') {
                $pagetoken = $data['next_page_token'];
                $results   = $data['results'];

                $list = array();
                foreach ($results as $key => $value) {
                    if($value['vicinity']) {
                        array_push($list, array(
                            'name' => $value['name'],
                            'lat' => $value['geometry']['location']['lat'],
                            'lng' => $value['geometry']['location']['lng'],
                            'address' => $value['vicinity']
                        ));
                    }
                }

                return $list;
            }else{
                return array("state" => 200, "info" => $data['error_message']);
            }
        }


    }

    /**
     * 获取自定义小程序二维码的跳转链接
     */
    public function getWxMiniProgramScene(){
        global $dsql;

        $param = $this->param;
        $scene = (int)$param['scene'];

        if($scene){
            $sql = $dsql->SetQuery("SELECT `url` FROM `#@__site_wxmini_scene` WHERE `id` = " . $scene);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $url = $ret[0]['url'];

                //更新访问次数
                $sql = $dsql->SetQuery("UPDATE `#@__site_wxmini_scene` SET `count` = `count` + 1 WHERE `id` = " . $scene);
                $dsql->dsqlOper($sql, "update");

                return $url;
            }else{
                return array("state" => 200, "info" => "二维码错误，即将回到首页...");
            }
        }else{
            return array("state" => 200, "info" => "二维码错误，即将回到首页...");
        }
    }

    /**
     * 生成自定义小程序二维码
     */
    public function createWxMiniProgramScene(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;

        $param = $this->param;
        $url   = urldecode($param['url']);
        $page  = urldecode($param['wxpage']);  //自定义原生页面路径
        $from  = $param['from'];  //来源
        $module = $param['module'];  //所属模块
        $cityid = (int)$param['cityid'];  //指定分站，用于分站独立小程序功能

        if(empty($url)) return array("state" => 200, "info" => '链接不能为空！');
        
        $_url = $page ? $page : $url;

        //往数据库添加数据
        $sql = $dsql->SetQuery("SELECT `id`, `fid` FROM `#@__site_wxmini_scene` WHERE `url` = '$_url' AND `module` = '$module' AND `cityid` = '$cityid'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $pic = getFilePath($ret[0]['fid']);

            if($from == 'assistant'){
                header('location:' . $pic);
                die;
            }
            return $pic;
        }

        $ret = createWxMiniProgramScene($_url, '..', true, $module, $cityid);

        //失败的情况
        if(is_array($ret)){

            //如果是原生页面，并且生成失败了，直接使用url
            if($from == 'assistant'){
                header('location:' . $cfg_secureAccess . $cfg_basehost . '/include/qrcode.php?data=' . urlencode($url));
                die;
            }
            return $ret;
        }else{
            if($from == 'assistant'){
                header('location:' . $ret);
                die;
            }
            return $ret;
        }
    }


    /**
     * 支付前检查 验证支付密码、用户积分和余额是否充足，不验证总额
     */
    public function checkPayAmount(){
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;

        $userid   = $userLogin->getMemberID();
        $param    = $this->param;

        $ordertype  = $param['ordertype'];    //订单类型
        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码
        $paytype    = $param['paytype'];     //支付方式
        $check      = $param['check'];     //

        $userid = $param['userid'] ? $param['userid'] : $userid;

        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        if(empty($ordertype) || empty($ordernum)) return array("state" => 200, "info" => self::$langData['siteConfig'][33][13]);//参数错误

        if($check){
            if(!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => $langData['travel'][13][16]);//请输入支付密码！

        }

        $totalPrice = 0;

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if($usePinput == 1 && !empty($point)){
            if($userpoint < $point) return array("state" => 200, "info" => $langData['siteConfig'][21][103]);  //您的可用积分不足，支付失败！
            $useTotal += $point / $cfg_pointRatio;
            $tit[] = $cfg_pointName;
        }

        //判断是否使用余额，并且验证余额和支付密码
        if($useBalance == 1 && !empty($balance)){
//            if(isMobile() || $check){
                if(empty($paypwd)){
                    return array("state" => 200, "info" => $langData['siteConfig'][21][88]);  //请输入支付密码！
                }else{
                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res = $results[0];
                    $hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
                    if($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['siteConfig'][21][89]);  //支付密码输入错误，请重试！
                }
//            }
            //验证余额
            if($usermoney < $balance) return array("state" => 200, "info" => $langData['siteConfig'][20][213]);  //您的余额不足，支付失败！

            $useTotal += $balance;
            $tit[] = $langData['siteConfig'][19][363];  //余额
        }

        return "ok";

        // if($useTotal > $totalPrice) return array("state" => 200, "info" => str_replace('1', join($langData['siteConfig'][13][46], $tit), $langData['siteConfig'][21][104]));  //和  您使用的1超出订单总费用，请重新输入！

        // return sprintf('%.2f', $totalPrice);

    }

    /**
     * 支付
     */
    public function pay(){
        global $dsql;
        global $userLogin;

        $param      = $this->param;

        $ordertype  = $param['ordertype'];   //类型
        if($ordertype && method_exists($this, $ordertype)){
            $this->$ordertype();
        }else{
            die("操作错误！");
        }

    }

    /**
     * 移动端便捷导航规则
     */
    public function getFastNavigationRule(){
        global $dsql;

        $fabu = $cart = array();
        $sql = $dsql->SetQuery("SELECT `name`, `title`, `subject` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $val){

                //发布相关
                if($val['name'] == 'article' || $val['name'] == 'info' || $val['name'] == 'house' || $val['name'] == 'tieba' || $val['name'] == 'huodong' || $val['name'] == 'live' || $val['name'] == 'sfcar'){

                    if($val['name'] == 'info') {
                        $link = getUrlPath(array(
                                'service' => 'member',
                                'type' => 'user',
                                'template' => 'info'
                            )) . '#Stype';
                    }elseif($val['name'] == 'house'){
                        $link = getUrlPath(array(
                            'service' => 'member',
                            'type' => 'user',
                            'template' => 'fabu_house'
                        ));
                    }elseif($val['name'] == 'tieba'){
                        $link = getUrlPath(array(
                            'service' => 'member',
                            'type' => 'user',
                            'template' => 'fabu',
                            'action' => $val['name']
                        ));
                    }elseif($val['name'] == 'huodong'){
                        $link = getUrlPath(array(
                            'service' => 'member',
                            'type' => 'user',
                            'template' => 'fabu',
                            'action' => $val['name']
                        ));
                    }else {
                        $link = getUrlPath(array(
                            'service' => 'member',
                            'type' => 'user',
                            'template' => 'fabu',
                            'action' => $val['name']
                        ));
                    }

                    array_push($fabu, array(
                        'service' => $val['name'],
                        'title' => $val['subject'] ? $val['subject'] : $val['title'],
                        'domain' => getUrlPath(array(
                            'service' => $val['name']
                        )),
                        'link' => $link
                    ));
                }

                //购物
                if($val['name'] == 'shop'){
                    array_push($cart, array(
                        'title' => $val['subject'] ? $val['subject'] : $val['title'],
                        'domain' => getUrlPath(array(
                            'service' => $val['name']
                        )),
                        'link' => getUrlPath(array(
                            'service' => $val['name'],
                            'template' => 'cart'
                        ))
                    ));
                }
            }
        }

        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_wechatQr;
        global $cfg_wechatName;
        global $cfg_miniProgramQr;
        global $cfg_miniProgramName;
        global $cfg_server_wx;
        global $cfg_server_wxQr;

        return array(
            'basehost' => $cfg_secureAccess . $cfg_basehost,
            'weixin' => array(
                'qr' => $cfg_wechatQr ? getFilePath($cfg_wechatQr) : '',
                'name' => $cfg_wechatName,
                'mQr' => $cfg_miniProgramQr ? getFilePath($cfg_miniProgramQr) : '',
                'mName' => $cfg_miniProgramName
            ),
            'kefu' => array(
                'qr' => getFilePath($cfg_server_wxQr),
                'name' => $cfg_server_wx
            ),
            'member' => array(
                'busiDomain' => getUrlPath(array(
                    'service' => 'member'
                )),
                'userDomain' => getUrlPath(array(
                    'service' => 'member',
                    'type' => 'user'
                ))
            ),
            'fabu' => $fabu,
            'cart' => $cart
        );

    }

    /**
     * 移动端获取头部模块链接
     */
    public function touchAllBlock(){
        global $cfg_basehost;
        global $cfg_secureAccess;
        global $cfg_staticVersion;
        global $langData;
        global $installModuleArr;

        $url = $cfg_secureAccess.$cfg_basehost;

        $param = array("service" => "member", "type" => "user", "param" => "appFullScreen");
        $memberUrl = getUrlPath($param);
        $param = array("service" => "shop", "template" => "cart");
        $cartUrl = getUrlPath($param);

        $menu = array();

        if(in_array("shop", $installModuleArr)){
            // 购物车
            $menu[] = array(
                'name' => $langData['siteConfig'][22][12],
                'icon' => $url.'/static/images/admin/nav/shop_car.png?v='.$cfg_staticVersion,
                'url' => $cartUrl,
                'color' => '',
                'code' => 'cart',
                'bold' => 0
            );
        }

        $this->param = array("type" => 1);
        $module = $this->siteModule();

        foreach ($module as $key => $value) {
            if($value['code'] == 'special' || $value['code'] == 'website') continue;

            $menu[] = array(
                'name' => $value['name'],
                'icon' => $value['icon'],
                'url' => $value['url'],
                'color' => $value['color'],
                'code' => $value['code'],
                'bold' => $value['bold'],
                'title' => $value['title'],
                'wx' => $value['wx'],
                'app' => $value['app'],
                'description' => $value['description'],
                'logo' => $value['logo'],
                'disabled' => $value['disabled'],
            );
        }

        return $menu;
    }






    /**
     * IM相关
     */


    /**
     * 搜索用户
     */
    public function searchMember(){
        global $dsql;
        global $userLogin;
        global $langData;
        $uid = $userLogin->getMemberID();

        if($uid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        $keywords = filterSensitiveWords(addslashes($this->param['keywords']));

        $sql = $dsql->SetQuery("SELECT `id`, `nickname`, `photo` FROM `#@__member` WHERE (`id` = '$keywords' OR `nickname` = '$keywords' OR `company` = '$keywords' OR (`phone` = '$keywords' AND `phoneCheck` = 1)) AND `mtype` > 0");
        $ret = $dsql->dsqlOper($sql, "results");

        $list = array();
        if($ret){
            foreach($ret as $key => $val){
                //用户信息
                $configHandels = new handlers('member', "detail");
                $detail = $configHandels->getHandle(array("id" => $val['id'], "friend" => 1));
                if($detail['state'] == 100){
                    array_push($list, $detail['info']);
                }
            }
        }

        //记录用户行为日志
        memberLog($uid, 'member', 'im', 0, 'select', '搜索IM用户：' . $keywords, '', $sql);

        return $list;
    }


    /**
     * 添加好友
     */
    public function applyFriend(){
        global $dsql;
        global $userLogin;
        global $langData;

        //用户ID
        $userid = $this->param['userid'] ? $this->param['userid'] : $userLogin->getMemberID();

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $tid = $this->param['tid'];
        $note = $this->param['note'];
        $time = time();

        if($userid == $tid){
            return array("state" => 200, "info" => "不可以添加自己为好友！");   //登录超时，请重新登录！
        }

        //发送申请
        $fromToken = '';
        $this->param = array('userid' => $userid);
        $token = $this->getImToken();
        $fromToken = $token['token'];
        $fname = $token['name'];

        $toToken = '';
        $this->param = array('userid' => $tid);
        $token = $this->getImToken();
        $toToken = $token['token'];
        $tname = $token['name'];

        //验证是否已经是好友
        $sql = $dsql->SetQuery("SELECT `id`, `fid`, `tid`, `state`, `delfrom`, `delto` FROM `#@__member_friend` WHERE (`fid` = $userid AND `tid` = $tid) OR (`fid` = $tid AND `tid` = $userid)");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = $ret[0]['id'];
            $fid_ = $ret[0]['fid'];
            $tid_ = $ret[0]['tid'];
            $state = $ret[0]['state'];
            $delfrom = $ret[0]['delfrom'];
            $delto = $ret[0]['delto'];

            if($state){

                //如果已经是好友，但是申请人将对方删除了，此时直接更新状态，不需要再申请
                if($fid_ == $userid && $delfrom){
                    $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `delfrom` = 0 WHERE `id` = " . $id);
                    $dsql->dsqlOper($sql, "update");

                    //发送消息
                    $this->param = array(
                        'fid' => $userid,
                        'from' => $fromToken,
                        'tid' => $tid,
                        'to' => $toToken,
                        'type' => 'member',
                        'contentType' => 'apply',
                        'content' => '你们已成功添加为好友'
                    );
                    $this->sendImChat();

                    return '添加成功';
                }

                //如果已经是好友，但是申请人将对方删除了，此时直接更新状态，不需要再申请
                if($tid_ == $userid && $delto){
                    $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `delto` = 0 WHERE `id` = " . $id);
                    $dsql->dsqlOper($sql, "update");

                    //发送消息
                    $this->param = array(
                        'fid' => $userid,
                        'from' => $fromToken,
                        'tid' => $tid,
                        'to' => $toToken,
                        'type' => 'member',
                        'contentType' => 'apply',
                        'content' => '你们已成功添加为好友'
                    );
                    $this->sendImChat();

                    return '添加成功';
                }

                //如果已经是好友，并且双方都没有删除
                if(!$delfrom && !$delto){
                    return array("state" => 200, "info" => "你们已经是好友了！");
                }
            }else{
                //更新状态
                $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `state` = 1, `delto` = 1, `date` = '$time' WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "update");
            }
        }else{
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_friend` (`fid`, `tid`, `state`, `date`, `delfrom`, `delto`, `temp`, `tempdelfrom`, `tempdelto`) VALUES ('$userid', '$tid', 1, '$time', 0, 1, 1, 0, 0)");
            $dsql->dsqlOper($sql, "update");
        }


        //发送消息
        $this->param = array(
            'fid' => $userid,
            'from' => $fromToken,
            'tid' => $tid,
            'to' => $toToken,
            'type' => 'member',
            'contentType' => 'apply',
            'content' => filterSensitiveWords(strip_tags($note))
        );
        $ret = $this->sendImChat();


        //会员通知
        $param = array(
            "service"  => "member",
            "type" => "user",
			"template" => "message",
			"param"   => "pushMessage=1"
        );

        //自定义配置
        $config = array(
            "title" => "好友通知",
            "content" => $fname . "请求加您好友",
            "date" => date("Y-m-d H:i:s", GetMkTime(time()))
        );
        updateMemberNotice($tid, "会员-消息提醒", $param, $config, "", array('type' => 'im', 'from' => $userid, 'to' => $tid));


        //正常申请流程
        return '申请成功';
    }



    /**
     * 删除好友
     */
    public function delFriend(){
        global $userLogin;
        global $langData;
        global $dsql;

        //用户ID
        $userid = $userLogin->getMemberID();

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $tid = $this->param['tid'];  //要删除的好友ID
        $type = $this->param['type'];  //删除类型，temp代表删除临时会话

        if(empty($tid)){
            return array("state" => 200, "info" => "请选择要删除的好友！");
        }


        //删除好友
        if($type != 'temp'){
            $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `delfrom` = 1 WHERE `fid` = '$userid' AND `tid` = '$tid'");
            $dsql->dsqlOper($sql, "update");

            $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `delto` = 1 WHERE `fid` = '$tid' AND `tid` = '$userid'");
            $dsql->dsqlOper($sql, "update");
        }

        //删除临时会话列表
        $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `tempdelfrom` = 1 WHERE `fid` = '$userid' AND `tid` = '$tid'");
        $dsql->dsqlOper($sql, "update");

        $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `tempdelto` = 1 WHERE `fid` = '$tid' AND `tid` = '$userid'");
        $dsql->dsqlOper($sql, "update");

        //记录用户行为日志
        memberLog($userid, 'member', 'im', 0, 'delete', '删除IM好友：' . $tid, '', '');

        return '删除成功';
    }



    /**
     * 获取IM Token
     * return array {
     *    "online": 1,
     *    "server": "wss://api.kumanyun.com/chat/",
     *    "uid": "29",
     *    "name": "昵称",
     *    "photo": "头像",
     *    "token": "VjJWUmFBTmtCemhUYmdoaURtbFdObFJyRFQ1U1lncHBCMklLT0FCcVZXTUZJUVo0QTJaVGJBPT0="
     * }
     */
    public function getImToken(){
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        //用户ID
        $userid = $this->param['userid'] ? $this->param['userid'] : $userLogin->getMemberID();

        if($userid == $userLogin->getMemberID()){
            unset($this->param['userid']);
        }

        //没有获取到用户ID，或者没有登录，阻止获取长链接请求，减少不必要的请求，如果后续有其他业务需要做未登录的功能，这里需要写明原因
        if($userid < 1 || $userLogin->getMemberID() < 1){
            return array("state" => 200, "info" => "No data!");  //由于touchScale.js中限制了获取失败的原因如果不是No data!会自动刷新页面，所以这里不提示未登录
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        //用户信息
        if($userid > 0){
            $configHandels = new handlers('member', "detail");
            $userinfo = $configHandels->getHandle(array("id" => $userid, "friend" => 1, "from" => (int)$this->param['from']));

            if($userinfo['state'] != 100){
                return array("state" => 200, "info" => "用户信息错误");
            }

            //获取Token
            $params = array (
                'uid' => $userid,
                'name' => $userinfo['info']['nickname'],
                'photo' => $userinfo['info']['photo'],
                'type' => 'member',
                'getLastMessage' => 1
            );
        }else{
            //获取Token
            $params = array (
                'uid' => 0,
                'name' => '游客',
                'photo' => '',
                'type' => 'member'
            );
        }

        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $token = $request->curl('/chat/getToken.php', $params, 'urlencoded', 'POST');
        $tokenArr = json_decode($token, true);
        if($tokenArr['state'] == 100){
            $tokenArr['uid'] = $userid;
            $tokenArr['name'] = $userinfo['info']['nickname'];
            $tokenArr['photo'] = $userinfo['info']['photo'];
            $tokenArr['isfriend'] = $userinfo['info']['isfriend'];
            $tokenArr['token'] = $tokenArr['info'];
            $tokenArr['AccessKeyID'] = $cfg_km_accesskey_id;
            unset($tokenArr['state']);
            unset($tokenArr['info']);

            //如果是传入的userid，就把token改为userid
            if (isset($this->param['userid']) && (int)$this->param['userid'] > 0) {
                $tokenArr['token'] = (int)$this->param['userid'];
            }
        }
        return $tokenArr;
    }


    /**
     * 获取IM 好友列表
     * return array {
     *    "id": "1",
     *    "userinfo": {
     *        "uid": "20",
     *        "name": "昵称",
     *        "photo": "头像",
     *        "getLastMessage": 1,
     *        "friend": 29,
     *        "type": "member"
     *    },
     *    "token": "VUdKU2ExMDZBVDRJTlFoaVVqVUNZZ1k1VkdkY2JGbzVWVEFLT0FOcEF6VlJkVm9rQUdVRU1nPT0=",
     *    "online": 0,
     *    "lastMessage": {
     *        "time": "1559539594",
     *        "type": "text",
     *        "content": "最后一条信息内容",
     *        "unread": "0"
     *    }
     * }
     */
    public function getImFriendList(){
        global $dsql;
        global $userLogin;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = (int)$this->param['userid'];
        $type = $this->param['type'];
        $tongji = (int)$this->param['tongji'];

        //临时会话列表
        if($type == 'temp'){
            $sql = $dsql->SetQuery("SELECT `id`, `fid`, `tid` FROM `#@__member_friend` WHERE `fid` = '$userid' AND `tempdelfrom` = 0 AND `temp` = 1 UNION ALL SELECT `id`, `fid`, `tid` FROM `#@__member_friend` WHERE `tid` = '$userid' AND `tempdelto` = 0 AND `temp` = 1");
        }else{
            $sql = $dsql->SetQuery("SELECT `id`, `fid`, `tid` FROM `#@__member_friend` WHERE `fid` = '$userid' AND `delfrom` = 0 AND `delto` = 0 AND `state` = 1 UNION ALL SELECT `id`, `fid`, `tid` FROM `#@__member_friend` WHERE `tid` = '$userid' AND `delfrom` = 0 AND `delto` = 0 AND `state` = 1");
        }

        $friendList = array();

        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $nowTime = GetMkTime(time());
            foreach($ret as $val){
                $_id = (int)$val['id'];
                $_fid = $val['fid'];
                $_tid = $val['tid'];

                $toUserid = $_fid == $userid ? (int)$_tid : (int)$_fid;
                $toUserinfo = $userLogin->getMemberInfo($toUserid);

                $nickname = '未知'; //昵称
                $photo = ''; //头像
                $online = 0; //是否在线
                if(is_array($toUserinfo)){
                    $nickname = trim($toUserinfo['nickname']);
                    if(!$nickname){
                        $nickname = $toUserinfo['username'];
                    }
                    $photo = $toUserinfo['photo'];
                    $online = (int)$toUserinfo['online'];
                }else{
                    continue;
                }

                //如果online大于0，就判断是否在5分钟内
                if ($online > 0) {
                    if ($online > $nowTime - 300) {
                        $online = 1;
                    } else {
                        $online = 0;
                    }
                }

                //查询最后一条信息
                $lastMessage = array();
                $tableIndex = ($_fid + $_tid)%10; //分表序号
                $sql = $dsql->SetQuery("SELECT * FROM `#@__member_chat_history_".$tableIndex."` WHERE (`fid` = $_fid AND `tid` = $_tid) OR (`fid` = $_tid AND `tid` = $_fid) ORDER BY `time` DESC LIMIT 1");
                $result = $dsql->dsqlOper($sql, "results");
                if($result != null && is_array($result)){
                    $item = $result[0];

                    //根据消息类型不同进行不同的处理
                    $content = $item['content'];
                    switch($item['type']){
                        case 'text':
                            $content = strip_tags($content);
                            break;
                        case 'image':
                            $content = '[图片]';
                            break;
                        case 'video':
                            $content = '[视频]';
                            break;
                        case 'audio':
                            $content = '[语音]';
                            break;
                        case 'recfriend':
                            $content = '[好友推荐]';
                            break;
                        case 'mapshare':
                            $content = '[地图位置]';
                            break;
                        case 'apply':
                            $content = '[好友申请]';
                            break;
                        default:
                            $content = unserialize($content);
                            break;
                    }

                    $lastMessage = array('time' => (int)$item['time'], 'type' => $item['type'], 'content' => $content);
                }

                //统计和好友的未读数量
                $sql = $dsql->SetQuery("SELECT `unread` FROM `#@__member_chat_count` WHERE `tid` = ".$userid." AND `fid` = ".$toUserid);
                $unread = (int)$dsql->getOne($sql);
                $lastMessage['unread'] = $unread;
                
                $userinfo = array(
                    'uid' => $toUserid,
                    'name' => $nickname,
                    'photo' => $photo,
                    'friend' => $userid,
                    'type' => 'member'
                );

                array_push($friendList, array(
                    'id' => $_id,
                    'lastMessage' => $lastMessage,
                    'online' => $online,
                    'token' => $toUserid,
                    'userinfo' => $userinfo
                ));
            }
        }

        $online = array_column($friendList, 'online');
        array_multisort($online, SORT_DESC, $friendList);

        //对数据二次清洗，将在线状态的会员，按最新聊天时间排序
        $onlineList = array();
        $offlineList = array();
        foreach ($friendList as $key => $value) {
            // if($value['online']){
            if($value['lastMessage'] && $value['lastMessage']['unread']){
                $value['lastMessageTime'] = $value['lastMessage'] && $value['lastMessage']['time'] ? $value['lastMessage']['time'] : 0;
                $value['unread'] = $value['lastMessage'] && $value['lastMessage']['unread'] ? $value['lastMessage']['unread'] : 0;
                array_push($onlineList, $value);
            }else{
                $value['lastMessageTime'] = $value['lastMessage'] && $value['lastMessage']['time'] ? $value['lastMessage']['time'] : 0;
                $value['unread'] = $value['lastMessage'] && $value['lastMessage']['unread'] ? $value['lastMessage']['unread'] : 0;
                array_push($offlineList, $value);
            }
        }

        //按最新聊天时间排序
        $online = array_column($onlineList, 'lastMessageTime');
        array_multisort($online, SORT_DESC, $onlineList);

        //按最新聊天时间排序
        $offline = array_column($offlineList, 'lastMessageTime');
        array_multisort($offline, SORT_DESC, $offlineList);

        //合并在线和不在线的会员
        $friendList = array_merge($onlineList, $offlineList);
    
        if($friendList){
            return $friendList;
        }else{
            return array("state" => 100, "info" => array());  //如果返回非100的状态，iOS端会报错，这里临时这样处理
        }

    }



    /**
     * 获取IM 聊天记录
     * return array {
     *    "pageInfo": {
     *        "page": 1,
     *        "pageSize": 20,
     *        "totalPage": 15,
     *        "totalCount": 300
     *    },
     *    "list": [
     *        {
     *            "id": "390",
     *            "fid": "29",
     *            "tid": "20",
     *            "time": "1559539594",
     *            "type": "text",
     *            "content": "内容"
     *        },
     *    ],
     *    "userInfo": {
     *        "20": {
     *            "name": "昵称",
     *            "photo": "头像",
     *            "online": 0
     *        },
     *        "29": {
     *            "name": "昵称",
     *            "photo": "头像",
     *            "online": 1
     *        }
     *    }
     * }
     */
    public function getImChatLog(){
        global $userLogin;
        global $langData;
        global $dsql;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $this->param['userid'] ? $this->param['userid'] : $userLogin->getMemberID();

        $from = $this->param['from'];
        $to = (int)$this->param['to'];
        $time = (int)$this->param['time'];
        $page = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        if(!$to) {
            return array("state" => 200, "info" => '聊天对象异常！');
        }

        if($to == $userid){
            return array("state" => 200, "info" => '不可以给自己发信息！');
        }

        $nowTime = GetMkTime(time());

        //查询用户信息
        $userInfo = array();

        //发送人
        $uinfo = $userLogin->getMemberInfo($userid);

        $name = '未知'; //昵称
        $photo = ''; //头像
        $online = 0; //是否在线
        if(is_array($uinfo)){
            $name = trim($uinfo['nickname']);
            if(!$name){
                $name = $uinfo['username'];
            }
            $photo = $uinfo['photo'];
            $online = (int)$uinfo['online'];
        }

        //如果online大于0，就判断是否在5分钟内
        if ($online > 0) {
            if ($online > $nowTime - 300) {
                $online = 1;
            } else {
                $online = 0;
            }
        }

        $userInfo[$userid] = array('name' => $name, 'photo' => $photo, 'online' => $online);

        //接收人
        $uinfo = $userLogin->getMemberInfo($to);

        $name = '未知'; //昵称
        $photo = ''; //头像
        $online = 0; //是否在线
        if(is_array($uinfo)){
            $name = trim($uinfo['nickname']);
            if(!$name){
                $name = $uinfo['username'];
            }
            $photo = $uinfo['photo'];
            $online = (int)$uinfo['online'];
        }

        //如果online大于0，就判断是否在5分钟内
        if ($online > 0) {
            if ($online > $nowTime - 300) {
                $online = 1;
            } else {
                $online = 0;
            }
        }

        $userInfo[$to] = array('name' => $name, 'photo' => $photo, 'online' => $online);

        //如果查询时间为0，就取当前时间
        if ($time == 0) {
            $time = $nowTime;
        }

        //初始化当前页码
        if ($page == 0) {
            $page = 1;
        }

        //初始化每页条数
        if ($pageSize == 0) {
            $pageSize = 20;
        }

        //查询聊天列表
        $tableIndex = ($userid + $to)%10; //分表序号
        $where = '`time` <= '.$time.' AND ((`fid` = '.$userid.' AND `tid` = '.$to.') OR (`fid` = '.$to.' AND `tid` = '.$userid.'))'; //查询条件
        //获取总数量
        $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__member_chat_history_".$tableIndex."` WHERE " . $where);
        //总条数
        $totalCount = (int)$dsql->getOne($sql);
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        //获取未读总数量，统计接收者是当前用户，发送者不是to的未读总数，因为发送者是to的未读数量已经清0了
        $sql = $dsql->SetQuery("SELECT SUM(`unread`) totalCount FROM `#@__member_chat_count` WHERE `tid` = ".$userid." AND `fid` != ".$to);
        $totalUnread = (int)$dsql->getOne($sql);

        $pageInfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "totalUnread" => $totalUnread,
        );

        //计算游标
        $atpage = $pageSize*($page-1);
        $limit = " LIMIT $atpage, $pageSize";

        //查询列表
        $sql = $dsql->SetQuery("SELECT * FROM `#@__member_chat_history_".$tableIndex."` WHERE ".$where." ORDER BY `time` DESC".$limit);
        $results = $dsql->dsqlOper($sql, "results");
        $list = array();
        if ($results != null && is_array($results)) {
            foreach ($results as $value) {
                $content = $value['content'];
                //不是文本和apply类型就进行解码操作
                if ($value['type'] != 'text' && $value['type'] != 'apply') {
                    $content = json_decode($content, true);
                }
                $item = array('type' => $value['type'], 'info' => array('id' => $value['id'], 'fid' => $value['fid'], 'tid' => $value['tid'], 'time' => $value['time'], 'type' => $value['type'], 'content' => $content));
                $list[] = $item;
            }
        }

        //将发送者是to，接收者是当前用户的聊天记录的是否已读设为1
        $sql = $dsql->SetQuery("UPDATE `#@__member_chat_history_".$tableIndex."` SET `isread` = 1 WHERE `tid` = ".$userid." AND `fid` = ".$to);
        $dsql->dsqlOper($sql, "update");

        //将发送者是to，接收者是当前用户的未读总数清0
        $sql = $dsql->SetQuery("UPDATE `#@__member_chat_count` SET `unread` = 0 WHERE `tid` = ".$userid." AND `fid` = ".$to);
        $dsql->dsqlOper($sql, "update");

        //更新会员IM未读消息数量
        $sql = $dsql->SetQuery("UPDATE `#@__member` SET `im_unread_count` = $totalUnread WHERE `id` = $userid");
        $dsql->dsqlOper($sql, "update");

        $returnArr = array('pageInfo' => $pageInfo, 'list' => $list, 'userInfo' => $userInfo);

        return $returnArr;
    }



    /**
     * 发送IM 聊天
     */
    public function sendImChat(){
        global $userLogin;
        global $dsql;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $userLogin->getMemberID();
        $userid = $this->param['userid'] ? $this->param['userid'] : $userid;

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $fid = (int)$this->param['fid'];
        $from = $this->param['from'];
        $tid = (int)$this->param['tid'];
        $to = $this->param['to'];
        $type = $this->param['type'];
        $contentType = $this->param['contentType'];

        //内容格式化，uni项目中不能直接发送对象，这里做个判断
        $_content = $this->param['content'];
        if(!is_array($_content)){
            $_content = json_decode($_content, true);
        }

        $content = is_array($_content) ? $_content : filterSensitiveWords(addslashes(strip_tags($this->param['content'])));

        if($fid != $userid){
            return array("state" => 200, "info" => '发送人不是当前登录账号！');
        }

        if($fid == $tid){
            return array("state" => 200, "info" => '不可以给自己发信息！');
        }

        //检查好友表是否存在两人关系，如果没有，则新增记录
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_friend` WHERE (`fid` = $fid AND `tid` = $tid) OR (`fid` = $tid AND `tid` = $fid)");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_friend` (`fid`, `tid`, `state`, `date`, `delfrom`, `delto`, `temp`, `tempdelfrom`, `tempdelto`) VALUES ('$fid', '$tid', 0, 0, 0, 0, 1, 0, 0)");
            $dsql->dsqlOper($sql, "update");
        }

        //更新临时会话列表
        $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `tempdelfrom` = 0, `tempdelto` = 0, `temp` = 1 WHERE (`fid` = $fid AND `tid` = $tid) OR (`fid` = $tid AND `tid` = $fid)");
        $dsql->dsqlOper($sql, "update");

        //获取Token
        $params = array (
            'action' => 'sendToUser',
            'type' => $type,
            'contentType' => $contentType,
            'from' => $from,
            'to' => $to,
            'msg' => $content
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $params, 'json', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){
            //保存聊天记录到数据库
            $isread = 0; //是否已读
            //这里由于聊天记录已经迁移到了本地，这里一直都是未读
            if (isset($ret['info']['isread']) && $ret['info']['isread'] == 1) {
                $isread = 1;
            }

            //不是内容是数组就进行json压缩
            if (is_array($content)) {
                $content = json_encode($content, JSON_UNESCAPED_UNICODE);
            }

            $nowTime = GetMkTime(time()); //当前时间
            
            $tableIndex = ($fid + $tid)%10; //分表序号
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_chat_history_".$tableIndex."` (`fid`, `tid`, `time`, `type`, `content`, `isread`) VALUES ('".$fid."', '".$tid."', ".$nowTime.", '".$contentType."', '".$content."', ".$isread.")");
            $dsql->dsqlOper($sql, "lastid");

            //更新好友列表的最后聊天时间
            $sql = $dsql->SetQuery("UPDATE `#@__member_friend` SET `updatetime` = ".$nowTime." WHERE (`fid` = $fid AND `tid` = $tid) OR (`fid` = $tid AND `tid` = $fid)");
            $dsql->dsqlOper($sql, "update");

            //如果消息未读
            if($isread == 0){
                //统计接收者的未读消息总数量
                $sql = $dsql->SetQuery("SELECT SUM(`unread`) totalCount FROM `#@__member_chat_count` WHERE `tid` = ".$tid);
                $totalUnreadCount = (int)$dsql->getOne($sql);

                //未读消息总数量加1
                $totalUnreadCount++;

                //更新会员IM未读消息数量
                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `im_unread_count` = $totalUnreadCount WHERE `id` = $tid");
                $dsql->dsqlOper($sql, "update");

                //发送者到接收者的未读消息数量加1，先查询是否有该记录，没有就新增
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_chat_count` WHERE `tid` = ".$tid." AND `fid` = ".$fid);
                $results = $dsql->dsqlOper($sql, "results");
                if ($results != null && is_array($results)) {
                    $sql = $dsql->SetQuery("UPDATE `#@__member_chat_count` SET `unread` = `unread` + 1 WHERE `id` = ".$results[0]['id']);
                    $dsql->dsqlOper($sql, "update");
                } else {
                    $sql = $dsql->SetQuery("INSERT INTO `#@__member_chat_count` (`fid`, `tid`, `unread`) VALUES ('".$fid."', '".$tid."', 1)");
                    $dsql->dsqlOper($sql, "lastid");
                }

                $param = array(
                    "service"  => "member",
                    "type" => "user",
                    "template" => "message",
                    "param"   => "pushMessage=1"
                );

                //查询用户信息
                $uinfo = $userLogin->getMemberInfo($fid);
                $name = $uinfo['nickname'];

                $note = '';
                if($contentType == 'text'){
                    $note = strstr($content, '△') ? '[表情]' : $content;
                }elseif($contentType == 'image'){
                    $note = '[图片]';
                }elseif($contentType == 'video'){
                    $note = '[视频]';
                }elseif($contentType == 'audio'){
                    $note = '[语音]';
                }elseif($contentType == 'recfriend'){
                    $note = '[好友推荐]';
                }elseif($contentType == 'mapshare'){
                    $note = '[地图位置]';
                }elseif($contentType == 'apply'){
                    $note = '[好友申请]';
                }elseif($contentType == 'link'){
                    $note = '[链接]';
                }

                //自定义配置
                $config = array(
                    "title" => "聊天消息",
                    "content" => $name . "：" . $note,
                    "date" => date("Y-m-d H:i:s", GetMkTime(time()))
                );
                updateMemberNotice($tid, "会员-消息提醒", $param, $config, "", array('type' => 'im', 'from' => $fid, 'to' => $tid));
            }

            //记录用户行为日志
            memberLog($fid, 'member', 'im', 0, 'insert', '向用户ID['.$tid.']发送聊天消息：' . ($note . ($contentType != 'text' ? ' 数据内容：'.json_encode($content, JSON_UNESCAPED_UNICODE) : '')), '', '');

            return 'success';
        }else{
            return $ret;
        }

    }



    /**
     * 创建聊天室
     */
    public function createChatRoom(){
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $userLogin->getMemberID();
        $userid = $this->param['userid'] ? $this->param['userid'] : $userid;

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $mark  = $this->param['mark'];
        $title = $this->param['title'];
        $url   = $this->param['url'];

        $params = array (
            'type' => 'chat',
            'uid' => $userid,
            'mark' => $mark,
            'title' => $title,
            'date' => time(),
            'url' => $url
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/getToken.php', $params, 'urlencoded', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){
            // return $ret;
            return $ret['server'];
        }else{
            return $ret;
        }

    }



    /**
     * 加入聊天室
     */
    public function joinChatRoom(){
        global $userLogin;
        global $langData;
        global $dsql;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        //APP端传用户ID
        if(isApp()){
            $userid = $this->param['userid'];
        }else{
            $userid = $userLogin->getMemberID();
        }

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $mark  = $this->param['mark'];
        $from = $this->param['from'];

        $aid = (int)str_replace('chatRoom', '', $mark);  //直播间ID
        $date = GetMkTime(time());

        $param = array (
            'action' => 'joinChat',
            'mark' => $mark,
            'uid' => $from
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $param, 'json', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){

            //记录用户
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_member` WHERE `aid` = $aid AND `uid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res){
                $sql = $dsql->SetQuery("INSERT INTO `#@__live_member` (`aid`, `uid`, `date`) VALUES ('$aid', '$userid', '$date')");
                $dsql->dsqlOper($sql, "update");
            }

            return $ret['info'];
        }else{
            return $ret;
        }

    }



    /**
     * 获取聊天室在线人数
     */
    public function getChatRoomOnlineUserCount(){
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $userLogin->getMemberID();

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $from  = $this->param['from'];
        $mark  = $this->param['mark'];

        $param = array (
            'action' => 'chatRoomOnlineUserCount',
            'from' => $from,
            'mark' => $mark
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $param, 'json', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){
            return $ret['info'];
        }else{
            return $ret;
        }

    }



    /**
     * 获取IM 聊天室记录
     * return array {
     *    "pageInfo": {
     *        "page": 1,
     *        "pageSize": 20,
     *        "totalPage": 15,
     *        "totalCount": 300
     *    },
     *    "list": [
     *        {
     *            "id": "390",
     *            "fid": "29",
     *            "tid": "20",
     *            "time": "1559539594",
     *            "type": "text",
     *            "content": "内容"
     *        },
     *    ]
     * }
     */
    public function getImChatRoomLog(){
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        //APP端传用户ID
        if(isApp()){
            $userid = $this->param['userid'];
        }else{
            $userid = $userLogin->getMemberID();
        }

        $from = $this->param['from'];
        $mark = $this->param['mark'];
        $time = (int)$this->param['time'];
        $page = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        if($userid < 1){
            //return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        //获取Token
        $params = array (
            'action' => 'chatLog',
            'from' => $from,
            'mark' => $mark,
            'time' => $time ? (int)$time : time(),
            'page' => $page ? (int)$page : 1,
            'pageSize' => $pageSize ? (int)$pageSize : 20
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $params, 'urlencoded', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){
            unset($ret['state']);
        }
        return $ret;

    }



    /**
     * 发送IM 聊天室
     */
    public function sendImChatRoom(){
        global $userLogin;
        global $dsql;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        //APP端传用户ID
        if(isApp() && $this->param['userid']){
            $userid = $this->param['userid'];
        }else{
            $userid = $userLogin->getMemberID();
        }

        //如果是支付成功通知
        if($userid < 1){
            $userid = $this->param['userid'];
        }

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        $from = $this->param['from'];
        $mark = $this->param['mark'];
        $contentType = $this->param['contentType'];
        $content = is_array($this->param['content']) ? $this->param['content'] : filterSensitiveWords(addslashes(strip_tags($this->param['content'])));

        //查询是否被禁言
        $aid = (int)str_replace('chatRoom', '', $mark);  //直播间ID

        $sql = $dsql->SetQuery("SELECT `id`, `mute` FROM `#@__live_member` WHERE `aid` = $aid AND `uid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $mute = (int)$ret[0]['mute'];
            if($mute){
                return array("state" => 200, "info" => "您已被禁言！");
            }
        }


        //获取Token
        $params = array (
            'action' => 'sendToChat',
            'contentType' => $contentType,
            'from' => $from,
            'mark' => $mark,
            'msg' => $content
        );

        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $params, 'json', 'POST');
        $ret = json_decode($ret, true);
        if($ret['state'] == 100){

            //记录用户行为日志
            memberLog($userid, 'member', 'im', 0, 'insert', '发送聊天室['.$aid.']消息：' . ($contentType == 'text' ? $content : json_encode($content)), '', '');

            return $ret['info'];
        }else{
            return $ret;
        }

    }


    /**
     * 获取国际区号
     */
    public function internationalPhoneSection(){
        global $langData;
        global $internationalPhoneAreaCode;

        $areaCode = $langData['siteConfig'][48];

        $m_file = HUONIAODATA."/admin/internationalPhoneAreaCode.txt";
        if(@filesize($m_file) > 0){
            $fp = @fopen($m_file,'r');
            $codes = @fread($fp,filesize($m_file));
            fclose($fp);

            $data = array();
            $codes = explode(',', trim($codes));
            foreach ($codes as $key => $value) {
                array_push($data, array(
                    'name' => $areaCode[$value],
                    'code' => $internationalPhoneAreaCode[$value]['code']
                ));
            }
            return $data;

        }else{
            $data = array();
            for ($i=0; $i < count($internationalPhoneAreaCode); $i++) {
                array_push($data, array(
                    'name' => $areaCode[$i],
                    'code' => $internationalPhoneAreaCode[$i]['code']
                ));
            }
            return $data;
        }

    }


    /**
     * 获取动态链接
     */
    public function getCustomUrl(){
        $this->param['service'] = $this->param['ser'];
        unset($this->param['ser']);
        return getUrlPath($this->param);
    }


    public function getStatistics(){
        global $siteCityInfo;
        global $dsql;
        global $installModuleArr;

        $countall   = array();
        $cityid     = (int)$siteCityInfo['cityid'];
        //商家
        $countbaql  = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__business_list` WHERE `cityid` = $cityid AND `state` != 3 AND `state` != 4");
        $business   = $dsql->dsqlOper($countbaql,"results");
        $countall['business'] = $business['0']['countall'];

        //分类信息
        if(in_array('info', $installModuleArr)){
            $infosql    = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__infolist` WHERE `cityid` = $cityid AND `waitpay` = 0");
            $info       = $dsql->dsqlOper($infosql,"results");
            $countall['info']  = $info['0']['countall'];
        }else{
            $countall['info']  = 0;
        }

        //贴吧
        if(in_array('tieba', $installModuleArr)){
            $tiebasql   = $dsql->SetQuery("SELECT count(`id`) countall FROM `#@__tieba_list` WHERE `cityid` = $cityid AND `waitpay` = 0 AND `del` = 0");
            $tieba      = $dsql->dsqlOper($tiebasql,"results");
            $countall['tieba']  = $tieba['0']['countall'];
        }else{
            $countall['tieba']  = 0;
        }

        return $countall;
    }

    /*地图找店*/
    public function store_map(){
        global $dsql;
        global $langData;
        $page = $pageSize = "";
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $typeid   = $this->param['typeid'];
                $addrid   = $this->param['addrid'];
                $industry   = (int)$this->param['industry'];
                $moduletype = $this->param['moduletype'];
                $title      = $this->param['title'];
                $orderby      = $this->param['orderby'];
                $opentime = $this->param['opentime'];
                $discount = (int)$this->param['discount'];

                // $page     = $this->param['page'];
                // $pageSize = $this->param['pageSize'];

            }
        }

        $where = " AND `state` = 1";
        $where1 = " AND s.`state` = 1";
        $cityid = getCityId($this->param['cityid']);
        //遍历区域
        if($cityid){
            $where .= " AND `cityid` = '$cityid'";
            $where1 .= " AND s.`cityid` = '$cityid'";
        }

        // $pageSize = empty($pageSize) ? 10 : $pageSize;
        // $page     = empty($page) ? 1 : $page;
        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower = $addrid.",".join(',',$lower);
            }else{
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
            $where1 .= " AND s.`addrid` in ($lower)";
        }

        if ($moduletype=='') {
            $archives  = $dsql->SetQuery("SELECT * FROM ( SELECT `id`,`title`,`lng`,`lat`,'homemaking' moduletype  FROM `#@__homemaking_store`  WHERE 1 = 1 ".$where."
                                                UNION ALL SELECT `id`,`title`,`lng`,`lat`,'shop' moduletype    FROM `#@__shop_store`  WHERE  1 = 1 ".$where."
                                                UNION ALL (SELECT s.`id`,m.`company`title ,s.`lng`,s.`lat`,'tuan' moduletype    FROM `#@__tuan_store` s LEFT JOIN `#@__member` m ON m.`id` = s.`uid`   WHERE  1 = 1 AND m.`mtype` = 2 ".$where1.")
                                                UNION ALL (SELECT s.`id`,m.`company`title ,s.`lnglat` lng,'' lat,'info' moduletype    FROM `#@__infoshop` s LEFT JOIN `#@__member` m ON m.`id` = s.`uid`   WHERE  1 = 1 AND m.`mtype` = 2 ".$where1.")
                                            )as unall");
        }elseif($moduletype=='homemaking' || $moduletype=='shop' ){
            if(!empty($typeid)){
                if($dsql->getTypeList($typeid, "homemaking_type")){
                    global $arr_data;
                    $arr_data = array();
                    $lower = arr_foreach($dsql->getTypeList($typeid, "homemaking_type"));
                    $lower = $typeid.",".join(',',$lower);
                }else{
                    $lower = $typeid;
                }

                $where .= " AND `typeid` in ($lower)";
            }
            if ($moduletype=='shop'){
                if (!empty($industry)) {
                    $where .= " AND `industry` = " . $industry;
                }
                if($title){
                    $where .= " AND  (`title` like '%$title%' OR  `address` like '%$title%')";
                }

                if (!empty($opentime)) {

                    $start = $end = $wheretime = '';
                    if ($opentime == 1) {
        
                        $start = date("H:i:s",GetMkTime(time()));
                        $end   = date("H:i:s",GetMkTime(time()));
        
                        $wheretime = "AND ((CONVERT(`start_time1`, TIME) < '$start' AND CONVERT(`end_time1`, TIME) > '$end') OR (CONVERT(`start_time2`, TIME) < '$start' AND CONVERT(`end_time2`, TIME) > '$end')OR (CONVERT(`start_time3`, TIME) < '$start' AND CONVERT(`end_time3`, TIME) > '$end'))";
        
                    } elseif ($opentime == 2) {
                        $start = '00:00:00';
                        $end   = '23:59:59';
                    } elseif ($opentime == 3){
                        $start = '00:00:00';
                        $end   = '06:00:00';
                    } elseif ($opentime == 4){
                        $start = '06:00:00';
                        $end   = '12:00:00';
                    } elseif ($opentime == 5){
                        $start = '12:00:00';
                        $end   = '18:00:00';
                    } elseif ($opentime == 6){
                        $start = '18:00:00';
                        $end   = '24:00:00';
                    }
                    if ($opentime != 1) {
        
                        $wheretime = "AND ((CONVERT(`start_time1`, TIME) < '$start' AND CONVERT(`end_time1`, TIME) <='$end') OR (CONVERT(`start_time2`, TIME) < '$start' AND CONVERT(`end_time2`, TIME) <= '$end')OR (CONVERT(`start_time3`, TIME) < '$start' AND CONVERT(`end_time3`, TIME) <= '$end'))";
                    }
                    $where .= " AND (FIND_IN_SET(DAYOFWEEK(now()) - 1, `businessday`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, `businessday`)))";
        
                    $where .= $wheretime;
                }

                /*服务*/
                if (!empty($discount)) {
                    switch ($discount) {
                        case 1:
                            $where .= " AND `delivery` = 1";
                            break;
                        case 2:
                            $where .= " AND `shoptype` = 1";
                            break;
                        case 4:
                            $agentime = strtotime(date("Y-m-d H:i:s", strtotime("-3 month")));
                            $where .= " AND `pubdate` >= '$agentime'";
                            break;
                        case 5:
                            $where .= " AND (`merchant_deliver` = 1 or `distribution` = 1)";
                            break;
                        case 7:
                            $where .= " AND `certi` = 1";
                            break;
                        default:
                            $where.= "";
                            break;
                    }
                }

                $Subquery = ",(SELECT count(o.`id`) FROM `#@__shop_order` o WHERE `store` = s.`id` AND `orderstate` = 3) as totalSale ";
                $priceDesc = ",(SELECT `price` FROM `#@__shop_product` t WHERE `store` = s.`id` order by price desc limit 1) as pricedesc ";
                $priceAsc = ",(SELECT `price` FROM `#@__shop_product` t WHERE `store` = s.`id` order by price asc limit 1) as priceasc ";

                if ($orderby == '1'){
                    $order = " ORDER BY totalSale DESC";
                }elseif($orderby == '2'){
                    $order = " ORDER BY priceasc ASC";
                }elseif($orderby == '3'){
                    $order = " ORDER BY pricedesc DESC";
                }else{
                    $order = " ORDER BY s.rec DESC";
                }
                $archives = $dsql->SetQuery("SELECT `address`,`logo`,`id`,`title`,`lng`,`lat`,'".$moduletype."' moduletype" . $Subquery . " ".$priceDesc." ".$priceAsc." FROM `#@__".$moduletype."_store` s  WHERE 1 = 1 ".$where.$order);
            }else{
                 $archives = $dsql->SetQuery("SELECT `id`,`title`,`lng`,`lat`,'".$moduletype."' moduletype  FROM `#@__".$moduletype."_store`  WHERE 1 = 1 ".$where);
            }
        }elseif($moduletype=='info' || $moduletype=='tuan' ){

            $moduletypemysql = 'tuan_store';
            $lnglat = " s.`lng`,s.`lat` ";
            if($moduletype =='info'){
                $moduletypemysql = 'infoshop';
                $lnglat = " s.`lnglat` lng,'' lat";

            }

            $archives = $dsql->SetQuery("SELECT s.`id`,m.`company`title ,".$lnglat.",'".$moduletype."' moduletype    FROM `#@__".$moduletypemysql."` s LEFT JOIN `#@__member` m ON m.`id` = s.`uid`   WHERE  1 = 1 AND m.`mtype` = 2 ".$where1);

        }else{
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }

        // $totalCount = $dsql->dsqlOper($archives,"totalCount");
        //总分页数
        // $totalPage = ceil($totalCount/$pageSize);

        // if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        // $pageinfo = array(
        //  "page" => $page,
        //  "pageSize" => $pageSize,
        //  "totalPage" => $totalPage,
        //  "totalCount" => $totalCount
        // );

        $results    = $dsql->dsqlOper($archives,"results");
        foreach ($results as $key => $value) {
            $list[$key]['id']               = $value['id'];
            $list[$key]['title']            = $value['title'];
            $list[$key]['moduletype']       = $value['moduletype'];
            $list[$key]['logo']             = getFilePath($value['logo']);
            $list[$key]['address']             = $value['address'];
            $rating = '';
            $score1 = '';
            $collectnum = 0;
            $disresult = 0;
            $feiresult = 0;
            if ($value['moduletype'] == 'shop'){
                $sql    = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'shop-order' AND o.`store` = '$id' AND c.`pid` = 0");
                $rcount = $dsql->dsqlOper($sql, "totalCount");

                $sql     = $dsql->SetQuery("SELECT count(c.`id`) hpcount ,avg(c.`sco1`) s1, avg(c.`sco2`) s2, avg(c.`sco3`) s3 FROM `#@__public_comment_all` c LEFT JOIN `#@__shop_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`rating` = 1 AND c.`type` = 'shop-order' AND o.`store` = '".$value['id']."'  AND c.`pid` = 0");
                $res    = $dsql->dsqlOper($sql, "results");
                $score1  = $res[0]['s1'];  //分项1
                $hpcount = $res[0]['hpcount'];
                $rating  = 0;
                if($rcount != 0){
                    $rating               = $hpcount > 0 ? ($hpcount / $rcount * 100) : 0;
                }
                $rating = ($rating > 0 ? sprintf("%.2f", $rating) : 0) . "%";
                //关注
                $collectsql = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'shop' AND `action` = 'store-detail' AND `aid` = '".$value['id']."'");
                $collectnum = $dsql->dsqlOper($collectsql, "totalCount");
                $collectnum = (int)$collectnum;

                $dissql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_product` WHERE `price` < `mprice` AND `store` = '".$value['id']."'");
                $disresult = $dsql->dsqlOper($dissql, "totalCount");            //打折商品

                //多少人消费
                $xiaofeisql = $dsql->SetQuery("SELECT `id`  FROM `#@__shop_order` WHERE  `store` = '".$value['id']."'");
                $feiresult = $dsql->dsqlOper($xiaofeisql, "totalCount");
            }
            $list[$key]['score1']       = $score1;
            $list[$key]['rating']       = $rating;
            $list[$key]['collectnum']       = $collectnum;
            $list[$key]['disresult']       = $disresult;
            $list[$key]['feiresult']       = $feiresult;
            switch ($value['moduletype']) {
                case 'homemaking':
                    $param = array(
                        "service" => "homemaking",
                        "template" => "store-detail",
                        "id" => $value['id']
                    );
                    break;
                case 'shop':
                    $param = array(
                        "service"     => "shop",
                        "template"    => "store-detail",
                        "id"          => $value['id']
                    );
                    break;
                case 'tuan':
                    $param = array(
                        "service" => "tuan",
                        "template" => "store",
                        "id" => $value['id']
                    );
                    break;
                case 'info':
                    $param    = array(
                        "service" => "info",
                        "template" => "business",
                        "id" => $value['id']
                    );
                    break;

            }

            $list[$key]['url'] = getUrlPath($param);
            if ($value['moduletype'] == 'info') {
                $laglatarr = explode(',', $value['lng']);
                $list[$key]['lng']      = $laglatarr['0'];
                $list[$key]['lat']      = $laglatarr['1'];

            }else{
                $list[$key]['lng']      = $value['lng'];
                $list[$key]['lat']      = $value['lat'];
            }
        }
        return array("list" => $list);

    }


    /*
     * 生成带参数的微信二维码
     * keyword: 海报
     * 不考虑永久二维码是否用完的问题，目前微信官方最多提供10万个，如果用完了，就改成临时二维码
     */
    public function getWeixinQrPost(){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();

        $module      = $this->param['module'];  //模块
        $type        = $this->param['type'];  //分类
        $aid         = (int)$this->param['aid'];  //信息ID
        $title       = cn_substrR($this->param['title'], 50);  //信息标题
        $description = RemoveXSS(addslashes(strip_tags(($_REQUEST['description'] ? $_REQUEST['description'] : $this->param['info']))));  //描述
        $imgUrl      = $this->param['imgUrl'];  //缩略图
        $imgUrl      = $imgUrl == 'undefined' ? '' : $imgUrl;
        $link        = urldecode(RemoveXSS(addslashes(($_REQUEST['link'] ? $_REQUEST['link'] : $this->param['redirect']))));  //链接
        $time        = time();
        $expired     = $time + 2592000;  //过期时间（30天后）
		$from        = $this->param['from'];  //来源

        if($link == 'undefined'){
            $param = array(
                'service' => $module,
                'template' => $type,
                'id' => $aid
            );

            if($userid > 0){
                $param['param'] = 'fromShare=' . $userid;
            }
            
            $link = getUrlPath($param);
        }

        $parsed_url = parse_url($link);
        parse_str($parsed_url['query'], $param_arr);

        //推荐人
        $fromShare = '';
        if(isset($param_arr['fromShare'])){
            $fromShare = '&fromShare=' . $param_arr['fromShare'];
        }

        //引入配置文件
        $wechatConfig = HUONIAOINC."/config/wechatConfig.inc.php";
        if(!file_exists($wechatConfig)) return array("state" => 200, "info" => '请先设置微信开发者信息！');
        require($wechatConfig);

		//不是绑定用户的，生成海报需要验证是否启用
		if($from != 'bind' && $from != 'assistant' && $type != 'desk' && $type != 'fenxiao'){
	        $cfg_wechatPoster = (int)$cfg_wechatPoster;
	        if(!$cfg_wechatPoster) return array("state" => 200, "info" => '未开启关注模式！');

            //海报中的二维码使用小程序码
            if($cfg_wechatPoster == 2){

                $wxpage = '';
                if($module == 'info' && $type == 'detail'){
                    $wxpage = '/pages/packages/info/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'article' && $type == 'detail'){
                    $wxpage = '/pages/packages/article/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'sfcar' && $type == 'detail'){
                    $wxpage = '/pages/packages/sfcar/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'tieba' && $type == 'detail'){
                    $wxpage = '/pages/packages/tieba/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'shop' && $type == 'detail'){
                    $wxpage = '/pages/packages/shop/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'job' && $type == 'job'){
                    $wxpage = '/pages/packages/job/job/job?id=' . $aid . $fromShare;
                }
                elseif($module == 'job' && $type == 'company'){
                    $wxpage = '/pages/packages/job/company/company?id=' . $aid . $fromShare;
                }

                $this->param = array(
                    'url' => $link,
                    'wxpage' => $wxpage
                );
                return $this->createWxMiniProgramScene();
            }
		}

        //分销类型
        if($type == 'fenxiao'){

            $cfg_wechatPoster = (int)$cfg_wechatPoster;
	        if(!$cfg_wechatPoster) return array("state" => 200, "info" => '未开启关注模式！');
            
            $fenxiaoConfig = HUONIAOINC."/config/fenxiaoConfig.inc.php";
            if(!file_exists($fenxiaoConfig)) return array("state" => 200, "info" => '未设置分销功能！');
            require($fenxiaoConfig);

            $cfg_fenxiaoQrType = (int)$cfg_fenxiaoQrType;

            //海报中的二维码使用小程序码
            if($cfg_fenxiaoQrType == 1){

                $wxpage = '';
                if($module == 'info' && $type == 'detail'){
                    $wxpage = '/pages/packages/info/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'article' && $type == 'detail'){
                    $wxpage = '/pages/packages/article/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'sfcar' && $type == 'detail'){
                    $wxpage = '/pages/packages/sfcar/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'tieba' && $type == 'detail'){
                    $wxpage = '/pages/packages/tieba/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'shop' && $type == 'detail'){
                    $wxpage = '/pages/packages/shop/detail/detail?id=' . $aid . $fromShare;
                }
                elseif($module == 'job' && $type == 'job'){
                    $wxpage = '/pages/packages/job/job/job?id=' . $aid . $fromShare;
                }
                elseif($module == 'job' && $type == 'company'){
                    $wxpage = '/pages/packages/job/company/company?id=' . $aid . $fromShare;
                }

                $this->param = array(
                    'url' => $link,
                    'wxpage' => $wxpage
                );
                return $this->createWxMiniProgramScene();
            }else{
                // return array("state" => 200, "info" => '未开启关注模式！');
            }
        }

        

        include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
        $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
        $token = $jssdk->getAccessToken();

        //先验证是否存在，并且没有过期
        $has = false;
        $sql = $dsql->SetQuery("SELECT `id`, `qr`, `expired`, `ticket` FROM `#@__site_wxposter` WHERE `module` = '$module' AND `type` = '$type' AND `aid` = '$aid' AND `link` = '$link'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $has = true;
            $id  = $ret[0]['id'];
            $expired = $ret[0]['expired'];  //过期时间

            //未过期的直接使用
            // if($expired > $time){
                //更新信息
                $sql = $dsql->SetQuery("UPDATE `#@__site_wxposter` SET `title` = '$title', `description` = '$description', `imgUrl` = '$imgUrl', `link` = '$link' WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");

                $qr = $ret[0]['qr'];  //二维码信息（需要使用qrcode.php显示）
                $ticket = $ret[0]['ticket'];  //获取二维码ticket后，开发者可用ticket换取二维码图片。请注意，本接口无须登录态即可调用。

                //推文助手来源的，直接输出ticket地址
                if($from == 'assistant'){
                    header('location:https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' . $ticket);
                    die;
                }
                
                return $qr;
            // }
        }

        $rand = create_ordernum();  //随机值

        $url = "https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=$token";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);

		if($from != 'bind'){
	        // curl_setopt($ch, CURLOPT_POSTFIELDS, '{"expire_seconds": 2592000, "action_name": "QR_LIMIT_STR_SCENE", "action_info": {"scene": {"scene_str": "海报_'.$rand.'"}}}');
	        curl_setopt($ch, CURLOPT_POSTFIELDS, '{"action_name": "QR_LIMIT_STR_SCENE", "action_info": {"scene": {"scene_str": "海报_'.$rand.'"}}}');
		}else{
			// curl_setopt($ch, CURLOPT_POSTFIELDS, '{"expire_seconds": 2592000, "action_name": "QR_LIMIT_STR_SCENE", "action_info": {"scene": {"scene_str": "bind_'.$aid.'"}}}');
			curl_setopt($ch, CURLOPT_POSTFIELDS, '{"action_name": "QR_LIMIT_STR_SCENE", "action_info": {"scene": {"scene_str": "bind_'.$aid.'"}}}');
		}

        curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        $output = curl_exec($ch);
        curl_close($ch);

        if(empty($output)){
            return array("state" => 200, "info" => '请求失败，请稍候重试！');
        }

        $result = json_decode($output, true);
        if($result['errcode']){
            return array("state" => 200, "info" => json_encode($result));
        }else{
            $ticket = $result['ticket'];  //获取二维码ticket后，开发者可用ticket换取二维码图片。请注意，本接口无须登录态即可调用。
            $qr = $result['url'];  //二维码信息（需要使用qrcode.php显示）

            //如果已经生成过
            if($has){
                //更新信息
                $sql = $dsql->SetQuery("UPDATE `#@__site_wxposter` SET `title` = '$title', `description` = '$description', `imgUrl` = '$imgUrl', `link` = '$link', `rand` = '$rand', `qr` = '$qr', `expired` = '$expired', `ticket` = '$ticket' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");

                //新创建
            }else{
                $sql = $dsql->SetQuery("INSERT INTO `#@__site_wxposter` (`rand`, `module`, `type`, `aid`, `title`, `description`, `imgUrl`, `link`, `qr`, `expired`, `ticket`) VALUES ('$rand', '$module', '$type', '$aid', '$title', '$description', '$imgUrl', '$link', '$qr', '$expired', '$ticket')");
                $ret = $dsql->dsqlOper($sql, "update");
            }

            if($ret != 'ok'){
                return $ret;
            }

            //推文助手来源的，直接输出ticket地址
            if($from == 'assistant'){
                header('location:https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' . $ticket);
                die;
            }

            return $qr;
        }

    }

    /**
     * Notes: app网页扫码登录
     * Ueser: Administrator
     * DateTime: 2021/2/3 11:41
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return int|string
     */
    public function appWebLogin(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if(!empty($this->param)){
            $state      = $this->param['qr'];
        }
        if($state){

            $time = time();
            $usersql = $dsql->SetQuery("SELECT `id`, `username`, `password` FROM `#@__member` WHERE `id` = '$userid'");

            $userres = $dsql->dsqlOper($usersql,'results');
            if($userres){
                $archives_ = $dsql->SetQuery("UPDATE `#@__site_wxlogin` SET `uid` = '$userid' WHERE `state` = '$state'");
                $results_  = $dsql->dsqlOper($archives_,"results");
                return '登录成功!';
            }else{
                return array("state" => 200, "info" => '未找到该用户');//格式错误
            }

        }else{
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }
    }


    /*
      * 地址识别接口
      */
    public function  getAddress(){
        global $dsql;
        require_once(HUONIAOINC . "/baidu.aip.func.php");
        $client = new baiduApiAddrsss();
        $text = $this->param['address'];
        if (!$text) return array("state" => 200, "info" => '格式错误');//格式错误
        $ret    = $client->addRess($text);
        if (!$ret) return array("state" => 200, "info" => '识别失败');
        if (isset($ret['error_code'])) return array("state" => 200, "info" => $ret['error_msg']);
        $addrid = 0;
        $province = str_replace('省','',$ret['province']);   //省（直辖市/自治区）
        $city     = str_replace('市','',$ret['city']);       // 市
        $county   = str_replace('区','',$ret['county']);    //区
        $town     = $ret['town'];     // 街道（乡/镇）
        if ($town){
            $sql   = $dsql->SetQuery("SELECT `id`,`typename`  FROM `#@__site_area` WHERE  `typename` like '%$town%' ");//街道
            $result= $dsql->dsqlOper($sql,'results');
            if($result){
                $addrid = $result[0]['id'];
            }
        }
        if ($county && $addrid == 0){
            $sql   = $dsql->SetQuery("SELECT `id`,`typename`  FROM `#@__site_area` WHERE  `typename` like '%$county%' ");//区
            $result= $dsql->dsqlOper($sql,'results');
            if($result){
                $addrid = $result[0]['id'];
            }
        }
        if ($city && $addrid == 0){
            $sql   = $dsql->SetQuery("SELECT `id`,`typename`  FROM `#@__site_area` WHERE  `typename` like '%$city%' ");//市
            $result= $dsql->dsqlOper($sql,'results');
            if($result){
                $addrid = $result[0]['id'];
            }
        }
        if ($province && $addrid == 0){
            $sql   = $dsql->SetQuery("SELECT `id`,`typename`  FROM `#@__site_area` WHERE  `typename` like '%$province%' ");//省(直辖市)
            $result= $dsql->dsqlOper($sql,'results');
            if($result){
                $addrid = $result[0]['id'];
            }
        }
        if ($addrid){
            $addrids     = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid, 'split' => ' ', 'action' => 'addr'));
            $addridname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid, 'split' => ' ','type' => 'typename','action' => 'addr'));
        }

        $list = array(
            'addrid'   => $addrid,
            'addrids'  => $addrids,
            'addrname' => $addridname,
            'province' => $province,
            'city'     => $city,
            'county'   => $county,
            'town'     => $town,
            'lat'      => $ret['lat'],
            'lng'      => $ret['lng'],
            'phonenum' => $ret['phonenum'] ? $ret['phonenum'] : '',
            'person'   => $ret['person']  ? $ret['person'] : '',
            'detail'   => $ret['detail'] ? $ret['detail'] : '',
        );
        return $list;
    }

    /**
     * 会员中心发布页
     */
    public function fabuJoin(){
        global $dsql;
        $preview = $this->param['preview'];
        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `children`,`browse`,`title` FROM `#@__site_config` WHERE `type` = '' OR `type` = 'fabu'");
        $result = $dsql->dsqlOper($sql, "results");
        if (!empty($result) && !empty($result[0]['config']) && !empty($result[0]['children']) ){
            if($preview == 1){
                $fabuModuleList = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                if (!$fabuModuleList) {
                    $fabuArr = array(
                        'config'=>$result[0]['config'] ? unserialize($result[0]['config']) : '',
                        'children' =>$result[0]['children'] ? unserialize($result[0]['children']) : '',
                        'title'=>$result[0]['title'] ? unserialize($result[0]['title']) : ''
                    );
                    return $fabuArr;
                }else{
                    $fabuArr = array(
                        'config'=>$fabuModuleList['config'] ? $fabuModuleList['config'] : '',
                        'children' =>$fabuModuleList['customChildren'] ? $fabuModuleList['customChildren'] : '',
                        'title'=>$fabuModuleList['title'] ? $fabuModuleList['title']: ''
                    );
                    return $fabuArr;
                }
            }else{
                $fabuArr = array(
                    'config'=>$result[0]['config'] ? unserialize($result[0]['config']) : '',
                    'children' =>$result[0]['children'] ? unserialize($result[0]['children']) : '',
                    'title'=>$result[0]['title'] ? unserialize($result[0]['title']) : ''
                );
                return $fabuArr;
            }
        }else{
            $infoarr = fabuJoin();
            return $infoarr;
        }


    }

    /**
     * 个人会员移动端首页模板自定义
     */
    public function userCenterDiy(){
        global $dsql;
        $preview = (int)$this->param['preview'];
        $platform = $this->param['platform'];

        $this->param = array();
        $this->param['preview'] = $preview;

        // 字段说明
        // config: 模板配置数据
        // browse: 预览模板配置数据

        //未指定终端的，判断userAgent
        if(!$platform){
            //安卓端
            if(isAndroidApp()){
                $this->param['platform'] = 'android';
            }
            //苹果端
            elseif(isIOSApp()){
                $this->param['platform'] = 'ios';
            }
            //鸿蒙端
            elseif(isHarmonyApp()){
                $this->param['platform'] = 'harmony';
            }
            //微信小程序
            elseif(isWxMiniprogram()){
                $this->param['platform'] = 'wxmini';
            }
            //抖音小程序
            elseif(isByteMiniprogram()){
                $this->param['platform'] = 'dymini';
            }
            //h5
            else{
                $this->param['platform'] = 'h5';
            }
        }else{
            $this->param['platform'] = $platform;
        }

        $data = $this->userCenterDiyData();
        if(!$data){

            //如果没有数据，强制获取h5端
            $this->param['platform'] = 'h5';
            $data = $this->userCenterDiyData();

        }

        return $data;

    }

    //获取指定终端的用户中心页面数据
    public function userCenterDiyData(){
        global $dsql;
        $preview = (int)$this->param['preview'];
        $platform = $this->param['platform'];

        $where = '';
        if($platform){
            if($platform == 'h5'){
                $where = " AND (`title` = '$platform' OR `title` = '' OR `title` IS NULL)";
            }else{
                $where = " AND `title` = '$platform'";
            }
        }
        
        //验证模板状态
        if(HUONIAOADMIN == ''){
            $where .= " AND `state` = 1";
        }

        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'userCenter'" . $where . " ORDER BY `id` DESC LIMIT 1");
        $result = $dsql->dsqlOper($sql, "results");
        if (!empty($result)){
            $config = unserialize($result[0]['config']);
            if($preview == 1){
                $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                if ($browse) {
                    return $browse;
                }else{
                    return $config;
                }
            }else{
                if(is_array($config)){
                    return $config;
                }
            }
        }

    }

    /**
     * 商家会员移动端首页模板自定义
     */
    public function busiCenterDiy(){
        global $dsql;
        $preview = (int)$this->param['preview'];
        $platform = $this->param['platform'];

        $this->param = array();
        $this->param['preview'] = $preview;

        // 字段说明
        // config: 模板配置数据
        // browse: 预览模板配置数据

        //未指定终端的，判断userAgent
        if(!$platform){
            //安卓端
            if(isAndroidApp()){
                $this->param['platform'] = 'android';
            }
            //苹果端
            elseif(isIOSApp()){
                $this->param['platform'] = 'ios';
            }
            //鸿蒙端
            elseif(isHarmonyApp()){
                $this->param['platform'] = 'harmony';
            }
            //微信小程序
            elseif(isWxMiniprogram()){
                $this->param['platform'] = 'wxmini';
            }
            //抖音小程序
            elseif(isByteMiniprogram()){
                $this->param['platform'] = 'dymini';
            }
            //h5
            else{
                $this->param['platform'] = 'h5';
            }
        }else{
            $this->param['platform'] = $platform;
        }

        $data = $this->busiCenterDiyData();
        if(!$data){

            //如果没有数据，强制获取h5端
            $this->param['platform'] = 'h5';
            $data = $this->busiCenterDiyData();

        }

        return $data;

    }

    //获取指定终端的商家中心页面数据
    public function busiCenterDiyData(){
        global $dsql;
        $preview = (int)$this->param['preview'];
        $platform = $this->param['platform'];

        $where = '';
        if($platform){
            if($platform == 'h5'){
                $where = " AND (`title` = '$platform' OR `title` = '' OR `title` IS NULL)";
            }else{
                $where = " AND `title` = '$platform'";
            }
        }
        
        //验证模板状态
        if(HUONIAOADMIN == ''){
            $where .= " AND `state` = 1";
        }

        //预览
        $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'busiCenter'" . $where . " ORDER BY `id` DESC LIMIT 1");
        $result = $dsql->dsqlOper($sql, "results");
        if (!empty($result)){
            $config = unserialize($result[0]['config']);
            if($preview == 1){
                $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                if ($browse) {
                    return $browse;
                }else{
                    return $config;
                }
            }else{
                if(is_array($config)){
                    return $config;
                }
            }
        }

    }

    /**
     * 系统首页移动端模板自定义
     */
    public function sitePageDiy(){
        global $dsql;
        $preview = (int)$this->param['preview'];
        $platform = trim($this->param['platform']);
        $cityid = (int)$this->param['cityid'];
        $admin = (int)$this->param['admin'];  //管理员模式，可以不指定分站，也就是cityid可以为0
        $platform = $platform ?: 'h5';  //默认h5

        //未指定城市时，自动获取当前所在城市
        if(!$cityid && !$admin){
            $cityid = getCityId();
        }

        // 字段说明
        // config: 模板配置数据
        // browse: 预览模板配置数据

        //未指定终端的，判断userAgent
        if(!$platform && 1 == 2){
            //安卓端
            if(isAndroidApp()){
                $platform = 'android';
            }
            //苹果端
            elseif(isIOSApp()){
                $platform = 'ios';
            }
            //鸿蒙端
            elseif(isHarmonyApp()){
                $platform = 'harmony';
            }
            //微信小程序
            elseif(isWxMiniprogram()){
                $platform = 'wxmini';
            }
            //抖音小程序
            elseif(isByteMiniprogram()){
                $platform = 'dymini';
            }
        }else{
            $platform = $platform;
        }

        $where = '';
        if($platform){
            $where = " AND `title` = '$platform'";
        }

        //非管理员模式下，需要判断模板启用状态
        if(!$admin){
            $where .= " AND `state` = 1";
        }

        //指定城市分站
        $cityData = array();

        //如果指定的分站并且指定了终端，模板的确认规则为：
        //先根据两个条件进行查询，如果有，则直接使用
        //如果没有，则查询该终端的默认DIY模板，忽略分站条件
        //如果还没有数据，则直接使用系统默认DIY模板，忽略分站和终端这两个条件

        //指定城市的全终端默认模块
        $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'sitePage' AND `children` = '$cityid'" . $where);
        $result = $dsql->dsqlOper($sql, "results");
        if (!empty($result)){
            $config = unserialize($result[0]['config']);
            if($preview == 1){
                $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                if ($browse) {
                    $cityData = $browse;
                }else{
                    $cityData = $config;
                }
            }else{
                if(is_array($config)){
                    $cityData = $config;
                }
            }
        }

        //如果指定城市的指定终端没有数据，获取该城市的默认数据
        // if(!$cityData){
        //     $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'sitePage' AND `children` = '$cityid' AND `title` = 'h5' ORDER BY `id` ASC LIMIT 1");
        //     $result = $dsql->dsqlOper($sql, "results");
        //     if (!empty($result)){
        //         $config = unserialize($result[0]['config']);
        //         if($preview == 1){
        //             $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
        //             if ($browse) {
        //                 $cityData = $browse;
        //             }else{
        //                 $cityData = $config;
        //             }
        //         }else{
        //             if(is_array($config)){
        //                 $cityData = $config;
        //             }
        //         }
        //     }
        // }

        //如果指定城市的指定终端没有数据，获取系统指定终端的默认数据
        if(!$cityData){
            $defaultData = array();
            $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'sitePage'" . $where . " AND `children` = 0 ORDER BY `id` ASC LIMIT 1");
            $result = $dsql->dsqlOper($sql, "results");
            if (!empty($result)){
                $config = unserialize($result[0]['config']);
                if($preview == 1){
                    $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                    if ($browse) {
                        $defaultData = $browse;
                    }else{
                        $defaultData = $config;
                    }
                }else{
                    if(is_array($config)){
                        $defaultData = $config;
                    }
                }
            }

            $cityData = $defaultData;
        }

        //如果系统指定终端没有数据，直接获取系统默认数据
        if(!$cityData){
            $_defaultData = array();
            $sql = $dsql->SetQuery("SELECT `config`, `browse` FROM `#@__site_config` WHERE `type` = 'sitePage' AND `title` = 'h5' ORDER BY `id` ASC LIMIT 1");
            $result = $dsql->dsqlOper($sql, "results");
            if (!empty($result)){
                $config = unserialize($result[0]['config']);
                if($preview == 1){
                    $browse = $result[0]['browse'] ? unserialize($result[0]['browse']) : '';
                    if ($browse) {
                        $_defaultData = $browse;
                    }else{
                        $_defaultData = $config;
                    }
                }else{
                    if(is_array($config)){
                        $_defaultData = $config;
                    }
                }
            }
            $cityData = $_defaultData;
        }

        return $cityData;

    }

    /**
     * 获取首页DIY系统模板
     */
    public function sitePageDiyTheme(){
        $dir = HUONIAOROOT . '/templates/diy/theme';
        $floders = listDir($dir);
        $skins = array();
        if(!empty($floders)){
            $i = 0;
            foreach($floders as $key => $floder){
                $config = $dir.'/'.$floder.'/config.xml';
                if(file_exists($config)){
                    //解析xml配置文件
                    $xml = new DOMDocument();
                    libxml_disable_entity_loader(false);
                    $xml->load($config);
                    $data = $xml->getElementsByTagName('Data')->item(0);
                    $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                    $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;
                    $pagedata = $data->getElementsByTagName("pagedata")->item(0)->nodeValue;

                    $skins[$i]['tplname'] = $tplname;
                    $skins[$i]['directory'] = $floder;
                    $skins[$i]['copyright'] = $copyright;
                    $skins[$i]['pagedata'] = $pagedata ? unserialize(base64_decode($pagedata)) : array();
                    $i++;
                }
            }
        }

        return $skins;
    }


    //生成隐私号码

    // 功能开关

    // 前端页面：
    // 验证码登录状态：$cfg_smsLoginState
    // 隐私保护通话状态：$cfg_privatenumberState

    // 接口：service=siteConfig&action=config
    // 验证码登录状态：smsLoginState
    // 隐私保护通话状态：privatenumberState

    // return array
    // 成功情况：
    // {"state":100,"info":{"from":"15006212131","number":"17068754386","type":1,"expire":1654149030}}
    // from表示要使用哪个号码进行拨打，number表示要拨打的电话号码，type为0表示是是真实号码，1表示是隐私号码，expire为过期时间戳，只有type为1时才会有值
    // 失败情况：
    // {"state":101,"info":"缺少参数"}
    // state等于101时，前端直接提示错误信息，否则根据状态码做相应处理
    // {"state":201,"info":"请先登录！"}
    // {"state":202,"info":"请先绑定手机！"}
    public function createPrivateNumber(){

        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_payPhoneState;  //付费查看电话号码功能启用状态  0未启用  1已启用
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //会员免费查看

        $param = $this->param;
        $module = $param['module'];
        $temp = $param['temp'] ? $param['temp'] : 'detail';
        $aid = (int)$param['aid'];
        // $uidA = (int)$param['uid'];  //上线后，改成$userLogin->getMemberID()，只有登录用户才能生成隐私号码

        $uidA = (int)$userLogin->getMemberID();  //当前登录用户

        //如果需要使用其他手机号码进行拨打电话，必传参数
        $areaCode = (int)$param['areaCode'];  //区号
        $phone    = (int)$param['phone'];  //手机号码
        $vercode  = (int)$param['vercode'];  //短信验证码

        //小程序端使用原生获取手机号码功能进行绑定其他号码
        $phoneData = $param['phoneData'];

        if(!$module || !$aid){
            return array("state" => 200, "info" => '缺少参数');
        }

        if($uidA == -1){
            return array("state" => 201, "info" => '请先登录！');
        }

        $userinfoA = $userLogin->getMemberInfo();  //当前登录用户信息

        //发起人的号码查询会员表
        $numberA = '';
        $sql = $dsql->SetQuery("SELECT `phone`, `phoneCheck` FROM `#@__member` WHERE `id` = $uidA AND `state` = 1 AND (`mtype` = 1 OR `mtype` = 2)");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $numberA = $ret[0]['phone'];
            if(!$ret[0]['phoneCheck']){
                return array('state' => 202, 'info' => '请先绑定手机！');
            }
        }else{
            return array('state' => 200, 'info' => '登录账号验证失败！');
        }

        //验证短信验证码
        if($areaCode && $phone && $vercode){

            //非国内区号
            if($areaCode != 86){
                return array("state" => 200, "info" => '只支持国内号码！');
            }

            //国际版需要验证区域码
            $cphone_  = $phone;
            $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $international = $results[0]['international'];
                if ($international) {
                    $cphone_ = $areaCode . $phone;
                }
            }

            $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->dsqlOper($sql_code, "results");
            if ($res_code) {
                $code   = $res_code[0]['code'];

                if (strtolower($vercode) != $code) {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }

                //5分钟有效期
                $now = GetMkTime(time());
                if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
            } else {
                return array('state' => 200, 'info' => '验证码输入错误，请重试！');
            }

            $numberA = $phone;  //替换会员绑定的默认号码
        }

        //小程序端
        if($phoneData){

            //微信小程序端
            if(isWxMiniprogram()){

                global $cfg_miniProgramAppid;
                global $cfg_miniProgramAppsecret;
                $phoneData = json_decode(urldecode($phoneData), true);

                $phone_code = str_replace(' ', '+', $phoneData['code']);
                $phone_encryptedData = str_replace(' ', '+', $phoneData['encryptedData']);
                $phone_iv = str_replace(' ', '+', $phoneData['iv']);

                if (!$phone_code) {
                    return array("state" => 200, "info" => "参数[code]传递失败，请检查后重试！");
                }

                // if(!$phone_code || !$phone_encryptedData || !$phone_iv){
                //     return array("state" => 200, "info" => "参数传递失败，请检查后重试！");
                // }

                //旧方法
                //从基础库 2.21.2 开始，对该能力进行了安全升级，以下是新版本组件使用指南。（旧版本组件目前可以继续使用，但建议开发者使用新版本组件，以增强小程序安全性）另外，新版本组件不再需要提前调用wx.login进行登录。
                //根据手机号码信息解密手机
                // $url = "https://api.weixin.qq.com/sns/jscode2session?appid=".$cfg_miniProgramAppid."&secret=".$cfg_miniProgramAppsecret."&js_code=".$phone_code."&grant_type=authorization_code";

                // $curl = curl_init();
                // curl_setopt($curl,CURLOPT_URL,$url);
                // curl_setopt($curl,CURLOPT_HEADER,0);
                // curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
                // curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);//证书检查
                // $result = curl_exec($curl);
                // curl_close($curl);

                // $data = json_decode($result);
                // $data = objtoarr($data);

                // //失败
                // if(isset($data['errcode'])){
                //     return array("state" => 200, "info" => "ErrCode:" . $data['errcode'] . "，ErrMsg:" . $data['errmsg']);
                // }

                // $session_key = $data['session_key'];  //获取session_key

                // //解密手机号
                // $areaCode = $phone = '';
                // include_once HUONIAOINC . "/class/miniProgram/wxBizDataCrypt.php";
                // $pc = new WXBizDataCrypt($cfg_miniProgramAppid, $session_key);
                // $errCode = $pc->decryptData($phone_encryptedData, $phone_iv, $data);

                // if ($errCode == 0) {
                //     $data = json_decode($data);
                //     $data = objtoarr($data);
                //     $areaCode = $data['countryCode'];  //区号
                //     $phone = $data['purePhoneNumber'];  //手机号
                // }

                //新方法
                //https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-info/phone-number/getPhoneNumber.html
                //获取接口调用凭据
                include_once(HUONIAOROOT."/include/class/WechatJSSDK.class.php");
                $jssdk = new WechatJSSDK($cfg_miniProgramAppid, $cfg_miniProgramAppsecret);
                $token = $jssdk->getWxminiAccessToken();

                $result = hn_curl('https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token='.$token, array('code' => $phone_code), 'json');

                $data = json_decode($result);
                $data = objtoarr($data);

                //失败
                if ($data['errcode']) {
                    return array("state" => 200, "info" => "ErrCode:" . $data['errcode'] . "，ErrMsg:" . $data['errmsg']);
                }

                $phone_info = $data['phone_info'];
                $areaCode = $phone_info['countryCode'];  //区号
                $phone = $phone_info['purePhoneNumber'];  //手机号

                if(empty($phone))  return array("state" => 200, "info" => "手机号码解析失败，请重试，错误信息：".$errCode);

                $numberA = $phone;  //替换会员绑定的默认号码
            }

            //抖音小程序端
            elseif(isByteMiniprogram()){

                loadPlug("payment");
                $payment  = get_payment("bytemini");

                $appid = $payment['appid'];
                $appsecret = $payment['appsecret'];

                //手机号码信息
                $phoneData = json_decode(urldecode($phoneData), true);
                $phone_code = str_replace(' ', '+', $phoneData['code']);
                $phone_encryptedData = str_replace(' ', '+', $phoneData['encryptedData']);
                $phone_iv = str_replace(' ', '+', $phoneData['iv']);

                //根据手机号码信息解密手机
                $url = "https://developer.toutiao.com/api/apps/v2/jscode2session";
                $data = '{
                    "appid": "' . $appid . '",
                    "secret": "' . $appsecret . '",
                    "code": "' . $phone_code . '"
                }';

                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, $url);
                curl_setopt($curl, CURLOPT_POST, 1);
                curl_setopt($curl, CURLOPT_TIMEOUT, 5);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
                curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
                $httpHeader = array();
                $httpHeader[] = 'Content-Type: Application/json';
                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
                curl_setopt($curl, CURLOPT_HTTPHEADER, $httpHeader);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                $result = curl_exec($curl);
                curl_close($curl);

                $data = json_decode($result);
                $data = objtoarr($data);

                //失败
                if (isset($data['err_no']) && $data['err_no'] != 0) {
                    return array("state" => 200, "info" => "ErrCode:" . $data['err_no'] . "，ErrMsg:" . $data['err_tips']);
                }

                // print_r($data);die;

                $data = $data['data'];
                $session_key = $data['session_key'];

                // var_dump($appid, $session_key, $phone_encryptedData, $phone_iv, $data);

                //解密手机号
                $areaCode = $phone = '';
                include HUONIAOINC . "/class/miniProgram/wxBizDataCrypt.php";
                $pc = new WXBizDataCrypt($appid, $session_key);
                $errCode = $pc->decryptData($phone_encryptedData, $phone_iv, $data);

                // var_dump($errCode, $data);die;

                if ($errCode == 0) {
                    $data = json_decode($data);
                    $data = objtoarr($data);
                    $areaCode = $data['countryCode'];  //区号
                    $phone = $data['purePhoneNumber'];  //手机号
                }

                if (empty($phone))  return array("state" => 200, "info" => "手机号码解析失败，请重试，错误信息：" . $errCode);

                $numberA = $phone;

            }

        }

        if(!$numberA){
            return array('state' => 202, 'info' => '请先绑定手机！');
        }

        $cityid = $uidB = $freecall = 0;
        $title = $number = '';

        //分类信息
        if($module == 'info'){
            
            if($temp == 'store'){
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `uid` userid FROM `#@__business_list` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $number = trim($ret[0]['tel']);
                    $uidB = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'business',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );
                }else{
                    return array("state" => 200, "info" => '获取电话号码失败，该商家不存在或已经删除！');
                }
            }else{
                $sql = $dsql->SetQuery("SELECT l.`cityid`, l.`title`, l.`tel`, l.`userid`, t.`freecall`, l.`valid` FROM `#@__infolist` l LEFT JOIN `#@__infotype` t ON t.`id` = l.`typeid` WHERE l.`id` = $aid AND l.`del` = 0 AND l.`arcrank` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $number = (int)$ret[0]['tel'];
                    $uidB = (int)$ret[0]['userid'];
                    $freecall = (int)$ret[0]['freecall'];
                    $valid = (int)$ret[0]['valid'];

                    $now = GetMkTime(time());
                    if($valid < $now){
                        return array("state" => 200, "info" => '获取失败，该信息已失效！');
                    }

                    $url = array(
                        'service' => $module,
                        'template' => $temp,
                        'id' => $aid
                    );
                }else{
                    return array("state" => 200, "info" => '获取电话号码失败，该信息不存在或已经删除！');
                }
            }
        
        //商家
        }elseif($module == 'business'){
            
            $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `uid` userid FROM `#@__business_list` WHERE `id` = $aid AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['cityid'];
                $title = $ret[0]['title'];
                $number = trim($ret[0]['tel']);
                $uidB = $ret[0]['userid'];

                $url = array(
                    'service' => $module,
                    'template' => 'detail',
                    'id' => $aid,
                    'param' => 'payPhone=1'
                );
            }else{
                return array("state" => 200, "info" => '获取电话号码失败，该商家不存在或已经删除！');
            }
        
        //顺风车
        }elseif($module == 'sfcar'){
            
            $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `userid` FROM `#@__sfcar_list` WHERE `id` = $aid AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['cityid'];
                $title = $ret[0]['title'];
                $number = trim($ret[0]['tel']);
                $uidB = $ret[0]['userid'];

                $url = array(
                    'service' => $module,
                    'template' => 'detail',
                    'id' => $aid,
                    'param' => 'payPhone=1'
                );
            }else{
                return array("state" => 200, "info" => '获取电话号码失败，该信息不存在或已经删除！');
            }
            
        }elseif($module == "job"){  //招聘虚拟号码
            if($temp=="zg"){
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`,`phone` 'tel', `userid` FROM `#@__job_pg` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $number = trim($ret[0]['tel']);
                    $uidB = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'zg',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );
                }else{
                    return array("state" => 200, "info" => '获取电话号码失败，该信息不存在或已经删除！');
                }
            }elseif($temp=="qz"){
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`,`phone` 'tel', `userid` FROM `#@__job_qz` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $number = trim($ret[0]['tel']);
                    $uidB = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'qz',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );
                }else{
                    return array("state" => 200, "info" => '获取电话号码失败，该信息不存在或已经删除！');
                }
            }
        }else{
            return array("state" => 200, "info" => '获取电话号码失败，该模块不支持虚拟号码！');
        }

        //如果号码不存在
        if(!$number){
            return array("state" => 200, "info" => '号码不存在，请联系客服处理！');
        }

        //判断是否需要付费
        $cc_payPhoneModule = $cfg_payPhoneModule;
        $cc_payPhoneModule = $cc_payPhoneModule ? is_string($cc_payPhoneModule) ? explode(",",$cc_payPhoneModule) : $cc_payPhoneModule : array();
        if($cfg_payPhoneState && in_array($module, $cc_payPhoneModule) && $uidA != $uidB){

            //判断是否开启了会员免费
            if(($cfg_payPhoneVipFree && $userinfoA['level']) || $freecall){
                
            }
            else{

                //只有付过费的才可以使用
                $sql = $dsql->SetQuery("SELECT `id`, `paytype` FROM `#@__site_pay_phone` WHERE `module` = '$module' AND `temp` = '$temp' AND `aid` = '$aid' ORDER BY `id` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 203, "info" => "获取电话号码失败，请先支付查看电话号码费用！");
                }
                elseif($ret[0]['paytype'] == ''){
                    $__id = (int)$ret[0]['id'];
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `id` = " . $__id);
                    $dsql->dsqlOper($sql, "update");                    

                    //删除5分钟之前的看广告解锁电话订单记录
                    $_time = GetMkTime(time()) - 300;
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `paytype` = '' AND `pubdate` < " . $_time);
                    $dsql->dsqlOper($sql, "update");
                }

            }

        }

        //必要参数
        $data = array(
            'service' => $module,
            'title' => $title,
            'url' => serialize($url),
            'cityid' => (int)$cityid,
            'uidA' => $uidA,
            'numberA' => $numberA,
            'uidB' => $uidB,
            'numberB' => $number,
            'expire' => 0,
        );

        $urlParam = array(
            'service' => $module,
            'template' => 'detail',
            'id' => $aid
        );
        $url = getUrlPath($urlParam);

        //记录用户行为日志
        memberLog($uidA, $module, 'privateNumber', $aid, 'insert', '创建隐私通话(发起号码：'.$numberA.'，拨打号码：'.$number.')', $url, '');
        
        return createPrivatenumber($data);
    }


    // 全站搜索

    /**
     * @param stime  // 开始时间
     * @param etime  // 结束时间
     * @param skword // 关键字
     * @param md  // 模块
     * @param page // 页数
     * @param pageSize // 每页条数
     * @return array
     */
    public function siteSearch(){
        // 校验es状态
        global $esConfig;
        global $userLogin;

        if(!$esConfig['open']){
            return array('state'=>200,'info'=>"es未开启");
        }
        require_once(HUONIAOROOT . "/include/class/es.class.php");
        $es = new es();

        //记录用户行为日志
        $uid = $userLogin->getMemberID();
        if($uid > 0 && $this->param['scope'] != 'index'){
            memberLog($uid, 'siteConfig', 'search', 0, 'select', '全站搜索('.($this->param['scope'] ? $this->param['scope'] . '=>' : '') . $this->param['keyword'] .')', '', $archives);
        }

        // 域查询
        if($this->param['scope']){
            $search = "search_".$this->param['scope'];
            return $es->$search($this->param);
        }
        // 原始查询
        else{
            return $es->search($this->param);
        }
    }


    /**
     * 生成付费查看电话号码订单
     * @param module
     * @param temp
     * @param aid
     * @return array
     */
    public function payPhoneDeal(){

        global $dsql;
        global $userLogin;
        global $huawei_privatenumber_state;  //隐私号码状态
        global $cfg_payPhoneState;  //功能启用状态  0未启用  1已启用
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhonePrice;  //查看电话的单次费用
        global $cfg_payPhoneVipFree;  //会员免费查看
        $param = $this->param;

        $uid = $userLogin->getMemberID();  //当前登录用户
        if($uid == -1){
            return array("state" => 201, "info" => '请先登录！');
        }

        $userinfo = $userLogin->getMemberInfo();  //当前登录用户信息

        $module = $param['module'];  //所属模块
        $temp   = $param['temp'] ?: 'detail';  //二级类目，默认为detail
        $aid    = (int)$param['aid'];  //信息ID

        if(!$module){
            return array("state" => 200, "info" => "模块信息获取失败！");
        }

        if(!$aid){
            return array("state" => 200, "info" => "信息ID获取失败！");
        }

        $phone = '';

        $freecall = 0;

        //分类信息
        if($module == 'info'){

            if($temp == 'store'){
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `uid` userid FROM `#@__business_list` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $phone = $ret[0]['tel'];
                    $userid = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'business',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );

                    //没有号码的情况
                    if(!$phone){
                        return array("state" => 200, "info" => '该商家没有提供电话！');
                    }
                    
                }else{
                    return array("state" => 200, "info" => '该信息不存在或已经删除！');
                }
            }else{
                $sql = $dsql->SetQuery("SELECT l.`cityid`, l.`tel`, l.`userid`, l.`valid` FROM `#@__infolist` l LEFT JOIN `#@__infotype` t ON t.`id` = l.`typeid` WHERE l.`id` = $aid AND l.`del` = 0 AND l.`arcrank` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $cityid = (int)$ret[0]['cityid'];
                    $phone = $ret[0]['tel'];
                    $userid = (int)$ret[0]['userid'];
                    $freecall = (int)$ret[0]['freecall'];
                    $valid = (int)$ret[0]['valid'];

                    $now = GetMkTime(time());
                    if($valid < $now){
                        return array("state" => 200, "info" => '获取失败，该信息已失效！');
                    }

                    $title = '佚名';
                    if(is_numeric($userid)){
                        $uinfo = $userLogin->getMemberInfo($userid);
                        if(is_array($uinfo)){
                            $title = $uinfo['nickname'];
                        }
                    }

                    $url = array(
                        'service' => $module,
                        'template' => 'detail',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );
                }else{
                    return array("state" => 200, "info" => '该信息不存在或已经删除！');
                }
            }
        
        //商家
        }elseif($module == 'business'){

            $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `uid` userid FROM `#@__business_list` WHERE `id` = $aid AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['cityid'];
                $title = $ret[0]['title'];
                $phone = $ret[0]['tel'];
                $userid = $ret[0]['userid'];

                $url = array(
                    'service' => $module,
                    'template' => 'detail',
                    'id' => $aid,
                    'param' => 'payPhone=1'
                );

                //没有号码的情况
                if(!$phone){
                    return array("state" => 200, "info" => '该商家没有提供电话！');
                }
                
            }else{
                return array("state" => 200, "info" => '该信息不存在或已经删除！');
            }
        
        //顺风车
        }elseif($module == 'sfcar'){

            $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `tel`, `userid` FROM `#@__sfcar_list` WHERE `id` = $aid AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['cityid'];
                $title = $ret[0]['title'];
                $phone = $ret[0]['tel'];
                $userid = $ret[0]['userid'];

                $url = array(
                    'service' => $module,
                    'template' => 'detail',
                    'id' => $aid,
                    'param' => 'payPhone=1'
                );

                //没有号码的情况
                if(!$phone){
                    return array("state" => 200, "info" => '该信息没有提供电话！');
                }
                
            }else{
                return array("state" => 200, "info" => '该信息不存在或已经删除！');
            }
            
        }
        //招聘
        elseif($module=="job"){

            if($temp=="zg"){
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `phone` 'tel', `userid` FROM `#@__job_pg` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret) {
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $phone = $ret[0]['tel'];
                    $userid = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'general-detailzg',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );

                    //没有号码的情况
                    if (!$phone) {
                        return array("state" => 200, "info" => '该信息没有提供电话！');
                    }
                }
            }
            elseif($temp=="qz") {
                $sql = $dsql->SetQuery("SELECT `cityid`, `title`, `phone` 'tel', `userid` FROM `#@__job_qz` WHERE `id` = $aid AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $cityid = $ret[0]['cityid'];
                    $title = $ret[0]['title'];
                    $phone = $ret[0]['tel'];
                    $userid = $ret[0]['userid'];

                    $url = array(
                        'service' => $module,
                        'template' => 'general-detailqz',
                        'id' => $aid,
                        'param' => 'payPhone=1'
                    );

                    //没有号码的情况
                    if (!$phone) {
                        return array("state" => 200, "info" => '该信息没有提供电话！');
                    }
                }
            }
        }else{
            return array("state" => 200, "info" => '该模块不支持付费查看电话号码！');
        }

        //没有号码的情况
        if(!$phone){
            return array("state" => 200, "info" => '该信息没有提供电话！');
        }

        $_phone = $huawei_privatenumber_state ? '' : $phone;  //没有启用隐私号时，提供真实号码

        $payPhoneState = (int)$cfg_payPhoneState;  //功能启用状态  0未启用  1已启用
        $payPhonePrice = (float)$cfg_payPhonePrice;  //单价
        $payPhoneVipFree = (int)$cfg_payPhoneVipFree;  //会员免费查看  0关闭  1开启

        if($uid == $userid){
            return array("state" => 202, "info" => "发布人是自己，无须付费！", "phone" => $_phone, "title" => $title);
        }
        $cc_payPhoneModule = $cfg_payPhoneModule;
        $cc_payPhoneModule = $cc_payPhoneModule ? is_string($cc_payPhoneModule) ? explode(",",$cc_payPhoneModule) : $cc_payPhoneModule : array();
        if(!$payPhoneState || !in_array($module, $cc_payPhoneModule)){
            return array("state" => 202, "info" => "付费功能未启用！", "phone" => $_phone, "title" => $title);
        }

        if($payPhoneVipFree && $userinfo['level']){
            return array("state" => 202, "info" => "VIP会员免费查看！", "phone" => $_phone, "title" => $title);
        }

        if($freecall){
            return array("state" => 202, "info" => "该信息免费查看电话！", "phone" => $_phone, "title" => $title);
        }

        if($payPhonePrice <= 0){
            return array("state" => 202, "info" => "付费金额小于0，无须支付！", "phone" => $_phone, "title" => $title);
        }

        //验证是否已经付过款
        $sql = $dsql->SetQuery("SELECT `id`, `paytype` FROM `#@__site_pay_phone` WHERE `module` = '$module' AND `temp` = '$temp' AND `aid` = '$aid' AND `uid` = " . $uid . " ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if(is_array($ret) && is_numeric($ret[0]['id'])){
            if($ret[0]['paytype'] != ''){
                return array("state" => 202, "info" => "已经支付过，无须重复支付", "phone" => $_phone, "title" => $title);
            }
            //如果paytype等于空，说明是通过看广告解锁的，需要删除此记录重新创建订单
            else{
                $__id = (int)$ret[0]['id'];
                $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `id` = " . $__id);
                $dsql->dsqlOper($sql, "update");

                //删除5分钟之前的看广告解锁电话订单记录
                $_time = GetMkTime(time()) - 300;
                $sql = $dsql->SetQuery("DELETE FROM `#@__site_pay_phone` WHERE `paytype` = '' AND `pubdate` < " . $_time);
                $dsql->dsqlOper($sql, "update");
            }
        }

        //数据
        $param = array(
            'type' => 'payPhone',
            'cityid' => $cityid,
            'module' => $module,
            'temp'   => $temp,
            'aid'    => $aid,
            'title'  => trim(strip_tags($title)),
            'url'    => $url
        );

        $ordernum = create_ordernum();

        $order = createPayForm("siteConfig", $ordernum, $payPhonePrice, '', '付费查看电话号码', $param, 1);

        if(is_array($order)){
            $timeout = GetMkTime(time()) + 1800;
            $order['timeout'] = $timeout;
        }
        return  $order;

    }

    /**
     * 付费查看电话号码支付接口
     * @param module
     * @param temp
     * @param aid
     * @return array
     */
    public function payPhone(){
        $param =  $this->param;
        $param_ = $param;

        $paytype    = $param['paytype'];
        $useBalance = (int)$param['useBalance'];
        $paypwd     = $param['paypwd'];
        $tourl      = $param['tourl'];
        $qr         = (int)$param['qr'];
        $ordernum   = $param['ordernum'];
        $check      = (int)$this->param['check'];
        $isMobile   = isMobile();

        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if($userid == -1) return array ("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        //用户信息
        $userinfo = $userLogin->getMemberInfo();

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT `id`, `amount`, `body` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 0");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret && is_array($ret)){
            $amount = $ret[0]['amount'];
            $pid = $ret[0]['id'];
        }else{
            return array ("state" => 200, "info" => "订单不存在或已经支付过，请确认后重试！");
        }

        $param = unserialize($ret[0]['body']);

        $balance = 0;   // 使用余额
        $payAmount = 0; // 在线支付金额;

        // 使用余额
        if($useBalance){

            //验证余额
            if($amount > $userinfo['money']){
                return array("state" => 200, "info" => "余额不足！");
            }

            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) {
                return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
            }

            if($check){
                return 'ok';
            }

            //成功之后增加消费操作日志
            $time = GetMkTime(time());
            $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `paytype` ='$paytype', `pubdate` = '$time', `state` = 1 WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($archives, "update");

            //更新账户余额
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$userid'");
            $dsql->dsqlOper($archives, "update");

            //查询会员信息
            $userinfo  = $userLogin->getMemberInfo();
            $usermoney = $userinfo['money'];

            $title = "付费查看电话号码：" . $param['title'];
            $urlParam = serialize($param['url']);
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$amount', '$title', '$time','siteConfig','payPhone','$pid','$urlParam','$title','$ordernum','$usermoney')");
            $res = $dsql->dsqlOper($archives, "update");

        }else{
            $payAmount = $amount;
        }

        if($check){
            return 'ok';
        }

        if($payAmount || $qr){
            
            if ($paytype != 'huoniao_bonus'){
                $order =  createPayForm("siteConfig", $ordernum, $payAmount, $paytype, '付费查看电话号码', $param);
                // $timeout = GetMkTime(time()) + 3600;
                // $order['timeout'] = $timeout;
                return $order;
            }
            return createPayForm("siteConfig", $ordernum, $payAmount, $paytype, '付费查看电话号码', $param);

        }else{
            
            $this->payPhoneSuccess($ordernum);

            if($tourl){
                if(!$isMobile){
                    echo  json_encode(array('state' =>100,'info'=>$tourl));die;
                }else{
                    return $tourl;
                }
            }else{
                return self::$langData['siteConfig'][16][55];  //支付成功
            }

        }


    }

    /**
     * 付费查看电话号码支付成功
     * @param ordernum
     * @return array
     */
    public function payPhoneSuccess($ordernum = ''){

        if(empty($ordernum)){
            $ordernum = $this->param;
        }

        global $dsql;
        global $userLogin;

		if(!empty($ordernum)){
			$date     = GetMkTime(time());

            //查询paylog
            $sql = $dsql->SetQuery("SELECT `uid`, `body`, `amount`, `paytype`, `pubdate`, `transaction_id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                $uid = $ret[0]['uid'];
                $body = $ret[0]['body'];
                $amount = $ret[0]['amount'];
                $paytype = $ret[0]['paytype'];
                $pubdate = $ret[0]['pubdate'];

                $bodyArr = unserialize($body);

                $cityid = $bodyArr['cityid'];
                $module = $bodyArr['module'];
                $temp   = $bodyArr['temp'];
                $aid    = $bodyArr['aid'];
                $title  = $bodyArr['title'];
                $url    = serialize($bodyArr['url']);

                //增加订单记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__site_pay_phone` (`ordernum`, `cityid`, `uid`, `module`, `temp`, `aid`, `title`, `url`, `paytype`, `amount`, `pubdate`) VALUES ('$ordernum', '$cityid', '$uid', '$module', '$temp', '$aid', '$title', '$url', '$paytype', '$amount', '$pubdate')");
                $dsql->dsqlOper($sql, "update");

                //记录用户行为日志
                memberLog($uid, 'siteConfig', 'payPhone', 0, 'insert', '付费查看电话('.$module.'=>'.$temp.'=>'.$aid.'=>'.$amount.'元)', '', $sql);

				//分销信息
				global $cfg_fenxiaoState;
				global $cfg_payPhoneFenxiao;
                global $cfg_payPhoneFenxiaoFee;
                global $cfg_fenxiaoDeposit;

				//分销金额
				$_fenxiaoAmount = 0;
				if($cfg_fenxiaoState && $cfg_payPhoneFenxiao && $amount > 0.01 && $cfg_payPhoneFenxiaoFee > 0){
                    $_fenxiaoAmount = sprintf("%.2f", ($amount * $cfg_payPhoneFenxiaoFee / 100));
				}

				$_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                //分佣 开关
                $fenxiaoTotalPrice = $_fenxiaoAmount;
                $paramarr['ordernum'] = $ordernum;
                $paramarr['title'] = '付费查看电话';
                $paramarr['amount'] = $_fenxiaoAmount;
                $paramarr['module'] = $module;
                if($cfg_fenxiaoState && $cfg_payPhoneFenxiao && $_fenxiaoAmount > 0 && $uid != -1){
                    (new member())->returnFxMoney("payPhone", $uid, $ordernum, $paramarr);

                    //查询一共分销了多少佣金
                    //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    if(!$cfg_fenxiaoDeposit){
                        $_title = "付费查看电话，订单号：" . $ordernum;
                        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'payPhone'");
                        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                        $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
                    }
                }

                //平台收=订单金额-分销金额
                $fee  = sprintf("%.2f", $amount - $fenxiaoTotalPrice);

                //分站佣金
                $fzFee = cityCommission($cityid, 'payPhone');
				//将费用打给分站
				$fztotalAmount_ =  sprintf("%.2f", $fee * (float)$fzFee / 100);
				$fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                $fee-=$fztotalAmount_;//总站-=分站
				$fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
				$dsql->dsqlOper($fzarchives, "update");

                //增加平台和分站收入记录
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$amount', '付费查看电话：$title', '$date','$cityid','$fztotalAmount_','$module',$fee,'1','payPhone')");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);

                $cityName = getSiteCityName($cityid);

                $cityMoney = getcityMoney($cityid);   //获取分站总收益
                $allincom = getAllincome();             //获取平台今日收益
                $infoname = getModuleTitle(array('name' => $module));    //获取模块名
                $userinfo = $userLogin->getMemberInfo($uid);

				 //微信通知
			    $param = array(
		    		'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
                        'contentrn'  => $cityName."分站\r\n".$infoname."模块付费查看电话\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n获得佣金：".sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$cityMoney"
			        )
			    );

			    $params = array(
		    		'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
		        	'cityid' => $cityid,
		            'notify' => '管理员消息通知',
		            'fields' =>array(
                        'contentrn'  => $cityName."分站 \r\n".$infoname."模块付费查看电话\r\n用户：".$userinfo['nickname']."\r\n信息：".$title."\r\n\r\n平台获得佣金:".sprintf("%.2f", $fee)."\r\n分站获得佣金: ".sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$allincom"
			        )
			    );

		        //后台微信通知
                updateAdminNotice($module, "detail",$param);
                updateAdminNotice($module, "detail",$params);
                


            }

        }


    }


    /**
     * 查询附近城市（ N公里以内、且开通分站）
     */
    public function nearbyCity(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $customSubDomain;
        global $cfg_staticVersion;
        global $cfg_sameAddr_nearby;
        $cfg_sameAddr_nearby = $cfg_sameAddr_nearby ?: 60;
        $cfg_sameAddr_nearby = $cfg_sameAddr_nearby * 1000;
        $lat = $this->param['lat'];
        $lng = $this->param['lng'];
        if(empty($lat) || empty($lng)){
            return array("info"=>"缺少经纬度参数","state"=>200);
        }
        $cityid = $this->param['cityid'];
        if(empty($cityid)){
            return array("info"=>"缺少cityid参数","state"=>200);
        }
        //取得所有分站
        $sql = $dsql->SetQuery("select c.*,a.`typename`, a.`pinyin`,a.`parentid`,a.`longitude` 'lng',a.`latitude` 'lat' from `#@__site_city` c LEFT JOIN `#@__site_area` a ON c.`cid`=a.`id` where c.`state`=1");
        $cityList = $dsql->getArrList($sql);
        if(is_string($cityList)){
            return array("info"=>200,"state"=>$cityList);
        }
        //遍历分站，根据经纬度，过滤60公里以内分站城市
        foreach ($cityList as $k => $v){
            $loc=oldgetDistance($v['lng'],$v['lat'],$lng,$lat); // 单位为m
            if($loc>$cfg_sameAddr_nearby){  // 范围内
                unset($cityList[$k]);
            }
            if(!$v['lng'] || !$v['lat']){ // 经纬度为空
                unset($cityList[$k]);
            }
        }
        //取得所有的cityid
        $ids = array_column($cityList,"cid","cid");
        //重新组合array
        $keys = array_column($cityList,'cid');
        $vals = array_values($cityList);
        $cityList = array_combine($keys,$vals);
        //排除当前定位cityid
        if(in_array($cityid,$ids)){
            unset($cityList[$cityid]);
            unset($ids[$cityid]);
        }
        //遍历所有的元素父级，查询是否有父子关系，如果有则只保留子元素(删除父元素）
        foreach ($cityList as $k=>$value){
            $parent = $value['parentid'];
            while ($parent!=0){
                //父元素在当前列表中，则删除该父元素
                if(in_array($parent,$ids)){
                    unset($cityList[$parent]);
                    unset($ids[$parent]);
                }
                $sql = $dsql->SetQuery("select * from `#@__site_area` where `id`=$parent");
                $parentInfo = $dsql->getArr($sql);
                //数据不存在，表损坏或数据不正常
                if(!is_array($parentInfo)){
                    $parent = 0;
                }
                //迭代
                else{
                    $parent = $parentInfo['parentid'];
                }
            }
        }
        $list = array();
        if(empty($cityList)){
            return array("info"=>"暂无相关数据","state"=>200);
        }
        foreach ($cityList as $k=>$value){
            $domainInfo = getDomain('siteConfig', 'city', $value['cid']);
            $domain = $domainInfo['domain'];
            $ndomain = "";
            if ($value['type'] == 0) {
                $ndomain = $domain;
            } elseif ($value['type'] == 1) {
                $ndomain = $domain . "." . str_replace('www.', '', $cfg_basehost);
            } elseif ($value['type'] == 2) {
                $ndomain = $cfg_basehost . (count($cityList) == 1 ? "" : "/" . $domain);
            }

            $item['id'] = $value['id'];
            $item['cityid'] = $value['cid'];
            $item['domain'] = $domain;
            $item['url'] = $cfg_secureAccess . $ndomain;
            $item['name'] = $value['typename'];
            $item['pinyin'] = $value['pinyin'];
            $item['type'] = $value['type'];
            $item['default'] = $value['defaultcity'];
            $item['hot'] = $value['hot'];
            $item['lat'] = $value['lat'];
            $item['lng'] = $value['lng'];

            //父级信息
            $this->param = array('tab' => 'site_area', 'id' => $value['cid']);
            $parent = $this->getPublicParentInfo();
            $item['parent'] = $parent;

            $list[] = $item;
        }

        return $list;
    }

    /**
     * 获取已开通的第一级的子分站信息
     */
    public function siteCityFirst(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $customSubDomain;
        global $cfg_staticVersion;
        global $HN_memory;
        //尝试读取缓存
        $site_city_cache = $HN_memory->get('siteCityFirst');
        if($site_city_cache){
            return $site_city_cache;
        }
        //取得所有分站
        $sql = $dsql->SetQuery("select c.*,a.`id` 'aid',a.`typename`, a.`pinyin`,a.`parentid`,a.`longitude` 'lng',a.`latitude` 'lat' from `#@__site_city` c LEFT JOIN `#@__site_area` a ON c.`cid`=a.`id` where c.`state`=1");
        $cityList = $dsql->getArrList($sql);
        if(is_string($cityList)){
            return array("info"=>200,"state"=>$cityList);
        }
        //遍历出所有分站的最顶层地区信息，并统计数量
        $libs = array();
        foreach ($cityList as $k=>$value){

            $parent = $value['parentid'];  // aid 的 parentid
            $lv1 = $value['aid'];  // aid
            // 如果不是顶层，则遍历出地区最顶层元素
            while ($parent!=0){
                $sql = $dsql->SetQuery("select * from `#@__site_area` where `id`=$parent");
                $parentInfo = $dsql->getArr($sql);
                //数据不存在，表损坏或数据不正常
                if(!is_array($parentInfo)){
                    $parent = 0;
                    $lv1 = 0;
                }
                //迭代
                else{
                    $parent = $parentInfo['parentid'];
                    $lv1 = $parentInfo['id'];
                }
            }
            // 该顶层地区数据
            $lib_item = $libs[$lv1] ?: array();
            if($value['parentid']){  // 子元素
                $lib_item['son'] = (int)$lib_item['son'] + 1;
            }else{  // 当前城市是分站
                $lib_item['is_site'] = 1;
            }
            $libs[$lv1] = $lib_item;
        }
        //获取所有顶级地区
        $list = array();
        $aids = array_filter(array_keys($libs));
        if(!$aids){
            return array("info"=>"暂无相关数据","state"=>200);
        }
        $sql = $dsql->SetQuery("SELECT c.*,a.`id` 'aid', a.`typename`, a.`pinyin`, a.`longitude`, a.`latitude` from `#@__site_area` a LEFT JOIN `#@__site_city` c ON a.`id`=c.`cid` where a.`id` in(".join(",",$aids).") order by a.`weight` asc");
        $res = $dsql->getArrList($sql);

        // 数据处理
        foreach ($res as $k=>$value){
            $item['id'] = (int)$value['aid'];
            //当前城市是否为分站
            $item['is_site'] = (int)$libs[$value['aid']]['is_site'];
            if($item['is_site']){
                $item['is_site'] = (int)$value['state'];
            }
            if($item['is_site']){
                $domainInfo = getDomain('siteConfig', 'city', $value['aid']);
                $domain = $domainInfo['domain'];
                $ndomain = "";
                if ($value['type'] == 0) {
                    $ndomain = $domain;
                } elseif ($value['type'] == 1) {
                    $ndomain = $domain . "." . str_replace('www.', '', $cfg_basehost);
                } elseif ($value['type'] == 2) {
                    $ndomain = $cfg_basehost . (count($cityList) == 1 ? "" : "/" . $domain);
                }
                $item['domain'] = $domain;
                $item['type'] = $value['type'];
                $item['default'] = $value['defaultcity'];
                $item['hot'] = $value['hot'];
            }
            $item['son'] = (int)$libs[$value['aid']]['son'];  //取得子元素数量
            $item['cityid'] = (int)$value['aid'];
            $item['url'] = $cfg_secureAccess . $ndomain;
            $item['name'] = $value['typename'];
            $item['pinyin'] = $value['pinyin'];
            $item['lat'] = $value['latitude'];
            $item['lng'] = $value['longitude'];

            $list[] = $item;
        }
        //写入缓存
        $HN_memory->set('siteCityFirst', $list);

        return $list;
    }


    /**
     * 获取指定 cityid 的子分站信息
     */
    public function siteCityById(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $customSubDomain;
        global $cfg_staticVersion;
        global $HN_memory;
        $id = $this->param['id'];
        if(empty($id)){
            return array("info"=>"缺少上级城市的cityid","state"=>200);
        }
        //尝试读取缓存
        $site_city_cache = $HN_memory->get('siteCityById'.$id);
        if($site_city_cache){
            return $site_city_cache;
        }
        //取得所有分站
        $sql = $dsql->SetQuery("select c.*,a.`id` 'aid',a.`typename`, a.`pinyin`,a.`parentid`,a.`longitude` 'lng',a.`latitude` 'lat' from `#@__site_city` c LEFT JOIN `#@__site_area` a ON c.`cid`=a.`id` where c.`state`=1");
        $cityList = $dsql->getArrList($sql);
        if(is_string($cityList)){
            return array("info"=>200,"state"=>$cityList);
        }
        //向上逐个寻找，是否与所查找的cityid匹配（已知是查找 $id 的子级，所以只查找 $parent=$id）
        $libs = array();
        foreach ($cityList as $k=>$value){
            $lv = $value['aid'];  // aid
            $parent = $value['parentid'];  // aid 的 parentid
            //遍历出所有父元素
            while ($parent!=0 && $parent!=$id){
                $sql = $dsql->SetQuery("select * from `#@__site_area` where `id`=$parent");
                $parentInfo = $dsql->getArr($sql);
                //数据不存在，表损坏或数据不正常
                if(!is_array($parentInfo)){
                    $parent = 0;
                    $lv = 0;
                }
                //迭代
                else{
                    $parent = $parentInfo['parentid'];
                    $lv = $parentInfo['id'];
                }
            }
            //如果匹配到了数据，统计数量
            if($parent){
                $libs[$lv] = $libs[$lv] ?: array();
                if($value['parentid']==$parent){
                    $libs[$lv]['is_site'] = 1;
                }else{
                    $libs[$lv]['son'] = (int)$libs[$lv]['son'] + 1;
                }
            }
        }
        //获取所有该子级分类
        $list = array();
        $aids = array_keys($libs);
        if(!$aids){
            return array("info"=>"暂无相关数据","state"=>200);
        }
        $sql = $dsql->SetQuery("SELECT c.*,a.`id` 'aid', a.`typename`, a.`pinyin`, a.`longitude`, a.`latitude` from `#@__site_area` a LEFT JOIN `#@__site_city` c ON a.`id`=c.`cid` where a.`id` in(".join(",",$aids).")");
        $res = $dsql->getArrList($sql);

        // 数据处理
        foreach ($res as $k=>$value){
            $item['id'] = (int)$value['aid'];
            $item['son'] = (int)$libs[$value['aid']]['son'];  //取得子元素数量
            $item['cityid'] = (int)$value['aid'];
            //当前城市是否为分站
            $item['is_site'] = (int)$libs[$value['aid']]['is_site'];
            if($item['is_site']){
                $item['is_site'] = (int)$value['state'];
            }
            //如果是分站
            if($item['is_site']){
                $domainInfo = getDomain('siteConfig', 'city', $value['aid']);
                $domain = $domainInfo['domain'];
                $ndomain = "";
                if ($value['type'] == 0) {
                    $ndomain = $domain;
                } elseif ($value['type'] == 1) {
                    $ndomain = $domain . "." . str_replace('www.', '', $cfg_basehost);
                } elseif ($value['type'] == 2) {
                    $ndomain = $cfg_basehost . (count($cityList) == 1 ? "" : "/" . $domain);
                }
                $item['domain'] = $domain;
                $item['url'] = $cfg_secureAccess . $ndomain;
                $item['type'] = $value['type'];
                $item['default'] = $value['defaultcity'];
                $item['hot'] = $value['hot'];
            }
            $item['name'] = $value['typename'];
            $item['pinyin'] = $value['pinyin'];
            $item['lat'] = $value['latitude'];
            $item['lng'] = $value['longitude'];

            $list[] = $item;
        }

        //写入缓存
        $HN_memory->set('siteCityById'.$id, $list);

        return $list;
    }


    /**
     * 获取远程视频并下载到本地然后传到远程附件
     * 支持：抖音、快手
     * @param module string 模块标识
     * @param url    string 要提取的视频链接，支持内容+链接的混合数据
     * @return array
     */
    public function getRemoteVideo(){
        global $userLogin;
        global $langData;

        $param = $this->param;

        $module = $param['module'] ?: 'siteConfig';
        $url = trim($param['url']);

        if(empty($url)){
            return array("state" => 200, "info" => "链接不得为空！");
        }

        $userid = $userLogin->getMemberID();
        if($userid == -1) return array ("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        //提取链接
        preg_match_all("/(http|https):[\/]{2}[a-z]+[.]{1}[a-z\d\-]+[.]{1}[a-z\d]*[\/]*[A-Za-z\d]*[\/]*[A-Za-z\d]*/", $url, $urlArr);
        $videoUrl = (string)$urlArr[0][0];

        if(!strstr($videoUrl, 'douyin') && !strstr($videoUrl, 'kuaishou')){
            return array("state" => 200, "info" => "只支持抖音或快手的视频！");
        }

        global $cfg_ftpState;
        global $cfg_ftpType;
        global $cfg_ftpDir;
        global $editor_ftpState;
        global $editor_ftpType;
        global $editor_uploadDir;
        global $editor_ftpDir;
        $editor_uploadDir = '/uploads';
        $editor_ftpState = $cfg_ftpState;
        $editor_ftpType = $cfg_ftpType;
        $editor_ftpDir = $cfg_ftpDir;

        //抖音视频
        if(strstr($videoUrl, 'douyin')){

            //由于分享链接会302跳转到真实地址，这里先获取下重定向后的地址
            $header = get_headers($videoUrl, 1);

            //真实地址信息，链接格式为：https://www.iesdouyin.com/share/video/7182964428399316282/?region=CN&mid=7182964496850307895&u_code=lkl6glba&did=MS4wLjABAAAAcNSbHrRTil5Z_G9I6AtBVED9DpAFNSwQ8vzWI1Ouhjc&iid=MS4wLjABAAAA947bgVlxIVxugfhkeVxCaX1BAlo4YXY0E-BtkCH6AHI&with_sec_did=1&titleType=title&from_ssr=1&timestamp=1675422262&utm_campaign=client_share&app=aweme&utm_medium=ios&tt_from=copy&utm_source=copy
            $realUrl = $header['Location'];

            //拆分链接信息
            $realUrlArr = explode('/', $realUrl);

            //获取视频ID
            $item_id = $realUrlArr[count($realUrlArr) - 2];

            $retries = 0;  //重试次数
            $remoteData = null;  //获取到的接口数据

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => 'https://tiktok.iculture.cc/X-Bogus',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS =>'{
                    "url":"https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id='.$item_id.'&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333",
                    "user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
                }',
                CURLOPT_HTTPHEADER => array(
                    'User-Agent: FancyPig',
                    'Content-Type: application/json',
                    'Accept: */*',
                    'Host: tiktok.iculture.cc',
                    'Connection: keep-alive'
                ),
            ));
            
            $json_array= json_decode(curl_exec($curl));
            curl_close($curl);
            $new_url = $json_array->param;
            $msToken = substr(str_shuffle('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 107);
            
            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $new_url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_CUSTOMREQUEST => 'GET',
                CURLOPT_HTTPHEADER => array(
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                    'Referer: https://www.douyin.com/',
                    'Cookie: msToken='.$msToken.';odin_tt=324fb4ea4a89c0c05827e18a1ed9cf9bf8a17f7705fcc793fec935b637867e2a5a9b8168c885554d029919117a18ba69; ttwid=1%7CWBuxH_bhbuTENNtACXoesI5QHV2Dt9-vkMGVHSRRbgY%7C1677118712%7C1d87ba1ea2cdf05d80204aea2e1036451dae638e7765b8a4d59d87fa05dd39ff; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWNsaWVudC1jc3IiOiItLS0tLUJFR0lOIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLVxyXG5NSUlCRFRDQnRRSUJBREFuTVFzd0NRWURWUVFHRXdKRFRqRVlNQllHQTFVRUF3d1BZbVJmZEdsamEyVjBYMmQxXHJcbllYSmtNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVKUDZzbjNLRlFBNUROSEcyK2F4bXAwNG5cclxud1hBSTZDU1IyZW1sVUE5QTZ4aGQzbVlPUlI4NVRLZ2tXd1FJSmp3Nyszdnc0Z2NNRG5iOTRoS3MvSjFJc3FBc1xyXG5NQ29HQ1NxR1NJYjNEUUVKRGpFZE1Cc3dHUVlEVlIwUkJCSXdFSUlPZDNkM0xtUnZkWGxwYmk1amIyMHdDZ1lJXHJcbktvWkl6ajBFQXdJRFJ3QXdSQUlnVmJkWTI0c0RYS0c0S2h3WlBmOHpxVDRBU0ROamNUb2FFRi9MQnd2QS8xSUNcclxuSURiVmZCUk1PQVB5cWJkcytld1QwSDZqdDg1czZZTVNVZEo5Z2dmOWlmeTBcclxuLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbiJ9',
                    'Accept: */*',
                    'Host: www.douyin.com',
                    'Connection: keep-alive'
                ),
            ));
            $remoteData = json_decode(curl_exec($curl), true);
            curl_close($curl);

            // while(!$remoteData && $retries < 3) {
            //     $retries++;
            //     $remoteData = hn_curl('https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=' . $item_id, array(), '', 'GET');
            //     $remoteData = json_decode($remoteData, true);
            //     if(!is_array($remoteData)) {
            //         $remoteData = null;
            //     }
            // }

            if($remoteData != null) { 
                $aweme_detail = $remoteData['aweme_detail'];
                $videoDesc = $aweme_detail['desc'];  //视频文案
                $duration = (int)($aweme_detail['duration'] / 1000);  //视频时长（秒）

                $video = $aweme_detail['video'];
                $cover = $video['dynamic_cover']['url_list'][0];  //封面
                $width = $video['width'];  //视频宽度
                $height = $video['height'];  //视频高度

                //视频地址
                $video_url = $video['play_addr']['url_list'][0];

            } else { 
                return array("state" => 200, "info" => "获取失败，请稍候重试！");
            }


        }
        //快手视频
        elseif(strstr($videoUrl, 'kuaishou')){

            //由于分享链接会302跳转到真实地址，这里先获取下重定向后的地址
            $header = get_headers($videoUrl, 1);

            //真实地址信息，链接格式为：https://v.m.chenzhongtech.com/fw/photo/3x9bk5r6a3jvtck?fid=537447279&cc=share_copylink&followRefer=151&shareMethod=TOKEN&docId=9&kpn=KUAISHOU&subBiz=BROWSE_SLIDE_PHOTO&photoId=3x9bk5r6a3jvtck&shareId=17362212138976&shareToken=X8405Tnrz6JFdD5&shareResourceType=PHOTO_OTHER&userId=3xyzbgwzfq7six9&shareType=1&et=1_a%2F2005810743399525745_h219&shareMode=APP&originShareId=17362212138976&appType=1&shareObjectId=5245286286021067820&shareUrlOpened=0&timestamp=1676356223469
            $realUrl = $header['Location'];

            //拆分链接信息
            $realUrlArr = explode('/', $realUrl);

            $urlQuery = parse_url($realUrl)['query'];
            parse_str($urlQuery, $param);
            $photoId = $param['photoId'];
            $fid = $param['fid'];

            $retries = 0;  //重试次数
            $remoteData = null;  //获取到的接口数据

            //POST参数
            $param = array(
                "fid" => $fid,
                "kpn" => "KUAISHOU",
                "photoId" => $photoId
            );

            //自定义header
            $headers = array();
            $headers[] = "Cookie: did=web_f40b6c07a46141f2bf6e8ecab676fb56; didv=1676355743000";
            $headers[] = "Referer: $realUrl";

            while(!$remoteData && $retries < 3) {
                $retries++;
                $remoteData = hn_curl('https://v.m.chenzhongtech.com/rest/wd/photo/info?kpn=KUAISHOU&captchaToken=', $param, 'json', 'POST', $headers);
                $remoteData = json_decode($remoteData, true);
                if(!is_array($remoteData) || $remoteData['result'] != 1) {
                    $remoteData = null;
                }
            }

            if($remoteData != null) { 

                $videoDesc = $remoteData['shareInfo']['shareTitle'];  //视频文案
                $duration = (int)($remoteData['photo']['duration'] / 1000);  //视频时长（秒）

                $photo = $remoteData['photo'];
                $cover = $photo['coverUrls'][0]['url'];  //封面
                $width = $photo['width'];  //视频宽度
                $height = $photo['height'];  //视频高度
                
                //视频地址
                $video_url = $remoteData['mp4Url'];

            } else { 
                return array("state" => 200, "info" => "获取失败，请稍候重试！");
            } 

        }
        

        //下载封面到本地
        $savePath = $editor_uploadDir . '/'.$module.'/video/large/'.date( 'Y' ).'/'.date( 'm' ).'/'.date( 'd' ).'/';
        $coverInfo = getRemoteImage(array($cover), array(
            'savePath' => '..' . $savePath,
            'maxSize' => 1024000,
        ), $module, '..', false);

        $coverInfo = json_decode($coverInfo, true);

        if($coverInfo['state'] != 'SUCCESS' || $coverInfo['list'][0]['state'] != 'SUCCESS'){
            return array("state" => 200, "info" => "视频封面保存失败，请稍候重试！");
        }

        $coverPath = str_replace($editor_uploadDir, '', $coverInfo['list'][0]['path']);
        $coverTurl = $coverInfo['list'][0]['turl'];

        //文件名，用于对下面的视频进行命名
        $coverName = explode('.', substr(strrchr($coverPath, "/"), 1));
        $coverName = $coverName[0];

        //下载视频到本地
        $videoName = $coverName . '.mp4';;
        $videoPath = $savePath . $videoName;
        
        $videoInfo = getRemoteImage(array($video_url), array(
            'savePath' => '..' . $savePath,
            'maxSize' => 1024 * 2 * 500,
            'fileName' => $videoName,
            'video' => array(
                'poster' => $coverPath,
                'width' => $width,
                'height' => $height,
                'duration' => $duration
            )
        ), $module, '..', false, false, 'mp4');

        $videoInfo = json_decode($videoInfo, true);

        if($videoInfo['state'] != 'SUCCESS' || $videoInfo['list'][0]['state'] != 'SUCCESS'){
            delPicFile($coverPath, 'delVideo', $module, true);  //下载失败，需要把封面也删除掉
            return array("state" => 200, "info" => "视频保存失败，请稍候重试！");
        }

        $videoPath = str_replace($editor_uploadDir, '', $videoInfo['list'][0]['path']);
        $videoTurl = $videoInfo['list'][0]['turl'];

        return array(
            'desc' => $videoDesc,
            'duration' => $duration,
            'width' => $width,
            'height' => $height,
            'cover' => array(
                'path' => $coverPath,  //目录路径，保存数据库时使用
                'url' => $coverTurl,  //真实地址
            ),
            'video' => array(
                'path' => $videoPath,
                'url' => $videoTurl
            )
        );

    }

    /**
     * Notes: 获取两个坐标的距离
     *
     * @return array
     */
    public function getDistance()
    {
        if (!empty($this->param)) {
            $originlng      = $this->param['originlng'];
            $originlat      = $this->param['originlat'];
            $destinationlng = $this->param['destinationlng'];
            $destinationlat = $this->param['destinationlat'];
            if ($originlng == '' || $originlat == '' || $destinationlng == '' || $destinationlat == '') {
                return array ("state" => 200, "info" => '坐标有误！');
            }

        } else {
            return array ("state" => 200, "info" => '格式错误');
        }

        $distance = oldgetDistance($originlng, $originlat, $destinationlng, $destinationlat);  //返回结果单位为米

        return floatval(sprintf('%.2f', $distance / 1000));

    }

    /**
     * 生成微信前端页面需要用到的签名信息
     * 根据指定页面进行生成，用于打包的h5页面
     * 
     * @return array
     */
    public function getWeChatSignPackage()
    {
        if (!empty($this->param)) {
            $url = $this->param['url'];
        } else {
            return array ("state" => 200, "info" => '格式错误');
        }

        if(!$url) return array ("state" => 200, "info" => 'url不得为空');

        global $cfg_wechatAppid;
        global $cfg_wechatAppsecret;

        $jssdk = new WechatJSSDK($cfg_wechatAppid, $cfg_wechatAppsecret);
	    $signPackage = $jssdk->getSignPackage($url);

        return array(
            'appId' => $signPackage['appId'],
            'nonceStr' => $signPackage['nonceStr'],
            'timestamp' => $signPackage['timestamp'],
            'signature' => $signPackage['signature']
        );

    }



}
