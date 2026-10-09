<?php
use function Qiniu\json_decode;

if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 直播模块API接口
 *
 * @version        $Id: live.class.php 2017-6-01 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
class live
{
    private $param;  //参数

    /**
     * 构造函数
     *
     * @param string $action 动作名
     */
    public function __construct($param = array())
    {
        global $dsql;
        $this->param = $param;
        include_once(HUONIAOROOT . "/api/live/alilive/alilive.class.php");
        $this->aliLive = new Alilive();

        // $custom_rongKeyID = $custom_rongKeySecret = "";
        // $sql              = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
        // $ret              = $dsql->dsqlOper($sql, "results");
        // if ($ret) {
        //     $data                 = $ret[0];
        //     $custom_rongKeyID     = $data['rongKeyID'];
        //     $custom_rongKeySecret = $data['rongKeySecret'];
        // }
        // $appKey    = $custom_rongKeyID;
        // $appSecret = $custom_rongKeySecret;
        //
        // include_once(HUONIAOINC . "/class/imserver/im.class.php");
        // $this->RongCloud = new im($appKey, $appSecret);
    }

    /**
     * 直播基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/live.inc.php");

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

        global $cfg_standard;
        global $cfg_narrowband;

        //获取当前城市名
        global $siteCityInfo;
        if(is_array($siteCityInfo)){
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

        // $domainInfo = getDomain('article', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }
        //include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('live', $customSubDomain);

        //分站自定义配置
        $ser = 'live';
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
                } elseif ($param == "submission") {
                    $return['submission'] = $submission;
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
            $return['submission']    = $submission;
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
			$return['rewardSwitch']  = isByteMiniprogram() ? 1 : (int)$customRewardSwitch;  //抖音小程序中强制关闭
			$return['rewardOption']  = $customRewardOption ? array_map('floatval', explode("\r\n", $customRewardOption)) : array(1,2,5,8,10,20);
        }

        return $return;

    }

    /**
     * 直播分类
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
                $flag = $this->param['flag'];
            }
        }

        if($flag != ''){
            $where = " AND `flag` = " . $flag;
        }

        $sql = $dsql->SetQuery("SELECT * FROM `#@__livetype` WHERE 1 = 1" . $where);
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $list = array();
            foreach ($ret as $key => $val) {

                $param = array(
                    "service" => "live",
                    "template" => "list",
                    "typeid" => $val['id']
                );

                $param1 = array(
                    "service" => "live",
                    "template" => "livelist",
                    "typeid" => $val['id']
                );

                array_push($list, array(
                    'id' => $val['id'],
                    'typename' => $val['typename'],
                    'flag' => $val['flag'],
                    'icon' => getFilePath($val['icon']),
                    'iconturl' => getFilePath($val['icon']),
                    'url' => getUrlPath($param),
                    'newurl' => getUrlPath($param1)
                ));

            }
            return $list;
        }
    }

    /**
     * 直播列表详细信息
     * @return array
     */
    public function typeDetail()
    {
        global $dsql;
        $typeDetail = array();
        $typeid     = $this->param;
        if(!$typeid) return array("state" => 200, "info" => '格式错误！'); 
        $archives   = $dsql->SetQuery("SELECT `id`, `typename`, `seotitle`, `keywords`, `description` FROM `#@__livetype` WHERE `id` = " . $typeid);
        $results    = $dsql->dsqlOper($archives, "results");
        if ($results && is_array($results)) {
            $param             = array(
                "service" => "live",
                "template" => "livelist",
                "typeid" => $typeid
            );
            $results[0]["url"] = getUrlPath($param);
            return $results;
        }
    }

    /**
     * 直播列表
     * 1、正在直播（正在直播的）
     * 2、直播分类直播列表（正在直播的）
     * 3、主播直播列表（结束直播的和正在直播的）
     */
    public function alive()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $typeid   = $type = $title = $rec = $hot = $where = $where1 = $inner = "";
        $uid   = $userLogin->getMemberID();

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $typeid = $this->param['typeid'];
                $userid = $this->param['uid'];
                $title    = $this->param['title'];
                $type     = $this->param['type'];
                $lng      = $this->param['lng'];
                $lat      = $this->param['lat'];
                $u        = $this->param['u'];
                $state    = $this->param['state'];
                $rec      = $this->param['rec'];
                $hot      = $this->param['hot'];
                $orderby  = $this->param['orderby'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
                $typename = $this->param['typename'];
                $myfollow = (int)$this->param['myfollow'];//我关注的主播发布的
                $mybooking = (int)$this->param['mybooking'];//我的预约
                $mo = $this->param['mo'];
            }
        }

        if($myfollow){
            if($uid < 1){
                return array("state" => 200, "info" => '您还没有登录');
            }
            // $inner = "INNER JOIN (SELECT f.fid FROM huoniao_member_follow f WHERE f.for = ''AND f.tid = $uid ) AS tmp";
            $inner = "INNER JOIN (SELECT a.`uid` FROM `#@__live_anchor` a LEFT JOIN `#@__member_follow` f ON f.`fid` = a.`uid` WHERE f.`tid` = $uid AND f.`fortype` = '') AS tmp";
            $where .= " AND tmp.`uid` = l.`user`";
        }
        if(!$myfollow && $mybooking){
            if($uid < 1){
                return array("state" => 200, "info" => '您还没有登录');
            }
            $inner = "INNER JOIN (SELECT b.`aid` FROM `#@__live_booking` b WHERE b.`uid` = $uid) AS tmp";
            $where .= " AND tmp.`aid` = l.`id`";
        }else{
            $mybooking = 0;
        }

        if($typename){
            $types = $dsql->SetQuery("SELECT `id` FROM `#@__livetype` WHERE `typename` LIKE '%$typename%'");
            $type_ret = $dsql->dsqlOper($types, "results");
            if($type_ret){
                $typeid = $type_ret[0]['id'];
            }
        }

        if ($u) {
            $where .= " AND l.`user` = " . $uid;
        }else{
            $where .= " AND l.`arcrank` = 1 AND l.`waitpay` = 0";
        }

        if ($state != '') {
            $where .= " AND l.`state` = " . $state;
        }


        if (!empty($type)) {
            if ($type == 1) {
                $where .= " and l.`state` in (1,2)";
            } elseif ($type == 2) {//未直播的、结束直播的和正在直播的
                $where .= " and l.`state` in (0,1,2)";
            } elseif ($type == 3) {//结束直播的和正在直播的
                $where .= " and l.`state` in (1,2)";
            } elseif ($type == 4) {//正在直播的
                $where .= " and l.`state` = 1";
            }elseif ($type == 5) {//精彩回放
                $where .= " and l.`state` = 2";
            }
        }

        //$userid = $userLogin->getMemberID();
        if (!empty($userid) && $type != 1) {
            $where .= " and l.`user` = '$userid'";
        }
        if (!empty($typeid)) {
            $where .= " and l.`typeid` = '$typeid'";
        }

        if($rec){
            $where .= " AND l.`flag_r` = 1";
        }

        if($hot){
            $where .= " AND l.`flag_h` = 1";
        }

        if (!empty($title)) {

            siteSearchLog("live", $title);

            if($orderby == 3 || $orderby == 'active'){
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$title%' or `nickname` like '%$title%' or `company` like '%$title%'");
                $retname = $dsql->dsqlOper($sql, "results");
                if(!empty($retname) && is_array($retname)){
                    $list_name = array();
                    foreach ($retname as $key => $value) {
                        $list_name[] = $value["id"];
                    }
                    $idList = join(",", $list_name);
                    $where .= " AND  l.`user` in ($idList) ";
                }
            }else{
                $where .= " AND l.`title` like '%" . $title . "%'";
            }
        }
        if($mo){
            $where .= " and l.`way` = 0 ";
        }

        //查询距离
        if((!empty($lng))&&(!empty($lat))){
            $select="(2 * 6378.137* ASIN(SQRT(POW(SIN(3.1415926535898*(".$lat."-l.`lat`)/360),2)+COS(3.1415926535898*".$lat."/180)* COS(l.`lat` * 3.1415926535898/180)*POW(SIN(3.1415926535898*(".$lng."-l.`lng`)/360),2))))*1000 AS distance,";
        }else{
            $select="";
        }

        $order = " ORDER BY l.`id` DESC";

        if ($type == 1) {
            $order = " ORDER BY l.`state` asc, l.`id` DESC";
        } elseif ($type == 2) {
            $order = " ORDER BY FIELD(l.`state`, 0, 1, 2), l.`id` DESC";
        } elseif ($type == 3) {
            $order = " ORDER BY FIELD(l.`state`, 1, 2), l.`id` DESC";
        }

        if ($orderby == 'click' || $orderby == '1') {
            $order = " ORDER BY (l.`click`+l.`replay`) DESC, l.`id` DESC";
        }else if($orderby == 'time' || $orderby == '2'){
            $order = " ORDER BY l.`ftime` DESC, l.`id` DESC";
        }elseif($orderby == "active" || $orderby == '3'){//直播最多的用户
            $order = " GROUP BY l.`user` order by count((l.`click`+l.`replay`)) desc, count(l.`id`) desc";
        }elseif ($orderby == 4) {
            if((!empty($lng))&&(!empty($lat))){
                $order = " ORDER BY `distance` ASC";
            }
        }elseif ($orderby == 5) {
            $order = " ORDER BY FIELD(l.`state`, 1, 2), l.`id` DESC, (l.`click`+l.`replay`) DESC, l.`id` DESC";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        if($orderby == "active" || $orderby == '3'){
            $archives_count = $dsql->SetQuery("SELECT count(distinct `user`) count FROM `#@__livelist` l $inner WHERE 1=1" . $where);
        }else{
            $archives_count = $dsql->SetQuery("SELECT count(`id`) count FROM `#@__livelist` l $inner WHERE 1=1" . $where);
        }

        //总条数
        $totalResults = $dsql->dsqlOper($archives_count, "results");
        $totalResults = $totalResults[0]['count'];
        $totalCount   = (int)$totalResults;

        //总分页数
        $totalPage = ceil($totalCount / $pageSize);
        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $archives = $dsql->SetQuery("SELECT l.`id`,l.`way`,l.`user`,l.`up`,l.`lng`,l.`lat`,l.`title`,l.`typeid`,l.`starttime`,l.`litpic`,l.`click`,l.`replay`,l.`state`,l.`ftime`,l.`livetime`,l.`arcrank`,l.`pulltype`,l.`pullurl_pc`,l.`pullurl_touch`,l.`state`,l.`ossurl`, ".$select." l.`streamname`, l.`waitpay`, l.`pubdate` FROM `#@__livelist` l $inner WHERE 1=1" . $where);

        $atpage  = $pageSize * ($page - 1);
        $limit   .= " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives .  $where . $order .$limit , "results");
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']     = $val['id'];
                $list[$key]['user']   = $val['user'];
                $list[$key]['title']  = $val['title'];
                $list[$key]['typeid'] = $val['typeid'];
                $list[$key]['pubdate'] = $val['pubdate'];
                $list[$key]['lng']    = $val['lng'];
                $list[$key]['lat']    = $val['lat'];
                if (!empty($val['litpic'])) {
                    if (strpos($val['litpic'], 'images')) {
                        $list[$key]['litpic'] = $val['litpic'];
                    } else {
                        $list[$key]['litpic'] = getFilePath($val['litpic']);
                    }
                } else {
                    $list[$key]['litpic'] = '/static/images/404.jpg';
                }
                $list[$key]['distance']  = $val['distance'] > 1000 ? sprintf("%.1f", $val['distance'] / 1000) . $langData['siteConfig'][13][23] : sprintf("%.1f", $val['distance']) . $langData['siteConfig'][13][22];  //距离   //千米  //米
                if(strpos($list[$key]['distance'],'千米')){
                    $list[$key]['distance'] = str_replace("千米",'km',$list[$key]['distance']);
                }elseif(strpos($list[$key]['distance'],'米')){
                    $list[$key]['distance'] = str_replace("米",'m',$list[$key]['distance']);
                }

                $sql  = $dsql->SetQuery("SELECT `typename` FROM `#@__livetype` where id = '".$val['typeid']."'");
                $ret  = $dsql->dsqlOper($sql, "results");
                $list[$key]['typename'] = !empty($ret[0]['typename']) ? $ret[0]['typename'] : '';

                //$list[$key]['litpic'] = !empty($val['litpic']) ? getFilePath($val['litpic']) : '/static/images/404.jpg';
                $list[$key]['click'] = (int)($val['click']+$val['replay']);  //直播浏览量 + 回放浏览量
                $list[$key]['up']    = $val['up'];
                $list[$key]['ftimes']= $val['ftime'];
                $list[$key]['state'] = $val['state'];
                $list[$key]['ftime'] = !empty($val['ftime']) ? date("Y-m-d H:i:s", $val['ftime']) : '无';
                if($val['state'] == 2){
                    $fenzhong = (int)($val['livetime'] / 1000 / 60);
                    $second = $val['livetime'] / 1000 % 60;
                    $list[$key]['times'] = $fenzhong . ':'.($second > 10 ? $second : '0'.$second);
                }

                //会员信息
                $member                 = getMemberDetail($val['user']);
                $list[$key]['nickname'] = !empty($member['nickname']) ? $member['nickname'] : $member['username'];
                $list[$key]['photo']    = !empty($member['photo']) ? getFilePath($member['photo']) : '/static/images/noPhoto_40.jpg';
                $list[$key]['certifyState'] = $member['certifyState'];

                if (isMobile()) {
                    if ($val['way'] == 1) {
                        $param = array(
                            "service" => "live",
                            "template" => "detail",
                            "id" => $val['id']
                        );
                    } else {
                        $param = array(
                            "service" => "live",
                            "template" => "h_detail",
                            "id" => $val['id']
                        );
                    }
                } else {
                    $param = array(
                        "service" => "live",
                        "template" => "detail",
                        "id" => $val['id']
                    );
                }

                $urlparam             = array(
                    "service" => "member",
                    "type" => "user",
                    "template" => "livedetail",
                );
                $list[$key]['newurl'] = getUrlPath($urlparam) . '?id=' . $val['id'];
                $list[$key]['url']    = getUrlPath($param);
                if($u){
                    $list[$key]['arcrank'] = $val['arcrank'];
                }

                //播放地址
                if($val['pulltype']==1){
                    $list[$key]['mp4url']  = $val['pullurl_pc'];
                    $list[$key]['m3u8url'] = $val['pullurl_touch'];
                    $list[$key]['playurl'] = isMobile() ? $val['pullurl_touch'] : $val['pullurl_pc'];
                }else{
                    if($val['state']==2){
                        include HUONIAOINC . "/config/live.inc.php";
                        if(empty($val['ossurl'])){
                            $this->param = $val['streamname'];
                            $Pulldetail  = $this->describeLiveStreamRecordIndexFiles();
                            if ($Pulldetail['state'] == 100 && is_array($Pulldetail['info']['RecordIndexInfoList']['RecordIndexInfo'])) {
                                $RecordIndexInfo = $Pulldetail['info']['RecordIndexInfoList']['RecordIndexInfo'];
                                $mp4File         = $m3u8File = '';

                                $OssObject = "";
                                $Duration = 0;
                                foreach ($RecordIndexInfo as $key => $value) {
                                    if (strstr($value['OssObject'], 'm3u8')) {
                                        $m3u8File  = $custom_server . $value['OssObject'];
                                        $OssObject = str_replace('.m3u8', '', $value['OssObject']);
                                    }
                                    if (strstr($value['OssObject'], 'mp4')) {
                                        $mp4File   = $custom_server . $value['OssObject'];
                                        $OssObject = str_replace('.mp4', '', $value['OssObject']);
                                    }
                                    $Duration = $value['Duration'] * 1000;
                                }

                                $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `ossurl` = '$OssObject', `livetime` = $Duration WHERE `id` = " . $val['id']);
                                $dsql->dsqlOper($archives, "update");

                                $list[$key]['mp4url']  = $mp4File;
                                $list[$key]['m3u8url'] = $m3u8File;

                            }else{
                                $list[$key]['playurl'] = '';
                            }
                        }else{
                            $list[$key]['mp4url']  = $custom_server . $val['ossurl'] . ".mp4";
                            $list[$key]['m3u8url'] = $custom_server . $val['ossurl'] . ".m3u8";
                        }
                    }elseif($val['state']==1){
                        $param['id']   = $val['id'];
                        $param['type'] = isMobile() ? 'm3u8' : 'flv';
                        $this->param = $param;
                        $Pulldetail = $this->getPullSteam();
                        $list[$key]['playurl']   = $Pulldetail;
                    }
                }

                if($orderby=='active' || $orderby=='3'){
                    //粉丝人数
                    // $sql     = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__live_follow` WHERE `fid` = " . $val['user']);
                    $sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $val['user'] . " AND `fortype` = ''");
                    $fansret = $dsql->dsqlOper($sql, "results");
                    $list[$key]['totalFans'] = $fansret[0]['t'];

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `state` = 1 AND `user` = " . $val['user']);
                    $res = $dsql->dsqlOper($sql, "results");
                    $list[$key]['online'] = $res[0]['id'] ? 1 : 0;
                }


                //是否关注发布人
                $uid = $userLogin->getMemberID();
                if($uid > 0){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $uid AND `fid` = " . $val['user'] . " AND `fortype` = ''");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $list[$key]['isMfollow'] = 1;//关注
                    }elseif($uid == $val['user']){
                        $list[$key]['isMfollow'] = 2;//自己
                    }else{
                        $list[$key]['isMfollow'] = 0;//未关注
                    }
                }else{
                    $list[$key]['isMfollow'] = 0;//未关注
                }


                $param = array(
                    "service" => "live",
                    "template" => "anchor_index",
                    "userid" => $val['user']
                );
                $list[$key]['userurl'] = getUrlPath($param);

                // 预约状态
                $booking = 0;
                if($mybooking){
                    $booking = 1;
                }else{
                    if($uid > 0){
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_booking` WHERE `uid` = $uid AND `aid` = ".$val['id']);
                        $res = $dsql->dsqlOper($sql, "results");
                        if($res){
                            $booking = 1;
                        }
                    }
                }
                $list[$key]['booking'] = $booking;

                if($u){
                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                //预约人数
                $bookingCount = 0;
                $sql = $dsql->SetQuery("SELECT count(`id`) totalCount FROM `#@__live_booking` WHERE `aid` = ".$val['id']);
                $res = $dsql->dsqlOper($sql, "results");
                if($res){
                    $bookingCount = $res[0]['totalCount'];
                }
                $list[$key]['bookingCount'] = $bookingCount;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 直播粉丝/关注
     * @return array
     */
    public function follow()
    {
        global $dsql;
        global $userLogin;

        $pageinfo = $list = array();
        $uid      = $type = $page = $pageSize = 0;

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $uid      = $this->param['uid'];
                $type     = $this->param['type'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }

        if (empty($uid)) return array("state" => 200, "info" => '会员ID传递失败！');

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $where = "`fid` = $uid";
        if ($type == "follow") {
            $where = "`tid` = $uid";
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__live_follow` WHERE " . $where . " ORDER BY `id` DESC");

        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '无数据');  //暂无数据！

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        //当前登录会员ID
        $loginid = $userLogin->getMemberID();

        $atpage  = $pageSize * ($page - 1);
        $where   = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $key => $val) {

                $userid            = $type == "follow" ? $val['fid'] : $val['tid'];
                $list[$key]['uid'] = $userid;

                //用户查看主播列表页面
                $param                 = array(
                    "service" => "live",
                    "template" => "anchor_index",
                    "userid" => $userid
                );
                $list[$key]['userurl'] = getUrlPath($param);

                //查询会员信息
                //$this->param = $userid;
                //$detail = $this->detail();
                $detail = getMemberDetail($userid);
                if ($detail && is_array($detail)) {
                    $list[$key]['nickname'] = $detail['nickname'] ? $detail['nickname'] : '无名';
                    $list[$key]['photo']    = !empty($detail['photo']) ? $detail['photo'] : '/static/images/noPhoto_40.jpg';
                } else {
                    $list[$key]['state']    = 1;
                    $list[$key]['nickname'] = '无名';
                    $list[$key]['photo']    = '/static/images/noPhoto_40.jpg';
                }

                //判断是否关注对方
                if ($loginid != -1) {
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_follow` WHERE `tid` = $loginid AND `fid` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret && is_array($ret)) {
                        $list[$key]['isfollow'] = 1;
                    }
                }
            }
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 添加、删除、会员关注
     * @return array
     */
    public function followMember()
    {
        global $dsql;
        global $userLogin;
        $id     = $this->param['id'];
        $userid = $userLogin->getMemberID();
        if (!empty($id) && $userid > -1 && $id != $userid) {

            $archives = $dsql->SetQuery("SELECT `id` FROM `#@__live_follow` WHERE `tid` = '$userid' AND `fid` = '$id'");
            $return   = $dsql->dsqlOper($archives, "totalCount");

            $time = time();
            if ($return == 0) {
                $archives = $dsql->SetQuery("INSERT INTO `#@__live_follow` (`fid`, `tid`, `date`) VALUES ('$id', '$userid', '$time')");
                $dsql->dsqlOper($archives, "update");
            } else {
                $archives = $dsql->SetQuery("DELETE FROM `#@__live_follow` WHERE `tid` = '$userid' AND `fid` = '$id'");
                $dsql->dsqlOper($archives, "update");
            }
            return "ok";

        }

    }

    /**
     * 直播编辑
     */
    public function edit()
    {
        global $dsql;
        global $userLogin;

        $param = $this->param;

        $id = $param['id'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $title         = $param['title'];
        $typeid        = (int)$param['typeid'];
        $catid         = (int)$param['catid'];  //直播类型 0：公开；1：加密；2：收费
        $litpic        = $param['litpic'];
        $ftime         = !empty($param['valid']) ? strtotime($param['valid']) : time();  //直播时间
        $password      = $param['password'];  //加密密码
        $startmoney    = (float)$param['startmoney'];  //开始收费
        $endmoney      = (float)$param['endmoney'];  //结束收费
        $way           = (int)$param['way'];  //直播方式：0：横屏；1：竖屏
        $flow          = (int)$param['flow'];  //流畅度：0：流畅；1：普清；2：高清
        $pulltype      = (int)$param['pulltype'];  //拉流方式：0系统生成,1使用第三方拉流地址
        $pullurl_pc    = trim($param['pullurl_pc']);  //拉流地址pc
        $pullurl_touch = trim($param['pullurl_touch']);  //拉流地址移动端
        $note          = $param['note'];
        $menu          = empty($param['menu']) ? array() : $param['menu'];
        $lnglat        = $param['lnglat'];
        $location      = $param['location'];
        $pubdate       = time();

        if($lnglat){
            $a = explode(",", $lnglat);
            $lng = $a[0];
            $lat = $a[1];
        }else{
            $lng = $lat = "";
        }

        if (empty($title)) return array("state" => 200, "info" => '标题不得为空');

        if (empty($litpic)) return array("state" => 200, "info" => '封面不得为空');

        if ($catid == 1) {
            if (empty($password)) return array("state" => 200, "info" => '密码不得为空');
        } elseif ($catid == 2) {
            $password = '';
            if (empty($startmoney)) return array("state" => 200, "info" => '开始收费不得为空');
            if (empty($endmoney)) return array("state" => 200, "info" => '结束收费不得为空');
        }

        $sql = $dsql->SetQuery("SELECT `id`, `state`, `pulltype`, `pushurl`, `ftime` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res){
            return array("state" => 200, "info" => '信息不存在');
        }

        $state = (int)$res[0]['state'];
        if($state == 1){
            return array("state" => 200, "info" => '直播进行中不可以修改！');
        }
        if($state == 2){
            return array("state" => 200, "info" => '直播已经结束不可以修改！');
        }

        $ftime_ = $res[0]['ftime'];
        $pushurl_ = '';
        // if($res[0]['pushtype']){
        //     if(empty($pushurl)) return array("state" => 200, "info" => '请输入第三方推流地址');
        //     if($pushurl != $res[0]['pushurl']){
        //         $pushurl_ = ", `pushurl` = '$pushurl'";
        //     }
        // }
        // $pushurl = $res[0]['pushurl'];
        // if(empty($pulltype) && empty($res[0]['pushurl'])){
        //
        //     $streamName = 'live' . $id . '-' . $uid;
        //     $vhost      = $this->aliLive->vhost;
        //     $time       = time() + 2592000;  //1个月有效期
        //     $videohost  = $this->aliLive->video_host;
        //     $vhost      = $this->aliLive->vhost;
        //     $appName    = $this->aliLive->appName;
        //     $privateKey = $this->aliLive->privateKey;
        //     if ($privateKey) {
        //         $auth_key = md5('/' . $appName . '/' . $streamName . '-' . $time . '-0-0-' . $privateKey);
        //         //生成推流地址
        //         $pushurl = $videohost . '/' . $appName . '/' . $streamName . '?auth_key=' . $time . '-0-0-' . $auth_key;
        //     } else {
        //         //生成推流地址
        //         $pushurl = $videohost . '/' . $appName . '/' . $streamName;
        //     }
        // }
        // $pushurl_ = ", `pulltype` = $pulltype, `pushurl` = '$pushurl', `pullurl_pc` = '$pullurl_pc', `pullurl_touch` = '$pullurl_touch'";

        $menuArr = array();
        foreach ($menu as $key => $value) {
            $value['sys'] = (int)$value['sys'];
            $value['show'] = (int)$value['show'];

            if(empty($value['name']) || (!(int)$value['sys'] && empty($value['url'])) )  {
                print_r($value);die;
                return array("state" => 200, "info" => '请填写完整直播菜单');
            }
            $menuArr[] = $value;
        }
        $menuData = serialize($menuArr);
        if(strlen($menuData) > 2000){
            echo '{"state": 200, "info": "直播菜单总长度超出限制"}';
            exit();
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET  `title`='$title',`litpic`='$litpic',`typeid`='$typeid',`catid`='$catid',`ftime`='$ftime',`password`='$password',`startmoney`='$startmoney',`endmoney`='$endmoney',`way`='$way',`flow`='$flow',`note` = '$note', `menu` = '$menuData', `arcrank` = 0 $pushurl_, `lng` = '$lng', `lat` = '$lat', `location` = '$location' WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '保存到数据时发生错误，请检查字段内容！');
        } else {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'live', '', $id, 'update', '修改信息('.$id.'=>'.$title.')', $url, $archives);

            //创建聊天室
            $param = array(
                "service" => "live",
                "template" => "detail",
                "id" => $id
            );
            $configHandels = new handlers('siteConfig', "createChatRoom");
            $configHandels->getHandle(array("userid" => $uid, "mark" => "chatRoom" . $id, "title" => $title, "url" => getUrlPath($param)));

            //return $id;

            // 更新直播预约表中时间
            if($ftime_ != $ftime){
                $sql = $dsql->SetQuery("UPDATE `#@__live_booking` SET `ftime` = $ftime WHERE `aid` = $id AND `notice` = 0");
                $dsql->dsqlOper($sql, "update");
            }
            dataAsync("live",$id);  // 直播编辑
            return array("id" => $id);
        }
    }

    /**
     * 点赞
     */
    public function getUp()
    {
        global $dsql;
        $param = $this->param;

        $id = $param['id'];
        $up = $param['up'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET  `up`=up+'1' WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '数据出错！');
        } else {
            return 'ok';
        }
    }

    /**
     * 结束直播
     */
    public function updateState()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;

        $time = time();

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $id    = $param['id'];
        $state = (int)$param['state'];//1正在直播；2：结束直播

        $state = !empty($state) ? $state : 2;

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        $livetime = 0;
        $title = '';
        $sql = $dsql->SetQuery("SELECT `title`, `starttime` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $title = $ret[0]['title'];
            $starttime = $ret[0]['starttime'];
            $livetime = (time() - $starttime) * 1000;
        }else{
            return array("state" => 200, "info" => '信息不存在！');
        }

        //保存到主表
        if($state == 1){
            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET  `state`='$state', `starttime` = '$time' WHERE `id` = " . $id);
        }else{
            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET  `state`='$state', `livetime` = '$livetime' WHERE `id` = " . $id);
        }
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '数据出错！');
        } else {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'live', '', $id, 'update', '结束直播('.$title.')', $url, $archives);

            return 'ok';
        }
    }


    //更改直播类型
    public function updateLiveType(){
        global $dsql;
        global $userLogin;
        $param = $this->param;

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $id    = (int)$param['id'];
        $type  = (int)$param['type'];
        $pc    = $param['pc'];
        $touch = $param['touch'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        if($type){
            if(empty($pc) || empty($touch)){
                return array("state" => 200, "info" => '请输入电脑端和移动端拉流地址！');
            }
        }

        $title = '';
        $sql = $dsql->SetQuery("SELECT `title`, `starttime` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $title = $ret[0]['title'];
        }else{
            return array("state" => 200, "info" => '信息不存在！');
        }

        //保存到主表
        if($type){
            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `pulltype` = '1', `pullurl_pc` = '$pc', `pullurl_touch` = '$touch' WHERE `id` = " . $id);
        }else{
            $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `pulltype` = '0' WHERE `id` = " . $id);
        }
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'live', '', $id, 'update', '更改直播类型('.$title.')', $url, $archives);

            return array("state" => 200, "info" => '数据出错！');
        } else {
            return 'ok';
        }
    }


    //更改直播限制
    public function updateLiveLimit(){
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $id         = (int)$param['id'];
        $catid      = (int)$param['catid'];
        $password   = $param['password'];
        $startmoney = (float)$param['startmoney'];
        $endmoney   = (float)$param['endmoney'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');

        if($catid == 1){
            if(empty($password)){
                return array("state" => 200, "info" => $langData['siteConfig'][20][502]);  //请填写密码
            }
        }elseif($catid == 2){
            if(empty($startmoney)){
                return array("state" => 200, "info" => $langData['siteConfig'][31][95]);  //请填写开始收费
            }
            if(empty($endmoney)){
                return array("state" => 200, "info" => $langData['siteConfig'][31][96]);  //请填写结束收费
            }
        }

        $title = '';
        $sql = $dsql->SetQuery("SELECT `title`, `starttime` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $title = $ret[0]['title'];
        }else{
            return array("state" => 200, "info" => '信息不存在！');
        }

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `catid` = '$catid', `password` = '$password', `startmoney` = '$startmoney', `endmoney` = '$endmoney' WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '数据出错！');
        } else {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'live', '', $id, 'update', '更改直播限制('.$title.')', $url, $archives);

            return 'ok';
        }
    }


    //更改直播自定义菜单
    public function updateLiveMenu(){
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $id   = (int)$param['id'];
        $menu = $_POST['menu'];

        $title = '';
        $sql = $dsql->SetQuery("SELECT `title`, `starttime` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $title = $ret[0]['title'];
        }else{
            return array("state" => 200, "info" => '信息不存在！');
        }

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');
        if (empty($menu)) return array("state" => 200, "info" => '菜单不得为空！');

        $data = str_replace("\\", '', $menu);
        $json = json_decode($data, true);

        $menu = serialize($json);

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `menu` = '$menu' WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '数据出错！');
        } else {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $id
            );
            $url = getUrlPath($urlParam);
        
            //记录用户行为日志
            memberLog($uid, 'live', '', $id, 'update', '更改自定义菜单('.$title.')', $url, $archives);

            return 'ok';
        }
    }


    /**
     * 生成推流地址
     * @param $streamName 用户专有名
     * @param $vhost 加速域名
     * @param $time 有效时间单位秒
     */
    public function getPushSteam()
    {
        global $userLogin;
        global $dsql;
        $param  = $this->param;
        $userid = $userLogin->getMemberID();
        //$userid = $param['userid'];
        if ($userid == -1) {
            return array("state" => 200, "info" => '请先登录！');
        }
        if (!is_numeric($userid)) return array("state" => 200, "info" => '登录超时，请登录后重试！');

        //用户信息
        $userinfo = $userLogin->getMemberInfo();

        $title         = $param['title'];
        $typeid        = (int)$param['typeid'];
        $catid         = (int)$param['catid'];  //直播类型 0：公开；1：加密；2：收费
        $litpic        = $param['litpic'];
        $ftime         = !empty($param['valid']) ? strtotime($param['valid']) : time();  //直播时间
        $password      = $param['password'];  //加密密码
        $startmoney    = (float)$param['startmoney'];  //开始收费
        $endmoney      = (float)$param['endmoney'];  //结束收费
        $way           = (int)$param['way'];  //直播方式：0：横屏；1：竖屏
        $flow          = (int)$param['flow'];  //流畅度：0：流畅；1：普清；2：高清
        $pulltype      = (int)$param['pulltype'];  //拉流方式：0系统生成,1使用第三方拉流地址
        $pullurl_pc    = trim($param['pullurl_pc']);  //拉流地址pc
        $pullurl_touch = trim($param['pullurl_touch']);  //拉流地址移动端
        $note          = $param['note'];
        $menu          = empty($param['menu']) ? array() : $param['menu'];
        $lnglat        = $param['lnglat'];
        $location      = $param['location'];
        $pubdate       = time();

        if($lnglat){
            $a = explode(",", $lnglat);
            $lng = $a[0];
            $lat = $a[1];
        }else{
            $lng = $lat = "";
        }

        include HUONIAOINC."/config/live.inc.php";
        $arcrank     = (int)$customFabuCheck;

        if (empty($title)) {
            return array("state" => 200, "info" => '请填写直播标题！');
        }
        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传直播封面！');
        }
        if ($catid == 1) {
            if (empty($password)) return array("state" => 200, "info" => '密码不得为空');
        } elseif ($catid == 2) {
            if (empty($startmoney)) return array("state" => 200, "info" => '开始收费不得为空');
            if (empty($endmoney)) return array("state" => 200, "info" => '结束收费不得为空');
        }

        if($pulltype && empty($pullurl_pc) && empty($pullurl_touch)) return array("state" => 200, "info" => '请输入第三方拉流地址');

        $member = getMemberDetail($userid);
        if ($member['certifyState'] != 1) return array("state" => 200, "info" => '请先完成实名认证！');

        $menuArr = array();
        if($menu){
            foreach ($menu as $key => $value) {
                $value['sys'] = (int)$value['sys'];
                $value['show'] = (int)$value['show'];

                if(empty($value['name']) || (!(int)$value['sys'] && empty($value['url'])) )  {
                    return array("state" => 200, "info" => '请填写完整直播菜单');
                }
                $menuArr[] = $value;
            }
        }else{
            $menuArr = array(
                0 => array('sys' => 0, 'name' => '介绍', 'show' => 1, 'url' => ''),
                1 => array('sys' => 1, 'name' => '图文', 'show' => 1, 'url' => ''),
                2 => array('sys' => 2, 'name' => '互动', 'show' => 1, 'url' => ''),
                3 => array('sys' => 3, 'name' => '商品', 'show' => 1, 'url' => ''),
                4 => array('sys' => 4, 'name' => '榜单', 'show' => 1, 'url' => ''),
            );
        }
        $menuData = serialize($menuArr);
        if(strlen($menuData) > 2000){
            echo '{"state": 200, "info": "直播菜单总长度超出限制"}';
            exit();
        }

        //需要支付费用
        $amount = 0;

        //是否独立支付 普通会员或者付费会员超出限制
        $alonepay = 0;

        $alreadyFabu = 0; // 付费会员当天已免费发布数量

        //企业会员或已经升级为收费会员的状态才可以发布
        // if($userinfo['userType'] == 1){

            $toMax = false;

            $memberLevelAuth = getMemberLevelAuth($userinfo['level']);
            $liveCount = (int)$memberLevelAuth['live'];

            //本周
            $today = GetMkTime(date('Y-m-d',(time()-((date('w',time())==0?7:date('w',time()))-1)*24*3600)));
            $tomorrow = $today + 604800;

            $liveFabuCount = 0;
            //直播已发布数量
            $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__livelist` WHERE `user` = $userid AND `pubdate` >= $today AND `pubdate` < $tomorrow AND `alonepay` = 0 AND `waitpay` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $liveFabuCount = $ret[0]['total'];
            }

            $alreadyFabu = $liveFabuCount;
            if($alreadyFabu >= $liveCount){
                $toMax = true;
            }else{
                 $arcrank = 1;
            }

            // 普通会员或者付费会员当天发布数量达上限
            if($userinfo['level'] == 0 || $toMax){

                global $cfg_fabuAmount;
                global $cfg_fabuFreeCount;
                $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();
                $fabuFreeCount = $cfg_fabuFreeCount ? unserialize($cfg_fabuFreeCount) : array();

                //超出免费次数
                if($fabuAmount && (($fabuFreeCount && $fabuFreeCount['live'] <= $alreadyFabu) || !$fabuFreeCount)){
                    $alonepay = 1;
                    $amount = $fabuAmount["live"];
                    $arcrank = 0;   //需要审核
                }

            }

        // }

        $waitpay = $amount > 0 ? 1 : 0;

        if($userinfo['level']){
            $auth = array("level" => $userinfo['level'], "levelname" => $userinfo['levelName'], "alreadycount" => $alreadyFabu, "maxcount" => $liveCount);
        }else{
            $auth = array("level" => 0, "levelname" => "普通会员", "maxcount" => 0);
        }


        $pushurl = '';
        $sql = $dsql->SetQuery("INSERT INTO `#@__livelist` (`user`, `pushurl`,`title`,`typeid`,`catid`,`ftime`,`password`,`startmoney`,`endmoney`,`way`,`flow`,`litpic`,`state`, `note`, `menu`, `pulltype`, `pullurl_pc`, `pullurl_touch`, `arcrank`, `starttime`, `streamname`, `lng`, `lat`, `location`, `pubdate`, `waitpay`, `alonepay`) VALUES ('$userid', '$pushurl','$title','$typeid','$catid','$ftime','$password','$startmoney','$endmoney','$way','$flow','$litpic','0', '$note', '$menuData', $pulltype, '$pullurl_pc', '$pullurl_touch', '$arcrank', 0, '', '$lng', '$lat', '$location', '$pubdate', '$waitpay', '$alonepay')");
        $lid = $dsql->dsqlOper($sql, "lastid");
        if (is_numeric($lid)) {

            $urlParam = array(
                'service' => 'live',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);

            //记录用户行为日志
            memberLog($userid, 'live', '', $aid, 'insert', '发布信息('.$title.')', $url, $sql);

            dataAsync("live",$lid);  // 直播、新增
            autoShowUserModule($userid,'live');  // 发布直播
            $maxid = $lid; //自增id

            //直播分类
            $archives = $dsql->SetQuery("SELECT `typename` FROM `#@__livetype` WHERE `id` = " . $typeid);
            $result   = $dsql->dsqlOper($archives, "results");
            $typename = !empty($result[0]['typename']) ? $result[0]['typename'] : '';
            //直播类型
            $catidtype = empty($catid) ? '公开' : ($catid == 1 ? '加密' : '收费');
            //流畅度
            $flowname = $flow == 1 ? '流畅' : ($flow == 2 ? '普清' : '高清');
            //直播方式
            $wayname = empty($way) ? '横屏' : '竖屏';

            //如果是不需要支付的，创建推流地址和聊天室
            if(!$waitpay){

                $this->param = array('id' => $maxid);
                $createLiveDetail = $this->createLiveDetail();
                if($createLiveDetail['state'] == 100){
                    $pushurl = $createLiveDetail['pushurl'];
                }
                if ($arcrank && !$toMax) {
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    global $cfg_returnInteraction_live;    //直播积分
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_live > 0) {
                        $infoname = getModuleTitle(array('name' => 'live'));
                        //直播发布得积分
                        $date = GetMkTime(time());
                        global  $userLogin;
                        $livepoint = $cfg_returnInteraction_live;
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$livepoint' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint+$livepoint);
                        //保存操作日志
                        $info = '发布'.$infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$livepoint', '$info', '$date','zengsong','1','$userpoint')");//发布直播得积分
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount" => $livepoint,
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
                        updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                    }
                }

                return array("pushurl" => $pushurl, "id" => $maxid, "typename" => $typename, "catidtype" => $catidtype, "wayname" => $wayname, "flowname" => $flowname);

            }else{
                return array("auth" => $auth, "aid" => $lid, "amount" => $amount);
            }
        } else {
            return array("state" => 200, "info" => '直播创建失败！');
        }

    }

    //审核通过，执行后续操作（拉流地址、聊天室、主播）
    public function createLiveDetail(){
        global $dsql;
        global $userLogin;
        $id = (int)$this->param['id'];  //直播ID
        $userinfo = $userLogin->getMemberInfo();
        $sql = $dsql->SetQuery("SELECT * FROM `#@__livelist` WHERE `arcrank` = 1 AND `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

            $pulltype = $ret[0]['pulltype'];
            $userid = $ret[0]['user'];
            $title = $ret[0]['title'];
            $pushurl = '';

            if(empty($pulltype)){

                $streamName = 'live' . $id . '-' . $userid;
                $vhost      = $this->aliLive->vhost;
                $time       = time() + 2592000;  //1个月有效期
                $videohost  = $this->aliLive->video_host;
                $vhost      = $this->aliLive->vhost;
                $appName    = $this->aliLive->appName;
                $privateKey = $this->aliLive->privateKey;

                if ($privateKey) {
                    $auth_key = md5('/' . $appName . '/' . $streamName . '-' . $time . '-0-0-' . $privateKey);
                    //生成推流地址
                    $pushurl = $videohost . '/' . $appName . '/' . $streamName . '?auth_key=' . $time . '-0-0-' . $auth_key;
                } else {
                    //生成推流地址
                    $pushurl = $videohost . '/' . $appName . '/' . $streamName;
                }
                $arc = $dsql->SetQuery("UPDATE `#@__livelist` SET `pushurl` = '$pushurl', `streamname` = '$streamName' WHERE `id` = $id");
                $dsql->dsqlOper($arc, "update");
            }

            $this->param = $id . '-' . $userid;
            $this->addLiveAppRecordConfig();

            //创建聊天室
            $param = array(
                "service" => "live",
                "template" => "detail",
                "id" => $id
            );

            $configHandels = new handlers('siteConfig', "createChatRoom");
            $configHandels->getHandle(array("userid" => $userid, "mark" => "chatRoom" . $id, "title" => $title, "url" => getUrlPath($param)));

            // 创建主播
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_anchor` WHERE `uid` = $userid");
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res){
                $now = time();
                $sql = $dsql->SetQuery("INSERT INTO `#@__live_anchor` (`uid`, `rec`, `pubdate`) VALUES ($userid, 0, $now)");
                $dsql->dsqlOper($sql, "lastid");
            }

            return array("state" => 100, "pushurl" => $pushurl);

        }else{
            return array("state" => 200, "info" => '直播不存在！');
        }
    }

    /**
     * 生成拉流地址
     * @param $streamName 用户专有名
     * @param $vhost 加速域名
     * @param $type 视频格式 支持rtmp、flv、m3u8三种格式
     */
//    public function getPullSteam(){
//        $type=$_GET['type'];
//        $id=$_GET['id'];
//        global $dsql;
//        $sql = $dsql->SetQuery("SELECT `flv`,`m3u8` FROM `#@__livelist` WHERE `id` = $id");
//        $ret = $dsql->dsqlOper($sql, "results");
//        if(!empty($ret)){
//            switch ($type){
//                case 'flv':
//                    $pullurl=$ret[0]['flv'];
//                    break;
//                case 'm3u8':
//                    $pullurl=$ret[0]['m3u8'];
//                    break;
//            }
//            return $pullurl;
//        }else{
//            return array("state" => 200, "info" => '该直播不存在！');
//        }
//    }
    /**
     * 生成拉流地址
     * @param $streamName 用户专有名
     * @param $vhost 加速域名
     * @param $type 视频格式 支持rtmp、flv、m3u8三种格式
     */
    public function getPullSteam()
    {
        global $dsql;
        global $cfg_secureAccess;
        $param = $this->param;
        $type  = $param['type'];
        $id    = $param['id'];
        $sql   = $dsql->SetQuery("SELECT `user` FROM `#@__livelist` WHERE `id` = $id");
        $res   = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $streamName = 'live' . $id . '-' . $res[0]['user'];
            $time       = time() + 300;
            $appName    = $this->aliLive->appName;
            $privateKey = $this->aliLive->privateKey;
            $vhost      = $this->aliLive->vhost;
            $playhost   = $this->aliLive->play_host;
            $playprivatekey = $this->aliLive->playprivatekey;
            $url        = '';
            switch ($type) {
                case 'flv':
                    $host = (strstr($vhost, 'http') ? '' : $cfg_secureAccess) . $playhost;
                    $url  = '/' . $appName . '/' . $streamName . '.flv';
                    break;
                case 'm3u8':
                    $host = (strstr($vhost, 'http') ? '' : $cfg_secureAccess) . $playhost;
                    $url  = '/' . $appName . '/' . $streamName . '.m3u8';
                    break;
                default:
                    $host = (strstr($vhost, 'http') ? '' : $cfg_secureAccess) . $playhost;
                    $url  = '/' . $appName . '/' . $streamName . '.m3u8';
                    break;
            }
            if ($playprivatekey) {
                $auth_key = md5($url . '-' . $time . '-0-0-' . $playprivatekey);
                $url      = $host . $url . '?auth_key=' . $time . '-0-0-' . $auth_key;
            } else {
                $url = $host . $url;
            }
            return $url;
        } else {
            return array("state" => 200, "info" => '该直播不存在！');
        }
    }

    /**
     * 配置 APP 录制，输出内容保存到 OSS 中
     * @param $domainName  直播域名
     * @param $appName     应用名
     */
    public function addLiveAppRecordConfig()
    {
        $streamname      = $this->param;
        require(HUONIAOINC . "/config/live.inc.php");
        $apiParams  = array(
            'Action' => 'AddLiveAppRecordConfig',
            'DomainName' => $this->aliLive->play_host,
            'AppName' => $this->aliLive->appName,
            'StreamName' => $streamname,
            'OssBucket'  => $custom_OSSBucket,
            'OssEndpoint'=> $custom_OSSUrl,

            'RecordFormat.1.Format' => 'm3u8',
            'RecordFormat.1.CycleDuration' => $this->aliLive->duration,
            'RecordFormat.1.OssObjectPrefix' => 'record/'.$this->aliLive->appName.'/'.$streamname.'/{Sequence}{EscapedStartTime}{EscapedEndTime}',
            'RecordFormat.1.SliceOssObjectPrefix' => 'record/'.$this->aliLive->appName.'/'.$streamname.'/{UnixTimestamp}_{Sequence}',

            'RecordFormat.2.Format' => 'flv',
            'RecordFormat.2.CycleDuration' => $this->aliLive->duration,
            'RecordFormat.2.OssObjectPrefix' => 'record/'.$this->aliLive->appName.'/'.$streamname.'/{Sequence}{EscapedStartTime}{EscapedEndTime}',

            'RecordFormat.3.Format' => 'mp4',
            'RecordFormat.3.CycleDuration' => $this->aliLive->duration,
            'RecordFormat.3.OssObjectPrefix' => 'record/'.$this->aliLive->appName.'/'.$streamname.'/{Sequence}{EscapedStartTime}{EscapedEndTime}'
        );
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 查询在线人数
     * @param $domainName  直播域名
     * @param $appName     应用名
     * @param $streamName  推流名
     */
    public function describeLiveStreamOnlineUserNum()
    {
        $param      = $this->param;
        $streamname = $param['Streamname'];
        $apiParams  = array(
            'Action' => 'DescribeLiveStreamOnlineUserNum',
            'DomainName' => $this->aliLive->vhost,
            'AppName' => $this->aliLive->appName,
            'StreamName' => $streamname,
        );

        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 查询直播浏览人数
     */
    public function getLiveNum()
    {
        global $dsql;
        $param      = $this->param;
        $streamname = $param['Streamname'];
        if (!empty($streamname)) {
            $wheresql = " and streamname='$streamname' ";
        }
        $sql = $dsql->SetQuery("SELECT `id`,`title`,`streamname`,`click` FROM `#@__livelist` WHERE 1=1 $wheresql ");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $click = !empty($res[0]['click']) ? $res[0]['click'] : 0;
            return array("click" => $click);
            //echo '{"state":100,"info":'$click'}';exit;
        } else {
            return array("state" => 200, "info" => '无数据');
        }
    }

    /**
     * 获取某一时间段内某个域名(或域名下某应用或某个流)的推流记录
     * @param $domainName  直播域名
     * @param $appName     应用名
     * @param $streamName  推流名
     */
    public function describeLiveStreamsPublishList()
    {
        $apiParams = array(
            'Action' => 'DescribeLiveStreamsPublishList',
            'DomainName' => $this->aliLive->vhost,
            'AppName' => $this->aliLive->appName,
            'StartTime' => gmdate("Y-m-d\T00:00:00\Z", strtotime("-30 day")),
            'EndTime' => gmdate("Y-m-d\T00:00:00\Z"),
//            'PageSize'=>2,
//            'PageNumber'=>1
        );
        //return  $apiParams;
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");

    }

    /**
     * 查询推流在线列表
     * @param $domainName  直播域名
     * @param $appName     应用名
     * @param $streamName  推流名
     */
    public function describeLiveStreamsOnlineList()
    {
        $apiParams = array(
            'Action' => 'DescribeLiveStreamsOnlineList',
            'DomainName' => $this->aliLive->vhost,
            'AppName' => $this->aliLive->appName,
        );
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 查询录制索引文件
     * @param $domainName  直播域名
     * @param $appName     应用名
     * @param $streamName  推流名
     */
    public function describeLiveStreamRecordIndexFiles()
    {
        $param = $this->param;
        //$StreamName = $param['StreamName'];
        $apiParams = array(
            'Action' => 'DescribeLiveStreamRecordIndexFiles',
            'DomainName' => $this->aliLive->play_host,
            'AppName' => $this->aliLive->appName,
            'StreamName' => $param,
            'StartTime' => gmdate("Y-m-d\T00:00:00\Z", strtotime("-1 day")),
            'EndTime' => gmdate("Y-m-d\T00:00:00\Z", strtotime("+1 day")),
            'PageNum' => 1,
            'PageSize' => 10,
            'Order' => 'asc'
        );

        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 查询单个录制索引文件
     * @param $domainName  直播域名
     * @param $appName     应用名
     * @param $streamName  推流名
     */
    public function describeLiveStreamRecordIndexFile()
    {
        $apiParams = array(
            'Action' => 'DescribeLiveStreamRecordIndexFile',
            'DomainName' => $this->aliLive->vhost,
            'AppName' => $this->aliLive->appName,
            'StreamName' => 'test1',
            'RecordId' => '396e74b2-5097-439c-b463-94dbc06ef502'
        );
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 查询推流黑名单列表
     * @param $domainName  直播域名
     * @param $appName     应用名
     */
    public function describeLiveStreamsBlockList()
    {
        $apiParams = array(
            'Action' => 'DescribeLiveStreamsBlockList',
            'DomainName' => $this->aliLive->vhost
        );
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 禁止直播流推送
     * @param $domainName  直播域名
     * @param $appName     应用名
     */
    public function forbidLiveStream()
    {
        $param      = $this->param;
        $streamname = $param['streamname'];
        $apiParams  = array(
            'Action' => 'ForbidLiveStream',
            'DomainName' => $this->aliLive->vhost,
            'AppName' => $this->aliLive->appName,
            'StreamName' => $streamname,
            'LiveStreamType' => 'publisher'
        );
        return $this->aliLive->aliApi($apiParams, $credential = "GET", $domain = "live.aliyuncs.com");
    }

    /**
     * 直播信息详细
     * @return array
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $archives = $dsql->SetQuery("SELECT `id`,`user`,`title`,`up`,`litpic`,`way`,`streamname`,`state`,`click`,`replay`, `ossurl`, `catid` , `startmoney`, `endmoney` , `ftime`, `note`, `menu`, `pulltype`, `pullurl_pc`, `pullurl_touch`, `typeid`, `lng`, `lat`, `location`, `adv`, `replaystate` FROM `#@__livelist` WHERE `id` = " . $id." AND `arcrank` = 1");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results[0]['lng'] = $results[0]['lng'];
            $results[0]['lat'] = $results[0]['lat'];
            $results[0]['location'] = $results[0]['location'];
            if(!empty($results[0]['lng']) && !empty($results[0]['lat'])){
                $results[0]["lnglat"]     = $results[0]['lng'] . ',' . $results[0]['lat'];
            }

            if (!empty($results[0]['litpic'])) {
                if (strpos($results[0]['litpic'], 'images')) {
                    $results[0]['litpic'] = $cfg_secureAccess . $cfg_basehost . $results[0]['litpic'];
                } else {
                    $results[0]['litpic'] = getFilePath($results[0]['litpic']);
                }
            } else {
                $results[0]['litpic'] = $cfg_secureAccess . $cfg_basehost . '/static/images/404.jpg';
            }

            $click = $results[0]['click'] + $results[0]['replay'];
            $results[0]['click'] = $click >= 10000 ? sprintf("%.1f", $click / 10000)."万" : $click;

            //查找 正在直播 直播结束
            $archives   = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `user` = '".$results[0]['user']."' and state in (1,2)");
            $totalCount = $dsql->dsqlOper($archives, "totalCount");
            $results[0]['livenum'] = $totalCount;
            $results[0]['user'] = $results[0]['user'];

            $sql  = $dsql->SetQuery("SELECT `typename` FROM `#@__livetype` where id = '".$results[0]['typeid']."'");
            $ret  = $dsql->dsqlOper($sql, "results");
            $results[0]['typename'] = !empty($ret[0]['typename']) ? $ret[0]['typename'] : '';

            //获取主播信息
            $member                 = getMemberDetail($results[0]['user']);
            $results[0]['nickname'] = !empty($member['nickname']) ? $member['nickname'] : $member['username'];
            $results[0]['photo']    = !empty($member['photo']) ? $member['photo'] : '/static/images/404.jpg';
            //用户查看主播列表页面
            $param                 = array(
                "service" => "live",
                "template" => "anchor_index",
                "userid" => $results[0]['user']
            );
            $results[0]['userurl'] = getUrlPath($param);
            $results[0]['start_time'] = $results[0]['ftime'] ? date("Y/m/d H:i", $results[0]['ftime']) : '暂未开播';


            //用户是否可以发言
            // $uid                     = $userLogin->getMemberID();//用户
            // $results[0]['token']     = '';
            // $results[0]['username']  = '';
            // $results[0]['userphoto'] = '';

            //查询当前配置
            // $custom_rongKeyID = $custom_rongKeySecret = "";
            // $sql              = $dsql->SetQuery("SELECT * FROM `#@__app_config` LIMIT 1");
            // $ret              = $dsql->dsqlOper($sql, "results");
            // if ($ret) {
            //     $data                 = $ret[0];
            //     $custom_rongKeyID     = $data['rongKeyID'];
            //     $custom_rongKeySecret = $data['rongKeySecret'];
            // }
            // $appKey    = $custom_rongKeyID;
            // $appSecret = $custom_rongKeySecret;
            // //获取token
            // include_once(HUONIAOINC . "/class/imserver/im.class.php");
            // $RongCloud = new im($appKey, $appSecret);
            // if ($uid > 0) {
            //     $uinfo    = $userLogin->getMemberInfo($uid);
            //     $token    = $RongCloud->getToken($uid, $uinfo['username'], $uinfo['photo']);
            //     $tokenArr = json_decode($token, true);
            //     if ($tokenArr['code'] != 200) {
            //         $results[0]['token']  = '获取token参数错误';
            //         //return array("state" => 200, "info" => '获取token参数错误！');
            //     }else{
            //         $results[0]['token']     = $tokenArr['token'];
            //     }
            //     $results[0]['appKey']    = $appKey;
            //     $results[0]['username']  = $uinfo['nickname'] ? $uinfo['nickname'] : $uinfo['username'];
            //     $results[0]['userphoto'] = !empty($uinfo['photo']) ? $uinfo['photo'] : '/static/images/noPhoto_40.jpg';
            // } else {
            //     //必须默认个token
            //     $token    = $RongCloud->getToken($uid, '默认', '');
            //     $tokenArr = json_decode($token, true);
            //     if ($tokenArr['code'] != 200) {
            //         $results[0]['token']  = '获取token参数错误';
            //         //return array("state" => 200, "info" => '获取token参数错误！');
            //     }else{
            //         $results[0]['token']  = $tokenArr['token'];
            //     }
            //     $results[0]['appKey'] = $appKey;
            // }

            //$detail['starttime']  = date("Y-m-d H:i:s", $results[0]['starttime']);
            $results[0]['wayname'] = $results[0]['way'] == 1 ? '竖屏' : '横屏';

            //是否点赞
            $iszan = 0;
            // $sql                    = $dsql->SetQuery("SELECT * FROM `#@__site_zanmap` WHERE `vid` = $id AND `temp` = 'live' ");
            $sql                    = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all` WHERE `type` = '0' AND `tid` = $id AND `module` = 'live' AND `action` = 'detail' ");
            $ret                    = $dsql->dsqlOper($sql, 'totalCount');
            $results[0]['zanCount'] = $ret;


            // 是否关注 个人
            $uid = $userLogin->getMemberID();
            $userid = $results[0]['user'];
            $isfollow = 0;
            if($uid > 0){
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__live_follow` WHERE `fid` = '$userid' AND `tid` = '$uid'");
                $isfollow = $dsql->dsqlOper($archives, "totalCount");

                //是否相互关注
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $uid AND `fid` = " . $userid);
                $isMfollow = $dsql->dsqlOper($sql, "results");

                /* $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_zanmap` WHERE `vid` = $id AND `userid` = $uid AND `temp` = 'live'");
                $ret = $dsql->dsqlOper($sql, "results");
                $iszan = $ret ? 1 : 0; */
                $zanparams = array(
                    "module" => "live",
                    "temp"   => "detail",
                    "id"     => $id,
                    "check"  => 1
                );
                $iszan = checkIsZan($zanparams);
                $iszan = $iszan == 'has' ? 1 : 0;
            }
            $results[0]['isfollow'] = $isfollow;
            $results[0]['isMfollow'] = $isMfollow[0]['id'] ? 1 : 0;
            $results[0]['iszan'] = $iszan;

            //粉丝人数
            $sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $results[0]['user']);
            $fansret = $dsql->dsqlOper($sql, "results");
            $results[0]['totalFans'] = $fansret[0]['t'];



            // 自媒体信息
            // $obj = new article();
            // $check = $obj->selfmedia_verify($results[0]['user'], '', 'check', $vdata);
            // if($check == "ok"){
            //     //是否关注 媒体号
            //     $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $uid AND `fid` = " . $vdata['id'] . " AND `fortype` = 'media'");
            //     $ret = $dsql->dsqlOper($sql, "results");
            //     $vdata['isfollow'] = $ret ? 1 : 0;
            // }
            // $results[0]['media'] = $check == "ok" ? $vdata : array();

            $menu = "";
            if($results[0]['menu']){
                $menu = unserialize($results[0]['menu']);
                if($menu !== false){
                    foreach ($menu as $key => $value) {
                        if(!$value['show']){
                            unset($menu[$key]);
                        }
                    }
                    $menu = array_values($menu);
                }
            }
            if($menu == ""){
                $menu = array(
                    0 => array('sys' => 0, 'name' => '介绍', 'show' => 1, 'url' => ''),
                    1 => array('sys' => 1, 'name' => '图文', 'show' => 1, 'url' => ''),
                    2 => array('sys' => 2, 'name' => '互动', 'show' => 1, 'url' => ''),
                    3 => array('sys' => 3, 'name' => '商品', 'show' => 1, 'url' => ''),
                    4 => array('sys' => 4, 'name' => '榜单', 'show' => 1, 'url' => ''),
                );
            }
            $results[0]['menu'] = $menu;

            //创建聊天室
            $param = array(
                "service" => "live",
                "template" => "detail",
                "id" => $id
            );
            $configHandels = new handlers('siteConfig', "createChatRoom");
            $configHandels->getHandle(array("userid" => $results[0]['user'], "mark" => "chatRoom" . $id, "title" => $results[0]['title'], "url" => getUrlPath($param)));

        }
        return $results;
    }

    /**
     * 判断用户的直播条数是否超出限制
     */
    public function checkLiveNum()
    {
        global $dsql;
        $param = $this->param;

        $id = $param['user'];

        //查找 正在直播 直播结束 拉入黑名单的
        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE user = '$id' and state in (0,1,2)");
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //会员信息
        $member = getMemberDetail($id);
        if (!empty($member['level'])) {
            $archives   = $dsql->SetQuery("SELECT * FROM `#@__member_level` WHERE `id` = " . $member['level']);
            $results    = $dsql->dsqlOper($archives, "results");
            $fabuAmount = !empty($results[0]['privilege']) ? unserialize($results[0]['privilege']) : array();

        } else {
            require(HUONIAOINC . "/config/settlement.inc.php");
            $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array();

        }
        if ($member['certifyState'] != 1) return -2;

        if ($totalCount >= $fabuAmount['live']) {
            //return array("state" => 200, "info" => '超出会员限制');
            return -1;
        } else {
            //return 'ok';
            return 1;
            //echo '{"state":100,"info":"ok"}';exit;
        }
    }

    /**
     * 用户删除历史直播
     */
    public function delUserLive()
    {
        global $dsql;
        global $userLogin;
        global $autoload;
        $uid = $userLogin->getMemberID();
        if ($uid == -1) return array("state" => 200, "info" => '登录超时，请重新登录！');

        $id = $this->param['id'];

        require(HUONIAOINC . "/config/live.inc.php");
        if ($customCommentCheck == 1) return array("state" => 200, "info" => '没有权限删除！');

        if (empty($id)) return array("state" => 200, "info" => '没有要删除的信息！');

        $archives = $dsql->SetQuery("SELECT * FROM `#@__livelist` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $this->param = $results[0]['streamname'];
            $detail      = $this->describeLiveStreamRecordIndexFiles();
            $file        = $detail['RecordIndexInfoList']['RecordIndexInfo'][0]['OssObject'];
            //require(HUONIAOINC."/config/live.inc.php");
            $OSSConfig = array(
                "bucketName" => "$custom_OSSBucket",
                "endpoint" => "$custom_OSSUrl",
                "accessKey" => "$custom_OSSKeyID",
                "accessSecret" => "$custom_OSSKeySecret"
            );
            $autoload  = true;
            include_once HUONIAOINC . '/class/aliyunOSS.class.php';
            $aliyunOSS = new aliyunOSS($OSSConfig);

            if ($file) {

                $aliyunOSS->delete($file);
                $ossError = $aliyunOSS->error();
                if (empty($ossError)) {
                    $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id` in (" . $id . ") and user='$uid'");
                    $dsql->dsqlOper($archives, "update");
                
                    //记录用户行为日志
                    memberLog($uid, 'live', '', 0, 'delete', '删除信息('.$id.')', '', $archives);

                    echo '{"state":100,"info":"删除成功！"}';
                    exit;
                } else {
                    return array("state" => 200, "info" => '删除错误！');
                }
            } else {
                $archives = $dsql->SetQuery("DELETE FROM `#@__livelist` WHERE `id` in (" . $id . ") and user='$uid'");
                $dsql->dsqlOper($archives, "update");
                
                //记录用户行为日志
                memberLog($uid, 'live', '', 0, 'delete', '删除信息('.$id.')', '', $archives);

                return "删除成功";
            }
        } else {
            return array("state" => 200, "info" => '没有要删除的信息！');
        }
    }

    /**
     * 用户直播时间限制
     */
    public function userLimitTime()
    {
        global $dsql;
        $uid = $this->param['user'];

        //会员信息
        if (empty($uid)) return array("state" => 200, "info" => '登录超时，请重新登录！');

        $member = getMemberDetail($uid);
        if (!empty($member['level'])) {
            $archives   = $dsql->SetQuery("SELECT * FROM `#@__member_level` WHERE `id` = " . $member['level']);
            $results    = $dsql->dsqlOper($archives, "results");
            $fabuAmount = !empty($results[0]['privilege']) ? unserialize($results[0]['privilege']) : array('livetime' => 0);
        } else {
            require(HUONIAOINC . "/config/settlement.inc.php");
            $fabuAmount = $cfg_fabuAmount ? unserialize($cfg_fabuAmount) : array('livetime' => 0);
        }

        //查询用户的已经直播的时间
        $timesql     = $dsql->SetQuery("SELECT sum(livetime) as totaltime FROM `#@__livelist` WHERE `user` ='$uid' and state in (1,2)");
        $timeresults = $dsql->dsqlOper($timesql, "results");
        $useTime     = round($timeresults[0]['totaltime'] / (60 * 60 * 1000), 2);

        if ($useTime > $fabuAmount['livetime']) {
            return -1;
        } else {
            return 1;
        }
    }

    /**
     * 记录直播当前时间
     * 直播的播时间
     */
    public function updateTime()
    {
        global $dsql;
        $id       = $this->param['id'];//当前直播活动
        $time     = $this->param['time'];//当前直播时间
        $time     = substr($time, 0, -3); //java时间戳需要去除后三位
        $livetime = $this->param['livetime'];//直播的播时间

        if (empty($id)) return array("state" => 200, "info" => '参数错误');

        $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET `starttime` = '$time',`livetime`='$livetime' WHERE `id` = " . $id);
        $dsql->dsqlOper($archives, "update");
        return 'ok';
    }

    /**
     * 获取时间
     */
    public function selLiveTime()
    {
        global $dsql;
        $id = $this->param['id'];//当前直播活动

        $archives = $dsql->SetQuery("SELECT `id`,`livetime` FROM `#@__livelist` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");

        return array("livetime" => $results[0]['livetime']);
    }

    /**
     * 获取用户的token
     */
    public function getUserToken()
    {
        $param    = $this->param;
        $userid   = $param['userid'];
        $username = $param['username'];
        $userlogo = $param['userlogo'];
        $token    = $this->RongCloud->getToken($userid, $username, $username);

        $tokenArr = json_decode($token, true);
        if ($tokenArr['code'] != 200) {
            return array("state" => 200, "info" => '操作失败！');
        } else {
            echo '{"state":100,"info":"' . $tokenArr['token'] . '"}';
            exit;
            //return $tokenArr;
        }
    }

    /**
     * 创建聊天室
     */
    public function createRoom()
    {
        global $dsql;

        $param  = $this->param;
        $id     = $param['id'];
        $userid = $param['userid'];
        $chatid = 'chatRoom' . $id;

        //查询直播间信息
        $sql = $dsql->SetQuery("SELECT `title`, `user` FROM `#@__livelist` WHERE `id` = ". $id);
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $title = $ret[0]['title'];

            //创建聊天室
            $param = array(
                "service" => "live",
                "template" => "detail",
                "id" => $id
            );
            $configHandels = new handlers('siteConfig', "createChatRoom");
            $configHandels->getHandle(array("userid" => $userid, "mark" => "chatRoom" . $id, "title" => $title, "url" => getUrlPath($param)));

            return $chatid;
        }else{
            return array("state" => 200, "info" => '直播间不存在或已经删除！');
        }

    }

    /**
     * 聊天室禁言
     */
    public function limitTalk()
    {
        $param = $this->param;

        $id       = $param['id'];
        $chatname = $param['chatname'];
        $time     = $param['time'];

        $token    = $this->RongCloud->addGagUser($id, $chatname, $time);
        $tokenArr = json_decode($token, true);
        if ($tokenArr['code'] != 200) {
            return array("state" => 200, "info" => '操作失败！');
        } else {
            echo '{"state":100,"info":"操作成功"}';
            exit;
        }
    }

    /**
     * 聊天室解除禁言
     */
    public function unLimitTalk()
    {
        $param = $this->param;

        $id       = $param['id'];
        $chatname = $param['chatname'];

        $token    = $this->RongCloud->rollbackGagUser($id, $chatname);
        $tokenArr = json_decode($token, true);
        print_R($tokenArr);
        exit;
    }

    /**
     * 用户发送信息插入数据库中
     */
    public function chatTalk()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;
        if($userLogin->getMemberID() == -1)
        {
            // return array("state" => 200, "info" => '请登录！');
        }
        $chatid    = $param['chatid'];
        $userid    = $param['userid'];
        $username  = $param['username'];
        $userphoto = $param['userphoto'];
        $content   = addslashes($param['content']);
        $system    = $param['system'];

        $ftime = GetMkTime(time());
        if (empty($chatid) || empty($content)) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        if(!$system && (strstr($content, "__T__:") || strstr($content, "__H__:") || strstr($content, "__L__:"))){
            return array("state" => 200, "info" => '内容非法！');
        }

        if(!strstr($chatid, "chatroom")){
            $chatid = "chatroom".$chatid;
        }
        if(strstr($content, "__T__:")){
            $path = str_replace("__T__:", "",$content);
            $content = '__T__:'. getFilePath($path);
        }

        $archives = $dsql->SetQuery("INSERT INTO `#@__livechat` (`chatid`,`userid`,`username`,`userphoto`,`content`,`ftime`,`ip`) VALUES ('$chatid','$userid','$username','$userphoto','$content','$ftime','" . GetIP() . "')");
        $lid      = $dsql->dsqlOper($archives, "lastid");

        if ($lid) {
            return "评论成功";
        } else {
            return array("state" => 200, "info" => '评论失败！');
        }
    }

    /**
     * 聊天室聊天记录查询
     */
    public function talkList()
    {
        global $dsql;
        global $userLogin;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();

        $page     = $param['page'];
        $pageSize = $param['pageSize'];
        $chatid   = $param['chatid'];
        $date     = $param['date'];

        if (!empty($chatid)) {
            $where .= " and chatid='$chatid'";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archivesCount = $dsql->SetQuery("SELECT `id` FROM `#@__livechat` WHERE 1 = 1" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archivesCount, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');



        if($date){
            $where .= ' AND `ftime` >= ' . $date;
        }

        $order = " ORDER BY ftime DESC";

        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";
        $archives = $dsql->SetQuery("SELECT id,chatid,userid,username,userphoto,content,ftime FROM `#@__livechat` WHERE 1 = 1" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        foreach ($results as $k => $v){
            //红包
            if(strstr($v['content'], "__H__:")){
                //检查是否被抢完
                $h_id = str_replace("__H__:", "", $v['content']);
                $sql = $dsql->SetQuery("SELECT `state`,`note` FROM `#@__live_hongbao` WHERE `id` = $h_id");
                $ret = $dsql->dsqlOper($sql, "results");
                $results[$k]['note'] = $ret[0]['note'] ? $ret[0]['note'] : '恭喜发财，大吉大利';

                if($ret[0]['state'] == 1){
                    $results[$k]['h_state'] = 1; //已抢完
                }else{
                    //检查自己是否抢过
                    $is_sql   = $dsql->SetQuery("SELECT `id` FROM `#@__live_hrecv_list` WHERE `hid` = $h_id AND `recv_user` = {$userLogin->getMemberID()}");
                    $is_count = $dsql->dsqlOper($is_sql, "totalCount");
                    $results[$k]['h_state'] = $is_count ? 2 : ''; //已抢过
                }
            }
            //礼物
            if(strstr($v['content'], "__L__:")){
                //检查是否被抢完
                $h_id = str_replace("__L__:", "", $v['content']);
                $sql = $dsql->SetQuery("SELECT * FROM `#@__live_reward` WHERE `id` = $h_id");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $results[$k]['is_gift'] = $ret[0]['gift_id'] ? 1 : 0;
                    $results[$k]['num'] = $ret[0]['num'];
                    $results[$k]['amount'] = $ret[0]['amount'];
                    if($ret[0]['gift_id'] != 0){
                        $sql_ = $dsql->SetQuery("SELECT `gift_name` FROM `#@__live_gift` WHERE `id` = {$ret[0]['gift_id']}");
                        $ret_ = $dsql->dsqlOper($sql_, "results");
                        $results[$k]['gift_name'] = $ret_[0]['gift_name'];
                    }
                }
            }
        }

        if ($results) {
            foreach ($results as $key => $row) {
                $row['userphoto'] = !empty($row['userphoto']) ? $row['userphoto'] : '/static/images/noPhoto_40.jpg';
                $row['ftime']     = date("Y-m-d", $row['ftime']);
                $list[$key]       = $row;
            }
        }
        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "date" => array_reverse($list) ? array_reverse($list)[0]['ftime'] : date( 'm-d H:i:s', time())
        );
        return array("pageInfo" => $pageinfo, "list" => array_reverse($list));

    }


    /**
     * 红包管理
     */
    public function chatRoomHongbaoList()
    {
        global $dsql;
        global $userLogin;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();

        $uid = $userLogin->getMemberID();  //用户ID

        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];
        $chatid   = (int)$param['chatid']; //聊天室ID
        $from     = $param['from'];   //来源
        $state    = (int)$param['state'];  //状态  有剩余

        $where .= " AND h.`live_id` = $chatid";

        //来源-我发出的
        if($from == 'my'){
            $where .= " AND h.`user_id` = $uid";

        //来源-其他人发出
        }elseif($from == 'else'){
            $where .= " AND h.`user_id` != $uid";
        }

        //剩余总数
        $archivesCount = $dsql->SetQuery("SELECT h.`id` FROM `#@__live_hongbao` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` WHERE l.`user` = $uid AND h.`state` = 0" . $where);
        //总条数
        $totalSurplus = $dsql->dsqlOper($archivesCount, "totalCount");

        //状态  有剩余
        if($state){
            $where .= " AND h.`state` = 0";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archivesCount = $dsql->SetQuery("SELECT h.`id` FROM `#@__live_hongbao` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` WHERE l.`user` = $uid" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archivesCount, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $order = " ORDER BY h.`id` DESC";

        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";
        $archives = $dsql->SetQuery("SELECT h.`id`, h.`amount`, h.`user_id`, h.`count`, h.`date`, h.`note`, h.`state`, h.`amount1`, h.`count1` FROM `#@__live_hongbao` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`order_id` = h. `payid`  WHERE p.`status` = 1 AND l.`user` = $uid" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        foreach ($results as $k => $v){

            $list[$k]['id'] = $v['id'];
            $list[$k]['amount'] = $v['amount'];
            $list[$k]['user_id'] = $v['user_id'];
            $list[$k]['count'] = $v['count'];
            $list[$k]['date'] = $v['date'];
            $list[$k]['note'] = $v['note'] ? $v['note'] : '恭喜发财，大吉大利。';
            $list[$k]['state'] = $v['state'];
            $list[$k]['amount1'] = $v['amount1'];
            $list[$k]['count1'] = $v['count1'];

            //用户信息
            $userinfo = $userLogin->getMemberInfo($v['user_id']);
            $list[$k]['userinfo'] = $userinfo;

            //判断是否领过
            $get = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_hrecv_list` WHERE `hid` = " . $v['id'] . " AND `recv_user` = $uid");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $get = 1;
            }
            $list[$k]['get'] = $get;

        }

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "totalSurplus" => $totalSurplus
        );
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 礼物收入管理
     */
    public function chatRoomGiftList()
    {
        global $dsql;
        global $userLogin;
        global $cfg_liveFee;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();

        $uid = $userLogin->getMemberID();  //用户ID

        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];
        $chatid   = (int)$param['chatid'];  //聊天室ID
        $keywords = $param['keywords'];  //搜索
        $orderby  = $param['orderby'];  //排序

        $where .= " AND h.`gift_id` != 0 AND h.`live_id` = $chatid AND h.`payid` = p.`order_id`";

        //搜索用户
        if($keywords){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '$keywords' OR `username` = '$keywords' OR `company` = '$keywords' ORDER BY `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_uid = $ret[0]['id'];

                $where .= " AND h.`reward_userid` = $_uid";
            }else{
                $where .= " AND 1 = 2";
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archivesCount = $dsql->SetQuery("SELECT h.`id` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` WHERE l.`user` = $uid" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archivesCount, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $order = " ORDER BY h.`id` DESC";

        //按收益
        if($orderby){
            $order = " ORDER BY h.`amount` DESC";
        }

        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";

        $where .= " AND p.`status` = 1";
        $archives = $dsql->SetQuery("SELECT h.`id`, h.`reward_userid`, p.`amount`, p.`settle`, h.`date`, h.`num`, h.`gift_id` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p
            ON p.`live_id` = h.`live_id` WHERE l.`user` = $uid" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        foreach ($results as $k => $v){

            $list[$k]['id'] = $v['id'];
            $list[$k]['reward_userid'] = $v['reward_userid'];
            $list[$k]['amount'] = $v['amount'];
            $list[$k]['date'] = $v['date'];
            $list[$k]['num'] = $v['num'];
            $list[$k]['gift_id'] = $v['gift_id'];

            //用户信息
            $userinfo = $userLogin->getMemberInfo($v['reward_userid']);
            $list[$k]['userinfo'] = $userinfo;

            //礼物信息
            $sql_ = $dsql->SetQuery("SELECT `gift_name`, `gift_litpic` FROM `#@__live_gift` WHERE `id` = {$v['gift_id']}");
            $ret_ = $dsql->dsqlOper($sql_, "results");
            $list[$k]['gift_name'] = $ret_[0]['gift_name'];
            $list[$k]['gift_litpic'] = $ret_[0]['gift_litpic'] ? getFilePath($ret_[0]['gift_litpic']) : '/static/images/404.jpg';

            //佣金
            if($v['settle'] > 0){
                $list[$k]['price'] = sprintf('%.2f', $v['settle']);
                $list[$k]['fee'] = sprintf('%.2f', ($v['settle'] / $v['amount'] * 100)) . '%';
            }else{
                $liveFee = 100 - $cfg_liveFee;
                $list[$k]['price'] = sprintf('%.2f', $v['amount'] * $liveFee / 100);
                $list[$k]['fee'] = $liveFee . '%';
            }

        }

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 打赏收入管理
     */
    public function chatRoomRewardList()
    {
        global $dsql;
        global $userLogin;
        global $cfg_liveFee;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();

        $uid = $userLogin->getMemberID();  //用户ID

        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];
        $chatid   = (int)$param['chatid'];  //聊天室ID
        $keywords = $param['keywords'];  //搜索
        $orderby  = $param['orderby'];  //排序

        $where .= " AND h.`gift_id` = 0 AND h.`live_id` = $chatid AND h.`payid` = p.`order_id`";

        //搜索用户
        if($keywords){
            if(is_numeric($keywords)){
                $where .= " AND h.`reward_userid` = $keywords";
            }else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '$keywords' OR `username` = '$keywords' OR `company` = '$keywords' ORDER BY `id` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_uid = $ret[0]['id'];

                    $where .= " AND h.`reward_userid` = $_uid";
                }else{
                    $where .= " AND 1 = 2";
                }
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archivesCount = $dsql->SetQuery("SELECT h.`id` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` WHERE l.`user` = $uid" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archivesCount, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $order = " ORDER BY h.`id` DESC";

        //按收益
        if($orderby){
            $order = " ORDER BY h.`amount` DESC";
        }

        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";

        $where .= " AND p.`status`  = 1";
        $archives = $dsql->SetQuery("SELECT h.`id`, h.`reward_userid`, p.`amount`, p.`settle`, h.`date` FROM `#@__live_reward` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`live_id` LEFT JOIN `#@__live_payorder` p ON p.`live_id` = h.`live_id` WHERE l.`user` = $uid" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        foreach ($results as $k => $v){

            $list[$k]['id'] = $v['id'];
            $list[$k]['reward_userid'] = $v['reward_userid'];
            $list[$k]['amount'] = $v['amount'];
            $list[$k]['date'] = $v['date'];

            //用户信息
            $userinfo = $userLogin->getMemberInfo($v['reward_userid']);
            $list[$k]['userinfo'] = $userinfo;

            //佣金
            if($v['settle'] > 0){
                $list[$k]['price'] = sprintf('%.2f', $v['settle']);
                $list[$k]['fee'] = sprintf('%.2f', ($v['settle'] / $v['amount'] * 100)) . '%';
            }else{
                $liveFee = 100 - $cfg_liveFee;
                $list[$k]['price'] = sprintf('%.2f', $v['amount'] * $liveFee / 100);
                $list[$k]['fee'] = $liveFee . '%';
            }

        }

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 付费收益管理
     */
    public function chatRoomPaySeeList()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();

        $uid = $userLogin->getMemberID();  //用户ID

        $page     = (int)$param['page'];
        $pageSize = (int)$param['pageSize'];
        $chatid   = (int)$param['chatid'];  //聊天室ID
        $keywords = $param['keywords'];  //搜索
        $orderby  = $param['orderby'];  //排序

        $where .= " AND p.`status` = 1 AND p.`paysee` = 1 AND p.`live_id` = " . $chatid;

        //搜索用户
        if($keywords){
            if(is_numeric($keywords)){
                $where .= " AND p.`user_id` = $keywords";
            }else{
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '$keywords' OR `username` = '$keywords' OR `company` = '$keywords' ORDER BY `id` DESC");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $_uid = $ret[0]['id'];

                    $where .= " AND p.`user_id` = $_uid";
                }else{
                    $where .= " AND 1 = 2";
                }
            }
        }

        //按收益
        if($orderby == 1){
            $where .= " AND p.`seetype` != 2";
        }elseif($orderby == 2){
            $where .= " AND p.`seetype` = 2";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $archivesCount = $dsql->SetQuery("SELECT p.`id` FROM `#@__live_payorder` p LEFT JOIN `#@__livelist` l ON l.`id` = p.`live_id` WHERE l.`user` = $uid" . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archivesCount, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $order = " ORDER BY p.`id` DESC";
        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";
        $archives = $dsql->SetQuery("SELECT p.`id`, p.`user_id`, p.`amount`, p.`seetype`, p.`date` FROM `#@__live_payorder` p LEFT JOIN `#@__livelist` l ON l.`id` = p.`live_id` WHERE l.`user` = $uid" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        foreach ($results as $k => $v){

            $list[$k]['id'] = $v['id'];
            $list[$k]['user_id'] = $v['user_id'];
            $list[$k]['amount'] = $v['amount'];
            $list[$k]['date'] = $v['date'];
            $list[$k]['seetype'] = $v['seetype'] == 2 ? $langData['live'][3][54] : $langData['live'][3][53];

            //用户信息
            $userinfo = $userLogin->getMemberInfo($v['user_id']);
            $list[$k]['userinfo'] = $userinfo;

        }

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * 获取ossurl
     */
    public function getOssUrl()
    {
        global $dsql;
        //$param        = $this->param;
        $id = $this->param;

        if (empty($id)) return array("state" => 200, "info" => '参数错误');

        $sql = $dsql->SetQuery("SELECT `id`,`user`,`streamname` FROM `#@__livelist` WHERE `id` = $id ");
        $ret = $dsql->dsqlOper($sql, "results");

        if ($ret) {
            $this->param = $ret[0]['streamname'];
            $detail      = $this->describeLiveStreamRecordIndexFiles();
            if (isset($detail['Message'])) {
                return 'ok';
            } else {
                $file       = $detail['RecordIndexInfoList']['RecordIndexInfo'][0]['OssObject'];
                $requestUrl = $detail['RecordIndexInfoList']['RecordIndexInfo'][0]['RecordUrl'];
                if ($file) {
                    $archives = $dsql->SetQuery("UPDATE `#@__livelist` SET  `ossobject`='$file',`ossurl`='$requestUrl' WHERE `id` = " . $id);
                    $results  = $dsql->dsqlOper($archives, "update");
                }
                return 'ok';
            }
        }
    }


    /**
     * 直播支付
     */
    public function livePay()
    {
        global $dsql;
        global $userLogin;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $langData;

        $isMobile = isMobile();

        $param   = $this->param;
        $liveid  = $param['liveid'];      //liveID
        $amount  = $param['amount'];   //金额
        $paytype = $param['paytype'];  //支付方式
        $qr      = $param['qr'];  //扫码支付

        $uid = $userLogin->getMemberID();  //当前登录用户

        if ($uid == -1) {
            if($qr){
                return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
            }else{
                header("location:" . $cfg_secureAccess.$cfg_basehost . "/login.html");
                exit;
            }
        }

        $seetype = 0;
        $sql = $dsql->SetQuery("SELECT `state`, `startmoney`, `endmoney` from `#@__livelist` WHERE id = {$liveid}");
        $res = $dsql->dsqlOper($sql, "results");
        if ($res) {
            $seetype = $res[0]['state'];
            if ($res[0]['state'] != 2) {
                $amount = $res[0]['startmoney'];
            } else {
                $amount = $res[0]['endmoney'];
            }
        }

        //验证金额
        if ($amount <= 0 || !is_numeric($liveid)) {
            $ischeck = true;
            if($isMobile){
                $url = getUrlPath(array(
                    'service' => 'live',
                    'template' => 'h_detail',
                    'id' => $liveid
                ));
                header("location:" . $url);
                die;
            }else{
                if(empty($paytype)){
                    $ischeck = true;
                }else{
                    $ischeck = false;
                }

                if(!$ischeck){
                    $url = getUrlPath(array(
                        'service' => 'live',
                        'template' => 'detail',
                        'id' => $liveid
                    ));
                    if($qr){
                        return array("state" => 200, "info" => $langData['travel'][12][23]);//格式错误！
                    }else{
                        header("location:" . $url);
                        die;
                    }

                }

            }
        }

        //订单号
        $ordernum = create_ordernum();
        $date     = GetMkTime(time());
        $archives = $dsql->SetQuery("INSERT INTO `#@__live_payorder` (`live_id`, `user_id`, `order_id`, `date`, `amount`, `status`, `paysee`, `seetype`) VALUES ('$liveid', '$uid', '$ordernum', '$date', '$amount', '0', '1', '$seetype')");
        $return   = $dsql->dsqlOper($archives, "update");
        if ($return != "ok") {
            if($qr){
                return array("state" => 200, "info" => "提交失败，请稍候重试！");//提交失败，请稍候重试！
            }else{
                die("提交失败，请稍候重试！");
            }
        }
        if($qr){
            return createPayForm("live", $ordernum, $amount, $paytype, "观看直播");
        }

        if($isMobile){
            $param = array(
                "service" => "live",
                "template" => "pay",
                "param" => "ordernum=".$ordernum
            );
            header("location:".getUrlPath($param));
            die;
        }

        //跳转至第三方支付页面
        createPayForm("live", $ordernum, $amount, $paytype, "观看直播");

    }

    /**
     * 直播支付回调
     */
    public function paySuccess()
    {
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;

        $param = $this->param;
        if (!empty($param)) {
            global $dsql;
            $liveid    = $param['liveid'];      //liveID
            $amount    = $param['amount'];   //金额
            $paytype   = $param['paytype'];  //支付方式
            $ordernum  = $param['ordernum'];     //订单号
            $ishongbao = $param['hongbao'];
            $gift      = $param['gift'];

            $uid  = $userLogin->getMemberID();  //当前登录用户
            $date = GetMkTime(time());

            //查询订单信息
            $sql = $dsql->SetQuery("SELECT * FROM `#@__live_payorder` WHERE `order_id` = '$ordernum' AND `status` = 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $id     = $ret[0]['id'];
                $lid    = $ret[0]['live_id'];
                $to     = $ret[0]['user_id'];
                $aid    = $ret[0]['order_id'];
                $amount = $ret[0]['amount'];

                $uid = $uid < 1 ? $to : $uid;

                $upoint   = $ret[0]['point'];
                $ubalance = $ret[0]['balance'];
                $payprice = $ret[0]['payprice'];
                $ishongbao= $ret[0]['hongbao'];
                $gift     = $ret[0]['gift'];
                $paysee   = $ret[0]['paysee'];
                if($paysee){
                    $sql = $dsql->SetQuery("SELECT `user` FROM `#@__livelist` WHERE `id` = '$lid'");
                    $userret = $dsql->dsqlOper($sql, "results");
                    $userto  = $userret[0]['user'];
                }


                $sql_in = $dsql->SetQuery("UPDATE `#@__livelist_auth` set `is_auth` = 1, `payid` = '$ordernum' where `user_id` = {$to} AND `live_id` = '$lid'");
                $dsql->dsqlOper($sql_in, "update");

                $archives = $dsql->SetQuery("UPDATE `#@__live_payorder` SET `status` = '1' WHERE `order_id` = '$aid'");
                $dsql->dsqlOper($archives, "update");


                //获取会员名
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname`,`photo` FROM `#@__member` WHERE `id` = $to");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    $photo = getFilePath($ret[0]['photo']);
                }

                $ctype = '';
                $param = array(
                    "service" => "live",
                    "template" => "detail",
                    "id" => $lid
                );
                $urlParam = serialize($param);
                $sql = $dsql->SetQuery("SELECT `id`,`amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                $pid = '';
                if($ret){
                    $pid 			= $ret[0]['id'];
                    $pcount         = $ret[0]['amount'];
                    if($pcount==0){
                        $del = $dsql->SetQuery("DELETE FROM `#@__pay_log` WHERE `id` = '$pid'");
                        $dsql->dsqlOper($del, "update");
                    }
                }
                if($ishongbao || $gift || $paysee){

                    /*直播名称*/
                    $livetitlesql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `id` = '$lid'");
                    $livetitleres = $dsql->dsqlOper($livetitlesql, "results");
                    $livetitle = '';
                    if($livetitleres){
                        $livetitle = $livetitleres[0]['title'];
                    }

                    $title = '直播消费';
                    if($ishongbao){
                        $info = '直播('.$livetitle.')红包积分消费：' . $ordernum;
                        $info_ = '直播('.$livetitle.')红包消费：' . $ordernum;
                        $ctype  = 'xiaofei';
                    }elseif($gift){
                        $info = '直播('.$livetitle.')打赏积分消费：' . $ordernum;
                        $info_ = '直播('.$livetitle.')打赏消费：' . $ordernum;
                        $ctype  = 'dashang';
                        $title = '直播打赏消费';
                    }elseif($paysee){
                        $info = '直播('.$livetitle.')付费观看消费：' . $ordernum;
                        $info_ = '直播('.$livetitle.')付费观看消费：' . $ordernum;
                        $ctype  = 'fufeiyuedu';
                    }
                    $totalPrice = $payprice;
                
                    //记录用户行为日志
                    memberLog($uid, 'live', '', 0, 'update', $info_ . '=>' . $payprice, '', '');

                    //扣除会员积分
                    if(!empty($upoint) && $upoint > 0){
                        global  $userLogin;
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$to'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($to);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint-$upoint);
                        //保存操作日志

                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$to', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //扣除会员余额
                    if(!empty($ubalance) && $ubalance > 0){
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$to'");
                        $dsql->dsqlOper($archives, "update");
                        $totalPrice += $ubalance;

                        //增加冻结金额
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$to'");
                        $dsql->dsqlOper($archives, "update");

                        //保存操作日志
                        if($totalPrice>0 || $paysee){
                            $user  = $userLogin->getMemberInfo($to);
                            $usermoney = $user['money'];
//                        $money   = sprintf('%.2f',($usermoney-$totalPrice));
                            $totalPrice = $paysee ? $amount : $totalPrice;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`pid`,`title`,`ordernum`,`balance`) VALUES ('$to', '0', '$totalPrice', '$info_', '$date','live','$ctype','$urlParam','$pid','$title','$ordernum','$usermoney')");//家政消费
                            $dsql->dsqlOper($archives, "update");
                        }
                    }

                }

                if ($ishongbao) {
                    $sql_h      = $dsql->SetQuery("SELECT * FROM `#@__live_hongbao` WHERE `payid` = '$ordernum'");
                    $ret_h      = $dsql->dsqlOper($sql_h, "results");
                    if($ret_h){
                        $data_h = $ret_h[0];

                        $fromToken = '';

                        $this->param = array(
                            'userid' => $uid
                        );
                        $IMtokn = new siteConfig($this->param);
                        if(method_exists($IMtokn,'getImToken')){
                            $token     = $IMtokn->getImToken();
                            $fromToken = $token['token'];

                            $this->param = array(
                                'content' => '__H__:' . $data_h['id'],
                                'contentType' => 'text',
                                'from' => $fromToken,
                                'userid' => $data_h['user_id'],
                                'mark' => 'chatRoom' . $lid
                            );
                            $IMtokn = new siteConfig($this->param);
                            $IMtokn->sendImChatRoom();
                        }

                        // 发送红包
                        $this->param = array(
                            'userid' => $uid,
                            'username' => $username,
                            'content' => '__H__:' . $data_h['id'],
                            'userphoto' => $photo,
                            'chatid' => $data_h['chatid'],
                            'system' => true
                        );
                        $this->chatTalk();
                    }


                }elseif($gift){
                    $sql_h      = $dsql->SetQuery("SELECT * FROM `#@__live_reward` WHERE `payid` = '$ordernum'");
                    $ret_h      = $dsql->dsqlOper($sql_h, "results");
                    if($ret_h){
                        $data_h = $ret_h[0];

                    }

                    include HUONIAOROOT . '/include/config/settlement.inc.php';
                    $amount = $amount - $amount * $cfg_liveFee * 0.01;
                    //将费用打给直播用户

                    $sql_user    = $dsql->SetQuery("SELECT `user` FROM `#@__livelist` WHERE `id` = '$lid'");
                    $ret_user    = $dsql->dsqlOper($sql_user, "results");
                    $liveuser    = $ret_user[0]['user'];

                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount' WHERE `id` = '$liveuser'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($liveuser);
                    $usermoney = $user['money'];
//                    $money = sprintf('%.2f',($usermoney+$amount));
                    $title = '直播收入-'.$livetitle;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`pid`,`title`,`ordernum`,`balance`) VALUES ('$liveuser', '1', '$amount', '【打赏】(来自".$username.")".$livetitle."', '$date','live','dashang','$urlParam','$pid','$title','$ordernum','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

                    $archives = $dsql->SetQuery("UPDATE `#@__live_payorder` SET `settle` = '$amount' WHERE `order_id` = '$aid'");
                    $dsql->dsqlOper($archives, "update");

                    $fromToken = '';
                    $this->param = array(
                        'userid' => $uid
                    );
                    $IMtokn = new siteConfig($this->param);
                    if(method_exists($IMtokn,'getImToken')){
                        $token     = $IMtokn->getImToken();
                        $fromToken = $token['token'];

                        $this->param = array(
                            'content' => '__L__:' . $data_h['id'],
                            'contentType' => 'text',
                            'from' => $fromToken,
                            'userid' => $uid,
                            'mark' => 'chatRoom' . $lid
                        );
                        $IMtokn = new siteConfig($this->param);
                        $IMtokn->sendImChatRoom();
                    }


                    // 发送红包
                    $this->param = [
                        'userid' => $uid,
                        'username' => $username,
                        'content' => '__L__:' . $data_h['id'],
                        'userphoto' => $photo,
                        'chatid' => $data_h['chatid'] ? str_replace("chatroom", "", $data_h['chatid']) : '',
                        'system' => true
                    ];
                    $this->chatTalk();

                } else {
                    //将费用打给直播用户
                    if($paysee){
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount' WHERE `id` = '$userto'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userto);
                        $usermoney = $user['money'];
//                        $money      = sprintf('%.2f',($usermoney+$amount));
                        $title = '直播收入-'.$livetitle;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`pid`,`title`,`ordernum`,`balance`) VALUES ('$userto', '1', '$amount', '付费观看收入', '$date','live','dashang','$urlParam','$pid','$title','$ordernum','$usermoney')");
                        $dsql->dsqlOper($archives, "update");
                    }else{
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount' WHERE `id` = '$to'");
                        $dsql->dsqlOper($archives, "update");
                    }

                }
                //会员通知
                $param = array(
                    "service" => "live",
                    "template" => "detail",
                    "id" => $lid
                );

                include HUONIAOINC."/config/live.inc.php";
                $fenXiao = (int)$customfenXiao;
                //分佣 开关
                $paramarr['amount'] = $totalPrice;
                if($fenXiao ==1){
                    (new member())->returnFxMoney("live", $to , $ordernum,$paramarr);
                }
                updateMemberNotice($to, "会员-直播通知", $param, array("username" => $username, "title" => '', 'amount' => $amount, "date" => date("Y-m-d H:i:s", $date)));

            }

        }
    }


    /**
     * 获取打赏榜
     */
    public function getRewardList()
    {
        global $dsql;
        $param = $this->param;
        if (!empty($param)) {
            $liveid = (int)$param['liveid'];
        } else {
            return array('state' => 200, 'info' => '参数不正确');
        }

        if(!$liveid) return array('state' => 200, 'info' => '直播ID错误');

        $pageSize = (int)$param['pageSize'];
        $pageSize = $pageSize ? $pageSize : 10;

        $sql = $dsql->SetQuery("SELECT `id`, `live_id`, `reward_userid`, `amount`, (SELECT sum(r.`amount`) FROM `#@__live_reward` r LEFT JOIN `#@__live_payorder` p ON p.`order_id` = r.`payid`  WHERE r.`live_id` = $liveid AND r.`reward_userid` = a.`reward_userid` AND r.`gift_id` = 0 AND p.`status` = 1 ) sumamount FROM `#@__live_reward` a WHERE `live_id` = $liveid AND `gift_id` = 0 GROUP BY `reward_userid` ORDER BY `sumamount` DESC LIMIT 0, $pageSize");

        $ret = $dsql->dsqlOper($sql, "results");

        foreach ($ret as $key => $item) {
            $ret[$key]['user'] = getMemberDetail($item['reward_userid']);
        }

        return $ret;


    }

    /**
     * 邀请榜
     */
    public function getShareList()
    {
        global $dsql;
        $param = $this->param;
        if (!empty($param)) {
            $liveid = (int)$param['liveid'];
        } else {
            return array('state' => 200, 'info' => '参数不正确');
        }

        if(!$liveid) return array('state' => 200, 'info' => '直播ID错误');

        $pageSize = (int)$param['pageSize'];
        $pageSize = $pageSize ? $pageSize : 10;

        $sql = $dsql->SetQuery("SELECT a.`id`, a.`live_id`, a.`share_userid`, (SELECT count(`id`) FROM `#@__live_share_success_user` WHERE `live_id` = $liveid  AND `share_user` = a.share_userid ) scount FROM `#@__live_share` a WHERE a.`live_id` = $liveid GROUP BY a.`share_userid` ORDER BY `scount` DESC LIMIT 0, $pageSize");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            foreach ($ret as $key => $item) {
                $ret[$key]['user'] = getMemberDetail($item['share_userid']);
            }
        }
        return $ret;

    }

    /**
     * 生成红包
     */
    public function makeHongbao()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;
        if (!empty($param)) {
            $liveid = $param['liveid'];
            $amount = $param['amount'];
            $count  = $param['count'];
            $note   = $param['note'];
            $chatRoomId   = $param['chatid'];
        } else {
            return array('state' => 200, 'info' => '参数不正确');
        }
        if($amount < 1){
            return array('state' => 200, 'info' => '最少金额为1元');
        }

        $date   = time();
        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            return array("state" => 200, "info" => '登录超时');
        }

        $ordernum = create_ordernum();


        $archives = $dsql->SetQuery("INSERT INTO `#@__live_payorder` (`live_id`, `user_id`, `order_id`, `date`, `amount`, `status`, `hongbao`) VALUES ('$liveid', '$userid', '$ordernum', '$date', '$amount', '0', 1)");
        $return   = $dsql->dsqlOper($archives, "update");

        $chatRoomId = 'chatroom'.$chatRoomId;
        $sql = $dsql->SetQuery("INSERT INTO `#@__live_hongbao` (`live_id` , `amount`, `user_id`, `count`, `payid`, `date`, `note`, `amount1`, `count1`, `chatid`) VALUES ( $liveid, '$amount', $userid, $count, '$ordernum', $date, '$note', '$amount', $count, '$chatRoomId')");
        $hid = $dsql->dsqlOper($sql, 'lastid');

        return createPayForm("live", $ordernum, $amount, '', "直播发红包", array(), 1);

        // $param  = [
        //     'service' => 'live',
        //     'template' => 'pay',
        // ];
        // $url = getUrlPath($param);
        // return $url . '?ordernum='.$ordernum;
    }

    /**
     * 支付验证
     */
    public function checkPayAmount()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        global $cfg_pointRatio;

        $userid = $userLogin->getMemberID();
        $param  = $this->param;

        //订单状态验证
//        $payCheck = $this->payCheck();
//        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        // if ($userid == -1) return array("state" => 200, "info" => "登录超时，请登录后重试！");
        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        if (!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");

        $totalPrice  = 0;

        //查询订单信息
        $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `ordertype` = 'live' AND `state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        $res      = $results[0];

        $orderprice = $res['amount'];
        $totalPrice += $orderprice;

		//未登录状态，不验证余额
		if($userid == -1) return $totalPrice;



        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

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
     * 红包支付
     */
    public function pay()
    {
        global $dsql;
        global $cfg_secureAccess;
        global $cfg_basehost;
        global $userLogin;
        global $cfg_pointRatio;

        $ordernum   = $this->param['ordernum'];
        $paytype    = $this->param['paytype'];
        $check      = (int)$this->param['check']; //第一次异步请求为1，第二次同步为0
        $usePinput  = $this->param['usePinput'];
        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];

        $userid = $userLogin->getMemberID();
        if ($userid == -1) {
            if ($check) {
                return array("state" => 200, "info" => "登陆超时");
            } else {
                die("登陆超时");
            }
        }
        if ($ordernum) {
            $sql = $dsql->SetQuery("SELECT * FROM `#@__live_payorder` WHERE `order_id` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $data       = $ret[0];
                $live_id    = (int)$data['live_id'];
                $totalPrice = (float)$data['amount'];
                $paysee     = (int)$data['paysee'];
                $gift       = (int)$data['gift'];
                $hongbao    = (int)$data['hongbao'];
                $date       = GetMkTime(time());
                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $usermoney = $userinfo['money'];
                $userpoint = $userinfo['point'];
                $tit       = array();
                $useTotal  = 0;
                //判断是否使用积分，并且验证剩余积分
                if ($usePinput == 1 && !empty($point)) {
                    if ($userpoint < $point) return array("state" => 200, "info" => "您的可用" . $cfg_pointName . "不足，支付失败！");
                    $useTotal += $point / $cfg_pointRatio;
                    $tit[]    = "integral";
                }
                //判断是否使用余额，并且验证余额和支付密码
                if ($useBalance == 1 && !empty($balance) && !empty($paypwd)) {
                    if (!empty($balance) && empty($paypwd)) {
                        if ($check) {
                            return array("state" => 200, "info" => "请输入支付密码！");
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
                            return array("state" => 200, "info" => "支付密码输入错误，请重试！");
                        } else {
                            die("支付密码输入错误，请重试！");
                        }
                    }
                    //验证余额
                    if ($usermoney < $balance) {
                        if ($check) {
                            return array("state" => 200, "info" => "您的余额不足，支付失败！");
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
                            return array("state" => 200, "info" => "您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
                        } else {
                            die("您使用的" . join("和", $tit) . "超出订单总费用，请重新输入要使用的" . join("和", $tit));
                        }
                        // 余额不足
                    }
                }
                $amount = $totalPrice - $useTotal;
                if ($amount > 0 && empty($paytype)) {
                    if ($check) {
                        return array("state" => 200, "info" => "请选择支付方式！");
                    } else {
                        die("请选择支付方式！");
                    }
                }

                //判断是否是积分与余额支付s
                $pointMoney = $usePinput ? $point / $cfg_pointRatio : 0;
                $balanceMoney = $balance;

                $usePointMoney = 0;
                $useBalanceMoney = 0;

                //先判断积分是否足够支付总价
                //如果足够支付：
                //1.把还需要支付的总价重置为0
                //2.积分总额减去用掉的
                //3.记录已经使用的积分
                if($totalPrice < $pointMoney){
                    $pointMoney -= $totalPrice;
                    $usePointMoney = $totalPrice;
                    $totalPrice = 0;
                //积分不够支付再判断余额是否足够
                //如果积分不足以支付总价：
                //1.总价减去积分抵扣掉的部部分
                //2.积分总额设置为0
                //3.记录已经使用的积分
                }else{
                    $totalPrice -= $pointMoney;
                    $usePointMoney = $pointMoney;
                    $pointMoney = 0;
                    //验证余额是否足够支付剩余部分的总价
                    //如果足够支付：
                    //1.把还需要支付的总价重置为0
                    //2.余额减去用掉的部分
                    //3.记录已经使用的余额
                    if($totalPrice < $balanceMoney){
                        $balanceMoney -= $totalPrice;
                        $useBalanceMoney = $totalPrice;
                        $totalPrice = 0;
                    //余额不够支付的情况
                    //1.总价减去余额付过的部分
                    //2.余额设置为0
                    //3.记录已经使用的余额
                    }else{
                        $totalPrice -= $balanceMoney;
                        $useBalanceMoney = $balanceMoney;
                        $balanceMoney = 0;
                    }
                }
                $pointMoney_ = $usePointMoney * $cfg_pointRatio;
                // if($paysee==1){//付费观看
                //     $gift = 0;
                //     $hongbao = 0;
                // }else{
                //     if(strstr($ordernum, '00000' )){
                //         $gift = 1;
                //         $hongbao = 0;
                //     }else{
                //         $hongbao = 1;
                //         $gift = 0;
                //     }
                // }

                //创建订单时决定是礼物还是红包
                // $archives = $dsql->SetQuery("UPDATE `#@__live_payorder` SET `gift` = '$gift', `hongbao` = '$hongbao', `point` = '$pointMoney_', `balance` = '$useBalanceMoney', `payprice` = '$totalPrice' WHERE `order_id` = '$ordernum'");
                $archives = $dsql->SetQuery("UPDATE `#@__live_payorder` SET `point` = '$pointMoney_', `balance` = '$useBalanceMoney', `payprice` = '$totalPrice' WHERE `order_id` = '$ordernum'");
                $dsql->dsqlOper($archives, "update");
                //判断是否是积分与余额支付e

                if ($check) return "ok";
                if ($amount > 0) {
                    if($paysee==1){
                        $tit = '观看直播';
                    }else{
                        $tit = '直播红包';
                    }
                    // 添加存储url
                    return createPayForm("live", $ordernum, $amount, $paytype, $tit);
                    // 余额支付
                } else {

                    // $body     = $ordernum;
                    // $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('live', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
                    // $dsql->dsqlOper($archives, "results");

                    //更新pay_log表
                    $sql = $dsql->SetQuery("UPDATE `#@__pay_log` SET `state` = 1, `paytype` = 'money' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($sql, "update");

                    if(strstr($ordernum, '00000' )){
                        $this->param = array(
                            "paytype" => $paytype,
                            "ordernum" => $ordernum,
                            "gift" => $gift,
                            "hongbao" => $hongbao
                        );
                    }else{
                        $this->param = array(
                            "paytype" => $paytype,
                            "ordernum" => $ordernum,
                            "gift" => $gift,
                            "hongbao" => $hongbao
                        );
                    }
                    //执行支付成功的操作

                    $this->paySuccess();

                    $param = array(
                        "service" => "live",
                        "template" => "h_detail",
                        "id" => $live_id
                    );
                    $url   = getUrlPath($param);

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

                    // if($_GET['ordernum'] && !$paysee){
                    //     header("location:" . $url);
                    //     die;
                    // }

                    return $url;

                    if(isApp()){
                        return $url;
                    }else{
                        header("location:" . $url);
                    }
                }

            } else {
                if ($check) {
                    return array("state" => 200, "info" => "订单不存在或已支付");
                } else {
                    $param = array(
                        "service" => "live",
                        "template" => "detail",
                        "id" => $live_id
                    );
                    $url   = getUrlPath($param);
                    header("location:" . $url);
                    die();
                }
            }

        } else {
            if ($check) {
                return array("state" => 200, "info" => "订单不存在");
            } else {
                $param = array(
                    "service" => "live",
                    "template" => "detail",
                    "id" => $live_id
                );
                $url   = getUrlPath($param);
                header("location:" . $url);
                die();
            }

        }
    }

    /**
     * 抢红包
     */
    public function getHongbao()
    {
        global $dsql;
        global $userLogin;
        $param = $this->param;
        if (!empty($param)) {
            $h_id = $param['h_id'];
            $date      = time();
        } else {
            return array('state' => 200, 'info' => '参数不正确');
        }
        $loginUSer = $userLogin->getMemberID();
        if ($loginUSer == -1) {
            return array("state" => 200, "info" => '登录超时');
        }

        //获取红包
        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_hongbao` WHERE `id` = $h_id ");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $amount  = $ret[0]['amount']; //总额
            $count   = $ret[0]['count'];
            $state   = $ret[0]['state'];
            $amount1 = $ret[0]['amount1']; //红包剩余金额
            $count1  = $ret[0]['count1']; //剩余数量
            $hid     = $ret[0]['id']; //红包id
            $lid     = $ret[0]['live_id']; //红包id
            $userid  = $ret[0]['user_id'];
            //判断当前用户是否抢过
            $is_sql   = $dsql->SetQuery("SELECT `id` FROM `#@__live_hrecv_list` WHERE `hid` = $hid AND `recv_user` = $loginUSer");
            $is_count = $dsql->dsqlOper($is_sql, "totalCount");
            if ($is_count) {
                $state = 202;
                $info = '不能重复领取';
                goto EEE;
            }
            if ($state == 1 || $count1 == 0 || $amount1 <= 0) {
                $state = 201;
                $info = '红包已被抢完';
                goto EEE;
            }
            if ($count1 == 1) {
                $get_amount = $amount1;
            } else {
                //剩余平均值
                $pre = ($amount1 / $count1) * 2;
                $min = 0.01;
                $max = $pre;
                //抢到的红包
                $get_amount = round($min + mt_rand() / mt_getrandmax() * ($max - $min), 2);
            }

            //抢到的用户加钱
            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$get_amount' WHERE `id` = $loginUSer");
            $dsql->dsqlOper($archives, "update");

            $usernamesql = $dsql->SetQuery("SELECT `nickname` FROM `#@__member` WHERE `id` = $userid");
            $usernameres = $dsql->dsqlOper($usernamesql, "results");
            $param = array(
                "service" => "live",
                "template" => "detail",
                "id" => $lid
            );

            $livetitlesql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `id` = '$lid'");
            $livetitleres = $dsql->dsqlOper($livetitlesql,"results");
            $livetitle = '';
            if($livetitleres){
                $livetitle = $livetitleres[0]['title'];
            }
            $urlParam = serialize($param);
            $user  = $userLogin->getMemberInfo($loginUSer);
            $usermoney = $user['money'];
//            $money   = sprintf('%.2f',($usermoney+$get_amount));
            $title = '红包-来自'.$usernameres[0]['nickname'];
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$loginUSer', '1', '$get_amount', '【红包收入】-直播:$livetitle', '$date','live','chongzhi','$urlParam','$title','$h_id','$usermoney')");
            $dsql->dsqlOper($archives, "update");

            $shengyu_m = $amount1 - $get_amount;
            $shengyu_c = $count1 - 1;
            if ($shengyu_m <= 0 || $shengyu_c == 0) {
                //已抢完
                $archives = $dsql->SetQuery("UPDATE `#@__live_hongbao` SET  `amount1` =  '0', `count1` = 0, `state` = 1 WHERE `id` = $hid ");
                $dsql->dsqlOper($archives, "update");
                $state = 203;
                $iss = 1;
            } else {
                //更新剩余红包
                $archives = $dsql->SetQuery("UPDATE `#@__live_hongbao` SET  `amount1` =  '$shengyu_m', `count1` = $shengyu_c WHERE `id` = $hid");
                $dsql->dsqlOper($archives, "update");
            }

            //用户抢红包记录
            $sql = $dsql->SetQuery("INSERT INTO `#@__live_hrecv_list` (`hid` , `recv_user`, `recv_money`, `date`) VALUES ( $hid, $loginUSer, '$get_amount', $date)");
            $dsql->dsqlOper($sql, 'update');
        }
        EEE:
        return ['state' => '100',
            'shengyu_money' => $shengyu_m, 'shengyu_count' => $shengyu_c, 'get_amount' => $get_amount, 'is_fin' => $iss ? $iss : 0, 'states' => $state ? $state : 200, 'info' => $info
        ];


    }

    public function getHongBaoInfo()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        $param = $this->param;
        if (!empty($param)) {
            $id = $param['h_id'];
        } else {
            return array('state' => 200, 'info' => '参数不正确');
        }
        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_hongbao` WHERE `id` = $id");
        $ret1 = $dsql->dsqlOper($sql, "results");
        foreach ($ret1 as &$v){
            $v['user'] = getMemberDetail($v['user_id']);
        }
        unset($v);
        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_hrecv_list` WHERE `hid` = $id AND `recv_user` = $uid");
        $ret2 = $dsql->dsqlOper($sql, "results");

        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_hrecv_list` WHERE `hid` = $id ");
        $ret3 = $dsql->dsqlOper($sql, "results");
        foreach ($ret3 as $k => &$item){
            $item['user'] = getMemberDetail($item['recv_user']);
            $item['date'] = date("H:i", $item['date']);
        }
        unset($item);
        return array('state' => 100, 'list'=>$ret3, 'user' => $ret2[0], 'hongbao'=>$ret1[0]);
    }


    public function getGift()
    {
        global $dsql;
        $sql = $dsql->SetQuery("SELECT * FROM `#@__live_gift`");
        $ret = $dsql->dsqlOper($sql, "results");
        $list = array();
        if($ret){
            foreach($ret as $key => $val){
                array_push($list, array(
                    'id' => $val['id'],
                    'gift_name' => $val['gift_name'],
                    'gift_price' => $val['gift_price'],
                    'gift_litpic' => getFilePath($val['gift_litpic'])
                ));
            }
        }
        return $list;
    }

    //送礼物
    public function songGift()
    {
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array('state' => 200, 'info' => '请登录');
        }
        $param = $this->param;
        $reward_userid = $param['reward_userid'];
        $live_id = $param['live_id'];
        $num = $param['num'];
        $gift_id = $param['gift_id'];
        $chat_id = $param['chat_id'];
        $amount = $param['amount'];
        if($gift_id != 0){
            $sql = $dsql->SetQuery("SELECT * FROM `#@__live_gift` WHERE `id` = $gift_id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $gift_price = $ret[0]['gift_price'];
                $amount = $num * $gift_price;
            }else{
                return array('state' => 200, 'info' => '参数不正确');
            }
        }

        $time = time();
        $order = create_ordernum();
        $archives = $dsql->SetQuery("INSERT INTO `#@__live_payorder` (`live_id`, `user_id`, `order_id`, `date`, `amount`, `status`, `gift`) VALUES ('$live_id', '$uid', '$order', '$time', '$amount', '0', 1)");
        $return   = $dsql->dsqlOper($archives, "update");

        $archives = $dsql->SetQuery("INSERT INTO `#@__live_reward` (`live_id`, `reward_userid`, `amount`, `payid`, `date`, `state`, `gift_id`, `num`, `chatid`) VALUES ('$live_id', '$uid', '$amount', '$order', '$time', '0', $gift_id, $num , '$chat_id')");
        $return   = $dsql->dsqlOper($archives, "update");

        return createPayForm("live", $order, $amount, '', "直播赠送礼物", array(), 1);

        // $params = [
        //     'service' => 'live',
        //     'template' => 'pay'
        // ];
        // $url = getUrlPath($params) . '?ordernum=' . $order;
        // return $url;

    }


    /**
     * 图文直播
     */
    public function fabuImgText(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid <= 0) return array('state' => 200, 'info' => '登陆超时，请重新登陆');

        $param = $this->param;
        $id = (int)$param['id'];
        $text = $param['text'];
        $imglist = $param['imglist'];

        if(empty($id)) return array('state' => 200, 'info' => '参数错误');

        if(empty($text) && empty($imglist)) return array('state' => 200, 'info' => '请上传图片或输入文字内容');

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `id` = $id AND `user` = $uid");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res) return array('state' => 200, 'info' => '直播不存在');
        // if($res['state'] == 0) return array('state' => 200, 'info' => '直播未开始');

        $pubdate = time();
        $sql = $dsql->SetQuery("INSERT INTO `#@__live_imgtext` (`live_id`, `img`, `text`, `pubdate`) VALUES ('$id', '$imglist', '$text', '$pubdate')");
        $res = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($res)){
            return '发布成功';
        }else{
            return array('state' => 200, 'info' => '发布失败');
        }

    }

    /**
     * 图文直播列表
     */
    public function imgTextList(){
        global $dsql;
        global $userLogin;
        $param    = $this->param;
        $where    = "";
        $pageinfo = $list = array();
        $totalPage = $totalCount = 0;

        $page     = $param['page'];
        $pageSize = $param['pageSize'];
        $chatid   = $param['chatid'];
        $order    = $param['order'];
        $keywords = $param['keywords'];
        $date     = $param['date'];
        $id       = $param['id'];
        $get      = $param['get'];

        if (empty($chatid)) {
            return array('state' => 200, 'info' => '直播id');
        }

        $where .= " and `live_id` = '$chatid'";
        if($keywords){
            $where .= " and `text` LIKE '%$keywords%'";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if(empty($get)){
            $archivesCount = $dsql->SetQuery("SELECT COUNT(*) c FROM `#@__live_imgtext` WHERE 1 = 1" . $where);
            //总条数
            $res = $dsql->dsqlOper($archivesCount, "results");
            $totalCount = $res[0]['c'];
            //总分页数
            $totalPage = ceil($totalCount / $pageSize);

            if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');
        }

        // 获取最新
        if($date){
            $where .= ' AND `pubdate` > ' . $date;
        }
        if($id){
            $where .= ' AND `id` < ' . $id;
        }

        $order = $order ? $order : "DESC";
        $order = " ORDER BY pubdate ".$order;

        $atpage   = $pageSize * ($page - 1);
        $where1   = " LIMIT $atpage, $pageSize";
        $archives = $dsql->SetQuery("SELECT * FROM `#@__live_imgtext` WHERE 1 = 1" . $where);
        $results  = $dsql->dsqlOper($archives . $order . $where1, "results");
        $list = array();
        foreach ($results as $k => $v){
            $list[$k]['id'] = $v['id'];
            $list[$k]['text'] = $v['text'];
            $list[$k]['live_id'] = $v['live_id'];
            $list[$k]['pubdate'] = $v['pubdate'];

            //用户信息
            $sql = $dsql->SetQuery("SELECT `id`, `user` FROM `#@__livelist` WHERE `id` = " . $v['live_id']."");
            $res = $dsql->dsqlOper($sql, "results");
            $member                 = getMemberDetail($res[0]['user']);
            $list[$k]['nickname']   = !empty($member['nickname']) ? $member['nickname'] : $member['username'];
            $list[$k]['photo']      = !empty($member['photo']) ? $member['photo'] : '/static/images/404.jpg';
            //用户查看主播列表页面
            $param = array(
                "service" => "live",
                "template" => "anchor_index",
                "userid" => $res[0]['user']
            );
            $list[$k]['userurl'] = getUrlPath($param);

            $img = $v['img'];
            $pic = array();
            if($img){
                $a = explode(',', $img);
                foreach ($a as $s => $p) {
                    $pic[$s] = getFilePath($p);
                }
            }
            $list[$k]['img'] = $pic;
        }

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            // "date" => $list ? $list[0]['pubdate'] : time()
        );

        return array("pageInfo" => $pageinfo, "list" => $list);
    }
    /**
     * 删除图文直播消息
     */
    public function delImgText(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid <= 0) return array('state' => 200, 'info' => '登陆超时，请重新登陆');

        $param = $this->param;
        $id = (int)$param['id'];
        if(empty($id)) return array('state' => 200, 'info' => '参数错误');

        // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` where id='$id' and user='$userid'");
        // $res = $dsql->dsqlOper($sql, "results");
        // if(!$res) return array('state' => 200, 'info' => '直播不在或权限不足');

        $sql = $dsql->SetQuery("SELECT c.`id`, c.`img` FROM `#@__live_imgtext` c LEFT JOIN `huoniao_livelist` l ON c.`live_id` = l.`id` WHERE c.`id` = $id AND l.`user` = $uid");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res) return array('state' => 200, 'info' => '消息不存在或权限不足');

        $img = $res[0]['img'];

        $sql = $dsql->SetQuery("DELETE FROM `#@__live_imgtext` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "update");
        if($res == "ok"){
            if($img){
                delPicFile($img, 'atlas', 'live');
            }
            return "操作成功";
        }else{
            return array('state' => 200, 'info' => '操作失败');
        }

    }

    /**
     * 删除直播评论
     */
    public function delComment(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();
        if($uid <= 0) return array('state' => 200, 'info' => '登陆超时，请重新登陆');

        $param = $this->param;
        $id = (int)$param['id'];
        if(empty($id)) return array('state' => 200, 'info' => '参数错误');

        // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` where id='$id' and user='$userid'");
        // $res = $dsql->dsqlOper($sql, "results");
        // if(!$res) return array('state' => 200, 'info' => '直播不在或权限不足');

        $sql = $dsql->SetQuery("SELECT c.`id` FROM `huoniao_livechat` c LEFT JOIN `huoniao_livelist` l ON substring(c.`chatid`, 9) = l.`id` WHERE c.`id` = $id AND l.`user` = $uid");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res) return array('state' => 200, 'info' => '评论不存在或权限不足');

        // $sql = $dsql->SetQuery("SELECT `id`, `chatid` FROM `#@__livechat` where `id`='$id'");
        // $res = $dsql->dsqlOper($sql, "results");
        // if(!$res) return array('state' => 200, 'info' => '评论不存在');

        // $lid = str_replace("chatroom", "", $res[0]['chatid']);
        // $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` where `id` = $lid AND `user`='$uid'");
        // $res = $dsql->dsqlOper($sql, "results");
        // if(!$res) return array('state' => 200, 'info' => '权限不足');

        $sql = $dsql->SetQuery("DELETE FROM `#@__livechat` WHERE `id` = $id");
        $res = $dsql->dsqlOper($sql, "update");
        if($res == "ok"){
            return "操作成功";
        }else{
            return array('state' => 200, 'info' => '操作失败');
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
        $userid     = $userLogin->getMemberID();
        $userinfo   = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array('state' => 200, 'info' => '登录超时！');
        }
        $param = $this->param;
        if (!empty($param)) {

            $vid  = $param['vid'];
            $type = $param['type'];
            $temp = $param['temp'];
            $title= $param['title'];
        } else {
            return array('state' => 200, 'info' => '参数不正确！');
        }

        $vidsql = $dsql->SetQuery("SELECT `user` FROM `#@__livelist` WHERE  `id` = '".$vid."'");
        $vidres = $dsql->dsqlOper($vidsql,"results");
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
            $content = $userinfo['nickname'] . "点赞了您的信息";

            $param = array(
                "service"     => "member",
                'type' => 'user',
                "template" => "im/commt_list.html#zan"

            );
            $config = array(
                "noticetitle" => $content,
                "title" => $title,
                "date" => date("Y-m-d H:i:s", $date),
                "fields" => array(
                    'keyword1' => '信息标题',
                    'keyword2' => '评论时间',
                    'keyword3' => '进展状态'
                )
            );
            updateMemberNotice($vidres['user'], "会员-点赞提醒", $param, $config, "");

        } else {
            //取消
            $sql = $dsql->SetQuery("DELETE FROM `#@__site_zanmap` WHERE `userid` = $userid AND `vid` = $vid AND `temp` = '$temp'");
            $ret = $dsql->dsqlOper($sql, "update");
            // $content = $userinfo['nickname'] . "取消了点赞您的信息";
        }

        if($ret == "ok"){
            return "ok";
        }else{
            return array('state' => 200, 'info' => '操作失败');
        }
    }

    /**
     * 获取用户信息
     */
    public function getUserInfo()
    {
        global $dsql;
        $param = $this->param;

        $id  = $param['id'];

        if(empty($id)) return array('state' => 200, 'info' => '参数不正确！');

        //会员信息
        $member                 = getMemberDetail($id);
        $memberinfo['nickname'] = !empty($member['company']) ? $member['company'] : $member['nickname'];
        $memberinfo['userid']   = $id;
        $memberinfo['photo']    = !empty($member['photo']) ? getFilePath($member['photo']) : '/static/images/noPhoto_40.jpg';

        //粉丝人数
        $sql     = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__live_follow` WHERE `fid` = " . $id);
        $fansret = $dsql->dsqlOper($sql, "results");
        $memberinfo['totalFans'] = $fansret[0]['t'];

        $sql = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__livelist` WHERE `user` = " . $id);
        $res = $dsql->dsqlOper($sql, "results");
        $memberinfo['livenum'] = $res[0]['t'];

        $param = array(
            "service" => "live",
            "template" => "anchor_index",
            "userid" => $id
        );
        $memberinfo['userurl'] = getUrlPath($param);

        return $memberinfo;
    }

    /**
     * 聊天具体信息
     */
    public function getChatDetail(){
        global $dsql;
        global $langData;
        global $userLogin;
        $param = $this->param;

        $h_id  = (int)$param['h_id'];
        $type  = (int)$param['type'];

        if(empty($h_id)) return array('state' => 200, 'info' => '参数不正确！');

        $chatArr = array();
        if($type==1){//礼物
            $sql = $dsql->SetQuery("SELECT `gift_id`, `num`, `amount` FROM `#@__live_reward` WHERE `id` = $h_id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $chatArr['is_gift'] = $ret[0]['gift_id'] ? 1 : 0;
                $chatArr['num']     = $ret[0]['num'];
                $chatArr['amount']  = $ret[0]['amount'];
                $chatArr['type']    = $type;
                if($ret[0]['gift_id'] != 0){
                    $sql_ = $dsql->SetQuery("SELECT `gift_name` FROM `#@__live_gift` WHERE `id` = {$ret[0]['gift_id']}");
                    $ret_ = $dsql->dsqlOper($sql_, "results");
                    $chatArr['gift_name'] = $ret_[0]['gift_name'];
                }
            }
        }elseif($type==2){//红包
            $sql = $dsql->SetQuery("SELECT `state`,`note` FROM `#@__live_hongbao` WHERE `id` = $h_id");
            $ret = $dsql->dsqlOper($sql, "results");
            $chatArr['note'] = $ret[0]['note'] ? $ret[0]['note'] : '恭喜发财，大吉大利';
            $chatArr['type'] = $type;
            if($ret[0]['state'] == 1){
                $chatArr['h_state'] = 1; //已抢完
            }else{
                //检查自己是否抢过
                $is_sql   = $dsql->SetQuery("SELECT `id` FROM `#@__live_hrecv_list` WHERE `hid` = $h_id AND `recv_user` = {$userLogin->getMemberID()}");
                $is_count = $dsql->dsqlOper($is_sql, "totalCount");
                $chatArr['h_state'] = $is_count ? 2 : ''; //已抢过
            }
        }

        return $chatArr;
    }


    /**
     * 直播预约
     */
    public function liveBooking(){
        global $dsql;
        global $userLogin;
        $uid = $userLogin->getMemberID();
        if($uid < 1) return array('state' => 200, 'info' => '登陆超时，请重新登陆');

        $param = $this->param;
        $aid = (int)$this->param['aid'];

        $now = time();

        $sql = $dsql->SetQuery("SELECT `ftime`, `state` FROM `#@__livelist` WHERE `id` = $aid AND `arcrank` = 1");
        $res = $dsql->dsqlOper($sql, "results");
        if(!$res) return array('state' => 200, 'info' => '直播不存在');
        if($res[0]['state'] == 1) return array('state' => 200, 'info' => '直播正在进行');
        if($res[0]['state'] == 2) return array('state' => 200, 'info' => '直播已结束');
        $ftime = $res[0]['ftime'];

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__live_booking` WHERE `uid` = $uid AND `aid` = $aid");
        $res = $dsql->dsqlOper($sql, "results");

        //已经预约的，取消预约
        if($res) {
            $sql = $dsql->SetQuery("DELETE FROM `#@__live_booking` WHERE `aid` = $aid AND `uid` = '$uid'");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == 'ok'){
                return "取消成功";
            }else{
                return array('state' => 200, 'info' => '取消失败');
            }
        }

        // 距离开始时间大于30分钟可以预约
        if($ftime > $now && $ftime - $now < 1800){
            return array('state' => 200, 'info' => '离直播时间不足30分钟，无需预约');
        }

        $sql = $dsql->SetQuery("INSERT INTO `#@__live_booking` (`aid`, `uid`, `ftime`, `notice`, `pubdate`) VALUES ($aid, $uid, $ftime, 0, $now)");
        $id = $dsql->dsqlOper($sql, "lastid");
        if(is_numeric($id)){
            return "预约成功";
        }else{
            return array('state' => 200, 'info' => '预约失败，请稍后重试');
        }
    }

    /**
     * 主播列表
     */
    public function anchorList(){
        global $dsql;
        global $userLogin;
        $where = "";
        $r        = $this->param['r'];
        $myfollow = $this->param['myfollow'];
        $order    = $this->param['order'];
        $title    = $this->param['title'];
        $page     = $this->param['page'];
        $pageSize = $this->param['pageSize'];
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        $uid = $userLogin->getMemberID();

        if($r){
            $where .= " AND `rec` = 1";
        }
        if($myfollow){
            if($uid < 1){
                return array("state" => 200, "info" => '您还没有登录');
            }
            $where .= " AND f.`id` is not null";
        }

        if($title){
            $where .= " AND m.`nickname` like '%".$title."%'";
        }

        $order = " ORDER BY `id` DESC";

        if($order == "r"){
            $order = " ORDER BY `rec` DESC, `id` DESC";
        }elseif($order == "fans"){
            $order = " ORDER BY `fans` DESC, `id` DESC";
        }

        $sql = $dsql->SetQuery("SELECT COUNT(*) c FROM `#@__live_anchor` a LEFT JOIN `#@__member_follow` f ON f.`fid` = a.`uid` AND f.`tid` = $uid AND f.`fortype` = '' LEFT JOIN `#@__member` m ON m.`id` = a.`uid` WHERE 1 = 1 AND m.`id` > 0".$where);
        $res = $dsql->dsqlOper($sql, "results");
        $totalCount = $res[0]['c'];

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where .= " LIMIT $atpage, $pageSize";

        $list = array();
        $sql = $dsql->SetQuery("SELECT a.`id`, a.`uid`, m.`username`, m.`nickname`, m.`addr`, m.`photo`, (SELECT COUNT(*) FROM `#@__member_follow` f WHERE f.`fid` = a.`uid` AND f.`fortype` = '') fans, (SELECT COUNT(*) FROM `#@__member_follow` f WHERE f.`tid` = a.`uid` AND f.`fortype` = '') gz FROM `#@__live_anchor` a LEFT JOIN `#@__member_follow` f ON f.`fid` = a.`uid` AND f.`tid` = $uid AND f.`fortype` = '' LEFT JOIN `#@__member` m ON m.`id` = a.`uid` WHERE 1 = 1 AND m.`id` > 0".$where);
        $res = $dsql->dsqlOper($sql, "results");
        if($res){
            $uid = $userLogin->getMemberID();
            foreach ($res as $key => $value) {
                $list[$key]['id'] = $value['id'];
                $list[$key]['uid'] = $value['uid'];
                $list[$key]['nickname'] = $value['nickname'] ? $value['nickname'] : $value['username'];
                $list[$key]['photo'] = getFilePath($value['photo']);
                $list[$key]['totalFans'] = $value['fans'];
                $list[$key]['gz'] = $value['gz'];

                //是否关注发布人
                if($uid > 0){
                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $uid AND `fid` = " . $value['uid'] . " AND `fortype` = ''");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $list[$key]['isMfollow'] = 1;//关注
                    }elseif($uid == $value['uid']){
                        $list[$key]['isMfollow'] = 2;//自己
                    }else{
                        $list[$key]['isMfollow'] = 0;//未关注
                    }
                }else{
                    $list[$key]['isMfollow'] = 0;//未关注
                }

                //发布直播数量
                $liveCount = 0;
                $sql = $dsql->SetQuery("SELECT count(*) total FROM `#@__livelist` WHERE `user` = " . $value['uid'] . " AND `arcrank` = 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $liveCount = $ret[0]['total'];
                }
                $list[$key]['liveCount'] = $liveCount;

                //最近直播
                $sql = $dsql->SetQuery("SELECT `title` FROM `#@__livelist` WHERE `user` = " . $value['uid'] . " AND `arcrank` = 1 ORDER BY `ftime` DESC, `id` DESC limit 1");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $list[$key]['liveTitle'] = $ret[0]['title'];
                }

                //区域
                $addr = $value['addr'];
                global $data;
                $data = "";
                $addrArr = getParentArr("site_area", $addr);
                if($addrArr){
                    $addrArr = array_reverse(parent_foreach($addrArr, "typename"));
                    $list[$key]['addrname'] = $addrArr;
                }else{
                    $list[$key]['addrname'] = array();
                }

                //是否正在直播
                $isLiving = 0;
                $sql = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__livelist` WHERE `state` = 1 AND `arcrank` = 1 AND `user` = " . $value['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret && $ret[0]['total'] > 0){
                    $isLiving = 1;
                }
                $list[$key]['isLiving'] = $isLiving;

                //会员等级
                $userinfo = $userLogin->getMemberInfo($value['uid']);
                if(is_array($userinfo)){
                    $list[$key]['level'] = array(
                        'id' => $userinfo['level'],
                        'name' => $userinfo['levelName'],
                        'icon' => $userinfo['levelIcon']
                    );
                }else{
                    $list[$key]['level'] = array(
                        'id' => 0,
                        'name' => '',
                        'icon' => ''
                    );
                }

                $param = array(
                    "service" => "live",
                    "template" => "anchor_index",
                    "userid" => $value['id']
                );
                $list[$key]['url'] = getUrlPath($param);
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 直播商品列表
     */
    public function product(){
        global $dsql;
        $where = "";
        $aid      = (int)$this->param['aid'];
        $orderby  = $this->param['orderby'];
        $title    = $this->param['keywords'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];
        $zero     = (int)$this->param['zero'];
        $u        = (int)$this->param['u'];
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if(!$aid){
            return array("state" => 200, "info" => '直播ID未知');
        }

        //直播ID
        $where .= " AND `aid` = " . $aid;

        if($title){
            $where .= " AND `title` like '%".$title."%'";
        }

        //排序
        $order = " ORDER BY `id` DESC";

        if($orderby == 'asc'){
            $order = " ORDER BY `id` ASC";
        }

        $sql = $dsql->SetQuery("SELECT COUNT(*) c FROM `#@__live_product` WHERE 1 = 1".$where);
        $res = $dsql->dsqlOper($sql, "results");
        $totalCount = $res[0]['c'];

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount
        );

        $atpage = $pageSize*($page-1);
        $where .= $order;
        $where .= " LIMIT $atpage, $pageSize";

        $list = array();
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `price`, `url`, `pic`, `click` FROM `#@__live_product` WHERE 1 = 1".$where);
        $res = $dsql->dsqlOper($sql, "results");

        if($res){

            $px = ($page - 1) * $pageSize + 1;
            if($orderby != 'asc'){
                $px = $totalCount - ($page - 1) * $pageSize + 1;
            }
            foreach ($res as $key => $value) {
                if($orderby != 'asc'){
                    $px--;
                }
                $list[$key]['px'] = $zero ? str_pad($px, 2, "0", STR_PAD_LEFT) : $px;  //补0
                $list[$key]['id'] = $value['id'];
                $list[$key]['title'] = $value['title'];
                $list[$key]['price'] = $value['price'];
                $list[$key]['url'] = $u ? $value['url'] : '/include/ajax.php?service=live&action=productRedirect&id=' . $value['id'];
                $list[$key]['pic'] = $value['pic'];
                $list[$key]['click'] = $value['click'];
                if($orderby == 'asc'){
                    $px++;
                }
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 直播商品跳转
     * @return array
     */
    public function productRedirect(){
        global $dsql;
        $id = (int)$this->param['id'];

        if($id){
            $sql = $dsql->SetQuery("SELECT `url` FROM `#@__live_product` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $url = $ret[0]['url'];
                if($url){

                    //更新点击次数
                    $sql = $dsql->SetQuery("UPDATE `#@__live_product` SET `click` = `click` + 1 WHERE `id` = $id");
                    $dsql->dsqlOper($sql, "update");

                    header('location:' . $url);

                }else{
                    header('location:/');
                }
            }
        }else{
            header('location:/');
        }

    }


    /**
     * 发布直播商品
     * @return array
     */
    public function putProduct(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        if($uid < 1){
            return array("state" => 200, "info" => '登录超时！');
        }

        $param = $this->param;

        $aid   = (int)$param['aid'];
        $title = filterSensitiveWords(addslashes($param['title']));
        $price = (float)$param['price'];
        $url   = filterSensitiveWords(addslashes($param['url']));
        $pic   = filterSensitiveWords(addslashes($param['pic']));

        if (!$aid || !$title || !$url) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT `id`, `user` FROM `#@__livelist` WHERE `id` = '$aid'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($ret[0]['user'] != $uid){
                return array("state" => 200, "info" => '直播间权限验证错误，请刷新页面重试！');
            }
        }else{
            return array("state" => 200, "info" => '直播间不存在或已经删除！');
        }

        $archives = $dsql->SetQuery("INSERT INTO `#@__live_product` (`aid`, `title`, `price`, `url`, `pic`) VALUES ('$aid', '$title', '$price', '$url', '$pic')");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "发布成功！";
        } else {
            return array("state" => 200, "info" => '发布失败！', "sql" => $results);
        }

    }


    /**
     * 修改直播商品
     * @return array
     */
    public function editProduct(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        if($uid < 1){
            return array("state" => 200, "info" => '登录超时！');
        }

        $param = $this->param;

        $id    = (int)$param['id'];
        $title = filterSensitiveWords(addslashes($param['title']));
        $price = (float)$param['price'];
        $url   = filterSensitiveWords(addslashes($param['url']));
        $pic   = filterSensitiveWords(addslashes($param['pic']));

        if (!$title || !$url) {
            return array("state" => 200, "info" => '必填项不得为空！');
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT l.`user` FROM `#@__live_product` p LEFT JOIN `#@__livelist` l ON l.`id` = p.`aid` WHERE p.`id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($ret[0]['user'] != $uid){
                return array("state" => 200, "info" => '直播间权限验证错误，请刷新页面重试！');
            }
        }else{
            return array("state" => 200, "info" => '商品不存在或已经删除！');
        }

        $archives = $dsql->SetQuery("UPDATE `#@__live_product` SET `title` = '$title', `price` = '$price', `url` = '$url', `pic` = '$pic' WHERE `id` = '$id'");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "修改成功！";
        } else {
            return array("state" => 200, "info" => '修改失败！', "sql" => $results);
        }

    }


    /**
     * 删除直播商品
     * @return array
     */
    public function delProduct(){
        global $dsql;
        global $userLogin;

        $uid = $userLogin->getMemberID();

        if($uid < 1){
            return array("state" => 200, "info" => '登录超时！');
        }

        $param = $this->param;
        $id = (int)$param['id'];

        if(!$id){
            return array("state" => 200, "info" => '请输入要删除的直播商品！');
        }

        //验证权限
        $pic = '';
        $sql = $dsql->SetQuery("SELECT l.`user`, p.`pic` FROM `#@__live_product` p LEFT JOIN `#@__livelist` l ON l.`id` = p.`aid` WHERE p.`id` = '$id'");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            if($ret[0]['user'] != $uid){
                return array("state" => 200, "info" => '直播间权限验证错误，请刷新页面重试！');
            }

            $pic = $ret[0]['pic'];
        }else{
            return array("state" => 200, "info" => '商品不存在或已经删除！');
        }

        //删除
        $sql = $dsql->SetQuery("DELETE FROM `#@__live_product` WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        //删除图片
        delPicFile($pic, 'delThumb', 'live');

        return 'ok';

    }


    /**
     * 直播用户列表
     */
    public function member(){
        global $dsql;
        global $userLogin;

        $where = "";
        $aid      = (int)$this->param['aid'];
        $mute     = (int)$this->param['mute'];
        $block    = (int)$this->param['block'];
        $keywords = $this->param['keywords'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if(!$aid){
            return array("state" => 200, "info" => '直播ID未知');
        }

        //直播ID
        $where .= " AND m.`id` != '' AND h.`aid` = " . $aid;

        //搜索用户
        if($keywords){
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '$keywords' OR `username` = '$keywords' OR `company` = '$keywords' ORDER BY `id` DESC");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $_uid = $ret[0]['id'];

                $where .= " AND h.`uid` = $_uid";
            }else{
                $where .= " AND 1 = 2";
            }
        }


        //用户总数
        $sql = $dsql->SetQuery("SELECT COUNT(h.`id`) c FROM `#@__live_member` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`aid` LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE 1 = 1".$where);
        $res = $dsql->dsqlOper($sql, "results");
        $totalMember = (int)$res[0]['c'];

        //拉黑总数
        $sql = $dsql->SetQuery("SELECT COUNT(h.`id`) c FROM `#@__live_member` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`aid` LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE 1 = 1".$where." AND h.`block` = 1");
        $res = $dsql->dsqlOper($sql, "results");
        $totalBlock = (int)$res[0]['c'];

        //禁言总数
        $sql = $dsql->SetQuery("SELECT COUNT(h.`id`) c FROM `#@__live_member` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`aid` LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE 1 = 1".$where." AND h.`mute` = 1");
        $res = $dsql->dsqlOper($sql, "results");
        $totalMute = (int)$res[0]['c'];

        //拉黑
        if($block){
            $where .= " AND h.`block` = 1";
        }

        //禁言
        if($mute){
            $where .= " AND h.`mute` = 1";
        }

        //排序
        $order = " ORDER BY h.`id` DESC";

        $sql = $dsql->SetQuery("SELECT COUNT(h.`id`) c FROM `#@__live_member` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`aid` LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE 1 = 1".$where);
        $res = $dsql->dsqlOper($sql, "results");
        $totalCount = (int)$res[0]['c'];

        if($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        //总分页数
        $totalPage = ceil($totalCount/$pageSize);

        $pageinfo = array(
            "page" => $page,
            "pageSize" => $pageSize,
            "totalPage" => $totalPage,
            "totalCount" => $totalCount,
            "totalMember" => $totalMember,
            "totalBlock" => $totalBlock,
            "totalMute" => $totalMute
        );

        $atpage = $pageSize*($page-1);
        $where .= $order;
        $where .= " LIMIT $atpage, $pageSize";

        $list = array();
        $sql = $dsql->SetQuery("SELECT h.`id`, h.`aid`, h.`uid`, h.`date`, h.`mute`, h.`block` FROM `#@__live_member` h LEFT JOIN `#@__livelist` l ON l.`id` = h.`aid` LEFT JOIN `#@__member` m ON m.`id` = h.`uid` WHERE 1 = 1".$where);
        $res = $dsql->dsqlOper($sql, "results");

        if($res){
            foreach ($res as $k => $v) {
                $list[$k]['id'] = $v['id'];
                $list[$k]['uid'] = $v['uid'];
                $list[$k]['date'] = $v['date'];
                $list[$k]['mute'] = $v['mute'];
                $list[$k]['block'] = $v['block'];

                //用户信息
                $userinfo = $userLogin->getMemberInfo($v['uid']);
                $list[$k]['userinfo'] = $userinfo;
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 拉黑、禁言
     * @return array
     */
    public function operMember(){
        global $dsql;
        global $userLogin;

        $userid = $userLogin->getMemberID();

        if($userid < 1){
            return array("state" => 200, "info" => '登录超时！');
        }

        $param = $this->param;

        $aid   = (int)$param['aid'];
        $uid   = (int)$param['uid'];
        $act   = $param['act'];
        $type  = $param['type'];

        if(!$aid) {
            return array("state" => 200, "info" => '直播间ID未指定！');
        }

        if(!$uid) {
            return array("state" => 200, "info" => '要操作的会员未指定！');
        }

        if(!$act || !$type) {
            return array("state" => 200, "info" => '要操作的动作未指定！');
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT m.`id` FROM `#@__live_member` m LEFT JOIN `#@__livelist` l ON l.`id` = m.`aid` WHERE l.`id` = '$aid' AND l.`user` = '$userid' AND m.`id` = $uid");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 200, "info" => '权限验证失败，请刷新页面重试！');
        }

        $key = $act == 'jinyan' ? 'mute' : 'block';
        $val = $type == 'add' ? 1 : 0;

        $archives = $dsql->SetQuery("UPDATE `#@__live_member` SET `".$key."` = '$val' WHERE `id` = '$uid'");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results == "ok") {
            return "操作成功！";
        } else {
            return array("state" => 200, "info" => '操作失败！', "sql" => $results);
        }

    }


    /**
     * 获取IM 聊天室记录，只取 text 和 image
     */
    public function chatRoomComment(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $userLogin->getMemberID();

        $aid      = (int)$this->param['aid'];
        $orderby  = (int)$this->param['orderby'];
        $keywords = $this->param['keywords'];
        $page     = (int)$this->param['page'];
        $pageSize = (int)$this->param['pageSize'];

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `id` = $aid AND `user` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 200, "info" => "权限验证失败！");
        }

        //搜索用户
        // $uid = 0;
        // if($keywords){
        //  $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `nickname` = '$keywords' OR `username` = '$keywords' OR `company` = '$keywords' ORDER BY `id` DESC");
        //  $ret = $dsql->dsqlOper($sql, "results");
        //  if($ret){
        //      $uid = $ret[0]['id'];
        //  }else{
        //      $uid = 0;
        //  }
        // }

        //获取Token
        $params = array (
            'action'   => 'chatRoomComment',
            'rid'      => $aid,
            'orderby'  => $orderby,
            'uid'      => $uid,
            'keywords' => $keywords,
            'page'     => $page ? (int)$page : 1,
            'pageSize' => $pageSize ? (int)$pageSize : 20
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $params, 'urlencoded', 'POST');
        $ret = json_decode($ret, true);
        $data = array();
        if($ret['state'] == 100){
            $data['pageInfo'] = $ret['pageInfo'];
            $data['list'] = array();

            foreach ($ret['list'] as $key => $value) {
                $_uid = $value['info']['uid'];
                $userinfo = $userLogin->getMemberInfo($_uid);
                $value['info']['userinfo'] = $userinfo;
                array_push($data['list'], $value);
            }

        }else{
            $data = $ret;
        }
        return $data;

    }


    /**
     * 用户删除 聊天室记录
     */
    public function delChatRoomComment(){
        global $dsql;
        global $userLogin;
        global $langData;
        global $cfg_km_accesskey_id;
        global $cfg_km_accesskey_secret;

        $userid = $userLogin->getMemberID();

        $aid = (int)$this->param['aid'];
        $cid = (int)$this->param['cid'];

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__livelist` WHERE `id` = $aid AND `user` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 200, "info" => "权限验证失败！");
        }

        //获取Token
        $params = array (
            'action' => 'delChatRoomComment',
            'rid'    => $aid,
            'mid'    => $cid
        );
        $request = new SendRequest_($cfg_km_accesskey_id, $cfg_km_accesskey_secret);
        $ret = $request->curl('/chat/chat.php', $params, 'urlencoded', 'POST');
        $ret = json_decode($ret, true);
        $data = array();
        if($ret['state'] == 100){
            return 'ok';

        }else{
            $data = $ret;
        }
        return $data;

    }


    /**
     * 设置直播回放状态
     */
    public function updateReplayState(){
        global $dsql;
        global $userLogin;
        global $langData;

        $userid = $userLogin->getMemberID();

        $id = (int)$this->param['id'];

        if($userid < 1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);   //登录超时，请重新登录！
        }

        //验证权限
        $sql = $dsql->SetQuery("SELECT `id`, `replaystate` FROM `#@__livelist` WHERE `id` = $id AND `user` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if(!$ret){
            return array("state" => 200, "info" => "权限验证失败！");
        }

        $replaystate = $ret[0]['replaystate'] ? 0 : 1;
        $sql = $dsql->SetQuery("UPDATE `#@__livelist` SET `replaystate` = '$replaystate' WHERE `id` = $id");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            return 'ok';
        }else{
            return $ret;
        }
    }

    /**
     * Notes: 获取用户预约记录
     * Ueser: Administrator
     * DateTime: 2020/12/29 9:55
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function getBooking()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;

        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '未登录或登录超时！');
        }

        $page = $this->param['page'];
        $pageSize = $this->param['pageSize'];

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page = empty($page) ? 1 : $page;
        $where = " AND b.`uid` = '$uid' ORDER BY  b.`id` ASC";
        $archives = $dsql->SetQuery("SELECT b.`uid`,b.`ftime`,b.`pubdate`,l.`id`,l.`title`,l.`litpic`,l.`state`,l.`replaystate`  FROM `#@__live_booking` b LEFT JOIN `#@__livelist` l ON l.`id`= b.`aid`  WHERE 1=1 AND l.`id` IS NOT NULL" . $where);
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
        $where = " LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where, "results");
        $list = array();
        if ($results) {
            foreach ($results as $k => $v) {
                $list[$k]['uid']        = $v['uid'];
                $list[$k]['id']         = $v['id'];
                $list[$k]['ftime']      = $v['ftime'];
                $list[$k]['pubdate']    = $v['pubdate'];
                $list[$k]['title']      = $v['title'];
                $list[$k]['replaystate']= $v['replaystate'];
                $list[$k]['state']      = $v['state']; //直播状态：0：未直播；1：正在直播；2：结束直播；
                $list[$k]['litpic']     = $v['litpic'] != '' ? getFilePath($v['litpic']) : '';
            }

        } else {
            return array("state" => 200, "info" => '暂无相关数据！');
        }

        return array("pageInfo" => $pageinfo, "list" => $list);
    }
}


function percent_encode($res)
{
    $res = trim(utf8_encode(urlencode($res)));
    //$res=utf8_encode($res);
    $res = str_replace(array('+', '*', '%7E'), array('%20', '%2A', '~'), $res);
    return $res;
}

function signString($source, $accessSecret)
{
    return base64_encode(hash_hmac('sha1', $source, $accessSecret, true));
}

function uuid($prefix = '')
{
    $chars = md5(uniqid(mt_rand(), true));
    $uuid  = substr($chars, 0, 8) . '-';
    $uuid  .= substr($chars, 8, 4) . '-';
    $uuid  .= substr($chars, 12, 4) . '-';
    $uuid  .= substr($chars, 16, 4) . '-';
    $uuid  .= substr($chars, 20, 12);
    return $prefix . $uuid;
}
