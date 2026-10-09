<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 婚嫁模块API接口
 *
 * @version        $Id: marry.class.php 2014-8-5 下午17:10:21 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class marry {
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
     * 婚嫁信息基本参数
     * @return array
     */
    public function config(){

        require(HUONIAOINC."/config/marry.inc.php");

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
        // global $customTemplate;           //模板风格
        // global $custom_map;               //自定义地图
        // global $custom_hotel_atlasMax;    //酒店场地图集数量限制
        // global $custom_sy_atlasMax;       //摄影公司图集数量限制
        // global $custom_hq_atlasMax;       //婚庆公司图集数量限制
        // global $custom_sy_zp_atlasMax;    //摄影作品图集数量限制
        // global $custom_sy_al_atlasMax;    //摄影案例图集数量限制
        // global $custom_hq_zp_atlasMax;    //婚庆作品图集数量限制

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

        // $domainInfo = getDomain('marry', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('marry', $customSubDomain);

        //分站自定义配置
        $ser = 'marry';
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
                }elseif($param == "hotel_atlasMax"){
                    $return['hotel_atlasMax'] = $custom_hotel_atlasMax;
                }elseif($param == "sy_atlasMax"){
                    $return['sy_atlasMax'] = $custom_sy_atlasMax;
                }elseif($param == "hq_atlasMax"){
                    $return['hq_atlasMax'] = $custom_hq_atlasMax;
                }elseif($param == "sy_zp_atlasMax"){
                    $return['sy_zp_atlasMax'] = $custom_sy_zp_atlasMax;
                }elseif($param == "sy_al_atlasMax"){
                    $return['sy_al_atlasMax'] = $custom_sy_al_atlasMax;
                }elseif($param == "hq_zp_atlasMax"){
                    $return['hq_zp_atlasMax'] = $custom_hq_zp_atlasMax;
                }elseif($param == "template"){
                    $return['template'] = $customTemplate;
                }elseif($param == "touchTemplate"){
                    $return['touchTemplate'] = $customTouchTemplate;
                }elseif($param == "map"){
                    $return['map'] = $custom_map;
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
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['storeatlasMax'] = $custom_store_atlasMax;
            $return['marryhotelfieldatlasMax']   = $custom_marryhotelfield_atlasMax;
            $return['marryweddingcaratlasMax']   = $custom_marryweddingcar_atlasMax;
            $return['marryplancaseatlasMax']     = $custom_marryplancase_atlasMax;
            $return['marryplanmealatlasMax']     = $custom_marryplanmeal_atlasMax;

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
            $return['marryTag']        = $marryTag_;


        }

        return $return;

    }

    /**
     * 信息地区
     * @return array
     */
    public function addr(){
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
            require(HUONIAOINC."/config/marry.inc.php");
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
     * 酒店分类
     * @return array
     */
    public function type(){
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][8][0]);//格式错误
            }else{
                $type     = (int)$this->param['type'];
                $value    = (int)$this->param['value'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "marry_type", $son, $page, $pageSize);

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
     * 分类字段
     * @return array
     */
    public function hotelType(){
        global $dsql;
        global $langData;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][8][0]);//格式错误
            }else{
                $type     = (int)$this->param['type'];
                $value    = (int)$this->param['value'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "marryitem", $son, $page, $pageSize);

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
     * 商家列表
     */
    public function storeList(){


        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $typeid   = $this->param['typeid'];
                $addrid   = $this->param['addr'];
                $orderby  = $this->param['orderby'];
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $u        = $this->param['u'];
                $filter   = $this->param['filter'];
                //1：婚宴酒店;2、婚礼策划;3、婚宴套餐;
                $istype   = (int)$this->param['istype'];
                $istype   = $istype ? $istype : 1;
                $istype   = $istype ? $istype : 1;
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $price = trim($this->param['price'],',');
                $addr   = $this->param['addrid'];
                $businessid = (int)$this->param['businessid'];
                $keywords = $this->param['keywords'];



            }
        }
        $where = " AND `state` = 1";

        //数据共享
        require(HUONIAOINC."/config/marry.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            //遍历区域
            if($cityid){
                $where .= " AND `cityid` = '$cityid'";
            }
        }

        //酒店类型
        if($filter == 8 && $typeid){
            $where .= " AND `hoteltypeid` = $typeid";
        }


        if(!empty($filter)){
            $where .= " AND FIND_IN_SET('".$filter."', `bind_module`)";
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
        if(!empty($addr)){
            if($dsql->getTypeList($addr, "site_area")){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addr, "site_area"));
                $lower = $addr.",".join(',',$lower);
            }else{
                $lower = $addr;
            }
            $where .= " AND `addrid` in ($lower)";
        }

//        if(!empty($typeid)){
//            if($dsql->getTypeList($typeid, "marry_type")){
//                global $arr_data;
//                $arr_data = array();
//                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
//                $lower = $typeid.",".join(',',$lower);
//            }else{
//                $lower = $typeid;
//            }
//
//            $where .= " AND `typeid` in ($lower)";
//        }

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `user`.title like '%$search%' OR `store`.address like '%$search%'");
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
        if ($price) {
            $priceArr = explode(',',$price);
            $countPrice = count($priceArr);
            if($countPrice >1){
                $pricelow = sprintf("%.2f",$priceArr[0]);
                $priceheight = sprintf("%.2f",$priceArr[1]);
                $where .= " AND  `price` between $pricelow AND $priceheight";
            }
            if ($countPrice ==1 && $priceArr[0] ==2000){
                $where .= " AND `price` <= '$price'";
            }
            if ($countPrice ==1 && $priceArr[0] ==5000){
                $where .= " AND `price` >= '$price'";
            }
        }

        if ($keywords){
             $where .= " AND `title` like '%$keywords%'";
        }

        //地图可视区域内
        if(!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)){
            $where .= " AND `lng` <= '".$max_longitude."' AND `lng` >= '".$min_longitude."' AND `lat` <= '".$max_latitude."' AND `lat` >= '".$min_latitude."'";
        }

        //查询距离
        if((!empty($lng))&&(!empty($lat))){
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
            //价格排序
            case 5:
                $orderby_ = " ORDER BY `price` DESC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC";
                break;
            case 6:
                $orderby_ = " ORDER BY `price` ASC, `rec` DESC, `weight` DESC, `pubdate` DESC, `id` DESC";
                break;
            //热门推荐
            case 7:
                $orderby_ = " ORDER BY `click` DESC";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `rec` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_store` WHERE 1 = 1".$where);

        //总条数
        $totalCount = getCache("marry_store_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        $archives = $dsql->SetQuery("SELECT `flag`, `bind_module`, `price`, `taoxi`, `anli`, `title`, `click`,`config`,`pubdate`, `pics`, `lat`, `lng`, `id`,`userid`, `typeid`, `address`,`hoteltitle`,`hotelnumber`,`tel`, `tag`, `addrid`, ".$select." `rec` FROM `#@__marry_store` WHERE 1 = 1".$where);

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_store_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['address']   = $val['address'];
                $list[$key]["tel"]     =  $val['tel'];
                $list[$key]["telNum_"]     = $val['tel'];
                $list[$key]["telNum_"]     = preg_replace('/(1[3456789]{1}[0-9])[0-9]{4}([0-9]{4})/is',"$1****$2", $val['tel']);
                $list[$key]['lng']       = $val['lng'];
                $list[$key]['lat']       = $val['lat'];
                $list[$key]['rec']       = $val['rec'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]["tagSel"]      = explode("|",$val['tag']);
                $list[$key]['pubdate']   = $val['pubdate'];
//                $list[$key]['price']     = $val['price'];
                $list[$key]['taoxi']     = $val['taoxi'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['anli']      = $val['anli'];
                $list[$key]['hoteltitle']      = $val['hoteltitle'];
                $list[$key]['hotelnumber']      = $val['hotelnumber'];
                $list[$key]['flag']      = $val['flag'];
                $list[$key]['countTitle']      = count($results);
                $list[$key]['bind_module']= $val['bind_module'];
                $hotelmenu = $dsql->SetQuery("SELECT `price` FROM `#@__marry_hotelmenu` WHERE `company` =".$val['id']." AND `state`=1  ORDER BY `price` ASC ");
                $hotelmenuArr = getCache("marry_hotelmenu", $hotelmenu, 300, array("disabled" => $u));
                $list[$key]['hotelprice'] =  $hotelmenuArr[0]['price'] ? $hotelmenuArr[0]['price'] : '0.00';  //酒店套餐的最低价
                $archives = $dsql->SetQuery("SELECT `p`.id, `p`.title, `p`.userid, `p`.company, `p`.price, `p`.tag, `p`.type ,`p`.state,`s`.config FROM `#@__marry_planmeal` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ".$val['id']."  AND p.`state` = 1 ");
                // $resultsplanmeal  = getCache("marry_planmeal_detail", $archives, 0, $id);
                $resultsplanmeal =$dsql->dsqlOper($archives, "results");

                $plancase = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `hoteltitle`,`state` FROM `#@__marry_plancase`  WHERE `company` = ".$val['id']."  AND `state` = 1 ");
                // $plancaseResults  = getCache("marry_plancase_detail", $plancase, 0, $id);
                $plancaseResults =$dsql->dsqlOper($plancase, "results");

                $arc = $dsql->SetQuery("SELECT p.`id` FROM `#@__marry_host` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ".$val['id']."  AND p.`state` = 1 ");
                // $counthost  = getCache("marry_host", $arc, 0, $id);
                $counthost =$dsql->dsqlOper($arc, "results");
                       //租婚车
                $car = $dsql->SetQuery("SELECT c.`id` FROM `#@__marry_weddingcar`c LEFT  JOIN `#@__marry_store` s  ON `c`.company=`s`.id WHERE `c`.company = ".$val['id']."  AND c.`state` = 1 ");
                // $countcar  = getCache("marry_car", $car, 0, $id);
                $countcar =$dsql->dsqlOper($car, "results");

                $list[$key]["plancaseCount"] = count($plancaseResults);
                $list[$key]["planmealCount"]  = count($resultsplanmeal)+count($counthost)+count($countcar);
                $planmeal = $dsql->SetQuery("SELECT `id`,`company`,`title`,`pics`,`price`,`pubdate`,`type`,`planmealstyle`FROM `#@__marry_planmeal` WHERE `company` =".$val['id']." AND `state`=1  ORDER BY `price` ASC ");
                $planmealArr = getCache("marry_planmeal", $planmeal, 300, array("disabled" => $u));
                $hostplanmeal = $dsql->SetQuery("SELECT `id`,`company`,`hostname`,`photo`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_host` WHERE `company` =".$val['id']." AND `state`=1  ORDER BY `price` ASC ");
                $hostplanmealArr =$dsql->dsqlOper($hostplanmeal, "results");

                     //租婚车
                $carplanmeal = $dsql->SetQuery("SELECT `id`,`company`,`title`,`pics`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_weddingcar` WHERE `company` =".$val['id']." AND `state`=1  ORDER BY `price` ASC ");
                $carplanmealArr =$dsql->dsqlOper($carplanmeal, "results");
                if ($hostplanmealArr){
                    foreach ($hostplanmealArr as $k => $v){
                        $hostplanmealArr[$k]['pics'] = $v['photo'];
                        $hostplanmealArr[$k]['title']= $v['hostname'];
                        unset(  $hostplanmealArr[$k]['photo']);
                        unset(  $hostplanmealArr[$k]['hostname']);
                    }
                }

                // $planmealArre = array_merge($hostplanmealArr,$planmealArr);
                if (!empty($carplanmealArr)){
                    $arrplanmeal = array_merge($hostplanmealArr,$planmealArr);
                    $planmealArre =array_merge($arrplanmeal,$carplanmealArr);
                }else{
                    $planmealArre =array_merge($hostplanmealArr,$planmealArr);
                }
                foreach($planmealArre as $k => $v){
                    $pics = $v['pics'];

                    if(!empty($pics)){
                        $pics = explode(",", $pics);
                        $planmealArre[$k]['litpic'] = getFilePath($pics[0]);
                    }

                    $param = array(
                        "service" => "marry",
                        "template" => "planmeal-detail",
                        "id" => $v['id'],
                        "typeid" =>$v['type'] ,
                        "istype" => $istype,
                        "businessid" => $businessid
                    );
                    $url = getUrlPath($param);
                    $planmealArre[$k]['url'] = $url;
                    $planmealArre[$k]['planmealName'] = $v['title'];
                }
                $list[$key]['taocan'] = $planmealArre;
                $list[$key]['pricee'] =  $planmealArre[0]['price'] ? $planmealArre[0]['price'] : '0.00';

                $arrconfig= array();
                if($val['config']) {
                    $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` in (" . $val['config'] . ")");
                    $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));
                    if ($configArr) {
                        foreach ($configArr as $k => $v) {
                            $arrconfig[$k] = array(
                                "jc" => $v['typename'],
                                "py" => GetPinyin($v['typename'])
                            );
                        }
                    }
                }
                $list[$key]['conFig'] = $arrconfig;

                $list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                if(strpos($list[$key]['distance'],'千米')){
                    $list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
                }elseif(strpos($list[$key]['distance'],'米')){
                    $list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
                }

                $bind_moduleArr  = array();
                $bind_moduleArr_ = $val['bind_module'] ? explode(',', $val['bind_module']) : array();
                if($bind_moduleArr_){
                    foreach($bind_moduleArr_ as $k => $row){
                        $bind_modulename = $this->gettypename("module_type", $row);
                        $bind_moduleArr[$k] = array(
                            "id" => $row,
                            "val" => $bind_modulename
                        );
                    }
                }
                $list[$key]["bind_moduleArr"]  = $bind_moduleArr;
                $list[$key]["bind_moduleArr_"] = $bind_moduleArr_;

                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__marry_type` WHERE `id` = ".$val['typeid']);
                $ret = $dsql->dsqlOper($sql, "results");
                $list[$key]['typename']   = $ret[0]['typename'] ? $ret[0]['typename'] : '';

                $imglist = array();
                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    $list[$key]['litpic'] = getFilePath($pics[0]);
                }else{
                    $sql = $dsql->SetQuery("SELECT `pics` FROM `#@__marry_list` WHERE `company` = ".$val['id']." AND `state` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        if(!empty($ret[0]['pics'])){
                            $pics = explode(",", $ret[0]['pics']);
                        }
                        $list[$key]['litpic'] = $pics[0]? getFilePath($pics[0]) : "/static/images/404.jpg";
                    }else{
                        $list[$key]['litpic'] = "/static/images/404.jpg";
                    }
                }

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
                    foreach ($tag as $k => $v) {
                        $tagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['tagAll'] = $tagArr;

                $flagArr = array();
                if(!empty($val['flag'])){
                    $flag = explode(",", $val['flag']);
                    foreach ($flag as $k => $v) {
                        $flagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['flagAll'] = $flagArr;
                if($filter!= ' '){
                    $param = array(
                        "service" => "marry",
                        "template" => "store-detail",
                        "id" => $val['id'],
                        "istype" => $istype,
                        "typeid" => $filter

                    );
                }
                if ($filter == 8){
                    $param = array(
                        "service" => "marry",
                        "template" => "hotel_detail",
                        "id" => $val['id'],
                        "istype" => $istype,
                        "typeid" => $filter

                    );
                }
                $url = getUrlPath($param);
                $list[$key]['url'] = $url;
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
        $istype = isset($id['istype']) ? $id['istype'] : 0;
        $typeid = isset($id['typeid']) ? $id['typeid'] : 0;
        $gettype     = is_numeric($this->param) ? 0 : $this->param['gettype'];
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();
        if(!is_numeric($id) && $uid == -1){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        $where = '';
        if((int)$gettype == 0){

            $where = " AND `state` = 1";
        }
        if(!is_numeric($id)){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = ".$uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $id = $results[0]['id'];
                $where = "";
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][11]);//该会员暂未开通公司
            }
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `cityid`, `lng`, `lat`, `tel`, `click`, `state`, `rec`, `userid`, `typeid`, `addrid`, `price`, `pics`, `taoxi`, `anli`, `bind_module`, `flag`, `video`, `note`, `address`, `config`,`tag`,`people`,`logo`,`hoteltitle`,`hoteltypeid`,`hotelpics`,`hotelnumber`,`hoteltag`,`hotelintroduce`, `refuse` FROM `#@__marry_store` WHERE `id` = ".$id.$where);
        $results = $dsql->dsqlOper($archives, "results");

        if($results){
            $storeDetail["id"]         = $results[0]['id'];

            $storeDetail["store"]["userid"] =   $results[0]['userid'];
            $storeDetail["title"]      = $results[0]['title'];
            $storeDetail['cityid']     = $results[0]['cityid'];
            $storeDetail["lng"]        = $results[0]['lng'];
            $storeDetail["lat"]        = $results[0]['lat'];
            $storeDetail["lnglat"]     = $results[0]['lng'] && $results[0]['lat'] ? $results[0]['lng'] . ',' . $results[0]['lat'] : '';
            $storeDetail["tel"]     =  $results[0]['tel'];
            $storeDetail["telNum_"]     =  $results[0]['tel'];
            $storeDetail["telNum_"]     = preg_replace('/(1[3456789]{1}[0-9])[0-9]{4}([0-9]{4})/is',"$1****$2", $results[0]['tel']);
            $storeDetail["click"]      = $results[0]['click'];
            $storeDetail["state"]      = $results[0]['state'];
            $storeDetail["refuse"]     = $results[0]['refuse'];
            $storeDetail["tag"]        = $results[0]['tag'];
            $storeDetail["rec"]        = $results[0]['rec'];
            $storeDetail["userid"]     = $results[0]['userid'];
            $storeDetail["taoxi"]      = $results[0]['taoxi'];
            $storeDetail["anli"]       = $results[0]['anli'];
            $storeDetail["people"]       = $results[0]['people'];
            $storeDetail["bind_module"]= $results[0]['bind_module'];
            $storeDetail["flag"]       = $results[0]['flag'];
            $storeDetail['video']        = $results[0]['video'];
            $storeDetail['videoSource']  = $results[0]['video'] ? getFilePath($results[0]['video']) : '';
            $storeDetail["note"]       = $results[0]['note'];
            $storeDetail["people"]       = $results[0]['people'];
            $storeDetail["hoteltitle"]       = $results[0]['hoteltitle'];
            $storeDetail["hoteltypeid"]       = $results[0]['hoteltypeid'];
            $storeDetail["hotelpic"]       = $results[0]['hotelpics'];
            $storeDetail["hotelnumber"]       = $results[0]['hotelnumber'];
            $storeDetail["hoteltag"]        =  $results[0]['hoteltag'];
            $storeDetail['tagSel']       = explode("|", $results[0]['hoteltag']);
            $storeDetail["hotelintroduce"]       = $results[0]['hotelintroduce'];
            $storeDetail["videoSource"]= getFilePath($results[0]['video']);

            $hotelmenu = $dsql->SetQuery("SELECT `price` FROM `#@__marry_hotelmenu` WHERE `company` =".$results[0]['id']." AND `state`=1  ORDER BY `price` ASC ");
            $hotelmenuArr = getCache("marry_hotelmenu", $hotelmenu, 300, array("disabled" => $u));
            $storeDetail['hotelprice'] =  $hotelmenuArr[0]['price'] ? $hotelmenuArr[0]['price'] : '0.00';  //酒店套餐的最低价

            //酒店场地信息
            $hotelfield = $dsql->SetQuery("SELECT count(`id`) totalCount, min(`maxtable`) mintable, max(`maxtable`) maxtable FROM `#@__marry_hotelfield` WHERE `company` =".$results[0]['id']." AND `state`=1");
            $hotelfieldArr = getCache("marry_hotelfield", $hotelfield, 300, array("disabled" => $u));
            $storeDetail['hotelfield'] = $hotelfieldArr ? array('count' => $hotelfieldArr[0]['totalCount'], 'min' => $hotelfieldArr[0]['mintable'], 'max' => $hotelfieldArr[0]['maxtable']) : array('count' => 0, 'min' => 0, 'max' => 0);

            $configName = $results[0]['config'];
            if ($configName){
                $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` in ($configName)");
                $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));
                $storeDetail['config'] = $configArr;
            }

            $bind_moduleArr  = array();
            $bind_moduleArr_ = $results[0]['bind_module'] ? explode(',', $results[0]['bind_module']) : array();
            if($bind_moduleArr_){
                foreach($bind_moduleArr_ as $k => $val){
                    $bind_modulename = $this->gettypename("module_type", $val);
                    $bind_moduleArr[$k] = array(
                        "id" => $val,
                        "val" => $bind_modulename
                    );
                }
            }
            $archives = $dsql->SetQuery("SELECT `p`.id,`p`.pics,`p`.title,`p`.price, `p`.userid, `p`.company, `p`.price, `p`.state,`p`.tag, `p`.type ,`s`.config,`p`.planmealstyle FROM `#@__marry_planmeal` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ".$id." AND p.`state`=1 ORDER BY `p`.price ASC ");
            $resultsplanmeal = $dsql->dsqlOper($archives, "results");

            $arc = $dsql->SetQuery("SELECT p.`id` FROM `#@__marry_host` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ". $results[0]['id']."  AND p.`state` = 1 ");
            $counthost  =$dsql->dsqlOper($arc, "results");

            $planmeal = $dsql->SetQuery("SELECT `id`,`company`,`title`,`pics`,`price`,`pubdate`,`type`,`planmealstyle`FROM `#@__marry_planmeal` WHERE `company` =". $results[0]['id']." AND `state`=1  ORDER BY `price` ASC ");
            $planmealArr = $dsql->dsqlOper($planmeal, "results");

           //租婚车
                $car = $dsql->SetQuery("SELECT c.`id` FROM `#@__marry_weddingcar`c LEFT  JOIN `#@__marry_store` s  ON `c`.company=`s`.id WHERE `c`.company = ".$results[0]['id']."  AND c.`state` = 1 ");
                $countcar  = $dsql->dsqlOper($car, "results");

            $hostplanmeal = $dsql->SetQuery("SELECT `id`,`company`,`hostname`,`photo`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_host` WHERE `company` =". $results[0]['id']." AND `state`=1  ORDER BY `price` ASC ");
            $hostplanmealArr =$dsql->dsqlOper($hostplanmeal, "results");
             //租婚车
                $carplanmeal = $dsql->SetQuery("SELECT `id`,`company`,`title`,`pics`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_weddingcar` WHERE `company` =".$results[0]['id']." AND `state`=1  ORDER BY `price` ASC ");
                $carplanmealArr =$dsql->dsqlOper($carplanmeal, "results");

            if ($hostplanmealArr){
                foreach ($hostplanmealArr as $k => $v){
                    $hostplanmealArr[$k]['pics'] = $v['photo'];
                    $hostplanmealArr[$k]['title']= $v['hostname'];
                    unset(  $hostplanmealArr[$k]['photo']);
                    unset(  $hostplanmealArr[$k]['hostname']);
                }
            }

            // $planmealArre = array_merge($hostplanmealArr,$planmealArr);
               if (!empty($carplanmealArr)){
                    $arrplanmeal = array_merge($hostplanmealArr,$planmealArr);
                    $planmealArre =array_merge($arrplanmeal,$carplanmealArr);
                }else{
                    $planmealArre =array_merge($hostplanmealArr,$planmealArr);
                }
            //图集
            if (is_array($planmealArre)){
                foreach($planmealArre as $key => $val) {
                    if (!empty($val['planmealstyle'])){
                        $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` = $val[planmealstyle]");
                        $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));
                    }
                    $planmealArre[$key]['planname'] = $configArr[0]['typename'];

                    $pics = $val['pics'];
                    if (!empty($pics)) {
                        $pics = explode(",", $pics);
                    }
                    $planmealArre[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';

                    $param = array(
                        "service" => "marry",
                        "template" => "planmeal-detail",
                        "id" => $val['id'],
                        "typeid" => $val['type'],
                    );
                    $url = getUrlPath($param);

                    $planmealArre[$key]['url'] = $url;
//                    $resultsplanmeal[$key]['pricee'] = $val['price'] ? $val['price']  : '0.00';
                }

            }
            $storeDetail['pricee'] = $planmealArre[0]['price'] ? $planmealArre[0]['price'] : '0.00';
            $storeDetail["planmealCount"]  = count($resultsplanmeal)+count($counthost)+count($countcar);

            $plancase = $dsql->SetQuery("SELECT `id`, `title`,`pics`, `userid`, `company`, `hoteltitle`,`state`,`typeid` FROM `#@__marry_plancase`  WHERE `company` = ".$id."  AND `state` = 1 ");
            $plancaseResults  = getCache("marry_plancase_detail", $plancase, 0, $id);
            //图集
            if ($plancaseResults){
                foreach($plancaseResults as $key => $val) {
                    $pics = $val['pics'];
                    if (!empty($pics)) {
                        $pics = explode(",", $pics);
                    }
                    $plancaseResults[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';
                    $param = array(
                        "service" => "marry",
                        "template" => "plancase-detail",
                        "id" => $val['id'],
                        "typeid" => $val['typeid'],
                    );
                    $url = getUrlPath($param);

                    $plancaseResults[$key]['url'] = $url;
                }
            }
            $storeDetail["plancaseCount"] = count((array)$plancaseResults);
            $storeDetail["planmeal"] = $resultsplanmeal;
            $storeDetail["plancase"] = $plancaseResults;
            $storeDetail["bind_moduleArr"]  = $bind_moduleArr;
            $storeDetail["bind_moduleArr_"] = $bind_moduleArr_;
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
            $storeDetail["tagArr"]  = $tagArr;
            $storeDetail["tagArr_"] = $tagArr_;

            $hoteltagArr = array();
            $hoteltagArr_ = $results[0]['hoteltag'] ? explode('|', $results[0]['hoteltag']) : array();
            if($hoteltagArr_){
                foreach ($hoteltagArr_ as $k => $v) {
                    $hoteltagArr[$k] = array(
                        "py" => GetPinyin($v),
                        "val" => $v
                    );
                }
            }
            $storeDetail["tagArr"]  = $hoteltagArr;
            $storeDetail["tagArr_"] = $hoteltagArr_;
            $flagArr = array();
            $flagArr_ = $results[0]['flag'] ? explode(',', $results[0]['flag']) : array();
            if($flagArr_){
                foreach ($flagArr_ as $k => $v) {
                    $flagArr[$k] = array(
                        "py" => GetPinyin($v),
                        "val" => $v
                    );
                }
            }
            $storeDetail["flagArr"]  = $flagArr;
            $storeDetail["flagArr_"] = $flagArr_;

            //会员信息
            $uid = $results[0]['userid'];
            $storeDetail['member']     = getMemberDetail($uid);

            $storeDetail["typeid"]     = $results[0]['typeid'];
            global $data;
            $data = "";
            $tuantype = getParentArr("marry_type", $results[0]['typeid']);
            if($tuantype){
                $tuantype = array_reverse(parent_foreach($tuantype, "typename"));
                $storeDetail['typename'] = join(" > ", $tuantype);
                $storeDetail['typenameonly'] = count($tuantype) > 2 ? $tuantype[1] : $tuantype[0];
            }else{
                $storeDetail['typename'] = "";
                $storeDetail['typenameonly'] = "";
            }
            // global $hoteldata;
            // $hoteldata = "";
            // $hoteltype = getParentArr("marry_type", $results[0]['hoteltypeid']);
            // if($hoteltype){
            //     $hoteltype = array_reverse(parent_foreach($hoteltype, "typename"));
            //     $storeDetail['hoteltypename'] = join(" > ", $hoteltype);
            //     $storeDetail['hoteltypenameonly'] = count($hoteltype) > 2 ? $hoteltype[1] : $hoteltype[0];
            // }else{
            //     $storeDetail['hoteltypename'] = "";
            //     $storeDetail['hoteltypenameonly'] = "";
            // }

            $hoteltypename = '';
            switch($results[0]['hoteltypeid']){
                case 1:
                    $hoteltypename = '星级酒店';
                    break;
                case 2:
                    $hoteltypename = '婚礼会所';
                    break;
                case 3:
                    $hoteltypename = '特色餐厅';
                    break;
                case 4:
                    $hoteltypename = '游轮婚礼';
                    break;
            }
            $storeDetail['hoteltypename'] = $hoteltypename;

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
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'marry-store' AND `aid` = '$id' AND `pid` = 0");
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            $storeDetail['common'] = $totalCount;

            //验证是否已经收藏
            $collect = '';
            if($uid != -1){
                $params = array(
                    "module" => "marry",
                    "temp"   => "hotel-detail",
                    "type"   => "add",
                    "id"     => $results[0]['id'],
                    "check"  => 1
                );
                $collect = checkIsCollect($params);
            }
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;
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

            //酒店图集
            $hotelimglist = array();
            $picsss = $results[0]['hotelpics'];
            if(!empty($pics)){
                $pics = explode(",", $picsss);
                foreach ($pics as $key => $value) {
                    $hotelimglist[$key]['path'] = getFilePath($value);
                    $hotelimglist[$key]['pathSource'] = $value;
                }
            }
            $storeDetail['hotelpics'] = $hotelimglist;
            $picss = getFilePath($results[0]['logo']);
            $storeDetail['logo'] = $picss;
        }//print_R($storeDetail);
        return $storeDetail;
    }

    /**
     * 发表预约
     * @return array
     */
    public function sendRese(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $param = $this->param;
        $company     = $_REQUEST['company'];
        $people      = $param['people'];
        $stype       = $param['stype'];
        $style       = (int)$param['style'];
        $comstyle    = $param['comstyle'];
        $jiastyle    = $param['jiastyle'];
        $tel    = $param['tel'];
        $contact     = $param['contact'];
        $community   = $param['community'];
        $appointment = $param['appointment'];
        $budget      = $param['budget'];
        $units       = $param['units'];
        $are         = (int)$param['are'];
        $addrid      = $param['addrid'];
        $address     = $param['address'];
        $body        = $param['body'];
        $is_smart    = (int)$param['is_smart'];
        $resetype    = (int)$param['resetype'];
        $type        = (int)$param['type'];
        $comtype       = (int)$param['comtype'];    /**  1酒店   2 商家 */
        if($is_smart==0 &&$type ==0){
            $bid         = $company = (int)$param['bid'];
        }elseif($type ==1 || $type ==2){
            $bid         = $userid  = (int)$param['bid'];
        }
        if($comstyle){

            $units = $comstyle;

        }elseif($jiastyle){

            $units = $jiastyle;
        }
        $uid     = $userLogin->getMemberID();
        $use = $dsql->SetQuery(" SELECT `userid` FROM `#@__marry_store` WHERE  `id` = ".$company);
        $ret = $dsql->dsqlOper($use, "results");
        if($ret[0]['userid'] == $uid)
        {
            return array("state" => 200, "info" => '禁止预约自己！');
        }

        $userDetail = $userLogin->getMemberInfo();
        if( empty($people) || empty($contact)){
            return array("state" => 200, "info" => '必填项不得为空！');
        }

//        if($uid == -1){
//            return array("state" => 200, "info" => '登录超时，请重新登录！');
//        }

//      if(!is_numeric($contact)){
//            return array("state" => 200, "info" => '请认真填写手机号');
//        }
//        if(!is_numeric($are)){
//            return array("state" => 200, "info" => '请认真填写面积');
//        }

        //手机号码增加区号，国内版不显示
        $contact = ($tel == '86' ? '' : $tel) . $contact;

        // if($resetype ==1){
        //  $type =3;
        // }
        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];
            $userid = $ret[0]['userid'];
//        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        $archives = $dsql->SetQuery("INSERT INTO `#@__marry_rese` (`company`, `people`,`pid`,`resetype`,`contact`, `appointment`,`addrid`,`address`, `ip`, `ipaddr`,`bid`, `pubdate`,`state`,`comtype`) VALUES('$company', '$people','$uid','$resetype','$contact', ".(!empty($appointment) ? GetMkTime($appointment) : 0).",'$addrid','$address','".GetIP()."', '".getIpAddr(GetIP())."', '$userid',".GetMkTime(time()).",'$state','$comtype')");
        $results  = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            autoShowUserModule($uid,'marry');  // 预约看店，自动增加用户婚嫁卡片
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——marry模块——用户:'.$userDetail['username'].'申请了预约',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("marry", "rese",$param);
            return "预约成功！";
        }else{
            return array("state" => 200, "info" => '预约失败！');
        }

    }


    /**
     * 公司确认预约信息
     * @return array
     */
    public function updateRese(){
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $id     = (int)$param['id'];
        $type   = (int)$param['type'];

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '公司信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }

        $sql = $dsql->SetQuery("SELECT `bid` FROM `#@__marry_rese` WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['bid'];
            if($bid == $sid){

                $sql = $dsql->SetQuery("UPDATE `#@__marry_rese` SET `state` = 1 WHERE `id` = ".$id);
                $ret = $dsql->dsqlOper($sql, "update");
                if($ret == "ok"){

                    return "ok";

                }else{
                    return array("state" => 101, "info" => '更新失败，请稍后重试！');
                }

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }

        }else{
            return array("state" => 101, "info" => '预约信息不存在或已经删除！');
        }

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
        $bind_module = $param['bind_module'];
        $price       = $param['price'] ? $param['price']  : '0.00' ;
        $tel         = $param['tel'];
        $pics        = $param['pics'];
        $logo       = $param['logo'];
        $people        = $param['people'];
        $taoxi       = (int)$param['taoxi'];
        $anli        = (int)$param['anli'];
        $video       = $param['video'];
        $hoteltitle  = $param['hoteltitle'];
        $hoteltypeid = (int)$param['hoteltypeid'];
        $hotelpics   = $param['hotelpics'];
        $hotelnumber = $param['hotelnumber'];
        $hotelintroduce   = filterSensitiveWords(addslashes($param['hotelintroduce']));
        $note        = filterSensitiveWords(addslashes($param['note']));


        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }

        if(isset($param['hoteltag'])){
            $hoteltag = $param['hoteltag'];

            $hoteltag = is_array($hoteltag) ? join("|", $hoteltag) : $hoteltag;
        }

        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['userType'] != 2){
            return array("state" => 200, "info" => $langData['marry'][5][1]);//账号验证错误，操作失败
        }

        //权限验证
        if(!verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][2]);//商家权限验证失败
        }

//        if(empty($title)){
//            return array("state" => 200, "info" => $langData['marry'][5][3]);//请填写公司名称
//        }

        if(empty($cityid)){
            return array("state" => 200, "info" => $langData['marry'][5][4]);//请选择所在地区
        }

        if(empty($tel)){
            return array("state" => 200, "info" => $langData['marry'][5][5]);//请填写联系方式
        }

        if(empty($pics)){
            return array("state" => 200, "info" => $langData['marry'][5][6]);//请上传图集
        }

        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        //新商铺
        if(!$userResult){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_store` (`cityid`, `title`, `userid`, `typeid`, `addrid`, `address`, `tel`, `price`, `pics`, `video`, `note`, `bind_module`, `taoxi`, `anli`, `tag`, `pubdate`, `state`,`logo`,`people`,`hoteltitle`,`hoteltypeid`,`hotelpics`,`hotelnumber`,`hoteltag`,`hotelintroduce`) VALUES ('$cityid', '$title', '$userid', '$typeid', '$addrid', '$address', '$tel', '$price', '$pics', '$video', '$note', '$bind_module', '$taoxi', '$anli', '$tag', '$pubdate', '1','$logo','$people','$hoteltitle','$hoteltypeid','$hotelpics','$hotelnumber','$hoteltag','$hotelintroduce')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'store-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'store', $aid, 'insert', '配置店铺('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userDetail['username'].'新增婚嫁公司: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "store",$param);
                clearCache("marry_store_total", 'key');
                dataAsync("marry",$aid,"hstore");  // 婚嫁、商家、新增
                dataAsync("marry",$aid,"nhstore");  // 婚嫁、商家、新增

                return $langData['marry'][5][7];//配置成功，您的商铺正在审核中，请耐心等待！
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][8]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }else{
            if ($title){
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__marry_store` SET `cityid` = '$cityid', `title` = '$title', `userid` = '$userid', `typeid` = '$typeid', `addrid` = '$addrid', `address` = '$address', `tel` = '$tel', `price` = '$price', `pics` = '$pics', `video` = '$video', `note` = '$note', `bind_module` = '$bind_module', `taoxi` = '$taoxi', `anli` = '$anli', `tag` = '$tag', `state` = '1',`logo` = '$logo',`people` = '$people'WHERE `userid` = ".$userid);
                $results = $dsql->dsqlOper($archives, "update");
            }else{
                $archives = $dsql->SetQuery("UPDATE `#@__marry_store` SET `hoteltitle` = '$hoteltitle',`hoteltypeid` = '$hoteltypeid',`hotelpics` = '$hotelpics',`hotelnumber` = '$hotelnumber',`hoteltag` = '$hoteltag', `hotelintroduce` = '$hotelintroduce' WHERE `userid` = ".$userid);
                $results = $dsql->dsqlOper($archives, "update");
            }
            if($results == "ok"){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'store-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'store', $userResult[0]['id'], 'update', '更新店铺('.($title ? $title : $hoteltitle).')', $url, $archives);

                // 检查缓存
                $id = $userResult[0]['id'];
                checkCache("marry_store_list", $id);
                clearCache("marry_store_total", 'key');
                clearCache("marry_store_detail", $id);
                dataAsync("marry",$id,"hstore");  // 婚嫁、商家、新增
                dataAsync("marry",$id,"nhstore");  // 婚嫁、商家、新增

                return $langData['marry'][5][9];//保存成功！
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][8]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }

    }

    /**
     * 配置商铺类别
     * @return array
     */
    public function storeConfigModule(){
        global $dsql;
        global $userLogin;
        global $langData;
        $userid = $userLogin->getMemberID();
        $param = $this->param;

        $bind_module = $param['bind_module'];

        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['userType'] != 2){
            return array("state" => 200, "info" => $langData['marry'][5][1]);//账号验证错误，操作失败
        }

        //权限验证
        if(!verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][2]);//商家权限验证失败
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        //新商铺
        if(!$userResult){

            return array("state" => 200, "info" => "还未开通婚嫁店铺，请开通后再操作~");

        }else{
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__marry_store` SET `bind_module` = '$bind_module' WHERE `userid` = ".$userid);
            $results = $dsql->dsqlOper($archives, "update");

            if($results == "ok"){
                $oldid = $userResult[0]['id'];

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'store-detail',
                    'id' => $oldid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'travel', 'store', $oldid, 'update', '修改婚嫁店铺经营类目('.$userResult[0]['title'].' => '.$bind_module.')', $url, $archives);

                // 检查缓存
                checkCache("marry_store_list", $oldid);
                clearCache("marry_store_total", 'key');
                clearCache("marry_store_detail", $oldid);
                dataAsync("marry",$oldid,"hstore");  // 婚嫁、商家、新增
                dataAsync("marry",$oldid,"nhstore");  // 婚嫁、商家、新增
                
                return $langData['marry'][5][9];//保存成功！
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][8]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }

    }


    /**
     *  酒店商铺
     * @return array
     */
    public function hotelConfig(){
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
        $pics        = $param['hotelpics'];
        $people        = $param['people'];
        $video       = $param['video'];
        $hoteltitle  = $param['hoteltitle'];
        $hoteltypeid = (int)$param['hoteltypeid'];
        $hotelpics   = $param['hotelpics'];
        $hotelnumber = $param['hotelnumber'];
        $hotelintroduce   = filterSensitiveWords(addslashes($param['hotelintroduce']));
        $note        = filterSensitiveWords(addslashes($param['note']));

        $lnglatArr = explode(',', $lnglat);
        $lng = $lnglatArr[0];
        $lat = $lnglatArr[1];

        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }

        if(isset($param['hoteltag'])){
            $hoteltag = $param['hoteltag'];

            $hoteltag = is_array($hoteltag) ? join("|", $hoteltag) : $hoteltag;
        }

        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['userType'] != 2){
            return array("state" => 200, "info" => $langData['marry'][5][1]);//账号验证错误，操作失败
        }

        //权限验证
        if(!verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][2]);//商家权限验证失败
        }

//        if(empty($title)){
//            return array("state" => 200, "info" => $langData['marry'][5][3]);//请填写公司名称
//        }

        if(empty($cityid)){
            return array("state" => 200, "info" => $langData['marry'][5][4]);//请选择所在地区
        }

        if(empty($tel)){
            return array("state" => 200, "info" => $langData['marry'][5][5]);//请填写联系方式
        }

        if(empty($pics)){
            return array("state" => 200, "info" => $langData['marry'][5][6]);//请上传图集
        }

        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        //新商铺
        if(!$userResult){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_store` (`cityid`,`userid`, `addrid`, `address`, `lng`, `lat`, `tel`, `video`, `pubdate`, `people`,`hoteltitle`,`hoteltypeid`,`hotelpics`,`hotelnumber`,`hoteltag`,`hotelintroduce`) VALUES ('$cityid','$userid', '$addrid', '$address', '$lng', '$lat', '$tel', '$video', '$note','$pubdate','$people','$hoteltitle','$hoteltypeid','$hotelpics','$hotelnumber','$hoteltag','$hotelintroduce')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'hotel_detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotel', $aid, 'insert', '配置酒店('.$hoteltitle.')', $url, $archives);
                
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userDetail['username'].'新增婚嫁酒店: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "store",$param);
                clearCache("marry_store_total", 'key');
                dataAsync("marry",$aid,"hotelfield");  // 婚嫁、酒店场地、新增

                return $langData['marry'][5][7];//配置成功，您的商铺正在审核中，请耐心等待！
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][8]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }else{
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__marry_store` SET `cityid` = '$cityid',`userid` = '$userid', `hoteltypeid` = '$typeid', `addrid` = '$addrid', `address` = '$address', `lng` = '$lng', `lat` = '$lat', `video` = '$video',`people` = '$people',`hoteltitle` = '$hoteltitle',`hoteltypeid` = '$hoteltypeid',`hotelpics` = '$hotelpics',`hotelnumber` = '$hotelnumber',`hoteltag` = '$hoteltag', `hotelintroduce` = '$hotelintroduce' WHERE `userid` = ".$userid);
            $results = $dsql->dsqlOper($archives, "update");

            if($results == "ok"){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'hotel_detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotel', $userResult[0]['id'], 'update', '更新酒店('.$hoteltitle.')', $url, $archives);

                // 检查缓存
                $id = $userResult[0]['id'];
                checkCache("marry_store_list", $id);
                clearCache("marry_store_total", 'key');
                clearCache("marry_store_detail", $id);
                dataAsync("marry",$id,"hotelfield");  // 婚嫁、酒店场地、更新

                return $langData['marry'][5][9];//保存成功！
            }else{
                return array("state" => 200, "info" => $langData['marry'][5][8]);//配置失败，请查检您输入的信息是否符合要求！
            }
        }

    }





    /**
     * 操作婚宴场地
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operHotelfield(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/marry.inc.php");
        $custommarryhotelfieldCheck = (int)$custommarryhotelfieldCheck;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $maxtable        =  (int)$param['maxtable'];
        $besttable       =  (int)$param['besttable'];
        $floorheight     =  (int)$param['floorheight'];
        $area     	     =  $param['area'];
        $column     	 =  (int)$param['column'] ? (int)$param['column'] : 0;
        $fields     	 =  (int)$param['fields'] ? (int)$param['fields'] : 0;
        $pics     	     =  $param['pics'];
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($title)) return array("state" => 200, "info" => $langData['marry'][4][9]);//请输入公司名称！
            if(empty($maxtable)) return array("state" => 200, "info" => $langData['marry'][4][19]);//请输入容纳桌数！
            if(empty($besttable)) return array("state" => 200, "info" => $langData['marry'][4][20]);//请输入最佳桌数！
            if(empty($floorheight)) return array("state" => 200, "info" => $langData['marry'][4][21]);//请输入层高！
            if(empty($area)) return array("state" => 200, "info" => $langData['marry'][4][22]);//请输入面积！
            if(empty($pics)) return array("state" => 200, "info" => $langData['marry'][4][8]);//请上传图片图片
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_hotelfield` (`title`, `userid`, `company`, `pics`, `maxtable`, `besttable`, `floorheight`, `area`, `column`, `fields`, `pubdate`, `state`) VALUES ('$title', '$userid', '$company', '$pics', '$maxtable', '$besttable', '$floorheight', '$area', '$column', '$fields', '$pubdate', '$custommarryhotelfieldCheck')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotelfield', $aid, 'insert', '添加婚宴场地('.$title.')', '', $archives);

                if($custommarryhotelfieldCheck){
                    updateCache("marry_hotelfield_list", 300);
                }
                clearCache("marry_hotelfield_total", 'key');
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增婚宴场地: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "hotelfield",$param);
                return $aid;
            }else{
                return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_hotelfield` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__marry_hotelfield` SET `title` = '$title', `userid` = '$userid', `company` = '$company', `pics` = '$pics', `maxtable` = '$maxtable', `besttable` = '$besttable', `floorheight` = '$floorheight', `area` = '$area', `column` = '$column', `fields` = '$fields', `state` = '$custommarryhotelfieldCheck' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotelfield', $id, 'update', '修改婚宴场地('.$title.')', '', $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'更新了婚宴场地id: '.$id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "hotelfield",$param);

                // 清除缓存
                clearCache("marry_hotelfield_detail", $id);
                checkCache("marry_hotelfield_list", $id);
                clearCache("marry_hotelfield_total", 'key');


                return $langData['marry'][5][17];//修改成功！
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`title`, l.`pics`, s.`userid` FROM `#@__marry_hotelfield` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){
                    //删除图集
                    delPicFile($results['pics'], "delAtlas", "marry");
                    // 清除缓存
                    clearCache("marry_hotelfield_detail", $id);
                    checkCache("marry_hotelfield_list", $id);
                    clearCache("marry_hotelfield_total", 'key');

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_hotelfield` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'hotelfield', $id, 'delete', '删除婚宴场地('.$results[0]['title'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }
    }

    /**
     * 婚宴场地列表
     * @return array
     */
    public function hotelfieldList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $typeid   = $this->param['typeid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addrid'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "marry_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `maxtable`, `besttable`, `floorheight`, `area`, `column`, `fields`, `click`, `pubdate`, `state`  FROM `#@__marry_hotelfield` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_hotelfield` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_hotelfield_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_hotelfield_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['maxtable']  = $val['maxtable'];
                $list[$key]['besttable'] = $val['besttable'];
                $list[$key]['floorheight']= $val['floorheight'];
                $list[$key]['area']      = $val['area'];
                $list[$key]['column']    = $val['column'];
                $list[$key]['fields']    = $val['fields'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];

                $list[$key]["columnname"]= $val['column'] == 1 ? $langData['marry'][2][52] : $langData['marry'][2][53];//有 无
                $list[$key]["fieldsname"]= $val['fields'] == 1 ? $langData['marry'][2][57] : $langData['marry'][2][56];//长方形 正方形

                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                    $list[$key]['litpic'] = getFilePath($pics[0]);
                }else{
                    $list[$key]['litpic']  = '';
                }

                $param = array(
                    "service" => "marry",
                    "template" => "hotelfield-detail",
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
     * 婚宴场地详细
     * @return array
     */
    public function hotelfieldDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `maxtable`, `besttable`, `floorheight`, `area`, `column`, `fields`, `click`, `pubdate`, `state` FROM `#@__marry_hotelfield` WHERE `id` = ".$id.$where);
        $results  = getCache("marry_hotelfield_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["title"]       = $results[0]['title'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail['maxtable']    = $results[0]['maxtable'];
            $storeDetail["besttable"]   = $results[0]['besttable'];
            $storeDetail["floorheight"] = $results[0]['floorheight'];
            $storeDetail["area"]        = $results[0]['area'];
            $storeDetail["column"]      = $results[0]['column'];
            $storeDetail["columnname"]  = $results[0]['column'] == 1 ? $langData['marry'][2][52] : $langData['marry'][2][53];//有 无
            $storeDetail["fields"]      = $results[0]['fields'];
            $storeDetail["fieldsname"]  = $results[0]['fields'] == 1 ? $langData['marry'][2][57] : $langData['marry'][2][56];//长方形 正方形
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];

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

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "marry",
                "temp"   => "hotelfield-detail",
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
     * 操作婚宴菜单
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operHotelmenu(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/marry.inc.php");
        $custommarryhotelmenuCheck = (int)$custommarryhotelmenuCheck;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $price     	     =  (float)$param['price'];
        if(isset($param['dishname'])){
            $dishname = $param['dishname'];
            $dishname = is_array($dishname) ? join("|", $dishname) : $dishname;
        }
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($title)) return array("state" => 200, "info" => $langData['marry'][5][32]);//请输入套餐名称！
            if(empty($price)) return array("state" => 200, "info" => $langData['marry'][5][33]);//请输入套餐价格！
            if(empty($dishname)) return array("state" => 200, "info" => $langData['marry'][5][34]);//请输入菜品名称！
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_hotelmenu` (`title`, `userid`, `company`, `price`, `dishname`, `pubdate`, `state`) VALUES ('$title', '$userid', '$company', '$price', '$dishname', '$pubdate', '$custommarryhotelmenuCheck')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotelmenu', $aid, 'insert', '添加婚宴菜单('.$title.')', '', $archives);

                if($custommarryhotelmenuCheck){
                    updateCache("marry_hotelmenu_list", 300);
                    clearCache("marry_hotelmenu_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增了婚宴菜单: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "hotelmenu",$param);

                return $aid;
            }else{
                return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_hotelmenu` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__marry_hotelmenu` SET `title` = '$title', `userid` = '$userid', `company` = '$company', `price` = '$price', `dishname` = '$dishname', `state` = '$custommarryhotelmenuCheck' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'hotelmenu', $id, 'update', '修改婚宴菜单('.$title.')', '', $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'更新了婚宴菜单id: '.$id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "hotelmenu",$param);

                // 清除缓存
                clearCache("marry_hotelmenu_detail", $id);
                checkCache("marry_hotelmenu_list", $id);
                clearCache("marry_hotelmenu_total", 'key');


                return $langData['marry'][5][17];//修改成功！
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`title`, s.`userid` FROM `#@__marry_hotelmenu` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){
                    // 清除缓存
                    clearCache("marry_hotelmenu_detail", $id);
                    checkCache("marry_hotelmenu_list", $id);
                    clearCache("marry_hotelmenu_total", 'key');

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_hotelmenu` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'hotelmenu', $id, 'delete', '删除婚宴菜单('.$results['title'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }
    }

    /**
     * 婚宴菜单列表
     * @return array
     */
    public function hotelmenuList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $typeid   = $this->param['typeid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addrid'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "marry_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `price`, `dishname`, `click`, `pubdate`, `state` FROM `#@__marry_hotelmenu` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_hotelmenu` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_hotelmenu_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_hotelmenu_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['dishname']  = $val['dishname'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];

                $tagArr_ = $val['dishname'] ? explode('|', $val['dishname']) : array();
                $list[$key]["tagArr_"]   = $tagArr_;

                $param = array(
                    "service" => "marry",
                    "template" => "hotel_detail",
                    "id" => $val['company']
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
     * 婚宴菜单详细
     * @return array
     */
    public function hotelmenuDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `price`, `dishname`, `click`, `pubdate`, `state` FROM `#@__marry_hotelmenu` WHERE `id` = ".$id.$where);
        $results  = getCache("marry_hotelmenu_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["title"]       = $results[0]['title'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail['price']       = $results[0]['price'];
            $storeDetail["dishname"]    = $results[0]['dishname'];
            $tagArr_ = $results[0]['dishname'] ? explode('|', $results[0]['dishname']) : array();
            $storeDetail["tagArr_"]     = $tagArr_;
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "marry",
                "temp"   => "hotelmenu-detail",
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
     * 操作主持人
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operHost(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/marry.inc.php");
        $custommarryhostCheck = (int)$custommarryhostCheck;
        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $hostname        =  filterSensitiveWords(addslashes($param['title']));
        $price     	     =  (float)$param['price'];
        $tel             =  $param['tel'];
        $note            =  $param['note'];
        $photo           =  $param['pics'];
        $worksItem       =  $param['worksItem'];
        $pubdate         =  GetMkTime(time());
        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }
        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($price)) return array("state" => 200, "info" => $langData['marry'][4][14]);//请输入价格！
            if(empty($tel)) return array("state" => 200, "info" => $langData['marry'][5][34]);//请输入手机号！
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_host` (`hostname`, `userid`, `company`, `photo`, `tel`, `price`, `note`, `pubdate`, `state`,`host`,`music`,`scenesupervision`,`hoststyle`,`planmealcontent`,`servicefeatures`,`buynotice`,`style`,`planmealtype`,`characteristicservice`,`tag`) VALUES ('$hostname', '$userid', '$company', '$photo', '$tel', '$price', '$note', '$pubdate','$custommarryhostCheck','$param[host_7]','$param[music_7]','$param[scenesupervision_7]','$param[hoststyle_7]','$param[planmealcontent_7]','$param[servicefeatures_7]','$param[buynotice]','$param[style_7]','5','$param[characteristicservice_7]','$tag')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'planmeal-detail',
                    'id' => $aid,
                    'type' => 7
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'host7', $aid, 'insert', '添加主持人('.$hostname.')', $url, $archives);

                if(!empty($worksItem)){
                    $worksItemArr = explode("|||", $worksItem);
                    foreach($worksItemArr as $val){
                        $workInfo = explode("$$$", $val);
                        $worksql  = $dsql->SetQuery("INSERT INTO `#@__marry_hostvideo` (`title`, `litpic`, `hostid`, `video`, `pubdate`) VALUES ('$workInfo[0]', '$workInfo[1]', '$aid', '$workInfo[2]', '$pubdate')");
                        $dsql->dsqlOper($worksql, "update");
                    }
                }
                if($custommarryhostCheck){
                    updateCache("marry_host_list", 300);
                    clearCache("marry_host_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增主持人: '.$hostname,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "host",$param);
                return $aid;
            }else{
                return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_host` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                //保存到主表
//				$archives = $dsql->SetQuery("UPDATE `#@__marry_host` SET `hostname` = '$hostname', `userid` = '$userid', `company` = '$company', `photo` = '$photo', `tel` = '$tel', `price` = '$price', `note` = '$note', `state` = '$custommarryhostCheck' WHERE `id` = ".$id);

                $archives = $dsql->SetQuery("UPDATE `#@__marry_host` SET `hostname` = '$hostname', `company` = '$company', `photo` = '$photo', `tel` = '$tel', `price` = '$price', `note` = '$param[note]', `host` = '$param[host_7]',`music` = '$param[music_7]',`scenesupervision` = '$param[scenesupervision_7]',`hoststyle` = '$param[hoststyle_7]',`planmealcontent` = '$param[planmealcontent_7]',`characteristicservice` = '$param[characteristicservice_7]',`style` = '$param[style_7]',`planmealtype` = '$param[typeid]',`servicefeatures` = '$param[servicefeatures_7]',`buynotice` = '$param[buynotice]',`click` = '$param[click]',`tag` = '$tag' WHERE `id` = ".$id);


                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'planmeal-detail',
                    'id' => $id,
                    'type' => 7
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'host7', $id, 'update', '修改主持人('.$hostname.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增更新了主持人id: '.$id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "host",$param);

                $archives = $dsql->SetQuery("DELETE FROM `#@__marry_hostvideo` WHERE `hostid` = ".$id);
                $dsql->dsqlOper($archives, "update");

                if(!empty($worksItem)){
                    $worksItemArr = explode("|||", $worksItem);
                    foreach($worksItemArr as $val){
                        $workInfo = explode("$$$", $val);
                        $worksql  = $dsql->SetQuery("INSERT INTO `#@__marry_hostvideo` (`title`, `litpic`, `hostid`, `video`, `pubdate`) VALUES ('$workInfo[0]', '$workInfo[1]', '$id', '$workInfo[2]', '$pubdate')");
                        $dsql->dsqlOper($worksql, "update");
                    }
                }

                // 清除缓存
                clearCache("marry_host_detail", $id);
                checkCache("marry_host_list", $id);
                clearCache("marry_host_total", 'key');

                return $langData['marry'][5][17];//修改成功！
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`hostname`, l.`photo`, s.`userid` FROM `#@__marry_host` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){
                    // 清除缓存
                    clearCache("marry_host_detail", $id);
                    checkCache("marry_host_list", $id);
                    clearCache("marry_host_total", 'key');

                    delPicFile($results['photo'], "delThumb", "marry");

                    $sql = $dsql->SetQuery("SELECT `litpic`, `video` FROM `#@__marry_hostvideo` WHERE `hostid` = ".$id);
                    $res = $dsql->dsqlOper($sql, "results");
                    if($res){
                        foreach($res as $v){
                            delPicFile($v['litpic'], "delThumb", "marry");
                            delPicFile($v['video'], "delVideo", "marry");
                        }
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_hostvideo` WHERE `hostid` = ".$id);
                    $dsql->dsqlOper($archives, "update");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_host` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
                
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'host7', $id, 'delete', '删除主持人('.$results['hostname'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }
    }

    /**
     * 主持人列表
     * @return array
     */
    public function hostList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $typeid   = $this->param['typeid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addrid'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "marry_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `hostname`, `userid`, `company`, `photo`, `tel`, `price`, `click`, `pubdate`, `state` FROM `#@__marry_host` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_host` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_host_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_host_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['hostname']  = $val['hostname'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['tel']       = $val['tel'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['photo']     = $val['photo'];
                $list[$key]['photoSource']= $val['photo'] ? getFilePath($val['photo']) : '';

                $workArr = [];
                $sql = $dsql->SetQuery("SELECT `id`, `title`, `litpic` FROM `#@__marry_hostvideo` WHERE `hostid` = '".$val['id']."' ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC limit 0,3");
                $res = $dsql->dsqlOper($sql, "results");
                if(!empty($res)){
                    foreach($res as $k=> $v){
                        $workArr[$k]['id']           = $v['id'];
                        $workArr[$k]['title']        = $v['title'];
                        $workArr[$k]['litpic']       = $v['litpic'];
                        $workArr[$k]['litpicSource'] = $v['litpic'] ? getFilePath($v['litpic']) : '';
                    }
                }
                $list[$key]["workArr"]     = $workArr;

                $param = array(
                    "service" => "marry",
                    "template" => "host-detail",
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
     * 主持人详细
     * @return array
     */
    public function hostDetail(){

        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();
        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `hostname`, `userid`, `company`, `price`, `tel`, `photo`, `note`, `click`, `pubdate`, `state` FROM `#@__marry_host` WHERE `id` = ".$id.$where);
        $results  = getCache("marry_host_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["hostname"]    = $results[0]['hostname'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail['price']       = $results[0]['price'];
            $storeDetail["tel"]         = $results[0]['tel'];
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];
            $storeDetail["note"]        = $results[0]['note'];
            $storeDetail["photo"]       = $results[0]['photo'];
            $storeDetail["photoSource"] = $results[0]['photo'] ? getFilePath($results[0]['photo']) : '';

            $workArr = [];
            $sql = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `video` FROM `#@__marry_hostvideo` WHERE `hostid` = '$id' ORDER BY  `weight` DESC, `pubdate` DESC, `id` DESC");
            $res = $dsql->dsqlOper($sql, "results");
            if(!empty($res)){
                foreach($res as $key=> $val){
                    $workArr[$key]['id']           = $val['id'];
                    $workArr[$key]['title']        = $val['title'];
                    $workArr[$key]['litpic']       = $val['litpic'];
                    $workArr[$key]['litpicSource'] = $val['litpic'] ? getFilePath($val['litpic']) : '';
                    $workArr[$key]['video']        = $val['video'];
                    $workArr[$key]['videoSource']  = $val['video'] ? getFilePath($val['video']) : '';
                }
            }
            $storeDetail["workArr"]     = $workArr;

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "marry",
                "temp"   => "host-detail",
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
     * 操作婚车
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operRental(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC."/config/marry.inc.php");
        $customweddingcarCheck = (int)$customweddingcarCheck;
        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }


        $param           =  $this->param;
        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $price     	     =  (float)$param['price'];
        $pics            =  $param['pics'];
        $duration        =  $param['duration_10'];
        $kilometre       =  $param['kilometre_10'];
        $pubdate         =  GetMkTime(time());
        if(isset($param['tag'])){
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }
        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($title)) return array("state" => 200, "info" => $langData['marry'][4][30]);//请输入名称！
            if(empty($price)) return array("state" => 200, "info" => $langData['marry'][4][14]);//请输入价格！
//			if(empty($duration) || empty($kilometre)) return array("state" => 200, "info" => $langData['marry'][4][31]);//请输入时长！
            if(empty($pics)) return array("state" => 200, "info" => $langData['marry'][4][8]);//请至少上传一张图片！
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_weddingcar` (`title`, `userid`, `company`, `pics`, `price`, `duration`, `kilometre`, `pubdate`, `state`,`planmealtype`,`style`,`characteristicservice`,`carintroduction`,`costcontain`,`costbarring`,`buynotice`,`tel`,`tag`,`note`) VALUES ('$title', '$userid', '$company', '$pics', '$price', '$duration', '$kilometre', '$pubdate', '$customweddingcarCheck','10','$param[style_10]','$param[characteristicservice_10]','$param[carintroduction_10]','$param[costcontain_10]','$param[costbarring_10]','$param[buynotice]','$param[tel]','$tag','$param[note]')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'planmeal-detail',
                    'id' => $aid,
                    'type' => 10
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'host10', $aid, 'insert', '添加婚车('.$title.')', $url, $archives);

                if($customweddingcarCheck){
                    updateCache("marry_weddingcar_list", 300);
                    clearCache("marry_weddingcar_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增婚车信息: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "weddingcar",$param);

                return $aid;
            }else{
                return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_weddingcar` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__marry_weddingcar` SET `title` = '$title', `userid` = '$userid',`company` = '$company', `pics` = '$pics', `price` = '$price', `duration` = '$duration', `kilometre` = '$kilometre', `state` = '$customweddingcarCheck',`planmealtype` = '10',`style` = '$param[style_10]',`characteristicservice` = '$param[characteristicservice_10]',`carintroduction` = '$param[carintroduction_10]',`costcontain` = '$param[costcontain_10]',`costbarring` = '$param[costbarring_10]',`buynotice` = '$param[buynotice]',`click` = '$param[click]',`tel` = '$param[tel]',`weight` = '$param[weight]',`note` = '$param[note]',`tag` = '$tag'WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }

                $urlParam = array(
                    'service' => 'marry',
                    'template' => 'planmeal-detail',
                    'id' => $id,
                    'type' => 10
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'host10', $id, 'update', '修改婚车('.$title.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'更新了婚车信息id: '.$id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "weddingcar",$param);

                // 清除缓存
                clearCache("marry_weddingcar_detail", $id);
                checkCache("marry_weddingcar_list", $id);
                clearCache("marry_weddingcar_total", 'key');

                return $langData['marry'][5][17];//修改成功！
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`,l.`title`, l.`pics`, s.`userid` FROM `#@__marry_weddingcar` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){
                    // 清除缓存
                    clearCache("marry_weddingcar_detail", $id);
                    checkCache("marry_weddingcar_list", $id);
                    clearCache("marry_weddingcar_total", 'key');

                    delPicFile($results['pics'], "delAtlas", "marry");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_weddingcar` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
                
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'host10', $id, 'delete', '删除婚车('.$results['title'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }
    }

    /**
     * 婚车列表
     * @return array
     */
    public function rentalList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $typeid   = $this->param['typeid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addrid'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }

        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "marry_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `price`, `duration`, `kilometre`, `click`, `pubdate`, `state` FROM `#@__marry_weddingcar` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_weddingcar` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_weddingcar_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_weddingcar_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['pics']      = $val['pics'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['duration']  = $val['duration'];
                $list[$key]['kilometre'] = $val['kilometre'];

                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';

                $param = array(
                    "service" => "marry",
                    "template" => "rental-detail",
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
     * 婚车详细
     * @return array
     */
    public function rentalDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `price`, `pics`, `kilometre`, `duration`, `click`, `pubdate`, `state` FROM `#@__marry_weddingcar` WHERE `id` = ".$id.$where);
        $results  = getCache("marry_weddingcar_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["title"]       = $results[0]['title'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail['price']       = $results[0]['price'];
            $storeDetail["pics"]        = $results[0]['pics'];
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];
            $storeDetail["duration"]    = $results[0]['duration'];
            $storeDetail["kilometre"]   = $results[0]['kilometre'];

            // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marrycommon` WHERE `aid` = ".$results[0]['id']." AND `type` = 1 AND `ischeck` = 1 AND `floor` = 0");
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'marry-rental' AND `aid` = '$id' AND `pid` = 0");
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            $storeDetail['common'] = $totalCount;

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

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

            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "marry",
                "temp"   => "rental-detail",
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
     * 操作案例
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operPlancase(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;

        require(HUONIAOINC."/config/marry.inc.php");
        $custommarryplancaseCheck = (int)$custommarryplancaseCheck;

        $userid      = $userLogin->getMemberID();
        $userinfo    = $userLogin->getMemberInfo();
        if($userid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param           =  $this->param;

        $id              =  $param['id'];
        $oper            =  $param['oper'];
        $title           =  filterSensitiveWords(addslashes($param['title']));
        $holdingtime     =  GetMkTime($param['holdingtime']);
        $pics            =  $param['pics'];
        $typeid            =  $param['typeid'];
        $hoteltitle      =  $param['hoteltitle'];
        $pubdate         =  GetMkTime(time());

        $userinfo = $userLogin->getMemberInfo();
        if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if($oper == 'add' || $oper == 'update'){
            if(empty($title)) return array("state" => 200, "info" => $langData['marry'][4][16]);//请输入标题！
//			if(empty($hoteltitle)) return array("state" => 200, "info" => $langData['marry'][4][31]);//请输入酒店名称！
            if(empty($pics)) return array("state" => 200, "info" => $langData['marry'][4][18]);//请至少上传一张图片！
        }elseif($oper == 'del'){
            if(!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];

        if($oper == 'add'){
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__marry_plancase` (`title`, `userid`, `company`, `pics`, `holdingtime`, `hoteltitle`, `pubdate`, `state`,`typeid`) VALUES ('$title', '$userid', '$company', '$pics', '$holdingtime', '$hoteltitle', '$pubdate', '$custommarryplancaseCheck','$typeid')");
            $aid = $dsql->dsqlOper($archives, "lastid");
            if(is_numeric($aid)){
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'plancase', $aid, 'insert', '添加案例('.$typeid.'=>'.$title.')', '', $archives);

                if($custommarryplancaseCheck){
                    updateCache("marry_plancase_list", 300);
                    clearCache("marry_plancase_total", 'key');
                }
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'新增操作案例: '.$title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "plancase",$param);
                return $aid;
            }else{
                return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！
            }
        }elseif($oper == 'update'){
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_plancase` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                //保存到主表
                $archives = $dsql->SetQuery("UPDATE `#@__marry_plancase` SET `title` = '$title', `userid` = '$userid', `company` = '$company', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `state` = '$custommarryplancaseCheck',`typeid` = '$typeid' WHERE `id` = ".$id);
                $results = $dsql->dsqlOper($archives, "update");
                if($results != "ok"){
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'plancase', $id, 'update', '修改案例('.$typeid.'=>'.$title.')', '', $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type' 	 => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——marry模块——用户:'.$userinfo['username'].'更新操作案例id: '.$id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "plancase",$param);

                // 清除缓存
                clearCache("marry_plancase_detail", $id);
                checkCache("marry_plancase_list", $id);
                clearCache("marry_plancase_total", 'key');

                return $langData['marry'][5][17];//修改成功！
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }elseif($oper == 'del'){
            $archives = $dsql->SetQuery("SELECT l.`id`,l.`title`,l.`typeid`, l.`pics`, s.`userid` FROM `#@__marry_plancase` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = ".$id);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $results = $results[0];
                if($results['userid'] == $userid){
                    // 清除缓存
                    clearCache("marry_plancase_detail", $id);
                    checkCache("marry_plancase_list", $id);
                    clearCache("marry_plancase_total", 'key');

                    delPicFile($results['pics'], "delAtlas", "marry");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_plancase` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'plancase', $id, 'delete', '删除案例('.$results['typeid'].'=>'.$results['title'].')', '', $archives);

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            }else{
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }
    }

    /**
     * 案例列表
     * @return array
     */
    public function plancaseList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = (int)($this->param['detailid'] ? $this->param['detailid'] : $this->param['store']);
                $state    = (int)$this->param['state'];
                $typeid   = (int)$this->param['typeid'];
                $u        = (int)$this->param['u'];
                $addrid   = (int)$this->param['addrid'];
                $orderby  = (int)$this->param['orderby'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $type = (int)$this->param['stypeid'];
                $type = $type ?: $typeid;
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }

        if($store){
            $where .= " AND `company` = '$store'";
        }

        if ($type)
        {
            $where .=" AND `typeid` = '$type'";
        }

        // if(!empty($typeid)){
        //     if($dsql->getTypeList($typeid, "marry_type")){
        //         $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
        //         $lower = $typeid.",".join(',',$lower);
        //     }else{
        //         $lower = $typeid;
        //     }

        //     $sidArr = array();
        //     $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
        //     $results = $dsql->dsqlOper($archives, "results");
        //     if(is_array($results)){
        //         foreach ($results as $key => $value) {
        //             $sidArr[$key] = $value['id'];
        //         }
        //         if(!empty($sidArr)){
        //             $where .= " AND `company` in (".join(",",$sidArr).")";
        //         }else{
        //             $where .= " AND 1 = 2";
        //         }
        //     }else{
        //         $where .= " AND 1 = 2";
        //     }
        // }

        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower = $addrid.",".join(',',$lower);
            }else{
                $lower = $addrid;
            }
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `state` FROM `#@__marry_plancase` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_plancase` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_plancase_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_plancase_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['hoteltitle']= $val['hoteltitle'];
                $list[$key]['pics']      = $val['pics'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['holdingtime']= $val['holdingtime'];
                $list[$key]['holdingtimeSource']= $val['holdingtime'] ? date("Y-m-d", $val['holdingtime']) : '';
                $list[$key]['holdingtimeSource1']= $val['holdingtime'] ? date("m月d日", $val['holdingtime']) : '';
                $pics = $val['pics'];
                $userSql = $dsql->SetQuery("SELECT `userid`FROM `#@__marry_store` WHERE `id` = " . $val['company']);
                $userResult = $dsql->dsqlOper($userSql, "results");
//                $list[$key]['store']['userid'] = $userResult[0]['userid'];

                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';

                $param = array(
                    "service" => "marry",
                    "template" => "store-detail",
                    "id" => $val['company']
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
     * 案例详细
     * @return array
     */
    public function plancaseDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }

        //$where = " AND `state` = 1";

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `holdingtime`, `pics`, `hoteltitle`, `click`, `pubdate`, `state` FROM `#@__marry_plancase` WHERE `id` = ".$id.$where);
        $results  = getCache("marry_plancase_detail", $archives, 0, $id);
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["title"]       = $results[0]['title'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail["pics"]        = $results[0]['pics'];
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];
            $storeDetail["holdingtime"] = $results[0]['holdingtime'];
            $storeDetail["holdingtimeSource"] = $results[0]['holdingtime'] ? date("Y-m-d", $results[0]['holdingtime']) : '';
            $storeDetail["hoteltitle"]  = $results[0]['hoteltitle'];

            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;

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

            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);

            //验证是否已经收藏
            $params = array(
                "module" => "marry",
                "temp"   => "plancase-detail",
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
     * 操作套餐
     * oper=add: 增加
     * oper=del: 删除
     * oper=update: 更新
     * @return array
     */
    public function operPlanmeal()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        require(HUONIAOINC . "/config/marry.inc.php");
        $custommarryplanmealCheck = (int)$custommarryplanmealCheck;

        $userid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        $param = $this->param;
        $id = $param['id'];
        $oper = $param['oper'];
        $title = filterSensitiveWords(addslashes($param['title']));
        $price = (float)$param['price'];
        $pics = $param['pics'];
        $typeid = $param['typeid'] ? $param['typeid'] : 0;
        if (isset($param['tag'])) {
            $tag = $param['tag'];
            $tag = is_array($tag) ? join("|", $tag) : $tag;
        }
        $pubdate = GetMkTime(time());
        $userinfo = $userLogin->getMemberInfo();
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))) {
            return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败！
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `typeid`, `state` FROM `#@__marry_store` WHERE `userid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array("state" => 200, "info" => $langData['marry'][5][13]);//您还未开通婚嫁公司！
        }

        if ($userResult[0]['state'] == 0) {
            return array("state" => 200, "info" => $langData['marry'][5][14]);//您的公司信息还在审核中，请通过审核后再发布！
        }

        if ($userResult[0]['state'] == 2) {
            return array("state" => 200, "info" => $langData['marry'][5][15]);//您的公司信息审核失败，请通过审核后再发布！
        }

        if ($oper == 'add' || $oper == 'update') {
            if (empty($title)) return array("state" => 200, "info" => $langData['marry'][4][16]);//请输入标题！
            if (empty($price)) return array("state" => 200, "info" => $langData['marry'][4][14]);//请输入价格！
            if (empty($pics)) return array("state" => 200, "info" => $langData['marry'][4][18]);//请至少上传一张图片！
        } elseif ($oper == 'del') {
            if (!is_numeric($id)) return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误！
        }

        $company = $userResult[0]['id'];
        if ($oper == 'add') {
            //保存到主表
            //婚纱摄影
            if ($typeid == 1) {
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`xn_clothing`,`xl_clothing`,`clothing`,`hairstyle`,`shot`,`interior`,`location`,`psday`,`psnumber`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`judge`,`pd`,`explain`,`explain_one`,`buynotice`,`note`,`xcexplain`,`xkexplain`,`tel`) VALUES ('$title','$userid','$company', '$pics', '$tag', '$typeid', '$price', '$param[click]', '$pubdate', '$param[weight]', '1','21','$param[style_1]','$param[classification_1]','$param[characteristicservice_1]','$param[video]','$param[xn_clothing_1]','$param[xl_clothing_1]','$param[clothing]','$param[hairstyle]','$param[shot]','$param[interior]','$param[location]','$param[psday]','$param[psnumber_1]','$param[jxnumber_1]','$param[rcnumber_1]','$param[xcnumber_1]','$param[xknumber_1]','$param[dresser_1]','$param[judge_1]','$param[pd_1]','$param[explain_1]','$param[explain_one_1]','$param[buynotice]','$param[note]','$param[xcexplain]','$param[xkexplain]','$param[tel]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            } elseif ($typeid == 2) {
                //保存到表
                //摄影跟拍
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`sy_team`,`explain`,`explain_one`,`explain_two`,`buynotice`,`note`,`tel`,`psnumber`,`jxnumber`) VALUES ('$title', '$userid','$company', '$pics', '$tag', '$typeid', '$price', '$param[click]','$pubdate','$param[weight]', '1','78','$param[style_2]','$param[classification_2]','$param[characteristicservice_2]','$param[video]','$param[sy_team_2]','$param[explain_2]','$param[explain_one_2]','$param[explain_two_2]','$param[buynotice]','$param[note]','$param[tel]','$param[psnumber_2]','$param[jxnumber_2]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            } elseif ($typeid == 3) {
                //保存到表
                //珠宝首饰
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`buynotice`,`note`,`tel`,`sy_team`,`sy_mv`,`judge`) VALUES ('$title','$userid','$company', '$pics', '$tag', '$typeid','$price', '$param[click]', '$pubdate', '$param[weight]', '1','68','$param[style_3]','$param[classification_3]','$param[characteristicservice_3]','$param[video]','$param[buynotice]','$param[note]','$param[tel]','$param[sy_team_3]','$param[sy_mv_3]','$param[judge_3]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            } elseif ($typeid == 4) {
                //摄像跟拍
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`sy_team`,`sy_videotape`,`sy_mv`,`explain`,`explain_one`,`explain_two`,`buynotice`,`note`,`tel`) VALUES ('$title', '$userid','$company', '$pics', '$tag', '$typeid', '$price', '$param[click]', '$pubdate', '$param[weight]', '1','57','$param[style_4]','$param[classification_4]','$param[characteristicservice_4]','$param[video]','$param[sy_team_4]','$param[sy_videotape_4]','$param[sy_mv_4]','$param[explain_4]','$param[explain_one_4]','$param[explain_two_4]','$param[buynotice]','$param[note]','$param[tel]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            } elseif ($typeid == 5) {
                //新娘跟妆
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`, `company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`pd`,`explain`,`explain_one`,`buynotice`,`note`,`tel`,`sy_team`,`explain_two`) VALUES ('$title', '$userid','$company', '$pics', '$tag', '$typeid', '$price', '$param[click]', '$pubdate', '$param[weight]', '1','85','$param[style_5]','$param[classification_5]','$param[characteristicservice_5]','$param[video]','$param[jxnumber_5]','$param[rcnumber_5]','$param[xcnumber_5]','$param[xknumber_5]','$param[dresser_5]','$param[pd_5]','$param[explain_5]','$param[explain_one_5]','$param[buynotice_5]','$param[note]','$param[tel]','$param[sy_team_5]','$param[explain_two_5]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            } elseif ($typeid == 6) {
                //婚纱礼服
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`, `company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`xn_clothing`,`rcnumber`,`xl_clothing`,`dresser`,`pd`,`explain`,`buynotice`,`note`,`tel`,`clothing`) VALUES ('$title','$userid','$company', '$pics', '$tag', '$typeid', '$price', '$param[click]', '$pubdate', '$param[weight]', '1','87','$param[style_6]','$param[classification_6]','$param[characteristicservice_6]','$param[video]','$param[xn_clothing_6]','$param[rcnumber_6]','$param[xl_clothing_6]','$param[dresser_6]','$param[pd_6]','$param[explain_6]','$param[buynotice]','$param[note]','$param[tel]','$param[clothing_6]')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            }else{
                $type = 9;
                $archives = $dsql->SetQuery("INSERT INTO `#@__marry_planmeal` (`title`,`userid`,`company`, `pics`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`, `characteristicservice`,`video`,`explain`,`explain_one`,`explain_two`,`dance`,`buynotice`,`planner`,`supervisor`,`host`,`photographer`,`cameraman`,`tel`,`colour`,`price`,`tag`,`type`) VALUES ('$title','$userid', '$company', '$pics', '$param[click]', '$pubdate', '$param[weight]', '1','93','$param[style_9]','$param[classification_9]','$param[characteristicservice_9]','$param[video]','$param[explain_9]','$param[explain_one_9]','$param[explain_two_9]','$param[dance]','$param[buynotice]','$param[planner_9]','$param[supervisor_9]','$param[host_9]','$param[photographer_9]','$param[cameraman_9]','$param[tel]','$param[colour_9]','$price','$tag','$type')");
                $aid = $dsql->dsqlOper($archives, "lastid");
            }

            if (is_numeric($aid)) {
            
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'planmeal', $aid, 'insert', '添加套餐('.$typeid.'=>'.$title.')', '', $archives);

                    dataAsync("marry",$aid,"weddingphoto");  // 新增婚嫁套餐
                    dataAsync("marry",$aid,"weddingggraphy");
                    dataAsync("marry",$aid,"weddinggjewelry");
                    dataAsync("marry",$aid,"weddingplan");
                    dataAsync("marry",$aid,"weddingpo");
                    dataAsync("marry",$aid,"weddingmakeup");
                    dataAsync("marry",$aid,"weddingdress");
                    //微信通知
                    $cityName = $siteCityInfo['name'];
                    $cityid = $siteCityInfo['cityid'];
                    $param = array(
                        'type' => '', //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => $cityid,
                        'notify' => '管理员消息通知',
                        'fields' => array(
                            'contentrn' => $cityName . '分站——marry模块——用户:' . $userinfo['username'] . '新增套餐: ' . $title,
                            'date' => date("Y-m-d H:i:s", time()),
                        )
                    );
                    updateAdminNotice("marry", "plancase", $param);

                    return $aid;
                } else {
                    return array("state" => 101, "info" => $langData['marry']['5']['16']);//发布到数据时发生错误，请检查字段内容！

            }
        } elseif ($oper == 'update') {
            $archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = " . $id);
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                //保存到主表
                if ($typeid == 1) {
                    //保存到表  婚纱摄影
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' ,`company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_1]',`classification` = '$param[classification_1]',`characteristicservice` = '$param[characteristicservice_1]',`video` = '$param[video]',`xn_clothing` = '$param[xn_clothing_1]',`xl_clothing` = '$param[xl_clothing_1]',`clothing` = '$param[clothing]',`hairstyle` = '$param[hairstyle]',`shot` = '$param[shot]',`interior` = '$param[interior]',`location` = '$param[location]',`psday` = '$param[psday]',`psnumber` = '$param[psnumber_1]',`jxnumber` = '$param[jxnumber_1]',`rcnumber` = '$param[rcnumber_1]',`xcnumber` = '$param[xcnumber_1]',`xknumber` = '$param[xknumber_1]',`dresser` = '$param[dresser_1]',`judge` = '$param[judge_1]',`pd` = '$param[pd_1]',`explain` = '$param[explain_1]',`explain_one` = '$param[explain_one_1]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`xcexplain` = '$param[xcexplain]',`xkexplain` = '$param[xkexplain]',`tel` = '$param[tel]',`pubdate` = '$pubdate' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }elseif ($typeid == 2 ){
                    //摄影跟拍
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_2]',`classification` = '$param[classification_2]',`characteristicservice` = '$param[characteristicservice_2]',`video` = '$param[video]',`sy_team` = '$param[sy_team_2]',`explain` = '$param[explain_2]',`explain_one` = '$param[explain_one_2]',`explain_two` = '$param[explain_two_2]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`tel` = '$param[tel]',`psnumber` = '$param[psnumber_2]',`jxnumber` = '$param[jxnumber_2]' ,`pubdate` = '$pubdate' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }elseif( $typeid == 3){
                    //珠宝首饰
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_3]',`classification` = '$param[classification_3]',`characteristicservice` = '$param[characteristicservice_3]',`video` = '$param[video]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`tel` = '$param[tel]',`sy_team` = '$param[sy_team_3]',`sy_mv` = '$param[sy_mv_3]',`judge` = '$param[judge_3]' ,`pubdate` = '$pubdate'  WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }elseif ( $typeid == 4){
                    //摄像跟拍
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_4]',`classification` = '$param[classification_4]',`characteristicservice` = '$param[characteristicservice_4]',`video` = '$param[video]',`sy_team` = '$param[sy_team_4]',`sy_videotape` = '$param[sy_videotape_4]',`sy_mv` = '$param[sy_mv_4]',`explain` = '$param[explain_4]',`explain_one` = '$param[explain_one_4]',`explain_two` = '$param[explain_two_4]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`tel` = '$param[tel]' ,`pubdate` = '$pubdate' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }elseif ( $typeid == 5){
                    //新娘跟妆
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_5]',`classification` = '$param[classification_5]',`characteristicservice` = '$param[characteristicservice_5]',`video` = '$param[video]',`jxnumber` = '$param[jxnumber_5]',`rcnumber` = '$param[rcnumber_5]',`xcnumber` = '$param[xcnumber_5]',`xknumber` = '$param[xknumber_5]',`dresser` = '$param[dresser_5]',`pd` = '$param[pd_5]',`sy_team` = '$param[sy_team_5]',`explain` = '$param[explain_5]',`explain_one` = '$param[explain_one_5]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`tel` = '$param[tel]',`explain_two` = '$param[explain_two_5]',`pubdate` = '$pubdate' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }elseif( $typeid == 6 ){
                    //婚纱礼服
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_6]',`classification` = '$param[classification_6]',`characteristicservice` = '$param[characteristicservice_6]',`video` = '$param[video]',`xn_clothing` = '$param[xn_clothing_6]',`xl_clothing` = '$param[xl_clothing_6]',`rcnumber` = '$param[rcnumber_6]',`dresser` = '$param[dresser_6]',`pd` = '$param[pd_6]',`explain` = '$param[explain_6]',`buynotice` = '$param[buynotice]',`note` = '$param[note]',`tel` = '$param[tel]',`clothing` = '$param[clothing_6]' ,`pubdate` = '$pubdate'  WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }else{
                    $typeid = 9;
                    $archives = $dsql->SetQuery("UPDATE `#@__marry_planmeal` SET `title` = '$title',`userid` = '$userid' , `company` = '$company', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid',`click` = '$param[click]', `weight` = '$param[weight]', `state` = '1',`planmealstyle` = '$typeid',`style` = '$param[style_9]',`classification` = '$param[classification_9]',`characteristicservice` = '$param[characteristicservice_9]',`video` = '$param[video]',`explain` = '$param[explain_9]',`explain_one` = '$param[explain_one_9]',`buynotice` = '$param[buynotice]',`explain_two` = '$param[explain_two_9]',`dance` = '$param[dance_9]',`planner` ='$param[planner_9]',`supervisor`='$param[supervisor_9]',`host`='$param[host_9]',`photographer` = '$param[photographer_9]',`cameraman` = '$param[cameraman_9]',`colour` = '$param[colour_9]',`note` = '$param[note]',`tel` = '$param[tel]',`pubdate` = '$pubdate' WHERE `id` = " . $id);
                    $results = $dsql->dsqlOper($archives, "update");
                }
                if ($results != "ok") {
                    return array("state" => 200, "info" => $langData['marry']['5']['18']); //保存到数据时发生错误，请检查字段内容！
                }
            
                //记录用户行为日志
                memberLog($userid, 'marry', 'planmeal', $id, 'update', '修改套餐('.$typeid.'=>'.$title.')', '', $archives);

                dataAsync("marry",$id,"weddingphoto");  // 修改婚嫁套餐
                dataAsync("marry",$id,"weddingggraphy");
                dataAsync("marry",$id,"weddinggjewelry");
                dataAsync("marry",$id,"weddingplan");
                dataAsync("marry",$id,"weddingpo");
                dataAsync("marry",$id,"weddingmakeup");
                dataAsync("marry",$id,"weddingdress");
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid = $siteCityInfo['cityid'];
                $param = array(
                    'type' => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . '分站——marry模块——用户:' . $userinfo['username'] . '更新了套餐信息id: ' . $id,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("marry", "plancase", $param);

                // 清除缓存
                clearCache("marry_planmeal_detail", $id);
                checkCache("marry_planmeal_list", $id);
                clearCache("marry_planmeal_total", 'key');

                return $langData['marry'][5][17];//修改成功！
            } else {
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }

        } elseif ($oper == 'del') {
            $archives = $dsql->SetQuery("SELECT l.`id`, l.`type`, l.`title`, l.`pics`, s.`userid` FROM `#@__marry_planmeal` l LEFT JOIN `#@__marry_store` s ON s.`id` = l.`company` WHERE l.`id` = " . $id);

            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $results = $results[0];
                if ($results['userid'] == $userid) {
                    // 清除缓存
                    clearCache("marry_planmeal_detail", $id);
                    checkCache("marry_planmeal_list", $id);
                    clearCache("marry_planmeal_total", 'key');

                    delPicFile($results['pics'], "delAtlas", "marry");

                    //删除表
                    $archives = $dsql->SetQuery("DELETE FROM `#@__marry_planmeal` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");
            
                    //记录用户行为日志
                    memberLog($userid, 'marry', 'planmeal', $id, 'delete', '删除套餐('.$results['typeid'].'=>'.$results['title'].')', '', $archives);

                    dataAsync("marry",$id,"weddingphoto");  // 删除婚嫁套餐
                    dataAsync("marry",$id,"weddingggraphy");
                    dataAsync("marry",$id,"weddinggjewelry");
                    dataAsync("marry",$id,"weddingplan");
                    dataAsync("marry",$id,"weddingpo");
                    dataAsync("marry",$id,"weddingmakeup");
                    dataAsync("marry",$id,"weddingdress");

                    return array("state" => 100, "info" => $langData['marry'][5][19]);//删除成功！
                } else {
                    return array("state" => 101, "info" => $langData['marry'][5][20]);//权限不足，请确认帐户信息后再进行操作！
                }
            } else {
                return array("state" => 101, "info" => $langData['marry'][5][21]);//信息不存在，或已经删除！
            }
        }


    }

    /**
     * 套餐列表
     * @return array
     */
    public function planmealList()
    {
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            } else {
                $search = $this->param['search'];
                $store = $this->param['detailid'];
                $keywords = $this->param['keywords'];
                $state = $this->param['state'];
                $typeid  = (int)$this->param['typeid'];
                $type = (int)$this->param['type'];
                $type = $type ?: $typeid;
//                $type = $type ? (int)$type : 0;
                $ptype = (int)$this->param['ptype'] ? (int)$this->param['ptype'] : 0;  //摄影跟拍类型
                $photostyle = (int)$this->param['photostyle'] ? (int)$this->param['photostyle'] : 0;  //摄影跟拍风格
                $istype = (int)$this->param['istype'];
                $businessid = (int)$this->param['businessid'];
                $u = $this->param['u'];
                $addrid = $this->param['addr'];
                $orderby = $this->param['orderby'];
                $page = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $price = trim($this->param['price'], ',');
                $pstyle = (int)$this->param['pstyle'] ? (int)$this->param['pstyle'] : 0;   //婚纱摄影风格
                $scene = (int)$this->param['scene'] ? (int)$this->param['scene'] : 0;     //婚纱摄影场景
                $material = (int)$this->param['material'] ? (int)$this->param['material'] : 0; //  珠宝材质
                $jewelry = (int)$this->param['jewelry'] ? (int)$this->param['jewelry'] : 0;  // 珠宝 类型
                $video = (int)$this->param['video'] ? (int)$this->param['video'] : 0;   //摄像跟拍类型
                $vstyle = (int)$this->param['vstyle'] ? (int)$this->param['vstyle'] : 0;//    摄像跟拍风格
                $makeup = (int)$this->param['makeup'] ? (int)$this->param['makeup'] : 0; //新娘跟妆风格
                $wedding = (int)$this->param['wedding'] ? (int)$this->param['wedding'] : 0; //婚纱礼服风格
                $classification = (int)$this->param['classification'] ? (int)$this->param['classification'] : 0; //婚礼类别
                $color       = (int)$this->param['color'];              //婚礼策划 ,颜色
                $style      = (int)$this->param['style'];              //婚礼策划 ,风格
            }
        }


        $uid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if ($u != 1) {
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC . "/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
                    $results = $dsql->dsqlOper($archives, "results");
                    if (is_array($results)) {
                        foreach ($results as $key => $value) {
                            $sidArr[$key] = $value['id'];
                        }
                        if (!empty($sidArr)) {
                            $where .= " AND `company` in (" . join(",", $sidArr) . ")";
                        } else {
                            $where .= " AND 0 = 1";
                        }
                    } else {
                        $where .= " AND 0 = 1";
                    }
                }
            }
        } else {
            if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))) {
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if ($storeRes) {
                $where .= " AND `company` = " . $storeRes[0]['id'];
            } else {
                $where .= " AND 1 = 2";
            }

            if ($state != '') {
                $where .= " AND `state` = " . $state;
            }
        }
        if ($price) {
            $priceArr = explode(',', $price);
             $countPrice = count($priceArr);
            if ($countPrice > 1) {
                $pricelow = sprintf("%.2f", $priceArr[0]);
                $priceheight = sprintf("%.2f", $priceArr[1]);
                $where .= " AND  `price` between $pricelow AND $priceheight";
            }
            if ($countPrice == 1 && $priceArr[0] == 2000) {
                $where .= " AND `price` <= '$price'";
            }
            if ($countPrice == 1 && $priceArr[0] == 5000) {
                $where .= " AND `price` >= '$price'";
            }
        }
        if ($color){
            $where .= " AND `colour` = '$color' ";
        }

        if ($style){
            $where .= " AND `style` = '$style' ";

        }

        if ($ptype) {
            $where .= " AND `style` = '$ptype' ";
        }
        if ($photostyle) {
            $where .= " AND `classification` = '$photostyle'";
        }

        if ($type) {
            $where .= " AND `type` = '$type'";
        }

        if ($classification) {
            $where .= "AND `classification` ='$classification'";
        }
        if ($store) {
            $where .= "AND `company` ='$store'";
        }

        if ($pstyle) {
            $where .= " AND `style` = $pstyle";
        }
        if ($scene) {
            $where .= " AND `classification` =$scene";
        }
        if ($material) {
            $where .= " AND `style` = $material";
        }
        if ($jewelry) {
            $where .= " AND `classification` = $jewelry";
        }
        if ($video) {
            $where .= " AND `style` = $video";
        }
        if ($vstyle) {
            $where .= " AND `classification` = $vstyle";
        }
        if ($makeup) {
            $where .= " AND `style` = $makeup";
        }
        if ($wedding) {
            $where .= " AND `style` = $wedding ";
        }

        //typeid用来筛选套餐类别
        // if (!empty($typeid)) {
        //     if ($dsql->getTypeList($typeid, "marry_type")) {
        //         $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
        //         $lower = $typeid . "," . join(',', $lower);
        //     } else {
        //         $lower = $typeid;
        //     }

        //     $sidArr = array();
        //     $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
        //     $results = $dsql->dsqlOper($archives, "results");
        //     if (is_array($results)) {
        //         foreach ($results as $key => $value) {
        //             $sidArr[$key] = $value['id'];
        //         }
        //         if (!empty($sidArr)) {
        //             $where .= " AND `company` in (" . join(",", $sidArr) . ")";
        //         } else {
        //             $where .= " AND 1 = 2";
        //         }
        //     } else {
        //         $where .= " AND 1 = 2";
        //     }
        // }

        if (!empty($addrid)) {
            if ($dsql->getTypeList($addrid, "site_area")) {
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $lower = $addrid . "," . join(',', $lower);
            } else {
                $lower = $addrid;
            }
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
            $results = $dsql->dsqlOper($archives, "results");
            if (is_array($results)) {
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }
                if (!empty($sidArr)) {
                    $where .= " AND `company` in (" . join(",", $sidArr) . ")";
                } else {
                    $where .= " AND 1 = 2";
                }
            } else {
                $where .= " AND 1 = 2";
            }
        }

        $_where = $where;
        if (!empty($search)) {

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if (!empty($sidArr)) {
                $where .= " AND (`title` like '%$search%' OR `company` in (" . join(",", $sidArr) . "))";
                $_where .= " AND (`hostname` like '%$search%' OR `company` in (" . join(",", $sidArr) . "))";
            } else {
                $where .= " AND `title` like '%$search%'";
                $_where .= " AND `hostname` like '%$search%'";
            }
        }
        if ($keywords) {
            $where .= " AND `title` like '%$keywords%'";
            $_where .= " AND `hostname` like '%$keywords%'";
        }
        //排序
        switch ($orderby) {
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
            //价格最高
            case 5:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
                break;
            //价格最低
            case 6:
                $orderby_ = " ORDER BY `price` , `weight` , `id` ";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page = empty($page) ? 1 : $page;



        // if ($type == 7) {
        //     $archives = $dsql->SetQuery("SELECT `id`,`company`,`hostname`as `title`,`photo` as `pics`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_host` WHERE 1 =1" . $where);
        // }elseif ($type == 10){
        //     $archives = $dsql->SetQuery("SELECT `id`,`company`,`title`,`pics`,`price`,`pubdate`,`type`,`planmealtype`FROM `#@__marry_weddingcar` WHERE 1 =1" . $where);
        // }else{
        //     $archives = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `pics`, `tag`, `price`, `type`, `click`, `pubdate`, `state`,`classification`,`style`,`video`FROM `#@__marry_planmeal` WHERE 1 = 1" . $where);
        // }
        // if ($type == 7){
        //     $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_host` WHERE 1 = 1".$where);

        // }elseif ($type == 10){
        //     $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_weddingcar` WHERE 1 = 1".$where);

        // }else{
        //     //总条数
        //     $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_planmeal` WHERE 1 = 1".$where);
        // }
        //





        if($type != 9 && !$scene){
            $archives = $dsql->SetQuery("SELECT `id`, `company`,`title`, `pics`, `price`, `type`,`click`,`pubdate`,`weight`,`state`,`style`  FROM `#@__marry_planmeal` WHERE 1 = 1".$where." UNION ALL SELECT `id`,`company`,`title`,`pics`,`price`,`type`,`click`,`pubdate`,`weight`,`state`,`style` FROM `#@__marry_weddingcar` WHERE 1 = 1".$where." UNION ALL SELECT `id`,`company`,`hostname` title,`photo` pics,`price`,`type`,`click`,`pubdate`,`weight`,`state`,`style` FROM `#@__marry_host` WHERE 1 = 1".$_where);

            $arc = $dsql->SetQuery("SELECT `id`  FROM `#@__marry_planmeal` WHERE 1 = 1".$where." UNION ALL SELECT `id`  FROM `#@__marry_weddingcar` WHERE 1 = 1".$where." UNION ALL SELECT `id`  FROM `#@__marry_host` WHERE 1 = 1".$_where);
        }else{
            $archives = $dsql->SetQuery("SELECT `id`, `company`,`title`, `pics`, `price`, `type`,`click`,`pubdate`,`weight`,`state`,`style`  FROM `#@__marry_planmeal` WHERE 1 = 1".$where);

            $arc = $dsql->SetQuery("SELECT `id`  FROM `#@__marry_planmeal` WHERE 1 = 1".$where);
        }


        //总条数
        $totalCount = $dsql->dsqlOper($arc, "totalCount");
        
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
            $totalGray = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

            $pageinfo['gray'] = $totalGray;
            $pageinfo['audit'] = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
        }
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
            $results = getCache("marry_planmeal_list", $sql, 300, array("disabled" => $u));
        if($results && is_array($results)){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]['pics']      = $val['pics'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['type']     = $val['type'];
                if (!empty($val['style'])){

                    $list[$key]['stylename']     = $this->getmarryItem($val['style']);
                }
            if (is_array($results)){
                $list[$key]['countTitle']   = count($results);
            }
                if ($val['classification']){
                    $list[$key]['classificationname']  = $this->getmarryItem($val['classification']);
                }
                $store = $dsql->SetQuery("SELECT `id`, `bind_module`, `price`, `taoxi`, `anli`, `title`, `config`,`pubdate`, `pics`, `lat`, `lng`, `id`,`userid`, `typeid`, `address`, `tel`, `tag`, `addrid`, `rec` FROM `#@__marry_store` WHERE id= '$val[company]'");

                $sql = $dsql->SetQuery($store);
                $storelist = getCache("marry_store_list", $sql, 300, array("disabled" => $u));
                foreach ($storelist as $v){
                    $list[$key]['store']['userid'] =$v['userid'];
                    $list[$key]['companyname'] = $v['title'];
                    $list[$key]['address'] = $v['address'];
                    if(!empty($v['addrid'])){
                        $addrName = getParentArr("site_area", $v['addrid']);
                        global $data;
                        $data = "";
                        $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                        $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                        $v['addrname']  = $addrArr;
                        if ($v['config']) {
                            $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` in (".$v['config'].")");
                            $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));

                            $arrconfig= array();
                            foreach ($configArr as $k => $v) {
                                $arrconfig[$k] = array(
                                    "jc" => $v['typename'],
                                    "py" =>  GetPinyin($v['typename'])
                                );
                            }
                            $list[$key]['configName'] = $arrconfig;
                        }


                        $list[$key]['addrname'] = $addrArr;
                    }else{
                        $v['addrname'] = "";
                    }
                }
                if ($list[$key]['type'] == 0 ){
                    $list[$key]["typename"] = '';
                }else{
                    $bind_modulename = $this->gettypename("module_type", $val['type']);
                    $list[$key]["typename"] = $bind_modulename;
                }

                $tagArr = array();
                if(!empty($val['tag'])){
                    $tag = explode("|", $val['tag']);
                    foreach ($tag as $k => $v) {
                        $tagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['tagAll'] = $tagArr;
                $list[$key]['fenlei'] = $this->getitemMarry();
                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';

                $param = array(
                    "service" => "marry",
                    "template" => "planmeal-detail",
                    "id" => $val['id'],
                    "typeid" => $list[$key]['type'] ,
                    "istype" => $istype,
                    "businessid" => $businessid
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
//                $list[$key]['store'] = $store;
//
            }

        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 获取分类
     */
    public  function getitemMarry(){

        global $dsql;
        $arr = array();

        //婚纱摄影套餐类型
        $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
        $results = $dsql->dsqlOper($archives, "results");
        $list = array(0 => '请选择');
        foreach($results as $value){
            $list[$value['id']] = $value['typename'];
        }
        array_push($arr,$list);
        //摄像跟拍类型
        $sx_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 58 ORDER BY `weight` ASC");
        $sx_results = $dsql->dsqlOper($sx_archives, "results");
        $sx_list = array(0 => '请选择');
        foreach($sx_results as $value){
            $sx_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$sx_list);
        //摄像跟拍风格
        $sxfg_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 61 ORDER BY `weight` ASC");
        $sxfg_archives_results = $dsql->dsqlOper($sxfg_archives, "results");
        $sxfg_archives_list = array(0 => '请选择');
        foreach($sxfg_archives_results as $value){
            $sxfg_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$sxfg_archives_list);
        //租婚车类型
        $hc_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 12 ORDER BY `weight` ASC");
        $hc_archives_results = $dsql->dsqlOper($hc_archives, "results");
        $hc_archives_list = array(0 => '请选择');
        foreach($hc_archives_results as $value){
            $hc_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$hc_archives_list);
        //婚纱摄影-场景
        $cj_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 25 ORDER BY `weight` ASC");
        $cj_results = $dsql->dsqlOper($cj_archives, "results");
        $cj_archives_list = array(0 => '请选择');
        foreach($cj_results as $value){
            $cj_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$cj_archives_list);
        //摄影跟拍-类型
        $gp_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 79 ORDER BY `weight` ASC");
        $gp_results = $dsql->dsqlOper($gp_archives, "results");
        $gp_archives_list = array(0 => '请选择');
        foreach($gp_results as $value){
            $gp_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$gp_archives_list);
        //摄影跟拍-风格
        $gpfg_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 81 ORDER BY `weight` ASC");
        $gpfg_results = $dsql->dsqlOper($gpfg_archives, "results");
        $gpfg_archives_list = array(0 => '请选择');
        foreach($gpfg_results as $value){
            $gpfg_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$gpfg_archives_list);
        //婚礼主持-风格
        $zc_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 6 ORDER BY `weight` ASC");
        $zc_results = $dsql->dsqlOper($zc_archives, "results");
        $zc_archives_list = array(0 => '请选择');
        foreach($zc_results as $value){
            $zc_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$zc_archives_list);
        //珠宝首饰-材质
        $zbcz_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 70 ORDER BY `weight` ASC");
        $zbcz_results = $dsql->dsqlOper($zbcz_archives, "results");
        $zbcz_archives_list = array(0 => '请选择');
        foreach($zbcz_results as $value){
            $zbcz_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$zbcz_archives_list);
        //珠宝首饰-类型
        $zblx_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 73 ORDER BY `weight` ASC");
        $zblx_results = $dsql->dsqlOper($zblx_archives, "results");
        $zblx_archives_list = array(0 => '请选择');
        foreach($zblx_results as $value){
            $zblx_archives_list[$value['id']] = $value['typename'];
        }
        array_push($arr,$zblx_archives_list);

        return $arr;
    }

    /**
     * 婚礼策划
     */
    public  function marryplancaseList(){
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['store'];

                $state    = $this->param['state'];
                $typeid   = 9;

                $istype   = (int)$this->param['istype'];
                $businessid = (int)$this->param['businessid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addr'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $price = trim($this->param['price'],',');
                $style = (int)$this->param['style'] ?(int)$this->param['style']: 0;
                $color = (int)$this->param['color'] ?(int)$this->param['color']:0;


//                $bind_module = $this->param['bind_module'];

            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }
        if ($price) {
            $priceArr = explode(',',$price);
            $countPrice = count($priceArr);
            if($countPrice >1){
                $pricelow = sprintf("%.2f",$priceArr[0]);
                $priceheight = sprintf("%.2f",$priceArr[1]);
                $where .= " AND  `price` between $pricelow AND $priceheight";
            }
            if ($countPrice ==1 && $priceArr[0] ==2000){
                $where .= " AND `price` <= '$price'";
            }
            if ($countPrice ==1 && $priceArr[0] ==5000){
                $where .= " AND `price` >= '$price'";
            }
        }
        if ($store){
            $where .= "AND `company` ='$store'";
        }
//        if(!empty($typeid)){
//            if($dsql->getTypeList($typeid, "marry_type")){
//                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
//                $lower = $typeid.",".join(',',$lower);
//            }else{
//                $lower = $typeid;
//            }
//
//            $sidArr = array();
//            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
//            $results = $dsql->dsqlOper($archives, "results");
//            if(is_array($results)){
//                foreach ($results as $key => $value) {
//                    $sidArr[$key] = $value['id'];
//                }
//                if(!empty($sidArr)){
//                    $where .= " AND `company` in (".join(",",$sidArr).")";
//                }else{
//                    $where .= " AND 1 = 2";
//                }
//            }else{
//                $where .= " AND 1 = 2";
//            }
//        }
        if ($typeid){
            $where .= " AND `type` = $typeid";
        }

        if ($style){
            $where .= " AND `style` = $style ";
        }
        if ($color){
            $where .= " AND `colour` = $color";
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            //价格最高
            case 5:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
                break;
            //价格最低
            case 6:
                $orderby_ = " ORDER BY `price` , `weight` , `id` ";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        $archives = $dsql->SetQuery("SELECT `id`,`title`, `company`, `pics`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`, `characteristicservice`,`video`,`xn_clothing`,`xl_clothing`,`clothing`,`hairstyle`,`shot`,`interior`,`location`,`psday`,`psnumber`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`judge`,`pd`,`explain`,`explain_one`,`explain_two`,`note`,`xcexplain`,`xkexplain`, `sy_team`,`sy_videotape`,`sy_mv`,`dance`,`buynotice`,`planner`,`supervisor`,`host`,`photographer`,`cameraman`,`tel`,`colour`,`price`,`tag` FROM `#@__marry_planmeal` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_planmeal` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_planmeal_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_plancase_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]['pics']      = $val['pics'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['dance']     = $val['dance'];
                $list[$key]['type']    =$val['type'];
                if ($val['classification']){
                    $list[$key]['classificationname']  = $this->getmarryItem($val['classification']);
                }
                $store = $dsql->SetQuery("SELECT `id`, `bind_module`, `price`, `taoxi`, `anli`, `title`, `config`,`pubdate`, `pics`, `lat`, `lng`, `id`,`userid`, `typeid`, `address`, `tel`, `tag`, `addrid`, `rec` FROM `#@__marry_store` WHERE id= '$val[company]'");
                $sql = $dsql->SetQuery($store);
                $storelist = getCache("marry_store_list", $sql, 300, array("disabled" => $u));
                foreach ($storelist as $vv){

                    if(!empty($vv['addrid'])){
                        $addrName = getParentArr("site_area", $vv['addrid']);
                        global $data;
                        $data = "";
                        $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                        $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                        $vv['addrname']  = $addrArr;
                        $list[$key]['addrname'] = $addrArr;
                        $list[$key]['address'] = $vv['address'];
                        $list[$key]['companyname'] = $vv['title'];
                    }
                }
                if ($list[$key]['type'] == 0 ){
                    $list[$key]["typename"] = '';
                }else{
                    $bind_modulename = $this->gettypename("module_type",$list[$key]['type']  );
                    $list[$key]["typename"] = $bind_modulename;
                }
                $tagArr = array();
                if(!empty(	$list[$key]['tag'] )){
                    $tag = explode("|", 	$list[$key]['tag'] );
                    foreach ($tag as $k => $v) {
                        $tagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['tagAll'] = $tagArr;

                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';
                $type = 9;
                $param = array(
                    "service" => "marry",
                    "template" => "planmeal-detail",
                    "id" => $val['id'],
                    "typeid" => $type,
                    "istype" => $istype,
                    "businessid" => $businessid
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
//                $list[$key]['store'] = $store;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);

    }

    /**
     * 租婚车
     */
    public function marrycarList()
    {
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store    = $this->param['detailid'];
                $state    = $this->param['state'];
                $typeid   = $this->param['typeid'];
                $istype   = (int)$this->param['istype'];
                $businessid = (int)$this->param['businessid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addr'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $price = trim($this->param['price'],',');
                $car   = (int)$this->param['car'] ? (int)$this->param['car'] : 0;
//                $bind_module = $this->param['bind_module'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }
        if ($price) {
            $priceArr = explode(',',$price);
            $countPrice = count($priceArr);
            if($countPrice >1){
                $pricelow = sprintf("%.2f",$priceArr[0]);
                $priceheight = sprintf("%.2f",$priceArr[1]);
                $where .= " AND  `price` between $pricelow AND $priceheight";
            }
            if ($countPrice ==1 && $priceArr[0] ==2000){
                $where .= " AND `price` <= '$price'";
            }
            if ($countPrice ==1 && $priceArr[0] ==5000){
                $where .= " AND `price` >= '$price'";
            }
        }
        if ($store){
            $where .= "AND `company` = $store";
        }

        if ($car){
            $where .=" AND `style` =  $car";
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            //价格最高
            case 5:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
                break;
            //价格最低
            case 6:
                $orderby_ = " ORDER BY `price` , `weight` , `id` ";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT  `id`,`title`, `company`, `pics`, `price`, `duration`, `kilometre`, `click`, `pubdate`, `weight`,`state`,`planmealtype`,`style`,`characteristicservice`,`carintroduction`,`costcontain`,`costbarring`,`buynotice`,`tel`,`duration`,`kilometre`,`note` FROM `#@__marry_weddingcar` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_weddingcar` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_weddingcar_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_plancase_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['title'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['tag']       = $val['tag'];
                $list[$key]['tagSel']       = explode("|",$val['tag']);
                $list[$key]['pics']      = $val['pics'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['note']     = $val['note'];
                $list[$key]['duration']     = $val['duration'];
                $list[$key]['kilometre']     = $val['kilometre'];
                $list[$key]['type']    =10;
                if ($val['style'])
                {
                    $list[$key]['carname'] = $this->getmarryItem($val['style']);
                }
                $store = $dsql->SetQuery("SELECT `id`, `bind_module`, `price`, `taoxi`, `anli`, `title`, `config`,`pubdate`, `pics`, `lat`, `lng`, `id`,`userid`, `typeid`, `address`, `tel`, `tag`, `addrid`, `rec` FROM `#@__marry_store` WHERE id= '$val[company]'");
                $sql = $dsql->SetQuery($store);
                $storelist = getCache("marry_store_list", $sql, 300, array("disabled" => $u));
                foreach ($storelist as $v){
                    $list[$key]['companyname'] = $v['title'];
                    $list[$key]['address'] = $v['address'];
                    if(!empty($v['addrid'])){
                        $addrName = getParentArr("site_area", $v['addrid']);
                        global $data;
                        $data = "";
                        $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                        $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                        $v['addrname']  = $addrArr;
                        if($val['config']) {
                            $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` in (" . $val['config'] . ")");
                            $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));
                            if ($configArr){
                                $arrconfig = array();
                                foreach ($configArr as $k => $v) {
                                    $arrconfig[$k] = array(
                                        "jc" => $v['typename'],
                                        "py" => GetPinyin($v['typename'])
                                    );
                                }
                                $list[$key]['configName'] = $arrconfig;

                            }
                        }
                        $list[$key]['addrname'] = $addrArr;
                    }else{
                        $v['addrname'] = "";
                    }
                }
                if ($list[$key]['type'] == 0 ){
                    $list[$key]["typename"] = '';
                }else{
                    $bind_modulename = $this->gettypename("module_type",$list[$key]['type']  );
                    $list[$key]["typename"] = $bind_modulename;
                }
                $tagArr = array();
                if(!empty(	$list[$key]['tag'] )){
                    $tag = explode("|", 	$list[$key]['tag'] );
                    foreach ($tag as $k => $v) {
                        $tagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['tagAll'] = $tagArr;
                $pics = $val['pics'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';
                $type = 10;
                $param = array(
                    "service" => "marry",
                    "template" => "planmeal-detail",
                    "id" => $val['id'],
                    "typeid" => $type,
                    "istype" => $istype,
                    "type" =>$type,
                    "businessid" => $businessid
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
//                $list[$key]['store'] = $store;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 主持人分类
     */
    public function marryhostList()
    {
        global $dsql;
        global $langData;
        global $userLogin;
        $pageinfo = $list = array();
        $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
            }else{
                $search   = $this->param['search'];
                $store  = $this->param['detailid'];
                $state    = $this->param['state'];
                $istype   = (int)$this->param['istype'];
                $businessid = (int)$this->param['businessid'];
                $u        = $this->param['u'];
                $addrid   = $this->param['addr'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $price = trim($this->param['price'],',');
                $hoststyle = (int)$this->param['hoststyle'] ? (int)$this->param['hoststyle'] : 0;
//                $bind_module = $this->param['bind_module'];

            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        if($u!=1){
            $where .= " AND `state` = 1 ";

            //数据共享
            require(HUONIAOINC."/config/marry.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $cityid = getCityId($this->param['cityid']);
                if($cityid){
                    //$where .= " AND `cityid` = ".$cityid;

                    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `state` = 1 AND `cityid` = $cityid");
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
            if($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "marry"))){
                return array("state" => 200, "info" => $langData['marry'][5][12]);//商家权限验证失败
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $where .= " AND `company` = ".$storeRes[0]['id'];
            }else{
                $where .= " AND 1 = 2";
            }

            if($state!=''){
                $where .= " AND `state` = ".$state;
            }
        }
        if ($price) {
            $priceArr = explode(',',$price);
            $countPrice = count($priceArr);
            if($countPrice >1){
                $pricelow = sprintf("%.2f",$priceArr[0]);
                $priceheight = sprintf("%.2f",$priceArr[1]);
                $where .= " AND  `price` between $pricelow AND $priceheight";
            }
            if ($countPrice ==1 && $priceArr[0] ==2000){
                $where .= " AND `price` <= '$price'";
            }
            if ($countPrice ==1 && $priceArr[0] ==5000){
                $where .= " AND `price` >= '$price'";
            }
        }
        if ($store){
            $where .= "AND `company` ='$store'";
        }
        if($hoststyle){
            $where .= " AND `style` = $hoststyle";
        }
        if(!empty($typeid)){
            if($dsql->getTypeList($typeid, "marry_type")){
                $lower = arr_foreach($dsql->getTypeList($typeid, "marry_type"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }

            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `typeid` in ($lower)");
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
            $sidArr = array();
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `addrid` in ($lower)");
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

        if(!empty($search)){

            siteSearchLog("marry", $search);

            $sidArr = array();
            $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__marry_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.userid WHERE `store`.title like '%$search%' OR `store`.address like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if(!empty($sidArr)){
                $where .= " AND (`title` like '%$search%' OR `company` in (".join(",",$sidArr)."))";
            }else{
                $where .= " AND `title` like '%$search%'";
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
            case 5:
                $orderby_ = " ORDER BY `price` DESC, `weight` DESC, `id` DESC";
                break;
            case 6:
                $orderby_ = " ORDER BY `price` , `weight` , `id` ";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `hostname`, `userid`, `company`, `photo`, `price`, `click`, `pubdate`, `state`,`style` FROM `#@__marry_host` WHERE 1 = 1".$where);
        //总条数
        $arc = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_host` WHERE 1 = 1".$where);
        //总条数
        $totalCount = getCache("marry_host_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

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

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $sql = $dsql->SetQuery($archives.$orderby_.$where);
        $results = getCache("marry_host_list", $sql, 300, array("disabled" => $u));
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['title']     = $val['hostname'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['tag']       =  $val['tag'];
                $list[$key]['pics']      = $val['photo'];
                $list[$key]['click']     = $val['click'];
                $list[$key]['pubdate']   = $val['pubdate'];
                $list[$key]['state']     = $val['state'];
                $list[$key]['price']     = $val['price'];
                $list[$key]['note']     = $val['note'];
                $list[$key]['style']     = $val['style'];
                if ($val['style']){
                    $list[$key]['stylename']     = $this->getmarryItem($val['style']);
                }
                $list[$key]['type']    =7;
                $store = $dsql->SetQuery("SELECT `id`, `bind_module`, `price`, `taoxi`, `anli`, `title`, `config`,`pubdate`, `pics`, `lat`, `lng`, `id`,`userid`, `typeid`, `address`, `tel`, `tag`, `addrid`, `rec` FROM `#@__marry_store` WHERE id= '$val[company]'");
                $sql = $dsql->SetQuery($store);
                $storelist = getCache("marry_store_list", $sql, 300, array("disabled" => $u));
                foreach ($storelist as $v){

                    $list[$key]['companyname'] = $v['title'];
                    $list[$key]['address'] = $v['address'];
                    if(!empty($v['addrid'])){
                        $addrName = getParentArr("site_area", $v['addrid']);
                        global $data;
                        $data = "";
                        $addrArr = array_reverse(parent_foreach($addrName, "typename"));
                        $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                        $v['addrname']  = $addrArr;
                        if ($v['config']) {
                        $config = $dsql->SetQuery("SELECT `id`,`typename` FROM `#@__marryitem` WHERE `id` in ($v[config])");
                        $configArr = getCache("marry_item", $config, 300, array("disabled" => $u));
                            $arrconfig= array();
                            foreach ($configArr as $k => $v) {
                                $arrconfig[$k] = array(
                                    "jc" => $v['typename'],
                                    "py" =>  GetPinyin($v['typename'])
                                );
                            }
                            $list[$key]['configName'] = $arrconfig;

                        }

                        $list[$key]['addrname'] = $addrArr;
                    }else{
                        $v['addrname'] = "";
                    }
                }
                if ($list[$key]['type'] == 0 ){
                    $list[$key]["typename"] = '';
                }else{
                    $bind_modulename = $this->gettypename("module_type",$list[$key]['type']  );
                    $list[$key]["typename"] = $bind_modulename;
                }
                $tagArr = array();
                if(!empty(	$list[$key]['tag'] )){
                    $tag = explode("|", 	$list[$key]['tag'] );
                    foreach ($tag as $k => $v) {
                        $tagArr[$k] = array(
                            "jc" => $v,
                            "py" =>  GetPinyin($v)
                        );
                    }
                }
                $list[$key]['tagAll'] = $tagArr;

                $pics = $val['photo'];
                if(!empty($pics)){
                    $pics = explode(",", $pics);
                }
                $list[$key]['litpic'] = $pics[0] ? getFilePath($pics[0]) : '';
                $type = 7;
                $param = array(
                    "service" => "marry",
                    "template" => "planmeal-detail",
                    "id" => $val['id'],
                    "typeid" => $type,
                    "istype" => $istype,
                    "type" =>$type,
                    "businessid" => $businessid
                );
                $url = getUrlPath($param);

                $list[$key]['url'] = $url;

                $lower = [];
                $param['id']    = $val['company'];
                $this->param    = $param;
                $store          = $this->storeDetail();
                if(!empty($store)){
//					$lower = $store;
                }
//                $list[$key]['store'] = $store;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }
    /**
     * 预约看店
     */

    public  function getrese()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];
        $uid = $userLogin->getMemberID();

           //总条数
        $arc = $dsql ->SetQuery("SELECT COUNT(r.`id`) total FROM `#@__marry_rese` r LEFT JOIN `#@__marry_store` s  ON r.`company` = s.`id` WHERE r.`pid` = $uid");

        //总条数
        $totalCount = (int)getCache("marry_getrese_total", $arc, 300, array("name" => "total", "savekey" => 1, "disabled" => $uid));
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
        
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

		//未联系
		$totalResults = $dsql->dsqlOper($arc . " AND r.`state` = 0", "results", "NUM");
		$state0 = (int)$totalResults[0][0];

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
			"state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $historysql = $dsql ->SetQuery("SELECT r.`id`,r.`company`,r.`comtype`,r.`pubdate`,s.`title`,r.`contact`,r.`state`,r.`people`,s.`pics`FROM `#@__marry_rese` r LEFT JOIN `#@__marry_store` s  ON r.`company` = s.`id` WHERE r.`pid` = $uid".$where);
        $historyres = $dsql ->dsqlOper($historysql,'results');
        foreach($historyres as $k => $v){
            $pics = $v['pics'];

            if(!empty($pics)){
                $pics = explode(",", $pics);
                $historyres[$k]['litpic'] = getFilePath($pics[0]);
            }

        }



        if($historyres) {
            return array("pageInfo" => $pageinfo, "list" => $historyres);

        }else{
            return array("state" => 200, "info" => '暂无数据！');
        }



    }

    /**
     * 获取套餐咨询
     */

    public  function getContactlog()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];
        $uid = $userLogin->getMemberID();

        //总条数
        $arc = $dsql ->SetQuery("SELECT COUNT(`id`) total FROM `#@__marry_contactlog` WHERE `uid` = $uid");

        //总条数
        $totalCount = (int)$dsql->getOne($arc);
        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！
        
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        //未联系
        $totalResults = $dsql->dsqlOper($arc . " AND `state` = 0", "results", "NUM");
        $state0 = (int)$totalResults[0][0];

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $archives   = $dsql->SetQuery("SELECT * FROM `#@__marry_contactlog`  WHERE `uid`=$uid".$where);
        $historyres = $dsql ->dsqlOper($archives,'results');
        
        if($historyres) {
            return array("pageInfo" => $pageinfo, "list" => $historyres);

        }else{
            return array("state" => 200, "info" => '格式错误！');
        }



    }

    /**
     *  更新套餐咨询记录
     */
    public function updateContactlog(){

        global $dsql;
        global $userLogin;
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $param  = $this->param;
                $tcid  = $param['tcid'];
                $title  = $param['title'];
                $tcuid  = $param['jzuid'];
                $type   = $param['type'];
                $tel  = $param['tel'];
                $areaCode   = $param['areaCode'];
                $img   = $param['img'];
                $link   = $param['link'];
                $username   = $param['username'];
                $uid = $userLogin->getMemberID();
                if(($tcuid == '' || $uid < 0) && $tcuid == $uid){
                    return array("state" => 200, "info" => '格式错误！');
                }
                $date = time();
                $began = strtotime(date("Y-m-d") . " 00:00");
                $end   = strtotime(date("Y-m-d") . " 23:59");
                $historysql = $dsql ->SetQuery("SELECT `id` FROM `#@__marry_contactlog` WHERE `uid` = $uid AND `tcuid` = '$tcuid' AND `date` >= $began AND `date` <= $end");
                $historyres = $dsql ->dsqlOper($historysql,'results');
                if(empty($historyres) ) {
                    $updatesql = $dsql->SetQuery("INSERT INTO `#@__marry_contactlog` (`uid`,`tcuid`,`tcid`,`title`,`date`,`type`,`tel`,`username`,`areaCode`,`img`,`link`) VALUES ('$uid','$tcuid','$tcid','$title','$date','$type','$tel','$username','$areaCode','$img','$link')");
                    $res       = $dsql->dsqlOper($updatesql, "update");

                    if($res =='ok') {
                        autoShowUserModule($uid,'marry');
                        return $res;
                    }
                }else{
                    return array("state" => 200, "info" => '格式错误！');
                }
            }
        }
    }


    /**
     * 获取
     */

    public function getmarryItem($id){
        global $dsql;
        $hostarchives = $dsql->SetQuery("SELECT `id`, `typename`FROM `#@__marryitem` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($hostarchives, "results");
        return $results[0]['typename'];

    }
    /**
     * 套餐详细
     * @return array
     */
    public function planmealDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $typeid = isset($id['typeid']) ? $id['typeid'] : 0;
        $istype = isset($id['istype']) ? $id['istype'] : 0;
        $businessid = isset($id['businessid']) ? $id['businessid'] : 0;
        $id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();
        if(!is_numeric($id)){
            return array("state" => 200, "info" => $langData['marry'][5][10]);//格式错误
        }
        $where = " AND `type` = $typeid";
        if ($typeid == 7){
            $archives = $dsql->SetQuery("SELECT `id`,`userid`,`hostname`, `userid`, `company`, `photo`, `price`, `click`, `pubdate`, `state`,`host`,`music`,`style`,`scenesupervision`,`hoststyle`,`planmealcontent`,`servicefeatures`,`buynotice`,`characteristicservice`,`tag` ,`note`,`tel`FROM `#@__marry_host` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");
            $results[0]['pics'] =  $results[0]['photo'];
            $results[0]['host']  =  $results[0]['host'];
            $results[0]['title']  =  $results[0]['hostname'];

        }elseif($typeid == 10){
            $archives = $dsql->SetQuery("SELECT `id`,`userid`,`title`, `company`, `pics`, `price`, `duration`, `kilometre`, `click`, `pubdate`, `weight`, `state`,`planmealtype`,`style`,`characteristicservice`,`carintroduction`,`costcontain`,`costbarring`,`buynotice`,`tel`,`tag`,`duration`,`kilometre`,`note`FROM `#@__marry_weddingcar` WHERE `id` = ".$id);
            $results  = getCache("marry_planmeal_detail", $archives, 0, $id);
        }elseif($typeid == 9){
            $archives = $dsql->SetQuery("SELECT `id`,`title`,`userid`, `company`, `pics`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`, `characteristicservice`,`video`,`xn_clothing`,`xl_clothing`,`clothing`,`hairstyle`,`shot`,`interior`,`location`,`psday`,`psnumber`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`judge`,`pd`,`explain`,`explain_one`,`explain_two`,`note`,`xcexplain`,`xkexplain`, `sy_team`,`sy_videotape`,`sy_mv`,`dance`,`buynotice`,`planner`,`supervisor`,`host`,`photographer`,`cameraman`,`tel`,`colour`,`price`,`tag` FROM `#@__marry_planmeal` WHERE `id` = ".$id);
            $results  = getCache("marry_planmeal_detail", $archives, 0, $id);
        }elseif($typeid) {
            $archives = $dsql->SetQuery("SELECT `id`,`title`,`userid`, `company`, `pics`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`, `characteristicservice`,`video`,`xn_clothing`,`xl_clothing`,`clothing`,`hairstyle`,`shot`,`interior`,`location`,`psday`,`psnumber`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`judge`,`pd`,`explain`,`explain_one`,`explain_two`,`note`,`xcexplain`,`xkexplain`, `sy_team`,`sy_videotape`,`sy_mv`,`dance`,`buynotice`,`planner`,`supervisor`,`host`,`photographer`,`cameraman`,`tel`,`colour`,`price`,`tag`,`shape`,`note` FROM `#@__marry_planmeal` WHERE `id` = " . $id . $where);
            $results = $dsql->dsqlOper($archives, "results");
        }
        if($results){
            $storeDetail["id"]          = $results[0]['id'];
            $storeDetail["title"]       = $results[0]['title'];
            $storeDetail['userid']      = $results[0]['userid'];
            $storeDetail['company']     = $results[0]['company'];
            $storeDetail["pics"]        = $results[0]['pics'];
            $storeDetail["click"]       = $results[0]['click'];
            $storeDetail["pubdate"]     = $results[0]['pubdate'];
            $storeDetail["state"]       = $results[0]['state'];
            $storeDetail["price"]       = $results[0]['price'];
            $storeDetail["tag"]         = $results[0]['tag'];
            $storeDetail["tagSel"]      = explode("|",$results[0]['tag'] );
            $storeDetail["type"]        = $results[0]['type'];
            $storeDetail["type"]        = $results[0]['type'];
            $storeDetail["note"]        = $results[0]['note'];
            $storeDetail["duration"]        = $results[0]['duration'];
            $storeDetail["kilometre"]        = $results[0]['kilometre'];
            $storeDetail["dance"]           = $results[0]['dance'];
            $storeDetail["xcnumber"]        =  $results[0]['xcnumber'];
            $storeDetail["xknumber"]        = $results[0]['xknumber'];
            $storeDetail["xn_clothing"]      = $results[0]['xn_clothing'];
            $storeDetail["interior"]        = $results[0]['interior'];
            $storeDetail["location"]        =$results[0]['location'];
            $storeDetail["xl_clothing"]      =$results[0]['xl_clothing'];
            $storeDetail["planmealtype"]        = $results[0]['planmealtype'];
            $storeDetail["colour"]       =  $results[0]['colour'];
            $storeDetail["planner"]         = $results[0]['planner'];
            $storeDetail["style"]         = $results[0]['style'];
            $storeDetail["host"]         = $results[0]['host'];
            $storeDetail["supervisor"]      = $results[0]['supervisor'];
            $storeDetail["photographer"]         = $results[0]['photographer'];
            $storeDetail["cameraman"]       = $results[0]['cameraman'];
            $storeDetail["classification"]       = $results[0]['classification'];
            $storeDetail["clothing"]       = $results[0]['clothing'];
            $storeDetail["hairstyle"]       = $results[0]['hairstyle'];
            $storeDetail["psday"]       = $results[0]['psday'];
            $storeDetail["psnumber"]       = $results[0]['psnumber'];
            $storeDetail["rcnumber"]       = $results[0]['rcnumber'];
            $storeDetail["xknumber"]       = $results[0]['xknumber'];
            $storeDetail["dresser"]       = $results[0]['dresser'];
            $storeDetail["judge"]       = $results[0]['judge'];
            $storeDetail["pd"]       = $results[0]['pd'];
            $storeDetail["xcexplain"]       = $results[0]['xcexplain'];
            $storeDetail["xkexplain"]       = $results[0]['xkexplain'];
            $storeDetail["jxnumber"]       = $results[0]['jxnumber'];
            $storeDetail["sy_mv"]       = $results[0]['sy_mv'];

            if($results[0]['psday']){
                $storeDetail["psdayname"] =  $this->getmarryItem($results[0]['psday']);
            }
            if($results[0]['shot']){
                $storeDetail["changjing"] =  $this->getmarryItem($results[0]['shot']);
            }
            if ($results[0]['video']){
                $storeDetail['videoSource']  = $results[0]['video'] ? getFilePath($results[0]['video']) : '';
            }
            $storeDetail["note"]       =  $results[0]['note'];
            $storeDetail["sy_team"]        =$results[0]['sy_team'];
            $storeDetail["shape"]        =$results[0]['shape'];
            if($results[0]['xcnumber']){
                $storeDetail["xcnumbername"] =  $this->getmarryItem($results[0]['xcnumber']);
            }
            if($results[0]['shot']){
                $storeDetail["shotname"] =  $this->getmarryItem($results[0]['shot']);
            }
            if($results[0]['xknumber']){
                $storeDetail["xknumbername"] = $this->getmarryItem($results[0]['xknumber']);
            }if($results[0]['sy_team']){
                $storeDetail["sy_teamname"] = $this->getmarryItem($results[0]['sy_team']);
            }
            if($results[0]['xn_clothing']){
                $storeDetail["xn_clothingname"] = $this->getmarryItem($results[0]['xn_clothing']);
            }
            if($results[0]['interior']){
                $storeDetail["interiorname"] = $this->getmarryItem($results[0]['interior']);
            }
            if($results[0]['location']){
                $storeDetail["locationname"] = $this->getmarryItem($results[0]['location']);
            }
            if($results[0]['xl_clothing']){
                $storeDetail["xl_clothingname"] = $this->getmarryItem($results[0]['xl_clothing']);
            }
            if($results[0]['host']){
                $storeDetail["hostname"] =  $this->getmarryItem($results[0]['host']);
            }
            if($results[0]['planmealtype']){
                $storeDetail["planmealtypename"] = $this->getmarryItem($results[0]['planmealtype']);
            }
            if($results[0]['style']){
                $storeDetail["stylename"] =  $this->getmarryItem($results[0]['style']);
            }

            if($results[0]['colour']){
                $storeDetail["colourname"] = $this->getmarryItem($results[0]['colour']);
            }
            if($results[0]['planner']){
                $storeDetail["plannername"] = $this->getmarryItem($results[0]['planner']);
            }
            if($results[0]['supervisor']){
                $storeDetail["supervisorname"] = $this->getmarryItem($results[0]['supervisor']);
            }
            if($results[0]['photographer']){
                $storeDetail["photographername"] = $this->getmarryItem($results[0]['photographer']);
            }
            if($results[0]['cameraman']){
                $storeDetail["cameramanname"] = $this->getmarryItem($results[0]['cameraman']);
            }
            if($results[0]['classification']){
                $storeDetail["classificationname"] =  $this->getmarryItem($results[0]['classification']);
            }

            $storeDetail["explain"]  = $results[0]['explain'] ;
            $storeDetail["explain_one"]  = $results[0]['explain_one'] ;
            $storeDetail["explain_two"]  = $results[0]['explain_two'] ?$results[0]['explain_two']:'';

            $storeDetail["shot"]  = $results[0]['shot'] ?$results[0]['shot']:'';
            $storeDetail["carintroduction"]  = $results[0]['carintroduction']?$results[0]['carintroduction']:'';
            $storeDetail["costcontain"] = $results[0]['costcontain'] ? $results[0]['costcontain'] :'';
            $storeDetail["costbarring"] = $results[0]['costbarring']?$results[0]['costbarring']:'';
            $storeDetail["tel"]  = $results[0]['tel'] ?$results[0]['tel']:'';
            $storeDetail["music"]  = $results[0]['music'] ?$results[0]['music']: '' ;             //有无音乐指导
            $storeDetail["scenesupervision"] = $results[0]['scenesupervision'] ?$results[0]['scenesupervision'] : ''; //有无现场督导
            $storeDetail["hoststyle"] = $results[0]['hoststyle'] ?$results[0]['hoststyle']: '';
            $storeDetail['planmealcontent'] =  $results[0]['planmealcontent']? $results[0]['planmealcontent']: '';
            $storeDetail['servicefeatures'] =  $results[0]['servicefeatures']? $results[0]['servicefeatures']: '';
            $storeDetail['buynotice'] =  $results[0]['buynotice']? $results[0]['buynotice']: '';
            $storeDetail['characteristicservice'] =  $results[0]['characteristicservice']? $results[0]['characteristicservice']: '';
            $planmealarchives = $dsql->SetQuery("SELECT `p`.id, `p`.title, `p`.userid, `p`.company, `p`.price,`p`.state, `p`.tag, `p`.type ,`s`.config FROM `#@__marry_planmeal` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ".$results[0]['company']." AND p.`state` =1 ");
            $resultsplanmeal  =$dsql->dsqlOper($planmealarchives, "results");
            $plancase = $dsql->SetQuery("SELECT `id`, `title`, `userid`, `company`, `hoteltitle` FROM `#@__marry_plancase`  WHERE `company` = ".$results[0]['company']."  AND `state`=1 ");
            //婚礼主持
            $arc = $dsql->SetQuery("SELECT p.`id` FROM `#@__marry_host` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ". $results[0]['company']."  AND p.`state` = 1 ");
            $counthost  =$dsql->dsqlOper($arc, "results");
            //租婚车
            $car = $dsql->SetQuery("SELECT c.`id` FROM `#@__marry_weddingcar`c LEFT  JOIN `#@__marry_store` s  ON `c`.company=`s`.id WHERE `c`.company = ".$results[0]['company']."  AND c.`state` = 1 ");
            $countcar  = $dsql->dsqlOper($car, "results");
            $plancaseResults = $dsql->dsqlOper($plancase, "results");
            $sjid = $dsql->SetQuery("SELECT `s`.userid, `s`.address,`p`.title, `p`.company, `p`.price, `p`.tag, `p`.type ,`s`.config FROM `#@__marry_planmeal` p LEFT  JOIN `#@__marry_store` s  ON `p`.company=`s`.id WHERE `p`.company = ".$results[0]['company']." LIMIT 1");
            $resultssjid = $dsql->dsqlOper($sjid, "results");
            $storeDetail["address"] =$resultssjid[0]['address'];
            $storeDetail["plancaseCount"] = count($plancaseResults);
            $storeDetail["planmealCount"]  = count($resultsplanmeal)+count($counthost)+count($countcar);
            $storeDetail["planmeal"] = $resultsplanmeal;
            $storeDetail["plancase"] = $plancaseResults;
            $storeDetail["sjid"]        = $resultssjid[0]['userid'];
            $tagArr = array();
            if(!empty( $storeDetail['tag'] )){
                $tag = explode("|",$storeDetail['tag']);
                foreach ($tag as $k => $v) {
                    $tagArr[$k] = array(
                        "jc" => $v,
                        "py" =>  GetPinyin($v)
                    );
                }
            }
            $storeDetail['tagAll'] = $tagArr;
            $lower = [];
            $param['id']    = $results[0]['company'];
            $this->param    = $param;
            $store          = $this->storeDetail();
            if(!empty($store)){
                $lower = $store;
            }
            $storeDetail['store'] = $lower;
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
            $storeDetail["pinglun"] = count($this->getCommonList());
            $param = array(
                "service" => "marry",
                "template" => "planmeal-detail",
                "id" => $storeDetail["id"],
                "typeid" =>$typeid ,
                "istype" => $istype,
                "businessid" => $businessid
            );
            $url = getUrlPath($param);
            $storeDetail['url'] = $url;
            $param = array(
                "service"  => "marry",
                "template" => "store-detail",
                "id"       => $results[0]['company']
            );
            $storeDetail['companyurl'] = getUrlPath($param);
            //验证是否已经收藏
            $collect = '';
            if($uid != -1){
                $params = array(
                    "module" => "marry",
                    "temp"   => "planmeal-detail" . "|" . $typeid . "|" . $istype . "|" . $businessid,
                    "type"   => "add",
                    "id"     => $results[0]['id'],
                    "check"  => 1
                );
                $collect = checkIsCollect($params);
            }
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;
        }
        return $storeDetail;
    }

    /**
     * 遍历评论子级
     * @param $fid int 评论ID
     * @return array
     */
    function getCommonList(){
        global $dsql;
        global $userLogin;
        global $langData;

        $pageinfo = array();

        $param    = $this->param;
        $fid      = (int)$param['fid'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        if(empty($fid)) return array("state" => 200, "info" => $langData['marry'][5][44]);//参数错误

        $pageSize = empty($pageSize) ? 99999 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if($fid){
            $where = " AND `floor` = '$fid'";
        }

        $where .= " AND `ischeck` = 1";

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__marrycommon` WHERE 1 = 1".$where);
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

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__marrycommon` WHERE 1 = 1".$where);

        $order = " ORDER BY `id` ASC";
        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$order.$where, "results");
        $list = array();

        if(is_array($results) && !empty($results)){
            foreach ($results as $key => $val) {
                $list[$key]['id']      = $val['id'];
                $list[$key]['userinfo']= $userLogin->getMemberInfo($val['userid']);
                $list[$key]['content'] = $val['content'];
                $list[$key]['dtime']   = $val['dtime'];
                $list[$key]['ftime']   = floor((GetMkTime(time()) - $val['dtime']/86400)%30) > 30 ? $val['dtime'] : FloorTime(GetMkTime(time()) - $val['dtime']);
                $list[$key]['ip']      = $val['ip'];
                $list[$key]['ipaddr']  = $val['ipaddr'];
                $list[$key]['good']    = $val['good'];
                $list[$key]['bad']     = $val['bad'];

                $userArr = explode(",", $val['duser']);
                $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

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
     * 评论列表
     * @return array
     */
    public function common(){
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $newsid = $orderby = $page = $pageSize = $where = "";

        if(!is_array($this->param)){
            return array("state" => 200, "info" => $langData['marry'][5][44]);//格式错误！
        }else{
            $newsid    = $this->param['newsid'];
            $orderby   = $this->param['orderby'];
            $typeid    = $this->param['typeid'];
            $page      = $this->param['page'];
            $pageSize  = $this->param['pageSize'];
        }
        if($typeid!=''){
            $where = " AND `type` = '$typeid'";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $oby = " ORDER BY `id` DESC";
        if($orderby == "hot"){
            $oby = " ORDER BY `good` DESC, `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__marrycommon` WHERE `aid` = ".$newsid." $where AND `ischeck` = 1 AND `floor` = 0".$oby);//print_R($archives);exit;
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);//暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']      = $val['id'];
                $list[$key]['userinfo'] = $userLogin->getMemberInfo($val['userid']);
                $list[$key]['content'] = $val['content'];
                $list[$key]['dtime']   = $val['dtime'];
                $list[$key]['ftime']   = floor((GetMkTime(time()) - $val['dtime']/86400)%30) > 30 ? date("Y-m-d", $val['dtime']) : FloorTime(GetMkTime(time()) - $val['dtime']);
                $list[$key]['ip']      = $val['ip'];
                $list[$key]['ipaddr']  = $val['ipaddr'];
                $list[$key]['good']    = $val['good'];
                $list[$key]['bad']     = $val['bad'];

                $userArr = explode(",", $val['duser']);
                $list[$key]['already'] = in_array($userLogin->getMemberID(), $userArr) ? 1 : 0;

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
     * 顶评论
     * @param $id int 评论ID
     * @param string
     **/
    public function dingCommon(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];
        if(empty($id)) return "请传递评论ID！";
        $memberID = $userLogin->getMemberID();
        if($memberID == -1 || empty($memberID)) return $langData['siteConfig'][20][262];//登录超时，请重新登录！

        $archives = $dsql->SetQuery("SELECT `duser` FROM `#@__marrycommon` WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "results");
        if($results){

            $duser = $results[0]['duser'];

            //如果此会员已经顶过则return
            $userArr = explode(",", $duser);
            if(in_array($userLogin->getMemberID(), $userArr)) return $langData['marry'][5][45];//已顶过！

            //附加会员ID
            if(empty($duser)){
                $nuser = $userLogin->getMemberID();
            }else{
                $nuser = $duser . "," . $userLogin->getMemberID();
            }

            $archives = $dsql->SetQuery("UPDATE `#@__marrycommon` SET `good` = `good` + 1 WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__marrycommon` SET `duser` = '$nuser' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
            return $results;

        }else{
            return $langData['marry'][5][46];//评论不存在或已删除！
        }
    }

    /**
     * 发表评论
     * @return array
     */
    public function sendCommon(){
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        $aid     = $param['aid'];
        $id      = $param['id'];
        $type    = (int)$param['type'];
        $content = addslashes($param['content']);

        if(empty($aid) || empty($content)){
            return array("state" => 200, "info" => $langData['marry'][5][47]);//必填项不得为空！
        }

        $content = filterSensitiveWords(cn_substrR($content,250));

        include HUONIAOINC."/config/marry.inc.php";
        $ischeck = (int)$customCommentCheck;

        $userid = $userLogin->getMemberID();

        $archives = $dsql->SetQuery("INSERT INTO `#@__marrycommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`, `type`) VALUES ('$aid', '$id', '".$userid."', '$content', ".GetMkTime(time()).", '".GetIP()."', '".getIpAddr(GetIP())."', 0, 0, '$ischeck', '', '$type')");
        $lid  = $dsql->dsqlOper($archives, "lastid");
        if($lid){

            $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__marrycommon` WHERE `id` = ".$lid);
            $results = $dsql->dsqlOper($archives, "results");
            if($results){

                $list['id']      = $results[0]['id'];
                $list['userinfo'] = $userLogin->getMemberInfo($results[0]['userid']);
                $list['content'] = $results[0]['content'];
                $list['dtime']   = $results[0]['dtime'];
                $list['ftime']   = GetMkTime(time()) - $results[0]['dtime'] > 30 ? $results[0]['dtime'] : FloorTime(GetMkTime(time()) - $results[0]['dtime']);
                $list['ip']      = $results[0]['ip'];
                $list['ipaddr']  = $results[0]['ipaddr'];
                $list['good']    = $results[0]['good'];
                $list['bad']     = $results[0]['bad'];
                return $list;
            }
        }else{
            return array("state" => 200, "info" => $langData['marry'][5][48]);//评论失败！
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

        $sql = $dsql->SetQuery("SELECT * FROM `#@__marrycommon` WHERE `id` = $id AND `isCheck` = 1 ");//print_R($sql);exit;
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
                        $sql = $dsql->SetQuery("SELECT `content`, `userid` FROM `#@__marrycommon` WHERE `id` = '$value' AND `isCheck` = 1 ");
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
     * 分类 2019-04-23
     */
    public function module_type(){
        global $langData;
        $typeList = array();

        $typeList[] = array('id' => 1, 'typename' => $langData['marry'][2][6], 'lower' => array());//婚纱摄影
        $typeList[] = array('id' => 2, 'typename' => $langData['marry'][2][7], 'lower' => array());//摄影跟拍
        $typeList[] = array('id' => 3, 'typename' => $langData['marry'][2][8], 'lower' => array());//珠宝首饰
        $typeList[] = array('id' => 4, 'typename' => $langData['marry'][2][9], 'lower' => array());//摄像跟拍
        $typeList[] = array('id' => 5, 'typename' => $langData['marry'][2][10], 'lower' => array());//新娘跟妆
        $typeList[] = array('id' => 6, 'typename' => $langData['marry'][2][11], 'lower' => array());//婚纱礼服
        $typeList[] = array('id' => 7, 'typename' => $langData['marry'][2][16], 'lower' => array());//婚礼主持
        $typeList[] = array('id' => 8, 'typename' => $langData['marry'][2][13], 'lower' => array());//婚宴酒店
        $typeList[] = array('id' => 9, 'typename' => $langData['marry'][2][14], 'lower' => array());//婚礼策划
        $typeList[] = array('id' => 10, 'typename' => $langData['marry'][2][15], 'lower' => array());//租婚车
        return $typeList;
    }


    public function gettypename($fun, $id){
        $list = $this->$fun();
        return $list[array_search($id, array_column($list, "id"))]['typename'];
    }


}
