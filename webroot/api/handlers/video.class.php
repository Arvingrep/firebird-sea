<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 视频模块API接口
 *
 * @version        $Id: video.class.php 2017-1-18 上午11:17:20 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class video
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
     * 新闻基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/video.inc.php");

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
        // global $submission;               //投稿邮箱
        // global $customAtlasMax;           //图集数量限制
        // global $customTemplate;           //模板风格
        //
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

        // $domainInfo = getDomain('video', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('video', $customSubDomain);

        //分站自定义配置
        $ser = 'video';
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

        $return = array();
        if (!empty($params) > 0) {

            foreach ($params as $key => $param) {
                if ($param == "channelName") {
                    $return['channelName'] = str_replace('$city', $cityName, $customChannelName);
                } elseif ($param == "logoUrl") {

                    //自定义LOGO
                    if ($customLogo == 1) {
                        $customLogoPath = getAttachemntFile($customLogoUrl);
                    } else {
                        $customLogoPath = getAttachemntFile($cfg_weblogo);
                    }

                    $return['logoUrl'] = $customLogoPath;
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
                } elseif ($param == "listRule") {
                    $return['listRule'] = $custom_listRule;
                } elseif ($param == "detailRule") {
                    $return['detailRule'] = $custom_detailRule;
                }
            }

        } else {

            //自定义LOGO
            if ($customLogo == 1) {
                $customLogoPath = getAttachemntFile($customLogoUrl);
            } else {
                $customLogoPath = getAttachemntFile($cfg_weblogo);
            }

            $return['channelName']   = str_replace('$city', $cityName, $customChannelName);
            $return['logoUrl']       = $customLogoPath;
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
            $return['listRule']      = $custom_listRule;
            $return['detailRule']    = $custom_detailRule;
        }

        return $return;

    }


    /**
     * 视频分类
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
        $results = $dsql->getTypeList($type, "videotype", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }


    /**
     * 视频分类详细信息
     * @return array
     */
    public function typeDetail()
    {
        global $dsql;
        $typeDetail = array();
        $typeid     = $this->param;
        $archives   = $dsql->SetQuery("SELECT `id`, `typename`, `seotitle`, `keywords`, `description` FROM `#@__videotype` WHERE `id` = " . $typeid);
        $results    = $dsql->dsqlOper($archives, "results");
        if ($results && is_array($results)) {
            $param             = array(
                "service" => "video",
                "template" => "list",
                "typeid" => $typeid
            );
            $results[0]["url"] = getUrlPath($param);
            return $results;
        }
    }


    /**
     * 视频列表
     * @return array
     */
    public function alist()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $typeid   = $title = $flag = $thumb = $orderby = $u = $state = $group_img = $page = $pageSize = $where = $where1 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid    = $this->param['typeid'];
                $title     = $this->param['title'];
                $flag      = $this->param['flag'];
                $album     = $this->param['album'];
                $thumb     = $this->param['thumb'];
                $orderby   = $this->param['orderby'];
                $u         = $this->param['u'];
                $state     = $this->param['state'];
                $group_img = $this->param['group_img'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
                $lnglat    = $this->param['lnglat'];
                $tongcheng = $this->param['tongcheng'];
                $userid    = $this->param['userid'];
            }
        }

        //数据共享
        require(HUONIAOINC."/config/video.inc.php");
        $dataShare = (int)$customDataShare;

        if(!$dataShare && $album ==''){
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where .= " AND `cityid` = " . $cityid;
            }
        }

        //是否输出当前登录会员的信息
        if ($u != 1) {
            $where .= " AND l.`arcrank` = 1";
        } else {
            $uid   = $userLogin->getMemberID();
            $where .= " AND l.`admin` = " . $uid;

            if ($state != "") {
                $where1 = " AND l.`arcrank` = " . $state;
            }
        }

        //遍历分类
        if (!empty($typeid)) {
            if ($dsql->getTypeList($typeid, "videotype")) {
                global $arr_data;
                $arr_data = array();
                $lower    = arr_foreach($dsql->getTypeList($typeid, "videotype"));
                $lower    = $typeid . "," . join(',', $lower);
            } else {
                $lower = $typeid;
            }
            $where .= " AND `typeid` in ($lower)";
        }

        if ($userid) {
            if(!is_numeric($userid)){
                $RenrenCrypt = new RenrenCrypt();
                $userinfo = $RenrenCrypt->php_decrypt(base64_decode($userid));
                $userinfo = explode('&', $userinfo);
                $userid = (int)$userinfo[0];
            }
            if($userid){
                $where .= " AND `admin` = $userid";
            }
        }

        //模糊查询关键字
        if (!empty($title)) {

            //搜索记录
            siteSearchLog("video", $title);

            $title = explode(" ", $title);
            $w     = array();
            foreach ($title as $k => $v) {
                if (!empty($v)) {
                    $w[] = "`title` like '%" . $v . "%' OR `keywords` like '%" . $v . "%'";
                }
            }
            $where .= " AND (" . join(" OR ", $w) . ")";
        }

        //匹配自定义属性
        if (!empty($flag)) {
            $flag = explode(",", $flag);
            $w    = array();
            foreach ($flag as $k => $v) {
                $w[] = "`flag` like '%" . $v . "%'";
            }
            $where .= " AND (" . join(" AND ", $w) . ")";
        }

        if($album ){
            $where .= " AND `album` =".$album;
        }


        //缩略图
        if ($thumb === "0") {
            $where .= " AND `litpic` = ''";
        } elseif ($thumb === "1") {
            $where .= " AND `litpic` != ''";
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
        $order = " ORDER BY `weight` DESC, `id` DESC";
        //发布时间
        if ($orderby == "1") {
            $order = " ORDER BY `pubdate` DESC, `weight` DESC, `id` DESC";
            //浏览量
        } elseif ($orderby == "2") {
            $order = " ORDER BY `click` DESC, `weight` DESC, `id` DESC";
            //今日浏览量
        } elseif ($orderby == "2.1") {
            $order = " AND `pubdate` > $todayk AND `pubdate` < $todaye ORDER BY `click` DESC, `weight` DESC, `id` DESC";
            //昨日浏览量
        } elseif ($orderby == "2.2") {
            $order = " AND `pubdate` > $time1 AND `pubdate` < $time2 ORDER BY `click` DESC, `weight` DESC, `id` DESC";
            //本周浏览量
        } elseif ($orderby == "2.3") {
            $order = " AND `pubdate` > $time3 AND `pubdate` < $time4 ORDER BY `click` DESC, `weight` DESC, `id` DESC";
            //本月浏览量
        } elseif ($orderby == "2.4") {
            $order = " AND `pubdate` > $btime AND `pubdate` < $ovtime ORDER BY `click` DESC, `weight` DESC, `id` DESC";
            //随机
        } elseif ($orderby == "3") {
            $order = " ORDER BY rand()";
        } else if ($orderby == '4') {
            $order = "ORDER BY `distance` ASC ";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archives       = $dsql->SetQuery("SELECT `id` FROM `#@__videolist` l WHERE `del` = 0" . $where);
        // var_dump($archives);die;
        $archives_count = $dsql->SetQuery("SELECT count(`id`) FROM `#@__videolist` l WHERE `del` = 0" . $where);

        //总条数
        $totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
        $totalCount   = (int)$totalResults[0][0];

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

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

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
        }

        if ($tongcheng) {
            $lnglat_  = explode(',', $lnglat);
            $lng_     = $lnglat_[0];
            $lat_     = $lnglat_[1];
            $archives = $dsql->SetQuery("SELECT `id`, `title`, `subtitle`, `typeid`, `flag`, `keywords`, `lng`,`lat`,`description`, `source`, `redirecturl`, `litpic`, `color`, `click`, l.`arcrank`, `pubdate`, `writer`,`videocharge` ,(SELECT COUNT(`id`)  FROM `#@__public_comment_all` WHERE `type` = 'video-detail' AND `pid` = 0 AND `aid` = l.`id` AND `ischeck` = 1) AS total,
FORMAT((
    6371 * acos(
        cos(radians($lat_)) * cos(radians(lat)) * cos(
            radians(lng) - radians($lng_)
        ) + sin(radians($lat_)) * sin(radians(lat))
    )
),2) AS distance
FROM `#@__videolist` l WHERE `del` = 0" . $where);
            $where1   .= " HAVING distance < 30 ";
        } else {
            $archives = $dsql->SetQuery("SELECT `id`, `title`,`videotime`,`subtitle`, `typeid`, `flag`, `keywords`, `lng`,`lat`,`description`, `source`, `redirecturl`, `litpic`, `color`, `click`, l.`arcrank`, `pubdate`, `writer`,`videocharge` ,(SELECT COUNT(`id`)  FROM `#@__public_comment_all` WHERE `type` = 'video-detail' AND `pid` = 0 AND `aid` = l.`id` AND `ischeck` = 1) AS total FROM `#@__videolist` l WHERE `del` = 0" . $where);
        }
        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where1 . $order . $where, "results");

        // echo $archives;

        if ($results) {
            global $cfg_clihost;
            foreach ($results as $key => $val) {
                $flag                   = explode(",", $val['flag']);
                $list[$key]['id']       = $val['id'];
                $list[$key]['title']    = in_array("b", $flag) ? '<strong>' . $val['title'] . '</strong>' : $val['title'];
                $list[$key]['subtitle'] = $val['subtitle'];
                $list[$key]['typeid']   = $val['typeid'];

                global $data;
                $data                   = "";
                $typeArr                = getParentArr("videotype", $val['typeid']);
                $typeArr                = array_reverse(parent_foreach($typeArr, "typename"));
                $list[$key]['typeName'] = $typeArr;

                $list[$key]['flag']        = $val['flag'];
                $list[$key]['keywords']    = $val['keywords'];
                $list[$key]['description'] = $val['description'];
                $list[$key]['source']      = $val['source'];
                $list[$key]['redirecturl'] = $val['redirecturl'];
                $list[$key]['litpic']      = !empty($val['litpic']) ? getFilePath($val['litpic']) : "";


                $list[$key]['color']    = $val['color'];
                $list[$key]['click']    = $val['click'];
                $list[$key]['videourl'] = $val['videourl'];
                $list[$key]['common']   = $val['total'];
                $list[$key]['videocharge'] = $val['videocharge'];

                $list[$key]['is_user'] = 1;
                $list[$key]['user']      = $val['writer'] !=0 ? getMemberDetail($val['writer']): array('username' => '管理员');
//                var_dump($val['admin']);
//                if(count($list[$key]['user']) < 10){
//                    $list[$key]['user'] = array('username' => '管理员');
//                    $list[$key]['is_user'] = 0;
//                }

                // $sql                    = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = {$val['id']} AND `temp` = 'video' ");
                $sql                    = $dsql->SetQuery("SELECT * FROM `#@__public_up_all` WHERE `type` = '0' AND `tid` = {$val['id']} AND `module` = 'video' AND `action` = 'detail' ");
                $ret                    = $dsql->dsqlOper($sql, 'totalCount');
                $list[$key]['zanCount'] = $ret;


                //会员中心显示信息状态
                if ($u == 1 && $userLogin->getMemberID() > -1) {
                    $list[$key]['arcrank'] = $val['arcrank'];
                }

                $list[$key]['is_zan']    = 0;
                $list[$key]['is_follow'] = 0;

                $list[$key]['pubdate']  = $val['pubdate'];
                $list[$key]['pubdate1'] = date("H:i", $val['pubdate']);
                $list[$key]['pubdate2'] = date("m-d", $val['pubdate']);
                $user_id                = $userLogin->getMemberID();
                // $sql                    = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = {$val['id']}  AND `userid` = $user_id  AND `temp` = 'video' ");
                $sql                    = $dsql->SetQuery("SELECT * FROM `#@__public_up_all` WHERE `type` = '0' AND `ruid` = $user_id AND `tid` = {$val['id']} AND `module` = 'video' AND `action` = 'detail' ");
                $ret                    = $dsql->dsqlOper($sql, 'totalCount');
                if ($ret) {
                    $list[$key]['is_zan'] = 1;
                }

                if($val['admin']){
                    $sql = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = {$val['admin']}  AND `userid` = $user_id  AND `temp` = 'video' ");
                    $ret = $dsql->dsqlOper($sql, 'totalCount');
                    if ($ret) {
                        $list[$key]['is_follow'] = 1;
                    }
                }
                if ($lnglat) {

                    $list[$key]['distance_'] = $val['distance'];
                }

                $param                  = array(
                    "service" => "video",
                    "template" => "personal",
                    "id" => $val['writer'],
                );
                $list[$key]['user_url'] = getUrlPath($param);

                $param             = array(
                    "service" => "video",
                    "template" => "detail",
                    "id" => $val['id'],
                    "flag" => $val['flag'],
                    "redirecturl" => $val['redirecturl']
                );
                $list[$key]['url'] = getUrlPath($param);
                $hour     = (int)($val['videotime'] /1000/3600);
                $fenzhong = (int)($val['videotime'] / 1000 / 60 %60);
                $second = $val['videotime'] / 1000 % 60;
                $list[$key]['times'] = $hour.':'.($fenzhong >=10 ? $fenzhong : '0'.$fenzhong). ':'.($second >= 10 ? $second : '0'.$second);

            }
        }else{
            return array("state" => 200, "info" => '暂无数据！');
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 商品列表
     * @return array
     */
    public  function goodlist(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        if (!empty($this->param)) {
            $vid        = $this->param['vid'];
            $pageSize   = $this->param['pageSize'];
            $page       = $this->param['page'];
            if (!$vid) {
                return array("state" => 200, "info" => '格式错误！');
            }

            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;


            $archives = $dsql->SetQuery("SELECT * FROM `#@__video_goods` WHERE `vid` = '" . $vid . "'");
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
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
            $where  = " LIMIT $atpage, $pageSize";

            $results = $dsql->dsqlOper($archives . $where, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['vid']           = $val['vid'];
                    $list[$key]['goodsurl']      = $val['goodsurl'];
                    $list[$key]['gid']           = $val['gid'];
                    $list[$key]['litpic']        = $val['litpic'];
                    $list[$key]['title']         = $val['title'];
                    $list[$key]['price']         = $val['price']!='' ?str_replace("￥",'',$val['price']) : '' ;
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }
    }

    /**
     * 商家列表
     * @return array
     */
    public  function businesslist(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        if (!empty($this->param)) {
            $businessinfo        = $this->param['businessinfo'];
            $pageSize   = $this->param['pageSize'];
            $page       = $this->param['page'];
            if ($businessinfo == '') {
                return array("state" => 200, "info" => '格式错误！');
            }

            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;


            $archives = $dsql->SetQuery("SELECT * FROM `#@__business_list` WHERE find_in_set(`id`,'" . $businessinfo . "')");
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
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
            $where  = " LIMIT $atpage, $pageSize";

            $results = $dsql->dsqlOper($archives . $where, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['id']            = $val['id'];
                    $list[$key]['title']         = $val['title'];
                    $list[$key]['logo']          = $val['logo'];
                    $list[$key]['logopath']      = getFilePath($val['logo']);
                    $param = array(
                        "service"     => "business",
                        "template"    => "detail",
                        "id"          => $val['id']
                    );
                    $list[$key]["url"] = getUrlPath($param);
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }
    }

    /**
     * 专辑列表
     * @return array
     */
    public  function albumlist(){
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        if (!empty($this->param)) {
            $uid        = $this->param['uid'];
            $pageSize   = $this->param['pageSize'];
            $page       = $this->param['page'];
            if (!$uid) {
                return array("state" => 200, "info" => '格式错误！');
            }

            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;


            $archives = $dsql->SetQuery("SELECT * FROM `#@__video_album` WHERE `uid` = '" . $uid . "'");
            //总条数
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
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
            $where  = " LIMIT $atpage, $pageSize";

            $results = $dsql->dsqlOper($archives . $where, "results");
            if ($results) {
                foreach ($results as $key => $val) {
                    $list[$key]['title']            = $val['title'];
                    $list[$key]['uid']              = $val['uid'];
                    $list[$key]['note']             = $val['note'];
                    $list[$key]['litpics']          = $val['litpic'];
                    $list[$key]['litpic']           = getFilePath($val['litpic']);
                    $list[$key]['state']            = $val['state'];
                    $list[$key]['browse']           = $val['browse'];
                    $list[$key]['albumid']          = $val['id'];
                    $list[$key]['pubdate']          = $val['pubdate'];

                    $videosql = $dsql->SetQuery("SELECT `id` FROM `#@__videolist` WHERE  `album` = '".$val['id']."' AND `del` = 0 AND `arcrank` = 1");

                    $videocout = $dsql->dsqlOper($videosql, "totalCount");

                    $list[$key]['videocout']          = $videocout;
                    $param = array(
                        "service" => "video",
                        "template" => "albumlist",
                        "id" => $val['id']
                    );
                    $list[$key]['albumurl']          = getUrlPath($param);
                }
            }
            return array("pageInfo" => $pageinfo, "list" => $list);
        }
    }

    /**
     * 视频信息详细
     * @return array
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        $articleDetail = array();
        $id            = $this->param;
        $id            = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        //功能点：管理员和信息的发布者可以查看所有状态的信息
        $where = "";
        $userid     = $userLogin->getMemberID();
        $userinfo   = $userLogin->getMemberInfo();
        if ($userLogin->getUserID() == -1) {

            $where = " AND `arcrank` = 1 AND `del` = 0";

            //如果没有登录再验证会员是否已经登录
            if ($userLogin->getMemberID() == -1) {
                $where = " AND `arcrank` = 1 AND `del` = 0";
            } else {
                $where = " AND (`arcrank` = 1 AND `del` = 0 OR `admin` = " . $userLogin->getMemberID() . ")";
            }

        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__videolist` WHERE `id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $isWxMiniprogram = isWxMiniprogram();
            $is_android_app = isAndroidApp();

            global $cfg_clihost;
            $articleDetail["id"]           = $results[0]['id'];
            $articleDetail["title"]        = $results[0]['title'];
            $articleDetail["cityid"]       = $results[0]['cityid'];
            $articleDetail["subtitle"]     = $results[0]['subtitle'];
            $articleDetail["flag"]         = $results[0]['flag'];
            $articleDetail["admin"]        = $results[0]['admin'];
            $articleDetail["redirecturl"]  = $results[0]['redirecturl'];
            $articleDetail["litpic"]       = !empty($results[0]['litpic']) ? getFilePath($results[0]['litpic']) : "";
            $articleDetail["litpicSource"] = !empty($results[0]['litpic']) ? $results[0]['litpic'] : "";
            $articleDetail["source"]       = $results[0]['source'];
            $articleDetail["sourceurl"]    = $results[0]['sourceurl'];
            $articleDetail["writer"]       = $results[0]['writer'];
            $articleDetail["typeid"]       = $results[0]['typeid'];
            $videotype                     = $results[0]['videotype'];
            $articleDetail["videocharge"]        = $results[0]['videocharge'];
            $articleDetail["videochargeinfo"]    = $results[0]['videochargeinfo'];
            $articleDetail["businessinfo"]       = $results[0]['businessinfo'];
            $articleDetail["price"]              = $results[0]['price'];
            $articleDetail["album"]              = $results[0]['album'];
            $videourl                      = $results[0]['videourl'];

            if ($results[0]['writer']) {
                $user_ = getMemberDetail($results[0]['writer']);
                $articleDetail["user"] = $user_;
            }else{
                $articleDetail["user"] = 0;
            }

            if ($videotype) {
                if (stripos($videourl, '<iframe') !== false) {
                    $videourl = str_replace("<iframe", "", $videourl);
                    $videourl = str_replace("iframe>", "", $videourl);
                    $videourl = str_replace("</", "", $videourl);
                    $videourl = str_replace(">", "", $videourl);
                    $iframe   = explode(" ", $videourl);
                    foreach ($iframe as $k => $v) {
                        if (stripos($v, 'src') !== false) {
                            $videourl = str_replace("'", "", $v);
                            $videourl = str_replace('"', "", $videourl);
                            $videourl = str_replace("src=", "", $videourl);
                            break;
                        }
                    }
                }
                $videourl = stripslashes($videourl);

                //提取真实播放地址
                $articleDetail["realVideoUrl"] = getRealVideoUrl($videourl);
            } else {
                $videourl = getFilePath($videourl);
            }

            $isWxMiniprogram = isWxMiniprogram();
            if($articleDetail["realVideoUrl"] && ($isWxMiniprogram || $is_android_app)){
                $videourl = $articleDetail["realVideoUrl"];
                $videotype = 0;
            }
            if($videotype && pathinfo($videourl)['extension'] == 'mp4'){
                $videotype = 0;
            }

            $paysql = $dsql ->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `uid` = '".$userid."' AND `state` = 1 AND `ordertype` = 'video'");

            $payres = $dsql->dsqlOper($paysql,"results");

            $payid = array();
            if($payres){
                foreach ($payres as $k=>$v){
                    $bdyarr = unserialize($v['body']);

                    array_push($payid,$bdyarr['aid']);
                }
            }
            $openvideo = 0;
            $videochargearr = array();
            if($results[0]!=''){
                $videochargearr = explode(',',$results[0]['videocharge']);
            }
            if(in_array($id,$payid) && in_array('3',$videochargearr)){
                $openvideo = 1;
            }else{
                if(in_array('1',$videochargearr)){
                    if(in_array($userinfo['level'],explode(',',$results[0]['videochargeinfo']))){
                        $openvideo = 1;
                    }
                }elseif($results[0]['videocharge'] ==0){
                    $openvideo = 1;
                }
            }

            $articleDetail["videotype"] = $videotype;
            $articleDetail["videourl"]  = $openvideo == 1 ?$videourl : '';

            global $data;
            $data                      = "";
            $typeArr                   = getParentArr("videotype", $results[0]['typeid']);
            $typeArr                   = array_reverse(parent_foreach($typeArr, "typename"));
            $articleDetail['typeName'] = $typeArr;

            $param                    = array(
                "service" => "video",
                "template" => "list",
                "typeid" => $results[0]['typeid']
            );
            $articleDetail['typeUrl'] = getUrlPath($param);

            $articleDetail["keywords"]     = str_replace(",", " ", $results[0]['keywords']);
            $articleDetail["keywordsList"] = explode(" ", str_replace(",", " ", $results[0]['keywords']));
            $articleDetail["description"]  = str_replace(array("\r\n", "\r", "\n"), " ", $results[0]['description']);
            $articleDetail["click"]        = $results[0]['click'];
            $articleDetail["color"]        = $results[0]['color'];
            $articleDetail["arcrank"]      = $results[0]['arcrank'];
            $articleDetail["pubdate"]      = $results[0]['pubdate'];
            $user_id                       = $userLogin->getMemberID();
            //是否关注
            $articleDetail['is_follow'] = 0;
            if($results[0]['writer']){
                $sql                        = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = {$results[0]['writer']}  AND `userid` = $user_id  AND `temp` = 'video' ");
                $ret                        = $dsql->dsqlOper($sql, 'totalCount');
                if ($ret) {
                    $articleDetail['is_follow'] = 1;
                }
            }
            //是否点赞
            $articleDetail['is_zan'] = 0;
            // $sql                     = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = {$results[0]['id']}  AND `userid` = $user_id  AND `temp` = 'video' ");
            $sql                    = $dsql->SetQuery("SELECT * FROM `#@__public_up_all` WHERE `type` = '0' AND `ruid` = $user_id AND `tid` = {$results[0]['id']} AND `module` = 'video' AND `action` = 'detail' ");
            $ret                     = $dsql->dsqlOper($sql, 'totalCount');
            if ($ret) {
                $articleDetail['is_zan'] = 1;
            }

            //视频评论
            $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'video-detail' AND `aid` = {$results[0]['id']} AND `pid` = 0");
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            $articleDetail['common'] = $totalCount;

            /* $sql = $dsql->SetQuery("SELECT * FROM `#@__videocommon` WHERE `aid` = {$results[0]['id']} AND `ischeck` = 1 AND `floor` = 0");
            $ret = $dsql->dsqlOper($sql, 'results');
            foreach ($ret as $key => $item) {
                $ret[$key]['user'] = getMemberDetail($item['userid']);
                //$item['id'] 评论id
                $sql_comm_zan          = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = {$item['id']} AND `temp` = 'video_common'");
                $zan_comm_ret          = $dsql->dsqlOper($sql_comm_zan, 'totalCount');
                $ret[$key]['zan_comm'] = $zan_comm_ret;

                //查看自己是否点过赞（评论）
                $sql_comm_zan_is          = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = {$item['id']} AND `temp` = 'video_common' AND `userid` = $user_id");
                $is_zan_comm              = $dsql->dsqlOper($sql_comm_zan_is, 'totalCount');
                $ret[$key]['is_zan_comm'] = $is_zan_comm;

                //回复
                $sql_ = $dsql->SetQuery("SELECT * FROM `#@__videocommon` WHERE `floor` = {$item['id']} AND `ischeck` = 1 AND `aid` = {$results[0]['id']}");
                $ret_ = $dsql->dsqlOper($sql_, 'results');
                foreach ($ret_ as $key_ => $value_) {
                    $ret_[$key_]['user'] = getMemberDetail($value_['userid']);
                }
                $ret[$key]['floor_common'] = $ret_;
            }

            $articleDetail['common_list'] = $ret; */

            //视频总数
			$album = $results[0]['album'];
			$ret = 0;
			if($album){
	            $sql                        = $dsql->SetQuery("SELECT * FROM `#@__videolist` WHERE `album` = '$album'");
	            $ret                        = $dsql->dsqlOper($sql, 'totalCount');
			}
            $articleDetail['albumcount'] = $ret;

			$writer = $results[0]['writer'];
			$ret = $fensi = 0;
			if($writer){
				/*个人视频总数*/
	            $sql                        = $dsql->SetQuery("SELECT * FROM `#@__videolist` WHERE `writer` = '$writer'");
	            $ret                        = $dsql->dsqlOper($sql, 'totalCount');

				//粉丝数
	            $sql                         = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid_b` = {$results[0]['writer']} AND `temp` = 'video' ");
	            $fensi                         = $dsql->dsqlOper($sql, 'totalCount');
			}
            $articleDetail['video_num'] = $ret;
			$articleDetail['follow_num'] = $fensi;

            $param                       = array(
                "service" => "video",
                "template" => "detail",
                "id" => $id
            );
            $articleDetail['url']        = getUrlPath($param);

            /*商品数量*/
            $foodsql = $dsql->SetQuery("SELECT count(`id`) goodsall FROM `#@__video_goods` WHERE `vid` = '".$id."'");
            $foodres = $dsql->dsqlOper($foodsql,"results");

            $articleDetail['foodcount'] = (int)$foodres[0]['goodsall'];

            /*专辑数量*/


        }
        return $articleDetail;
    }


    /**
     * 获取下一条信息内容
     * @return array
     */
    public function nextData()
    {
        global $dsql;
        global $userLogin;
        $articleDetail = array();
        $id            = $this->param['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $sql = $dsql->SetQuery("select `id` from `#@__videolist` where `id` = (select max(`id`) from `#@__videolist` where `id` < $id)");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $this->param = $ret[0]['id'];
            $data        = $this->detail();
            return $data;
        }

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
        $newsid   = $orderby = $page = $pageSize = $where = "";

        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $newsid   = $this->param['newsid'];
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

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__videocommon` WHERE `aid` = " . $newsid . " AND `ischeck` = 1 AND `floor` = 0" . $oby);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
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

                $list[$key]['lower'] = $this->getCommonList($val['id']);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 遍历评论子级
     * @param $fid int 评论ID
     * @return array
     */
    function getCommonList($fid)
    {
        if (empty($fid)) return false;
        global $dsql;
        global $userLogin;

        $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__videocommon` WHERE `floor` = " . $fid . " AND `ischeck` = 1 ORDER BY `id` DESC");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");

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

                    $list[$key]['lower'] = $this->getCommonList($val['id']);
                }
                return $list;
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

        $id = $this->param['id'];
        if (empty($id)) return "请传递评论ID！";
        $memberID = $userLogin->getMemberID();
        if ($memberID == -1 || empty($memberID)) return "请先登录！";

        $archives = $dsql->SetQuery("SELECT `duser` FROM `#@__videocommon` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $duser = $results[0]['duser'];

            //如果此会员已经顶过则return
            $userArr = explode(",", $duser);
            if (in_array($userLogin->getMemberID(), $userArr)) return "已顶过！";

            //附加会员ID
            if (empty($duser)) {
                $nuser = $userLogin->getMemberID();
            } else {
                $nuser = $duser . "," . $userLogin->getMemberID();
            }

            $archives = $dsql->SetQuery("UPDATE `#@__videocommon` SET `good` = `good` + 1 WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__videocommon` SET `duser` = '$nuser' WHERE `id` = " . $id);
            $results  = $dsql->dsqlOper($archives, "update");
            return $results;

        } else {
            return "评论不存在或已删除！";
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
        $param = $this->param;
        if ($userLogin->getMemberID() == -1) {
            return array("state" => 200, 'info' => '请先登录！');
        }
        $aid     = $param['aid'];
        $id      = $param['id'];
        $content = addslashes($param['content']);

        if (empty($aid) || empty($content)) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        $content = filterSensitiveWords(cn_substrR($content, 250));

        include HUONIAOINC . "/config/video.inc.php";
        $ischeck = (int)$customCommentCheck;

        $archives = $dsql->SetQuery("INSERT INTO `#@__videocommon` (`aid`, `floor`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `ischeck`, `duser`) VALUES ('$aid', '$id', '" . $userLogin->getMemberID() . "', '$content', " . GetMkTime(time()) . ", '" . GetIP() . "', '" . getIpAddr(GetIP()) . "', 0, 0, '$ischeck', '')");
        $lid      = $dsql->dsqlOper($archives, "lastid");
        if ($lid) {
            $archives = $dsql->SetQuery("SELECT `id`, `userid`, `content`, `dtime`, `ip`, `ipaddr`, `good`, `bad`, `duser` FROM `#@__videocommon` WHERE `id` = " . $lid);
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
            return array("state" => 200, "info" => '评论失败！');
        }

    }

    /**
     * 点赞
     * @return array
     */
    public function dianzan()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array('state' => 200, 'info' => '登录超时！');
        }
        $param = $this->param;
        if (!empty($param)) {

            $vid  = $param['vid'];
            $type = $param['type'];
            $temp = $param['temp'];
        } else {
            return array('state' => 200, 'info' => '参数不正确！');
        }
        if ($type == 1) {
            //查看是否已经点过赞
            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = $vid AND `userid` = $userid AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                return array('state' => 200, 'info' => '您已点赞！');
            }
            $date = time();
            $sql  = $dsql->SetQuery("INSERT INTO `#@__site_zanmap` (`userid`, `vid`, `temp`, `date`) VALUES ($userid , $vid, '$temp' ,$date)");
            $ret  = $dsql->dsqlOper($sql, "update");
        } else {
            //取消
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_zanmap` WHERE `userid` = $userid AND `vid` = $vid AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "update");
        }

        return array('state' => 100, 'info' => $ret);
    }

    /**
     * 关注
     * @return array
     */
    public function follow()
    {
        global $dsql;
        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array('state' => 200, 'info' => '登录超时！');
        }
        $param = $this->param;
        if (!empty($param)) {

            $vid  = $param['vid'];
            $type = $param['type'];
            $temp = $param['temp'];
        } else {
            return array('state' => 200, 'info' => '参数不正确！');
        }

        //查询发布视频的用户
        if ($temp == 'video' || $temp == 'video_common') {
            if ($vid) {
                $sql      = $dsql->SetQuery("SELECT `admin` FROM `#@__videolist` WHERE `id` = $vid");
                $ret      = $dsql->dsqlOper($sql, "results");
                $userid_b = $ret[0]['admin'];
            } else {
                $userid_b = (int)$param['userid'];
            }

        } elseif ($temp == 'quanjing') {
            $sql      = $dsql->SetQuery("SELECT `admin` FROM `#@__quanjinglist` WHERE `id` = $vid");
            $ret      = $dsql->dsqlOper($sql, "results");
            $userid_b = $ret[0]['admin'];
        }elseif ($temp == 'info'){
            $userid_b = $vid;
            if($vid == $userid){
                return array('state' => 200, 'info' => '您不可以关注自己！');
            }
        }

        if ($type) {
            //查看是否已经关注
            $sql = $dsql->SetQuery("SELECT * FROM `#@__site_followmap` WHERE `userid` = $userid AND `userid_b` = $userid_b AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                return array('state' => 200, 'info' => '您已关注！');
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

    public function videodeal(){
        global $dsql;
        global $userLogin;

        $param   = $this->param;
        if (!empty($param)) {
            $aid = $param['aid'];      //视频id
            $amount = $param['amount'];   //打赏金额
        }else{
            return array('state' => 200, 'info' => '参数不正确！');
        }

        $uid = $userLogin->getMemberID();  //当前登录用户
        $isMobile = isMobile();

        $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__pay_log` WHERE `ordertype` = 'video' AND `uid` = '".$uid."' AND `state` = 0");
        $res = $dsql->dsqlOper($sql,"results");

        $ordernum = $res[0]['ordernum'];
        if (1 == 1) {
            $ordernum = create_ordernum();
            $param = array(
                "userid" => $uid,
                "amount" => $amount,
                "balance" => 0,
                "type" => "video",
                "aid" => $aid,
            );

            $body = serialize($param);

            $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordernum`, `uid`, `ordertype`,`body`, `amount`,`paytype`,`state`, `pubdate`) VALUES ('$ordernum', '$uid', 'video', '$body', '$amount','money',0, " . GetMkTime(time()) . ")");
            $return = $dsql->dsqlOper($archives, "update");
            if ($return != "ok") {
                return array('state' => 200, 'info' => '提交失败！稍后重试');
            }

        }

        if ($isMobile) {
            $param_['ordernum'] = $ordernum;
            $param_['amount'] = $amount;
            $param_['ordertype'] = 'videoPay';
            $param = array(
                "service" => "member",
                "type" => "user",
                "template" => "pay",
                "param" => http_build_query($param_)
            );

            return createPayForm("video", $ordernum, $amount, '', "观看付费视频", array(), 1);

            return getUrlPath($param);
            die;
        }else{
			$param_['ordernum'] = $ordernum;
            $param_['amount'] = $amount;
            $param_['ordertype'] = 'videoPay';
            $param = array(
                "service" => "video",
                "template" => "pay",
                "param" => http_build_query($param_)
            );
            return getUrlPath($param);
            die;
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
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        if($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请登录后重试！
        if(empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");//提交失败，订单号不能为空！
        if(!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");//请输入支付密码！

        $totalPrice = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {
            //查询订单信息
            $archives = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordernum` = '$value'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $body = $res['body'];
			$body = unserialize($body);
			$amount = $body['amount'];

            $totalPrice += $amount;
        }

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if($usePinput == 1 && !empty($point)){
            if($userpoint < $point) return array("state" => 200, "info" => "您的可用".$cfg_pointName."不足，支付失败！");//您的可用".$cfg_pointName."不足，支付失败！
            $useTotal += $point / $cfg_pointRatio;
            $tit[] = $cfg_pointName;
        }

        //判断是否使用余额，并且验证余额和支付密码
        if($useBalance == 1 && !empty($balance) && !empty($paypwd)){
            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$userid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res = $results[0];
            $hash = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);
            if($res['paypwd'] != $hash) return array("state" => 200, "info" => "支付密码输入错误，请重试！");//支付密码输入错误，请重试！
            //验证余额
            if($usermoney < $balance) return array("state" => 200, "info" => "您的余额不足，支付失败！");//您的余额不足，支付失败！
            $useTotal += $balance;
            $tit[] = "余额";//余额
        }

        if($useTotal > $totalPrice) return array("state" => 200, "info" => "您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit));//"您使用的".join("和", $tit)."超出订单总费用，请重新输入要使用的".join("和", $tit)

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
        $point      = (float)$param['point'];
        $useBalance = $param['useBalance'];
        $balance    = (float)$param['balance'];
        $ordernumArr = explode(",", $ordernum);

        if (!is_array($payTotalAmount)) {
            $amount =  $payTotalAmount;
        }else{
            return $payTotalAmount;
        }
        //余额or积分混合支付
        if($final==1 &&($usePinput && !empty($point)) || ($useBalance && !empty($balance))){

            $pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
            $balanceMoney = $balance;

            foreach ($ordernumArr as $key => $value) {

                //查询订单信息
                $archives = $dsql->SetQuery("SELECT  `body` FROM `#@__pay_log` WHERE `ordernum` = '$value'");
                $results  = $dsql->dsqlOper($archives, "results");
                $res = $results[0];
				$body = $res['body'];
				$body = unserialize($body);
                $orderprice = $body['amount']; //单价
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
        return createPayForm("video", $ordernum, $amount, $paytype, "观看付费视频");

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

        if(empty($ordernum)) return array("state" => 200, "info" => "订单号传递失败！");//订单号传递失败！

        $userid = $userLogin->getMemberID();
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //获取订单内容
            $archives = $dsql->SetQuery("SELECT `body` FROM `#@__pay_log` WHERE `ordernum` = '$value' AND `uid` = $userid");
            $orderDetail  = $dsql->dsqlOper($archives, "results");
            if($orderDetail){
                $body = $orderDetail[0]['body'];
				// $body = unserialize($body);
            }else{
                return array("state" => 200, "info" => "订单不存在或已超时，请重新提交订单！");
            }

        }
        return "ok";
    }


    /**
     * 视频支付
     * @return array
     */
    public function pay(){
        global $dsql;
        global $userLogin;
        global $langData;
        $param   = $this->param;
        $aid        = $param['aid'];      //视频id
        $amount     = $param['amount'];   //打赏金额
        $paytype    = $param['paytype'];  //支付方式
        $final      = $param['final'];
        $useBalance = (int)$param['useBalance'];
        $qr         = (int)$param['qr'];
        $ordernum   = $param['ordernum'];
        $tourl      = $param['tourl'];
        $balance    = $param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        $check      = (int)$this->param['check'];

        $final      = (int)$param['final']; // 最终支付

        $uid = $userLogin->getMemberID();  //当前登录用户
        if ($uid == -1) {
            if ($check ) {
                return array("state" => 200, "info" => $langData['info'][2][9]);//登陆超时
            } else {
                die($langData['info'][2][9]);//登陆超时
            }
        }

        $isMobile = isMobile();

        //验证金额
        if( $final ==0){
            // if($amount <= 0 || !is_numeric($aid)){
            //     header("location:".$url);
            //     die;
            // }
        }
//        //自己不可以给自己打赏
//        if($admin == $uid){
//            //信息不存在
//            header("location:".$url);
//            die;
//        }
        /*验证价格对不对*/
        if( $final ==0) {
            // $amountsql = $dsql->SetQuery("SELECT `price` FROM `#@__videolist` WHERE  `id` = '" . $aid . "'");
            // $amountres = $dsql->dsqlOper($amountsql, "results");
            // if ($amountres[0]['price'] != $amount) {
            //     return array('state' => 200, 'info' => '价格有误！');
            // }
        }
        //订单号
        if($ordernum!=''){

            $sql = $dsql->SetQuery("SELECT `id`, `state`, `amount`, `body` FROM `#@__pay_log` WHERE `ordertype` = 'video' AND `ordernum` = '".$ordernum."'");

            $res = $dsql->dsqlOper($sql,"results");

            if($res){
                if($res[0]['state'] == 1){
                    return array('state' => 200, 'info' => '请勿重复支付！');
                }
                $amount = $res[0]['amount'];
                $body = unserialize($res[0]['body']);
                $aid = $body['aid'];
            }else{
                return array('state' => 200, 'info' => '请重新发起付款！');
            }
        }

        //信息url
        $paramurl = array(
            "service"     => "video",
            "template"    => "detail",
            "id"          => $aid
        );
        $url = getUrlPath($paramurl);

        //用户信息
		$payAmount = $amount; // 在线支付金额;
		$userinfo  = $userLogin->getMemberInfo();

		//移动端不需要输入使用多少余额
		if(isMobile()){
	        $balance   = 0; // 使用余额
	        if($useBalance){
	            if($amount <= $userinfo['money']){
	                $payAmount = 0;
	            }else{
	                $payAmount = $amount - $userinfo['money'];
	            }
	            $balance = $amount - $payAmount;

	        }else{
	            $payAmount = $amount;
	        }
		}else{
			if($useBalance){
	            if($amount <= $balance){
	                $payAmount = 0;
	            }else{
	                $payAmount = $amount - $balance;
	            }

	        }else{
	            $payAmount = $amount;
	        }
		}
//        $param = array(
//            "userid" => $uid,
//            "amount" => $amount,
//            "balance" => $balance,
//            "type" => "video",
//            "aid" => $aid,
//        );
//        $body = serialize($param);
//        $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__pay_log` WHERE `ordertype` = 'video' AND `uid` = '".$uid."' AND `body` = '".$aid."' AND `state` = 1");
//        $res = $dsql->dsqlOper($sql,"results");
//
//        if(empty($res) && is_array($res)) {
//            $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `body` = '" . $body . "'  WHERE `ordernum` = '" . $ordernum . "' AND `ordertype` = 'video' AND `uid` = " . $uid);
//            $dsql->dsqlOper($sql, 'update');

        //判断是否使用余额，并且验证余额和支付密码
        if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {

            if (!empty($balance) && empty($paypwd)) {
                if ($check ) {
                    return array("state" => 200, "info" => $langData['info'][2][12]);//请输入支付密码
                } else {
                    die($langData['info'][2][12]);
                }
            }

            //验证支付密码
            $archives = $dsql->SetQuery("SELECT `id`, `paypwd` FROM `#@__member` WHERE `id` = '$uid'");
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];
            $hash     = $userLogin->_getSaltedHash($paypwd, $res['paypwd']);

            if ($res['paypwd'] != $hash) {
                if ($check ) {
                    return array("state" => 200, "info" => $langData['info'][2][13]);//支付密码输入错误，请重试！
                } else {
                    die($langData['info'][2][13]);
                }
            }

            //验证余额
            if ($userinfo['money'] < $balance) {
                if ($check  ) {
                    return array("state" => 200, "info" => $langData['info'][2][14]);//您的余额不足，支付失败！
                } else {
                    die($langData['info'][2][14]);
                }
            }

        }
        if ($check) return "ok";

        if ($payAmount == 0){

            if (!empty($balance) && empty($paypwd)) {
                if ($check) {
                    return array("state" => 200, "info" => $langData['info'][2][12]);//请输入支付密码
                } else {
                    die($langData['info'][2][12]);
                }
            }


            // $param = array(
            //     "userid" => $uid,
            //     "amount" => $payAmount,
            //     "balance" => $balance,
            //     "type" => "video",
            //     "aid" => $aid,
            // );
            // $body = serialize($param);
            $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `paytype`= 'money', `amount` = '$balance' WHERE `ordernum` = '" . $ordernum . "' AND `ordertype` = 'video' AND `uid` = " . $uid);
            $dsql->dsqlOper($sql, 'update');

            $param['ordernum'] = $ordernum;
            $param['balance']  = $balance;
            $this->paySuccess($param);
            if($tourl){
                return $tourl;
                header("location:".$tourl,true,301);die;
            }else{
				if(!isMobile()){
					header("location:".$url);
	                die;
				}else{
                    return $url;
	                // return $langData['siteConfig'][16][55];  //支付成功
				}
            }
        }else{
            $param = array(
                "userid" => $uid,
                "amount" => sprintf("%.2f",$payAmount),
                "balance" => sprintf("%.2f",$balance),
                "type" => "video",
                "aid" => $aid,
            );
            $body = serialize($param);
            $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `body` = '" . $body . "',`paytype`= '".$paytype."', `amount` = '$payAmount' WHERE `ordernum` = '" . $ordernum . "' AND `ordertype` = 'video' AND `uid` = " . $uid);
            $dsql->dsqlOper($sql, 'update');
            return createPayForm("video", $ordernum, $payAmount, $paytype, "观看付费视频");
        }
//        }else{
//            return array("state" => 200, "info" =>"请不要重复支付！");//
//        }
            //跳转至第三方支付页面

    }


    /*支付成功*/
    public function paySuccess($param = array()){
        global $dsql;
        global $langData;
        global $siteCityInfo;
        global $userLogin;
        global $cfg_videoFee;
        global $cfg_fzvideoFee;

        if(empty($param)){
            $param = $this->param;
        }



        // $amount     = $param['amount'];
        // $balance    = $param['balance'];
        // $aid        = $param['aid'];
        $ordernum   = $param['ordernum'];

        $ordersql = $dsql->SetQuery("SELECT * FROM `#@__pay_log` WHERE `ordernum` = '".$ordernum."' AND `ordertype` = 'video' ");
        $orderres = $dsql->dsqlOper($ordersql,'results');

        if(!$orderres) return;
        $body = unserialize($orderres[0]['body']);
        $pid = 0;
        if($body){
            $balance = $body['balance'];
            $amount  = $body['amount'];
            $allamount  = $orderres[0]['amount'];
            $aid  = (int)$body['aid'];
            $pid  = (int)$orderres[0]['id'];
        }else{
            return;
        }
        //添加到订单表里（之前无订单表，仅pay_log记录了信息导致查询不便）
        $paydate = time();
        $sql = $dsql::SetQuery("insert into `#@__video_order`(`ordernum`,`uid`,`state`,`paytype`,`paydate`,`amount`,`aid`) values('$ordernum',{$orderres[0]['uid']},1,'{$orderres[0]['paytype']}',$paydate,$amount,$aid)");
        $dsql->update($sql);

		//余额支付
        if($orderres[0]['paytype'] == 'money'){
			$balance = $balance + $amount;
        }

        //扣除会员余额
        if($balance) {
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$balance' WHERE `id` = '" . $orderres[0]['uid'] . "'");
            $dsql->dsqlOper($archives, "update");
        }
            $paramUse    = array(
                "service" => "video",
                "template" => "detail",
                "id" => $aid
            );
            $urlParam = serialize($paramUse);
            $date = time();
            $foodtitle = '未知';
            if($aid){
                $foodtitlesql = $dsql->SetQuery("SELECT `title` FROM `#@__videolist` WHERE `id` = '$aid'");
                $foodtitleres = $dsql->dsqlOper($foodtitlesql,"results");
                $foodtitle    = $foodtitleres[0]['title'];
            }
            $user  = $userLogin->getMemberInfo($orderres[0]['uid']);
            $usermoney = $user['money'];
            $title = '视频频道付费浏览-'.$foodtitle;
            $info  = '【付费观看】-'.$foodtitle;
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('".$orderres[0]['uid']."', '0', '$allamount', '$info', '$date','video','fufeiyuedu','$pid','$urlParam','$title','$ordernum','$usermoney')");
            $dsql->dsqlOper($archives, "update");


		$paylogsql =  $dsql->SetQuery("UPDATE `#@__pay_log` SET `state` = 1 WHERE `ordernum` = '".$ordernum."'");
		$dsql->dsqlOper($paylogsql, "update");


        /*平台佣金*/
        $fee = $amount * $cfg_videoFee / 100;
        $fee = $fee < 0.01 ? 0 : $fee;
        $amount_ = sprintf('%.2f', $amount - $fee);

        $zuozhesql = $dsql->SetQuery("SELECT `writer`,`title`,`cityid` FROM `#@__videolist` WHERE `id` ='".$aid."'");

        $zuozheres = $dsql->dsqlOper($zuozhesql,"results");
        if($zuozheres) {
            $uid = $zuozheres[0]['writer'];
            $title = $zuozheres[0]['title'];
            $cityid = $zuozheres[0]['cityid'];

            if($uid!=0){
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '" . $uid . "'");
                $dsql->dsqlOper($archives, "update");
                $now = GetMkTime(time());
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                //商家收入
                $title = '收费视频';
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$uid', '1', '$amount_', '视频收入：$title', '$now','video','fufeiyuedu','$urlParam','$title','$ordernum','$usermoney')");
                $dsql->dsqlOper($archives, "update");
            }

            //分站佣金
            $fzFee = cityCommission($cityid,'video');
            //分站
            $fztotalAmount_ = $fee * (float)$fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
            $fee-=$fztotalAmount_;//总站-=分站
            $cityName = getSiteCityName($cityid);

            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");
            //保存操作日志
            $now = GetMkTime(time());
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$uid', '1', '$amount_', '视频收入：$title', '$now','$cityid','$fztotalAmount_','video',$fee,'1','fufeiyuedu')");
//            $dsql->dsqlOper($archives, "update");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);

            //微信通知
            $param = array(
                'type' => "1", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . '分站——video模块——分站获得佣金 :' . sprintf("%.2f", $fztotalAmount_),
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );

            $params = array(
                'type' => "2", //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . '分站——video模块——平台获得佣金 :' . $fee . ' ——分站获得佣金 :' . sprintf("%.2f", $fztotalAmount_),
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            //后台微信通知
            updateAdminNotice("video", "detail", $param);
            updateAdminNotice("video", "detail", $params);
        }
    }

    /**
     * Notes: 视频作者列表
     * Ueser: Administrator
     * DateTime: 2021/1/12 16:36
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function  authorList(){
        global $dsql;
        global $langData;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        $sql = $dsql->SetQuery("SELECT DISTINCT l.`writer` FROM `#@__videolist` l LEFT JOIN `#@__member` m ON m.`id` = l.`writer` WHERE m.`id` IS NOT NULL AND l.`writer` != 0 AND l.`writer` != $uid");
        $res = $dsql->dsqlOper($sql,"results");
        $list      = array();

        if($res){
            $writerarr = $res;
            if(count($res) >= 5){
                $writer = array_rand($res,5);

                foreach ($writer as $v){
                    array_push($writerarr,$writer[$v]);
                }
            }
            foreach ($writerarr as $key => $value){
                $usersql  = $dsql->SetQuery("SELECT `username`,`nickname`,`photo` FROM `#@__member` WHERE `id` = '".$value['writer']."'");
                $userres  = $dsql->dsqlOper($usersql,"results");
                $username = '';
                if($userres){
                    $username = $userres[0]['nickname'] ? $userres[0]['nickname'] : $userres[0]['username'] ;
                }
                $list[$key]['id']           = $value['writer'];
                $list[$key]['username']     = $username;
                $fCount = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid_b` = '".$value['writer']."'  AND `temp` = 'video' ");
                $fCount = $dsql->dsqlOper($fCount, "totalCount");
                $list[$key]['fCount']     = $fCount;
                $list[$key]['logo']       = $value['photo'] != '' ? getFilePath($value['photo']) : '';

                $is_follow = 0;
                if($value['writer']){
                    $is_follow = $dsql->SetQuery("SELECT `id` FROM `#@__site_followmap` WHERE `userid_b` ='".$value['writer']."' AND `userid` = $uid AND `temp` = 'video'");
                    $is_follow = $dsql->dsqlOper($is_follow, "totalCount");
                }
                $list[$key]['is_follow']     = $is_follow;
            }
        }
        return $list;
    }

}
