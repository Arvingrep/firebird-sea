<?php

// 拍卖所有接口，通过ajax的php路由到此

class paimai
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
     * 拍卖分类
     * @return array
     */
    public function type(){
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
        $results = $dsql->getTypeList($type, "paimaitype", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }

    /**
     * 商品拍卖模块基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/paimai.inc.php");

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
            $custom_softSize = $cfg_softSize;
            $custom_softType = $cfg_softType;
            $custom_thumbSize = $cfg_thumbSize;
            $custom_thumbType = $cfg_thumbType;
            $custom_atlasSize = $cfg_atlasSize;
            $custom_atlasType = $cfg_atlasType;
        }

        $hotline = $hotline_config == 0 ? $cfg_hotline : $customHotline;

        $params = !empty($this->param) && !is_array($this->param) ? explode(',', $this->param) : "";

        // $domainInfo = getDomain('paimai', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('paimai', $customSubDomain);

        //分站自定义配置
        $ser = 'paimai';
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

            $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
            $return['logoUrl'] = $customLogo;
            $return['subDomain'] = $customSubDomain;
            $return['channelDomain'] = $customChannelDomain;
            $return['channelSwitch'] = $customChannelSwitch;
            $return['closeCause'] = $customCloseCause;
            $return['title'] = str_replace('$city', $cityName, $customSeoTitle);
            $return['keywords'] = str_replace('$city', $cityName, $customSeoKeyword);
            $return['description'] = str_replace('$city', $cityName, $customSeoDescription);
            $return['hotline'] = $hotline;
            $return['atlasMax'] = $customAtlasMax;
            $return['recMoney'] = $recMoney;
            $return['singelnum'] = $singelnum;
            $return['Tel400'] = $Tel400;
            $return['subscribe'] = $subscribe;
            $return['template'] = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize'] = $custom_softSize;
            $return['softType'] = $custom_softType;
            $return['thumbSize'] = $custom_thumbSize;
            $return['thumbType'] = $custom_thumbType;
            $return['atlasSize'] = $custom_atlasSize;
            $return['atlasType'] = $custom_atlasType;
        }

        return $return;

    }

    /**
     * 商家详细（获取指定ID的商家信息，如果未指定，则取登录用户的商家信息），另外可检测商家状态
     * @return array
     */
    public function storeDetail()
    {
        global $dsql;
        global $userLogin;
        $storeDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        $gettype = is_numeric($this->param) ? 0 : $this->param['gettype'];
        $uid = $userLogin->getMemberID();

        $userinfo = $userLogin->getMemberInfo();

        $uid = $userinfo['is_staff'] == 1 ? $userinfo['companyuid'] : $uid;

        if (!is_numeric($id) && $uid == -1) {
            return array("state" => 200, "info" => '格式错误！');
        }

        $where = '';
        if ((int)$gettype == 0) {

            $where = " AND `state` = 1";
        }
        if (!is_numeric($id)) {
            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__paimai_store` WHERE `uid` = " . $uid);
            $results = $dsql->dsqlOper($archives, "results");
            if ($results) {
                $id = $results[0]['id'];
                $where = "";
            } else {
                return array("state" => 200, "info" => '该会员暂未开通商铺！');
            }
        }

        $archives = $dsql->SetQuery("SELECT s.*,(select count(`id`) from `#@__paimailist` where `sid`=s.`id`)'sale', (select count(`id`) from `#@__paimailist` where `sid`=s.`id` and `arcrank`=1)'onsale' FROM `#@__paimai_store` s WHERE `id` = " . $id . $where);
        $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $storeDetail["id"] = (int)$results[0]['id'];
            $storeDetail["wechatcode"] = $results[0]['wechatcode'];

            $sql = $dsql->SetQuery("SELECT m.`company`, b.`title` FROM `#@__member` m LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` WHERE m.`id` = " . $results[0]['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            $storeDetail['company'] = $ret[0]['title'] ? $ret[0]['title'] : $ret[0]['company'];

            $uid = $results[0]['uid'];
            $storeDetail['member'] = getMemberDetail($uid);

            $storeDetail["typeid"] = (int)$results[0]['stype'];
            global $data;
            $data = "";
            $paimaitype = getParentArr("paimaitype", $results[0]['stype']);
            if ($paimaitype) {
                $paimaitype = array_reverse(parent_foreach($paimaitype, "typename"));
                $storeDetail['typename'] = join(" > ", $paimaitype);
                $storeDetail['typenameonly'] = count($paimaitype) > 2 ? $paimaitype[1] : $paimaitype[0];
            } else {
                $storeDetail['typename'] = "";
                $storeDetail['typenameonly'] = "";
            }

            $storeDetail["addrid"] = (int)$results[0]['addrid'];
            $addrName = getParentArr("site_area", $results[0]['addrid']);
            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $storeDetail['addrname'] = $addrArr;

            $storeDetail["address"] = $results[0]['address'];
            $storeDetail["shortaddress"] = cn_substrR($results[0]['address'], 10);

            $storeDetail["tel"] = $results[0]['tel'];

            $storeDetail["state"] = (int)$results[0]['state'];
            $storeDetail["sale"] = (int)$results[0]['sale'];
            $storeDetail["onsale"] = (int)$results[0]['onsale'];

            $param = array(
                "service" => "paimai",
                "template" => "store",
                "id" => $id
            );
            $url = getUrlPath($param);
            $storeDetail['url'] = $url;

            $storeDetail['cityid'] = (int)$results[0]['cityid'];

        }else{
            return array("state" => 200, "info" => '商铺未审核！');
        }
        return $storeDetail;
    }

    /**
     * 获取商家列表
     */
    public function storeList()
    {
        global $dsql;
        global $langData;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $search = $this->param['search'];
                $typeid = $this->param['typeid'];
                $addrid = $this->param['addrid'];
                $orderby = $this->param['orderby'];
                $order = $this->param['order'];
                $page = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        $pageinfo = $list = array();
        $where = " where 1=1 AND l.`state` = 1";
        $page = $page ? $page : 1;
        $pageSize = $pageSize ? $pageSize : 10;

        if($typeid != ""){
            if($dsql->getTypeList($typeid, "paimaitype")){
                global $arr_data;
                $arr_data = array();
                $lower = arr_foreach($dsql->getTypeList($typeid, "paimaitype"));
                $lower = $typeid.",".join(',',$lower);
            }else{
                $lower = $typeid;
            }
            $where .= " AND `stype` in ($lower)";
        }

        if($addrid != ""){
            $where .= " AND l.`addrid` = $addrid";
        }

        $where .= " order by id desc";

        $atpage = $pageSize * ($page - 1);
        $sql = $dsql->SetQuery("select l.*,m.`company`,b.`title` from `#@__paimai_store` l LEFT JOIN `#@__member` m ON l.`uid`=m.`id` LEFT JOIN `#@__business_list` b ON b.`uid`=m.`id`");
        $sql = $sql . $where;
        $psql = $sql . " LIMIT $atpage, $pageSize";
        $ret = $dsql->dsqlOper($psql, "results");
        $ret = is_array($ret) ? $ret : array();
        foreach ($ret as $k => $v) {
            $list[$k]['id'] = (int)$v['id'];
            $list[$k]['cityid'] = (int)$v['cityid'];
            $list[$k]['address'] = $v['address'];
            $list[$k]["shortaddress"] = cn_substrR($v['address'], 10);
            $list[$k]['tel'] = $v['tel'];
            $list[$k]['typeid'] = (int)$v['stype'];  // 分类ID
            $list[$k]['company'] = $v['title'] ? $v['title'] : $v['company'];  // 商家名称
            global $data;
            $data = "";
            $paimaitype = getParentArr("paimaitype", $v['stype']);
            if ($paimaitype) {
                $paimaitype = array_reverse(parent_foreach($paimaitype, "typename"));
                $list[$k]['typename'] = join(" > ", $paimaitype);
                $list[$k]['typenameonly'] = count($paimaitype) > 2 ? $paimaitype[1] : $paimaitype[0];
            } else {
                $list[$k]['typename'] = "";
                $list[$k]['typenameonly'] = "";
            }
            $list[$k]['jointime'] = date("Y-m-d H:i:s", $v['jointime']);  // 加入时间
            $list[$k]['state'] = (int)$v['state'];
            $list[$k]['wechatcode'] = $v['wechatcode'];  // 微信号

            $list[$k]["addrid"] = (int)$v['addrid'];
            $addrName = getParentArr("site_area", $v['addrid']);
            global $data;
            $data = "";
            $addrArr = array_reverse(parent_foreach($addrName, "typename"));
            $addrArr = count($addrArr) > 2 ? array_splice($addrArr, 1) : $addrArr;
            $list[$k]['addrname'] = $addrArr;
        }
        // 分页提示
        $totalSum = $dsql->count($sql);
        $pageInfo['page'] = $page;
        $pageInfo['pageSize'] = $pageSize;
        $pageInfo['totalCount'] = $totalSum;
        $pageInfo['totalPage'] = ceil($totalSum / $pageSize);

        return array("pageInfo" => $pageInfo, "list" => $list);
    }

    /**
     * 新增拍卖
     */
    public function put()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        require(HUONIAOINC . "/config/paimai.inc.php");
        $arcrank = (int)$customagentCheck;

        if ($userid < 1) {
            return array("state" => 200, "info" => '登录失效');
        }
        // 登录的账户是否为商家
        $sql2 = $dsql->SetQuery("select `id`,`state` from `#@__paimai_store` where uid=" . $userid);
        $ret2 = $dsql->dsqlOper($sql2, "results");
        $sid = $ret2[0]['id'];
        $state = $ret2[0]['state'];
        if (!$sid) {
            return array("state" => 200, "info" => '未开通拍卖商家');
        }
        if(!$state){
            return array("state" => 200, "info" => '店铺未审核');
        }
        // 数据校验
        $param = $this->param;
        $title = $param['title'];
        if (empty($title)) {
            return array("state" => 200, "info" => '标题不能为空');
        }
        $amount = (int)$param['amount'];

        $start_money = $param['start_money'];
        if ($start_money < 1) {
            return array("state" => 200, "info" => '起拍价不能小于1');
        }
        $add_money = $param['add_money'];
        if ($add_money < 1) {
            return array("state" => 200, "info" => '加价幅度不能小于1');
        }
        $min_money = (int)$param['min_money'];  // 保留价

        $add_interval = $param['add_interval'];
        if ($add_interval < 5) {
            return array("state" => 200, "info" => '延时周期不可小于5分钟');
        }
        $pay_limit = $param['pay_limit'];
        if (empty($pay_limit)) {
            return array("state" => 200, "info" => '未设置付款限制时间');
        }
        $pubdate = time();
        $startdate = $param['startdate'];
        if (empty($startdate)) {
            return array("state" => 200, "info" => '未设置开始拍卖时间');
        }
        $enddate = $param['enddate'];
        if (empty($enddate)) {
            return array("state" => 200, "info" => '未设置拍卖结束时间');
        }
        $maxnum = $param['maxnum'];
        if (empty($maxnum)) {
            return array("state" => 200, "info" => '未设置最大拍卖数量');
        }
        $jy_type = (int)$param['jy_type'];  // 交易方式

        $litpic = $param['litpic'];
        if (empty($litpic)) {
            return array("state" => 200, "info" => '未上传代表图');
        }
        $pics = $param['pics'];
        if (empty($pics)) {
            return array("state" => 200, "info" => '缺少图集pics字段');
        }
        $body = $param['body'];
        if (empty($body)) {
            return array("state" => 200, "info" => '缺少商品详细');
        }
        $ptype = (int)$param['ptype'];
        // 保存到数据库中
        $sql = $dsql->SetQuery("insert into `#@__paimailist`(sid,title,amount,start_money,add_money,min_money,add_interval,pay_limit,pubdate,startdate,enddate,maxnum,jy_type,litpic,pics,body,cur_mon_start,arcrank,ptype) values($sid,'$title',$amount,$start_money,$add_money,$min_money,$add_interval,$pay_limit,$pubdate,$startdate,$enddate,$maxnum,$jy_type,'$litpic','$pics','$body',$start_money,$arcrank,$ptype)");
        $aid = $dsql->dsqlOper($sql, "lastid");
        if ($aid) {

            $urlParam = array(
                'service' => 'paimai',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'paimai', '', $aid, 'insert', '发布商品('.$aid.'=>'.$title.')', $url, $sql);

            return (int)$aid;
        } else {
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }
    }

    /**
     * 编辑拍卖
     */
    public function edit()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        require(HUONIAOINC . "/config/paimai.inc.php");
        $arcrank = (int)$customagentCheck;
        // 登录的账户是否为商家
        $sql2 = $dsql->SetQuery("select `id` from `#@__paimai_store` where uid=" . $userid);
        $ret2 = $dsql->dsqlOper($sql2, "results");
        $sid = $ret2[0]['id'];
        if (!$sid) {
            return array("state" => 200, "info" => '未开通拍卖商家');
        }
        // 数据校验
        $param = $this->param;
        $title = $param['title'];
        if (empty($title)) {
            return array("state" => 200, "info" => '标题不能为空');
        }
        $amount = (int)$param['amount'];  // 保证金

        $start_money = $param['start_money'];
        if ($start_money < 1) {
            return array("state" => 200, "info" => '起拍价不能小于1');
        }
        $add_money = $param['add_money'];
        if ($add_money < 1) {
            return array("state" => 200, "info" => '加价幅度不能小于1');
        }
        $min_money = (int)$param['min_money'];  // 保留价

        $add_interval = $param['add_interval'];
        if ($add_interval < 5) {
            return array("state" => 200, "info" => '延时周期不可小于5分钟');
        }
        $pay_limit = $param['pay_limit'];
        if (empty($pay_limit)) {
            return array("state" => 200, "info" => '未设置延时周期');
        }
        $startdate = $param['startdate'];
        if (empty($startdate)) {
            return array("state" => 200, "info" => '未设置开始拍卖时间');
        }
        $enddate = $param['enddate'];
        if (empty($enddate)) {
            return array("state" => 200, "info" => '未设置拍卖结束时间');
        }
        $maxnum = $param['maxnum'];
        if (empty($maxnum)) {
            return array("state" => 200, "info" => '未设置最大拍卖数量');
        }
        $jy_type = (int)$param['jy_type'];  // 交易方式

        $litpic = $param['litpic'];
        if (empty($litpic)) {
            return array("state" => 200, "info" => '未上传代表图');
        }
        $pics = $param['pics'];
        if (empty($pics)) {
            return array("state" => 200, "info" => '缺少图集pics字段');
        }
        $body = $param['body'];
        if (empty($body)) {
            return array("state" => 200, "info" => '缺少详细介绍');
        }
        $id = $param['id'];
        if (empty($litpic)) {
            return array("state" => 200, "info" => '要更新的商品不存在');
        }
        $ptype = (int)$param['ptype'];
        // 校验商品的状态
        $sql = $dsql->SetQuery("select arcrank from `#@__paimailist` where `id`=$id");
        $arc = $dsql->getOne($sql);
        if(!($arc==0 || $arc==2)){   // 未审核、或审核拒绝才可编辑（编辑后的新状态由配置项决定）
            return array("state"=>200,"info"=>"该商品为不可编辑状态");
        }
        $sql = $dsql->SetQuery("update `#@__paimailist` set`title`='$title',`amount`='$amount',`start_money`=$start_money,`add_money`=$add_money,`min_money`=$min_money,`add_interval`=$add_interval,`pay_limit`=$pay_limit,`startdate`=$startdate,`enddate`=$enddate,`maxnum`=$maxnum,`jy_type`=$jy_type,`body`='$body',`litpic`='$litpic',`pics`='$pics',`cur_mon_start`=$start_money,`arcrank`=$arcrank,`ptype`=$ptype where `id`=$id and `sid`=$sid");
        $res = $dsql->dsqlOper($sql, "update");
        if ($res == "ok") {

            $urlParam = array(
                'service' => 'paimai',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($userid, 'paimai', '', $id, 'update', '修改商品('.$id.'=>'.$title.')', $url, $sql);

            return array("state" => 100, "info" => '更新成功');
        } else {
            return array("state" => 200, "info" => '字段错误，请检测');
        }
    }

    /**
     * 终止拍卖接口
     */
    public function offShelf()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        // 登录的账户是否为商家
        $sql2 = $dsql->SetQuery("select `id` from `#@__paimai_store` where uid=" . $userid);
        $ret2 = $dsql->dsqlOper($sql2, "results");
        $sid = $ret2[0]['id'];
        if (!$sid) {
            return array("state" => 200, "info" => '未开通拍卖商家');
        }
        $ids = $this->param['ids'];
        if(empty($ids)){
            return array("state"=>200,"info"=>"格式不正确");
        }
        $sql = $dsql->SetQuery("select `id`,`maxnum`,`min_money` from `#@__paimailist` where id in($ids) and sid=$sid and `arcrank`=1");
        $ret = $dsql->getArrList($sql);
        $r = $this->stopPaiMai($ret);
        if($r==1){
            return array("state"=>100,"info"=>"拍卖终止成功");
        }else{
            return array("state"=>200,"info"=>"拍卖终止失败");
        }
    }

    /**
     * 获取拍卖列表（商品信息、出价信息）
     */
    public function getList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageInfo = $list = array();
        $where = " where 1=1";
        require(HUONIAOINC . "/config/paimai.inc.php");

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $store = $this->param['store'];  // 指定了某个商家id（如果同时传递u，则此参数失效）
                $timetype = $this->param['timetype'];   // 指定时间（1.拍卖中、2.即将开始、3.已结束、4.未结束）默认不限
                $orderby = $this->param['orderby'];  // 指定排序（1.价格低，2.价格高、3.出价次低、4.出价次高）
                $typeid = $this->param['typeid'];  // 指定了分类ID
                $title = $this->param['title'];   // 搜索关键字
                $u = $this->param['u'];        // 只获取当前用户的拍卖列表，当前用户必须是商家
                $arcrank = $this->param['arcrank'];    // 状态
                $page = $this->param['page'];     // 页面
                $pageSize = $this->param['pageSize'];  // 页面大小
            }
        }
        $page = $page ? $page : 1;
        $pageSize = $pageSize ? $pageSize : 10;

        $uid = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        // 商家获取自身店铺列表
        if ($u) {
            $sql2 = $dsql->SetQuery("select `id` from `#@__paimai_store` where uid=" . $uid);
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $sid = $ret2[0]['id'];
            if (!$sid) {
                return array("state" => 200, "info" => '未开通拍卖商家');
            }
            $where .= " and l.sid=" . $sid;
        } // 指定商家（此时不能传递u)
        elseif ($store != "") {
            $sql2 = $dsql->SetQuery("select `id` from `#@__paimai_store` where id=" . $store);
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $sid = $ret2[0]['id'];
            if (!$sid) {
                return array("state" => 200, "info" => '该商家不存在');
            }
            $where .= " and l.sid=" . $sid;
        }else{  // 用户获取
            $where .= "  and s.`state`=1";
        }

        // 指定关键字
        if ($title != "") {
            $where .= " and l.`title` like '%$title%'";
        }
        // 指定分类
        if ($typeid != "") {
            $typeidarr = explode(",",$typeid);
            foreach ($typeidarr as $i){
                if ($dsql->getTypeList($i, "paimaitype")) {
                    global $arr_data;
                    $arr_data = array();
                    $lower = arr_foreach($dsql->getTypeList($i, "paimaitype"));
                    $typeidarr = array_merge($typeidarr,$lower);
                }
            }
            $typeidarr = array_unique($typeidarr);
            $where .= " and ptype in(".join(",",$typeidarr).")";
        }
        // 指定拍卖时间
        if ($timetype != "") {
            $time = time();
            if ($timetype == 1) {  //拍卖中（大于开始时间、小于结束时间）
                $where .= " and l.startdate<$time and l.enddate>$time";
            } elseif ($timetype == 2) { // 即将开始（小于开始时间）
                $where .= " and l.`startdate`>$time";
            } elseif ($timetype == 3) { // 已结束（大于结束时间）
                $where .= " and l.enddate<$time";
            } elseif($timetype == 4){ // 未结束
                $where .= " and l.enddate>$time";
            }
        }

        // 排序
        $_order = '';
        if ($orderby != "") {
            if ($orderby == 1) {  // 价格从低到高
                $_order .= " order by l.`cur_mon_start` asc";
            } elseif ($orderby == 2) {  // 价格从高到低
                $_order .= " order by l.`cur_mon_start` desc";
            } elseif ($orderby == 3) {  // 出价次从低到高
                $sql2 = $dsql->SetQuery("(select count(*) paiNum from `#@__paimai_order_record` where `pid`=l.`id`) or2");
                $append = "," . $sql2;
                $_order .= " order by or2 asc";
            } elseif ($orderby == 4) {  // 出价次数从高到低
                $sql2 = $dsql->SetQuery("(select count(*) paiNum from `#@__paimai_order_record` where `pid`=l.`id`) or2");
                $append = "," . $sql2;
                $_order .= " order by or2 desc";
            }
        } else {  // 默认排序
            $_order .= " ORDER BY  l.`id` DESC";
        }
        $archive = $dsql->SetQuery("select l.*,t.`typename` $append from `#@__paimailist` l LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` LEFT JOIN `#@__paimaitype` t ON l.`ptype`=t.`id`");
        $archive = $archive . $where;

        // 分页提示
        $totalSum = $dsql->dsqlOper($archive, "totalCount");
        $pageInfo['page'] = $page;
        $pageInfo['pageSize'] = $pageSize;
        $pageInfo['totalCount'] = $totalSum;
        $pageInfo['totalPage'] = ceil($totalSum / $pageSize);

		//会员列表需要统计信息状态
        $where1 = '';
		if($u == 1 && $uid > -1){

            $totalGray = $dsql->dsqlOper($archive . " AND l.`arcrank` = 0", "totalCount");
            $totalAudit = $dsql->dsqlOper($archive . " AND l.`arcrank` in (1,3,4,5)", "totalCount");
            $totalRefuse = $dsql->dsqlOper($archive . " AND l.`arcrank` = 2", "totalCount");

            $pageInfo['totalGray'] = $totalGray;
            $pageInfo['totalAudit'] = $totalAudit;
            $pageInfo['totalRefuse'] = $totalRefuse;
        }

        // 指定状态
        if ($arcrank != "") {    
            $where1 .= " and l.arcrank in(" . $arcrank . ")";
        }

        // 分页数据
        $atpage = $pageSize * ($page - 1);
        $psql = $archive . $where1 . $_order . " LIMIT $atpage, $pageSize";

        $ret = $dsql->dsqlOper($psql, "results");

        $ret = is_array($ret) ? $ret : array();

        foreach ($ret as $k => $v) {
            $list[$k]['id'] = (int)$v['id'];
            $list[$k]['sid'] = (int)$v['sid'];
            $list[$k]['title'] = $v['title'];
            $list[$k]['title'] = $v['title'];
            $list[$k]['amount'] = (int)$v['amount'];  // 保证金
            $list[$k]['start_money'] = (int)$v['start_money'];  // 起拍价
            $list[$k]['add_money'] = (int)$v['add_money'];  // 加价幅度
            $list[$k]['min_money'] = (int)$v['min_money'];  // 保留价格
            $list[$k]['add_interval'] = (int)$v['add_interval'];  // 延时周期
            $list[$k]['pay_limit'] = (int)$v['pay_limit'];  // 付款延时期限
            $list[$k]['pubdate'] = date("Y-m-d H:i:s", $v['pubdate']);  // 发布时间
            $list[$k]['startdate'] = date("Y-m-d H:i:s", $v['startdate']);  // 开始时间
            $list[$k]['enddate'] = date("Y-m-d H:i:s", $v['enddate']);  // 结束时间
            $list[$k]['maxnum'] = (int)$v['maxnum'];  // 最大拍卖数量
            $list[$k]['jy_type'] = $v['jy_type'];  // 交易方式
            $list[$k]['litpic'] = getFilePath($v['litpic']);  // 首图
            $list[$k]['body'] = $v['body'];  // 主要介绍
            $list[$k]['cur_mon_start'] = (int)$v['cur_mon_start'];  // 当前价
            $list[$k]['arcrank'] = (int)$v['arcrank'];  // 状态
            $list[$k]['sale_num'] = (int)$v['sale_num'];  // 中标数量
            $list[$k]['buy_num'] = (int)$v['buy_num'];  // 实际已交易数量
            $list[$k]['typeid'] = (int)$v['ptype'];  // 商品分类编号
            $list[$k]['typename'] = $v['typename'];  // 商品分类名称

            // url
            $urlParam = array(
                "service"  => "paimai",
                "template" => "detail",
                "id"       => $v['id']
            );
            $list[$k]['url'] = getUrlPath($urlParam);  // 详情链接

            //获取出价次数
            $sql2 = $dsql->SetQuery("select count(*) paiNum from `#@__paimai_order_record` where `pid`={$v['id']}");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $list[$k]['pai_count'] = (int)$ret2[0]['paiNum'];
            // 获取最高价
            $sql2 = $dsql->SetQuery("select max(`price_avg`) maxNum from `#@__paimai_order_record` where `pid`={$v['id']}");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $list[$k]['pai_max'] = (int)$ret2[0]['maxNum'];
        }

        return array("pageInfo" => $pageInfo, "list" => $list);
    }

    /**
     * 获取指定ID的拍卖商品详情（商品、商家、出价信息）
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        $paimaiDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');
        $uid = $userLogin->getMemberID();
        // 查询商品信息
        $sql = $dsql->SetQuery("select l.*,s.uid,t.`id` 'typeid',t.`typename`,(select count(`id`) from `#@__paimailist` where `sid`=s.`id`)'sale', (select count(`id`) from `#@__paimailist` where `sid`=s.`id` and `arcrank`=1)'onsale' from `#@__paimailist` l LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` LEFT JOIN `#@__paimaitype` t ON l.`ptype`=t.`id` where l.`id`=$id");
        $ret = $dsql->dsqlOper($sql, "results");
        $time = time();
        if (is_array($ret) && is_array($ret[0])) {
            // 商品信息
            $paimaiDetail['id'] = (int)$ret[0]['id'];
            $paimaiDetail['title'] = $ret[0]['title'];
            $paimaiDetail['body'] = $ret[0]['body'];
            $paimaiDetail['amount'] = (int)$ret[0]['amount'];
            $paimaiDetail['start_money'] = (int)$ret[0]['start_money'];
            $paimaiDetail['add_money'] = (int)$ret[0]['add_money'];
            $paimaiDetail['min_money'] = (int)$ret[0]['min_money'];
            $paimaiDetail['add_interval'] = (int)$ret[0]['add_interval'];
            $paimaiDetail['pay_limit'] = (int)$ret[0]['pay_limit'];
            $paimaiDetail['startdate'] = (int)$ret[0]['startdate'];
            $paimaiDetail['enddate'] = (int)$ret[0]['enddate'];
            $paimaiDetail['maxnum'] = (int)$ret[0]['maxnum'];
            $paimaiDetail['arcrank'] = (int)$ret[0]['arcrank'];
            $paimaiDetail['litpic'] = $ret[0]['litpic'];
            $paimaiDetail['litpicUrl'] = getFilePath($ret[0]['litpic']);
            $paimaiDetail['cur_mon_start'] = (int)$ret[0]['cur_mon_start'];
            $paimaiDetail['sale_num'] = (int)$ret[0]['sale_num'];
            $paimaiDetail['buy_num'] = (int)$ret[0]['buy_num'];
            $paimaiDetail['pics'] = explode("||",$ret[0]['pics']);
            $picsUrl = array();
            foreach ($paimaiDetail['pics'] as $key=>$val){
                $picsUrl[] = getFilePath($val);
            }
            $paimaiDetail['picsUrl'] =$picsUrl;
            $paimaiDetail['jy_type'] = (int)$ret[0]['jy_type'];
            $paimaiDetail['typename'] = $ret[0]['typename'];
            $paimaiDetail['typeid'] = (int)$ret[0]['typeid'];
            // 商铺信息
            $sql2 = $dsql->SetQuery("select `title` from `#@__business_list` where uid={$ret[0]['uid']}");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $paimaiDetail['store']['title'] = $ret2[0]['title'];
            $paimaiDetail['store']['sid'] = (int)$ret[0]['sid'];
            $paimaiDetail['store']['sale'] = (int)$ret[0]['sale'];
            $paimaiDetail['store']['onsale'] = (int)$ret[0]['onsale'];
            $param = array(
                "service" => "paimai",
                "template" => "store",
                "id" => (int)$ret[0]['sid']
            );
            $url = getUrlPath($param);
            $paimaiDetail['store']['url'] = $url;
            // 报名人数
            $sql2 = $dsql->SetQuery("select count(*) regNum from `#@__paimai_order` where `proid`={$ret[0]['id']} and `type`='regist' and `orderstate` not in(0,2) ");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $paimaiDetail['reg_count'] = (int)$ret2[0]['regNum'];
            // 出价信息
            //获取总出价次数
            $sql2 = $dsql->SetQuery("select count(*) paiNum from `#@__paimai_order_record` where `pid`={$ret[0]['id']}");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $paimaiDetail['pai_count'] = (int)$ret2[0]['paiNum'];
            // 获取最新10个出价列表
            $sql2 = $dsql->SetQuery("SELECT m.`id` uid,m.`nickname`,o.`procount`,r.`price_avg` price_avg,r.`date` FROM `#@__paimai_order` o INNER JOIN `#@__paimai_order_record` r  ON o.`proid` = r.`pid` and o.`userid`=r.`uid` LEFT JOIN `#@__member` m ON r.`uid`=m.`id` where o.proid = {$ret[0]['id']} and o.`paistate`!=0 group by r.`id` order by price_avg desc,`date` asc limit 10");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $paimaiDetail['pai'] = $ret2;
            // 当前登录用户是否已报名，如果已报名，返回报名时的数量
            if( $uid <=0 ){
                $paimaiDetail['u_reg'] = 0;
            }else{
                $archives = $dsql->SetQuery("select procount,success_num,orderstate from `#@__paimai_order` where `userid`={$uid} and proid={$ret[0]['id']} and `orderstate` not in(0,2) and type='regist'");
                $arr = $dsql->getArr($archives);
                $paimaiDetail['u_reg'] = (int)$arr['procount'];
            }
            // 当前用户是否竞拍成功，如果竞拍成功可购买，返回成功数量
            if($uid>0 && $paimaiDetail['u_reg']>0){
                $paimaiDetail['u_success_num'] = (int)$arr['success_num'];
                $paimaiDetail['u_reg_state'] = (int)$arr['orderstate'];  // 如果为5，说明中拍、且保证金已退还，也就是已经成功下单
                $u_pai = $arr['success_num'];
                $orderstate = $arr['orderstate'];
                if($u_pai>0 && $orderstate!=5 && ($paimaiDetail['enddate']+$paimaiDetail['pay_limit']*3600)>$time){
                    $paimaiDetail['u_pai'] = $u_pai;

                }else{
                    $paimaiDetail['u_pai'] = 0;
                }
            }else{
                $paimaiDetail['u_pai'] = 0;
            }
        }

        return $paimaiDetail;
    }

    /**
     * 新增商铺、或修改商铺配置
     */
    public function storeConfig()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        $userid = $userLogin->getMemberID();
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {
            if (!verificationStaff(array('module' => 'paimai', 'type' => '1'))) return array("state" => 200, "info" => '商家权限验证失败');  //商家权限验证失败！
            $userid = $userDetail['companyuid'];
        }
        if ($userid <= 0 || $userid == '') {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        $param = $this->param;
        // 校验数据
        $stype      = (int)$param['stype'];
        if(empty($stype)){
//            return array("state"=>200,"info"=>"缺少分类信息");
        }
        $addrid     = (int)$param['addrid'];
        $address    = filterSensitiveWords(addslashes($param['address']));
        if(empty($address)){
            return array("state"=>200,"info"=>"缺少商家地址");
        }
        $tel        = $param['tel'];
        if(empty($tel)){
            return array("state"=>200,"info"=>"缺少联系电话");
        }
        $cityid =  (int)$param['cityid'];
        if (empty($cityid)) {
            $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrid));
            $cityInfoArr = explode(',', $cityInfoArr);
            $cityid      = (int)$cityInfoArr[0];
        }
        $wechatcode = $param['wechatcode'];
        // 校验该商铺是否已存在
        $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__paimai_store` WHERE `uid` = " . $userid);
        $openStore = $dsql->getOne($userSql);
        if (!$openStore) {
            // 新增商铺
            $archives = $dsql->SetQuery("INSERT INTO `#@__paimai_store` (`cityid`,`uid`, `stype`, `address`, `addrid`, `tel`, `jointime`, `wechatcode`) VALUES ('$cityid','$userid', '$stype', '$address', '$addrid',  '$tel'," . GetMkTime(time()) . ",'$wechatcode')");
            $aid = $dsql->dsqlOper($archives, "lastid");

            if (is_numeric($aid)) {

                $urlParam = array(
                    'service' => 'paimai',
                    'template' => 'store',
                    'id' => $aid
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'paimai', 'store', $aid, 'insert', '开通店铺', $url, $archives);

                // 更新店铺开关
                updateStoreSwitch("paimai", "paimai_store", $userid, $aid);

                //微信通知
                $cityName = $siteCityInfo['name'];
                $cityid = $siteCityInfo['cityid'];
                $param = array(
                    'type' => '', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => $cityid,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $cityName . '分站——paimai模块——用户:' . $userDetail['username'] . '新增商铺: ' . $title,
                        'date' => date("Y-m-d H:i:s", time()),
                    )
                );
                updateAdminNotice("paimai", "store", $param);

                return "配置成功，您的商铺正在审核中，请耐心等待！";
            } else {
                return array("state" => 200, "info" => '配置失败，请查检您输入的信息是否符合要求！');
            }
        } else {
            // 修改商铺配置
            $archives = $dsql->SetQuery("UPDATE `#@__paimai_store` SET `stype` = $stype, `addrid` = $addrid, `address` = '$address', `tel` = '$tel', `cityid` = $cityid, `wechatcode` = '$wechatcode' WHERE `uid` = " . $userid);
            $results = $dsql->update($archives);
            if ($results=="ok") {

                $urlParam = array(
                    'service' => 'paimai',
                    'template' => 'store',
                    'id' => $openStore[0]['id']
                );
                $url = getUrlPath($urlParam);
        
                //记录用户行为日志
                memberLog($userid, 'paimai', 'store', $openStore[0]['id'], 'update', '修改店铺', $url, $archives);

                return "保存成功！";
            } else {
                return array("state" => 200, "info" => '输入的信息不符合要求！');
            }
        }
    }

    /**
     * 竞拍，但不是付款，添加一条竞拍记录到出价表
     */
    public function pai(){
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $param = $this->param;
        $userDetail = $userLogin->getMemberInfo();
        if ($userid < 1) return array("state" => 200, "info" => '登录超时，请重新登录后下单！');
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }
        // 商品ID
        $aid = $param['id'];
        if (empty($aid)) return array("state" => 200, "info" => '未指定商品信息');
        // 出价金额
        $money = $param['money'];
        if (empty($money)) return array("state" => 200, "info" => '缺少出价金额');
        // 取得商品详情
        $detail = $this->detail();
        if(empty($detail)){
            return array("state" => 200, "info" => "商品不存在");
        }
        if($detail['arcrank']!=1){
            return array("state"=>200,"info"=>"当前商品为不可竞拍状态");
        }
        // 判断时间
        $time = time();
        if($time<$detail['startdate']){
            return array("state"=>200,"info"=>"该商品拍卖未开始");
        }
        if($time>$detail['enddate']){
            return array("state"=>200,"info"=>"该商品拍卖已结束");
        }
        // 判断商家状态
        $sql = $dsql->SetQuery("select s.`state` from `#@__paimailist` l LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` where l.`id`={$aid}");
        $ret = $dsql->dsqlOper($sql,"results");
        if(is_array($ret)){
            if($ret[0]['state']!=1){
                return array("state"=>200,"info"=>"商铺未正常营业，不可下单");
            }
        }else{
            return array("state"=>200,"info"=>"商铺不存在");
        }
        // 验证是否已经报名
        $archives = $dsql->SetQuery("select id,procount from `#@__paimai_order` where `userid`={$userid} and proid={$aid} and `orderstate`=1 and type='regist'");
        $res = $dsql->dsqlOper($archives, "results");
        if(!is_array($res[0])){
            return array("state"=>200,"info"=>"您还未报名成功，不可参与竞拍出价");
        }
        $pai_num = $res[0]['procount'];  // 拍卖数量，是报名时指定的数量
        $price_avg = $money / $pai_num ;  // 用户平均单价
        // 判断下单金额，是否符合要求
        $isfirst = true;
        $cur_user = 0;
        if(count($detail['pai'])>0){
            $isfirst = false;
            $cur_user = $detail['pai'][0]['uid'];
        }
        if($isfirst && $price_avg<$detail['start_money']){
            return array("state"=>200,"info"=>"单价金额小于起始价格");
        }
        elseif(!$isfirst && $price_avg<($detail['cur_mon_start']+$detail['add_money'])){
            return array("state"=>200,"info"=>"单价金额小于加价幅度");
        }
        if($cur_user==$userid){ // 上一次最新出价用户依然该用户
            return array("state"=>200,"info"=>"同一用户无法连续出价。");
        }
        // 添加记录到order_record
        $sql = $dsql->SetQuery("insert into `#@__paimai_order_record`(`pid`,`uid`,`price`,`date`,`price_avg`) values($aid,$userid,$money,$time,$price_avg)");
        $ret = $dsql->dsqlOper($sql,"update");
        // 修改order表的paistate状态为已出价（状态码1）
        $sql = $dsql->SetQuery("update `#@__paimai_order` set `paistate`=1 where `proid`=$aid and `userid`=$userid");
        $ret = $dsql->dsqlOper($sql,"update");
        // 修改拍卖表的cur_mon_start为最高平均价
        $sql = $dsql->SetQuery("update `#@__paimailist` set `cur_mon_start`=$price_avg where `id`=$aid");
        $ret = $dsql->dsqlOper($sql,"update");
        // 如果进入延时周期，增加时间
        if(($detail['enddate']-$time)<300){  // 最后5分钟为延时周期
            $sql = $dsql->SetQuery("update `#@__paimailist` set `enddate`=`enddate`+`add_interval`*60 where `id`=$aid");
            $ret = $dsql->dsqlOper($sql,"update");
        }
        return "出价成功";
    }

    /**
     * 下单，  生成支付订单
     */
    public function deal()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid < 1) return array("state" => 200, "info" => '登录超时，请重新登录后下单！');
        $param = $this->param;
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }
        // 商品ID
        $aid = $param['id'];
        if (empty($aid)) return array("state" => 200, "info" => '未指定商品信息');
        // 下单类型（报名、竞价）
        $type = $param['type'];  // regist 报名、pai竞拍
        if (empty($type)) return array("state" => 200, "info" => '没指定下单类型');
        $num = $param['num'];  // 下单数量（默认为1）
        if ($type=='regist' && empty($num)) $num=1;
        // 取得商品详情
        $detail = $this->detail();
        if(empty($detail)){
            return array("state" => 200, "info" => "商品不存在");
        }
        // 判断商家状态
        $sql = $dsql->SetQuery("select s.`state` from `#@__paimailist` l LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` where l.`id`={$aid}");
        $ret = $dsql->dsqlOper($sql,"results");
        if(is_array($ret)){
            if($ret[0]['state']!=1){
                return array("state"=>200,"info"=>"商铺未正常营业，不可下单");
            }
        }else{
            return array("state"=>200,"info"=>"商铺不存在");
        }
        // 查询商品库存
        if ($detail['maxnum'] < $num) {
            return array("state" => 200, "info" => "库存不足");
        }
        // 判断商品状态
        if($detail['arcrank']==0 || $detail['arcrank']==2){
            return array("state" => 200, "info" => "商品未审核");
        }
        //验证是否为自己的店铺
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__paimai_store` WHERE `uid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            if ($detail['store']['sid'] == $ret[0]['id']) {
                return array("state" => 200, "info" => "企业会员不得购买自己店铺的商品！");
            }
        }
        $ordernum = create_ordernum();
        $time = time();
        $urlParam = array(
            "service" => "member",
            "type" => "user",
            "template" => "orderdetail",
            "module" => "paimai",
            "id" => $aid
        );
        $url = getUrlPath($urlParam);
        $body = array(
            'service' => "paimai",
            "template" => "detail",
            "id" => $aid
        );
        $timeout = GetMkTime(time()) + 1800;
        if ($type == "regist") {
            // 查询是否已报名该拍卖商品
            $sql2 = $dsql->SetQuery("select id from `#@__paimai_order` where `userid`=$userid and `proid`=$aid and `type`='regist' and `orderstate`=1");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            if (is_array($ret2) && is_array($ret2[0])) {
                return array("state" => 200, "info" => "您已报名该商品");
            }
            // 查询商品是否已经拍卖结束
            if($time>$detail['enddate']){
                return array("state" => 200, "info" => "该商品拍卖已结束");
            }
            // 需要记录收货地址
            $address = "";  // 收货地址
            $person = "";  // 收货人
            $contact = "";  // 联系方式
            $usernote = "";   // 收货备注
            // 收货地址（从会员收货地址库中选一个）
            $addrid       = (int)$param['addrid'];
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

                $usernote      = $param['usernote'];
            }
            else{
                return array("state"=>200,"info"=>"缺少发货地址。");
            }
            // 正常下单
            if ($detail['amount'] == 0) {  // 无需保证金，直接成功
                $price = 0;
                $archives = $dsql->SetQuery("INSERT INTO `#@__paimai_order` (`ordernum`, `userid`, `proid`,`type`, `procount`, `amount`, `orderdate`,`orderstate`,`paytype`,`paydate`,`useraddr`,`username`,`usercontact`,`usernote`) VALUES ('$ordernum', '$userid',$aid,'$type',$num,$price,$time,1,'money',$time,'$address','$person','$contact','$usernote')");
                $oid = $dsql->dsqlOper($archives, "lastid");
                if (!is_numeric($oid)) {
                    return array("state" => 200, "info" => "下单失败");
                }
            } else {  // 添加订单记录
                $price = $detail['amount'] * $num;  // 需要支付的钱，是 数量*保证金
                $archives = $dsql->SetQuery("INSERT INTO `#@__paimai_order` (`ordernum`, `userid`, `proid`,`type`, `procount`, `amount`, `orderdate`,`useraddr`,`username`,`usercontact`,`usernote`) VALUES ('$ordernum', '$userid',$aid,'$type',$num,$price,$time,'$address','$person','$contact','$usernote')");
                $res = $dsql->dsqlOper($archives, "update");
                if ($res != "ok") {
                    return array("state" => 200, "info" => "下单失败");
                }
            }
            // 返回order给前端即可
            if ($price > 0) {
                // 使用统一方法生成订单
                $order = createPayForm("paimai", $ordernum, $price, '', "商品拍卖报名", $body, 1);
                $order['timeout'] = $timeout;
            } else {
                $urlParam = array(
                    "service"  => "member",
                    "type"     => "user",
                    "template" => "orderdetail-paimai",
                    "id"       => $oid
                );
                $order = getUrlPath($urlParam);
            }
            return $order;
        } else {
            // 竞拍成功后付款
            // 查询关联的保证金订单
            $archives = $dsql->SetQuery("select o.success_num,o.orderstate,l.jy_type,o.`useraddr`,o.`username`,o.`usercontact`,o.`usernote` from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` where proid=$aid and userid=$userid and paistate=2");
            $arr = $dsql->getArr($archives);
            if(empty($arr) || empty($arr['success_num'])){
                return array("state"=>200,"info"=>"非竞拍成功，不可下单");
            }
            if($arr['orderstate']==5){
                return array("state"=>200,"info"=>"已存在成功订单，不可重复下单");
            }
            $success_num = $arr['success_num'];
            // 查询竞拍时的单价（用户竞拍最高价格即是正确价格）
            $sql = $dsql->SetQuery("select price_avg from `#@__paimai_order_record` where `pid`=$aid and `uid`=$userid order by price_avg desc limit 1");
            $price_avg = (int)$dsql->getOne($sql);

            $price = $success_num * $price_avg;  // 应该支付的金额

            // 校验是否在限制时间内下单
            $archives = $dsql->SetQuery("select pay_limit,enddate from `#@__paimailist` where id=$aid");
            $arr2 = $dsql->getArr($archives);
            $pay_limit = (int)$arr2['pay_limit'];
            $enddate = (int)$arr2['enddate'];
            if($time > $enddate+$pay_limit*3600){
                return array("state"=>200,"info"=>"下单时间超出限制");
            }
            // 需要记录收货地址
            $address = "";  // 收货地址
            $person = "";  // 收货人
            $contact = "";  // 联系方式
            $usernote = "";   // 收货备注
            // 如果传递了收货地址，则取收货地址
            $addrid       = (int)$param['addrid'];
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

                $usernote      = $param['usernote'];
            }else{
                // 收货地址，从保证金订单表中取得
                $address = empty($arr['useraddr']) ? "" : $arr['useraddr'];
                $person = empty($arr['username']) ? "" : $arr['username'];
                $contact = empty($arr['usercontact']) ? "" : $arr['usercontact'];
                $usernote = empty($arr['usernote']) ? "" : $arr['usernote'];
            }
            // 插入记录到order表
            $archives = $dsql->SetQuery("INSERT INTO `#@__paimai_order` (`ordernum`, `userid`, `proid`,`type`, `procount`, `amount`, `orderdate`,`useraddr`,`username`,`usercontact`,`usernote`) VALUES ('$ordernum', '$userid',$aid,'$type',$success_num,$price,$time,'$address','$person','$contact','$usernote')");
            $res = $dsql->dsqlOper($archives, "update");
            if ($res != "ok") {
                return array("state" => 200, "info" => "下单失败");
            }
            // 返回order给前端即可
            $order = createPayForm("paimai", $ordernum, $price, '', "拍卖成功下单", $body, 1);
            $order['timeout'] = $timeout;
            return $order;
        }
    }

    /**
     * 订单列表（个人查看下单列表、商家查看店铺订单列表）
     */
    public function orderList(){
        global $dsql;
        $pageinfo = $list = array();
        $store    = $state = $userid = $page = $pageSize = $where = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $store    = $this->param['store'];
                $state    = $this->param['state'];
                $type     = $this->param['type'];
                $userid   = $this->param['userid'];
                $skword   = trim($this->param['skword']);
                $title    = trim($this->param['title']);
                $skword   = $skword ? $skword : $title;
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        global $userLogin;
        $userinfo = $userLogin->getMemberInfo();
        if (empty($userid)) {
            $userid = $userLogin->getMemberID();
        }
        if (empty($userid)) return array("state" => 200, "info" => '会员ID不得为空！');
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        //个人会员订单
        if (empty($store)) {
            // 商品信息、商家信息、订单信息
            $archives = $dsql->SetQuery("select o.*,l.`title`,l.`litpic`,m.`company`,b.`title` btitle,s.`id` sid,s.`tel`,l.`startdate`,l.`enddate`,l.`pay_limit`,l.`cur_mon_start`,l.`jy_type` from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` LEFT JOIN `#@__paimai_store` s ON l.`sid` = s.`id`  LEFT JOIN `#@__member` m ON m.`id` = s.`uid` LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` where o.`userid`=$userid");
//            die($archives);

        }else{
            // 商品信息、商家信息、订单信息
            $archives = $dsql->SetQuery("select o.*,l.`title`,l.`litpic`,m.`company`,b.`title` btitle,s.`id` sid,s.`tel`,l.`startdate`,l.`enddate`,l.`pay_limit`,l.`cur_mon_start`,l.`jy_type` from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` LEFT JOIN `#@__paimai_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`uid` LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` where s.`uid`=$userid");
//            die($archives);
        }

        // 指定类型
        if($type!=""){
            $where .= " and o.type='$type'";
        }
        // 关键字
        if($skword!=""){
            $where .= " and (1=2";
            if(is_numeric($skword)){
                $where .= " or o.`proid`=$skword";
            }
            if($store){
                $where .= " or l.`title` like '%$skword%' or o.`ordernum` like '%$skword%' or o.`usercontact` like '%$skword%' or m.`nickname` like '%$skword%'";
            }else{
                $where .= " or l.`title` like '%$skword%' or m.`company` like '%$skword%' or o.`ordernum` like '%$skword%'";
            }
            $where .= ")";
        }
        $where .= " and o.`paistate`!=3 and o.`orderstate`!=0 and o.`orderstate`!=2";  // 隐藏
        //未付款
        $state0 = $dsql->count($archives .$where. " AND o.`orderstate` = 0");
        //已交保
        $state1 = $dsql->count($archives .$where. " AND o.`orderstate` = 1 AND o.`type`='regist' and o.`success_num`=0");
        //待补款
        $state7 = $dsql->count($archives .$where. " AND o.`orderstate` = 1 AND o.`type`='regist' and o.`success_num`>0 and (l.`pay_limit`*3600+l.`enddate`)>unix_timestamp(current_timestamp)");
        //已付款
        $state6 = $dsql->count($archives .$where. " AND o.`orderstate` = 1 AND o.`type`='pai'");
        //已过期
        $state2 = $dsql->count($archives .$where. " AND o.`orderstate` = 2");
        //已发货
        $state3 = $dsql->count($archives .$where. " AND o.`orderstate` = 3");
        //完成(已收货）
        $state4 = $dsql->count($archives .$where. " AND o.`orderstate` = 4");
        //已退款（未获拍）
        $state5 = $dsql->count($archives .$where. " AND (o.`orderstate` = 5 or (o.`type`='regist' and o.success_num>0 and (l.`pay_limit`*3600+l.`enddate`)<unix_timestamp(current_timestamp)))");

        // 指定订单状态
        if($state!=""){
            // 原始状态
            if($state!=1 && $state!=6 && $state!=7 && $state!=5){
                $where .= " and o.orderstate=$state";
            }
            // 特殊处理
            elseif($state==1){
                $where .= " and o.orderstate=1 and o.type='regist' and `success_num`=0";
            }
            elseif($state==6){
                $where .= " and o.orderstate=1 and o.type='pai'";
            }
            elseif($state==7){
                $where .= " and o.orderstate=1 and o.type='regist' and `success_num`>0 and (l.`pay_limit`*3600+l.`enddate`)>unix_timestamp(current_timestamp)";
            }
            elseif($state==5){
                $where .= " AND (`orderstate` = 5 or o.`type`='regist' and o.success_num>0 and (l.`pay_limit`*3600+l.`enddate`)<unix_timestamp(current_timestamp))";
            }
        }

        $archives .= $where;

        // 分页数据
        $archives .= " order by o.`id` desc";
        $res = $dsql->getPage($page,$pageSize,$archives,1);
        // 总数
        $totalCount = $dsql->count($archives);
        $pageinfo['page'] = $page;
        $pageinfo['pageSize'] = $pageSize;
        $pageinfo['totalCount'] = $totalCount;
        $pageinfo['totalPage']  = ceil($totalCount/$pageSize);
        $pageinfo['state0'] = $state0;
        $pageinfo['state1'] = $state1;
        $pageinfo['state2'] = $state2;
        $pageinfo['state3'] = $state3;
        $pageinfo['state4'] = $state4;
        $pageinfo['state5'] = $state5;
        $pageinfo['state6'] = $state6;
        $pageinfo['state7'] = $state7;
        $time = time();
        if(is_array($res)){
            foreach ($res as $k=>$v){
                $list[$k]['id'] = (int)$v['id'];
                $list[$k]['ordernum'] = $v['ordernum'];
                $list[$k]['type'] = $v['type'];
                $list[$k]['orderdate'] = date("Y-m-d H:i:s",$v['orderdate']);
                $list[$k]['procount'] = (int)$v['procount'];
                $list[$k]['amount'] = (int)$v['amount'];
                $list[$k]['orderstate'] = (int)$v['orderstate'];
                $list[$k]['paytype'] = getPaymentName($v['paytype']);
                $list[$k]['paistate'] = (int)$v['paistate'];
                $list[$k]['success_num'] = (int)$v['success_num'];
                // 获取用户最高出价
                $sqlMax = $dsql->SetQuery("select max(price_avg) max_price from `#@__paimai_order_record` where pid = {$v["proid"]} and uid={$v["userid"]}");
                $list[$k]["price_max"] = (int)$dsql->getOne($sqlMax);
                // 商家信息
                $store = array();
                $store['company'] = $v['btitle']?$v['btitle']:$v['company'];
                $store['sid'] = (int)$v['sid'];
                $store['tel'] = $v['tel'];
                $param = array(
                    "service" => "paimai",
                    "template" => "store",
                    "id" => $v['proid']
                );
                $store['url'] = getUrlPath($param);
                $list[$k]['store'] = $store;
                // 商品信息
                $product = array();
                $product['proid'] = (int)$v['proid'];
                $product['litpic'] = getFilePath($v['litpic']);
                $product['title'] = $v['title'];
                $product['startdate'] = (int)$v['startdate'];
                $product['enddate'] = (int)$v['enddate'];
                $product['pay_limit'] = (int)$v['pay_limit'];
                $product['money'] = (int)$v['cur_mon_start'];
                $product['jy_type'] = (int)$v['jy_type'];
                $param                        = array(
                    "service"  => "paimai",
                    "template" => "detail",
                    "id"       => $v['proid']
                );
                $commonUrlParam = getUrlPath($param);
                if($v['type']=="regist"){
                    $product['bao_money'] = (int)$v['amount'];
                }else{
                    // 查询保证金订单
                    $sql = $dsql->SetQuery("select amount from `#@__paimai_order` where proid={$v['proid']} and userid={$v['userid']} and `type`='regist' and paistate>0");
                    $product['bao_money'] = (int)$dsql->getOne($sql);
                }
                $product['url'] = $commonUrlParam;
                $list[$k]['product'] = $product;
                // 计算是否可以拍卖下单
                if($v['type']=="regist" && $v['orderstate']!=5 && $v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)>$time){
                    $list[$k]["buy_product"] = true;
                }else{
                    $list[$k]["buy_product"] = false;
                }
                // 改写状态
                if($v['type']=="regist"){
                    if($v['orderstate']==1){  // 保证金状态，如果待补款则为7，如果违约则为5
                        $is_price = false;
                        if($v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)>$time){
                            $list[$k]['orderstate'] = 7;
                            $is_price = true;
                        }
                        elseif($v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)<$time){
                            $list[$k]['orderstate'] = 5;
                            $is_price = true;
                        }
                        if($is_price){
                            // 查询竞拍时的单价（用户竞拍最高价格即是正确价格）
                            $sql = $dsql->SetQuery("select price_avg from `#@__paimai_order_record` where `pid`={$v['proid']} and `uid`={$v['userid']} order by price_avg desc limit 1");
                            $price_avg = (int)$dsql->getOne($sql);
                            $price = $v['success_num'] * $price_avg;  // 应该支付的金额
                            $list[$k]['product']['money'] = (int)$price;
                        }
                    }
                }elseif($v['type']=="pai"){
                    if($v['orderstate']==1){  // 已付款状态（待发货）
                        $list[$k]['orderstate']=6;
                    }
                }
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 一个订单的详情（用户与商家均可查看）
     */
    public function orderDetail(){
        // 查看订单状态等信息
        global $dsql;
        $orderDetail = array();
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => '请先登录！');
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT o.*,l.`title`,l.`litpic`,l.`jy_type`, s.`id` as sid,m.`company`,b.`title` btitle,s.`id` sid,l.`startdate`,l.`enddate`,l.`pay_limit`,l.`cur_mon_start` FROM `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid` = l.`id` LEFT JOIN `#@__paimai_store` s ON l.`sid` = s.`id` LEFT JOIN `#@__member` m ON m.`id` = s.`uid` LEFT JOIN `#@__business_list` b ON b.`uid` = m.`id` WHERE (o.`userid` = '$userid' OR s.`uid` = '$userid') AND o.`id` = " . $id);
        $res = $dsql->dsqlOper($archives,"results");
        $time = time();
        if(is_array($res)){
            foreach ($res as $k=>$v){
                $orderDetail['id'] = (int)$v['id'];
                $orderDetail['type'] = $v['type'];
                $orderDetail['userid'] = (int)$v['userid'];
                $orderDetail['proid'] = (int)$v['proid'];
                $orderDetail['ordernum'] = $v['ordernum'];
                $orderDetail['orderdate'] = (int)$v['orderdate'];
                $orderDetail['procount'] = (int)$v['procount'];
                $orderDetail['amount'] = (int)$v['amount'];
                $orderDetail['paydate'] = (int)$v['paydate'];
                $orderDetail['paytype'] = getPaymentName($v['paytype']);
                $orderDetail['orderstate'] = (int)$v['orderstate'];
                $orderDetail['paistate'] = (int)$v['paistate'];
                $orderDetail['success_num'] = (int)$v['success_num'];
                // 获取用户最高出价
                $sqlMax = $dsql->SetQuery("select max(price_avg) max_price from `#@__paimai_order_record` where pid = {$v["proid"]} and uid={$v["userid"]}");
                $orderDetail["price_max"] = (int)$dsql->getOne($sqlMax);

                //快递公司&单号
                $wuliu = array();
                $wuliu["expCompany"] = $v["exp-company"];
                $wuliu["expNumber"]  = $v["exp-number"];
                $wuliu["expDate"]    = $v["exp-date"];
                $wuliu["userAddr"]    = aesDecrypt($v["useraddr"]);
                $wuliu["userName"]    = aesDecrypt($v["username"]);
                $wuliu["userContact"]    = aesDecrypt($v["usercontact"]);
                $wuliu["userNote"]    = $v["usernote"];
                $orderDetail['wuliu'] = $wuliu;
                // 用户信息
                $orderDetail['member'] = getMemberDetail($v['userid']);
                // 商品信息
                $product = array();
                $product['proid'] = (int)$v['proid'];
                $product['litpic'] = getFilePath($v['litpic']);
                $product['title'] = $v['title'];
                $product['startdate'] = (int)$v['startdate'];
                $product['enddate'] = (int)$v['enddate'];
                $product['pay_limit'] = (int)$v['pay_limit'];
                $product['jy_type'] = (int)$v['jy_type'];
                $product['money'] = (int)$v['cur_mon_start'];
                $param                        = array(
                    "service"  => "paimai",
                    "template" => "detail",
                    "id"       => $v['proid']
                );
                $commonUrlParam = getUrlPath($param);
                $product['url'] = $commonUrlParam;
                if($v['type']=="regist"){
                    $product['bao_money'] = (int)$v['amount'];
                }else{
                    // 查询保证金订单
                    $sql = $dsql->SetQuery("select amount from `#@__paimai_order` where proid={$v['proid']} and userid={$v['userid']} and `type`='regist' and paistate>0");
                    $product['bao_money'] = (int)$dsql->getOne($sql);
                }
                $product['url'] = $commonUrlParam;
                $orderDetail['product'] = $product;
                // 商家信息
                $store = array();
                $store['company'] = $v['btitle']?$v['btitle']:$v['company'];
                $store['sid'] = (int)$v['sid'];
                $param = array(
                    "service" => "paimai",
                    "template" => "store",
                    "id" => $v['proid']
                );
                $store['url'] = getUrlPath($param);
                $orderDetail['store'] = $store;
                // 计算是否可以拍卖下单
                if($v['type']=="regist" && $v['orderstate']!=5 && $v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)>$time){
                    $orderDetail["buy_product"] = true;
                }else{
                    $orderDetail["buy_product"] = false;
                }
                // 改写状态
                if($v['type']=="regist"){
                    if($v['orderstate']==1){  // 保证金状态，如果待补款则为7，如果违约则为5
                        $is_price = false;
                        if($v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)>$time){
                            $orderDetail['orderstate'] = 7;
                            $is_price = true;
                        }
                        elseif($v['success_num']>0 && ($v['enddate']+$v['pay_limit']*3600)<$time){
                            $orderDetail['orderstate'] = 5;
                            $is_price = true;
                        }
                        if($is_price){
                            // 查询竞拍时的单价（用户竞拍最高价格即是正确价格）
                            $sql = $dsql->SetQuery("select price_avg from `#@__paimai_order_record` where `pid`={$v['proid']} and `uid`={$v['userid']} order by price_avg desc limit 1");
                            $price_avg = (int)$dsql->getOne($sql);
                            $price = $v['success_num'] * $price_avg;  // 应该支付的金额
                            $orderDetail['product']['money'] = $price;
                        }
                    }
                }elseif($v['type']=="pai"){
                    if($v['orderstate']==1){  // 已付款状态（待发货）
                        $orderDetail['orderstate']=6;
                    }
                }
            }
        }
        return $orderDetail;
    }

    /**
     * 删除订单 ( 只可以删除未成功付款的订单，其他不可删除）
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

        $archives = $dsql->SetQuery("SELECT * FROM `#@__paimai_order` WHERE `id` = " . $id);
        $results  = $dsql->getArr($archives);
        if ($results) {
            if ($results['userid'] == $uid) {

                if ($results['orderstate'] == 0 || $results['orderstate'] == 2) {
                    $archives = $dsql->SetQuery("DELETE FROM `#@__paimai_order` WHERE `id` = " . $id);
                    $ret1 = $dsql->dsqlOper($archives, "update");
                    if($ret1=="ok"){
                        return array("state" => 100, "info" => '删除成功！');
                    }else{
                        return array("state"=>101,"info"=>"系统繁忙");
                    }
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
     * 通过订单编号、取得应该支付金额，并校验余额是否充足
     */
    public function checkPayAmount()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        $param  = $this->param;
        $userDetail = $userLogin->getMemberInfo();
        if ($userDetail['is_staff'] == 1) {
            return array("state" => 200, "info" => "员工账号不可以下单，如需购买请使用普通账号提交！");  //格式错误
        }
        if ($userid <0) return array("state" => 200, "info" => "登录超时，请登录后重试！");
        //订单状态验证
        $payCheck = $this->payCheck();
        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);
        $ordernum   = $param['ordernum'];    //订单号
        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        //查询应该支付的金额
        $archives   = $dsql->SetQuery("SELECT `amount` FROM `#@__paimai_order` WHERE `ordernum` = '$ordernum'");
        $results    = $dsql->dsqlOper($archives, "results");
        $res        = $results[0];
        $totalPrice = $res['amount'];
        $useTotal = 0;
        //判断是否使用余额，并且验证余额和支付密码
        if ($param['paytype']=="money") {
            //支付密码
            $paypwd     = $param['paypwd'];
            if (empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");
            //查询会员余额
            $usermoney = $userDetail['money'];
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if ($res['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");
            //验证余额
            if ($usermoney < $totalPrice) return array("state" => 200, "info" => "您的余额不足，支付失败！");
        }
        //返回需要支付的费用（返回总数）
        return sprintf("%.2f", $totalPrice - $useTotal);
    }

    /**
     * 支付，如果使用余额则直接成功并重定向到订单页面，否则调用第三方支付
     * @return array
     */
    public function pay(){
        global $dsql;
        global $userLogin;
        $param = $this->param;
        // start 特殊处理
        if($param['newOrder']){  // 从保证金订单，直接生成一个拍卖交易订单
            // 查询保证金订单相关内容
            // 查询保证金订单
            $sql = $dsql->SetQuery("select `proid` from `#@__paimai_order` where ordernum = '{$param['ordernum']}'");
            $proid = (int)$dsql->getOne($sql);
            $param['id'] = $proid;
            $param['type'] = "pai";
            $this->param = $param;
            return $this->deal();
        }
        // 特殊处理 end
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
        if (is_array($payTotalAmount)) {  // 说明失败
            return $payTotalAmount;   // 返回失败信息
        }
        $ordernum     = $param['ordernum'];
        $paytype      = $param['paytype'];
        // 查询订单信息
        $archives = $dsql->SetQuery("SELECT o.`id`,o.`userid`,o.`type`,l.`title` FROM `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` WHERE `ordernum` = '$ordernum'");
        $results  = $dsql->dsqlOper($archives, "results");
        $res      = $results[0];
        // 商品标题
        $title    = $res['title'];
        // 订单标题
        $info = "拍卖消费";
        if($res['type']=="regist"){
            $info = "拍卖报名：".$title;
        }
        elseif($res['type']=="pai"){
            $info = "拍卖交易：".$title;
        }
        // 支付后跳转页面
        $urlParam = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "orderdetail-paimai",
            "id"       => $res['id']
        );
        $ser_urlParam = serialize($urlParam);
        $url   = getUrlPath($urlParam);
        if($paytype=="money"){
            $userid   = $res['userid'];   //购买用户ID
            $time = time();
            // 扣除余额
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$payTotalAmount' WHERE `id` = '$userid'");
            $up1 = $dsql->dsqlOper($archives, "update");
            $user = $userLogin->getMemberInfo($userid);  // 获取账户信息
            $usermoney = $user['money'];
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$payTotalAmount', '$info', '$time','paimai','xiaofei','$ser_urlParam','$title','$ordernum','$usermoney')");
            $up2 = $dsql->dsqlOper($archives, "update");

            $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `paytype`= 'money', `amount` = '$payTotalAmount', `state` = 1 WHERE `ordernum` = '" . $ordernum . "' AND `ordertype` = 'paimai' AND `uid` = " . $userid);
            $dsql->dsqlOper($sql, 'update');

            //执行支付成功的操作
            $this->param = array(
                "paytype"  => $paytype,
                "ordernum" => $ordernum
            );
            $this->paySuccess();  // 一些通用完成操作

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
            return $url;
        }else{
            //跳转至第三方支付页面
            if($paytype==""){
                // 查找pay_log表，从param_data中取出order对象
                $orderSql = $dsql->SetQuery("select l.`param_data`,o.`orderdate` from `#@__pay_log` l,`#@__paimai_order` o where l.`ordernum`=o.`ordernum` and o.`ordernum`={$param['ordernum']}");
                $orderParam = $dsql->getArr($orderSql);
                if($orderParam){
                    $order = unserialize($orderParam['param_data']);
                    $order['timeout'] = $orderParam['orderdate'];
                    return $order;
                }else{
                    return array("state"=>200,"info"=>"缺少支付方式");
                }
            }
            return createPayForm("paimai", $ordernum, $payTotalAmount, $paytype, $info,$urlParam);
        }

    }

    /**
     * 通过订单号、验证当前订单状态、商品状态、商家状态等
     * @return array
     */
    public function payCheck(){
        global $dsql;
        global $userLogin;

        $param    = $this->param;
        $ordernum = $param['ordernum'];
        if (empty($ordernum)) return array("state" => 200, "info" => "订单号传递失败！");
        $userid = $userLogin->getMemberID();
        // 获取订单内容
        $archives    = $dsql->SetQuery("SELECT `proid`, `procount`, `amount`, `orderstate`,`type` FROM `#@__paimai_order` WHERE `ordernum` = '$ordernum' AND `userid` = $userid");
        $orderDetail = $dsql->dsqlOper($archives, "results");
        if (is_array($orderDetail) && is_array($orderDetail[0])) {
            $proid      = $orderDetail[0]['proid'];
            $procount   = $orderDetail[0]['procount'];
            $amount = $orderDetail[0]['amount'];
            $orderstate = $orderDetail[0]['orderstate'];
            $ordertype  = $orderDetail[0]['type'];
            if($orderstate==1){
                return array("state" => 200, "info" => "该订单已支付！");
            }
            // 验证订单状态是否为未支付（0）
            if($orderstate!=0){
                return array("state"=>200,"info"=>"订单状态异常");
            }
            $this->param = $proid;
            $proDetail   = $this->detail();
            //验证是否为自己的店铺
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__paimai_store` WHERE `uid` = $userid");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                if ($proDetail['store']['sid'] == $ret[0]['id']) {
                    return array("state" => 200, "info" => "企业会员不得购买自己店铺的商品！");
                }
            }
            // 同一个商品是否已存在成功订单
            $sql2 = $dsql->SetQuery("select id from `#@__paimai_order` where `userid`=$userid and `proid`=$proid and `type`='$ordertype' and `orderstate`=1");
            $exist = $dsql->getOne($sql2);
            if ($exist) {
                return array("state" => 200, "info" => "已存在成功订单，不可再次支付");
            }
        } else {  //商品不存在
            return array("state" => 200, "info" => "请确认后重试！");
        }
        return "ok";
    }

    /**
     * 支付成功
     * 此处进行支付成功后的操作，例如发送短信等服务
     *
     */
    public function paySuccess(){
        $param = $this->param;
        if (!empty($param)) {
            global $dsql;
            global $userLogin;
            global $cfg_paimaiFee;  // 商家结算佣金
            global $cfg_fzpaimaiFee; // 分站管理员佣金
            $time = GetMkTime(time());
            $paytype  = $param['paytype'];
            $ordernum = $param['ordernum'];
            $date     = GetMkTime(time());
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT o.*,s.`shopFee`,s.`uid`,s.`cityid` from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` WHERE o.`ordernum` = '$ordernum'");
            $res      = $dsql->dsqlOper($archives, "results");
            // 更新内容
            if ($res) {
                $paydate     = $res[0]['paydate'];
                if ($paydate == 0) {  // 说明是新记录
                    //1. 更新订单状态
                    $archives = $dsql->SetQuery("UPDATE `#@__paimai_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                    //2. 如果是拍卖交易成功，则返回保证金，更新订单状态、更新商品状态
                    if($res[0]['type']=="pai"){
                        // 查询保证金订单
                        $sql = $dsql->SetQuery("select amount,id,userid,ordernum,orderstate,paytype from `#@__paimai_order` where proid={$res[0]['proid']} and userid={$res[0]['userid']} and `type`='regist' and paistate=2");
                        $arr = $dsql->getArr($sql);
                        if($arr['orderstate']!=5){  // 校验是否已退款
                            // 立即退还保证金
                            if($arr['amount']>0){
                                if($arr['paytype']=="huoniao_bonus"){
                                    $sql = $dsql->SetQuery("update `#@__member` set `bonus`= `bonus`+{$arr['amount']} where `id`={$arr['userid']}");
                                    $up = $dsql->dsqlOper($sql,"update");
                                    // 添加日志到消费金表中
                                    $urlParam = array(
                                        "service"  => "member",
                                        "type"     => "user",
                                        "template" => "orderdetail-paimai",
                                        "id"       => $res[0]['proid']
                                    );
                                    $ser_urlParam = serialize($urlParam);

                                    $user = $userLogin->getMemberInfo($arr['userid']);
                                    $balance = $user['bonus'];

                                    $sql = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`montype`,`ctype`,`ordertype`,`param`,`ordernum`,`balance`) VALUES ('{$arr['userid']}', '1', '{$arr['amount']}', '商品拍卖保证金退还{$arr['ordernum']}', '$time','0','tuikuan','paimai','$ser_urlParam','{$arr['ordernum']}','$balance')");
                                    $up = $dsql->dsqlOper($sql,"update");
                                }else{
                                    $sql = $dsql->SetQuery("update `#@__member` set `money`= `money`+{$arr['amount']} where `id`={$arr['userid']}");
                                    $up = $dsql->dsqlOper($sql,"update");
                                    // 添加退还记录到余额表中
                                    $urlParam = array(
                                        "service"  => "member",
                                        "type"     => "user",
                                        "template" => "orderdetail-paimai",
                                        "id"       => $res[0]['proid']
                                    );
                                    $ser_urlParam = serialize($urlParam);
                                    $sql = $dsql->SetQuery("select money from `#@__member` where id={$arr['userid']}");
                                    $umoney = (float)$dsql->getOne($sql);  // 新的余额
                                    $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`balance`) VALUES ('{$arr['userid']}', '1', '{$arr['amount']}', '商品拍卖保证金退还{$arr['ordernum']}', '$time','paimai','tuikuan','$ser_urlParam','{$arr['ordernum']}','$umoney')");
                                    $up = $dsql->dsqlOper($sql,"update");
                                }
                            }
                            // 更新保证金订单状态为退款(5)，竞拍状态为已完成（3）
                            $sql = $dsql->SetQuery("update `#@__paimai_order` set orderstate=5,paistate=3 where id={$arr['id']}");
                            $up = $dsql->dsqlOper($sql,"update");
                        }
                        // 把商品状态更新为交易成功(4)，记录购买数量
                        $sql = $dsql->SetQuery("update `#@__paimailist` set arcrank=4,buy_num=buy_num+{$res[0]['procount']} where id={$res[0]['proid']}");
                        $up = $dsql->dsqlOper($sql,"update");

                        $amount = $res[0]['amount'];  // 产品总金额
                        $shopFee = $res[0]['shopFee'];
                        $fee = empty($shopFee) ? $cfg_paimaiFee : $shopFee; // 如果未单独设置商家佣金，则取模块设置数
                        $shopMoney = sprintf('%.2f',($amount * (100-$fee)/100)); // 商家应得总金额
                        $fxMoney = $amount-$shopMoney;  // 提取的佣金总额（包含分站和总站）

                        // 把商家应得的钱加给商家，并且添加记录
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$shopMoney' WHERE `id` = '{$res[0]['uid']}'");
                        $dsql->dsqlOper($archives, "update");

                        $sql = $dsql->SetQuery("select money from `#@__member` where id={$res[0]['uid']}");
                        $umoney = (float)$dsql->getOne($sql);  // 新的余额
                        $urlParam = array(
                            "service"  => "paimai",
                            "template" => "detail",
                            "id"       => $res[0]['proid']
                        );
                        $ser_urlParam = serialize($urlParam);
                        $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`balance`) VALUES ('{$res[0]['uid']}', '1', '$shopMoney', '商品拍卖收入{$res[0]['ordernum']}', '$time','paimai','shangpinxiaoshou','$ser_urlParam','{$res[0]['ordernum']}','$umoney')");
                        $up = $dsql->dsqlOper($sql,"update");
                        // 校验总佣金，计算平台佣金与总站佣金
                        if($fxMoney!=0){
                            $fzMoney = sprintf('%.2f',($fxMoney * (100-$cfg_fzpaimaiFee)/100)); // 平台金额
                            $ptMoney = $fxMoney - $fzMoney;  // 总站金额

                            // 增加分站余额
                            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fzMoney' WHERE `cid` = '{$res[0]['cityid']}'");
                            $dsql->dsqlOper($fzarchives, "update");
                            //保存操作日志平台
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$res[0]['uid']}', '1', '$amount', '商品拍卖交易收入：{$res[0]['ordernum']}', '$time','{$res[0]['cityid']}','$fzMoney','paimai',$ptMoney,'1','shangpinxiaoshou','{$res[0]['ordernum']}')");
                            $lastid = $dsql->dsqlOper($archives, "lastid");
                            substationAmount($lastid,$res[0]['cityid']);
                        }
                    }
                    // 3.存在一个成功支付时，自动删除该用户、同产品，且状态属于：未支付、或过期的订单
                    $sql = $dsql->SetQuery("delete from `#@__paimai_order` where userid={$res[0]['userid']} and proid={$res[0]['proid']} and orderstate in(0,2)");
                    $up3 = $dsql->update($sql);
                }
            }
        }
    }

    /**
     * 商家发货
     */
    public function delivery(){
        global $dsql;
        global $userLogin;
        //获取用户ID（商家）
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $id      = $this->param['id'];       // 订单ID
        if(empty($id)){
            return array("state"=>200,"info"=>"缺少订单ID");
        }

        // 查询订单的发货类型， 如果是平台交易，则需要发货，否则直接成功
        $sql = $dsql->SetQuery("select l.*,o.`ordernum`,o.`orderstate`,o.`userid`,o.`type` from `#@__paimai_order` o LEFT JOIN `#@__paimailist` l ON o.`proid`=l.`id` LEFT JOIN `#@__paimai_store` s ON l.`sid`=s.`id` where o.id=$id and s.`uid`=$uid");
        $arr = $dsql->getArr($sql);
        if(empty($arr)){
            return array("state"=>200,"info"=>"订单不存在");
        }
        if($arr['orderstate']!=1){
            return array("state"=>200,"info"=>"订单状态异常，不可执行发货操作");
        }
        if($arr['type']!="pai"){
            return array("state"=>200,"info"=>"不是交易类型的订单，操作无效");
        }
        $jy_type = $arr['jy_type'];
        $time = time();
        if($jy_type==0){
            // 线上交易，发快递
            $company = $this->param['company'];  // 快递公司
            $number  = $this->param['number'];   // 快递单号
            if (empty($company) || empty($number)) return array("state" => 200, "info" => '数据不完整，请检查！');
            // 把快递信息更新到表中即可
            $sql = $dsql->SetQuery("UPDATE `#@__paimai_order` SET `orderstate` = 3, `exp-company` = '$company', `exp-number` = '$number', `exp-date` = '$time' WHERE `id` = " . $id);
            $up = $dsql->dsqlOper($sql, "update");
            // 通知买家已发货
            $userid   = $arr['userid'];
            $ordernum = $arr['ordernum'];
            $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
            $ret      = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
            }
            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "paimai",
                "id"       => $id
            );
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
        }else{
            // 线下交易，记录发货时间即可
            $sql = $dsql->SetQuery("UPDATE `#@__paimai_order` SET `orderstate` = 3, `exp-date` = '$time' WHERE `id` = " . $id);
            $up = $dsql->dsqlOper($sql, "update");
            // 线下交易发货，暂无通知
        }
        return "操作成功！";
    }

    /**
     * 买家确认收货
     */
    public function receipt(){
        global $dsql;
        global $userLogin;
        global $siteCityInfo;
        global $cfg_paimaiFee;  // 商家结算佣金
        global $cfg_fzpaimaiFee; // 分站管理员佣金
        $id = $this->param['id'];
        if (empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');
        //获取用户ID（买家）
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        // 查询订单状态
        $sql = $dsql->SetQuery("select o.* from `#@__paimai_order` o where o.`id`=$id and o.`userid`=$uid");
        $arr = $dsql->getArr($sql);
        if(empty($arr)){
            return array("state"=>200,"info"=>"订单不存在");
        }
        if($arr['orderstate']!=3){  // 发货的状态下才可以收货
            return array("state"=>200,"info"=>"订单状态异常。");
        }

        // 更新订单为已完成状态（4）
        $sql = $dsql->SetQuery("update `#@__paimai_order` set `orderstate`=4 where `id`=$id and `userid`=$uid");
        $up = $dsql->dsqlOper($sql, "update");
        return "操作成功！";
    }

    /**
     * 指定商品的出价列表
     */
    public function prList(){

        global $dsql;
        $id = $this->param['id'];
        $page = $this->param['page'];
        $pageSize = $this->param['pageSize'];
        $page = $page ? $page : 1;
        $pageSize = $pageSize ? $pageSize : 10;
        if(empty($id)){
            return array("state"=>200,"info"=>"参数错误");
        }
        // 订单的paistate
        $sql = $dsql->SetQuery("SELECT m.`id` uid,m.`nickname`,o.`procount`,r.`price_avg` price_avg,r.`date` FROM `#@__paimai_order` o INNER JOIN `#@__paimai_order_record` r  ON o.`proid` = r.`pid` and o.`userid`=r.`uid` LEFT JOIN `#@__member` m ON r.`uid`=m.`id` where o.proid = {$id} and o.`paistate`!=0 group by r.`id` order by price_avg desc,`date` asc");

        return $dsql->getPage($page,$pageSize,$sql);
    }

    /**
     * 公共方法、终止拍卖
     */
    public function stopPaiMai($ret){
        global $dsql;
        $time = time();
        // 遍历每一个拍卖（拍卖列表，二维数组，至少存在 `id`, `maxnum`, `min_money` 三个字段
        foreach ($ret as $k=>$v){

            // 2.获取该拍卖出价信息
            $userSql = $dsql->SetQuery("SELECT r.`uid`,o.`procount`,o.`id`,o.`ordernum`,o.`amount`,max(r.`price_avg`) price_avg FROM `#@__paimai_order` o INNER JOIN `#@__paimai_order_record` r  ON o.`proid` = r.`pid` and o.`userid`=r.`uid` where o.proid = {$v['id']} and o.`paistate`!=0 group by r.`uid` order by price_avg desc limit ${v['maxnum']}");
            $res = $dsql->getArrList($userSql);
            // 3.计算拍卖结果
            $kc = $v['maxnum'];  // 库存
            $zber = 0;   // 中标人数
            // 如果有下单者，且中标，逐个分发
            $zusers = array();
            foreach ($res as $kev => $value){
                // 依次取出每个用户出价信息
                $avg_money = (int)$value['price_avg']; // 每个出价
                if($avg_money<$v['min_money']){
                    break;  // 小于保留价格
                }
                $unum = (int)$value['procount'];  // 应该分配数量
                // 如果库存大于中标数，则该用户全部中标，减少库存
                if($kc >= $unum){
                    $kc -= $unum;
                    // 更新中标数
                    $sql = $dsql->SetQuery("update `#@__paimai_order` set `success_num`= {$unum},`paistate`=2 where `proid`={$v['id']} and `userid`={$value['uid']} and  `type`='regist'");
                    $up = $dsql->dsqlOper($sql,"update");
                    // 记录中标用户
                    array_push($zusers,$value['uid']);

                    //查询拍卖商品信息
                    $sql = $dsql->SetQuery("select `title` from `#@__paimai_list` where `id` = " . $v['id']);
                    $title = $dsql->getOne($sql);

                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "paimai",
                        "id"       => $value['id']
                    );

                    //获取会员名
                    $username = "";
                    $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = " . $value['uid']);
                    $ret      = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    }

                    //自定义配置
                    $config = array(
                        "username" => $username,
                        "order"    => $value['ordernum'],
                        "amount"   => $value['amount'],
                        "title"    => $title,
                        "fields"   => array(
                            'keyword1' => '商品信息',
                            'keyword2' => '付款时间',
                            'keyword3' => '订单金额',
                            'keyword4' => '订单状态'
                        )
                    );

                    // 通知该用户尽快下单
                    updateMemberNotice($value['uid'], "会员-订单支付成功", $paramUser, $config, '', '', 0, 1);
                }
                // 没有库存了
                elseif($kc==0){
                    break;
                }
                // 0 < 库存 < 中标数， 把剩余库存全部给这个用户
                else{
                    $unum = $kc;
                    $kc = 0;   // 库存置空
                    // 更新中标数
                    $sql = $dsql->SetQuery("update `#@__paimai_order` set `success_num`= $unum,`paistate`=2 where `proid`={$v['id']} and `userid`={$value['uid']} and `type`='regist'");
                    $up = $dsql->dsqlOper($sql,"update");
                    // 记录中标用户
                    array_push($zusers,$value['uid']);
                    // 通知用户中拍，尽快下单
                }
                // 只要不是break，说明中标人数+1
                $zber += 1;
            }
            // 4. 返还竞拍未成功者的保证金，竞拍成功者在规定时间内付款完成后立刻返还
            $sql = $dsql->SetQuery("select o.`userid`,o.`amount`,o.`ordernum`,m.`money` umoney,m.`bonus` 'ubonus',o.`paytype` from `#@__paimai_order` o LEFT JOIN `#@__member` m ON m.`id`=o.`userid` where o.`proid`={$v['id']} and o.`orderstate`=1 and o.`type`='regist'");
            $regs = $dsql->getArrList($sql);
            foreach ($regs as $key=>$value){
                $regs_uid = $value['userid'];
                if(in_array($regs_uid,$zusers)){
                    continue;  //排除中标用户，中标用户不会定时返回保证金，在支付订单后才返回
                }
                // 给每个用户退款到余额中
                if($value['amount']>0){
                    // 根据不同的支付方式原路退还（消费金返回至消费金，其他方式退到余额中）
                    if($value['paytype']=="huoniao_bonus"){
                        $sql = $dsql->SetQuery("update `#@__member` set `bonus`= `bonus`+{$value['amount']} where `id`={$regs_uid}");
                        $up = $dsql->dsqlOper($sql,"update");
                        // 添加日志到消费金表中
                        $urlParam = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail-paimai",
                            "id"       => $v['id']
                        );
                        $ser_urlParam = serialize($urlParam);
                        $balance = (float)$value['ubonus']+(float)$value['amount'];
                        $sql = $dsql->SetQuery("INSERT INTO `#@__member_bonus` (`userid`, `type`, `amount`, `info`, `date`,`montype`,`ctype`,`ordertype`,`param`,`ordernum`,`balance`) VALUES ('{$value['userid']}', '1', '{$value['amount']}', '商品拍卖保证金退还{$value['ordernum']}', '$time','0','tuikuan','paimai','$ser_urlParam','{$value['ordernum']}','$balance')");
                        $up = $dsql->dsqlOper($sql,"update");
                    }else{
                        $sql = $dsql->SetQuery("update `#@__member` set `money`= `money`+{$value['amount']} where `id`={$regs_uid}");
                        $up = $dsql->dsqlOper($sql,"update");
                        // 添加日志到余额表中
                        $urlParam = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail-paimai",
                            "id"       => $v['id']
                        );
                        $ser_urlParam = serialize($urlParam);
                        $balance = (float)$value['umoney']+(float)$value['amount'];
                        $sql = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`balance`) VALUES ('{$value['userid']}', '1', '{$value['amount']}', '商品拍卖保证金退还{$value['ordernum']}', '$time','paimai','tuikuan','$ser_urlParam','{$value['ordernum']}','$balance')");
                        $up = $dsql->dsqlOper($sql,"update");
                    }
                }
                // 更新该用户订单表状态为已退款
                $sql = $dsql->SetQuery("update `#@__paimai_order` o set `orderstate`= 5 where o.`proid`={$v['id']} and o.`orderstate`=1 and o.`type`='regist' and o.`userid`={$value['userid']}");
                $up = $dsql->dsqlOper($sql,"update");
            }

            // 5.更新该拍卖状态为，更新结束时间为实际结束时间
            if ($zber <= 0){  // 无人中标的情况下
                // 状态为拍卖失败
                $sql = $dsql->SetQuery("update `#@__paimailist` set arcrank = 5,enddate=$time where `id`={$v['id']}");
            }else{  // 记录售出数量
                $sale_num = $v['maxnum'] - $kc;
                $sql = $dsql->SetQuery("update `#@__paimailist` set arcrank = 3,sale_num=$sale_num,enddate=$time where `id`={$v['id']}");
            }
            $ret2 = $dsql->dsqlOper($sql,"update");
            // 6.通知商家，该拍卖已结束
        }
        return 1;  // 表示已正常执行
    }

}