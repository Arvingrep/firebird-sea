<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 家政模块API接口
 *
 * @version        $Id: homemaking.class.php 2019-04-01 上午09:31:13 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class homemaking {
    private $param;  //参数

    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array()){
        $this->param = $param;
    }

    /**
     * 自助建站基本参数
     * @return array
     */
    public function config(){

        require(HUONIAOINC."/config/homemaking.inc.php");

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
        // global $customLogoUrl;            //logo地址
        // global $customSubDomain;          //访问方式
        // global $customChannelSwitch;      //模块状态
        // global $customCloseCause;         //模块禁用说明
        // global $customSeoTitle;           //seo标题
        // global $customSeoKeyword;         //seo关键字
        // global $customSeoDescription;     //seo描述
        global $hotline_config;           //咨询热线配置
        // global $customHotline;            //咨询热线
        // global $custom_map;               //自定义地图
        // global $customTemplate;           //模板风格

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
        if(is_array($siteCityInfo)){
            $cityName = $siteCityInfo['name'];
        }

        if(empty($custom_map)) $custom_map = $cfg_map;

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

        $params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

        // $domainInfo = getDomain('car', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('homemaking', $customSubDomain);

        //分站自定义配置
        $ser = 'homemaking';
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
        if(!empty($params) > 0){

            foreach($params as $key => $param){
                if($param == "channelName"){
                    $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
                }elseif($param == "logoUrl"){

                    //自定义LOGO
                    if($customLogo == 1){
                        $customLogo = getAttachemntFile($customLogoUrl);
                    }else{
                        $customLogo = getAttachemntFile($cfg_weblogo);
                    }

                    $return['logoUrl'] = $customLogo;
                }elseif($param == "subDomain"){
                    $return['subDomain'] = $customSubDomain;
                }elseif($param == "channelDomain"){
                    $return['channelDomain'] = $customChannelDomain;
                }elseif($param == "channelSwitch"){
                    $return['channelSwitch'] = $customChannelSwitch;
                }elseif($param == "closeCause"){
                    $return['closeCause'] = $customCloseCause;
                }elseif($param == "title"){
                    $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
                }elseif($param == "keywords"){
                    $return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
                }elseif($param == "description"){
                    $return['description'] = str_replace('$city', $cityName, $customSeoDescription);
                }elseif($param == "hotline"){
                    $return['hotline'] = $hotline;
                }elseif($param == "template"){
                    $return['template'] = $customTemplate;
                }elseif($param == "touchTemplate"){
                    $return['touchTemplate'] = $customTouchTemplate;
                }elseif($param == "map"){
                    $return['map'] = $custom_map;
                }elseif($param == "template"){
                    $return['template'] = $customTemplate;
                }elseif($param == "softSize"){
                    $return['softSize'] = $custom_softSize;
                }elseif($param == "softType"){
                    $return['softType'] = $custom_softType;
                }elseif($param == "thumbSize"){
                    $return['thumbSize'] = $custom_thumbSize;
                }elseif($param == "thumbType"){
                    $return['thumbType'] = $custom_thumbType;
                }
            }

        }else{

            //自定义LOGO
            if($customLogo == 1){
                $customLogo = getAttachemntFile($customLogoUrl);
            }else{
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
            $return['template']      = $customTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['storeatlasMax'] = $custom_store_atlasMax;
            $return['homemakingatlasMax']   = $custom_homemaking_atlasMax;

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
            $return['homemakingTag']        = $homemakingTag_;

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
            $return['homemakingFlag']        = $homemakingFlag_;

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
            $return['refundReason']        = $refundReason_;

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
            $return['afterSalesType']        = $afterSalesType_;
        }

        return $return;

    }

    /**
     * 城市分类
     * @return array
     */
    public function city(){
        $userLogin = new userLogin($dbo);
        $adminCityArr = $userLogin->getAdminCity();
        $results = empty($adminCityArr) ? array() : $adminCityArr;
        if($results){
            return $results;
        }
    }

    /**
     * 家政分类
     * @return array
     */
    public function type(){
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $type     = (int)$this->param['type'];
                $value    = (int)$this->param['value'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "homemaking_type", $son, $page, $pageSize);
        $list = array();
        if($results){
            if($value){
                foreach ($results as $key => $value) {
                    $list[$key]['id']    = $value['id'];
                    $list[$key]['value'] = $value['typename'];
                }
                return $list;
            }else{
                return $results;
            }
        }
    }

    /**
     * 固定字段
     */
    public function homemakingitemList(){
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $store = $addrid = $typeid = $title = $orderby = $page = $pageSize = $where = $where1 = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $son      = $this->param['son'] ? $this->param['son'] : false;
                $type     = (int)$this->param['type'];
                $chidren  = $this->param['chidren'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];

                $title = $title ? $title : $keywords;
            }
        }

        if($son && empty($type)){
            $where .= " AND `parentid` = 0";
        }elseif(!empty($type)){
            $where .= " AND `parentid` = '$type'";
        }

        $order = " ORDER BY `weight` DESC, `pubdate` DESC, `id` DESC";

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT  `id`, `parentid`, `typename`, `weight`, `pubdate` FROM `#@__homemakingitem` WHERE 1=1 ".$where);
        $archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__homemakingitem` WHERE 1=1 ".$where);

        //总条数
        $totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
        $totalCount = (int)$totalResults[0][0];

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);   //暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']    = $val['id'];
                $list[$key]['value'] = $val['typename'];
                $list[$key]['parentid']    = $val['parentid'];
                $list[$key]['typename']    = $val['typename'];
                $list[$key]['weight']      = $val['weight'];
                $list[$key]['pubdate']     = $val['pubdate'];

                if($chidren){
                    $lower = [];
                    $param['type']    = $val['id'];
                    $param['orderby'] = 3;
                    $param['page']    = 1;
                    $param['pageSize'] = 9999;
                    $this->param = $param;
                    $child = $this->typeList();

                    if(!isset($child['state']) || $child['state'] != 200){
                        $lower = $child['list'];
                    }

                    $list[$key]['lower'] = $lower;
                }

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 信息地区
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
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {
            //数据共享
            require(HUONIAOINC."/config/homemaking.inc.php");
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
     * 商家列表
     */
    public function storeList(){
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $search   = $this->param['search'];
                $typeid   = (int)$this->param['typeid'];
                $addrid   = (int)$this->param['addrid'];
                $orderby  = (int)$this->param['orderby'];
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
                $u        = (int)$this->param['u'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $where = " AND `state` = 1";

        //数据共享
        require(HUONIAOINC."/config/homemaking.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            //遍历区域
            if($cityid){
                $where .= " AND `cityid` = '$cityid'";
            }
        }

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
        }

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

        if(!empty($search)){

            siteSearchLog("homemaking", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__homemaking_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `user`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `address` like '%$search%' OR `userid` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND (`title` like '%$search%' OR `address` like '%$search%')";
            }
        }

        //地图可视区域内
        if(!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)){
            $where .= " AND `lng` <= '".$max_longitude."' AND `lng` >= '".$min_longitude."' AND `lat` <= '".$max_latitude."' AND `lat` >= '".$min_latitude."'";
        }

        //查询距离
        if((!empty($lng))&&(!empty($lat))){
            // $select="ROUND(
            //     6378.138 * 2 * ASIN(
            //         SQRT(POW(SIN(($lat * PI() / 180 - l.`lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(l.`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - l.`lng` * PI() / 180) / 2), 2))
            //     ) * 1000
            // ) AS distance,";
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lat."-`lat`)/360),2)+COS(3.1415926535898*".$lat."/180)* COS(`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lng."-`lng`)/360),2))))*1000 AS distance,";
        }else{
            $select="";
        }

        //排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `rec` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `rec` DESC, `weight` DESC, `id` DESC";
                break;
            //推荐排序
            case 3:
                $orderby_ = " ORDER BY `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC";
                break;
            //距离排序
            case 4:
                if((!empty($lng))&&(!empty($lat))){
                    $orderby_ = " ORDER BY distance ASC";
                }
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `rec` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $arc = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("homemaking_store_total", $arc, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $archives = $dsql->SetQuery("SELECT `title`, `pubdate`, `pics`,`lat`,`lng`,`id`,`userid`, `typeid`, `address`, `tel`, `tag`, `addrid`, ".$select." `rec` FROM `#@__homemaking_store` WHERE 1 = 1".$where);
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("homemaking_store_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['address']   = $val['address'];
                $list[$key]['tel']       = $val['tel'];
                $list[$key]['lng']       = $val['lng'];
                $list[$key]['lat']       = $val['lat'];
                $list[$key]['rec']       = $val['rec'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]['pubdate']       = $val['pubdate'];

                $list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                if(strpos($list[$key]['distance'],'千米')){
                    $list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
                }elseif(strpos($list[$key]['distance'],'米')){
                    $list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
                }

                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemaking_type` WHERE `id` = ".$val['typeid']);
                $ret = $dsql->dsqlOper($sql, "results");
                $list[$key]['typename']   = $ret[0]['typename'];

                $imglist = array();
                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    $list[$key]['litpic'] = getFilePath($pics[0]);
                }else{
                    $sql = $dsql->SetQuery("SELECT `pics` FROM `#@__homemaking_list` WHERE `company` = ".$val['id']." AND `state` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        if($ret[0]['pics']){
                            $pics = explode(",", $ret[0]['pics']);
                        }
                        $list[$key]['litpic'] = $pics[0]? getFilePath($pics[0]) : "/static/images/404.jpg";
                    }else{
                        $list[$key]['litpic'] = "/static/images/404.jpg";
                    }
                }

                $homemakingnum = 0;
                $archives   = $dsql->SetQuery("SELECT `sale` FROM `#@__homemaking_list` WHERE  `state` = 1 and `company` = ".$val['id']);
                $totalCount = $dsql->dsqlOper($archives, "results");
                foreach ($totalCount as $k => $value) {
                    $homemakingnum += $value['sale'];
                }
                $list[$key]['homemakingnum']   = $homemakingnum;

                if(!empty($val['addrid'])){
                    $addrName = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data = "";
                    $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                    $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                    $list[$key]['addrname']  = $addrArr;
                }else{
                    $list[$key]['addrname'] = "";
                }

                $tagArr = array();
                if(!empty($val['tag'])){
                    $tag = explode("|", $val['tag']);
                    foreach ($tag as $v) {
                        $tagArr['jc'][] = $v;
                        $tagArr['py'][] = GetPinyin($v);
                    }
                }
                $list[$key]['tagAll'] = $tagArr;

                $param = array(
                    "service" => "homemaking",
                    "template" => "store-detail",
                    "id" => $val['id']
                );
                $url = getUrlPath($param);

                $list[$key]['url'] = $url;
            }
            if($orderby==5){//团购数量
                array_multisort(array_column($list,'homemakingnum'),SORT_DESC,$list);
            }

        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 商家详细
     * @return array
     */
    public function storeDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        $id = $id == 0 ? '' : $id;

        if(!is_numeric($id) && $uid == -1){
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }

        $where = " AND `state` = 1";
        if(!is_numeric($id)){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = ".$uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $id = $results[0]['id'];
                $where = "";
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][8][1]);//该会员暂未开通商铺
            }
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `typeid`, `addrid`, `pics`, `address`, `flag`, `cityid`, `lng`, `lat`, `opentime`, `tel`, `click`, `state`, `tag`, `retreat`, `rec`,`is_vipguanggao`, `refuse` FROM `#@__homemaking_store` WHERE `id` = ".$id.$where);
        $results  = getCache("homemaking_store_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]         = $results[0]['id'];
            $storeDetail["title"]      = $results[0]['title'];
            $storeDetail['cityid']     = $results[0]['cityid'];
            $storeDetail["lng"]        = $results[0]['lng'];
            $storeDetail["lat"]        = $results[0]['lat'];
            $storeDetail["tel"]        = $results[0]['tel'];
            $storeDetail["opentime"]   = $results[0]['opentime'];
            $storeDetail["click"]      = $results[0]['click'];
            $storeDetail["state"]      = $results[0]['state'];
            $storeDetail["refuse"]     = $results[0]['refuse'];
            $storeDetail["tag"]        = $results[0]['tag'];
            $storeDetail["rec"]        = $results[0]['rec'];
            $storeDetail["retreat"]    = $results[0]['retreat'];
            $storeDetail["userid"]     = $results[0]['userid'];
            $storeDetail["is_vipguanggao"]     = $results[0]['is_vipguanggao'];

            $opentimeArr = explode("-", $results[0]["opentime"]);
            $storeDetail['openStart']  = $opentimeArr[0];
            $storeDetail['openEnd']    = $opentimeArr[1];
            $openStartArr = explode(":", $opentimeArr[0]);
            $openEndArr   = explode(":", $opentimeArr[1]);
            $storeDetail['opentimename'] = $openStartArr[0] . '时' . $openStartArr[1] . '分-' . $openEndArr[0] . '时' . $openEndArr[1] . '分';

            $tagArr = array();
            $tagArr_ = $results[0]['tag'] ? explode('|', $results[0]['tag']) : array();
            if($tagArr_){
                foreach ($tagArr_ as $k => $v) {
                    $tagArr[$k] = array(
                        "py" => GetPinyin($v),
                        "val" => $v
                    );
                }
            }
            $storeDetail["tagArr"] = $tagArr;

            $storeDetail["tag_Arr"] = $tagArr_;

            //会员信息
            $uid = $results[0]['userid'];
            $storeDetail['member']     = getMemberDetail($uid);

            $storeDetail["typeid"]     = $results[0]['typeid'];
            global $data;
            $data = "";
            $tuantype = getParentArr("homemaking_type", $results[0]['typeid']);
            if($tuantype){
                $tuantype = array_reverse(parent_foreach($tuantype, "typename"));
                $storeDetail['typename'] = join(" > ", $tuantype);
                $storeDetail['typenameonly'] = count($tuantype) > 2 ? $tuantype[1] : $tuantype[0];
            }else{
                $storeDetail['typename'] = "";
                $storeDetail['typenameonly'] = "";
            }

            $flagArr = array();
            if($results[0]['flag']){
                $sql = $dsql->SetQuery("SELECT `id`, `typename`, `description`, `litpic` FROM `#@__homemaking_authattr` where `id` in (".$results[0]['flag'].")");
                $res = $dsql->getTypeName($sql);
                if($res){
                    foreach ($res as $k => $row) {
                        $flagArr[$k] = array(
                            "py" => GetPinyin($row['typename']),
                            "val" => $row['typename'],
                            "description" => $row['description'],
                            "litpic" => $row['litpic'] ? getFilePath($row['litpic']) : '',
                        );
                    }
                }
            }
            $storeDetail["flagArr"] = $flagArr;

            $storeDetail["addrid"]  = $addrid = $results[0]['addrid'];
            $archives = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = '$addrid'");
            $ret = $dsql->dsqlOper($archives, "results");
            if($ret){
                $storeDetail["circleAddrid"] = $ret[0]['parentid'];
            }
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $storeDetail['addrname']  = $addrArr;

            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "id"));
            $storeDetail['city'] = count($addrArr) > 2 ? $addrArr[1] : $addrArr[0];
            $storeDetail["address"]    = $results[0]['address'];

            //验证是否已经收藏
            $params = array(
                "module" => "homemaking",
                "temp"   => "store-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;

            $param = array(
                "service" => "homemaking",
                "template" => "store-detail",
                "id" => $id
            );
            $url = getUrlPath($param);
            $storeDetail['url'] = $url;

            //图集
            $imglist = array();
            $pics = $results[0]['pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['path'] = getFilePath($value);
                    $imglist[$key]['pathSource'] = $value;
                }
            }
            $storeDetail['pics'] = $imglist;

            $archives = $dsql->SetQuery("SELECT  `price` FROM `#@__homemaking_list` WHERE 1 = 1 AND `company` = '$id' AND `state` = 1 ORDER BY `price` ASC");

            $results  = $dsql->dsqlOper($archives,"results");

            $storeDetail['price'] = $results[0]['price'];
        }//print_R($storeDetail);exit;
        return $storeDetail;
    }

    /**
     * 配置商铺
     * @return array
     */
    public function storeConfig(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $userid      = $userLogin->getMemberID();
        $param       = $this->param;
        $title       = filterSensitiveWords(addslashes($param['title']));
        $addrid      = (int)$param['addrid'];
        $cityid      = (int)$param['cityid'];
        $typeid      = (int)$param['typeid'];
        $address     = $param['address'];
        $lnglat      = $param['lnglat'];
        $tel         = $param['tel'];
        $pics        = $param['pics'];
        $openStart   = $param['openStart'];
        $openEnd     = $param['openEnd'];
        $opentime    = $openStart . '-' . $openEnd;
        $lnglat = explode(',', $lnglat);
        $lng = $lat = '';
        if($lnglat){
            $lng = $lnglat[0];
            $lat = $lnglat[1];
        }
        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }
        $retreat     = (int)$param['retreat'];

        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['userType'] != 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][2]);//账号验证错误，操作失败
        }

        //权限验证
        if(!verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败
        }

        if(empty($title)){
            return array("state" => 200, "info" => $langData['homemaking'][8][4]);//请填写公司名称
        }

        if(empty($cityid)){
            return array("state" => 200, "info" => $langData['homemaking'][8][5]);//请选择所在地区
        }

        if(empty($tel)){
            return array("state" => 200, "info" => $langData['homemaking'][8][6]);//请填写联系方式
        }

        if(empty($pics)){
            return array("state" => 200, "info" => $langData['homemaking'][8][7]);//请上传图集
        }

        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //入驻审核开关
        include HUONIAOINC."/config/business.inc.php";
        $moduleJoinCheck = (int)$customModuleJoinCheck;
        $editModuleJoinCheck = (int)$customEditModuleJoinCheck;

        //新商铺
        if(!$userResult){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_store` (`cityid`, `title`, `userid`, `typeid`, `addrid`, `address`, `lng`, `lat`, `tel`, `pics`, `opentime`, `tag`, `retreat`, `state`, `pubdate`, `weight`) VALUES ('$cityid', '$title', '$userid', '$typeid', '$addrid', '$address', '$lng', '$lat', '$tel', '$pics', '$opentime', '$tag', '$retreat', '$moduleJoinCheck', '$pubdate', 1)");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    "service"  => "homemaking",
                    "template" => "store-detail",
                    "id"       => $aid
                );
                $url = getUrlPath($urlParam);

                //记录用户行为日志
                memberLog($userid, 'homemaking', 'store', $aid, 'insert', '申请店铺('.$title.')', $url, $archives);

                //后台消息通知
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userDetail['username'].'新增商铺: '.$title.'等待审核',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("homemaking", "store",$param);

                updateCache("homemaking_store_list", 300);
                clearCache("homemaking_store_total", 'key');
                dataAsync("homemaking",$aid,"store");  // 家政、商家、新增

                return $langData['homemaking'][8][8];//配置成功，您的商铺正在审核中，请耐心等待！
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][8][9]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }else{
            if($typeid){
                $where = " `typeid` = '$typeid',";
            }
            if($pics){
                $where .= " `pics` = '$pics',";
            }
            if($opentime){
                $where .= " `opentime` = '$opentime',";
            }
            if($tag){
                $where .= " `tag` = '$tag',";
            }
            $retreat = $retreat ? $retreat : 0;
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_store` SET `cityid` = '$cityid', `retreat` = '$retreat', `title` = '$title',  `tel` = '$tel', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `addrid` = '$addrid', $where `state` = '$editModuleJoinCheck' WHERE `userid` = ".$userid);
            $results = $dsql->dsqlOper($archives, "update");

            if($results == "ok"){

                $urlParam = array(
                    "service"  => "homemaking",
                    "template" => "store-detail",
                    "id"       => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);

                //记录用户行为日志
                memberLog($userid, 'homemaking', 'store', $userResult[0]['id'], 'update', '配置店铺信息('.$title.')', $url, $archives);

                // 检查缓存
                $id = $userResult[0]['id'];
                checkCache("homemaking_store_list", $id);
                clearCache("homemaking_store_detail", $id);
                clearCache("homemaking_store_total", 'key');
                dataAsync("homemaking",$id,"store");  // 家政、商家、更新

                return $langData['homemaking'][8][10];//保存成功！
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][8][9]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }

    }

    /**
     * 服务人员列表
     */
    public function personalList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $u        = $this->param['u'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND p.`state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/homemaking.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `state` = 1 AND `cityid` = $cityid");
                    $results = $dsql->dsqlOper($archives, "results");
                    if(is_array($results)){
                        foreach ($results as $key => $value) {
                            $sidArr[$key] = $value['id'];
                        }
                        if(!empty($sidArr)){
                            $where .= " AND p.`company` in (".join(",",$sidArr).")";
                        }else{
                            $where .= " AND 0 = 1";
                        }
                    }else{
                        $where .= " AND 0 = 1";
                    }
                }
            }
        }else{
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND p.`company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND p.`state` = ".$state;
            }
        }

        if($store){
            $where .= " AND p.`company` = '$store'";
        }

        //排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY p.`click` DESC, p.`weight` DESC, p.`id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY p.`pubdate` DESC, p.`weight` DESC, p.`id` DESC";
                break;
            default:
                $orderby_ = " ORDER BY p.`weight` DESC, p.`id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $arc = $dsql->SetQuery("SELECT p.`id` FROM `#@__homemaking_personal` p LEFT JOIN `#@__member` m ON m.`id` = p.`userid` WHERE 1 = 1 AND m.`id` IS NOT NULL".$where);
        //总条数
        $totalCount = getCache("homemaking_personal_total", $arc, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $archives = $dsql->SetQuery("SELECT p.`id`, p.`userid`, p.`company`, p.`pubdate`, p.`click`, m.`username`, m.`nickname`, m.`phone`, m.`photo` FROM `#@__homemaking_personal` p LEFT JOIN `#@__member` m ON m.`id` = p.`userid` WHERE 1 = 1 AND m.`id` IS NOT NULL".$where);
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql     = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("homemaking_personal_list", $sql, 300, array("disabled" => $u));
        if($results){
            $i = 0;
            foreach($results as $key => $val){
                $list[$i]['id']          = $val['id'];
                $list[$i]['userid']      = $val['userid'];
                $list[$i]['company']     = $val['company'];
                $list[$i]['pubdate']     = $val['pubdate'];
                $list[$i]['click']       = $val['click'];
                $list[$i]['username']    = $val['nickname'] ? $val['nickname'] : $val['username'];
                $list[$i]['tel']         = $val['phone'] ? $val['phone'] : '';
                $list[$i]['photo']       = $val['photo'] ? getFilePath($val['photo']) : '';

                $lower = [];
                $param['id']    = $val['company'];
                $this->param    = $param;
                $store          = $this->storeDetail();
                if(!empty($store)){
                    $lower = $store;
                }
                $list[$i]['store'] = $lower;
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE (`orderstate`!=6 or `orderstate`!=9 or `orderstate`!=8 or `orderstate`!=0 or `orderstate`!=3) AND `dispatchid` = " . $val['id']);
                $totalOnlineCount = $dsql->dsqlOper($sql, "totalCount");
                $list[$i]['onlineorder']  = $totalOnlineCount;

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE `orderstate`=11 AND `dispatchid` = " . $val['id']);
                $totalEndCount = $dsql->dsqlOper($sql, "totalCount");
                $list[$i]['endorder']     = $totalEndCount;

                $param = array(
                    "service" => "homemaking",
                    "template" => "personal-detail",
                    "id" => $val['id']
                );
                $url = getUrlPath($param);
                $list[$i]['url'] = $url;
                $i++;
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 服务人员详细
     * @return array
     */
    public function personalDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `click`, `company`,`state` FROM `#@__homemaking_personal` WHERE `id` = ".$id.$where);
        $results  = getCache("homemaking_personal_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]         = $results[0]['id'];
            $storeDetail["click"]      = $results[0]['click'];
            $storeDetail["userid"]     = $results[0]['userid'];
            $storeDetail["state"]      = $results[0]['state'];
            $storeDetail["company"]    = $results[0]['company'];
            $storeDetail['pubdate']    = $val['pubdate'];

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE `orderstate`!=10 AND `orderstate`!=8 AND `orderstate`!=0 AND `orderstate`!=3 AND `dispatchid` = " . $results[0]['id']);
            $totalOnlineCount = $dsql->dsqlOper($sql, "totalCount");
            $storeDetail['onlineorder']  = $totalOnlineCount;

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE `orderstate`=6 AND `dispatchid` = " . $results[0]['id']);
            $totalEndCount = $dsql->dsqlOper($sql, "totalCount");
            $storeDetail['endorder']     = $totalEndCount;

            //获取用户信息
            $uid       = $results[0]['userid'];
            $memberArr = array();
            $sql = $dsql->SetQuery("SELECT `nickname`, `username`, `phone`, `phone` FROM `#@__member` WHERE `id` = " . $uid);
            $memberArr = $dsql->dsqlOper($sql, "results");
            if($memberArr){
                $memberArr = $memberArr[0];
                $storeDetail['username']    = $memberArr['nickname'] ? $memberArr['nickname'] : $memberArr['username'];
                $storeDetail['tel']         = $memberArr['phone'] ? $memberArr['phone'] : '';
                $storeDetail['photo']       = $memberArr['photo'] ? getFilePath($memberArr['photo']) : '';
            }

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            //验证是否已经收藏
            $params = array(
                "module" => "homemaking",
                "temp"   => "personal-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;

        }
        return $storeDetail;
    }

    /**
     * 保姆/月嫂列表
     */
    public function nannyList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = (int)$this->param['store'];
                $state    = $this->param['state'];
                $type     = (int)$this->param['type'];
                $typeid   = (int)$this->param['typeid'];
                $salary   = $this->param['salary'];
                $naturedesc= $this->param['naturedesc'];
                $age      = $this->param['age'];
                $experience  = (int)$this->param['experience'];
                $u        = (int)$this->param['u'];
                $addrid   = (int)$this->param['addrid'];
                $orderby  = (int)$this->param['orderby'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $title  = $this->param['title'];

            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/homemaking.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    $where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `state` = 1 AND `cityid` = $cityid");
                    $results = $dsql->dsqlOper($archives, "results");
                    if(is_array($results)){
                        foreach ($results as $key => $value) {
                            $sidArr[$key] = $value['id'];
                        }
                        if(!empty($sidArr)){
                            $where .= " AND `company` in (".join(",",$sidArr).")";
                        }else{
                            $where .= " AND 0 = 1";
                        }
                    }else{
                        $where .= " AND 0 = 1";
                    }
                }
            }
        }else{
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }
        if($title){
            $where .= " AND `username` like '%$title%'";
        }

        if($experience){
            $where .= " AND `experience` = '$experience'";
        }

        if(!empty($naturedesc)){
            $naturedesc = explode(",", $naturedesc);
            foreach ($naturedesc as $key => $value) {
                $where .= " AND find_in_set('$value', `naturedesc`)";
            }
        }

        //价格区间
        $age = convertArrToStrWithComma($age);
        if($age != ""){
            $age = explode(",", $age);
            if(empty($age[0])){
                $where .= " AND `age` < " . $age[1];
            }elseif(empty($age[1])){
                $where .= " AND `age` > " . $age[0];
            }else{
                $where .= " AND `age` BETWEEN " . $age[0] . " AND " . $age[1];
            }
        }

        //价格区间
        $salary = convertArrToStrWithComma($salary);
        if($salary != ""){
            $salary = explode(",", $salary);
            if(empty($salary[0])){
                $where .= " AND `salary` < " . ((int)$salary[1]);
            }elseif(empty($salary[1])){
                $where .= " AND `salary` > " . ((int)$salary[0]);
            }else{
                $where .= " AND `salary` BETWEEN " . ((int)$salary[0]) . " AND " . ((int)$salary[1]);
            }
        }

        if(!empty($type)){
            if($dsql->getTypeList($type, "homemaking_type")){
                $lower = arr_foreach($dsql->getTypeList($type, "homemaking_type"));
                $lower = $type.",".join(',',$lower);
            }else{
                $lower = $type;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `typeid` in ($lower)");
            $results = $dsql->dsqlOper($archives, "results");
            if(is_array($results)){
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }
                if(!empty($sidArr)){
                    $where .= " AND `company` in (".join(",",$sidArr).")";
                }else{
                    $where .= " AND 1 = 2";
                }
            }else{
                $where .= " AND 1 = 2";
            }
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "homemaking_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "homemaking_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `typeid` in ($lower)");
            $results = $dsql->dsqlOper($archives, "results");
            if(is_array($results)){
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }
                if(!empty($sidArr)){
                    $where .= " AND `company` in (".join(",",$sidArr).")";
                }else{
                    $where .= " AND 1 = 2";
                }
            }else{
                $where .= " AND 1 = 2";
            }
        }

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
        }

        if(!empty($search)){

            siteSearchLog("homemaking", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__homemaking_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`username` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `username` like '%$search%'";
            }
        }


        //排序
        switch ($orderby){
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
            //价格升序
            case 3:
                $orderby_ = " ORDER BY `salary` ASC, `weight` DESC, `tag` DESC, `id` DESC";
                break;
            //价格降序
            case 4:
                $orderby_ = " ORDER BY `salary` DESC, `weight` DESC, `tag` DESC, `id` DESC";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $arc = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_nanny` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("homemaking_nanny_total", $arc, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        //会员列表需要统计信息状态
        if($u == 1 && $uid > -1){
            //待审核
            $totalGray = $dsql->dsqlOper($arc." AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($arc." AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($arc." AND `state` = 2", "totalCount");

            $pageinfo['gray'] = $totalGray;
            $pageinfo['audit'] = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        $archives = $dsql->SetQuery("SELECT `id`, `username`, `cityid`, `tel`, `bond`, `place`, `experience`, `nature`, `naturedesc`, `tag`, `salary`, `education`, `nation`, `userid`, `company`, `pubdate`, `click`, `photo`, `age`, `addrid`, `state` FROM `#@__homemaking_nanny` WHERE 1 = 1".$where);
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("homemaking_nanny_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['username']  = $val['username'];
                $list[$key]['cityid']    = $val['cityid'];
                $list[$key]['tel']       = $val['tel'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['age']       = $val['age'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['photo']     = getFilePath($val['photo']);

                //籍贯
                $cityname = getSiteCityName($val['place']);
                $list[$key]['placename'] = $cityname;

                //学历
                $education = array();
                if(!empty($val['education'])){
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $val['education']);
                    $res = $dsql->dsqlOper($sql, "results");
                    $education = $res[0]['typename'];
                }
                $list[$key]['educationname'] = $education;

                //民族
                $nation = array();
                if(!empty($val['nation'])){
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $val['nation']);
                    $res = $dsql->dsqlOper($sql, "results");
                    $nation = $res[0]['typename'];
                }
                $list[$key]['nationname'] = $nation;

                //从业经验
                $experience = array();
                if(!empty($val['experience'])){
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $val['experience']);
                    $res = $dsql->dsqlOper($sql, "results");
                    $experience = $res[0]['typename'];
                }
                $list[$key]['experiencename'] = $experience;

                //薪资范围
                $salary = 0;
                if(!empty($val['salary'])){
                    /* $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $val['salary']);
					$res = $dsql->dsqlOper($sql, "results");
					$salary = $res[0]['typename']; */
                    $salary = $val['salary'];
                }
                $list[$key]['salaryname'] = $salary;

                //服务内容
                $naturedesc = array();
                if(!empty($val['naturedesc'])){
                    $naturedescids = $val['naturedesc'];
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` in ($naturedescids) ");
                    $res = $dsql->dsqlOper($sql, "results");
                    foreach ($res as $k => $value) {
                        $naturedesc[] = $value['typename'];
                    }
                }
                $list[$key]['naturedescname'] = $naturedesc;

                //工作类型
                $nature = array();
                if(!empty($val['nature'])){
                    $natureids = $val['nature'];
                    $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` in ($natureids) ");
                    $res = $dsql->dsqlOper($sql, "results");
                    foreach ($res as $k => $value) {
                        $nature[] = $value['typename'];
                    }
                }
                $list[$key]['naturename'] = $nature;

                $param = array(
                    "service" => "homemaking",
                    "template" => "nanny-detail",
                    "id" => $val['id']
                );
                $url = getUrlPath($param);

                $list[$key]['url'] = $url;

                $lower = [];
                $param['id']    = $val['company'];
                $this->param    = $param;
                $store          = $this->storeDetail();
                if(!empty($store)){
                    $lower = $store;
                }
                $list[$key]['store'] = $lower;
            }

        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 保姆/月嫂详细
     * @return array
     */
    public function nannyDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `idcardFront`, `idcardBack`, `healthchart`, `cookingchart`, `username`, `age`, `cityid`, `tag`, `servicenums`, `cooking`,`state`,`watchbaby`, `watchold`, `watchcat`, `otherskills`, `company`, `place`, `certifyState`, `healthcertifyState`, `cookingcertifyState`, `bond`, `salary`, `nature`, `naturedesc`, `education`, `experience`, `nation`, `click`, `tel`, `userid`, `photo`, `addrid` FROM `#@__homemaking_nanny` WHERE `id` = ".$id.$where);
        $results  = getCache("homemaking_nanny_detail", $archives, 0, $id);
        // $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $storeDetail["id"]         = $results[0]['id'];
            $storeDetail["state"]      = $results[0]['state'];
            $storeDetail["username"]   = $results[0]['username'];
            $storeDetail['cityid']     = $results[0]['cityid'];
            $storeDetail['place']      = $results[0]['place'];
            $storeDetail['age']        = $results[0]['age'];
            $storeDetail["company"]    = $results[0]['company'];
            $storeDetail["click"]      = $results[0]['click'];
            $storeDetail["tel"]        = $results[0]['tel'];
            $storeDetail["userid"]     = $results[0]['userid'];
            $storeDetail["certifyState"]     = $results[0]['certifyState'];
            $storeDetail["healthcertifyState"]     = $results[0]['healthcertifyState'];
            $storeDetail["cookingcertifyState"]     = $results[0]['cookingcertifyState'];
            $storeDetail["bond"]     = $results[0]['bond'];
            $storeDetail["tag"]     = $results[0]['tag'];
            $storeDetail["cooking"]     = $results[0]['cooking'];
            $storeDetail["watchbaby"]     = $results[0]['watchbaby'];
            $storeDetail["watchold"]     = $results[0]['watchold'];
            $storeDetail["watchcat"]     = $results[0]['watchcat'];
            $storeDetail["otherskills"]     = $results[0]['otherskills'];
            $storeDetail['photo']      = getFilePath($results[0]['photo']);
            $storeDetail['photoSource']      = $results[0]['photo'];
            $storeDetail['salary']      = $results[0]['salary'];

            $storeDetail['idcardFrontSource']      = $results[0]['idcardFront'];
            $storeDetail['idcardFront']      = getFilePath($results[0]['idcardFront']);

            $storeDetail['idcardBackSource']      = $results[0]['idcardBack'];
            $storeDetail['idcardBack']      = getFilePath($results[0]['idcardBack']);

            $storeDetail['healthchart']      = getFilePath($results[0]['healthchart']);
            $storeDetail['healthchartSource']      = $results[0]['healthchart'];

            $storeDetail['cookingchart']      = getFilePath($results[0]['cookingchart']);
            $storeDetail['cookingchartSource']      = $results[0]['cookingchart'];

            $storeDetail["education"]     = $results[0]['education'];
            $storeDetail["nation"]     = $results[0]['nation'];
            $storeDetail["experience"]     = $results[0]['experience'];
            $storeDetail["servicenums"]     = $results[0]['servicenums'] ? $results[0]['servicenums'] : 0;
            $storeDetail["nature"]     = $results[0]['nature'];
            $storeDetail["naturedesc"]     = $results[0]['naturedesc'];


            $storeDetail["addrid"]  = $addrid = $results[0]['addrid'];
            $archives = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = '$addrid'");
            $ret = $dsql->dsqlOper($archives, "results");
            if($ret){
                $storeDetail["circleAddrid"] = $ret[0]['parentid'];
            }
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $storeDetail['addrname']  = $addrArr;

            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "id"));
            $storeDetail['city'] = count($addrArr) > 2 ? $addrArr[1] : $addrArr[0];

            //籍贯
            $cityname = getSiteCityName($results[0]['place']);
            $storeDetail['placename'] = $cityname;

            //学历
            if(!empty($results[0]['education'])){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $results[0]['education']);
                $res = $dsql->dsqlOper($sql, "results");
                $education = $res[0]['typename'];
            }
            $storeDetail['educationname'] = $education;

            //民族
            if(!empty($results[0]['nation'])){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $results[0]['nation']);
                $res = $dsql->dsqlOper($sql, "results");
                $nation = $res[0]['typename'];
            }
            $storeDetail['nationname'] = $nation;

            //从业经验
            if(!empty($results[0]['experience'])){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $results[0]['experience']);
                $res = $dsql->dsqlOper($sql, "results");
                $experience = $res[0]['typename'];
            }
            $storeDetail['experiencename'] = $experience;

            //薪资范围
            /* if(!empty($results[0]['salary'])){
				$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` = " . $results[0]['salary']);
				$res = $dsql->dsqlOper($sql, "results");
				$salary = $res[0]['typename'];
			}
			$storeDetail['salaryname'] = $salary; */

            //服务内容
            if(!empty($results[0]['naturedesc'])){
                $naturedescids = $results[0]['naturedesc'];
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` in ($naturedescids) ");
                $res = $dsql->dsqlOper($sql, "results");
                foreach ($res as $k => $value) {
                    $naturedesc[] = $value['typename'];
                }
            }
            $storeDetail['naturedescname'] = $naturedesc;
            $storeDetail['naturedescnameAll'] = !empty($naturedesc) ? join(" ", $naturedesc) : '';

            //工作类型
            if(!empty($results[0]['nature'])){
                $natureids = $results[0]['nature'];
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__homemakingitem` WHERE `id` in ($natureids) ");
                $res = $dsql->dsqlOper($sql, "results");
                foreach ($res as $k => $value) {
                    $nature[] = $value['typename'];
                }
            }
            $storeDetail['naturename'] = $nature;
            $storeDetail['naturenameaAll'] = !empty($nature) ? join(" ", $nature) : '';

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            $param = array(
                "service"  => "homemaking",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "homemaking",
                "temp"   => "nanny-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;

        }
        return $storeDetail;
    }

    /**
     * 家政服务列表
     */
    public function hList(){
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $homemakingtype = $store = $typeid = $addrid = $business= $title = $flag = $orderby = $u = $state = $rec = $page = $pageSize = $where = $where1 = "";
        require(HUONIAOINC."/config/homemaking.inc.php");

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！
            }else{
                $store    = (int)$this->param['store'];
                $typeid   = (int)$this->param['typeid'];
                $type     = (int)$this->param['type'];
                $addrid   = (int)$this->param['addrid'];
                $business = (int)$this->param['business'];
                $title    = $this->param['title'] ? $this->param['title'] : $this->param['keywords'];
                $homemakingtype     = (int)$this->param['homemakingtype'];
                $price     = $this->param['price'];
                $orderby  = (int)$this->param['orderby'];
                $u        = (int)$this->param['u'];
                $state    = $this->param['state'];
                $rec      = (int)$this->param['rec'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/homemaking.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                //遍历区域
                if($cityid){

                    $where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `state` = 1 AND `cityid` = $cityid");
                    $results = $dsql->dsqlOper($archives, "results");
                    if(is_array($results)){
                        foreach ($results as $key => $value) {
                            $sidArr[$key] = $value['id'];
                        }
                        if(!empty($sidArr)){
                            $where .= " AND `company` in (".join(",",$sidArr).")";
                        }else{
                            $where .= " AND 0 = 1";
                        }
                    }else{
                        $where .= " AND 0 = 1";
                    }
                }
            }
        }else{
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }
        }

        if(!empty($store)){
            $where .= " AND `company` = ".$store;
        }

        if($rec!=''){
            $where .= " AND `rec` = ".$rec;
        }

        if($homemakingtype!=''){
            $where .= " AND `homemakingtype` = ".$homemakingtype;
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "homemaking_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "homemaking_type"));
                $lower = $typeid.",".join(',',$lower);
                $where .= " AND `typeid` in ($lower)";
            }else{
                $where .= " AND `typeid` = $typeid";
            }
        }elseif(!empty($type)){
            if($dsql->getTypeList($type, "homemaking_type")){
                $lower = arr_foreach($dsql->getTypeList($type, "homemaking_type"));
                $lower = $type.",".join(',',$lower);
                $where .= " AND `typeid` in ($lower)";
            }else{
                $where .= " AND `typeid` = $type";
            }
        }

        //遍历地区
        if(!empty($addrid)){
            if (!empty($business)) {
                $addrid = $business;
            }
            if($dsql->getTypeList($addrid, "site_area")){
                $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addridArr = join(',',$addridArr);
                $lower = $addrid.",".$addridArr;
            }else{
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }

        //价格区间
        $price = convertArrToStrWithComma($price);
        if($price){
            $price = explode(",", $price);
            if(empty($price[0])){
                $where .= " AND `price` < " . $price[1];
            }elseif(empty($price[1])){
                $where .= " AND `price` > " . $price[0];
            }else{
                $where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
            }
        }

        //关键字
        if(!empty($title)){
            //搜索记录
            siteSearchLog("homemaking", $title);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__homemaking_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$title%' OR `store`.address like '%$title%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }
            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$title%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$title%'";
            }
        }

        $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
        //排序
        switch ($orderby){
            //默认
            case 0:
                $orderby_ = " ORDER BY `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //销量降序
            case 1:
                $orderby_ = " ORDER BY sale DESC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //销量升序
            case 2:
                $orderby_ = " ORDER BY sale ASC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //价格升序
            case 3:
                $orderby_ = " ORDER BY `price` ASC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //价格降序
            case 4:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //发布时间降序
            case 5:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            //发布时间降序
            case 6:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `rec` DESC, `id` DESC";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `rec` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `cityid`, `addrid`, `company`, `typeid`, `homemakingtype`, `username`, `contact`, `pics`, `price`, `state`, `flag`, `pubdate`, `click`, `sale`, `rec`,`note` FROM `#@__homemaking_list` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("homemaking_list_total", $archives, 300, array("savekey" => 1, "type" => "totalCount", "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        //会员列表需要统计信息状态
        if($u == 1 && $uid > -1){
            //待审核
            $totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

            $pageinfo['gray'] = $totalGray;
            $pageinfo['audit'] = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
        }

        if($state != ''){
            $where1 = " AND `state` = ".$state;
        }

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$where1.$orderby_.$where);
        $results = getCache("homemaking_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']             = $val['id'];
                $list[$key]['title']          = $val['title'];
                $list[$key]['cityid']         = $val['cityid'];
                $list[$key]['addrid']         = $val['addrid'];
                $list[$key]['company']        = $val['company'];
                $list[$key]['typeid']         = $val['typeid'];
                $list[$key]['homemakingtype'] = $val['homemakingtype'];
                $list[$key]['username']       = $val['username'];
                $list[$key]['contact']        = $val['contact'];
                $list[$key]['pics']           = $val['pics'];
                $list[$key]['price']          = $val['price'];
                $list[$key]['state']          = $val['state'];
                $list[$key]['flag']           = $val['flag'];
                $list[$key]['pubdate']        = $val['pubdate'];
                $list[$key]['click']          = $val['click'];
                $list[$key]['sale']           = $val['sale'];
                $list[$key]['rec']            = $val['rec'];
                $list[$key]['note']            = $val['note'];

                //地区
                if(!empty($val['addrid'])){
                    $addrName = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data = "";
                    $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                    $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                    $list[$key]['addrname']  = $addrArr;
                }else{
                    $list[$key]['addrname'] = "";
                }

                //缩略图
                if(!empty($val['pics'])){
                    $picsArr = explode(',', $val['pics']);
                }
                $list[$key]['litpic'] = !empty($picsArr) ? getFilePath($picsArr[0]) : '';
                //分类
                global $data;
                $data = "";
                $typeArr = getParentArr("homemaking_type", $val['typeid']);
                $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
                $list[$key]['typename']    = join("-", $typeArr);

                //标签
                $flagArr = array();
                if(!empty($val['flag'])){
                    $flag = explode("|", $val['flag']);
                    foreach ($flag as $v) {
                        $flagArr['jc'][] = $v;
                        $flagArr['py'][] = GetPinyin($v);
                    }
                }
                $list[$key]['flagAll'] = $flagArr;

                //商家
                $this->param = $val['company'];
                $list[$key]['store'] = $this->storeDetail();

                $param = array(
                    "service"  => "homemaking",
                    "template" => "detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                $collect = "";
                if($uid != -1){
                    //验证是否已经收藏
                    $params = array(
                        "module" => "homemaking",
                        "temp"   => "detail",
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
     * 家政服务详细
     * @return array
     */
    public function detail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `cityid`, `addrid`, `company`, `title`, `typeid`, `homemakingtype`, `userid`, `username`, `contact`, `note`, `pics`, `price`, `flag`, `pubdate`, `click`, `sale`, `rec`,`state` FROM `#@__homemaking_list` WHERE `id` = ".$id.$where);
        $results  = getCache("homemaking_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]             = $results[0]['id'];
            $storeDetail["state"]          = $results[0]['state'];
            $storeDetail["cityid"]         = $results[0]['cityid'];
            $storeDetail["addrid"]         = $results[0]['addrid'];
            $storeDetail["company"]        = $results[0]['company'];
            $storeDetail["title"]          = $results[0]['title'];
            $storeDetail["typeid"]         = $results[0]['typeid'];
            $storeDetail["homemakingtype"] = $results[0]['homemakingtype'];
            $storeDetail["userid"]         = $results[0]['userid'];
            $storeDetail["username"]       = $results[0]['username'];
            $storeDetail["contact"]        = $results[0]['contact'];

            $body = $results[0]['note'];

            global $cfg_secureAccess;
            global $cfg_basehost;

            $u = str_replace('//', '\/\/', $cfg_secureAccess) . $cfg_basehost . '\/include\/attachment.php';
            $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

            //特殊情况兼容处理
            $u = str_replace('//', '\/\/', $cfg_secureAccess) . 'www.' . $cfg_basehost . '\/include\/attachment.php';
            $body = preg_replace('/'.$u.'/', '/include/attachment.php', $body);

            //将附件地址转为真实地址
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

            preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $body, $fileList);
            $fileList = array_unique($fileList[1]);

            //内容图片
            $fileArr = array();
            if (!empty($fileList)) {
                foreach ($fileList as $v_) {
                    $filePath = getRealFilePath($v_);
                    array_push($fileArr, array(
                        'source' => '/include/attachment.php?f=' . $v_,
                        'turl' => $filePath
                    ));
                }
            }

            //替换内容中的文件地址
            if($fileArr){
                foreach ($fileArr as $key => $val){
                    $file_source = $val['source'];
                    $file_turl = $val['turl'];
                    $body = str_replace($file_source, $file_turl, $body);
                }
            }

            $storeDetail["note"]           = $body;
            $storeDetail["price"]          = $results[0]['price'];
            $storeDetail["flag"]           = $results[0]['flag'];
            $storeDetail["pubdate"]        = $results[0]['pubdate'];
            $storeDetail["click"]          = $results[0]['click'];
            $storeDetail["sale"]           = $results[0]['sale'];
            $storeDetail["rec"]            = $results[0]['rec'];

            //图集
            $imglist = array();
            $pics = $results[0]['pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['path'] = getFilePath($value);
                    $imglist[$key]['pathSource'] = $value;
                }
            }
            $storeDetail['pics'] = $imglist;

            //地区
            if(!empty($results[0]['addrid'])){
                $addrName = getParentArr("site_area", $results[0]['addrid']);
                global $data;
                $data = "";
                $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                $storeDetail['addrname']  = $addrArr;
            }else{
                $storeDetail['addrname'] = "";
            }

            //分类
            global $data;
            $data = "";
            $typeArr = getParentArr("homemaking_type", $results[0]['typeid']);
            $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
            $storeDetail['typename']    = join("-", $typeArr);

            //标签
            $flagArr = array();
            if(!empty($results[0]['flag'])){
                $flag = explode("|", $results[0]['flag']);
                foreach ($flag as $v) {
                    $flagArr['jc'][] = $v;
                    $flagArr['py'][] = GetPinyin($v);
                }
            }
            $storeDetail['flagAll'] = $flagArr;

            //商家信息
            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            $param = array(
                "service"  => "homemaking",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "homemaking",
                "temp"   => "detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;

        }
        return $storeDetail;
    }

    /**
     * 发布信息
     * @return array
     */
    public function put(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        require(HUONIAOINC."/config/homemaking.inc.php");
        $customhomemakingCheck = (int)$customhomemakingCheck;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $pics            =  $param['pics'];
        $typeid          =  (int)$param['typeid'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $addrid          =  $param['addrid'];
        $cityid          =  $param['cityid'];
        $homemakingtype  =  $param['homemakingtype'];
        $price           =  $param['price'];
        $note            =  filterSensitiveWords($param['note']);
        $username        =  $param['username'];
        $tel             =  $param['contact'];
        $vercode         =  $param['testcode'];
        $codetype         =  $param['codetype'];
        if(isset($param['flag'])){
            $flag = $param['flag'];
            $flag = is_array($flag) ? join("|", $flag) : $flag;
        }
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if(empty($typeid)) return array("state" => 200, "info" => $langData['homemaking'][8][14]);//请选择家政分类
        if(empty($title)) return array("state" => 200, "info" => $langData['homemaking'][8][15]);//请填写标题
        if($homemakingtype!=0){
            if(empty($price)) return array("state" => 200, "info" => $langData['homemaking'][8][16]);//请填写价格
        }else{
            $price = 0;
        }
        if(empty($username)) return array("state" => 200, "info" => $langData['homemaking'][8][17]);//请填写联系人
        if(empty($tel)) return array("state" => 200, "info" => $langData['homemaking'][8][18]);//请填写联系号码


        if(!$codetype){
            if(!$userinfo['phone'] || !$userinfo['phoneCheck'] || $userinfo['phone'] != $tel){
                if(empty($vercode)) return array("state" => 200, "info" => $langData['homemaking'][8][19]);//请填写验证码
                //国际版需要验证区域码
                $cphone_ = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $international = $results[0]['international'];
                    if($international){
                        $cphone_ = $areaCode.$phone;
                    }
                }

                $ip = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if($res_code){
                    $code = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if(strtolower($vercode) != $code){
                        return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                }else{
                    return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
                }
            }
        }
        $company = $userResult[0]['id'];

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_list` (`cityid`, `addrid`, `company`, `title`, `typeid`, `homemakingtype`, `userid`, `username`, `contact`, `note`, `pics`, `price`, `state`, `pubdate`, `flag`) VALUES ('$cityid', '$addrid', '$company', '$title', '$typeid', '$homemakingtype', '$userid', '$username', '$tel', '$note', '$pics', '$price', '$customhomemakingCheck', '$pubdate', '$flag')");
        $aid = $dsql->dsqlOper($archives, "lastid");
        if(is_numeric($aid)){

            $urlParam = array(
                "service"  => "homemaking",
                "template" => "detail",
                "id"       => $aid
            );
            $url = getUrlPath($urlParam);

            //记录用户行为日志
            memberLog($userid, 'homemaking', '', $aid, 'insert', '发布信息('.$title.')', $url, $archives);

            if($customhomemakingCheck){
                updateCache("homemaking_list", 300);
                clearCache("homemaking_list_total", 'key');
            }
            //微信通知
            $cityName = $siteCityInfo['name'];
            $cityid  = $siteCityInfo['cityid'];
            $param = array(
                'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'发布了家政: '.$title,
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("homemaking", "homemaking",$param);
            dataAsync("homemaking",$aid,"list");  // 家政、服务、新增

            return $aid;
        }else{
            return array("state" => 101, "info" => $langDatap['homemaking']['10']['23']);//发布到数据时发生错误，请检查字段内容！
        }

    }

    /**
     * 编辑信息
     * @return array
     */
    public function edit(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        require(HUONIAOINC."/config/homemaking.inc.php");
        $customhomemakingCheck = (int)$customhomemakingCheck;
        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;

        $id              = $param['id'];
        if(empty($id)) return array("state" => 200, "info" => $langData['car'][7][45]);//数据传递失败！

        $pics            =  $param['pics'];
        $typeid          =  (int)$param['typeid'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $addrid          =  $param['addrid'];
        $cityid          =  $param['cityid'];
        $homemakingtype  =  $param['homemakingtype'];
        $price           =  $param['price'];
        $note            =  filterSensitiveWords($param['note']);
        $username        =  $param['username'];
        $tel             =  $param['contact'];
        $vercode         =  $param['testcode'];
        $codetype        =  $param['codetype'];
        if(isset($param['flag'])){
            $flag = $param['flag'];
            $flag = is_array($flag) ? join("|", $flag) : $flag;
        }
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if(empty($typeid)) return array("state" => 200, "info" => $langData['homemaking'][8][14]);//请选择家政分类
        if(empty($title)) return array("state" => 200, "info" => $langData['homemaking'][8][15]);//请填写标题
        if($homemakingtype!=0){
            if(empty($price)) return array("state" => 200, "info" => $langData['homemaking'][8][16]);//请填写价格
        }elseif($homemakingtype==0){
            $price = 0;
        }
        if(empty($username)) return array("state" => 200, "info" => $langData['homemaking'][8][17]);//请填写联系人
        if(empty($tel)) return array("state" => 200, "info" => $langData['homemaking'][8][18]);//请填写联系号码

        if(!$codetype){
            if(!$userinfo['phone'] || !$userinfo['phoneCheck'] || !empty($vercode)){
                if(empty($vercode)) return array("state" => 200, "info" => $langData['homemaking'][8][19]);//请填写验证码
                //国际版需要验证区域码
                $cphone_ = $tel;
                $archives = $dsql->SetQuery("SELECT `international` FROM `#@__sitesms` WHERE `state` = 1");
                $results = $dsql->dsqlOper($archives, "results");
                if($results){
                    $international = $results[0]['international'];
                    if($international){
                        $cphone_ = $areaCode.$phone;
                    }
                }

                $ip = GetIP();
                $sql_code = $dsql->SetQuery("SELECT * FROM `#@__site_messagelog` WHERE `type` = 'phone' AND `lei` = 'verify' AND `ip` = '$ip' AND `user` = '$cphone_' ORDER BY `id` DESC LIMIT 1");
                $res_code = $dsql->dsqlOper($sql_code, "results");
                if($res_code){
                    $code = $res_code[0]['code'];
                    $codeID = $res_code[0]['id'];

                    if(strtolower($vercode) != $code){
                        return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
                    }

                    //5分钟有效期
                    $now = GetMkTime(time());
                    if($now - $res_code[0]['pubdate'] > 300) return array("state" => 200, "info" => $langData['siteConfig'][21][33]);   //验证码已过期，请重新获取！
                }else{
                    return array('state' =>200, 'info' => $langData['homemaking'][8][20]);//验证码输入错误，请重试！
                }
            }
        }

        $company = $userResult[0]['id'];

        $field = '';
        if($flag){
            $field = " , flag = '$flag'";
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `cityid` = '$cityid', `addrid` = '$addrid', `company` = '$company', `title` = '$title', `typeid` = '$typeid', `homemakingtype` = '$homemakingtype', `userid` = '$userid', `username` = '$username', `contact` = '$tel', `note` = '$note', `pics` = '$pics', `price` = '$price', `state` = '$customhomemakingCheck' $field WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");
        if($results != "ok"){
            return array("state" => 200, "info" => $langDatap['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
        }

        $urlParam = array(
            "service"  => "homemaking",
            "template" => "detail",
            "id"       => $id
        );
        $url = getUrlPath($urlParam);

        //记录用户行为日志
        memberLog($userid, 'homemaking', '', $id, 'update', '更新信息('.$title.')', $url, $archives);

        //后台消息通知
        if($customhomemakingCheck){
            //微信通知
            $cityName = $siteCityInfo['name'];
            $cityid  = $siteCityInfo['cityid'];
            $param = array(
                'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'编辑了家政id: '.$id,
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("homemaking", "detail",$param);
        }

        // 清除缓存
        checkCache("homemaking_list", $id);
        clearCache("homemaking_detail", $id);
        clearCache("homemaking_list_total", 'key');
        dataAsync("homemaking",$id,"list");  // 家政、服务、编辑

        return $langData['homemaking'][8][22];//修改成功！

    }

    /**
     * 删除信息
     * @return array
     */
    public function del(){
        global $dsql;
        global $langData;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`state`, l.`pics`, l.`note`, s.`userid` FROM `#@__homemaking_list` l LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['userid'] == $uid){
                /* $orderid = array();
				//删除相应的订单
				$orderSql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE `proid` = ".$id);
				$orderResult = $dsql->dsqlOper($orderSql, "results");
				if($orderResult){
					foreach($orderResult as $key => $order){
						array_push($orderid, $order['id']);
					}
					$quanSql = $dsql->SetQuery("DELETE FROM `#@__homemaking_order` WHERE `proid` = ".$id);
					$dsql->dsqlOper($quanSql, "update");
				} */

                //删除图集
                delPicFile($results['pics'], "delAtlas", "homemaking");

                $body = $results['note'];
                if(!empty($body)){
                    delEditorPic($body, "homemaking");
                }

                // 清除缓存
                clearCache("homemaking_detail", $id);
                checkCache("homemaking_list", $id);
                clearCache("homemaking_list_total", 'key');

                //删除表
                $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_list` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
    
                //记录用户行为日志
                memberLog($uid, 'homemaking', '', $id, 'delete', '删除信息('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => $langData['homemaking'][8][23]);//删除成功！
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][8][24]);//权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['homemaking'][8][25]);//商品不存在，或已经删除！
        }
    }

    /**
     * 操作保姆/月嫂
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operNanny(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/homemaking.inc.php");
        $customnannyCheck = (int)$customnannyCheck;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $username        =  $param['username'];
        $tel             =  $param['tel'];
        $photo           =  $param['photo'];
        $cityid          =  $param['cityid'];
        $addrid          =  $param['addrid'];
        $age             =  (int)$param['age'];
        $place           =  $param['place'];
        $education       =  $param['education'];
        $nation          =  $param['nation'];
        $experience      =  $param['experience'];
        $servicenums     =  (int)$param['servicenums'];
        $nature          =  $param['nature'];
        $naturedesc      =  $param['naturedesc'];
        $tag             =  $param['tag'];
        $cooking         =  filterSensitiveWords(addslashes($param['cooking']));
        $watchbaby       =  filterSensitiveWords(addslashes($param['watchbaby']));
        $watchold        =  filterSensitiveWords(addslashes($param['watchold']));
        $watchcat        =  filterSensitiveWords(addslashes($param['watchcat']));
        $otherskills     =  filterSensitiveWords(addslashes($param['otherskills']));
        $idcardFront     =  $param['idcardFront'];
        $idcardBack      =  $param['idcardBack'];
        $healthchart     =  $param['healthchart'];
        $cookingchart    =  $param['cookingchart'];
        $salary  		 =  $param['salary'];
        $bond            =  (int)$param['bond'];
        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join(",", $tag) : $tag;
        }
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state`, `cityid` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
        }

        $cityid = $userResult[0]['cityid'];

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($username)) return array("state" => 200, "info" => $langData['homemaking'][8][17]);//请填写联系人
            if(empty($tel)) return array("state" => 200, "info" => $langData['homemaking'][8][18]);//请填写联系号码
            if(empty($photo)) return array("state" => 200, "info" => $langData['homemaking'][8][46]);//请上传人员相片
            if(empty($age)) return array("state" => 200, "info" => $langData['homemaking'][8][48]);//请填写年龄
            if(empty($place)) return array("state" => 200, "info" => $langData['homemaking'][8][50]);//请选择籍贯
            if(empty($education)) return array("state" => 200, "info" => $langData['homemaking'][8][52]);//请选择学历
            if(empty($experience)) return array("state" => 200, "info" => $langData['homemaking'][8][56]);//请选择从业经验
            //if(empty($nature)) return array("state" => 200, "info" => $langData['homemaking'][8][14]);//请选择工作类型
            //if(empty($naturedesc)) return array("state" => 200, "info" => $langData['homemaking'][8][14]);//请选择服务内容
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_nanny` (`cityid`, `addrid`, `userid`, `username`, `company`, `tel`, `photo`, `age`, `education`, `nation`, `experience`, `place`, `servicenums`, `nature`, `naturedesc`, `tag`, `cooking`, `watchbaby`, `watchold`, `watchcat`, `otherskills`, `idcardFront`, `idcardBack`, `healthchart`, `cookingchart`, `bond`, `pubdate`, `state`, `salary`) VALUES ('$cityid', '$addrid', '$userid', '$username', '$company', '$tel', '$photo', '$age', '$education', '$nation', '$experience', '$place', '$servicenums', '$nature', '$naturedesc', '$tag', '$cooking', '$watchbaby', '$watchold', '$watchcat', '$otherskills', '$idcardFront', '$idcardBack', '$healthchart', '$cookingchart', '$bond', '$pubdate', '$customnannyCheck', '$salary')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    "service"  => "homemaking",
                    "template" => "nanny-detail",
                    "id"       => $aid
                );
                $url = getUrlPath($urlParam);
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'nanny', $aid, 'insert', '新增保媒月嫂('.$username.')', $url, $archives);

                if($customnannyCheck){
                    updateCache("homemaking_nanny_list", 300);
                    clearCache("homemaking_nanny_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'新增 保姆/月嫂: '.$username,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("homemaking", "nanny",$param);

                return $aid;
            }else{
                return array("state" => 101, "info" => $langDatap['homemaking']['10']['23']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_nanny` SET `cityid` = '$cityid', `addrid` = '$addrid', `userid` = '$userid', `username` = '$username', `company` = '$company', `tel` = '$tel', `photo` = '$photo', `age` = '$age', `education` = '$education', `nation` = '$nation', `experience` = '$experience', `place` = '$place', `servicenums` = '$servicenums', `nature` = '$nature', `naturedesc` = '$naturedesc', `tag` = '$tag', `cooking` = '$cooking', `watchbaby` = '$watchbaby', `watchold` = '$watchold', `watchcat` = '$watchcat', `otherskills` = '$otherskills', `idcardFront` = '$idcardFront', `idcardBack` = '$idcardBack', `healthchart` = '$healthchart', `cookingchart` = '$cookingchart', `bond` = '$bond',  `state` = '$customnannyCheck', `salary` = '$salary' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                return array("state" => 200, "info" => $langDatap['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
            }

            $urlParam = array(
                "service"  => "homemaking",
                "template" => "nanny-detail",
                "id"       => $id
            );
            $url = getUrlPath($urlParam);

            //记录用户行为日志
            memberLog($userid, 'homemaking', 'nanny', $id, 'update', '更新保媒月嫂('.$username.')', $url, $archives);

            //微信通知
            $cityName = $siteCityInfo['name'];
            $cityid  = $siteCityInfo['cityid'];
            $param = array(
                'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'更新了 保姆/月嫂 信息 id : '.$id,
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("homemaking", "nanny",$param);

            // 清除缓存
            checkCache("homemaking_nanny_list", $id);
            clearCache("homemaking_nanny_detail", $id);
            clearCache("homemaking_nanny_total", 'key');

            return $langData['homemaking'][8][22];//修改成功！
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`username`, l.`photo`, l.`idcardFront`, l.`idcardBack`, l.`healthchart`, l.`cookingchart`, s.`userid` FROM `#@__homemaking_nanny` l LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){

                    //删除图集
                    delPicFile($results['photo'], "delThumb", "homemaking");
                    delPicFile($results['idcardFront'], "delThumb", "homemaking");
                    delPicFile($results['idcardBack'], "delThumb", "homemaking");
                    delPicFile($results['healthchart'], "delThumb", "homemaking");
                    delPicFile($results['cookingchart'], "delThumb", "homemaking");

                    // 清除缓存
                    clearCache("homemaking_nanny_detail", $id);
                    checkCache("homemaking_nanny_list", $id);
                    clearCache("homemaking_nanny_total", 'key');

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_nanny` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
        
                    //记录用户行为日志
                    memberLog($userid, 'homemaking', 'nanny', $id, 'delete', '删除保媒月嫂('.$results['username'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['homemaking'][8][23]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['homemaking'][8][24]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][8][25]);//商品不存在，或已经删除！
            }
        }

    }

    /**
     * 操作服务人员
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operPersonal(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/homemaking.inc.php");
        $custompersonalCheck = (int)$custompersonalCheck;

        $uid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $account         =  $param['account'];
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `userid` = ".$uid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($account)) return array("state" => 200, "info" => $langData['homemaking'][9][6]);//请填写会员账号

            $memberSql    = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `mtype` = 1 and `state` = 1 and (`username` = '$account' OR `email` = '$account' OR `phone` = '$account') ");
            $memberResult = $dsql->dsqlOper($memberSql, "results");
            if(empty($memberResult)){
                return array("state" => 200, "info" => $langData['homemaking'][9][7]);//没有该会员账号,请填写正确的账号！
            }

            $userid = $memberResult[0]['id'];

            if($oper == 'add'){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_personal` WHERE `userid` = '$userid'");
                $res = $dsql->dsqlOper($sql, "results");
                if(!empty($res[0]['id'])){
                    return array("state" => 200, "info" => $langData['homemaking'][9][8]);//该会员已加入家政公司！
                }
            }

        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_personal` (`userid`, `company`, `pubdate`, `state`) VALUES ('$userid', '$company', '$pubdate', '$custompersonalCheck')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){
    
                //记录用户行为日志
                memberLog($uid, 'homemaking', 'personal', $aid, 'insert', '新增服务人员('.$userid.'=>'.$account.')', '', $archives);

                if($custompersonalCheck){
                    updateCache("homemaking_personal_list", 300);
                    clearCache("homemaking_personal_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'新增服务人员id: '.$userid,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("homemaking", "personal",$param);

                return $aid;
            }else{
                return array("state" => 101, "info" => $langDatap['homemaking']['10']['23']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_personal` SET `userid` = '$userid', `company` = '$company', `state` = '$custompersonalCheck' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                return array("state" => 200, "info" => $langDatap['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
            }
    
            //记录用户行为日志
            memberLog($uid, 'homemaking', 'personal', $id, 'update', '更新服务人员('.$userid.')', '', $archives);

            //微信通知
            $cityName = $siteCityInfo['name'];
            $cityid  = $siteCityInfo['cityid'];
            $param = array(
                'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——homemaking模块——用户:'.$userinfo['username'].'更新服务人员id: '.$id,
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("homemaking", "personal",$param);

            // 清除缓存
            clearCache("homemaking_personal_detail", $id);
            checkCache("homemaking_personal_list", $id);
            clearCache("homemaking_personal_total", 'key');

            return $langData['homemaking'][8][22];//修改成功！
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`, s.`userid` FROM `#@__homemaking_personal` l LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $uid){

                    // 清除缓存
                    clearCache("homemaking_personal_detail", $id);
                    checkCache("homemaking_personal_list", $id);
                    clearCache("homemaking_personal_total", 'key');

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_personal` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
    
                    //记录用户行为日志
                    memberLog($uid, 'homemaking', 'personal', $id, 'delete', '删除服务人员('.$id.')', '', $archives);

                    return array("state" => 100, "info" => $langData['homemaking'][8][23]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['homemaking'][8][24]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][8][25]);//商品不存在，或已经删除！
            }
        }

    }

    /**
     * 下单
     * @return array
     */
    public function deal(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_pointName;
        global $cfg_pointRatio;

        $userid = $userLogin->getMemberID();

        $param = $this->param;
        $pros      = $param['pros'];
        $addressid = $param['addressid'];
        $doortime  = $param['doortime'];
        $count     = (int)$param['count'];
        $pics      = $param['pics'];
        $usernote  = $param['usernote'];
        $usePinput = (int)$param['usePinput'];          //是否使用积分

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $userpoint = $userinfo['point'];

        if(empty($pros)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误
        if(empty($count)) return array("state" => 200, "info" => $langData['homemaking'][8][14]);//购买服务不能为空

        $this->param = $pros;
        $detail = $this->detail();
        if($detail['store']['userid'] == $userid) return array("state" => 200, "info" => $langData['homemaking'][9][12]); //企业会员不可以购买自己的服务！

        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$userid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(!empty($personalres[0]['company']) && $detail['company'] == $personalres[0]['company']){
            return array("state" => 200, "info" => $langData['homemaking'][9][12]); //企业会员不可以购买自己的服务！
        }

        if(!is_array($detail)) return array("state" => 200, "info" => $langData['homemaking'][9][13]);//家政服务不存在
        $perice = $detail['price'] * $count;
        $orderprice = $perice;
        $pricepoint=0;
        if ($usePinput == 1){
            $point_price  = getJifen('homemaking', $perice);  //抵扣金钱
            $pricepoint = $point_price  * $cfg_pointRatio;
            if ($pricepoint > $userpoint) {
                $pricepoint = $userpoint;
                $point_price =   $pricepoint /  $cfg_pointRatio;
            }
            $price = sprintf("%.2f",$perice-$point_price);

        }else{

            $price = $perice;
        }

        //收货地址信息
        global $data;
        $data = "";
        if ($addressid!="") {
            $where = " AND `id` = $addressid";
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid ".$where);
        $userAddr = $dsql->dsqlOper($archives, "results");
        if(!$userAddr) return array("state" => 200, "info" => $langData['siteConfig'][22][105]);  //会员地址库信息不存在或已删除
        $addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
        $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
        $addr    = join(" ", $addrArr);
        $address = $addr . $userAddr[0]['address'];
        $person = $userAddr[0]['person'];
        $mobile = $userAddr[0]['mobile'];
        $tel    = $userAddr[0]['tel'];
        $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / ".$tel : "") : $tel;

        $ordernum = create_ordernum();

        $pubdate   = GetMkTime(time());
        $nopaydate = $pubdate + 1800;
        //免费预约直接跳转
        if($detail['homemakingtype'] == 0){
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_order` (`ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderstate`, `orderdate`, `tab`, `pics`, `doortime`, `usernote`, `useraddr`, `username`, `usercontact`,`point`) VALUES ('$ordernum', '$userid', '$pros', '$count', '$price', '1', '$pubdate', 'homemaking', '$pics', '$doortime', '$usernote', '$address', '$person', '$contact','$pricepoint')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $aid, 'insert', '下单('.$ordernum.')', '', $archives);

                $paytype = '';
                //执行支付成功的操作
                $this->param = array(
                    "paytype"  => $paytype,
                    "ordernum" => $ordernum
                );
                $this->paySuccess();

                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $aid
                );

                if(isMobile()){
                    return getUrlPath($param);
                }else{
                    return getUrlPath(array('service' => 'member', 'type' => 'user'));
                }
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][9][99]);//下单失败
            }
        }else{
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_order` (`ordernum`, `userid`, `proid`, `procount`, `payprice`,`orderprice`, `orderstate`, `orderdate`, `tab`, `pics`, `doortime`, `usernote`, `useraddr`, `username`, `usercontact`, `nopaydate`,`point`) VALUES ('$ordernum', '$userid', '$pros', '$count', '$price', '$orderprice', '0', '$pubdate', 'homemaking', '$pics', '$doortime', '$usernote', '$address', '$person', '$contact', '$nopaydate','$pricepoint')");
        }

        $return = $dsql->dsqlOper($archives, "update");
        if($return == "ok"){
    
            //记录用户行为日志
            memberLog($userid, 'homemaking', 'order', 0, 'insert', '下单('.$ordernum.'=>'.$price.'元)', '', $archives);

            $url[] = $ordernum;
        }else{
            return array("state" => 200, "info" => $langData['homemaking'][9][99]);//下单失败
        }
        if ($price == 0){

            $date = GetMkTime(time());
            $paytype = array();
            $ordernumArr = explode(",",$ordernum);
            //扣除会员账户积分和余额
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `userid`, `point`, `balance` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $userid  = $res['userid'];   //购买用户ID
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额

                //扣除会员积分
                if(!empty($upoint) && $upoint > 0){
                    $paytype[] = "point";
                }

                //扣除会员余额
                if(!empty($ubalance) && $ubalance > 0){
                    $paytype[] = "money";
                }

            }


            //增加支付日志
            $paylognum = create_ordernum();
            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`) VALUES ('homemaking', '$paylognum', '$userid', '$ordernum', '0', '".join(",", $paytype)."', '1')");
            $dsql->dsqlOper($archives, "update");

            //执行支付成功的操作
            $this->param = array(
                "paytype" => join(",", $paytype),
                "ordernum" => $ordernum
            );
            $this->paySuccess();

            //跳转至支付成功页面
            if(isMobile()){
                $param = array(
                    "service"     => "homemaking",
                    "template"    => "payreturn",
                    "ordernum"    => $paylognum
                );
                $url = getUrlPath($param);

                //支付成功后跳转页面
                global $cfg_payReturnType;
                global $cfg_payReturnUrlPc;
                global $cfg_payReturnUrlTouch;

                if($cfg_payReturnType){

                    //移动端自定义跳转链接
                    if(isMobile() && $cfg_payReturnUrlTouch){
                        $url = $cfg_payReturnUrlTouch;
                    }
                }

                return  $url;
            }else{
                $param = array(
                    "service"     => "homemaking",
                    "template"    => "index"
                );
                $url = getUrlPath($param);
                //支付成功后跳转页面
                global $cfg_payReturnType;
                global $cfg_payReturnUrlPc;
                global $cfg_payReturnUrlTouch;

                if($cfg_payReturnType){

                    //电脑端自定义跳转链接
                    if(!isMobile() && $cfg_payReturnUrlPc){
                        $url = $cfg_payReturnUrlPc;
                    }
                }

//                echo '<script>alert("支付成功，订单信息请登录移动端查看！");location.href="'.$url.'"</script>';
                return $url;

            }
        }else{
//            $RenrenCrypt = new RenrenCrypt();
//            $ids = base64_encode($RenrenCrypt->php_encrypt(join(",", $url)));
//
//            $param = array(
//                "service"     => "homemaking",
//                "template"    => "pay",
//                "param"       => "ordernum=".$ids
//            );
//            return getUrlPath($param);

            $order = createPayForm("homemaking",$ordernum, $price, '', '家政订单',array(),1);  //商城订单
            $timeout = GetMkTime(time()) + 1800;
            $order['timeout'] = $timeout;

            return  $order;


//            return createPayForm("homemaking", $ordernum, $price, '','家政订单',array(),1);  //商城订单
        }



    }

    /**
     * 支付前验证帐户积分和余额
     */
    public function checkPayAmount(){
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;

        $userid   = $userLogin->getMemberID();
        $param    = $this->param;

        //订单状态验证
        $payCheck = $this->payCheck();
        if($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  = $param['usePinput'] ;   //是否使用积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请登录后重试！
        if(empty($ordernum)) return array("state" => 200, "info" => $langData['homemaking'][9][15]);//提交失败，订单号不能为空！
        if(!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => $langData['homemaking'][9][16]);//请输入支付密码！

        $totalPrice = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT `orderstate`, `procount`, `payprice`, `price`, `servicetype`, `online`, `onlinepay`, `ordernumid`, `orderprice` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $procount   = $res['procount'];
            
            //验证服务
            if($res['onlinepay'] == 1 && $res['ordernumid'] != '' && $res['orderprice'] > 0){
                $totalPrice = $res['orderprice'];
            }else{
                $totalPrice = $res['payprice'];
            }
            // $orderprice = $res['orderprice'];
            // $totalPrice  = sprintf("%.2f", $procount * $orderprice);
            // $totalPrice  = $orderprice;
        }

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用余额，并且验证余额和支付密码
        if($useBalance == 1 && !empty($balance) && !empty($paypwd)){
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if($res['paypwd'] != $hash) return array("state" => 200, "info" => $langData['homemaking'][9][19]);//支付密码输入错误，请重试！
            //验证余额
            if($usermoney < $balance) return array("state" => 200, "info" => $langData['homemaking'][9][20]);//您的余额不足，支付失败！
            $useTotal += $balance;
            $tit[] = $langData['homemaking'][9][21];//余额
        }
        if($useTotal > $totalPrice) return array("state" => 200, "info" => $langData['homemaking'][9][22].join($langData['homemaking'][9][23], $tit).$langData['homemaking'][9][24].join($langData['homemaking'][9][23], $tit));//"您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit)
        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }

    //扫码code
    public function sweepcode(){
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;
        global $langData;
        $param =  $this->param;
        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        //重置表单参数
        $this->param = $param;

        $param_ = $param;
        $ordernum = $param['ordernum'];
        $paytype = $param['paytype'];
        $final      = (int)$param['final']; // 最终支付
        $paytype    = $param['paytype'];
        $usePinput  = $param['usePinput'];
//        $point      = (float)$param['point'];
        $useBalance = $param['useBalance'];
        $balance    = (float)$param['balance'];
        $ordernumArr = explode(",", $ordernum);

        if (!is_array($payTotalAmount)) {
            $amount =  $payTotalAmount;
        }else{
            return $payTotalAmount;
        }


        $totalPrice = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $procount   = $res['procount'];
            $orderprice = $res['orderprice'];

            $totalPrice += $orderprice;
        }

        $point      = getJifen('homemaking',$totalPrice);       //使用的积分



        //余额or积分混合支付
        if($final==1 &&($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

            $pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
            $balanceMoney = $balance;

            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT  `amount` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $orderprice = $res['amount']; //单价
                $oprice = $orderprice;  //单个订单总价 = 数量 * 单价

                $usePointMoney = 0;
                $useBalanceMoney = 0;

                //先判断积分是否足够支付总价
                //如果足够支付：
                //1.把还需要支付的总价重置为0
                //2.积分总额减去用掉的
                //3.记录已经使用的积分
                if($oprice < $pointMoney){
                    $pointMoney -= $oprice;
                    $usePointMoney = $oprice;
                    $oprice = 0;
                    //积分不够支付再判断余额是否足够
                    //如果积分不足以支付总价：
                    //1.总价减去积分抵扣掉的部部分
                    //2.积分总额设置为0
                    //3.记录已经使用的积分
                }else{
                    $oprice -= $pointMoney;
                    $usePointMoney = $pointMoney;
                    $pointMoney = 0;
                    //验证余额是否足够支付剩余部分的总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.余额减去用掉的部分
                    //3.记录已经使用的余额
                    if($oprice < $balanceMoney){
                        $balanceMoney -= $oprice;
                        $useBalanceMoney = $oprice;
                        $oprice = 0;
                        //余额不够支付的情况
                        //1.总价减去余额付过的部分
                        //2.余额设置为0
                        //3.记录已经使用的余额
                    }else{
                        $oprice -= $balanceMoney;
                        $useBalanceMoney = $balanceMoney;
                        $balanceMoney = 0;
                    }
                }



                //扫码支付 更新微信或者支付宝实际支付金额
                $paylogsql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `amount` = '$oprice' WHERE `body` = '$value'");
                $dsql->dsqlOper($paylogsql, "update");
            }


        }
        $isMobile = isMobile();

        global $userLogin;
        global $langData;

        if($userLogin->getMemberID() == -1) die($langData['siteConfig'][20][262]);  //登录超时，请重新登录！

        if($amount <= 0){
            die($langData['siteConfig'][21][254]);   //订单支付金额必须为整数或小数，小数点后不超过2位。
        }
        if(empty($paytype)){
            die($langData['siteConfig'][21][75]);   //请选择支付方式！
        }

        $ordernum = $ordernum ? $ordernum : create_ordernum();

        if($isMobile && empty($final)){
            $param_['ordernum'] = $ordernum;
            $param_['ordertype'] = 'deposit';
            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "pay",
                "param" => http_build_query($param_)
            );
            header("location:".getUrlPath($param));
            die;
        }

        // var_dump($amount);die;
        return createPayForm("homemaking", $ordernum, $amount, $paytype, $langData['siteConfig'][29][126]);   //订单支付

    }

    /**
     * 支付前验证订单内容
     * @return array
     */
    public function payCheck(){
        global $dsql;
        global $userLogin;
        global $langData;

        $param = $this->param;
        $ordernum = $param['ordernum'];

        if(empty($ordernum)) return array("state" => 200, "info" => $langData['homemaking'][9][25]);//订单号传递失败！

        $userid = $userLogin->getMemberID();
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //获取订单内容
            $archives = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice` FROM `#@__homemaking_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
            $orderDetail  = $dsql->dsqlOper($archives, "results");
            if($orderDetail){
                $proid      = $orderDetail[0]['proid'];
                $procount   = $orderDetail[0]['procount'];
                $orderprice = $orderDetail[0]['orderprice'];

                //验证订单状态
                if($orderstate != 0){
                    //订单中包含状态异常的订单，请确认后重试！ 订单状态异常，请确认后重试！
                    $info = count($ordernumArr) > 1 ? $langData['homemaking'][9][26] : $langData['homemaking'][9][27];
                    return array("state" => 200, "info" => $info);
                }

                $this->param = $proid;
                $proDetail = $this->detail();

                //验证是否为自己的店铺
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_store` WHERE `userid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    if($proDetail['company'] == $ret[0]['id']){
                        return array("state" => 200, "info" => $langData['homemaking'][9][28]);//企业会员不得购买自己公司的服务！
                    }
                }

                //获取商品详细信息
                if(empty($proDetail)){
                    //订单中包含不存在或已下架的商品，请确认后重试！ 提交失败，您要购买的商品不存在或已下架！
                    $info = count($ordernumArr) > 1 ? $langData['homemaking'][9][29] : $langData['homemaking'][9][30];
                    return array("state" => 200, "info" => $info);
                }
                //订单不存在
            }else{
                //订单中包含不存在的订单，请确认后重试！ 订单不存在或已删除，请确认后重试！
                $info = count($ordernumArr) > 1 ? $langData['homemaking'][9][31] : $langData['homemaking'][9][32];
                return array("state" => 200, "info" => $info);
            }
        }
        return "ok";
    }

    /**
     * 支付
     * @return array
     */
    public function pay(){
        global $dsql;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $langData;

        $param =  $this->param;

        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        //重置表单参数
        $this->param = $param;

        if($this->payCheck() != "ok" || is_array($payTotalAmount)){
            $param = array(
                "service"     => "member",
                "type"        => "user",
                "template"    => "order",
                "module"      => "homemaking"
            );
            $url = getUrlPath($param);
            header("location:".$url);
            die;
        }

        $ordernum   = $param['ordernum'];

        $paytype    = $param['paytype'];
        $usePinput  = $param['usePinput'];
//        $point      = (float)$param['point'];
        $useBalance = $param['useBalance'];
        $balance    = (float)$param['balance'];
        $ordernumArr = explode(",", $ordernum);
        $orderfinal  = (int)$param['orderfinal']; /*个人中心订单预下单 0,发起支付1 */

        $totalPrice = 0;
//        $ordernumArr = explode(",", $ordernum);
//        foreach ($ordernumArr as $key => $value) {
//            //查询订单信息
//            $archives = $dsql->SetQuery("SELECT `procount`, `orderprice` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
//            $results  = $dsql->dsqlOper($archives, "results");
//            $res = $results[0];
//            $procount   = $res['procount'];
//            $orderprice = $res['orderprice'];
//
//            $totalPrice += $orderprice * $procount;
//        }
//
//        $point      = getJifen('homemaking',$totalPrice);       //使用的积分
        if($orderfinal == 1) {
            $order = createPayForm("homemaking", $ordernum, $payTotalAmount, '', $langData['homemaking'][9][34], array(), 1);  //家政订单
            $timeout = GetMkTime(time()) + 1800;

            $order['timeout'] = $timeout;

            return $order;
        }

        //如果有使用积分或余额则更新订单内容的价格策略
        if(($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

            $pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
            $balanceMoney = $balance;

            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `procount`, `payprice` 'orderprice' FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $procount   = $res['procount'];   //数量
                $orderprice = $res['orderprice']; //单价
                $oprice = $orderprice;  //单个订单总价 = 数量 * 单价

                $usePointMoney = 0;
                $useBalanceMoney = 0;

                //先判断积分是否足够支付总价
                //如果足够支付：
                //1.把还需要支付的总价重置为0
                //2.积分总额减去用掉的
                //3.记录已经使用的积分
                if($oprice < $pointMoney){
                    $pointMoney -= $oprice;
                    $usePointMoney = $oprice;
                    $oprice = 0;
                    //积分不够支付再判断余额是否足够
                    //如果积分不足以支付总价：
                    //1.总价减去积分抵扣掉的部部分
                    //2.积分总额设置为0
                    //3.记录已经使用的积分
                }else{
                    $oprice -= $pointMoney;
                    $usePointMoney = $pointMoney;
                    $pointMoney = 0;
                    //验证余额是否足够支付剩余部分的总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.余额减去用掉的部分
                    //3.记录已经使用的余额
                    if($oprice < $balanceMoney){
                        $balanceMoney -= $oprice;
                        $useBalanceMoney = $oprice;
                        $oprice = 0;
                        //余额不够支付的情况
                        //1.总价减去余额付过的部分
                        //2.余额设置为0
                        //3.记录已经使用的余额
                    }else{
                        $oprice -= $balanceMoney;
                        $useBalanceMoney = $balanceMoney;
                        $balanceMoney = 0;
                    }
                }

                $pointMoney_ = $usePointMoney * $cfg_pointRatio;
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET  `balance` = '$useBalanceMoney' WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($archives, "update");
            }

            //如果没有使用积分或余额，重置积分&余额等价格信息
        }else{
            foreach ($ordernumArr as $key => $value) {
                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `procount`, `payprice` 'orderprice' FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $procount   = $res['procount'];   //数量
                $orderprice = $res['orderprice']; //单价
                $oprice = $orderprice;  //单个订单总价 = 数量 * 单价

                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET  `balance` = '0' WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($archives, "update");
            }
        }

        //1.如果需要支付的金额小于等于0，表示会员使用积分或余额已经付清了，不需要另外去支付
        //2.这种情况直接更新订单状态，并跳转至支付成功页即可
        //3.对会员的积分和余额进行扣除操作
        if($payTotalAmount <= 0){

            $date = GetMkTime(time());
            $paytype = array();

            //扣除会员账户积分和余额
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `userid`, `point`, `balance` FROM `#@__homemaking_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
                $userid  = $res['userid'];   //购买用户ID
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额

                //扣除会员积分
                if(!empty($upoint) && $upoint > 0){
                    $paytype[] = "point";
                }

                //扣除会员余额
                if(!empty($ubalance) && $ubalance > 0){
                    $paytype[] = "money";
                }

            }


            //增加支付日志
            $paylognum = create_ordernum();
            $paysql   = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
            $payre    = $dsql->dsqlOper($paysql,"results");
            if (!empty($payre)) {
                if($userid > 0){
                    //增加支付日志
                    $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `ordertype` = 'homemaking',`ordernum` ='$ordernum',`uid` = '$userid',`body` = '$ordernum',`amount` ='0',`paytype` ='".join(",", $paytype)."'
                         ,`state` = 1 WHERE `ordernum` = '$ordernum' AND `ordertype` = 'homemaking' ");
                }
            }else{
                if($userid > 0){
                    $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('homemaking', '$ordernum', '$userid', '$ordernum', 0, '$paytype', 1, $date)");
                    $dsql->dsqlOper($archives, "results");
                }

            }
            $dsql->dsqlOper($archives, "update");

            //执行支付成功的操作
            $this->param = array(
                "paytype" => join(",", $paytype),
                "ordernum" => $ordernum
            );
            $this->paySuccess();

            //跳转至支付成功页面
            if(isMobile()){
                $param = array(
                    "service"     => "homemaking",
                    "template"    => "payreturn",
                    "ordernum"    => $ordernum
                );
                $url = getUrlPath($param);

                //支付成功后跳转页面
                global $cfg_payReturnType;
                global $cfg_payReturnUrlPc;
                global $cfg_payReturnUrlTouch;

                if($cfg_payReturnType){

                    //移动端自定义跳转链接
                    if(isMobile() && $cfg_payReturnUrlTouch){
                        $url = $cfg_payReturnUrlTouch;
                    }
                }
                return $url;
            }else{

                $param = array(
                    "service"     => "homemaking",
                    "template"    => "index"
                );
                $url = getUrlPath($param);

                //支付成功后跳转页面
                global $cfg_payReturnType;
                global $cfg_payReturnUrlPc;
                global $cfg_payReturnUrlTouch;

                if($cfg_payReturnType){

                    //电脑端自定义跳转链接
                    if(!isMobile() && $cfg_payReturnUrlPc){
                        $url = $cfg_payReturnUrlPc;
                    }
                }

                return $url;
            }

        }else{
            //跳转至第三方支付页面
           return createPayForm("homemaking", $ordernum, $payTotalAmount, $paytype, $langData['homemaking'][9][34]);//家政订单
        }

    }

    /**
     * 支付成功
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
     */
    public function paySuccess(){

        $param = $this->param;
        if(!empty($param)){
            global $dsql;
            global $langData;
            global $siteCityInfo;
            global $userLogin;
            global $cfg_pointRatio;
            $paytype  = $param['paytype'];
            $transaction_id  = $param['transaction_id'];
            $paramArr = explode(",", $param['ordernum']);
            $date = GetMkTime(time());

            foreach ($paramArr as $key => $value) {
                //查询订单信息
                $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`doortime`, o.`orderprice`, o.`onlinepay`, o.`ordernumid`, o.`proid`, o.`procount`, o.`point`, o.`balance`, o.`payprice`, o.`paydate`, l.`title`, l.`homemakingtype`,s.`title` storename, s.`userid` as businessid, s.`cityid` as store FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE o.`ordernum` = '$value'");

                $res = $dsql->dsqlOper($archives, "results");

                if($res){

                    $title          = $res[0]['title'];
                    $foodtitle      = $res[0]['title'];
                    $storename      = $res[0]['storename'];
                    $orderid        = $res[0]['id'];
                    $uid            = $res[0]['businessid'];//商家ID
                    $userid         = $res[0]['userid'];//会员ID
                    $proid          = $res[0]['proid'];
                    $procount       = $res[0]['procount'];
                    $upoint         = $res[0]['point'];
                    $ubalance       = $res[0]['balance'];
                    $payprice       = $res[0]['payprice'];
                    $paydate        = $res[0]['paydate'];
                    $homemakingtype = $res[0]['homemakingtype'];
                    $expireddate    = $res[0]['doortime'];
                    $onlinepay      = $res[0]['onlinepay'];
                    $orderprice     = $res[0]['orderprice'];


                    $ordernumid     = $res[0]['ordernumid'];
                    $cityid     	= $res[0]['store'];//城市id
                    $sql = $dsql->SetQuery("SELECT `id`,`amount` FROM `#@__pay_log` WHERE `body` = '$value' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    $truepayprice = 0;
                    if($ret){
                        $truepayprice   = $ret[0]['amount'];
                        $pid            = $ret[0]['id'];
                    }

                    //获取分站id
                    $cityName = getSiteCityName($cityid);

                    if($onlinepay == 1){

                        $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$value'");
                        $dsql->dsqlOper($archives, "update");

                        $totalPrice = $payprice;

                        //扣除会员积分
                        if(!empty($upoint) && $upoint > 0){
                            global  $userLogin;
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser   = (int)($userpoint-$upoint);
                            //保存操作日志
                            $info = $langData['homemaking'][9][35] . $value;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");//支付家政订单
                            $dsql->dsqlOper($archives, "update");
                        }

                        //扣除会员余额
                        if(!empty($ubalance) && $ubalance > 0){
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $totalPrice += $ubalance;



                        //增加冻结金额
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");


                        //保存操作日志
                        $info = $langData['homemaking'][9][92].'-'.$title.'-'.$value;//家政线上收费

                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $ordernumid ? $ordernumid : $orderid
                        );
                        $user  = $userLogin->getMemberInfo($userid);
                        $usermoney = $user['money'];
//                        $money  =  sprintf('%.2f',($usermoney-$orderprice));
                        $title = "家政消费-".$storename;
                        $urlParam = serialize($paramUser);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0','$payprice', '$info','$date','homemaking','xiaofei','$pid','$urlParam','$title','$value','$usermoney')");

                        $dsql->dsqlOper($archives, "update");
                        }
                        global  $paytypee;
                        $paytypee = $paytype;
                        //扣除佣金
                        global $cfg_homemakingFee;
                        global $cfg_fzhomemakingFee;
                        $fee = $orderprice * $cfg_homemakingFee / 100;
                        $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
                        $fee = $fee < 0.01 ? 0 : $fee;

                        $orderprice_ = sprintf('%.2f', $orderprice - $fee);

                        //分销信息
                        global $cfg_fenxiaoState;
                        global $cfg_fenxiaoSource;
                        global $cfg_fenxiaoDeposit;
                        global $cfg_fenxiaoAmount;
                        include HUONIAOINC."/config/homemaking.inc.php";
                        $fenXiao = (int)$customfenXiao;

                        //分销金额
                        $_fenxiaoAmount = $orderprice;
                        if($cfg_fenxiaoState && $fenXiao){

                            //商家承担
                            if($cfg_fenxiaoSource){
                                $fx_shouldMoney = ($orderprice * $cfg_fenxiaoAmount / 100);
                                $orderprice_ = $orderprice_ - $fx_shouldMoney;

                                //平台承担
                            }else{
                                $_fenxiaoAmount = $fee;
                            }
                        }

                        $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                        //分佣 开关
                        $paramarr['amount'] = $_fenxiaoAmount;
                        if($fenXiao ==1){
                            $_fx_title = $value;
                            (new member())->returnFxMoney("homemaking", $userid, $_fx_title,$paramarr);
                            //查询一共分销了多少佣金
                            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'homemaking'");
                            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                            if($cfg_fenxiaoSource){
                                if(!$cfg_fenxiaoDeposit){
                                    $orderprice_     += $fenxiaomonyeres[0]['allfenxiao']; //没沉淀，还给商家
                                }else{
                                    $precipitateMoney = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                                    if($precipitateMoney > 0){
                                        (new member())->recodePrecipitationMoney($uid,$value,$_fx_title,$precipitateMoney,$cityid,"homemaking");
                                    }
                                }
                            }
                        }

                        $orderprice_ = $orderprice_ < 0.01 ? 0 : $orderprice_;

                        //将费用打给商家
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$orderprice_' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        //分站佣金
                        $fzFee = cityCommission($cityid,'homemaking');
                        //将费用打给分站
                        $fztotalAmount_ =  $fee * $fzFee / 100 ;
                        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                        $fee-=$fztotalAmount_;//总站-=分站
                        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                        $dsql->dsqlOper($fzarchives, "update");


                        //保存操作日志
                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $orderid
                        );
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
//                        $money      = sprintf('%.2f',($usermoney+$orderprice_));
                        $urlParam = serialize($paramBusi);
                        $info  = $langData['homemaking'][9][92].'-'.$title.'-'.$value;//家政线上收费
                        $title = '家政收入-'.$foodtitle;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$orderprice_', '$info', '$date','$cityid','$fztotalAmount_','homemaking',$fee,'shangpinxiaoshou','$urlParam','$title','$value','$usermoney')");
                        $dsql->dsqlOper($archives, "update");

                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$orderprice_', '$info', '$date','$cityid','$fztotalAmount_','homemaking',$fee,1,'shangpinxiaoshou')");
//                        $dsql->dsqlOper($archives, "update");
                        $lastid = $dsql->dsqlOper($archives, "lastid");
                        substationAmount($lastid,$cityid);

                        if($truepayprice <=0){
                            $truepayprice = $orderprice_;
                        }
                        //工行E商通银行分账
                        if($transaction_id){
                            rfbpShareAllocation(array(
                                "uid" => $uid,
                                "ordertitle" => $langData['homemaking'][9][92],
                                "ordernum" => $value,
                                "orderdata" => array('家政服务' => $title),
                                "totalAmount" => $orderprice,
                                "amount" => $truepayprice,
                                "channelPayOrderNo" => $transaction_id,
                                "paytype" => $paytype
                            ));
                        }

                        //返积分
                        (new member())->returnPoint("homemaking", $userid, $orderprice, $value,$orderprice_,$uid);

                        //微信通知
                        $param = array(
                            'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' =>array(
                                'contentrn'  => $cityName.'分站——homemaking模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                'date' => date("Y-m-d H:i:s", time()),
                            )
                        );

                        $params = array(
                            'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' =>array(
                                'contentrn'  => $cityName.'分站——homemaking模块——平台获得佣金 :'.$fee.' 元——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                'date' => date("Y-m-d H:i:s", time()),
                            )
                        );
                        //后台微信通知
                        updateAdminNotice("homemaking", "detail",$param);
                        updateAdminNotice("homemaking", "detail",$params);


                        //======================================更新关联订单=====================================================

                        //更新订单状态
                        $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 6 WHERE `ordernum` = '$ordernumid'");
                        $dsql->dsqlOper($archives, "update");
                        //验证订单
                        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`userid`, l.`title`, l.`homemakingtype`, s.`userid` as uid , s.`cityid` as store FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`ordernum` = '$ordernumid'");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if($results){

                            //将订单费用转到卖家帐户
                            $date       = GetMkTime(time());
                            $ordernum   = $results[0]['ordernum'];   //订单号
                            $procount   = $results[0]['procount'];   //数量
                            $orderprice = $results[0]['orderprice']; //单价
                            $balance    = $results[0]['balance'];    //余额金额
                            $payprice   = $results[0]['payprice'];   //支付金额
                            $userid     = $results[0]['userid'];     //买家ID
                            $uid        = $results[0]['uid'];        //卖家ID
                            $title      = $results[0]['title'];      //商品名称
                            $homemakingtype = $results[0]['homemakingtype'];      //
                            $ordernumIds= $results[0]['id'];   //订单号ID
                            $cityid     	= $results[0]['store'];//城市id

                            //获取分站id
                            $cityName = getSiteCityName($cityid);

                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                            $ret = $dsql->dsqlOper($sql, "results");
                            $pid = '';
                            if($ret){
                                $pid            = $ret[0]['id'];
                            }

                            //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
                            $totalPayPrice = $orderprice;
                            if($balance > 0){

                                //减去消费会员的冻结金额
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$balance' WHERE `id` = '$userid'");
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

                                //保存操作日志
                                $paramUser = array(
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "orderdetail",
                                    "action"   => "homemaking",
                                    "id"       => $ordernumIds
                                );
                                $user  = $userLogin->getMemberInfo($userid);
                                $usermoney = $user['money'];
                                $urlParam = serialize($paramUser);
                                $info = $langData['homemaking'][10][20].'-'.$title.'-'.$ordernum;//家政线上收费
                                $title = '家政消费-'.$storename;
                                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPayPrice', '$info', '$date','homemaking','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                                // $dsql->dsqlOper($archives, "update");

                            }

                            //商家结算
                            $totalAmount += $orderprice;

                            //扣除佣金
                            global $cfg_homemakingFee;
                            global $cfg_fzhomemakingFee;
                            $cfg_homemakingFee = (float)$cfg_homemakingFee;
                            $cfg_fzhomemakingFee = (float)$cfg_fzhomemakingFee;

                            $fee = $totalAmount * $cfg_homemakingFee / 100;
                            $fee = $fee < 0.01 ? 0 : $fee;
                            $totalAmount_ = sprintf('%.2f', $totalAmount - $fee);
                            //分站佣金
                            $fzFee = cityCommission($cityid,'homemaking');
                            //分站
                            $fztotalAmount_ =  $fee * $fzFee / 100 ;
                            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                            $fee-=$fztotalAmount_;//总站-=分站
                            if($homemakingtype==2){
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalAmount_' WHERE `id` = '$uid'");
                                $dsql->dsqlOper($archives, "update");
                                //分站
                                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                                $dsql->dsqlOper($fzarchives, "update");
                                //保存操作日志
                                $paramBusi = array(
                                    "service"  => "member",
                                    "template" => "orderdetail",
                                    "action"   => "homemaking",
                                    "id"       => $ordernumIds
                                );
                                $user  = $userLogin->getMemberInfo($uid);
                                $usermoney = $user['money'];
//                                $money  = sprintf('%.2f',($usermoney+$totalAmount_));
                                $urlParam = serialize($paramBusi);
                                $info  = '家政收入-'.$title.'-'.$ordernum;//家政线上收费
                                $title = '家政收入-'.$foodtitle;
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '$info', '$date','homemaking','shangpinxiaoshou','$urlParam','$title','$ordernum','$usermoney')");
                                $dsql->dsqlOper($archives, "update");

                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '$info', '$date','$cityid','$fztotalAmount_','homemaking',$fee,'1','shangpinxiaoshou','$usermoney')");
//                                $dsql->dsqlOper($archives, "update");
                                $lastid = $dsql->dsqlOper($archives, "lastid");
                                substationAmount($lastid,$cityid);


                                //微信通知
                                $param = array(
                                    'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                                    'cityid' => $cityid,
                                    'notify' => '管理员消息通知',
                                    'fields' =>array(
                                        'contentrn'  => $cityName.'分站——homemaking模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                        'date' => date("Y-m-d H:i:s", time()),
                                    )
                                );

                                $params = array(
                                    'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                                    'cityid' => $cityid,
                                    'notify' => '管理员消息通知',
                                    'fields' =>array(
                                        'contentrn'  => $cityName.'分站——homemaking模块——平台获得佣金 :'.$fee.' 元——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                        'date' => date("Y-m-d H:i:s", time()),
                                    )
                                );
                                //后台微信通知
                                updateAdminNotice("homemaking", "detail",$param);
                                updateAdminNotice("homemaking", "detail",$params);

                            }


                            //商家会员消息通知
                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "orderdetail",
                                "action"   => "homemaking",
                                "id"       => $ordernumIds
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
                                "title" => $title,
                                "amount" => $totalPayPrice,
                                "fields" => array(
                                    'keyword1' => '商品信息',
                                    'keyword2' => '下单时间',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '订单状态'
                                )
                            );

                            updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config,'','',0,1);

                            //支付成功，会员消息通知
                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "homemaking",
                                "id"       => $ordernumIds
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
                                "order" => $value,
                                "title" => $title,
                                "amount" => $orderprice,
                                "fields" => array(
                                    'keyword1' => '商品信息',
                                    'keyword2' => '付款时间',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '订单状态'
                                )
                            );

                            updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config,'','',0,1);

                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "orderdetail",
                                "action"   => "homemaking",
                                "id"       => $ordernumIds
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
                                "title" => $title,
                                "order" => $value,
                                "amount" => $orderprice,
                                "fields" => array(
                                    'keyword1' => '订单编号',
                                    'keyword2' => '商品名称',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '付款状态',
                                    'keyword5' => '付款时间'
                                )
                            );

                            updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);
                        }

                    }else{

                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$value' AND `state` = 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $pid = '';
                        if($ret){
                            $pid            = $ret[0]['id'];
                        }

                        //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
                        if($paydate == 0){

                            //更新订单状态
                            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$value'");


                            $dsql->dsqlOper($archives, "update");

                            //更新已购买数量
                            $sql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` + $procount WHERE `id` = '$proid'");
                            $dsql->dsqlOper($sql, "update");

                            $totalPrice = $payprice;

                            //扣除会员积分
                            if(!empty($upoint) && $upoint > 0){
                                global  $userLogin;
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                                $dsql->dsqlOper($archives, "update");
                                $user  = $userLogin->getMemberInfo($userid);
                                $userpoint = $user['point'];
//                                $pointuser  = (int)($userpoint-$upoint);
                                //保存操作日志
                                $info = $langData['homemaking'][9][35] . $value;
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");//支付家政订单
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
                            //保存操作日志
                            if($ubalance>0){
                                $paramUser = array(
                                    "service"  => "member",
                                    "type"     => "user",
                                    "template" => "orderdetail",
                                    "action"   => "homemaking",
                                    "id"       => $orderid
                                );
                                $urlParam = serialize($paramUser);
                                $user  = $userLogin->getMemberInfo($userid);
                                $usermoney = $user['money'];
//                                $money      = sprintf('%.2f',($usermoney-$totalPrice));
                                $info_ = $langData['homemaking'][9][35].$title.'-'.$value;//家政线上收费
                                $title = '家政消费-'.$storename;
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$payprice', '$info_', '$date','homemaking','xiaofei','$pid','$urlParam','$title','$value','$usermoney')");//家政消费
                                $dsql->dsqlOper($archives, "update");
                            }

                            //生成服务码
                            if($homemakingtype == 1){
                                $sqlQuan = array();
                                $carddate = GetMkTime(time());
                                for ($i = 0; $i < $procount; $i++) {
                                    $cardnum = genSecret(12, 1);
                                    $sqlQuan[$i] = "('$orderid', '$cardnum', '$carddate', 0, '$expireddate')";
                                }

                                $sql = $dsql->SetQuery("INSERT INTO `#@__homemakingquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES ".join(",", $sqlQuan));
                                $dsql->dsqlOper($sql, "update");
                            }
                            //支付成功，会员消息通知
                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "homemaking",
                                "id"       => $orderid
                            );

                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "orderdetail",
                                "action"   => "homemaking",
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
                                "order" => $value,
                                "amount" => $orderprice,
                                "title" => $title,
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
                            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if($ret){
                                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                            }

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "title" => $title,
                                "order" => $value,
                                "amount" => $orderprice,
                                "fields" => array(
                                    'keyword1' => '订单编号',
                                    'keyword2' => '商品名称',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '付款状态',
                                    'keyword5' => '付款时间'
                                )
                            );


                            updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config,'','',0,1);

                        }
                    }

                }
            }
        }
    }

    /**
     * 家政订单列表
     * @return array
     */
    public function orderList(){
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $store = $state = $userid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！
            }else{
                $store    	= $this->param['store'];
                $state    	= $this->param['state'];
                $dispatchid = $this->param['dispatchid'];
                $userid   	= $this->param['userid'];
                $model   	= $this->param['model'];
                $backTotal  = (int)$this->param['backTotal'];
                $page     	= $this->param['page'];
                $pageSize 	= $this->param['pageSize'];
                $ordernum   =$this->param['ordernum'];
                $title    = trim($this->param['title']);
            }
        }

        if(empty($userid)){
            global $userLogin;
            $userid = $userLogin->getMemberID();
        }

        //搜索订单
        if($title){
            if($store){
                $where .= " AND (o.`ordernum` LIKE '%$title%' OR l.`title` LIKE '%$title%' OR m.`company` LIKE '%$title%' OR m.`nickname` LIKE '%$title%')";
            }else{
                $where .= " AND (o.`ordernum` LIKE '%$title%' OR l.`title` LIKE '%$title%' OR m.`company` LIKE '%$title%')";
            }
        }


        if(empty($userid)) return array("state" => 200, "info" => $langData['homemaking'][9][37]);//会员ID不得为空！
        //个人会员订单 派单人员
        if(empty($store)){
            $_where = " AND o.`userid` = '$userid' AND `onlinepay` = '0'";
            if(!empty($dispatchid)){
                $_where = " AND o.`dispatchid` = '$dispatchid' AND `onlinepay` = '0'";
            }
            $where .= $_where;
            if ($ordernum)
            {
                $where .= " AND o.`ordernum` = $ordernum";
            }
            //时间筛选
            $archives = $dsql->SetQuery("SELECT " .
                "o.`id`, o.`ordernum`, l.`homemakingtype`, s.`aftersale`, s.`title`, o.`online`, o.`statementtime`,o.`servicetype`, o.`dispatchid`, o.`price`, o.`grabtype`, o.`usercontact`, o.`doortime`, o.`proid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`paytype`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`refundnumber`, o.`exp-date`, m.`company`, s.`tel`, s.`retreat` " .
                "FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`userid` " .
                "WHERE 1 = 1" . $where);
            //商家订单列表
        }else{

            $where .= " AND s.`userid` = '$userid' AND o.`orderstate` != 0 AND `onlinepay` = '0' ";
            if(!empty($dispatchid)){
                $where = " AND o.`dispatchid` = '$dispatchid' AND o.`orderstate` != 0 AND `onlinepay` = '0'";
            }
            // if ($datetime) {
            // 	$time = explode(',', $datetime);
            // 	$where .= "AND statementtime BETWEEN $time[0] AND $time[1]";
            // }
            $userinfo = $userLogin->getMemberInfo();
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
            }
            if ($ordernum)
            {
                $where .= " AND o.`ordernum` = $ordernum";
            }
            $archives = $dsql->SetQuery("SELECT " .
                "o.`id`, o.`ordernum`, l.`homemakingtype`, s.`aftersale`, s.`title`, o.`online`,o.`statementtime`, o.`servicetype`, o.`dispatchid`, o.`price`,o.`grabtype`, o.`userid`, o.`refundnumber`, o.`usercontact`, o.`doortime`, o.`proid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`paytype`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`exp-date`, m.`company`, s.`tel`, s.`retreat` " .
                "FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`userid` " .
                "WHERE 1 = 1" . $where);
        }
        //时间筛选
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        //抢单查询
        //商家id查询
        $uidarchives = $dsql->SetQuery("SELECT s.`userid` FROM `#@__homemaking_personal` p LEFT JOIN `#@__homemaking_store` s ON p.`company` = s.`id` WHERE p.`userid` = $userid");
        $uresults = $dsql->dsqlOper($uidarchives,"results");
        $grabuserid = $uresults[0]['userid'];
        if(!$grabuserid){
            $grabwhere = " 1 = 2";
        }else{
            $grabwhere = "s.`userid` = $grabuserid AND o.`onlinepay` = '0' AND o.`grabtype` = 1 AND o.`dispatchid` = 0 AND o.`orderstate` in (2,4)";
        }
        $grabarchives = $dsql->SetQuery("SELECT " .
            "o.`id`, o.`ordernum`, l.`homemakingtype`, s.`aftersale`, s.`title`, o.`online`,o.`useraddr`,o.`statementtime`, o.`servicetype`, o.`dispatchid`, o.`price`, o.`grabtype`, o.`usercontact`, o.`doortime`, o.`proid`, o.`procount`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`exp-date`, o.`refundnumber`, m.`company`, s.`tel`, s.`retreat` " .
            "FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`userid`" .
            "WHERE " . $grabwhere);

        //总条数
        // if($state ==10){
        //     $totalCount = $dsql->dsqlOper($grabarchives, "totalCount");
        // }else{

            $totalCount = $dsql->dsqlOper($archives, "totalCount", "ASSOC", '', 0);

        // }
        
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        //待服务
        $state20 = $dsql->dsqlOper($archives." AND (`orderstate` = 2 or `orderstate` = 4)", "totalCount", "ASSOC", '', 0);
        //待抢单
        $state10 = $dsql->dsqlOper($grabarchives." AND `orderstate` != 0", "totalCount", "ASSOC", '', 0);
        if($backTotal ==1) return array('state20' =>$state20,'state10'=>$state10);
        //未付款
        $state0 = $dsql->dsqlOper($archives." AND `orderstate` = 0", "totalCount", "ASSOC", '', 0);
        //已付款，待确认
        $state1 = $dsql->dsqlOper($archives." AND `orderstate` = 1", "totalCount", "ASSOC", '', 0);

        //待服务
        $state2 = $dsql->dsqlOper($archives." AND `orderstate` = 2", "totalCount", "ASSOC", '', 0);
        //服务无效
        $state3 = $dsql->dsqlOper($archives." AND `orderstate` = 3", "totalCount", "ASSOC", '', 0);
        //已确认，待服务
        $state4 = $dsql->dsqlOper($archives." AND `orderstate` = 4", "totalCount", "ASSOC", '', 0);
        //已服务，待客户验收
        $state5 = $dsql->dsqlOper($archives." AND `orderstate` = 5", "totalCount", "ASSOC", '', 0);
        //服务完成
        $state6 = $dsql->dsqlOper($archives." AND `orderstate` = 6", "totalCount", "ASSOC", '', 0);
        //已取消
        $state7 = $dsql->dsqlOper($archives." AND `orderstate` = 7", "totalCount", "ASSOC", '', 0);
        //退款中
        $state8 = $dsql->dsqlOper($archives." AND `orderstate` = 8 and `ret-state` = 1 ", "totalCount", "ASSOC", '', 0);
        //已退款
        $state9 = $dsql->dsqlOper($archives." AND (o.`orderstate` = 8  or o.`orderstate` = 9 or `ret-state` = 1)", "totalCount", "ASSOC", '', 0);

        //结单
        $state11 = $dsql->dsqlOper($archives." AND `orderstate` = 11", "totalCount", "ASSOC", '', 0);
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "state0"    => $state0,
            "state1"    => $state1,
            "state2"    => $state2,
            "state3"    => $state3,
            "state4"    => $state4,
            "state5"    => $state5,
            "state6"    => $state6,
            "state7"    => $state7,
            "state8"    => $state8,
            "state9"    => $state9,
            "state20"   => $state20,
            "state10"   => $state10,
            "state11"   => $state11
        );

        //统计
        if ($state == 11) {
            // $uidarchives = $dsql->SetQuery("SELECT s.`userid` FROM `#@__homemaking_personal` p LEFT JOIN `#@__homemaking_store` s ON p.`company` = s.`id` WHERE p.`userid` = $userid");
            // $uresults = $dsql->dsqlOper($uidarchives,"results");
            $where = "`dispatchid` = $dispatchid AND `orderstate` = '11'";
            $ftime = strtotime($this->param['ftime']);
            $etime = strtotime($this->param['etime'].'23:59:59');
            if (!empty($ftime)||!empty($etime)) {
                $where .= "AND statementtime BETWEEN $ftime AND $etime";
            }

            $group = " group by o.`proid` ";
            $counsql = $dsql->SetQuery("SELECT o.`id` , o.`online` , o.`proid` , sum(o.`procount`) as num, sum(o.`orderprice`) as yuyue , sum(o.`price`) as follow  , l.`title` FROM `#@__homemaking_order` o  LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` WHERE".$where.$group);
            $coutresult = $dsql->dsqlOper($counsql,"results");
            if($model==1){
                return array("coutresult" => $coutresult);
            }
        }

        // if($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

        $where = "";
        if($state != "" && $state != 20 && $state != 10){
            $where = " AND `orderstate` = " . $state;
        }

        //退款
        if($state == 8){
            $where = " AND `ret-state` = 1";
        }

        if($state == 20){
            $where = " AND (`orderstate` = 2 or `orderstate` = 4)";
        }

        if($state == 9){
            $where = " AND (`orderstate` = 8 or `orderstate` = 9 or `ret-state` = 1)";
        }


        //待评价
        if($state == 5){
            //$where = " AND `orderstate` = 3 AND `common` = 0";
        }

        //已发货
        if($state == 6){
            //$where = " AND `orderstate` = 6 AND `exp-date` != 0";
        }

        $atpage = $pageSize*($page-1);
        $where .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";
        if($state==10){
            $results = $dsql->dsqlOper($grabarchives.$where, "results", "ASSOC", '', 0);
        }else{
            $results = $dsql->dsqlOper($archives.$where, "results", "ASSOC", '', 0);
        }
        if($results){

            $param = array(
                "service"     => "homemaking",
                "template"    => "pay",
                "param"       => "ordernum=%id%"
            );
            $payurlParam = getUrlPath($param);

            $param = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "homemaking",
                "id"       => "%id%",
                "param"    => "rates=1"
            );
            $commonUrlParam = getUrlPath($param);
            foreach($results as $key => $val){
                $list[$key]['id']          = $val['id'];
                $list[$key]['ordernum']    = $val['ordernum'];
                $list[$key]['proid']       = $val['proid'];
                $list[$key]['procount']    = $val['procount'];
                $list[$key]['company']     = $val['company'];
                $list[$key]['title']       = $val['title'];
                $list[$key]['price']       = $val['price'];
                $list[$key]['aftersale']   = $val['aftersale'];
                $list[$key]['useraddr']   = $val['useraddr'] ? $val['useraddr'] : '';

                $doortime = $val['doortime'] ? explode("|", $val['doortime']) : array();
                $list[$key]['doortime'] = $val['doortime'] ? str_replace("|", " ", $val['doortime']) : '';
                $list[$key]['doortime_date'] = $doortime ? GetMkTime($doortime[0]) : '';
                $list[$key]['doortime_time'] = $doortime ? $doortime[1] : '';

                //计算订单价格
                $totalPrice = $val['orderprice'];
                $list[$key]["refundnumber"]  = $val['refundnumber'];
                $list[$key]['orderprice']  = sprintf('%.2f', $totalPrice);
                $list[$key]["orderstate"]  = $val['orderstate'];
                $list[$key]['orderdate']   = $val['orderdate'];
                $list[$key]['paydate']     = $val['paydate'];

                //主表信息
                $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$val["paytype"]."'");
                $ret = $dsql->dsqlOper($sql, "results");
                if(!empty($ret)){
                    $list[$key]["paytype"] = $ret[0]['pay_name'];
                }else{

                    global $cfg_pointName;
                    $payname = "";
                    if($val["paytype"] == "point,money"){
                        $payname = $cfg_pointName."+余额";
                    }elseif($val["paytype"] == "point"){
                        $payname = $cfg_pointName;
                    }elseif($val["paytype"] == "money"){
                        $payname = "余额";
                    }else{
                        $payname = $val["paytype"];
                    }
                    
                    $list[$key]["paytype"] = $payname;
                }

                $list[$key]['retState']    = $val['ret-state'];
                $list[$key]['expDate']     = $val['exp-date'];
                $list[$key]['usercontact'] = $val['usercontact'];
                $list[$key]['tel']         = $val['tel'];
                $list[$key]['retreat']     = $val['retreat'];
                $list[$key]['dispatchid']  = $val['dispatchid'];
                $list[$key]['servicetype'] = $val['servicetype'];
                $list[$key]['online']      = $val['online'];
                $list[$key]['grabtype']    = $val['grabtype'];
                if ($val['statementtime'] =='') {
                    $list[$key]['statementtime'] = '';
                }else{
                    $list[$key]['statementtime']    = date('Y年m月d日 H:i:s',$val['statementtime']);
                }

                //买家信息
                //$uid = $val['userid'];
                //$list[$key]['member']     = getMemberDetail($uid);

                //派单人员
                    $this->param = $val['dispatchid'];
                    $personalDetail = $this->personalDetail();
                $list[$key]['dispatch']['courier']  = $personalDetail['username'] ? $personalDetail['username'] : '';

                $list[$key]['usertel'] = $val['tel'];
                if(!empty($personalDetail['tel'])){
                    $list[$key]['usertel'] = $personalDetail['tel'];
                }

                //服务详细
                $this->param = $val['proid'];
                $detail = $this->detail();

                $product = array();
                if($detail){

                    $product['title']  = $detail['title'];
                    $product['litpic'] = $detail['pics'][0]['path'];
                    $product['price'] = $detail['price'];
                    $product['typename'] = $detail['typename'];

                    $param = array(
                        "service"     => "homemaking",
                        "template"    => "detail",
                        "id"          => $val['proid']
                    );
                    $product['url'] = getUrlPath($param);
                }

                $list[$key]['product'] = $product;


                //未付款的提供付款链接
                if($val['orderstate'] == 0){
                    $RenrenCrypt = new RenrenCrypt();
                    $encodeid = base64_encode($RenrenCrypt->php_encrypt($val["ordernum"]));
                    $list[$key]["payurl"] = str_replace("%id%", $encodeid, $payurlParam);
                }

                //服务码
                $list[$key]["homemakingtype"] = $val["homemakingtype"];
                $cardnum = array();
                if($val["homemakingtype"] == 1 && $val['orderstate'] != 0){
                    $cardSql = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__homemakingquan` WHERE `orderid` = ". $val["id"]);
                    $cardResult = $dsql->dsqlOper($cardSql, "results");
                    if($cardResult){
                        foreach($cardResult as $k => $row){
                            $cardnum[$k]['cardnum']     = join(" ", str_split($row['cardnum'], 4));
                            $cardnum[$k]['usedate']     = $row['usedate'];
                            $cardnum[$k]['expireddate'] = $row['expireddate'];
                            $cardnumList[$k] = $row['cardnum'];
                        }
                    }
                }

                $list[$key]["cardnum"] = $cardnum;

                if($cardnum){
                    $param = array(
                        "service" => "member",
                        "template" => "verify-homemaking",
                        "param" => "cardnum=".join(",", $cardnumList)
                    );
                    $list[$key]["cardnumUrl"] = getUrlPath($param);
                }
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list ,"coutresult" => $coutresult);
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

        if(!is_numeric($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__homemaking_order` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['userid'] == $uid){

                if($results['orderstate'] == 0 || $results['orderstate'] == 7 || $results['orderstate'] == 3 || $results['orderstate'] == 6){//未付款 已取消 无效订单 服务完成
                    $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_order` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
    
                    //记录用户行为日志
                    memberLog($uid, 'homemaking', 'order', $id, 'delete', '删除订单('.$results['ordernum'].')', '', $archives);

                    return  $langData['homemaking'][9][63];//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['homemaking'][9][60]);//订单为不可删除状态！
                }
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][61]);//权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['homemaking'][9][62]);//订单不存在，或已经删除！
        }
    }



    /**
     * 家政订单详细
     * @return array
     */
    public function orderDetail(){
        global $dsql;
        global $langData;
        global  $cfg_pointRatio;
        $orderDetail = $cardnum = $cardnumList = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//格式错误！
        if(!is_numeric($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！
        //当前用户是否加入服务人员
        $dispatchid = '';
        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$userid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(!empty($personalres[0]['id'])){
            if($personalres[0]['state'] != 1){
                //return array("state" => 200, "info" => $langData['homemaking'][10][16]);//当前状态不正常，请联系商家！
            }
            $dispatchid = $personalres[0]['id'];
        }

        //主表信息
        $archives = $dsql->SetQuery("SELECT o.*, s.`id`as sid , s.`aftersale`  FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE (o.`dispatchid` = '$dispatchid' OR o.`userid` = '$userid' OR s.`userid` = '$userid') AND o.`id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        if(!empty($results)){

            $results = $results[0];

            $orderDetail["ordernum"] 		= $results["ordernum"];
            $orderDetail["userid"]   		= $results["userid"];
            $orderDetail["id"]   		= $results["id"];
            $orderDetail["status"]   		= $results["status"];
            $orderDetail["useraddr"]   		= aesDecrypt($results["useraddr"]);
            $orderDetail["username"]   		= aesDecrypt($results["username"]);
            $orderDetail["usercontact"] 	= aesDecrypt($results["usercontact"]);
            $orderDetail["dispatchid"]  	= $results["dispatchid"];
            $orderDetail["doortime"]   		= $results["doortime"];
            $orderDetail["rettype"]   		= $results["ret-type"];
            $orderDetail["retnote"]   		= $results["ret-note"];
            $orderDetail["servicetype"]   	= $results["servicetype"];
            $orderDetail["guarantee"]   	= $results["guarantee"];
            $orderDetail["online"]   		= $results["online"];
            $orderDetail["price"]   		= $results["price"];
            $orderDetail["servicedesc"]   	= $results["servicedesc"];
            $orderDetail["usernote"]   		= $results["usernote"];
            $orderDetail["failnote"]   		= $results["failnote"];
            $orderDetail["aftersale"]   	= $results["aftersale"];
            $orderDetail["businessbz"]   	= $results["businessbz"];
            $orderDetail["enddate"] = FloorTime($results["nopaydate"], $n = 2);
            $orderDetail["retmoney"]    	= $results["ret-money"];
            $orderDetail["refundnumber"]   		= $results["refundnumber"];
            $orderDetail["refundstatus"]   		= $results["refundstatus"];
            $orderDetail["refundordernumber"]   		= $results["refundordernumber"];
            $orderDetail["point"] 		= $results["point"];
            $orderDetail["pointprice"] 		= $results["point"] / $cfg_pointRatio;



            //会员信息
            $orderDetail['member'] = getMemberDetail($results['userid']);

            //派单人员
            $this->param = $results['dispatchid'];
            $personalDetail = $this->personalDetail();
            $orderDetail['dispatch']['courier']  = $personalDetail['username'] ? $personalDetail['username'] : '';
            $orderDetail['dispatch']['tel']      = $personalDetail['tel'] ? $personalDetail['tel'] : '';
            //协商历史
            $refundSql = $dsql->SetQuery("SELECT `type`,`service`  FROM `#@__homemaking_refund` WHERE orderid =".$results['id']." AND `service`=1 " );
                $refundresult = $dsql->dsqlOper($refundSql, "results");
            $orderDetail["type"]  = $refundresult[0]['type'];
            $orderDetail["service"]  = $refundresult[0]['service'];

            //商品信息
            $this->param = $results['proid'];
            $detail = $this->detail();

            $orderDetail['product']['id']       = $detail['id'];
            $orderDetail['product']['title']    = $detail['title'];
            $orderDetail['product']['pics']     = $detail['pics'][0]['pathSource'];
            $orderDetail['product']['litpic']   = $detail['pics'][0]['path'];
            $orderDetail['product']['homemakingtype'] = $detail['homemakingtype'];
            $orderDetail['product']['price']    = $detail['price'];

            $param = array(
                "service"     => "homemaking",
                "template"    => "detail",
                "id"          => $results['proid']
            );
            $url = getUrlPath($param);
            $orderDetail['product']['url'] = $url;


            $orderDetail["procount"]   = $results["procount"];

            //总价
            $orderprice = $results["orderprice"];
            $point      = $results["point"];
            $balance    = $results["balance"];
            $payprice   = $results["payprice"];
            $procount   = $results["procount"];

            $totalAmount += $orderprice;
            $freightMoney = 0;


            $orderDetail["orderprice"] = $orderprice;
            $orderDetail["totalmoney"] = $totalAmount;
            $orderDetail["point"]      = $point;
            $orderDetail["balance"]    = $balance;
            $orderDetail["payprice"]   = $payprice;
            $orderDetail["orderstate"] = $results["orderstate"];
            $orderDetail["orderdate"]  = $results["orderdate"];

            //未付款的提供付款链接
            if($results['orderstate'] == 0){
                $RenrenCrypt = new RenrenCrypt();
                $encodeid = base64_encode($RenrenCrypt->php_encrypt($results["ordernum"]));

                $param = array(
                    "service"     => "homemaking",
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
                    $payname = $cfg_pointName."+".$langData['homemaking'][9][43];//余额
                }elseif($results["paytype"] == "point"){
                    $payname = $cfg_pointName;
                }elseif($results["paytype"] == "money"){
                    $payname = $langData['homemaking'][9][43];//余额
                }
                $orderDetail["paytype"]   = $payname;
            }

            $orderDetail["paydate"]   = $results["paydate"];



            //服务码
            if($detail["homemakingtype"] == 1 && $results['orderstate'] != 0){
                $cardSql = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__homemakingquan` WHERE `orderid` = ". $results["id"]);
                $cardResult = $dsql->dsqlOper($cardSql, "results");
                if($cardResult){
                    foreach($cardResult as $key => $val){
                        $cardnum[$key]['cardnum']     = join(" ", str_split($val['cardnum'], 4));
                        $cardnum[$key]['usedate']     = $val['usedate'];
                        $cardnum[$key]['expireddate'] = $val['expireddate'];
                        $cardnumList[$key] = $val['cardnum'];
                    }
                }
            }

            if($cardnum){
                $orderDetail["cardnum"]   = $cardnum;

                $param = array(
                    "service" => "member",
                    "template" => "verify-homemaking",
                    "param" => "cardnum=".join(",", $cardnumList)
                );
                $orderDetail["cardnumUrl"] = getUrlPath($param);
            }
            $orderDetail["grabtype"]    =$results["grabtype"];

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

            $picslist = array();
            $pics = $results['pics'];
            if(!empty($pics)){
                $picsArr = explode(",", $pics);
                foreach ($picsArr as $key => $value) {
                    $picslist[$key]['val'] = $value;
                    $picslist[$key]['path'] = getFilePath($value);
                }
            }
            $orderDetail["picslist"]    = $picslist;

            //退款确定时间
            $orderDetail["retOkdate"]    = $results["ret-ok-date"];

            $orderDetail['now'] = GetMkTime(time());


            //卖家信息
            $this->param = (int)$results['sid'];
            $orderDetail['store'] = $this->storeDetail();

        }

        return $orderDetail;
    }

    /**
     * 操作订单状态
     * oper=yes: 有效
     * oper=no: 无效
     * oper=cancel: 取消订单
     * oper=see: 查看当前订单商家预约金是否可退
     * oper=dispatch 派单
     * oper=verify 免费预约 线下收费 验收
     * oper=cancelrefund 会员取消退款 返回上一次订单状态
     * @return array
     */
    public function operOrder(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        global $autoReceiptUserID;  //自动收货uid
        if($autoReceiptUserID){
            $userid = $autoReceiptUserID;
        }
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;

        $id              =  $param['id'];
        $courier         =  $param['courier'];
        $oper            =  $param['oper'];
        $failnote        =  $param['failnote'];
        $pubdate         =  GetMkTime(time());
        $date            =  GetMkTime(time());
        $grabid			 =  $param['grabid'];
        //发布抢单cxc
        if (!empty($grabid)){
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `grabtype` = '1' WHERE `id` = ".$grabid);
            $results = $dsql->dsqlOper($archives, "update");
            if($results == "ok"){
                return  $langData['homemaking']['10']['32']; //保存到数据时发生错误，请检查字段内容！
            }else{
                return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
            }

        }

        if($oper != 'cancel' && $oper != 'see' && $oper != 'verify' && $oper != 'cancelrefund'){
            //当前用户是否加入服务人员
            $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$userid);
            $personalres = $dsql->dsqlOper($sql, "results");
            if(!empty($personalres[0]['id'])){
                if($personalres[0]['state'] != 1){
                    return array("state" => 200, "info" => $langData['homemaking'][10][16]);//当前状态不正常，请联系商家！
                }
                $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `id` = ".$personalres[0]['company']);
            }else{
                $userinfo = $userLogin->getMemberInfo();
                if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                    return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
                }

                $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
            }

            $userResult = $dsql->dsqlOper($userSql, "results");
            if(!$userResult){
                return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
            }

            if($userResult[0]['state'] == 0){
                return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
            }

            if($userResult[0]['state'] == 2){
                return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
            }

            if($oper == 'no'){
                if(empty($failnote)) return array("state" => 200, "info" => $langData['homemaking'][9][48]);//请填写订单失败原因
            }

            if($oper == 'dispatch'){
                if(empty($courier)) return array("state" => 200, "info" => $langData['homemaking'][9][96]);//请选择派单人员
            }

            $company = $userResult[0]['id'];
        }

        if($oper == 'no'){//商家确认无效订单 状态未待确认
            $archives = $dsql->SetQuery("SELECT `id`, `procount`, `proid`, `ordernum`, `orderprice`, `userid` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results    = $results[0];
                $procount   = $results['procount'];
                $orderprice = $results['orderprice'];
                $ordernum   = $results['ordernum'];
                $uid        = $results['userid'];//买家ID
                $proid      = $results['proid'];

                //更新已购买数量
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
                $dsql->dsqlOper($sql, "update");


                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `failnote` = '$failnote', `orderstate` = '3' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '更新为无效订单('.$ordernum.')', '', $archives);

                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $id
                );

                $totalMoney = $orderprice;

                if($totalMoney>0){
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
                        "amount" => $totalMoney,
                        "info" => $failnote,
                        "note" => $failnote,
                        "fields" => array(
                            'keyword1' => '退款原因',
                            'keyword2' => '退款金额'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalMoney' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    //减去会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalMoney' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                    //如果冻结金额小于0，重置冻结金额为0
                    $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$uid'");
                    $ret = $dsql->dsqlOper($archives, "results");
                    if($ret){
                        if($ret[0]['freeze'] < 0){
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }

                    $pay_name = '';
                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "homemaking",
                        "id"       => $id
                    );
                    $urlParam = serialize($paramUser);

                    $tuikuan= array(
                        'paytype'               => '余额',
                        'truemoneysy'           => 0,
                        'money_amount'          => $totalMoney,
                        'point'                 => 0,
                        'refrunddate'           => 0,
                        'refrundno'             => 0
                    );
                    $tuikuanparam = serialize($tuikuan);
                    $user  = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
//                    $money       = sprintf('%.2f',($usermoney+$totalMoney));
                    //保存操作日志
                    $info = $langData['homemaking'][9][58].$ordernum;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$totalMoney', '$info', '$date','homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$usermoney')");
                    $dsql->dsqlOper($archives, "update");
                }

                return $langData['homemaking'][9][49];//提交成功！

            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == 'yes'){//商家确认有效订单
            $archives = $dsql->SetQuery("SELECT `id`, `proid`, `ordernum` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                $ordernum = $results['ordernum'];

                $sql = $dsql->SetQuery("SELECT `homemakingtype` FROM `#@__homemaking_list` WHERE `id` = " . $results['proid']);
                $res = $dsql->dsqlOper($sql, "results");
                $orderstate = 4;
                if($res[0]['homemakingtype'] == 1){
                    $orderstate = 2;
                }

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '$orderstate' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '更新为有效订单('.$ordernum.')', '', $archives);

                return $langData['homemaking'][9][49];//提交成功！

            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == 'cancel'){//个人取消订单
            $archives = $dsql->SetQuery("SELECT `id`, `orderstate`, `ordernum`, `procount`, `proid` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                $ordernum = $results['ordernum'];
                $procount=$results['procount'];
                $proid=$results['proid'];
                $orderstate = $results['orderstate'];

                //更新已购买数量
                if($orderstate != 0 && $orderstate != 7){
                    $sql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
                    $dsql->dsqlOper($sql, "update");
                }

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '7',`status`='0',`refundnumber`='0' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '取消订单('.$ordernum.')', '', $archives);

                return $langData['homemaking'][9][49];//提交成功！

            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == 'see'){//个人查看当前订单商家预约金是否可退
            $archives = $dsql->SetQuery("SELECT `id`, `proid`, `orderstate` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                $sql = $dsql->SetQuery("SELECT l.`homemakingtype`, s.`retreat` FROM `#@__homemaking_list` l LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE l.`id` = " . $results['proid']);
                $res = $dsql->dsqlOper($sql, "results");
                if($res){
                    //预约金   实价
                    $list = array();
                    $list['retreat']     = $res[0]['retreat'];
                    $list['type']       = 0;
                    if($results['orderstate'] == 1){
                        $list['retreat']    = 0;
                    }elseif(($results['orderstate'] == 2 && $res[0]['homemakingtype'] == 1) || ($results['orderstate'] == 4 && $res[0]['homemakingtype'] == 2)){
                        $list['type']        = 1;
                    }
                    $list['homemakingtype'] = $res[0]['homemakingtype'];

                    return $list;//提交成功！
                }else{
                    return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
                }
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == 'dispatch'){//派单
            $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`,`grabtype` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            //商家派单情况下如果被抢单返回错误
            if ($results[0]['grabtype']==2){
                return array("state" => 200, "info" =>'该单已被抢');
            }
            if($results){
                $results = $results[0];
                $ordernum = $results['ordernum'];

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `dispatchid` = '$courier'  WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '派单('.$ordernum.'=>'.$courier.')', '', $archives);

                return $langData['homemaking'][9][49];//提交成功！
            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == 'verify'){//免费预约 线下收费 验收
            //验证订单
            $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`userid`, l.`homemakingtype`, l.`title`, s.`userid` as uid , s.`cityid` as store FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`id` = '$id' AND o.`orderstate` = 5");
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){

                //更新订单状态
                $now = GetMkTime(time());
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '6' WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");

                //将订单费用转到卖家帐户
                $date       = GetMkTime(time());
                $ordernum   = $results[0]['ordernum'];   //订单号
                $procount   = $results[0]['procount'];   //数量
                $orderprice = $results[0]['orderprice']; //单价
                $balance    = $results[0]['balance'];    //余额金额
                $payprice   = $results[0]['payprice'];   //支付金额
                $userid     = $results[0]['userid'];     //买家ID
                $uid        = $results[0]['uid'];        //卖家ID
                $title      = $results[0]['title'];      //商品名称
                $foodtitle  = $results[0]['title'];      //商品名称
                $homemakingtype = $results[0]['homemakingtype'];      //商品名称

                $cityid     	= $results[0]['store'];//城市id
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '验收订单('.$ordernum.')', '', $sql);

                //获取分站id
                $cityName = getSiteCityName($cityid);
                //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
                // $totalPayPrice = $balance + $payprice;
                $totalPayPrice = $orderprice;
                if($totalPayPrice > 0){

                    //减去消费会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
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

                    //保存操作日志
                    // $info = $langData['homemaking'][10][20] . $ordernum;
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$totalPayPrice', '$info', '$date')");
                    // $dsql->dsqlOper($archives, "update");

                }

                //商家结算

                $totalAmount = sprintf("%.2f", $orderprice);

                //扣除佣金
                global $cfg_homemakingFee;
                global $cfg_fzhomemakingFee;
                $cfg_homemakingFee = (float)$cfg_homemakingFee;
                $cfg_fzhomemakingFee = (float)$cfg_fzhomemakingFee;

                $fee = $totalAmount * $cfg_homemakingFee / 100;
                $fee = $fee < 0.01 ? 0 : $fee;
                $totalAmount_ = sprintf('%.2f', $totalAmount - $fee);

                //分销信息
                global $cfg_fenxiaoState;
                global $cfg_fenxiaoSource;
                global $cfg_fenxiaoDeposit;
                global $cfg_fenxiaoAmount;
                include HUONIAOINC."/config/homemaking.inc.php";
                $fenXiao = (int)$customfenXiao;

                //分销金额
                $_fenxiaoAmount = $orderprice;
                if($cfg_fenxiaoState && $fenXiao){

                    //商家承担
                    if($cfg_fenxiaoSource){
                        $fx_shouldMoney = ($totalAmount * $cfg_fenxiaoAmount / 100);
                        $totalAmount_ = $totalAmount_ - $fx_shouldMoney;

                        //平台承担
                    }else{
                        $_fenxiaoAmount = $fee;
                    }
                }

                $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;

                //分站佣金
                $fzFee = cityCommission($cityid,'homemaking');
                $fztotalAmount_ =  $fee * $fzFee / 100 ;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                $fee-=$fztotalAmount_;//总站-=分站
                if($homemakingtype==2){//免费预约：免费；预约金：验证已收费；不需要再进行下面的操作。实价
                    //分佣 开关
                    $paramarr['amount'] = $_fenxiaoAmount;
                    if($fenXiao ==1){
                        $_fx_title = $ordernum;
                        (new member())->returnFxMoney("homemaking", $userid, $_fx_title,$paramarr);
                        //查询一共分销了多少佣金
                        $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'homemaking'");
                        $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                        if($cfg_fenxiaoSource){
                            //如果系统没有开启资金沉淀才需要查询实际分销了多少
                            if(!$cfg_fenxiaoDeposit){
                                $totalAmount_     += $fenxiaomonyeres[0]['allfenxiao']; //没沉淀，还给商家
                            }else{
                                $precipitateMoney = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                                if($precipitateMoney > 0){
                                    (new member())->recodePrecipitationMoney($uid,$ordernum,$_fx_title,$precipitateMoney,$cityid,"homemaking");
                                }
                            }
                        }
                    }
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalAmount_' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");

                    //分站
                    $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($fzarchives, "update");

                    $paramBusi = array(
                        "service"  => "member",
                        "template" => "orderdetail",
                        "action"   => "homemaking",
                        "id"       => $id
                    );
                    $urlParam = serialize($paramBusi);
                    $user  = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
//                    $money      =  sprintf('%.2f',($usermoney+$totalAmount_));
                    //保存操作日志
                    $info  = '家政收入-'.$title.'-'. $ordernum;
                    $title = '家政收入-'.$foodtitle;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`urlParam`,`balance`) VALUES ('$uid', '1','$totalAmount_', '$info', '$date','homemaking','shangpinxiaoshou','$title','$ordernum','$urlParam','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '$info', '$date','$cityid','$fztotalAmount_','homemaking',$fee,'1','shangpinxiaoshou','$usermoney')");
//                    $dsql->dsqlOper($archives, "update");
                    $lastid = $dsql->dsqlOper($archives, "lastid");
                    substationAmount($lastid,$cityid);



                    //返积分
                    (new member())->returnPoint("homemaking", $userid, $orderprice, $ordernum,$totalAmount_,$uid);


                    //微信通知
                    $param = array(
                        'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => $cityid,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $cityName.'分站——homemaking模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                            'date' => date("Y-m-d H:i:s", time()),
                        )
                    );

                    $params = array(
                        'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => $cityid,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $cityName.'分站——homemaking模块——平台获得佣金 :'.$fee.' 元——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                            'date' => date("Y-m-d H:i:s", time()),
                        )
                    );
                    //后台微信通知
                    updateAdminNotice("homemaking", "detail",$param);
                    updateAdminNotice("homemaking", "detail",$params);

                }

                //商家会员消息通知
                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
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
                    "title" => $title,
                    "amount" => $totalPayPrice,
                    "fields" => array(
                        'keyword1' => '商品信息',
                        'keyword2' => '下单时间',
                        'keyword3' => '订单金额',
                        'keyword4' => '订单状态'
                    )
                );

                updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config,'','',0,1);

                return $langData['homemaking'][9][49];//提交成功！

            }else{
                return array("state" => 101, "info" => $langData['homemaking'][9][41]);//订单不存在，或已经删除！
            }
        }elseif($oper == "cancelrefund"){//会员取消退款
            $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`, `refundtorderstate` FROM `#@__homemaking_order` WHERE `orderstate` = 8 AND `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                $ordernum = $results['ordernum'];
                $orderstate = $results['refundtorderstate'];

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET  `ret-date` = '0', `refundtorderstate` = '0', `orderstate` = '$orderstate', `ret-state` = 0, `status` = 0, `refundnumber` = 0 WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langDatap['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }

                //删除协商历史
                $sql = $dsql->SetQuery("DELETE FROM `#@__homemaking_refund` WHERE `orderid` = $id");
                $dsql->dsqlOper($sql, "update");
    
                //记录用户行为日志
                memberLog($userid, 'homemaking', 'order', $id, 'update', '取消退款('.$ordernum.')', '', $archives);

                return $langData['homemaking'][9][49];//提交成功！
            }else{
                return array("state" => 101, "info" => "订单已更新");//订单不存在，或已经删除！
            }
        }elseif($oper == "grab"){//员工抢单
            $dispatchid		 =  $param['dispatchid'];
            $orderid		 =  $param['orderid'];
            //员工抢单cxc
            if($dispatchid&&$orderid){
                $sql = $dsql->SetQuery("SELECT `ordernum`, `grabtype` FROM `#@__homemaking_order` WHERE id = $orderid" );
                $results = $dsql->dsqlOper($sql,"results");
                if ($results[0]['grabtype']==2) {
                    return array("state" => 200, "info" => $langData['homemaking'][4][43]);
                }else{

                    $ordernum = $results[0]['ordernum'];

                    //执行员工抢单
                    $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `dispatchid` = '$dispatchid', `grabtype` = '2' WHERE `id` = ".$orderid);
                    $results = $dsql->dsqlOper($archives, "update");
                    if($results == "ok"){
    
                        //记录用户行为日志
                        memberLog($userid, 'homemaking', 'order', $id, 'update', '抢单('.$ordernum.'=>'.$dispatchid.')', '', $archives);

                        return $langData['homemaking'][4][44];
                        //保存到数据时发生错误，请检查字段内容！
                    }else{
                        return array("state" => 200, "info" => $langData['homemaking'][8][21]);
                    }

                }

            }else{
                return array("state" => 200, "info" => $langData['homemaking'][4][42]);
            }
        }elseif($oper =="businessbz"){//商家备注
            $orderid 	= $param['orderid'];
            $businessbz = $param['businessbz'];
            if ($orderid&&$businessbz) {
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `businessbz` = '$businessbz' WHERE `id` = ".$orderid);
                $results = $dsql->dsqlOper($archives, "update");
                if($results == "ok"){

                    return $langData['homemaking'][4][45];

                }else{

                    return array("state" => 200, "info" => $langData['homemaking'][8][21]);
                    //保存到数据时发生错误，请检查字段内容！

                }
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][4][42]);
            }
        }

    }

    /**
     * 修改退款申请改变状态
     */
    public  function  setRefund(){
        global $dsql;
        global $userLogin;
        global $langData;

        return;

        $id      = $this->param['id'];
        $status= $this->param['status'];
        $rettype = $this->param['rettype'];
        $pics = $this->param['pics'];
        $title = $this->param['title'];
        $price = $this->param['price'];
        $retnote = $this->param['retnote'];
        //更新订单状态
        $now = GetMkTime(time());
        $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `ret-state` = 0,`orderstate` = 1, `ret-ok-date` = '$now',`ret-type` = '$rettype',`ret-note` = '$retnote',`refundstatus` = '0' WHERE `id` = ".$id);
        $dsql->dsqlOper($sql, "update");

//        //加入协商历史   type 1 个人  2平台  3 商家
//        $retokdate = GetMkTime(time());
//        $xsarchives = $dsql->SetQuery("INSERT INTO `#@__homemaking_refund` (`type`,`retokdate`,`status`,`pics`,`title`,`orderid`,`price`,`retnote`,`rettype`) VALUES ('$type', '$retokdate','$status','$pics','$title','$id','$price','$retnote','$rettype')");

        // $a=  $dsql->dsqlOper($xsarchives, "update");

        return "操作成功！";

    }

    /**
     * 买家申请退款
     */
    public function refund(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id      = $this->param['id'];
        $retmoney= $this->param['retmoney'];
        $oldprice= $this->param['oldprice'];
        $rettype = $this->param['rettype'];
        $retnote = $this->param['retnote'];
        $retpics = $this->param['retpics'];
        $refundtype = $this->param['refundtype'];
        $refundtype = $refundtype ? $refundtype : 0;
        $title= $this->param['title'];
        $pics = $this->param['pics'];
        $type = $this->param['type'];    // type  1个人  2平台  3商家
        $price = $this->param['price'];
        $status= $this->param['status'];   //修改申请状态  1 同意 2 拒绝
        $name = $this->param['name'];
        $mobile = $this->param['mobile'];
        $service = $this->param['customer'];
        $changeType = $this->param['changeType'];
        
        $type = $type ? $type : 1;
        $price = $price ? $price : $retmoney;
        $type = $service ? 1 : $type;

        if(empty($id)) return array("state" => 200, "info" => $langData['homemaking'][9][67]);//数据不完整，请检查！
        if(empty($rettype)) return array("state" => 200, "info" => $langData['homemaking'][9][68]);//请选择退款原因！
        if(empty($retnote)) return array("state" => 200, "info" => $langData['homemaking'][9][69]);//请输入退款说明！
        if($retmoney > $oldprice){
            //return array("state" => 200, "info" => $langData['homemaking'][10][13]);
        }
        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $retnote = filterSensitiveWords(addslashes($retnote));
        $rettype = cn_substrR($rettype, 20);
        $retnote = cn_substrR($retnote, 500);

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`orderprice`, o.`ordernum`, o.`procount`, o.`orderstate`, l.`title`,  s.`userid` as uid FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 1 OR o.`orderstate` = 5 OR o.`orderstate` = 2 OR o.`orderstate` = 4 OR o.`orderstate` = 8) AND (o.`ret-state` = 0 OR o.`refundnumber` > 0)");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $title      = $results[0]['title'];      //商品名称
            $procount   = $results[0]['procount'];   //购买数量
            $orderprice = $results[0]['orderprice']; //单价
            $ordernum   = $results[0]['ordernum'];   //订单号
            $sid        = $results[0]['uid'];        //卖家会员ID
            $orderstate = $results[0]['orderstate']; //订单状态
            $date       = GetMkTime(time());

            $orderIdArr = array();

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "homemaking",
                "id"       => $id
            );
            //加入协商历史   type 1 个人  2平台  3 商家
            $retokdate = GetMkTime(time());
            $xsarchives = $dsql->SetQuery("INSERT INTO `#@__homemaking_refund` (`type`,`retokdate`,`status`,`pics`,`title`,`orderid`,`price`,`name`,`retnote`,`rettype`,`mobile`,`service`) VALUES ('$type', '$retokdate','$status','$pics','$title','$id','$price','$name','$retnote','$rettype','$mobile','$service')");
            $dsql->dsqlOper($xsarchives, "update");
            //获取会员名
            $username = "";
            $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $sid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }


            //自定义配置
            $config = array(
                "username" => $username,
                "order" => $ordernum,
                "amount" => $orderprice,
                "info" => $retnote,
                "note" => $retnote,
                "fields" => array(
                    'keyword1' => '退款原因',
                    'keyword2' => '退款金额'
                )
            );

            updateMemberNotice($sid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

            if($orderstate != 8){
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `refundtorderstate` = '$orderstate', `ret-pics` = '$retpics', `refundtype` = '$refundtype', `orderstate` = 8, `ret-state` = 1, `ret-type` = '$rettype', `ret-note` = '$retnote', `ret-money` = '$retmoney', `ret-date` = '$date', `refundstatus` = '8', `status` = 0 WHERE `id` = ".$id);
            }else{
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `ret-pics` = '$retpics', `refundtype` = '$refundtype', `orderstate` = 8, `ret-state` = 1, `ret-type` = '$rettype', `ret-note` = '$retnote', `ret-money` = '$retmoney', `ret-date` = '$date', `refundstatus` = '8', `status` = 0 WHERE `id` = ".$id);
            }
            $dsql->dsqlOper($sql, "update");
    
            //记录用户行为日志
            memberLog($uid, 'homemaking', 'order', $id, 'update', '申请退款('.$ordernum.')', '', $sql);

            return "操作成功！";

        }else{
            return array("state" => 200, "info" => $langData['homemaking'][9][70]);//操作失败，请核实订单状态后再操作！
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
        $explain     =$this->param['explain'];
        $pics     =$this->param['pics'];
        $titlee     =$this->param['title'];
        $type       = $this->param['type'];
        $price       = (float)$this->param['price'];
        $status       = (int)$this->param['status'];

        if(empty($id)) return array("state" => 200, "info" => $langData['homemaking'][9][67]);//数据不完整，请检查！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$uid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(!empty($personalres[0]['id'])){
            if($personalres[0]['state'] != 1){
                return array("state" => 200, "info" => $langData['homemaking'][10][16]);//当前状态不正常，请联系商家！
            }
            $userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__homemaking_store` WHERE `id` = ".$personalres[0]['company']);
            $userResult = $dsql->dsqlOper($userSql, "results");
            $uid = $userResult[0]['userid'];
        }


        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`point`, o.`proid`, o.`balance`, o.`payprice`, o.`orderprice`, o.`procount`, o.`userid`, l.`title`,o.`paytype` FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`id` = '$id' AND s.`userid` = '$uid' AND o.`orderstate` = 8 AND o.`ret-state` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            if($status == 2){

                $sql = $dsql->SetQuery("SELECT `refundnumber` FROM `#@__homemaking_order` WHERE `id` = ".$id);
                $number=$dsql->dsqlOper($sql, "results");
                $refund= $number[0]['refundnumber'];
                if ($refund == 1 ){
                    //更新订单状态
                    $now = GetMkTime(time());
                    $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `status` = '$status', `orderstate` = 8,`refundnumber` = 2 ,`refundstatus` = 8 WHERE `id` = ".$id);
                    $dsql->dsqlOper($sql, "update");
                    $retokdate = GetMkTime(time());
                    $xsarchives = $dsql->SetQuery("INSERT INTO `#@__homemaking_refund` (`retnote`, `type`,`retokdate`,`status`,`pics`,`title`,`orderid`,`price`) VALUES ('$explain', '$type', '$retokdate','$status','$pics','$titlee','$id','$price')");
                    $dsql->dsqlOper($xsarchives, "update");
                    return "操作成功！";
                }
                //更新订单状态
                $now = GetMkTime(time());
                $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `status` = '$status', `orderstate` = 8,`refundnumber` = 1 ,`refundstatus` = 8 WHERE `id` = ".$id);
                $dsql->dsqlOper($sql, "update");
                $retokdate = GetMkTime(time());
                $xsarchives = $dsql->SetQuery("INSERT INTO `#@__homemaking_refund` (`retnote`, `type`,`retokdate`,`status`,`pics`,`title`,`orderid`,`price`) VALUES ('$explain', '$type', '$retokdate','$status','$pics','$titlee','$id','$price')");
                $dsql->dsqlOper($xsarchives, "update");
                return "操作成功！";

            }

            //验证商家账户余额是否足以支付退款
            $uinfo = $userLogin->getMemberInfo();
            $umoney = $uinfo['money'];

            $date     = GetMkTime(time());
            $title      = $results[0]['title'];      //商品名称
            $proid      = $results[0]['proid'];      //商品ID
            $ordernum   = $results[0]['ordernum'];   //需要退回的订单号
            $orderprice = $results[0]['orderprice']; //订单商品单价
            $procount   = $results[0]['procount'];   //订单商品数量
            $totalMoney = $orderprice;   //需要扣除商家的费用
            $paytype    = $results[0]['paytype'];   //需要扣除商家的费用

            //更新已购买数量
            $sql = $dsql->SetQuery("UPDATE `#@__homemaking_list` SET `sale` = `sale` - $procount WHERE `id` = '$proid'");
            $dsql->dsqlOper($sql, "update");


            //因为买家没有确认收货，所以费用是还没有转到卖家账户，这里就不涉及从卖家账户扣费的流程 by:gz 20160422

            //判断商家账户全额是否充足
            //if($umoney < $totalMoney) return array("state" => 200, "info" => '您的账户余额不足，无法退款，请先充值！');

            //从商家帐户减去相应金额
            //$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$totalMoney' WHERE `id` = '$uid'");
            //$dsql->dsqlOper($archives, "update");

            //保存操作日志
            //$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$uid', '0', '$totalMoney', '订单退款：$ordernum', '$date')");
            //$dsql->dsqlOper($archives, "update");
            //退款编号
            $refundordernumber = GetMkTime(time());
            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `ret-state` = 0,`status` = $status, `orderstate` = 9, `refundstatus` = 9 ,`ret-ok-date` = '$now' , `refundordernumber` = '$refundordernumber' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");
    
            //记录用户行为日志
            memberLog($uid, 'homemaking', 'order', $id, 'update', '订单退款('.$ordernum.')', '', $sql);

            //加入协商历史   type 1 个人买家  2平台  3 商家
            $retokdate = GetMkTime(time());
            $xsarchives = $dsql->SetQuery("INSERT INTO `#@__homemaking_refund` (`retnote`, `type`,`retokdate`,`status`,`pics`,`title`,`orderid`,`price`) VALUES ('$explain', $type, '$retokdate','$status','$pics','$titlee','$id','$price')");
            $dsql->dsqlOper($xsarchives, "update");
            //退回会员积分、余额
            $userid   = $results[0]['userid'];   //需要退回的会员ID
            $point    = $results[0]['point'];    //需要退回的积分
            $balance  = $results[0]['balance'];  //需要退回的余额
            $payprice = $results[0]['payprice']; //需要退回的支付金额

            //退回积分
            if(!empty($point)){
                global $userLogin;
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $userpoint = $user['point'];
//                $pointuser  = (int)($userpoint+$point);
                //保存操作日志
                $info = $langData['homemaking'][9][58].$ordernum;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$info', '$date','tuihui','$userpoint')");

                $dsql->dsqlOper($archives, "update");
            }

            $pay_namearr = array();
            //退回余额
            $money = $balance + $payprice;

            if($money != ''){
                array_push($pay_namearr,"余额");
            }

            if($point != ''){
                array_push($pay_namearr,"积分");
            }

            if($pay_namearr){
                $pay_name = join(',',$pay_namearr);
            }


            $paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "homemaking",
                "id"       => $id
            );
            $urlParam = serialize($paramUser);

            $tuikuan= array(
                'paytype'               => $pay_name,
                'truemoneysy'           => 0,
                'money_amount'          => $money,
                'point'                 => $point,
                'refrunddate'           => 0,
                'refrundno'             => 0
            );
            $tuikuanparam = serialize($tuikuan);

            if($money > 0 && $paytype !='huoniao_bonus'){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$money' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
//                $moneyy  = sprintf('%.2f',($usermoney + $money));
                //保存操作日志
                $info = $langData['homemaking'][9][58].$ordernum;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$money', '$info', '$date','homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$usermoney')");
                $dsql->dsqlOper($archives, "update");


                //减去会员的冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$money' WHERE `id` = '$userid'");
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
            }
            if ($paytype == 'huoniao_bonus'){
                $archi = $dsql->SetQuery("UPDATE `#@__member` SET `bonus` = `bonus` + '$money' WHERE `id` = '$userid'");
                $dsql->dsqlOper($archi, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $userbonus = $user['bonus'];
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`balance`) VALUES ('$userid', '1', '$payprice', '家政订单退回(消费金退款:$payprice)：$ordernum', '$date','homemaking','$userbonus')");
                $dsql->dsqlOper($archives, "update");
            }

            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "homemaking",
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
                "amount" => $money,
                "fields" => array(
                    'keyword1' => '退款状态',
                    'keyword2' => '退款金额',
                    'keyword3' => '审核说明'
                )
            );

            updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, $config,'','',0,1);

            return $langData['homemaking'][9][73];//退款成功！

        }else{
            return array("state" => 200, "info" => $langData['homemaking'][9][70]);//操作失败，请核实订单状态后再操作！
        }

    }

    /**
     * 协商历史
     */

    public  function getrefund()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];
        $id = $this->param['id'];
        $historysql = $dsql ->SetQuery("SELECT r.`id`,r.`retnote`,r.`rettype`,r.`retokdate`,r.`pics`,r.`title`,r.`type`,r.`price`,r.`status`,r.`service`,o.`ret-type`,o.`ret-note`,r.`pics`,o.`orderstate`,o.`refundnumber`,o.`userid`,s.`userid` store FROM `#@__homemaking_refund`r LEFT JOIN `#@__homemaking_order` o  ON r.`orderid` = o.`id` LEFT JOIN `#@__homemaking_list` l ON l.`id` = o.`proid` LEFT JOIN `#@__homemaking_store` s ON s.`id` = l.`company` WHERE r.`orderid` =$id ORDER BY r.`id` DESC");
        $historyres = $dsql ->dsqlOper($historysql,'results');
        foreach($historyres as $k => $v){
            // $pics = $v['pics'];
            $historyres[$k]['rettype'] =$v['ret-type'];
            // $historyres[$k]['retnote'] =$v['rettype'];
            // if(!empty($pics)){
            //     $pics = explode(",", $pics);
            //     $historyres[$k]['litpic'] = getFilePath($pics[0]);
            // }
            $pic = '/static/images/noPhoto_60.jpg';

            //用户
            if($v['type'] == 1){

                $userinfo = $userLogin->getMemberInfo($v['userid']);
                if($userinfo && is_array($userinfo)){
                    $pic = $userinfo['photo'];
                    $nickname = $userinfo['nickname'];
                }

            //平台
            }elseif($v['type'] == 2){

                $nickname = '平台客服';

            //商家
            }else{

                $userinfo = $userLogin->getMemberInfo($v['store']);
                if($userinfo && is_array($userinfo)){
                    $pic = $userinfo['photo'];
                    $nickname = $userinfo['nickname'];
                }

            }

            $historyres[$k]['nickname'] = $nickname;
            $historyres[$k]['litpic'] = getFilePath($pic);
        }
        $totalCount = count($historyres);
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        if($historyres) {
            return array("pageInfo" => $pageinfo, "list" => $historyres);

        }else{
            return array("state" => 200, "info" => '格式错误！');
        }



    }

    /**
     * 验证服务码状态
     */
    public function verifyQuan(){
        global $dsql;
        global $userLogin;
        global $langData;

        $cardnum = $this->param['cardnum'];
        $now  = GetMkTime(time());

        if(!is_numeric($cardnum)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//格式错误！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$uid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(empty($personalres[0]['id'])){
            $userinfo = $userLogin->getMemberInfo();
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
            }
        }else{
            $sql = $dsql->SetQuery("SELECT `id`, `userid` FROM `#@__homemaking_store` WHERE `id` = " . $personalres[0]['company']);
            $ret = $dsql->dsqlOper($sql, "results");
            $uid = $ret[0]['userid'];
        }

        //查询服务码
        $archives = $dsql->SetQuery("SELECT q.`usedate`, q.`expireddate`, o.`proid`, o.`orderprice` FROM `#@__homemakingquan` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE  o.`orderstate` = 2 AND q.`cardnum` = '".$cardnum."' AND s.`userid` = ".$uid);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $usedate     = $results[0]['usedate'];
            $expireddate = $results[0]['expireddate'];
            $proid       = $results[0]['proid'];

            //是否已经使用过
            if($usedate != 0){
                $usedate = date("Y-m-d H:i:s", $usedate);
                return array("state" => 101, "info" => $langData['homemaking'][9][81].$usedate.$langData['homemaking'][9][82]);//验证失败，此服务码已于  2019-08-08 使用过了！
                //是否已经过期
            }elseif($expireddate < $now){
                //return array("state" => 101, "info" => $langData['homemaking'][9][83]);//验证失败，此服务码已经过期！
                //可以使用
            }else{
                $sql = $dsql->SetQuery("SELECT `id`, `title`, `price` FROM `#@__homemaking_list` WHERE `id` = ".$proid);
                $res = $dsql->dsqlOper($sql, "results");
                if($res){
                    $id    = $res[0]['id'];
                    $title = $res[0]['title'];
                    $param = array(
                        "service"  => "homemaking",
                        "template" => "detail",
                        "id"       => $id
                    );
                    $url = getUrlPath($param);
                    $currency = echoCurrency(array("type" => "short"));
                    return $langData['homemaking'][9][84]."<a href='".$url."' target='_blank'>$title</a> [".$results[0]['orderprice'].$currency."]";//验证成功，项目
                }else{
                    return array("state" => 101, "info" => $langData['homemaking'][9][85]);//验证失败，家政信息不存在！
                }
            }
        }else{
            return array("state" => 101, "info" => $langData['homemaking'][9][86]);//服务码错误，请与消费者确认提供的服务码是否正确！
        }
    }


    /**
     * 验证服务码
     */
    public function useCode(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        $cardnums= $this->param['cardnum'];
        $now     = GetMkTime(time());
        $uid     = $userLogin->getMemberID();

        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$uid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(!$personalres){
            $userinfo = $userLogin->getMemberInfo();
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
            }
            $businessid = $uid;

            $sql = $dsql->SetQuery("SELECT `id`, `userid`,`cityid` FROM `#@__homemaking_store` WHERE `userid` = " . $businessid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $cityid = $ret[0]['cityid'];
            }else{
                return array("state" => 200, "info" => "商家状态异常，验证失败！");
            }

        }else{
            $storeid = $personalres[0]['company'];
        
            $sql = $dsql->SetQuery("SELECT `id`, `userid`,`cityid` FROM `#@__homemaking_store` WHERE `id` = " . $storeid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 200, "info" => "商家状态异常，验证失败！");
            }

            $businessid = $ret[0]['userid'];
            $cityid =  $ret[0]['cityid'];
        }
        
        $cityName = getSiteCityName($cityid);
        if(empty($cardnums)) return array("state" => 200, "info" => $langData['homemaking'][9][77]);//请输入服务码！

        $codeArr = explode(",", $cardnums);
        $success = 0;
        foreach ($codeArr as $key => $value) {

            $this->param['cardnum'] = $value;
            $verify = $this->verifyQuan();
            if(!is_array($verify)){

                $sql = $dsql->SetQuery("UPDATE `#@__homemakingquan` SET `usedate` = '$now' WHERE `cardnum` = '$value'");
                $res  = $dsql->dsqlOper($sql, "update");

                if($res == "ok"){
                    $success++;

                    //查询订单信息
                    $sql = $dsql->SetQuery("SELECT q.`orderid`, o.`orderprice`, o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`,o.`ordernum`,l.`title`,l.`price`,s.`title` storename FROM `#@__homemakingquan` q LEFT JOIN `#@__homemaking_order` o ON o.`id` = q.`orderid`  LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE q.`cardnum` = '$value'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){

                        $foodtitle  = $ret[0]['title'];
                        $storename  = $ret[0]['storename'];
                        $orderid    = $ret[0]['orderid'];
                        $ordernum   = $ret[0]['ordernum'];
                        $procount   = $ret[0]['procount'];   //数量
                        $orderprice = $ret[0]['orderprice']; //订单金额
                        $price      = $ret[0]['price'];      //单价
                        $balance    = $ret[0]['balance'];    //余额金额
                        $payprice   = $ret[0]['payprice'];   //支付金额
                        $userid     = $ret[0]['userid'];     //买家ID

                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $pid = '';
                        if($ret){
                            $pid            = $ret[0]['id'];
                        }
                        //更新订单状态，如果券都用掉了，就更新订单状态为已使用
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemakingquan` WHERE `orderid` = (SELECT `orderid` FROM `#@__homemakingquan` WHERE `cardnum` = '$value') AND `usedate` = 0");
                        $ret = $dsql->dsqlOper($sql, "totalCount");
                        if($ret == 0){
                            $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = 4, `ret-state` = 0 WHERE `id` = '$orderid'");
                            $dsql->dsqlOper($sql, "update");
                        }


                        //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
                        $totalPayPrice = $balance + $payprice;
                        if($totalPayPrice > 0){

                            //减去消费会员的冻结金额
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");

                            // //如果冻结金额小于0，重置冻结金额为0
                            $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                            $ret = $dsql->dsqlOper($archives, "results");
                            if($ret){
                                if($ret[0]['freeze'] < 0){
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }
                            $user  = $userLogin->getMemberInfo($userid);
//                            $usermoney = $user['money'];
                            // //保存操作日志
                            $info  = $langData['homemaking'][9][78] . $value; //服务码消费：
                            $title = "家政消费-".$storename;

                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`ordertype`,`ctype`,`pid`,`title`,`ordernum`) VALUES ('$userid', '0', '$totalPayPrice', '$info', '$now','homemaking','xiaofei','$pid','$title','$ordernum')");
                            $dsql->dsqlOper($archives, "update");

                        }

                        $totalPrice = $price;

                        //扣除佣金
                        global $cfg_homemakingFee;
                        global $cfg_fzhomemakingFee;
                        $cfg_homemakingFee = (float)$cfg_homemakingFee;
                        $cfg_fzhomemakingFee = (float)$cfg_fzhomemakingFee;

                        $fee = $totalPrice * $cfg_homemakingFee / 100;
                        $fee = $fee < 0.01 ? 0 : $fee;
                        $totalPrice_ = sprintf('%.2f', $totalPrice - $fee);

                        //分销信息
                        global $cfg_fenxiaoState;
                        global $cfg_fenxiaoSource;
                        global $cfg_fenxiaoDeposit;
                        global $cfg_fenxiaoAmount;
                        include HUONIAOINC."/config/homemaking.inc.php";
                        $fenXiao = (int)$customfenXiao;

                        //分销金额
                        $_fenxiaoAmount = $price;
                        if($cfg_fenxiaoState && $fenXiao){

                            //商家承担
                            if($cfg_fenxiaoSource){
                                $fx_shouldMoney = ($totalPrice * $cfg_fenxiaoAmount / 100);
                                $totalPrice_ = $totalPrice_ - $fx_shouldMoney;

                                //平台承担
                            }else{
                                $_fenxiaoAmount = $fee;
                            }
                        }

                        $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                        //分佣 开关
                        $paramarr['amount'] = $_fenxiaoAmount;
                        if($fenXiao ==1){
                            $_fx_title = $ordernum;
                            (new member())->returnFxMoney("homemaking", $userid, $_fx_title,$paramarr);
                            //查询一共分销了多少佣金
                            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'homemaking'");
                            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                            //如果系统没有开启资金沉淀才需要查询实际分销了多少
                            if($cfg_fenxiaoSource){
                                if(!$cfg_fenxiaoDeposit){
                                    $totalPrice_     += $fenxiaomonyeres[0]['allfenxiao']; //没沉淀，还给商家
                                }else{
                                    $precipitateMoney = $fx_shouldMoney  - $fenxiaomonyeres[0]['allfenxiao'];
                                    if($precipitateMoney > 0){
                                        (new member())->recodePrecipitationMoney($businessid,$ordernum,$_fx_title,$precipitateMoney,$cityid,"homemaking");
                                    }
                                }
                            }
                        }

                        //将费用转至商家帐户
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalPrice_' WHERE `id` = '$businessid'");
                        $dsql->dsqlOper($archives, "update");
                        //分站佣金
                        $fzFee = cityCommission($cityid,'homemaking');
                        //将费用转至分站
                        $fztotalAmount_ =  $fee * $fzFee / 100 ;
                        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                        $fee-=$fztotalAmount_;//总站-=分站
                        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                        $dsql->dsqlOper($fzarchives, "update");

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "homemaking",
                            "id"       => $orderid
                        );
                        $urlParam = serialize($paramBusi);
                        $user  = $userLogin->getMemberInfo($businessid);
                        $usermoney = $user['money'];
//                        $money  = sprintf('%.2f',($usermoney + $totalPrice_));
                        //保存操作日志
                        $info  = $langData['homemaking'][9][78] . $value; //服务码消费：
                        $title = "家政收入-".$foodtitle;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`urlParam`, `balance`) VALUES ('$businessid', '1', '$totalPrice_', '$info', '$now','homemaking','shangpinxiaoshou','$title','$ordernum','$urlParam','$usermoney')");
                        $dsql->dsqlOper($archives, "update");

                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$businessid', '1', '$totalPrice_', '$info', '$now','$cityid','$fztotalAmount_','homemaking',$fee,'1','shangpinxiaoshou','$usermoney')");
//                        $dsql->dsqlOper($archives, "update");
                        $lastid = $dsql->dsqlOper($archives, "lastid");
                        substationAmount($lastid,$cityid);

                        include HUONIAOINC."/config/homemaking.inc.php";
                        $fenXiao = (int)$customfenXiao;


                        //微信通知
                        $param = array(
                            'type' 	 => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' =>array(
                                'contentrn'  => $cityName.'分站——homemaking模块——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                'date' => date("Y-m-d H:i:s", time()),
                            )
                        );

                        $params = array(
                            'type' 	 => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' =>array(
                                'contentrn'  => $cityName.'分站——homemaking模块——平台获得佣金 :'.$fee.' 元——分站获得佣金 :'.sprintf("%.2f", $fztotalAmount_).'元',
                                'date' => date("Y-m-d H:i:s", time()),
                            )
                        );
                        //后台微信通知
                        updateAdminNotice("homemaking", "detail",$param);
                        updateAdminNotice("homemaking", "detail",$params);
                    }

                }

            }

        }

        if($success > 0){
            return $langData['homemaking'][9][79];//消费成功！
        }else{
            return array("state" => 200, "info" => $langData['homemaking'][9][80]);//消费失败，请检查您输入的服务码！
        }
    }

    /**
     * 确认服务收费
     */
    public function addservice(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id          = (int)$this->param['id'];
        $servicetype = (int)$this->param['servicetype'];
        $guarantee   = $this->param['guarantee'];
        $online      = (int)$this->param['online'];
        $price       = (float)$this->param['price'];
        $servicedesc = $this->param['servicedesc'];
        $orderid 	 = $this->param['orderid'];
        $type 	 	 = $this->param['type'];
        $now         = GetMkTime(time());
        $uid         = $userLogin->getMemberID();

        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        //当前用户是否加入服务人员
        $sql         = $dsql->SetQuery("SELECT `id`, `company`, `state` FROM `#@__homemaking_personal` WHERE `userid` = ".$uid);
        $personalres = $dsql->dsqlOper($sql, "results");
        if(!empty($personalres[0]['id'])){
            if($personalres[0]['state'] != 1){
                return array("state" => 200, "info" => $langData['homemaking'][10][16]);//当前状态不正常，请联系商家！
            }
        }else{
            $userinfo = $userLogin->getMemberInfo();
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
                return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
            }
        }
        //商家结单
        if ($type=='statement'&&$orderid) {
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '11', `statementtime` = '$now' WHERE `id` = ".$orderid);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results=='ok') {
                return $langData['homemaking'][9][49];//提交成功
            }else{
                return array("state" => 200, "info" => $langData['homemaking'][10][12]);//提交成功
            }
        }
        if(empty($id)) return array("state" => 200, "info" => $langData['homemaking'][8][0]);//请输入服务码！

        if($servicetype==1){
            if(empty($price)) return array("state" => 200, "info" => $langData['homemaking'][9][87]);//请输入金额！
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`orderprice`, o.`ordernum`,o.`userid` ,o.`procount`, o.`orderstate`, l.`title`,  s.`userid` as uid FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`id` = '$id' AND o.`id` = '$id' AND o.`orderstate` = 4 AND o.`ret-state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $ordernum   = $results[0]['ordernum'];
            $userid     = $results[0]['userid'];
            $orderprice = $results[0]['orderprice'];
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '5', `exp-date` = '$now', `servicetype` = '$servicetype', `guarantee` = '$guarantee', `online` = '$online', `price` = '$price', `servicedesc` = '$servicedesc' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
            if($results != "ok"){
                return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
            }
            // include HUONIAOINC."/config/homemaking.inc.php";
            // $fenXiao = (int)$customfenXiao;
            // //分佣 开关
            // $paramarr['amount'] = $orderprice;
            // if($fenXiao ==1){
            //     (new member())->returnFxMoney("homemaking", $userid, $ordernum,$paramarr);
            // }
            return $langData['homemaking'][9][49];//提交成功！
        }else{
            return array("state" => 200, "info" => $langData['homemaking'][9][70]);//操作失败，请核实订单状态后再操作！
        }
    }

    /**
     * 线上服务费
     */
    public function servicepay(){
        global $dsql;
        global $userLogin;
        global $langData;

        $isMobile = isMobile();

        $param       = $this->param;
        $aid         = $param['aid'];      //信息ID
        $amount      = $param['amount'];   //金额
        $ordernumid  = $param['ordernumid'];

        $uid     = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        //信息url
        $param = array(
            "service"     => "homemaking",
            "template"    => "detail",
            "id"          => $aid
        );
        $url = getUrlPath($param);

        if(!is_numeric($aid)){
            header("location:".$url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_list` WHERE `id` = ".$aid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            //信息不存在
            header("location:".$url);
            die;
        }

        //查询信息
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__homemaking_order` WHERE `ordernum` = '$ordernumid'");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            $paramUser = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "homemaking",
                "id"       => $ordernumid
            );
            $url = getUrlPath($paramUser);
            header("location:".$url);
            die;
        }

        //订单号
        $orderdate= GetMkTime(time());

        //查询当前家政服务是否有未付款的，删除掉(暂不清楚为啥删除这里更改为更新)
        $sql = $dsql->SetQuery("SELECT `id`,`ordernum` FROM `#@__homemaking_order` WHERE `orderstate` = 0 AND `userid` = '$uid' AND `proid` = '$aid' AND `onlinepay` = '1'");
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            // foreach ($res as $key => $value) {
            //     $archives = $dsql->SetQuery("DELETE FROM `#@__homemaking_order` WHERE `id` = ".$value['id']);
            //     $dsql->dsqlOper($archives, "update");
            // }
            $ordernum = $res[0]['ordernum'];
            $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '0', `userid` = '$uid', `proid` = '$aid', `procount` = '1', `orderprice` = '$amount', `orderdate` = '$orderdate', `tab` = 'homemaking', `onlinepay` = '1', `ordernumid` = '$ordernumid' WHERE `ordernum` = '$res[0][ordernum]'");
            $return = $dsql->dsqlOper($archives, "update");
        }else{
            $ordernum = create_ordernum();
            $archives = $dsql->SetQuery("INSERT INTO `#@__homemaking_order` (`orderstate`, `ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderdate`, `tab`, `onlinepay`, `ordernumid`) VALUES ('0', '$ordernum', '$uid', '$aid', '1', '$amount', '$orderdate', 'homemaking', '1', '$ordernumid')");
            $return = $dsql->dsqlOper($archives, "update");
        }
        if($return != "ok"){
            die($langData['homemaking'][10][12]);//提交失败，请稍候重试！
        }

        // if($isMobile){
        //     $RenrenCrypt = new RenrenCrypt();
        //     $ids = base64_encode($RenrenCrypt->php_encrypt($ordernum));

        //     $param = array(
        //         "service" => "homemaking",
        //         "template" => "pay",
        //         "param" => "ordernum=".$ids
        //     );
        //     header("location:".getUrlPath($param));
        //     die;
        // }

        //跳转至第三方支付页面
        $ret = createPayForm("homemaking", $ordernum, $amount, '', $langData['homemaking'][9][262], array(), 1);//家政线上收费
        $timeout = GetMkTime(time()) + 1800;
        $ret['timeout'] = $timeout;

        return $ret;
    }

    /**
     * 派单
     */
    public function dispatch(){
        global $dsql;
        global $userLogin;
        global $langData;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $aid             =  $param['aid'];
        $oper            =  $param['oper'];
        $failnote        =  $param['failnote'];
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "homemaking"))){
            return array("state" => 200, "info" => $langData['homemaking'][8][3]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__homemaking_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['homemaking'][8][11]);//您还未开通家政公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['homemaking'][8][12]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['homemaking'][8][13]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'no'){
            if(empty($failnote)) return array("state" => 200, "info" => $langData['homemaking'][9][48]);//请填写订单失败原因
        }

        $company = $userResult[0]['id'];

        if($oper == 'no'){//商家确认无效订单 状态未待确认
            $archives = $dsql->SetQuery("SELECT `id`, `procount`, `ordernum`, `orderprice`, `userid` FROM `#@__homemaking_order` WHERE `id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results    = $results[0];
                $procount   = $results['procount'];
                $orderprice = $results['orderprice'];
                $ordernum   = $results['ordernum'];
                $uid        = $results['userid'];//买家ID

                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `failnote` = '$failnote', `orderstate` = '3' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['homemaking']['10']['23']); //保存到数据时发生错误，请检查字段内容！
                }

                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $id
                );

                $totalMoney = $orderprice;

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
                    "amount" => $totalMoney,
                    "info" => $failnote,
                    "note" => $failnote,
                    "fields" => array(
                        'keyword1' => '退款原因',
                        'keyword2' => '退款金额'
                    )
                );

                updateMemberNotice($uid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalMoney' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                //减去会员的冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalMoney' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                //如果冻结金额小于0，重置冻结金额为0
                $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$uid'");
                $ret = $dsql->dsqlOper($archives, "results");
                if($ret){
                    if($ret[0]['freeze'] < 0){
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                    }
                }

                $pay_name = '';
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $id
                );
                $urlParam = serialize($paramUser);

                $tuikuan= array(
                    'paytype'               => '余额',
                    'truemoneysy'           => 0,
                    'money_amount'          => $totalMoney,
                    'point'                 => 0,
                    'refrunddate'           => 0,
                    'refrundno'             => 0
                );
                $tuikuanparam = serialize($tuikuan);
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money  = sprintf('%.2f',($usermoney + $totalMoney));
                //保存操作日志
                $info  = $langData['homemaking'][9][58].$ordernum;
                $date  = GetMkTime(time());
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$totalMoney', '$info', '$date','homemaking','tuikuan','$urlParam','$ordernum','$tuikuanparam','家政消费','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                return $langData['homemaking'][9][49];//提交成功！

            }else{
                return array("state" => 101, "info" => $langData['siteConfig'][9][41]);//订单不存在，或已经删除！
            }
        }
    }

    /**
     * 计划任务 两天自动更新
     */
    public function receipt(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        $id = $this->param['id'];

        if(empty($id)) return array("state" => 200, "info" => $langData['homemaking'][4][24]);  //操作失败，参数传递错误！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            //return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`price`, o.`online`, o.`servicetype`, o.`ordernum`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`userid`, l.`title`, l.`homemakingtype`, s.`userid` as uid , s.`cityid` as store,s.`title` storename FROM `#@__homemaking_order` o LEFT JOIN `#@__homemaking_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__homemaking_store` s ON l.`company` = s.`id` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND o.`orderstate` = 5");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__homemaking_order` SET `orderstate` = '6' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");

            //将订单费用转到卖家帐户
            $date       = GetMkTime(time());
            $ordernum   = $results[0]['ordernum'];   //订单号
            $procount   = $results[0]['procount'];   //数量
            $orderprice = $results[0]['orderprice']; //单价
            $balance    = $results[0]['balance'];    //余额金额
            $payprice   = $results[0]['payprice'];   //支付金额
            $userid     = $results[0]['userid'];     //买家ID
            $uid        = $results[0]['uid'];        //卖家ID
            $title      = $results[0]['title'];      //商品名称
            $foodtitle  = $results[0]['title'];      //商品名称
            $storename  = $results[0]['storename'];
            $price      = $results[0]['price'];
            $online      = $results[0]['online'];
            $servicetype      = $results[0]['servicetype'];
            $homemakingtype = $results[0]['homemakingtype'];
            $cityid     	= $results[0]['store'];//城市id
            $cityName = getSiteCityName($cityid);
            //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
            // $totalPayPrice = $balance + $payprice;
            $totalPayPrice = $orderprice;
            if($totalPayPrice > 0){
                //减去消费会员的冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
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
                    "action"   => "homemaking",
                    "id"       => $id
                );

                $urlParam = serialize($paramUser);

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $pid ='';
                if($ret){
                    $pid            = $ret[0]['id'];
                }
                $user  = $userLogin->getMemberInfo($userid);
//                $usermoney = $user['money'];
                $title = '家政消费-'.$storename;
                $info = $langData['homemaking'][10][20].'-'.$title.'-'. $ordernum;
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`) VALUES ('$userid', '0', '$totalPayPrice', '$info', '$date','homemaking','xiaofei','$pid','$urlParam','$title','$ordernum')");
                $dsql->dsqlOper($archives, "update");
            }

            //商家结算
            $totalAmount = 0;
            $totalAmount += $orderprice;
            if($servicetype==1 && $online==0){//后续收费 线上收费
                if($homemakingtype==1 && $homemakingtype==0){//如果预付金 免费预约
                    $totalAmount = 0;
                }
                $totalAmount = $totalAmount + $price;
            }

            //扣除佣金
            global $cfg_homemakingFee;
            global $cfg_fzhomemakingFee;
            $cfg_homemakingFee = (float)$cfg_homemakingFee;
            $cfg_fzhomemakingFee = (float)$cfg_fzhomemakingFee;

            $fee = $totalAmount * $cfg_homemakingFee / 100;
            $fee = $fee < 0.01 ? 0 : $fee;
            $totalAmount_ = sprintf('%.2f', $totalAmount - $fee);
            //分站佣金
            $fzFee = cityCommission($cityid,'homemaking');
            //分站
            $fztotalAmount_ =  $fee * $fzFee / 100 ;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
            $fee-=$fztotalAmount_;//总站-=分站
            $cityName = $siteCityInfo['name'];
            $cityid  = (int)$siteCityInfo['cityid'];

            if($totalAmount_ > 0){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalAmount_' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");

                //分站
                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");

                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "homemaking",
                    "id"       => $id
                );
                $urlParam = serialize($paramBusi);
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money  = sprintf('%.2f',($usermoney + $totalAmount_));
                //保存操作日志
                $info  = '家政收入-'.$title.'-'. $ordernum;
                $title = '家政收入-'.$foodtitle;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '$info', '$date','homemaking','shangpinxiaoshou','$urlParam','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '$info', '$date','$cityid','$fztotalAmount_','homemaking',$fee,'1','shangpinxiaoshou','$usermoney')");
//                $dsql->dsqlOper($archives, "update");
                $lastid = $dsql->dsqlOper($archives, "lastid");
                substationAmount($lastid,$cityid);
            }

            //商家会员消息通知
            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "homemaking",
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
                "title" => $title,
                "amount" => $totalPayPrice,
                "fields" => array(
                    'keyword1' => '商品信息',
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


}
