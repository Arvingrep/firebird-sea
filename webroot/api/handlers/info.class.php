<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 信息模块API接口
 *
 * @version        $Id: info.class.php 2014-3-24 下午14:51:14 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class info
{
    private $param;  //参数

    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array())
    {
        $this->param = $param;
    }

    /**
     * 信息基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/info.inc.php");

        global $cfg_fileUrl;              //系统附件默认地址
        global $cfg_uploadDir;            //系统附件默认上传目录
        // global $customFtp;                //是否自定义FTP
        // global $custom_ftpState;          //FTP是否开启
        // global $custom_ftpUrl;            //远程附件地址
        // global $custom_ftpDir;            //FTP上传目录
        // global $custom_uploadDir;         //默认上传目录
        global $cfg_basehost;             //系统主域名
        global $cfg_hotline;              //系统默认咨询热线

        // global $customChannelName;        //模块名称
        // global $customLogo;               //logo使用方式
        global $cfg_weblogo;              //系统默认logo地址
        global $cfg_sharePic;             //分享默认图片
        // global $customLogoUrl;            //logo地址
        // global $customSubDomain;          //访问方式
        // global $customChannelSwitch;      //模块状态
        // global $customCloseCause;         //模块禁用说明
        // global $customSeoTitle;           //seo标题
        // global $customSeoKeyword;         //seo关键字
        // global $customSeoDescription;     //seo描述
        // global $customHotline;            //咨询热线
        // global $customAtlasMax;           //图集数量限制
        // global $customTemplate;           //模板风格

        // global $customUpload;             //上传配置是否自定义
        global $cfg_softSize;             //系统附件上传限制大小
        global $cfg_softType;             //系统附件上传类型限制
        global $cfg_thumbSize;            //系统缩略图上传限制大小
        global $cfg_thumbType;            //系统缩略图上传类型限制
        global $cfg_atlasSize;            //系统图集上传限制大小
        global $cfg_atlasType;            //系统图集上传类型限制

        // global $custom_softSize;          //附件上传限制大小
        // global $custom_softType;          //附件上传类型限制
        // global $custom_thumbSize;         //缩略图上传限制大小
        // global $custom_thumbType;         //缩略图上传类型限制
        // global $custom_atlasSize;         //图集上传限制大小
        // global $custom_atlasType;         //图集上传类型限制

        //获取当前城市名
        global $siteCityInfo;
        if (is_array($siteCityInfo)) {
            $cityName = $siteCityInfo['name'];
        }

        //如果上传设置为系统默认，则以下参数使用系统默认
        if ($customUpload == 0) {
            $custom_softSize  = $cfg_softSize;
            $custom_softType  = $cfg_softType;
            $custom_thumbSize = $cfg_thumbSize;
            $custom_thumbType = $cfg_thumbType;
            $custom_atlasSize = $cfg_atlasSize;
            $custom_atlasType = $cfg_atlasType;
        }

        $hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

        $params = !empty($this->param) && !is_array($this->param) ? explode(',', $this->param) : "";

        // $domainInfo = getDomain('info', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('info', $customSubDomain);

        //分站自定义配置
        $ser = 'info';
        global $siteCityAdvancedConfig;
        if($siteCityAdvancedConfig && $siteCityAdvancedConfig[$ser]){
            if($siteCityAdvancedConfig[$ser]['title']){
                $customSeoTitle = $siteCityAdvancedConfig[$ser]['title'];
            }
            if($siteCityAdvancedConfig[$ser]['keywords']){
                $customSeoKeyword = $siteCityAdvancedConfig[$ser]['keywords'];
            }
            if($siteCityAdvancedConfig[$ser]['description']){
                $customSeoDescription = $siteCityAdvancedConfig[$ser]['description'];
            }
            if($siteCityAdvancedConfig[$ser]['logo']){
                $customLogoUrl = $siteCityAdvancedConfig[$ser]['logo'];
            }
            if($siteCityAdvancedConfig[$ser]['hotline']){
                $hotline = $siteCityAdvancedConfig[$ser]['hotline'];
            }
        }

        $customSeoDescription = trim($customSeoDescription);

        $return = array();
        if (!empty($params) > 0) {

            foreach ($params as $key => $param) {
                if ($param == "channelName") {
                    $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
                } elseif ($param == "logoUrl") {

                    //自定义LOGO
                    if ($customLogo == 1) {
                        $customLogo = getAttachemntFile($customLogoUrl);
                    } else {
                        $customLogo = getAttachemntFile($cfg_weblogo);
                    }

                    $return['logoUrl'] = $customLogo;
                } elseif ($param == "subDomain") {
                    $return['subDomain'] = $customSubDomain;
                } elseif ($param == "channelDomain") {
                    $return['channelDomain'] = $customChannelDomain;
                } elseif ($param == "channelSwitch") {
                    $return['channelSwitch'] = $customChannelSwitch;
                } elseif ($param == "closeCause") {
                    $return['closeCause'] = $customCloseCause;
                } elseif ($param == "title") {
                    $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
                } elseif ($param == "keywords") {
                    $return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
                } elseif ($param == "description") {
                    $return['description'] = str_replace('$city', $cityName, $customSeoDescription);
                } elseif ($param == "hotline") {
                    $return['hotline'] = $hotline;
                } elseif ($param == "atlasMax") {
                    $return['atlasMax'] = $customAtlasMax;
                } elseif ($param == "template") {
                    $return['template'] = $customTemplate;
                } elseif ($param == "touchTemplate") {
                    $return['touchTemplate'] = $customTouchTemplate;
                } elseif ($param == "softSize") {
                    $return['softSize'] = $custom_softSize;
                } elseif ($param == "softType") {
                    $return['softType'] = $custom_softType;
                } elseif ($param == "thumbSize") {
                    $return['thumbSize'] = $custom_thumbSize;
                } elseif ($param == "thumbType") {
                    $return['thumbType'] = $custom_thumbType;
                } elseif ($param == "atlasSize") {
                    $return['atlasSize'] = $custom_atlasSize;
                } elseif ($param == "atlasType") {
                    $return['atlasType'] = $custom_atlasType;
                }
            }

        } else {

            //自定义LOGO
            if ($customLogo == 1) {
                $customLogo = getAttachemntFile($customLogoUrl);
            } else {
                $customLogo = getAttachemntFile($cfg_weblogo);
            }

            $return['channelName']   = str_replace('$city', $cityName, $customChannelName);
            $return['logoUrl']       = $customLogo;
            $return['sharePic']      = getAttachemntFile($customSharePic ? $customSharePic : $cfg_sharePic);
            $return['subDomain']     = $customSubDomain;
            $return['channelDomain'] = $customChannelDomain;
            $return['channelSwitch'] = $customChannelSwitch;
            $return['closeCause']    = $customCloseCause;
            $return['title']         = str_replace('$city', $cityName, $customSeoTitle);
            $return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
            $return['description']   = str_replace('$city', $cityName, $customSeoDescription);
            $return['hotline']       = $hotline;
            $return['atlasMax']      = $customAtlasMax;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['atlasSize']     = $custom_atlasSize;
            $return['atlasType']     = $custom_atlasType;
            $return['excitation']    = $custom_excitation ? array_map('intval', explode(',', $custom_excitation)) : array();

            //延长有效期配置
            $cfg_info_Smart = $cfg_info_Smart ? unserialize($cfg_info_Smart) : array();
            $return['exteneValid'] = $cfg_info_Smart;

            //永久有效配置
            $cfg_isvalid = (int)$cfg_isvalid;
            $cfg_valid = $cfg_valid ? unserialize($cfg_valid) : array();
            $return['longValid'] = $cfg_isvalid && $cfg_valid ? $cfg_valid[0] : array();

            //发布信息地图相关配置
            $return['fabuMapConfig'] = (int)$customFabuMapConfig;  //发布信息时定位功能配置  0系统默认  1选项一  2选项二
            $return['fabuMapDisplayLocation'] = (int)$customFabuMapDisplayLocation;  //发布信息时不显示位置选项  0显示  1隐藏

        }

        return $return;

    }

    /**
     * 商圈
     * @return array
     */
    public function circle(){
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['info'][1][58]);//格式错误！
            }else{
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        if(empty($type)) return array("state" => 200, "info" => $langData['info'][1][58]);

        $page = (int)$page;
        $pageSize = (int)$pageSize;

        $page = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 1000 : $pageSize;
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE `qid` = $type".$where);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return $ret;
        }
    }


    /**
     * 配置商铺
     * @return array
     */
    public function storeConfig()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $userid    = $userLogin->getMemberID();
        $param     = $this->param;
        $stype     = (int)$param['stype'];
        $addrid    = (int)$param['addrid'];
        $cityid    = (int)$param['cityid'];
        $circle    = $param['circle'];
        $circle    = isset($circle) ? join(',', $circle) : '';
        $subway    = $param['subway'];
        $subway    = isset($subway) ? join(',', $subway) : '';
        $address   = filterSensitiveWords(addslashes($param['address']));
        $lnglat    = filterSensitiveWords(addslashes($param['lnglat']));
        $phone     = filterSensitiveWords(addslashes($param['phone']));
        $openStart = filterSensitiveWords(addslashes($param['openStart']));
        $openEnd   = filterSensitiveWords(addslashes($param['openEnd']));
        $note      = filterSensitiveWords(addslashes($param['note']));
        $body      = filterSensitiveWords(addslashes($param['body']));
        $pubdate   = GetMkTime(time());
        $video     = $param['video'];
        $tel       = $param['tel'];
        $imglist   = $param['imglist'];
        $wechat_pic   = $param['wechat_pic'];
        if (empty($cityid)) {
            $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
            $cityInfoArr = explode(',', $cityInfoArr);
            $cityid      = $cityInfoArr[0];
        }

        if ($userid <= 0 || $userid == '') {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array("state" => 200, "info" => $langData['info'][1][59]);//账号验证错误，操作失败！
        }

        //权限验证
        if (!verifyModuleAuth(array("module" => "info"))) {
            return array("state" => 200, "info" => $langData['info'][1][60]);//商家权限验证失败！
        }

        if (empty($stype)) {
            return array("state" => 200, "info" => $langData['info'][1][61]);//请选择所属类别
        }

        if (empty($addrid)) {
            return array("state" => 200, "info" => $langData['info'][1][62]);//请选择所在区域
        }

        if (empty($circle)) {
            //return array("state" => 200, "info" => $langData['info'][1][63]);//请选择所在商圈
        }

        if (empty($address)) {
            return array("state" => 200, "info" => $langData['info'][1][64]);//请输入详细地址
        }

        if (empty($phone)) {
            return array("state" => 200, "info" => $langData['info'][1][65]);//请输入联系电话
        }

        if (empty($openStart) || empty($openEnd)) {
            return array("state" => 200, "info" => $langData['info'][1][66]);//请选择营业时间
        }

        if (empty($imglist)) {
            return array("state" => 200, "info" => $langData['info'][1][67]);//请上传图集
        }

        $openStart = str_replace(":", "", $openStart);
        $openEnd   = str_replace(":", "", $openEnd);

        if (empty($note)) {
            //return array("state" => 200, "info" => $langData['info'][1][68]);//请输入简介
        }
        $note = cn_substrR($note, 200);

        if (empty($body)) {
            // return array("state" => 200, "info" => $langData['info'][1][69]);//请输入详细介绍
        }
        if (!empty($lnglat)) {
            $lnglatArr = explode(",", $lnglat);
            $lng       = $lnglatArr[0];
            $lat       = $lnglatArr[1];
        }

        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__infoshop` WHERE `uid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //入驻审核开关
        include HUONIAOINC."/config/business.inc.php";
        $moduleJoinCheck = (int)$customModuleJoinCheck;
        $editModuleJoinCheck = (int)$customEditModuleJoinCheck;

        //新商铺
        if (!$userResult) {

            //保存到主表

            $archives = $dsql->SetQuery("INSERT INTO `#@__infoshop` (`uid`, `stype`, `addrid`, `address`, `circle`, `subway`, `lnglat`, `tel`,
    `openStart`, `openEnd`, `note`, `body`, `jointime`, `click`, `weight`, `state`, `cityid`,  `video`, `video_pic`, `pic`, `phone`, `wechat_pic` )
    VALUES ('$userid', '$stype', '$addrid', '$address', '$circle', '$subway', '$lnglat', '$phone', '$openStart', '$openEnd', '$note',
    '$body', '" . GetMkTime(time()) . "', '1', '1', '$moduleJoinCheck', '$cityid',  '$video', '', '$imglist', '$tel', '$wechat_pic')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {
                // 更新店铺开关
                updateStoreSwitch("info", "infoshop", $userid, $aid);
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——info模块——用户:'.$userDetail['username'].'新增了商家',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("info", "shop",$param);
                return $langData['info'][1][70];//配置成功，您的商铺正在审核中，请耐心等待！
            } else {
                return array("state" => 200, "info" => $langData['info'][1][71]);//配置失败，请查检您输入的信息是否符合要求！
            }
            //更新商铺信息
        } else {
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__infoshop` SET `cityid` = '$cityid', `stype` = '$stype', `subway` = '$subway', `addrid` = '$addrid', `address` = '$address', `circle` = '$circle', `lnglat` = '$lnglat', `tel` = '$phone',
`openStart` = '$openStart', `openEnd` = '$openEnd', `note` = '$note', `body` = '$body',  `video` = '$video', `pic` = '$imglist', `phone` = '$tel' , `video_pic` = '', `wechat_pic` = '$wechat_pic', `state` = '$editModuleJoinCheck' WHERE `uid` = " . $userid);
            $results  = $dsql->dsqlOper($archives, "update");
            if ($results == "ok") {
                // 清除店铺详情缓存
                clearCache("info_shop_detail", $userResult[0]['id']);
                return $langData['info'][1][72];//保存成功！
            } else {
                return array("state" => 200, "info" => $langData['info'][1][71]);
            }

        }


    }


    /**
     * 信息分类
     * @return array
     */
    public function type()
    {
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['info'][1][58]);//格式错误！
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        $results = $dsql->getTypeList($type, "infotype", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }


    /**
     * 分类模糊匹配
     * @return array
     */
    public function searchType()
    {
        global $dsql;
        $key = trim($this->param['key']);

        $list = array();
        if (!empty($key)) {
            $archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__infotype` WHERE (`typename` like '%" . $key . "%' OR `seotitle` like '%" . $key . "%' OR `keywords` like '%" . $key . "%' OR `description` like '%" . $key . "%') AND `parentid` != 0 LIMIT 0,10");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                foreach ($results as $key => $value) {

                    $list[$key]['id'] = $value['id'];
                    global $data;
                    $data                   = "";
                    $typeArr                = getParentArr("infotype", $value['id']);
                    $typeArr                = array_reverse(parent_foreach($typeArr, "typename"));
                    $list[$key]['typename'] = join(" > ", $typeArr);

                }
            }
        }

        return $list;
    }


    /**
     * 信息分类详细信息
     * @return array
     */
    public function typeDetail()
    {
        global $dsql;
        global $langData;
        $id = $this->param;

        $id = !is_numeric($id) && is_array($id) ? $id['id'] : $id;
        $id = (int)$id;

        if (empty($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        $archives = $dsql->SetQuery("SELECT `id`, `typename`, `seotitle`, `keywords`, `description`, `redirect`, `advanced`, `parentid` FROM `#@__infotype` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $archives = $dsql->SetQuery("SELECT `id`, `field`, `title`, `formtype`, `required`, `options`, `default`,`custom`,`search`,`heightlight` FROM `#@__infotypeitem` WHERE `tid` = " . $id . " ORDER BY `orderby` DESC, `id` ASC");
            $typeitem = $dsql->dsqlOper($archives, "results");
            if ($typeitem) {
                foreach ($typeitem as $key => $item) {
                    $results[0]["item"][$key]['id']       = $item['id'];
                    $results[0]["item"][$key]['field']    = $item['field'];
                    $results[0]["item"][$key]['title']    = $item['title'];
                    $results[0]["item"][$key]['formtype'] = $item['formtype'];
                    $results[0]["item"][$key]['required'] = $item['required'];
                    $results[0]["item"][$key]['custom']   = $item['custom'];
                    $results[0]["item"][$key]['search']   = (int)$item['search'];
                    $results[0]["item"][$key]['heightlight']   = (int)$item['heightlight'];
                    if ($item["options"] != "") {
                        $options = join('|', preg_split("[\r\n]", $item["options"]));
                        $results[0]["item"][$key]['options'] = explode("\r\n", $item["options"]);
                    }
                    $results[0]["item"][$key]['default'] = explode("|", $item['default']);
                }
            }
            //特色标签
            $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `tid` = " . $id . " ORDER BY `weight` ASC");
            $teseid = $dsql->dsqlOper($te, "results");
            if ($teseid) {
                foreach ($teseid as $k => $label) {
                    $results[0]["label"][$k]['id']       = $label['id'];
                    $results[0]["label"][$k]['name']    = $label['name'];
                    $results[0]["label"][$k]['weight']    = $label['weight'];
                }
            }
            $param = array(
                "service" => "info",
                "template" => "list",
                "typeid" => $id
            );
            $results[0]["url"] = getUrlPath($param);

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__infotype` WHERE `parentid` = " . $id);
            $res = $dsql->dsqlOper($sql, "totalCount");
            if ($res > 0) {
                $results[0]["lower"] = $res;
            }

            //查询分类的高级设置
            $videoSwitch = $atlasMax = $excitationSwitch = $validSwitch = $validConfig = $refreshSwitch = $refreshConfig = $refreshNormalPrice = $topSwitch = $topConfig = 0;
            $fabuTips = $sysTips = $protocol = '';
            $validRule = $refreshSmart = $topNormal = $topPlan = array();

            //引入配置文件
            include(HUONIAOINC . "/config/info.inc.php");
            $_atlasMax = (int)$customAtlasMax;  //默认最多上传图集数量
            $_fabuTips = $customFabuTips;  //发布公告
            $atlasMax = $_atlasMax;
            $sysTips = $_sysTips;

            $_typeAdvanced = $results[0]['advanced'];
            $_typeParentid = (int)$results[0]['parentid'];

            //如果不是一级分类，并且没有高级设置，查询上级
            if($_typeParentid && !$_typeAdvanced){
                $sql = $dsql->SetQuery("SELECT `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeParentid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_typeAdvanced = $ret[0]['advanced'];
                }
            }

            if($_typeAdvanced){
                $_typeAdvancedArr = json_decode($_typeAdvanced, true);
                $videoSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['videoSwitch'] : 1;
                $picSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['picSwitch'] : 0;
                $atlasMax = $picSwitch ? (int)$_typeAdvancedArr['atlasMax'] : $_atlasMax;
                $excitationSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['excitationSwitch'] : 1;
                $validSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['validSwitch'] : 1;
                $validConfig = $_typeAdvancedArr ? (int)$_typeAdvancedArr['validConfig'] : 0;
                $validRule = $_typeAdvancedArr ? $_typeAdvancedArr['validRule'] : array();
                $refreshSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['refreshSwitch'] : 1;
                $refreshConfig = $_typeAdvancedArr ? (int)$_typeAdvancedArr['refreshConfig'] : 0;
                $refreshNormalPrice = $_typeAdvancedArr ? (float)$_typeAdvancedArr['refreshNormalPrice'] : 0;
                $refreshSmart = $_typeAdvancedArr ? $_typeAdvancedArr['refreshSmart'] : array();
                $topSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['topSwitch'] : 1;
                $topConfig = $_typeAdvancedArr ? (int)$_typeAdvancedArr['topConfig'] : 0;
                $topNormal = $_typeAdvancedArr ? $_typeAdvancedArr['topNormal'] : array();
                $topPlan = $_typeAdvancedArr ? $_typeAdvancedArr['topPlan'] : array();
                $fabuTips = $_typeAdvancedArr ? $_typeAdvancedArr['fabuTips'] : '';
                $fabuTips = $fabuTips ? $fabuTips : $_fabuTips;
                $sysTips = $_typeAdvancedArr ? $_typeAdvancedArr['sysTips'] : $_sysTips;
                $protocol = $_typeAdvancedArr ? $_typeAdvancedArr['protocol'] : '';
            }

            unset($results[0]['advanced']);
            unset($results[0]['parentid']);

            //由于后台配置中，0代表开启 1为关闭，输出给前端时，需要反转一下
            $results[0]['videoSwitch'] = $videoSwitch == 0 ? 1 : 0;  //视频开关
            $results[0]['atlasMax'] = $atlasMax;  //图集最多上传数量
            $results[0]['excitationSwitch'] = $excitationSwitch == 0 ? 1 : 0;  //激励开关
            $results[0]['validSwitch'] = 1;  //延长有效期开关
            $results[0]['validConfig'] = (int)$validConfig;  //延长有效期配置 0默认 1自定义
            $results[0]['validRule'] = $validRule;  //延长有效期规则
            $results[0]['refreshSwitch'] = $refreshSwitch == 0 ? 1 : 0;  //刷新开关
            $results[0]['refreshConfig'] = $refreshConfig;  //刷新配置 0默认 1自定义
            $results[0]['refreshNormalPrice'] = $refreshNormalPrice;  //普通刷新价格
            $results[0]['refreshSmart'] = $refreshSmart;  //智能刷新规则
            $results[0]['topSwitch'] = $topSwitch == 0 ? 1 : 0;  //置顶开关
            $results[0]['topConfig'] = $topConfig;  //置顶配置 0默认 1自定义
            $results[0]['topNormal'] = $topNormal;  //普通置顶规则
            $results[0]['topPlan'] = $topPlan;  //计划置顶规则
            $results[0]['fabuTips'] = $fabuTips;  //发布声明
            $results[0]['sysTips'] = $sysTips;  //系统备注
            $results[0]['protocol'] = $protocol;  //发布协议

            return $results;
        }

    }


    /**
     * 信息地区
     * @return array
     */
    public function addr()
    {
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['info'][1][58]);
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {

            //数据共享
            require(HUONIAOINC."/config/info.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $type = getCityId();
            }

        }

        //一级
        if (empty($type)) {
            //可操作的城市，多个以,分隔
            $userLogin    = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

            $cityArr = array();
            $sql     = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
            $result  = $dsql->dsqlOper($sql, "results");
            if ($result) {
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

        } else {
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if ($results) {
                return $results;
            }
        }
    }


    /**
     * 信息列表
     * @return array
     */
    public function ilist_v2()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //VIP会员免费查看
        
        $pageinfo = $list = $itemList = array();
        $nature   = $typeid = $addrid = $valid = $title = $rec = $fire = $top = $thumb = $orderby = $u = $state = $uid = $userid = $tel = $notbid = $page = $pageSize = $where = $where1 = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['info'][1][58]);
            } else {
                $nature   = (int)$this->param['nature'];
                $memberType   = $this->param['memberType'];
                $typeid   = (int)$this->param['typeid'];
                $addrid   = (int)$this->param['addrid'];
                $valid    = $this->param['valid'];
                $title    = $this->param['title'];
                $itemList = $_REQUEST['item'];
                $rec      = (int)$this->param['rec'];
                $fire     = (int)$this->param['fire'];
                $top      = (int)$this->param['top'];
                $thumb    = (int)$this->param['thumb'];
                $video    = (int)$this->param['video'];
                $orderby  = $this->param['orderby'];
                $u        = (int)$this->param['u'];
                $state    = $this->param['state'];
                $uid      = (int)$this->param['uid'];
                $userid   = (int)$this->param['userid'];
                $tel      = $this->param['tel'];
                $notbid   = $this->param['notbid'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $shopid   = $this->param['shopid'];
                $lng      = (float)$this->param['lng'];
                $lat      = (float)$this->param['lat'];
                $flag     = $this->param['flag'];
                $price_section     = $this->param['price_section'];
                $label    = $this->param['label'];              //特色
                $distance      = $this->param['distance'];
                $hongbao = (int)$this->param['hongbao'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
                $type = $this->param['type'];              //切换  全部  推广  审核拒绝   已过期
            }
        }

        $now = strtotime(date("Y-m-d"));

        //数据共享
        require(HUONIAOINC."/config/info.inc.php");
        $dataShare = (int)$customDataShare;
        $expireShow = (int)$customExpireShow;  //过期后继续显示  0关  1开

//        if ($shopid) {
//            $sql       = "SELECT `uid` FROM `#@__infoshop` WHERE `id` = $shopid";
//            $sql       = $dsql->SetQuery($sql);
//            $shop_user = $dsql->dsqlOper($sql, "results");
//            $uid       = $shop_user[0]['uid'];
//        }

        //指定信息id
        if($id){
            $_id = array();
            $_idArr = explode(',', $id);
            foreach($_idArr as $v){
                $v = (int)$v;
                if($v){
                    array_push($_id, $v);
                }
            }
            $id = join(',', $_id);
            $where .= " AND l.`id` IN ($id)";
        }

        //推广中
        if ($type == 2) {       
            $where .= " AND (l.`isbid` = 1 OR l.`refreshSmart` = 1 OR l.`hasSetjili` = 1 ) AND l.`arcrank` = 1";
        }
        //审核拒绝
        if ($type == 3){ 
            $where .= " AND l.`arcrank` = 2";
        }
        //已过期
        if ($type == 4){ 
            $now         = GetMkTime(time());
            $where .= " AND l.`valid` < $now";
        }
        //已发布
        if ($type == 5){ 
            $where .= " AND l.`arcrank` = 1";
        }
        //待审核，已支付
        if ($type == 6){ 
            $where .= " AND l.`arcrank` = 0 AND l.`waitpay` = 0";
        }
        //待支付
        if ($type == 7){ 
            $where .= " AND l.`arcrank` = 0 AND l.`waitpay` = 1";
        }
        //待审核，包含未支付
        if ($type == 8){ 
            $where .= " AND l.`arcrank` = 0";
        }
        //已下架
        if ($type == 9){ 
            $where .= " AND l.`arcrank` = 3";
        }

        //指定会员
        if (!empty($userid)) {
            $where .= " AND l.`userid` = $userid";
        }

        //指定会员
        if (!empty($uid)) {
            $where .= " AND l.`userid` = $uid";
        }
        //特色
        if ($label){
            $lableArr = explode(',',$label);
            $Arr = array();
            foreach ($lableArr as $k){
                $Arr[] = "FIND_IN_SET('$k', l.`label`)";
            }
            $lablearr= join(' OR ',$Arr);
            $where .=  " AND (" . $lablearr . ")";
        }

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid && !$userid && !$uid && $u != 1) {
                $where .= " AND l.`cityid` = " . $cityid;
            } else {
                $where .= " AND l.`cityid` != 0";
            }
        }

        //当前登录会员的信息
        $loginUid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo(0, 1);

        //当前登录会员的绑定手机状态，小程序端隐私号功能需要用到
        $userPhoneCheck = 0;
        if($userinfo && $userinfo['phoneCheck']){
            $userPhoneCheck = 1;
        }

        //是否输出当前登录会员的信息
        if ($u != 1) {
            $where .= " AND l.`arcrank` = 1 AND l.`waitpay` = 0";
        } else {
            
//            if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "info"))) {
//                return array("state" => 200, "info" => '商家权限验证失败！');
//            }

            $where .= " AND l.`userid` = " . $loginUid;

            if ($state != "") {
                if ($state == 4) {
                    // $now    = GetMkTime(time());
                    $where1 = " AND (l.`valid` < " . $now . " OR l.`valid` = 0)";
                } else {
                    $where1 = " AND l.`arcrank` = " . $state;
                }
            }
        }



        //火急
        if (!empty($fire)) {
            $where .= " AND l.`fire` = 1";
        }

        //置顶
        if (!empty($top)) {
           $where .= " AND l.`isbid` = 1";
        }

        //指定电话号码
        if (!empty($tel)) {
            $where .= " AND l.`tel` = '$tel'";
        }

        if (!empty($video)) {
            $where .= " AND l.`video` != '' ";
        }

        //只查找不过期的信息
        if ($u != 1 && !$expireShow) {
            $now   = GetMkTime(time());
            // $where .= " AND l.`valid` > " . $now . " AND l.`valid` <> 0";
            $where .= " AND l.`valid` > " . $now;
        }

        //查询有红包的数据
        if($hongbao){
            $where .= " AND l.`readInfo` = 1 AND l.`shareInfo` = 1";
        }

        //信息性质
        if (!empty($nature)) {
            // if(!$dataShare){
            //     $sql   = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `cityid` = '$cityid' AND `state` = 1");
            // }else{
            //     $sql   = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `state` = 1");
            // }
            // $resID = $dsql->dsqlOper($sql, "results");
            // $idArr = array();
            // if($resID){
            //     foreach($resID as $v){
            //         array_push($idArr, $v['uid']);
            //     }
            // }
            // $idArr = !empty($idArr) ? join(',',  $idArr) : '';
            //个人实名认证
            if ($nature == 1) {
//                 $where .= " AND ((SELECT `mtype` FROM `#@__member` WHERE `id` = l.`userid`) = 1 OR l.`userid` = -1)";
                $where .= " AND ((SELECT `certifyState` FROM `#@__member` WHERE `id` = l.`userid`) = 1)";

//                if($idArr){
//                    $where .= " AND `userid` not in ($idArr)";
//                }
                //商家
            } elseif ($nature == 2) {
                 $where .= " AND ((SELECT `licenseState` FROM `#@__member` WHERE `id` = l.`userid`) = 1)";
//                $where .= " AND `userid` in ($idArr)";
            }

        }

        //遍历分类
        if (!empty($typeid)) {
            $typeArr = $dsql->getTypeList($typeid, "infotype");
            if ($typeArr) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($typeArr);
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND l.`typeid` in ($lower)";
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower    = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }
            $where .= " AND l.`addr` in ($lower)";
        }

        if (!empty($title)) {

            //搜索记录
            siteSearchLog("info", $title);

            $where .= " AND (l.`body` like '%" . $title . "%' OR l.`tel` like '%" . $title . "%')";
        }

        //取出字段表中满足条件的所有信息ID Start
        $aidArr = $infoidArr = $aid = array();

        $tj = true;

        if (!empty($itemList)) {
            $itemList = json_decode($itemList, true);
            if(is_array($itemList)){
                foreach ($itemList as $k => $v) {
                    if (!empty($v['value'])) {
                        // $tj = false;
                        $v['value'] = is_string($v['value']) ? explode(",",$v['value']) : $v['value'];
                        for ($i=0; $i<count($v['value']); $i++){
                            $archives = $dsql->SetQuery("SELECT `aid` FROM `#@__infoitem` WHERE `iid` = " . $v['id'] . " AND find_in_set('" . $v['value'][$i] . "', `value`)");
                            $results  = $dsql->dsqlOper($archives, "results");
                            if ($results) {
                                foreach ($results as $key => $val) {
                                    $infoidArr[$k][] = $val['aid'];
                                }
                                $tj = true;
                            }
                        }
                    }
                }
            }else{
                $tj = false;
            }
        }

        if (!$tj) $infoidArr = array();

        //二维数组转一维
        if (!empty($infoidArr)) {
            foreach ($infoidArr as $id) {
                $aid[] = join(",", $id);
            }
        }

        $aid = join(",", $aid);
        $aid = explode(",", $aid);

        //去重
        $aidArr = array_unique($aid);
        
        //取出重复次数最多的信息ID
        // $aidcount = array_count_values($aid);
        // foreach ($aidcount as $key => $val) {
        //     if ($val == count($infoidArr)) {
        //         $aidArr[] = $key;
        //     }
        // }

        $aidArr = join(",", $aidArr);
        //取出字段表中满足条件的所有信息ID End
        if (!empty($itemList) && empty($infoidArr)) {
            $where .= " AND 1 = 2";
        } else {
            if (!empty($aidArr)) {
                $where .= " AND l.`id` in ($aidArr)";
            }
        }

        //有图
        if (!empty($thumb)) {
            $where .= " AND (SELECT COUNT(`id`) FROM `#@__infopic` WHERE `aid` = l.`id`) > 0";
        }
        //价格筛选
        if($price_section){
            $price_section = explode(",", $price_section);
            if(!empty($price_section)){
                $price_section_1 = $price_section[0];
                $price_section_2 = $price_section[1];
                $where .= " AND l.`price` BETWEEN $price_section_1 AND $price_section_2 ";
            }
        }
        //查询距离
        $select = "";
        if(!empty($lng)&&!empty($lat)){
            $select="ROUND(
                6378.138 * 2 * ASIN(
                    SQRT(POW(SIN(($lat * PI() / 180 - l.`latitude` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(l.`latitude` * PI() / 180) * POW(SIN(($lng * PI() / 180 - l.`longitude` * PI() / 180) / 2), 2))
                ) * 1000
            ) AS distance,";
        }else{
            $select="";
        }

        $distance = (int)$distance;
        if (!empty($distance)){
            if(!empty($lng)&&!empty($lat)){
                $where .= " AND ROUND(
                    6378.138 * 2 * ASIN(
                        SQRT(POW(SIN(($lat * PI() / 180 - l.`latitude` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(l.`latitude` * PI() / 180) * POW(SIN(($lng * PI() / 180 - l.`longitude` * PI() / 180) / 2), 2))
                    )
                ) <= $distance ";
            }else{
                $where .= " AND 1 = 2";
            }
        }

        //当天
        $todayk = strtotime(date('Y-m-d'));

        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));

        //昨天时间戳
        $time1 = strtotime(date('Y-m-d 00:00:00',time()-3600*24));
        $time2 = strtotime(date('Y-m-d 23:59:59',time()-3600*24));

        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);

        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "l.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or l.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`pubdate` DESC, l.`id` DESC";
        //价格
        if ($orderby == "price") {
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`price` ASC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //发布时间
        } elseif ($orderby == "1") {
            if($notbid){
                $order = " ORDER BY l.`pubdate` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC, c.`id` DESC";
            }else{
                $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`pubdate` DESC, c.`id` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            }
            //浏览量
        } elseif ($orderby == "2") {
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //今日浏览量
        } elseif ($orderby == "2.1") {
            $order = " AND l.`pubdate` > $todayk AND l.`pubdate` < $todaye  ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //昨日浏览量
        } elseif ($orderby == "2.2") {
            $order = " AND l.`pubdate` > $time1 AND l.`pubdate` < $time2 ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //本周浏览量
        } elseif ($orderby == "2.3") {
            $order = " AND l.`pubdate` > $time3 AND l.`pubdate` < $time4  ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //本月浏览量
        } elseif ($orderby == "2.4") {
            $order = " AND l.`pubdate` > $btime AND l.`pubdate` < $ovtime ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`top` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //随机
        } elseif ($orderby == "3") {
            $order = " ORDER BY rand()";
        }else if($orderby == "5"){
            //按价格
            $order = " ORDER BY l.`price` DESC ";
        }else if($orderby == "5.1"){
            //按价格
            $order = " ORDER BY l.`price` ASC ";
        }else if($orderby =='9' && !empty($lng) && !empty($lat)){
            $order = " ORDER BY distance ASC";
        }else if($orderby =='10'){
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`fire` DESC, l.`weight` DESC, l.`id` DESC";
        }else if (!empty($rec)){
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";              //  推荐
        }



        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //会员状态
        $where .= ' AND m.`state` = 1';

        //评论排行
        if (strstr($orderby, "4")) {
            //今日评论
            if ($orderby == "4.1") {
                $where .= " AND l.`pubdate` > $todayk AND l.`pubdate` < $todaye";
                //昨日评论
            } elseif ($orderby == "4.2") {
                $where .= " AND l.`pubdate` > $time1 AND l.`pubdate` < $time2";
                //本周评论
            } elseif ($orderby == "4.3") {
                $where .= " l.`pubdate` > $time3 AND l.`pubdate` < $time4";
                //本月评论
            } elseif ($orderby == "4.4") {
                $where .= " AND l.`pubdate` >  $btime AND l.`pubdate` < $ovtime";
            }

            $order = " ORDER BY total DESC";

            $archives = $dsql->SetQuery("SELECT DISTINCT l.`id`,l.`editdate`,l.`titleRed`, l.`titleBlod`, l.`title`, l.`is_valid`, l.`typeid`, l.`price`, l.`video`, l.`videoPoster`, l.`color`, l.`pubdate`, l.`body`, l.`addr`, l.`click`, l.`areaCode`, l.`tel`, l.`teladdr`, l.`rec`, l.`fire`, l.`top`, l.`userid`, l.`arcrank`, l.`review`, l.`valid`, l.`isbid`, l.`bid_type`, l.`bid_start`, l.`bid_end`, l.`bid_week0`, l.`bid_week1`, l.`bid_week2`, l.`bid_week3`, l.`bid_week4`, l.`bid_week5`, l.`bid_week6`, l.`bid_price`,l.`hasSetjili` , l.`price_switch`,  l.`refreshSmart`, l.`refreshCount`, l.`refreshTimes`, l.`refreshPrice`, l.`refreshBegan`, l.`refreshNext`, l.`refreshSurplus`, l.`hongbaoPrice`, l.`hongbaoCount`, l.`desc`, l.`waitpay`, (SELECT COUNT(`id`) FROM `#@__public_comment_all` WHERE `aid` = l.`id` AND `ischeck` = 1 AND `pid` = 0 AND `type` = 'info-detail') AS total FROM `#@__infolist` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1" . $where." AND l.`del` = 0");

            //普通查询
        } else {
            $archives = $dsql->SetQuery("SELECT DISTINCT l.`id`,l.`editdate`,l.`share`, l.`titleRed`, l.`titleBlod`, l.`title`, l.`is_valid`, l.`typeid`, l.`price`, l.`video`, l.`videoPoster`, l.`longitude`, l.`latitude`,".$select." l.`color`, l.`pubdate`, l.`body`, l.`addr`, l.`click`, l.`areaCode`, l.`tel`, l.`teladdr`, l.`rec`, l.`fire`, l.`top`, l.`userid`, l.`arcrank`, l.`review`, l.`valid`, l.`isbid`, l.`bid_type`, l.`bid_start`, l.`bid_end`, l.`bid_week0`, l.`bid_week1`, l.`bid_week2`, l.`bid_week3`, l.`bid_week4`, l.`bid_week5`, l.`bid_week6`, l.`bid_price`, l.`price_switch`,l.`hasSetjili`, l.`refreshSmart`, l.`refreshCount`, l.`refreshTimes`, l.`refreshPrice`, l.`refreshBegan`, l.`refreshNext`, l.`refreshSurplus`, l.`readInfo`,l.`shareInfo`,l.`hongbaoPrice`, l.`hongbaoCount`, l.`desc`, l.`waitpay`, l.`status`, l.`rewardPrice`, l.`rewardCount`,l.`address`,l.`addrArr`,l.`listpic`,l.`label` FROM `#@__infolist` as l  LEFT JOIN `#@__member` m ON m.`id` = l.`userid` LEFT JOIN `#@__infopic` c  ON   c.`aid` = l.`id`  WHERE 1 = 1" . $where." AND l.`del` = 0");
        }

        //总条数
        //$totalCount = $dsql->dsqlOper($archives, "totalCount");
        $sql = $dsql->SetQuery("SELECT COUNT(l.`id`) total FROM `#@__infolist` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1".$where." AND l.`del` = 0");

        //未过期
        if($type != 4 && !$expireShow){
            $sql .= " AND (l.`valid` > $now OR l.`valid` = 0)";
        }

        $totalCount = (int)getCache("info_total", $sql, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        //未过期
        if($type != 4 && !$expireShow){
            $where1 .= " AND (l.`valid` > $now OR l.`valid` = 0)";
        }

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . $where1 . " AND l.`arcrank` = 0", "totalCount");
            //待发布
            $waitRelease = $dsql->dsqlOper($archives . $where1 . " AND l.`arcrank` = 0 AND l.`waitpay` = 1", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . $where1 . " AND l.`arcrank` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . $where1 . " AND l.`arcrank` = 2", "totalCount");
            //已下架
            $totalOff = $dsql->dsqlOper($archives . $where1 . " AND l.`arcrank` = 3", "totalCount");
            //过期
            $now = GetMkTime(time());
            // $totalExpire = $dsql->dsqlOper($archives . " AND `valid` < " . $now . " AND `valid` <> 0", "totalCount");
            $totalExpire = $dsql->dsqlOper($archives . " AND l.`valid` < " . $now, "totalCount");
            //推广中
            $totalExtension = $dsql->dsqlOper($archives . $where1 . " AND (l.`isbid` = 1 OR l.`refreshSmart` = 1 OR l.`hasSetjili` = 1) AND l.`arcrank` = 1", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['waitRelease']   = $waitRelease;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
            $pageinfo['off'] = $totalOff;
            $pageinfo['expire'] = $totalExpire;
            $pageinfo['extension'] = $totalExtension;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives . $where1 . $order . $where, "results");
        $sql = $archives . $where1 . $order . $where;
        $results = getCache("info_list", $sql, 300, array("disabled" => $u));

        if ($results && is_array($results)) {

            $param        = array(
                "service" => "info",
                "template" => "list",
                "id" => "%id%"
            );
            $typeurlParam = getUrlPath($param);

            $param    = array(
                "service" => "info",
                "template" => "detail",
                "id" => "%id%"
            );
            $urlParam = getUrlPath($param);

            $param    = array(
                "service" => "info",
                "template" => "business",
                "id" => "%id%"
            );
            $busiParam = getUrlPath($param);

            $param    = array(
                "service" => "info",
                "template" => "homepage",
                "id" => "%id%"
            );
            $homeParam = getUrlPath($param);

            $now = GetMkTime(time());

            $tmpData = array();
            global $cfg_secureAccess;
            global $cfg_basehost;

            $loginUserID = $loginUid;
            $loginUserInfo = $userinfo;

            foreach ($results as $key => $val) {
                $list[$key]['id'] = $val['id'];
                $list[$key]['body'] = $val['body'];
                $list[$key]["titleNew"] = strip_tags($val['body']);
                $list[$key]["titleNew"] = str_replace(array("\r\n", "\r", "\n","&nbsp;", "&zwnj;"), "", $list[$key]["titleNew"]);


                $className = '';
                $className1 = '';
                $htmlName = '';
                $htmlName1 = '';

                if (!isMobile()) {
                    if ($val['color']) {
                        $className = '<font style="color:' . $val['color'] . '">';
                        $className1 = '</font>';
                    }
                    if ($val['titleRed']) {
                        $className = '<font style="color:#ff3d08">';
                        $className1 = '</font>';
                    }
                    if ($val['titleBlod']) {
                        $htmlName = '<strong>';
                        $htmlName1 = '</strong>';
                    }
                }
                $hisid = $val['id'];
                //收藏
                $collectarchive = $dsql->SetQuery("SELECT count(`id`)collectid FROM `#@__member_collect` WHERE `aid` = " . $hisid . " AND `module` ='info'");
                $resultcollect = $dsql->dsqlOper($collectarchive, "results");
                $list[$key]["collect"] = $resultcollect[0]['collectid'];                //一共收藏
                //特色标签
                $label = array();
                $typeid = explode(",",$val['label']);
                $typeid= join(",", $typeid);
                if ($typeid){
                    $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `id` IN (" . $typeid . ")");
                    $teseid = $dsql->dsqlOper($te, "results");
                    if ($teseid) {
                        foreach ($teseid as $k => $vv) {
                            $label[$k]['id'] = $vv['id'];
                            $label[$k]['name'] = $vv['name'];
                            $label[$k]['weight'] = $vv['weight'];
                        }
                    }
                }

                $list[$key]["label"] = $label;
//                $list[$key]["title"] = $className . $htmlName . $val['title'] . $htmlName1 . $className1;
                $list[$key]["title"] = cn_substrR(strip_tags($list[$key]["titleNew"]), 20);
                $list[$key]['color'] = $val['color'] ? $val['color'] : ($val['titleRed'] ? "#ff3d08" : '');
                $list[$key]['titleBlod'] = $val['titleBlod'] ? "1" : "0";
                $list[$key]['price'] = $val['price'];
                $list[$key]['editdate'] = $val['editdate'];
                $list[$key]['is_valid'] = $val['is_valid'];
                $list[$key]['price_switch'] = $val['price_switch'];
                $list[$key]['video'] = $val['video'] ? getFilePath($val['video']) : '';
                $list[$key]['videoPoster'] = $val['videoPoster'] ? getFilePath($val['videoPoster']) : '';
                $list[$key]['is_shop'] = 0;
                $list[$key]['hasSetjili'] = $val['hasSetjili'];
                $list[$key]['share'] = $val['share'];             //分享数量
                $list[$key]['readInfo'] = $val['readInfo'];
                $list[$key]['shareInfo'] = $val['shareInfo'];
                $list[$key]['hongbaoCount'] = $val['hongbaoCount'];
                $list[$key]['hongbaoPrice'] = $val['hongbaoPrice'];
                $list[$key]['rewardPrice'] = $val['rewardPrice'];
                $list[$key]['rewardCount'] = $val['rewardCount'];
                $list[$key]['hbMessage']    = $val['desc'];
                $hisid = $val['id'];
                $listt = $dsql->SetQuery("SELECT count(`id`)priceCount  FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = 2");
                $ret = $dsql->dsqlOper($listt, "results");
                $list[$key]['priceCount'] = $ret[0]['priceCount'];
                $list[$key]['countHongbao'] = $val['hongbaoCount'] + (int)$ret[0]['priceCount'];

                $lists = $dsql->SetQuery("SELECT count(`id`)countFenxiang FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` =1");
                $rep = $dsql->dsqlOper($lists, "results");
                $list[$key]['countFenxiang'] = $rep[0]['countFenxiang'];
                $list[$key]['CountReward'] = $val['rewardCount'] + $rep[0]['countFenxiang'];
                $infoDetail["label"] = $label;
                $itemid = $val['id'];
                $item = $dsql->SetQuery("SELECT m.`iid`, i.`title`, m.`value`,i.`heightlight` FROM  `#@__infotypeitem` i LEFT JOIN `#@__infoitem` m  ON  m.`iid` = i.`id` WHERE  m.`aid` = $itemid ORDER BY i.`orderby` DESC, i.`id` ASC");
                $resultitem = $dsql->dsqlOper($item, "results");
                $arritem = array();
                $arritem2 = array();
                foreach ($resultitem as $ke => $value) {

                    $arr = join(",",explode(",",$value['value']));
                    array_push($arritem,$arr);

                    //相同的参数进行合并
                    if($arritem2[$value['iid']]){
                        $arritem2[$value['iid']]['value'] = $arritem2[$value['iid']]['value'] ? ($arritem2[$value['iid']]['value'] . ',' . $arr) : $arr;
                    }else{
                        $arritem2[$value['iid']] = array(
                            'title'=>$value['title'],
                            'value'=>$arr,
                            'heightlight'=>(int)$value['heightlight']
                        );
                    }
                }

                $arritem = join(",",$arritem);
                $list[$key]['feature2']   = $arritem;
                $list[$key]['feature3']   = explode(",",$list[$key]['feature2']);
                $list[$key]['feature4']   = $arritem2;


                //查询是否是商家
//                if($val['userid']){
//                    if(isset($tmpData['is_shop'][$val['userid']])){
//                        $is_shop = $tmpData['is_shop'][$val['userid']];
//                    }else{
//                        $sql     = $dsql->SetQuery("SELECT `lnglat` FROM `#@__infoshop` WHERE `uid` = " . $val['userid']);
//                        $is_shop = $dsql->dsqlOper($sql, "results");
//                        $tmpData['is_shop'][$val['userid']] = $is_shop;
//                    }
//                    if ($is_shop) {
//                        $list[$key]['is_shop']     = 1;
                // $list[$key]['lnglat']      = $is_shop[0]['lnglat'] ? explode(",", $is_shop[0]['lnglat']) : array(0, 0);
                //
                // $distance = getDistance($lng2, $lat2, $list[$key]['lnglat'][0], $list[$key]['lnglat'][1]);
                // $list[$key]['lnglat_diff'] = sprintf("%.2f", ($distance / 1000));

//                    }
//                }
                if ($val['userid']) {
                    if (isset($tmpData['is_shop'][$val['userid']])) {
                        $is_shop = $tmpData['is_shop'][$val['userid']];
                    } else {
                        $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `uid` = " . $val['userid']);
                        $is_shop = $dsql->dsqlOper($sql, "results");
                        $tmpData['is_shop'][$val['userid']] = $is_shop;
                    }
                    if ($is_shop) {
                        $list[$key]['is_shop'] = 1;
                    }
                }

                 $list[$key]['lnglat'] = array($val['longitude'], $val['latitude']);

                 if($val['longitude'] == '' || $val['latitude'] == ''){
                    $val['distance'] = 0;
                 }

                if($lng && $lat && $val['distance']){
                    if ($val['distance'] < 1000){
                        $list[$key]['distance']  = sprintf("%.1f", $val['distance']).'m';
                    }elseif ($val['distance'] > 1000 ){
                        $list[$key]['distance']  = sprintf("%.1f", $val['distance'] / 1000) . 'km';
                    }
//                    $list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
//                    if(strpos($list[$key]['distance'],'千米')){
//                        $list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
//                    }elseif(strpos($list[$key]['distance'],'米')){
//                        if ($list[$key]['distance'] <= '100米'){
//                            $list[$key]['distance']  =  str_replace("米",'m','100m');
//                        }
//                        $list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
//                    }

                }else{
                    $list[$key]['distance'] = '';
                }

                //会员发布信息统计
                $fabuCount = 0;
                if($val['userid']){

                    if(isset($tmpData['fabuCount'][$val['userid']])){
                        $fabuCount = $tmpData['fabuCount'][$val['userid']];
                    }else{
                        $archives  = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `is_valid` = 0 AND `waitpay` = 0 AND `arcrank` = 1 AND `userid` = " . $val['userid']);
                        $res       = $dsql->dsqlOper($archives, "results");
                        $fabuCount = $res[0]['total'];
                        $tmpData['fabuCount'][$val['userid']] = $fabuCount;
                    }


                }
                $list[$key]['fabuCount'] = $fabuCount;

                global $data;
                $data = "";

                if(isset($tmpData['addrArr'][$val['addr']])){
                    $addrArr = $tmpData['addrArr'][$val['addr']];
                }else{
                    $addrArr = getParentArr("site_area", $val['addr']);
                    $tmpData['addrArr'][$val['addr']] = $addrArr;
                }
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));

                //数据库中的区域信息
                $_addrArr = str_replace('  ', ' ', str_replace('undefined', '', $val['addrArr']));  //将两个空格换成一个空格

                $addrArr = $addrArr ? $addrArr : explode(' ', $_addrArr);

                //取最后两个
                $addrArr = array_slice($addrArr, -2);

                $list[$key]['addrArr'] = join(" ", $addrArr);
                $list[$key]['address'] = $addrArr;
                $list[$key]['dizhi'] = $val['address'];

                $list[$key]['typeid'] = $val['typeid'];


                $typename = "";
                $freecall = 0;
                if(isset($tmpData['typename'][$val['typeid']])){
                    $typename = $tmpData['typename'][$val['typeid']];
                    $freecall = $tmpData['freecall'][$val['typeid']];
                }else{
                    $sql = $dsql->SetQuery("SELECT `typename`, `freecall` FROM `#@__infotype` WHERE `id` = " . $val['typeid']);
                    $ret = getCache("info_type", $sql);
                    if($ret && is_array($ret)){
                        $typename = $ret[0]['typename'];
                        $freecall = (int)$ret[0]['freecall'];
                        $tmpData['typename'][$val['typeid']] = $typename ? $typename : "";
                        $tmpData['freecall'][$val['typeid']] = $freecall ? $freecall : "";
                    }
                }
                $list[$key]['typename'] = $typename;

                $list[$key]['areaCode']     = $val['areaCode'];

                //判断是否已经付过查看电话号码的费用
                $payPhoneState = $loginUserID == -1 ? 0 : 1;
                if($cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) && $loginUserID != $val['userid']){

                    //判断是否开启了会员免费
                    if(($cfg_payPhoneVipFree && $loginUserInfo['level']) || $freecall){
                        $payPhoneState = 1;
                    }
                    else{
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'info' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $val['id']);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(!$ret){
                            $payPhoneState = 0;
                        }
                    }
                }

                $list[$key]['payPhoneState'] = $payPhoneState; //当前信息是否支付过
                $list[$key]['tel']     = !$payPhoneState && $cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('info', $cfg_privatenumberModule) ? '请使用隐私号' : $val['tel']);
                $list[$key]['userPhoneCheck'] = $userPhoneCheck;
                // $list[$key]['tel_']    = preg_replace('/(1[3456789]{1}[0-9])[0-9]{4}([0-9]{4})/is',"$1****$2", $val['tel']);
                $tel = (int)$val['tel'];
                $list[$key]['tel_']    = is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****';
                $list[$key]['teladdr'] = $val['teladdr'];

                $list[$key]['click'] = $val['click'];

                $list[$key]['pubdate']  = $val['pubdate'];
                $list[$key]['pubdate1'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 3);
                $list[$key]['pubdate_istoday']  = 0;
                $list[$key]['pubdate2']  = date("H:i", $val['pubdate']);
                if(date("Y-m-d", $val['pubdate']) == date("Y-m-d", time())){
                    $list[$key]['pubdate_istoday']  = 1;
                }


                $list[$key]['pubdate_is']  = date("H:i", $val['pubdate']);

                $list[$key]['fire'] = $val['fire'];
                $list[$key]['rec']  = $val['rec'];
                $list[$key]['top']  = $val['top'];

                if(!$u){
                    //验证当前信息是否处于置顶状态
                    $isbid = 0;
                    if ($val['isbid'] && $val['bid_start'] <= $time && $val['bid_end'] >= $time && 
                        (
                            $val['bid_type'] == 'normal' || 
                            ($val['bid_type'] == 'plan' && 
                                (
                                    $val['bid_week' . $week] == 'all' || 
                                    ($val['bid_week' . $week] == 'day' && $hour > 8 && $hour < 20)
                                )
                            )
                        )
                    ) {
                        $isbid = 1;
                        $val['isbid'] = '1';
                    }else{
                        $val['isbid'] = '0';
                    }
                }
                else{
                    $isbid = (int)$val['isbid'];
                }

                if ($val['isbid']) {
                    $top_arr = [];
                    $list[$key]["rec_fire_top"] = 'top';
                    $top_arr[] = $key;
                }

                //图集信息
                $picArr = [];
                $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__infopic` WHERE `aid` = " . $val['id'] . " ORDER BY `id` ASC");
                $results  = $dsql->dsqlOper($archives, "results");
                if (!empty($results)) {
                    if (!empty($val['listpic'])){
                        $list[$key]['litpic'] = getFilePath($val['listpic']);
                    }else{
                        $list[$key]['litpic'] = getFilePath($results[0]["picPath"]);
                    }

                    foreach($results as $k=> $v){
                        $picArr[$k]['litpic'] = $v['picPath'] ? getFilePath($v['picPath']) : '';
                    }
                }
                $list[$key]['pcount'] = count($picArr);
                $list[$key]["picArr"] = array_slice($picArr, 0, 6);

                $archives    = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__member_collect` WHERE `module` = 'info' AND `action` = 'detail' AND `aid` = " . $val['id']);
                $collectnum  = (int)$dsql->getOne($archives);
                $list[$key]['collectnum'] = $collectnum;


                $list[$key]['isbid']   = $val['isbid'];
                $list[$key]['valid_val'] = $val['valid'];
                $list[$key]['valid']   = ($val['valid']-$now) >0 ? ceil(($val['valid']-$now)/86400)."天后过期" : "已过期";  //有效天数
                $list[$key]['isvalid'] = ($val['valid'] != 0 && $val['valid'] > $now) ? 0 : 1;

                $list[$key]['typeurl'] = str_replace("%id%", $val['typeid'], $typeurlParam);
                $list[$key]['url']     = str_replace("%id%", $val['id'], $urlParam);

                $list[$key]['desc'] = cn_substrR(strip_tags($val['body']), 80);

                // $archives             = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infocommon` WHERE `aid` = " . $val['id'] . " AND `ischeck` = 1 AND `floor` = 0");
                $archives = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-detail' AND `aid` = " . $val['id'] . " AND `pid` = 0");
                $res                  = $dsql->dsqlOper($archives, "results");
                $list[$key]['common'] = $res[0]['total'];

                //会员信息
                $member = array(
                    'userid' => 0,
                    'nickname' => '',
                    'photo' => '',
                    'userType' => 0,
                    'emailCheck' => 0,
                    'phoneCheck' => 0,
                    'certifyState' => 0,
                    'phone' => '',
                    'nation' => '',
                );
                if($val['userid']){
                    $member = getMemberDetail($val['userid'], 1);  //只获取用户的基本信息
                }

                //是否商家
                $info_shop_id = 0;
                if ($member && $member['userid'] &&  $member['userType'] == 2) {
                    $info_shop_id = $member['userid'];
                }
                if($info_shop_id){
                    $list[$key]['busiurl'] = str_replace("%id%", $info_shop_id, $busiParam);
                }else{
                    $list[$key]['busiurl'] = str_replace("%id%", $val['userid'], $homeParam);
                }

                $member = $member['userid'] ? array(
                    "id" => $member['userid'],
                    "nickname" => $member['nickname'],
                    "photo" => $member['photo'] ? $member['photo'] : $cfg_secureAccess.$cfg_basehost.'/static/images/noPhoto_100.jpg',
                    "userType" => $member['userType'],
                    "emailCheck" => $member['emailCheck'],
                    "phoneCheck" => $member['phoneCheck'],
                    "certifyState" => (int)$member['certifyState'],
                    "nation" => $member['nation'],
                    "sex" => $member['sex']==0 ? "女" : "男",
                    "age" => (int)getBirthAge($member['birthday']),
                    "phone" => $list[$key]['tel'],
                    "nation" => $member['nation'],
                ) : NULL;
                $list[$key]['member'] = $member ? $member : NULL;

                $param_u = [
                    'service' => 'info',
                    'template' => $is_shop ? 'business' : 'homepage',
                    'id' => $is_shop ? $is_shop[0]['id'] : $member['userid'],
                ];
                $list[$key]['url_user'] = getUrlPath($param_u);


                //验证是否已经收藏
                $params                = array(
                    "module" => "info",
                    "temp" => "detail",
                    "type" => "add",
                    "id" => $val['id'],
                    "check" => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;


                //查询分类的高级设置
                $excitationSwitch = $refreshSwitch = $topSwitch = 0;
                $_typeid = (int)$val['typeid'];
                $sql = $dsql->SetQuery("SELECT `parentid`, `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_typeAdvanced = $ret[0]['advanced'];
                    $_typeParentid = (int)$ret[0]['parentid'];

                    //如果不是一级分类，并且没有高级设置，查询上级
                    if($_typeParentid && !$_typeAdvanced){
                        $sql = $dsql->SetQuery("SELECT `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeParentid);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $_typeAdvanced = $ret[0]['advanced'];
                        }
                    }

                    if($_typeAdvanced){
                        $_typeAdvancedArr = json_decode($_typeAdvanced, true);
                        $excitationSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['excitationSwitch'] : 1;
                        $refreshSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['refreshSwitch'] : 1;
                        $topSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['topSwitch'] : 1;
                    }
                }
                //由于后台配置中，0代表开启 1为关闭，输出给前端时，需要反转一下
                $list[$key]['excitationSwitch'] = $excitationSwitch == 0 ? 1 : 0;  //激励开关
                $list[$key]['refreshSwitch'] = $refreshSwitch == 0 ? 1 : 0;  //刷新开关
                $list[$key]['topSwitch'] = $topSwitch == 0 ? 1 : 0;  //置顶开关


                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {

                    $now = GetMkTime(time());
                    if ($val['pubdate'] + $val['valid'] * 86400 < $now AND $val['valid'] != 0) {
                        $list[$key]['arcrank'] = 4;
                    } else {
                        $list[$key]['arcrank'] = $val['arcrank'];
                    }

                    //拒审原因
                    $list[$key]['review'] = $val['review'];

                    //显示竞价结束时间、每日预算
                    $list[$key]['bid_price'] = $val['bid_price'];
                    $list[$key]['bid_end']   = $val['bid_end'];

                    $list[$key]['waitpay'] = (int)$val['waitpay'];

                    //显示置顶信息
                    if ($isbid) {
                        $list[$key]['bid_type']  = $val['bid_type'];
                        $list[$key]['bid_price'] = $val['bid_price'];
                        $list[$key]['bid_start'] = $val['bid_start'];
                        $list[$key]['bid_end']   = $val['bid_end'];
                        //计划置顶详细
                        if ($val['bid_type'] == 'plan') {
                            $tp_beganDate = date('Y-m-d', $val['bid_start']);
                            $tp_endDate   = date('Y-m-d', $val['bid_end']);

                            $diffDays   = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
                            $tp_planArr = array();

                            $weekArr = array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

                            //时间范围内每天的明细
                            for ($i = 0; $i < $diffDays; $i++) {
                                $began = GetMkTime($tp_beganDate);
                                $day   = AddDay($began, $i);
                                $week  = date("w", $day);

                                if ($val['bid_week' . $week]) {
                                    array_push($tp_planArr, array(
                                        'date' => date('Y-m-d', $day),
                                        'weekDay' => $week,
                                        'week' => $weekArr[$week],
                                        'type' => $val['bid_week' . $week],
                                        'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
                                    ));
                                }
                            }

                            $list[$key]['bid_plan'] = $tp_planArr;
                        }
                    }
                
                    //智能刷新
                    $refreshSmartState = (int)$val['refreshSmart'];
                    if ($val['refreshSurplus'] <= 0) {
                        $refreshSmartState = 0;
                    }
                    $list[$key]['refreshSmart'] = $refreshSmartState;
                    if ($refreshSmartState) {
                        $list[$key]['refreshCount']   = $val['refreshCount'];
                        $list[$key]['refreshTimes']   = $val['refreshTimes'];
                        $list[$key]['refreshPrice']   = $val['refreshPrice'];
                        $list[$key]['refreshBegan']   = $val['refreshBegan'];
                        $list[$key]['refreshNext']    = $val['refreshNext'];
                        $list[$key]['refreshSurplus'] = $val['refreshSurplus'];
                    }
                }


            }
            $resList = $list;
            // if(!$flag && $orderby != 'price'){
            //     $resarr1 = [];
            //     $resarr2 = [];
            //     foreach ($list as $key => $item) {
            //         if ($item['top'] == 1) {
            //             $resarr1[$key] = $item;
            //         } else {
            //             $resarr2[$key] = $item;
            //         }
            //     }
            //     $resList = array_merge($resarr1, $resarr2);
            // }


        }
        if($memberType == 1){
            if($resList){
                foreach ($resList as $index => $item){
                    if($item['is_shop'] == 1){
                        unset($resList[$index]);
                    }
                }
                $resList1 = [];
                foreach ($resList as $index => $item){
                    array_push($resList1, $item);
                }
                return array("pageInfo" => $pageinfo, "list" => $resList1);
            }
        }else if($memberType == 2){
            if($resList){
                foreach ($resList as $index => $item){
                    if($item['is_shop'] != 1){
                        unset($resList[$index]);
                    }
                }
                $resList2 = [];
                foreach ($resList as $index => $item){
                    array_push($resList2, $item);
                }
                return array("pageInfo" => $pageinfo, "list" => $resList2);
            }
        }


        return array("pageInfo" => $pageinfo, "list" => $resList);
    }


    public function ilist()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree; //会员免费查看
        
        $pageinfo = $list = $itemList = array();
        $nature   = $typeid = $addrid = $valid = $title = $rec = $fire = $top = $thumb = $orderby = $u = $state = $uid = $userid = $tel = $page = $pageSize = $where = $where1 = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['info'][1][58]);
            } else {
                $nature   = $this->param['nature'];
                $typeid   = $this->param['typeid'];
                $addrid   = $this->param['addrid'];
                $valid    = $this->param['valid'];
                $title    = trim($this->param['title']);
                $title    = $title ? $title : trim($this->param['keywords']);
                $itemList = $this->param['item'];
                $rec      = $this->param['rec'];
                $fire     = $this->param['fire'];
                $top      = $this->param['top'];
                $thumb    = $this->param['thumb'];
                $orderby  = $this->param['orderby'];
                $u        = $this->param['u'];
                $state    = $this->param['state'];
                $uid      = $this->param['uid'];
                $userid   = $this->param['userid'];
                $tel      = $this->param['tel'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $label    = $this->param['label'];              //特色
                $guarantee   = $this->param['guarantee'];              //保障
                $type        = $this->param['type'];              //切换  全部  推广  审核拒绝   已过期
                $address     = $this->param['address'];
                $descid      = $this->param['id'];

            }
        }

        //数据共享
        require(HUONIAOINC."/config/info.inc.php");
        $dataShare = (int)$customDataShare;
        $expireShow = (int)$customExpireShow;  //过期后继续显示  0关  1开

        $now = strtotime(date("Y-m-d"));
        //推广中
        if ($type == 2) {       
            $where .= " AND (l.`isbid` = 1 OR l.`refreshSmart` = 1 OR l.`hasSetjili` = 1 )";
        }
        //审核拒绝
        if ($type == 3){ 
            $where .= " AND l.`arcrank` = 2";
        }
        //已过期
        if ($type == 4 && !$expireShow){ 
            $now         = GetMkTime(time());
            $where .= " AND l.`valid` < $now AND l.`arcrank` = 1 AND l.`waitpay` != 1";
        }
        //已发布
        if ($type == 5){ 
            $where .= " AND l.`arcrank` = 1";
            
            //未过期
            if(!$expireShow){
                $where .= " AND (l.`valid` > $now OR l.`valid` = 0)";
            }
        }
        //待审核，已支付
        if ($type == 6){ 
            $where .= " AND l.`arcrank` = 0 AND l.`waitpay` = 0";
        }
        //待支付
        if ($type == 7){ 
            $where .= " AND l.`arcrank` = 0 AND l.`waitpay` = 1";
        }
        //待审核，包含未支付
        if ($type == 8){ 
            $where .= " AND l.`arcrank` = 0";
        }
        

        
        //指定会员
        if (!empty($userid)) {
            $where .= " AND l.`userid` = $userid";
        }

        //指定会员
        if (!empty($uid)) {
            $where .= " AND l.`userid` = $uid";
        }

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid && !$userid && !$uid && $u != 1) {
                $where .= " AND l.`cityid` = " . $cityid;
            } else {
                if(!$u){
                    $where .= " AND l.`cityid` != 0";
                }
            }
        }

        //推荐
        if (!empty($rec)) {
            $where .= " AND l.`rec` = 1";
        }

        //火急
        if (!empty($fire)) {
            $where .= " AND l.`fire` = 1";
        }

        //置顶
        if (!empty($top)) {
            // $where .= " AND `top` = 1";
        }

        //指定电话号码
        if (!empty($tel)) {
            $where .= " AND l.`tel` = '$tel'";
        }

        //当前登录会员的信息
        $userinfo = $userLogin->getMemberInfo();

        //当前登录会员的绑定手机状态，小程序端隐私号功能需要用到
        $userPhoneCheck = 0;
        if($userinfo && $userinfo['phoneCheck']){
            $userPhoneCheck = 1;
        }

        //是否输出当前登录会员的信息

        if ($u != 1) {
            $where .= " AND l.`arcrank` = 1 AND l.`waitpay` = 0 AND `is_valid` = 0";
        } else {
            $uid      = $userLogin->getMemberID();

//            if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "info"))) {
//                return array("state" => 200, "info" => $langData['info'][1][73]);//'商家权限验证失败！'
//            }

            $where .= " AND l.`userid` = " . $uid;

        }

        //只查找不过期的信息
        if ($u != 1) {
             $now   = GetMkTime(time());
//            $now = strtotime(date("Y-m-d"));
            // $where .= " AND l.`valid` > " . $now . " AND l.`valid` <> 0";
            $where .= " AND l.`valid` > " . $now;
        }

        //信息性质
        if (!empty($nature)) {

            //个人
            if ($nature == 1) {
                $where .= " AND ((SELECT `mtype` FROM `#@__member` WHERE `id` = l.`userid`) = 1 OR l.`userid` = -1)";

                //商家
            } elseif ($nature == 2) {
                $where .= " AND ((SELECT `mtype` FROM `#@__member` WHERE `id` = l.`userid`) = 2)";
            }

        }
        //特色
        if ($label){
            $where .= " AND l.`label` in ($label)";
        }

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "infotype")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "infotype"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND l.`typeid` in ($lower)";
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower    = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }
            $where .= " AND l.`addr` in ($lower)";
        }

        if (!empty($title)) {

            //搜索记录
            siteSearchLog("info", $title);

            $where .= " AND (l.`body` like '%" . $title . "%' OR l.`tel` like '%" . $title . "%')";
        }

        //取出字段表中满足条件的所有信息ID Start
        $aidArr = $infoidArr = $aid = array();

        $tj = true;

        if (!empty($itemList)) {
            $itemList = json_decode($itemList, true);
            foreach ($itemList as $k => $v) {
                if (!empty($v['value'])) {
                    $archives = $dsql->SetQuery("SELECT `aid` FROM `#@__infoitem` WHERE `iid` = " . $v['id'] . " AND find_in_set('" . $v['value'] . "', `value`)");
                    $results  = $dsql->dsqlOper($archives, "results");
                    if ($results) {
                        foreach ($results as $key => $val) {
                            $infoidArr[$k][$key] = $val['aid'];
                        }
                    } else {
                        $tj = false;
                    }
                }
            }
        }

        if (!$tj) $infoidArr = array();

        //二维数组转一维
        if (!empty($infoidArr)) {
            foreach ($infoidArr as $id) {
                $aid[] = join(",", $id);
            }
        }

        $aid = join(",", $aid);
        $aid = explode(",", $aid);

        //取出重复次数最多的信息ID
        $aidcount = array_count_values($aid);
        foreach ($aidcount as $key => $val) {
            if ($val == count($infoidArr)) {
                $aidArr[] = $key;
            }
        }

        $aidArr = join(",", $aidArr);
        //取出字段表中满足条件的所有信息ID End
        if (!empty($itemList) && empty($infoidArr)) {
            $where .= " AND 1 = 2";
        } else {
            if (!empty($aidArr)) {
                $where .= " AND l.`id` in ($aidArr)";
            }
        }

        //有图
        if (!empty($thumb)) {
            $where .= " AND (SELECT COUNT(`id`) FROM `#@__infopic` WHERE `aid` = l.`id`) > 0";
        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "l.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or l.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        //当天
        $todayk = strtotime(date('Y-m-d'));
        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));

        //昨天时间戳
        $time1 = strtotime(date('Y-m-d 00:00:00',time()-3600*24));
        $time2 = strtotime(date('Y-m-d 23:59:59',time()-3600*24));

        //本周时间戳
        $time3 = mktime(0,0,0,date('m'),date('d')-date('N')+1,date('y'));
        $time4 = mktime(23,59,59,date('m'),date('d')-date('N')+7,date('Y'));

        $BeginDate = date('Y-m-01', strtotime(date("Y-m-d")));//本月第一天
        $overDate  = date('Y-m-d', strtotime("$BeginDate +1 month"));//本月最后一天
        $btime     = strtotime($BeginDate);
        $ovtime    = strtotime($overDate);
        //排序规则
        //置顶  普通置顶无需特殊验证，计划置顶先验证开始时间，然后验证当天(周几)是否做置顶，再验证当前时间点(早8晚8)是否做置顶，与当天的逻辑是或的关系；（结束时间这里不做验证，交给计划任务来处理，置顶结束掉，由计划任务更新信息状态），注意，数据返回的时候同样需要验证计划置顶的当前时间状态
        //火急
        //推荐
        //后台自定义
        //ID
        $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`pubdate` DESC, l.`id` DESC";
        //价格
        if ($orderby == "price") {
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`price` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //发布时间
        } elseif ($orderby == "1") {
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`pubdate` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //浏览量
        } elseif ($orderby == "2") {
            $order = " ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //今日浏览量
        } elseif ($orderby == "2.1") {
            $order = " AND `pubdate` > $todayk AND `pubdate` < $todaye  ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //昨日浏览量
        } elseif ($orderby == "2.2") {
            $order = " AND `pubdate` > $time1 AND `pubdate` < $time2 ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //本周浏览量
        } elseif ($orderby == "2.3") {
            $order = " AND `pubdate` > $time3 AND `pubdate` < $time4 ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //本月浏览量
        } elseif ($orderby == "2.4") {
            $order = " AND `pubdate` > $btime AND `pubdate` < $ovtime ORDER BY case when l.`isbid` = 1 and l.`bid_type` = 'normal' then 1 else 2 end, case when l.`isbid` = 1 and l.`bid_type` = 'plan' and l.`bid_start` <= $time and $ob then 1 else 2 end, l.`click` DESC, l.`fire` DESC, l.`rec` DESC, l.`weight` DESC, l.`id` DESC";
            //随机
        } elseif ($orderby == "3") {
            $order = " ORDER BY rand()";
        }

        // 会员中心
        if($u){
            $order = " ORDER BY l.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : (int)$pageSize;
        $page     = empty($page) ? 1 : (int)$page;

        //查询距离
        $select = "";
        if((!empty($lng))&&(!empty($lat))){
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lng."-l.`longitude`)/360),2)+COS(3.1415926535898*".$lng."/180)* COS(l.`longitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lat."-l.`latitude`)/360),2))))*1000 AS distance,";
        }else{
            $select="";
        }

        if ($orderby =='9'){
            $order = " ORDER BY distance A  SC";
        }
        if ($descid){
            $order = " ORDER BY l.`id` = $descid  DESC";
        }
        //评论排行
        if (strstr($orderby, "4")) {
            //今日评论
            if ($orderby == "4.1") {
                $where .= " AND l.`pubdate` > $todayk AND l.`pubdate` < $todaye";
                //昨日评论
            } elseif ($orderby == "4.2") {
                $where .= " AND l.`pubdate` > $time1 AND l.`pubdate` < $time2";
                //本周评论
            } elseif ($orderby == "4.3") {
                $where .= " AND l.`pubdate` > $time3 AND l.`pubdate` < $time4";
                //本月评论
            } elseif ($orderby == "4.4") {
                $where .= " AND l.`pubdate` >  $btime AND l.`pubdate` < $ovtime";
            }

            $order = " ORDER BY total DESC";

            $archives = $dsql->SetQuery("SELECT l.`id`,l.`editdate`,l.`titleBlod`, l.`titleRed`, l.`title`, l.`is_valid`, l.`typeid`, l.`price`, l.`price_switch`, l.`video`, l.`videoPoster`, l.`color`, l.`pubdate`, l.`body`, l.`addr`, l.`click`, l.`areaCode`, l.`tel`, l.`teladdr`, l.`rec`, l.`fire`, l.`userid`, l.`arcrank`, l.`review`, l.`valid`, l.`isbid`, l.`bid_type`, l.`bid_week0`, l.`bid_week1`, l.`bid_week2`, l.`bid_week3`, l.`bid_week4`, l.`bid_week5`, l.`bid_week6`, l.`bid_start`, l.`bid_end`, l.`bid_price`, l.`waitpay`, l.`refreshSmart`, l.`refreshCount`, l.`refreshTimes`, l.`refreshPrice`, l.`refreshBegan`, l.`refreshNext`, l.`hasSetjili`, l.`hongbaoPrice`, l.`hongbaoCount`, l.`desc`, l.`status`, l.`rewardPrice`, l.`rewardCount`, (SELECT COUNT(`id`) FROM `#@__public_comment_all` WHERE `aid` = l.`id` AND `ischeck` = 1 AND `pid` = 0 AND `type` = 'info-detail') AS total FROM `#@__infolist` l WHERE 1 = 1" . $where." AND `del` = 0");


            //普通查询
        } else {
            $archives = $dsql->SetQuery("SELECT l.`id`,l.`editdate`,l.`readInfo`,l.`shareInfo`, l.`titleBlod`, l.`titleRed`, l.`title`, l.`is_valid`, l.`typeid`, l.`price`, l.`price_switch`, l.`video`, l.`videoPoster`, l.`color`, l.`pubdate`, l.`body`, l.`addr`, l.`click`, l.`areaCode`, l.`tel`, l.`teladdr`, l.`rec`, l.`fire`, l.`userid`, l.`arcrank`, l.`review`, ".$select."l.`valid`, l.`isbid`, l.`bid_type`, l.`bid_week0`, l.`bid_week1`, l.`bid_week2`, l.`bid_week3`, l.`bid_week4`, l.`bid_week5`, l.`bid_week6`, l.`bid_start`, l.`bid_end`, l.`bid_price`, l.`waitpay`, l.`refreshSmart`, l.`refreshCount`, l.`refreshTimes`, l.`refreshPrice`, l.`refreshBegan`, l.`refreshNext`, l.`refreshSurplus`, l.`hasSetjili`, l.`hongbaoPrice`, l.`hongbaoCount`, l.`desc`, l.`status`, l.`rewardPrice`, l.`rewardCount`,l.`address`,l.`longitude`,l.`latitude`,l.`shareClick`,l.`readClick`,l.`listpic`,l.`waitPrice` FROM `#@__infolist` as l WHERE 1 = 1" . $where." AND `del` = 0");
        }

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $sql = $dsql->SetQuery("SELECT COUNT(l.`id`) total FROM `#@__infolist` l WHERE 1 = 1".$where." AND `del` = 0 ");
        $total = getCache("info_total", $sql, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        $totalCount = $total;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $userLogin->getMemberID() > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND `arcrank` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND `arcrank` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND `arcrank` = 2", "totalCount");
            //推广中
            $totalExtension = $dsql->dsqlOper($archives . " AND (`isbid` = 1 OR `refreshSmart` = 1 OR `hasSetjili` = 1)", "totalCount");

            //过期
            $now         = GetMkTime(time());
            // $totalExpire = $dsql->dsqlOper($archives . " AND `valid` < " . $now . " AND `valid` <> 0", "totalCount");
            $totalExpire = $dsql->dsqlOper($archives . " AND `valid` < $now  AND l.`arcrank` = 1 AND l.`waitpay` != 1 ", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
            $pageinfo['expire'] = $totalExpire;
            $pageinfo['extension'] = $totalExtension;

        }

        if ($state != "") {
            if ($state == 4) {
                $now    = GetMkTime(time());
                $archives .= " AND `valid` < $now  AND l.`arcrank` = 1 AND l.`waitpay` != 1";
            } else {
                $archives .= " AND l.`arcrank` = " . $state;
            }
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives . $where1 . $order . $where, "results");
        $results = getCache("info_list", $archives.$where1.$order.$where, 300, array("disabled" => $u));

        if ($results) {

            $param        = array(
                "service" => "info",
                "template" => "list",
                "id" => "%id%"
            );
            $typeurlParam = getUrlPath($param);

            $param    = array(
                "service" => "info",
                "template" => "detail",
                "id" => "%id%"
            );
            $urlParam = getUrlPath($param);

            $loginUserID = $userLogin->getMemberID();
            $loginUserInfo = $userLogin->getMemberInfo();

            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']    = $val['id'];
                $list[$key]["titleNew"]  = strip_tags($val['body']);

                $className  = '';
                $className1 = '';
                $htmlName   = '';
                $htmlName1  = '';
                if($val['titleRed']){
                    $className  = '<font style="color:#ff3d08">';
                    $className1 = '</font>';
                }
                if($val['titleBlod']){
                    $htmlName  = '<strong>';
                    $htmlName1 = '</strong>';
                }
                $list[$key]["title"]  =cn_substrR(strip_tags($val['body']), 20);


                $list[$key]['color'] = $val['color'] ? $val['color'] : ($val['titleRed'] ? '#ff3d08' : '');
                $list[$key]['price'] = $val['price'];
                $list[$key]['is_valid'] = $val['is_valid'];
                $list[$key]['price_switch']   = $val['price_switch'];
                $list[$key]['video'] = $val['video'] ? getFilePath($val['video']) : '';
                $list[$key]['videoPoster'] = $val['videoPoster'] ? getFilePath($val['videoPoster']) : '';
                $list[$key]['lnglat'] = array($val['longitude'], $val['latitude']);
                $list[$key]['shareClick'] = $val['shareClick'];             //用户激励分享阅读量
                $list[$key]['readClick'] = $val['readClick'];             //用户激励阅读 阅读量

                if($lng && $lat){
                    $list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                    if(strpos($list[$key]['distance'],'千米')){
                        $list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
                    }elseif(strpos($list[$key]['distance'],'米')){
                        $list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
                    }
                }

                //会员发布信息统计
                $archives                = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `is_valid` = 0 AND `waitpay` = 0 AND `arcrank` = 1 AND `userid` = " . $val['userid']);
                $results                 = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['fabuCount'] = $results;

                global $data;
                $data                  = "";
                $addrArr               = getParentArr("site_area", $val['addr']);
                $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
                $addrArr               = array_slice($addrArr, -2, 2);
                $list[$key]['addrArr'] = join(" ", $addrArr);
                $list[$key]['address'] = $val['address'];
                $list[$key]['typeid'] = $val['typeid'];

                $typename = "";
                $freecall = 0;
                $sql = $dsql->SetQuery("SELECT `typename`, `freecall` FROM `#@__infotype` WHERE `id` = " . $val['typeid']);
                $ret = getCache("info_type", $sql);
                $typename = $ret[0]['typename'];
                $freecall = (int)$ret[0]['freecall'];
                
                $list[$key]['typename'] = $typename;

                $list[$key]['areaCode']     = $val['areaCode'];

                //判断是否已经付过查看电话号码的费用
                $payPhoneState = $loginUserID == -1 ? 0 : 1;
                if($cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) && $loginUserID != $val['userid']){

                    //判断是否开启了会员免费
                    if(($cfg_payPhoneVipFree && $loginUserInfo['level']) || $freecall){
                        $payPhoneState = 1;
                    }
                    else{
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'info' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $val['id']);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(!$ret){
                            $payPhoneState = 0;
                        }
                    }
                }

                $list[$key]['payPhoneState'] = $payPhoneState; //当前信息是否支付过
                $list[$key]['tel']     = !$payPhoneState && $cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('info', $cfg_privatenumberModule) ? '请使用隐私号' : $val['tel']);
                $list[$key]['userPhoneCheck'] = $userPhoneCheck;
                $list[$key]['waitPrice']    = $val['waitPrice'];
                $list[$key]['teladdr']      = $val['teladdr'];
                $list[$key]['readInfo']     = $val['readInfo'];
                $list[$key]['shareInfo']    = $val['shareInfo'];
                $list[$key]['click']        = $val['click'];
                $list[$key]['editdate']     = $val['editdate'];
                $list[$key]['hongbaoPrice'] = $val['hongbaoPrice'];
                $list[$key]['hongbaoCount'] = $val['hongbaoCount'];
                $list[$key]['hbMessage']    = $val['desc'];
                $list[$key]['status']       = $val['status'];
                $list[$key]['rewardPrice']  = $val['rewardPrice'];
                $list[$key]['rewardCount']  = $val['rewardCount'];
                $list[$key]['hasSetjili']   = $val['hasSetjili'];
                $hisid =$val['id'];
                $listt = $dsql->SetQuery("SELECT count(`id`)priceCount  FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = 2");
                    $ret = $dsql->dsqlOper($listt, "results");
                $list[$key]['priceCount'] = $ret[0]['priceCount'];
                $list[$key]['countHongbao'] = $val['hongbaoCount'] + (int)$ret[0]['priceCount'];

                $lists = $dsql->SetQuery("SELECT count(`id`)countFenxiang FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` =1");
                $rep = $dsql->dsqlOper($lists, "results");
                $list[$key]['countFenxiang'] = $rep[0]['countFenxiang'];
                $list[$key]['CountReward'] = $val['rewardCount'] + $rep[0]['countFenxiang'];
                //特色标签
                $label = array();
                $typeid = explode(",",$val['label']);
                $typeid= join(",", $typeid);
                if ($typeid){
                    $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `id` IN (" . $typeid . ")");
                    $teseid = $dsql->dsqlOper($te, "results");
                    if ($teseid) {
                        foreach ($teseid as $k => $vv) {
                            $label[$k]['id'] = $vv['id'];
                            $label[$k]['name'] = $vv['name'];
                            $label[$k]['weight'] = $vv['weight'];
                        }
                    }
                }
                $list[$key]["label"] = $label;

                //总浏览量
                $hisarchive = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__info_historyclick`");
                $resulthis = $dsql->dsqlOper($hisarchive, "results");
                $list[$key]["histroyCount"] = $resulthis[0]['id'];                //总浏览量
                //信息总量
                $infoarchive = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__infolist`");
                $resultinfo = $dsql->dsqlOper($infoarchive, "results");
                $list[$key]["infoCount"] = $resultinfo[0]['id'];                //信息总量
                //入驻商家
                $infostore = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__infoshop`");
                $resultstore = $dsql->dsqlOper($infostore, "results");
                $list[$key]["storeCount"] = $resultstore[0]['id'];                //入驻商家

                //收藏
                $collectarchive = $dsql->SetQuery("SELECT count(`id`)collectid FROM `#@__member_collect` WHERE `aid` = " . $hisid . " AND `module` ='info'");
                $resultcollect = $dsql->dsqlOper($collectarchive, "results");
                $list[$key]["collect"] = $resultcollect[0]['collectid'];                //一共收藏
                $list[$key]['pubdate'] = $val['pubdate'];

                $list[$key]['pubdate1'] = FloorTime(GetMkTime(time()) - $val['pubdate']);
                $list[$key]['fire']     = $val['fire'];
                $list[$key]['rec']      = $val['rec'];
                // $list[$key]['top']     = $val['top'];

                $isbid = $val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan' && !$u) {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid']   = $isbid;
                $list[$key]['valid']   = $val['valid'];
                $list[$key]['isvalid'] = ($val['valid'] != 0 && $val['valid'] > $now) ? 0 : 1;

                $list[$key]['typeurl'] = str_replace("%id%", $val['typeid'], $typeurlParam);
                $list[$key]['url']     = str_replace("%id%", $val['id'], $urlParam);

                //图集信息
                $picArr = [];
                $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__infopic` WHERE `aid` = " . $val['id'] . " ORDER BY `id` ASC LIMIT 0, 6");
                $results  = $dsql->dsqlOper($archives, "results");
                if (!empty($results)) {
                    if (!empty($val['listpic'])){
                        $list[$key]['litpic'] = getFilePath($val['listpic']);
                    }else{
                        $list[$key]['litpic'] = getFilePath($results[0]["picPath"]);
                    }

//                    list($width, $height, $type, $attr) = getimagesize(getFilePath($results[0]["picPath"]));
//                    $list[$key]['imgwidth'] = $width;
//                    $list[$key]['imgheight'] = $height;
                    foreach($results as $k=> $v){
                        $picArr[$k]['litpic'] = $v['picPath'] ? getFilePath($v['picPath']) : '';
//                        list($width, $height, $type, $attr) = getimagesize(getFilePath($v['picPath']));
                    }
                }
                $list[$key]["picArr"]     = $picArr;

                $archives             = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infopic` WHERE `aid` = " . $val['id']);
                $res                  = $dsql->dsqlOper($archives, "results");
                $list[$key]['pcount'] = $res[0]['total'];

                $list[$key]['desc'] = cn_substrR(strip_tags($val['body']), 80);

                // $archives             = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infocommon` WHERE `aid` = " . $val['id'] . " AND `ischeck` = 1 AND `floor` = 0");
                $archives = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-detail' AND `aid` = " . $val['id'] . " AND `pid` = 0");
                $res                  = $dsql->dsqlOper($archives, "results");
                $list[$key]['common'] = $res[0]['total'];

                $archives    = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'info' AND `action` = 'detail' AND `aid` = " . $val['id']);
                $collectnum  = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['collectnum'] = $collectnum;

                //会员信息
                $member               = getMemberDetail($val['userid']);
                $list[$key]['member'] = array(
                    "id" => $val['userid'],
                    "nickname" => $member['nickname'],
                    "photo" => $member['photo'],
                    "userType" => $member['userType'],
                    "emailCheck" => $member['emailCheck'],
                    "phoneCheck" => $member['phoneCheck'],
                    "certifyState" => $member['certifyState']
                );

                //验证是否已经收藏
                $params                = array(
                    "module" => "info",
                    "temp" => "detail",
                    "type" => "add",
                    "id" => $val['id'],
                    "check" => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;

                //会员中心显示信息状态
                if ($u == 1 && $userLogin->getMemberID() > -1) {

                    $now = GetMkTime(time());
                    if ($val['pubdate'] + $val['valid'] * 86400 < $now AND $val['valid'] != 0) {
                        $list[$key]['arcrank'] = 4;
                    } else {
                        $list[$key]['arcrank'] = $val['arcrank'];
                    }

                    //拒审原因
                    $list[$key]['review'] = $val['review'];

                    //显示置顶信息
                    if ($isbid) {
                        $list[$key]['bid_type']  = $val['bid_type'];
                        $list[$key]['bid_price'] = $val['bid_price'];
                        $list[$key]['bid_start'] = $val['bid_start'];
                        $list[$key]['bid_end']   = $val['bid_end'];
                        //计划置顶详细
                        if ($val['bid_type'] == 'plan') {
                            $tp_beganDate = date('Y-m-d', $val['bid_start']);
                            $tp_endDate   = date('Y-m-d', $val['bid_end']);

                            $diffDays   = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
                            $tp_planArr = array();

                            $weekArr = array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

                            //时间范围内每天的明细
                            for ($i = 0; $i < $diffDays; $i++) {
                                $began = GetMkTime($tp_beganDate);
                                $day   = AddDay($began, $i);
                                $week  = date("w", $day);

                                if ($val['bid_week' . $week]) {
                                    array_push($tp_planArr, array(
                                        'date' => date('Y-m-d', $day),
                                        'weekDay' => $week,
                                        'week' => $weekArr[$week],
                                        'type' => $val['bid_week' . $week],
                                        'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
                                    ));
                                }
                            }

                            $list[$key]['bid_plan'] = $tp_planArr;
                        }
                    }

                    $list[$key]['waitpay'] = $val['waitpay'];
                    //智能刷新
                    $refreshSmartState = (int)$val['refreshSmart'];
                    if ($val['refreshSurplus'] <= 0) {
                        $refreshSmartState = 0;
                    }
                    $list[$key]['refreshSmart'] = $refreshSmartState;
                    if ($refreshSmartState) {
                        $list[$key]['refreshCount']   = $val['refreshCount'];
                        $list[$key]['refreshTimes']   = $val['refreshTimes'];
                        $list[$key]['refreshPrice']   = $val['refreshPrice'];
                        $list[$key]['refreshBegan']   = $val['refreshBegan'];
                        $list[$key]['refreshNext']    = $val['refreshNext'];
                        $list[$key]['refreshSurplus'] = $val['refreshSurplus'];
                    }
                }

                //查询分类的高级设置
                $excitationSwitch = $refreshSwitch = $topSwitch = 0;
                $_typeid = (int)$val['typeid'];
                $sql = $dsql->SetQuery("SELECT `parentid`, `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeid);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_typeAdvanced = $ret[0]['advanced'];
                    $_typeParentid = (int)$ret[0]['parentid'];

                    //如果不是一级分类，并且没有高级设置，查询上级
                    if($_typeParentid && !$_typeAdvanced){
                        $sql = $dsql->SetQuery("SELECT `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeParentid);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if($ret){
                            $_typeAdvanced = $ret[0]['advanced'];
                        }
                    }

                    if($_typeAdvanced){
                        $_typeAdvancedArr = json_decode($_typeAdvanced, true);
                        $excitationSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['excitationSwitch'] : 1;
                        $refreshSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['refreshSwitch'] : 1;
                        $topSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['topSwitch'] : 1;
                    }
                }
                //由于后台配置中，0代表开启 1为关闭，输出给前端时，需要反转一下
                $list[$key]['excitationSwitch'] = $excitationSwitch == 0 ? 1 : 0;  //激励开关
                $list[$key]['refreshSwitch'] = $refreshSwitch == 0 ? 1 : 0;  //刷新开关
                $list[$key]['topSwitch'] = $topSwitch == 0 ? 1 : 0;  //置顶开关

            }

        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 信息详细
     * @return array
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_privatenumberState;  //隐私保护通话开关
        global $cfg_privatenumberModule;  //隐私保护通话模块开关
        global $cfg_payPhoneState;  //付费查看电话开关
        global $cfg_payPhoneModule;  //付费查看电话模块开关
        global $cfg_payPhoneVipFree;  //会员免费查看
        global $from;  //来源，用于判断是否来自APP源生页面

        $infoDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : (is_array($id) ? $id['id'] : '');
        $fromShare  = $_GET['fromShare'];
        if (!is_numeric($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //判断是否管理员已经登录
        $where = "";

        $uid = $userLogin->getMemberID();
        // 此处是为了判断信息在未审核状态下，只有管理员和发布者可以在前台浏览
        if ($userLogin->getUserID() == -1) {

            $where = " AND `arcrank` = 1";

            //如果没有登录再验证会员是否已经登录
            if ($uid == -1) {
                $where = " AND `arcrank` = 1 AND `waitpay` = 0";
            } else {
                $where = " AND (`arcrank` = 1 OR `userid` = " . $uid . ")";
            }

            $where .= " AND `del` = 0";
        }
        $time = GetMkTime(time());
        //分享得红包
        if ($fromShare){
                $archives = $dsql->SetQuery("SELECT `rewardCount`,`userid`,`rewardPrice`,`id`,`body` FROM `#@__infolist` WHERE `id` = " . $id);
                $ar = $dsql->dsqlOper($archives, "results");
                $price = $ar[0]['rewardPrice'];
                $reward = $ar[0]['rewardCount'];
                $userid = $ar[0]['userid'];
                $proid = $ar[0]['id'];
                $title = cn_substrR(strip_tags($ar[0]['body']),20);
            if ($reward > 0){           //分享人数 大于0
                $list2 = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$id' AND `touid` = '$uid' AND `type` = 1");
                $ret2 = $dsql->dsqlOper($list2, "results");
                    if ($ret2[0]['id'] < 1){
                        if ($uid != -1 ){
                            $time = GetMkTime(time());
                            //添加记录
                            $archives = $dsql->SetQuery("INSERT INTO `#@__info_hongbao_historyclick` (`uid`, `touid`, `price`, `type`,`proid`,`info`) VALUES ('$userid', '$uid', '$price', '1','$proid','1')");
                            $dsql->dsqlOper($archives, "results");
                            $toprice = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$price' WHERE `id` = '$fromShare'");
                            $dsql->dsqlOper($toprice, "update");
                            $user = $userLogin->getMemberInfo($fromShare, 1);
                            $usermoney = $user['money'];
                            $nickname = $userLogin->getMemberInfo($uid, 1);
                            $nickname = $nickname['nickname']  ? $nickname['nickname'] : '未知';
                            $infotitle = '['.$nickname.']';
                            $info = '分享得红包-来自用户'.$infotitle.$title;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`balance`) VALUES ('$fromShare', '1', '$price', '$info', '$time','info','yonghujili','','','分享红包收入','$usermoney')");
                            $dsql->dsqlOper($archives, "update");
                            //更新红包数量 价格         //  增加阅读量
                            $hongbao = $dsql->SetQuery("UPDATE `#@__infolist` SET `rewardCount` = `rewardCount`-1,`shareClick` = `shareClick`+1 WHERE `id` = '$id'");
                            $dsql->dsqlOper($hongbao, "update");
                        }

                    }
                }

        }


        $archives = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = " . $id . $where);
         $results  = $dsql->dsqlOper($archives, "results");
//        $results = getCache("info_detail", $archives, 0, $id);
        if ($results) {

            //更新阅读次数，APP和小程序端不经过controller，需要在这里更新
            // if(isApp() || isWxMiniprogram()){
            //     $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `click` = `click` + 1 WHERE `arcrank` = 1 AND `id` = " . $id);
            //     $dsql->dsqlOper($sql, "update");
            // }

            $valid                                = $results[0]['valid'];
            $pubdate                              = $results[0]['pubdate'];
            $infoDetail["id"]                     = $results[0]['id'];
            $infoDetail["waitpay"]                = $results[0]['waitpay'];
            $infoDetail["state"]                  = $results[0]['arcrank'];
            $infoDetail["titleBlod"]              = $results[0]['titleBlod'];
            $infoDetail["lng"]                    = $results[0]['longitude'] && $results[0]['longitude'] != 'undefined' ? $results[0]['longitude'] : '';
            $infoDetail["lat"]                    = $results[0]['latitude'] && $results[0]['latitude'] != 'undefined' ? $results[0]['latitude'] : '';
            $infoDetail["titleRed"]               = $results[0]['titleRed'];
            $infoDetail["feature"]                = $results[0]['label'];
            $infoDetail["rewardPrice"]            = $results[0]['rewardPrice'];
            $infoDetail["hongbaoPrice"]           = $results[0]['hongbaoPrice'];
            $infoDetail["hongbaoCount"]           = $results[0]['hongbaoCount'];             //剩余红包
            $listt = $dsql->SetQuery("SELECT count(`id`)priceCount ,SUM(`price`) pricehongbao FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$id' AND `type` = 2");
            $ret = $dsql->dsqlOper($listt, "results");
            $infoDetail['priceCount']             = $ret[0]['priceCount'];                   //被抢红包
            $infoDetail['countHongbao']           = $results[0]['hongbaoCount'] + (int)$ret[0]['priceCount'];                //一共的红包
            $infoDetail["priceHongbao"]           = $results[0]['hongbaoPrice'] + (float)$ret[0]['pricehongbao'];

            $cityname = getSiteCityName($results[0]['cityid']);
            $infoDetail["cityid"]                 = $results[0]['cityid'];
            $infoDetail["cityname"]               = $cityname;
            $typeid                               = $results[0]['typeid'];

            //查询分类的高级设置
            $excitationSwitch = 0;
            $sql = $dsql->SetQuery("SELECT `parentid`, `advanced` FROM `#@__infotype` WHERE `id` = " . $typeid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_typeAdvanced = $ret[0]['advanced'];
                $_typeParentid = (int)$ret[0]['parentid'];

                //如果不是一级分类，并且没有高级设置，查询上级
                if($_typeParentid && !$_typeAdvanced){
                    $sql = $dsql->SetQuery("SELECT `advanced` FROM `#@__infotype` WHERE `id` = " . $_typeParentid);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $_typeAdvanced = $ret[0]['advanced'];
                    }
                }

                if($_typeAdvanced){
                    $_typeAdvancedArr = json_decode($_typeAdvanced, true);
                    $excitationSwitch = $_typeAdvancedArr ? (int)$_typeAdvancedArr['excitationSwitch'] : 1;
                }
            }
            //由于后台配置中，0代表开启 1为关闭，输出给前端时，需要反转一下
            $infoDetail['excitationSwitch'] = $excitationSwitch == 0 ? 1 : 0;

            $infoDetail["readInfo"]               = $results[0]['readInfo'];
            $infoDetail["shareInfo"]              = $results[0]['shareInfo'];
            $infoDetail["share"]                  = $results[0]['share'];         //分享数量
            $infoDetail["desc"]                   = $results[0]['desc'];
            $infoDetail["hbState"]                = empty($results[0]['desc']) ? 0 : 2;          //0 不需要口令  2 需要口令
            $infoDetail["rewardCount"]            = $results[0]['rewardCount'];
            $hisid                                = $results[0]['id'];
            $listt = $dsql->SetQuery("SELECT count(`id`)priceCount,`price`,`price` hongbaoamount FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `touid` = '$uid' AND `type` = 2");
            $ret = $dsql->dsqlOper($listt, "results");
            $infoDetail["hongprice"]              = $ret[0]['price'];
            $infoDetail["hongbaoamount"]          = $ret[0]['hongbaoamount'] ? $ret[0]['hongbaoamount'] : 0;
            if ($ret[0]['priceCount'] > 0){
                $infoDetail["hbState"]   = 1;               //已枪
            }
            if (empty($results[0]['hongbaoCount']) && $infoDetail["hbState"] != 1){
                $infoDetail["hbState"]   = 3;               //已抢完
            }

            $list2 = $dsql->SetQuery("SELECT `price`,count(`id`)id FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `touid` = '$uid' AND `type` = 1 ORDER BY `id` ASC LIMIT 1");
            $ret2 = $dsql->dsqlOper($list2, "results");
            $infoDetail["fenxiangPrice"]        = $ret2[0]['price'];
            $infoDetail["fxState"]              = $ret2[0]['id'] > 0 ? 1 : 0;
            $infoDetail["typeid"]               = $results[0]['typeid'];
            $infoDetail["price_switch"]         = $results[0]['price_switch'];
            $infoDetail['typename'] = '';
            $freecall = 0;
            $archives             = $dsql->SetQuery("SELECT `typename`, `parentid`, `freecall` FROM `#@__infotype` WHERE `id` = " . $results[0]['typeid']);
            $typename             = $dsql->dsqlOper($archives, "results");
            if($typename){
                $infoDetail['typename'] = $typename[0]['typename'];
                $infoDetail['p_typeid'] = $typename[0]['parentid'];
                $freecall = (int)$typename[0]['freecall'];

                $archives             = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $typename[0]['parentid']);
                $typename             = $dsql->dsqlOper($archives, "results");
                $infoDetail['p_typename'] = $typename[0]['typename'];

            }
            //领取了红包
            $qu = $dsql->SetQuery("SELECT `touid` FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = '2'");
            $quret = $dsql->dsqlOper($qu, "results");
            $nickinfo = array();
            foreach ($quret as $kk=>$vv){
                $quinfo = $userLogin->getMemberInfo($vv['touid'], 1);
                if(is_array($quinfo)){
                    array_push($nickinfo, array(
                        'photo' => $quinfo['photo'],
                        'nickname' => $quinfo['nickname']
                    ));
                }
            }
            $infoDetail['infonickname'] =$nickinfo;

            // if(!isApp()){
                if($results[0]['color']){
                    $className  = '<font style="color:'.$results[0]['color'].'">';
                    $className1 = '</font>';
                }
                if($results[0]['titleRed']){
                    $className  = '<font style="color:#ff3d08">';
                    $className1 = '</font>';
                }
                if($results[0]['titleBlod']){
                    $htmlName  = '<strong>';
                    $htmlName1 = '</strong>';
                }
            // }
//            $lng = $results[0]['longitude'];
//            $lat = $results[0]['latitude'];
//            if(!empty($lng) && !empty($lat)){
//               $distance="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lng."-l.`longitude`)/360),2)+COS(3.1415926535898*".$lng."/180)* COS(l.`longitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lat."-l.`latitude`)/360),2))))*1000";
//                $select= (2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lng."-$lng)/360),2)+COS(3.1415926535898*".$lng."/180)* COS($lng * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lat."-$lat)/360),2))))*1000;
////                if ($val['distance'] < 1000){
////                    $infoDetail["distance"] = (int)$val['distance'].$langData['siteConfig'][13][22];
////                }elseif ($val['distance'] > 1000 && $val['distance'] < 20000 ){
////                    $infoDetail["distance"]  = sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23];
////                }
//            }
            $infoDetail["titlenew"]  = trim(strip_tags($results[0]['body']));
            $infoDetail["titlenew"] = str_replace(array("\r\n", "\r", "\n","&nbsp;", "&zwnj;"), "", $infoDetail["titlenew"]);
            $infoDetail["Newtitle"]     = cn_substrR(strip_tags(trim(str_replace(array("\r\n", "\r", "\n","&nbsp;", "&zwnj;"), "", $results[0]['body']))),50);
            $infoDetail["Newtitle"] = str_replace(array("\r\n", "\r", "\n"), "", $infoDetail["Newtitle"]);
            $infoDetail["title"]  = $results[0]['body'];
            $infoDetail["is_valid"]  = $results[0]['is_valid'];
            $infoDetail["addrid"] = $results[0]['addr'];
            $infoDetail["videoPath"]  = $results[0]['video'];
            $infoDetail["video"]  = $results[0]['video'] ? getFilePath($results[0]['video']) : '';
            $infoDetail["videoPosterPath"]  = $results[0]['videoPoster'];
            $infoDetail["videoPoster"]  = $results[0]['videoPoster'] ? getFilePath($results[0]['videoPoster']) : '';

            if (!$results[0]['addrArr']){
                $addrArr = explode($cityname, $results[0]['addrArr']);
                $infoDetail['addrArr']  = $cityname . ($addrArr[1] ? ' ' . $addrArr[1] : '');
            }else{
                global $data;
                $data = "";
                $addrArr = getParentArr("site_area", $results[0]['addr']);
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                $addrArr = join(" ", $addrArr);
                $addrArr = explode($cityname, $addrArr);
                $infoDetail['addrArr'] = $cityname . ($addrArr[1] ? ' ' . $addrArr[1] : '');
            }
            $infoDetail["address"] = $results[0]['address'];
            $infoDetail["validVal"] = $results[0]['valid'];

            $item       = array();
            $infoitem   = $dsql->SetQuery("SELECT `iid`, `value` FROM `#@__infoitem` WHERE `aid` = " . $results[0]['id'] . " AND `custom` = 0 ORDER BY `id` ASC");
            $itemResult = $dsql->dsqlOper($infoitem, "results");
            if ($itemResult) {
                foreach ($itemResult as $key => $val) {

                    //没有值的不输出
                    if($val['value'] != '' || $val['value'] == '0'){
                        $typeitem   = $dsql->SetQuery("SELECT i.`id`, i.`title`, i.`orderby` FROM `#@__infotypeitem` i LEFT JOIN `#@__infotype` t ON t.`id` = i.`tid` WHERE i.`id` = " . $val['iid'] . " AND t.`id` = i.`tid` ORDER BY i.`orderby` DESC, i.`id` ASC");
                        $itemResult = $dsql->dsqlOper($typeitem, "results");
                        if ($itemResult) {
                            $item[$key]['id']    = $val['iid'];
                            $item[$key]['type']  = $itemResult[0]['title'];
                            $item[$key]['orderby']  = (int)$itemResult[0]['orderby'];
                            $iteminfo   = $dsql->SetQuery("SELECT `iid`, `value`,`custom` FROM `#@__infoitem` WHERE `aid` = " . $results[0]['id'] . " AND `iid` = " . $val['iid'] . " AND `custom` = '1' ORDER BY `id` ASC");
                            $Resultitem = $dsql->dsqlOper($iteminfo, "results");
                            $_item = array();
                            if ($Resultitem){
                                foreach ($Resultitem as $ke => $vall) {
                                    $_item['value_custom'] = $vall['value'];
                                    $__item = explode(',', $vall['value']);
                                    $_item['valueArr_custom'] = $__item;
                                    $_item['iid'] = $vall['iid'];

                                }
                            }
                            if ($_item['iid'] == $val['iid']){
                                $item[$key]['value_custom'] = $_item['value_custom'];
                                $item[$key]['valueArr_custom'] = $_item['valueArr_custom'] ?  $_item['valueArr_custom'] : $_item['valueArr_custom']=array() ;
                            }

                            $item[$key]['value'] = $val['value'];
                            $item_ = explode(',', $val['value']);
                            $item[$key]['valueArr'] = $item_;
                        }
                    }

                }
            }

            if($item){
                usort($item, function($a, $b) {
                    return $b['orderby'] <=> $a['orderby'];
                });
            }

            $infoDetail["item"] = $item;
            $labell = explode(",",$results[0]['label']);
            $labell= join(",", $labell);
            //特色标签
            $label = array();
            if ($labell) {
                $te = $dsql->SetQuery("SELECT * FROM `#@__infoitemtype` WHERE `id` IN (" . $labell . ")");
                $teseid = $dsql->dsqlOper($te, "results");
                if ($teseid) {
                    foreach ($teseid as $k => $vv) {
                        $label[$k]['id'] = $vv['id'];
                        $label[$k]['name'] = $vv['name'];
                        $label[$k]['weight'] = $vv['weight'];
                    }
                }
            }
            $infoDetail['label'] = $label;
            //收藏
            $collectarchive = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__member_collect` WHERE `aid` = " . $id . " AND `module` ='info'");
            $resultcollect = $dsql->dsqlOper($collectarchive, "results");
            $collectCount = count($resultcollect);
            $coll = array();
            $poto = array();
            foreach ($resultcollect as $kk=>$vv){
                $coll['collectCount'] = $collectCount;
                $photo      = $userLogin->getMemberInfo($vv['userid'], 1);
                if (isset($photo['photo'])){
                    array_push($poto,$photo['photo']);
                    $coll['photo'] = $poto;
                }
            }
            $infoDetail["collectt"] = $coll;                //一共收藏
            //会员的粉丝
            $follow     = $dsql->SetQuery("SELECT count(f.`id`)follow  FROM `#@__member_follow` f LEFT JOIN `#@__member` m1 ON m1.`id` = f.`tid` WHERE f.`fid` = {$results[0]['userid']} AND m1.id != '' AND m1.`mtype`!=0 ");
            $resfollow     = $dsql->dsqlOper($follow, "results");
            $infoDetail["follow"]   = $resfollow[0]['follow'];

            $follow1     = $dsql->SetQuery("SELECT `pubdate` FROM `#@__infolist` WHERE `userid` = {$results[0]['userid']}  ORDER BY `pubdate` desc LIMIT 1");
            $resfollow1     = $dsql->dsqlOper($follow1, "results");
            $infoDetail['pubdate'] = $resfollow1[0]['pubdate'];
            $infoDetail['pubdate1'] = FloorTime(GetMkTime(time()) - $resfollow1[0]['pubdate']);

            $infoDetail["body"]   = nl2br($results[0]['body']);
            $infoDetail["mbody"]  = empty($results[0]['mbody']) ? nl2br($results[0]['body']) : nl2br($results[0]['mbody']);
            $infoDetail["person"] = $results[0]['person'];
            //是否关注
            $userLoginid = $uid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userLoginid AND `fid` = " . $results[0]['userid']);
            // $sql = "SELECT `id` FROM `#@__site_followmap` WHERE `temp` = 'info' AND `userid` = $userLoginid AND `userid_b` = {$result['uid']}";
            $sql = $dsql->SetQuery($sql);
            $is_foll = $dsql->dsqlOper($sql, "results");
            $infoDetail['is_follow']  = $is_foll ? 1 : 0;
            $infoDetail["areaCode"] = $results[0]['areaCode'];
            $RenrenCrypt       = new RenrenCrypt();
            // $infoDetail["tel"] = base64_encode($RenrenCrypt->php_encrypt($results[0]['tel']));

            //if($userLogin->getUserID() > -1 || $userLogin->getMemberID() > -1){

            //非信息发布者，电话号码处理，主要用于用户修改信息
            $loginUserID = $uid;
            $loginUserInfo = $userLogin->getMemberInfo(0, 1);
            if($uid != $results[0]['userid']){

                //判断是否已经付过查看电话号码的费用
                $payPhoneState = $loginUserID == -1 ? 0 : 1;
                if($cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) && $loginUserID != $val['userid']){

                    //判断是否开启了会员免费
                    if(($cfg_payPhoneVipFree && $loginUserInfo['level']) || $freecall){
                        $payPhoneState = 1;
                    }
                    else{
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_pay_phone` WHERE `module` = 'info' AND `temp` = 'detail' AND `uid` = '$loginUserID' AND `aid` = " . $id);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if(!$ret){
                            $payPhoneState = 0;
                        }
                    }
                }

                $infoDetail['payPhoneState'] = $payPhoneState; //当前信息是否支付过
                $infoDetail["telNum"] = !$payPhoneState && $cfg_payPhoneState && in_array('info', $cfg_payPhoneModule) ? '请先付费' : ($cfg_privatenumberState && in_array('info', $cfg_privatenumberModule) ? '请使用隐私号' : $results[0]['tel']);
            }else{
                $infoDetail['payPhoneState'] = 1;
                $infoDetail["telNum"] = $results[0]['tel'];
            }

            
            //当前登录会员的信息
            $userinfo = $loginUserInfo;

            //当前登录会员的绑定手机状态，小程序端隐私号功能需要用到
            $userPhoneCheck = 0;
            if($userinfo && $userinfo['phoneCheck']){
                $userPhoneCheck = 1;
            }
            $infoDetail['userPhoneCheck'] = $userPhoneCheck;

            $tel = (int)$results[0]['tel'];
            $infoDetail["telNum_"] = is_numeric($tel) ? (substr($tel, 0, 2) . '****' . substr($tel, -2)) : '****';
            //}

            $infoDetail["teladdr"]                = $results[0]['teladdr'];
            $infoDetail["yunfei"]                 = $results[0]['yunfei'];
            $infoDetail["editdate"]               = $results[0]['editdate'];
            $infoDetail["qq"]                     = $results[0]['qq'];
            $infoDetail["click"]                  = $results[0]['click'];
            $infoDetail["ip"]                     = preg_replace('/(\d+)\.(\d+)\.(\d+)\.(\d+)/is', "$1.$2.*.*", $results[0]['ip']);
            $infoDetail["ipaddr"]                 = $results[0]['ipaddr'];
            $infoDetail["iphome"]                 = getIpHome($results[0]['ipaddr']);
            $infoDetail["userid"]                 = $results[0]['userid'];
            $infoDetail["pubdate"]                = $pubdate;
            $infoDetail['member']                 = getMemberDetail($results[0]['userid'], 1);
            $infoDetail['member']['phone'] = $results[0]['tel'];
            $infoDetail['member']['qq'] = $results[0]['qq'];

            $infoDetail['member']['regtime_year'] = date("Y") - substr(FloorTime(time() - strtotime($infoDetail['member']['regtime'])), 0, 4);

            $days = (time() - (strtotime($infoDetail['member']['regtime']))) / 3600 / 24;

            $mons                   = (int)($days / 30);
            $infoDetail['member']['mons'] = $mons;

            $infoDetail["rec"]                    = $results[0]['rec'];
            $infoDetail["fire"]                   = $results[0]['fire'];
            $infoDetail["top"]                    = $results[0]['top'];
            if ($results[0]['top']) {
                $infoDetail["rec_fire_top"] = 'top';
            }

            $shopinfo     = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = {$results[0]['userid']} AND `state` = 1");
//            $shopinfo = $dsql->SetQuery("SELECT l.`id` FROM  `#@__member` m LEFT JOIN  `#@__business_list` l ON l.`uid` = m.`id`  WHERE l.`uid` = {$results[0]['userid']}  AND l.`state` = 1 LIMIT 1");
            $infoshop     = $dsql->dsqlOper($shopinfo, "results");
            $info_shop_id = 0;
            $is_shop = 0;
            if ($infoshop) {
                $info_shop_id = $infoshop[0]['id'];
                $is_shop = 1;
            }
//            $infoDetail['info_shop_id'] = $info_shop_id;
            $infoDetail['member']['busID'] = $info_shop_id;
            $infoDetail['is_shop'] = $is_shop;

            //会员发布信息统计
            $now = GetMkTime(time());

            require(HUONIAOINC."/config/info.inc.php");
            $expireShow = (int)$customExpireShow;  //过期后继续显示  0关  1开
            
            $_where = '';
            if(!$expireShow){
                $_where = " AND `valid` >= " . $now . " AND `valid` <> 0";
            }
            
            $archives = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `is_valid` = 0 AND `waitpay` = 0 AND `arcrank` = 1 AND `userid` = " . $results[0]['userid']." AND `del` = 0".$_where);
            $infoDetail['fabuCount'] = getCache("info", $archives, 300, array("name" => "total"));

            $archives    = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__member_collect` WHERE `module` = 'info' AND `action` = 'detail' AND `aid` = " . $results[0]['id']);
            $infoDetail['collectnum'] = getCache("info", $archives, 300, array("name" => "total"));
            // $collectnum  = $dsql->dsqlOper($archives, "totalCount");
            // $infoDetail['collectnum'] = $collectnum;

            //验证是否已经收藏
            $params = array(
                "module" => "info",
                "temp" => "detail",
                "type" => "add",
                "id" => $results[0]['id'],
                "check" => 1
            );
            $collect = checkIsCollect($params);
            $infoDetail['collect'] = $collect == "has" ? 1 : 0;
            $infoDetail["price"]  = $results[0]['price'];
            $infoDetail["price1"]  = $results[0]['price'] + $results[0]['yunfei'] ;

            //有效期
            $now                     = GetMkTime(time());
            $infoDetail["valid"]     = $valid;
            $infoDetail["isvalid"]   = ($valid == 0 || $valid < $now) ? 1 : 0;
            $infoDetail["validCeil"] = ($valid != 0 && $valid > $now) ? ceil(($valid - $now) / 86400) . "天后过期" : "已过期";


            //获取手机号码共发布多少条信息
            $archives               = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `arcrank` = 1 AND `tel` = '" . $results[0]['tel'] . "'");
            $infoDetail['telCount'] = getCache("info", $archives, 300, array("name" => "total"));

            //获取商家共发布多少条信息
            $archives                 = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `arcrank` = 1 AND `userid` = '" . $results[0]['userid'] . "'");
            $infoDetail['storeCount'] = getCache("info", $archives, 300, array("name" => "total"));

            // $archives             = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infocommon` WHERE `aid` = " . $results[0]['id'] . " AND `ischeck` = 1 AND `floor` = 0");
            $archives = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-detail' AND `aid` = '$id' AND `pid` = 0");
            $infoDetail['common'] = getCache("info", $archives, 300, array("name" => "total"));

            // $archives = $dsql->SetQuery("SELECT `userid` FROM `#@__infocommon` WHERE `aid` = " . $results[0]['id'] . " AND `ischeck` = 1 AND `floor` = 0");
            $archives = $dsql->SetQuery("SELECT `userid`  FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-detail' AND `aid` = '$id' AND `pid` = 0");
            $commons  = $dsql->dsqlOper($archives, "results");
            foreach ($commons as &$common) {
                $users = getMemberDetail($common['userid'], 1);

                $common['photo']    = $users['photo'];
                $common['username'] = $users['username'];
            }
            $infoDetail['commons'] = $commons;
            $userLogin_id = $uid;
            $is_collected = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid` = $userLogin_id  AND `userid_b` = " . $results[0]['userid'] . " AND `temp` = 'info'" );
            $is_collected = $dsql->dsqlOper($is_collected, "results");

            $infoDetail['is_collected'] = is_array($is_collected)&&!empty($is_collected) ? 1 : 0;


            //推荐信息
            $this->param = array('typeid' => $results[0]['typeid']);
            $tj_infos    = $this->ilist_v2();
            if (!empty($tj_infos) && $tj_infos['list']) {
                foreach ($tj_infos['list'] as $k => $info) {
                    if ($results[0]['id'] == $info['id']) {
                        unset($tj_infos['list'][$k]);
                    }
                }
            }

            $infoDetail['tj_infos'] = $tj_infos ? $tj_infos['list'] : [];

            //图表信息
            $archives = $dsql->SetQuery("SELECT `picPath`, `picInfo` FROM `#@__infopic` WHERE `aid` = " . $id . " ORDER BY `id` ASC");
            $_results  = $dsql->dsqlOper($archives, "results");


            if (!empty($_results)) {
                $imglist = array();
                foreach ($_results as $key => $value) {
                    $imglist[$key]["path"]       = getFilePath($value["picPath"]);
                    $imglist[$key]["pathSource"] = $value["picPath"];
                    $imglist[$key]["info"]       = $value["picInfo"];
                }
            } else {
                $imglist = array();
            }
            $infoDetail['litpic'] = getFilePath($_results[0]['listpic']);
            $infoDetail["imglist"] = $imglist;

        }


        

        //评论接口也会调用详情接口，导致阅读次数重复增加
        global $currentAction;
        if($_REQUEST['action'] != 'getComment' && $currentAction != 'getComment' && $_REQUEST['action'] != 'upList' && $currentAction != 'upList' && !$from){
            //更新阅读次数
            $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `click` = `click` + 1 WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");

            if($uid >0 && $uid!=$results[0]['userid']) {
                $uphistoryarr = array(
                    'module'    => 'info',
                    'uid'       => $uid,
                    'aid'       => $id,
                    'fuid'      => $results[0]['userid'],
                    'module2'   => 'detail',
                );
                /*更新浏览足迹表   */
                updateHistoryClick($uphistoryarr);
            }
        }



        return $infoDetail;
    }


    /**
     * 评论列表
     * @return array
     */
    public function common()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $infoid   = $orderby = $page = $pageSize = $where = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => $langData['info'][1][58]);
        } else {
            $infoid   = $this->param['infoid'];
            $orderby  = $this->param['orderby'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $oby = " ORDER BY `id` DESC";
        if ($orderby == "hot") {
            $oby = " ORDER BY `good` DESC, `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__infocommon` WHERE `aid` = " . $infoid . " AND `ischeck` = 1 AND `floor` = 0" . $oby);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']       = $val['id'];
                $list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid']);
                $list[$key]['content']  = $val['content'];
                $list[$key]['dtime']    = $val['dtime'];
                $list[$key]['ftime']    = floor((GetMkTime(time()) - $val['dtime'] / 86400) % 30) > 30 ? date("Y-m-d", $val['dtime']) : FloorTime(GetMkTime(time()) - $val['dtime']);
                $list[$key]['ip']       = $val['ip'];
                $list[$key]['ipaddr']   = $val['ipaddr'];
                $list[$key]['good']     = $val['good'];
                $list[$key]['bad']      = $val['bad'];

                $userArr               = explode(",", $val['duser']);
                $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

                // $list[$key]['lower'] = $this->getCommonList($val['id']);
                $lower = null;
                $param['fid'] = $val['id'];
                $param['page'] = 1;
                $param['pageSize'] = 100;
                $this->param = $param;
                $child = $this->getCommonList();

                if(!isset($child['state']) || $child['state'] != 200){
                    $lower = $child['list'];
                }

                $list[$key]['lower'] = $lower;
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 遍历评论子级
     * @param $fid int 评论ID
     * @return array
     */
    function getCommonList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        // if (empty($fid)) return false;
        $param    = $this->param;
        $fid      = (int)$param['fid'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        $pageSize = empty($pageSize) ? 99999 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if($fid){
            $where = " AND `floor` = '$fid'";
        }

        $where .= " AND `ischeck` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__infocommon` WHERE `floor` = " . $fid . " AND `ischeck` = 1 ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        if ($totalCount > 0) {
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['id']       = $val['id'];
                    $list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid']);
                    $list[$key]['content']  = $val['content'];
                    $list[$key]['dtime']    = $val['dtime'];
                    $list[$key]['ftime']    = floor((GetMkTime(time()) - $val['dtime'] / 86400) % 30) > 30 ? $val['dtime'] : FloorTime(GetMkTime(time()) - $val['dtime']);
                    $list[$key]['ip']       = $val['ip'];
                    $list[$key]['ipaddr']   = $val['ipaddr'];
                    $list[$key]['good']     = $val['good'];
                    $list[$key]['bad']      = $val['bad'];

                    $userArr               = explode(",", $val['duser']);
                    $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

                    // $list[$key]['lower'] = $this->getCommonList($val['id']);
                    $lower = null;
                    $param['fid'] = $val['id'];
                    $param['page'] = 1;
                    $param['pageSize'] = 100;
                    $this->param = $param;
                    $child = $this->getCommonList();
                    if(!isset($child['state']) || $child['state'] != 200){
                        $lower = $child['list'];
                    }

                    $list[$key]['lower'] = $lower;
                }
                // return $list;
                return array("pageInfo" => $pageinfo, "list" => $list);
            }
        }
    }


    /**
     * 顶评论
     * @param $id int 评论ID
     * @param string
     **/
    public function dingCommon()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];
        if (empty($id)) return $langData['info'][1][74];//"请传递评论ID！"
        $memberID = $userLogin->getMemberID();
        if ($memberID == -1 || empty($memberID)) return $langData['info'][1][75];//请先登录！

        $archives = $dsql->SetQuery("SELECT `duser` FROM `#@__infocommon` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $duser = $results[0]['duser'];

            //如果此会员已经顶过则return
            $userArr = explode(",", $duser);
            if (in_array($userLogin->getMemberID(), $userArr)) return $langData['info'][1][76];//已顶过！

            //附加会员ID
            if (empty($duser)) {
                $nuser = $userLogin->getMemberID();
            } else {
                $nuser = $duser . "," . $userLogin->getMemberID();
            }

            $archives = $dsql->SetQuery("UPDATE `#@__infocommon` SET `good` = `good` + 1 WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__infocommon` SET `duser` = '$nuser' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");
            return $results;

        } else {
            return $langData['info'][1][77];//评论不存在或已删除！
        }
    }


    /**
     * 发表评论
     * @return array
     */
    public function sendCommon()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        $aid     = $param['aid'];
        $id      = $param['id'];
        $content = addslashes($param['content']);

        if (empty($aid) || empty($content)) {
            return array("state" => 200, "info" => $langData['info'][1][78]);//'必填项不得为空！'
        }

        $content = filterSensitiveWords(cn_substrR($content, 250));

        include HUONIAOINC . "/config/info.inc.php";
        $state = (int)$customCommentCheck;

        $archives = $dsql->SetQuery("INSERT INTO `#@__infocommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`) VALUES ('$aid', '$id', '" . $userLogin->getMemberID() . "', '$content', " . GetMkTime(time()) . ", '" . GetIP() . "', '" . getIpAddr(GetIP()) . "', 0, 0, '$state', '')");
        $lid      = $dsql->dsqlOper($archives, "lastid");
        if ($lid) {
            $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__infocommon` WHERE `id` = " . $lid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $list['id']       = $results[0]['id'];
                $list['userinfo'] = $userLogin->getMemberInfo($results[0]['userid']);
                $list['content']  = $results[0]['content'];
                $list['dtime']    = $results[0]['dtime'];
                $list['ftime']    = GetMkTime(time()) - $results[0]['dtime'] > 30 ? $results[0]['dtime'] : FloorTime(GetMkTime(time()) - $results[0]['dtime']);
                $list['ip']       = $results[0]['ip'];
                $list['ipaddr']   = $results[0]['ipaddr'];
                $list['good']     = $results[0]['good'];
                $list['bad']      = $results[0]['bad'];
                return $list;
            }
        } else {
            return array("state" => 200, "info" => $langData['info'][1][79]);//'评论失败！'
        }

    }

    /**
     * 评价详情
     */
    public function commentDetail(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        $param = $this->param;
        $id    = (int)$param['id'];

        $sql = $dsql->SetQuery("SELECT * FROM `#@__infocommon` WHERE `id` = $id AND `isCheck` = 1 ");//print_R($sql);exit;
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $detail = array();
            $zan_has = 0;
            $ret = $ret[0];
            foreach ($ret as $key => $value) {

                //获取父级内容
                if($key == "floor"){
                    if($value){
                        $content  = '';
                        $username = '';
                        $sql = $dsql->SetQuery("SELECT `content`, `userid` FROM `#@__infocommon` WHERE `id` = '$value' AND `isCheck` = 1 ");
                        $par = $dsql->dsqlOper($sql, "results");
                        if($par){
                            $content = $par[0]['content'];

                            $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company` FROM `#@__member` WHERE `id` IN (".$par[0]['userid'].")");
                            $res = $dsql->dsqlOper($sql, "results");
                            if($res[0]['mtype'] == 2){
                                $username = $res[0]['company'] ? $res[0]['company'] : $res[0]['nickname'];
                            }else{
                                $username = $res[0]['nickname'];
                            }
                        }
                        $detail['parcontent'] = $content;
                        $detail['parusername'] = $username;
                    }
                }

                if($key == "duser"){
                    $zan_userArr = array();
                    if($value){
                        $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` IN (".$value.")");
                        $res = $dsql->dsqlOper($sql, "results");
                        if($res){
                            $value_ = explode(",", $value);
                            if($uid != -1 && in_array($uid, $value_)){
                                $zan_has = 1;
                            }
                            foreach ($value_ as $k => $v) {
                                foreach ($res as $s => $sv) {
                                    if($sv['id'] == $v){
                                        if($sv['mtype'] == "2"){
                                            $nickname = $sv['company'] ? $sv['company'] : $sv['nickname'];
                                        }else{
                                            $nickname = $sv['nickname'];
                                        }
                                        $photo = $sv['photo'] ? getFilePath($sv['photo']) : "";
                                        $zan_userArr[] = array(
                                            "id" => $v,
                                            "nickname" => $nickname,
                                            "photo" => $photo
                                        );
                                    }
                                }
                            }
                        }
                    }
                    $detail['zan_userArr'] = $zan_userArr;
                }

                $detail[$key] = $value;
            }

            $detail['zan_has'] = $zan_has;

            if($ret['isanony']){
                $detail['user'] = array(
                    "id" => 0,
                    "nickname" => "匿名用户",
                    "photo" => ""
                );
            }else{
                $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` = " . $ret['userid']);
                $res = $dsql->dsqlOper($sql, "results");
                if(!empty($res[0]['id'])){
                    if($res[0]['mtype'] == "2"){
                        $nickname = $res[0]['company'] ? $res[0]['company'] : $res[0]['nickname'];
                    }else{
                        $nickname = $res[0]['nickname'];
                    }
                    $photo = $res[0]['photo'] ? getFilePath($res[0]['photo']) : "";
                    $userinfo= array(
                        "id" => $res[0]['id'],
                        "nickname" => $nickname,
                        "photo" => $photo
                    );
                }
                $detail['user'] = $userinfo;
            }
            return $detail;
        }
    }


    /**
     * 发布信息
     * @return array
     */
    public function put()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $param = $this->param;
        $ip       = GetIP();
        $typeid  = (int)$param['typeid'];
        $title   = filterSensitiveWords(addslashes($param['desc']));
        $addr    = (int)$param['addr'];
        $cityid  = (int)$param['cityid'];
        $price   = (float)$param['price'];
        $person  = filterSensitiveWords(addslashes($param['username']));
        $qq      = filterSensitiveWords($param['qq']);
        $tel     = filterSensitiveWords($param['phone']);
        $areaCode = $param['areaCode'];
        $body    = filterSensitiveWords($param['body'], false);
        $imglist = $param['imgArr'];
        $valid   = (int)$param['valid'];
        $video   = $param['video'];
        $videoPoster   = $param['videoPoster'];
        $lnglat   = explode(',',str_replace('undefined', '', $param['lnglat']));
        $longitude = (float)$lnglat[0];
        $latitude = (float)$lnglat[1];
        $yunfei   = (float)$param['yunfei'];
        $price_switch   = (int)$param['price_switch'];
        $label   = $param['feature'];              //特色标签
        $xiaoprice  = (float)$param['amount'];        //有效期支付的钱
        $address    = $param['address'];
        $listpic  = $param['listpic'];              //主图
        $vercode  = (int)$param['vercode'];            //验证码
        $addrArr  = str_replace('undefined', '', $param['addrArr']);            //验证码
        $validtime = (int)$param['validtime'];  //有效期时长，需要与后台设置的时长值相同，根据这个值和配置文件中的匹配并获取价格，不能通过前端传来的时间和价格直接支付

        $top = (int)$param['top'];  //置顶天数，需要与后台设置的置顶时长值相同，根据这个值和配置文件中的匹配并获取价格

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }
        
        //用户信息
        $userinfo = $userLogin->getMemberInfo();

        //用户等级特权
        $memberLevelAuth = getMemberLevelAuth($userinfo['level']);

        if (empty($typeid)) return array("state" => 200, "info" => $langData['info'][1][80]);//'分类传递失败'
        if (empty($title)) return array("state" => 200, "info" => "请填写要发布的内容");//'标题不得为空'

        include HUONIAOINC . "/config/info.inc.php";
        include HUONIAOINC . "/config/refreshTop.inc.php";
        $arcrank = (int)$customFabuCheck;
        $fabuCheckPhone = (int)$customFabuCheckPhone;
        $fabuMapConfig = (int)$customFabuMapConfig;  //发布信息时定位功能配置  0系统默认  1选项一  2选项二

        //如果设置了不地图位置没有开通分站，则不允许发布信息功能
        if($fabuMapConfig){

            //先判断是否传了经纬度
            if(empty($longitude) || empty($latitude)) return array("state" => 200, "info" => "请选择地图位置");

            //再根据经纬度逆解析获取省市区县乡镇信息
            $_siteConfig = new siteConfig(array(
                'location' => $latitude . ',' . $longitude,
                'module' => 'info'
            ));
            $_cityinfo = $_siteConfig->getLocationByGeocoding();

            //如果获取不到，则不允许发布信息
            if(isset($_cityinfo['state'])){
                return array("state" => 200, "info" => $_cityinfo['info']);
            }

            //根据获取到的省市区县乡镇信息，判断是否开通了分站
            $_siteConfig = new siteConfig(array(
                'region' => $_cityinfo['province'],
                'city' => $_cityinfo['city'],
                'district' => $_cityinfo['district'],
                'town' => $_cityinfo['town'],
            ));
            $_cityinfo = $_siteConfig->verifyCityInfo();

            //如果获取不到，则不允许发布信息
            if(isset($_cityinfo['state'])){
                return array("state" => 200, "info" => "所在位置未开通分站，请重新选择地图位置！");
            }

        }

        $now = GetMkTime(time());

        //延长有效期配置，格式如下，这里需要和daytime值进行比较
        // [{
        //     "times": 0,
        //     "day": 5,
        //     "daytext": 3,
        //     "daytime": 432000,
        //     "dayText": "天",
        //     "price": 3
        // },
        // {
        //     "times": 0,
        //     "day": 15,
        //     "daytext": 3,
        //     "daytime": 1296000,
        //     "dayText": "天",
        //     "price": 6
        // }]
        $cfg_info_Smart = $cfg_info_Smart ? unserialize($cfg_info_Smart) : array();

        //默认有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_defaultvalid = $cfg_defaultvalid ? unserialize($cfg_defaultvalid) : array();
        $cfg_defaultvalid_daytime = $cfg_defaultvalid ? (int)$cfg_defaultvalid[0]['daytime'] : 0;
        $cfg_defaultvalid_price = $cfg_defaultvalid ? (float)$cfg_defaultvalid[0]['price'] : 0;

        //会员有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_membervalid = $cfg_membervalid ? unserialize($cfg_membervalid) : array();
        $cfg_membervalid_daytime = $cfg_membervalid ? (int)$cfg_membervalid[0]['daytime'] : 0;
        $cfg_membervalid_price = $cfg_membervalid ? (float)$cfg_membervalid[0]['price'] : 0;

        //企业会员有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_qymembervalid = $cfg_qymembervalid ? unserialize($cfg_qymembervalid) : array();
        $cfg_qymembervalid_daytime = $cfg_qymembervalid ? (int)$cfg_qymembervalid[0]['daytime'] : 0;
        $cfg_qymembervalid_price = $cfg_qymembervalid ? (float)$cfg_qymembervalid[0]['price'] : 0;

        //永久有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_valid = $cfg_valid ? unserialize($cfg_valid) : array();
        $cfg_valid_daytime = $cfg_valid ? (int)$cfg_valid[0]['daytime'] : 0;
        $cfg_valid_price = $cfg_valid ? (float)$cfg_valid[0]['price'] : 0;
        $cfg_isvalid = (int)$cfg_isvalid;  //是否启用  0未启用  1已启用

        global $cfg_fabuAmount;
        global $cfg_fabuFreeCount;
        $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
        $fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();
        $cfg_info_topNormal = $cfg_info_topNormal ? unserialize($cfg_info_topNormal) : array();

        //获取分类高级设置 
        $this->param = $typeid;
        $typeDetail = $this->typeDetail();
        if($typeDetail){
            $typeDetail = $typeDetail[0];

            //延长有效期
            $validConfig = $typeDetail['validConfig'];
            $validRule = $typeDetail['validRule'];

            //自定义
            if($validConfig){
                $cfg_info_Smart = $validRule;
            }
            
            //置顶配置
            if(!$typeDetail['topSwitch']){
                $cfg_info_topNormal = array();
            }
            elseif($typeDetail['topConfig']){
                $cfg_info_topNormal = $typeDetail['topNormal'];   
            }

        }

        //如果选择了置顶
        $topPrice = 0;
        $istop = false;
        $top_key = 0;
        if($top){
            if($cfg_info_topNormal){
                foreach($cfg_info_topNormal as $key => $val){
                    if($val['day'] == $top){
                        $topPrice = (float)$val['price'];
                        $istop = true;
                        $top_key = $key;
                    }
                }

                if(!$istop){
                    return array("state" => 200, "info" => "选择的置顶天数有误！");
                }
            }
            else{
                return array("state" => 200, "info" => "系统未开启置顶配置！");
            }
        }

        $xiaoprice = $topPrice;

        $cphone_  = $tel;
        if ($fabuCheckPhone && $vercode){
            //判断验证码
            $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->dsqlOper($sql_code, "results");

            if ($res_code) {
                $code = $res_code[0]['code'];
                if (strtolower($vercode) != $code) {
                    return array ('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                }
            } else {
                return array ('state' => 200, 'info' => '请重新发送！');//验证码输入错误，请重试！
            }
        }

        // 需要支付费用
        $amount = $xiaoprice;
        // 是否独立支付 普通会员或者付费会员超出限制
        $alonepay = 0;

        $alreadyFabu = 0; // 付费会员当天已免费发布数量

        //权限验证
//        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "info"))) {
//            return array("state" => 200, "info" => $langData['info'][1][60]);//'商家权限验证失败！'
//        }
        if ($userinfo['userType'] == 2){
            $toMax = false;

            // if ($userinfo['level']) {
            $memberInfoCount = (int)$memberLevelAuth['info'];
            if ($memberInfoCount > (int)$cfg_qymember) {
                $infoCount = $memberInfoCount;
            }else{
                $infoCount = (int)$cfg_qymember;
            }
            //统计用户当天已发布数量 @
            // $today    = GetMkTime(date("Y-m-d", time()));
            // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

            //本周
            $today = GetMkTime(date('Y-m-d', (time() - ((date('w', time()) == 0 ? 7 : date('w', time())) - 1) * 24 * 3600)));
            $tomorrow = $today + 604800;

            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $alreadyFabu = $ret[0]['total'];
                if ($alreadyFabu >= $infoCount) {
                    $toMax = true;
                    // return array("state" => 200, "info" => $langData['info'][1][82]);//'当天发布信息数量已达等级上限！'
                } else {
                    $arcrank = $arcrank;
                }
            }
            // }

            // 普通会员或者付费会员当天发布数量达上限
            if ($userinfo['level'] == 0 || $toMax) {

                //超出免费次数
                if ($fabuAmount && (($fabuFreeCount && $fabuFreeCount['info'] <= $alreadyFabu) || !$fabuFreeCount)) {
                    $alonepay = 1;
//                    $amount = $fabuAmount["info"];
                }

            }
        }else {
            if ($userinfo['userType'] == 1) {

                $toMax = false;

                // if ($userinfo['level']) {

                $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
                $infoCount = (int)$memberLevelAuth['info'];
                //统计用户当天已发布数量 @
                // $today    = GetMkTime(date("Y-m-d", time()));
                // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

                //本周
                $today = GetMkTime(date('Y-m-d', (time() - ((date('w', time()) == 0 ? 7 : date('w', time())) - 1) * 24 * 3600)));
                $tomorrow = $today + 604800;

//                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__infolist` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 ");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $alreadyFabu = $ret[0]['total'];
                    if ($alreadyFabu >= $infoCount) {
                        $toMax = true;
                        // return array("state" => 200, "info" => $langData['info'][1][82]);//'当天发布信息数量已达等级上限！'
                    } else {
                        $arcrank = $arcrank;
                    }
                }
                // }

                // 普通会员或者付费会员当天发布数量达上限
                if ($userinfo['level'] == 0 || $toMax) {

                    global $cfg_fabuAmount;
                    global $cfg_fabuFreeCount;
                    $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
                    // var_dump($fabuAmount);
                    // echo "<hr>";
                    $fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();
                    // var_dump($fabuFreeCount);die;

                    //超出免费次数
                    if ($fabuAmount && (($fabuFreeCount && $fabuFreeCount['info'] <= $alreadyFabu) || !$fabuFreeCount)) {
                        $alonepay = 1;
//                    $amount = $fabuAmount["info"];
                    }

                }

            }
        }

        //如果传了有效时间
        if ($validtime){

            $valid = $xiaoprice = 0;

            //确认是否为永久有效
            if ($cfg_isvalid && $cfg_valid_daytime == $validtime){
                $valid = $now + $validtime;
                $xiaoprice = $cfg_valid_price;
            }

            //确认是否为企业会员免费时长
            elseif ($userinfo['userType'] == 2 && $cfg_qymembervalid_daytime == $validtime && !$toMax){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //确认是否为VIP会员免费时长
            elseif ($userinfo['level'] && $memberLevelAuth['infoday'] * 86400 == $validtime && !$toMax){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //确认是否为普通会员免费时长
            elseif ($fabuAmount['infoday'] * 86400 == $validtime && !$toMax){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //最后确认是否为自定义配置
            elseif($cfg_info_Smart){
                foreach($cfg_info_Smart as $key => $val){
                    if($val['daytime'] == $validtime){
                        $valid = $now + $validtime;
                        $xiaoprice = (float)$val['price'];
                    }
                }
            }

            //没有匹配到，则错误
            else{
                return array("state" => 200, "info" => "发布有效期错误！");
            }

            if(!$valid){
                return array("state" => 200, "info" => "发布有效期错误！");
            }

        }
        
        //没有传，有效期为当前时间，也不需要
        else{
            // $valid = $xiaoprice = 0;
            return array("state" => 200, "info" => "发布有效期错误！");
        }

        $amount += $xiaoprice;

        //获取分类下相应字段
        $infoitem    = $dsql->SetQuery("SELECT * FROM `#@__infotypeitem` WHERE `tid` = " . $typeid . " ORDER BY `orderby` DESC, `id` ASC");
        $itemResults = $dsql->dsqlOper($infoitem, "results");
        //验证字段内容
        if (count($itemResults) > 0) {
            foreach ($itemResults as $key => $value) {
                if ($value["required"] == 1 && $param['huoniao_'.$value["field"]] == "") {
                    if ($value["formtype"] == "text") {
                        return array("state" => 200, "info" => $value['title'] . $langData['info'][1][83]);//不能为空
                    } else {
                        return array("state" => 200, "info" => $langData['info'][1][84] . $value['title']);//请选择
                    }
                }
            }
        }

//        if (empty($addr)) return array("state" => 200, "info" => $langData['info'][1][85]);//请选择所在区域
//        if (empty($person)) return array("state" => 200, "info" => $langData['info'][1][86]);//请输入联系人
        if (empty($tel)) return array("state" => 200, "info" => $langData['info'][1][87]);//请输入手机号码
//        if (empty($valid)) return array("state" => 200, "info" => $langData['info'][1][88]);//请选择有效期

        //判断有效期是否异常
        if($valid < $now){
            $valid = $now;
        }

        $person = cn_substrR($person, 6);
        $tel    = cn_substrR($tel, 11);

        $ip     = GetIP();
        $ipAddr = getIpAddr($ip);

        $teladdr = getTelAddr($tel);

        $yunfei = $yunfei ? $yunfei : 0;
        $price = $price ? $price : 0;
        //保存到主表
        $waitpay  = $amount > 0 ? 1 : 0;

        $title = Replace_Links($title);
        $body = $title;
        $title = cn_substrR(strip_tags($body), 50);

        $archives = $dsql->SetQuery("INSERT INTO `#@__infolist` (`cityid`, `typeid`, `title`, `valid`, `addr`, `price`, `body`, `person`, `areaCode`, `tel`, `teladdr`, `qq`, `ip`, `ipaddr`, `pubdate`, `userid`, `arcrank`, `waitpay`, `alonepay`, `weight`,`video`, `videoPoster`, `yunfei`, `price_switch`, `longitude`, `latitude`,`label`,`address`,`listpic`,`waitPrice`,`addrArr`) VALUES ('$cityid', '$typeid', '$title', '$valid', '$addr', '$price', '$body', '$person', '$areaCode', '$tel', '$teladdr', '$qq', '$ip', '$ipAddr', '$now', '$uid', '$arcrank', '$waitpay', '$alonepay', 1,'$video','$videoPoster', $yunfei, '$price_switch', '$longitude', '$latitude','$label','$address','$listpic','$amount','$addrArr')");
        $aid      = $dsql->dsqlOper($archives, "lastid");

        if (is_numeric($aid)) {

            $urlParam = array(
                'service' => 'info',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'info', '', $aid, 'insert', '发布信息('.$title.')', $url, $archives);

            autoShowUserModule($uid,'info');  // 发布资讯
            dataAsync("info",$aid);  // 发布资讯
            //保存字段内容
            if (count($itemResults) > 0) {
                foreach ($itemResults as $key => $value) {
                    $val = $param['huoniao_'.$value['field']];
                    $vall = $param['huoniao_'.$value['field'].'_custom'];          //获取自定义的值
                    if ($value['formtype'] == "checkbox" && $val!='') {
                        $val = join(",", $val);
                    }
                    $val      = filterSensitiveWords($val);
                    $infoitem = $dsql->SetQuery("INSERT INTO `#@__infoitem` (`aid`, `iid`, `value`) VALUES (" . $aid . ", " . $value['id'] . ", '" . $val . "')");
                    $dsql->dsqlOper($infoitem, "update");
                    //自定义
                    if ($value['formtype'] == "checkbox" && $vall!='') {
                        $vall = join(",", $vall);
                    $vall      = filterSensitiveWords($vall);
                    $iteminfo = $dsql->SetQuery("INSERT INTO `#@__infoitem` (`aid`, `iid`, `value`,`custom`) VALUES (" . $aid . ", " . $value['id'] . ", '" . $vall . "','1')");
                    $dsql->dsqlOper($iteminfo, "update");
                    }

                }
            }


            //保存图集表
            if ($imglist != "") {
                $picList = explode("||", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    $pics    = $dsql->SetQuery( "INSERT INTO `#@__infopic` (`aid`, `picPath`, `picInfo`) VALUES (" . $aid . ", '" . $picInfo[0] . "', '" . filterSensitiveWords($picInfo[1]) . "')");
                    $dsql->dsqlOper($pics, "update");
                }
            }

            //微信通知
//            $cityName = $siteCityInfo['name'];
//            $cityid  = $siteCityInfo['cityid'];   //调取当前的分站id
            $cityName   =  getSiteCityName($cityid);
            $infoname = getModuleTitle(array('name' => 'info'));    //获取模块名
            $titlenew = cn_substrR(strip_tags($title),20);
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
//                    'contentrn'  => $cityName.'分站——分类信息模块——用户:'.$userinfo['username'].'发布了一条信息:'.$titlenew,
                    'contentrn'  => $cityName."分站 \r\n".$infoname."模块\r\n用户：".$userinfo['nickname']."\r\n发布信息：".$titlenew."",
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );

            //需要支付的，不需要现在发送通知
            if($waitpay){
                updateAdminNotice("info", "detail",$param);
            }
            
            if ($arcrank && !$toMax) {
                $countIntegral = countIntegral($uid);    //统计积分上限
                global $cfg_returnInteraction_info;
                global $cfg_returnInteraction_commentDay;
                if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_info > 0) {
                    $infoname = getModuleTitle(array('name' => 'info'));
                    //信息发布得积分
                    $date = GetMkTime(time());
                    global $userLogin;
                    $infopoint = $cfg_returnInteraction_info;
                    //增加积分
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$infopoint' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($uid);
                    $userpoint = $user['point'];
//                    $pointuser  = (int)($userpoint+$infopoint);
                    //保存操作日志
                    $info = '发布'.$infoname.'：' . $title;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$uid', '1', '$infopoint', '$info', '$date','zengsong','1','$userpoint')");//发布信息得积分
                    $dsql->dsqlOper($archives, "update");
                    $param = array(
                        "service" => "member",
                        "type" => "user",
                        "template" => "point"
                    );

                    //自定义配置
                    $config = array(
                        "username" => $userinfo['username'],
                        "amount" => $infopoint,
                        "point" => $userinfo['point'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "info" => $info,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动积分',
                            'keyword3' => '变动时间',
                            'keyword4' => '积分余额'
                        )
                    );
                    updateMemberNotice($uid, "会员-积分变动通知", $param, $config);
                }
            }

            if ($userinfo['level']) {
                $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $infoCount);
            } else {
                $auth = array("level" => 0, "levelname" => $langData['info'][1][89], "maxcount" => 0);//普通会员
            }

            if($arcrank){
                updateCache("info_list", 300);
            }

            if ($amount > 0){

                $ordernum = create_ordernum();
                $param = array(
                    "userid" => $uid,
                    "amount" => $amount,
                    "balance" => $amount,
                    "online" => $amount,
                    "validType" => 1,
                    "valid" => $valid,
                    "top" => $top,  //置顶时长，单位：天
                    "type" => "fabu",
                    "module" => 'info',
                    "class" => '',
                    "tab" => 'infolist',
                    "aid" => $aid,
                    "title" =>cn_substrR(strip_tags($title),20),
                    "ordernum" => $ordernum
                );
                $order = createPayForm("member", $ordernum, $amount, '', '发布信息',$param,1);
                $order['timeout'] =  GetMkTime(time()) + 1800;
                $order['aid']     = $aid;
                return  $order;
            }else{

                //如果有置顶并且免费
                if($istop){

                    $ordernum = create_ordernum();

                    $topParam = array(
                        "userid" => $uid,
                        "amount" => 0,
                        "balance" => 0,
                        "online" => 0,
                        "type" => "refreshTop",
                        "module" => 'info',
                        "act" => 'detail',
                        "class" => 'topping',
                        "aid" => $aid,
                        "config" => $top_key
                    );

                    $archives = $dsql->SetQuery("SELECT `pay_code` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC LIMIT 1");
                    $_paytype = $dsql->getOne($archives);

                    $ret = createPayForm("siteConfig", $ordernum, $topPrice, $_paytype, $langData['siteConfig'][32][38], $topParam, 1);  //立即置顶

                    //成功之后增加消费操作日志
                    $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `paytype` = 'money', `state` = 1 WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                    
                    $_siteConfig = new siteConfig();
                    $_siteConfig->refreshTopSuccess($topParam);
                    
                }

                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
            }

            // return $aid;

        } else {

            return array("state" => 101, "info" => $langData['info'][1][90]);//发布到数据时发生错误，请检查字段内容！

        }

    }

    //增加有效期
    public function zvalid()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $param = $this->param;
        $id      = (int)$param['id'];
        $amount  = (float)$param['amount'];
        $hasPay  = (int)$param['hasPay'];
        $valid   = (int)$param['valid'];

        $userid = $userLogin->getMemberID();
        $time = GetMkTime(time());

        if($hasPay){
            //保存到主表
//            $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET`valid` = " . $valid . ",`waitPrice`='$amount'  WHERE `id` = " . $id);
//            $results  = $dsql->dsqlOper($archives, "update");
//            return array("state"=>100,"info"=>'成功增加有效期！');
      }
      $ordernum = create_ordernum();

      $body = array(
        "userid" => $userid,
        "amount" => $amount,
        "balance" => 0,
        "online" => $amount,
        "type" => "fabuPay",
        "module" => 'info',
        "class" => '',
        "tab" => 'infolist',
        "aid" => $id,
        "title" => '',
        "valid" => $valid,
        "validType" => 1,
        "ordernum" => $ordernum,
        "useBalance" => 0,
        "paytype" => '',
        'btitle' => ''
    );

    //   $body = array('validType' => 1, "valid" => $valid, "aid" => $id);
        if ($amount > 0){
            $type = array(
                "valid" => $valid,
                "type"  =>1,
            );
            $order = createPayForm("member", $ordernum, $amount, '', '延长有效期',$body,1);
            $order['timeout'] =  GetMkTime(time()) + 1800;
            $order['aid']     = $id;
            return  $order;
        }else{

            $param_data = serialize(array(
                'service' => 'member',
                'order_amount' => $amount,
                'order_sn' => $ordernum,
                'subject' => '延长有效期',
                'bank' => '',
                'ordernum' => $ordernum,
                'orderurl' => getUrlPath(array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "bill"
                ))
            ));

            $body = serialize($body);
            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`, `param_data`,`pt_charge`) VALUES ('member', '$ordernum', '$userid', '$body', '$amount', 'money', 0, $time, '$param_data',0)");
            $dsql->dsqlOper($archives, "results");

            return array("state"=>100,"info"=> array('info'=>$langData['info'][1][94],"amount" => $amount,"order_amount" => $amount,"aid" => $id,"ordernum" => $ordernum));
        }
    }
    /**
     * 修改信息
     * @return array
     */
    public function edit()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $param = $this->param;

        $id = $param['id'];

        if (empty($id)) return array("state" => 200, "info" => $langData['info'][1][91]);//'数据传递失败！'

        $typeid  = (int)$param['typeid'];
        $title   = filterSensitiveWords(addslashes($param['desc']));
        $addr    = (int)$param['addr'];
        $cityid  = (int)$param['cityid'];
        $price   = (int)$param['price'];
        $person  = filterSensitiveWords(addslashes($param['username']));
        $qq      = filterSensitiveWords($param['qq']);
        $tel     = filterSensitiveWords($param['phone']);
        $areaCode = $param['areaCode'];
        $body    = filterSensitiveWords($param['body'], false);
//        $imglist = $param['imglist'];
        $imglist = $param['imgArr'];
        $valid   = (int)$param['valid'];
        $video   = $param['video'];
        $videoPoster   = $param['videoPoster'];
//        $longitude = $param['longitude'];
//        $latitude = $param['latitude'];
        $price_switch   = (int)$param['price_switch'];
        $yunfei     = (float)$param['yunfei'];
        $yunfei     = $yunfei ? $yunfei : 0;
        $lnglat     = explode(',',str_replace('undefined', '', $param['lnglat']));
        $longitude  = $lnglat[0];
        $latitude   = $lnglat[1];
        $label      = $param['feature'];              //特色标签
        $address    = $param['address'];
        $xiaoprice  = (float)$param['amount'];             //需要支付的钱
        $vercode    = $param['vercode'];            //验证码
        $ip         = GetIP();
        $moneyType  = $param['moneyType'];      //增加有效期
        $hasPay     = $param['hasPay'];      //增加有效期
        $listpic    = $param['listpic'];            
        $addrArr    = str_replace('undefined', '', $param['addrArr']);            
        $validtime = (int)$param['validtime'];  //有效期时长，需要与后台设置的时长值相同，根据这个值和配置文件中的匹配并获取价格，不能通过前端传来的时间和价格直接支付

        $now = GetMkTime(time()); //延长有效期配置，格式如下，这里需要和daytime值进行比较
        
        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//'登录超时，请重新登录！'
        }

        $userinfo = $userLogin->getMemberInfo();

        //用户等级特权
        $memberLevelAuth = getMemberLevelAuth($userinfo['level']);

        //验证权限
        $oldArcrank = 0;
        $oldValid = 0;
        $oldWaitpay = 0;
        $archives = $dsql->SetQuery("SELECT `id`, `arcrank`, `valid`, `waitpay` FROM `#@__infolist` WHERE `id` = " . $id . " AND `userid` = " . $uid);
        $results = $dsql->dsqlOper($archives, "results");
        if (!$results) {
            return array("state" => 200, "info" => $langData['info'][1][82]);//'权限不足，修改失败！'
        }

        $oldArcrank = (int)$results[0]['arcrank'];
        $oldValid = (int)$results[0]['valid'];
        $oldWaitpay = (int)$results[0]['waitpay'];

        $is_expired = $oldValid < $now || $oldWaitpay ? 1 : 0;

        include HUONIAOINC . "/config/info.inc.php";
        $fabuCheckPhone = (int)$customFabuCheckPhone;
        $fabuMapConfig = (int)$customFabuMapConfig;  //发布信息时定位功能配置  0系统默认  1选项一  2选项二

        //如果设置了不地图位置没有开通分站，则不允许发布信息功能
        if($fabuMapConfig){

            //先判断是否传了经纬度
            if(empty($longitude) || empty($latitude)) return array("state" => 200, "info" => "请选择地图位置");

            //再根据经纬度逆解析获取省市区县乡镇信息
            $_siteConfig = new siteConfig(array(
                'location' => $latitude . ',' . $longitude,
                'module' => 'info'
            ));
            $_cityinfo = $_siteConfig->getLocationByGeocoding();

            //如果获取不到，则不允许发布信息
            if(isset($_cityinfo['state'])){
                return array("state" => 200, "info" => $_cityinfo['info']);
            }

            //根据获取到的省市区县乡镇信息，判断是否开通了分站
            $_siteConfig = new siteConfig(array(
                'region' => $_cityinfo['province'],
                'city' => $_cityinfo['city'],
                'district' => $_cityinfo['district'],
                'town' => $_cityinfo['town'],
            ));
            $_cityinfo = $_siteConfig->verifyCityInfo();

            //如果获取不到，则不允许发布信息
            if(isset($_cityinfo['state'])){
                return array("state" => 200, "info" => "所在位置未开通分站，请重新选择地图位置！");
            }

        }
        
        // [{
        //     "times": 0,
        //     "day": 5,
        //     "daytext": 3,
        //     "daytime": 432000,
        //     "dayText": "天",
        //     "price": 3
        // },
        // {
        //     "times": 0,
        //     "day": 15,
        //     "daytext": 3,
        //     "daytime": 1296000,
        //     "dayText": "天",
        //     "price": 6
        // }]
        $cfg_info_Smart = $cfg_info_Smart ? unserialize($cfg_info_Smart) : array();

        //默认有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_defaultvalid = $cfg_defaultvalid ? unserialize($cfg_defaultvalid) : array();
        $cfg_defaultvalid_daytime = $cfg_defaultvalid ? (int)$cfg_defaultvalid[0]['daytime'] : 0;
        $cfg_defaultvalid_price = $cfg_defaultvalid ? (float)$cfg_defaultvalid[0]['price'] : 0;

        //会员有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_membervalid = $cfg_membervalid ? unserialize($cfg_membervalid) : array();
        $cfg_membervalid_daytime = $cfg_membervalid ? (int)$cfg_membervalid[0]['daytime'] : 0;
        $cfg_membervalid_price = $cfg_membervalid ? (float)$cfg_membervalid[0]['price'] : 0;

        //企业会员有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_qymembervalid = $cfg_qymembervalid ? unserialize($cfg_qymembervalid) : array();
        $cfg_qymembervalid_daytime = $cfg_qymembervalid ? (int)$cfg_qymembervalid[0]['daytime'] : 0;
        $cfg_qymembervalid_price = $cfg_qymembervalid ? (float)$cfg_qymembervalid[0]['price'] : 0;

        //永久有效期配置
        // [
        //     {
        //         "day": 7300,
        //         "daytime": 630720000,
        //         "price": 200
        //     }
        // ]
        $cfg_valid = $cfg_valid ? unserialize($cfg_valid) : array();
        $cfg_valid_daytime = $cfg_valid ? (int)$cfg_valid[0]['daytime'] : 0;
        $cfg_valid_price = $cfg_valid ? (float)$cfg_valid[0]['price'] : 0;
        $cfg_isvalid = (int)$cfg_isvalid;  //是否启用  0未启用  1已启用

        //获取分类高级设置 
        $this->param = $typeid;
        $typeDetail = $this->typeDetail();
        if($typeDetail){
            $typeDetail = $typeDetail[0];

            //延长有效期
            $validConfig = $typeDetail['validConfig'];
            $validRule = $typeDetail['validRule'];

            //自定义
            if($validConfig){
                $cfg_info_Smart = $validRule;
            }
            
        }

        //如果传了有效时间
        if ($validtime){

            $valid = $xiaoprice = 0;

            //确认是否为永久有效
            if ($cfg_isvalid && $cfg_valid_daytime == $validtime){
                $valid = $now + $validtime;
                $xiaoprice = $cfg_valid_price;
            }

            //确认是否为企业会员免费时长
            elseif ($userinfo['userType'] == 2 && $cfg_qymembervalid_daytime == $validtime){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //确认是否为VIP会员免费时长
            elseif ($userinfo['level'] && $memberLevelAuth['infoday'] * 86400 == $validtime){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //确认是否为普通会员免费时长
            elseif ($fabuAmount['infoday'] * 86400 == $validtime){
                $valid = $now + $validtime;
                $xiaoprice = 0;
            }

            //最后确认是否为自定义配置
            elseif($cfg_info_Smart){
                foreach($cfg_info_Smart as $key => $val){
                    if($val['daytime'] == $validtime){
                        $valid = $now + $validtime;
                        $xiaoprice = (float)$val['price'];
                    }
                }
            }

            //没有匹配到，则错误
            else{
                return array("state" => 200, "info" => "发布有效期错误！");
            }

            if(!$valid){
                return array("state" => 200, "info" => "发布有效期错误！");
            }

        }
        
        //没有传，有效期为当前时间，也不需要
        elseif($is_expired){
            // $valid = $xiaoprice = 0;
            return array("state" => 200, "info" => "发布有效期错误！");
        }

        //判断有效期是否异常
        if($valid < $now){
            $valid = $now;
        }

        $amount = $xiaoprice;

//        $title = cn_substrR($title, 50);

        if($moneyType == '1'){
            if ($hasPay =='1' || !$amount) {
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET`valid` = " . $valid . ",`waitPrice`='$amount',`waitpay` = 0  WHERE `id` = " . $id);
                $results  = $dsql->dsqlOper($archives, "update");
            }
            if (empty($typeid)) return array("state" => 200, "info" => $langData['info'][1][80]);//'分类传递失败'
            if (empty($title)) return array("state" => 200, "info" => "请填写要发布的内容");//'标题不得为空'

                $cphone_ = $tel;
                if ($fabuCheckPhone && $vercode) {
                    //判断验证码
                    $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                    $res_code = $dsql->dsqlOper($sql_code, "results");

                    if ($res_code) {
                        $code = $res_code[0]['code'];
                        if (strtolower($vercode) != $code) {
                            return array('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                        }
                    } else {
                        return array('state' => 200, 'info' => '请重新发送！');//验证码输入错误，请重试！
                    }
                }

                //权限验证
                // if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "info"))) {
                //
                //     return array("state" => 200, "info" => $langData['info'][1][50]);//'商家权限验证失败！'
                // }

                //获取分类下相应字段
                $infoitem = $dsql->SetQuery("SELECT * FROM `#@__infotypeitem` WHERE `tid` = " . $typeid . " ORDER BY `orderby` DESC, `id` ASC");
                $itemResults = $dsql->dsqlOper($infoitem, "results");

                //验证字段内容
                if (count($itemResults) > 0) {
                    foreach ($itemResults as $key => $value) {
                        if ($value["required"] == 1 && $param['huoniao_'.$value["field"]] == "") {
                            if ($value["formtype"] == "text") {
                                return array("state" => 200, "info" => $value['title'] . $langData['info'][1][83]);//不能为空
                            } else {
                                return array("state" => 200, "info" => $langData['info'][1][84] . $value['title']);//请选择
                            }
                        }
                    }
                }


//        if (empty($addr)) return array("state" => 200, "info" => $langData['info'][1][85]);//请选择所在区域
//                if (empty($person)) return array("state" => 200, "info" => $langData['info'][1][86]);//请输入联系人
                if (empty($tel)) return array("state" => 200, "info" => $langData['info'][1][87]);//请输入手机号码
                if (empty($valid)) return array("state" => 200, "info" => $langData['info'][1][88]);//请选择有效期

                $person = cn_substrR($person, 6);
                $tel = cn_substrR($tel, 11);

                $ip = GetIP();
                $ipAddr = getIpAddr($ip);

                include HUONIAOINC . "/config/info.inc.php";
                $state = (int)$customFabuCheck;

                if ($hasPay =='1' || $amount) {
                    if($state != $oldArcrank){
                        $state = $oldArcrank;
                    }
                }

                $teladdr = getTelAddr($tel);
                $editdate = GetMkTime(time());
                
                $title = Replace_Links($title);
                $body = $title;
                $title = cn_substrR(strip_tags($body), 50);

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET `cityid` = '" . $cityid . "', `title` = '" . $title . "', `addr` = " . $addr . ", `price` = " . $price . ", `body` = '" . $body . "', `person` = '" . $person . "', `areaCode` = '$areaCode', `tel` = '" . $tel . "', `teladdr` = '" . $teladdr . "', `qq` = '" . $qq . "', `arcrank` = '$state',`video`='$video',`videoPoster`='$videoPoster', `price_switch`='$price_switch', `yunfei`='$yunfei', `longitude` = '$longitude', `latitude` = '$latitude',`label`='$label',`address` = '$address',`editdate` ='$editdate',`pubdate` ='$editdate',`waitPrice` = '$amount',`listpic` = '$listpic',`addrArr` = '$addrArr' WHERE `id` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");

                if ($results != "ok") {
                    return array("state" => 200, "info" => $langData['info'][1][93]);//保存到数据时发生错误，请检查字段内容！
                }

                $urlParam = array(
                    'service' => 'info',
                    'template' => 'detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($uid, 'info', '', $id, 'update', '修改信息('.$title.')', $url, $archives);

                //先删除信息所属字段
                $archives = $dsql->SetQuery("DELETE FROM `#@__infoitem` WHERE `aid` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");

                //保存字段内容
                if (count($itemResults) > 0) {
                    foreach ($itemResults as $key => $value) {

                        $val = $_POST['huoniao_'.$value['field']];
                        $vall = $param['huoniao_'.$value['field'] . '_custom'];          //获取自定义的值
                        if ($value['formtype'] == "checkbox" && $val != '') {
                            $val = join(",", $val);
                        }
                        $val = filterSensitiveWords($val);
                        $infoitem = $dsql->SetQuery("INSERT INTO `#@__infoitem` (`aid`, `iid`, `value`) VALUES (" . $id . ", " . $value['id'] . ", '" . $val . "')");
                        $dsql->dsqlOper($infoitem, "update");
                        //自定义
                        if ($value['formtype'] == "checkbox" && $vall != '') {
                            $vall = join(",", $vall);
                            $vall = filterSensitiveWords($vall);
                            $iteminfo = $dsql->SetQuery("INSERT INTO `#@__infoitem` (`aid`, `iid`, `value`,`custom`) VALUES (" . $id . ", " . $value['id'] . ", '" . $vall . "','1')");
                            $dsql->dsqlOper($iteminfo, "update");
                        }
                    }
                }

                //先删除信息所属图集
                $archives = $dsql->SetQuery("DELETE FROM `#@__infopic` WHERE `aid` = " . $id);
                $results = $dsql->dsqlOper($archives, "update");

                //保存图集表
                if ($imglist != "") {
                    $picList = explode("||", $imglist);
                    foreach ($picList as $k => $v) {
                        $picInfo = explode("|", $v);
                        $pics = $dsql->SetQuery("INSERT INTO `#@__infopic` (`aid`, `picPath`, `picInfo`) VALUES (" . $id . ", '" . $picInfo[0] . "', '" . filterSensitiveWords($picInfo[1]) . "')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
        }
        //微信通知
//        $cityName = $siteCityInfo['name'];
//        $cityid  = $siteCityInfo['cityid'];
        dataAsync("info",$id);  // 修改信息
        $cityName   =  getSiteCityName($cityid);
        $infoname = getModuleTitle(array('name' => 'info'));    //获取模块名
        $titlenew = cn_substrR(strip_tags($title),20);
        $param = array(
            'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
            'cityid' => $cityid,
            'notify' => '管理员消息通知',
            'fields' =>array(
                'contentrn'  => $cityName."分站 \r\n".$infoname."模块\r\n用户：".$userinfo['nickname']."更新信息id：".$id."\r\n更新信息：".$titlenew,
                'date' => date("Y-m-d H:i:s", time()),
            )
        );
        updateAdminNotice("info", "detail",$param);

        // 清除缓存
        clearCache("info_detail", $id);
        clearCache("info_total", "key");
        checkCache("info_list", $id);
        if ($amount > 0){
            $ordernum = create_ordernum();
            $param = array(
                "userid" => $uid,
                "amount" => $amount,
                "balance" => $amount,
                "online" => $amount,
                "validType" => 1,
                "valid" => $valid,
                "type" => "fabu",
                "module" => 'info',
                "class" => '',
                "tab" => 'infolist',
                "aid" => $id,
                "title" =>cn_substrR(strip_tags($title),20),
                "ordernum" => $ordernum
            );
            $order = createPayForm("member", $ordernum, $amount, '', '发布信息',$param,1);
            $order['timeout'] =  GetMkTime(time()) + 1800;
            $order['aid']     = $id;
            return  $order;
        }else{
            return array("state"=>100,"info"=>$langData['info'][1][94],"amount" => $amount);
        }

    }


    /**
     * 删除信息
     * @return array
     */
    public function del()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['userid'] == $uid) {

                //如果已经竞价，不可以删除
                if ($results['isbid'] == 1) {
                    return array("state" => 101, "info" => $langData['info'][1][95]);//竞价状态的信息不可以删除！
                }

                //软删除
                $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET `del` = 1 WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'info', '', $id, 'delete', '删除信息('.$results['title'].')', '', $archives);


                // //删除评论
                // $archives = $dsql->SetQuery("DELETE FROM `#@__public_comment_all` WHERE `type` = 'tieba-detail' AND `aid` = " . $id);
                // $dsql->dsqlOper($archives, "update");

                // $archives = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = " . $id);
                // $results  = $dsql->dsqlOper($archives, "results");

                // //删除缩略图
                // delPicFile($results[0]['litpic'], "delThumb", "info");

                // //删除视频
                // delPicFile($results[0]['video'], "delVideo", "info");

                // $body = $results[0]['body'];
                // if (!empty($body)) {
                //     delEditorPic($body, "info");
                // }

                // //删除图集
                // $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__infopic` WHERE `aid` = " . $id);
                // $results  = $dsql->dsqlOper($archives, "results");

                // //删除图片文件
                // if (!empty($results)) {
                //     $atlasPic = "";
                //     foreach ($results as $key => $value) {
                //         $atlasPic .= $value['picPath'] . ",";
                //     }
                //     delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "info");
                // }

                // $archives = $dsql->SetQuery("DELETE FROM `#@__infopic` WHERE `aid` = " . $id);
                // $dsql->dsqlOper($archives, "update");

                // //删除字段
                // $archives = $dsql->SetQuery("DELETE FROM `#@__infoitem` WHERE `aid` = " . $id);
                // $dsql->dsqlOper($archives, "update");

                // //删除表
                // $archives = $dsql->SetQuery("DELETE FROM `#@__infolist` WHERE `id` = " . $id);
                // $dsql->dsqlOper($archives, "update");

                // 清除缓存
                checkCache("info_list", $id);
                clearCache("info_total", "key");
                clearCache("info_detail", $id);
                dataAsync("info",$id);  // 删除信息
                return array("state" => 100, "info" => $langData['info'][1][96]);//删除成功！
            } else {
                return array("state" => 101, "info" => $langData['info'][1][97]);//权限不足，请确认帐户信息后再进行操作！
            }
        } else {
            return array("state" => 101, "info" => $langData['info'][1][98]);//信息不存在，或已经删除！
        }

    }


    /**
     * 验证信息状态是否可以竞价
     * @return array
     */
    public function checkBidState()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $aid = $this->param['aid'];

        if (!is_numeric($aid)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 101, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT `arcrank`, `isbid`, `userid`, `bid_price`, `bid_end`, `valid` FROM `#@__infolist` WHERE `id` = " . $aid);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            //已过期的不可以竞价
            $now = GetMkTime(time());
            if ($results[0]['valid'] == 0 || $results[0]['valid'] < $now) {
                return array("state" => 200, "info" => $langData['info'][1][99]);//过期的信息不可以竞价！！
            }
            if ($results[0]['userid'] != $uid) {
                return array("state" => 200, "info" => $langData['info'][1][100]);//您走错地方了吧，只能竞价自己发布的信息哦！
            } elseif ($results[0]['arcrank'] != 1) {
                return array("state" => 200, "info" => $langData['info'][2][0]);//只有已审核的信息才可以竞价！
            } elseif ($results[0]['isbid'] == 1) {
                //已经竞价
                return array('isbid' => 1, 'bid_price' => $results[0]['bid_price'], 'bid_end' => $results[0]['bid_end'], 'now' => GetMkTime(time()));
            } else {
                return 'true';
            }
        } else {
            return array("state" => 200, "info" => $langData['info'][2][1]);//信息不存在，或已经删除，不可以竞价，请确认后重试！
        }

    }


    /**
     * 竞价
     * @return array
     */
    public function bid()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $langData;

        $param   = $this->param;
        $aid     = $param['aid'];           //信息ID
        $price   = (float)$param['price'];  //每日预算
        $day     = (int)$param['day'];      //竞价时长
        $paytype = $param['paytype'];       //支付方式

        $amount = $price * $day;  //总费用

        $uid = $userLogin->getMemberID();  //当前登录用户
        if ($uid == -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html");
            die;
        }

        //信息url
        $param = array(
            "service" => "member",
            "type" => "user",
            "template" => "manage",
            "module" => "info"
        );
        $url   = getUrlPath($param);

        //验证金额
        if ($amount <= 0 || !is_numeric($aid) || empty($paytype)) {
            header("location:" . $url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `arcrank`, `isbid`, `userid`, `valid` FROM `#@__infolist` WHERE `id` = " . $aid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            //信息不存在
            header("location:" . $url);
            die;
        }
        $userid = $ret[0]['userid'];

        //没有审核的信息不可以竞价
        if ($ret[0]['arcrank'] != 1) {
            header("location:" . $url);
            die;
        }

        //已过期的不可以竞价
        $now = GetMkTime(time());
        if ($ret[0]['valid'] == 0 || $ret[0]['valid'] < $now) {
            header("location:" . $url);
            die;
        }

        //已经竞价的，不可以再提交
        if ($ret[0]['isbid'] == 1) {
            header("location:" . $url);
            die;
        }

        //只能给自己发布的信息竞价
        if ($userid != $uid) {
            header("location:" . $url);
            die;
        }

        //价格或时长验证
        if (empty($price) || empty($day)) {
            header("location:" . $url);
            die;
        }

        //订单号
        $ordernum = create_ordernum();

        //当前时间
        $start = GetMkTime(time());
        $end   = $start + $day * 24 * 3600;

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bid` (`ordernum`, `module`, `part`, `uid`, `aid`, `start`, `end`, `price`, `state`) VALUES ('$ordernum', 'info', 'detail', '$uid', '$aid', '$start', '$end', '$price', 0)");
        $return   = $dsql->dsqlOper($archives, "update");
        if ($return != "ok") {
            die($langData['info'][2][2]);//提交失败，请稍候重试！
        }

        //跳转至第三方支付页面
        createPayForm("info", $ordernum, $amount, $paytype, $langData['info'][2][4]);//分类信息竞价

    }


    /**
     * 竞价加价
     * @return array
     */
    public function bidIncrease()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $langData;

        $param   = $this->param;
        $aid     = $param['aid'];           //信息ID
        $price   = (float)$param['price'];  //每日预算
        $paytype = $param['paytype'];       //支付方式

        $uid = $userLogin->getMemberID();  //当前登录用户
        if ($uid == -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html");
            die;
        }

        //信息url
        $param = array(
            "service" => "member",
            "type" => "user",
            "template" => "manage",
            "module" => "info"
        );
        $url   = getUrlPath($param);

        //验证金额
        if (!is_numeric($aid) || empty($paytype)) {
            header("location:" . $url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `arcrank`, `isbid`, `userid`, `bid_price`, `bid_start`, `bid_end` FROM `#@__infolist` WHERE `id` = " . $aid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            //信息不存在
            header("location:" . $url);
            die;
        }
        $userid = $ret[0]['userid'];

        //没有审核的信息不可以竞价
        if ($ret[0]['arcrank'] != 1) {
            header("location:" . $url);
            die;
        }

        //如果没有参加过竞价，则不可以进行加价操作
        if ($ret[0]['isbid'] != 1) {
            header("location:" . $url);
            die;
        }

        //只能给自己发布的信息竞价
        if ($userid != $uid) {
            header("location:" . $url);
            die;
        }

        //计算剩余竞价天数
        $day = ceil(($ret[0]['bid_end'] - GetMkTime(time())) / 24 / 3600);

        //价格或时长验证
        if (empty($price) || empty($day)) {
            header("location:" . $url);
            die;
        }

        //支付金额
        $amount = $day * $price;

        //订单号
        $ordernum = create_ordernum();

        //当前时间
        $start = $ret[0]['bid_start'];
        $end   = $ret[0]['bid_end'];

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bid` (`ordernum`, `module`, `part`, `uid`, `aid`, `start`, `end`, `price`, `state`) VALUES ('$ordernum', 'info', 'detail', '$uid', '$aid', '$start', '$end', '$price', 0)");
        $return   = $dsql->dsqlOper($archives, "update");
        if ($return != "ok") {
            die($langData['info'][2][2]);//"提交失败，请稍候重试！"
        }

        //跳转至第三方支付页面
        createPayForm("info", $ordernum, $amount, $paytype, $langData['info'][2][4]);//分类信息竞价加价

    }


    /**
     * 支付成功
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
     */
    public function paySuccess()
    {
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;

        $param = $this->param;
        if (!empty($param)) {
            global $dsql;

            $paytype  = $param['paytype'];
            $ordernum = $param['ordernum'];
            $ordertype = $param['ordertype'];
            $date     = GetMkTime(time());

            $sql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordertype` = 'info' AND `ordernum` = '$ordernum' AND `state` = 1");
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) return;
            $body = unserialize($res[0]['body']);
            $pid  = $res[0]['id'];
            $uid = $res[0]['uid'];
            $ordertype = "";
            $aid = $valid = 0;
            if($body){
                $ordertype = $body['type'];
                $aid = $body['aid'];
                $valid = $body['valid'];

                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__infolist` WHERE `id` = '$prod'");
                $res = $dsql->dsqlOper($sql, "results");

                $title = $res ? $res[0]['title'] : '';

            }
            if($ordertype == 'info'){

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT * FROM `#@__info_order` WHERE `ordernum` = '$ordernum' AND `orderstate` = 0");
                $res = $dsql->dsqlOper($archives, "results");
                if(!$res) return;

                $totalPrice = $upoint = $ubalance = 0;

                $totalPrice = (float)$res[0]['payprice']; //实际支付
                $upoint     = $res[0]['point']; // 使用的积分
                $ubalance   = $res[0]['balance']; //使用的余额

                //商品
                $prod = $res[0]['prod'];
                //购买用户
                $userid = $res[0]['userid'];
                //订单id
                $orderid = $res[0]['id'];


                // 查询商家ID
                $arc = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `id` = '".$res[0]['store']."'");
                $storeList = $dsql->dsqlOper($arc, "results");
                $uid       = $storeList[0]['uid'];
                if(!$storeList){

                    $sql = $dsql->SetQuery("SELECT `userid`,`cityid` FROM `#@__infolist` WHERE `id` = ".$res[0]['prod']);
                    $res = $dsql->dsqlOper($sql, "results");
                    $uid = $res[0]['userid'];        //商家会员ID
                }

                //更新订单状态
                $archives = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 1, `paytype` = '$paytype', `paydate` = '$date' WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($archives, "update");

                //更新物品状态
                $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET `is_valid` = 1 WHERE `id` = '$prod'");
                $dsql->dsqlOper($archives, "update");

                // 清除缓存
                checkCache("info_list", $prod);
                clearCache("info_total", "key");
                clearCache("info_detail", $prod);

                //扣除会员积分
                if(!empty($upoint) && $upoint > 0){
                    global  $userLogin;
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint-$upoint);
                    //保存操作日志
                    $info = '支付二手订单';
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }
                //扣除会员余额
                if(!empty($ubalance) && $ubalance > 0){
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $totalPrice += $ubalance;
                }
                //增加冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");

                $userSql = $dsql->SetQuery("SELECT `id`, `company`, `nickname`, `username` FROM `#@__member` WHERE `id` = '". $uid."'");
                $username = $dsql->getTypeName($userSql);
                $company  = $username[0]["company"] ? $username[0]["company"] : $username[0]["nickname"];

                $foodsql = $dsql->SetQuery("SELECT `title` FROM `#@__infolist` WHERE `id` = '$prod'");
                $foodres = $dsql->dsqlOper($foodsql, "results");

                $foodname = $foodres ? $foodres[0]['title'] : '';

                //支付成功，会员消息通知
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "info",
                    "id"       => $orderid
                );
                $urlParam = serialize($paramUser);
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
//                $money       = sprintf('%.2f',($usermoney-$ubalance));
                //保存操作日志
                $title = '分类信息消费-'.$company;
                $info = '分类信息消费-'.$foodname;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$ubalance', '$info', '$date','info','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "info",
                    "id"       => $orderid
                );

                //获取会员名
                $username = "";
                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                //自定义配置
                $config = array(
                    "username" => $username,
                    "order" => $ordernum,
                    "amount" => $totalPrice,
                    "title" => "二手订单",
                    "fields" => array(
                        'keyword1' => '商品信息',
                        'keyword2' => '付款时间',
                        'keyword3' => '订单金额',
                        'keyword4' => '订单状态'
                    )
                );

                updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config,'','',0,1);

                //获取会员名
                $username = "";
                if($uid){
                    $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    }
                }else{
                    $username = '先生/女士';
                }

                //自定义配置
                $config = array(
                    "username" => $username,
                    "title" => "二手订单",
                    "order" => $ordernum,
                    "amount" => $totalPrice,
                    "fields" => array(
                        'keyword1' => '订单编号',
                        'keyword2' => '商品名称',
                        'keyword3' => '订单金额',
                        'keyword4' => '付款状态',
                        'keyword5' => '付款时间'
                    )
                );

                updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);

                $param = array(
                    "service" => "member",
                    "template" => "orderdetail",
                    "module" => "info",
                    "type" => "user",
                    "id" => $orderid
                );
                $url   = getUrlPath($param);
                return $url;

            }else{

                //延长有效期
                if($valid){

                    $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `valid` = '$valid' WHERE `id` = $aid");
                    $dsql->dsqlOper($sql, "update");

                    $urlParam = array(
                        'service' => 'info',
                        'template' => 'detail',
                        'id' => $aid
                    );
                    $url = getUrlPath($urlParam);
                
                    //记录用户行为日志
                    memberLog($uid, 'info', '', $aid, 'update', '延长有效期('.$title.'=>'.date('Y-m-d H:i:s', $valid).')', $url, $sql);

                }else{

                    //竞价订单
                    //查询订单信息
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__member_bid` WHERE `ordernum` = '$ordernum' AND `state` = 0");
                    $ret = $dsql->dsqlOper($sql, "results");


                    if ($ret) {

                        $bid   = $ret[0]['id'];
                        $uid   = $ret[0]['uid'];
                        $aid   = $ret[0]['aid'];
                        $start = $ret[0]['start'];
                        $end   = $ret[0]['end'];
                        $price = $ret[0]['price'];

                        //总价 = (结束时间 - 开始时间) 得到天数 * 每日预算
                        $day    = ($end - $start) / 24 / 3600;
                        $amount = $day * $price;

                        //信息
                        $sql       = $dsql->SetQuery("SELECT `title`, `isbid`, `bid_price` FROM `#@__infolist` WHERE `id` = $aid");
                        $ret       = $dsql->dsqlOper($sql, "results");
                        $title     = $ret[0]['title'];
                        $isbid     = $ret[0]['isbid'];
                        $bid_price = $ret[0]['bid_price'];

                        //更新订单状态
                        $sql = $dsql->SetQuery("UPDATE `#@__member_bid` SET `state` = 1 WHERE `id` = " . $bid);
                        $dsql->dsqlOper($sql, "update");

                        $currency = echoCurrency(array("type" => "short"));
                        $title = '信息消费';
                        //加价
                        if ($isbid == 1) {

                            $title = '加价，每天增加预算' . $price . $currency . '：<a href="' . $cfg_secureAccess . $cfg_basehost . '/index.php?service=info&template=detail&id=' . $aid . '" target="_blank">' . $title . '</a>';

                            //更新信息竞价状态
                            $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `bid_price` = `bid_price` + '$price' WHERE `id` = " . $aid);
                            $dsql->dsqlOper($sql, "update");

                            $urlParam = array(
                                'service' => 'info',
                                'template' => 'detail',
                                'id' => $aid
                            );
                            $url = getUrlPath($urlParam);
                        
                            //记录用户行为日志
                            memberLog($uid, 'info', '', $aid, 'update', '加价('.$title.')', $url, $sql);

                            $user  = $userLogin->getMemberInfo($uid);
                            $usermoney = $user['money'];
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`) VALUES ('$uid', '0', '$amount', '信息竞价$title', '$date','info','xiaofei','$pid','$title','$ordernum')");
                            $dsql->dsqlOper($archives, "update");


                            //竞价
                        } else {

                            $title = $day . '天，每天预算' . $price . $currency . '，结束时间：' . date("Y-m-d H:i:s", $end) . '：<a href="' . $cfg_secureAccess . $cfg_basehost . '/index.php?service=info&template=detail&id=' . $aid . '" target="_blank">' . $title . '</a>';

                            //更新信息竞价状态
                            $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `isbid` = 1, `bid_price` = '$price', `bid_start` = '$start', `bid_end` = '$end' WHERE `id` = " . $aid);
                            $dsql->dsqlOper($sql, "update");

                            $urlParam = array(
                                'service' => 'info',
                                'template' => 'detail',
                                'id' => $aid
                            );
                            $url = getUrlPath($urlParam);
                        
                            //记录用户行为日志
                            memberLog($uid, 'info', '', $aid, 'update', '竞价('.$title.')', $url, $sql);

                            $user  = $userLogin->getMemberInfo($uid);
                            $usermoney = $user['money'];
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`) VALUES ('$uid', '0', '$amount', '信息竞价$title', '$date','info','xiaofei','$pid','$title','$ordernum')");
                            $dsql->dsqlOper($archives, "update");

                        }
                    }
                }

                // 清除缓存
                clearCache("info_list", "key");
                clearCache("info_detail", $aid);

            }

        }
    }

    /**
     * 主页滚动信息
     * @return json
     */
    public function indexInfo()
    {
        global $dsql;
        $param = $this->param;
        $sql   = $dsql->SetQuery("SELECT * FROm `#@__infolist`  WHERE `arcrank` = 1 ORDER BY `id` DESC LIMIT 6");
        $ret   = $dsql->dsqlOper($sql, "results");
        foreach ($ret as $key => $item) {

            $param            = array(
                "service" => "info",
                "template" => "detail",
                "id" => $item['id']
            );
            $urlParam         = getUrlPath($param);
            $ret[$key]['url'] = $urlParam;
        }
        if (!empty($ret)) {
            return $ret;
        }
    }

    /**
     * 获取指定用户发布的信息
     */
    public function getUserHomeList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;
        if (!empty($param)) {
            $userid   = $param['userid'];
            $keywords = $param['keywords'];
        } else {
            return array('state' => 200, 'info' => $langData['info'][1][58]);
        }
        $where = '';
        if ($keywords) {
            $where .= " AND `title` LIKE '%$keywords%'";
        }

        $where .= " AND `arcrank` = 1 AND `waitpay` = 0 AND `is_valid` = 0";

        $sql      = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `userid` = $userid" . $where . " ORDER BY `id` DESC");
        $list     = $dsql->dsqlOper($sql, "results");
        $param    = array(
            "service" => "info",
            "template" => "detail",
            "id" => "%id%"
        );
        $urlParam = getUrlPath($param);
        if (!empty($list)) {

            foreach ($list as $key => $val) {

                $list[$key]['id']    = $val['id'];
                $list[$key]['title'] = $val['title'];
                $list[$key]['color'] = $val['color'];
                $list[$key]['price'] = $val['price'];
                $list[$key]['video'] = $val['video'] ? getFilePath($val['video']) : '';
                $list[$key]['videoPoster'] = $val['videoPoster'] ? getFilePath($val['videoPoster']) : '';



                //会员发布信息统计
                $archives                = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `is_valid` = 0 AND `arcrank` = 1 AND `waitpay` = 0 AND `userid` = " . $val['userid']);
                $results                 = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['fabuCount'] = $results;

                global $data;
                $data                  = "";
                $addrArr               = getParentArr("site_area", $val['addr']);
                $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
                $list[$key]['address'] = $addrArr;

                $list[$key]['typeid'] = $val['typeid'];
                $archives             = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $val['typeid']);
                $typename             = $dsql->dsqlOper($archives, "results");
                if ($typename) {
                    $list[$key]['typename'] = $typename[0]['typename'];
                } else {
                    $list[$key]['typename'] = "";
                }

                $list[$key]['tel']     = $val['tel'];
                $list[$key]['teladdr'] = $val['teladdr'];

                $list[$key]['click'] = $val['click'];

                $list[$key]['pubdate']  = $val['pubdate'];
                $list[$key]['pubdate1'] = FloorTime(GetMkTime(time()) - $val['pubdate'], 3);
                $list[$key]['fire']     = $val['fire'];
                $list[$key]['rec']      = $val['rec'];
                $list[$key]['top']      = $val['top'];
                if ($val['top']) {
                    $list[$key]["rec_fire_top"] = 'top';
                }

                $list[$key]['isbid']   = $val['isbid'];
                $list[$key]['valid']   = $val['valid'];
                $list[$key]['isvalid'] = ($val['valid'] != 0 && $val['valid'] > $now) ? 0 : 1;

                $list[$key]['typeurl'] = str_replace("%id%", $val['typeid'], $typeurlParam);
                $list[$key]['url']     = str_replace("%id%", $val['id'], $urlParam);

                //图集信息
                $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__infopic` WHERE `aid` = " . $val['id'] . " ORDER BY `id` ASC LIMIT 0, 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if (!empty($results)) {
                    $list[$key]['litpic'] = getFilePath($results[0]["picPath"]);
                }

                $archives             = $dsql->SetQuery("SELECT `id` FROM `#@__infopic` WHERE `aid` = " . $val['id']);
                $results              = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['pcount'] = $results;

                $list[$key]['desc'] = cn_substrR(strip_tags($val['body']), 80);

                $archives             = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `type` = 'tieba-detail' AND `aid` = " . $val['id'] . " AND `ischeck` = 1 AND `pid` = 0");
                $totalCount           = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['common'] = $totalCount;

            }
        }
        return $list;
    }

    //精选商家
    public  function jxbusiness(){
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;
        $pagesize = $param['pagesize'];
        $page     = $param['page'];
        global $siteCityInfo;
        $cityid = $siteCityInfo['cityid'];
        $cityid    = (int)$cityid;
        $page     = empty($page) ? 1 : $page;
        $pagesize = empty($pagesize) ? 10 : $pagesize;
        $offset = $pagesize * ($page - 1);
        $infolist = $dsql->SetQuery("SELECT t.`id`,l.`addrid`,l.`logo`,m.`nickname`,t.`typeid`,t.`title` as body,l.`title`,l.`id` businessid FROM `#@__business_list` l  LEFT JOIN `#@__member`m ON m.`id` = l.`uid` LEFT JOIN `#@__infolist`t ON t.`userid` = l.`uid` WHERE t.`del`= 0 AND m.`is_cancellation` = 0 AND l.`state` = 1  AND  t.`cityid` = $cityid GROUP BY t.`userid` ORDER BY l.`click` DESC  LIMIT $offset, $pagesize");
        $listInfo = $dsql->dsqlOper($infolist, "results");
        $arraylist = array();
        foreach ($listInfo as $kk=>$yy){
            $addrArr                   = getParentArr("site_area", $yy['addrid']);
            $addrArr                   = array_reverse(parent_foreach($addrArr, "typename"));
            $addrArr                   = array_slice($addrArr, -2, 2);
            $arraylist[$kk]['title']   = $yy['nickname'];
            $arraylist[$kk]['address'] =$addrArr;
            $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $yy['typeid']);
            $typename = getCache("info_type", $archives, 0, array("sign" => $yy['typeid'], "name" => "typename"));
            $arraylist[$kk]['typename'] =$typename ? $typename : "";
            $arraylist[$kk]['logo']     = getFilePath($yy['logo']);
            $arraylist[$kk]['body']     = cn_substrR(strip_tags($yy['body']),30);
            $arraylist[$kk]['id']       = $yy['id'];
            $arraylist[$kk]['businessid']       = $yy['businessid'];
            $param         = array(
                "service" => "info",
                "template" => "detail",
                "id" => $yy['id']
            );
            $url = getUrlPath($param);
            $arraylist[$kk]['url']       = $url;
        }
        return $arraylist;

    }

    /**
     * 商家店铺列表
     */
    public function shopList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;
        if (!empty($param)) {
            $id       = $param['id'];
            $orderby  = $param['orderby'];
            $pagesize = $param['pagesize'];
            $page     = $param['page'];
            $lat2     = $param['lat2'];
            $lng2     = $param['lng2'];
            $addrid   = $param['addrid'];
            $thumb    = $param['thumb'];
            $video    = $param['video'];
            $title    = $param['title'];
            $top      = $param['top'];
            $typeid   = $param['typeid'];

        } else {
            // return array('state' => 200, 'info' => $langData['info'][1][58]);
        }
        $where = 'WHERE 1=1 ';

        //数据共享
        require(HUONIAOINC."/config/info.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare && !$id){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            } else {
                $where .= " AND 1 = 0";
            }
        }

        $page     = empty($page) ? 1 : $page;
        $pagesize = empty($pagesize) ? 10 : $pagesize;

        if ($id) {
            $where .= " AND `id` = $id";
        }

        if($title){
            $uids = $dsql->dsqlOper($dsql->SetQuery("SELECT `uid` FROM `#@__infoshop`"), "results");
            $store_member = [];
            $ids = array_column($uids, 'uid');
            $ids = join(",", $ids);
            $store_mems = $dsql->dsqlOper($dsql->SetQuery("SELECT `nickname`, `id` FROM `#@__member` WHERE `id` in ({$ids}) AND `company` LIKE '%$title%'"), "results");
            if(!empty($store_mems)){
                $store_member = array_column($store_mems, "id");
            }
            if($store_member){
                $where .= " AND `uid` in (" . join(',', $store_member) . ")";
            }else{
                $where .= " AND 1 = 2";
            }
        }

        if($thumb){
            $where .= " AND `pic` != ''";
        }
        if($video){
            $where .= " AND `video` != ''";
        }
        if($top){
            $where .= " AND `top` = 1";
        }
        //遍历地区
        if (!empty($addrid) && $addrid != 0) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower    = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "infotype")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "infotype"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `stype` in ($lower) ";
        }

        $where .= ' AND `state` = 1 ';
        if ($orderby == '1') {
            $where .= " ORDER BY `id` DESC, `weight` DESC ,`top` DESC";
        }elseif ($orderby == '2'){
            $where .= " ORDER BY `click` DESC ";
        }elseif ($orderby == '3'){
            $where .= " ORDER BY rand() ";
        }else{
            $where .= " ORDER BY `top` DESC, `weight` DESC, `id` DESC";
        }

        if(empty($id)){
            $archives = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infoshop`".$where);
            // $results = $dsql->dsqlOper($archives, "results");
            // $totalCount = $results[0]['total'];
            $totalCount = getCache("info_shop_total", $archives, 300, array("name" => "total"));
        }else{
            $totalCount = 1;
        }

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $totalPage = ceil($totalCount / $pagesize);

        $pageinfo = ['totalCount' => $totalCount, 'page'=>$page, 'totalPage'=> $totalPage, 'pageSize'=>$pagesize];

        if (empty($id) && $pagesize && $page) {
            $offset = $pagesize * ($page - 1);
            $where  .= " LIMIT $offset, $pagesize";
        }

        $sql = "SELECT * FROM `#@__infoshop` " . $where;

        $archives = $dsql->SetQuery($sql);
        // $results  = $dsql->dsqlOper($archives, "results");
        if(empty($id)){
            $results = getCache("info_shop_list", $archives, 300);
        }else{
            $results = getCache("info_shop_detail", $archives, 0, $id);
        }

        $totalPage = ceil(count($results) / $pagesize);

        if (is_array($results)) {

            foreach ($results as &$result) {
                $user = getMemberDetail($result['uid']);
                $user['company'] = $user['company'] ? $user['company'] : $user['nickname'];
                $result['user']  = $user;

                $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__infolist` WHERE `userid` = {$result['uid']}" );
                $total = getCache("info", $sql, 300, array("name" => "total"));
                $result['fabu_num'] = $total;

                $sql = $dsql->SetQuery("SELECT count(f.`id`) total FROM `#@__member_follow` f LEFT JOIN `#@__member` m1 ON m1.`id` = f.`tid` WHERE f.`fid` = ".$result['uid']." AND m1.id != '' AND m1.`mtype`!=0");
                $total = getCache("info", $sql, 300, array("name" => "total"));
                $result['fensi'] = $total;

				$sql = $dsql->SetQuery("SELECT count(f.`id`) total FROM `#@__member_follow` f LEFT JOIN `#@__member` m1 ON m1.`id` = f.`tid` WHERE f.`tid` = ".$result['uid']." AND m1.id != '' AND m1.`mtype`!=0");
                $total = getCache("info", $sql, 300, array("name" => "total"));
                $result['guanzhu'] = $total;

                //是否关注
                $userLoginid = $userLogin->getMemberID();
				$sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userLoginid AND `fid` = " . $result['uid']);
                // $sql = "SELECT `id` FROM `#@__site_followmap` WHERE `temp` = 'info' AND `userid` = $userLoginid AND `userid_b` = {$result['uid']}";
                $sql = $dsql->SetQuery($sql);
                $is_foll = $dsql->dsqlOper($sql, "results");
                $result['is_follow'] = $is_foll ? 1 : 0;

                $days           = (time() - (strtotime($result['user']['regtime']))) / 3600 / 24;

                $mons                   = (int)($days / 30);
                $result['user']['mons'] = $mons;
                $archives               = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $result['stype']);
                // $typenames              = $dsql->dsqlOper($archives, "results");
                $typenames = getCache("info_type", $archives, 0, array("sign" => $result['stype'], "name" => "typename"));
                if ($typenames) {
                    $result['typename'] = !empty($typenames[0]['typename']) ? $typenames[0]['typename'] : $typenames;
                } else {
                    $result['typename'] = '未知';
                }

                $result['notes'] = $result['note'] ? cn_substrR($result['note'], 80) : '';

                $businesshours = '';
                if($result['openStart'] && $result['openEnd']){
                    $openStart = str_split($result['openStart'], 2);
                    $openStart = $openStart[0] . ":" . $openStart[1];
                    $openEnd   = str_split($result['openEnd'], 2);
                    $openEnd   = $openEnd[0] . ":" . $openEnd[1];
                }
                $result['businesshours'] = $openStart . "-" . $openEnd;

                $sql    = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `module` = 'info' AND `action` = 'shop' AND `aid` = " . $result['id']);
                // $total  = getCache("info", $sql, 300, array("name" => "total"));
                // $result['collectnum'] = $total;
                $collectnum  = $dsql->dsqlOper($sql, "totalCount");
                $result['collectnum'] = $collectnum;


                //验证是否已经收藏
                $params                = array(
                    "module" => "info",
                    "temp" => "shop",
                    "type" => "add",
                    "id" => $result['id'],
                    "check" => 1
                );
                $collect               = checkIsCollect($params);
                $result['collect'] = $collect == "has" ? 1 : 0;

                $result['video']     = $result['video'] ? getFilePath($result['video']) : ''; //店铺视频
                $result['video_pic'] = $result['video_pic'] ? getFilePath($result['video_pic']) : ''; //视频封面
                if($result['wechat_pic']){
                    $wechat_pic_1 = explode(',', $result['wechat_pic'])[0];
                    $result['wechat_pic'] =  getFilePath($wechat_pic_1);
                }


                $pic_tmp = $result['pic'] ? explode('###', str_replace('||', '', $result['pic'])) : ''; //店铺图片
                if(!empty($pic_tmp[0]) && strpos($pic_tmp[0], ',') !== false){
                    $pic_tmp = explode(',', $pic_tmp[0]);
                }
                if ($pic_tmp) {
                    foreach ($pic_tmp as $k => &$item) {
                        $pic_tmp[$k] = getFilePath($item);
                    }
                }
                $result['pics'] = $pic_tmp;
                $result['pcount'] = $pic_tmp ? count($pic_tmp) : 0;

                global $data;
                $data     = "";
                $addrArr            = getParentArr("site_area", $result['addrid']);
                $addrArr            = array_reverse(parent_foreach($addrArr, "typename"));
                $result['address_'] = $addrArr;

                $addrArr               = $result['address_'];
                $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
                $result['address_app'] = join(" > ", $addrArr);

                $param         = array(
                    "service" => "info",
                    "template" => "business",
                    "id" => $result['id']
                );
                $result['url'] = getUrlPath($param);

                // $sql   = "SELECT * FROM `#@__info_shopcommon` WHERE `ischeck` = 1 AND `floor` = '0' AND `pid` = " . $result['id'];
                // $sql   = $dsql->SetQuery($sql);

                $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-business' AND `aid` = " . $result['id'] . " AND `pid` = 0");
                $comms = $dsql->dsqlOper($sql, "results");
                //店铺评论
                $result['shop_common'] = $comms[0]['totalCount'];
                //商家坐标
                $result['lnglat'] = $result['lnglat'] ? explode(',', $result['lnglat']) : array(0, 0);
                //商家距离
                $distance = getDistance($result['lnglat']['0'], $result['lnglat']['1'], $lng2, $lat2);
                $result['lnglat_diff'] = sprintf("%.2f", ($distance / 1000));

                //取商家前5条商品
                $this->param = array(
                    'shopid' => $result['id'],
                    'pageSize' => 5
                );
//                $infolist = $dsql->SetQuery("SELECT t.`id`,l.`addrid`,l.`logo`,l.`title`,t.`typeid`,t.`title` as body FROM `#@__business_list` l  LEFT JOIN `#@__infolist`t ON t.`userid` = l.`uid` WHERE 1=1  GROUP BY t.`userid` ORDER BY l.`click` DESC  LIMIT 10");
//                $listInfo = $dsql->dsqlOper($infolist, "results");
//                $arraylist = array();
//                foreach ($listInfo as $kk=>$yy){
//                    $addrArr               = getParentArr("site_area", $yy['addrid']);
//                    $addrArr               = array_reverse(parent_foreach($addrArr, "typename"));
//                    $addrArr               = array_slice($addrArr, -2, 2);
//                    $arraylist[$kk]['title'] = $yy['title'];
//                    $arraylist[$kk]['address'] =$addrArr;
//                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $yy['typeid']);
//                    $typename = getCache("info_type", $archives, 0, array("sign" => $yy['typeid'], "name" => "typename"));
//                    $arraylist[$kk]['typename'] =$typename ? $typename : "";
//                    $arraylist[$kk]['logo']     = getFilePath($yy['logo']);
//                    $arraylist[$kk]['body']     = $yy['body'];
//                }
//                $result['product'] = $arraylist;

                $result['product'] = $this->ilist_v2();
            }
            unset($result);

            if(!$orderby){
                $res1 = [];
                $res2 = [];
                foreach ($results as $key => $result) {
                    if ($result['top'] == 1) {
                        $res1[$key] = $result;
                    } else {
                        $res2[$key] = $result;
                    }
                }
                $resList = array_merge($res1, $res2);
            }else{
                $resList = $results;
            }

        }
        if(!$resList){
            return array('state' =>200, 'info' => '');
        }

        return array("pageInfo" => $pageinfo, "list" => $resList);
    }

    public function getFenSiList(){
        global $dsql;
        $param = $this->param;
        $type = $param['type'];
        $user_id = $param['user_id'];
        try{
            if($type == 'f'){
                $fensi              = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = " . $user_id . " AND `temp` = 'info'" );
                $fensi              = $dsql->dsqlOper($fensi, "results");
                //粉丝列表
                $res = [];
                foreach ($fensi as $value){
                    $arr = [];
                    $arr['user'] = getMemberDetail($value['userid']);
                    $shop = $this->isShop($value['userid']);
                    $param = [
                        'service' => 'info',
                        'template' => $shop ? 'business' : 'homepage',
                        'id' => $shop ? $shop['id'] : $arr['user']['userid']
                    ];
                    $arr['url'] = getUrlPath($param);
                    $arr['is_shop'] = $shop ? 1 : 0;
                    if($shop){
                        $archives               = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $shop['stype']);
                        $typenames              = $dsql->dsqlOper($archives, "results");
                        $arr['typename'] = $typenames[0]['typename'];
                    }
                    $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `userid` = " . $value['userid']);
                    $infos = $dsql->dsqlOper($sql, "results");
                    $arr['info_count'] = count($infos);
                    $fensi              = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = " . $value['userid'] . " AND `temp` = 'info'" );
                    $fensi              = $dsql->dsqlOper($fensi, "results");
                    $arr['fensi_count'] = count($fensi);
                    array_push($res, $arr);
                }
            }else if ($type == 'g'){
                $guanzhu              = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid` = " . $user_id . " AND `temp` = 'info'" );
                $guanzhu              = $dsql->dsqlOper($guanzhu, "results");
                //关注列表
                $res = [];
                foreach ($guanzhu as $value){
                    $arr = [];
                    $arr['user'] = getMemberDetail($value['userid_b']);
                    $arr['is_shop'] = $this->isShop($value['userid_b']);
                    $shop = $this->isShop($value['userid_b']);
                    $param = [
                        'service' => 'info',
                        'template' => $shop ? 'business' : 'homepage',
                        'id' => $shop ? $shop['id'] : $arr['user']['userid']
                    ];
                    $arr['url'] = getUrlPath($param);
                    $arr['is_shop'] = $shop ? 1 : 0;
                    if($shop){
                        $archives               = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " . $shop['stype']);
                        $typenames              = $dsql->dsqlOper($archives, "results");
                        $arr['typename'] = $typenames[0]['typename'];
                    }
                    $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `userid` = " . $value['userid_b']);
                    $infos = $dsql->dsqlOper($sql, "results");
                    $arr['info_count'] = count($infos);
                    $fensi              = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = " . $value['userid_b'] . " AND `temp` = 'info'" );
                    $fensi              = $dsql->dsqlOper($fensi, "results");
                    $arr['fensi_count'] = count($fensi);
                    array_push($res, $arr);
                }
            }
        }catch (\Exception $e){
            return array('state' =>200, 'info' => '');
        }

        return $res;
    }

    public function isShop($uid)
    {
        global $dsql;
        //查询是否是商家
//        $sql     = $dsql->SetQuery("SELECT * FROM `#@__infoshop` WHERE `uid` = " . $uid);
        $sql     = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `uid` = " . $uid);
        $is_shop = $dsql->dsqlOper($sql, "results");
        if($is_shop && count($is_shop) > 0){
            return $is_shop[0];
        }else{
            return 0;
        }
    }

    /**
     * 商家详情
     * @return array|mixed
     */
    public function getStoreDetail()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $storeDetail = array();
        $id          = $this->param;
        $id          = is_numeric($id) ? $id : $id['id'];
        $gettype     = is_numeric($this->param) ? 0 : $this->param['gettype'];
        $uid         = $userLogin->getMemberID();
//        if (!is_numeric($id) && $uid == -1) {
//            return array("state" => 200, "info" => $langData['info'][1][58]);
//        }
        $where = '';
        
        $id = (int)$id;

//        $archives = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE `id` = " . $id . $where);
        $archives = $dsql->SetQuery("SELECT l.* FROM  `#@__member` m LEFT JOIN  `#@__business_list` l ON l.`uid` = m.`id`  WHERE l.`id` = ".$id.$where." LIMIT 1");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $storeDetail["userid"]   = $results[0]['id'];
            $storeDetail["title"]    = $results[0]['title'];
            $storeDetail["tel"]      = $results[0]['tel'];
            $storeDetail["lng"]      = $results[0]['lng'];
            $storeDetail["lat"]      = $results[0]['lat'];
            $storeDetail["address"]      = $results[0]['address'];

            $storeDetail["logo"]     = getFilePath($results[0]['logo']);
            $userid = $results[0]['uid'];
            $now   = GetMkTime(time());
            $typeArr= array();
            if($userid){
                $infoarchive  = $dsql->SetQuery("SELECT `typeid`,count(`typeid`)counttype FROM `#@__infolist` WHERE `userid` = $userid AND `arcrank` = 1 AND `waitpay` = 0 AND `cityid` != 0 AND `valid` > ".$now." AND `valid` <> 0 AND `valid` > ".$now." AND `del` = 0 GROUP BY `typeid`");
                $inforesult = $dsql->dsqlOper($infoarchive,'results');
                foreach ($inforesult as $key => $value ){
                    $name             = $dsql->SetQuery("SELECT `typename` FROM `#@__infotype` WHERE `id` = " .$value['typeid']);
                    $typenames              = $dsql->dsqlOper($name, "results");
                    if (!empty($typenames)){
                        $typeArr[$key]['typename'] = $typenames[0]['typename'];
                        $typeArr[$key]['counttype'] = $value['counttype'];
                        $typeArr[$key]['typeid'] = $value['typeid'];

                    }
                }
            }
            $desctype  = array_column($typeArr,'counttype');
            array_multisort($desctype,SORT_ASC,$typeArr);
            $storeDetail["typeArr"]          = $typeArr;
            $this->param = array('uid' => $userid);
            $listConfig_  = $this->ilist_v2();
            if ($listConfig_){
                $storeDetail["totalCount"]   = $listConfig_['pageInfo']["totalCount"];
            }
            //会员的粉丝
            $follow     = $dsql->SetQuery("SELECT count(`id`)follow FROM `#@__member_follow` WHERE `tid` = {$userid}");
            $resfollow  = $dsql->dsqlOper($follow, "results");
            $storeDetail["follow"]           = $resfollow[0]['follow'];
            //是否关注
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $uid AND `fid` = " . $userid);
            $is_foll = $dsql->dsqlOper($sql, "results");
            $storeDetail['is_follow']  = $is_foll ? 1 : 0;
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `id` = $userid ");
            $memberInfo = $dsql->dsqlOper($sql, "results");
            if ($memberInfo) {
                $storeDetail['memberInfo']  = $memberInfo[0] ? $memberInfo[0] : '';
                $storeDetail['memberInfo']['userid'] = $storeDetail['memberInfo']['id'];
                $storeDetail['memberInfo']['photoimg'] = getFilePath($storeDetail['memberInfo']['photo']);
            }else{
                $storeDetail['memberInfo'] = '';
            }
        }
        return $storeDetail;

    }

    public function storeDetail()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $storeDetail = array();
        $id          = $this->param;
        $id          = is_numeric($id) ? $id : $id['id'];
        $gettype     = is_numeric($this->param) ? 0 : $this->param['gettype'];
        $uid         = $userLogin->getMemberID();

        if (!is_numeric($id) && $uid == -1) {
            return array("state" => 200, "info" => $langData['info'][1][58]);
        }

        $where = '';
        if((int)$gettype == 0){

            $where = " AND `state` = 1";
        }
        if (!is_numeric($id)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__infoshop` WHERE `uid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $id    = $results[0]['id'];
                $where = "";
            } else {
                return array("state" => 200, "info" => $langData['info'][2][5]);//该会员暂未开通商铺！
            }
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__infoshop` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $storeDetail["id"]    = $results[0]['id'];
            $storeDetail["istop"] = $results[0]['top'];


            $this->param = [
                'userid' => $uid
            ];

            $uid                   = $results[0]['uid'];
            $storeDetail['member'] = getMemberDetail($uid);

            $storeDetail["typeid"] = $results[0]['stype'];
            $storeDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];
            global $data;
            $data     = "";
            $infotype = getParentArr("infotype", $results[0]['stype']);
            if ($infotype) {
                $infotype                    = array_reverse(parent_foreach($infotype, "typename"));
                $storeDetail['typename']     = join(" > ", $infotype);
                $storeDetail['typenameonly'] = count($infotype) > 2 ? $infotype[1] : $infotype[0];
            } else {
                $storeDetail['typename']     = "";
                $storeDetail['typenameonly'] = "";
            }

            $storeDetail["addrid"] = $results[0]['addrid'];
            global $data;
            $data     = "";
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data                    = "";
            $addrArr                 = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr                 = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $storeDetail['addrname'] = $addrArr;


            global $data;
            $data                = "";
            $addrArr             = array_reverse(parent_foreach($addrName, "id"));
            $storeDetail['city'] = count($addrArr) > 2 ? $addrArr[1] : $addrArr[0];

            $storeDetail["address"]      = $results[0]['address'];
            $storeDetail["shortaddress"] = cn_substrR($results[0]['address'], 10);

            if (!empty($results[0]['circle'])) {
                $storeDetail["circleid"]   = explode(",", $results[0]['circle']);
                $storeDetail['circlelist'] = json_encode(explode(",", $results[0]['circle']));
                $circleArr                 = array();
                $sql                       = $dsql->SetQuery("SELECT `name` FROM `#@__site_city_circle` WHERE `id` in (" . $results[0]['circle'] . ")");
                $creturn                   = $dsql->dsqlOper($sql, "results");
                if ($creturn) {
                    foreach ($creturn as $key => $value) {
                        $circleArr[$key] = $value['name'];
                    }
                }
                $storeDetail["circle"] = join("、", $circleArr);
            } else {
                $storeDetail["circle"]     = "";
                $storeDetail['circlelist'] = 0;
            }

            $subwayIds                        = $results[0]['subway'];
            $storeDetail["subwayid"]          = explode(",", $subwayIds);
            $storeDetail["subwaystationlist"] = json_encode(explode(",", $results[0]['subway']));
            $subwayArr                        = array();

            if (!empty($subwayIds)) {
                $sql     = $dsql->SetQuery("SELECT `title` FROM `#@__site_subway_station` WHERE `id` in (" . $subwayIds . ")");
                $creturn = $dsql->dsqlOper($sql, "results");
                if ($creturn) {
                    foreach ($creturn as $key => $value) {
                        $subwayArr[$key] = $value['title'];
                    }
                }
            }
            $storeDetail["subway"] = join("、", $subwayArr);

            $storeDetail["lnglat"]    = $results[0]['lnglat'];
            $storeDetail["tel"]       = $results[0]['tel'];
            $openStart                = $results[0]['openStart'];
            $open1                    = substr($openStart, 0, 2);
            $open2                    = substr($openStart, 2);
            $storeDetail["openStart"] = $open1 . ":" . $open2;

            $openEnd                = $results[0]['openEnd'];
            $end1                   = substr($openEnd, 0, 2);
            $end2                   = substr($openEnd, 2);
            $storeDetail["openEnd"] = $end1 . ":" . $end2;

            $storeDetail["score"]       = $results[0]['score'];
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["note"]        = $results[0]['note'];
            $storeDetail["body"]        = $results[0]['body'];
            $storeDetail["state"]       = $results[0]['state'];
            $storeDetail["phone"]       = $results[0]['phone'];
            $storeDetail["video"]       = $results[0]['video'];
            $storeDetail["sourcevideo"] = $results[0]['video'] ? getFilePath($results[0]['video']) : '';
            //验证是否已经收藏
            $params                 = array(
                "module" => "info",
                "temp" => "info",
                "type" => "add",
                "id" => $results[0]['id'],
                "check" => 1
            );
            $collect                = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;
            //图集
            $imglist = array();
            $pics    = str_replace('||', '', $results[0]['pic']);
            if (!empty($pics)) {
                $pics = explode("###", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['path']       = getFilePath($value);
                    $imglist[$key]['pathSource'] = $value;
                }
            } else {
                $imglist[$key]['path'] = '';
            }
            $storeDetail['pics'] = $imglist;

            $imglist1 = array();
            $pics1    = $results[0]['wechat_pic'];
            if (!empty($pics1)) {
                $pics1 = explode(",", $pics1);
                if(count($pics1) > 0){
                    $pics1 = [$pics1[0]];
                }
                foreach ($pics1 as $key => $value) {
                    $imglist1[$key]['path']       = getFilePath($value);
                    $imglist1[$key]['pathSource'] = $value;
                }
            } else {
                $imglist1[$key]['path'] = '';
            }
            $storeDetail['wechat_pic'] = $imglist1;


            $imgGroup = array();
            global $cfg_attachment;
            $attachment = substr($cfg_attachment, 1, strlen($cfg_attachment));

            $attachment = substr("/include/attachment.php?f=", 1, strlen("/include/attachment.php?f="));

            global $cfg_basehost;
            $attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
            $attachment = str_replace("https://" . $cfg_basehost, "", $attachment);
            $attachment = substr($attachment, 1, strlen($attachment));

            $attachment = str_replace("/", "\/", $attachment);
            $attachment = str_replace(".", "\.", $attachment);
            $attachment = str_replace("?", "\?", $attachment);
            $attachment = str_replace("=", "\=", $attachment);

            preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $results[0]['body'], $picList);
            $picList = array_unique($picList[1]);

            //内容图片
            if (!empty($picList)) {
                foreach ($picList as $v_) {
                    $filePath = getRealFilePath($v_);
                    $fileType = explode(".", $filePath);
                    $fileType = strtolower($fileType[count($fileType) - 1]);
                    $ftype    = array("jpg", "jpge", "gif", "jpeg", "png", "bmp");
                    if (in_array($fileType, $ftype)) {
                        $imgGroup[] = $filePath;
                    }
                }
            }


            preg_match_all('/<img[^>]+src=[\'\" ]?([^ \'\"?]+)[\'\" >]/isU', $results[0]['body'], $picList);
            $picList = array_unique($picList[1]);
            if (!empty($picList)) {
                foreach ($picList as $v_) {
                    $imgGroup[] = $v_;
                }
            }

            $storeDetail['imgGroup'] = $imgGroup;


            //统计评论数量
            // $sql                        = $dsql->SetQuery("SELECT count(`id`) totalCommon FROM `#@__info_shopcommon`  WHERE `ischeck` = 1 AND `pid` = " . $id);
            $sql = $dsql->SetQuery("SELECT count(`id`) totalCommon FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'info-business' AND `aid` = '$id' AND `pid` = 0");
            $ret                        = $dsql->dsqlOper($sql, "results");
            $storeDetail['totalCommon'] = $ret[0]['totalCommon'];

            $storeDetail['cityid'] = $results[0]['cityid'];

            $param         = array(
                "service" => "info",
                "template" => "business",
                "id" => $results[0]['id']
            );
            $storeDetail['domain'] = getUrlPath($param);

        }
        return $storeDetail;
    }

    /**
     * 下单
     * @return string
     */
    public function dealTouch()
    {
        global $dsql;
        global $userLogin;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $langData;

        $param = $this->param;

        $param1 = array(
            "service" => "info",
            "template" => "confirm",
            "id" => $param['buy_id'],
        );
        $url    = getUrlPath($param1);


        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();

        //重置表单参数
        $this->param = $param;

        $payCheck = $this->payCheck();
        if ($payCheck != "ok" || is_array($payTotalAmount)) {

            if ($payCheck != "ok") {
                if($this->param['flag1']){
                    echo "<script> window.onload = function (){alert(\"{$payCheck['info']}\");window.location.href = '$url'; } </script>";exit;
                }else{
                    return $payCheck;
                }

            }

            header("location:" . $url);
            die;
        }


        $ordernum   = $param['ordernum'];
        $pros       = $param['pros'];
        $addressid  = $param['addressid'];
        $paytype    = $param['paytype'];
        $note       = $param['note'];
        $flag1      = $param['flag1'];
        $flag       = $param['flag'];
        $usePinput  = $param['usePinput'];
        $point      = (float)$param['point'];
        $useBalance = $param['useBalance'];
        $balance    = (float)$param['balance'];
        $userid     = $userLogin->getMemberID();

        if (empty($addressid)) return array("state" => 200, "info" => $langData['shop'][4][15]);  //请选择收货地址
        if (empty($pros)) return array("state" => 200, "info" => $langData['shop'][4][4]);  //格式错误

        //收货地址信息
        global $data;
        $data     = "";
        $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $addressid");
        $userAddr = $dsql->dsqlOper($archives, "results");
        if (!$userAddr) return array("state" => 200, "info" => $langData['info'][2][6]);  //会员地址库信息不存在或已删除
        $addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
        $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
        $addr    = join(" ", $addrArr);
        $address = $addr . $userAddr[0]['address'];
        $person  = $userAddr[0]['person'];
        $mobile  = $userAddr[0]['mobile'];
        $tel     = $userAddr[0]['tel'];
        $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;

        $this->param = $pros;
        $detail      = $this->detail();

        //价格
        $price = $detail['price'] + (int)($detail['yunfei']);

        $opArr       = array();
        $ordernumArr = array();

        //新订单
        $newOrdernum = create_ordernum();

        //删除该用户之前的无效订单
        $delsql = $dsql->SetQuery("DELETE FROM `#@__info_order` WHERE `userid` = $userid AND `prod` = $pros AND `orderstate` = 0");
        $dsql->dsqlOper($delsql, 'update');

        //新增主表
        $store = $detail['info_shop_id'] ? $detail['info_shop_id'] : 0;
        $note  = $note[$store];
        $sql   = $dsql->SetQuery("INSERT INTO `#@__info_order` (`ordernum`, `store`, `userid`, `orderstate`, `orderdate`, `paytype`, `people`, `address`, `contact`, `note`, `prod`, `price` , `point`)
                                                      VALUES ('$newOrdernum', '$store', '$userid', 0, " . GetMkTime(time()) . ", '$paytype', '$person', '$address', '$contact', '$note', '$pros', '$price', '$point')");
        $oid   = $dsql->dsqlOper($sql, "lastid");

        if (!$oid) {
            return array("state" => 200, "info" => $langData['siteConfig'][21][174]);  //下单失败！
        }

        $RenrenCrypt = new RenrenCrypt();
        $ids         = base64_encode($RenrenCrypt->php_encrypt($newOrdernum));
        // 电脑端
        if($flag){
            $this->param = [
                'ordernum' => $newOrdernum,
                'paytype' => $paytype,
                'usePinput' => $param['usePinput'],
                'point' => $param['point'],
                'useBalance' => $param['useBalance'],
                'balance' => $param['balance'],
                'paypwd' => $param['paypwd'],
                'check' => $param['check'],
                'yunfei' => (int)($detail['yunfei']),
                'flag1' => $flag1,
                'flag' => 1,
            ];
            return $this->pay();
        }

        $param = array(
            "service" => "info",
            "template" => "pay",
            "param" => "ordernum=" . $ids
        );
        return getUrlPath($param);


    }

    /**
     * 支付前验证订单内容
     * 验证内容：商品是否存在，是否过期
     * @return array
     */
    public function payCheck()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $param = $this->param;
        $pros  = $param['pros'];

        if (empty($pros)) return array("state" => 200, "info" => $langData['shop'][4][11]);  //商品信息传递失败！

        $userid = $userLogin->getMemberID();

        //验证商品是否存在
        $this->param = $pros;
        $detail      = $this->detail();
        $this->param = $param;

        if (!is_array($detail)) {
            $info = $langData['shop'][4][13];  //订单中包含不存在或已下架的商品，请确认后重试！      提交失败，您要购买的商品不存在或已下架！
            return array("state" => 200, "info" => $info);
        }

        //验证是否为自己的店铺
        $sql = $dsql->SetQuery("SELECT `uid` FROM `#@__infoshop` WHERE `uid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            if ($detail['member']['userid'] == $ret[0]['uid']) {
                return array("state" => 200, "info" => $langData['shop'][4][14]);  //企业会员不得购买自己店铺的商品！
            }
        }

        //验证购买的是不是自己的商品
        if($detail['member']['userid'] == $userid){
            return array("state" => 200, "info" => $langData['info'][2][7]);  //企业会员不得购买自己店铺的商品！
        }


        //是否有效
        if ($detail['valid'] < time()) {
            return array("state" => 200, "info" => $langData['info'][2][8]);//您要购买的商品已经失效
        }


        //是否已售
        if ($detail['is_valid']) {
            return array("state" => 200, "info" => $langData['info'][2][69]);//您要购买的商品已经出售
        }

        return "ok";

    }

    /**
     * 支付前验证帐户积分和余额
     */
    public function checkPayAmount()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $pros       = $param['pros'];        //商品

        if ($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        if (empty($pros) && empty($ordernum)) return array("state" => 200, "info" => $langData['shop'][4][9]);  //提交失败，商品信息提交失败！

        //订单状态验证
        $payCheck = $this->payCheck();
        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $this->param = $pros;
        $detail      = $this->detail();

        //价格
        $price = $detail['price'] + (int)($detail['yunfei']);

        //返回需要支付的费用
        return sprintf("%.2f", $price );

    }

    /**
     * 支付
     */
    public function pay()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;
        global $cfg_pointRatio;
        global $langData;
        global $cfg_pointName;

        $ordernum   = $this->param['ordernum'];
        $paytype    = $this->param['paytype'];
        $usePinput  = $this->param['usePinput'];
        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        $check      = (int)$this->param['check'];
        $flag       = (int)$this->param['flag'];     // 电脑端
        $flag1      = (int)$this->param['flag1'];    // 为1时表示没有使用积分余额，直接跳转到第三方支付页面;为0时返回url
        $yunfei     = (int)$this->param['yunfei'];

        // $isPC = $flag;
        // $check = $check;
        // echo $check."==".$flag1."===".$flag;die;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            if ($check || !$flag1) {
                return array("state" => 200, "info" => $langData['info'][2][9]);//登陆超时
            } else {
                die($langData['info'][2][9]);//登陆超时
            }
        }

        if ($ordernum) {
            $ordersql = $dsql->SetQuery("SELECT * FROM `#@__info_order` WHERE `ordernum` = '$ordernum'");
            $orderinfo = $dsql->dsqlOper($ordersql, "results");
            if ($orderinfo) {
                $data          = $orderinfo[0];
                $id            = $data['id'];
                $uid           = $data['userid'];
                $sid           = $data['store'];
                $totalPrice    = $data['price'];
                $prod    = $data['prod'];

                $date = GetMkTime(time());


                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $usermoney = $userinfo['money'];
                $userpoint = $userinfo['point'];

                $tit      = array();
                $useTotal = 0;

                //判断是否使用积分，并且验证剩余积分
                if ($usePinput == 1 && !empty($point)) {
                    if ($userpoint < $point) return array("state" => 200, "info" => $langData['info'][2][10] . $cfg_pointName . $langData['info'][2][11]);//"您的可用" . $cfg_pointName . "不足，支付失败！"
                    $useTotal += $point / $cfg_pointRatio;
                    $tit[]    = "integral";
                }

                //判断是否使用余额，并且验证余额和支付密码
                if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

                    if (!empty($balance) && empty($paypwd)) {
                        if ($check || !$flag1) {
                            return array("state" => 200, "info" => $langData['info'][2][12]);//请输入支付密码
                        } else {
                            die($langData['info'][2][12]);
                        }
                    }

                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res      = $results[0];
                    $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);

                    if ($res['paypwd'] != $hash) {
                        if ($check || !$flag1) {
                            return array("state" => 200, "info" => $langData['info'][2][13]);//支付密码输入错误，请重试！
                        } else {
                            die($langData['info'][2][13]);
                        }
                    }

                    //验证余额
                    if ($usermoney < $balance) {
                        if ($check || !$flag1) {
                            return array("state" => 200, "info" => $langData['info'][2][14]);//您的余额不足，支付失败！
                        } else {
                            die($langData['info'][2][14]);
                        }
                    }

                    $useTotal += $balance;
                    $tit[]    = "money";

                }


                // 使用了余额
                if ($useTotal) {

                    if ($useTotal > $totalPrice) {
                        if ($check || !$flag1) {
                            return array("state" => 200, "info" => $langData['info'][2][15] . join($langData['info'][2][17], $tit) . $langData['info'][2][16] . join($langData['info'][2][17], $tit));//"您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit))
                        } else {
                            die("您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
                        }
                        // 余额不足
                    } elseif ($useTotal < $totalPrice && empty($paytype)) {
                        if ($check || !$flag1) {
                            return array("state" => 200, "info" => $langData['info'][2][18]);//请选择在线支付方式！
                        } else {
                            die($langData['info'][2][18]);
                        }
                    }
                }

                $amount = $totalPrice - $useTotal;
                if ($amount > 0 && empty($paytype)) {
                    if ($check || !$flag1) {
                        return array("state" => 200, "info" => $langData['info'][2][18]);//请选择在线支付方式！
                    } else {
                        die($langData['info'][2][18]);
                    }
                }

                if ($check) return "ok";


                $param = array(
                    "type" => "info"
                );

                //记录实际支付信息
                $sqlorder = $dsql->SetQuery("UPDATE `#@__info_order` SET  `payprice` = $amount, `point` = $point, `balance` = $balance WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($sqlorder, 'update');



                if ($amount > 0) {
                    // 电脑端并且使用了积分余额时返回跳转链接
                    if($flag && !$flag1){
                        $param = $this->param;
                        unset($param['flag']);
                        unset($param['flag1']);
                        unset($param['check']);
                        // print_r($param);die;
                        return "/include/ajax.php?service=info&action=pay&".http_build_query($param);
                    }else{
                        // echo $ordernum."=".$amount."===".$paytype;die;
                        createPayForm("info", $ordernum, $amount, $paytype, $langData['info'][2][19], $param);//二手订单
                    }

                    // 余额支付
                } else {

                    $paytype = $langData['info'][2][20];//余额

                    $body     = serialize($param);
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('info', '$ordernum', '$userid', '$body', 0, '$paytype', 1, '$date')");
                    $dsql->dsqlOper($archives, "results");

                    //执行支付成功的操作
                    $this->param = array(
                        "paytype" => $paytype,
                        "ordernum" => $ordernum,
                        "ordertype" => 'info'
                    );
                    $url = $this->paySuccess();

                    if($flag){
                        return $url;
                    }

                    //支付成功后跳转页面
                    global $cfg_payReturnType;
                    global $cfg_payReturnUrlPc;
                    global $cfg_payReturnUrlTouch;

                    if($cfg_payReturnType){

                        //移动端自定义跳转链接
                        if(isMobile() && $cfg_payReturnUrlTouch){
                            $url = $cfg_payReturnUrlTouch;
                        }

                        //电脑端自定义跳转链接
                        if(!isMobile() && $cfg_payReturnUrlPc){
                            $url = $cfg_payReturnUrlPc;
                        }
                    }

                    header("location:" . $url);
                    die;

                }

            } else {
                if ($check) {
                    return array("state" => 200, "info" => $langData['info'][2][21]);//订单不存在或已支付
                } else {
                    $param = array(
                        "service" => "info",
                        "template" => "index"
                    );
                    $url = getUrlPath($param);
                    header("location:" . $url);
                    die();
                }
            }

        } else {
            if ($flag) {
                return array("state" => 200, "info" => $langData['info'][2][22]);//订单不存在
            } else {
                $param = array(
                    "service" => "info",
                    "template" => "index"
                );
                $url   = getUrlPath($param);
                header("location:" . $url);
                die();
            }
        }



    }


    /**
     * 订单列表
     * @return array
     */
    public function orderList(){
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $store = $state = $userid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['info'][1][58]);
            }else{
                $store    = $this->param['store'];
                $type     = $this->param['type'];
                $state    = $this->param['state'];
                $userid   = $this->param['userid'];
                $ordernum = $this->param['ordernum'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if(empty($userid)){
            global $userLogin;
            $userid = $userLogin->getMemberID();
        }
        if(empty($userid)) return array("state" => 200, "info" => $langData['info'][2][23]);// 会员ID不得为空！

        //个人会员订单列表
        if(empty($store)){
            $where = ' o.`userid` = '.$userid;


        }else{
            //商家会员订单列表
            if(empty($type)){
                if(!verifyModuleAuth(array("module" => "info"))){
                    return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
                }

                $sid = 0;
                $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__infoshop` WHERE `uid` = ".$userid);
                $userResult = $dsql->dsqlOper($userSql, "results");
                if(!$userResult){
                    return array("state" => 200, "info" => $langData['info'][2][24]);//'您还未开通二手信息店铺！'
                }else{
                    $sid = $userResult[0]['id'];
                }

                $where = ' o.`store` = '.$sid;
            }else{
                $sid = array();
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE `userid` = ". $userid);
                $proid = $dsql->dsqlOper($sql, "results");
                if($proid){
                    foreach ($proid as $shopid){
                        $sid[] = $shopid['id'];
                    }
                }
                if(count($sid) <= 0){
                    return array("pageInfo" => $pageinfo, "list" => array());
                }else{
                    $where = " o.`prod` in (". join(',', $sid) . ')';
                }
            }
        }

        $where .= " AND l.`title` != ''";

        $archives = $dsql->SetQuery("SELECT " .
            "o.`id`, o.`ordernum`, o.`store`, o.`prod`, o.`userid`, o.`orderstate`, o.`orderdate`, o.`paytype`, o.`payprice`, o.`ret-state`, o.`exp-date` " .
            "FROM `#@__info_order` o LEFT JOIN `#@__infolist` l ON l.`id` = o.`prod` " .
            "WHERE".$where);

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        //未付款
        $unpaid = $dsql->dsqlOper($archives." AND o.`orderstate` = 0", "totalCount");
        //已支付
        $ongoing = $dsql->dsqlOper($archives." AND o.`orderstate` = 1", "totalCount");
        //已完成
        $success = $dsql->dsqlOper($archives." AND o.`orderstate` = 4", "totalCount");
        //申请退款
        $refunded = $dsql->dsqlOper($archives." AND o.`orderstate` = 3 AND o.`ret-state` = 1", "totalCount");
        //待发货
        $rates = $dsql->dsqlOper($archives." AND o.`orderstate` = 1 ", "totalCount");
        //已发货
        $recei = $dsql->dsqlOper($archives." AND o.`orderstate` = 3 AND o.`ret-state` = 0", "totalCount");
        //退款成功
        $closed = $dsql->dsqlOper($archives." AND o.`orderstate` = 7", "totalCount");

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "unpaid"   => $unpaid,
            "ongoing"  => $ongoing,
            "success"  => $success,
            "refunded" => $refunded,
            "rates"    => $rates,
            "recei"    => $recei,
            "closed"   => $closed,
        );

        if($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

        $where = "";
        if($state != "" && $state != 4 && $state != 5 && $state != 6){
            $where = " AND o.`orderstate` = " . $state . " AND o.`ret-state` = 0";
        }

        //已完成
        if($state == 4){
            $where = " AND o.`orderstate` = 4";
        }

        //待评价
        if($state == 5){
            $where = " AND o.`orderstate` = 3 AND o.`common` = 0";
        }

        //已发货
        if($state == 3){
            $where = " AND o.`orderstate` = 3 AND o.`ret-state` = 0";
        }

        //退款中
        if($state == 8){
            $where = " AND o.`orderstate` = 8 ";
        }
        //申请退款
        if($state == 6){
            $where = " AND o.`orderstate` = 3 AND o.`ret-state` = 1";
        }
        $atpage = $pageSize*($page-1);
        $where .= " ORDER BY o.`id` DESC LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");
        if($results){

            $param = array(
                "service"     => "info",
                "template"    => "detail",
                "id"          => "%id%"
            );
            $urlParam = getUrlPath($param);

            $param = array(
                "service"     => "info",
                "template"    => "pay",
                "param"       => "ordernum=%id%"
            );
            $payurlParam = getUrlPath($param);

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "info",
                "id"       => "%id%",
                "param"    => "rates=1"
            );
            $commonUrlParam = getUrlPath($param);

            $i = 0;
            foreach($results as $key => $val){

                $sql = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = ".$val['prod']);
                $ret = $dsql->dsqlOper($sql, "results");

                if($ret){

                    //商家订单列表显示买家会员信息
                    if(!empty($store)){

                        $member = getMemberDetail($val['userid']);
                        $list[$i]['member'] = array(
                            "nickname"     => $member['nickname'],
                            "certifyState" => $member['certifyState'],
                            "qq"           => $member['qq']
                        );


                        //个人会员订单列表显示商家信息
                    }else{

                        $this->param = $val['store'];
                        $storeConfig = $this->storeDetail();
                        if(is_array($storeConfig)){
                            if(empty($storeConfig)){
                                $shop_userid = $ret[0]['userid'];
                                $shop_userinfo = getMemberDetail($shop_userid);
                                $param11 = [
                                    'service' => 'info',
                                    'template' => 'homepage',
                                    'id' => $shop_userid
                                ];
                                $userdomain = getUrlPath($param11);
                                $list[$i]['store'] = array(
                                    "id"     => 0,
                                    "title"  => $shop_userinfo['nickname'],
                                    "domain" => $userdomain,
                                );
                            }else{
                                $list[$i]['store'] = array(
                                    "id"     => $storeConfig['id'],
                                    "title"  => $storeConfig['member']['nickname'],
                                    "domain" => $storeConfig['domain'],
                                );
                            }

                        }else{
                            $list[$i]['store'] = array(
                                "id"     => 0,
                                "title"  => $langData['shop'][4][37]  //官方直营
                            );
                        }

                    }

                    $list[$i]['id']          = $val['id'];
                    $list[$i]['ordernum']    = $val['ordernum'];
                    $list[$i]['orderstate']  = $val['orderstate'];
                    $list[$i]['orderdate']   = $val['orderdate'];
                    $list[$i]['retState']    = $val['ret-state'];
                    $list[$i]['expDate']     = $val['exp-date'];

                    //支付方式
                    $paySql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$val["paytype"]."'");
                    $payResult = $dsql->dsqlOper($paySql, "results");
                    if(!empty($payResult)){
                        $list[$i]["paytype"]   = $payResult[0]["pay_name"];
                    }else{
                        global $cfg_pointName;
                        $payname = "";
                        if($val["paytype"] == "point,money"){
                            $payname = $cfg_pointName."+".$langData['siteConfig'][19][363];  //余额
                        }elseif($val["paytype"] == "point"){
                            $payname = $cfg_pointName;
                        }elseif($val["paytype"] == "余额"){
                            $payname = $langData['siteConfig'][19][363]; //余额
                        }
                        $list[$i]["paytype"]   = $payname;
                    }

                    //未付款的提供付款链接
                    if($val['orderstate'] == 0){
                        $RenrenCrypt = new RenrenCrypt();
                        $encodeid = base64_encode($RenrenCrypt->php_encrypt($val["ordernum"]));
                        $list[$i]["payurl"] = str_replace("%id%", $encodeid, $payurlParam);
                    }

                    //评价
                    $list[$i]['common'] = $val['common'];

                    //商品信息
                    $productArr = array();
                    $totalPayPrice = $val['payprice'];
                    foreach ($ret as $k => $v) {
                        global $oper;
                        $oper = "user";
                        $this->param = $v['id'];
                        $detail = $this->detail();

                        $list[$i]['product'][$k]['title'] = $detail['title'];
                        $imglist = $detail['imglist'];
                        if(!empty($imglist)){
                            $list[$i]['product'][$k]['litpic'] = $imglist[0]['path'];
                        }else{
                            $list[$i]['product'][$k]['litpic'] = '';
                        }


                        $list[$i]['product'][$k]['url'] = str_replace("%id%", $v['id'], $urlParam);

                        $list[$i]['product'][$k]['price'] = $v['price'];
                        $list[$i]['product'][$k]['count'] =0;
                        $list[$i]['product'][$k]['specation'] ='';

                        //未付款的不计算积分和余额部分
                        // if($val['orderstate'] == 0){
                        //     $totalPayPrice += $v['price'];
                        // }else{
                        //     $totalPayPrice += $v['payprice'];
                        // }
                    }
                    $list[$i]['totalPayPrice'] = sprintf("%.2f", $totalPayPrice);

                    $i++;
                }

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 订单详细
     * @return array
     */
    public function orderDetail(){
        global $dsql;
        global $langData;
        $orderDetail = $cardnum = array();
        $id = $this->param;

        global $userLogin;
        $userid = $userLogin->getMemberID();

        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        if(!is_numeric($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //主表信息
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.* FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON s.`id` = o.`store` WHERE (o.`userid` = '$userid' OR s.`uid` = '$userid') AND o.`id` = ".$id);
        }else{
            $archives = $dsql->SetQuery("SELECT o.* FROM `#@__info_order` o WHERE o.`id` = ".$id);
        }
        $results = $dsql->dsqlOper($archives, "results");

        if(!empty($results)){
            $results = $results[0];

            $orderDetail["ordernum"]   = $results["ordernum"];
            $orderDetail["store"]      = $results["store"];
            $orderDetail["orderstate"] = $results["orderstate"];
            $orderDetail["orderdate"]  = $results["orderdate"];
            $orderDetail["common"]     = $results["common"];


            //店铺信息
            $store = array();
            if($results['store'] != 0){
                $storeHandels = new handlers("info", "storeDetail");
                $storeConfig  = $storeHandels->getHandle($results['store']);
                if(is_array($storeConfig) && $storeConfig['state'] == 100){
                    $storeConfig  = $storeConfig['info'];
                    if(is_array($storeConfig)){
                        $store = $storeConfig;
                    }
                }
            }
            $orderDetail['store'] = $store;


            //配送信息
            $orderDetail["username"]    = $results["people"];
            $orderDetail["useraddr"]    = $results["address"];
            $orderDetail["usercontact"] = $results["contact"];
            $orderDetail["note"]        = $results["note"];

            $yunfei = $dsql->SetQuery("SELECT `yunfei` FROM `#@__infolist` WHERE `id` = {$results['prod']}");
            $yunfei = $dsql->dsqlOper($yunfei, "results");
            $orderDetail["yunfei"]        = $yunfei[0]["yunfei"];


            //未付款的提供付款链接
            if($results['orderstate'] == 0){
                $RenrenCrypt = new RenrenCrypt();
                $encodeid = base64_encode($RenrenCrypt->php_encrypt($results["ordernum"]));

                $param = array(
                    "service"     => "info",
                    "template"    => "pay",
                    "param"       => "ordernum=".$encodeid
                );
                $payurl = getUrlPath($param);

                $orderDetail["payurl"] = $payurl;
            }


            //支付方式
            $paySql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$results["paytype"]."'");
            $payResult = $dsql->dsqlOper($paySql, "results");
            if(!empty($payResult)){
                $orderDetail["paytype"]   = $payResult[0]["pay_name"];
            }else{
                global $cfg_pointName;
                $payname = "";
                if($results["paytype"] == "point,money"){
                    $payname = $cfg_pointName."+" . $langData['siteConfig'][19][363]; //余额
                }elseif($results["paytype"] == "point"){
                    $payname = $cfg_pointName;
                }elseif($results["paytype"] == "余额"){
                    $payname = $langData['siteConfig'][19][363]; //余额
                }
                $orderDetail["paytype"]   = $payname;
            }

            $orderDetail["paydate"]   = $results["paydate"];

            //快递公司&单号
            $orderDetail["expCompany"] = $results["exp-company"];
            $orderDetail["expNumber"]  = $results["exp-number"];
            $orderDetail["expDate"]    = $results["exp-date"];

            //卖家回复
            $orderDetail["retSnote"]    = $results["ret-s-note"];
            $imglist = array();
            $pics = $results['ret-s-pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['val'] = $value;
                    $imglist[$key]['path'] = getFilePath($value);
                }
            }

            $orderDetail["retSpics"]    = $imglist;
            $orderDetail["retSdate"]    = $results["ret-s-date"];


            //退款状态
            $orderDetail["retState"]    = $results["ret-state"];

            //退款原因
            $orderDetail["retType"]    = $results["ret-type"];
            $orderDetail["retNote"]    = $results["ret-note"];

            $imglist = array();
            $pics = $results['ret-pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['val'] = $value;
                    $imglist[$key]['path'] = getFilePath($value);
                }
            }

            $orderDetail["retPics"]    = $imglist;
            $orderDetail["retDate"]    = $results["ret-date"];

            //退款确定时间
            $orderDetail["retOkdate"]    = $results["ret-ok-date"];
            $orderDetail['now'] = GetMkTime(time());


            //商品列表
            $totalPoint = 0;
            $totalBalance = 0;
            $totalPayPrice = 0;
            $totalYunfei = 0;

            $sql = $dsql->SetQuery("SELECT * FROM `#@__infolist` WHERE `id` = ".$results['prod']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $p = 0;
                $proDetail = array();
                foreach ($ret as $key => $value) {

                    //查询商品详细信息
                    global $oper;
                    $oper = "user";
                    $this->param = $value['id'];
                    $detailConfig = $this->detail();

                    $proDetail[$p]['id']        = $detailConfig['id'];
                    $proDetail[$p]['title']     = $detailConfig['title'];
                    $proDetail[$p]['litpic']    = $detailConfig['imglist'];
                    $proDetail[$p]['speid']     = $value['speid'];
                    $proDetail[$p]['specation'] = $value['specation'];
                    $proDetail[$p]['price']     = $value['price'];
                    $proDetail[$p]['count']     = 1;
                    $proDetail[$p]['yunfei']  = $value['yunfei'];
                    $proDetail[$p]['discount']  = 0;
                    $proDetail[$p]['point']     = $results['point'];
                    $proDetail[$p]['balance']   = $results['balance'];


                    //评价
                    if($results['orderstate'] == 3){

                        $sql = $dsql->SetQuery("SELECT `rating`, `score1`, `score2`, `score3`, `pics`, `content`, `ischeck` FROM `#@__shop_common` WHERE `aid` = ".$id." AND `speid` = '".$value['speid']."' AND `pid` = ".$value['proid']);
                        $ret = $dsql->dsqlOper($sql, "results");
                        $common = array();
                        if($ret){
                            if(!empty($ret[0]['pics'])){
                                $picArr = array();
                                $pics = explode(",", $ret[0]['pics']);
                                foreach ($pics as $k => $v) {
                                    array_push($picArr, array(
                                        "source" => $v,
                                        "url"    => getFilePath($v)
                                    ));
                                }
                                $ret[0]['pics'] = $picArr;
                            }
                            $common = $ret[0];
                        }
                        $proDetail[$p]['common'] = $common;

                    }


                    //如果是未支付的，不计算积分和余额
                    $payprice = $results['orderstate'] == 0 ? $value['price'] + $value['logistic']  : $results['payprice'];
                    $proDetail[$p]['payprice']  = sprintf("%.2f", $payprice);
                    $p++;

                    $totalPoint    += $value['point'];
                    $totalBalance  += $value['balance'];
                    $totalPayPrice += $payprice;

                }
            }

            $orderDetail['product'] = $proDetail;
            $orderDetail['totalBalance'] = sprintf("%.2f", $totalBalance);
            $orderDetail['totalPayPrice'] = sprintf("%.2f", $totalPayPrice);
            $orderDetail['totalPrice'] = sprintf("%.2f", ($totalYunfei + $results['price']));

        }

        return $orderDetail;
    }


    /**
     * 删除订单
     * @return array
     */
    public function delOrder(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => $langData['info'][1][58]);

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__info_order` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['userid'] == $uid){

                if($results['orderstate'] == 0){
                    $archives = $dsql->SetQuery("DELETE FROM `#@__info_order` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");

                    $archives = $dsql->SetQuery("UPDATE `#@__infolist` SET  `is_valid` = 0 WHERE `id` = ".$results['prod']);
                    $dsql->dsqlOper($archives, "update");

                    return $langData['siteConfig'][20][444];  //删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['shop'][4][38]);  //订单为不可删除状态！
                }

            }else{
                return array("state" => 101, "info" => $langData['shop'][4][39]);  //权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['shop'][4][40]);  //订单不存在，或已经删除！
        }

    }


    /**
     * 商家发货
     */
    public function delivery(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id      = $this->param['id']; // 订单id
        $company = $this->param['company'];
        $number  = $this->param['number'];

        if(empty($id) || empty($company) || empty($number)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        //验证订单
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum` FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON o.`store` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id` WHERE o.`id` = '$id' AND m.`id` = '$uid' AND o.`orderstate` = 1");
        }else{
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum` FROM `#@__info_order` o WHERE o.`id` = '$id' AND o.`orderstate` = 1");
        }

        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $userid = $results[0]['userid'];
            $ordernum = $results[0]['ordernum'];

            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "info",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "order" => $ordernum,
                "expCompany" => $company,
                "exp_company" => $company,
                "expnumber" => $number,
                "exp_number" => $number,
                "fields" => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '快递公司',
                    'keyword3' => '快递单号'
                )
            );

            updateMemberNotice($userid, "会员-订单发货通知", $paramBusi, $config,'','',0,1);


            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 3, `exp-company` = '$company', `exp-number` = '$number', `exp-date` = '$now' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");
            return $langData['siteConfig'][20][244];  //操作成功

        }else{
            return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
        }

    }


    /**
     * 商家退款
     */
    public function refundPay(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if(empty($id)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        //验证订单
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`store`,o.`paytype`,o.`refrundno`, s.`uid`  FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON o.`store` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id` WHERE o.`id` = '$id' AND m.`id` = '$uid' AND o.`orderstate` = 3 AND o.`ret-state` = 1");
        }else{
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`store`,o.`paytype`,o.`refrundno`, o.`prod`  FROM `#@__info_order` o WHERE o.`id` = '$id' AND o.`orderstate` = 3 AND o.`ret-state` = 1");
        }

        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $orderid    = $results[0]['id'];         //需要退回的订单ID
            $ordernum   = $results[0]['ordernum'];   //需要退回的订单号
            $userid     = $results[0]['userid'];     //需要退回的会员ID
            $paytype    = $results[0]["paytype"];
            $refrundno  = $results[0]["refrundno"];
            $now = GetMkTime(time());
            if(!empty($results[0]['store'])){
                $uid        = $results[0]['uid'];        //商家会员ID
            }else{
                $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__infolist` WHERE `id` = ".$results[0]['prod']);
                $res = $dsql->dsqlOper($sql, "results");
                $uid = $res[0]['userid'];        //商家会员ID
            }
            $totalMoney = 0;
            $totalPoint = 0;

            $sql = $dsql->SetQuery("SELECT `point`, `balance`, `payprice` FROM `#@__info_order` WHERE `id` = '$orderid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $balance    = $ret[0]['balance'];
                $payprice   = sprintf('%.2f',$ret[0]['payprice']);
                $totalMoney = $ret[0]['balance'] + $ret[0]['payprice'];
                $totalPoint = $ret[0]['point'];
            }
            $online_amount = $refrund_online = $totalMoney;

            $peerpay = 0;
            $arr = refund('info',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);      //退款
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'];
            $refrundno   = $arr[0]['refrundno'];
            $refrundcode = $arr[0]['refrundcode'];

            if($r) {
                //退回积分
                if(!empty($totalPoint)){
                    global  $userLogin;
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$totalPoint' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$totalPoint);
                    //保存操作日志
                    $info = '二手订单退回(积分退款:'.$totalPoint.',现金退款：'.$payprice.',余额退款：'.$balance.')：' . $ordernum;  //商城订单退回
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$totalPoint', '$info', '$now','tuihui','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }

                $pay_name = '';
                $pay_namearr = array();

                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "info",
                    "id"       => $id
                );
                $urlParam = serialize($paramUser);

                $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
                $ret = $dsql->dsqlOper($sql, "results");
                if(!empty($ret)){
                    $pay_name    = $ret[0]['pay_name'];
                }else{
                    $pay_name    = $ret[0]["paytype"];
                }

                if($pay_name){
                    array_push($pay_namearr,$pay_name);
                }

                if($balance != ''){
                    array_push($pay_namearr,"余额");
                }

                if($totalPoint != ''){
                   array_push($pay_namearr,"积分");
                }

                if($pay_namearr){
                  $pay_name = join(',',$pay_namearr);
                }

                $tuikuan= array(
                    'paytype'               => $pay_name,
                    'truemoneysy'           => $payprice,
                    'money_amount'          => $balance,
                    'point'                 => $totalPoint,
                    'refrunddate'           => $refrunddate,
                    'refrundno'             => $refrundno
                );
                $tuikuanparam = serialize($tuikuan);
                //退回余额
                if($balance > 0){
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$balance' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
                    //保存操作日志
                    $info = '二手订单退回(积分退款:'.$totalPoint.',现金退款：'.$payprice.',余额退款：'.$balance.')：' . $ordernum;  //商城订单退回
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$balance', '$info', '$now','info','tuikuan','$urlParam','$ordernum','$tuikuanparam','二手信息消费','$usermoney')");
                    $dsql->dsqlOper($archives, "update");


                }
                $orderOpera = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 7, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = ".GetMkTime(time()).",`refrunddate` = '".$refrunddate."',`refrundamount` = '$totalMoney', `refrundno` = '$refrundno' WHERE `id` = ". $id);
                $dsql->dsqlOper($orderOpera, "update");
                //减去冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalMoney' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");

                //如果冻结金额小于0，重置冻结金额为0
                $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                $ret = $dsql->dsqlOper($archives, "results");
                if($ret){
                    if($ret[0]['freeze'] < 0){
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                    }
                }

                $paramBusi = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "info",
                    "id"       => $id
                );

                //获取会员名
                $username = "";
                $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                //自定义配置
                $config = array(
                    "username" => $username,
                    "order" => $ordernum,
                    "amount" => $totalMoney,
                    "fields" => array(
                        'keyword1' => '退款状态',
                        'keyword2' => '退款金额',
                        'keyword3' => '审核说明'
                    )
                );

                updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, $config,'','',0,1);


                return $langData['siteConfig'][9][34];  //退款成功
            }else{
               return array("state" => 200, "info" => "退款失败，错误码：".$refrundcode);
            }

        }else{
            return array("state" => 200, "info" => $langData['siteConfig'][0][23]);  //操作失败，请核实订单状态后再操作！
        }

    }


    /**
     * 商家退款回复
     */
    public function refundReply(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id      = $this->param['id'];
        $pics    = $this->param['pics'];
        $content = $this->param['content'];

        if(empty($id)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！
        if(empty($content)) return array("state" => 200, "info" => $langData['shop'][4][26]);  //请输入回复内容！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $content = filterSensitiveWords(addslashes($content));
        $content = cn_substrR($content, 500);

        //验证订单
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`prod` FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON o.`store` = s.`id` LEFT JOIN `#@__member` m ON s.`uid` = m.`id` WHERE o.`id` = '$id' AND m.`id` = '$uid' AND o.`orderstate` = 6 AND o.`ret-state` = 1");
        }else{
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`prod` FROM `#@__info_order` o WHERE o.`id` = '$id' AND o.`orderstate` = 6 AND o.`ret-state` = 1");
        }
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $userid = $results[0]['userid'];
            $ordernum = $results[0]['ordernum'];
            $prod = $results[0]['prod'];

            // 查询订单商品
            $orderprice = 0;
            $arc = $dsql->SetQuery("SELECT `yunfei`, `price` FROM `#@__infolist` WHERE `id` = ".$prod);
            $proList = $dsql->dsqlOper($arc, "results");
            if($proList){
                foreach ($proList as $key => $value) {
                    $orderprice = $value['price'] + $value['yunfei'];
                }
            }

            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "info",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "order" => $ordernum,
                "amount" => $orderprice,
                "info" => $content,
                "fields" => array(
                    'keyword1' => '退款状态',
                    'keyword2' => '退款金额',
                    'keyword3' => '审核说明'
                )
            );

            updateMemberNotice($userid, "会员-退款申请卖家回复", $paramBusi, $config,'','',0,1);

            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `ret-s-note` = '$content', `ret-s-pics` = '$pics', `ret-s-date` = '$now' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");

            return $langData['siteConfig'][21][147];  //回复成功！

        }else{
            return array("state" => 200, "info" => $langData['shop'][4][27]);  //回复失败，请核实订单状态后再操作！
        }
    }


    /**
     * 买家申请退款
     */
    public function refund(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id      = $this->param['id'];
        $type    = $this->param['type'];
        $pics    = $this->param['pics'];
        $content = $this->param['content'];

        if(empty($id)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！
        if(empty($type)) return array("state" => 200, "info" => $langData['shop'][4][21]);  //请选择退款原因！
        if(empty($content)) return array("state" => 200, "info" => $langData['shop'][4][22]);  //请输入退款说明！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $type    = filterSensitiveWords(addslashes($type));
        $content = filterSensitiveWords(addslashes($content));
        $type    = cn_substrR($type, 20);
        $content = cn_substrR($content, 500);

        //验证订单
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`prod`, o.`store`, s.`uid` FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON s.`id` = o.`store` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 1 OR o.`orderstate` = 3 OR (o.`orderstate` = 2 AND o.`paydate` != 0)) AND o.`ret-state` = 0");
        }else{
            $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`prod`, o.`store` FROM `#@__info_order` o  WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 1 OR o.`orderstate` = 3 OR (o.`orderstate` = 2 AND o.`paydate` != 0)) AND o.`ret-state` = 0");
        }

        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            if(!empty($results[0]['store'])){
                $userid = $results[0]['uid'];  //卖家会员ID
            }else{
                $sql    = $dsql->SetQuery("SELECT `userid` FROM `#@__infolist` WHERE `id` = ".$results[0]['prod']);
                $res    = $dsql->dsqlOper($sql, "results");
                $userid = $res[0]['userid'];   //卖家会员ID
            }

            $ordernum = $results[0]['ordernum'];  //订单号
            $prod = $results[0]['prod'];  //订单号

            // 查询订单商品
            $orderprice = 0;
            $arc = $dsql->SetQuery("SELECT `yunfei`, `price` FROM `#@__infolist` WHERE `id` = ".$prod);
            $proList = $dsql->dsqlOper($arc, "results");
            if($proList){
                foreach ($proList as $key => $value) {
                    $orderprice += $value['price'] + $value['yunfei'];
                }
            }

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "info",
                "id"       => $id
            );
            if(!empty($results[0]['store'])){
                $paramBusi['type'] = 'user';
                $paramBusi['param'] = 'type=out';
            }

            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "order" => $ordernum,
                "amount" => $orderprice,
                "info" => $content,
                "fields" => array(
                    'keyword1' => '退款原因',
                    'keyword2' => '退款金额'
                )
            );

            updateMemberNotice($userid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);


            $date       = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = 3, `ret-state` = 1, `ret-type` = '$type', `ret-note` = '$content', `ret-pics` = '$pics', `ret-date` = '$date' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");

            return $langData['siteConfig'][20][244];  //操作成功

        }else{
            return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
        }
    }


    /**
     * 买家确认收货
     */
    public function receipt(){
        return array("state" => 200, "info" => '功能已停用');

        // echo '123';die;
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $id = $this->param['id'];

        if(empty($id)) return array("state" => 200, "info" => $langData['shop'][4][24]);  //操作失败，参数传递错误！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        //验证订单
        $sql = $dsql->SetQuery("SELECT o.`store` FROM `#@__info_order` o WHERE o.`id` = ".$id);
        $storeinfo = $dsql->dsqlOper($sql, "results");
        if(!empty($storeinfo[0]['store'])){
            $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`userid`, o.`store`, o.`prod`, s.`uid` uid FROM `#@__info_order` o LEFT JOIN `#@__infoshop` s ON s.`id` = o.`store` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND o.`orderstate` = 3");
        }else{
            $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`userid`, o.`store`, o.`prod` FROM `#@__info_order` o WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND o.`orderstate` = 3");
        }

        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            //更新订单状态
            $sql = $dsql->SetQuery("UPDATE `#@__info_order` SET `orderstate` = '4' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");


            //将订单费用转至商家账户
            $ordernum = $results[0]['ordernum'];
            $userid   = $results[0]['userid'];
            if(!empty($results[0]['store'])){
                $uid      = $results[0]['uid'];
                $citysql =$dsql->SetQuery("SELECT `cityid` FROM  `#@__infoshop` WHERE `id` = ".$results[0]['store']);
                $cityres = $dsql->dsqlOper($citysql, "results");
                $cityid = $cityres[0]['cityid'];
            }else{
                $sql = $dsql->SetQuery("SELECT `userid`,`cityid` FROM `#@__infolist` WHERE `id` = ".$results[0]['prod']);
                $res = $dsql->dsqlOper($sql, "results");
                $uid = $res[0]['userid'];        //商家会员ID
                $cityid = $res[0]['cityid'];
            }
            $cityName = getSiteCityName($cityid);
            $totalMoney = 0;
            $freezeMoney = 0;

            //获取transaction_id
            $transaction_id = $paytype = '';
            $sql = $dsql->SetQuery("SELECT `transaction_id`, `paytype`,`amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            $truepayprice = 0;
            if($ret){
                $transaction_id = $ret[0]['transaction_id'];
                $paytype        = $ret[0]['paytype'];
                $truepayprice   = $ret[0]['amount'];
            }

            //计算费用
            $title = "";
            $sql = $dsql->SetQuery("SELECT `price`, `point`, `balance`, `prod`, `payprice` FROM `#@__info_order` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");

            if($ret){
                $sql2 = $dsql->SetQuery("SELECT `title`, `yunfei` FROM `#@__infolist` WHERE `id` = ". $ret[0]['prod']);
                $ret2 = $dsql->dsqlOper($sql2, "results");
                if($ret2){
                    $title = $ret2[0]['title'];
                    $yunfei = $ret2[0]['yunfei'];
                }
                // $totalMoney = $ret[0]['price']  + $yunfei;
                $totalMoney = $ret[0]['price']; //swa190326
                $freezeMoney = $ret[0]['balance'] + $ret[0]['payprice'];
            }

            if($totalMoney > 0){

                //扣除佣金
                global $cfg_shopFee;
                global $cfg_fzshopFee;
                $cfg_shopFee = (float)$cfg_shopFee;
                $cfg_fzshopFee = (float)$cfg_fzshopFee;

                $fee = $totalMoney * $cfg_shopFee / 100;
                $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
                $fee = $fee < 0.01 ? 0 : $fee;

                $totalMoney_ = sprintf('%.2f', $totalMoney - $fee);

                //分销信息
                global $cfg_fenxiaoState;
                global $cfg_fenxiaoSource;
                global $cfg_fenxiaoDeposit;
                global $cfg_fenxiaoAmount;
                include HUONIAOINC."/config/info.inc.php";
                $fenXiao = (int)$customfenXiao;

                //分销金额
                $_fenxiaoAmount = $totalMoney;
                if($cfg_fenxiaoState && $fenXiao){

                    //商家承担
                    if($cfg_fenxiaoSource){
                        $_fenxiaoAmount = $totalMoney_;
                        $totalMoney_ = $totalMoney_ - ($totalMoney_ * $cfg_fenxiaoAmount / 100);

                    //平台承担
                    }else{
                        $_fenxiaoAmount = $fee;
                    }
                }

                $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                //分佣 开关
                $paramarr['amount'] = $_fenxiaoAmount;
                if($fenXiao ==1){
                    (new member())->returnFxMoney("info", $userid , $ordernum,$paramarr);
                    //查询一共分销了多少佣金
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$ordernum' AND `module`= 'info'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    if($cfg_fenxiaoSource){
                        $fx_less = ($_fenxiaoAmount - $totalMoney_)  - $fenxiaomonyeres[0]['allfenxiao']; //分销没分完的钱
                        //没沉淀，还给商家
                        if(!$cfg_fenxiaoDeposit){
                            $totalMoney_     += $fx_less;
                        }else{
                            $precipitateMoney = $fx_less;
                            if($precipitateMoney > 0){
                                (new member())->recodePrecipitationMoney($uid,$ordernum,$ordernum,$precipitateMoney,$cityid,"info");
                            }
                        }
                    }
                }
                $totalMoney_ = $totalMoney_ < 0.01 ? 0 : $totalMoney_;


                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalMoney_' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                //分站佣金
                $fzFee = cityCommission($cityid,'shop');
                //分站佣金
                $fztotalAmount_ =  $fee * (float)$fzFee / 100 ;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                $fee-=$fztotalAmount_;//总站金额-=分站金额
                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                //保存操作日志
                $now = GetMkTime(time());
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalMoney', '二手信息交易成功：$ordernum', '$now','$cityid','$fztotalAmount_','info','$fee','1','shangpinxiaoshou','$usermoney')");
//                $dsql->dsqlOper($archives, "update");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);
                //商家会员消息通知
                // $paramBusi = array(
                //     "service"  => "member",
                //     "template" => "orderdetail",
                //     "action"   => "info",
                //     "id"       => $id
                // );
                // $urlParam = serialize($paramBusi);
                // $title = '二手信息收入';
                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`) VALUES ('$uid', '1', '$totalMoney', '信息交易成功：$ordernum', '$now','info','shangpinxiaoshou','$urlParam','$title','$ordernum')");
                // $dsql->dsqlOper($archives, "update");

                //工行E商通银行分账
                if($transaction_id){
                    if($truepayprice <=0){
                        $truepayprice = $totalMoney_;
                    }
                    rfbpShareAllocation(array(
                        "uid"         => $uid,
                        "ordertitle"  => getModuleTitle(array('name' => 'info')) . "订单收入",
                        "ordernum"    => $ordernum,
                        "orderdata"   => array('商品标题' => $title),
                        "totalAmount" => $totalMoney,
                        "amount"      => $truepayprice,
                        "channelPayOrderNo" => $transaction_id,
                        "paytype"     => $paytype
                    ));
                }


                //返积分
                (new member())->returnPoint("info", $userid, $totalMoney, $ordernum,$totalMoney_,$uid);

                //微信通知
                $param = array(
                    'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——info模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );

                $params = array(
                    'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——info模块——平台获得佣金 :'.$fee.' ——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_),
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                //后台微信通知
                updateAdminNotice("info", "detail",$param);
                updateAdminNotice("info", "detail",$params);
            }else{
                rfbpShareAllocation(array(
                    "uid" => $uid,
                    "ordernum" => $ordernum
                ));
            }


            //减去冻结金额
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$freezeMoney' WHERE `id` = '$userid'");
            $dsql->dsqlOper($archives, "update");

            //如果冻结金额小于0，重置冻结金额为0
            $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
            $ret = $dsql->dsqlOper($archives, "results");
            if($ret){
                if($ret[0]['freeze'] < 0){
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                }
            }

            $paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "info",
                "id"       => $id
            );
            $urlParam = serialize($paramUser);

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $ret = $dsql->dsqlOper($sql, "results");
            $pid = '';
            if($ret){
                $pid            = $ret[0]['id'];
            }
            $title = '二手信息收入';
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
            //保存操作日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$totalMoney_', '二手信息交易成功：$ordernum', '$now','info','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$usermoney+$totalMoney_')");
            $dsql->dsqlOper($archives, "update");


            //商家会员消息通知
            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "info",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "title" => $ordernum,
                "amount" => $totalMoney,
                "fields" => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '下单时间',
                    'keyword3' => '订单金额',
                    'keyword4' => '订单状态'
                )
            );

            updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config,'','',0,1);

            return $langData['siteConfig'][20][244];  //操作成功

        }else{
            return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
        }
    }


    /**
     * 关注
     * @return array
     */
    public function follow()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array('state' => 200, 'info' => $langData['info'][2][25]);//'登录超时！'
        }
        $param = $this->param;
        if (!empty($param)) {

            $vid  = $param['vid'];
            $type = $param['type'];
            $temp = $param['temp'];
        } else {
            return array('state' => 200, 'info' => $langData['info'][2][26]);//参数不正确！
        }

        //查询发布视频的用户
        if ($temp == 'video' || $temp == 'video_common') {
            if ($vid) {
                $sql      = $dsql->SetQuery("SELECT `admin` FROM `#@__videolist` WHERE `id` = $vid");
                $ret      = $dsql->dsqlOper($sql, "results");
                $userid_b = $ret[0]['admin'];
            } else {
                $userid_b = $param['userid'];
            }

        } elseif ($temp == 'quanjing') {
            $sql      = $dsql->SetQuery("SELECT `admin` FROM `#@__quanjinglist` WHERE `id` = $vid");
            $ret      = $dsql->dsqlOper($sql, "results");
            $userid_b = $ret[0]['admin'];
        }elseif ($temp == 'info'){
            $userid_b = $vid;
            if($vid == $userid){
                return array('state' => 200, 'info' => $langData['info'][2][27]);//'您不可以关注自己！'
            }
        }

        if ($type) {
            //查看是否已经关注
            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid` = $userid AND `userid_b` = $userid_b AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                return array('state' => 200, 'info' => $langData['info'][2][28]);//'您已关注！'
            }
            $date = time();
            $sql  = $dsql->SetQuery("INSERT INTO `#@__site_followmap` (`userid`, `userid_b`, `temp`, `date`) VALUES ($userid , $userid_b, '$temp', $date)");
            $ret  = $dsql->dsqlOper($sql, "update");
        } else {
            //取关
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_followmap` WHERE `userid` = $userid AND `userid_b` = $userid_b AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "update");
        }
        return array('state' => 100, 'info' => $ret);

    }

    /**
     * 评论列表
     * @return array
     */
    public function shopcommon()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $infoid   = $orderby = $page = $pageSize = $where = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => $langData['info'][1][58]);
        } else {
            $infoid   = $this->param['infoid'];
            $orderby  = $this->param['orderby'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $oby = " ORDER BY `id` DESC";
        if ($orderby == "hot") {
            $oby = " ORDER BY `good` DESC, `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__info_shopcommon` WHERE `pid` = " . $infoid . " AND `ischeck` = 1 AND `floor` = 0" . $oby);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']       = $val['id'];
                $list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid']);
                $list[$key]['content']  = $val['content'];
                $list[$key]['dtime']    = $val['dtime'];
                $list[$key]['ftime']    = floor((GetMkTime(time()) - $val['dtime'] / 86400) % 30) > 30 ? date("Y-m-d", $val['dtime']) : FloorTime(GetMkTime(time()) - $val['dtime']);
                $list[$key]['ip']       = $val['ip'];
                $list[$key]['ipaddr']   = $val['ipaddr'];
                $list[$key]['good']     = $val['good'];
                $list[$key]['bad']      = $val['bad'];

                $userArr               = explode(",", $val['duser']);
                $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

                // $list[$key]['lower'] = $this->shopgetCommonList($val['id']);
                $lower = null;
                $param['fid'] = $val['id'];
                $param['page'] = 1;
                $param['pageSize'] = 100;
                $this->param = $param;
                $child = $this->getCommonList();

                if(!isset($child['state']) || $child['state'] != 200){
                    $lower = $child['list'];
                }

                $list[$key]['lower'] = $lower;
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 商家遍历评论子级
     * @param $fid int 评论ID
     * @return array
     */
    function shopgetCommonList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        // if (empty($fid)) return false;
        $param    = $this->param;
        $fid      = (int)$param['fid'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        $pageSize = empty($pageSize) ? 99999 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if($fid){
            $where = " AND `floor` = '$fid'";
        }

        $where .= " AND `ischeck` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__info_shopcommon` WHERE `floor` = " . $fid . " AND `ischeck` = 1 ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        if ($totalCount > 0) {
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['id']       = $val['id'];
                    $list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid']);
                    $list[$key]['content']  = $val['content'];
                    $list[$key]['dtime']    = $val['dtime'];
                    $list[$key]['ftime']    = floor((GetMkTime(time()) - $val['dtime'] / 86400) % 30) > 30 ? $val['dtime'] : FloorTime(GetMkTime(time()) - $val['dtime']);
                    $list[$key]['ip']       = $val['ip'];
                    $list[$key]['ipaddr']   = $val['ipaddr'];
                    $list[$key]['good']     = $val['good'];
                    $list[$key]['bad']      = $val['bad'];

                    $userArr               = explode(",", $val['duser']);
                    $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

                    // $list[$key]['lower'] = $this->getCommonList($val['id']);
                    $lower = null;
                    $param['fid'] = $val['id'];
                    $param['page'] = 1;
                    $param['pageSize'] = 100;
                    $this->param = $param;
                    $child = $this->shopgetCommonList();
                    if(!isset($child['state']) || $child['state'] != 200){
                        $lower = $child['list'];
                    }

                    $list[$key]['lower'] = $lower;
                }
                // return $list;
                return array("pageInfo" => $pageinfo, "list" => $list);
            }
        }
    }


    /**
     * 商家顶评论
     * @param $id int 评论ID
     * @param string
     **/
    public function shopdingCommon()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];
        if (empty($id)) return $langData['info'][1][74];//"请传递评论ID！"
        $memberID = $userLogin->getMemberID();
        if ($memberID == -1 || empty($memberID)) return $langData['info'][1][75];//请先登录！

        $archives = $dsql->SetQuery("SELECT `duser` FROM `#@__info_shopcommon` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $duser = $results[0]['duser'];

            //如果此会员已经顶过则return
            $userArr = explode(",", $duser);
            if (in_array($userLogin->getMemberID(), $userArr)) return $langData['info'][1][76];//已顶过！

            //附加会员ID
            if (empty($duser)) {
                $nuser = $userLogin->getMemberID();
            } else {
                $nuser = $duser . "," . $userLogin->getMemberID();
            }

            $archives = $dsql->SetQuery("UPDATE `#@__info_shopcommon` SET `good` = `good` + 1 WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__info_shopcommon` SET `duser` = '$nuser' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");
            return $results;

        } else {
            return $langData['info'][1][77];//评论不存在或已删除！
        }
    }


    /**
     * 商家发表评论
     * @return array
     */
    public function shopsendCommon()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        $aid     = $param['aid'];
        $id      = $param['id'];
        $content = addslashes($param['content']);

        if (empty($aid) || empty($content)) {
            return array("state" => 200, "info" => $langData['info'][1][78]);//'必填项不得为空！'
        }

        $content = filterSensitiveWords(cn_substrR($content, 250));

        include HUONIAOINC . "/config/info.inc.php";
        $state = (int)$customCommentCheck;

        $archives = $dsql->SetQuery("INSERT INTO `#@__info_shopcommon` (`pid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`) VALUES ('$aid', '$id', '" . $userLogin->getMemberID() . "', '$content', " . GetMkTime(time()) . ", '" . GetIP() . "', '" . getIpAddr(GetIP()) . "', 0, 0, '$state', '')");
        $lid      = $dsql->dsqlOper($archives, "lastid");
        if ($lid) {
            $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__info_shopcommon` WHERE `id` = " . $lid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $list['id']       = $results[0]['id'];
                $list['userinfo'] = $userLogin->getMemberInfo($results[0]['userid']);
                $list['content']  = $results[0]['content'];
                $list['dtime']    = $results[0]['dtime'];
                $list['ftime']    = GetMkTime(time()) - $results[0]['dtime'] > 30 ? $results[0]['dtime'] : FloorTime(GetMkTime(time()) - $results[0]['dtime']);
                $list['ip']       = $results[0]['ip'];
                $list['ipaddr']   = $results[0]['ipaddr'];
                $list['good']     = $results[0]['good'];
                $list['bad']      = $results[0]['bad'];
                return $list;
            }
        } else {
            return array("state" => 200, "info" => $langData['info'][1][79]);//'评论失败！'
        }

    }

    /**
     * 商家评价详情
     */
    public function shopcommentDetail(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        $param = $this->param;
        $id    = (int)$param['id'];

        $sql = $dsql->SetQuery("SELECT * FROM `#@__info_shopcommon` WHERE `id` = $id AND `isCheck` = 1 ");//print_R($sql);exit;
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $detail = array();
            $zan_has = 0;
            $ret = $ret[0];
            foreach ($ret as $key => $value) {

                //获取父级内容
                if($key == "floor"){
                    if($value){
                        $content  = '';
                        $username = '';
                        $sql = $dsql->SetQuery("SELECT `content`, `userid` FROM `#@__info_shopcommon` WHERE `id` = '$value' AND `isCheck` = 1 ");
                        $par = $dsql->dsqlOper($sql, "results");
                        if($par){
                            $content = $par[0]['content'];

                            $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company` FROM `#@__member` WHERE `id` IN (".$par[0]['userid'].")");
                            $res = $dsql->dsqlOper($sql, "results");
                            if($res[0]['mtype'] == 2){
                                $username = $res[0]['company'] ? $res[0]['company'] : $res[0]['nickname'];
                            }else{
                                $username = $res[0]['nickname'];
                            }
                        }
                        $detail['parcontent'] = $content;
                        $detail['parusername'] = $username;
                    }
                }

                if($key == "duser"){
                    $zan_userArr = array();
                    if($value){
                        $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` IN (".$value.")");
                        $res = $dsql->dsqlOper($sql, "results");
                        if($res){
                            $value_ = explode(",", $value);
                            if($uid != -1 && in_array($uid, $value_)){
                                $zan_has = 1;
                            }
                            foreach ($value_ as $k => $v) {
                                foreach ($res as $s => $sv) {
                                    if($sv['id'] == $v){
                                        if($sv['mtype'] == "2"){
                                            $nickname = $sv['company'] ? $sv['company'] : $sv['nickname'];
                                        }else{
                                            $nickname = $sv['nickname'];
                                        }
                                        $photo = $sv['photo'] ? getFilePath($sv['photo']) : "";
                                        $zan_userArr[] = array(
                                            "id" => $v,
                                            "nickname" => $nickname,
                                            "photo" => $photo
                                        );
                                    }
                                }
                            }
                        }
                    }
                    $detail['zan_userArr'] = $zan_userArr;
                }

                $detail[$key] = $value;
            }

            $detail['zan_has'] = $zan_has;

            if($ret['isanony']){
                $detail['user'] = array(
                    "id" => 0,
                    "nickname" => "匿名用户",
                    "photo" => ""
                );
            }else{
                $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `nickname`, `company`, `photo` FROM `#@__member` WHERE `id` = " . $ret['userid']);
                $res = $dsql->dsqlOper($sql, "results");
                if(!empty($res[0]['id'])){
                    if($res[0]['mtype'] == "2"){
                        $nickname = $res[0]['company'] ? $res[0]['company'] : $res[0]['nickname'];
                    }else{
                        $nickname = $res[0]['nickname'];
                    }
                    $photo = $res[0]['photo'] ? getFilePath($res[0]['photo']) : "";
                    $userinfo= array(
                        "id" => $res[0]['id'],
                        "nickname" => $nickname,
                        "photo" => $photo
                    );
                }
                $detail['user'] = $userinfo;
            }
            return $detail;
        }
    }





    /*
    * 用户激励抢红包
    */
    public  function  robHongBao(){
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        $param = $this->param;
        $desc   = $param['desc'];
        $uid    = $param['uid'];
        $ordernum   = $param['ordernum'];
        $balance  = (float)$param['balance'];
        $proid  =  $param['id'];
        $userid = $userLogin->getMemberID();
        if ($userid == -1 || empty($userid)) return $langData['info'][1][75];//请先登录！
        $des = $dsql->SetQuery("SELECT `desc`,`hongbaoPrice`,`userid`,`hongbaoCount`,`status`,`body` FROM `#@__infolist` WHERE `id` = '$proid'");
        $ret = $dsql->dsqlOper($des, "results");
        $title = $ret[0]['body'];
        $body = cn_substrR(strip_tags($title), 20);
        if ($userid == $ret[0]['userid']) return array("state" => 101,"info" =>'自己不能参与活动!');
        if ($ret[0]['hongbaoCount'] == 0) return array("state" => 101,"info" =>'已抢光!');
        $pro = $dsql->SetQuery("SELECT count(`proid`) proid FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$proid' AND `touid` = '$userid' AND `type` = 2");
        $prosult = $dsql->dsqlOper($pro, "results");
        if ($prosult[0]['proid'] != 0) return array("state" => 101,"info" =>'已抢过!');
        if($ret[0]['status'] == 0){  //随机
            $total = $ret[0]['hongbaoPrice'];           //红包总额
            $num   = $ret[0]['hongbaoCount'];           //红包个数
                $data= 0;
                $min = 0.01;
                $row=0;
                    if($num ==1){
                        $data +=$total;
                    }else{
//                        $max=floor($total/$num*2);
                        $max = ($total - ($num-1)*$min)/($num-1);
                        $row=mt_rand($min*100,$max*100)/100;
                        $data =$row;
                    }


            $total -= $data;                 //抢到手剩余的红包
            $money = sprintf("%.2f",$data);           //抢到的红包
//            $total  = $total  - $money;                     //抢到手剩余的红包
//            $safe  = ($total - $num*$min) / $num;
//            $money = mt_rand($min*100,$safe*100)/100;           //抢到的红包
//            $total  = $total  - $money;                     //抢到手剩余的红包
        }else{          //平均
            $total = $ret[0]['hongbaoPrice'];           //红包总额
            $num   = $ret[0]['hongbaoCount'];           //红包个数
            $money = sprintf("%.2f",$total / $num);
            $total  = sprintf("%.2f",$total  - $money);                     //抢到手剩余的红包
        }
        $time = GetMkTime(time());
        //添加记录
        $archives = $dsql->SetQuery("INSERT INTO `#@__info_hongbao_historyclick` (`uid`, `touid`, `price`, `type`,`proid`) VALUES ('$uid', '$userid', '$money', '2','$proid')");
        $ret = $dsql->dsqlOper($archives, "update");
        if($ret){
            //增加用户余额
            $toprice = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$money' WHERE `id` = '$userid'");
            $dsql->dsqlOper($toprice, "update");
            $pid = 0;
            $archives = $dsql->SetQuery("SELECT `body`,`id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $results = $dsql->dsqlOper($archives, "results");
            if($results) {
                $pid = $results[0]['id'];
            }
            $user  = $userLogin->getMemberInfo($userid);
            $usermoney = $user['money'];
            $info = "抢红包-".$body;
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`balance`) VALUES ('$userid', '1', '$money', '$info', '$time','info','yonghujili','$pid','','抢红包收入','$usermoney')");
            $dsql->dsqlOper($archives, "update");
            //更新红包数量 价格
            $hongbao = $dsql->SetQuery("UPDATE `#@__infolist` SET `hongbaoPrice` = '$total',`hongbaoCount` = `hongbaoCount`-1,`readClick`=`readClick`+1 WHERE `id` = '$proid'");
            $dsql->dsqlOper($hongbao, "update");
            return  array('state'=>100,'info'=>$money);
        }else{
            return array('state'=>101,'info'=>'数据错误!');
        }

    }

    /*
     * 用户激励 分享得红包
     */
    public  function  sharePrice()
    {
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        $param = $this->param;
        $uid = $param['uid'];
        $ordernum = $param['ordernum'];
        $balance = (float)$param['balance'];
        $proid = (float)$param['proid'];
        $userid = $userLogin->getMemberID();
        if ($userid == -1 || empty($userid)) return $langData['info'][1][75];//请先登录！
        $des = $dsql->SetQuery("SELECT `rewardCount`,`userid`,`rewardPrice`,`body` FROM `#@__infolist` WHERE `id` = '$proid'");
        $ret = $dsql->dsqlOper($des, "results");
        $title = $ret[0]['body'];
        $body = cn_substrR(strip_tags($title), 20);
        if ($ret[0]['rewardCount'] == 0) return array("state" => 101, "info" => '已抢完!');
        $pro = $dsql->SetQuery("SELECT count(`proid`) proid,`info`FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$proid' AND `touid` = '$userid' AND `info`= '1'");
        $prosult = $dsql->dsqlOper($pro, "results");
        if (!$ret[0]['rewardCount'] == 0 && $prosult[0]['proid'] == 0) {
            $price = $ret[0]['rewardPrice'];
            $time = GetMkTime(time());
            //添加记录
            $archives = $dsql->SetQuery("INSERT INTO `#@__info_hongbao_historyclick` (`uid`, `touid`, `price`, `type`,`proid`,`info`) VALUES ('$uid', '$userid', '$price', '1','$proid','1')");
            $res = $dsql->dsqlOper($archives, "update");
            if ($res) {
                //增加用户余额
                $toprice = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$price' WHERE `id` = '$userid'");
                $dsql->dsqlOper($toprice, "update");
                $pid = 0;
                $archives = $dsql->SetQuery("SELECT `body`,`id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                $results = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $pid = $results[0]['id'];
                }
                $user = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $info = '分享得红包-自己分享-'.$body;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`balance`) VALUES ('$userid', '1', '$price', '$info', '$time','info','yonghujili','$pid','','分享红包收入','$usermoney')");
                $dsql->dsqlOper($archives, "update");
                //更新红包数量 价格
                $hongbao = $dsql->SetQuery("UPDATE `#@__infolist` SET `rewardCount` = `rewardCount`-1 WHERE `id` = '$proid'");
                $dsql->dsqlOper($hongbao, "update");
                return 'ok';
            } else {
                return array('state' => 101, 'info' => '数据错误');
            }
        }else{
            return  'ok';
        }
    }

    //分享信息
    public  function  shareInfo(){
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        $param = $this->param;
        $proid = (float)$param['id'];
        $toprice = $dsql->SetQuery("UPDATE `#@__infolist` SET `share` = `share` + '1' WHERE `id` = '$proid'");
        $dsql->dsqlOper($toprice, "update");
        return  'ok';
    }

    //信息总量 总浏览量  入驻商家

    public function  infoCount(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        //数据共享
        require(HUONIAOINC."/config/info.inc.php");
        $dataShare = (int)$customDataShare;
        
        $cityWhere = '';
        if(!$dataShare && $siteCityInfo){
            $cityid  = (int)$siteCityInfo['cityid'];
            $cityWhere = " AND `cityid` = " . $cityid;
        }

        //总浏览量
        $hisarchive = $dsql->SetQuery("SELECT sum(`click`)id FROM `#@__infolist` WHERE `del` = 0" . $cityWhere);
        $resulthis = $dsql->dsqlOper($hisarchive, "results");
        //信息总量
        $infoarchive = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__infolist` WHERE `waitpay` = 0  AND `del` = 0" . $cityWhere);
        $resultinfo = $dsql->dsqlOper($infoarchive, "results");
        //入驻商家
        $infostore = $dsql->SetQuery("SELECT count(`id`)id FROM `#@__business_list`  WHERE 1 = 1  AND `state` !=3 AND `state` !=4" . $cityWhere);
        $resultstore = $dsql->dsqlOper($infostore, "results");
        
        $countinfo = array([
            'histroyCount'  =>$resulthis ? $resulthis[0]['id'] : 0,
            'infoCount'     =>$resultinfo ? $resultinfo[0]['id'] : 0,
            'storeCount'     =>$resultstore ? $resultstore[0]['id'] : 0,
        ]);
        return $countinfo;
    }

    //添加数据
//    public function addInfo()
//    {
//        global $dsql;
//        global $userLogin;
//        global $langData;
//        global $siteCityInfo;
//        $param      = $this->param;
//        $typeid     = $param['typeid'];
//        $title      = filterSensitiveWords(addslashes($param['body']));
//        $addr       = (int)$param['addr'];
//        $cityid     = (int)$param['cityid'];
//        $person     = filterSensitiveWords(addslashes($param['username']));
//        $valid      = 1667876972;
//        $video      = $param['video'];
//        $lnglat     = explode(',', $param['lnglat']);
//        $yunfei     = (float)$param['yunfei'];
//        $price_switch = (int)$param['price_switch'];
//        $address    = $param['address'];
//        $listpic    = $param['listpic'];              //主图
//        $click      = $param['click'];
//        $a = $dsql->getTypeList($cityid,'site_area');
//        $arr = array();
//        foreach ($a  as $k=>$v){
//            if(!empty($v['lower'][0]['lower'])){
//                array_push($arr,$v['lower'][0]['lower']);
//            }else{
//                array_push($arr,$v['lower']);
//            }
//
//        }
//        $add = array_rand($arr[0],1);
//        $addrid = $arr[0][$add]['id'];
//
//        //经纬度
//        $city  = $dsql->SetQuery("SELECT `longitude`,`latitude` FROM `#@__site_area` WHERE `id` = '$cityid'");
//        $infocity = $dsql->dsqlOper($city, "results");
//        $lng = (float)$infocity[0]['longitude'];
//        $lat = $infocity[0]['latitude'];
//        $rand =random_int(11111,55555);
//        $randint = 0.0.'.'.$rand;
//        $lng = $lng+$randint;
//        $lat = $lat-$randint;
//
//        $memberinfo = $dsql->SetQuery("SELECT `id`,`phone` FROM `#@__member` WHERE `phoneCheck` = 1 AND `certifyState` = 1 AND `state` = 1 AND `wechat_subscribe` = 1 AND `licenseState` = 1");
//        $infoMember = $dsql->dsqlOper($memberinfo, "results");
//        $member = array_rand($infoMember,1);
//        $userid = $infoMember[$member]['id'];
//        $tel = $infoMember[$member]['phone'];
//
//        //获取分类下相应字段
//        $infoitem = $dsql->SetQuery("SELECT `id`,`options`,`formtype`,`field` FROM `#@__infotypeitem` WHERE `tid` = '$typeid' AND (`formtype` = 'checkbox' OR `formtype` = 'radio' OR `formtype` = 'text' )");
//        $itemResults = $dsql->dsqlOper($infoitem, "results");
//        //获取特色
//        $itemtype = $dsql->SetQuery("SELECT `id` FROM `#@__infoitemtype` WHERE `tid` = '$typeid'");
//        $typeresult = $dsql->dsqlOper($itemtype, "results");
//        $tese = '';
//        if ($typeresult){
//            $tese = array_rand($typeresult,1);
//            $tese = $typeresult[$tese]['id'];
//        }
//
//
//        $teladdr = getTelAddr($tel);
//        $ip = GetIP();
//        $ipAddr = getIpAddr($ip);
//        if(empty($click)) $click = mt_rand(50, 200);
//        $picCount = 0;
//        $typeid_ = $typeid;
//        $count = 0;
//        if($typeid == 37 || $typeid == 38 || $typeid == 39){
//            $picCount = 74;
//            $count = 100;
//            $typeid_ = 4;
//        }
//        if($typeid == 40 || $typeid == 41 || $typeid == 42 || $typeid == 43|| $typeid == 44|| $typeid == 45|| $typeid == 46){
//            $picCount = 9;
//            $count = 20;
//            $typeid_ = 5;
//        }
//
//        if($typeid == 55 || $typeid == 56 || $typeid == 57 || $typeid == 58|| $typeid == 59|| $typeid == 60|| $typeid == 61){
//            $picCount = 3;
//            $count = 10;
//            $typeid_ = 7;
//        }
//        if($typeid == 75 || $typeid == 76 || $typeid == 77 || $typeid == 78|| $typeid == 79|| $typeid == 780|| $typeid == 81|| $typeid == 82){
//            $picCount = 59;
//            $count = 100;
//            $typeid_ = 11;
//        }
//        if($typeid == 83 || $typeid == 84 || $typeid == 85 || $typeid == 86|| $typeid == 87|| $typeid == 88|| $typeid == 89|| $typeid == 90){
//            $picCount = 34;
//            $count = 50;
//            $typeid_ = 12;
//        }
//        if($typeid == 91 || $typeid == 92 || $typeid == 93 || $typeid == 94){
//            $picCount = 32;
//            $count = 60;
//            $typeid_ = 13;
//        }
//        if($typeid == 15){
//            $picCount = 25;
//            $count = 35;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 16){
//            $picCount = 25;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 18){
//            $picCount = 25;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 19){
//            $picCount = 35;
//            $count = 40;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 20){
//            $picCount = 16;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 21){
//            $picCount = 25;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 22){
//            $picCount = 20;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 23){
//            $picCount = 20;
//            $count = 25;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 24){
//            $picCount = 25;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 25){
//            $picCount = 20;
//            $count = 25;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 26){
//            $picCount = 24;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 27){
//            $picCount = 24;
//            $count = 30;
//            $typeid_ = 26;
//        }
//        if($typeid == 28){
//            $picCount = 6;
//            $count = 10;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 47){
//            $picCount = 9;
//            $count = 15;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 48){
//            $picCount = 9;
//            $count = 13;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 49){
//            $picCount = 16;
//            $count = 20;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 50){
//            $picCount = 8;
//            $count = 10;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 51){
//            $picCount = 9;
//            $count = 10;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 52){
//            $picCount = 26;
//            $count = 30;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 53){
//            $picCount = 19;
//            $count = 25;
//            $typeid_ = $typeid;
//        }
//        if($typeid == 54){
//            $picCount = 8;
//            $count = 15;
//            $typeid_ = $typeid;
//        }
//        $randinfo = range(1,$count);
//        shuffle($randinfo);
//        $num=rand(1,5) ;
//        $randinfo = array_slice($randinfo,0,$num);
//        $picPath = array();
//        foreach ($randinfo as $and){
//            if ($and < $picCount){
//                $picPath[]= "/info/demo/".$typeid_."/".$and.".png";
//            }
//        }
//            //保存到主表
//        $archives = $dsql->SetQuery("INSERT INTO `#@__infolist` (`cityid`, `typeid`, `title`, `valid`, `addr`, `price`, `body`, `person`, `areaCode`, `tel`, `teladdr`, `qq`, `ip`, `ipaddr`, `pubdate`, `userid`, `arcrank`, `waitpay`, `alonepay`, `weight`,`video`, `yunfei`, `price_switch`, `longitude`, `latitude`,`label`,`address`,`listpic`,`click`) VALUES ('$cityid', '$typeid', '$title', '$valid', '$addrid', '$price', '$title', '$person', '$areaCode', '$tel', '$teladdr', '$qq', '$ip', '$ipAddr', " . GetMkTime(time()) . ", '$userid', '1', '0', '$alonepay', 1,'$video', $yunfei, '$price_switch', '$lng', '$lat','$tese','$address','$listpic','$click')");
//        $aid = $dsql->dsqlOper($archives, "lastid");
//        if (is_numeric($aid)) {
//                foreach ($itemResults as $kk=>$vv){
//                    if ($vv['formtype'] == "checkbox" || $vv['formtype'] == "radio") {
//                        $option  = preg_split("[\r\n]", $vv['options']);
//                        $option1 = array_rand($option,1);
//                        $options = $option[$option1];
//                    }elseif($vv['formtype'] == "text"){
////                    $options = $_GET['user_' . $vv['id']];
//                        $options = $param[$vv['field']];
//                        $options = filterSensitiveWords($options);
//                    }else{
//                        $options =preg_split("[\r\n]", $vv['options']);
//                        $options = $options[0];
//                    }
//
//                $infoitem = $dsql->SetQuery("INSERT INTO `#@__infoitem` (`aid`, `iid`, `value`) VALUES (" . $aid . ", " . $vv['id']. ", '" . $options . "')");
//                $dsql->dsqlOper($infoitem, "results");
//            }
//                if (!empty($picPath)){
//                    //保存图集表
//                    foreach ($picPath as $k => $v) {
//                        $picInfo = explode("|", $v);
//                        $pics = $dsql->SetQuery("INSERT INTO `#@__infopic` (`aid`, `picPath`, `picInfo`) VALUES (" . $aid . ", '" . $v . "', '')");
//                        $dsql->dsqlOper($pics, "update");
//                    }
//                }
//
//        }
//
//        return  'ok';
//
//
//    }

//    添加评论

//    public  function  addCommon(){
//        global $dsql;
//        global $userLogin;
//        global $langData;
//        global $siteCityInfo;
//        $param = $this->param;
//        $content = filterSensitiveWords(addslashes($param['content']));
//        $ip     = GetIP();
//        $ipaddr = getIpAddr($ip);
//
//        //信息id
//        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__infolist` WHERE 1 = 1  ORDER BY `id` ASC");
//        $results = $dsql->dsqlOper($archives, "results");
//        foreach ($results as $k=>$v) {
//                //评论内容
//                $comarchives = $dsql->SetQuery("SELECT `content` FROM `#@__info_common` WHERE 1 = 1");
//                $comresults = $dsql->dsqlOper($comarchives, "results");
//                shuffle($comresults);
//                $num=rand(1,5) ;
//                $randinfo = array();
//                $randinfo []= array_slice($comresults,0,$num);
//                $randinfo = $randinfo[0];
//                if (count($randinfo) > 0 && !empty($randinfo)){
//                    foreach ($randinfo as $k=>$v1) {
//                        $dtime = GetMkTime(time());
//                        //发布人id
//                        $memberinfo = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `phoneCheck` = 1 AND `certifyState` = 1 AND `state` = 1");
//                        $infoMember = $dsql->dsqlOper($memberinfo, "results");
//                        $member = array_rand($infoMember,1);
//                        $userid = $infoMember[$member]['id'];
//                        $aid = $v['id'];
//                        $content = $v1['content'];
//                        $sql = $dsql->SetQuery("INSERT INTO `#@__public_comment` (`pid`, `type`, `aid`, `oid`, `userid`, `rating`, `sco1`, `content`, `pics`, `audio`, `video`, `dtime`, `ip`, `ipaddr`, `ischeck`, `zan`, `zan_user`, `sco2`, `sco3`, `speid`, `specation`, `masterid`) VALUES ('0', 'info-detail', '$aid', '0', '$userid', '0', '0', '$content', '0', '0', '0', '$dtime', '$ip', '$ipaddr', '1', '0', '', '0', '0', '0', '0', '$userid')");
//                        $comresults = $dsql->dsqlOper($sql, "results");
//                    }
//                }
//        }
////        $ltype = array();
////        foreach ($results as $k=>$v){
////
////            array_push($ltype,$v['id']);
////        }
////        $ltype = array_rand($ltype,1);
////        $aid = $results[$ltype]['id'];
//
//
//        if ($comresults){
//            return 'ok';
//        }
//
//    }

//    public  function  getCommon(){
//        global $dsql;
////        $file = file_get_contents('https://www.meituan.com/meishi/api/poi/getMerchantComment?uuid=d1ed14c3c04140fc82da.1637919847.1.0.0&platform=1&partner=126&originUrl=https%3A%2F%2Fwww.meituan.com%2Fmeishi%2F98468263%2F&riskLevel=1&optimusCode=10&id=98468263&userId=1894687705&offset=10&pageSize=50&sortType=1');
////        $json = json_decode($file,true);
////        $jsonarr = $json['data']['comments'];
////            foreach ($jsonarr as $k=>$v){
////                $content = $v['comment'];
////                var_dump($content);
////                if (!empty($content)){
////                $sql = $dsql->SetQuery(" INSERT INTO  `#@__info_common` (`typeid`,`content`) VALUES ('6','$content')");
////                $dsql->dsqlOper($sql, "results");
////
////              }
////            }
////        return  $jsonarr;
////        die;
//       $file = file_get_contents('https://comment.58.com/comment/evaluations?userId=24568880166407&cateId=95&infoId=37808974618642&tag=%E5%85%A8%E9%83%A8&pageNum=3&pageSize=100&sortRule=2&fingerPrint=262709fb8c65c776c8c5b4f751d3e3bb&_=1638155547248');
//       $json = json_decode($file,true);
//        $jsonarr = $json['data']['list'];
//       foreach ($jsonarr as $kk=>$vv){
//           if (!empty($vv['commentContent'])){
//               $content = $vv['commentContent'];
//               $sql = $dsql->SetQuery(" INSERT INTO  `#@__info_common` (`content`) VALUES ('$content')");
//               $dsql->dsqlOper($sql, "results");
//           }
//       }
//       return  'ok';
//
//    }

    /**
     * 更新商品浏览量
     */
    public function updateClick()
    {
        //APP端会请求这个接口，导致浏览量重复增加，暂时注释掉
        // global $dsql;
        // $param = $this->param;
        // $id = (float)$param['id'];
        // $sql = $dsql->SetQuery("UPDATE `#@__infolist` SET `click` = `click` + 1 WHERE `arcrank` = 1 AND `id` = " . $id);
        // $dsql->dsqlOper($sql, "update");
        // return '操作成功!';
    }


        // 整合分类信息 后台分类表

    public  function  updateItem(){
        global  $dsql;

        $archive = $dsql->SetQuery(" SELECT `id` FROM `#@__infotype` WHERE 1 = 1");
        $par = $dsql->dsqlOper($archive,"results");
        foreach ($par as $k=>$v){
        $arch = $dsql->SetQuery(" SELECT `id`,`parentid` FROM `#@__infotype` WHERE `parentid` = '".$v['id']."' ");
        $parent = $dsql->dsqlOper($arch,"results");
        $parentid = join(',',array_column($parent,'id'));
         $updatearch = $dsql->SetQuery(" UPDATE `#@__infotype` SET `parentarr` = '$parentid'  WHERE `id` = '".$v['id']."' ");
        $updateparent = $dsql->dsqlOper($updatearch,"update");
        }
        return 'ok';
    }


    /**
     * 修改状态
    */
    public function updateState(){
        global $dsql;
        //信息ID
        $param = $this->param;
        $id = (int)$param['id'];
        if(empty($id)){
            return array("info"=>"缺少id参数","state"=>200);
        }
        $state = (int)$param['state'];
        if(!in_array($state,array(1,3))){
            return array("info"=>"state参数错误","state"=>200);
        }
        //是否需要审核
        include_once HUONIAOINC . "/config/info.inc.php";
        if($state==1){
            // $state = (int)$customFabuCheck;
        }
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $userInfo = $userLogin->getMemberInfo();
        if($userid<1){
            return array("info"=>"您还未登录。","state"=>200);
        }
        // if(!$userInfo['level']){
        //     return array("info"=>"请升级会员后操作。","state"=>200);
        // }
        //查询信息是否存在
        $sql = $dsql->SetQuery("select `arcrank` from `#@__infolist` where `id`=$id and `userid`=$userid");
        $info = $dsql->getArr($sql);
        if(!is_array($info) || empty($info)){
            return array("info"=>"信息不存在","state"=>200);
        }
        $sql = $dsql->SetQuery("update `#@__infolist` set `arcrank`=$state where `id`=$id");
        $update = $dsql->update($sql);
        if($update=="ok"){
            return $state==3 ? "下架成功" : "更新成功";
        }
        else{
            return array("info"=>"更新失败","state"=>200);
        }
    }


    /**
     * 根据订单号或者信息ID获取信息详情
    */
    public function payreturn(){
        global $dsql;
        global $userLogin;

        //获取用户ID
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $ordernum = $this->param['ordernum'];
        $id = $this->param['id'];

        if(!$ordernum && !$id){
            return array("state" => 200, "info" => '缺少必要参数');
        }

        //有订单号,以订单号为准,获取信息ID
        if($ordernum){
            $sql = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $body = unserialize($ret[0]['body']);
                $type = $body['type'];
                $module = $body['module'];
                $aid = (int)$body['aid'];

                if($type == 'fabu' && $module == 'info' && $aid){
                    $id = $aid;
                }
                else{
                    return array("state" => 200, "info" => '订单信息异常');
                }
            }
            else{
                return array("state" => 200, "info" => '订单不存在');
            }
        }

        //根据信息ID查询详情
        if($id){

            $sql = $dsql->SetQuery("SELECT *  FROM `#@__infolist` WHERE `userid` = $userid AND `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];

                $state = (int)$data['arcrank'];  //信息状态   0待审核  1已审核  2审核失败
                $isbid = (int)$data['isbid'];  //是否已经置顶
                
                require(HUONIAOINC . "/config/info.inc.php");
                $excitation = $custom_excitation ? array_map('intval', explode(',', $custom_excitation)) : array();  //1阅读红包  2分享有奖

                //管理地址链接
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "manage-info",
                    "param" => "currentPageOpen=1",
                );
                $manageUrl = getUrlPath($param);

                //发布地址链接
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "info",
                    "param" => "currentPageOpen=1",
                );
                $fabuUrl = getUrlPath($param);

                //激励地址链接
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "reward_fabu",
                    "param" => "id=" . $id,
                );
                $rewardUrl = getUrlPath($param);

                return array(
                    'state' => $state,
                    'isbid' => $isbid,
                    'excitation' => $excitation,
                    'manageUrl' => $manageUrl,
                    'fabuUrl' => $fabuUrl,
                    'rewardUrl' => $rewardUrl,
                    'aid' => $id,
                );

            }
            else{
                return array("state" => 200, "info" => '信息不存在或已经删除');
            }

        }
        else{
            return array("state" => 200, "info" => '信息ID有误');
        }

    }


    /**
     * 增加电话拨打记录
    */
    public function callLog(){
        global $dsql;
        global $userLogin;
        global $langData;

        $now = GetMkTime(time());
        
        $userid = (int)$userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => self::$langData['siteConfig'][20][262]); //登录超时，请重新登录！
        }
        
        $param = $this->param;
        $aid = (int)$param['aid'];  //要查询的信息
        if (!$aid) {
            return array("state" => 200, "info" => "格式错误");
        }

        //多长时间内重复获取不新增
        $timeFre = 86400;  //同一用户重复查看这条信息24小时不增加次数，单位秒

        $cityid = 0;

        //查询信息的号码
        $sql = $dsql->SetQuery("SELECT `userid` uid, `tel`, `cityid` FROM `#@__infolist` WHERE `id` = $aid");
        $ret = $dsql->getArr($sql);

        if($ret){
            $tel = trim($ret['tel']);  //电话号码
            $uid = (int)$ret['uid'];  //信息所有人的ID
            $cityid = (int)$ret['cityid'];  //信息所在分站

            if(!$tel){
                return array("state" => 200, "info" => "该信息未填写电话号码！");
            }

            //如果是本人查看，直接返回号码
            if($userid == $uid){
                return;
            }

            //查询当前登录人是否获取过该信息
            $already = 0;
            $sql = $dsql->SetQuery("SELECT `pubdate` FROM `#@__info_phone_log` WHERE `fuid` = $userid AND `tuid` = $uid AND `aid` = $aid");
            $ret = (int)$dsql->getOne($sql);
            if($ret){

                //在有效期内，不计算次数
                if($ret - $now < $timeFre){
                    $already = 1;
                }

            }

            if($already){
                return;
            }

            //记录获取日志
            $sql = $dsql->SetQuery("INSERT INTO `#@__info_phone_log` (`cityid`, `fuid`, `tuid`, `phone`, `aid`, `pubdate`) VALUES ('$cityid', '$userid', '$uid', '$tel', '$aid', '$now')");
            $dsql->dsqlOper($sql, "update");

            return '成功';

        }
        else{
            return array("state" => 200, "info" => "要获取的电话号码不存在");
        }

    }
}
