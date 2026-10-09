<?php
if (!defined('HUONIAOINC')) {
    exit('Request Error!');
}

/**
 * 外卖模块API接口
 *
 * @version        $Id: waimai.class.php 2014-10-24 下午14:29:56 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class waimai
{
    private $param;  //参数

    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array ())
    {
        $this->param = $param;

        require(HUONIAOROOT."/api/handlers/waimai.config.php");
    }

    /**
     * 自助建站基本参数
     *
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/waimai.inc.php");

        global $cfg_fileUrl;              //系统附件默认地址
        global $cfg_uploadDir;            //系统附件默认上传目录
        // global $customFtp;                //是否自定义FTP
        // global $custom_ftpState;          //FTP是否开启
        // global $custom_ftpUrl;            //远程附件地址
        // global $custom_ftpDir;            //FTP上传目
        // global $custom_uploadDir;         //默认上传目录
        global $cfg_basehost;             //系统主域名
        global $cfg_hotline;              //系统默认咨询热线

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
        // global $customTemplate;           //模板风格
        // global $custom_map;               //自定义地图

        global $cfg_map;                  //系统默认地图

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

        if (empty($custom_map)) {
            $custom_map = $cfg_map;
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

        // $domainInfo = getDomain('waimai', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('waimai', $customSubDomain);

        //分站自定义配置
        $ser = 'waimai';
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

        $return = array ();
        if (!empty($params) > 0) {

            foreach ($params as $key => $param) {
                if ($param == "channelName") {
                    $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
                } else {
                    if ($param == "logoUrl") {

                        //自定义LOGO
                        if ($customLogo == 1) {
                            $customLogo = getAttachemntFile($customLogoUrl);
                        } else {
                            $customLogo = getAttachemntFile($cfg_weblogo);
                        }

                        $return['logoUrl'] = $customLogo;
                    } else {
                        if ($param == "subDomain") {
                            $return['subDomain'] = $customSubDomain;
                        } else {
                            if ($param == "channelDomain") {
                                $return['channelDomain'] = $customChannelDomain;
                            } else {
                                if ($param == "channelSwitch") {
                                    $return['channelSwitch'] = $customChannelSwitch;
                                } else {
                                    if ($param == "closeCause") {
                                        $return['closeCause'] = $customCloseCause;
                                    } else {
                                        if ($param == "title") {
                                            $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
                                        } else {
                                            if ($param == "keywords") {
                                                $return['keywords'] = str_replace('$city', $cityName,
                                                    $customSeoKeyword);
                                            } else {
                                                if ($param == "description") {
                                                    $return['description'] = str_replace('$city', $cityName,
                                                        $customSeoDescription);
                                                } else {
                                                    if ($param == "hotline") {
                                                        $return['hotline'] = $hotline;
                                                    } else {
                                                        if ($param == "template") {
                                                            $return['template'] = $customTemplate;
                                                        } else {
                                                            if ($param == "touchTemplate") {
                                                                $return['touchTemplate'] = $customTouchTemplate;
                                                            } else {
                                                                if ($param == "map") {
                                                                    $return['map'] = $custom_map;
                                                                } else {
                                                                    if ($param == "softSize") {
                                                                        $return['softSize'] = $custom_softSize;
                                                                    } else {
                                                                        if ($param == "softType") {
                                                                            $return['softType'] = $custom_softType;
                                                                        } else {
                                                                            if ($param == "thumbSize") {
                                                                                $return['thumbSize'] = $custom_thumbSize;
                                                                            } else {
                                                                                if ($param == "thumbType") {
                                                                                    $return['thumbType'] = $custom_thumbType;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
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
            $return['subDomain']     = $customSubDomain;
            $return['channelDomain'] = $customChannelDomain;
            $return['channelSwitch'] = $customChannelSwitch;
            $return['closeCause']    = $customCloseCause;
            $return['title']         = str_replace('$city', $cityName, $customSeoTitle);
            $return['keywords']      = str_replace('$city', $cityName, $customSeoKeyword);
            $return['description']   = str_replace('$city', $cityName, $customSeoDescription);
            $return['hotline']       = $hotline;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['map']           = $custom_map;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['saleState']     = $customSaleState;
            $return['saleTitle']     = $customSaleTitle;
            $return['saleSubTitle']  = $customSaleSubTitle;
        }

        return $return;

    }


    /**
     * 店铺分类
     *
     * @return array
     */
    public function shopType()
    {
        global $dsql;

        $list = array ();

        //导航需要显示跑腿链接
        if ($this->param['nav']) {
            $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` ORDER BY `sort` DESC, `id` DESC");
        } else {
            $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop_type` WHERE `paotui` = 0 ORDER BY `sort` DESC, `id` DESC");
        }
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            foreach ($results as $key => $value) {
                $paotui = (int)$value['paotui'];
                $list[$key]['id']       = $value['id'];
                $list[$key]['title']    = $value['title'];
                $list[$key]['paotui']   = $paotui;
                $list[$key]['index_show']   = (int)$value['index_show'];
                $list[$key]['icon']     = $value['icon'];
                $list[$key]['iconturl'] = $value['icon'] ? getFilePath($value['icon']) : "";

                if($paotui){
                    $param = array (
                        "service"  => "waimai",
                        "template" => "paotui"
                    );
                }else{
                    $param = array (
                        "service"  => "waimai",
                        "template" => "list",
                        "param"    => "typeid=" . $value['id']
                    );
                }
                $url = getUrlPath($param);
                $list[$key]['url'] = $url;
            }
        }

        return $list;
    }

    /**
     * 店铺列表
     */
    public function shopList()
    {
        global $dsql;
        global $langData;

        $ids = $typeid = $orderby = $yingye = $lng = $lat = $keywords = $recBrand = $where = $page = $pageSize = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $u       = $this->param['u'];
                $ids     = $this->param['ids'];
                $typeid  = (int)$this->param['typeid'];
                $orderby = (int)$this->param['orderby'];  //0：默认  1：距离  2：销量  3：起送价  4：评论数量  5：评分  6：配送时间

                $fullHui  = (int)$this->param['fullHui'];//满减
                $freePei  = (int)$this->param['freePei'];//免配送
                $firstDel = (int)$this->param['firstDel'];//首单立减
                $timeZhe  = (int)$this->param['timeZhe'];//限时折扣

                $youhui = (int)$this->param['youhui'];//优惠商家

                $yingye   = $this->param['yingye'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $keywords = $this->param['keywords'];
                $recBrand = $this->param['recBrand'];
                $filter   = $this->param['filter'];  //筛选条件
                $deliver  = (int)$this->param['deliver'];  //配送方式  0：默认  1：平台  2：商家  3：自取
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];

                $platform_name = $this->param['platform_name'];
            }
        }

        //微信小程序请求需要转换坐标
        if($platform_name == 'wx_miniprogram' && $lng && $lat){
            $gpsTransfrom = new gpsTransform();
            $lnglat = $gpsTransfrom->gcj02Tobd09($lng, $lat);
            $lng = $lnglat[0];
            $lat = $lnglat[1];
        }

        if (!empty($keywords)) {
            $where = " AND s.`status` = 1 AND s.`del` = 0 AND f.`status` = 1 AND f.`del` = 0";
        } else {
            $where = " AND s.`status` = 1 AND s.`del` = 0";
        }

        //数据共享
        require(HUONIAOINC . "/config/waimai.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND s.`cityid` = " . $cityid;
            }
        }

        //指定店铺
        if (!empty($ids)) {
            $where .= " AND s.`id` in ($ids)";

            $page     = 1;
            $pageSize = 9999;

        } else {

            //分类
            if (!empty($typeid)) {
                $reg = "(^$typeid$|^$typeid,|,$typeid,|,$typeid)";
                // $where .= " AND s.`typeid` REGEXP '" . $reg . "' ";
                $where .= " AND FIND_IN_SET('" . $typeid . "',s.`typeid`)";
            }

            //营业状态
            if (!empty($yingye)) {
                $where .= "
                AND (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`)))
                AND (
                (CONVERT(s.`start_time1`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time1`, TIME) >= CONVERT(now(), TIME))
                OR (CONVERT(s.`start_time2`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time2`, TIME) >= CONVERT(now(), TIME))
                OR (CONVERT(s.`start_time3`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time3`, TIME) >= CONVERT(now(), TIME))
                )";
            }

            //关键字
            if (!empty($keywords)) {
                $where .= " AND (s.`shopname` like '%$keywords%' OR f.`title` like '%$keywords%')";
            }

            //精选品牌
            if ($recBrand) {
                $where .= " AND s.`rec_brand` = 1";
            }

        }

         //优惠商家
        if($youhui == 1){
            $where .= " AND (s.`is_first_discount`=1 OR s.`is_vipdiscount`=1 OR s.`open_promotion`=1)";
        }


        //满减等筛选$fullHui $freePei $firstDel $timeZhe
        if ($fullHui == 1) {
            $where .= " AND s.`open_promotion`=1";
        }
        if ($freePei == 1) {
            $where .= " AND s.`delivery_fee` <= 0 ";
        }
        if ($firstDel == 1) {
            $where .= " AND s.`is_first_discount`=1";
        }
        // if ($timeZhe ==1) {
        //     $where .=" AND s.`is_discount`=1";
        // }

        //筛选2.0
        //首单立减：sdlj、免配送费：mpsf、折扣优惠：zkyh、准时达：zsd、品牌商家：ppsj、货到付款：hdfk、0元起送：lyqs、下单返券：xdfq
        if(isset($filter)){

            $filterArr = explode(';', $filter);
            
            //首单立减
            if(in_array('sdlj', $filterArr)){
                $where .= " AND s.`is_first_discount` = 1";
            }

            //免配送费
            if(in_array('mpsf', $filterArr)){
                $where .= " AND s.`delivery_fee_mode` = 1 AND s.`delivery_fee` = 0";  //此处需要优化，目前只调用了固定配送费模式的，后期可以将最终的配送费新建个字段存在表里，每当更新店铺信息时，同时计算出来配送费的最低金额
            }

            //折扣优惠
            if(in_array('zkyh', $filterArr)){
                $where .= " AND s.`open_promotion` = 1";  //目前只有满减活动
            }

            //准时达
            if(in_array('zsd', $filterArr)){
                $where .= " AND s.`open_zsb` = 1";  //准时宝
            }

            //品牌商家
            if(in_array('ppsj', $filterArr)){
                $where .= " AND s.`rec_brand` = 1";
            }

            //货到付款
            if(in_array('hdfk', $filterArr)){
                $where .= " AND s.`paytype` = '1'";
            }

            //0元起送
            if(in_array('lyqs', $filterArr)){
                $where .= " AND s.`basicprice_min` = 0";
            }

            //下单返券
            if(in_array('xdfq', $filterArr)){
                $where .= " AND s.`open_fullcoupon` = 1";
            }

        }

        //配送方式
        if($deliver){

            //平台
            if($deliver == 1){
                $where .= " AND s.`merchant_deliver` = 0";

            //商家
            }elseif($deliver == 2){
                $where .= " AND s.`merchant_deliver` = 1";

            //自取
            }elseif($deliver == 3){
                $where .= " AND s.`selftake` = 0";
            }

        }


        $juli = "";
        if ($lng && $lat) {
            $juli = ", ROUND(
                6378.138 * 2 * ASIN(
                    SQRT(POW(SIN(($lat * PI() / 180 - s.`coordX` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(s.`coordX` * PI() / 180) * POW(SIN(($lng * PI() / 180 - s.`coordY` * PI() / 180) / 2), 2))
                ) * 1000
            ) AS juli";

            //筛选10KM范围内的店铺
            $where .= " AND ROUND(
                6378.138 * 2 * ASIN(
                    SQRT(POW(SIN(($lat * PI() / 180 - s.`coordX` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(s.`coordX` * PI() / 180) * POW(SIN(($lng * PI() / 180 - s.`coordY` * PI() / 180) / 2), 2))
                ) * 1000
            ) < 100000";
        }


        // $order = " ORDER BY `yingye` DESC, s.`sort` DESC, s.`id` DESC";
        //默认排序：下单状态、营业状态、是否支持预定、自定义序号
        $order  = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, s.`sort` DESC, s.`id` DESC";
        $common = "";

        //按距离
        if($orderby == 1 && $lng && $lat) {
            $order = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, `juli` ASC, s.`sort` DESC, s.`id` DESC";

        //按销量
        }elseif($orderby == 2) {
            $order = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, s.`sale` DESC, s.`sort` DESC, s.`id` DESC";

        //起送价
        }elseif($orderby == 3){
            $order = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, s.`basicprice_min` ASC, s.`sort` DESC, s.`id` DESC";
        
        //评论数量
        }elseif($orderby == 4){
            $order  = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, `common` DESC";
            $common = ", (SELECT count(c.`id`) FROM `#@__waimai_common` c WHERE c.`sid` = s.`id`) AS common";

        //评分
        }elseif($orderby == 5){
            $order = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, s.`star` DESC, s.`sort` DESC, s.`id` DESC";

        //配送时长
        }elseif($orderby == 6){
            $order  = " ORDER BY `ordervalid` DESC, `yingye` DESC, CASE WHEN `yingye` = 0 THEN s.`reservestatus` ELSE `yingye` END DESC, s.`delivery_time` ASC, s.`id` DESC";
        }


        if (empty($keywords)) {

            $countSql = $dsql->SetQuery("SELECT count(s.`id`) totalCount FROM `#@__waimai_shop` s WHERE 1 = 1" . $where);

            $sql = $dsql->SetQuery("SELECT
                s.`id`, s.`shopname`, s.`typeid`, s.`category`, s.`description`, s.`ordervalid`, s.`weeks`,s.`open_fullcoupon`, s.`start_time1`, s.`end_time1`, s.`start_time2`, s.`end_time2`, s.`start_time3`, s.`end_time3`, s.`basicprice`, s.`delivery_fee`, s.`linktype`, s.`show_delivery_service`, s.`delivery_service`, s.`delivery_time`, s.`is_first_discount`, s.`first_discount`, s.`is_vipdiscount`, s.`vipdiscount_value`, s.`open_promotion`, s.`promotions`, s.`shop_banner`, s.`delivery_fee_mode`,s.`rec_brand`, s.`service_area_data`, s.`range_delivery_fee_value`,
                CASE WHEN(
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time1`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time1`, TIME) >= CONVERT(now(), TIME))
                    )
                    OR
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time2`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time2`, TIME) >= CONVERT(now(), TIME))
                    )
                    OR
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time3`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time3`, TIME) >= CONVERT(now(), TIME))
                    )
                )THEN 1 ELSE 0 END AS yingye, s.`sale`, s.`star`, s.`reservestatus`
                " . $juli . "
                " . $common . "
                FROM `#@__waimai_shop` s
                WHERE 1 = 1" . $where . $order);


        } else {

            $countSql = $dsql->SetQuery("SELECT count(s.`id`) totalCount FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_list` f ON f.`sid` = s.`id`
            WHERE 1 = 1" . $where . " GROUP BY s.`id`");

            $sql = $dsql->SetQuery("SELECT
                s.`id`, s.`shopname`, s.`typeid`, s.`category`, s.`description`, s.`ordervalid`, s.`weeks`,s.`open_fullcoupon`, s.`start_time1`, s.`end_time1`, s.`start_time2`, s.`end_time2`, s.`start_time3`, s.`end_time3`, s.`basicprice`, s.`delivery_fee`, s.`linktype`, s.`show_delivery_service`, s.`delivery_service`, s.`delivery_time`, s.`is_first_discount`, s.`first_discount`, s.`is_vipdiscount`, s.`vipdiscount_value`, s.`open_promotion`, s.`promotions`, s.`shop_banner`, s.`delivery_fee_mode`, s.`rec_brand`,s.`service_area_data`, s.`range_delivery_fee_value`,
                CASE WHEN(
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time1`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time1`, TIME) >= CONVERT(now(), TIME))
                    )
                    OR
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time2`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time2`, TIME) >= CONVERT(now(), TIME))
                    )
                    OR
                    (
                        (FIND_IN_SET(DAYOFWEEK(now()) - 1, s.`weeks`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, s.`weeks`))) AND (CONVERT(s.`start_time3`, TIME) <= CONVERT(now(), TIME) AND CONVERT(s.`end_time3`, TIME) >= CONVERT(now(), TIME))
                    )
                )THEN 1 ELSE 0 END AS yingye, s.`sale`, s.`star`, s.`reservestatus`
                " . $juli . "
                " . $common . "
                FROM `#@__waimai_shop` s LEFT JOIN `#@__waimai_list` f ON f.`sid` = s.`id`
                WHERE 1 = 1" . $where . " GROUP BY s.`id`" . $order);
        }

        // echo $sql;die;

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        //总条数-没数据有警告信息改用getOne方法
        // $totalCount = $dsql->dsqlOper($countSql, "results");
        // $totalCount = $totalCount[0]['totalCount'];
        $totalCount =  (int)$dsql->getOne($countSql);
        //总分页数
        $totalPage = ceil((int)$totalCount / (int)$pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $where = "";
        if (empty($ids)) {
            $atpage = $pageSize * ($page - 1);
            $where  = " LIMIT $atpage, $pageSize";
        }

        $ret = $dsql->dsqlOper($sql . $where, "results");

        $list = array ();

        $short = echoCurrency(array ("type" => "short"));

        foreach ($ret as $key => $value) {
            $list[$key]['id']       = $value['id'];
            $list[$key]['shopname'] = $value['shopname'];  //店铺名称

            $_typeid = convertArrToStrWithComma($value['typeid'], 1);
            $list[$key]['typeid']   = $_typeid;  //分类ID

            if ($_typeid) {
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_shop_type` WHERE `id` in (" . $_typeid . ")");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $typename = array ();
                    foreach ($ret as $k => $v) {
                        array_push($typename, $v['title']);
                    }
                    $list[$key]['typename'] = join("，", $typename);  //分类名称
                } else {
                    $list[$key]['typename'] = "";
                }
            } else {
                $list[$key]['typename'] = "";
            }

            $list[$key]['category']        = $value['category'];
            $list[$key]['rec_brand']       = $value['rec_brand'];
            $list[$key]['description']     = $value['description'];  //描述
            $list[$key]['ordervalid']      = $value['ordervalid'];  //微信下单状态
            $list[$key]['open_fullcoupon'] = $value['open_fullcoupon'];  //微信下单状态

            //最近24小时多少人看过
            $startTime = time()-86400;
            $vsql=$dsql->SetQuery("SELECT count(DISTINCT `uid`) FROM `#@__waimai_historyclick` WHERE `module`='waimai' AND `module2`='storeDetail' AND `aid`='{$value['id']}' AND `date` > $startTime");
            $vtotal = $dsql->getOne($vsql);
            $list[$key]['view_total'] = $vtotal;

            //最新10条下单的外卖
            $osql = $dsql->SetQuery("SELECT `id`, `food`, `uid`  FROM `#@__waimai_order_all` WHERE `sid` = " . $value['id'] . " AND `state` = 1 AND `del` = 0 ORDER BY `pubdate` DESC LIMIT 0, 10");
            $oret  = $dsql->dsqlOper($osql, "results");
            $orderList = array();
            if(is_array($oret)&& count($oret)>0){
                foreach($oret as $okey =>$val){
                    $item = unserialize($val['food']);
                    $orderList[$okey]['title'] = $item[0]['title'];//菜品
                    $userName=$photo="";
                    $usql = $dsql->SetQuery("SELECT `username`, `nickname`, `photo` FROM `#@__member` WHERE `id` = " . $val['uid']);
                    $uret = $dsql->dsqlOper($usql, "results");
                    if ($uret) {
                        $userName = $uret[0]['nickname'] ? $uret[0]['nickname'] : $uret[0]['username'];
                        $photo = $uret[0]['photo'] ? $uret[0]['photo'] : '';
                    }
                    $orderList[$okey]['username'] = $userName; //用户
                    $orderList[$okey]['photo'] = getFilePath($photo); //头像
                }
            }
            $list[$key]['order_list'] = $orderList;

            //营业状态
            $yingye               = $value['yingye'];
            $list[$key]['yingye'] = $value['ordervalid'] == 1 ? $yingye : 0;  //是否营业
            $list[$key]['juli']   = $value['juli'] > 1000 ? sprintf("%.1f",
                    $value['juli'] / 1000) . $langData['siteConfig'][13][62] : $value['juli'] . $langData['siteConfig'][13][22];  //距离   //公里  //米
            
            
            //预定相关属性
            $list[$key]['reservestatus'] = (int)$value['reservestatus']; //支持预定0-关闭，1开启
            //如果没有营业，且可预定，则计算最近的营业时间作为配送时间
            $list[$key]['reserveTime'] = '';
            $list[$key]['reserveWeek'] = 0; //预定的星期，0就是今天，不为0就是星期几
            if ($list[$key]['yingye'] == 0 && $list[$key]['reservestatus'] == 1) {
                //有配置星期才继续处理
                if ($value['weeks'] != null) {
                    //保存所有的开始时间
                    $startArr = array();
                    $nowTime = GetMkTime(time()); //现在时间
                    $nowDate = date("Y-m-d",$nowTime);
                    for ($i = 1; $i <= 3; $i++) {
                        $startKey = 'start_time'.$i;
                        $endKey = 'end_time'.$i;
                        $startDate = $value[$startKey];
                        $endDate = $value[$endKey];
                        //判断开始时间和结束时间不相等且不为空
                        if ($startDate != $endDate && $startDate != null && $endDate != null) {
                            $startArr[] = array('date' => $startDate,'time' => strtotime($nowDate.' '.$startDate));
                        }
                    }

                    //有可用的开始时间，就继续进行处理
                    if ($startArr != null) {
                        //分割星期成为数组
                        $weeks = explode(',', $value['weeks']);
                        //取当前星期
                        $nowWeek = date("w",$nowTime);

                        //按开始时间升序排序
                        usort($startArr, function($a, $b) {
                            return $a['time'] - $b['time']; // 升序排序
                        });

                        //如果今天营业，就计算今天的预定营业时间
                        if (in_array($nowWeek, $weeks)) {
                            //依次循环比较开始时间和现在时间，如果现在时间比开始时间小，就以当前开始时间作为预定配送时间
                            foreach ($startArr as $k => $v) {
                                if ($nowTime < $v['time']) {
                                    $list[$key]['reserveTime'] = $v['date'];
                                    break;
                                }
                            }
                        }

                        //如果没有配送时间，则说明需要跨天
                        if ($list[$key]['reserveTime'] == null) {
                            //预定配送时间为最小的开始时间
                            $list[$key]['reserveTime'] = $startArr[0]['date'];

                            //依次循环比较当前星期和星期数组，如果当前星期小于星期数组，就取星期数组为预定的星期
                            foreach ($weeks as $v) {
                                if ($nowWeek < $v) {
                                    $list[$key]['reserveWeek'] = $v;
                                    break;
                                }
                            }

                            //如果预定的星期还是为0，就说明需要跨星期，则取最小的星期数组
                            if ($list[$key]['reserveWeek'] == 0) {
                                $list[$key]['reserveWeek'] = $weeks[0];
                            }
                        }
                    }
                }
            }


            // 配送费
            // 固定
            if ($value['delivery_fee_mode'] == 1) {
                $basicprice   = $value['basicprice'];
                $delivery_fee = $value['delivery_fee'];
                //按区域
            } else {
                if ($value['delivery_fee_mode'] == 2) {
                    $service_area_data = $value['service_area_data'];
                    $service_area_data = unserialize($service_area_data);
                    if ($service_area_data) {
                        $delivery_fee = 9999;
                        $basicprice   = 9999;
                        foreach ($service_area_data as $k => $v) {
                            if ($v['peisong'] < $delivery_fee) {
                                $delivery_fee = $v['peisong'];
                            }
                            if ($v['qisong'] < $basicprice) {
                                $basicprice = $v['qisong'];
                            }
                        }
                    } else {
                        $delivery_fee = $value['delivery_fee'];
                    }

                    //按距离
                } else {
                    if ($value['delivery_fee_mode'] == 3) {
                        $range_delivery_fee_value = $value['range_delivery_fee_value'];
                        $range_delivery_fee_value = unserialize($range_delivery_fee_value);
                        if ($range_delivery_fee_value) {
                            $delivery_fee = 9999;
                            $basicprice   = 9999;
                            foreach ($range_delivery_fee_value as $k => $v) {
                                if ($v[2] < $delivery_fee) {
                                    $delivery_fee = $v[2];
                                }
                                if ($v[3] < $basicprice) {
                                    $basicprice = $v[3];
                                }
                            }
                        } else {
                            $delivery_fee = $value['delivery_fee'];
                        }
                    }
                }
            }
            $list[$key]['basicprice']   = $basicprice;   //起送价
            $list[$key]['delivery_fee'] = $delivery_fee;   //配送费

            //链接
            if (0 && $value['linktype']) {
                $param = array (
                    "service"  => "waimai",
                    "template" => "buy",
                    "id"       => $value['id']
                );
            } else {
                $param = array (
                    "service"  => "waimai",
                    "template" => "shop",
                    "id"       => $value['id']
                );
            }
            $list[$key]['url'] = getUrlPath($param);

            $list[$key]['delivery_service']  = $value['show_delivery_service'] ? $value['delivery_service'] : "";  //服务商
            $list[$key]['delivery_time']     = empty($value['delivery_time']) ? "" : $value['delivery_time'];  //配送时长
            $list[$key]['is_first_discount'] = $value['is_first_discount'];  //首单减免
            $list[$key]['first_discount']    = $value['first_discount'];  //首单减免金额
            $list[$key]['is_vipdiscount']    = $value['is_vipdiscount'];  //店铺打折
            $list[$key]['vipdiscount_value'] = $value['vipdiscount_value'];  //店铺折扣
            $list[$key]['open_promotion']    = $value['open_promotion'];  //减免

            $promotions    = unserialize($value['promotions']);
            $promotionsArr = array ();
            if ($promotions) {
                foreach ($promotions as $k => $v) {
                    if ($v[0] && $v[1]) {
                        array_push($promotionsArr, $v);
                    }
                }
            }

            $list[$key]['promotions'] = is_array($promotionsArr) ? $promotionsArr : array ();  //减免

            $promotionsStr = array ();
            if ($promotionsArr && is_array($promotionsArr)) {
                foreach ($promotionsArr as $k => $v) {
                    array_push($promotionsStr,
                        preg_replace('/(.*)1(.*)2(.*)/i', '${1}' . $v[0] . $short . '${2}' . $v[1] . $short . '${3}',
                            $langData['waimai'][2][10]));
                }
            }
            $list[$key]['promotionsStr'] = $promotionsStr;

            $list[$key]['pic'] = $value['shop_banner'] ? getFilePath(explode(",", $value['shop_banner'])[0]) : getFilePath('/static/images/shop.png');  //图片


            //关键字搜索商品
            $food     = array ();
            $foodList = array ();
            $wordsSql = !empty($keywords) ? " AND `title` like '%$keywords%'" : "";
            $limitSql = " LIMIT 0, 3";
            $fsql = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `price`, `pics`, `is_nature`, `nature`, `discount_value` FROM `#@__waimai_list` WHERE `sid` = '{$value['id']}' $wordsSql AND `status` = 1 AND `del` = 0 ORDER BY `sort` DESC $limitSql ");
            $fret = $dsql->dsqlOper($fsql, "results");
            if ($fret) {
                foreach ($fret as $k => $v) {
                    array_push($food, $v['title']);

                    $picArr = array ();
                    $pics   = $v["pics"];
                    if (!empty($pics)) {
                        $pics = explode(",", $pics);
                        foreach ($pics as $k_ => $v_) {
                            $picArr[$k_] = changeFileSize(array ('url' => getFilePath($v_), 'type' => 'small'));
                        }
                    }

                    //多属性
                    $isNature = $v['is_nature'];
                    $natureArr = $v['nature'] ? unserialize($v['nature']) : array ();
                    if ($natureArr && $isNature == '1') {
                        foreach ($natureArr as $_k => $_v) {
                            $_data = $_v['data'];
                            if ($_data) {
                                foreach ($_data as $__k => $__v) {
                                    if ($__v['price']) {
                                        $natureArr[$_k]['data'][$__k]['price'] = sprintf("%.2f",
                                            $__v['price'] * ($v['discount_value'] / 10));
                                    }
                                }
                            }
                        }
                    }
                    //去除内容中的空格，不然前端页面会报错
                    if ($natureArr) {
                        foreach ($natureArr as $_k => $_v) {
                            $_data = $_v['data'];
                            if ($_data) {
                                foreach ($_data as $__k => $__v) {
                                    $natureArr[$_k]['data'][$__k]['value'] = preg_replace('/\s+/', '', $__v['value']);
                                }
                            }
                        }
                    }

                    array_push($foodList, array (
                        'id'     => $v['id'],
                        'title'  => $v['title'],
                        'typeid' => $v['typeid'],
                        'price'  => $v['price'],
                        'pics'   => $picArr,
                        'is_nature' => $isNature,
                        'nature' => $natureArr
                    ));
                }
            }
 
            $list[$key]['food']     = $food;
            $list[$key]['foodList'] = $foodList;

            //获取一张店铺商品图，排序最高的商品
            $foodPic = '';
            $sql     = $dsql->SetQuery("SELECT `pics` FROM `#@__waimai_list` WHERE `sid` = " . $value['id'] . " AND `status` = 1 AND `del` = 0 ORDER BY `sort` DESC LIMIT 1");
            $ret     = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $pics = $ret[0]["pics"];
                if (!empty($pics)) {
                    $pics    = explode(",", $pics);
                    $foodPic = changeFileSize(array ('url' => getFilePath($pics[0]), 'type' => 'small'));
                }
            }
            $list[$key]['foodPic'] = $foodPic ? $foodPic : $list[$key]['pic'];

            //获取最低价商品
            $minPrice = 0;
            $sql      = $dsql->SetQuery("SELECT MIN(`price`) price FROM `#@__waimai_list` WHERE `sid` = " . $value['id'] . " AND `status` = 1 AND `del` = 0");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $minPrice = $ret[0]['price'];
            }

            //获取折扣商品
            $zksql = $dsql->SetQuery("SELECT `discount_value` FROM `#@__waimai_list` WHERE `sid` = " . $value['id'] . " AND `status` = 1 AND `del` = 0 AND `is_discount` = 1");
            $zkre  = $dsql->dsqlOper($zksql, "results");
            if (!empty($zkre)) {
                $zkproduct = min(array_column($zkre, "discount_value"));
            } else {
                $zkproduct = '0';
            }

            $list[$key]['zkproduct'] = $zkproduct;
            $list[$key]['minPrice']  = $minPrice;

            $list[$key]['sale'] = $value['sale'];

            // 评分
            $rating             = $value['star'];        //总评分
            $rating             = $rating <= 0 ? 5 : $rating;
            $list[$key]['star'] = number_format($rating, 1);

            if ($timeZhe == 1 && $list[$key]['zkproduct'] == '0') {
                unset($list[$key]);
            }

        }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 菜系分类
     *
     * @return array
     */
    public function type()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "waimai_type", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }

    /**
     * 跑腿分类
     *
     * @return array
     */
    public function paotuitype()
    {
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            } else {
                $type     = (int)$this->param['type'];
                $value    = (int)$this->param['value'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "waimailabel_type", $son, $page, $pageSize);
        $list    = array ();
        if ($results) {
            if ($value) {
                foreach ($results as $key => $value) {
                    $list[$key]['id']    = $value['id'];
                    $list[$key]['value'] = $value['typename'];
                }
                return $list;
            } else {
                return $results;
            }
        }
    }

    /**
     *
     * 骑手列表
     */
    public function courierList()
    {
        global $dsql;
        global $langData;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            } else {
                $lng           = (int)$this->param['lng'];
                $lat           = (int)$this->param['lat'];
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
            }

            //            if($lng == '' || $lat =='') return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            //            $where = '';
            //            if ($lng && $lat) {
            //                //筛选10KM范围内的店铺
            //                $where .= " AND ROUND(
            //                    6378.138 * 2 * ASIN(
            //                        SQRT(POW(SIN(($lat * PI() / 180 - s.`coordX` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(s.`coordX` * PI() / 180) * POW(SIN(($lng * PI() / 180 - s.`coordY` * PI() / 180) / 2), 2))
            //                    ) * 1000
            //                ) < 100000";
            //            }

            if (!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)) {
                $where .= " AND `lat` <= '" . $max_longitude . "' AND `lat` >= '" . $min_longitude . "' AND `lng` <= '" . $max_latitude . "' AND `lng` >= '" . $min_latitude . "'";
            }

            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_courier` WHERE 1=1 AND `status` = 1 AND `state` = 1 AND `quit` = 0 " . $where);

            $res = $dsql->dsqlOper($sql, "results");

            if (!$res) {
                return array ("state" => 200, "info" => '暂无相关数据！');
            }

            return array ("list" => $res);


        }
    }

    /**
     * 区域管理
     *
     * @return array
     */
    public function addr()
    {
        global $dsql;
        $store = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $store    = (int)$this->param['store'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {
            $type = getCityId();
        }
        //一级
        if (empty($type)) {

            //可操作的城市，多个以,分隔
            $userLogin    = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

            $cityArr = array ();
            $sql     = $dsql->SetQuery("SELECT c.*, a.`id` cid, a.`typename`, a.`pinyin` FROM `#@__site_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE c.`cid` in ($adminCityIds) ORDER BY c.`id`");
            $result  = $dsql->dsqlOper($sql, "results");
            if ($result) {
                foreach ($result as $key => $value) {

                    $lowerCount = array();
                    $sql   = $dsql->SetQuery("SELECT count(*) totalCount FROM `#@__site_area` WHERE `parentid` = " . $value['cid'] . " ORDER BY `weight`");
                    $ret   = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $lowerCount = $ret[0]['totalCount'];
                    }

                    array_push($cityArr, array (
                        "id"       => $value['cid'],
                        "typename" => $value['typename'],
                        "pinyin"   => $value['pinyin'],
                        "hot"      => $value['hot'],
                        "lower"    => $lowerCount
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
     * 餐厅
     *
     * @return array
     */
    public function store()
    {
        global $dsql;
        $pageinfo = $list = array ();
        $title    = $addrid = $typeid = $orderby = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $title     = $this->param['title'];
                $addrid    = (int)$this->param['addrid'];
                $typeid    = (int)$this->param['typeid'];
                $orderby   = (int)$this->param['orderby'];
                $peisong   = (int)$this->param['peisong'];
                $online    = (int)$this->param['online'];
                $supfapiao = (int)$this->param['supfapiao'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
            }
        }

        $where = " WHERE `state` = 1";

        //关键字
        if (!empty($title)) {
            $where .= " AND (`title` like '%" . $title . "%' OR `address` like '%" . $title . "%')";
        }

        //遍历地区
        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "waimai_addr")) {
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "waimai_addr"));
                $addridArr = join(',', $addridArr);
                $lower     = $addrid . "," . $addridArr;
            } else {
                $lower = $addrid;
            }
            $where .= " AND `addr` in ($lower)";
        }

        //类型
        if ($typeid != "") {
            $where .= " AND FIND_IN_SET($typeid, `typeid`)";
        }


        $nowTime = (string)date("H:i", time());
        $nowTime = str_replace(":", "", $nowTime);

        //排序
        if (!empty($orderby)) {
            //起送价升序
            if ($orderby == 1) {
                $orderby = " ORDER BY `yy` DESC, `price` ASC, `id` DESC";
                //起送价降序
            } else {
                if ($orderby == 2) {
                    $orderby = " ORDER BY `yy` DESC, `price` DESC, `id` DESC";
                    //配送价升序
                } else {
                    if ($orderby == 3) {
                        $orderby = " ORDER BY `yy` DESC, `peisong` ASC, `id` DESC";
                        //配送价降序
                    } else {
                        if ($orderby == 4) {
                            $orderby = " ORDER BY `yy` DESC, `peisong` DESC, `id` DESC";
                            //配送速度升序
                        } else {
                            if ($orderby == 5) {
                                $orderby = " ORDER BY `yy` DESC, `times` ASC, `id` DESC";
                                //配送速度降序
                            } else {
                                if ($orderby == 6) {
                                    $orderby = " ORDER BY `yy` DESC, `times` DESC, `id` DESC";
                                }
                            }
                        }
                    }
                }
            }
        } else {
            $orderby = " ORDER BY `yy` DESC, `id` DESC";
        }

        //免配送费
        if ($peisong != "") {
            $where .= " AND `peisong` = 0";
        }

        //支持在线支付
        if ($online != "") {
            $where .= " AND `online` = 1";
        }

        //可开发票
        if ($supfapiao != "") {
            $where .= " AND `supfapiao` = 1";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT
            `id`, `title`, `typeid`, `logo`, `start1`, `end1`, `start2`, `end2`,
            `times`, `sale`, `lnglat`, `price`, `peisong`, `online`, `supfapiao`,
            `fapiao`, `fapiaonote`, `notice`, `yingye`, `weisheng`, `address`, `addr`,
        CASE WHEN(
            (CONVERT(`start1`, TIME) <= CONVERT(now(), TIME) AND CONVERT(`end1`, TIME) >= CONVERT(now(), TIME))
            OR
            (CONVERT(`start2`, TIME) <= CONVERT(now(), TIME) AND CONVERT(`end2`, TIME) >= CONVERT(now(), TIME))
        )THEN 1 ELSE 0 END AS yy
        FROM `#@__waimai_store`" . $where . $orderby);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {

            $list = array ();
            foreach ($results as $key => $val) {

                $list[$key]['id']     = $val['id'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['typeid'] = $val['typeid'];

                $typeArr = array ();
                $typeid  = $val["typeid"];
                $typeids = explode(",", $typeid);
                foreach ($typeids as $k => $v) {
                    if ($v) {
                        $typeSql  = $dsql->SetQuery("SELECT `typename` FROM `#@__waimai_type` WHERE `id` = " . $v);
                        $typename = $dsql->getTypeName($typeSql);
                        array_push($typeArr, $typename[0]['typename']);
                    }
                }
                $list[$key]["typeName"]   = join(",", $typeArr);
                $list[$key]["logo"]       = getFilePath($val["logo"]);
                $list[$key]['start1']     = $val['start1'];
                $list[$key]['end1']       = $val['end1'];
                $list[$key]['start2']     = $val['start2'];
                $list[$key]['end2']       = $val['end2'];
                $list[$key]['times']      = $val['times'];
                $list[$key]['sale']       = $val['sale'];
                $list[$key]['lnglat']     = $val['lnglat'];
                $list[$key]['price']      = $val['price'];
                $list[$key]['peisong']    = $val['peisong'];
                $list[$key]['online']     = $val['online'];
                $list[$key]['supfapiao']  = $val['supfapiao'];
                $list[$key]['fapiao']     = $val['fapiao'];
                $list[$key]['fapiaonote'] = $val['fapiaonote'];
                $list[$key]['notice']     = $val['notice'];
                $list[$key]['yingye']     = $val['yingye'];
                $list[$key]['weisheng']   = $val['weisheng'];
                $list[$key]['address']    = $val['address'];
                $list[$key]['addr']       = $val['addr'];
                $list[$key]['yy']         = $val['yy'];

                $param             = array (
                    "service"  => "waimai",
                    "template" => "shop",
                    "id"       => $results[$key]['id']
                );
                $urlParam          = getUrlPath($param);
                $list[$key]['url'] = $urlParam;

            }
        } else {
            return array ("state" => 200, "info" => '暂无相关数据！');
        }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 根据坐标获取附近餐厅数量
     *
     * @param string $points 坐标集合，多个用|分隔
     *
     * @return array
     */
    public function getStoreCount()
    {
        global $dsql;
        $pointsArr = $list = array ();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $points    = $this->param['points'];
                $pointsArr = explode("|", $points);
            }
        }

        if (!empty($pointsArr)) {

            $rangeArr = array ();

            //遍历数据库，取出所有餐厅的配送范围
            $archives = $dsql->SetQuery("SELECT `range`, `title` FROM `#@__waimai_store` WHERE `state` = 1");
            $results  = $dsql->dsqlOper($archives, "results");

            if ($results) {
                foreach ($results as $k1 => $v1) {

                    if (!empty($v1['range'])) {

                        $rangeArr[$k1] = array ();
                        $range1        = explode("$$", $v1['range']);
                        foreach ($range1 as $k2 => $v2) {

                            $rangeArr[$k1][$k2] = array ();
                            $range2             = explode("|", $v2);

                            foreach ($range2 as $k3 => $v3) {

                                $rangeArr[$k1][$k2][$k3] = array ();
                                $range3                  = explode(",", $v3);

                                $rangeArr[$k1][$k2][$k3][0] = $range3[0];
                                $rangeArr[$k1][$k2][$k3][1] = $range3[1];

                            }

                        }

                    }
                }
            }

            //遍历需要检索的坐标点
            foreach ($pointsArr as $key => $value) {
                $point = explode(",", $value);

                $count      = 0;
                $list[$key] = $count;

                //遍历所有配送范围
                foreach ($rangeArr as $k1 => $v1) {

                    $r = false;

                    //计算坐标点是否在配送范围内
                    foreach ($v1 as $k2 => $v2) {

                        if (!$r) {
                            if (isPointInPolygon($v2, $point) == 1) {
                                $count++;
                                $list[$key] = $count;
                                $r          = true;
                            }
                        }
                    }

                }

            }

            return $list;
        }
    }


    /**
     * 餐厅详细信息
     *
     * @return array
     */
    public function storeDetail()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $id  = $this->param;
        $id  = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if (!is_numeric($id) && $uid == -1) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $where = " AND `del` = 0";
        if (!is_numeric($id)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE `userid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $id    = $results[0]['id'];
                $where = "";
            } else {
                return array ("state" => 200, "info" => '该会员暂未开通商铺！');
            }
        }
        $short = echoCurrency(array ("type" => "short"));

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_shop` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            // $time = date("H:i", time());
            // $time = (int)str_replace(":", "", $time);
            $time = GetMkTime(time());

            $typeArr = array ();
            $typeid  = $results[0]["typeid"];
            $typeids = explode(",", $typeid);
            foreach ($typeids as $k => $val) {
                if ($val) {
                    $typeSql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_shop_type` WHERE `id` = " . $val);
                    $type    = $dsql->getTypeName($typeSql);
                    array_push($typeArr, $type[0]['title']);
                }
            }
            $results[0]["typeid"]   = $typeids;
            $results[0]["typeName"] = join(" > ", $typeArr);

            $state  = "";
            $start1 = (int)str_replace(":", "", $results[0]["start_time1"]);
            $end1   = (int)str_replace(":", "", $results[0]["end_time1"]);
            $start2 = (int)str_replace(":", "", $results[0]["start_time2"]);
            $end2   = (int)str_replace(":", "", $results[0]["end_time2"]);
            $start3 = (int)str_replace(":", "", $results[0]["start_time3"]);
            $end3   = (int)str_replace(":", "", $results[0]["end_time3"]);

            /*当前店铺可领优惠券*/
            $nowtime       = time();
            $receivablesql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `shopids` = '$id' AND `state` = 0 AND `deadline` > '$nowtime' ORDER BY `id` DESC");
            $receivableres = $dsql->dsqlOper($receivablesql, "results");

            $receivable = array ();

            if ($receivableres) {

                foreach ($receivableres as $a => $b) {
                    $receivable[$a]['name']        = $b['name'];
                    $receivable[$a]['id']          = $b['id'];
                    $receivable[$a]['basic_price'] = $b['basic_price'];
                    $receivable[$a]['money']       = $b['money'];
                    $receivable[$a]['deadline']    = date('Y.m.d', $b['deadline']);

                    $is_receivesql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `qid` = '" . $b['id'] . "' AND `userid` = '$uid'");

                    $is_receiveres = $dsql->dsqlOper($is_receivesql, "totalCount");

                    /*是否已领取*/
                    $receivable[$a]['is_receive'] = 0;
                    if ($is_receiveres && $is_receiveres >= $b['limit']) {
                        $receivable[$a]['is_receive'] = 1;
                    }
                    $quanressql = $dsql->SetQuery("SELECT `limit` FROM `#@__waimai_quan` WHERE `id` = '" . $b['id'] . "' AND `state` = 0");
                    $quanres = $dsql->dsqlOper($quanressql, "results");
                    
                    $myquansql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `qid` = '" . $b['id'] . "' AND `state` = '0' AND `yourself` = 1");
                    $myquancount = $dsql->dsqlOper($myquansql, "totalCount");
                    $receivable[$a]['upperlimit']       = '0';
                    if ($myquancount >= $quanres[0]['limit']){
                        $receivable[$a]['upperlimit']       = '1';
                    }



                    $difftime = ($b['deadline'] - time()) / 3600;

                    $receivable[$a]['kuaiexp'] = 0;
                    if ($difftime < 24) {
                        $receivable[$a]['kuaiexp'] = 1;
                    }
                }
                //                $receivable = json_encode($receivableres);
            }

            $results[0]['receivable'] = $receivable;
            // //满返优惠劵
            $quanSql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` ORDER BY `id` ASC");
            $resu    = $dsql->dsqlOper($quanSql, "results");

            $quanlist = array_column($resu, 'money', 'id');

            $fullcoupon = array ();
            if ($results[0]['fullcoupon']) {
                $fullcoupon = unserialize($results[0]['fullcoupon']);
                foreach ($fullcoupon as $k => &$v) {
                    if ($v[0] == '0') {
                        unset($fullcoupon[$k]);
                    }
                    $v['1'] = $quanlist[$v['1']];
                }
                $full = array_column($fullcoupon, '0');
                array_multisort($full, SORT_DESC, $fullcoupon);
            }
            $results[0]['fullcoupon_json'] = json_encode($fullcoupon);
            //主要计算营业时间跨夜，例如：18:00到02:00
            $s1 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time1"]);
            $e1 = $start1 > $end1 ? GetMkTime(date("Y-m-d ",
                    strtotime("+1 day")) . $results[0]["end_time1"]) : GetMkTime(date("Y-m-d ",
                    time()) . $results[0]["end_time1"]);
            $s2 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time2"]);
            $e2 = $start2 > $end2 ? GetMkTime(date("Y-m-d ",
                    strtotime("+1 day")) . $results[0]["end_time2"]) : GetMkTime(date("Y-m-d ",
                    time()) . $results[0]["end_time2"]);
            $s3 = GetMkTime(date("Y-m-d ", time()) . $results[0]["start_time3"]);
            $e3 = $start3 > $end3 ? GetMkTime(date("Y-m-d ",
                    strtotime("+1 day")) . $results[0]["end_time3"]) : GetMkTime(date("Y-m-d ",
                    time()) . $results[0]["end_time3"]);

            $weeks      = explode(",", $results[0]['weeks']);
            $dayweek    = date("w") == 0 ? 7 : date("w");
            $yingyeWeek = 0;
            $yingyeTime = 0;
            if (in_array($dayweek, $weeks)) {
                $yingyeWeek = 1;
                if (($s1 < $time && $e1 > $time) or ($s2 < $time && $e2 > $time) or ($s3 < $time && $e3 > $time)) {
                    $yingyeTime = 1;
                    $state      = 1;
                } else {
                    $state = 0;
                }
            } else {
                $state = 0;
            }

            $results[0]["yingye"]     = $state;
            $results[0]["yingyeWeek"] = $yingyeWeek;
            $results[0]["yingyeTime"] = $yingyeTime;

            $results[0]["lng"]     = explode(",", $results[0]["lng"]);
            $results[0]["lat"]     = explode(",", $results[0]["lat"]);
            $results[0]["pubdate"] = date("Y-m-d h:i:s", $results[0]["pubdate"]);


            //预定相关属性
            $results[0]['reservestatus'] = (int)$results[0]['reservestatus']; //支持预定0-关闭，1开启
            //如果没有营业，且可预定，则计算最近的营业时间作为配送时间
            $results[0]['reserveTime'] = '';
            $results[0]['reserveWeek'] = 0; //预定的星期，0就是今天，不为0就是星期几
            if ($results[0]['yingye'] == 0 && $results[0]['reservestatus'] == 1) {
                //有配置星期才继续处理
                if ($results[0]['weeks'] != null) {
                    //保存所有的开始时间
                    $startArr = array();
                    $nowTime = GetMkTime(time()); //现在时间
                    $nowDate = date("Y-m-d",$nowTime);
                    for ($i = 1; $i <= 3; $i++) {
                        $startKey = 'start_time'.$i;
                        $endKey = 'end_time'.$i;
                        $startDate = $results[0][$startKey];
                        $endDate = $results[0][$endKey];
                        //判断开始时间和结束时间不相等且不为空
                        if ($startDate != $endDate && $startDate != null && $endDate != null) {
                            $startArr[] = array('date' => $startDate,'time' => strtotime($nowDate.' '.$startDate));
                        }
                    }

                    //有可用的开始时间，就继续进行处理
                    if ($startArr != null) {
                        //分割星期成为数组
                        $weeksArr = explode(',', $results[0]['weeks']);
                        //取当前星期
                        $nowWeek = date("w",$nowTime);

                        //按开始时间升序排序
                        usort($startArr, function($a, $b) {
                            return $a['time'] - $b['time']; // 升序排序
                        });

                        //如果今天营业，就计算今天的预定营业时间
                        if (in_array($nowWeek, $weeksArr)) {
                            //依次循环比较开始时间和现在时间，如果现在时间比开始时间小，就以当前开始时间作为预定配送时间
                            foreach ($startArr as $k => $v) {
                                if ($nowTime < $v['time']) {
                                    $results[0]['reserveTime'] = $v['date'];
                                    break;
                                }
                            }
                        }

                        //如果没有配送时间，则说明需要跨天
                        if ($results[0]['reserveTime'] == null) {
                            //预定配送时间为最小的开始时间
                            $results[0]['reserveTime'] = $startArr[0]['date'];

                            //依次循环比较当前星期和星期数组，如果当前星期小于星期数组，就取星期数组为预定的星期
                            foreach ($weeksArr as $v) {
                                if ($nowWeek < $v) {
                                    $results[0]['reserveWeek'] = $v;
                                    break;
                                }
                            }

                            //如果预定的星期还是为0，就说明需要跨星期，则取最小的星期数组
                            if ($results[0]['reserveWeek'] == 0) {
                                $results[0]['reserveWeek'] = $weeks[0];
                            }
                        }
                    }
                }
            }

            //验证是否已经收藏
            $params                = array (
                "module" => "waimai",
                "temp"   => "shop",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect               = checkIsCollect($params);
            $results[0]['collect'] = $collect == "has" ? 1 : 0;

            //图集
            $bannerArr   = array ();
            $shop_banner = explode(",", $results[0]['shop_banner']);
            if ($shop_banner) {
                foreach ($shop_banner as $banner) {
                    array_push($bannerArr, getFilePath($banner));
                }
            }
            $results[0]['shop_banner'] = $bannerArr;


            //链接
            if ($results[0]['linktype']) {
                $param = array (
                    "service"  => "waimai",
                    "template" => "shop",
                    "id"       => $results[0]['id']
                );
            } else {
                $param = array (
                    "service"  => "waimai",
                    "template" => "shop",
                    "id"       => $results[0]['id']
                );
            }
            $results[0]['url'] = getUrlPath($param);

            //分享图片
            $results[0]['share_pic'] = $results[0]['share_pic'] ? getFilePath($results[0]['share_pic']) : "";

            $results[0]['range_delivery_fee_value']      = unserialize($results[0]['range_delivery_fee_value']);
            $results[0]['range_delivery_fee_value_json'] = json_encode($results[0]['range_delivery_fee_value']);


            //预设选项
            $presetArr = array ();
            $preset    = unserialize($results[0]['preset']);
            if ($preset) {
                foreach ($preset as $key => $value) {
                    array_push($presetArr, array (
                        $value[0],
                        $value[1],
                        $value[2],
                        ($value[0] == 1 ? explode(",", $value[3]) : $value[3])
                    ));
                }
            }
            $results[0]['preset'] = $presetArr;

            $promotions    = unserialize($results[0]['promotions']);
            $promotionsArr = array ();
            if ($promotions) {
                foreach ($promotions as $k => $v) {
                    if ($v[0] && $v[1]) {
                        array_push($promotionsArr, $v);
                    }
                }
            }

            // $results[0]['promotions'] = is_array($promotionsArr) ?   array_multisort(array_column($promotionsArr, 0),SORT_ASC,$promotionsArr) : array();
            $results[0]['promotions']      = is_array($promotionsArr) ? $promotionsArr : array ();
            $results[0]['promotions_json'] = json_encode($promotionsArr);

            $promotionsStr = array ();
            if ($promotionsArr && is_array($promotionsArr)) {
                foreach ($promotionsArr as $k => $v) {
                    if ($v['0'] != '0') {
                        array_push($promotionsStr, preg_replace('/(.*)1(.*)2(.*)/i',
                            '${1}' . $v[0] . $short . '${2}' . $v[1] . $short . '${3}', $langData['waimai'][2][10]));
                    }
                }
            }
            $results[0]['promotionsStr'] = $promotionsStr;

            $results[0]['addservice']        = unserialize($results[0]['addservice']);
            $results[0]['addservice_json']   = json_encode($results[0]['addservice']);
            $results[0]['selfdefine']        = unserialize($results[0]['selfdefine']);
            $results[0]['service_area_data'] = unserialize($results[0]['service_area_data']);

            $results[0]['title'] = $results[0]['shopname'];
            $results[0]['food_license_img'] = $results[0]['food_license_img'] ? getFilePath($results[0]['food_license_img']) : '';
            $results[0]['business_license_img'] = $results[0]['business_license_img'] ? getFilePath($results[0]['business_license_img']) : '';

            $results[0]['del'] = $results[0]['del'];


            $common = array ();

            // 评分
            $sql = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__waimai_common` WHERE `sid` = " . $id);
            // $sql = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__public_comment_all` WHERE `aid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
            $res            = $dsql->dsqlOper($sql, "results");
            $rating         = $res[0]['r'];        //总评分
            $common['star'] = number_format($rating, 1);

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_common` WHERE `sid` = " . $id);
            // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `aid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0 AND `ischeck` = 1");
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            // var_dump($totalCount);die;
            // 一星
            $totalCountStar1 = $dsql->dsqlOper($archives . " AND `star` = 1", "totalCount");
            // 二星
            $totalCountStar2 = $dsql->dsqlOper($archives . " AND `star` = 2", "totalCount");
            // 三星
            $totalCountStar3 = $dsql->dsqlOper($archives . " AND `star` = 3", "totalCount");
            // 四星
            $totalCountStar4 = $dsql->dsqlOper($archives . " AND `star` = 4", "totalCount");
            // 五星
            $totalCountStar5 = $dsql->dsqlOper($archives . " AND `star` = 5", "totalCount");

            $common['totalCount']  = $totalCount;
            $common['totalCount1'] = $totalCountStar1;
            $common['totalCount2'] = $totalCountStar2;
            $common['totalCount3'] = $totalCountStar3;
            $common['totalCount4'] = $totalCountStar4;
            $common['totalCount5'] = $totalCountStar5;

            // 配送评分
            $sql = $dsql->SetQuery("SELECT avg(`starps`) r FROM `#@__waimai_common` WHERE `sid` = " . $id);
            // $sql = $dsql->SetQuery("SELECT avg(`starps`) r FROM `#@__public_comment_all` WHERE `aid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
            $res              = $dsql->dsqlOper($sql, "results");
            $rating           = $res[0]['r'];        //总评分
            $common['starps'] = number_format($rating, 1);

            $results[0]['common'] = $common;

            // echo '<pre>';
            // var_dump($results[0]);die;
            $results[0]['address'] = str_replace(array ("\r\n", "\r", "\n"), "", $results[0]['address']);

            // $porder = $dsql->SetQuery("SELECT count(`id`) as psalle FROM `#@__waimai_order_all` WHERE `state` = 1  AND  `sid` = $id");
            // $pre    = $dsql->dsqlOper($porder, "results");
            // $results[0]['sale']  = (int)$pre[0]['psalle'];

            $results[0]['sale']  = (int)$results[0]['sale'];
            $results[0]['state'] = (int)$results[0]['status'];

            //记录用户的浏览记录
            $shopUid = (int)$results[0]['userid'];
            if($uid >0) {
                if($uid != $shopUid){ 
                    //店主与浏览用户不能是同一个人
                    $upHistory = array(
                        'module'    => 'waimai',
                        'module2'   => 'storeDetail',
                        'uid'       => $uid, //浏览的用户id
                        'fuid'      => $shopUid, //店铺的会员id
                        'aid'       => $id, //店铺id
                    );
                    /*更新浏览足迹表*/
                updateHistoryClick($upHistory);
                }
            }

            return $results[0];
        } else {
            return array ("state" => 200, "info" => '餐厅不存在！');
        }
    }

    /**
     * 店铺评分
     *
     * @return array
     */
    public function storeDetailStar()
    {
        global $dsql;
        $id = $this->param;

        if (!is_numeric($id)) {
            $id = $this->param['id'];
        }

        $results = array ();

        // 评分
        $sql = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__waimai_common` WHERE `sid` = " . $id);
        // $sql = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__public_comment_all` WHERE `aid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
        $res             = $dsql->dsqlOper($sql, "results");
        $rating          = $res[0]['r'];        //总评分
        $results['star'] = number_format($rating, 1);

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_common` WHERE `sid` = " . $id);
        // $archives = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__public_comment_all` WHERE `aid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        // 一星
        $totalCountStar1 = $dsql->dsqlOper($archives . " AND `star` = 1", "totalCount");
        // 二星
        $totalCountStar2 = $dsql->dsqlOper($archives . " AND `star` = 2", "totalCount");
        // 三星
        $totalCountStar3 = $dsql->dsqlOper($archives . " AND `star` = 3", "totalCount");
        // 四星
        $totalCountStar4 = $dsql->dsqlOper($archives . " AND `star` = 4", "totalCount");
        // 五星
        $totalCountStar5 = $dsql->dsqlOper($archives . " AND `star` = 5", "totalCount");

        $results['totalCount']  = $totalCount;
        $results['totalCount1'] = $totalCountStar1;
        $results['totalCount2'] = $totalCountStar2;
        $results['totalCount3'] = $totalCountStar3;
        $results['totalCount4'] = $totalCountStar4;
        $results['totalCount5'] = $totalCountStar5;

        return $results;

    }


    /**
     * 商品分类
     *
     * @return array
     */
    public function foodType()
    {
        global $dsql;
        $shop = $this->param['shop'];
        if (!is_numeric($shop)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        //显示状态
        $where = " AND `del` = 0 AND (`weekshow` = 0 OR (`weekshow` = 1 AND (FIND_IN_SET(DAYOFWEEK(now()) - 1, `week`) OR (DAYOFWEEK(now()) = 1 AND FIND_IN_SET(7, `week`)))))
        AND (`start_time` = '00:00' OR CONVERT(`start_time`, TIME) < CONVERT(now(), TIME)) AND (`end_time` = '00:00' OR CONVERT(`end_time`, TIME) > CONVERT(now(), TIME))";

        $archives = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__waimai_list_type` WHERE `status` = 1 AND `sid` = " . $shop . " " . $where . " ORDER BY `sort` DESC");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            return $results;
        } else {
            return array ("state" => 200, "info" => '暂无商品分类！');
        }

    }


    /**
     * 获取地址列表
     */
    public function getMemberAddress()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();


        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }
        $shopid      = $this->param['shopid'];
        $gettype     = $this->param['gettype'];
        $lng         = $this->param['lng'];
        $lat         = $this->param['lat'];
        $cityid      = $this->param['cityid'];
        if($shopid){
            $this->param = $shopid;
            $detailshop  = $this->storeDetail();
        }

        $where = " WHERE `uid` = $uid ";
        if($cityid){
          $where .= "AND `cityid` = $cityid";
        }
        $sql         = $dsql->SetQuery("SELECT `id`, `cityid`, `person`, `tel`, `street`, `address`, `lng`, `lat`,`areaCode`,`def` FROM `#@__waimai_address` $where ORDER BY `def` DESC, `id` DESC");

        $ret         = $dsql->dsqlOper($sql, "results");
        include(HUONIAOROOT . "/include/config/waimai.inc.php");
        if ($ret) {
            $kk = 0;
            foreach ($ret as $key => $val) {
                $list[$kk]['id']        = $val['id'];
                $list[$kk]['person']    = $val['person'];
                $list[$kk]['tel']       = $val['tel'];
                $list[$kk]['street']    = $val['street'];
                $list[$kk]['address']   = $val['address'] ? $val['address'] : '';
                $list[$kk]['lng']       = $val['lng'];
                $list[$kk]['lat']       = $val['lat'];
                $list[$kk]['areaCode']  = $val['areaCode'];
                $list[$kk]['default']   = (int)$val['def'];

                //所在分站
                $cityid = $val['cityid'];

                //没有维护分站的话，根据经纬度获取
                if(!$cityid){

                    $params = array('location' => $val['lat'].','.$val['lng']);
                    $locationByGeocoding = (new siteConfig($params))->getLocationByGeocoding();

                    //根据经纬度查询省市区乡镇
                    if($locationByGeocoding['province'] || $locationByGeocoding['city'] || $locationByGeocoding['district']){

                        $params = array(
                            'region' => $locationByGeocoding['province'],
                            'city' => $locationByGeocoding['city'],
                            'town' => $locationByGeocoding['district'],
                            'district' => $locationByGeocoding['town'],
                        );
                        $cityData = (new siteConfig($params))->verifyCity();


                        //未查询到
                        if($cityData['state'] == 200){

                            continue;

                        //查询到
                        }else{
                            $cityid = $cityData['cityid'];

                            //同时更新此地址库的cityid，下次不需要再请求接口
                            $sql = $dsql->SetQuery("UPDATE `#@__waimai_address` SET `cityid` = '$cityid' WHERE `id` = " . $val['id']);
                            $dsql->dsqlOper($sql, "update");
                        }

                    //没有查询到，不输出此条地址库
                    }else{
                        continue;
                    }


                }
                $list[$kk]['cityid'] = $cityid;

                $cityname = '未知';
                if($cityid){
                    $params = array(
                        'cityid' => $cityid
                    );
                    $cityData = (new siteConfig($params))->cityInfoById();
                    if($cityData['state'] != 200){
                        $cityname = $cityData['name'];
                    }
                }
                $list[$kk]['cityname'] = $cityname;


                //需要查询距离
                if($lng && $lat){
                    // $juli = getDistance($lat, $lng, $val['lat'], $val['lng']) / 1000;  //骑行接口实时查询，速度慢
                    $juli = oldgetDistance($lat, $lng, $val['lat'], $val['lng']) / 1000;  //直线距离，公式计算，速度快
                    $list[$kk]['juli'] = sprintf("%.2f", $juli);
                }

                if($shopid){
                    $juli = getDistance($detailshop['coordX'], $detailshop['coordY'], $val['lat'], $val['lng']) / 1000;

                    if ($juli == 0) {
                        $juli = oldgetDistance($detailshop['coordX'], $detailshop['coordY'], $val['lat'], $val['lng']) / 1000;
                    }
                    $list[$kk]['juli'] = sprintf("%.2f", $juli);
                }

                $list[$kk]['is_select'] = 1;

                if ($gettype == 'paotui' && $lng && $lat) {
                    $paotuijuli = getDistance($lat, $lng, $val['lat'], $val['lng']) / 1000;

                    if ($paotuijuli == 0) {
                        $paotuijuli = oldgetDistance($lat, $lng, $val['lat'], $val['lng']) / 1000;
                    }
                    if ($paotuijuli > $custompaotuiMaxjuli) {
                        $list[$kk]['is_select'] = 0;
                    }

                }

                $kk++;
            }

            if($lng && $lat){
                $list = array_sortby($list, 'juli');  //由近到远排序
            }
        }

        return $list ? $list : array ("state" => 200, "info" => '暂未添加地址');
    }


    /**
     * 添加/修改地址
     */
    public function operAddress()
    {
        global $dsql;
        global $userLogin;
        global $cfg_map;
        global $siteCityInfo;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }

        $id       = (int)$this->param['id'];
        $person   = $this->param['person'] ?: $this->param['people'];
        $tel      = $this->param['tel'] ?: $this->param['mobile'];
        $street   = $this->param['street'];
        $lng      = $this->param['lng'];
        $lat      = $this->param['lat'];
        $address  = $this->param['address'];
        $def      = (int)$this->param['default'];
        $areaCode = (int)$this->param['areaCode'];
        // $addressname = (int)$this->param['addressname'];
        $areaCode = $areaCode ? $areaCode : 86;
        if (empty($person)) {
            return array ("state" => 200, "info" => '请输入联系人！');
        }

        if (empty($tel)) {
            return array ("state" => 200, "info" => '请输入联系电话！');
        }

        if (empty($street)) {
            return array ("state" => 200, "info" => '请选择街道/小区/建筑！');
        }

        if (empty($lng) || empty($lat)) {
            return array ("state" => 200, "info" => '请选择地图坐标！');
        }

        if (empty($address)) {
            // return array ("state" => 200, "info" => '请输入详细地址！');
        }

        if (empty($areaCode)) {
            return array ("state" => 200, "info" => '请选择手机区号！');
        }

        //根据经纬度查询所在分站
        $cityid = 0;
        $params = array('location' => $lat.','.$lng);
        $locationByGeocoding = (new siteConfig($params))->getLocationByGeocoding();

        //根据经纬度查询省市区乡镇
        if($locationByGeocoding['province'] || $locationByGeocoding['city'] || $locationByGeocoding['district']){

            $params = array(
                'region' => $locationByGeocoding['province'],
                'city' => $locationByGeocoding['city'],
                'town' => $locationByGeocoding['district'],
                'district' => $locationByGeocoding['town'],
            );
            $cityData = (new siteConfig($params))->verifyCity();

            //未查询到，谷歌地图继续往下走
            if($cityData['state'] == 200 && $cfg_map != 1){

                //有部分客户的分站并不是城市，而是学校，这种情况不好根据省市区进行验证
                // return array ("state" => 200, "info" => '所选地区未开通分站，保存失败！');

            //查询到
            }else{
                $cityid = $cityData['cityid'];
            }

        //没有查询到，不输出此条地址库
        }else{
            $_error = isset($locationByGeocoding['info']) ? $locationByGeocoding['info'] : '经纬度解析失败！';
            return array ("state" => 200, "info" => $_error);
        }

        //如果上面没有获取到分站，这里强制使用当前所在分站
        if(!$cityid){
            $cityid = $siteCityInfo['cityid'];
        }

        //如果设置了默认地址，需要先把其他默认地址删除掉默认值
        if($def){
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_address` SET `def` = 0 WHERE `uid` = $uid");
            $ret = $dsql->dsqlOper($sql, "update");
        }

        //新增地址
        if (empty($id)) {
            $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_address` (`uid`, `cityid`, `person`, `tel`, `street`, `address`, `lng`, `lat`, `areaCode`, `def`) VALUES ('$uid', '$cityid', '$person', '$tel', '$street', '$address', '$lng', '$lat', '$areaCode', '$def')");
            $ret = $dsql->dsqlOper($sql, "lastid");
            if (is_numeric($ret)) {
                return $ret;
            } else {
                return array ("state" => 200, "info" => '保存失败！');
            }
            //更新地址
        } else {
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_address` SET `cityid` = '$cityid', `person` = '$person', `tel` = '$tel', `street` = '$street', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `areaCode` = '$areaCode', `def` = '$def' WHERE `id` = $id AND `uid` = $uid");
            $ret = $dsql->dsqlOper($sql, "update");

            if ($ret == "ok") {
                return "保存成功";
            } else {
                return array ("state" => 200, "info" => '保存失败！');
            }
        }

    }


    /**
     * 删除收货地址
     */
    public function delAddress()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }

        $id = (int)$this->param['id'];

        $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_address` WHERE `id` = $id AND `uid` = $uid");
        $dsql->dsqlOper($sql, "update");
        return "ok";
    }

    /**
     * 删除收货地址
     */
    public function getAddressDetail()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }
        $id = (int)$this->param['id'];
        $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `id` = $id AND `uid` = $uid");
        $results = $dsql->dsqlOper($sql, "results");

      if ($results) {
        return $results[0];
      }else{
          return array ("state" => 200, "info" => '信息不存在');
      }

    }





    /**
     * 提交订单
     */
    public function deal()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }
        $userLogin->keepUser();
        $userinfo      = $userLogin->getMemberInfo();
        $shop          = (int)$this->param['shop'];
        $address       = (int)$this->param['address'];
        $paytype       = (int)$this->param['paytype'];
        $order_content = json_decode($this->param['order_content'], true);
        $preset        = json_decode($this->param['preset'], true);
        $note          = $this->param['note'];
        $quanid        = (int)$this->param['quanid'];
        $quantype      = (int)$this->param['quantype'];
        $openlevel     = (int)$this->param['openlevel'];
        $desk          = $this->param['desk'] == '' ? 0 : $this->param['desk'];
        $peitype       = (int)$this->param['peitype']; /*配送类型*/
        $phone         = (int)$this->param['phone']; /*手机号*/
        $lng           = $this->param['lng'];
        $lat           = $this->param['lat'];
        $peerpay       = $this->param['peerpay'];
        // $openlevel     = 1;
        $level     = $this->param['level'];
        $usePinput = $this->param['usePinput'];   //是否使用积分

        $selftime = $this->param['selftime'];
        $zsbprice = (float)$this->param['tprice'] ? (float)$this->param['tprice'] : 0; //准时宝费用

        $orderTime = (int)$this->param['orderTime']; //预定配送时间

        if (empty($shop)) {
            return array ("state" => 200, "info" => '店铺ID错误！');
        }
        // 满送
        $giveQuanid = 0;

        //店铺详细信息
        $this->param = $shop;
        $shopDetail  = $this->storeDetail();

        if ($shopDetail['selftake'] == 0) {
            $peitype = 0;  /*店铺未开启到店自取功能*/
        }
        if ($shopDetail['del']) {
            return array ("state" => 200, "info" => '店铺不存在');
        }

        if (!$shopDetail['status']) {
            return array ("state" => 200, "info" => '该店铺关闭了，您暂时无法在该店铺下单。');
        }

        if ($shopDetail['status'] && !$shopDetail['ordervalid']) {
            return array ("state" => 200, "info" => '该店铺关闭了下单，您暂时无法在该店铺下单。');
        }

        if (!$shopDetail['yingye']) {

            //如果店铺开启了预定功能，则不报错继续计算
            if (!($shopDetail['reservestatus'] == 1 && $shopDetail['reserveTime'] != null)) {
                if (!$shopDetail['yingyeWeek']) {

                    return array ("state" => 200, "info" => '该店铺今天暂停营业！');
    
                } else {
    
                    return array ("state" => 200, "info" => '该店铺不在营业时间，您暂时无法在该店铺下单！');
                }
            }

            //判断是否有预定配送时间
            if ($orderTime == null) {
                return array ("state" => 200, "info" => '请选择预定时间！');
            }
            
        } else {
            //如果是营业时间，就把预定时间设为0
            $orderTime = 0;
        }

        //送餐地址
        $user_addr_person = $user_addr_tel = $user_addr_street = $user_addr_address = $user_addr_lng = $user_addr_lat = "";
        $sql              = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $uid AND `id` = $address");
        $ret              = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $user_addr_person  = $ret[0]['person'];
            $user_addr_tel     = $ret[0]['areaCode'] != '' && $ret[0]['areaCode'] != '86' ? '+' . $ret[0]['areaCode'] . $ret[0]['tel'] : $ret[0]['tel'];
            $user_addr_street  = $ret[0]['street'];
            $user_addr_address = $ret[0]['address'];
            $user_addr_lng     = $ret[0]['lng'];
            $user_addr_lat     = $ret[0]['lat'];
        }
        /**/
        if ($peitype == 1) {
            $user_addr_tel    = $phone;
            $user_addr_person = $userinfo['username'];
        }
        if (empty($desk) && $selftime == '') {
            if (empty($user_addr_lng) || empty($user_addr_lat)) {
                return array ("state" => 200, "info" => '送餐地址坐标获取失败，请重新选择地址！');
            }
        }

        if (empty($desk) && $selftime == '') {
            if (empty($shopDetail['coordX']) || empty($shopDetail['coordY'])) {
                return array ("state" => 200, "info" => '店铺坐标获取失败，下单失败！');
            }
        }
        // var_dump($shopDetail['coordX'], $shopDetail['coordY'], $user_addr_lat, $user_addr_lng);die;
        $juli = getDistance($shopDetail['coordX'], $shopDetail['coordY'], $user_addr_lat, $user_addr_lng) / 1000;
        if (empty($desk) && $selftime == '') {
            if ($shopDetail['delivery_radius'] != 0 && $shopDetail['delivery_radius'] < $juli) {
                return array ("state" => 200, "info" => '送餐地址距离店铺太远，超出了商家的最大服务范围！');
            }
        }

        if (empty($order_content)) {
            return array ("state" => 200, "info" => '购物车内容为空，下单失败！');
        }

        $zhsql = $dsql->SetQuery("SELECT `zhuohao` ,`instorestatus`,`wmstorestatus`,`tjprice` FROM `#@__waimai_shop` WHERE `id` = $shop");
        $zhres = $dsql->dsqlOper($zhsql, "results");

        if ($zhres[0]['zhuohao']) {
            $zhuohao      = array_values(unserialize($zhres[0]['zhuohao']));
            $zhuohaoarray = array_column($zhuohao, '0');
        }

        // $tjprice        = (float)$zhres[0]['tjprice'];该功能已经弃用
        $tjprice       = 0;
        $instorestatus = $zhres[0]['instorestatus'];
        $wmstorestatus = $zhres[0]['wmstorestatus'];
        $ordertype     = 0;
        if ($instorestatus == 1) {
            if (!empty($desk)) {
                //查询桌号是否存在
                if (in_array($desk, $zhuohaoarray)) {
                    $ordertype = 1;
                    // if($lat=='' || $lng == '') return array("state" => 200, "info" => '位置信息获取失败');
                    // 客户反馈有获取失败的情况，所以这里暂不考虑没有坐标的情况
                    if ($lat && $lng) {
                        $juli = getDistance($shopDetail['coordX'], $shopDetail['coordY'], $lat, $lng);

                        if ($juli > 200) {
                            // return array("state" => 200, "info" => '请在店内点餐，您当前位置距离店铺太远~');
                        }
                    }
                } else {
                    $ordertype = 0;
                    return array ("state" => 200, "info" => '桌号不存在！');
                }
            } else {
                if ($wmstorestatus == 0) {

                    return array ("state" => 200, "info" => '店铺暂未开启店内点餐');
                }

            }
        }

        // 验证优惠券
        $quan      = array ();
        $time      = GetMkTime(time());
        $foodPrice = 0;
        $has       = false;

        // $quanid = 3;
        if ($quanid) {
            if ($quantype != 1) {
                // echo '1231231';die;
                $sql           = $dsql->SetQuery("SELECT * FROM `#@__waimai_quanlist` WHERE `id` = $quanid AND `userid` = $uid AND ( `shopids` = '' || FIND_IN_SET($shop, `shopids`) ) AND `state` = 0 AND `deadline` > $time");
                $openlevelquan = 0;

            } else {

                // echo '22222';die;
                $sql              = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `id` = $quanid ");
                $openlevelquan    = 1;
                $level['usequan'] = $quanid;
            }
            // var_dump($sql);die;
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $quan = $ret[0];
            }
        }

        //验证商品
        $priceinfo  = array ();
        $totalPrice = 0;
        $dabaoPrice = 0;
        $zkytotal   = 0; //商品一共折扣了多少钱;
        $zktotal    = 0; //折扣总额;

        $fids         = array ();
        $food         = array ();
        $vippriceinfo = array (); //开通会员价格规格
        $vipprice     = 0;
        //判断开通会员还是本身会员
        if ($openlevel == 1 && $ordertype == 0) {
            $userinfolevel = $level['id'];

            $vippriceinfo['level']   = $level['id'];
            $vippriceinfo['name']    = $level['name'];
            $vippriceinfo['day']     = 1;
            $vippriceinfo['daytype'] = "month";
            $vippriceinfo['title']   = "开通" . $level['name'] . "1个月";
            $vippriceinfo['userid']  = $uid;
            $vippriceinfo['price']   = $level['price'];
            $vippriceinfo['balance'] = 0;
            $vippriceinfo['usequan'] = $quanid;

            $vipprice = $level['price'];

            if ($level['privilege']['delivery'][0]['type'] == 'count') {

                $userinfodelivery_count = $level['privilege']['delivery'][0]['val'];
            }

            array_push($priceinfo, array (
                "type"   => "ktvip",
                "body"   => "开通vip费用",
                "amount" => sprintf("%.2f", $vipprice)
            ));


        } else {

            $userinfodelivery_count = $userinfo['delivery_count'];
            $userinfolevel          = $userinfo['level'];
        }
        $vippriceinfo = serialize($vippriceinfo);
        $privilege = array();
        if($userinfolevel){
            $sql          = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = " . $userinfolevel);
            $ret          = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $privilege = unserialize($ret[0]['privilege']);
            }
        }


        //优惠推荐配置信息
        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;

        $is_discount   = 0;
        $has_saleRec   = false;
        $saleRec_count = 0;
        foreach ($order_content as $key => $value) {

            $zkprice  = 0; //折扣商品的价格
            $zkyprice = 0; //折扣多少钱
            $fid      = $value['id'];     //商品ID
            $fcount   = $value['count'];  //商品数量
            $fntitle  = $value['ntitle']; //商品属性


            array_push($fids, $fid);

            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_list` WHERE `id` = $fid AND `sid` = $shop AND `status` = 1 AND `del` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data = $ret[0];

                //判断订单中是否包含优惠推荐的商品
                if ($data['saleRec']) {
                    $has_saleRec   = true;
                    $saleRec_count += $fcount;
                }

                $foodprice                = $data['price'];
                $food[$key]['yuanpprice'] = $foodprice;
                if ($tjprice != 0) {

                    $foodprice = $foodprice + $foodprice * $tjprice / 100;
                }

                $waimaidiscount = $privilege['waimai'] == "" ? 10 : $privilege['waimai']; //没有会员折扣变10 好跟商品折扣判断
                if ($shopDetail['is_vipdiscount'] == 1 && $userinfolevel != 0) {

                    $waimaidiscount = $shopDetail['vipdiscount_value']; //商品vip折扣

                }
                if ($data['is_discount'] == "1") {
                    if ($data['discount_value'] < $waimaidiscount) {
                        // var_dump($data['is_discount'],$data['title'],$data['price'],$data['discount_value']);

                        $is_discount = '1';
                        $price       = $foodprice * ($data['discount_value'] / 10);
                        // var_dump($price);
                        $zkyprice = ($foodprice - $price);
                        $zkprice  = $foodprice * ($data['discount_value'] / 10);
                    } else {

                        $price = $foodprice;
                    }

                } else {

                    $price = $foodprice;

                }
                //查询限购规则中的购买数量
                if ($data['is_limitfood'] == 1) {
                    $dealcount = 0;
                    $sql       = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `uid`  =" . $uid . " AND `pubdate` >= " . $data['start_time'] . " AND `pubdate` < " . $data['stop_time'] . " AND FIND_IN_SET(" . $fid . ",`fids`) AND `state` not in(0,6)");
                    $ret       = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        foreach ($ret as $_order) {
                            $_food = $_order['food'];
                            if ($_food) {
                                $_food = unserialize($_food);
                                foreach ($_food as $_f) {
                                    $_fid    = $_f['id'];
                                    $_fcount = $_f['count'];
                                    if ($_fid == $fid) {
                                        $dealcount += $_fcount;
                                    }
                                }
                            }
                        }
                    }

                    //判断要购买的数量是否超过限购数量
                    if ($data['foodnum'] < $fcount) {
                        return array ("state" => 200, "info" => $data['title'] . "超过限购数量，下单失败！");
                    }

                    //判断已经购买的数量是否超过限购数量
                    if ($data['foodnum'] <= $dealcount) {
                        return array ("state" => 200, "info" => $data['title'] . "超过限购数量，下单失败！");
                    }

                } else {
                    if ($data['is_day_limitfood'] == 1) {
                        $start_time = strtotime(date("Y-m-d", time()));
                        //当天结束之间
                        $end_time = $start_time + 60 * 60 * 24;

                        $dealcount = 0;
                        $sql       = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `uid`  =" . $uid . " AND `pubdate` >= " . $start_time . " AND `pubdate` < " . $end_time . " AND FIND_IN_SET(" . $fid . ",`fids`) AND `state` not in(0,6)");
                        $ret       = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            foreach ($ret as $_order) {
                                $_food = $_order['food'];
                                if ($_food) {
                                    $_food = unserialize($_food);
                                    foreach ($_food as $_f) {
                                        $_fid    = $_f['id'];
                                        $_fcount = $_f['count'];
                                        if ($_fid == $fid) {
                                            $dealcount += $_fcount;
                                        }
                                    }
                                }
                            }
                        }

                        //判断要购买的数量是否超过限购数量
                        if ($data['day_foodnum'] < $fcount) {
                            return array ("state" => 200, "info" => $data['title'] . "超过限购数量，下单失败！");
                        }

                        //判断已经购买的数量是否超过限购数量
                        if ($data['day_foodnum'] <= $dealcount) {
                            return array ("state" => 200, "info" => $data['title'] . "超过限购数量，下单失败！");
                        }

                    }
                }

                $list[$key]['dealcount']   = $ret[0]['dealcount'] ? $ret[0]['dealcount'] : 0;
                $dabao                     = $data['is_dabao'] ? $data['dabao_money'] : 0;
                $totalPrice                += $price * $fcount;
                $dabaoPrice                += $dabao * $fcount;
                $zkytotal                  += $zkyprice * $fcount;
                $zktotal                   += $zkprice * $fcount;
                $food[$key]['id']          = $fid;
                $food[$key]['title']       = $data['title'];
                $food[$key]['ntitle']      = $fntitle;
                $food[$key]['count']       = $fcount;
                $food[$key]['fx_reward']   = $data['fx_reward'];
                $food[$key]['is_discount'] = $is_discount == 1 ? $data['is_discount'] : 0;;
                $food[$key]['discount_value'] = $data['discount_value'];
                $fprice                       = $price;

                if ($data['stockvalid'] && $data['stock'] < $fcount) {
                    return array ("state" => 200, "info" => $value['title'] . "库存不足，下单失败！");
                }

                //商品属性
                if ($data['is_nature']) {
                    $nature = unserialize($data['nature']);
                    if ($nature) {
                        $names  = array ();
                        $prices = array ();
                        // print_r($nature);die;
                        foreach ($nature as $k => $v) {
                            $names[$k]  = array ();
                            $prices[$k] = array ();
                            foreach ($v['data'] as $k_ => $v_) {
                                array_push($names[$k], $v_['value']);
                                $_price = $v_['price'];
                                array_push($prices[$k], $_price);
                            }
                        }

                        $namesArr  = descartes($names);
                        $pricesArr = descartes($prices);

                        $names  = array ();
                        $prices = array ();

                        if (count($namesArr) > 1) {
                            foreach ($namesArr as $k => $v) {
                                array_push($names, join("/", $v));
                            }
                        } else {
                            $names = $namesArr[0];
                        }

                        if (count($pricesArr) > 1) {
                            foreach ($pricesArr as $k => $v) {
                                array_push($prices, array_sum($v));
                            }
                        } else {
                            $prices = $pricesArr[0];
                        }

                        if ($fntitle) {
                            $empty = false;
                            // 多选的情况
                            if (!in_array($fntitle, $names)) {
                                $fntitleArr = explode("/", $fntitle);
                                $fntitle_   = array ();
                                $plusPrice  = 0;
                                foreach ($fntitleArr as $k => $v) {
                                    $_fntitle = array ();
                                    //如果单属性，但是也选了多个的情况，也走这里进行计算，因此要判断有没有x
                                    //if (strstr($v, '#')) {
                                    if ($v != null) {
                                        $dealv_ = explode("#", $v);    // 下单多选属性
                                        //由于多选属性又可以选择数量，因此这里还需要继续处理，分离属性名称和数量
                                        //$count  = count($dealv_);
                                        $count = 0;
                                        $dealv_nums = array(); //属性对应的数量数组
                                        foreach ($dealv_ as $dealv_k => $dealv_v) {
                                            //如果有数量，就分离出数量
                                            if (strstr($dealv_v, 'x')) {
                                                $dealv_v_ = explode("x", $dealv_v);
                                                $dealv_[$dealv_k] = $dealv_v_[0];
                                                $dealv_nums[$dealv_k] = (int)$dealv_v_[1];
                                            } else {
                                                //没有数量就把数量设为1
                                                $dealv_nums[$dealv_k] = 1;
                                            }

                                            $count += $dealv_nums[$dealv_k];
                                        }


                                        $find   = 0;
                                        foreach ($nature as $nk => $nv) {
                                            $maxchoose = $nv['maxchoose'];
                                            // 已选数量小于等于最多可选数量
                                            if ($maxchoose >= $count) {
                                                foreach ($nv['data'] as $k_ => $v_) {
                                                    if (in_array($v_['value'], $dealv_)) {
                                                        if ($v_['is_open']) {
                                                            $empty = true;
                                                            break;
                                                        } else {
                                                            //$find++;
                                                            //搜索属性对应的键名
                                                            $dealv_k = array_search($v_['value'],$dealv_);
                                                            $find += $dealv_nums[$dealv_k];
                                                            $plusPrice += (float)$v_['price']*$dealv_nums[$dealv_k];
                                                            //第一个不用加
                                                            /*if($v_['value'] != $dealv_[0]){
                                                                $plusPrice += (float)$v_['price']*$dealv_nums[$dealv_k];
                                                            }*/
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if ($find < $count) {
                                            $empty = true;
                                        }
                                        $_v = substr($v, 0, strpos($v, "#"));
                                    }/* else {
                                        $_v = $v;
                                    }*/
                                    array_push($fntitle_, $_v);
                                }

                                if ($empty) {
                                    return array (
                                        "state" => 200,
                                        "info"  => $value['title'] . "的" . $fntitle . "不存在，下单失败！"
                                    );
                                } else {
                                    //获取属性价格
                                    $_fk       = 0;
                                    $_fntitle_ = join("/", $fntitle_);
                                    foreach ($names as $_fkey => $_fvalue) {
                                        $_fvalue = trim($_fvalue);
                                        if ($_fvalue == $_fntitle_) {
                                            $_fk = $_fkey;
                                        }
                                    }
                                    //由于前面已经把属性的价格加上了，因此这里就不重复加了
                                    //$fnprice  = $prices[$_fk] + $plusPrice;
                                    $fnprice  = $plusPrice;
                                    $_fnprice = (float)($data['is_discount'] == "1" ? ($fnprice * ($data['discount_value'] / 10)) : $fnprice);

                                    $fprice     += $_fnprice;
                                    $totalPrice += $_fnprice * $fcount;
                                }

                                // 单选的情况
                            } else {
                                //获取属性价格
                                $fnprice  = $prices[array_search($fntitle, $names)];
                                $_fnprice = (float)($data['is_discount'] == "1" ? ($fnprice * ($data['discount_value'] / 10)) : $fnprice);

                                $fprice     += $_fnprice;
                                $totalPrice += $_fnprice * $fcount;
                            }
                        } else {

                            //获取属性价格
                            $fnprice  = $prices[array_search($fntitle, $names)];
                            $_fnprice = $data['is_discount'] == "1" ? ($fnprice * ($data['discount_value'] / 10)) : $fnprice;

                            $fprice     += $_fnprice;
                            $totalPrice += $_fnprice * $fcount;
                        }

                        if ($fnprice && $data['is_discount'] == "1") {
                            $food[$key]['yuanpprice'] += $fnprice * $fcount;
                            $zkytotal                 += $fnprice - $_fnprice * $fcount;  //优惠总金额加上规格商品的折扣
                        }
                    }
                }

                $food[$key]['price'] = sprintf("%.2f", $fprice);


                // 验证优惠券
                if ($quan) {
                    // 关联商品
                    if ($quan['fid'] != '') {
                        $fidArr = explode(",", $quan['fid']);
                        if (in_array($fid, $fidArr)) {
                            $foodPrice += ($price + $dabao) * $fcount;
                            $has       = true;
                        }
                    } else {
                        $has = true;
                    }
                }


            } else {
                return array ("state" => 200, "info" => $value['title'] . "已经下架，下单失败！");
            }

        }


        //优惠推荐限购
        if ($customSaleState && $has_saleRec) {
            $customSaleTimes = $customSaleTimes ? unserialize($customSaleTimes) : array ();
            if (is_array($customSaleTimes)) {

                //查找所有优惠推荐的商品
                $saleIds     = array ();
                $saleRec_ids = array ();
                $sql         = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_list` WHERE `saleRec` = 1");
                $ret         = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $key => $value) {
                        array_push($saleIds, "FIND_IN_SET(" . $value['id'] . ", `fids`)");
                        array_push($saleRec_ids, $value['id']);
                    }
                }
                $saleIds = join(' OR ', $saleIds);

                foreach ($customSaleTimes as $_t) {
                    $_stime = strtotime(date("Y-m-d", time()) . ' ' . $_t['stime'] . ':00'); //开始时间
                    $_etime = strtotime(date("Y-m-d", time()) . ' ' . $_t['etime'] . ':00'); //结束时间
                    $_count = $_t['count'];

                    if (time() > $_stime && time() < $_etime) {
                        $dealcount = 0;
                        $sql       = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `uid` = " . $uid . " AND `pubdate` >= " . $_stime . " AND `pubdate` < " . $_etime . " AND (" . $saleIds . ") AND `state` not in(0,6)");
                        $ret       = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            foreach ($ret as $_order) {
                                $_food = $_order['food'];
                                if ($_food) {
                                    $_food = unserialize($_food);
                                    foreach ($_food as $_f) {
                                        $_fid    = $_f['id'];
                                        $_fcount = $_f['count'];
                                        if (in_array($_fid, $saleRec_ids)) {
                                            $dealcount += $_fcount;
                                        }
                                    }
                                }
                            }
                        }

                        //新购买数量+当前时间段已购买数量
                        if ($_count < $saleRec_count + $dealcount) {
                            return array (
                                "state" => 200,
                                "info"  => "当前时间段" . $customSaleTitle . "商品每人限购" . $_count . ($data['unit'] ? $data['unit'] : '份') . "<br />请关注下个抢购时间段！"
                            );
                        }

                    }
                }

            }
        }


        if ($is_discount == '1' && $ordertype == 0) {
            array_push($priceinfo, array (
                "type"   => "youhui",
                "body"   => "商品打折(原价)",
                "amount" => sprintf("%.2f", $zkytotal)
            ));
        }
        // 验证优惠券
        if ($quan && $has) {
            $money = $foodPrice == 0 ? $totalPrice : $foodPrice;
            if ($money < $quan['basic_price']) {
                $quan = "";
            }
        }


        //        $pluginssql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = '13' AND `state` = 1");
        //
        //        $pluginsres = $dsql->dsqlOper($pluginssql,"results");

        $otherarr = array ();
        /*第三方配送员*/
        $otherordernum = '';
        $custom_otherpeisong = (int)$custom_otherpeisong;
        $peisong_type = (int)$shopDetail['peisong_type'];
        if ($custom_otherpeisong != 0 && !$desk && $peisong_type != 1 && $peitype != 1) {

            if ($custom_otherpeisong == 1) {
                $pluginFile = HUONIAOINC . "/plugins/13/uuPaoTui.php";
            } elseif($custom_otherpeisong == 2){
                $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
            }elseif($custom_otherpeisong == 3){
                $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
            }
            include $pluginFile;

            if (file_exists($pluginFile)) {
                if ($custom_otherpeisong == 1) {
                    /*uu跑腿*/
                    $uuPaoTuiClass = new uuPaoTui();

                    $cityname          = getCityname($shopDetail['coordY'], $shopDetail['coordX']);
                    $Calculatepricearr = array (
                        'city_name'     => $cityname,
                        'from_address'  => $shopDetail['address'],
                        'from_usernote' => $shopDetail['shopname'],
                        'from_lat'      => $shopDetail['coordX'],
                        'from_lng'      => $shopDetail['coordY'],
                        'to_address'    => $user_addr_street,
                        'to_usernote'   => $user_addr_address,
                        'to_lat'        => $user_addr_lat,
                        'to_lng'        => $user_addr_lng,
                    );

                    $results = $uuPaoTuiClass->Calculateprice($Calculatepricearr);
                    if ($results) {
                        $otherarr     = $results;
                        $delivery_fee = $results['need_paymoney'];
                    }
                } elseif($custom_otherpeisong == 2){
                    /*闪速达*/
                    $youshansudaClass = new youshansuda();

                    $paotuitype = (int)$shopDetail['paotuitype'];

                    $paramArray = array (
                        'ysshop_id'         => $shopDetail['ysshop_id'],
                        'to_name'           => $user_addr_person,
                        'to_phone'          => $user_addr_tel,
                        'to_address'        => $user_addr_street,
                        'to_detail_address' => $user_addr_address,
                        'to_lat'            => $user_addr_lat,
                        'to_lng'            => $user_addr_lng
                    );

                    $results = $youshansudaClass->calculationFrei($paramArray);
                    if (is_array($results)) {

                        $data = $results['freight_dict'];

                        $otherarr = array ();
                        if (is_array($data) && $data) {

                            foreach ($data as $k => $v) {

                                $arr = array (
                                    'ps_id'    => $v['ps_id'],
                                    'ps_name'  => $v['ps_name'],
                                    'freight'  => $v['freight_data']['freight'],
                                    'distance' => $v['freight_data']['distance'],
                                );

                                array_push($otherarr, $arr);
                            }
                        }


                        $otherordernum = $results['order_no'];
                        if ($paotuitype == 0) {
                            array_multisort(array_column($otherarr, 'freight'), SORT_ASC, $otherarr);

                            $delivery_fee = $otherarr[0]['freight'];

                            $otherarr = $otherarr[0];
                        } else {
                            $otherarr = array_column($otherarr, null, 'ps_id');

                            $delivery_fee = $otherarr[$paotuitype]['freight'];
                            $otherarr     = $otherarr[$paotuitype];

                        }
                    } else {
                        return array ("state" => 200, "info" => $results);
                    }
                }elseif($custom_otherpeisong == 3){
                    /*麦芽田*/
                    $maiyatianClass = new maiyatian();

                    $paotuitype = (int)$shopDetail['paotuitype'];

                    global $custom_map;
                    $map_type = (int)$custom_map;

                    global $cfg_map;  //系统默认地图
                    $map_type = !$map_type ? $cfg_map : $map_type;
                                
                    if($map_type == 2 || $map_type == 'baidu'){
                        $map_type = 2;
                    }
                    if($map_type == 4 || $map_type == 'amap'){
                        $map_type = 1;
                    }

                    $paramArray = array (
                        'shop_dismode'   => $shopDetail['billingtype'],
                        'shop_logistic'  => $shopDetail['specify'],
                        'shop_id'        => $shopDetail['id'],
                        'lng'            => $user_addr_lng,
                        'lat'            => $user_addr_lat,
                        'address'        => $user_addr_street . ' ' . $user_addr_address,
                        'map_type'       => $map_type
                    );

                    $maiyares = $maiyatianClass->calculationFrei($paramArray);
                    if (is_array($maiyares) && $maiyares['code'] == 1) {

                        $data = $maiyares['data']['detail'];
//                            $logisprice = $data[0]['amount'];        //  运费
                        $delivery_fee = $data[0]['amount'];
                        $otherarr = $data[0];
                    } else {
                        return array("state" => 200, "info" => $maiyares['message']);
                    }
                }
            }


        } else {
            //起送价 && 配送费
            $basicprice   = $shopDetail['basicprice'];
            $delivery_fee = $shopDetail['delivery_fee'];
            $attach_fee   = 0;
            //固定费用
            if ($shopDetail['delivery_fee_mode'] == 1 && empty($desk) && $peitype != 1) {

                if ($juli >= $shopDetail['normaljuli'] && $shopDetail['normaljuli'] != '0' && $shopDetail['normaljuli'] != '') {
                    $attach_fee = sprintf('%.2f', ceil($juli - $shopDetail['normaljuli']) * $shopDetail['chaochuprice']);

                    $delivery_fee += $attach_fee;
                }
            }
            //按区域
            if ($shopDetail['delivery_fee_mode'] == 2 && empty($desk) && $peitype != 1) {
                $prices = array ();

                //验证送货地址是否在商家的服务区域
                $service_area_data = $shopDetail['service_area_data'];
                if ($service_area_data) {
                    foreach ($service_area_data as $key => $value) {
                        $qi     = $value['qisong'];
                        $pei    = $value['peisong'];
                        $points = $value['points'];

                        $pointsArr = array ();
                        if (!empty($points)) {
                            $points = explode("|", $points);
                            foreach ($points as $k => $v) {
                                $po = explode(",", $v);
                                array_push($pointsArr, array ("lng" => $po[0], "lat" => $po[1]));
                            }

                            if (is_point_in_polygon(array ("lng" => $user_addr_lng, "lat" => $user_addr_lat),
                                $pointsArr)) {
                                array_push($prices, array ("qisong" => $qi, "peisong" => $pei));
                            }
                        }

                    }

                }

                //如果送货地址在服务区域，则将起送价和配送费更改为按区域的价格
                if ($prices) {
                    $basicprice   = $prices[0]['qisong'];
                    $delivery_fee = $prices[0]['peisong'];

                    //如果不在服务区域，提醒用户
                } else {
                    return array ("state" => 200, "info" => '送餐地址距离店铺太远，超出了商家的最大服务范围！');
                }

            }

            //按距离
            if ($shopDetail['delivery_fee_mode'] == 3 && $shopDetail['range_delivery_fee_value'] && empty($desk) && $peitype != 1) {
                foreach ($shopDetail['range_delivery_fee_value'] as $key => $value) {
                    if ($value[0] <= $juli && $value[1] >= $juli) {
                        $basicprice   = $value[3];
                        $delivery_fee = $value[2];
                    }
                }
            }

            if ($totalPrice < $basicprice && empty($desk) && $peitype != 1) {
                return array ("state" => 200, "info" => "订单金额未达到起送价" . $basicprice . "下单失败！");
            }
        }

        //免配送费规则
        if ($shopDetail['delivery_fee_mode'] == 1 && $shopDetail['delivery_fee_type'] == 2 && $totalPrice >= $shopDetail['delivery_fee_value'] || !empty($desk) || $peitype == 1) {
            $delivery_fee = 0;
        }


        //打折优惠
        // if ($shopDetail['is_discount'] && $shopDetail['discount_value'] < 10&&) {
        //     $totalPrice = $totalPrice * $shopDetail['discount_value'] / 10;

        //     array_push($priceinfo, array(
        //         "type" => "youhui",
        //         "body" => $shopDetail['discount_value'] . "折优惠活动",
        //         "amount" => sprintf("%.2f", $totalPrice / $shopDetail['discount_value'] * 10 - $totalPrice)
        //     ));

        //     // array_push($priceinfo, $shopDetail['discount_value'] . "折优惠活动");
        // }


        //满减
        $promotions_title = "";
        $promotions       = 0;
        if ($shopDetail['open_promotion'] && $shopDetail['promotions'] && $ordertype == 0) {
            foreach ($shopDetail['promotions'] as $key => $value) {
                if ($value[0] > 0 && $value[0] <= ($totalPrice - $zktotal)) {
                    $promotions_title = $value[0];
                    $promotions       = $value[1];
                }
            }
        }

        if ($promotions > 0 && $ordertype == 0) {

            array_push($priceinfo, array (
                "type"   => "manjian",
                "body"   => "满" . $promotions_title . "减" . $promotions . echoCurrency(array ("type" => "short")),
                "amount" => sprintf("%.2f", $promotions)
            ));

            // array_push($priceinfo, "满" . $promotions_title . "减" . $promotions . "元");
        }


        //首单减免
        include(HUONIAOROOT . "/include/config/waimai.inc.php");

        $isFirstOrder = false;

        $where          = $custom_firstOrderType == 0 ? "`uid` = $uid AND `state` != 0 AND `state` != 6" : "`uid` = $uid AND `sid` = $shop AND `state` != 0 AND `state` != 6";
        $first_discount = 0;
        $sql            = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE " . $where);
        $ret            = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            $isFirstOrder = true;
            if ($shopDetail['is_first_discount'] && $shopDetail['first_discount'] > 0 && $ordertype == 0) {
                $first_discount = $shopDetail['first_discount'];

                array_push($priceinfo, array (
                    "type"   => "shoudan",
                    "body"   => "首单减免",
                    "amount" => sprintf("%.2f", $first_discount)
                ));

            }
        }


        //增值服务
        $nowTime          = date("H:i");
        $addservice_title = "";
        $addservice_price = $addservice_priceall = 0;
        if ($shopDetail['open_addservice'] && $shopDetail['addservice'] && $ordertype == 0) {
            foreach ($shopDetail['addservice'] as $key => $value) {
                if ($value[1] < $nowTime && $value[2] > $nowTime && $value[3] > 0) {
                    $addservice_title = $value[0];
                    $addservice_price = $value[3];

                    $addservice_priceall += $value[3];
                    array_push($priceinfo, array (
                        "type"   => "fuwu",
                        "body"   => $addservice_title,
                        "amount" => sprintf("%.2f", $addservice_price)
                    ));

                }
            }
        }


        // 会员优惠
        $auth_priceinfo  = array ();
        $aus_courier     = false;
        $auth_shop_price = $auth_delivery_price = 0; // 会员享受的优惠金额

        $auth_delivery_isCount = false;     // 配送费是计次模式
        if ($userinfolevel && $ordertype == 0) {
            $sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = " . $userinfolevel);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $privilege = unserialize($ret[0]['privilege']);

                // 配送费
                $value = $privilege['delivery'];
                if ($delivery_fee > 0) {
                    $ok = false;
                    // 打折
                    if ($value[0]['type'] == 'discount') {
                        if ($value[0]['val'] > 0 && $value[0]['val'] < 10) {
                            $ok = true;
                        }
                        // 计次
                    } else {
                        if ($value[0]['type'] == 'count') {
                            if ($value[0]['val'] > 0 && $userinfodelivery_count > 0) {
                                $ok                    = true;
                                $auth_delivery_isCount = true;
                            }
                        }
                    }

                    if ($ok && $peitype != 1) {
                        if ($value[0]['type'] == 'count') {
                            //                            $auth_delivery_price = $delivery_fee > 3 ? 3 : $delivery_fee;
                            $auth_delivery_price = $delivery_fee;
                        } else {
                            $auth_delivery_price = $delivery_fee * (1 - $value[0]['val'] / 10);
                        }
                        $vippriceinfo = $vippriceinfo != '' ? unserialize($vippriceinfo) : '';
                        array_push($auth_priceinfo, array (
                            "level"  => $userinfolevel,
                            "type"   => "auth_peisong",
                            "body"   => $openlevel == 1 && $ordertype == 0 ? $vippriceinfo['name'] : $userinfo['levelName'] . "特权-配送费优惠",
                            "amount" => sprintf("%.2f", $auth_delivery_price)
                        ));
                    }
                }
                // 生日特权
                // $value = $privilege['birthday'];
                // if(!empty($userinfo['birthday']) && date('md', $userinfo['birthday']) == date('md')) {
                //     if($value['type'] && $value['val']['discount'] > 0 && $value['val']['discount'] < 10){
                //         $limit = $value['val']['limit'];
                //         // 有总金额限制
                //         if($limit > 0){
                //             // 今日订单总金额
                //             $today_amount = todayOrderAmount($uid);
                //             // 超出限额
                //             if($totalPrice + $today_amount > $limit){
                //                 $auth_shop_can = $limit - $today_amount;

                //                 $auth_shop_price = $auth_shop_can * (1 - $value['val']['discount'] / 10);
                //             }else{
                //                 $auth_shop_price = $totalPrice * (1 - $value['val']['discount'] / 10);
                //             }
                //         }else{
                //             $auth_shop_price = $totalPrice * (1 - $value['val']['discount'] / 10);
                //         }

                //         array_push($auth_priceinfo, array(
                //             "level" => $userinfo['level'],
                //             "type" => "auth_shop",
                //             "body" => $userinfo['levelName']."特权-生日商品原价优惠",
                //             "amount" => sprintf("%.2f", $auth_shop_price)
                //         ));
                //     }
                // }

                // 商品,并且不是生日
                // if(!$auth_shop_price){
                $newtotalPrice = $totalPrice;
                // $value = $privilege['waimai'];
                if ($waimaidiscount > 0 && $waimaidiscount < 10 && $ordertype == 0) {

                    if ($is_discount == 1) {
                        $newtotalPrice = $totalPrice - $zktotal; //这里主要是计算商品折扣力度大的时候 跟会员价格合并运算时候的问题(某个商品折扣力度大，该商品使用的是商品折扣的优惠，其他商品没设置商品折扣如果是会员就会按照会员价格计算,但是在总的计算价格的时候要减去折扣价格)

                    }

                    $auth_waimai_price = $newtotalPrice * (1 - $waimaidiscount / 10);

                    array_push($auth_priceinfo, array (
                        "level"  => $userinfolevel,
                        "type"   => "auth_waimai",
                        "body"   => $userinfo['levelName'] . "特权-商品原价优惠",
                        "amount" => sprintf("%.2f", $auth_waimai_price)
                    ));
                }
                // }
                // // 指定骑手
                // $value = $privilege['qishou'];
                // if($value['type'] == "1"){
                //     $aus_courier = true;
                // }

            }
        }
        //        var_dump($delivery_fee,$auth_delivery_price);die;
        //应付价格  =  订单总价格（商品数量*商品单价+商品属性总价）*折扣 + 打包费 + 配送费 - 首单减免 - 满减价格（总价*折扣基础上满减） + 增值服务费 - 优惠券+ 准时宝 + 开通vip价格
        //         var_dump( $totalPrice , $dabaoPrice ,$delivery_fee , $auth_delivery_price ,$first_discount , $promotions , $addservice_price , $zsbprice ,$auth_waimai_price , $vipprice);die;
        if (!empty($desk)) { //
            $dabaoPrice = 0;
        }
        // var_dump(sprintf("%.2f", $dabaoPrice) .' + '. sprintf("%.2f", $delivery_fee) . ' - ' . sprintf("%.2f", $auth_delivery_price) . ' - ' . sprintf("%.2f", $first_discount) . ' - ' . sprintf("%.2f", $promotions) .' + '. sprintf("%.2f", $addservice_priceall) .' + '. sprintf("%.2f", $zsbprice) . ' - ' . sprintf("%.2f", $auth_waimai_price));
        $totalPrice += sprintf("%.2f", $dabaoPrice) + sprintf("%.2f", $delivery_fee) - sprintf("%.2f", $auth_delivery_price) - sprintf("%.2f", $first_discount) - sprintf("%.2f", $promotions) + sprintf("%.2f", $addservice_priceall) + sprintf("%.2f", $zsbprice) - sprintf("%.2f", $auth_waimai_price);

        
        //读取店铺所在分站配置，进行恶劣天气配送费的计算，预定的订单不考虑恶劣天气
        $badWeatherPrice = 0;
        if ($shopDetail['yingye'] == 1) {
            $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $shopDetail['cityid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret != null && is_array($ret)) {
                $configArr = $ret[0]['config'];
                if ($configArr != null) {
                    $configArr = unserialize($configArr);
    
                    //如果有外卖的配置
                    if (isset($configArr['waimai'])) {
                        $configArr = $configArr['waimai'];
                        //如果有开启恶劣天气配送
                        if (isset($configArr['badWeatherState']) && $configArr['badWeatherState'] == 1) {
                            $badWeatherMoney = (float)$configArr['badWeatherMoney'];
                            $badWeatherStart = $configArr['badWeatherStart'];
                            $badWeatherEnd = $configArr['badWeatherEnd'];
    
                            //如果配送费大于0，而且有时间范围
                            if ($badWeatherMoney > 0 && $badWeatherStart != null && $badWeatherEnd != null) {
                                //判断当前时间是否在时间范围内
                                $nowTime = time();
                                $startTime = strtotime($badWeatherStart);
                                $endTime = strtotime($badWeatherEnd);
    
                                if ($nowTime >= $startTime && $nowTime <= $endTime) {
                                    $badWeatherPrice = sprintf("%.2f", $badWeatherMoney);
                                }
                            }
                        }
                    }
                }
            }
        }


        //+ $vipprice  这里计算有问题 可能订单使用一系列 优惠为负数
        if ($dabaoPrice) {

            array_push($priceinfo, array (
                "type"   => "dabao",
                "body"   => "打包费",
                "amount" => sprintf("%.2f", $dabaoPrice)
            ));

        }
        if ($delivery_fee) {

            array_push($priceinfo, array (
                "type"   => "peisong",
                "body"   => "配送费",
                "amount" => sprintf("%.2f", $delivery_fee)
            ));

        }
        if ($attach_fee) {
            array_push($priceinfo, array (
                "type"   => "peisong_attach",
                "body"   => "配送费距离加成",
                "amount" => sprintf("%.2f", $attach_fee)
            ));
        }
        if ($quan && $ordertype == 0) {
            $totalPrice = $totalPrice - sprintf("%.2f", $quan['money']);

            array_push($priceinfo, array (
                "type"       => "quan",
                "body"       => "使用优惠券",
                "membertype" => $openlevelquan,
                "amount"     => "-" . $quan['money']
            ));
        }
        if ($auth_priceinfo) {
            $priceinfo = array_merge($priceinfo, $auth_priceinfo);
        }


        //如果恶劣天气配送费大于0，则计算到总价格并添加到价格列表中
        if ($badWeatherPrice > 0) {
            $totalPrice += $badWeatherPrice;
            array_push($priceinfo, array (
                "type"   => "peisong_badWeather",
                "body"   => "恶劣天气配送费",
                "amount" => $badWeatherPrice
            ));
        }


        if ($shopDetail['open_fullcoupon'] && $shopDetail['fullcoupon']) {
            $fullcoupon = unserialize($shopDetail['fullcoupon']);
            $key_       = "";
            $full_      = 0;
            foreach ($fullcoupon as $key => $value) {
                if ($value[0] <= $totalPrice && $value[0] > $full_) {
                    $key_  = $key;
                    $full_ = $value[0];
                }
            }
            if ($key_ !== "") {
                $giveQuanid = $fullcoupon[$key_][1];
            }
        }
        $ptprofit = 0;
        if (!empty((float)$shopDetail['ptprofit']) && $desk == '') {

            $ptprofitmoney = sprintf("%.2f", ($totalPrice - ((float)$delivery_fee - $auth_delivery_price)) * $shopDetail['ptprofit'] / 100);
            $totalPrice = sprintf("%.2f", $totalPrice) + $ptprofitmoney;
        }

        $totalPrice = $totalPrice < 0 ? 0 : $totalPrice;
        $totalPrice += sprintf("%.2f", $vipprice);  //vip 价格

        $pricepoint = 0;
        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $userpoint = $userinfo['point'];
        global $cfg_pointRatio;
        global $cfg_pointName;
        if ($usePinput == 1) {
            $point_price = getJifen('waimai', $totalPrice);  //抵扣金钱
            $pricepoint  = $point_price * $cfg_pointRatio;
            if ($pricepoint > $userpoint) {
                $pricepoint  = $userpoint;
            }
        }

        //减去积分抵扣
        $totalPrice -= sprintf("%.2f", $pricepoint / $cfg_pointRatio);


        // 货到付款验证店铺配置
        if ($paytype == 1) {
            if (strstr($shopDetail['paytype'], "1") === false) {
                return array ("state" => 200, "info" => "商家不支持货到付款，下单失败！");
            }
            if ($shopDetail['offline_limit'] && $shopDetail['pay_offline_limit'] < $totalPrice) {
                return array (
                    "state" => 200,
                    "info"  => "商家设置了货到付款限制金额为：￥" . $shopDetail['pay_offline_limit'] . "，下单失败！"
                );
            }
        }
        $time = GetMkTime(time());
        //当天
        $todayk = strtotime(date('Y-m-d'));

        //当天结束
        $todaye = strtotime(date('Y-m-d 23:59:59'));

        //生成订单号
        $newOrdernum = create_ordernum();
        /*获取当前店铺当天订单数目 在线支付或余额支付state=2,货到付款state=0
        $paytypeState = "( ((`paytype` = 'alipay' || `paytype` = 'wxpay' || `paytype` = 'money') && `state` = 2) || (`paytype` = 'delivery' && `state` = 0) )";*/
        $paytypeState     = "`state` != 0 AND `state` != 6";
        $sql              = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__waimai_order_all` WHERE `sid` = $shop AND $paytypeState AND `pubdate` > $todayk AND `pubdate` < $todaye ");
        $no               = $dsql->dsqlOper($sql, "results");
        $no               = (int)$no[0]['totalCount'] + 1;
        $newOrdernumstore = date("Ymd") . "-" . $no;

        $pubdate   = GetMkTime(time());
        $fids      = join(",", $fids);
        $food      = serialize($food);
        $preset    = serialize($preset);
        $priceinfo = serialize($priceinfo);
        $address   = $user_addr_street . " " . $user_addr_address;

        $usequan = $quan ? $quan['id'] : 0;

        $is_repeat = false;
        //查询是否下过单，防止重复下单
        $sql = $dsql->SetQuery("SELECT `id`, `pubdate` FROM `#@__waimai_order_all` WHERE `uid` = $uid AND `sid` = $shop AND `fids` = '$fids' AND `food` = '$food' AND `amount` = $totalPrice AND `del` = 0 ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($pubdate - $ret[0]['pubdate'] < 60){
                return array ("state" => 200, "info" => "重复下单！");
            }else{
                //如果不在1分钟内，直接重置结果，因为下面条件判断的SQL语句有问题，导致新订单使用老订单的数据，出现订单自动完成的问题
                $ret = '';
            }
        }
        /*防止重复下单回导致以前的订单支付成功丢失的情况,现在先取消掉*/
        // 由于未知原因，会出现每隔几秒钟重复下单的情况，这里需要再次启用重复下单的验证！
        // $ret = '';


        if ($shopDetail['instorestatus'] == 1 && $shopDetail['underpay'] == 1 && $paytype == '' && $peitype != 1) {
            $paytype = 'underpay';
        }
        if ($peitype != 1) {
            $selftime = 0;
        }

        if (is_array($vippriceinfo)) {
            $vippriceinfo = serialize($vippriceinfo);
        }

        if ($otherarr && is_array($otherarr)) {
            $otherarr = serialize($otherarr);
        } else {
            $otherarr = '';
        }

        //初始化日志
        include_once(HUONIAOROOT."/api/payment/log.php");
        $_waimaiOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/waimaiOrder/'.date('Y-m-d').'.log', true);

        if ($ret) {
            $is_repeat = true;

            $id  = $ret[0]['id'];
            $aid = $id;

            //外卖分表

            $sub         = new SubTable('waimai_order', '#@__waimai_order');
            $break_table = $sub->getSubTableById($id);

            $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `ordernum` = '$newOrdernum',`ordernumstore` = '$newOrdernumstore', `person` = '$user_addr_person', `tel` = '$user_addr_tel', `address` = '$address', `zsbprice` = '$zsbprice',`vippriceinfo` ='$vippriceinfo',`is_vipprice` = '$openlevel',`lng` = '$user_addr_lng', `lat` = '$user_addr_lat', `paytype` = '$paytype', `preset` = '$preset', `note` = '$note', `pubdate` = '$pubdate', `otherparam` ='$otherarr',`usequan` = $usequan,`otherordernum` = '$otherordernum' WHERE `id` = $id");
            $res = $dsql->dsqlOper($sql, "update");
            // $aid = $dsql->dsqlOper($sql, "lastid");

            $_waimaiOrderLog->DEBUG("更新订单:" . $sql);

            if ($res != 'ok') {
                return array ("state" => 200, "info" => "下单失败！");
            }

        } else {
            $ptprofitmoney = (float)sprintf("%.2f", $ptprofitmoney);
            $sub = new SubTable('waimai_order', '#@__waimai_order');
            $insert_table_name = $sub->getLastTable();
            $sql = $dsql->SetQuery("INSERT INTO `" . $insert_table_name . "` (`uid`, `sid`, `ordernum`, `ordernumstore`, `state`, `fids`, `food`, `person`, `tel`, `address`, `lng`, `lat`, `paytype`, `amount`,`zsbprice`,`is_vipprice`,`vippriceinfo` ,`priceinfo`, `preset`, `note`, `pubdate`, `usequan`, `peisongidlog`, `peisongpath`,`desk`,`ordertype`,`selftime`,`ptprofit`,`otherparam`,`point`,`otherordernum`,`reservesongdate`) VALUES ('$uid', '$shop', '$newOrdernum', '$newOrdernumstore', '0', '$fids', '$food', '$user_addr_person', '$user_addr_tel', '$address', '$user_addr_lng', '$user_addr_lat', '$paytype', '$totalPrice', '$zsbprice','$openlevel','$vippriceinfo','$priceinfo', '$preset', '$note', '$pubdate', '$usequan', '', '','$desk','$ordertype','$selftime','$ptprofitmoney','$otherarr','$pricepoint','$otherordernum','$orderTime')");
            $aid = $dsql->dsqlOper($sql, "lastid");

            $_waimaiOrderLog->DEBUG("创建订单:" . $sql);

            $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
            $res = $dsql->dsqlOper($sql, "results");
            $breakup_table_count = $res[0]['total'];
            if ($breakup_table_count >= $sub->MAX_SUBTABLE_COUNT) {
                $new_table = $sub->createSubTable($aid); //创建分表并保存记录
            }

            if (!is_numeric($aid)) {
                return array ("state" => 200, "info" => "下单失败！");
            }
        }


        $pubdate = GetMkTime(time());
        // 新订单满送
        if (!$ret && $giveQuanid) {
            // 查询优惠券
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `id` = $giveQuanid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $data = $ret[0];
                foreach ($data as $key => $value) {
                    $$key = $value;
                }

                if ($deadline_type == 0) {
                    $day      = date('Y-m-d', $pubdate);
                    $time     = $day . " + " . ($validity + 1) . " day";
                    $deadline = strtotime($time);
                }
                if ($shoptype == 0) {
                    $shopids = "";
                }
                if ($is_relation_food == 0) {
                    $fid = "";
                }

                $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_quanlist` (`qid`, `userid`, `name`, `des`, `money`, `basic_price`, `deadline`, `shopids`, `fid`, `pubdate`, `state`, `from`) VALUES ('$giveQuanid', '$uid', '$name', '$des', '$money', '$basic_price', '$deadline', '$shopids', '$fid', '$pubdate', -1, '$aid')");
                $aid = $dsql->dsqlOper($sql, "lastid");
            }

        }

        // 直接更新优惠券状态，订单id在支付完成后更新
        if ($usequan && $quantype != 1) {
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 1, `usedate` = '$pubdate' WHERE `id` = $usequan");
            $dsql->dsqlOper($sql, "update");
        }

        // 会员特权，配送费优惠次数-1
        if (!$is_repeat && $auth_delivery_isCount && $openlevel != 1) {
            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `delivery_count` = `delivery_count` - 1 WHERE `id` = $uid");
            $dsql->dsqlOper($sql, "update");
        }
        //货到付款
        if ($paytype == 1) {
            $newOrdernum = "delivery|" . $newOrdernum;

            return $newOrdernum;
        }
        if ($shopDetail['instorestatus'] == 1 && $shopDetail['underpay'] == 1 && isMobile() && $desk != '') {
            $this->param = array (
                "paytype"  => $paytype,
                "ordernum" => $newOrdernum
            );
            $this->paySuccess();
            // $param = array(
            //     "service" => "waimai",
            //     "template" => "payreturn",
            //     "ordernum" => $ordernum
            // );
            // $url   = getUrlPath($param);
            // header("location:" . $url);
            return '00000000000000000000000000'; //线下支付
            die;
        }
        if (sprintf("%.2f",$totalPrice) == 0) {

            //查询订单信息
            $paytype  = '';
            $archives = $dsql->SetQuery("SELECT  `point`, `balance` FROM `#@__waimai_order_all` WHERE `ordernum` = '$newOrdernum'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $upoint   = $res['point'];    //使用的积分
            $ubalance = $res['balance'];  //使用的余额

            //扣除会员积分
            if (!empty($upoint) && $upoint > 0) {
                $paytype = "integral";
            }

            $date = GetMkTime(time());

            $paysql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$newOrdernum'");
            $payre  = $dsql->dsqlOper($paysql, "results");
            if (!empty($payre)) {

                if ($uid > 0) {
                    $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'waimai',  `uid` = $uid, `amount` = 0, `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$newOrdernum' AND `ordertype` = 'waimai'");
                    $dsql->dsqlOper($archives, "update");
                }

            } else {
                $param = array (
                    "type" => "waimai"
                );
                $body  = serialize($param);
                if ($uid > 0) {
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$newOrdernum', '$uid', '$body', 0, '$paytype', 1, $date)");
                    $dsql->dsqlOper($archives, "results");
                }

            }

            //执行支付成功的操作
            $this->param = array (
                "paytype"  => $paytype,
                "ordernum" => $newOrdernum
            );
            $this->paySuccess();

            // $param = array(
            //     "service" => "waimai",
            //     "template" => "payreturn",
            //     "ordernum" => $newOrdernum
            // );

            //跳订单详情
            $param = array (
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail-waimai",
                "id"       => $aid
            );
            $url   = getUrlPath($param);

            //支付成功后跳转页面
            global $cfg_payReturnType;
            global $cfg_payReturnUrlPc;
            global $cfg_payReturnUrlTouch;
            //
            if ($cfg_payReturnType) {

                //移动端自定义跳转链接
                if (isMobile() && $cfg_payReturnUrlTouch) {
                    $url = $cfg_payReturnUrlTouch;
                }

                //电脑端自定义跳转链接
                if (!isMobile() && $cfg_payReturnUrlPc) {
                    $url = $cfg_payReturnUrlPc;
                }
            }

            //            //代付的跳到代付页面
            //            if($peerpay){
            //
            //                $param = array(
            //                    "service"  => "member",
            //                    "type"  => "user",
            //                    "template" => "daipay_return",
            //                    "param" => "module=waimai&ordernum=" . $ordernum
            //                );
            //                $url   = getUrlPath($param);
            //
            //                header("location:" . $url);
            //            }else{
            //                header("location:" . $url);
            //            return  array(['state'=>1,'url'=>$url]);

            $newOrdernum = "ok|" . $url;
            return $newOrdernum;

            //            }

        }

        if ($peerpay) {

            $param = array (
                "service"  => "member",
                "type"     => "user",
                "template" => "daipay",
                "param"    => "module=waimai&ordernum=" . $newOrdernum
            );
            $url   = getUrlPath($param);

            return "peerpay|" . $url;
        }
        $param = array (
            "type" => "waimai"
        );

        // $archives   = $dsql->SetQuery("SELECT `amount`,`point` FROM `#@__waimai_order_all` WHERE `id` = '$aid'");
        // $results    = $dsql->dsqlOper($archives, "results");
        // $pricepoint = $results[0]['point'];
        // $totalPrice -= $pricepoint / $cfg_pointRatio;
        $order = createPayForm("waimai", $newOrdernum, $totalPrice, '', "外卖订单", $param, 1);

        $timeout = GetMkTime(time()) + 1800;

        $order['timeout'] = $timeout;

        $_waimaiOrderLog->DEBUG("支付数据:" . json_encode($order, JSON_UNESCAPED_UNICODE));

        return $order;


    }

    /**
     * 判断是不是首单
     *
     * @return array
     */
    public function isFirstOrder()
    {
        global $dsql;
        global $userLogin;
        //        $uid = 29;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }

        $shop = (int)$this->param['shop'];
        //店铺详细信息
        $this->param = $shop;
        $shopDetail  = $this->storeDetail();

        if ($shopDetail['del']) {
            return array ("state" => 200, "info" => '店铺不存在');
        }

        if (!$shopDetail['status']) {
            return array ("state" => 200, "info" => '该店铺关闭了，您暂时无法在该店铺下单。');
        }

        if ($shopDetail['status'] && !$shopDetail['ordervalid']) {
            return array ("state" => 200, "info" => '该店铺关闭了下单，您暂时无法在该店铺下单。');
        }

        if (!$shopDetail['yingye']) {
            if (!$shopDetail['yingyeWeek']) {
                return array ("state" => 200, "info" => '该店铺今天暂停营业！');
            } else {
                return array ("state" => 200, "info" => '该店铺不在营业时间，您暂时无法在该店铺下单！');
            }
        }
        //首单减免
        include(HUONIAOROOT . "/include/config/waimai.inc.php");

        $isFirstOrder = false;

        $where          = $custom_firstOrderType == 0 ? "`uid` = $uid AND `state` != 0 AND `state` != 6" : "`uid` = $uid AND `sid` = $shop AND `state` != 0 AND `state` != 6";
        $first_discount = 0;
        $sql            = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE " . $where);
        $ret            = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            $isFirstOrder = true;
            return array ("state" => 200, "info" => '1');
        } else {
            return array ("state" => 200, "info" => '0');
        }
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

        $ordernum     = $this->param['ordernum'];
        $paytype      = $this->param['paytype'];
        $check        = (int)$this->param['check'];
        $usePinput    = $this->param['usePinput'];
        $useBalance   = $this->param['useBalance'];
        $balance      = (float)$this->param['balance'];
        $paypwd       = $this->param['paypwd'];      //支付密码
        $peerpay      = (int)$this->param['peerpay'];  //是否代付
        $orderfinal   = (int)$this->param['orderfinal'];  //0 个人中心订单预支付,1-发起支付
        $peerpayfinal = (int)$this->param['peerpayfinal'];  //0 个人中心订单预支付,1-发起支付

        $payTotalAmount = $this->checkPayAmount();

        $userid = $userLogin->getMemberID();
        if ($userid == -1 && !$peerpay) {
            if ($check) {
                return array ("state" => 200, "info" => "登陆超时");
            } else {
                die("登陆超时");
            }
        }

        //代付人
        if ($peerpay) {
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `peerpay` = $userid WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($sql, "update");
        } else {
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `peerpay` = 0 WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($sql, "update");
        }

        if ($ordernum) {

            if ($peerpay) {
                $sql = $dsql->SetQuery("SELECT o.`id`, o.`sid`, o.`uid`, o.`amount`,o.`point`,o.`ordernumstore`, o.`usequan`, o.`food`, o.`priceinfo`,o.`pubdate`, s.`shopname`, s.`bind_print`, s.`print_config`, s.`print_state` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`state` = 0 AND `ordernum` = '$ordernum'");
            } else {
                $sql = $dsql->SetQuery("SELECT o.`id`, o.`sid`, o.`uid`, o.`amount`,o.`point`,o.`ordernumstore`, o.`usequan`, o.`food`, o.`priceinfo`,o.`pubdate`, s.`shopname`, s.`bind_print`, s.`print_config`, s.`print_state` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`uid` = $userid AND o.`state` = 0 AND `ordernum` = '$ordernum'");
            }
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data          = $ret[0];
                $id            = $data['id'];
                $uid           = $data['uid'];
                $sid           = $data['sid'];
                $usequan       = $data['usequan'];
                $totalPrice    = $data['amount'];
                $shopname      = $data['shopname'];
                $bind_print    = $data['bind_print'];
                $print_config  = $data['print_config'];
                $print_state   = $data['print_state'];
                $ordernumstore = $data['ordernumstore'];
                $food          = $data['food'];
                $pubdate       = $data['pubdate'];
                $priceinfo     = $data['priceinfo'];
                $point         = $data['point'];


                $date = GetMkTime(time());

                /*
                    如果订单金额小于等于0或者支付方式为余额付款|货到付款，直接更新订单状态，并跳转至订单详情页
                    或者支付方式为货到付款，跳转至订单详情页
                */

                //查询会员信息
                if ($userid == -1) {
                    $usermoney = 0;
                    $userpoint = 0;
                } else {
                    $userinfo  = $userLogin->getMemberInfo();
                    $usermoney = $userinfo['money'];
                    $userpoint = $userinfo['point'];
                }

                $tit      = array ();
                $useTotal = 0;

                /*
                 * 2021-1-11 支付方式新增积分支付
                 *
                 * */
                //外卖分表
                $sub         = new SubTable('waimai_order', '#@__waimai_order');
                $break_table = $sub->getSubTableById($id);

                //如果有使用积分或余额则更新订单内容的价格策略
                if (!empty($point) || ($useBalance && !empty($balance))) {

                    $pointMoney   = $usePinput ? $point / $cfg_pointRatio : 0;    // swa190326
                    $balanceMoney = $balance;
                    $oprice       = $totalPrice;

                    $usePointMoney   = 0;
                    $useBalanceMoney = 0;


                    //先判断积分是否足够支付总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.积分总额减去用掉的
                    //3.记录已经使用的积分
                    if ($oprice < $pointMoney) {
                        $pointMoney    -= $oprice;
                        $usePointMoney = $oprice;
                        $oprice        = 0;
                        //积分不够支付再判断余额是否足够
                        //如果积分不足以支付总价：
                        //1.总价减去积分抵扣掉的部部分
                        //2.积分总额设置为0
                        //3.记录已经使用的积分
                    } else {
                        $oprice        -= $pointMoney;
                        $usePointMoney = $pointMoney;
                        $pointMoney    = 0;
                        //验证余额是否足够支付剩余部分的总价
                        //如果足够支付：
                        //1.把还需要支付的总价重置为0
                        //2.余额减去用掉的部分
                        //3.记录已经使用的余额
                        if ($oprice < $balanceMoney) {
                            $balanceMoney    -= $oprice;
                            $useBalanceMoney = $oprice;
                            $oprice          = 0;
                            //余额不够支付的情况
                            //1.总价减去余额付过的部分
                            //2.余额设置为0
                            //3.记录已经使用的余额
                        } else {
                            $oprice          -= $balanceMoney;
                            $useBalanceMoney = $balanceMoney;
                            $balanceMoney    = 0;
                        }
                    }
                    $oprice      = sprintf("%.2f", $oprice);
                    $pointMoney_ = $usePointMoney * $cfg_pointRatio;
                    $archives    = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `balance` = '$useBalanceMoney', `payprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");

                    //如果没有使用积分或余额，重置积分&余额等价格信息
                } else {
                    $archives = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `balance` = '0', `payprice` = '$totalPrice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                }


                //判断是否使用积分，并且验证剩余积分


                global $cfg_pointName;
                if (!empty((float)$point)) {
                    $tit[] = "integral";
                }

                //判断是否使用余额，并且验证余额和支付密码
                if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

                    if (!empty($balance) && empty($paypwd)) {
                        if ($check) {
                            return array ("state" => 200, "info" => "请输入支付密码！");
                        } else {
                            die("请输入支付密码！");
                        }
                    }

                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res      = $results[0];
                    $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
                    if ($res['paypwd'] != $hash) {
                        if ($check) {
                            return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
                        } else {
                            die("支付密码输入错误，请重试！");
                        }
                    }

                    //验证余额
                    if ($usermoney < $balance) {
                        if ($check) {
                            return array ("state" => 200, "info" => "您的余额不足，支付失败！");
                        } else {
                            die("您的余额不足，支付失败！");
                        }
                    }

                    $useTotal += $balance;
                    $tit[]    = "money";

                }


                // 使用了余额
                if ($useTotal) {

                    if ($useTotal > $totalPrice) {
                        if ($check) {
                            return array (
                                "state" => 200,
                                "info"  => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit)
                            );
                        } else {
                            die("您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
                        }

                        // 余额不足
                    } else {
                        if ($useTotal < $totalPrice) {
                            if ($paytype == "delivery") {
                                if ($check) {
                                    return array ("state" => 200, "info" => "请选择在线支付方式！");
                                } else {
                                    die("请选择在线支付方式！");
                                }
                            }
                        }
                    }
                }

                $amount = $totalPrice - $useTotal;

                if ($amount > 0 && (empty($paytype) && $orderfinal == 0)) {
                    if ($check) {
                        return array ("state" => 200, "info" => "请选择支付方式！");
                    } else {
                        die("请选择支付方式！");
                    }
                }

                if ($check) {
                    return "ok";
                }

                $param = array (
                    "type" => "waimai"
                );

                /*个人中心订单支付 预下单*/
                if ($orderfinal == 1 && $peerpayfinal == 0) {

                    $order = createPayForm("waimai", $ordernum, $payTotalAmount, '', "外卖订单", $param, 1);

                    $timeout = $pubdate + 1800;

                    $order['timeout'] = $timeout;


                    return $order;
                }

                // 需要支付的金额大于0并且不是货到付款，跳转至第三方支付页面
                if ($payTotalAmount > 0 && $paytype != "delivery") {

                    return createPayForm("waimai", $ordernum, $payTotalAmount, $paytype, "外卖订单", $param);

                    // 余额支付或者货到付款
                } else {

                    $paytype = $paytype == "delivery" ? "delivery" : join(",", $tit);

                    $paysql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                    $payre  = $dsql->dsqlOper($paysql, "results");
                    if (!empty($payre)) {

                        if ($userid > 0) {
                            $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'waimai',  `uid` = $userid, `amount` = 0, `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'waimai'");
                            $dsql->dsqlOper($archives, "update");
                        }

                    } else {

                        $body = serialize($param);
                        if ($userid > 0) {
                            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
                            $dsql->dsqlOper($archives, "results");
                        }

                    }

                    //执行支付成功的操作
                    $this->param = array (
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();

                    // $param = array(
                    //     "service" => "waimai",
                    //     "template" => "payreturn",
                    //     "ordernum" => $ordernum
                    // );
                    //跳订单详情
                    $param = array (
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail-waimai",
                        "id"       => $id
                    );
                    $url   = getUrlPath($param);

                    //支付成功后跳转页面
                    global $cfg_payReturnType;
                    global $cfg_payReturnUrlPc;
                    global $cfg_payReturnUrlTouch;

                    if ($cfg_payReturnType) {

                        //移动端自定义跳转链接
                        if (isMobile() && $cfg_payReturnUrlTouch) {
                            $url = $cfg_payReturnUrlTouch;
                        }

                        //电脑端自定义跳转链接
                        if (!isMobile() && $cfg_payReturnUrlPc) {
                            $url = $cfg_payReturnUrlPc;
                        }
                    }

                    //代付的跳到代付页面
                    if ($peerpay) {

                        $param = array (
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "daipay_return",
                            "param"    => "module=waimai&ordernum=" . $ordernum
                        );
                        $url   = getUrlPath($param);

                    }

                    if($paytype == "delivery" && !isMobile()){
                        header('location:' . $url);
                        die;
                    }

                    return $url;
                }

            } else {
                if ($check) {
                    return array ("state" => 200, "info" => "订单不存在或已支付");
                } else {
                    // $param = array(
                    //     "service" => "waimai",
                    //     "template" => "index"
                    // );
                    // $url   = getUrlPath($param);
                    // header("location:" . $url);

                    // $param = array(
                    //     "service" => "waimai",
                    //     "template" => "payreturn",
                    //     "ordernum" => $ordernum
                    // );
                    //跳订单详情
                    $param = array (
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail-waimai",
                        "id"       => $id
                    );
                    $url   = getUrlPath($param);
                    header("location:" . $url);

                    die();
                }
            }

        } else {
            if ($check) {
                return array ("state" => 200, "info" => "订单不存在");
            } else {
                $param = array (
                    "service"  => "waimai",
                    "template" => "index"
                );
                $url   = getUrlPath($param);
                header("location:" . $url);
                die();
            }

        }
    }


    /**
     * 支付成功
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
     */
    public function paySuccess()
    {
        $param = $this->param;

        if (!empty($param)) {
            global $dsql;
            global $cfg_secureAccess;
            global $cfg_basehost;
            global $siteCityInfo;
            global $userLogin;

            $paytype        = $param['paytype'];
            $ordernum       = $param['ordernum'];
            $transaction_id = $param['transaction_id'];
            $paylognum      = $param['paylognum'];
            $date           = GetMkTime(time());
            $paydate_       = $paytype == "delivery" ? -1 : $date;
            $pid            = '';
            $onlineAmount   = 0;
            if ($paytype != 'underpay') {
                //查询订单信息
                $archive = $dsql->SetQuery("SELECT `body`, `amount`,`id` FROM `#@__pay_log` WHERE `ordertype` = 'waimai' AND `ordernum` = '$ordernum'");
                $results = $dsql->dsqlOper($archive, "results");
                if (!$results) {
                    return;
                }
                $onlineAmount = $results[0]['amount'];        // 在线支付金额
                $body         = unserialize($results[0]['body']);
                $type         = $body['type'];
                $pid          = $results[0]['id'];

            } else {
                $type = "waimai";
            }

            //暂停0-2秒，暂用于处理并发请求时重复更新问题
            sleep(mt_rand(0,2));

            if ($type == "waimai") {
                $archives = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`sid`, o.`food`, o.`paydate`, o.`usequan`, o.`amount`,o.`is_vipprice`,o.`vippriceinfo`, o.`priceinfo`,o.`balance`,o.`point`,o.`peerpay`,s.`shopname`, s.`bind_print`, s.`print_config`, s.`print_state` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE `ordernum` = '$ordernum'");

                $res = $dsql->dsqlOper($archives, "results");
                if ($res) {
                    $id       = $res[0]['id'];
                    $uid      = $res[0]['uid'];
                    $sid      = $res[0]['sid'];
                    $usequan  = $res[0]['usequan'];
                    $paydate  = $res[0]['paydate'];
                    $amount   = $res[0]['amount'];
                    $shopname = $res[0]['shopname'];
                    $ubalance = $res[0]['balance'];
                    $upoint   = $res[0]['point'];
                    $peerpay  = $res[0]['peerpay'];  //代付人
                    // $bind_print   = $res[0]['bind_print'];
                    // $print_config = $res[0]['print_config'];
                    // $print_state  = $res[0]['print_state'];
                    $food         = $res[0]['food'];
                    $priceinfo    = $res[0]['priceinfo'];
                    $is_vipprice  = $res[0]['is_vipprice'];
                    $vippriceinfo = unserialize($res[0]['vippriceinfo']);

                    //打印机查询(2020/4/28)
                    $printsql = $dsql->SetQuery("SELECT * FROM `#@__business_shop_print` WHERE `sid` = " . $sid." AND `service` = 'waimai'");
                    $printret = $dsql->dsqlOper($printsql, "results");
                    //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
                    if ($paydate == 0) {
                        //是否包含开通会员相关
                        if ($is_vipprice == 1) {
                            $vippriceinfo['waimaiorder'] = 1;
                            (new member())->upgradeSuccess($vippriceinfo);
                        }
                        //当天
                        $todayk = strtotime(date('Y-m-d'));

                        //当天结束
                        $todaye = strtotime(date('Y-m-d 23:59:59'));
                        //最新订单号
                        $paytypeState     = "`state` != 0 AND `state` != 6";
                        $sql              = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__waimai_order_all` WHERE `sid` = $sid AND $paytypeState AND  `pubdate` > $todayk AND `pubdate` < $todaye");
                        $no               = $dsql->dsqlOper($sql, "results");
                        $no               = (int)$no[0]['totalCount'] + 1;
                        $newOrdernumstore = date("Ymd") . "-" . $no;

                        //外卖分表
                        $sub         = new SubTable('waimai_order', '#@__waimai_order');
                        $break_table = $sub->getSubTableById($id);

                        //查询订单分成
                        $fcsql                  = $dsql->SetQuery("SELECT `shopname`,`fencheng_foodprice`,`fencheng_delivery`,`fencheng_dabao`,`fencheng_addservice`,`fencheng_zsb`,`fencheng_discount`,`fencheng_promotion`,`fencheng_firstdiscount`,`fencheng_offline`,`fencheng_quan` FROM `#@__waimai_shop` WHERE `id` = " . $sid);
                        $fcres                  = $dsql->dsqlOper($fcsql, "results");
                        $shopfc                 = $fcres['0'];
                        $fencheng_foodprice     = $shopfc['fencheng_foodprice'];
                        $fencheng_delivery      = $shopfc['fencheng_delivery'];
                        $fencheng_dabao         = $shopfc['fencheng_dabao'];
                        $fencheng_addservice    = $shopfc['fencheng_addservice'];
                        $fencheng_zsb           = $shopfc['fencheng_zsb'];
                        $fencheng_discount      = $shopfc['fencheng_discount'];
                        $fencheng_promotion     = $shopfc['fencheng_promotion'];
                        $fencheng_firstdiscount = $shopfc['fencheng_firstdiscount'];
                        $fencheng_offline       = $shopfc['fencheng_offline'];
                        $fencheng_quan          = $shopfc['fencheng_quan'];
                        $shopname               = $shopfc['shopname'];

                        $payrice = '';
                        if (!empty((float)$onlineAmount)) {
                            $payrice = ",`payprice` = '$onlineAmount'";
                        }
                        //更新订单状态
                        $archives = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `ordernumstore` = '$newOrdernumstore', `paytype` = '$paytype', `paydate` = '$paydate_', `transaction_id` = '$transaction_id', `paylognum` = '$paylognum' ,`fencheng_foodprice` = '$fencheng_foodprice', `fencheng_delivery` = '$fencheng_delivery', `fencheng_dabao` = '$fencheng_dabao',  `fencheng_addservice` = '$fencheng_addservice', `fencheng_zsb` = '$fencheng_zsb', `fencheng_discount` = '$fencheng_discount', `fencheng_promotion` = '$fencheng_promotion', `fencheng_firstdiscount` = '$fencheng_firstdiscount',`fencheng_offline` = '$fencheng_offline',`fencheng_quan` = '$fencheng_quan' $payrice WHERE `ordernum` = '$ordernum'");
                        $dsql->dsqlOper($archives, "update");
                        // 扣除余额支付部分
                        if (!empty($ubalance) && $ubalance > 0 && $paytype != 'delivery' && $paytype != 'underpay'&& $paytype != 'huoniao_bonus') {

                            if ($peerpay) {
                                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $ubalance WHERE `id` = $peerpay");
                            } else {
                                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $ubalance WHERE `id` = $uid");
                            }
                            $dsql->dsqlOper($sql, "update");

                            // 货到付款不保存操作日志
                            if ($paytype != "delivery" && $paytype != 'underpay') {
                                $paramUser = array (
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "orderdetail",
                                    "action"   => "waimai",
                                    "id"       => $id
                                );
                                $urlParam  = serialize($paramUser);

                                if ($peerpay) {
                                    $user      = $userLogin->getMemberInfo($peerpay);
                                    $usermoney = $user['money'];
                                    //                                    $money  =  sprintf('%.2f',($usermoney-$ubalance));
                                    $title_   = '外卖代付：' . $shopname . $newOrdernumstore;
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$peerpay', '0', '$ubalance', '外卖代付：" . $shopname . $newOrdernumstore . "', '$date','waimai','xiaofei','$pid','$urlParam','$title_','$ordernum','$usermoney')");
                                } else {
                                    $user      = $userLogin->getMemberInfo($uid);
                                    $usermoney = $user['money'];
                                    //                                    $money  = sprintf('%.2f',($usermoney-$ubalance));
                                    $title_   = '外卖消费：' . $shopname . $newOrdernumstore;
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$ubalance', '外卖消费：" . $shopname . $newOrdernumstore . "', '$date','waimai','xiaofei','$pid','$urlParam','$title_','$ordernum','$usermoney')");
                                }
                                $dsql->dsqlOper($archives, "update");
                            }
                        }
                        // 扣除余额支付部分(2020/01/11 新增积分支付)
                        if (!empty($upoint) && $upoint > 0 && $paytype != 'delivery' && $paytype != 'underpay') {

                            if ($peerpay) {
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$peerpay'");
                            } else {
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$uid'");
                            }
                            $dsql->dsqlOper($archives, "update");

                            //外卖代付扣除的积分是下单人在下单时选择的积分抵扣，实际付款人只支付了现金部分，最终需要扣除下单人的积分余额
                            //保存操作日志
                            // if ($peerpay) {
                            //     $user      = $userLogin->getMemberInfo($peerpay);
                            //     $userpoint = $user['point'];
                            //     //                                $pointuser = (int)($userpoint-$upoint);
                            //     $title_   = '外卖代付：' . $shopname . $newOrdernumstore;
                            //     $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$peerpay', '0', '$upoint', '$title_', '$date','xiaofei','$userpoint')");//支付外卖
                            // } else {
                                $user      = $userLogin->getMemberInfo($uid);
                                $userpoint = $user['point'];
                                //                                $pointuser = (int)($userpoint-$upoint);
                                $title_   = '外卖消费：' . $shopname . $newOrdernumstore;
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '0', '$upoint', '$title_', '$date','xiaofei','$userpoint')");//支付外卖


                            // }
                            $dsql->dsqlOper($archives, "update");
                        }


                        //打印机接单
                        if (!empty($printret)) {
                            // if ($bind_print == 1 && $print_state == 1 && !empty($printret)) {
                            printerWaimaiOrder($id);
                        }
                        $userinfo = $userLogin->getMemberInfo();
                        $moduleName = getModuleTitle(array('name' => 'waimai'));
                        //微信通知
                        $cityName = $siteCityInfo['name'];
                        $cityid   = $siteCityInfo['cityid'];
                        $param    = array (
                            'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array (
                                'contentrn' => $cityName . "分站\r\n".$moduleName."新订单\r\n下单用户：" . $userinfo['nickname'] . "\r\n下单店铺：" . $shopname . "\r\n订单编号：" . $newOrdernumstore . "\r\n订单金额：" . $amount,
                                'date'      => date("Y-m-d H:i:s", time()),
                            )
                        );
                        updateAdminNotice("waimai", "order", $param);

                        // 查询管理会员 推送给商家
                        $sql              = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = $sid");
                        $ret              = $dsql->dsqlOper($sql, "results");
                        $businessOrderUrl = $cfg_secureAccess . $cfg_basehost . "/wmsj/order/waimaiOrderDetail.php?id=" . $id;

                        if ($ret) {
                            foreach ($ret as $k => $v) {
                                sendapppush($v['userid'], "您有一笔新订单！", "订单号：" . $shopname . $newOrdernumstore,
                                    $businessOrderUrl, "newshoporder");

                                $paramBusi = array (
                                    'service' => 'custom',
                                    'param'   => $cfg_secureAccess . $cfg_basehost . '/wmsj/order/waimaiOrderDetail.php?id=' . $id
                                );

                                //用户姓名
                                $username = "";
                                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = " . $v['userid']);
                                $ret      = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                                }


                                $config = array (
                                    "username" => $username,
                                    "title"    => "外卖订单",
                                    "order"    => $ordernum,
                                    "amount"   => $amount,
                                    "fields"   => array (
                                        'keyword1' => '订单编号',
                                        'keyword2' => '商品名称',
                                        'keyword3' => '订单金额',
                                        'keyword4' => '付款状态',
                                        'keyword5' => '付款时间'
                                    )
                                );

                                updateMemberNotice($v['userid'], "会员-商家新订单通知", $paramBusi, $config, '', '', 0, 0);
                            }
                        }
                        //支付成功，会员消息通知
                        $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['username'];
                        }

                        $paramUser = array (
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "waimai",
                            "id"       => $id
                        );

                        //自定义配置
                        $config = array (
                            "username" => $username,
                            "order"    => $ordernum,
                            "amount"   => $amount,
                            "title"    => "外卖订单",
                            "fields"   => array (
                                'keyword1' => '商品信息',
                                'keyword2' => '付款时间',
                                'keyword3' => '订单金额',
                                'keyword4' => '订单状态'
                            )
                        );
                        updateMemberNotice($uid, "会员-订单支付成功", $paramUser, $config, '', '', 0, 0);
                    
                        //记录用户行为日志
                        memberLog($uid, 'waimai', 'order', 0, 'insert', '外卖下单('.$ordernum.'=>'.$amount.echoCurrency(array("type" => "short")).')', '', '');

                        // 更新满送优惠券状态
                        $sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 0 WHERE `from` = $id AND `state` = -1");
                        $dsql->dsqlOper($sql, "update");


                        // 更新优惠券状态使用订单id
                        $pubdate = GetMkTime(time());
                        if ($usequan) {
                            $sql = $dsql->SetQuery("UPDATE `#@__waimai_quanlist` SET `state` = 1, `oid` = '$id' WHERE `id` = $usequan");
                            $dsql->dsqlOper($sql, "update");
                        }

                        // 更新其他未支付订单价格信息
                        if ($priceinfo) {
                            $priceinfo = unserialize($priceinfo);
                            foreach ($priceinfo as $key => $value) {
                                // 如果有首单减免，查询该用户未支付的订单
                                if ($value['type'] == "shoudan") {

                                    $sql = $dsql->SetQuery("SELECT `id`, `amount`, `priceinfo` FROM `#@__waimai_order_all` WHERE `uid` = $uid AND `state` = 0");
                                    $ret = $dsql->dsqlOper($sql, "results");
                                    if ($ret) {
                                        // $failedIds = array();
                                        foreach ($ret as $k => $val) {
                                            $priceinfo_ = $val['priceinfo'];
                                            $amount     = $val['amount'];
                                            $hasShoudan = false;
                                            if ($priceinfo_) {
                                                $priceinfo_ = unserialize($priceinfo_);
                                                foreach ($priceinfo_ as $n => $d) {
                                                    // 如果有首单减免
                                                    if ($d['type'] == 'shoudan') {
                                                        $hasShoudan = true;
                                                        $amount     += $d['amount'];
                                                        unset($priceinfo_[$n]);
                                                        // array_push($failedIds, $val['id']);
                                                        break;
                                                    }
                                                }
                                            }

                                            // 存在首单优惠
                                            if ($hasShoudan) {
                                                $sub         = new SubTable('waimai_order', '#@__waimai_order');
                                                $break_table = $sub->getSubTableById($val['id']);

                                                $priceinfo_ = serialize($priceinfo_);
                                                $sql        = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `amount` = '$amount', `priceinfo` = '$priceinfo_' WHERE `id` = " . $val['id']);
                                                $ret        = $dsql->dsqlOper($sql, "update");
                                            }

                                        }

                                    }

                                }
                                break;
                            }
                        }


                        // 更新库存
                        $food = unserialize($food);
                        foreach ($food as $k => $v) {
                            $id    = $v['id'];
                            $count = $v['count'];

                            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `stock` = `stock` - $count WHERE `id` = '$id' AND `stockvalid` = 1 AND `stock` > 0");
                            $dsql->dsqlOper($sql, "update");

                            $sql = $dsql->SetQuery("UPDATE `#@__waimai_list` SET `sale` = `sale` + $count WHERE `id` = '$id'");
                            $dsql->dsqlOper($sql, "update");
                            dataAsync("waimai",$id,"product");  // 外卖商品更新库存
                        }

                        // 删除购物车信息表
                        $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_order_temp` WHERE `uid` = $uid AND `sid` = $sid");
                        $dsql->dsqlOper($sql, "update");

                    }
                }

            } else {
                if ($type == "paotui") {
                    $archives = $dsql->SetQuery("SELECT `id`, `uid`, `shop`, `paydate`, `amount`, `ordernum`,`balance`,`point`,`cityid`,`peerpay` FROM `#@__paotui_order` WHERE `ordernum` = '$ordernum'");
                    $res      = $dsql->dsqlOper($archives, "results");
                    if ($res) {
                        $id       = $res[0]['id'];
                        $uid      = $res[0]['uid'];
                        $shop     = $res[0]['shop'];
                        $paydate  = $res[0]['paydate'];
                        $amount   = $res[0]['amount'];
                        $ordernum = $res[0]['ordernum'];
                        $ubalance = $res[0]['balance'];
                        $upoint   = $res[0]['point'];
                        $cityid   = $res[0]['cityid'];
                        $peerpay  = $res[0]['peerpay'];

                        $receivingcode = genSecret();
                        //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
                        if ($paydate == 0) {

                            //更新订单状态
                            $archives = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `state` = 3, `paytype` = '$paytype', `paydate` = '$date',`receivingcode` = '$receivingcode' WHERE `ordernum` = '$ordernum'");
                            $dsql->dsqlOper($archives, "update");

                            // 扣除余额支付部分 2021/01/12 新增
                            if (!empty($ubalance) && $ubalance > 0 && $paytype != 'huoniao_bonus') {

                                if ($peerpay) {
                                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $ubalance WHERE `id` = $peerpay");
                                } else {
                                    $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - $ubalance WHERE `id` = $uid");
                                }
                                $dsql->dsqlOper($sql, "update");

                                $param    = array (
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "order",
                                    "module"   => "paotui"
                                );
                                $urlParam = serialize($param);
                                global $userLogin;
                                $title_ = '外卖跑腿消费';
                                //保存操作日志
                                if ($peerpay) {
                                    $user      = $userLogin->getMemberInfo($peerpay);
                                    $usermoney = $user['money'];
                                    //                                $money  = sprintf('%.2f',($usermoney-$ubalance));
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$peerpay', '0', '$ubalance', '跑腿代付：" . $shop . "', '$date','waimai','xiaofei','$pid','$urlParam','$title_','$ordernum','$usermoney')");
                                } else {
                                    $user      = $userLogin->getMemberInfo($uid);
                                    $usermoney = $user['money'];
                                    //                                $money  = sprintf('%.2f',($usermoney-$ubalance));
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$ubalance', '跑腿消费：" . $shop . "', '$date','waimai','xiaofei','$pid','$urlParam','$title_','$ordernum','$usermoney')");
                                }
                                $dsql->dsqlOper($archives, "update");
                            }

                            if (!empty($upoint) && $upoint > 0) {

                                if ($peerpay) {
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$peerpay'");
                                } else {
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$uid'");
                                }
                                $dsql->dsqlOper($archives, "update");

                                //保存操作日志
                                if ($peerpay) {
                                    $user      = $userLogin->getMemberInfo($peerpay);
                                    $userpoint = $user['point'];
                                    $title_    = '外卖跑腿代付';
                                    $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$peerpay', '0', '$upoint', '$title_', '$date','xiaofei','$userpoint')");//支付外卖跑腿
                                } else {
                                    $user      = $userLogin->getMemberInfo($uid);
                                    $userpoint = $user['point'];
                                    $title_    = '外卖跑腿消费';
                                    $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '0', '$upoint', '$title_', '$date','xiaofei','$userpoint')");//支付外卖跑腿
                                }
                                $dsql->dsqlOper($archives, "update");
                            }


                            // 推送给骑手
                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE `state` = 1 AND `quit` = 0 AND `cityid` = '$cityid'");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $url = $cfg_secureAccess . $cfg_basehost . "?service=waimai&do=courier&ordertype=paotui&state=3";
                                foreach ($ret as $k => $v) {
                                    sendapppush($v['id'], "您有一笔新待抢跑腿订单！", "订单号：" . $ordernum, $url, "paotuidaiqiang");
                                    // aliyunPush($v['id'], "您有一笔新待抢跑腿订单！", "订单号：".$ordernum, "paotuidaiqiang");
                                }
                            }
                        
                            //记录用户行为日志
                            memberLog($uid, 'waimai', 'order', 0, 'insert', '跑腿下单('.$ordernum.'=>'.$amount.echoCurrency(array("type" => "short")).')', '', '');

                        }

                    }
                }
            }
        }
    }

    /**
     * 支付验证
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
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


        //订单状态验证
        // $payCheck = $this->payCheck();
        // if($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码
        $peerpay    = $param['peerpay'];    //是否代付
        $paotui     = (int)$param['paotui'];    //跑腿

        if ($userid == -1 && !$peerpay) {
            return array ("state" => 200, "info" => $langData['siteConfig'][20][262]);
        }//登录超时，请登录后重试！
        if (empty($ordernum)) {
            return array ("state" => 200, "info" => $langData['travel'][13][15]);
        }//提交失败，订单号不能为空！
        if (!empty($balance) && empty($paypwd)) {
            return array ("state" => 200, "info" => $langData['travel'][13][16]);
        }//请输入支付密码！

        $totalPrice = 0;

        $_userid = 0;  //实际下单人的ID

        if ($paotui == 0) {
            $ordernumArr = explode(",", $ordernum);
            foreach ($ordernumArr as $key => $value) {
                //查询订单信息
                $archives   = $dsql->SetQuery("SELECT `uid`, `amount`,`point` FROM `#@__waimai_order_all` WHERE `ordernum` = '$value'");
                $results    = $dsql->dsqlOper($archives, "results");
                $res        = $results[0];
                $point      = $res['point'];
                $orderprice = sprintf("%.2f", $res['amount'] +($point / $cfg_pointRatio));
                $totalPrice += $orderprice;
                $_userid = $res['uid'];
            }

        } else {

            $archives   = $dsql->SetQuery("SELECT `uid`, `amount`,`point` FROM `#@__paotui_order` WHERE `ordernum` = '$ordernum'");
            $results    = $dsql->dsqlOper($archives, "results");
            $res        = $results[0];
            $point      = $res['point'];
            $orderprice = sprintf("%.2f", $res['amount'] +($point / $cfg_pointRatio));
            $totalPrice += $orderprice;
            $_userid = $res['uid'];

        }
        //查询会员信息
        if ($userid == -1) {
            $usermoney = 0;
            $userpoint = 0;
        } else {
            //代付的情况，查询下单人的信息
            if($peerpay){
                $userinfo  = $userLogin->getMemberInfo($_userid);
            }else{
                $userinfo  = $userLogin->getMemberInfo();
            }
            $usermoney = $userinfo['money'];
            $userpoint = $userinfo['point'];
        }

        //排除意外小于0的情况
        $usermoney = $usermoney > 0 ? $usermoney : 0;
        $userpoint = $userpoint > 0 ? $userpoint : 0;

        $tit      = array ();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if (!empty($point)) {
            if ($userpoint < $point) {
                return array (
                    "state" => 200,
                    "info"  => $langData['travel'][13][17] . $cfg_pointName . $langData['travel'][13][18]
                );
            }//您的可用".$cfg_pointName."不足，支付失败！
            $useTotal += sprintf("%.2f", $point / $cfg_pointRatio);
            $tit[]    = $cfg_pointName;
        }

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) {
                return array ("state" => 200, "info" => $langData['travel'][13][19]);
            }//支付密码输入错误，请重试！
            //验证余额
            if ($usermoney < $balance) {
                return array ("state" => 200, "info" => $langData['travel'][13][20]);
            }//您的余额不足，支付失败！
            $useTotal += $balance;
            $tit[]    = $langData['travel'][13][21];//余额
        }
        
        $totalPrice = sprintf("%.2f", $totalPrice);
        $useTotal = sprintf("%.2f", $useTotal);

        if ($useTotal > $totalPrice) {
            return array (
                "state" => 200,
                "info"  => $langData['travel'][13][22] . join($langData['travel'][13][23],
                        $tit) . $langData['travel'][13][24] . join($langData['travel'][13][23], $tit)
            );
        }//"您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit)
        //返回需要支付的费用
        // echo $totalPrice ."\r\n". $useTotal;die;
        return sprintf("%.2f", $totalPrice - $useTotal);

    }


    //扫码code
    public function sweepcode()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;
        $param = $this->param;
        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        //重置表单参数
        $this->param = $param;

        $param_      = $param;
        $ordernum    = $param['ordernum'];
        $paytype     = $param['paytype'];
        $final       = (int)$param['final']; // 最终支付
        $paytype     = $param['paytype'];
        $usePinput   = $param['usePinput'];
        $point       = (float)$param['point'];
        $useBalance  = $param['useBalance'];
        $balance     = (float)$param['balance'];
        $ordernumArr = explode(",", $ordernum);

        if (!is_array($payTotalAmount)) {
            $amount = $payTotalAmount;
        } else {
            return $payTotalAmount;
        }
        //余额or积分混合支付
        if ($final == 1 && ($usePinput && !empty($point)) || ($useBalance && !empty($balance))) {

            $pointMoney   = $usePinput ? $point / $cfg_pointRatio : 0;
            $balanceMoney = $balance;

            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives   = $dsql->SetQuery("SELECT  `amount` FROM `#@__waimai_order_all` WHERE `ordernum` = '$value'");
                $results    = $dsql->dsqlOper($archives, "results");
                $res        = $results[0];
                $orderprice = $res['amount']; //单价
                $oprice     = $orderprice;  //单个订单总价 = 数量 * 单价

                $usePointMoney   = 0;
                $useBalanceMoney = 0;

                //先判断积分是否足够支付总价
                //如果足够支付：
                //1.把还需要支付的总价重置为0
                //2.积分总额减去用掉的
                //3.记录已经使用的积分
                if ($oprice < $pointMoney) {
                    $pointMoney    -= $oprice;
                    $usePointMoney = $oprice;
                    $oprice        = 0;
                    //积分不够支付再判断余额是否足够
                    //如果积分不足以支付总价：
                    //1.总价减去积分抵扣掉的部部分
                    //2.积分总额设置为0
                    //3.记录已经使用的积分
                } else {
                    $oprice        -= $pointMoney;
                    $usePointMoney = $pointMoney;
                    $pointMoney    = 0;
                    //验证余额是否足够支付剩余部分的总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.余额减去用掉的部分
                    //3.记录已经使用的余额
                    if ($oprice < $balanceMoney) {
                        $balanceMoney    -= $oprice;
                        $useBalanceMoney = $oprice;
                        $oprice          = 0;
                        //余额不够支付的情况
                        //1.总价减去余额付过的部分
                        //2.余额设置为0
                        //3.记录已经使用的余额
                    } else {
                        $oprice          -= $balanceMoney;
                        $useBalanceMoney = $balanceMoney;
                        $balanceMoney    = 0;
                    }
                }


                //扫码支付 更新微信或者支付宝实际支付金额
                $paylogsql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$oprice' WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($paylogsql, "update");
            }


        }
        $isMobile = isMobile();

        global $userLogin;
        global $langData;

        if ($userLogin->getMemberID() == -1) {
            die($langData['siteConfig'][20][262]);
        }  //登录超时，请重新登录！

        if ($amount <= 0) {
            die($langData['siteConfig'][21][254]);   //订单支付金额必须为整数或小数，小数点后不超过2位。
        }

        if (empty($paytype)) {
            $archives = $dsql->SetQuery("SELECT `pay_code` FROM `#@__site_payment` WHERE `state` = 1 LIMIT 0, 1");
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $paytype = $results[0]['pay_code'];
            }
        }

        if (empty($paytype)) {
            die($langData['siteConfig'][21][75]);   //请选择支付方式！
        }

        $ordernum = $ordernum ? $ordernum : create_ordernum();

        if ($isMobile && empty($final)) {
            $param_['ordernum']  = $ordernum;
            $param_['ordertype'] = 'deposit';
            $param               = array (
                "service"  => "member",
                "type"     => "user",
                "template" => "pay",
                "param"    => http_build_query($param_)
            );
            header("location:" . getUrlPath($param));
            die;
        }

        // var_dump($amount);die;
        return createPayForm("waimai", $ordernum, $amount, $paytype, $langData['siteConfig'][29][126],
            array ("type" => "waimai"));   //订单支付

    }


    /**
     * 买家取消订单
     */
    public function cancelOrder()
    {

        // return array("state" => 200, "info" => '操作失败！');

        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (empty($id)) {
            return array ("state" => 200, "info" => '数据不完整，请检查！');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`paytype`, o.`paydate`, o.`amount`, o.`ordernumstore`, o.`ordernum`, o.`peerpay`, s.`id`, s.`shopname`,o.`state`,o.`balance`,o.`payprice`,o.`point`,o.`is_vipprice`,o.`vippriceinfo`,o.`print_dataid` FROM `#@__waimai_order_all` o LEFT JOIN `#@__pay_log` l ON l.`body` = o.`ordernum` LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = '$id' AND o.`uid` = '$uid'");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $date          = GetMkTime(time());
            $sid           = $results[0]['id'];
            $amount        = $results[0]['amount'];
            $paytype       = $results[0]['paytype'];
            $paydate       = $results[0]['paydate'];
            $ordernum      = $results[0]['ordernum'];
            $shopname      = $results[0]['shopname'];
            $ordernumstore = $results[0]['ordernumstore'];
            $balance       = $results[0]['balance'];
            $payprice      = sprintf('%.2f', $results[0]['payprice']);
            $totalMoney    = $results[0]['balance'] + $results[0]['payprice'];
            $totalPoint    = $results[0]['point'];
            $peerpay       = $results[0]['peerpay'];
            $print_dataid  = $results[0]['print_dataid'];  //打印机打印接口回调ID

            if($print_dataid){
                return array ("state" => 200, "info" => '商家已接单，取消失败！');
            }

            if ($results[0]['is_vipprice'] == 1) {

                $vippriceinfo = unserialize($results[0]['vippriceinfo']);

                $vipprice = $vippriceinfo['price'];

                /*包含会员支付金额 并且实际支付大于 会员价格*/
                if ($payprice > 0 && $payprice >= $vipprice) {

                    $payprice = $payprice - $vipprice;

                } else {

                    $vbalance = $vipprice - $payprice;
                    if ($vbalance < 0) {
                        global $cfg_pointRatio;

                        $totalPoint -= abs($vbalance) * $cfg_pointRatio;
                    } else {
                        $balance -= $vbalance;
                    }

                    $payprice = 0;
                }


                $amount = $payprice + $balance + $totalPoint / $cfg_pointRatio;
            }


            if ($results[0]['state'] == 1) {
                return array ("state" => 200, "info" => '订单已完成，取消失败！');
            } else {
                if ($results[0]['state'] == 3 || $results[0]['state'] == 4) {
                    return array ("state" => 200, "info" => '商家已接单，取消失败！');
                } else {
                    if ($results[0]['state'] == 5) {
                        return array ("state" => 200, "info" => '订单配送中，取消失败！');
                    } else {
                        if ($results[0]['state'] == 6 || $results[0]['state'] == 7) {
                            return array ("state" => 200, "info" => '订单已取消！');
                        }
                    }
                }
            }

            //            $time = 300 - ($date - $paydate);
            //            if ($time > 0) {
            //                $min = ceil($time / 60);
            //                return array("state" => 200, "info" => "操作失败，成功下单五分钟后商家未接单才可以取消订单，剩余时间：" . $min . "分钟");
            //            }

            // 查询管理会员 推送给商家
            if ($results[0]['state'] != 0) {
                $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = $sid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $k => $v) {
                        sendapppush($v['userid'], "您有一笔订单已取消", "订单号：" . $shopname . $ordernumstore, "", "shopordercancel");
                        // aliyunPush($v['userid'], "您有一笔订单已取消！", "订单号：".$shopname.$ordernumstore, "shopordercancel");
                    }
                }
            }

            // 货到付款
            // if ($paytype == "delivery" || $amount == 0) {
            //     return "取消成功！";
            // }
            $refrunddate   = GetMkTime(time());
            $refrundno  = '';

            if ($results[0]['state'] != 0) {
                $arr = refund('waimai',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);
                $r =$arr[0]['r'];
                $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
                $refrundno   = $arr[0]['refrundno'];
                $refrundcode = $arr[0]['refrundcode'];
            }else{
                $r = true;
                $refrunddate = time();
            }

            $pay_name  = '';
            $paramUser = array (
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "waimai",
                "id"       => $id
            );
            $urlParam  = serialize($paramUser);

            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!empty($ret)) {
                $pay_name = $ret[0]['pay_name'];
            } else {
                $pay_name = $ret[0]["paytype"];
            }

            $pay_namearr = array ();
            if ($pay_name) {
                array_push($pay_namearr, $pay_name);
            }

            if ($balance != '') {
                array_push($pay_namearr, "余额");
            }

            if ($totalPoint != '') {
                array_push($pay_namearr, "积分");
            }

            if ($pay_namearr) {
                $pay_name = join(',', $pay_namearr);
            }


            $tuikuan      = array (
                'paytype'      => $pay_name,
                'truemoneysy'  => $payprice,
                'money_amount' => $balance,
                'point'        => $totalPoint,
                'refrunddate'  => $refrunddate,
                'refrundno'    => $refrundno
            );
            $tuikuanparam = serialize($tuikuan);

            //外卖分表
            $sub         = new SubTable('waimai_order', '#@__waimai_order');
            $break_table = $sub->getSubTableById($id);
            if ($r) {
                //退回积分
                if ($results[0]['state'] != 0) {
                    if (!empty($totalPoint)) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$totalPoint' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user      = $userLogin->getMemberInfo($uid);
                        $userpoint = $user['point'];
                        //                    $pointuser = (int)($userpoint+$totalPoint);
                        //保存操作日志
                        $info     = '外卖退款:(积分退款:' . $totalPoint . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $ordernum;  //商城订单退回
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalPoint', '$info', '$date','tuihui','$userpoint')");
                        $dsql->dsqlOper($archives, "update");
                    }
                    global $userLogin;
                    //退回余额
                    if ($balance > 0 && $paytype !='huoniao_bonus') {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$balance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user      = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        //                    $money    =  sprintf('%.2f',($usermoney+$balance));
                        //保存操作日志
                        $info     = '外卖退款:(积分退款:' . $totalPoint . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $ordernum;  //商城订单退回
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$balance', '$info', '$date','waimai','tuikuan','$urlParam','$ordernum','$tuikuanparam','外卖消费','$usermoney')");
                        $dsql->dsqlOper($archives, "update");


                    }
                }

                if ($results[0]['state'] == 2 || $results[0]['state'] == 0) {

                    if ($results[0]['state'] == 2) {
                        $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 6, `refrundstate` = 1, `refrunddate` = '" . (int)$refrunddate . "', `refrundno` = '" . $refrundno . "',`failed` = '用户取消订单', `refrundadmin` = $uid WHERE `id` = $id");
                    } else {
                        $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 6,`failed` = '用户取消订单' WHERE `id` = $id");
                    }

                    $ret = $dsql->dsqlOper($sql, "update");
                    if ($ret != "ok") {
                        return array ("state" => 200, "info" => "操作失败，请重试！");
                    }

                } else {
                    if ($results[0]['state'] == 7) {
                        return array ("state" => 200, "info" => '订单已取消！');
                    } else {
                        return array ("state" => 200, "info" => '商家已接单，取消失败！');
                    }
                }

                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                $param = array (
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "record"
                );

                //自定义配置
                $config = array (
                    "username" => $username,
                    "order"    => $shopname . $ordernumstore,
                    "amount"   => $amount,
                    "fields"   => array (
                        'keyword1' => '退款状态',
                        'keyword2' => '退款金额',
                        'keyword3' => '审核说明'
                    )
                );

                if ($results[0]['state'] != 0) {
                    updateMemberNotice($uid, "会员-订单退款成功", $param, $config, '', '', 0, 1);
                }

                return "取消成功！";
            } else {
                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `refrundstate` = 0, `refrunddate` = '', `failed` = '用户取消订单', `refrundadmin` = $uid WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
                return array ("state" => 200, "info" => '操作失败！');
            }

        } else {
            return array ("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }

    }


    /**
     * 相册分类
     *
     * @return array
     */
    public function albumType()
    {
        global $dsql;
        $store = $this->param['store'];
        if (!is_numeric($store)) {
            return array ("state" => 200, "info" => '格式错误！');
        }
        $archives = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__waimai_album_type` WHERE `store` = " . $store . " ORDER BY `weight` ASC");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            return $results;
        } else {
            return array ("state" => 200, "info" => '暂无菜单分类！');
        }

    }

    /**
     * 获取指定商品
     */
    public function getFoodById()
    {
        global $dsql;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $goods_id = $this->param['goods'];
                $shop_id  = $this->param['shop'];
            }
        }
        $archives = $dsql->SetQuery("SELECT `id`, `title`, `price`, `typeid`, `is_dabao`, `dabao_money` FROM `#@__waimai_list` WHERE `id` = '$goods_id' AND `sid` = '$shop_id'");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            return array ("state" => 200, "info" => $results[0]);
        } else {
            return array ("state" => 200, "info" => '没有数据');
        }

    }

    /**
     * 店铺商品
     *
     * @return array
     */
    public function food()
    {
        global $dsql;
        global $userLogin;

        $pageinfo = $list = array ();
        $shop     = $typeid = $orderby = $where = "";

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $shop     = $this->param['shop'];
                $keywords = $this->param['keywords'];
                $typeid   = (int)$this->param['typeid'];
                $orderby  = (int)$this->param['orderby'];
            }
        }

        if (empty($shop)) {
            return array ("state" => 200, "info" => '店铺ID必传！');
        }

        $where = " WHERE l.`sid` = $shop AND l.`status` = 1 AND l.`del` = 0";

        //类型
        if ($typeid != "") {
            $where .= " AND l.`typeid` = $typeid";
        }

        if ($keywords != "") {

            $where .= " AND l.`title`like '%" . $keywords . "%'";

        }
        //排序
        if (!empty($orderby)) {
            //价格升序
            if ($orderby == 1) {
                $orderby = " ORDER BY t.`sort` DESC, l.`price` ASC, l.`sort` DESC, l.`id` DESC";
                //价格降序
            } else {
                if ($orderby == 2) {
                    $orderby = " ORDER BY t.`sort` DESC, l.`price` DESC, l.`sort` DESC, l.`id` DESC";
                }
            }
        } else {
            $orderby = " ORDER BY t.`sort` DESC, l.`sort` DESC, l.`id` DESC";
        }


        $archives = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`price`, l.`typeid`, l.`unit`, l.`label`, l.`is_dabao`, l.`dabao_money`, l.`stockvalid`, l.`stock`, l.`formerprice`, l.`descript`, l.`is_nature`, l.`nature`, l.`is_day_limitfood`, l.`day_foodnum`, l.`is_limitfood`, l.`foodnum`, l.`start_time`, l.`stop_time`, l.`limit_time`, l.`pics`,l.`is_discount`,l.`discount_value`,l.`body` FROM `#@__waimai_list` l LEFT JOIN `#@__waimai_list_type` t ON l.`typeid` = t.`id`" . $where . $orderby);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $results = $dsql->dsqlOper($archives, "results");

        $list = array ();
        if ($results) {


            //会员价格 (原价,现价,VIP最低价,当前登录会员等级)

            //查询店铺是否开启vip折扣
            $shopvipsql = $dsql->SetQuery("SELECT `vipdiscount_value`,`tjprice`,`is_vipdiscount` FROM `#@__waimai_shop` WHERE `id` = " . $shop);

            $shopre    = $dsql->dsqlOper($shopvipsql, "results");
            $shopvipzk = $tjprice = 0;

            if ($shopre) {
                if ($shopre['0']['is_vipdiscount'] == 1) {

                    $shopvipzk = $shopre['0']['vipdiscount_value'];
                }
                // $tjprice    = $shopre['0']['tjprice'];
            }


            $minsql = $dsql->SetQuery("SELECT `privilege`  FROM `#@__member_level` ORDER BY `id` ASC limit 0,1");
            $minret = $dsql->dsqlOper($minsql, "results");

            if ($uid > 0 && $userinfo['level']) {

                $sql = $dsql->SetQuery("SELECT `privilege` FROM `#@__member_level` WHERE `id` = " . $userinfo['level']);
                // var_dump($sql);die;
                $ret = $dsql->dsqlOper($sql, "results");

            }

            if ($ret) {

                $privilege = unserialize($ret[0]['privilege']);
                $waimai    = $shopvipzk ? $shopvipzk : $privilege['waimai'];
            }

            if ($minret) {
                $minprivilege = unserialize($minret[0]['privilege']);
                $minwaimai    = $shopvipzk ? $shopvipzk : $minprivilege['waimai'];

            }
            // 统计本店所有菜品销量
            $foodSale = array ();
            $fid      = $val['id'];
            $sql      = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `sid` = $shop AND `state` = 1");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $val) {
                    $food = $val['food'];
                    $food = unserialize($food);
                    if (is_array($food)) {
                        foreach ($food as $k => $v) {
                            $foodSale[$v['id']] = isset($foodSale[$v['id']]) ? ($foodSale[$v['id']] + $v['count']) : $v['count'];
                        }
                    }
                }
            }

            foreach ($results as $key => $val) {

                $list[$key]['id']    = $val['id'];
                $list[$key]['title'] = $val['title'];
                $foodprice           = $val['price'];

                if ($tjprice != 0) {

                    $foodprice = $val['price'] + $val['price'] * $tjprice / 100;
                }

                //会员价格
                if ($waimai && $waimai < 10) {

                    $list[$key]['vipprice'] = sprintf("%.2f", $foodprice * $waimai / 10);
                    $list[$key]['viplevel'] = $userinfo['level'];

                    $list[$key]['minprice'] = sprintf("%.2f", $foodprice * $minwaimai / 10);
                }

                if ($val['is_discount'] == '1') {

                    $list[$key]['price'] = sprintf("%.2f", $foodprice * ($val['discount_value'] / 10));

                } else {

                    $list[$key]['price'] = sprintf("%.2f", $foodprice);
                }
                $list[$key]['typeid'] = $val['typeid'];

                $typeName = "";
                $sql      = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_list_type` WHERE `id` = " . $val['typeid']);
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $typeName = $ret[0]['title'];
                }
                $list[$key]['typeName'] = $typeName;

                $list[$key]['unit']        = $val['unit'];
                $list[$key]['label']       = $val['label'];
                $list[$key]['is_dabao']    = $val['is_dabao'];
                $list[$key]['dabao_money'] = $val['dabao_money'];
                $list[$key]['stockvalid']  = (int)$val['stockvalid'];
                $list[$key]['stock']       = $val['stock'];
                $list[$key]['formerprice'] = $val['formerprice'];
                $list[$key]['descript']    = $val['descript'];
                $list[$key]['is_nature']   = $val['is_nature'];

                $natureArr = $val['nature'] ? unserialize($val['nature']) : array ();
                if ($natureArr && $val['is_discount'] == '1') {
                    foreach ($natureArr as $_k => $_v) {
                        $_data = $_v['data'];
                        if ($_data) {
                            foreach ($_data as $__k => $__v) {
                                $__v['price'] = (float)$__v['price'];
                                $natureArr[$_k]['data'][$__k]['price'] = sprintf("%.2f", $__v['price']);
                                if ($__v['price']) {
                                    $natureArr[$_k]['data'][$__k]['price'] = sprintf("%.2f",
                                        $__v['price'] * ($val['discount_value'] / 10));
                                }
                            }
                        }
                    }
                }
                //去除内容中的空格，不然前端页面会报错
                if ($natureArr) {
                    foreach ($natureArr as $_k => $_v) {
                        $_data = $_v['data'];
                        if ($_data) {
                            foreach ($_data as $__k => $__v) {
                                $natureArr[$_k]['data'][$__k]['price'] = sprintf("%.2f", $__v['price']);
                                $natureArr[$_k]['data'][$__k]['value'] = preg_replace('/\s+/', '', $__v['value']);
                            }
                        }
                    }
                }
                $list[$key]['nature'] = $natureArr;

                $list[$key]['nature_json']      = json_encode($natureArr);
                $list[$key]['is_day_limitfood'] = $val['is_day_limitfood'];
                $list[$key]['day_foodnum']      = $val['day_foodnum'];
                $list[$key]['is_limitfood']     = $val['is_limitfood'];
                $list[$key]['foodnum']          = $val['foodnum'];
                $list[$key]['start_time']       = $val['start_time'];
                $list[$key]['stop_time']        = $val['stop_time'];
                $list[$key]['limit_time']       = unserialize($val['limit_time']);
                $list[$key]['limit_time_json']  = json_encode(unserialize($val['limit_time']));
                $list[$key]['stock']            = $val['stock'];
                $list[$key]['is_discount']      = $val['is_discount'];
                $list[$key]['discount_value']   = $val['discount_value'];
                $list[$key]['body']             = $val['body'];

                $picArr = array ();
                if ($val['pics']) {
                    $pics = explode(",", $val['pics']);
                    foreach ($pics as $k => $v) {
                        array_push($picArr, getFilePath($v));
                    }
                }
                $list[$key]['pics'] = $picArr;

                $list[$key]['sale'] = isset($foodSale[$val['id']]) ? $foodSale[$val['id']] : 0;

                //查询
                if ($val['is_limitfood'] == 1) {
                    $sql = $dsql->SetQuery("SELECT count(`id`) dealcount FROM `#@__waimai_order_all` WHERE `uid`  =" . $uid . " AND `pubdate` >= " . $val['start_time'] . " AND `pubdate` < " . $val['stop_time'] . " AND FIND_IN_SET(" . $val['id'] . ",`fids`) AND `state` not in(0,6)");
                    $ret = $dsql->dsqlOper($sql, "results");

                } else {
                    if ($val['is_day_limitfood'] == 1) {
                        $start_time = strtotime(date("Y-m-d", time()));
                        //当天结束之间
                        $end_time = $start_time + 60 * 60 * 24;

                        $sql = $dsql->SetQuery("SELECT count(`id`) dealcount FROM `#@__waimai_order_all` WHERE `uid`  =" . $uid . " AND `pubdate` >= " . $start_time . " AND `pubdate` < " . $end_time . " AND FIND_IN_SET(" . $val['id'] . ",`fids`) AND `state` not in(0,6)");
                        $ret = $dsql->dsqlOper($sql, "results");

                    }
                }

                $list[$key]['dealcount'] = $ret[0]['dealcount'] ? $ret[0]['dealcount'] : 0;

                //销量
                // $sql = $dsql->SetQuery("SELECT count(`id`) count FROM `#@__waimai_order_product` WHERE `pid` = ".$val['id']);
                // $ret = $dsql->dsqlOper($sql, "results");
                // $list[$key]['sale'] = $ret[0]['count'];

            }
        } else {
            return array ("state" => 200, "info" => '暂无相关数据！');
        }


        return $list;
    }


    /**
     * 菜单详细信息
     *
     * @return array
     */
    public function menuDetail()
    {
        global $dsql;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_list` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $picArr = array ();
            $pics   = $results[0]["pics"];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $k => $v) {
                    $picArr[$k] = getFilePath($v);
                }
            }
            $results[0]['pics'] = $picArr;

            //菜单分类
            $typename = "";
            $sql      = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_list_type` WHERE `id` = " . $results[0]['typeid']);
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $typename = $ret[0]['title'];
            }
            $results[0]['typeName'] = $typename;

            $results[0]['nature']      = unserialize($results[0]['nature']);
            $results[0]['nature_json'] = json_encode($results[0]['nature']);

            $results[0]['limit_time']      = unserialize($results[0]['limit_time']);
            $results[0]['limit_time_json'] = json_encode($results[0]['limit_time']);

            return $results[0];
        } else {
            return array ("state" => 200, "info" => '菜单不存在！');
        }
    }


    /**
     * 餐厅相册
     *
     * @return array
     */
    public function album()
    {
        global $dsql;
        $pageinfo = $list = array ();
        $store    = $typeid = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $store  = $this->param['store'];
                $typeid = (int)$this->param['typeid'];
            }
        }

        if (empty($store)) {
            return array ("state" => 200, "info" => '餐厅ID必传！');
        }

        $where = " WHERE `store` = $store";

        //类型
        if ($typeid != "") {
            $where .= " AND `typeid` = $typeid";
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_album`" . $where . " ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $results = $dsql->dsqlOper($archives, "results");
        $list    = array ();
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['store']  = $val['store'];
                $list[$key]['typeid'] = $val['typeid'];

                $typeName = "";
                $sql      = $dsql->SetQuery("SELECT `typename` FROM `#@__waimai_album_type` WHERE `id` = " . $val['typeid']);
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $typeName = $ret[0]['typename'];
                }
                $list[$key]['typeName'] = $typeName;

                $list[$key]['path']  = getFilePath($val['path']);
                $list[$key]['title'] = $val['title'];
            }
        } else {
            return array ("state" => 200, "info" => '暂无相关数据！');
        }

        return $list;
    }


    /**
     * 照片详细信息
     *
     * @return array
     */
    public function albumDetail()
    {
        global $dsql;
        $id = $this->param;

        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_album` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results[0]["path"] = getFilePath($results[0]["path"]);
            return $results;
        } else {
            return array ("state" => 200, "info" => '照片不存在！');
        }
    }


    /**
     * 评论
     *
     * @return array
     */
    public function review()
    {
        global $dsql;
        $pageinfo = $list = array ();
        $store    = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $store    = $this->param['store'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($store)) {
            return array ("state" => 200, "info" => '餐厅ID必传！');
        }

        $where = " WHERE `store` = $store";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `rating`, `note`, `pics`, `pubdate` FROM `#@__waimai_review` ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
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
                $pics = $val['pics'];
                if (!empty($pics)) {
                    $pics   = explode(",", $pics);
                    $picArr = array ();
                    foreach ($pics as $k => $v) {
                        $picArr[$k] = getFilePath($v);
                    }
                    $results[$key]['pics'] = $picArr;
                }
            }
        } else {
            return array ("state" => 200, "info" => '暂无相关数据！');
        }
        return array ("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 订单
     *
     * @return array
     */
    public function order()
    {
        global $cfg_pointRatio;
        global $dsql;
        $pageinfo = $list = array ();
        $store    = $userid = $start = $end = $state = $page = $pageSize = $where = "";
        global $userLogin;
        $uid = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $store      = $this->param['store'];
                $userid     = $this->param['userid'];
                $start      = $this->param['start'];
                $end        = $this->param['end'];
                $state      = $this->param['state'] ? $this->param['state'] : RemoveXss($_REQUEST['state']);
                $iscomment  = $this->param['iscomment'];
                $courierset = (int)$this->param['courierset'];
                $page       = $this->param['page'];
                $pageSize   = $this->param['pageSize'];
                $refund     = (int)$this->param['refund'];
                $title    = trim($this->param['title']);
            }
        }
        if (!$userid) {
            $userid = $uid;
        }
        if (empty($store) && empty($userid)) {
            return array ("state" => 200, "info" => '会员ID或店铺ID至少传一个！');
        }

        $where = " WHERE o.`del` = 0";


        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，获取失败！');
        }

        if (!empty($store)) {
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop` WHERE `userid` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $where = $where . " AND o.`sid` = " . $ret[0]['id'];
            } else {
                return array ("state" => 200, "info" => '店铺不存在，获取失败！');
            }
        }

        if (!empty($userid)) {
            $where = $where . " AND o.`uid` = $uid";
        }

        if ($start != "") {
            $where .= " AND o.`pubdate` >= " . GetMkTime($start);
        }

        if ($end != "") {
            $where .= " AND o.`pubdate` <= " . GetMkTime($end);
        }

        if ($courierset == 1) {
            $did   = GetCookie("courier"); /*骑手id*/
            $where .= " AND o.`peisongid` = '$did' AND o.`state` = 3";
        }

        //搜索订单
        if($title){
            $where .= " AND (o.`ordernum` LIKE '%$title%' OR o.`ordernumstore` LIKE '%$title%' OR s.`shopname` LIKE '%$title%' OR o.`food` LIKE '%$title%')";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT o.`point`,s.`shopname`, s.`shop_banner`, s.`coordX`, s.`coordY`, o.`id`, o.`sid`, o.`iscomment`, o.`ordernum`, o.`ordernumstore`, o.`uid`, o.`state`, o.`food`, o.`amount`, o.`paytype`, o.`pubdate`, o.`paydate`, o.`peisongid`, o.`peisongpath`,o.`lng`,o.`lat`,o.`ordertype`,o.`selftime`,o.`courier_get`,o.`failed`,o.`reservesongdate`, s.`delivery_time` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid`" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //未付款
        $state0 = $dsql->dsqlOper($archives . " AND o.`state` = 0", "totalCount");
        //已付款
        $state1 = $dsql->dsqlOper($archives . " AND o.`state` = 1", "totalCount");
        //待收货
        $state2 = $dsql->dsqlOper($archives . " AND o.`state` = 2", "totalCount");
        //交易完成
        $state3 = $dsql->dsqlOper($archives . " AND o.`state` = 3", "totalCount");
        //有退款
        $totalRefund = $dsql->dsqlOper($archives . " AND o.`refrundstate` = 1", "totalCount");
        //待评价
        $noiscomment = $dsql->dsqlOper($archives . " AND o.`state` = 1 AND o.`iscomment` = 0", "totalCount");
        //已评价
        $yesiscomment = $dsql->dsqlOper($archives . " AND o.`state` = 1  AND o.`iscomment` = 1", "totalCount");

        if ($state != "") {
            // $totalCount = $dsql->dsqlOper($archives . " AND `state` = " . $state, "totalCount");

            if ($iscomment != "") {
                $archives .= " AND o.`iscomment` = '$iscomment'";
            }

            $archives .= " AND o.`state` = $state";
        }

        if($refund){
            $archives .= " AND o.`refrundstate` = 1";
        }

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array (
            "page"         => $page,
            "pageSize"     => $pageSize,
            "totalPage"    => $totalPage,
            "totalCount"   => $totalCount,
            "state0"       => $state0,
            "state1"       => $state1,
            "state2"       => $state2,
            "state3"       => $state3,
            "noiscomment"  => $noiscomment,
            "yesiscomment" => $yesiscomment,
            "totalRefund" => $totalRefund,
        );

        if ($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());
        // if ($totalCount == 0) {
        //     return array ("state" => 200, "info" => '暂无数据！');
        // }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . " ORDER BY o.`id` DESC" . $where, "results");
        $list    = array ();
        if ($results) {
            foreach ($results as $key => $value) {

                $list[$key]['id']            = $value['id'];
                $list[$key]['ordernum']      = $value['ordernum'];
                $list[$key]['ordernumstore'] = $value['shopname'] . $value['ordernumstore'];
                $list[$key]['uid']           = $value['uid'];
                $list[$key]['sid']           = $value['sid'];
                $point                       = $value['point'] / $cfg_pointRatio;                  //积分
                $list[$key]['amount']        = sprintf("%.2f", $value['amount']);
                $list[$key]['paytype']       = $value['paytype'];
                $list[$key]['pubdate']       = $value['pubdate'];
                $list[$key]['paydate']       = $value['paydate'];
                $list[$key]['state']         = $value['state'];
                $list[$key]['iscomment']     = $value['iscomment'];
                $list[$key]['lng']           = $value['lng'];
                $list[$key]['lat']           = $value['lat'];
                $list[$key]['ordertype']     = $value['ordertype'];
                $list[$key]['selftime']      = $value['selftime'];
                $list[$key]['failed']        = $value['failed'];

                //商品信息
                $foodList  = array();
                $foodArr   = array();
                $food      = unserialize($value['food']);
                $foodCount = 0;
                if ($food) {
                    foreach ($food as $k => $v) {
                        $food_title = $v['title'] . ($v['ntitle'] ? '（' . $v['ntitle'] . '）' : '');
                        array_push($foodArr, $food_title. "×" . $v['count']);
                        $foodCount += $v['count'];

                        //查询商品图片
                        $food_pic = '';
                        $sql = $dsql->SetQuery("SELECT `pics` FROM `#@__waimai_list` WHERE `id` = " . $v['id']);
                        $food_pics = $dsql->getOne($sql);
                        if($food_pics){
                            $food_pic = getFilePath(explode(",", $food_pics)[0]);
                        }

                        array_push($foodList, array(
                            'title' => $food_title,
                            'count' => (int)$v['count'],
                            'price' => (float)$v['price'],
                            'pic' => $food_pic
                        ));
                    }
                }
                $list[$key]['food']      = join("，", $foodArr);
                $list[$key]['foodCount'] = $foodCount;
                $list[$key]['foodList'] = $foodList;

                //用户名
                $userSql                = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $value["uid"]);
                $username               = $dsql->dsqlOper($userSql, "results");
                $list[$key]["username"] = $username[0]['username'];

                //餐厅
                $list[$key]["shopname"]    = $value["shopname"];
                $list[$key]["shop_coordX"] = $value["coordX"];
                $list[$key]["shop_coordY"] = $value["coordY"];
                $list[$key]["shop_logo"]   = $value['shop_banner'] ? getFilePath(explode(",",
                    $value['shop_banner'])[0]) : "";  //图片

                if ($value['state'] == 0) {
                    $param                = array (
                        "service"  => "waimai",
                        "template" => "pay",
                        "param"    => "ordernum=" . $value['ordernum']
                    );
                    $list[$key]['payurl'] = getUrlPath($param);
                }


                if ($value['peisongid']) {
                    $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = " . $value['peisongid']);
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $list[$key]['peisongname']  = $ret[0]['name'];
                        $list[$key]['peisongphone'] = $ret[0]['phone'];

                        $peisongpath               = $value['peisongpath'];
                        $list[$key]["peisongpath"] = $peisongpath;

                        if ($peisongpath) {
                            $peisongpathArr = explode(";", $peisongpath);
                            $peisongpathNew = $peisongpathArr[count($peisongpathArr) - 1];
                            if ($peisongpathNew) {
                                $path                          = explode(",", $peisongpathNew);
                                $list[$key]['peisongpath_lng'] = $path[0];
                                $list[$key]['peisongpath_lat'] = $path[1];
                            }
                        }
                    }
                }


                $list[$key]["reservesongdate"] = (int)$value["reservesongdate"]; //预定配送时间
                $list[$key]["delivery_time"] = (int)$value["delivery_time"]; //配送时间
                $list[$key]['receivingdate'] = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
                if ($list[$key]['reservesongdate'] > 0) {
                    $list[$key]['receivingdate'] = $list[$key]['reservesongdate'] - (int)$list[$key]['delivery_time']*60 - 60;
                }


            }
        }
        return array ("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 外卖订单信息详细
     */
    public function orderDetail()
    {
        global $dsql;
        global $langData;
        global $cfg_pointRatio;
        $id = is_numeric($this->param) ? $this->param : $this->param['id'];
        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        global $userLogin;
        $userid = $userLogin->getMemberID();

        $did = GetCookie("courier");
        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;

        if ($userid == -1 && $did == -1) {
            return array ("state" => 200, "info" => '请先登录！');
        }
        if ($did) {
            global $custom_systemturnnum;
            $qishousql = $dsql->SetQuery("SELECT `lng`,`lat`,`turnnum`,`getproportion` FROM `#@__waimai_courier` WHERE  `id` =" . $did." AND `quit` = 0");
            $qishoures = $dsql->dsqlOper($qishousql, "results");

            if (!$qishoures)  return array ("state" => 200, "info" => '骑手不存在或已离职！');

            $qslat         = $qishoures[0]['lng'];
            $qslng         = $qishoures[0]['lat'];
            $turnnum       = $qishoures[0]['turnnum'];
            $getproportion = $qishoures[0]['getproportion'];

            $now = time();
            $end = strtotime('+1 month');

            $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
            $yue_end  = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间

            $turnnum = $turnnum == 0 ? $custom_systemturnnum : $turnnum;

            //限制转单次数为0就是不限制
            $turnsql = $dsql->SetQuery("SELECT count(`id`) counnum FROM `#@__waimai_order_all` WHERE FIND_IN_SET('$did',`qxpeisongid` ) AND `qxtime`>= $yue_star AND `qxtime`< $yue_end");

            $turnre = $dsql->dsqlOper($turnsql, "results");

            $qsturennum = $turnnum == 0 ? 0 : (int)$turnnum - (int)$turnre['0']['counnum'];


        }

        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);
        if ($userid > -1) {
            $sql = $dsql->SetQuery("SELECT * FROM `" . $break_table . "` WHERE `id` = $id AND `uid` = $userid");
        } else {
            if ($did > -1) {
                // $sql = $dsql->SetQuery("SELECT * FROM `".$break_table."` WHERE `id` = $id AND `peisongid` = $did");
                $sql = $dsql->SetQuery("SELECT * FROM `" . $break_table . "` WHERE `id` = $id");
            }
        }

        $ret    = $dsql->dsqlOper($sql, "results");
        $return = array ();
        if ($ret) {
            $now = GetMkTime(time());

            $order         = $ret[0];
            $return["id"]  = $id;
            $return["uid"] = $order['uid'];
            $return["sid"] = $order['sid'];

            $shopname = $shopaddr = $shoptel = $coordX = $coordY = "";
            $sql      = $dsql->SetQuery("SELECT `shopname`, `address`, `phone`, `coordX`, `coordY`,`shop_banner`,`delivery_service`,`delivery_time`,`chucan_time`,`billingtype`,`specify`,`thingcategory` FROM `#@__waimai_shop` WHERE `id` = " . $order['sid']);
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $shopname         = $ret[0]['shopname'];
                $shop_banner      = explode(",", $ret[0]['shop_banner']);
                $shopaddr         = $ret[0]['address'];
                $shoptel          = $ret[0]['phone'];
                $coordX           = $ret[0]['coordX'];
                $coordY           = $ret[0]['coordY'];
                $delivery_service = $ret[0]['delivery_service'];
                $delivery_time    = $ret[0]['delivery_time'];
                $chucan_time      = $ret[0]['chucan_time'];
            }
            $return['qsturennum']       = $qsturennum;
            $return['shopname']         = $shopname;
            $return['delivery_service'] = $delivery_service;
            $return['delivery_time']    = $delivery_time;
            $return['shop_banner']      = getFilePath($shop_banner['0']);
            $return['shopaddr']         = $shopaddr;
            $return['shoptel']          = $shoptel;
            $return['coordX']           = $coordX;
            $return['coordY']           = $coordY;
            $return['billingtype']      = $ret[0]['billingtype'];
            $return['specify']          = $ret[0]['specify'];
            $return['thingcategory']    = $ret[0]['thingcategory'];

            $return['tostoredate']   = $ret[0]['tostoredate'];
            $return['zsbprice']      = $order['zsbprice'];
            $return["ordernum"]      = $order['ordernum'];
            $return["ordernumstore"] = $shopname . $order['ordernumstore'];
            $ordernumstorearr        = explode('-', $order['ordernumstore']);
            $return["qcma"]          = $ordernumstorearr[1];
            $return["state"]         = $order['state'];
            $return["fids"]          = $order['fids'];
            $return["selftime"]      = $order['selftime'];
            $return["food"]          = unserialize($order['food']);
            foreach ($return["food"] as $k => &$v) {
                $foodsql  = $dsql->SetQuery("SELECT `pics` FROM `#@__waimai_list` WHERE `id` = " . $v['id']);
                $foodre   = $dsql->dsqlOper($foodsql, "results");
                $pics     = explode(',', $foodre['0']['pics']);
                $v['pic'] = getFilePath($pics[0]);
            }

            $return["person"]       = $order['person'];
            $return["tel"]          = $order['tel'];
            $return["address"]      = $order['address'];
            $return["lng"]          = $order['lng'];
            $return["lat"]          = $order['lat'];
            $return["desk"]         = $order['desk'];
            $return["ordertype"]    = $order['ordertype'];
            $return["point"]        = $order['point'];
            $return["otherpeisong"] = (int)$custom_otherpeisong;

            $return["pointprice"]  = sprintf("%.2f",$order['point'] / $cfg_pointRatio);
            $return["priceamount"] = $return["pointprice"] + $order['amount'];

            $return["reservesongdate"] = $order['reservesongdate']; //预约配送时间
            //如果有预定时间，就计算可以接单时间
            $return['reservesongdate'] = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
            if ($return['reservesongdate'] > 0) {
                $return['reservesongdate'] = $return['reservesongdate'] - (int)$return['delivery_time']*60 - 60;
            }

            $juli           = $shopjluser =  getDistance($coordX, $coordY, $order['lat'], $order['lng']);
            $juli           = $juli > 1000 ? (sprintf("%.1f",
                    $juli / 1000) . $langData['siteConfig'][13][62]) : ($juli . $langData['siteConfig'][13][22]);  //距离   //公里  //米
            $return["juli"] = $juli;

            /*骑手距离商铺*/
            $julishop           = getDistance($qslat, $qslng, $coordX, $coordY);
            $julishop           = $julishop > 1000 ? (sprintf("%.1f",
                    $julishop / 1000) . $langData['siteConfig'][13][23]) : ($julishop . $langData['siteConfig'][13][22]);
            $return["julishop"] = $julishop;

            /*骑手距离用户*/
            $juliuser           = getDistance($qslat, $qslng, $order['lat'], $order['lng']);
            $juliuser           = $juliuser > 1000 ? (sprintf("%.1f",
                    $juliuser / 1000) . $langData['siteConfig'][13][23]) : ($juliuser . $langData['siteConfig'][13][22]);
            $return["juliuser"] = $juliuser;

            $_paytype    = '';
            $_paytypearr = array ();
            $paytypearr  = $order['paytype'] != '' ? explode(',', $order['paytype']) : array ();

            if ($paytypearr) {
                foreach ($paytypearr as $a => $b) {
                    if ($b != '') {
                        array_push($_paytypearr,
                            getDetailPaymentName($b, $order['balance'], $return['pointprice'], $order['payprice']));
                    }
                }
                if ($order['balance'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('money', $order['balance'], 0, 0));
                }
                if ($order['point'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('integral', 0, $return["pointprice"], 0));
                }
                if ($_paytypearr) {
                    $_paytype = join(',', array_unique($_paytypearr));
                }
            }

            //代付
            //            if($order['peerpay'] > 0){
            //                $_paytype = '朋友代付';
            //            }
            if ($order['peerpay'] > 0) {
                if ($order["paytype"] == "point") {
                    $payname = "积分";
                } else {
                    if ($order["paytype"] == "money") {
                        $payname = "余额";
                    } else {
                        if ($order["paytype"] == "wxpay") {
                            $payname = "微信";
                        } else {
                            if ($order["paytype"] == "alipay") {
                                $payname = "支付宝";
                            }
                        }
                    }
                }
                $userinfo = $userLogin->getMemberInfo($order['peerpay']);
                if (is_array($userinfo)) {
                    $_paytype = '[' . $userinfo['nickname'] . ']' . $payname . '代付';
                } else {
                    $_paytype = '[好友]' . $payname . '代付';
                }

            }

            //退款信息
            $userinfo                = $userLogin->getMemberInfo($order['uid']);
            $return["refrundstate"]  = $order['refrundstate'];
            $return["refrundamount"] = $order['refrundamount'];
            $return["refrunddate"]   = $order['refrunddate'];
            $return["refrundno"]     = $order['refrundno'];
            $return["refrundadmin"]  = $userinfo['username'] ? $userinfo['username'] : '';


            $return["paytype"]                    = $_paytype;
            $return["amount"]                     = $order['amount'];
            $return["priceinfo"]                  = unserialize($order['priceinfo']);
            $return["priceinfo"][0]['point']      = 'pointprice';
            $return["priceinfo"][0]['pointprice'] = $return["pointprice"];
            $peisongarr                           = array_combine(array_column($return["priceinfo"], 'type'), array_column($return["priceinfo"], "amount"));
            $peisong                              = $peisongarr['peisong'] ? $peisongarr['peisong'] : 0;
            $auth_peisong                         = $peisongarr['auth_peisong'] ? $peisongarr['auth_peisong'] : 0;
            $peisong_attach                       = $peisongarr['peisong_attach'] ? $peisongarr['peisong_attach'] : 0;
//            $peisongprice                         = $peisong - $auth_peisong ;

            $peisongprice                         = $peisong;

            //恶劣天气配送费
            if (isset($peisongarr['peisong_badWeather'])) {
                $peisongprice += $peisongarr['peisong_badWeather'];
            }

            $return["peisongprice"] = $peisongprice;
            $return["attach"]       = $peisong_attach;
            $return["preset"]       = unserialize($order['preset']);
            $return["needfenzhong"] = $order['needfenzhong'];
            $return["note"]         = str_replace("\n","",$order['note']);
            $return["pubdate"]      = $order['pubdate'];
            $return["paydate"]      = $order['paydate'];
            $return["paylimittime"] = (1800 - ($now - $order['pubdate'])) > 0 ? (1800 - ($now - $order['pubdate'])) : 0;
            $return["confirmdate"]  = $order['confirmdate'];
            $return["peidate"]      = $order['peidate'];
            $return["peisongid"]    = $order['peisongid'];
            $return["otherparam"]   = $order['otherparam'] != '' ? unserialize($order['otherparam']) : array ();

            if ($order['peisongid'] && $order['is_order'] == 0) {
                $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = " . $order['peisongid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $return['peisongname']  = $ret[0]['name'];
                    $return['peisongphone'] = $ret[0]['phone'];
                }
            } else {
                $otherCourier = $order['othercourierparam'] != '' ? unserialize($order['othercourierparam']) : array ();

                if ($otherCourier) {

                    $peisong      = $otherCourier['driver_name'];
                    $peisongphone = $otherCourier['driver_mobile'];
                    $peisonglogistic = $otherCourier['driver_logistic'];

                } else {

                    $peisong      = '未知';
                    $peisongphone = '';
                }

                $return['peisongname']  = $peisong;
                $return['peisongphone'] = $peisongphone;
                $return['peisonglogistic'] = '';
                $peisongbiaoshi=array('mtps' => '美团', 'fengka' => '蜂鸟', 'dada' => '达达','shunfeng' => '顺丰','bingex' => '闪送','uupt' => 'UU跑腿','dianwoda' => '点我达','aipaotui' => '爱跑腿','caocao' => '曹操','fuwu' => '快服务');
                foreach ($peisongbiaoshi as $kk=>$vv){
                    if ($kk == $peisonglogistic){
                        $return['peisonglogistic'] = $vv;
                    }
                }
            }

            $return["songdate"] = $order['songdate'];
            $return["okdate"]   = $order['okdate'];
            $return["failed"]   = $order['failed'];

            $peisongpath           = $order['peisongpath'];
            $is_other              = $order['is_other'];
            $return["peisongpath"] = $peisongpath;


            if ($peisongpath && $is_other == 0 && $custom_otherpeisong != 2) {
                $peisongpathArr = explode(";", $peisongpath);
                $peisongpathNew = $peisongpathArr[count($peisongpathArr) - 1];
                if ($peisongpathNew) {
                    $path                      = explode(",", $peisongpathNew);
                    $return['peisongpath_lng'] = $path[0];
                    $return['peisongpath_lat'] = $path[1];
                }
            } else {
                if (($order['state'] == 4 || $order['state'] == 5) && $custom_otherpeisong == 2) {

                    $pluginFile = HUONIAOINC . "/plugins/15/youShanSuDa.class.php";
                    include $pluginFile;

                    $youshansudaClass = new youshansuda();


                    $paramArray = array (
                        'order_no' => $order['otherordernum']
                    );

                    $results = $youshansudaClass->riderLnglat($paramArray);

                    if ($results['code'] == '200' && $results['success'] == 'true') {

                        $peisongpatharr = $peisongpath != '' ? explode(';', $peisongpath) : array ();

                        $lnglat = $results['data']['ps_lng'] . ',' . $results['data']['ps_lat'];
                        if ($peisongpatharr && !in_array($lnglat, $peisongpatharr)) {

                            array_push($peisongpatharr, $lnglat);

                            $peisongpath = join(';', $peisongpatharr);

                            $upsql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `peisongpath` = '$peisongpath' WHERE `id` = '$id'");
                            $dsql->dsqlOper($upsql, "results");
                        }

                        $return['peisongpath_lng'] = $results['data']['ps_lng'];
                        $return['peisongpath_lat'] = $results['data']['ps_lat'];
                    } else {
                        $return['peisongpath_lng'] = '';
                        $return['peisongpath_lat'] = '';
                    }
                }elseif (($order['state'] == 4 || $order['state'] == 5) && $custom_otherpeisong == 3){
                    $pluginFile = HUONIAOINC . "/plugins/19/maiyatian.class.php";
                    include $pluginFile;

                    $maiyatianClass = new maiyatian();

                    $paramArray = array (
                        'origin_id' => $order['ordernum']
                    );
                    $results = $maiyatianClass->riderLnglat($paramArray);
                    if ($results['code'] == 1){
                        $peisongpatharr = $peisongpath != '' ? explode(';', $peisongpath) : array ();

                        $lnglat = $results['data']['rider_longitude'] . ',' . $results['data']['rider_latitude'];
                        if (!in_array($lnglat, $peisongpatharr)) {

                            array_push($peisongpatharr, $lnglat);

                            $peisongpath = join(';', $peisongpatharr);

                            $upsql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `peisongpath` = '$peisongpath' WHERE `id` = '$id'");
                            $dsql->dsqlOper($upsql, "results");
                        }

                        $return['peisongpath_lng'] = $results['data']['rider_longitude'];
                        $return['peisongpath_lat'] = $results['data']['rider_latitude'];
                    } else {
                        $return['peisongpath_lng'] = '';
                        $return['peisongpath_lat'] = '';
                    }

                }
            }


            // // 评价
            // $return['iscomment'] = $order['iscomment'];
            // if ($order['iscomment'] == 1) {
            //     // $sql               = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `uid` = $userid AND `oid` = $id AND `type` = 0");
            //     $sql = $dsql->SetQuery("SELECT * FROM `#@__public_comment_all` WHERE `userid` = '$userid' AND `oid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
            //     $ret               = $dsql->dsqlOper($sql, "results");
            //     $return['comment'] = $ret[0];
            // }


            // 评价
            $return['iscomment'] = $order['iscomment'];
            if ($order['iscomment'] == 1) {
                $sql               = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `uid` = $userid AND `oid` = $id AND `type` = 0");
                $ret               = $dsql->dsqlOper($sql, "results");
                $return['comment'] = $ret[0];
            }


            //分销商信息
            $fxs = array ();
            // $sql = $dsql->SetQuery("SELECT u.`uid` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` u ON u.`uid` = m.`from_uid` WHERE m.`id` = " . $order['uid']);
            // $ret = $dsql->dsqlOper($sql, "results");
            // if($ret){
            //     $fxs_id = $ret[0]['uid'];
            //     $fxs = $userLogin->getMemberInfo($fxs_id);
            // }
            $return['chucan_time'] = $chucan_time;
            $return['fxs']         = $fxs;
            $orderFinished         = 0;
            if ($order['state'] == 1) {
                $orderFinished = 1;
            }
            $return['orderFinished'] = $orderFinished;

            //开始计算时间，正常订单用支付时间，预定订单用预定时间-配送时间
            $orderStartDate = $order['paydate'];
            if ($order['reservesongdate'] > 0) {
                $orderStartDate = $order['reservesongdate'] - (int)$delivery_time*60;
            }

            if ($order['state'] == 1) {
                $truetime = ($order['okdate'] - $orderStartDate) % 86400 / 60;

                //计算配送时间也要做判断
                $songdatediff = ($order['okdate'] - $order['songdate']) % 86400 / 60;
            } else {
                $truetime = (time() - $orderStartDate) % 86400 / 60;

                //计算配送时间也要做判断
                $songdatediff = (time() - $order['songdate']) % 86400 / 60;
            }


            $totimediff            = ($order['tostoredate'] - $order['peidate']) % 86400 / 60;
            $return['totimediff']  = $totimediff; /*骑手到店时间差*/
            $return['tostoredate'] = $order['tostoredate'];
            $return['mealtime']    = $order['mealtime'] ? $order['mealtime'] : '';


            //$songdatediff           = ($order['okdate'] - $order['songdate']) % 86400 / 60;

            $return['songdatediff'] = $songdatediff; /*取货时间差*/
            $return['qstime']       = $delivery_time - $chucan_time; /*骑手送货时间*/

            /*即将超时*/
            $jijiangtime = ($delivery_time - $truetime) <10 ? '' : '1';
            $return['jijiangtime']    = $jijiangtime;
            $return['chaoshi'] = 0;
            $return['cdtype']  = 0;
            if ($truetime > $delivery_time) {
                $return['chaoshi'] = 1;
                //                if($order['state'] ==1){
                $sjcctime = $truetime - $songdatediff; /*商家实际出餐时间*/

                $confirmdate = $order['confirmdate'];  //商家确认时间
                $mealtime = $order['mealtime'];  //商家出餐时间

                //计算商家从确认到出餐用了多少分钟
                $mealtime_ = $mealtime - $confirmdate;
                $mealtime_ = floor($mealtime_ % 86400 / 60);
                
                //商家出餐超时，有两种情况：
                //1. 商家没有操作确认出餐，则出餐时间以骑手取餐时间为准
                //2. 商家操作了确认出餐，则出餐时间以商家确认时间为准
                if (($sjcctime > $chucan_time && !$mealtime) || ($mealtime && $mealtime_ > $chucan_time)) {
                    $return['cdtype'] = 1; /*商家出餐超时*/
                } else {
                    $return['cdtype'] = 2; /*骑手配送超时*/
                }
                //                }
            }
            $return['yjtime'] = $delivery_time * 60 + $orderStartDate;
            if ($order['state'] == 0) {
                $param            = array (
                    "service"  => "waimai",
                    "template" => "pay",
                    "param"    => "ordernum=" . $order['ordernum']
                );
                $return['payurl'] = getUrlPath($param);
            }

            if ($did) {

                $gebili  = $order['courier_gebili']!='' ? unserialize($order['courier_gebili']) : array () ;

                $additionprice = $peisongTotal = $courierfencheng = 0;
                if ($gebili) {
                    $additionprice   = $gebili['additionprice'];
                    $courierfencheng = $gebili['courierfencheng'];
                } else {

                    $courierfencheng = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;

                }
                $courier_get = $CourierP = 0;
                $juliPerson  = getDistance($order['lng'], $order['lat'], $coordY, $coordX);

                if ($juliPerson == 0) {

                    $juliPerson  = oldgetDistance($order['lng'], $order['lat'], $coordY, $coordX);
                }
                $juliPerson = $juliPerson != 0 ? $juliPerson / 1000 : $juliPerson;

//                $CourierP = $getproportion != '0.00' ? $getproportion : (float)$customwaimaiCourierP;
                $CourierP = $courierfencheng;

                /*骑手额外所得*/
                $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
                /*外卖额外加成要求*/
                $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

                sort($waimaadditionkm);
                $satisfy = $needfenzhong = $additionprice = 0;
                $qsoktime = 0;
                if ($order['state'] == 1) {
                    $qsoktime   = ($order['okdate'] - $order['peidate'])%86400/60;
                }
                for ($i = 0; $i < count($waimaadditionkm); $i++) {
                    if ($juliPerson > $waimaadditionkm[$i][0] && $juliPerson <= $waimaadditionkm[$i][2] && $qsoktime <= $waimaadditionkm[$i][1]) {
                        $satisfy      = 1;
                        $needfenzhong = $waimaadditionkm[$i][1];
                        break;
                    }
                }
                if ($satisfy == 1) {

                    for ($a = 0; $a < count($waimaiorderprice); $a++) {
                        if ($order['amount'] >= $waimaiorderprice[$a][0] && $order['amount'] <= $waimaiorderprice[$a][1]) {
                            $additionprice = $waimaiorderprice[$a][2];
                        }
                    }
                }

                $priceinfo = $order['priceinfo'] != '' ? unserialize($order['priceinfo']) : array ();
                if (is_array($priceinfo) && $priceinfo) {
                    $peisongamount = $auth_amount =  0;
                    foreach ($priceinfo as $a => $b) {
                        if ($b['type'] == 'peisong') {
                            $peisongamount += $b['amount'];
                        }elseif($b['type'] == 'auth_peisong'){
                            $auth_amount +=  $b['amount'];
                        }elseif($b['type'] == 'peisong_badWeather'){
                            //恶劣天气配送费
                            $peisongamount +=  $b['amount'];
                        }
                    }

                    $courier_get = $peisongamount * $CourierP / 100;
                }
                $return['needfenzhong']  = sprintf('%.2f',$needfenzhong);
                $return['additionprice'] = sprintf('%.2f',$additionprice);
                $return['courier_get']   = sprintf('%.2f',$courier_get);
                $return["baseprice"]     = sprintf('%.2f',$peisongprice * $courierfencheng /100);
                $return["peisongprice"]  = sprintf('%.2f',($peisongprice * $courierfencheng /100) + $additionprice);

                $return['cptype'] = $order['cptype'];
                $return['cpmoney'] = $order['cpmoney'];

                //准时宝赔付
                if($order['cptype'] == 2){
                    $return["peisongprice"] -= $order['cpmoney'];
                }

                $return['serviceprice']  = sprintf('%.2f',($peisongamount - $courier_get));
            }
            return $return;

        } else {
            return array ("state" => 200, "info" => '订单不存在！');
        }

    }


    /**
     * 根据订单ID获取骑手坐标
     */
    public function getCourierLocation()
    {
        global $dsql;
        $id = $this->param['orderid'];
        if (!$id) {
            return array ("state" => 200, "info" => '订单不存在！');
        }

        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);

        $sql = $dsql->SetQuery("SELECT `peisongpath` FROM `" . $break_table . "` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            return $ret[0]['peisongpath'];
        }
    }

    public function getpaotuiCourierLocation()
    {
        global $dsql;
        $courierid = $this->param['courierid'];
        if (!$courierid) {
            return array ("state" => 200, "info" => '订单不存在！');
        }


        $sql = $dsql->SetQuery("SELECT `lng`,`lat` FROM `#@__waimai_courier` WHERE `id` = '" . $courierid . "'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            return array ('lng' => $ret[0]['lat'], 'lat' => $ret[0]['lng']);
        }
    }


    /**
     * 配送员登录
     */
    public function courierLogin()
    {
        global $dsql;
        global $langData;
        $ip        = GetIP();
        $ipaddr    = getIpAddr($ip);
        $areaCode  = $this->param['areaCode'];
        $vercode   = $this->param['validcode'];
        $username  = $this->param['username'];
        $password  = $this->param['password'];
        $logintype = $this->param['logintype']; /* accountLogin-密码登录,noPsdLogin-验证码登录*/

        //        if($logintype == 'noPsdLogin'){
        //            $username = $userphone;
        //        }
        $coursql = $dsql->SetQuery("SELECT `id`,`status` FROM `#@__waimai_courier` WHERE `username` = '$username' OR `phone` = '" . $username . "'");
        $courres = $dsql->dsqlOper($coursql, "results");

        if ($courres) {
            if ($courres[0]['status'] == 0) {
                return array ('state' => 200, 'info' => '该手机号已经提交过注册,请等待审核！');
            }
            $logindid = (int)$courres[0]['id'];
        } else {
            return array ('state' => 200, 'info' => '账号错误！');
        }

        if ($logintype == 'accountLogin') {

            if (empty($username)) {
                return array ("state" => 200, "info" => '请输入手机号或用户名！');
            }

            if (empty($password)) {
                return array ("state" => 200, "info" => '请填写密码！');
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE (`username` = '$username' OR `phone` = '$username') AND `password` = '$password'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                PutCookie("courier", $ret[0]['id'], 24 * 60 * 60 * 7, "/");

                return array ("state" => 100, "info" => '登录成功！', 'did' => $ret[0]['id']);

            } else {
                return array ("state" => 200, "info" => '用户名或密码错误！');
            }
        } else {
            $did = GetCookie("courier"); /*骑手id*/
            if (empty($did) || $logindid != $did) {
                $areaCode = $areaCode == '86' ? '' : $areaCode;

                //国际版需要验证区域码
                $cphone_  = $username;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $username;
                    }
                }

                //判断验证码
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'sms_login' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if ($res_code) {
                    $code = $res_code[0]['code'];
                    if (strtolower($vercode) != $code) {
                        return array ('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                    }
                } else {
                    return array ('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                }

                $sql = $dsql->SetQuery("SELECT `id`,`password` FROM `#@__waimai_courier` WHERE `username` = '$username' OR `phone` = '$username'  AND `quit` = 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    PutCookie("courier", $ret[0]['id'], 24 * 60 * 60 * 7, "/");
                    if ($ret[0]['password'] == '') {
                        return 'setpws';
                    } else {

                        return array ("state" => 100, "info" => '登录成功！', 'did' => $ret[0]['id']);
                    }

                } else {
                    return array ("state" => 200, "info" => '用户名或密码错误！');
                }

            } else {

                return array ('state' => 200, 'info' => $langData['siteConfig'][33][43]);//您已经登录，无须重复登录！
            }
        }
    }

    /**
     * 配送员注册
     * */
    public function courierReg()
    {
        global $dsql;
        global $langData;
        $username    = $this->param['username'];
        $age         = (int)$this->param['age'];
        $sex         = (int)$this->param['sex'];
        $phone       = (int)$this->param['phone'];
        $cityid      = (int)$this->param['cityid'];
        $IDnumber    = $this->param['IDnumber'];
        $idCardback  = $this->param['idCardback'];
        $idCardfront = $this->param['idCardfront'];
        $academic    = $this->param['academic'];
        $areaCode    = (int)$this->param['areaCode'];
        $code        = (int)$this->param['code'];
        $vertcode    = (int)$this->param['vertcode'];

        $ip       = GetIP();
        $ipaddr   = getIpAddr($ip);
        $username = cn_substrR($username, 10);
        if ((empty($username) || $username == "undefined") && $vertcode == 0) {
            return array ('state' => 200, 'info' => '请填写姓名');
        }
        if (empty($phone)) {
            return array ('state' => 200, 'info' => '请填写手机号');
        }
        if (empty($areaCode) && $vertcode == 1) {
            return array ('state' => 200, 'info' => '请填验证码');
        }

        if ($vertcode == 0) {
            if ($age == '') {
                return array ('state' => 200, 'info' => '请填写年龄!');
            }

            if (!$academic) {

                return array ('state' => 200, 'info' => '请选择城市！');
            }
            $idcard = cn_substrR($IDnumber, 18);
            if (!$idcard || $idcard == "undefined") {

                return array ('state' => 200, 'info' => '请填写正确身份证号！');
            }

            if (!$idCardback) {

                return array ('state' => 200, 'info' => '请上传身份证正面！');
            }
            if (!$idCardfront) {

                return array ('state' => 200, 'info' => '请上传身份证反面！');
            }
        }
        $coursql = $dsql->SetQuery("SELECT `id`,`status` FROM `#@__waimai_courier` WHERE `phone` = " . $phone);

        $courres = $dsql->dsqlOper($coursql, "results");

        if ($courres) {
            if ($courres[0]['status'] == 0) {
                return array ('state' => 200, 'info' => '该手机号已经提交过注册,请等待审核！');
            }
            return array ('state' => 200, 'info' => '该手机号已经注册,请直接登录！！');
        }

        // $code = $code == '86' ? '' : $code;
        //国际版需要验证区域码
        $cphone_  = $phone;
        $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $international = $results[0]['international'];
            if ($international) {
                $cphone_ = $code . $phone;
            }
        }


        //判断验证码

        if ($vertcode == 1) {

            $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'signup' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
            $res_code = $dsql->dsqlOper($sql_code, "results");
            if($res_code){
                $code = $res_code[0]['code'];
                if(strtolower($areaCode) != $code){
                    return array('state' =>200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                }
            }else{
                return array('state' =>200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
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
                foreach($addrblacks as $k=>$v){
                    if($phoneaddr == $v){
                        return array('state' =>200, 'info' => "当前区域禁止注册");
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
                foreach($addrwhites as $k=>$v){
                    if($phoneaddr == $v){
                        $contain_white = true;
                        break;
                    }
                }
                if(!$contain_white){
                    return array('state' =>200, 'info' => "当前区域禁止注册");
                }
            }
            return 'ok';
        }
        $time = time();
        $courierSql = $dsql->SetQuery("INSERT INTO `#@__waimai_courier` (`username`,`name`,`age`,`sex`,`phone`,`IDnumber`,`idCardback`,`idCardfront`,`cityid`,`academic`,`regtime`) VALUES ('$phone','$username','$age','$sex','$phone','$IDnumber','$idCardback','$idCardfront','$cityid','$academic','$time')");

        $courierres = $dsql->dsqlOper($courierSql, "update");

        if ($courierres == "ok") {
            return '注册成功!';
        } else {
            return array ('state' => 200, 'info' => '注册失败！请联系系统管理员');
        }

    }

    /**
     * 配送员修改密码
     * */
    public function courierEditpwsphone()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $ip       = GetIP();
        $ipaddr   = getIpAddr($ip);
        $from     = $this->param['from'];
        $password = $this->param['password'];
        $phone    = $this->param['phone'];
        $edittype = $this->param['edittype'];
        $areaCode = $this->param['areaCode'];
        $vercode  = $this->param['code'];

        $did = GetCookie("courier"); /*骑手id*/

        $coursql = $dsql->SetQuery("SELECT * FROM `#@__waimai_courier` WHERE  `id` =" . $did);
        $courres = $dsql->dsqlOper($coursql, "results");
        if (empty($courres)) {
            return array ('state' => 200, 'info' => '暂无该骑手！');
        }

        $codeverification = 0;
        $codestadus       = '';
        if ($did) {
            if ($edittype == 'edpws') {
                
                $validatePassword = validatePassword($password);
                if($validatePassword != 'ok'){
                    return array ('state' => 200, 'info' => $validatePassword);
                }
                
                /*注册之后修改密码*/
                if ($from == "loginafter") {
                    //                  $npaws = $userLogin->_getSaltedHash($password);
                    $upcoursql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `password` = '" . $password . "' WHERE `id` = " . $did);
                    $upcourres = $dsql->dsqlOper($upcoursql, "update");
                    if ($upcourres == 'ok') {
                        return '设置成功';
                    } else {
                        return array ('state' => 200, 'info' => '设置失败！');
                    }
                } else {
                    //
                    //                  $npaws = $userLogin->_getSaltedHash($password);
                    $upcoursql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `password` = '" . $password . "' WHERE `id` = " . $did);
                    $upcourres = $dsql->dsqlOper($upcoursql, "update");

                    if ($upcourres == 'ok') {
                        return '修改成功';
                    } else {
                        return array ('state' => 200, 'info' => '修改失败！');
                    }

                }
            } else {
                if ($phone == $courres[0]['phone']) {
                    return array ('state' => 200, 'info' => '不可与原手机号相同!');
                }

                $areaCode = $areaCode == '86' ? '' : $areaCode;
                $cphone_  = $phone;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results  = $dsql->dsqlOper($archives, "results");

                if ($results) {
                    $international = $results[0]['international'];
                    if ($international) {
                        $cphone_ = $areaCode . $phone;
                    }
                }

                //判断验证码
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'auth' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");

                if ($res_code) {
                    $code = $res_code[0]['code'];
                    if (strtolower($vercode) != $code) {
                        return array ('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
                    }
                } else {
                    return array ('state' => 200, 'info' => '请重新发送！');//验证码输入错误，请重试！
                }
                $upcoursql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `phone` = " . $phone . " WHERE `id` = " . $did);
                $upcourres = $dsql->dsqlOper($upcoursql, "update");

                if ($upcourres == 'ok') {
                    return '修改成功';
                } else {
                    return array ('state' => 200, 'info' => '修改失败！');
                }

            }
        } else {
            return array ('state' => 200, 'info' => "请先去登录");
        }
    }


    /**
     * 修改密码手机号验证
     * */
    public function verificationCode()
    {
        global $dsql;
        global $langData;

        $areaCode = $this->param['areaCode'];
        $vercode  = $this->param['vercode'];
        $phone    = $this->param['phone'];

        $ip       = GetIP();
        $ipaddr   = getIpAddr($ip);
        $areaCode = $areaCode == '86' ? '' : $areaCode;

        if ($phone == '') {
            return array ('state' => 200, 'info' => '请填写手机号！');
        }
        if ($vercode == '') {
            return array ('state' => 200, 'info' => '请填写验证码！');
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

        //判断验证码
        $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'auth' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
        $res_code = $dsql->dsqlOper($sql_code, "results");

        if ($res_code) {
            $code = $res_code[0]['code'];
            if (strtolower($vercode) != $code) {
                return array ('state' => 200, 'info' => $langData['siteConfig'][21][222]);//验证码输入错误，请重试！
            }
        } else {
            return array ('state' => 200, 'info' => '请重新发送！');//验证码输入错误，请重试！
        }

        return "验证成功!";
    }

    /**
     * 骑手订单数据
     *
     * @return array
     */
    public function courierOrderList()
    {
        global $dsql;
        global $installModuleArr;
        $pageinfo = $list = array ();
        $state    = $page = $pageSize = $where = "";

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
        $shopinc = HUONIAOINC . "/config/shop.inc.php";
        include $shopinc;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $state     = $this->param['state'];
                $statetype = $this->param['statetype'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $ordertype = $this->param['ordertype'];
            }
        }

        $clng = $clat = "";
        $did  = GetCookie("courier");
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`,`cityid`,`getproportion`,`paotuiportion`,`shopportion` FROM `#@__waimai_courier` WHERE `id` = $did AND `quit` = 0 ");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在！');
            }

            $clng          = $ret[0]['lng'];
            $clat          = $ret[0]['lat'];
            $cityid        = $ret[0]['cityid'];
            $getproportion = $ret[0]['getproportion'];
            $paotuiportion = $ret[0]['paotuiportion'];
            $shopportion = $ret[0]['shopportion'];

        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        if (!$state) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        //        if ($ordertype == "waimai") {
        //            $where = " WHERE `state` in ($state) AND o.`ordertype` = 0";
        //        }else{
        //            $where = " WHERE `state` in ($state)";
        //        }

        if ($state != "3" || ($statetype == 1)) {
            $where .= " AND o.`peisongid` = $did ";
        }
        $unionall = " UNION ALL ";


        /*statetype 参数区分是骑手首页 订单数据 还是历史订单数据 1 历史*/
        if ($statetype == 1) {
            // $state = "1,7"; /*历史订单*/
            if ($ordertype != '') {
                $unionall = '';
            }
        }
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        /*外卖*/

        $warchives1 = "SELECT '' as 'qsamount','' branchid,o.`id`, o.`ordernum`,o.`ordernumstore`,o.`note`,o.`paytype`,o.`amount` price ,'' payprice,'' tip, o.`person`, o.`tel`, o.`address`, o.`lng`, o.`lat`,o.`peidate`, o.`pubdate`,o.`paydate`,o.`state`,o.`songdate`, o.`okdate`,o.`priceinfo`,o.`amount`,o.`mealtime`,s.`shopname`, s.`phone`, s.`coordX`, s.`coordY`,s.`delivery_time`, s.`address` address1,'' type,o.`courierfencheng`,'waimai' cattype, '' gettime, '' totime,o.`reservesongdate` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE 1=1 AND o.`ordertype` = 0 AND o.`selftime` = 0 AND s.`merchant_deliver` !=1 AND s.`cityid` = " . $cityid . $where;
        $warchives  = $warchives1 . " AND `state` in (" . $state . ") " . $unionall;

        $parchives1 = "SELECT '' as 'qsamount','' branchid,o.`id`,o.`ordernum`,'' ordernumstore, o.`note`,o.`paytype`,o.`price`,'' payprice,o.`tip`, o.`getperson` person, o.`gettel` tel, o.`address`, o.`lng`, o.`lat`,o.`peidate`, o.`pubdate`,o.`paydate`, o.`state`,o.`songdate`, o.`okdate`,`freight`priceinfo,`freight` amount,''mealtime, o.`shop` shopname,''phone,o.`buylat` coordX, o.`buylng` coordY,'' delivery_time,o.`buyaddress` address1,o.`type`,o.`courierfencheng`,'paotui' cattype, o.`gettime`, o.`totime`, '0' reservesongdate FROM `#@__paotui_order` o WHERE 1 = 1 AND o.`cityid` = " . $cityid . $where;

        $parchives = $parchives1 . " AND o.`state` in (" . $state . ")";

        /*跑腿*/
        /*商城(不包含抢单) state为3是抢单状态*/
        $sresults  = array ();
        $sarchives = '';
        if ($state != 3) {

            $where1 = '';
            if ($state == "4") {
                //                $where1 .= " AND `okdate` = 0";
                $where1 .= " AND o.`state` = 6  AND o.`peisongid` != 0 AND o.`songdate` = 0";
            } else {
                if ($state == '5') {
                    $where1 .= " AND o.`state` = 6 AND o.`exp_date` != 0 AND o.`peisongid` != 0 AND o.`songdate` != 0";
                } else {
                    if ($state == "1") {
                        $where1 .= " AND o.`songdate` != 0 AND o.`okdate` != 0";
                    } else {
                        if ($state == "7") {
                            $where1 .= " AND o.`state` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0)";
                        } else {
                            if ($state == "3") {
                                $where1 .= " AND 1 = 2";
                            } else {
                                if ($state == "1,7") {
                                    $where1 .= " AND ((o.`state` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0)) OR (o.`songdate` != 0 AND o.`okdate` != 0))";
                                }
                            }
                        }
                    }
                }
            }

            if ($statetype == 1) {
                if ($state == "1,7") {

                    $where1 = ' AND ((o.`state` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0)) OR (o.`songdate` != 0 AND o.`okdate` != 0))';
                } else {
                    if ($state == "1") {
                        $where1 .= " AND o.`songdate` != 0 AND o.`okdate` != 0";
                    } else {
                        $where1 .= " AND o.`state` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0)";
                    }
                }
            }

            if (in_array('shop', $installModuleArr)) {
                $sarchives1 = $unionall . " SELECT o.`qsamount`,o.`branchid`,o.`id`,o.`ordernum`,'' ordernumstore,o.`note`,o.`paytype`,o.`amount` price,o.`payprice`,'' tip, o.`people` person, o.`contact` tel, o.`address` , o.`lng`, o.`lat`,o.`peidate`,o.`orderdate` pubdate,o.`paydate`,o.`orderstate` state,o.`songdate`, o.`okdate`,o.`priceinfo`,'' amount,''mealtime,s.`title` shopname,s.`tel` phone,s.`lat` coordX, s.`lng` coordY,'' delivery_time, s.`address` address1,'' type ,'' courierfencheng,'shop' cattype, '' gettime, '' totime, '0' reservesongdate FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store`  LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE `peisongid` = $did AND (s.`cityid` = '$cityid' or b.`cityid` = '$cityid')";
                
                $sarchives .= $sarchives1 . str_replace('state', 'orderstate', $where1);
            }


        }

        if ($statetype == 1 && $ordertype != '') {
            $zxsql = '';
            if ($ordertype == 'waimai') {
                $zxsql  = $warchives;
                $zxsql1 = $warchives1 . " AND o.`state` = 1" . $unionall; /*成功*/
                $zxsql2 = $warchives1 . " AND o.`state` = 7" . $unionall; /*失败*/
            } else {
                if ($ordertype == 'paotui') {
                    $zxsql  = $parchives;
                    $zxsql1 = $parchives1 . " AND o.`state` = 1"; /*成功*/
                    $zxsql2 = $parchives1 . " AND o.`state` = 7"; /*失败*/
                } else {
                    $zxsql  = $sarchives;
                    $zxsql1 = $unionall . $sarchives1 . " AND o.`songdate` != 0 AND o.`okdate` != 0";
                    $zxsql2 = $unionall . $sarchives1 . " AND o.`orderstate` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0)";
                }
            }
            $allsql  = $dsql->SetQuery($zxsql);
            $allsql1 = $dsql->SetQuery($zxsql1);
            $allsql2 = $dsql->SetQuery($zxsql2);
        } else {

            /*后台关闭外卖骑手抢单功能*/ global $customIsopenqd;
            if ($customIsopenqd == 0 && $state == 3) {
                $warchives = $sarchives = '';
            }
            $allsql  = $dsql->SetQuery(" SELECT * FROM (" . $warchives . $parchives . $sarchives . ") as seall");
            $allsql1 = $dsql->SetQuery(" SELECT * FROM (" . $warchives1 . " AND o.`state` = 1 UNION ALL " . $parchives1 . " AND o.`state` = 1  " . ($sarchives1 ? $sarchives1 . " AND o.`songdate` != 0 AND o.`okdate` != 0" : '') . ") as seall");
            $allsql2 = $dsql->SetQuery(" SELECT * FROM (" . $warchives1 . " AND o.`state` = 7 UNION ALL " . $parchives1 . " AND o.`state` = 7  " . ($sarchives1 ? $sarchives1 . " AND (o.`orderstate` = 10 AND (o.`songdate` = 0 OR o.`okdate` = 0))" : '') .") as seall");
        }
        $totalCount = $dsql->dsqlOper($allsql, "totalCount");

        if ($statetype == 1) {
            $totalCount1 = $dsql->dsqlOper($allsql1, "totalCount"); /*成功*/
            $totalCount2 = $dsql->dsqlOper($allsql2, "totalCount"); /*失败*/
        }
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);
        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"        => $page,
            "pageSize"    => $pageSize,
            "totalPage"   => $totalPage,
            "totalCount"  => $totalCount,
            "totalCount1" => (int)$totalCount1,
            "totalCount2" => (int)$totalCount2
        );
        $atpage   = $pageSize * ($page - 1);

        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($allsql . " ORDER BY `peidate` DESC, `gettime` ASC, `id` ASC" . $where, "results");
        // 外卖
        $list = array ();

        if ($results) {
            foreach ($results as $k => $v) {
                $list[$k]['id']            = $v['id'];
                $list[$k]['sid']           = $v['sid'];
                $list[$k]['note']          = $v['note'];
                $list[$k]['ordernum']      = substr($v['ordernum'], -4);
                $list[$k]['ordernumstore'] = $v['ordernumstore'];
                $list[$k]['shopname']      = $v['shopname'];
                $list[$k]['person']        = aesDecrypt($v['person']);
                $list[$k]['tel']           = aesDecrypt($v['tel']);
                $list[$k]['phone']         = $v['phone'];
                $list[$k]['address']       = aesDecrypt($v['address']);
                $list[$k]['address1']      = $v['cattype'] == 'paotui' ? aesDecrypt($v['address1']) : $v['address1'];
                $list[$k]['lng']           = $v['lng'];
                $list[$k]['mealtime']      = $v['mealtime'];
                $list[$k]['lat']           = $v['lat'];
                $list[$k]['price']         = $v['price'];
                $list[$k]['tip']           = $v['tip'];
                $list[$k]['peidate']       = $v['peidate'];
                $list[$k]['pubdate']       = $v['pubdate'];
                $list[$k]['state']         = $v['state'];
                $list[$k]['cattype']       = $v['cattype'];
                $list[$k]['coordX']        = $v['coordX'];
                $list[$k]['coordY']        = $v['coordY'];
                $list[$k]['type']          = $v['type'];
                $list[$k]['amount']        = $v['amount'];
                $list[$k]['delivery_time'] = $v['delivery_time'];

                $list[$k]['reservesongdate'] = 0; //预定配送时间

                //取货/送达时间
                if ($v['cattype'] == 'paotui'){
                    //判断日期是否为今天
                    // $dateData1 = GetMkTime(date('Y-m-d', $v['gettime']));

                    $_totime = $v['type'] == 1 || $v['state'] == 3 || $v['state'] == 4 ? $v['gettime'] : $v['totime'];

                    $dateData1 = GetMkTime(date('Y-m-d', time()));
                    $dateData2 = GetMkTime(date('Y-m-d', $_totime));

                    $list[$k]["totime"] = !$_totime ? '尽快' : ($dateData1 == $dateData2 ? date("H:i", $_totime) : date("Y-m-d H:i", $_totime));
                }

                //计算骑手距离商家多远
                $juliShop = 0;
                if($state != '1,7' && $state != 1 && $state != 7){
                    $juliShop = getDistance($clng, $clat, $v['coordX'], $v['coordY']);
                }
                $list[$k]['juliShop'] = is_numeric($juliShop) ? $juliShop : 0;

                //计算商家距离终点多远
                if ($v['cattype'] == 'paotui' && $v['type'] == 1) {

                    $juliPerson = 0;
                    if($state != '1,7' && $state != 1 && $state != 7){
                        $juliPerson = getDistance($clng, $clat, $v['lat'], $v['lng']);
    
                        if ($juliPerson == 0) {
                            $juliPerson = oldgetDistance($clng, $clat, $v['lat'], $v['lng']);
                        }
                    }
                    $list[$k]['juliPerson'] = is_numeric($juliPerson) ? $juliPerson : 0;

                } else {
                    $juliPerson = 0;
                    if($state != '1,7' && $state != 1 && $state != 7){
                        $juliPerson = getDistance($v['coordX'], $v['coordY'], $v['lat'], $v['lng']);
                        if($juliPerson == 0){
                            $juliPerson = oldgetDistance($v['coordX'], $v['coordY'], $v['lat'], $v['lng']);
                        }
                    }
                    $list[$k]['juliPerson'] = is_numeric($juliPerson) ? $juliPerson : 0;
                }
                $list[$k]['cattypename'] = '跑腿';

                $courier_get = $waimaiCourierP = $paotuiCourierP =  0;

                $waimaiCourierP = (float)$v['courierfencheng'] != '0.00' ? $v['courierfencheng'] :($getproportion != '0.00' ? $getproportion : (float)$customwaimaiCourierP);
                $paotuiCourierP = (float)$v['courierfencheng'] != '0.00' ? $v['courierfencheng'] :($paotuiportion != '0.00' ? $paotuiportion : (float)$custompaotuiCourierP);
                $shopCourierP = (float)$v['courierfencheng'] != '0.00' ? $v['courierfencheng'] :($shopportion != '0.00' ? $shopportion : (float)$custom_shopCourierP);

                if ($v['cattype'] == 'waimai' || $v['cattype'] == 'paotui') {
                    /*骑手额外所得*/
                    $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
                    /*外卖额外加成要求*/
                    $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

                    sort($waimaadditionkm);
                    $satisfy = $needfenzhong = $additionprice = 0;
                    for ($i = 0; $i < count($waimaadditionkm); $i++) {
                        if ($juliPerson > $waimaadditionkm[$i][0] && $juliPerson <= $waimaadditionkm[$i][2]) {
                            $satisfy      = 1;
                            $needfenzhong = $waimaadditionkm[$i][1];
                            break;
                        }
                    }
                    if ($satisfy == 1) {
                        for ($a = 0; $a < count($waimaiorderprice); $a++) {
                            if ($v['amount'] >= $waimaiorderprice[$a][0] && $v['amount'] <= $waimaiorderprice[$a][1]) {
                                $additionprice = $waimaiorderprice[$a][2];
                            }
                        }
                    }
                }
                if ($v['cattype'] == 'waimai') {
                    //如果是预定订单，计算是否超时要以预定时间-配送时间而不是付款时间计算
                    $orderStartTime = $v['paydate'];
                    if ($v['reservesongdate'] > 0) {
                        $orderStartTime = $v['reservesongdate'] - (int)$v['delivery_time'] * 60;
                    }

                    $truetime = $v['okdate'] - $orderStartTime;
                    if ($v['delivery_time'] < $truetime % 86400 / 60) {
                        $list[$k]['overtime'] = '1'; /*超时*/
                    } else {
                        $list[$k]['overtime'] = $v['delivery_time'] - ($truetime % 86400 / 60) < 10 ? '-1' :'';
                    }
                    $list[$k]['cattypename'] = '外卖';

                    $priceinfo = $v['priceinfo'] != '' ? unserialize($v['priceinfo']) : array ();
                    if (is_array($priceinfo) && $priceinfo) {
                        $peisongamount = $auth_amount =  0;
                        foreach ($priceinfo as $a => $b) {
                            if ($b['type'] == 'peisong') {
                                $peisongamount += $b['amount'];
                            }elseif($b['type'] == 'auth_peisong'){
                                $auth_amount +=  $b['amount'];
                            }elseif($b['type'] == 'peisong_badWeather'){
                                //恶劣天气配送费
                                $peisongamount +=  $b['amount'];
                            }

                        }
                        $courier_get = $peisongamount * $waimaiCourierP / 100;
                    }


                    //外卖返回预定配送时间
                    $list[$k]['reservesongdate'] = $v['reservesongdate'];
                    $list[$k]['receivingdate'] = 0; //可以接单时间，预定配送时间 - 配送时间 - 1分钟
                    if ($list[$k]['reservesongdate'] > 0) {
                        $list[$k]['receivingdate'] = $list[$k]['reservesongdate'] - (int)$list[$k]['delivery_time']*60 - 60;
                    }

                }elseif($v['cattype'] == 'shop'){
                    $priceinfo = $v['priceinfo'] != '' ? unserialize($v['priceinfo']) : array ();
                    if (is_array($priceinfo) && $priceinfo) {
                        $peisongamount = $auth_amount =  0;
                        foreach ($priceinfo as $a => $b) {
                            if ($b['type'] == 'peisong') {
                                $peisongamount += $b['amount'];
                            }elseif($b['type'] == 'auth_peisong'){
                                $auth_amount +=  $b['amount'];
                            }
                        }
//                        $courier_get = $peisongamount * $shopCourierP / 100;
                        $courier_get = 10;
                    }

                    //骑手本单费用，只有商城有这个字段
                    $courier_get = $v['qsamount'];
                }else {
                    $peisongamount = (float)$v['amount'];
                    $courier_get = $peisongamount * $paotuiCourierP / 100;
                }

                $list[$k]['courier_get']   = sprintf("%.2f", $courier_get);
                $list[$k]['additionprice'] = sprintf("%.2f", $additionprice);
                $list[$k]['needfenzhong']  = $needfenzhong;
                if ($v['cattype'] == 'shop') {
                    //计算骑手距离商家分店多远
                    $list[$k]['cattypename'] = '商城';
                    if ($v['songdate'] == 0) {
                        $state = 4;
                    } else {
                        if ($v['okdate'] == 0) {
                            $state = 5;
                        } else {
                            $state = 1;
                        }
                    }
                    $list[$k]['state'] = $state;

                    if ($v['paytype'] == 'delivery') {
                        /*商城订单代收货款*/
                        $list[$k]['delivery'] = $v['payprice'];
                    }

                    $weightsql = $dsql->SetQuery("SELECT p.`weight`,op.`count` FROM `#@__shop_order_product` op LEFT JOIN `#@__shop_product`p ON op.`proid` = p.`id` WHERE op.`orderid` = " . $v['id']);


                    $weightres = $dsql->dsqlOper($weightsql, "results");

                    $weight = 0;
                    if ($weightres) {
                        foreach ($weightres as $a => $b) {
                            $weight += $b['weight'] * $b['count']; /*商城统计商品重量*/
                        }
                    }
                    $list[$k]['weight'] = $weight;
                    $barnsql            = $dsql->SetQuery(" SELECT b.`title` branchtitle, b.`people` branchpeople, b.`tel` branchtel, b.`lng` branchlng, b.`lat` branchlat, b.`address` branchaddress FROM `#@__shop_branch_store` b WHERE `id` =" . $v['branchid']);

                    $barnres = $dsql->dsqlOper($barnsql, "results");

                    if ($barnres && is_array($barnres)) {

                        $list[$k]['branchtitle']   = $barnres[0]['branchtitle'];
                        $list[$k]['branchpeople']  = $barnres[0]['branchpeople'];
                        $list[$k]['branchtel']     = $barnres[0]['branchtel'];
                        $list[$k]['branchlng']     = $barnres[0]['branchlng'];
                        $list[$k]['branchlat']     = $barnres[0]['branchlat'];
                        $list[$k]['branchid']      = $barnres[0]['branchid'];
                        $list[$k]['branchaddress'] = $barnres[0]['branchaddress'];
                    }
                    //             //计算骑手距离商家多远
                    //             $juliShop               = getDistance($clng, $clat, $value['coordX'], $value['coordY']);
                    //             $list[$key]['juliShop'] = $juliShop;

                    //             //计算商家距离终点多远
                    //             $juliPerson               = getDistance($value['coordX'], $value['coordY'], $value['lat'], $value['lng']);
                    //             $list[$key]['juliPerson'] = $juliPerson;
                    $juliBranchShop = 0;
                    if($state != '1,7' && $state != 1 && $state != 7){
                        $juliBranchShop = getDistance($clng, $clat, $v['branchlat'], $v['branchlng']);
                    }
                    $list[$k]['juliBranchShop'] = $juliBranchShop;

                    //计算商家分店距离终点多远
                    $juliBranchPerson = 0;
                    if($state != '1,7' && $state != 1 && $state != 7){
                        $juliBranchPerson = getDistance($v['branchlat'], $v['branchlng'], $v['lng'], $v['lat']);
                    }
                    $list[$k]['juliBranchPerson'] = $juliBranchPerson;

                    $memberinfo            = getMemberDetail($v['userid']);
                    $list[$k]['levelName'] = $memberinfo['levelName'];

                }
            }
        }
        // if ($ordertype == "waimai") {
        //     $where .= " AND s.`merchant_deliver` != 1";
        //     $archives = $dsql->SetQuery("SELECT o.`id`, o.`sid`, o.`ordernum`, o.`ordernumstore`, o.`person`, o.`tel`, o.`address`, o.`lng`, o.`lat`, o.`pubdate`, o.`state`, s.`shopname`, s.`phone`, s.`coordX`, s.`coordY`, s.`address` address1 FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid`" . $where);
        //     //总条数
        //     $totalCount = $dsql->dsqlOper($archives, "totalCount");

        //     //总分页数
        //     $totalPage = ceil($totalCount / $pageSize);

        //     if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        //     $pageinfo = array(
        //         "page" => $page,
        //         "pageSize" => $pageSize,
        //         "totalPage" => $totalPage,
        //         "totalCount" => $totalCount
        //     );

        //     $atpage = $pageSize * ($page - 1);
        //     $where  = " LIMIT $atpage, $pageSize";

        //     $results = $dsql->dsqlOper($archives . " ORDER BY `id` DESC" . $where, "results");
        //     $list    = array();
        //     if ($results) {
        //         foreach ($results as $key => $value) {
        //             $list[$k]['id']       = $v['id'];
        //             $list[$k]['sid']      = $v['sid'];
        //             $list[$k]['ordernum'] = $v['ordernumstore'] ? $v['shopname'] . $v['ordernumstore'] : $v['ordernum'];
        //             $list[$k]['person']   = $v['person'];
        //             $list[$k]['tel']      = $v['tel'];
        //             $list[$k]['address']  = $v['address'];
        //             $list[$k]['lng']      = $v['lng'];
        //             $list[$k]['lat']      = $v['lat'];
        //             $list[$k]['pubdate']  = $v['pubdate'];
        //             $list[$k]['state']    = $v['state'];
        //             $list[$k]['shopname'] = $v['shopname'];
        //             $list[$k]['phone']    = $v['phone'];
        //             $list[$k]['coordX']   = $v['coordX'];
        //             $list[$k]['coordY']   = $v['coordY'];
        //             $list[$k]['address1'] = $v['address1'];

        //             //计算骑手距离商家多远
        //             $juliShop               = getDistance($clng, $clat, $v['coordX'], $v['coordY']);
        //             $list[$key]['juliShop'] = $juliShop;

        //             //计算商家距离终点多远
        //             $juliPerson               = getDistance($v['coordX'], $v['coordY'], $v['lat'], $v['lng']);
        //             $list[$key]['juliPerson'] = $juliPerson;
        //         }
        //     } else {
        //         return array("state" => 200, "info" => '暂无相关数据！');
        //     }

        //     // 跑腿
        // } elseif ($ordertype == "paotui"){
        //     $archives = $dsql->SetQuery("SELECT o.`id`, o.`type`, o.`shop`, o.`price`, o.`buylng`, o.`buylat`, o.`totime`, o.`gettime`, o.`ordernum`, o.`address`, o.`buyaddress`, o.`person`, o.`tel`, o.`address`, o.`lng`, o.`lat`, o.`note`, o.`gettel`, o.`getperson`, o.`pubdate`, o.`state` FROM `#@__paotui_order` o" . $where);

        //     //总条数
        //     $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //     //总分页数
        //     $totalPage = ceil($totalCount / $pageSize);

        //     if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        //     $pageinfo = array(
        //         "page" => $page,
        //         "pageSize" => $pageSize,
        //         "totalPage" => $totalPage,
        //         "totalCount" => $totalCount
        //     );

        //     $atpage = $pageSize * ($page - 1);
        //     $where  = " LIMIT $atpage, $pageSize";
        //     $results = $dsql->dsqlOper($archives . " ORDER BY `id` DESC" . $where, "results");
        //     $list    = array();
        //     if ($results) {
        //         foreach ($results as $key => $value) {
        //             foreach ($value as $k => $val) {
        //                 if (strstr($k, "time")) {
        //                     $list[$key][$k . "f"] = empty($val) ? "" : date("Y-m-d H:i", $val);
        //                 }
        //                 if ($k == "buylng") $k = "coordY";
        //                 if ($k == "buylat") $k = "coordX";
        //                 $list[$key][$k] = $val;
        //             }

        //             //计算骑手距离取起点多远
        //             $juliShop               = $clat && $clng && $value['buylng'] && $value['buylat'] ? getDistance($clat, $clng, $value['buylng'], $value['buylat']) : 0;
        //             $list[$key]['juliShop'] = $juliShop;

        //             //计算起点距离终点多远
        //             $juliPerson               = $value['buylat'] && $value['buylng'] && $value['lat'] && $value['lng'] ? getDistance($value['buylat'], $value['buylng'], $value['lat'], $value['lng']) : 0;
        //             $list[$key]['juliPerson'] = $juliPerson;
        //         }

        //     } else {
        //         return array("state" => 200, "info" => '暂无相关数据！');
        //     }


        // }elseif($ordertype == "shop"){
        //     $where = "";

        //     if($state == "4,5"){
        //         $where .= " AND `okdate` = 0";
        //     }elseif($state == "1"){
        //         $where .= " AND `songdate` != 0 AND `okdate` != 0";
        //     }elseif($state == "7"){
        //         $where .= " AND `orderstate` = 10 AND (`songdate` = 0 OR `okdate` = 0)";
        //     }elseif($state == "3"){
        //         $where .= " AND 1 = 2";
        //     }

        //     $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`people` username, o.`address` useraddress, o.`contact` usercontact, o.`store`, o.`ordernum`, o.`orderdate`, o.`paytype`, o.`paydate`, o.`songdate`, o.`okdate`, o.`orderstate`,  o.`branchid`, o.`lng`, o.`lat`, s.`title` shopname, s.`address` shopaddress, s.`contact` shopcontact, s.`tel` shoptel, s.`lng` coordY, s.`lat` coordX, b.`title` branchtitle, b.`people` branchpeople, b.`tel` branchtel, b.`lng` branchlng, b.`lat` branchlat, b.`address` branchaddress FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE `peisongid` = $did".$where);

        //     //总条数
        //     $totalCount = $dsql->dsqlOper($archives, "totalCount");

        //     //总分页数
        //     $totalPage = ceil($totalCount/$pageSize);

        //     if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        //     $pageinfo = array(
        //         "page" => $page,
        //         "pageSize" => $pageSize,
        //         "totalPage" => $totalPage,
        //         "totalCount" => $totalCount
        //     );

        //     $atpage = $pageSize*($page-1);
        //     $where = " LIMIT $atpage, $pageSize";

        //     $results = $dsql->dsqlOper($archives." ORDER BY `id` DESC".$where, "results");
        //     $list = array();
        //     if($results){
        //         foreach($results as $key => $value){
        //             $list[$key]['id']          = $value['id'];
        //             $list[$key]['userid']      = $value['userid'];
        //             $list[$key]['username']    = $value['username'];
        //             $list[$key]['usercontact'] = $value['usercontact'];
        //             $list[$key]['useraddress'] = $value['useraddress'];
        //             $list[$key]['shopname']    = $value['shopname'];
        //             $list[$key]['shopaddress'] = $value['shopaddress'];
        //             $list[$key]['shopcontact'] = empty($value['shoptel']) ? $value['shopcontact'] : $value['shoptel'];
        //             $list[$key]['ordernum']    = $value['ordernum'];
        //             $list[$key]['orderstate']  = $value['orderstate'];
        //             $list[$key]['pubdate']     = $value['orderdate'];
        //             $list[$key]['paytype']     = $value['paytype'];
        //             $list[$key]['paydate']     = $value['paydate'];
        //             $list[$key]['branchtitle'] = $value['branchtitle'];
        //             $list[$key]['branchpeople']= $value['branchpeople'];
        //             $list[$key]['branchtel']   = $value['branchtel'];
        //             $list[$key]['branchlng']   = $value['branchlng'];
        //             $list[$key]['branchlat']   = $value['branchlat'];
        //             $list[$key]['branchid']    = $value['branchid'];
        //             $list[$key]['branchaddress']= $value['branchaddress'];

        //             // 坐标信息
        //             $list[$key]['coordY']  = $value['coordY'];
        //             $list[$key]['coordX']  = $value['coordX'];
        //             $list[$key]['lng']  = $value['lng'];
        //             $list[$key]['lat']  = $value['lat'];

        //             //计算骑手距离商家多远
        //             $juliShop               = getDistance($clng, $clat, $value['coordX'], $value['coordY']);
        //             $list[$key]['juliShop'] = $juliShop;

        //             //计算商家距离终点多远
        //             $juliPerson               = getDistance($value['coordX'], $value['coordY'], $value['lat'], $value['lng']);
        //             $list[$key]['juliPerson'] = $juliPerson;

        //             //计算骑手距离商家分店多远
        //             $juliBranchShop               = getDistance($clng, $clat, $value['branchlat'], $value['branchlng']);
        //             $list[$key]['juliBranchShop'] = $juliBranchShop;

        //             //计算商家分店距离终点多远
        //             $juliBranchPerson               = getDistance($value['branchlat'], $value['branchlng'], $value['lat'], $value['lng']);
        //             $list[$key]['juliBranchPerson'] = $juliBranchPerson;


        //             if($value['songdate'] == 0){
        //                 $state = 4;
        //             }else{
        //                 if($value['okdate'] == 0){
        //                     $state = 5;
        //                 }else{
        //                     $state = 1;
        //                 }
        //             }
        //             $list[$key]['state'] = $state;

        //             $memberinfo = getMemberDetail($value['userid']);
        //             $list[$key]['levelName'] = $memberinfo['levelName'];


        //         }
        //     }

        // }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 骑手订单统计
     * */
    public function statisticsHistory()
    {
        global $dsql;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $stimearr = explode('-', $this->param['stime']);
                $stime    = mktime('23', '59', '59', $stimearr[1], $stimearr[2] - 1, $stimearr[0]);
                $etime    = strtotime($this->param['etime'] . '23:59:59');
            }
            $userid = GetCookie("courier");
            if (!$userid) {
                return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
            }
            $shoparr = $waimaiarr = $paotuiarr = array ();

            $sql     = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret     = $dsql->dsqlOper($sql, "results");
            $success = $ret[0]['total'];

            //收入（计算配送费）这里减掉优惠的金额
            $amount = $auth_amount = 0;
            $sql    = $dsql->SetQuery("SELECT `priceinfo`,`courier_get` FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND `state` = 1 AND `refrundstate` = 0 AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret    = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $value) {
                    $courier_get = $value['courier_get'];
                    $value       = unserialize($value['priceinfo']);
                    if (is_array($value) && $courier_get == 0.00) {
                        foreach ($value as $k => $v) {
                            if ($v['type'] == 'peisong') {
                                $amount += $v['amount'];
                            } else {
                                if ($v['type'] == 'auth_peisong') {
                                    $auth_amount += $v['amount'];
                                }
                            }
                        }
                    } else {
                        $amount += $courier_get;
                    }
                }
            }
            //            $amount -= $auth_amount;
            //失败
            $sql    = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__waimai_order_all` WHERE `peisongid` = $userid AND (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret    = $dsql->dsqlOper($sql, "results");
            $failed = $ret[0]['total'];

            //收款（货到付款）
            $sql     = $dsql->SetQuery("SELECT sum(`amount`) amount FROM `#@__waimai_order_all` WHERE `paytype` = 'delivery' AND `peisongid` = $userid AND `state` = 1 AND `refrundstate` = 0 AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret     = $dsql->dsqlOper($sql, "results");
            $peisong = $ret[0]['amount'];

            $waimaiarr['success'] = (int)$success;
            $waimaiarr['amount']  = sprintf("%.2f", $amount);
            $waimaiarr['failed']  = (int)$failed;
            $waimaiarr['peisong'] = sprintf("%.2f", $peisong);


            // 跑腿统计
            //成功、收入
            $sql            = $dsql->SetQuery("SELECT count(`id`) total, sum(`courier_get`) amount FROM `#@__paotui_order` WHERE `peisongid` = $userid AND `state` = 1 AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret            = $dsql->dsqlOper($sql, "results");
            $paotui_success = $ret[0]['total'];
            $paotui_amount  = $ret[0]['amount'];

            //失败
            $sql           = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__paotui_order` WHERE `peisongid` = $userid AND (`state` = 6 OR `state` = 7) AND `pubdate` >= $stime AND `pubdate` <= $etime");
            $ret           = $dsql->dsqlOper($sql, "results");
            $paotui_failed = $ret[0]['total'];


            $paotuiarr['paotui_success'] = (int)$paotui_success;
            $paotuiarr['paotui_amount']  = sprintf("%.2f", $paotui_amount);
            $paotuiarr['paotui_failed']  = (int)$paotui_failed;

            //商城统计
            //成功、收入
            $sql     = $dsql->SetQuery("SELECT count(`id`) total, sum(`qsamount`) amount FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime AND `songdate` <= $etime");
            $ret     = $dsql->dsqlOper($sql, "results");
            $success = $ret[0]['total'];
            $shopamount = $ret[0]['amount'];

            // $shopamount = $shopauth_amount = 0;
            // $sql        = $dsql->SetQuery("SELECT `priceinfo` FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime AND `songdate` <= $etime");
            // $ret        = $dsql->dsqlOper($sql, "results");
            // if ($ret) {
            //     foreach ($ret as $key => $value) {
            //         $value = unserialize($value['priceinfo']);
            //         if (is_array($value)) {
            //             foreach ($value as $k => $v) {
            //                 if ($v['type'] == 'peisong') {
            //                     $shopamount += $v['amount'];
            //                 } else {
            //                     if ($v['type'] == 'auth_peisong') {
            //                         $shopauth_amount += $v['amount'];
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
            //            $shopamount -= $shopauth_amount;
            //            $shopamount -= $shopauth_amount;

            //失败
            $sql    = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__shop_order` WHERE `peisongid` = $userid AND `orderstate` = 7 AND `songdate` >= $stime AND `songdate` <= $etime");
            $ret    = $dsql->dsqlOper($sql, "results");
            $failed = $ret[0]['total'];

            //收款（货到付款）
            $sql     = $dsql->SetQuery("SELECT sum(`amount`) amount FROM `#@__shop_order` WHERE `paytype` = 'delivery' AND `peisongid` = $userid AND `orderstate` = 3 AND `songdate` >= $stime AND `songdate` <= $etime");
            $ret     = $dsql->dsqlOper($sql, "results");
            $peisong = $ret[0]['amount'];

            $shoparr['shop_success'] = (int)$success;
            $shoparr['shop_amount']  = sprintf("%.2f", $shopamount);
            $shoparr['shop_failed']  = (int)$failed;
            $shoparr['shop_peisong'] = sprintf("%.2f", $peisong);

            $dataarr['shoparr']   = $shoparr;
            $dataarr['waimaiarr'] = $waimaiarr;
            $dataarr['paotuiarr'] = $paotuiarr;

            return $dataarr;

        }
    }

    /**
     * 地图订单
     * */
    public function mapOrder()
    {
        global $dsql;
        $list = array ();

        //        $ordertype = $this->param['ordertype'];

        $did = GetCookie("courier"); /*骑手id*/
        if (!$did) {
            return array ('state' => '200', 'info' => '暂未登录！');
        }

        /*外卖*/
        $warchives = $dsql->SetQuery("SELECT * FROM  ( SELECT o.`id`,'' type,o.`lng`, o.`lat`, o.`peidate` songdate, o.`state`,s.`coordX`, s.`coordY`,s.`delivery_time`, 'waimai' cattype FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE s.`merchant_deliver` != 1 AND `state` in (4,5) AND o.`peisongid` = " . $did . " UNION ALL SELECT `id`, `type`,`buylng` coordX, `buylat` coordY,`songdate`,`state`,`lng`, `lat`,'' delivery_time,'paotui' cattype FROM `#@__paotui_order`  WHERE `state` in (4,5) AND `peisongid` = " . $did . " UNION ALL SELECT o.`id`, '' type, o.`lng`, o.`lat`, o.`songdate`,o.`orderstate` state, s.`lng` coordX, s.`lat` coordY,'' delivery_time,'shop' cattype FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON s.`id` = o.`store` LEFT JOIN `#@__shop_branch_store` b ON b.`id` = o.`branchid` WHERE `peisongid` = $did AND `orderstate` = 6 AND `ret_state` !=1 AND `shipping` = 0) as unall ORDER BY `songdate` ASC");
        $wresults  = $dsql->dsqlOper($warchives, "results", "ASSOC", null, 0);

        if (!$wresults) {
            return array ('state' => '200', 'info' => '暂无数据');
        }

        return $wresults;


    }


    /**
     * 骑手订单数据
     *
     * @return array
     */
    public function courierOrderStatistics()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $did = $this->param['did'];
            }
        }

        $clng  = $clat = "";
        $where = " WHERE o.`state` in (3,4,5)";
        $where .= " AND o.`courier_pushed` = 0";
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`,`cityid` FROM `#@__waimai_courier` WHERE `id` = $did AND `state` = 1 AND `quit` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在或已停工！');
            }


            $where  .= " AND o.`peisongid` = '$did'";
            $clng   = $ret[0]['lng'];
            $clat   = $ret[0]['lat'];
            $cityid = $ret[0]['cityid'];

            if ($cityid) {
                $where .= "  AND s.cityid = '$cityid'";
            }

        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        $aid = $paid = $count = $pcount = 0;
        $url = $purl = '';
        global $customIsopenqd;
        $pusharr = $param = array ();
        // 外卖
        $archives = $dsql->SetQuery("SELECT o.`id`,s.`coordX`,s.`coordY`,o.`state`,o.`confirmdate`,o.`qxpeisongid` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON o.`sid` = s.`id`" . $where . " ORDER BY o.`confirmdate` DESC");
        $ret      = $dsql->dsqlOper($archives, "results");
        if ($ret) {
            $aid                  = $ret[0]['id'];
            $param['aid']         = $aid;
            $param['count']       = count($ret);
            $param['type']        = 'waimai';
            $param['confirmdate'] = $ret[0]['confirmdate'];
            $param['url']         = $cfg_secureAccess . $cfg_basehost . '/index.php?service=waimai&do=courier&template=detail&id=' . $aid;
            $param['juli']        = sprintf("%.2f", getDistance($clng, $clat, $ret[0]['coordX'], $ret[0]['coordY']) / 1000);
            $title                = '';
            $music                = '';

            switch ($ret[0]['state']) {
                case '3':
                    $title = '[外卖]你有一笔待抢订单';
                    break;
                case '4':
                    $title = '[外卖]你有一笔待配送订单';
                    $music = 'newfenpeiorder';
                    break;
                case '5':
                    $title = '[外卖]你有一笔配送中订单';
                    break;
            }
            if ($ret[0]['state'] == 3 && $ret[0]['qxpeisongid'] != 0) {
                $title = '[外卖]你有一笔转单订单';
            }
            $param['title'] = $title;
            //自定义通知语音
            $param['music'] = $music;

            if (($customIsopenqd == 1 && $ret[0]['state'] != 3) || $ret[0]['state'] == 4) {
                array_push($pusharr, $param);
            }

        }


        // 跑腿
        if ($cityid) {
            $paotuiwhere = "  AND cityid = '$cityid'";
        }
        $archives = $dsql->SetQuery("SELECT `id`,`buylng`,`buylat`,`paydate` FROM `#@__paotui_order`o WHERE `state` = 3 AND o.`courier_pushed` = 0 " . $paotuiwhere . " ORDER BY `paydate` DESC");
        $ret      = $dsql->dsqlOper($archives, "results");
        if ($ret) {
            $paid           = $ret[0]['id'];
            $param['aid']   = $paid;
            $param['count'] = count($ret);
            $param['type']  = 'paotui';

            $param['url'] = $cfg_secureAccess . $cfg_basehost . '/?service=waimai&do=courier&template=detail&id=' . $paid . '&ordertype=paotui';

            $param['juli'] = sprintf("%.2f", getDistance($clng, $clat, $ret[0]['buylat'], $ret[0]['buylng']) / 1000);

            $param['confirmdate'] = $ret[0]['paydate'];
            $param['title']       = "[跑腿]你有一笔待抢订单";

            //自定义通知语音
            $music = 'paotuidaiqiang';
            $param['music'] = $music;

            array_push($pusharr, $param);
        }

        // 商城

        //查询安装模块
        $archive  = $dsql->SetQuery("SELECT  `name`  FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `parentid` != 0 AND `name` = 'shop' ORDER BY `weight`, `id`");
        $results  = $dsql->dsqlOper($archive, "results");
        if($results && in_array('shop', $results[0])){
            $archives = $dsql->SetQuery("SELECT o.`id`,s.`lng`,s.`lat`,o.`peidate` FROM `#@__shop_order` o LEFT JOIN `#@__shop_store` s ON o.`store` = s.`id`  WHERE `orderstate` = 6  AND o.`peisongid` = $did AND o.`courier_pushed` = 0 ORDER BY o.`peidate` DESC");
            $ret      = $dsql->dsqlOper($archives, "results");
            if ($ret) {
                $said           = $ret[0]['id'];
                $param['aid']   = $said;
                $param['count'] = count($ret);
                // $param['type']  = 'shop';
                $param['type'] = 'waimai';  //临时用外卖，苹果端音乐文件不存在导致闪退，下个版本升级后恢复 by gz 20210511
                $param['url']  = $cfg_secureAccess . $cfg_basehost . '/?service=waimai&do=courier&template=detail&id=' . $said . '&ordertype=shop';

                $param['juli']        = getDistance($ret[0]['lat'], $ret[0]['lng'], $clng, $clat) / 1000;
                $param['confirmdate'] = $ret[0]['peidate'];

                $param['title'] = "[商城]你有一笔待取货订单";

                //自定义通知语音
                $music = 'newfenpeiordershop';
                $param['music'] = $music;

                array_push($pusharr, $param);
            }
        }
        if (!empty($pusharr)) {
            array_multisort(array_column($pusharr, "confirmdate"), SORT_DESC, $pusharr);

            //客户端提醒后，不需要重复提醒
            // $archives = $dsql->SetQuery("UPDATE `#@__waimai_order` SET `courier_pushed` = 1 WHERE `state` in (4,5) AND `peisongid` = $did AND `courier_pushed` = 0");
            // $dsql->dsqlOper($archives, "update");

            // $archives = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `courier_pushed` = 1 WHERE `state` in (4,5) AND `peisongid` = $did AND `courier_pushed` = 0");
            // $dsql->dsqlOper($archives, "results");

            $returnData = array (
                "type"   => $pusharr[0]['type'],
                "count"  => $pusharr[0]['count'],
                "aid"    => $pusharr[0]['aid'],
                "url"    => $pusharr[0]['url'],
                "title"  => $pusharr[0]['title'],
                "juli"   => $pusharr[0]['juli'] . "km",
                "pcount" => $pusharr[0]['count'],
                "purl"   => $pusharr[0]['url']
            );

            //自定义通知语音
            if ($pusharr[0]['music'] != null) {
                global $cfg_basedomain;
                $returnData['music'] = $cfg_basedomain . '/static/audio/app/'.$pusharr[0]['music'].'.mp3';
            }

            return $returnData;
        } else {
            return array ("state" => 200, "info" => '暂无新订单！');
        }
    }


    /**
     * 骑手抢单
     */
    public function qiangdan()
    {
        global $dsql;
        $id        = (int)$this->param['id'];
        $ordertype = $this->param['ordertype'];

        if (!$id) {
            return array ("state" => 200, "info" => '订单ID不能为空！');
        }

        $did = GetCookie("courier");
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`, `name`, `phone`,`getproportion`,`paotuiportion` FROM `#@__waimai_courier` WHERE `id` = $did");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在！');
            } else {
                $name          = $ret[0]['name'];
                $phone         = $ret[0]['phone'];
                $getproportion = $ret[0]['getproportion'];
                $paotuiportion = $ret[0]['paotuiportion'];
            }
        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);

        $dbname = $ordertype == 'paotui' ? '#@__paotui_order' : $break_table;

        $sql = $dsql->SetQuery("SELECT `id` FROM `" . $dbname . "` WHERE `id` = $id AND `state` = 3");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $inc = HUONIAOINC . "/config/waimai.inc.php";
            include $inc;
            if ($ordertype == 'paotui') {

                $courierfencheng = $paotuiportion != '0.00' ? $paotuiportion : $custompaotuiCourierP ;
            } else {

                $courierfencheng  = $getproportion != '0.00' ? $getproportion : $customwaimaiCourierP ;
            }

            $date = GetMkTime(time());
            $sql  = $dsql->SetQuery("UPDATE `" . $dbname . "` SET `state` = 4, `peisongid` = $did, `peidate` = $date, `courier_pushed` = 1,`courierfencheng` = '$courierfencheng' WHERE `id` = $id AND `state` = 3");
            $ret  = $dsql->dsqlOper($sql, "update");
            if ($ret == "ok") {
                // 通知会员
                if ($dbname != "#@__paotui_order") {
                    $sql = $dsql->SetQuery("SELECT o.`uid`, o.`food`, o.`ordernumstore`, o.`amount`, o.`pubdate`, s.`shopname` FROM `" . $dbname . "` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $id");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $data     = $ret[0];
                        $uid      = $data['uid'];
                        $ordernum = $data['shopname'] . $data['ordernumstore'];
                        $pubdate  = $data['pubdate'];
                        $shopname = $data['shopname'];
                        $amount   = $data['amount'];
                        $food     = unserialize($data['food']);

                        $foods = array ();
                        foreach ($food as $k => $v) {
                            array_push($foods, $v['title'] . " " . $v['count'] . "份");
                        }
                        $param = array (
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "module"   => "waimai",
                            "id"       => $id
                        );

                    }
                } else {
                    $sql = $dsql->SetQuery("SELECT o.`uid`, o.`shop`, o.`ordernum`, o.`price`, o.`pubdate`,o.`amount` FROM `" . $dbname . "` o WHERE o.`id` = $id");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $data     = $ret[0];
                        $uid      = $data['uid'];
                        $pubdate  = $data['pubdate'];
                        $ordernum = $data['ordernum'];
                        $shop     = $data['shop'];
                        $amount   = $data['amount'];

                        $foods = array ($shop);

                        $param = array (
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "module"   => "paotui",
                            "id"       => $id
                        );

                    }
                }

                //自定义配置
                $config = array (
                    "ordernum"   => $ordernum,
                    "orderdate"  => date("Y-m-d H:i:s", $pubdate),
                    "orderinfo"  => join(" ", $foods),
                    "orderprice" => $amount,
                    "peisong"    => $name . "，" . $phone,
                    "fields"     => array (
                        'keyword1' => '订单号',
                        'keyword2' => '订单详情',
                        'keyword3' => '订单金额',
                        'keyword4' => '配送人员'
                    )
                );

                updateMemberNotice($uid, "会员-订单配送提醒", $param, $config, '', '', 0, 1);

                return "抢单成功！";
            } else {
                return array ("state" => 200, "info" => '已经被其他骑手抢走~1');
            }

        } else {
            return array ("state" => 200, "info" => '已经被其他骑手抢走~2');
        }


    }


    /**
     * 骑手更新配送状态
     */
    public function peisong()
    {
        global $dsql;
        global $userLogin;
        $id         = (int)$this->param['id'];
        $state      = $this->param['state'];
        $paotuicode = (int)$this->param['paotuicode'];
        $ordertype  = $this->param['ordertype'];
        $courier    = $this->param['courier'];

        $ordertype = empty($ordertype) ? "waimai" : $ordertype;

        if (!$id) {
            return array ("state" => 200, "info" => '订单ID不能为空！');
        }

        $did = GetCookie("courier");
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`,`turnnum`,`getproportion`,`paotuiportion` FROM `#@__waimai_courier` WHERE `id` = $did");
            $ret = $dsql->dsqlOper($sql, "results");

            $turnnum = $ret['0']['turnnum'] ? $ret['0']['turnnum'] : 0;
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在！');
            }
            $pslng         = $ret[0]['lng'];
            $pslat         = $ret[0]['lat'];

            if ($courier) {
                $courier = json_decode($courier,true);
                if ($courier && $courier['lng'] !='' && $courier['lat'] !='') {
                    $pslng   = $courier['lng'];
                    $pslat   = $courier['lat'];
                }
            }

            if ($pslng =='' || $pslat =='') return array ("state" => 200, "info" => '骑手坐标异常！');
            $getproportion = $ret[0]['getproportion'];
            $paotuiportion = $ret[0]['paotuiportion'];
        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        //外卖分表
        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
        // 外卖
        if ($ordertype == "waimai") {
            //取货
            if ($state == 5) {

                $sql = $dsql->SetQuery("SELECT `id`,`sid` FROM `" . $break_table . "` WHERE `id` = $id AND `state` = 4 AND `peisongid` = $did");
                $ret = $dsql->dsqlOper($sql, "results");

                if ($ret) {
                    $sid = $ret[0]['sid'];
                    $sql = $dsql->SetQuery("SELECT `coordX`,`coordY` FROM `#@__waimai_shop` WHERE `id` = " . $sid);
                    $res = $dsql->dsqlOper($sql, "results");

                    /*骑手确认取货*/
                    $coordX   = $res[0]['coordX'];
                    $coordY   = $res[0]['coordY'];
                    if ($pslng < $pslat) {
                        list($pslat,$pslng) = array($pslng,$pslat);
                    }
                    $julishop = getDistance($pslat, $pslng, $coordX, $coordY) / 1000;


                    if ($julishop > $customtakeLimit) {
                        return array ("state" => 200, "info" => '您现在距离店铺' . sprintf('%.2f',$julishop) . '公里，超出取餐范围，请确认定位是否异常！');
                    } elseif ($julishop  == 0){
                        $julishop = oldgetDistance($pslng, $pslat, $lng, $lat) / 1000;
                        if ($julishop > (float)$customsuccessLimit) {

                            return array ("state" => 200, "info" => '距离太远,请到达用户位置后再操作');
                        }
                    }

                    $date = GetMkTime(time());
                    $sql  = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 5, `songdate` = $date,`tostoredate` = $date WHERE `id` = $id AND `state` = 4");
                    $ret  = $dsql->dsqlOper($sql, "update");
                    if ($ret == "ok") {

                        //消息通知用户
                        $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, s.`shopname`, s.`address` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $id");
                        $ret_ = $dsql->dsqlOper($sql_, "results");
                        if ($ret_) {
                            $data = $ret_[0];

                            $uid           = $data['uid'];
                            $ordernumstore = $data['ordernumstore'];
                            $shopname      = $data['shopname'];
                            $address       = $data['address'];

                            $param = array (
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "module"   => "waimai",
                                "id"       => $id
                            );

                            //自定义配置
                            $config = array (
                                "ordernum" => $ordernumstore,
                                "shopname" => $shopname,
                                "shopaddr" => $address,
                                "fields"   => array (
                                    'keyword1' => '订单号',
                                    'keyword2' => '取货门店',
                                    'keyword3' => '地址'
                                )
                            );

                            updateMemberNotice($uid, "会员-取货提醒", $param, $config, '', '', 0, 1);
                        }

                        return "已取货";
                    } else {
                        return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                    }

                } else {
                    return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                }

                //成功
            } else {
                if ($state == 1) {
                    $sql = $dsql->SetQuery("SELECT o.`id`,o.`zsbprice`,o.`paydate`,o.`peidate`,o.`sid`,o.`songdate`,o.`amount`,o.`zsbprice`,o.`uid`,o.`ordernum`,o.`cptype`,o.`ordertype`,o.`lng`,o.`lat`,s.`coordX`,s.`coordY`, o.`mealtime`, o.`confirmdate` FROM `" . $break_table . "` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $id AND o.`state` = 5 AND o.`peisongid` = $did");
                    $ret = $dsql->dsqlOper($sql, "results");

                    if ($ret && is_array($ret)) {

                        /*骑手确认成功*/
                        $ulng     = $ret[0]['lng'];
                        $ulat     = $ret[0]['lat'];
                        $coordX   = $ret[0]['coordX'];
                        $coordY   = $ret[0]['coordY'];

                        if ($pslng < $pslat) {
                            list($pslat,$pslng) = array($pslng,$pslat);
                        }

                        $julishop = getDistance($coordX, $coordY, $ulat, $ulng) / 1000;
                        if ($julishop > (float)$customsuccessLimit) {
                            return array ("state" => 200, "info" => '您现在距离用户' . sprintf('%.2f',$julishop)  . '公里，请到达用户位置后再操作');
                        } elseif ($julishop  == 0){
                            $julishop = oldgetDistance($pslng, $pslat, $lng, $lat) / 1000;
                            if ($julishop > (float)$customsuccessLimit) {

                                return array ("state" => 200, "info" => '距离太远,请到达用户位置后再操作');
                            }
                        }

                        $zsbprice    = $ret['0']['zsbprice'];
                        $paydate     = $ret['0']['paydate'];
                        $sid         = $ret['0']['sid'];
                        $uid         = $ret['0']['uid'];
                        $ordernum    = $ret['0']['ordernum'];
                        $amount      = $ret['0']['amount'];
                        $zsbprice    = $ret['0']['zsbprice'];
                        $cptype      = $ret['0']['cptype'];
                        $ordertype   = (int)$ret['0']['ordertype'];
                        $tostoredate = $ret['0']['tostoredate'];

                        $songdate = $ret['0']['songdate'];
                        $confirmdate = $ret['0']['confirmdate'];  //商家确认时间
                        $mealtime = $ret['0']['mealtime'];  //商家出餐时间

                        //计算商家从确认到出餐用了多少分钟
                        $mealtime_ = $mealtime - $confirmdate;
                        $mealtime_ = floor($mealtime_ % 86400 / 60);

                        // $peidate       = $ret['0']['peidate'];

                        $date = GetMkTime(time());
                        $sql  = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 1, `okdate` = $date WHERE `id` = $id AND `state` = 5");
                        $ret  = $dsql->dsqlOper($sql, "update");
                        if ($ret == "ok") {

                            //准时宝相关

                            if ($zsbprice > 0) {
                                global $customZsbspe;
                                //支付时间与确认时间差
                                $potime = ($date - $paydate) % 86400 / 60;


                                //查找店铺准时宝规格
                                $zsbsql = $dsql->SetQuery("SELECT `zsbspe` ,`chucan_time`,`delivery_time`,`open_zsb`FROM `#@__waimai_shop` WHERE `id` = " . $sid);
                                $zsbre  = $dsql->dsqlOper($zsbsql, "results");

                                $zsbspecifications = $zsbre['0']['open_zsb'] == "1" ? $zsbre['0']['zsbspe'] : $customZsbspe;

                                $delivery_time = $zsbre['0']['delivery_time'];

                                //判断完成时间是否超出规定时间
                                if ($potime > $delivery_time && $delivery_time) {
                                    //时间超出的部分
                                    $beyond = $potime - $delivery_time;
                                    if ($zsbspecifications != "") {
                                        $zsbspe = unserialize($zsbspecifications);

                                        array_multisort(array_column($zsbspe, "time"), SORT_ASC, $zsbspe);

                                        for ($i = 0; $i < count($zsbspe); $i++) {
                                            if ($zsbspe[$i]['time'] <= $beyond && $beyond < $zsbspe[$i + 1]['time']) {
                                                $proportion = $zsbspe[$i]['proportion'];
                                                break;
                                            }
                                            if ($potime < $zsbspe['0']['time']) {
                                                $proportion = '0';
                                                break;
                                            }

                                            $proportion = $zsbspe[$i]['proportion'];
                                        }
                                        global $userLogin;
                                        if ($proportion != 0) {
                                            $chucan_time = $zsbre['0']['chucan_time'];
                                            //骑手取货时间差
                                            $shtime = ($date - $songdate) % 86400 / 60;
                                            // $shtime = ($date-$peidate)%86400/60; //骑手时间
                                            //计算由谁承担费用
                                            $cptypeinfo = "";

                                            //商家出餐超时，有两种情况：
                                            //1. 商家没有操作确认出餐，则出餐时间以骑手取餐时间为准
                                            //2. 商家操作了确认出餐，则出餐时间以商家确认时间为准
                                            if ((($potime - $shtime) > $chucan_time && !$mealtime) || ($mealtime && $mealtime_ > $chucan_time)) {  //商户时间大于出餐 商家赔付

                                                $cpmoney = ($amount - $zsbprice) * ($proportion / 100);

                                                if ($cptype == 0) {
                                                    $cptypeinfo = ", `cptype` = 1 ";
                                                }

                                                //商家
                                                $cpsql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $id ");
                                                $cpre  = $dsql->dsqlOper($cpsql, "update");

                                            } else {
                                                //骑手
                                                $cpmoney = ($amount - $zsbprice) * ($proportion / 100);

                                                if ($cptype == 0) {
                                                    $cptypeinfo = ", `cptype` = 2 ";
                                                }

                                                $cpsql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `cpmoney` = '$cpmoney' " . $cptypeinfo . "WHERE `id` = $id ");
                                                $cpre  = $dsql->dsqlOper($cpsql, "update");
                                            }

                                            //给用户加钱
                                            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $cpmoney WHERE `id` = $uid");
                                            $dsql->dsqlOper($sql, "update");

                                            $paramUser = array (
                                                "service"  => "member",
                                                "type"     => "user",
                                                "template" => "orderdetail",
                                                "module"   => "waimai",
                                                "id"       => $id
                                            );
                                            $urlParam  = serialize($paramUser);
                                            $sql       = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                                            $ret       = $dsql->dsqlOper($sql, "results");
                                            $pid       = '';
                                            if ($ret) {
                                                $pid = $ret[0]['id'];
                                            }
                                            $user      = $userLogin->getMemberInfo($uid);
                                            $usermoney = $user['money'];
                                            //                                        $money  = sprintf('%.2f',($usermoney+$cpmoney));
                                            $title_ = "外卖准时宝赔付-" . $ordernum;
                                            //保存操作日志
                                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$cpmoney', '准时宝赔付:$ordernum', '$date','waimai','peifu','$pid','$urlParam','$title_','$ordernum','$usermoney')");

                                            $result = $dsql->dsqlOper($archives, "update");

                                        }
                                    }
                                }


                            }


                            //消息通知用户
                            $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernumstore`, o.`okdate`, o.`amount`, o.`ordernum`, o.`fencheng_delivery`,o.`priceinfo`,s.`shopname`,s.`cityid` FROM `" . $break_table . "` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`id` = $id");
                            $ret_ = $dsql->dsqlOper($sql_, "results");
                            if ($ret_) {
                                $data = $ret_[0];

                                $uid               = $data['uid'];
                                $ordernumstore     = $data['shopname'] . $data['ordernumstore'];
                                $shopname          = $data['shopname'];
                                $ordernumstore     = $data['ordernumstore'];
                                $okdate            = $data['okdate'];
                                $amount            = $data['amount'];
                                $priceinfo         = unserialize($data['priceinfo']);
                                $cityid            = $data['cityid'];
                                $ordernum          = $data['ordernum'];
                                $fencheng_delivery = (int)$data['fencheng_delivery'];

                                // 会员获取积分
                                // $getpoint = $data['amount'];
                                // $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + $getpoint WHERE `id` = '$uid'");
                                // $dsql->dsqlOper($archives, "update");

                                // 保存操作日志-积分
                                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$uid', '1', '$getpoint', '外卖订餐获得积分：$ordernumstore', '$date')");
                                // $dsql->dsqlOper($archives, "update");

                                //商家结算
                                $fenxiaoarr = array (
                                    'uid'       => $uid,
                                    'ordernum'  => $ordernum,
                                    'amount'    => $amount,
                                    'ordertype' => $ordertype
                                );
                                global  $cfg_fenxiaoSource;
                                $staticmoney = getwaimai_staticmoney('3', $id, $fenxiaoarr);
                                $bearfenyong = 0;
                                if ($cfg_fenxiaoSource == 1){
                                    $bearfenyong = 2;
                                }else{
                                    $bearfenyong = 1;
                                }
                                //外卖类型参与平台与分站提成
                                if ($ordertype == 0) {
                                    //分站相关
                                    global $cfg_fzwaimaiFee;

                                    //                            $fzcomm = array();
                                    //                            $fzcomm['ptyd']       = $staticmoney['ptyd'];
                                    //                            $fzcomm['amount']     = $staticmoney['amount'];
                                    //                            $fzcomm['ordernum']   = $staticmoney['ordernum'];
                                    //费用详情
                                    $peisong = $peisongvip = 0;
                                    if ($priceinfo) {
                                        foreach ($priceinfo as $k_ => $v_) {
                                            if ($v_['type'] == "peisong") {
                                                $peisong = $v_['amount'];
                                            }
                                            if ($v_['type'] == "auth_peisong") {
                                                $peisongvip = $v_['amount'];
                                            }
                                        }
                                    }
                                    //                                $peisongall = $peisong + $peisongvip - $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                                    //分站佣金
                                    $fzFee          = cityCommission($cityid, 'waimai');
                                    $peisongall     = $peisong * $fencheng_delivery / 100; /*平台承担配送费优惠额度 - 平台应得配送费比例 分站配送费不参与分成*/
                                    $fztotalAmount_ = ($staticmoney['ptyd']) * (float)$fzFee / 100;
                                    $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                                    $cityName       = getSiteCityName($cityid);
                                    $staticmoney['ptyd'] = sprintf("%.2f", $staticmoney['ptyd'] - $fztotalAmount_);
                                    $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                                    $dsql->dsqlOper($fzarchives, "update");
                                    global $userLogin;
                                    $user      = $userLogin->getMemberInfo($uid);
                                    $usermoney = $user['money'];
                                    $money     = sprintf('%.2f', ($usermoney + $amount));
                                    //保存操作日志
                                    $now      = GetMkTime(time());
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`bear`) VALUES ('$uid', '1', '$amount', '外卖订单(分站佣金)：$ordernum', '$now','$cityid','$fztotalAmount_','waimai','" . $staticmoney['ptyd'] . "','1','shangpinxiaoshou','$money','$bearfenyong')");
                                    //                                $dsql->dsqlOper($archives, "update");
                                    $lastid = $dsql->dsqlOper($archives, "lastid");
                                    
                                    substationAmount($lastid, $cityid);

                                    //更新外卖店铺的销量
                                    if($sid) updateShopSales($sid, $ordernum);

                                    //微信通知
                                    $moduleName = getModuleTitle(array('name' => 'waimai'));
                                    $cityMoney = getcityMoney($cityid);   //获取分站总收益
                                    $allincom = getAllincome();             //获取平台今日收益

                                    $param = array (
                                        'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                                        'cityid' => $cityid,
                                        'notify' => '管理员消息通知',
                                        'fields' => array (
                                            'contentrn' => $cityName . "分站\r\n".$moduleName."模块\r\n用户：".$user['nickname']."\r\n店铺：".$shopname."\r\n订单：".$ordernumstore."\r\n\r\n获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                                            'date'      => date("Y-m-d H:i:s", time()),
                                            'status' => "今日总收入：$cityMoney"
                                        )
                                    );

                                    $params = array (
                                        'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                                        'cityid' => $cityid,
                                        'notify' => '管理员消息通知',
                                        'fields' => array (
                                            'contentrn' => $cityName . "分站\r\n".$moduleName."模块\r\n用户：".$user['nickname']."\r\n店铺：".$shopname."\r\n订单：".$ordernumstore."\r\n\r\n平台获得佣金：".$staticmoney['ptyd']."\r\n分站获得佣金：" . sprintf("%.2f", $fztotalAmount_),
                                            'date'      => date("Y-m-d H:i:s", time()),
                                            'status' => "今日总收入：$allincom"
                                        )
                                    );
                                    //后台微信通知
                                    updateAdminNotice("waimai", "detail", $param);
                                    updateAdminNotice("waimai", "detail", $params);
                                }

                                $param = array (
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "orderdetail",
                                    "module"   => "waimai",
                                    "id"       => $id
                                );

                                //自定义配置
                                $config = array (
                                    "ordernum" => $ordernumstore,
                                    "date"     => date("Y-m-d H:i:s", $okdate),
                                    "fields"   => array (
                                        'keyword1' => '订单号',
                                        'keyword2' => '完成时间'
                                    )
                                );

                                updateMemberNotice($uid, "会员-订单完成通知", $param, $config, '', '', 0, 1);

                            }


                            return "已送达";
                        } else {
                            return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                        }

                    } else {
                        return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                    }

                    //其他情况
                } else {
                    if ($state == 99) {

                        //指定外卖员转单次数 $turnnum
                        global $custom_systemturnnum;

                        $now = time();
                        $end = strtotime('+1 month');

                        $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
                        $yue_end  = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间

                        //统计本月取消了几次

                        $turnnum = $turnnum == 0 ? $custom_systemturnnum : $turnnum;

                        //限制转单次数为0就是不限制
                        if ($turnnum != 0) {
                            $turnsql = $dsql->SetQuery("SELECT count(`id`) counnum FROM `#@__waimai_order_all` WHERE FIND_IN_SET('$did',`qxpeisongid` ) AND `qxtime`>= $yue_star AND `qxtime`< $yue_end");

                            $turnre = $dsql->dsqlOper($turnsql, "results");

                            if ($turnre['0']['counnum'] < $turnnum) {
                                //转单

                                $zdsql = $dsql->SetQuery("SELECT `qxpeisongid` FROM `" . $break_table . "` WHERE `id` = $id ");
                                $zdre  = $dsql->dsqlOper($zdsql, "results");
                                if ($zdre[0]['qxpeisongid'] != 0) {
                                    $did = $zdre[0]['qxpeisongid'] . ',' . $did;
                                }

                                $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 3, `qxpeisongid` = '$did' ,`peisongid` = 0 ,`peidate` = 0,`qxtime` = '$now'  WHERE `id` = $id ");
                                $ret = $dsql->dsqlOper($sql, "update");
                                return "成功";
                            } else {

                                return array ("state" => 200, "info" => '超过转单次数');
                            }
                        } else {
                            return array ("state" => 200, "info" => '暂未开启转单功能');
                        }
                    } else {
                        if ($state == 98) {
                            /*骑手确认到店时间*/
                            $sql = $dsql->SetQuery("SELECT s.`coordX`,s.`coordY` FROM `" . $break_table . "` o LEFT JOIN `#@__waimai_shop` s ON o.`sid` = s.`id` WHERE o.`id` = " . $id);
                            $res = $dsql->dsqlOper($sql, "results");
                            if ($res) {
                                $coordX   = $res[0]['coordX'];
                                $coordY   = $res[0]['coordY'];
                                $jilishop = getDistance($pslng, $pslat, $coordX, $coordY) / 1000;

                                if ($jilishop > 50) {
                                    return array ("state" => 200, "info" => '当前距离太远不可以更新到店时间哦');
                                }

                                $date = GetMkTime(time());
                                $sql  = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `tostoredate` = $date WHERE `id` = $id");
                                $ret  = $dsql->dsqlOper($sql, "update");
                                if ($ret == "ok") {
                                    return date('H:i:s', $date);
                                }

                            }

                        } else {
                            return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                        }
                    }
                }
            }

            // 跑腿
        } else {
            if ($ordertype == "paotui") {
                //取货
                if ($state == 5) {
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `id` = $id AND `state` = 4 AND `peisongid` = $did");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {

                        $date = GetMkTime(time());
                        $sql  = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `state` = 5, `songdate` = $date WHERE `id` = $id AND `state` = 4");
                        $ret  = $dsql->dsqlOper($sql, "update");
                        if ($ret == "ok") {

                            //消息通知用户
                            $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernum`,`buyaddress`,`address` FROM `#@__paotui_order` o  WHERE o.`id` = $id");
                            $ret_ = $dsql->dsqlOper($sql_, "results");
                            if ($ret_ && is_array($ret_)) {
                                $data = $ret_[0];

                                $uid           = $data['uid'];
                                $ordernumstore = $data['ordernum'];
                                $shopname      = $data['buyaddress'];
                                $address       = $data['address'];

                                $param = array (
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "orderdetail",
                                    "module"   => "paotui",
                                    "id"       => $id
                                );

                                //自定义配置
                                $config = array (
                                    "ordernum" => $ordernumstore,
                                    "shopname" => $shopname,
                                    "shopaddr" => $address,
                                    "fields"   => array (
                                        'keyword1' => '订单号',
                                        'keyword2' => '取货门店',
                                        'keyword3' => '地址'
                                    )
                                );

                                updateMemberNotice($uid, "会员-取货提醒", $param, $config, '', '', 0, 1);
                            }

                            return "已取货";
                        } else {
                            return array ("state" => 200, "info" => '订单状态异常，操作失败1！');
                        }

                    } else {
                        return array ("state" => 200, "info" => '订单状态异常，操作失败2！');
                    }

                    //成功
                } else {
                    if ($state == 1) {

                        //初始化日志
                        include_once(HUONIAOROOT."/api/payment/log.php");
                        $_paotuiOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/paotuiOrder/'.date('Y-m-d').'.log', true);

                        $sql = $dsql->SetQuery("SELECT `id`,`receivingcode`,`type`,`uid`,`ordernum`,`amount`,`cityid`,`lng`,`lat`,`buylng`,`buylat`,`peidate`,`okdate`,`point`,`tip`,`courierfencheng` FROM `#@__paotui_order` WHERE `id` = $id AND `state` = 5 AND `peisongid` = $did");

                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {

                            $lng               = $ret[0]['lng'];
                            $lat               = $ret[0]['lat'];
                            $courierfencheng   = $ret[0]['courierfencheng'];
                            if ($pslng < $pslat) {
                                list($pslat,$pslng) = array($pslng,$pslat);
                            }
                            $julishop = getDistance($pslng, $pslat, $lng, $lat) / 1000;
                            if ($julishop > (float)$customsuccessLimit) {
                                return array ("state" => 200, "info" => '您现在距离用户' . sprintf('%.2f',$julishop)  . '公里，请到达用户位置后再操作');
                            } elseif ($julishop  == 0){
                                $julishop = oldgetDistance($pslng, $pslat, $lng, $lat) / 1000;
                                if ($julishop > (float)$customsuccessLimit) {

                                    return array ("state" => 200, "info" => '距离太远,请到达用户位置后再操作');
                                }
                            }
                            global $customIsopencode;
                            if ($ret[0]['type'] == 2 && $customIsopencode == 1) {
                                if ($paotuicode == '') {
                                    return array ("state" => 200, "info" => '请填写取货码！');
                                }
                                if ($ret[0]['receivingcode'] != $paotuicode) {
                                    return array ("state" => 200, "info" => '取货码错误！');
                                }
                            }

//                            global $cfg_pointRatio;
//                            $uid      = $ret[0]['uid'];
//                            $ordernum = $ret[0]['ordernum'];
//                            $pointprice = $ret[0]['point'] / $cfg_pointRatio;
//                            $amount   = $ret[0]['amount'] + $pointprice;
//                            $cityid   = $ret[0]['cityid'];
//                            $lng      = $ret[0]['lng'];
//                            $lat      = $ret[0]['lat'];
//                            $peidate  = $ret[0]['peidate'];
//                            $okdate   = $ret[0]['okdate'];

                             global $cfg_pointRatio;
                            $uid        = $ret[0]['uid'];
                            $ordernum   = $ret[0]['ordernum'];
                            $pointprice = $ret[0]['point'] / $cfg_pointRatio;
                            $amount     = $ret[0]['amount'];
                            $cityid     = $ret[0]['cityid'];
                            $buylng     = $ret[0]['buylng'];
                            $buylat     = $ret[0]['buylat'];
                            $peidate    = $ret[0]['peidate'];
                            $okdate     = $ret[0]['okdate'];
                            $tip        = $ret[0]['tip'];
                            //                    global $siteCityInfo;
                            //                    $cityid  = $siteCityInfo['cityid'];

                            $_paotuiOrderLog->DEBUG("订单信息:" . json_encode($ret[0]));

                            $date = GetMkTime(time());
                            $sql  = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `state` = 1, `okdate` = $date,`usedate`= '$date' WHERE `id` = $id AND `state` = 5");
                            $ret  = $dsql->dsqlOper($sql, "update");
                            if ($ret == "ok") {
                                /*配送结算*/
                                /*商城距离用户*/
                                $shopjluser = getDistance($lat, $lng, $buylat, $buylng) / 1000;
                                /*骑手完成时间 从骑手接单时间开始计算*/
                                $qsoktime = ($okdate - $peidate) % 86400 / 60;

                                /*骑手额外所得*/
                                $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
                                /*外卖额外加成要求*/
                                $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

//                                $courierfencheng = $paotuiportion != '0.00' ? $paotuiportion : $customwaimaiCourierP;


                                $_paotuiOrderLog->DEBUG("订单总金额:" . $amount . "，小费：" . $tip . "，分成比例：" . $courierfencheng);

                                $courreward = ($amount - $tip) * $courierfencheng / 100;

                                sort($waimaadditionkm);
                                $satisfy = $additionprice = 0;
                                for ($i = 0; $i < count($waimaadditionkm); $i++) {
                                    if ($shopjluser > $waimaadditionkm[$i][0] && $shopjluser <= $waimaadditionkm[$i][2] && $qsoktime <= $waimaadditionkm[$i][1]) {
                                        $satisfy = 1;
                                        break;
                                    }
                                }

                                if ($satisfy == 1) {

                                    for ($a = 0; $a < count($waimaiorderprice); $a++) {

                                        if ($amount >= $waimaiorderprice[$a][0] && $amount <= $waimaiorderprice[$a][1]) {
                                            $additionprice = $waimaiorderprice[$a][2];
                                        }
                                    }
                                }
                                $courierarr = array ();

                                $courierarr['peisongTotal']    = $amount;              /*配送费*/
                                $courierarr['courierfencheng'] = $courierfencheng;     /*骑手分成*/
                                $courierarr['shopjluser']      = $shopjluser;          /*商城距离用户*/
                                $courierarr['qsoktime']        = $qsoktime;            /*骑手完成用时*/
                                $courierarr['amount']          = $amount;              /*订单总金额*/
                                $courierarr['additionprice']   = $additionprice;       /*骑手加成所得*/
                                $courierarr['tip']             = $tip;                 /*小费*/

                                $_paotuiOrderLog->DEBUG("gebili:" . json_encode($courierarr));

                                $courierarr = serialize($courierarr);
                                $courreward += $additionprice;
                                $courreward += $tip; /*小费*/

                                $_paotuiOrderLog->DEBUG("骑手应得：((总金额(" . $amount . ") - 小费(" . $tip . ")) * 分成比例(" . $courierfencheng . " / 100)) + 加成(".$additionprice.") + 小费(".$tip.") = " . $courreward);

                                $waimaiordersql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `courier_gebili` = '$courierarr', `courier_get` = '$courreward'  WHERE `id` = '$id'");
                                $_paotuiOrderLog->DEBUG("waimaiordersql:" . $waimaiordersql);
                                $dsql->dsqlOper($waimaiordersql, "update");


                                $updatesql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money`+'$courreward' WHERE `id` = '$did'");
                                $_paotuiOrderLog->DEBUG("updatesql:" . $updatesql);
                                $dsql->dsqlOper($updatesql, "update");

                                $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$did'");           //查询骑手余额
                                $courieMoney = $dsql->dsqlOper($selectsql,"results");
                                $courierMoney = $courieMoney[0]['money'];
                                $date = GetMkTime(time());
                                $info ='跑腿收入-订单号-'.$ordernum;
                                //记录操作日志
                                $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`) VALUES ('$did','1','$courreward','$info','$date','$courierMoney')");
                                $dsql->dsqlOper($insertsql,"update");
                                //初始化日志
                                include_once(HUONIAOROOT."/api/payment/log.php");
                                $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                                $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
                                $_courierOrderLog->DEBUG('跑腿收入:'.$courreward.'骑手账户余额剩余:'.$courierMoney);

                                //分站相关
                                global $cfg_fzwaimaiPaotuiFee;
                                global $userLogin;
                                //分站佣金
                                $fzFee          = cityCommission($cityid, 'waimaiPaotui');
                                $fztotalAmount_ = ($amount-$courreward) * $fzFee / 100;

                                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                                $dsql->dsqlOper($fzarchives, "update");
                                $user           = $userLogin->getMemberInfo($uid);
                                $usermoney      = $user['money'];
                                $pttotalAmount_ = (float)($amount-$courreward) - (float)$fztotalAmount_;
                                $money          = sprintf('%.2f', ($usermoney + $fztotalAmount_));
                                /*平台跑腿订单收入*/
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`)
                        VALUES ('$uid', '1', '$amount', '外卖跑腿收入:$ordernum', '$date','$cityid','$fztotalAmount_','waimai','$pttotalAmount_','1','yongjin','$money')");
                                //                        $dsql->dsqlOper($archives, "update");
                                $lastid = $dsql->dsqlOper($archives, "lastid");

                                substationAmount($lastid, $cityid);

                                //消息通知用户
                                $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernum`, o.`okdate` FROM `#@__paotui_order` o WHERE o.`id` = $id");
                                $ret_ = $dsql->dsqlOper($sql_, "results");
                                if ($ret_) {
                                    $data = $ret_[0];

                                    $uid      = $data['uid'];
                                    $ordernum = $data['ordernum'];
                                    $okdate   = $data['okdate'];

                                    $param = array (
                                        "service"  => "member",
                                        "type"     => "user",
                                        "template" => "orderdetail",
                                        "module"   => "paotui",
                                        "id"       => $id
                                    );

                                    //自定义配置
                                    $config = array (
                                        "ordernum" => $ordernum,
                                        "date"     => date("Y-m-d H:i:s", $okdate),
                                        "fields"   => array (
                                            'keyword1' => '订单号',
                                            'keyword2' => '完成时间'
                                        )
                                    );

                                    updateMemberNotice($uid, "会员-订单完成通知", $param, $config, '', '', 0, 1);
                                }


                                return "已完成";
                            } else {
                                return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                            }

                        } else {
                            return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                        }

                        //其他情况
                    } else {
                        return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                    }
                }
            } else {
                if ($ordertype == "shop") {
                    //取货
                    if ($state == 5) {
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_order` WHERE `id` = $id AND `songdate` = 0 AND `peisongid` = $did");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {

                            $date = GetMkTime(time());
                            $sql  = $dsql->SetQuery("UPDATE `#@__shop_order` SET `songdate` = $date ,`exp_date` = $date WHERE `id` = $id");
                            $ret  = $dsql->dsqlOper($sql, "update");
                            if ($ret == "ok") {
                                return "已取货";
                            } else {
                                return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                            }
                        } else {
                            return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                        }

                        //送达
                    } else {
                        if ($state == 1) {
                            $sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__shop_order` WHERE `id` = $id AND `songdate` != 0 AND `okdate` = 0 AND `peisongid` = $did");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {

                                $date = GetMkTime(time());
                                $sql  = $dsql->SetQuery("UPDATE `#@__shop_order` SET `okdate` = $date WHERE `id` = $id");
                                $dsql->dsqlOper($sql, "update");

                                global $autoReceiptUserID;
                                $autoReceiptUserID = $ret[0]['userid'];

                                $configHandels = new handlers("shop", "receipt");
                                $moduleConfig  = $configHandels->getHandle(array ("id" => $id,'did'=>$did));

                                // return $moduleConfig;


                                if ($moduleConfig['state'] == 100) {
                                    return "已送达";
                                } else {
                                    return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                                }
                            } else {
                                return array ("state" => 200, "info" => '订单状态异常，操作失败！');
                            }
                        }
                    }
                }
            }
        }
    }


    //骑手开工停工
    public function updateCourierState()
    {
        global $dsql;
        $state = $this->param['state'];
        $did   = GetCookie("courier");
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat` FROM `#@__waimai_courier` WHERE `id` = $did");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在！');
            }
            $lng = $ret[0]['lng'];
            $lat = $ret[0]['lat'];
        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        $sql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `state` = $state WHERE `id` = $did");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {

            // 记录日志
            $time = GetMkTime(time());
            $ip   = GetIP();
            $sql  = $dsql->SetQuery("INSERT INTO `#@__waimai_courier_log` (`uid`, `state`, `ip`, `pubdate`, `lng`, `lat`) VALUES ('$did', '$state', '$ip', '$time', '$lng', '$lat')");
            $dsql->dsqlOper($sql, "lastid");

            return "更新成功！";
        } else {
            return array ("state" => 200, "info" => '更新失败！');
        }
    }

    /**
     * 用户注销（设置为离职状态）
    */
    public function courierOff(){
        global $dsql;
        $did   = GetCookie("courier");
        if ($did) {
            $sql = $dsql->SetQuery("SELECT `quit`, `offtime` FROM `#@__waimai_courier` WHERE `id` = $did");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array ("state" => 200, "info" => '骑手不存在！');
            }
        } else {
            return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
        }

        if($ret[0]['quit']!=1){
            $time = time();
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `quit` = 1, `offtime`='$time', `status` = 0 WHERE `id` = $did");
            $ret = $dsql->dsqlOper($sql, "update");
            if ($ret == "ok") {
                return "更新成功！";
            } else {
                return array ("state" => 200, "info" => '更新失败！');
            }
        }else{
            // 原本已经离职，再次设置为离职，直接返回ok
            return "更新成功！";
        }
    }


    /**
     * 更新骑手位置
     */
    public function updateCourierLocation()
    {
        global $dsql;
        $uid      = (int)$this->param['uid'];
        $lng      = $this->param['lng'];
        $lat      = $this->param['lat'];
        $rotation = $this->param['rotation'];

        //初始化日志
        include_once(HUONIAOROOT."/api/payment/log.php");
        $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierLocation/'.date('Y-m-d').'.log', true);
        $_courierOrderLog->DEBUG('uid:'.$uid);
        $_courierOrderLog->DEBUG('lng:'.$lng);
        $_courierOrderLog->DEBUG('lat:'.$lat);
        $_courierOrderLog->DEBUG('rotation:'.$rotation);

        //苹果端需要转换坐标  百度转高德
        if (!isAndroidApp()) {
            // $poi = bd_decrypt($lng, $lat);
            // $lng = $poi['lng'];
            // $lat = $poi['lat'];
        }

        if ($uid && $lng && $lat && $lng != '4.9E-324' && $lat !='4.9E-324' && $lng != '0.0' && $lat !='0.0') {

            //更新骑手表
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `lng` = '$lat', `lat` = '$lng',`rotation` = '$rotation' WHERE `id` = $uid");
            $dsql->dsqlOper($sql, "update");

            //更新骑手所有配送中的订单地图路径
            $sql = $dsql->SetQuery("SELECT `id`, `peisongpath` FROM `#@__waimai_order_all` WHERE `peisongid` = $uid AND `state` = 5");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                foreach ($ret as $key => $value) {
                    $id  = $value['id'];
                    $val = $value['peisongpath'];
                    //外卖分表
                    $sub         = new SubTable('waimai_order', '#@__waimai_order');
                    $break_table = $sub->getSubTableById($id);
                    if (empty($val)) {
                        $val = $lng . "," . $lat;
                    } else {
                        $val .= ";" . $lng . "," . $lat;
                    }

                    $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `peisongpath` = '$val' WHERE `id` = $id");
                    $dsql->dsqlOper($sql, "update");
                }
            }

            return "success";
        } else {
            return array ("state" => 200, "info" => 'error');
        }
    }


    /**
     * 帮助分类
     *
     * @return array
     */
    public function newsType()
    {
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "waimai_news_type", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }

    /**
     * 帮助分类
     *
     * @return array
     */
    public function verificationpaotuiCode()
    {
        global $dsql;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $receivingcode = (int)$this->param['receivingcode'];
                $id            = (int)$this->param['id'];
            }

            $did = GetCookie("courier");
            if ($did) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE `id` = $did");
                $ret = $dsql->dsqlOper($sql, "results");
                if (!$ret) {
                    return array ("state" => 200, "info" => '骑手不存在！');
                }

            } else {
                return array ("state" => 200, "info" => '登录超时，刷新页面重试！');
            }

            $sql = $dsql->SetQuery("SELECT `id`,`receivingcode` FROM `#@__paotui_order` WHERE `id` = '" . $id . "' AND `peisongid` = '" . $did . "' AND `usecode` = 0");
            $ret = $dsql->dsqlOper($sql, "results");

            if ($ret) {
                if ($ret[0]['receivingcode'] == $receivingcode) {
                    $usedate = time();
                    $sql     = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `usedate` = '" . $usedate . "' WHERE `id` = '" . $id . "'");
                    $dsql->dsqlOper($sql, 'update');
                } else {
                    return array ("state" => 200, "info" => '未找到该笔订单！');
                }

            } else {
                return array ("state" => 200, "info" => '未找到该笔订单！');
            }
        }
    }


    /**
     * 帮助信息
     *
     * @return array
     */
    public function news()
    {
        global $dsql;
        $pageinfo = $list = array ();
        $typeid   = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $typeid   = $this->param['typeid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "waimai_news_type")) {
                $lower = arr_foreach($dsql->getTypeList($typeid, "waimai_news_type"));
                $lower = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `typeid`, `body`, `pubdate` FROM `#@__waimai_news` ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        $list    = array ();
        foreach ($results as $key => $val) {
            $list[$key]['id']      = $val['id'];
            $list[$key]['title']   = $val['title'];
            $list[$key]['typeid']  = $val['typeid'];
            $list[$key]['body']    = $val['body'];
            $list[$key]['pubdate'] = $val['pubdate'];
        }
        return array ("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 帮助信息详细
     *
     * @return array
     */
    public function newsDetail()
    {
        global $dsql;
        $newsDetail = array ();

        if (empty($this->param)) {
            return array ("state" => 200, "info" => '信息ID不得为空！');
        }

        if (!is_numeric($this->param)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_news` WHERE `arcrank` = 0 AND `id` = " . $this->param);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $newsDetail["title"]   = $results[0]['title'];
            $newsDetail["typeid"]  = $results[0]['typeid'];
            $newsDetail["body"]    = $results[0]['body'];
            $newsDetail["pubdate"] = $results[0]['pubdate'];
        }
        return $newsDetail;
    }


    //验证购物车内容
    public function checkCart()
    {
        global $dsql;
        $id = $this->param['id'];

        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $cartArr  = array ();
        $cartData = GetCookie("waimai_store" . $id);
        if ($cartData) {
            $cartData = explode("^O^", $cartData);
            foreach ($cartData as $key => $value) {
                $cart  = explode("^^", $value);
                $mid   = $cart[0];
                $price = $cart[1];
                $count = $cart[2];
                $name  = $cart[3];

                $sql = $dsql->SetQuery("SELECT `price` FROM `#@__waimai_menu` WHERE `store` = $id AND `id` = $mid");
                $ret = $dsql->dsqlOper($sql, "results");
                if (!$ret) {
                    return array ("state" => 200, "info" => '【' . $name . '】商品不存存，请确认后重试！');
                } else {
                    if ($price - $ret[0]['price'] != 0) {
                        return array ("state" => 200, "info" => '【' . $name . '】商品提交价格与真实价格不符，请重新下单！');
                    }
                }
            }

            return "ok";
        } else {
            return array ("state" => 200, "info" => '购物车为空，请刷新重试！');
        }

    }


    /**
     * 下单&支付
     *
     * @return array
     */
    public function pay_()
    {
        global $dsql;
        global $userLogin;
        global $cfg_basehost;

        $param     = $this->param;
        $id        = $param['id'];
        $ordernum  = $param['ordernum'];
        $paytype   = $param['paytype'];
        $addressid = $param['addressid'];
        $note      = $param['note'];
        $check     = $param['check'];
        $userid    = $userLogin->getMemberID();
        $date      = GetMkTime(time());

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时');
        }
        if (empty($id)) {
            return array ("state" => 200, "info" => '格式错误');
        }
        if (empty($addressid)) {
            return array ("state" => 200, "info" => '请选择收货地址');
        }
        if (empty($paytype)) {
            return array ("state" => 200, "info" => '请选择支付方式');
        }

        $this->param = $id;
        $storeDetail = $this->storeDetail();
        if (!is_array($storeDetail)) {
            return array ("state" => 200, "info" => '商家不存在，请确认后重试！');
        }
        if (!$storeDetail['state']) {
            return array ("state" => 200, "info" => '商家休息中，暂不可下单！');
        }

        //收货地址信息
        global $data;
        $data     = "";
        $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $addressid");
        $userAddr = $dsql->dsqlOper($archives, "results");
        if (!$userAddr) {
            return array ("state" => 200, "info" => '会员地址库信息不存在或已删除');
        }
        $addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
        $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
        $addr    = join(" ", $addrArr);
        $address = $addr . $userAddr[0]['address'];
        $person  = $userAddr[0]['person'];
        $mobile  = $userAddr[0]['mobile'];
        $tel     = $userAddr[0]['tel'];
        $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;

        $totalPrice = 0;  //商品总价
        $offer      = 0;  //优惠
        $price      = $storeDetail['price'];   //起送价
        $peisong    = $storeDetail['peisong']; //配送费
        $sale       = $storeDetail['sale'];    //满减

        //新订单
        if (empty($ordernum)) {

            //验证店铺信息
            $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_store` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                if ($ret[0]['userid'] == $userid) {
                    return array ("state" => 200, "info" => '不可以购买自己店铺的商品！');
                }
            } else {
                return array ("state" => 200, "info" => '商家不存在，请确认后操作！');
            }

            $cartData = GetCookie("waimai_store" . $id);
            if (empty($cartData)) {
                return array ("state" => 200, "info" => '操作超时，请重新下单！');
            }

            $cartData = explode("^O^", $cartData);
            foreach ($cartData as $key => $value) {
                $cart  = explode("^^", $value);
                $mid   = $cart[0];
                $price = $cart[1];
                $count = $cart[2];
                $name  = $cart[3];

                $sql = $dsql->SetQuery("SELECT `price` FROM `#@__waimai_menu` WHERE `store` = $id AND `id` = $mid");
                $ret = $dsql->dsqlOper($sql, "results");
                if (!$ret) {
                    return array ("state" => 200, "info" => '【' . $name . '】商品不存存，请确认后重试！');
                } else {
                    if ($price - $ret[0]['price'] != 0) {
                        return array ("state" => 200, "info" => '【' . $name . '】商品提交价格与真实价格不符，请重新下单！');
                    }
                }

                $totalPrice += $price * $count;
            }

            //计算优惠
            if ($storeDetail['sale']) {
                foreach ($storeDetail['sale'] as $key => $value) {
                    if ($totalPrice >= $value[0]) {
                        $offer = $value[1];
                    }
                }
            }

            //支付费用 = 商品总价 + 配送费 - 优惠
            $payPrice = sprintf("%.2f", $totalPrice + $peisong - $offer);

            //老订单
        } else {

            //查询订单
            $sql = $dsql->SetQuery("SELECT `id`, `price`, `offer`, `peisong`, `state` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum' AND `userid` = $userid AND `store` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data    = $ret[0];
                $orderid = $data['id'];
                $price   = $data['price'];
                // $offer   = $data['offer'];
                // $peisong = $data['peisong'];
                $state = $data['state'];

                if ($state != 0) {
                    return array ("state" => 200, "info" => '订单状态错误，请确认后重试！');
                }

                //验证订单内容
                $sql = $dsql->SetQuery("SELECT `pid`, `pname`, `price` FROM `#@__waimai_order_product` WHERE `orderid` = $orderid AND `store` = $id");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {

                    foreach ($ret as $key => $value) {
                        $mid    = $value['pid'];
                        $name   = $value['pname'];
                        $price_ = $value['price'];

                        $sql = $dsql->SetQuery("SELECT `price` FROM `#@__waimai_menu` WHERE `store` = $id AND `id` = $mid");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if (!$ret) {
                            return array ("state" => 200, "info" => '【' . $name . '】商品不存存，请确认后重试！');
                        } else {
                            if ($price_ - $ret[0]['price'] != 0) {
                                return array ("state" => 200, "info" => '【' . $name . '】商品提交价格与当前价格不符，请重新下单！');
                            }
                        }
                    }

                } else {
                    return array ("state" => 200, "info" => '订单内容为空，请确认后重试！');
                }


                //计算优惠
                if ($storeDetail['sale']) {
                    foreach ($storeDetail['sale'] as $key => $value) {
                        if ($price >= $value[0]) {
                            $offer = $value[1];
                        }
                    }
                }


                //支付费用 = 商品总价 + 配送费 - 优惠
                $payPrice = sprintf("%.2f", $price + $peisong - $offer);

            } else {
                return array ("state" => 200, "info" => '订单不存在或已经删除，请确认后重试！');
            }

        }

        //价格验证
        if ($payPrice <= 0) {
            return array ("state" => 200, "info" => '订单金额必须大于0！');
        }


        //如果是验证订单内容
        if ($check) {
            return "ok";
        }


        //如果是支付页面只需要更新订单信息
        if (!empty($ordernum)) {

            //分表
            $sub         = new SubTable('waimai_order', '#@__waimai_order');
            $break_table = $sub->getSubTableById($id);

            $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `peisong` = '$peisong', `offer` = '$offer', `paytype` = '$paytype', `people` = '$person', `contact` = '$mobile', `address` = '$address', `note` = '$note' WHERE `id` = $orderid");
            $dsql->dsqlOper($sql, "update");

            //新订单
        } else {
            $sub               = new SubTable('waimai_order', '#@__waimai_order');
            $insert_table_name = $sub->getLastTable();

            $ordernum = create_ordernum();
            $sql      = $dsql->SetQuery("INSERT INTO `" . $insert_table_name . "` (`ordernum`, `userid`, `store`, `price`, `paytype`, `offer`, `peisong`, `people`, `contact`, `address`, `note`, `orderdate`, `state`) VALUES ('$ordernum', '$userid', '$id', '$totalPrice', '$paytype', '$offer', '$peisong', '$person', '$mobile', '$address', '$note', '$date', '0')");
            $oid      = $dsql->dsqlOper($sql, "lastid");

            $sql                 = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
            $res                 = $dsql->dsqlOper($sql, "results");
            $breakup_table_count = $res[0]['total'];
            if ($breakup_table_count >= $sub->MAX_SUBTABLE_COUNT) {
                $new_table = $sub->createSubTable($oid); //创建分表并保存记录
            }

            if (is_numeric($oid)) {

                foreach ($cartData as $key => $value) {
                    $cart  = explode("^^", $value);
                    $mid   = $cart[0];
                    $price = $cart[1];
                    $count = $cart[2];
                    $name  = $cart[3];

                    $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_order_product` (`orderid`, `store`, `pid`, `pname`, `price`, `count`) VALUES ('$oid', '$id', '$mid', '$name', '$price', '$count')");
                    $dsql->dsqlOper($sql, "update");
                }

            } else {
                die("订单写入数据库失败！");
            }

        }

        //跳转至第三方支付页面
        createPayForm("waimai", $ordernum, $payPrice, $paytype, "外卖订单");


    }


    /**
     * 支付成功
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
     */
    //    public function paySuccess_()
    //    {
    //        $param = $this->param;
    //        if (!empty($param)) {
    //            global $dsql;
    //
    //            $paytype  = $param['paytype'];
    //            $ordernum = $param['ordernum'];
    //            $date     = GetMkTime(time());
    //
    //            //查询订单信息
    //            $archives = $dsql->SetQuery("SELECT `userid`, `store`, `paydate`, `price`, `peisong`, `offer`,`id` FROM `#@__waimai_order_all` WHERE `ordernum` = '$ordernum'");
    //            $res      = $dsql->dsqlOper($archives, "results");
    //            if ($res) {
    //                $paydate = $res[0]['paydate'];
    //                $uid     = $res[0]['userid'];
    //                $store   = $res[0]['store'];
    //                $price   = $res[0]['price'];
    //                $peisong = $res[0]['peisong'];
    //                $offer   = $res[0]['offer'];
    //                $id   = $res[0]['id'];
    //
    //                $totalPrice = sprintf("%.2f", $price + $peisong - $offer);
    //
    //                //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
    //                if ($paydate == 0) {
    //                    //更新订单状态
    //
    //
    //                    $sub = new SubTable('waimai_order', '#@__waimai_order');
    //                    $break_table = $sub->getSubTableById($id);
    //
    //                    $archives = $dsql->SetQuery("UPDATE `".$break_table."` SET `state` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
    //                    $dsql->dsqlOper($archives, "update");
    //
    //                    //保存操作日志
    //                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$uid', '0', '$totalPrice', '外卖消费：$ordernum', '$date')");
    //                    $dsql->dsqlOper($archives, "update");
    //                }
    //
    //                //清除购物车内容
    //                DropCookie("waimai_store" . $store);
    //            }
    //        }
    //    }


    /**
     * 删除订单-用户端隐藏
     * @return array
     */
    public function delOrder()
    {
        global $dsql;
        global $userLogin;

        $id   = $this->param['id'];
        $type = $this->param['type'];


        $sub    = new SubTable('waimai_order', '#@__waimai_order');
        $dbname = $sub->getSubTableById($id);
        if ($type == "paotui") {
            $dbname = "#@__paotui_order";
        }

        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $archives = $dsql->SetQuery("SELECT * FROM `" . $dbname . "` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['uid'] == $uid) {

                if ($results['state'] == 0 || $results['state'] == 1 || $results['state'] == 6 || $results['state'] == 7) {
                    $archives = $dsql->SetQuery("UPDATE `" . $dbname . "` SET `del` = 1 WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");

                    return '删除成功！';
                } else {
                    return array ("state" => 101, "info" => '订单当前状态不可以删除！');
                }

            } else {
                return array ("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array ("state" => 101, "info" => '订单不存在，或已经删除！');
        }

    }


    /**
     * 配置商铺
     *
     * @return array
     */
    public function storeConfig()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid        = $userLogin->getMemberID();
        $param         = $this->param;
        $title         = filterSensitiveWords(addslashes($param['title']));
        $typeid        = $param['typeid'];
        $typeid        = isset($typeid) ? join(',', $typeid) : '';
        $litpic        = $param['litpic'];
        $addrid        = (int)$param['addrid'];
        $address       = filterSensitiveWords(addslashes($param['address']));
        $lnglat        = filterSensitiveWords(addslashes($param['lnglat']));
        $tel           = filterSensitiveWords(addslashes($param['contact']));
        $range         = filterSensitiveWords(addslashes($param['range']));
        $times         = (int)$param['times'];
        $start1        = filterSensitiveWords(addslashes($param['start1']));
        $end1          = filterSensitiveWords(addslashes($param['end1']));
        $start2        = filterSensitiveWords(addslashes($param['start2']));
        $end2          = filterSensitiveWords(addslashes($param['end2']));
        $price         = (float)$param['price'];
        $peisong       = (float)$param['peisong'];
        $online        = (int)$param['online'];
        $supfapiao     = (int)$param['supfapiao'];
        $m1            = $param['m1'];
        $m1            = isset($m1) ? $m1 : array ();
        $m2            = $param['m2'];
        $m2            = isset($m2) ? $m2 : array ();
        $fapiao        = (float)$param['fapiao'];
        $fapiaonote    = filterSensitiveWords(addslashes($param['fapiaonote']));
        $notice        = filterSensitiveWords(addslashes($param['notice']));
        $note          = filterSensitiveWords(addslashes($param['note']));
        $yingyezhizhao = $param['yingyezhizhao'];
        $weishengxuke  = $param['weishengxuke'];
        $vdimgck       = $param['vdimgck'];
        $pubdate       = GetMkTime(time());

        $vdimgck = strtolower($vdimgck);
        if ($vdimgck != $_SESSION['huoniao_vdimg_value']) {
            return array ("state" => 200, "info" => '验证码输入错误');
        }

        if ($userid == 0 && $userid == '') {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['userType'] != 2) {
            return array ("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        if (empty($title)) {
            return array ("state" => 200, "info" => '请输入店铺名称');
        }

        if (empty($typeid)) {
            return array ("state" => 200, "info" => '请选择经营类别');
        }

        if (empty($addrid)) {
            return array ("state" => 200, "info" => '请选择所在区域');
        }

        if (empty($address)) {
            return array ("state" => 200, "info" => '请输入详细地址');
        }

        if (empty($tel)) {
            return array ("state" => 200, "info" => '请输入联系电话');
        }

        $note = cn_substrR($note, 255);

        $sale = array ();
        foreach ($m1 as $key => $value) {
            $sale[$key] = $value . "," . $m2[$key];
        }
        $sale = join("$$", $sale);

        $userSql    = $dsql->SetQuery("SELECT `id`, `yingye`, `weisheng` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //新商铺
        if (!$userResult) {

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_store` (`userid`, `title`, `typeid`, `logo`, `start1`, `end1`, `start2`, `end2`, `times`, `addr`, `address`, `lnglat`, `tel`, `range`, `price`, `peisong`, `online`, `sale`, `supfapiao`, `fapiao`, `fapiaonote`, `note`, `notice`, `yingyezhizhao`, `weishengxuke`, `state`, `pubdate`) VALUES ('$userid', '$title', '$typeid', '$litpic', '$start1', '$end1', '$start2', '$end2', '$times', '$addrid', '$address', '$lnglat', '$tel', '$range', '$price', '$peisong', '$online', '$sale', '$supfapiao', '$fapiao', '$fapiaonote', '$note', '$notice', '$yingyezhizhao', '$weishengxuke', 0, '$pubdate')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'waimai',
                    'template' => 'shop',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'waimai', 'shop', $aid, 'insert', '申请外卖店铺('.$title.')', $url, $archives);

                // 更新店铺开关
                updateStoreSwitch("waimai", "waimai_store", $userid, $aid);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $param    = array (
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array (
                        'contentrn' => $cityName . '分站——waimai模块——用户:' . $userDetail['username'] . '新增商铺: ' . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("waimai", "store", $param);

                return "配置成功，您的商铺正在审核中，请耐心等待！";
            } else {
                return array ("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

            //更新商铺信息
        } else {

            $certify = "";
            if (!$userResult[0]['yingye']) {
                $certify .= " , `yingyezhizhao` = '$yingyezhizhao'";
            }
            if (!$userResult[0]['weisheng']) {
                $certify .= " , `weishengxuke` = '$weishengxuke'";
            }

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__waimai_store` SET `title` = '$title', `typeid` = '$typeid', `logo` = '$litpic', `start1` = '$start1', `end1` = '$end1', `start2` = '$start2', `end2` = '$end2', `times` = '$times', `addr` = '$addrid', `address` = '$address', `lnglat` = '$lnglat', `tel` = '$tel', `range` = '$range', `price` = '$price', `peisong` = '$peisong', `online` = '$online', `sale` = '$sale', `supfapiao` = '$supfapiao', `fapiao` = '$fapiao', `fapiaonote` = '$fapiaonote', `note` = '$note', `notice` = '$notice'" . $certify . " WHERE `userid` = " . $userid);
            $results  = $dsql->dsqlOper($archives, "update");

            if ($results == "ok") {

                $urlParam = array(
                    'service' => 'waimai',
                    'template' => 'shop',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'waimai', 'shop', $userResult[0]['id'], 'update', '修改外卖店铺('.$title.')', $url, $archives);
                
                return "保存成功！";
            } else {
                return array ("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

        }


    }


    /**
     * 删除菜单分类
     *
     * @return array
     */
    public function delMenuType()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $id     = $this->param['id'];

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($id)) {
            return array ("state" => 200, "info" => '删除失败，请重试！');
        }

        $sql = $dsql->SetQuery("SELECT t.`id` FROM `#@__waimai_menu_type` t LEFT JOIN `#@__waimai_store` s ON s.`id` = t.`store` WHERE t.`id` = $id AND s.`userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_menu` WHERE `typeid` = " . $id);
            $dsql->dsqlOper($sql, "update");

            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_menu_type` WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
            return "删除成功！";
        } else {
            return array ("state" => 200, "info" => '分类验证失败！');
        }

    }


    /**
     * 更新菜单分类
     *
     * @return array
     */
    public function updateMenuType()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $store  = $this->param['store'];
        $data   = $_POST['data'];

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($data)) {
            return array ("state" => 200, "info" => '请添加分类！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = " . $userid . " AND `id` = $store");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $storeid = $ret[0]['id'];

            $data = str_replace("\\", '', $data);
            $json = json_decode($data);

            $json = objtoarr($json);
            $json = $this->proTypeAjax($json, "waimai_menu_type", $store);
            return $json;

        } else {
            return array ("state" => 200, "info" => '您的账户暂未开通商品商铺功能！');
        }

    }


    /**
     * 删除相册分类
     *
     * @return array
     */
    public function delAlbumsType()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $id     = $this->param['id'];

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($id)) {
            return array ("state" => 200, "info" => '删除失败，请重试！');
        }

        $sql = $dsql->SetQuery("SELECT t.`id` FROM `#@__waimai_album_type` t LEFT JOIN `#@__waimai_store` s ON s.`id` = t.`store` WHERE t.`id` = $id AND s.`userid` = " . $userid);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_album` WHERE `typeid` = " . $id);
            $dsql->dsqlOper($sql, "update");

            $sql = $dsql->SetQuery("DELETE FROM `#@__waimai_album_type` WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
            return "删除成功！";
        } else {
            return array ("state" => 200, "info" => '分类验证失败！');
        }

    }


    /**
     * 更新相册分类
     *
     * @return array
     */
    public function updateAlbumsType()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $store  = $this->param['store'];
        $data   = $_POST['data'];

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($data)) {
            return array ("state" => 200, "info" => '请添加分类！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = " . $userid . " AND `id` = $store");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $storeid = $ret[0]['id'];

            $data = str_replace("\\", '', $data);
            $json = json_decode($data);

            $json = objtoarr($json);
            $json = $this->proTypeAjax($json, "waimai_album_type", $store);
            return $json;

        } else {
            return array ("state" => 200, "info" => '您的账户暂未开通商品商铺功能！');
        }

    }


    //更新分类
    public function proTypeAjax($json, $tab, $store)
    {
        global $dsql;
        for ($i = 0; $i < count($json); $i++) {
            $id   = $json[$i]["id"];
            $name = $json[$i]["val"];

            //如果ID为空则向数据库插入下级分类
            if ($id == "" || $id == 0) {
                $archives = $dsql->SetQuery("INSERT INTO `#@__" . $tab . "` (`store`, `typename`, `weight`) VALUES ('$store', '$name', '$i')");
                $id       = $dsql->dsqlOper($archives, "lastid");
            } //其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
            else {
                $archives = $dsql->SetQuery("SELECT `typename`, `weight` FROM `#@__" . $tab . "` WHERE `id` = " . $id);
                $results  = $dsql->dsqlOper($archives, "results");
                if (!empty($results)) {
                    //验证分类名
                    if ($results[0]["typename"] != $name) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `typename` = '$name' WHERE `id` = " . $id);
                        $results  = $dsql->dsqlOper($archives, "update");
                    }

                    //验证排序
                    if ($results[0]["weight"] != $i) {
                        $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `weight` = '$i' WHERE `id` = " . $id);
                        $results  = $dsql->dsqlOper($archives, "update");
                    }
                }
            }
        }
        return '保存成功！';

    }


    /**
     * 新增菜单
     *
     * @return array
     */
    public function addMenu()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $title   = filterSensitiveWords(addslashes($param['title']));
        $typeid  = (int)($param['typeid']);
        $price   = (float)($param['price']);
        $pics    = $param['pics'];
        $note    = filterSensitiveWords(addslashes($param['note']));
        $vdimgck = $param['vdimgck'];
        $pubdate = GetMkTime(time());

        $vdimgck = strtolower($vdimgck);
        if ($vdimgck != $_SESSION['huoniao_vdimg_value']) {
            return array ("state" => 200, "info" => '验证码输入错误');
        }

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array ("state" => 200, "info" => '您还未开通外卖店铺！');
        }

        if ($userResult[0]['state'] == 0) {
            return array ("state" => 200, "info" => '您的店铺信息还在审核中，请通过审核后再发布！');
        }

        if ($userResult[0]['state'] == 2) {
            return array ("state" => 200, "info" => '您的店铺信息审核失败，请通过审核后再发布！');
        }

        $storeid = $userResult[0]['id'];

        if (empty($title)) {
            return array ("state" => 200, "info" => '请输入菜单名称');
        }

        if (empty($typeid)) {
            return array ("state" => 200, "info" => '请选择菜单分类');
        }

        if (empty($price)) {
            return array ("state" => 200, "info" => "请输入价格");
        }

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_menu` (`store`, `typeid`, `title`, `pics`, `price`, `note`, `pubdate`) VALUES ('$storeid', '$typeid', '$title', '$pics', '$price', '$note', '" . GetMkTime(time()) . "')");
        $aid      = $dsql->dsqlOper($archives, "lastid");

        if (is_numeric($aid)) {
            return $aid;
        } else {
            return array ("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 修改菜单
     *
     * @return array
     */
    public function editMenu()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $id      = $param['id'];
        $title   = filterSensitiveWords(addslashes($param['title']));
        $typeid  = (int)($param['typeid']);
        $price   = (float)($param['price']);
        $pics    = $param['pics'];
        $note    = filterSensitiveWords(addslashes($param['note']));
        $vdimgck = $param['vdimgck'];

        $vdimgck = strtolower($vdimgck);
        if ($vdimgck != $_SESSION['huoniao_vdimg_value']) {
            return array ("state" => 200, "info" => '验证码输入错误');
        }

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array ("state" => 200, "info" => '您还未开通外卖店铺！');
        }

        if ($userResult[0]['state'] == 0) {
            return array ("state" => 200, "info" => '您的店铺信息还在审核中，请通过审核后再发布！');
        }

        if ($userResult[0]['state'] == 2) {
            return array ("state" => 200, "info" => '您的店铺信息审核失败，请通过审核后再发布！');
        }

        $storeid = $userResult[0]['id'];

        if (empty($title)) {
            return array ("state" => 200, "info" => '请输入菜单名称');
        }

        if (empty($typeid)) {
            return array ("state" => 200, "info" => '请选择菜单分类');
        }

        if (empty($price)) {
            return array ("state" => 200, "info" => "请输入价格");
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__waimai_menu` SET `title` = '$title', `typeid` = '$typeid', `pics` = '$pics', `price` = '$price', `note` = '$note' WHERE `store` = $storeid AND `id` = " . $id);
        $ret      = $dsql->dsqlOper($archives, "update");

        if ($ret == "ok") {
            return "修改成功！";
        } else {
            return array ("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 删除菜单
     *
     * @return array
     */
    public function delMenu()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            return array ("state" => 101, "info" => '店铺信息不存在，删除失败！');
        } else {
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_menu` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['store'] == $sid) {

                //删除图集
                $pics = explode(",", $results['pics']);
                foreach ($pics as $k__ => $v__) {
                    delPicFile($v__, "delAtlas", "waimai");
                }

                $archives = $dsql->SetQuery("DELETE FROM `#@__waimai_menu` WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
                return '删除成功！';

            } else {
                return array ("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array ("state" => 101, "info" => '菜单不存在，或已经删除！');
        }

    }


    /**
     * 新增相册
     *
     * @return array
     */
    public function addAlbums()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $typeid  = (int)($param['typeid']);
        $imglist = $param['imglist'];
        $vdimgck = $param['vdimgck'];
        $pubdate = GetMkTime(time());

        $vdimgck = strtolower($vdimgck);
        if ($vdimgck != $_SESSION['huoniao_vdimg_value']) {
            return array ("state" => 200, "info" => '验证码输入错误');
        }

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array ("state" => 200, "info" => '您还未开通外卖店铺！');
        }

        if ($userResult[0]['state'] == 0) {
            return array ("state" => 200, "info" => '您的店铺信息还在审核中，请通过审核后再发布！');
        }

        if ($userResult[0]['state'] == 2) {
            return array ("state" => 200, "info" => '您的店铺信息审核失败，请通过审核后再发布！');
        }

        $storeid = $userResult[0]['id'];

        if (empty($imglist)) {
            return array ("state" => 200, "info" => '请上传图片！');
        }

        $imglist = explode("###", $imglist);
        foreach ($imglist as $key => $pic) {
            $val      = explode("||", $pic);
            $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_album` (`store`, `typeid`, `title`, `path`, `pubdate`) VALUES ('$storeid', '$typeid', '" . $val[1] . "', '" . $val[0] . "', '$pubdate')");
            $dsql->dsqlOper($archives, "results");
        }

        return "添加成功";

    }


    /**
     * 删除相册
     *
     * @return array
     */
    public function delAlbums()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_store` WHERE `userid` = " . $uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            return array ("state" => 101, "info" => '店铺信息不存在，删除失败！');
        } else {
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_album` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['store'] == $sid) {

                //删除图集
                $pics = explode(",", $results['pics']);
                foreach ($pics as $k__ => $v__) {
                    delPicFile($v__, "delAtlas", "waimai");
                }

                $archives = $dsql->SetQuery("DELETE FROM `#@__waimai_album` WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
                return '删除成功！';

            } else {
                return array ("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array ("state" => 101, "info" => '菜单不存在，或已经删除！');
        }

    }


    /**
     * 商家送餐
     *
     * @return array
     */
    public function peisongOrder()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $id       = (int)($param['id']);
        $songNote = filterSensitiveWords(addslashes($param['songNote']));
        $pubdate  = GetMkTime(time());

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__waimai_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array ("state" => 200, "info" => '您还未开通外卖店铺！');
        }

        if ($userResult[0]['state'] == 0) {
            return array ("state" => 200, "info" => '您的店铺信息还在审核中，请通过审核后再发布！');
        }

        if ($userResult[0]['state'] == 2) {
            return array ("state" => 200, "info" => '您的店铺信息审核失败，请通过审核后再发布！');
        }

        $storeid = $userResult[0]['id'];


        //分表
        $sub         = new SubTable('waimai_order', '#@__waimai_order');
        $break_table = $sub->getSubTableById($id);

        $sql = $dsql->SetQuery("SELECT `id` FROM `" . $break_table . "` WHERE `store` = $storeid AND `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {

            $sql = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `state` = 2, `peisong_note` = '$songNote', `songdate` = '$pubdate' WHERE `id` = $id");
            $dsql->dsqlOper($sql, "update");
            return "添加成功";

        } else {
            return array ("state" => 200, "info" => '帐号权限验证错误，操作失败！');
        }


    }

    /**
     * 评论 oid 订单，sid 店铺, peisongid 配送员id
     *
     * @return array
     */
    public function common()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array ();
        $id       = $sid = $filter = $orderby = $page = $pageSize = $where = $px = "";

        if (!is_array($this->param)) {
            return array ("state" => 200, "info" => '格式错误！');
        } else {
            $oid        = $this->param['oid'];
            $sid        = $this->param['sid'];
            $commtype   = $this->param['commtype'];
            $starpstype = $this->param['starpstype'];
            $picgettype = $this->param['picgettype'];
            $orderby    = $this->param['orderby'];
            $datetime   = $this->param['datetime'];
            $page       = $this->param['page'];
            $pageSize   = $this->param['pageSize'];
        }
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        // if(empty($oid) && empty($sid)) return array("state" => 200, "info" => '格式错误！');
        $type = $commtype == 'waimai' || $commtype == '' ? 0 : 1;

        $where = " AND `type` = $type";

        if ($datetime) {
            $datetime = explode('/', $datetime);
            $nian     = $datetime[0];
            if (count($datetime) == 2) {
                $yue   = $datetime[1];
                $ktime = mktime(0, 0, 0, $yue, 1, $nian);
                $etime = mktime(23, 59, 59, ($yue + 1), 0, $nian);

            } else {
                $ktime = mktime(0, 0, 0, 1, 1, $nian);
                $etime = mktime(23, 59, 59, 13, 0, $nian);

            }

            $where .= " AND `pubdate`>= $ktime AND `pubdate` <= $etime";
        }

        // 搜索带图评论
        if ($picgettype != '') {
            $where .= " AND `pics` != ''";
        }

        if ($oid) {
            $type  = empty($type) ? 0 : 1;
            $where .= " AND `oid` = $oid AND `type` = $type";
        }
        if ($sid) {
            $where .= " AND `sid` = $sid";
        }

        $peisongid = GetCookie("courier");
        if ($peisongid && $sid == '') {
            //            $peisongid = $peisongid == 1 ? checkCourierAccount() : $peisongid;
            $where .= " AND `peisongid` = $peisongid";
        }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_common` WHERE 1 = 1" . $where);
        $where1   = '';
        if ($starpstype) {
            if ($starpstype == 1) {
                $where1 = " AND `starps` >=0 AND `starps` <=2 ";
            } else {
                if ($starpstype == 2) {
                    $where1 = " AND `starps` >=3 AND `starps` <=4 ";
                } else {
                    if ($starpstype == 3) {
                        $where1 = " AND `starps` = 5 ";
                    } else {
                        if ($picgettype != '') {
                            $where .= " AND `pics` != ''";
                        } else {
                            $where1 = " AND `contentps` != ''";
                        }
                    }
                }
            }
        }
        //总条数
        $totalCount  = $dsql->dsqlOper($archives, "totalCount");
        $totalCount1 = $dsql->dsqlOper($archives . " AND `starps` >=0 AND `starps` <=2", "totalCount");
        $totalCount2 = $dsql->dsqlOper($archives . " AND `starps` >=3 AND `starps` <=4", "totalCount");
        $totalCount3 = $dsql->dsqlOper($archives . " AND `starps` = 5", "totalCount");
        $totalCount4 = $dsql->dsqlOper($archives . " AND `contentps` != ''", "totalCount");
        $totalCount5 = $dsql->dsqlOper($archives . " AND `pics` != ''", "totalCount");

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"        => $page,
            "pageSize"    => $pageSize,
            "totalPage"   => $totalPage,
            "totalCount"  => $totalCount,
            "totalCount1" => $totalCount1,
            "totalCount2" => $totalCount2,
            "totalCount3" => $totalCount3,
            "totalCount4" => $totalCount4,
            "totalCount5" => $totalCount5,
        );

        $archives = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE 1 = 1" . $where . $where1);
        $atpage   = $pageSize * ($page - 1);
        $where    = " LIMIT $atpage, $pageSize";

        if (empty($orderby)) {
            $orderby = " ORDER BY `id` DESC";
        }


        $results = $dsql->dsqlOper($archives . $orderby . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $cid = $val['id'];

                $sql  = $dsql->SetQuery("SELECT `username`, `nickname`, `photo` FROM `#@__member` WHERE `id` = " . $val['uid']);
                $user = $dsql->dsqlOper($sql, "results");
                if ($user) {
                    $user  = $user[0];
                    $photo = empty($user['photo']) ? "" : getFilePath($user['photo']);
                    if ($val['isanony']) {
                        $user = "平台用户";
                    } else {
                        $user = empty($user['nickname']) ? $user['username'] : $user['nickname'];
                    }

                } else {
                    $user  = "平台用户";
                    $photo = "";
                }
                $val['user']  = $user;
                $val['photo'] = $photo;

                $val['pubdatef']   = date("Y-m-d H:i:s", $val['pubdate']);
                $val['replydatef'] = $val['replydate'] ? date("Y-m-d H:i:s", $val['replydate']) : "";

                $pics = $val['pics'];
                if ($pics != "") {
                    $pics     = explode(",", $pics);
                    $picsList = array ();
                    foreach ($pics as $k => $v) {
                        $v && $picsList[] = getFilePath($v);
                    }
                    $val['pics'] = $picsList;
                }

                $list[$key] = $val;
            }
        }
        return array ("pageInfo" => $pageinfo, "list" => $list);


    }

    /**
     * 获取用户指定订单的评论
     */
    public function getUserCommon()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        //        $userid = 29;
        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $oid      = $this->param['oid'];
        $sid      = $this->param['sid'];
        $archives = $dsql->SetQuery(" SELECT * FROM `#@__waimai_common` WHERE `oid` = {$oid} AND `uid` = {$userid} AND `sid` = {$sid} AND `type` = 0 ");
        // $archives = $dsql->SetQuery("SELECT * FROM `#@__public_comment_all` WHERE `aid` = '$sid' AND `userid` = '$userid' AND `oid` = '$oid' AND `type` = 'waimai-order' AND `pid` = 0");
        $res = $dsql->dsqlOper($archives, "results");
        if ($res) {
            $pics  = $res[0]['pics'];
            $pics_ = explode(",", $pics);
            $arr   = [];
            foreach ($pics_ as $item) {
                $file  = getFilePath($item);
                $arr[] = $file;
            }
            $res[0]['pics_true'] = $arr;
            return $res;
        } else {
            return array ('state' => 200, 'info' => '没有评论');
        }

    }

    /**
     * 发表订单评价
     *
     * @return array
     */
    public function sendCommon()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid   = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        $param = $this->param;

        $id         = (int)($param['aid']);            // 订单id
        $ordertype  = $param['ordertype'];        // 类型 外卖-跑腿
        $ordertype1 = $param['ordertype1'];        // 类型 外卖-跑腿
        $commonid   = (int)($param['commonid']);    // 评论id 用于修改
        $star       = (int)($param['star']);        // 星级
        $isanony    = (int)($param['isanony']);    // 匿名
        $content    = $param['content'];            // 内容
        $starps     = (int)($param['starps']);    // 星级-配送员
        $contentps  = $param['contentps'];        // 内容-配送员
        $pspag      = $param['qslabel'];        // 标签-配送员
        $pics       = $param['pics'];                // 图集

        $pubdate = GetMkTime(time());

        $ordertype = empty($ordertype) || $ordertype != "paotui" ? "waimai" : "paotui";

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($id)) {
            return array ("state" => 200, "info" => '参数错误！');
        }
        if ($ordertype == "waimai") {
            if (empty($star)) {
                return array ("state" => 200, "info" => '请给店铺打分！');
            }
        } else {
            $star = 0;
        }
        if (empty($starps) && $ordertype1 != 1) {
            return array ("state" => 200, "info" => '请给配送员打分！');
        }

        $type = $ordertype == "waimai" ? 0 : 1;
        if ($ordertype == "waimai") {
            //外卖分表

            $sub         = new SubTable('waimai_order', '#@__waimai_order');
            $break_table = $sub->getSubTableById($id);

            $sql = $dsql->SetQuery("SELECT `sid`, `iscomment`, `peisongid`, `paydate`, `okdate` FROM `" . $break_table . "` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $sid       = $ret[0]['sid'];
                $peisongid = $ret[0]['peisongid'];

                /*if($ret[0]['iscomment']){
                    return array("state" => 200, "info" => '您已经评论过！');
                }*/
            } else {
                return array ("state" => 200, "info" => '订单不存在！');
            }

        } else {
            $sql = $dsql->SetQuery("SELECT `iscomment`, `peisongid` FROM `#@__paotui_order` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $peisongid = $ret[0]['peisongid'];
            } else {
                return array ("state" => 200, "info" => '订单不存在！');
            }
        }


        // 修改
        $checkSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_common` WHERE `type` = $type AND `oid` = $id AND `uid` = $userid");
        $checkRet = $dsql->dsqlOper($checkSql, "results");
        if ($checkRet) {
            $commonid = $checkRet[0]['id'];
        }
        if ($commonid) {
            $archive = $dsql->SetQuery("UPDATE `#@__waimai_common` SET `star` = '$star', `peisongid` = '$peisongid', `content` = '$content', `isanony` = '$isanony', `starps` = '$starps', `contentps` = '$contentps',`pspag`='$pspag', `pics` = '$pics' WHERE `id` = $commonid AND `uid` = $userid");
        } else {
            global $customCommentCheck;
            $paydate = $ret[0]['paydate'];
            $okdate  = $ret[0]['okdate'];
            $time    = ceil(($okdate - $paydate) / 60);
            $archive = $dsql->SetQuery("INSERT INTO `#@__waimai_common` (`oid`, `type`, `uid`, `sid`, `peisongid`, `content`, `star`, `isanony`, `starps`, `contentps`,`pspag`, `pics`, `time`, `pubdate`) VALUES ('$id', '$type', '$userid', '$sid', '$peisongid', '$content', '$star', '$isanony', '$starps', '$contentps','$pspag', '$pics', '$time', '$pubdate')");
        }

        $result = $dsql->dsqlOper($archive, "update");
        if ($result == "ok") {
             //更新外卖店铺评分
             if ($ordertype == "waimai" && $sid){
                updateShopStar($sid);
            } 

            /*评论相关使用*/
            $cityName = $siteCityInfo['name'];
            $cityid   = $siteCityInfo['cityid'];
            $userinfo = $userLogin->getMemberInfo($userid);

            $sql = $dsql->SetQuery("SELECT `userid` FROM `#@__waimai_shop_manager` WHERE `shopid` = $sid");
            $ret = $dsql->dsqlOper($sql, "results");
            /*前台用户通知*/
            $ordertypename = '';
            if ($ordertype == 0) {
                $ordertypename = '外卖订单';
            } else {
                $ordertypename = '跑腿订单';
            }

            $param = array (
                "service"  => 'waimai',
                "template" => 'shop',
                "id"       => $sid
            );

            //自定义配置
            $config = array (
                "username"    => $userinfo['username'],
                "noticetitle" => "您的菜品有一条新评论!",
                "title"       => $ordertypename . "-用户：" . $userinfo['username'] . "发布了一条评论",
                "date"        => date("Y-m-d H:i:s", time()),
                "fields"      => array (
                    'keyword1' => '信息标题',
                    'keyword2' => '发布时间',
                    'keyword3' => '进展状态'
                )
            );

            updateMemberNotice($ret[0]['userid'], "会员-新评论通知", $param, $config);
            // $config = array(
            //     "title" => "评论通知",
            //     "content" => $ordertypename."-用户：".$userinfo['username'] . "发布了一条评论",
            //     "date" => date("Y-m-d H:i:s", time())
            // );
            // updateMemberNotice($ret[0]['userid'], "会员-消息提醒", $param, $config, "");


            /*后台管理员通知审核*/
            $param = array (
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array (
                    'contentrn' => $cityName . '分站——外卖模块——用户:' . $userinfo['username'] . ' 发布了一条评论',
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice('waimai', '', $param);
            if (empty($commonid)) {
                $database = $ordertype . "_order";
                if ($ordertype == "waimai") {
                    $database = 'waimai_order_all';
                }
                $sql = $dsql->SetQuery("UPDATE `#@__" . $database . "` SET `iscomment` = 1 WHERE `id` = $id");
                $dsql->dsqlOper($sql, "update");
            }
            return "提交成功";
        } else {
            return array ("state" => 200, "info" => '提交失败！');
        }

    }

    /**
     * 回复评价
     *
     * @return array
     */
    public function replyCommon()
    {
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $id      = (int)($param['id']);        // 评价id
        $content = ($param['content']);        // 内容

        $pubdate = GetMkTime(time());

        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if (empty($id)) {
            return array ("state" => 200, "info" => '参数错误！');
        }
        if (empty($content)) {
            return array ("state" => 200, "info" => '请填写内容！');
        }

        $sql = $dsql->SetQuery("SELECT `uid`, `sid`, `replaydate` FROM `#@__waimai_common` WHERE `id` = $id");
        // $sql = $dsql->SetQuery("SELECT `userid` uid, `aid` sid, `replaydate` FROM `#@__public_comment_all` WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            if ($ret[0]['replydate'] != 0) {
                return array ("state" => 200, "info" => '您已经回复过');
            }
        } else {
            return array ("state" => 200, "info" => '提交失败！');
        }

        $sql = $dsql->SetQuery("UPDATE `#@__waimai_common` SET `reply` = '$content', `replydate` = '$pubdate' WHERE `id` = $id");
        // $sql = $dsql->SetQuery("UPDATE `#@__public_comment_all` SET `reply` = '$content', `replydate` = '$pubdate' WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {
            return "提交成功";
        } else {
            return array ("state" => 200, "info" => '提交失败！');
        }

    }

    /**
     * 查看当前用户对该订单有无评论
     *
     * @return array|string
     */
    public function isComm()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();

        $order_id = $this->param['order_id'];
        $sid      = $this->param['sid'];
        if (!$order_id || !$sid || $uid == -1) {
            return array ("state" => 200, "info" => '登录超时，或者参数错误！');
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_order_all` WHERE `ordernum` = {$order_id}");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $id = $ret[0]['id'];

            $sql2 = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `oid` = {$id} AND `uid` = {$uid} AND `sid` = {$sid}");
            // $sql2 = $dsql->SetQuery("SELECT * FROM `#@__public_comment_all` WHERE `aid` = '$sid' AND `userid` = '$uid' AND `oid` = '$id' AND `type` = 'waimai-order' AND `pid` = 0");
            $ret2 = $dsql->dsqlOper($sql2, "results");

            if ($ret2) {
                return "1";
            } else {
                return "2";
            }
        } else {
            return "订单不存在";
        }

    }

    /**
     * 跑腿下单
     *
     * @return array
     */
    public function paotuiDeal()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }
        $type = (int)$this->param['type'];

        $userinfo   = $userLogin->getMemberInfo();
        $shop       = $this->param['shop'];
        $price      = (float)$this->param['price'];
        $note       = $this->param['note'];
        $foodinfo   = $this->param['foodinfo'];
        $totime     = $this->param['totime'] ? strtotime($this->param['totime']) : 0;
        $gettime    = (int)$this->param['gettime'];
        $tip        = (float)$this->param['tip'];
        $juli       = (float)$this->param['juli'];
        $orderfinal = (int)$this->param['orderfinal'];
        $ordernum   = $this->param['ordernum'];
        $peerpay    = (int)$this->param['peerpay'];
        $usePinput  = (int)$this->param['usePinput'];                 //是否使用积分  1 使用
        $cityid    = (int)$this->param['cityid'];

        $cityid = !$cityid ? $siteCityInfo['cityid'] : $cityid;

        if ($cityid == '') {
            $cityid = $userinfo['cityid'];
        }

        //送取件，从取货地址获取cityid
        if ($type == 2) {

            $buylng = $this->param['buylng'];
            $buylat = $this->param['buylat'];

            // 验证收货地址
            $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $uid AND `lng` = '$buylng' AND `lat` = '$buylat' LIMIT 1");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $ret = $ret[0];
                $cityid = $ret['cityid'];
            } else {
                return array ("state" => 200, "info" => '取货地址不存在，请重新选择！');
            }

        }

        //生成订单号
        $newOrdernum = create_ordernum();

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
        global $serviceMoney;
        global $custom_paotuiStartTime;
        global $custom_paotuiEndTime;

        $serviceMoney =paotuiServiceMoney($cityid);

        $pubdate = GetMkTime(time());

        $stime = $custom_paotuiStartTime;
        $etime = $custom_paotuiEndTime;

        $stime = $stime ? $stime : '08:00';
        $etime = $etime ? $etime : '20:00';

        if(!isInBusinessHours($stime, $etime)){
            return array ("state" => 200, "info" => "抱歉，跑腿营业时间为 " . $stime . "-" . $etime);
        }

        // // 判断是否在营业时间
        // $began     = date("Y-m-d") . " " . $stime;
        // $end       = date("Y-m-d") . " " . $etime;
        // $begantime = strtotime($began);
        // $endtime   = strtotime($end);

        // //第二天的情况，比如：晚上8点到凌晨3点
        // if ($endtime < $begantime) {
        //     $endtime += 86400;
        // }

        // if ($pubdate < $begantime || $pubdate > $endtime) {
        //     return array ("state" => 200, "info" => "抱歉，跑腿营业时间为 " . $stime . "-" . $etime);
        // }

//        $freight = $serviceMoney ? $serviceMoney : 5;    // 服务费，如果没有设置，默认是5元
        //        $totime  = 60;    // 送达时间
        $freight = paotuiServiceMoney($cityid);           //服务费
        $freight = (float)(is_numeric($freight) ? $freight : $serviceMoney);  //兜底操作，如果计算结果是0，强制使用外卖设置中的默认费用
        $freight = $freight <= 0 ? $serviceMoney : $freight;

        $priceinfo = array ();
        if ($freight != 0) {

            $freightarr['value'] = $freight;
            $freightarr['name']  = '基础跑腿费';

            array_push($priceinfo, $freightarr);
        }
        if ($tip != 0) {
            $tiparr['value'] = $tip;
            $tiparr['name']  = '小费';

            array_push($priceinfo, $tiparr);
        }
        $amount = $freight + $tip;

        $state = 0;

        //新订单需要计算附加费
        if (empty($ordernum)) {
            if (empty($gettime)) {
                return array ("state" => 200, "info" => $type == 2 ? '请选择取件时间' : '请选择送达时间！');
            }

            //特殊时段
            $nowTime             = date("H:i", $gettime);
            $addservice_priceall = 0;
            $addservice          = unserialize($customaddservice);
            if (is_array($addservice) && !empty($addservice)) {
                foreach ($addservice as $key => $value) {
                    if ($value[0] < $nowTime && $value[1] > $nowTime && $value[2] > 0) {
                        $addservice_priceall += $value[2];
                    }
                }
            }
            if ($addservice_priceall != 0) {
                $adpriceallarr['value'] = (float)sprintf('%.2f', $addservice_priceall);
                $adpriceallarr['name']  = '特殊时段附加费';

                array_push($priceinfo, $adpriceallarr);
            }
            $freight += $addservice_priceall;
            $amount  += $addservice_priceall;
        }

        if (empty($ordernum)) {
            if ($type == 1) {
                $buyfrom    = (int)$this->param['buyfrom'];
                $buyaddress = $this->param['buyaddress'];
                $buylng     = $this->param['buylng'];
                $buylat     = $this->param['buylat'];
                $address    = (int)$this->param['address'];

                //最大购买价值的商品
                $paotuiMaxAmount = (int)$custompaotuiMaxAmount;
                $paotuiMaxAmount = $paotuiMaxAmount ?: 500;

                if($price > $paotuiMaxAmount){
                    return array ("state" => 200, "info" => '最高只可代购价值'.$paotuiMaxAmount.echoCurrency(array("type" => "short")).'的商品');
                }

                if (empty($shop)) {
                    return array ("state" => 200, "info" => '请填写商品要求！');
                }
                if (empty($address)) {
                    return array ("state" => 200, "info" => '请填写收货地址！');
                }

                // 验证收货地址
                $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_address` WHERE `uid` = $uid AND `id` = $address");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $ret     = $ret[0];
                    $person  = $ret['person'];
                    $address = $ret['street'] . " - " . $ret['address'];
                    $lng     = $ret['lng'];
                    $lat     = $ret['lat'];
                    $tel     = $ret['tel'];
                    $cityid  = $ret['cityid'];
                } else {
                    return array ("state" => 200, "info" => '收货地址不存在！');
                }


                if ($buyfrom == 0) {
                    if (empty($buyaddress)) {
                        return array ("state" => 200, "info" => '请填写商品购买地址！');
                    }

                    //再重新计算一次，防止get过来的数据被手动修改过
                    $juli = getDistance($buylng, $buylat, $lng, $lat) / 1000;
                    
                    // 帮我买
                    $delivery_fee              = 0;
                    $paotui_delivery_fee_value = unserialize($custompaotui_delivery);
                    array_multisort($paotui_delivery_fee_value, SORT_ASC);
                    if (is_array($paotui_delivery_fee_value) && !empty($paotui_delivery_fee_value)) {
                        foreach ($paotui_delivery_fee_value as $key => $value) {
                            if ($value[0] <= $juli && $value[1] <= $juli) {
                                $delivery_fee += ($value[1] - $value[0]) * $value[2];
                            } else {
                                if ($value[0] <= $juli && $value[1] >= $juli) {
                                    $delivery_fee += ($juli - $value[0]) * $value[2];
                                }
                            }
                            if ($value[1] < $juli && $key == count($paotui_delivery_fee_value) - 1) {
                                $delivery_fee += ($juli - $value[1]) * $value[2];
                            }
                        }
                    }
                    if ($delivery_fee != 0) {

                        $deliveryarr['value'] = (float)sprintf('%.2f', $delivery_fee);
                        $deliveryarr['name']  = '距离附加费';

                        array_push($priceinfo, $deliveryarr);
                    }
                    $freight += $delivery_fee;
                    $amount  += $delivery_fee;
                } else {
                    $buylng     = $lng;
                    $buylat     = $lat;
                    $buyaddress = "就近购买";
                }
                $pricepoint = 0;
                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $userpoint = $userinfo['point'];
                global $cfg_pointRatio;
                global $cfg_pointName;
                if ($usePinput == 1) {
                    $point_price = getJifen('waimai', $amount);  //抵扣金钱
                    $pricepoint  = $point_price * $cfg_pointRatio;                  //使用的积分
                    if ($pricepoint > $userpoint) {
                        $pricepoint  = $userpoint;
                    }
                }

                //查询是否下过单，防止重复下单
                $sql       = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `uid` = $uid AND `shop` = '$shop' AND `state` = 0");
                $ret       = $dsql->dsqlOper($sql, "results");
                $priceinfo = serialize($priceinfo);
                if ($ret) {

                    $id = $ret[0]['id'];

                    $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET
                    `ordernum` = '$newOrdernum', `buyaddress` = '$buyaddress', `buylng` = '$buylng', `buylat` = '$buylat',
                    `totime` = '$totime',`juli` ='$juli',`price` = '$price',`priceinfo` = '$priceinfo',`shop` = '$foodinfo',`tip` = '$tip', `freight` = '$freight', `person` = '$person',
                    `tel` = '$tel', `address` = '$address', `paytype` = '', `lng` = '$lng', `lat` = '$lat', `amount` = '$amount',
                    `pubdate` = '$pubdate', `state` = '$state',`point` = '$pricepoint' WHERE `id` = $id");

                } else {

                    $sql = $dsql->SetQuery("INSERT INTO `#@__paotui_order` (`uid`,`cityid`,`ordernum`, `shop`, `buyaddress`, `buylng`, `buylat`, `totime`,`juli`,`price`,`priceinfo`,`tip`, `freight`, `state`, `peisongid`, `person`, `tel`, `address`, `paytype`, `lng`, `lat`, `amount`,`gettime`,`pubdate`,`point`) VALUES ('$uid','$cityid','$newOrdernum', '$shop', '$buyaddress', '$buylng', '$buylat', '$gettime','$juli','$price','$priceinfo','$tip', '$freight', '$state', '0', '$person', '$tel', '$address', '$paytype', '$lng', '$lat', '$amount','$gettime','$pubdate','$pricepoint')");

                }
                // $ret = $dsql->dsqlOper($sql, "update");
                 $lastid = $dsql->dsqlOper($sql, "lastid");



                // 帮我送
            } else {

                $shop        = $this->param['shop'];
                $weight      = $this->param['weight'];
                $price       = $this->param['price'];
                $faaddress   = $this->param['faaddress'];
                $fatel       = $this->param['fatel'];
                $faname      = $this->param['faname'];
                $shouaddress = $this->param['shouaddress'];
                $shoutel     = $this->param['shoutel'];
                $shouname    = $this->param['shouname'];
                $buylat      = $this->param['buylat'];
                $buylng      = $this->param['buylng'];
                $lat         = $this->param['lat'];
                $lng         = $this->param['lng'];
                $note        = $this->param['note'];

                $gettime = $this->param['gettime'];
                $gettime = $gettime == "立即取件" ? 0 : GetMkTime($gettime);

                //再重新计算一次，防止get过来的数据被手动修改过
                $juli = getDistance($buylng, $buylat, $lng, $lat) / 1000;

                // 距离附加费
                $delivery_fee              = 0;
                $paotui_delivery_fee_value = unserialize($custompaotui_delivery);
                array_multisort($paotui_delivery_fee_value, SORT_ASC);
                if (is_array($paotui_delivery_fee_value) && !empty($paotui_delivery_fee_value)) {
                    foreach ($paotui_delivery_fee_value as $key => $value) {
                        if ($value[0] <= $juli && $value[1] <= $juli) {
                            $delivery_fee += ($value[1] - $value[0]) * $value[2];
                        } else {
                            if ($value[0] <= $juli && $value[1] >= $juli) {
                                $delivery_fee += ($juli - $value[0]) * $value[2];
                            }
                        }
                        if ($value[1] < $juli && $key == count($paotui_delivery_fee_value) - 1) {
                            $delivery_fee += ($juli - $value[1]) * $value[2];
                        }
                    }
                }
                if ($delivery_fee != 0) {
                    $deliveryarr['value'] = $delivery_fee;
                    $deliveryarr['name']  = '距离附加费';
                    array_push($priceinfo, $deliveryarr);
                }
                $freight += $delivery_fee;
                $amount  += $delivery_fee;

                /*重量附加费*/
                $weight_fee     = 0;
                $weight_fee_arr = unserialize($customweight);
                if (is_array($weight_fee_arr) && !empty($weight_fee_arr)) {
                    if ($weight < $weight_fee_arr['minweight']) {
                        $weight_fee = 0;
                    } else {
                        if ($weight >= $weight_fee_arr['minweight'] && $weight <= $weight_fee_arr['maxweight']) {
                            $weight_fee = $weight_fee_arr['price'];
                        } else {
                            $weight_fee = $weight_fee_arr['price'] + ((float)$weight - (float)$weight_fee_arr['maxweight']) * (float)$weight_fee_arr['fjprice'];
                        }
                    }

                }
                if ($weight_fee != 0) {
                    $weightarr['value'] = $weight_fee;
                    $weightarr['name']  = '重量附加费';
                    array_push($priceinfo, $weightarr);
                }
                $priceinfo = serialize($priceinfo);
                $freight   += $weight_fee;
                $amount    += $weight_fee;
                // 查询用户信息
                // $sql  = $dsql->SetQuery("SELECT `username`, `nickname`, `phone` FROM `#@__member` WHERE `id` = $uid");
                // $ret  = $dsql->dsqlOper($sql, "results");
                // $user = $ret[0];
                // $person = $getperson = empty($user['nickname']) ? $user['username'] : $user['nickname'];
                // $tel    = $gettel = $user['phone'];
                //时候使用积分
                $pricepoint = 0;
                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $userpoint = $userinfo['point'];
                global $cfg_pointRatio;
                global $cfg_pointName;
                if ($usePinput == 1) {
                    $point_price = getJifen('waimai', $amount);  //抵扣金钱
                    $pricepoint  = $point_price * $cfg_pointRatio;                  //使用的积分
                    if ($pricepoint > $userpoint) {
                        $pricepoint  = $userpoint;
                    }
                }

                $sql = $dsql->SetQuery("INSERT INTO `#@__paotui_order` (`uid`,`cityid` ,`type`, `ordernum`, `shop`, `weight`, `price`,`priceinfo`,`freight`, `buyaddress`, `address`, `buylat`,
                        `buylng`, `lat`, `lng`, `gettime`, `totime`,`juli` ,`tip`, `person`, `getperson`, `tel`, `gettel`, `note`, `paytype`, `amount`, `state`, `pubdate`,`point`) VALUES ('$uid','$cityid', '2', '$newOrdernum', '$shop', '$weight', '$price','$priceinfo','$freight', '$faaddress', '$shouaddress', '$buylat', '$buylng', '$lat', '$lng', '$gettime', '$totime', '$juli','$tip','$faname', '$shouname', '$fatel', '$shoutel', '$note', '', '$amount', '$state', '$pubdate','$pricepoint')");
                 $lastid = $dsql->dsqlOper($sql, "lastid");

            }
        }
        if (is_numeric($lastid) || $orderfinal == 1) {

            $point_price = 0;
            if($lastid){
                $paotuiordersql = $dsql->SetQuery("SELECT `amount`,`point` FROM `#@__paotui_order` WHERE `id`  ='$lastid'");
                $paotuiorderres = $dsql->dsqlOper($paotuiordersql, "results");
                $pricepoint = $paotuiorderres[0]['point'];
                $point_price = $pricepoint / $cfg_pointRatio;
            }
            $amount -= $point_price;
            if ($amount == '0') {
                $date     = GetMkTime(time());
                $param    = array (
                    "type" => "paotui"
                );
                $archives = $dsql->SetQuery("SELECT `id`,`point`, `balance` FROM `#@__paotui_order` WHERE `ordernum` = '$newOrdernum'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res      = $results[0];
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额
                $id       = $res['id'];

                //扣除会员积分
                if (!empty($upoint) && $upoint > 0) {
                    $paytype = "integral";
                }

                if ($uid > 0) {
                    $sql = $dsql->SetQuery("SELECT `id`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$newOrdernum'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if (!$ret) {

                        $body     = serialize($param);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$newOrdernum', '$uid', '$body', 0, '$paytype', 1, $date)");
                        $dsql->dsqlOper($archives, "update");

                    } else {

                        $updatesql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$amount',`paytype` = '$paytype',`state` = 1 WHERE  `ordernum` = '$newOrdernum'");
                        $dsql->dsqlOper($updatesql, "update");
                    }
                }

                //执行支付成功的操作
                $this->param = array (
                    "paytype"  => $paytype,
                    "ordernum" => $newOrdernum
                );
                $this->paySuccess();

                //                $param = array(
                //                    "service" => "waimai",
                //                    "template" => "payreturn",
                //                    "ordernum" => $newOrdernum
                //                );
                //                $url   = getUrlPath($param);

                $param = array (
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "module"   => "paotui-" . $lastid
                );
                $url   = getUrlPath($param);
                return $url;


                //代付的跳到代付页面
                if ($peerpay) {

                    $param = array (
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "daipay_return",
                        "param"    => "module=waimai&ordernum=" . $newOrdernum
                    );
                    $url   = getUrlPath($param);

                }
                return $url;
            }

            $param = array (
                "type" => "paotui"
            );

            if (!empty($ordernum)) {
//                global $cfg_pointRatio;
//                $paotuiordersql = $dsql->SetQuery("SELECT `amount`,`point` FROM `#@__paotui_order` WHERE `ordernum`  ='$ordernum'");
//
//                $paotuiorderres = $dsql->dsqlOper($paotuiordersql, "results");
//                $pricepoint = $paotuiorderres[0]['amount'];
//                $point_price = $pricepoint / $cfg_pointRatio;

            	global $cfg_pointRatio;

                $paotuiordersql = $dsql->SetQuery("SELECT `amount`,`point` FROM `#@__paotui_order` WHERE `ordernum`  ='$ordernum'");
                $paotuiorderres = $dsql->dsqlOper($paotuiordersql, "results");
                $pricepoint = $paotuiorderres[0]['point'];
                $point_price = $pricepoint / $cfg_pointRatio;
                $amount = (float)$paotuiorderres[0]['amount'] - $point_price;
                $newOrdernum = $ordernum;
            }

            if($lastid){
                $paotuiordersql = $dsql->SetQuery("SELECT `amount`,`point` FROM `#@__paotui_order` WHERE `id`  ='$lastid'");
                $paotuiorderres = $dsql->dsqlOper($paotuiordersql, "results");
                $point_price = $pricepoint / $cfg_pointRatio;
                $amount = (float)$paotuiorderres[0]['amount'] - $point_price;
            }

            $order = createPayForm("waimai", $newOrdernum, $amount, '', "跑腿订单", $param, 1);

            $timeout = GetMkTime(time()) + 1800;

            $order['timeout'] = $timeout;

            if ($peerpay) {

                $param = array (
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "daipay",
                    "param"    => "module=waimai&ordernum=" . $newOrdernum
                );
                $url   = getUrlPath($param);

                return $url;
            }

            return $order;


        } else {
            return array ("state" => 200, "info" => "下单失败！");
        }


    }


    /**
     * 跑腿支付
     */
    public function paotuipay()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;
        global $cfg_pointRatio;

        $ordernum  = $this->param['ordernum'];
        $paytype   = $this->param['paytype'];
        $check     = (int)$this->param['check'];
        $usePinput = $this->param['usePinput'];
        //        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        $peerpay    = $this->param['peerpay'];  //是否代付
        $orderfinal = (int)$this->param['orderfinal'];  //是否代付

        $userid = $userLogin->getMemberID();
        if ($userid == -1 && !$peerpay) {
            if ($check) {
                return array ("state" => 200, "info" => "登陆超时");
            } else {
                die("登陆超时");
            }
        }

        //代付人
        if ($peerpay) {
            $p_userid = $userLogin->getMemberID();

            $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `peerpay` = $p_userid WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($sql, "update");
        } else {
            $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `peerpay` = 0 WHERE `ordernum` = '$ordernum'");
            $dsql->dsqlOper($sql, "update");
        }

        if ($ordernum) {

            if ($peerpay) {
                $sql = $dsql->SetQuery("SELECT * FROM `#@__paotui_order` WHERE `state` = 0 AND `ordernum` = '$ordernum'");
            } else {
                $sql = $dsql->SetQuery("SELECT * FROM `#@__paotui_order` WHERE `uid` = $userid AND `state` = 0 AND `ordernum` = '$ordernum'");
            }
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data       = $ret[0];
                $id         = $data['id'];
                $uid        = $data['uid'];
                $state      = $data['state'];
                $totalPrice = $data['amount'];
                $paytype    = $paytype ? $paytype : $data['paytype'];
                $point      = $data['point'] ? $data['point'] : 0;  //使用了多少积分
                $usePinput = $point > 0 ? 1 : 0;  //是否使用了积分

                $date = GetMkTime(time());

                //查询会员信息
                if ($userid > 0) {

                    $userinfo  = $userLogin->getMemberInfo();
                    $usermoney = $userinfo['money'];
                    $userpoint = $userinfo['point'];
                }

                $tit      = array ();
                $useTotal = 0;

                if (($usePinput && !empty($point)) || ($useBalance && !empty($balance))) {

                    $pointMoney   = $usePinput ? $point / $cfg_pointRatio : 0;    // swa190326
                    $balanceMoney = $balance;
                    $oprice       = $totalPrice;

                    $usePointMoney   = 0;
                    $useBalanceMoney = 0;


                    //先判断积分是否足够支付总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.积分总额减去用掉的
                    //3.记录已经使用的积分
                    if ($oprice < $pointMoney) {
                        $pointMoney    -= $oprice;
                        $usePointMoney = $oprice;
                        $oprice        = 0;
                        //积分不够支付再判断余额是否足够
                        //如果积分不足以支付总价：
                        //1.总价减去积分抵扣掉的部部分
                        //2.积分总额设置为0
                        //3.记录已经使用的积分
                    } else {
                        $oprice        -= $pointMoney;
                        $usePointMoney = $pointMoney;
                        $pointMoney    = 0;
                        //验证余额是否足够支付剩余部分的总价
                        //如果足够支付：
                        //1.把还需要支付的总价重置为0
                        //2.余额减去用掉的部分
                        //3.记录已经使用的余额
                        if ($oprice < $balanceMoney) {
                            $balanceMoney    -= $oprice;
                            $useBalanceMoney = $oprice;
                            $oprice          = 0;
                            //余额不够支付的情况
                            //1.总价减去余额付过的部分
                            //2.余额设置为0
                            //3.记录已经使用的余额
                        } else {
                            $oprice          -= $balanceMoney;
                            $useBalanceMoney = $balanceMoney;
                            $balanceMoney    = 0;
                        }
                    }

                    $pointMoney_ = $usePointMoney * $cfg_pointRatio;
                    $archives    = $dsql->SetQuery("UPDATE `#@__paotui_order` SET  `balance` = '$useBalanceMoney', `payprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");

                    //如果没有使用积分或余额，重置积分&余额等价格信息
                } else {
                    $archives = $dsql->SetQuery("UPDATE `#@__paotui_order` SET  `balance` = '0', `payprice` = '$totalPrice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                }

                global $cfg_pointName;
                //判断是否使用积分，并且验证剩余积分
                if ($point > 0) {
                    $tit[] = $cfg_pointName;
                    $useTotal += $point / $cfg_pointRatio;
                }
                //判断是否使用余额，并且验证余额和支付密码
                if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

                    if (!empty($balance) && empty($paypwd)) {
                        if ($check) {
                            return array ("state" => 200, "info" => "请输入支付密码！");
                        } else {
                            die("请输入支付密码！");
                        }
                    }

                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res      = $results[0];
                    $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
                    if ($res['paypwd'] != $hash) {
                        if ($check) {
                            return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
                        } else {
                            die("支付密码输入错误，请重试！");
                        }
                    }

                    //验证余额
                    if ($usermoney < $balance) {
                        if ($check) {
                            return array ("state" => 200, "info" => "您的余额不足，支付失败！");
                        } else {
                            die("您的余额不足，支付失败！");
                        }
                    }

                    $useTotal += $balance;
                    $tit[]    = "money";

                }

                if ($useTotal > $totalPrice) {
                    if ($check) {
                        return array (
                            "state" => 200,
                            "info"  => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit)
                        );
                    } else {
                        die("您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
                    }
                }
                $amount = $totalPrice - $useTotal;
                if ($amount > 0 && empty($paytype) && $orderfinal == 0) {
                    if ($check) {
                        return array ("state" => 200, "info" => "请选择支付方式！");
                    } else {
                        die("请选择支付方式！");
                    }
                }

                if ($check) {
                    return "ok";
                }

                $param = array (
                    "type" => "paotui"
                );
                // 需要支付的金额大于0，跳转至第三方支付页面
                if ($amount > 0) {

                    if ($orderfinal == 1 && $peerpay == 1) {


                        $order = createPayForm("waimai", $ordernum, $amount, '', "跑腿订单", $param, 1);

                        $timeout = GetMkTime(time()) + 1800;

                        $order['timeout'] = $timeout;

                        return $order;
                    } else {

                        return createPayForm("waimai", $ordernum, $amount, $paytype, "跑腿订单", $param);
                    }
                    // 余额支付
                } else {

                    $paytype = join(",", $tit);

                    if ($userid > 0) {
                        $sql = $dsql->SetQuery("SELECT `id`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                        $ret = $dsql->dsqlOper($sql, "results");

                        if (!$ret) {

                            $body     = serialize($param);
                            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
                            $dsql->dsqlOper($archives, "update");

                        } else {

                            $updatesql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$amount',`paytype` = '$paytype',`state` = 1 WHERE  `ordernum` = '$ordernum'");
                            $dsql->dsqlOper($updatesql, "update");
                        }
                    }

                    //执行支付成功的操作
                    $this->param = array (
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();

                    // $param = array(
                    //     "service" => "waimai",
                    //     "template" => "payreturn",
                    //     "ordernum" => $ordernum
                    // );
                    //跳订单详情
                    $param = array (
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail-paotui",
                        "id"       => $id
                    );
                    $url   = getUrlPath($param);


                    //代付的跳到代付页面
                    if ($peerpay) {

                        $param = array (
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "daipay_return",
                            "param"    => "module=waimai&ordernum=" . $ordernum
                        );
                        $url   = getUrlPath($param);

                    }

                    return $url;
                }

                //                $param = array(
                //                    "type" => "paotui"
                //                );
                //                //跳转至第三方支付页面
                //                createPayForm("waimai", $ordernum, $amount, $paytype, "跑腿订单", $param);

            } else {
                $param = array (
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "order",
                    "module"   => "paotui"
                );
                $url   = getUrlPath($param);
                return $url;
            }

        } else {
            die("订单不存在！");
        }
    }

    /**
     * 跑腿订单
     *
     * @return array
     */
    public function paotuiOrder()
    {
        global $dsql;
        $pageinfo = $list = array ();
        $store    = $userid = $start = $end = $state = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $userid   = $this->param['userid'];
                $u        = $this->param['u'];
                $start    = $this->param['start'];
                $end      = $this->param['end'];
                $state    = $this->param['state'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $refund   = (int)$this->param['refund'];
            }
        }

        if (empty($userid) && empty($u)) {
            return array ("state" => 200, "info" => '请选择会员ID');
        }

        $where = " WHERE `state` != -1 AND `del` = 0";

        global $userLogin;
        $uid = $userLogin->getMemberID();

        if ($uid == -1 && empty($u)) {
            return array ("state" => 200, "info" => '登录超时，获取失败！');
        }

        if (!empty($userid)) {
            $where = $where . " AND `uid` = $uid";
        }

        if ($start != "") {
            $where .= " AND `pubdate` >= " . GetMkTime($start);
        }

        if ($end != "") {
            $where .= " AND `pubdate` <= " . GetMkTime($end);
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT * FROM `#@__paotui_order` o" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //未付款
        $state0 = $dsql->dsqlOper($archives . " AND `state` = 0", "totalCount");
        //进行中
        $state1 = $dsql->dsqlOper($archives . " AND FIND_IN_SET(`state`,'2,3,4,5')", "totalCount");
        //待收货
        //        $state2 = $dsql->dsqlOper($archives . " AND `state` = 2", "totalCount");order-paotui.html
        //交易完成
        $state3 = $dsql->dsqlOper($archives . " AND `state` = 1 AND `iscomment` = 1", "totalCount");
        //未付款，订单过期
        $state4 = $dsql->dsqlOper($archives . " AND `state` = 6", "totalCount");
        //已评论
        $state5 = $dsql->dsqlOper($archives . " AND `iscomment` = 0 AND  `state` = 1", "totalCount");
        //有退款
        $totalRefund = $dsql->dsqlOper($archives . " AND `refrundstate` = 1", "totalCount");

        if ($state != "" && $state != 8 && $state != 9) {
            // $totalCount = $dsql->dsqlOper($archives . " AND `state` = " . $state, "totalCount");

            if ($state == 1) {
                // $totalCount = $dsql->dsqlOper($archives . " AND `state` = 1 AND `iscomment` = 1", "totalCount");

                $archives .= " AND `state` = 1 AND `iscomment` = 1";
            } else {
                $state = (int)$state;
                $archives .= " AND `state` = $state";
            }

        }
        if ($state == 8) {
            // $totalCount = $dsql->dsqlOper($archives . " AND `iscomment` = 0 AND  `state` = 1", "totalCount");
            $archives   .= " AND `iscomment` = 0 AND  `state` = 1";
        }
        if ($state == 9) {
            // $totalCount = $dsql->dsqlOper($archives . " AND FIND_IN_SET(`state`,'2,3,4,5')", "totalCount");
            $archives   .= " AND FIND_IN_SET(`state`,'2,3,4,5')";
        }

        if($refund){
            $archives .= " AND `refrundstate` = 1";
        }

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);
        // if($state == 0){
        //     $totalPage = ceil($state0 / $pageSize);
        // }elseif($state == 1){
        //     $totalPage = ceil($state3 / $pageSize);
        // }elseif($state == 9){
        //     $totalPage = ceil($state1 / $pageSize);
        // }elseif($state == 8){
        //     $totalPage = ceil($state5 / $pageSize);
        // }elseif($state == 6){
        //     $totalPage = ceil($state4 / $pageSize);
        // }

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }
        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "state0"     => $state0,
            "state1"     => $state1,
            "state3"     => $state3,
            "state4"     => $state4,
            "state5"     => $state5,
            "totalRefund" => $totalRefund,
        );

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . " ORDER BY `id` DESC" . $where, "results");
        $list    = array ();
        include(HUONIAOROOT . "/include/config/waimai.inc.php");
        if ($results) {
            foreach ($results as $key => $value) {

                $list[$key]['id']         = $value['id'];
                $list[$key]['ordernum']   = $value['ordernum'];
                $list[$key]['uid']        = $value['uid'];
                $list[$key]['shop']       = $value['shop'];
                $list[$key]['type']       = $value['type'];
                $list[$key]['amount']     = $value['amount'];
                $list[$key]['paytype']    = $value['paytype'];
                $list[$key]['pubdate']    = $value['pubdate'];
                $list[$key]['paydate']    = $value['paydate'];
                $list[$key]['note']       = $value['note'];
                $list[$key]['address']    = $value['address'];
                $list[$key]['buylng']     = $value['buylng'];
                $list[$key]['buylat']     = $value['buylat'];
                $list[$key]['lng']        = $value['lng'];
                $list[$key]['lat']        = $value['lat'];
                $list[$key]['buyaddress'] = $value['buyaddress'];
                $list[$key]['state']      = $value['state'];
                $list[$key]['tel']        = $value['tel'];
                $list[$key]['gettel']     = $value['gettel'];
                $list[$key]['iscomment']  = $value['iscomment'];
                $list[$key]['gettime']    = date('H:i:s', $value['gettime']);
                $list[$key]['totime']     = date('H:i:s', $value['totime']);
                $list[$key]['cstime']     = $cstime;
                $list[$key]['csprice']    = $csprice;

                $pslng = $pslat = $psname = $psphone ='';
                $couriersql = $dsql->SetQuery("SELECT `lng`,`lat`, `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = '" . $value['peisongid'] . "'");
                $courierres = $dsql->dsqlOper($couriersql, 'results');
                if (!empty($courierres) && is_array($courierres)) {
                    $pslng = $courierres[0]['lat'];
                    $pslat = $courierres[0]['lng'];
                    $psname = $courierres[0]['name'];
                    $psphone = $courierres[0]['phone'];
                }
                $list[$key]['pslng'] = $pslng;
                $list[$key]['pslat'] = $pslat;
                $list[$key]['psname'] = $psname;
                $list[$key]['psphone'] = $psphone;

                $buyform             = 0;
                if ($value['buyaddress'] == '就近购买') {
                    $buyform = 1;
                }
                $list[$key]['buyform'] = $buyform;
                $list[$key]['time']    = $value['state'] == 1 ? ceil(($value['okdate'] - $value['paydate']) / 60) : '';
                //                //用户名
                //                $userSql                = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $value["uid"]);
                //                $username               = $dsql->dsqlOper($userSql, "results");
                $list[$key]["username"]  = $value['person'];
                $list[$key]["getperson"] = $value['getperson'];

                if ($value['state'] == 0) {
                    $param                = array (
                        "service"  => "waimai",
                        "template" => "pay",
                        "param"    => "ordertype=paotui&ordernum=" . $value['ordernum']
                    );
                    $list[$key]['payurl'] = getUrlPath($param);
                }

            }
        } else {
            return array ("state" => 200, "info" => '暂无相关数据！');
        }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 买家取消跑腿订单
     */
    public function cancelPaotuiOrder()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (empty($id)) {
            return array ("state" => 200, "info" => '数据不完整，请检查！');
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`paytype`, o.`paydate`, o.`amount`, o.`ordernum`, o.`state`,o.`balance`,o.`point`,o.`payprice`,o.`peerpay` FROM `#@__paotui_order` o WHERE o.`id` = '$id' AND o.`uid` = '$uid'");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $state    = $results[0]['state'];
            $amount   = $results[0]['amount'];
            $paytype  = $results[0]['paytype'];
            $paydate  = $results[0]['paydate'];
            $ordernum = $results[0]['ordernum'];
            $balance  = $results[0]['balance'];
            $point    = $results[0]['point'];
            $payprice = $results[0]['payprice'];
            $peerpay  = $results[0]['peerpay'];

            include(HUONIAOROOT . "/include/config/waimai.inc.php");
            $date = GetMkTime(time());
            //            $time = 300 - ($date - $paydate);
            $time = ($date - $paydate) / 60;
            $csremoney = 0;
            if ($time > $cstime) {
                $csremoney = sprintf('%.2f', $amount * $csprice / 100);
                $amount    -= $csremoney;
                $balance -= $csremoney;
                $payprice -= $csremoney;
            }
            //            if ($time > 0) {
            //                $min = ceil($time / 60);
            //                // return array("state" => 200, "info" => "操作失败，成功下单五分钟后商家未接单才可以取消订单，剩余时间：".$min."分钟");
            //            }

            // 未付款的直接删除
            if ($state == 0) {
                $sql = $dsql->SetQuery("DELETE FROM `#@__paotui_order` WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
                if ($ret == "ok") {
                    return "操作成功";


                } else {
                    return array ("state" => 200, "info" => "操作失败，请重试！");
                }
            }
            
            //不能取消
            if($state == 1){
                return array ("state" => 200, "info" => "该订单已完成，取消失败！");
            }
            if($state == 4){
                return array ("state" => 200, "info" => "该订单已被骑手接单，取消失败！");
            }
            if($state == 5){
                return array ("state" => 200, "info" => "该订单骑手正在配送中，取消失败！");
            }
            if($state == 6){
                return array ("state" => 200, "info" => "该订单已经取消！");
            }
            if($state == 7){
                return array ("state" => 200, "info" => "失败订单无须取消！");
            }

            // 货到付款
            if ($paytype == "delivery") {
                return "操作成功！";
            }
            $refrunddate = GetMkTime(time());
            $refrundno = '';
            $_orderamount = $payprice + $csremoney;
            $arr = refund('paotui',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id,$_orderamount);
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
            $refrundno   = $arr[0]['refrundno'];
            $refrundcode = $arr[0]['refrundcode'];
            $pay_name  = '';
            $paramUser = array (
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "paotui",
                "id"       => $id
            );
            $urlParam  = serialize($paramUser);

            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $paytype . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!empty($ret)) {
                $pay_name = $ret[0]['pay_name'];
            } else {
                $pay_name = $ret[0]["paytype"];
            }

            $pay_namearr = array ();
            if ($pay_name) {
                array_push($pay_namearr, $pay_name);
            }

            if ($balance != '') {
                array_push($pay_namearr, "余额");
            }

            if ($point != '') {
                array_push($pay_namearr, "积分");
            }

            if ($pay_namearr) {
                $pay_name = join(',', $pay_namearr);
            }

            $tuikuan      = array (
                'paytype'      => $pay_name,
                'truemoneysy'  => $payprice,
                'money_amount' => $balance,
                'point'        => $point,
                'refrunddate'  => $refrunddate,
                'refrundno'    => $refrundno
            );
            $tuikuanparam = serialize($tuikuan);
            if ($r) {

                if (!empty($point)) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user      = $userLogin->getMemberInfo($uid);
                    $userpoint = $user['point'];
                    //保存操作日志
                    $info     = '跑腿退款:(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $ordernum;  //商城订单退回
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '$info', '$date','tuihui','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }

                //退回余额
                if ($balance > 0) {
                    global $userLogin;
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$balance' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user      = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
                    //保存操作日志
                    $info     = '跑腿退款:(积分退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $ordernum;  //商城订单退回
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$balance', '$info', '$date','waimai','tuikuan','$urlParam','$ordernum','$tuikuanparam','外卖消费','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

                }


                // 已付款
                $failed = '用户取消订单';
                if($csremoney > 0){
                    $failed .= '，扣除手续费：' . $csremoney . echoCurrency(array("type" => "short"));
                }
                $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `state` = 7, `refrundstate` = 1,`csremoney` =  '$csremoney',`failed` = '$failed', `refrundadmin` = $uid ,`refrunddate` = '" . $refrunddate . "', `refrundno` = '" . $refrundno . "' WHERE `id` = $id");
                $ret = $dsql->dsqlOper($sql, "update");
                if ($ret != "ok") {
                    return array ("state" => 200, "info" => "操作失败，请重试！");
                }

                //如果扣了手续费，将费用加入到平台收入
                if($csremoney > 0){
                    $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$csremoney', '外卖跑腿取消订单手续费：$ordernum', '$refrunddate','0','0','waimai','$csremoney','1','yongjin')");
                    $dsql->dsqlOper($sql, "update");
                }

                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                $ret      = $dsql->dsqlOper($sql, "results");
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];

                $param = array (
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "record"
                );

                //自定义配置
                $config = array (
                    "username" => $username,
                    "order"    => $ordernum,
                    "amount"   => $amount,
                    "fields"   => array (
                        'keyword1' => '退款状态',
                        'keyword2' => '退款金额',
                        'keyword3' => '审核说明'
                    )
                );

                updateMemberNotice($uid, "会员-订单退款成功", $param, $config, '', '', 0, 1);

                return "操作成功！";
            } else {
                return array ("state" => 200, "info" => '操作失败！');
            }

        } else {
            return array ("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }

    }


    /**
     * 跑腿订单信息详细
     *
     * @return array
     */
    public function orderPaotuiDetail()
    {
        global $dsql;
        global $cfg_pointRatio;
        $id = is_numeric($this->param) ? $this->param : $this->param['id'];
        if (!is_numeric($id)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        global $userLogin;
        $userid = $userLogin->getMemberID();

        $did = GetCookie("courier");
        if ($userid == -1 && $did == -1) {
            return array ("state" => 200, "info" => '请先登录！');
        }

        if ($userid > -1) {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__paotui_order` WHERE `id` = $id AND `uid` = $userid");
        } else {
            if ($did > -1) {
                $qishousql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE  `id` =" . $did." AND `quit` = 0");
                $qishoures = $dsql->dsqlOper($qishousql, "results");

                if (!$qishoures) return array ("state" => 200, "info" => '骑手已离职！');
                $sql = $dsql->SetQuery("SELECT * FROM `#@__paotui_order` WHERE `id` = $id");
            }
        }
        $ret    = $dsql->dsqlOper($sql, "results");
        $return = array ();
        if ($ret) {
            $now = GetMkTime(time());

            $order                  = $ret[0];
            $return["id"]           = $id;
            $return["uid"]          = $order['uid'];
            $return["shop"]         = $order['shop'];
            $return["type"]         = $order['type'];
            $return["price"]        = $order['price'];
            $return["point"]        = $order["point"];
            $return["pointprice"]   = $return["point"] / $cfg_pointRatio;
            $return["ordernum"]     = $order['ordernum'];
            $return["state"]        = $order['state'];
            $return["person"]       = $order['person'];
            $return["tel"]          = $order['tel'];
            $return["address"]      = $order['address'];
            $return["lng"]          = $order['lng'];
            $return["lat"]          = $order['lat'];
            $return["paytype"]      = getPaymentName($order['paytype']);
            $return["amount"]       = $order['freight'] + $order['tip'];

//            $return["peisongprice"] = $order['freight'];
            $return["tip"]          = $order['tip'];
            $return["note"]         = $order['note'];
            $return["pubdate"]      = $order['pubdate'];
            $return["paydate"]      = $order['paydate'];
            $return["paylimittime"] = (1800 - ($now - $order['pubdate'])) > 0 ? (1800 - ($now - $order['pubdate'])) : 0;
            $return["confirmdate"]  = $order['confirmdate'];
            $return["peidate"]      = $order['peidate'];
            $return["peisongid"]    = $order['peisongid'];
            $buyform                = 0;
            if ($order['buyaddress'] == '就近购买') {
                $buyform = 1;
            }
            $return["buyform"] = $buyform;


            $_paytype    = '';
            $_paytypearr = array ();
            $paytypearr  = $order['paytype'] != '' ? explode(',', $order['paytype']) : array ();

            if ($paytypearr) {
                foreach ($paytypearr as $a => $b) {
                    if ($b != '') {
                        array_push($_paytypearr,
                            getDetailPaymentName($b, $order['balance'], $return['pointprice'], $order['payprice']));
                    }
                }
                if ($order['balance'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('money', $order['balance'], 0, 0));
                }
                if ($order['point'] > 0) {
                    array_push($_paytypearr, getDetailPaymentName('integral', 0, $return["pointprice"], 0));
                }
                if ($_paytypearr) {
                    $_paytype = join(',', array_unique($_paytypearr));
                }
            }

            if ($order['peerpay'] > 0) {
                if ($order["paytype"] == "integral") {
                    $payname = "积分";
                } else {
                    if ($order["paytype"] == "money") {
                        $payname = "余额";
                    } else {
                        if ($order["paytype"] == "wxpay") {
                            $payname = "微信";
                        } else {
                            if ($order["paytype"] == "alipay") {
                                $payname = "支付宝";
                            }
                        }
                    }
                }
                $userinfo = $userLogin->getMemberInfo($order['peerpay']);
                if (is_array($userinfo)) {
                    $_paytype = '[' . $userinfo['nickname'] . ']' . $payname . '代付';
                } else {
                    $_paytype = '[好友]' . $payname . '代付';
                }

            }

            $return["paytype"]       = $_paytype;
            $return["coordY"]        = $order['buylng'];
            $return["coordX"]        = $order['buylat'];
            $return["buyaddress"]    = $order['buyaddress'];
            $return["getperson"]     = $order['getperson'];
            $return["gettel"]        = $order['gettel'];
            $return["gettime"]       = $order['gettime'];

            //判断日期是否为今天
            // $dateData1 = GetMkTime(date('Y-m-d', $order['gettime']));
            $dateData1 = GetMkTime(date('Y-m-d', time()));
            $dateData2 = GetMkTime(date('Y-m-d', $order['totime']));

            $return["totime"]        = !$order['totime'] ? '尽快' : ($dateData1 == $dateData2 ? date("H:i", $order['totime']) : ("<font color='#ff0000'>" . date("Y-m-d H:i", $order['totime']) . '</font>'));
            $return["weight"]        = $order['weight'];
            $return["receivingcode"] = $order['receivingcode'];
            $return["juli"]          = $order['juli'];
            $priceinfo               = array ();
            if ($order['priceinfo']) {
                $priceinfo = unserialize($order['priceinfo']);
            }
            $return["priceinfo"] = $priceinfo;
            if ($order['peisongid']) {
                $sql = $dsql->SetQuery("SELECT `name`, `phone`,`lng`,`lat` FROM `#@__waimai_courier` WHERE `id` = " . $order['peisongid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $return['peisongname']  = $ret[0]['name'];
                    $return['pslng']        = $ret[0]['lat'];
                    $return['pslat']        = $ret[0]['lng'];
                    $return['peisongphone'] = $ret[0]['phone'];
                }
            }

            $return["songdate"] = $order['songdate'];
            $return["okdate"]   = $order['okdate'];
            $return["failed"]   = $order['failed'];

            $peisongpath           = $order['peisongpath'];
            $return["peisongpath"] = $peisongpath;


            if ($peisongpath) {
                $peisongpathArr = explode(";", $peisongpath);
                $peisongpathNew = $peisongpathArr[count($peisongpathArr) - 1];
                if ($peisongpathNew) {
                    $path                      = explode(",", $peisongpathNew);
                    $return['peisongpath_lng'] = $path[0];
                    $return['peisongpath_lat'] = $path[1];
                }
            }

            $orderFinished = 0;
            if ($order['state'] == 1) {
                $orderFinished = 1;
            }
            $return['orderFinished'] = $orderFinished;
            // 评价
            $return['iscomment'] = $order['iscomment'];
            if ($order['iscomment'] == 1) {
                $sql = $dsql->SetQuery("SELECT * FROM `#@__waimai_common` WHERE `uid` = $userid AND `oid` = $id");
                // $sql = $dsql->SetQuery("SELECT * FROM `#@__public_comment_all` WHERE `userid` = '$userid' AND `oid` = '$id' AND `type` = 'paotui-order' AND `pid` = 0");
                $ret               = $dsql->dsqlOper($sql, "results");
                $return['comment'] = $ret[0];
            }
            if ($did) {
                $inc = HUONIAOINC . "/config/waimai.inc.php";
                include $inc;

                $courier_get = $CourierP = 0;
                $juliPerson  = getDistance($order['buylat'],  $order['buylng'],$order['lat'], $order['lng']);

                $juliPerson = $juliPerson != 0 ? $juliPerson / 1000 : $juliPerson;

//                $CourierP = $getproportion != '0.00' ? $getproportion : (float)$customwaimaiCourierP;
                $CourierP = $order['courierfencheng'];

                /*骑手额外所得*/
                $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
                /*外卖额外加成要求*/
                $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

                sort($waimaadditionkm);
                $satisfy = $needfenzhong = $additionprice = 0;
                for ($i = 0; $i < count($waimaadditionkm); $i++) {
                    if ($juliPerson > $waimaadditionkm[$i][0] && $juliPerson <= $waimaadditionkm[$i][2]) {
                        $satisfy      = 1;
                        $needfenzhong = $waimaadditionkm[$i][1];
                        break;
                    }
                }
                
                $allamount = $order['amount'];
                if ($satisfy == 1) {
                    for ($a = 0; $a < count($waimaiorderprice); $a++) {
                        if ($allamount >= $waimaiorderprice[$a][0] && $allamount <= $waimaiorderprice[$a][1]) {
                            $additionprice = $waimaiorderprice[$a][2];
                        }
                    }
                }

//                $priceinfo = $order['priceinfo'] != '' ? unserialize($order['priceinfo']) : array ();
//                if (is_array($priceinfo) && $priceinfo) {
                    $peisongamount = $allamount - $order['tip'];
//                    foreach ($priceinfo as $a => $b) {
//                        if ($b['type'] == 'peisong') {
//                            $peisongamount += $b['amount'];
//                        }elseif($b['type'] == 'auth_peisong'){
//                            $auth_amount +=  $b['amount'];
//                        }
//                    }
                    $courier_get = $peisongamount * $CourierP / 100;
//                }

                $return['needfenzhong']  = $needfenzhong;
                $return['courier_get']   = sprintf('%.2f',$courier_get + $order['tip']);

                $gebili  = $order['courier_gebili']!='' ? unserialize($order['courier_gebili']) : array () ;

                $peisongTotal = $courierfencheng = 0;
                if ($gebili) {
                    $additionprice   = $gebili['additionprice'];
                    $peisongTotal    = $gebili['peisongTotal'];
                    $courierfencheng = $gebili['courierfencheng'];
                } else {
                    $courierfencheng = $order['courierfencheng'];
                }
                $return["additionprice"]              = sprintf('%.2f',$additionprice);
                $return["baseprice"]                  = sprintf('%.2f',($order['amount'] - $order['tip'])* $courierfencheng /100);
                $return["peisongprice"]               = sprintf('%.2f',(($order['amount']- $order['tip']) * $courierfencheng /100) + $additionprice +  $order['tip']);

                $return["serviceprice"]  = sprintf('%.2f',($peisongamount - $courier_get));
            }
            return $return;

        } else {
            return array ("state" => 200, "info" => '订单不存在！');
        }

    }


    // 优惠券列表
    public function quanList()
    {
        global $dsql;
        global $userLogin;

        $where      = $state = $validity = "";
        $totalCount = 0;
        $time       = GetMkTime(time());

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $shop      = $this->param['shop'];
                $food      = $this->param['food'];
                $getype    = (int)$this->param['getype'];
                $is_shop   = (int)$this->param['is_shop'];
                $openlevel = $this->param['openlevel'];
                $orderby   = $this->param['orderby'];
                $sKeyword  = trim($this->param['sKeyword']);  //搜索关键字
            }
        }


        $userid   = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array ("state" => 200, "info" => '登录超时，获取失败！');
        }

        /*if($shop){
            $where .= " AND `shopids` = '' || FIND_IN_SET($shop, `shopids`)";
        }*/

        /*if($deadline){
            $where .= " AND `deadline` > $time";
        }*/

        //未开通会员用户(目前判断是不是会员和前台传的二次获取开通会员赠送的优惠卷)
        $ret = array ();
        if ($userinfo['level'] == 0 && $openlevel == 1) {
            $levelsql = $dsql->SetQuery("SELECT * FROM `#@__member_level` ORDER BY `id` ASC");
            $levelre  = $dsql->dsqlOper($levelsql, "results");

            $levle              = $levelre[0];
            $levle['privilege'] = unserialize($levle['privilege']);
            if ($levle['privilege']['quan']) {
                foreach ($levle['privilege']['quan'] as $key => $value) {
                    $quansql               = $dsql->SetQuery("SELECT * FROM `#@__waimai_quan` WHERE `id` = " . $value['qid']);
                    $quanre                = $dsql->dsqlOper($quansql, "results");
                    $quanre[0]['quantype'] = 1; //区别虚拟和实际拥有的
                    $ret                   = array_merge($ret, array_fill(count($ret), $value['num'], $quanre['0']));
                }
            }
        }
        $order = '';

        if (!empty($orderby)) {

            if ($orderby == 1) {

                $order = " ORDER BY `pubdate` DESC";
            } else {
                if ($orderby == 2) {

                    $order = " ORDER BY `deadline` ASC";
                }
            }
        }
        /*gettype = 1or2 外卖券包调取*/
        if ($getype == 0) {

            $where .= " AND `deadline` > $time AND `state` = 0";
            $order = " ORDER BY `deadline` ASC";

        } else {
            if ($getype == 1) {

                $where .= " AND `deadline` > $time AND `state` = 0";

            } else {
                if ($getype == 2) {

                    $where .= " AND ((`deadline` < $time AND  `state` = 0) OR `state` = 1)";
                }
            }
        }

        if($sKeyword){
            $where .= " AND `name` like '%".$sKeyword."%'";
        }

        $sql        = $dsql->SetQuery("SELECT * FROM `#@__waimai_quanlist` WHERE `userid` = $userid " . $where . $order);
        $totalCount = $dsql->dsqlOper($sql, "totalCount");
        if ($totalCount == 0 && $openlevel != 1) {
            return array ("state" => 200, "info" => '暂无优惠券！');
        }
        $rets = $dsql->dsqlOper($sql, "results");

        $ret = array_merge($ret, $rets);

        $lsit = array ();
        $yes  = array ();
        $no   = array ();

        if ($ret) {
            if ($food) {
                $food = str_replace("\\", '', $food);
                $food = json_decode($food);
                $food = objtoarr($food);
            }
            foreach ($ret as $key => $value) {

                extract($value);

                $failnote = "";

                $shopList = $foodList = $shopidsArr = array ();

                $param = array ();

                $quansql = $dsql->SetQuery("SELECT `announcer`,`shoptype` FROM `#@__waimai_quan` WHERE `id` = '$qid'");
                $quanres = $dsql->dsqlOper($quansql, "results");

                $value['announcer'] = (int)$quanres[0]['announcer'];
                $value['shoptype']  = (int)$quanres[0]['shoptype'];

                $difftime = ($deadline - time()) / 3600;

                $value['kuaiexp'] = 0;
                if ($difftime < 24) {
                    $value['kuaiexp'] = 1;
                }

                if ((int)$quanres[0]['announcer'] == 1) {
                    $sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE `id` = $shopids");
                    $ret = $dsql->dsqlOper($sql, "results");

                    $value['shopname'] = $ret[0]['shopname'];
                }

                if ($shop && $food) {

                    // 订单总价格
                    $totalPrice = 0;

                    if ($shop) {

                        if ($shopids != '') {
                            $shopidsArr = explode(",", $shopids);
                            if (!in_array($shop, $shopidsArr)) {
                                $disabled = true;
                                $failnote = "只有指定商家才可以使用此优惠券";
                            }
                            $sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE `id` in ($shopids)");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $param = array (
                                    "service"  => "waimai",
                                    "template" => "shop",
                                    "id"       => $ret[0]['id']
                                );

                                foreach ($ret as $k => $v) {
                                    if ($v['id'] == $shop) {
                                        array_unshift($shopList, $v['shopname']);
                                    } else {
                                        array_push($shopList, $v['shopname']);
                                    }
                                }
                            }
                        }

                    }


                    if ($failnote == "") {

                        // 如果关联商品
                        if ($fid != "") {
                            $fidArr = explode(",", $fid);
                            $fidArr = array_filter($fidArr);

                            // 是否包含指定商品
                            $has = false;

                            // 指定商品中价格
                            $foodPrice = 0;
                            foreach ($food as $k => $v) {
                                $id    = $v['id'];
                                $price = $v['price'];

                                $totalPrice += $price;

                                if (in_array($id, $fidArr)) {
                                    $foodPrice += $price;
                                    $has       = true;
                                }
                            }

                            if (!$has) {
                                $failnote = '只有指定商品才可以使用此优惠券';
                            }

                            $sql = $dsql->SetQuery("SELECT `title` FROM `#@__waimai_list` WHERE `id` in (".join(',', $fidArr).")");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                foreach ($ret as $k => $v) {
                                    $foodList[$k] = $v['title'];
                                }
                            }

                            if ($foodPrice < $basic_price) {
                                $failnote = "指定商品金额满" . $basic_price . "才可使用";
                            }

                            if (!$has) {
                                $failnote = '只有指定商品才可以使用此优惠券【'.join('，', $foodList).'】';
                            }

                            // 验证订单总价
                        } else {
                            foreach ($food as $k => $v) {
                                $price      = $v['price'];
                                $totalPrice += $price;
                            }
                            if ($totalPrice < $basic_price) {
                                $failnote = "满&yen;" . $basic_price . "才可以使用此优惠券";
                            }
                        }

                    }


                    // 会员中心优惠券列表，为了获取url
                } else {

                    if ($shopids != '') {
                        $sql = $dsql->SetQuery("SELECT `id`, `shopname` FROM `#@__waimai_shop` WHERE `id` in ($shopids)");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $param = array (
                                "service"  => "waimai",
                                "template" => "shop",
                                "id"       => $ret[0]['id']
                            );
                        }
                    }

                }

                $value['deadline'] = date("Y.m.d", $value['deadline']);
                $value['pubdate']  = date("Y.m.d", $value['pubdate']);
                $value['expired']  = $value['deadline'] < time() ? 1 : 0;
                $value['state']    = $value['state'];
                $value['shopids']  = $value['shopids'];

                // 查询用户名
                $sql               = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
                $ret               = $dsql->dsqlOper($sql, "results");
                $value['username'] = $ret[0]['username'];


                if (empty($param)) {
                    $param = array (
                        "service"  => "waimai",
                        "template" => "index"
                    );
                }

                $value['shopList'] = $shopList;
                $value['foodList'] = $foodList;
                $value['failnote'] = $failnote;
                $value['url']      = getUrlPath($param);
                if ($failnote == "") {
                    $value['fail'] = 0;
                    if ($shop) {
                        if (in_array($shop, $shopidsArr)) {
                            array_unshift($yes, $value);
                        } else {
                            array_push($yes, $value);
                        }
                    } else {
                        array_push($yes, $value);
                    }
                } else {
                    $value['fail'] = 1;
                    array_push($no, $value);
                }
            }
        }

        // 如果是购物车页面，按金额从高到低排序，优先使用当前店铺优惠券
        if ($shop) {
            usort($yes, function ($a, $b) {
                return ($a['money'] > $b['money']) ? 0 : 1;
            });
        }
        if ($yes || $no) {
            $list = array_merge($yes, $no);
        }


        $good = $yes ? (int)$yes[0]['id'] : 0;
        if ($is_shop == 0) {

            return array (
                "totalCount" => $totalCount,
                "yes"        => count($yes),
                "no"         => count($no),
                "good"       => $good,
                "list"       => $list
            );
        } else {
            $pageinfo = array ('totalCount' => $totalCount);
            return array ("pageInfo" => $pageinfo, "list" => $list);
        }


    }


    // 获取1小时内订单的状态
    public function checkMyorder()
    {

        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();

        if ($uid == -1) {
            return array ("state" => 200, "info" => "登陆超时");
        }

        $list = array ();

        $time  = GetMkTime(time());
        $start = $time - 3600;

        // 查询1个小时内下的单
        $sql = $dsql->SetQuery("SELECT o.`id`, o.`state`, o.`ordernumstore`, o.`iscomment`, s.`shopname`, s.`id` as sid FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`uid` = $uid AND o.`state` != 6 AND o.`iscomment` = 0 AND `pubdate` > $start AND o.`del` = 0 ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");

        if ($ret) {
            foreach ($ret as $key => $value) {
                $list[$key]['id']        = $value['id'];
                $list[$key]['ordernum']  = $value['shopname'] . $value['ordernumstore'];
                $list[$key]['state']     = $value['state'];
                $list[$key]['iscomment'] = $value['iscomment'];
                $list[$key]['sid']       = $value['sid'];
            }
            return $list;
        } else {
            return array ("state" => 200, "info" => '暂无数据！');
        }
    }

    // 获取骑手位置
    public function getCourierLocal()
    {
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => "登陆超时");
        }

        $param  = $this->param;
        $userid = $param['id'];

        if (empty($userid)) {
            return array ("state" => 200, "info" => "未指定骑手id");
        }


        $sql = $dsql->SetQuery("SELECT `lng`, `lat` FROM `#@__waimai_courier` WHERE `id` = $userid AND `state` = 1");
        $ret = $dsql->dsqlOper($sql, "results");

        if ($ret) {
            return $ret[0]['lat'] . "," . $ret[0]['lng'];
            // return array("lng" => $ret[0]['lng'], "lat" => $ret[0]['lat']);
        } else {
            return array ("state" => 200, "info" => "骑手不存在或已停工");
        }

    }

    public function updateCart()
    {
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array ("state" => 200, "info" => "登陆超时");
        }

        $param = $this->param;

        $shopid  = $param['shop'];
        $address = (int)$param['address'];
        $paytype = $param['paytype'];
        $preset  = $param['preset'];
        $note    = $param['note'];
        $quanid  = $param['quanid'];
        $paypwd  = $param['paypwd'];

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_temp` WHERE `sid` = $shopid AND `uid` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $id  = $ret[0]['id'];
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_order_temp` SET `addr` = $address, `paytype` = '$paytype', `paypwd` = '$paypwd', `note` = '$note', `quanid` = $quanid, `preset` = '$preset' WHERE `id` = $id");
        } else {
            $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_order_temp` (`uid`, `sid`, `addr`, `paytype`, `paypwd`, `note`, `quanid`, `preset`) VALUES ('$uid', '$shopid', '$address', '$paytype', '', '$note', '$quanid', '$preset')");

        }
        $ret = $dsql->dsqlOper($sql, "update");
        if ($ret == "ok") {
            return "更新成功";
        } else {
            return array ("state" => 200, "info" => "更新失败");
        }

    }

    /**
     * 小程序支付
     *
     * @return array
     */
    public function miniPay()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;
        global $cfg_pointRatio;

        $ordernum   = $this->param['ordernum'];
        $paytype    = 'wxpay';
        $usePinput  = $this->param['usePinput'];
        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        $userid     = $userLogin->getMemberID();


        if ($userid == -1) {
            return array ("state" => 200, "info" => "登陆超时");
        }


        if ($ordernum) {

            $sql = $dsql->SetQuery("SELECT o.`id`, o.`sid`, o.`uid`, o.`amount`, o.`ordernumstore`, o.`usequan`, o.`food`, o.`priceinfo`, s.`shopname`, s.`bind_print`, s.`print_config`, s.`print_state` FROM `#@__waimai_order_all` o LEFT JOIN `#@__waimai_shop` s ON s.`id` = o.`sid` WHERE o.`uid` = $userid AND o.`state` = 0 AND `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $data          = $ret[0];
                $id            = $data['id'];
                $uid           = $data['uid'];
                $sid           = $data['sid'];
                $usequan       = $data['usequan'];
                $totalPrice    = $data['amount'];
                $shopname      = $data['shopname'];
                $bind_print    = $data['bind_print'];
                $print_config  = $data['print_config'];
                $print_state   = $data['print_state'];
                $ordernumstore = $data['ordernumstore'];
                $food          = $data['food'];
                $priceinfo     = $data['priceinfo'];

                $date = GetMkTime(time());

                /*
                    如果订单金额小于等于0或者支付方式为余额付款|货到付款，直接更新订单状态，并跳转至订单详情页
                    或者支付方式为货到付款，跳转至订单详情页
                */

                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $usermoney = $userinfo['money'];
                $userpoint = $userinfo['point'];

                $tit      = array ();
                $useTotal = 0;

                //判断是否使用积分，并且验证剩余积分
                // if ($usePinput == 1 && !empty($point)) {
                //     if ($userpoint < $point) return array("state" => 200, "info" => "您的可用" . $cfg_pointName . "不足，支付失败！");
                //     $useTotal += $point / $cfg_pointRatio;
                //     $tit[]    = "integral";
                // }

                //判断是否使用余额，并且验证余额和支付密码
                if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

                    if (!empty($balance) && empty($paypwd)) {
                        if ($check) {
                            return array ("state" => 200, "info" => "请输入支付密码！");
                        } else {
                            die("请输入支付密码！");
                        }
                    }

                    //验证支付密码
                    $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
                    $results  = $dsql->dsqlOper($archives, "results");
                    $res      = $results[0];
                    $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
                    if ($res['paypwd'] != $hash) {
                        if ($check) {
                            return array ("state" => 200, "info" => "支付密码输入错误，请重试！");
                        } else {
                            die("支付密码输入错误，请重试！");
                        }
                    }

                    //验证余额
                    if ($usermoney < $balance) {
                        if ($check) {
                            return array ("state" => 200, "info" => "您的余额不足，支付失败！");
                        } else {
                            die("您的余额不足，支付失败！");
                        }
                    }

                    $useTotal += $balance;
                    $tit[]    = "money";

                }


                // 使用了余额
                if ($useTotal) {

                    if ($useTotal > $totalPrice) {
                        if ($check) {
                            return array (
                                "state" => 200,
                                "info"  => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit)
                            );
                        }
                        // 余额不足
                    } else {
                        if ($useTotal < $totalPrice) {
                            return array ("state" => 200, "info" => "余额不足,请选择在线支付方式！");

                        }
                    }
                }

                $amount = $totalPrice - $useTotal;
                if ($amount > 0 && empty($paytype)) {
                    if ($check) {
                        return array ("state" => 200, "info" => "请选择支付方式！");
                    }
                }

                $param = array ("type" => "waimai");
                // 需要支付的金额大于0并且不是货到付款，调用微信统一下单
                if ($amount > 0) {
                    //统一下单(公众号支付)

                    $archives = $dsql->SetQuery("SELECT `pay_config` FROM `#@__site_payment` WHERE `pay_code` = '$paytype' AND `state` = 1");
                    $payment  = $dsql->dsqlOper($archives, "results");
                    if ($paytype) {
                        $payInfo = unserialize($payment[0]['pay_config']);
                    }
                    $configIncFile = HUONIAOINC . '/config/wechatConfig.inc.php';
                    require $configIncFile;
                    $mchid  = $payInfo[1]['value'];
                    $appid  = $cfg_miniProgramAppid;
                    $secret = $cfg_miniProgramAppsecret;
                    $key    = $payInfo[2]['value'];
                    //用户openid
                    $sql_user    = $dsql->SetQuery("SELECT `wechat_mini_openid` FROM `#@__member` WHERE `id` = '$userid'");
                    $user_openid = $dsql->dsqlOper($sql_user, "results");
                    if ($user_openid) {
                        $openid = $user_openid[0]['wechat_mini_openid'];
                    } else {
                        return array ("state" => 200, "info" => "用户信息异常！");
                    }
                    $notifyUrl = $cfg_secureAccess . $cfg_basehost . '/include/miniReturnPay.php';

                    include HUONIAOROOT . '/api/payment/miniPay.php';
                    $miniPay = new JsApiService($mchid, $appid, $secret, $key);
                    $payRes  = $miniPay->createJsBizPackage($openid, $amount, $ordernum, 'waimai', $notifyUrl,
                        GetMkTime(time()));

                    //删除当前订单没有支付的历史记录
                    $sql = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 0");
                    $dsql->dsqlOper($sql, "update");
                    $date     = GetMkTime(time());
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$ordernum', '$userid', '$ordernum', '$amount', '$paytype', 0, $date)");
                    $dsql->dsqlOper($archives, "results");
                    return array ("state" => 200, "info" => $payRes);
                    die;
                } else {
                    // 余额支付或者货到付款
                    $body     = serialize($param);
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('waimai', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
                    $dsql->dsqlOper($archives, "results");

                    //执行支付成功的操作
                    $this->param = array (
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();

                }
            }
        } else {
            return array ("state" => 200, "info" => '订单不存在');
        }
    }


    public function pushTest()
    {

        die;
        $uid   = 1212;
        $title = "您有一笔新订单！";
        $body  = "订单号：测试专用（请勿下单）20171027-19";
        $url   = "http://wa.huoniaomenhu.com/wmsj/order/waimaiOrderDetail.php?id=18562";
        $music = "newshoporder";

        // $uid = 30;
        // $title = "您有新的配送订单";
        // $body = "订单号：测试专用（请勿下单）20171027-19";
        // $url = "http://wa.huoniaomenhu.com/index.php?service=waimai&do=courier&template=detail&id=18561";
        // $music = "newfenpeiorder";

        sendapppush($uid, $title, $body, $url, $music);

    }

    public function printtest()
    {
        testprinterWaimaiOrder(179392);
    }

    /**
     * 商品排行榜
     *
     * @return array
     */
    public function foodRank()
    {
        global $dsql;
        global $userLogin;

        $pageinfo = $list = array ();
        $pageSize = 5;

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/waimai.inc.php");
        $dataShare = (int)$customDataShare;

        $where = "";
        
        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND s.`cityid` = " . $cityid;
            }
        }

        //查询所有商品
        $archives = $dsql->SetQuery("SELECT l.`id`, l.`sid`, l.`title`,l.`price`, l.`sale`, l.`pics` FROM `#@__waimai_list` l LEFT JOIN `#@__waimai_shop` s ON l.`sid` = s.`id` WHERE s.`status` =  1 AND s.`del` = 0 AND l.`status` = 1 AND l.`del` = 0 ".$where." ORDER BY l.`sale` DESC, l.`id` DESC LIMIT 0, $pageSize");
        $ret      = $dsql->dsqlOper($archives, "results");
        if ($ret) {
            foreach ($ret as $key => $value) {

                $list[$key]['id']    = $value['id'];
                $list[$key]['title'] = $value['title'];
                $list[$key]['price'] = $value['price'];
                $list[$key]['sale']  = $value['sale'];

                $foodSale = array ();
                $foodSale = array ();
                $sql      = $dsql->SetQuery("SELECT `food` FROM `#@__waimai_order_all` WHERE `sid` = '" . $value['sid'] . "' AND `state` = 1");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    foreach ($ret as $a => $val) {
                        $food = $val['food'];
                        $food = unserialize($food);
                        if (!empty($food) && is_array($food)) {
                            foreach ($food as $k => $v) {
                                $foodSale[$v['id']] = isset($foodSale[$v['id']]) ? ($foodSale[$v['id']] + $v['count']) : $v['count'];
                            }
                        }
                    }
                }

                $list[$key]['sale'] = isset($foodSale[$value['id']]) ? $foodSale[$value['id']] : 0;


                $picArr = array ();
                if ($value['pics']) {
                    $pics = explode(",", $value['pics']);
                    foreach ($pics as $k => $v) {
                        array_push($picArr, getFilePath($v));
                    }
                }
                $list[$key]['pics'] = $picArr;

                $list[$key]['url'] = getUrlPath(array (
                    'service'  => 'waimai',
                    'template' => 'shop',
                    'id'       => $value['sid']
                ));

            }
        }

        return $list;

    }


    /**
     * 优惠推荐
     *
     * @return array
     */
    public function saleRec()
    {
        global $dsql;
        global $userLogin;

        $pageinfo = $list = array ();
        $stock    = 0;
        $page     = 1;
        $pageSize = 10;

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array ("state" => 200, "info" => '格式错误！');
            } else {
                $stock    = (int)$this->param['stock'];
                $cityid   = (int)$this->param['cityid'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;

        //数据共享
        require(HUONIAOINC . "/config/waimai.inc.php");
        $dataShare = (int)$customDataShare;
        $customSaleState = (int)$customSaleState;  //是否开启

        //没有开启，直接返回空数据
        if(!$customSaleState){
            return array ("state" => 200, "info" => '功能未开启！');
        }

        $where = '';
        if (!$dataShare) {
            $cityid = $cityid ? $cityid : getCityId();
            if ($cityid) {
                $where .= " AND s.`cityid` = " . $cityid;
            }
        }

        if ($stock) {
            $where .= " AND l.`stock` > 0";
        }

        //查询所有商品
        $archives = $dsql->SetQuery("SELECT l.`id`,l.`sid`, l.`sid`, l.`title`,l.`typeid`,l.`price`,l.`formerprice`, l.`pics`,l.`stockvalid`,l.`stock`, s.`shopname`, s.`delivery_time`, s.`delivery_fee`, s.`delivery_fee_mode`, s.`service_area_data`, s.`range_delivery_fee_value`, (select count(o.`id`) from `#@__waimai_order_all` o where o.`state` = 1 and o.`sid` = s.`id`) AS sale FROM `#@__waimai_list` l LEFT JOIN `#@__waimai_shop` s ON l.`sid` = s.`id` WHERE s.`status` =  1 AND s.`del` = 0 AND l.`status` = 1 AND l.`del` = 0 AND l.`saleRec` = 1 " . $where . " ORDER BY l.`sort` DESC, case when l.`stock` = 0 then 1 else 0 end, l.`stock` ASC, l.`id` DESC");


        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil((int)$totalCount / (int)$pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $where  = "";
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";

        $ret = $dsql->dsqlOper($archives . $where, "results");
        if ($ret) {
            foreach ($ret as $key => $value) {

                $list[$key]['id']            = $value['id'];
                $list[$key]['sid']           = $value['sid'];
                $list[$key]['shopname']      = $value['shopname'];
                $list[$key]['title']         = $value['title'];
                $list[$key]['typeid']        = $value['typeid'];
                $list[$key]['price']         = floatval($value['price']);
                $list[$key]['formerprice']   = floatval($value['formerprice']);
                $list[$key]['sale']          = $value['sale'];
                $list[$key]['stock']         = $value['stock'];
                $list[$key]['stockvalid']    = $value['stockvalid'];
                $list[$key]['stock']         = $value['stock'];
                $list[$key]['delivery_time'] = $value['delivery_time'] ? $value['delivery_time'] : '';

                // 评分
                $sql                = $dsql->SetQuery("SELECT avg(`star`) r FROM `#@__waimai_common` WHERE `sid` = " . $value['sid']);
                $res                = $dsql->dsqlOper($sql, "results");
                $rating             = $res[0]['r'];        //总评分
                $rating             = $rating <= 0 ? 5 : $rating;
                $list[$key]['star'] = number_format($rating, 1);

                $picArr = array ();
                if ($value['pics']) {
                    $pics = explode(",", $value['pics']);
                    foreach ($pics as $k => $v) {
                        array_push($picArr, getFilePath($v));
                    }
                }
                $list[$key]['pics'] = $picArr;

                // 配送费
                // 固定
                if ($value['delivery_fee_mode'] == 1) {
                    $basicprice   = $value['basicprice'];
                    $delivery_fee = $value['delivery_fee'];
                    //按区域
                } else {
                    if ($value['delivery_fee_mode'] == 2) {
                        $service_area_data = $value['service_area_data'];
                        $service_area_data = unserialize($service_area_data);
                        if ($service_area_data) {
                            $delivery_fee = 9999;
                            $basicprice   = 9999;
                            foreach ($service_area_data as $k => $v) {
                                if ($v['peisong'] < $delivery_fee) {
                                    $delivery_fee = $v['peisong'];
                                }
                                if ($v['qisong'] < $basicprice) {
                                    $basicprice = $v['qisong'];
                                }
                            }
                        } else {
                            $delivery_fee = $value['delivery_fee'];
                        }

                        //按距离
                    } else {
                        if ($value['delivery_fee_mode'] == 3) {
                            $range_delivery_fee_value = $value['range_delivery_fee_value'];
                            $range_delivery_fee_value = unserialize($range_delivery_fee_value);
                            if ($range_delivery_fee_value) {
                                $delivery_fee = 9999;
                                $basicprice   = 9999;
                                foreach ($range_delivery_fee_value as $k => $v) {
                                    if ($v[2] < $delivery_fee) {
                                        $delivery_fee = $v[2];
                                    }
                                    if ($v[3] < $basicprice) {
                                        $basicprice = $v[3];
                                    }
                                }
                            } else {
                                $delivery_fee = $value['delivery_fee'];
                            }
                        }
                    }
                }
                $list[$key]['delivery_fee'] = $delivery_fee;   //配送费

                $list[$key]['url'] = getUrlPath(array (
                    'service'  => 'waimai',
                    'template' => 'shop',
                    'id'       => $value['sid'],
                    'param'    => 'foodid=' . $value['id'] . '&typeid=' . $value['typeid']
                ));

            }
        }

        return array ("pageInfo" => $pageinfo, "list" => $list);

    }

    /**
     * Notes: 实际距离
     * Ueser: Administrator
     * DateTime: 2021/10/22 17:18
     * Param1:
     * Param2:
     * Param3:
     * Return:
     *
     * @return array
     */
    public function getroutetime()
    {
        global $cfg_map;
        $mapurl = '';
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

        //如果两个坐标完全一样
        if($originlng == $destinationlng && $originlat == $destinationlat){
            $duration = 1;
            $distance = 1;
        }else{
            include(HUONIAOROOT . "/include/config/waimai.inc.php");
            if ($cfg_map == 2) {
                $origin      = $originlat . "," . $originlng;
                $destination = $destinationlat . "," . $destinationlng;
                global $cfg_map_baidu_server;
                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL,
                    'http://api.map.baidu.com/directionlite/v1/riding?riding_type=1&origin=' . $origin . '&destination=' . $destination . '&ak=' . $cfg_map_baidu_server);
                curl_setopt($curl, CURLOPT_HEADER, 0);
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                curl_setopt($curl, CURLOPT_TIMEOUT, 20);
                $con = curl_exec($curl);
                curl_close($curl);

                if ($con) {
                    $con = json_decode($con, true);
                    if ($con['status'] == 0) {
                        $routes   = $con['result']['routes'];
                        $duration = $routes['0']['duration'];
                        $distance = ($routes['0']['distance'] / 1000);
                    }

                }

                //高德
            } else {
                if ($cfg_map == 4) {
                    $origin      = $originlng . "," . $originlat;
                    $destination = $destinationlng . "," . $destinationlat;
                    global $cfg_map_amap_server;
                    $curl = curl_init();
                    curl_setopt($curl, CURLOPT_URL,
                        'https://restapi.amap.com/v5/direction/electrobike?origin=' . $origin . '&destination=' . $destination . '&key=' . $cfg_map_amap_server);
                    curl_setopt($curl, CURLOPT_HEADER, 0);
                    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($curl, CURLOPT_TIMEOUT, 20);
                    $con = curl_exec($curl);
                    curl_close($curl);

                    if ($con) {
                        $con = json_decode($con, true);
                        if ($con['status'] == 1) {
                            $routes   = $con['route'];
                            $duration = $routes['paths'][0]['duration'];
                            $distance = ($routes['paths'][0]['distance'] / 1000);
                        }
                    }
                }

                //其他地图直接使用直线距离
                else{

                    $duration = 1;
                    $distance = oldgetDistance($originlng, $originlat, $destinationlng, $destinationlat) / 1000;

                }
            }
        }
        $paotuitimem = (int)$custom_paotuitime * 60;
        $yjtime      = time() + $duration + $paotuitimem;
        if (!is_numeric($distance)) {
            $distance = 0;
        }
        return array (
            'time'   => date('H:i:s', $yjtime),
            'juli'   => floatval(sprintf('%.2f', $distance)),
            'yjtime' => $duration + $paotuitimem
        );
    }

    // public function  testpaysuccess(){

    //         $this->param['paytype'] = 'wxpay';
    //         $this->param['ordernum'] = '2142273162659915';
    //         $this->param['transaction_id']= '4200001021202104226615453028';
    //         $this->param['paylognum'] ='2142273162659915';

    //         $this->paySuccess();
    // }

    //    public function Updatewaimaifc()
    //    {
    //        global  $dsql;
    //
    //        $waimaisql  = $dsql->SetQuery("SELECT `id`,`sid` FROM `#@__waimai_order_all` WHERE `state` = 1 AND `pubdate` >= 1590940800 AND `pubdate` <= 1593619198 AND `fencheng_foodprice` = 0");
    //        $waimaires  = $dsql->dsqlOper($waimaisql,"results");
    //        if($waimaires) {
    //            foreach ($waimaires as $k => $v)
    //            {
    //                //查询订单分成
    //                $fcsqla = $dsql->SetQuery("SELECT `fencheng_foodprice`,`fencheng_delivery`,`fencheng_dabao`,`fencheng_addservice`,`fencheng_zsb`,`fencheng_discount`,`fencheng_promotion`,`fencheng_firstdiscount`,`fencheng_offline`,`fencheng_quan` FROM `#@__waimai_shop` WHERE `id` = ".$v['sid']);
    //                $fcres =  $dsql->dsqlOper($fcsqla,"results");
    //                $shopfc = $fcres['0'];
    //                $fencheng_foodprice     = $shopfc['fencheng_foodprice'];
    //                $fencheng_delivery      = $shopfc['fencheng_delivery'];
    //                $fencheng_dabao         = $shopfc['fencheng_dabao'];
    //                $fencheng_addservice    = $shopfc['fencheng_addservice'];
    //                $fencheng_zsb           = $shopfc['fencheng_zsb'];
    //                $fencheng_discount      = $shopfc['fencheng_discount'];
    //                $fencheng_promotion     = $shopfc['fencheng_promotion'];
    //                $fencheng_firstdiscount = $shopfc['fencheng_firstdiscount'];
    //                $fencheng_offline       = $shopfc['fencheng_offline'];
    //                $fencheng_quan          = $shopfc['fencheng_quan'];
    //                //更新订单状态
    //                $archives = $dsql->SetQuery("UPDATE `#@__waimai_order_all` SET `fencheng_foodprice` = '$fencheng_foodprice', `fencheng_delivery` = '$fencheng_delivery', `fencheng_dabao` = '$fencheng_dabao',  `fencheng_addservice` = '$fencheng_addservice', `fencheng_zsb` = '$fencheng_zsb', `fencheng_discount` = '$fencheng_discount', `fencheng_promotion` = '$fencheng_promotion', `fencheng_firstdiscount` = '$fencheng_firstdiscount',`fencheng_offline` = '$fencheng_offline',`fencheng_quan` = '$fencheng_quan' WHERE `ordernum` = '$ordernum'");
    //                $dsql->dsqlOper($archives, "update");
    //            }
    //        }
    //    }

    /**
     * Notes: 外卖领券
     * Ueser: Administrator
     * DateTime: 2021/5/11 16:06
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function receiveQuanList()
    {
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {

            $getype    = (int)$this->param['getype'];
            $shopid    = (int)$this->param['shopid'];
            $recommend = (int)$this->param['recommend'];
            $center    = (int)$this->param['center'];
            $page      = $this->param['page'];
            $pageSize  = $this->param['pageSize'];
            $sKeyword  = $this->param['sKeyword'];

        }
        $uid = $userLogin->getMemberID();

        //        if($uid <0 )  return array("state" => 200, "info" => '未登录或登录超时！');
        $pageinfo = $list = array ();

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;

        $nowtime = GetMkTime(time());
        $where   = " AND q.`state` = 0  AND q.`sent` > 0 AND q.`limit` > 0 AND ((q.`deadline_type` = 1 AND q.`deadline` >= $nowtime) OR q.`deadline_type` = 0)";

        $leftjoinsql = $leftstr = $groupby = '';
        $orderby     = '';
        if (!empty($getype)) {

            // $groupby = " GROUP BY q.`shopids`";
            $groupby = "";

            /*gettype 1通用券,2首页推荐(领券中心火热推荐)*/
            if ($getype == 1) {

                if ($shopid) {
                    $where .= " AND (q.`shoptype` = 0 or q.`shopids` = '$shopid')";
                } else {

                    $where .= " AND q.`shoptype` = 0";
                }

                $groupby = '';
            } else {
                if ($getype == 2) {

                    // $where .= " AND q.`recommend` = 1 AND q.`announcer` = 1";
                    $where .= " AND q.`recommend` = 1 ";

                } else {
                    if ($getype == 9) {

                        $where   .= " AND  q.`shoptype` = 0 AND q.`recommend` = 1 AND q.`sent` >0";
                        $groupby = '';
                        $orderby = ' ORDER BY q.`money` DESC';
                    } else {
                        $where .= " AND q.`shoptype` = 1";
                    }
                }
            }
        }

        if (!empty($recommend)) {
            $where .= " AND q.`recommend` = 1 ";
        }

        if (!empty($center)) {
            $where .= " AND q.`shoptype` = 1 AND q.`announcer` = 1";
        }

        if ($getype > 2) {
            $where .= " AND s.`status` = 1 AND s.`del` = 0";
        }

        if($sKeyword){
            $where .= " AND (q.`name` like '%".$sKeyword."%' OR s.`shopname` like '%".$sKeyword."%')";
        }

        //数据共享
        require(HUONIAOINC . "/config/waimai.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND ((q.`shoptype` = 1 AND s.`cityid` = " . $cityid . ") OR q.`shoptype` = 0)";
            }
        }

        $archives   = $dsql->SetQuery("SELECT q.`id`,q.`money`,q.`limit`,q.`basic_price`,q.`name`,q.`shopids`,q.`shoptype`,q.`number`,q.`sent`,q.`deadline`,`announcer` FROM `#@__waimai_quan` q LEFT JOIN `#@__waimai_shop` s ON s.`id` = q.`shopids`  WHERE 1=1" . $where . $groupby);
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil((int)$totalCount / (int)$pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $where  = "";
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        $ret    = $dsql->dsqlOper($archives . $where, "results");

        if ($ret) {

            foreach ($ret as $k => $v) {

                $list[$k]['id']          = $v['id'];
                $list[$k]['money']       = $v['money'];
                $list[$k]['limit']       = $v['limit'];
                $list[$k]['name']        = $v['name'];
                $list[$k]['basic_price'] = $v['basic_price'];
                $list[$k]['shoptype']    = $v['shoptype'];
                $list[$k]['shopids']     = (int)$v['shopids'];
                $list[$k]['number']      = $v['number'];
                $list[$k]['announcer']   = $v['announcer'];
                $list[$k]['deadline']    = date("Y.m.d", $v['deadline']);
                $list[$k]['received']    = (int)$v['received'];

                /*查询自己有无领取*/
                $selfsql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `qid` = '" . $v['id'] . "' AND `userid`  ='$uid'");
                $selfres = $dsql->dsqlOper($selfsql, "totalCount");

                $is_lingqu = 0;
                if ($selfres && $selfres >= $v['limit']) {
                    $is_lingqu = 1;
                }
                $list[$k]['is_lingqu'] = $is_lingqu;
                $salescount            = $delivery_time = 0;
                if ($v['shoptype'] == 1) {

                    $_shopid = (int)$v['shopids'];
                    $storesql = $dsql->SetQuery("SELECT `promotions`,`shopname`,`delivery_fee`,`delivery_time`,`shop_banner` FROM `#@__waimai_shop` WHERE `id` = " . $_shopid);
                    $storeres = $dsql->dsqlOper($storesql, "results");

                    $promotions = $shopname = $delivery_fee = '';

                    if ($storeres) {

                        $promotions = $storeres[0]['promotions'] != '' ? unserialize($storeres[0]['promotions']) : array ();

                        $shopname = $storeres[0]['shopname'];

                        $delivery_fee = $storeres[0]['delivery_fee'];

                        $delivery_time = $storeres[0]['delivery_time'];

                        $shop_bannerarr = $storeres[0]['shop_banner'] != '' ? explode(',',
                            $storeres[0]['shop_banner']) : array ();

                        $shop_banner = $shop_bannerarr ? getFilePath($shop_bannerarr[0]) : '';
                        $now         = time();
                        $end         = strtotime('+1 month');

                        $yue_star = mktime(0, 0, 0, date('m', $now), 1, date('Y', $now));//当前月开始时间
                        $yue_end  = mktime(0, 0, 0, date('m', $end), 1, date('Y', $end)) - 1;//当前月结束时间

                        /*月售*/

                        $salessql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_order_all` WHERE `sid` = " . $_shopid . " AND `state` !=6 AND `pubdate`>= $yue_star AND `pubdate` < $yue_end");

                        $salescount = $dsql->dsqlOper($salessql, "totalCount");

                        $param = array (
                            "service"  => "waimai",
                            "template" => "shop",
                            "id"       => $_shopid
                        );

                        $storeurl = getUrlPath($param);
                        
                        if(strstr($v['shopids'], ',')){
                            $shopids = explode(',', $v['shopids']);
                            $shopname .= '等' . count($shopids) . '家店铺可用';
                        }

                    }


                    $foodsql = $dsql->SetQuery("SELECT `id`,`title`,`pics`,`price`,`typeid` FROM `#@__waimai_list` WHERE  `sid` = " . $_shopid . " ORDER BY `sale` DESC LIMIT 0,2");
                    $foodres = $dsql->dsqlOper($foodsql, "results");

                    $foodarr = array ();
                    if ($foodres) {

                        foreach ($foodres as $a => $b) {
                            $foodarr[$a]['id'] = $b['id'];
                            $foodarr[$a]['title'] = $b['title'];
                            $foodarr[$a]['typeid'] = $b['typeid'];
                            $foodarr[$a]['price'] = $b['price'];
                            $foodarr[$a]['pics']  = getFilePath($b['pics']);
                        }
                    }
                    
                    


                }
                $list[$k]['promotions']    = $promotions;
                $list[$k]['shopname']      = $shopname;
                $list[$k]['shop_banner']   = $shop_banner;
                $list[$k]['foodarr']       = $foodarr;
                $list[$k]['delivery_time'] = $delivery_time;
                $list[$k]['delivery_fee']  = $delivery_fee;
                $list[$k]['salescount']    = (int)$salescount;
                $list[$k]['storeurl']      = $storeurl;

                /*已领*/

                $ylsql   = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `qid` = '" . $v['id'] . "'");
                $ylcount = $dsql->dsqlOper($ylsql, "totalCount");

                if ((int)$ylcount > 10000) {
                    $ylcount = $ylcount / 10000;
                    $ylcount .= 'w';
                }
                $list[$k]['ylcount']   = $ylcount;
                $list[$k]['announcer'] = (int)$quanres[0]['announcer'];

                $difftime = ($deadline - time()) / 3600;

                $list[$k]['kuaiexp'] = 0;
                if ($difftime < 24) {
                    $list[$k]['kuaiexp'] = 1;
                }
            }

        }

        return array ("pageInfo" => $pageinfo, "list" => $list);


    }

    public function getWaimaiQuan()
    {
        global $dsql;
        global $userLogin;

        if (!empty($this->param)) {
            $qid = $this->param['qid'];
        }

        $uid = $userLogin->getMemberID();

        if ($uid < 0) {
            return array ("state" => 200, "info" => '未登录或登录超时！');
        }

        if (empty($qid)) {
            return array ("state" => 200, "info" => '格式错误！');
        }

        $quansql = $dsql->SetQuery("SELECT `id`,`deadline_type`,`deadline`,`validity`,`sent`,`limit`,`name`,`des`,`money`,`basic_price`,`shopids`,`fid`,`bear` FROM `#@__waimai_quan` WHERE `id` = '$qid' AND `state` = 0");

        $quanres = $dsql->dsqlOper($quansql, "results");

        if (empty($quanres)) {
            return array ("state" => 200, "info" => '手慢了！该券已被抢完！');
        }

        if (($quanres[0]['deadline'] <= time() && $quanres[0]['deadline_type'] == 1) || $quanres[0]['sent'] <= 0) {
            return array ("state" => 200, "info" => '手慢了！该券已被抢完！');
        }

        $myquansql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_quanlist` WHERE `userid` = '$uid' AND `qid` = '$qid' AND `yourself` = 1");

        $myquancount = $dsql->dsqlOper($myquansql, "totalCount");
        if ($myquancount >= $quanres[0]['limit']) {
            return array ("state" => 200, "info" => '该券已达领取上限！');
        }


        $pubdate     = time();
        $name        = $quanres[0]['name'];
        $des         = $quanres[0]['des'];
        $money       = $quanres[0]['money'];
        $basic_price = $quanres[0]['basic_price'];
        $deadline_type    = $quanres[0]['deadline_type'];
        $deadline    = $quanres[0]['deadline'];
        $validity    = $quanres[0]['validity'];
        $shopids     = $quanres[0]['shopids'];
        $fid         = $quanres[0]['fid'];
        $bear         = $quanres[0]['bear'];
        
        //指定天数，当前时间加天数
        if($deadline_type == 0){
            $deadline = AddDay(time(), $validity);
        }


        $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_quanlist` (`qid`, `userid`, `name`, `des`, `money`, `basic_price`, `deadline`, `shopids`, `fid`, `pubdate`,`yourself`, `bear`) VALUES ('$qid', '$uid', '$name', '$des', '$money', '$basic_price', '$deadline', '$shopids', '$fid', '$pubdate','1', '$bear')");

        $res = $dsql->dsqlOper($sql, "update");

        if ($res == 'ok') {
            $numbersql = $dsql->SetQuery("UPDATE `#@__waimai_quan` SET `sent` = `sent` - 1,`received`=`received`+1 WHERE `id` = '$qid'");

            $dsql->dsqlOper($numbersql, "update");

            return "恭喜你！抢到了！";
        } else {
            return array ("state" => 200, "info" => '暂未领到！');
        }


    }

    /**
     * Notes: 骑手提现
     * Ueser: Administrator
     * DateTime: 2021/9/13 13:15
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function courierWithdraw()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $param    = $this->param;
        $bank     = $param['bank'];
        $cardnum  = $param['cardnum'];
        $cardname = $param['cardname'];
        $amount   = $param['amount'];
        $date     = GetMkTime(time());

        global $cfg_minWithdraw;  //起提金额
        global $cfg_maxWithdraw;  //最多提现
        global $cfg_maxCountWithdraw;  //每天最多提现次数
        global $cfg_maxAmountWithdraw;  //每天最多提现金额
        global $cfg_courierWithdrawCycle;  //提现周期  0不限制  1每周  2每月
        global $cfg_courierWithdrawCycleWeek;  //周几
        global $cfg_courierWithdrawCycleDay;  //几日
        global $cfg_withdrawPlatform;  //提现平台
        global $cfg_withdrawCheckType;  //付款方式
        global $cfg_courierwithdrawNote;  //提现说明
        global $customcourierFree;

        $cfg_minWithdraw       = (float)$cfg_minWithdraw;
        $cfg_maxWithdraw       = (float)$cfg_maxWithdraw;
        $cfg_withdrawCycle     = (int)$cfg_courierWithdrawCycle;
        $cfg_withdrawCheckType = (int)$cfg_withdrawCheckType;

        $courierFree      = (float)$customcourierFree;
        $withdrawPlatform = $cfg_withdrawPlatform ? unserialize($cfg_withdrawPlatform) : array (
            'weixin',
            'alipay',
            'bank'
        );

        //提现周期
        if ($cfg_withdrawCycle) {
            //周几
            if ($cfg_withdrawCycle == 1) {

                $week = date("w", time());
                if ($week != $cfg_courierWithdrawCycleWeek) {
                    $array = $langData['siteConfig'][34][5];  //array('周日', '周一', '周二', '周三', '周四', '周五', '周六')
                    return array (
                        "state" => 200,
                        "info"  => str_replace('1', $array[$cfg_courierWithdrawCycleWeek], $langData['siteConfig'][36][0])
                    );  //当前不可提现，提现时间：每周一
                }

                //几日
            } else {
                if ($cfg_withdrawCycle == 2) {

                    $day = date("d", time());
                    if ($day != $cfg_courierWithdrawCycleDay) {
                        return array (
                            "state" => 200,
                            "info"  => str_replace('1', $cfg_courierWithdrawCycleDay, $langData['siteConfig'][36][1])
                        );  //当前不可提现，提现时间：每月1日
                    }

                }
            }
        }

        if ((($bank == 'weixin' || $bank == 'alipay') && !in_array($bank,
                    $withdrawPlatform)) || ($bank != 'weixin' && $bank != 'alipay' && !in_array('bank',
                    $withdrawPlatform))) {
            return array ("state" => 200, "info" => $langData['siteConfig'][36][2]);  //不支持的提现方式
        }

        $did     = GetCookie("courier"); /*骑手id*/
        $coursql = $dsql->SetQuery("SELECT `status`,`money`,`openid`,`name`,`quit` FROM `#@__waimai_courier` WHERE `id` = '$did'");
        $courres = $dsql->dsqlOper($coursql, "results");

        $quit     = (int)$courres[0]['quit'];
        $money    = $courierFree != '0.00' && $quit == 0 ? (float)$courres[0]['money'] - $courierFree : $courres[0]['money'];
        $openid   = $courres[0]['openid'];
        $realname = $courres[0]['name'];
        if (empty($courres)) {
            return array ("state" => 200, "info" => $langData['siteConfig'][20][262]);
        }  //登录超时，请重新登录！

        if (empty($bank) || ($bank != 'weixin' && (empty($cardnum) || empty($cardname))) || empty($amount)) {
            return array ("state" => 200, "info" => $langData['siteConfig'][33][30]);
        }//请填写完整！

        if ($cfg_minWithdraw && $amount < $cfg_minWithdraw) {
            return array (
                "state" => 200,
                "info"  => str_replace('1', $cfg_minWithdraw, $langData['siteConfig'][36][3])
            );  //起提金额：1元
        }

        if ($cfg_maxWithdraw && $amount > $cfg_maxWithdraw) {
            return array (
                "state" => 200,
                "info"  => str_replace('1', $cfg_maxWithdraw, $langData['siteConfig'][36][4])
            );  //单次最多提现：1元
        }

        //统计当天交易量
        if ($cfg_maxCountWithdraw || $cfg_maxAmountWithdraw) {
            $start = GetMkTime(date("Y-m-d"));
            $end   = $start + 86400;
            $sql   = $dsql->SetQuery("SELECT SUM(`amount`) amount, COUNT(`id`) count FROM `#@__member_withdraw` WHERE `uid` = '$did' AND `usertype` = 1 AND `tdate` >= $start AND `tdate` < $end");
            $ret   = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $todayAmount = $ret[0]['amount'];
                $todayCount  = $ret[0]['count'];

                if ($cfg_maxCountWithdraw && $todayCount > $cfg_maxCountWithdraw) {
                    return array (
                        "state" => 200,
                        "info"  => str_replace('1', $cfg_maxCountWithdraw, $langData['siteConfig'][36][5])
                    );  //每天最多提现1次
                }

                if ($cfg_maxAmountWithdraw && $todayAmount > $cfg_maxAmountWithdraw) {
                    return array (
                        "state" => 200,
                        "info"  => str_replace('1', $cfg_maxAmountWithdraw, $langData['siteConfig'][36][6])
                    );  //每天最多提现1元
                }

            }
        }

        if ($money < $amount) {
            return array ("state" => 200, "info" => $langData['siteConfig'][21][84]);
        }  //帐户余额不足，提现失败！

        if ($bank == 'weixin' && !$openid) {
            return array ("state" => 200, "info" => $langData['siteConfig'][36][7]);  //请先绑定微信账号
        }

        $ordernum = create_ordernum();
        //判断银行卡是否存在
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_withdraw_card` WHERE `uid` = '$did' AND `bank` = '$bank' AND `cardnum` = '$cardnum' AND `usertype` = 1 AND `cardname` = '$cardname'");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $cid = $ret[0]['id'];
        } else {
            //添加银行卡
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw_card` (`uid`, `bank`, `cardnum`, `cardname`, `date`,`usertype`) VALUES ('$did', '$bank', '$cardnum', '$cardname', '$date','1')");
            $cid = $dsql->dsqlOper($sql, "lastid");
        }

        if (is_numeric($cid)) {
            $shouxu  = 0;   //手续费
            $amount_ = $amount;
            $amount_ = sprintf("%.2f", $amount_);

            //会员申请后自动付款
            if (!$cfg_withdrawCheckType && ($bank == 'weixin' || $bank == 'alipay')) {


                //微信提现
                if ($bank == "weixin") {
                    $order = array (
                        'ordernum'           => $ordernum,
                        'openid'             => '',
                        'wechat_mini_openid' => $openid,
                        'name'               => $realname,
                        'amount'             => $amount_
                    );

                    require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayTransfers.php");
                    $wxpayTransfers = new wxpayTransfers();
                    $return         = $wxpayTransfers->transfers($order);

                    if ($return['state'] != 100) {

                        // 加载支付方式操作函数
                        loadPlug("payment");
                        $payment = get_payment("wxpay");
                        //如果网页支付配置的账号失败了，使用APP支付配置的账号重试
					    if($payment['APP_APPID']){
                            require_once(HUONIAOROOT . "/api/payment/wxpay/wxpayTransfers.php");
                            $wxpayTransfers = new wxpayTransfers();
                            $return         = $wxpayTransfers->transfers($order, true);

                            if ($return['state'] != 100) {
                                return $return;
                            }
                        } else {
                            return $return;
                        }

                    }
                } else {

                    if ($realname != $cardname) {
                        return array (
                            "state" => 200,
                            "info"  => $langData['siteConfig'][36][8]
                        );  //申请失败，提现到的账户真实姓名与实名认证信息不一致！
                    }
                    $order = array (
                        'ordernum' => $ordernum,
                        'account'  => $cardnum,
                        'name'     => $cardname,
                        'amount'   => $amount_
                    );

                    require_once(HUONIAOROOT . "/api/payment/alipay/alipayTransfers.php");
                    $alipayTransfers = new alipayTransfers();
                    $return          = $alipayTransfers->transfers($order);

                    if ($return['state'] != 100) {
                        return $return;
                    }
                }

                $rdate      = $return['date'];
                $payment_no = $return['payment_no'];

                $note = '提现成功，付款单号：' . $payment_no;

                //生成提现记录
                $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw` (`uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`, `note`, `rdate`,`proportion`,`price`,`shouxuprice`,`usertype`) VALUES ('$did', '$bank', '$cardnum', '$cardname', '$amount', '$date', 1, '$note', '$rdate','0','$amount_','$shouxu','1')");

                $wid = $dsql->dsqlOper($sql, "lastid");

                if (is_numeric($wid)) {

                    //余额操作&记录
                    $archives = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` - '$amount' WHERE `id` = '$did'");
                    $dsql->dsqlOper($archives, "update");
                    if ($bank == 'weixin'){
                        $bankinfo = '提现-提现到微信';
                    }elseif($bank == 'alipay'){
                        $bankinfo = '提现-提现到支付宝';
                    }else{
                        $bankinfo = '提现-提现到银行卡';
                    }
                    $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$did'");           //查询骑手余额
                    $courieMoney = $dsql->dsqlOper($selectsql,"results");
                    $courierMoney = $courieMoney[0]['money'];
                    $date = GetMkTime(time());
                    $info = $bankinfo;
                    //记录操作日志
                    $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`,`cattype`) VALUES ('$did','0','$amount','$info','$date','$courierMoney','1')");
                    $dsql->dsqlOper($insertsql,"update");
                    //初始化日志
                    include_once(HUONIAOROOT."/api/payment/log.php");
                    $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                    $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
                    $_courierOrderLog->DEBUG('骑手提现:'.$amount.'骑手账户余额剩余:'.$courierMoney);


                    //自定义配置
                    $param = array (
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "withdraw_log_detail",
                        "id"       => $wid
                    );

                    $config = array (
                        "username" => $realname,
                        "amount"   => $amount,
                        "date"     => date("Y-m-d H:i:s", $rdate),
                        "info"     => $note,
                        "fields"   => array (
                            'keyword1' => '提现金额',
                            'keyword2' => '提现时间',
                            'keyword3' => '提现状态'
                        )
                    );

                    //                    updateMemberNotice($userid, "会员-提现申请审核通过", $param, $config);

                    return $wid;
                } else {
                    //如果数据库写入失败，返回字符串，前端跳到提现列表页
                    return 'error';
                }

            }

            //微信通知
            $param = array (
                'type'   => 2, //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => '',
                'notify' => '管理员消息通知',
                'fields' => array (
                    'contentrn' => $realname . ' 骑手账户申请提现：' . $amount,
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("member", "withdraw", $param);

            //生成提现记录
            $sql = $dsql->SetQuery("INSERT INTO `#@__member_withdraw` (`uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`,`proportion`,`price`,`shouxuprice`,`usertype`) VALUES ('$did', '$bank', '$cardnum', '$cardname', '$amount', '$date', 0,'0','$amount_','$shouxu','1')");
            $wid = $dsql->dsqlOper($sql, "lastid");

            if (is_numeric($wid)) {

                $archives = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` - '$amount' WHERE `id` = '$did'");
                $dsql->dsqlOper($archives, "update");
                if ($bank == 'weixin'){
                    $bankinfo = '提现-提现到微信';
                }elseif($bank == 'alipay'){
                    $bankinfo = '提现-提现到支付宝';
                }else{
                    $bankinfo = '提现-提现到银行卡';
                }
                $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$did'");           //查询骑手余额
                $courieMoney = $dsql->dsqlOper($selectsql,"results");
                $courierMoney = $courieMoney[0]['money'];
                $date = GetMkTime(time());
                $info = $bankinfo;
                //记录操作日志
                $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`,`cattype`) VALUES ('$did','0','$amount','$info','$date','$courierMoney','1')");
                $dsql->dsqlOper($insertsql,"update");
                //初始化日志
                include_once(HUONIAOROOT."/api/payment/log.php");
                $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
                $_courierOrderLog->DEBUG('骑手提现:'.$amount.'骑手账户余额剩余:'.$courierMoney);


                return $wid;
            } else {
                return array ("state" => 200, "info" => $langData['siteConfig'][21][85] . '_201');  //提交失败！
            }

        } else {
            return array ("state" => 200, "info" => $langData['siteConfig'][21][85] . '_200');  //提交失败！
        }
    }

    /**
     * Notes: 提现记录
     * Ueser: Administrator
     * DateTime: 2021/9/14 16:14
     * Param1:
     * Param2:
     * Param3:
     * Return:
     *
     * @return array|array[]
     */
    public function courierRecord()
    {
        global $dsql;
        if (!empty($this->param)) {

            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $list     = array ();

        $did = GetCookie("courier"); /*骑手id*/

        if (empty($did)) {
            return array ("state" => 200, "info" => '暂未登录！');
        }
        $archives   = $dsql->SetQuery("SELECT * FROM `#@__member_withdraw` q  WHERE 1=1 AND `uid` = '$did' AND `usertype` = 1");
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil((int)$totalCount / (int)$pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $where  = "";
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        $ret    = $dsql->dsqlOper($archives . $where, "results");

        if ($ret) {
            foreach ($ret as $k => $v) {

            }
        }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * Notes: 收入明细
     * Ueser: Administrator
     * DateTime: 2021/9/14 16:38
     * Param1:
     * Param2:
     * Param3:
     * Return:
     *
     * @return array|array[]
     */
    public function courierIncome()
    {
        global $dsql;
        if (!empty($this->param)) {

            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
            $type     = (int)$this->param['type'];
        }

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $list     = array ();

        $did = GetCookie("courier"); /*骑手id*/
        if (empty($did)) {
            return array ("state" => 200, "info" => '暂未登录！');
        }

        $where = $where1 = $archives1 = '';

//        $archives1 = "SELECT `id`,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,''bank,''amount,''note,'waimai' cattype FROM `#@__waimai_order_all`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$did'  UNION ALL  SELECT `id`,''sid,''ordernumstore,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,''refrundamount,`okdate`,`ordernum`,''bank,''amount,''note,'paotui' cattype FROM `#@__paotui_order`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$did' UNION ALL SELECT `id`,'' sid,''ordernumstore,'' courier_get,'' courier_tuikuan,`state`,'' refrundstate,'' refrundamount,`tdate` okdate,''ordernum,`bank`,`amount`,`note`,'tixian' cattype FROM `#@__member_withdraw`  WHERE 1=1 AND `uid` = '$did' AND `usertype` = 1";

//        $archives1 = "SELECT * FROM (SELECT `id`,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,''bank,''amount,''note,'waimai' cattype,( CASE WHEN `refrundstate` = '1' AND `refrundamount` = '0.00' THEN '外卖退款-' ELSE '外卖收入-' END ) info FROM `#@__waimai_order_all`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$did')waimaiOrder
//        UNION ALL  SELECT * FROM (SELECT `id`,''sid,''ordernumstore,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,''refrundamount,`okdate`,`ordernum`,''bank,''amount,''note,'paotui' cattype,( CASE WHEN `refrundstate` = '0' THEN '跑腿收入-订单号' ELSE '' END ) info FROM `#@__paotui_order`  WHERE 1=1 AND `state` = 1 AND `peisongid` = '$did') paotuiOrder
//        UNION ALL SELECT * FROM (SELECT `id`,'' sid,''ordernumstore,'' courier_get,'' courier_tuikuan,`state`,'' refrundstate,'' refrundamount,`tdate` okdate,''ordernum,`bank`,`amount`,`note`,'tixian' cattype,( CASE WHEN `bank` = 'alipay'  THEN '提现-提现到支付宝'  WHEN `bank` = 'weixin' THEN '提现提现到微信' ELSE '提现提现到银行卡' END ) info  FROM `#@__member_withdraw`  WHERE 1=1 AND `uid` = '$did' AND `usertype` = 1) withdrawOrder
//        UNION ALL SELECT * FROM (SELECT `id`,'' sid,''ordernumstore,'' courier_get,'' courier_tuikuan,`type` state,'' refrundstate,'' refrundamount,`date` okdate,''ordernum,`info` bank,`amount`,'' note,'shouru' cattype,( CASE WHEN `info` != ' '  THEN `info` ELSE ' ' END ) info FROM `#@__member_courier_money`  WHERE 1=1 AND `userid` = '$did') courierOrder WHERE 1 = 1";
        $archives1 = "SELECT * FROM `#@__member_courier_money` WHERE 1 = 1 AND `userid` = '$did' ";
        if ($type == 1) {
//            $where = $where1 = " AND `state` = 1 ";

//            $archives1 = "SELECT `id`,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,''amount,''bank,''note,'waimai' cattype FROM `#@__waimai_order_all`  WHERE 1=1 AND ((`refrundstate` = 0 AND `refrundamount` = 0.00) or (`refrundstate` = 0 AND `refrundamount` != 0.00)) AND `peisongid` = '$did' $where UNION ALL  SELECT `id`,''sid,''ordernumstore, `courier_get`,`courier_tuikuan`,`state`,`refrundstate`,''refrundamount,`okdate`,`ordernum`,''amount,''bank,''note,'paotui' cattype FROM `#@__paotui_order`  WHERE 1=1  AND `peisongid` = '$did' $where";

//            $archives1 = " SELECT * FROM (SELECT `id`,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,''amount,''bank,''note,'waimai' cattype, ( CASE WHEN `refrundstate` = '1' AND `refrundamount` = '0.00' THEN '退款收支-' ELSE '外卖收入-' END ) info FROM `#@__waimai_order_all`  WHERE 1=1  AND `state` = 1  AND ((`refrundstate` = 0 AND `refrundamount` = 0.00) or (`refrundstate` = 0 AND `refrundamount` != 0.00)) AND `peisongid` = '$did' $where)waimaiOrder
//             UNION ALL  SELECT * FROM (SELECT `id`,''sid,''ordernumstore, `courier_get`,`courier_tuikuan`,`state`,`refrundstate`,''refrundamount,`okdate`,`ordernum`,''amount,''bank,''note,'paotui' cattype,( CASE WHEN `refrundstate` = '0' THEN '跑腿收入-订单号' ELSE '' END ) FROM `#@__paotui_order`  WHERE 1=1   AND `state` = 1  AND `peisongid` = '$did' $where)paotuiOrder
//             UNION ALL  SELECT * FROM (SELECT `id`,''sid,''ordernumstore, ''courier_get,''courier_tuikuan,`type` as state,''refrundstate,''refrundamount,`date` okdate,''ordernum,`amount`,`info` bank,''note,'shouru' cattype,( CASE WHEN `info` != ' '  THEN `info` ELSE ' ' END ) info FROM `#@__member_courier_money`  WHERE 1=1  AND `userid` = '$did' AND `type` = 1) courierOrder ";
            $archives1 = "SELECT * FROM `#@__member_courier_money` WHERE 1 = 1 AND `type` = 1 AND `userid` = '$did' ";

        } else {
            if ($type == 2) {

//                $where = " AND `refrundstate` = 1 AND `refrundamount` = 0.00";

//                $archives1 = "SELECT `id` ,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,'' bank,''amount,''note,'waimai' cattype FROM `#@__waimai_order_all`  WHERE 1=1 AND `peisongid` = '$did' $where";
//                $archives1 = " SELECT * FROM (SELECT `id` ,`sid`,`ordernumstore`,`courier_get`,`courier_tuikuan`,`state`,`refrundstate`,`refrundamount`,`okdate`,`ordernum`,'' bank,''amount,''note,'waimai' cattype, ( CASE WHEN `refrundstate` = '1' AND `refrundamount` = '0.00' THEN '退款收支-' ELSE '外卖收入-' END ) info FROM `#@__waimai_order_all`  WHERE 1=1 AND `peisongid` = '$did' $where)waimaiOrder
//             UNION ALL  SELECT * FROM (SELECT `id`,''sid,''ordernumstore, ''courier_get,''courier_tuikuan,`type` as state,''refrundstate,''refrundamount,`date` okdate,''ordernum,`info` bank,`amount`,''note,'shouru' cattype,( CASE WHEN `info` != ' '  THEN `info` ELSE ' ' END ) info FROM `#@__member_courier_money`  WHERE 1=1  AND `userid` = '$did' AND `type` = 0 ) courierOrder";

                $archives1 = "SELECT * FROM `#@__member_courier_money` WHERE 1 = 1 AND `type` = 0 AND `cattype` = 0 AND `userid` = '$did'  ";

            } else {
                if ($type == 3) {

//                    $archives1 = "SELECT `id`, '' courier_get,'' courier_tuikuan,`state`,'' refrundstate,'' refrundamount,`tdate` okdate,''ordernum,`bank`,`amount`,`note`,'tixian' cattype FROM `#@__member_withdraw`  WHERE 1=1 AND `uid` = '$did' AND `usertype` = 1";

//                    $archives1 = "SELECT * FROM (SELECT `id`, '' courier_get,'' courier_tuikuan,`state`,'' refrundstate,'' refrundamount,`tdate` okdate,''ordernum,`bank`,`amount`,`note`,'tixian' cattype,( CASE WHEN `bank` = 'alipay'  THEN '提现-提现到支付宝'  WHEN `bank` = 'weixin' THEN '提现提现到微信' ELSE '提现提现到银行卡' END ) info  FROM `#@__member_withdraw`  WHERE 1=1 AND `uid` = '$did' AND `usertype` = 1)withdrawOrder ";

                    $archives1 = "SELECT * FROM `#@__member_courier_money` WHERE 1 = 1  AND  `type` = 0 AND `cattype` = 1 AND `userid` = '$did'";


                }
            }
        }
        $archives   = $dsql->SetQuery('SELECT * FROM ('.$archives1.') alltable ORDER BY `date` DESC, `id` DESC');
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil((int)$totalCount / (int)$pageSize);

        if ($totalCount == 0) {
            return array ("state" => 200, "info" => '暂无数据！');
        }

        $pageinfo = array (
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $where  = "";
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        $ret    = $dsql->dsqlOper($archives . $where, "results");

        if ($ret) {
            foreach ($ret as $k => $v) {

//                $list[$k]['courier_get']     = sprintf('%.2f',$v['courier_get']) ;
//                $list[$k]['courier_tuikuan'] = sprintf('%.2f',$v['courier_tuikuan']);
//                $list[$k]['state']           = $v['state'];
                $list[$k]['id']              = $v['id'];
//                $list[$k]['bank']            = $v['bank'];
//                $list[$k]['refrundstate']    = $v['refrundstate'];
                $list[$k]['date']            = date('Y-m-d H:i:s', $v['date']);
//                $list[$k]['refrundamount']   = $v['refrundamount'];
//                $list[$k]['ordernum']        = $v['ordernum'];
                $list[$k]['cattype']         = $v['cattype'];
                $list[$k]['type']            = $v['type'];
                $list[$k]['amount']          = $v['amount'];
                $list[$k]['info']            = $v['info'];
                $list[$k]['balance']         = $v['balance'];


//                $cattypename                 = $bank = '';
//                if ($v['cattype'] == 'tixian') {
//
//                    if ($v['bank'] == 'alipay') {
//                        $bank = '支付宝';
//                    } else {
//                        if ($v['bank'] == 'weixin') {
//                            $bank = '微信';
//                        } else {
//                            $bank = '银行卡';
//                        }
//                    }
//                    $cattypename = '提现-提现到' . $bank;
//                } else {
//                    if ($v['cattype'] == 'waimai') {
//
//                        $Sql = $dsql->SetQuery("SELECT `shopname` FROM `#@__waimai_shop` WHERE 1=1 AND `id` = '".$v['sid']."'");
//                        $Res = $dsql->dsqlOper($Sql, "results");
//                        $shopname = $Res ? $Res[0]['shopname'] : '未知';
////                        $cattypename = '外卖收入-'.$shopname.'#' . $v['ordernumstore'];
//                        $cattypename = $v['info'].$shopname.'#' . $v['ordernumstore'];
//
//
//                        if ($v['refrundstate'] == '1' &&$v['refrundamount'] == 0.00) {
////                            $cattypename = '退款支出-' . $shopname.'#' . $v['ordernumstore'];
//                            $cattypename = $v['info']. $shopname.'#' . $v['ordernumstore'];
//
//                        }
//                    } else {
//                        $cattypename = $v['info'] . $v['ordernum'];
//                    }
//                }
//                if ($v['cattype'] == 'shouru'){
//                    $cattypename = $v['info'];
//                    if ($v['state'] == 1){
//                        $list[$k]['courier_get']     = sprintf('%.2f',$v['amount']);
//                    }
//                    if ($v['state'] == 0){
//                        $list[$k]['courier_tuikuan']     = sprintf('%.2f',$v['amount']) ;
//                        $list[$k]['refrundstate']    =  1;
//                        $list[$k]['refrundamount']   = 0.00;
//                    }
//                }
//                $list[$k]['cattypename'] = $cattypename;
//                $list[$k]['bank']        = $v['bank'];
            }
        }

        return array ("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * Notes: 外卖骑手绑定openid
     * Ueser: Administrator
     * DateTime: 2021/9/18 13:32
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function waimaiCourierOpenid()
    {
        global $dsql;
        global $cfg_miniProgramAppid;
        global $cfg_miniProgramAppsecret;
        $param     = $this->param;
        $user_code = $param['code'];
        $did       = $param['did'];

        if(strstr($did, 'wmsj_')){
            
            $_uid = (int)str_replace('wmsj_', '', $did);
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = '$_uid'");
            $ret = $dsql->dsqlOper($sql, "results");

            if (empty($ret)) {
                return array ("state" => 200, "info" => '未找到该用户！');
            }

        }else{
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE `id` = '$did'");
            $ret = $dsql->dsqlOper($sql, "results");

            if (empty($ret)) {
                return array ("state" => 200, "info" => '未找到该骑手！');
            }
        }

        if ($user_code == '') {
            return array ("state" => 200, "info" => '参数错误');
        }

        $url = "https://api.weixin.qq.com/sns/jscode2session?appid=" . $cfg_miniProgramAppid . "&secret=" . $cfg_miniProgramAppsecret . "&js_code=" . $user_code . "&grant_type=authorization_code";

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);//证书检查
        $result = curl_exec($curl);
        curl_close($curl);

        $data = json_decode($result);
        $data = objtoarr($data);

        // $_wxMiniProgramConnectLog->DEBUG('用户信息：' . json_encode($userData));
        // $_wxMiniProgramConnectLog->DEBUG('解析结果：' . json_encode($data));

        //失败
        if (isset($data['errcode'])) {
            return array ("state" => 200, "info" => "ErrCode:" . $data['errcode'] . "，ErrMsg:" . $data['errmsg']);
        }

        $openid = $data['openid'];

        if(strstr($did, 'wmsj_')){
            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `wechat_mini_openid` = '$openid' WHERE `id` = '$_uid'");
            $ret = $dsql->dsqlOper($sql, "update");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `openid` = '$openid' WHERE `id` = '$did'");
            $ret = $dsql->dsqlOper($sql, "update");
        }

        if ($ret == 'ok') {
            return '绑定成功';
        } else {
            return array ("state" => 200, "info" => '绑定失败！');
        }

    }

    /**
     * Notes: 骑手获取openid
     * Ueser: Administrator
     * DateTime: 2021/9/23 10:15
     * Param1:
     * Param2:
     * Param3:
     * Return:
     *
     * @return array
     */
    public function getCourierOpenid()
    {
        global $dsql;
        global $langData;
        global $userLogin;

        $param     = $this->param;
        if (!empty($param)) {
            $did     = $param['did'];
        } else {
            return array("state" => 200, "info" => '参数错误');
        }

        $Sql = $dsql->SetQuery("SELECT `openid` FROM `#@__waimai_courier` WHERE 1=1 AND `id` = '$did'");
        $Res = $dsql->dsqlOper($Sql, "results");

        if ($Res) {
            if ($Res[0]['openid'] == '') {
                return array("state" => 200, "info" => '未绑定微信！');
            } else {
                return $Res[0]['openid'];
            }

        } else {
            return array ("state" => 200, "info" => '未查到该骑手信息！');
        }

    }

    /**
     * Notes: 商家获取openid
     * Ueser: Administrator
     * DateTime: 2021/9/23 10:15
     * Param1:
     * Param2:
     * Param3:
     * Return:
     *
     * @return array
     */
    public function getWmsjOpenid()
    {
        global $dsql;
        global $langData;
        global $userLogin;

        $param     = $this->param;
        if (!empty($param)) {
            $did     = $param['did'];
        } else {
            return array("state" => 200, "info" => '参数错误');
        }

        $Sql = $dsql->SetQuery("SELECT `wechat_mini_openid` FROM `#@__member` WHERE 1=1 AND `id` = '$did'");
        $Res = $dsql->dsqlOper($Sql, "results");

        if ($Res) {
            if ($Res[0]['wechat_mini_openid'] == '') {
                return array("state" => 200, "info" => '未绑定微信！');
            } else {
                return $Res[0]['wechat_mini_openid'];
            }

        } else {
            return array ("state" => 200, "info" => '未查到该用户信息！');
        }

    }

//    public function courierbug()
//     {
//         global $userLogin;

//         global $dsql;

//         $today  = strtotime('2021-10-27 00:00:00');

//         $endday = strtotime('2021-10-28 11:14:00');

//         // $todaysql = $dsql->SetQuery("SELECT o.`id`,o.`ordernum`,o.`sid`,o.`peisongid` FROM `#@__waimai_order_all` o WHERE 1=1 AND `okdate` >= $today AND `okdate` <= $endday AND `state` =1");
//         // $todayres = $dsql->dsqlOper($todaysql,"results");


//         // if ($todayres){
//         //     foreach ($todayres as $k => $v) {
//         //         $staticmoney = getwaimai_staticmoney('4', $v['id']);

//         //         file_put_contents('courierbug.txt',$v['id'].PHP_EOL,FILE_APPEND);
//         //     }
//         // }
//         $inc = HUONIAOINC . "/config/waimai.inc.php";
//         include $inc;

//         $sql = $dsql->SetQuery("SELECT `id`,`amount`,`lng`,`lat`,`buylng`,`buylat`,`peidate`,`okdate`,`tip`,`courierfencheng`,`peisongid` FROM `#@__paotui_order` WHERE 1 = 1 AND `okdate` >= $today AND `okdate` <= $endday AND `state` =1");
//         $ret = $dsql->dsqlOper($sql, "results");
//         if ($ret) {
//             foreach ($ret as $k => $v){
//                 $lng               = $v['lng'];
//                 $lat               = $v['lat'];
//                 $courierfencheng   = $v['courierfencheng'];
//                 $buylng     = $v['buylng'];
//                 $buylat     = $v['buylat'];
//                 $peidate    = $v['peidate'];
//                 $okdate     = $v['okdate'];
//                 $tip        = $v['tip'];
//                 $did        = $v['peisongid'];
//                 $amount     = $v['amount'];
//                 /*配送结算*/
//                 /*商城距离用户*/
//                 $shopjluser = getDistance($buylng, $buylat, $lng, $lat) / 1000;
//                 /*骑手完成时间 从骑手接单时间开始计算*/
//                 $qsoktime = ($okdate - $peidate) % 86400 / 60;

//                 /*骑手额外所得*/
//                 $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
//                 /*外卖额外加成要求*/
//                 $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

//                 if ($did) {
//                     $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`, `name`, `phone`,`getproportion`,`paotuiportion` FROM `#@__waimai_courier` WHERE `id` = $did");
//                     $ret = $dsql->dsqlOper($sql, "results");
//                     if (!$ret) {
//                         return array ("state" => 200, "info" => '骑手不存在！');
//                     } else {
//                         $paotuiportion = $ret[0]['paotuiportion'];
//                     }
//                 }
//                 $courierfencheng = $paotuiportion != '0.00' ? $paotuiportion : $custompaotuiCourierP;
//                 $courreward = ($amount - $tip) * $courierfencheng / 100;

//                 sort($waimaadditionkm);
//                 $satisfy = $additionprice = 0;
//                 for ($i = 0; $i < count($waimaadditionkm); $i++) {
//                     if ($shopjluser > $waimaadditionkm[$i][0] && $shopjluser <= $waimaadditionkm[$i][2] && $qsoktime <= $waimaadditionkm[$i][1]) {
//                         $satisfy = 1;
//                         break;
//                     }
//                 }

//                 if ($satisfy == 1) {

//                     for ($a = 0; $a < count($waimaiorderprice); $a++) {

//                         if ($amount >= $waimaiorderprice[$a][0] && $amount <= $waimaiorderprice[$a][1]) {
//                             $additionprice = $waimaiorderprice[$a][2];
//                         }
//                     }
//                 }
//                 $courierarr = array ();

//                 $courierarr['peisongTotal']    = $amount;              /*配送费*/
//                 $courierarr['courierfencheng'] = $courierfencheng;     /*骑手分成*/
//                 $courierarr['shopjluser']      = $shopjluser;          /*商城距离用户*/
//                 $courierarr['qsoktime']        = $qsoktime;            /*骑手完成用时*/
//                 $courierarr['amount']          = $amount;              /*订单总金额*/
//                 $courierarr['additionprice']   = $additionprice;       /*骑手加成所得*/
//                 $courierarr['tip']             = $tip;                 /*小费*/

//                 $courierarr = serialize($courierarr);
//                 $courreward += $additionprice;
//                 $courreward += $tip; /*小费*/
//                 $waimaiordersql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `courier_gebili` = '$courierarr',`courier_get` = '$courreward',`courierfencheng` = '$courierfencheng'  WHERE `id` = '".$v['id']."'");

//                 $dsql->dsqlOper($waimaiordersql, "update");


//                 $updatesql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money`+'$courreward' WHERE `id` = '$did'");
//                 $dsql->dsqlOper($updatesql, "update");
//             }
//         }
//     }


    //跑腿最新订单轮播
    //最近三天数据
    public function paotuiLastOrder(){
        global $dsql;

        //三天内
        $time = GetMkTime(time()) - 86400 * 3;

        $list = array();
        $sql = $dsql->SetQuery("SELECT `uid`, `type`, `shop`, `person`, `pubdate` FROM `#@__paotui_order` WHERE `pubdate` > $time AND (`state` = 1 OR `state` = 3 OR `state` = 4 OR `state` = 5) ORDER BY `id` DESC");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach($ret as $key => $val){

                $shop = $val['type'] == 1 ? $val['shop'] : '';

                //智能截取关键字
                if(mb_strlen($shop) > 6){
                    $description = $keywords = '';
                    $autoKeywords = AnalyseHtmlBody($shop, $description, $keywords, '');
                    $keywords = trim($keywords);
                    $keywordsArr = explode(' ', $keywords);
                    $shop = $keywordsArr[0];
                }

                //再次对超出字数的内容截取
                if(mb_strlen($shop) > 6){
                    $shop = cn_substrR($shop, 6);
                }

                //去掉帮我买的内容中的第一个买字
                if($val['type'] == 1 && cn_substrR($shop, 1) == '买'){
                    $shop = mb_substr($shop, 1);
                }

                //获取头像
                $photo = getFilePath('/static/images/noPhoto_60.jpg');
                $sql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE `id` = " . $val['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $photo = $ret[0]['photo'] ? getFilePath($ret[0]['photo']) : $photo;
                }

                array_push($list, array(
                    'photo' => $photo,
                    'name' => cn_substrR($val['person'], 1) . '**',
                    'type' => (int)$val['type'],
                    'shop' => $shop,
                    'pubdate' => date('m月d日 H:i', $val['pubdate'])
                ));
            }
        }

        return $list;
    }

}
