<?php if (!defined('HUONIAOINC')) exit('Request Error!');

/**
 * 有奖乐购API接口
 *
 * @version        $Id: awardlegou.class.php 2014-3-23 上午09:25:10 $
 * @package        HuoNiao.Handlers
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
class awardlegou
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
     * Notes: 有奖乐购基本参数
     * Ueser: Administrator
     * DateTime: 2021/1/18 15:29
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function config()
    {

        require(HUONIAOINC . "/config/awardlegou.inc.php");

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
        //  $customChannelDomain = "http://".$customChannelDomain;
        // }elseif($customSubDomain == 1){
        //  $customChannelDomain = "http://".$customChannelDomain.".".$cfg_basehost;
        // }elseif($customSubDomain == 2){
        //  $customChannelDomain = "http://".$cfg_basehost."/".$customChannelDomain;
        // }

        // include HUONIAOINC.'/siteModuleDomain.inc.php';
        $customChannelDomain = getDomainFullUrl('awardlegou', $customSubDomain);

        //分站自定义配置
        $ser = 'awardlegou';
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
     * Notes:
     * Ueser: Administrator
     * DateTime: 2021/1/12 17:35
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function goodList()
    {
        global $dsql;
        global $langData;
        global $userLogin;
        if (!is_array($this->param)) {
            return array("state" => 200, "info" => '格式错误！');
        } else {
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
            $foodtype = $this->param['foodtype'];
            $u        = $this->param['u'];
            $state    = $this->param['state'];
            $page     = $this->param['page'];
            $pageSize = $this->param['pageSize'];
        }
        $where    = $where1 = $where2 = '';
        $list     = array();
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if ($foodtype != '') {
            $where .= " AND `typeid` = '$foodtype'";
        }
        if ($u == 1) {
            $uid      = $userLogin->getMemberID();
            $userinfo = $userLogin->getMemberInfo();

            if (!verifyModuleAuth(array("module" => "awardlegou"))) {
                return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
            }

            if ($userinfo['busiId']) {
                $where .= " AND `sid` = " . $userinfo['busiId'];
            } else {
                $where .= " AND 1 = 2";
            }

            if ($state != "") {
                $where1 .= " AND `state` = " . $state;
            }
        } else {
            $where .= ' AND `state` = 1';
            //数据共享
            require(HUONIAOINC . "/config/awardlegou.inc.php");
            $dataShare = (int)$customDataShare;

            if (!$dataShare) {
                $cityid = getCityId($this->param['cityid']);
                if ($cityid) {
                    $where2 .= " AND `cityid` = " . $cityid;
                }
            }

            if ($u != 1) {
                $archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE 1=1 " . $where2);
                $results  = $dsql->dsqlOper($archives, "results");
                if ($results) {
                    foreach ($results as $key => $value) {
                        $sidArr[$key] = $value['id'];
                    }
                    $where .= " AND `sid` in (" . join(",", $sidArr) . ")";
                } else {
                    $where .= " AND 2 = 3";
                }
            }
        }

        $archives   = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list` WHERE 1=1" . $where . $where1);
        $archives1  = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list` WHERE 1=1" . $where);
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);
        $pageinfo  = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
        );

        if ($u == 1 && $uid > -1) {
            //待审核
            $totalGray = $dsql->dsqlOper($archives1 . " AND `state` = 0", "totalCount");
            //已审核
            $totalAudit = $dsql->dsqlOper($archives1 . " AND `state` = 1", "totalCount");
            //拒绝审核
            $totalRefuse = $dsql->dsqlOper($archives1 . " AND `state` = 2", "totalCount");

            $pageinfo['gray']   = $totalGray;
            $pageinfo['audit']  = $totalAudit;
            $pageinfo['refuse'] = $totalRefuse;
        }
        if ($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());
        $atpage = $pageSize * ($page - 1);
        $where  .= " ORDER BY `id` DESC LIMIT $atpage, $pageSize";

        $results = $dsql->dsqlOper($archives . $where, "results");
        if ($results) {
            foreach ($results as $k => $v) {
                $list[$k]['sid']        = $v['sid'];
                $list[$k]['id']         = $v['id'];
                $list[$k]['typeid']     = $v['typeid'];
                $list[$k]['title']      = $v['title'];
                $list[$k]['pics']       = $v['pics'];
                $list[$k]['litpic']     = $v['litpic'];
                $list[$k]['litpicpath'] = $v['litpic'] != '' ? getFilePath($v['litpic']) : '';
                $list[$k]['price']      = $v['price'];
                $list[$k]['yprice']     = $v['yprice'];
                $list[$k]['usepoint']   = $v['usepoint'];
                $list[$k]['prizetype']  = $v['prizetype'];
                $list[$k]['prize']      = $v['prize'];
                $pizelitpic             = '';
                $prize                  = json_decode($v['prize'], true);
                if ($prize) {
                    $pizelitpic = $prize[0]['litpic'] != '' ? getFilePath($prize[0]['litpic']) : '';
                }
                $list[$k]['pizelitpic'] = $pizelitpic;
                $list[$k]['state']      = $v['state'];
                $list[$k]['pubdate']    = $v['pubdate'];
                $list[$k]['buynum']     = $v['buynum'];

                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `proid` = " . $v['id']);
                $res = $dsql->dsqlOper($sql, "totalCount");

                $list[$k]['joinnuember'] = $res;
                $param                   = array(
                    "service"  => "awardlegou",
                    "template" => "detail",
                    "id"       => $v['id']
                );
                $linkurl                 = getUrlPath($param);
                $list[$k]['linkurl']     = $linkurl;

            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);

    }


    /**
     * Notes: 有奖乐购下单
     * Ueser: Administrator
     * DateTime: 2021/1/13 9:41
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function deal()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        $param = $this->param;

        if (empty($param)) return array("state" => 200, "info" => '商品为空');

        $userid   = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();

        $certifyState = $userinfo['certifyState'];

        //实名开关
		require(HUONIAOINC."/config/awardlegou.inc.php");
		$lgshiming = (int)$customLgShiming;

        if($certifyState != 1 && !$lgshiming) return array("state" => 200, "info" => '请先去实名认证！');

        $noawardlegoutime = $userinfo['noawardlegoutime'];
        $is_noawardlegou  = $userinfo['is_noawardlegou'];

        if($noawardlegoutime > time() || $is_noawardlegou ==1) return array("state" => 200, "info" => '暂时无法下单！');
        if ($userid < 1) return array("state" => 200, "info" => '登录超时，请重新登录后下单！');

        $addrid   = (int)$param['addrid'];
        $proid    = (int)$param['proid'];
        $pinid    = (int)$param['pinid'];
        $ordernum = $param['ordernum'];

        if (!is_numeric($proid)) return array("state" => 200, "info" => '格式错误');
        $from_uid = (int)$param['from_uid'];
        $comment  = $param['comment'];

        if($ordernum == '') {

            $this->param  = $proid;
            $detail       = $this->proDetail();
            $store        = $detail['sid'];
            $usepoint     = $detail['usepoint'];
            $fanxianpoint = $detail['fanxianpoint'];
            $userpoint    = $userinfo['point'];
            $ordernum     = $userinfo['ordernum'];
        }
        if($ordernum !=''){

            $ordernumsql = $dsql->SetQuery("SELECT `id`,`amount`,`orderdate` FROM `#@__awardlegou_order` WHERE `orderstate` = 0 AND `ordernum` = '$ordernum'");

            $ordernumres = $dsql->dsqlOper($ordernumsql,"results");

            if($ordernumres){

                $price   = $ordernumres[0]['amount'];
                $timeout = $ordernumres[0]['orderdate'] + 1800;

                $order   = createPayForm("awardlegou", $ordernum, $price, '', "有奖乐购订单",array(),1);

                $order['timeout'] = $timeout;

                return $order;
            }
        }

        if ($userpoint < $usepoint && $usepoint != 0) return array("state" => 200, "info" => $cfg_pointName.'不足');
        if (!is_array($detail)) return array("state" => 200, "info" => '商品不存在');

        if ($detail['state'] != 1) return array("state" => 200, "info" => '商品待审核,下单失败');

        if ($from_uid != '') {
            if ($from_uid == $userid) return array("state" => 200, "info" => '邀请人不可以是自己!');
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE  `id` = '$pinid' AND `state` = '1'");
            $res = $dsql->dsqlOper($sql, "results");
            if (!$res) {
                return array("state" => 200, "info" => '本次乐购活动参与人数已满，您可以自己发起乐购！');
            }
        }

        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
        $ret = $dsql->dsqlOper($sql, "results");
        if ($ret) {
            if ($detail['sid'] == $ret[0]['id']) {
                return array("state" => 200, "info" => "企业会员不得购买自己店铺的商品！");
            }
        }
        $ordernum = create_ordernum();
        $pubdate  = GetMkTime(time());
        $began    = strtotime(date("Y-m-d") . " 00:00");
        $end      = strtotime(date("Y-m-d") . " 23:59");
        $price    = $detail['price'];
        global $cfg_pointRatio;
        $pointMoney_ = $detail['usepoint'] / $cfg_pointRatio;
        $price       += $pointMoney_;

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


        $pintype = 0;
        /*开团乐购产品*/
        if ($from_uid == '0') {
            $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE `userid` = $userid AND `pubdate` >= $began AND `pubdate` <= $end AND `tid` = " . $proid);
            $ygcount = $dsql->dsqlOper($sql, "totalCount");
            if ($detail['onenumber'] <= $ygcount && $detail['onenumber'] !=0 ) return array("state" => 200, "info" => '超出参与限制');
            /*创建拼团信息*/
            $pintype = 1;
//            $pinsql  = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE (`userid` = '$userid' OR find_in_set(" . $userid . ", `user`))  AND `tid` = '$proid' AND `state` != 3 AND `state` !=0 ");
            $pinsql  = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE (`userid` = '$userid' OR find_in_set(" . $userid . ", `user`))  AND `tid` = '$proid' AND `state` != 3 AND `state` != 2 ");
            $pinres  = $dsql->dsqlOper($pinsql,"results");
            if($pinres)  return array("state" => 200, "info" => '已参与此商品的有奖乐购活动或者已发起！请勿重复参与或者发起');
            $sql     = $dsql->SetQuery("INSERT INTO `#@__awardlegou_pin` (`oid`, `tid`, `userid`, `pubdate`, `state`, `user`) VALUES ('$ordernum','" . $proid . "', '$userid', '$pubdate', '0', '$userid')");
            $pid     = $dsql->dsqlOper($sql, "lastid");
            if (!is_numeric($pid)) {
                return array("state" => 200, "info" => '下单失败');
            }
            $pinid = $pid;
        } else {
            $sql     = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE find_in_set(" . $userid . ", `user`) AND (`state`=1 or `state` = 3)  AND `pubdate` >= $began AND `pubdate` <= $end AND `tid` = " . $proid);
            $ygcount = $dsql->dsqlOper($sql, "totalCount");
            if ($detail['onenumber'] <= $ygcount && $detail['onenumber'] !=0 ) return array("state" => 200, "info" => '超出参与限制');

            $sql = $dsql->SetQuery("SELECT `people`, `state`, `userid`, `enddate`, `user` FROM `#@__awardlegou_pin` WHERE `id` = $pinid AND `state` > 0");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!$ret) {
                return array("state" => 200, "info" => '该乐购产品不存在，正在开新团乐购产品|201');
            } else {
                $ret = $ret[0];
                if ($ret['state'] == 2) {
                    return array("state" => 200, "info" => '该乐购活动已失效，请开新乐购活动');
                } elseif ($ret['userid'] == $userid) {
                    return array("state" => 200, "info" => '您已经是该乐购活动创建人');
                } elseif ($ret['state'] == 3) {
                    return array("state" => 200, "info" => '该乐购活动成员已满');
                }
                // 验证是否已参团
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_pin` WHERE find_in_set(" . $userid . ", `user`) AND `id` = $pinid AND `state` !=2 and `state` != 4");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    return array("state" => 200, "info" => '您已经是该团成员');
                }
            }
        }
        $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `userid` = '$userid' AND  `pinid` = '".$pinid."' AND `pintype` = '".$pintype."' AND `orderstate` = 1");
        $orderres = $dsql->dsqlOper($ordersql,"results");
        if(!$orderres){
            $ordersql1 = $dsql->SetQuery("SELECT `ordernum`,`orderdate` FROM `#@__awardlegou_order` WHERE `userid` = '$userid' AND  `pinid` = '".$pinid."' AND `pintype` = '".$pintype."' AND `orderstate` = 0");
            $orderres1 = $dsql->dsqlOper($ordersql1,"results");
            if(!$orderres1){
                $datetime = GetMkTime(time());

                $timeout  = $datetime + 1800;
                $archives = $dsql->SetQuery("INSERT INTO `#@__awardlegou_order` (`store`,`ordernum`, `userid`, `proid`, `procount`, `amount`,`point`,`orderstate`, `orderdate`, `pinid`, `pintype`, `useraddr`, `username`,`usercontact`,`usernote`,`fromShare`)
                                VALUES ('" . $store . "','$ordernum', '$userid', '$proid', '1', '$price','".(float)$usepoint."', '0', '$datetime', '$pinid', '$pintype','$address','$person','$contact','$comment','$from_uid')");
                $dsql->dsqlOper($archives, "update");

                // 删除有奖乐购过期订单
                $time = time() - 1800;
                /*删除订单*/
                $quanSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_order` WHERE `orderstate` = 0 AND `orderdate` < $time ");
                $dsql->dsqlOper($quanSql, "update");

                /*删除未付款拼团信息*/
                $pinSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_pin` WHERE `state` = 0 AND `pubdate` < $time ");
                $dsql->dsqlOper($pinSql, "update");
            }else{
                $ordernum = $orderres1[0]['ordernum'];
                $timeout  = $orderres1[0]['orderdate'] + 1800;
            }

            $order   = createPayForm("awardlegou", $ordernum, $price, '', "有奖乐购订单",array(),1);

            $order['timeout'] = $timeout;

            return $order;


        }else{
            return array("state" => 200, "info" => '已参与此商品的有奖乐购活动！请勿重复参与');
        }


    }


    /**
     * Notes:  商品详情
     * Ueser: Administrator
     * DateTime: 2021/1/13 9:55
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function proDetail()
    {
        global $dsql;
        global $userLogin;
        global $oper;
        $id = $this->param;
        $id = is_numeric($id) ? $id : $id['id'];
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        $uid        = $userLogin->getMemberID();
        $adminuid   = $userLogin->getUserID();

        $where = ' AND `state` = 1';
        if($adminuid != -1){
            $where = '';
        }
        if ($oper == "user") {
            $userid   = $userLogin->getMemberID();
            $userinfo = $userLogin->getMemberInfo();
            if ($userid < 0) {
                return array("state" => 200, "info" => '登录超时，请重新登录！');
            }
            if (!$userinfo['busiId']) return array("state" => 200, "info" => '未找到该商品');
            $where = " AND `sid` = " . $userinfo['busiId'];
        }
        include HUONIAOINC . "/config/awardlegou.inc.php";
        $canceltime = (int)$customCanceltime;
        $proDetailarr = $picsarr = $prizearr = $usernamearr = array();
        $archives     = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list`  WHERE `id` = '$id'" . $where);
        $results      = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];

            $proDetailarr['id']  = $results['id'];
            $proDetailarr['sid'] = $results['sid'];

            $param = array(
                "service"  => "business",
                "template" => "detail",
                "id"       => $results['sid']
            );

            $proDetailarr['businessUrl']    = getUrlPath($param);

//            $configHandels = new handlers('business', "storeDetail");
//            $detail        = $configHandels->getHandle($results['sid']);
//            if ($detail && $detail['state'] == 100) {
//                $data                  = $detail['info'];
//                $proDetailarr['store'] = $data;
//            }

            $businessql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = '".$results['sid']."'");

            $businesres = $dsql->dsqlOper($businessql,"results");

            $proDetailarr['storeuid']   = $businesres[0]['uid'];
            $proDetailarr['title'] = $results['title'];
            $proDetailarr['pics']  = $results['pics'];

            if ($results['pics'] != '') {
                $pics = explode(',', $results['pics']);
                foreach ($pics as $v) {
                    $picar = array(
                        'path'       => $v != '' ? getFilePath($v) : '',
                        'pathSource' => $v,
                    );
                    array_push($picsarr, $picar);
                }
            }
            $proDetailarr['picsarr']      = $picsarr;
            $proDetailarr['litpic']       = $results['litpic'];
            $proDetailarr['litpicpath']   = getFilePath($results['litpic']);
            $proDetailarr['onenumber']    = $results['onenumber'];
            $proDetailarr['price']        = $results['price'];
            $proDetailarr['yprice']       = $results['yprice'];
            $proDetailarr['usepoint']     = floatval($results['usepoint']);
            $proDetailarr['fanxianpoint'] = $results['fanxianpoint'];
            $proDetailarr['prizetype']    = $results['prizetype'];
            $proDetailarr['numbe']        = $results['numbe'];
            $proDetailarr['note']         = stripslashes($results['note']);
            $proDetailarr['state']        = $results['state'];
            $proDetailarr['typeid']       = $results['typeid'];
            $proDetailarr['hongbao']      = $results['hongbao'];
            $proDetailarr['hongbao']      = $results['hongbao'];
            $proDetailarr['hongbaotype']  = $results['hongbaotype'];
            $proDetailarr['minhb']        = $results['minhb'];
            $proDetailarr['maxhb']        = $results['maxhb'];
            $proDetailarr['buynum']       = $results['buynum'];
            $proDetailarr['orderdate']    = date('Y-m-d H:i:s',$results['orderdate']);
            $proDetailarr['prize']        = $results['prize'] != '' ? json_decode($results['prize'], true) : array();
            if ($results['prize']) {
                $prize = json_decode($results['prize'], true);
                foreach ($prize as $a => $b) {
                    $prizearr[$a]['litpic']     = $b['litpic'];
                    $prizearr[$a]['litpicpath'] = $b['litpic'] != '' ? getFilePath($b['litpic']) : '';
                    $prizearr[$a]['title']      = $b['title'];
                    $prizearr[$a]['price']      = $b['price'];

                    $prizearr[$a]['descon']     = $b['descon'];
                }
            }
            $proDetailarr['prize'] = $prizearr;
            $sql                   = $dsql->SetQuery("SELECT sum(`people`) as joinnumber FROM `#@__awardlegou_pin` WHERE 1=1 AND `state` != 2 AND `state` !=4 AND  `tid` = " . $id);
            $res                   = $dsql->dsqlOper($sql, "results");
            $joinnumber            = 0;
            if ($res) {
                $joinnumber = $res[0]['joinnumber'];
            }
            $proDetailarr['joinnumber'] = (int)$joinnumber;

            /*当前参与的活动多少参与*/
            $sql                   = $dsql->SetQuery("SELECT sum(`people`) as truejoinnumber FROM `#@__awardlegou_pin` WHERE 1=1 AND find_in_set('".$uid."',`user`) AND `state` = 1 AND `tid` = " . $id);
            $res                   = $dsql->dsqlOper($sql, "results");
            if ($res) {
                $truejoinnumber = $res[0]['truejoinnumber'];
            }
            $proDetailarr['truejoinnumber'] = (int)$truejoinnumber;
            /*判断当前用户是否参与*/
            $join = $pinid = 0;
            $pincanceltime = 0;
            $joinsql   = $dsql->SetQuery("SELECT `id`,`pubdate` FROM `#@__awardlegou_pin` WHERE find_in_set('".$uid."',`user`) AND `state` = 1 AND `tid` = " . $id);
            $joinre    = $dsql->dsqlOper($joinsql, "results");
            if($joinre){
                $join  = 1;
                $pinid        = $joinre[0]['id'];
                $pincanceltime = 0;
                if($canceltime !=0){
                    $pincanceltime = $joinre[0]['pubdate'];
                    $pincanceltime += $canceltime*3600;
                }

            }
            $proDetailarr['pincanceltime'] = $pincanceltime;
            $proDetailarr['join'] = (int)$join;
            $proDetailarr['pinid'] = (int)$pinid;


            //验证是否已经收藏
            $params = array(
                "module" => "awardlegou",
                "temp"   => "detail",
                "type"   => "add",
                "id"     => $id,
                "check"  => 1
            );
            $collect = checkIsCollect($params);
            $proDetailarr['collect'] = $collect == "has" ? 1 : 0;



            $isfaz = 0;
            /*当先登录用户是否是发起者*/
            $isfazsql = $dsql->SetQuery("SELECT `id`,`user` FROM `#@__awardlegou_pin` WHERE `userid` = '$uid' AND `tid` = '$id' AND `state` = 1");

            $isfazres = $dsql->dsqlOper($isfazsql, "results");

            if ($isfazres) {
                $isfaz   = 1;
                $userarr = $isfazres[0]['user'] != '' ? explode(',', $isfazres[0]['user']) : array();
                foreach ($userarr as $v) {
                    $usepicsql = $dsql->SetQuery("SELECT `photo` FROM `#@__member` WHERE `id` = '$v'");
                    $usepicres = $dsql->dsqlOper($usepicsql, "results");

                    array_push($usernamearr, $usepicres[0]['photo'] != '' ? getFilePath($usepicres[0]['photo']) : '');
                }

                $pinid = $isfazres[0]['id'];
            }
            $proDetailarr['usernamearr'] = $usernamearr;
            $proDetailarr['isfaz']       = $isfaz;
            $began = strtotime(date("Y-m-d") . " 00:00");
            $end   = strtotime(date("Y-m-d") . " 23:59");
            /*查询我参与的次数*/
            $joincountsql              = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `userid` = '" . $uid . "' AND `proid` = '$id' AND `orderdate` >= '$began' AND `orderdate` <=$end");
            $joincountres              = $dsql->dsqlOper($joincountsql, "totalCount");
            $proDetailarr['joincount'] = $joincountres;
        }
        return $proDetailarr;

    }


    /**
     * Notes: 商品列表
     * Ueser: Administrator
     * DateTime: 2021/1/13 11:50
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     * note  : 这里订单列表显示的是活动发起人的订单号,便于商家查询,实际筛选条件是以获得购买权的用户作为筛选订单的主订单
     */
    public function orderList()
    {
        global $dsql;
        global $langData;

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

        $where    = $wherewing = $wherestate = '';
        $list     = $storearr = array();
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        if (empty($userid)) {
            global $userLogin;
            $userid = $userLogin->getMemberID();
        }
        if (empty($userid)) return array("state" => 200, "info" => '会员ID不得为空！');

        //搜索订单
        if($title){
            $where .= " AND (o.`ordernum` LIKE '%$title%' OR l.`title` LIKE '%$title%' OR s.`title` LIKE '%$title%')";
        }

        //个人会员订单列表
        if (empty($store)) {
            $where .= ' AND  o.`userid` = ' . $userid;

            //商家会员订单列表
        } else {

            if (!verifyModuleAuth(array("module" => "awardlegou"))) {
                return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
            }

            $sid        = 0;
            $userSql    = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = " . $userid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            if (!$userResult) {
                return array("state" => 200, "info" => $langData['shop'][4][36]);  //您还未开通商城店铺！
            } else {
                $sid = $userResult[0]['id'];
            }

            $where .= ' AND l.`sid` = ' . $sid;

            $wherewing  = ' AND o.`is_wining` = 1';
        }


        $archives = $dsql->SetQuery("SELECT o.`id`,o.`ordernum`,o.`orderstate`,o.`pinstate`,o.`pintype`,o.`procount`,o.`amount`,o.`pinid`,o.`orderdate`,o.`paytype`,o.`point`,o.`ret-expnumber`,o.`ret-expcompany`,o.`ret-state`,o.`exp-date`,o.`is_paytuikuanlogtic`,l.`id` foodid,l.`title`,l.`litpic`,l.`price`,l.`prizetype`,l.`prize`,l.`hongbaotype`,l.`hongbao`,l.`numbe`,s.`title` shopname FROM `#@__awardlegou_order` o  LEFT JOIN `#@__awardlegou_list` l  ON  o.`proid` = l.`id` LEFT JOIN  `#@__business_list` s ON s.`id` = l.`sid` WHERE 1=1"
            . $where);
        //总条数
        $totalCount = $dsql->dsqlOper($archives, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        //未付款
        $unpaid = $dsql->dsqlOper($archives . " AND `orderstate` = 0", "totalCount");
        //待邀请
        $daiyaoqing = $dsql->dsqlOper($archives . " AND o.`orderstate` = 1 AND o.`pinstate` = 0", "totalCount");
        //待发货
//        var_dump($archives . "  AND o.`pinstate` = 1  AND l.`prizetype` = 0 AND o.`exp-date` = 0 AND o.`is_wining` = 1");die;
        $daifahuo = $dsql->dsqlOper($archives . "  AND o.`pinstate` = 1  AND o.`orderstate` = 5 AND o.`exp-date` = 0 AND o.`is_wining` = 1 AND o.`ret-state` =0", "totalCount");
        //已发货
        $yifahuo  = $dsql->dsqlOper($archives . "  AND o.`pinstate` = 1  AND o.`orderstate` = 6 AND o.`exp-date` != 0 AND o.`is_wining` = 1 AND o.`ret-state` =0", "totalCount");
        //成功
        $success = $dsql->dsqlOper($archives . "  AND o.`orderstate` = 3", "totalCount");
        /*申请退款*/
        $tuikuan = $dsql->dsqlOper($archives . "  AND o.`ret-state` !=0 AND (o.`orderstate` = 5 OR o.`orderstate` = 6 OR o.`orderstate` = 9)", "totalCount");
        /*已退款*/
        $ytuikuan = $dsql->dsqlOper($archives . "  AND o.`ret-state` !=0 AND o.`refrunddate` !=0", "totalCount");
        //关闭/失败/退款成功
        $closed = $dsql->dsqlOper($archives . " AND o.`orderstate` = 7 AND o.`refrunddate`!=0", "totalCount");
        /*售后*/
        $shouhou = $dsql->dsqlOper($archives . " AND (o.`ret-state` !=0 AND (o.`orderstate` = 5 OR o.`orderstate` = 6 OR o.`orderstate` = 9) or (o.`ret-state` !=0 AND o.`refrunddate` !=0))", "totalCount");


        if ($state != '') {
            if ($state == '2') {
                /*待邀请*/
                $wherestate .= " AND o.`orderstate` = 1 AND o.`pinstate` = 0";
            } elseif ($state == '3') {
                $wherestate .= " AND o.`orderstate` = 3 ";
            } elseif ($state == '5') {
                /*待发货*/
                $wherestate .= " AND o.`orderstate` = 5 AND o.`pinstate` = 1 AND o.`ret-state` =0 ".$wherewing;
            } elseif ($state == '6') {
                /*已发货*/
                $wherestate .= "  AND o.`pinstate` = 1 AND o.`orderstate` = 6 AND o.`ret-state` =0".$wherewing;
            } elseif ($state == '7') {
                /*退款*/
                $wherestate .= "  AND o.`orderstate` = 7 AND o.`refrunddate`!=0";
            } elseif ($state == '8'){
                /*申请退款*/
                $wherestate .= "  AND o.`ret-state` !=0 AND (o.`orderstate` = 5 OR o.`orderstate` = 6 OR o.`orderstate` = 9)";

            }elseif ($state == '7,9'){
                /*已退款*/
                $wherestate .= "  AND o.`ret-state` !=0 AND o.`refrunddate` !=0";

            }elseif ($state == '9,9'){

                /*退款/售后*/
                $wherestate .= "  AND (o.`ret-state` !=0 AND (o.`orderstate` = 5 OR o.`orderstate` = 6 OR o.`orderstate` = 9) or (o.`ret-state` !=0 AND o.`refrunddate` !=0))";

            }
        }

        //未付款
        $unpaid   = $dsql->dsqlOper($archives . " AND `orderstate` = 0", "totalCount");
        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount,
            "unpaid"     => $unpaid,
            "daiyaoqing" => $daiyaoqing,
            "daifahuo"   => $daifahuo,
            "yifahuo"    => $yifahuo,
            "closed"     => $closed,
            "success"    => $success,
            "tuikuan"    => $tuikuan,
            "ytuikuan"   => $ytuikuan,
            "shouhou"    => $shouhou,
        );

        if ($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

        $atpage = $pageSize * ($page - 1);
        $where  .= " ORDER BY o.`id` DESC LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives.$wherestate . $where, "results");
        if ($results) {
            foreach ($results as $k => $v) {
                $list[$k]['id']         = $v['id'];
                $list[$k]['ordernum']   = $v['ordernum'];

                $param = array(
                    "service"  => "awardlegou",
                    "template" => "pay",
                    "param"    => "ordernum=" . $v['ordernum']
                );
                $list[$k]['payurl'] = getUrlPath($param);
                if( $v['pintype'] ==0){
                    $pnumbersql = $dsql->SetQuery("SELECT `oid` FROM `#@__awardlegou_pin` WHERE  `id` = '".$v['pinid']."'");
                    $pnumberres = $dsql->dsqlOper($pnumbersql,"results");
                    if($pnumberres){
                        $list[$k]['ordernum']   = $pnumberres[0]['oid'];
                    }
                }
                $list[$k]['orderstate'] = $v['orderstate'];
                $list[$k]['pinstate']   = $v['pinstate'];
                $list[$k]['pintype']    = $v['pintype'];
                $list[$k]['pinid']      = $v['pinid'];

                $pinsql                    = $dsql->SetQuery("SELECT `people` FROM `#@__awardlegou_pin` WHERE `id` = '" . $v['pinid'] . "'");
                $pinres                    = $dsql->dsqlOper($pinsql, "results");
                $list[$k]['havenumber']    = $v['numbe'] - (int)$pinres[0]['people'];
                $list[$k]['procount']      = $v['procount'];
                $list[$k]['title']         = $v['title'];
                $list[$k]['totalPayPrice'] = $v['amount'];
                $list[$k]['point']         = $v['point'];
                $list[$k]['litpic']        = $v['litpic'];
                $list[$k]['litpicpath']    = $v['litpic'] != '' ? getFilePath($v['litpic']) : '';
                $list[$k]['price']         = $v['price'];
                $list[$k]['prizetype']     = $v['prizetype'];
                $list[$k]['prize']         = $v['prize'];
                $list[$k]['foodid']        = $v['foodid'];

                $list[$k]['retExpnumber']  = $v['ret-expnumber'];
                $list[$k]['retExpcompany'] = $v['ret-expcompany'];
                $list[$k]['retState']      = $v['ret-state'];
                $list[$k]['expDate']       = $v['exp-date'];
                $list[$k]['is_paytuikuanlogtic'] = $v['is_paytuikuanlogtic'];
                $list[$k]['hongbaotype']   = $v['hongbaotype'];
                $list[$k]['hongbaotype']   = $v['hongbao'];
                $list[$k]['shopname']      = $v['shopname'];
                $list[$k]['orderdate']     = date('Y-m-d H:i:s',$v['orderdate']);
                if ($v['paytype'] != '') {
                    $paytypestr = explode(',', $v['paytype']);
                    $patyearr   = array();
                    foreach ($paytypestr as $a) {
                        if ($a == 'money') {
                            $pay_name = '余额支付';
                            array_push($patyearr, $pay_name);
                            continue;
                        }
                        $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $a . "'");
                        $ret = $dsql->dsqlOper($sql, "results");
                        if ($ret) {
                            $pay_name = $ret[0]['pay_name'];
                            array_push($patyearr, $pay_name);
                        }

                    }
                }
                $list[$k]['paytype']      = $patyearr != '' ? join(',', $patyearr) : '';
            }
        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * Notes: 订单详情
     * Ueser: Administrator
     * DateTime: 2021/1/13 13:13
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function orderDetail()
    {
        global $dsql;
        global $langData;
        global $cfg_pointRatio;
        $orderDetail = $cardnum = $proarr = $prizearr = $pinarr = array();
        $id          = is_array($this->param) ? $this->param['id'] : $this->param;

        global $userLogin;
        $userid = $userLogin->getMemberID();
        if ($userid == -1) return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //查询商家信息
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
        $sid = $dsql->getOne($sql);

        $where = " AND `userid` = $userid";
        if($sid){
            $where = " AND (`userid` = $userid OR `store` = $sid)";
        }

        /*订单信息*/
        $ordersql = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_order` WHERE `id` = " . $id . $where);
        $orderres = $dsql->dsqlOper($ordersql, "results");
        if (!empty($orderres)) {
            $results = $orderres[0];

            $orderDetail['id']       = $results['id'];
            if( $results['pintype'] ==0){
                $pnumbersql = $dsql->SetQuery("SELECT `oid` FROM `#@__awardlegou_pin` WHERE  `id` = '".$results['pinid']."'");
                $pnumberres = $dsql->dsqlOper($pnumbersql,"results");
                if($pnumberres){
                    $orderDetail['ordernum']   = $pnumberres[0]['oid'];
                }
            }else{
                $orderDetail['ordernum']   = $orderres[0]['ordernum'];
            }
            $orderDetail['userid']   = $results['userid'];
            $userinfo                = $userLogin->getMemberInfo($results['userid']);

            $orderDetail['nickname']   = $userinfo['nickname'];
            $orderDetail['phone']   = $userinfo['phone'];

            $orderDetail['proid']    = $results['proid'];

            $prosql = $dsql->SetQuery("SELECT `id`,`title`,`litpic`,`price`,`usepoint`,`numbe`,`tuikuanlogtic` FROM `#@__awardlegou_list` WHERE `id` = '" . $results['proid'] . "'");
            $prores = $dsql->dsqlOper($prosql, "results");

            $numbe = 0;
            if ($prores) {
                $proarr['id']         = $prores[0]['id'];
                $proarr['title']      = $prores[0]['title'];
                $proarr['litpic']     = $prores[0]['litpic'];
                $proarr['litpicpath'] = getFilePath($prores[0]['litpic']);
                $proarr['price']      = $prores[0]['price'];
                $proarr['tuikuanlogtic']      = $prores[0]['tuikuanlogtic'];
                $proarr['usepoint']   = floatval($prores[0]['usepoint']);
                $numbe                = $prores[0]['numbe'];
            }
            $orderDetail['proarr']     = $proarr;
            $orderDetail['procount']   = $results['procount'];
            $orderDetail['point']      = $results['point'];
            $orderDetail['balance']    = $results['balance'];
            $orderDetail['payprice']   = $results['payprice'];
            $orderDetail['amount']     = $results['amount'];
            $orderDetail['orderstate'] = $results['orderstate'];
            $orderDetail['is_paytuikuanlogtic'] = $results['is_paytuikuanlogtic'];
            $orderDetail['orderdate']  = date("Y-m-d H:i:s", $results['orderdate']);
            if ($results['paytype'] != '') {
                $paytypestr = explode(',', $results['paytype']);
                $patyearr   = array();
                foreach ($paytypestr as $a) {
//                    if ($a == 'integral') {
//                        $pay_name = '积分支付';
//                        array_push($patyearr, $pay_name);
//                        continue;
//                    } else
                    if ($a == 'money') {
                        $pay_name = '余额支付';
                        array_push($patyearr, $pay_name);
                        continue;
                    }
                    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $a . "'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $pay_name = $ret[0]['pay_name'];
                        array_push($patyearr, $pay_name);
                    }

                }
            }
            $orderDetail['paytype']      = $patyearr != '' ? join(',', $patyearr) : '';
            $orderDetail['paydate']      = date("Y-m-d H:i:s", $results['paydate']);
            $orderDetail['useraddr']     = $results['useraddr'];
            $orderDetail['username']     = $results['username'];
            $orderDetail['usercontact']  = $results['usercontact'];
            $orderDetail['usernote']     = $results['usernote'];
            $orderDetail['expCompany']   = $results['exp-company'];
            $orderDetail['expNumber']    = $results['exp-number'];
            $orderDetail['expDate']      = $results['exp-date'];
            $orderDetail['jpexpCompany'] = $results['jpexp-company'];
            $orderDetail['jpexpNumber']  = $results['jpexp-number'];
            $orderDetail['jpexpDate']    = $results['jpexp-date'];
            $orderDetail['retDate']      = $results['ret-date'];
            $orderDetail['retState']     = $results['ret-state'];
            $orderDetail['retExpnumber'] = $results['ret-expnumber'];
            $orderDetail['retExpcompany']= $results['ret-expcompany'];
            $orderDetail['tongyidate']   = $results['tongyidate'];
            $orderDetail['pinstate']     = $results['pinstate'];
            $orderDetail['pinid']        = $results['pinid'];

            $imglist = array();
            $pics    = $results['ret-pics'];
            if (!empty($pics)) {
                $pics = explode(",", $pics);
                foreach ($pics as $key => $value) {
                    $imglist[$key]['val']  = $value;
                    $imglist[$key]['path'] = getFilePath($value);
                }
            }
            $orderDetail['retPics'] = $imglist;

            $orderDetail['retDate']  = $results['ret-date'];
            $orderDetail['retNote']  = $results['ret-note'];
            $orderDetail['retType']  = $results['ret-type'];
            $orderDetail['retSnote'] = $results['ret-s-note'];

            $people = 0;
            if ($results['pinid']) {
                $pinsql = $dsql->SetQuery("SELECT `pubdate`,`state`,`people`,`user` FROM `#@__awardlegou_pin` WHERE `id` = '" . $results['pinid'] . "'");
                $pinres = $dsql->dsqlOper($pinsql, "results");
                if ($pinres) {
                    $pinarr['pubdate'] = $pinres[0]['pubdate'];
                    $pinarr['state']   = $pinres[0]['state'];
                    $pinarr['people']  = $pinres[0]['people'];
                    $people            = $pinres[0]['people'];
                    $pinarr['user']    = $pinres[0]['user'];
                }

            }

            $orderDetail['pinarr']       = $pinarr;
            $orderDetail['havenumber']   = $numbe - $people;
            $orderDetail['pintype']      = $results['pintype'];
            $orderDetail['reward']       = $results['reward']!='' ? unserialize($results['reward']) : array();
            $orderDetail['rewardtype']   = $results['rewardtype'];
            $orderDetail['hongbaomoney'] = $results['hongbaomoney'];
            $orderDetail['is_receive']   = $results['is_receive'];
            $orderDetail['is_wining']    = $results['is_wining'];

            $reward = unserialize($results['reward']);
            $addres = array(
                'username'    => $results['username'],
                'usercontact' => $results['usercontact'],
                'useraddr'    => $results['useraddr']
            );
            $arraay = array(
                'id'           => $results['id'],
                'rewardtype'   => $results['rewardtype'],
                'is_receive'   => $results['is_receive'],
                'hongbaomoney' => $results['hongbaomoney'],
                'reward'       => $reward,
                'addres'       => $addres,
                'jpexpNumber'   => $results['jpexp-number'],
                'jpexpDate'     => $results['lpexp-date']
            );
            array_push($prizearr,$arraay);


            /*查询其他奖品用户*/
            $allzjsql   = $dsql->SetQuery("SELECT `id`,`reward`,`useraddr`,`username`,`usercontact`,`jpexp-number`,`jpexp-date`,`userid`,`rewardtype`,`is_receive`,`hongbaomoney`,`pinstate`  FROM `#@__awardlegou_order` WHERE `pinid` = '".$results['pinid']."' AND find_in_set(`userid`,'".$pinres[0]['user']."')");
            $allzjres   = $dsql->dsqlOper($allzjsql,"results");
            if($allzjres){
                $addres = $arraay = array();
                foreach ($allzjres as $a => $b) {
                    if ($b['userid'] == $results['userid']) continue;
                    $reward = unserialize($b['reward']);

                    $addres['username']    = $b['username'];
                    $addres['usercontact'] = $b['usercontact'];
                    $addres['useraddr']    = $b['useraddr'];
                    $addres['pinstate']    = $b['pinstate'];

                    $arraay = array(
                        'id'           => $b['id'],
                        'rewardtype'   => $b['rewardtype'],
                        'is_receive'   => $b['is_receive'],
                        'hongbaomoney' => $b['hongbaomoney'],
                        'reward'       => $reward,
                        'addres'       => $addres,
                        'jpexpNumber'  => $b['jpexp-number'],
                        'jpexpDate'    => $b['jpexp-date']
                    );
                    array_push($prizearr, $arraay);
                }
            }
            $orderDetail['prizearr']     = $prizearr;
            $info  = $binfo = '';
            switch ($results['orderstate']) {
                case '0':
                    $info = '未付款';
                    break;
                case '1':
                    $info = '等待活动成功 还需邀请' . ($numbe - $people) . '人';
                    break;
                case '7':
                    $info = '活动为完成自动取消，已全额退款到余额';
                    if($b['pinstate'] ==1){
                        $info = '参与人满活动成功 未抽中乐购价购买商品 资格，已全额退款到余额';
                    }
                    break;
                case '5':
                    $info  = '参与人满活动成功 恭喜抽中乐购价购买商品资格！我们尽快安排发货';
                    $binfo = '待发货';
                    break;
                case '6':
                    $info   = '参与人满活动成功 恭喜抽中乐购价购买商品资格！';
                    $binfo  = '已发货,等待买家收货';
                    break;
                default:
                    $info   = '交易已完成';
                    $binfo  = '交易已完成';
                    break;
            }
            $orderDetail['info']   = $info;
            $orderDetail['binfo']  = $binfo;
        }
        return $orderDetail;
    }

    /**
     * Notes: 新增商品
     * Ueser: Administrator
     * DateTime: 2021/1/13 13:22
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function addFood()
    {
        global $dsql;
        global $langData;
        global $customFabuCheck;
        global $userLogin;
        global $siteCityInfo;

        $userid     = $userLogin->getMemberID();
        $memberInfo = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        if (!verifyModuleAuth(array("module" => "awardlegou"))) {
            return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
        }
        $param        = $this->param;
        $title        = filterSensitiveWords(addslashes($param['title']));
        $price        = (float)$param['price'];
        $yprice       = (float)$param['yprice'];
        $pics         = $param['imglist'];
        $litpic       = $param['litpic'];
        $onenumber    = (int)$param['limit'];
        $usepoint     = (float)$param['point'];
        $fanxianpoint = (float)$param['sharePoint'];
        $prizetype    = $param['gifttype'];
        $prize        = $param['prize'];
        $numbe        = (int)$param['people'];
        $hbset        = $param['hbset'];
        $hbamount     = $param['hbamount'];
        $hbpercent    = $param['hbpercent'];
        $hongbaotype  = $param['hbfenpei'];
        $minhb        = (float)$param['minhb'];
        $maxhb        = (float)$param['maxhb'];
        $note         = $param['mbody'];
        $typeid       = $param['typeid'];
        $weight       = (int)$param['weight'];
        $rec          = (int)$param['rec'];
        if ($title == "") {
            return array("state" => 200, "info" => $langData['shop'][4][57]);  //请输入商品标题！
        }


        if (!preg_match("/^0|\d*\.?\d+$/i", $price, $matches)) {
            return array("state" => 200, "info" => $langData['shop'][4][58]);  //市场价不得为空，类型为数字！
        }

        if (!preg_match("/^0|\d*\.?\d+$/i", $yprice, $matches)) {
            return array("state" => 200, "info" => $langData['shop'][4][59]);  //一口价不得为空，类型为数字！
        }
        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传代表图片');
        }

        if (empty($pics)) {
            return array("state" => 200, "info" => '请上传图集');
        }
        $sid = $memberInfo['busiId'];
        if ($memberInfo['userType'] != 2 || $sid == '') return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！

        $pubdate = GetMkTime(time());

        if($hbset == 1){
            $hongbao = $hbpercent."%";
        }else{
            $hongbao = $hbamount;
        }

        $newprizearr = array();
        if($prize!=''){
            $prizearr = json_decode($prize,'results');
            foreach ($prizearr as $key => $value){
                $newprizearr[$key]['litpic'] = $value['litpic'];
                $newprizearr[$key]['title']  = $value['title'];
                $newprizearr[$key]['price']  = $value['price'];
                $newprizearr[$key]['descon'] = addslashes($value['descon']);
            }
        }
        if($prizearr){
            $prize = json_encode($prizearr,JSON_UNESCAPED_UNICODE);

        }



        $archives = $dsql->SetQuery("INSERT INTO `#@__awardlegou_list` (`sid`,`typeid`,`title`, `pics`, `litpic`, `onenumber`, `price`, `yprice`, `usepoint`, `fanxianpoint`, `prizetype`, `prize`, `numbe`, `hongbao`, `hongbaotype`,`minhb`,`maxhb`,`note`, `weight`, `rec`, `state`, `pubdate`)
            VALUES ('$sid','$typeid','$title', '$pics', '$litpic', $onenumber, '$price', '$yprice', '$usepoint', '$fanxianpoint', '$prizetype', '$prize', '$numbe', '$hongbao', '$hongbaotype',$minhb,$maxhb, '$note', '$weight', '$rec', '$customFabuCheck','$pubdate')");
        $aid      = $dsql->dsqlOper($archives, "lastid");
        if (is_numeric($aid)) {

            $urlParam = array(
                'service' => 'awardlegou',
                'template' => 'detail',
                'id' => $aid
            );
            $url = getUrlPath($urlParam);
    
            //记录用户行为日志
            memberLog($userid, 'awardlegou', '', $aid, 'insert', '发布商品('.$title.')', $url, $archives);

            //微信通知
            $cityName = $siteCityInfo['name'];
            $cityid   = $siteCityInfo['cityid'];
            $param    = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' => array(
                    'contentrn' => $cityName . '分站——有奖乐购模块——用户:' . $memberInfo['username'] . '添加了一件商品: ' . $title,
                    'date'      => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("awardlegou", "detail", $param);
            return $aid;
        } else {
            return array("state" => 101, "info" => '发布到数据时发生错误，请检查字段内容！');
        }


    }

    /**
     * Notes: 商品编辑
     * Ueser: Administrator
     * DateTime: 2021/1/13 15:14
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|int|string
     */
    public function editFood()
    {
        global $dsql;
        global $langData;
        global $customFabuCheck;
        global $userLogin;
        global $siteCityInfo;

        $userid     = $userLogin->getMemberID();
        $memberInfo = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        if (!verifyModuleAuth(array("module" => "awardlegou"))) {
            return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
        }
        $param = $this->param;

        $id           = $param['id'];
        $title        = filterSensitiveWords(addslashes($param['title']));
        $price        = (float)$param['price'];
        $yprice       = (float)$param['yprice'];
        $pics         = $param['imglist'];
        $litpic       = $param['litpic'];
        $onenumber    = $param['limit'];
        $usepoint     = $param['point'];
        $fanxianpoint = $param['sharePoint'];
        $prizetype    = $param['gifttype'];
        $prize        = $param['prize'];
        $numbe        = $param['people'];
        $hbset        = $param['hbset'];
        $hbamount     = $param['hbamount'];
        $hbpercent    = $param['hbpercent'];
        $hongbaotype  = $param['hbfenpei'];
        $minhb        = $param['minhb'];
        $maxhb        = $param['maxhb'];
        $note         = $param['mbody'];
        $typeid       = $param['typeid'];
        $weight       = $param['weight'];
        $rec          = $param['rec'];

        if (empty($id)) return array("state" => 200, "info" => '数据传递失败！');
        if ($title == "") {
            return array("state" => 200, "info" => $langData['shop'][4][57]);  //请输入商品标题！
        }


        if (!preg_match("/^0|\d*\.?\d+$/i", $price, $matches)) {
            return array("state" => 200, "info" => $langData['shop'][4][58]);  //市场价不得为空，类型为数字！
        }

        if (!preg_match("/^0|\d*\.?\d+$/i", $yprice, $matches)) {
            return array("state" => 200, "info" => $langData['shop'][4][59]);  //一口价不得为空，类型为数字！
        }
        if (empty($litpic)) {
            return array("state" => 200, "info" => '请上传代表图片');
        }

        if (empty($pics)) {
            return array("state" => 200, "info" => '请上传图集');
        }

        $sid = $memberInfo['busiId'];
        if ($memberInfo['userType'] != 2 || $sid == '') return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！

        $pubdate = GetMkTime(time());

        if($hbset == 1){
            $hongbao = $hbpercent .'%';
        }else{
            $hongbao = $hbamount;
        }

        $newprizearr = array();
        if($prize!=''){
            $prizearr = json_decode($prize,'results');
            foreach ($prizearr as $key => $value){
                $newprizearr[$key]['litpic'] = $value['litpic'];
                $newprizearr[$key]['title']  = $value['title'];
                $newprizearr[$key]['price']  = $value['price'];
                $newprizearr[$key]['descon'] = addslashes($value['descon']);
            }
        }
        if($prizearr){
            $prize = json_encode($prizearr,JSON_UNESCAPED_UNICODE);
        }
        $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_list` SET `sid` = '$sid',`typeid` = '$typeid',`title` = '$title', `pics` = '$pics', `litpic` = '$litpic', `onenumber` = '$onenumber', `price` = '$price', `yprice` = '$yprice', `usepoint` = '$usepoint', `fanxianpoint` = '$fanxianpoint', `prizetype` = '$prizetype', `prize` = '$prize', `numbe` = '$numbe', `hongbao` = '$hongbao', `hongbaotype` = '$hongbaotype',`minhb` = '$minhb',`maxhb` = '$maxhb' ,`note` = '$note', `weight` = '$weight', `rec` = '$rec', `state` = '$customFabuCheck' WHERE `id` = '$id' AND `sid` = '$sid'");
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            return array("state" => 200, "info" => '保存到数据时发生错误，请检查字段内容！');
        }

        $urlParam = array(
            'service' => 'awardlegou',
            'template' => 'detail',
            'id' => $id
        );
        $url = getUrlPath($urlParam);

        //记录用户行为日志
        memberLog($userid, 'awardlegou', '', $id, 'insert', '修复商品('.$title.')', $url, $asrchives);

        //微信通知
        $cityName = $siteCityInfo['name'];
        $cityid   = $siteCityInfo['cityid'];
        $param    = array(
            'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
            'cityid' => $cityid,
            'notify' => '管理员消息通知',
            'fields' => array(
                'contentrn' => $cityName . '分站——有奖乐购模块——用户:' . $memberInfo['username'] . '更新了一件商品: ' . $title,
                'date'      => date("Y-m-d H:i:s", time()),
            )
        );
        updateAdminNotice("awardlegou", "detail", $param);

        return $results;
    }

    /**
     * Notes: 商品删除
     * Ueser: Administrator
     * DateTime: 2021/1/13 15:15
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function del()
    {
        global $dsql;
        global $userLogin;

        $id = $this->param['id'];

        if (!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        /*正在拼团的不可以删除*/
        $archives = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list` l LEFT JOIN `#@__awardlegou_pin` p ON p.`tid` = l.`id` WHERE p.`state`!= 1 AND p.`state`!= 3 AND l.`id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $results = $results[0];

            if ($results['sid'] == $userinfo['busiId']) {
                //删除相应的订单
                $orderSql    = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `proid` = " . $id);
                $orderResult = $dsql->dsqlOper($orderSql, "results");

                if ($orderResult) {
                    $quanSql = $dsql->SetQuery("DELETE FROM `#@__awardlegou_order` WHERE `proid` = " . $id);
                    $dsql->dsqlOper($quanSql, "update");
                }
        
                //记录用户行为日志
                memberLog($uid, 'awardlegou', '', $id, 'delete', '删除商品('.$results['title'].')', '', '');

                //删除缩略图
                delPicFile($results['litpic'], "delThumb", "awardlegou");
                //删除图集
                delPicFile($results['pics'], "delAtlas", "awardlegou");

                $body = $results['body'];
                if (!empty($body)) {
                    delEditorPic($body, "awardlegou");
                }

                //删除表
                $archives = $dsql->SetQuery("DELETE FROM `#@__awardlegou_list` WHERE `id` = " . $id);
                $dsql->dsqlOper($archives, "update");

                return array("state" => 100, "info" => '删除成功！');
            } else {
                return array("state" => 101, "info" => '权限不足，请确认帐户信息后再进行操作！');
            }
        } else {
            return array("state" => 101, "info" => '商品不存在，或已经删除！');
        }

    }

    /**
     * Notes: 商家发货
     * Ueser: Administrator
     * DateTime: 2021/1/13 14:30
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function delivery()
    {
        global $dsql;
        global $userLogin;

        $id      = $this->param['id'];
        $company = $this->param['company'];
        $number  = $this->param['number'];
        $dtype   = (int)$this->param['dtype'];

        if (empty($id) || empty($company) || empty($number)) return array("state" => 200, "info" => '数据不完整，请检查！');

        //获取用户ID
        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }
        $sid = (int)$userinfo['busiId'];
        $where = ' AND o.`orderstate` = 5 AND  o.`id` = '.$id ;
        if($dtype == 1){
            $where = ' AND ( o.`orderstate` = 7 OR  o.`orderstate` = 5)';
        }
        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`userid`, o.`ordernum`, o.`pinid`, o.`pinstate`, l.`title` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` WHERE 1=1 AND l.`sid` = '$sid'".$where);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            $userid   = $results[0]['userid'];
            $ordernum = $results[0]['ordernum'];

            $paramBusi = array(
                "service"  => "member",
                "type"     => "user",
                "template" => "orderdetail",
                "action"   => "awardlegou",
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

            $now = GetMkTime(time());
            $str = "`orderstate` = 6, `exp-company` = '".$company."', `exp-number` = '".$number."', `exp-date` = '".$now."'";
            if($dtype ==1){
                $str = " `jpexp-company` = '".$company."', `jpexp-number` = '".$number."', `jpexp-date` = '".$now."'";
            }
            //更新订单状态
            $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET ".$str." WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
        
            //记录用户行为日志
            memberLog($uid, 'awardlegou', 'order', $id, 'update', '订单发货('.$ordernum.')', '', $sql);

            return "操作成功！";

        } else {
            return array("state" => 200, "info" => '操作失败，请核实订单状态后再操作！');
        }

    }

    /**
     * Notes: 有奖乐购支付
     * Ueser: Administrator
     * DateTime: 2021/1/14 14:43
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function pay()
    {
        global $dsql;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $userLogin;

        $param = $this->param;

        $ordernum   = $this->param['ordernum'];
        $paytype    = $this->param['paytype'];
        $check      = (int)$this->param['check'];
        $usePinput  = $this->param['usePinput'];
        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        //验证需要支付的费用
        $payTotalAmount = $this->checkPayAmount();
        $userid         = $userLogin->getMemberID();
        if ($userid == -1) {
            if ($check) {
                return array("state" => 200, "info" => "登陆超时");
            } else {
                die("登陆超时");
            }
        }
        if ($ordernum) {
            $sql = $dsql->SetQuery("SELECT o.`amount`,p.`tid` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_pin` p ON o.`pinid` = p.`id` WHERE o.`orderstate` = 0  AND o.`ordernum` = '$ordernum'");
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $totalPrice = $ret[0]['amount'];
                $pinid      = $ret[0]['tid'];
                $date       = GetMkTime(time());
                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $usermoney = $userinfo['money'];
                $userpoint = $userinfo['point'];

                $tit      = array();
                $useTotal = 0;

                //如果有使用积分或余额则更新订单内容的价格策略
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
                    $archives    = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `point` = '$pointMoney_', `balance` = '$useBalanceMoney', `payprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");

                    //如果没有使用积分或余额，重置积分&余额等价格信息
                } else {
                    $oprice = $totalPrice;
                    $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `point` = '0', `balance` = '0', `payprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                }

                //判断是否使用积分，并且验证剩余积分
                global $cfg_pointName;
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
                    } elseif ($useTotal < $totalPrice) {
                        if ($paytype == "delivery") {
                            if ($check) {
                                return array("state" => 200, "info" => "请选择在线支付方式！");
                            } else {
                                die("请选择在线支付方式！");
                            }
                        }
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

                if ($check) return "ok";

                // 需要支付的金额大于0并且不是货到付款，跳转至第三方支付页面
                if ($payTotalAmount > 0) {

                   return createPayForm("awardlegou", $ordernum, $payTotalAmount, $paytype, "有奖乐购订单");

                    // 余额支付或者货到付款
                } else {
                    $paytype = join(",", $tit);
                    $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
                    $payre   = $dsql->dsqlOper($paysql, "results");
                    if (!empty($payre)) {

                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'awardlegou',  `uid` = $userid, `amount` = 0, `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'awardlegou'");
                        $dsql->dsqlOper($archives, "update");

                    } else {

                        $body     = serialize($param);
                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('awardlegou', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
                        $dsql->dsqlOper($archives, "results");

                    }

                    //执行支付成功的操作
                    $this->param = array(
                        "paytype"  => $paytype,
                        "ordernum" => $ordernum
                    );
                    $this->paySuccess();
                    $param = array(
                        "service"  => "awardlegou",
                        "template" => "detail",
                        "id"       => $pinid
                    );
                    $url   = getUrlPath($param);

                    //支付成功后跳转页面
//                    global $cfg_payReturnType;
//                    global $cfg_payReturnUrlPc;
//                    global $cfg_payReturnUrlTouch;
//
//                    if ($cfg_payReturnType) {
//
//                        //移动端自定义跳转链接
//                        if (isMobile() && $cfg_payReturnUrlTouch) {
//                            $url = $cfg_payReturnUrlTouch;
//                        }
//
//                        //电脑端自定义跳转链接
//                        if (!isMobile() && $cfg_payReturnUrlPc) {
//                            $url = $cfg_payReturnUrlPc;
//                        }
//                    }
//                    var_dump($url);die;
                    return $url;
                }
            } else {
                if ($check) {
                    return array("state" => 200, "info" => "订单不存在或已支付");
                } else {
                    $param = array(
                        "service"  => "awardlegou",
                        "template" => "index"
                    );
                    $url   = getUrlPath($param);
                    return $url;

                }

            }
        } else {
            if ($check) {
                return array("state" => 200, "info" => "订单不存在");
            } else {
                $param = array(
                    "service"  => "awardlegou",
                    "template" => "index"
                );
                $url   = getUrlPath($param);

                return $url;
            }

        }
    }


    /**
     * Notes: 支付邮费
     * Ueser: Administrator
     * DateTime: 2021/4/8 15:56
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function logticpay(){
        global $dsql;
        global $cfg_basehost;
        global $cfg_pointRatio;
        global $userLogin;

        $param = $this->param;

        $ordernum   = $this->param['ordernum'];
        $paytype    = $this->param['paytype'];
        $check      = (int)$this->param['check'];
        $usePinput  = $this->param['usePinput'];
        $point      = (float)$this->param['point'];
        $useBalance = $this->param['useBalance'];
        $balance    = (float)$this->param['balance'];
        $paypwd     = $this->param['paypwd'];      //支付密码
        $final      = (int)$this->param['final'];      //最终支付 0 支付之前验证1

        $logticpay  = (int)$this->param['paytuikuanlogtic']; /*退款支付邮费*/

        $userid = $userLogin->getMemberID();
        $payTotalAmount = $this->checkPayAmount();

        if ($ordernum) {
            $where = '';

            if($logticpay!=1){

                $where = ' AND o.`orderstate` = 0 ';
            }else{
                $where = ' AND o.`is_paytuikuanlogtic` = 0 ';
            }
            $sql = $dsql->SetQuery("SELECT o.`amount`,o.`id`,l.`tuikuanlogtic`,o.`is_paytuikuanlogtic` FROM `#@__awardlegou_order` o LEFT  JOIN `#@__awardlegou_list` l ON  o.`proid` = l.`id`WHERE 1=1 $where  AND o.`ordernum` = '$ordernum'");
//            var_dump($sql);die;
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $totalPrice = $ret[0]['tuikuanlogtic'];
                $oid        = $ret[0]['id'];
                $date       = GetMkTime(time());
                //查询会员信息
                $userinfo  = $userLogin->getMemberInfo();
                $usermoney = $userinfo['money'];
                $userpoint = $userinfo['point'];

                $tit      = array();
                $useTotal = 0;

                if ($final == 1) {
                    $tordernum  = create_ordernum();

                    $timeout    = GetMkTime(time()) + 1800;

                    $order      = createPayForm("awardlegou", $tordernum, $payTotalAmount, '', "有奖乐购运费订单",array('trueordernum' => $ordernum),1);

                    $order['timeout']  = $timeout;

                    $order['ordernum'] = $ordernum;

                    return  $order;
                }

                //如果有使用积分或余额则更新订单内容的价格策略
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
                    $archives    = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `tlogicpoint` = '$pointMoney_', `tlogicbalance` = '$useBalanceMoney', `tlogicpayprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");

                    //如果没有使用积分或余额，重置积分&余额等价格信息
                } else {
                    $oprice = $totalPrice;
                    $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `tlogicpoint` = '0', `tlogicbalance` = '0', `tlogicpayprice` = '$oprice' WHERE `ordernum` = '$ordernum'");
                    $dsql->dsqlOper($archives, "update");
                }

                //判断是否使用积分，并且验证剩余积分
                global $cfg_pointName;
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
                    } elseif ($useTotal < $totalPrice) {
                        if ($paytype == "delivery") {
                            if ($check) {
                                return array("state" => 200, "info" => "请选择在线支付方式！");
                            } else {
                                die("请选择在线支付方式！");
                            }
                        }
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
                if ($check) return "ok";

                // 需要支付的金额大于0并且不是货到付款，跳转至第三方支付页面
                $tordernum = create_ordernum();

                $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `ret-logtic` = '$payTotalAmount',`tordenum` = '$tordernum'  WHERE `ordernum` = '$ordernum'");
                $dsql->dsqlOper($archives, "update");
                if ($payTotalAmount > 0) {
                    createPayForm("awardlegou", $tordernum, $payTotalAmount, $paytype, "有奖乐购运费订单",array('trueordernum' => $ordernum));

                    // 余额支付或者货到付款
                } else {
//                    $paytype = join(",", $tit);
//                    $paysql  = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `ordernum` = '$ordernum'");
//                    $payre   = $dsql->dsqlOper($paysql, "results");
//                    if (!empty($payre)) {
//
//                        $archives = $dsql->SetQuery("UPDATE  `#@__pay_log` SET `ordertype` = 'awardlegou',  `uid` = $userid, `amount` = 0, `paytype` = '$paytype', `state` = 1, `pubdate` = $date  WHERE `ordernum` = '$ordernum' AND `ordertype` = 'awardlegou'");
//                        $dsql->dsqlOper($archives, "update");
//
//                    } else {
//
//                        $body     = serialize($param);
//                        $archives = $dsql->SetQuery("INSERT INTO `#@__pay_log` (`ordertype`, `ordernum`, `uid`, `body`, `amount`, `paytype`, `state`, `pubdate`) VALUES ('awardlegou', '$ordernum', '$userid', '$body', 0, '$paytype', 1, $date)");
//                        $dsql->dsqlOper($archives, "results");
//
//                    }

                    //执行支付成功的操作
                    $this->param = array(
                        "paytype"  => $paytype,
                        "ordernum" => $tordernum,
                    );
                    $this->paySuccess();
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "awardlegou",
                        "id"       => $oid
                    );
                    $url   = getUrlPath($param);
                    //支付成功后跳转页面
//                    global $cfg_payReturnType;
//                    global $cfg_payReturnUrlPc;
//                    global $cfg_payReturnUrlTouch;
//
//                    if ($cfg_payReturnType) {
//
//                        //移动端自定义跳转链接
//                        if (isMobile() && $cfg_payReturnUrlTouch) {
//                            $url = $cfg_payReturnUrlTouch;
//                        }
//
//                        //电脑端自定义跳转链接
//                        if (!isMobile() && $cfg_payReturnUrlPc) {
//                            $url = $cfg_payReturnUrlPc;
//                        }
//                    }

                    return $url;
//                    header("location:" . $url);
                }
            } else {
                if ($check) {
                    return array("state" => 200, "info" => "订单不存在或已支付");
                } else {
                    $param = array(
                        "service"  => "awardlegou",
                        "template" => "index"
                    );
                    $url   = getUrlPath($param);

                    return $url;
//                    header("location:" . $url);
//                    die();

                }

            }
        } else {
            if ($check) {
                return array("state" => 200, "info" => "订单不存在");
            } else {
                $param = array(
                    "service"  => "awardlegou",
                    "template" => "index"
                );
                $url   = getUrlPath($param);
                return $url;
//                header("location:" . $url);
//                die();
            }

        }




    }

    /**
     * Notes: 支付前验证帐户积分和余额
     * Ueser: Administrator
     * DateTime: 2021/1/14 14:44
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
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
        $payCheck = $this->payCheck();
        if ($payCheck != "ok") return array("state" => 200, "info" => $payCheck['info']);

        $ordernum   = $param['ordernum'];    //订单号
        $usePinput  = $param['usePinput'];   //是否使用积分
        $point      = $param['point'];       //使用的积分
        $useBalance = $param['useBalance'];  //是否使用余额
        $balance    = $param['balance'];     //使用的余额
        $paypwd     = $param['paypwd'];      //支付密码

        $logticpay  = (int)$param['paytuikuanlogtic'];//支付运费

        if ($userid == -1) return array("state" => 200, "info" => "登录超时，请登录后重试！");
        if (empty($ordernum)) return array("state" => 200, "info" => "提交失败，订单号不能为空！");
        // if(empty($point) && empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "$cfg_pointName或余额至少选择一项！");
        if (!empty($balance) && empty($paypwd)) return array("state" => 200, "info" => "请输入支付密码！");

        $totalPrice  = 0;
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //查询订单信息

            if($logticpay ==0){

                $archives = $dsql->SetQuery("SELECT `amount` FROM `#@__awardlegou_order` WHERE `ordernum` = '$value'");
            }else{

                $archives = $dsql->SetQuery("SELECT l.`tuikuanlogtic` amount  FROM `#@__awardlegou_order` o  LEFT  JOIN `#@__awardlegou_list` l ON  o.`proid` = l.`id` WHERE o.`ordernum` = '$value'");
            }
            $results  = $dsql->dsqlOper($archives, "results");
            $res      = $results[0];

            $orderprice = $res['amount'];
            $totalPrice += $orderprice;

        }

        //查询会员信息
        $userinfo  = $userLogin->getMemberInfo();
        $usermoney = $userinfo['money'];
        $userpoint = $userinfo['point'];

        $tit      = array();
        $useTotal = 0;

        //判断是否使用积分，并且验证剩余积分
        if ($usePinput == 1 && !empty($point)) {
            if ($userpoint < $point) return array("state" => 200, "info" => "您的可用" . $cfg_pointName . "不足，支付失败！");
            $useTotal += $point / $cfg_pointRatio;
            $tit[]    = $cfg_pointName;
        }
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
     * Notes: 支付成功
     * Ueser: Administrator
     * DateTime: 2021/1/14 16:31
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function paySuccess()
    {
        $param = $this->param;
        if (!empty($param)) {
            global $dsql;
            global  $userLogin;

            $paytype  = $param['paytype'];
            $ordernum = $param['ordernum'];
            $date     = GetMkTime(time());


            //查询订单信息
            $archives = $dsql->SetQuery("SELECT o.`ordernum`,o.`pinid`,o.`id`, o.`userid`, o.`proid`,o.`amount`,o.`procount`, o.`point`, o.`balance`, o.`payprice`, o.`paydate`,o.`pintype`,o.`fromShare`,o.`fromShare` ,o.`is_paytuikuanlogtic`,o.`tlogicpoint`,o.`tlogicbalance`,o.`tlogicpayprice`,o.`is_paytuikuanlogtic`,l.`usepoint`,l.`title`,l.`prize`, s.`title` shopname, l.`numbe`,l.`hongbaotype`,l.`prizetype`,l.`hongbao`,l.`numbe` pinpeople,l.`fanxianpoint`,l.`minhb`,l.`maxhb` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__business_list` s ON s.`id` = l.`sid` WHERE o.`tordenum` = '$ordernum' AND o.`is_paytuikuanlogtic` =0 AND o.`orderstate` = 9");
            $res      = $dsql->dsqlOper($archives, "results");

            $paytuikuanlogtic = 0;
            if($res){
                $paytuikuanlogtic = 1;
                $tordernum       = $ordernum;
                $ordernum        = $res[0]['ordernum'];
            }else{
                $archives = $dsql->SetQuery("SELECT  o.`pinid`,o.`id`, o.`userid`, o.`proid`,o.`amount`,o.`procount`, o.`point`, o.`balance`, o.`payprice`, o.`paydate`,o.`pintype`,o.`fromShare`,o.`fromShare` ,o.`is_paytuikuanlogtic`,o.`tlogicpoint`,o.`tlogicbalance`,o.`tlogicpayprice`,o.`is_paytuikuanlogtic`,l.`usepoint`,l.`title`,l.`prize`, s.`title` shopname, l.`numbe`,l.`hongbaotype`,l.`prizetype`,l.`hongbao`,l.`numbe` pinpeople,l.`fanxianpoint`,l.`minhb`,l.`maxhb` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__business_list` s ON s.`id` = l.`sid` WHERE o.`ordernum` = '$ordernum'");
                $res      = $dsql->dsqlOper($archives, "results");
            }


            /*  这里查询 tordenum 是因为  退款付邮费的时候没有重新生成新的订单 直接在原订单的基础上 进行付款等操作
                第三方支付的时候必须传ordernum 所以不能用户原先的ordernum  只能重新生成一个新的 存入该笔订单
                用 $paytuikuanlogtic 来判断是正常订单还是 退款付邮费的订单
            */
            if ($res) {
                $title        = $res[0]['title'];
                $orderid      = $res[0]['id'];
                $uid          = $res[0]['uid'];
                $userid       = $res[0]['userid'];
                $proid        = $res[0]['proid'];
                $procount     = (int)$res[0]['procount'];
                $upoint       = $res[0]['point'];
                $ubalance     = $res[0]['balance'];
                $payprice     = $res[0]['payprice'];
                $paydate      = $res[0]['paydate'];
                $pinid        = $res[0]['pinid'];
                $shopname     = $res[0]['shopname'];
                $pinpeople    = $res[0]['pinpeople'];
                $prize        = $res[0]['prize']; /*奖品*/
                $hongbaotype  = $res[0]['hongbaotype'];
                $prizetype    = $res[0]['prizetype'];
                $minhb        = $res[0]['minhb'];
                $maxhb        = $res[0]['maxhb'];
                $hongbao      = $res[0]['hongbao'];
                $amount       = $res[0]['amount'];
                $usepoint     = $res[0]['usepoint'];
                $fanxianpoint = $res[0]['fanxianpoint'];

                if($paytuikuanlogtic == 1){
                    $upoint       = $res[0]['tlogicpoint'];
                    $ubalance     = $res[0]['tlogicbalance'];
                    $payprice     = $res[0]['tlogicpayprice'];
                }

                $fromShare              = $res[0]['fromShare'];
                $is_paytuikuanlogtic    = $res[0]['is_paytuikuanlogtic'];

                //判断是否已经更新过状态，如果已经更新过则不进行下面的操作
                if ($paydate == 0 || $paytuikuanlogtic ==1) {

                    //更新订单状态
                    if($paytuikuanlogtic ==0){
                        $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 1, `paydate` = '$date', `paytype` = '$paytype' WHERE `ordernum` = '$ordernum'");
                    }else{
                        if($is_paytuikuanlogtic ==1) return ;
                        $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `is_paytuikuanlogtic` = 1  WHERE `tordenum` = '$tordernum'");
                    }

                    $dsql->dsqlOper($archives, "update");
        
                    //记录用户行为日志
                    memberLog($uid, 'awardlegou', 'order', $orderid, 'update', '支付订单('.$ordernum.' => '.$amount.'元)', '', $archives);

                    if($paytuikuanlogtic ==0) {
                        //更新已购买数量
                        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_list` SET `buynum` = `buynum` + $procount WHERE `id` = '$proid'");
                        $dsql->dsqlOper($sql, "update");

                        //拼团
                        if ($pinid) {
                            $pinSuc = false;
                            $sql    = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_pin` WHERE `id` = $pinid");
                            $pin    = $dsql->dsqlOper($sql, "results");
                            if ($pin) {
                                $pin    = $pin[0];
                                $user   = $pin['user'];
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

                                $userN    = $user . ',' . $userid;
                                $userNarr = explode(',', $userN);
                                $userNarr = array_unique($userNarr);
                                $userNarr = implode(',', $userNarr);
                                array_push($fields, "`user` = '" . $userNarr . "'");
                                $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_pin` SET " . join(",", $fields) . " WHERE `id` = $pinid");
                                $dsql->dsqlOper($sql, "update");
                            }
                        }

                    }
                    $totalPrice = $payprice;

                    //扣除会员积分
                    if (!empty($upoint) && $upoint > 0) {
                        global  $userLogin;
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` - '$upoint' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");

                        $info = '支付有奖乐购订单'.$ordernum;

                        if($paytuikuanlogtic ==1){
                            $info = '支付有奖乐购退款邮费'.$ordernum;
                        }
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($userpoint-$upoint);
                        //保存操作日志
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '0', '$upoint', '$info', '$date','xiaofei','$userpoint')");
                        $dsql->dsqlOper($archives, "update");
                    }

                    //扣除会员余额
                    if (!empty($ubalance) && $ubalance > 0) {
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$ubalance' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $totalPrice += $ubalance;
                    }

                    if($paytuikuanlogtic ==0){
                        //增加冻结金额
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` + '$totalPrice' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $modulename = getModuleTitle(array('name' => 'awardlegou'));
                    }

                    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $pid = '';
                    if ($ret) {
                        $pid = $ret[0]['id'];
                    }

                    $info = $modulename . "消费：" . $ordernum;
                    if($paytuikuanlogtic ==1){
                        $info = '支付有奖乐购退款邮费'.$ordernum;
                    }


                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "awardlegou",
                        "id"       => $orderid
                    );
                    $urlParam  = serialize($paramUser);
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
//                    $money = sprintf('%.2f',($usermoney-$totalPrice));
                    $title     = $modulename . '-' . $shopname;
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPrice', '$info', '$date','awardlegou','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                    $dsql->dsqlOper($archives, "update");


                    if (!empty($fromShare) && $paytuikuanlogtic ==0) {
                        global  $userLogin;
                        /*邀请送积分*/
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$fanxianpoint' WHERE `id` = '$fromShare'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($fromShare);
                        $userpoint = $user['point'];
//                        $pointuser  = (int)($userpoint+$fanxianpoint);
                        //保存操作日志
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$fromShare', '1', '$fanxianpoint', '有奖乐购分享所得：$ordernum', '" . GetMkTime(time()) . "','zengsong','$userpoint')");
                        $dsql->dsqlOper($archives, "update");
                    }
                    // 更新订单表中拼团状态
                    if ($pinid && $pinSuc && $paytuikuanlogtic ==0) {
                        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `pinstate` = '1' WHERE `pinid` = $pinid");
                        $dsql->dsqlOper($sql, "update");

                        /*发放奖励*/
                        global $cfg_pointRatio;
                        $pointmoney = $usepoint!=0 ? $usepoint/$cfg_pointRatio : 0;
                        $this->param = array(
                            'rawartype'   => $prizetype,
                            'totalmoney'  => strpos($hongbao, '%') ? str_replace('%', '', $hongbao) * ($amount - $pointmoney) / 100 : $hongbao,
                            'hongbaotype' => $hongbaotype,
                            'pinid'       => $pinid,
                            'prize'       => $prize,
                            'title'       => $title,
                            'minhb'       => $minhb,
                            'maxhb'       => $maxhb,
                            'goodstitle'  => $title,
                        );

                        require_once HUONIAOROOT."/api/payment/log.php";
                        $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
                        $_mailLog->DEBUG('发放奖励参数：'.serialize($this->param));
                        $this->rAwardMember();

                    }

                    if($paytuikuanlogtic ==0){
                        //支付成功，会员消息通知
                        $paramUser = array(
                            "service"  => "member",
                            "type"     => "user",
                            "template" => "orderdetail",
                            "action"   => "awardlegou",
                            "id"       => $orderid
                        );

                        $paramBusi = array(
                            "service"  => "member",
                            "template" => "orderdetail",
                            "action"   => "awardlegou",
                            "id"       => $orderid
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
                            "title"    => $title,
                            "order"    => $ordernum,
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
                    }else{
                        global $siteCityInfo;

                        //微信通知
                        $cityName = $siteCityInfo['name'];
                        $cityid   = $siteCityInfo['cityid'];

                        global $userLogin;
                        $userinfo = $userLogin->getMemberInfo($userid);

                        $modulename = getModuleTitle(array('name'=>'awardlegou'));
                        $param    = array(
                            'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                            'cityid' => $cityid,
                            'notify' => '管理员消息通知',
                            'fields' => array(
                                'contentrn' => $cityName . '分站——'.$modulename.'模块——用户:' . $userinfo['username'] . '已付退款邮费请尽快处理！订单号: ' . $ordernum,
                                'date'      => date("Y-m-d H:i:s", time()),
                            )
                        );
                        updateAdminNotice("tuan", "detail", $param);
                    }


                }

            }
        }
    }

    /**
     * Notes: 分配奖励
     * Ueser: Administrator
     * DateTime: 2021/1/13 18:42
     * Param1:$rawartype  0-物品,1-红包
     * Param2:$totalmoney 红包总金额
     * Param3:$hongbaotype红包分配模式 0-随机,1-平均
     * Param4:$pinid      团id
     * Param5:$prize      实物奖励
     * Param6:$title      乐购产品名称
     * Return:
     * @param $red_total_money 总金额
     * @param $red_num         数量
     * @return array
     */
    public function rAwardMember()
    {
        global $dsql;
        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $param       = $this->param;
                $rawartype   = (int)$param['rawartype'];
                $totalmoney  = (float)$param['totalmoney'];
                $hongbaotype = (int)$param['hongbaotype'];
                $pinid       = (int)$param['pinid'];
                $prize       = $param['prize'] != '' ? json_decode($param['prize'], true) : array();
                $title       = $param['title'];
                $minhb       = $param['minhb'];
                $maxhb       = $param['maxhb'];
            }
        }
        if ($pinid == '') return array("state" => 200, "info" => "参数有误");
        $sql  = $dsql->SetQuery("SELECT `id`,`people`,`user`,`oid` FROM `#@__awardlegou_pin` WHERE `id` = '$pinid' AND `state` = 3");
        $res  = $dsql->dsqlOper($sql, "results");
        $date = time();
        if ($res) {
            $userarr = explode(',', $res[0]['user']);
            /*随机一个获得主产品*/
            $userand = array_rand($userarr, 1);
            /*获得主产品不更新订单状态*/
            $ordersql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `is_wining` = 1,`orderstate` = 5 WHERE `pinid` = '$pinid' AND `userid` = '" . $userarr[$userand] . "'");
            $dsql->dsqlOper($ordersql, "update");

            /*用户名*/

            $usernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '".$userarr[$userand]."'");
            $usernameres = $dsql->dsqlOper($usernamesql,'results');

            $username = '';
            if($usernameres){
                $username = $usernameres[0]['username'] == '' ?  $usernameres[0]['nickname'] : $usernameres[0]['nickname'] ;
            }

            $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `pinid` = '$pinid' AND `userid` = '".$userarr[$userand]."' ");
            $orderres = $dsql->dsqlOper($ordersql, 'results');
            $orderid      = $orderres[0]['id'];
            $statestr = '';
            if ($rawartype == 1) {
                /*红包奖励*/
                if ($hongbaotype == 0) {
                    $min   = $minhb;
                    $max   = $maxhb;
                    $money = $totalmoney;
                    $num   = $res[0]['people'];
                    $data = array();
                    if($min * $num < $money && $max * $num >= $money ){

                        while ($num >= 1) {
                            $num--;
                            $kmix = max($min, $money - $num * $max);
                            $kmax = min($max, $money - $num * $min);
                            $kAvg = $money / ($num + 1);
                            //获取最大值和最小值的距离之间的最小值
                            $kDis = min($kAvg - $kmix, $kmax - $kAvg);
                            //获取0到1之间的随机数与距离最小值相乘得出浮动区间，这使得浮动区间不会超出范围
                            $r = ((float)(rand(1, 10000) / 10000) - 0.5) * $kDis * 2;
                            $k = round($kAvg + $r, 2);
                            $money -= $k;
                            $result_red[] = $k;
                        }
                    }

                }
                if ($userarr && count($userarr) == (int)$res[0]['people']) {
                    foreach ($userarr as $k => $v) {
                        if ($v != '') {
                            if ($userarr[$userand] != $v) {
                                $ordersql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 7 WHERE `pinid` = '$pinid' AND `userid` = '$v'");
                                $dsql->dsqlOper($ordersql, "update");
                            }
                            /*随机分配 平均分配*/
                            $hongbaomoney = $hongbaotype == 0 ? $result_red[$k] : $totalmoney / $res[0]['people'];
                            /*红包加钱*/
                            $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `rewardtype` = 1,`hongbaomoney` = '" . $hongbaomoney . "'  WHERE `pinid` = '$pinid' AND `userid` = '$v'");
                            $dsql->dsqlOper($archives, "update");
                        }

                    }
                }
                $rewardtype = 1;
            } else {
                /*实物奖励*/
                if ($userarr && count($userarr) == $res[0]['people']) {
                    foreach ($userarr as $k => $v) {
                        $swrand = array_rand($prize, 1);
                        $statestr = $rewardtitle = '';
                        if ($v != '') {
                            if ($userarr[$userand] != $v) {
                                $statestr = ' ,`orderstate` = 7';
                            }else{
                                $rewardtitle  = $prize[$swrand]['title'] ? $prize[$swrand]['title']  : '';
                            }
                            $info     = serialize($prize[$swrand]);
                            $ordersql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `rewardtype` = 0,`reward` = '$info' " . $statestr . " WHERE `pinid` = '$pinid' AND `userid` = '$v'");
                            $dsql->dsqlOper($ordersql, "update");

                            $archives = $dsql->SetQuery("INSERT INTO `#@__awardlegou_grantlog` (`tid`, `uid`, `awardtype`, `awardinfo`, `pubdate`) VALUES ('" . $pinid. "', '$v', '0', '" . $info . "', '$date')");
                            $dsql->dsqlOper($archives, "update");
                        }
                    }
                }
                $rewardtype = 0;

            }
            /*退款操作*/
            foreach ($userarr as $k => $v) {
                if ($v != '') {
                    if ($userarr[$userand] != $v) {
                        /*退款操作*/
                        $ordersql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `pinid` = '$pinid' AND `userid` = $v ");
                        //记录会员失败退款用户日志
                        require_once HUONIAOROOT."/api/payment/log.php";
                        $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
                        $_mailLog->DEBUG("退款：".$ordersql, true);
                        $orderres = $dsql->dsqlOper($ordersql, 'results');
                        if ($orderres) {
                            $this->param = $orderres[0]['id'];

                            $this->refundPay();
                        }


                    }
                }
            }
            $param     = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "awardlegou",
                "id"       => $orderid
            );

            if($rewardtype == 0){
                $note = '恭喜您中奖购得商品'.$title.'，同时您已获得随机奖品'.$rewardtitle.'，已发放至您的订单，点击进行查看~';
            }else{
                $note = '恭喜您中奖购得商品'.$title.'，同时您已获得随机红包'.$hongbaomoney.'，已发放至您的账户，点击领取~';

            }

            //自定义配置
            $config = array(
                "username" => $username,
                "order"    => $ordernum,
                "note"     => $note,
                "time"     => date("Y-m-d H:i:s", time()),
                "amount"   => $amount,
                "title"    => $title,
                "fields"   => array(
                    'keyword1' => '商品标题',
                    'keyword2' => '完成时间',
                    'keyword3' => '金额',
                    'keyword3' => '订单状态'
                )
            );

            updateMemberNotice($userarr[$userand], "有奖乐购-用户成交通知", $param, $config,'','',0,1);


            /*后台管理员通知*/
            $modulename = getModuleTitle(array('name' =>'awardlegou'));
            global $siteCityInfo;
            $cityName = $siteCityInfo['name'];
            $cityid   = (int)$siteCityInfo['cityid'];
            $param = array(
                'type'   => '', //区分佣金 给分站还是平台发送 1分站 2平台
                'cityid' => $cityid,
                'notify' => '管理员消息通知',
                'fields' =>array(
                    'contentrn'  => $cityName.'分站——'.$modulename.'模块有奖乐购订单活动完成——:'.$res[0]['oid'],
                    'date' => date("Y-m-d H:i:s", time()),
                )
            );
            updateAdminNotice("awardlegou", "detail",$param);

        }

    }

    /**
     * Notes: 买家确认收货
     * Ueser: Administrator
     * DateTime: 2021/1/15 9:29
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function receipt()
    {
        global $dsql;
        global $userLogin;
        global $siteCityInfo;

        $id = $this->param['id'];
        $caotuotype = (int)$this->param['caotuotype'];

        if (empty($id)) return array("state" => 200, "info" => '操作失败，参数传递错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if ($uid == -1) {
            return array("state" => 200, "info" => '登录超时，请重新登录！');
        }

        $whereuid = '';

        if($caotuotype == 0){
            $whereuid = ' AND  o.`userid` = '.$uid;
        }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`ordernum`, o.`procount`, o.`amount`, o.`balance`, o.`payprice`, o.`userid`,o.`point`,l.`title`,l.`usepoint`,s.`uid` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__business_list` s ON l.`sid` = s.`id` WHERE o.`id` = '$id' $whereuid AND o.`orderstate` = 6 ");
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            //更新订单状态
            $now = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = '3' WHERE `id` = " . $id);
            $dsql->dsqlOper($sql, "update");
        
            //记录用户行为日志
            memberLog($uid, 'awardlegou', 'order', $id, 'update', '确认收货('.$results[0]['ordernum'].')', '', $sql);

            //将订单费用转到卖家帐户
            $date        = GetMkTime(time());
            $ordernum    = $results[0]['ordernum'];   //订单号
            $procount    = $results[0]['procount'];   //数量
            $orderprice  = $results[0]['amount']; //单价
            $balance     = $results[0]['balance'];    //余额金额
            $payprice    = $results[0]['payprice'];   //支付金额
            $point       = $results[0]['point'];   //支付积分
            $userid      = $results[0]['userid'];     //买家ID
            $uid         = $results[0]['uid'];        //卖家ID
            $title       = $results[0]['title'];      //商品名称
            $usepoint       = $results[0]['usepoint'];      //商品名称
            $totalAmount = 0;
            //如果有使用余额和第三方支付，将买家冻结的金额移除并增加日志
            $totalPayPrice = $balance + $payprice;

            if ($totalPayPrice > 0) {

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
                    "action"   => "awardlegou",
                    "id"       => $id
                );
                $urlParam  = serialize($paramUser);
                $sql       = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                $ret       = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
                }
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                $money   =  sprintf('%.2f',($usermoney-$totalPayPrice));
                $title_ = '有奖乐购-' . $shopname;
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES ('$userid', '0', '$totalPayPrice', '有奖乐购消费：$ordernum', '$date','awardlegou','xiaofei','$pid','$urlParam','$title_','$ordernum','$money')");
                $dsql->dsqlOper($archives, "update");


            }


            //商家结算
//            $totalAmount  += $orderprice * $procount;
            $totalAmount  += $totalPayPrice;
            $freightMoney = 0;


            //扣除佣金
            global $cfg_awardlegouFee;
            global $cfg_fzawardlegouFee;
            $cfg_awardlegouFee   = (float)$cfg_awardlegouFee;
            $cfg_fzawardlegouFee = (float)$cfg_fzawardlegouFee;

            $fee = $totalAmount * $cfg_awardlegouFee / 100;
            $fee = floor($fee * 100) / 100; // 保留2位小数，不进行四舍五入，服务商分账时，不会四舍五入
            $fee = $fee < 0.01 ? 0 : $fee;

            $totalAmount_ = sprintf('%.2f', $totalAmount - $fee);

            //获取transaction_id
            $transaction_id = $paytype = '';
            $sql            = $dsql->SetQuery("SELECT `transaction_id`, `paytype`,`amount` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
            $ret            = $dsql->dsqlOper($sql, "results");
            $truepayprice   = 0;
            if ($ret) {
                $transaction_id = $ret[0]['transaction_id'];
                $paytype        = $ret[0]['paytype'];
                $truepayprice   = $ret[0]['amount'];
            }

            //分销信息
            global $cfg_fenxiaoState;
            global $cfg_fenxiaoSource;
            global $cfg_fenxiaoDeposit;
            global $cfg_fenxiaoAmount;
            include HUONIAOINC . "/config/awardlegou.inc.php";
            $fenXiao = (int)$customfenXiao;

            //分销金额
            $_fenxiaoAmount = $totalAmount;
            if ($cfg_fenxiaoState && $fenXiao) {

                //商家承担
                if ($cfg_fenxiaoSource) {
                    $_fenxiaoAmount = $totalAmount_;
                    $totalAmount_   = $totalAmount_ - ($totalAmount_ * $cfg_fenxiaoAmount / 100);

                    //平台承担
                } else {
                    $_fenxiaoAmount = $fee;
                }
            }

            $cityName = $siteCityInfo['name'];
            $cityid   = (int)$siteCityInfo['cityid'];

            $_fenxiaoAmount = $_fenxiaoAmount < 0.01 ? 0 : $_fenxiaoAmount;
            //分佣 开关
            $paramarr['amount'] = $_fenxiaoAmount;
            if ($fenXiao == 1) {
                $_fx_title = "有奖乐购消费：".$ordernum;
                (new member())->returnFxMoney("awardlegou", $userid, $_fx_title, $paramarr);
                //查询一共分销了多少佣金
                $fenxiaomoneysql = $dsql->SetQuery("SELECT SUM(`amount`) allfenxiao FROM `#@__member_fenxiao` WHERE `ordernum` = '$_fx_title' AND `module`= 'awardlegou'");
                $fenxiaomonyeres = $dsql->dsqlOper($fenxiaomoneysql,"results");
                if($cfg_fenxiaoSource){
                    $fx_less = ($_fenxiaoAmount - $totalAmount_)  - $fenxiaomonyeres[0]['allfenxiao'];
                    //如果系统没有开启资金沉淀才需要查询实际分销了多少
                    if(!$cfg_fenxiaoDeposit){
                        $totalAmount_     += $fx_less; //没沉淀，还给商家
                    }else{
                        $precipitateMoney = $fx_less;
                        if($precipitateMoney > 0){
                            (new member())->recodePrecipitationMoney($uid,$ordernum,$_fx_title,$precipitateMoney,$cityid,"awardlegou");
                        }
                    }
                }
            }
            $totalAmount_   = $totalAmount_ < 0.01 ? 0 : $totalAmount_;
            //分站佣金
            $fzFee = cityCommission($cityid,'awardlegou');
            //分站
            $fztotalAmount_ = $fee * $fzFee / 100;
            $fztotalAmount_ = $fztotalAmount_ < 0.01 ? 0 : $fztotalAmount_;

            $pttotalAmount_ = $totalAmount - $fztotalAmount_;



            $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
            $dsql->dsqlOper($fzarchives, "update");

            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$totalAmount_' WHERE `id` = '$uid'");
            $dsql->dsqlOper($archives, "update");
            $user  = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
//            $money = sprintf('%.2f',($usermoney+$totalAmount));
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalAmount', '有奖乐购收入，订单号：$ordernum', '$date','$cityid','','awardlegou','0','shangpinxiaoshou','$usermoney')");
            $dsql->dsqlOper($archives, "update");

            //保存操作日志
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`platform`,`ordertype`,`showtype`,`ctype`,`balance`) VALUES ('$uid', '1', '$totalAmount', '有奖乐购收入，订单号：$ordernum', '$date','$cityid','$fztotalAmount_','$pttotalAmount_','awardlegou','1','shangpinxiaoshou','$usermoney')");
            $lastid = $dsql->dsqlOper($archives, "lastid");
            substationAmount($lastid,$cityid);

            if($point!=0){
                global  $userLogin;
                /*商家积分收入*/
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $userpoint = $user['point'];
//                $pointuser  = (int)($userpoint+$point);
                //保存操作日志
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '有奖乐购订单所得：$ordernum', '" . GetMkTime(time()) . "','','$userpoint')");
                $dsql->dsqlOper($archives, "update");
            }
            //工行E商通银行分账
            if ($transaction_id) {
                if ($truepayprice <= 0) {
                    $truepayprice = $totalAmount_;
                }
                rfbpShareAllocation(array(
                    "uid"               => $uid,
                    "ordertitle"        => "有奖乐购收入",
                    "ordernum"          => $ordernum,
                    "orderdata"         => array(),
                    "totalAmount"       => $totalAmount,
                    "amount"            => $truepayprice,
                    "channelPayOrderNo" => $transaction_id,
                    "paytype"           => $paytype
                ));
            }


            //返积分
            (new member())->returnPoint("awardlegou", $userid, $totalPayPrice, $ordernum,$totalAmount,$uid);


            //商家会员消息通知
            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "awardlegou",
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
     * Notes: 失败订单退款
     * Ueser: Administrator
     * DateTime: 2021/1/15 9:56
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|mixed
     */
    public function refundPay()
    {
        global $dsql;
        global $userLogin;
        global $langData;
        $id  = $this->param;
        if(is_array($id)){
            $id = $id['id'];
        }
        if (empty($id)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！

        //获取用户ID
        // $uid = $userLogin->getMemberID();
        // if ($uid == -1) {
        //     return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        // }

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`balance`, o.`point`, o.`payprice`,o.`paytype`,o.`refrundno`,o.`rewardtype`,o.`hongbaomoney`,o.`reward`,o.`orderstate`,l.`title`,s.`title` shopname,s.`uid` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__business_list` s ON l.`sid` = s.`id` WHERE o.`id` = " . $id);
        //记录会员失败退款用户日志
        require_once HUONIAOROOT."/api/payment/log.php";
        $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
        $_mailLog->DEBUG($archives, true);
        $_mailLog->DEBUG('退款oid:'.$id);

        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {

            $orderid      = $results[0]['id'];         //需要退回的订单ID
            $ordernum     = $results[0]['ordernum'];   //需要退回的订单号
            $userid       = $results[0]['userid'];     //需要退回的会员ID
            $uid          = $results[0]['uid'];        //商家会员ID
            $balance      = $results[0]['balance'];    //余额支付
            $point        = $results[0]['point'];      //积分支付
            $payprice     = $results[0]['payprice'];   //实际支付
            $shopname     = $results[0]['shopname'];   //运费
            $goodtitle    = $results[0]['title'];   //运费
            $paytype      = $results[0]["paytype"];
            $orderstate   = $results[0]["orderstate"];
            $refrundno    = $results[0]["refrundno"];
            $rewardtype   = $results[0]["rewardtype"];
            $hongbaomoney = $results[0]["hongbaomoney"];
            $reward       = $results[0]["reward"];
            global $cfg_pointRatio;
            $orderTotalAmount = $balance + $payprice + $point / $cfg_pointRatio;
            $freezemoney      = $balance + $payprice;
            $totalPoint       = 0;
//
//             if($orderstate == 5) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！

            //混合支付退款
            $refrunddate = GetMkTime(time());
            require_once HUONIAOROOT."/api/payment/log.php";
            $_mailLog= new CLogFileHandler(HUONIAOROOT.'/log/member/'.date('Y-m-d').'.log', true);
            $_mailLog->DEBUG('退款金额&方式：'.$paytype."&".$payprice, true);
            $peerpay = 0;
            $arr = refund('awardlegou',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);      //退款
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'] ? $arr[0]['refrunddate'] : $refrunddate ;
            $refrundno   = $arr[0]['refrundno'];
            $refrundcode = $arr[0]['refrundcode'];
            //更新订单状态
            if ($r) {

                $pointinfo   = '有奖乐购订单退回：$ordernum';
                $balanceinfo = '有奖乐购订单退款：$ordernum';
                global $cfg_pointName;
                if ($point != 0) {
                    global  $userLogin;
                    $pointinfo = '有奖乐购退回：('.$cfg_pointName.'退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname . '-' . $goodtitle . '-' . $ordernum;
                    $archives  = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $userpoint = $user['point'];
//                    $pointuser = (int)($userpoint+$point);
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$pointinfo', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }
                if ($balance != '0') {
                    $pay_name = '';
                    $pay_namearr = array();
                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "awardlegou",
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
                        'point'                 => $totalPoint,
                        'refrunddate'           => $refrunddate,
                        'refrundno'             => $refrundno
                    );
                    $tuikuanparam = serialize($tuikuan);
                    $balanceinfo = '有奖乐购订单退款：('.$cfg_pointName.'退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname . '-' . $goodtitle . '-' . $ordernum;
                    $userOpera   = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $balance . " WHERE `id` = " . $userid);
                    $dsql->dsqlOper($userOpera, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
//                    $money = sprintf('%.2f',($usermoney+$balance));
                    //记录退款日志
                    $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (" . $userid . ", " . $balance . ", 1, '$balanceinfo', " . GetMkTime(time()) . ",'awardlegou','tuikuan','$urlParam','$ordernum','$tuikuanparam','有奖乐购消费','$usermoney')");
                    $dsql->dsqlOper($logs, "update");

                }
                /*商家扣除冻结金额*/
                $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezemoney WHERE `id` = " . $userid);
                $dsql->dsqlOper($usersql, "update");

                $now        = GetMkTime(time());
                $orderOpera = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 7, `ret-ok-date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$orderTotalAmount', `refrundno` = '$refrundno' WHERE `id` = " . $id);
                $dsql->dsqlOper($orderOpera, "update");
        
                //记录用户行为日志
                memberLog($uid, 'awardlegou', 'order', $orderid, 'update', '订单退款('.$ordernum.' => '.$orderTotalAmount.'元)', '', $orderOpera);

                //获取会员名
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                $param = array(
                    "service"  => "member",
                    "type" => "user",
                    "template" => "orderdetail",
                    "action"   => "awardlegou",
                    "id"       => $orderid
                );
                $rewardtype   = $results[0]["rewardtype"];
                $hongbaomoney = $results[0]["hongbaomoney"];
                $reward       = $results[0]["reward"] !='' ? unserialize($results[0]["reward"]) : array();
                $rewardtitle  = $reward ? $reward['title'] : '';

                if($rewardtype == 0){
                    $note = '很遗憾您未购得商品'.$goodtitle.'，费用已全额退回到您的账户，同时您已获得随机奖品'.$rewardtitle.'，已发放至您的订单，点击进行查看~';
                }else{
                    $note = '很遗憾您未购得商品'.$goodtitle.'，费用已全额退回到您的账户，同时您已获得随机红包'.$hongbaomoney.'，已发放至您的账户，点击领取~';

                }
                //自定义配置
                $config = array(
                    "username" => $username,
                    "order"    => $ordernum,
                    "amount"   => $orderTotalAmount,
                    "note"     => $note,
                    "fields"   => array(
                        'reason' => '退款原因',
                        'refund' => '退款金额'
                    )
                );

                updateMemberNotice($userid, "有奖乐购-失败退款通知", $param, $config, '', '', 0, 1);

                /*商家通知*/
                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "awardlegou",
                    "id"       => $orderid
                );

                $config = array(
                    "username" => $username,
                    "order" => $ordernum,
                    "amount" => $orderTotalAmount,
                    "info" => "活动完成该用户未获得购买权",
                    "fields" => array(
                        'reason' => '退款原因',
                        'refund' => '退款金额'
                    )
                );

                updateMemberNotice($uid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

                global $siteCityInfo;
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];

                $usernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '".$userid."'");
                $usernameres = $dsql->dsqlOper($usernamesql,'results');

                $username = '';
                if($usernameres){
                    $username = $usernameres[0]['username'] == '' ?  $usernameres[0]['nickname'] : $usernameres[0]['nickname'] ;
                }
                /*后台管理员通知*/
//                getModuleTitle()
//                $param = array(
//                    'type'     => '', //区分佣金 给分站还是平台发送 1分站 2平台
//                    'cityid' => $cityid,
//                    'notify' => '管理员消息通知',
//                    'fields' =>array(
//                        'contentrn'  => $cityName.'分站——awardlegou模块——用户:'.$username.' 未获得购买权限商品全额退款',
//                        'date' => date("Y-m-d H:i:s", time()),
//                    )
//                );
//                updateAdminNotice("awardlegou", "detail",$param);
                return 'ok';  //退款成功

            } else {
                return 'error';  //操作失败，请核实订单状态后再操作！
            }
        }

    }


    /**
     * Notes: 获取红包
     * Ueser: Administrator
     * DateTime: 2021/1/15 11:13
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function getHongbao()
    {
        global $userLogin;
        global $dsql;

        $uid = $userLogin->getMemberID();
        $oid = $this->param['id'];
        if ($uid < 1) return array("state" => 200, "info" => '登录超时，请重新登录后下单！');

        if ($oid == '') return array("state" => 200, "info" => '参数错误！');

        $sql = $dsql->SetQuery("SELECT l.`title`,o.`hongbaomoney`,o.`pinid`,o.`ordernum` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` WHERE `pinstate` = 1 AND `pinid`!=0 AND `is_receive` = 0 AND o.`id` = '$oid'");
        $res  = $dsql->dsqlOper($sql, "results");
        $date = time();
        if ($res) {
            $amount   = (float)$res[0]['hongbaomoney'];
            $ordernum = create_ordernum();

            $sql = $dsql->SetQuery("SELECT `realname`,`wechat_openid`, `wechat_mini_openid` FROM `#@__member` WHERE `id` = " . $uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                if($ret[0]['realname'] == '') return array("state" => 200, "info" => '请先实名认证！');

                $realname = $ret[0]['realname'];
                $wechat_openid = $ret[0]['wechat_openid'];
                $wechat_mini_openid = $ret[0]['wechat_mini_openid'];

                if(!$wechat_openid && !$wechat_mini_openid){
                    return array("state" => 200, "info" => '提现会员需要先绑定微信账号！');
                }

//                $amount_ = $cfg_withdrawFee ? $amount * (100 - $cfg_withdrawFee) / 100 : $amount;
                $amount_ = sprintf("%.2f", $amount);

                $order = array(
                    'ordernum' => $ordernum,
                    'openid' => $wechat_openid,
                    'wechat_mini_openid' => $wechat_mini_openid,
                    'name' => $realname,
                    'amount' => $amount_
                );

                require_once(HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php");
                $wxpayTransfers = new wxpayTransfers();
                $return = $wxpayTransfers->transfers($order);

                if($return['state'] != 100){

                    // 加载支付方式操作函数
                    loadPlug("payment");
                    $payment = get_payment("wxpay");
                    //如果网页支付配置的账号失败了，使用APP支付配置的账号重试
                    if($payment['APP_APPID']){
                        require_once(HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php");
                        $wxpayTransfers = new wxpayTransfers();
                        $return = $wxpayTransfers->transfers($order, true);

                        if($return['state'] != 100){
//                            return json_encode($return);
                            return $return;
                        }
                    }else{
                        return $return;
                    }

                }
                /*加钱*/
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '".$amount."' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                /*日志*/
                $title    = '乐购商品' . $res[0]['title'] . '活动达成获得红包奖励:';
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`balance`) VALUES ('$uid', '1', '" . $amount . "', '乐购有奖红包奖励', '$date','awardlegou','chongzhi','','$title','$usermoney')");
                $dsql->dsqlOper($archives, "update");

                /*减钱*/
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '".$amount_."' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
                /*微信零钱到账日志*/
                $title    = '乐购商品' . $res[0]['title'] . '红包奖励提现';
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`title`,`balance`) VALUES ('$uid', '0', '" . $amount_ . "', '乐购有奖红包奖励提现', '$date','awardlegou','tixian','','$title','$usermoney')");
                $dsql->dsqlOper($archives, "update");
            }


            $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `is_receive` = '1'  WHERE `id` = '$oid'");
            $dsql->dsqlOper($archives, "update");
            /*更新奖品发放日志*/
            $archives = $dsql->SetQuery("INSERT INTO `#@__awardlegou_grantlog` (`tid`, `uid`, `awardtype`, `awardinfo`, `pubdate`) VALUES ('" . $res[0]['pinid'] . "', '$uid', '1', '" . $res[0]['hongbaomoney'] . "', '$date')");
            $dsql->dsqlOper($archives, "update");
        
            //记录用户行为日志
            memberLog($uid, 'awardlegou', 'hongbao', $res[0]['pinid'], 'insert', '领取红包('.$res[0]['ordernum'].' => '.$res[0]['hongbaomoney'].'元)', '', $archives);

            return '领取成功';
        } else {
            return array("state" => 200, "info" => '领取失败！');
        }

    }

    /**
     * Notes: 统计
     * Ueser: Administrator
     * DateTime: 2021/1/18 9:27
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function statistics()
    {
        global $dsql;

        $shiwusql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_grantlog` WHERE `awardtype` = 0");
        $shiwures = $dsql->dsqlOper($shiwusql, "totalCount");

        $hongbaosql = $dsql->SetQuery("SELECT sum(`awardinfo`) hongbaocount FROM `#@__awardlegou_grantlog` WHERE `awardtype` = 1");
        $hongbaores = $dsql->dsqlOper($hongbaosql, "results");

        return array('shiwucount' => $shiwures, 'hongbaocount' => sprintf('%.2f',floatval($hongbaores[0]['hongbaocount'])));
    }


    /**
     * Notes: 有奖乐购分类
     * Ueser: Administrator
     * DateTime: 2021/1/18 15:58
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
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
        $results = $dsql->getTypeList($type, "awardlegou_type", $son, $page, $pageSize);
        if ($results) {
            return $results;
        }
    }

    /**
     * Notes: 支付前商品验证
     * Ueser: Administrator
     * DateTime: 2021/1/19 9:34
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|string
     */
    public function payCheck()
    {
        global $dsql;
        global $userLogin;
        global $cfg_pointName;
        $param    = $this->param;
        $ordernum = $param['ordernum'];

        $usePinput = (int)$param['usePinput'];
        $point                = $param['point'];
        $paytuikuanlogtic     = (int)$param['paytuikuanlogtic'];
        if (empty($ordernum)) return array("state" => 200, "info" => "订单号传递失败！");

        $userid      = $userLogin->getMemberID();
        $ordernumArr = explode(",", $ordernum);
        foreach ($ordernumArr as $key => $value) {

            //获取订单内容
            $archives    = $dsql->SetQuery("SELECT `proid`, `procount`, `amount`, `orderstate` FROM `#@__awardlegou_order` WHERE `ordernum` = '$value' AND `userid` = $userid");
            $orderDetail = $dsql->dsqlOper($archives, "results");
            if ($orderDetail) {

                $proid      = $orderDetail[0]['proid'];
                $procount   = $orderDetail[0]['procount'];
                $orderprice = $orderDetail[0]['amount'];
                $orderstate = $orderDetail[0]['orderstate'];

                //验证订单状态
                if ($orderstate != 0 && $paytuikuanlogtic == 0) {
                    $info = count($ordernumArr) > 1 ? "订单中包含状态异常的订单，请确认后重试！" : "订单状态异常，请确认后重试！";
                    return array("state" => 200, "info" => $info);
                }

                $this->param = $proid;
                $proDetail   = $this->proDetail();

                //验证是否为自己的店铺
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE `uid` = $userid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    if ($proDetail['sid'] == $ret[0]['id']) {
                        return array("state" => 200, "info" => "企业会员不得购买自己店铺的商品！");
                    }
                }

                //获取商品详细信息
                if($paytuikuanlogtic != 1) {

                    if (!$proDetail) {

                        $info = count($ordernumArr) > 1 ? "订单中包含不存在或已下架的商品，请确认后重试！" : "提交失败，您要购买的商品不存在或已下架！";
                        return array("state" => 200, "info" => $info);
//                    } else {
//                        if ($proDetail['usepoint'] != 0 && $usePinput == 0) {
//                            return array("state" => 200, "info" => "请选择" . $cfg_pointName . "！");
//                        } elseif ($point != $proDetail['usepoint'] && $proDetail['usepoint'] != 0) {
//                            return array("state" => 200, "info" => "使用" . $cfg_pointName . "与商品需要" . $cfg_pointName . "不匹配！");
//                        }

                    }
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
     * Notes: 商品下架
     * Ueser: Administrator
     * DateTime: 2021/1/21 17:53
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function offShelf(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list` WHERE `sid` = '".$userinfo['busiId']."' AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];

            if($results['sid'] == $userinfo['busiId']){

                $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_list` SET `state` = 2 WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'awardlegou', '', $id, 'update', '下架商品('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => $langData['siteConfig'][20][244]);  //操作成功
            }else{
                return array("state" => 101, "info" => $langData['shop'][4][39]);  //权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['shop'][4][35]);  //商品不存在，或已经删除！
        }

    }

    /**
     * Notes: 商品上架
     * Ueser: Administrator
     * DateTime: 2021/1/21 17:53
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array
     */
    public function upShelf(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid      = $userLogin->getMemberID();
        $userinfo = $userLogin->getMemberInfo();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_list` WHERE `sid` = '".$userinfo['busiId']."' AND `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];

            if($results['sid'] == $userinfo['busiId']){

                $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_list` SET `state` = 1 WHERE `id` = ".$id);
                $dsql->dsqlOper($archives, "update");
        
                //记录用户行为日志
                memberLog($uid, 'awardlegou', '', $id, 'update', '上架商品('.$results['title'].')', '', $archives);

                return array("state" => 100, "info" => $langData['siteConfig'][20][244]);  //操作成功
            }else{
                return array("state" => 101, "info" => $langData['shop'][4][39]);  //权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['shop'][4][35]);  //商品不存在，或已经删除！
        }

    }

    /**
     * Notes: 删除订单
     * Ueser: Administrator
     * DateTime: 2021/1/25 15:48
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|mixed
     */
    public function delOrder(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id = $this->param['id'];

        if(!is_numeric($id)) return array("state" => 200, "info" => '格式错误！');

        //获取用户ID
        $uid = $userLogin->getMemberID();
        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        $archives = $dsql->SetQuery("SELECT * FROM `#@__awardlegou_order` WHERE `id` = ".$id);
        $results  = $dsql->dsqlOper($archives, "results");
        if($results){
            $results = $results[0];
            if($results['userid'] == $uid){

                if($results['orderstate'] == 0){
                    $archives = $dsql->SetQuery("DELETE FROM `#@__awardlegou_order` WHERE `id` = ".$id);
                    $dsql->dsqlOper($archives, "update");
        
                    //记录用户行为日志
                    memberLog($uid, 'awardlegou', 'order', $id, 'delete', '删除订单('.$results['ordernum'].')', '', $archives);

                    if ($results['pintype'] ==1) {
                        $archives = $dsql->SetQuery("DELETE FROM `#@__awardlegou_pin` WHERE `id` = ".$results['pinid']);
                        $dsql->dsqlOper($archives, "update");

                    }else{
                        $userarr = $results['user']!='' ? explode(',', $results['user']) : array() ;

                        if(in_array($uid, $userarr)){

                            array_diff($userarr,$uid);
                            $archives = $dsql->SetQuery("UPDATE `#@__awardlegou_pin` SET `user` = '".join(',',$userarr)."' AND `people` =  `people` -1 WHERE `id` = ".$results['pinid']);
                            $dsql->dsqlOper($archives, "update");
                        }


                    }

                    return $langData['siteConfig'][20][444];  //删除成功！
                }else{
                    return array("state" => 101, "info" => $langData['shop'][4][38]);  //订单为不可删除状态！
                }

            }else{
                return array("state" => 101, "info" => $langData['shop'][4][39]);  //权限不足，请确认帐户信息后再进行操作！
            }
        }else{
            return array("state" => 101, "info" => $langData['shop'][4][40]);  //订单不存在，或已经删除！
        }

    }

    /**
     * Notes: 拼列表
     * Ueser: Administrator
     * DateTime: 2021/1/28 14:02
     * Param1:
     * Param2:
     * Param3:
     * Return:
     */
    public function pinList(){
        global $dsql;
        global $langData;

        $pageinfo = $list = array();
        $store    = $state = $userid = $page = $pageSize = $where = $where2 = "";

        if (!empty($this->param)) {
            if (!is_array($this->param)) {
                return array("state" => 200, "info" => '格式错误！');
            } else {
                $tid      = $this->param['tid'];
                $page     = $this->param['page'];
                $pageSize = $this->param['pageSize'];
            }
        }
        // if(empty($tid) && !is_numeric($tid))  return array("state" => 200, "info" => '格式错误！');

        if($tid!=''){
            $where .= " AND p.`tid` = '".$tid."'";
        }
        $list     = $storearr = array();
        $pageSize = empty($pageSize) ? 10 : $pageSize;
        $page     = empty($page) ? 1 : $page;

        //数据共享
        require(HUONIAOINC . "/config/awardlegou.inc.php");
        $dataShare = (int)$customDataShare;

        if (!$dataShare) {
            $cityid = getCityId($this->param['cityid']);
            if ($cityid) {
                $where2 .= " AND `cityid` = " . $cityid;
            }
        }

        $archives = $dsql->SetQuery("SELECT `id` FROM `#@__business_list` WHERE 1=1 " . $where2);
        $results  = $dsql->dsqlOper($archives, "results");
        if ($results) {
            foreach ($results as $key => $value) {
                $sidArr[$key] = $value['id'];
            }
            $where .= " AND l.`sid` in (" . join(",", $sidArr) . ")";
        } else {
            $where .= " AND 2 = 3";
        }

        if(!empty($customCanceltime)){

            $canceltime =  time() - (int)$customCanceltime * 3600;
            $where .= " AND p.`pubdate` >='$canceltime'";
        }
        $archives = $dsql->SetQuery("SELECT p.`id` pinid,p.`user`,p.`people`,p.`userid`,p.`pubdate`,l.`id` proid,l.`title`,l.`litpic`,l.`price`,l.`yprice`,l.`usepoint`,l.`prizetype`,l.`prize`,l.`numbe`,l.`hongbao` FROM `#@__awardlegou_pin`p LEFT  JOIN `#@__awardlegou_list` l ON p.`tid` = l.`id` WHERE 1=1 AND p.`state` = 1");
        //总条数
        $totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
        //总分页数
        $totalPage = ceil($totalCount / $pageSize);

        $pageinfo = array(
            "page"       => $page,
            "pageSize"   => $pageSize,
            "totalPage"  => $totalPage,
            "totalCount" => $totalCount
        );

        if ($totalCount == 0) return array("pageInfo" => $pageinfo, "list" => array());

        $atpage = $pageSize * ($page - 1);
        $where  .= " ORDER BY p.`id` DESC LIMIT $atpage, $pageSize";
        $results = $dsql->dsqlOper($archives . $where, "results");
        include HUONIAOINC . "/config/awardlegou.inc.php";
        $canceltime = (int)$customCanceltime;
        if ($results) {
            foreach ($results as $k => $v){
                $list[$k]['user']       = $v['user'];
                $list[$k]['pinid']      = $v['pinid'];
                $list[$k]['people']     = $v['people'];
                $list[$k]['title']      = $v['title'];
                $list[$k]['litpic']     = $v['litpic'];
                $list[$k]['litpicpath'] = $v['litpic']!='' ? getFilePath($v['litpic']) : '';
                $list[$k]['price']      = $v['price'];
                $list[$k]['yprice']     = $v['yprice'];
                $list[$k]['usepoint']   = floatval($v['usepoint']);
                $list[$k]['prizetype']  = $v['prizetype'];
                $list[$k]['prize']      = $v['prize'];
                $list[$k]['numbe']      = $v['numbe'];
                $list[$k]['hongbao']    = $v['hongbao'];

                $list[$k]['membernumbe'] = (int)$v['numbe'] - (int)$v['people'];

                $param = array(
                    "service"  => "awardlegou",
                    "template" => "confirm-order",
                    "param"    => "proid=".$v['proid']."&pinid=" . $v['pinid']."&fromShare=".$v['user']
                );

                $list[$k]['url']    = getUrlPath($param);

                $param = array(
                    "service"  => "awardlegou",
                    "template" => "detail",
                    "id"       => $v['proid'],
                    "param"    => "pinid=" . $v['pinid']."&fromShare=".$v['user']
                );

                $list[$k]['shareUrl']    = getUrlPath($param);

                $usernamesql = $dsql->SetQuery("SELECT `nickname`,`photo` FROM `#@__member` WHERE  `id` = '".$v['userid']."'");
                $usernameres = $dsql->dsqlOper($usernamesql,"results");

                $list[$k]['username']    = $usernameres[0]['nickname'] !='' ? $usernameres[0]['nickname'] : '';

                $list[$k]['photo']       = getFilePath($usernameres[0]['photo']);
                $pincanceltime = $v['pubdate'];
                if($canceltime !=0){
                    $pincanceltime += $canceltime*3600;
                }
                $list[$k]['pincanceltime']    = $pincanceltime;
            }

        }
        return array("pageInfo" => $pageinfo, "list" => $list);
    }

    /**
     * Notes: 用户申请退款
     * Ueser: Administrator
     * DateTime: 2021/4/7 14:10
     * Param1:
     * Param2:
     * Param3:
     * Return:
     * @return array|mixed
     */
    public function refund(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id      = $this->param['id'];
        $type    = $this->param['rettype'];
        $pics    = $this->param['retpics'];
        $content = $this->param['retnote'];

        if(empty($id)) return array("state" => 200, "info" => $langData['shop'][4][20]);  //数据不完整，请检查！
        if(empty($type)) return array("state" => 200, "info" => $langData['shop'][4][21]);  //请选择退款原因！
        if(empty($content)) return array("state" => 200, "info" => $langData['shop'][4][22]);  //请输入退款说明！

        //获取用户ID
        $uid = $userLogin->getMemberID();
        $userInfo = $userLogin->getMemberInfo();

        $mnoawardlegoutime = $userInfo['noawardlegoutime'];
        $is_noawardlegou  = $userInfo['is_noawardlegou'];

        if($uid == -1){
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        if(!$is_noawardlegou && $mnoawardlegoutime) return array("state" => 200, "info" => '已被锁号一周！解封时间：'.date("Y-m-d",time()));
        if($is_noawardlegou) return array("state" => 200, "info" => '已被拉黑暂时没有权限！');  //登录超时，请重新登录！
        $type    = filterSensitiveWords(addslashes($type));
        $content = filterSensitiveWords(addslashes($content));
        $type    = cn_substrR($type, 20);
        $content = cn_substrR($content, 500);

        //验证订单
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`,o.`orderstate`,o.`amount`,s.`uid` FROM `#@__awardlegou_order` o LEFT JOIN `#@__business_list` s ON s.`id` = o.`store` WHERE o.`id` = '$id' AND o.`userid` = '$uid' AND (o.`orderstate` = 5 OR o.`orderstate` = 6 ) AND o.`ret-state` = 0");
        $results  = $dsql->dsqlOper($archives, "results");
        if($results && is_array($results)){

            $userid   = $results[0]['uid'];  //卖家会员ID
            $ordernum = $results[0]['ordernum'];  //订单号

            $state    = $results[0]['orderstate'];

            global $customWtuikuannum;
            global $customYtuikuannum;

            $refrundtype = 0;
            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__awardlegou_order` WHERE `userid` = '$uid'");
            if($state == 5){
                $ordercount = $dsql->dsqlOper($sql." AND `refrundtype` = 1","totalCount");
                $tuikuannum =  $customWtuikuannum;

                $refrundtype = 1;
            }else{

                $ordercount = $dsql->dsqlOper($sql." AND `refrundtype` = 2","totalCount");

                $tuikuannum =  $customYtuikuannum;

                $refrundtype = 2;
            }

            $noawardlegoutime = strtotime('+1 week');

            $sql = '';
            if(($ordercount+1 >= $tuikuannum) && (!$mnoawardlegoutime || time()>$noawardlegoutime) && !$is_noawardlegou){

                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `noawardlegoutime` = '$noawardlegoutime' WHERE `id` = '$uid'");

            }

//            已被锁号一周,直接拉黑
            if(($ordercount+1 >= $tuikuannum) && $mnoawardlegoutime  && !$is_noawardlegou){
                $sql = $dsql->SetQuery("UPDATE `#@__member` SET `is_noawardlegou` = 1 WHERE `id` = '$uid'");
            }

            if($sql!=''){
                $dsql->dsqlOper($sql, "update");
            }
            // 查询订单商品
            $orderprice = $results[0]['amount'];

            $paramBusi = array(
                "service"  => "member",
                "template" => "orderdetail",
                "action"   => "shop",
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
                "amount" => $orderprice,
                "info" => $content,
                "fields" => array(
                    'reason' => '退款原因',
                    'refund' => '退款金额'
                )
            );

            updateMemberNotice($userid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);


            $date       = GetMkTime(time());
            $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `refrundtype` = '$refrundtype',`ret-state` = 1, `ret-type` = '$type', `ret-note` = '$content', `ret-pics` = '$pics', `ret-date` = '$date' WHERE `id` = ".$id);
            $dsql->dsqlOper($sql, "update");
        
            //记录用户行为日志
            memberLog($uid, 'awardlegou', 'order', $id, 'update', '申请退款('.$ordernum.')', '', $sql);

            return $langData['siteConfig'][20][244];  //操作成功

        }else{
            return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
        }
    }

    public function awardlegouAgree(){
        global $dsql;
        global $userLogin;
        global $langData;

        $id =  $this->param['id'];
        if($id == "") return array("state" => 200, "info" => '格式错误！');

        $userid     = $userLogin->getMemberID();
        $memberInfo = $userLogin->getMemberInfo();
        if ($userid == -1) {
            return array("state" => 200, "info" => $langData['siteConfig'][20][262]);  //登录超时，请重新登录！
        }

        if (!verifyModuleAuth(array("module" => "awardlegou"))) {
            return array("state" => 200, "info" => $langData['shop'][4][1]);  //商家权限验证失败！
        }

        $sql = $dsql->SetQuery("SELECT `ordernum` FROM `#@__awardlegou_order` WHERE `id` = $id");
        $results = $dsql->dsqlOper($sql, "results");

        $time = time();
        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 9,`tongyidate` = '$time' WHERE `id` = " . $id);
        $ret = $dsql->dsqlOper($sql, "update");

        if($ret != 'ok'){
            return array("state" => 200, "info" => $langData['shop'][4][23]);  //操作失败，请核实订单状态后再操作！
        }else{
        
            //记录用户行为日志
            memberLog($userid, 'awardlegou', 'order', $id, 'update', '同意退货('.$results[0]['ordernum'].')', '', $sql);

            return $langData['siteConfig'][20][244];  //操作成功
        }
        die;
    }

//    public function test(){
//        die;
//        global $dsql;
//        $userarr = explode(',','188,187,186,183,182,180,179,178,177');
//        $userand = 0;
//        $pinid   = 86;
//        foreach ($userarr as $k => $v) {
//            $this->param = $v;
//            $this->refundPay();
//
//        }
//    }

}
