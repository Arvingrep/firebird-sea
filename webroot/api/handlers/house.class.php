<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 房产模块API接口
 *
 * @version        $Id: house.class.php 2014-3-23 上午09:25:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class house
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
     * 房产基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/house.inc.php");

        global $cfg_fileUrl;              //系统附件默认地址
        global $cfg_uploadDir;            //系统附件默认上传目录
        // global $customFtp;                //是否自定义FTP
        // global $custom_ftpState;          //FTP是否开启
        // global $custom_ftpUrl;            //远程附件地址
        // global $custom_ftpDir;            //FTP上传目录
        // global $custom_uploadDir;         //默认上传目录
        global $cfg_basehost;             //系统主域名
        global $cfg_hotline;              //系统默认咨询热线

        // global $custom_la_atlasMax;              //楼盘户型图集数量限制
        // global $custom_ll_atlasMax;              //楼盘房源图集数量限制
        // global $custom_ca_atlasMax;              //小区户型图集数量限制
        // global $custom_houseSale_atlasMax;       //二手房图集数量限制
        // global $custom_houseZu_atlasMax;         //租房图集数量限制
        // global $custom_houseXzl_atlasMax;        //写字楼图集数量限制
        // global $custom_houseSp_atlasMax;         //商铺图集数量限制
        // global $custom_houseCf_atlasMax;         //厂房图集数量限制

        // global $customChannelName;        //模块名称
        // global $customLogo;               //logo使用方式
        global $cfg_weblogo;              //系统默认logo地址
        // global $customLogoUrl;            //logo地址
        // global $customSubDomain;          //访问方式
        // global $customChannelSwitch;      //模块状态
        // global $customCloseCause;         //模块禁用说明
        // global $customSeoTitle;           //seo标题
        // global $customSeoKeyword;         //seo关键字
        // global $customSeoDescription;     //seo描述
        // global $hotline_config;           //咨询热线配置
        // global $customHotline;            //咨询热线
        // global $custom_map;               //自定义地图

        global $cfg_map;                  //系统默认地图
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

        if (empty($custom_map)) $custom_map = $cfg_map;

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

        // $domainInfo = getDomain('house', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('house', $customSubDomain);

        //分站自定义配置
        $ser = 'house';
        global $siteCityAdvancedConfig;
        if ($siteCityAdvancedConfig && $siteCityAdvancedConfig[$ser]) {
            if ($siteCityAdvancedConfig[$ser]['title']) {
                $customSeoTitle = $siteCityAdvancedConfig[$ser]['title'];
            }
            if ($siteCityAdvancedConfig[$ser]['keywords']) {
                $customSeoKeyword = $siteCityAdvancedConfig[$ser]['keywords'];
            }
            if ($siteCityAdvancedConfig[$ser]['description']) {
                $customSeoDescription = $siteCityAdvancedConfig[$ser]['description'];
            }
            if ($siteCityAdvancedConfig[$ser]['logo']) {
                $customLogoUrl = $siteCityAdvancedConfig[$ser]['logo'];
            }
            if ($siteCityAdvancedConfig[$ser]['hotline']) {
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
                } elseif ($param == "la_atlasMax") {
                    $return['la_atlasMax'] = $custom_la_atlasMax;
                } elseif ($param == "ll_atlasMax") {
                    $return['ll_atlasMax'] = $custom_ll_atlasMax;
                } elseif ($param == "ca_atlasMax") {
                    $return['ca_atlasMax'] = $custom_ca_atlasMax;
                } elseif ($param == "houseSale_atlasMax") {
                    $return['houseSale_atlasMax'] = $custom_houseSale_atlasMax;
                } elseif ($param == "houseZu_atlasMax") {
                    $return['houseZu_atlasMax'] = $custom_houseZu_atlasMax;
                } elseif ($param == "houseXzl_atlasMax") {
                    $return['houseXzl_atlasMax'] = $custom_houseXzl_atlasMax;
                } elseif ($param == "houseSp_atlasMax") {
                    $return['houseSp_atlasMax'] = $custom_houseSp_atlasMax;
                } elseif ($param == "houseCf_atlasMax") {
                    $return['houseCf_atlasMax'] = $custom_houseCf_atlasMax;
                } elseif ($param == "map") {
                    $return['map'] = $custom_map;
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
                } elseif ($param == "zjuserPriceCost") {
                    $return['zjuserPriceCost'] = $custom_zjuserPriceCost ? unserialize($custom_zjuserPriceCost) : array();
                    //读取经纪人免费套餐配置
                } elseif ($param == "zjuserPriceFree") {
                    $return['zjuserPriceFree'] = $custom_zjuserPriceFree ? unserialize($custom_zjuserPriceFree) : array();
                }
            }

        } else {

            //自定义LOGO
            if ($customLogo == 1) {
                $customLogo = getAttachemntFile($customLogoUrl);
            } else {
                $customLogo = getAttachemntFile($cfg_weblogo);
            }

            $return['channelName']        = str_replace('$city', $cityName, $customChannelName);
            $return['logoUrl']            = $customLogo;
            $return['subDomain']          = $customSubDomain;
            $return['channelDomain']      = $customChannelDomain;
            $return['channelSwitch']      = $customChannelSwitch;
            $return['closeCause']         = $customCloseCause;
            $return['title']              = str_replace('$city', $cityName, $customSeoTitle);
            $return['keywords']           = str_replace('$city', $cityName, $customSeoKeyword);
            $return['description']        = str_replace('$city', $cityName, $customSeoDescription);
            $return['hotline']            = $hotline;
            $return['la_atlasMax']        = $custom_la_atlasMax;
            $return['ll_atlasMax']        = $custom_ll_atlasMax;
            $return['ca_atlasMax']        = $custom_ca_atlasMax;
            $return['houseSale_atlasMax'] = $custom_houseSale_atlasMax;
            $return['houseZu_atlasMax']   = $custom_houseZu_atlasMax;
            $return['houseXzl_atlasMax']  = $custom_houseXzl_atlasMax;
            $return['houseSp_atlasMax']   = $custom_houseSp_atlasMax;
            $return['houseCf_atlasMax']   = $custom_houseCf_atlasMax;
            $return['map']                = $custom_map;
            $return['template']           = $customTemplate;
            $return['touchTemplate']      = $customTouchTemplate;
            $return['softSize']           = $custom_softSize;
            $return['softType']           = $custom_softType;
            $return['thumbSize']          = $custom_thumbSize;
            $return['thumbType']          = $custom_thumbType;
            $return['atlasSize']          = $custom_atlasSize;
            $return['atlasType']          = $custom_atlasType;
            $return['zjuserPriceCost']    = $custom_zjuserPriceCost ? unserialize($custom_zjuserPriceCost) : array();
            //读取经纪人免费套餐配置
            $return['zjuserPriceFree']    = $custom_zjuserPriceFree ? unserialize($custom_zjuserPriceFree) : array();
        }

        return $return;

    }


    /**
     * 房产地区
     * @return array
     */
    public function addr()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
                $child    = $this->param['child'];
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
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

            if($pageSize){
                $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id` LIMIT " . $pageSize);
            }else{
                $sql = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) AND c.`state` = 1 ORDER BY c.`id`");
            }

            //获取缓存数据
            $_sql = $sql;
            $cacheData = getCacheData($_sql, 'area');
            if($cacheData){
                return $cacheData['data'];
            }

            $result  = $dsql->dsqlOper($sql, "results");
            if ($result) {
                if (!empty($child)) {

                    //隐藏分站重复区域
                    global $cfg_sameAddr_state;
                    $siteCityArr = array();
                    if (!$cfg_sameAddr_state) {
                        $siteConfigService = new siteConfig();
                        $siteCity          = $siteConfigService->siteCity();

                        foreach ($siteCity as $key => $val) {
                            array_push($siteCityArr, $val['cityid']);
                        }
                    }

                    foreach ($result as $key => $value) {

                        $alist = array();
                        $sql   = $dsql->SetQuery("SELECT * FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                        $ret   = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            foreach ($ret as $k_ => $v_) {
                                //隐藏分站重复区域
                                if ($siteCityArr) {
                                    if (!in_array($v_['id'], $siteCityArr)) {
                                        array_push($alist, $v_);
                                    }
                                } else {
                                    array_push($alist, $v_);
                                }
                            }

                        }

                        array_push($cityArr, array(
                            "id"       => $value['cid'],
                            "typename" => $value['typename'],
                            "pinyin"   => $value['pinyin'],
                            "hot"      => $value['hot'],
                            "lower"    => $alist
                        ));

                    }
                } else {
                    foreach ($result as $key => $value) {
                        array_push($cityArr, array(
                            "id"       => $value['cid'],
                            "typename" => $value['typename'],
                            "pinyin"   => $value['pinyin'],
                            "hot"      => $value['hot'],
                            "lower"    => array()
                        ));
                    }
                }
            }

            //数据写入缓存
            setCacheData($_sql, $cityArr, 'area');

            return $cityArr;

        } else {
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if ($results) {
                return $results;
            }
        }
    }

    /**
     * 房产字段
     * @return array
     */
    public function item()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        // $results = $dsql->getTypeList($type, "houseitem", $son, $page, $pageSize);
        $results = getCache("house_item_all", function () use ($dsql, $type, $son, $page, $pageSize) {
            return $dsql->getTypeList($type, "houseitem", $son, $page, $pageSize);
        }, 0, $type);
        if ($results) {
            return $results;
        }
    }


    /**
     * 房产行业
     * @return array
     */
    public function industry()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        // $results = $dsql->getTypeList($type, "house_industry", $son, $page, $pageSize);
        $results = getCache("house_industry", function () use ($dsql, $type, $son, $page, $pageSize) {
            return $dsql->getTypeList($type, "house_industry", $son, $page, $pageSize);
        }, 0, array("sign" => $type . "_" . (int)$son, "savekey" => 1));
        if ($results) {
            return $results;
        }
    }


    /**
     * 求租求购列表
     * @return array
     */
    public function demand()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $typeid   = $addrid = $act = $title = $u = $state = $page = $pageSize = $orderby = $where = $where1 = "";

        $uid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = $this->param['typeid'];
                $addrid   = $this->param['addrid'];
                $act      = $this->param['act'];
                $title    = $this->param['title'];
                $u        = $this->param['u'];
                $memberid = $this->param['uid'];
                $state    = $this->param['state'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $orderby  = $this->param['orderby'];
            }
        }
        //是否输出当前登录会员的信息
        if ($u != 1) {
            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND `cityid` = " . $cityid;
                }
            }

            $where    .= " AND `state` = 1";
            $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
        } else {
            $uid = $userLogin->getMemberID();
            if ($memberid != '') {
                $uid = $memberid;
            }
            $where .= " AND `userid` = " . $uid;

            if ($state != "") {
                $where1 = " AND `state` = " . $state;
            }
            $orderby_ = " ORDER BY `id` DESC";
        }

        //类型
        if ($typeid != "") {
            $where .= " AND `type` = " . $typeid;
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addr` in ($lower)";
        }

        //类别
        if ($act != "") {
            $where .= " AND `action` = " . $act;
        }

        //关键字
        if (!empty($title)) {
            $where .= " AND (`title` like '%" . $title . "%' OR `person` like '%" . $title . "%')";
        }

        //排序
        if ($orderby == "1") {
            $orderby_ = " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC";

            //发布时间
        } elseif ($orderby == "2") {
            $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "`id`, `title`, `note`, `action`, `type`, `addr`, `person`, `areaCode`, `contact`, `pubdate`, `state` " .
            "FROM `#@__housedemand` " .
            "WHERE " .
            "1 = 1" . $where);
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__housedemand` " .
            "WHERE " .
            "1 = 1" . $where);
        $totalCount = getCache("house_demand_total", $arc, 300, array("name" => "total", "savekey" => 1, "dsiabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $userLogin->getMemberID() > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND `state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // var_dump($archives.$where1.$orderby_.$where);die;
        $results = $dsql->dsqlOper($archives . $where1 . $orderby_ . $where, "results");
        $results = getCache("house_demand_list", $archives . $where1 . $orderby_ . $where, 300, array("disabled" => $u));
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']    = $val['id'];
                $list[$key]['title'] = $val['title'];
                $list[$key]['note']  = $val['note'];

                $action = '';
                switch ($val['action']) {
                    case 1:
                        $action = '新房';
                        break;
                    case 2:
                        $action = '二手房';
                        break;
                    case 3:
                        $action = '出租房';
                        break;
                    case 4:
                        $action = '写字楼';
                        break;
                    case 5:
                        $action = '商铺';
                        break;
                    case 6:
                        $action = '厂房/仓库';
                        break;
                    case 7:
                        $action = '车位';
                        break;
                }

                $list[$key]['act']    = $val['action'];
                $list[$key]['action'] = $action;
                $list[$key]['type']   = $val['type'];

                if ($val['addr'] == 0) {
                    $list[$key]['addr'] = array();
                } else {
                    $addrName = getParentArr("site_area", $val['addr']);
                    global $data;
                    $data               = "";
                    $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['addr'] = $addrName;
                }

                $list[$key]['person']   = $val['person'];
                $list[$key]['areaCode'] = $val['areaCode'];
                $list[$key]['contact']  = $uid > 0 ? $val['contact'] : '';
                $list[$key]['showMobile'] = addAreaCodePrefix($val['areaCode'], $uid > 0 ? $val['contact'] : '');
                $list[$key]['state']    = $val['state'];
                $list[$key]['pubdate']  = FloorTime(time() - $val['pubdate']);

                $param             = array(
                    "service"  => "house",
                    "template" => "demand-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 求租、求购信息详细
     * @return array
     */
    public function demandDetail()
    {
        global $dsql;
        global $userLogin;
        $demanDetail = array();
        $id          = $this->param;
        $id          = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__housedemand` WHERE `state` = 1 AND `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_demand_detail", $archives, 0, $id);
        if ($results) {
            global $cfg_clihost;
            $demanDetail["id"]     = $results[0]['id'];
            $demanDetail["title"]  = $results[0]['title'];
            $demanDetail["note"]   = nl2br($results[0]['note']);
            $demanDetail["action"] = $results[0]['action'];
            $demanDetail["type"]   = $results[0]['type'];
            $demanDetail["addrid"] = $results[0]['addr'];

            $addrInfo               = getPublicParentInfo(array(
                'tab'   => 'site_area',
                'id'    => $results[0]['addr'],
                'split' => '/'
            ));
            $demanDetail['addrIds'] = explode('/', $addrInfo);

            $addrInfo                 = getPublicParentInfo(array(
                'tab'   => 'site_area',
                'id'    => $results[0]['addr'],
                'type'  => 'typename',
                'split' => '/'
            ));
            $demanDetail['addrNames'] = $addrInfo;
            $demanDetail['addrName']  = explode('/', $addrInfo);

            $demanDetail["person"]   = $results[0]['person'];
            $demanDetail["areaCode"] = $results[0]['areaCode'];
            $demanDetail["contact"]  = $results[0]['contact'];
            $demanDetail['showMobile'] = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);
            $demanDetail["pubdate"]  = $results[0]['pubdate'];
            $demanDetail["userid"]   = $results[0]['userid'];
            $demanDetail["sex"]      = $results[0]['sex'];

        }
        return $demanDetail;
    }


    /**
     * 房源举报
     * @return array
     */
    public function report()
    {
        global $dsql;
        $param = $this->param;

        if (!is_array($param)) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $action = $param['action'];
        $aid    = $param['aid'];
        $type   = $param['type'];
        $note   = $param['note'];

        if (empty($action) || empty($aid) || empty($type)) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        $archives = $dsql->SetQuery("INSERT INTO `#@__house_report` (`action`, `aid`, `type`, `note`, `pubdate`) VALUES ('$action', '$aid', '$type', '$note', " . GetMkTime(time()) . ")");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "举报成功！";
        } else {
            return array("state" => 200, "info" => '举报失败！');
        }

    }


    /**
     * 楼盘列表
     * @return array
     */
    public function loupanList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $typeid   = $addrid = $subway = $station = $price = $keywords = $times = $zhuangxiu = $salestate = $filter = $tuandate = $buildtype = $feature = $orderby = $nid = $page = $pageSize = $where = "";

        $uid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type      = $this->param['type'];
                $typeid    = $this->param['typeid'];
                $addrid    = $this->param['addrid'];
                $subway    = $this->param['subway'];
                $station   = $this->param['station'];
                $price     = convertArrToStrWithComma($this->param['price']);
                $keywords  = $this->param['keywords'] ? $this->param['keywords'] : $this->param['title'];
                $times     = $this->param['times'];
                $zhuangxiu = $this->param['zhuangxiu'];
                $salestate = $this->param['salestate'];
                $filter    = $this->param['filter'];
                $not       = $this->param['not'];
                $tuandate  = $this->param['tuandate'];
                $tuan      = (int)$_GET['tuan'];
                $buildtype = $this->param['buildtype'];
                $nid       = $this->param['nid'];
                $qj        = (int)$this->param['qj'];
                $fenxiaobb = (int)$this->param['fenxiaobb'];
                $video     = (int)$this->param['video'];
                $shapan    = (int)$this->param['shapan'];
                $orderby   = $this->param['orderby'];
                $feature   = $this->param['feature'];
                $lng       = $this->param['lng'];
                $lat       = $this->param['lat'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND l.`cityid` = " . $cityid;
            }
        }

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

        if ($qj) {
            $where .= " AND qj.`id` != ''";
        }
        if ($video) {
            $where .= " AND video.`id` != ''";
        }
        if ($shapan) {
            $where .= " AND s.`id` != ''";
        }

        //类型
        $typeid = $typeid ? $typeid : $type;
        if (!empty($typeid)) {
            $where .= " AND FIND_IN_SET(" . $typeid . ", l.`protype`)";
        }

        if ($not) {
            $where .= " AND l.`id` NOT IN (" . $not . ")";
        }

        //遍历地区
        if (!empty($addrid)) {
            global $arr_data;
            $arr_data = array();
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND l.`addrid` in ($lower)";
        }


        //地铁
        //如果站点不为空则直接进行验证
        if (!empty($station)) {

            $where .= " AND FIND_IN_SET ($station, l.`subway`)";

            //如果站点为空，线路不为空，则先查询出线路的站点再验证
        } elseif (!empty($subway)) {

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_subway_station` WHERE `sid` = $subway ORDER BY `weight`");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $subway = array();
                foreach ($res as $key => $value) {
                    $subway[] = "FIND_IN_SET (" . $value['id'] . ", l.`subway`)";
                }

                $where .= " AND (" . join(" OR ", $subway) . ")";
            }

        }

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            $price[0] = (int)$price[0];
            $price[1] = (int)$price[1];
            if ($price[0]) {
                $where .= " AND l.`price` < " . $price[1] * 1000;
            } elseif ($price[1]) {
                $where .= " AND l.`price` > " . $price[0] * 1000;
            } elseif($price[0] && $price[1]) {
                $where .= " AND l.`price` BETWEEN " . $price[0] * 1000 . " AND " . $price[1] * 1000;
            }
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (l.`title` like '%" . $keywords . "%' OR l.`addr` like '%" . $keywords . "%' OR l.`buildtype` like '%" . $keywords . "%' OR l.`titlealias` like '%" . $keywords . "%')";
        }

        /*分销报备*/

        if(!empty($fenxiaobb)){
            $where .=" AND l.`fenxaiotype` = 1 AND l.`fenxiaotime` > " .GetMkTime(time());
        }

        //查询距离
        if ((!empty($lng)) && (!empty($lat))) {
            $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lng . "-l.`longitude`)/360),2)+COS(3.1415926535898*" . $lng . "/180)* COS(l.`longitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lat . "-l.`latitude`)/360),2))))*1000 AS distance,";
        } else {
            $select = "";
        }

        $now       = GetMkTime(time());
        $today     = GetMkTime(date("Y-m-d"));  //今日
        $yesterday = GetMkTime(date("Y-m-d", strtotime("-1 day")));  //昨日
        $tomorrow  = GetMkTime(date("Y-m-d", strtotime("+1 day")));  //明日
        $acquired  = GetMkTime(date("Y-m-d", strtotime("+2 day")));  //后日
        $tmonth    = GetMkTime(date("Y-m") . "-1");  //本月
        $nmonth    = GetMkTime(date("Y-m" . "-1", strtotime("+1 month")));  //下月
        $nmonth_   = GetMkTime(date("Y-m" . "-1", strtotime("+2 month")));  //下下月
        $lmonth    = GetMkTime(date("Y-m" . "-1", strtotime("-1 month")));  //上月

        //时间筛选
        if (!empty($times)) {
            $times = ltrim($times, "p");//skin6 pc loupan.html 传参错误临时解决
            //今日
            if ($times == "today") {
                $where .= " AND (l.`deliverdate` >= " . $today . " AND l.`deliverdate` < " . $tomorrow . ")";

                //明日
            } elseif ($times == "tomorrow") {
                $where .= " AND (l.`deliverdate` >= " . $tomorrow . " AND l.`deliverdate` < " . $acquired . ")";

                //昨日
            } elseif ($times == "yesterday") {
                $where .= " AND (l.`deliverdate` >= " . $yesterday . " AND l.`deliverdate` < " . $today . ")";

                //本月
            } elseif ($times == "tmonth") {
                $where .= " AND (l.`deliverdate` >= " . $tmonth . " AND l.`deliverdate` < " . $nmonth . ")";

                //下月
            } elseif ($times == "nmonth") {
                $where .= " AND (l.`deliverdate` >= " . $nmonth . " AND l.`deliverdate` < " . $nmonth_ . ")";

                //上月
            } elseif ($times == "lmonth") {
                $where .= " AND (l.`deliverdate` >= " . $lmonth . " AND l.`deliverdate` < " . $tmonth . ")";
            }
        }

        //装修
        if (!empty($zhuangxiu)) {
            $where .= " AND l.`zhuangxiu` = " . $zhuangxiu;
        }

        //特色
        if (!empty($feature)) {
            $where .= " AND FIND_IN_SET(" . $feature . ", l.`feature`)";
        }

        //建筑类型
        if (!empty($buildtype)) {
            $where .= " AND l.`buildtype` like '%" . $buildtype . "%'";
        }

        //销售状态
        if ($salestate != "") {
            $where .= " AND l.`salestate` = " . $salestate;
        }

        //筛选
        if (!empty($filter)) {
            $filterArr = explode(",", $filter);
            foreach ($filterArr as $key => $value) {
                if ($value == "hot") {
                    $where .= " AND l.`hot` = 1";
                } elseif ($value == "rec") {
                    $where .= " AND l.`rec` = 1";
                } elseif ($value == "tuan") {
                    $where .= " AND l.`tuan` = 1 AND $now > l.`tuanbegan` AND $now < l.`tuanend`";
                }
            }
        }
        if($tuan ==1){
            $where .= " AND l.`tuan` = 1 AND $now > l.`tuanbegan` AND $now < l.`tuanend`";
        }


        //团购时间筛选
        if (!empty($tuandate)) {
            //skin6 pc loupan.html 传参错误临时解决
            if (substr($tuandate, 0, 1) == 't' && $tuandate != 'today' && $tuandate != 'tomorrow' && $tuandate != 'tmonth') {
                $tuandate = substr($tuandate, 1);
            }
            //今日
            if ($tuandate == "today") {
                $where .= " AND (l.`tuanbegan` >= " . $today . " AND l.`tuanbegan` < " . $tomorrow . ")";

                //明日
            } elseif ($tuandate == "tomorrow") {
                $where .= " AND (l.`tuanbegan` >= " . $tomorrow . " AND l.`tuanbegan` < " . $acquired . ")";

                //昨日
            } elseif ($tuandate == "yesterday") {
                $where .= " AND (l.`tuanbegan` >= " . $yesterday . " AND l.`tuanbegan` < " . $today . ")";

                //本月
            } elseif ($tuandate == "tmonth") {
                $where .= " AND (l.`tuanbegan` >= " . $tmonth . " AND l.`tuanbegan` < " . $nmonth . ")";

                //下月
            } elseif ($tuandate == "nmonth") {
                $where .= " AND (l.`tuanbegan` >= " . $nmonth . " AND l.`tuanbegan` < " . $nmonth_ . ")";

                //上月
            } elseif ($tuandate == "lmonth") {
                $where .= " AND (l.`tuanbegan` >= " . $lmonth . " AND l.`tuanbegan` < " . $tmonth . ")";
            }
        }


        //屏蔽ID
        if (!empty($nid)) {
            $where .= " AND l.`id` NOT IN ($nid)";
        }


        //排序
        if (!empty($orderby)) {
            //价格升序
            if ($orderby == 1) {
                $orderby = " ORDER BY l.`price` ASC, l.`rec` DESC, l.`hot` DESC, l.`weight` DESC, l.`id` DESC";
                //价格降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY l.`price` DESC, l.`rec` DESC, l.`hot` DESC, l.`weight` DESC, l.`id` DESC";
                //开盘时间降序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY l.`deliverdate` DESC, l.`rec` DESC, l.`hot` DESC, l.`weight` DESC, l.`id` DESC";
                //开盘时间升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY l.`deliverdate` ASC, l.`rec` DESC, l.`hot` DESC, l.`weight` DESC, l.`id` DESC";
            } else {
                $orderby = "";
            }
        } else {
            $orderby = " ORDER BY l.`rec` DESC, l.`hot` DESC, l.`weight` DESC, l.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $groupby = " GROUP BY l.`id`";

        $archives = $dsql->SetQuery("SELECT " .
            "l.`id`, l.`title`,l.`titlealias`,l.`addrid`, l.`addr`, l.`longitude`, l.`latitude`, l.`litpic`, l.`deliverdate`, l.`opendate`, l.`price`, l.`ptype`, l.`salestate`, l.`hot`, l.`rec`, l.`tuan`, l.`tuanbegan`, l.`tuanend`, l.`protype`, l.`buildtype`, l.`zhuangxiu`, l.`tel`, l.`existing`, l.`investor`, l.`buildarea`,l.`buildage`,l.`fenxaiotype`,l.`fenxiaotime`,l.`fenxiaotitle`,l.`rongji`,l.`green`,l.`planhouse`,l.`parknum`,l.`property`,l.`proprice`, " . $select . "s.`id` shapanid, video.`id` video, qj.`id` qj " .
            "FROM `#@__house_loupan` l LEFT JOIN `#@__house_shapan` s ON s.`loupan` = l.`id` LEFT JOIN `#@__house_loupanvideo` video ON video.`loupan` = l.`id` LEFT JOIN `#@__house_360qj` qj ON qj.`loupan` = l.`id` " .
            "WHERE " .
            "l.`state` = 1" . $where . $groupby . $orderby);

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT l.`id` FROM `#@__house_loupan` l LEFT JOIN `#@__house_shapan` s ON s.`loupan` = l.`id` LEFT JOIN `#@__house_loupanvideo` video ON video.`loupan` = l.`id` LEFT JOIN `#@__house_360qj` qj ON qj.`loupan` = l.`id` " .
            "WHERE " .
            "l.`state` = 1" . $where . $groupby);
        $totalCount = getCache("house_loupan_total", $arc, 0, array("savekey" => 1, "type" => "totalCount"));

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where, "results");
        $results = getCache("house_loupan_list", $archives . $where, 300);
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['addrid']    = $val['addrid'];
                $list[$key]['phone']     = $val['phone'];
                $list[$key]['buildarea'] = $val['buildarea'];
                $list[$key]["buildage"]  = $val['buildage'] >= 100 ? '永久产权' : $val['buildage'] . '年';
                $list[$key]['titlealias'] = $val['titlealias'];
                $list[$key]['rongji'] = $val['rongji'];
                $list[$key]['green'] = $val['green'];
                $list[$key]['planhouse'] = $val['planhouse'];
                $list[$key]['parknum'] = $val['parknum'];
                $list[$key]['property'] = $val['property'];
                $list[$key]['proprice'] = $val['proprice'];

                $list[$key]['fenxaiotype']  = $val['fenxaiotype'];
                $list[$key]['fenxiaotime']  = $val['fenxiaotime'] !='' ? date('Y-m-d H:i:s',$val['fenxiaotime']) : '';
                $list[$key]['fenxiaotitle'] = $val['fenxiaotitle'];

                $list[$key]['distance'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';  //距离   //千米  //米
                if (strpos($list[$key]['distance'], '千米')) {
                    $list[$key]['distance'] = str_replace("千米", 'km', $list[$key]['distance']);
                } elseif (strpos($list[$key]['distance'], '米')) {
                    $list[$key]['distance'] = str_replace("米", 'm', $list[$key]['distance']);
                }

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data                  = "";
                $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr']    = $addrName;
                $list[$key]['address'] = $val['addr'];

                $list[$key]['longitude'] = $val['longitude'];
                $list[$key]['latitude']  = $val['latitude'];

                $list[$key]['litpic']      = getFilePath($val['litpic']);
                $list[$key]['deliverdate'] = $val['deliverdate'];
                $list[$key]['opendate']    = $val['opendate'];
                $list[$key]['price']       = $val['price'];
                $list[$key]['ptype']       = $val['ptype'];

                $list[$key]['salestate'] = $val['salestate'];
                $list[$key]['hot']       = $val['hot'];
                $list[$key]['rec']       = $val['rec'];
                $list[$key]['tuan']      = $val['tuan'];
                $list[$key]['tel']       = $val['tel'];
                $list[$key]['existing']  = $val['existing'];
                $list[$key]['investor']  = $val['investor'];

                //团购状态
                if ($now < $val['tuanbegan']) {
                    $list[$key]['tuanState'] = 1;
                } elseif ($now > $val['tuanend']) {
                    $list[$key]['tuanState'] = 3;
                } elseif ($now > $val['tuanbegan'] && $now < $val['tuanend']) {
                    $list[$key]['tuanState'] = 2;
                }

                $list[$key]['tuanbegan'] = $val['tuanbegan'];
                $list[$key]['tuanend']   = $val['tuanend'];

                //团购人数
                $sql                     = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupantuan` WHERE `aid` = " . $val['id']);
                $totalCount              = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['tuanCount'] = $totalCount;

                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    // $houseResult = $dsql->dsqlOper($houseitem, "results");
                    $typename = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    array_push($protypeArr, $typename);
                }
                $list[$key]['protype'] = join(",", $protypeArr);

                $list[$key]['buildtype'] = empty($val['buildtype']) ? array() : explode(" ", $val['buildtype']);

                $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['zhuangxiu']);
                // $houseResult = $dsql->dsqlOper($houseitem, "results");
                $typename                = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['zhuangxiu']));
                $list[$key]['zhuangxiu'] = $typename;

                $param             = array(
                    "service"  => "house",
                    "template" => "loupan-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //户型数量
                $hx_room = array();
                $hx_area = array();
                $sql     = $dsql->SetQuery("SELECT `id`, `room`, `area` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = " . $val['id']);
                $res     = $dsql->dsqlOper($sql, "results");

                $list[$key]['hx_data'] = $res;

                if ($res) {
                    foreach ($res as $k => $v) {
                        if (!in_array($v['room'], $hx_room)) {
                            $hx_room[] = $v['room'];
                        }
                        if ($v['area'] > 0) {
                            $hx_area[] = $v['area'];
                        }
                    }
                    sort($hx_room);
                    sort($hx_area);
                }
                $list[$key]['hxcount'] = count($res);
                $list[$key]['hx_room'] = $hx_room;

                $hx_area_ = array();
                if ($hx_area) {
                    $hx_area_[0] = $hx_area[0];
                    $count       = count($hx_area);
                    if ($count > 1 && $hx_area[$count - 1] != $hx_area[0]) {
                        $hx_area_[1] = $hx_area[$count - 1];
                    }
                }
                $list[$key]['hx_area'] = $hx_area_;

                //图集数量
                $sql                    = $dsql->SetQuery("SELECT p.`id` FROM `#@__house_album` a LEFT JOIN `#@__house_pic` p ON p.`aid` = a.`id` WHERE p.`type` = 'albumloupan' AND a.`action` = 'loupan' AND a.`loupan` = " . $val['id']);
                $piccount               = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['piccount'] = $piccount;

                //视频
                $sql                      = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupanvideo` WHERE `loupan` = " . $val['id']);
                $videocount               = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['videocount'] = $videocount;

                //全景
                $sql                         = $dsql->SetQuery("SELECT `id` FROM `#@__house_360qj` WHERE `loupan` = " . $val['id']);
                $quanjingcount               = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['quanjingcount'] = $quanjingcount;

                //沙盘
                // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_shapan` WHERE `loupan` = " . $val['id']);
                // $shapancount = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['shapancount'] = $val['shapanid'] ? 1 : 0;

                $collect = "";
                if ($uid != -1) {
                    //验证是否已经收藏
                    $params  = array(
                        "module" => "house",
                        "temp"   => "loupan_detail",
                        "type"   => "add",
                        "id"     => $val['id'],
                        "check"  => 1
                    );
                    $collect = checkIsCollect($params);
                }
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;


            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 楼盘浏览记录列表
     * 小区、租房等所有房源
     * @return array
     */
    public function loupanHistory()
    {
        global $dsql;

        $param = $this->param;

        $type = $param['type'];

        if (empty($type)) $type = "loupan";

        $list                = array();
        $loupanHistoryCookie = GetCookie("house_" . $type . "_history");
        if (empty($loupanHistoryCookie)) return array("state" => 200, "info" => '暂无数据！');

        $loupanHistoryCookie = str_replace(":", ",", $loupanHistoryCookie);
        $arr                 = explode(",", $loupanHistoryCookie);
        // $arr = array_reverse($arr);
        $loupanHistoryCookie = join(",", $arr);

        $where = "";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where = " AND `cityid` = " . $cityid;
            }
        }

        // 有转让费
        if ($type == "sp" || $type == "cf") {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `address`, `litpic`, `type`, `price`, `area`, `transfer` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        } elseif ($type == "cw") {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `address` addr, `litpic`, `price`, `transfer`, `area`, `type` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        } elseif ($type == "zu" || $type == "sale") {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `address` addr, `litpic`, `price`, `area` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        } elseif ($type == "xzl") {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `address`, `litpic`, `type`, `price`, `area` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        } elseif ($type == "releaseschool") {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `address`, `logo`, `banner`, `note` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        } else {
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `addr`, `litpic`, `price` FROM `#@__house_" . $type . "` WHERE `state` = 1 AND `id` in (" . $loupanHistoryCookie . ") " . $where . " ORDER BY instr('," . $loupanHistoryCookie . ",', concat(',',id,','))");
        }

        $type_ = $type;

//		echo $archives;die;
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                foreach ($val as $k => $v) {
                    $list[$key][$k] = $v;
                }

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['price']  = $val['price'];

                //价格类型
                if ($type == 'loupan') {
                    $list[$key]['ptype'] = $val['ptype'];
                }

                $param             = array(
                    "service"  => "house",
                    "template" => $type_ . "-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return array("pageInfo" => "ok", "list" => $list);
    }


    /**
     * 区域楼盘统计
     *
     * @return array
     */
    public function loupanDistrict()
    {
        global $dsql;
        $typeid    = (int)$this->param['typeid'];
        $price     = convertArrToStrWithComma($this->param['price']);
        $keywords  = $this->param['keywords'];
        $times     = $this->param['times'];
        $zhuangxiu = (int)$this->param['zhuangxiu'];
        $buildtype = $this->param['buildtype'];
        $salestate = (int)$this->param['salestate'];
        $cityid    = (int)$this->param['cityid'];
        $son       = (int)$this->param['son'];

        if (empty($cityid)) {
            // $cityid = getCityId();
        }

        $data = array();

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        //类型
        if (!empty($typeid)) {
            $where .= " AND FIND_IN_SET(" . $typeid . ", `protype`)";
        }

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND `price` < " . $price[1] * 1000;
            } elseif (empty($price[1])) {
                $where .= " AND `price` > " . $price[0] * 1000;
            } else {
                $where .= " AND `price` BETWEEN " . $price[0] * 1000 . " AND " . $price[1] * 1000;
            }
        }

        //关键字
        if (!empty($keywords)) {
            $where .= " AND (`title` like '%" . $keywords . "%' OR `addr` like '%" . $keywords . "%' OR `buildtype` like '%" . $keywords . "%')";
        }

        $now       = GetMkTime(time());
        $today     = GetMkTime(date("Y-m-d"));  //今日
        $yesterday = GetMkTime(date("Y-m-d", strtotime("-1 day")));  //昨日
        $tomorrow  = GetMkTime(date("Y-m-d", strtotime("+1 day")));  //明日
        $acquired  = GetMkTime(date("Y-m-d", strtotime("+2 day")));  //后日
        $tmonth    = GetMkTime(date("Y-m") . "-1");  //本月
        $nmonth    = GetMkTime(date("Y-m" . "-1", strtotime("+1 month")));  //下月
        $nmonth_   = GetMkTime(date("Y-m" . "-1", strtotime("+2 month")));  //下下月
        $lmonth    = GetMkTime(date("Y-m" . "-1", strtotime("-1 month")));  //上月

        //时间筛选
        if (!empty($times)) {
            //今日
            if ($times == "today") {
                $where .= " AND (`deliverdate` >= " . $today . " AND `deliverdate` < " . $tomorrow . ")";

                //明日
            } elseif ($times == "tomorrow") {
                $where .= " AND (`deliverdate` >= " . $tomorrow . " AND `deliverdate` < " . $acquired . ")";

                //昨日
            } elseif ($times == "yesterday") {
                $where .= " AND (`deliverdate` >= " . $yesterday . " AND `deliverdate` < " . $today . ")";

                //本月
            } elseif ($times == "tmonth") {
                $where .= " AND (`deliverdate` >= " . $tmonth . " AND `deliverdate` < " . $nmonth . ")";

                //下月
            } elseif ($times == "nmonth") {
                $where .= " AND (`deliverdate` >= " . $nmonth . " AND `deliverdate` < " . $nmonth_ . ")";

                //上月
            } elseif ($times == "lmonth") {
                $where .= " AND (`deliverdate` >= " . $lmonth . " AND `deliverdate` < " . $tmonth . ")";
            }
        }

        //装修
        if (!empty($zhuangxiu)) {
            $where .= " AND `zhuangxiu` = " . $zhuangxiu;
        }

        //建筑类型
        if (!empty($buildtype)) {
            $where .= " AND `buildtype` like '%" . $buildtype . "%'";
        }

        //销售状态
        if ($salestate != "") {
            $where .= " AND `salestate` = " . $salestate;
        }

        //所有一级区域
        if ($cityid) {
            $sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = $cityid ORDER BY `weight`");
        } else {

            //所有分站
            $cityidsArr        = array();
            $siteConfigService = new siteConfig();
            $cityDomain        = $siteConfigService->siteCity();
            if ($cityDomain) {
                foreach ($cityDomain as $key => $value) {
                    array_push($cityidsArr, $value['cityid']);
                }
            }
            $cityids = join(',', $cityidsArr);

            $sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` IN ($cityids) ORDER BY `weight`");

        }
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $kk = 0;
            foreach ($ret as $key => $value) {

                //三级数据
                if($son){

                    $_aid = $value['id'];
                    $sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = $_aid ORDER BY `weight`");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        foreach($ret as $_key => $_value){
                            $ids     = array($_value['id']);
                            $addrSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_area` WHERE `parentid` = " . $_value['id'] . " ORDER BY `weight`");
                            $addrRet = $dsql->dsqlOper($addrSql, "results");
                            foreach ($addrRet as $k => $v) {
                                array_push($ids, $v['id']);
                            }

                            $count = $price = 0;

                            if ($ids) {
                                $loupanSql = $dsql->SetQuery("SELECT COUNT(`id`) count, AVG(`price`) price FROM `#@__house_loupan` WHERE `addrid` in (" . join(",", $ids) . ")" . $where);
                                $loupanRet = $dsql->dsqlOper($loupanSql, "results");
                                if ($loupanRet) {
                                    $count = $loupanRet[0]['count'];
                                    $price = sprintf("%.2f", $loupanRet[0]['price']);
                                }
                            }

                            if ($count > 0) {
                                $data[$kk]['id']        = $_value['id'];
                                $data[$kk]['addrname']  = $_value['typename'];
                                $data[$kk]['longitude'] = $_value['longitude'];
                                $data[$kk]['latitude']  = $_value['latitude'];
                                $data[$kk]['count']     = $count;
                                $data[$kk]['price']     = $price;
                                $kk++;
                            }
                        }
                    }

                }
                //二级数据
                else{
                    $ids     = array($value['id']);
                    $addrSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_area` WHERE `parentid` = " . $value['id'] . " ORDER BY `weight`");
                    $addrRet = $dsql->dsqlOper($addrSql, "results");
                    foreach ($addrRet as $k => $v) {
                        array_push($ids, $v['id']);
                    }

                    $count = $price = 0;

                    if ($ids) {
                        $loupanSql = $dsql->SetQuery("SELECT COUNT(`id`) count, AVG(`price`) price FROM `#@__house_loupan` WHERE `addrid` in (" . join(",", $ids) . ")" . $where);
                        $loupanRet = $dsql->dsqlOper($loupanSql, "results");
                        if ($loupanRet) {
                            $count = $loupanRet[0]['count'];
                            $price = sprintf("%.2f", $loupanRet[0]['price']);
                        }
                    }

                    if ($count > 0) {
                        $data[$kk]['id']        = $value['id'];
                        $data[$kk]['addrname']  = $value['typename'];
                        $data[$kk]['longitude'] = $value['longitude'];
                        $data[$kk]['latitude']  = $value['latitude'];
                        $data[$kk]['count']     = $count;
                        $data[$kk]['price']     = $price;
                        $kk++;
                    }
                }

            }
        }

        if ($data) {
            return $data;
        } else {
            return array("state" => 200, "info" => '暂无相关数据！');
        }

    }


    /**
     * 楼盘详细
     * @return array
     */
    public function loupanDetail()
    {
        global $dsql;
        $loupanDetail = array();
        $id           = $this->param;
        $id           = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupan` WHERE `state` = 1 AND `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $loupanDetail["id"]    = $id;
            $loupanDetail["title"] = $results[0]['title'];
            $loupanDetail["titlealias"] = $results[0]['titlealias'];

            $addrid = $results[0]['addrid'];


            $areaid = 0;

            //父级区域
            $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }

            $loupanDetail["areaid"] = $areaid;
            $loupanDetail["addrid"] = $addrid;
            $loupanDetail["cityid"] = $results[0]['cityid'];

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data                 = "";
            $addrName             = array_reverse(parent_foreach($addrName, "typename"));
            $loupanDetail['addr'] = $addrName;
            $loupanDetail["address"]     = $results[0]['address'];
            $loupanDetail["addrs"]       = $results[0]['addr'];
            $loupanDetail["longitude"]   = $results[0]['longitude'];
            $loupanDetail["latitude"]    = $results[0]['latitude'];
            $loupanDetail["litpic"]      = getFilePath($results[0]['litpic']);
            $loupanDetail["bussiness"]   = $results[0]['bussiness'];
            $loupanDetail["deliverdate"] = $results[0]['deliverdate'];
            $loupanDetail["opendate"]    = $results[0]['opendate'];
            $loupanDetail["price"]       = $results[0]['price'];
            $loupanDetail["ptype"]       = $results[0]['ptype'];
            $loupanDetail["views"]       = $results[0]['views'];
            $loupanDetail["salestate"]   = $results[0]['salestate'];
            $loupanDetail["hot"]         = $results[0]['hot'];
            $loupanDetail["rec"]         = $results[0]['rec'];
            $loupanDetail["tuan"]        = $results[0]['tuan'];
            $loupanDetail["tuantitle"]   = $results[0]['tuantitle'];
            $loupanDetail["tuanbegan"]   = $results[0]['tuanbegan'];
            $loupanDetail["tuanend"]     = $results[0]['tuanend'];
            $loupanDetail["banner"]      = getFilePath($results[0]['banner']);
            $loupanDetail["existing"]    = (int)$results[0]['existing'];

            //团购状态
            $now       = GetMkTime(time());
            $tuanState = 0;
            if ($now < $results[0]['tuanbegan']) {
                $tuanState = 1;
            } elseif ($now > $results[0]['tuanend']) {
                $tuanState = 3;
            } elseif ($now > $results[0]['tuanbegan'] && $now < $results[0]['tuanend']) {
                $tuanState = 2;
            }

            $loupanDetail['tuanState'] = $tuanState;

            //团购人数
            $tuanCount = 0;
            if ($results[0]['tuan'] == 1) {
                $sql       = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupantuan` WHERE `aid` = " . $id);
                $tuanCount = $dsql->dsqlOper($sql, "totalCount");
            }
            $loupanDetail['tuanCount'] = $tuanCount;

            //订阅人数
            $sql                       = $dsql->SetQuery("SELECT `id` FROM `#@__house_notice` WHERE `action` = 'loupan' AND `aid` = " . $id);
            $subscribe                 = $dsql->dsqlOper($sql, "totalCount");
            $loupanDetail["subscribe"] = $subscribe;

            $loupanDetail["userid"]   = $results[0]['userid'];
            $loupanDetail["investor"] = $results[0]['investor'];


            $protype    = explode(",", $results[0]['protype']);
            $protypeArr = array();
            foreach ($protype as $k => $v) {
                if ($v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }
            }
            $loupanDetail['protype']    = join(",", $protypeArr);
            $loupanDetail["protypeArr"] = $protypeArr;

            $loupanDetail["saleAddress"] = $results[0]['address'];
            $loupanDetail["tel"]         = $results[0]['tel'];
            $loupanDetail["worktime"]    = $results[0]['worktime'];
            $loupanDetail["note"]        = $results[0]['note'];
            $loupanDetail["buildtype"]   = $results[0]['buildtype'];

            $loupanDetail["buildtypeval"] = $results[0]['buildtypeval'] !='' ? explode(',',$results[0]['buildtypeval']) :array() ;

            $houseitem                 = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['zhuangxiu']);
            $zhuangxiu                 = getCache("house_zx_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
            $loupanDetail["zhuangxiu"]    = $zhuangxiu;
            $loupanDetail["zhuangxiuval"] = $results[0]['zhuangxiu'];

            $loupanDetail["buildage"]  = $results[0]['buildage'] >= 100 ? '永久产权' : $results[0]['buildage'] . '年';
            $loupanDetail["buildage_"]  = $results[0]['buildage'];
            $loupanDetail["planarea"]  = $results[0]['planarea'];
            $loupanDetail["buildarea"] = $results[0]['buildarea'];
            $loupanDetail["planhouse"] = $results[0]['planhouse'];
            $loupanDetail["linklocal"] = $results[0]['linklocal'];
            $loupanDetail["parknum"]   = $results[0]['parknum'];
            $loupanDetail["rongji"]    = $results[0]['rongji'];
            $loupanDetail["green"]     = $results[0]['green'];
            $loupanDetail["floor"]     = $results[0]['floor'];
            $loupanDetail["property"]  = $results[0]['property'];
            $loupanDetail["proprice"]  = $results[0]['proprice'];
            $loupanDetail["state"]     = $results[0]['state'];
            $loupanDetail["is_vipguanggao"]     = $results[0]['is_vipguanggao'];
            // $loupanDetail["protype"]   = $results[0]['protype'] !='' ? explode(',',$results[0]['protype']): '' ;
            $loupanDetail["litpicptah"]= getFilePath($results[0]['litpic']);
            $loupanDetail["bannerptah"]= getFilePath($results[0]['banner']);


            $loupanDetail["subway"]    = $results[0]['subway'];

            $subway = explode(",", $results[0]['subway']);

            $subwayarr = array();
            foreach($subway as $a => $b){
                if($b!='') {

                    $archives  = $dsql->SetQuery("SELECT * FROM `#@__site_subway_station` WHERE `id` = $b");
                    $subwayres = $dsql->dsqlOper($archives, "results");
                    $name      = $subwayres ? $subwayres[0]['title'] : "";

                    $subwayarr[$a]['txt'] = $name;
                    $subwayarr[$a]['id']  = $b;
                }
            }

            $loupanDetail["subwayarr"]    = json_encode($subwayarr,true);

            $configArr = array();
            $config    = $results[0]['config'];
            if (!empty($config)) {
                $config = explode("|||", $config);
                foreach ($config as $key => $value) {
                    $_value             = explode("###", $value);
                    $configArr[$key][0] = $_value[0];
                    $configArr[$key][1] = str_replace("\n", "<br>", $_value[1]);
                }
            }

            $loupanDetail["config"]  = $configArr;
            $loupanDetail["pubdate"] = $results[0]['pubdate'];

            $sql = $dsql->SetQuery("SELECT `litpic`, `data` FROM `#@__house_shapan` WHERE `loupan` = " . $id);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $loupanDetail["shapan"]["litpic"] = getFilePath($ret[0]['litpic']);

                $shapanData = unserialize($ret[0]['data']);
                if($shapanData){
                    foreach($shapanData as $_k => $_v){
                        //获取户型信息
                        $shapanApartment = $_v['apartment'];
                        $apartmentData = array();
                        if($shapanApartment){
                            $shapanApartmentArr = explode(',', $shapanApartment);
                            foreach($shapanApartmentArr as $_a){
                                $this->param = $_a;
                                array_push($apartmentData, $this->apartmentDetail());
                            }
                        }
                        $shapanData[$_k]['apartment'] = $apartmentData;
                    }
                }

                $loupanDetail["shapan"]["data"] = $shapanData;
            }

            // 全景
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_360qj` WHERE `loupan` = $id ORDER BY `id` DESC LIMIT 0,1");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $this->param = $res[0]['id'];

                $qj                 = $this->loupanQjDetail();
                $loupanDetail["qj"] = $qj;
            }

            // 视频
            $sql = $dsql->SetQuery("SELECT * FROM `#@__house_loupanvideo` WHERE `loupan` = $id ORDER BY `id` DESC LIMIT 0,1");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $res[0]['litpic']      = $res[0]['litpic'] ? getFilePath($res[0]['litpic']) : '';
                $res[0]['videourl']    = $res[0]['videourl'] ? getFilePath($res[0]['videourl']) : '';
                $loupanDetail["video"] = $res[0];
            }

            //验证是否已经收藏
            $params                  = array(
                "module" => "house",
                "temp"   => "loupan_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect                 = checkIsCollect($params);
            $loupanDetail['collect'] = $collect == "has" ? 1 : 0;

            // 楼盘顾问
            $this->param = array("loupanid" => $id, "pageSize" => 9999);
            $gw = $this->loupanGuwenList();
            $loupanDetail['gw'] = $gw['list'];

            // 统计相册
            $sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_album` a WHERE `action` = 'loupan' AND `loupan` = $id");
            $res = $dsql->dsqlOper($sql, "results");

            $loupanDetail['total_album'] = $res[0]['count'];

            //户型数量
            $hx_room = array();
            $hx_area = array();
            $sql     = $dsql->SetQuery("SELECT `id`, `room`, `area` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = " . $id);
            $res     = $dsql->dsqlOper($sql, "results");
            if ($res) {
                foreach ($res as $k => $v) {
                    if (!in_array($v['room'], $hx_room)) {
                        $hx_room[] = $v['room'];
                    }
                    if ($v['area'] > 0) {
                        $hx_area[] = $v['area'];
                    }
                }
                sort($hx_room);
                sort($hx_area);
            }
            $loupanDetail['hxcount'] = count($res);
            $loupanDetail['hx_room'] = $hx_room;

            $hx_area_ = array();
            if ($hx_area) {
                $hx_area_[0] = $hx_area[0];
                $count       = count($hx_area);
                if ($count > 1 && $hx_area[$count - 1] != $hx_area[0]) {
                    $hx_area_[1] = $hx_area[$count - 1];
                }
            }
            $loupanDetail['hx_area'] = $hx_area_;
        }
        return $loupanDetail;
    }


    /**
     * 楼盘房源列表
     * @return array
     */
    public function listingList()
    {
        global $dsql;
        $pageinfo = $list = array();
        $loupanid = $addrid = $price = $room = $title = $orderby = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $loupanid = $this->param['loupanid'];
                $addrid   = $this->param['addrid'];
                $price    = convertArrToStrWithComma($this->param['price']);
                $room     = $this->param['room'];
                $title    = $this->param['title'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        //楼盘
        if ($loupanid != "") {
            $where .= " AND `loupan` = " . $loupanid;
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            //查询楼盘信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `state` = 1 AND `addrid` in ($lower)");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                //有结果
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND `loupan` in ($ids)";
                    //无结果
                } else {
                    $where .= " AND 1 = 2";
                }
                //无结果
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND `price` < " . $price[1];
            } elseif (empty($price[1])) {
                $where .= " AND `price` > " . $price[0];
            } else {
                $where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
            }
        }

        //房型
        if ($room != "") {
            if ($room == 0) {
                $where .= " AND `room` > 5";
            } else {
                $where .= " AND `room` = " . $room;
            }
        }

        //关键字
        if (!empty($title)) {
            $where .= " AND `title` like '%" . $title . "%'";

            //查询楼盘信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `state` = 1 AND (`title` like '%" . $title . "%' OR `addr` like '%" . $title . "%' OR `buildtype` like '%" . $title . "%')");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND `loupan` in ($ids)";
                }
            }
        }

        if (!empty($orderby)) {
            //价格升序
            if ($orderby == 1) {
                $orderby = " ORDER BY `price` ASC, `weight` DESC, `id` DESC";
                //价格降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
                //发布时间降序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                //发布时间升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY `pubdate` ASC, `weight` DESC, `id` DESC";
            }
        } else {
            $orderby = " ORDER BY `weight` DESC, `id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "`id`, `loupan`, `title`, `litpic`, `price`, `room`, `hall`, `guard`, `area` " .
            "FROM `#@__house_listing` " .
            "WHERE " .
            "`state` = 1" . $where . $orderby);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id'] = $val['id'];

                $archives = $dsql->SetQuery("SELECT `title`, `addrid`, `addr` FROM `#@__house_loupan` WHERE `id` = " . $val['loupan']);
                $loupan   = $dsql->dsqlOper($archives, "results");
                if ($loupan) {
                    $list[$key]['loupan'] = $loupan[0]['title'];
                    $addrName             = getParentArr("site_area", $loupan[0]['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['addr']    = join(" > ", $addrName);
                    $list[$key]['address'] = $loupan[0]['addr'];
                } else {
                    $list[$key]['loupan']  = "";
                    $list[$key]['addr']    = "";
                    $list[$key]['address'] = "";
                }

                $list[$key]['title']  = $val['title'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['price']  = $val['price'];
                $list[$key]['room']   = $val['room'] . "室" . $val['hall'] . "厅" . $val['guard'] . "卫";
                $list[$key]['area']   = $val['area'];
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 楼盘房源详细
     * @return array
     */
    public function listingDetail()
    {
        global $dsql;
        $listingDetail = array();
        $id            = $this->param;

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_listing` WHERE `state` = 1 AND `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $listingDetail["loupan"]  = $results[0]['loupan'];
            $listingDetail["title"]   = $results[0]['title'];
            $listingDetail["litpic"]  = getFilePath($results[0]['litpic']);
            $listingDetail["price"]   = $results[0]['price'];
            $listingDetail["room"]    = $results[0]['room'] . "室" . $results[0]['hall'] . "厅" . $results[0]['guard'] . "卫";
            $listingDetail["area"]    = $results[0]['area'];
            $listingDetail["bno"]     = $results[0]['bno'];
            $listingDetail["floor"]   = $results[0]['floor'];
            $listingDetail["userid"]  = $results[0]['userid'];
            $listingDetail["salable"] = $results[0]['salable'];
            $listingDetail["launch"]  = $results[0]['launch'];

            $flist    = array();
            $flistArr = $results[0]['flist'];
            if (!empty($flistArr)) {
                $flistArr = explode("|", $flistArr);
                $flist[]  = $flistArr;
            }

            $listingDetail["flist"] = $flist;
            $listingDetail["note"]  = $results[0]['note'];

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = " . $id . " ORDER BY `id` ASC");
            $results  = $dsql->dsqlOper($archives, "results");

            if (!empty($results)) {
                $imglist = array();
                foreach ($results as $key => $value) {
                    $imglist[$key]["path"] = getFilePath($value["picPath"]);
                    $imglist[$key]["info"] = $value["picInfo"];
                }
            } else {
                $imglist = array();
            }

            $listingDetail["imglist"] = $imglist;
        }
        return $listingDetail;
    }


    /**
     * 楼盘资讯列表
     * @return array
     */
    public function loupanNewsList()
    {
        global $dsql;
        $pageinfo = $list = $lidArr = array();
        $loupanid = $page = $pageSize = $where = $orderby = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $loupanid = $this->param['loupanid'];
                $keywords = $this->param['keywords'];
                $rand     = $this->param['rand'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $where = $where2 = "";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where2 = " AND l.`cityid` = " . $cityid;
            }
        }

        if (empty($loupanid)) {
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__house_loupan` l WHERE 1 = 1" . $where2);
            $results  = $dsql->dsqlOper($archives, "results");
            foreach ($results as $key => $value) {
                $lidArr[$key] = $value['id'];
            }
            if ($lidArr) {
                $where .= " AND n.`loupan` in (" . join(",", $lidArr) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        if (!empty($loupanid)) {
            $where .= " AND n.`loupan` = " . $loupanid;
        }

        $orderby = ' ORDER BY n.`weight` DESC, n.`id` DESC';
        if (!empty($rand)) {
            $orderby = ' ORDER BY rand()';
        }

        if(!empty($keywords)){

            $where .= " AND (n.`title` like '%" . $keywords . "%')";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //查表
        $archives = $dsql->SetQuery("SELECT " .
            "n.`id`, n.`loupan`, n.`title`, n.`click`, n.`body`, n.`pubdate` " .
            "FROM `#@__house_loupannews` n LEFT JOIN `#@__house_loupan` l ON l.`id` = n.`loupan` " .
            "WHERE 1 = 1" . $where2 . $where . $orderby);

        $archives1 = $dsql->SetQuery("SELECT " .
            "count(n.`id`) total " .
            "FROM `#@__house_loupannews` n LEFT JOIN `#@__house_loupan` l ON l.`id` = n.`loupan` " .
            "WHERE 1 = 1" . $where2 . $where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives1, "results");
        $totalCount = $totalCount[0]['total'];
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id'] = $val['id'];

                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__house_loupan` WHERE `id` = " . $val['loupan']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $list[$key]['loupan'] = $ret[0]['title'];
                } else {
                    $list[$key]['loupan'] = "";
                }

                $list[$key]['title']   = $val['title'];
                $list[$key]['click']   = $val['click'];
                $list[$key]['pubdate'] = $val['pubdate'];
                $list[$key]['pubdatetime'] = date('Y-m-d',$val['pubdate']);

                $list[$key]['note'] = mb_substr(strip_tags($val['body']), 0, 120);

                $param             = array(
                    "service"  => "house",
                    "template" => "loupan-news-detail",
                    "id"       => $val['loupan'],
                    "aid"      => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 楼盘资讯详细
     * @return array
     */
    public function loupanNewsDetail()
    {
        global $dsql;
        $listingDetail = array();
        $id            = $this->param;

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupannews` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            return $results;
        }
    }


    /**
     * 中介公司模糊匹配
     * @return array
     */
    public function zjCom()
    {
        global $dsql;
        $title = $this->param['title'];

        if (!empty($title)) {
            $commSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_zjcom` WHERE `title` like '%$title%' AND `state` = 1 LIMIT 0, 10");
            $commResult = $dsql->dsqlOper($commSql, "results");
            if ($commResult) {
                return $commResult;
            }
        }
    }


    /**
     * 中介公司列表
     * @return array
     */
    public function zjComList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();

        $orderby = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $addrid   = $this->param['addrid'];
                $state    = $this->param['state'];
                $keywords = $this->param['keywords'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        $state = $state == "" ? 1 : $state;

        $where .= " AND `store_switch` = 1";

        // 状态
        if ($state != "") {
            $where .= " AND z.`state` = $state";
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addr` in ($lower)";
        }

        // 关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (z.`title` like '%" . $keywords . "%')";
        }

        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY z.`pubdate` DESC, z.`isbid` DESC, z.`weight` DESC, z.`id` DESC";
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY z.`pubdate` ASC, z.`isbid` DESC, z.`weight` DESC, z.`id` DESC";
                //房源数量
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY z.`counts` DESC, z.`isbid` DESC, z.`weight` DESC, z.`id` DESC";
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY z.`counts` ASC, z.`isbid` DESC, z.`weight` DESC, z.`id` DESC";
            }
        } else {
            $orderby = " ORDER BY z.`isbid` DESC, z.`counts` DESC, z.`weight` DESC, z.`pubdate` DESC, z.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "z.`id`, z.`isbid`, z.`title`, z.`litpic`, z.`userid`, z.`tel`, z.`addr`, z.`address`, z.`email`, z.`note`, z.`click`, z.`flag`, z.`pubdate`, z.`cityid`" .
            "FROM `#@__house_zjcom` z " .
            "WHERE 1 = 1" . $where);

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(z.`id`) total FROM `#@__house_zjcom` z WHERE 1 = 1" . $where);
        $totalCount = getCache("house_zjcom_total", $arc, 300, array("name" => "total", "savekey" => 1));

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_zjcom_list", $archives . $where1 . $orderby . $where, 300);

        if ($results) {

            $where = "";
            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where = " AND `cityid` = " . $cityid;
                }
            }

            foreach ($results as $key => $val) {
                $list[$key]['id']      = $val['id'];
                $list[$key]['title']   = $val['title'];
                $list[$key]['litpic']  = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
                $list[$key]['userid']  = $val['userid'];
                $list[$key]['tel']     = $val['tel'];
                $list[$key]['address'] = $val['address'];
                $list[$key]['email']   = $val['email'];
                $list[$key]['note']    = $val['note'];
                $list[$key]['click']   = $val['click'];
                $list[$key]['flag']    = $val['flag'];
                $list[$key]['isbid']   = $val['isbid'];
                $list[$key]['pubdate'] = $val['pubdate'];

                $addrName = getParentArr("site_area", $val['addr']);
                global $data;
                $data                   = "";
                $addrName               = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addrName'] = $addrName;

                $sql                = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = " . $val['cityid']);
                $res                = $dsql->dsqlOper($sql, "results");
                $list[$key]['city'] = $res ? $res[0]['typename'] : "";

                // 查询 公司下二手房数目
                $arcSale = $dsql->SetQuery("SELECT count(s.`id`) AS countSale FROM `#@__house_sale` s WHERE `state`=1 and `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $val['id'] . ")" );
                $retSale = $dsql->dsqlOper($arcSale, "results");
                if ($retSale) {
                    $list[$key]['countSale'] = $retSale[0]['countSale'];
                } else {
                    $list[$key]['countSale'] = 0;
                }

                $param             = array(
                    "service"  => "house",
                    "template" => "store-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                // 查询 公司下出租房数目
                $arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countZu FROM `#@__house_zu` z WHERE `state`=1 and  `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $val['id'] . ")" );
                $retZu = $dsql->dsqlOper($arcZu, "results");
                if ($retZu) {
                    $list[$key]['countZu'] = $retZu[0]['countZu'];
                } else {
                    $list[$key]['countZu'] = 0;
                }

                // 查询 公司下团队人数
                $arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countTeam FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $val['id'] . " AND `state` = 1");
                $retZu = $dsql->dsqlOper($arcZu, "results");
                if ($retZu) {
                    $list[$key]['countTeam'] = $retZu[0]['countTeam'];
                } else {
                    $list[$key]['countTeam'] = 0;
                }
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 中介公司详细信息
     * @return array
     */
    public function zjComDetail()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        $listingDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if (!is_numeric($id) && $uid == -1) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $where = " AND `state` = 1";
        if (!is_numeric($id)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $id    = $results[0]['id'];
                $where = "";
            } else {
                return array("state" => 200, "info" => '该会员暂未开通商铺！');
            }
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_zjcom` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            if ($results[0]["userid"] != $uid && $results[0]["store_switch"] == 0) {
                return;
            }

            $results[0]["litpicSource"] = $results[0]["litpic"];
            $results[0]["litpic"]       = getFilePath($results[0]["litpic"]);

            $addrName = getParentArr("site_area", $results[0]['addr']);
            global $data;
            $data                   = "";
            $addrName               = array_reverse(parent_foreach($addrName, "typename"));
            $results[0]['addrName'] = $addrName;

            $this->param   = "";
            $channelDomain = $this->config();
            $domainInfo    = getDomain('house', 'house_zjcom', $id);

            // 查询 公司下二手房数目
            $arcSale = $dsql->SetQuery("SELECT count(s.`id`) AS countSale FROM `#@__house_sale` s WHERE `state`=1 and `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $id . ")" . $where);
            $retSale = $dsql->dsqlOper($arcSale, "results");
            if ($retSale) {
                $results[0]['countSale'] = $retSale[0]['countSale'];
            } else {
                $results[0]['countSale'] = 0;
            }

            // 查询 公司下出租房数目
            $arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countZu FROM `#@__house_zu` z WHERE `state`=1 and  `userid` in(SELECT z.`id` FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $id . ")" . $where);
            $retZu = $dsql->dsqlOper($arcZu, "results");
            if ($retZu) {
                $results[0]['countZu'] = $retZu[0]['countZu'];
            } else {
                $results[0]['countZu'] = 0;
            }

            // 查询 公司下团队人数
            $arcZu = $dsql->SetQuery("SELECT count(z.`id`) AS countTeam FROM `#@__house_zjuser` z WHERE z.`zjcom` = " . $id . " AND `state` = 1");
            $retZu = $dsql->dsqlOper($arcZu, "results");
            if ($retZu) {
                $results[0]['countTeam'] = $retZu[0]['countTeam'];
            } else {
                $results[0]['countTeam'] = 0;
            }

            /**
             * 默认 || 模块配置为子目录并且信息配置为绑定子域名则访问方式转为默认
             * （因为子域名是随模块配置变化，如果模块配置为子目录地址为乱掉。）
             * 如：模块配置：http://menhu168.com/house
             * 如果信息绑定子域名则会变成：http://demo.menhu168.com/house
             * 这样会导致系统读取信息错误
             */
            if ($results[0]["domaintype"] == 0 || ($channelDomain['subDomain'] == 2 && $results[0]["domaintype"] == 2)) {

                $results[0]["domain"] = $channelDomain['channelDomain'] . "/store-detail-" . $id . ".html";

                //绑定主域名
            } elseif ($results[0]["domaintype"] == 1) {

                $results[0]["domain"]    = $cfg_secureAccess . $domainInfo['domain'];
                $results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
                $results[0]["domaintip"] = $domainInfo['note'];

                //绑定子域名
            } elseif ($results[0]["domaintype"] == 2) {

                $results[0]["domain"]    = str_replace("http://", "http://" . $domainInfo['domain'] . ".", $channelDomain['channelDomain']);
                $results[0]["domain"]    = str_replace("https://", "https://" . $domainInfo['domain'] . ".", $channelDomain['channelDomain']);
                $results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
                $results[0]["domaintip"] = $domainInfo['note'];

            }

            $param             = array(
                "service"  => "house",
                "template" => "store-detail",
                "id"       => $id
            );
            $results[0]['url'] = getUrlPath($param);

            return $results[0];
        }
    }


    /**
     * 配置中介公司
     * @return array
     */
    public function storeConfig()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid       = $userLogin->getMemberID();
        $param        = $this->param;
        $cityid       = (int)$param['cityid'];
        $addr         = (int)$param['addrid'];
        $store_switch = (int)$param['store_switch'];
        $title        = filterSensitiveWords(addslashes($param['title']));
        $litpic       = $param['litpic'];
        $tel          = filterSensitiveWords(addslashes($param['tel']));
        $address      = filterSensitiveWords(addslashes($param['address']));
        $email        = filterSensitiveWords(addslashes($param['email']));
        $note         = filterSensitiveWords(addslashes($param['note']));
        $pubdate      = GetMkTime(time());

        if (empty($addr)) $addr = (int)$param['addr'];

        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array("state" => 200, "info" => '账号验证错误，请先入驻商家！');
        }

        if (!verifyModuleAuth(array("module" => "house"))) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if (empty($cityid)) {
            return array("state" => 200, "info" => '请选择城市');
        }

        if (empty($title)) {
            return array("state" => 200, "info" => '请输入公司名称');
        }

        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传公司LOGO');
        }

        if (empty($tel)) {
            return array("state" => 200, "info" => '请输入联系电话');
        }

        if (empty($addr)) {
            return array("state" => 200, "info" => '请选择区域');
        }

        if (empty($address)) {
            return array("state" => 200, "info" => '请输入联系地址');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //入驻审核开关
        include HUONIAOINC . "/config/business.inc.php";
        $moduleJoinCheck     = (int)$customModuleJoinCheck;
        $editModuleJoinCheck = (int)$customEditModuleJoinCheck;

        //新商铺
        if (!$userResult) {

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_zjcom` (`cityid`, `userid`, `title`, `litpic`, `tel`, `address`, `email`, `note`, `weight`, `state`, `pubdate`, `addr`, `store_switch`) VALUES ('$cityid', '$userid', '$title', '$litpic', '$tel', '$address', '$email', '$note', 1, '$moduleJoinCheck', '$pubdate', '$addr', $store_switch)");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'store-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'store', $aid, 'insert', '申请中介公司('.$title.')', $url, $archives);

                // 更新店铺开关
                updateStoreSwitch("house", "house_zjcom", $userid, $aid);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userDetail['nickname'] . "\r\n新增中介公司：" . $title . "\r\n等待审核",
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "store", $param);
                dataAsync("house",$aid,"zjCom");  // 新增中介公司
                return "配置成功，您的公司正在审核中，请耐心等待！";
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

            //更新商铺信息
        } else {

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__house_zjcom` SET `cityid` = '$cityid', `title` = '$title', `litpic` = '$litpic', `tel` = '$tel', `address` = '$address', `email` = '$email', `note` = '$note', `state` = '$editModuleJoinCheck', `addr` = $addr, `store_switch` = $store_switch WHERE `userid` = " . $userid);
            $results  = $dsql->dsqlOper($archives, "update");
            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'store-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'store', $userResult[0]['id'], 'update', '更新中介公司('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userDetail['nickname'] . "\r\n更新了中介公司：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "store", $param);
                $sql = $dsql->SetQuery("select `id` from `#@__house_zjcom` where `userid`=$userid");
                $res = $dsql->dsqlOper($sql,"results");
                if($res && is_array($res)){
                    dataAsync("house",$res[0]['id'],"zjCom");  // 修改中介公司
                }
                // 清除缓存
                clearCache("house_zjcom_detail", $userResult[0]['id']);
                if ($userResult[0]['state'] == 1) {
                    checkCache("house_zjcom_list", $userResult[0]['id']);
                    clearCache("house_zjcom_total", "key");
                }

                return "保存成功！";
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

        }

    }

    public function storeConfigGroup()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        if (!verifyModuleAuth(array("module" => "house"))) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) return array("state" => 200, "info" => '您还没有开通中介公司');
        $zjcom = $userResult[0]['id'];

        $param = $this->param;
        // $type  = $param['type'];

        // if(empty($type)) return array("state" => 200, "info" => '参数错误');

        $z_field = "";
        if (isset($param['addrid'])) {
            $addr    = (int)$param['addrid'];
            $cityid  = (int)$param['cityid'];
            $address = $param['address'];
            if (empty($addr)) return array("state" => 200, "info" => '请选择区域');
            if (empty($address)) return array("state" => 200, "info" => '请填写详细地址');

            $z_field .= "`addr` = $addr, `address` = '$address', `cityid` = $cityid,";
        }
        if (isset($param['note'])) {
            $note = filterSensitiveWords(addslashes($param['note']));
            if (empty($note)) return array("state" => 200, "info" => '请填写公司介绍');

            $z_field .= "`note` = '$note',";
        }

        if (isset($param['title'])) {
            $title = $param['title'];
            if (empty($title)) return array("state" => 200, "info" => '请填写公司名称');
            $z_field .= "`title` = '$title',";
        }

        if (isset($param['tel'])) {
            $tel = $param['tel'];
            if (empty($tel)) return array("state" => 200, "info" => '请填写联系电话');
            $z_field .= "`tel` = '$tel',";
        }

        if (isset($param['store_switch'])) {
            $store_switch = (int)$param['store_switch'];
            $z_field      .= "`store_switch` = $store_switch,";
            // $data = array("module" => "house", "state" => $store_switch);
            // $busi = new business($data);
            // $busi->updateBusinessModuleSwitch($data);
        }

        if (isset($param['litpic'])) {
            $litpic = $param['litpic'];
            if (empty($litpic)) return array("state" => 200, "info" => '请上传LOGO');
            $z_field .= "`litpic` = '$litpic',";
        }

        if ($z_field) {
            $z_field = rtrim($z_field, ",");
            $sql     = $dsql->SetQuery("UPDATE `#@__house_zjcom` SET {$z_field} WHERE `id` = $zjcom");
            $dsql->dsqlOper($sql, "update");

            $urlParam = array(
                'service' => 'house',
                'template' => 'store-detail',
                'id' => $zjcom
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'house', 'store', $zjcom, 'update', '更新中介公司('.$title.')', $url, $sql);
        }

        return "更新成功";

    }

    /**
     * 开通中介经纪人
     * @return array
     */
    public function configZjUser()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $param = $this->param;

        $alone = (int)$param['alone'];

        $areaCode    = $param['areaCode'];
        $phone       = $param['phone'];
        $vdimgck     = $param['vdimgck'];
        $photo       = $param['photo'];    // 头像
        $litpic      = $param['litpic']; // 名片
        $qqQr        = $param['qqQr'];
        $wxQr        = $param['wxQr'];
        $qq          = $param['qq'];
        $wx          = $param['wx'];
        $idcardFront = $param['idcardFront'];
        $idcardBack  = $param['idcardBack'];
        $license     = $param['license'];    // 执业资格认证

        $zjcom = (int)$param['zjcom'];
        $post  = (int)$param['post'];
        $suc   = (int)$param['suc'];

        $addr      = (int)$param['addr'];
        $cityid    = (int)$param['cityid'];
        $community = $param['community'];

        $dopost = $param['dopost'];

        $store = filterSensitiveWords(addslashes($param['store']));
        $note  = filterSensitiveWords(addslashes($param['note']));

        $pubdate = GetMkTime(time());

        /*加入经济人先查看有无公司*/

        $comSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
        $comResult = $dsql->dsqlOper($comSql, "results");
        if ($comResult && $comResult[0]['id'] != $zjcom && $zjcom != 0) {
            return array("state" => 200, "info" => '请选择自己的公司加入！');
            exit();
        }

        if ($alone == 0) {
            if ($zjcom == 0) {
                return array("state" => 200, "info" => '请选择所属公司！');
                exit();
            }

            $comSql    = $dsql->SetQuery("SELECT `id`, `cityid`, `userid` FROM `#@__house_zjcom` WHERE `id` = " . $zjcom);
            $comResult = $dsql->dsqlOper($comSql, "results");
            if (!$comResult) {
                return array("state" => 200, "info" => '中介公司不存在，请在联想列表中选择，或者新增中介公司！');
                exit();
            }
            $comResult = $comResult[0];

            if (empty($cityid)) $cityid = $comResult['cityid'];
        } else {
            $zjcom = 0;
            $post  = 0;
        }

        $sql  = $dsql->SetQuery("SELECT `photo`, `phone`, `phoneCheck`, `idcardFront`, `idcardBack`, `certifyState` FROM `#@__member` WHERE `id` = $userid");
        $ret  = $dsql->dsqlOper($sql, "results");
        $user = $ret[0];

        if (empty($phone)) return array("state" => 200, "info" => '请填写手机号');


        // 用户表需要更新的字段
        $update_member = "";

        if (empty($user['phone']) || $user['phoneCheck'] == 0 || $phone != $user['phone']) {

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`username` = '$phone' || `phone` = '$phone') AND `id` != $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                return array("state" => 200, "info" => '手机号已被注册');
            }

            if ($dopost != 'edit') {
                if (empty($vdimgck)) return array("state" => 200, "info" => '请填写验证码');

                $areaCode = empty($areaCode) ? "86" : $areaCode;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if (!$international) {
                        $areaCode = "";
                    }
                } else {
                    return array("state" => 200, "info" => '短信平台未配置，提交失败！');
                }

                $phone = $areaCode . $phone;

                //验证输入的验证码
                $archives = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = '$phone' AND `code` = '$vdimgck'");
                $results  = $dsql->dsqlOper($archives, "results");
                if (!$results) {
                    return array("state" => 200, "info" => $langData['siteConfig'][20][99]);    //验证码输入错误，请重试！
                } else {

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $results[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！

                    //验证通过删除发送的验证码
                    $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'auth' AND `user` = '$phone' AND `code` = '$vdimgck'");
                    $dsql->dsqlOper($archives, "update");
                }
                $update_member .= "`phone` = '$phone',`phoneCheck` = 1, `phoneBindTime` = '$pubdate',";
            }

            $update_member .= "`phone` = '$phone',";


        }
        // if(empty($idcardFront)) return array("state" => 200, "info" => '请上传身份证正面照片');
        // if(empty($idcardBack)) return array("state" => 200, "info" => '请上传身份证反面照片');

        if (($idcardFront && $idcardFront != $user['idcardFront']) || ($idcardBack && $idcardBack != $user['idcardBack'])) {
            // 更新身份认证信息
            $update_member .= "`idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `certifyState` = 3,";
        }

        if ($photo && $user['photo'] != $photo) {
            $update_member .= "`photo` = '$photo',";
        }

        // 更新用户表信息
        if ($update_member != "") {
            $update_member = substr($update_member, 0, -1);
            $sql           = $dsql->SetQuery("UPDATE `#@__member` SET $update_member WHERE `id` = $userid");
            $dsql->dsqlOper($sql, "update");
        }

        // if(empty($litpic)) return array("state" => 200, "info" => '请上传名片！');
        // if(empty($license)) return array("state" => 200, "info" => '请上传执业资格认证');

        $userSql    = $dsql->SetQuery("SELECT `id`, `litpic`, `state`, `zjcom`, `pubdate` FROM `#@__house_zjuser` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //新中介
        if (!$userResult) {

            //新建经纪人时保存免费套餐数据
            $meal = $this->getFreeMeal();

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_zjuser` (`cityid`,`userid`, `zjcom`, `store`, `addr`, `community`, `litpic`, `note`, `state`, `flag`, `weight`, `pubdate`, `license`, `qq`, `wx`, `qqQr`, `wxQr`, `meal`) VALUES ('$cityid','$userid', '$zjcom', '$store', '$addr', '$community', '$litpic', '$note', 0, 0, 1, '$pubdate', '$license', '$qq', '$wx', '$qqQr', '$wxQr', '$meal')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'broker-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'broker', $aid, 'insert', '申请经纪人', $url, $archives);

                //更新当前会员下已经发布的房源信息性质
                $sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");
                $sql = $dsql->SetQuery("UPDATE `#@__house_cw` SET `usertype` = 1, `userid` = $aid WHERE `userid` = $userid AND `usertype` = 0");
                $dsql->dsqlOper($sql, "update");


                if ($alone == 0) {
                    $param = array(
                        "service"  => "member",
                        "template" => "house_receive_broker"
                    );
                    updateMemberNotice($comResult['userid'], '会员-经纪人入驻通知中介公司', $param);
                }

                clearCache("house_zjuser_list", "key");
                clearCache("house_zjuser_total", "key");

                return $alone == 0 ? "提交成功，请联系您的公司为您审核开通！" : "提交成功，我们会尽快审核！";
            } else {
                return array("state" => 200, "info" => '提交失败，请稍候重试！');
            }

            //更新中介信息
        } else {
            
            $state_old   = $userResult[0]['state'];
            $pubdate_old = $userResult[0]['pubdate'];
            $zjcom       = $userResult[0]['zjcom'];

            $changeState_ = ", `state` = 0";
            // $changeState_ = ", `pubdate` = $pubdate";

            $RenrenCrypt = new RenrenCrypt();
            $opic        = $RenrenCrypt->php_decrypt(base64_decode($userResult[0]['litpic']));
            $npic        = $RenrenCrypt->php_decrypt(base64_decode($litpic));

            $flag = ", `flag` = 0, `litpic` = '$litpic'";
            if ($opic == $npic) {
                $flag = "";
            }

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `store` = '$store', `addr` = '$addr', `cityid`= '$cityid', `community` = '$community', `note` = '$note', `wx` = '$wx', `wxQr` = '$wxQr', `qq` = '$qq', `qqQr` = '$qqQr', `license` = '$license', `post` = '$post'" . $changeState_ . $flag . " WHERE `userid` = " . $userid);
            $results  = $dsql->dsqlOper($archives, "update");

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'broker-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'broker', $userResult[0]['id'], 'update', '更新经纪人信息', $url, $archives);

                autoShowUserModule($userid,'house'); //申请房产经纪人
                // 清除缓存
                checkCache("house_zjuser_list", $userResult[0]['id']);
                clearCache("house_zjuser_detail", $userResult[0]['id']);
                clearCache("house_zjuser_total", "key");

                return $zjcom ? "提交成功，请联系您的公司为您审核开通！" : "提交成功，我们会尽快审核！";
            } else {
                return array("state" => 200, "info" => '提交失败，请稍候重试！');
            }

        }

    }

    /**
     * 更新经纪人资料（单个或分组）
     */
    public function configZjUserGroup()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) return array("state" => 200, "info" => '您还没有入驻经纪人');

        $zjuid = $userResult[0]['id'];

        $userinfo = $userLogin->getMemberInfo();

        $param = $this->param;
        $type  = $param['type'];

        if (empty($type)) return array("state" => 200, "info" => '参数错误');

        $m_field = "";
        $z_field = "";

        if ($type == "base") {
            if (isset($param['photo'])) {
                if (empty($param['photo'])) return array("state" => 200, "info" => '请上传头像');
                $m_field .= "`photo` = '" . $param['photo'] . "',";
            }

            if (isset($param['nickname'])) {
                if (empty($param['nickname'])) return array("state" => 200, "info" => '请填写姓名');
                $m_field .= "`nickname` = '" . $param['nickname'] . "',";
            }
            if (isset($param['phone'])) {
                $phone = $param['phone'];
                if ($phone) {
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`username` = '$phone' || `phone` = '$phone') AND `id` != $userid");
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        return array("state" => 200, "info" => '手机号已被注册');
                    }
                }
                $m_field .= "`phone` = '" . $phone . "',";
                if ($userinfo['phone'] != $phone) {
                    $m_field .= "`phoneCheck` = 0,";
                }
            }
            if (isset($param['qq'])) {
                $z_field .= "`qq` = '" . $param['qq'] . "',";
            }
            if (isset($param['wx'])) {
                $z_field .= "`wx` = '" . $param['wx'] . "',";
            }
        }

        if ($type == "area") {
            $addr   = (int)$param['addr'];
            $cityid = (int)$param['cityid'];
            if (empty($param['addr'])) return array("state" => 200, "info" => '请选择区域');

            $z_field .= "`addr` = $addr, `cityid` = $cityid,";

        }

        if ($type == "qr") {
            if (isset($param['qqQr'])) {
                $z_field .= "`qqQr` = '" . $param['qqQr'] . "',";
            }
            if (isset($param['wxQR'])) {
                $z_field .= "`wxQR` = '" . $param['wxQR'] . "',";
            }

        }

        if ($type == "idcard") {
            if (isset($param['idcardFront'])) {
                $m_field .= "`idcardFront` = '" . $param['idcardFront'] . "',";
            }
            if (isset($param['idcardBack'])) {
                $m_field .= "`idcardBack` = '" . $param['idcardBack'] . "',";
            }
        }

        if ($type == "card") {
            if (isset($param['litpic'])) {
                $z_field .= "`litpic` = '" . $param['litpic'] . "',";
            }
        }

        if ($type == "license") {
            if (isset($param['license'])) {
                $z_field .= "`license` = '" . $param['license'] . "',";
            }
        }

        if ($m_field) {
            $m_field = rtrim($m_field, ",");
            $sql     = $dsql->SetQuery("UPDATE `#@__member` SET {$m_field} WHERE `id` = $userid");
            $dsql->dsqlOper($sql, "update");
        }

        if ($z_field) {
            $z_field = rtrim($z_field, ",");
            $sql     = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET {$z_field} WHERE `id` = $zjuid");
            $dsql->dsqlOper($sql, "update");

            $urlParam = array(
                'service' => 'house',
                'template' => 'broker-detail',
                'id' => $zjuid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'house', 'broker', $zjuid, 'update', '更新经纪人资料', $url, $sql);
        }


        // 清除缓存
        checkCache("house_zjuser_list", $zjuid);
        clearCache("house_zjuser_detail", $zjuid);
        clearCache("house_zjuser_total", "key");

        return "更新成功";

    }


    /**
     * 更新中介经纪人审核状态
     * @return array
     */
    public function updateBrokerState()
    {
        global $dsql;
        global $userLogin;

        $userid    = $userLogin->getMemberID();
        $param     = $this->param;
        $id        = (int)$param['id'];
        $state     = (int)$param['state'];
        $fail_type = $param['fail_type'];
        $fail_info = $param['fail_info'];

        if (empty($id)) return array("state" => 200, "info" => '格式错误！');
        if ($userid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            $cid = $ret[0]['id'];
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `id` = $id AND `zjcom` = $cid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $flag = "";
                $time = "";
                if ($state == 1) {
                    $flag      = ", `flag` = 1";
                    $time      = ", `pubdate` = " . GetMktime(time());
                    $fail_type = 0;
                    $fail_info = "";
                }

                $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `state` = $state" . $flag . $time . ", `fail_type` = '$fail_type', `fail_info` = '$fail_info' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
                if ($ret == "ok") {

                    $urlParam = array(
                        'service' => 'house',
                        'template' => 'broker-detail',
                        'id' => $id
                    );
                    $url = getUrlPath($urlParam);
                
                    //记录用户行为日志
                    memberLog($userid, 'house', 'broker', $id, 'update', '更新经纪人状态', $url, $sql);

                    return "更新成功！";
                } else {
                    return array("state" => 200, "info" => '数据更新失败！');
                }

            } else {
                return array("state" => 200, "info" => '权限验证失败！');
            }

        } else {
            return array("state" => 200, "info" => '帐号类型验证失败！');
        }
    }


    /**
     * 房产经纪人
     * @return array
     */
    public function zjUserList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $comid    = $userid = $u = $addrid = $state = $orderby = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $comid    = (int)$this->param['comid'];
                $userid   = (int)$this->param['userid'];
                $u        = (int)$this->param['u'];
                $addrid   = (int)$this->param['addrid'];
                $state    = $this->param['state'];
                $type     = (int)$this->param['type'];    // 获取类型
                $orderby  = $this->param['orderby'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $keywords = $this->param['keywords'];
                $iszjcom  = (int)$this->param['iszjcom'];
            }
        }

        $loginuid = $userLogin->getMemberID();

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid && empty($userid) && empty($u) && empty($comid)) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        if ($keywords) {
            $user_sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE (`username` LIKE '%$keywords%' || `nickname` LIKE '%$keywords%' || `phone` LIKE '%$keywords%' || `realname` LIKE '%$keywords%')");
            $user_ret = $dsql->dsqlOper($user_sql, "results");
            if ($user_ret) {
                global $arr_data;
                $arr_data = array();
                $ids      = arr_foreach($user_ret);
                $where    .= " AND `userid` IN (" . join(",", $ids) . ")";
            } else {
                return array("state" => 200, "info" => '暂无数据！');
            }
        }
        if (!$u) {
            $where .= " AND `state` = 1";
        }

        if (!empty($comid)) {
            // $userinfo = $userLogin->getMemberInfo();
            // if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "house"))){
            // 	return array("state" => 200, "info" => '商家权限验证失败！');
            // }

            $where .= " AND `zjcom` = " . $comid;

            if ($state != "") {
                if ($state == "1,2") {
                    $where1 = " AND (`state` = 1 || `state` = 2)";
                } else {
                    $where1 = " AND `state` = " . $state;
                }
            }

            if ($type != "getnormal") {
                $where .= " AND `by_zjcom` != $comid";
            }
        }

        if ($u && empty($comid) && empty($userid)) {
            return array("state" => 200, "info" => '暂无数据！');
        }

        if (!empty($userid)) {
            $where .= " AND `id` = " . $userid;
        }

        // 中介公司查看入驻申请
        if ($iszjcom) {
            if ($loginuid == -1) $iszjcom = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $loginuid");
            $res = $dsql->dsqlOper($sql, "results");
            if (!$res) $iszjcom = 0;
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addr` in ($lower)";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //查表
        $archives = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_zjuser` WHERE 1 = 1" . $where);
        // $results = $dsql->dsqlOper($archives, "results");
        //总条数
        // $totalCount = $results[0]['count'];
        $totalCount = getCache("house_zjuser_total", $archives, 300, array("name" => "count", "savekey" => 1));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => (int)$page,
            "pageSize"   => (int)$pageSize,
            "totalPage"  => (int)$totalPage,
            "totalCount" => (int)$totalCount
        );

        //中介公司纪纪人列表需要统计信息状态
        if (!empty($comid) && $loginuid > -1) {

            //待审核
            $results = $dsql->dsqlOper($archives . " AND `state` = 0", "results");
            $state0  = $results[0]['count'];
            //已审核
            $results = $dsql->dsqlOper($archives . " AND `state` = 1", "results");
            $state1  = $results[0]['count'];
            //拒绝审核
            $results = $dsql->dsqlOper($archives . " AND `state` = 2", "results");
            $state2  = $results[0]['count'];

            $pageinfo['state0'] = (int)$state0;
            $pageinfo['state1'] = (int)$state1;
            $pageinfo['state2'] = (int)$state2;
        }

        $atpage = $pageSize * ($page - 1);

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser` WHERE 1 = 1" . $where);

        //如果是按照房源数量排序，则不进行分页
        if ($orderby != "level") {
            $where = " LIMIT $atpage, $pageSize";
        } else {
            $where = "";
        }

        if ($comid && empty($orderby)) {
            $orderby = " ORDER BY `post` DESC, `weight` DESC, `id` DESC";
        } else {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY `joindate` DESC, `weight` DESC, `id` DESC";
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY `joindate` ASC, `weight` DESC, `id` ASC";
                //房源数量
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY `counts` DESC, `weight` DESC, `id` DESC";
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY `counts` ASC, `weight` DESC, `id` DESC";
            } else {
                $orderby = " ORDER BY `weight` DESC, `id` DESC";
            }

        }

        // $results = $dsql->dsqlOper($archives.$where1 . $orderby .$where, "results");
        $results = getCache("house_zjuser_list", $archives . $where1 . $orderby . $where, (!$u ? 300 : 2), ($u ? 'zjuser_' . $userid : ''));
        if ($results) {
            // $cityid = getCityId($this->param['cityid']);
            // if($cityid){
            //     $where = " AND `cityid` = ".$cityid;
            // }

            $this->param     = "zjuserPriceCost";
            $config          = $this->config();
            $zjuserPriceCost = $config['zjuserPriceCost'];

            foreach ($results as $key => $value) {
                $list[$key]['id']       = $value['id'];
                $list[$key]['userid']   = $value['userid'];
                $list[$key]['zjcom']    = $value['zjcom'];
                $list[$key]['store']    = $value['store'];
                $list[$key]['post']     = $value['post'];
                $list[$key]['state']    = $value['state'];
                $list[$key]['sucCount'] = $value['suc'];

                $addrid = $value['addr'];
                $areaid = 0;

                //父级区域
                $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $areaid = $ret[0]['parentid'];
                }

                $list[$key]["areaid"] = $areaid;
                $list[$key]["addrid"] = $addrid;
                $list[$key]["cityid"] = $value['cityid'];

                // 名片
                $litpic = $value['litpic'];

                $sql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE `id` = " . $value['userid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($value['litpic']) {
                    $list[$key]['litpicSource'] = $value['litpic'];
                    $list[$key]['litpic']       = getFilePath($value['litpic']);
                } elseif ($ret && $ret[0]['photo']) {
                    $list[$key]['litpicSource'] = $ret[0]['photo'];
                    $list[$key]['litpic']       = changeFileSize(array('url' => getFilePath($ret[0]['photo']), 'type' => 'large'));
                } else {
                    $list[$key]['litpicSource'] = "";
                    $list[$key]['litpic']       = "";
                }

                $list[$key]['qqQrSource']    = $value['qqQr'];
                $list[$key]['qqQr']          = getFilePath($value['qqQr']);
                $list[$key]['wxQrSource']    = $value['wxQr'];
                $list[$key]['wxQr']          = getFilePath($value['wxQr']);
                $list[$key]['licenseSource'] = $value['license'];
                $list[$key]['license']       = getFilePath($value['license']);
                $list[$key]['qq']            = $value['qq'];
                $list[$key]['wx']            = $value['wx'];
                $list[$key]['note']          = $value['note'];
                $list[$key]['click']         = $value['click'];
                $list[$key]['flag']          = $value['flag'];
                $list[$key]['pubdate']       = $value['pubdate'];
                $list[$key]['joindate']      = $value['joindate'];
                $list[$key]['ext_title_1'] = $value['ext_title_1'];
                $list[$key]['ext_val_1'] = $value['ext_val_1'];
                $list[$key]['ext_title_2'] = $value['ext_title_2'];
                $list[$key]['ext_val_2'] = $value['ext_val_2'];

                if ($u) {
                    $list[$key]['state']     = $value['state'];
                    $list[$key]['fail_type'] = $value['fail_type'] == 1 ? "人员已满" : ($value['fail_type'] == 2 ? "不符合门店要求" : "");
                    $list[$key]['fail_info'] = str_replace("\r\n", "<br>", $value['fail_info']);

                    $meal    = $value['meal'];
                    $meal_up = false;
                    if ($meal) {
                        $meal = unserialize($meal);
                        $type = $meal['type'];

                        $now = GetMktime(time());
                        if ($meal['expired'] > $now) {
                            $meal['expired_day'] = ceil(($meal['expired'] - $now) / 86400);
                        }

                        if ($zjuserPriceCost) {
                            $i = 0;
                            foreach ($zjuserPriceCost as $k => $v) {
                                if ($k == $type) {
                                    if ($i < count($zjuserPriceCost) - 1) {
                                        $meal_up = true;
                                        break;
                                    }
                                }
                                $i++;
                            }
                        }
                    }
                    $list[$key]['meal']      = $meal;
                    $list[$key]['meal_up']   = $meal_up;
                    $list[$key]['meal_open'] = $zjuserPriceCost ? 1 : 0;
                }

                $archives = $dsql->SetQuery("SELECT `nickname`, `realname`, `areaCode`, `phone`, `photo`, `certifyState`, `idcardFront`, `idcardBack` FROM `#@__member` WHERE `id` = " . $value['userid']);
                $member   = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $list[$key]['nickname']    = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $list[$key]['phone']       = $member[0]['phone'];
                    $list[$key]['showMobile']  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $list[$key]['photo']       = getFilePath($member[0]['photo']);
                    $list[$key]['photoSource'] = $member[0]['photo'];
                    $list[$key]['certify']     = $member[0]['certifyState'];

                    // 如果是中介公司，输出身份证照片
                    if ($iszjcom) {
                        $list[$key]['idcardFront'] = getFilePath($member[0]['idcardFront']);
                        $list[$key]['idcardBack']  = getFilePath($member[0]['idcardBack']);
                    }
                } else {
                    $list[$key]['nickname']    = "";
                    $list[$key]['phone']       = "";
                    $list[$key]['showMobile']  = "";
                    $list[$key]['photo']       = "";
                    $list[$key]['photoSource'] = "";
                    $list[$key]['certify']     = 0;
                }

                $archives = $dsql->SetQuery("SELECT `title` FROM `#@__house_zjcom` WHERE `id` = " . $value['zjcom']);
                $zjComRet = $dsql->dsqlOper($archives, "results");
                if ($zjComRet) {
                    $list[$key]['zjcomName'] = $zjComRet[0]['title'];
                } else {
                    $list[$key]['zjcomName'] = "";
                }

                $addrName = getParentArr("site_area", $value['addr']);
                global $data;
                $data                  = "";
                $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['address'] = $addrName;

                $param             = array(
                    "service"  => "house",
                    "template" => "broker-detail",
                    "id"       => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //主营小区
                $community               = $value["community"];
                $list[$key]['community'] = $community;
                $communitySelected       = array();
                if (!empty($community)) {
                    $community = explode(",", $community);
                    foreach ($community as $val) {
                        if (is_numeric($val)) {
                            $archives    = $dsql->SetQuery("SELECT `title` FROM `#@__house_community` WHERE `id` = $val");
                            $typeResults = $dsql->dsqlOper($archives, "results");
                            $name        = $typeResults ? $typeResults[0]['title'] : "";
                            array_push($communitySelected, $name);
                        } else {
                            array_push($communitySelected, $val);
                        }
                    }
                    $list[$key]["communityArr"]  = $community;
                    $list[$key]["communityName"] = $communitySelected;
                }

                $num = 0;

                //二手房
                $archives                = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $sale                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['saleCount'] = $sale;
                $num                     += $sale;

                //租房
                $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $zu                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['zuCount'] = $zu;
                $num                   += $zu;

                //写字楼
                $archives               = $dsql->SetQuery("SELECT `id` FROM `#@__house_xzl` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $xzl                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['xzlCount'] = $xzl;
                $num                    += $xzl;

                //商铺
                $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_sp` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $sp                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['spCount'] = $sp;
                $num                   += $sp;

                //厂房
                $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_cf` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $cf                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['cfCount'] = $cf;
                $num                   += $cf;

                //车位
                $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__house_cw` WHERE `state` = 1 AND `usertype` = 1 AND `userid` = " . $value['id']);
                $cw                    = (int)$dsql->dsqlOper($archives, "totalCount");
                $list[$key]['cwCount'] = $cw;
                $num                   += $cw;

                //判断级别
                $levelArr = array();
                $archives = $dsql->SetQuery("SELECT `typename`, `icon` FROM `#@__house_zjusergroup` WHERE `num` <= $num ORDER BY `num` DESC");
                $group    = $dsql->dsqlOper($archives, "results");
                if ($group) {
                    $levelArr["name"] = $group[0]['typename'];
                    $levelArr["icon"] = $group[0]['icon'];
                }

                if ($num > 0) {
                    $list[$key]['level'] = $levelArr;
                }
                $list[$key]['total'] = $num;
            }

        }


        //按房源总数排序
        if ($orderby == "level") {
            $list = array_sortby($list, "total", SORT_DESC);
            $list = array_slice($list, 0, $pageSize);
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 房产顾问
     * @return array
     */
    public function gwUserList()
    {

        return $this->loupanGuwenList();

        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $userid   = $u = $addrid = $state = $orderby = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $ids      = (int)$this->param['ids'];
                $loupanid = (int)$this->param['loupanid'];
                $addrid   = (int)$this->param['addrid'];
                $state    = $this->param['state'];
                $orderby  = $this->param['orderby'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $keywords = $this->param['keywords'];
            }
        }
        
        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid && empty($userid) && empty($u) && empty($comid)) {
                $where .= " AND g.`cityid` = " . $cityid;
            }
        }
        if ($ids) {
            $where .= " AND g.`id` IN (" . $ids . ")";
        }

        if ($keywords) {
            $user_sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` LIKE '%$keywords%'");
            $user_ret = $dsql->dsqlOper($user_sql, "results");
            if ($user_ret) {
                $key_user_id = $user_ret[0]['id'];
                $where       .= " AND g.`userid` = $key_user_id";
            } else {
                return array("state" => 200, "info" => '暂无数据！');
            }
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND g.`addr` in ($lower)";
        }

        if ($loupanid) {
            // $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_loupan` WHERE `id` = $loupanid");
            // $res = $dsql->dsqlOper($sql, "results");
            // if ($res && $res[0]['userid']) {
            //     $where .= " AND g.`id` in (" . $res[0]['userid'] . ")";
            // } else {
            //     return array("state" => 200, "info" => '暂无数据！');
            // }
            $where .= " AND g.`loupanid` = '$loupanid'";
        }

        //查表
        $archives = $dsql->SetQuery("SELECT g.* FROM `#@__house_gw` g LEFT JOIN `#@__member` m ON m.`id` = g.`userid` WHERE m.`id` IS NOT NULL" . $where);

        $results = $dsql->dsqlOper($archives . " ORDER BY g.`weight` DESC, g.`id` DESC", "results");
        if ($results) {
            // $cityid = getCityId($this->param['cityid']);
            // if($cityid){
            //     $where = " AND `cityid` = ".$cityid;
            // }
            foreach ($results as $key => $value) {
                $list[$key]['id']     = $value['id'];
                $list[$key]['userid'] = $value['userid'];
                $list[$key]['type']   = $value['type'];
                $list[$key]['stores'] = $value['stores'];
                $list[$key]['card']   = $value['card'];
                $list[$key]['post']   = $value['post'];

                $addrid = $value['addr'];
                $areaid = 0;

                //父级区域
                $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $areaid = $ret[0]['parentid'];
                }

                $list[$key]["areaid"] = $areaid;
                $list[$key]["addrid"] = $addrid;
                $list[$key]["cityid"] = $value['cityid'];

                $list[$key]['cardSource'] = $value['card'];
                $list[$key]['card']       = getFilePath($value['card']);
                $list[$key]['pubdate']    = $value['pubdate'];

                $archives = $dsql->SetQuery("SELECT `nickname`, `phone`, `photo`, `certifyState` FROM `#@__member` WHERE `id` = " . $value['userid']);
                $member   = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $list[$key]['nickname'] = $member[0]['nickname'];
                    $list[$key]['phone']    = $member[0]['phone'];
                    $list[$key]['tel']      = $member[0]['phone'];
                    $list[$key]['photo']    = $value['card'] ? getFilePath($value['card']) : getFilePath($member[0]['photo']);
                    $list[$key]['certify']  = $member[0]['certifyState'];
                } else {
                    $list[$key]['nickname'] = "";
                    $list[$key]['phone']    = "";
                    $list[$key]['tel']    = "";
                    $list[$key]['photo']    = "";
                    $list[$key]['certify']  = 0;
                }

                $addrName = getParentArr("site_area", $value['addr']);
                global $data;
                $data                  = "";
                $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['address'] = $addrName;

                // 看房、成交数据
//                if ($loupanid) {
//                    $where = " AND `loupan` = $loupanid";
//                } else {
//                    $where = "";
//                }
//                $sql = $dsql->SetQuery("SELECT SUM(`see`) see, SUM(`suc`) suc FROM `#@__house_gw_tj` WHERE `gw` = " . $value['id'] . $where);
//                $res = $dsql->dsqlOper($sql, "results");
//                if ($res) {
//                    $see = $res[0]['see'];
//                    $suc = $res[0]['suc'];
//                }
//                $list[$key]['see'] = $see ? $see : 0;
                $list[$key]['see'] = $value['dknum'];
//                $list[$key]['suc'] = $suc ? $suc : 0;
                $list[$key]['suc'] = $value['cjnum'];

            }

        }

        return $list;
    }


    /**
     * 小区列表
     * @return array
     */
    public function communityList()
    {

        global $dsql;
        $pageinfo = $list = array();
        $typeid   = $addrid = $subway = $station = $price = $title = $tags = $nid = $orderby = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = (int)$this->param['typeid'];
                $addrid   = (int)$this->param['addrid'];
                $subway   = (int)$this->param['subway'];
                $station  = (int)$this->param['station'];
                $price    = convertArrToStrWithComma($this->param['price']);
                $title    = $this->param['keywords'];
                $tags     = $this->param['tags'];
                $orderby  = (int)$this->param['orderby'];
                $filter   = $this->param['filter'];
                $nid      = $this->param['nid'];
                $hot      = (int)$this->param['hot'];
                $rec      = (int)$this->param['rec'];
                $schoolid = $this->param['schoolid'];
                $school   = $this->param['school'];
                $buildage = $this->param['buildage'];
                $allcity  = (int)$this->param['allcity'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare && !$allcity) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND c.`cityid` = " . $cityid;
            }
        }

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
            $where .= " AND c.`id` IN ($id)";
        }

        //类型
        if (!empty($typeid)) {
            $where .= " AND FIND_IN_SET(" . $typeid . ", c.`protype`)";
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND c.`addrid` in ($lower)";
        }

        //地铁
        //如果站点不为空则直接进行验证
        if (!empty($station)) {

            $where .= " AND FIND_IN_SET ($station, c.`subway`)";

            //如果站点为空，线路不为空，则先查询出线路的站点再验证
        } elseif (!empty($subway)) {

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_subway_station` WHERE `sid` = $subway ORDER BY `weight`");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $subway = array();
                foreach ($res as $key => $value) {
                    $subway[] = "FIND_IN_SET (" . $value['id'] . ", c.`subway`)";
                }

                $where .= " AND (" . join(" OR ", $subway) . ")";
            }

        }


        //价格区间
        $price = convertArrToStrWithComma($price);
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND c.`price` < " . $price[1] * 1000;
            } elseif (empty($price[1])) {
                $where .= " AND c.`price` > " . $price[0] * 1000;
            } else {
                $where .= " AND c.`price` BETWEEN " . $price[0] * 1000 . " AND " . $price[1] * 1000;
            }
        }

        //建筑年代
        $buildage = convertArrToStrWithComma($buildage);
        if ($buildage != "") {
            $buildage = explode(",", $buildage);
            $buildage0 = (int)$buildage[0];
            $buildage1 = (int)$buildage[1];
            if ($buildage0) {
                $start = strtotime("-" . $buildage1 . " year");
                $where .= " AND c.`opendate` > " . $start;
            } elseif ($buildage1) {
                $end   = strtotime("-" . $buildage0 . " year");
                $where .= " AND c.`opendate` < " . $end;
            } else {
                $start = strtotime("-" . $buildage1 . " year");
                $end   = strtotime("-" . $buildage0 . " year");
                $where .= " AND c.`opendate` BETWEEN " . $start . " AND " . $end;
            }
        }
        // echo $where;die;

        //关键字
        if (!empty($title)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $title);
            }

            $where .= " AND (c.`title` like '%" . $title . "%' OR c.`addr` like '%" . $title . "%'  OR c.`titlealias` like '%" . $title . "%')";
        }

        //标签
        if (!empty($tags)) {
            $where .= " AND FIND_IN_SET(" . $tags . ", c.`tags`)";
        }

        //屏蔽ID
        if (!empty($nid)) {
            $where .= " AND c.`id` NOT IN ($nid)";
        }

        //热门
        if (!empty($hot)) {
            $where .= " AND c.`hot` = 1";
        }

        //推荐
        if (!empty($rec)) {
            $where .= " AND c.`rec` = 1";
        }

        //筛选
        if (!empty($filter)) {
            $filterArr = explode(",", $filter);
            foreach ($filterArr as $key => $value) {
                if ($value == "hot") {
                    $where .= " AND c.`hot` = 1";
                } elseif ($value == "rec") {
                    $where .= " AND c.`rec` = 1";
                } elseif ($value == "tuan") {
                    $where .= " AND c.`tuan` = 1 AND $now > c.`tuanbegan` AND $now < c.`tuanend`";
                }
            }
        }


        if (!empty($orderby)) {
            //价格升序
            if ($orderby == 1) {
                $orderby = " ORDER BY c.`price` ASC, c.`weight` DESC, c.`id` DESC";
                //价格降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY c.`price` DESC, c.`weight` DESC, c.`id` DESC";
                //竣工时间降序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY c.`opendate` DESC, c.`weight` DESC, c.`id` DESC";
                //竣工时间升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY c.`opendate` ASC, c.`weight` DESC, c.`id` DESC";
            } elseif ($orderby == "click") {
                $orderby = " ORDER BY c.`click` DESC, c.`weight` DESC, c.`id` DESC";
            }
        } else {
            $orderby = " ORDER BY c.`weight` DESC, c.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "c.`id`, c.`cityid`, c.`title`, c.`addrid`, c.`addr`, c.`litpic`, c.`price`, c.`opendate`, c.`protype`, c.`video`, c.`qj_type`, c.`qj_file`, c.`qj_type`, c.`elevator` " .
            "FROM `#@__house_community` c LEFT JOIN `#@__site_city` t ON t.`cid` = c.`cityid` " .
            "WHERE " .
            "c.`state` = 1 AND t.`state` = 1" . $where . $orderby);
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $totalCount = getCache("house_community_total", $archives, 0, array("savekey" => 1, "type" => "totalCount"));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where, "results");
        $results = getCache("house_community_list", $archives . $where, 300);
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['cityid'] = $val['cityid'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['titlealias']  = $val['titlealias'];
                $list[$key]['addrid'] = $val['addrid'];
                $list[$key]['py']     = getFirstCharter($val['title']);

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['address']  = $val['addr'];
                $list[$key]['litpic']   = getFilePath($val['litpic']);
                $list[$key]['price']    = $val['price'];
                $list[$key]['opendate'] = (int)$val['opendate'];

                $protypeArr = array();
                if ($val['protype']) {
                    $protype = explode(",", $val['protype']);
                    foreach ($protype as $k => $v) {
                        $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                        $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                        $protypeArr[] = $typename;
                    }
                }

                $list[$key]['protypeArr'] = $protypeArr;
                $list[$key]['protype']    = join(",", $protypeArr);

                //二手房数量
                $sql                     = $dsql->SetQuery("SELECT `id` FROM `#@__house_sale` WHERE `state` = 1 AND `communityid` = " . $val['id']);
                $saleCount               = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['saleCount'] = $saleCount;

                //出租房数量
                $sql                   = $dsql->SetQuery("SELECT `id` FROM `#@__house_zu` WHERE `state` = 1 AND `communityid` = " . $val['id']);
                $zuCount               = $dsql->dsqlOper($sql, "totalCount");
                $list[$key]['zuCount'] = $zuCount;

                $param             = array(
                    "service"  => "house",
                    "template" => "community-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video']    = $val['video'] ? 1 : 0;
                $list[$key]['qj']       = $qj;
                $list[$key]['elevator'] = $val['elevator'];

                //验证是否已经收藏
                $params                = array(
                    "module" => "house",
                    "temp"   => "community_detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 小区详细
     * @return array
     */
    public function communityDetail()
    {
        global $dsql;
        $communityDetail = array();
        $id              = $this->param;
        $id              = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_community` WHERE `state` = 1 AND `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_community_detail", $archives, 0, $id);
        if ($results) {
            $communityDetail["id"]    = $results[0]['id'];
            $communityDetail["title"] = $results[0]['title'];
            $communityDetail["titlealias"] = $results[0]['titlealias'];

            $addrid = $results[0]['addrid'];
            $areaid = 0;

            //父级区域
            $sql = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }

            $communityDetail["areaid"] = $areaid;
            $communityDetail["addrid"] = $addrid;
            $communityDetail["cityid"] = $results[0]['cityid'];

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data                    = "";
            $addrName                = array_reverse(parent_foreach($addrName, "typename"));
            $communityDetail['addr'] = $addrName;

            $communityDetail["address"]   = $results[0]['addr'];
            $communityDetail["longitude"] = $results[0]['longitude'];
            $communityDetail["latitude"]  = $results[0]['latitude'];
            $communityDetail["litpic"]    = getFilePath($results[0]['litpic']);

            $protype    = explode(",", $results[0]['protype']);
            $protypeArr = array();
            if($protype){
                foreach ($protype as $k => $v) {
                    if($v){
                        $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                        $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                        $protypeArr[] = $typename;
                    }
                }
            }
            $communityDetail['protype'] = join(",", $protypeArr);

            $communityDetail["property"] = $results[0]['property'];
            $communityDetail["proprice"] = $results[0]['proprice'];
            $communityDetail["protel"]   = $results[0]['protel'];
            $communityDetail["proaddr"]  = $results[0]['proaddr'];
            $communityDetail["opendate"] = $results[0]['opendate'];
            $communityDetail["kfs"]      = $results[0]['kfs'];
            $communityDetail["price"]    = $results[0]['price'];
            // $communityDetail["userid"]    = $results[0]['userid'];
            $communityDetail["note"]      = $results[0]['note'];
            $communityDetail["planhouse"] = $results[0]['planhouse'];
            $communityDetail["parknum"]   = $results[0]['parknum'];
            $communityDetail["rongji"]    = $results[0]['rongji'];
            $communityDetail["buildarea"] = $results[0]['buildarea'];
            $communityDetail["planarea"]  = $results[0]['planarea'];
            $communityDetail["buildage"]  = $results[0]['buildage'] >= 100 ? '永久产权' : $results[0]['buildage'] . '年';
            $communityDetail["post"]      = $results[0]['post'];
            $communityDetail["green"]     = $results[0]['green'];

            // 视频全景
            $communityDetail['videoSource'] = $results[0]['video'];
            $communityDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $communityDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $communityDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $communityDetail['qj_fileArr'] = $fileArr;
            }

            $configArr = array();
            $config    = $results[0]['config'];
            if (!empty($config)) {
                $config = explode("|||", $config);
                foreach ($config as $key => $value) {
                    $configArr[$key] = explode("###", $value);
                }
            }
            $communityDetail["config"] = $configArr;


            // 统计出售房源
            $this->param                   = array("community" => $id, "backTotal" => 1);
            $count                         = $this->saleList();
            $communityDetail['total_sale'] = $count;
            // 统计出租房源
            $this->param                 = array("community" => $id, "backTotal" => 1);
            $count                       = $this->zuList();
            $communityDetail['total_zu'] = $count;

            // 经纪人
            $this->param                   = array("id" => $id, "pageSize" => 5);
            $communityDetail['zjUserList'] = $this->communityZjUser();

            $communityDetail['pubdate'] = $results[0]['pubdate'];
            $communityDetail['click']   = $results[0]['click'];
            $communityDetail['state']   = $results[0]['state'];

            //验证是否已经收藏
            $params                     = array(
                "module" => "house",
                "temp"   => "community_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect                    = checkIsCollect($params);
            $communityDetail['collect'] = $collect == "has" ? 1 : 0;


        }
        return $communityDetail;
    }

    /**
     * 查找小区经纪人
     */
    public function communityZjUser()
    {
        global $dsql;
        $param    = $this->param;
        $id       = (int)$param['id'];
        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];

        if (empty($id)) return array("state" => 200, "info" => "参数错误");

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $list = $results = array();

        $sql  = $dsql->SetQuery("SELECT `userid` FROM `#@__house_sale` WHERE `communityid` = $id AND `usertype` = 1 GROUP BY `userid` UNION SELECT `userid` FROM `#@__house_zu` WHERE `communityid` = $id AND `usertype` = 1 GROUP BY `userid`" . $where);
        $list = $dsql->dsqlOper($sql, "results");

        if ($list) {
            foreach ($list as $key => $value) {
                $sql = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, z.* FROM `#@__house_zjuser` z LEFT JOIN `#@__member` m ON m.`id` = z.`userid` WHERE z.`id` = " . $value['userid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    if ($ret[0]['zjcom']) {
                        $sql = $dsql->SetQuery("SELECT `title` FROM `#@__house_zjcom` WHERE `id` = " . $ret[0]['zjcom']);
                        $res = $dsql->dsqlOper($sql, "results");
                        if ($res) {
                            $zjcom = $res[0]['title'];
                        } else {
                            $zjcom = "";
                        }
                    } else {
                        $zjcom = "独立经纪人";
                    }
                    $results[] = array(
                        "id"       => $ret[0]['id'],
                        "nickname" => $ret[0]['realname'] ? $ret[0]['realname'] : $ret[0]['nickname'],
                        "certify"  => $ret[0]['certifyState'] == 1 ? 1 : 0,
                        "flag"     => $ret[0]['flag'] == 1 ? 1 : 0,
                        "photo"    => $ret[0]['photo'] ? getFilePath($ret[0]['photo']) : "",
                        "areaCode"    => $ret[0]['areaCode'],
                        "phone"    => $ret[0]['phone'],
                        "showMobile" => addAreaCodePrefix($ret[0]['areaCode'], $ret[0]['phone']),
                        "qq"       => $ret[0]['qq'],
                        "wx"       => $ret[0]['wx'],
                        "qqQr"     => $ret[0]['qqQr'] ? getFilePath($ret[0]['qqQr']) : "",
                        "wxQr"     => $ret[0]['wxQr'] ? getFilePath($ret[0]['wxQr']) : "",
                        "litpic"   => $ret[0]['litpic'] ? getFilePath($ret[0]['litpic']) : "",
                        "license"  => $ret[0]['license'] ? getFilePath($ret[0]['license']) : "",
                        "zjcomid"  => $ret[0]['zjcom'],
                        "zjcom"    => $zjcom,
                        "url"      => getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $ret[0]['id']))
                    );
                }
            }
        }

        return $results;

    }


    /**
     * 房产户型列表
     * @return array
     */
    public function apartmentList()
    {
        global $dsql;
        $pageinfo = $roomgroup = $list = array();
        $action   = $loupanid = $room = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $action   = $this->param['act'];
                $loupanid = $this->param['loupanid'];
                $room     = $this->param['room'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($action)) return array("state" => 200, "info" => '类型不得为空！');
        if (empty($loupanid)) return array("state" => 200, "info" => '楼盘ID不得为空！');

        //楼盘
        $where = " `action` = '$action' AND `loupan` = " . $loupanid;

        //户型
        if (!empty($room)) {
            $where .= " AND `room` = " . $room;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //统计数据
        $archives  = $dsql->SetQuery("SELECT DISTINCT `room`, COUNT(`id`) AS num FROM `#@__house_apartment` WHERE `action` = '$action' AND `loupan` = " . $loupanid . " GROUP BY `room` having count(`id`) > 0");
        $roomgroup = $dsql->dsqlOper($archives, "results");

        //查表
        $archives = $dsql->SetQuery("SELECT " .
            "`id`, `action`, `loupan`, `title`, `room`, `hall`, `guard`, `litpic`, `area`, `price`, `direction`, `note` " .
            "FROM `#@__house_apartment` " .
            "WHERE " . $where .
            " ORDER BY `weight` DESC, `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['action'] = $val['action'];
                $list[$key]['loupan'] = $val['loupan'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['room']   = $val['room'];
                $list[$key]['hall']   = $val['hall'];
                $list[$key]['guard']  = $val['guard'];

                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['litpicsoure'] = $val['litpic'];
                $list[$key]['area']   = $val['area'];
                $list[$key]['price']  = (float)$val['price'];
                $list[$key]['note']   = $val['note'];

                $sql                     = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['direction']);
                $typename                = getCache("house_item", $sql, 0, array("name" => "typename", "sign" => $val['direction']));
                $list[$key]['direction'] = $typename;

                $param             = array(
                    "service"  => "house",
                    "template" => $val['action'] . "-hx-detail",
                    "id"       => $val['loupan'],
                    "aid"      => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

            }
        }

        return array("pageInfo" => $pageinfo, "roomGroup" => $roomgroup, "list" => $list);
    }


    /**
     * 房产户型详细
     * @return array
     */
    public function apartmentDetail()
    {
        global $dsql;
        $apartmentDetail = array();
        $id              = $this->param;
        $id              = is_numeric($id) ? $id : (is_array($id) ? $id['id'] : 0);
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $apartmentDetail["id"]     = $id;
            $apartmentDetail["action"] = $results[0]['action'];
            $apartmentDetail["loupan"] = $results[0]['loupan'];
            $apartmentDetail["title"]  = $results[0]['title'];
            $apartmentDetail["room"]   = $results[0]['room'];
            $apartmentDetail["hall"]   = $results[0]['hall'];
            $apartmentDetail["guard"]  = $results[0]['guard'];
            $apartmentDetail["litpic"] = getFilePath($results[0]['litpic']);
            $apartmentDetail["litpicsoure"] = $results[0]['litpic'];
            $apartmentDetail["area"]   = $results[0]['area'];
            $apartmentDetail["price"]  = $results[0]['price'];

            $houseitem                    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['direction']);
            $direction                    = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['direction']));
            $apartmentDetail["direction"] = $direction;
            $apartmentDetail["directionid"] = $results[0]['direction'];

            $apartmentDetail["high"] = $results[0]['high'];
            $apartmentDetail["note"] = $results[0]['note'];

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'apartment" . $results[0]['action'] . "' AND `aid` = " . $id . " ORDER BY `id` ASC");
            $results  = $dsql->dsqlOper($archives, "results");

            if (!empty($results)) {
                $imglist = array();
                foreach ($results as $key => $value) {
                    $imglist[$key]["path"]      = getFilePath($value["picPath"]);
                    $imglist[$key]["picsoure"]  = $value["picPath"];
                    $imglist[$key]["info"]      = $value["picInfo"];
                }
            } else {
                $imglist = array();
            }

            $apartmentDetail["imglist"] = $imglist;
        }
        return $apartmentDetail;
    }


    /**
     * 房产相册列表
     * @return array
     */
    public function albumList()
    {
        global $dsql;
        $pageinfo = $albumgroup = $list = array();
        $act      = $loupanid = $room = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $act      = $this->param['act'];
                $loupanid = $this->param['loupanid'];
                $id       = $this->param['id'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($act)) return array("state" => 200, "info" => '类型不得为空！');
        if (empty($loupanid)) return array("state" => 200, "info" => '楼盘ID不得为空！');

        $where = " `action` = '$act' AND `loupan` = " . $loupanid;

        //统计图片数量
        // $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__house_album` WHERE ".$where." ORDER BY `weight` DESC, `id` DESC");
        // $results = $dsql->dsqlOper($archives, "results");
        // if($results){
        // 	foreach ($results as $key=>$value) {
        // 		$albumgroup[$key]["id"] = $value["id"];
        // 		$albumgroup[$key]["title"] = $value["title"];
        // 		$archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'album".$action."' AND `aid` = ".$value["id"]);
        // 		$results = $dsql->dsqlOper($archives, "totalCount");
        // 		$albumgroup[$key]["count"] = $results;
        // 	}
        // }

        //户型
        if (!empty($id)) {
            $where .= " AND `id` = " . $id;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //查表
        $archives = $dsql->SetQuery("SELECT " .
            "`id`, `action`, `loupan`, `title` " .
            "FROM `#@__house_album` " .
            "WHERE " . $where .
            " ORDER BY `weight` DESC, `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");

        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['action'] = $val['action'];
                $list[$key]['loupan'] = $val['loupan'];
                $list[$key]['title']  = $val['title'];

                //图表信息
                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'album" . $val['action'] . "' AND `aid` = " . $val['id'] . " ORDER BY `id` ASC");
                $results  = $dsql->dsqlOper($archives, "results");

                if (!empty($results)) {
                    $imglist = array();
                    foreach ($results as $k => $v) {
                        if($v['picPath'] && $v['picPath'] != 'undefined'){
                            $imglist[$k]["path"] = getFilePath($v["picPath"]);
                            $imglist[$k]["info"] = $v["picInfo"];
                        }
                    }
                } else {
                    $imglist = array();
                }

                $list[$key]["imglist"] = $imglist;

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 房产全景列表
     * @return array
     */
    public function loupanQjList()
    {
        global $dsql;
        $pageinfo = $roomgroup = $list = array();
        $loupanid = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $loupanid = $this->param['loupanid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($loupanid)) return array("state" => 200, "info" => '楼盘ID不得为空！');

        //楼盘
        $where = " `loupan` = " . $loupanid;

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //查表
        $archives = $dsql->SetQuery("SELECT " .
            "`id`, `loupan`, `title`, `litpic` " .
            "FROM `#@__house_360qj` " .
            "WHERE " . $where .
            " ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['loupan'] = $val['loupan'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);

                $param             = array(
                    "service"  => "house",
                    "template" => "loupan-qj-detail",
                    "id"       => $val['loupan'],
                    "aid"      => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 房产全景详细
     * @return array
     */
    public function loupanQjDetail()
    {
        global $dsql;
        $qj = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_360qj` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $qj["loupan"] = $results[0]['loupan'];
            $qj["title"]  = $results[0]['title'];
            $qj["litpic"] = getFilePath($results[0]['litpic']);
            $qj["typeid"] = $results[0]['typeid'];
            if ($results[0]['typeid'] == 1) {
                $qj["file"] = getFilePath($results[0]['file']);
            } else {
                $qj["file"] = $results[0]['file'];
            }
            $qj["click"]   = $results[0]['click'];
            $qj["pubdate"] = $results[0]['pubdate'];
        }
        return $qj;
    }


    /**
     * 楼盘团购
     * @return array
     */
    public function tuan()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $aid      = $page = $pageSize = $where = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $aid      = $this->param['aid'];
            $u        = $this->param['u'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }
        $userid = $userLogin->getMemberID();
        if ($userid < 1) {
            return array("state" => 200, "info" => '登录超时！');
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        $wherr    = '';
        if ($aid != '') {
            $where .= " AND `aid` = '" . $aid . "'";
        }
        if ($u == 1) {
            $where .= " AND `uid` = '" . $userid . "'";
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupantuan` WHERE 1 = 1 " . $where . " ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']           = $val['id'];
                $list[$key]['user']         = $val['user'];
                $list[$key]['tel']          = $val['tel'];
                $list[$key]['ip']           = $val['ip'];
                $list[$key]['ipaddr']       = $val['ipaddr'];
                $list[$key]['pubdate']      = $val['pubdate'];
                $this->param                = $val['aid'];
                $list[$key]["loupanDetail"] = $this->loupanDetail();
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 楼盘团购 不限定楼盘
     */
    public function tuantotal()
    {
        global $dsql;
        $pageinfo = $list = array();
        $aid      = $page = $pageSize = $where = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $mustreturn = (int)$this->param['mustreturn'];
            $cityid     = (int)$this->param['cityid'];
            $page       = $this->param['page'];
            $pageSize   = $this->param['pageSize'];
        }

        if (empty($cityid)) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId();
            }
        }
        if ($cityid) {
            $where .= " AND l.`cityid` = $cityid";
        }


        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT COUNT(`id`) c FROM `#@__house_loupan` l WHERE `tuan` = 1 AND `state` = 1" . $where);
        $results  = $dsql->dsqlOper($archives, "results");

        //总条数
        $totalCount = $results[0]['c'];
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        // if($totalCount == 0 && $mustreturn == 1){
        // 	$mustreturn = 2;

        // 	$archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupan` WHERE `state` = 1 AND `tuan` = 1");
        // 	//总条数
        // 	$totalCount = $dsql->dsqlOper($archives, "totalCount");
        // 	//总分页数
        // 	$totalPage = ceil($totalCount/$pageSize);
        // }

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $archives = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`tuanbegan`, l.`tuanend`, l.`litpic`, (SELECT COUNT(`id`) count FROM `#@__house_loupantuan` t2 WHERE t2.`aid` = l.`id` ) count FROM `#@__house_loupan` l WHERE l.`tuan` = 1 AND l.`state` = 1" . $where);

        $atpage  = $pageSize * ($page - 1);
        $where   = " ORDER BY `weight` DESC, `id` DESC LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            $ids = array();
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['litpic']    = $val['litpic'] ? getFilePath($val['litpic']) : "";
                $list[$key]['tuanbegan'] = $val['tuanbegan'];
                $list[$key]['tuanend']   = $val['tuanend'];
                $list[$key]['count']     = $val['count'];

                $param             = array(
                    "service"  => "house",
                    "template" => "loupan-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 信息订阅
     * @param act 订阅模块
     * @param aid 要订阅的信息ID
     * @param type 订阅类型 1变价 2开盘 3团购 4动态
     * @param name 姓名
     * @param phone 手机
     * @param vercode 验证码
     * @return array
     */
    public function subscribe()
    {
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $act      = $param['act'];
        $aid      = $param['aid'];
        $hid      = (int)$param['hid'];
        $type     = $param['type'];
        $name     = $param['name'];
        $areaCode = $param['areaCode'];
        $phone    = $param['phone'];
        $vercode  = $param['vercode'];
        $sex      = (int)$param['sex'];

        if (empty($aid) || empty($act)) return array("state" => 200, "info" => '信息传递失败，请重试');
//        if (empty($type)) return array("state" => 200, "info" => '请选择要订阅的信息类型');
        if (empty($name)) return array("state" => 200, "info" => '请输入您的姓名');
        if (empty($phone)) return array("state" => 200, "info" => '请输入您的手机号码');

        // preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $phone, $matchPhone);
        // if(!$matchPhone) return array("state" => 200, "info" => '手机号码格式错误，请重新输入！');

        if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
        $vercode = strtolower($vercode);
        if ($vercode != $_SESSION['huoniao_vdimg_value']) return array("state" => 200, "info" => '验证码输入错误');

        $uid     = $userLogin->getMemberID();
        $pubdate = GetMkTime(time());

        $typeArr = explode(",", $type);

        //手机号码增加区号
        $phone = ($areaCode == '86' ? '' : $areaCode) . $phone;

        //团购
        if (in_array(3, $typeArr) && $act == "loupan") {

            // if(!is_numeric($hid)) return array("state" => 200, "info" => '参数错误！');
            if($hid){
                $huodongsql = $dsql->SetQuery("SELECT * FROM `#@__house_huodong` WHERE `id` = '$hid' AND `state` = 1");
                $huodongres = $dsql->dsqlOper($huodongsql, "results");
                if(empty($huodongres)) return array("state" => 200, "info" => '未找到该活动!');
            }

            $sql = $dsql->SetQuery("SELECT * FROM `#@__house_loupantuan` WHERE `phone` = '$phone' AND `hid` = '$hid'");
            $ret = $dsql->dsqlOper($sql,"results");
            if ($ret) {
                //如果订阅的手机号码已经存在，暂不做任何操作，后期可考虑：
                //1. 更新姓名
                //2. 更新会员ID

            } else {
                //如果不存在，新增一条记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__house_loupantuan` (`aid`, `uid`, `name`, `phone`, `pubdate`, `sex`,`hid`) VALUES ('$aid', '$uid', '$name', '$phone', '$pubdate', $sex,'$hid')");
                $dsql->dsqlOper($sql, "update");
            }

        }


        //其他订阅信息
        $key = array_search(3, $typeArr);
        if ($key !== false) {
            array_splice($typeArr, $key, 1);
        }
        $type = join(",", $typeArr);

        if (!empty($type)) {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__house_notice` WHERE `action` = '$act' AND `phone` = '$phone' AND `aid` = '$aid'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                //如果订阅类型为空（只订阅了看房团的情况），删除数据表中的这条信息
                if (empty($type)) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `id` = " . $ret[0]['id']);
                    $dsql->dsqlOper($sql, "update");
                } //如果订阅的手机号码已经存在，判断订阅类型是否有变化，如果有变化，则更新
                elseif ($ret[0]['type'] != $type) {
                    $sql = $dsql->SetQuery("UPDATE `#@__house_notice` SET `type` = '$type' WHERE `action` = '$act' AND `phone` = '$phone' AND `sex` = $sex AND `aid` = '$aid'");
                    $dsql->dsqlOper($sql, "update");
                    //如果已经订阅过，给出提示
                } else {
                    return array("state" => 200, "info" => '您已经订阅过该房源信息！');
                }
            } else {
                //如果不存在，新增一条记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__house_notice` (`action`, `aid`, `uid`, `type`, `name`, `phone`, `pubdate`, `sex`) VALUES ('$act', '$aid', '$uid', '$type', '$name', '$phone', '$pubdate', $sex)");
                $dsql->dsqlOper($sql, "update");
            }
        }

        //消息提醒
        $param = array(
            "service"  => "house",
            "template" => "loupan-detail",
            "id"       => $aid
        );

        //查询帐户信息
        if ($uid != -1) {
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = " . $uid);
            $ret      = $dsql->dsqlOper($sql, "results");
            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
        } else {
            $username = $name;
        }

        //查询楼盘信息
        $sql    = $dsql->SetQuery("SELECT `title` FROM `#@__house_loupan` WHERE `id` = " . $aid);
        $ret    = $dsql->dsqlOper($sql, "results");
        $loupan = $ret[0]['title'];

        if ($uid != -1) {

            //自定义配置
            $data = array(
                "username" => $username,
                "loupan"   => $loupan,
                "date"     => date("Y-m-d H:i:s", time()),
                "fields"   => array(
                    'keyword1' => '预约楼盘',
                    'keyword2' => '预约人',
                    'keyword3' => '预约时间'
                )
            );

            updateMemberNotice($uid, "房产-订阅消息提醒", $param, $data, $phone);
        } else {
            sendsms($phone, 1, "", "", false, false, "房产-订阅消息提醒", array("username" => $username, "loupan" => $loupan, "url" => getUrlPath($param)));
        }

        return "订阅成功！";

    }


    /**
     * 房产评论
     * @return array
     */
    public function common()
    {
        global $dsql;
        $pageinfo = $list = array();
        $action   = $aid = $page = $pageSize = $where = "";
        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $aid      = $this->param['aid'];
            $order    = $this->param['order'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where1 = ' AND c.`ischeck` = 1';
        if ($aid) {
            $where1 .= " AND c.`aid` = " . $aid;
        }

        if ($order) {
            $orderby = " ORDER BY c.`dtime` DESC";
        }

        if ($order) {
            $orderby = " ORDER BY `dtime` DESC";
        }

        $archives = $dsql->SetQuery("SELECT c.`id`, c.`aid`,c.`floor`, c.`userid`, c.`content`, c.`pics`,c.`dtime`, c.`ip`, c.`ipaddr`, c.`good`,c. `bad`,c.`reply`,c.`replydate`,c.`isanony` FROM `#@__housecommon` c LEFT JOIN `#@__house_releaseschool` s ON c.`aid` = s.`id` WHERE 1 = 1" . $where1 . " AND s.`state` = 1");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $orderby . $where, "results");
        $picsarr = array();
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['aid']    = $val['aid'];
                $list[$key]['floor']  = $val['floor'];
                $list[$key]['userid'] = $val['userid'];

                if ($val['pics'] != '') {
                    $pics = explode(",", $val['pics']);
                    if ($pics) {
                        for ($i = 0; $i < count($pics); $i++) {
                            $picsarr[$i]['picspath'] = getFilepath($pics[$i]);
                            $picsarr[$i]['pics']     = $pics[$i];
                        }
                    }
                }
                $list[$key]['picsarr'] = $picsarr;
                $usersql               = $dsql->SetQuery("SELECT `username`,`photo` FROM `#@__member` WHERE  `id` = " . $val['userid']);

                $userres = $dsql->dsqlOper($usersql, "results");

                $schoolsql = $dsql->SetQuery("SELECT `title` FROM `#@__house_releaseschool` WHERE `id` = " . $val['aid']);

                $schoolres = $dsql->dsqlOper($schoolsql, "results");

                $list[$key]['school']    = $schoolres[0]['title'];
                $list[$key]['username']  = $val['isanony'] == 0 ? $userres[0]['username'] : "匿名用户";
                $list[$key]['photo']     = $val['isanony'] == 0 ? getFilePath($userres[0]['photo']) : "";
                $list[$key]['content']   = $val['content'];
                $list[$key]['dtime']     = FloorTime(GetMkTime(time()) - $val['dtime']);
                $list[$key]['replydate'] = FloorTime(GetMkTime(time()) - $val['replydate']);
                $list[$key]['reply']     = $val['reply'];
                $list[$key]['ip']        = $val['ip'];
                $list[$key]['isanony']   = $val['isanony'];
                $list[$key]['ipaddr']    = $val['ipaddr'];
                $list[$key]['iphome']    = getIpHome($val['ipaddr']);
                $list[$key]['good']      = $val['good'];
                $list[$key]['bad']       = $val['bad'];
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 发表评论
     * @return array
     */
    public function sendCommon()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $aid     = $param['aid'];
        $content = $param['content'];
        $pics    = $param['pics'];
        $isanony = (int)$param['isanony'];

        $userid = $userLogin->getMemberID();
        if ($userid < 1) {
            return array("state" => 200, "info" => '登录超时！');
        }
        if (empty($aid) || empty($userid) || empty($content)) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__housecommon`");
        $count    = $dsql->dsqlOper($archives, "totalCount");

        $archives = $dsql->SetQuery("INSERT INTO `#@__housecommon` (`action`, `aid`, `floor`, `userid`, `content`,`pics` ,`isanony`,`dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`) VALUES ('$action', '$aid', '$count', '$userid', '$content','$pics','$isanony','" . GetMkTime(time()) . "', '" . GetIP() . "', '" . getIpAddr(GetIP()) . "', 0, 0, 0)");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "评论成功！";
        } else {
            return array("state" => 200, "info" => '评论失败！');
        }

    }


    /**
     * 二手房列表
     * @return array
     */
    public function saleList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo  = $list = array();
        $community = $zj = $addrid = $subway = $station = $max_longitude = $min_longitude = $max_latitude = $min_latitude = $price = $room = $area = $keywords = $buildage = $protype = $floor = $type = $direction = $zhuangxiu = $orderby = $flags = $times = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

        $loginUid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $community     = $this->param['community'];
                $zj            = $this->param['zj'];
                $comid         = $this->param['comid'];
                $addrid        = (int)$this->param['addrid'];
                $subway        = $this->param['subway'];
                $station       = $this->param['station'];
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
                $price         = convertArrToStrWithComma($this->param['price']);
                $room          = $this->param['room'];
                $area          = $this->param['area'];
                $keywords      = $this->param['keywords'];
                $buildage      = $this->param['buildage'];
                $protype       = $this->param['protype'];
                $floor         = $this->param['floor'];
                $type          = $this->param['type'];
                $direction     = $this->param['direction'];
                $zhuangxiu     = $this->param['zhuangxiu'];
                $orderby       = $this->param['orderby'];
                $flags         = $this->param['flags'];
                $times         = $this->param['times'];
                $u             = $this->param['u'];
                $school        = $this->param['school'];
                $schoolid      = $this->param['schoolid'];
                $uid           = $this->param['uid'];
                $state         = $this->param['state'];
                $qj            = (int)$this->param['qj'];
                $video         = (int)$this->param['video'];
                $page          = $this->param['page'];
                $pageSize      = $this->param['pageSize'];
                $backTotal     = (int)$this->param['backTotal'];
                $nolimit       = (int)$this->param['nolimit'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔

            }
        }
        $teachaddrva = array();
        //是否输出当前登录会员的信息
        $zj_state = "";
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND s.`cityid` in (" . $cityid . ")";
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
            $zj_state = " AND z.`state` = 1";
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }


            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        if ($school == 1) {
            $schoolsql = $dsql->SetQuery("SELECT `teachaddr`,`lng`,`lat` FROM `#@__house_releaseschool` WHERE `id` = " . $schoolid);
            $schoolres = $dsql->dsqlOper($schoolsql, "results");
            if ($schoolres) {
                $teachaddr = json_decode($schoolres[0]['teachaddr'], true);

                // if($teachaddr){
                //     $points  = array_column($teachaddr,"points");
                //     if($points){
                //         for ($i=0; $i < count($points); $i++){
                //             $pitem = explode('|',$points[$i]);
                //             for($a = 0; $a < count($pitem); $a++){
                //                 $pitemarr =  explode(',',$pitem[$a]);
                //                 array_push($teachaddrva,$pitemarr);
                //             }
                //         }
                //     }
                // }

                $lng = $schoolres[0]['lng'];
                $lat = $schoolres[0]['lat'];

                if($lng && $lat){
                    $cwhere .= " AND ROUND(
                        6378.138 * 2 * ASIN(
                            SQRT(POW(SIN((" . $lat . " * PI() / 180 - `latitude` * PI() / 180) / 2), 2) + COS(" . $lat . " * PI() / 180) * COS(`latitude` * PI() / 180) * POW(SIN((" . $lng . " * PI() / 180 - `longitude` * PI() / 180) / 2), 2))
                        ) * 1000
                    ) < 5000";
                }else{
                    $cwhere .= " AND 1 = 2";
                }

                $archives     = $dsql->SetQuery("SELECT `id`,`longitude`,`latitude` FROM `#@__house_community` WHERE 1 = 1" . $cwhere);
                $communityarr = $dsql->dsqlOper($archives, "results");
                if ($communityarr) {
                    foreach ($communityarr as $k => $v) {
                        $isonarr   = array();
                        $lnglat[0] = $v['longitude'];
                        $lnglat[1] = $v['latitude'];
                        if ($teachaddr) {
                            $points = array_column($teachaddr, "points");
                            if ($points) {
                                for ($i = 0; $i < count($points); $i++) {
                                    $pitem = explode('|', $points[$i]);
                                    for ($a = 0; $a < count($pitem); $a++) {
                                        $pitemarr = explode(',', $pitem[$a]);
                                        array_push($teachaddrva, array("lng" => $pitemarr[0], "lat" => $pitemarr[1]));
                                    }

                                    $ison = is_point_in_polygon(array("lng" => $lnglat[0], "lat" => $lnglat[1]), $teachaddrva);
                                    if ($ison) {
                                        $ison = 1;
                                    } else {
                                        $ison = 0;
                                    }
                                    array_push($isonarr, $ison);
                                }
                            }
                        }

                        if (!in_array('1', $isonarr)) {
                            unset($communityarr[$k]);
                        }
                        //判断学校施教返回有没有当前的小区
                        // $ison = $this->isPointInPolygon($teachaddrva, $lnglat);
                        // if ($ison < 1) {
                        //     unset($communityarr[$k]);
                        // }
                    }
                    $cidarr = array_column($communityarr, "id");
                    if ($cidarr) {
                        $cid   = implode(',', $cidarr);
                        $where .= " AND s.`communityid` in (" . $cid . ")";
                    } else {
                        return array("state" => 200, "info" => '暂无数据！');
                    }
                } else {

                    return array("state" => 200, "info" => '暂无数据！');
                }
            }
        }

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        //小区
        if (!empty($community)) {
            $where .= " AND s.`communityid` = " . $community;
        }


        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }

        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` in ($lower)");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                //有结果
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND (s.`communityid` in ($ids) OR s.`addrid` in ($lower))";
                    //无结果
                } else {
                    $where .= " AND s.`addrid` in ($lower)";
                }
                //无结果
            } else {
                $where .= " AND s.`addrid` in ($lower)";
            }
        }

        //遍历地铁
        if (!empty($station)) {

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND FIND_IN_SET ($station, `subway`)");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                //有结果
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND s.`communityid` in ($ids)";
                    //无结果
                } else {
                    $where .= " AND 1 = 2";
                }
                //无结果
            } else {
                $where .= " AND 1 = 2";
            }

            //如果站点为空，线路不为空，则先查询出线路的站点再验证
        } elseif (!empty($subway)) {

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_subway_station` WHERE `sid` = $subway ORDER BY `weight`");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $subway = array();
                foreach ($res as $key => $value) {
                    $subway[] = "FIND_IN_SET (" . $value['id'] . ", `subway`)";
                }

                //查询小区信息
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (" . join(" OR ", $subway) . ")");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $ids = array();
                    foreach ($results as $loupan) {
                        $ids[] = $loupan["id"];
                    }
                    //有结果
                    if (!empty($ids)) {
                        $ids   = join(",", $ids);
                        $where .= " AND s.`communityid` in ($ids)";
                        //无结果
                    } else {
                        $where .= " AND 1 = 2";
                    }
                    //无结果
                } else {
                    $where .= " AND 1 = 2";
                }

                //无结果
            } else {
                $where .= " AND 1 = 2";
            }

        }

        //地图可视区域内
        if (!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `longitude` <= '" . $max_longitude . "' AND `longitude` >= '" . $min_longitude . "' AND `latitude` <= '" . $max_latitude . "' AND `latitude` >= '" . $min_latitude . "'");
            $ret = $dsql->dsqlOper($sql, "results");

            $cids = array();
            if ($ret) {
                foreach ($ret as $key => $value) {
                    $cids[$key] = $value['id'];
                }
            }

            if ($cids) {
                $cids  = join(",", $cids);
                $where .= " AND s.`communityid` in ($cids)";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND s.`price` < " . $price[1];
            } elseif (empty($price[1])) {
                $where .= " AND s.`price` > " . $price[0];
            } else {
                $where .= " AND s.`price` BETWEEN " . $price[0] . " AND " . $price[1];
            }
        }

        //房型
        if ($room != "") {
            if ($room == 0) {
                $where .= " AND s.`room` > 5";
            } else {
                $where .= " AND s.`room` = " . $room;
            }
        }

        //面积
        if ($area != "") {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . (int)$area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . (int)$area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . (int)$area[0] . " AND " . (int)$area[1];
            }
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`community` like '%" . $keywords . "%'";

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (`title` like '%" . $keywords . "%' OR `addr` like '%" . $keywords . "%')");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $community) {
                    $ids[] = $community["id"];
                }
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " OR s.`communityid` in ($ids)";
                }
            }
            $where .= ")";
        }

        //建筑年代
        if ($buildage != "") {
            $buildage = explode(",", $buildage);
            if (empty($buildage[0])) {
                $where .= " AND s.`buildage` < " . $buildage[1];
            } elseif (empty($buildage[1])) {
                $where .= " AND s.`buildage` > " . $buildage[0];
            } else {
                $where .= " AND s.`buildage` BETWEEN " . $buildage[0] . " AND " . $buildage[1];
            }
        }

        //物业类型
        if ($protype != "") {
            $where .= " AND s.`protype` = " . $protype;
        }

        //楼层
        if ($floor != "") {
            $floor = explode(",", $floor);
            if (empty($floor[0])) {
                $where .= " AND s.`bno` < " . $floor[1];
            } elseif (empty($floor[1])) {
                $where .= " AND s.`bno` > " . $floor[0];
            } else {
                $where .= " AND s.`bno` BETWEEN " . $floor[0] . " AND " . $floor[1];
            }
        }

        //性质
        if (!empty($type)) {
            $type  = $type == 1 ? 0 : 1;
            $where .= " AND s.`usertype` = " . $type;
        }

        //朝向
        if (!empty($direction)) {
            $where .= " AND s.`direction` = $direction";
        }

        //装修
        if (!empty($zhuangxiu)) {
            $where .= " AND s.`zhuangxiu` = $zhuangxiu";
        }

        //属性
        if ($flags != "") {
            $flag    = array();
            $flagArr = explode(",", $flags);
            foreach ($flagArr as $key => $value) {
                $flag[$key] = "FIND_IN_SET(" . $value . ", s.`flag`)";
            }
            $where .= " AND " . join(" AND ", $flag);
        }

        //时间筛选
        if (!empty($times)) {

            if ($times == "today") {
                $today = GetMkTime(date("Y-m-d"));
                $where .= " AND s.`pubdate` > " . $today;
            } elseif (strstr($times, "day")) {
                $times = str_replace("day", "", $times);
                $times = GetMkTime(date("Y-m-d", strtotime($times . " day")));
                $where .= " AND s.`pubdate` > " . $times;
            } elseif (strstr($times, "week")) {
                $times = str_replace("week", "", $times);
                $times = GetMkTime(date("Y-m-d", strtotime($times . " week")));
                $where .= " AND s.`pubdate` > " . $times;
            } elseif (strstr($times, "month")) {
                $times = str_replace("month", "", $times);
                $times = GetMkTime(date("Y-m-d", strtotime($times . " month")));
                $where .= " AND s.`pubdate` > " . $times;
            } elseif (strstr($times, "year")) {
                $times = str_replace("year", "", $times);
                $times = GetMkTime(date("Y-m-d", strtotime($times . " year")));
                $where .= " AND s.`pubdate` > " . $times;
            }

        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格降序
            } elseif ($orderby == 5) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价升序
            } elseif ($orderby == 6) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`unitprice` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价降序
            } elseif ($orderby == 7) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`unitprice` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //点击
            } elseif ($orderby == "click") {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`title`, s.`communityid`, s.`community`, s.`addrid`, s.`address`, s.`litpic`, s.`price`, s.`unitprice`, s.`protype`, s.`room`, s.`hall`, s.`guard`, s.`floortype`, s.`floorspr`, s.`bno`, s.`floor`, s.`buildage`, s.`area`, s.`flag`, s.`state`, s.`sellstate`, s.`direction`, s.`zhuangxiu`, s.`flag`, s.`pubdate`, s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`usertype`, s.`username`, s.`areaCode`, s.`contact`, s.`userid`, s.`video`, s.`qj_file`, s.`qj_type`, s.`elevator`, s.`rights_to`, s.`click` " .
            "FROM `#@__house_sale` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid`" .
            "WHERE (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`" . $zj_state . "))" . $where);

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $totalCount = getCache("house_sale_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));

        if ($backTotal) return $totalCount;

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = $pageSize != -1 ? " LIMIT $atpage, $pageSize" : "";
        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_sale_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));

        if ($results) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']       = $val['id'];
                $list[$key]['title']    = $val['title'];
                $list[$key]['username'] = $val['username'];
                $list[$key]['contact']  = $val['contact'];
                $list[$key]['rights_to']  = $val['rights_to'];
                $list[$key]['click']  = (int)$val['click'];

                //会员信息
                $nickname = $val['username'];
                $userPhone = addAreaCodePrefix($val['areaCode'], $val['contact']);
                $sale_userInfo = $userLogin->getMemberInfo($val['userid'], 1);
                if(is_array($sale_userInfo)){
                    $userPhoto = $sale_userInfo['photo'];
                    if ($val['usertype'] == 1 && $val['userid'] > 0) {
                        $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                        $member   = $dsql->dsqlOper($archives, "results");
                        if ($member) {
                            $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                            $userPhoto = getFilePath($member[0]['photo']);
                            $userPhone = $val['contact'] ? $val['contact'] : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                        } else {
                            $nickname  = "";
                            $userPhoto = "";
                            $userPhone = "";
                        }
                    }
                }
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['nickname']  = $nickname;
                $list[$key]['userPhoto'] = $userPhoto;

                $list[$key]['contact']   = !empty($val['contact']) ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;
                $list[$key]['userPhone'] = $userPhone;

                //小区
                $url                       = "";
                $list[$key]["communityid"] = $val["communityid"];
                if ($val['communityid'] == 0) {
                    $list[$key]["community"] = $val["community"];
                    $addrName                = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['addr']    = $addrName;
                    $list[$key]['addrid']  = $val['addrid'];
                    $list[$key]["address"] = $val["address"];
                    $list[$key]["opendate"] = '';
                    $list[$key]["kfs"] = '';
                    $list[$key]["property"] = '';
                    $list[$key]["rongji"] = '';
                    $list[$key]["green"] = '';
                    $list[$key]["school"] = array();
                } else {
                    $communitySql    = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `addr`, `opendate`, `kfs`, `property`, `rongji`, `green` FROM `#@__house_community` WHERE `id` = " . $val["communityid"]);
                    $communityResult = $dsql->getTypeName($communitySql);
                    if (!is_array($communityResult)) {
                        $list[$key]["community"] = "";
                        $list[$key]['addr']      = array();
                        $list[$key]["addrid"]    = 0;
                        $list[$key]["address"]   = "";
                        $list[$key]["opendate"] = '';
                        $list[$key]["kfs"] = '';
                        $list[$key]["property"] = '';
                        $list[$key]["rongji"] = '';
                        $list[$key]["green"] = '';
                        $list[$key]["school"] = array();
                    } else {
                        $list[$key]["community"] = $communityResult[0]["title"];
                        $addrName                = getParentArr("site_area", $communityResult[0]['addrid']);
                        global $data;
                        $data                  = "";
                        $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                        $list[$key]['addr']    = $addrName;
                        $list[$key]["addrid"]  = $communityResult[0]["addrid"];
                        $list[$key]["address"] = $communityResult[0]["addr"];
                        $list[$key]["opendate"] = $communityResult[0]["opendate"];
                        $list[$key]["kfs"] = $communityResult[0]["kfs"];
                        $list[$key]["property"] = $communityResult[0]["property"];
                        $list[$key]["rongji"] = $communityResult[0]["rongji"];
                        $list[$key]["green"] = $communityResult[0]["green"];

                        $param = array(
                            "service"  => "house",
                            "template" => "community-detail",
                            "id"       => $val['communityid']
                        );
                        $url   = getUrlPath($param);

                        $this->param = array(
                            'sid' => $val["communityid"],
                            'pageSize' => 1000
                        );
                        $schoolList = $this->schoolList();
                        $list[$key]["school"] = $schoolList && !isset($schoolList['state']) ? $schoolList['list'] : array();
                    }
                }

                $list[$key]['communityUrl'] = $url;

                // 图集数量
                $sqlPics = $dsql->SetQuery("SELECT count(`id`) AS count FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $val['id']);
                $retPics = $dsql->dsqlOper($sqlPics, "results");
                if ($retPics) {
                    $list[$key]['pics'] = $retPics[0]['count'];
                } else {
                    $list[$key]['pics'] = 0;
                }
                $list[$key]['litpic']    = getFilePath($val['litpic']);
                $list[$key]['price']     = $val['price'];
                $list[$key]['unitprice'] = $val['unitprice'];

                //物业类型
                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }
                $list[$key]['protype'] = join(",", $protypeArr);

                //朝向
                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['direction']);
                $typename                = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['direction']));
                $list[$key]['direction'] = $typename;

                //装修
                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['zhuangxiu']);
                $typename                = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['zhuangxiu']));
                $list[$key]['zhuangxiu'] = $typename;

                $list[$key]['room']     = $val['room'] . "室" . $val['hall'] . "厅" . $val['guard'] . "卫";
                $list[$key]['bno'] = getFloorHeight($val['bno'], $val['floor']);
                $list[$key]['floor']    = $val['floor'];
                $list[$key]['buildage'] = $val['buildage'];
                $list[$key]['floortype'] = $val['floortype'];
                $list[$key]['floorspr'] = $val['floorspr'];
                $list[$key]['area']     = $val['area'];
                $list[$key]['flag']     = $val['flag'];
                $list[$key]['pubdate']  = $val['pubdate'];

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid'] = $isbid;

                $list[$key]['usertype'] = $val['usertype'];

                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                //属性
                $list[$key]['flag'] = $val['flag'];
                $flags              = explode(",", $val['flag']);
                $flagArr            = array();
                foreach ($flags as $k => $v) {
                    if ($v == 0) {
                        array_push($flagArr, "急售");
                    } elseif ($v == 1) {
                        array_push($flagArr, "免税");
                    } elseif ($v == 2) {
                        array_push($flagArr, "地铁");
                    } elseif ($v == 3) {
                        array_push($flagArr, "校区房");
                    } elseif ($v == 4) {
                        array_push($flagArr, "满五年");
                    } elseif ($v == 5) {
                        array_push($flagArr, "推荐");
                    }
                }
                $list[$key]['flags'] = $flagArr;

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] == $val['video'] ? 1 : 0;
                $list[$key]['qj']        = $qj;
                $list[$key]['elevator']  = $val['elevator'];
                $list[$key]['sellstate'] = $val['sellstate'];


                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                //图集数量
                $archives               = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $val['id']);
                $imgCount               = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['imgCount'] = $imgCount;

                $param             = array(
                    "service"  => "house",
                    "template" => "sale-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $collect = "";
                if ($loginUid != -1) {
                    //验证是否已经收藏
                    $params  = array(
                        "module" => "house",
                        "temp"   => "sale_detail",
                        "type"   => "add",
                        "id"     => $val['id'],
                        "check"  => 1
                    );
                    $collect = checkIsCollect($params);
                }
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 区域二手房统计
     *
     * @return array
     */
    public function saleDistrict()
    {
        global $dsql;
        $price         = convertArrToStrWithComma($this->param['price']);
        $area          = $this->param['area'];
        $keywords      = $this->param['keywords'];
        $room          = $this->param['room'];
        $direction     = $this->param['direction'];
        $buildage      = $this->param['buildage'];
        $floor         = $this->param['floor'];
        $zhuangxiu     = $this->param['zhuangxiu'];
        $flags         = $this->param['flags'];
        $bizcircle     = $this->param['bizcircle'];  //统计二级区域数据
        $community     = $this->param['community'];  //统计可视范围内小区数据
        $min_latitude  = $this->param['min_latitude'];
        $max_latitude  = $this->param['max_latitude'];
        $min_longitude = $this->param['min_longitude'];
        $max_longitude = $this->param['max_longitude'];
        $cityid        = $this->param['cityid'];

        if (empty($cityid)) {
            $cityid = getCityId();
        }

        $data = array();
        $bc   = 0;

        $where = " AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND s.`price` < " . $price[1];
            } elseif (empty($price[1])) {
                $where .= " AND s.`price` > " . $price[0];
            } else {
                $where .= " AND s.`price` BETWEEN " . $price[0] . " AND " . $price[1];
            }
        }

        //房型
        if ($room != "") {
            if ($room == 0) {
                $where .= " AND s.`room` > 5";
            } else {
                $where .= " AND s.`room` = " . $room;
            }
        }

        //面积
        if ($area != "") {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . $area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . $area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //关键字
        if (!empty($keywords)) {
            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`community` like '%" . $keywords . "%'";

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (`title` like '%" . $keywords . "%' OR `addr` like '%" . $keywords . "%')");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $comm) {
                    $ids[] = $comm["id"];
                }
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " OR s.`communityid` in ($ids)";
                }
            }

            $where .= ")";
        }

        //建筑年代
        if ($buildage != "") {
            $buildage = explode(",", $buildage);
            if (empty($buildage[0])) {
                $where .= " AND s.`buildage` < " . $buildage[1];
            } elseif (empty($price[1])) {
                $where .= " AND s.`buildage` > " . $buildage[0];
            } else {
                $where .= " AND s.`buildage` BETWEEN " . $buildage[0] . " AND " . $buildage[1];
            }
        }

        //物业类型
        if ($protype != "") {
            $where .= " AND s.`protype` = " . $protype;
        }

        //楼层
        if ($floor != "") {
            $floor = explode(",", $floor);
            if (empty($floor[0])) {
                $where .= " AND s.`bno` < " . $floor[1];
            } elseif (empty($floor[1])) {
                $where .= " AND s.`bno` > " . $floor[0];
            } else {
                $where .= " AND s.`bno` BETWEEN " . $floor[0] . " AND " . $floor[1];
            }
        }

        //朝向
        if (!empty($direction)) {
            $where .= " AND s.`direction` = $direction";
        }

        //装修
        if (!empty($zhuangxiu)) {
            $where .= " AND s.`zhuangxiu` = $zhuangxiu";
        }

        //属性
        if ($flags != "") {
            $flag    = array();
            $flagArr = explode(",", $flags);
            foreach ($flagArr as $key => $value) {
                $flag[$key] = "FIND_IN_SET(" . $value . ", s.`flag`)";
            }
            $where .= " AND " . join(" AND ", $flag);
        }


        //只统计区域内的小区数据
        if ($community == 1) {

            $sql = $dsql->SetQuery("SELECT `id`, `title`, `longitude`, `latitude` FROM `#@__house_community` WHERE `state` = 1 AND `longitude` <= '" . $max_longitude . "' AND `longitude` >= '" . $min_longitude . "' AND `latitude` <= '" . $max_latitude . "' AND `latitude` >= '" . $min_latitude . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                foreach ($ret as $key => $value) {
                    $nwhere = $where . " AND s.`communityid` = " . $value['id'];

                    $count   = $price = $unitprice = 0;
                    $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price, AVG(s.`unitprice`) unitprice FROM `#@__house_sale` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                    $saleRet = $dsql->dsqlOper($saleSql, "results");
                    if ($saleRet) {
                        $count     = $saleRet[0]['count'];
                        $price     = sprintf("%.2f", $saleRet[0]['price']);
                        $unitprice = sprintf("%.2f", $saleRet[0]['unitprice']);
                    }

                    if ($count > 0) {
                        $data[$bc]['id']        = $value['id'];
                        $data[$bc]['title']     = $value['title'];
                        $data[$bc]['longitude'] = $value['longitude'];
                        $data[$bc]['latitude']  = $value['latitude'];
                        $data[$bc]['count']     = $count;
                        $data[$bc]['price']     = $price;
                        $data[$bc]['unitprice'] = $unitprice;

                        if (isMobile()) {
                            $param = array(
                                "service"  => "house",
                                "template" => "sale",
                                "param"    => "community=" . $value['id']
                            );
                        } else {
                            $param = array(
                                "service"  => "house",
                                "template" => "community-sale",
                                "id"       => $value['id']
                            );
                        }
                        $data[$bc]['url'] = getUrlPath($param);
                        $bc++;
                    }
                }

            }


            //区域数据
        } else {

            //所有一级区域
            $sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = $cityid ORDER BY `weight`");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $kk = 0;
                foreach ($ret as $key => $value) {

                    //单独请求二级区域数据
                    if ($bizcircle == 1) {

                        $addrSql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = " . $value['id'] . " OR `id` = " . $value['id'] . " ORDER BY `weight`");
                        $addrRet = $dsql->dsqlOper($addrSql, "results");
                        foreach ($addrRet as $k => $v) {

                            $nwhere = $where;

                            //查询小区信息
                            $cid      = array();
                            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` = " . $v['id']);
                            $results  = $dsql->dsqlOper($archives, "results");
                            if ($results) {
                                foreach ($results as $loupan) {
                                    $cid[] = $loupan["id"];
                                }
                                //有结果
                                if (!empty($cid)) {
                                    $cid    = join(",", $cid);
                                    $nwhere .= " AND s.`communityid` in ($cid)";
                                    //无结果
                                } else {
                                    $nwhere .= " AND 1 = 2";
                                }
                                //无结果
                            } else {
                                $nwhere .= " AND 1 = 2";
                            }

                            $count = $price = $unitprice = 0;
                            if ($cid) {
                                $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price, AVG(s.`unitprice`) unitprice FROM `#@__house_sale` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                                $saleRet = $dsql->dsqlOper($saleSql, "results");
                                if ($saleRet) {
                                    $count     = $saleRet[0]['count'];
                                    $price     = sprintf("%.2f", $saleRet[0]['price']);
                                    $unitprice = sprintf("%.2f", $saleRet[0]['unitprice']);
                                }
                            }

                            if ($count > 0) {
                                $data[$bc]['id']        = $v['id'];
                                $data[$bc]['addrname']  = $v['typename'];
                                $data[$bc]['longitude'] = $v['longitude'];
                                $data[$bc]['latitude']  = $v['latitude'];
                                $data[$bc]['count']     = $count;
                                $data[$bc]['price']     = $price;
                                $data[$bc]['unitprice'] = $unitprice;
                                $bc++;
                            }

                        }


                        //只请求一级区域数据
                    } else {
                        $nwhere = $where;
                        $ids    = array($value['id']);

                        $addrSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_area` WHERE `parentid` = " . $value['id'] . " ORDER BY `weight`");
                        $addrRet = $dsql->dsqlOper($addrSql, "results");
                        foreach ($addrRet as $k => $v) {
                            array_push($ids, $v['id']);
                        }


                        //查询小区信息
                        $cid      = array();
                        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` in (" . join(",", $ids) . ")");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if ($results) {
                            foreach ($results as $loupan) {
                                $cid[] = $loupan["id"];
                            }
                            //有结果
                            if (!empty($cid)) {
                                $cid    = join(",", $cid);
                                $nwhere .= " AND s.`communityid` in ($cid)";
                                //无结果
                            } else {
                                $nwhere .= " AND 1 = 2";
                            }
                            //无结果
                        } else {
                            $nwhere .= " AND 1 = 2";
                        }

                        $count = $price = $unitprice = 0;

                        if ($cid) {
                            $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price, AVG(s.`unitprice`) unitprice FROM `#@__house_sale` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                            $saleRet = $dsql->dsqlOper($saleSql, "results");
                            if ($saleRet) {
                                $count     = $saleRet[0]['count'];
                                $price     = sprintf("%.2f", $saleRet[0]['price']);
                                $unitprice = sprintf("%.2f", $saleRet[0]['unitprice']);
                            }
                        }

                        if ($count > 0) {
                            $data[$kk]['id']        = $value['id'];
                            $data[$kk]['addrname']  = $value['typename'];
                            $data[$kk]['longitude'] = $value['longitude'];
                            $data[$kk]['latitude']  = $value['latitude'];
                            $data[$kk]['count']     = $count;
                            $data[$kk]['price']     = $price;
                            $data[$kk]['unitprice'] = $unitprice;
                            $kk++;
                        }

                    }

                }
            }

        }


        if ($data) {
            return $data;
        } else {
            return array("state" => 200, "info" => '暂无相关数据！');
        }

    }


    /**
     * 二手房详细
     * @return array
     */
    public function saleDetail()
    {
        global $dsql;
        global $userLogin;
        $saleDetail = array();
        $id         = $this->param;
        $id         = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        //$where = " AND s.`state` = 1";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $where = " AND s.`waitpay` = 0";

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_sale` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_sale_detail", $archives, 0, $id);
        if ($results) {
            $saleDetail["id"]    = $results[0]['id'];
            $saleDetail["title"] = $results[0]['title'];
            $sex                 = $results[0]['sex'];

            //小区
            $saleDetail["communityid"] = $results[0]["communityid"];

            $addrid                  = $results[0]['addrid'];
            $saleDetail["cityid"]    = $results[0]['cityid'];
            $saleDetail["sellstate"] = $results[0]['sellstate'];
            $saleDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];

            if ($results[0]['communityid'] == 0) {
                $saleDetail["community"] = $results[0]["community"];
                $addrName                = getParentArr("site_area", $addrid);
                global $data;
                $data                    = "";
                $addrName                = array_reverse(parent_foreach($addrName, "typename"));
                $saleDetail['addr']      = $addrName;
                $saleDetail["address"]   = $results[0]["address"];
                $saleDetail["longitude"] = $results[0]["longitude"];
                $saleDetail["latitude"]  = $results[0]["latitude"];
            } else {
                $communitySql    = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `addrid`, `addr`, `longitude`, `latitude`, `price`, `opendate`, `rongji`, `green`, `property`, `proprice`, `buildarea`, `litpic` FROM `#@__house_community` WHERE `id` = " . $results[0]["communityid"]);
                $communityResult = $dsql->getTypeName($communitySql);
                if (!$communityResult) {
                    $saleDetail["community"] = "小区不存在";
                    $saleDetail['addr']      = array();
                    $saleDetail["address"]   = "";
                    $saleDetail["longitude"] = "";
                    $saleDetail["latitude"]  = "";
                    $addrid                  = 0;
                } else {
                    $saleDetail["community"] = $communityResult[0]["title"];
                    $addrName                = getParentArr("site_area", $communityResult[0]['addrid']);
                    global $data;
                    $data                    = "";
                    $addrName                = array_reverse(parent_foreach($addrName, "typename"));
                    $saleDetail['addr']      = $addrName;
                    $saleDetail["cityid"]    = $communityResult[0]["cityid"];
                    $saleDetail["address"]   = $communityResult[0]["addr"];
                    $saleDetail["longitude"] = $communityResult[0]["longitude"];
                    $saleDetail["latitude"]  = $communityResult[0]["latitude"];
                    $addrid                  = $communityResult[0]["addrid"];

                    $community              = array();
                    $community['price']     = $communityResult[0]["price"];
                    $community['opendate']  = $communityResult[0]["opendate"];
                    $community['rongji']    = $communityResult[0]["rongji"];
                    $community['green']     = $communityResult[0]["green"];
                    $community['property']  = $communityResult[0]["property"];
                    $community['proprice']  = $communityResult[0]["proprice"];
                    $community['buildarea'] = $communityResult[0]["buildarea"];
                    $community['litpic']    = $communityResult[0]["litpic"] ? getFilePath($communityResult[0]["litpic"]) : "";

                    $this->param = array(
                        'sid' => $results[0]["communityid"],
                        'pageSize' => 1000
                    );
                    $schoolList = $this->schoolList();
                    $community["school"] = $schoolList && !isset($schoolList['state']) ? $schoolList['list'] : array();

                    $saleDetail["communityDetail"] = $community;

                }
            }

            $saleDetail["addrid"] = $addrid;


            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $phone = $certify = $flag = $zjcomName = $zjcomId = $qq = $wx = $qqQr = $wxQr = $ext_title_1 = $ext_val_1 = $ext_title_2 = $ext_val_2 = "";
            if ($userid != 0 && $userid != -1) {

                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zj.`ext_title_1`, zj.`ext_val_1`, zj.`ext_title_2`, zj.`ext_val_2` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zj.`ext_title_1`, zj.`ext_val_1`, zj.`ext_title_2`, zj.`ext_val_2`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                }

                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $certify                = $member[0]['certifyState'] == 1 ? 1 : 0;
                    $flag                   = $member[0]['flag'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";

                    $ext_title_1 = $member[0]['ext_title_1'];
                    $ext_val_1   = $member[0]['ext_val_1'];
                    $ext_title_2 = $member[0]['ext_title_2'];
                    $ext_val_2   = $member[0]['ext_val_2'];
                }

                $url = getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $userid));

                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
                $userArr['url']       = $url;
                $userArr['ext_title_1'] = $ext_title_1;
                $userArr['ext_val_1']   = $ext_val_1;
                $userArr['ext_title_2'] = $ext_title_2;
                $userArr['ext_val_2']   = $ext_val_2;
            }
            $saleDetail['user']   = $userArr;
            $saleDetail['userid'] = $results[0]['userid'];

            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $saleDetail["areaid"] = $areaid;

            $param                      = array(
                "service"  => "house",
                "template" => "community-detail",
                "id"       => $results[0]['communityid']
            );
            $saleDetail['communityUrl'] = getUrlPath($param);

            $saleDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $saleDetail["litpicSource"] = $results[0]['litpic'];
            $saleDetail["price"]        = $results[0]['price'];
            $saleDetail["unitprice"]    = $results[0]['unitprice'];

            $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['protype']);
            $protype                 = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['protype']));
            $saleDetail["protype"]   = $protype;
            $saleDetail["protypeid"] = $results[0]['protype'];

            $saleDetail["room"]  = $results[0]['room'];
            $saleDetail["hall"]  = $results[0]['hall'];
            $saleDetail["guard"] = $results[0]['guard'];

            global $do;
            global $oper;
            if($do == 'edit' && $oper == 'user'){
                $saleDetail["bno"]   = $results[0]['bno'];
            }else{
                $saleDetail["bno"]   = getFloorHeight($results[0]['bno'], $results[0]['floor']);
            }
            $saleDetail["floor"] = $results[0]['floor'];
            $saleDetail["area"]  = $results[0]['area'];

            $houseitem                 = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['direction']);
            $direction                 = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['direction']));
            $saleDetail["direction"]   = $direction;
            $saleDetail["directionid"] = $results[0]['direction'];

            $houseitem                 = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['zhuangxiu']);
            $zhuangxiu                 = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['zhuangxiu']));
            $saleDetail["zhuangxiu"]   = $zhuangxiu;
            $saleDetail["zhuangxiuid"] = $results[0]['zhuangxiu'];

            $saleDetail["buildage"] = $results[0]['buildage'];
            $saleDetail["usertype"] = $results[0]['usertype'];

            $saleDetail["username"] = $results[0]['username'];
            $saleDetail["areaCode"] = $results[0]['areaCode'];
            $saleDetail["contact"]  = $results[0]['contact'];
            $saleDetail["showMobile"]  = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);
            

            // $saleDetail["userid"]   = $results[0]['userid'];
            // $saleDetail["username"] = $results[0]['username'];
            // $saleDetail["contact"]  = $results[0]['contact'];
            $saleDetail["note"]    = nl2br($results[0]['note']);
            $saleDetail["mbody"]   = nl2br($results[0]['mbody']);
            $saleDetail["pubdate"] = $results[0]['pubdate'];

            //属性
            $saleDetail['flag'] = $results[0]['flag'];
            $flags              = explode(",", $results[0]['flag']);
            $flagArr            = array();
            foreach ($flags as $k => $v) {
                if ($v == 0) {
                    array_push($flagArr, "急售");
                } elseif ($v == 1) {
                    array_push($flagArr, "免税");
                } elseif ($v == 2) {
                    array_push($flagArr, "地铁");
                } elseif ($v == 3) {
                    array_push($flagArr, "校区房");
                } elseif ($v == 4) {
                    array_push($flagArr, "满五年");
                } elseif ($v == 5) {
                    array_push($flagArr, "推荐");
                }
            }
            $saleDetail['flags'] = $flagArr;

            // 视频全景
            $saleDetail['videoSource'] = $results[0]['video'];
            $saleDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $saleDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $saleDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $saleDetail['qj_fileArr'] = $fileArr;
            }

            $saleDetail['elevator'] = $results[0]['elevator'];

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }


            $saleDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params                = array(
                "module" => "house",
                "temp"   => "sale_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect               = checkIsCollect($params);
            $saleDetail['collect'] = $collect == "has" ? 1 : 0;
            $saleDetail['click']   = $results[0]['click'];

            global $do;
            global $oper;
            if($do == 'edit' && $oper == 'user'){
                $saleDetail["buildpos"]    = $results[0]['buildpos'];
                $saleDetail["buildposArr"] = $results[0]['buildpos'] ? explode('||', $results[0]['buildpos']) : array('', '', '');
                $saleDetail["floorspr"]    = $results[0]['floorspr'];
                $saleDetail["floortype"]   = $results[0]['floortype'];
            }else{
                $saleDetail["floortype"]   = 0;
            }
            $saleDetail["paytax"]      = $results[0]['paytax'];
            $saleDetail["rights_to"]   = $results[0]['rights_to'];
            $saleDetail["sex"]         = (int)$sex;
            $saleDetail["wx_tel"]      = $results[0]['wx_tel'];
            $saleDetail["sourceid"]    = $results[0]['sourceid'];
            $saleDetail["state"]       = $results[0]['state'];

        }
        return $saleDetail;
    }


    /**
     * 出租房列表
     * @return array
     */
    public function zuList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo  = $list = array();
        $community = $zj = $addrid = $subway = $station = $max_longitude = $min_longitude = $max_latitude = $min_latitude = $price = $room = $keywords = $protype = $zhuangxiu = $rentype = $type = $u = $uid = $state = $orderby = $page = $pageSize = $where = $where1 = "";

        $loginUid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $community     = (int)$this->param['community'];
                $zj            = (int)$this->param['zj'];
                $comid         = (int)$this->param['comid'];
                $addrid        = (int)$this->param['addrid'];
                $subway        = (int)$this->param['subway'];
                $station       = (int)$this->param['station'];
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
                $price         = convertArrToStrWithComma($this->param['price']);
                $room          = (int)$this->param['room'];
                $keywords      = $this->param['keywords'];
                $protype       = (int)$this->param['protype'];
                $zhuangxiu     = (int)$this->param['zhuangxiu'];
                $rentype       = (int)$this->param['rentype'];
                $type          = (int)$this->param['type'];
                $u             = (int)$this->param['u'];
                $uid           = (int)$this->param['uid'];
                $state         = $this->param['state'];
                $orderby       = $this->param['orderby'];
                $page          = (int)$this->param['page'];
                $pageSize      = (int)$this->param['pageSize'];
                $lng           = $this->param['lng'];
                $lat           = $this->param['lat'];
                $not           = $this->param['not'];
                $backTotal     = $this->param['backTotal'];
                $qj            = (int)$this->param['qj'];
                $video         = (int)$this->param['video'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }
        if ($orderby == "juli") {
            if (empty($lng) || empty($lat)) $orderby = 0;
        }
        if ($not) {
            $where .= " AND s.`id` NOT IN (" . $not . ")";
        }

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        //是否输出当前登录会员的信息
        $zj_state = "";
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    //$where .= " AND s.`cityid` = ".$cityid;
                    $where .= " AND s.`cityid` in (" . $cityid . ")";
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
            $zj_state = " AND z.`state` = 1";
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }

            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        //小区
        if (!empty($community)) {
            $where .= " AND s.`communityid` = " . $community;
        }

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }
        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` in ($lower)");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                //有结果
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND (s.`communityid` in ($ids) OR s.`addrid` in ($lower))";
                    //无结果
                } else {
                    $where .= " AND s.`addrid` in ($lower)";
                }
                //无结果
            } else {
                $where .= " AND s.`addrid` in ($lower)";
            }

        }


        //遍历地铁
        if (!empty($station)) {

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND FIND_IN_SET ($station, `subway`)");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $loupan) {
                    $ids[] = $loupan["id"];
                }
                //有结果
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " AND s.`communityid` in ($ids)";
                    //无结果
                } else {
                    $where .= " AND 1 = 2";
                }
                //无结果
            } else {
                $where .= " AND 1 = 2";
            }

            //如果站点为空，线路不为空，则先查询出线路的站点再验证
        } elseif (!empty($subway)) {

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_subway_station` WHERE `sid` = $subway ORDER BY `weight`");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $subway = array();
                foreach ($res as $key => $value) {
                    $subway[] = "FIND_IN_SET (" . $value['id'] . ", `subway`)";
                }

                //查询小区信息
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (" . join(" OR ", $subway) . ")");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $ids = array();
                    foreach ($results as $loupan) {
                        $ids[] = $loupan["id"];
                    }
                    //有结果
                    if (!empty($ids)) {
                        $ids   = join(",", $ids);
                        $where .= " AND s.`communityid` in ($ids)";
                        //无结果
                    } else {
                        $where .= " AND 1 = 2";
                    }
                    //无结果
                } else {
                    $where .= " AND 1 = 2";
                }

                //无结果
            } else {
                $where .= " AND 1 = 2";
            }

        }

        //地图可视区域内
        if (!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `longitude` <= '" . $max_longitude . "' AND `longitude` >= '" . $min_longitude . "' AND `latitude` <= '" . $max_latitude . "' AND `latitude` >= '" . $min_latitude . "'");
            $ret = $dsql->dsqlOper($sql, "results");

            $cids = array();
            if ($ret) {
                foreach ($ret as $key => $value) {
                    $cids[$key] = $value['id'];
                }
            }

            if ($cids) {
                $cids  = join(",", $cids);
                $where .= " AND s.`communityid` in ($cids)";
            } else {
                $where .= " AND 1 = 2";
            }
        }


        //价格区间 这边比例前台页面没有统一，暂时以100为判断标准
        $price = convertArrToStrWithComma($price);
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $bl    = $price[1] < 100 ? 100 : 1;
                $where .= " AND s.`price` < " . $price[1] * $bl;
            } elseif (empty($price[1])) {
                $bl    = $price[0] < 100 ? 100 : 1;
                $where .= " AND s.`price` > " . $price[0] * $bl;
            } else {
                $bl    = $price[0] < 100 ? 100 : 1;
                $where .= " AND s.`price` BETWEEN " . $price[0] * $bl . " AND " . $price[1] * $bl;
            }
        }

        //房型
        if ($room != "") {
            if ($room == 0) {
                $where .= " AND s.`room` > 5";
            } else {
                $where .= " AND s.`room` = " . $room;
            }
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`community` like '%" . $keywords . "%'";

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (`title` like '%" . $keywords . "%' OR `addr` like '%" . $keywords . "%')");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $community) {
                    $ids[] = $community["id"];
                }
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " OR s.`communityid` in ($ids)";
                }
            }

            $where .= ")";
        }

        //物业类型
        if ($protype != "") {
            $where .= " AND s.`protype` = " . $protype;
        }

        //装修
        if ($zhuangxiu != "") {
            $where .= " AND s.`zhuangxiu` = " . $zhuangxiu;
        }

        //出租方式
        if (!empty($rentype)) {
            $rentype = $rentype == 1 ? 0 : 1;
            $where   .= " AND s.`rentype` = " . $rentype;
        }

        //性质
        if (!empty($type)) {
            $type  = $type == 1 ? 0 : 1;
            $where .= " AND s.`usertype` = " . $type;
        }


        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        $select   = "";
        $orderby_ = $orderby;
        $_orderby = (int)$orderby;
        if (!empty($_orderby)) {
            //发布时间
            if ($_orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($_orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格降序
            } elseif ($_orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($_orderby == 4) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($_orderby == 5) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //点击
            } elseif ($_orderby == "click") {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";

            } elseif ($orderby == "juli" && $lat && $lng) {
                //查询距离
                $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-c.`latitude`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(c.`latitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-c.`longitude`)/360),2))))*1000 AS distance,";

                $orderby = " ORDER BY distance ASC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`config`, s.`buildage`, s.`areaCode`, s.`contact`, s.`title`, s.`communityid`, s.`community`, s.`addrid`, s.`address`, s.`litpic`, s.`price`, s.`paytype`, s.`rentype`, s.`protype`, s.`room`, s.`hall`, s.`guard`, s.`bno`, s.`floor`, s.`area`, s.`sharetype`, s.`direction`, s.`zhuangxiu`, s.`usertype`, s.`username`, s.`userid`, s.`state`,s.`sellstate` ,s.`pubdate`, " . $select . " s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`video`, s.`qj_file`, s.`qj_type`, s.`elevator`, s.`click` " .
            "FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid`" .
            ($lat && $lng ? " LEFT JOIN `#@__house_community` c ON c.`id` = s.`communityid`" : "") .
            " WHERE " .
            "(s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`" . $zj_state . "))" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(s.`id`) total FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid`" .
            ($lat && $lng ? " LEFT JOIN `#@__house_community` c ON c.`id` = s.`communityid`" : "") .
            " WHERE " .
            "(s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id`" . $zj_state . "))" . $where);
        $totalCount = getCache("house_zu_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        if ($backTotal) return $totalCount;

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        // var_dump($archives.$where1.$orderby.$where);die;
        $results = getCache("house_zu_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));
        if ($results && is_array($results)) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['buildage']  = $val['buildage'];
                $list[$key]['config']    = $val['config'];
                $list[$key]['sellstate'] = $val['sellstate'];
                $list[$key]['click'] = (int)$val['click'];

                //配置
                $configlist = array();
                if ($val['config']) {
                    $archives = $dsql->SetQuery("SELECT * FROM `#@__houseitem` WHERE `id` IN (" . $val['config'] . ") ORDER BY `weight` ASC");
                    $results  = $dsql->dsqlOper($archives, "results");
                    if (!empty($results)) {
                        foreach ($results as $value) {
                            array_push($configlist, $value['typename']);
                        }
                    }
                }
                $list[$key]['configlist'] = $configlist;

                $list[$key]['distances'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';  //距离   //千米  //米
                if (strpos($list[$key]['distances'], '千米')) {
                    $list[$key]['distances'] = str_replace("千米", 'km', $list[$key]['distances']);
                } elseif (strpos($list[$key]['distances'], '米')) {
                    $list[$key]['distances'] = str_replace("米", 'm', $list[$key]['distances']);
                }

                //小区
                $list[$key]["communityid"] = $val["communityid"];
                if ($val['communityid'] == 0) {
                    $list[$key]["community"] = $val["community"];
                    $addrName                = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['addr']    = $addrName;
                    $list[$key]["addrid"]  = $val["addrid"];
                    $list[$key]["address"] = $val["address"];
                } else {
                    $communitySql    = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `addrid`, `addr` FROM `#@__house_community` WHERE `id` = " . $val["communityid"]);
                    $communityResult = $dsql->getTypeName($communitySql);
                    if (!$communityResult || !is_array($communityResult)) {
                        $list[$key]["community"] = "小区不存在";
                        $list[$key]['addr']      = array();
                        $list[$key]['addrid']    = 0;
                        $list[$key]["address"]   = "";
                    } else {
                        $list[$key]["community"] = $communityResult[0]["title"];
                        $addrName                = getParentArr("site_area", $communityResult[0]['addrid']);
                        global $data;
                        $data                  = "";
                        $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                        $list[$key]['addr']    = $addrName;
                        $list[$key]['cityid']  = $communityResult[0]["cityid"];
                        $list[$key]['addrid']  = $communityResult[0]["addrid"];
                        $list[$key]["address"] = $communityResult[0]["addr"];
                    }
                }

                $param                      = array(
                    "service"  => "house",
                    "template" => "community-detail",
                    "id"       => $val['communityid']
                );
                $list[$key]['communityUrl'] = getUrlPath($param);

                if ($orderby_ == "juli") {
                    $list[$key]['distance'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';;  //距离   //千米  //米
                }

                //会员信息
                $nickname = $userPhoto = $userPhone = "";
                if ($val['usertype'] == 1 && $val['userid'] > 0) {
                    $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                    $member   = $dsql->dsqlOper($archives, "results");
                    if ($member) {
                        $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                        $userPhoto = getFilePath($member[0]['photo']);
                        $userPhone = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    } else {
                        $nickname  = "";
                        $userPhoto = "";
                        $userPhone = "";
                    }
                }
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['nickname']  = $nickname;
                $list[$key]['userPhoto'] = $userPhoto;
                $list[$key]['userPhone'] = $userPhone;

                $list[$key]['contact'] = !empty($val['contact']) ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;

                // 图集数量
                $sqlPics = $dsql->SetQuery("SELECT count(`id`) AS count FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $val['id']);
                $retPics = $dsql->dsqlOper($sqlPics, "results");
                if ($retPics) {
                    $list[$key]['pics'] = $retPics[0]['count'];
                } else {
                    $list[$key]['pics'] = 0;
                }
                $list[$key]['litpic']  = getFilePath($val['litpic']);
                $list[$key]['price']   = $val['price'];
                $list[$key]['rentype'] = $val['rentype'] == 0 ? "整租" : "合租";

                $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['paytype']);
                $houseResult = $dsql->dsqlOper($houseitem, "results");
                $paytype = $houseResult ? $houseResult[0]['typename'] : "";
                $list[$key]["paytype"]   = $paytype;
                

                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }

                $list[$key]['protype'] = join(",", $protypeArr);

                $list[$key]['room'] = $val['room'] . "室" . $val['hall'] . "厅" . $val['guard'] . "卫";
                $list[$key]['bno']   = getFloorHeight($val['bno'], $val['floor']);
                $list[$key]['floor'] = $val['floor'];
                $list[$key]['area']  = $val['area'];

                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['sharetype']);
                $sharetype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['sharetype']));
                $list[$key]['sharetype'] = $sharetype;

                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['direction']);
                $direction               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['direction']));
                $list[$key]['direction'] = $direction;

                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['zhuangxiu']);
                $zhuangxiu               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['zhuangxiu']));
                $list[$key]['zhuangxiu'] = $zhuangxiu;

                $list[$key]['usertype'] = $val['usertype'];

                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid']      = $isbid;
                $list[$key]['isquanjing'] = 0;
                $list[$key]['isvideo']    = 0;
                $list[$key]['isshapan']   = 0;

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] = $val['video'] ? 1 : 0;
                $list[$key]['qj']    = $qj;

                $list[$key]['elevator'] = $val['elevator'];

                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];

                }

                $list[$key]['pubdate']    = $val['pubdate'];
                $list[$key]['timeUpdate'] = FloorTime(GetMkTime(time()) - $val['pubdate']);

                //图集数量
                $archives               = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $val['id']);
                $imgCount               = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['imgCount'] = $imgCount;

                $param             = array(
                    "service"  => "house",
                    "template" => "zu-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $config = array();
                if (!empty($val['config'])) {
                    $configArr = explode(",", $val['config']);
                    $con       = array();
                    foreach ($configArr as $c) {
                        $houseitem   = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $c);
                        $houseResult = $dsql->dsqlOper($houseitem, "results");
                        $typename    = $houseResult ? $houseResult[0]['typename'] : "";
                        if (!empty($typename)) {
                            $con[] = $typename;
                        }
                    }
                    if (!empty($con)) {
                        $config = $con;
                    }
                }

                $list[$key]['config'] = $config;

                //验证是否已经收藏
                $params                = array(
                    "module" => "house",
                    "temp"   => "zu_detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 区域出租房统计
     *
     * @return array
     */
    public function zuDistrict()
    {
        global $dsql;
        $price         = convertArrToStrWithComma($this->param['price']);
        $keywords      = $this->param['keywords'];
        $room          = $this->param['room'];
        $zhuangxiu     = $this->param['zhuangxiu'];
        $rentype       = $this->param['rentype'];
        $type          = $this->param['type'];
        $bizcircle     = $this->param['bizcircle'];  //统计二级区域数据
        $community     = $this->param['community'];  //统计可视范围内小区数据
        $min_latitude  = $this->param['min_latitude'];
        $max_latitude  = $this->param['max_latitude'];
        $min_longitude = $this->param['min_longitude'];
        $max_longitude = $this->param['max_longitude'];
        $cityid        = $this->param['cityid'];

        if (empty($cityid)) {
            $cityid = getCityId();
        }

        $data = array();
        $bc   = 0;

        $where = " AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";

        //价格区间
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                $where .= " AND s.`price` < " . $price[1] * 100;
            } elseif (empty($price[1])) {
                $where .= " AND s.`price` > " . $price[0] * 100;
            } else {
                $where .= " AND s.`price` BETWEEN " . $price[0] * 100 . " AND " . $price[1] * 100;
            }
        }

        //房型
        if ($room != "") {
            if ($room == 0) {
                $where .= " AND s.`room` > 5";
            } else {
                $where .= " AND s.`room` = " . $room;
            }
        }

        //关键字
        if (!empty($keywords)) {
            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`community` like '%" . $keywords . "%'";

            //查询小区信息
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND (`title` like '%" . $keywords . "%' OR `addr` like '%" . $keywords . "%')");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $ids = array();
                foreach ($results as $comm) {
                    $ids[] = $comm["id"];
                }
                if (!empty($ids)) {
                    $ids   = join(",", $ids);
                    $where .= " OR s.`communityid` in ($ids)";
                }
            }

            $where .= ")";
        }

        //物业类型
        if ($protype != "") {
            $where .= " AND s.`protype` = " . $protype;
        }

        //装修
        if ($zhuangxiu != "") {
            $where .= " AND s.`zhuangxiu` = " . $zhuangxiu;
        }

        //出租方式
        if (!empty($rentype)) {
            $rentype = $rentype == 1 ? 0 : 1;
            $where   .= " AND s.`rentype` = " . $rentype;
        }

        //性质
        if (!empty($type)) {
            $type  = $type == 1 ? 0 : 1;
            $where .= " AND s.`usertype` = " . $type;
        }


        //只统计区域内的小区数据
        if ($community == 1) {

            $sql = $dsql->SetQuery("SELECT `id`, `title`, `longitude`, `latitude` FROM `#@__house_community` WHERE `state` = 1 AND `longitude` <= '" . $max_longitude . "' AND `longitude` >= '" . $min_longitude . "' AND `latitude` <= '" . $max_latitude . "' AND `latitude` >= '" . $min_latitude . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                foreach ($ret as $key => $value) {
                    $nwhere = $where . " AND s.`communityid` = " . $value['id'];

                    $count   = $price = 0;
                    $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                    $saleRet = $dsql->dsqlOper($saleSql, "results");
                    if ($saleRet) {
                        $count = $saleRet[0]['count'];
                        $price = sprintf("%.2f", $saleRet[0]['price']);
                    }

                    if ($count > 0) {
                        $data[$bc]['id']        = $value['id'];
                        $data[$bc]['title']     = $value['title'];
                        $data[$bc]['longitude'] = $value['longitude'];
                        $data[$bc]['latitude']  = $value['latitude'];
                        $data[$bc]['count']     = $count;
                        $data[$bc]['price']     = $price;
                        if (isMobile()) {
                            $param = array(
                                "service"  => "house",
                                "template" => "zu",
                                "param"    => "community=" . $value['id']
                            );
                        } else {
                            $param = array(
                                "service"  => "house",
                                "template" => "community-zu",
                                "id"       => $value['id']
                            );
                        }
                        $data[$bc]['url'] = getUrlPath($param);
                        $bc++;
                    }
                }

            }


            //区域数据
        } else {

            //所有一级区域
            $sql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = $cityid ORDER BY `weight`");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $kk = 0;
                foreach ($ret as $key => $value) {

                    //单独请求二级区域数据
                    if ($bizcircle == 1) {

                        $addrSql = $dsql->SetQuery("SELECT `id`, `typename`, `longitude`, `latitude` FROM `#@__site_area` WHERE `parentid` = " . $value['id'] . " OR `id` = " . $value['id'] . " ORDER BY `weight`");
                        $addrRet = $dsql->dsqlOper($addrSql, "results");
                        foreach ($addrRet as $k => $v) {

                            $nwhere = $where;

                            //查询小区信息
                            $cid      = array();
                            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` = " . $v['id']);
                            $results  = $dsql->dsqlOper($archives, "results");
                            if ($results) {
                                foreach ($results as $loupan) {
                                    $cid[] = $loupan["id"];
                                }
                                //有结果
                                if (!empty($cid)) {
                                    $cid    = join(",", $cid);
                                    $nwhere .= " AND s.`communityid` in ($cid)";
                                    //无结果
                                } else {
                                    $nwhere .= " AND 1 = 2";
                                }
                                //无结果
                            } else {
                                $nwhere .= " AND 1 = 2";
                            }

                            $count = $price = 0;
                            if ($cid) {
                                $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                                $saleRet = $dsql->dsqlOper($saleSql, "results");
                                if ($saleRet) {
                                    $count = $saleRet[0]['count'];
                                    $price = sprintf("%.2f", $saleRet[0]['price']);
                                }
                            }

                            if ($count > 0) {
                                $data[$bc]['id']        = $v['id'];
                                $data[$bc]['addrname']  = $v['typename'];
                                $data[$bc]['longitude'] = $v['longitude'];
                                $data[$bc]['latitude']  = $v['latitude'];
                                $data[$bc]['count']     = $count;
                                $data[$bc]['price']     = $price;
                                $bc++;
                            }

                        }


                        //只请求一级区域数据
                    } else {
                        $nwhere = $where;
                        $ids    = array($value['id']);

                        $addrSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_area` WHERE `parentid` = " . $value['id'] . " ORDER BY `weight`");
                        $addrRet = $dsql->dsqlOper($addrSql, "results");
                        foreach ($addrRet as $k => $v) {
                            array_push($ids, $v['id']);
                        }


                        //查询小区信息
                        $cid      = array();
                        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_community` WHERE `state` = 1 AND `addrid` in (" . join(",", $ids) . ")");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if ($results) {
                            foreach ($results as $loupan) {
                                $cid[] = $loupan["id"];
                            }
                            //有结果
                            if (!empty($cid)) {
                                $cid    = join(",", $cid);
                                $nwhere .= " AND s.`communityid` in ($cid)";
                                //无结果
                            } else {
                                $nwhere .= " AND 1 = 2";
                            }
                            //无结果
                        } else {
                            $nwhere .= " AND 1 = 2";
                        }

                        $count = $price = 0;

                        if ($cid) {
                            $saleSql = $dsql->SetQuery("SELECT COUNT(s.`id`) count, AVG(s.`price`) price FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`state` = 1 AND s.`waitpay` = 0" . $nwhere);
                            $saleRet = $dsql->dsqlOper($saleSql, "results");
                            if ($saleRet) {
                                $count = $saleRet[0]['count'];
                                $price = sprintf("%.2f", $saleRet[0]['price']);
                            }
                        }

                        if ($count > 0) {
                            $data[$kk]['id']        = $value['id'];
                            $data[$kk]['addrname']  = $value['typename'];
                            $data[$kk]['longitude'] = $value['longitude'];
                            $data[$kk]['latitude']  = $value['latitude'];
                            $data[$kk]['count']     = $count;
                            $data[$kk]['price']     = $price;
                            $kk++;
                        }

                    }

                }
            }

        }


        if ($data) {
            return $data;
        } else {
            return array("state" => 200, "info" => '暂无相关数据！');
        }

    }


    /**
     * 出租房详细
     * @return array
     */
    public function zuDetail()
    {
        global $dsql;
        global $userLogin;
        $zuDetail = array();
        $id       = $this->param;
        $id       = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        $where = " AND s.`waitpay` = 0";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_zu` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_zu_detail", $archives, 0, $id);
        if ($results) {
            $zuDetail["id"]    = $results[0]['id'];
            $zuDetail["title"] = $results[0]['title'];

            $sex = $results[0]['sex'];

            //小区
            $zuDetail["communityid"] = $results[0]["communityid"];
            $zuDetail["sellstate"]   = $results[0]["sellstate"];
            $zuDetail["is_vipguanggao"]   = $results[0]["is_vipguanggao"];

            $addrid               = $results[0]['addrid'];
            $saleDetail["cityid"] = $results[0]['cityid'];

            if ($results[0]['communityid'] == 0) {
                $zuDetail["community"] = $results[0]["community"];
                $addrName              = getParentArr("site_area", $addrid);
                global $data;
                $data                  = "";
                $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                $zuDetail['addr']      = $addrName;
                $zuDetail["address"]   = $results[0]["address"];
                $zuDetail["longitude"] = $results[0]["longitude"];
                $zuDetail["latitude"]  = $results[0]["latitude"];
            } else {
                $communitySql    = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `addrid`, `addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = " . $results[0]["communityid"]);
                $communityResult = $dsql->getTypeName($communitySql);
                if (!$communityResult) {
                    $zuDetail["community"] = "小区不存在";
                    $zuDetail['addr']      = array();
                    $zuDetail["address"]   = "";
                    $zuDetail["longitude"] = "";
                    $zuDetail["latitude"]  = "";
                    $addrid                = 0;
                } else {
                    $zuDetail["community"] = $communityResult[0]["title"];
                    $addrName              = getParentArr("site_area", $communityResult[0]['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $zuDetail['addr']      = $addrName;
                    $zuDetail["cityid"]    = $communityResult[0]["cityid"];
                    $zuDetail["address"]   = $communityResult[0]["addr"];
                    $zuDetail["longitude"] = $communityResult[0]["longitude"];
                    $zuDetail["latitude"]  = $communityResult[0]["latitude"];
                    $addrid                = $communityResult[0]["addrid"];

                    $this->param = array(
                        'sid' => $communityResult[0]["communityid"],
                        'pageSize' => 1000
                    );
                    $schoolList = $this->schoolList();
                    $zuDetail["school"] = $schoolList && !isset($schoolList['state']) ? $schoolList['list'] : array();
                }
            }

            $zuDetail["addrid"] = $addrid;


            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $phone = $certify = $flag = $zjcomName = $zjcomId = $qq = $wx = $qqQr = $wxQr = $ext_title_1 = $ext_val_1 = $ext_title_2 = $ext_val_2 = "";
            if ($userid != 0 && $userid != -1) {

                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zj.`ext_title_1`, zj.`ext_val_1`, zj.`ext_title_2`, zj.`ext_val_2` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zj.`ext_title_1`, zj.`ext_val_1`, zj.`ext_title_2`, zj.`ext_val_2`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zjcom.`state` = 1 AND zj.`id` = " . $userid);
                }

                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $certify                = $member[0]['certifyState'];
                    $flag                   = $member[0]['flag'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";

                    $ext_title_1 = $member[0]['ext_title_1'];
                    $ext_val_1   = $member[0]['ext_val_1'];
                    $ext_title_2 = $member[0]['ext_title_2'];
                    $ext_val_2   = $member[0]['ext_val_2'];                    
                }

                $url = getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $userid));

                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
                $userArr['url']       = $url;
                $userArr['ext_title_1'] = $ext_title_1;
                $userArr['ext_val_1']   = $ext_val_1;
                $userArr['ext_title_2'] = $ext_title_2;
                $userArr['ext_val_2']   = $ext_val_2;
            }
            $zuDetail['user']   = $userArr;
            $zuDetail['userid'] = $results[0]['userid'];


            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $addrid);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $zuDetail["areaid"] = $areaid;

            $param                    = array(
                "service"  => "house",
                "template" => "community-detail",
                "id"       => $results[0]['communityid']
            );
            $zuDetail['communityUrl'] = getUrlPath($param);

            $zuDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $zuDetail["litpicSource"] = $results[0]['litpic'];
            $zuDetail["price"]        = $results[0]['price'];

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['paytype']);
            $houseResult           = $dsql->dsqlOper($houseitem, "results");
            $paytype               = $houseResult ? $houseResult[0]['typename'] : "";
            $zuDetail["paytype"]   = $paytype;
            $zuDetail["paytypeid"] = $results[0]['paytype'];

            $zuDetail["rentypeid"] = $results[0]['rentype'];
            $zuDetail["rentype"]   = $results[0]['rentype'] == 0 ? "整租" : "合租";

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['protype']);
            $houseResult           = $dsql->dsqlOper($houseitem, "results");
            $protype               = $houseResult ? $houseResult[0]['typename'] : "";
            $zuDetail["protype"]   = $protype;
            $zuDetail["protypeid"] = $results[0]['protype'];

            $zuDetail["room"]  = $results[0]['room'];
            $zuDetail["hall"]  = $results[0]['hall'];
            $zuDetail["guard"] = $results[0]['guard'];

            $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['sharetype']);
            $houseResult             = $dsql->dsqlOper($houseitem, "results");
            $sharetype               = $houseResult ? $houseResult[0]['typename'] : "";
            $zuDetail["sharetype"]   = $sharetype;
            $zuDetail["sharetypeid"] = $results[0]['sharetype'];

            $zuDetail["sharesex"] = $results[0]['sharesex'];

            global $do;
            global $oper;
            if($do == 'edit' && $oper == 'user'){
                $zuDetail["bno"]      = $results[0]['bno'];
            }else{
                $zuDetail["bno"]      = getFloorHeight($results[0]['bno'], $results[0]['floor']);
            }
            $zuDetail["floor"]    = $results[0]['floor'];
            $zuDetail["area"]     = $results[0]['area'];

            $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['direction']);
            $direction               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['direction']));
            $zuDetail["direction"]   = $direction;
            $zuDetail["directionid"] = $results[0]['direction'];

            $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['zhuangxiu']);
            $zhuangxiu               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['zhuangxiu']));
            $zuDetail["zhuangxiu"]   = $zhuangxiu;
            $zuDetail["zhuangxiuid"] = $results[0]['zhuangxiu'];

            $zuDetail["buildage"] = $results[0]['buildage'];

            $config = $config_py = array();
            if (!empty($results[0]['config'])) {
                $configArr = explode(",", $results[0]['config']);
                $con       = array();
                foreach ($configArr as $c) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $c);
                    $typename  = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $c));
                    if (!empty($typename)) {
                        $con[]       = $typename;
                        $config_py[] = array("name" => $typename, "py" => GetPinyin($typename));
                    }
                }
                if (!empty($con)) {
                    $config = $con;
                }
            }

            $zuDetail["config"]    = $config;
            $zuDetail["config_py"] = $config_py;
            $zuDetail["configs"]   = $results[0]['config'];

            $zuDetail["usertype"] = $results[0]['usertype'];
            $zuDetail["username"] = $results[0]['username'];
            $zuDetail["areaCode"]  = $results[0]['areaCode'];
            $zuDetail["contact"]  = $results[0]['contact'];
            $zuDetail["showMobile"]  = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);

            $zuDetail["note"]       = nl2br($results[0]['note']);
            $zuDetail["mbody"]      = nl2br($results[0]['mbody']);
            $zuDetail['timeUpdate'] = FloorTime(GetMkTime(time()) - $results[0]['pubdate']);

            // 视频全景
            $zuDetail['videoSource'] = $results[0]['video'];
            $zuDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $zuDetail['qj_type']     = $results[0]['qj_type'];
            
            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $zuDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $zuDetail['qj_fileArr'] = $fileArr;
            }

            $zuDetail['elevator'] = $results[0]['elevator'];

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }
            $zuDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params              = array(
                "module" => "house",
                "temp"   => "zu_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect             = checkIsCollect($params);
            $zuDetail['collect'] = $collect == "has" ? 1 : 0;

            $zuDetail['pubdate'] = $results[0]['pubdate'];
            $zuDetail['click']   = $results[0]['click'];

            global $do;
            global $oper;
            if($do == 'edit' && $oper == 'user'){
                $zuDetail["buildpos"]    = $results[0]['buildpos'];
                $zuDetail["buildposArr"] = $results[0]['buildpos'] ? explode('||', $results[0]['buildpos']) : array('', '', '');
                $zuDetail["floorspr"]    = $results[0]['floorspr'];
                $zuDetail["floortype"]   = $results[0]['floortype'];
            }else{
                $zuDetail["floortype"] = 0;
            }
            $zuDetail["state"]       = $results[0]['state'];
            $zuDetail["sex"]         = (int)$sex;
            $zuDetail["wx_tel"]      = $results[0]['wx_tel'];
            //标签
            $zuDetail['flag'] = $results[0]['flag'];
            $flags            = explode(",", $results[0]['flag']);
            $flagArr          = array();
            $tags             = array("朝南", "拎包入住", "可做饭", "押一付一", "邻地铁", "配套齐全", "精装修", "房主直租");
            foreach ($flags as $k => $v) {
                array_push($flagArr, $tags[$v]);
            }
            $zuDetail['flags'] = $flagArr;
        }
        return $zuDetail;
    }


    /**
     * 写字楼列表
     * @return array
     */
    public function xzlList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $zj       = $type = $addrid = $price = $area = $keywords = $protype = $usertype = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $comid     = (int)$this->param['comid'];
                $zj        = (int)$this->param['zj'];
                $type      = (int)$this->param['type'];
                $addrid    = (int)$this->param['addrid'];
                $pricetype = (int)$this->param['pricetype']; //0:单价1:总价
                $price     = convertArrToStrWithComma($this->param['price']);
                $area      = $this->param['area'];
                $keywords  = $this->param['keywords'];
                $protype   = (int)$this->param['protype'];
                $usertype  = (int)$this->param['usertype'];
                $orderby   = $this->param['orderby'];
                $u         = (int)$this->param['u'];
                $uid       = (int)$this->param['uid'];
                $state     = $this->param['state'];
                $page      = (int)$this->param['page'];
                $pageSize  = (int)$this->param['pageSize'];
                $lng       = $this->param['lng'];
                $lat       = $this->param['lat'];
                $config    = $this->param['config'];
                $backTotal = $this->param['backTotal'];
                $qj        = (int)$this->param['qj'];
                $video     = (int)$this->param['video'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        $loginUid = $userLogin->getMemberID();

        if ($orderby == "juli") {
            if (empty($lng) || empty($lat)) $orderby = 0;
        }

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        if ($config) {
            $where .= " AND FIND_IN_SET(" . $config . ", `config`)";
        }

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }


        //是否输出当前登录会员的信息
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND s.`cityid` = " . $cityid;
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }

            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        //类型
        if ($type != "") {
            $where .= " AND s.`type` = " . $type;
        }

        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }


        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            $where .= " AND s.`addrid` in ($lower)";

        }

        //价格区间
        $price = convertArrToStrWithComma($price);
        if ($price != "") {
            $price = explode(",", $price);
            if (empty($price[0])) {
                if (empty($pricetype)) {
                    if ($type == 0) {
                        $where .= " AND s.`price` < " . $price[1];
                    } elseif ($type == 1) {
                        $where .= " AND (s.`price` / s.`area` * 10000) < " . $price[1];
                    }
                    // 总价
                } else {
                    $price = $price[1];
                    $where .= " AND ( (s.`price` < $price AND s.`type` = 1) || (s.`price` * s.`area` / 10000 < $price AND s.`type` = 0) )";
                }
            } elseif (empty($price[1])) {
                if (empty($pricetype)) {
                    if ($type == 0) {
                        $where .= " AND s.`price` > " . $price[0];
                    } elseif ($type == 1) {
                        $where .= " AND (s.`price` / s.`area` * 10000) > " . $price[0];
                    }
                } else {
                    $price = $price[0];
                    $where .= " AND ( (s.`price` > $price AND s.`type` = 1) || (s.`price` * s.`area` / 10000 > $price AND s.`type` = 0) )";
                }
            } else {
                if (empty($pricetype)) {
                    if ($type == 0) {
                        $where .= " AND s.`price` BETWEEN " . $price[0] . " AND " . $price[1];
                    } elseif ($type == 1) {
                        $where .= " AND (s.`price` / s.`area` * 10000) BETWEEN " . $price[0] . " AND " . $price[1];
                    }
                } else {
                    $price0 = $price[0];
                    $price1 = $price[1];
                    $where  .= " AND ( (s.`price` BETWEEN $price0 AND $price1 AND s.`type` = 1) || ( (s.`price` * s.`area` / 10000) BETWEEN $price0 AND $price1 AND s.`type` = 0) )";
                }
            }
        }

        //面积
        $area = convertArrToStrWithComma($area);
        if ($area) {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . $area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . $area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`loupan` like '%" . $keywords . "%' OR s.`address` like '%" . $keywords . "%')";
        }

        //物业类型
        if (!empty($protype)) {
            $where .= " AND s.`protype` = $protype";
        }

        //性质
        if ($usertype != "") {
            $where .= " AND s.`usertype` = $usertype";
        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        $select   = "";
        $orderby_ = $orderby;
        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($orderby == 4) {
                if ($type == 0) {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` * s.`area`) ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                } else {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                }
                //价格降序
            } elseif ($orderby == 5) {
                if ($type == 0) {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` * s.`area`) DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                } else {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                }
                //单价升序
            } elseif ($orderby == 6) {
                if ($type == 0) {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price`) ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                } else {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` / s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                }
                //单价降序
            } elseif ($orderby == 7) {
                if ($type == 0) {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price`) DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                } else {
                    $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` / s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                }
                //点击
            } elseif ($orderby == "click") {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            } elseif ($orderby == "juli") {
                //查询距离
                $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-s.`latitude`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(s.`latitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-s.`longitude`)/360),2))))*1000 AS distance,";

                $orderby = " ORDER BY distance ASC";
            }else{
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`areaCode`, s.`contact`, s.`type`, s.`floor`, s.`bno`, s.`type`, s.`title`, s.`loupan`, s.`addrid`, s.`address`, s.`nearby`, s.`protype`, s.`area`, s.`litpic`, s.`price`, s.`zhuangxiu`, s.`userid`, s.`usertype`, s.`username`, s.`state`,s.`sellstate`, s.`pubdate`, " . $select . " s.`config`, s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`video`, s.`qj_file`, s.`qj_type`, s.`loupanid`, s.`click` " .
            "FROM `#@__house_xzl` s " .
            "WHERE " .
            "1 = 1" . $where);
        // var_dump($archives);die;

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(s.`id`) total FROM `#@__house_xzl` s " .
            "WHERE " .
            "1 = 1" . $where);
        $totalCount = getCache("house_xzl_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        if ($backTotal) return $totalCount;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_xzl_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));
        if ($results) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['type']      = $val['type'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['loupan']    = $val['loupan'];
                $list[$key]['addrid']    = $val['addrid'];
                $list[$key]['bno']       = getFloorHeight($val['bno'], $val['floor']);
                $list[$key]['floor']     = $val['floor'];
                $list[$key]['username']  = $val['username'];
                $list[$key]['areaCode']  = $val['areaCode'];
                $list[$key]['contact']   = $val['contact'];
                $list[$key]['loupanid']  = $val['loupanid'];
                $list[$key]['proprice']  = $val['proprice'];
                $list[$key]['sellstate'] = $val['sellstate'];
                $list[$key]['click'] = (int)$val['click'];

                if ($val['loupanid']) {
                    $sql = $dsql->SetQuery("SELECT `title`, `price`, `ptype` FROM `#@__house_loupan` WHERE `id` = " . $val['loupanid'] . " AND `state` = 1");
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        $list[$key]['loupan']       = $res[0]['title'];
                        $list[$key]['loupan_price'] = $res[0]['price'];
                        $list[$key]['loupan_ptype'] = $res[0]['ptype'];
                    }
                }

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['address'] = $val['address'];
                $list[$key]['nearby']  = $val['nearby'];

                if ($orderby_ == "juli") {
                    $list[$key]['distance'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';  //距离   //千米  //米
                }

                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }
                $list[$key]['protype'] = join(",", $protypeArr);

                $list[$key]['area']   = $val['area'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['price']  = $val['price'];

                //会员信息
                $nickname = $userPhone = $userPhoto = "";
                if ($val['usertype'] == 1 && $val['userid'] > 0) {
                    $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                    $member   = $dsql->dsqlOper($archives, "results");
                    if ($member) {
                        $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                        $userPhoto = getFilePath($member[0]['photo']);
                        $userPhone = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    } else {
                        $nickname  = "";
                        $userPhoto = "";
                        $userPhone = "";
                    }
                }
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['nickname']  = $nickname;
                $list[$key]['contact']   = !empty($val['contact']) ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;
                $list[$key]['userPhone'] = $userPhone;
                $list[$key]['userPhoto'] = $userPhoto;

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] = $val['video'] ? 1 : 0;
                $list[$key]['qj']    = $qj;

                //装修
                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['zhuangxiu']);
                $zhuangxiu               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['zhuangxiu']));
                $list[$key]['zhuangxiu'] = $zhuangxiu;

                $list[$key]['usertype'] = $val['usertype'];
                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid'] = $isbid;

                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                $list[$key]['pubdate']    = $val['pubdate'];
                $list[$key]['timeUpdate'] = FloorTime(GetMkTime(time()) - $val['pubdate']);

                $config    = explode(",", $val['config']);
                $configArr = array();
                if (!empty($val['config'])) {
                    foreach ($config as $k => $v) {
                        $houseitem   = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                        $typename    = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                        $configArr[] = $typename;
                    }
                }
                $list[$key]['config'] = $configArr;

                $param             = array(
                    "service"  => "house",
                    "template" => "xzl-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //验证是否已经收藏
                $params                = array(
                    "module" => "house",
                    "temp"   => "xzl_detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 写字楼详细
     * @return array
     */
    public function xzlDetail()
    {
        global $dsql;
        global $userLogin;
        $xzlDetail = array();
        $id        = $this->param;
        $id        = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        $where = " AND s.`waitpay` = 0";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_xzl` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_xzl_detail", $archives, 0, $id);
        if ($results) {

            $xzlDetail["id"]        = $results[0]['id'];
            $xzlDetail["type"]      = $results[0]['type'];
            $xzlDetail["title"]     = $results[0]['title'];
            $xzlDetail["addrid"]    = $results[0]['addrid'];
            $xzlDetail["cityid"]    = $results[0]['cityid'];
            $xzlDetail["fg"]        = $results[0]["fg"];
            $xzlDetail["level"]     = $results[0]["level"];
            $xzlDetail["loupan"]    = $results[0]['loupan'];
            $xzlDetail["loupanid"]  = $results[0]["loupanid"];
            $xzlDetail["longitude"] = $results[0]['longitude'];
            $xzlDetail["latitude"]  = $results[0]['latitude'];
            $xzlDetail["sellstate"] = $results[0]['sellstate'];
            $xzlDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];
            $sex                    = $results[0]['sex'];

            if ($results[0]["loupanid"]) {
                $loupan = array();
                $sql    = $dsql->SetQuery("SELECT `addrid`, `cityid`, `longitude`, `latitude`, `buildarea`, `floor`, `parknum`, `property`, `investor`, `proprice`, `tel`, `litpic` FROM `#@__house_loupan` WHERE `id` = " . $results[0]['loupanid'] . " AND `state` = 1");
                $res    = $dsql->dsqlOper($sql, "results");
                if ($res) {
                    $loupan['buildarea']       = $res[0]['buildarea'];
                    $loupan['floor']           = $res[0]['floor'];
                    $loupan['parknum']         = $res[0]['parknum'];
                    $loupan['investor']        = $res[0]['investor'];
                    $loupan['property']        = $res[0]['property'];
                    $loupan['proprice']        = $res[0]['proprice'];
                    $loupan['tel']             = $res[0]['tel'];
                    $loupan['litpic']          = $res[0]['litpic'] ? getFilePath($res[0]['litpic']) : "";
                    $xzlDetail['loupanDetail'] = $loupan;

                    $xzlDetail['addrid']    = $res[0]['addrid'];
                    $xzlDetail['cityid']    = $res[0]['cityid'];
                    $xzlDetail['longitude'] = $res[0]['longitude'];
                    $xzlDetail['latitude']  = $res[0]['latitude'];
                }
            }

            $levelName = "";
            switch ($results[0]['level']) {
                case 1:
                    $levelName = "A级";
                    break;
                case 1:
                    $levelName = "A级";
                    break;
                case 2:
                    $levelName = "B级";
                    break;
                case 3:
                    $levelName = "C级";
                    break;
            }
            $xzlDetail["levelName"] = $levelName;

            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $areaCode = $phone = $certify = $flag = $zjcomName = $zjcomId = $qq = $wx = $qqQr = $wxQr = "";
            if ($userid != 0 && $userid != -1) {

                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zjcom.`state` = 1 AND zj.`id` = " . $userid);
                }

                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $areaCode               = $member[0]['areaCode'];
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $certify                = $member[0]['certifyState'];
                    $flag                   = $member[0]['flag'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";
                }

                $url = getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $userid));

                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['areaCode']  = $areaCode;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
                $userArr['url']       = $url;
            }
            $xzlDetail['user']   = $userArr;
            $xzlDetail['userid'] = $results[0]['userid'];

            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $results[0]['addrid']);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $xzlDetail["areaid"] = $areaid;

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data              = "";
            $addrName          = array_reverse(parent_foreach($addrName, "typename"));
            $xzlDetail['addr'] = $addrName;

            $xzlDetail["address"]      = $results[0]['address'];
            $xzlDetail["nearby"]       = $results[0]['nearby'];
            $xzlDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $xzlDetail["litpicSource"] = $results[0]['litpic'];

            $houseitem              = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['protype']);
            $protype                = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['protype']));
            $xzlDetail["protype"]   = $protype;
            $xzlDetail["protypeid"] = $results[0]['protype'];

            $xzlDetail["area"]     = $results[0]['area'];
            $xzlDetail["price"]    = $results[0]['price'];
            $xzlDetail["proprice"] = $results[0]['proprice'];

            $houseitem                = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['zhuangxiu']);
            $zhuangxiu                = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['zhuangxiu']));
            $xzlDetail["zhuangxiu"]   = $zhuangxiu;
            $xzlDetail["zhuangxiuid"] = $results[0]['zhuangxiu'];

            global $do;
            global $oper;
            if($do == 'edit' && $oper == 'user'){
                $xzlDetail["bno"]   = $results[0]['bno'];
                $xzlDetail["floorspr"]  = $results[0]['floorspr'];
                $xzlDetail["floortype"] = $results[0]['floortype'];
            }else{
                $xzlDetail["bno"]   = getFloorHeight($results[0]['bno'], $results[0]['floor']);
                $xzlDetail["floortype"] = 0;
            }
            $xzlDetail["floor"] = $results[0]['floor'];

            $xzlDetail["usertype"] = $results[0]['usertype'];
            $xzlDetail["username"] = $results[0]['username'];
            $xzlDetail['areaCode'] = $results[0]['areaCode'];
            $xzlDetail["contact"]  = $results[0]['contact'];
            $xzlDetail["showMobile"]  = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);


            // $xzlDetail["userid"]   = $results[0]['userid'];
            // $xzlDetail["username"] = $results[0]['username'];
            // $xzlDetail["contact"]  = $results[0]['contact'];
            $xzlDetail["note"]       = nl2br($results[0]['note']);
            $xzlDetail["mbody"]      = nl2br($results[0]['mbody']);
            $xzlDetail['pubdate']    = $results[0]['pubdate'];
            $xzlDetail['timeUpdate'] = FloorTime(GetMkTime(time()) - $results[0]['pubdate']);

            $config    = explode(",", $results[0]['config']);
            $configArr = array();
            if (!empty($results[0]['config'])) {
                foreach ($config as $k => $v) {
                    $houseitem   = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename    = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $configArr[] = $typename;
                }
            }
            $xzlDetail["config"]  = $configArr;
            $xzlDetail["configs"] = $results[0]['config'];

            // 配套设施 同后台 houseXzlAdd.php
            $peitaoArr = array();
            if (!empty($results[0]['peitao'])) {
                $peitao = explode(",", $results[0]['peitao']);
                foreach ($peitao as $k => $v) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename  = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    if (!empty($typename)) {
                        $peitaoArr[] = array("name" => $typename, "py" => GetPinyin($typename));
                    }
                }
                $xzlDetail["peitaoIdArr"] = explode(",", $results[0]['peitao']);
            } else {
                $xzlDetail["peitaoIdArr"] = array();
            }
            $xzlDetail["peitao"]  = $peitaoArr;
            $xzlDetail["peitaos"] = $results[0]['peitao'];


            // 视频全景
            $xzlDetail['videoSource'] = $results[0]['video'];
            $xzlDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $xzlDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $xzlDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $xzlDetail['qj_fileArr'] = $fileArr;
            }

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }

            $xzlDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params               = array(
                "module" => "house",
                "temp"   => "xzl_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect              = checkIsCollect($params);
            $xzlDetail['collect'] = $collect == "has" ? 1 : 0;

            $xzlDetail['click'] = $results[0]['click'];

            $xzlDetail["sex"]       = $results[0]['sex'];
            $xzlDetail["wx_tel"]    = $results[0]['wx_tel'];
            $xzlDetail["wuye_in"]   = $results[0]['wuye_in'];
            $xzlDetail["fg"]        = $results[0]['fg'];
            $xzlDetail["state"]     = $results[0]['state'];
        }
        return $xzlDetail;
    }


    /**
     * 商铺列表
     * @return array
     */
    public function spList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $zj       = $type = $addrid = $price = $area = $keywords = $usertype = $protype = $industry = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $comid     = $this->param['comid'];
                $zj        = $this->param['zj'];
                $type      = $this->param['type'];
                $addrid    = (int)$this->param['addrid'];
                $pricetype = (int)$this->param['pricetype']; //0:单价1:总价
                $price     = convertArrToStrWithComma($this->param['price']);
                $pricetype = (int)$this->param['pricetype']; //1:单价2:总价
                $area      = $this->param['area'];
                $keywords  = $this->param['keywords'];
                $usertype  = $this->param['usertype'];
                $protype   = $this->param['protype'];
                $industry  = $this->param['industry'];
                $orderby   = $this->param['orderby'];
                $u         = $this->param['u'];
                $uid       = $this->param['uid'];
                $state     = $this->param['state'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $lng       = $this->param['lng'];
                $lat       = $this->param['lat'];
                $backTotal = $this->param['backTotal'];
                $qj        = (int)$this->param['qj'];
                $video     = (int)$this->param['video'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        $loginUid = $userLogin->getMemberID();

        if ($orderby == "juli") {
            if (empty($lng) || empty($lat)) $orderby = 0;
        }

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        //是否输出当前登录会员的信息
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND s.`cityid` = " . $cityid;
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }

            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        //类型
        if ($type != "") {
            $where .= " AND s.`type` = " . $type;
        }

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }

        //性质
        if ($usertype != "") {
            $where .= " AND s.`usertype` = " . $usertype;
        }

        //类型
        if ($protype) {
            $where .= " AND s.`protype` = " . $protype;
        }

        //行业
        if ($industry != "") {
            $where .= " AND FIND_IN_SET($industry, s.`suitable`)";
        }

        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            $where .= " AND s.`addrid` in ($lower)";

        }

        //价格区间
        if ($price != "") {
            $mu    = $type == 1 ? 1 : 1000;
            $mu2   = $type == 1 ? 1 : 10000;
            $price = explode(",", $price);
            if (empty($price[0])) {
                if (empty($pricetype)) {
                    $where .= " AND s.`price` < " . $price[1] * $mu;
                    // 单价
                } else if ($pricetype == 1) {
                    $where .= " AND (s.area > 0 && (s.`price` / s.`area`) < " . $price[1] . ")";
                    // 总价
                } else if ($pricetype == 2) {
                    $where .= " AND s.`price` < " . $price[1] * $mu2;
                }
            } elseif (empty($price[1])) {
                if (empty($pricetype)) {
                    $where .= " AND s.`price` > " . $price[0] * $mu;
                    // 单价
                } else if ($pricetype == 1) {
                    $where .= " AND (s.area > 0 && (s.`price` / s.`area`) > " . $price[0] . ")";
                    // 总价
                } else if ($pricetype == 2) {
                    $where .= " AND s.`price` > " . $price[0] * $mu2;
                }
            } else {
                if (empty($pricetype)) {
                    $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " AND " . $price[1] * $mu;
                    // 单价
                } else if ($pricetype == 1) {
                    $where .= " AND s.area > 0 && (s.`price` / s.`area`) BETWEEN " . $price[0] . " AND " . $price[1];
                    // 总价
                } else if ($pricetype == 2) {
                    $where .= " AND s.`price` BETWEEN " . $price[0] * $mu2 . " AND " . $price[1] * $mu2;
                }
            }
        }

        //面积
        if ($area != "") {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . $area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . $area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`address` like '%" . $keywords . "%')";
        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        $select   = "";
        $orderby_ = $orderby;
        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格降序
            } elseif ($orderby == 5) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价升序
            } elseif ($orderby == 6) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价降序
            } elseif ($orderby == 7) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //点击
            } elseif ($orderby == 'click') {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            } elseif ($orderby == "juli") {
                //查询距离
                $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-s.`latitude`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(s.`latitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-s.`longitude`)/360),2))))*1000 AS distance,";

                $orderby = " ORDER BY distance ASC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`loupan`, s.`config`, s.`areaCode`, s.`contact`, s.`type`, s.`title`, s.`addrid`, s.`address`, s.`nearby`, s.`protype`, s.`area`, s.`litpic`, s.`price`, s.`zhuangxiu`, s.`bno`, s.`floor`, s.`transfer`, s.`usertype`, s.`userid`, s.`username`, s.`state`,s.`sellstate`, s.`pubdate`, " . $select . " s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`video`, s.`qj_file`, s.`qj_type`, s.`longitude`, s.`latitude`, s.`click` " .
            "FROM `#@__house_sp` s " .
            "WHERE " .
            "1 = 1" . $where);

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(s.`id`) total FROM `#@__house_sp` s " .
            "WHERE " .
            "1 = 1" . $where);
        $totalCount = getCache("house_sp_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        if ($backTotal) return $totalCount;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_sp_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));
        if ($results) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['type']      = $val['type'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['addrid']    = $val['addrid'];
                $list[$key]['loupan']    = $val['loupan'];
                $list[$key]['sellstate'] = $val['sellstate'];
                $list[$key]['click'] = (int)$val['click'];

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['address'] = $val['address'];
                $list[$key]['nearby']  = $val['nearby'];
                $list[$key]['bno']     = $val['bno'];
                $list[$key]['floor']   = $val['floor'];

                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }
                $list[$key]['protype'] = join(",", $protypeArr);

                $list[$key]['area']      = $val['area'];
                $list[$key]['litpic']    = getFilePath($val['litpic']);
                $list[$key]['price']     = $val['price'];
                $list[$key]['price_avg'] = $val['price'] > 0 && $val['area'] > 0 ? sprintf("%.2f", ($val['price'] / $val['area'])) : '';

                //会员信息
                $nickname = $userPhone = $userPhoto = "";
                if ($val['usertype'] == 1 && $val['userid'] > 0) {
                    $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                    $member   = $dsql->dsqlOper($archives, "results");
                    if ($member) {
                        $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                        $userPhoto = getFilePath($member[0]['photo']);
                        $userPhone = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    } else {
                        $nickname  = "";
                        $userPhoto = "";
                        $userPhone = "";
                    }
                }
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['nickname']  = $nickname;
                $list[$key]['contact']   = !empty($val['contact']) ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;
                $list[$key]['userPhone'] = $userPhone;
                $list[$key]['userPhoto'] = $userPhoto;

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] = $val['video'] ? 1 : 0;
                $list[$key]['qj']    = $qj;

                if ($orderby_ == "juli") {
                    $list[$key]['distance'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';  //距离   //千米  //米
                }

                //装修
                $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $val['zhuangxiu']);
                $zhuangxiu               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $val['zhuangxiu']));
                $list[$key]['zhuangxiu'] = $zhuangxiu;

                $list[$key]['usertype'] = $val['usertype'];
                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                //转让费
                if ($val['type'] == 2) {
                    $list[$key]['transfer'] = $val['transfer'];
                }

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid'] = $isbid;

                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                $list[$key]['pubdate']    = $val['pubdate'];
                $list[$key]['timeUpdate'] = FloorTime(GetMkTime(time()) - $val['pubdate']);

                $param             = array(
                    "service"  => "house",
                    "template" => "sp-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $config    = explode(",", $val['config']);
                $configArr = array();
                if (!empty($val['config'])) {
                    foreach ($config as $k => $v) {
                        $houseitem   = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                        $typename    = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                        $configArr[] = $typename;
                    }
                }
                $list[$key]['config'] = $configArr;

                //验证是否已经收藏
                $params                = array(
                    "module" => "house",
                    "temp"   => "sp_detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 商铺详细
     * @return array
     */
    public function spDetail()
    {
        global $dsql;
        global $userLogin;
        $spDetail = array();
        $id       = $this->param;
        $id       = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        $where = " AND s.`waitpay` = 0";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_sp` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_sp_detail", $archives, 0, $id);
        if ($results) {

            $spDetail["id"]         = $results[0]['id'];
            $spDetail["type"]       = $results[0]['type'];
            $spDetail["industryid"] = $results[0]['industry'];
            $sex                    = $results[0]['sex'];

            $industryName = array();
            if ($results[0]['type'] == 2) {
                $industryName = getParentArr("house_industry", $results[0]['industry']);
                global $data;
                $data                 = "";
                $industryName         = array_reverse(parent_foreach($industryName, "typename"));
                $spDetail['industry'] = $industryName;
            }

            $spDetail["title"]  = $results[0]['title'];
            $spDetail["addrid"] = $results[0]['addrid'];
            $spDetail["cityid"] = $results[0]['cityid'];
            $spDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];

            $spDetail["loupan"]    = $results[0]['loupan'];
            $spDetail["loupanid"]  = $results[0]['loupanid'];
            $spDetail["longitude"] = $results[0]['longitude'];
            $spDetail["latitude"]  = $results[0]['latitude'];
            $spDetail["sellstate"] = $results[0]['sellstate'];

            if ($results[0]['loupanid']) {
                $param                 = array(
                    "service"  => "house",
                    "template" => "loupan-detail",
                    "id"       => $results[0]['loupanid']
                );
                $spDetail["loupanUrl"] = getUrlPath($param);

                $this->param              = $results[0]['loupanid'];
                $spDetail["loupanDetail"] = $this->loupanDetail();
            }

            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $phone = $certify = $flag = $zjcomName = $zjcomId = "";
            if ($userid != 0 && $userid != -1) {
                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                }
                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $certify                = $member[0]['certify'];
                    $flag                   = $member[0]['flag'];
                    $zjcomName              = $member[0]['title'];
                    $zjcomId                = $member[0]['zjcomId'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";
                }
                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
            }
            $spDetail['user'] = $userArr;

            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $results[0]['addrid']);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $spDetail["areaid"] = $areaid;

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data             = "";
            $addrName         = array_reverse(parent_foreach($addrName, "typename"));
            $spDetail['addr'] = $addrName;

            $spDetail["address"]      = $results[0]['address'];
            $spDetail["nearby"]       = $results[0]['nearby'];
            $spDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $spDetail["litpicSource"] = $results[0]['litpic'];
            $spDetail["proprice"]     = $results[0]['proprice'];

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['protype']);
            $protype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['protype']));
            $spDetail["protype"]   = $protype;
            $spDetail["protypeid"] = $results[0]['protype'];

            $houseitem               = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['zhuangxiu']);
            $zhuangxiu               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['zhuangxiu']));
            $spDetail["zhuangxiu"]   = $zhuangxiu;
            $spDetail["zhuangxiuid"] = $results[0]['zhuangxiu'];

            $spDetail["bno"]               = $results[0]['bno'];
            $spDetail["floor"]             = $results[0]['floor'];
            $spDetail["miankuan"]          = $results[0]['miankuan'];
            $spDetail["jinshen"]           = $results[0]['jinshen'];
            $spDetail["cenggao"]           = $results[0]['cenggao'];
            $spDetail["operating_stateid"] = $results[0]['operating_state'];
            $spDetail["operating_state"]   = $results[0]['operating_state'] == 0 ? "" : ($results[0]['operating_state'] == 1 ? "经营中" : "空置中");

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['paytype']);
            $houseResult           = $dsql->dsqlOper($houseitem, "results");
            $paytype               = $houseResult ? $houseResult[0]['typename'] : "";
            $spDetail["paytype"]   = $paytype;
            $spDetail["paytypeid"] = $results[0]['paytype'];

            //适合经营的行业
            $suitable = "";
            if (!empty($results[0]['suitable'])) {
                $suitableArr = explode(",", $results[0]['suitable']);
                $con         = array();
                foreach ($suitableArr as $c) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__house_industry` WHERE `id` = " . $c);
                    // $houseResult = $dsql->dsqlOper($houseitem, "results");
                    $typename = getCache("house_industry", $houseitem, 0, array("name" => "typename", "sign" => $c));
                    if (!empty($typename)) {
                        $con[] = $typename;
                    }
                }
                if (!empty($con)) {
                    $suitable = join(",", $con);
                }
            }

            $spDetail["suitable"]  = $suitable;
            $spDetail["suitables"] = $results[0]['suitable'];

            //配套设施
            $config = "";
            $con    = $config_py = array();
            if (!empty($results[0]['config'])) {
                $configArr = explode(",", $results[0]['config']);

                foreach ($configArr as $c) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $c);
                    $typename  = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $c));
                    if (!empty($typename)) {
                        $con[]       = $typename;
                        $config_py[] = array("name" => $typename, "py" => GetPinyin($typename));
                    }
                }
                if (!empty($con)) {
                    $config = join(",", $con);
                }
            }

            $spDetail["config"]    = $config;
            $spDetail["configs"]   = $results[0]['config'];
            $spDetail["configArr"] = $con;
            $spDetail["config_py"] = $config_py;

            $spDetail["area"]     = $results[0]['area'];
            $spDetail["price"]    = $results[0]['price'];
            $spDetail["transfer"] = $results[0]['transfer'];
            $spDetail["usertype"] = $results[0]['usertype'];

            $spDetail["username"] = $results[0]['username'];
            $spDetail['areaCode'] = $results[0]['areaCode'];
            $spDetail["contact"]  = $results[0]['contact'];
            $spDetail["showMobile"]  = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);

            $spDetail["userid"]     = $results[0]['userid'];
            $spDetail["note"]       = nl2br($results[0]['note']);
            $spDetail["mbody"]      = nl2br($results[0]['mbody']);
            $spDetail["pubdate"]    = $results[0]['pubdate'];
            $spDetail['timeUpdate'] = FloorTime(GetMkTime(time()) - $results[0]['pubdate']);

            // 视频全景
            $spDetail['videoSource'] = $results[0]['video'];
            $spDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $spDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $spDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $spDetail['qj_fileArr'] = $fileArr;
            }

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }

            $spDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params              = array(
                "module" => "house",
                "temp"   => "sp_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect             = checkIsCollect($params);
            $spDetail['collect'] = $collect == "has" ? 1 : 0;
            $spDetail['click']   = $results[0]['click'];

            $spDetail["floortype"] = $results[0]['floortype'];
            $spDetail["floorspr"]  = $results[0]['floorspr'];
            $spDetail["sex"]       = (int)$sex;
            $spDetail["wx_tel"]    = $results[0]['wx_tel'];
            $spDetail["wuye_in"]   = $results[0]['wuye_in'];
            //标签
            $flag = "";
            $con  = array();
            if (!empty($results[0]['flag'])) {
                $flagArr = explode(",", $results[0]['flag']);

                foreach ($flagArr as $c) {
                    $houseitem = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $c);
                    $typename  = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $c));
                    if (!empty($typename)) {
                        $con[] = $typename;
                    }
                }
                if (!empty($con)) {
                    $flag = join(",", $con);
                }
            }

            $spDetail['flags'] = $results[0]['flag'];
            $spDetail['flag']  = $flag;

        }
        return $spDetail;
    }


    /**
     * 厂房/仓库列表
     * @return array
     */
    public function cfList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $zj       = $type = $addrid = $price = $area = $protype = $keywords = $usertype = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $comid     = $this->param['comid'];
                $zj        = $this->param['zj'];
                $type      = $this->param['type'];
                $addrid    = (int)$this->param['addrid'];
                $price     = convertArrToStrWithComma($this->param['price']);
                $area      = $this->param['area'];
                $protype   = $this->param['protype'];
                $keywords  = $this->param['keywords'];
                $usertype  = $this->param['usertype'];
                $orderby   = $this->param['orderby'];
                $u         = $this->param['u'];
                $uid       = $this->param['uid'];
                $state     = $this->param['state'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $qj        = (int)$this->param['qj'];
                $video     = (int)$this->param['video'];
                $pricetype = (int)$this->param['pricetype'];
                $backTotal = $this->param['backTotal'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        $loginUid = $userLogin->getMemberID();

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        //是否输出当前登录会员的信息
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND s.`cityid` = " . $cityid;
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }

            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }

        //类型
        if ($type != "") {
            $where .= " AND s.`type` = " . $type;
        }

        //性质
        if ($usertype != "") {
            $where .= " AND s.`usertype` = " . $usertype;
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            $where .= " AND s.`addrid` in ($lower)";

        }

        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //价格区间
        if ($price != "") {

            $price = explode(",", $price);

            // 出租
            if ($type == 0) {
                $mu = $pricetype == 1 ? 1 : 10000;
                // 单价
                if ($pricetype == 1) {
                    if (empty($price[0])) {
                        $where .= " AND s.`price` < " . $price[1] * $mu . " * s.`area`";
                    } elseif (empty($price[1])) {
                        $where .= " AND s.`price` > " . $price[0] * $mu . " * s.`area`";
                    } else {
                        $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " * s.`area`" . " AND " . $price[1] * $mu . " * s.`area`";
                    }
                    // 总价
                } elseif ($pricetype == 2) {
                    if (empty($price[0])) {
                        $where .= " AND s.`price` < " . $price[1] * $mu;
                    } elseif (empty($price[1])) {
                        $where .= " AND s.`price` > " . $price[0] * $mu;
                    } else {
                        $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " AND " . $price[1] * $mu;
                    }
                }
                // 出售
            } elseif ($type == 2) {
                $mu = 1;
                // 单价
                if ($pricetype == 1) {
                    if (empty($price[0])) {
                        $where .= " AND s.`price` < " . $price[1] * $mu . " * s.`area` / 10000";
                    } elseif (empty($price[1])) {
                        $where .= " AND s.`price` > " . $price[0] * $mu . " * s.`area` / 10000";
                    } else {
                        $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " * s.`area` / 10000" . " AND " . $price[1] * $mu . " * s.`area` / 10000";
                    }
                    // 总价
                } elseif ($pricetype == 2) {
                    if (empty($price[0])) {
                        $where .= " AND s.`price` < " . $price[1] * $mu;
                    } elseif (empty($price[1])) {
                        $where .= " AND s.`price` > " . $price[0] * $mu;
                    } else {
                        $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " AND " . $price[1] * $mu;
                    }
                }
            }
            // echo $type."==".$pricetype."===";
            // echo $where;die;
        }

        //面积
        if ($area != "") {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . $area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . $area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //类型
        if ($protype != "") {
            $where .= " AND s.`protype` = " . $protype;
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`address` like '%" . $keywords . "%')";
        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格降序
            } elseif ($orderby == 5) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价升序
            } elseif ($orderby == 6) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价降序
            } elseif ($orderby == 7) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //点击
            } elseif ($orderby == "click") {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`cenggao`, s.`areaCode`, s.`contact`, s.`bno`, s.`floor`, s.`type`, s.`title`, s.`addrid`, s.`address`, s.`nearby`, s.`protype`, s.`area`, s.`litpic`, s.`price`, s.`transfer`, s.`usertype`, s.`userid`, s.`username`, s.`state`,s.`sellstate`, s.`pubdate`, s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`video`, s.`qj_file`, s.`qj_type`, s.`click` " .
            "FROM `#@__house_cf` s " .
            "WHERE " .
            "1 = 1" . $where);

        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(s.`id`) total FROM `#@__house_cf` s " .
            "WHERE " .
            "1 = 1" . $where);
        $totalCount = getCache("house_cf_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        if ($backTotal) return $totalCount;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_cf_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));
        if ($results && is_array($results)) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['type']      = $val['type'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['addrid']    = $val['addrid'];
                $list[$key]['bno']       = $val['bno'];
                $list[$key]['floor']     = $val['floor'];
                $list[$key]['cenggao']   = $val['cenggao'];
                $list[$key]['sellstate'] = $val['sellstate'];
                $list[$key]['click'] = (int)$val['click'];

                $addrName = getParentArr("site_area", $val['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['address'] = $val['address'];
                $list[$key]['nearby']  = $val['nearby'];

                $protype    = explode(",", $val['protype']);
                $protypeArr = array();
                foreach ($protype as $k => $v) {
                    $houseitem    = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $v);
                    $typename     = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $v));
                    $protypeArr[] = $typename;
                }
                $list[$key]['protype'] = join(",", $protypeArr);

                $list[$key]['area']   = $val['area'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['price']  = $val['price'];

                if ($val['type'] == 1) {
                    $list[$key]['transfer'] = $val['transfer'];
                }

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] = $val['video'] ? 1 : 0;
                $list[$key]['qj']    = $qj;

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid'] = $isbid;

                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];
                }


                $list[$key]['usertype'] = $val['usertype'];
                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                //会员信息
                $nickname = $userPhone = $userPhoto = "";
                if ($val['usertype'] == 1 && $val['userid'] > 0) {
                    $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                    $member   = $dsql->dsqlOper($archives, "results");
                    if ($member) {
                        $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                        $userPhoto = getFilePath($member[0]['photo']);
                        $userPhone = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    } else {
                        $nickname  = "";
                        $userPhoto = "";
                        $userPhone = "";
                    }
                }
                $list[$key]['userid']     = $val['userid'];
                $list[$key]['nickname']   = $nickname;
                $list[$key]['areaCode']   = $val['areaCode'];
                $list[$key]['contact']    = !empty($val['contact']) ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;
                $list[$key]['userPhone']  = $userPhone;
                $list[$key]['userPhoto']  = $userPhoto;
                $list[$key]['pubdate']    = $val['pubdate'];
                $list[$key]['timeUpdate'] = FloorTime(GetMkTime(time()) - $val['pubdate']);


                $param             = array(
                    "service"  => "house",
                    "template" => "cf-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //验证是否已经收藏
                $params                = array(
                    "module" => "house",
                    "temp"   => "cf_detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect               = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 厂房/仓库详细
     * @return array
     */
    public function cfDetail()
    {
        global $dsql;
        global $userLogin;
        $cfDetail = array();
        $id       = $this->param;
        $id       = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        $where = " AND s.`waitpay` = 0";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_cf` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_cf_detail", $archives, 0, $id);
        if ($results) {
            $cfDetail["id"]        = $results[0]['id'];
            $cfDetail["type"]      = $results[0]['type'];
            $cfDetail["title"]     = $results[0]['title'];
            $cfDetail["addrid"]    = $results[0]['addrid'];
            $cfDetail["cityid"]    = $results[0]['cityid'];
            $cfDetail["longitude"] = $results[0]["longitude"];
            $cfDetail["latitude"]  = $results[0]["latitude"];
            $cfDetail["sellstate"] = $results[0]["sellstate"];
            $cfDetail["is_vipguanggao"] = $results[0]["is_vipguanggao"];
            $sex                   = $results[0]['sex'];

            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $phone = $certify = $flag = $zjcomName = $zjcomId = $qq = $wx = $qqQr = $wxQr = "";
            if ($userid != 0 && $userid != -1) {

                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                }

                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    $certify                = $member[0]['certifyState'] == 1 ? 1 : 0;
                    $flag                   = $member[0]['flag'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";
                }

                $url = getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $userid));

                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
                $userArr['url']       = $url;
            }
            $cfDetail['user']   = $userArr;
            $cfDetail['userid'] = $results[0]['userid'];

            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $results[0]['addrid']);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $cfDetail["areaid"] = $areaid;

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data             = "";
            $addrName         = array_reverse(parent_foreach($addrName, "typename"));
            $cfDetail['addr'] = $addrName;

            $cfDetail["address"]      = $results[0]['address'];
            $cfDetail["nearby"]       = $results[0]['nearby'];
            $cfDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $cfDetail["litpicSource"] = $results[0]['litpic'];

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['protype']);
            $protype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['protype']));
            $cfDetail["protype"]   = $protype;
            $cfDetail["protypeid"] = $results[0]['protype'];

            $cfDetail["area"]     = $results[0]['area'];
            $cfDetail["price"]    = $results[0]['price'];
            $cfDetail["transfer"] = $results[0]['transfer'];
            $cfDetail["usertype"] = $results[0]['usertype'];
            $cfDetail["username"] = $results[0]['username'];
            $cfDetail["areaCode"]  = $results[0]['areaCode'];
            $cfDetail["contact"]  = $results[0]['contact'];
            $cfDetail['showMobile'] = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);

            // $cfDetail["userid"]   = $results[0]['userid'];
            // $cfDetail["username"] = $results[0]['username'];
            // $cfDetail["contact"]  = $results[0]['contact'];
            $cfDetail["note"]       = nl2br($results[0]['note']);
            $cfDetail["mbody"]      = nl2br($results[0]['mbody']);
            $cfDetail["pubdate"]    = $results[0]['pubdate'];
            $cfDetail['timeUpdate'] = FloorTime(GetMkTime(time()) - $results[0]['pubdate']);

            // 视频全景
            $cfDetail['videoSource'] = $results[0]['video'];
            $cfDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $cfDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $cfDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $cfDetail['qj_fileArr'] = $fileArr;
            }
            $cfDetail["bno"]      = $results[0]['bno'];
            $cfDetail["floor"]    = $results[0]['floor'];
            $cfDetail["cenggao"]  = $results[0]['cenggao'];
            $cfDetail["mintime"]  = $results[0]['mintime'];
            $cfDetail["proprice"] = $results[0]['proprice'];

            $cfDetail["floortype"] = $results[0]['floortype'];
            $cfDetail["floorspr"]  = $results[0]['floorspr'];
            $cfDetail["sex"]       = (int)$sex;
            $cfDetail["wx_tel"]    = $results[0]['wx_tel'];
            $cfDetail["wuye_in"]   = $results[0]['wuye_in'];
            $cfDetail["state"]     = $results[0]['state'];

            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['paytype']);
            $paytype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['paytype']));
            $cfDetail["paytype"]   = $paytype;
            $cfDetail["paytypeid"] = $results[0]['paytype'];

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }

            $cfDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params              = array(
                "module" => "house",
                "temp"   => "cf_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect             = checkIsCollect($params);
            $cfDetail['collect'] = $collect == "has" ? 1 : 0;
            $cfDetail['click']   = $results[0]['click'];
        }
        return $cfDetail;
    }


    /**
     * 房产资讯
     * @return array
     */
    public function news()
    {
        global $dsql;
        $pageinfo = $list = array();
        $typeid   = $litpic = $orderby = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = $this->param['typeid'];
                $title    = $this->param['title'];
                $noid     = $this->param['noid'];
                $litpic   = $this->param['litpic'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "house_newstype")) {
                $lower = arr_foreach($dsql->getTypeList($typeid, "house_newstype"));
                $lower = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        if (!empty($noid)) {
            if (is_array($noid)) {
                $noid = join(",", $noid);
            } else {
                $noid = rtrim($noid, ",");
            }
            if ($noid) {
                $where .= " AND `id` not in($noid)";
            }
        }

        if (!empty($title)) {
            $where .= " and `title` like '%$title%'";
        }

        if ($litpic == 1) {
            $where .= " AND `litpic` <> ''";
        }

        $o = " ORDER BY `weight` DESC, `id` DESC";
        if ($orderby == "click") {
            $o = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
        } elseif ($orderby == "time") {
            $o = " ORDER BY `id` DESC, `weight` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `click`, `litpic`, `writer`, `description`, `pubdate` FROM `#@__house_news` WHERE `arcrank` = 0" . $where . $o);
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__house_news` WHERE `arcrank` = 0" . $where);
        $totalCount = getCache("house_news_total", $arc, 86400, array("name" => "total", "savekey" => 1));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where, "results");
        $results = getCache("house_news_list", $archives . $where, 3600);
        $list    = array();
        foreach ($results as $key => $val) {
            $list[$key]['index']       = $key + 1;
            $list[$key]['id']          = $val['id'];
            $list[$key]['title']       = $val['title'];
            $list[$key]['typeid']      = $val['typeid'];
            $list[$key]['click']       = $val['click'];
            $list[$key]['writer']      = $val['writer'];
            $list[$key]['description'] = $val['description'];
            $list[$key]['litpic']      = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
            $list[$key]['pubdate']     = $val['pubdate'];

            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__house_newstype` WHERE `id` = " . $val['typeid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $list[$key]['typename'] = $ret[0]['typename'];
            } else {
                $list[$key]['typename'] = "";
            }

            $param             = array(
                "service"  => "house",
                "template" => "news-detail",
                "id"       => $val['id']
            );
            $list[$key]['url'] = getUrlPath($param);
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 房产资讯信息详细
     * @return array
     */
    public function newsDetail()
    {
        global $dsql;
        $newsDetail = array();

        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_news` WHERE `arcrank` = 0 AND `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_news_detail", $archives, 0, $id);
        if ($results) {
            $newsDetail["id"]     = $results[0]['id'];
            $newsDetail["title"]  = $results[0]['title'];
            $newsDetail["typeid"] = $results[0]['typeid'];
            $newsDetail["cityid"] = $results[0]['cityid'];

            $typename = "";
            if (!empty($results[0]['typeid'])) {
                global $data;
                $data     = "";
                $typeArr  = getParentArr("house_newstype", $results[0]['typeid']);
                $typeArr  = array_reverse(parent_foreach($typeArr, "typename"));
                $typename = join("", $typeArr);
            }
            $newsDetail["typename"] = $typename;

            $newsDetail["litpic"]      = getFilePath($results[0]['litpic']);
            $newsDetail["click"]       = $results[0]['click'];
            $newsDetail["source"]      = $results[0]['source'];
            $newsDetail["writer"]      = $results[0]['writer'];
            $newsDetail["keyword"]     = $results[0]['keyword'];
            $newsDetail["description"] = $results[0]['description'];
            $newsDetail["body"]        = $results[0]['body'];
            $newsDetail["pubdate"]     = $results[0]['pubdate'];
        }
        return $newsDetail;
    }


    /**
     * 房产资讯分类
     * @return array
     */
    public function newsType()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        $cityid = 0;

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId();
        }

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "house_newstype", $son, $page, $pageSize);
        // $results = getCache("house_newstype_" . $cityid, function() use($dsql, $type, $son, $page, $pageSize){
        //     return $dsql->getTypeList($type, "house_newstype", $son, $page, $pageSize);
        // }, 0, array("sign" => $type."_".(int)$son, "savekey" => 1));
        if ($results) {
            return $results;
        }
    }

    /**
     * 房产问答
     * @return array
     */
    public function faq()
    {
        global $dsql;
        $pageinfo = $list = array();
        $typeid   = $keywords = $orderby = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = $this->param['typeid'];
                $keywords = $this->param['keywords'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "house_faqtype")) {
                $lower = arr_foreach($dsql->getTypeList($typeid, "house_faqtype"));
                $lower = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        if (!empty($keywords)) {
            $where .= " AND `title` like '%" . $keywords . "%'";
        }

        $o = " ORDER BY `id` DESC";
        if ($orderby == "click") {
            $o = " ORDER BY `click` ASC, `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `click`, `pubdate` FROM `#@__house_faq` WHERE `state` = 0" . $where . $o);
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        $arc        = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__house_faq` WHERE `state` = 0" . $where);
        $totalCount = getCache("house_faq_total", $arc, 86400, array("name" => "total"));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        $results = getCache("house_faq_list", $archives . $where, 3600);
        $list    = array();
        foreach ($results as $key => $val) {
            $list[$key]['id']     = $val['id'];
            $list[$key]['title']  = $val['title'];
            $list[$key]['typeid'] = $val['typeid'];

            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__house_faqtype` WHERE `id` = " . $val['typeid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $list[$key]['typename'] = $ret[0]['typename'];
            } else {
                $list[$key]['typename'] = "";
            }
            $list[$key]['click']   = $val['click'];
            $list[$key]['pubdate'] = $val['pubdate'];

            $param             = array(
                "service"  => "house",
                "template" => "faq-detail",
                "id"       => $val['id']
            );
            $list[$key]['url'] = getUrlPath($param);
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 房产问答信息详细
     * @return array
     */
    public function faqDetail()
    {
        global $dsql;
        $newsDetail = array();
        $id         = $this->param;
        $id         = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_faq` WHERE `state` = 0 AND `id` = " . $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        $results = getCache("house_faq_detail", $archives, 0, $id);
        if ($results) {
            $newsDetail["id"]     = $results[0]['id'];
            $newsDetail["title"]  = $results[0]['title'];
            $newsDetail["typeid"] = $results[0]['typeid'];

            $typename = array();
            if (!empty($results[0]['typeid'])) {
                global $data;
                $data     = "";
                $typeArr  = getParentArr("house_faqtype", $results[0]['typeid']);
                $typeArr  = array_reverse(parent_foreach($typeArr, "typename"));
                $typename = $typeArr;
            }
            $newsDetail["typename"] = $typename;

            $newsDetail["click"]   = $results[0]['click'];
            $newsDetail["people"]  = $results[0]['people'];
            $newsDetail["body"]    = $results[0]['body'];
            $newsDetail["pubdate"] = $results[0]['pubdate'];
        }
        return $newsDetail;
    }


    /**
     * 房产问答分类
     * @return array
     */
    public function faqType()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        // $results = $dsql->getTypeList($type, "house_faqtype", $son, $page, $pageSize);
        $results = getCache("house_faqtype", function () use ($dsql, $type, $son, $page, $pageSize) {
            return $dsql->getTypeList($type, "house_faqtype", $son, $page, $pageSize);
        }, 0, array("sign" => $type . "_" . (int)$son, "savekey" => 1));
        if ($results) {
            return $results;
        }
    }


    /**
     * 提交问答
     *
     */
    public function fabuFaq()
    {
        global $dsql;
        global $userLogin;

        $param    = $this->param;
        $body     = cn_substrR(filterSensitiveWords(addslashes($param['body'])), 200);
        $people   = cn_substrR(filterSensitiveWords(addslashes($param['people'])), 10);
        $phone    = cn_substrR(filterSensitiveWords(addslashes($param['phone'])), 11);
        $areaCode = $param['areaCode'];
        $typeid   = (int)$param['typeid'];
        $date     = GetMkTime(time());
        $cityid   = getCityId();

        if (empty($body)) return array("state" => 101, "info" => '请填写要咨询的问题！');
        if (empty($people)) return array("state" => 101, "info" => '请填写您的姓名！');
        if (empty($phone)) return array("state" => 101, "info" => '请填写联系电话！');

        $phone = ($areaCode == '86' ? '' : $areaCode) . $phone;

        $sql = $dsql->SetQuery("INSERT INTO `#@__house_faq` (`cityid`, `typeid`, `title`, `body`, `people`, `phone`, `state`, `pubdate`) VALUES ('$cityid', '$typeid', '$body', '', '$people', '$phone', '1', '$date')");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret != "ok") {
            return array("state" => 101, "info" => '提交失败，请稍候重试！');
        } else {
            return '提交成功！';
        }

    }


    /**
     * 模糊匹配商业地产已添加的楼盘数据
     * @return array
     */
    public function autoCompleteLoupan()
    {
        global $dsql;
        $type  = $title = $addr = $pageSize = $where = "";
        $param = $this->param;
        $list  = array();

        if (empty($param)) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $type     = $param['type'];
        $title    = $param['title'];
        $addrid   = $param['addrid'];
        $pageSize = $param['pageSize'];

        if (empty($type)) return array("state" => 200, "info" => '格式错误！');

        $pageSize = empty($pageSize) ? 10 : $pageSize;

        if (!empty($title)) {
            $where .= " AND `loupan` like '%$title%'";
        }

        //遍历区域
        if (!empty($addrid)) {
            $addrArr = $dsql->getTypeList($addrid, "site_area");
            if ($addrArr) {
                $lower = arr_foreach($addrArr);
                $lower = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }

        $archives = $dsql->SetQuery("SELECT `loupan`, `addrid`, `address` FROM `#@__house_" . $type . "` WHERE `state` = 1" . $where . " LIMIT 0, $pageSize");
        $results  = $dsql->dsqlOper($archives, "results");
        $list     = array();
        foreach ($results as $key => $val) {

            if (!in_array($val['loupan'], $list)) {

                $list[$key]['loupan']  = $val['loupan'];
                $list[$key]['addrid']  = $val['addrid'];
                $list[$key]['address'] = $val['address'];

                global $data;
                $data                   = "";
                $addrName               = getParentArr("site_area", $val['addrid']);
                $addrName               = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addrName'] = join(" > ", $addrName);
            }

        }

        if ($list) {
            return $list;
        }
    }


    /**
     * 模糊匹配楼盘 商铺 写字楼
     */
    public function checkLoupan()
    {
        global $dsql;

        $param = $this->param;

        $title  = $param['title'];
        $addrid = (int)$param['addrid'];
        $type   = $param['type'];
        $dopost = $param['dopost'];

        if (empty($type)) return array("state" => 200, "info" => "参数错误");

        if ($type == 'xzl') {
            $type = "写字楼";
        } elseif ($type == 'sp') {
            $type = "商铺";
        } else {
            // return array("state" => 200, "info" => "参数错误");
        }

        $where = "";

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__houseitem` WHERE `parentid` = 1 AND `typename` = '$type'");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $tid = $res[0]['id'];

            if ($dopost == "check_hasloupan") {
                return $res[0]['id'];
            }

            $tid = $res[0]['id'];

            // $cityId = getCityId();

            if ($addrid) {
                $where .= " AND l.`cityid` = $addrid";
            }
            if ($title) {
                $where .= " AND l.`title` LIKE '%$title%'";
            }

            $sql = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`addrid`, l.`addr`, l.`cityid`, l.`price`, l.`ptype`, addr.typename FROM `#@__house_loupan` l LEFT JOIN `#@__site_area` addr ON l.addrid = addr.id WHERE FIND_IN_SET($tid, `protype`) $where LIMIT 0, 10");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                foreach ($res as $key => $value) {
                    //地区
                    $addrname = $value['addrid'];
                    if ($addrname) {
                        $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
                    }
                    $res[$key]['typename'] = $addrname;
                }
                return $res;
            } else {
                return array("state" => 200, "info" => "没有相关数据");
            }
        }
    }


    /**
     * 发布房源
     * @return array
     */
    public function put()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        global $cfg_returnInteraction_house;    //房产门户积分
        global $cfg_returnInteraction_commentDay;

        require(HUONIAOINC . "/config/house.inc.php");
        $customagentCheck     = (int)$customagentCheck;
        $customFabuCheckPhone = (int)$customFabuCheckPhone;

        $param = $this->param;
        $type  = $param['type'];
        $title = filterSensitiveWords(addslashes($param['title']));

        $param['floor'] = $param['floorval'];  //修复因floor关键字造成的防火墙触发SQL注入问题

        //用户信息
        $uid      = $userid = $userLogin->getMemberID();
        $loginUid = $uid > 0 ? $uid : 0;
        $userinfo = $loginUid ? $userLogin->getMemberInfo() : array();

        //获取用户ID

        $is_zjuser    = false;
        $zjuserConfig = array();
        if ($type != "demand") {
            if ($uid == -1) {
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }

            //判断是否经纪人
            $usertype = 0;
            $sql      = $dsql->SetQuery("SELECT `id`, `meal` FROM `#@__house_zjuser` WHERE `userid` = $uid AND `state` = 1");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $usertype     = 1;
                $uid          = $ret[0]['id'];
                $is_zjuser    = true;
                $zjuserConfig = $ret[0]['meal'] ? unserialize($ret[0]['meal']) : array();

                if ($userinfo['userType'] == 2) {
                    // $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
                    // $userResult = $dsql->dsqlOper($userSql, "results");
                    // if (!$userResult) return array("state" => 200, "info" => '请先配置中介公司！');
                }
            } else {
                if ($userinfo['userType'] == 2) {
                    $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
                    $userResult = $dsql->dsqlOper($userSql, "results");
                    if (!$userResult) return array("state" => 200, "info" => '请先配置中介公司！');
                }
            }
        }


        // 需要支付费用
        $amount = 0;

        // 是否独立支付 普通会员或者付费会员超出限制
        $alonepay = 0;

        $alreadyFabu = 0; // 付费会员当天已免费发布数量

        $arcrank = $customagentCheck;    // 审核开关

        //企业会员或已经升级为收费会员的状态才可以发布
        // $userinfo['userType'] == 1 &&
        if ($type != "demand") {
            $toMax = false;

            // 验证否经纪人套餐

            $ischeck_zjuserMeal = false;    // 是否为验证经纪人套餐
            if ($is_zjuser) {

                // 验证套餐
                $check = $this->checkZjuserMeal($zjuserConfig, "house");

                if ($check['state'] == 200) {
                    return $check;
                } elseif ($check['state'] == 100) {
                    $ischeck_zjuserMeal = true;
                }
            }

            // 等级会员按等级特权处理
            // if(!$ischeck_zjuserMeal && $userinfo['level']){

            $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
            $houseCount      = (int)$memberLevelAuth['house'];

            //统计用户当天已发布数量
            // $today = GetMkTime(date("Y-m-d", time()));
            // $tomorrow = GetMkTime(date("Y-m-d", strtotime("+1 day")));

            //本周
            $today    = GetMkTime(date('Y-m-d', (time() - ((date('w', time()) == 0 ? 7 : date('w', time())) - 1) * 24 * 3600)));
            $tomorrow = $today + 604800;

            $saleCount = $zuCount = $xzlCount = $spCount = $cfCount = 0;

            //二手房已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_sale` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $saleCount = $ret[0]['total'];
            }

            //租房已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_zu` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $zuCount = $ret[0]['total'];
            }

            //写字楼已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_xzl` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $xzlCount = $ret[0]['total'];
            }

            //商铺已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_sp` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $spCount = $ret[0]['total'];
            }

            //厂房已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_cf` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cfCount = $ret[0]['total'];
            }

            //车位已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__house_cw` WHERE `userid` = $uid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $cwCount = $ret[0]['total'];
            }
            $alreadyFabu = $saleCount + $zuCount + $xzlCount + $spCount + $cfCount + $cwCount;
            if ($alreadyFabu >= $houseCount) {
                $toMax = true;
                // return array("state" => 200, "info" => '当天发布信息数量已达等级上限！');
            } else {
                // $arcrank = 1;
            }

            // }

            if ($is_zjuser) {
                if ($zjuserConfig['house'] == 0) {

                    return array("state" => 200, "info" => '经纪人发布信息数量已达套餐上限！');
                }
            }

            // 普通会员或者付费会员当天发布数量达上限
            if (!$ischeck_zjuserMeal && ($userinfo['level'] == 0 || $toMax)) {

                global $cfg_fabuAmount;
                global $cfg_fabuFreeCount;
                $fabuAmount    = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
                $fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();

                //超出免费次数
                if ($fabuAmount && (($fabuFreeCount && $fabuFreeCount['house'] <= $alreadyFabu) || !$fabuFreeCount)) {
                    $alonepay = 1;
                    $amount   = $fabuAmount["house"];
                }

            }

        }


        $waitpay = $amount > 0 ? 1 : 0;

        if ($userinfo['level'] && $type != "demand") {
            $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $houseCount);
        } else {
            $auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
        }

        if (empty($title)) return array("state" => 200, "info" => '请输入标题');

        $title = cn_substrR($title, 50);

        // 单层跃层
        if (isset($param['floortype'])) {
            $floortype = (int)$param['floortype'];
        } else {
            if ((int)$param['floorspr'] && (int)$param['floorspr'] > (int)$param['bno'] && (int)$param['floor'] >= (int)$param['floorspr']) {
                $floortype = 1;
            } else {
                $floortype = 0;
            }
        }
        $floorspr = $floortype ? (int)$param['floorspr'] : 0;
        if (isset($param['buildpos'])) {
            $buildpos = $param['buildpos'];
        } elseif (isset($param['dong']) || isset($param['danyuan']) || isset($param['shi'])) {
            $buildpos = $param['dong'] . "||" . $param['danyuan'] . "||" . $param['shi'];
        }

        //求租、求购
        if ($type == "demand") {

            $category = (int)$param['category'];
            $note     = filterSensitiveWords(addslashes($param['note']));
            $lei      = (int)$param['lei'];
            $cityid   = (int)$param['cityid'];
            $addrid   = (int)$param['addrid'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $contact  = filterSensitiveWords($param['contact']);
            $areaCode = $param['areaCode'];
            $password = $param['password'];
            $vercode  = $param['vercode'];
            $sex      = (int)$this->param['sex'];

            if (empty($note)) return array("state" => 200, "info" => '请输入需求描述');
            if ($lei == '') return array("state" => 200, "info" => '请选择类别');
            if (empty($addrid)) return array("state" => 200, "info" => '请选择位置');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($contact)) return array("state" => 200, "info" => '请输入联系电话');
            if (empty($password)) return array("state" => 200, "info" => '请输入管理密码');
            if ($customFabuCheckPhone && isset($param['vercode']) && (empty($userinfo) || ($userinfo && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $contact)))) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $contact;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $contact;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            $note    = cn_substrR($note, 500);
            $person  = cn_substrR($person, 10);
            $contact = cn_substrR($contact, 11);

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__housedemand` (`cityid`, `title`, `note`, `action`, `type`, `addr`, `person`, `areaCode`, `contact`, `password`, `state`, `pubdate`, `weight`, `userid`, `sex`) VALUES ('$cityid', '$title', '$note', '$lei', '$category', '$addrid', '$person', '$areaCode', '$contact', '$password', '$arcrank', " . GetMkTime(time()) . ", 1, '$loginUid', '$sex')");
            $aid      = $dsql->dsqlOper($archives, "lastid");
            if (is_numeric($aid)) {
            
                //记录用户行为日志
                memberLog($userid, 'house', 'demand', $aid, 'insert', '发布求租求购('.$title.')', '', $archives);

                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }
                if ($arcrank) {
                    self::clearHouseCache('demand');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint+$cfg_returnInteraction_house);
                        //保存操作日志
                        $info = $langData['siteConfig'][23][49];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");//发布二手房得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                return $aid . "|" . $arcrank;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //二手房
        } elseif ($type == "sale") {

            $community   = filterSensitiveWords(addslashes($param['community']));
            $communityid = (int)$param['communityid'];
            $cityid      = (int)$param['cityid'];
            $lnglat      = $param['lnglat'];

            if (!$cityid && $communityid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = $communityid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $communityResult[0]['addr'];
                $longitude = $communityResult[0]['longitude'];
                $latitude  = $communityResult[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }
            $address   = filterSensitiveWords(addslashes($address));
            $room      = (int)$param['room'];
            $hall      = (int)$param['hall'];
            $guard     = (int)$param['guard'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            $buildage  = (int)$param['buildage'];
            $price     = (float)$param['price'];
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $direction = (int)$param['direction'];
            // $flag        = !empty($_POST['flag']) ? join(",", $_POST['flag']) : "";
            $flag     = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";
            $title    = filterSensitiveWords(addslashes($param['title']));
            $litpic   = $param['litpic'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel      = filterSensitiveWords(addslashes($param['tel']));
            $note     = filterSensitiveWords($param['note']);
            $imglist  = $param['imglist'];
            $video    = $param['video'];
            $qj_type  = (int)$param['qj_type'];
            $qj_pics  = $param['qj_pics'];
            $qj_url   = $param['qj_url'];
            $elevator = (int)$param['elevator'];
            // 201903新增
            // $buildpos  = $param['buildpos'];
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $paytax    = (int)$param['paytax'];
            $rights_to = (int)$param['rights_to'];
            $sex       = (int)$param['sex'];
            $wx_tel    = (int)$param['wx_tel'];
            $sourceid  = $param['sourceid'];
            $vercode   = $param['vercode'];

            if (empty($community) && empty($communityid)) return array("state" => 200, "info" => '请输入小区名称');
            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择小区所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入小区详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传房源代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            //if($area == 0) return array("state" => 200, "info" => '房源面积必须为整数，不得为0');
            //if($price == 0) return array("state" => 200, "info" => '房源价格必须为整数，不得为0');

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $unitprice = floor($price * 10000 / $area);   //单价

            $community = cn_substrR($community, 60);
            $title     = cn_substrR($title, 60);
            $address   = cn_substrR($address, 60);
            $person    = cn_substrR($person, 10);
            $tel       = cn_substrR($tel, 11);
            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_sale` (`cityid`, `title`, `communityid`, `community`, `addrid`, `address`, `litpic`, `price`, `unitprice`, `protype`, `room`, `hall`, `guard`, `bno`, `floor`, `area`, `direction`, `zhuangxiu`, `buildage`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `note`, `mbody`, `weight`, `state`, `flag`, `pubdate`, `waitpay`, `alonepay`, `video`, `qj_type`, `qj_file`, `elevator`, `longitude`, `latitude`, `buildpos`, `floortype`, `floorspr`, `paytax`, `rights_to`, `sex`, `wx_tel`, `sourceid`) VALUES ('$cityid', '$title', '$communityid', '$community', '$addrid', '$address', '$litpic', '$price', '$unitprice', '$protype', '$room', '$hall', '$guard', '$bno', '$floor', '$area', '$direction', '$zhuangxiu', '$buildage', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$note', '', '1', '$arcrank', '$flag', '" . GetMkTime(time()) . "', '$waitpay', '$alonepay', '$video', '$qj_type', '$qj_file', '$elevator', '$longitude', '$latitude', '$buildpos', '$floortype', '$floorspr', '$paytax', '$rights_to', '$sex', '$wx_tel', '$sourceid')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housesale', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'sale-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'sale', $aid, 'insert', '发布二手房('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house');  // 二手房
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布了二手房：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "sale", $param);

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);

                if (isset($codeID)) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('sale');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][14];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");//发布二手房得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"sale");  // 新增二手房
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //租房
        } elseif ($type == "zu") {

            $community   = filterSensitiveWords(addslashes($param['community']));
            $communityid = (int)$param['communityid'];
            $cityid      = (int)$param['cityid'];
            $lnglat      = $param['lnglat'];
            if (!$cityid && $communityid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = $communityid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $address   = $communityResult[0]['addr'];
                $longitude = $communityResult[0]['longitude'];
                $latitude  = $communityResult[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
            }
            $addrid    = (int)$param['addrid'];
            $address   = filterSensitiveWords(addslashes($param['address']));
            $rentype   = (int)$param['rentype'];
            $sharetype = (int)$param['sharetype'];
            $sharesex  = (int)$param['sharesex'];
            $room      = (int)$param['room'];
            $hall      = (int)$param['hall'];
            $guard     = (int)$param['guard'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            $buildage  = (int)$param['buildage'];
            $price     = (float)$param['price'];
            $paytype   = (int)$param['paytype'];
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $direction = (int)$param['direction'];
            $config    = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $title     = filterSensitiveWords(addslashes($param['title']));
            $litpic    = $param['litpic'];
            $person    = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel       = filterSensitiveWords(addslashes($param['tel']));
            $note      = filterSensitiveWords($param['note']);
            $imglist   = $param['imglist'];
            $video     = $param['video'];
            $qj_type   = (int)$param['qj_type'];
            $qj_pics   = $param['qj_pics'];
            $qj_url    = $param['qj_url'];
            $elevator  = (int)$param['elevator'];

            // 201903新增
            // $buildpos  = $param['buildpos'];
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $wx_tel  = (int)$param['wx_tel'];
            $sex     = (int)$param['sex'];
            $vercode = $param['vercode'];
            $flag    = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";


            if (empty($community) && empty($communityid)) return array("state" => 200, "info" => '请输入小区名称');
            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择小区所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入小区详细地址');
            if ($rentype == 1 && $sharetype == 0) return array("state" => 200, "info" => '请选择要出租的房间');
            if ($rentype == 1 && $sharesex === "") return array("state" => 200, "info" => '请选择合租男女限制');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传房源代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            //if($area == 0) return array("state" => 200, "info" => '房源面积必须为整数，不得为0');
            //if($price == 0) return array("state" => 200, "info" => '房源价格必须为整数，不得为0');
            if ($paytype == 0) return array("state" => 200, "info" => '请选择租金压付方式');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $community = cn_substrR($community, 60);
            $title     = cn_substrR($title, 60);
            $address   = cn_substrR($address, 60);
            $person    = cn_substrR($person, 10);
            $tel       = cn_substrR($tel, 11);
            $areaCode = $areaCode == 86 ? '' : $areaCode;

            // $userinfo = $userLogin->getMemberInfo();

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_zu` (`cityid`, `title`, `communityid`, `community`, `addrid`, `address`, `paytype`, `rentype`, `sharetype`, `sharesex`, `litpic`, `price`, `protype`, `room`, `hall`, `guard`, `bno`, `floor`, `area`, `direction`, `zhuangxiu`, `buildage`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `note`, `mbody`, `weight`, `state`, `config`, `pubdate`, `waitpay`, `alonepay`, `video`, `qj_type`, `qj_file`, `elevator`, `longitude`, `latitude`, `buildpos`, `floortype`, `floorspr`, `sex`, `wx_tel`, `flag`) VALUES ('$cityid', '$title', '$communityid', '$community', '$addrid', '$address', '$paytype', '$rentype', '$sharetype', '$sharesex', '$litpic', '$price', '$protype', '$room', '$hall', '$guard', '$bno', '$floor', '$area', '$direction', '$zhuangxiu', '$buildage', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$note', '', '1', '$arcrank', '$config', '" . GetMkTime(time()) . "', '$waitpay', '$alonepay', '$video', '$qj_type', '$qj_file', '$elevator', '$longitude', '$latitude', '$buildpos', '$floortype', '$floorspr', '$sex', '$wx_tel', '$flag')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housezu', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'zu-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'zu', $aid, 'insert', '发布租房('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house'); // 租房
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布租房信息：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "zu", $param);

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);
                if (isset($codeID)) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('zu');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0 ) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][15];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");//发布租房得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"zu");  //新增租房
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //写字楼
        } elseif ($type == "xzl") {

            $lei      = (int)$param['lei'];
            $loupan   = filterSensitiveWords(addslashes($param['loupan']));
            $loupanid = (int)$param['loupanid'];
            $cityid   = (int)$param['cityid'];
            $lnglat   = $param['lnglat'];
            $fg       = (int)$param['fg'];
            $level    = (int)$param['level'];

            if (!$cityid && $loupanid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_loupan` WHERE `id` = $loupanid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $ret[0]['addr'];
                $longitude = $ret[0]['longitude'];
                $latitude  = $ret[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }

            $address   = filterSensitiveWords(addslashes($address));
            $price     = (int)$param['price'];
            $proprice  = number_format($param['proprice'], 1);
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            $config    = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $peitao    = !empty($_POST['peitao']) ? (is_array($_POST['peitao']) ? join(",", $_POST['peitao']) : $_POST['peitao']) : "";
            $title     = filterSensitiveWords(addslashes($param['title']));
            $litpic    = $param['litpic'];
            $person    = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel       = filterSensitiveWords(addslashes($param['tel']));
            $note      = filterSensitiveWords($param['note']);
            $imglist   = $param['imglist'];
            $video     = $param['video'];
            $qj_type   = (int)$param['qj_type'];
            $qj_pics   = $param['qj_pics'];
            $qj_url    = $param['qj_url'];

            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $wx_tel  = (int)$param['wx_tel'];
            $sex     = (int)$param['sex'];
            $vercode = $param['vercode'];
            $wuye_in = (int)$param['wuye_in'];

            if (empty($loupanid) && empty($loupan)) return array("state" => 200, "info" => '请输入楼盘名称');
            if (empty($loupanid) && empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($loupanid) && empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            if (empty($loupanid) && (empty($longitude) || empty($latitude))) return array("state" => 200, "info" => '请选择楼盘坐标');

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $loupan  = cn_substrR($loupan, 60);
            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);
            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_xzl` (`cityid`, `type`, `title`, `loupan`, `addrid`, `address`, `nearby`, `litpic`, `proprice`, `protype`, `area`, `price`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `zhuangxiu`, `bno`, `floor`, `note`, `mbody`, `weight`, `config`, `state`, `pubdate`, `waitpay`, `alonepay`, `video`, `qj_type`, `qj_file`, `longitude`, `latitude`, `loupanid`, `fg`, `level`, `peitao`, `floortype`, `floorspr`, `wuye_in`, `sex`, `wx_tel`) VALUES ('$cityid', '$lei', '$title', '$loupan', '$addrid', '$address', '', '$litpic', '$proprice', '$protype', '$area', '$price', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$zhuangxiu', '$bno', '$floor', '$note', '', '1', '$config', '$arcrank', '" . GetMkTime(time()) . "', '$waitpay', '$alonepay', '$video', '$qj_type', '$qj_file', '$longitude', '$latitude', '$loupanid', '$fg', '$level', '$peitao', '$floortype', '$floorspr', '$wuye_in', '$sex', '$wx_tel')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housexzl', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'xzl-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'xzl', $aid, 'insert', '发布写字楼('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house'); // 写字楼
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布写字楼信息：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "xzl", $param);

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);
                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('xzl');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][16];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");//发布写字楼得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"xzl");  // 新增写字楼
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //商铺
        } elseif ($type == "sp") {

            $lei      = (int)$param['lei'];
            $industry = (int)$param['industry'];
            $loupan   = filterSensitiveWords(addslashes($param['loupan']));
            $loupanid = (int)$param['loupanid'];
            $cityid   = (int)$param['cityid'];
            $lnglat   = $param['lnglat'];

            if ($loupanid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_loupan` WHERE `id` = $loupanid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $ret[0]['addr'];
                $longitude = $ret[0]['longitude'];
                $latitude  = $ret[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }

            $address = filterSensitiveWords(addslashes($address));

            $price     = (int)$param['price'];
            $proprice  = number_format($param['proprice'], 1);
            $transfer  = (float)$param['transfer'];
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            // $config      = !empty($_POST['config']) ? join(",", $_POST['config']) : "";
            // $suitable    = !empty($_POST['suitable']) ? join(",", $_POST['suitable']) : "";
            $config          = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $suitable        = !empty($_POST['suitable']) ? (is_array($_POST['suitable']) ? join(",", $_POST['suitable']) : $_POST['suitable']) : "";
            $title           = filterSensitiveWords(addslashes($param['title']));
            $litpic          = $param['litpic'];
            $person          = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel             = filterSensitiveWords(addslashes($param['tel']));
            $note            = filterSensitiveWords($param['note']);
            $imglist         = $param['imglist'];
            $loupanid        = (int)$param['loupanid'];
            $paytype         = (int)$param['paytype'];
            $operating_state = (int)$param['operating_state'];
            $miankuan        = (float)$param['miankuan'];
            $jinshen         = (float)$param['jinshen'];
            $cenggao         = (float)$param['cenggao'];
            $video           = $param['video'];
            $qj_type         = (int)$param['qj_type'];
            $qj_pics         = $param['qj_pics'];
            $qj_url          = $param['qj_url'];

            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $sex     = (int)$param['sex'];
            $wx_tel  = (int)$param['wx_tel'];
            $wuye_in = (int)$param['wuye_in'];
            $vercode = $param['vercode'];
            $flag    = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";

            if (empty($loupanid) && empty($loupan)) return array("state" => 200, "info" => '请输入楼盘名称');
            if (empty($loupanid) && empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($loupanid) && empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            if (empty($loupanid) && (empty($longitude) || empty($latitude))) return array("state" => 200, "info" => '请选择楼盘坐标');

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if ($lei == 2 && empty($industry)) return array("state" => 200, "info" => '请选择现在经营的行业');
            if (empty($addrid)) return array("state" => 200, "info" => '请选择商铺所在区域');
            if (empty($address)) return array("state" => 200, "info" => '请输入商铺详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            // $userinfo = $userLogin->getMemberInfo();

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_sp` (`cityid`, `type`, `industry`, `title`, `addrid`, `address`, `nearby`, `litpic`, `proprice`, `protype`, `area`, `price`, `transfer`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `zhuangxiu`, `bno`, `floor`, `config`, `suitable`, `note`, `mbody`, `weight`, `state`, `pubdate`, `waitpay`, `alonepay`, `video`, `qj_type`, `qj_file`, `longitude`, `latitude`, `loupan`, `loupanid`, `paytype`, `operating_state`, `miankuan`, `jinshen`, `cenggao`, `floortype`, `floorspr`, `sex`, `wx_tel`, `flag`, `wuye_in`) VALUES ('$cityid', '$lei', '$industry', '$title', '$addrid', '$address', '', '$litpic', '$proprice', '$protype', '$area', '$price', '$transfer', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$zhuangxiu', '$bno', '$floor', '$config', '$suitable', '$note', '', '1', '$arcrank', '" . GetMkTime(time()) . "', '$waitpay', '$alonepay', '$video', '$qj_type', '$qj_file', '$longitude', '$latitude', '$loupan', '$loupanid', '$paytype', '$operating_state', '$miankuan', '$jinshen', '$cenggao', '$floortype', '$floorspr', '$sex', '$wx_tel', '$flag', '$wuye_in')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housesp', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'sp-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'sp', $aid, 'insert', '发布商铺('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house'); // 商铺
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布商铺信息：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "sp", $param);

                //后台消息通知

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);
                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('sp');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][17];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"sp");  // 新增商铺
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //厂房、仓库
        } elseif ($type == "cf") {

            $lei      = (int)$param['lei'];
            $addrid   = (int)$param['addrid'];
            $cityid   = (int)$param['cityid'];
            $address  = filterSensitiveWords(addslashes($param['address']));
            $price    = (int)$param['price'];
            $transfer = (float)$param['transfer'];
            $protype  = (int)$param['protype'];
            $area     = (float)$param['area'];
            $title    = filterSensitiveWords(addslashes($param['title']));
            $litpic   = $param['litpic'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $areaCode  = (int)$param['areaCode'];
            $tel      = filterSensitiveWords(addslashes($param['tel']));
            $note     = filterSensitiveWords($param['note']);
            $imglist  = $param['imglist'];
            $paytype  = (int)$param['paytype'];
            $proprice = $param['proprice'];
            $mintime  = $param['mintime'];
            $bno      = (int)$param['bno'];
            $floor    = (int)$param['floor'];
            $cenggao  = (float)$param['cenggao'];
            $video    = $param['video'];
            $qj_type  = (int)$param['qj_type'];
            $qj_pics  = $param['qj_pics'];
            $qj_url   = $param['qj_url'];
            $lnglat   = $param['lnglat'];
            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $sex     = (int)$param['sex'];
            $wx_tel  = (int)$param['wx_tel'];
            $vercode = $param['vercode'];
            $wuye_in = (int)$param['wuye_in'];

            //坐标
            if (!empty($lnglat)) {
                $lnglat    = explode(",", $lnglat);
                $longitude = $lnglat[0];
                $latitude  = $lnglat[1];
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($addrid)) return array("state" => 200, "info" => '请选择厂房、仓库所在区域');
            if (empty($address)) return array("state" => 200, "info" => '请输入厂房、仓库详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传厂房、仓库代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            // $userinfo = $userLogin->getMemberInfo();

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_cf` (`cityid`, `type`, `title`, `addrid`, `address`, `nearby`, `litpic`, `protype`, `area`, `price`, `transfer`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `note`, `mbody`, `weight`, `state`, `pubdate`, `waitpay`, `alonepay`, `video`, `qj_type`, `qj_file`, `longitude`, `latitude`, `paytype`, `proprice`, `mintime`, `bno`, `floor`, `cenggao`, `floortype`, `floorspr`, `sex`, `wx_tel`, `wuye_in`) VALUES ('$cityid','$lei', '$title', '$addrid', '$address', '', '$litpic', '$protype', '$area', '$price', '$transfer', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$note', '', '1', '$arcrank', '" . GetMkTime(time()) . "', '$waitpay', '$alonepay', '$video', '$qj_type', '$qj_file', '$longitude', '$latitude', '$paytype', '$proprice', '$mintime', '$bno', '$floor', '$cenggao', '$floortype', '$floorspr', '$sex', '$wx_tel', '$wuye_in')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecf', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'cf-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'cf', $aid, 'insert', '发布厂房仓库('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house'); // 厂房
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布厂房/仓库信息：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "cf", $param);

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);

                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('cf');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][18];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint')");
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"cf");  // 新增厂房
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //车位
        } elseif ($type == "cw") {

            $type        = (int)$param['lei'];
            $communityid = (int)$param['communityid'];
            $community   = filterSensitiveWords(addslashes($param['community']));
            $lnglat      = $param['lnglat'];

            if (!$cityid && $communityid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = $communityid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $communityResult[0]['addr'];
                $longitude = $communityResult[0]['longitude'];
                $latitude  = $communityResult[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }
            $address = filterSensitiveWords(addslashes($address));

            $price    = (int)$param['price'];
            $transfer = (float)$param['transfer'];
            $protype  = (int)$param['protype'];
            $area     = (float)$param['area'];
            $title    = filterSensitiveWords(addslashes($param['title']));
            $litpic   = $param['litpic'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $areaCode  = (int)$param['areaCode'];
            $tel      = filterSensitiveWords(addslashes($param['tel']));
            $note     = filterSensitiveWords($param['note']);
            $imglist  = $param['imglist'];
            $paytype  = (int)$param['paytype'];
            $proprice = $param['proprice'];
            $mintime  = $param['mintime'];
            $area     = (float)$param['area'];
            $video    = $param['video'];
            $qj_type  = (int)$param['qj_type'];
            $qj_pics  = $param['qj_pics'];
            $qj_url   = $param['qj_url'];
            $username = $param['username'];
            $contact  = $param['contact'];
            $vercode  = $param['vercode'];

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择车位所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入车位详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传厂房、仓库代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入车位描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            // $userinfo = $userLogin->getMemberInfo();

            $weight = 0;

            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_cw` (`cityid`, `type`, `title`, `communityid`, `community`, `addrid`, `address`, `litpic`, `protype`, `area`, `price`, `transfer`, `usertype`, `userid`, `username`, `areaCode`, `contact`, `note`, `mbody`, `weight`, `state`, `pubdate`, `video`, `qj_type`, `qj_file`, `longitude`, `latitude`, `mintime`, `paytype`, `proprice`, `waitpay`, `alonepay`)
				VALUES
				('$cityid', '$type', '$title', '$communityid', '$community', '$addrid', '$address', '$litpic', '$protype', '$area', '$price', '$transfer', '$usertype', '$uid', '$person', '$areaCode', '$tel', '$note', '$mbody', '$weight', '$arcrank', '" . GetMkTime(time()) . "', '$video', '$qj_type', '$qj_file', '$longitude', '$latitude', '$mintime', '$paytype', '$proprice', '$waitpay', '$alonepay')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecw', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'cw-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'cw', $aid, 'insert', '发布车位('.$title.')', $url, $archives);

                autoShowUserModule($uid,'house'); // 车位
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n发布车位信息：" . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "cw", $param);

                // 更新经纪人套餐
                $this->updateZjuserMeal($uid, "house", $zjuserConfig);
                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($arcrank) {
                    self::clearHouseCache('cw');
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_house > 0) {
                        global  $userLogin;
                        //房产门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_house' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
                        //保存操作日志
                        $info = $langData['siteConfig'][11][22];
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_house', '$info', '$date','zengsong','1','$userpoint+$cfg_returnInteraction_house')");
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $cfg_returnInteraction_house,
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
                dataAsync("house",$aid,"cw");  // 新增车位
                return array("auth" => $auth, "aid" => $aid, "amount" => $amount);
                // return $aid;
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

        }

    }


    /**
     * 修改房源
     * @return array
     */
    public function edit()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        require(HUONIAOINC . "/config/house.inc.php");
        $customagentCheck     = (int)$customagentCheck;
        $customFabuCheckPhone = (int)$customFabuCheckPhone;
        $arcrank              = $customagentCheck;    // 审核开关

        $param = $this->param;
        $id    = $param['id'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        $type  = $param['type'];
        $title = filterSensitiveWords(addslashes($param['title']));

        $param['floor'] = $param['floorval'];  //修复因floor关键字造成的防火墙触发SQL注入问题

        $uid      = $userLogin->getMemberID();
        $loginUid = $uid > 0 ? $uid : 0;
        $userinfo = $loginUid ? $userLogin->getMemberInfo() : array();

        //获取用户ID
        if ($type != "demand") {
            if ($uid == -1) {
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }


            $usertype = $userinfo['userType'] == 1 ? 0 : 1;

            //判断是否经纪人
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $uid = $ret[0]['id'];
            }
        }

        if (empty($title)) return array("state" => 200, "info" => '请输入标题');
        $title = cn_substrR($title, 50);

        // 单层跃层
        if (isset($param['floortype'])) {
            $floortype = (int)$param['floortype'];
        } else {
            if ((int)$param['floorspr'] && (int)$param['floorspr'] > (int)$param['bno'] && (int)$param['floor'] >= (int)$param['floorspr']) {
                $floortype = 1;
            } else {
                $floortype = 0;
            }
        }
        $floorspr = $floortype ? (int)$param['floorspr'] : 0;

        if (isset($param['buildpos'])) {
            $buildpos = $param['buildpos'];
        } elseif (isset($param['dong']) || isset($param['danyuan']) || isset($param['shi'])) {
            $buildpos = $param['dong'] . "||" . $param['danyuan'] . "||" . $param['shi'];
        }

        //求租、求购
        if ($type == "demand") {
            $sex      = (int)$this->param['sex'];
            $password = $this->param['password'];
            if (empty($userinfo) && empty($password)) return array("state" => 200, "info" => '请输入管理密码！');
            $archives = $dsql->SetQuery("SELECT `id`, `userid`, `password`, `contact`, `state` FROM `#@__housedemand` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $detail = $results[0];

                $password_ = "";
                // 会员中心
                if ($userinfo && $_SERVER['HTTP_REFERER'] && strstr($_SERVER['HTTP_REFERER'], 'do=edit')) {
                    if ($userinfo['userid'] != $results[0]['userid']) {
                        return array("state" => 200, "info" => '权限不足，修改失败！');
                    }
                    if ($password) {
                        $password_ = ", `password` = '$password'";
                    }
                } else {
                    if (empty($password)) {
                        return array("state" => 200, "info" => '请输入管理密码！');
                    }
                    if ($results[0]['password'] != $password) {
                        return array("state" => 200, "info" => '管理密码错误，修改失败！');
                    }
                }
            } else {
                return array("state" => 200, "info" => '信息不存在，或已经删除！');
            }

            $category = (int)$param['category'];
            $note     = filterSensitiveWords(addslashes($param['note']));
            $lei      = (int)$param['lei'];
            $cityid   = (int)$param['cityid'];
            $addrid   = (int)$param['addrid'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $contact  = filterSensitiveWords($param['contact']);
            $areaCode = $param['areaCode'];
            $vercode  = $param['vercode'];
            if (empty($note)) return array("state" => 200, "info" => '请输入描述');
            if ($lei == '') return array("state" => 200, "info" => '请选择类别');
            if (empty($addrid)) return array("state" => 200, "info" => '请选择所在区域');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($contact)) return array("state" => 200, "info" => '请输入联系电话');
            if ($customFabuCheckPhone && isset($param['vercode']) && $detail['contact'] != $contact) {

                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $contact;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $contact;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            $note    = cn_substrR($note, 500);
            $person  = cn_substrR($person, 10);
            $contact = cn_substrR($contact, 11);

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__housedemand` SET `cityid` = '$cityid', `title` = '$title', `note` = '$note', `action` = '$lei', `type` = '$category', `addr` = '$addrid', `person` = '$person', `areaCode` = '$areaCode', `contact` = '$contact', `state` = '$arcrank', `sex` = '$sex', `pubdate` = " . GetMkTime(time()) . $password_ . " WHERE `id` = " . $id);
            $return   = $dsql->dsqlOper($archives, "update");
            if ($return == "ok") {
            
                //记录用户行为日志
                memberLog($uid, 'house', 'demand', $id, 'update', '更新求租求购('.$title.')', '', $archives);

                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('demand', $id, $detail['state'], $arcrank);

                return "修改成功！|" . $arcrank;
            } else {
                return array("state" => 101, "info" => '保存到数据时发生错误，请检查字段内容！');
            }

            //二手房
        } elseif ($type == "sale") {

            $archives = $dsql->SetQuery("SELECT `id`,`contact`, `state` FROM `#@__house_sale` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $community   = filterSensitiveWords(addslashes($param['community']));
            $communityid = (int)$param['communityid'];
            $cityid      = (int)$param['cityid'];
            $addrid      = (int)$param['addrid'];
            $address     = filterSensitiveWords(addslashes($param['address']));
            $room        = (int)$param['room'];
            $hall        = (int)$param['hall'];
            $guard       = (int)$param['guard'];
            $area        = (float)$param['area'];
            $bno         = (int)$param['bno'];
            $floor       = (int)$param['floor'];
            $buildage    = (int)$param['buildage'];
            $price       = (float)$param['price'];
            $protype     = (int)$param['protype'];
            $zhuangxiu   = (int)$param['zhuangxiu'];
            $direction   = (int)$param['direction'];
            $flag        = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";
            $title       = filterSensitiveWords(addslashes($param['title']));
            $litpic      = $param['litpic'];
            $person      = filterSensitiveWords(addslashes($param['person']));
            $areaCode     = (int)$param['areaCode'];
            $tel         = filterSensitiveWords(addslashes($param['tel']));
            $note        = filterSensitiveWords($param['note']);
            $imglist     = $param['imglist'];
            $video       = $param['video'];
            $qj_type     = (int)$param['qj_type'];
            $qj_pics     = $param['qj_pics'];
            $qj_url      = $param['qj_url'];
            $elevator    = (int)$param['elevator'];
            $lnglat      = $param['lnglat'];
            $sellstate   = (int)$param['sellstate'];

            // 201903新增
            // $buildpos  = $param['buildpos'];
            $paytax    = (int)$param['paytax'];
            $rights_to = (int)$param['rights_to'];
            $sex       = (int)$param['sex'];
            $wx_tel    = (int)$param['wx_tel'];
            $sourceid  = $param['sourceid'];
            $vercode   = $param['vercode'];

            if (!empty($lnglat)) {
                $lnglat    = explode(",", $lnglat);
                $longitude = $lnglat[0];
                $latitude  = $lnglat[1];
            } else {
                $longitude = $latitude = "";
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($community) && empty($communityid)) return array("state" => 200, "info" => '请输入楼盘名称');
            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            //if($area == 0) return array("state" => 200, "info" => '房源面积必须为整数，不得为0');
            //if($price == 0) return array("state" => 200, "info" => '房源价格必须为整数，不得为0');

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $unitprice = floor($price * 10000 / $area);   //单价

            $community = cn_substrR($community, 60);
            $title     = cn_substrR($title, 60);
            $address   = cn_substrR($address, 60);
            $person    = cn_substrR($person, 10);
            $tel       = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            $archives = $dsql->SetQuery("UPDATE `#@__house_sale` SET `cityid` = '$cityid', `title` = '$title', `communityid` = '$communityid', `community` = '$community', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `price` = '$price', `unitprice` = '$unitprice', `protype` = '$protype', `room` = '$room', `hall` = '$hall', `guard` = '$guard', `bno` = '$bno', `floor` = '$floor', `area` = '$area', `direction` = '$direction', `zhuangxiu` = '$zhuangxiu', `buildage` = '$buildage', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `note` = '$note', `state` = '$arcrank', `sellstate` = $sellstate,`flag` = '$flag', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `elevator` = '$elevator', `longitude` = '$longitude', `latitude` = '$latitude', `buildpos` = '$buildpos', `floortype` = '$floortype', `floorspr` = '$floorspr', `paytax` = '$paytax', `rights_to` = '$rights_to', `sex` = '$sex', `wx_tel` = '$wx_tel', `sourceid` = '$sourceid' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housesale', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'sale-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'sale', $id, 'update', '更新二手房('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新二手房信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "sale", $param);

                if (isset($codeID)) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('sale', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"sale");  // 修改二手房
                return "修改成功！";
            } else {
                return array("state" => 101, "info" => '保存到数据时发生错误，请检查字段内容！');
            }

            //租房
        } elseif ($type == "zu") {

            $archives = $dsql->SetQuery("SELECT `id`, `contact`, `state` FROM `#@__house_zu` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $community   = filterSensitiveWords(addslashes($param['community']));
            $communityid = (int)$param['communityid'];
            $cityid      = (int)$param['cityid'];
            $addrid      = (int)$param['addrid'];
            $address     = filterSensitiveWords(addslashes($param['address']));
            $rentype     = (int)$param['rentype'];
            $sharetype   = (int)$param['sharetype'];
            $sharesex    = (int)$param['sharesex'];
            $room        = (int)$param['room'];
            $hall        = (int)$param['hall'];
            $guard       = (int)$param['guard'];
            $area        = (float)$param['area'];
            $bno         = (int)$param['bno'];
            $floor       = (int)$param['floor'];
            $buildage    = (int)$param['buildage'];
            $price       = (float)$param['price'];
            $paytype     = (int)$param['paytype'];
            $protype     = (int)$param['protype'];
            $zhuangxiu   = (int)$param['zhuangxiu'];
            $direction   = (int)$param['direction'];
            $config      = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $title       = filterSensitiveWords(addslashes($param['title']));
            $litpic      = $param['litpic'];
            $person      = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel         = filterSensitiveWords(addslashes($param['tel']));
            $note        = filterSensitiveWords($param['note']);
            $imglist     = $param['imglist'];
            $video       = $param['video'];
            $qj_type     = (int)$param['qj_type'];
            $qj_pics     = $param['qj_pics'];
            $qj_url      = $param['qj_url'];
            $elevator    = (int)$param['elevator'];
            $lnglat      = $param['lnglat'];
            $sellstate   = (int)$param['sellstate'];

            // 201903新增
            // $buildpos  = $param['buildpos'];
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $wx_tel  = (int)$param['wx_tel'];
            $sex     = (int)$param['sex'];
            $vercode = $param['vercode'];
            $flag    = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";

            if (!empty($lnglat)) {
                $lnglat    = explode(",", $lnglat);
                $longitude = $lnglat[0];
                $latitude  = $lnglat[1];
            } else {
                $longitude = $latitude = "";
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($community) && empty($communityid)) return array("state" => 200, "info" => '请输入楼盘名称');
            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            if ($rentype == 1 && $sharetype == 0) return array("state" => 200, "info" => '请选择要出租的房间');
            if ($rentype == 1 && $sharesex === "") return array("state" => 200, "info" => '请选择合租男女限制');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            //if($area == 0) return array("state" => 200, "info" => '房源面积必须为整数，不得为0');
            //if($price == 0) return array("state" => 200, "info" => '房源价格必须为整数，不得为0');
            if ($paytype == 0) return array("state" => 200, "info" => '请选择租金压付方式');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $community = cn_substrR($community, 60);
            $title     = cn_substrR($title, 60);
            $address   = cn_substrR($address, 60);
            $person    = cn_substrR($person, 10);
            $tel       = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("UPDATE `#@__house_zu` SET `cityid` = '$cityid', `title` = '$title', `communityid` = '$communityid', `community` = '$community', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `price` = '$price', `paytype` = '$paytype', `rentype` = '$rentype', `protype` = '$protype', `room` = '$room', `hall` = '$hall', `guard` = '$guard', `sharetype` = '$sharetype', `sharesex` = '$sharesex', `bno` = '$bno', `sellstate` = '$sellstate',`floor` = '$floor', `area` = '$area', `direction` = '$direction', `zhuangxiu` = '$zhuangxiu', `buildage` = '$buildage', `config` = '$config', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `note` = '$note', `state` = '$arcrank', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `elevator` = '$elevator', `longitude` = '$longitude', `latitude` = '$latitude', `buildpos` = '$buildpos', `floortype` = '$floortype', `floorspr` = '$floorspr', `sex` = '$sex', `wx_tel` = '$wx_tel', `flag` = '$flag' WHERE `id` = " . $id);
            // echo $archives;die;
            $results = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housezu', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'zu-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'zu', $id, 'update', '更新租房('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新租房信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "zu", $param);

                if (isset($codeID)) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('zu', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"zu");  // 修改租房
                return "修改成功！";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //写字楼
        } elseif ($type == "xzl") {

            $archives = $dsql->SetQuery("SELECT `id`, `contact`, `state` FROM `#@__house_xzl` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $lei       = (int)$param['lei'];
            $loupan    = filterSensitiveWords(addslashes($param['loupan']));
            $loupanid  = (int)$param['loupanid'];
            $cityid    = (int)$param['cityid'];
            $fg        = (int)$param['fg'];
            $level     = (int)$param['level'];
            $lnglat    = $param['lnglat'];
            $sellstate = (int)$param['sellstate'];

            if ($loupanid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_loupan` WHERE `id` = $loupanid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $ret[0]['addr'];
                $longitude = $ret[0]['longitude'];
                $latitude  = $ret[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }

            $address = filterSensitiveWords(addslashes($address));

            $price     = (int)$param['price'];
            $proprice  = number_format($param['proprice'], 1);
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            // $config      = !empty($_POST['config']) ? join(",", $_POST['config']) : "";
            $config  = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $title   = filterSensitiveWords(addslashes($param['title']));
            $litpic  = $param['litpic'];
            $person  = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel     = filterSensitiveWords(addslashes($param['tel']));
            $note    = filterSensitiveWords($param['note']);
            $imglist = $param['imglist'];
            $video   = $param['video'];
            $qj_type = (int)$param['qj_type'];
            $qj_pics = $param['qj_pics'];
            $qj_url  = $param['qj_url'];
            $peitao  = !empty($_POST['peitao']) ? (is_array($_POST['peitao']) ? join(",", $_POST['peitao']) : $_POST['peitao']) : "";

            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $wx_tel  = (int)$param['wx_tel'];
            $sex     = (int)$param['sex'];
            $vercode = $param['vercode'];
            $wuye_in = (int)$param['wuye_in'];

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($loupan)) return array("state" => 200, "info" => '请输入楼盘名称');
            if (empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址1');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $loupan  = cn_substrR($loupan, 60);
            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `cityid` = '$cityid', `type` = '$lei', `title` = '$title', `loupan` = '$loupan', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `proprice` = '$proprice', `protype` = '$protype',`sellstate` = '$sellstate', `area` = '$area', `price` = '$price', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `zhuangxiu` = '$zhuangxiu', `bno` = '$bno', `floor` = '$floor', `note` = '$note', `config` = '$config', `state` = '$arcrank', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `longitude` = '$longitude',  `latitude` = '$latitude', `loupanid` = '$loupanid', `fg` = $fg, `level` = $level, `peitao` = '$peitao', `floortype` = '$floortype', `floorspr` = '$floorspr', `wuye_in` = '$wuye_in', `sex` = '$sex', `wx_tel` = '$wx_tel' WHERE `id` = " . $id);
            // var_dump($archives);die;
            $results = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housexzl', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'xzl-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'xzl', $id, 'update', '更新写字楼('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新写字楼信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "xzl", $param);

                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('xzl', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"xzl");  // 修改写字楼
                return "修改成功！";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //商铺
        } elseif ($type == "sp") {

            $archives = $dsql->SetQuery("SELECT `id`, `contact`, `state` FROM `#@__house_sp` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $lei       = (int)$param['lei'];
            $industry  = (int)$param['industry'];
            $loupan    = filterSensitiveWords(addslashes($param['loupan']));
            $loupanid  = (int)$param['loupanid'];
            $cityid    = (int)$param['cityid'];
            $lnglat    = $param['lnglat'];
            $sellstate = (int)$param['sellstate'];

            if ($loupanid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_loupan` WHERE `id` = $loupanid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $ret[0]['addr'];
                $longitude = $ret[0]['longitude'];
                $latitude  = $ret[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }

            $address = filterSensitiveWords(addslashes($address));

            $price     = (int)$param['price'];
            $proprice  = number_format($param['proprice'], 1);
            $transfer  = (float)$param['transfer'];
            $protype   = (int)$param['protype'];
            $zhuangxiu = (int)$param['zhuangxiu'];
            $area      = (float)$param['area'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            // $config      = !empty($_POST['config']) ? join(",", $_POST['config']) : "";
            // $suitable    = !empty($_POST['suitable']) ? join(",", $_POST['suitable']) : "";
            $config          = !empty($_POST['config']) ? (is_array($_POST['config']) ? join(",", $_POST['config']) : $_POST['config']) : "";
            $suitable        = !empty($_POST['suitable']) ? (is_array($_POST['suitable']) ? join(",", $_POST['suitable']) : $_POST['suitable']) : "";
            $title           = filterSensitiveWords(addslashes($param['title']));
            $litpic          = $param['litpic'];
            $person          = filterSensitiveWords(addslashes($param['person']));
            $areaCode         = (int)$param['areaCode'];
            $tel             = filterSensitiveWords(addslashes($param['tel']));
            $note            = filterSensitiveWords($param['note']);
            $imglist         = $param['imglist'];
            $paytype         = (int)$param['paytype'];
            $operating_state = (int)$param['operating_state'];
            $miankuan        = (float)$param['miankuan'];
            $jinshen         = (float)$param['jinshen'];
            $cenggao         = (float)$param['cenggao'];
            $video           = $param['video'];
            $qj_type         = (int)$param['qj_type'];
            $qj_pics         = $param['qj_pics'];
            $qj_url          = $param['qj_url'];

            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $sex     = (int)$param['sex'];
            $wx_tel  = (int)$param['wx_tel'];
            $wuye_in = (int)$param['wuye_in'];
            $vercode = $param['vercode'];
            $flag    = !empty($_POST['flag']) ? (is_array($_POST['flag']) ? join(",", $_POST['flag']) : $_POST['flag']) : "";

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if ($lei == 2 && empty($industry)) return array("state" => 200, "info" => '请选择现在经营的行业');
            if (empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("UPDATE `#@__house_sp` SET `cityid` = '$cityid', `type` = '$lei', `industry` = '$industry', `title` = '$title', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `proprice` = '$proprice', `protype` = '$protype', `area` = '$area', `price` = '$price', `transfer` = '$transfer', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `zhuangxiu` = '$zhuangxiu', `bno` = '$bno', `floor` = '$floor', `config` = '$config', `suitable` = '$suitable', `sellstate` = '$sellstate',`note` = '$note', `state` = '$arcrank', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `longitude` = '$longitude',  `latitude` = '$latitude', `loupan` = '$loupan', `loupanid` = '$loupanid', `paytype` = '$paytype', `operating_state` = '$operating_state', `miankuan` = '$miankuan', `jinshen` = '$jinshen', `cenggao` = '$cenggao', `floortype` = '$floortype', `floorspr` = '$floorspr', `sex` = '$sex', `wx_tel` = '$wx_tel', `wuye_in` = '$wuye_in', `flag` = '$flag' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housesp', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'sp-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'sp', $id, 'update', '更新商铺('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新商铺信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "sp", $param);

                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('sp', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"sp");  // 修改商铺
                return "修改成功！";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //厂房、仓库
        } elseif ($type == "cf") {

            $archives = $dsql->SetQuery("SELECT `id`, `contact`, `state` FROM `#@__house_cf` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $lei       = (int)$param['lei'];
            $addrid    = (int)$param['addrid'];
            $cityid    = (int)$param['cityid'];
            $address   = filterSensitiveWords(addslashes($param['address']));
            $price     = (int)$param['price'];
            $transfer  = (float)$param['transfer'];
            $protype   = $param['protype'];
            $area      = (float)$param['area'];
            $title     = filterSensitiveWords(addslashes($param['title']));
            $litpic    = $param['litpic'];
            $person    = filterSensitiveWords(addslashes($param['person']));
            $areaCode   = (int)$param['areaCode'];
            $tel       = filterSensitiveWords(addslashes($param['tel']));
            $note      = filterSensitiveWords($param['note']);
            $imglist   = $param['imglist'];
            $paytype   = (int)$param['paytype'];
            $proprice  = $param['proprice'];
            $mintime   = $param['mintime'];
            $bno       = (int)$param['bno'];
            $floor     = (int)$param['floor'];
            $cenggao   = (float)$param['cenggao'];
            $video     = $param['video'];
            $qj_type   = (int)$param['qj_type'];
            $qj_pics   = $param['qj_pics'];
            $qj_url    = $param['qj_url'];
            $lnglat    = $param['lnglat'];
            $sellstate = (int)$param['sellstate'];

            // 201903新增
            // $floortype = (int)$param['floortype'];
            // $floorspr  = $floortype ? (int)$param['floorspr'] : 0;
            $sex     = (int)$param['sex'];
            $wx_tel  = (int)$param['wx_tel'];
            $vercode = $param['vercode'];
            $wuye_in = (int)$param['wuye_in'];

            //坐标
            if (!empty($lnglat)) {
                $lnglat    = explode(",", $lnglat);
                $longitude = $lnglat[0];
                $latitude  = $lnglat[1];
            }

            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($addrid)) return array("state" => 200, "info" => '请选择楼盘所在区域');
            if (empty($address)) return array("state" => 200, "info" => '请输入楼盘详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传楼盘代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入房源描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            $usertype = $userinfo['userType'] == 1 ? 0 : 1;

            //保存到表
            $archives = $dsql->SetQuery("UPDATE `#@__house_cf` SET `cityid` = '$cityid', `type` = '$lei', `title` = '$title', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `protype` = '$protype', `area` = '$area', `price` = '$price', `transfer` = '$transfer', `sellstate` = '$sellstate',`username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `note` = '$note', `state` = '$arcrank', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `longitude` = '$longitude',  `latitude` = '$latitude', `paytype` = '$paytype', `proprice` = '$proprice', `mintime` = '$mintime', `bno` = '$bno', `floor` = '$floor', `cenggao` = '$cenggao', `floortype` = '$floortype', `floorspr` = '$floorspr', `sex` = '$sex', `wx_tel` = '$wx_tel', `wuye_in` = '$wuye_in' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecf', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'cf-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'cf', $id, 'update', '更新厂房仓库('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新厂房/仓库信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "cf", $param);
                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('cf', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"cf");  // 修改厂房
                return "修改成功！";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

            //车位
        } elseif ($type == "cw") {

            $archives = $dsql->SetQuery("SELECT `id`, `contact`, `state` FROM `#@__house_cw` WHERE `id` = " . $id . " AND `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => '权限不足，修改失败！');
            }
            $detail = $results[0];

            $lei         = (int)$param['lei'];
            $communityid = (int)$param['communityid'];
            $community   = filterSensitiveWords(addslashes($param['community']));
            $lnglat      = $param['lnglat'];
            $sellstate   = (int)$param['sellstate'];

            if (!$cityid && $communityid) {
                $sql       = $dsql->SetQuery("SELECT `id`,`cityid`,`addrid`,`addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = $communityid");
                $ret       = $dsql->dsqlOper($sql, "results");
                $cityid    = $ret[0]['cityid'];
                $addrid    = $ret[0]['addrid'];
                $address   = $communityResult[0]['addr'];
                $longitude = $communityResult[0]['longitude'];
                $latitude  = $communityResult[0]['latitude'];
            } else {
                //坐标
                if (!empty($lnglat)) {
                    $lnglat    = explode(",", $lnglat);
                    $longitude = $lnglat[0];
                    $latitude  = $lnglat[1];
                }
                $addrid  = (int)$param['addrid'];
                $address = $param['address'];
            }
            $address = filterSensitiveWords(addslashes($address));

            $lei      = (int)$param['lei'];
            $price    = (int)$param['price'];
            $transfer = (float)$param['transfer'];
            $protype  = (int)$param['protype'];
            $area     = (float)$param['area'];
            $title    = filterSensitiveWords(addslashes($param['title']));
            $litpic   = $param['litpic'];
            $person   = filterSensitiveWords(addslashes($param['person']));
            $areaCode = (int)$param['areaCode'];
            $tel      = filterSensitiveWords(addslashes($param['tel']));
            $note     = filterSensitiveWords($param['note']);
            $imglist  = $param['imglist'];
            $video    = $param['video'];
            $qj_type  = (int)$param['qj_type'];
            $qj_pics  = $param['qj_pics'];
            $qj_url   = $param['qj_url'];
            $paytype  = (int)$param['paytype'];
            $proprice = $param['proprice'];
            $mintime  = $param['mintime'];
            $area     = (float)$param['area'];

            // 201903新增
            $sex     = (int)$param['sex'];
            $wx_tel  = (int)$param['wx_tel'];
            $wuye_in = (int)$param['wuye_in'];
            $vercode = $param['vercode'];


            if (empty($cityid)) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
                $cityInfoArr = explode(',', $cityInfoArr);
                $cityid      = $cityInfoArr[0];
            }

            if (empty($communityid) && empty($addrid)) return array("state" => 200, "info" => '请选择车位所在区域');
            if (empty($communityid) && empty($address)) return array("state" => 200, "info" => '请输入车位详细地址');
            // if(empty($litpic)) return array("state" => 200, "info" => '请上传厂房、仓库代表图片');
            // if(empty($note)) return array("state" => 200, "info" => '请输入车位描述');
            if (empty($litpic)) return array("state" => 200, "info" => '请上传图片');
            if (empty($person)) return array("state" => 200, "info" => '请输入联系人');
            if (empty($tel)) return array("state" => 200, "info" => '请输入手机号码');
            if ($customFabuCheckPhone && $detail['contact'] != $tel && (!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel)) {
                if (empty($vercode)) return array("state" => 200, "info" => '请输入验证码');
                //国际版需要验证区域码
                $cphone_  = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $tel;
                    }
                }

                $ip       = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code   = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if (strtolower($vercode) != $code) {
                        return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if ($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                } else {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }

            if ($qj_type == 0) {
                if ($qj_pics) {
                    $qj_pics_ = explode(",", $qj_pics);
                    if (count($qj_pics_) != 6) return array("state" => 200, "info" => '请上传6张全景图片');
                    $qj_file = $qj_pics;
                }
            } else {
                $qj_file = $qj_url;
            }

            $title   = cn_substrR($title, 60);
            $address = cn_substrR($address, 60);
            $person  = cn_substrR($person, 10);
            $tel     = cn_substrR($tel, 11);

            $areaCode = $areaCode == 86 ? '' : $areaCode;

            //保存到表
            $archives = $dsql->SetQuery("UPDATE `#@__house_cw` SET `cityid` = '$cityid', `type` = '$lei', `title` = '$title', `communityid` = '$communityid', `community` = '$community', `addrid` = '$addrid', `address` = '$address', `litpic` = '$litpic', `protype` = '$protype', `sellstate` = '$sellstate',`area` = '$area', `price` = '$price', `transfer` = '$transfer', `username` = '$person', `areaCode` = '$areaCode', `contact` = '$tel', `note` = '$note', `mbody` = '$mbody', `weight` = '$weight', `state` = '$arcrank', `pubdate` = '" . GetMkTime(time()) . "', `video` = '$video', `qj_type` = '$qj_type', `qj_file` = '$qj_file', `longitude` = '$longitude', `latitude` = '$latitude', `mintime` = '$mintime', `paytype` = '$paytype', `proprice` = '$proprice', `sex` = '$sex', `wx_tel` = '$wx_tel', `wuye_in` = '$wuye_in' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            //先删除文档所属图集
            $_archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecw' AND `aid` = " . $id);
            $dsql->dsqlOper($_archives, "update");

            //保存图集表
            if ($imglist != "") {
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    $picInfo = explode("|", $v);
                    if($picInfo[0] != '' && $picInfo[0] != 'undefined'){
                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('housecw', '$id', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }
            }

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'cw-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'house', 'cw', $id, 'update', '更新车位('.$title.')', $url, $archives);


                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n更新车位信息ID：" . $id,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("house", "cw", $param);
                if ($codeID) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $codeID");
                    $dsql->dsqlOper($sql, "update");
                }

                self::clearHouseCache('cw', $id, $detail['state'], $arcrank);
                dataAsync("house",$id,"cw");  // 修改车位

                return "修改成功！";
            } else {

                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }

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

        $id       = $this->param['id'];
        $type     = $this->param['type'];
        $password = $this->param['password'];

        if (!is_numeric($id) || empty($type)) return array("state" => 200, "info" => '格式错误！');

        $uid      = $userLogin->getMemberID();
        $loginUid = $uid > 0 ? $uid : 0;

        //获取用户ID
        if ($type != 'demand') {
            if ($uid == -1) {
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }

            //判断是否经纪人
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $uid = $ret[0]['id'];
            }
        }

        //求租、求购
        if ($type == "demand") {

            $password = $this->param['password'];
            if (!$loginUid && empty($password)) return array("state" => 200, "info" => '请输入管理密码11！');
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `password` FROM `#@__housedemand` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                // 会员中心
                if ($loginUid && $_SERVER['HTTP_REFERER'] && strstr($_SERVER['HTTP_REFERER'], 'manage')) {
                    if ($loginUid != $results[0]['userid']) {
                        return array("state" => 200, "info" => '权限不足，修改失败！');
                    }
                } else {
                    if (empty($password)) {
                        return array("state" => 200, "info" => '请输入管理密码！');
                    }
                    if ($results[0]['password'] != $password) {
                        return array("state" => 200, "info" => '管理密码输入错误，删除失败！');
                    }
                }
            } else {
                return array("state" => 200, "info" => '信息不存在，或已经删除！');
            }
            $archives = $dsql->SetQuery("DELETE FROM `#@__housedemand` WHERE `id` = " . $id);
            $dsql->dsqlOper($archives, "update");
            
            //记录用户行为日志
            memberLog($uid, 'house', 'demand', $id, 'delete', '删除求租求购('.$results[0]['title'].')', '', $archives);

            self::clearHouseCache($type, $id);
            return '删除成功！';

            //二手房
        } elseif ($type == "sale") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_sale` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_sale` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'sale', $id, 'delete', '删除二手房('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }


            //租房
        } elseif ($type == "zu") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_zu` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_zu` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'zu', $id, 'delete', '删除租房('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }

            //写字楼
        } elseif ($type == "xzl") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_xzl` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_xzl` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'xzl', $id, 'delete', '删除写字楼('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }

            //商铺
        } elseif ($type == "sp") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_sp` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_sp` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'sp', $id, 'delete', '删除商铺('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }

            //厂房、仓库
        } elseif ($type == "cf") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_cf` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_cf` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'cf', $id, 'delete', '删除厂房仓库('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }

            //车位
        } elseif ($type == "cw") {

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_cw` WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $title = $results[0]['title'];

                if ($results[0]['userid'] == $uid) {
                    //删除缩略图
                    delPicFile($results[0]['litpic'], "delThumb", "house", false);
                    delPicFile($results[0]['litpic'], "delAtlas", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

                    //删除内容图片
                    $body = $results[0]['note'];
                    if (!empty($body)) {
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housecw' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecw' AND `aid` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_cw` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($uid, 'house', 'cw', $id, 'delete', '删除车位('.$title.')', '', $archives);

                    self::clearHouseCache($type, $id);
                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
                }
            } else {
                return array("state" => 101, "info" => '信息不存在，或已经删除！');
            }
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

        $aid  = $this->param['aid'];
        $type = $this->param['type'];

        if (!is_numeric($aid) || empty($type)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 101, "info" => '登录超时，请重新登录！');
        }

        $zjid = 0;
        $sql  = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
        $ret  = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $zjid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT `state`, `isbid`, `usertype`, `userid`, `bid_price`, `bid_end` FROM `#@__house_" . $type . "` WHERE `id` = " . $aid);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            if ($results[0]['userid'] != $uid && $zjid != $results[0]['userid']) {
                return array("state" => 200, "info" => '您走错地方了吧，只能竞价自己发布的信息哦！');
            } elseif ($results[0]['state'] != 1) {
                return array("state" => 200, "info" => '只有已审核的信息才可以竞价！');
            } elseif ($results[0]['isbid'] == 1) {
                //已经竞价
                return array('isbid' => 1, 'bid_price' => $results[0]['bid_price'], 'bid_end' => $results[0]['bid_end'], 'now' => GetMkTime(time()));
            } else {
                return 'true';
            }
        } else {
            return array("state" => 200, "info" => '信息不存在，或已经删除，不可以竞价，请确认后重试！');
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

        $param   = $this->param;
        $aid     = $param['aid'];           //信息ID
        $type    = $param['type'];          //栏目
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
            "service"  => "member",
            "type"     => "user",
            "template" => "manage",
            "module"   => "house",
            "dopost"   => $type
        );
        $url   = getUrlPath($param);

        //验证金额
        if ($amount <= 0 || !is_numeric($aid) || empty($type) || empty($paytype)) {
            header("location:" . $url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `state`, `isbid`, `usertype`, `userid` FROM `#@__house_" . $type . "` WHERE `id` = " . $aid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            //信息不存在
            header("location:" . $url);
            die;
        }
        $userid = $ret[0]['userid'];

        //没有审核的信息不可以竞价
        if ($ret[0]['state'] != 1) {
            header("location:" . $url);
            die;
        }

        //已经竞价的，不可以再提交
        if ($ret[0]['isbid'] == 1) {
            header("location:" . $url);
            die;
        }

        $zjid = 0;
        $sql  = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
        $ret  = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $zjid = $ret[0]['id'];
        }

        //只能给自己发布的信息竞价
        if ($userid != $uid && $userid != $zjid) {
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

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bid` (`ordernum`, `module`, `part`, `uid`, `aid`, `start`, `end`, `price`, `state`) VALUES ('$ordernum', 'house', '$type', '$uid', '$aid', '$start', '$end', '$price', 0)");
        $return   = $dsql->dsqlOper($archives, "update");
        if ($return != "ok") {
            die("提交失败，请稍候重试！");
        }

        $tit = "";
        if ($type == "sale") {
            $tit = "二手房";
        } elseif ($type == "zu") {
            $tit = "租房";
        } elseif ($type == "xzl") {
            $tit = "写字楼";
        } elseif ($type == "sp") {
            $tit = "商铺";
        } elseif ($type == "cf") {
            $tit = "厂房/仓库";
        }

        //跳转至第三方支付页面
        createPayForm("house", $ordernum, $amount, $paytype, "房产" . $tit . "竞价");

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

        $param   = $this->param;
        $aid     = $param['aid'];           //信息ID
        $type    = $param['type'];          //栏目
        $price   = (float)$param['price'];  //每日预算
        $paytype = $param['paytype'];       //支付方式

        $uid = $userLogin->getMemberID();  //当前登录用户
        if ($uid == -1) {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "/login.html");
            die;
        }

        //信息url
        $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "manage",
            "module"   => "info"
        );
        $url   = getUrlPath($param);

        //验证金额
        if (!is_numeric($aid) || empty($type) || empty($paytype)) {
            header("location:" . $url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `state`, `isbid`, `usertype`, `userid`, `bid_price`, `bid_start`, `bid_end` FROM `#@__house_" . $type . "` WHERE `id` = " . $aid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            //信息不存在
            header("location:" . $url);
            die;
        }
        $userid = $ret[0]['userid'];

        //没有审核的信息不可以竞价
        if ($ret[0]['state'] != 1) {
            header("location:" . $url);
            die;
        }

        //如果没有参加过竞价，则不可以进行加价操作
        if ($ret[0]['isbid'] != 1) {
            header("location:" . $url);
            die;
        }

        $zjid = 0;
        $sql  = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
        $ret_ = $dsql->dsqlOper($sql, "results");
        if ($ret_) {
            $zjid = $ret_[0]['id'];
        }

        //只能给自己发布的信息竞价
        if ($userid != $uid && $userid != $zjid) {
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

        $archives = $dsql->SetQuery("INSERT INTO `#@__member_bid` (`ordernum`, `module`, `part`, `uid`, `aid`, `start`, `end`, `price`, `state`) VALUES ('$ordernum', 'house', '$type', '$uid', '$aid', '$start', '$end', '$price', 0)");
        $return   = $dsql->dsqlOper($archives, "update");
        if ($return != "ok") {
            die("提交失败，请稍候重试！");
        }

        $tit = "";
        if ($type == "sale") {
            $tit = "二手房";
        } elseif ($type == "zu") {
            $tit = "租房";
        } elseif ($type == "xzl") {
            $tit = "写字楼";
        } elseif ($type == "sp") {
            $tit = "商铺";
        } elseif ($type == "cf") {
            $tit = "厂房/仓库";
        }

        //跳转至第三方支付页面
        createPayForm("house", $ordernum, $amount, $paytype, "房产" . $tit . "竞价加价");

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
            $date     = GetMkTime(time());

            $archives = $dsql->SetQuery("SELECT `amount`, `uid`, `body` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $body = unserialize($results[0]['body']);

                if ($body && is_array($body)) {
                    $type = $body['type'];

                    // 中介购买经纪人套餐
                    if ($type == "buymeal") {
                        $this->buymealSuccess($ordernum);
                    }

                    return;
                }

                //查询订单信息
                $sql = $dsql->SetQuery("SELECT * FROM `#@__member_bid` WHERE `ordernum` = '$ordernum'");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    $bid   = $ret[0]['id'];
                    $part  = $ret[0]['part'];
                    $uid   = $ret[0]['uid'];
                    $aid   = $ret[0]['aid'];
                    $start = $ret[0]['start'];
                    $end   = $ret[0]['end'];
                    $price = $ret[0]['price'];

                    //总价 = (结束时间 - 开始时间) 得到天数 * 每日预算
                    $day    = ($end - $start) / 24 / 3600;
                    $amount = $day * $price;

                    //信息
                    $sql       = $dsql->SetQuery("SELECT `title`, `isbid`, `bid_price` FROM `#@__house_" . $part . "` WHERE `id` = $aid");
                    $ret       = $dsql->dsqlOper($sql, "results");
                    $title     = $ret[0]['title'];
                    $isbid     = $ret[0]['isbid'];
                    $bid_price = $ret[0]['bid_price'];

                    //更新订单状态
                    $sql = $dsql->SetQuery("UPDATE `#@__member_bid` SET `state` = 1 WHERE `id` = " . $bid);
                    $dsql->dsqlOper($sql, "update");

                    $tit = "";
                    if ($part == "sale") {
                        $tit = "二手房";
                    } elseif ($part == "zu") {
                        $tit = "租房";
                    } elseif ($part == "xzl") {
                        $tit = "写字楼";
                    } elseif ($part == "sp") {
                        $tit = "商铺";
                    } elseif ($part == "cf") {
                        $tit = "厂房/仓库";
                    }

                    $currency = echoCurrency(array("type" => "short"));

                    //加价
                    if ($isbid == 1) {

                        $title = '房产' . $tit . '竞价加价，每天增加预算' . $price . $currency . '：<a href="' . $cfg_secureAccess . $cfg_basehost . '/index.php?service=house&template=' . $part . '-detail&id=' . $aid . '" target="_blank">' . $title . '</a>';

                        //更新信息竞价状态
                        $sql = $dsql->SetQuery("UPDATE `#@__house_" . $part . "` SET `bid_price` = `bid_price` + '$price' WHERE `id` = " . $aid);
                        $dsql->dsqlOper($sql, "update");
            
                        //记录用户行为日志
                        memberLog($uid, 'house', 'bid', $aid, 'update', '置顶加价('.$tit.')', '', $sql);

                        $user  = $userLogin->getMemberInfo($uid, 1);
                        $usermoney = $user['money'];
                        //保存操作日志
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`balance`) VALUES ('$uid', '0', '$amount', '$title', '$date','$usermoney-$amount')");
                        $dsql->dsqlOper($archives, "update");


                        //竞价
                    } else {

                        $title = '房产' . $tit . '竞价' . $day . '天，每天预算' . $price . $currency . '，结束时间：' . date("Y-m-d H:i:s", $end) . '：<a href="' . $cfg_secureAccess . $cfg_basehost . '/index.php?service=house&template=' . $part . '-detail&id=' . $aid . '" target="_blank">' . $title . '</a>';

                        //更新信息竞价状态
                        $sql = $dsql->SetQuery("UPDATE `#@__house_" . $part . "` SET `isbid` = 1, `bid_price` = '$price', `bid_start` = '$start', `bid_end` = '$end' WHERE `id` = " . $aid);
                        $dsql->dsqlOper($sql, "update");
            
                        //记录用户行为日志
                        memberLog($uid, 'house', 'bid', $aid, 'update', '置顶('.$tit.')', '', $sql);

                        $user  = $userLogin->getMemberInfo($uid, 1);
                        $usermoney = $user['money'];
                        //保存操作日志
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`balance`) VALUES ('$uid', '0', '$amount', '$title', '$date','$usermoney-$amount')");
                        $dsql->dsqlOper($archives, "update");

                    }


                }

            }

        }
    }


    /**
     * 预约看房
     *
     */
    public function booking()
    {
        global $dsql;
        global $userLogin;
        $ip       = GetIP();
        $param    = $this->param;
        $type     = (int)$param['type'];
        $loupan   = filterSensitiveWords(addslashes($param['loupan']));
        $amount   = (float)$param['amount'];
        $huxing   = filterSensitiveWords(addslashes($param['huxing']));
        $name     = filterSensitiveWords(addslashes($param['name']));
        $areaCode = $param['areaCode'];
        $mobile   = filterSensitiveWords(addslashes($param['mobile']));
        $note     = filterSensitiveWords(addslashes($param['note']));
        $flag     = $param['flag'];
        $vercode  = $param['code'];
        $cityid   = getCityId();

        if ($flag) {
            //国际版需要验证区域码
            $cphone_  = $mobile;
            $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $international = $results[0]['international'];
                if ($international) {
                    $cphone_ = $areaCode . $phone;
                }
            }

            $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'sms_login' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->dsqlOper($sql_code, "results");
            if ($res_code) {
                $code = $res_code[0]['code'];
                if (strtolower($vercode) != $code) {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
            }
        }
        //获取用户ID
        $uid = $userLogin->getMemberID();

        $date = GetMkTime(time());
        $ip   = GetIP();

        if (empty($loupan)) return array("state" => 101, "info" => '请填写意向楼盘！');
        if (!$flag) {
            // if(empty($amount)) return array("state" => 101, "info" => '请填写预算价格！');
        }
        if (empty($name)) return array("state" => 101, "info" => '请填写联系人！');
        if (empty($mobile)) return array("state" => 101, "info" => '请填写手机号码！');

        //手机号码增加区号
        $mobile = ($areaCode == '86' ? '' : $areaCode) . $mobile;

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_booking` WHERE `mobile` = '$mobile' AND `loupan` = '$loupan' LIMIT 0, 1");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if ($ret > 0) return array("state" => 101, "info" => '您已经预约过！');

        $sql = $dsql->SetQuery("INSERT INTO `#@__house_booking` (`cityid`, `uid`, `type`, `loupan`, `amount`, `huxing`, `name`, `mobile`, `note`, `date`, `ip`) VALUES ('$cityid', '$uid', '$type', '$loupan', '$amount', '$huxing', '$name', '$mobile', '$note', '$date', '$ip')");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret != "ok") {
            return array("state" => 101, "info" => '预约失败，请稍候重试！');
        } else {
            return '预约成功！';
        }

    }


    /**
     * 预约看房列表
     *
     */
    public function bookingList()
    {
        global $dsql;
        global $userLogin;

        $param    = $this->param;
        $type     = $this->param['type'];
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = "";

        if (!empty($type)) {
            $where = " AND `type` = $type";
        }

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        $archives       = $dsql->SetQuery("SELECT `loupan`, `name`, `mobile`, `date` FROM `#@__house_booking` WHERE 1 = 1" . $where . " ORDER BY `id` DESC");
        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_booking` WHERE 1 = 1" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives_count, "results");
        $totalCount = $totalCount[0]['count'];
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        $list    = array();
        foreach ($results as $key => $val) {
            $list[$key]['loupan'] = $val['loupan'];
            $list[$key]['name']   = cn_substrR($val['name'], 1) . "**";
            $list[$key]['mobile'] = preg_replace('/(1[34578]{1}[0-9])[0-9]{8}/is', "$1********", $val['mobile']);
            $list[$key]['date']   = date("Y-m-d", $val['date']);
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 接口调用当前运营城市
     */
    public function getCurrentCity()
    {
        global $dsql;
        require(HUONIAOINC . "/config/house.inc.php");
        $currentCity = array();

        if ($customSubwayCity) {
            $houseCityName = "";
            $sql           = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` = $customSubwayCity");
            $ret           = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $houseCityName = $ret[0]['typename'];
            }

            global $data;
            $data     = "";
            $areaName = getParentArr("site_area", $customSubwayCity);
            $areaName = array_reverse(parent_foreach($areaName, "typename"));

            $currentCity = array(
                'cityId'    => $customSubwayCity,
                'cityName'  => $houseCityName,
                'cityNames' => $areaName
            );
        }
        return $currentCity;

    }

    /**
     * 楼盘视频列表
     * @return array
     */
    public function loupanVideoList()
    {
        global $dsql;
        $pageinfo = $list = $lidArr = array();
        $loupanid = $page = $pageSize = $where = $orderby = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $loupanid = $this->param['loupanid'];
                $rand     = $this->param['rand'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $where = $where2 = "";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where2 = " `cityid` = " . $cityid;
            }
        }

        if (empty($loupanid)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE 1 = 1 AND" . $where2);
            $results  = $dsql->dsqlOper($archives, "results");
            foreach ($results as $key => $value) {
                $lidArr[$key] = $value['id'];
            }
            if ($lidArr) {
                $where .= " AND `loupan` in (" . join(",", $lidArr) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        if (!empty($loupanid)) {
            $where .= " AND `loupan` = " . $loupanid;
        }

        $orderby = ' ORDER BY `id` DESC';
        if (!empty($rand)) {
            $orderby = ' ORDER BY rand()';
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //查表
        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupanvideo` WHERE 1 = 1" . $where . $orderby);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id'] = $val['id'];

                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__house_loupan` WHERE `id` = " . $val['loupan']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $list[$key]['loupan'] = $ret[0]['title'];
                } else {
                    $list[$key]['loupan'] = "";
                }

                $list[$key]['title']     = $val['title'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['litpic']    = $val['litpic'] ? getFilePath($val['litpic']) : "";
                $list[$key]['videotype'] = $val['videotype'];
                $list[$key]['videourl']  = $val['videourl'];
                $list[$key]['pubdate']   = $val['pubdate'];

                $param             = array(
                    "service"  => "house",
                    "template" => "loupan-video-detail",
                    "id"       => $val['loupan'],
                    "aid"      => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 楼盘视频详细
     * @return array
     */
    public function loupanVideoDetail()
    {
        global $dsql;
        $listingDetail = array();
        $id            = $this->param;

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupanvideo` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            return $results[0];
        }
    }


    /**
     * 中介公司添加经纪人
     */
    public function addZjUser()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();

        $param = $this->param;
        $name  = $param['nickname'];
        $phone = $param['phone'];
        $photo = $param['photo'];
        $pswd  = $param['password'];

        $pubdate = GetMkTime(time());

        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        if (!verifyModuleAuth(array("module" => "house"))) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        $archives = $dsql->SetQuery("SELECT `id`, `cityid`, `state` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
        $results  = $dsql->dsqlOper($archives, "results");
        if (!$results) return array("state" => 200, "info" => '您还没有开通中介公司');
        if ($results[0]['state'] != 1) return array("state" => 200, "info" => '您的中介公司还没有通过审核');

        $zjComDetail = $results[0];

        if (empty($name)) return array("state" => 200, "info" => '请填写姓名');
        if (empty($phone)) return array("state" => 200, "info" => '请填写手机号');
        // 验证手机号是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$phone' || `phone` = '$phone'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            return array("state" => 200, "info" => '该手机号已被注册，请重新填写');
        }

        if (empty($pswd)) return array("state" => 200, "info" => '请填写登陆密码');
        // preg_match('/^.{5,}$/', $pswd, $matchPassword);
        // if (!$matchPassword) return array("state" => 200, "info" => '密码格式有误，最少5个字符');
        $validatePassword = validatePassword($pswd);
        if($validatePassword != 'ok'){
            return array ('state' => 200, 'info' => $validatePassword);
        }

        // 创建会员
        $password  = $userLogin->_getSaltedHash($pswd);
        $regtime   = $pubdate;
        $regip     = GetIP();
        $regipaddr = getIpAddr($regip);
        $regfrom = getCurrentTerminal();

        $sql = $dsql->SetQuery("INSERT INTO `#@__member`
			(`mtype`, `username`, `password`, `phone`, `nickname`, `photo`, `state`, `purviews`, `regtime`, `regip`, `regipaddr`, `regfrom`)
			VALUES
			(1, '$phone', '$password', '$phone', '$name', '$photo', 1, '', '$regtime', '$regip', '$regipaddr', '$regfrom')");
        $uid = $dsql->dsqlOper($sql, "lastid");
        if (is_numeric($uid)) {

            // 创建经纪人
            $zjcom     = $zjComDetail['id'];
            $cityid    = $zjComDetail['cityid'];
            $store     = '';
            $addr      = 0;
            $community = '';
            $litpic    = $photo;
            $note      = '';
            $state     = 1;
            $flat      = '';

            //新建经纪人时保存免费套餐数据
            $meal = $this->getFreeMeal();

            $archives = $dsql->SetQuery("INSERT INTO `#@__house_zjuser` (`cityid`,`userid`, `zjcom`, `store`, `addr`, `community`, `litpic`, `note`, `state`, `flag`, `weight`, `pubdate`, `by_zjcom`, `meal`) VALUES ('$cityid','$uid', '$zjcom', '$store', '$addr', '$community', '$litpic', '$note', 1, 0, 1, '$pubdate', $zjcom, '$meal' )");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            $urlParam = array(
                'service' => 'house',
                'template' => 'broker-detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
            
            //记录用户行为日志
            memberLog($userid, 'house', 'broker', $aid, 'insert', '添加经纪人('.$aid.')', $url, $archives);

            clearCache("house_zjuser_list", "key");
            clearCache("house_zjuser_total", "key");

            return "添加成功";
        } else {
            return array("state" => 200, "info" => '添加失败，请重试！');
        }

    }

    /**
     * 中介公司操作经纪人
     * type=del: 删除
     * type=update: 更新
     */
    public function operZjUser()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();

        $param = $this->param;
        $id    = (int)$param['id'];
        $type  = $param['type'];

        $pubdate = GetMkTime(time());

        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        if (!verifyModuleAuth(array("module" => "house"))) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        $archives = $dsql->SetQuery("SELECT `id`, `cityid`, `state` FROM `#@__house_zjcom` WHERE `userid` = " . $userid);
        $results  = $dsql->dsqlOper($archives, "results");
        if (!$results) return array("state" => 200, "info" => '您还没有开通中介公司');
        if ($results[0]['state'] != 1) return array("state" => 200, "info" => '您的中介公司还没有通过审核');

        $zjComDetail = $results[0];

        if (empty($type) || empty($id)) return array("state" => 200, "info" => '参数错误');

        $sql = $dsql->SetQuery("SELECT `id`, `userid`, `by_zjcom`, `joindate`, `state` FROM `#@__house_zjuser` WHERE `id` = $id AND `zjcom` = " . $zjComDetail['id']);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) return array("state" => 200, "info" => '经纪人不存在或没有管理权限');

        $uid      = $ret[0]['userid'];
        $joindate = $ret[0]['joindate'];
        $state    = $ret[0]['state'];


        if ($type == "del") {

            $sql = $dsql->SetQuery("DELETE FROM `#@__house_zjuser` WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "update");
            if ($res == "ok") {
                
                //记录用户行为日志
                memberLog($userid, 'house', 'broker', $id, 'delete', '删除经纪人('.$id.')', '', $sql);

                // 中介公司添加的经纪人同时删除会员账号
                if ($ret[0]['by_zjcom'] == $zjComDetail['id']) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE `id` = $uid");
                    $dsql->dsqlOper($sql, "update");
                }

                if ($state == 1) {
                    // 清除缓存
                    checkCache("house_zjuser_list", $id);
                    clearCache("house_zjuser_detail", $id);
                    clearCache("house_zjuser_total", "key");
                }

                return "操作成功！";
            } else {
                return array("state" => 200, "info" => "操作失败，请重试！");
            }
            // 同意
        } elseif ($type == "agree") {
            if ($joindate == 0) {
                $joindate_ = ", `joindate` = $pubdate";
            }
            $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `state` = 1 $joindate_ WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "update");
            if ($res == "ok") {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'broker-detail',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
                
                //记录用户行为日志
                memberLog($userid, 'house', 'broker', $id, 'update', '审核经纪人('.$id.')', $url, $sql);

                // 清除缓存
                clearCache("house_zjuser_list", "key");
                clearCache("house_zjuser_total", "key");

                return "操作成功！";
            } else {
                return array("state" => 200, "info" => "操作失败，请重试！");
            }

        } elseif ($type == "update") {
            $field    = "";
            $name     = $param['nickname'];
            $phone    = $param['phone'];
            $photo    = $param['photo'];
            $joindate = $param['joindate'];

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = $uid");
            $res = $dsql->dsqlOper($sql, "results");
            if (!$res) return array("state" => 200, "info" => '用户不存在！');

            if (empty($name)) return array("state" => 200, "info" => '请填写姓名');
            if (empty($phone)) return array("state" => 200, "info" => '请填写手机号');

            $field .= ", `nickname` = '$name', `photo` = '$photo'";

            // 验证手机号是否存在
            $sql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE (`username` = '$phone' || `phone` = '$phone') AND `id` != $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                return array("state" => 200, "info" => '手机号已存在');
            }
            if ($ret[0]['username'] == $phone) {
                $field .= ", `username` = '$phone', `phone` = '$phone'";
            } else {
                $field .= ", `phone` = '$phone'";
            }
            if ($field) {
                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `id` = $uid $field WHERE `id` = $uid");
                $res = $dsql->dsqlOper($sql, "update");
                if ($res != "ok") return array("state" => 200, "info" => '操作失败');
            }
            if ($joindate) {
            }
            $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `photo` = $photo WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "udpate");

            $urlParam = array(
                'service' => 'house',
                'template' => 'broker-detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
            
            //记录用户行为日志
            memberLog($userid, 'house', 'broker', $id, 'update', '更新经纪人资料('.$id.')', $url, $sql);

            // 清除缓存
            checkCache("house_zjuser_list", $id);
            clearCache("house_zjuser_detail", $id);
            clearCache("house_zjuser_total", "key");

            return "操作成功";

        }

    }

    /**
     * 车位列表
     * @return array
     */
    public function cwList()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $zj       = $type = $addrid = $price = $area = $protype = $keywords = $usertype = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";

        $loginUid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $comid     = $this->param['comid'];
                $zj        = $this->param['zj'];
                $type      = $this->param['type'];
                $addrid    = (int)$this->param['addrid'];
                $price     = convertArrToStrWithComma($this->param['price']);
                $area      = $this->param['area'];
                $protype   = $this->param['protype'];
                $keywords  = $this->param['keywords'];
                $usertype  = (int)$this->param['usertype'];
                $lng       = $this->param['lng'];
                $lat       = $this->param['lat'];
                $community = $this->param['community'];
                $orderby   = $this->param['orderby'];
                $u         = (int)$this->param['u'];
                $uid       = (int)$this->param['uid'];
                $state     = $this->param['state'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $backTotal = $this->param['backTotal'];
                $qj        = (int)$this->param['qj'];
                $video     = (int)$this->param['video'];
                $id = $this->param['id'];  //指定信息id，多个用,分隔
            }
        }

        if ($orderby == "juli") {
            if (empty($lng) || empty($lat)) $orderby = 0;
        }

        if ($qj) {
            $where .= " AND s.`qj_file` != ''";
        }
        if ($video) {
            $where .= " AND s.`video` != ''";
        }

        //是否输出当前登录会员的信息
        if ($u != 1) {

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND s.`cityid` = " . $cityid;
                }
            }

            // $where .= " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
            $where .= " AND s.`state` = 1 AND s.`waitpay` = 0";

            //取指定会员的信息
            if ($uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
                } else {
                    $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
                }
            }
        } else {
            $uid = $loginUid;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $ret[0]['id'];
            } else {
                $where .= " AND s.`usertype` = 0 AND s.`userid` = " . $uid;
            }

            if ($state != "") {
                $where1 = " AND s.`state` = " . $state;
            }
        }

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
            $where .= " AND s.`id` IN ($id)";
        }

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }

        //类型
        if ($type != "") {
            $where .= " AND s.`type` = " . $type;
        }

        //性质
        if ($usertype != "") {
            $where .= " AND s.`usertype` = " . $usertype;
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }

            $where .= " AND s.`addrid` in ($lower)";

        }


        // 中介公司
        if ($comid) {
            // 查询公司下所有中介
            $arcZj = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `zjcom` = $comid");
            $retZj = $dsql->dsqlOper($arcZj, "results");
            if ($retZj) {
                $zjUserList = array();
                foreach ($retZj as $k => $v) {
                    array_push($zjUserList, $v['id']);
                }
                $where .= " AND s.`usertype` = 1 AND s.`userid` in(" . join(',', $zjUserList) . ")";
            } else {
                $where .= " AND 1 = 2";
            }
        }

        //价格区间
        if ($price != "") {

            $price = explode(",", $price);
            // 出租
            if ($type == 0) {
                $mu = 1;
                if (empty($price[0])) {
                    $where .= " AND s.`price` < " . $price[1] * $mu . " * s.`area`";
                } elseif (empty($price[1])) {
                    $where .= " AND s.`price` > " . $price[0] * $mu . " * s.`area`";
                } else {
                    $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " * s.`area`" . " AND " . $price[1] * $mu . " * s.`area`";
                }
                // 出售
            } elseif ($type == 1) {
                $mu = 1;
                if (empty($price[0])) {
                    $where .= " AND s.`price` < " . $price[1] * $mu;
                } elseif (empty($price[1])) {
                    $where .= " AND s.`price` > " . $price[0] * $mu;
                } else {
                    $where .= " AND s.`price` BETWEEN " . $price[0] * $mu . " AND " . $price[1] * $mu;
                }
            }
            // echo $where;die;
        }

        //面积
        if ($area != "") {
            $area = explode(",", $area);
            if (empty($area[0])) {
                $where .= " AND s.`area` < " . $area[1];
            } elseif (empty($area[1])) {
                $where .= " AND s.`area` > " . $area[0];
            } else {
                $where .= " AND s.`area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //类型
        if ($protype != "") {
            $where .= " AND s.`protype` = '$protype'";
        }

        //关键字
        if (!empty($keywords)) {

            //搜索记录
            if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                siteSearchLog("house", $keywords);
            }

            $where .= " AND (s.`title` like '%" . $keywords . "%' OR s.`address` like '%" . $keywords . "%')";
        }

        //取当前星期，当前时间
        // $time = time();
        $time = getTimeStep();
        $week = date('w', $time);
        $hour = (int)date('H');
        $ob   = "s.`bid_week{$week}` = 'all'";
        if ($hour > 8 && $hour < 20) {
            $ob .= " or s.`bid_week{$week}` = 'day'";
        }
        $ob = "($ob)";

        $select   = "";
        $orderby_ = $orderby;
        if (!empty($orderby)) {
            //发布时间
            if ($orderby == 1) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`pubdate` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积降序
            } elseif ($orderby == 2) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //面积升序
            } elseif ($orderby == 3) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`area` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格升序
            } elseif ($orderby == 4) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //价格降序
            } elseif ($orderby == 5) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`price` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价升序
            } elseif ($orderby == 6) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) ASC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //单价降序
            } elseif ($orderby == 7) {
                $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, (s.`price` / s.`area`) DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
                //点击
            } elseif ($orderby == "click") {
                $orderby = " ORDER BY s.`click` DESC, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
            } elseif ($orderby == "juli") {
                //查询距离
                $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-s.`latitude`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(s.`latitude` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-s.`longitude`)/360),2))))*1000 AS distance,";

                $orderby = " ORDER BY distance ASC";
            }
        } else {
            $orderby = " ORDER BY case when s.`isbid` = 1 and s.`bid_type` = 'normal' then 1 else 2 end, case when s.`isbid` = 1 and s.`bid_type` = 'plan' and s.`bid_start` <= $time and $ob then 1 else 2 end, s.`weight` DESC, s.`pubdate` DESC, s.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT " .
            "s.`id`, s.`type`, s.`title`, s.`areaCode`, s.`contact`, s.`addrid`, s.`address`, s.`protype`, s.`area`, s.`litpic`, s.`price`, s.`transfer`, s.`usertype`, s.`userid`, s.`username`, s.`state`, s.`sellstate`, s.`pubdate`, s.`community`, s.`communityid`, " . $select . " s.`isbid`, s.`bid_type`, s.`bid_week0`, s.`bid_week1`, s.`bid_week2`, s.`bid_week3`, s.`bid_week4`, s.`bid_week5`, s.`bid_week6`, s.`bid_start`, s.`bid_end`, s.`bid_price`, s.`waitpay`, s.`refreshSmart`, s.`refreshCount`, s.`refreshTimes`, s.`refreshPrice`, s.`refreshBegan`, s.`refreshNext`, s.`refreshSurplus`, s.`video`, s.`qj_file`, s.`qj_type`, s.`click` " .
            "FROM `#@__house_cw` s " .
            "WHERE " .
            "1 = 1" . $where);
        // echo $archives;die;
        //总条数
        // $totalCount = $dsql->dsqlOper($archives, "totalCount");
        // $arc = $dsql->SetQuery("SELECT COUNT(s.`id`) total FROM `#@__house_cw` s " .
        //                             "WHERE " .
        //                             "1 = 1".$where);
        //$totalCount = getCache("house_cw_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        $totalCount = getCache("house_cw_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
        if ($backTotal) return $totalCount;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if ($u == 1 && $loginUid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND s.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND s.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND s.`state` = 2", "totalCount");

            $pageinfo['gray']    = $totalGray;
            $pageinfo['audit']   = $totalAudit;
            $pageinfo['refresh'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        // $results = $dsql->dsqlOper($archives.$where1.$orderby.$where, "results");
        $results = getCache("house_cw_list", $archives . $where1 . $orderby . $where, 300, array("disabled" => $u));
        if ($results) {
            $now = $time;
            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['type']      = $val['type'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['addrid']    = $val['addrid'];
                $list[$key]['usertype']  = $val['usertype'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['username']  = $val['username'];
                $list[$key]['contact']   = $val['contact'];
                $list[$key]['sellstate'] = $val['sellstate'];
                $list[$key]['click'] = (int)$val['click'];

                //小区
                $url                       = "";
                $list[$key]["communityid"] = $val["communityid"];
                if ($val['communityid'] == 0) {
                    $list[$key]["community"] = $val["community"];
                    $addrName                = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$key]['addr']    = $addrName;
                    $list[$key]['addrid']  = $val['addrid'];
                    $list[$key]["address"] = $val["address"];
                } else {
                    $communitySql    = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `addr` FROM `#@__house_community` WHERE `id` = " . $val["communityid"]);
                    $communityResult = $dsql->getTypeName($communitySql);
                    if (!$communityResult) {
                        $list[$key]["community"] = "";
                        $list[$key]['addr']      = array();
                        $list[$key]["addrid"]    = 0;
                        $list[$key]["address"]   = "";
                    } else {
                        $list[$key]["community"] = $communityResult[0]["title"];
                        $addrName                = getParentArr("site_area", $communityResult[0]['addrid']);
                        global $data;
                        $data                  = "";
                        $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                        $list[$key]['addr']    = $addrName;
                        $list[$key]["addrid"]  = $communityResult[0]["addrid"];
                        $list[$key]["address"] = $communityResult[0]["addr"];

                        $param = array(
                            "service"  => "house",
                            "template" => "community-detail",
                            "id"       => $val['communityid']
                        );
                        $url   = getUrlPath($param);
                    }
                }

                $list[$key]['communityUrl'] = $url;

                if ($orderby_ == "juli") {
                    $list[$key]['distance'] = $val['distance'] > 0 ? ($val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22]) : '';  //距离   //千米  //米
                }

                $list[$key]['protypeid'] = $val['protype'];
                $list[$key]['protype']   = $val['protype'] == 0 ? "地下" : "地上";
                $list[$key]['mintime']   = $val['mintime'];

                $list[$key]['area']   = $val['area'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);
                $list[$key]['price']  = $val['price'];

                if ($val['type'] == 2) {
                    $list[$key]['transfer'] = $val['transfer'];
                }

                $qj = 0;
                global $isminiprogram;
                if(($isminiprogram && $val['qj_type'] == 0) || !$isminiprogram){
                    $qj = $val['qj_file'] ? 1 : 0;
                }

                $list[$key]['video'] = $val['video'] ? 1 : 0;
                $list[$key]['qj']    = $qj;

                $isbid = (int)$val['isbid'];
                //计划置顶需要验证当前时间点是否为置顶状态，如果不是，则输出为0
                if ($val['bid_type'] == 'plan') {
                    if ($val['bid_week' . $week] == '' || ($val['bid_start'] > $now && !$u) || ($val['bid_week' . $week] == 'day' && ($hour < 8 || $hour > 20))) {
                        $isbid = 0;
                    }
                }
                $list[$key]['isbid'] = $isbid;

                //会员中心显示信息状态
                if ($u == 1 && $loginUid > -1) {
                    $list[$key]['state'] = $val['state'];

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
                                $_began = GetMkTime($tp_beganDate);
                                $_day   = AddDay($_began, $i);
                                $_week  = date("w", $_day);

                                if ($val['bid_week' . $_week]) {
                                    array_push($tp_planArr, array(
                                        'date'  => date('Y-m-d', $_day),
                                        'week'  => $weekArr[$_week],
                                        'type'  => $val['bid_week' . $_week],
                                        'state' => $_day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
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

                    $list[$key]['waitpay'] = $val['waitpay'];
                }


                $list[$key]['usertype'] = $val['usertype'];
                if ($val['usertype'] == 0) {
                    $list[$key]['username'] = $val['username'];
                }

                //会员信息
                $nickname = $userPhoto = $userPhone = "";
                if ($val['usertype'] == 1 && $val['userid'] > 0) {
                    $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $val['userid']);
                    $member   = $dsql->dsqlOper($archives, "results");
                    if ($member) {
                        $nickname  = $val['username'] ? $val['username'] : ($member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname']);
                        $userPhoto = getFilePath($member[0]['photo']);
                        $userPhone = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : addAreaCodePrefix($member[0]['areaCode'], $member[0]['phone']);
                    } else {
                        $nickname  = "";
                        $userPhoto = "";
                        $userPhone = "";
                    }
                }
                $list[$key]['userid']     = $val['userid'];
                $list[$key]['nickname']   = $nickname;
                $list[$key]['userPhoto']  = $userPhoto;
                $list[$key]['contact']    = $val['contact'] ? addAreaCodePrefix($val['areaCode'], $val['contact']) : $userPhone;
                $list[$key]['userPhone']  = $userPhone;
                $list[$key]['pubdate']    = $val['pubdate'];
                $list[$key]['timeUpdate'] = FloorTime(GetMkTime(time()) - $val['pubdate']);


                $param             = array(
                    "service"  => "house",
                    "template" => "cw-detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $collect = "";
                if ($loginUid != -1) {
                    //验证是否已经收藏
                    $params  = array(
                        "module" => "house",
                        "temp"   => "cw_detail",
                        "type"   => "add",
                        "id"     => $val['id'],
                        "check"  => 1
                    );
                    $collect = checkIsCollect($params);
                }
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 车位详细
     * @return array
     */
    public function cwDetail()
    {
        global $dsql;
        global $userLogin;
        $cwDetail = array();
        $id       = $this->param;
        $id       = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        $where = " AND s.`waitpay` = 0";
        // if($userLogin->getUserID() == -1){
        //
        // 	$where = " AND s.`state` = 1";
        //
        // 	//如果没有登录再验证会员是否已经登录，为了实现会员修改信息功能
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND s.`state` = 1 AND (s.`usertype` = 0 OR (s.`usertype` = 1 AND s.`userid` = z.`id` AND z.`state` = 1))";
        // 	}else{
        // 		$where = " AND s.`userid` = ".$userLogin->getMemberID();
        // 	}
        //
        // }

        $archives = $dsql->SetQuery("SELECT s.*, z.`zjcom` FROM `#@__house_cw` s LEFT JOIN `#@__house_zjuser` z ON z.`id` = s.`userid` WHERE s.`id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $cwDetail["id"]    = $results[0]['id'];
            $cwDetail["type"]  = $results[0]['type'];
            $cwDetail["title"] = $results[0]['title'];
            $sex               = $results[0]['sex'];

            //小区
            $cwDetail["communityid"] = $results[0]["communityid"];

            $addrid                = $results[0]['addrid'];
            $cwDetail["cityid"]    = $results[0]['cityid'];
            $cwDetail["sellstate"] = $results[0]['sellstate'];
            $cwDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];

            if ($results[0]['communityid'] == 0) {
                $cwDetail["community"] = $results[0]["community"];
                $addrName              = getParentArr("site_area", $addrid);
                global $data;
                $data                  = "";
                $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                $cwDetail['addr']      = $addrName;
                $cwDetail["address"]   = $results[0]["address"];
                $cwDetail["longitude"] = $results[0]["longitude"];
                $cwDetail["latitude"]  = $results[0]["latitude"];
                $cwDetail["addrid"]    = $results[0]["addrid"];
            } else {
                $communitySql    = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `addrid`, `addr`, `longitude`, `latitude` FROM `#@__house_community` WHERE `id` = " . $results[0]["communityid"]);
                $communityResult = $dsql->getTypeName($communitySql);
                if (!$communityResult) {
                    $cwDetail["community"] = "小区不存在";
                    $cwDetail['addr']      = array();
                    $cwDetail["address"]   = "";
                    $cwDetail["longitude"] = "";
                    $cwDetail["latitude"]  = "";
                    $cwDetail["addrid"]    = 0;
                } else {
                    $cwDetail["community"] = $communityResult[0]["title"];
                    $addrName              = getParentArr("site_area", $communityResult[0]['addrid']);
                    global $data;
                    $data                  = "";
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $cwDetail['addr']      = $addrName;
                    $cwDetail["cityid"]    = $communityResult[0]["cityid"];
                    $cwDetail["address"]   = $communityResult[0]["addr"];
                    $cwDetail["longitude"] = $communityResult[0]["longitude"];
                    $cwDetail["latitude"]  = $communityResult[0]["latitude"];
                    $cwDetail["addrid"]    = $communityResult[0]["addrid"];
                }
            }


            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['paytype']);
            $paytype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['paytype']));
            $cwDetail["paytype"]   = $paytype;
            $cwDetail["paytypeid"] = $results[0]['paytype'];

            //会员信息
            $userid   = $results[0]['usertype'] == 1 ? $results[0]['userid'] : 0;
            $userArr  = array('userid' => $results[0]['userid'], 'uid' => $results[0]['userid']);
            $nickname = $photo = $areaCode = $phone = $certify = $flag = $zjcomName = $zjcomId = "";
            if ($userid != 0 && $userid != -1) {
                if ($results[0]['zjcom'] == 0) {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                } else {
                    $archives = $dsql->SetQuery("SELECT m.`id`, m.`nickname`, m.`realname`, m.`photo`, m.`areaCode`, m.`phone`, m.`certifyState`, m.`sex`, zj.`flag`, zj.`zjcom`, zj.`litpic`, zj.`wx`, zj.`wxQr`, zj.`qq`, zj.`qqQr`, zjcom.`title`, zjcom.`id` zjcomId FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` LEFT JOIN `#@__house_zjcom` zjcom ON zj.`zjcom` = zjcom.`id` WHERE zj.`state` = 1 AND zj.`id` = " . $userid);
                }
                $member = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $uid                    = $member[0]['id'];
                    $nickname               = $member[0]['realname'] ? $member[0]['realname'] : $member[0]['nickname'];
                    $photo                  = $member[0]['litpic'] ? getFilePath($member[0]['litpic']) : getFilePath($member[0]['photo']);
                    $phone                  = addAreaCodePrefix($member[0]['areaCode'], $member[0]['areaCode']);
                    $certify                = $member[0]['certify'];
                    $flag                   = $member[0]['flag'];
                    $sex                    = $sex ? $sex : ($member[0]['sex'] == 0 ? 2 : 1);
                    $results[0]['username'] = $results[0]['username'] ? $results[0]['username'] : $nickname;

                    if ($member[0]['zjcom'] == 0) {
                        $zjcomName = "";
                        $zjcomId   = 0;
                    } else {
                        $zjcomName = $member[0]['title'];
                        $zjcomId   = $member[0]['zjcom'];
                    }
                    $qq   = $member[0]['qq'];
                    $wx   = $member[0]['wx'];
                    $qqQr = $member[0]['qqQr'] ? getFilePath($member[0]['qqQr']) : "";
                    $wxQr = $member[0]['wxQr'] ? getFilePath($member[0]['wxQr']) : "";

                }
                $url = getUrlPath(array("service" => "house", "template" => "broker-detail", "id" => $userid));

                $userArr['uid']       = (int)$uid;
                $userArr['nickname']  = $nickname;
                $userArr['photo']     = $photo;
                $userArr['phone']     = $phone;
                $userArr['certify']   = $certify;
                $userArr['flag']      = $flag;
                $userArr['zjcomName'] = $zjcomName;
                $userArr['zjcomId']   = $zjcomId;
                $userArr['qq']        = $qq;
                $userArr['wx']        = $wx;
                $userArr['qqQr']      = $qqQr;
                $userArr['wxQr']      = $wxQr;
                $userArr['url']       = $url;
            }
            $cwDetail['user']   = $userArr;
            $cwDetail['userid'] = $results[0]['userid'];


            $houseitem             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $results[0]['paytype']);
            $paytype               = getCache("house_item", $houseitem, 0, array("name" => "typename", "sign" => $results[0]['paytype']));
            $cwDetail["paytype"]   = $paytype;
            $cwDetail["paytypeid"] = $results[0]['paytype'];

            //父级区域
            $areaid = 0;
            $sql    = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = " . $results[0]['addrid']);
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $areaid = $ret[0]['parentid'];
            }
            $cwDetail["areaid"] = $areaid;

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data             = "";
            $addrName         = array_reverse(parent_foreach($addrName, "typename"));
            $cwDetail['addr'] = $addrName;

            $cwDetail["litpic"]       = getFilePath($results[0]['litpic']);
            $cwDetail["litpicSource"] = $results[0]['litpic'];

            $cwDetail['protypeid'] = $results[0]['protype'];
            $cwDetail['protype']   = $results[0]['protype'] == 0 ? "地下" : "地上";
            $cwDetail["proprice"]  = $results[0]['proprice'];
            $cwDetail["mintime"]   = $results[0]['mintime'];

            $cwDetail["area"]     = $results[0]['area'];
            $cwDetail["price"]    = $results[0]['price'];
            $cwDetail["transfer"] = $results[0]['transfer'];
            $cwDetail["usertype"] = $results[0]['usertype'];

            $cwDetail["userid"]   = $results[0]['userid'];
            $cwDetail["username"] = $results[0]['username'];
            $cwDetail["areaCode"]  = $results[0]['areaCode'];
            $cwDetail["contact"]  = $results[0]['contact'];
            $cwDetail["showMobile"]  = addAreaCodePrefix($results[0]['areaCode'], $results[0]['contact']);

            $cwDetail["note"]  = nl2br($results[0]['note']);
            $cwDetail["mbody"] = nl2br($results[0]['mbody']);

            $cwDetail["pubdate"]    = $results[0]['pubdate'];
            $cwDetail['timeUpdate'] = FloorTime(GetMkTime(time()) - $results[0]['pubdate']);

            // 视频全景
            $cwDetail['videoSource'] = $results[0]['video'];
            $cwDetail['video']       = $results[0]['video'] ? getFilePath($results[0]['video']) : "";
            $cwDetail['qj_type']     = $results[0]['qj_type'];

            global $isminiprogram;
            if(($isminiprogram && $results[0]['qj_type'] == 0) || !$isminiprogram){
                $cwDetail['qj_file']     = $results[0]['qj_file'];
            }

            if ($results[0]['qj_type'] == 0 && $results[0]['qj_file']) {
                $file_   = explode(",", $results[0]['qj_file']);
                $fileArr = array();
                foreach ($file_ as $k => $v) {
                    $fileArr[] = array("source" => $v, "path" => getFilePath($v));
                }
                $cwDetail['qj_fileArr'] = $fileArr;
            }

            //图表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'housecw' AND `aid` = " . $results[0]['id'] . " ORDER BY `id` ASC");
            $res      = $dsql->dsqlOper($archives, "results");

            if (!empty($res)) {
                $imglist = array();
                foreach ($res as $k => $v) {
                    if($v['picPath'] && $v['picPath'] != 'undefined'){
                        $imglist[$k]["path"]       = getFilePath($v["picPath"]);
                        $imglist[$k]["pathSource"] = $v["picPath"];
                        $imglist[$k]["info"]       = $v["picInfo"];
                    }
                }
            } else {
                $imglist = array();
            }

            $cwDetail["imglist"] = $imglist;

            //验证是否已经收藏
            $params              = array(
                "module" => "house",
                "temp"   => "cw_detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect             = checkIsCollect($params);
            $cwDetail['collect'] = $collect == "has" ? 1 : 0;

            $cwDetail['click'] = $results[0]['click'];

            $cwDetail["sex"]     = $sex;
            $cwDetail["wuye_in"] = $results[0]['wuye_in'];
            $cwDetail["wx_tel"]  = $results[0]['wx_tel'];
            $cwDetail["state"]   = $results[0]['state'];
        }
        return $cwDetail;
    }


    /**
     * 房源委托
     */
    public function putEnturst()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $uid = $userLogin->getMemberID();

        $param = $this->param;

        $type       = (int)$param['type'];
        $zjuid      = (int)$param['zjuid'];
        $zjcom      = (int)$param['zjcom'];
        $sex        = (int)$param['sex'];
        $address    = $param['address'];
        $doornumber = $param['doornumber'];
        $area       = $param['area'];
        $price      = (float)$param['price'];
        $transfer   = (float)$param['transfer'];
        $username   = $param['username'];
        $phone      = $param['phone'];
        $vdimgck    = $param['vdimgck'];
        $areaCode   = $param['areaCode'];

        if ($type != 0 && $type != 1 && $type != 2) return array("state" => 200, "info" => "类型错误");
        if (empty($zjcom) && empty($zjuid)) return array("state" => 200, "info" => "参数错误");
        if (empty($address)) return array("state" => 200, "info" => "请输入地址");
        if (empty($area)) return array("state" => 200, "info" => "请输入面积");
        if (empty($price)) return array("state" => 200, "info" => "请输入您的报价");
        if (empty($username)) return array("state" => 200, "info" => "请输入联系人");
        if (empty($phone)) return array("state" => 200, "info" => "请输入手机号");

        if ($zjcom) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `id` = $zjcom AND `state` = 1");
            $res = $dsql->dsqlOper($sql, "results");
            if (!$res) return array("state" => 200, "info" => "中介公司不存在");
        } elseif ($zjuid) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `id` = $zjuid AND `state` = 1");
            $res = $dsql->dsqlOper($sql, "results");
            if (!$res) return array("state" => 200, "info" => "经纪人不存在");
        }

        $checkPhone = false;

        if ($uid != -1) {
            $uinfo       = $userLogin->getMemberInfo();
            $uphone      = $uinfo['phone'];
            $uphoneCheck = $uinfo['phoneCheck'];
            if ($uphone != $phone || $uphoneCheck != 1) {
                $checkPhone = true;
            }
        } else {
            $checkPhone = true;
        }

        if ($checkPhone) {

            if (empty($vdimgck)) return array("state" => 200, "info" => "请输入验证码");
            $areaCode = empty($areaCode) ? "86" : $areaCode;
            $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $international = $results[0]['international'];
                if (!$international) {
                    $areaCode = "";
                }
            } else {
                return array("state" => 200, "info" => '短信平台未配置，提交失败！');
            }

            $phone = $areaCode . $phone;

            //验证输入的验证码
            $archives = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `user` = '$phone' AND `code` = '$vdimgck'");
            $results  = $dsql->dsqlOper($archives, "results");
            if (!$results) {
                return array("state" => 200, "info" => $langData['siteConfig'][20][99]);    //验证码输入错误，请重试！
            } else {

                //5分钟有效期
                $now = GetMkTime(time());
                if ($now - $results[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！

                //验证通过删除发送的验证码
                $archives = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'auth' AND `user` = '$phone' AND `code` = '$vdimgck'");
                $dsql->dsqlOper($archives, "update");

                // 老用户登陆或者创建用户
                // $sql = $dsql->SetQuery("SELECT * FROM `#@__member` WHERE `username` = '$phone' || `phone` = '$phone'");
                // $res = $dsql->dsqlOper($sql, "results");
                // if($res){
                // 	$res = $userLogin->memberLoginCheckForSmsCode($res[0]);
                // }else{
                // 	//新用户手机注册
                // 	//提供初始密码
                //     $passwdInit = '111111';
                //     $passwd = $userLogin->_getSaltedHash($passwdInit);
                //     $mtype = 1;
                //     $times = time();
                //     $ip = GetIP();
                // 	$ipaddr = getIpAddr($ip);
                //     //保存到主表
                //     $nickname = preg_replace('/(1[34578]{1}[0-9])[0-9]{4}([0-9]{4})/is',"$1****$2", $phone);
                //     $archives = $dsql->SetQuery("INSERT INTO `#@__member` (`mtype`, `username`, `password`, `nickname`, `areaCode`, `phone`, `phoneCheck`, `regtime`, `regip`, `regipaddr`, `state`, `purviews`) VALUES ('$mtype', '$phone', '$passwd', '$nickname', '$areaCode', '$phone', '1', '$times', '$ip', '$ipaddr', '1', '')");
                //     $uid = $dsql->dsqlOper($archives, "lastid");
                //     if(!is_numeric($uid)){
                //         $user = array(
                //         	"id" => $uid,
                //         	"state" => 1,
                //         	"password" => $passwd,
                //         );
                // 		$res = $userLogin->memberLoginCheckForSmsCode($user);
                // 	}else{
                // 		return array("state" => 200, "info" => '提交失败，请稍候重试！');
                // 	}
                // }
            }
        }
        $pubdate = GetMktime(time());
        $sql     = $dsql->SetQuery("INSERT INTO `#@__house_entrust` (`userid`, `zjuid`, `zjcom`,  `type`, `address`, `doornumber`, `area`, `price`, `transfer`, `username`, `contact`, `pubdate`, `sex`, `state`, `note`) VALUES ($uid, $zjuid, $zjcom, $type, '$address', '$doornumber', $area, $price, $transfer, '$username', '$phone', '$pubdate', $sex, 0, '')");
        $res     = $dsql->dsqlOper($sql, "lastid");
        if (is_numeric($res)) {
            
            //记录用户行为日志
            memberLog($uid, 'house', 'entrust', $res, 'insert', '委托房源', '', $sql);

            return "提交成功，我们会尽快联系您";
        } else {
            return array("state" => 200, "info" => '提交失败，请稍候重试！');
        }
    }


    /**
     * 我的/我收到的委托列表
     */
    public function myEntrust()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $where = $order = "";

        $uid = $userLogin->getMemberID();

        if ($uid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        $param = $this->param;

        $iszj      = (int)$this->param['iszj'];
        $iszjcom   = (int)$this->param['iszjcom'];
        $type      = $this->param['type'];
        $state     = $this->param['state'];
        $backTotal = (int)$this->param['backTotal'];
        $page      = (int)$this->param['page'];
        $pageSize  = (int)$this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if ($iszj) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $where = " AND `zjuid` = " . $res[0]['id'] . " AND `del2` = 0";
            } else {
                $where = " AND 1 = 2";
            }
        } elseif ($iszjcom) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $uid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $where = " AND `zjcom` = " . $res[0]['id'] . " AND `del2` = 0";
            } else {
                $where = " AND 1 = 2";
            }
        } else {
            $where = " AND `userid` = $uid AND `del1` = 0";
        }

        if ($type != "") {
            $type  = (int)$type;
            $where .= " AND `type` = $type";
        }

        $archives   = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_entrust` WHERE 1 = 1" . $where);
        $results    = $dsql->dsqlOper($archives, "results");
        $totalCount = $results[0]['count'];
        if ($backTotal == 1) return $totalCount;

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $archives = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_entrust` WHERE 1 = 1 AND `type` = 0" . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        $zu_total = (int)$results[0]['count'];

        $archives   = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_entrust` WHERE 1 = 1 AND `type` = 1" . $where);
        $results    = $dsql->dsqlOper($archives, "results");
        $shou_total = (int)$results[0]['count'];

        $archives    = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_entrust` WHERE 1 = 1 AND `type` = 2" . $where);
        $results     = $dsql->dsqlOper($archives, "results");
        $zhuan_total = (int)$results[0]['count'];

        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_entrust` WHERE `state` = 1" . $where);
        $res            = $dsql->dsqlOper($archives_count, "results");
        $total_yes      = $res[0]['count'];

        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_entrust` WHERE `state` = 0" . $where);
        $res            = $dsql->dsqlOper($archives_count, "results");
        $total_not      = $res[0]['count'];


        $pageinfo = array(
            "page"        => $page,
            "pageSize"    => $pageSize,
            "totalPage"   => $totalPage,
            "totalCount"  => $totalCount,
            "zu_total"    => $zu_total,
            "shou_total"  => $shou_total,
            "zhuan_total" => $zhuan_total,
            "shou_total"  => $shou_total,
            "state1"      => $total_yes,
            "state0"      => $total_not,
        );

        if ($state != "") {
            $where .= " AND `state` = " . (int)$state;
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_entrust` WHERE 1 = 1" . $where);
        $atpage   = $pageSize * ($page - 1);
        $where    = " LIMIT $atpage, $pageSize";
        $results  = $dsql->dsqlOper($archives . " order by `id` DESC" . $where, "results");

        $list = array();
        if ($results && is_array($results)) {
            foreach ($results as $key => $value) {
                $list[$key] = $value;

                // 显示被委托方信息
                if (!$iszj && !$iszjcom) {
                    $zjuid  = $value['zjuid'];
                    $zjcom  = $value['zjcom'];
                    $detail = null;
                    if ($zjuid) {
                        $this->param = array("userid" => $zjuid);
                        $info        = $this->zjUserList();
                        if ($info['state'] != 200) {
                            $detail = $info['list'][0];
                        }
                    } else {
                        $this->param = array("id" => $zjcom);
                        $info        = $this->zjComDetail();
                        if ($info) {
                            $detail = $info;
                        }
                    }
                    $list[$key]['entrustment'] = $detail;
                }
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }

    /**
     * 操作委托列表
     */
    public function operaEntrust()
    {
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        if ($uid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        $param   = $this->param;
        $id      = (int)$this->param['id'];
        $state   = $this->param['state'];
        $iszj    = (int)$this->param['iszj'];
        $iszjcom = (int)$this->param['iszjcom'];
        $note    = $this->param['note'];

        if ($state == "") return array("state" => 200, "info" => "参数错误");

        $state = (int)$state;

        if ($iszj) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $where = " `zjUid` = " . $res[0]['id'];
            } else {
                return array("state" => 200, "info" => "信息不存在");
            }
        } elseif ($iszjcom) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $uid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $where = " `zjcom` = " . $res[0]['id'];
            } else {
                return array("state" => 200, "info" => "信息不存在");
            }
        } else {
            $where = " `userid` = $uid";
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_entrust` WHERE `id` = $id AND " . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if (!$results) return array("state" => 200, "info" => "信息不存在");
        $detail = $results[0];

        // 删除
        if ($state == -1) {
            if ($iszj || $iszjcom) {
                if ($detail['del1'] == 1) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__house_entrust` WHERE `id` = $id");
                } else {
                    $sql = $dsql->SetQuery("UPDATE `#@__house_entrust` SET `del2` = 1 WHERE `id` = $id");
                }
            } else {
                // 经纪人或中介公司已删除或尚未处理，直接删除这条信息
                if ($detail['del2'] == 1 || $detail['state'] == 0) {
                    $sql = $dsql->SetQuery("DELETE FROM `#@__house_entrust` WHERE `id` = $id");
                } else {
                    $sql = $dsql->SetQuery("UPDATE `#@__house_entrust` SET `del1` = 1 WHERE `id` = $id");
                }
            }

            // 已处理
        } elseif (($state == 1 || $state == 0) && ($iszj || $iszjcom)) {
            $dotime = GetMktime(time());
            $sql    = $dsql->SetQuery("UPDATE `#@__house_entrust` SET `state` = $state, `note` = '$note' WHERE `id` = $id");
        } else {
            return array("state" => 200, "info" => "操作错误");
        }
        $res = $dsql->dsqlOper($sql, "update");

        if ($res == "ok") {
            return "操作成功";
        } else {
            return array("state" => 200, "info" => "操作失败");
        }

    }


    /**
     * 预约看房
     *
     */
    public function bookHouse()
    {
        global $dsql;
        global $userLogin;
        $ip       = GetIP();
        $param    = $this->param;
        $type     = $param['type'];
        $aid      = (int)$param['aid'];
        $title    = $param['title'];
        $day      = (int)$param['day'];
        $time     = (int)$param['time'];
        $note     = $param['note'];
        $username = $param['username'];
        $mobile   = $param['mobile'];
        $note     = $param['note'];
        $sex      = (int)$param['sex'];
        $vercode  = $param['vercode'];
        $areaCode = $param['areaCode'] ? $param['areaCode'] : "86";

        $checkMobile = false;
        $uid         = $userLogin->getMemberID();

        if ($type != "zu" && $type != "sale" && $type != "sp" && $type != "xzl" && $type != "cf" && $type != "cw") $type = "";

        if (empty($type) || empty($aid)) return array('state' => 200, 'info' => '参数错误');

        $sql = $dsql->SetQuery("SELECT `id`, `userid`, `usertype`, `title` FROM `#@__house_{$type}` WHERE `id` = $aid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return array('state' => 200, 'info' => '房源不存在');

        $title  = empty($title) ? $res[0]['title'] : $title;
        $foruid = $res[0]['userid'];

        if ($res[0]['usertype'] == 1) {
            $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_zjuser` WHERE `id` = $foruid");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $foruid = $res[0]['userid'];
            } else {
                return array('state' => 200, 'info' => '经纪人信息错误，请电话联系！');
            }
        }

        if (empty($username)) return array('state' => 200, 'info' => '请填写联系人');
        if (empty($mobile)) return array('state' => 200, 'info' => '请填写联系电话');

        if ($uid == -1) {
            $checkMobile = true;
        } else {
            $userinfo = $userLogin->getMemberInfo();
            $phone    = $userinfo['phone'];
            if ($phone != $mobile || $userinfo['phoneCheck'] != 1) {
                $checkMobile = true;
            }
        }

        $msgId = 0;
        if ($checkMobile) {

            if (empty($vercode)) return array("state" => 101, "info" => '请填写验证码！');

            //国际版需要验证区域码
            $cphone_  = $mobile;
            $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $international = $results[0]['international'];
                if ($international) {
                    $cphone_ = $areaCode . $mobile;
                }
            }

            $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->dsqlOper($sql_code, "results");
            if ($res_code) {
                $code = $res_code[0]['code'];
                if (strtolower($vercode) != $code) {
                    return array('state' => 200, 'info' => '验证码输入错误，请重试！');
                }
                $msgId = $res_code[0]['id'];
            } else {
                return array('state' => 200, 'info' => '验证码输入错误，请重试！');
            }
        }

        $pubdate = GetMkTime(time());

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_yuyue` WHERE `mobile` = '$mobile' AND `type` = '$type' AND `aid` = '$aid' AND `state` = 0 LIMIT 0, 1");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if ($ret > 0) return array("state" => 101, "info" => '您已经预约过！');

        $state = $del1 = $del2 = 0;
        $date  = $day . ":" . $time;
        $sql   = $dsql->SetQuery("INSERT INTO `#@__house_yuyue` (`type`, `aid`, `title`, `uid`, `foruid`, `date`, `note`, `username`, `mobile`, `sex`, `state`, `del1`, `del2`, `pubdate`) VALUES ('$type', '$aid', '$title', '$uid', '$foruid', '$date', '$note', '$username', '$mobile', '$sex', '$state', '$del1', '$del2', '$pubdate')");
        $ret   = $dsql->dsqlOper($sql, "update");
        if ($ret != "ok") {
            return array("state" => 101, "info" => '预约失败，请稍候重试！');
        } else {
            if ($msgId) {
                $sql = $dsql->SetQuery("DELETE FROM `#@__site_messagelog` WHERE `id` = $msgId");
                $dsql->dsqlOper($sql, "update");

                // if($uid != -1 && $userinfo['phoneCheck'] != 1){
                // 	$sql = $dsql->SetQuery("UPDATE `#@__member` SET `areaCode` = '$areaCode', `phone` = '$mobile', `phoneCheck` = 1 WHERE `id` = $uid");
                // 	$dsql->dsqlOper($sql, "update");
                // }
            }

            $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $foruid");
            $res = $dsql->dsqlOper($sql, "results");

            if ($res) {
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "house_yuyue"
                );

                $dparam   = array(
                    "service"  => "house",
                    "template" => $type . "-detail",
                    "id"       => $aid
                );
                $houseurl = getUrlPath($dparam);

                switch ($day) {
                    case 1:
                        $day = "工作日";
                        break;
                    case 2:
                        $day = "工作日/双休日均可";
                        break;
                    default :
                        $day = "双休日";
                }
                switch ($time) {
                    case 1:
                        $time = "下午";
                        break;
                    case 2:
                        $time = "晚上";
                        break;
                    case 3:
                        $time = "随时";
                        break;
                    default :
                        $time = "上午";
                }
                $data = array(
                    "username" => $res[0]['username'],
                    "title"    => $title,
                    "houseurl" => $houseurl,
                    "name"     => $username . ($sex == 1 ? " 先生" : ($sex == 2 ? " 女士" : "")),
                    "mobile"   => $mobile,
                    "note"     => $note,
                    "whattime" => $day . " " . $time,
                    "fields"   => array(
                        'keyword1' => '客户姓名',
                        'keyword2' => '预约时间',
                        'keyword3' => '房源信息',
                        'keyword4' => '客户手机',
                    )
                );
                updateMemberNotice($foruid, "房产-预约看房通知", $param, $data);
            }

            return '预约成功！';
        }

    }

    /**
     * 预约看房列表
     *
     */
    public function bookHouseList()
    {
        global $dsql;
        global $userLogin;

        $param     = $this->param;
        $spec      = $this->param['spec'];
        $type      = $this->param['type'];
        $state     = $this->param['state'];
        $u         = (int)$this->param['u'];
        $page      = $this->param['page'];
        $pageSize  = $this->param['pageSize'];
        $backTotal = (int)$this->param['backTotal'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = "";


        $uid = $userLogin->getMemberID();
        if ($u) {
            if ($uid == -1) return array("state" => 200, "info" => '登陆超时，请重新登陆');

            if ($spec == "in") {
                $where .= " AND `foruid` = $uid AND `del2` = 0";
            } elseif ($spec == "out") {
                $where .= " AND `uid` = $uid AND `del1` = 0";
            } else {
                return array("state" => 200, "info" => '参数错误');
            }
        }

        if (!empty($type)) {
            $where .= " AND `type` = $type";
        }


        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_yuyue` WHERE 1 = 1" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives_count, "results");
        $totalCount = $totalCount[0]['count'];
        if ($backTotal == 1) return $totalCount;
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_yuyue` WHERE `state` = 1" . $where);
        $res            = $dsql->dsqlOper($archives_count, "results");
        $total_yes      = $res[0]['count'];

        $archives_count = $dsql->SetQuery("SELECT count(`id`) as count FROM `#@__house_yuyue` WHERE `state` = 0" . $where);
        $res            = $dsql->dsqlOper($archives_count, "results");
        $total_not      = $res[0]['count'];

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "state1"     => $total_yes,
            "state0"     => $total_not,
        );

        if ($state != "") {
            $where .= " AND `state` = " . (int)$state;
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__house_yuyue` WHERE 1 = 1" . $where . " ORDER BY `id` DESC");
        $atpage   = $pageSize * ($page - 1);
        $where    = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        $list    = array();
        foreach ($results as $key => $val) {
            $list[$key]['id']    = $val['id'];
            $list[$key]['type']  = $val['type'];
            $list[$key]['aid']   = $val['aid'];
            $list[$key]['title'] = $val['title'];

            $action               = $val['type'] . "Detail";
            $this->param          = array("id" => $val['aid']);
            $detail               = $this->$action();
            $list[$key]['detail'] = $detail;

            if ($u) {
                $date = $val['date'];
                $date = explode(":", $date);
                switch ($date[0]) {
                    case 1:
                        $day = "工作日";
                        break;
                    case 2:
                        $day = "工作日/双休日均可";
                        break;
                    default :
                        $day = "双休日";
                }
                switch ($date[1]) {
                    case 1:
                        $time = "下午";
                        break;
                    case 2:
                        $time = "晚上";
                        break;
                    case 3:
                        $time = "随时";
                        break;
                    default :
                        $time = "上午";
                }
                $list[$key]['username'] = $val['username'];
                $list[$key]['mobile']   = $val['mobile'];
                $list[$key]['note']     = $val['note'];
                $list[$key]['date']     = $day . " " . $time;
                $list[$key]['state']    = $val['state'];
            } else {
                $list[$key]['username'] = cn_substrR($val['username'], 1) . "**";
                $list[$key]['mobile']   = preg_replace('/(1[34578]{1}[0-9])[0-9]{8}/is', "$1********", $val['mobile']);
            }
            $list[$key]['sex'] = $val['sex'];    // 1:先生2:女士

            $list[$key]['pubdate'] = date("Y-m-d", $val['pubdate']);
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 操作预约信息
     */
    public function operBookHouse()
    {
        global $dsql;
        global $userLogin;

        $param = $this->param;
        $id    = (int)$param['id'];
        $state = (int)$param['state'];
        $type  = $param['type'];
        $spec  = $param['spec'];

        $uid = $userLogin->getMemberID();
        if ($uid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        if (empty($id)) return array("state" => 200, "info" => "未指定信息ID");
        if (empty($type)) return array("state" => 200, "info" => "未指定操作类型");
        if (empty($spec)) return array("state" => 200, "info" => "参数错误");

        $where = "";
        if ($spec == "in") {
            $where .= " AND `foruid` = $uid AND `del2` = 0";
        } elseif ($spec == "out") {
            $where .= " AND `uid` = $uid AND `del1` = 0";
        } else {
            return array("state" => 200, "info" => "参数错误");
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_yuyue` WHERE `id` = $id" . $where);
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return array("state" => 200, "info" => "信息不存在，或已经删除！");

        $d              = $res[0];
        $delF           = "";
        $delstate_other = 0;

        if ($spec == "in") {
            $delF           = "del2";
            $delstate_other = $d['del1'];
        } else {
            if ($type != "del") return array("state" => 200, "info" => "操作类型错误");
            $delF           = "del1";
            $delstate_other = $d['del2'];
        }

        if ($type == "del") {
            if ($delstate_other) {
                $sql = $dsql->SetQuery("DELETE FROM `#@__house_yuyue` WHERE `id` = $id");
            } else {
                $sql = $dsql->SetQuery("UPDATE `#@__house_yuyue` SET `{$delF}` = 1 WHERE `id` = $id");
            }
        } else {
            $sql = $dsql->SetQuery("UPDATE `#@__house_yuyue` SET `state` = $state WHERE `id` = $id");
        }

        $res = $dsql->dsqlOper($sql, "update");
        if ($res == "ok") {
            return "操作成功";
        } else {
            return array("state" => 200, "info" => "操作失败，请重试！");
        }

    }

    /**
     * 购买经纪人套餐
     */
    public function buyZjuserMeal()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        $sql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return array("state" => 200, "info" => "您还没有入驻经纪人");
        if ($res[0]['state'] != 1) return array("state" => 200, "info" => "您的经纪人还没有通过审核");

        $zjuid = $res[0]['id'];

        $param      = $this->param;
        $type       = $param['type'];
        $item       = $param['item'];
        $paytype    = $param['paytype'];
        $useBalance = (int)$param['useBalance'];

        $this->param     = "zjuserPriceCost";
        $config          = $this->config();
        $zjuserPriceCost = $config['zjuserPriceCost'];

        if (empty($zjuserPriceCost)) return array("state" => 200, "info" => "抱歉，暂时没有经纪人套餐，请联系管理员");
        if (!isset($zjuserPriceCost[$type])) return array("state" => 200, "info" => "套餐不存在-1");

        $list = $zjuserPriceCost[$type]['list'];
        if (!isset($list[$item])) return array("state" => 200, "info" => "套餐不存在-2");

        $detail         = $list[$item];
        $detail['type'] = $type;
        $detail['item'] = $item;
        $detail['name'] = $zjuserPriceCost[$type]['name'];

        $totalprice = $detail['price'];    //总金额

        $payprice    = $totalprice;    // 现金支付部分
        $useBalance_ = 0;    // 余额支付部分

        if ($totalprice && $useBalance) {
            $userinfo  = $userLogin->getMemberInfo($userid);
            $usermoney = $userinfo['money'];
            if ($usermoney > 0) {
                $useBalance_ = $usermoney > $totalprice ? $totalprice : $usermoney;
                $payprice    = $totalprice - $useBalance_;
            }
        }

        $ordernum = create_ordernum();
        $date     = GetMkTime(time());
        $config   = serialize($detail);

        // 删除未支付的订单
        $sql = $dsql->SetQuery("DELETE FROM `#@__house_zjuser_order` WHERE `zjuid` = $zjuid AND `state` = 0");
        $dsql->dsqlOper($sql, "update");

        $sql = $dsql->SetQuery("INSERT INTO `#@__house_zjuser_order` (`zjuid`, `ordernum`, `totalprice`, `balance`, `paytype`, `amount`, `date`, `paydate`, `state`, `config`) VALUES ($zjuid, '$ordernum', '$totalprice', '$useBalance_', '$paytype', $payprice, '$date', '0', '0', '$config')");
        $oid = $dsql->dsqlOper($sql, "lastid");
        if (!is_numeric($oid)) {
            return array("state" => 200, "info" => $langData['siteConfig'][21][85]);  //提交失败！
        }

        if ($payprice > 0 && empty($paytype) && !isMobile()) return array("state" => 200, "info" => "请选择支付方式");

        $timeout  = $date + 3600;
        $data = array("type" => "buymeal");

        $order    = createPayForm("house", $ordernum, $payprice, $paytype, "购买经纪人套餐",$data,1);

        $order['timeout'] = $timeout;

        return $order;

    }

    /**
     * 购买经纪人套餐时支付
     */
    public function paymeal()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;

        $userid = $userLogin->getMemberID();

        $param      = $this->param;
        $ordernum   = $param['ordernum'];
        $useBalance = $param['useBalance'];
        $paytype    = $param['paytype'];
        $balance    = (float)$param['balance'];
        $final      = (int)$param['final']; // 最终支付


        $isMobile = isMobile();

        if ($userid == -1 || empty($ordernum)) {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "?v=12");
            die;
        }

        //计算支付金额，并检测支付密码
        $payTotalAmount = $this->checkPayAmount();

        if(is_array($payTotalAmount)){
            return $payTotalAmount;
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $zjuid = $res[0]['id'];
        } else {
            header("location:" . $cfg_secureAccess . $cfg_basehost . "?v=2");
            die;
        }
        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser_order` WHERE `ordernum` = '$ordernum' AND `zjuid` = $zjuid");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            // 已支付
            if ($res[0]['state'] == 1) {
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "record",
                );

                return getUrlPath($param);
//                header("location:" . getUrlPath($param));
//                die;
            }
        }
        $order = $res[0];

        // 移动端从公共支付页面过来需要更新使用余额情况
        if ($final) {
            $balance = $useBalance ? $balance : 0;
            if ($balance != $order['balance']) {
                $order_ischange   = true;
                $order['balance'] = $balance;
                $order['amount']  = $order['totalprice'] - $balance;
            }
        }

        $totalprice = $order['totalprice'];
        $balance    = $order['balance'];
        $amount     = $order['amount'];

        $payprice    = $totalprice;    // 现金支付部分
        $useBalance_ = 0;    // 余额支付部分

        // 移动端下单页面不需要计算实际支付费用
        if (!($isMobile && empty($final))) {
            if ($totalprice && $balance > 0) {
                $userinfo  = $userLogin->getMemberInfo($userid);
                $usermoney = $userinfo['money'];
                if ($usermoney > 0) {
                    $useBalance_ = $usermoney > $totalprice ? $totalprice : $usermoney;
                    $payprice    = $totalprice - $useBalance_;
                }
            }
        }

        // 现金支付金额发生变化
        if ($payprice != $amount || isset($order_ischange)) {
            $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser_order` SET `balance` = $useBalance_, `amount` = $payprice WHERE `id` = " . $order['id']);
            $res = $dsql->dsqlOper($sql, "update");
        }

        $data = array("type" => "buymeal");

        // 现金支付金额为0
        if ($payTotalAmount <= 0) {

            $paytype = 'money';
            $date    = GetMkTime(time());
            $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $payre   = $dsql->dsqlOper($paysql, "results");
            if (!empty($payre)) {
                $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'house',  `uid` = $userid, `amount` = '$totalprice', `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'house'");
                $dsql->dsqlOper($archives, "update");
            } else {
                $body     = serialize($param);
                $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('house', '$ordernum', '$userid', '$body', '$amount', '$paytype', 1, $date)");
                $dsql->dsqlOper($archives, "results");
            }

            $this->buymealSuccess($ordernum);
            //跳转至支付成功页面
            $param = array(
                "service"  => "house",
                "template" => "payreturn",
                "ordernum" => $ordernum,
                "param"    => "ordertype=buymeal",
            );
            $url   = getUrlPath($param);

            return $url;
//            header("location:" . $url);
        } else {
            if ($isMobile && empty($final)) {
//                $param_              = array();
//                $param_['ordertype'] = "paymeal";
//                $param_['ordernum']  = $ordernum;
//                $param               = array(
//                    "service"  => "house",
//                    "template" => "pay",
//                    "param"    => http_build_query($param_)
//                );

                $orderarr =  createPayForm("house", $ordernum, $payprice, $paytype, "购买经纪人套餐", $data,1);

                $orderarr['timeout'] = $order['date'] + 3600;

                return $orderarr;
            }
            //跳转至第三方支付页面
            return createPayForm("house", $ordernum, $payprice, $paytype, "购买经纪人套餐", $data);
        }

    }

    /**
     * 购买经纪人套餐支付成功
     */
    private function buymealSuccess($ordernum = "")
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        if (empty($ordernum)) return;

        $userid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser_order` WHERE `ordernum` = '$ordernum'");
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return;

        $order = $res[0];
        $time  = GetMktime(time());

        $sql    = $dsql->SetQuery("SELECT `userid`, `meal`,`cityid` FROM `#@__house_zjuser` WHERE `id` = " . $order['zjuid']);
        $res    = $dsql->dsqlOper($sql, "results");
        $userid = $res[0]['userid'];
        $meal   = $res[0]['meal'];
        $cityid = $res[0]['cityid'];


        $totalprice = $order['totalprice'];
        $balance    = $order['balance'];
        $amount     = $order['amount'];
        $config     = unserialize($order['config']);

        global  $paytypee;
        $paytypee    = $order['paytype'];                    //支付方式

        // 使用了余额

        if ($balance > 0) {
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$balance' WHERE `id` = '$userid'");
            $dsql->dsqlOper($archives, "update");
            $info  = "购买经纪人套餐：" . $config['name'] . $config['time'] . "个月";
            $title = "房产门户消费";
            $user  = $userLogin->getMemberInfo($userid);
            $usermoney = $user['money'];
            //保存操作日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalprice', '$info', '$time','house','jingjirentaocan','$title','$ordernum','$usermoney')");
            $dsql->dsqlOper($archives, "update");
        }

        global $cfg_setmealFee;
        //分站佣金

        //分站分佣比例
        $fzFee = cityCommission($cityid,'setmeal');
        $fztotalAmount_ = $totalprice * (float)$fzFee / 100;
        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
        $fztotalAmount_ = sprintf("%.2f", $fztotalAmount_);

        //平台获得
        $fee = sprintf("%.2f", $totalprice - $fztotalAmount_);

        if ($cityid != 0) {
            $cityName = getSiteCityName($cityid);

            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");
            
            $info     = "购买经纪人套餐：" . $config['name'] . $config['time'] . "个月";
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$userid', '1', '$totalprice', '$info', '$time','$cityid','$fztotalAmount_','house',$totalprice,'1','shangpinxiaoshou')");
//            $dsql->dsqlOper($archives, "update");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);

            $modulename = getModuleTitle(array('name' => 'house'));    //获取模块名
            $userinfo = $userLogin->getMemberInfo($userid);

            //微信通知
            $param = array(
                'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n原因：购买经济人套餐" . "\r\n\r\n分站获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );

            $params = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . "分站\r\n".$modulename."模块\r\n用户：" . $userinfo['nickname'] . "\r\n原因：购买经济人套餐" . "\r\n\r\n平台获得佣金：".$fee."\r\n分站获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("house", "detail", $param);
            updateAdminNotice("house", "detail", $params);
        }
        if ($meal) {
            $meal    = unserialize($meal);
            $expired = $meal['expired'];

            // 已过期
            if ($expired < $time) {
                $expired = strtotime("+{$config['time']} month");
                $house   = $config['house'];
                $refresh = $config['refresh'];
                $settop  = $config['settop'];
            } else {
                $expired = strtotime("+{$config['time']} month", $expired);
                $house   = $meal['house'] + $config['house'];
                $refresh = $meal['refresh'] + $config['refresh'];
                $settop  = $meal['settop'] + $config['settop'];
            }

        } else {
            $expired = strtotime("+{$config['time']} month");
            $house   = $config['house'];
            $refresh = $config['refresh'];
            $settop  = $config['settop'];
        }

        // 这里的房源、刷新、置顶数据都是当前剩余的量
        $detail = array(
            "name"    => $config['name'],
            "type"    => (int)$config['type'],
            "item"    => (int)$config['item'],
            "began"   => (int)$time,
            "expired" => (int)$expired,
            "house"   => (int)$house,
            "refresh" => (int)$refresh,
            "settop"  => (int)$settop,
        );

        $detail = serialize($detail);


        // 更新经纪人表
        $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `meal` = '$detail' WHERE `id` = " . $order['zjuid']);
        $dsql->dsqlOper($sql, "update");

        //删除缓存
        clearCache("house_zjuser_list_zjuser", $order['zjuid']);

        if ($totalprice == $balance) {
            $paytypee = 'money';
        }
        $paytype_ = ", `paytype` = '$paytypee'";

        // 更新订单状态
        $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser_order` SET `state` = 1, `paydate` = $time $paytype_ WHERE `id` = " . $order['id']);
        $dsql->dsqlOper($sql, "update");
        
        //记录用户行为日志
        memberLog($userid, 'house', 'order', 0, 'update', '购买经纪人套餐('.$config['name'] . $config['time'] . "个月".')', '', $sql);

        include HUONIAOINC . "/config/house.inc.php";
        $fenXiao = (int)$customfenXiao;
        //分佣 开关
        $paramarr['amount'] = $totalprice;
        if ($fenXiao == 1) {
            (new member())->returnFxMoney("house", $userid, $ordernum, $paramarr);
        }

    }

    /**
     * 经纪人套餐记录
     */
    public function mymeal()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return array("state" => 200, "info" => "您还没有入驻经纪人");

        $zjuid = $res[0]['id'];

        $param    = $this->param;
        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $sql = $dsql->SetQuery("SELECT COUNT(`id`) count FROM `#@__house_zjuser_order` WHERE `zjuid` = $zjuid AND `state` = 1 AND `del` = 0");
        $res = $dsql->dsqlOper($sql, "results");

        //总条数
        $totalCount = $res[0]['count'];
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

        $sql = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser_order` WHERE `zjuid` = $zjuid AND `state` = 1 AND `del` = 0" . $where);
        $res = $dsql->dsqlOper($sql, "results");

        $list = array();
        if ($res) {
            foreach ($res as $key => $value) {
                $list[$key]['id']         = $value['id'];
                $list[$key]['ordernum']   = $value['ordernum'];
                $list[$key]['totalprice'] = $value['totalprice'];
                $list[$key]['balance']    = $value['balance'];
                $paytype                  = $value['paytype'];

                if ($paytype == "money") {
                    $tit = "余额支付";
                } else {
                    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '$paytype'");
                    $res = $dsql->dsqlOper($sql, "results");
                    if ($res) {
                        $tit = $res[0]['pay_name'];
                    } else {
                        $tit = "未知支付方式";
                    }
                    if ($value['balance'] > 0) $tit .= " + 余额支付";
                }

                $list[$key]['paytype'] = $tit;
                $list[$key]['date']    = $value['date'];
                $list[$key]['config']  = unserialize($value['config']);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }

    /**
     * 删除订单记录
     */
    public function delMealOrder()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => "登陆超时，请重新登陆");

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $userid");
        $res = $dsql->dsqlOper($sql, "results");
        if (!$res) return array("state" => 200, "info" => "您还没有入驻经纪人");

        $zjuid = $res[0]['id'];

        $param = $this->param;
        $id    = (int)$param['id'];

        if (empty($id)) return array("state" => 200, "info" => "参数错误");

        $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser_order` SET `del` = 1 WHERE `id` = $id AND `zjuid` = $zjuid");
        $res = $dsql->dsqlOper($sql, "update");
        if ($res == "ok") {
            return "操作成功";
        } else {
            return array("state" => 200, "info" => "操作失败");
        }
    }

    /**
     * 更新经纪人套餐余量
     */
    public function updateZjuserMeal($zjuid, $dopost = "house:1", $zjuserConfig = array())
    {
        global $dsql;
        if (empty($zjuid) || empty($zjuserConfig)) return false;

        $dopost = explode(":", $dopost);
        $type   = $dopost[0];
        $len    = isset($dopost[1]) ? (int)$dopost[1] : 1;

        $num = $zjuserConfig[$type];
        if ($num == 0) return false;

        $differ              = $num - $len;
        $zjuserConfig[$type] = $differ >= 0 ? $differ : 0;

        $config = serialize($zjuserConfig);

        $sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `meal` = '$config' WHERE `id` = $zjuid");
        $dsql->dsqlOper($sql, "update");
    }

    /**
     * 验证经纪人权限
     * 101 后台没有配置套餐
     * 200 没有购买套餐 套餐过期 套餐用完
     * 100 购买了经纪人套餐 套餐有效期内，有剩余数量
     */
    public function checkZjuserMeal($zjuserConfig, $type = "")
    {

        // 如果没有购买套餐，判断系统是否配置了套餐
        if (!$zjuserConfig) {
            $this->param     = "zjuserPriceCost";
            $config          = $this->config();
            $zjuserPriceCost = $config['zjuserPriceCost'];
            if ($zjuserPriceCost) {
                return array("state" => 200, "info" => '您还没有购买经纪人套餐，无法发布房源');
            } else {
                return array("state" => 101, "info" => 'ok');
            }
            // 购买了经纪人套餐，判断是否过期，剩余条数
        } else {
            $now = GetMktime(time());
            if ($zjuserConfig['expired'] <= $now) return array("state" => 200, "info" => '您的经纪人套餐已过期，请续费');

            if ($type == "") {
                return array("state" => 100, "info" => 'ok');
            }
            if ($type == "house") {
                $tit = "发布房源数量";
            } elseif ($type == "refresh") {
                $tit = "刷新次数";
            } elseif ($type == "settop") {
                $tit = "置顶次数";
            }
            if ($zjuserConfig[$type] <= 0) return array("state" => 200, "info" => '您的经纪人套餐' . $tit . '已用完，请升级套餐');

            return array("state" => 100, "info" => 'ok');
        }
    }

    /**
     * 商铺写字楼联合查询
     */
    public function sp_xzl()
    {
        global $dsql;

        $where = $where1 = "";
        $list  = array();

        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where1 = " WHERE `state` = 1 AND `waitpay` = 0";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where1 .= " AND `cityid` = " . $cityid;
            }
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $archives = $dsql->SetQuery("SELECT * FROM ( SELECT `id`, `title`, `litpic`, `type`, `price`, `area`, `bno`, `floor`, `proprice`, `addrid`, `pubdate`, 'sp' as t_name FROM `#@__house_sp` $where1 UNION ALL SELECT `id`, `title`, `litpic`, `type`, `price`, `area`, `bno`, `floor`, `proprice`, `addrid`, `pubdate`, 'xzl' as t_name FROM `#@__house_xzl` $where1 ) PROJECT ORDER BY `pubdate` DESC" . $where);
        $results  = $dsql->dsqlOper($archives, "results");

        if ($results) {
            foreach ($results as $key => $value) {

                $list[$key] = $value;

                $addrName = getParentArr("site_area", $value['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['litpic'] = $value['litpic'] ? getFilePath($value['litpic']) : "";

                $transfer = 0;
                if ($value['t_name'] == "sp") {
                    if ($value['type'] == 2) {
                        $sql      = $dsql->SetQuery("SELECT `transfer` FROM `#@__house_sp` WHERE `id` = " . $value['id']);
                        $res      = $dsql->dsqlOper($sql, "results");
                        $transfer = $res[0]['transfer'];
                    }
                }
                $list[$key]['transfer'] = $transfer;

                $param             = array(
                    "service"  => "house",
                    "template" => $value['t_name'] == "sp" ? "sp-detail" : "xzl-detail",
                    "id"       => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return $list;

    }

    /**
     * 厂房车位联合查询
     */
    public function cf_cw()
    {
        global $dsql;

        $where = $where1 = "";
        $list  = array();

        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where1 = " WHERE `state` = 1";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where1 .= " AND `cityid` = " . $cityid;
            }
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $archives = $dsql->SetQuery("SELECT * FROM ( SELECT `id`, `title`, `litpic`, `type`, `price`, `area`, `proprice`, `protype`, `addrid`, `pubdate`, `transfer`, 'cf' as t_name FROM `#@__house_cf` $where1 UNION ALL SELECT `id`, `title`, `litpic`, `type`, `price`, `area`, `proprice`, `protype`, `addrid`, `pubdate`, `transfer`, 'cw' as t_name FROM `#@__house_cw` $where1 ) PROJECT ORDER BY `pubdate` DESC" . $where);
        $results  = $dsql->dsqlOper($archives, "results");

        if ($results) {
            foreach ($results as $key => $value) {

                $list[$key] = $value;

                $addrName = getParentArr("site_area", $value['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['litpic'] = $value['litpic'] ? getFilePath($value['litpic']) : "";

                if ($value['t_name'] == "cf") {
                    $sql                 = $dsql->SetQuery("SELECT `bno`, `floor` FROM `#@__house_cf` WHERE `id` = " . $value['id']);
                    $res                 = $dsql->dsqlOper($sql, "results");
                    $list[$key]['bno']   = $res[0]['bno'];
                    $list[$key]['floor'] = $res[0]['floor'];
                }

                $param             = array(
                    "service"  => "house",
                    "template" => $value['t_name'] == "cf" ? "cf-detail" : "cw-detail",
                    "id"       => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return $list;

    }


    /*
	 * 小区查询
	 * */

    public function getCommunity()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $keywords = $this->param['keywords'];
                $page     = $this->param['page'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $sid      = $this->param['sid'];
                $sid      = $this->param['sid'];
                $hot      = $this->param['hot'];
                $pageSize = $this->param['pageSize'];
            }
            $where = '';
            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;
            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND `cityid` in (" . $cityid . ")";
                }
            }
            $teachaddrva = array();
            //关键字
            if (!empty($keywords)) {

                //搜索记录
                if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                    siteSearchLog("housecommunity", $keywords);
                }
                $where .= " AND `title` like '%" . $keywords . "%'";
            }

            if ($hot) {
                $where .= " AND `hot` = 1";
            }
            if ($lng != '' && $lat != '') {
                $where .= " AND ROUND(
                        6378.138 * 2 * ASIN(
                            SQRT(POW(SIN((" . $lat . " * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS(" . $lat . " * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN((" . $lng . " * PI() / 180 - `lng` * PI() / 180) / 2), 2))
                        ) * 1000
                    ) < 5000";
            }

            if ($sid) {
                $where .= " AND `id` = " . $sid;
            }

            $archives = $dsql->SetQuery("SELECT `id`,`title`,`longitude`,`latitude`,`addrid` FROM `#@__house_community` WHERE 1 = 1" . $where);
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");

            //总分页数
            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page"       => $page,
                "pageSize"   => $pageSize,
                "totalPage"  => $totalPage,
                "totalCount" => $totalCount
            );
            $atpage   = $pageSize * ($page - 1);
            $where1   = " LIMIT $atpage, $pageSize";
            $results  = getCache("house_community_list", $archives . $where . $where1, 300, array("disabled" => $u));
            if (is_array($results)) {

                foreach ($results as $k => $v) {
                    $schoolarr = $schoolarr1 = array();

                    $schoolcount = 0;
                    $schoolwhere = ' AND `state` = 1';

                    if($v['latitude'] && $v['longitude']){
                        $schoolwhere .= " AND ROUND(
                            6378.138 * 2 * ASIN(
                                SQRT(POW(SIN((" . $v['latitude'] . " * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS(" . $v['latitude'] . " * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN((" . $v['longitude'] . " * PI() / 180 - `lng` * PI() / 180) / 2), 2))
                            ) * 1000
                        ) < 5000";
                    }

                    $schoolsql = $dsql->SetQuery("SELECT `id`,`logo`,`title`,`addrid`,`teachaddr`,`type` FROM `#@__house_releaseschool` WHERE 1 = 1" . $schoolwhere);
                    $schoolres = $dsql->dsqlOper($schoolsql, "results");
                    if (is_array($schoolres)) {
                        foreach ($schoolres as $a => $b) {
                            $teachaddr = '';
                            $typearr   = $isonarr = $teachaddrva = array();

                            $teachaddr = json_decode($b['teachaddr'], true);

                            $lnglat[0] = $v['longitude'];
                            $lnglat[1] = $v['latitude'];
                            if ($teachaddr) {
                                $points = array_column($teachaddr, "points");
                                if ($points) {
                                    for ($i = 0; $i < count($points); $i++) {
                                        $pitem = explode('|', $points[$i]);
                                        for ($a = 0; $a < count($pitem); $a++) {
                                            $pitemarr = explode(',', $pitem[$a]);
                                            array_push($teachaddrva, array("lng" => $pitemarr[0], "lat" => $pitemarr[1]));
                                        }

                                        $ison = is_point_in_polygon(array("lng" => $lnglat[0], "lat" => $lnglat[1]), $teachaddrva);
                                        if ($ison) {
                                            $ison = 1;
                                        } else {
                                            $ison = 0;
                                        }

                                        array_push($isonarr, $ison);
                                    }
                                }
                                //判断学校施教返回有没有当前的小区
                                if (!in_array('1', $isonarr)) {
                                    continue;
                                } else {

                                    $schoolcount += 1;
                                    if ($b['type']) {
                                        $type = explode(',', $b['type']);
                                        for ($i = 0; $i < count($type); $i++) {
                                            $houseitmesql            = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $type[$i]);
                                            $houseitmeres            = $dsql->dsqlOper($houseitmesql, "results");
                                            $typearr[$i]['typename'] = $houseitmeres[0] ? $houseitmeres[0]['typename'] : '';
                                            $typearr[$i]['typeid']   = $type[$i];
                                        }
                                    }
                                    $schoolarr1['logopath'] = getFilepath($b['logo']);
                                    $schoolarr1['typearr']  = $typearr;
                                    $schoolarr1['id']       = $b['id'];
                                    $schoolarr1['title']    = $b['title'];
                                    $schoolarr1['addrid']   = $b['addrid'];

                                    array_push($schoolarr, $schoolarr1);
                                }

                                // $ison = $this->isPointInPolygon($teachaddrva,$lnglat);
                                // if($ison >= 1){
                                //     $schoolcount += 1;
                                // }else{
                                //     unset($schoolres[$a]);
                                // }
                            }


                        }
                        $list[$k]['schoollist'] = is_array($schoolarr) ? $schoolarr : array();
                    }
                    $addrName                = getParentArr("site_area", $v['addrid']);
                    $addrName                = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$k]['addrName']    = $addrName[0] . ' ' . $addrName[1] . ' ' . $addrName[2];
                    $list[$k]['title']       = $v['title'];
                    $list[$k]['schoolcount'] = $schoolcount;
                    $list[$k]['id']          = $v['id'];
                }
//                if($orderby ==1){
//                    array_multisort(array_column($list, "schoolcount"),SORT_ASC,$list);
//                }
                return array("pageInfo" => $pageinfo, "list" => $list);
            }
        }
    }

    /*
     *学校查询
     * */
    public function getSchool()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $keywords = $this->param['keywords'];
                $order    = $this->param['order'];
//                $getcommunity   = $this->param['getcommunity'];
                $schoolnature = $this->param['schoolnature'];
                $schooltype   = $this->param['schooltype'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }

            $where = ' AND `state` =1';
            $list  = array();
            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;
            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND `cityid` in (" . $cityid . ")";
                }
            }
            if ($order != '') {
                $orderby = " ORDER BY `click` DESC";
            }
            //关键字
            if (!empty($keywords)) {

                //搜索记录
                if ((!empty($_POST['keywords']) || !empty($_GET['keywords'])) && empty($_GET['callback'])) {
                    siteSearchLog("houseschool", $keywords);
                }
                $where .= " AND `title` like '%" . $keywords . "%'";
            }
            if (isset($schoolnature) && $schoolnature != '') {
                $where .= " AND `schoolnature` =" . $schoolnature;
            }
            if (!empty($schooltype)) {
                $where .= " AND FIND_IN_SET('" . $schooltype . "',type)";
            }

            $archives = $dsql->SetQuery("SELECT * FROM `#@__house_releaseschool` WHERE 1 = 1" . $where);
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");

            //总分页数
            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page"       => $page,
                "pageSize"   => $pageSize,
                "totalPage"  => $totalPage,
                "totalCount" => $totalCount
            );
            $atpage   = $pageSize * ($page - 1);
            $where1   = " LIMIT $atpage, $pageSize";

            $results = $dsql->dsqlOper($archives . $where . $orderby . $where1, "results");

            if ($results) {
                foreach ($results as $k => $v) {
                    $typearr            = array();
                    $list[$k]['id']     = $v['id'];
                    $list[$k]['addrid'] = $v['addrid'];
                    $list[$k]['lng']    = $v['lng'];
                    $list[$k]['title']  = $v['title'];
                    $list[$k]['lat']    = $v['lat'];
                    $list[$k]['click']  = $v['click'];
                    $list[$k]['logo']   = $v['logo'] ? getFilepath($v['logo']) : '';
                    $list[$k]['banner'] = $v['banner'] ? getFilepath($v['banner']) : '';

                    $list[$k]['schoolnature'] = $v['schoolnature'];

                    if ($v['schoolnature'] == 0) {
                        $list[$k]['schoolnaturename'] = '公办';
                    } elseif ($v['schoolnature'] == 1) {
                        $list[$k]['schoolnaturename'] = '私办';
                    } else {
                        $list[$k]['schoolnaturename'] = '合办';
                    }

                    $addrName             = getParentArr("site_area", $v['addrid']);
                    $addrName             = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$k]['addrName'] = $addrName[0] . ' ' . $addrName[1] . ' ' . $addrName[2];

                    if ($v['type']) {
                        $type = explode(',', $v['type']);
                        for ($i = 0; $i < count($type); $i++) {
                            $houseitmesql            = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $type[$i]);
                            $houseitmeres            = $dsql->dsqlOper($houseitmesql, "results");
                            $typearr[$i]['typename'] = $houseitmeres[0] ? $houseitmeres[0]['typename'] : '';
                            $typearr[$i]['typeid']   = $type[$i];
                        }
                    }
                    $list[$k]['typearr'] = $typearr;
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }
    }


    /*
     * 学校列表
     * */
    public function schoolList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $re           = RemoveXSS($_REQUEST);
                $sid          = $this->param['sid'];
                $addrid       = $this->param['addrid'];
                $business     = $re['business'];
                $schoolnature = $this->param['schoolnature'];
                $schooltype   = $this->param['schooltype'];
                $page         = $this->param['page'];
                $pageSize     = $this->param['pageSize'];
            }
            //遍历地区
            $schoolwhere = '';
            if (!empty($addrid)) {
                if (!empty($business)) {
                    $addrid = $business;
                }
                if ($dsql->getTypeList($addrid, "site_area")) {
                    global $arr_data;
                    $arr_data = array();
                    $lower    = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                    $lower    = $addrid . "," . join(',', $lower);

                } else {
                    $lower = $addrid;
                }

                $schoolwhere .= " AND `addrid` in ($lower)";
            }
            if (isset($schoolnature) && $schoolnature != '') {
                $schoolwhere .= " AND `schoolnature` =" . $schoolnature;
            }
            if (!empty($schooltype)) {
                $schoolwhere .= " AND FIND_IN_SET('" . $schooltype . "',type)";
            }
            $schoolwhere .= ' AND `state` = 1 ';

            $wherescid = '';
            if ($sid) {
                //  先查 小区5公里范围内的小区在查小区在不在学校的施教范围之内
                $archives = $dsql->SetQuery("SELECT `id`,`title`,`longitude`,`latitude`,`addrid` FROM `#@__house_community` WHERE 1 = 1 AND `id` =" . $sid);
                $results  = $dsql->dsqlOper($archives, "results");

                $community = $results[0];
                if (!$community['latitude'] || !$community['longitude']) {
                    return array("state" => 200, "info" => '小区坐标未配置！');
                }
                $schoolwhere .= " AND ROUND(
                        6378.138 * 2 * ASIN(
                            SQRT(POW(SIN((" . $community['latitude'] . " * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS(" . $community['latitude'] . " * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN((" . $community['longitude'] . " * PI() / 180 - `lng` * PI() / 180) / 2), 2))
                        ) * 1000
                    ) < 5000";

                $sql = $dsql->SetQuery("SELECT `id`,`teachaddr`FROM `#@__house_releaseschool` WHERE 1 = 1" . $schoolwhere);

                $res       = $dsql->dsqlOper($sql, "results");
                $lnglat[0] = $community['longitude'];
                $lnglat[1] = $community['latitude'];
                if ($res) {
                    foreach ($res as $key => $value) {
                        $isonarr   = array();
                        $teachaddr = json_decode($value['teachaddr'], true);
                        if ($teachaddr) {
                            $points = array_column($teachaddr, "points");
                        }
                        if ($points) {
                            for ($i = 0; $i < count($points); $i++) {
                                $pitem       = explode('|', $points[$i]);
                                $teachaddrva = array();
                                for ($a = 0; $a < count($pitem); $a++) {
                                    $pitemarr = explode(',', $pitem[$a]);
                                    array_push($teachaddrva, array("lng" => $pitemarr[0], "lat" => $pitemarr[1]));
                                }

                                $ison = is_point_in_polygon(array("lng" => $lnglat[0], "lat" => $lnglat[1]), $teachaddrva);
                                if ($ison) {
                                    $ison = 1;
                                } else {
                                    $ison = 0;
                                }

                                array_push($isonarr, $ison);
                            }
                        }
                        if (!in_array('1', $isonarr)) {
                            unset($res[$key]);
                        }

                    }

                    if ($res) {
                        $schoolid  = array_column($res, 'id');
                        $wherescid = " AND `id` in (" . join(',', $schoolid) . ")";
                    } else {
                        return array("state" => 200, "info" => '暂无数据！');
                    }
                }


            }
            $schoolsql = $dsql->SetQuery("SELECT `id`,`logo`,`title`,`addrid`,`teachaddr`,`click`,`type`,`schoolnature` FROM `#@__house_releaseschool` WHERE 1 = 1" . $schoolwhere . $wherescid);

            //总条数
            $totalCount = $dsql->dsqlOper($schoolsql, "totalCount");
            //总分页数
            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page"       => $page,
                "pageSize"   => $pageSize,
                "totalPage"  => $totalPage,
                "totalCount" => $totalCount
            );

            $atpage    = $pageSize * ($page - 1);
            $where1    = " LIMIT $atpage, $pageSize";
            $schoolres = $dsql->dsqlOper($schoolsql . $where1, "results");
            if (is_array($schoolres) && $schoolres) {
                foreach ($schoolres as $a => $b) {
                    $teachaddr = '';
                    $typearr   = array();

                    $list[$a]['logopath']     = getFilepath($b['logo']);
                    $list[$a]['id']           = $b['id'];
                    $list[$a]['title']        = $b['title'];
                    $list[$a]['schoolnature'] = $b['schoolnature'];

                    if ($b['schoolnature'] == 0) {
                        $list[$a]['schoolnaturename'] = '公办';
                    } elseif ($b['schoolnature'] == 1) {
                        $list[$a]['schoolnaturename'] = '私办';
                    } else {
                        $list[$a]['schoolnaturename'] = '合办';
                    }
                    $list[$a]['addrid'] = $b['addrid'];
                    if ($b['type']) {
                        $type = explode(',', $b['type']);
                        for ($i = 0; $i < count($type); $i++) {
                            $houseitmesql            = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $type[$i]);
                            $houseitmeres            = $dsql->dsqlOper($houseitmesql, "results");
                            $typearr[$i]['typename'] = $houseitmeres[0] ? $houseitmeres[0]['typename'] : '';
                            $typearr[$i]['typeid']   = $type[$i];
                        }
                    }
                    $list[$a]['typearr'] = $typearr;
                    $teachaddr           = json_decode($b['teachaddr'], true);

                    $list[$a]['teachaddr'] = $teachaddr;
                    $addrName              = getParentArr("site_area", $b['addrid']);
                    $addrName              = array_reverse(parent_foreach($addrName, "typename"));
                    $list[$a]['addrName']  = $addrName[0] . ' ' . $addrName[1] . ' ' . $addrName[2];
                    $list[$a]['title']     = $b['title'];
                    $list[$a]['id']        = $b['id'];
                    $list[$a]['click']     = $b['click'];
                }
            }

        }
        return array("pageInfo" => $pageinfo, "list" => $list);

    }

    /*
     *学校详情
     * */
    public function schoolDetail()
    {
        global $dsql;
        $schoolDetail = $schoolcomm = array();
        $id           = $this->param;
        $id           = is_numeric($id) ? $id : (is_array($id) ? (int)$id['id'] : '');
        if (!is_numeric($id) || !$id) return array("state" => 200, "info" => '格式错误！');
        $schoolsql = $dsql->SetQuery("SELECT `title`,`lng`,`lat`,`addrid`,`logo`,`banner`,`note`,`teachaddr`,`admissioninfo`,`type`,`schoolnature`,`click`,`pubdate` FROM `#@__house_releaseschool` WHERE `id` = " . $id . " AND `state` = 1");

        $schoolres = $dsql->dsqlOper($schoolsql, "results");

        if (is_array($schoolres) && $schoolres) {
            $typename = $housecomm = $teacharr = $teachaddr = array();

            $schoolDetail['title']         = $schoolres[0]['title'];
            $schoolDetail['lng']           = $schoolres[0]['lng'];
            $schoolDetail['lat']           = $schoolres[0]['lat'];
            $schoolDetail['click']         = $schoolres[0]['click'];
            $schoolDetail['schoolnature']  = $schoolres[0]['schoolnature'];
            $schoolDetail['logo']          = getFilePath($schoolres[0]['logo']);
            $schoolDetail['banner']        = getFilePath($schoolres[0]['banner']);
            $schoolDetail['note']          = $schoolres[0]['note'];
            $schoolDetail['pubdate']       = date('Y-m-d H:i:s', $schoolres[0]['pubdate']);
            $teach                         = $schoolres[0]['teachaddr'] ? json_decode($schoolres[0]['teachaddr'], true) : array();
            $schoolDetail['admissioninfo'] = $schoolres[0]['admissioninfo'];

            if($teach){
                foreach ($teach as $k => $v) {
                    $teacharr[$v['leix']][] = $v;
                }
            }
            foreach ($teacharr as $a => $b) {
                if (count($b) > 1) {
                    foreach (call_user_func_array('array_merge_recursive', $b) as $key => $item) {
                        $teacharray[$key] = join('/', array_unique($item));
                    }
                    array_push($teachaddr, $teacharray);
                } else {
                    array_push($teachaddr, $b[0]);
                }

            }

            foreach ($teachaddr as $j => &$l) {
                $typesql   = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $l['leix']);
                $typeres   = $dsql->dsqlOper($typesql, "results");
                $l['type'] = $typeres[0] ? $typeres[0]['typename'] : '';
            }
            $schoolDetail['teacharr'] = $teachaddr;
            $addrName                 = getParentArr("site_area", $schoolres[0]['addrid']);
            $addrName                 = array_reverse(parent_foreach($addrName, "typename"));
            $schoolDetail['addrName'] = $addrName[0] . ' ' . $addrName[1] . ' ' . $addrName[2];

            $typearr              = $schoolres[0]['type'] ? explode(',', $schoolres[0]['type']) : '';
            $schoolDetail['type'] = $typearr;
            if ($typearr) {
                for ($i = 0; $i < count($typearr); $i++) {
                    $houseitmesql             = $dsql->SetQuery("SELECT `typename` FROM `#@__houseitem` WHERE `id` = " . $typearr[$i]);
                    $houseitmeres             = $dsql->dsqlOper($houseitmesql, "results");
                    $typename[$i]['typename'] = $houseitmeres[0] ? $houseitmeres[0]['typename'] : '';
                    $typename[$i]['typeid']   = $typearr[$i];
                }
            }
            $schoolDetail['typearr'] = $typename;

            if ($schoolres[0]['schoolnature'] == 0) {
                $schoolDetail['schoolnaturename'] = '公办';
            } elseif ($schoolres[0]['schoolnature'] == 1) {
                $schoolDetail['schoolnaturename'] = '私办';
            } else {
                $schoolDetail['schoolnaturename'] = '合办';
            }
            $schoolcommsql = $dsql->SetQuery("SELECT `userid`,`content`,`dtime`,`reply`,`replydate`,`ipaddr` FROM `#@__housecommon` WHERE  `aid` = $id AND `ischeck` = 1");
            $schoolcommres = $dsql->dsqlOper($schoolcommsql, "results");
            if ($schoolcommres) {
                foreach ($schoolcommres as $k => $v) {
                    $housecomm[$k]['content']   = $v['content'];
                    $housecomm[$k]['reply']     = $v['reply'];
                    $housecomm[$k]['dtime']     = FloorTime(GetMkTime(time()) - $v['dtime']);
                    $housecomm[$k]['replydate'] = FloorTime(GetMkTime(time()) - $v['replydate']);
                    $housecomm[$k]['iphome']    = getIpHome($v['ipaddr']);

                    $usersql = $dsql->SetQuery("SELECT `username`,`photo` FROM `#@__member` WHERE  `id` = " . $v['userid']);

                    $userres = $dsql->dsqlOper($usersql, "results");

                    $housecomm[$k]['username'] = $userres[0]['username'];
                    $housecomm[$k]['photo']    = getFilePath($userres[0]['photo']);
                }
            }
            $schoolDetail ['housecomm'] = $housecomm;

            return $schoolDetail;


        }

    }


    /**
     * 出售-出租联合查询
     */
    public function getSaleRent()
    {
        global $dsql;

        $where = $where1 = "";
        $list  = array();

        $uid      = $this->param['uid'];
        $zjcom    = $this->param['zjcom'];
        $gettype  = (int)$this->param['gettype'];
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where1 = " WHERE `state` = 1";

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid && $gettype == 0) {
                $where1 .= " AND `cityid` = " . $cityid;
            }
        }

        if ($zjcom) {
            $sql       = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser`  WHERE `zjcom` = " . $zjcom);
            $ret       = $dsql->dsqlOper($sql, "results");
            $useridArr = array();
            if ($ret) {
                foreach ($ret as $row) {
                    $useridArr[] = $row['id'];
                }
                $useridArr = join(',', $useridArr);
                $where1    .= " AND `userid` in ($useridArr) ";
            } else {
                $where1 .= " AND 1 = 2";
            }
        }

        //取指定会员的信息
        if ($uid) {
//			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
//			$ret = $dsql->dsqlOper($sql, "results");
//			if($ret){
//				$where1 .= " AND `userid` = ".$ret[0]['id'];
//			}else{
//				$where1 .= " AND `userid` = ".$uid;
//			}
            $where1 .= " AND `userid` = " . $uid;
        }

        //查询身份是中介,经纪人或者普通用户


        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $archives = $dsql->SetQuery("SELECT * FROM ( SELECT `id`, `userid`, `title`, `addrid`, `litpic`, `price`, `area`, `room`, `hall`, `guard`,  `pubdate`, 'sale' as t_name FROM `#@__house_sale` $where1 UNION ALL SELECT `id`, `userid`, `title`, `addrid`, `litpic`, `price`, `area`, `room`, `hall`, `guard`, `pubdate`, 'zu' as t_name FROM `#@__house_zu` $where1 ) PROJECT ORDER BY `pubdate` DESC" . $where);
        $results  = $dsql->dsqlOper($archives, "results");

        if ($results) {
            foreach ($results as $key => $value) {
                $list[$key] = $value;

                $archives = $dsql->SetQuery("SELECT m.`nickname`, m.`photo`, m.`phone` FROM `#@__member` m LEFT JOIN `#@__house_zjuser` zj ON zj.`userid` = m.`id` WHERE zj.`id` = " . $value['userid']);
                $member   = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $nickname  = $member[0]['nickname'];
                    $userPhoto = getFilePath($member[0]['photo']);
                    $userPhone = $member[0]['phone'];
                } else {
                    $nickname  = "";
                    $userPhoto = "";
                    $userPhone = "";
                }
                $list[$key]['userid']    = $value['userid'];
                $list[$key]['nickname']  = $nickname;
                $list[$key]['userPhoto'] = $userPhoto;
                $list[$key]['userPhone'] = $userPhone;

                $list[$key]['room'] = $value['room'] . "室" . $value['hall'] . "厅" . $value['guard'] . "卫";

                $addrName = getParentArr("site_area", $value['addrid']);
                global $data;
                $data               = "";
                $addrName           = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr'] = $addrName;

                $list[$key]['litpic'] = $value['litpic'] ? getFilePath($value['litpic']) : "";

                if ($value['t_name'] == "sale") {
                    $list[$key]['type']     = '1';
                    $list[$key]['typename'] = '出售';
                } else {
                    $list[$key]['type']     = '0';
                    $list[$key]['typename'] = '出租';
                }

                $param             = array(
                    "service"  => "house",
                    "template" => $value['t_name'] == "sale" ? "sale-detail" : "zu-detail",
                    "id"       => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return $list;
    }

    /**
     * 房产咨询首页 更多
     */
    public function getNewsType()
    {
        global $dsql;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = $this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        if (!empty($type)) {
            $where = " and id not in($type)";
        }

        $sql  = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__house_newstype` WHERE `parentid`=0  $where order by id ASC LIMIT 1");
        $ret  = $dsql->dsqlOper($sql, "results");
        $html = '';
        if ($ret) {
            $parentid = $ret[0]['id'];
            $html     = '<div class="pubbox mainbox">';

            $html  .= '<div class="leadertop fn-clear">';
            $html  .= '<span class="ltit" data-id="' . $ret[0]['id'] . '">' . $ret[0]['typename'] . '</span>';
            $param = array(
                "service"  => "house",
                "template" => "news-list",
                "id"       => $ret[0]['id']
            );
            $url   = getUrlPath($param);

            $html   .= '<a href="' . $url . '" class="news_more">更多 <em>>></em></a>';
            $html   .= '<ul>';
            $sql    = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__house_newstype` WHERE `parentid`=$parentid   order by id ASC");
            $newret = $dsql->dsqlOper($sql, "results");
            if ($newret) {
                foreach ($newret as $val) {
                    $param = array(
                        "service"  => "house",
                        "template" => "news-list",
                        "id"       => $val['id']
                    );
                    $url   = getUrlPath($param);

                    $html .= '<li><a href="' . $url . '">' . $val['typename'] . '</a></li>';
                }
            }
            $html .= '</ul>';
            $html .= '</div>';

            $html .= '<div class="contbox fn-clear">';

            //左边广告
            $html  .= '<div class="nl fn-left">';
            $param = array("title" => '房产_模板六_电脑端_广告_' . $parentid . '_1');
            $html  .= '<div class="adbox">';
            $html  .= getMyAd($param);
            $html  .= '</div>';
            $param = array("title" => '房产_模板六_电脑端_广告_' . $parentid . '_2');
            $html  .= '<div class="adbox">';
            $html  .= getMyAd($param);
            $html  .= '</div>';
            $html  .= '</div>';


            $html .= '<div class="nm fn-left">';

            //遍历分类
            $wheren = '';

            //数据共享
            require(HUONIAOINC . "/config/house.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $wheren .= " AND `cityid` = " . $cityid;
                }
            }

            if (!empty($parentid)) {
                if ($dsql->getTypeList($parentid, "house_newstype")) {
                    $lower = arr_foreach($dsql->getTypeList($parentid, "house_newstype"));
                    $lower = $parentid . "," . join(',', $lower);
                } else {
                    $lower = $parentid;
                }
                $wheren .= " AND `typeid` in ($lower)";
            }

            $o   = " ORDER BY `weight` DESC, `id` DESC";
            $sql = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `pubdate` FROM `#@__house_news` WHERE `arcrank` = 0" . $wheren . $o . " limit 0,18");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $html1 = $html2 = $html3 = $html4 = $html5 = $html6 = '';
                foreach ($res as $key => $val) {
                    $param = array(
                        "service"  => "house",
                        "template" => "news-detail",
                        "id"       => $val['id']
                    );
                    $url   = getUrlPath($param);
                    if ($key == 0) {
                        $html1 = '<h2><a href="' . $url . '" target="_blank">' . $val['title'] . '</a></h2>';
                    } elseif ($key == 5) {
                        $html3 = '<h2><a href="' . $url . '" target="_blank">' . $val['title'] . '</a></h2>';
                    } elseif ($key > 0 && $key < 5) {
                        $html2 .= '<li><a href="' . $url . '" target="_blank"><em>•</em> ' . $val['title'] . '</a></li>';
                    } elseif ($key > 5 && $key < 10) {
                        $html4 .= '<li><a href="' . $url . '" target="_blank"><em>•</em> ' . $val['title'] . '</a></li>';
                    } elseif ($key == 10) {
                        $litpic = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";
                        $html5  = '<div class="imgbox"><a href="' . $url . '"><img src="' . $litpic . '" target="_blank" alt=""><div class="imgInfo"><h3>' . $val['title'] . '</h3><div class="bg"></div></div></a></div>';
                    } else {
                        $html6 .= '<li><a href="' . $url . '" target="_blank"><em>•</em> ' . $val['title'] . '</a></li>';
                    }
                }
            }

            $html .= $html1 . '<ul>' . $html2 . '</ul>' . $html3 . '<ul>' . $html4 . '</ul>';
            $html .= '</div>';

            //右边新闻
            $html .= '<div class="nr fn-left">';
            $html .= $html5 . '<ul>' . $html6 . '</ul>';
            $html .= '</div>';

            $html .= '</div>';
            $html .= '</div>';
            echo $html;
            exit;
        } else {
            echo 1;
            exit;
        }

        //return $ret;
    }

    /**
     * 经纪人条件筛选
     */
    public function getCondition()
    {
        global $dsql;
        $where = '';
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $zj   = (int)$this->param['zj'];
                $type = (int)$this->param['type'];
            }
        }

        $tab = $type == 1 ? "house_zu" : "house_sale";

        //中介
        if ($zj != "") {
            $where .= " AND s.`usertype` = 1 AND s.`userid` = " . $zj;
        }

        $archives = $dsql->SetQuery("SELECT s.`addrid`, s.`communityid` FROM `#@__" . $tab . "` s WHERE 1=1 " . $where . " GROUP BY  s.`communityid` ");
        $results  = $dsql->dsqlOper($archives, "results");
        $html     = '';
        $addrArr  = array();
        if ($results) {
            foreach ($results as $key => $row) {
                $communitySql    = $dsql->SetQuery("SELECT `id`, `title`, `addrid`, `addr` FROM `#@__house_community` WHERE `id` = " . $row["communityid"]);
                $communityResult = $dsql->getTypeName($communitySql);
                if ($communityResult) {
                    $addrName = getParentArr("site_area", $communityResult[0]['addrid']);
                    global $data;
                    $data                                                                                   = "";
                    $parentidaddrName                                                                       = $addrName;
                    $addrName                                                                               = array_reverse(parent_foreach($addrName, "typename"));
                    $addrArr[$parentidaddrName[0]['parentid']]['addrid']                                    = $communityResult[0]['addrid'];
                    $addrArr[$parentidaddrName[0]['parentid']]['addrname']                                  = $addrName[2];
                    $addrArr[$parentidaddrName[0]['parentid']]['lower'][$communityResult[0]['id']]['id']    = $communityResult[0]['id'];
                    $addrArr[$parentidaddrName[0]['parentid']]['lower'][$communityResult[0]['id']]['title'] = $communityResult[0]['title'];

                    $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__" . $tab . "` s WHERE 1=1 $where and s.`communityid`=" . $communityResult[0]['id']);
                    //总条数
                    $totalCount                                                                            = $dsql->dsqlOper($archives, "totalCount");
                    $addrArr[$parentidaddrName[0]['parentid']]['lower'][$communityResult[0]['id']]['nums'] = $totalCount;
                }
            }
            foreach ($addrArr as $key => $val) {
                $html .= '<li>';
                $html .= '<a data-id="' . $key . '" data-type="addrid" href="javascript:;" class="litit"><i class="sicon reduce"></i>' . $val['addrname'] . '</a>';

                $html .= '<ul class="sub_nav ushow">';
                foreach ($val['lower'] as $v) {
                    $html .= '<li class="litit-li" data-id="' . $v['id'] . '" data-type="community"><a href="javascript:;">' . $v['title'] . ' <em>(' . $v['nums'] . ')</em></a></li>';
                }
                $html .= '</ul>';
                $html .= '</li>';
            }

            //总价
            if ($type == 1) {
                $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__" . $tab . "` s WHERE 1=1 $where ");
                //100万以下
                $total100 = $dsql->dsqlOper($archives . " AND s.`price` < 1000", "totalCount");
                //100-150万
                $total150 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 1000 and 1500 ", "totalCount");
                //150-200万
                $total200 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 1500 and 2000 ", "totalCount");
                //200-250万
                $total250 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 2000 and 3000 ", "totalCount");
                //300-500万
                $total500 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 3000 and 5000 ", "totalCount");
                //800万以上
                $total800 = $dsql->dsqlOper($archives . " AND s.`price` > 5000 ", "totalCount");
                $html     .= '<li>';
                $html     .= '<a href="javascript:;" class="litit"><i class="sicon reduce"></i>租金</a>';
                $html     .= '<ul class="sub_nav ushow">';
                $html     .= '<li class="litit-li" data-id=",10" data-type="price"><a href="javascript:;">1000元/月以下 <em>(' . $total100 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="10,15" data-type="price"><a href="javascript:;">1000-1500元 <em>(' . $total150 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="15,20" data-type="price"><a href="javascript:;">1500-2000元 <em>(' . $total200 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="20,30" data-type="price"><a href="javascript:;">2000-3000元 <em>(' . $total250 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="30,50" data-type="price"><a href="javascript:;">3000-5000元 <em>(' . $total500 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="50," data-type="price"><a href="javascript:;">5000元以上 <em>(' . $total800 . ')</em></a></li>';
                $html     .= '</ul>';
                $html     .= '</li>';
            } else {
                $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__" . $tab . "` s WHERE 1=1 $where ");
                //100万以下
                $total100 = $dsql->dsqlOper($archives . " AND s.`price` < 100", "totalCount");
                //100-150万
                $total150 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 100 and 150 ", "totalCount");
                //150-200万
                $total200 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 150 and 200 ", "totalCount");
                //200-250万
                $total250 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 200 and 250 ", "totalCount");
                //300-500万
                $total500 = $dsql->dsqlOper($archives . " AND s.`price` BETWEEN 300 and 500 ", "totalCount");
                //800万以上
                $total800 = $dsql->dsqlOper($archives . " AND s.`price` > 800 ", "totalCount");
                $html     .= '<li>';
                $html     .= '<a href="javascript:;" class="litit"><i class="sicon reduce"></i>总价</a>';
                $html     .= '<ul class="sub_nav ushow">';
                $html     .= '<li class="litit-li" data-id=",100" data-type="price"><a href="javascript:;">100万以下 <em>(' . $total100 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="100,150" data-type="price"><a href="javascript:;">100-150万 <em>(' . $total150 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="150,200" data-type="price"><a href="javascript:;">150-200万 <em>(' . $total200 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="200,250" data-type="price"><a href="javascript:;">200-250万 <em>(' . $total250 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="300,500" data-type="price"><a href="javascript:;">300-500万 <em>(' . $total500 . ')</em></a></li>';
                $html     .= '<li class="litit-li" data-id="800," data-type="price"><a href="javascript:;">800万以上 <em>(' . $total800 . ')</em></a></li>';
                $html     .= '</ul>';
                $html     .= '</li>';
            }

            //户型
            $archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__" . $tab . "` s WHERE 1=1 $where ");
            $total1   = $dsql->dsqlOper($archives . " AND s.`room` = 1", "totalCount");
            $total2   = $dsql->dsqlOper($archives . " AND s.`room` = 2 ", "totalCount");
            $total3   = $dsql->dsqlOper($archives . " AND s.`room` = 3 ", "totalCount");
            $total4   = $dsql->dsqlOper($archives . " AND s.`room` = 4 ", "totalCount");
            $total5   = $dsql->dsqlOper($archives . " AND s.`room` = 5 ", "totalCount");
            $total6   = $dsql->dsqlOper($archives . " AND s.`room` > 5 ", "totalCount");
            $html     .= '<li>';
            $html     .= '<a href="javascript:;" class="litit"><i class="sicon reduce"></i>户型</a>';
            $html     .= '<ul class="sub_nav ushow">';
            $html     .= '<li class="litit-li" data-id="1" data-type="room"><a href="javascript:;">一室 <em>(' . $total1 . ')</em></a></li>';
            $html     .= '<li class="litit-li" data-id="2" data-type="room"><a href="javascript:;">二室 <em>(' . $total2 . ')</em></a></li>';
            $html     .= '<li class="litit-li" data-id="3" data-type="room"><a href="javascript:;">三室 <em>(' . $total3 . ')</em></a></li>';
            $html     .= '<li class="litit-li" data-id="4" data-type="room"><a href="javascript:;">四室 <em>(' . $total4 . ')</em></a></li>';
            $html     .= '<li class="litit-li" data-id="5" data-type="room"><a href="javascript:;">五室 <em>(' . $total5 . ')</em></a></li>';
            $html     .= '<li class="litit-li" data-id="0" data-type="room"><a href="javascript:;">五室以上 <em>(' . $total6 . ')</em></a></li>';
            $html     .= '</ul>';
            $html     .= '</li>';
            echo $html;
            exit;
        } else {
            echo 101;
            exit;
        }
    }

    /**
     * 支付前检查
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

        $ordertype  = $param['ordertype'];    //订单类型
        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码
        $paytype    = $param['paytype'];     //支付方式

        $userid = $param['userid'] ? $param['userid'] : $userid;

        if ($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        if (empty($ordertype) || empty($ordernum)) return array("state" => 200, "info" => "参数错误");

        //查询订单信息
        $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        $res      = $results[0];

        $totalPrice = (float)$res['amount'];


        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if ($usePinput == 1 && !empty($point)) {
            if ($userpoint < $point) return array("state" => 200, "info" => $langData['siteConfig'][21][103]);  //您的可用积分不足，支付失败！
            $useTotal += $point / $cfg_pointRatio;
            $tit[]    = $cfg_pointName;
        }

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($balance)) {
                if (empty($paypwd)) {
                    return array("state" => 200, "info" => $langData['siteConfig'][21][88]);  //请输入支付密码！
                } else {
                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res      = $results[0];
                    $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
                    if ($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['siteConfig'][21][89]);  //支付密码输入错误，请重试！
                }
            //验证余额
            if ($usermoney < $balance) return array("state" => 200, "info" => $langData['siteConfig'][20][213]);  //您的余额不足，支付失败！

            $useTotal += $balance;
            $tit[]    = $langData['siteConfig'][19][363];  //余额
        }

        if($useTotal > $totalPrice) return array("state" => 200, "info" => str_replace('1', join($langData['siteConfig'][13][46], $tit), $langData['siteConfig'][22][104]));  //和  您使用的1超出订单总费用，请重新输入！

        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }

    /**
     * 支付
     */
    public function pay()
    {
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $ordertype = $param['ordertype'];   //类型

        if ($ordertype && method_exists($this, $ordertype)) {
            $this->$ordertype();
        } else {
            die("操作错误！");
        }

    }

    /**
     * 移动端首页导航
     */
    public function touchHomePageNav()
    {
        global $cfg_secureAccess;
        global $cfg_basehost;

        $base   = $cfg_secureAccess . $cfg_basehost;
        $param  = array("service" => "house");
        $url    = getUrlPath($param) . "/";
        $tplDir = $base . "/static/";

        $menu = array(
            0  => array(
                "code"      => 'loupan',
                "name"      => '新房',
                "icon"      => $tplDir . "images/house/touchHomePage/f_lp.png",
                "url"       => $url . "loupan.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'loupan', 'param' => 'keywords='))
            ),
            1  => array(
                "code"      => 'sale',
                "name"      => '二手房',
                "icon"      => $tplDir . "images/house/touchHomePage/f_sale.png",
                "url"       => $url . "sale.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'sale', 'param' => 'keywords='))
            ),
            2  => array(
                "code"      => 'school',
                "name"      => '学区房',
                "icon"      => $tplDir . "images/house/touchHomePage/f_school.png",
                "url"       => $url . "school.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'school', 'param' => 'keywords='))
            ),
            3  => array(
                "code"      => 'zu',
                "name"      => '租房',
                "icon"      => $tplDir . "images/house/touchHomePage/f_zu.png",
                "url"       => $url . "zu.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'zu', 'param' => 'keywords='))
            ),
            4  => array(
                "code"      => 'sp',
                "name"      => '商铺',
                "icon"      => $tplDir . "images/house/touchHomePage/f_sp.png",
                "url"       => $url . "sp.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'sp', 'param' => 'keywords='))
            ),
            5  => array(
                "code"      => 'xzl',
                "name"      => '写字楼',
                "icon"      => $tplDir . "images/house/touchHomePage/f_xzl.png",
                "url"       => $url . "xzl.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'xzl', 'param' => 'keywords='))
            ),
            6  => array(
                "code"      => 'broker',
                "name"      => '找经纪人',
                "icon"      => $tplDir . "images/house/touchHomePage/f_broker.png",
                "url"       => $url . "broker.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'broker', 'param' => 'keywords='))
            ),
            7  => array(
                "code"      => 'store',
                "name"      => '找门店',
                "icon"      => $tplDir . "images/house/touchHomePage/f_store.png",
                "url"       => $url . "store.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'store', 'param' => 'keywords='))
            ),
            8  => array(
                "code"      => 'cf',
                "name"      => '厂房/仓库',
                "icon"      => $tplDir . "images/house/touchHomePage/f_cf.png",
                "url"       => $url . "cf.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'cf', 'param' => 'keywords='))
            ),
            9  => array(
                "code" => 'demand0',
                "name" => '求租',
                "icon" => $tplDir . "images/house/touchHomePage/f_qz.png",
                "url"  => $url . "demand.html?typeid=0"
            ),
            10 => array(
                "code" => 'demand1',
                "name" => '求购',
                "icon" => $tplDir . "images/house/touchHomePage/f_qg.png",
                "url"  => $url . "demand.html?typeid=1"
            ),
            11 => array(
                "code"      => 'cw',
                "name"      => '车位',
                "icon"      => $tplDir . "images/house/touchHomePage/f_cw.png",
                "url"       => $url . "cw.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'cw', 'param' => 'keywords='))
            ),
            12 => array(
                "code" => 'faq',
                "name" => '房产问答',
                "icon" => $tplDir . "images/house/touchHomePage/f_wd.png",
                "url"  => $url . "faq.html"
            ),
            13 => array(
                "code" => 'kan',
                "name" => '看房团',
                "icon" => $tplDir . "images/house/touchHomePage/f_kan.png",
                "url"  => $url . "kan.html"
            ),
            14 => array(
                "code"      => 'news',
                "name"      => '房产资讯',
                "icon"      => $tplDir . "images/house/touchHomePage/f_news.png",
                "url"       => $url . "news.html",
                "searchUrl" => getUrlPath(array('service' => 'house', 'template' => 'news', 'param' => 'keywords='))
            )
        );

        return $menu;
    }

    /**
     * 移动端首页分站区域及链接
     */
    public function touchArea()
    {
        global $dsql;
        $param = $this->param;

        $type = (int)$param['type'];

        //数据共享
        require(HUONIAOINC . "/config/house.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            if (empty($type)) $type = getCityId();
        }

        $this->param = array('type' => $type);
        $res         = $this->addr();

        $param = array("service" => "house", "template" => "loupan", "addrid" => "addrid");
        $url   = getUrlPath($param);

        $list = array();
        if ($res) {
            foreach ($res as $key => $value) {
                $list[$key]['id']       = $value['id'];
                $list[$key]['typename'] = $value['typename'];
                $list[$key]['url']      = str_replace("addrid", $value['id'], $url);
            }
        }

        return $list;

    }

    /**
     * 移动端楼盘价格区间
     */
    public function touchLoupanPrice()
    {

        $param = array(
            'service'  => 'house',
            'template' => 'loupan',
            'addrid'   => '',
            'business' => '',
            'subway'   => '',
            'station'  => '',
            'price'    => "price",
        );
        $url   = getUrlPath($param);

        $menu = array(
            0 => array(
                "name" => '8千以下',
                "url"  => str_replace('price', ',8', $url)
            ),
            1 => array(
                "name" => '8千-1万',
                "url"  => str_replace('price', '8,10', $url)
            ),
            2 => array(
                "name" => '1-1.5万',
                "url"  => str_replace('price', '10,15', $url)
            ),
            3 => array(
                "name" => '1.5-2万',
                "url"  => str_replace('price', '15,20', $url)
            ),
            4 => array(
                "name" => '2.5-3万',
                "url"  => str_replace('price', '25,30', $url)
            ),
            5 => array(
                "name" => '3万以上',
                "url"  => str_replace('price', '30,', $url)
            ),
        );

        return $menu;
    }

    /**
     * 移动端
     */
    public function touchHouseRoom()
    {
        $param = array(
            'service'  => 'house',
            'template' => 'sale',
            'addrid'   => '',
            'business' => '',
            'subway'   => '',
            'station'  => '',
            'price'    => '',
            'area'     => '',
            'room'     => 'room',
        );
        $url   = getUrlPath($param);

        $menu = array(
            0 => array(
                "name" => '一居',
                "url"  => str_replace('room', '1', $url)
            ),
            1 => array(
                "name" => '二居',
                "url"  => str_replace('room', '2', $url)
            ),
            2 => array(
                "name" => '三居',
                "url"  => str_replace('room', '3', $url)
            ),
            3 => array(
                "name" => '四居',
                "url"  => str_replace('room', '4', $url)
            ),
            4 => array(
                "name" => '五居',
                "url"  => str_replace('room', '5', $url)
            ),
            5 => array(
                "name" => '五居以上',
                "url"  => str_replace('room', '0', $url)
            ),
        );

        return $menu;
    }

    /**
     * 移动端房产首页五个链接
     */
    public function touchHomePageMenu()
    {
        global $cfg_hotline;
        $param = array(
            'service'  => 'house',
            'template' => 'community'
        );
        $url   = getUrlPath($param);

        $config = $this->config();
        $tel    = $config['hotline'] ? $config['hotline'] : $cfg_hotline;

        $menu = array(
            0 => array(
                "name" => '找小区',
                "url"  => $url
            ),
            1 => array(
                "name" => '房产资讯',
                "url"  => str_replace('community', 'news', $url)
            ),
            2 => array(
                "name" => '房贷计算',
                "url"  => str_replace('community', 'calculator-sy', $url)
            ),
            3 => array(
                "name" => '地图找房',
                "url"  => str_replace('community', 'map-loupan', $url)
            ),
            4 => array(
                "name" => '客服电话',
                "tel"  => $tel
            )
        );

        return $menu;
    }

    /**
     * 取每个5分钟
     */
    public static function getTime()
    {
        $time    = time();
        $hour    = date("H");
        $minute  = date("i");
        $minute_ = 0;
        if ($minute > 10) {
            $g       = $minute % 10;
            $minute_ = $minute - $g;
            if ($g >= 5) {
                $minute_ += 5;
            }
        }
        return strtotime(date("Y-m-d {$hour}:{$minute_}"));
    }

    /**
     * 更新缓存
     */
    private static function clearHouseCache($type, $id = 0, $nowstate = 0, $oldstate = 0)
    {
        if ($id) {
            clearCache('house_' . $type . '_detail', $id);

            if ($nowstate == 1 || $oldstate == 1) {
                checkCache('house_' . $type . '_list', $id);
            }
            if ($nowstate != $oldstate && ($nowstate == 1 || $oldstate == 1)) {
                clearCache('house_' . $type . '_total', 'key');
            }
        } else {
            clearCache('house_' . $type . '_total', 'key');
            clearCache('house_' . $type . '_list', 'key');
        }
    }

    public function allhouseFabu()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $page     = $pageSize = "";
        $loginuid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $uid      = $this->param['uid'];
                $gettype  = $this->param['gettype'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];

            }

            if ($uid == "") {
                $uid = $loginuid;
            }

            $where = '';
            if ($gettype == 1) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = $uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $where .= " AND `usertype` = 1 AND `userid` = " . $ret[0]['id'];
                }
            } else {
                $where .= " AND `state` = 1 AND `usertype` = 0 AND `userid` = " . $uid;
            }


            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $archives   = $dsql->SetQuery("SELECT * FROM ( SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,''as type,'zu' moduletype  	FROM `#@__house_zu`  	WHERE 1=1 " . $where . "
											   	UNION ALL SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,''as type,'sale' moduletype  	FROM `#@__house_sale`  WHERE 1=1 " . $where . "
												UNION ALL SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,`type`,'xzl' moduletype  FROM `#@__house_xzl`  	WHERE 1=1 " . $where . "
												UNION ALL SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,`type`,'sp' moduletype  FROM `#@__house_sp`  	WHERE 1=1 " . $where . "
												UNION ALL SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,`type`,'cf' moduletype  FROM `#@__house_cf`  	WHERE 1=1 " . $where . "
												UNION ALL SELECT `id`,`title`,`price` ,`litpic`,`pubdate`,`type`,'cw' moduletype  FROM `#@__house_cw`  	WHERE 1=1 " . $where . "
												)as unall");
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page"       => $page,
                "pageSize"   => $pageSize,
                "totalPage"  => $totalPage,
                "totalCount" => $totalCount
            );

            $atpage = $pageSize * ($page - 1);
            $where  = " ORDER BY `pubdate` DESC LIMIT $atpage, $pageSize";

            $result = $dsql->dsqlOper($archives . $where . $orderby, "results");
            if (!empty($result)) {
                foreach ($result as $key => $value) {

                    $param                    = array(
                        "service"  => "house",
                        "template" => $value['moduletype'] . "-detail",
                        "id"       => $value['id']
                    );
                    $list[$key]['url']        = getUrlPath($param);
                    $list[$key]['title']      = $value['title'];
                    $list[$key]['price']      = $value['price'];
                    $list[$key]['type']       = $value['type'];
                    $list[$key]['litpic']     = getFilePath($value['litpic']);
                    $list[$key]['pubdate']    = $value['pubdate'];
                    $list[$key]['moduletype'] = $value['moduletype'];
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }

    }


    /**
     * 获取指定中介公司下所有的房源汇总
     */
    public function companyAllHouseList()
    {
        global $dsql;
        $param = $this->param;

        $comid = (int)$param['comid'];

        $_param      = array(
            'comid'    => $comid,
            'pageSize' => 5  //最多取5条
        );
        $this->param = $_param;

        //获取二手房数据
        $saleCount = 0;
        $saleList  = array();
        $saleData  = self::saleList();
        if ($saleData['state'] != 200) {
            $saleCount = $saleData['pageInfo']['totalCount'];
            $saleList  = $saleData['list'];
            foreach ($saleList as $key => $value) {
                $saleList[$key]['styleType'] = 'sale';
            }
        }

        //获取租房数据
        $zuCount     = 0;
        $zuList      = array();
        $this->param = $_param;
        $zuData      = self::zuList();
        if ($zuData['state'] != 200) {
            $zuCount = $zuData['pageInfo']['totalCount'];
            $zuList  = $zuData['list'];
            foreach ($zuList as $key => $value) {
                $zuList[$key]['styleType'] = 'zu';
            }
        }

        //获取写字楼数据
        $xzlCount    = 0;
        $xzlList     = array();
        $this->param = $_param;
        $xzlData     = self::xzlList();
        if ($xzlData['state'] != 200) {
            $xzlCount = $xzlData['pageInfo']['totalCount'];
            $xzlList  = $xzlData['list'];
            foreach ($xzlList as $key => $value) {
                $xzlList[$key]['styleType'] = 'xzl';
            }
        }

        //获取商铺数据
        $spCount     = 0;
        $spList      = array();
        $this->param = $_param;
        $spData      = self::spList();
        if ($spData['state'] != 200) {
            $spCount = $spData['pageInfo']['totalCount'];
            $spList  = $spData['list'];
            foreach ($spList as $key => $value) {
                $spList[$key]['styleType'] = 'sp';
            }
        }

        //获取厂房/仓库数据
        $cfCount     = 0;
        $cfList      = array();
        $this->param = $_param;
        $cfData      = self::cfList();
        if ($cfData['state'] != 200) {
            $cfCount = $cfData['pageInfo']['totalCount'];
            $cfList  = $cfData['list'];
            foreach ($cfList as $key => $value) {
                $cfList[$key]['styleType'] = 'cf';
            }
        }

        //获取车位数据
        $cwCount     = 0;
        $cwList      = array();
        $this->param = $_param;
        $cwData      = self::cwList();
        if ($cwData['state'] != 200) {
            $cwCount = $cwData['pageInfo']['totalCount'];
            $cwList  = $cwData['list'];
            foreach ($cwList as $key => $value) {
                $cwList[$key]['styleType'] = 'cw';
            }
        }

        $pageInfo = array(
            'sale' => $saleCount,
            'zu'   => $zuCount,
            'xzl'  => $xzlCount,
            'sp'   => $spCount,
            'cf'   => $cfCount,
            'cw'   => $cwCount
        );

        //数据组合
        $list = array_merge($saleList, $zuList, $xzlList, $spList, $cfList, $cwList);
        $list = array_sort($list, 'pubdate', 'desc');

        //按发布时间排序
        $i       = 0;
        $newList = array();
        foreach ($list as $key => $value) {
            $newList[$i] = $value;
            $i++;
        }

        return array('pageInfo' => $pageInfo, 'list' => $newList);

    }

    /**
     * Notes:个人中心获取数据统计(发布房源数量,收藏房源,关注楼盘,足迹)
     * Ueser: Administrator
     * DateTime: 2020/12/22 9:44
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function membergethousecount()
    {
        global $dsql;
        $param = $this->param;
        if (!empty($param)) {
            if (!is_array($param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $zjusercom = (int)$param['zjusercom'];
            }

            $began = strtotime(date("Y-m-d") . " 00:00");
            $end   = strtotime(date("Y-m-d") . " 23:59");

            /*房源发布数量*/
            $allfbcount = $allbcollect = $todaycollect = 0;
            if ($zjusercom == 0 || $zjusercom == 3) {

                /*二手房*/
                $this->param = array("u" => 1);
                $salecount   = $this->saleList();
                if ($salecount['state'] != 200) {
                    $allfbcount += $salecount['pageInfo']['totalCount'];
                }
                $salallid     = $salecount['state'] != 200 ? array_column($salecount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%sale%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%sale%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

                /*租房*/
                $this->param = array("u" => 1);
                $zucount     = $this->zuList();
                if ($zucount['state'] != 200) {
                    $allfbcount += $zucount['pageInfo']['totalCount'];
                }
                $salallid     = $zucount['state'] != 200 ? array_column($zucount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%zu%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%zu%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

                /*写字楼*/
                $this->param = array("u" => 1);
                $xzlcount    = $this->xzlList();
                if ($xzlcount['state'] != 200) {
                    $allfbcount += $xzlcount['pageInfo']['totalCount'];
                }
                $salallid     = $xzlcount['state'] != 200 ? array_column($xzlcount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%xzl%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%xzl%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

                /*商铺*/
                $this->param = array("u" => 1);
                $spcount     = $this->spList();
                if ($spcount['state'] != 200) {
                    $allfbcount += $spcount['pageInfo']['totalCount'];
                }
                $salallid     = $spcount['state'] != 200 ? array_column($spcount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%sp%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%sp%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

                /*厂房*/
                $this->param = array("u" => 1);
                $cfcount     = $this->cfList();
                if ($cfcount['state'] != 200) {
                    $allfbcount += $cfcount['pageInfo']['totalCount'];
                }
                $salallid     = $cfcount['state'] != 200 ? array_column($cfcount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%cf%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%cf%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

                /*车位*/
                $this->param = array("u" => 1);
                $cwcount     = $this->cwList();
                if ($cwcount['state'] != 200) {
                    $allfbcount += $cwcount['pageInfo']['totalCount'];
                }
                $salallid     = $cwcount['state'] != 200 ? array_column($cwcount['list'], 'id') : '';
                $salallid     = $salallid ? join(',', $salallid) : '';
                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%cw%'");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $allbcollect  += $collectcount;

                $archives     = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE FIND_IN_SET(`aid`,'$salallid') AND `module` = 'house' AND `action` like '%cw%' AND `pubdate` >= $began AND `pubdate` <= $end");
                $collectcount = $dsql->dsqlOper($archives, "totalCount");
                $todaycollect += $collectcount;

            }

            /*收藏房源*/
            global $userLogin;
            $uid      = $userLogin->getMemberID();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `userid` = " . $uid . " AND `module` = 'house'");
            $sccount  = $dsql->dsqlOper($archives, "totalCount");

            /*关注楼盘*/
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_collect` WHERE `userid` = " . $uid . " AND `module` = 'house' AND `action` like '%loupan%'");
            $gzcount  = $dsql->dsqlOper($archives, "totalCount");
            $sccount  -= $gzcount;

            /*客户联系*/
            $began        = strtotime(date("Y-m-d") . " 00:00");
            $end          = strtotime(date("Y-m-d") . " 23:59");
            $sql          = $dsql->SetQuery("SELECT `id` FROM `#@__house_contactlog` WHERE `jzuid` = $uid AND `date` >= $began AND `date` <= $end");
            $contactcount = $dsql->dsqlOper($sql, "totalCount");

            /*客户委托*/
            $this->param = array("iszj" => 1, "backTotal" => 1);
            $khwtcount   = $this->myEntrust();

            /*客户预约*/
            $this->param    = array("spec" => 'in', 'u' => 1, "backTotal" => 1);
            $khyycount      = $this->bookHouseList();
            $housecountinfo = array(
                'allfbcount'   => $allfbcount,     //房源发布数量
                'allbcollect'  => $allbcollect,    //房源被收藏
                'todaycollect' => $todaycollect,    //房源今日被收藏
                'sccount'      => $sccount,        //房源收藏数量
                'gzcount'      => $gzcount,        //关注楼盘
                'contactcount' => $contactcount,   //客户联系
                'khwtcount'    => $khwtcount,
                'khyycount'    => $khyycount,
            );

            return $housecountinfo;

        }

    }

    /**
     * Notes: 更新用户联系经纪人记录
     * Ueser: Administrator
     * DateTime: 2020/12/23 16:37
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function updateContactlog()
    {
        global $dsql;
        global $userLogin;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $param = $this->param;
                $jzuid = $param['jzuid'];
                $aid   = $param['aid'];
                $type  = $param['type'];
                $title = $param['title'];
                $uid   = $userLogin->getMemberID();
                if (($jzuid == '' || $uid < 0) && $jzuid == $uid) {
                    return array("state" => 200, "info" => '格式错误！');
                }
                $date       = time();
                $began      = strtotime(date("Y-m-d") . " 00:00");
                $end        = strtotime(date("Y-m-d") . " 23:59");
                $historysql = $dsql->SetQuery("SELECT `id` FROM `#@__house_contactlog` WHERE `uid` = $uid AND `jzuid` = '$jzuid' AND `type` = '$type' AND `date` >= $began AND `date` <= $end");
                $historyres = $dsql->dsqlOper($historysql, 'results');
                if (empty($historyres)) {
                    $updatesql = $dsql->SetQuery("INSERT INTO `#@__house_contactlog` (`uid`,`jzuid`,`aid`,`type`,`title`,`date`) VALUES ('$uid','$jzuid','$aid','$type','$title','$date')");
                    $res       = $dsql->dsqlOper($updatesql, "update");
                    if ($res == 'ok') return $res;
                } else {
                    return array("state" => 200, "info" => '格式错误！');
                }
            }
        }
    }

    /**
     * Notes: 获取客户联系记录
     * Ueser: Administrator
     * DateTime: 2021/1/5 15:57
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function getContactlog()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $page     = $pageSize = "";
        $uid      = $userLogin->getMemberID();

        if ($uid < 0) {
            return array("state" => 200, "info" => '格式错误！');
        }
        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = " . $uid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) return array("state" => 200, "info" => '格式错误！');
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        $where    = '';
        if ($userResult[0]['id']) {
            $where .= " AND `jzuid` = '" . $uid . "'";
        }
        $archives   = $dsql->SetQuery("SELECT * FROM `#@__house_contactlog` WHERE 1=1" . $where);
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " ORDER BY `date` DESC LIMIT $atpage, $pageSize";
        $result = $dsql->dsqlOper($archives . $where, "results");
        $list   = array();
        if (!empty($result)) {
            foreach ($result as $k => $v) {
                $list[$k]['id']  = $v['id'];
                $list[$k]['uid'] = $v['uid'];

                $uinfo                = $userLogin->getMemberInfo($v['uid']);
                $list[$k]['username'] = $uinfo['nickname'];

                $list[$k]['jzuid'] = $v['jzuid'];
                $list[$k]['aid']   = $v['aid'];
                $list[$k]['type']  = $v['type'];
                $list[$k]['title'] = $v['title'];
                $list[$k]['date']  = $v['date'];
            }

        }
        return array('pageInfo' => $pageinfo, 'list' => $list);
    }




    /**
     * Notes: 楼盘编辑
     * Ueser: Administrator
     * DateTime: 2021/4/23 10:42
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function supplierLoupanEdit()
    {
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = $param['loupanid'];

            $archives = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__houseitem` WHERE `parentid` = 3 ORDER BY `weight` ASC");
            $results = $dsql->dsqlOper($archives, "results");
            $buildtypearr = array();

            if($results && is_array($results)){
                $buildtypearr = array_combine(array_column($results,'id'),array_column($results,'typename'));
            }
            $str =  $peitao = '';

            foreach ($param as $k => $v) {
                if ($k == 'loupanid') {
                    continue;
                }elseif($k == 'protype'){
                    $v = join(',',$v);
                }elseif($k == 'peitao'){
                    foreach ( $v as $a => $b) {
                        if(count($v)-1 == $a){
                            $peitao.= $b[0]."###".$b[1];
                        }else{

                            $peitao.= $b[0]."###".$b[1]."|||";
                        }
                    }

                    $k = 'config';
                    $v = $peitao;
                }elseif($k == 'deliverdate' || $k == 'opendate'){
                    $v = strtotime($v);
                }elseif($k == 'openStart' || $k == 'openEnd'){
                    continue;
                }elseif($k == 'buildage'){
                    $v = (int)$v;
                }

                $str .= "`" . $k . "` = '".$v."',";
            }
            $str = substr($str,0,-1);
//            $hot = (int)$param['hot'];
//            $rec = (int)$param['rec'];
//            $tuan = (int)$param['tuan'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid'  AND `id` = '$loupanid'");
        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');


        //保存到表
//        $archives = $dsql->SetQuery("UPDATE `#@__house_loupan` SET `phone`='$phone', `cityid` = '$cityid', `title` = '$title', `addrid` = '$addrid', `addr` = '$addr', `longitude` = '$longitude', `latitude` = '$latitude', `subway` = '$subway', `litpic` = '$litpic', `bussiness` = '$bussiness', `deliverdate` = '$deliverdate', `opendate` = '$opendate', `price` = '$price', `ptype` = '$ptype', `views` = '$views', `weight` = '$weight',  `salestate` = '$salestate',`investor` = '$investor', `protype` = '$protype', `address` = '$address', `tel` = '$tel', `worktime` = '$worktime', `note` = '$note', `buildtype` = '$buildtype', `zhuangxiu` = '$zhuangxiu', `buildage` = '$buildage', `planarea` = '$planarea', `buildarea` = '$buildarea', `planhouse` = '$planhouse', `linklocal` = '$linklocal', `parknum` = '$parknum', `rongji` = '$rongji', `green` = '$green', `floor` = '$floor', `property` = '$property', `proprice` = '$proprice', `config` = '$config', `pubdate` = '".GetMkTime(time())."', `onsale_hx` = '$onsale_hx', `existing` = '$existing', `banner` = '$banner' WHERE `id` = ".$loupanid);

        if ($str) {

            $archives = $dsql->SetQuery("UPDATE `#@__house_loupan` SET $str WHERE `id` = " . $loupanid);
            $results  = $dsql->dsqlOper($archives, "update");

            if ($results == 'ok') {

                $urlParam = array(
                    'service' => 'house',
                    'template' => 'loupan-detail',
                    'id' => $loupanid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($uid, 'house', 'loupan', $loupanid, 'update', '更新楼盘资料('.$param['title'].')', $url, $archives);

                dataAsync("house",$loupanid,"loupan");
                return '编辑成功！';
            } else {

                return array("state" => 200, "info" => '编辑失败！');
            }
        } else {
            return array("state" => 200, "info" => '编辑失败！');
        }


    }


    /**
     * Notes: 楼盘相册
     * Ueser: Administrator
     * DateTime: 2021/4/23 11:20
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|false|float|int|string
     */
    public function loupanAlbuAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $albumid  = (int)$param['albumid'];
            $dopost   = $param['dopost'];
            $dotopost = $param['dotopost'];
            $action   = $param['actionname'];
            $loupanid = (int)$param['loupanid'];
            $title    = isset($param['title']) ? filterSensitiveWords(addslashes($param['title'])) : '';
            $weight   = (int)$param['weight'];
            $imglist  = $param['imglist'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost == '') return array("state" => 200, "info" => '操作错误！');

        if($dopost == 'add'){

            $archives = $dsql->SetQuery("INSERT INTO `#@__house_album` (`action`, `loupan`, `title`, `weight`, `pubdate`) VALUES ('$action', '$loupanid', '$title', '$weight', '".GetMkTime(time())."')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if(is_numeric($aid)){
                return '创建成功！';
            }else{
                return array("state" => 200, "info" => '创建失败！');
            }

//            //保存图集表
//            $picList = explode(",",$imglist);
//            foreach($picList as $k => $v){
//                $picInfo = explode("|", $v);
//                $pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('albumloupan', '$aid', '$picInfo[0]', '$picInfo[1]')");
//                $dsql->dsqlOper($pics, "update");
//            }
        }elseif($dopost == 'edit'){

            if($dotopost == 'albumedit'){
                /*相册编辑*/
                $archives = $dsql->SetQuery("UPDATE `#@__house_album` SET `title` = '$title' WHERE `id` = ".$albumid);
                $results = $dsql->dsqlOper($archives, "update");

                if($results == 'ok'){
                    return  '编辑成功！';
                }else{
                    return array("state" => 200, "info" => '编辑失败！');
                }
            }elseif($dotopost == 'picedit'){
                //先删除文档所属图集
/*                $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$albumid);
                $dsql->dsqlOper($archives, "update");*/

                //保存图集表
                $picList = strstr($imglist, '||') ? explode("||", $imglist) : explode(',', $imglist);

                $returnarr  = array();
                foreach($picList as $k => $v){
                    if($v !='') {
//                    $picInfo = explode("||", $v);
                        $pics  = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`) VALUES ('albumloupan', '$albumid', '$v')");
//                    var_dump($pics);die;
                        $picid = $dsql->dsqlOper($pics, "lastid");

                        $returnarr[$k]['path']       = $v;
                        $returnarr[$k]['id']         = $picid;
                        $returnarr[$k]['pathsour']   = getFilePath($v);
                    }
                }
                return json_encode($returnarr,true);
            }else{
                /*图片查询*/
                if(!$albumid) array("state" => 200, "info" => '参数错误！');
                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = ".$albumid);
                $results = $dsql->dsqlOper($archives, "results");

                if(!empty($results)){

                    $title     = $results[0]['title'];
                    $weight    = $results[0]['weight'];

                    //图表信息
                    $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$albumid." ORDER BY `id` ASC");
                    $results = $dsql->dsqlOper($archives, "results");

                    if(!empty($results)){
                        $imglist = array();
                        foreach($results as $key => $value){
                            $imglist[$key]["path"] = $value["picPath"];
                            $imglist[$key]["info"] = $value["picInfo"];
                        }
                        $imglist = json_encode($imglist);
                    }else{
                        $imglist = "''";
                    }

                    return $imglist;

                }else{
                    return array("state" => 200, "info" => '相册不存在！');
                }

            }

        }

    }



    /**
     * Notes:  楼盘删除数据相关
     * Ueser: Administrator
     * DateTime: 2021/4/23 13:58
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function loupanDel(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $delid    = $param['delid'];
            $deltype  = (int)$param['deltype'];
            $dopost   = $param['dopost'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost =='' || !$deltype || !$delid) return array("state" => 200, "info" => '参数错误！');


        if($dopost == 'delAlbum'){

            $tab = '';
            if($deltype ==1){
                $tab = 'house_album';
            }elseif($deltype ==2){
                $tab = 'house_360qj';
            }elseif($deltype ==3){
                $tab = 'house_loupanvideo';
            }elseif($deltype ==4){
                $tab = 'house_apartment';
            }elseif($deltype ==5){
                $tab = 'house_loupannews';
            }
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$delid);
            $results = $dsql->dsqlOper($archives, "results");

            if($deltype !=5 && $deltype !=0) {
                //删除缩略图
                delPicFile($results[0]['litpic'], "delThumb", "house");

                if($deltype!=3) {
                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = " . $delid);
                    $results  = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if (!empty($results)) {
                        $atlasPic = "";
                        foreach ($results as $key => $value) {
                            $atlasPic .= $value['picPath'] . ",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic) - 1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = " . $delid);
                    $results  = $dsql->dsqlOper($archives, "update");
                }
            }

            if($tab !='') {

                //删除相册表
                $archives = $dsql->SetQuery("DELETE FROM `#@__" . $tab . "` WHERE FIND_IN_SET (`id`,'$delid')" );
                $results  = $dsql->dsqlOper($archives, "update");

                if($results =='ok'){
                    return '删除成功！';
                }else{
                    return array("state" => 200, "info" => '删除失败！');
                }

            }
        }else{

            if($deltype ==1){

                $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND FIND_IN_SET(`id`,'$delid')");
                $results = $dsql->dsqlOper($archives, "results");

                //删除图片文件
                if(!empty($results)){
                    $atlasPic = "";
                    foreach($results as $key => $value){
                        $atlasPic .= $value['picPath'].",";
                    }
                    delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
                }
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND FIND_IN_SET(`id`,'$delid')");
                $results = $dsql->dsqlOper($archives, "update");

                if($results == 'ok'){
                    return '删除成功！';
                }else{
                    return array("state" => 200, "info" => '删除失败！');
                }
            }

        }
    }


    /**
     * Notes: 楼盘视频添加
     * Ueser: Administrator
     * DateTime: 2021/4/23 14:08
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function loupanVideoAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param = $this->param;

            $loupanid  = (int)$param['loupanid'];
            $aid       = (int)$param['aid'];
            $title     = $param['title'];
            $dopost    = $param['dopost'];
            $dotopost  = $param['dotopost'];
            $litpic    = $param['litpic'];
            $videotype = $param['videotype'];
            $videourl  = $param['videourl'];
            $video     = $param['video'];
            $click     = (int)$param['click'];

        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');
        if($dopost == '' )return array("state" => 200, "info" => '参数错误！');

        if($dopost == 'add'){

            //保存到主表
            $pubdate = GetMkTime(time());
            if($videotype){

            }
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_loupanvideo` (`loupan`, `title`, `litpic`, `videotype`, `videourl`, `click`, `pubdate`) VALUES ('$loupanid', '$title', '$litpic', '$videotype', '$videourl', '$click', '$pubdate')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if(is_numeric($aid)){

                return "新增成功！";
            }else{

                return  array("state" =>200,"info" => '新增失败！');
            }
        }else{

//            if($dotopost == 'dotopost'){

                $archives = $dsql->SetQuery("UPDATE `#@__house_loupanvideo` SET `title` = '$title', `litpic` = '$litpic', `videotype` = '$videotype', `videourl` = '$videourl', `click` = '$click' WHERE `id` = ".$aid);
                $return = $dsql->dsqlOper($archives, "update");

                if($return == 'ok'){

                    return '编辑成功！';
                }else{

                    return  array("state" =>200,"info" => '编辑失败！');
                }

//            }else{
//
//                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupanvideo` WHERE `id` = ".$aid);
//                $results = $dsql->dsqlOper($archives, "results");
//
//                if($results && is_array($results)){
//                    return $results;
//                }else{
//                    return array();
//                }
//
//
//            }

        }

    }


    /**
     * Notes: 楼盘全景
     * Ueser: Administrator
     * DateTime: 2021/4/23 15:19
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|json|string
     */
    public function loupanQjAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param     = $this->param;
            $loupanid  = (int)$param['loupanid'];
            $aid       = $param['aid'];
            $title     = $param['title'];
            $litpic    = $param['litpic'];
            $typeid    = $param['qjtype'];
            $imglist   = $param['imgList'];
            $click     = (int)$param['click'];
            $url       = $param['url'];
            $dopost    = $param['dopost'];
            $dotopost  = $param['dotopost'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost == 'add') {
            $pubdate = GetMkTime(time());

            if($typeid ==0){
                $file = $imglist;
            }else{
                $file = $url;
            }
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_360qj` (`loupan`, `title`, `litpic`, `typeid`, `file`, `click`, `pubdate`) VALUES ('$loupanid', '$title', '$litpic', '$typeid', '$file', '$click', '$pubdate')");
            $return   = $dsql->dsqlOper($archives, "update");

            if ($return == "ok") {
                return '添加成功！';
            } else {

                return array("state" => 200, "info" => '添加失败！');
            }
        }else{
//            if($dotopost == 'dotopost'){

                if(trim($title) == ''){
                    return array("state" => 200, "info" => '标题不能为空！');
                }

                if(trim($litpic) == ''){
                    return array("state" => 200, "info" => '请上传缩略图！');

                }

                if($typeid == 0){
                    $file = $imglist;
                    if(trim($file) == ''){
                        return array("state" => 200, "info" => '请上传全景图片！');
                    }
                }elseif($typeid == 1){
                    $file = $litpic;
                    if(trim($file) == ''){
                        return array("state" => 200, "info" => '请上传全景文件！');
                    }
                }elseif($typeid == 2){
                    if(trim($url) == ''){

                        return array("state" => 200, "info" => '请输入URL地址！');
                    }
                    $file = $url;
                }

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__house_360qj` SET `title` = '$title', `litpic` = '$litpic', `typeid` = '$typeid', `file` = '$file', `click` = '$click' WHERE `id` = ".$aid);
                $return = $dsql->dsqlOper($archives, "update");

                if($return == 'ok'){

                    return '更新成功!';

                }else{

                    return array("state" => 200, "info" => '更新失败！');
                }

//            }else{
//
//                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_360qj` WHERE `id` = ".$aid);
//                $results = $dsql->dsqlOper($archives, "results");
//
//                if($results && is_array($results)){
//                    return $results;
//                }else{
//                    return array();
//                }
//            }
        }

    }


    /**
     * Notes: 楼盘图片全景视频
     * Ueser: Administrator
     * DateTime: 2021/4/23 15:21
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanMangeList(){
        global $dsql;
        global $userLogin;

        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = $this->param['type'];
                $loupanid = $this->param['loupanid'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];

                if($type == '') return array("state" => 200, "info" => '格式错误！');

            }
        }
        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        $pageinfo = $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = ' AND `loupan` = '.$loupanid;
        if($type == 'album'){

            $archives = $dsql->SetQuery("SELECT  `id`,`title`,`loupan` FROM `#@__house_album` WHERE 1=1 AND `action` = 'loupan' " .$where);

        }elseif($type == 'video'){

            $archives = $dsql->SetQuery("SELECT  `id`,`title`,`loupan`,`litpic`,`videotype`,`videourl`,`pubdate` FROM `#@__house_loupanvideo` WHERE 1=1" .$where);

        }elseif($type == 'quanjing'){

            $archives = $dsql->SetQuery("SELECT  `id`,`title`,`loupan`,`litpic`,`pubdate`,`typeid`,`file` FROM `#@__house_360qj` WHERE 1=1" .$where);

        }
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );


        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives  . $where, "results");

        if($results){

            if($type == 'album'){
                foreach ($results as $k => $v){

                    $piclist = array();
                    $list[$k]['title']    = $v['title'];
                    $list[$k]['loupan']   = $v['loupan'];
                    $list[$k]['id']       = $v['id'];

                    $piclistsql = $dsql->SetQuery("SELECT `picPath` FROM  `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = '".$v['id']."'");

                    $piclistres = $dsql->dsqlOper($piclistsql." LIMIT 0,4","results");
                    $list[$k]['countnum'] = $dsql->dsqlOper($piclistsql,"totalCount");

                    if($piclistres && is_array($piclistres)){

                        foreach ($piclistres as $a => $b){

                            if($a <=4){
                                $piclist[$a] = getFilePath($b['picPath']);

                            }

                        }

                    }
                    $list[$k]['piclist'] = $piclist;


                }

            }else{
                $filearr = array();
                foreach ($results as $k => $v){
                    $list[$k]['id']       = $v['id'];
                    $list[$k]['title']    = $v['title'];
                    $list[$k]['loupan']   = $v['loupan'];

                    if($type =='video'){

                        $list[$k]['videourl']       = $v['videourl'];
                        $list[$k]['videourlpath']   = getFilePath($v['videourl']);
                        $list[$k]['videotype']      = $v['videotype'];

                    }
                    if($type =='quanjing'){
                        $list[$k]['typeid']   = $v['typeid'];
                        $list[$k]['file']     = $v['file'];
                        if($v['file'] && $v['typeid'] == 0){
                            $file              = explode(',',$v['file']);

                            foreach ( $file as $a =>$b) {

                                $filearr[$a]['picpath'] = getFilePath($b);
                                $filearr[$a]['path']    = $b;
                            }
                        }
                        $list[$k]['filearr']     = $filearr;


                    }
                    $list[$k]['pubdate']      = date('Y-m-d',$v['pubdate']);
                    $list[$k]['litpic']       = $v['litpic'];
                    $list[$k]['litpicpath']   = getFilePath($v['litpic']);
                }
            }

        }

        return  array('pageInfo'=> $pageinfo,'list'=>$list);

    }


    /**
     * Notes: 樓盤戶型
     * Ueser: Administrator
     * DateTime: 2021/4/23 16:44
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|json|string
     */
    public function apartmentAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param     = $this->param;
            $loupanid  = (int)$param['loupanid'];
            $aid       = $param['aid'];
            $title     = $param['title'];
            $room      = (int)$param['room'];
            $hall      = (int)$param['hall'];
            $guard     = (int)$param['guard'];
            $area      = (int)$param['area'];
            $direction = (int)$param['direction'];
            $high      = $param['high'];
            $note      = $param['note'];
            $weight    = (int)$param['weight'];
            $litpic    = $param['litpic'];
            $imglist   = $param['imglist'];
            $price     = (float)$param['price'];
            $dopost    = $param['dopost'];
            $dotopost  = $param['dotopost'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost == 'add') {
            $pubdate = GetMkTime(time());
            //保存到表
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_apartment` (`action`, `loupan`, `title`, `litpic`, `room`, `hall`, `guard`, `area`, `direction`, `high`, `note`, `weight`, `pubdate`, `price`) VALUES ('loupan', '$loupanid', '$title', '$litpic', '$room', '$hall', '$guard', '$area', '$direction', '$high', '$note', '$weight', '$pubdate', $price)");
            $lastid = $dsql->dsqlOper($archives, "lastid");

            //保存图集表
            $picList = explode(",",$imglist);
            foreach($picList as $k => $v){
                $pics = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`) VALUES ('apartmentloupan', '$lastid', '$v')");
                $dsql->dsqlOper($pics, "update");
            }

            if (is_numeric($lastid)) {
                return '添加成功！';
            } else {

                return array("state" => 200, "info" => '添加失败！');
            }
        }else{
//            if($dotopost == 'edit') {

                //保存到表
                $archives = $dsql->SetQuery("UPDATE `#@__house_apartment` SET `title` = '$title', `litpic` = '$litpic', `room` = '$room', `hall` = '$hall', `guard` = '$guard', `area` = '$area', `direction` = '$direction', `high` = '$high', `note` = '$note', `weight` = '$weight', `price` = $price WHERE `id` = " . $aid);
                $results  = $dsql->dsqlOper($archives, "update");

                //先删除文档所属图集
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = " . $aid);
                $dsql->dsqlOper($archives, "update");

                //保存图集表
                $picList = explode(",", $imglist);
                foreach ($picList as $k => $v) {
                    if($v !=''){

                        $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`) VALUES ('apartmentloupan', '$aid', '$v')");
//                    $pics    = $dsql->SetQuery("INSERT INTO `#@__house_pic` (`type`, `aid`, `picPath`, `picInfo`) VALUES ('apartmentloupan', '$aid', '$picInfo[0]', '$picInfo[1]')");
                        $dsql->dsqlOper($pics, "update");
                    }
                }

                if ($results == 'ok') {

                    return '更新成功!';

                } else {

                    return array("state" => 200, "info" => '更新失败！');
                }
//            }
            /*}else{

                //主表信息
                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = ".$aid);
                $results = $dsql->dsqlOper($archives, "results");

                if(!empty($results)){

                    //图表信息
                    $archives = $dsql->SetQuery("SELECT * FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$aid." ORDER BY `id` ASC");
                    $results = $dsql->dsqlOper($archives, "results");

                    if(!empty($results)){
                        $imglist = array();
                        foreach($results as $key => $value){
                            $imglist[$key]["path"] = $value["picPath"];
                            $imglist[$key]["info"] = $value["picInfo"];
                        }
                        $imglist = json_encode($imglist);
                    }else{
                        $imglist = "''";
                    }

                    $results[0]['imglist'] = $imglist;

                    return $results[0];

                }else{
                    return array("state" => 200, "info" => '要修改的信息不存在或已删除！');
                }
            }*/
        }
    }


    /**
     * Notes: 楼盘户型列表
     * Ueser: Administrator
     * DateTime: 2021/4/23 15:21
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
//    public function apartmentList(){
//        global $dsql;
//        global $userLogin;
//
//        $page = $pageSize = $where = "";
//
//        if (!empty($this->param)) {
//            if (!is_array($this->param)) {
//                return array("state" => 200, "info" => '格式错误！');
//            } else {
//                $type     = $this->param['type'];
//                $loupanid = $this->param['loupanid'];
//                $page     = (int)$this->param['page'];
//                $pageSize = (int)$this->param['pageSize'];
//
//            }
//        }
//        $uid = $userLogin->getMemberID();
//
//        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");
//
//        $res = $dsql->dsqlOper($sql, "results");
//
//        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');
//
//        $pageinfo = $list = array();
//
//        $pageSize = empty($pageSize) ? 10 : $pageSize;
//        $page     = empty($page) ? 1 : $page;
//
//        $where = ' AND `loupan` = '.$loupanid;
//        $archives = $dsql->SetQuery("SELECT  `id`,`title`,`loupan`,`litpic`,`room`,`hall`,`guard`,`pubdate` FROM `#@__house_apartment` WHERE 1=1" .$where);
//        //总条数
//        $totalCount = $dsql->dsqlOper($archives, "totalCount");
//        //总分页数
//        $totalPage = ceil($totalCount / $pageSize);
//
//        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
//
//        $pageinfo = array(
//            "page"       => $page,
//            "pageSize"   => $pageSize,
//            "totalPage"  => $totalPage,
//            "totalCount" => $totalCount
//        );
//
//
//        $atpage = $pageSize * ($page - 1);
//        $where  = " LIMIT $atpage, $pageSize";
//
//        $results = $dsql->dsqlOper($archives  . $where, "results");
//
//        if($results){
//                foreach ($results as $k => $v){
//                    $list[$k]['id']       = $v['id'];
//                    $list[$k]['title']    = $v['title'];
//                    $list[$k]['loupan']   = $v['loupan'];
//                    $list[$k]['litpic']   = $v['litpic'];
//                    $list[$k]['litpicpath']   = getFilePath($v['litpic']);
//                    $list[$k]['room']     = $v['room'];
//                    $list[$k]['hall']     = $v['hall'];
//                    $list[$k]['guard']    = $v['guard'];
//                    $list[$k]['pubdate']  = date('Y-m-d',$v['pubdate']);
//                }
//
//
//        }
//
//        return  array('pageinfo'=> $pageinfo,'list'=>$list);
//
//    }

    /**
     * Notes: 樓盤新增資訊
     * Ueser: Administrator
     * DateTime: 2021/4/23 17:45
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|json|string
     */
    public function loupanNewAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $title    = $param['title'];
            $aid      = $param['aid'];
            $body     = $param['body'];
            $dopost   = $param['dopost'];
            $dotopost = $param['dotopost'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost == 'add') {

            $pubdate  = GetMkTime(time());
            $archives = $dsql->SetQuery("INSERT INTO `#@__house_loupannews` (`loupan`, `title`, `body`, `pubdate`) VALUES ('$loupanid', '$title', '$body', '$pubdate')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if(is_numeric($aid)){
                return '新增成功!';
            }else{

                return array("state" => 200, "info" => '新增失败！');
            }

        }else{
//            if($dotopost == 'dotopost'){
                $archives = $dsql->SetQuery("UPDATE `#@__house_loupannews` SET `title` = '$title', `body` = '$body' WHERE `id` = ".$aid);
                $return   = $dsql->dsqlOper($archives, "update");

                if($return == 'ok'){
                    return '修改成功';
                }else{
                    return array("state" => 200, "info" => '修改失敗！');
                }

//            }else{
//                //主表信息
//                $archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupannews` WHERE `id` = ".$aid);
//                $results = $dsql->dsqlOper($archives, "results");
//
//                if($results && is_array($results)){
//                    return $results;
//                }else{
//                    return array();
//                }
//
//            }
        }



    }


    /**
     * Notes: 沙盘
     * Ueser: Administrator
     * DateTime: 2021/4/23 17:55
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanShapanAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];

            $litpic   = $param['litpic'];
            $data     = $param['data'];
            $dopost   = $param['dopost'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if(empty($loupanid))  return array("state" => 200, "info" => '参数传递失败！');

        if(empty($litpic))  return array("state" => 200, "info" => '请先上传沙盘图片！');

        if(empty($data))  return array("state" => 200, "info" => '请先标注楼栋信息！');

        if($dopost == 'add') {

            $data = serialize(json_decode($data, true));

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_shapan` WHERE `loupan` = $loupanid");
            $ret = $dsql->dsqlOper($sql, "totalCount");
            if($ret == 0){

                $sql = $dsql->SetQuery("INSERT INTO `#@__house_shapan` (`loupan`, `litpic`, `data`) VALUES ('$loupanid', '$litpic', '$data')");
                $ret = $dsql->dsqlOper($sql, "update");

                if($ret == "ok"){

                    return '添加成功！';

                }else{

                    return array("state" => 200, "info" => '操作失败，请联系管理员！');

                }

            }else{

                $sql = $dsql->SetQuery("UPDATE `#@__house_shapan` SET `litpic` = '$litpic', `data` = '$data' WHERE `loupan` = $loupanid");
                $ret = $dsql->dsqlOper($sql, "update");
                if($ret == "ok"){

                    return '更新成功！';

                }else{
                    return array("state" => 200, "info" => '操作失败，请联系管理员！');

                }

            }

        }

    }


    /**
     * Notes: 楼盘顾问添加
     * Ueser: Administrator
     * DateTime: 2021/4/23 18:18
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanGuwenAdd(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];

            $aid   = (int)$param['aid'];
            $name  = trim($param['name']);
            $areaCode = (int)trim($param['areaCode']);
            $phone = (int)trim($param['phone']);
            $photo = $param['photo'];
            $wx    = trim($param['wx']);
            $wxQr  = $param['wxQr'];
            $post  = trim($param['post']);
            $dknum = (int)$param['dknum'];
            $cjnum = (int)$param['cjnum'];
            $dopost = $param['dopost'];
            $ext_title_1 = trim($param['ext_title_1']);
            $ext_val_1 = trim($param['ext_val_1']);
            $ext_title_2 = trim($param['ext_title_2']);
            $ext_val_2 = trim($param['ext_val_2']);
        }

        $uid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT `id`,`userid`,`cityid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");
        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        $gwuserid = $res[0]['userid'];
        $loupanid = $res[0]['id'];
        $cityid   = $res[0]['cityid'];

        //新增顾问
        if($dopost == 'add') {

            $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");
            $res = $dsql->dsqlOper($sql, "results");

            if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');
            $gwuserid = $res[0]['userid'];

            if (empty($name)) return array("state" => 200, "info" => '请填写姓名');
            if (empty($phone)) return array("state" => 200, "info" => '请填写手机号');

            // 验证手机号是否存在
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$phone' || `phone` = '$phone'");
            $ret = $dsql->dsqlOper($sql, "results");

            //不限制手机号码是否已经注册过，如果已经注册过，直接用注册过的用户ID
            if ($ret) {
                // return array("state" => 200, "info" => '该手机号已被注册，请重新填写');
                $uid = $ret[0]['id'];
                $regtime = GetMkTime(time());
            }
            //如果手机号码没有注册过，这里直接新增用户
            else{
                $pswd = '';
                $password  = $userLogin->_getSaltedHash($pswd);
                $regtime   = GetMkTime(time());
                $regip     = GetIP();
                $regipaddr = getIpAddr($regip);
                $regfrom = getCurrentTerminal();

                $sql = $dsql->SetQuery("INSERT INTO `#@__member`
                (`mtype`, `username`, `password`, `areaCode`, `phone`, `nickname`, `photo`, `state`, `purviews`, `regtime`, `regip`, `regipaddr`, `cityid`, `regfrom`)
                VALUES
                (1, '$phone', '$password', '$areaCode', '$phone', '$name', '$photo', 1, '', '$regtime', '$regip', '$regipaddr', '$cityid', '$regfrom')");
                $uid = $dsql->dsqlOper($sql, "lastid");
            }
            
            if (is_numeric($uid)) {
                //保存到主表
                $archives = $dsql->SetQuery("INSERT INTO `#@__house_gw` (`userid`,`cityid`,`wx`,`wxQr`,`post`,`dknum`,`cjnum`,`loupanid`, `state`, `name`, `photo`, `areaCode`, `phone`, `pubdate`, `ext_title_1`, `ext_val_1`, `ext_title_2`, `ext_val_2`) VALUES (  '$uid','$cityid','$wx','$wxQr','$post','$dknum','$cjnum','$loupanid', 1, '$name', '$photo', '$areaCode', '$phone', '$regtime', '$ext_title_1', '$ext_val_1', '$ext_title_2', '$ext_val_2')");
                $gwid     = $dsql->dsqlOper($archives, "lastid");
                if (is_numeric($gwid)) {

                    /*更新楼盘顾问表*/
                    if ($gwuserid != '') {
                        $gwuserid = $gwuserid . ',' . $gwid;
                    }else{
                        $gwuserid = $gwid;
                    }

                    $loupangwsql = $dsql->SetQuery("UPDATE `#@__house_loupan` SET  `userid` = '$gwuserid' WHERE `id` = '$loupanid'");
                    $dsql->dsqlOper($loupangwsql, "results");
                    return "添加成功";
                } else {
                    return array("state" => 200, "info" => '添加失败，请重试！');
                }

            } else {
                return array("state" => 200, "info" => '添加失败，请重试！');
            }
        }

        //修改顾问
        elseif($dopost=='edit'){

            $uidsql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_gw` WHERE `id` = '$aid'");
            $uidres = $dsql->dsqlOper($uidsql,"results");
            if(empty($uidres) && is_array($uidres)) return array("state" => 200, "info" => '未找到该顾问！');

            // $gwu = $uidres[0]['userid'];
            // $updatemsql = $dsql->SetQuery("UPDATE `#@__member` SET `phone` = '$phone',`photo`='$photo' WHERE `id` = '$gwu'");
            // $dsql->dsqlOper($updatemsql,"update");

            $archives = $dsql->SetQuery("UPDATE `#@__house_gw` SET `wx` = '$wx', `wxQr` = '$wxQr', `post` = '$post', `dknum` = '$dknum', `cjnum` = '$cjnum', `name` = '$name', `photo` = '$photo', `areaCode` = '$areaCode', `phone` = '$phone', `ext_title_1` = '$ext_title_1', `ext_val_1` = '$ext_val_1', `ext_title_2` = '$ext_title_2', `ext_val_2` = '$ext_val_2' WHERE `id` = ".$aid);
            $return = $dsql->dsqlOper($archives, "update");

            if($return == 'ok'){
                return '修改成功';
            }else{
                return array("state" => 200, "info" => '修改失敗！');
            }

        }
        
        //删除顾问
        else{
            $loupansql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_gw` WHERE 1=1 AND `id`  = '$aid'");
            $results   = $dsql->dsqlOper($loupansql,"results");

            if (empty($results)) return array("state" => 200, "info" => '未找到该顾问！');

            $gwyuid = (int)$results[0]['userid'];
            $archives = $dsql->SetQuery("DELETE FROM `#@__house_gw` WHERE 1=1 AND `id` = " . $aid);
            $results  = $dsql->dsqlOper($archives, "update");

            // $usersql = $dsql->SetQuery("DELETE FROM `#@__member` WHERE 1=1 AND `id` = " . $gwyuid);
            // $userres = $dsql->dsqlOper($usersql, "update");

            $gwuiarr = $gwuserid !='' ? explode(',',$gwuserid):array();
            $degwid = array_search($aid,$gwuiarr);
            unset($gwuiarr[$degwid]);

            $gwstr = join(',',$gwuiarr);
            $archives = $dsql->SetQuery("UPDATE `#@__house_loupan` SET `userid` = '$gwstr' WHERE `id` = ".$loupanid);
            $dsql->dsqlOper($archives, "update");

            if($results == 'ok'){
                return '删除成功！';
            }else{
                return array("state" => 200, "info" => '删除失败！');
            }

        }

    }


    /**
     * Notes: 顾问列表
     * Ueser: Administrator
     * DateTime: 2021/4/23 18:41
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function loupanGuwenList(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $page     = (int)$this->param['page'];
            $pageSize = (int)$this->param['pageSize'];
        }

        $uid = $userLogin->getMemberID();
        
        // $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");
        // $res = $dsql->dsqlOper($sql, "results");

        // $gwuserid = $res[0]['userid'];

        // if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        $pageinfo = $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        // $where = " AND FIND_IN_SET (g.`id`,'$gwuserid') AND g.`loupanid` = '$loupanid'";
        $where = " AND g.`loupanid` = '$loupanid'";
        $archives = $dsql->SetQuery("SELECT  g.`id`,g.`userid`,g.`name`,g.`areaCode`,g.`phone`,g.`photo`,g.`post`,g.`dknum`,g.`cjnum`,g.`ext_title_1`,g.`ext_val_1`,g.`ext_title_2`,g.`ext_val_2`,m.`photo` mphoto,m.`nickname`,m.`areaCode` mareaCode,m.`phone` mphone FROM `#@__house_gw` g LEFT JOIN `#@__member` m ON g.`userid` = m.`id`WHERE m.`id` IS NOT NULL" .$where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount", 'ASSOC', '', 0);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );


        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives  . $where, "results", 'ASSOC', '', 0);

        if($results){

            foreach ($results as $k => $v){

                $list[$k]['id'] = (int)$v['id'];
                $list[$k]['userid'] = (int)$v['userid'];
                $list[$k]['username'] = $v['name'] ? $v['name'] : $v['nickname'];
                $list[$k]['nickname'] = $v['name'] ? $v['name'] : $v['nickname'];

                $areaCode = (int)$v['areaCode'];
                $areaCode = $areaCode == 0 || $areaCode == 86 ? '' : $areaCode;

                $list[$k]['phone'] = $areaCode . ($v['phone'] ? $v['phone'] : $v['mphone']);

                $list[$k]['showMobile'] = addAreaCodePrefix($areaCode, $v['phone'] ? $v['phone'] : aesDecrypt($v['mphone']));

                $list[$k]['photo'] = getFilePath($v['photo'] ? $v['photo'] : $v['mphoto']);
                $list[$k]['post'] = $v['post'];
                $list[$k]['dknum'] = (int)$v['dknum'];
                $list[$k]['see'] = (int)$v['dknum'];
                $list[$k]['cjnum'] = (int)$v['cjnum'];
                $list[$k]['suc'] = (int)$v['cjnum'];
                $list[$k]['ext_title_1'] = $v['ext_title_1'];
                $list[$k]['ext_val_1'] = $v['ext_val_1'];
                $list[$k]['ext_title_2'] = $v['ext_title_2'];
                $list[$k]['ext_val_2'] = $v['ext_val_2'];

            }

        }

        return array('pageInfo' =>$pageinfo,'list' => $list);
    }


    /**
     * Notes: 楼盘分销报备
     * Ueser: Administrator
     * DateTime: 2021/4/25 17:27
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function loupanFenxiaobb(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];

            $username = $param['username'];
            $usertel  = $param['usertel'];
            $note     = $param['note'];

        }
        $uid = $userLogin->getMemberID();

        $loupansql = $dsql->SetQuery("SELECT `id`,`fenxiaotime`,`fenxiaotitle` FROM `#@__house_loupan` WHERE `state` = 1 AND  `id` = '$loupanid'");

        $loupanres = $dsql->dsqlOper($loupansql, "results");

        if (empty($loupanres)) return array("state" => 200, "info" => '未找到该楼盘！');

        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = " . $uid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) return array("state" => 200, "info" => '您还没有入驻经纪人');


        $yxtime       = $loupanres[0]['fenxiaotime'];

        $zjrid        = $userResult[0]['id'];

        if($yxtime < time())return array("state" => 200, "info" => '已过有效期!暂不可报备！');

        if(empty($loupanid) || empty($username) || empty($usertel)) return array("state" => 200, "info" => '参数错误！');

        $pubdate = GetMkTime(time());
        $sql = $dsql->SetQuery("INSERT INTO `#@__house_fenxiaobb` (`lid`,`username`,`usertel`,`note`,`jzrid`,`yxtime`,`pubdate`) value ('$loupanid','$username','$usertel','$note','$zjrid','$yxtime','$pubdate')");

        $res = $dsql->dsqlOper($sql,"lastid");

        if(is_numeric($res)){
            return '报备成功！';
        }else{
            return  array('state' =>200,'info' => '报备失败！');
        }



    }


    /**
     * Notes: 分销报备更新状态
     * Ueser: Administrator
     * DateTime: 2021/4/29 10:34
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanFenxiaoUpdate(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {

            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $aid      = (int)$param['aid'];
            $state    = (int)$param['state'];

        }

        $uid = $userLogin->getMemberID();

        $loupansql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `state` = 1 AND `id` = '$loupanid'");

        $loupanres = $dsql->dsqlOper($loupansql, "results");

        if (empty($loupanres)) return array("state" => 200, "info" => '未找到该楼盘！');

        $updatesql = $dsql->SetQuery("UPDATE `#@__house_fenxiaobb` SET `state` = '$state' WHERE `id` = '$aid'");

        $updateres = $dsql->dsqlOper($updatesql,"update");

        if($updateres =='ok'){
            return '更新成功';
        }else{
            return  array("state" => 200, "info" => '更新失败！');
        }

    }


    /**
     * Notes: 分销报备列表
     * Ueser: Administrator
     * DateTime: 2021/4/25 17:29
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanFenxiaoList(){

        global $userLogin;
        global $dsql;

        if (!empty($this->param)) {
            $param    = $this->param;

            $state    = $param['state'];
            $manageid = (int)$param['manageid'];
            $do       = $param['do'];
            $orderby  = (int)$param['orderby'];
            $sKeyword = $param['keywords'];
            $pageSize = $param['pageSize'];
            $page     = $param['page'];
        }


        $uid = $userLogin->getMemberID();

        $where1 = '';

        if($manageid ==1){
            /*管理着*/
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' ");

            $res = $dsql->dsqlOper($sql, "results");

            if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

            $loupanid = $res[0]['id'];

            $where = ' AND f.`lid` ='.$loupanid;
        }else{

            /*经纪人*/
            $where = ' AND z.`userid` ='.$uid;
            $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = " . $uid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if (!$userResult) return array("state" => 200, "info" => '您还没有入驻经纪人');

        }


        $pageinfo = $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if ($sKeyword != "") {

            $loupansql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE  `title` like '%$sKeyword%' ");

            $loupanres = $dsql->dsqlOper($loupansql,"results");

            $orstr = '';
            if($loupanres && is_array($loupanres)){
                $louidarr = array_column($loupanres,'id');
                $louid    = join(',',$louidarr);
                $orstr = " or FIND_IN_SET (f.`lid`,'$louid')";

            }
            $where .= " AND (f.`username` like '%$sKeyword%' $orstr)";
        }

        $archives = $dsql->SetQuery("SELECT f.`id`,f.`lid`,f.`username`,f.`usertel`,f.`note`,f.`state`,f.`yxtime`,f.`pubdate`,m.`id` uid,m.`nickname` bbusername,m.`phone` FROM `#@__house_fenxiaobb` f LEFT JOIN `#@__house_zjuser` z ON f.`jzrid` = z.`id` LEFT JOIN `#@__member` m ON z.`userid` = m.`id` WHERE 1=1" .$where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $state0 = $dsql->dsqlOper($archives." AND f.`state` = 0", "totalCount");
        $state1 = $dsql->dsqlOper($archives." AND f.`state` = 1", "totalCount");
        $state2 = $dsql->dsqlOper($archives." AND f.`state` = 2", "totalCount");
        $state3 = $dsql->dsqlOper($archives." AND f.`state` = 3", "totalCount");
        $state4 = $dsql->dsqlOper($archives." AND f.`state` = 4", "totalCount");
        $state5 = $dsql->dsqlOper($archives." AND f.`state` = 5", "totalCount");

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "state0"     => $state0,
            "state1"     => $state1,
            "state2"     => $state2,
            "state3"     => $state3,
            "state4"     => $state4,
            "state5"     => $state5,
        );

        if(isset($state) && $state!=99){
            $where1 = " AND f.`state` = ".$state;
        }

        $orderb = " ORDER BY f.`pubdate` DESC";
        if(!empty($orderby)){
            if($orderby =='1'){
                $orderb = " ORDER BY f.`pubdate` DESC";

            }else{

                $orderb = " ORDER BY f.`pubdate` ASC";
            }
        }


        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where1 . $orderb . $where, "results");

        if($results){

            foreach ($results as $k => $v){

                $list[$k]['username']   = $v['username'];
                $list[$k]['id']         = $v['id'];
                $list[$k]['lid']        = $v['lid'];
                $list[$k]['usertel']    = $v['usertel'];
                $list[$k]['note']       = $v['note'];
                $list[$k]['state']      = $v['state'];
                $list[$k]['yxtime']     = date('Y-m-d H:i:s',$v['yxtime']);

                $uinfo = $userLogin->getMemberInfo($v['uid']);

                $list[$k]['bbusername'] = $uinfo['nickname'];
                $list[$k]['phone']    = $v['phone'];
                $list[$k]['pubdate']    = date('Y-m-d H:i:s', $v['pubdate']);

                $loupansql = $dsql->SetQuery("SELECT `title`,`fenxiaotitle`,`visitConfirmPrintTemplate` FROM`#@__house_loupan` WHERE `id`= '".$v['lid']."'");

                $loupanres = $dsql->dsqlOper($loupansql,"results");
                if($loupanres && is_array($loupanres)){

                    $list[$k]['loupantitle']     = $loupanres[0]['title'];

                    $param = array(
                        'service' => 'house',
                        'template' => 'loupan',
                        'id' => $v['lid']
                    );
                    $list[$k]['loupanurl'] = getUrlPath($param);
                    $list[$k]['fenxiaotitle']    = $loupanres[0]['fenxiaotitle'];

                    //是否配置了打印模板
                    $loupanprint = 0;
                    $visitConfirmPrintTemplate = $loupanres[0]['visitConfirmPrintTemplate'];
                    if($visitConfirmPrintTemplate){
                        $visitConfirmPrintTemplate = unserialize($visitConfirmPrintTemplate);
                        if($visitConfirmPrintTemplate['data']){
                            $loupanprint = 1;
                        }
                    }
                    $list[$k]['loupanprint'] = $loupanprint;
                }
            }

            if ($do == "export" && $manageid ==1) {

                $tit = array();
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报备人'));
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报备时间'));
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '报备客户'));
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '情况说明'));
                array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));

                $folder   = HUONIAOROOT . "/uploads/siteConfig/file/";
                $filePath = $folder . "房产分销报备.csv";
                MkdirAll($folder);
                $file = fopen($filePath, "w");

                //表头
                fputcsv($file, $tit);

                foreach ($list as $data) {
                    switch ($data['state']) {
                        case '0':
                            $state = '待核实';
                            break;
                        case '1':
                            $state = '报备有效';
                            break;
                        case '2':
                            $state = '报备无效';
                            break;
                        case '3':
                            $state = '已成交';
                            break;
                        case '4':
                            $state = '佣金已发放';
                            break;
                        case '5':
                            $state = '已失效';
                            break;
                    }

                    $arr = array();
                    array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['gwusername'] .'(手机：'.$data['gwphone'].')'));
                    array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pubdate'].'/'.$data['yxtime']));
                    array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username'] .'(手机：'.$data['usertel'].')'));
                    array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));
                    array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $state));

                    //写入文件
                    fputcsv($file, $arr);
                }

                header("Content-type:application/octet-stream");
                header("Content-Disposition:attachment;filename = 房产分销报备.csv");
                header("Accept-ranges:bytes");
                header("Accept-length:" . filesize($filePath));
                readfile($filePath);

                return ;
            }
        }

        return  array('pageInfo'=>$pageinfo,'list'=>$list);



    }


    /**
     * Notes: 楼盘合作
     * Ueser: Administrator
     * DateTime: 2021/4/26 10:03
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanCooperation(){
        global $dsql;

        if(is_array($this->param)){
            $param   = $this->param;
            $title   = $param['title'];
            $usename = $param['name'];
            $areaCode = (int)$param['areaCode'];
            $tel     = ($areaCode && $areaCode != 86 ? $areaCode : '') . $param['tel'];
        }
        if(!$title || !$usename || !$tel) return array('state' =>200,'info' => '参数错误！');

        $pubdate = GetMkTime(time());

        $ip       = GetIP();
        $ipaddr   = getIpAddr($ip);
        $sql = $dsql->SetQuery("INSERT INTO `#@__house_coop` (`title`,`usename`,`tel`,`ip`,`ipaddr`,`pubdate`) value ('$title','$usename','$tel','$ip','$ipaddr','$pubdate')");

        $res = $dsql->dsqlOper($sql,'update');

        if($res == 'ok'){
            return '提交成功！';
        }else{
            return  array('state' =>200,'info' => '提交失败！请联系系统管理员！');
        }


    }


    /**
     * Notes: 意向客户
     * Ueser: Administrator
     * DateTime: 2021/4/26 10:31
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function  loupanProspective(){
        global $userLogin;
        global $dsql;

        if (!empty($this->param)) {
            $param     = $this->param;
            $loupanid  = (int)$param['loupanid'];
            $protype   = $param['protype'];
            $sKeyword  = $param['sKeyword'];
            $page      = (int)$this->param['page'];
            $pageSize  = (int)$this->param['pageSize'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        $where = ' WHERE 1=1';
        if($protype){
            $where .= " AND tn.`type` = '$protype'";
        }

        if($sKeyword){
            $where .= " AND tn.`name` like'%$sKeyword%'";
        }

        $archives  = $dsql->SetQuery(" SELECT * FROM (SELECT t.`id`,t.`aid`,t.`sex`,t.`uid`,t.`name`,t.`phone`,t.`state`,t.`pubdate`,'huodong' type, 'loupan' action  FROM `#@__house_loupantuan` t WHERE  t.`aid` = '$loupanid' UNION ALL SELECT n.`id`,n.`aid`,n.`sex`,n.`uid`,n.`name`,n.`phone`,n.`state`,n.`pubdate`,'notice' type, n.`action` type FROM `#@__house_notice` n WHERE n.`action` = 'loupan' AND  n.`aid` = '$loupanid') as tn $where");

        $pageinfo = $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives  . $where, "results");

        if($results){
            foreach ($results as $k => $v){
                $list[$k]['uid']    = $v['uid'];
                $list[$k]['id']     = $v['id'];
                $list[$k]['name']   = $v['name'];
                $list[$k]['phone']  = $v['phone'];
                $list[$k]['state']  = $v['state'];
                $list[$k]['type']   = $v['type'];
                $list[$k]['pubdate'] = $v['pubdate'];
            }

        }
        return array('pageInfo' =>$pageinfo,'list' => $list);

    }


    /**
     * Notes: 意向客户删除更新
     * Ueser: Administrator
     * DateTime: 2021/4/29 10:18
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function loupanProspectiveOperation(){
        global $userLogin;
        global $dsql;

        if (!empty($this->param)) {
            $param    = $this->param;
            $loupanid = (int)$param['loupanid'];
            $aid      = $param['aid'];
            $dopost   = $param['dopost'];
            $state    = $param['state'];
            $optype   = $param['optype'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if(empty($aid)||empty($dopost) || empty($optype)) return array("state" => 200, "info" => '参数错误！');

        $tab = '#@__house_loupantuan';
        if($optype == 'notice'){
            $tab = '#@__house_notice';
        }
        if($dopost =='del') {

            $loupansql = $dsql->SetQuery("SELECT `litpic` FROM `".$tab."` WHERE 1=1 AND `id`  = '$aid'");

            $results = $dsql->dsqlOper($loupansql, "results");

            if (empty($results)) return array("state" => 200, "info" => '未找到该数据！');
            $archives = $dsql->SetQuery("DELETE FROM `".$tab."` WHERE 1=1 AND `id` = " . $aid);
            $results  = $dsql->dsqlOper($archives, "update");

            if($results == 'ok'){
                return '删除成功！';
            }else{
                return array("state" => 200, "info" => '删除失败！');
            }

        }else{

            $updatesql = $dsql->SetQuery("UPDATE `".$tab."` SET `state` = '$state'  WHERE 1=1 AND `id`  = '$aid'");

            $results  = $dsql->dsqlOper($updatesql, "update");

            if($results == 'ok'){
                return '更新成功！';
            }else{
                return array("state" => 200, "info" => '更新失败！');
            }

        }
    }

    /**
     * Notes: 楼盘活动列表
     * Ueser: Administrator
     * DateTime: 2021/4/26 16:26
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanHuodongList(){

        global $userLogin;
        global $dsql;

        if (!empty($this->param)) {
            $param    = $this->param;

            $loupanid = (int)$param['loupanid'];
            $nomanage = (int)$param['nomanage'];
            $gettype  = (int)$param['gettype'];
            $pageSize = $param['pageSize'];
            $page     = $param['page'];
        }

        if($nomanage ==0) {

            $uid = $userLogin->getMemberID();

            $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

            $res = $dsql->dsqlOper($sql, "results");

            if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');
        }

        $pageinfo = $list = array();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = " AND `lid`= '$loupanid'";

        $nowtime =   time();
        if($gettype ==1){
            $where .=" AND `state` = 1 AND `ktime` <= $nowtime AND `etime` > $nowtime";
        }

        $archives = $dsql->SetQuery(" SELECT * FROM `#@__house_huodong` WHERE 1=1" .$where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives  . $where, "results");

        if($results){

            foreach ($results as $k => $v){
                $list[$k]['lid']     = $v['lid'];
                $list[$k]['id']      = $v['id'];
                $list[$k]['title']   = $v['title'];
                $list[$k]['litpic']  = getFilePath($v['litpic']);
                $list[$k]['ktime']   = date('Y-m-d H:i:s', $v['ktime']);
                $list[$k]['etime']   = date('Y-m-d H:i:s', $v['etime']);
                $list[$k]['state']   = $v['state'];
                $list[$k]['pubdate'] = date('Y-m-d H:i:s', $v['pubdate']);


                $countsql = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupantuan` WHERE `hid` = '".$v['id']."'");

                $huodongmember = $dsql->dsqlOper($countsql,"totalCount");

                $list[$k]['huodongmember']   = (int)$huodongmember;


            }

        }
        return  array('pageInfo'=>$pageinfo,'list'=>$list);
    }


    /**
     * Notes: 楼盘活动编辑 -删除
     * Ueser: Administrator
     * DateTime: 2021/4/26 16:56
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function loupanHuodongEdit(){
        global $userLogin;
        global $dsql;

        if (!empty($this->param)) {
            $param    = $this->param;

            $loupanid = (int)$param['loupanid'];
            $aid      = (int)$param['aid'];
            $title    = $param['title'];
            $dopost   = $param['dopost'];
            $litpic   = $param['litpic'];
            $ktime    = $param['ktime'];
            $etime    = $param['etime'];
        }

        $uid = $userLogin->getMemberID();

        $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");

        $res = $dsql->dsqlOper($sql, "results");

        if (empty($res)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');

        if($dopost =='edit' && empty($aid)) return array("state" =>200,"info" => '参数错误!');

        if($dopost == 'del'){

            $loupansql = $dsql->SetQuery("SELECT `litpic` FROM `#@__house_huodong` WHERE 1=1 AND `id`  = '$aid'");


            $results   = $dsql->dsqlOper($loupansql,"results");

            delPicFile($results[0]['litpic'], "delThumb", "house");

            if (empty($results)) return array("state" => 200, "info" => '未找到该活动！');
            $archives = $dsql->SetQuery("DELETE FROM `#@__house_huodong` WHERE 1=1 AND `id` = " . $aid);
            $results  = $dsql->dsqlOper($archives, "update");

            if ($results == 'ok') {

                return '删除成功！';
            } else {
                return array("state" => 200, "info" => '删除失败!');
            }

        }elseif($dopost== 'edit') {
            $ktime = strtotime($ktime);
            $etime = strtotime($etime);
            $updatesql = $dsql->SetQuery("UPDATE `#@__house_huodong` SET `title` = '$title',`litpic` = '$litpic',`ktime` = '$ktime',`etime` = '$etime' WHERE  `id` = '$aid'");

            $results = $dsql->dsqlOper($updatesql, "update");

            if ($results == 'ok') {

                return '编辑成功！';
            } else {
                return array("state" => 200, "info" => '编辑失败!');
            }
        }else{

            $pubdate  = GetMkTime(time());
            $ktime = strtotime($ktime);
            $etime = strtotime($etime);

            $archives = $dsql->SetQuery("INSERT INTO `#@__house_huodong` (`title`, `litpic`, `ktime`, `etime`,`pubdate`,`lid`) VALUES ('$title', '$litpic','$ktime','$etime', '$pubdate','$loupanid')");
            $results      = $dsql->dsqlOper($archives, "update");

            if ($results == 'ok') {

                return '添加成功！';
            } else {
                return array("state" => 200, "info" => '添加失败!');
            }

        }
    }


    /**
     * Notes: 管理者楼盘主页数据统计
     * Ueser: Administrator
     * DateTime: 2021/4/27 10:55
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function loupanStatistics(){
        global $userLogin;
        global $dsql;

        if(!empty($this->param)){

            $param      = $this->param;
            $loupanid   = $param['loupanid'];
            $day        = $param['day'];
        }

        $uid = $userLogin->getMemberID();

        if($uid ==-1) return array("state" => 200, "info" => '格式错误！');

        $sql = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__house_loupan` WHERE `manageuid` = '$uid' AND `id` = '$loupanid'");
        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res) || empty($loupanid)) return array("state" => 200, "info" => '未找到该用户管理楼盘！');
        $day = !$day ? 7 : $day ;
        $now  = strtotime(date("Y-m-d",time()));
        $agentime = strtotime('-'.$day.' days');

        $whereclick = " AND `date` >= '$agentime' AND `date` <= '$now'";
        $Statisticsarr = $clickarr = $yxarr = array();

        for($start = $now; $start >= $agentime; $start -= 24 * 3600) {
            $time1 = $start;
            $time2 = $start + 86400;

            $clicksql  = $dsql->SetQuery("SELECT `id` FROM `#@__house_historyclick` WHERE `module` = 'house' AND `module2` = 'loupanDetail' AND `aid` = '$loupanid' AND `date` >= $time1 AND `date` < $time2");
            $clickcount = $dsql->dsqlOper($clicksql,"totalCount");
            array_push($clickarr,(int)$clickcount);

            $yxsql  = $dsql->SetQuery(" SELECT * FROM (SELECT  t.`pubdate` FROM `#@__house_loupantuan` t WHERE  t.`aid` = '$loupanid' UNION ALL SELECT  n.`pubdate` FROM `#@__house_notice` n WHERE n.`action` = 'loupan' AND  n.`aid` = '$loupanid') as tn WHERE tn.`pubdate` >= '$agentime' AND tn.`pubdate` <= '$now'");
            $yxcount = $dsql->dsqlOper($yxsql,"totalCount", 'ASSOC', NULL, 0);
            array_push($yxarr,(int)$yxcount);

        }
        $Statisticsarr['clickarr']  = $clickarr;
        $Statisticsarr['yxarr']     = $yxarr;

        return $Statisticsarr;

    }

    /**
     * 房产浏览记录
     */
    public function getRecord()
    {
        global $dsql;
        global $userLogin;

        $type = $page = $pageSize = $where = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type = (int)$this->param['type'];
                $page = (int)$this->param['page'] ? (int)$this->param['page'] : 1;
                $pageSize = (int)$this->param['pageSize'] ? (int)$this->param['pageSize'] : 10;
            }
        }
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if ($type == 1) { // 楼盘记录
            $where .= " AND h.`module2` = 'loupanDetail' AND h.`del` = 0 ORDER BY h.`date` DESC";
            $arc = $dsql->SetQuery("SELECT h.*, m.`phone`, m.`nickname` FROM `#@__house_historyclick` h LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE m.`id` IS NOT NULL" . $where . "");
            $totalCount = $dsql->dsqlOper($arc, "totalCount");
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);
            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page" => $page,
                "pageSize" => $pageSize,
                "totalPage" => $totalPage,
                "totalCount" => $totalCount
            );

            $atpage = $pageSize * ($page - 1);
            $where = " LIMIT $atpage, $pageSize";
            $results = $dsql->dsqlOper($arc . $where, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['id'] = $val['id'];
                    $list[$key]['date'] = date('Y-m-d H:i:s', $val['date']);
                    $list[$key]['status'] = $val['status'];
                    $list[$key]['phone'] = $val['phone'];
                    $list[$key]['username'] = $val['nickname'];
                    $param = array(
                        "service" => "house",
                        "template" => "loupan-detail",
                        "id" => $val['id']
                    );
                    $list[$key]['url'] = getUrlPath($param);
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }
        if ($type == 2) {  // 经纪人记录
            $where .= " AND k.`fuid` = '$uid' AND k.`del` = 0 ";
            $orderby_ = " ORDER BY k.`date` DESC";
            $arc = $dsql->SetQuery("SELECT k.*, u.`id` zjuser, m.`nickname`, m.`phone` FROM `#@__house_historyclick` k LEFT JOIN `#@__house_zjuser` u  ON k.`fuid` = u.`userid` LEFT JOIN `#@__member` m ON m.`id` = k.`uid` WHERE m.`id` IS NOT NULL AND k.`fuid`= u.`userid`" . $where . "");
            $totalCount = $dsql->dsqlOper($arc, "totalCount");
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);
            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page" => $page,
                "pageSize" => $pageSize,
                "totalPage" => $totalPage,
                "totalCount" => $totalCount
            );

            $atpage = $pageSize * ($page - 1);
            $where = " LIMIT $atpage, $pageSize";
            $results = $dsql->dsqlOper($arc . $orderby_ . $where, "results");
            if ($results) {
                $kk = 0;
                foreach ($results as $key => $val) {
                    $result = substr($val['module2'], 0, strripos($val['module2'], "D"));
                    $arc = $dsql->SetQuery("SELECT `id`,`title`,`litpic` FROM `#@__house_$result` WHERE `id` = " . $val['aid']);
                    $jil = $dsql->dsqlOper($arc, "results");
                    if ($jil) {
                        $list[$kk]["litpic"] = getFilePath($jil[0]['litpic']);
                        $list[$kk]['title'] = $jil[0]['title'];
                        $list[$kk]['phone'] = $val['phone'];
                        $list[$kk]['username'] = $val['nickname'];

                        $qianzhui = $result;
                        $temp = $qianzhui . '-' . 'detail';
                        $param = array(
                            "service" => "house",
                            "template" => $temp,
                            "id" => $jil[0]['id']
                        );
                        $list[$kk]['url'] = getUrlPath($param);
                        $list[$kk]['id'] = $val['id'];
                        $list[$kk]['status'] = $val['status'];
                        $list[$kk]['date'] = date('Y-m-d H:i', $val['date']);
                        $kk++;
                    }else{
                        $arc = $dsql->SetQuery("DELETE FROM `#@__house_historyclick` WHERE `aid` = " . $val['aid']);
                        $dsql->dsqlOper($arc, "update");
                    }

                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);

        }

        if ($type == 3) { // 房产中介记录
            //验证会员类型
            $userDetail = $userLogin->getMemberInfo();
            if ($userDetail['userType'] != 2) {
                return array("state" => 200, "info" => '账号验证错误，请先入驻商家！');
            }

            if (!verifyModuleAuth(array("module" => "house"))) {
                return array("state" => 200, "info" => '商家权限验证失败！');
            }
            $where .= " AND z.`userid` = '$uid'  AND k.`del` = 0   ";
            $orderby_ = " ORDER BY k.`date` DESC";
            $arc = $dsql->SetQuery("SELECT  z.`id` zid, u.`id` userid ,u.`userid` uuid,k.`id` kid,k.`status`,k.`module2`,k.`uid`,k.`date`,k.`aid`, m.`nickname`, m.`phone`  FROM `#@__house_historyclick` k
                    LEFT JOIN `#@__house_zjuser` u ON u.`userid` = k.`fuid`
                    LEFT JOIN `#@__house_zjcom` z ON z.`id` = u.`zjcom`
                    LEFT JOIN `#@__member` m ON m.`id` = k.`uid`
                    WHERE m.`id` IS NOT NULL " . $where . "");
            $totalCount = $dsql->dsqlOper($arc, "totalCount");
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);
            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            $pageinfo = array(
                "page" => $page,
                "pageSize" => $pageSize,
                "totalPage" => $totalPage,
                "totalCount" => $totalCount
            );

            $atpage = $pageSize * ($page - 1);
            $where = " LIMIT $atpage, $pageSize";
            $results = $dsql->dsqlOper($arc . $orderby_ . $where, "results");
            if ($results) {
                $kk = 0;
                foreach ($results as $key => $val) {
                    $result = substr($val['module2'], 0, strripos($val['module2'], "D"));
                    $aid = $val['aid'];
                    $arc = $dsql->SetQuery("SELECT `id`,`title`,`username`,`contact` FROM `#@__house_$result` WHERE `id` =  $aid AND `usertype` =1");
                    $jil = $dsql->dsqlOper($arc, "results");
                    if ($jil) {
                        $list[$kk]['username'] = $val['nickname'];
                        $list[$kk]['phone'] = $val['phone'];
                        $getname = $userLogin->getMemberInfo($val['uuid']);
                        $list[$kk]['jjusername'] = $getname['nickname'];
                        $list[$kk]['title'] = $jil[0]['title'];
                        $list[$kk]['id'] = $val['kid'];
                        $list[$kk]['date'] = date('Y-m-d H:i', $val['date']);
                        $list[$kk]['status'] = $val['status'];
                        $qianzhui = $result;
                        $temp = $qianzhui . '-' . 'detail';
                        $param = array(
                            "service" => "house",
                            "template" => $temp,
                            "id" => $jil[0]['id']
                        );
                        $list[$kk]['url'] = getUrlPath($param);
                        $kk++;
                    }else{
                        $arc = $dsql->SetQuery("DELETE * FROM `#@__house_historyclick` WHERE `aid` = " . $aid);
                        $dsql->dsqlOper($arc, "update");
                    }
                }
            }

            return array("pageInfo" => $pageinfo, "list" => $list);

        }


    }

    /**
     * 更新状态
     * del ->删除浏览记录
     * update->更新状态
     */
    public function updateHistory(){
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $param     = $this->param;
            $historyid  = (int)$param['id'];
            $status       = $param['status'];
            $type  = $param['type'];
            $userid = $userLogin->getMemberID();

            if ($userid == -1) {
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }

        }

        if ($type =='update'){
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__house_historyclick` SET `status` = '$status' WHERE `id` = ".$historyid);
            $return = $dsql->dsqlOper($archives, "update");
            if($return == 'ok'){
                return '更新成功!';
            }else{
                return array("state" => 200, "info" => '更新失败！');
            }
        }elseif($type =='del'){
            //保存到主表
            $sql = $dsql->SetQuery("UPDATE `#@__house_historyclick` SET `del` = '1' WHERE `id` = ".$historyid);
            $return = $dsql->dsqlOper($sql, "update");
            if($return == 'ok'){
                return '删除成功!';
            }else{
                return array("state" => 200, "info" => '删除失败！');
            }
        }

    }


    //生成经纪人免费套餐的序列化字段
    public function getFreeMeal(){
        //读取经纪人免费套餐配置
        $config = $this->config();
        $trialFree = $config['zjuserPriceFree'];
        if ($trialFree == null || !is_array($trialFree)) {
            return '';
        }

        $nowTime = GetMktime(time());
        $expired = $nowTime + 86400*365*999; //过期时间设置为很长
        $meal = array(
            "name"    => '经纪人免费套餐',
            "type"    => 0,
            "item"    => 0,
            "began"   => (int)$nowTime,
            "expired" => (int)$expired,
            "house"   => (int)$trialFree['house'],
            "refresh" => (int)$trialFree['refresh'],
            "settop"  => (int)$trialFree['settop'],
        );
        $meal = serialize($meal);
        return $meal;
    }




}
