<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 圈子模块API接口
 *
 * @version        $Id: circle.class.php 2019-10-22 上午11:57:30 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class circle
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
     * 圈子基本参数
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/circle.inc.php");

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

        // $domainInfo = getDomain('image', 'config');
        // $customChannelDomain = $domainInfo['domain'];
        // if($customSubDomain == 0){
        // 	$customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        // 	$customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        // 	$customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('circle', $customSubDomain);

        //分站自定义配置
        $ser = 'circle';
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

            $return['customhot'] = $customhot;

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
                } elseif ($param == "customhot") {
                    $return['customhot'] = (int)$customhot;
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
            $return['customhot']     = (int)$customhot;
            $return['atlasMax']      = (int)$customAtlasMax;
            $return['template']      = $customTemplate;
            $return['touchTemplate'] = $customTouchTemplate;
            $return['softSize']      = $custom_softSize;
            $return['softType']      = $custom_softType;
            $return['thumbSize']     = $custom_thumbSize;
            $return['thumbType']     = $custom_thumbType;
            $return['atlasSize']     = $custom_atlasSize;
            $return['atlasType']     = $custom_atlasType;
			$return['rewardSwitch']  = isByteMiniprogram() ? 1 : (int)$customRewardSwitch;  //抖音小程序中强制关闭
			$return['rewardLimit']  = $customRewardLimit ? (float)$customRewardLimit : 100;
			$return['rewardOption']  = $customRewardOption ? array_map('floatval', explode("\r\n", $customRewardOption)) : array(1,2,5);
        }

        return $return;

    }


    /**
     * 新增动态
     * @return array
     */
    public function dynamicAdd()
    {
        global $dsql;
        global $userLogin;
        include HUONIAOINC . "/config/circle.inc.php";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $userid      = $userLogin->getMemberID();
                $content     = filterSensitiveWords(addslashes($this->param['con']));
                $picadr      = $this->param['litpic'];
                $videoadr    = $this->param['video'];
                $topicid     = $this->param['topic'];
                $topictitle  = filterSensitiveWords(addslashes($this->param['topicname']));
                $jwd         = explode(',', $this->param['posi']);
                $lng         = $jwd['0'];
                $lat         = $jwd['1'];
                $addrname    = filterSensitiveWords(addslashes($this->param['posiname']));
                $commodity   = $this->param['commodity'];
                $videoPoster = $this->param['videoPoster'];
                $addtime     = time();
            }

            if ($userid == -1) {
                return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
            }

            if ($customFabuCheck == 1) {
                $state = '1';
            } else {
                $state = '0';
            }
            if ($picadr != "" && $videoadr != "") {
                return array("state" => 200, "info" => '图片和视频只能传一个');
            } elseif ($videoadr != "") {
                $type = '1';
            } elseif ($picadr != "") {
                $type = '0';
            } else {
                $type = '0';
            }

            if ($topicid == "" && $topictitle != "") {
                $addtime = time();

                $rand   = rand(1, 22);
                $path   = '/static/images/circle/topic/';
                $litpic = $path . 's' . $rand . '.png';
                $banner = $path . $rand . '.png';

                $sql     = $dsql->SetQuery("INSERT INTO `#@__circle_topic` (`uid`,`title`,`pubdate`,`litpic`,`banner`) VALUES ('$userid','$topictitle','$addtime','$litpic','$banner')");
                $topicid = $dsql->dsqlOper($sql, "lastid");

            } elseif ($topicid == "" && $topictitle == "") {
                $topicid = "0";
            }


            $commodityStr = '[]';
            if(is_array(json_decode($commodity, true))){
                $commodityStr = $commodity;
            }

            $ip = GetIP();
            $ipaddr = getIpAddr($ip);

            $picadrList = array();
            if($picadr){
                $picadr = explode(',', $picadr);
                if($picadr){
                    foreach($picadr as $key => $val){
                        array_push($picadrList, $val);
                    }
                    //最多9张图片
                    $picadrList = array_splice($picadrList, 0, 9);
                }
            }
            $picadr = join(',', $picadrList);

            $dynamic = $dsql->SetQuery("INSERT INTO `#@__circle_dynamic_all` (`userid`, `content`, `picadr`, `thumbnail`,`videoadr`,`topicid`,`topictitle`,`lng`,`lat`,`addrname`,`commodity`,`addtime`,`state`,`type`, `ip`, `ipaddr`) VALUES ('$userid', '$content', '$picadr', '$videoPoster','$videoadr','$topicid','$topictitle','$lng','$lat','$addrname','$commodityStr','$addtime','$state','$type','$ip','$ipaddr')");
            $dyid    = $dsql->dsqlOper($dynamic, "lastid",null,"circle_dynamic");

            if (!empty($dyid)) {
                dataAsync("circle",$dyid);  // 新增圈子动态
                autoShowUserModule($userid,'circle');  // 新增圈子动态
                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `lng` = '$lng', `lat` = '$lat' WHERE `id` = $userid");
                $dsql->dsqlOper($sql, "update");
                updateCache("circle_list", 300);

                //微信通知
                $userinfo = $userLogin->getMemberInfo($userid, 1);

                $title = '';
                $txt   = $content ? cn_substrR($content, 20) : '';
                if ($videoadr) {
                    $title = '【视频】';
                }
                if ($picadr) {
                    $title = '【图片】';
                }
                $title .= $txt;
        
                //记录用户行为日志
                memberLog($userid, 'circle', '', $dyid, 'insert', '发布信息('.$title.')', '', $dynamic);

                $noticemodulename = getModuleTitle(array('name'=>'circle'));

                $param = array(
                    'type'   => '2', //区分佣金 给分站还是平台发送 1分站 2平台
                    'cityid' => 0,
                    'notify' => '管理员消息通知',
                    'fields' => array(
                        'contentrn' => $noticemodulename."模块\r\n用户：".$userinfo['nickname']."\r\n发布了动态：".$title,
                        'date'      => date("Y-m-d H:i:s", time()),
                    )
                );

                if (!$state) {
                    updateAdminNotice("circle", "detail", $param);
                }
                if ($state) {
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    global $cfg_returnInteraction_circle;    //圈子积分
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_circle > 0) {
                        $infoname = getModuleTitle(array('name' => 'circle'));
                        //圈子发布得积分
                        $date = GetMkTime(time());
                        global $userLogin;
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_circle' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user      = $userLogin->getMemberInfo($userid, 1);
                        $userpoint = $user['point'];
//                        $pointuser = (int)($userpoint+$cfg_returnInteraction_circle);
                        //保存操作日志
                        $info     = '发布' . $infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_circle', '$info', '$date','zengsong','1','$userpoint')");//发布圈子得积分
                        $dsql->dsqlOper($archives, "update");
                        $param = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $userinfo['username'],
                            "amount"   => $cfg_returnInteraction_circle,
                            "point"    => $userinfo['point'],
                            "date"     => date("Y-m-d H:i:s", $date),
                            "info"     => $info,
                            "fields"   => array(
                                'keyword1' => '变动类型',
                                'keyword2' => '变动积分',
                                'keyword3' => '变动时间',
                                'keyword4' => '积分余额'
                            )
                        );
                        updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                    }

                }

                return array('state' => "100", 'info' => $dyid);
            } else {
                return array('state' => "200", 'info' => "发表失败");
            }
        }

    }


    /**
     * 用户新增话题
     * @return array
     */

    public function topicAdd()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $userid  = $userLogin->getMemberID();

                if ($userid == -1) {
                    return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
                }
                
                $title   = $this->param['title'];
                $addtime = time();
                $sql     = $dsql->SetQuery("INSERT INTO `#@__circle_topic` (`uid`,`title`,`pubdate`) VALUES ('$userid','$title','$addtime')");
                $dyid    = $dsql->dsqlOper($sql, "lastid");
                if (!empty($dyid)) {
        
                    //记录用户行为日志
                    memberLog($userid, 'circle', 'topic', $dyid, 'insert', '新增话题('.$title.')', '', $sql);

                    return array('state' => "100", 'info' => $dyid);
                } else {

                    return array('state' => "200", 'info' => "重复的标题");

                }
            }

        }

    }


    /**
     * 获取话题列表
     * @return array
     */
    public function getTopic()
    {
        global $dsql;
        global $userLogin;
        $pageinfo = $list = array();
        $typeid   = $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $keywords = $this->param['keywords'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        $order  = " ORDER BY `id` ASC";
        $userid = $userLogin->getMemberID();

        //模糊查询关键字
        if (!empty($keywords)) {

            //搜索记录
            siteSearchLog("circle", $keywords);

            $keywords = explode(" ", $keywords);
            $w        = array();
            foreach ($keywords as $k => $v) {
                if (!empty($v)) {
                    $w[] = "`title` like '%" . $v . "%'";
                }
            }
            $where .= " AND (" . join(" OR ", $w) . ")";
        }

        if (!empty($name)) {
            //搜索记录
            siteSearchLog("tieba", $name);
            $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$name%' or `nickname` like '%$name%' or `company` like '%$name%'");
            $retname = $dsql->dsqlOper($sql, "results");
            if (!empty($retname) && is_array($retname)) {
                $list_name = array();
                foreach ($retname as $key => $value) {
                    $list_name[] = $value["id"];
                }
                $idList = join(",", $list_name);
                $where  .= " AND  l.`uid` in ($idList) ";
            }
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;


        $archives       = $dsql->SetQuery("SELECT `id`,`uid`,`title`,`note`,`litpic`,`banner`,`pubdate` FROM `#@__circle_topic`  WHERE 1 = 1" . $where);
        $archives_count = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__circle_topic`  WHERE 1 = 1" . $where);
        //总条数
        // $totalResults = $dsql->dsqlOper($archives_count, "results", "NUM");
        // $totalCount = (int)$totalResults[0][0];
        $totalCount = (int)getCache("circle_total", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));

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
        if ($u == 1 && $userid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives . " AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND `state` = 2", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
        }

        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        // $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
        $results    = getCache("circle_list", $archives . $where1 . $order . $where, 300, array("disabled" => $u));
        $dynamicsql = $dsql->SetQuery("SELECT `id` ,`userid`,`topicid` FROM `#@__circle_dynamic_all`");
        $res        = $dsql->dsqlOper($dynamicsql, "results");
        $dynamic    = array_column($res, 'topicid', 'id');
        $dycount    = array_count_values($dynamic);
        //查询是否参与过
        if ($results) {
            foreach ($results as $key => $val) {
                $list[$key]['id']         = $val['id'];
                $list[$key]['typeid']     = $val['typeid'];
                $list[$key]['title']      = $val['title'];
                $list[$key]["topiccount"] = $dycount[$val['id']] ? $dycount[$val['id']] : '0';
                $user                     = $dsql->SetQuery("SELECT `id` FROM `#@__circle_dynamic_all` WHERE `userid` = $userid AND `topicid` = {$val['id']}");
                $useres                   = $dsql->dsqlOper($user, "results");
                if (empty($useres)) {
                    $list[$key]["join"] = '';
                } else {
                    $list[$key]["join"] = '1';
                }

                //是否创建

                if ($val['uid'] == $userid) {
                    $list[$key]["establish"] = '1';
                } else {
                    $list[$key]["establish"] = '0';
                }
                global $data;
                $data                   = "";
                $typeArr                = getParentArr("circle_type", $val['typeid']);
                $typeArr                = array_reverse(parent_foreach($typeArr, "typename"));
                $list[$key]['typename'] = $typeArr;

                $list[$key]['pubdate']  = $val['pubdate'];
                $list[$key]['pubdate1'] = floor((GetMkTime(time()) - $val['pubdate'] / 86400) % 30) > 30 ? date("Y-m-d", $val['pubdate']) : FloorTime(GetMkTime(time()) - $val['pubdate']);

                //会员中心显示信息状态
                if ($u == 1 && $userid > -1) {
                    $list[$key]['state']   = $val['state'];
                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                $list[$key]['reply']  = $val['reply'];
                $list[$key]['litpic'] = $val['litpic'];


                $imgGroup = array();
                $video    = '';
                global $cfg_attachment;
                global $cfg_basehost;

                $attachment = str_replace("http://" . $cfg_basehost, "", $cfg_attachment);
                $attachment = str_replace("https://" . $cfg_basehost, "", $attachment);

                $attachment = str_replace("/", "\/", $attachment);
                $attachment = str_replace(".", "\.", $attachment);
                $attachment = str_replace("?", "\?", $attachment);
                $attachment = str_replace("=", "\=", $attachment);

                preg_match_all("/$attachment(.*)[\"|'|&| ]/isU", $content, $picList);
                $picList = array_unique($picList[1]);


                preg_match_all("/<[img|IMG].*?src=[\'|\"](.*?(?:[\.gif|\.jpg|\.png|\.jpeg|\.GIF|\.JPG|\.PNG|\.JPEG]))[\'|\"].*?[\/]?>/i", $content, $picList_);
                $picList_ = array_unique($picList_[1]);

                if ($picList_) {
                    foreach ($picList_ as $k => $v) {
                        if (!strstr($v, 'attachment')) {
                            array_push($picList, (strstr($v, 'http') || strstr($v, '/tieba/') ? '' : '/tieba/') . $v);
                        }
                    }
                }


            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     * 圈子动态列表、动态12月4号最终版本
    */

    public function tlist()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $pageinfo = $list = array();
        $keywords = $orderby = $u = $uid = $state = $page = $pageSize = $where = $where1 = "";
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $keywords  = trim($this->param['keywords']);
                $name      = $this->param['username'];
                $orderby   = $this->param['orderby'];
                $topicid   = $this->param['topicid'];
                $u         = $this->param['u'];
                $module    = $this->param['module'];
                $notid     = $this->param['notid'];
                $uid       = $this->param['uid'];
                $state     = $this->param['state'];
                $ispic     = $this->param['ispic'];
                $istop     = $this->param['istop'];
                $type      = $this->param['type'];
                $lng       = $this->param['lng'];
                $lat       = $this->param['lat'];
                $h5type    = $this->param['h5type'];
                $dynamicid = $this->param['dynamicid'];
                $page      = $this->param['page'];
                $pageSize  = $this->param['pageSize'];
            }
        }

        $userid = $userLogin->getMemberID();
        //是否输出当前登录会员的信息
        $group = "";
        if ($u == 1) {
            if ($uid != '') {
                $where .= " AND d.`state` = 1 AND d.`userid` = " . $uid;
            }else{
                $where .= " AND d.`userid` = " . $userid;
            }
        } else {
            $where = " AND d.`state` = 1";
        }

        if ($type == "follow") {
            //查找自己关注的人
            $sql    = $dsql->SetQuery("SELECT `fid` FROM `#@__member_follow` WHERE `tid` = $userid AND `tid` != -1");
            $result = $dsql->dsqlOper($sql, "results");
            $follow = implode(',', array_column($result, 'fid'));
            if($follow){
                $where  .= " AND d.`userid` in ($follow)";
            }else{
                $where .= " AND 1 = 2";
            }
        } elseif ($type == "nofollow") {
            //点赞
            // $sql  = $dsql->SetQuery("SELECT `pid` FROM `#@__circle_fabulous` WHERE `uid` = $userid");
            // $result = $dsql->dsqlOper($sql,"results");
            // $follow = implode(',',array_column($result, 'pid'));
            // //评论
            // $plsql =  $dsql->SetQuery("SELECT `aid` FROM `#@__public_comment_all` WHERE `userid` = $userid AND `type` = 'circle-dynamic' GROUP BY `aid`");
            // $plresult = $dsql->dsqlOper($plsql,"results");
            // $pl = implode(',',array_column($plresult, 'aid'));
            // if (!empty($follow) || !empty($pl)) {
            // 	$where .=" AND (d.`userid` in ($follow))or(d.`id` in ($pl))";
            // }
            $where .= " AND d.`userid` !=$userid";

        } elseif ($type == "topicdetail") {
            if ($topicid != '') {
                $where .= " AND d.`topicid` =" . $topicid;
            } else {
                $group = " GROUP BY d.`topicid`";
                $where .= " AND d.`topicid` !=''";
            }

        } elseif ($type == "fujin") {
            $juli = "";
            if ($lng && $lat) {
                $juli = ", ROUND(
			        6378.138 * 2 * ASIN(
			            SQRT(POW(SIN(($lat * PI() / 180 - d.`lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(d.`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - d.`lng` * PI() / 180) / 2), 2))
			        ) * 1000
			    ) AS juli";

                //筛选10KM范围内的店铺
                $where .= " AND ROUND(
			        6378.138 * 2 * ASIN(
			            SQRT(POW(SIN(($lat * PI() / 180 - d.`lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(d.`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - d.`lng` * PI() / 180) / 2), 2))
			        ) * 1000
			    ) < 10000";
            }
        }
        //只获取视频

        if($keywords){
            $where .= " AND d.`content` like '%$keywords%'";
        }

        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;
        //评论排行
        if ($orderby == "reply") {

            $order = " ORDER BY reply DESC, `id` DESC";

        } elseif ($orderby == "browse") {

            if ($type == "topicdetail"){
                $order = " ORDER BY `tbrowse` DESC, `id` DESC";
            }else{
                $order = " ORDER BY `browse` DESC, `id` DESC";
            }

        } elseif ($orderby == "pubdate") {
            if ($type == "topicdetail") {
                $order = " ORDER BY d.`addtime` DESC";
            } else {
                $order = " ORDER BY d.`id` DESC";
            }

        } elseif ($orderby == "hot") {

            $order = " ORDER BY d.`zan` DESC";

        } elseif ($orderby == "active") {//发帖最多的用户

            $order = " GROUP BY uid order by count(id) desc";

        } elseif ($orderby == "lastreply") {//最新回复  去除重复的tid

            $sql      = $dsql->SetQuery("SELECT max(id) as mid, `aid`, `dtime` FROM `#@__public_comment_all` WHERE `ischeck` = 1  AND `pid` = 0 AND `type` = 'circle-dynamic' GROUP BY aid ORDER BY  mid DESC, dtime DESC");
            $retReply = $dsql->dsqlOper($sql, "results");
            if ($retReply) {
                foreach ($retReply as $key => $value) {
                    $replyArr[] = $value['aid'];
                }
                $replyArr = join(',', $replyArr);
                $where    .= " AND `id` in ($replyArr)";
                $order    = " order by field (`id`,$replyArr)";
            }
            //本周阅读量排行
        } elseif ($orderby == 'getviedo') {
            // $sub = new SubTable('circle_dynamic', '#@__circle_dynamic');
            if ($h5type == 1) {
                $where .= " AND d.`id` < $dynamicid AND type = 1";
            } elseif ($h5type == '' && $module != "all") {
                $where .= " AND d.`id` <= $dynamicid AND type = 1";
            }

            if ($module == "all") {
                $where .= " AND type = 1";
            }
            $order = " order by  d.`id` desc";

        }

        //话题
        if ($type == "topicdetail" && $topicid == "") {
            $archives = $dsql->SetQuery("SELECT * FROM (SELECT d.*, t.`browse` tbrowse, (SELECT COUNT(`id`)  FROM `#@__public_comment_all` WHERE `aid` = d.`id` AND `ischeck` = 1 AND `type` = 'circle-dynamic') AS reply,m.`nickname`,m.`mtype`,m.`photo`,m.`level`" . $juli . " FROM `#@__circle_dynamic_all` d LEFT JOIN `#@__member` m ON d.`userid` = m.`id` LEFT JOIN `#@__circle_topic` t ON t.`id` = d.`topicid` WHERE 1 = 1" . $where . " order by d.`addtime` desc) as d");
        } else {
            $archives = $dsql->SetQuery("SELECT d.*, (SELECT COUNT(`id`)  FROM `#@__public_comment_all` WHERE `aid` = d.`id` AND `ischeck` = 1 AND `type` = 'circle-dynamic') AS reply,m.`nickname`,m.`mtype`,m.`photo`,m.`level`" . $juli . " FROM `#@__circle_dynamic_all` d LEFT JOIN `#@__member` m ON d.`userid` = m.`id` WHERE 1 = 1" . $where);
        }

        $archives_count = $dsql->SetQuery("SELECT COUNT(*) FROM (SELECT `id` FROM `#@__circle_dynamic_all` d WHERE 1 = 1" . $where . $group . ") as cc");
        // var_dump($archives_count);die;
        //总条数
        // $totalCount = (int)getCache("circle_total", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        $totalCount = (int)$dsql->getOne($archives_count);
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
            $totalGray = $dsql->dsqlOper($archives . " AND d.`state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives . " AND d.`state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives . " AND d.`state` = 2", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;

            if ($state != "") {
                $archives .= " AND d.`state` =" . $state;
            }
        }


        //会员等级
        $levelsql  = $dsql->SetQuery("SELECT `id`,`name`,`icon` FROM `#@__member_level`");
        $levelre   = $dsql->dsqlOper($levelsql, "results");
        $levelarr  = array_column($levelre, 'name', 'id');
        $levelarr_ = array_column($levelre, 'icon', 'id');
        // $level 		= array_column($levelre, 'name','id');
        $atpage = $pageSize * ($page - 1);
        $where  = " LIMIT $atpage, $pageSize";
        // $results = $dsql->dsqlOper($archives.$where1.$order.$where, "results");
        // var_dump($archives.$where1.$group.$order.$where);die;
        $results = getCache("circle_list", $archives . $where1 . $group . $order . $where, 300, array("disabled" => $u, "sensitive" => 0));

        if ($results && is_array($results)) {

            $RenrenCrypt = new RenrenCrypt();

            foreach ($results as $key => $val) {
                $list[$key]['id']        = $val['id'];
                $list[$key]['userid']    = $val['userid'];
                $list[$key]['juli']      = $val['juli'] > 1000 ? sprintf("%.1f", $val['juli'] / 1000) . $langData['siteConfig'][13][23] : $val['juli'] . $langData['siteConfig'][13][22];  //距离   //千米  //米
                $list[$key]['username']  = $val['nickname'];
                $list[$key]['usertype']  = $val['mtype'];
                $list[$key]['photo']     = getFilePath($val['photo']);
                $list[$key]['content']   = strip_tags($val['content']);
                $list[$key]['thumbnail'] = getFilePath($val['thumbnail']);
                $list[$key]['videoadr']  = getFilePath($val['videoadr']);

                $mediaArr = array();
                if ($val['picadr']) {
                    $picadr = explode(',', $val['picadr']);
                    foreach ($picadr as $k => $v) {
                        array_push($mediaArr, getFilePath($v));
                    }
                    //最多9张图片
                    $mediaArr = array_splice($mediaArr, 0, 9);
                }

                //封面尺寸
                //只有视频和一张图片时输出
                if (($val['thumbnail'] && $val['videoadr']) || count($mediaArr) == 1) {
                    $_pic = '';
                    if ($val['thumbnail'] && $val['videoadr']) {
                        $_pic = $val['thumbnail'];
                    } else {
                        $_pic = explode(',', $val['picadr']);
                        $_pic = $_pic[0];
                    }

                    $fid      = $RenrenCrypt->php_decrypt(base64_decode($_pic));
                    $picwidth = $picheight = 0;
                    if (is_numeric($fid)) {
                        $sql = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `id` = '$fid'");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $picwidth  = $ret[0]['width'];
                            $picheight = $ret[0]['height'];
                        }
                    } else {
                        $rpic = str_replace('/uploads', '', $_pic);
                        $sql  = $dsql->SetQuery("SELECT `width`, `height` FROM `#@__attachment` WHERE `path` = '$rpic'");
                        $ret  = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $picwidth  = $ret[0]['width'];
                            $picheight = $ret[0]['height'];
                        }
                    }

                    $list[$key]['attachment'] = array(
                        'width'  => (int)$picwidth,
                        'height' => (int)$picheight
                    );
                }

                $list[$key]['media']      = $mediaArr;
                $list[$key]['topicid']    = $val['topicid'];
                $list[$key]['topictitle'] = $val['topictitle'];
                $list[$key]['lng']        = $val['lng'];
                $list[$key]['lat']        = $val['lat'];
                $list[$key]['addrname']   = $val['addrname'];
                $list[$key]['level']      = $val['level'];
                $list[$key]['zan']        = $val['zan'];
                $list[$key]['type']       = $val['type'];
                $list[$key]['levelname']  = $levelarr[$val['level']] ? $levelarr[$val['level']] : "普通会员";
                $list[$key]['levelicon']  = getFilePath($levelarr_[$val['level']]);

                $commodity = $val['commodity'] ? json_decode($val['commodity'], true) : array();
                if ($commodity) {
                    foreach ($commodity as $k => $v) {
                        $litpic = $v['litpic'];
                        if ($litpic) {
                            $litpic_                 = explode('?f=', $litpic);
                            $litpic_                 = getFilePath($litpic_[1]);
                            $commodity[$k]['litpic'] = $litpic_ ? $litpic_ : $litpic;
                        }
                    }
                }

                $list[$key]["commodity"] = $commodity;

                $topicarr                = array(
                    "service"  => "circle",
                    "template" => "topic_detail",
                    "id"       => $val['topicid']
                );
                $list[$key]['topicurl']  = getUrlPath($topicarr);
                $topic                   = $dsql->SetQuery("SELECT `browse`,(SELECT count(`id`)  FROM `#@__circle_dynamic_all` where `topicid` = {$val['topicid']}) as topicjoin  FROM `#@__circle_topic` WHERE `id` = " . $val['topicid']);
                $topicres                = $dsql->dsqlOper($topic, "results");
                $list[$key]['browse']    = $type == "topicdetail" ? (int)$val['tbrowse'] : (int)$val['browse'];
                $list[$key]['topicjoin'] = $topicres[0]['topicjoin'] ? $topicres[0]['topicjoin'] : 0;
                $list[$key]["up"]        = $val['zan'];


                global $data;
                $data = "";

                $list[$key]['pubdate']  = $val['addtime'];
                $list[$key]['pubdate1'] = floor((GetMkTime(time()) - $val['addtime'] / 86400) % 30) > 30 ? date("Y-m-d", $val['addtime']) : FloorTime(GetMkTime(time()) - $val['addtime']);

                //会员中心显示信息状态
                if ($u == 1 && $userid > -1) {
                    $list[$key]['state']   = $val['state'];
                    $list[$key]['waitpay'] = $val['waitpay'];
                }

                $list[$key]['reply'] = $val['reply'];

                $param             = array(
                    "service"  => "circle",
                    "template" => "blog_detail",
                    "id"       => $val['id']
                );
                $list[$key]['url'] = getUrlPath($param);


                //查询点赞用户信息

                $diansql = $dsql->SetQuery("SELECT m.`photo`,m.`id`,f.`tid` FROM `#@__public_up_all` f LEFT JOIN `#@__member` m on f.`ruid` = m.`id` WHERE `module`= 'circle' AND tid = " . $val['id'] . " ORDER BY f.`id` DESC LIMIT 0, 8");
                $dianres = $dsql->dsqlOper($diansql, "results");

                //判断是否当前用户是否点赞
                $zanList = array();
                if ($dianres) {
                    foreach ($dianres as $k => $v) {
                        array_push($zanList, array(
                            'id'    => $v['id'],
                            'did'   => $v['tid'],
                            'photo' => getFilePath($v['photo'])
                        ));
                    }
                    if (in_array($userid, array_column($zanList, 'id'))) {
                        $list[$key]['isdz'] = '1';
                    } else {
                        $list[$key]['isdz'] = '0';
                    }
                } else {
                    $list[$key]['isdz'] = '0';
                }
                $list[$key]['dianres'] = $zanList;

                //最新评论
                $sql = $dsql->SetQuery("SELECT p.`id`,p.`userid` , p.`content`, p.`dtime` pubdate, m.`nickname`,p.`zan` FROM `#@__public_comment_all` p LEFT JOIN `#@__member` m on p.`userid` = m.`id` WHERE `ischeck` = 1 AND `type` = 'circle-dynamic' AND `aid` = '" . $val['id'] . "' AND `pid` = 0 order by pubdate desc LIMIT 3");
                $ret = $dsql->dsqlOper($sql, "results");

                $list[$key]['lastReply'] = $ret;

                // 打赏
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_reward` WHERE `module` = 'circle' AND `aid` = " . $val["id"] . " AND `state` = 1");
                //总条数
                $totalCount = $dsql->dsqlOper($archives, "totalCount");
                if ($totalCount) {
                    $archives    = $dsql->SetQuery("SELECT SUM(`amount`) totalAmount FROM `#@__member_reward` WHERE `module` = 'circle' AND `aid` = " . $val["id"] . " AND `state` = 1");
                    $ret         = $dsql->dsqlOper($archives, "results");
                    $totalAmount = $ret[0]['totalAmount'];
                } else {
                    $totalAmount = 0;
                }
                $list[$key]['reward'] = array("count" => $totalCount, "amount" => $totalAmount);

                $fsql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `tid` != -1 AND `fid` = " . $val['userid']);

                $fret = $dsql->dsqlOper($fsql, "results");
                if ($fret) {
                    $list[$key]['isfollow'] = 1;//关注
                } elseif ($userid == $val['ruid']) {
                    $list[$key]['isfollow'] = 2;//自己
                } else {
                    $list[$key]['isfollow'] = 0;//未关注
                }
                if ($orderby == 'active') {
                    //是否相互关注

                    //帖子总数
                    $sql                     = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__circle_dynamic_all` WHERE `state` = 1 AND `uid` = " . $val['uid']);
                    $ret                     = $dsql->dsqlOper($sql, "results");
                    $list[$key]['tiziTotal'] = $ret[0]['t'];
                    //粉丝人数
                    $sql                     = $dsql->SetQuery("SELECT count(`id`) t FROM `#@__member_follow` WHERE `fid` = " . $val['uid']);
                    $fansret                 = $dsql->dsqlOper($sql, "results");
                    $list[$key]['totalFans'] = $fansret[0]['t'];
                }

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }


    /**
     *点赞
     */
    public function Fabulous()
    {
        global $dsql;
        global $userLogin;
        global $langData;

        global $cfg_disableLikeState;  //是否禁止点赞
        global $cfg_disableLikeInfo;  //禁止点赞提示语
        $cfg_disableLikeState = (int)$cfg_disableLikeState;
        $cfg_disableLikeInfo = $cfg_disableLikeInfo ? $cfg_disableLikeInfo : '功能维护中，暂停使用！';

        if ($cfg_disableLikeState) {
            return array("state" => 200, "info" => $cfg_disableLikeInfo);
        }
        
        $param  = $this->param;
        $did    = $param['did'];
        $fbuid  = $param['fbuid'];
        $dzuid  = $param['dzuid'];
        $dztype = $param['dztype'];

        $userid   = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        $puctime = time();
        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        if (empty($did) || empty($fbuid) || empty($dzuid)) return array("state" => 200, "info" => $langData['siteConfig'][33][13]);//参数错误

        // $showsql = $dsql->SetQuery("SHOW TABLES LIKE   '%#@__circle_fabulous_all%'");
        // $showres = $dsql->dsqlOper($showsql,"results");
        // if ($showres) {
        // 	$fabuloustable = '#@__circle_fabulous_all';
        // }else{
        // 	$fabuloustable = '#@__circle_fabulous';
        // }
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__public_up_all`  WHERE `tid` = '$did' and `ruid` = '$dzuid' and `uid` = '$fbuid' and `module` ='circle' ");
        $res = $dsql->dsqlOper($sql, "results");

        $sub         = new SubTable('circle_dynamic', '#@__circle_dynamic');
        $break_table = $sub->getSubTableById($did);
        $param       = array(
            "service"  => "member",
            'type'     => 'user',
            "template" => "im/commt_list.html#zan"

        );
        if ($res) {
            $archives = $dsql->SetQuery("UPDATE `" . $break_table . "` SET  `zan` = zan - 1 WHERE `id` = '$did'");
            $results  = $dsql->dsqlOper($archives, "update");
            if ($results == "ok") {
                $sql   = $dsql->SetQuery("SELECT `content` FROM `" . $break_table . "`  WHERE `id` = '$did'");
                $res   = $dsql->dsqlOper($sql, "results");
                $title = $res[0]['content'];

                $archives = $dsql->SetQuery("DELETE FROM `#@__public_up_all` WHERE `tid` = '$did' and `ruid` = '$dzuid' and `uid` = '$fbuid' and `module` ='circle' ");
                $dsql->dsqlOper($archives, "update");

                checkCache("circle_list", $did);
                clearCache("circle_detail", $did);
                // $content = $userinfo['nickname'] . "取消了点赞您的信息";
                // $config = array(
                //     "noticetitle" => $content,
                //     "title" => $title,
                //     "date" => date("Y-m-d H:i:s", $puctime),
                //     "fields" => array(
                //         'keyword1' => '信息标题',
                //         'keyword2' => '评论时间',
                //         'keyword3' => '进展状态'
                //     )
                // );
                // updateMemberNotice($fbuid, "会员-点赞提醒", $param, $config, "");
                return "ok";
            } else {
                return array("state" => 200, "info" => $langData['siteConfig'][21][72]);//操作失败，请重试！
            }

        } else {

            $archives = $dsql->SetQuery("UPDATE `" . $break_table . "` SET  `zan` = zan + 1 WHERE `id` = '$did'");
            $results  = $dsql->dsqlOper($archives, "update");
            // $results = "ok";
            if ($results == "ok") {
                //   	$sub = new SubTable('circle_fabulous', '#@__circle_fabulous');
                // $insert_table_name = $sub->getLastTable();

                $sql   = $dsql->SetQuery("SELECT `content` FROM `" . $break_table . "`  WHERE `id` = '$did'");
                $res   = $dsql->dsqlOper($sql, "results");
                $title = $res[0]['content'];
                $archives   = $dsql->SetQuery("INSERT INTO `#@__public_up_all` (`uid`, `tid`, `ruid`, `action`,`module`,`type`,`puctime`) VALUES ('$fbuid', '$did', '$dzuid','circle-blogdetail' ,'circle','0','$puctime')");
                $fabulousid = $dsql->dsqlOper($archives, "lastid",null,"public_up");
                // checkCache("circle_list", $did);
                //             clearCache("circle_detail", $did);

                //             $sql = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
                // $res = $dsql->dsqlOper($sql, "results");
                //       $breakup_table_count = $res[0]['total'];
                //       if($breakup_table_count >= $sub::MAX_SUBTABLE_COUNT){
                //           $new_table = $sub->createSubTable($fabulousid); //创建分表并保存记录
                //       }
                $content = $userinfo['nickname'] . "点赞了您信息";
                $config  = array(
                    "noticetitle" => $content,
                    "title"       => $title,
                    "date"        => date("Y-m-d H:i:s", $puctime),
                    "fields"      => array(
                        'keyword1' => '信息标题',
                        'keyword2' => '评论时间',
                        'keyword3' => '进展状态'
                    )
                );
                updateMemberNotice($fbuid, "会员-点赞提醒", $param, $config, "");
                return "ok";
            } else {
                return array("state" => 200, "info" => $langData['siteConfig'][21][72]);//操作失败，请重试！
            }
        }

    }

    /**
     *话题参与or创建
     */

    public function topicquery()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param = $this->param;
        if (!empty($param)) {
            if (!is_array($param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {

                $type     = $param['type'];
                $page     = $param['page'];
                $pageSize = $param['pageSize'];
                $userid   = $userLogin->getMemberID();
            }

            $where = array();
            $where = " uid = $userid";


            $pageSize = empty($pageSize) ? 10 : $pageSize;
            $page     = empty($page) ? 1 : $page;

            if ($type == "create") {
                $archives_count = $dsql->SetQuery("SELECT count(ct.`id`) as total FROM `#@__circle_topic` AS ct WHERE ct.`uid` = $userid");
            } else {
                $archives_count = $dsql->SetQuery("SELECT count(*) as total FROM (SELECT count(d.`id`) FROM `#@__circle_dynamic_all` AS d LEFT JOIN `#@__circle_topic` t ON d.`topicid` = t.`id`  WHERE d.`userid` = $userid AND t.`id` != '' GROUP BY d.`topicid`) total");
            }

            $totalCount = (int)getCache("circle_topicq", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
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
            $list   = array();
            if ($type == "create") {
                $sql    = $dsql->SetQuery("SELECT `title`,`litpic`,ct.`id` as topicid ,(SELECT COUNT(`id`) FROM `#@__circle_dynamic_all` as cd  WHERE `topicid` = ct.`id`  ) as topicjoin  FROM `#@__circle_topic` AS ct WHERE `uid` = $userid" . $where);
                $result = $dsql->dsqlOper($sql, "results");

            } else {
                $sql    = $dsql->SetQuery("SELECT `title`,`litpic`,t.`id` as topicid, count(d.`id`) as topicjoin  FROM `#@__circle_dynamic_all` AS d LEFT JOIN `#@__circle_topic` t ON d.`topicid` = t.`id`  WHERE d.`userid` = $userid AND t.`id` != '' GROUP BY `topicid`" . $where);
                $result = $dsql->dsqlOper($sql, "results");
            }

            foreach ($result as $k => $v) {
                $list[$k]['litpic']    = getFilePath($v['litpic']);
                $list[$k]['title']     = $v['title'];
                $list[$k]['topicid']   = $v['topicid'];
                $list[$k]['topicjoin'] = $v['topicjoin'];
                $paramurl              = array(
                    "service"  => "circle",
                    "template" => "topic_detail",
                    "id"       => $v['topicid']
                );
                $list[$k]['url']       = getUrlPath($paramurl);
            }

            return array("pageInfo" => $pageinfo, "list" => $list);
        }

    }

    /**
     * 话题详细
     * @return array
     */
    public function detail()
    {
        global $dsql;
        global $userLogin;
        $articleDetail = array();
        $id            = $this->param;
        $id = is_array($this->param) ? $id['id'] : $id;
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //判断是否管理员已经登录
        //功能点：管理员和信息的发布者可以查看所有状态的信息
        $where = "";
        // if($userLogin->getUserID() == -1){

        // 	$where = " AND `arcrank` = 1 AND `del` = 0";

        // 	//如果没有登录再验证会员是否已经登录
        // 	if($userLogin->getMemberID() == -1){
        // 		$where = " AND `arcrank` = 1 AND `del` = 0";
        // 	}else{
        // 		$where = " AND (`arcrank` = 1 AND `del` = 0 OR `admin` = ".$userLogin->getMemberID().")";
        // 	}

        // }
        $userid   = $userLogin->getMemberID();
        $archives = $dsql->SetQuery("SELECT ct.* ,count(d.`topicid`) as topicidnum FROM `#@__circle_topic` as ct  LEFT JOIN `#@__circle_dynamic_all` as d on ct.`id` = d.`topicid` WHERE ct.`id` = " . $id . $where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            global $cfg_clihost;
            $articleDetail["title"]      = $results[0]['title'];
            $articleDetail["id"]         = $results[0]['id'];
            $articleDetail["note"]       = nl2br($results[0]['note']);
            $articleDetail["browse"]     = $results[0]['browse'];
            $articleDetail["topicidnum"] = $results[0]['topicidnum'];
            // $articleDetail["litpic"]         = !empty($results[0]['litpic']) ? getFilePath($results[0]['litpic']) : "";
            $articleDetail["banner"] = $results[0]['banner'];
            $articleDetail["litpic"] = getFilePath($results[0]['litpic']);
            global $data;
            $data = "";
            // $typeArr = getParentArr("imagetype", $results[0]['typeid']);
            // $typeArr = array_reverse(parent_foreach($typeArr, "typename"));
            // $articleDetail['typeName']    = $typeArr;
            //参与
            $canyu                     = $dsql->SetQuery("SELECT `userid` FROM `#@__circle_dynamic` where  `topicid`  = $id GROUP By `userid` ");
            $canyures                  = $dsql->dsqlOper($canyu, "totalCount");
            $articleDetail["canyures"] = $canyures;
            $param                     = array(
                "service"  => "image",
                "template" => "list",
                "typeid"   => $results[0]['typeid']
            );
            $articleDetail['typeUrl']  = getUrlPath($param);
            //最新动态
            $newsql                    = $dsql->SetQuery("SELECT m.`nickname`,m.`photo`,m.`level`,`userid`,d.`addtime` FROM `#@__circle_dynamic_all` as d LEFT JOIN `#@__member` as m  on  m.`id` = d.`userid` WHERE d.`topicid` = $id order by d.`addtime` desc  LIMIT 1");
            $new                       = $dsql->dsqlOper($newsql, "results");
            $articleDetail["nickname"] = $new[0]['nickname'];
            $articleDetail["photo"]    = getFilePath($new[0]['photo']);
            $articleDetail["addtime"]  = floor((GetMkTime(time()) - $new[0]['addtime'] / 86400) % 30) > 30 ? date("Y-m-d", $new[0]['addtime']) : FloorTime(GetMkTime(time()) - $new[0]['addtime']);

            //会员等级
            $levelsql  = $dsql->SetQuery("SELECT `id`,`name`,`icon` FROM `#@__member_level`");
            $levelre   = $dsql->dsqlOper($levelsql, "results");
            $levelarr  = array_column($levelre, 'name', 'id');
            $levelarr_ = array_column($levelre, 'icon', 'id');

            $articleDetail["level"]     = $new[0]['level'];
            $articleDetail['levelname'] = $levelarr[$new[0]['level']] ? $levelarr[$new[0]['level']] : "普通会员";
            $articleDetail['levelicon'] = getFilePath($levelarr_[$new[0]['level']]);


            //话题发起者
            $huatisql    = $dsql->SetQuery("SELECT m.`nickname` , m.`photo` ,t.`uid` FROM `#@__circle_topic` t LEFT  JOIN `#@__member` m on t.`uid` = m.`id` WHERE t.`id` = $id");
            $huatiresult = $dsql->dsqlOper($huatisql, "results");

            //当前登录关注的人
            $followsql = $dsql->SetQuery("SELECT `fid` FROM `#@__member_follow` WHERE `tid` = $userid AND `tid` != -1");
            $follow    = $dsql->dsqlOper($followsql, "results");
            $followarr = array_column($follow, 'fid');
            $nitiator  = $huatiresult[0];
            if (in_array($nitiator['uid'], $followarr)) {
                $nitiator['isfollow'] = "1";
            } else {
                $nitiator['isfollow'] = "0";
            }


            $articleDetail['nitiator'] = $nitiator;
            //话题活跃
            //查询话题下所有动态
            $active    = $dsql->SetQuery("SELECT m.`nickname`,m.`photo`,m.`level`,count( f.`id` ) AS activecoun ,f.`tid`,m.`id` uid FROM `#@__public_up_all` AS f LEFT JOIN `#@__circle_dynamic_all` AS d ON d.`id` = f.`tid` LEFT JOIN	`#@__member` as m ON m.`id` = f.`uid` WHERE d.`topicid` = $id AND f.`module` = 'circle' GROUP BY f.`uid` ORDER BY activecoun DESC LIMIT 0,10");
            $activeres = $dsql->dsqlOper($active, "results");

            //评论统计
            foreach ($activeres as $k => &$v) {
                $plsql        = $dsql->SetQuery("SELECT count(`id`) plcount FROM `#@__public_comment_all` WHERE `ischeck` = 1 AND `type` = 'circle-dynamic' AND `aid` = '" . $v['tid'] . "' AND `pid` = 0");
                $plcout       = $dsql->dsqlOper($plsql, "results");
                $v['plcount'] = $plcout[0]['plcount'];
                if (in_array($v['uid'], $followarr)) {
                    $v['isfollow'] = "1";
                } else {
                    $v['isfollow'] = "0";
                }

                $v['photo'] = getFilePath($v['photo']);
            }
            $articleDetail['activeres'] = $activeres;
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

        $sql = $dsql->SetQuery("select `id` from `#@__imagelist` where `id` = (select max(`id`) from `#@__imagelist` where `id` < $id)");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            $this->param = $ret[0]['id'];
            $data        = $this->detail();
            return $data;
        }

    }


    public function followMember()
    {
        global $dsql;
        global $langData;
        global $userLogin;
        $id = $this->param['id'];


        $userid = $userLogin->getMemberID();

        if ($userid == -1 || !$userid) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);//登录超时，请重新登录！
        }

        if ($id == $userid) {
            if ($userid == $id) return array("state" => 200, "info" => $langData['siteConfig'][33][36]);//不能关注自己
        }

        // $showsql = $dsql->SetQuery("SHOW TABLES LIKE   '%#@__circle_follow_all%'");
        // $showres = $dsql->dsqlOper($showsql,"results");
        // if ($showres) {
        //     $followtable = '#@__circle_follow_all';
        // }else{
        //     $followtable = '#@__circle_follow';
        // }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = '$userid' AND `fid` = '$id' ");
        $return   = $dsql->dsqlOper($archives, "totalCount");

        $time = time();
        if ($return == 0) {
            //关注分表
            $sub               = new SubTable('circle_follow', '#@__circle_follow');
            $insert_table_name = $sub->getLastTable();

            $archives = $dsql->SetQuery("INSERT INTO `" . $insert_table_name . "` (`fid`, `tid`, `date`) VALUES ('$id', '$userid', '$time')");
            $followid = $dsql->dsqlOper($archives, "lastid");

            $sql                 = $dsql->SetQuery("SELECT COUNT(*) total FROM $insert_table_name");
            $res                 = $dsql->dsqlOper($sql, "results");
            $breakup_table_count = $res[0]['total'];
            if ($breakup_table_count >= $sub->MAX_SUBTABLE_COUNT) {
                $new_table = $sub->createSubTable($followid); //创建分表并保存记录
            }
        } else {
            $archives = $dsql->SetQuery("DELETE FROM `#@__member_follow` WHERE `tid` = '$userid' AND `fid` = '$id'");
            $dsql->dsqlOper($archives, "update");
        }
        return "ok";


    }

    /**
     * 榜单
     * @return array
     */

    public function ranking()
    {
        global $dsql;
        global $langData;

        $param = $this->param;

        $pageSize = (int)$param['pageSize'];
        $pageSize = $pageSize ? $pageSize : 10;

        if (!empty($param)) {
            $type  = $param['type'];
            $limit = " LIMIT 0," . $pageSize;
            if ($type == "topic") {
                $sql     = $dsql->SetQuery("SELECT count(t.`id`) topic ,t.`title`,t.`id`, t.`rec` FROM `#@__circle_topic` t LEFT JOIN `#@__circle_dynamic_all` d ON t.`id` = d.`topicid` GROUP BY d.`topicid` ORDER BY topic  DESC" . $limit);
                $results = $dsql->dsqlOper($sql, "results");
                if($results){
                    foreach ($results as $k => &$v) {
                        $param    = array(
                            "service"  => "circle",
                            "template" => "topic_detail",
                            "id"       => $v['id']
                        );
                        $v['url'] = getUrlPath($param);
                    }
                }
            } elseif ($type == "huoyue") {
                $sql     = $dsql->SetQuery("SELECT count(d.`id`) countnum ,d.`userid`,m.`nickname`,m.`photo` FROM `#@__circle_dynamic_all` d LEFT JOIN `#@__member`m ON d.`userid` = m.`id` GROUP BY d.`userid` order by countnum desc" . $limit);
                $results = $dsql->dsqlOper($sql, "results");
                if($results){
                    foreach ($results as $k => &$v) {
                        $v['photo'] = getFilePath($v['photo']);
                    }
                }
            } elseif ($type == "dianzan" || $type == "") {
                $sql     = $dsql->SetQuery("SELECT count(f.`id`) countnum ,f.`uid`,m.`nickname`,m.`photo` FROM `#@__public_up_all` f LEFT JOIN `#@__member`m ON f.`uid` = m.`id` WHERE `module` = 'circle' GROUP BY f.`uid` order by countnum desc" . $limit);
                $results = $dsql->dsqlOper($sql, "results");
                if($results){
                    foreach ($results as $k => &$v) {
                        $v['photo'] = getFilePath($v['photo']);
                    }
                }
            }

            return array("list" => $results);
        }

    }

    /**
     * 动态详情
     * @return array
     */
    public function blogdetail()
    {
        global $dsql;
        global $langData;
        global $customhot;
        global $userLogin;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $sub         = new SubTable('circle_dynamic', '#@__circle_dynamic');
        $break_table = $sub->getSubTableById($id);

        $sql    = $dsql->SetQuery("SELECT d.*,m.`nickname`,m.`photo`,m.`level` FROM `" . $break_table . "` d  LEFT JOIN `#@__member` m ON d.`userid` = m.`id` WHERE d.`id` = $id");
        $result = $dsql->dsqlOper($sql, "results");
        $list   = $result[0];
        if ($list) {
            //获取用户经纬度
            $userid           = $userLogin->getMemberID();
            $addrsql          = $dsql->SetQuery("SELECT `lng`,`lat` FROM `#@__member` WHERE `id` = $userid");
            $addrres          = $dsql->dsqlOper($addrsql, "results");
            $lng              = (float)$addrres[0]['lng'];
            $lat              = (float)$addrres[0]['lat'];
            $list['distance'] = '';

            $list['content'] = str_replace(array("\r\n", "\n", "\r"), '<br />', $list['content']);

            //会员等级
            $levelsql  = $dsql->SetQuery("SELECT `id`,`name`,`icon` FROM `#@__member_level`");
            $levelre   = $dsql->dsqlOper($levelsql, "results");
            $levelarr  = array_column($levelre, 'name', 'id');
            $levelarr_ = array_column($levelre, 'icon', 'id');

            $list['levelname'] = $levelarr[$list['level']] ? $levelarr[$list['level']] : "普通会员";
            $list['levelicon'] = getFilePath($levelarr_[$list['level']]);

            //计算距离
            if ($lng && $lat && $list['lng'] && $list['lat']) {
                $distance = ROUND(6378.138 * 2 * ASIN(SQRT(POW(SIN(($lat * PI() / 180 - $list['lat'] * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS($list['lat'] * PI() / 180) * POW(SIN(($lng * PI() / 180 - $list['lng'] * PI() / 180) / 2), 2))) * 1000);
                if ($distance <= 5000) {
                    $list['distance'] = $distance > 1000 ? sprintf("%.1f", $distance / 1000) . $langData['siteConfig'][13][23] : $distance . $langData['siteConfig'][13][22];
                }
            }

            $list ['addtime'] = floor((GetMkTime(time()) - $list['addtime'] / 86400) % 30) > 30 ? date("Y-m-d", $list['addtime']) : FloorTime(GetMkTime(time()) - $list['addtime']);
            $picarr           = array();
            $piclist          = explode(',', $list['picadr']);
            if (isset($piclist[0]) && $piclist[0]) {
                foreach (explode(',', $list['picadr']) as $k => $v) {
                    $picarr[$k] = getFilePath($v);
                }
            }
            $list['picadr']    = $picarr;
            $list['videoadr']  = getFilePath($list['videoadr']);
            $list['thumbnail'] = $list['thumbnail'] ? getFilePath($list['thumbnail']) : $picarr[0];
            $list['commodity'] = json_decode($list['commodity'], true);
            $list['photo']     = getFilePath($list['photo']);

            $list['iphome']    = getIPHome($list['ipaddr']);

            $topicarr          = array(
                "service"  => "circle",
                "template" => "topic_detail",
                "id"       => $list['topicid']
            );
            $list['topicurl']  = getUrlPath($topicarr);
            $sql               = $dsql->SetQuery("SELECT f.`ruid`,m.`nickname`,m.`photo` FROM `#@__public_up_all` f LEFT JOIN `#@__member` m ON m.`id` = f.`ruid` WHERE `tid` = $id AND `module` = 'circle' AND `type` = 0 LIMIT 0,8");
            $zanres            = $dsql->dsqlOper($sql, "results");
            $zanList           = array();
            if ($zanres) {
                foreach ($zanres as $k => $v) {
                    array_push($zanList, array(
                        'uid'      => $v['ruid'],
                        'nickname' => $v['nickname'],
                        'photo'    => getFilePath($v['photo'])
                    ));
                }
            }
            $list['is_zan'] = "0";
            $plsql          = $dsql->SetQuery("SELECT count(`id`) reply FROM `#@__public_comment_all` WHERE `aid` = $id AND `ischeck` = 1 AND `type` = 'circle-dynamic'");
            $replyre        = $dsql->dsqlOper($plsql, "results");

            $list['reply'] = $replyre[0]['reply'];
            if ($zanList) {
                foreach ($zanList as $k => $v) {
                    if ($userid == $v['uid']) {
                        $list['is_zan'] = '1';
                    }
                }
            }
            $list['zanlist'] = $zanList;
            //获取打赏信息
            $resql     = $dsql->SetQuery("SELECT r.`uid`,m.`nickname`,m.`photo`,r.`amount` FROM `#@__member_reward` r LEFT JOIN `#@__member` m ON m.`id` = r.`uid` WHERE r.`aid` = $id AND r.`state` = 1 AND r.`module` = 'circle' ");
            $rewardres = $dsql->dsqlOper($resql, "results");
            foreach ($rewardres as $k => &$v) {
                $rewardres[$k]['photo'] = getFilePath($v['photo']);
            }

            $list['reward']     = $rewardres;
            $list['rewardjson'] = json_encode($rewardres);

            //判断是否关注
            $followsql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $userid AND `tid` != -1 AND `fid` = " . $list['userid']);
            $follores  = $dsql->dsqlOper($followsql, "results");

            if ($follores) {
                $list['isfollow'] = 1;//关注
            } elseif ($userid == $val['ruid']) {
                $list['isfollow'] = 2;//自己
            } else {
                $list['isfollow'] = 0;//未关注
            }
            return $list;
        }


    }

    public function deldetail()
    {
        global $dsql;
        global $userLogin;
        $param    = $this->param;
        $id       = $param['id'];
        $archives = $dsql->SetQuery("SELECT * FROM `#@__circle_dynamic_all` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");

        //删除内容图片
        delPicFile($results[0]['picadr'], "delAtlas", "circle");
        //删除视频
        delPicFile($results[0]['videoadr'], "delVideo", "circle");

        //动态表
        $dysql = $dsql->SetQuery("DELETE  FROM `#@__circle_dynamic_all` WHERE `id` = " . $id);
        $dyres = $dsql->dsqlOper($dysql, "update");
        //点赞表
        $fasql = $dsql->SetQuery("DELETE  FROM `#@__public_up_all` WHERE `module` = 'circle' AND `tid` = " . $id);
        $fares = $dsql->dsqlOper($fasql, "update");
        //评论表
        $pcsql = $dsql->SetQuery("DELETE  FROM `#@__public_comment_all` WHERE `type` = 'circle-dynamic' AND `aid` = " . $id);
        $pcres = $dsql->dsqlOper($pcsql, "update");
        if ($dyres && $fares && $pcres) {

            // 清除缓存
            checkCache("circle_list", $id);
            clearCache("circle_detail", $id);
            clearCache("circle_total", "key");
            dataAsync("ciecle",$id);

            return "ok";
        }
    }

    /**
     * 附近人
     * @return array
     */

    public function nearbypeople()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $param      = $this->param;
        $pageSize   = empty($param['pageSize']) ? 10 : $param['pageSize'];
        $page       = empty($param['page']) ? 1 : $param['page'];
        $totalCount = 0;
        $sex        = $param['sex'];
        $lng        = $param['lng'];
        $lat        = $param['lat'];
        $orderby    = $param['orderby'];

        $where = $order = "";
        $list  = array();

        $loginUid = $userLogin->getMemberID();

        $cityid = getCityId($param['cityid']);
        // if($cityid){
        // 	$where .= " AND `cityid` = ".$cityid;
        // }
        if ($sex == '1' || $sex == '0') {
            $where .= " AND `sex` = " . $sex;
        }

        $where .= " AND `lng` != '' AND `lat` != ''";

        $juli = "";
        if ($lng && $lat) {
            $juli = ", ROUND(
			        6378.138 * 2 * ASIN(
			            SQRT(POW(SIN(($lat * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - `lng` * PI() / 180) / 2), 2))
			        ) * 1000
			    ) AS juli";

            $where .= " AND ROUND(
			        6378.138 * 2 * ASIN(
			            SQRT(POW(SIN(($lat * PI() / 180 - `lat` * PI() / 180) / 2), 2) + COS($lat * PI() / 180) * COS(`lat` * PI() / 180) * POW(SIN(($lng * PI() / 180 - `lng` * PI() / 180) / 2), 2))
			        ) * 1000
			    ) < 10000";
        }

        $order = " ORDER BY  `id` DESC";
        if($juli){
            $order = " ORDER BY  juli ASC";
        }
        if ($orderby == "time") {
            $order = " ORDER BY `pubdate` DESC";
        }

        $cousql     = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__member` WHERE `state` = 1" . $where);
        $res        = $dsql->dsqlOper($cousql, "results");
        $totalCount = $res[0]['total'];

        if ($totalCount == 0) return array("state" => 200, "info" => "暂无数据");

        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        $archives    = $dsql->SetQuery("SELECT `id`,`nickname`,`photo`" . $juli . " FROM `#@__member` WHERE `state` = 1" . $where);
        $atpage      = $pageSize * ($page - 1);
        $where_limit = " LIMIT $atpage, $pageSize";
        $sql         = $dsql->SetQuery($archives . $order . $where_limit);
        // $results = $dsql->dsqlOper($dsql->SetQuery($archives.$order.$where_limit), "results");

        $results = getCache("circle_nearby_list", $sql, 3600);

        if ($results) {
            // $typeList = $this->selfmedia_type(true);

            foreach ($results as $key => $value) {
                $list[$key]['id']       = $value['id'];
                $list[$key]['juli']     = $value['juli'] ? ($value['juli'] > 1000 ? sprintf("%.1f", $value['juli'] / 1000) . $langData['siteConfig'][13][23] : $value['juli'] . $langData['siteConfig'][13][22]) : '';
                $list[$key]['nickname'] = $value['nickname'];
                $list[$key]['photo']    = $value['photo'] ? getFilePath($value['photo']) : "";


                // 统计粉丝
                $sql = $dsql->SetQuery("SELECT COUNT(`id`) c FROM `#@__member_follow` WHERE `tid` != -1 AND `fid` = " . $value['id']);

                $list[$key]['total_fans'] = getCache("circle_media_fans", $sql, 3600, array("sign" => $value['id'], "name" => "c"));


                // $list[$key]['url'] = getUrlPath(array("service" => "article", "template" => "mddetail", "id" => $value['id']));
                //最新动态
                $dtsql                 = $dsql->SetQuery("SELECT `content`,`addtime` FROM `#@__circle_dynamic_all` WHERE `userid` = " . $value['id'] . " ORDER BY `addtime` desc limit 1");
                $results               = $dsql->dsqlOper($dtsql, "results");
                $list[$key]['content'] = $results[0]['content'];
                // $list[$key]['addtime'] = date('Y-m-d',$results[0]['addtime']);
                $list[$key]['addtime'] = $results[0]['addtime'];


                //是否相互关注
                if ($loginUid > -1) {
                    if ($loginUid == $value['userid']) {
                        $list[$key]['isfollow'] = 2;//自己
                    } else {
                        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_follow` WHERE `tid` = $loginUid AND `tid` != -1 AND `fid` = " . $value['id']);
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $list[$key]['isfollow'] = 1;//关注
                        } else {
                            $list[$key]['isfollow'] = 0;//未关注
                        }
                    }
                } else {
                    $list[$key]['isfollow'] = 0;//未关注
                }
            }
        }
        // echo "<pre>";
        // var_dump($list);die;
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * 验证文章状态是否可以打赏
     * @return array
     */
    public function checkRewardState()
    {
        global $dsql;
        global $userLogin;

        $aid = $this->param['aid'];

        if (!is_numeric($aid)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 100, "info" => 'true');
        }

        $sub         = new SubTable('circle_dynamic', '#@__circle_dynamic');
        $break_table = $sub->getSubTableById($aid);
        $archives    = $dsql->SetQuery("SELECT `userid` FROM `" . $break_table . "` WHERE `id` = " . $aid);
        $results     = $dsql->dsqlOper($archives, "results");
        if ($results) {
            if ($results[0]['userid'] == $uid) {
                return array("state" => 200, "info" => '自己不可以给自己打赏！');
            } else {
                return array("state" => 100, "info" => 'true');
            }
        } else {
            return array("state" => 200, "info" => '信息不存在，或已经删除，不可以打赏，请确认后重试！');
        }

    }


    /**
     * 打赏
     * @return array
     */
    public function reward()
    {
        global $dsql;
        global $userLogin;

        $param    = $this->param;
        $aid      = $param['aid'];      //信息ID
        $amount   = $param['amount'];   //打赏金额
        $paytype  = $param['paytype'];  //支付方式
        $videotype= (int)$param['app'];  //支付方式
        $uid      = $userLogin->getMemberID();  //当前登录用户
        $isMobile = isMobile();

        //信息url
        $param = array(
            "service"  => "circle",
            "template" => "blog_detail",
            "id"       => $aid
        );
        $url   = getUrlPath($param);

        //验证金额
        if ($amount <= 0 || !is_numeric($aid)) {
            header("location:" . $url);
            die;
        }
        //查询信息发布人
        $sub         = new SubTable('circle_dynamic', '#@__circle_dynamic');
        $break_table = $sub->getSubTableById($aid);
        $sql         = $dsql->SetQuery("SELECT `userid` FROM `" . $break_table . "` WHERE `id` = " . $aid);
        $ret         = $dsql->dsqlOper($sql, "results");
        if (!$ret) {
            //信息不存在
            header("location:" . $url);
            die;
        }
        $admin = $ret[0]['userid'];

        //自己不可以给自己打赏
        if ($admin == $uid) {
            //信息不存在
            header("location:" . $url);
            die;
        }

        /*查询有无生成订单*/

        $selectsql = $dsql->SetQuery("SELECT `ordernum`,`date` FROM `#@__member_reward` WHERE `module` = 'circle' AND `amount` = '$amount' AND `uid` = '$uid' AND `touid` = '$admin' AND `aid` = '$aid' AND `state` = 0 AND `date` > " . (GetMkTime(time()) - 3600));

        $selectres = $dsql->dsqlOper($selectsql, "results");

        $ordernum = $selectres[0]['ordernum'];

        $timeout = $selectres[0]['date'] + 3600;

        if (empty($selectres)) {
            //订单号
            $ordernum = create_ordernum();

            //查询城市ID
            $sql2 = $dsql->SetQuery("select `cityid` from `#@__member` where `id` = '$admin'");
            $ret2 = $dsql->dsqlOper($sql2, "results");
            $cityid         =  $ret2[0]['cityid'];
            if(empty($cityid)){
                $cityid = 0;
            }

            $archives = $dsql->SetQuery("INSERT INTO `#@__member_reward` (`ordernum`, `module`, `uid`, `touid`, `aid`, `amount`, `state`, `date`,`cityid`) VALUES ('$ordernum', 'circle', '$uid', '$admin', '$aid', '$amount', 0, " . GetMkTime(time()) . ",'$cityid')");
            $return   = $dsql->dsqlOper($archives, "update");
            if ($return != "ok") {
                die("提交失败，请稍候重试！");
            }

            $timeout = GetMkTime(time()) + 3600;


            // 删除一小时未付款的打赏记录
            $time = time() - 3600;
            $sql = $dsql->SetQuery("DELETE FROM `#@__member_reward` WHERE `state` = 0 AND `date` < $time");
            $dsql->dsqlOper($sql, "update");
        }
        if($videotype == 1){
            $param = array(
                "service" => "circle",
                "template" => "pay",
                "param" => "ordernum=".$ordernum."&videotype=1"
            );
            header("location:".getUrlPath($param));
            die;
        }
        //跳转至第三方支付页面
        $order = createPayForm("circle", $ordernum, $amount, $paytype, "打赏圈子动态", array(), 1);

        $order['timeout'] = 0;

        return $order;

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
        global $siteCityInfo;

        $param = $this->param;
        if (!empty($param)) {
            global $dsql;
            global $userLogin;

            $paytype  = $param['paytype'];
            $ordernum = $param['ordernum'];
            $date     = GetMkTime(time());

            //查询订单信息
            $sql = $dsql->SetQuery("SELECT * FROM `#@__member_reward` WHERE `ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {

                $rid    = $ret[0]['id'];
                $uid    = $ret[0]['uid'];
                $to     = $ret[0]['touid'];
                $aid    = $ret[0]['aid'];
                $amount = $ret[0]['amount'];

                //文章信息
                $circletitle = "圈子动态";

                $circletitlesql = $dsql->SetQuery("SELECT `content`,`id` FROM `#@__circle_dynamic_all` WHERE  `id` = '$aid'");
                $circletitleres = $dsql->dsqlOper($circletitlesql, "results");
                if ($circletitleres) {
                    $circletitle = '#'.$circletitleres[0]['id']. $circletitleres[0]['content'];
                }

                $title_ = '<a href="' . $cfg_secureAccess . $cfg_basehost . '/index.php?service=circle&template=blog_detail&id=' . $aid . '" target="_blank">' . $circletitle . '</a>';

                //如果是会员打赏，保存操作日志
                if ($uid != -1) {
                    $sql          = $dsql->SetQuery("SELECT `id`,`amount`,`paytype` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum' AND `state` = 1");
                    $ret          = $dsql->dsqlOper($sql, "results");
                    $pid          = '';
                    $truepayprice = 0;
                    if ($ret) {
                        $pid          = $ret[0]['id'];
                        $truepayprice = $ret[0]['amount'];
                        $paytype      = $ret[0]['paytype'];
                    }
                    $userbalance = 0;
                    if ($paytype == 'money') {
                        $userbalance = $truepayprice;
                    } else {
                        /*混合支付*/
                        $userbalance = $amount - $truepayprice;
                    }
                    if (!empty($userbalance) && $userbalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$userbalance' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");
                    //会员通知
                    $param = array(
                        "service"  => "circle",
                        "template" => "blog_detail",
                        "id"       => $aid
                    );

                    $tousernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '$to'");
                    $tousernameres = $dsql->dsqlOper($tousernamesql, 'results');
                    $tousername    = '未知';
                    if ($tousernameres) {
                        $tousername = $tousernameres[0]['nickname'] != '' ? $tousernameres[0]['nickname'] : $tousernameres[0]['username'];
                    }
                    $user      = $userLogin->getMemberInfo($uid, 1);
                    $usermoney = $user['money'];
//                    $money   =  sprintf('%.2f',($usermoney-$amount));
                    $title    = "打赏-赠与" . $tousername;
                    $urlParam = serialize($param);
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`ordernum`,`title`,`balance`) VALUES ('$uid', '0', '$amount', '圈子动态打赏：$circletitle', '$date','circle','dashang','$pid','$urlParam','$ordernum','$title','$usermoney')");
                    $dsql->dsqlOper($archives, "update");
                    }

                    //记录用户行为日志
                    memberLog($uid, 'circle', 'reward', $aid, 'insert', '打赏信息('.$circletitle.' => '.$amount.'元)', '', $archives);

                }

                //获取会员名s
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname`,`addr` FROM `#@__member` WHERE `id` = $to");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    $addr     = $ret[0]['addr'];

                }

                //扣除佣金
                global $cfg_rewardFee;
                global $cfg_fzrewardFee;
                $fee = $amount * $cfg_rewardFee / 100;
                $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
                $fee = $fee < 0.01 ? 0 : $fee;

                //作者收入
                $amount_ = sprintf('%.2f', $amount - $fee);

                //分销信息
                global $cfg_fenxiaoState;
                global $cfg_fenxiaoSource;
                global $cfg_fenxiaoDeposit;
                global $cfg_fenxiaoAmount;
                include HUONIAOINC . "/config/circle.inc.php";
                $fenXiao = (int)$customfenXiao;

                //分销金额
                $_fenxiaoAmount = $amount;
                if ($cfg_fenxiaoState && $fenXiao  && $amount_>0.01) {

                    //商家承担
                    if ($cfg_fenxiaoSource) {
                        $_fenxiaoAmount = $amount_;
                        $amount_        = $amount_ - ($amount_ * $cfg_fenxiaoAmount / 100);

                        //平台承担
                    } else {
                        $_fenxiaoAmount = $fee;
                    }
                }

                $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
                $userr    = $userLogin->getMemberInfo($to, 1);
                $cityid   = $userr['cityid'];
                $paramarr['ordernum'] = $ordernum;
                $paramarr['title']    = $title_;
                $paramarr['amount']   = $_fenxiaoAmount;
                if ($fenXiao == 1 && $uid != -1) {
                    $_fx_title = '文章打赏' . ($title_ ? "：" . $title_ : '');
                    (new member())->returnFxMoney("circle", $uid, $ordernum, $paramarr);
                    //查询一共分销了多少佣金
                    $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'circle'");
                    $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                    if($cfg_fenxiaoSource){
                        $fx_less = ($_fenxiaoAmount - $amount_)  - $fenxiaomonyeres[0]['allfenxiao'];
                        if(!$cfg_fenxiaoDeposit){
                            $amount_     += $fx_less; //没沉淀，还给商家
                        }else{
                            $precipitateMoney = $fx_less;
                            if($precipitateMoney > 0){
                                (new member())->recodePrecipitationMoney($to,$ordernum,$_fx_title,$precipitateMoney,$cityid,"circle");
                            }
                        }
                    }
                }
                $amount_        = $amount_ < 0.01 ? 0 : $amount_;
                $amount_ = sprintf('%.2f', $amount_);

                //更新订单状态
				$sql = $dsql->SetQuery("UPDATE `#@__member_reward` SET `state` = 1, `amount` = '$amount_' WHERE `id` = ".$rid);
				$dsql->dsqlOper($sql, "update");

                //将费用打给文章作者
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount_' WHERE `id` = '$to'");
                $dsql->dsqlOper($archives, "update");

//                $cityid = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addr, 'split' => '/', 'type' => 'typename', 'action' => 'addr','returntype' => '1'));

                $cityName = getSiteCityName($cityid);
                //分站佣金
                $fzFee = cityCommission($cityid, 'reward');
                //将费用打给分站
                $fztotalAmount_ = $fee * (float)$fzFee / 100;
                $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;
                $fee -= $fztotalAmount_;//总站金额-=分站金额

                $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                $dsql->dsqlOper($fzarchives, "update");

                //分佣 开关
                global $transaction_id;
                $transaction_id       = $param['transaction_id'];  //第三方平台支付订单号


                $tousernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '$uid'");
                $tousernameres = $dsql->dsqlOper($tousernamesql, 'results');
                $tousername    = '未知';
                if ($tousernameres) {
                    $tousername = $tousernameres[0]['nickname'] != '' ? $tousernameres[0]['nickname'] : $tousernameres[0]['username'];
                }
                $title     = "打赏-来自" . $tousername;
                $user      = $userLogin->getMemberInfo($to, 1);
                $usermoney = $user['money'];
//                $money  = sprintf('%.2f',($usermoney+$amount_));
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`platform`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`balance`) VALUES ('$to', '1', '$amount_', '圈子打赏：$circletitle', '$date','$cityid','$fztotalAmount_',$fee,'circle','dashang','$urlParam','$ordernum','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                $archives1 = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`) VALUES ('$to', '1', '$amount_', '圈子打赏（分站佣金）：$circletitle', '$date','$cityid','$fztotalAmount_','circle',$fee,'1','dashang')");
//                $dsql->dsqlOper($archives1, "update");
                $lastid = $dsql->dsqlOper($archives1, "lastid");
                substationAmount($lastid, $cityid);

                //工行E商通银行分账
                if ($truepayprice <= 0) {
                    $truepayprice = $amount_;
                }
                rfbpShareAllocation(array(
                    "uid"               => $to,
                    "ordertitle"        => "圈子打赏",
                    "ordernum"          => $ordernum,
                    "orderdata"         => array('圈子标题' => $title_),
                    "totalAmount"       => $amount,
                    "amount"            => $truepayprice,
                    "channelPayOrderNo" => $transaction_id,
                    "paytype"           => $paytype
                ));

                //会员通知
                $param = array(
                    "service"  => "circle",
                    "template" => "blog_detail",
                    "id"       => $aid
                );


                //自定义配置
                $config = array(
                    "username" => $username,
                    "title"    => $title,
                    "amount"   => $amount,
                    "date"     => date("Y-m-d H:i:s", $date),
                    "fields"   => array(
                        'keyword1' => '打赏目标',
                        'keyword2' => '打赏金额',
                        'keyword3' => '时间'
                    )
                );

                updateMemberNotice($to, "会员-打赏通知", $param, $config);

            }

        }
    }


    /**
     * 支付
     * @return [type] [description]
     */
    public function pay()
    {
        global $dsql;
        global $userLogin;

        $param          = $this->param;
        $paytype        = $param['paytype'];
        $ordernum       = $param['ordernum'];
        $useBalance     = $param['useBalance'];
        $balance        = $param['balance'];
        $videotype      = (int)$param['videotype'];
        $paypwd         = $this->param['paypwd'];      //支付密码
        $payTotalAmount = $this->checkPayAmount();
        $userid         = $userLogin->getMemberID();

        if ($ordernum && $paytype) {
            $sql = $dsql->SetQuery("SELECT `amount`,`aid` FROM `#@__member_reward` WHERE `ordernum` = '$ordernum' AND `module` = 'circle' AND `state` = 0");
            $res = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $amount = $res[0]['amount'];
                $aid    = $res[0]['aid'];

                if(is_array($payTotalAmount)){
                    return $payTotalAmount;
                }

                if ($payTotalAmount > 0) {
                    //跳转至第三方支付页面
                    return createPayForm("circle", $ordernum, $amount, $paytype, "打赏圈子动态");
                } else {
                    $paytype = 'money';
                    $date    = GetMkTime(time());
                    $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                    $payre   = $dsql->dsqlOper($paysql, "results");
                    if (!empty($payre)) {

                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'circle',  `uid` = $userid, `amount` = '$amount', `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'circle'");
                        $dsql->dsqlOper($archives, "update");

                    } else {

                        $body     = serialize($param);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('circle', '$ordernum', '$userid', '$body', '$amount', '$paytype', 1, $date)");
                        $dsql->dsqlOper($archives, "results");

                    }

                    $this->param = array(
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();
                    $param = array(
                        "service"  => "circle",
                        "template" => "blog_detail",
                        "id"       => $aid
                    );
                    $url   = getUrlPath($param);
                    if($videotype == 1){
                        header("location:" . $url);die;
                    }
                    return $url;


                }
            }
        }
        header("location:/404.html");
        die;

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

        $totalPrice = 0;

        //查询订单信息
        $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__member_reward` WHERE `ordernum` = '$ordernum' AND `module` = 'circle' AND `state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        $res      = $results[0];

        $orderprice = $res['amount'];
        $totalPrice += $orderprice;


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


    public function dianzantj()
    {
        global $dsql;
        global $langData;
        global $customhot;
        $param = $this->param;
        if (!is_array($param)) {
            return array("state" => 200, "info" => '格式错误！');
        }
        $did            = $param['did'];
        $page           = $param['page'];
        $pageSize       = $param['pageSize'];
        $where          = " AND `module` = 'circle' AND `tid` =" . $did;
        $archives_count = $dsql->SetQuery("SELECT count(`id`) total FROM `#@__public_up_all` d WHERE 1 = 1" . $where);
        //总条数

        $pageSize   = empty($pageSize) ? 10 : $pageSize;
        $page       = empty($page) ? 1 : $page;
        $totalCount = (int)getCache("circle_dz_total", $archives_count, 300, array("name" => "total", "savekey" => 1, "disabled" => $u));
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        if ($totalCount == 0) return array("state" => 200, "info" => '暂无数据！');

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );
        $atpage   = $pageSize * ($page - 1);
        $limit    = " LIMIT $atpage, $pageSize";
        $sql      = $dsql->SetQuery("SELECT f.`ruid`,m.`nickname`,m.`photo`,m.`email`,m.`level` FROM `#@__public_up_all` f LEFT JOIN `#@__member` m ON m.`id` = f.`ruid` WHERE `tid` = $did AND f.`module` = 'circle' AND `type` = 0" . $limit);
        $zanres   = $dsql->dsqlOper($sql, "results");
        foreach ($zanres as $k => &$v) {

            $v['photo'] = getFilePath($v['photo']);

        }
        return array("pageInfo" => $pageinfo, "list" => $zanres);
    }

    //动态浏览量
    public function dynamicbrowse()
    {
        global $dsql;

        $param       = $this->param;
        $id          = $param['id'];
        $sub         = new SubTable('circle_dynamic', '#@__circle_dynamic');
        $break_table = $sub->getSubTableById($id);
        $sql         = $dsql->SetQuery("UPDATE `" . $break_table . "` SET `browse` = `browse` + 1 WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

    }

    //推荐话题
    public function tjTopic()
    {
        global $dsql;

        $param    = $this->param;
        $pageSize = (int)$param['pageSize'];
        $pageSize = $pageSize ? $pageSize : 3;

        $list  = array();
        $tjsql = $dsql->SetQuery("SELECT * FROM `#@__circle_topic` WHERE `rec` = 1 Limit 0," . $pageSize);
        $tjres = $dsql->dsqlOper($tjsql, "results");
        foreach ($tjres as $k => $v) {
            $list[$k]['title']  = $v['title'];
            $list[$k]['note']   = $v['note'];
            $list[$k]['browse'] = $v['browse'];
            $param              = array(
                "service"  => "circle",
                "template" => "topic_detail",
                "id"       => $v['id']
            );
            $list[$k]['url']    = getUrlPath($param);
            $list[$k]['litpic'] = getFilePath($v['litpic']);
            $list[$k]['banner'] = getFilePath($v['banner']);
        }

        return $list;

    }

    //热议话题
    public function ryTopic()
    {
        global $dsql;

        $param    = $this->param;
        $pageSize = (int)$param['pageSize'];
        $pageSize = $pageSize ? $pageSize : 7;

        $list  = array();
        $tjsql = $dsql->SetQuery("SELECT ct.*,cd.`topicid`,count(cd.`topicid`) topicnum  FROM `#@__circle_topic`as ct LEFT JOIN `#@__circle_dynamic_all`as cd ON ct.`id` =cd.`topicid` WHERE cd.`topicid`!='' group By `topicid` order by topicnum desc Limit 0," . $pageSize);
        $tjres = $dsql->dsqlOper($tjsql, "results");
        foreach ($tjres as $k => $v) {
            $list[$k]['title']    = $v['title'];
            $list[$k]['note']     = $v['note'];
            $list[$k]['browse']   = $v['browse'];
            $list[$k]['topicnum'] = $v['topicnum'];
            $param                = array(
                "service"  => "circle",
                "template" => "topic_detail",
                "id"       => $v['id']
            );
            $list[$k]['url']      = getUrlPath($param);
            $list[$k]['litpic']   = getFilePath($v['litpic']);
            $list[$k]['banner']   = getFilePath($v['banner']);
        }

        return $list;

    }


}
