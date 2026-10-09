<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 装修模块API接口
 *
 * @version        $Id: renovation.class.php 2014-4-2 下午20:53:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */

class renovation {
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
     * 装修基本参数
     * @return array
     */
    public function config(){

        require(HUONIAOINC."/config/renovation.inc.php");

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
        // global $hotline_config;           //咨询热线配置
        // global $customHotline;            //咨询热线

        // global $custom_xq_atlasMax;       //小区相册图片数量限制
        // global $custom_gs_atlasMax;       //公司资质图片数量限制
        // global $custom_case_atlasMax;     //效果图数量限制
        // global $custom_diary_atlasMax;    //施工现场图片数量限制

        global $cfg_map;                  //系统默认地图
        // global $custom_map;               //自定义地图
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

        //自定义地图配置
        if($custom_map == 0){
            $custom_map = $cfg_map;
        }

        $params = !empty($this->param) && !is_array($this->param) ? explode(',',$this->param) : "";

        // $domainInfo = getDomain('renovation', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('renovation', $customSubDomain);

        //分站自定义配置
        $ser = 'renovation';
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
                }elseif($param == "xq_atlasMax"){
                    $return['xq_atlasMax'] = $custom_xq_atlasMax;
                }elseif($param == "gs_atlasMax"){
                    $return['gs_atlasMax'] = $custom_gs_atlasMax;
                }elseif($param == "case_atlasMax"){
                    $return['case_atlasMax'] = $custom_case_atlasMax;
                }elseif($param == "diary_atlasMax"){
                    $return['diary_atlasMax'] = $custom_diary_atlasMax;
                }elseif($param == "map"){
                    $return['map'] = $custom_map;
                }elseif($param == "template"){
                    $return['template'] = $customTemplate;
                }elseif($param == "touchTemplate"){
                    $return['touchTemplate'] = $customTouchTemplate;
                }elseif($param == "softSize"){
                    $return['softSize'] = $custom_softSize;
                }elseif($param == "softType"){
                    $return['softType'] = $custom_softType;
                }elseif($param == "thumbSize"){
                    $return['thumbSize'] = $custom_thumbSize;
                }elseif($param == "thumbType"){
                    $return['thumbType'] = $custom_thumbType;
                }elseif($param == "atlasSize"){
                    $return['atlasSize'] = $custom_atlasSize;
                }elseif($param == "atlasType"){
                    $return['atlasType'] = $custom_atlasType;
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
            $return['xq_atlasMax']    = $custom_xq_atlasMax;
            $return['gs_atlasMax']    = $custom_gs_atlasMax;
            $return['case_atlasMax']  = $custom_case_atlasMax;
            $return['diary_atlasMax'] = $custom_diary_atlasMax;
            $return['map']           = $custom_map;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['atlasSize']     = $custom_atlasSize;
            $return['atlasType']     = $custom_atlasType;

            global $userLogin;
            global $dsql;
            $userid = $userLogin->getMemberID();
            $identity  = array();

            //获取当前登录账号的身份信息
            if($userid > -1){
                $foremansql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = $userid");
                $foremanret = $dsql->dsqlOper($foremansql, "results");
                if ($foremanret) {
                    $foremanarr = array('type' => 'foreman', 'typeid' => '1', 'id' => $foremanret[0]['id']);
                    $identity['foreman'] = $foremanarr;
                } else {
                    $identity['foreman'] = array();
                }

                $teamsql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = $userid");
                $teamret = $dsql->dsqlOper($teamsql, "results");
                if ($teamret) {
                    $teamarr = array('type' => 'designer', 'typeid' => '2', 'id' => $teamret[0]['id']);
                    $identity["designer"] = $teamarr;
                } else {
                    $identity['designer'] = array();
                }

                $storesql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE  `userid` = $userid");
                $storeres  = $dsql->dsqlOper($storesql, "results");
                if ($storeres) {
                    $storearr = array('type' => 'store', 'typeid' => '0', 'id' => $storeres[0]['id']);
                    $identity['store'] = $storearr;
                } else {
                    $identity['store'] = array();
                }
            }

            $return['identity'] = $identity;

        }

        return $return;

    }


    /**
     * 装修分类
     * @return array
     */
    public function type(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type     = (int)$this->param['type'];
                $typename = $this->param['typename'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
                $getpicCount     = (int)$this->param['getpicCount'];
            }
        }
        $results = $dsql->getTypeList($type, "renovation_type", $son, $page, $pageSize);
        if($results){
            if($getpicCount ==1){
                foreach ($results as $key => &$value) {
                    $arr = array();
                    $arr['type']    = '0';
                    $arr[$typename] = $value['id'];
                    $this->param   = $arr;

                    $picCount = $this->rcase();

                    $value['pictoalcount'] = (int)$picCount['pageInfo']['totalCount'];

                }
            }
            return $results;
        }
    }


    /**
     * 装修地区
     * @return array
     */
    public function addr(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        global $template;
        if($template && $template != 'page' && empty($type)){
            //数据共享
            require(HUONIAOINC."/config/renovation.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare){
                $type = getCityId();
            }
        }

        //一级
        if(empty($type)){
            //可操作的城市，多个以,分隔
            $userLogin = new userLogin($dbo);
            $adminCityIds = $userLogin->getAdminCityIds();
            $adminCityIds = empty($adminCityIds) ? 0 : $adminCityIds;

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
            $results = $dsql->getTypeList($type, "site_area", $son, $page, $pageSize, '', '', true);
            if($results){
                return $results;
            }
        }
    }


    /**
     * 小区列表
     * @return array
     *
     */
    public function community(){
        global $dsql;
        $pageinfo = $list = array();
        $addrid = $page = $keywords = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $addrid   = $this->param['addrid'];
                $keywords = $this->param['keywords'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $where = " WHERE `state` = 1";

        //数据共享
        require(HUONIAOINC."/config/renovation.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where .= " AND `cityid` = ".$cityid;
            }
        }

        //遍历区域
        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                $addrArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addrArr = join(',',$addrArr);
                $lower = $addrid.",".$addrArr;
            }else{
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }

        if(!empty($keywords)){
            $where .= " AND `title` like '%".$keywords."%'";
        }

//        if($lng !='' && $lat != ""){
//            $where .= " AND ROUND(
//                        6378.138 * 2 * ASIN(
//                            SQRT(POW(SIN((".$lat." * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS(".$lat." * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN((".$lng." * PI() / 180 - `lng` * PI() / 180) / 2), 2))
//                        ) * 1000
//                    ) < 5000";
//        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `addrid`, `address`, `lnglat`, `price`, `click` FROM `#@__renovation_community` ".$where." ORDER BY `weight` DESC, `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");
        $RenrenCrypt = new RenrenCrypt();

        if($results){
            foreach($results as $key => $val){

                $list[$key]['id']     = $val['id'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['litpic'] = getFilePath($val['litpic']);

                $fid = $RenrenCrypt->php_decrypt(base64_decode($val["litpic"]));
                $picwidth = $picheight = 0;
                if(is_numeric($fid)){
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }else{
                    $rpic = str_replace('/uploads', '', $val["litpic"]);
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }
                $list[$key]['picwidth'] = $picwidth;
                $list[$key]['picheight'] = $picheight;

                global $data;
                $data = "";
                $addrName = getParentArr("site_area", $val['addrid']);
                $addrName = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr']    = join(" ", $addrName);

                $list[$key]['address']  = $val['address'];
                $list[$key]['lnglat']  = $val['lnglat'];
                $list[$key]['price']  = $val['price'];
                $list[$key]['click']  = $val['click'];

                $param = array(
                    "service"     => "renovation",
                    "template"    => "community",
                    "id"          => $val['id']
                );

                $list[$key]['url'] =getUrlPath($param);

                $constructionsql = $dsql->SetQuery("SELECT`id`,`title`,`area`,`budget`,`style`,`sid`FROM `#@__renovation_construction` WHERE `state` = 1 AND `communityid` = ".$val['id']);
//              var_dump($constructionsql);
                $constructionCount = $dsql->dsqlOper($constructionsql,"totalCount");
                $list[$key]['constructionCount']  = $constructionCount;

                $constructionres = $dsql->dsqlOper($constructionsql." LIMIT 0,2","results");

                $constructionarr = array();

                foreach ($constructionres as $k => $v) {
                    $constructionarr[$k]['title']       = $v['title'];
                    $constructionarr[$k]['id']          = $v['id'];

                    $constructionarr[$k]['area']        = $v['area'];

                    $_typename = '';
                    if($v['budget']){
                        $budgetsql  = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v['budget']);
                        $budgetres  = $dsql->dsqlOper($budgetsql,"results");
                        $_typename = $budgetres[0]['typename'];
                    }
                    $constructionarr[$k]['budget']      = $_typename;

                    $_typename = '';
                    if($v['style']){
                        $stylesql  = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v['style']);
                        $styleres  = $dsql->dsqlOper($stylesql,"results");
                        $_typename = $styleres[0]['typename'];
                    }
                    $constructionarr[$k]['style']       = $_typename;

                    $storesql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ".$v['sid']);
                    $storeres = $dsql->dsqlOper($storesql,"results");
                    $constructionarr[$k]['company']         = $storeres[0]['company'];

                }
                $list[$key]['constructionarr']  = $constructionarr;
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 小区详细信息
     * @return array
     *
     */
    public function communityDetail(){
        global $dsql;
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_community` WHERE `state` = 1 AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            $addrName = array_reverse(parent_foreach($addrName, "typename"));

            $results[0]['addr']    = join(" > ", $addrName);

            $results[0]["litpic"] = getFilePath($results[0]["litpic"]);

            $configArr = array();
            $config = $results[0]['config'];
            if(!empty($config)){
                $config = explode("|||", $config);
                foreach ($config as $key => $value) {
                    $v = explode("###", $value);
                    array_push($configArr, array("title" => $v[0], "note" => $v[1]));
                }
            }
            $results[0]['config'] = $configArr;

            $picsArr    = array();
            $qjpicsArr  = array();
            $pics   = $results[0]['pics'];
            $qjpics = $results[0]['qjpics'];
            if(!empty($pics)){
                $pics = explode("||", $pics);
                foreach ($pics as $key => $value) {
                    $v = explode("##", $value);
                    array_push($picsArr, array("pic" => getFilePath($v[0]), "title" => $v[1]));
                }
            }

            if(!empty($qjpics)){
                $qjpics = explode("||", $qjpics);
                foreach ($qjpics as $key => $value) {
                    $v = explode("##", $value);
                    array_push($qjpicsArr, array("pic" => getFilePath($v[0]), "title" => $v[1]));
                }
            }
            $results[0]['pics']         = $picsArr;
            $results[0]['picscount']    = count(array_column($picsArr, 'pic'));
            $results[0]['qjpics']       = $qjpicsArr;
            $results[0]['qjpicscount']  = count(array_column($qjpicsArr, 'pic'));
            $results[0]['allcount']     = count(array_column($qjpicsArr, 'pic')) + count(array_column($picsArr, 'pic'));


            return $results[0];
        }
    }


    /**
     * 装修招标
     * @return array
     */
    public function zhaobiao(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $type = $price = $nature = $addrid = $orderby = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type     = $this->param['type'];
                $price    = $this->param['price'];
                $nature   = $this->param['nature'];
                $addrid   = $this->param['addrid'];
                $company  = $this->param['company'];
                $orderby  = $this->param['orderby'];
                $keywords  = trim($this->param['keywords']);
                $state    = $this->param['state'] ? $this->param['state'] : RemoveXss($_REQUEST['state']);
                $u        = $this->param['u'];
                $b        = (int)$this->param['b'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid = $userLogin->getMemberID();

        if($u ==1){
            if($uid == -1){
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }
            if($b !=1){

                $where = " AND `userid` = ".$uid;
            }
        }else{

            $where = " AND `state` != 0";
        }

        if($keywords){
            $where .= " AND (`title` LIKE '%$keywords%' OR `community` LIKE '%$keywords%' OR `address` LIKE '%$keywords%')";
        }

        if(!empty($company)){
            $where .=" AND FIND_IN_SET(".$company.",`company`)";
        }

        if($state != ''){
            $where .= " AND `state` = ".$state;
        }

        if(!empty($type)){
            $where .= " AND `btype` = ".$type;
        }

        if(!empty($price)){
            $where .= " AND `budget` = ".$price;
        }

        if(!empty($nature)){
            $where .= " AND `nature` = ".$nature;
        }

        //遍历区域
        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                $addrArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addrArr = join(',',$addrArr);
                $lower = $addrid.",".$addrArr;
            }else{
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }
        //排序
        switch ($orderby){
            //默认
            case 0:
                $orderby = " ORDER BY `weight` DESC, `id` DESC";
                break;
            //预算升序
            case 1:
                $orderby = " ORDER BY `budget` ASC, `weight` DESC, `id` DESC";
                break;
            //预算降序
            case 2:
                $orderby = " ORDER BY `budget` DESC, `weight` DESC, `id` DESC";
                break;
            //时间降序
            case 3:
                $orderby = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
                break;
            //人气降序
            case 4:
                $orderby = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
                break;
            //面积降序
            case 5:
                $orderby = " ORDER BY `area` DESC, `weight` DESC, `id` DESC";
                break;
            default:
                $orderby = " ORDER BY `weight` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `btype`,`unittype`, `budget`, `nature`, `area`, `start`, `state`, `people`,`contact`,`community`,`address`,`contacsid`,`pubdate` FROM `#@__renovation_zhaobiao` WHERE 1 = 1 ".$where);

        //总条数
        $totalCount = (int)$dsql->dsqlOper($archives, "totalCount");

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //未联系
        $state0 = 0;
        if($company){
            $totalResults = $dsql->dsqlOper($archives . " AND !FIND_IN_SET(".$company.", `contacsid`)", "totalCount");
            $state0 = (int)$totalResults;
        }

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);


        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$orderby.$where, "results");

        $list = array();
        if($results){
            foreach($results as $key => $val){

                $btype = "";
                if($val['btype']){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$val['btype']);
                    $results_  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $btype = $results_[0]['typename'];
                    }
                }
                $results[$key]['btype'] = $btype;


                $budget = "";
                if($val['budget']){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$val['budget']);
                    $results_  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $budget = $results_[0]['typename'];
                    }
                }
                $results[$key]['budget'] = $budget;


                $nature = "";
                if($val['nature']){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$val['nature']);
                    $results_  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $nature = $results_[0]['typename'];
                    }
                }
                $results[$key]['nature'] = $nature;

                $unittype = "";
                if($val['unittype']){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$val['unittype']);
                    $results_  = $dsql->dsqlOper($archives, "results");
                    if($results){
                        $unittype = $results_[0]['typename'];
                    }
                }
                $results[$key]['unittype']  = $unittype;
                $results[$key]['md']        = date('m-d',$val['pubdate']);
                $results[$key]['his']       = date('H:i:s',$val['pubdate']);
                $results[$key]['contact']   = $val['contact'];
                $results[$key]['community'] = $val['community'];
                $results[$key]['address']   = $val['address'];

                $contac = explode(',',$val['contacsid']);
                if(in_array($company,$contac)){
                    $results[$key]['contacstate']   = 1;
                }else{
                    $results[$key]['contacstate']   = 0;

                }

                //判断是否过期
                if($val['end'] < GetMkTime(time())){
                    // $results[$key]['state'] = "3";
                    // $archives = $dsql->SetQuery("UPDATE `#@__renovation_zhaobiao` SET `state` = 3 WHERE `id` = ".$val['id']);
                    // $dsql->dsqlOper($archives, "update");
                }


                $param = array(
                    "service"     => "renovation",
                    "template"    => "zb-detail",
                    "id"          => $val['id']
                );
                $results[$key]['url'] = getUrlPath($param);

                array_push($list, $results[$key]);

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 招标详细信息
     * @return array
     */
    public function zhaobiaoDetail(){
        global $dsql;
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_zhaobiao` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $btype = "";
            if($results[0]['btype']){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['btype']);
                $results_  = $dsql->dsqlOper($archives, "results");
                if($results){
                    $btype = $results_[0]['typename'];
                }
            }
            $results[0]['btype'] = $btype;

            $budget = "";
            if($results[0]['budget']){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['budget']);
                $results_  = $dsql->dsqlOper($archives, "results");
                if($results){
                    $budget = $results_[0]['typename'];
                }
            }
            $results[0]['budget'] = $budget;

            $nature = "";
            if($results[0]['nature']){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['nature']);
                $results_  = $dsql->dsqlOper($archives, "results");
                if($results){
                    $nature = $results_[0]['typename'];
                }
            }
            $results[0]['nature'] = $nature;

            $unittype ="";
            if($results[0]['unittype']){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['unittype']);
                $results_  = $dsql->dsqlOper($archives, "results");
                if($results){
                    $unittype = $results_[0]['typename'];
                }
            }
            $results[0]['unittype'] = $unittype;

            $addrName = getParentArr("site_area", $results[0]['addrid']);
            $addrName = array_reverse(parent_foreach($addrName, "typename"));
            $results[0]['addr']    = join(" > ", $addrName);

            $results[0]["floorplans"] = getFilePath($results[0]["floorplans"]);

//          //判断是否过期
//          if($results[0]['end'] < GetMkTime(time())){
//              $results[0]['state'] = 3;
//              $archives = $dsql->SetQuery("UPDATE `#@__renovation_zhaobiao` SET `state` = 3 WHERE `id` = ".$id);
//              $dsql->dsqlOper($archives, "update");
//          }

            $statename = '';
//          var_dump($results[0]['state']);die;
            switch ($results[0]['state']) {
                case '0':
                    $statename = "招标审核中";
                    break;
                case '1':
                    $statename = "招标中";
                    break;
                case '2':
                    $statename = "招标成功";
                    break;
                case '3':
                    $statename = "招标结束";
                    break;
                case '4':
                    $statename = "停止结束";
                    break;
            }

            $results[0]['statename'] = $statename;
            return $results[0];
        }
    }


    /**
     * 发表招标
     * @return array
     */
    public function sendZhaobiao(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        $param = $this->param;
        $people  = $param['people'];
        $contact = $param['contact'];
        $addrid  = $param['addrid'];
        $address = $param['address'];

        $community = $param['community'];
        $area    = $param['area'];
        $budget  = $param['budget'];
        $nature  = (int)$param['nature'];
        $note    = $param['note'];
        $company = $_REQUEST['company'];
        $unittype = $param['unittype'];
        $pubdate = GetMkTime(time());

        $uid        = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();

//        if($uid == -1){
//            return array("state" => 200, "info" => '登录超时，请重新登录！');
//        }
        if(empty($people) || empty($contact) || empty($addrid)){
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        if(empty($company)){
            $companysql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `state` = 1");

            $companyres = $dsql->dsqlOper($companysql,"results");



            if($companyres){
                $storeidarr = array_column($companyres, "id");
            }
            $companyrand = array_rand($storeidarr,3);
            $company = implode(",", $companyrand);
        }


        $title = $people . "发布的新招标信息";

        $cityid = getCityId();

//        include HUONIAOINC."/config/renovation.inc.php";
//        $state  = (int)$customFabuCheck;
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_zhaobiao` (`cityid`, `title`, `people`, `contact`, `addrid`,`address`,`community`,`area`,`unittype`,`budget`, `nature`, `note`, `pubdate`, `weight`,`company`,`userid`) VALUES ('$cityid', '$title', '$people', '$contact', '$addrid','$address','$community','$area', '$unittype','$budget', '$nature', '$note', '$pubdate', 1,'$company','$uid')");
        $results  = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            autoShowUserModule($uid,'renovation'); // 招标， 自动填充装修用户卡片
            $cityName = $siteCityInfo['name'];
            $cityid  = $siteCityInfo['cityid'];

            $param = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——装修模块——用户:'.$userDetail['username'].'发布了招标',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("renovation", "zhaobiao",$param);
            return "申请成功！";
        }else{
            return array("state" => 200, "info" => '申请失败！');
        }

    }
    

	/**
     * 更新招标状态
     * @return array
     */
    public function zhaobiaoUpdateState()
    {
		global $dsql;
		global $langData;
		global $userLogin;

		$id = (int)$this->param['id'];
		$state = $this->param['state'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_zhaobiao` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			if($results[0]['userid'] == $uid){

				//更新状态
				$archives = $dsql->SetQuery("UPDATE `#@__renovation_zhaobiao` SET `state` = $state WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'renovation', 'zhaobiao', $id, 'update', '更新招标状态('.$results['title'].') => ' . $state, '', $archives);

				return '更新成功！';
			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);//权限不足，请确认帐户信息后再进行操作
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][20][282]);//信息不存在或已删除
		}

    }


	/**
     * 删除招标
     * @return array
     */
    public function zhaobiaoDel()
    {
		global $dsql;
		global $langData;
		global $userLogin;

		$id = (int)$this->param['id'];

		if(!is_numeric($id)) return array("state" => 200, "info" => $langData['car'][7][0]);//格式错误

		$uid = $userLogin->getMemberID();
		if($uid == -1){
			return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录
		}

		$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_zhaobiao` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if($results){
			if($results[0]['userid'] == $uid){

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_zhaobiao` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'renovation', 'zhaobiao', $id, 'delete', '删除招标信息('.$results['title'].')', '', $archives);

				return $langData['siteConfig'][20][444];//删除成功
			}else{
				return array("state" => 101, "info" => $langData['siteConfig'][21][143]);//权限不足，请确认帐户信息后再进行操作
			}
		}else{
			return array("state" => 101, "info" => $langData['siteConfig'][20][282]);//信息不存在或已删除
		}

    }






    /**
     * 装修投标
     * @return array
     */
    public function toubiao(){
        global $dsql;
        $pageinfo = $list = array();
        $aid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $aid      = $this->param['aid'];
                $state    = $this->param['state'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if(!is_numeric($aid)) return array("state" => 200, "info" => '格式错误！');

        $where = " WHERE `state` != 0 AND `aid` = ".$aid;

        if(!empty($state)){
            $where .= " AND `state` = ".$state;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `material`, `auxiliary`, `labor`, `manage`, `design`, `note`, `property`, `file`, `state`, `pubdate` FROM `#@__renovation_toubiao` ".$where." ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

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
                $results[$key]["file"] = getFilePath($val["file"]);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 装修公司
     * @return array
     */
    public function store(){
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $pageinfo = $list = array();
        $jiastyle = $comstyle = $style = $addrid = $property = $range = $title = $orderby = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $jiastyle = (int)$this->param['jiastyle'];
                $comstyle = (int)$this->param['comstyle'];
                $style    = (int)$this->param['style'];
                $addrid   = (int)$this->param['addrid'];
                $cityid   = (int)$this->param['cityid'];
                $property = $this->param['property'];
                $range    = (int)$this->param['range'];
                $title    = $this->param['title'];
                $orderby  = (int)$this->param['orderby'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
            }
        }

        $where = " WHERE `state` = 1";

        //数据共享
        require(HUONIAOINC."/config/renovation.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where .= " AND `cityid` = ".$cityid;
            }
        }

        if(!empty($jiastyle)){
            $where .= " AND FIND_IN_SET('$jiastyle', `jiastyle`)";
        }

        if(!empty($comstyle)){
            $where .= " AND FIND_IN_SET('$comstyle', `comstyle`)";
        }

        if(!empty($style)){
            $where .= " AND FIND_IN_SET('$style', `style`)";
        }

        if($property != ""){
            $property = explode(",", $property);
            foreach ($property as $key => $val) {
                $where .= " AND find_in_set('".$val."', `property`)";
            }
        }

        if(!empty($range)){
            $where .= " AND FIND_IN_SET('$range', `range`)";
        }

        if(!empty($title)){
            $where .= " AND `company` like '%".$title."%'";
        }

        //遍历区域
        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                $addrArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addrArr = join(',',$addrArr);
                $lower = $addrid.",".$addrArr;
            }else{
                $lower = $addrid;
            }
            $where .= " AND `addrid` in ($lower)";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $order = " ORDER BY `weight` DESC, `id` DESC";

        if($orderby == 1){
            $order = " ORDER BY `click` DESC, `id` DESC";
        }elseif ($orderby ==  2) {
            $order = " ORDER BY `id` DESC";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `company`, `safeguard`, `domaintype`, `addrid`, `address`, `logo`, `contact`, `license`, `certi` FROM `#@__renovation_store`".$where.$order);
//      var_dump($archives);die;

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        $list = $diarylist = array();

        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']        = $val['id'];
                $list[$key]['company']   = $val['company'];
                $list[$key]['safeguard'] = $val['safeguard'];
                $list[$key]['address']   = $val['address'];
                $list[$key]['contact']   = $val['contact'];
                $list[$key]['license']   = $val['license'];
                $list[$key]['certi']     = $val['certi'];
                $list[$key]["logo"]      = getFilePath($val["logo"]);

                global $data;
                $data = "";
                $addrName = getParentArr("site_area", $val['addrid']);
                $addrName = array_reverse(parent_foreach($addrName, "typename"));
                $list[$key]['addr']    = join(" ", $addrName);

                //设计师
                $archives       = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `company` = ".$val['id']." AND`state` = 1");
                $teamCount      = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]["teamCount"] = $teamCount;

                //工长
                $garchives      = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `company` = ".$val['id']." AND`state` = 1");
                $foremanCount   = $dsql->dsqlOper($garchives, "totalCount");
                $list[$key]["foremanCount"] = $foremanCount;


                //工地统计
                $constructionsql    = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_construction` WHERE `sid` = ".$val['id']." AND`state` = 1");
                $constructionCount  = $dsql->dsqlOper($constructionsql,"totalCount");
                $list[$key]["constructionCount"] = $constructionCount ;

                //案例统计
                $diarycountsql      = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_diary` WHERE `company` = ".$val['id']." AND`state` = 1");
                $diaryCount         = $dsql->dsqlOper($diarycountsql,"totalCount");

//                 foreach($results_ as $k => $v){
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_case` WHERE `company` = ".$val['id']);
                $caseCount  = $dsql->dsqlOper($archives, "totalCount");

//                  $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_diary` WHERE `designer` = ".$v['id']);
//                  $diary  = $dsql->dsqlOper($archives, "totalCount");
//                  $diaryCount = $diaryCount + $diary;
//                 }
                 $list[$key]["caseCount"] = $caseCount;

                //案例查询
                $diarysql       = $dsql->SetQuery("SELECT `id`,`litpic` FROM `#@__renovation_diary` WHERE `company` = ".$val['id']." AND `state` = 1 ORDER BY `pubdate` DESC");
                $diaryres       = $dsql->dsqlOper($diarysql,"results");
                if($diaryres){

                    foreach ($diaryres as $k => $v) {
                        $param = array(
                            "service"     => "renovation",
                            "template"    => "case-detail",
                            "id"          => $v['id']
                        );
                        $caseurl = getUrlPath($param);
                        $list[$key]["diarylist"][$k]['caseurl'] = $caseurl;
                        if($v['litpic']){
                            $litpicarr = explode(",", $v['litpic']);

                        }

                        $list[$key]["diarylist"][$k]['litpic'] = getFilePath($litpicarr[0]);

                    }
                }else{
                    $list[$key]["diarylist"] = array();
                }
                $list[$key]["diaryCount"] = $diaryCount;

                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_rese` WHERE `company` = ".$val['id']);
                $reseCount  = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]["reseCount"] = $reseCount;

//              $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_guest` WHERE `company` = ".$val['id']);
//              $guestCount  = $dsql->dsqlOper($archives, "totalCount");
//              $list[$key]["guestCount"] = $guestCount;

//              $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_storesale` WHERE `store` = ".$val['id']);
//              $saleCount  = $dsql->dsqlOper($archives, "totalCount");
//              $list[$key]["saleCount"] = $saleCount;

                $param = array(
                    "service"     => "renovation",
                    "template"    => "company-detail",
                    "id"          => $val['id']
                );

                $url = getUrlPath($param);

                $this->param = "";
                $channelDomain = $this->config();
                $domainInfo = getDomain('renovation', 'renovation_store', $val['id']);

                //绑定主域名
                if($results[$key]["domaintype"] == 1 && $domainInfo['expires'] > GetMkTime(time())){
                    $url = $cfg_secureAccess.$domainInfo['domain'];
                }

                $list[$key]['url'] = $url;

            }
        }
        // echo "<pre>";
        // var_dump($list);
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 装修公司详细信息
     * @return array
     */
    public function storeDetail(){
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
        $uid = $userLogin->getMemberID();

        $id = $id == 0 ? '' : $id;

        if(!is_numeric($id) && $uid == -1){
            return array("state" => 200, "info" => '格式错误！');
        }

        $where = " AND `state` = 1";
        if(!is_numeric($id)){
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if($results){
                $id = $results[0]['id'];
                $where = "";
            }else{
                return array("state" => 200, "info" => '该会员暂未开通公司！');
            }
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_store` WHERE `id` = ".$id.$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            global $data;
            $data="";
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            $addrName = array_reverse(parent_foreach($addrName, "typename"));
            $results[0]['addr']    = $addrName;

            $results[0]["logoSource"]   = $results[0]["logo"];
            $results[0]["wechat"]       = $results[0]["wechat"];
            $results[0]["website"]      = $results[0]["website"];
            $results[0]["logo"]         = getFilePath($results[0]["logo"]);

            $certsArr = array();
            $certs = $results[0]['certs'];
            if(!empty($certs)){
                $certs = explode("||", $certs);
                foreach($certs as $key => $val){
                    $val = explode("##", $val);
                    $certsArr[$key]['picSource'] = $val[0];
                    $certsArr[$key]['pic'] = getFilePath($val[0]);
                    $certsArr[$key]['title'] = $val[1];
                    $certsArr[$key]['note'] = $val[2];
                }
            }
            $results[0]["certs"] = $certsArr;

            $this->param = "";
            $channelDomain = $this->config();
            $domainInfo = getDomain('renovation', 'renovation_store', $id);

            /**
             * 默认 || 模块配置为子目录并且信息配置为绑定子域名则访问方式转为默认
             * （因为子域名是随模块配置变化，如果模块配置为子目录地址为乱掉。）
             * 如：模块配置：http://menhu168.com/renovation
             * 如果信息绑定子域名则会变成：http://demo.menhu168.com/renovation
             * 这样会导致系统读取信息错误
             */
            if($results[0]["domaintype"] == 0 || ($channelDomain['subDomain'] == 2 && $results[0]["domaintype"] == 2)){

                $results[0]["domain"] = $channelDomain['channelDomain']."/company-detail-".$id.".html";

                //绑定主域名
            }elseif($results[0]["domaintype"] == 1){

                $results[0]["domain"] = $cfg_secureAccess . $domainInfo['domain'];
                $results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
                $results[0]["domaintip"] = $domainInfo['note'];

                //绑定子域名
            }elseif($results[0]["domaintype"] == 2){

                $results[0]["domain"] = str_replace("http://", "http://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
                $results[0]["domain"] = str_replace("https://", "https://".$domainInfo['domain'].".", $channelDomain['channelDomain']);
                $results[0]["domainexp"] = date("Y-m-d H:i:s", $domainInfo['expires']);
                $results[0]["domaintip"] = $domainInfo['note'];

            }


            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `company` = ".$results[0]['id']);
            $teamCount  = $dsql->dsqlOper($archives, "totalCount");
            $results[0]["teamCount"] = $teamCount;

            $caseCount = $diaryCount = 0;
            $results_  = $dsql->dsqlOper($archives, "results");
            // foreach($results_ as $k => $v){
            // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_case` WHERE `designer` = ".$v['id']);
            // $case  = $dsql->dsqlOper($archives, "totalCount");
            // $caseCount = $caseCount + $case;

            $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_diary` WHERE `company` = ".$results[0]['id']);
            $case       = $dsql->dsqlOper($archives, "totalCount");
            $caseCount  = $case;

            $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_construction` WHERE `sid` = ".$results[0]['id']);
            // var_dump($archives);die;
            $diary      = $dsql->dsqlOper($archives, "totalCount");
            $diaryCount     = $diary;
            // }
            $results[0]["caseCount"] = $caseCount;
            $results[0]["diaryCount"] = $diaryCount;

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_rese` WHERE `company` = ".$results[0]['id']);
            $reseCount  = $dsql->dsqlOper($archives, "totalCount");
            $results[0]["reseCount"] = $reseCount;

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_guest` WHERE `company` = ".$results[0]['id']);
            $guestCount  = $dsql->dsqlOper($archives, "totalCount");
            $results[0]["guestCount"] = $guestCount;

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_storesale` WHERE `store` = ".$results[0]['id']);
            $saleCount  = $dsql->dsqlOper($archives, "totalCount");
            $results[0]["saleCount"] = $saleCount;


            //服务区域
            $range = array();
//          if(!empty($results[0]['range'])){
//              $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__site_area` WHERE `id` in (".$results[0]['range'].") ORDER BY INSTR(',".$results[0]['range'].",', CONCAT(',',id,','))");
//              $ret = $dsql->dsqlOper($sql, "results");
//              if($ret){
//                  foreach ($ret as $key => $value) {
//                      array_push($range, $value['typename']);
//                  }
//              }
//          }
            $results[0]['rangeName'] = join(" ", $range);


            //家装专长
            $jiastyle = array();
            if(!empty($results[0]['jiastyle']) && $results[0]['jiastyle'] != 'Array'){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` in (".$results[0]['jiastyle'].")");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $key => $value) {
                        array_push($jiastyle, $value['typename']);
                    }
                }
            }
            $results[0]['jiastyleName'] = join(" ", $jiastyle);


            //公装专长
            $comstyle = array();
            if(!empty($results[0]['comstyle']) && $results[0]['comstyle'] != 'Array'){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` in (".$results[0]['comstyle'].")");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $key => $value) {
                        array_push($comstyle, $value['typename']);
                    }
                }
            }
            $results[0]['comstyleName'] = join(" ", $comstyle);


            //专长风格
            $style = array();
            if(!empty($results[0]['style'])){
                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` in (".$results[0]['style'].")");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    foreach ($ret as $key => $value) {
                        array_push($style, $value['typename']);
                    }
                }
            }
            $results[0]['styleName'] = join(" ", $style);


            //验证是否已经收藏
            $params = array(
                "module" => "renovation",
                "temp"   => "company-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $results[0]['collect'] = $collect == "has" ? 1 : 0;

            return $results[0];
        }
    }


    /**
     * 公司促销活动
     * @return array
     */
    public function storeSale(){
        global $dsql;
        $pageinfo = $list = array();
        $storeid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $storeid  = $this->param['storeid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if(!is_numeric($storeid)) return array("state" => 200, "info" => '格式错误！');

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `click`, `pubdate` FROM `#@__renovation_storesale` WHERE `store` = $storeid ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        return array("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 促销详细信息
     * @return array
     */
    public function saleDetail(){
        global $dsql;
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_storesale` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            return $results;
        }
    }

    /*
     *公司资质
     * */
    public function storeAptitudes(){
        global $dsql;
        $pageinfo = $list = array();
        $aid = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $company  = $this->param['company'];
                $state    = $this->param['state'];
                $u        = $this->param['u'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        //会员中心请求
        if($u == 1){

            if($state != ''){
                $where1 = " AND `state` = ".$state;
            }
        }else{
            $where1 = " AND `state` = 1";
        }

        if(!empty($company)){
            $where .= " AND `company` = ".$company;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $order  = " ORDER BY `id` DESC";
        $archives = $dsql->SetQuery("SELECT `id`, `company`, `litpic`, `title`, `state`, `pubdate` FROM `#@__renovation_storeaptitudes` WHERE  1 = 1".$where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //已审核
        $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

        //未审核
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

        //审核拒绝
        $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);


        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "state1"        => $state1,
            "state0"        => $state0,
            "state2"        => $state2,
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

        if($results){
            foreach($results as $key => $val){
                $results[$key]["litpic"] = getFilePath($val["litpic"]);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $results);

    }


    /*
     *公司资质详情
     * */
    public function storeptitudesDetail(){
        global $dsql;
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_storeaptitudes` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results[0]['litpicpath'] = getFilePath($results[0]['litpic']);
            return $results[0];
        }
    }
    /*
    *新增公司资质
    * */
    public function addStoreaptitudes(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        $userid    = $userLogin->getMemberID();
        $param     = $this->param;
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $title      = $this->param['title'];
                $litpic     = $this->param['litpic'];

            }
        }
        $pubdate = GetMkTime(time());

        $cityName   = $siteCityInfo['name'];
        $cityid     = $siteCityInfo['cityid'];

        $userid  = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state`,`company` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        if(empty($title)){
            return array("state" => 200, "info" => '请输入标题！');
        }
        if(empty($litpic)){
            return array("state" => 200, "info" => '请上传图片！');
        }
        $sid        = $userResult[0]['id'];
        $company    = $userResult[0]['company'];
        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_storeaptitudes` (`company`, `litpic`, `title`,`cityid`,`state`,`pubdate`) VALUES ('$sid', '$litpic', '$title','$cityid','$state' ,'$pubdate')");
        $aid      = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){
            $param = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——装修模块——商家:'.$company.'上传了公司资质',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("renovation", "storeaptitudes",$param);
            return $aid;
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }
    /*
     * 编辑公司荣誉资质
     * */
    public function editStoreaptitudes(){
        global $dsql;
        global $userLogin;

        $userid    = $userLogin->getMemberID();
        $param     = $this->param;
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $title      = $this->param['title'];
                $id         = $this->param['id'];
                $litpic     = $this->param['litpic'];

            }
        }
        $pubdate = GetMkTime(time());

        $userid  = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        if(empty($title)){
            return array("state" => 200, "info" => '请输入标题！');
        }
        if(empty($litpic)){
            return array("state" => 200, "info" => '请上传图片！');
        }
        $sid = $userResult[0]['id'];

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_storeaptitudes` SET `title` = '$title',`litpic` = '$litpic' WHERE  `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }

    /*
    * 删除公司荣誉资质
    * */
    public function delStoreaptitudes(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];
		$id = is_numeric($id) ? $id : $id['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 101, "info" => '公司信息不存在，删除失败！');
        }else{
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_storeaptitudes` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['company'] == $sid){

                delPicFile($results['litpic'], "delAtlas", "renovation");

                $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_storeaptitudes` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
                return '删除成功！';

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '成员不存在，或已经删除！');
        }
    }
    /**
     * 设计师
     * @return array
     */
    public function team(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $special = $style = $works = $company = $u = $orderby = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $special  = $this->param['special'];
                $style    = $this->param['style'];
                $works    = $this->param['works'];
                $company  = $this->param['company'];
                $u        = $this->param['u'];
                $orderby  = $this->param['orderby'];
                $title    = $this->param['title'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }


        if(!$u) {

            //数据共享
            require(HUONIAOINC."/config/renovation.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare && !$company){
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND m.`cityid` = $cityid";
                }
            }

            // $houseid = array();
            // $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1" . $where2);
            // $loupanResult = $dsql->dsqlOper($loupanSql, "results");
            // if ($loupanResult) {
            //     foreach ($loupanResult as $key => $loupan) {
            //         array_push($houseid, $loupan['id']);
            //     }
            //     $where .= " AND `company` in (" . join(",", $houseid) . ")";
            // } else {
            //     $where .= " AND 2=3";
            // }
            $where .= " AND t.`state` = 1";
        }else{
            $uid = $userLogin->getMemberID();

            if(!verifyModuleAuth(array("module" => "renovation"))){
                return array("state" => 200, "info" => '商家权限验证失败！');
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $company = $storeRes[0]['id'];
            }else{
                $company = "-1";
            }

        }

        if(!empty($special)){
            $where .= " AND FIND_IN_SET('$special', t.`special`)";
        }

        if(!empty($style)){
            $where .= " AND FIND_IN_SET('$style', t.`style`)";
        }

        if(!empty($title)){
            $where .= " AND t.`name` like '%".$title."%'";
        }

        //工作年限
        if($works){
            $works = explode(",", $works);
            $works0 = (int)$works[0];
            $works1 = (int)$works[1];
            if(empty($works0)){
                $where .= " AND t.`works` < " . $works1;
            }elseif(empty($works1)){
                $where .= " AND t.`works` > " . $works0;
            }else{
                $where .= " AND t.`works` BETWEEN " . $works0 . " AND " . $works1;
            }
        }


        if(!empty($company)){
            $where .= " AND t.`company` = ". $company;
        }

        $order = " ORDER BY t.`weight` DESC, t.`id` DESC";

        if($orderby == 1){
            $order = " ORDER BY t.`id` DESC";
        }elseif($orderby == 2){
            $order = " ORDER BY t.`click` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT t.`id`, t.`name`,t.`tel`,t.`areaCode`,t.`works`,t.`userid`,t.`post`, t.`photo`, t.`company`, t.`special`, t.`style`, t.`idea`, t.`click` FROM `#@__renovation_team` t LEFT JOIN `#@__member` m ON m.`id` = t.`userid` WHERE  1 = 1".$where.$order);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        $list = array();
        if($results){
            foreach($results as $key => $val){

                $list[$key]['id']       = $val['id'];
                $list[$key]['name']     = $val['name'];
                $list[$key]['tel']      = $val['tel'];
                $list[$key]['areaCode'] = $val['areaCode'];
                $list[$key]['works']    = $val['works'];
                $list[$key]['post']     = $val['post'];
                $list[$key]['post']     = $val['post'];
                $list[$key]['click']    = $val['click'];
                $list[$key]['userid']   = $val['userid'];

                $list[$key]["photo"] = getFilePath($val["photo"]);

                $list[$key]["photos"] = $val["photo"];
                $this->param = $val['company'];
                $list[$key]['is_independence'] = 0;
                if($val['company']!=0){
                    $list[$key]['is_independence'] = 1;
                }
                $list[$key]['company'] = $this->storeDetail();

                $specialArr = array();
                $special = $val['special'];
                if(!empty($special)){
                    $special = explode(",", $special);
                    foreach($special as $k => $v){
                        if($v){
                            $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                            $typename  = $dsql->dsqlOper($archives, "results");
                            if($typename){
                                $specialArr[] = $typename[0]['typename'];
                            }
                        }
                    }
                }
                $list[$key]["special"] = join(",", $specialArr);

                $styleArr = array();
                $style = $val['style'];
                if(!empty($style)){
                    $style = explode(",", $style);
                    foreach($style as $k => $v){
                        if($v){
                            $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                            $typename  = $dsql->dsqlOper($archives, "results");
                            if($typename){
                                $styleArr[] = $typename[0]['typename'];
                            }
                        }
                    }
                }

                $designersql = $dsql->SetQuery("SELECT `certifyState` FROM `#@__member` WHERE `id` = ". $val['userid']);
                $designerres = $dsql->dsqlOper($designersql,"results");

                $list[$key]["certifyState"] = $designerres[0]['certifyState'];
                $list[$key]["style"] = join(",", $styleArr);

                $list[$key]['idea'] = $val['idea'];

//                $archives   = $dsql->SetQuery("SELECT `id`,`litpic` FROM `#@__renovation_case` WHERE `designer` = ".$val['id']);
//
//                $caseCount = $dsql->dsqlOper($archives, "totalCount");
//
//                $list[$key]["case"] = $caseCount;

                $archives   = $dsql->SetQuery("SELECT `id`,`litpic` FROM `#@__renovation_diary` WHERE `fid` = ".$val['id']." AND `ftype` = 2");

                $diaryres   = $dsql->dsqlOper($archives." LIMIT 0,4","results");
                foreach ($diaryres as $a => $b) {
                    $diaryres[$a]['litpic'] = getFilePath($b['litpic']);
                }
                $list[$key]["diarylitpic"] = $diaryres;

                $diaryCount = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]["diary"] = $diaryCount;

                $param = array(
                    "service"     => "renovation",
                    "template"    => "designer-detail",
                    "id"          => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //验证是否已经收藏
                $params = array(
                    "module" => "renovation",
                    "temp"   => "designer-detail",
                    "type"   => "add",
                    "id"     => $val['id'],
                    "check"  => 1
                );
                $collect = checkIsCollect($params);
                $list[$key]['collect'] = $collect == "has" ? 1 : 0;
            }
        }

//      var_dump($list);die;
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /*
        工长
    */
    public function foreman(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type     = $this->param['type'];
                $works    = $this->param['works'];
                $keywords = $this->param['keywords'];
                $company  = $this->param['company'];
                $u        = $this->param['u'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }



        if(!$u) {

            //数据共享
            require(HUONIAOINC."/config/renovation.inc.php");
            $dataShare = (int)$customDataShare;

            if(!$dataShare && !$company){
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where .= " AND m.`cityid` = $cityid";
                }
            }

            // $houseid = array();
            // $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1" . $where2);
            // $loupanResult = $dsql->dsqlOper($loupanSql, "results");
            // if ($loupanResult) {
            //     foreach ($loupanResult as $key => $loupan) {
            //         array_push($houseid, $loupan['id']);
            //     }
            //     $where .= " AND `company` in (" . join(",", $houseid) . ")";
            // } else {
            //     $where .= " AND 2=3";
            // }
            $where .= " AND f.`state` = 1";
        }

        if(!empty($works)){
            $works = explode(",", $works);
            if(empty($works[0])){
                $where .= " AND f.`works` < " . $works[1];
            }elseif(empty($works[1])){
                $where .= " AND f.`works` > " . $works[0];
            }else{
                $where .= " AND f.`works` BETWEEN " . $works[0] . " AND " . $works[1];
            }
        }

        if(!empty($keywords)){
            $where .= " AND f.`name` like '%".$keywords."%'";
        }
        if(!empty($type)){
            $where .= " AND f.`style` = ".$type;
        }

        if(!empty($company)){
            $where .= " AND f.`company` = ". $company;
        }

        //遍历区域
        if(!empty($addrid)){
            if($dsql->getTypeList($addrid, "site_area")){
                $addrArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                $addrArr = join(',',$addrArr);
                $lower = $addrid.",".$addrArr;
            }else{
                $lower = $addrid;
            }
            $where .= " AND f.`addrid` in ($lower)";
        }

        if($orderby == 0){

            $orderby = " ORDER BY f.`id` desc";

        }elseif($orderby ==1){

            $orderby = " ORDER BY f.`click`   desc";

        }else{
            $orderby = " ORDER BY f.`pubdate` desc";

        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT f.`id`,f.`tel`,f.`areaCode`,f.`name`, f.`works`, f.`post`, f.`photo`, f.`type`,f.`company`,f.`note`, f.`style`, f.`address`,f.`tel`, f.`click`,f.`age` FROM `#@__renovation_foreman` f LEFT JOIN `#@__member` m ON m.`id` = f.`userid` WHERE 1=1 ".$where.$orderby);
//      var_dump($archives);die;
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        //文章统计
        $articlessql = $dsql->SetQuery("SELECT `fid`, count(`id`) articlesall FROM `#@__renovation_article` WHERE `state` = 1 GROUP BY `fid`");

        $articlesres = $dsql->dsqlOper($articlessql,"results");

        if(!empty($articlesres)){
            $articlesarr = array_combine(array_column($articlesres, "fid"),array_column($articlesres, "articlesall"));
        }

        //案例统计
        $casesql    = $dsql->SetQuery("SELECT `fid`,count(`id`)  caseall FROM `#@__renovation_diary` WHERE `state` = 1 AND `ftype` = 1 GROUP BY `fid`");
        $caseres    = $dsql->dsqlOper($casesql,"results");

        if(!empty($caseres)){
            $casearr = array_combine(array_column($caseres, "fid"),array_column($caseres, "caseall"));
        }

        //工种


        if($results){
            foreach($results as $key => $val){

                $list[$key]['id']            = $val['id'];
                $list[$key]['name']          = $val['name'];
                $list[$key]['works']         = $val['works'];
                $list[$key]['areaCode']      = $val['areaCode'];
                $list[$key]['photo']         = getFilePath($val['photo']);
                $list[$key]['photos']        = $val['photo'];
                $list[$key]['type']          = $val['type'];
                $list[$key]['note']          = $val['note'];

                $fotyperes = array();
                if($val['style']){
                    $fotypesql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id`  = ".$val['style']);
                    $fotyperes = $dsql->dsqlOper($fotypesql,"results");
                }

                $list[$key]['style']         = $val['style'];
                $list[$key]['stylename']     = is_array($fotyperes)? $fotyperes[0]['typename'] : "无";
                $list[$key]['address']       = $val['address'];
                $list[$key]['click']         = $val['click'];
                $list[$key]['age']           = $val['age'];
                $list[$key]['tel']           = $val['tel'];

                $param = array(
                    "service"     => "renovation",
                    "template"    => "foreman-detail",
                    "id"          => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);

                //文章查询
                $list[$key]['articlesall']   = $articlesarr[$val['id']]?$articlesarr[$val['id']]:0;
                //案例查询
                $list[$key]['caseall']       = $casearr[$val['id']] ?$casearr[$val['id']] :0;


            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /*
        工长详情
    */
    public function foremanDetail(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        if(is_array($param)){
            $id   =  $param['id'];
        }else{
            $id   =  $this->param;
        }
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_foreman` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");

        $userinfo       = $userLogin->getMemberInfo($results[0]['userid']);

        $certifyState   = $userinfo['certifyState'];
        if($results){
            $results[0]["photoSource"]      = $results[0]["photo"];
            $results[0]["photo"]            = getFilePath($results[0]["photo"]);

            // $results[0]["typename"]  = $results[0]["type"] ? "独立工长" : '';

            $results[0]["certifyState"] = $certifyState;
            $com = array('contact' => '', 'logo' => '', 'domain' => '', 'address' => '', 'url' => '');

            $results[0]["company"] = $com;

            if($results[0]["type"] == 0){

                $results[0]["typename"]     = "独立工长";

            }else{
                $results[0]["typename"]     = "";
                $this->param    = $results[0]['company'];
                $company        = $this->storeDetail();
                $results[0]["company"] = $company && is_array($company) ? $company : $com;
            }

            //预约
            $resesql    = $dsql->SetQuery("SELECT `people`,`community`,`address`,`pubdate` FROM `#@__renovation_rese` WHERE `type` = 1 AND `bid` = ".$id);

            $reseres    = $dsql->dsqlOper($resesql,"results");

            $results[0]["rese"] = $reseres;

            //案例

            $casesql   = $dsql->SetQuery("SELECT count(`id`) caseall FROM `#@__renovation_diary` WHERE `fid` =".$id." AND `ftype` = 1");

            $caseres   = $dsql->dsqlOper($casesql,"results");

            $results[0]['case'] = $caseres[0]['caseall'];

            $results[0]['sexid']= $results[0]['sex'];

            $results[0]['sex']  = $results[0]['sex']==1 ? "男" : "女";

            $typename = '';
            if($results[0]['style']){
                $archives   = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['style']);
                $typename   = $dsql->dsqlOper($archives, "results");
            }

            $results[0]['stylev']   = $results[0]['style'];
            $results[0]['style']    = $typename && is_array($typename) ? $typename[0]['typename'] : '';

            $param = array(
                "service"     => "renovation",
                "template"    => "foreman-detail",
                "id"          => $id
            );
            $results[0]['domain'] = getUrlPath($param);

        }
        return $results[0];
    }

    /*
     * 公司申请管理
     * */
    public function Application(){
        global $dsql;
        global $userLogin;

        $pageinfo = $list = array();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{

                $company  = $this->param['company'];

                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT * FROM (SELECT `id`,`name`,`tel` ,`photo`,`works`,`age`,'foreman'  moduletype   FROM `#@__renovation_foreman` as f  WHERE `state` = 0 AND `company` = $company
                                UNION ALL SELECT `id`,`name`,`tel` ,`photo`,`works`,'' as age,'designer'  moduletype    FROM `#@__renovation_team` as t      WHERE `state` = 0 AND `company` = $company) as unall");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

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
            foreach ($results as $k => &$v){
                if($v['moduletype'] == 'designer'){
                    $archives  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_diary` WHERE `fid` = ".$v['id']);
                    $caseCount = $dsql->dsqlOper($archives, "totalCount");
                    $v["diary"] = $caseCount;
                }
                $v['photo'] = getFilePath($v['photo']);
            }

        }
        return array("pageInfo" => $pageinfo, "list" => $results);




    }

    /*
     * 公司同意申请
     * */
    public  function agreeApplication(){
        global  $userLogin;
        global  $dsql;

        $param = $this->param;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{

                $id           = $this->param['id'];
                $type         = $this->param['type'];
                $updatetype   = $this->param['updatetype'];


            }
        }
        $userid  = $userLogin->getMemberID();
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];
        if($type == "designer"){
            $table = 'team';
        }else{
            $table = 'foreman';
        }
        $sql  = $dsql->SetQuery("UPDATE `#@__renovation_".$table."` SET `state` = ".$updatetype." WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret == "ok"){
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }

    /*工地*/
    public function constructionList(){
        global $dsql;
        global $userLogin;
        global  $customDataShare;
        $pageinfo = $list = array();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type           = $this->param['type'];
                $keywords       = $this->param['keywords'];
                $company        = $this->param['company'];
                $style          = $this->param['style'];
                $communityid    = $this->param['communityid'];
                $sid            = $this->param['sid'];
                $u              = $this->param['u'];
                $state          = $this->param['state'];
                $orderby        = $this->param['orderby'];
                $stageid        = $this->param['stageid'];
                $page           = $this->param['page'];
                $pageSize       = $this->param['pageSize'];
            }

            if(!$u) {

                //数据共享
                require(HUONIAOINC."/config/renovation.inc.php");
                $dataShare = (int)$customDataShare;

                if(!$dataShare){
                    $cityid = getCityId($this->param['cityid']);
                    if ($cityid) {
                        $where2 = " AND `cityid` = $cityid";
                    }
                }

                //分站数据筛选，如果需要注释，请在此写明原因
                $houseid = array();
                $loupanSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1" . $where2);
                $loupanResult = $dsql->dsqlOper($loupanSql, "results");
                if ($loupanResult) {
                    foreach ($loupanResult as $key => $loupan) {
                        array_push($houseid, $loupan['id']);
                    }
                    $where .= " AND `sid` in (" . join(",", $houseid) . ")";
                } else {
                    $where .= " AND 2=3";
                }

                $where1 = " AND `state` = 1";
            }else{
                if($state!= ""){
                    $where1 = " AND `state` = ".$state;
                }
            }


            if($communityid){
                $where .= " AND `communityid` = ".$communityid;
            }

            if($sid){
                $where .= " AND `sid` = ".$sid;
            }

            if($style){
                $where .= " AND `style` = ".$style;
            }

            if($stageid){
                $where .=" AND find_in_set(".$stageid.",`stageid`)";
            }

            if($company){
                $where .= " AND `sid` = ".$company;
            }
            $order = " ORDER BY `id` DESC";
            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            $archives = $dsql->SetQuery("SELECT `id`,`sid`, `title`,`litpic`, `address`, `addrid`, `community`, `communityid`,`budget`,`area`, `btype`, `style`,`stage`, `stageid`,`pubdate` FROM `#@__renovation_construction` WHERE  1 = 1 ".$where.$where1);


            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");

            //已审核
            $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

            //未审核
            $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

            //审核拒绝
            $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");
            //总分页数
            $totalPage = ceil($totalCount/$pageSize);

            if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

            //总分页数
            $totalPage = ceil($totalCount/$pageSize);

            $pageinfo = array(
                "page" => $page,
                "pageSize" => $pageSize,
                "totalPage" => $totalPage,
                "totalCount" => $totalCount,
                "state1"        => $state1,
                "state0"        => $state0,
                "state2"        => $state2,
            );

            $atpage = $pageSize*($page-1);
            $where = " LIMIT $atpage, $pageSize";

            $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

            if($results){
                foreach ($results as $k => $v) {

                    $list[$k]['id']         = $v['id'];

                    $storesql = $dsql->SetQuery("SELECT `company` FROM `#@__renovation_store` WHERE `id` = ".$v['sid']);

                    $stoerres = $dsql->dsqlOper($storesql,"results");

                    $list[$k]['company']    = $stoerres[0]['company'];
                    $list[$k]['sid']        = $v['sid'];
                    $list[$k]['title']      = $v['title'];
                    $list[$k]['address']    = $v['address'];
                    $list[$k]['addrid']     = $v['addrid'];
                    $list[$k]['community']  = $v['community'];
                    $list[$k]['pubdate']    = date('Y-m-d H:i:s',$v['pubdate']);
                    $list[$k]['communityid']= $v['communityid'];
                    $list[$k]['litpic']     = $v['litpic']?getFilePath($v['litpic']):'';

                    $communitysql = $dsql->SetQuery("SELECT `litpic`,`title`,`addrid`,`address` FROM `#@__renovation_community` WHERE `id` = ".$v['communityid']);

                    $communityres = $dsql->dsqlOper($communitysql,"results");

//                    $list[$k]['communitypic']     = $communityres?getFilePath($communityres[0]['litpic']):'';
                    $list[$k]['communitytitle'] = $communityres[0]['title'];
                    $addrName1 = getParentArr("site_area", $communityres[0]['addrid']);
                    $addrName  = array_reverse(parent_foreach($addrName1, "typename"));
                    $list[$k]['communityaddress']   = $addrName[0];

                    $_typename = '';
                    if($v['budget']){
                        $budgetsql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v['budget']);
                        $budgetres = $dsql->dsqlOper($budgetsql,"results");
                        if($budgetres){
                            $_typename = $budgetres[0]['typename'];
                        }
                    }

                    $list[$k]['budget']     = $_typename;
                    $list[$k]['budgetid']   = $v['budget'];
                    $list[$k]['area']       = $v['area'];

                    $_typename = '';
                    if($v['btype']){
                        $budgetsql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v['btype']);
                        $budgetres = $dsql->dsqlOper($budgetsql,"results");
                        if($budgetres){
                            $_typename = $budgetres[0]['typename'];
                        }
                    }
                    $list[$k]['btype']      = $_typename;

                    $_typename = '';
                    if($v['style']){
                        $budgetsql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v['style']);
                        $budgetres = $dsql->dsqlOper($budgetsql,"results");
                        if($budgetres){
                            $_typename = $budgetres[0]['typename'];
                        }
                    }
                    $list[$k]['style']      = $_typename;

                    $stagearr               = json_decode($v['stage'],true);

                    if($stagearr){
                        foreach ($stagearr as $o => &$p) {
                            $listpic        =   explode("||", $p['imgList']);

                            $listpicarr     = array();

                            foreach ($listpic as $a => $b) {
                                if($b !=''){
                                    $listpicarr[$a]['path'] = getFilePath($b);
                                    $listpicarr[$a]['img']  = $b;
                                }
                            }
                            $p['listpicarr'] =  $listpicarr;
                        }

                        array_multisort(array_column($stagearr,'stage'),SORT_ASC,$stagearr);
                        $list[$k]['stage']   = $stagearr;
                        $pic                 = is_array($stagearr) ? array_column($stagearr,'imgList'): array() ;
                        $pica                = explode(',',$pic[0]);
                        foreach ($pica as $key => $value){
                            $picvalue = explode("||", $value);
                            $picarr[$key]['pic']        =  $picvalue[0];
                            $picarr[$key]['picpath']    =  getFilePath($picvalue[0]);
                        }

                        $list[$k]['picarr']    = $picarr;


                        $enstagearr             = end($stagearr);

                        $_typename = '';
                        if($enstagearr['stage']){
                            $mqjdsql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$enstagearr['stage']);
                            $mqjdres = $dsql->dsqlOper($mqjdsql,"results");
                            if($mqjdres){
                                $_typename = $mqjdres[0]['typename'];
                            }
                        }

                        $list[$k]['mqjd']       = $_typename;
                    }
                    $stageidarr = explode(",",$v['stageid']);
                    sort($stageidarr);
                    $list[$k]['stageid'] = $stageidarr;

                    // if($v['communityid'] !=0){
                    //
                    //     $param = array(
                    //         "service"     => "renovation",
                    //         "template"    => "community",
                    //         "id"          => $v['communityid']
                    //     );
                    //     $list[$k]['url'] = getUrlPath($param);
                    // }

                    //工地详情
                    $param = array(
                        'service' => 'renovation',
                        'template' => 'company-site-detail',
                        'id' => $v['id']
                    );
                    $list[$k]['url'] = getUrlPath($param);

                }

            }
            return array("pageInfo" => $pageinfo, "list" => $list);

        }
    }



    /*
     * 新增工地
     * */
    public function addConstruction(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else {
                $param      = $this->param;
                $title      = $param['title'];
                $addrid     = $param['addrid'];
                $addrname   = $param['addrname'];
                $address    = $param['address'];
                $budget     = $param['price'];
                $area       = $param['area'];
                $btype      = $param['type'];
                $style      = $param['style'];
                $communityid  = $param['communityid'];
                $community  = $param['community'];
                $stagelist  = $param['stagelist'];

                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];

                $pubdate = GetMkTime(time());

                $userid  = $userLogin->getMemberID();

                $userDetail = $userLogin->getMemberInfo();
                if($userid == -1){
                    return array("state" => 200, "info" => '登录超时，请重新登录！');
                }

                $userSql = $dsql->SetQuery("SELECT `id`, `state`,`company` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
                $userResult = $dsql->dsqlOper($userSql, "results");
                $company =  $userResult[0]['company'];
//                if(!$userResult){
//                    return array("state" => 200, "info" => '您还未开通装修公司！');
//                }
//
//                if(!verifyModuleAuth(array("module" => "renovation"))){
//                    return array("state" => 200, "info" => '商家权限验证失败！');
//                }
//
//                if($userResult[0]['state'] == 0){
//                    return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
//                }
//
//                if($userResult[0]['state'] == 2){
//                    return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
//                }

                $sid = $userResult[0]['id'];

                if(empty($title)){
                    return array("state" => 200, "info" => '请输入标题！');
                }

                if(empty($addrid)){
                    return array("state" => 200, "info" => '请选择地址！');
                }

                if(empty($address)){
                    return array("state" => 200, "info" => '请填写详细地址！');
                }

                if(empty($communityid)){
                    return array("state" => 200, "info" => '请选择小区！');
                }

                if(empty($stagelist)){
                    return array("state" => 200, "info" => '请添加阶段！');
                }

                if($stagelist){
                    $stagearr = json_decode($stagelist,true);
                    $stageid  = implode(',',array_column($stagearr,"stage"));
                }
                include HUONIAOINC."/config/renovation.inc.php";
                $state  = (int)$customFabuCheck;
                $sql = $dsql->SetQUery("INSERT INTO `#@__renovation_construction` (`userid`,`sid`,`cityid`,`title`,`address`,`addrid`,`community`,`communityid`,`budget`,`btype`,`area`,`style`,`stage`,`state`,`stageid`,`pubdate`)
                                            VALUES ('$userid','$sid','$cityid','$title','$address','$addrid','$community','$communityid','$budget','$btype','$area','$style','$stagelist','$state','$stageid','$pubdate')");

                $aid = $dsql->dsqlOper($sql,"lastid");
                if (is_numeric($aid)) {

                    $urlParam = array(
                        'service' => 'renovation',
                        'template' => 'company-site-detail',
                        'id' => $aid
                    );
                    $url = getUrlPath($urlParam);
                
                    //记录用户行为日志
                    memberLog($userid, 'renovation', 'construction', $aid, 'insert', '添加工地('.$title.')', $url, $sql);

                    $param = array(
                        'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => $cityid,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $cityName.'分站——装修模块——用户:'.$company.'上传了公司资质',
                            'date' => date("Y-m-d H:i:s", time()),
                        )
                    );
                    //后台微信通知
                    updateAdminNotice("renovation", "construction",$param);
                    return $aid;
                } else {
                    return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
                }
            }
        }
    }

    /*
     * 编辑工地
     * */
    public function editConstruction(){
        global $dsql;
        global $userLogin;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else {
                $param = $this->param;

                $param      = $this->param;

                $id         = $param['id'];
                $title      = $param['title'];
                $addrid     = $param['addrid'];
                $addrname   = $param['addrname'];
                $address    = $param['address'];
                $budget     = $param['price'];
                $area       = $param['area'];
                $btype      = $param['type'];
                $style      = $param['style'];
                $litpic     = $param['litpic'];
                $communityid  = $param['communityid'];
                $community  = $param['community'];
                $stagelist  = $param['stagelist'];
                $cityId     = $param['cityId'];


                $pubdate = GetMkTime(time());

                $userid = $userLogin->getMemberID();
                if ($userid == -1) {
                    return array("state" => 200, "info" => '登录超时，请重新登录！');
                }

                $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = " . $userid);
                $userResult = $dsql->dsqlOper($userSql, "results");
//
//                if (!$userResult) {
//                    return array("state" => 200, "info" => '您还未开通装修公司！');
//                }
//
//                if (!verifyModuleAuth(array("module" => "renovation"))) {
//                    return array("state" => 200, "info" => '商家权限验证失败！');
//                }
//
//                if ($userResult[0]['state'] == 0) {
//                    return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
//                }
//
//                if ($userResult[0]['state'] == 2) {
//                    return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
//                }

                $sid = $userResult[0]['id'];

                if (empty($title)) {
                    return array("state" => 200, "info" => '请输入标题！');
                }

                if (empty($addrid)) {
                    return array("state" => 200, "info" => '请选择地址！');
                }

                if (empty($address)) {
                    return array("state" => 200, "info" => '请填写详细地址！');
                }

                if (empty($communityid)) {
                    return array("state" => 200, "info" => '请选择小区！');
                }

                if (empty($stagelist)) {
                    return array("state" => 200, "info" => '请添加阶段！');
                }

                if ($stagelist) {
                    $stagearr = json_decode($stagelist, true);
                    $stageid = implode(',', array_column($stagearr, "stage"));
                }

                $archives = $dsql->SetQuery("UPDATE `#@__renovation_construction` SET
                                    `title`     = '$title',
                                    `addrid`    = '$addrid',
                                    `address`   = '$address',
                                    `budget`    = '$budget',
                                    `area`      = '$area',
                                    `btype`     = '$btype',
                                    `style`     = '$style',
                                    `litpic`    = '$litpic',
                                    `communityid`= '$communityid',
                                    `community` = '$community',
                                    `stage`     = '$stagelist',
                                    `stageid`   = '$stageid'
                                    WHERE `id` = ".$id);
                $ret = $dsql->dsqlOper($archives, "update");

                if($ret == "ok"){

                    $urlParam = array(
                        'service' => 'renovation',
                        'template' => 'company-site-detail',
                        'id' => $id
                    );
                    $url = getUrlPath($urlParam);
                
                    //记录用户行为日志
                    memberLog($userid, 'renovation', 'construction', $id, 'update', '修改工地('.$title.')', $url, $archives);

                    return "修改成功！";
                }else{
                    return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
                }
            }
        }
    }


    /**
     * 删除工地
     * @return arrayalbums.html
     */
    public function delConstruction(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 101, "info" => '公司信息不存在，删除失败！');
        }else{
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_construction` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['sid'] == $sid){
                $stage      = json_decode($results['stage'],true);
                foreach ($stage as $a => $b){
                    $picarr =  explode("||",$b['imgList']);
                    foreach($picarr as $k__ => $v__){
                        delPicFile($v__, "delAtlas", "renovation");
                    }
                }
                $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_construction` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'renovation', 'construction', $id, 'delete', '删除工地('.$results['title'].')', '', $archives);

                return '删除成功！';

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '成员不存在，或已经删除！');
        }

    }

    /*工地详情*/

    public function constructionDetail(){
        global $dsql;
        $param = $this->param;
        if(is_array($param)){
            $id  =  $param['id'];
        }else{
            $id  =  $this->param;
        }

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_construction` WHERE  `id` = ".$id);


        $results  = $dsql->dsqlOper($archives,"results");

        if($results){
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            $addrName = array_reverse(parent_foreach($addrName, "typename"));
            $results[0]['constructionaddress'] = $addrName[0];

            $communitysql = $dsql->SetQuery("SELECT `litpic`,`title`,`addrid`,`address` FROM `#@__renovation_community` WHERE `id` = ".$results[0]['communityid']);

            $communityres = $dsql->dsqlOper($communitysql,"results");

            $results[0]['communitylitpic'] =  $communityres?getFilePath($communityres[0]['litpic']):'';
            $results[0]['communitytitle']  =  $communityres[0]['title'];

            $communityaddrName = getParentArr("site_area", $results[0]['addrid']);
            $communityaddrName = array_reverse(parent_foreach($communityaddrName, "typename"));
            $results[0]['constructionaddress'] = $communityaddrName[0];

            $budgetres[0]['typename'] = '';
            if($results[0]['budget']){
                $budgetsql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['budget']);
                $budgetres = $dsql->dsqlOper($budgetsql,"results");
            }

            $results[0]['budgetid']     = $results[0]['budget'];
            $results[0]['budget']       = $budgetres[0]['typename'];

            $results[0]['litpicpath']   = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : '';

            $results[0]['area']         = $results[0]['area'];

            $btyperes[0]['typename'] = '';
            if($results[0]['btype']){
                $btypesql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['btype']);
                $btyperes = $dsql->dsqlOper($btypesql,"results");
            }

            $results[0]['btypeid']      = $results[0]['btype'];
            $results[0]['btype']        = $btyperes[0]['typename'];

            $styleres[0]['typename'] = '';
            if($results[0]['style']){
                $stylesql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$results[0]['style']);
                $styleres = $dsql->dsqlOper($stylesql,"results");
            }

            $results[0]['styleid']      = $results[0]['style'];
            $results[0]['style']        = $styleres[0]['typename'];
//            $results[0]['stageid']      = explode(",", $results[0]['stageid']);
            $stageidarr                 = explode(",", $results[0]['stageid']);

//            $stageidarr = explode(",",$results[0]['stageid']);
            sort($stageidarr);
            $results[0]['stageid']      = $stageidarr;

            $stagearr                       = json_decode($results[0]['stage'],true) == '' ?array() : json_decode($results[0]['stage'],true);
            foreach ($stagearr as $k => &$v) {
                $listpic        =   explode("||", $v['imgList']);

                $listpicarr     = array();

                foreach ($listpic as $a => $b) {
                    if($b !=''){
                        $listpicarr[$a]['path'] = getFilePath($b);
                        $listpicarr[$a]['img']  = $b;
                    }
                }
                $v['listpicarr'] =  $listpicarr;
            }

            $results[0]['stagearr']         = $stagearr;


            $param = array(
                "service"     => "renovation",
                "template"    => "community",
                "id"          => $results[0]['communityid']
            );
            $results[0]["url"] = getUrlPath($param);
            // echo "<pre>";
            // var_dump($results[0]);die;
            return $results[0];

        }
    }
    /**
     * 设计师详细信息
     * @return array
     */
    public function teamDetail(){
        global $dsql;
        $param = $this->param;
        if(is_array($param)){
            $id = $param['id'];
        }else{
            $id = $this->param;
        }

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_team` WHERE `state` = 1 AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results[0]["photoSource"]  = $results[0]["photo"];
            $results[0]["photo"]        = getFilePath($results[0]["photo"]);

            $specialArr = array();
            $special = $results[0]['special'];
            $results[0]['specialids'] = $special;
            if(!empty($special)){
                $special = explode(",", $special);
                foreach($special as $k => $v){
                    if($v){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                        $typename  = $dsql->dsqlOper($archives, "results");
                        if($typename){
                            $specialArr[] = $typename[0]['typename'];
                        }
                    }
                }
            }
            $results[0]["special"] = join(",", $specialArr);

            $styleArr = array();
            $style = $results[0]['style'];
            $results[0]['styleids'] = $style;
            if(!empty($style)){
                $style = explode(",", $style);
                foreach($style as $k => $v){
                    if($v){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                        $typename  = $dsql->dsqlOper($archives, "results");
                        if($typename){
                            $styleArr[] = $typename[0]['typename'];
                        }
                    }
                }
            }
            $results[0]["style"] = join(",", $styleArr);

            $designersql = $dsql->SetQuery("SELECT `certifyState` FROM `#@__member` WHERE `id` = ". $results[0]["userid"]);
            $designerres = $dsql->dsqlOper($designersql,"results");

            $results[0]["certifyState"] = $designerres[0]['certifyState'];

//          $archives  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_case` WHERE `company` = ".$id);
//          $caseCount = $dsql->dsqlOper($archives, "totalCount");
//          $results[0]["case"] = $caseCount;

            $archives  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_diary` WHERE `fid` = ".$id ." AND `state` = 1 AND `ftype` = 2");
            $caseCount = $dsql->dsqlOper($archives, "totalCount");
            $results[0]["case"] = $caseCount;

            $this->param = $results[0]['company'];
            $results[0]['company'] = $this->storeDetail();


            //验证是否已经收藏
            $params = array(
                "module" => "renovation",
                "temp"   => "designer-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $results[0]['collect'] = $collect == "has" ? 1 : 0;


            unset($results[0]["weight"]);
            unset($results[0]["state"]);
            unset($results[0]["pubdate"]);

            $param = array(
                "service"     => "renovation",
                "template"    => "designer-detail",
                "id"          => $id
            );
            $results[0]["domain"] = getUrlPath($param);
            return $results[0];
        }
    }


    /**
     * 新增设计师
     * @return array
     */
    public function addTeam(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        global $langData;

        $userid         = $userLogin->getMemberID();
        $userDetail     = $userLogin->getMemberInfo();
        $param     = $this->param;

        $name    = filterSensitiveWords(addslashes($param['name']));
        $works   = (int)filterSensitiveWords(addslashes($param['works']));
//        $post    = filterSensitiveWords(addslashes($param['post']));
        $photo   = $param['photo'];
        $special = isset($param['special']) ? join(',',$param['special']) : '';
        $style   = isset($param['style']) ? join(',',$param['style']) : '';
        $idea    = filterSensitiveWords(addslashes($param['idea']));
        $note    = filterSensitiveWords(addslashes($param['note']));
        $tel     = filterSensitiveWords(addslashes($param['phone']));

        $pswd    = $param['pswd'];
        $areaCode= $param['areaCode'];
        $pubdate = GetMkTime(time());

        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];

        if(empty($name)){
            return array("state" => 200, "info" => '请输入姓名');
        }

//        if(empty($post)){
//            return array("state" => 200, "info" => '请输入职位');
//        }

        if(empty($photo)){
            return array("state" => 200, "info" => "请上传头像");
        }


        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$tel' || `phone` = '$tel'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 200, "info" => $langData['car'][7][16]);//该手机号已被注册，请重新填写
        }

        // 创建会员
        $pswd = $pswd ? $pswd : '';

        $password = $userLogin->_getSaltedHash($pswd);
        $regtime  = $pubdate;
        $regip    = GetIP();
        $regipaddr = getIpAddr($regip);
        $regfrom = getCurrentTerminal();

        $sql = $dsql->SetQuery("INSERT INTO `#@__member`
            (`mtype`, `username`, `password`, `phone`, `nickname`, `photo`, `state`, `purviews`, `regtime`, `regip`, `regipaddr`, `regfrom`)
            VALUES
            (1, '$tel', '$password', '$tel', '$name', '$photo', 1, '', '$regtime', '$regip', '$regipaddr', '$regfrom')");
        $uid = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($uid)) {
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_team` (`tel`,`areaCode`,`name`, `works`,`userid`,`post`, `photo`,`type` ,`company`, `special`, `style`, `idea`, `note`, `weight`, `click`, `state`, `pubdate`) VALUES ('$tel','$areaCode','$name', '$works','$uid','$post', '$photo', '1','$sid', '$special', '$style', '$idea', '$note', '1', '1', '1', '" . GetMkTime(time()) . "')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'renovation',
                    'template' => 'designer-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'renovation', 'designer', $aid, 'insert', '添加设计师('.$name.')', $url, $archives);

                $param = array(
                    'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——装修模块——用户:'.$userDetail['username'].'申请设计师',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                //后台微信通知
                updateAdminNotice("renovation", "team",$param);
                dataAsync("renovation",$aid,"designer");  // 装修门户-设计师-新增（公司）
                return "添加成功!";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }
        }

    }

    /**
     * 申请加入设计师
     * @return array
     */

    public function joinTeam(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid         = $userLogin->getMemberID();
        $userDetail     = $userLogin->getMemberInfo();
        $param     = $this->param;


        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $name    = filterSensitiveWords(addslashes($param['name']));
        $works   = filterSensitiveWords(addslashes($param['works']));
        $photo   = $param['photo'];
        $tel     = $param['tel'];
        $areaCode= $param['areaCode'];
        $type    = $param['type'];
        $company = $param['company'];

        $teamSql        = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_team` WHERE `userid` = ".$userid);
        $teamResult     = $dsql->dsqlOper($teamSql, "results");

        if($teamResult){
            return array("state" => 200, "info" => '已是设计师');
        }

        if(!$name){
            return array("state" => 200, "info" => '请输入姓名');
        }

        if(!$photo){
            return array("state" => 200, "info" => '请上传头像');
        }

        if(!$tel){
            return array("state" => 200, "info" => '请选填写手机号');
        }
        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_team` (`name`, `works`,`userid`,`photo`, `tel`,`areaCode`,`type`,`company`, `pubdate`) VALUES ('$name', '$works','$userid','$photo', '$tel','$areaCode', '$type', '$company', '".GetMkTime(time())."')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'renovation',
                'template' => 'designer-detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'designer', $aid, 'insert', '申请设计师('.$name.')', $url, $archives);

            $param = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——装修模块——用户:'.$userDetail['username'].'申请了设计师',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("renovation", "team",$param);
            dataAsync("renovation",$aid,"designer");  // 装修门户-设计师-新增（个人）
            return $aid;
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }

    /**
     * 新增工长
     * @return array
     */
    public function addForeman(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $siteCityInfo;
        $userid         = $userLogin->getMemberID();
        $userDetail     = $userLogin->getMemberInfo();
        $param     = $this->param;

        $cityName = $siteCityInfo['name'];
        $cityid   = $siteCityInfo['cityid'];
        $areaCode = $param['areaCode'];

        $name    = filterSensitiveWords(addslashes($param['name']));
        $works   = (int)filterSensitiveWords(addslashes($param['works']));
//        $post    = filterSensitiveWords(addslashes($param['post']));
        $photo   = $param['photo'];
        $special = isset($param['special']) ? join(',',$param['special']) : '';
        $style   = isset($param['style']) ? join(',',$param['style']) : '';
        $idea    = filterSensitiveWords(addslashes($param['idea']));
        $note    = filterSensitiveWords(addslashes($param['note']));
        $tel     = filterSensitiveWords(addslashes($param['phone']));

        $pswd    = $param['pswd'];
        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];
        if(empty($name)){
            return array("state" => 200, "info" => '请输入姓名');
        }

//        if(empty($post)){
//            return array("state" => 200, "info" => '请输入职位');
//        }

        if(empty($photo)){
            return array("state" => 200, "info" => "请上传头像");
        }


        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '$tel' || `phone` = '$tel'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            return array("state" => 200, "info" => $langData['car'][7][16]);//该手机号已被注册，请重新填写
        }

        // 创建会员
        $pswd = $pswd ? $pswd : '';

        $password = $userLogin->_getSaltedHash($pswd);
        $regtime  = $pubdate;
        $regip    = GetIP();
        $regipaddr = getIpAddr($regip);
        $regfrom = getCurrentTerminal();

        $sql = $dsql->SetQuery("INSERT INTO `#@__member`
            (`mtype`, `username`, `password`, `phone`, `nickname`, `photo`, `state`, `purviews`, `regtime`, `regip`, `regipaddr`, `regfrom`)
            VALUES
            (1, '$tel', '$password', '$tel', '$name', '$photo', 1, '', '$regtime', '$regip', '$regipaddr', '$regfrom')");
        $uid = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($uid)) {
            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_foreman`  (`name`, `works`,`userid`,`photo` ,`tel`,`areaCode`,`type`,`company`, `pubdate`) VALUES ('$name', '$works','$uid','$photo', '$tel','$areaCode', '1', '$sid', '".GetMkTime(time())."')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'renovation',
                    'template' => 'foreman-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'renovation', 'foreman', $aid, 'insert', '添加工长('.$name.')', $url, $archives);

                $param = array(
                    'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——装修模块——用户:'.$userDetail['username'].'申请工长',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                //后台微信通知
                updateAdminNotice("renovation", "foreman",$param);
                dataAsync("renovation",$aid,"foreman");  // 装修门户-工长-新增
                return "新增成功";
            } else {
                return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
            }
        }

    }


    /**
     * 申请加入工长
     * @return array
     */

    public function joinForeman(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid    = $userLogin->getMemberID();

        $userDetail     = $userLogin->getMemberInfo();
        $param     = $this->param;

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $name    = filterSensitiveWords(addslashes($param['name']));
        $works   = filterSensitiveWords(addslashes($param['works']));
        $photo   = $param['photo'];
        $tel     = $param['tel'];
        $areaCode= $param['areaCode'];
        $type    = $param['type'];
        $company = $param['company'];

        $teamSql        = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_foreman` WHERE `userid` = ".$userid);
        $teamResult     = $dsql->dsqlOper($teamSql, "results");

        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];

        if($teamResult){
            return array("state" => 200, "info" => '已是工长');
        }

        if(!$name){
            return array("state" => 200, "info" => '请输入姓名');
        }

        if(!$photo){
            return array("state" => 200, "info" => '请上传头像');
        }

        if(!$tel){
            return array("state" => 200, "info" => '请选填写手机号');
        }

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_foreman` (`name`, `works`,`userid`,`photo`, `tel`,`areaCode`,`type`,`company`, `pubdate`) VALUES ('$name', '$works','$userid','$photo', '$tel','$areaCode','$type', '$company', '".GetMkTime(time())."')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){

            $urlParam = array(
                'service' => 'renovation',
                'template' => 'foreman-detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'foreman', $aid, 'insert', '申请工长('.$name.')', $url, $archives);

            $param = array(
                'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——装修模块——用户:'.$userDetail['username'].'申请工长',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("renovation", "foreman",$param);
            dataAsync("renovation",$aid,"foreman");  // 装修门户-工长-申请（个人）
            return $aid;
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }




    /**
     * 修改设计师信息
     * @return array
     */
    public function editTeam(){
        global $dsql;
        global $userLogin;

        $userid  = $userLogin->getMemberID();
        $param   = $this->param;
        $id      = $param['id'];
        $name    = filterSensitiveWords(addslashes($param['name']));
        $works   = (int)$param['works'];
        $address = filterSensitiveWords(addslashes($param['address']));
        $studied = filterSensitiveWords(addslashes($param['studied']));
        $photo   = $param['photo'];
        $areaCode= (int)$param['areaCode'];
        $phone   = (int)$param['phone'];
        $addrid  = (int)$param['addrid'];
        $special = $param['special'];
        $style   = $param['style'];
        $designwork  = $param['designwork'];
        $idea    = filterSensitiveWords(addslashes($param['idea']));
        $note    = filterSensitiveWords(addslashes($param['note']));
        $pswd    = $param['password'];

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if($userResult){

            if(!verifyModuleAuth(array("module" => "renovation"))){
                return array("state" => 200, "info" => '商家权限验证失败！');
            }

            if($userResult[0]['state'] == 0){
                return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
            }

            if($userResult[0]['state'] == 2){
                return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
            }
        }else{

            $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_team` WHERE `userid` = ".$userid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if(!$userResult){
                return array("state" => 200, "info" => '您还不是设计师！');
            }

            if($userResult[0]['state'] == 0){
                return array("state" => 200, "info" => '您的设计师信息还在审核中，请通过审核后再发布！');
            }

            if($userResult[0]['state'] == 2){
                return array("state" => 200, "info" => '您的设计师信息审核失败，请通过审核后再发布！');
            }
        }

        if(!preg_match("/^1[34578]\d{9}$/", $phone)){
            return array("state" => 200, "info" => '请输入正确的手机号');
        }

        $sid = $userResult[0]['id'];

        $archives = $dsql->SetQuery("SELECT `id`,`userid` FROM `#@__renovation_team` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");

        if(!$results){
            return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
        }
        $password = $userLogin->_getSaltedHash($pswd);
        if($pswd !=''){
            $sql = $dsql->SetQuery("UPDATE `#@__member` SET `password` = '".$password."' WHERE `id` = ".$results[0]['userid']);
            $dsql->dsqlOper($sql,"update");
        }

        if(empty($name)){
            return array("state" => 200, "info" => '请输入姓名');
        }

//      if(empty($post)){
//          return array("state" => 200, "info" => '请输入职位');
//      }

        if(empty($photo)){
            return array("state" => 200, "info" => "请上传头像");
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_team` SET `name` = '$name',`areaCode` = '$areaCode',`designwork` = '$designwork' ,`studied` = '$studied' ,`works` = '$works', `userid` = '$userid',`tel` = '$phone',`photo` = '$photo', `special` = '$special', `style` = '$style', `idea` = '$idea', `note` = '$note',`addrid` = '$addrid',`address` = '$address' WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){

            $urlParam = array(
                'service' => 'renovation',
                'template' => 'designer-detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'designer', $id, 'update', '修改设计师('.$name.')', $url, $archives);

            dataAsync("renovation",$id,"designer");  // 装修门户-设计师-修改信息
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }



    /**
     * 删除设计师
     * @return array
     */
    public function delTeam(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 101, "info" => '公司信息不存在，删除失败！');
        }else{
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_team` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['company'] == $sid){

                //删除缩略图
                delPicFile($results['litpic'], "delThumb", "renovation");

                //删除图集
                $pics = explode(",", $results['pics']);
                foreach($pics as $k__ => $v__){
                    delPicFile($v__, "delAtlas", "renovation");
                }

                $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_team` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'renovation', 'designer', $id, 'delete', '删除设计师('.$results['name'].')', '', $archives);

                dataAsync("renovation",$id,"designer"); // 装修门户-设计师-删除
                return '删除成功！';

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '成员不存在，或已经删除！');
        }

    }



    /**
     * 修改工长信息
     * @return array
     */
    public function editForeman(){
        global $dsql;
        global $userLogin;

        $userid  = $userLogin->getMemberID();
        $param   = $this->param;
        $id      = $param['id'];
        $name    = $param['name'];
        $works   = (int)$param['works'];
        $post    = $param['post'];
        $photo   = $param['photo'];
        $foremanstyle   = (int)$param['foremanstyle'];
        $sex     = (int)$param['sex'];
        $areaCode= (int)$param['areaCode'];
        $contact = $param['phone'];
        $addrid  = (int)$param['addrid'];
        $address = trim($param['address']);
        $company = $param['company'];
        $age     = (int)$param['age'];
        $note    = $param['note'];

        //手机号码增加区号，国内版不显示
//        $contact = ($areaCode == '86' ? '' : $areaCode) . $contact;
        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if($userResult){

            if(!verifyModuleAuth(array("module" => "renovation"))){
                return array("state" => 200, "info" => '商家权限验证失败！');
            }
        }else{

            $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_foreman` WHERE `userid` = ".$userid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if(!$userResult){
                return array("state" => 200, "info" => '您还不是工长！');
            }

            if($userResult[0]['state'] == 0){
                return array("state" => 200, "info" => '您的工长信息还在审核中，请通过审核后再发布！');
            }

            if($userResult[0]['state'] == 2){
                return array("state" => 200, "info" => '您的工长信息审核失败，请通过审核后再发布！');
            }
        }



//        $sid = $userResult[0]['id'];
//        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `company` = $sid AND `id` = ".$id);
//        $results  = $dsql->dsqlOper($archives, "results");
//        if(!$results){
//            return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
//        }

        if(empty($name)){
            return array("state" => 200, "info" => '请输入姓名');
        }

//        if(empty($style)){
//            return array("state" => 200, "info" => '请选择工长类型');
//        }

        if(empty($photo)){
            return array("state" => 200, "info" => "请上传头像");
        }

        //保存到主表
        if(isset($param['note'])){
            $archives = $dsql->SetQuery("UPDATE `#@__renovation_foreman` SET `name` = '$name', `works` = '$works', `style` = '$foremanstyle',`sex` = '$sex', `tel` = '$contact',`areaCode` = '$areaCode', `photo` = '$photo', `age` = '$age', `addrid` = '$addrid',`address` = '$address', `note` = '$note' WHERE `id` = ".$id);
        }else{
            $archives = $dsql->SetQuery("UPDATE `#@__renovation_foreman` SET `name` = '$name', `works` = '$works', `style` = '$foremanstyle', `tel` = '$contact',`areaCode` = '$areaCode', `photo` = '$photo', `age` = '$age' WHERE `id` = ".$id);
        }        
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){

            $urlParam = array(
                'service' => 'renovation',
                'template' => 'foreman-detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'foreman', $id, 'update', '修改工长('.$name.')', $url, $archives);

            dataAsync("renovation",$id,"foreman");  // 装修门户-工长-编辑
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 删除工长
     * @return array
     */
    public function delForeman(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 101, "info" => '公司信息不存在，删除失败！');
        }else{
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_foreman` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['company'] == $sid){

                //删除缩略图
                delPicFile($results['litpic'], "delThumb", "renovation");

                //删除图集
                $pics = explode(",", $results['pics']);
                foreach($pics as $k__ => $v__){
                    delPicFile($v__, "delAtlas", "renovation");
                }

                $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_foreman` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'renovation', 'foreman', $id, 'delete', '删除工长('.$results['name'].')', '', $archives);

                dataAsync("renovation",$id,"foreman"); // 装修门户-工长-删除
                return '删除成功！';

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '成员不存在，或已经删除！');
        }

    }


    /**
     * 效果图
     * @return array
     */
    public function rcase(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $type = $jiastyle = $style = $comstyle = $apartment = $units = $kongjian = $area = $title = $designer = $company = $u = $orderby = $page = $pageSize = $where =  $groupby = "";


        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type      = $this->param['type'];
                $style     = $this->param['style'];
                $units     = $this->param['units'];
                $kongjian  = $this->param['kongjian'];
                $jubu      = $this->param['jubu'];
                $comstyle  = $this->param['comstyle'];
                $apartment = $this->param['apartment'];
                $area      = $this->param['area'];
                $title     = $this->param['title'];
                $designer  = $this->param['designer'];
                $company   = $this->param['company'];
                $u         = $this->param['u'];
                $state     = $this->param['state'];
                $orderby   = $this->param['orderby'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
            }
        }
        //会员中心请求
        if($u == 1){

            if($state != ''){
                $where1 = " AND `state` = ".$state;
            }
        }else{
            $where1 = " AND `state` = 1";
        }

        //数据共享
        // require(HUONIAOINC."/config/renovation.inc.php");
        // $dataShare = (int)$customDataShare;

        // if(!$dataShare){
        //     $cityid = getCityId($this->param['cityid']);
        //     if($cityid){
        //         $where2 = " AND `cityid` = $cityid";
        //     }
        // }

        $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1");
        $storeResult = $dsql->dsqlOper($storeSql, "results");
        $userid = array();
        if($storeResult) {
            foreach ($storeResult as $key => $store) {
//                $userSql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__renovation_team` WHERE `company` =" . $store['id']);
//                $userResult = $dsql->dsqlOper($userSql, "results");
//                if ($userResult) {
//                    foreach ($userResult as $ke => $user) {
//                        array_push($userid, $user['id']);
//                    }
//                }
//                if($userid){
//              $where .= " AND `designer` in (" . join(",", $userid) . ")";
//
//              }else{
//                  $where .= " AND 4 = 5";
//              }
                array_push($userid, $store['id']);
            }
            $where .= " AND `company` in (0, ".join(",", $userid).")";
//        }else{
//            $where .= " AND 2=3";
        }

        if(!empty($style)){
            $where .= " AND `style` = ".$style;
        }
        if(!empty($units)){
            $where .= " AND `units` = ".$units;
        }
        if(!empty($kongjian)){
            $where .= " AND FIND_IN_SET(".$kongjian.", `kongjian`)";
        }
        if(!empty($jubu)){
            $where .= " AND FIND_IN_SET(".$jubu.", `jubu`)";
        }
        if(!empty($comstyle)){
            $where .= " AND `comstyle` = ".$comstyle;
        }

        if($type != ""){
            $where .= " AND `type` = ".$type;
        }

        if(!empty($apartment)){
            $where .= " AND `apartment` = ".$apartment;
        }

        //面积
        if($area != ""){
            $area = explode(",", $area);
            if(empty($area[0])){
                $where .= " AND `area` < " . $area[1];
            }elseif(empty($price[1])){
                $where .= " AND `area` > " . $area[0];
            }else{
                $where .= " AND `area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //关键词
        if(!empty($title)){
            $where .= " AND `title` like '%$title%'";
        }

        if(!empty($designer)){
            $where .= " AND `designer` = ".$designer;
        }

        //会员中心请求
        if($u == 1){

            $uid = $userLogin->getMemberID();

            if(!verifyModuleAuth(array("module" => "renovation"))){
                return array("state" => 200, "info" => '商家权限验证失败！');
            }

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
            $storeRes = $dsql->dsqlOper($sql, "results");
            if($storeRes){
                $company = $storeRes[0]['id'];
            }else{
                $company = "-1";
            }

        }

        if(!empty($company)){
//          $teamids = array();
//          $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `company` = ".$company);
//          $results  = $dsql->dsqlOper($archives, "results");
//          if($results){
//              foreach($results as $k => $v){
//                  $teamids[] = $v['id'];
//              }
//          }
//          if(!empty($teamids)){
//              $where .= " AND `designer` in (".join(",", $teamids).")";
//          }else{
//              $where .= " AND 1 = 2";
//          }
            $where .= " AND `company` = ".$company;
        }

        $order = " ORDER BY `weight` DESC, `id` DESC";
        if($orderby == "click"){
            $order = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `click`,`pics`, `pubdate`, `type`, `style`, `area` FROM `#@__renovation_case` WHERE  1 = 1".$where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //已审核
        $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

        //未审核
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

        //审核拒绝
        $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");

        if($u != 1){
            $totalCount = $state1;
        }

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        //会员中心请求
        if($u == 1){
            $pageinfo['state1'] = $state1;
            $pageinfo['state0'] = $state0;
            $pageinfo['state2'] = $state2;            
        }

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

        $list = array();
        $RenrenCrypt = new RenrenCrypt();

        if($results){
            foreach($results as $key => $val){
                $results[$key]["litpic"] = getFilePath($val["litpic"]);

                $fid = $RenrenCrypt->php_decrypt(base64_decode($val["litpic"]));
                $picwidth = $picheight = 0;
                if(is_numeric($fid)){
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }else{
                    $rpic = str_replace('/uploads', '', $val["litpic"]);
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }

                $pics   = explode(',', $val['pics']);
                $picarr = array();
                $results[$key]['countpics']  = count($pics);
                $results[$key]['picwidth']   = $picwidth == 0 ? 196 : $picwidth ;
                $results[$key]['picheight']  = $picheight  == 0 ? 196 : $picheight  ;
                foreach ($pics as $k => $v){
                    $picarr[$k]['picpath']  = getFilePath($v);
                }
                $results[$key]['picarr']  = $picarr;
                $param = array(
                    "service"     => "renovation",
                    "template"    => "albums-detail",
                    "id"          => $val['id']
                );
                $results[$key]['url'] = getUrlPath($param);

                $style = '';
                if($val['style']){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$val['style']);
                    $typename  = $dsql->dsqlOper($archives, "results");
                    if($typename){
                        $style = $typename[0]['typename'];
                    }
                }
                $results[$key]['style'] = $style;

                array_push($list, $results[$key]);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }



    /*
        文章动态
    */

    public function article(){
        global $dsql;
        $pageinfo = $list = array();
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $fid       = (int)$this->param['fid'];
                $u         = (int)$this->param['u'];
                $type      = (int)($_REQUEST['type']!=''   ? $_REQUEST['type'] : $this->param['type']);
                $state     = (int)($_REQUEST['state']!=''  ? $_REQUEST['state'] : $this->param['state']);
                $page      = (int)$this->param['page'];
                $pageSize  = (int)$this->param['pageSize'];
				$keywords  = trim($this->param['keywords']);
            }
        }

        if(!is_numeric($type)) return array("state" => 200, "info" => '格式错误！');

        $order = " ORDER BY `pubdate` DESC";

        $where = "";
        if($u !=1){
            $where = " AND `state` = 1";
        }

        if($state!=''){
            $where = " AND `state` = ".$state;
        }

        if (!empty($keywords)) {
            $where .= " AND `title` like '%" . $keywords . "%'";
        }

        $where .= " AND `fid` = $fid AND `type` =$type";
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`,`fid`, `userid`, `type`, `title`, `note`,`litpic`,`state`,`pubdate`,`click` FROM `#@__renovation_article` WHERE 1 =1 ".$where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

        //已审核
        $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

        //未审核
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

        //审核拒绝
        $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "state1"        => $state1,
            "state0"        => $state0,
            "state2"        => $state2,
        );

        $atpage = $pageSize*($page-1);
        $where1 = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$order.$where1, "results");

        if($results){
            foreach ($results as $k => $v) {
                if(!empty($v['litpic'])){
                    $litpic  = explode(",", $v['litpic']);
                }

                $param = array(
                    "service"     => "renovation",
                    "template"    => $v['type'] == 0 || isMobile() ? "company-dynamic-detail" : ($v['type'] == 1 ? "foreman-article-detail" : "designer-article-detail"),
                    "id"          => $v['id']
                );

                $results[$k]['url']  = getUrlPath($param);

                $results[$k]['note'] = cn_substrR(strip_tags($v["note"]), 100);

                $results[$k]['litpic'] =$litpic ? getFilePath($litpic[0]) :"";
                array_push($list, $results[$k]);
            }

        }
        // echo "<pre>";
        // var_dump($list);die;
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /*
     *
     * 文章动态详情
     * */
    public function articleDetail(){
        global $dsql;
        $param = $this->param;
        if(is_array($param)){

            $id = $param['id'];
        }else{
            $id = $param;
        }
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_article` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");

        if($results){
            $picarr = array();
            $pic    = explode(",",$results[0]['litpic']);
            foreach ($pic as $k =>$v)
            {
                $picarr[$k]['picpath'] = getFilePath($v);
                $picarr[$k]['pic'] = $v;

            }
            $results[0]['litpicarr'] = $picarr;
            $results[0]['pubdate']   = date('Y-m-d H:i:s',$results[0]['pubdate']);


            return $results[0];
        }

    }


    /*
     * 新增文章动态
     * */
    public function  addArticle(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $param = $this->param;

                $title      = $param['title'];
                $fid        = $param['fid'];
                $ftype      = (int)$param['ftype'];
                $body       = $param['body'];
                $imgList    = $param['imgList'];

                $userid = $userLogin->getMemberID();
                $userDetail  = $userLogin->getMemberInfo();

                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                if($userid == -1){
                    return array("state" => 200, "info" => '登录超时，请重新登录！');
                }


//                if(!verifyModuleAuth(array("module" => "renovation"))){
//                    return array("state" => 200, "info" => '商家权限验证失败！');
//                }


                if(empty($fid)){
                    return array("state" => 200, "info" => '参数错误,无发布者信息');
                }
                if($ftype ==1){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `id` = ".$fid);
                    $ret = $dsql->dsqlOper($sql, "results");
                }elseif($ftype ==2){

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `id` = ".$fid);
                    $ret = $dsql->dsqlOper($sql, "results");
                }elseif($ftype == 0){

                    $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
                    $ret = $dsql->dsqlOper($userSql, "results");

                    if($ret[0]['state'] == 0){
                        return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
                    }

                    if($ret[0]['state'] == 2){
                        return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
                    }
                }
                if(!$ret){
                    return array("state" => 200, "info" => '设计师或工长不存在，请确认后重试！');
                }

                if(empty($title)){
                    return array("state" => 200, "info" => '请输入案例标题');
                }

//                if(empty($imgList)){
//                    return array("state" => 200, "info" => '请上传户型图');
//                }

                if(empty($body)){
                    return array("state" => 200, "info" => "请输入文章内容");
                }
                include HUONIAOINC."/config/renovation.inc.php";
                $state  = (int)$customFabuCheck;
                $sql = $dsql->SetQuery("INSERT INTO `#@__renovation_article` (`fid`,`userid`,`type`,`title`,`note`,`litpic`,`state`,`pubdate`) VALUES ('$fid','$userid','$ftype','$title','$body','$imgList','$state','".GetMkTime(time())."')");
                $aid = $dsql->dsqlOper($sql,"lastid");
                if(is_numeric($aid)){

                    $urlParam = array(
                        'service' => 'renovation',
                        'template' => 'designer-article-detail',
                        'id' => $aid
                    );
                    $url = getUrlPath($urlParam);
                
                    //记录用户行为日志
                    memberLog($userid, 'renovation', 'article', $aid, 'insert', '添加动态('.$title.')', $url, $sql);

                    $param = array(
                        'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                        'cityid' => $cityid,
                        'notify' => '管理员消息通知',
                        'fields' =>array(
                            'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'新增文章动态',
                            'date' => date("Y-m-d H:i:s", time()),
                        )
                    );
                    updateAdminNotice("renovation", "article",$param);
                    return  $aid;
                }else{
                    return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
                }
            }
        }
    }
    /**
     * 效果图详细信息
     * @return array
     */
    public function caseDetail(){
        global $dsql;
        $param = $this->param;
        if(is_array($param)){

            $id = $param['id'];
        }else{
            $id = $param;
        }
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_case` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results[0]["litpicSource"] = $results[0]["litpic"];
            $results[0]["litpic"] = getFilePath($results[0]["litpic"]);

            $style = $results[0]['style'];

            if($results[0]['type'] ==0){

                $results[0]['typename'] = '家装';
            }else{
                $results[0]['typename'] = '公装';
            }

            $price  = $results[0]['price'];

            if(!empty($price)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$price);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $pricename = $typename[0]['typename'];
                }
            }
            $results[0]["pricename"]   = $pricename;
            if(!empty($style)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$style);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $style = $typename[0]['typename'];
                }
            }else{
                $style = "";
            }
            $results[0]["styleid"] = $results[0]["style"];
            $results[0]["style"]   = $style;

            $units = $results[0]['units'];
            if(!empty($units)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$units);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $units = $typename[0]['typename'];
                }
            }
            $results[0]["unitsid"] = $results[0]["units"];
            $results[0]["units"] = $units;

            $comstyle = $results[0]['comstyle'];
            if(!empty($comstyle)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$comstyle);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $comstyle = $typename[0]['typename'];
                }
            }else{
                $comstyle = "";
            }
            $results[0]["comstyleid"] = $results[0]["comstyle"];
            $results[0]["comstyle"] = $comstyle;

            $apartment = $results[0]['apartment'];
            if(!empty($apartment)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$apartment);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $apartment = $typename[0]['typename'];
                }
            }
            $results[0]["apartmentid"] = $results[0]["apartment"];
            $results[0]["apartment"] = $apartment;

            $picsArr = array();
            $pics = $results[0]['pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach($pics as $key => $val){
                    $picsArr[$key]['pathSource'] = $val;
                    $picsArr[$key]['path'] = getFilePath($val);
                }
            }
            $results[0]['picssoure'] = $results[0]['pics'];
            $results[0]["pics"]      = $picsArr;

            $this->param = $results[0]['designer'];
            $results[0]['designer'] = $this->teamDetail();


            $kongjian       = $results[0]['kongjian'];

            $kongjianarr    = array();
            if(!empty($kongjian)){
                $kongjian = explode(",", $kongjian);
                $results[0]['kongjianidarr'] = $kongjian;
                foreach ($kongjian as $k => $v) {
                    if($v){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                        $typename  = $dsql->dsqlOper($archives, "results");

                        if($typename){
                            $kongjianarr[$k] = $typename[0]['typename'];
                        }
                    }
                }
            }
            $results[0]["kongjianname"] = implode(",", $kongjianarr);

            $jubu       = $results[0]['jubu'];

            $jubuarr    = array();
            if(!empty($jubu)){
                $jubu = explode(",", $jubu);
                $results[0]['jubuidarr'] = $jubu;
                foreach ($jubu as $k => $v) {
                    if($v){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$v);
                        $typename  = $dsql->dsqlOper($archives, "results");

                        if($typename){
                            $jubuarr[$k] = $typename[0]['typename'];
                        }
                    }
                }
            }
            $results[0]["jubuname"] = implode(",", $jubuarr);
            return $results[0];
        }
    }


    /**
     * 新增效果图
     * @return array
     */
    public function addAlbums(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid     = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        $param     = $this->param;
        $designer = (int)$param['designer'];
        $title    = filterSensitiveWords(addslashes($param['title']));
        $type     = (int)$param['type'];

        $style    = 0;
        $units    = 0;
        $kongjian = "";
        $jubu     = "";
        $comstyle = 0;

        if($type == 0){
            $style      = (int)$param['style'];
            $units      = (int)$param['units'];
            if(is_array($param['kongjian'])){
                $kongjian = implode(',',$param['kongjian']);
            }else{

                $kongjian   = $param['kongjian'];
            }
            if(is_array($param['jubu'])){
                $jubu = implode(',',$param['jubu']);
            }else{

                $jubu   = $param['jubu'];
            }
        }else{
            $comstyle = (int)$param['comstyle'];
        }

        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];

        $litpic  = $param['litpic'];
        $price   = $param['price'];
        $imglist = $param['imglist'];
        $area    = (float)$param['area'];
        $apartment = (int)$param['apartment'];
        $note    = filterSensitiveWords(addslashes($param['note']));
        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

//        if(!verifyModuleAuth(array("module" => "renovation"))){
//            return array("state" => 200, "info" => '商家权限验证失败！');
//        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];

        if(empty($title)){
            return array("state" => 200, "info" => '请输入效果图标题');
        }

//      if(empty($litpic)){
//          return array("state" => 200, "info" => '请上传缩略图');
//      }

        if(empty($price)){
            return array("state" => 200, "info" => '请选择报价');
        }

        if(empty($imglist)){
            return array("state" => 200, "info" => "请上传图集");
        }

        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_case` (`title`, `type`, `kongjian`, `jubu`, `comstyle`, `style`, `company`, `apartment`, `units`, `area`, `state`, `note`,`price`,`pics`, `pubdate`) VALUES ('$title', '$type', '$kongjian', '$jubu', '$comstyle', '$style', '$sid', '$apartment', '$units', '$area', '$state', '$note','$price','$imglist', '".GetMkTime(time())."')");
        $aid = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'case', $aid, 'insert', '添加效果图('.$title.')', '', $archives);

            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'新增效果图',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("renovation", "albums",$param);
            return $aid;
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }



    /**
     * 修改效果图
     * @return array
     */
    public function editAlbums(){
        global $dsql;
        global $userLogin;

        $userid    = $userLogin->getMemberID();
        $param     = $this->param;

        $id       = (int)$param['id'];
        $designer = (int)$param['designer'];
        $title    = filterSensitiveWords(addslashes($param['title']));
        $type     = (int)$param['type'];

        $style    = 0;
        $units    = 0;
        $kongjian = "";
        $jubu     = "";
        $comstyle = 0;

        if($type == 0){
            $style      = (int)$param['style'];
            $units      = (int)$param['units'];
            $kongjian   = $param['kongjian'] ? implode(',',$param['kongjian']): '';
            $jubu       = $param['jubu']? implode(',',$param['jubu']): '';
        }else{
            $comstyle = (int)$param['comstyle'];
        }

        $litpic  = $param['litpic'];
        $imglist = $param['imglist'];
        $area    = (float)$param['area'];
        $apartment = (int)$param['apartment'];
        $note    = filterSensitiveWords(addslashes($param['note']));
        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if(!$userResult){
            return array("state" => 200, "info" => '您还未开通装修公司！');
        }

//        if(!verifyModuleAuth(array("module" => "renovation"))){
//            return array("state" => 200, "info" => '商家权限验证失败！');
//        }

        if($userResult[0]['state'] == 0){
            return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
        }

        if($userResult[0]['state'] == 2){
            return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];




        if(empty($title)){
            return array("state" => 200, "info" => '请输入效果图标题');
        }

//      if(empty($litpic)){
//          return array("state" => 200, "info" => '请上传缩略图');
//      }

        if(empty($imglist)){
            return array("state" => 200, "info" => "请上传图集");
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_case` SET `title` = '$title', `type` = '$type', `kongjian` = '$kongjian', `jubu` = '$jubu', `comstyle` = '$comstyle', `style` = '$style', `litpic` = '$litpic', `company` = '$sid', `apartment` = '$apartment', `units` = '$units', `area` = '$area', `note` = '$note', `pics` = '$imglist' WHERE `id` = ".$id);
//      var_dump($archives);die;
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'case', $id, 'update', '修改效果图('.$title.')', '', $archives);

            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 删除效果图
     * @return array
     */
    public function delAlbums(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 101, "info" => '公司信息不存在，删除失败！');
        }else{
            $sid = $ret[0]['id'];
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_case` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];


            if($results['company'] == $sid){

                //删除缩略图
                delPicFile($results['litpic'], "delThumb", "renovation");

                //删除图集
                $pics = explode(",", $results['pics']);
                foreach($pics as $k => $v){
                    delPicFile($v, "delAtlas", "renovation");
                }

                $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_case` WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'renovation', 'case', $id, 'delete', '删除效果图('.$results['title'].')', '', $archives);

                return '删除成功！';

            }else{
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        }else{
            return array("state" => 101, "info" => '成员不存在，或已经删除！');
        }

    }


    /**
     * 装修案例
     * @return array
     */
    public function diary(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $type = $btype = $style = $units = $area = $price = $comstyle = $addrid = $u = $company = $designer = $community = $title = $orderby = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type      = $this->param['type'];
                $btype     = $this->param['btype'];
                $style     = $this->param['style'];
                $units     = $this->param['units'];
                $comstyle  = $this->param['comstyle'];
                $addrid    = $this->param['addrid'];
                $area      = $this->param['area'];
                $price     = $this->param['price'];
                $u         = $this->param['u'];
                $state     = $this->param['state'];
                $company   = $this->param['company'];
                $designer  = $this->param['designer'];
                $ftype     = $this->param['ftype'];
                $community = $this->param['community'];
                $title    = trim($this->param['title']);
                $title    = $title ? $title : trim($this->param['keywords']);
                $orderby   = $this->param['orderby'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
            }
        }


        //会员中心请求
        if($u == 1){
//
//            $uid = $userLogin->getMemberID();
//
//            if(!verifyModuleAuth(array("module" => "renovation"))){
//                return array("state" => 200, "info" => '商家权限验证失败！');
//            }
//
//            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
//            $storeRes = $dsql->dsqlOper($sql, "results");
//            if($storeRes){
//                $company = $storeRes[0]['id'];
//            }else{
//                $company = "-1";
//            }
            if($state != ''){
                $where1 = " AND `state` = ".$state;
            }
            $uid = $userLogin->getMemberID();

            if($ftype ==0){

                if(!verifyModuleAuth(array("module" => "renovation"))){
                    return array("state" => 200, "info" => '商家权限验证失败！');
                }

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
                $storeRes = $dsql->dsqlOper($sql, "results");
                if($storeRes){
                    $company = $storeRes[0]['id'];
                }else{
                    $company = "-1";
                }
            }
        }else{
            $where1 = " AND `state` = 1";
        }

        //数据共享
        require(HUONIAOINC."/config/renovation.inc.php");
        $dataShare = (int)$customDataShare;

        $cityWhere = "1 = 1";
        $_cityWhere = '';
        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            $cityWhere = "`cityid` = " . $cityid;
            $_cityWhere = " AND m.`cityid` = " . $cityid;
        }


        if(!$u && !$designer){
            $fidArr = array();

            //分站数据筛选，如果需要注释，请在此写明原因
            //1. 公司类型的
            $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1 AND ".$cityWhere);
            $storeResult = $dsql->dsqlOper($storeSql, "results");
            if($storeResult) {
                $storeidArr = array();
                foreach ($storeResult as $key => $store) {

                    array_push($storeidArr, $store['id']);

                    //2. 设计师类型的
                    $userSql = $dsql->SetQuery("SELECT t.`id`, t.`name` FROM `#@__renovation_team` t LEFT JOIN `#@__member` m ON m.`id` = t.`userid` WHERE (t.`type` = 1 AND t.`company` = " . $store['id'] . ") OR (t.`type` = 0".$_cityWhere.")");
                    $userResult = $dsql->dsqlOper($userSql, "results");
                    if ($userResult) {
                        $userid = array();
                        foreach ($userResult as $ke => $user) {
                            array_push($userid, $user['id']);
                        }

                        if($userid){
                            array_push($fidArr, "(`ftype` = 2 AND `fid` in (".join(',', $userid)."))");
                        }else{
                            array_push($fidArr, "8 = 9");
                        }

                    }else{
                        array_push($fidArr, "6 = 7");
                    }


                    //3. 工长
                    $userSql = $dsql->SetQuery("SELECT t.`id`, t.`name` FROM `#@__renovation_foreman` t LEFT JOIN `#@__member` m ON m.`id` = t.`userid` WHERE (t.`type` = 1 AND t.`company` = " . $store['id'] . ") OR (t.`type` = 0".$_cityWhere.")");
                    $userResult = $dsql->dsqlOper($userSql, "results");
                    if ($userResult) {
                        $userid = array();
                        foreach ($userResult as $ke => $user) {
                            array_push($userid, $user['id']);
                        }

                        if($userid){
                            array_push($fidArr, "(`ftype` = 1 AND `fid` in (".join(',', $userid)."))");
                        }else{
                            array_push($fidArr, "12 = 13");
                        }

                    }else{
                        array_push($fidArr, "10 = 11");
                    }
                }

                if($storeidArr){
                    array_push($fidArr, "(`ftype` = 0 AND `fid` in (".join(',', $storeidArr)."))");
                }else{
                    array_push($fidArr, "4 = 5");
                }

            }else{
                array_push($fidArr, "2 = 3");
            }

            $where .= " AND (" . join(' OR ', $fidArr) . ")";
        }


        if(!empty($style)){
            $where .= " AND `style` = ".$style;
        }
        if(!empty($units)){
            $where .= " AND `units` = ".$units;
        }
        if(!empty($comstyle)){
            $where .= " AND `comstyle` = ".$comstyle;
        }

        if(!empty($type)){
            $where .= " AND `type` = ".$type;

            if($type == 0){
//              if(!empty($style)){
//                  $where .= " AND `style` = ".$style;
//              }
//              if(!empty($units)){
//                  $where .= " AND `units` = ".$units;
//              }
            }elseif($type == 1){
//              if(!empty($comstyle)){
//                  $where .= " AND `comstyle` = ".$comstyle;
//              }

                //遍历地区
                if(!empty($addrid)){
                    if($dsql->getTypeList($addrid, "site_area")){
                        $addridArr = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                        $addridArr = join(',',$addridArr);
                        $lower = $addrid.",".$addridArr;
                    }else{
                        $lower = $addrid;
                    }
                    $where .= " AND `addrid` in ($lower)";
                }
            }
        }


        if(!empty($btype)){
            $where .= " AND `btype` = ".$btype;
        }

        //面积
        if($area != ""){
            $area = explode(",", $area);
            if(empty($area[0])){
                $where .= " AND `area` < " . $area[1];
            }elseif(empty($price[1])){
                $where .= " AND `area` > " . $area[0];
            }else{
                $where .= " AND `area` BETWEEN " . $area[0] . " AND " . $area[1];
            }
        }

        //价格
        if($price != ""){
            $price = explode(",", $price);
            if(empty($price[0])){
                $where .= " AND `price` < " . $price[1];
            }elseif(empty($price[1])){
                $where .= " AND `price` > " . $price[0];
            }else{
                $where .= " AND `price` BETWEEN " . $price[0] . " AND " . $price[1];
            }
        }

        if(!empty($designer)){
            $where .= " AND `fid` = ".$designer;
        }

        if(!empty($ftype)){
            $where .= " AND `ftype` = ".$ftype;
        }




        if(!empty($company)){
            // $teamids = array();
            // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `company` = ".$company);
            // $results  = $dsql->dsqlOper($archives, "results");
            // if($results){
            //  foreach($results as $k => $v){
            //      $teamids[] = $v['id'];
            //  }
            // }
            // $where .= " AND `company` in (".join(",", $teamids).")";
            $where .= " AND `company` = ".$company;

        }

        if(!empty($community)){
            $where .= " AND `communityid` = ".$community;
        }

        if(!empty($title)){
            $where .= " AND `title` like '%".$title."%'";
        }

        $order = " ORDER BY `weight` DESC, `id` DESC";
        if($orderby == "click"){
            $order = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $archives = $dsql->SetQuery("SELECT `id`, `title`, `type`, `btype`, `litpic`, `style`, `units`, `comstyle`, `area`, `price`, `fid`,`ftype` ,`click`, `state`,`pubdate` FROM `#@__renovation_diary` WHERE  1 = 1 ".$where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

        //已审核
        $state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");

        //未审核
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");

        //审核拒绝
        $state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize"      => $pageSize,
            "totalPage"     => $totalPage,
            "totalCount"    => $totalCount,
            "state1"        => $state1,
            "state0"        => $state0,
            "state2"        => $state2,
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");

        $list = array();
        $RenrenCrypt = new RenrenCrypt();
        if($results){
            foreach($results as $key => $val){
                $list[$key]['id']       = $val['id'];
                $list[$key]['title']    = $val['title'];
                $list[$key]['type']     = $val['type'];
                $list[$key]['area']     = $val['area'];
                $list[$key]['price']    = $val['price'];
                $list[$key]['click']    = $val['click'];
                $list[$key]['state']    = $val['state'];
                $list[$key]['ftype']    = $val['ftype'];
                $list[$key]["litpic"]   = getFilePath($val["litpic"]);

                $fid = $RenrenCrypt->php_decrypt(base64_decode($val["litpic"]));
                $picwidth = $picheight = 0;
                if(is_numeric($fid)){
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }else{
                    $rpic = str_replace('/uploads', '', $val["litpic"]);
                    $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $picwidth = $ret[0]['width'];
                        $picheight = $ret[0]['height'];
                    }
                }
                $list[$key]['picwidth'] = $picwidth;
                $list[$key]['picheight'] = $picheight;

                $list[$key]['pubdate'] = $val['pubdate'];

                $btype = $val['btype'];
                if(!empty($btype)){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$btype);
                    $typename  = $dsql->dsqlOper($archives, "results");
                    if($typename){
                        $btype = $typename[0]['typename'];
                    }
                }
                $list[$key]["btype"] = $btype;

                //风格
                $style = $val['style'];
                if(!empty($style)){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$style);
                    $typename  = $dsql->dsqlOper($archives, "results");
                    if($typename){
                        $style = $typename[0]['typename'];
                    }
                }
                $list[$key]["style"] = $style;
                //家装
                if($val['type'] == 0){

                    //户型
                    $units = $val['units'];
                    if(!empty($units)){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$units);
                        $typename  = $dsql->dsqlOper($archives, "results");
                        if($typename){
                            $units = $typename[0]['typename'];
                        }
                    }
                    $list[$key]["units"] = $units;

                }

                //公装
                if($val['type'] == 0){

                    //类型
                    $comstyle = $val['comstyle'];
                    if(!empty($comstyle)){
                        $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$comstyle);
                        $typename  = $dsql->dsqlOper($archives, "results");
                        if($typename){
                            $comstyle = $typename[0]['typename'];
                        }
                    }
                    $list[$key]["comstyle"] = $comstyle;
                }

                //设计师
                if($val['ftype'] == 1){

                    $this->param = $val['fid'];
                    $list[$key]['designer'] = $this->foremanDetail();
                }elseif ($val['ftype'] ==2){

                    $this->param = $val['fid'];
                    $list[$key]['designer'] = $this->teamDetail();
                }else{
                    $this->param = $val['fid'];
                    $list[$key]['designer'] = $this->storeDetail();
                }

                $param = array(
                    "service"     => "renovation",
                    "template"    => "case-detail",
                    "id"          => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 施工案例详细信息
     * @return array
     */
    public function diaryDetail(){
        global $dsql;
        global $userLogin;

        $id = $this->param;

        if(is_array($id)) {
            $id      = $id['id'];
        }
        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $where = "";

        if ($userLogin->getUserID() == -1) {

            $where = " AND `state` = 1";

            //如果没有登录再验证会员是否已经登录
            if ($userLogin->getMemberID() == -1) {
                $where = " AND `state` = 1";
            } else {
                $where = " AND (`state` = 1 OR `userid` = " . $userLogin->getMemberID() . ")";
            }

        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_diary` WHERE `id` = $id".$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results[0]["litpicSource"]     = $results[0]["litpic"];
            $results[0]["litpicpath"]       = getFilePath($results[0]["litpic"]);
            $results[0]["litpic"]           = $results[0]["litpic"];
            $results[0]["unitspicSource"]   = $results[0]["unitspic"];

            $btype = $results[0]['btype'];
            if(!empty($btype)){
                $archives   = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$btype);
                $typename   = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $btype  = $typename[0]['typename'];
                }
            }
            $results[0]["btypeid"]  = $results[0]['btype'];
            $results[0]["btype"]    = $btype;

            //风格
            $style = $results[0]['style'];
            if(!empty($style)){
                $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$style);
                $typename  = $dsql->dsqlOper($archives, "results");
                if($typename){
                    $style = $typename[0]['typename'];
                }
            }
            $results[0]["styleid"] = $results[0]['style'];
            $results[0]["style"] = $style;
            //家装
            if($results[0]['type'] == 0){


                //户型
                $units = $results[0]['units'];
                if(!empty($units)){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$units);
                    $typename  = $dsql->dsqlOper($archives, "results");
                    if($typename){
                        $units = $typename[0]['typename'];
                    }
                }
                $results[0]["unitsid"] = $results[0]['units'];
//                var_dump($results[0]['unitsid']);die;
                $results[0]["units"] = $units;

                $results[0]["typename"] = "家装";

            }

            //公装
            if($results[0]['type'] == 1){

                //类型
                $comstyle = $results[0]['comstyle'];
                if(!empty($comstyle)){
                    $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$comstyle);
                    $typename  = $dsql->dsqlOper($archives, "results");
                    if($typename){
                        $comstyle = $typename[0]['typename'];
                    }
                }
                $results[0]["comstyleid"] = $results[0]['comstyle'];
                $results[0]["comstyle"] = $comstyle;

                $results[0]["typename"] = "公装";
            }

            //小区详细信息
            if($results[0]['communityid'] != 0){
                $this->param = $results[0]['communityid'];
                $results[0]['community'] = $this->communityDetail();
            }


            //设计师
            if($results[0]["ftype"] ==0){
                $this->param = $results[0]['fid'];

                $results[0]['author']  = $this->storeDetail();

            }elseif($results[0]["ftype"] ==1){
                $this->param = $results[0]['fid'];

                $results[0]['author']  = $this->foremanDetail();

            }else{
                $this->param = $results[0]['fid'];

                $results[0]['author']  = $this->teamDetail();

            }

//           echo "<pre>";
//           var_dump($results[0]['author']);die;

            // //设计方案
            // $caseName = "";
            // $sql = $dsql->SetQuery("SELECT `title` FROM `#@__renovation_case` WHERE `id` = ".$results[0]['case']);
            // $ret = $dsql->dsqlOper($sql, "results");
            // if($ret){
            //  $caseName = $ret[0]['title'];
            // }
            // $results[0]['caseName'] = $caseName;

            $picsArr = array();
            $pics = $results[0]['pics'];
            if(!empty($pics)){
                $pics = explode(",", $pics);
                foreach($pics as $key => $val){
                    $picsArr[$key]['pathSource'] = $val;
                    $picsArr[$key]['path'] = getFilePath($val);
                }
            }
            $results[0]["picsarr"] = $picsArr;

            $unitspicArr = array();
            $unitspic = $results[0]['unitspic'];
            if(!empty($unitspic)){
                $unitspic = explode(",", $unitspic);
                foreach($unitspic as $key => $val){
                    $unitspicArr[$key]['pathSource'] = $val;
                    $unitspicArr[$key]['path']       = getFilePath($val);
                }
            }

            $results[0]["unitspicarr"] = $unitspicArr;

            unset($results[0]['weight']);
//            unset($results[0]['state']);
            unset($results[0]['pubdate']);


            //验证是否已经收藏
            $params = array(
                "module" => "renovation",
                "temp"   => "case-detail",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $results[0]['collect'] = $collect == "has" ? 1 : 0;

            return $results[0];
        }
    }


    /**
     * 日记内容列表
     * @return array
     */
    public function diaryList(){
        global $dsql;
        $pageinfo = $list = array();
        $aid = $page = $orderby = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $aid       = $this->param['aid'];
                $orderby   = $this->param['orderby'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
            }
        }

        if(!is_numeric($aid)) return array("state" => 200, "info" => '格式错误！');

        $where = " WHERE `state` = 0 AND `diary` = ".$aid;


        $orderby = " ORDER BY `id` ASC";
        if(!empty($orderby)){
            $orderby = " ORDER BY `id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `body`, `pubdate` FROM `#@__renovation_diarylist`".$where.$orderby);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        return array("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 新增案例
     * @return array
     */
    public function addCase(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid     = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();

        $param     = $this->param;
        $designer = (int)$param['designer'];
        $case     = (int)$param['case'];
        $title    = filterSensitiveWords(addslashes($param['title']));
        $type     = (int)$param['type'];
        $btype    = (int)$param['btype'];
        $area     = (float)$param['area'];
        $price    = (float)$param['price'];
        $units    = (int)$param['units'];
        $comstyle = (int)$param['comstyle'];
        $style    = (int)$param['style'];

        $community = (int)$param['community'];


        $unitspic = $param['layoutimglist'];
        $pics     = $param['albumsimglist'];
        $litpic   = $param['litpic'];

        $fid      = $param['fid'];
        $company  = (int)$param['company'];
        $ftype    = $param['ftype'];

        $cityName = $siteCityInfo['name'];
        $cityid   = $siteCityInfo['cityid'];

        $began   = !empty($param['began']) ? GetMkTime($param['began']) : 0;
        $end     = !empty($param['end']) ? GetMkTime($param['end']) : 0;
        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if($ftype ==0){
            if(!verifyModuleAuth(array("module" => "renovation"))){
                return array("state" => 200, "info" => '商家权限验证失败！');
            }
        }


        // $sid = $userResult[0]['id'];

        if(empty($fid)){
            return array("state" => 200, "info" => '参数错误,无发布者信息');
        }
        if($ftype ==1){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");
        }elseif($ftype ==2){

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");
        }elseif($ftype == 0){

            $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
            $ret = $dsql->dsqlOper($userSql, "results");
            if(!$ret){
                return array("state" => 200, "info" => '您还未开通装修公司！');
            }
            if($ret[0]['state'] == 0){
                return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
            }

            if($ret[0]['state'] == 2){
                return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
            }
        }
        if(!$ret){
            return array("state" => 200, "info" => '设计师或工长不存在，请确认后重试！');
        }

        if(empty($title)){
            return array("state" => 200, "info" => '请输入案例标题');
        }

        if(empty($unitspic)){
            return array("state" => 200, "info" => '请上传户型图');
        }

        if(empty($pics)){
            return array("state" => 200, "info" => "请上传效果图");
        }

        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_diary` (`title`, `type`, `style`, `units`, `comstyle`, `btype`, `pics`, `area`, `unitspic`, `price`,`litpic`, `case`, `communityid`, `began`, `end`, `state`,`fid` ,`ftype`,`pubdate`,`userid`,`company`) VALUES ('$title', '$type', '$style', '$units', '$comstyle', '$btype', '$pics', '$area', '$unitspic', '$price', '$litpic','$case', '$community', '$began', '$end', '$state','$fid','$ftype','$pubdate','$userid','$company')");
        $aid      = $dsql->dsqlOper($archives, "lastid");

        if(is_numeric($aid)){
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'diary', $aid, 'insert', '添加案例('.$title.')', '', $archives);

            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'新增案例',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("renovation", "diary",$param);
            dataAsync("renovation",$aid,"case");  // 装修门户、案例、新增
            return $aid;
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }



    /**
     * 修改案例
     * @return array
     */
    public function editCase(){
        global $dsql;
        global $userLogin;

        $userid    = $userLogin->getMemberID();
        $param     = $this->param;
        $id       = (int)$param['id'];
        $case     = (int)$param['case'];
        $title    = filterSensitiveWords(addslashes($param['title']));
        $type     = (int)$param['type'];
        $btype    = (int)$param['btype'];
        $area     = (float)$param['area'];
        $price    = (float)$param['price'];
        $units    = (int)$param['units'];
        $comstyle = (int)$param['comstyle'];
        $style    = (int)$param['style'];

        $community = (int)$param['community'];

        $unitspic = $param['layoutimglist'];
        $pics     = $param['albumsimglist'];
        $litpic     = $param['litpic'];

        $fid      = $param['fid'];
        $ftype    = $param['ftype'];

        $began   = !empty($param['began']) ? GetMkTime($param['began']) : 0;
        $end     = !empty($param['end']) ? GetMkTime($param['end']) : 0;
        $pubdate = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if($ftype == 0) {

            if (!verifyModuleAuth(array("module" => "renovation"))) {
                return array("state" => 200, "info" => '商家权限验证失败！');
            }
        }




        if(empty($fid)){
            return array("state" => 200, "info" => '参数错误,无发布者信息');
        }
        if($ftype ==1){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");
        }elseif($ftype ==2){

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");
        }elseif($ftype == 0){

            $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
            $ret = $dsql->dsqlOper($userSql, "results");
            if(!$ret){
                return array("state" => 200, "info" => '您还未开通装修公司！');
            }
            if($ret[0]['state'] == 0){
                return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
            }

            if($ret[0]['state'] == 2){
                return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
            }
        }
        if(!$ret){
            return array("state" => 200, "info" => '设计师或工长不存在，请确认后重试！');
        }

        if(empty($title)){
            return array("state" => 200, "info" => '请输入案例标题');
        }

        if(empty($unitspic)){
            return array("state" => 200, "info" => '请上传户型图');
        }

        if(empty($pics)){
            return array("state" => 200, "info" => "请上传效果图");
        }
        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_diary` SET `title` = '$title', `type` = '$type', `style` = '$style', `units` = '$units', `comstyle` = '$comstyle', `btype` = '$btype', `area` = '$area', `unitspic` = '$unitspic', `price` = '$price', `case` = '$case', `litpic` = '$litpic',`communityid` = '$community', `began` = '$began', `end` = '$end', `pics` = '$pics' WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");
        dataAsync("renovation",$id,"case");  // 装修门户、案例、修改
        if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'diary', $id, 'update', '修改案例('.$title.')', '', $archives);

            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 修改文章动态
     * @return array
     */
    public function editArticle(){
        global $dsql;
        global $userLogin;

        $userid   = $userLogin->getMemberID();
        $param    = $this->param;
        $id       = (int)$param['id'];
        $fid      = (int)$param['fid'];
        $ftype     = (int)$param['ftype'];
        $title    = filterSensitiveWords(addslashes($param['title']));
        $note     = $param['body'];
        $imgList  = $param['imgList'];


        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

//        if(!verifyModuleAuth(array("module" => "renovation"))){
//            return array("state" => 200, "info" => '商家权限验证失败！');
//        }

        if(empty($fid)){
            return array("state" => 200, "info" => '参数错误,无发布者信息');
        }
        if($ftype ==1){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");
        }elseif($ftype ==2){

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `id` = ".$fid);
            $ret = $dsql->dsqlOper($sql, "results");

        }elseif($ftype == 0){

            $userSql = $dsql->SetQuery("SELECT `id`, `state` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
            $ret = $dsql->dsqlOper($userSql, "results");
            if(!$ret){
                return array("state" => 200, "info" => '您还未开通装修公司！');
            }
            if($ret[0]['state'] == 0){
                return array("state" => 200, "info" => '您的公司信息还在审核中，请通过审核后再发布！');
            }

            if($ret[0]['state'] == 2){
                return array("state" => 200, "info" => '您的公司信息审核失败，请通过审核后再发布！');
            }
        }
        if(!$ret){
            return array("state" => 200, "info" => '设计师或工长不存在，请确认后重试！');
        }

        if(empty($title)){
            return array("state" => 200, "info" => '请输入案例标题');
        }

//        if(empty($imgList)){
//            return array("state" => 200, "info" => '请上传户型图');
//        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_article` SET `title` = '$title', `type` = '$ftype', `note` = '$note', `litpic` = '$imgList' WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){
        
            //记录用户行为日志
            memberLog($userid, 'renovation', 'article', $id, 'update', '修改文章('.$title.')', '', $archives);

            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }

    }


    /**
     * 删除案例
     * @return array
     */
    public function delCase(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $casesql = $dsql->SetQuery("SELECT `fid`,`title`,`ftype`,`pics`,`unitspic` FROM `#@__renovation_diary` WHERE `id` = ".$id);

        $caseres = $dsql->dsqlOper($casesql,"results");

        if($caseres){
            $caseres = $caseres[0];
            $title = $caseres['title'];
            $ftype  = $caseres['ftype'];
            if($ftype == 0){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '公司信息不存在，删除失败！');
                }

            }elseif($ftype == 1){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = ".$uid );
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '工长信息不存在，删除失败！');
                }

            }elseif($ftype == 2){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = ".$uid );
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '设计师信息不存在，删除失败！');
                }
            }


            //删除图集
            $pics = explode(",", $caseres['pics']);
            foreach($pics as $k => $v){
                delPicFile($v, "delAtlas", "renovation");
            }

            $unitspic = explode(",", $caseres['unitspic']);
            foreach($unitspic as $k => $v){
                delPicFile($v, "delAtlas", "renovation");
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_diary` WHERE `id` = ".$id);
            $dsql->dsqlOper($archives, "update");
        
            //记录用户行为日志
            memberLog($uid, 'renovation', 'diary', $id, 'delete', '删除案例('.$title.')', '', $archives);

            dataAsync("renovation",$id,"case");  // 装修门户、案例、删除
            return '删除成功！';

        }else{
            return array("state" => 101, "info" => '数据不存在，删除失败！');
        }

    }

    /**
     * 删除文章
     * @return array
     */
    public function delArtilcle(){
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $articlesql = $dsql->SetQuery("SELECT `fid`,`title`,`type`,`litpic` FROM `#@__renovation_article` WHERE `id` = ".$id);

        $articleres = $dsql->dsqlOper($articlesql,"results");

        if($articleres){
            $articleres = $articleres[0];
            $title      = $articleres['title'];
            $ftype      = $articleres['type'];
            if($ftype == 0){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '公司信息不存在，删除失败！');
                }

            }elseif($ftype == 1){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '公司信息不存在，删除失败！');
                }

            }elseif($ftype == 2){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE  `userid` = ".$uid );
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '工长信息不存在，删除失败！');
                }
            }else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE  `userid` = ".$uid );
                $ret = $dsql->dsqlOper($sql, "results");
                if(!$ret){
                    return array("state" => 101, "info" => '设计师信息不存在，删除失败！');
                }
            }

            //删除缩略图

            //删除图集
            $pics = explode(",", $articleres['litpic']);
            foreach($pics as $k => $v){
                delPicFile($v, "delAtlas", "renovation");
            }

            $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_article` WHERE `id` = ".$id);
            $dsql->dsqlOper($archives, "update");
        
            //记录用户行为日志
            memberLog($uid, 'renovation', 'article', $id, 'delete', '删除文章('.$title.')', '', $archives);

            return '删除成功！';

        }else{
            return array("state" => 101, "info" => '数据不存在，删除失败！');
        }

    }


    /**
     * 公司留言
     * @return array
     */
    public function guest(){
        global $dsql;
        $pageinfo = $list = array();
        $company = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $company  = $this->param['company'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if(!is_numeric($company)) return array("state" => 200, "info" => '格式错误！');
        $where = " AND `state` = 1";

        //数据共享
        require(HUONIAOINC."/config/renovation.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where2 = " AND `cityid` = $cityid";
            }
        }

        $storeSql = $dsql->SetQuery("SELECT `id`, `company` FROM `#@__renovation_store` WHERE 1=1".$where2);
        $storeResult = $dsql->dsqlOper($storeSql, "results");
        if($storeResult){
            $storeid = array();
            foreach($storeResult as $key => $store){
                array_push($storeid, $store['id']);
            }
            $where .= " AND `company` in (".join(",", $storeid).")";
        }else{
            $where .= " AND 2=3";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `people`, `contact`, `ip`, `ipaddr`, `note`, `reply`, `pubdate` FROM `#@__renovation_guest` WHERE `company` = $company $where ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives.$where, "results");

        return array("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 发表留言
     * @return array
     */
    public function sendGuest(){
        global $dsql;
        $param = $this->param;

        $company  = $param['company'];
        $people   = $param['people'];
        $contact  = $param['contact'];
        $note     = $param['note'];

        if(empty($company) || empty($people) || empty($contact) || empty($note)){
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_guest` (`company`, `people`, `contact`, `ip`, `ipaddr`, `note`, `state`, `pubdate`) VALUES ('$company', '$people', '$contact', '".GetIP()."', '".getIpAddr(GetIP())."', '$note', 0, ".GetMkTime(time()).")");
        $results  = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            return "留言成功！";
        }else{
            return array("state" => 200, "info" => '留言失败！');
        }

    }


    /**
     * 公司预约
     * @return array
     */
    public function rese(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $company = $u = $page = $pageSize = $where = "";
        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $u        = $this->param['u'];
                $b        = $this->param['b'];
                $is_smart = $this->param['is_smart'];
                $company  = $this->param['company'];
                $type     = is_numeric($_REQUEST['type']) ? $_REQUEST['type'] :$this->param['type'];
                $bid      = $this->param['bid'];
                $resetype = $_REQUEST['resetype'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //会员中心请求
        $where  = " ";
        if($u == 1){

            $uid = $userLogin->getMemberID();
            // if(!verifyModuleAuth(array("module" => "renovation"))){
            //  return array("state" => 200, "info" => '商家权限验证失败！');
            // }

//          $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
//          $storeRes = $dsql->dsqlOper($sql, "results");
//          if($storeRes){
//              $company = $storeRes[0]['id'];
//          }
            $where .=" AND `pid` = ".$uid;
        }else{
            if(!is_numeric($type)) return array("state" => 200, "info" => '格式错误！');
        }


        $orderby    = " ORDER BY `id` DESC";

        if($company){
            $where  .= " AND  FIND_IN_SET(".$company.",`company`)";
        }
        if($is_smart ==1){
            $where  .= " AND `is_smart` = 1";
        }else{
            $where  .= " AND `is_smart` = 0";
        }

        if(!empty($orderby)){
            if($orderby ==1){

                $orderby = " ORDER BY `pubdate` desc";
            }
        }

        if(isset($type)){
            $where .= " AND `type` = ".$type;
        }

        if($resetype!= ''){
            $where .= " AND `resetype` = ".$resetype;
        }

        if(!empty($bid)){
            $where .= " AND `bid` = ".$bid;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `people`, `contact`, `community`, `bid`, `state`,`addrid`,`address`,`are`,`units`, `type`,`stype`,`style`,`is_smart`,`pubdate`,`company` FROM `#@__renovation_rese` WHERE 1 = 1".$where);

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //未处理
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where1 = " LIMIT $atpage, $pageSize";

        $list = array();

        $tablename ="";
        $results = $dsql->dsqlOper($archives.$orderby.$where1, "results");
        if($results){
            foreach ($results as $key => $value) {
                $list[$key]['id']           = $value['id'];
                $list[$key]['people']       = $value['people'];
                $list[$key]['contact']      = $value['contact'];
                $list[$key]['community']    = $value['community'];
                $list[$key]['addrid']       = $value['addrid'];

                $addrName = getParentArr("site_area", $value['addrid']);
                if($addrName){

                    $addrName = array_column($addrName, 'typename');
                }


                $list[$key]['address']      = $addrName[0];
                $designer = "无";


                if($value['type'] ==1){
                    $this->param = $value['bid'];

                    $list[$key]['author']  = $this->foremanDetail();
                    $designer              = $list[$key]['author']['name'];

                }elseif($value['type'] ==2){
                    $this->param = $value['bid'];

                    $list[$key]['author']  = $this->teamDetail();
                    $designer              = $list[$key]['author']['name'];
                }else{
                    if($value['is_smart'] ==1){

                        $this->param = $value['company'];

                    }else{

                        $this->param = $value['company'];
                    }

                    $list[$key]['author']  = $this->storeDetail();
                    $designer              = $list[$key]['author']['company'];
                }

                $list[$key]['designer'] = $designer;

                $list[$key]['state']    = $value['state'];
                $list[$key]['type']     = $value['type'];
                $list[$key]['are']      = $value['are'];

                if($value['units']){
                    $unitssql  = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$value['units']);
                    $unitsres  = $dsql->dsqlOper($unitssql,"results");
                }

                $list[$key]['units']    = is_array($unitsres[0])? $unitsres[0]['typename'] : '';

                if($value['style']){
                    $stylesql  = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$value['style']);
                    $styleres  = $dsql->dsqlOper($stylesql,"results");
                }

                $list[$key]['style']    = $styleres[0]['typename']? $styleres[0]['typename'] : '';
                $list[$key]['pubdate']  = $value['pubdate'];
                $list[$key]['stype']    = $value['stype'];
                $list[$key]['md']       = date('m-d',$value['pubdate']);
                $list[$key]['his']      = date('H:i:s',$value['pubdate']);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
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
        $areaCode    = $param['areaCode'];
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
        if($is_smart==0 &&$type ==0){
            $bid         = $company = (int)$param['bid'];
        }elseif($type ==1 || $type ==2){
            $bid         = $userid  = (int)$param['bid'];
        }
        $bid = (int)$bid;
        if($comstyle){

            $units = $comstyle;

        }elseif($jiastyle){

            $units = $jiastyle;
        }

        $uid     = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        if(empty($contact)){
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
        $contact = ($areaCode == '86' ? '' : $areaCode) . $contact;

        // if($resetype ==1){
        //  $type =3;
        // }
        $cityName = $siteCityInfo['name'];
        $cityid  = $siteCityInfo['cityid'];

        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_rese` (`cityid`, `company`,`is_smart`,`userid`, `people`,`pid`,`stype`,`style`,`contact`, `community`, `appointment`, `budget`, `units`,`are`,`addrid`,`address`,`resetype`,`type`,`body`, `ip`, `ipaddr`, `state`,`bid`, `pubdate`) VALUES
                                                                        ('$cityid', '$company', '$is_smart','$uid', '$people','$uid','$stype','$style','$contact', '$community', ".(!empty($appointment) ? GetMkTime($appointment) : 0).", '$budget', '$units','$are','$addrid','$address','$resetype','$type','$body', '".GetIP()."', '".getIpAddr(GetIP())."', '$state', '$bid',".GetMkTime(time()).")");
        $results  = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            autoShowUserModule($uid,'renovation');  // 预约，自动填充用户装修卡片
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'申请了预约',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("renovation", "rese",$param);
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

        if($type == 1){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '工长信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }

        }elseif ($type == 2){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '工长信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }

        }else{

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '公司信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }
        }

        $sql = $dsql->SetQuery("SELECT `bid` FROM `#@__renovation_rese` WHERE `id` = ".$id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $bid = $ret[0]['bid'];
            if($bid == $sid){

                $sql = $dsql->SetQuery("UPDATE `#@__renovation_rese` SET `state` = 1 WHERE `id` = ".$id);
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


    /*
     *删除预约信息
     * */
    public function delRese(){
        global $userLogin;
        global $dsql;
        //获取用户ID
        $param = $this->param;

        $id     = (int)$param['id'];
        $type   = (int)$param['type'];

        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        if($type == 1){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_foreman` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '工长信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }

        }elseif ($type == 2){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_team` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '工长信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }

        }else{

            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret){
                return array("state" => 101, "info" => '公司信息不存在，删除失败！');
            }else{
                $sid = $ret[0]['id'];
            }
        }

        $archives = $dsql->SetQuery("DELETE FROM `#@__renovation_rese` WHERE `id` = ".$id);
        $res = $dsql->dsqlOper($archives, "update");
        if($res =="ok"){

            return  $res;

        }else{
            return array("state" => 101, "info" => '请检查字段');
        }
    }

    /**
     * 申请免费设计
     * @return array
     */
    public function sendEntrust(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $param = $this->param;
        $people     = $param['people'];
        $areaCode   = $param['areaCode'];
        $contact    = $param['contact'];
        $addrid     = $param['addrid'];
        $units      = (int)$param['units'];
        $company    = (int)$param['company'];
        $community  = $param['community'];

        if(empty($addrid) || empty($contact)){
            return array("state" => 200, "info" => '必填项不得为空！');
        }
        $uid = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
//        if($uid == -1){
//            return array("state" => 200, "info" => '登录超时，请重新登录！');
//        }

        $cityid = getCityId($this->param['cityid']);

        $cityName = $siteCityInfo['cityName'];
        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        //手机号码增加区号，国内版不显示
        $contact = ($areaCode == '86' ? '' : $areaCode) . $contact;

        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_entrust` (`cityid`, `people`,`userid`, `contact`, `addrid`,`company`,`units`,`community`,`ip`, `ipaddr`,`state`, `pubdate`) VALUES ('$cityid', '$people', '$uid','$contact', '$addrid','$company' ,'$units', '$community','".GetIP()."', '".getIpAddr(GetIP())."', '$state', ".GetMkTime(time()).")");
        $results  = $dsql->dsqlOper($archives, "update");
        if($results == "ok"){
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'申请了免费设计',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("renovation", "entrust",$param);
            return "申请成功！";
        }else{
            return array("state" => 200, "info" => '申请失败！');
        }

    }
    /**
     * 免费设计获取
     * @return array
     */
    public function entrust(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $company = $u = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $u        = $this->param['u'];
                $company  = $this->param['company'];

            }
        }

        //会员中心请求

        $where  = " ";

        $orderby    = " ORDER BY `id` DESC";

        if(!empty($orderby)){
            if($orderby ==1){

                $orderby = " ORDER BY `pubdate` desc";
            }
        }

        if(!empty($company)){
            $where  .= " AND `company` = ".$company;
        }

        $userid = $userLogin->getMemberID();
        $companysql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $companyres  = $dsql->dsqlOper($companysql,"results");
        if(!empty($companyres)){
            $where  .= " AND `company` = ".$companyres[0]['id'];
        }else{
            return array("state" => 200, "info" => '没有查找到公司信息');
        }
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_entrust` WHERE 1 = 1".$where);

        //总条数
        $totalCount = (int)$dsql->dsqlOper($archives, "totalCount");
        
        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        //未联系
        $totalResults = $dsql->dsqlOper($archives . " AND `state` = 0", "results", "NUM");
        $state0 = (int)$totalResults[0][0];


        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where1 = " LIMIT $atpage, $pageSize";

        $list = array();

        $tablename ="";
        $results = $dsql->dsqlOper($archives.$orderby.$where1, "results");
        if($results){
            foreach ($results as $key => $value) {
                $list[$key]['id']           = $value['id'];
                $list[$key]['people']       = $value['people'];
                $list[$key]['contact']      = $value['contact'];
                $list[$key]['community']    = $value['community'];
                $list[$key]['addrid']       = $value['addrid'];
                $list[$key]['units']        = $value['units'];
                $list[$key]['area']         = $value['area'];
                $list[$key]['state']        = $value['state'];

                $list[$key]['md']           = date('m-d',$value['pubdate']);
                $list[$key]['his']          = date('H:i:s',$value['pubdate']);
                $addrName = getParentArr("site_area", $value['addrid']);
                if($addrName){

                    $addrName = array_column($addrName, 'typename');
                }

                $list[$key]['address']      = $addrName[0];
                if($value['units']){
                    $unitssql  = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_type` WHERE `id` = ".$value['units']);
                    $unitsres  = $dsql->dsqlOper($unitssql,"results");
                }

                $list[$key]['units']        = $unitsres[0]['typename'] ?  $unitsres[0]['typename'] : '';

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /*
     * 公司设计已联系
     * */
    public function updateEntrust(){
        global $dsql;
        global $userLogin;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $id         = $this->param['id'];
            }
        }

        $userid = $userLogin->getMemberID();
        $companysql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $companyres  = $dsql->dsqlOper($companysql,"results");
        if(empty($companyres)){
            return array("state" => 200, "info" => '没有查找到公司信息');
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__renovation_entrust` SET `state` = '1' WHERE  `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }

    /*
     * 公司招标已经联系
     * */
    public function updateZhaobiao(){
        global $dsql;
        global $userLogin;

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $id         = $this->param['id'];
            }
        }

        $userid = $userLogin->getMemberID();
        $companysql  = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $companyres  = $dsql->dsqlOper($companysql,"results");
        if(empty($companyres)){
            return array("state" => 200, "info" => '没有查找到公司信息');
        }
        $company =  $companyres[0]['id'];
        //保存到主表
        $sql        = $dsql->SetQuery( "SELECT `contacsid` FROM `#@__renovation_zhaobiao` WHERE `id` = ".$id);
        $results    = $dsql->dsqlOper($sql,"results");
        if($results){
            if($results[0]['contacsid'] ==''){
                $contacsid = $company.",";
            }else{
                $contacsid = $results[0]['contacsid'].$company;
            }

        }else{
            return array("state" => 200, "info" => '请检查参数');
        }

        $archives = $dsql->SetQuery("UPDATE `#@__renovation_zhaobiao` SET `contacsid` = '$contacsid'  WHERE  `id` = ".$id);
        $ret = $dsql->dsqlOper($archives, "update");

        if($ret == "ok"){
            return "修改成功！";
        }else{
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }

    /**
     * 申请工地参观
     * @return array
     */

    public function sendConstruction(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $param  = $this->param;
        $people     = $param['people'];
        $contact    = $param['contact'];
        $conid      = (int)$param['conid'];
        $areaCode   = (int)$param['areaCode'];

        if(!$conid) return array("state" => 200, "info" => '参数错误！');
        if(!$people || !$contact) return array("state" => 200, "info" => '请填写姓名和联系方式！');

        //手机号码增加区号，国内版不显示
        $contact = ($areaCode == '86' ? '' : $areaCode) . $contact;
// '.GetIP()."', '".getIpAddr(GetIP())."'
        $userid = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

//        if($userid == -1){
//            return array("state" => 200, "info" => '登录超时，请重新登录！');
//        }
        //日期
        // $beginToday  = GetMkTime(mktime(0,0,0,date('m'),date('d'),date('Y')));
        // $endToday    = GetMkTimemktime(0,0,0,date('m'),date('d')+1,date('Y'))-1);

        //查询几次预约
        $cityid     = $siteCityInfo['cityid'];
        $cityName   = $siteCityInfo['cityName'];

        $visitsql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_visit` WHERE `conid` = $conid AND `userid`=$userid");

        $visitres = $dsql->dsqlOper($visitsql,"results");

        if($visitres){
            return array("state" => 200, "info" => '已经预约过！');
        }
        include HUONIAOINC."/config/renovation.inc.php";
        $state  = (int)$customFabuCheck;
        $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_visit` (`conid`,`userid`, `people`, `contact`,`ip`, `ipaddr`, `state`, `pubdate`) VALUES ('$conid', '$userid','$people', '$contact', '".GetIP()."', '".getIpAddr(GetIP())."', '$state', ".GetMkTime(time()).")");

        $results  = $dsql->dsqlOper($archives, "update");

        if($results == "ok"){
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'申请了工地参观',
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("renovation", "construction",$param);
            return "申请成功！等待审核";
        }else{
            return array("state" => 200, "info" => '申请失败！');
        }
    }

    /*
     *参观工地查询
     * */
    public function construction(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $company = $u = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $u        = $this->param['u'];
                $page     = $this->param['page'];
                $company  = $this->param['company'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //会员中心请求

        $where  = " ";
        $uid = $userLogin->getMemberID();
        if($u == 1){


            // if(!verifyModuleAuth(array("module" => "renovation"))){
            //     return array("state" => 200, "info" => '商家权限验证失败！');
            // }

            $where .=" AND `userid` = ".$uid;
        }

        if($company){

            $constructionsql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_construction` WHERE `sid` = ".$company);
            $constructionres = $dsql->dsqlOper($constructionsql,"results");

            if($constructionres){

                $conid           =  array_column($constructionres,"id");

                $conidarr        = join(',',$conid);

                $where .= " AND `conid` in(".$conidarr.")";
            }


        }


        $orderby    = " ORDER BY `id` DESC";


        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id`, `conid`, `userid`, `people`, `contact`, `ip`,`ipaddr`,`state`, `pubdate` FROM `#@__renovation_visit` WHERE 1 = 1".$where);
        //总条数
        $totalCount = (int)$dsql->dsqlOper($archives, "totalCount");
        //未处理
        $state0 = $dsql->dsqlOper($archives." AND `state` = 0", "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "state0" => $state0,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where1 = " LIMIT $atpage, $pageSize";

        $list = array();

        $tablename ="";
        $results = $dsql->dsqlOper($archives.$orderby.$where1, "results");
        if($results){
            foreach ($results as $key => $value) {
                $list[$key]['id']           = $value['id'];
                $list[$key]['conid']        = $value['conid'];
                $list[$key]['contact']      = $value['contact'];
                $list[$key]['people']       = $value['people'];
                $list[$key]['state']        = (int)$value['state'];

                $this->param = $value['conid'];
                $list[$key]['constructionetail']  = $this->constructionDetail();
                $list[$key]['pubdate']  = $value['pubdate'];
                $list[$key]['md']       = date('m-d',$value['pubdate']);
                $list[$key]['his']      = date('H:i:s',$value['pubdate']);
                
                $param = array(
                    "service"     => "renovation",
                    "template"    => "company-site-detail",
                    "id"          => $value['conid']
                );
                $list[$key]["url"] = getUrlPath($param);

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 装修大学
     * @return array
     */
    public function news(){
        global $dsql;
        $pageinfo = $list = array();
        $typeid = $ispic = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $typeid   = $this->param['typeid'];
                $ispic    = $this->param['ispic'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC."/config/renovation.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare){
            $cityid = getCityId($this->param['cityid']);
            if($cityid){
                $where .= " AND `cityid` = ".$cityid;
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //遍历分类
        if(!empty($typeid)){
            global $arr_data;
            $arr_data = "";
            $typeArr = $dsql->getTypeList($typeid, "renovation_newstype");
            if($typeArr){
                $lower = arr_foreach($typeArr);
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        //必须有图片
        if($ispic == 1){
            $where .= " AND `litpic` <> ''";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `click`, `description`, `writer`, `pubdate` FROM `#@__renovation_news` WHERE `arcrank` = 0".$where." ORDER BY `weight` DESC, `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

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
            foreach ($results as $key => $value) {
                $list[$key]['id']      = $value['id'];
                $list[$key]['title']   = $value['title'];
                $list[$key]['litpic']  = getFilePath($value['litpic']);
                $list[$key]['click']   = $value['click'];
                $list[$key]['description']  = $value['description'];
                $list[$key]['writer']  = $value['writer'];
                $list[$key]['pubdate'] = $value['pubdate'];

                $param = array(
                    "service"     => "renovation",
                    "template"    => "raiders-detail",
                    "id"          => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 装修大学信息详细
     * @return array
     */
    public function newsDetail(){
        global $dsql;
        $newsDetail = array();
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

        if(empty($id)){
            return array("state" => 200, "info" => '信息ID不得为空！');
        }

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_news` WHERE `arcrank` = 0 AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $newsDetail["id"]          = $results[0]['id'];
            $newsDetail["title"]       = $results[0]['title'];
            $newsDetail["typeid"]      = $results[0]['typeid'];
            $newsDetail["cityid"]      = $results[0]['cityid'];

            $typename = "";
            $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__renovation_newstype` WHERE `id` = ".$results[0]['typeid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $typename = $ret[0]['typename'];
            }
            $newsDetail['typename']    = $typename;

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
     * 装修大学分类
     * @return array
     */
    public function newsType(){
        global $dsql;
        $type = $page = $pageSize = $where = "";

        if(!empty($this->param)){
            if(!is_array($this->param)){
                return array("state" => 200, "info" => '格式错误！');
            }else{
                $type     = (int)$this->param['type'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }
        $results = $dsql->getTypeList($type, "renovation_newstype", $son, $page, $pageSize);
        if($results){
            return $results;
        }
    }



    /**
     * 配置商铺
     * @return array
     */
    public function storeConfig(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $userid      = $userLogin->getMemberID();
        $param       = $this->param;
        $company     = filterSensitiveWords(addslashes($param['company']));
        $addrid      = (int)$param['addrid'];
        $cityid      = (int)$param['cityid'];
        $address     = filterSensitiveWords(addslashes($param['address']));
        $wechat      = filterSensitiveWords(addslashes($param['wechat']));
        $website     = filterSensitiveWords(addslashes($param['website']));
        $lnglat      = $param['lnglat'];
        $logo        = $param['logo'];
     	$people      = filterSensitiveWords(addslashes($param['people']));
        $contact     = filterSensitiveWords(addslashes($param['contact']));
        $qq          = filterSensitiveWords(addslashes($param['qq']));
        $range       = convertArrToStrWithComma($param['range']);
        $jiastyle    = convertArrToStrWithComma($param['jiastyle']);
        $comstyle    = convertArrToStrWithComma($param['comstyle']);
		$style       = convertArrToStrWithComma($param['style']);
        $scale       = filterSensitiveWords(addslashes($param['scale']));
        $afterService = filterSensitiveWords(addslashes($param['afterService']));
        $initDesign  = filterSensitiveWords(addslashes($param['initDesign']));
        $initBudget  = filterSensitiveWords(addslashes($param['initBudget']));
        $detaDesign  = filterSensitiveWords(addslashes($param['detaDesign']));
        $detaBudget  = filterSensitiveWords(addslashes($param['detaBudget']));
        $material    = filterSensitiveWords(addslashes($param['material']));
        $normative   = filterSensitiveWords(addslashes($param['normative']));
        $speService  = filterSensitiveWords(addslashes($param['speService']));
        $comType     = filterSensitiveWords(addslashes($param['comType']));
        $regFunds    = filterSensitiveWords(addslashes($param['regFunds']));
        $operPeriodb = !empty($param['operPeriodb']) ? GetMkTime($param['operPeriodb']) : 0;
        $operPeriode = !empty($param['operPeriode']) ? GetMkTime($param['operPeriode']) : 0;
        $founded     = !empty($param['founded']) ? GetMkTime($param['founded']) : 0;
        $authority   = filterSensitiveWords(addslashes($param['authority']));
        $operRange   = filterSensitiveWords(addslashes($param['operRange']));
        $inspection  = !empty($param['inspection']) ? GetMkTime($param['inspection']) : 0;
        $regnumber   = filterSensitiveWords(addslashes($param['regnumber']));
        $legalPer    = filterSensitiveWords(addslashes($param['legalPer']));
        $body        = filterSensitiveWords(addslashes($param['body']));
        $certs       = $param['certs'];
        $pubdate     = GetMkTime(time());

        if($userid == -1){
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['userType'] != 2){
            return array("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        if(!verifyModuleAuth(array("module" => "renovation"))){
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if(empty($company)){
            return array("state" => 200, "info" => '请输入公司名称');
        }

        if(empty($wechat)){
            return array("state" => 200, "info" => '请输入公司微信');
        }

        if(empty($website)){
            // return array("state" => 200, "info" => '请输入公司网址');
        }

        if(empty($addrid)){
            return array("state" => 200, "info" => '请选择所在区域');
        }

        if(empty($address)){
            return array("state" => 200, "info" => '请输入公司地址');
        }

        if(empty($logo)){
            return array("state" => 200, "info" => '请上传公司LOGO');
        }

        if(empty($people)){
            return array("state" => 200, "info" => '请输入联系人');
        }

        if(empty($contact)){
            return array("state" => 200, "info" => '请输入联系电话');
        }

        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = ".$userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //入驻审核开关
        include HUONIAOINC."/config/business.inc.php";
        $moduleJoinCheck = (int)$customModuleJoinCheck;
        $editModuleJoinCheck = (int)$customEditModuleJoinCheck;

        //新商铺
        if(!$userResult){

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__renovation_store` (`cityid`, `company`, `addrid`, `logo`, `userid`, `people`, `contact`, `qq`, `address`, `lnglat`, `range`, `jiastyle`, `comstyle`, `style`, `body`, `state`, `certs`, `scale`, `afterService`, `initDesign`, `initBudget`, `detaDesign`, `detaBudget`, `material`, `normative`, `speService`, `comType`, `regFunds`, `operPeriodb`, `operPeriode`, `founded`, `authority`, `operRange`, `inspection`, `regnumber`, `legalPer`, `pubdate`,`wechat`,`website`) VALUES ('$cityid', '$company', '$addrid', '$logo', '$userid', '$people', '$contact', '$qq', '$address', '$lnglat', '$range', '$jiastyle', '$comstyle', '$style', '$body', '$moduleJoinCheck', '$certs', '$scale', '$afterService', '$initDesign', '$initBudget', '$detaDesign', '$detaBudget', '$material', '$normative', '$speService', '$comType', '$regFunds', '$operPeriodb', '$operPeriode', '$founded', '$authority', '$operRange', '$inspection', '$regnumber', '$legalPer', '$pubdate','$wechat','$website')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if(is_numeric($aid)){

                $urlParam = array(
                    'service' => 'renovation',
                    'template' => 'company-detail',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'renovation', 'company', $aid, 'insert', '申请装修公司('.$company.')', $url, $archives);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'新增装修公司',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("renovation", "store",$param);
                dataAsync("renovation",$aid,"store");  // 装修门户、新增店铺
                return "配置成功，您的公司正在审核中，请耐心等待！";
            }else{
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

            //更新商铺信息
        }else{

            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__renovation_store` SET `cityid` = '$cityid', `company` = '$company', `addrid` = '$addrid', `logo` = '$logo', `userid` = '$userid', `people` = '$people', `contact` = '$contact', `qq` = '$qq', `address` = '$address', `lnglat` = '$lnglat', `range` = '$range', `jiastyle` = '$jiastyle', `comstyle` = '$comstyle', `style` = '$style', `body` = '$body', `state` = '$editModuleJoinCheck', `certs` = '$certs', `scale` = '$scale', `afterService` = '$afterService', `initDesign` = '$initDesign', `initBudget` = '$initBudget', `detaDesign` = '$detaDesign', `detaBudget` = '$detaBudget', `material` = '$material', `normative` = '$normative', `speService` = '$speService', `comType` = '$comType', `regFunds` = '$regFunds', `operPeriodb` = '$operPeriodb', `operPeriode` = '$operPeriode', `founded` = '$founded', `authority` = '$authority', `operRange` = '$operRange', `inspection` = '$inspection', `regnumber` = '$regnumber', `legalPer` = '$legalPer',`body` = '$body',`wechat` = '$wechat',`website`='$website' WHERE `userid` = ".$userid);
            $results = $dsql->dsqlOper($archives, "update");

            if($results == "ok"){

                $urlParam = array(
                    'service' => 'renovation',
                    'template' => 'company-detail',
                    'id' => $userResult[0]['id']
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'renovation', 'company', $userResult[0]['id'], 'update', '修改装修公司('.$company.')', $url, $archives);
                
                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid  = $siteCityInfo['cityid'];
                $param = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' =>array(
                        'contentrn'  => $cityName.'分站——renovation模块——用户:'.$userDetail['username'].'更新了装修公司信息',
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("renovation", "store",$param);
                $sql = $dsql->SetQuery("select id from `#@__renovation_store` where `userid`=".$userid);
                $res = $dsql->dsqlOper($sql,"results");
                dataAsync("renovation",$res[0]['id'],"store");  // 装修门户，更新商店
                return "保存成功！";
            }else{
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

        }

    }
}
