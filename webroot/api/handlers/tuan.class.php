<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 团购模块API接口
 *
 * @version        $Id: tuan.class.php 2014-3-23 上午09:25:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class tuan
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
     * 获取当前城市信息
     */
    public function getCity()
    {
        global $city;
        global $dsql;
        global $cfg_secureAccess;

        if (empty($city)) {
            $city = GetCookie("tuan_city");
        }

        if (!empty($city)) {

            $sql = $dsql->SetQuery("SELECT c.`id`, c.`type`, c.`cid`, a.`typename` FROM `#@__domain` d LEFT JOIN `#@__tuan_city` c ON c.`id` = d.`iid` LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` WHERE d.`domain` = '$city' AND d.`module` = 'tuan' AND d.`part` = 'city'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $ret = $ret[0];

                //获取频道域名
                $this->param   = 'channelDomain';
                $config        = $this->config();
                $customeDomain = str_replace("http://", "", str_replace("https://", "", $config['channelDomain']));
                $domainInfo    = getDomain('tuan', 'city', $ret['id']);
                $domain        = $domainInfo['domain'];
                $ndomain       = "";
                if ($ret['type'] == 0) {
                    $ndomain = $domain;
                } elseif ($ret['type'] == 1) {
                    $ndomain = $domain . "." . $customeDomain;
                } elseif ($ret['type'] == 2) {
                    $ndomain = $customeDomain . "/" . $domain;
                }

                $ret['url'] = $cfg_secureAccess . $ndomain;

                return $ret;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * 团购基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/tuan.inc.php");

        global $cfg_fileUrl;              //系统附件默认地址
        global $cfg_uploadDir;            //系统附件默认上传目录
        // global $customFtp;                //是否自定义FTP
        // global $custom_ftpState;          //FTP是否开启
        // global $custom_ftpUrl;            //远程附件地址
        // global $custom_ftpDir;            //FTP上传目录
        // global $custom_uploadDir;         //默认上传目录
        global $cfg_basehost;             //系统主域名
        global $cfg_hotline;              //系统默认咨询热线
        // global $customAtlasMax;           //图集数量限制

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
        // global $recMoney;                 //推荐返现金额
        // global $singelnum;                //单次购买数量限制
        // global $Tel400;                   //400电话
        // global $subscribe;                //邮件订阅
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

        // $domainInfo = getDomain('tuan', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('tuan', $customSubDomain);

        //分站自定义配置
        $ser = 'tuan';
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
                } elseif ($param == "atlasMax") {
                    $return['atlasMax'] = $customAtlasMax;
                } elseif ($param == "recMoney") {
                    $return['recMoney'] = $recMoney;
                } elseif ($param == "singelnum") {
                    $return['singelnum'] = $singelnum;
                } elseif ($param == "Tel400") {
                    $return['Tel400'] = $Tel400;
                } elseif ($param == "subscribe") {
                    $return['subscribe'] = $subscribe;
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
            $return['atlasMax']      = $customAtlasMax;
            $return['recMoney']      = $recMoney;
            $return['singelnum']     = $singelnum;
            $return['Tel400']        = $Tel400;
            $return['subscribe']     = $subscribe;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['atlasSize']     = $custom_atlasSize;
            $return['atlasType']     = $custom_atlasType;
        }

        return $return;

    }

    /**
     * 团购答疑
     * @reseturn array
     */
    public function question()
    {
        global $dsql;
        $pageinfo = $list = array();
        $page     = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_question` WHERE `ischeck` = 1 ORDER BY `id` DESC");
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
                $list[$key]['userid'] = $val['userid'];

                $archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $val['userid']);
                $member   = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $list[$key]['username'] = $member[0]['username'];
                } else {
                    $list[$key]['username'] = "未知";
                }

                $list[$key]['content'] = $val['content'];
                $list[$key]['dtime']   = $val['dtime'];

                $archives = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $val['by']);
                $member   = $dsql->dsqlOper($archives, "results");
                if ($member) {
                    $list[$key]['admin'] = $member[0]['username'];
                } else {
                    $list[$key]['admin'] = "未知";
                }

                $list[$key]['replay'] = $val['replay'];
                $list[$key]['rtime']  = $val['rtime'];
                $list[$key]['ip']     = $val['ip'];
                $list[$key]['ipaddr'] = $val['ipaddr'];
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 常见问题
     * @return array
     */
    public function faq()
    {
        global $dsql;
        $pageinfo = $list = array();
        $typeid   = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
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
            if ($dsql->getTypeList($typeid, "tuan_faqtype")) {
                $lower = arr_foreach($dsql->getTypeList($typeid, "tuan_faqtype"));
                $lower = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        $archives = $dsql->SetQuery("SELECT `id`, `title`, `pubdate` FROM `#@__tuan_faqlist` WHERE `arcrank` = 0" . $where . " ORDER BY `weight` DESC, `id` DESC");
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
        return array("pageInfo" => $pageinfo, "list" => $results);
    }


    /**
     * 问题详细信息
     * @return array
     */
    public function faqDetail()
    {
        global $dsql;
        $faqDetail = array();

        if (empty($this->param)) {
            return array("state" => 200, "info" => '信息ID不得为空！');
        }

        if (!is_numeric($this->param)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT `title`, `typeid`, `body`, `pubdate` FROM `#@__tuan_faqlist` WHERE `arcrank` = 0 AND `id` = " . $this->param);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $faqDetail["title"]   = $results[0]['title'];
            $faqDetail["typeid"]  = $results[0]['typeid'];
            $faqDetail["body"]    = $results[0]['body'];
            $faqDetail["pubdate"] = $results[0]['pubdate'];
        }
        return $faqDetail;
    }


    /**
     * 常见问题分类
     * @return array
     */
    public function faqType()
    {
        global $dsql;

        $type = !empty($this->param) ? $this->param : 0;
        if (!is_numeric($type)) return array("state" => 200, "info" => '格式错误！');

        $results = $dsql->getTypeList($type, "tuan_faqtype");
        if ($results) {
            return $results;
        }
    }


    /**
     * 团购分类
     * @return array
     */
    public function type()
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
        $results = $dsql->getTypeList($type, "tuantype", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }


    /**
     * 团购热门分类
     * @return array
     */
    public function hotype()
    {
        global $dsql;
        $list = array();

        $sql     = $dsql->SetQuery("SELECT * FROM `#@__tuantype` WHERE `hot` = 1 ORDER BY `id` ASC");
        $results = $dsql->dsqlOper($sql, "results");

        $list = array();
        if (count($results) > 0) {

            $par      = array(
                "service"  => "tuan",
                "template" => "list",
                "typeid"   => "%id%"
            );
            $urlParam = getUrlPath($par);

            foreach ($results as $key => $value) {
                $list[$key]["id"] = $value["id"];
                $typename         = $value["typename"];
                if (!empty($value["color"])) {
                    $typename = '<font color="' . $value["color"] . '">' . $typename . '</font>';
                }
                $list[$key]["typename"] = $typename;
                $list[$key]["url"]      = str_replace("%id%", $value['id'], $urlParam);
            }
        }
        return $list;
    }


    /**
     * 团购分类详细信息
     * @return array
     */
    public function typeDetail()
    {
        global $dsql;
        if (!is_numeric($this->param)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT `id`, `parentid`, `typename`, `seotitle`, `keywords`, `description` FROM `#@__tuantype` WHERE `id` = " . $this->param);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $itemid = $results[0]['id'];
            if ($results[0]['parentid'] != 0) {
                $itemid = $results[0]['parentid'];
            }
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `options` FROM `#@__tuantypeitem` WHERE `tid` = " . $itemid . " AND `formtype` != 'text' ORDER BY `orderby` DESC, `id` DESC");
            $typeitem = $dsql->dsqlOper($archives, "results");
            if ($typeitem) {
                foreach ($typeitem as $key => $item) {
                    $results[0]["item"][$key]['id']    = $item['id'];
                    $results[0]["item"][$key]['title'] = $item['title'];
                    if ($item["options"] != "") {
                        $options                             = join('|', preg_split("[\r\n]", $item["options"]));
                        $results[0]["item"][$key]['options'] = $options;
                    }
                }
            }
            return $results;
        }

    }


    /**
     * 分类字段
     * @return array
     */
    public function typeItem()
    {
        global $dsql;

        $typeid = $this->param['typeid'];
        if (!is_numeric($typeid)) return array("state" => 200, "info" => '格式错误！');

        $checktype   = $dsql->SetQuery("SELECT `parentid` FROM `#@__tuantype` WHERE `id` = " . $typeid);
        $typeResults = $dsql->dsqlOper($checktype, "results");
        $tt          = $typeResults[0]['parentid'] != 0 ? $typeResults[0]['parentid'] : $typeid;

        $infoitem    = $dsql->SetQuery("SELECT `id`, `title`, `field`, `options` FROM `#@__tuantypeitem` WHERE `tid` = " . $tt . " ORDER BY `orderby` DESC");
        $itemResults = $dsql->dsqlOper($infoitem, "results");

        $list = array();
        if (count($itemResults) > 0) {
            foreach ($itemResults as $key => $value) {
                $options = array();
                if ($value["options"] != "") {
                    $options = preg_split("[\r\n]", $value["options"]);
                }

                $list[$key]["id"]      = $value["id"];
                $list[$key]["title"]   = $value["title"];
                $list[$key]["field"]   = $value["field"];
                $list[$key]["options"] = $options;
            }
        }
        return $list;
    }


    /**
     * 已开通的城市
     */
    public function city()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $customSubDomain;

        $sql  = $dsql->SetQuery("SELECT c.*, a.`typename`, a.`pinyin` FROM `#@__tuan_city` c LEFT JOIN `#@__site_area` a ON a.`id` = c.`cid` ORDER BY c.`id`");
        $ret  = $dsql->dsqlOper($sql, "results");
        $list = array();
        if ($ret) {

            //获取频道域名
            $this->param   = 'channelDomain';
            $config        = $this->config();
            $customeDomain = str_replace("http://", "", str_replace("https://", "", $config['channelDomain']));

            foreach ($ret as $key => $value) {
                $domainInfo = getDomain('tuan', 'city', $value['id']);
                $domain     = $domainInfo['domain'];
                $ndomain    = "";
                if ($value['type'] == 0) {
                    $ndomain = $domain;
                } elseif ($value['type'] == 1) {
                    $ndomain = $domain . "." . $customeDomain;
                } elseif ($value['type'] == 2) {
                    $ndomain = $customeDomain . "/" . $domain;
                }

                $list[$key]['id']     = $value['id'];
                $list[$key]['url']    = $cfg_secureAccess . $ndomain;
                $list[$key]['name']   = $value['typename'];
                $list[$key]['pinyin'] = getPinyin($value['typename']);
            }
        }
        return $list;
    }


    /**
     * 验证城市是否开通
     */
    public function verifyCity()
    {
        global $dsql;
        $province = $this->param['province'];
        $city     = $this->param['city'];
        $district = $this->param['district'];

        if (empty($province) && empty($city) && empty($district)) {
            return array("state" => 200, "info" => '数据不得为空！');
        }

        $data    = array();
        $cityArr = $this->city();
        if ($cityArr) {
            foreach ($cityArr as $key => $value) {
                if (strpos($province, $value['name']) !== false || strpos($city, $value['name']) !== false || strpos($district, $value['name']) !== false) {
                    $data = array("name" => $value['name'], "pinyin" => $value['pinyin'], "url" => $value['url']);
                }
            }

            if ($data) {
                return $data;
            } else {
                return array("state" => 200, "info" => '您所在的地区暂未开通团购！');
            }

        } else {
            return array("state" => 200, "info" => '系统暂未开通团购城市！');
        }


        //验证省份
    }


    /**
     * 团购地区
     * @return array
     */
    public function addr()
    {
        global $dsql;
        $store = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $type     = (int)$this->param['type'];
                $store    = (int)$this->param['store'];
                $page     = (int)$this->param['page'];
                $pageSize = (int)$this->param['pageSize'];
                $son      = $this->param['son'] == 0 ? false : true;
            }
        }

        global $template;
        if ($template && $template != 'page' && empty($type)) {

            //数据共享
            require(HUONIAOINC . "/config/tuan.inc.php");
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
     * 商圈
     * @return array
     */
    public function circle()
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

        if (empty($type)) return array("state" => 200, "info" => '格式错误！');

        //数据共享
        require(HUONIAOINC . "/config/tuan.inc.php");
        $dataShare = (int)$customDataShare;

        if($dataShare) {
            $where = " OR `cid` = $type";
        }

        $page     = (int)$page;
        $pageSize = (int)$pageSize;

        $page     = empty($page) ? 1 : $page;
        $pageSize = empty($pageSize) ? 1000 : $pageSize;
        $atpage   = $pageSize * ($page - 1);
        $where    .= " LIMIT $atpage, $pageSize";

        $sql = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE `qid` = $type" . $where);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            return $ret;
        }
    }


    /**
     * 团购热门商圈
     * @return array
     */
    public function hotCircle()
    {
        global $dsql;
        $list = array();

        $where = "";

        //数据共享
        require(HUONIAOINC . "/config/tuan.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId();
            $where  = " AND `cid` = " . $cityid;
        }

        $sql     = $dsql->SetQuery("SELECT * FROM `#@__site_city_circle` WHERE `hot` = 1" . $where . " ORDER BY `id` ASC");
        $results = $dsql->dsqlOper($sql, "results");

        $list = array();
        if (count($results) > 0) {
            foreach ($results as $key => $value) {
                $list[$key]["id"]   = $value["id"];
                $list[$key]["name"] = $value["name"];
            }
        }
        return $list;
    }


    /**
     *商圈列表
     */
    public function circleList()
    {
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $page     = $pageSize = $where = "";
        // $cityid = getCityId();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $search   = $this->param['search'];
                $addrid   = $this->param['addrid'];
                $hot      = $this->param['hot'];
                $orderby  = $this->param['orderby'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        //数据共享
        require(HUONIAOINC . "/config/tuan.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            //遍历区域
            if ($cityid) {
                $where .= " AND `cid` = " . $cityid;
            }
        }

        if (!empty($hot)) {
            $where .= " and `hot` = '$hot'";
        }

        if (!empty($addrid)) {
            $where .= " and `qid` = '$addrid'";
        }

        if (!empty($search)) {
            $where .= " and `name` like '%$search%'";
        }

        //查询距离
        if ((!empty($lng)) && (!empty($lat))) {
            $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-`lat`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-`lng`)/360),2))))*1000 AS distance,";
        } else {
            $select = "";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__site_city_circle` WHERE 1 = 1" . $where);
        //print_R($archives);exit;
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

        $sql     = $dsql->SetQuery("SELECT `id`,`name`,`qid`,`lng`,`lat`,`openStart`,`openEnd`,`tel`," . $select . "`litpic` FROM `#@__site_city_circle` WHERE 1=1 $where ORDER BY `id` ASC");
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $where, "results");
        $list    = array();
        if (count($results) > 0) {
            foreach ($results as $key => $value) {
                $list[$key]["id"]        = $value["id"];
                $list[$key]["name"]      = $value["name"];
                $list[$key]["openStart"] = $value["openStart"];
                $list[$key]["openEnd"]   = $value["openEnd"];
                $list[$key]["tel"]       = $value["tel"];
                $list[$key]["lng"]       = $value["lng"];
                $list[$key]["lat"]       = $value["lat"];
                $list[$key]["litpic"]    = !empty($value["litpic"]) ? getFilePath($value["litpic"]) : '/static/images/404.jpg';
                $list[$key]['distance']  = $value['distance'] > 1000 ? sprintf("%.1f", $value['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $value['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米

                if (!empty($value['qid'])) {
                    $addrName = getParentArr("site_area", $value['qid']);
                    global $data;
                    $data                   = "";
                    $addrArr                = array_reverse(parent_foreach($addrName, "typename"));
                    $addrArr                = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                    $list[$key]['addrname'] = $addrArr;

                    global $data;
                    $data               = "";
                    $addrArr            = array_reverse(parent_foreach($addrName, "id"));
                    $list[$key]['city'] = count($addrArr) > 2 ? $addrArr[1] : $addrArr[0];

                } else {
                    $list[$key]['addrname'] = "";
                    $list[$key]['city']     = "";
                }

                //商家个数
                $archives               = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `cityid`='$cityid' and `state` = 1 and find_in_set(" . $value['id'] . ", `circle`) ");
                $totalCount             = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['storenum'] = $totalCount;

                $param = array(
                    "service"  => "tuan",
                    "template" => "sqdetail",
                    "id"       => $value['id']
                );
                $url   = getUrlPath($param);

                $list[$key]['url'] = $url;
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 商圈详情
     */
    public function circleDetail()
    {
        global $dsql;
        global $userLogin;
        $circleDetail = array();
        $id           = $this->param;
        $id           = is_numeric($id) ? $id : $id['id'];
        $uid          = $userLogin->getMemberID();
        $cityid       = getCityId();

        if (!is_numeric($id)) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $archives = $dsql->SetQuery("SELECT `id`,`cid`,`qid`,`name`,`openStart`,`openEnd`,`tel`,`lng`, `lat`, `litpic`, `address` FROM `#@__site_city_circle` WHERE `id` = '$id'");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $circleDetail["id"]        = $results[0]['id'];
            $circleDetail["cid"]       = $results[0]['cid'];
            $circleDetail["name"]      = $results[0]['name'];
            $circleDetail["openStart"] = $results[0]['openStart'];
            $circleDetail["openEnd"]   = $results[0]['openEnd'];
            $circleDetail["tel"]       = $results[0]['tel'];
            $circleDetail["lng"]       = $results[0]['lng'];
            $circleDetail["lat"]       = $results[0]['lat'];
            $circleDetail["litpic"]    = $results[0]['litpic'] ? getFilePath($results[0]['litpic']) : '';
            $circleDetail["address"]   = $results[0]['address'];
            //商家个数
            $archives                 = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `cityid`='$cityid' and `state` = 1 and  find_in_set(" . $results[0]['id'] . ", `circle`) ");
            $totalCount               = $dsql->dsqlOper($archives, "totalCount");
            $circleDetail['storenum'] = $totalCount;

            $addrName = getParentArr("site_area", $results[0]['qid']);
            global $data;
            $data                     = "";
            $addrArr                  = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr                  = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $circleDetail['addrname'] = $addrArr;
        }
        return $circleDetail;
    }


    /**
     * 商家列表
     */
    public function storeList()
    {
        global $dsql;
        global $langData;
        $pageinfo = $list = array();
        $page     = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $search        = $this->param['search'];
                $typeid        = $this->param['typeid'];
                $addrid        = $this->param['addrid'];
                $circle        = $this->param['circle'];
                $subway        = $this->param['subway'];
                $station       = $this->param['station'];
                $orderby       = $this->param['orderby'];
                $voucher       = $this->param['voucher'];//代金券
                $max_longitude = $this->param['max_longitude'];
                $min_longitude = $this->param['min_longitude'];
                $max_latitude  = $this->param['max_latitude'];
                $min_latitude  = $this->param['min_latitude'];
                $lng           = $this->param['lng'];
                $lat           = $this->param['lat'];
                $page          = $this->param['page'];
                $pageSize      = $this->param['pageSize'];
            }
        }

        $where = " AND `state` = 1";

        //数据共享
        require(HUONIAOINC . "/config/tuan.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            //遍历区域
            if ($cityid) {
                $where .= " AND `cityid` = '$cityid'";
            }
        }

        if (!empty($addrid)) {
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

        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "tuantype")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "tuantype"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }

            $where .= " AND `stype` in ($lower)";
        }

        if (!empty($circle)) {
            $where .= " AND find_in_set($circle, `circle`)";
        }

        //遍历地铁站点
        if (!empty($station)) {
            $where .= " and find_in_set($station, `subway`)";
        }

        //遍历地铁站
        if (!empty($subway) && empty($station)) {

            $sql = $dsql->SetQuery("SELECT s2.`id` FROM `#@__site_subway` s1 LEFT JOIN `#@__site_subway_station` s2 ON s2.`sid` = s1.`id` WHERE s1.`id` = $subway");
            $ret = $dsql->dsqlOper($sql, "results");

            $subwhere = array();
            if (!empty($ret)) {
                foreach ($ret as $key => $value) {
                    $subwhere[] = "find_in_set(" . $value['id'] . ", `subway`)";
                }
                $subwhereArr = join(' OR ', $subwhere);
                $where       .= " and ($subwhereArr)";
            }

        }

        if (!empty($search)) {
            $sidArr  = array();
            $userSql = $dsql->SetQuery("SELECT store.`id` FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON user.`id` = store.`uid` LEFT JOIN `#@__business_list` business ON business.`uid` = store.`uid` WHERE user.`company` like '%$search%' OR store.`address` like '%$search%' OR business.`title` like '%$search%'");
            $results = $dsql->dsqlOper($userSql, "results");
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }

            if (!empty($sidArr)) {
                $where .= " AND (`address` like '%$search%' OR `id` in (" . join(",", $sidArr) . "))";
            } else {
                $where .= " AND `address` like '%$search%'";
            }
        }

        //地图可视区域内
        if (!empty($max_longitude) && !empty($min_longitude) && !empty($max_latitude) && !empty($min_latitude)) {
            $where .= " AND `lng` <= '" . $max_longitude . "' AND `lng` >= '" . $min_longitude . "' AND `lat` <= '" . $max_latitude . "' AND `lat` >= '" . $min_latitude . "'";
        }

        //查询距离
        if ((!empty($lng)) && (!empty($lat))) {
            $select = "(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(" . $lat . "-`lat`)/360),2)+COS(3.1415926535898*" . $lat . "/180)* COS(`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(" . $lng . "-`lng`)/360),2))))*1000 AS distance,";
        } else {
            $select = "";
        }

        //排序
        switch ($orderby) {
            //浏览量
            case 1:
                $orderby_ = " ORDER BY `click` DESC, `weight` DESC, `istop` DESC, `id` DESC";
                break;
            //发布时间降序
            case 2:
                $orderby_ = " ORDER BY `jointime` DESC, `weight` DESC, `istop` DESC, `id` DESC";
                break;
            case 3:
                $orderby_ = " ORDER BY distance ASC";
                break;
            default:
                $orderby_ = " ORDER BY `weight` DESC, `istop` DESC, `id` DESC";
                break;
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE 1 = 1" . $where);
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

        $archives = $dsql->SetQuery("SELECT `jointime`, `pics`,`lat`,`lng`,`id`,`uid`,`stype`,`address`,`tel`,`addrid`,`score`,`lnglat`, " . $select . " `istop` FROM `#@__tuan_store` WHERE 1 = 1" . $where);
        $atpage   = $pageSize * ($page - 1);
        $where    = " LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $orderby_ . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']           = $val['id'];
                $list[$key]['stype']        = $val['stype'];
                $list[$key]['address']      = $val['address'];
                $list[$key]['jointime']     = $val['jointime'];
                $list[$key]["shortaddress"] = cn_substrR($val['address'], 8);
                $list[$key]['tel']          = $val['tel'];
                $list[$key]['score']        = $val['score'];
                $list[$key]['lnglat']       = $val['lnglat'];
                $list[$key]['lng']          = $val['lng'];
                $list[$key]['lat']          = $val['lat'];
                $list[$key]['istop']        = $val['istop'];
                $list[$key]['distance']     = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                if (strpos($list[$key]['distance'], '千米')) {
                    $list[$key]['distance'] = str_replace("千米", 'km', $list[$key]['distance']);
                } elseif (strpos($list[$key]['distance'], '米')) {
                    $list[$key]['distance'] = str_replace("米", 'm', $list[$key]['distance']);
                }

                //团购个数
                $time                  = time();
                $archives              = $dsql->SetQuery("SELECT `id` FROM `#@__tuanlist` WHERE `enddate`>'$time' and `arcrank` = 1 and `sid` = " . $val['id']);
                $totalCount            = $dsql->dsqlOper($archives, "totalCount");
                $list[$key]['tuannum'] = $totalCount;

                //代金券
                $voucheArr = array();
                if ($voucher == 1) {
                    $sql        = $dsql->SetQuery("SELECT `id`, `package`, `market`, `price`, `defbuynum`, `buynum` FROM `#@__tuanlist` WHERE `enddate`>'$time' and `packtype` = 1 and `arcrank` = 1 and `sid` = " . $val['id'] . " ORDER BY `weight` DESC, `istop` DESC, `id` DESC limit 10");
                    $voucherRes = $dsql->dsqlOper($sql, "results");
                    if (is_array($voucherRes)) {
                        foreach ($voucherRes as $k => $row) {
                            $packageVoucher              = explode("|||", $row['package']);
                            $packagerow                  = explode("$$$", $packageVoucher[0]);
                            $voucheArr[$k]               = array();
                            $voucheArr[$k]['id']         = $row['id'];
                            $voucheArr[$k]['packagerow'] = $packagerow;
                            $voucheArr[$k]['sale']       = $row['defbuynum'] + $row['buynum'];
                            $voucheArr[$k]['price']      = $row['price'];
                            $voucheArr[$k]['market']     = $row['market'];
                        }
                    }
                }
                $list[$key]['voucheArr'] = $voucheArr;

                //综合评分
                if ($totalCount == 0) {
                    $list[$key]['rating'] = 0;
                } elseif ($totalCount == 1) {
                    $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__tuanlist` WHERE `arcrank` = 1 and `sid` = " . $val['id']);
                    $tuanRes = $dsql->dsqlOper($sql, "results");

                    $sql                  = $dsql->SetQuery("SELECT avg(c.`rating`) r FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE c.`type` = 'tuan-order' AND c.`pid` = 0 AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $tuanRes[0]['id']);
                    $ratingRes            = $dsql->dsqlOper($sql, "results");
                    $list[$key]['rating'] = number_format($ratingRes[0]['r'], 1);
                } elseif ($totalCount > 1) {
                    $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__tuanlist` WHERE `arcrank` = 1 and `sid` = " . $val['id']);
                    $tuanRes = $dsql->dsqlOper($sql, "results");
                    $rating  = array();
                    foreach ($tuanRes as $row) {
                        $sql       = $dsql->SetQuery("SELECT avg(c.`rating`) r FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE c.`type` = 'tuan-order' AND c.`pid` = 0 AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $row['id']);
                        $ratingRes = $dsql->dsqlOper($sql, "results");
                        $rating[]  = $ratingRes[0]['r'];
                    }
                    $list[$key]['rating'] = number_format(max($rating), 1);
                }
                $list[$key]['rating'] = $list[$key]['rating'] <= 0 ? '5.0' : $list[$key]['rating'];

                //代金券
                /*前台显示代金卷查的是团购的套餐内容目的不是很明确,如果后期需求改到这请查询团购原价和现价就可*/
                $sql = $dsql->SetQuery("SELECT `package`,`market`,`price` FROM `#@__tuanlist` WHERE `packtype` = 2 and `sid` = " . $val['id'] . " AND `arcrank` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $package       = explode("|||", $ret[0]['package']);
                    $value         = explode("$$$", $package[0]);
                    $packageArr[0] = $value[0];
                    $packageArr[1] = $value[1];
                    $packageArr[2] = $value[2];
                    $packageArr[3] = $value[3];

                    $list[$key]['package']  = $packageArr;
                    $list[$key]['market']   = $ret[0]['market']; //市场价
                    $list[$key]['price']    = $ret[0]['price'];    //团购价
                    $list[$key]['vouchers'] = $value[1] . '&nbsp;' . $value[2];
                } else {
                    $list[$key]['package']  = "";
                    $list[$key]['vouchers'] = "";
                }

                $sql = $dsql->SetQuery("SELECT m.`company`, b.`title` FROM `#@__member` m LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` WHERE m.`id` = " . $val['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
                $list[$key]['company'] = $ret[0]['title'] ? $ret[0]['title'] : $ret[0]['company'];

                $sql = $dsql->SetQuery("SELECT `typename` FROM `#@__tuantype` WHERE `id` = " . $val['stype']);
                $ret = $dsql->dsqlOper($sql, "results");
                $list[$key]['typename'] = $ret[0]['typename'];

                $imglist = array();
                $pics    = $val['pics'];
                if (!empty($pics)) {
                    $pics = explode(",", $pics);
                    //foreach ($pics as $key => $value) {
                    $list[$key]['litpic'] = getFilePath($pics[0]);
                    //}
                } else {
                    $sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__tuanlist` WHERE `sid` = " . $val['id'] . " AND `arcrank` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $list[$key]['litpic'] = $ret[0]['litpic'] ? getFilePath($ret[0]['litpic']) : "";
                    } else {
                        $list[$key]['litpic'] = "/static/images/404.jpg";
                    }
                }

                /*$sql = $dsql->SetQuery("SELECT `litpic` FROM `#@__tuanlist` WHERE `sid` = ".$val['id']." AND `arcrank` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
				$ret = $dsql->dsqlOper($sql, "results");
				if($ret){
					$list[$key]['litpic'] = $ret[0]['litpic'] ? getFilePath($ret[0]['litpic']) : "";
				}else{
					$list[$key]['litpic'] = "/static/images/404.jpg";
				}*/

                if (!empty($val['addrid'])) {
                    $addrName = getParentArr("site_area", $val['addrid']);
                    global $data;
                    $data                   = "";
                    $addrArr                = array_reverse(parent_foreach($addrName, "typename"));
                    $addrArr                = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
                    $list[$key]['addrname'] = $addrArr;
                } else {
                    $list[$key]['addrname'] = "";
                }

                if (!empty($val['circle'])) {
                    $list[$key]["circleid"]   = explode(",", $val['circle']);
                    $list[$key]['circlelist'] = json_encode(explode(",", $val['circle']));
                    $circleArr                = array();
                    $sql                      = $dsql->SetQuery("SELECT `name` FROM `#@__site_city_circle` WHERE `id` in (" . $val['circle'] . ")");
                    $creturn                  = $dsql->dsqlOper($sql, "results");
                    if ($creturn) {
                        foreach ($creturn as $key => $value) {
                            $circleArr[$key] = $value['name'];
                        }
                    }
                    $list[$key]["circle"] = join("、", $circleArr);
                } else {
                    $list[$key]["circle"]     = "";
                    $list[$key]['circlelist'] = 0;
                }

                $param = array(
                    "service"  => "tuan",
                    "template" => "store",
                    "id"       => $val['id']
                );
                $url   = getUrlPath($param);

                $list[$key]['url'] = $url;
            }
            if ($orderby == 3) {//团购数量
                array_multisort(array_column($list, 'tuannum'), SORT_DESC, $list);
            }
        }
        //print_R($list);exit;
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 商家详细
     * @return array
     */
    public function storeDetail()
    {
        global $dsql;
        global $userLogin;
        $storeDetail = array();
        $id          = $this->param;
        $id          = is_numeric($id) ? $id : $id['id'];
        $gettype     = is_numeric($this->param) ? 0 : $this->param['gettype'];
        $uid         = $userLogin->getMemberID();

        $userinfo = $userLogin->getMemberInfo();

        $uid = $userinfo['is_staff'] ==1 ? $userinfo['companyuid'] : $uid;

        if (!is_numeric($id) && $uid == -1) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $where = '';
        if((int)$gettype == 0){

            $where = " AND `state` = 1";
        }
        if (!is_numeric($id)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $id    = $results[0]['id'];
                $where = "";
            } else {
                return array("state" => 200, "info" => '该会员暂未开通商铺！');
            }
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_store` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $storeDetail["id"]         = $results[0]['id'];
            $storeDetail["istop"]      = $results[0]['istop'];
            $storeDetail["wechatcode"] = $results[0]['wechatcode'];
            $storeDetail["is_vipguanggao"] = $results[0]['is_vipguanggao'];

            $sql = $dsql->SetQuery("SELECT m.`company`, b.`title` FROM `#@__member` m LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` WHERE m.`id` = " . $results[0]['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            $storeDetail['company'] = $ret[0]['title'] ? $ret[0]['title'] : $ret[0]['company'];

            $qq                   = $results[0]['qq'] ? explode(",", $results[0]['qq']) : array();
            $storeDetail["qq"]    = $qq ? $qq[0] : "";
            $storeDetail["qqArr"] = $qq;

            //评价
            // $sql = $dsql->SetQuery("SELECT avg(c.`rating`) r, avg(c.`score1`) s1, avg(c.`score2`) s2, avg(c.`score3`) s3 FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = ".$id);
            $sql    = $dsql->SetQuery("SELECT avg(c.`rating`) r, avg(c.`sco1`) s1, avg(c.`sco2`) s2, avg(c.`sco3`) s3 FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'tuan-order' AND l.`sid` = '$id' AND c.`pid` = 0");
            $res    = $dsql->dsqlOper($sql, "results");
            $rating = $res[0]['r'];        //总评分
            $score1 = $res[0]['s1'];  //分项1
            $score2 = $res[0]['s2'];  //分项2
            $score3 = $res[0]['s3'];  //分项3

            // $sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = ".$id);
            $sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid`  LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'tuan-order' AND  l.`sid` = '$id' AND c.`pid` = 0");

            $totalCommon = $dsql->dsqlOper($sql, "totalCount");  //评价总人数
            $rating1     = $dsql->dsqlOper($sql . " AND c.`rating` = 1", "totalCount");  //1分
            $rating2     = $dsql->dsqlOper($sql . " AND c.`rating` = 2", "totalCount");  //2分
            $rating3     = $dsql->dsqlOper($sql . " AND c.`rating` = 3", "totalCount");  //3分
            $rating4     = $dsql->dsqlOper($sql . " AND c.`rating` = 4", "totalCount");  //4分
            $rating5     = $dsql->dsqlOper($sql . " AND c.`rating` = 5", "totalCount");  //5分

            $storeDetail['totalCommon'] = $totalCommon;
            $storeDetail['rating']      = number_format($rating, 1);
            $storeDetail['rating']      = $storeDetail['rating'] <= 0 ? '5.0' : $storeDetail['rating'];
            $storeDetail['score1']      = number_format($score1, 1);
            $storeDetail['score2']      = number_format($score2, 1);
            $storeDetail['score3']      = number_format($score3, 1);
            $storeDetail['rating1']     = $rating1;
            $storeDetail['rating2']     = $rating2;
            $storeDetail['rating3']     = $rating3;
            $storeDetail['rating4']     = $rating4;
            $storeDetail['rating5']     = $rating5;

//			//评价
//			// $sql = $dsql->SetQuery("SELECT avg(`rating`) r, avg(`score1`) s1, avg(`score2`) s2, avg(`score3`) s3 FROM `#@__tuan_storecommon`  WHERE `ischeck` = 1 AND `aid` = ".$id);
//			$sql = $dsql->SetQuery("SELECT avg(`rating`) r, avg(`sco1`) s1, avg(`sco2`) s2, avg(`sco3`) s3 FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tuan-store' AND `aid` = '$id' AND `pid` = 0");
//			$res = $dsql->dsqlOper($sql, "results");
//			$rating = !empty($res[0]['r']) ? $res[0]['r'] : 0;		//总评分
//			$score1 = $res[0]['s1'];  //分项1
//			$score2 = $res[0]['s2'];  //分项2
//			$score3 = $res[0]['s3'];  //分项3
//
//			// $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_storecommon`  WHERE `ischeck` = 1 AND `aid` = ".$id);
//			$sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tuan-store' AND `aid` = '$id' AND `pid` = 0");
//			$totalCommon  = $dsql->dsqlOper($sql, "totalCount");  //评价总人数
//			$rating1      = $dsql->dsqlOper($sql." AND `rating` = 1", "totalCount");  //1分
//			$rating2      = $dsql->dsqlOper($sql." AND `rating` = 2", "totalCount");  //2分
//			$rating3      = $dsql->dsqlOper($sql." AND `rating` = 3", "totalCount");  //3分
//			$rating4      = $dsql->dsqlOper($sql." AND `rating` = 4", "totalCount");  //4分
//			$rating5      = $dsql->dsqlOper($sql." AND `rating` = 5", "totalCount");  //5分
//
//			$storeDetail['totalCommon'] = $totalCommon;
//			$storeDetail['rating'] = number_format($rating, 1);
//			$storeDetail['score1'] = number_format($score1, 1);
//			$storeDetail['score2'] = number_format($score2, 1);
//			$storeDetail['score3'] = number_format($score3, 1);
//			$storeDetail['rating1'] = $rating1;
//			$storeDetail['rating2'] = $rating2;
//			$storeDetail['rating3'] = $rating3;
//			$storeDetail['rating4'] = $rating4;
//			$storeDetail['rating5'] = $rating5;

            $sql     = $dsql->SetQuery("SELECT `id`,price FROM `#@__tuanlist` WHERE `arcrank` = 1 and `sid` = " . $results[0]['id']);
            $tuanRes = $dsql->dsqlOper($sql, "results");
            $rating  = $price = array();
            foreach ($tuanRes as $row) {
                $sql       = $dsql->SetQuery("SELECT avg(c.`rating`) r FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` WHERE c.`pid` = 0 AND c.`type` = 'tuan-order' AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $results[0]['id']);
                $ratingRes = $dsql->dsqlOper($sql, "results");
                $price[]   = $row['price'];
            }
            $storeDetail["price"] = !empty($price) ? number_format(array_sum($price) / count($price), 1) : 0;

            $uid                   = $results[0]['uid'];
            $storeDetail['member'] = getMemberDetail($uid);

            $storeDetail["typeid"] = $results[0]['stype'];
            global $data;
            $data     = "";
            $tuantype = getParentArr("tuantype", $results[0]['stype']);
            if ($tuantype) {
                $tuantype                    = array_reverse(parent_foreach($tuantype, "typename"));
                $storeDetail['typename']     = join(" > ", $tuantype);
                $storeDetail['typenameonly'] = count($tuantype) > 2 ? $tuantype[1] : $tuantype[0];
            } else {
                $storeDetail['typename']     = "";
                $storeDetail['typenameonly'] = "";
            }

            $storeDetail["addrid"] = $addrid = $results[0]['addrid'];

            $archives = $dsql->SetQuery("SELECT `parentid` FROM `#@__site_area` WHERE `id` = '$addrid'");
            $ret      = $dsql->dsqlOper($archives, "results");
            if ($ret) {
                $storeDetail["circleAddrid"] = $ret[0]['parentid'];
            }

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
            $storeDetail["lng"]         = $results[0]['lng'];
            $storeDetail["lat"]         = $results[0]['lat'];
            $storeDetail["phone"]       = $results[0]['phone'];
            $storeDetail["video"]       = $results[0]['video'];
            $storeDetail["sourcevideo"] = $results[0]['video'] ? getFilePath($results[0]['video']) : '';
            //验证是否已经收藏
            $params                 = array(
                "module" => "tuan",
                "temp"   => "store",
                "type"   => "add",
                "id"     => $results[0]['id'],
                "check"  => 1
            );
            $collect                = checkIsCollect($params);
            $storeDetail['collect'] = $collect == "has" ? 1 : 0;
            //图集
            $imglist = array();
            $pics    = $results[0]['pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['path']       = getFilePath($value);
                    $imglist[$key]['pathSource'] = $value;
                }
            } else {
                $sql                   = $dsql->SetQuery("SELECT `litpic` FROM `#@__tuanlist` WHERE `sid` = '$id' AND `arcrank` = 1 ORDER BY `weight` DESC, `id` DESC LIMIT 0,1");
                $ret                   = $dsql->dsqlOper($sql, "results");
                $imglist[$key]['path'] = getFilePath($ret[0]['litpic']);
            }
            $storeDetail['pics'] = $imglist;


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

            $param              = array(
                "service"  => "tuan",
                "template" => "store",
                "id"       => $id
            );
            $url                = getUrlPath($param);
            $storeDetail['url'] = $url;


            //统计评论数量
            //$sql = $dsql->SetQuery("SELECT count(c.`id`) totalCommon FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` WHERE c.`ischeck` = 1 AND l.`sid` = " . $id);
            // $sql = $dsql->SetQuery("SELECT count(`id`) totalCommon FROM `#@__tuan_storecommon`  WHERE `ischeck` = 1 AND `aid` = " . $id);
            // $sql                        = $dsql->SetQuery("SELECT count(`id`) totalCommon FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tuan-store' AND `aid` = '$id' AND `pid` = 0");
            // $ret                        = $dsql->dsqlOper($sql, "results");
            // $storeDetail['totalCommon'] = $ret[0]['totalCommon'];

            $storeDetail['cityid'] = $results[0]['cityid'];
            $storeDetail['shopFee'] = $results[0]['shopFee'];

        }
        return $storeDetail;
    }


    /**
     * 团购列表
     * @return array
     */
    public function tlist()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $all      = $store = $typeid = $addrid = $business = $subway = $station = $title = $item = $flag = $orderby = $u = $state = $filter = $rec = $page = $pageSize = $where = $where1 = "";
        $tj       = true;
        require(HUONIAOINC . "/config/tuan.inc.php");

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $all      = (int)$this->param['all'];
                $iscity   = (int)$this->param['iscity'];
                $store    = $this->param['store'];
                $typeid   = (int)$this->param['typeid'];
                $addrid   = (int)$this->param['addrid'];
                $business = (int)$this->param['business'];
                $subway   = (int)$this->param['subway'];
                $station  = (int)$this->param['station'];
                $title    = $this->param['title'];
                $item     = $this->param['item'];
                $flag     = $this->param['flag'];
                $orderby  = $this->param['orderby'];
                $u        = (int)$this->param['u'];
                $state    = $this->param['state'];
                $rec      = $this->param['rec'];
                $filter   = $this->param['filter'];
                $hourly   = $this->param['hourly'];
                $time     = (int)$this->param['time'];
                $pin      = $this->param['pin'];
                $packtype = (int)$this->param['packtype'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();


        $uid = $userinfo['is_staff'] ==1 ? $userinfo['companyuid'] : $uid;


        // $city = GetCookie("tuan_city");
        // if(empty($city)) return array("state" => 200, "info" => "城市设置失败");

        $orderby_ = " ORDER BY l.`weight` DESC, l.`id` DESC";

        //商家
        if (!empty($store)) {

            if($userinfo['is_staff'] ==1 || $userinfo['mtype'] ==2){

                if(!verifyModuleAuth(array("module" => "tuan","type" =>'2'))){
                    return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
                }
            }
            $store = is_array($store) && isset($store['sid']) ? $store['sid'] : $store;
            $where .= " AND l.`sid` = $store";

            if ($uid != $store) {
                $where .= " AND l.`arcrank` = 1 AND l.`enddate` > " . GetMkTime(time());
            }

            //套餐类型
            if (!empty($packtype)) {
                $where .= " AND l.`packtype` = '$packtype'";
            }
        } else {
            //如果是商家会员获取列表，则不通过城市筛选
            if (empty($u) && !$all) {
                //获取当前城市所有商品
                $lower = 0;
                // $cityInfo = $this->getCity();

                //数据共享
                require(HUONIAOINC . "/config/tuan.inc.php");
                $dataShare = (int)$customDataShare;

                if (!$dataShare) {
                    $cityid = getCityId();
                    if ($cityid) {

                        $sidArr   = array();
                        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `state` = 1 AND `cityid` = $cityid");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if (is_array($results)) {
                            foreach ($results as $key => $value) {
                                $sidArr[$key] = $value['id'];
                            }
                            if (!empty($sidArr)) {
                                $where .= " AND l.`sid` in (" . join(",", $sidArr) . ")";
                            } else {
                                $tj    = false;
                                $where .= " AND 0 = 1";
                            }
                        } else {
                            $tj    = false;
                            $where .= " AND 0 = 1";
                        }

                    }
                }
            }

            //遍历分类
            if (!empty($typeid) && $tj) {
                if ($dsql->getTypeList($typeid, "tuantype")) {
                    global $arr_data;
                    $arr_data = array();
                    $lower    = arr_foreach($dsql->getTypeList($typeid, "tuantype"));
                    $lower    = $typeid . "," . join(',', $lower);
                } else {
                    $lower = $typeid;
                }

                $sidArr   = array();
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `stype` in ($lower)");
                $results  = $dsql->dsqlOper($archives, "results");
                if (is_array($results)) {
                    foreach ($results as $key => $value) {
                        $sidArr[$key] = $value['id'];
                    }
                    if (!empty($sidArr)) {
                        $where .= " AND l.`sid` in (" . join(",", $sidArr) . ")";
                    } else {
                        $tj    = false;
                        $where .= " AND 1 = 2";
                    }
                } else {
                    $tj    = false;
                    $where .= " AND 1 = 2";
                }
            }

            //遍历地区
            if (!empty($addrid) && $tj) {
                if ($dsql->getTypeList($addrid, "site_area")) {
                    global $arr_data;
                    $arr_data = array();
                    $lower    = arr_foreach($dsql->getTypeList($addrid, "site_area"));
                    $lower    = $addrid . "," . join(',', $lower);
                } else {
                    $lower = $addrid;
                }
                $addridArr = array();
                $archives  = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `addrid` in ($lower)");
                //echo $archives;die;
                $results = $dsql->dsqlOper($archives, "results");
                foreach ($results as $key => $value) {
                    $addridArr[$key] = $value['id'];
                }
                if (!empty($addridArr)) {
                    $where .= " AND l.`sid` in (" . join(",", $addridArr) . ")";
                } else {
                    $tj    = false;
                    $where .= " AND 3 = 4";
                }

            }

            //遍历商圈
            if (!empty($business) && $tj) {

                $addridArr = array();
                $archives  = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE find_in_set($business, `circle`)");
                $results   = $dsql->dsqlOper($archives, "results");
                foreach ($results as $key => $value) {
                    $addridArr[$key] = $value['id'];
                }
                if (!empty($addridArr)) {
                    $where .= " AND l.`sid` in (" . join(",", $addridArr) . ")";
                } else {
                    $tj    = false;
                    $where .= " AND 5 = 6";
                }

            }


            //遍历地铁站
            if (!empty($subway) && empty($station) && $tj) {

                $sql = $dsql->SetQuery("SELECT s2.`id` FROM `#@__site_subway` s1 LEFT JOIN `#@__site_subway_station` s2 ON s2.`sid` = s1.`id` WHERE s1.`id` = $subway");
                $ret = $dsql->dsqlOper($sql, "results");

                $subwhere = array();
                // $subwhere[] = "find_in_set($station, `subway`)";
                if (!empty($ret)) {
                    foreach ($ret as $key => $value) {
                        $subwhere[] = "find_in_set(" . $value['id'] . ", `subway`)";
                    }
                }

                $stationArr = array();
                $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE (" . join(" OR ", $subwhere) . ")");
                $results    = $dsql->dsqlOper($archives, "results");
                foreach ($results as $key => $value) {
                    $stationArr[$key] = $value['id'];
                }
                if (!empty($stationArr)) {
                    $where .= " AND l.`sid` in (" . join(",", $stationArr) . ")";
                } else {
                    $tj    = false;
                    $where .= " AND 9 = 10";
                }

            }


            //遍历地铁站点
            if (!empty($station) && $tj) {

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_subway_station` WHERE `id` = $station ORDER BY `weight`");
                $ret = $dsql->dsqlOper($sql, "results");

                $subwhere   = array();
                $subwhere[] = "find_in_set($station, `subway`)";
                if (!empty($ret)) {
                    foreach ($ret as $key => $value) {
                        $subwhere[] = "find_in_set(" . $value['id'] . ", `subway`)";
                    }
                }

                $stationArr = array();
                $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE (" . join(" OR ", $subwhere) . ")");
                $results    = $dsql->dsqlOper($archives, "results");
                foreach ($results as $key => $value) {
                    $stationArr[$key] = $value['id'];
                }
                if (!empty($stationArr)) {
                    $where .= " AND l.`sid` in (" . join(",", $stationArr) . ")";
                } else {
                    $tj    = false;
                    $where .= " AND 7 = 8";
                }

            }


            //关键字
            if (!empty($title) && $tj) {

                //搜索记录
                siteSearchLog("tuan", $title);

                $sidArr  = array();
                $userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE `user`.company like '%$title%' OR `store`.address like '%$title%'");
                $results = $dsql->dsqlOper($userSql, "results");
                foreach ($results as $key => $value) {
                    $sidArr[$key] = $value['id'];
                }

                if (!empty($sidArr)) {
                    $where .= " AND (l.`title` like '%$title%' OR l.`sid` in (" . join(",", $sidArr) . "))";
                } else {
                    $where .= " AND l.`title` like '%$title%'";
                }
            }

            //取出字段表中满足条件的所有信息ID Start
            if (!empty($item)) {
                $item = explode("$$", $item);
                foreach ($item as $k => $v) {
                    $v = explode(",", $v);
                    if (!empty($v[1])) {
                        $archives = $dsql->SetQuery("SELECT `aid` FROM `#@__tuanitem` WHERE `iid` = " . $v[0] . " AND find_in_set('" . $v[1] . "', `value`)");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if ($results) {
                            $ids = array();
                            foreach ($results as $key => $val) {
                                $ids[$key] = $val['aid'];
                            }
                            $where .= " AND l.`id` in (" . join(",", $ids) . ")";
                        } else {
                            $where .= " AND 8 = 9";
                        }
                    }
                }
            }


            //自定义属性
            if (!empty($flag)) {
                $flags = explode(",", $flag);
                foreach ($flags as $key => $value) {
                    $where .= " AND find_in_set('$value', l.`flag`)";
                }
            }

            $juli = "";
            if ($lat && $lng) {
                $juli = ", ROUND((2 * 6378.137 * ASIN(SQRT(POW(SIN(3.1415926535898 * ($lat - s.`lat`) / 360), 2) + COS(3.1415926535898 * $lat / 180) * COS($lat * 3.1415926535898 / 180) * POW(SIN(3.1415926535898 * ($lng - s.`lng`) / 360), 2)))) * 1000) AS juli ";
            }

            //有限期，结束日期必须大于当前时间
            //$where .= " AND (`startdate` < ".GetMkTime(time())." AND `enddate` > ".GetMkTime(time()).")";

            //排序
            if($orderby == 6 && (!$lng || !$lat)){
                $orderby = 0;
            }
            switch ($orderby) {
                //默认
                case 0:
                    $orderby_ = " ORDER BY l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //销量降序
                case 1:
                    $orderby_ = " ORDER BY (l.`buynum`+l.`defbuynum`) DESC, l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //销量升序
                case 2:
                    $orderby_ = " ORDER BY (l.`buynum`+l.`defbuynum`) ASC, l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //价格升序
                case 3:
                    $orderby_ = " ORDER BY l.`price` ASC, l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //价格降序
                case 4:
                    $orderby_ = " ORDER BY l.`price` DESC, l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //发布时间降序
                case 5:
                    $orderby_ = " ORDER BY l.`pubdate` DESC, l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
                //距离升序
                case 6:
                    $orderby_ = " ORDER BY juli ASC";
                    break;
                default:
                    $orderby_ = " ORDER BY l.`weight` DESC, l.`istop` DESC, l.`id` DESC";
                    break;
            }

            //推荐
            if (!empty($rec)) {
                $where .= " AND l.`rec` = 1";
            }

            // 区分普通团购和拼团
            if ($pin == 2) {
                $where .= " AND l.`pin` = 0";
            } elseif ($pin == 1) {
                $where .= " AND l.`pin` = 1";
            }

            //套餐类型
            if (!empty($packtype)) {
                $where .= " AND l.`packtype` = '$packtype'";
            }

            //筛选
            if (!empty($filter)) {
                $today   = GetMkTime(date("Y-m-d"));
                $prevDay = GetMkTime(date("Y-m-d", strtotime("-1 day")));
                $nextDay = GetMkTime(date("Y-m-d", strtotime("+1 day")));

                if ($filter == "today") {
                    $where .= " AND (l.`startdate` >= " . $today . " AND l.`startdate` < " . $nextDay . ")";
                } elseif ($filter == "old") {
                    $where .= " AND (l.`startdate` >= " . $prevDay . " AND l.`startdate` < " . $today . ")";
                } elseif ($filter == "foreshow") {
                    $where .= " AND l.`startdate` >= " . $nextDay;
                }
            }

            //整点团
            if (!empty($hourly)) {
                $start = $time - 3600;
                $where .= " AND l.`hourly` = 1 AND l.`startdate` >= '$start' AND l.`enddate` <= '$time'";
            }

            //显示当前的城市 团购
            if (!empty($iscity)) {

                //数据共享
                require(HUONIAOINC . "/config/tuan.inc.php");
                $dataShare = (int)$customDataShare;

                if (!$dataShare) {
                    $cityid = getCityId();
                    if ($cityid) {
                        $sidArr   = array();
                        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `state` = 1 AND `cityid` = $cityid");
                        $results  = $dsql->dsqlOper($archives, "results");
                        if (is_array($results)) {
                            foreach ($results as $key => $value) {
                                $sidArr[$key] = $value['id'];
                            }
                            if (!empty($sidArr)) {
                                $where .= " AND l.`sid` in (" . join(",", $sidArr) . ")";
                            } else {
                                $where .= " AND 11 = 12";
                            }
                        } else {
                            $where .= " AND 12 = 13";
                        }
                    }
                }
            }


            //已结束团购统计
            $finish = 0;

            //是否输出当前登录会员的信息
            if ($u != 1) {
                $where .= " AND s.`state` = 1 AND l.`arcrank` = 1 AND l.`enddate` > " . GetMkTime(time());
            } else {

                if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan"))) {
                    return array("state" => 200, "info" => '商家权限验证失败！');
                }

                $sql      = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = $uid");
                $storeRes = $dsql->dsqlOper($sql, "results");
                if ($storeRes) {
                    $where .= " AND l.`sid` = " . $storeRes[0]['id'];
                } else {
                    $where .= " AND 1 = 2";
                }

                //查询已结束的团购
                $finishArchives = $dsql->SetQuery("SELECT l.`id` FROM `#@__tuanlist` l WHERE ((l.`enddate` < " . GetMkTime(time()) . " AND l.`defbuynum` + l.`buynum` > l.`maxnum`) OR (l.`maxnum` != 0 AND l.`defbuynum` + l.`buynum` > l.`maxnum`))" . $where);
                //统计已结束团购数量
                $finish = $dsql->dsqlOper($finishArchives, "totalCount");


                if ($state != "" && $state != 3) {
                    $where1 = " AND l.`arcrank` = " . $state;
                } else {
                    $ids = array();
                    //结束信息ID
                    if ($state == 3) {
                        $finishResults = $dsql->dsqlOper($finishArchives, "results");
                        if ($finishResults) {
                            foreach ($finishResults as $v) {
                                $ids[] = $v['id'];
                            }
                        }
                    }

                    if ($state != "") {
                        if (!empty($ids)) {
                            $where1 .= " AND l.`id` in (" . join(",", $ids) . ")";
                        } else {
                            $where1 .= " AND 1 = 2";
                        }
                    }
                }
            }

        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

		if($orderby == 6){
			$archives = $dsql->SetQuery("SELECT " .
            "l.`id`, l.`sid`, l.`pin`, l.`rec`, l.`pinprice`, l.`package`, l.`istop`, l.`title`, l.`subtitle`, l.`startdate`, l.`enddate`, l.`defbuynum`, l.`buynum`, l.`maxnum`, l.`limit`, l.`litpic`, l.`market`, l.`price`, l.`packtype`, l.`flag`, l.`arcrank` ".$juli." , l.`pubdate` " .
            "FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` " .
            "WHERE " .
            "1 = 1 AND s.`id` is not null" . $where);
		}else{
			$archives = $dsql->SetQuery("SELECT " .
            "l.`id`, l.`sid`, l.`pin`, l.`rec`, l.`pinprice`, l.`package`, l.`istop`, l.`title`, l.`subtitle`, l.`startdate`, l.`enddate`, l.`defbuynum`, l.`buynum`, l.`maxnum`, l.`limit`, l.`litpic`, l.`market`, l.`price`, l.`packtype`, l.`flag`, l.`arcrank`, l.`pubdate` " .
            "FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` " .
            "WHERE " .
            "1 = 1 AND s.`id` is not null" . $where);
		}



        //print_R($where);exit;
        //总条数
        $totalCount = (int)$dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        if ($totalCount == 0) return array("state" => 100, "pageInfo" => $pageinfo, "list" => array());

        //会员列表需要统计信息状态
        if ($u == 1 && $uid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND l.`arcrank` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND l.`arcrank` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND l.`arcrank` = 2", "totalCount");
            //已下架
            $totalOffshelf = $dsql->dsqlOper($archives . " AND l.`arcrank` = 6", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
            $pageinfo['finish'] = $finish;
            $pageinfo['offshelf']=$totalOffshelf;
        }

        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where1 . $orderby_ . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                //实际购买数量，不统计未付款和已退款的
                $ordersql = $dsql->SetQuery("SELECT SUM(`procount`) as countid FROM `#@__tuan_order` WHERE `proid` = " . $val['id'] . " AND `orderstate` != 0 AND `orderstate` != 7");
                $ordernum = $dsql->dsqlOper($ordersql, "results");
                $buynum   = is_array($ordernum) && $ordernum[0]['countid'] ? $ordernum[0]['countid'] : 0;

                $list[$key]['id']         = $val['id'];
                $list[$key]['title']      = $val['title'];
                $list[$key]["shorttitle"] = cn_substrR($val['title'], 12);
                $list[$key]['subtitle']   = str_replace(array("\r\n", "\r", "\n"), '', $val['subtitle']);
                $list[$key]['sale']       = $val['defbuynum'] + $buynum;
                $list[$key]['startdate']  = $val['startdate'];
                $list[$key]['enddate']    = $val['enddate'];
                $list[$key]['litpic']     = getFilePath($val['litpic']);
                $list[$key]['market']     = $val['market'];
                $list[$key]['price']      = $val['price'];
                $list[$key]['pinprice']   = $val['pinprice'];
                $list[$key]['packtype']   = $val['packtype'];
                $list[$key]['discount']   = $val['market'] ? sprintf("%.1f", ($val['price'] / $val['market']) * 10) : 0;
                $list[$key]['flag']       = explode(",", $val['flag']);
                $list[$key]['istop']      = $val['istop'];
                $list[$key]['rec']        = $val['rec'];
                $list[$key]['pubdate']    = $val['pubdate'];

                $maxnum = $val['maxnum'];
                $limit  = $val['limit'];
                $sale   = $val['defbuynum'] + $buynum;
                $comp   = $maxnum != 0 ? $maxnum - $sale : 0;
                $limit  = $limit != 0 ? ($comp == -1 ? $limit : ($comp > $limit ? $limit : $comp)) : $comp;
                $limit  = $limit > 0 ? $limit : 0;
                $list[$key]['limit'] = (int)$limit;


                //状态
                if (GetMkTime(time()) > $val["enddate"]) {
                    $list[$key]['state'] = 1;//已结束
                } else {
                    //获取的是当前的
                    if (($val["defbuynum"] + $buynum) > $val["maxnum"]) {
                        $list[$key]['state'] = 2;//已卖完
                    } else {
                        if ($hourly == 1) {
                            if (time() < $time - 3600) {//大于现在的时间
                                //是否订阅
                                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_remind`  WHERE `state` = '0' and `tid` = '$val[id]' and `uid` = '$uid'");
                                $res = $dsql->dsqlOper($sql, "results");
                                if (!empty($res)) {
                                    $list[$key]['state'] = 4;//取消提醒
                                } else {
                                    $list[$key]['state'] = 5;//提醒我
                                }
                            } else {
                                $list[$key]['state'] = 3;//立即抢购
                            }
                        } else {
                            $list[$key]['state'] = 3;//立即抢购
                        }
                    }
                }
                //火热拼团
                if ($pin == 1) {
                    if ($val['pin'] == 1) {

                        $sql = $dsql->SetQuery("SELECT sum(p.`people`) num FROM `#@__tuan_pin` p LEFT JOIN `#@__member` m ON m.`id` = p.`userid` WHERE p.`state` = 1 AND p.`tid` = '$val[id]'");
                        $_res = $dsql->dsqlOper($sql, "results");

                        $list[$key]['pinList'] = array();
                        $list[$key]['pinnum'] = !empty($_res[0]['num']) ? $_res[0]['num'] : 0;

                        $sql = $dsql->SetQuery("SELECT p.`userid`, m.`nickname`, m.`photo` FROM `#@__tuan_pin` p LEFT JOIN `#@__member` m ON m.`id` = p.`userid` WHERE p.`state` = 1 AND p.`tid` = '$val[id]' ORDER BY p.`id` DESC LIMIT 0, 5");
                        $res = $dsql->dsqlOper($sql, "results");
                        if ($res) {
                            foreach ($res as $k => $v) {
                                $list[$key]['pinList'][$k] = array(
                                    'userid' => $v['userid'],
                                    'name'   => $v['nickname'],
                                    'photo'  => $v['photo'] ? getFilePath($v['photo']) : '/static/images/noPhoto_100.jpg'
                                );
                            }
                        }
                        
                    }
                }
                //代金券
                if ($packtype == 1) {
                    $package = explode("|||", $val['package']);
                    $row     = explode("$$$", $package[0]);
                    //$packageArr[0] = $row[0];
                    //$packageArr[1] = $row[1];
                    //$packageArr[2] = $row[2];
                    //$packageArr[3] = $row[3];
                    $list[$key]['package']      = cn_substrR($row[0], 10);
                    $list[$key]['packagename']  = cn_substrR($row[0], 10);
                    $list[$key]['packageprice'] = $row[1];
                    $list[$key]['packagenum']   = $row[2];
                    $list[$key]['packagetotal'] = $row[3];

                    if ($uid > -1) {

                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_voucher`  WHERE `state` = '0' and `tid` = '$val[id]' and `uid` = '$uid' limit 1");
                        $res = $dsql->dsqlOper($sql, "results");
                        if (!empty($res)) {
                            $list[$key]['voucherstate'] = 1;//已领取
                        } else {
                            $list[$key]['voucherstate'] = 2;//未领取
                        }
                    } else {
                        $list[$key]['voucherstate'] = 2;//未领取
                    }
                }

                //评价
                $sql    = $dsql->SetQuery("SELECT avg(c.`rating`) r FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE c.`type` = 'tuan-order' AND c.`pid` = 0 AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $val['id']);
                $res    = $dsql->dsqlOper($sql, "results");
                $rating = $res[0]['r'];

                $sql         = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE c.`type` = 'tuan-order' AND c.`pid` = 0 AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $val['id']);
                $totalCommon = $dsql->dsqlOper($sql, "totalCount");  //评价总人数

                $list[$key]['common']['rating'] = number_format($rating, 1);
                $list[$key]['common']['count']  = $totalCommon;


                $this->param         = $val['sid'];
                $list[$key]['store'] = $this->storeDetail();

                if (!empty($lat) && !empty($lng)) {
                    $lng1 = $list[$key]['store']['lng'];
                    $lat1 = $list[$key]['store']['lat'];

                    $distance = 0;
                    if ($lat1 && $lng1) {
                        $distance = (2 * 6378.137 * ASIN(SQRT(POW(SIN(3.1415926535898 * ($lat - $lat1) / 360), 2) + COS(3.1415926535898 * $lat / 180) * COS($lat1 * 3.1415926535898 / 180) * POW(SIN(3.1415926535898 * ($lng - $lng1) / 360), 2)))) * 1000;
                    }
                    $list[$key]['distance'] = $distance > 1000 ? sprintf("%.1f", $distance / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $distance) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                    if (strpos($list[$key]['distance'], '千米')) {
                        $list[$key]['distance'] = str_replace("千米", 'km', $list[$key]['distance']);
                    } elseif (strpos($list[$key]['distance'], '米')) {
                        $list[$key]['distance'] = str_replace("米", 'm', $list[$key]['distance']);
                    }
                } else {
                    $list[$key]['distance'] = '0m';
                }

                //商家会员中心团购列表
                if ($u == 1 && $uid > -1) {
                    $list[$key]['buynum'] = $buynum;

                    $property = $val['arcrank'];
                    if (GetMkTime(time()) > $val["enddate"]) {
                        if (($val["defbuynum"] + $buynum) > $val["maxnum"]) {
                            $property = "3";
                        }
                    }

                    $list[$key]['arcrank'] = $property;
                    $list[$key]['pubdate'] = $val['pubdate'];

                    //评价数量
                    $sql                  = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE c.`type` = 'tuan-order' AND c.`pid` = 0 AND o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = " . $val['id']);
                    $totalCommon          = $dsql->dsqlOper($sql, "totalCount");
                    $list[$key]['common'] = $totalCommon;

                }

                $param             = array(
                    "service"  => "tuan",
                    "template" => "detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 团购详细
     * @return arrayg
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        $tuanDetail = array();
        $id         = $this->param;
        $id         = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        global $do;
        $where = " AND (`arcrank` = 1 or `arcrank` = 6)";
        if ($do == "edit") {
            $where = "";
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuanlist` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        //实际购买数量，不统计未付款和已退款的
        $ordersql = $dsql->SetQuery("SELECT SUM(`procount`) as countid FROM `#@__tuan_order` WHERE `proid` = " . $id . " AND `orderstate` != 0 AND `orderstate` != 7");
        $ordernum = $dsql->dsqlOper($ordersql, "results");
        $buynum   = $ordernum[0]['countid'];
//         var_dump($buynum );die;
        if ($results) {
            $results = $results[0];

            $tuanDetail["id"]        = $results['id'];
            $tuanDetail["state"]     = $results['arcrank'];
            $tuanDetail["sid"]       = $results['sid'];
            $tuanDetail["title"]     = $results['title'];
            $tuanDetail["subtitle"]  = str_replace(array("\r\n", "\r", "\n"), '', $results['subtitle']);
            $tuanDetail["startdate"] = $results['startdate'];
            $tuanDetail["enddate"]   = $results['enddate'];
            $tuanDetail["minnum"]    = $results['minnum'];
            $tuanDetail["fx_reward"]    = $results['fx_reward'];
            $tuanDetail["hourly"]    = $results['hourly'];
            $tuanDetail["istop"]     = $results['istop'];
            $tuanDetail["is_tuikuan"]= $results['is_tuikuan'];
            $tuanDetail["video"]     = $results['video'] ? getFilePath($results['video']) : '';
            $tuanDetail['arcrank']   = $results['arcrank'];

            //判断是否整点秒杀
            if ($results['hourly'] == 1) {

                $nowH     = date("H") + 1;
                $nextHour = GetMkTime(date("Y-m-d") . ' ' . $nowH . ":00:00");
                $start    = $nextHour - 3600;

                $time = $results['enddate'] - $results['startdate'];

                if ($results['startdate'] >= $start && $results['enddate'] <= $nextHour) {
                    $tuanDetail["secKill"] = 1;
                } elseif ($results['startdate'] >= $nextHour && $time == 3600 && (date("Y-m-d", $results['startdate']) == date("Y-m-d"))) {
                    $tuanDetail["secKill"] = 1;
                }
            }

            if (!empty($results['flag'])) {
                $flag     = array('yexiao', 'yuyue', 'duotaocan', 'quan', 'dujia', 'baozhang', 'zhutui');
                $flagList = array('夜宵可用', '免预约', '多套餐', '代金券', '独家', '保障', '主推');
                $flagArr  = explode(",", $results['flag']);
                foreach ($flagArr as $row) {
                    $flagNum            = array_search($row, $flag);
                    $tuanDetail["flag"] .= $flagList[$flagNum] . ',';
                }
                $tuanDetail["flag"] = rtrim($tuanDetail["flag"], ',');
            }

            $maxnum = $results['maxnum'];
            $limit  = $results['limit'];
            $old_limit = $limit; // 写入的原始limit
            $sale   = $results['defbuynum'] + $buynum;
            $comp   = $maxnum != 0 ? $maxnum - $sale : 0;
            $limit  = $limit != 0 ? ($comp == -1 ? $limit : ($comp > $limit ? $limit : $comp)) : $comp;
            $limit  = $limit > 0 ? $limit : 0;

            $tuanDetail["maxnum"] = $maxnum;
            $tuanDetail['limit_day'] = $results['limit_day'];
            $tuanDetail['limit_start'] = $results['limit_start'];
            $tuanDetail['limit_end'] = $results['limit_end'];
            $tuanDetail["limit"]  = $limit;
            $tuanDetail["sale"]   = $sale;

            $tuanDetail["tuantype"]    = $results['tuantype'];
            $tuanDetail["expireddate"] = $results['expireddate'];
            $tuanDetail["expire_type"] = $results['expire_type'];
            $tuanDetail["expire_limit"]= $results['expire_limit'];
            $tuanDetail["amount"]      = $results['amount'];
            $tuanDetail["freight"]     = $results['freight'];
            $tuanDetail["freeshi"]     = $results['freeshi'];
            $tuanDetail["litpic"]      = getFilePath($results['litpic']);
            $tuanDetail["market"]      = $results['market'];
            $tuanDetail["price"]       = $results['price'];
            $tuanDetail['discount']    = $results['market'] > 0 ? sprintf("%.1f", ($results['price'] / $results['market']) * 10) : 0;
            $tuanDetail["typeid"]      = $results['typeid'];
            $tuanDetail["tips"]        = $results['tips'];
            $tuanDetail["body"]        = decodeAttachmentUrl($results['body']);
            $tuanDetail["mbody"]       = decodeAttachmentUrl($results['mbody']);
            $tuanDetail["pin"]         = $results['pin'];
            $tuanDetail["pinprice"]    = $results['pinprice'];
            $tuanDetail["pinpeople"]   = $results['pinpeople'];

            $param             = array(
                "service"  => "tuan",
                "template" => "detail",
                "id"       => $id
            );
            $tuanDetail['url'] = getUrlPath($param);

            if ($do == "edit") {
                $tuanDetail["litpicSource"] = $results['litpic'];
                $tuanDetail["flags"]        = explode(",", $results['flag']);
            }

            //购买须知
            $notice    = $results['notice'];
            $noticeArr = array();
            if (!empty($notice)) {
                $notice = explode("|||", $notice);
                foreach ($notice as $key => $value) {
                    $val                      = explode("$$$", $value);
                    $noticeArr[$key]['title'] = $val[0];
                    $noticeArr[$key]['note']  = str_replace(array("\r\n", "\n", "\r"), '<br />', $val[1]);
                }
            }
            $tuanDetail['notice'] = $noticeArr;

            //套餐内容
            $packtype = $results['packtype'];
            $package  = $results['package'];

            $tuanDetail['packtype'] = $packtype;

            $packageArr = array();
            if (!empty($package)) {
                $package = explode("|||", $package);

                //单项
                if ($packtype == 1) {
                    $val           = explode("$$$", $package[0]);
                    $packageArr[0] = $val[0];
                    $packageArr[1] = $val[1];
                    $packageArr[2] = $val[2];
                    $packageArr[3] = $val[3];

                    //多项
                } elseif ($packtype == 2) {

                    foreach ($package as $key => $value) {
                        $val                       = explode("@@@", $value);
                        $packageArr[$key]['title'] = $val[0];

                        $tabs = explode("~~~", $val[1]);
                        foreach ($tabs as $k => $v) {
                            $tr                            = explode("$$$", $v);
                            $packageArr[$key]['tr'][$k][0] = $tr[0];
                            $packageArr[$key]['tr'][$k][1] = $tr[1];
                            $packageArr[$key]['tr'][$k][2] = $tr[2];
                            $packageArr[$key]['tr'][$k][3] = $tr[3];
                        }
                    }
                }
            }

            $tuanDetail['package'] = $packageArr;

            //图集
            $imglist = array();
            $pics    = $results['pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['path']       = getFilePath($value);
                    $imglist[$key]['pathSource'] = $value;
                }
            }
            $tuanDetail['pics'] = $imglist;


            //验证是否已经收藏
            $params                = array(
                "module" => "tuan",
                "temp"   => "detail",
                "type"   => "add",
                "id"     => $results['id'],
                "check"  => 1
            );
            $collect               = checkIsCollect($params);
            $tuanDetail['collect'] = $collect == "has" ? 1 : 0;

            $this->param         = $results['sid'];
            $tuanDetail['store'] = $this->storeDetail();
            // 如果已登录，则计算当日购买限制和时间段购买限制
            $uid = $userLogin->getMemberID();
            $maxCount = 0;
            $checkmsg = "";  // 记录哪个条件触发限购
            if($uid>0){
                // 如果开启了当日限购（不统计已退款 orderstate=7）
                $limit_order_where = " AND `orderstate`!=0 AND `orderstate` != 7";
                $day_flag = false;
                if($tuanDetail['limit_day']>0){
                    // 统计当日可购买数量
                    $start_time=strtotime(date("Y-m-d",time()));
                    $end_time=$start_time+60*60*24;
                    $whereTime = " AND `orderdate`>='$start_time' AND `orderdate`< '$end_time'";
                    $sqlm = $dsql->SetQuery("select sum(`procount`) daybuy from `#@__tuan_order` where `proid`= '$id' AND `userid`='$uid' $whereTime $limit_order_where");
                    $ret    = $dsql->dsqlOper($sqlm, "results");
                    $day_buy = $ret[0]['daybuy'];
                    $maxCount = $tuanDetail['limit_day'] - $day_buy;  // 当天还可购买几个
                    $day_flag = true;
                    $checkmsg = "该商品每天限购".$tuanDetail['limit_day']."份";
                }
                // 如果开启了时间段限购（存在限制条件就要开启）
                $time_flag = false;
                if($old_limit>0){
                    $whereTime = "";
                    $start_time = $tuanDetail['limit_start'];
                    $end_time   = $tuanDetail['limit_end'];
                    $curr_time = time();
                    // 当前时间是否在限购时间段内？如果不在则此规则作废
                    if($curr_time >= $start_time){ // 未设置开始时间或已开始
                        if($end_time==0 || $curr_time< $end_time){ // 未设置限制结束时间或未结束
                            if($start_time!=0){
                                $whereTime .= " AND `orderdate`>= '$start_time'";
                            }
                            if($end_time!=0){
                                $whereTime .= " AND `orderdate` < '$end_time'";
                            }
                            $sqlm = $dsql->SetQuery("select sum(`procount`) limitcanbuy from `#@__tuan_order` where `proid`= '$id' AND `userid`='$uid' $limit_order_where $whereTime");
                            $ret    = $dsql->dsqlOper($sqlm, "results");
                            $limitcanbuy = $old_limit - $ret[0]['limitcanbuy'];
                            // 取天限制和时间段限制最小的一个限制数量（触发了上一个规则）
                            if($day_flag){
                                if($maxCount > $limitcanbuy){
                                    $maxCount =  $limitcanbuy;
                                    $checkmsg = "该商品限购".$old_limit."份";
                                }
                            }else{
                                $maxCount = $limitcanbuy;
                                $checkmsg = "该商品限购".$old_limit."份";
                            }
                            $time_flag = true;
                        }
                    }
                }
                // 至少触发一个规则，则继续和库存做比较，取最小可使用
                if($day_flag || $time_flag){
                    if($maxCount > $limit){
                        $maxCount =  $limit;
                        $checkmsg = "库存不足";
                    }
                    $tuanDetail['maxCount'] = $maxCount<0? 0 : $maxCount; // 由于有2个购买限制规则，这里务必使用新名字存储最终可购买的数量
                }else{
                    // 没有开启限购，使用原方案（库存）
                    $tuanDetail['maxCount'] = $limit;
                    $tuanDetail['maxCount'] = $maxCount<0? 0 : $maxCount; // 最小为0，不能是负数
                    $checkmsg = "库存不足";
                }
            }
            // 未登录、也使用原方案存作为购买限制(库存)
            else{
                $tuanDetail['maxCount'] = $limit;
                $checkmsg = "库存不足";
            }
            $tuanDetail['limit_msg'] = $checkmsg;

            //评价
            // $sql = $dsql->SetQuery("SELECT avg(c.`rating`) r, avg(c.`score1`) s1, avg(c.`score2`) s2, avg(c.`score3`) s3 FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = ".$id);
            $sql    = $dsql->SetQuery("SELECT avg(c.`rating`) r, avg(c.`sco1`) s1, avg(c.`sco2`) s2, avg(c.`sco3`) s3 FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'tuan-order' AND c.`aid` = '$id' AND c.`pid` = 0");
            $res    = $dsql->dsqlOper($sql, "results");
            $rating = $res[0]['r'];        //总评分
            $score1 = $res[0]['s1'];  //分项1
            $score2 = $res[0]['s2'];  //分项2
            $score3 = $res[0]['s3'];  //分项3

            // $sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND o.`proid` = ".$id);
            $sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`oid` WHERE o.`orderstate` = 3 AND c.`ischeck` = 1 AND c.`type` = 'tuan-order' AND c.`aid` = '$id' AND c.`pid` = 0");

            $totalCommon = $dsql->dsqlOper($sql, "totalCount");  //评价总人数
            $rating1     = $dsql->dsqlOper($sql . " AND c.`rating` = 1", "totalCount");  //1分
            $rating2     = $dsql->dsqlOper($sql . " AND c.`rating` = 2", "totalCount");  //2分
            $rating3     = $dsql->dsqlOper($sql . " AND c.`rating` = 3", "totalCount");  //3分
            $rating4     = $dsql->dsqlOper($sql . " AND c.`rating` = 4", "totalCount");  //4分
            $rating5     = $dsql->dsqlOper($sql . " AND c.`rating` = 5", "totalCount");  //5分

            $tuanDetail['totalCommon'] = $totalCommon;
            $tuanDetail['rating']      = number_format($rating, 1);
            $tuanDetail['score1']      = number_format($score1, 1);
            $tuanDetail['score2']      = number_format($score2, 1);
            $tuanDetail['score3']      = number_format($score3, 1);
            $tuanDetail['rating1']     = $rating1;
            $tuanDetail['rating2']     = $rating2;
            $tuanDetail['rating3']     = $rating3;
            $tuanDetail['rating4']     = $rating4;
            $tuanDetail['rating5']     = $rating5;

        }

        return $tuanDetail;
    }


    /**
     * 购物车列表
     * @return array
     */
    public function getCartList()
    {

        global $dsql;
        // $cartData = GetCookie("tuan_cart");

        //区分购物车或下单商品列表
        if (!empty($param)) {
            $cartData = $param['data'];
        } else {
            $param         = array("module" => "tuan");
            $moduleHandler = new handlers("member", "operateCart");
            $moduleContent = $moduleHandler->getHandle($param);
            $cartData      = $moduleContent['state'] == 100 ? $moduleContent['info']['content'] : '';
        }
        if (!empty($cartData)) {

            $return   = array();
            $cartData = explode("|", $cartData);

            foreach ($cartData as $key => $value) {
                $val = explode(",", $value);

                $this->param = $val[0];
                $detail      = $this->detail();

                $return[$key]['id']       = $val[0];
                $return[$key]['count']    = $val[1];
                $return[$key]['title']    = $detail['title'];
                $return[$key]['thumb']    = $detail['litpic'];
                $return[$key]['price']    = $detail['price'];
                $return[$key]['limit']    = $detail['limit'];
                $return[$key]['tuantype'] = $detail['tuantype'];
                $return[$key]['freight']  = $detail['freight'];
                $return[$key]['freeshi']  = $detail['freeshi'];

                //运费
                $freight = 0;
                if ($detail['tuantype'] == 2 && $val[1] <= $detail['freeshi']) {
                    $freight = $detail['freight'];
                }

                $return[$key]['totalAmount'] = sprintf("%.2f", $val[1] * $detail['price'] + $freight);

                $param               = array(
                    "service"  => "tuan",
                    "template" => "detail",
                    "id"       => $val[0]
                );
                $return[$key]['url'] = getUrlPath($param);

            }

            return $return;
        } else {
            return array("state" => 200, "info" => "商品列表为空");
        }

    }


    /**
     * 获取需要修改订单的内容
     * @return array
     */
    public function getOrderList()
    {
        global $dsql;
        $ordernum = $this->param["ordernum"];
        if (empty($ordernum)) return;

        $RenrenCrypt = new RenrenCrypt();
        $ordernums   = $RenrenCrypt->php_decrypt(base64_decode($ordernum));

        if (!empty($ordernums)) {

            $return    = array();
            $ordernums = explode(",", $ordernums);

            $i = 0;

            foreach ($ordernums as $key => $value) {

                $archives = $dsql->SetQuery("SELECT `id`, `proid`, `procount`, `deliveryType`, `useraddr`, `username`, `usercontact`, `usernote` FROM `#@__tuan_order` WHERE `orderstate` = 0 AND `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    $proid    = $results[0]['proid'];
                    $procount = $results[0]['procount'];
                    $orderid  = $results[0]['id'];

                    $this->param = $proid;
                    $detail      = $this->detail();

                    $return[$i]['orderid']  = $orderid;
                    $return[$i]['id']       = $proid;
                    $return[$i]['count']    = $procount;
                    $return[$i]['title']    = $detail['title'];
                    $return[$i]['thumb']    = $detail['litpic'];
                    $return[$i]['price']    = $detail['price'];
                    $return[$i]['limit']    = $detail['limit'];
                    $return[$i]['tuantype'] = $detail['tuantype'];
                    $return[$i]['freight']  = $detail['freight'];
                    $return[$i]['freeshi']  = $detail['freeshi'];

                    //物流信息
                    if ($detail['tuantype'] == 2) {
                        $return[$i]['deliveryType'] = $results[0]['deliveryType'];
                        $return[$i]['useraddr']     = $results[0]['useraddr'];
                        $return[$i]['username']     = $results[0]['username'];
                        $return[$i]['usercontact']  = $results[0]['usercontact'];
                        $return[$i]['usernote']     = $results[0]['usernote'];
                    }

                    //运费
                    $freight = 0;
                    if ($detail['tuantype'] == 2 && $procount <= $detail['freeshi']) {
                        $freight = $detail['freight'];
                    }

                    $return[$i]['totalAmount'] = sprintf("%.2f", $procount * $detail['price'] + $freight);

                    $param             = array(
                        "service"  => "tuan",
                        "template" => "detail",
                        "id"       => $proid
                    );
                    $return[$i]['url'] = getUrlPath($param);

                    $i++;
                }

            }

            return $return;
        }

    }


    /**
     * 团购订单列表
     * @return array
     */
    public function orderList()
    {
        global $dsql;
        $pageinfo = $list = array();
        $store    = $state = $userid = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $userid   = $this->param['userid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $title    = trim($this->param['title']);
            }
        }

        global $userLogin;
        $userinfo = $userLogin->getMemberInfo();

        if (empty($userid)) {
            $userid = $userLogin->getMemberID();

        }
        if (empty($userid)) return array("state" => 200, "info" => '会员ID不得为空！');

        //搜索订单
        if($title){

            //商家订单支持查询用户昵称
            if($store){
                $where .= " AND (o.`ordernum` LIKE '%$title%' OR l.`title` LIKE '%$title%' OR m.`company` LIKE '%$title%' OR m.`nickname` LIKE '%$title%')";
            }
            $where .= " AND (o.`ordernum` LIKE '%$title%' OR l.`title` LIKE '%$title%' OR m.`company` LIKE '%$title%')";
        }

        //个人会员订单
        if (empty($store)) {

            $where .= " AND o.`userid` = " . $userid;
            $archives = $dsql->SetQuery("SELECT " .
                "o.`id`, o.`ordernum`, o.`pinid`, o.`pinstate`,o.`shopFee`, l.`tuantype`,l.`fx_reward`,o.`proid`, o.`procount`, o.`orderprice`, o.`propolic`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`exp-date`, m.`company` " .
                "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`uid`" .
                "WHERE 1 = 1" . $where);

        } 
        //商家订单列表 && 只列出所有类别为快递的订单
        else {

            if($userinfo['is_staff'] == 1){
                if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" =>"商家权限验证失败！");  //商家权限验证失败！
                $userid = $userinfo['companyuid'];
            }

            if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan")) && $userinfo['is_staff'] != 1) {
                return array("state" => 200, "info" => '商家权限验证失败！');
            }

            $where .= " AND (o.`pinid` = 0 || (o.`pinid` != 0 AND o.`pinstate` = 1))";
            $archives = $dsql->SetQuery("SELECT " .
                "o.`id`, o.`ordernum`, o.`pinid`, o.`pinstate`,o.`shopFee`, l.`tuantype`,l.`fx_reward`,o.`proid`, o.`procount`, o.`orderprice`, o.`propolic`, o.`orderstate`, o.`orderdate`, o.`paydate`, o.`ret-state`, o.`exp-date`, m.`company` " .
                "FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`uid`" .
                "WHERE l.`tuantype` = 2 AND s.`uid` = " . $userid . $where);
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        //未付款
        $unpaid = $dsql->dsqlOper($archives . " AND o.`orderstate` = 0", "totalCount");
        //未使用
        $ongoing = $dsql->dsqlOper($archives . " AND o.`orderstate` = 1 AND (o.`pinid` = 0 OR (o.`pinid` != 0 AND o.`pinstate` = 1))", "totalCount");
        //待分享
        $share = $dsql->dsqlOper($archives . " AND o.`orderstate` = 1 AND o.`pinid` != 0 AND o.`pinstate` = 0", "totalCount");
        //已过期
        $expired = $dsql->dsqlOper($archives . " AND o.`orderstate` = 2", "totalCount");
        //已使用
        $success = $dsql->dsqlOper($archives . " AND o.`orderstate` = 3", "totalCount");
        //等待退款
        $refunded = $dsql->dsqlOper($archives . " AND o.`ret-state` = 1", "totalCount");
        //待评价
        $rates = $dsql->dsqlOper($archives . " AND o.`orderstate` = 3 AND o.`common` = 0", "totalCount");
        //已发货/待收货
        $recei = $dsql->dsqlOper($archives . " AND o.`orderstate` = 6 AND o.`exp-date` != 0", "totalCount");
        //关闭/失败/退款成功
        $closed = $dsql->dsqlOper($archives . " AND o.`orderstate` = 7", "totalCount");


        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "unpaid"     => $unpaid,
            "ongoing"    => $ongoing,
            "expired"    => $expired,
            "success"    => $success,
            "refunded"   => $refunded,
            "rates"      => $rates,
            "recei"      => $recei,
            "closed"     => $closed,
            "share"     => $share
        );

        if ($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

        $where = "";
        if ($state != "" && $state != 1 && $state != 4 && $state != 5 && $state != 6 && $state != 8) {
            $where = " AND o.`orderstate` = " . $state;
        }
        
        //待使用
        if($state == 1){
            $where = " AND o.`orderstate` = 1 AND (o.`pinid` = 0 OR (o.`pinid` != 0 AND o.`pinstate` = 1))";
        }
        
        //待分享
        if($state == 8){
            $where = " AND o.`orderstate` = 1 AND o.`pinid` != 0 AND o.`pinstate` = 0";
        }

        //退款
        if ($state == 4) {
            $where = " AND o.`ret-state` = 1";
        }

        //待评价
        if ($state == 5) {
            $where = " AND o.`orderstate` = 3 AND o.`common` = 0";
        }

        //已发货
        if ($state == 6) {
            $where = " AND o.`orderstate` = 6 AND o.`exp-date` != 0";
        }

        $atpage = $pageSize * ($page - 1);
        $where  .= " ORDER BY o.`id` DESC LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {

            $param       = array(
                "service"  => "tuan",
                "template" => "pay",
                "param"    => "ordernum=%id%"
            );
            $payurlParam = getUrlPath($param);

            $param          = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "module"   => "tuan",
                "id"       => "%id%",
                "param"    => "rates=1"
            );
            $commonUrlParam = getUrlPath($param);

            foreach ($results as $key => $val) {
                $list[$key]['id']       = $val['id'];
                $list[$key]['ordernum'] = $val['ordernum'];
                $list[$key]['proid']    = $val['proid'];
                $list[$key]['procount'] = $val['procount'];
                $list[$key]['company']  = $val['company'];
                $list[$key]['pinid']    = (int)$val['pinid'];
                $list[$key]['pinstate'] = (int)$val['pinstate'];
                $list[$key]['fx_reward'] =$val['fx_reward'];
                $ordernum   = $val['ordernum'];   //订单号
                $shopFee =$val['shopFee'];

                $procount = $val['procount'];
                //计算订单价格
                $totalPrice = $val['orderprice'];
                $propolic   = $val['propolic'];
                $policy     = unserialize($propolic);
                if (!empty($propolic) && !empty($policy)) {
                    $freight = $policy['freight'];
                    $freeshi = $policy['freeshi'];

                    if ($val['procount'] <= $freeshi) {
                        $totalPrice += $freight;
                    }
                }

                $list[$key]['orderprice'] = sprintf("%.2f", $totalPrice);
                $list[$key]["orderstate"] = $val['orderstate'];
                $list[$key]['orderdate']  = $val['orderdate'];
                $list[$key]['paydate']    = $val['paydate'];
                $list[$key]['retState']   = $val['ret-state'];
                $list[$key]['expDate']    = $val['exp-date'];

                $this->param = $val['proid'];
                $detail      = $this->detail();

                $list[$key]['product']['title']   = $detail['title'];
                $list[$key]['product']['enddate'] = $detail['enddate'];
                $list[$key]['product']['litpic']  = $detail['litpic'];
                $list[$key]['product']['is_tuikuan']  = $detail['is_tuikuan'];

                $param                        = array(
                    "service"  => "tuan",
                    "template" => "detail",
                    "id"       => $val['proid']
                );
                $list[$key]['product']['url'] = getUrlPath($param);

                //未付款的提供付款链接
                if ($val['orderstate'] == 0) {
                    $RenrenCrypt          = new RenrenCrypt();
                    $encodeid             = base64_encode($RenrenCrypt->php_encrypt($val["ordernum"]));
                    $list[$key]["payurl"] = str_replace("%id%", $encodeid, $payurlParam);
                }

                //评价
                if ($val['orderstate'] == 3) {
                    // $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuancommon` WHERE `aid` = ".$val['id']);
                    $archives                = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tuan-order' AND `oid` = '" . $val['id'] . "' AND `pid` = 0");
                    $common                  = $dsql->dsqlOper($archives, "totalCount");
                    $iscommon                = $common > 0 ? 1 : 0;
                    $list[$key]['common']    = $iscommon;
                    $list[$key]['commonUrl'] = str_replace("%id%", $val['id'], $commonUrlParam);

                }

                //团购券
                $list[$key]["tuantype"] = $val["tuantype"];
                $cardnum                = array();
                if ($val["tuantype"] == 0 && $val['orderstate'] != 0) {
                    $cardSql    = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__tuanquan` WHERE `orderid` = " . $val["id"] . " GROUP BY `cardnum`");
                    $cardResult = $dsql->dsqlOper($cardSql, "results");
                    if ($cardResult) {
                        foreach ($cardResult as $k => $row) {
                            $cardnum[$k]['cardnum']     = join(" ", str_split($row['cardnum'], 4));
                            $cardnum[$k]['usedate']     = $row['usedate'];
                            $cardnum[$k]['expireddate'] = $row['expireddate'];
                            $cardnumList[$k]            = $row['cardnum'];
                        }
                    }

                    //充值卡
                } elseif ($val["tuantype"] == 1 && $val['orderstate'] != 0) {
                    $cardSql    = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate`, `cardmoney` FROM `#@__paycard` WHERE `module` = 'tuan' AND `orderid` = " . $val["id"]);
                    $cardResult = $dsql->dsqlOper($cardSql, "results");
                    if ($cardResult) {
                        foreach ($cardResult as $j => $v) {
                            $cardnum[$j] = $cardResult[$j];
                        }
                    }
                }

                if ($cardnum) {
                    $param                    = array(
                        "service"  => "member",
                        "template" => "verify-tuan",
                        "param"    => "cardnum=" . join(",", $cardnumList) . "&currentPageOpen=1&fromQr=1"
                    );
                    $list[$key]["cardnumUrl"] = urlencode(getUrlPath($param));
                }


                //判断订单状态为未付款，如果已经过期，更新订单状态
                // if($val["orderstate"] == 0){
                // 	if(GetMkTime(time()) > $product[0]['enddate']){
                // 		$list[$key]["orderstate"] = "2";

                // 		$updateProSql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 2 WHERE `id` = ". $val["id"]);
                // 		$dsql->dsqlOper($updateProSql, "update");

                // 	}else{
                // 		$list[$key]["orderstate"] = $val["orderstate"];
                // 	}

                // //如果是已经付款的，检查活动是否结束，如果结束检查团购是否成功，如果成功则更新订单状态
                // }elseif($val["orderstate"] == 1){
                // 	if(GetMkTime(time()) > $product[0]['enddate'] && $product[0]['minnum'] <= $product[0]['defbuynum'] + $product[0]['buynum']){
                // 		$list[$key]["orderstate"] = "4";

                // 		$updateProSql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 4 WHERE `id` = ". $val["id"]);
                // 		$dsql->dsqlOper($updateProSql, "update");
                // 	}else{
                // 		$list[$key]["orderstate"] = $val["orderstate"];
                // 	}

                // //如果是已经过期的，检查商品活动是否已过期（这里主要是针对后期改动商品结束日期），如果没有过期，则更新订单状态为未付款
                // }elseif($val["orderstate"] == 2){
                // 	if(GetMkTime(time()) <= $product[0]['enddate']){
                // 		$list[$key]["orderstate"] = "0";

                // 		$proSql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 0 WHERE `id` = ". $val["id"]);
                // 		$dsql->dsqlOper($proSql, "update");

                // 	}else{
                // 		$list[$key]["orderstate"] = $val["orderstate"];
                // 	}
                // }else{
                // 	$list[$key]["orderstate"] = $val["orderstate"];
                // }


            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);

    }

    /**
     * 拼团详情
     */
    public function pinGroup()
    {
        global $dsql;
        $id          = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];
        $orderDetail = $cardnum = $cardnumList = array();
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        global $userLogin;
        $userid = $userLogin->getMemberID();

        //主表信息
        $archives = $dsql->SetQuery("SELECT `id`,`oid`,`tid`,`userid`,`pubdate`,`state`,`people`,`enddate`,`okdate`,`user` FROM `#@__tuan_pin`  WHERE `id` = '$id'");
        $results  = $dsql->dsqlOper($archives, "results");

        if (!empty($results)) {
            $results = $results[0];

            $orderDetail['id']      = $results['id'];
            $orderDetail['oid']     = $results['oid'];
            $orderDetail['tid']     = $results['tid'];
            $orderDetail['userid']  = $results['userid'];
            $orderDetail['pubdate'] = $results['pubdate'];
            $orderDetail['state']   = $results['state'];
            $orderDetail['people']  = $results['people'];
            $orderDetail['enddate'] = $results['enddate'];
            $orderDetail['okdate']  = $results['okdate'];
            $orderDetail['user']    = $results['user'];

            //商品信息
            $this->param                         = $results['tid'];
            $detail                              = $this->detail();
            $orderDetail['product']['id']        = $detail['id'];
            $orderDetail['product']['title']     = $detail['title'];
            $orderDetail['product']['enddate']   = $detail['enddate'];
            $orderDetail['product']['litpic']    = $detail['litpic'];
            $orderDetail['product']['tuantype']  = $detail['tuantype'];
            $orderDetail['product']['subtitle']  = str_replace(array("\r\n", "\r", "\n"), '', $detail['subtitle']);
            $orderDetail['product']['price']     = $detail['price'];
            $orderDetail['product']['pin']       = $detail['pin'];
            $orderDetail['product']['pinprice']  = $detail['pinprice'];
            $orderDetail['product']['pinpeople'] = $detail['pinpeople'];

            //卖家信息
            $this->param          = $detail['sid'];
            $orderDetail['store'] = $this->storeDetail();

            //获取拼团拼主订单信息
            $sql                     = $dsql->SetQuery("SELECT `paytype`,`ordernum`,`orderdate`,`orderstate`,`propolic`,`procount`,`payprice`,`balance`,`point`,`orderprice`,`procount` FROM `#@__tuan_order`  WHERE `userid` = '$results[userid]' and `pinid` = '$id'");
            $res                     = $dsql->dsqlOper($sql, "results");
            $res                     = $res[0];
            $orderDetail["procount"] = $res["procount"];
            $orderDetail["ordernum"] = $res["ordernum"];
            //总价
            $orderprice = $res["orderprice"];
            $point      = $res["point"];
            $balance    = $res["balance"];
            $payprice   = $res["payprice"];
            if($res['paytype']=="money"){
                $sql2 = $dsql->SetQuery("SELECT `amount` from `#@__member_money` where `ordernum`='".$res["ordernum"]."'");
                $ret2  = $dsql->dsqlOper($sql2, "results");
                $payprice   = $ret2[0]['amount'];
            }
            $procount   = $res["procount"];
            $propolic   = $res["propolic"];
            $policy     = unserialize($propolic);

            $totalAmount  += $orderprice * $procount;
            $freightMoney = 0;

            if (!empty($propolic) && !empty($policy)) {
                $freight = $policy['freight'];
                $freeshi = $policy['freeshi'];

                //如果达不到免物流费的数量，则总价再加上运费
                if ($procount <= $freeshi) {
                    $totalAmount  += $freight;
                    $freightMoney = $freight;
                }
            }
            $orderDetail["freight"]    = $freightMoney;
            $orderDetail["orderprice"] = $orderprice;
            $orderDetail["totalmoney"] = $totalAmount;
            $orderDetail["point"]      = $point;
            $orderDetail["balance"]    = $balance;
            $orderDetail["payprice"]   = $payprice;
            $orderDetail["orderstate"] = $res["orderstate"];
            $orderDetail["orderdate"]  = $res["orderdate"];

            //支付方式
            $paySql    = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $res["paytype"] . "'");
            $payResult = $dsql->dsqlOper($paySql, "results");
            if (!empty($payResult)) {
                $orderDetail["paytype"] = $payResult[0]["pay_name"];
            } else {
                global $cfg_pointName;
                $payname = "";
                if ($res["paytype"] == "point,money") {
                    $payname = $cfg_pointName . "+余额";
                } elseif ($res["paytype"] == "point") {
                    $payname = $cfg_pointName;
                } elseif ($res["paytype"] == "money") {
                    $payname = "余额";
                }
                $orderDetail["paytype"] = $payname;
            }
            $orderDetail["paydate"] = $results["paydate"];

            //拼主信息
            if ($userid == $results['userid']) {
                $orderDetail["own"] = 1;
            }
            $memberList                 = getMemberDetail($results['userid']);
            $orderDetail["masterPhoto"] = $memberList['photo'];
            //参团信息
            //$results['user'] = rtrim(",",$results['user']);
            $userArr = explode(",", $results['user']);
            if (!in_array($userid, $userArr)) {
                $orderDetail["dealorder"] = 1;
            }
            foreach ($userArr as $row) {

                //查询此会员是否已经支付
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_order` WHERE `pinid` = $id AND `userid` = $row AND `orderstate` != 0");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $memberList = getMemberDetail($row);
                    if ($row != $results['userid']) {
                        $orderDetail["join"][] = $memberList['photo'];
                    }
                }
            }
            //拼团状态
            if ($results['state'] == 2) {
                $orderDetail["status"] = 3;//拼单失效
            } else {
                if ($detail['enddate'] > time()) {
                    if ($results['enddate'] > time()) {
                        if ($results['people'] < $detail['pinpeople']) {
                            $orderDetail["status"] = 0;//拼单未成功
                            $orderDetail["rest"]   = $detail['pinpeople'] - $results['people'];

                            $hour                    = floor(($results['enddate'] - time()) % 86400 / 3600);
                            $minute                  = floor(($results['enddate'] - time()) % 86400 / 60 / 60);
                            $second                  = floor(($results['enddate'] - time()) % 86400 % 60);
                            $orderDetail["resttime"] = $hour . ":" . $minute . ":" . $second;

                        } elseif ($results['people'] == $detail['pinpeople']) {
                            $orderDetail["status"] = 1;//拼单成功
                        }
                    } else {
                        if ($results['people'] < $detail['pinpeople']) {
                            $orderDetail["status"] = 3;//拼单失效
                        } elseif ($results['people'] == $detail['pinpeople']) {
                            $orderDetail["status"] = 1;//拼单成功
                        }
                    }
                } else {
                    $orderDetail["status"] = 2;//团购过期
                }
            }


        }
        return $orderDetail;
    }

    /**
     * 团购订单详细
     * @return array
     */
    public function orderDetail()
    {
        global $dsql;
        global $cfg_pointRatio;
        $orderDetail = $cardnum = $cardnumList = array();
        $id = $this->param;
		$id = is_numeric($id) ? $id : $id['id'];

        global $userLogin;
        $userid = $userLogin->getMemberID();

        if ($userid == -1) return array("state" => 200, "info" => '请先登录！');
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //主表信息
        //如果使用注释的内容，会导致商家看不了订单详情 by gz 20210903，如果需要使用注释的，请注释说明！！！
        $archives = $dsql->SetQuery("SELECT o.*, s.`id` as sid FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE (o.`userid` = '$userid' OR s.`uid` = '$userid') AND o.`id` = " . $id);
        //$archives = $dsql->SetQuery("SELECT o.*, s.`id` as sid FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`userid` = '$userid' AND o.`id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");

        if (!empty($results)) {

            $results = $results[0];

            $orderDetail["ordernum"] = $results["ordernum"];
            $orderDetail["userid"]   = $results["userid"];

            //积分
            $orderDetail["point"]   = $results["point"] / $cfg_pointRatio;

            //实际付款
            if($results["paytype"]=="money"){
                $orderDetail["priceorder"]   = $results['balance'];
            }else if($results["paytype"]=="huoniao_bonus"){
                $sql2 = $dsql->SetQuery("SELECT `amount` from `#@__member_bonus` where `ordernum`='".$results["ordernum"]."'");
                $ret2  = $dsql->dsqlOper($sql2, "results");
                $orderDetail["priceorder"]   = $ret2[0]['amount'];
            }

            //会员信息
            $orderDetail['member'] = getMemberDetail($results['userid']);

            //商品信息
            $this->param = $results['proid'];
            $detail      = $this->detail();

            $orderDetail['product']['id']       = $detail['id'];
            $orderDetail['product']['title']    = $detail['title'];
            $orderDetail['product']['enddate']  = $detail['enddate'];
            $orderDetail['product']['litpic']   = $detail['litpic'];
            $orderDetail['product']['tuantype'] = $detail['tuantype'];
            $orderDetail['product']['subtitle'] = str_replace(array("\r\n", "\r", "\n"), '', $detail['subtitle']);
            $orderDetail['product']['price']    = $detail['price'];
            $orderDetail['product']['is_tuikuan']    = $detail['is_tuikuan'];


            $param                         = array(
                "service"  => "tuan",
                "template" => "detail",
                "id"       => $results['proid']
            );
            $url                           = getUrlPath($param);
            $orderDetail['product']['url'] = $url;


            $orderDetail["procount"] = $results["procount"];



            //总价
            if ($results['pinid']){
                $orderprice = $results['proprice'] == 0.00 ? $detail['pinprice'] : $results['proprice'];
            }else{
                // $orderprice = $results['proprice'] == 0.00 ? $$detail['price'] : $results['proprice'];
                $orderprice = $detail['price'];
            }

            //总价
//            $orderprice = $results["orderprice"];
            $point      = $results["point"];
            $balance    = $results["balance"];
            $payprice   = $results["payprice"];
            $procount   = $results["procount"];
            $propolic   = $results["propolic"];
            $policy     = unserialize($propolic);

            $totalAmount  += $orderprice * $procount;
            $freightMoney = 0;

            if (!empty($propolic) && !empty($policy)) {
                $freight = $policy['freight'];
                $freeshi = $policy['freeshi'];

                //如果达不到免物流费的数量，则总价再加上运费
                if ($procount <= $freeshi) {
                    $totalAmount  += $freight;
                    $freightMoney = $freight;
                }
            }

            $orderDetail["freight"]    = $freightMoney;
            $orderDetail["orderprice"] = $orderprice;
            $orderDetail["totalmoney"] = $totalAmount;
//            $orderDetail["point"]      = $point;
            $orderDetail["balance"]    = $balance;
            $orderDetail["payprice"]   = $payprice;
            $orderDetail["orderstate"] = $results["orderstate"];
            $orderDetail["orderdate"]  = $results["orderdate"];


            //评价信息
            // $sql = $dsql->SetQuery("SELECT `rating`, `score1`, `score2`, `score3`, `pics`, `content`, `ischeck` FROM `#@__tuancommon` WHERE `aid` = ".$results['id']);
            $sql    = $dsql->SetQuery("SELECT `rating`, `sco1` as score1, `sco2` as score2, `sco3` as score3, `pics`, `content`, `ischeck` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'tuan-order' AND `oid` = '" . $results['id'] . "' AND `pid` = 0");
            $common = $dsql->dsqlOper($sql, "results");
            if ($common && $results['common'] == 1) {
                $common                          = $common[0];
                $orderDetail['common']['rating'] = $common['rating'];
                $orderDetail['common']['score1'] = $common['score1'];
                $orderDetail['common']['score2'] = $common['score2'];
                $orderDetail['common']['score3'] = $common['score3'];

                $imglist = array();
                $pics    = $common['pics'];
                if (!empty($pics)) {
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val']  = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }

                $orderDetail['common']['pics']    = $imglist;
                $orderDetail['common']['content'] = $common['content'];
                $orderDetail['common']['ischeck'] = $common['ischeck'];
            }


            //未付款的提供付款链接
            if ($results['orderstate'] == 0) {
                $RenrenCrypt = new RenrenCrypt();
                $encodeid    = base64_encode($RenrenCrypt->php_encrypt($results["ordernum"]));

                $param  = array(
                    "service"  => "tuan",
                    "template" => "pay",
                    "param"    => "ordernum=" . $encodeid
                );
                $payurl = getUrlPath($param);

                $orderDetail["payurl"] = $payurl;
            }


            //支付方式
            $paySql    = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $results["paytype"] . "'");
            $payResult = $dsql->dsqlOper($paySql, "results");
            if (!empty($payResult)) {
                $orderDetail["paytype"] = $payResult[0]["pay_name"];
            } else {
                global $cfg_pointName;
                $payname = "";
                if ($results["paytype"] == "point,money") {
                    $payname = $cfg_pointName . "+余额";
                } elseif ($results["paytype"] == "point") {
                    $payname = $cfg_pointName;
                } elseif ($results["paytype"] == "money") {
                    $payname = "余额";
                }
                $orderDetail["paytype"] = $payname;
            }

            //代付
            if($results['peerpay'] > 0){
                if ($results["paytype"] == "point"){
                    $payname = "积分";
                }elseif($results["paytype"] == "money"){
                    $payname = "余额";
                }elseif($results["paytype"] == "wxpay"){
                    $payname = "微信";
                }elseif($results["paytype"] == "alipay"){
                    $payname = "支付宝";
                }
                $userinfo = $userLogin->getMemberInfo($results['peerpay']);
                if(is_array($userinfo)){
                    $orderDetail["paytype"] = '['.$userinfo['nickname'].']'.$payname.'代付';
                }else{
                    $orderDetail["paytype"] = '[好友]'.$payname.'代付';
                }

            }

            $orderDetail["paydate"] = $results["paydate"];


            //团购券
            if ($detail["tuantype"] == 0 && $results['orderstate'] != 0) {
                $cardSql    = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate` FROM `#@__tuanquan` WHERE `orderid` = " . $results["id"] . " GROUP BY `cardnum`");
                $cardResult = $dsql->dsqlOper($cardSql, "results");
                if ($cardResult) {
                    foreach ($cardResult as $key => $val) {
                        $cardnum[$key]['cardnum']     = join(" ", str_split($val['cardnum'], 4));
                        $cardnum[$key]['usedate']     = $val['usedate'];
                        $cardnum[$key]['expireddate'] = $val['expireddate'];
                        $cardnumList[$key]            = $val['cardnum'];
                    }
                }

                //充值卡
            } elseif ($detail["tuantype"] == 1 && $results['orderstate'] != 0) {
                $cardSql    = $dsql->SetQuery("SELECT `cardnum`, `usedate`, `expireddate`, `cardmoney` FROM `#@__paycard` WHERE `module` = 'tuan' AND `orderid` = " . $results["id"]);
                $cardResult = $dsql->dsqlOper($cardSql, "results");
                if ($cardResult) {
                    foreach ($cardResult as $key => $val) {
                        $cardnum[$key] = $cardResult[$key];
                    }
                }
            }

            if ($cardnum) {
                $orderDetail["cardnum"] = $cardnum;

                $param                     = array(
                    "service"  => "member",
                    "template" => "verify-tuan",
                    "param"    => "cardnum=" . join(",", $cardnumList) . "&currentPageOpen=1&fromQr=1"
                );
                $orderDetail["cardnumUrl"] = urlencode(getUrlPath($param));
            }

            //快递类型
            if ($detail['tuantype'] == 2) {
                $orderDetail["deliveryType"] = $results["deliveryType"];
                $orderDetail["useraddr"]     = aesDecrypt($results["useraddr"]);
                $orderDetail["username"]     = aesDecrypt($results["username"]);
                $orderDetail["usercontact"]  = aesDecrypt($results["usercontact"]);
                $orderDetail["usernote"]     = !empty($results["usernote"]) ? $results["usernote"] : "无";

                //快递公司&单号
                $orderDetail["expCompany"] = $results["exp-company"];
                $orderDetail["expNumber"]  = $results["exp-number"];
                $orderDetail["expDate"]    = $results["exp-date"];

                //卖家回复
                $orderDetail["retSnote"] = $results["ret-s-note"];
                $imglist                 = array();
                $pics                    = $results['ret-s-pics'];
                if (!empty($pics)) {
                    $pics = explode(",", $pics);
                    foreach ($pics as $key => $value) {
                        $imglist[$key]['val']  = $value;
                        $imglist[$key]['path'] = getFilePath($value);
                    }
                }

                $orderDetail["retSpics"] = $imglist;
                $orderDetail["retSdate"] = $results["ret-s-date"];

            }

            //退款状态
            $orderDetail["retState"] = $results["ret-state"];

            //退款原因
            $orderDetail["retType"] = $results["ret-type"];
            $orderDetail["retNote"] = $results["ret-note"];

            $imglist = array();
            $pics    = $results['ret-pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['val']  = $value;
                    $imglist[$key]['path'] = getFilePath($value);
                }
            }

            $orderDetail["retPics"] = $imglist;
            $orderDetail["retDate"] = $results["ret-date"];

            //退款确定时间
            $orderDetail["retOkdate"] = $results["ret-ok-date"];

            $orderDetail['now'] = GetMkTime(time());


            //卖家信息
            $this->param          = $results['sid'];
            $orderDetail['store'] = $this->storeDetail();

            // 拼团信息
            $orderDetail["pinid"]    = $results['pinid'];
            $orderDetail["pinstate"] = $results['pinstate'];
            $orderDetail["pintype"]  = $results['pintype'];

            //计算运费
            // $price = $results[0]["orderprice"];
            // if($proResult[0]['tuantype'] == 2){
            // 	if($procount < $proResult[0]["freeshi"] && $results[0]['emstype'] == 0){
            // 		$price = $price + $proResult[0]['freight'];
            // 	}
            // }
            // $orderDetail["orderprice"] = sprintf("%.2f", $price);

            //判断订单状态为未付款并且团购商品为团购券和充值卡的订单是否过期
            // if($results[0]["orderstate"] == 0){
            // 	if(GetMkTime(time()) > $proResult[0]['enddate']){
            // 		$orderDetail["orderstate"] = "2";

            // 		$updateProSql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 2 WHERE `id` = ". $id);
            // 		$dsql->dsqlOper($updateProSql, "results");

            // 	}else{
            // 		$orderDetail["orderstate"] = $results[0]["orderstate"];
            // 	}
            // }elseif($value["orderstate"] == 2){
            // 	if(GetMkTime(time()) < $proResult[0]['enddate']){
            // 		$orderDetail["orderstate"] = "0";

            // 		$proSql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 0 WHERE `id` = ". $id);
            // 		$dsql->dsqlOper($proSql, "results");

            // 	}else{
            // 		$orderDetail["orderstate"] = $results[0]["orderstate"];
            // 	}
            // }else{
            // 	$orderDetail["orderstate"] = $results[0]["orderstate"];
            // }

            // $orderDetail["orderdate"] = $results[0]["orderdate"];
            // $orderDetail["paytype"]   = $results[0]["paytype"];
            // $orderDetail["paydate"]   = $results[0]["paydate"];
            // $orderDetail["emstype"]   = $results[0]["emstype"];
            // $orderDetail["useraddr"]  = $results[0]["useraddr"];
            // $orderDetail["usercode"]  = $results[0]["usercode"];
            // $orderDetail["usernote"]  = $results[0]["usernote"];

        }

        return $orderDetail;
    }


    /**
     * 删除订单
     * @return array
     */
    public function delOrder()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];
            if ($results['userid'] == $uid) {

                if ($results['orderstate'] == 0 || $results['orderstate'] == 2) {
                    $archives = $dsql->SetQuery("DELETE FROM `#@__tuan_order` WHERE `id` = " . $id);
                    $dsql->dsqlOper($archives, "update");

                    return '删除成功！';
                } else {
                    return array("state" => 101, "info" => '订单为不可删除状态！');
                }

            } else {
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array("state" => 101, "info" => '订单不存在，或已经删除！');
        }

    }


    /**
     * 邀请返现
     * @return array
     */
    public function invite()
    {
        global $dsql;
        $pageinfo = $list = $orderid = array();
        $state    = $userid = $page = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $state    = $this->param['state'];
                $userid   = $this->param['userid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($userid)) return array("state" => 200, "info" => '会员ID不得为空！');

        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `recid` = $userid ORDER BY `id` DESC");
        $userResult = $dsql->dsqlOper($userSql, "results");

        if ($userResult) {

            foreach ($userResult as $key => $user) {
                $orderSql    = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `orderstate` = 4 AND `userid` = " . $user['id'] . " ORDER BY `id` ASC limit 0,1");
                $orderResult = $dsql->dsqlOper($orderSql, "results");
                if ($orderResult) {
                    array_push($orderid, $orderResult[0]['id']);
                }
            }
        }

        if (!empty($orderid)) {
            $orderid  = join(",", $orderid);
            $archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `id` in (" . $orderid . ")");

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
            $results = $dsql->dsqlOper($archives . " LIMIT $atpage, $pageSize", "results");
        } else {
            $results = array();
        }

        if (count($results) > 0) {
            $list = array();
            foreach ($results as $key => $value) {

                $userSql    = $dsql->SetQuery("SELECT `id`, `username`, `recid`, `recfan`, `rectime` FROM `#@__member` WHERE `id` = " . $value['userid']);
                $userResult = $dsql->dsqlOper($userSql, "results");

                if ($userResult) {
                    $list[$key]["userid"]     = $userResult[0]["id"];
                    $list[$key]["username"]   = $userResult[0]["username"];
                    $list[$key]["state"]      = $userResult[0]["recfan"];
                    $list[$key]["invitedate"] = $userResult[0]["rectime"];
                } else {
                    $list[$key]["userid"]     = 0;
                    $list[$key]["username"]   = "未知";
                    $list[$key]["state"]      = -1;
                    $list[$key]["invitedate"] = "";
                }

                $list[$key]["proid"] = $value["proid"];
                $proSql              = $dsql->SetQuery("SELECT `title` FROM `#@__tuanlist` WHERE `id` = " . $value['proid']);
                $proResult           = $dsql->dsqlOper($proSql, "results");

                if ($proResult) {
                    $list[$key]["proname"] = $proResult[0]["title"];
                } else {
                    $list[$key]["proname"] = "商品不存在";
                }

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 评论列表
     * @return array
     */
    public function common()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $id       = $storeid = $filter = $orderby = $page = $pageSize = $where = $px = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $id       = $this->param['id'];
            $storeid  = $this->param['storeid'];
            $filter   = $this->param['filter'];
            $orderby  = $this->param['orderby'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }

        if (empty($id) && empty($storeid)) return array("state" => 200, "info" => '格式错误！');

        //筛选
        if (!empty($filter)) {
            if ($filter == "pic") {
                $where .= " AND c.`pics` <> ''";
            } elseif ($filter == "lower") {
                $where .= " AND c.`rating` < 3";
            }
        }

        //排序
        $px = " ORDER BY c.`rating` DESC, c.`floor` ASC, c.`id` DESC";
        if (!empty($orderby)) {
            if ($orderby == "time") {
                $px = " ORDER BY c.`floor` ASC, c.`id` DESC";
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //根据商家ID筛选
        if ($storeid) {
            $archives = $dsql->SetQuery("SELECT c.`rating`, c.`userid`, c.`pics`, c.`content`, c.`dtime` FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` WHERE l.`sid` = " . $storeid . " AND o.`common` = 1 AND c.`ischeck` = 1" . $where . $px);
        } else {
            $archives = $dsql->SetQuery("SELECT c.`rating`, c.`userid`, c.`pics`, c.`content`, c.`dtime` FROM `#@__tuancommon` c LEFT JOIN `#@__tuan_order` o ON o.`id` = c.`aid` WHERE o.`proid` = " . $id . " AND o.`common` = 1 AND c.`ischeck` = 1" . $where . $px);
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

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['rating'] = $val['rating'];

                $imgArr = array();
                $pics   = $val['pics'];
                if (!empty($pics)) {
                    $picArr = explode(",", $pics);
                    foreach ($picArr as $k => $v) {
                        $imgArr[$k] = getFilePath($v);
                    }
                }
                $list[$key]['pics'] = $imgArr;

                $list[$key]['content'] = $val['content'];
                $list[$key]['dtime']   = $val['dtime'];

                $userinfo = $userLogin->getMemberInfo($val['userid']);
                if ($userinfo && is_array($userinfo)) {
                    $list[$key]['user']['id']       = $val['userid'];
                    $list[$key]['user']['photo']    = $userinfo['photo'];
                    $list[$key]['user']['nickname'] = $userinfo['nickname'];
                } else {
                    $list[$key]['user']['id']       = "";
                    $list[$key]['user']['photo']    = "";
                    $list[$key]['user']['nickname'] = "游客";
                }

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

        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => '登录超时，请刷新页面重试！');

        $id      = $param['id'];   //订单ID
        $rating  = $param['rating'];
        $score1  = $param['score1'];
        $score2  = $param['score2'];
        $score3  = $param['score3'];
        $pics    = $param['pics'];
        $content = filterSensitiveWords(addslashes($param['content']));
        $ip      = GetIP();
        $ipaddr  = getIpAddr($ip);
        $date    = GetMkTime(time());

        if (empty($id)) return array("state" => 200, "info" => '要评价的商品ID传递失败，请从正确的地址发表评价');
        if (empty($rating) || empty($score1) || empty($score2) || empty($score3)) return array("state" => 200, "info" => '请先打分！');
        // if(empty($content) || strlen($content) < 15) return array("state" => 200, "info" => '请输入评价内容，最少15个字！');

        //查询订单信息
        $sql   = $dsql->SetQuery("SELECT `userid`, `orderstate` FROM `#@__tuan_order` WHERE `id` = '$id'");
        $order = $dsql->dsqlOper($sql, "results");
        if ($order) {
            if ($order[0]['userid'] != $userid) return array("state" => 200, "info" => '验证账户权限失败，请使用购买过此商品的账号登录后再评价！');
            if ($order[0]['orderstate'] != 3) return array("state" => 200, "info" => '订单当前状态不可评价，请使用后再评价！');
        } else {
            return array("state" => 200, "info" => '订单不存在，评价失败！');
        }

        //查询评价信息
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuancommon` WHERE `aid` = '$id'");
        $res = $dsql->dsqlOper($sql, "totalCount");

        //修改评价
        if ($res > 0) {

            $archives = $dsql->SetQuery("UPDATE `#@__tuancommon` SET `rating` = '$rating', `score1` = '$score1', `score2` = '$score2', `score3` = '$score3', `pics` = '$pics', `content` = '$content', `dtime` = '$date', `ip` = '$ip', `ipaddr` = '$ipaddr', `ischeck` = 0 WHERE `aid` = '$id'");

            //新增评价
        } else {

            $archives = $dsql->SetQuery("INSERT INTO `#@__tuancommon` (`aid`, `floor`, `userid`, `rating`, `score1`, `score2`, `score3`, `pics`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`) VALUES ('$id', '0', '$userid', '$rating', '$score1', '$score2', '$score3', '$pics', '$content', '$date', '$ip', '$ipaddr', 0, 0, 0)");

        }

        $results = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {

            $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `common` = 1 WHERE `id` = '$id'");
            $dsql->dsqlOper($archives, "update");

            return "评论成功！";
        } else {
            return array("state" => 200, "info" => '评论失败！');
        }

    }


    /**
     * 下单
     * @return array
     */
    public function deal()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointRatio;
        global $cfg_pointName;

        $param = $this->param;

        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {

            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }

        if (empty($param)) return array("state" => 200, "info" => '商品为空');

        $pros = $param['pros'];
        if (!is_array($pros)) return array("state" => 200, "info" => '格式错误');

        $userid = $userLogin->getMemberID();

        if ($userid < 1) return array("state" => 200, "info" => '登录超时，请重新登录后下单！');

        $addrid       = (int)$param['addrid'];
        $deliveryType = (int)$param['deliveryType'];
        $comment      = $param['comment'];
        $usePinput    = $param['usePinput'];   //是否使用积分
        $type         = $param['type'];
        $peerpay      = $param['peerpay'];
        $pinid        = (int)$param['pinid'];
        $voucher      = (int)$param['voucher'];
        $voucher      = !empty($voucher) ? 1 : 0;
        $url          = array();
        foreach ($pros as $key => $value) {
            $pro = explode(",", $value);
            $this->param = $pro[0];
            $detail      = $this->detail();

            if ($detail['store']['member']['userid'] == $userid) return array("state" => 200, "info" => '企业会员不可以购买自己的商品！');
            if (!is_array($detail)) return array("state" => 200, "info" => '商品不存在');
            if ($detail['startdate'] > time()) return array("state" => 200, "info" => '团购活动还未开始');
            if ($detail['enddate'] < time()) return array("state" => 200, "info" => '团购活动已经结束');
            if ($detail['limit'] < $pro[1]) return array("state" => 200, "info" => '【' . $detail['title'] . '】库存不足');
            if ($detail['maxCount'] < $pro[1]) return array("state" => 200, "info" => '【' . $detail['title'] . '】'.$detail['limit_msg']);
            if ($detail['arcrank'] == 6) return array("state" => 200, "info" => '【' . $detail['title'] . '】商品已下架');

            //查询会员信息
            $userinfo  = $userLogin->getMemberInfo();
            $userpoint = $userinfo['point'];

            $totalPrice = $type == "pin" && $detail['pin'] ? $detail['pinprice'] : $detail['price'];
            $tuanprice = $totalPrice*$pro[1];
            $orderprice = $tuanprice;
            $pricepoint=0;
            if ($usePinput == 1 ){
                $point_price  = getJifen('tuan', $tuanprice);  // 金钱
                $pricepoint = $point_price  * $cfg_pointRatio;
                if ($pricepoint > $userpoint) {
                    $pricepoint = $userpoint;
                    $point_price =   $pricepoint /  $cfg_pointRatio;
                }
                $tuanprice = sprintf("%.2f",$tuanprice - $point_price);
            }else{
                $tuanprice  =  $tuanprice;
            }

            $proprice = (float)$orderprice;
            //快递信息
            if ($detail['tuantype'] == 2) {

                // //物流费用
                $freight = 0;
                if($detail['freeshi'] >= $pro[1]){
                	$freight = (float)$detail['freight'];
                }
                $tuanprice += $freight;
                $orderprice += $freight;

                //地址库
                if ($addrid != 0) {
                    $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $addrid");
                    $userAddr = $dsql->dsqlOper($archives, "results");

                    if (!$userAddr) return array("state" => 200, "info" => '会员地址库信息不存在或已删除');

                    global $data;
                    $data    = "";
                    $addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $addr    = join(" ", $addrArr);

                    $address = $addr . $userAddr[0]['address'];
                    $person  = $userAddr[0]['person'];
                    $mobile  = $userAddr[0]['mobile'];
                    $tel     = $userAddr[0]['tel'];

                    $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;

                    //新输入
                } else {

                    $addressid = $param['addressid'];
                    $address   = $param['address'];
                    $person    = $param['person'];
                    $mobile    = $param['mobile'];

                    if (empty($addressid)) return array("state" => 200, "info" => '请选择所在区域');
                    if (empty($address)) return array("state" => 200, "info" => '请输入街道地址');
                    if (empty($person)) return array("state" => 200, "info" => '请输入收货人姓名');
                    if (empty($mobile) && empty($tel)) return array("state" => 200, "info" => '手机号码和固定电话最少填写一项');

//                    if (!empty($mobile)) {
//                        preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $mobile, $matchPhone);
//                        if (!$matchPhone) {
//                            // return array("state" => 200, "info" => '手机格式有误');
//                        }
//                    }

                    $address = cn_substrR($address, 50);
                    $person  = cn_substrR($person, 15);
                    $mobile  = cn_substrR($mobile, 11);
                    $tel     = cn_substrR($tel, 20);

                    //保存到用户常用地址库
                    $handels = new handlers("member", "addressAdd");
                    $handels->getHandle(array(
                        "addrid"  => $addressid,
                        "address" => $address,
                        "person"  => $person,
                        "mobile"  => $mobile,
                        "tel"     => $tel
                    ));

                    global $data;
                    $data    = "";
                    $addrArr = getParentArr("site_area", $addressid);
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $addr    = join(" ", $addrArr);

                    $address = $addr . $address;

                    $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;
                }

            }

            //快递类型的商品增加物流策略
            $policy = array();
            if ($detail['tuantype'] == 2) {
                $policy['freight'] = $detail['freight'];
                $policy['freeshi'] = $detail['freeshi'];
            }
            $data = serialize($policy);

            //判断是否为修改订单操作
            if (!empty($pro[2])) {

                $archives = $dsql->SetQuery("SELECT `ordernum` FROM `#@__tuan_order` WHERE `id` = " . $pro[2] . " AND `userid` = '$userid'");
                $sql      = $dsql->dsqlOper($archives, "results");
                if ($sql) {

                    //快递
                    if ($detail['tuantype'] == 2) {
                        $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `procount` = " . $pro[1] . ", `payprice`='$tuanprice',`orderprice` = '$orderprice', `propolic` = '$data', `useraddr` = '$address', `username` = '$person', `usercontact` = '$contact', `deliveryType` = '$deliveryType', `usernote` = '$comment' WHERE `id` = " . $pro[2]);
                    } else {
                        $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `procount` = " . $pro[1] . ", `payprice`='$tuanprice',`orderprice` = '$orderprice', `propolic` = '$data' WHERE `id` = " . $pro[2]);
                    }
                    $res = $dsql->dsqlOper($archives, "update");
                    if ($res == "ok") {
                        $ordernum = $sql[0]['ordernum'];
                    }

                } else {
                    return array("state" => 200, "info" => '订单不存在或已经删除，修改失败！');
                }

                //新订单
            } else {
                //拼团限定
//                if (!empty($detail['limit'])) {
//                    if ($type == "pin") {
//
//                        $sql = $dsql->SetQuery("SELECT sum(`procount`) as totalprocount FROM `#@__tuan_order` where `userid` = $userid and `pintype` = 1 and `orderstate` !=0  and `proid` = " . $pro[0]);
//                    } else {
//                        $sql = $dsql->SetQuery("SELECT sum(`procount`) as totalprocount FROM `#@__tuan_order` where `userid` = $userid and `orderstate` != 0 and `pintype` = 0 and `proid` = " . $pro[0]);
//                    }
//                    $res = $dsql->dsqlOper($sql, "results");
//                    if ($res[0]['totalprocount'] >= $detail['limit']) {
//                        return array("state" => 200, "info" => '购买商品超过限购数量');
//                    }
//
//                }
                $ordernum = create_ordernum();

                $pubdate = GetMkTime(time());
                $enddate = $pubdate + 3600 * 24;

                //是否拼团
                $pintype = 0;
                if ($detail['pin']) {
                    if ($type == "pin") {
                        // 新拼团
                        if (empty($pinid)) {
                            $pintype = 1;
                            $sql     = $dsql->SetQuery("INSERT INTO `#@__tuan_pin` (`oid`, `tid`, `userid`, `pubdate`, `enddate`, `state`, `user`) VALUES ('$ordernum','" . $pro[0] . "', '$userid', '$pubdate', '$enddate', '0', '$userid')");
                            $pid     = $dsql->dsqlOper($sql, "lastid");
                            if (!is_numeric($pid)) {
                                return array("state" => 200, "info" => '下单失败');
                            }
                            $pinid = $pid;
                        } else {//检查拼团状态
                            $sql = $dsql->SetQuery("SELECT `people`, `state`, `userid`, `enddate`, `user` FROM `#@__tuan_pin` WHERE `id` = $pinid AND `state` > 0");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if (!$ret) {
                                return array("state" => 200, "info" => '该团不存在，正在开新团|201');
                            } else {
                                $ret  = $ret[0];
                                $user = $ret['user'];
                                if ($ret['state'] == 2) {
                                    return array("state" => 200, "info" => '该团已失效，请开新团');
                                } elseif ($ret['userid'] == $userid) {
                                    return array("state" => 200, "info" => '您已经是该团创建人');
                                } elseif ($ret['state'] == 3) {
                                    //die("该团成员已满");
                                    return array("state" => 200, "info" => '该团成员已满');
                                } elseif ($ret['enddate'] < $pubdate) {
                                    return array("state" => 200, "info" => '该团已失效，正在开新团|201');
                                }
                                // 验证是否已参团
                                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_order` WHERE `userid` = $userid AND `pinid` = $pinid AND `orderstate` > 0 and `orderstate` != 7");
                                $ret = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    return array("state" => 200, "info" => '您已经是该团成员');
                                } else {//如果没有就更新
                                    if (empty($user)) {
                                        $sql = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET user = $userid WHERE `id` = '$pinid'");
                                    } else {
                                        $userN    = $user . ',' . $userid;
                                        $userNarr = explode(',', $userN);
                                        $userNarr = array_unique($userNarr);
                                        $userNarr = implode(',', $userNarr);
                                        $sql      = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET user =  '$userNarr' WHERE `id` = '$pinid'");
                                    }
                                    $dsql->dsqlOper($sql, "update");
                                }
                            }
                        }
                    }
                }

                $tuanfeesql = $dsql->SetQuery("SELECT `shopFee` FROM `#@__tuan_store` WHERE `id` = '".$detail['sid']."'");

                $tuanfeeres = $dsql->dsqlOper($tuanfeesql,"results");

                global  $cfg_tuanFee;
                if($tuanfeeres && is_array($tuanfeeres)){

                    $cfg_tuanFee = !empty((float)$tuanfeeres[0]['shopFee']) ? (float)$tuanfeeres[0]['shopFee'] : $cfg_tuanFee ;
                }
                //快递
                if ($detail['tuantype'] == 2) {
                    $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_order` (`ordernum`, `userid`, `proprice`,`proid`, `procount`, `payprice`,`orderprice`, `propolic`, `orderstate`, `orderdate`, `useraddr`, `username`, `usercontact`, `deliveryType`, `usernote`, `tab`, `pinid`, `pintype`, `voucher`,`shopFee`,`point`) VALUES ('$ordernum', '$userid',".$proprice.", " . $pro[0] . ", " . $pro[1] . ", '$tuanprice', '$orderprice','$data', 0, " . GetMkTime(time()) . ", '$address', '$person', '$contact', '$deliveryType', '$comment', 'tuan', '$pinid', '$pintype', '$voucher','$cfg_tuanFee','$pricepoint')");
                } else {
                    $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_order` (`ordernum`, `userid`, `proprice`, `proid`, `procount`, `payprice`,`orderprice`, `propolic`, `orderstate`, `orderdate`, `tab`, `pinid`, `pintype`, `voucher`,`shopFee`,`point`) VALUES ('$ordernum', '$userid',".$proprice.", " . $pro[0] . ", " . $pro[1] . ", '$tuanprice', '$orderprice', '$data', 0, " . GetMkTime(time()) . ", 'tuan', '$pinid', '$pintype', '$voucher','$cfg_tuanFee','$pricepoint')");


                }
            }
            $return = $dsql->dsqlOper($archives, "update");
            if ($return == "ok") {
                $url[] = $ordernum;
            } else {
                return array("state" => 200, "info" => '下单失败');
            }

        }

        // $this->thirdPlatformPushOrder($ordernum);  //推送订单，未支付的不需要推送

        if ($tuanprice == 0 || $peerpay == 1){
            $date    = GetMkTime(time());
            $paytype = array();
            $ordernumArr = explode(",",$ordernum);
            //扣除会员账户积分和余额
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `userid`, `point`, `balance` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res      = $results[0];
                $userid   = $res['userid'];   //购买用户ID
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额

                //扣除会员积分
                if (!empty($upoint) && $upoint > 0) {
                    // $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                    // $dsql->dsqlOper($archives, "update");
                    //
                    // //保存操作日志
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$upoint', '支付团购订单：$value', '$date')");
                    // $dsql->dsqlOper($archives, "update");

                    $paytype[] = "point";
                }

                //扣除会员余额
                if (!empty($ubalance) && $ubalance > 0) {
                    // $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                    // $dsql->dsqlOper($archives, "update");
                    //
                    // //保存操作日志
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$ubalance', '支付团购订单：$value', '$date')");
                    // $dsql->dsqlOper($archives, "update");

                    $paytype[] = "money";
                }

            }


            //增加支付日志
            $paylognum = create_ordernum();

            //代付
            if($peerpay){
                if($peerpay){

                    $param = array(
                        "service"  => "member",
                        "type"  => "user",
                        "template" => "daipay",
                        "param" => "module=tuan&ordernum=" . $ordernum . "&peerpay=1"
                    );
                    $url   = getUrlPath($param);

                    return  $url;
                }
            }

            // if($userid > 0){
            //     $archives  = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`) VALUES ('tuan', '$paylognum', '$userid', '$ordernum', '0', '" . join(",", $paytype) . "', '1')");
            //     $dsql->dsqlOper($archives, "update");
            // }


            //执行支付成功的操作
            $this->param = array(
                "paytype"  => join(",", $paytype),
                "ordernum" => $ordernum
            );
            $this->paySuccess();

            //跳转至支付成功页面
            //查询订单ID
            $oid = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_order` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $oid = $ret[0]['id'];
            }

            if($oid){
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "module"   => "tuan",
                    "id"       => $oid
                );
            }else{
                $param = array(
                    "service"  => "tuan",
                    "template" => "payreturn",
                    "ordernum" => $paylognum
                );
            }
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

            return  $url;

        }

        $timeout = GetMkTime(time()) + 1800;
        $order = createPayForm("tuan", $ordernum, $tuanprice, '', "团购订单",array(),1);

        $order['timeout']  = $timeout;

        return  $order;
//        $RenrenCrypt = new RenrenCrypt();
//        $ids         = base64_encode($RenrenCrypt->php_encrypt(join(",", $url)));
//
//        $param = array(
//            "service"  => "tuan",
//            "template" => "pay",
//            "param"    => "ordernum=" . $ids
//        );
//        return getUrlPath($param);

    }


    /**
     * 修改订单的配送地址
     * @return array
     */
    public function editOrderAddr()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $userid = $userLogin->getMemberID();
        $id     = (int)$param['id'];

        if ($userid == -1) return array("state" => 200, "info" => '登录超时，请登录后重试！');

        //验证订单
        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuan_order` WHERE `userid` = $userid AND `id` = $id");
        $res      = $dsql->dsqlOper($archives, "results");
        if (!$res) return array("state" => 200, "info" => '订单不存在或已删除，请确认后重试！');

        $date  = GetMkTime(time());
        $order = $res[0];

        //验证状态
        if ($order['orderstate'] == 0 || ($order['orderstate'] == 1 && $date - $order['paydate'] < 3600)) {

            $addrid       = (int)$param['addrid'];
            $deliveryType = (int)$param['deliveryType'];
            $comment      = $param['comment'];

            //地址库
            if ($addrid != 0) {
                $archives = $dsql->SetQuery("SELECT * FROM `#@__member_address` WHERE `uid` = $userid AND `id` = $addrid");
                $userAddr = $dsql->dsqlOper($archives, "results");

                if (!$userAddr) return array("state" => 200, "info" => '会员地址库信息不存在或已删除');

                global $data;
                $data    = "";
                $addrArr = getParentArr("site_area", $userAddr[0]['addrid']);
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                $addr    = join(" ", $addrArr);

                $address = $addr . $userAddr[0]['address'];
                $person  = $userAddr[0]['person'];
                $mobile  = $userAddr[0]['mobile'];
                $tel     = $userAddr[0]['tel'];

                $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;

                //新输入
            } else {

                $addressid = $param['addressid'];
                $address   = $param['address'];
                $person    = $param['person'];
                $mobile    = $param['mobile'];

                if (empty($addressid)) return array("state" => 200, "info" => '请选择所在区域');
                if (empty($address)) return array("state" => 200, "info" => '请输入街道地址');
                if (empty($person)) return array("state" => 200, "info" => '请输入收货人姓名');
                if (empty($mobile) && empty($tel)) return array("state" => 200, "info" => '手机号码和固定电话最少填写一项');

                if (!empty($mobile)) {
                    preg_match('/0?(13|14|15|17|18)[0-9]{9}/', $mobile, $matchPhone);
                    if (!$matchPhone) {
                        // return array("state" => 200, "info" => '手机格式有误');
                    }
                }

                $address = cn_substrR($address, 50);
                $person  = cn_substrR($person, 15);
                $mobile  = cn_substrR($mobile, 11);
                $tel     = cn_substrR($tel, 20);

                //保存到用户常用地址库
                $handels = new handlers("member", "addressAdd");
                $handels->getHandle(array(
                    "addrid"  => $addressid,
                    "address" => $address,
                    "person"  => $person,
                    "mobile"  => $mobile,
                    "tel"     => $tel
                ));

                global $data;
                $data    = "";
                $addrArr = getParentArr("site_area", $addressid);
                $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                $addr    = join(" ", $addrArr);

                $address = $addr . $address;

                $contact = !empty($mobile) ? $mobile . (!empty($tel) ? " / " . $tel : "") : $tel;
            }

            $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `useraddr` = '$address', `username` = '$person', `usercontact` = '$contact', `deliveryType` = '$deliveryType', `usernote` = '$comment' WHERE `id` = " . $id);
            $res      = $dsql->dsqlOper($archives, "update");
            if ($res == "ok") {
                return "修改成功！";
            } else {
                return array("state" => 200, "info" => "程序错误，修改失败！");
            }

        } else {

            if ($order['orderstate'] == 1) {
                return array("state" => 200, "info" => "支付时间已超过1个小时，修改失败！");
            } else {
                return array("state" => 200, "info" => "订单当前状态无法修改配送信息！");
            }

        }

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

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }
        //订单状态验证
        $payCheck = $this->payCheck();
        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  =  $param['usePinput'];   //是否使用积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码
        $peerpay     = $param['peerpay'];    //是否代付

        if ($userid == -1 && !$peerpay) return array("state" => 200, "info" => "登录超时，请登录后重试！");
        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        // if(empty($point) && empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "$cfg_pointName或余额至少选择一项！");
        if (!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");

        $totalPrice  = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //查询订单信息
            $archives   = $dsql->SetQuery("SELECT `procount`, `payprice` 'orderprice', `propolic` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
            $results    = $dsql->dsqlOper($archives, "results");
            $res        = $results[0];
            $procount   = $res['procount'];
            $orderprice = $res['orderprice'];
            $propolic   = $res['propolic'];
            $policy     = unserialize($propolic);

            $totalPrice  += $orderprice;
            //下单时已经计算过运费，这里不需要重复计算
            // if (!empty($propolic) && !empty($policy)) {
            //     $freight = $policy['freight'];
            //     $freeshi = $policy['freeshi'];

            //     if ($procount <= $freeshi) {
            //         $totalPrice += $freight;
            //     }
            // }

        }
        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];
        $tit      = array();
        $useTotal = 0;

//        //判断是否使用积分，并且验证剩余积分
//        if ($usePinput == 1 && !empty($point)) {
////            if ($userpoint < $point) return array("state" => 200, "info" => "您的可用" . $cfg_pointName . "不足，支付失败！");
//            if($userpoint < $point){
//                $useTotal += $userpoint / $cfg_pointRatio;     //如果用户积分小于支付的积分 则直接使用账户所有积分
//            }else{
//                $useTotal += $point / $cfg_pointRatio;
//            }
////            $useTotal += $point / $cfg_pointRatio;
//            $tit[]    = $cfg_pointName;
//        }

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");

            //验证余额
            if ($usermoney < $balance) return array("state" => 200, "info" => "您的余额不足，支付失败！");

            $useTotal += $balance;
            $tit[]    = "余额";
        }
        if ($useTotal > $totalPrice) return array("state" => 200, "info" => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
        //返回需要支付的费用
        return sprintf("%.2f", $totalPrice - $useTotal);

    }


    /**
     * 支付
     * @return array
     */
    public function pay()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $userLogin;

        $param = $this->param;

        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工暂不可以下单");  //格式错误
        }
        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        //重置表单参数
        $this->param = $param;

        $paycheck = $this->payCheck();
        if($paycheck != "ok"){
            return $paycheck;
        }
        if (is_array($payTotalAmount)) {
//            $param = array(
//                "service"  => "member",
//                "type"     => "user",
//                "template" => "order",
//                "module"   => "tuan"
//            );
//            $url   = getUrlPath($param);

            return $payTotalAmount;
//            header("location:" . $url);
//            die;
//            die("提交失败，请进入会员中心重新提交！");
        }

        $ordernum     = $param['ordernum'];
        $paytype      = $param['paytype'];
        $usePinput    = $param['usePinput'];
        $useBalance   = $param['useBalance'];
        $peerpayfinal = $param['peerpayfinal'];
        $orderfinal   = $param['orderfinal']; /*个人中心发起支付*/
        $balance      = (float)$param['balance'];
        $ordernumArr  = explode(",", $ordernum);
        $peerpay      = $param['peerpay'];  //是否代付

        //代付人

        if($peerpay){
            $p_userid = $userLogin->getMemberID();

            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `peerpay` = $p_userid WHERE `ordernum` IN ('$ordernum')");
            $dsql->dsqlOper($sql, "update");
        }else{
            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `peerpay` = 0 WHERE `ordernum` IN ('$ordernum')");
            $dsql->dsqlOper($sql, "update");
        }





        //如果有使用积分或余额则更新订单内容的价格策略
        if (($usePinput && !empty($point)) || ($useBalance && !empty($balance))) {
            // $pointMoney = $point / $cfg_pointRatio;
            $pointMoney   = $usePinput ? $point / $cfg_pointRatio : 0;    // swa190326
            $balanceMoney = $balance;
            foreach ($ordernumArr as $key => $value) {
                $oprice = 0;
                //查询订单信息
                $archives   = $dsql->SetQuery("SELECT `procount`, `payprice` 'orderprice', `propolic` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
                $results    = $dsql->dsqlOper($archives, "results");
                $res        = $results[0];
                $procount   = $res['procount'];   //数量
                $orderprice = $res['orderprice']; //单价

                $propolic   = $res['propolic'];   //物流政策
                $policy     = unserialize($propolic);

                $oprice   +=  $orderprice;  //单个订单总价 = 数量 * 单价
                //验证物流费用
                //下单时已经计算过运费，这里不需要重复计算
                // if (!empty($propolic) && !empty($policy)) {
                //     $freight = $policy['freight'];
                //     $freeshi = $policy['freeshi'];

                //     //如果达不到免物流费的数量，则总价再加上运费
                //     if ($procount <= $freeshi) {
                //         $oprice += $freight;
                //     }
                // }

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

                $archives    = $dsql->SetQuery("UPDATE `#@__tuan_order` SET  `balance` = '$useBalanceMoney' WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($archives, "update");
            }

            //如果没有使用积分或余额，重置积分&余额等价格信息
        } else {
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives   = $dsql->SetQuery("SELECT `procount`, `payprice` 'orderprice', `propolic` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
                $results    = $dsql->dsqlOper($archives, "results");
                $res        = $results[0];
                $procount   = $res['procount'];   //数量
                $orderprice = $res['orderprice']; //单价
                $propolic   = $res['propolic'];   //物流政策
                $policy     = unserialize($propolic);

                $oprice =  $orderprice;  //单个订单总价 = 数量 * 单价

                //验证物流费用
                //下单时已经计算过运费，这里不需要重复计算
                // if (!empty($propolic) && !empty($policy)) {
                //     $freight = $policy['freight'];
                //     $freeshi = $policy['freeshi'];

                //     //如果达不到免物流费的数量，则总价再加上运费
                //     if ($procount <= $freeshi) {
                //         $oprice += $freight;
                //     }
                // }

                $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET   `balance` = '0' WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($archives, "update");
            }
        }


        //1.如果需要支付的金额小于等于0，表示会员使用积分或余额已经付清了，不需要另外去支付
        //2.这种情况直接更新订单状态，并跳转至支付成功页即可
        //3.对会员的积分和余额进行扣除操作

        if ($peerpayfinal == 0 && $peerpay || $orderfinal == 1) {

            $ordersql = $dsql->SetQuery("SELECT  o.`orderdate` FROM `#@__tuan_order` o WHERE o.`ordernum` IN ('$ordernum')");

            $orderres = $dsql->dsqlOper($ordersql,"results");

            $timeout  = $orderres && is_array($orderres) ? $orderres[0]['orderdate'] : GetMkTime(time()) ;

            $timeout  += 1800;

            $order = createPayForm("tuan", $ordernum, $payTotalAmount, $paytype, "团购订单",array(),1);

            $order['timeout'] = $timeout;

            return  $order;

        }
        if ($payTotalAmount <= 0) {

            $date    = GetMkTime(time());
            $paytype = array();

            //扣除会员账户积分和余额
            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT `userid`, `point`, `balance` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res      = $results[0];
                $userid   = $res['userid'];   //购买用户ID
                $upoint   = $res['point'];    //使用的积分
                $ubalance = $res['balance'];  //使用的余额

                //扣除会员积分
                if (!empty($upoint) && $upoint > 0) {
                    // $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                    // $dsql->dsqlOper($archives, "update");
                    //
                    // //保存操作日志
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$upoint', '支付团购订单：$value', '$date')");
                    // $dsql->dsqlOper($archives, "update");

                    $paytype[] = "point";
                }

                //扣除会员余额
                if (!empty($ubalance) && $ubalance > 0) {
                    // $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                    // $dsql->dsqlOper($archives, "update");
                    //
                    // //保存操作日志
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$ubalance', '支付团购订单：$value', '$date')");
                    // $dsql->dsqlOper($archives, "update");

                    $paytype[] = "money";
                }

            }


            //增加支付日志
            $paylognum = create_ordernum();

            //代付
            if($peerpay){
                $userid = $p_userid;
            }

            // if($userid > 0){
            //     $archives  = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`) VALUES ('tuan', '$paylognum', '$userid', '$ordernum', '0', '" . join(",", $paytype) . "', '1')");
            //     $dsql->dsqlOper($archives, "update");
            // }


            //执行支付成功的操作
            $this->param = array(
                "paytype"  => join(",", $paytype),
                "ordernum" => $ordernum
            );
            $this->paySuccess();

            //跳转至支付成功页面
            //查询订单ID
            $oid = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_order` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $oid = $ret[0]['id'];
            }

            if($oid){
                $param = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "module"   => "tuan",
                    "id"       => $oid
                );
            }else{
                $param = array(
                    "service"  => "tuan",
                    "template" => "payreturn",
                    "ordernum" => $paylognum
                );
            }
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
            if($peerpay){

                $param = array(
                    "service"  => "member",
                    "type"  => "user",
                    "template" => "daipay_return",
                    "param" => "module=tuan&ordernum=" . $ordernum
                );
                $url   = getUrlPath($param);

//                header("location:" . $url);
                return $url;
            }else{
                return $url;
//                header("location:" . $url);
            }

        } else {

            //跳转至第三方支付页面
           return createPayForm("tuan", $ordernum, $payTotalAmount, $paytype, "团购订单");

        }


    }


    /**
     * 支付前验证订单内容
     * @return array
     */
    public function payCheck()
    {
        global $dsql;
        global $userLogin;

        $param    = $this->param;
        $ordernum = $param['ordernum'];
        $peerpay = $param['peerpay'];  //代付

        if (empty($ordernum)) return array("state" => 200, "info" => "订单号传递失败！");

        $userid = $userLogin->getMemberID();
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //获取订单内容，代付不需要核查下单人
            if($peerpay){
                $archives    = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate` FROM `#@__tuan_order` WHERE `ordernum` = '$value'");
            }else{
                $archives    = $dsql->SetQuery("SELECT `proid`, `procount`, `orderprice`, `orderstate` FROM `#@__tuan_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
            }
            $orderDetail = $dsql->dsqlOper($archives, "results");
            if ($orderDetail) {


                $proid      = $orderDetail[0]['proid'];
                $procount   = $orderDetail[0]['procount'];
                $orderprice = $orderDetail[0]['orderprice'];
                $orderstate = $orderDetail[0]['orderstate'];

                //验证订单状态
                if ($orderstate != 0) {
                    $info = count($ordernumArr) > 1 ? "订单中包含状态异常的订单，请确认后重试！" : "订单状态异常，请确认后重试！";
                    return array("state" => 200, "info" => $info);
                }

                $this->param = $proid;
                $proDetail   = $this->detail();

                //验证是否为自己的店铺
                if(!$peerpay){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        if ($proDetail['sid'] == $ret[0]['id']) {
                            return array("state" => 200, "info" => "企业会员不得购买自己店铺的商品！");
                        }
                    }
                }

                //获取商品详细信息
                if ($proDetail && $proDetail['enddate'] > time()) {
                    //验证商品库存
                    if ($proDetail['limit'] < $procount) {
                        return array("state" => 200, "info" => "商品：" . $proDetail['title'] . " 库存不足，请确认后重试！");
                    }
                    //验证购买数量限制
                    if ($proDetail['maxCount'] < $procount) {
                        return array("state" => 200, "info" => "商品：" . $proDetail['title'] .$proDetail['limit_msg']);
                    }


                    //成功不做处理，自动运行至结束返回ok


                    //商品不存在
                } else {
                    $info = count($ordernumArr) > 1 ? "订单中包含不存在或已下架的商品，请确认后重试！" : "提交失败，您要购买的商品不存在或已下架！";
                    return array("state" => 200, "info" => $info);
                }

                //订单不存在
            } else {
                $info = count($ordernumArr) > 1 ? "订单中包含不存在的订单，请确认后重试！" : "订单不存在或已删除，请确认后重试！";
                return array("state" => 200, "info" => $info);
            }

        }

        return "ok";

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
            global $userLogin;

            $paytype  = $param['paytype'];
            $paramArr = explode(",", $param['ordernum']);
            $date     = GetMkTime(time());

            foreach ($paramArr as $key => $value) {

                //成功之后更新消费操作日志
                $archives = $dsql->SetQuery("UPDATE  `#@__pay_log`  SET `paytype` ='$paytype', `state` = 1 WHERE `ordernum` = '$value'");
                $dsql->dsqlOper($archives, "update");

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT o.`voucher`,o.`pinid`,o.`id`, o.`userid`, o.`proid`, o.`procount`, o.`point`, o.`balance`, o.`payprice`, o.`paydate`, o.`orderdate`, o.`peerpay`, l.`title`, l.`tuantype`, l.`expire_type`, l.`expireddate`, l.`expire_limit`, s.`uid`, l.`pin`, l.`pinprice`, l.`pinpeople` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE o.`ordernum` = '$value'");
                $res      = $dsql->dsqlOper($archives, "results");

                if ($res) {
                    $title       = $res[0]['title'];
                    $orderid     = $res[0]['id'];
                    $uid         = $res[0]['uid'];
                    $userid      = $res[0]['userid'];
                    $proid       = $res[0]['proid'];
                    $procount    = (int)$res[0]['procount'];
                    $upoint      = $res[0]['point'];
                    $ubalance    = $res[0]['balance'];
                    $payprice    = $res[0]['payprice'];
                    $paydate     = $res[0]['paydate'];
                    $peerpay     = $res[0]['peerpay'];  //代付人
                    $tuantype    = $res[0]['tuantype'];
                    $orderdate   = $res[0]['orderdate'];
                    $expire_type = $res[0]['expire_type'];
                    $expireddate = $res[0]['expireddate'];
                    $expire_limit= $res[0]['expire_limit'];
                    if($expire_type=='limit'){
                        $orderdate_int = (int) $orderdate;
                        $expire_limit_int = (int)$expire_limit;
                        $expireddate = "".$orderdate_int+$expire_limit_int*60*60*24;
                    }
                    $pinid       = $res[0]['pinid'];
                    $pinpeople   = $res[0]['pinpeople'];
                    $voucher     = $res[0]['voucher'];

                    //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
                    if ($paydate == 0) {

                        //更新订单状态
                        $archives = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$value'");
                        $dsql->dsqlOper($archives, "update");

                        //更新已购买数量
                        $sql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = `buynum` + $procount WHERE `id` = '$proid'");
                        $dsql->dsqlOper($sql, "update");

                        //拼团
                        if ($pinid) {
                            $pinSuc = false;
                            $sql    = $dsql->SetQuery("SELECT * FROM `#@__tuan_pin` WHERE `id` = $pinid");
                            $pin    = $dsql->dsqlOper($sql, "results");
                            if ($pin) {
                                $pin    = $pin[0];
                                $fields = array();
                                array_push($fields, "`people` = `people` + 1");
                                // 创始人 更新拼团状态，开始和结束时间
                                if ($userid == $pin['userid']) {
                                    $pubdate = GetMkTime(time());
                                    $enddate = $pubdate + 3600 * 24;
                                    array_push($fields, "`state` = 1, `pubdate` = '$pubdate', `enddate` = '$enddate'");
                                }
                                if ($pin['people'] + 1 == $pinpeople) {
                                    array_push($fields, "`state` = 3");
                                    array_push($fields, "`okdate` = $date");
                                    $pinSuc = true;
                                }
                                $sql = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET " . join(",", $fields) . " WHERE `id` = $pinid");
                                $dsql->dsqlOper($sql, "update");
                            }
                        }

                        //领券
                        if (!empty($voucher)) {
                            $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_voucher` (`tid`, `uid`, `puctime`, `state`) VALUES ('$proid', '$userid', '$date', '0')");
                            $dsql->dsqlOper($archives, "lastid");
                        }

                        $totalPrice = $payprice;

                        //扣除会员积分
                        if (!empty($upoint) && $upoint > 0) {

                            //代付
                            if($peerpay){
                                if($peerpay > 0){
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$peerpay'");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }else{
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                                $dsql->dsqlOper($archives, "update");
                            }

                            //保存操作日志
                            if($peerpay){
                                if($peerpay > 0){
                                    $user  = $userLogin->getMemberInfo($peerpay);
                                    $userpoint = $user['point'];
//                                    $pointuser = (int)($userpoint-$upoint);
                                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$peerpay', '0', '$upoint', '代付团购订单：$value', '$date','xiaofei','$userpoint')");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }else{

                                $user  = $userLogin->getMemberInfo($userid);
                                $userpoint = $user['point'];
//                                $pointuser = (int)($userpoint-$upoint);
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '支付团购订单：$value', '$date','xiaofei','$userpoint')");
                                $dsql->dsqlOper($archives, "update");
                            }
                        }

                        //扣除会员余额
                        if (!empty($ubalance) && $ubalance > 0) {

                            //代付
                            if($peerpay){
                                if($peerpay > 0){
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$peerpay'");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }else{
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                                $dsql->dsqlOper($archives, "update");
                            }

                            //保存操作日志，下面已经有冻结的记录，里面包含了余额
                            //$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$ubalance', '支付团购订单：$value', '$date')");
                            //$dsql->dsqlOper($archives, "update");

                        }


                        //增加冻结金额
                        if($peerpay <= 0){
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                        }

                        $modulename = getModuleTitle(array('name' => 'tuan'));

                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$value' AND `state` = 1");
                        $ret = $dsql->dsqlOper($sql, "results");
                        $pid = '';
                        if ($ret) {
                            $pid = $ret[0]['id'];
                        }

                        $info = $modulename . "消费：" . $value;

                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "tuan",
                            "id"       => $orderid
                        );
                        $urlParam  = serialize($paramUser);
                        $sql       = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                        $ret       = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
                        }

                        // $title = $modulename . '-' . $shopname;
                        //保存操作日志
                        if (!empty($ubalance) && $ubalance > 0) {
                            if ($peerpay > 0) {
                                $user = $userLogin->getMemberInfo($peerpay);
                                $usermoney = $user['money'];
//                            $money =  sprintf('%.2f',($usermoney - $totalPrice));
                                $info = $modulename . "代付：" . $value;
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$peerpay', '0', '$totalPrice', '$info', '$date','tuan','xiaofei','$pid','$urlParam','$title','$value','$usermoney')");
                                $dsql->dsqlOper($archives, "update");
                            } else {
                                $user = $userLogin->getMemberInfo($userid);
                                $usermoney = $user['money'];
//                            $money =  sprintf('%.2f',($usermoney - $totalPrice));
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPrice', '$info', '$date','tuan','xiaofei','$pid','$urlParam','$title','$value','$usermoney')");
                                $dsql->dsqlOper($archives, "update");
                            }
                        }


                        //生成团购券
                        if ($tuantype == 0) {
                            if ($pinid == 0) {
                                $sqlQuan  = array();
                                $carddate = GetMkTime(time());
                                for ($i = 0; $i < $procount; $i++) {
                                    $cardnum     = genSecret(12, 1);
                                    $sqlQuan[$i] = "('$orderid', '$cardnum', '$carddate', 0, '$expireddate')";
                                }

                                $sql = $dsql->SetQuery("INSERT INTO `#@__tuanquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES " . join(",", $sqlQuan));
                                $dsql->dsqlOper($sql, "update");
                            } elseif ($pinid && $pinSuc) {//拼团并已成功
                                $sql = $dsql->SetQuery("SELECT `id`, `procount` FROM `#@__tuan_order` WHERE `pinid` = $pinid");
                                $ret = $dsql->dsqlOper($sql, "results");
                                if ($ret) {
                                    $carddate = GetMkTime(time());
                                    foreach ($ret as $k => $v) {
                                        $orderid  = $v['id'];
                                        $procount = $v['procount'];
                                        $sqlQuan  = array();
                                        for ($i = 0; $i < $procount; $i++) {
                                            $cardnum     = genSecret(12, 1);
                                            $sqlQuan[$i] = "('$orderid', '$cardnum', '$carddate', 0, '$expireddate')";
                                        }
                                        $sql = $dsql->SetQuery("INSERT INTO `#@__tuanquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES " . join(",", $sqlQuan));
                                        $dsql->dsqlOper($sql, "update");
                                    }
                                }
                            }
                        }

                        // 更新订单表中拼团状态
                        if ($pinid && $pinSuc) {
                            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `pinstate` = '1' WHERE `pinid` = $pinid");
                            $dsql->dsqlOper($sql, "update");
                        }
                        //生成充值卡


                        //支付成功，会员消息通知
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "tuan",
                            "id"       => $orderid
                        );

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "tuan",
                            "id"       => $orderid
                        );

                        //团购券类型的，商家直接跳到未使用
                        if($tuantype == 0){
                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "quan",
                                "action"   => "tuan-unuse"
                            );
                        }

                        //获取会员名
                        $username = "";
                        $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                        $ret      = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                        }

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "order"    => $value,
                            "amount"   => $totalPrice,
                            "title"    => $title,
                            "fields"   => array(
                                'keyword1' => '商品信息',
                                'keyword2' => '付款时间',
                                'keyword3' => '订单金额',
                                'keyword4' => '订单状态'
                            )
                        );

                        updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config, '', '', 0, 1);
                    
                        //记录用户行为日志
                        memberLog($userid, 'tuan', 'order', 0, 'insert', '下单('.$value.'=>'.$totalPrice.'元)', '', '');

                        //获取会员名
                        $username = "";
                        $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                        $ret      = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                        }

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "title"    => $title,
                            "order"    => $value,
                            "amount"   => $totalPrice,
                            "fields"   => array(
                                'keyword1' => '订单编号',
                                'keyword2' => '商品名称',
                                'keyword3' => '订单金额',
                                'keyword4' => '付款状态',
                                'keyword5' => '付款时间'
                            )
                        );

                        updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config, '', '', 0, 1);

                        $this->thirdPlatformPushOrder($value);  //推送订单

                    }

                }
            }
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
        global $siteCityInfo;

        $userid     = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'1')))  return array("state" => 200, "info" => '商家权限验证失败');  //商家权限验证失败！
            $userid = $userDetail['companyuid'];
        }
        $param      = $this->param;
        $stype      = (int)$param['stype'];
        $addrid     = (int)$param['addrid'];
        $cityid     = (int)$param['cityid'];
        $circle     = $param['circle'];
        $circle     = isset($circle) ? join(',', $circle) : '';
        $subway     = $param['subway'];
        $subway     = isset($subway) ? join(',', $subway) : '';
        $address    = filterSensitiveWords(addslashes($param['address']));
        $lnglat     = addslashes($param['lnglat']);
        $phone      = filterSensitiveWords(addslashes($param['phone']));
        $openStart  = filterSensitiveWords(addslashes($param['openStart']));
        $openEnd    = filterSensitiveWords(addslashes($param['openEnd']));
        $note       = filterSensitiveWords(addslashes($param['note']));
        $body       = filterSensitiveWords(addslashes($param['body']));
        $pubdate    = GetMkTime(time());
        $video      = $param['video'];
        $tel        = $param['tel'];
        $qq         = $param['qq'];
        $wechatcode = $param['wechatcode'];
        $imglist    = $param['imglist'];
        if (empty($cityid)) {
            $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
            $cityInfoArr = explode(',', $cityInfoArr);
            $cityid      = $cityInfoArr[0];
        }

        if ($userid <= 0 || $userid == '') {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证会员类型
        if ($userDetail['userType'] != 2 && $userDetail['is_staff'] !=1) {
            return array("state" => 200, "info" => '账号验证错误，操作失败！');
        }

        //权限验证
        if (!verifyModuleAuth(array("module" => "tuan"))) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if (empty($stype)) {
            return array("state" => 200, "info" => '请选择所属类别');
        }

        if (empty($addrid)) {
            return array("state" => 200, "info" => '请选择所在区域');
        }

        if (empty($circle)) {
            //return array("state" => 200, "info" => '请选择所在商圈');
        }

        if (empty($address)) {
            return array("state" => 200, "info" => '请输入详细地址');
        }

        if (empty($phone)) {
            return array("state" => 200, "info" => '请输入联系电话');
        }

        if (empty($openStart) || empty($openEnd)) {
            return array("state" => 200, "info" => '请选择营业时间');
        }

        if (empty($imglist)) {
            return array("state" => 200, "info" => '请上传图集');
        }

        $openStart = str_replace(":", "", $openStart);
        $openEnd   = str_replace(":", "", $openEnd);

        if (empty($note)) {
            //return array("state" => 200, "info" => '请输入简介');
        }
        $note = cn_substrR($note, 200);

        if (empty($body)) {
            // return array("state" => 200, "info" => '请输入详细介绍');
        }
        if (!empty($lnglat)) {
            $lnglatArr = explode(",", $lnglat);
            $lng       = $lnglatArr[0];
            $lat       = $lnglatArr[1];
        }

        $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");

        //入驻审核开关
        include HUONIAOINC . "/config/business.inc.php";
        $moduleJoinCheck     = (int)$customModuleJoinCheck;
        $editModuleJoinCheck = (int)$customEditModuleJoinCheck;

        //新商铺
        if (!$userResult) {

            //保存到主表
            $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_store` (`cityid`, `uid`, `stype`, `subway`, `addrid`, `address`, `circle`, `lnglat`, `tel`, `openStart`, `openEnd`, `note`, `body`, `jointime`, `click`, `weight`, `state`, `lng`, `lat`, `video`, `pics`, `phone`, `qq`, `wechatcode`) VALUES ('$cityid', '$userid', '$stype', '$subway', '$addrid', '$address', '$circle', '$lnglat', '$phone', '$openStart', '$openEnd', '$note', '$body', '$pubdate', '1', '1', '$moduleJoinCheck', '$lng', '$lat', '$video', '$imglist', '$tel', '$qq', '$wechatcode')");
            $aid      = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'tuan',
                    'template' => 'store',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'tuan', 'store', $aid, 'insert', '申请店铺', $url, $archives);

                // 更新店铺开关
                updateStoreSwitch("tuan", "tuan_store", $userid, $aid);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];
                $param    = array(
                    'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . '分站——tuan模块——用户:' . $userDetail['username'] . '新增商铺: ' . $title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("tuan", "store", $param);
                dataAsync("tuan",$aid,"store");  // 团购新配置商铺
                return "配置成功，您的商铺正在审核中，请耐心等待！";
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

            //更新商铺信息
        } else {
            if ($body) {
                $where = " `body` = '$body',";
            }
            //保存到主表
            $archives = $dsql->SetQuery("UPDATE `#@__tuan_store` SET `cityid` = '$cityid', `stype` = '$stype', `subway` = '$subway', `addrid` = '$addrid', `address` = '$address', `circle` = '$circle', `lnglat` = '$lnglat', `tel` = '$phone', `openStart` = '$openStart', `openEnd` = '$openEnd', `note` = '$note', $where `lng` = '$lng', `lat` = '$lat', `video` = '$video', `pics` = '$imglist', `phone` = '$tel', `qq` = '$qq', `wechatcode` = '$wechatcode', `state` = '$editModuleJoinCheck' WHERE `uid` = " . $userid);
            $results  = $dsql->dsqlOper($archives, "update");

            if ($results == "ok") {
                $sql = $dsql->SetQuery("select `id` from `#@__tuan_store` where `uid`=$userid");
                $res = $dsql->dsqlOper($sql,"results");
                $id = $res[0]['id'];

                $urlParam = array(
                    'service' => 'tuan',
                    'template' => 'store',
                    'id' => $id
                );
                $url = getUrlPath($urlParam);
            
                //记录用户行为日志
                memberLog($userid, 'tuan', 'store', $id, 'update', '修改店铺', $url, $archives);

                dataAsync("tuan",$id,"store");  // 团购修改商铺
                return "保存成功！";
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }

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
        global $siteCityInfo;

        require(HUONIAOINC . "/config/tuan.inc.php");
        $customagentCheck = (int)$customagentCheck;
        $arcrank          = $customagentCheck;

        $userid      = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！

            $userid = $userDetail['companyuid'];
        }
        $param       = $this->param;
        $title       = filterSensitiveWords(addslashes($param['title']));
        $subtitle    = filterSensitiveWords(addslashes($param['subtitle']));
        $litpic      = $param['litpic'];
        $imglist     = $param['imglist'];
        $startdate   = $param['startdate'];
        $startdate   = !empty($startdate) ? GetMkTime($startdate) : 0;
        $enddate     = $param['enddate'];
        $enddate     = !empty($enddate) ? GetMkTime($enddate) : 0;
        $hourly      = (int)$param['hourly'];
        $maxnum      = (int)$param['maxnum'];
        $limit_day   = (int)$param['limit_day'];
        $limit       = (int)$param['limit'];
        $limit_start = $param['limit_start'];
        $limit_start = !empty($limit_start)? GetMkTime($limit_start) : 0;
        $limit_end   = $param['limit_end'];
        $limit_end   = !empty($limit_end)? GetMkTime($limit_end) : 0;
        $market      = (float)$param['market'];
        $price       = (float)$param['price'];
        $tuantype    = (int)$param['tuantype'];
        $expire_type = $param['expire_type'];
        $expire_limit= $param['expire_limit'];
        $expire_type   = $expire_type ==""? 'static': $expire_type;
        $expire_limit   = $expire_limit =="" ? 0 : (int)$expire_limit;

        $expireddate  = $param['expireddate'];
        $expireddate = !empty($expireddate) ? GetMkTime($expireddate) : 0;
        if($tuantype==0 && $expire_type=="static" &&  empty($expireddate)){
            return array("state" => 200, "info" => '请选择团购券过期时间！');
        }
        if($tuantype==0 && $expire_type=="limit" && $expire_limit<=0){
            return array("state" => 200, "info" => '团购券过期时间必须是正整数！');
        }
        $freight     = (int)$param['freight'];
        $freeshi     = (int)$param['freeshi'];
        $flags       = $param['flags'];
        $flags       = isset($flags) ? join(',', $flags) : '';
        $tips        = filterSensitiveWords(addslashes($param['tips']));
        $notice      = filterSensitiveWords(addslashes($param['notice']));
        $packtype    = (int)$param['packtype'];
        $package     = filterSensitiveWords(addslashes($param['package']));
        $body        = filterSensitiveWords(addslashes($param['body']));
        $vdimgck     = $param['vdimgck'];
        $pinpeople   = (int)$param['pinpeople'];
        $pinprice    = (float)$param['pinprice'];
        $pin         = (int)$param['pin'];
        $video       = $param['video'];

        if ($userid == 0 && $userid == '') {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userinfo = $userLogin->getMemberInfo();
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan")) && $userDetail['is_staff'] != 1) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `stype`, `state` FROM `#@__tuan_store` WHERE `uid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array("state" => 200, "info" => '您还未开通团购店铺！');
        }

        if ($userResult[0]['state'] == 0) {
            return array("state" => 200, "info" => '您的商铺信息还在审核中，请通过审核后再发布！');
        }

        if ($userResult[0]['state'] == 2) {
            return array("state" => 200, "info" => '您的商铺信息审核失败，请通过审核后再发布！');
        }

        $sid = $userResult[0]['id'];

        if (empty($title)) {
            return array("state" => 200, "info" => '标题不能为空');
        }

        if (empty($subtitle)) {
            return array("state" => 200, "info" => '副标题不能为空');
        }

        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传代表图片');
        }

        if (empty($imglist)) {
            return array("state" => 200, "info" => '请上传图集');
        }

        if (!empty($startdate) && !empty($enddate)) {
            $startdate = GetMkTime($startdate);
            $enddate   = GetMkTime($enddate);
            if ($enddate - $startdate < 0) {
                return array("state" => 200, "info" => '结束时间不能小于开始时间');
            }
        } else {
            return array("state" => 200, "info" => '请选择团购时间');
        }

        // if($tuantype == 2){
        // 	if($freight ===''){
        // 		return array("state" => 200, "info" => '请输入运费');
        // 	}
        // 	if($freeshi === ''){
        // 		return array("state" => 200, "info" => '请输入免运费政策');
        // 	}
        // }

        $itemResults = array();
        $typeid      = $userResult[0]['stype'];
        $checktype   = $dsql->SetQuery("SELECT `parentid` FROM `#@__tuantype` WHERE `id` = " . $typeid);
        $typeResults = $dsql->dsqlOper($checktype, "results");
        $tt          = $typeResults[0]['parentid'] != 0 ? $typeResults[0]['parentid'] : $typeid;

        $infoitem    = $dsql->SetQuery("SELECT * FROM `#@__tuantypeitem` WHERE `tid` = " . $tt . " ORDER BY `orderby` DESC");
        $itemResults = $dsql->dsqlOper($infoitem, "results");

        //验证字段内容
        if (count($itemResults) > 0) {
            foreach ($itemResults as $key => $value) {
                if ($value["required"] == 1 && $_POST['item_' . $value["id"]] == "") {
                    if ($value["formtype"] == "text") {
                        return array("state" => 200, "info" => $value['title'] . '不能为空');
                    } else {
                        return array("state" => 200, "info" => '请选择' . $value['title']);
                    }
                }
            }
        }

        if (trim($body) == '') {
            // return array("state" => 200, "info" => '请输入团购详情');
        }

        $ip      = GetIP();
        $ipAddr  = getIpAddr($ip);
        $pubdate = GetMkTime(time());

        //保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__tuanlist` (`sid`, `title`, `subtitle`, `startdate`, `enddate`, `hourly`, `minnum`, `maxnum`,`limit_day`, `limit`, `limit_start`,`limit_end`,`defbuynum`, `tuantype`, `expire_type`,`expireddate`, `expire_limit`,`amount`, `freight`, `freeshi`, `litpic`, `pics`, `market`, `price`, `arcrank`, `weight`, `flag`, `tips`, `notice`, `packtype`, `package`, `body`, `mbody`, `pubdate`, `ip`, `ipaddr`, `pin`, `pinprice`, `pinpeople`, `video`) VALUES ('$sid', '$title', '$subtitle', '$startdate', '$enddate', '$hourly', '1', '$maxnum', '$limit_day','$limit', '$limit_start','$limit_end','0', '$tuantype', '$expire_type','$expireddate', '$expire_limit','0', '$freight', '$freeshi', '$litpic', '$imglist', '$market', '$price', '$arcrank', '1', '$flags', '$tips', '$notice', '$packtype', '$package', '$body', '$body', '$pubdate', '$ip', '$ipAddr', '$pin', '$pinprice', '$pinpeople', '$video')");
        $aid      = $dsql->dsqlOper($archives, "lastid");

        if (is_numeric($aid)) {

            $urlParam = array(
                'service' => 'tuan',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'tuan', '', $aid, 'insert', '发布商品('.$title.')', $url, $archives);

            //保存字段内容
            if (count($itemResults) > 0) {
                foreach ($itemResults as $key => $value) {
                    $val = $_POST['item_' . $value['id']];
                    if ($value['formtype'] == "checkbox") {
                        if (is_array($val)) {
                            $val = join(",", $val);
                        }
                    }
                    $infoitem = $dsql->SetQuery("INSERT INTO `#@__tuanitem` (`aid`, `iid`, `value`) VALUES (" . $aid . ", " . $value['id'] . ", '" . $val . "')");
                    $dsql->dsqlOper($infoitem, "update");
                }
            }

            //微信通知
            $cityid     = $userDetail['cityid'];
            $cityName   =  getSiteCityName($cityid);
            $infoname = getModuleTitle(array('name' => 'tuan'));    //获取模块名
            $param    = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n用户:". $userinfo['nickname'] . "发布了一条拼团: " . $title,
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("tuan", "detail", $param);
            return $aid;
        } else {
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
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
        global $siteCityInfo;

        require(HUONIAOINC . "/config/tuan.inc.php");
        $customagentCheck = (int)$customagentCheck;
        $arcrank          = $customagentCheck;

        $userid    = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" =>'商家权限验证失败');  //商家权限验证失败！

            $userid = $userDetail['companyuid'];
        }
        $param     = $this->param;
        $id        = $param['id'];
        $title     = filterSensitiveWords(addslashes($param['title']));
        $subtitle  = filterSensitiveWords(addslashes($param['subtitle']));
        $litpic    = $param['litpic'];
        $imglist   = $param['imglist'];
        $startdate = $param['startdate'];
        $startdate = !empty($startdate) ? GetMkTime($startdate) : 0;
        $enddate   = $param['enddate'];
        $enddate   = !empty($enddate) ? GetMkTime($enddate) : 0;
        $expire_type= $param['expire_type'];
        $expire_type= empty($expire_type) ? "static" : $expire_type;
        $expire_limit=$param['expire_limit'];
        $expire_limit= empty($expire_limit) ? 0 : (int)$expire_limit;
        $expiredate= $param['expireddate'];
        $expiredate= !empty($expiredate) ? GetMkTime($expiredate) : 0;

        $hourly    = (int)$param['hourly'];
        $maxnum    = (int)$param['maxnum'];
        $limit_day = (int)$param['limit_day'];
        $limit_start = $param['limit_start'];
        $limit_start = !empty($limit_start)? GetMkTime($limit_start) : 0;
        $limit_end = $param['limit_end'];
        $limit_end = !empty($limit_end) ? GetMkTime($limit_end) : 0;
        $limit     = (int)$param['limit'];
        $market    = (float)$param['market'];
        $price     = (float)$param['price'];
        // $tuantype    = (int)$param['tuantype'];
        // $expireddate = $param['expireddate'];
        // $expireddate = !empty($expireddate) ? GetMkTime($expireddate) : 0;
        // $freight     = (int)$param['freight'];
        // $freeshi     = (int)$param['freeshi'];
        $flags     = $param['flags'];
        $flags     = isset($flags) ? join(',', $flags) : '';
        $tips      = filterSensitiveWords(addslashes($param['tips']));
        $notice    = filterSensitiveWords(addslashes($param['notice']));
        $packtype  = (int)$param['packtype'];
        $package   = filterSensitiveWords(addslashes($param['package']));
        $body      = filterSensitiveWords(addslashes($param['body']));
        $pinpeople = (int)$param['pinpeople'];
        $pinprice  = (float)$param['pinprice'];
        $pin       = (int)$param['pin'];
        $video     = $param['video'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        if ($userid == 0 && $userid == '') {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userinfo = $userLogin->getMemberInfo();
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan")) && $userDetail['is_staff'] != 1) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `stype` FROM `#@__tuan_store` WHERE `uid` = " . $userid);
        $userResult = $dsql->dsqlOper($userSql, "results");
        if (!$userResult) {
            return array("state" => 200, "info" => '您还未开通团购店铺！' . $userid);
        }

        $sid = $userResult[0]['id'];

        $archives = $dsql->SetQuery("SELECT `id`, `tuantype` FROM `#@__tuanlist` WHERE `id` = " . $id . " AND `sid` = " . $sid);
        $results  = $dsql->dsqlOper($archives, "results");
        if (!$results) {
            return array("state" => 200, "info" => '权限不足，修改失败！');
        }
        $tuantype = (int)$results[0]['tuantype'];
        if($tuantype==0 && $expire_type=="static" && empty($expiredate)){
            return array("state" => 200, "info" => '请选择团购券过期时间！');
        }
        if($tuantype==0 && $expire_type=="limit" && $expire_limit<=0){
            return array("state" => 200, "info" => '团购券过期时间必须是正整数！');
        }

        if (empty($title)) {
            return array("state" => 200, "info" => '标题不能为空');
        }

        if (empty($subtitle)) {
            return array("state" => 200, "info" => '副标题不能为空');
        }

        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传代表图片');
        }

        if (empty($imglist)) {
            return array("state" => 200, "info" => '请上传图集');
        }

        if (!empty($startdate) && !empty($enddate)) {
            $startdate = GetMkTime($startdate);
            $enddate   = GetMkTime($enddate);
            if ($enddate - $startdate < 0) {
                return array("state" => 200, "info" => '结束时间不能小于开始时间');
            }
        } else {
            return array("state" => 200, "info" => '请选择团购时间');
        }

        // if($tuantype == 2){
        // 	if($freight == ''){
        // 		return array("state" => 200, "info" => '请输入运费');
        // 	}
        // 	if($freeshi == ''){
        // 		return array("state" => 200, "info" => '请输入免运费政策');
        // 	}
        // }

        $itemResults = array();
        $typeid      = $userResult[0]['stype'];
        $checktype   = $dsql->SetQuery("SELECT `parentid` FROM `#@__tuantype` WHERE `id` = " . $typeid);
        $typeResults = $dsql->dsqlOper($checktype, "results");
        $tt          = $typeResults[0]['parentid'] != 0 ? $typeResults[0]['parentid'] : $typeid;

        $infoitem    = $dsql->SetQuery("SELECT * FROM `#@__tuantypeitem` WHERE `tid` = " . $tt . " ORDER BY `orderby` DESC");
        $itemResults = $dsql->dsqlOper($infoitem, "results");

        //验证字段内容
        if (count($itemResults) > 0) {
            foreach ($itemResults as $key => $value) {
                if ($value["required"] == 1 && $_POST['item_' . $value["id"]] == "") {
                    if ($value["formtype"] == "text") {
                        return array("state" => 200, "info" => $value['title'] . '不能为空');
                    } else {
                        return array("state" => 200, "info" => '请选择' . $value['title']);
                    }
                }
            }
        }

        if (trim($body) == '') {
            // return array("state" => 200, "info" => '请输入团购详情');
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `title` = '$title', `subtitle` = '$subtitle', `startdate` = '$startdate', `enddate` = '$enddate',`expire_type`='$expire_type',`expireddate`='$expiredate',`expire_limit`='$expire_limit', `hourly` = '$hourly', `maxnum` = '$maxnum',`limit_day`='$limit_day', `limit` = '$limit',`limit_start`='$limit_start',`limit_end`='$limit_end', `litpic` = '$litpic', `pics` = '$imglist', `market` = '$market', `price` = '$price', `arcrank` = '0', `flag` = '$flags', `tips` = '$tips', `notice` = '$notice', `packtype` = '$packtype', `package` = '$package', `body` = '$body', `mbody` = '$body', `pin` = '$pin', `pinprice` = '$pinprice', `pinpeople` = '$pinpeople', `video` = '$video', `arcrank` = '$arcrank' WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");

        if ($results != "ok") {
            return array("state" => 200, "info" => '保存到数据时发生错误，请检查字段内容！');
        }

        $urlParam = array(
            'service' => 'tuan',
            'template' => 'detail',
            'id' => $id
        );
        $url = getUrlPath($urlParam);
    
        //记录用户行为日志
        memberLog($userid, 'tuan', '', $id, 'update', '修改商品('.$title.')', $url, $archives);

        //先删除信息所属字段
        $archives = $dsql->SetQuery("DELETE FROM `#@__tuanitem` WHERE `aid` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");

        //保存字段内容
        if (count($itemResults) > 0) {
            foreach ($itemResults as $key => $value) {
                $val = $_POST["item_" . $value['id']];
                if ($value['formtype'] == "checkbox") {
                    if (is_array($val)) {
                        $val = join(",", $val);
                    }
                }

                $infoitem = $dsql->SetQuery("INSERT INTO `#@__tuanitem` (`aid`, `iid`, `value`) VALUES (" . $id . ", " . $value['id'] . ", '" . $val . "')");
                $dsql->dsqlOper($infoitem, "update");
            }
        }
        //微信通知
        $cityid     = $userDetail['cityid'];
        $cityName   =  getSiteCityName($cityid);
        $infoname = getModuleTitle(array('name' => 'tuan'));    //获取模块名
        $param    = array(
            'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
            'cityid' => $cityid,
            'notify' => '管理员消息通知',
            'fields' => array(
                'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n用户:". $userinfo['nickname'] . "更新信息id: " . $id."\r\n更新信息：".$title,
                'date'      => date("Y-m-d H:i:s", time()),
            )
        );
        updateAdminNotice("tuan", "detail", $param);

        //后台消息通知

        return "修改成功！";

    }


    /**
     * 删除信息
     * @return array
     */
    public function del()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        return array("state" => 200, "info" => '请联系平台客服处理！');  //客户反馈，有商家自行删除订单后，导致用户订单失效，产生了投诉情况，这里暂把功能取消掉，后续有其他方案再加

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE l.`id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];

            // if($results['arcrank'] == 1) return array("state" => 200, "info" => '商品当前状态不可以删除！');

            if ($results['uid'] == $uid) {

                //删除评论
                $archives = $dsql->SetQuery("DELETE FROM `#@__public_comment_all` WHERE `type` = 'tuan-order' AND `aid` = " . $id);
                $dsql->dsqlOper($archives, "update");

                $orderid = array();
                //删除相应的订单、团购券、充值卡数据
                $orderSql    = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_order` WHERE `proid` = " . $id);
                $orderResult = $dsql->dsqlOper($orderSql, "results");

                if ($orderResult) {
                    foreach ($orderResult as $key => $order) {
                        array_push($orderid, $order['id']);
                    }

                    if (!empty($orderid)) {
                        $orderid = join(",", $orderid);

                        $quanSql = $dsql->SetQuery("DELETE FROM `#@__tuanquan` WHERE `orderid` in (" . $orderid . ")");
                        $dsql->dsqlOper($quanSql, "update");

                        $quanSql = $dsql->SetQuery("DELETE FROM `#@__paycard` WHERE `module` = 'tuan' AND `orderid` in (" . $orderid . ")");
                        $dsql->dsqlOper($quanSql, "update");
                    }

                    $quanSql = $dsql->SetQuery("DELETE FROM `#@__tuan_order` WHERE `proid` = " . $id);
                    $dsql->dsqlOper($quanSql, "update");
                }

                //删除缩略图
                delPicFile($results['litpic'], "delThumb", "tuan");
                //删除图集
                delPicFile($results['pics'], "delAtlas", "tuan");

                $body = $results['body'];
                if (!empty($body)) {
                    delEditorPic($body, "tuan");
                }
                //删除表
                $archives = $dsql->SetQuery("DELETE FROM `#@__tuanlist` WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'tuan', '', $id, 'delete', '发布商品('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => '删除成功！');
            } else {
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array("state" => 101, "info" => '商品不存在，或已经删除！');
        }

    }

    /**
     * 商品下架
     * @return array
     */
    public function offshelf(){
        global $dsql;
        global $userLogin;

        $id = (int)$this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE l.`id` = " . $id . " AND s.`uid` = $uid");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];

            // if($results['arcrank'] == 1) return array("state" => 200, "info" => '商品当前状态不可以删除！');

            if ($results['uid'] == $uid) {

                //更新商品状态
                $archives = $dsql->SetQuery("update `#@__tuanlist` set arcrank = 6 WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'tuan', '', $id, 'update', '下架商品('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => '下架成功！');
            } else {
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array("state" => 101, "info" => '商品不存在，或已经删除！');
        }
    }

    /** 商品上架
     * @return array
     */
    public function onshelf(){
        global $dsql;
        global $userLogin;

        $id = (int)$this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userDetail = $userLogin->getMemberInfo();
        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }
        $archives = $dsql->SetQuery("SELECT * FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE l.`id` = " . $id . " AND s.`uid` = $uid");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];

            // if($results['arcrank'] == 1) return array("state" => 200, "info" => '商品当前状态不可以删除！');

            if ($results['uid'] == $uid) {

                //更新商品状态（只有1可以下架，那么上架后重新设置为1）
                $archives = $dsql->SetQuery("update `#@__tuanlist` set arcrank = 1 WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");
            
                //记录用户行为日志
                memberLog($uid, 'tuan', '', $id, 'update', '上架商品('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => '上架成功！');
            } else {
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array("state" => 101, "info" => '商品不存在，或已经删除！');
        }
    }

    /**
     * 团购券列表
     * @return array
     */
    public function quanList()
    {
        global $dsql;
        global $userLogin;

        $pageinfo = $list = $orderid = array();
        $page     = $pageSize = $where = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $ordernum = $this->param['ordernum'];
                $type     = $this->param['type'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if ($type == "unuse") {
            $where .= " AND q.`usedate` = 0";
        } else {
            $where .= " AND q.`usedate` <> 0";
        }

        //订单号筛选
        if ($ordernum) {
            $where .= " AND o.`ordernum` = '$ordernum'";
        }

        //获取用户ID
        $uid = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'2')))  return array("state" => 200, "info" => '商家权限验证失败!');  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userinfo = $userLogin->getMemberInfo();
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan"))&&$userDetail['is_staff'] != 1) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }


        $archives = $dsql->SetQuery("SELECT q.`id`, q.`cardnum`, q.`usedate`, q.`carddate`, q.`expireddate`, o.`ordernum`, o.`proid`, o.`proprice` orderprice, o.`procount` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanquan` q ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE s.`uid` = '$uid' AND o.`orderstate` != 7 $where GROUP BY q.`cardnum` ORDER BY q.`usedate` DESC");

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
        $results = $dsql->dsqlOper($archives . " LIMIT $atpage, $pageSize", "results");

        if (count($results) > 0) {
            $list = array();
            foreach ($results as $key => $value) {

                $sql = $dsql->SetQuery("SELECT `id`, `title`, `price` FROM `#@__tuanlist` WHERE `id` = " . $value['proid']);
                $res = $dsql->dsqlOper($sql, "results");

                if ($res) {
                    $id    = $res[0]['id'];
                    $title = $res[0]['title'];
                    $price = $res[0]['price'];
                    $param = array(
                        "service"  => "tuan",
                        "template" => "detail",
                        "id"       => $id
                    );
                    $url   = getUrlPath($param);

                    $list[$key]["pro"]['title'] = $title;
                    $list[$key]["pro"]['url']   = $url;
                } else {
                    $list[$key]["pro"]['title'] = "";
                    $list[$key]["pro"]['url']   = "";
                    $price = sprintf('%.2f', ($value['orderprice']/$value['procount']));
                }

                $list[$key]['id']       = $value['id'];
                $list[$key]['price']    = $price;
                $list[$key]['ordernum'] = $value['ordernum'];

                if ($type == "unuse") {
                    $list[$key]['carddate']    = $value['carddate'];
                    $list[$key]['expireddate'] = $value['expireddate'];
                } else {
                    $list[$key]['cardnum'] = $value['cardnum'];
                    $list[$key]['usedate'] = $value['usedate'];
                }

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 验证团购券状态
     */
    public function verifyQuan()
    {
        global $dsql;
        global $userLogin;

        $code = $this->param['code'];
        $now  = GetMkTime(time());

        if (!is_numeric($code)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $userinfo = $userLogin->getMemberInfo();

        if($userinfo['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'4')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userinfo['companyuid'];
        }
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan")) && $userinfo['is_staff'] != 1) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        //查询券
        $archives = $dsql->SetQuery("SELECT q.`usedate`, q.`expireddate`, o.`proid`, o.`orderprice` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE (o.`orderstate` = 1 OR o.`orderstate` = 2 OR o.`orderstate` = 3) AND q.`cardnum` = '" . $code . "' AND s.`uid` = " . $uid);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $usedate     = $results[0]['usedate'];
            $expireddate = $results[0]['expireddate'];
            $proid       = $results[0]['proid'];

            //是否已经使用过
            if ($usedate != 0) {
                $usedate = date("Y-m-d H:i:s", $usedate);
                return array("state" => 101, "info" => '验证失败，此券已于' . $usedate . '使用过了！');

                //是否已经过期
            } elseif ($expireddate < $now) {
                return array("state" => 101, "info" => '验证失败，此券已经过期！');

                //可以使用
            } else {

                //获取团购信息
                $sql = $dsql->SetQuery("SELECT `id`, `title`, `price` FROM `#@__tuanlist` WHERE `id` = " . $proid);
                $res = $dsql->dsqlOper($sql, "results");
                if ($res) {

                    $id    = $res[0]['id'];
                    $title = $res[0]['title'];

                    $param = array(
                        "service"  => "tuan",
                        "template" => "detail",
                        "id"       => $id
                    );
                    $url   = getUrlPath($param);

                    $currency = echoCurrency(array("type" => "short"));

                    return "验证成功，项目：<a href='" . $url . "' target='_blank'>$title</a> [" . $results[0]['orderprice'] . $currency . "]";

                } else {
                    return array("state" => 101, "info" => '验证失败，团购信息不存在！');
                }

            }

        } else {
            return array("state" => 101, "info" => '密码错误，请与消费者确认提供的密码是否正确！');
        }


    }


    /**
     * 消费团购券
     */
    public function useQuan()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $codes = $this->param['codes'];
        $now   = GetMkTime(time());
        $uid   = $userLogin->getMemberID();

        $userinfo = $userLogin->getMemberInfo();

        if($userinfo['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'tuan','type'=>'3')))  return array("state" => 200, "info" => '商家权限验证失败！');  //商家权限验证失败！

            $uid = $userinfo['companyuid'];
        }
        if ($userinfo['userType'] == 2 && !verifyModuleAuth(array("module" => "tuan")) && $userinfo['is_staff'] != 1) {
            return array("state" => 200, "info" => '商家权限验证失败！');
        }

        if (empty($codes)) return array("state" => 200, "info" => '请输入要消费的团购券密码！');

        $codeArr = explode(",", $codes);
        $success = 0;
        foreach ($codeArr as $key => $value) {

            $this->param['code'] = $value;
            $verify              = $this->verifyQuan();
            if (!is_array($verify)) {

                $sql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `usedate` = '$now' WHERE `cardnum` = '$value'");
                $res = $dsql->dsqlOper($sql, "update");
                if ($res == "ok") {
                    $success++;

                    //查询订单信息
                    $sql = $dsql->SetQuery("SELECT q.`orderid`,q.`cardnum`, o.`ordernum`, o.`orderprice`, o.`userid`, o.`procount`, o.`orderprice`, o.`balance`, o.`payprice`, o.`propolic`, o.`peerpay`,o.`shopFee`,o.`proprice`,l.`price` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id`  WHERE q.`cardnum` = '$value'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {

                        $orderid = $ret[0]['orderid'];

                        $ordernum   = $ret[0]['ordernum'];   //订单号
                        $procount   = $ret[0]['procount'];   //数量
                        // $orderprice = $ret[0]['proprice'] > 0 ? $ret[0]['proprice'] : $ret[0]['price']; //单价  如果proprice没有值，直接使用商品价格，此处用于兼容老数据
                        $orderprice = $ret[0]['price']; //商品单价
                        $balance    = $ret[0]['balance'];    //余额金额
                        $payprice   = $ret[0]['payprice'];   //支付金额
                        $userid     = $ret[0]['userid'];     //买家ID
                        $peerpay    = $ret[0]['peerpay'];     //代付
                        $shopFee    = $ret[0]['shopFee'];     //平台分成
                        $cardnum   = $ret[0]['cardnum'];   //团券订单号


                        //更新订单状态，如果券都用掉了，就更新订单状态为已使用
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuanquan` WHERE `orderid` = (SELECT `orderid` FROM `#@__tuanquan` WHERE `cardnum` = '$value') AND `usedate` = 0");
                        $ret = $dsql->dsqlOper($sql, "totalCount");
                        if ($ret == 0) {
                            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 3, `ret-state` = 0 WHERE `id` = '$orderid'");
                            $dsql->dsqlOper($sql, "update");
                        }


                        //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
                        $totalPayPrice = $balance + $payprice;
                        if ($totalPayPrice > 0 && $peerpay <= 0) {

                            //减去消费会员的冻结金额
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");

                            //如果冻结金额小于0，重置冻结金额为0
                            $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                            $ret      = $dsql->dsqlOper($archives, "results");
                            if ($ret) {
                                if ($ret[0]['freeze'] < 0) {
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }

                            //保存操作日志 支付成功后，已经记录了消费信息，这里就不需要再做一次了 by gz 20191108
                            // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$userid', '0', '$totalPayPrice', '团购券消费：$value', '$now')");
                            // $dsql->dsqlOper($archives, "update");

                        }
//                        //分站
//                        $usersql = $dsql->SetQuery("SELECT `addr` FROM `#@__member` WHERE `id` = " . $uid);
//                        $userres = $dsql->dsqlOper($usersql, "results");
//
//                        $addr = $userres[0]['addr'];
////
//                        $cityid   = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr, 'split' => '/', 'type' => 'typename', 'action' => 'addr', 'returntype' => '1'));
                        $cityid = $userinfo['cityid'];
                        $cityName = getSiteCityName($cityid);
//                        //扣除佣金
                        global $cfg_tuanFee;
                        global $cfg_fztuanFee;
                        $cfg_tuanFee   = !empty((float)$shopFee)? (float)$shopFee :(float)$cfg_tuanFee;
                        $cfg_fztuanFee = (float)$cfg_fztuanFee;
                        $fee           = $orderprice * $cfg_tuanFee / 100;
                        $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
                        $fee           = $fee < 0.01 ? 0 : $fee;

                        $orderprice_ = sprintf('%.2f', $orderprice - $fee);
                        //获取transaction_id
                        $transaction_id = $paytype = '';
                        $sql = $dsql->SetQuery("SELECT `transaction_id`, `ordernum`,`id`,`amount`,`paytype` FROM `#@__pay_log` WHERE FIND_IN_SET('$ordernum',`body`) AND `state` = 1");
                        $ret            = $dsql->dsqlOper($sql, "results");
                        $pid            = '';
                        $truepayprice   = 0;
                        if ($ret) {
                            $transaction_id = $ret[0]['transaction_id'];
                            $paytype        = $ret[0]['paytype'];
                            $pid            = $ret[0]['id'];
                            $truepayprice   = $ret[0]['amount'];
                        }

                        //分销信息
                        global $cfg_fenxiaoState;
                        global $cfg_fenxiaoSource;
                        global $cfg_fenxiaoDeposit;
                        global $cfg_fenxiaoAmount;
                        include HUONIAOINC . "/config/tuan.inc.php";
                        $fenXiao = (int)$customfenXiao;
                        //分销金额
                        $_fenxiaoAmount = 0;
                        if($cfg_fenxiaoState && $fenXiao) {
                            //商家承担
                            if ($cfg_fenxiaoSource) {
                                $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $cardnum,$orderprice);
                                $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                                //平台承担
                            } else {
                                $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $cardnum,$fee);
                                $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                            }
                        }
                        global $paytypee;
                        $paytypee = $paytype;                   //支付方式
                        //分佣 开关
                        $fenxiaoTotalPrice = $_fenxiaoAmount;
                        $fenxiaoparamarr['amount'] = $_fenxiaoAmount;
                        $precipitateMoney = 0;  //计算沉淀金额
                        if ($fenXiao == 1) {
                            (new member())->returnFxMoney("tuan", $userid, $cardnum, $fenxiaoparamarr);
                            $_title = '团购消费券，订单号：' . $cardnum;
                            //查询一共分销了多少佣金
                            $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'tuan'");
                            $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                            //如果系统没有开启资金沉淀才需要查询实际分销了多少
                            if(!$cfg_fenxiaoDeposit){
                                $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
                            }else{
                                //沉淀的钱 = 应该分销的钱 - 实际分销的钱
                                $precipitateMoney = $_fenxiaoAmount - $fenxiaomonyeres[0]['allfenxiao'];
                            }
                        }
                        if($cfg_fenxiaoState && $fenXiao) {
                            //商家承担
                            if ($cfg_fenxiaoSource) {
                                //记录沉淀资金
                                if($precipitateMoney > 0){
                                    (new member())->recodePrecipitationMoney($uid,$ordernum,'团购券消费收入：'.$value,$precipitateMoney,$cityid,"tuan");
                                }
                                $orderprice_ = $orderprice_ -  $fenxiaoTotalPrice;   //没有分佣完的钱在加给商家
                                //平台承担
                            } else {
                                $fee  = $fee - $fenxiaoTotalPrice;                //没有分佣完的钱在加给平台
                            }
                        }

                        $fenxiosql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `fenxiaoSource` = '$cfg_fenxiaoSource' WHERE `cardnum` = '$value'");
                        $dsql->dsqlOper($fenxiosql, "update");

                        $orderprice_    = $orderprice_ < 0.01 ? 0 : $orderprice_;
                        $fzFee = cityCommission($cityid,'tuan');            //获取分站佣金比例
                        //分站提成
                        $fztotalAmount_ = $fee * (float)$fzFee / 100;

                        $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                        // $cityName = $siteCityInfo['name'];
                        // $cityid  = (int)$siteCityInfo['cityid'];

                        $fee -= $fztotalAmount_;            //平台收入减去分站收入

                        $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                        $dsql->dsqlOper($fzarchives, "update");
                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "tuan",
                            "id"       => $orderid
                        );
                        $urlParam  = serialize($paramBusi);
                        $sql       = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                        $ret       = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
                        }
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $money =  sprintf('%.2f',($usermoney + $orderprice_));
                        $title = '团购收入-' . $shopname;

                        //保存操作日志商家
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$orderprice_', '团购券消费收入：$value', '$now','tuan','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$money')");
                        $dsql->dsqlOper($archives, "update");

                        //将费用转至商家帐户
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$orderprice_' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
//                        $money =  sprintf('%.2f',($usermoney + $orderprice));
                        //保存操作日志平台
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('$uid', '1', '$orderprice', '团购券消费收入：$value', '$now','$cityid','$fztotalAmount_','tuan',$fee,'1','shangpinxiaoshou','$ordernum')");
//                        $dsql->dsqlOper($archives, "update");
                        $lastid = $dsql->dsqlOper($archives, "lastid");
                        substationAmount($lastid,$cityid);

                        //工行E商通银行分账
                        if ($transaction_id) {
                            if ($truepayprice <= 0) {
                                $truepayprice = $orderprice_;
                            }
                            rfbpShareAllocation(array(
                                "uid"               => $uid,
                                "ordertitle"        => "团购券收入",
                                "ordernum"          => $ordernum,
                                "orderdata"         => array(),
                                "totalAmount"       => $orderprice,
                                "amount"            => $truepayprice,
                                "channelPayOrderNo" => $transaction_id,
                                "paytype"           => $paytype
                            ));
                        }


                        //返积分
                        (new member())->returnPoint("tuan", $userid, $orderprice, $ordernum);

                        $infoname = getModuleTitle(array('name' => 'tuan'));    //获取模块名
                        $cityMoney = getcityMoney($cityid);   //获取分站总收益
                        $allincom = getAllincome();             //获取平台今日收益
                        //微信通知
                        $param = array(
                            'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array(
                                'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n分站获得佣金 :" . sprintf("%.2f", $fztotalAmount_),
                                'date'      => date("Y-m-d H:i:s", time()),
                                'status' => "今日总收入：$cityMoney"
                            )
                        );

                        $params = array(
                            'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array(
                                'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n平台获得佣金 :" . $fee . " \r\n分站获得佣金 :" . sprintf("%.2f", $fztotalAmount_),
                                'date'      => date("Y-m-d H:i:s", time()),
                                'status' => "今日总收入：$allincom"
                            )
                        );
                        //后台微信通知
                        updateAdminNotice("tuan", "detail", $param);
                        updateAdminNotice("tuan", "detail", $params);

                        $this->thirdPlatformPushOrder($ordernum);  //推送订单

                    }

                }

            }

        }

        if ($success > 0) {
            return "消费成功！";
        } else {
            return array("state" => 200, "info" => '消费失败，请检查您输入的团购券密码！');
        }

    }


    /**
     * 撤消团购券
     */
    public function cancelQuan()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        $ids = $this->param['ids'];

        if (empty($ids)) return array("state" => 200, "info" => '请选择要撤消的团购券密码！');

        //获取用户ID
        $uid = $userLogin->getMemberID();

        $userDetail = $userLogin->getMemberInfo();

        if($userDetail['is_staff'] == 1){
            if(!verificationStaff(array('module'=>'shop','type'=>'3')))  return array("state" => 200, "info" =>'商家权限验证失败！');  //商家权限验证失败！

            $uid = $userDetail['companyuid'];
        }
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $idArr   = explode(",", $ids);
        $success = 0;
        $now     = GetMkTime(time());

        foreach ($idArr as $key => $value) {

            $archives = $dsql->SetQuery("SELECT q.`cardnum`, o.`id`, o.`orderprice`, o.`userid`, o.`procount`, l.`price`, o.`balance`, o.`payprice`, o.`propolic`, o.`peerpay`,o.`shopFee`,o.`proprice`,o.`ordernum`,q.`orderid` FROM `#@__tuanquan` q LEFT JOIN `#@__tuan_order` o ON o.`id` = q.`orderid` LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE q.`id` = '$value' AND s.`uid` = " . $uid);
            $results  = $dsql->dsqlOper($archives, "results");
            if ($results) {

                $cardnum = $results[0]['cardnum'];

                $procount   = $results[0]['procount'];   //数量
//                $orderprice = $results[0]['orderprice'] > 0 ? $results[0]['orderprice'] : $results[0]['price']; //单价
                // $orderprice = $results[0]['proprice'] > 0 ? $results[0]['proprice'] : $results[0]['price']; //单价  如果proprice没有值，直接使用商品价格，此处用于兼容老数据
                $orderprice = $results[0]['price']; //商品单价
                $balance    = $results[0]['balance'];    //余额金额
                $payprice   = $results[0]['payprice'];   //支付金额
                $userid     = $results[0]['userid'];     //买家ID
                $peerpay    = $results[0]['peerpay'];     //代付
                $shopFee    = $results[0]['shopFee'];     //平台抽成
                $ordernum   = $results[0]['ordernum'];
                $orderid   = $results[0]['orderid'];

                $uinfo  = $userLogin->getMemberInfo();
                $umoney = $uinfo['money'];


                //扣除佣金
                global $cfg_tuanFee;
                global $cfg_fztuanFee;
                $cfg_tuanFee   = !empty((float)$shopFee) ? (float)$shopFee : (float)$cfg_tuanFee;
                $cfg_fztuanFee = (float)$cfg_fztuanFee;

                $fee         = $orderprice * $cfg_tuanFee / 100;
                $fee         = $fee < 0.01 ? 0 : $fee;
                $orderprice_ = sprintf('%.2f', $orderprice - $fee);

                //判断商家账户全额是否充足
                if($peerpay <= 0){
                    if ($umoney < $orderprice_) return array("state" => 200, "info" => '您的账户余额不足，无法撤消，请先充值！');
                }


//                $cityName = $siteCityInfo['name'];
//                $cityid   = (int)$siteCityInfo['cityid'];
                $cityid   = $userDetail['cityid'];
                $cityName = getSiteCityName($cityid);

                //分站佣金
                $fzFee = cityCommission($cityid,'tuan');
                $fztotalAmount_ = $fee * $fzFee / 100;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$fztotalAmount_' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");

                //从商家帐户减去相应金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$orderprice_' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money =  sprintf('%.2f',($usermoney - $orderprice_));
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$uid', '0', '$orderprice_', '撤消团购券：$cardnum', '$now','tuan','tuikuan','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                $paramUser = array(

                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "tuan",
                    "id"       => $orderid
                );
                $urlParam = serialize($paramUser);

                $tuikuan= array(
                    'paytype' 				=> '余额',
                    'truemoneysy'			=> 0,
                    'money_amount'  		=> $orderprice_,
                    'point'					=> 0,
                    'refrunddate'			=> 0,
                    'refrundno'				=> 0
                );
                $tuikuanparam = serialize($tuikuan);

                //查询平台分站分佣
                $fzsql = $dsql->SetQuery("SELECT `id`,`cityid`,`commission`,`platform` FROM `#@__member_money` WHERE `ordernum` LIKE '%" . $ordernum . "%' AND `ordertype` = 'tuan' AND `showtype` = 1");
                $fzres = $dsql->dsqlOper($fzsql, "results");

                if (!empty($fzres) && is_array($fzres)) {
                    $id         = $fzres[0]['id'];
                    $cityid     = $fzres[0]['cityid'];
                    $commission = $fzres[0]['commission'];
                    $platform = $fzres[0]['platform'];

                    //扣除退款的佣金
                    $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` - '$commission' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($fzarchives, "update");

                    //分站余额
                    $sql = $dsql->SetQuery("SELECT `money`  FROM `#@__site_city` WHERE  `cid` = '$cityid'");
                    $resmoney = $dsql->dsqlOper($sql, "results");
                    $submoney = $resmoney[0]['money'];          // 分站余额

//                //平台保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`tuikuantype`,`platform`,`balance`,`showtype`,`commission`,`substation`,`cityid`) VALUES ('$uid', '0', '$orderprice_', '撤消团购券：$cardnum', '$now','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','1','$platform','$usermoney','1','$commission','$submoney','$cityid')");
                    $dsql->dsqlOper($archives, "update");
                }
                //退回分销的钱
                $tuifenxiao = tuiFenXiao($ordernum,'tuan',$urlParam,$tuikuanparam);

                $infoname = getModuleTitle(array('name' => 'tuan'));    //获取模块名
                $cityMoney = getcityMoney($cityid);   //获取分站总收益
                $allincom = getAllincome();             //获取平台今日收益
                //微信通知
                $param = array(
                    'type'   => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n分站减少佣金 :" . $fztotalAmount_,
                        'date'      => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$cityMoney"
                    )
                );

                $params = array(
                    'type'   => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . "分站\r\n".$infoname."模块\r\n平台减少佣金 :" . $fee . "\r\n分站减少佣金 :" . $fztotalAmount_,
                        'date'      => date("Y-m-d H:i:s", time()),
                        'status' => "今日总收入：$allincom"
                    )
                );
                //后台微信通知
                updateAdminNotice("tuan", "detail", $param);
                updateAdminNotice("tuan", "detail", $params);

                //将团购券状态更改为未使用
                $sql = $dsql->SetQuery("UPDATE `#@__tuanquan` SET `usedate` = 0 WHERE `id` = '$value'");
                $dsql->dsqlOper($sql, "update");

                //更新订单状态
                $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 1 WHERE `id` = " . $results[0]['id']);
                $dsql->dsqlOper($sql, "update");

                //代付的不需要操作冻结金额
                if($peerpay <= 0){
                    //增加消费会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$orderprice' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['freeze'];
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$userid', '1', '$orderprice', '团购券撤消后冻结：$cardnum', '$now','tuan','tuikuan','$usermoney')");
                    $dsql->dsqlOper($archives, "update");
                }

                $this->thirdPlatformPushOrder($ordernum);  //推送订单

            }

        }

        return "操作成功！";
    }


    /**
     * 商家发货
     */
    public function delivery()
    {
        global $dsql;
        global $userLogin;

        $id      = $this->param['id'];
        $company = $this->param['company'];
        $number  = $this->param['number'];

        if (empty($id) || empty($company) || empty($number)) return array("state" => 200, "info" => '数据不完整，请检查！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`pinid`, o.`pinstate`, l.`title` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' AND s.`uid` = '$uid' AND o.`orderstate` = 1 AND l.`tuantype` = 2");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $userid   = $results[0]['userid'];
            $ordernum = $results[0]['ordernum'];
            $title    = $results[0]['title'];

            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username"    => $username,
                "order"       => $ordernum,
                "expCompany"  => $company,
                "exp_company" => $company,
                "expnumber"   => $number,
                "exp_number"  => $number,
                "fields"      => array(
                    'keyword1' => '订单编号',
                    'keyword2' => '快递公司',
                    'keyword3' => '快递单号'
                )
            );

            updateMemberNotice($userid, "会员-订单发货通知", $paramBusi, $config, '', '', 0, 1);


            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 6, `exp-company` = '$company', `exp-number` = '$number', `exp-date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
            return "操作成功！";

        } else {
            return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }

    }


    /**
     * 买家申请退款
     */
    public function refund()
    {
        global $dsql;
        global $userLogin;

        $id      = $this->param['id'];
        $type    = $this->param['type'];
        $pics    = $this->param['pics'];
        $content = $this->param['content'];

        if (empty($id)) return array("state" => 200, "info" => '数据不完整，请检查！');
        if (empty($type)) return array("state" => 200, "info" => '请选择退款原因！');
        if (empty($content)) return array("state" => 200, "info" => '请输入退款说明！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $type    = filterSensitiveWords(addslashes($type));
        $content = filterSensitiveWords(addslashes($content));
        $type    = cn_substrR($type, 20);
        $content = cn_substrR($content, 500);

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, l.`price` orderprice, o.`ordernum`, o.`procount`, o.`pinid`, o.`pintype`, o.`orderstate`,o.`paytype`,o.`balance`,o.`point`,o.`payprice`, o.`peerpay`, l.`title`, l.`pin`, l.`pinpeople`, l.`tuantype`,l.`is_tuikuan` ,s.`uid` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 1 OR o.`orderstate` = 6 OR (o.`orderstate` = 2 AND o.`paydate` != 0)) AND o.`ret-state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $title      = $results[0]['title'];      //商品名称
            $tuantype   = $results[0]['tuantype'];   //类型
            $procount   = $results[0]['procount'];   //购买数量
            $orderprice = $results[0]['orderprice']; //单价
            $ordernum   = $results[0]['ordernum'];   //订单号
            $sid        = $results[0]['uid'];        //卖家会员ID
            $pinid      = $results[0]['pinid'];      //拼团id
            $pintype    = $results[0]['pintype'];    //是否团长
            $orderstate = $results[0]['orderstate']; //订单状态
            $pinpeople  = $results[0]['pinpeople'];  //拼团人数
            $pin        = $results[0]['pin'];        //是否拼团
            $paytype    = $results[0]['paytype'];        //支付方式
            $balance    = $results[0]['balance'];        //余额支付
            $point      = $results[0]['point'];        //积分支付
            $payprice   = $results[0]['payprice'];        //余额支付
            $peerpay    = $results[0]['peerpay'];        //代付
            $is_tuikuan = $results[0]['is_tuikuan'];        //是否支持退款
            $refrunddate = GetMkTime(time());
            
            $orderamount = $totalMoney = $payprice;  //订单金额，默认等于支付金额，主要用于区分退款时订单金额和要退款的金额，场景：部分退款

            if($is_tuikuan ==1) return array("state" => 200, "info" => "暂不支持退款操作！");

            $orderIdArr = array();

            /**
             * 拼团未成功 谁都可以退
             * 拼团成功   不可以退款
             */
            if ($pinid != 0) {
                $sql = $dsql->SetQuery("SELECT `tid`, `user`, `state`, `people` FROM `#@__tuan_pin`  WHERE `id` = '$pinid'");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret[0]['state'] == 3) {
                    return array("state" => 200, "info" => "拼团成功后，不能执行操作退款！");
                } else {
                    if ($ret[0]['people'] == 1) {//只有一个
                        $sql = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET `state` = 2 WHERE `id` = " . $pinid);
                        $dsql->dsqlOper($sql, "update");
                    } else {
                        $userN     = $ret[0]['user'];
                        $userNarr  = explode(',', $userN);
                        $userNarr  = array_merge(array_diff($userNarr, array($uid)));
                        $userNarr  = array_unique($userNarr);
                        $useridPin = $userNarr[0];
                        $userNarr  = implode(',', $userNarr);
                        if ($pintype == 1) {
                            $wherePin = ", userid = '$useridPin'";
                        }
                        $sql = $dsql->SetQuery("UPDATE `#@__tuan_pin` SET `people` = people - 1, `user` = '$userNarr' $wherePin WHERE `id` = " . $pinid);
                        $dsql->dsqlOper($sql, "update");
                    }
                }
            }

            global $cfg_pointRatio;
            //如果是快递类型的则转交给商家自行处理，将订单状态设置为申请退款状态
            if ($tuantype == 2) {

                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "tuan",
                    "id"       => $id
                );

                //获取会员名
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $sid");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                //自定义配置
                $config = array(
                    "username" => $username,
                    "order"    => $ordernum,
                    "amount"   => $orderprice,
                    "info"     => $content,
                    "fields"   => array(
                        'keyword1' => '退款原因',
                        'keyword2' => '退款金额'
                    )
                );

                updateMemberNotice($sid, "会员-订单退款通知", $paramBusi, $config, '', '', 0, 1);

                $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 6, `ret-state` = 1, `ret-type` = '$type', `ret-note` = '$content', `ret-pics` = '$pics', `ret-date` = '$date' WHERE `id` = " . $id);
                $dsql->dsqlOper($sql, "update");


                //团购券的情况，直接将会员申请的退款转至会员帐户
            } elseif ($tuantype == 0) {

                //查询属于当前订单的团购券
                $totalRefund = $totaluseRefund = 0;
                $sql         = $dsql->SetQuery("SELECT * FROM `#@__tuanquan` WHERE `orderid` = " . $id);
                $res         = $dsql->dsqlOper($sql, "results");
                if ($res) {

                    foreach ($res as $key => $value) {

                        $usedate = $value['usedate'];

                        //判断是否已经使用
                        if ($usedate == 0) {
                            $totalRefund++;
                        } else {
                            $totaluseRefund++;
                        }

                    }

                }

                //拼团未成功
                if ($pinid != 0) {
                    //$sql = $dsql->SetQuery("SELECT `tid`, `user`, `state`, `people` FROM `#@__tuan_pin`  WHERE `id` = '$pinid'");
                    //$ret = $dsql->dsqlOper($sql, "results");
                    //$Pinstate = $ret[0]['state'];
                    //if($Pinstate==1){
                    $totalRefund    = $procount;
                    $totaluseRefund = 0;
                    //}
                }


                //判断是否有需要退款的团购券
                if ($totalRefund > 0) {
                    /*$totaluseRefund == 0 未使用团购券*/
                    if ($totaluseRefund != 0) {

                        $totalMoney = $totalRefund * $orderprice;
                        if ($payprice > $totalMoney) {
                            $payprice = $totalMoney;
                            $balance  = 0;
                            $point    = 0;
                        } elseif (($payprice <= $totalMoney) && $payprice != 0) {
                            $balance = $totalMoney - $payprice;
                            $point   = 0;
                        } else {
                            if ($balance > $totalMoney) {
                                $balance  = $totalMoney;
                                $payprice = 0;
                                $point    = 0;
                            } elseif (($balance <= $totalMoney) && $balance != 0) {
                                $point    = ($totalMoney - $balance) * $cfg_pointRatio;
                                $payprice = 0;
                            }
                        }
                    }
                    $refrundno = '';
                    $arr = refund('tuan',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id,$orderamount);
                    $r =$arr[0]['r'];
                    $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
                    $refrundno   = $arr[0]['refrundno'];
                    $refrundcode = $arr[0]['refrundcode'];
                    if ($r) {
                        if ($point != 0) {
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($uid);
                            $userpoint = $user['point'];
//                            $pointuser = (int)($userpoint+$point);
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`)   VALUES ('$uid', '1', '$point', '团购订单退回(积分退款:$point,现金退款：$payprice,余额退款：$balance)：$ordernum', '$refrunddate','tuihui','$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                        }

                        //退回余额
                        $pay_name = '';
                        $pay_namearr = array();
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "tuan",
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

                        if($point != ''){
                           array_push($pay_namearr,"积分");
                        }

                        if($pay_namearr){
                          $pay_name = join(',',$pay_namearr);
                        }

                        $tuikuan= array(
                            'paytype'               => $pay_name,
                            'truemoneysy'           => $payprice,
                            'money_amount'          => $balance,
                            'point'                 => $point,
                            'refrunddate'           => $refrunddate,
                            'refrundno'             => $refrundno
                        );
                        $tuikuanparam = serialize($tuikuan);

                        //会员帐户充值
                        if ($balance != 0) {
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$balance' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($uid);
                            $usermoney = $user['money'];
//                            $money  = sprintf('%.2f',($usermoney+$balance));
                            //保存操作日志
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$balance', '团购订单退回(积分退款:$point,现金退款：$payprice,余额退款：$balance)：$ordernum', '$refrunddate','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','$usermoney')");
                            $dsql->dsqlOper($archives, "update");

                        }

                        if($peerpay <= 0){
                            //减去会员的冻结金额
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalMoney' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archives, "update");

                            //如果冻结金额小于0，重置冻结金额为0
                            $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$uid'");
                            $ret      = $dsql->dsqlOper($archives, "results");
                            if ($ret) {
                                if ($ret[0]['freeze'] < 0) {
                                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$uid'");
                                    $dsql->dsqlOper($archives, "update");
                                }
                            }
                        }
                        //更新订单状态为退款成功
                        $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `ret-state` = 0, `orderstate` = 7, `ret-ok-date` = '$refrunddate', `ret-type` = '$type', `ret-note` = '$content', `ret-pics` = '$pics', `ret-date` = '$refrunddate',`refrundno` = '$refrundno' WHERE `id` = " . $id);
                        $dsql->dsqlOper($sql, "update");

                        $paramBusi = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "tuan",
                            "id"       => $id
                        );

                        //获取会员名
                        $username = "";
                        $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                        $ret      = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                        }

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "order"    => $ordernum,
                            "amount"   => $totalMoney,
                            "fields"   => array(
                                'keyword1' => '退款状态',
                                'keyword2' => '退款金额',
                                'keyword3' => '审核说明'
                            )
                        );

                        updateMemberNotice($uid, "会员-订单退款成功", $paramBusi, $config, '', '', 0, 1);

                        $this->thirdPlatformPushOrder($ordernum);  //推送订单

                        return "退款成功！";

                    } else {
                        return array("state" => 200, "info" => "退款失败，错误码：" . $refrundcode);
                    }

                }

            }

            return "操作成功！";

        } else {
            return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }
    }


    /**
     * 商家退款
     */
    public function refundPay()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (empty($id)) return array("state" => 200, "info" => '数据不完整，请检查！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`point`, o.`balance`, o.`payprice`, o.`propolic`, l.`price` orderprice, o.`procount`,o.`paytype`,o.`refrundno`, o.`userid`, o.`peerpay`, l.`title` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' AND s.`uid` = '$uid' AND o.`orderstate` = 6 AND o.`ret-state` = 1 AND l.`tuantype` = 2");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            //验证商家账户余额是否足以支付退款
            $uinfo  = $userLogin->getMemberInfo();
            $umoney = $uinfo['money'];

            $date       = GetMkTime(time());
            $title      = $results[0]['title'];      //商品名称
            $ordernum   = $results[0]['ordernum'];   //需要退回的订单号
            $orderprice = $results[0]['orderprice']; //订单商品单价
            $procount   = $results[0]['procount'];   //订单商品数量
            $paytype    = $results[0]['paytype'];   //支付方式
            $refrundno  = $results[0]['refrundno'];   //退款订单号
            $peerpay  = $results[0]['peerpay'];   //代付
            $totalMoney = $orderprice * $procount;   //需要扣除商家的费用


            //因为买家没有确认收货，所以费用是还没有转到卖家账户，这里就不涉及从卖家账户扣费的流程 by:gz 20160422

            //判断商家账户全额是否充足
            //if($umoney < $totalMoney) return array("state" => 200, "info" => '您的账户余额不足，无法退款，请先充值！');

            //从商家帐户减去相应金额
            //$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$totalMoney' WHERE `id` = '$uid'");
            //$dsql->dsqlOper($archives, "update");

            //保存操作日志
            //$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`) VALUES ('$uid', '0', '$totalMoney', '订单退款：$ordernum', '$date')");
            //$dsql->dsqlOper($archives, "update");


            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `ret-state` = 0, `orderstate` = 7, `ret-ok-date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");


            //退回会员积分、余额
            $userid   = $results[0]['userid'];   //需要退回的会员ID
            $point    = $results[0]['point'];    //需要退回的积分
            $balance  = $results[0]['balance'];  //需要退回的余额
            $payprice = $results[0]['payprice']; //需要退回的支付金额
            $propolic = $results[0]['propolic']; //运费

            //计算运费 by: guozi 20160425
            $propolicMoney = 0;
            $policy        = unserialize($propolic);
            if (!empty($propolic) && !empty($policy)) {
                $freight = $policy['freight'];
                $freeshi = $policy['freeshi'];

                if ($procount <= $freeshi) {
                    $propolicMoney = $freight;
                }
            }
            $ordermoney    = $balance + $payprice + $propolicMoney;
            $online_amount = $refrund_online = $ordermoney;
            //退回积分
            $refrunddate = GetMkTime(time());
            //退回积分 by: guozi 20160425

            $refrundno = '';
            $arr = refund('tuan',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
            $refrundno   = $arr[0]['refrundno'];
            $refrundcode = $arr[0]['refrundcode'];


            if ($r) {
                if ($point != 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$point);
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '团购订单退回(积分退款:$point,现金退款：$payprice,余额退款：$balance)：$ordernum', '$date','tuihui','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }

                //退回余额
                $pay_name = '';
                $pay_namearr = array();
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "tuan",
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

                if($point != ''){
                   array_push($pay_namearr,"积分");
                }

                if($pay_namearr){
                  $pay_name = join(',',$pay_namearr);
                }

                $tuikuan= array(
                    'paytype'               => $pay_name,
                    'truemoneysy'           => $payprice,
                    'money_amount'          => $balance,
                    'point'                 => $point,
                    'refrunddate'           => $refrunddate,
                    'refrundno'             => $refrundno
                );
                $tuikuanparam = serialize($tuikuan);

                //会员帐户充值
                if ($balance != 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$balance' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
//                    $money =  sprintf('%.2f',($usermoney + $balance));
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$userid', '1', '$balance', '团购订单退回(积分退款:$point,现金退款：$payprice,余额退款：$balance)：$ordernum', '$date','tuan','tuikuan','$urlParam','$ordernum','$tuikuanparam','团购消费','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

                }
                //更新订单状态
                $orderOpera = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = 7, `ret-state` = 0, `ret-type` = '其他', `ret-note` = '管理员提交', `ret-ok-date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$ordermoney',`refrundamount` = '$orderprice', `refrundno` = '$refrundno' WHERE `id` = " . $id);
                $dsql->dsqlOper($orderOpera, "update");

                if($peerpay <= 0){
                    //减去会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$ordermoney' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");

                    //如果冻结金额小于0，重置冻结金额为0
                    $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                    $ret      = $dsql->dsqlOper($archives, "results");
                    if ($ret) {
                        if ($ret[0]['freeze'] < 0) {
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }
                }

                $paramBusi = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "tuan",
                    "id"       => $id
                );

                //获取会员名
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                //自定义配置
                $config = array(
                    "username" => $username,
                    "order"    => $ordernum,
                    "amount"   => $ordermoney,
                    "fields"   => array(
                        'keyword1' => '退款状态',
                        'keyword2' => '退款金额',
                        'keyword3' => '审核说明'
                    )
                );

                updateMemberNotice($userid, "会员-订单退款成功", $paramBusi, $config, '', '', 0, 1);

                $this->thirdPlatformPushOrder($ordernum);  //推送订单

                return "退款成功！";
            } else {
                return array("state" => 200, "info" => "退款失败，错误码：" . $refrundcode);
            }

        } else {
            return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }

    }


    /**
     * 商家退款回复
     */
    public function refundReply()
    {
        global $dsql;
        global $userLogin;

        $id      = $this->param['id'];
        $pics    = $this->param['pics'];
        $content = $this->param['content'];

        if (empty($id)) return array("state" => 200, "info" => '数据不完整，请检查！');
        if (empty($content)) return array("state" => 200, "info" => '请输入回复内容！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $content = filterSensitiveWords(addslashes($content));
        $content = cn_substrR($content, 500);

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`balance`, o.`payprice`, l.`title` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' AND s.`uid` = '$uid' AND o.`orderstate` = 6 AND o.`ret-state` = 1 AND l.`tuantype` = 2");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $title      = $results[0]['title'];
            $userid     = $results[0]['userid'];
            $ordernum   = $results[0]['ordernum'];
            $orderprice = $results[0]['balance'] + $results[0]['payprice'];
            $paramBusi  = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "order"    => $ordernum,
                "amount"   => $orderprice,
                "info"     => $content,
                "fields"   => array(
                    'keyword1' => '退款状态',
                    'keyword2' => '退款金额',
                    'keyword3' => '审核说明'
                )
            );

            updateMemberNotice($userid, "会员-退款申请卖家回复", $paramBusi, $config, '', '', 0, 1);


            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `ret-s-note` = '$content', `ret-s-pics` = '$pics', `ret-s-date` = '$now' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");

            return "回复成功！";

        } else {
            return array("state" => 200, "info" => '回复失败，请核实订单状态后再操作！');
        }
    }


    /**
     * 买家确认收货
     */
    public function receipt()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $id = $this->param['id'];

        if (empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');

        //获取用户ID
        $uidd = $userLogin->getMemberID();


        if ($uidd == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`procount`, l.`price` orderprice, o.`balance`, o.`payprice`, o.`propolic`, o.`userid`, o.`peerpay`,o.`shopFee`, l.`title`, l.`fx_reward`, s.`uid` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON o.`proid` = l.`id` LEFT JOIN `#@__tuan_store` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' AND o.`userid` = '$uidd' AND o.`orderstate` = 6 AND l.`tuantype` = 2");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $totalAmount = 0;
            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__tuan_order` SET `orderstate` = '3' WHERE `id` = " . $id);
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
            $propolic   = $results[0]['propolic'];   //邮费
            $peerpay    = $results[0]['peerpay'];   //代付
            $shopFee    = $results[0]['shopFee'];   //平台抽成
            $fx_reward    = $results[0]['fx_reward'];   //商品是否设置独立分销佣金
            $policy     = unserialize($propolic);

            //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
            $totalPayPrice = $balance + $payprice;
            if ($totalPayPrice > 0) {

                if($peerpay <= 0){
                    //减去消费会员的冻结金额
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$totalPayPrice' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");

                    //如果冻结金额小于0，重置冻结金额为0
                    $archives = $dsql->SetQuery("SELECT `freeze` FROM `#@__member` WHERE `id` = '$userid'");
                    $ret      = $dsql->dsqlOper($archives, "results");
                    if ($ret) {
                        if ($ret[0]['freeze'] < 0) {
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = 0 WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }
                }

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $pid = '';
                if ($ret) {
                    $pid = $ret[0]['id'];
                }
                $paramUser = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail",
                    "action"   => "tuan",
                    "id"       => $id
                );
                $urlParam  = serialize($paramUser);
                $sql       = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret       = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
                }
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $money =  sprintf('%.2f',($usermoney - $totalPayPrice));
                $title_ = '团购消费-' . $shopname;
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPayPrice', '团购消费：$ordernum', '$date','tuan','xiaofei','$pid','$urlParam','$title_','$ordernum','$money')");
                $dsql->dsqlOper($archives, "update");

            }


            //商家结算
            $totalAmount  += $orderprice * $procount;
            $freightMoney = 0;

            if (!empty($propolic) && !empty($policy)) {
                $freight = $policy['freight'];
                $freeshi = $policy['freeshi'];

                //如果达不到免物流费的数量，则总价再加上运费
                if ($procount <= $freeshi) {
                    $totalAmount  += $freight;
                    $freightMoney = $freight;
                }
            }

            //扣除佣金
            global $cfg_tuanFee;
            global $cfg_fztuanFee;
            $cfg_tuanFee   = !empty((float)$shopFee) ? (float)$shopFee : (float)$cfg_tuanFee;
            $cfg_fztuanFee = (float)$cfg_fztuanFee;

            $fee = $totalAmount * $cfg_tuanFee / 100;
            $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
            $fee = $fee < 0.01 ? 0 : $fee;

            $totalAmount_ = sprintf('%.2f', $totalAmount - $fee);

            //获取transaction_id
            $transaction_id = $paytype = '';
            $sql            = $dsql->SetQuery("SELECT `transaction_id`, `paytype`,`amount`, `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
            $ret            = $dsql->dsqlOper($sql, "results");
            $truepayprice   = 0;
            if ($ret) {
                $transaction_id = $ret[0]['transaction_id'];
                $paytype        = $ret[0]['paytype'];
                $truepayprice   = $ret[0]['amount'];
                $pid   = $ret[0]['id'];
            }

            //分销信息
            global $cfg_fenxiaoState;
            global $cfg_fenxiaoSource;
            global $cfg_fenxiaoDeposit;
            global $cfg_fenxiaoAmount;
            include HUONIAOINC . "/config/tuan.inc.php";
            $fenXiao = (int)$customfenXiao;

            $_fenxiaoAmount = 0;
            if($cfg_fenxiaoState && $fenXiao){
                //商家承担
                if ($cfg_fenxiaoSource) {
                    $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $ordernum,$totalAmount);
                    $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                    //平台承担
                } else {
                    $fenxiaoparamarr = fenXiaoMoneyCalculationTwo('tuan', $ordernum,$fee);
                    $_fenxiaoAmount = $fenxiaoparamarr['totalAmount'];
                }
            }


            //分佣 开关
            $fenxiaoTotalPrice = $_fenxiaoAmount;
            $fenxiaoparamarr['amount'] = $_fenxiaoAmount;
            $precipitateMoney = 0;  //计算沉淀金额
            if($fenXiao ==1){
                (new member())->returnFxMoney("tuan", $userid, $ordernum, $fenxiaoparamarr);
                $_title = '团购消费券，订单号：' . $ordernum;
                //查询一共分销了多少佣金
                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_title' AND `module`= 'tuan'");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                //如果系统没有开启资金沉淀才需要查询实际分销了多少
                if(!$cfg_fenxiaoDeposit){
                    $fenxiaoTotalPrice     = $fenxiaomonyeres[0]['allfenxiao'];
                }else{
                    //沉淀的钱 = 应该分销的钱 - 实际分销的钱
                    $precipitateMoney = $_fenxiaoAmount - $fenxiaomonyeres[0]['allfenxiao'];
                }
            }

//            $cityName = $siteCityInfo['name'];
//            $cityid   = (int)$siteCityInfo['cityid'];
            $userinfo = $userLogin->getMemberInfo($uid);

            $cityid = $userinfo['cityid'];
            $cityName = getSiteCityName($cityid);
            if($cfg_fenxiaoState && $fenXiao) {
                //商家承担
                if ($cfg_fenxiaoSource) {
                    //记录沉淀资金
                    if($precipitateMoney > 0){
                        (new member())->recodePrecipitationMoney($uid,$ordernum,'团购收入：'.$ordernum,$precipitateMoney,$cityid,"tuan");
                    }
                    $totalAmount_ = $totalAmount_ -  $fenxiaoTotalPrice;   //没有分佣完的钱在加给商家
                    //平台承担
                } else {
                    $fee  = $fee - $fenxiaoTotalPrice;                //没有分佣完的钱在加给平台
                }
            }

            $totalAmount_   = $totalAmount_ < 0.01 ? 0 : $totalAmount_;
            //分站佣金
            $fzFee = cityCommission($cityid,'tuan');
            //分站
            $fztotalAmount_ = $fee * $fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
            $fee -= $fztotalAmount_;            //平台收入减去分站收入

            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalAmount_' WHERE `id` = '$uid'");
            $dsql->dsqlOper($archives, "update");
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money =  sprintf('%.2f',($usermoney + $totalAmount_));
            //保存操作日志

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $id
            );
            $urlParam  = serialize($paramBusi);

            $title    = '团购收入-' . $ordernum;
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$totalAmount_', '团购收入，订单号：$ordernum', '$date','tuan','shangpinxiaoshou','$pid','$urlParam','$title','$ordernum','$usermoney')");
            $dsql->dsqlOper($archives, "update");

            //分站收入明细
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`showtype`,`ctype`,`balance`,`platform`) VALUES ('$uid', '1', '$totalAmount_', '团购收入，订单号：$ordernum', '$date','$cityid','$fztotalAmount_','tuan','1','shangpinxiaoshou','$usermoney','$fee')");
//            $dsql->dsqlOper($archives, "update");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);

            //工行E商通银行分账
            if ($transaction_id) {
                if ($truepayprice <= 0) {
                    $truepayprice = $totalAmount_;
                }
                rfbpShareAllocation(array(
                    "uid"               => $uid,
                    "ordertitle"        => "团购收入",
                    "ordernum"          => $ordernum,
                    "orderdata"         => array(),
                    "totalAmount"       => $totalAmount,
                    "amount"            => $truepayprice,
                    "channelPayOrderNo" => $transaction_id,
                    "paytype"           => $paytype
                ));
            }

            //返积分
            (new member())->returnPoint("tuan", $userid, $totalPayPrice, $ordernum);


            //商家会员消息通知
            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "tuan",
                "id"       => $id
            );

            //获取会员名
            $username = "";
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }

            //自定义配置
            $config = array(
                "username" => $username,
                "title"    => $title,
                "amount"   => $totalPayPrice,
                "fields"   => array(
                    'keyword1' => '商品信息',
                    'keyword2' => '下单时间',
                    'keyword3' => '订单金额',
                    'keyword4' => '订单状态'
                )
            );

            updateMemberNotice($uid, "会员-商品成交通知", $paramBusi, $config, '', '', 0, 1);

            return "操作成功！";

        } else {
            return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }
    }

    /**
     * 团购提醒与取消提醒
     */
    public function remind()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $archives = $dsql->SetQuery("SELECT `id`, `tid`, `uid`, `puctime` FROM `#@__tuan_remind`  WHERE `state` = '0' and `tid` = '$id' and `uid` = '$uid'");
        $results  = $dsql->dsqlOper($archives, "results");
        if (!empty($results[0]['id'])) {
            $sql = $dsql->SetQuery("DELETE FROM `#@__tuan_remind` WHERE `id` = " . $results[0]['id']);
            $res = $dsql->dsqlOper($sql, "update");
            if ($res == 'ok') {
                return 1;
            } else {
                return array("state" => 200, "info" => '操作失败，参数传递错误！');
            }
        } else {
            $puctime  = time();
            $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_remind` (`tid`, `uid`, `puctime`) VALUES ('$id', '$uid', '$puctime')");
            $aid      = $dsql->dsqlOper($archives, "lastid");
            if (is_numeric($aid)) {
                return 2;
            } else {
                return array("state" => 200, "info" => '操作失败，参数传递错误！');
            }
        }
    }

    /**
     * 获取当前系统的五个时间段
     */
    public function systemTime()
    {
        $time    = $this->param['time'];
        $num     = $this->param['num'];
        $num     = !empty($num) ? $num : 5;
        $list    = array();
        $nowTime = GetMkTime(time());

        if (!empty($time)) {
            $now = $oldNowH = $nowH = $time;
        } else {
            $now = $oldNowH = $nowH = (int)date("H");
        }

        //$oldNowH = $nowH = 9;
        for ($i = 0; $i < 5; $i++) {
            if ($oldNowH == 21 || $oldNowH == 22 || $oldNowH == 23 || $oldNowH == 24) {
                if ($nowH > 24) {
                    $nowH = 1;
                }
            }
            if ($nowH > 9) {
                $zero = '';
            } else {
                $zero = '0';
            }
            $list[$i]['showTime'] = $zero . $nowH . ":00";
            $list[$i]['nowTime']  = $nowH;
            $nowH                 += 1;
            $d                    = date("Y-m-d") . ' ' . $nowH . ":00:00";
            $list[$i]['nextHour'] = GetMkTime($d);
        }
        return array(
            "now"     => $now,
            "nowTime" => $nowTime,
            "list"    => $list
        );
        //return $list;
        //print_R($list);exit;
    }

    /**
     * 用户领取代金券
     */
    public function getVoucher()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_voucher`  WHERE `state` = '0' and `tid` = '$id' and `uid` = '$uid'");
        $results  = $dsql->dsqlOper($archives, "results");
        if (!empty($results)) {
            return array("state" => 200, "info" => '您已经领取！');
        } else {
            $puctime  = time();
            $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_voucher` (`tid`, `uid`, `puctime`, `state`) VALUES ('$id', '$uid', '$puctime', '0')");
            $aid      = $dsql->dsqlOper($archives, "lastid");
            if (is_numeric($aid)) {
                return 'ok';
            } else {
                return array("state" => 200, "info" => '操作失败，参数传递错误！');
            }
        }
    }

    /**
     * 拼单列表
     */
    public function pinList()
    {
        global $dsql;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $tid      = $this->param['tid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (!empty($tid)) {
            $where = " AND p.`tid` = '$tid'";
        }

        $orderby = " ORDER BY p.`pubdate` DESC, p.`id` DESC";

        $time = time();

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $sql = $dsql->SetQuery("SELECT p.`id`,p.`people`,p.`userid`,l.`pinpeople`,p.`enddate` FROM `#@__tuan_pin` p LEFT JOIN `#@__tuanlist` l ON l.`id` = p.`tid` LEFT JOIN `#@__tuan_order` o ON o.`ordernum` = p.`oid` WHERE o.`id` != '' AND l.`enddate`>'$time' and p.`state`=1 and p.`enddate`>'$time'" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($sql, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        if ($totalCount == 0) return array("state" => 100, "pageInfo" => $pageinfo, "list" => array());

        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($sql . $orderby . $where, "results");
        if ($results) {
            $list = array();
            foreach ($results as $key => $val) {
                $list[$key]['id']      = $val['id'];
                $list[$key]['userid']  = $val['userid'];
                $list[$key]['now']     = time();
                $list[$key]['enddate'] = $val['enddate'];
                $list[$key]['rest']    = $val['pinpeople'] - $val['people'];

                $memberList          = getMemberDetail($val['userid']);
                $list[$key]['name']  = !empty($memberList['nickname']) ? cn_substrR($memberList['nickname'], 8) : cn_substrR($memberList['username'], 8);
                $list[$key]['photo'] = $memberList['photo'];

                $hour               = floor(($val['enddate'] - time()) % 86400 / 3600);
                $minute             = floor(($val['enddate'] - time()) % 3600 / 60);
                $second             = floor(($val['enddate'] - time()) % 60);
                $list[$key]['time'] = $hour . ":" . $minute . ":" . $second;

                $param             = array(
                    "service"  => "tuan",
                    "template" => "dindan",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 商家评论列表
     * @return array
     */
    public function commonStore()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $id       = $storeid = $filter = $orderby = $page = $pageSize = $where = $px = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $id       = $this->param['id'];
            $storeid  = $this->param['storeid'];
            $filter   = $this->param['filter'];
            $orderby  = $this->param['orderby'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }

        if (empty($id)) return array("state" => 200, "info" => '格式错误！');

        if (!empty($id)) {
            $where .= " AND `aid` = '$id'";
        }

        //筛选
        if (!empty($filter)) {
            if ($filter == "pic") {
                $where .= " AND `pics` <> ''";
            } elseif ($filter == "lower") {
                $where .= " AND `rating` < 3";
            }
        }

        //排序
        $px = " ORDER BY `rating` DESC, `floor` ASC, `id` DESC";
        if (!empty($orderby)) {
            if ($orderby == "time") {
                $px = " ORDER BY `floor` ASC, `id` DESC";
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives = $dsql->SetQuery("SELECT `rating`, `userid`, `pics`, `content`, `dtime` FROM `#@__tuan_storecommon`  WHERE `ischeck` = 1" . $where . $px);
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
        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['rating'] = $val['rating'];

                $imgArr = array();
                $pics   = $val['pics'];
                if (!empty($pics)) {
                    $picArr = explode(",", $pics);
                    foreach ($picArr as $k => $v) {
                        $imgArr[$k] = getFilePath($v);
                    }
                }
                $list[$key]['pics'] = $imgArr;

                $list[$key]['content'] = $val['content'];
                $list[$key]['dtime']   = $val['dtime'];

                $userinfo = $userLogin->getMemberInfo($val['userid']);
                if ($userinfo && is_array($userinfo)) {
                    $list[$key]['user']['id']       = $val['userid'];
                    $list[$key]['user']['photo']    = $userinfo['photo'];
                    $list[$key]['user']['nickname'] = $userinfo['nickname'];
                } else {
                    $list[$key]['user']['id']       = "";
                    $list[$key]['user']['photo']    = "";
                    $list[$key]['user']['nickname'] = "游客";
                }

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 商家发表评论
     * @return array
     */
    public function sendStoreCommon()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => '登录超时，请刷新页面重试！');

        $id      = $param['id'];   //订单ID
        $rating  = $param['rating'];
        $score1  = $param['score1'];
        $score2  = $param['score2'];
        $score3  = $param['score3'];
        $pics    = $param['pics'];
        $content = filterSensitiveWords(addslashes($param['content']));
        $ip      = GetIP();
        $ipaddr  = getIpAddr($ip);
        $date    = GetMkTime(time());

        if (empty($id)) return array("state" => 200, "info" => '要评价的商品ID传递失败，请从正确的地址发表评价');
        if (empty($rating) || empty($score1) || empty($score2) || empty($score3)) return array("state" => 200, "info" => '请先打分！');
        // if(empty($content) || strlen($content) < 15) return array("state" => 200, "info" => '请输入评价内容，最少15个字！');

        //查询订单信息
        $sql = $dsql->SetQuery("SELECT `id`,`uid` FROM `#@__tuan_store` WHERE `id` = '$id'");
        $res = $dsql->dsqlOper($sql, "results");
        if (empty($res)) {
            return array("state" => 200, "info" => '商家不存在，评价失败！');
        } else {
            if ($res[0]['uid'] == $userid) return array("state" => 200, "info" => '自家店铺不能评论！');
        }

        //查询评价信息
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_storecommon` WHERE `aid` = '$id'");
        $res = $dsql->dsqlOper($sql, "totalCount");

        //修改评价
        if ($res > 0) {
            $archives = $dsql->SetQuery("UPDATE `#@__tuan_storecommon` SET `rating` = '$rating', `score1` = '$score1', `score2` = '$score2', `score3` = '$score3', `pics` = '$pics', `content` = '$content', `dtime` = '$date', `ip` = '$ip', `ipaddr` = '$ipaddr', `ischeck` = 0 WHERE `aid` = '$id'");
            //新增评价
        } else {
            $archives = $dsql->SetQuery("INSERT INTO `#@__tuan_storecommon` (`aid`, `floor`, `userid`, `rating`, `score1`, `score2`, `score3`, `pics`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`) VALUES ('$id', '0', '$userid', '$rating', '$score1', '$score2', '$score3', '$pics', '$content', '$date', '$ip', '$ipaddr', 0, 0, 0)");
        }
        $results = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "评论成功！";
        } else {
            return array("state" => 200, "info" => '评论失败！');
        }

    }

    public function getComment()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        $pageinfo = array();

        $userid = $userLogin->getMemberID();

        $param    = $this->param;
        $type     = $param['type'];
        $aid      = (int)$param['aid'];
        $page     = (int)$param['page'];
        $isAjax   = (int)$param['isAjax'];
        $pageSize = (int)$param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = " AND c.`type` = 'tuan-order' AND l.`sid` = '" . $aid . "' AND c.`pid` = 0";

        if (!$isAjax) {

            $archives = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 " . $where);
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => $langData['siteConfig'][21][64]);  //暂无数据！

            $pageinfo = array(
                "page"       => $page,
                "pageSize"   => $pageSize,
                "totalPage"  => $totalPage,
                "totalCount" => $totalCount
            );

            // 好中差评
            $sql   = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND `sco1` = 1" . $where);
            $sco1_ = $dsql->dsqlOper($sql, "totalCount");
            $sql   = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND `sco1` = 2" . $where);
            $sco2_ = $dsql->dsqlOper($sql, "totalCount");
            $sql   = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND `sco1` = 3" . $where);
            $sco3_ = $dsql->dsqlOper($sql, "totalCount");
            $sql   = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND `sco1` = 4" . $where);
            $sco4_ = $dsql->dsqlOper($sql, "totalCount");
            $sql   = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND `sco1` = 5" . $where);
            $sco5_ = $dsql->dsqlOper($sql, "totalCount");

            $pageinfo['sco1'] = $sco1_;
            $pageinfo['sco2'] = $sco2_;
            $pageinfo['sco3'] = $sco3_;
            $pageinfo['sco4'] = $sco4_;
            $pageinfo['sco5'] = $sco5_;

            // 带图片的
            $sql = $dsql->SetQuery("SELECT c.`id` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 AND c.`pics` != ''" . $where);
            $res = $dsql->dsqlOper($sql, "totalCount");

            $pageinfo['pic'] = $res;
        }

        $atpage      = $pageSize * ($page - 1);
        $where_limit = " ORDER BY `id` DESC LIMIT $atpage, $pageSize";
        $archives    = $dsql->SetQuery("SELECT c.`id`, c.`pid`, c.`sid`, c.`type`, c.`ipaddr`, c.`aid`, c.`oid`, c.`userid`, c.`rating`, c.`sco1`, c.`content`, c.`pics`, c.`audio`, c.`video`, c.`dtime`, c.`ip`, c.`zan`, c.`zan_user`, c.`isanony`, c.`specation`, c.`peisongid`, c.`star`, c.`starps`, c.`contentps`, c.`reply`, c.`replydate`, c.`time` FROM `#@__public_comment_all` c LEFT JOIN `#@__tuanlist` l ON c.`aid` = l.`id` WHERE  c.`ischeck` = 1 " . $where . $where_limit);
        $results     = $dsql->dsqlOper($archives, "results");

        $list = array();

        if (is_array($results) && !empty($results)) {
            $sco1Txt = $langData['siteConfig'][34][9];//array(0 => "", 1 => "失望", 2 => "一般", 3 => "还行", 4 => "满意", 5 => "超赞")
            foreach ($results as $key => $value) {

                $list[$key]['id']        = $value['id'];
                $list[$key]['sid']       = $value['sid'];
                $list[$key]['pid']       = $value['pid'];
                $list[$key]['type']      = $value['type'];
                $list[$key]['oid']       = $value['oid'];
                $list[$key]['ipaddr']    = $value['ipaddr'];
                $list[$key]['specation'] = str_replace("$$$", "，", $value['specation']);
                $list[$key]['isanony']   = $value['isanony'];
                $list[$key]['ftime']     = floor((GetMkTime(time()) - $value['dtime'] / 86400) % 30) > 30 ? date("Y-m-d", $value['dtime']) : FloorTime(GetMkTime(time()) - $value['dtime']);

                $list[$key]['peisongid']  = $value['peisongid'];
                $list[$key]['star']       = $value['star'];
                $list[$key]['starps']     = $value['starps'];
                $list[$key]['contentps']  = $value['contentps'];
                $list[$key]['reply']      = $value['reply'];
                $list[$key]['time']       = $value['time'];
                $list[$key]['replydate']  = $value['replydate'];
                $list[$key]['replydatef'] = $value['replydate'] ? date("Y-m-d H:i:s", $value['replydate']) : "";

                $is_self               = $userid == $value['userid'] ? 1 : 0;
                $list[$key]['is_self'] = $is_self;

                if (!$value['isanony']) {
                    $user = (new member())->detail($value['userid']);
                } else {
                    $user = array(
                        "nickname" => $langData['siteConfig'][34][10], //匿名用户
                        "photo"    => ""
                    );
                }
                $list[$key]['user'] = $user;

                $list[$key]['rating']  = $value['rating'];
                $list[$key]['sco1']    = $value['sco1'];
                $list[$key]['sco1Txt'] = $sco1Txt[$value['sco1']];
                $list[$key]['content'] = $value['content'];

                $list[$key]['dtime'] = $value['dtime'];

                if ($value['pid'] == 0) {
                    /* $param = array(
                        "service" => "business",
                        "type" => "comdetail",
                        "id" => $value['id']
                    );
                    $list[$key]['url'] = getUrlPath($param); */

                }

                $act = $value['type'];
                if ($act != 'paotui-order') {
                    $actArr  = explode('-', $act);
                    $module  = $actArr[0];
                    $action  = $actArr[1];
                    $action_ = $actArr[1];

                    //处理商家、二手商家、团购商品详情
                    if ($module == "business" || ($module == "info" && $action == "business") || ($module == "waimai" && $action == "order")) {
                        $action = "storeDetail";
                    } elseif (($module == "tuan" && $action == "order") || ($module == "shop" && $action == "order")) {
                        $action = "detail";
                    } elseif ($module == "circle") {
                        $action = "blogdetail";
                    }

                    $param = array(
                        "service"  => $module,
                        "template" => $action == "blogdetail" ? "blog_detail" : $action,
                        "id"       => $value['aid']
                    );

                    $handels = new handlers($module, $action);
                    $detail  = $handels->getHandle($value['aid']);
                    if (is_array($detail) && $detail['state'] == 100) {
                        $detail = $detail['info'];
                        if (is_array($detail)) {
                            $list[$key]['detail'] = $detail;

                            if ($module == "circle") {
                                $list[$key]['detail']['pics'] = $detail['picadr'];
                            }

                            if ($module == "waimai" && $action == "order") {
                                $list[$key]['detail']['title'] = $detail['shopname'];
                            }

                            if ($module == "info" && $action_ == "business") {
                                $param = array(
                                    "service"  => $module,
                                    "template" => "business",
                                    "id"       => $detail['id'],
                                );
                            }

                            if (!$detail['url']) {
                                $list[$key]['detail']['url'] = getUrlPath($param);
                            }
                        }
                    } else {
                        $handels = new handlers($module, $action . "Detail");
                        $detail  = $handels->getHandle($value['aid']);

                        if (is_array($detail) && $detail['state'] == 100) {
                            $detail = $detail['info'];
                            if (is_array($detail)) {
                                $list[$key]['detail'] = $detail;

                                if ($module == "travel" || ($module == "marry" && $action_ == "store") || ($module == "marry" && $action_ == "rental")) {
                                    $param = array(
                                        "service"  => $module,
                                        "template" => $action_ . '-' . 'detail',
                                        "id"       => $detail['id'],
                                    );
                                }

                                if (!$detail['url']) {
                                    $list[$key]['detail']['url'] = getUrlPath($param);
                                }
                            }
                        }
                    }
                } else {
                    $sql  = $dsql->SetQuery("SELECT o.`id`, o.`shop` shopname, o.`ordernum` ordernumstore FROM (`#@__public_comment_all` c LEFT JOIN `#@__paotui_order` o ON c.`oid` = o.`id`) WHERE c.`oid` = " . $value['oid']);
                    $shop = $dsql->dsqlOper($sql, "results");
                    if ($shop) {
                        $list[$key]['detail']['id']    = $shop[0]['id'];
                        $list[$key]['detail']['title'] = $shop[0]['shopname'];
                    }

                }

                $pics    = $value['pics'];
                $picsArr = array();
                if ($pics) {
                    $pics_ = explode(',', $pics);
                    foreach ($pics_ as $k => $v) {
                        $picsArr[] = getFilePath($v);
                    }
                }
                $list[$key]['pics'] = $picsArr;

                $list[$key]['audio'] = $value['audio'] ? getFilePath($value['audio']) : "";
                $list[$key]['video'] = $value['video'] ? getFilePath($value['video']) : "";
                $list[$key]['ip']    = $value['ip'];
                $list[$key]['zan']   = $value['zan'];

                $zan_has = 0;
                if ($userid != -1 && $value['zan_user']) {
                    $zan_user = explode(',', $value['zan_user']);
                    if (in_array($userid, $zan_user)) {
                        $zan_has = 1;
                    }
                }
                $list[$key]['zan_has'] = $zan_has;

                if ($userid != -1) {
                    $isfollow = 0;
                    $sql      = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `fid` = " . $value['userid']);
                    $ret      = $dsql->dsqlOper($sql, "results");
                    if ($ret && is_array($ret)) {
                        $isfollow = 1;
                    }
                    $list[$key]['isfollow'] = $isfollow;
                }

            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    //第三方平台推送订单
    public function thirdPlatformPushOrder($ordernum){
        global $dsql;
        $ordernumArr = explode(",", $ordernum);
        if($ordernumArr){
            foreach($ordernumArr as $key => $val){

                $sql = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`proid`, o.`orderprice`, o.`orderstate`, o.`orderdate`, o.`paytype`, l.`title`, l.`subtitle`, l.`litpic`, l.`price` FROM `#@__tuan_order` o LEFT JOIN `#@__tuanlist` l ON l.`id` = o.`proid` WHERE o.`ordernum` = '$val'");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $data = $ret[0];

                    //推送到抖音
                    if($data['paytype'] == 'bytemini'){
                        $this->pushOrderToDouyin($data);
                    }

                }

            }
        }
    }

    //推送订单到抖音
    public function pushOrderToDouyin($order){

        //订单状态  待支付/已支付/已取消/已超时/已核销/退款中/已退款/退款失败
        $status = '待支付';
        switch ($order['orderstate']){
            case 0:
                $status = '待支付';
                break;
            case 1:
                $status = '已支付';
                break;
            case 2:
                $status = '已支付';
                break;
            case 3:
                $status = '已核销';
                break;
            case 4:
                $status = '退款中';
                break;
            case 6:
                $status = '已支付';
                break;
            case 7:
                $status = '已退款';
                break;
            default:
                $status = '待支付';
        }

        $order_detail = array(
            'order_id' => $order['ordernum'],
            'create_time' => (int)($order['orderdate'].'000'),
            'status' => $status,
            'amount' => 1,
            'total_price' => (int)($order['orderprice']*100),
            'detail_url' => '/pages/redirect/index?url=' . urlencode(getUrlPath(array('service' => 'member', 'type' => 'user', 'template' => 'orderdetail-tuan', 'id' => $order['id']))),
            'item_list' => array(
                array(
                    'item_code' => (string)$order['proid'],
                    'img' => getFilePath($order['litpic']),
                    'title' => $order['title'],
                    'sub_title' => $order['subtitle'],
                    'price' => (int)($order['price']*100)
                )
            )
        );

        //订单状态  10：已取消（抖音订单中心可看到，状态为"已取消"）  110：待支付  210：待确认  340：预订成功  410：退款中  420：退款成功  430：退款失败  
        $order_status = 0;
        switch ($order['orderstate']){
            case 0:
                $status = 110;
                break;
            case 1:
                $status = 210;
                break;
            case 2:
                $status = 210;
                break;
            case 3:
                $status = 340;
                break;
            case 4:
                $status = 410;
                break;
            case 6:
                $status = 210;
                break;
            case 7:
                $status = 420;
                break;
            default:
                $status = 110;
        }


        pushOrderToDouyin($order['userid'], $order_detail, $order_status);

    }


}
